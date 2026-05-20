import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'product-gate-sample-plan.json')
const outputTsPath = path.join(root, 'src', 'data', 'productGateSamplePlan.ts')
const reportPath = path.join(root, 'reports', 'product-gate-sample-plan-latest.md')
const gateSamplePagePath = path.join(root, 'public', 'gate-sample.html')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const localIsoDate = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
const todaySlug = () => localIsoDate().replaceAll('-', '')
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')
const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
const runtimeHref = (value) => {
  if (!value) {
    return './'
  }

  return value.startsWith('/') ? `.${value}` : value
}

const routeFor = ({ gameId, gateId }) => {
  const campaignId = `gate-sample-${todaySlug()}-${gateId}`
  return {
    campaignId,
    playPath: `/?game=${encodeURIComponent(gameId)}&utm_source=gate_sample&utm_campaign=${encodeURIComponent(campaignId)}`,
  }
}

const [
  productGateRecovery,
  productOptimization,
  analytics,
  trafficSeeding,
  organicSeedLoop,
  retentionLoop,
  completionLoop,
  replayLoop,
  localEventBridge,
  unitEconomics,
] = await Promise.all([
  readJson(path.join(dataDir, 'product-gate-recovery.json')),
  readJson(path.join(dataDir, 'product-optimization.json')),
  readJson(path.join(dataDir, 'analytics-rollup.json')),
  readJson(path.join(dataDir, 'traffic-seeding.json')),
  readJson(path.join(dataDir, 'organic-seed-loop.json')),
  readJson(path.join(dataDir, 'retention-loop.json')),
  readJson(path.join(dataDir, 'completion-loop.json')),
  readJson(path.join(dataDir, 'replay-loop.json')),
  readJson(path.join(dataDir, 'local-event-bridge.json')),
  readOptionalJson(path.join(dataDir, 'unit-economics.json'), {
    controls: { maxDailySpendUsd: 0, paidAcquisitionAllowed: false },
  }),
])

const trafficCampaignByGame = new Map((trafficSeeding.campaigns ?? []).map((campaign) => [campaign.gameId, campaign]))
const gateById = new Map((productGateRecovery.gates ?? []).map((gate) => [gate.id, gate]))
const priorityByGateId = new Map((productGateRecovery.priorities ?? []).map((priority) => [priority.gateId, priority]))
const primaryCandidate = productOptimization.candidates?.[0]

const gameTargetForGate = (gate) => {
  if (gate.id === 'd1Retention') {
    return {
      gameId: retentionLoop.dailyChallenge?.gameId ?? organicSeedLoop.target?.gameId ?? primaryCandidate?.gameId ?? 'harbor-rings',
      title: retentionLoop.dailyChallenge?.title ?? organicSeedLoop.target?.title ?? primaryCandidate?.title ?? 'Daily challenge',
      surface: retentionLoop.returnIntentPolicy?.surface ?? gate.runtimeSurface,
    }
  }

  if (gate.id === 'replayRate') {
    return {
      gameId: replayLoop.target?.gameId ?? primaryCandidate?.gameId ?? 'harbor-rings',
      title: replayLoop.target?.title ?? primaryCandidate?.title ?? 'Replay target',
      surface: replayLoop.promptPolicy?.surface ?? gate.runtimeSurface,
    }
  }

  return {
    gameId: completionLoop.target?.gameId ?? firstCandidateGameId(),
    title: completionLoop.target?.title ?? primaryCandidate?.title ?? 'Completion target',
    surface: completionLoop.promptPolicy?.surface ?? gate.runtimeSurface,
  }
}

const firstCandidateGameId = () => primaryCandidate?.gameId ?? 'harbor-rings'

const missionForGate = (gate, index) => {
  const target = gameTargetForGate(gate)
  const trafficCampaign = trafficCampaignByGame.get(target.gameId)
  const route = routeFor({ gameId: target.gameId, gateId: gate.id })
  const priority = priorityByGateId.get(gate.id)
  const collectionEvents = [
    ...(gate.viewTelemetry ?? []),
    ...(gate.actionTelemetry ?? []),
    ...(gate.successTelemetry ?? []),
  ]
  const status = gate.pass
    ? 'gate-passing'
    : gate.sampleReady
      ? 'ready-for-recovery-decision'
      : 'collecting-sample'

  return {
    id: `collect-${gate.id}-sample`,
    rank: priority?.rank ?? index + 1,
    gateId: gate.id,
    label: gate.label,
    status,
    ownerLoop: gate.ownerLoop,
    actionId: gate.actionId,
    gameId: target.gameId,
    title: target.title,
    surface: target.surface,
    campaignId: route.campaignId,
    playPath: route.playPath,
    organicSeedCampaignId: trafficCampaign?.id ?? null,
    current: {
      actual: gate.actual,
      gate: gate.gate,
      denominator: gate.denominator,
      successes: gate.successes,
      promptViews: gate.currentPromptViews,
      promptActions: gate.currentPromptActions,
      actionRate: gate.actionRate,
    },
    needed: {
      promptViews: gate.promptViewsNeeded,
      successes: gate.neededSuccesses,
      minimumPromptViewsForDecision: gate.minimumPromptViewsForDecision,
    },
    telemetry: {
      view: gate.viewTelemetry ?? [],
      action: gate.actionTelemetry ?? [],
      success: gate.successTelemetry ?? [],
      failure: gate.failureTelemetry ?? [],
      collectionEvents,
    },
    refreshCommands: [
      gate.actionId === 'refresh-completion-loop'
        ? 'npm run autonomous:completion-loop'
        : gate.actionId === 'refresh-replay-loop'
          ? 'npm run autonomous:replay-loop'
          : 'npm run autonomous:retention',
      'npm run autonomous:local-event-bridge',
      'npm run autonomous:import-events',
      'npm run autonomous:analytics',
      'npm run autonomous:gate-recovery',
    ],
    controls: {
      costUsd: 0,
      noPaidTraffic: true,
      playerInitiatedOnly: true,
      noSyntheticEvents: true,
      noRuleChange: true,
      noRevenueEnablement: true,
    },
  }
}

const failingGates = (productGateRecovery.gates ?? []).filter((gate) => !gate.pass)
const missions = failingGates.map(missionForGate).sort((a, b) => a.rank - b.rank)
const primaryMission = missions.find((mission) => mission.gateId === productGateRecovery.summary?.primaryBottleneck) ?? missions[0] ?? null
const fastestMission = missions.find((mission) => mission.gateId === productGateRecovery.summary?.quickestGateTest) ?? missions.at(-1) ?? null
const totalPromptViewsNeeded = missions.reduce((sum, mission) => sum + mission.needed.promptViews, 0)
const totalObservedSuccessesNeeded = missions.reduce((sum, mission) => sum + mission.needed.successes, 0)
const sampleReadyCount = missions.filter((mission) => mission.status === 'ready-for-recovery-decision').length
const localEventsAvailable = localEventBridge.imported?.localEventsAvailable === true
const importedGateSampleEvents = localEventBridge.gateSampleEvidence?.imported?.events ?? 0
const inboxGateSampleEvents = localEventBridge.gateSampleEvidence?.inbox?.events ?? 0
const downloadsScanPolicy = localEventBridge.explicitDownloadsScanPolicy ?? {
  explicitOptInRequired: true,
  cooldownHours: 4,
  coolingDown: false,
  evidenceReadyNow: importedGateSampleEvents > 0 || inboxGateSampleEvents > 0,
  lastScanAt: localEventBridge.explicitDownloadsScan?.scannedAt ?? null,
  lastScanStatus: localEventBridge.explicitDownloadsScan?.status ?? null,
  scanAgeHours: null,
  cooldownRemainingHours: 0,
  nextRecommendedScanAt: new Date().toISOString(),
}
const gateSampleCampaigns = [
  ...(localEventBridge.gateSampleEvidence?.imported?.campaigns ?? []).map((campaign) => ({
    ...campaign,
    source: 'imported',
  })),
  ...(localEventBridge.gateSampleEvidence?.inbox?.campaigns ?? []).map((campaign) => ({
    ...campaign,
    source: 'inbox',
  })),
]
const gateSampleCampaignById = new Map(gateSampleCampaigns.map((campaign) => [campaign.campaignId, campaign]))

const evidenceForMission = (mission) => {
  const evidence = gateSampleCampaignById.get(mission.campaignId)

  if (!evidence) {
    return {
      status: 'waiting-for-player-export',
      source: null,
      events: 0,
      successEvents: 0,
      analyticsExports: 0,
      latestAt: null,
    }
  }

  return {
    status: evidence.source === 'imported' ? 'imported-sample-active' : 'inbox-ready-for-ingest',
    source: evidence.source,
    events: evidence.events,
    successEvents: evidence.successEvents,
    analyticsExports: evidence.analyticsExports,
    latestAt: evidence.latestAt,
  }
}

const sampleRoleForMission = (mission) => {
  const roles = [
    mission.gateId === primaryMission?.gateId ? 'primary-bottleneck' : null,
    mission.gateId === fastestMission?.gateId ? 'fastest-validation' : null,
  ].filter(Boolean)

  return roles.length ? roles.join(' ') : 'supporting-sample'
}

const missionsWithEvidence = missions.map((mission) => ({
  ...mission,
  sampleRole: sampleRoleForMission(mission),
  evidence: evidenceForMission(mission),
}))
const evidenceReadyCount = missionsWithEvidence.filter(
  (mission) => mission.evidence.status === 'imported-sample-active',
).length
const inboxReadyCount = missionsWithEvidence.filter(
  (mission) => mission.evidence.status === 'inbox-ready-for-ingest',
).length
const collectSampleDownloadsCommand = 'npm run autonomous:collect-sample-downloads'
const sampleCollectionNextAction = localEventsAvailable
  ? 'Use imported local event drops before the next recovery decision.'
  : inboxGateSampleEvents
    ? `Import the gate-sample event drop already waiting in the local inbox with ${collectSampleDownloadsCommand}.`
    : downloadsScanPolicy.coolingDown
      ? `Wait until ${downloadsScanPolicy.nextRecommendedScanAt} before the next explicit Downloads scan unless an inbox event drop appears.`
      : `Export or collect real browser events, then run ${collectSampleDownloadsCommand} before changing copy, placement, revenue, or rules.`

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'product-gate-sample-plan-ready',
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    retentionSource: analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? 'unknown',
    productGateRecovery: productGateRecovery.status,
    localEventBridge: localEventBridge.status,
    organicSeedLoop: organicSeedLoop.status,
    trafficSeeding: trafficSeeding.status,
  },
  summary: {
    failingGates: failingGates.length,
    missions: missions.length,
    primaryGateId: primaryMission?.gateId ?? null,
    fastestGateId: fastestMission?.gateId ?? null,
    totalPromptViewsNeeded,
    totalObservedSuccessesNeeded,
    sampleReadyCount,
    localEventsAvailable,
    importedGateSampleEvents,
    inboxGateSampleEvents,
    evidenceReadyCount,
    inboxReadyCount,
    downloadsScanStatus: downloadsScanPolicy.lastScanStatus ?? 'not-scanned',
    downloadsScanCoolingDown: downloadsScanPolicy.coolingDown,
    downloadsScanNextRecommendedAt: downloadsScanPolicy.nextRecommendedScanAt,
    nextOwnerAction: missions.length ? 'collect-gate-sample-downloads' : 'refresh-product-gate-sample-plan',
  },
  downloadsScan: downloadsScanPolicy,
  publicSamplePage: {
    path: '/gate-sample.html',
    file: 'public/gate-sample.html',
    missionCount: missionsWithEvidence.length,
    primaryCampaignId: primaryMission?.campaignId ?? null,
    fastestCampaignId: fastestMission?.campaignId ?? null,
    zeroPaidSpend: true,
    playerInitiatedOnly: true,
    noSyntheticEvents: true,
  },
  missions: missionsWithEvidence,
  commandPlan: {
    refreshPlan: 'npm run autonomous:sample-plan',
    collectAndRefresh:
      'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan',
    collectDownloadsAndRefresh: collectSampleDownloadsCommand,
    primaryLoopRefresh: primaryMission?.refreshCommands?.[0] ?? null,
  },
  controls: {
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    noPaidTraffic: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    noSyntheticGatePasses: true,
    noAutomaticRuleChanges: true,
    noRevenueEnablement: true,
    noStoreSubmission: true,
    playerInitiatedOnly: true,
    localEventBridgeRequired: true,
    realEventDropsOnly: true,
    downloadsImportRequiresExplicitOptIn: true,
    downloadsScanBackoffRequired: true,
    requireObservedTelemetryBeforeRecoveryChange: true,
  },
  nextActions: [
    primaryMission
      ? `${primaryMission.label} needs ${primaryMission.needed.promptViews} more prompt exposure(s) and ${primaryMission.needed.successes} observed success(es); feature ${primaryMission.title} via ${primaryMission.playPath}.`
      : 'No failing product gates need sample collection.',
    fastestMission && fastestMission.gateId !== primaryMission?.gateId
      ? `${fastestMission.label} is the fastest gate sample: ${fastestMission.needed.promptViews} prompt exposure(s), ${fastestMission.needed.successes} observed success(es).`
      : 'Keep the primary gate sample mission active until the recovery decision is sample-ready.',
    sampleCollectionNextAction,
  ],
}

const report = [
  '# Product Gate Sample Plan',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Primary gate: ${payload.summary.primaryGateId ?? 'none'}`,
  `Prompt views needed: ${payload.summary.totalPromptViewsNeeded}`,
  `Observed successes needed: ${payload.summary.totalObservedSuccessesNeeded}`,
  `Imported gate-sample events: ${payload.summary.importedGateSampleEvents}`,
  `Inbox gate-sample events: ${payload.summary.inboxGateSampleEvents}`,
  `Downloads scan: ${payload.summary.downloadsScanStatus}; cooling down ${payload.summary.downloadsScanCoolingDown}`,
  `Next recommended Downloads scan: ${payload.summary.downloadsScanNextRecommendedAt}`,
  `Public sample page: ${payload.publicSamplePage.path}`,
  '',
  '## Missions',
  '',
  ...payload.missions.map(
    (mission) =>
      `- #${mission.rank} ${mission.gateId}: ${mission.status}; evidence ${mission.evidence.status}; ${pct(mission.current.actual)} / ${pct(mission.current.gate)}; needs ${mission.needed.promptViews} prompt view(s), ${mission.needed.successes} success(es); ${mission.playPath}`,
  ),
  '',
  '## Commands',
  '',
  `- Refresh plan: ${payload.commandPlan.refreshPlan}`,
  `- Collect and refresh: ${payload.commandPlan.collectAndRefresh}`,
  `- Collect downloads and refresh: ${payload.commandPlan.collectDownloadsAndRefresh}`,
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
].join('\n')

const sampleRoleLabel = (mission) => {
  if (mission.sampleRole.includes('primary-bottleneck') && mission.sampleRole.includes('fastest-validation')) {
    return 'Primary + fastest'
  }

  if (mission.sampleRole.includes('fastest-validation')) {
    return 'Fastest validation'
  }

  if (mission.sampleRole.includes('primary-bottleneck')) {
    return 'Primary bottleneck'
  }

  return 'Supporting sample'
}

const missionCards = payload.missions
  .map(
    (mission) => `<article class="mission" data-mission-id="${escapeHtml(mission.id)}" data-gate-id="${escapeHtml(
      mission.gateId,
    )}" data-campaign-id="${escapeHtml(mission.campaignId)}" data-sample-role="${escapeHtml(mission.sampleRole)}">
        <div>
          <p class="eyebrow">${escapeHtml(mission.label)}</p>
          <span class="badge">${escapeHtml(sampleRoleLabel(mission))}</span>
          <h2>${escapeHtml(mission.title)}</h2>
          <p>${escapeHtml(mission.ownerLoop)} needs real player evidence before the automation changes copy, placement, rules, revenue, or store distribution.</p>
        </div>
        <dl>
          <div><dt>Campaign</dt><dd>${escapeHtml(mission.campaignId)}</dd></div>
          <div><dt>Prompt views</dt><dd>${mission.needed.promptViews}</dd></div>
          <div><dt>Observed successes</dt><dd>${mission.needed.successes}</dd></div>
          <div><dt>Evidence</dt><dd>${escapeHtml(mission.evidence.status)}</dd></div>
        </dl>
        <a class="play" href="${escapeHtml(runtimeHref(mission.playPath))}">Start mission</a>
      </article>`,
  )
  .join('\n')

const gateSamplePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Autonomous Game Lab Gate Sample Missions</title>
    <style>
      :root {
        color: #17211f;
        background: #f5f7f6;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      header,
      main {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
      }

      header {
        padding: 42px 0 22px;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        max-width: 760px;
        font-size: clamp(2rem, 5vw, 4.5rem);
        line-height: 0.95;
        letter-spacing: 0;
      }

      h2 {
        font-size: 1.25rem;
        letter-spacing: 0;
      }

      p {
        color: #4a5753;
        line-height: 1.55;
      }

      header p:not(.eyebrow) {
        max-width: 700px;
        margin-top: 16px;
        font-size: 1.05rem;
      }

      .eyebrow {
        margin-bottom: 10px;
        color: #0f766e;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
        padding: 18px 0 26px;
      }

      .metric,
      .mission,
      .handoff {
        border: 1px solid #cbd8d4;
        border-radius: 8px;
        background: #ffffff;
      }

      .metric {
        padding: 16px;
      }

      .metric span,
      dt {
        display: block;
        color: #68726f;
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      .metric strong,
      dd {
        display: block;
        margin: 4px 0 0;
        font-size: 1.1rem;
      }

      .badge {
        display: inline-flex;
        width: fit-content;
        margin-bottom: 10px;
        padding: 5px 8px;
        border-radius: 6px;
        background: #edf4f2;
        color: #17211f;
        font-size: 0.75rem;
        font-weight: 800;
      }

      .missions {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .mission {
        display: grid;
        gap: 18px;
        padding: 18px;
      }

      .mission:nth-child(1) {
        border-top: 4px solid #0f766e;
      }

      .mission:nth-child(2) {
        border-top: 4px solid #bd4d38;
      }

      .mission:nth-child(3) {
        border-top: 4px solid #b87b16;
      }

      dl {
        display: grid;
        gap: 10px;
        margin: 0;
      }

      .play {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 16px;
        border-radius: 7px;
        background: #0f766e;
        color: #fff;
        font-weight: 800;
        text-decoration: none;
      }

      .handoff {
        margin: 18px 0 42px;
        padding: 18px;
      }

      .handoff h2 {
        margin-bottom: 8px;
      }

      @media (max-width: 860px) {
        .summary,
        .missions {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <p class="eyebrow">Zero spend product evidence</p>
      <h1>Autonomous Game Lab Gate Sample Missions</h1>
      <p>Player-initiated missions collect real completion, replay, and return-intent telemetry before the owner loop changes product copy or unlocks revenue.</p>
    </header>
    <main>
      <section class="summary" aria-label="Sample requirements">
        <div class="metric"><span>Primary gate</span><strong>${escapeHtml(payload.summary.primaryGateId ?? 'none')}</strong></div>
        <div class="metric"><span>Fastest gate</span><strong>${escapeHtml(payload.summary.fastestGateId ?? 'none')}</strong></div>
        <div class="metric"><span>Prompt views needed</span><strong>${payload.summary.totalPromptViewsNeeded}</strong></div>
        <div class="metric"><span>Observed successes</span><strong>${payload.summary.totalObservedSuccessesNeeded}</strong></div>
        <div class="metric"><span>Cost</span><strong>$0.00</strong></div>
      </section>
      <section class="missions" aria-label="Gate sample missions">
        ${missionCards}
      </section>
      <section class="handoff" aria-label="Evidence handoff">
        <h2>Evidence handoff</h2>
        <p>The app buffers anonymous gameplay events locally, forwards them when a production collector exists, and keeps revenue disabled until observed samples clear every product gate.</p>
      </section>
    </main>
  </body>
</html>
`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(gateSamplePagePath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productGateSamplePlan = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductGateSamplePlan = typeof productGateSamplePlan\n`,
)
await writeFile(reportPath, report)
await writeFile(gateSamplePagePath, gateSamplePage)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, gateSamplePagePath)}`)
