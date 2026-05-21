import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildExplicitDownloadsScanPolicy, stableDownloadsScanPolicySource } from './lib/downloads-scan-policy.mjs'
import { hashSourceData } from './lib/source-hash.mjs'

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
const safeJsonScript = (value) => JSON.stringify(value).replaceAll('<', '\\u003c')
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
  supportFeedback,
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
  readOptionalJson(path.join(dataDir, 'support-feedback.json'), {
    status: 'missing',
    summary: { aggregateEvidenceNotes: 0 },
    aggregateEvidenceNotes: [],
    controls: {},
  }),
])

const trafficCampaignByGame = new Map((trafficSeeding.campaigns ?? []).map((campaign) => [campaign.gameId, campaign]))
const gateById = new Map((productGateRecovery.gates ?? []).map((gate) => [gate.id, gate]))
const priorityByGateId = new Map((productGateRecovery.priorities ?? []).map((priority) => [priority.gateId, priority]))
const primaryCandidate = productOptimization.candidates?.[0]
const retentionLoopSourceEvidence = {
  status: retentionLoop.status,
  dailyChallenge: retentionLoop.dailyChallenge ?? null,
  returnIntentSurface: retentionLoop.returnIntentPolicy?.surface ?? null,
}

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
const generatedAt = new Date().toISOString()
const downloadsScanExpiryBufferMs = 60 * 1000
const downloadsScanPolicy = buildExplicitDownloadsScanPolicy({
  explicitDownloadsScan: localEventBridge.explicitDownloadsScan,
  gateSampleEvidence: localEventBridge.gateSampleEvidence,
  generatedAt,
  cooldownHours: localEventBridge.explicitDownloadsScanPolicy?.cooldownHours ?? 4,
  expiryBufferMs: downloadsScanExpiryBufferMs,
})
const downloadsScanPolicySource = stableDownloadsScanPolicySource(downloadsScanPolicy)
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
const aggregateEvidenceNotesByGame = new Map()

for (const note of supportFeedback.aggregateEvidenceNotes ?? []) {
  if (!note.gameId) {
    continue
  }

  const existing = aggregateEvidenceNotesByGame.get(note.gameId) ?? []
  existing.push(note)
  aggregateEvidenceNotesByGame.set(note.gameId, existing)
}

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

const supportingAggregateEvidenceForMission = (mission) => {
  const notes = (aggregateEvidenceNotesByGame.get(mission.gameId) ?? []).slice(0, 5)
  const total = (field) =>
    notes.reduce((sum, note) => sum + (typeof note.counts?.[field] === 'number' ? note.counts[field] : 0), 0)

  return {
    status: notes.length ? 'supporting-public-aggregate-notes' : 'none',
    source: 'support-feedback-public-issues',
    noteCount: notes.length,
    starts: total('starts'),
    completions: total('completions'),
    replays: total('replays'),
    d1Eligible: total('d1Eligible'),
    d1Retained: total('d1Retained'),
    gateDecisionEligible: false,
    manualReviewRequired: true,
    topIssues: notes.map((note) => ({
      number: note.number,
      status: note.status,
      url: note.url,
      evidenceWindow: note.evidenceWindow,
    })),
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
  supportingAggregateEvidence: supportingAggregateEvidenceForMission(mission),
}))
const evidenceReadyCount = missionsWithEvidence.filter(
  (mission) => mission.evidence.status === 'imported-sample-active',
).length
const inboxReadyCount = missionsWithEvidence.filter(
  (mission) => mission.evidence.status === 'inbox-ready-for-ingest',
).length
const supportingAggregateEvidenceNotes = missionsWithEvidence.reduce(
  (sum, mission) => sum + mission.supportingAggregateEvidence.noteCount,
  0,
)
const collectSampleDownloadsCommand = 'npm run autonomous:collect-sample-downloads'
const sampleCollectionNextAction = localEventsAvailable
  ? 'Use imported local event drops before the next recovery decision.'
  : inboxGateSampleEvents
    ? `Import the gate-sample event drop already waiting in the local inbox with ${collectSampleDownloadsCommand}.`
    : downloadsScanPolicy.coolingDown
      ? `Wait until ${downloadsScanPolicy.nextRecommendedScanAt} before the next explicit Downloads scan unless an inbox event drop appears.`
      : `Export or collect real browser events, then run ${collectSampleDownloadsCommand} before changing copy, placement, revenue, or rules.`
const sourceDataHash = hashSourceData({
  sampleDate: localIsoDate(),
  productGateRecovery,
  productOptimization,
  analytics,
  trafficSeeding,
  organicSeedLoop,
  retentionLoop: retentionLoopSourceEvidence,
  completionLoop,
  replayLoop,
  localEventBridge,
  downloadsScanPolicy: downloadsScanPolicySource,
  unitEconomics,
  supportFeedback: {
    status: supportFeedback.status,
    sourceDataHash: supportFeedback.sourceDataHash,
    aggregateEvidenceNotes: supportFeedback.summary?.aggregateEvidenceNotes ?? 0,
  },
})

const payload = {
  generatedAt,
  sourceDataHash,
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
    supportingAggregateEvidenceNotes,
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
    localProgressEnabled: true,
    playerInitiatedExportEnabled: true,
    exportSurface: 'product-gate-sample',
    zeroPaidSpend: true,
    playerInitiatedOnly: true,
    noSyntheticEvents: true,
  },
  runtimeEvidencePolicy: {
    status: 'active',
    surface: 'product-gate-sample-plan-card',
    localProgressSource: 'agl.analytics.events',
    campaignMatchProperties: ['acquisitionCampaign', 'campaignId'],
    progressCounters: [
      'localCampaignEvents',
      'localCollectionEvents',
      'localPromptViews',
      'localPromptActions',
      'localObservedSuccesses',
      'localFailures',
      'localAnalyticsExports',
      'localPromptViewsRemaining',
      'localSuccessesRemaining',
    ],
    exportProperties: [
      'exportSurface',
      'gateId',
      'gameId',
      'campaignId',
      'localCampaignEvents',
      'localCollectionEvents',
      'localPromptViews',
      'localPromptActions',
      'localObservedSuccesses',
      'localFailures',
      'localAnalyticsExports',
      'localEvidenceDropReady',
      'localSampleDecisionReady',
    ],
    publicPageExportProperties: [
      'exportSurface',
      'exportSurfaceDetail',
      'gateId',
      'gameId',
      'campaignId',
      'localCampaignEvents',
      'localCollectionEvents',
      'localPromptViews',
      'localObservedSuccesses',
      'localAnalyticsExports',
      'localEvidenceDropReady',
      'localSampleDecisionReady',
    ],
    controls: {
      zeroPaidSpend: true,
      localOnlyUntilCollectorConfigured: true,
      noSyntheticEvents: true,
      playerInitiatedExportOnly: true,
      noRevenueEnablement: true,
    },
  },
  missions: missionsWithEvidence,
  commandPlan: {
    refreshPlan: 'npm run autonomous:sample-plan',
    collectAndRefresh:
      'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:retention',
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
    publicAggregateEvidenceIsSupportingOnly: true,
    aggregateEvidenceDoesNotPassGates: true,
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
  `Source hash: ${payload.sourceDataHash}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Primary gate: ${payload.summary.primaryGateId ?? 'none'}`,
  `Prompt views needed: ${payload.summary.totalPromptViewsNeeded}`,
  `Observed successes needed: ${payload.summary.totalObservedSuccessesNeeded}`,
  `Imported gate-sample events: ${payload.summary.importedGateSampleEvents}`,
  `Inbox gate-sample events: ${payload.summary.inboxGateSampleEvents}`,
  `Supporting aggregate evidence notes: ${payload.summary.supportingAggregateEvidenceNotes}`,
  `Downloads scan: ${payload.summary.downloadsScanStatus}; cooling down ${payload.summary.downloadsScanCoolingDown}`,
  `Next recommended Downloads scan: ${payload.summary.downloadsScanNextRecommendedAt}`,
  `Public sample page: ${payload.publicSamplePage.path}`,
  `Runtime evidence policy: ${payload.runtimeEvidencePolicy.status}`,
  '',
  '## Missions',
  '',
  ...payload.missions.map(
    (mission) =>
      `- #${mission.rank} ${mission.gateId}: ${mission.status}; evidence ${mission.evidence.status}; aggregate notes ${mission.supportingAggregateEvidence.noteCount}; ${pct(mission.current.actual)} / ${pct(mission.current.gate)}; needs ${mission.needed.promptViews} prompt view(s), ${mission.needed.successes} success(es); ${mission.playPath}`,
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
          <div><dt>Local events</dt><dd data-local-events="${escapeHtml(mission.campaignId)}">0</dd></div>
          <div><dt>Local wins</dt><dd data-local-successes="${escapeHtml(mission.campaignId)}">0</dd></div>
          <div><dt>Local debt</dt><dd data-local-debt="${escapeHtml(mission.campaignId)}">${mission.needed.minimumPromptViewsForDecision} views / ${mission.needed.successes} wins</dd></div>
        </dl>
        <div class="missionActions">
          <a class="play" href="${escapeHtml(runtimeHref(mission.playPath))}">Start mission</a>
          <button class="export" type="button" data-export-campaign="${escapeHtml(mission.campaignId)}">Export evidence</button>
        </div>
      </article>`,
  )
  .join('\n')

const publicMissionEvidence = payload.missions.map((mission) => ({
  id: mission.id,
  gateId: mission.gateId,
  gameId: mission.gameId,
  title: mission.title,
  campaignId: mission.campaignId,
  needed: {
    promptViews: mission.needed.promptViews,
    successes: mission.needed.successes,
    minimumPromptViewsForDecision: mission.needed.minimumPromptViewsForDecision,
  },
  telemetry: mission.telemetry,
  controls: {
    costUsd: mission.controls.costUsd,
    noSyntheticEvents: mission.controls.noSyntheticEvents,
    noRevenueEnablement: mission.controls.noRevenueEnablement,
  },
}))

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

      .missionActions {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
        align-items: center;
      }

      .play,
      .export {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 16px;
        border-radius: 7px;
        border: 0;
        background: #0f766e;
        color: #fff;
        font: inherit;
        font-weight: 800;
        text-decoration: none;
      }

      .export {
        background: #17211f;
        cursor: pointer;
      }

      .play:focus-visible,
      .export:focus-visible {
        outline: 3px solid #b87b16;
        outline-offset: 2px;
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
        .missions,
        .missionActions {
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
        <p>The app buffers anonymous gameplay events locally, forwards them when a production collector exists, and keeps revenue disabled until observed samples clear every product gate. Export buttons create the same player-initiated event drop consumed by the local bridge.</p>
      </section>
    </main>
    <script type="application/json" id="gate-sample-mission-data">${safeJsonScript(publicMissionEvidence)}</script>
    <script>
      (() => {
        const bufferKey = 'agl.analytics.events'
        const missions = JSON.parse(document.getElementById('gate-sample-mission-data')?.textContent || '[]')

        const readEvents = () => {
          try {
            const raw = window.localStorage.getItem(bufferKey)
            const events = raw ? JSON.parse(raw) : []
            return Array.isArray(events) ? events : []
          } catch {
            return []
          }
        }

        const writeEvents = (events) => {
          window.localStorage.setItem(bufferKey, JSON.stringify(events.slice(-300)))
        }

        const eventNames = (events, names) => {
          const wanted = new Set(names)
          return events.filter((event) => wanted.has(event.name)).length
        }

        const missionEvents = (mission, events) =>
          events.filter((event) => {
            const properties = event.properties || {}
            return properties.acquisitionCampaign === mission.campaignId || properties.campaignId === mission.campaignId
          })

        const missionProgress = (mission, events) => {
          const scoped = missionEvents(mission, events)
          const promptViews = eventNames(scoped, mission.telemetry.view || [])
          const successes = eventNames(scoped, mission.telemetry.success || [])
          const collectionEvents = eventNames(scoped, [...new Set(mission.telemetry.collectionEvents || [])])
          const analyticsExports = scoped.filter(
            (event) => event.name === 'analytics_exported' && event.properties?.exportSurface === 'product-gate-sample',
          ).length
          const promptViewsRemaining = Math.max(0, mission.needed.minimumPromptViewsForDecision - promptViews)
          const successesRemaining = Math.max(0, mission.needed.successes - successes)

          return {
            campaignEvents: scoped.length,
            collectionEvents,
            promptViews,
            successes,
            analyticsExports,
            promptViewsRemaining,
            successesRemaining,
            evidenceDropReady: scoped.length > analyticsExports,
            sampleDecisionReady: promptViewsRemaining === 0 && successesRemaining === 0,
          }
        }

        const createId = () =>
          window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : \`export-\${Date.now()}-\${Math.random().toString(16).slice(2)}\`

        const downloadEvents = (events) => {
          const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = \`player-events-\${new Date().toISOString().slice(0, 10)}.json\`
          anchor.click()
          URL.revokeObjectURL(url)
        }

        const renderProgress = () => {
          const events = readEvents()

          for (const mission of missions) {
            const progress = missionProgress(mission, events)
            const localEvents = document.querySelector(\`[data-local-events="\${mission.campaignId}"]\`)
            const localSuccesses = document.querySelector(\`[data-local-successes="\${mission.campaignId}"]\`)
            const localDebt = document.querySelector(\`[data-local-debt="\${mission.campaignId}"]\`)

            if (localEvents) {
              localEvents.textContent = String(progress.campaignEvents)
            }

            if (localSuccesses) {
              localSuccesses.textContent = String(progress.successes)
            }

            if (localDebt) {
              localDebt.textContent = progress.sampleDecisionReady
                ? 'decision-ready'
                : \`\${progress.promptViewsRemaining} views / \${progress.successesRemaining} wins\`
            }
          }
        }

        const exportMission = (mission) => {
          const events = readEvents()
          const progress = missionProgress(mission, events)
          const exportEvent = {
            id: createId(),
            name: 'analytics_exported',
            properties: {
              destination: 'local_file',
              exportSurface: 'product-gate-sample',
              exportSurfaceDetail: 'public-gate-sample-page',
              gateId: mission.gateId,
              gameId: mission.gameId,
              campaignId: mission.campaignId,
              promptViewsNeeded: mission.needed.promptViews,
              observedSuccessesNeeded: mission.needed.successes,
              localCampaignEvents: progress.campaignEvents,
              localCollectionEvents: progress.collectionEvents,
              localPromptViews: progress.promptViews,
              localObservedSuccesses: progress.successes,
              localAnalyticsExports: progress.analyticsExports,
              localPromptViewsRemaining: progress.promptViewsRemaining,
              localSuccessesRemaining: progress.successesRemaining,
              localEvidenceDropReady: progress.evidenceDropReady,
              localSampleDecisionReady: progress.sampleDecisionReady,
              zeroPaidSpend: true,
              noSyntheticEvents: mission.controls.noSyntheticEvents,
              noRevenueEnablement: mission.controls.noRevenueEnablement,
            },
            createdAt: new Date().toISOString(),
          }
          const nextEvents = [...events, exportEvent]
          writeEvents(nextEvents)
          downloadEvents(nextEvents)
          renderProgress()
        }

        document.querySelectorAll('[data-export-campaign]').forEach((button) => {
          button.addEventListener('click', () => {
            const mission = missions.find((item) => item.campaignId === button.getAttribute('data-export-campaign'))

            if (mission) {
              exportMission(mission)
            }
          })
        })

        document.addEventListener('visibilitychange', renderProgress)
        window.addEventListener('storage', renderProgress)
        renderProgress()
      })()
    </script>
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
