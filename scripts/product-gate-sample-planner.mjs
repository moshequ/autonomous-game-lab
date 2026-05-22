import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildExplicitDownloadsScanPolicy, stableDownloadsScanPolicySource } from './lib/downloads-scan-policy.mjs'
import { hashSourceData } from './lib/source-hash.mjs'
import { stableTrafficSeedingForSamplePlan } from './lib/traffic-sample-source.mjs'

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

const sampleLatencyDaysForGate = (gateId) => (gateId === 'd1Retention' ? 1 : 0)

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
  supportChannel,
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
  readOptionalJson(path.join(dataDir, 'support-channel.json'), {
    status: 'missing',
    repository: { target: null },
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
    sampleTiming: {
      latencyDays: sampleLatencyDaysForGate(gate.id),
      sameSessionPlayable: sampleLatencyDaysForGate(gate.id) === 0,
      reason:
        gate.id === 'd1Retention'
          ? 'D1 retention needs a return session, so it is not the best default route for immediate sample collection.'
          : 'Completion and replay prompts can collect same-session evidence from the next player visit.',
    },
  }
}

const failingGates = (productGateRecovery.gates ?? []).filter((gate) => !gate.pass)
const missions = failingGates.map(missionForGate).sort((a, b) => a.rank - b.rank)
const primaryMission = missions.find((mission) => mission.gateId === productGateRecovery.summary?.primaryBottleneck) ?? missions[0] ?? null
const fastestMission = missions.find((mission) => mission.gateId === productGateRecovery.summary?.quickestGateTest) ?? missions.at(-1) ?? null
const compareDefaultRouteMissions = (left, right) => {
  const leftLatency = left.sampleTiming?.latencyDays ?? 0
  const rightLatency = right.sampleTiming?.latencyDays ?? 0

  if (leftLatency !== rightLatency) {
    return leftLatency - rightLatency
  }

  if (left.gateId === primaryMission?.gateId && right.gateId !== primaryMission?.gateId) {
    return -1
  }

  if (right.gateId === primaryMission?.gateId && left.gateId !== primaryMission?.gateId) {
    return 1
  }

  if (left.needed.promptViews !== right.needed.promptViews) {
    return left.needed.promptViews - right.needed.promptViews
  }

  return left.needed.successes - right.needed.successes
}
const defaultRouteMission =
  [...missions]
    .filter((mission) => mission.status !== 'gate-passing')
    .sort(compareDefaultRouteMissions)[0] ??
  primaryMission ??
  fastestMission
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
const aggregateEvidenceNotesByCampaign = new Map()
const aggregateEvidenceNotesByGateGame = new Map()

for (const note of supportFeedback.aggregateEvidenceNotes ?? []) {
  if (!note.gameId) {
    continue
  }

  const existing = aggregateEvidenceNotesByGame.get(note.gameId) ?? []
  existing.push(note)
  aggregateEvidenceNotesByGame.set(note.gameId, existing)

  if (note.campaignId) {
    const campaignNotes = aggregateEvidenceNotesByCampaign.get(note.campaignId) ?? []
    campaignNotes.push(note)
    aggregateEvidenceNotesByCampaign.set(note.campaignId, campaignNotes)
  }

  if (note.gateId) {
    const gateGameKey = `${note.gameId}:${note.gateId}`
    const gateGameNotes = aggregateEvidenceNotesByGateGame.get(gateGameKey) ?? []
    gateGameNotes.push(note)
    aggregateEvidenceNotesByGateGame.set(gateGameKey, gateGameNotes)
  }
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
  const campaignNotes = aggregateEvidenceNotesByCampaign.get(mission.campaignId) ?? []
  const gateGameNotes = aggregateEvidenceNotesByGateGame.get(`${mission.gameId}:${mission.gateId}`) ?? []
  const gameNotes = aggregateEvidenceNotesByGame.get(mission.gameId) ?? []
  const notes = [...new Map([...campaignNotes, ...gateGameNotes, ...gameNotes].map((note) => [note.number, note])).values()].slice(0, 5)
  const total = (field) =>
    notes.reduce((sum, note) => sum + (typeof note.counts?.[field] === 'number' ? note.counts[field] : 0), 0)
  const matchScope = campaignNotes.length ? 'campaign' : gateGameNotes.length ? 'gate-game' : notes.length ? 'game' : 'none'

  return {
    status: notes.length ? 'supporting-public-aggregate-notes' : 'none',
    source: 'support-feedback-public-issues',
    matchScope,
    noteCount: notes.length,
    campaignNoteCount: campaignNotes.length,
    gateGameNoteCount: gateGameNotes.length,
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
      gateId: note.gateId ?? null,
      campaignId: note.campaignId ?? null,
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
const aggregateEvidenceRepository =
  typeof supportChannel.repository?.target === 'string' && /^[\w.-]+\/[\w.-]+$/.test(supportChannel.repository.target)
    ? supportChannel.repository.target
    : null
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
  trafficSeeding: stableTrafficSeedingForSamplePlan(trafficSeeding),
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
  supportChannel: {
    status: supportChannel.status,
    repository: aggregateEvidenceRepository,
    analyticsEvidenceAggregateOnly: supportChannel.controls?.analyticsEvidenceAggregateOnly === true,
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
    defaultRouteGateId: defaultRouteMission?.gateId ?? null,
    defaultRouteCampaignId: defaultRouteMission?.campaignId ?? null,
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
    missionCount: missionsWithEvidence.length,
    primaryCampaignId: primaryMission?.campaignId ?? null,
    fastestCampaignId: fastestMission?.campaignId ?? null,
    defaultRouteCampaignId: defaultRouteMission?.campaignId ?? null,
    localProgressEnabled: true,
    autonomousDefaultRoutingEnabled: Boolean(defaultRouteMission),
    playerInitiatedExportEnabled: true,
    playerInitiatedFolderDropEnabled: true,
    playerInitiatedShareEnabled: true,
    playerInitiatedAggregateEvidenceEnabled: Boolean(aggregateEvidenceRepository),
    aggregateEvidenceIssueTemplate: 'analytics-evidence.yml',
    aggregateEvidenceRepository,
    exportSurface: 'product-gate-sample',
    localFolderDrop: {
      mode: 'browser-selected-local-folder',
      supportedRuntime: 'showDirectoryPicker',
      filenamePattern: 'player-events*.json',
      fallback: 'download',
      bridgeImport: 'data/player-events/inbox or AGL_LOCAL_EVENT_DROP_DIRS',
      noExternalUpload: true,
      playerInitiatedOnly: true,
    },
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
      'eventDropMode',
      'eventDropFolderStatus',
      'noExternalUpload',
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
      'eventDropMode',
      'eventDropFolderStatus',
      'noExternalUpload',
    ],
    publicPageShareProperties: [
      'campaignId',
      'gateId',
      'gameId',
      'shareUrl',
      'method',
      'succeeded',
      'zeroPaidSpend',
      'noSyntheticEvents',
    ],
    defaultRouting: {
      status: defaultRouteMission ? 'active' : 'inactive',
      gateId: defaultRouteMission?.gateId ?? null,
      campaignId: defaultRouteMission?.campaignId ?? null,
      gameId: defaultRouteMission?.gameId ?? null,
      latencyDays: defaultRouteMission?.sampleTiming?.latencyDays ?? null,
      source: 'gate_sample',
      channel: 'product-gate-sample',
      appliesWhen: 'direct-root-visit-without-explicit-game-or-campaign',
      routeSelection: 'lowest-validation-latency-primary-bottleneck-first',
      eventPolicy: 'real-player-events-only',
      controls: {
        zeroPaidSpend: true,
        noSyntheticEvents: true,
        noAutoPlay: true,
        playerCanChooseAnotherGame: true,
        noRevenueEnablement: true,
      },
    },
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
    browserSelectedDropFolderSupported: true,
    folderDropRequiresPlayerPicker: true,
    folderDropNeverReadsFiles: true,
    directTrafficSampleRouting: Boolean(defaultRouteMission),
    playerInitiatedSampleSharing: true,
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

const appPayload = {
  status: payload.status,
  summary: {
    fastestGateId: payload.summary.fastestGateId,
    defaultRouteCampaignId: payload.summary.defaultRouteCampaignId,
    totalPromptViewsNeeded: payload.summary.totalPromptViewsNeeded,
  },
  runtimeEvidencePolicy: {
    defaultRouting: {
      campaignId: payload.runtimeEvidencePolicy.defaultRouting.campaignId,
    },
  },
  controls: {
    zeroPaidSpend: payload.controls.zeroPaidSpend,
  },
  missions: payload.missions.map((mission) => ({
    id: mission.id,
    gateId: mission.gateId,
    label: mission.label,
    status: mission.status,
    ownerLoop: mission.ownerLoop,
    gameId: mission.gameId,
    title: mission.title,
    surface: mission.surface,
    campaignId: mission.campaignId,
    playPath: mission.playPath,
    needed: {
      promptViews: mission.needed.promptViews,
      successes: mission.needed.successes,
      minimumPromptViewsForDecision: mission.needed.minimumPromptViewsForDecision,
    },
    telemetry: mission.telemetry,
    controls: {
      costUsd: mission.controls.costUsd,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
      noRuleChange: mission.controls.noRuleChange,
      noRevenueEnablement: mission.controls.noRevenueEnablement,
    },
    evidence: {
      status: mission.evidence.status,
    },
  })),
}

const report = [
  '# Product Gate Sample Plan',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Source hash: ${payload.sourceDataHash}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Primary gate: ${payload.summary.primaryGateId ?? 'none'}`,
  `Default route: ${payload.summary.defaultRouteGateId ?? 'none'} (${payload.summary.defaultRouteCampaignId ?? 'none'})`,
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
          <button class="share" type="button" data-share-campaign="${escapeHtml(mission.campaignId)}">Share mission</button>
          <button class="export" type="button" data-export-campaign="${escapeHtml(mission.campaignId)}">Export evidence</button>
          ${
            aggregateEvidenceRepository
              ? `<button class="evidence" type="button" data-evidence-campaign="${escapeHtml(mission.campaignId)}">Share evidence</button>`
              : ''
          }
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
  playPath: mission.playPath,
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
const publicSupportEvidence = {
  repository: aggregateEvidenceRepository,
  template: 'analytics-evidence.yml',
}

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
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        align-items: center;
      }

      .play,
      .share,
      .export,
      .evidence,
      .folder {
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

      .share {
        background: #bd4d38;
        cursor: pointer;
      }

      .evidence {
        background: #343f3b;
        cursor: pointer;
      }

      .folder {
        background: #275b55;
        cursor: pointer;
      }

      .play:focus-visible,
      .share:focus-visible,
      .export:focus-visible,
      .evidence:focus-visible,
      .folder:focus-visible {
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

      .handoffActions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        margin-top: 14px;
      }

      .dropStatus {
        min-width: min(100%, 360px);
        color: #4a5753;
        font-size: 0.92rem;
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
        <div class="handoffActions">
          <button class="folder" type="button" data-connect-drop-folder>Connect drop folder</button>
          <p class="dropStatus" data-drop-folder-status>Manual download fallback active.</p>
        </div>
      </section>
    </main>
    <script type="application/json" id="gate-sample-mission-data">${safeJsonScript(publicMissionEvidence)}</script>
    <script type="application/json" id="gate-sample-support-data">${safeJsonScript(publicSupportEvidence)}</script>
    <script>
      (() => {
        const bufferKey = 'agl.analytics.events'
        const missions = JSON.parse(document.getElementById('gate-sample-mission-data')?.textContent || '[]')
        const support = JSON.parse(document.getElementById('gate-sample-support-data')?.textContent || '{}')
        let dropDirectoryHandle = null

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

        const uniquePlayers = (events, names) => {
          const wanted = new Set(names)
          const players = new Set(
            events
              .filter((event) => wanted.has(event.name))
              .map((event) => event.properties?.anonymousId)
              .filter((anonymousId) => typeof anonymousId === 'string' && anonymousId),
          )

          return players.size
        }

        const evidenceWindowFor = (events) => {
          const dates = events
            .flatMap((event) => {
              const timestamp = Date.parse(event.createdAt || '')
              return Number.isFinite(timestamp) ? [new Date(timestamp).toISOString().slice(0, 10)] : []
            })
            .sort()

          if (!dates.length) {
            return new Date().toISOString().slice(0, 10)
          }

          const first = dates[0]
          const last = dates[dates.length - 1] || first

          return first === last ? first : \`\${first} to \${last}\`
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

        const dropFolderSupported = () => typeof window.showDirectoryPicker === 'function'

        const setDropFolderStatus = (message) => {
          document.querySelectorAll('[data-drop-folder-status]').forEach((status) => {
            status.textContent = message
          })
        }

        const eventDropFileName = (exportSurface) =>
          'player-events-' +
          new Date().toISOString().replace(/[:.]/g, '-') +
          '-' +
          exportSurface +
          '.json'

        const ensureDropFolderPermission = async (handle) => {
          const descriptor = { mode: 'readwrite' }
          const current = handle.queryPermission ? await handle.queryPermission(descriptor) : 'granted'

          if (current === 'granted') {
            return true
          }

          if (!handle.requestPermission) {
            return false
          }

          return (await handle.requestPermission(descriptor)) === 'granted'
        }

        const writeDropFile = async (events, exportSurface) => {
          if (!dropDirectoryHandle) {
            return false
          }

          const granted = await ensureDropFolderPermission(dropDirectoryHandle)

          if (!granted) {
            setDropFolderStatus('Drop folder permission needed; export will download instead.')
            return false
          }

          try {
            const fileHandle = await dropDirectoryHandle.getFileHandle(eventDropFileName(exportSurface), {
              create: true,
            })
            const writable = await fileHandle.createWritable()
            await writable.write(JSON.stringify(events, null, 2))
            await writable.close()
            setDropFolderStatus('Evidence saved to the connected local folder.')
            return true
          } catch {
            setDropFolderStatus('Could not save to the connected folder; export will download instead.')
            return false
          }
        }

        const connectDropFolder = async () => {
          if (!dropFolderSupported()) {
            setDropFolderStatus('This browser uses manual downloads for evidence exports.')
            return
          }

          try {
            const handle = await window.showDirectoryPicker({
              id: 'autonomous-game-lab-gate-sample-drops',
              mode: 'readwrite',
              startIn: 'downloads',
            })
            const granted = await ensureDropFolderPermission(handle)

            if (!granted) {
              setDropFolderStatus('Drop folder permission was not granted.')
              return
            }

            dropDirectoryHandle = handle
            setDropFolderStatus('Drop folder connected; evidence exports save locally without external upload.')
            writeEvents([
              ...readEvents(),
              {
                id: createId(),
                name: 'local_event_drop_folder_connected',
                properties: {
                  surface: 'public-gate-sample-page',
                  channel: 'product-gate-sample',
                  mode: 'browser-selected-local-folder',
                  fallback: 'download',
                  noExternalUpload: true,
                  noPiiRequired: true,
                  playerInitiatedOnly: true,
                  zeroPaidSpend: true,
                },
                createdAt: new Date().toISOString(),
              },
            ])
            renderProgress()
          } catch {
            setDropFolderStatus('Drop folder was not connected; manual download fallback remains active.')
          }
        }

        const downloadEvents = (events) => {
          const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = \`player-events-\${new Date().toISOString().slice(0, 10)}.json\`
          anchor.click()
          URL.revokeObjectURL(url)
        }

        const missionShareUrl = (mission) =>
          new URL(mission.playPath || './', window.location.href).toString()

        const shareMission = async (mission) => {
          const shareUrl = missionShareUrl(mission)
          const shareData = {
            title: \`Play \${mission.title}\`,
            text: 'Help collect real zero-spend gameplay evidence for Autonomous Game Lab.',
            url: shareUrl,
          }
          let method = 'unsupported'
          let succeeded = false

          if (navigator.share) {
            try {
              await navigator.share(shareData)
              method = 'native'
              succeeded = true
            } catch {
              method = 'native'
            }
          } else if (navigator.clipboard?.writeText) {
            method = 'clipboard'

            try {
              await navigator.clipboard.writeText(shareUrl)
              succeeded = true
            } catch {
              succeeded = false
            }
          }

          const events = readEvents()
          const shareEvent = {
            id: createId(),
            name: 'share_clicked',
            properties: {
              surface: 'public-gate-sample-page',
              channel: 'product-gate-sample',
              campaignId: mission.campaignId,
              gateId: mission.gateId,
              gameId: mission.gameId,
              acquisitionCampaign: mission.campaignId,
              acquisitionSource: 'gate_sample',
              acquisitionChannel: 'product-gate-sample',
              shareUrl,
              method,
              succeeded,
              zeroPaidSpend: true,
              noPaidTraffic: true,
              noSyntheticEvents: mission.controls.noSyntheticEvents,
              noRevenueEnablement: mission.controls.noRevenueEnablement,
            },
            createdAt: new Date().toISOString(),
          }

          writeEvents([...events, shareEvent])
          renderProgress()
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

        const exportMission = async (mission) => {
          const events = readEvents()
          const progress = missionProgress(mission, events)
          const folderPreferred = Boolean(dropDirectoryHandle)
          const exportEvent = {
            id: createId(),
            name: 'analytics_exported',
            properties: {
              destination: folderPreferred ? 'local_folder' : 'local_file',
              exportSurface: 'product-gate-sample',
              exportSurfaceDetail: 'public-gate-sample-page',
              eventDropMode: folderPreferred ? 'folder' : 'download',
              eventDropFolderStatus: folderPreferred ? 'connected' : 'not-connected',
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
              noExternalUpload: true,
              zeroPaidSpend: true,
              noSyntheticEvents: mission.controls.noSyntheticEvents,
              noRevenueEnablement: mission.controls.noRevenueEnablement,
            },
            createdAt: new Date().toISOString(),
          }
          const nextEvents = [...events, exportEvent]
          const wroteToFolder = await writeDropFile(nextEvents, 'product-gate-sample')

          if (!wroteToFolder) {
            exportEvent.properties.destination = 'local_file'
            exportEvent.properties.eventDropMode = folderPreferred ? 'folder-failed-download' : 'download'
            exportEvent.properties.eventDropFolderStatus = folderPreferred ? 'failed' : 'not-connected'
            downloadEvents(nextEvents)
          }

          writeEvents(nextEvents)
          renderProgress()
        }

        const aggregateIssueUrl = (mission, events) => {
          if (!support.repository || !/^[\\w.-]+\\/[\\w.-]+$/.test(support.repository)) {
            return null
          }

          const scoped = missionEvents(mission, events)
          const url = new URL(\`https://github.com/\${support.repository}/issues/new\`)
          const counts = {
            starts: eventNames(scoped, ['game_started']),
            completions: eventNames(scoped, ['level_completed']),
            replays: eventNames(scoped, ['replay_clicked']),
            d1Eligible: uniquePlayers(scoped, ['daily_challenge_completed']),
            d1Retained: uniquePlayers(scoped, ['daily_return_intent_started']),
          }

          url.searchParams.set('template', support.template || 'analytics-evidence.yml')
          url.searchParams.set('title', \`[Evidence] \${mission.title} gate sample aggregate counts\`)
          url.searchParams.set('game', \`\${mission.title} (\${mission.gameId}; \${mission.gateId}; \${mission.campaignId})\`)
          url.searchParams.set('window', evidenceWindowFor(scoped))
          url.searchParams.set('starts', String(counts.starts))
          url.searchParams.set('completions', String(counts.completions))
          url.searchParams.set('replays', String(counts.replays))
          url.searchParams.set('d1_eligible', String(counts.d1Eligible))
          url.searchParams.set('d1_retained', String(counts.d1Retained))
          url.searchParams.set(
            'summary',
            \`Aggregate-only gate sample summary from \${scoped.length} local event(s) for \${mission.campaignId}. Raw event rows and identifiers remain on the device. Aggregate evidence supports review but does not pass product gates by itself.\`,
          )

          return { url: url.toString(), counts, eventCount: scoped.length }
        }

        const shareAggregateEvidence = (mission) => {
          const events = readEvents()
          const evidence = aggregateIssueUrl(mission, events)

          if (!evidence) {
            return
          }

          const evidenceEvent = {
            id: createId(),
            name: 'analytics_evidence_issue_opened',
            properties: {
              surface: 'public-gate-sample-page',
              channel: 'product-gate-sample',
              campaignId: mission.campaignId,
              gateId: mission.gateId,
              gameId: mission.gameId,
              starts: evidence.counts.starts,
              completions: evidence.counts.completions,
              replays: evidence.counts.replays,
              d1Eligible: evidence.counts.d1Eligible,
              d1Retained: evidence.counts.d1Retained,
              localCampaignEvents: evidence.eventCount,
              publicAggregateOnly: true,
              rawEventsIncluded: false,
              identifiersIncluded: false,
              aggregateEvidenceDoesNotPassGates: true,
              destination: 'github-issues',
              zeroPaidSpend: true,
              noSyntheticEvents: mission.controls.noSyntheticEvents,
              noRevenueEnablement: mission.controls.noRevenueEnablement,
            },
            createdAt: new Date().toISOString(),
          }

          writeEvents([...events, evidenceEvent])
          window.open(evidence.url, '_blank', 'noopener,noreferrer')
          renderProgress()
        }

        document.querySelector('[data-connect-drop-folder]')?.addEventListener('click', () => {
          void connectDropFolder()
        })

        document.querySelectorAll('[data-export-campaign]').forEach((button) => {
          button.addEventListener('click', () => {
            const mission = missions.find((item) => item.campaignId === button.getAttribute('data-export-campaign'))

            if (mission) {
              void exportMission(mission)
            }
          })
        })

        document.querySelectorAll('[data-share-campaign]').forEach((button) => {
          button.addEventListener('click', () => {
            const mission = missions.find((item) => item.campaignId === button.getAttribute('data-share-campaign'))

            if (mission) {
              void shareMission(mission)
            }
          })
        })

        document.querySelectorAll('[data-evidence-campaign]').forEach((button) => {
          button.addEventListener('click', () => {
            const mission = missions.find((item) => item.campaignId === button.getAttribute('data-evidence-campaign'))

            if (mission) {
              shareAggregateEvidence(mission)
            }
          })
        })

        document.addEventListener('visibilitychange', renderProgress)
        window.addEventListener('storage', renderProgress)
        setDropFolderStatus(
          dropFolderSupported()
            ? 'Optional local drop folder available; manual download fallback remains active.'
            : 'Manual download fallback active.',
        )
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
  `export const productGateSamplePlan = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type ProductGateSamplePlan = typeof productGateSamplePlan\n`,
)
await writeFile(reportPath, report)
await writeFile(gateSamplePagePath, gateSamplePage)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, gateSamplePagePath)}`)
