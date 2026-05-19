import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'product-gate-sample-plan.json')
const outputTsPath = path.join(root, 'src', 'data', 'productGateSamplePlan.ts')
const reportPath = path.join(root, 'reports', 'product-gate-sample-plan-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const todaySlug = () => new Date().toISOString().slice(0, 10).replaceAll('-', '')
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')

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

const missionsWithEvidence = missions.map((mission) => ({
  ...mission,
  evidence: evidenceForMission(mission),
}))
const evidenceReadyCount = missionsWithEvidence.filter(
  (mission) => mission.evidence.status === 'imported-sample-active',
).length
const inboxReadyCount = missionsWithEvidence.filter(
  (mission) => mission.evidence.status === 'inbox-ready-for-ingest',
).length
const collectSampleDownloadsCommand = 'npm run autonomous:collect-sample-downloads'

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
    nextOwnerAction: missions.length ? 'collect-gate-sample-downloads' : 'refresh-product-gate-sample-plan',
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
    requireObservedTelemetryBeforeRecoveryChange: true,
  },
  nextActions: [
    primaryMission
      ? `${primaryMission.label} needs ${primaryMission.needed.promptViews} more prompt exposure(s) and ${primaryMission.needed.successes} observed success(es); feature ${primaryMission.title} via ${primaryMission.playPath}.`
      : 'No failing product gates need sample collection.',
    fastestMission && fastestMission.gateId !== primaryMission?.gateId
      ? `${fastestMission.label} is the fastest gate sample: ${fastestMission.needed.promptViews} prompt exposure(s), ${fastestMission.needed.successes} observed success(es).`
      : 'Keep the primary gate sample mission active until the recovery decision is sample-ready.',
    localEventsAvailable
      ? 'Use imported local event drops before the next recovery decision.'
      : inboxGateSampleEvents
        ? `Import the gate-sample event drop already waiting in the local inbox with ${collectSampleDownloadsCommand}.`
      : `Export or collect real browser events, then run ${collectSampleDownloadsCommand} before changing copy, placement, revenue, or rules.`,
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

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productGateSamplePlan = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductGateSamplePlan = typeof productGateSamplePlan\n`,
)
await writeFile(reportPath, report)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
