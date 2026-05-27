import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildExplicitDownloadsScanPolicy, stableDownloadsScanPolicySource } from './lib/downloads-scan-policy.mjs'
import { localIsoDate } from './lib/product-date.mjs'
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
const addIsoDays = (isoDate, days) => {
  const [year, month, day] = String(isoDate)
    .split('-')
    .map((part) => Number.parseInt(part, 10))

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return isoDate
  }

  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

const routeFor = ({ gameId, gateId }) => {
  const campaignId = `gate-sample-${todaySlug()}-${gateId}`
  return {
    campaignId,
    playPath: `/?game=${encodeURIComponent(gameId)}&utm_source=gate_sample&utm_campaign=${encodeURIComponent(campaignId)}`,
  }
}

const appendQueryParams = (pathname, params) => {
  const url = new URL(pathname ?? '/', 'https://runtime.invalid')

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  return `${url.pathname}${url.search}`
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

const returnHandoffForMission = ({ gate, route, target }) => {
  const queryParam = retentionLoop.returnLinkPolicy?.queryParam
  const intentDate =
    retentionLoop.returnLinkPolicy?.intentDate ??
    retentionLoop.returnCalendarPolicy?.intentDate ??
    retentionLoop.promptPolicy?.nextChallengeDate

  if (
    gate.id !== 'd1Retention' ||
    retentionLoop.returnLinkPolicy?.status !== 'armed' ||
    retentionLoop.returnCalendarPolicy?.status !== 'armed' ||
    typeof queryParam !== 'string' ||
    typeof intentDate !== 'string'
  ) {
    return null
  }

  return {
    status: 'armed',
    gateId: gate.id,
    gameId: target.gameId,
    title: target.title,
    campaignId: route.campaignId,
    challengeDate: retentionLoop.dailyChallenge?.date ?? null,
    intentDate,
    queryParam,
    returnPath: appendQueryParams(route.playPath, { [queryParam]: intentDate }),
    copyCta: retentionLoop.returnLinkPolicy.ctaLabel ?? 'Copy return link',
    calendarCta: retentionLoop.returnCalendarPolicy.ctaLabel ?? 'Save reminder',
    calendarFileExtension: retentionLoop.returnCalendarPolicy.fileExtension ?? '.ics',
    surface: 'product-gate-sample-return-handoff',
    telemetry: {
      copied: retentionLoop.returnLinkPolicy.telemetry?.copied ?? 'daily_return_link_copied',
      calendarDownloaded: retentionLoop.returnCalendarPolicy.telemetry?.downloaded ?? 'daily_return_calendar_downloaded',
    },
    controls: {
      zeroPaidSpend: true,
      playerInitiatedOnly: true,
      noNotificationPermissionRequest: true,
      noPushNotifications: true,
      noAccountRequired: true,
      noExternalUpload: true,
      noRevenueEnablement: true,
      noSyntheticEvents: true,
    },
  }
}

const missionForGate = (gate, index) => {
  const target = gameTargetForGate(gate)
  const trafficCampaign = trafficCampaignByGame.get(target.gameId)
  const route = routeFor({ gameId: target.gameId, gateId: gate.id })
  const returnHandoff = returnHandoffForMission({ gate, route, target })
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
    returnHandoff,
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
      returnHandoffRequired: gate.id === 'd1Retention',
      returnIntentDate: returnHandoff?.intentDate ?? null,
      returnPath: returnHandoff?.returnPath ?? null,
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
const defaultRouteSelectionReason = (mission) => {
  if (!mission) {
    return 'No failing product gate currently needs a default sample route.'
  }

  if (mission.gateId === primaryMission?.gateId && mission.sampleTiming?.sameSessionPlayable) {
    return `${mission.label} is the primary revenue-blocking gap and can collect same-session evidence from the next player.`
  }

  if (mission.gateId === fastestMission?.gateId) {
    return `${mission.label} needs the fastest real-player validation before revenue or store gates can move.`
  }

  if (mission.sampleTiming?.sameSessionPlayable) {
    return `${mission.label} can collect same-session evidence without paid traffic, synthetic runs, or rule changes.`
  }

  return `${mission.label} is the selected zero-spend sample route while stricter gates stay closed.`
}
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
const returnHandoffMissions = missionsWithEvidence.filter((mission) => mission.returnHandoff)
const defaultRouteMissionWithEvidence = defaultRouteMission
  ? (missionsWithEvidence.find((mission) => mission.campaignId === defaultRouteMission.campaignId) ?? defaultRouteMission)
  : null
const defaultRoute = defaultRouteMissionWithEvidence
  ? {
      status: 'active',
      gateId: defaultRouteMissionWithEvidence.gateId,
      label: defaultRouteMissionWithEvidence.label,
      title: defaultRouteMissionWithEvidence.title,
      ownerLoop: defaultRouteMissionWithEvidence.ownerLoop,
      gameId: defaultRouteMissionWithEvidence.gameId,
      campaignId: defaultRouteMissionWithEvidence.campaignId,
      playPath: defaultRouteMissionWithEvidence.playPath,
      sampleRole: defaultRouteMissionWithEvidence.sampleRole,
      evidenceStatus: defaultRouteMissionWithEvidence.evidence.status,
      neededPromptViews: defaultRouteMissionWithEvidence.needed.promptViews,
      neededSuccesses: defaultRouteMissionWithEvidence.needed.successes,
      minimumPromptViewsForDecision: defaultRouteMissionWithEvidence.needed.minimumPromptViewsForDecision,
      latencyDays: defaultRouteMissionWithEvidence.sampleTiming?.latencyDays ?? null,
      sameSessionPlayable: defaultRouteMissionWithEvidence.sampleTiming?.sameSessionPlayable === true,
      returnHandoffRequired: defaultRouteMissionWithEvidence.sampleTiming?.returnHandoffRequired === true,
      returnHandoff: defaultRouteMissionWithEvidence.returnHandoff,
      selectionReason: defaultRouteSelectionReason(defaultRouteMissionWithEvidence),
      controls: {
        zeroPaidSpend: true,
        playerInitiatedOnly: true,
        noSyntheticEvents: defaultRouteMissionWithEvidence.controls.noSyntheticEvents,
        noRevenueEnablement: defaultRouteMissionWithEvidence.controls.noRevenueEnablement,
      },
    }
  : null
const collectSampleDownloadsCommand = 'npm run autonomous:collect-sample-downloads'
const collectLocalEventDropsCommand = 'npm run autonomous:collect-local-event-drops'
const eventDropContract = localEventBridge.eventDropContract ?? {}
const localDropInboxDirectory = eventDropContract.inboxDirectory ?? 'data/player-events/inbox'
const localDropFilenamePattern = eventDropContract.filenamePattern ?? 'player-events*.json'
const localDropImportCommand = eventDropContract.localDropImportCommand ?? collectLocalEventDropsCommand
const explicitDownloadsImportCommand = eventDropContract.downloadsImportCommand ?? collectSampleDownloadsCommand
const aggregateEvidenceRepository =
  typeof supportChannel.repository?.target === 'string' && /^[\w.-]+\/[\w.-]+$/.test(supportChannel.repository.target)
    ? supportChannel.repository.target
    : null
const sampleCollectionNextAction = localEventsAvailable
  ? 'Use imported local event drops before the next recovery decision.'
  : inboxGateSampleEvents
    ? `Import the gate-sample event drop already waiting in the local inbox with ${collectLocalEventDropsCommand}.`
    : downloadsScanPolicy.coolingDown
      ? `Wait until ${downloadsScanPolicy.nextRecommendedScanAt} before the next explicit Downloads scan unless an inbox event drop appears.`
      : `Export or collect real browser events, then run ${collectLocalEventDropsCommand}; use ${collectSampleDownloadsCommand} only after explicit owner opt-in.`
const sprintDate = localIsoDate()
const sprintRouteQuotas = missionsWithEvidence.map((mission, index) => {
  const latencyDays = mission.sampleTiming?.latencyDays ?? sampleLatencyDaysForGate(mission.gateId)
  const returnDate =
    mission.returnHandoff?.intentDate ?? (latencyDays > 0 ? addIsoDays(sprintDate, latencyDays) : null)
  const minimumCountedRunsNeeded = Math.max(mission.needed.promptViews, mission.needed.successes)

  return {
    routeId: `gate-sample-${mission.gateId}`,
    priority: index + 1,
    sampleRole: mission.sampleRole,
    gateId: mission.gateId,
    label: mission.label,
    gameId: mission.gameId,
    title: mission.title,
    campaignId: mission.campaignId,
    playPath: mission.playPath,
    publicSamplePage: '/gate-sample.html',
    neededPromptViews: mission.needed.promptViews,
    neededObservedSuccesses: mission.needed.successes,
    minimumPromptViewsForDecision: mission.needed.minimumPromptViewsForDecision,
    minimumCountedRunsNeeded,
    quotaBasis:
      'Conservative lower bound: max(prompt views needed, observed successes needed), not a conversion forecast.',
    evidenceStatus: mission.evidence.status,
    latencyDays,
    sameSessionPlayable: mission.sampleTiming?.sameSessionPlayable === true,
    returnHandoffRequired: mission.sampleTiming?.returnHandoffRequired === true,
    returnIntentDate: returnDate,
    returnPath: mission.returnHandoff?.returnPath ?? null,
    followUpWindow:
      latencyDays > 0
        ? {
            date: returnDate,
            dayOffset: latencyDays,
            action: 'player-initiated-return-session',
            path: mission.returnHandoff?.returnPath ?? mission.playPath,
          }
        : null,
    controls: {
      zeroPaidSpend: true,
      playerInitiatedOnly: true,
      noAutomaticMessaging: true,
      noSyntheticEvents: true,
      noExternalUpload: true,
      noRevenueEnablement: true,
      noStoreSubmission: true,
    },
  }
})
const sprintDurationDays = Math.max(1, ...sprintRouteQuotas.map((quota) => quota.latencyDays + 1))
const evidenceSprintPlan = {
  id: 'zero-spend-product-gate-evidence-sprint',
  title: 'Zero-spend product gate evidence sprint',
  status: missionsWithEvidence.length ? 'ready-for-player-invite-sprint' : 'no-failing-gates',
  sprintDate,
  durationDays: sprintDurationDays,
  primaryRouteId: primaryMission ? `gate-sample-${primaryMission.gateId}` : null,
  fastestRouteId: fastestMission ? `gate-sample-${fastestMission.gateId}` : null,
  defaultRouteId: defaultRouteMission ? `gate-sample-${defaultRouteMission.gateId}` : null,
  primaryCampaignId: primaryMission?.campaignId ?? null,
  fastestCampaignId: fastestMission?.campaignId ?? null,
  defaultCampaignId: defaultRouteMission?.campaignId ?? null,
  publicSamplePage: '/gate-sample.html',
  measurementStatusPage: '/measurement-status.html',
  totals: {
    routes: sprintRouteQuotas.length,
    failingGates: failingGates.length,
    promptViewQuota: totalPromptViewsNeeded,
    observedSuccessQuota: totalObservedSuccessesNeeded,
    minimumCountedRunsNeeded: sprintRouteQuotas.reduce(
      (sum, quota) => sum + quota.minimumCountedRunsNeeded,
      0,
    ),
    sameSessionRoutes: sprintRouteQuotas.filter((quota) => quota.sameSessionPlayable).length,
    returnHandoffRoutes: sprintRouteQuotas.filter((quota) => quota.returnHandoffRequired).length,
  },
  routeQuotas: sprintRouteQuotas,
  schedule: {
    startDate: sprintDate,
    endDate: addIsoDays(sprintDate, sprintDurationDays - 1),
    startActions: sprintRouteQuotas.map((quota) => ({
      date: sprintDate,
      dayOffset: 0,
      routeId: quota.routeId,
      campaignId: quota.campaignId,
      gateId: quota.gateId,
      path: quota.playPath,
      minimumCountedRunsNeeded: quota.minimumCountedRunsNeeded,
      action: 'share-player-initiated-sample-route',
    })),
    followUps: sprintRouteQuotas
      .filter((quota) => quota.followUpWindow)
      .map((quota) => ({
        ...quota.followUpWindow,
        routeId: quota.routeId,
        campaignId: quota.campaignId,
        gateId: quota.gateId,
        minimumCountedRunsNeeded: quota.minimumCountedRunsNeeded,
      })),
    completionCriteria: [
      'Each route meets its prompt-view quota from real player telemetry.',
      'Each route meets its observed-success quota from local event drops or configured production analytics.',
      'D1 retention routes include the return-session follow-up before gate decisions.',
      'Public aggregate notes are reviewed as supporting diagnosis only.',
    ],
  },
  commands: {
    collectLocalDrops: collectLocalEventDropsCommand,
    collectSampleDownloads: collectSampleDownloadsCommand,
    refreshWatchdog: 'npm run autonomous:player-evidence-watchdog',
    refreshMeasurement: 'npm run autonomous:measurement-status',
    refreshGateRecovery: 'npm run autonomous:gate-recovery',
    refreshSamplePlan: 'npm run autonomous:sample-plan',
  },
  handoff: {
    localDropInbox: localDropInboxDirectory,
    filenamePattern: localDropFilenamePattern,
    configuredDropDirEnv: 'AGL_LOCAL_EVENT_DROP_DIRS',
    aggregateEvidenceRepository,
    aggregateEvidenceIssueTemplate: 'analytics-evidence.yml',
    invitePackPage: '/measurement-status.html',
  },
  controls: {
    zeroPaidSpend: true,
    noPaidTraffic: true,
    playerInitiatedOnly: true,
    noAutomaticMessaging: true,
    noExternalUpload: true,
    noAutomaticDownloadsScan: true,
    downloadsImportRequiresExplicitOptIn: true,
    noRawEventsInPublicIssues: true,
    publicAggregateEvidenceIsSupportingOnly: true,
    aggregateEvidenceDoesNotPassGates: true,
    noGateDecisionFromSprintAlone: true,
    requireObservedTelemetryBeforeRecoveryChange: true,
    manualReviewRequiredForGateDecisions: true,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
    noStoreSubmission: true,
  },
}
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
    returnHandoffMissionCount: returnHandoffMissions.length,
    downloadsScanStatus: downloadsScanPolicy.lastScanStatus ?? 'not-scanned',
    downloadsScanCoolingDown: downloadsScanPolicy.coolingDown,
    downloadsScanNextRecommendedAt: downloadsScanPolicy.nextRecommendedScanAt,
    nextOwnerAction: missions.length ? 'collect-gate-sample-local-drops' : 'refresh-product-gate-sample-plan',
  },
  downloadsScan: downloadsScanPolicy,
  publicSamplePage: {
    path: '/gate-sample.html',
    missionCount: missionsWithEvidence.length,
    primaryCampaignId: primaryMission?.campaignId ?? null,
    fastestCampaignId: fastestMission?.campaignId ?? null,
    defaultRouteCampaignId: defaultRouteMission?.campaignId ?? null,
    defaultRoute,
    localProgressEnabled: true,
    autonomousDefaultRoutingEnabled: Boolean(defaultRouteMission),
    playerInitiatedExportEnabled: true,
    playerInitiatedFolderDropEnabled: true,
    playerInitiatedShareEnabled: true,
    playerInitiatedReturnHandoffEnabled: returnHandoffMissions.length > 0,
    playerInitiatedAggregateEvidenceEnabled: Boolean(aggregateEvidenceRepository),
    aggregateEvidenceIssueTemplate: 'analytics-evidence.yml',
    aggregateEvidenceRepository,
    exportSurface: 'product-gate-sample',
    localFolderDrop: {
      mode: 'browser-selected-local-folder',
      supportedRuntime: 'showDirectoryPicker',
      filenamePattern: localDropFilenamePattern,
      fallback: 'download',
      inboxDirectory: localDropInboxDirectory,
      bridgeImport: `${localDropInboxDirectory} or AGL_LOCAL_EVENT_DROP_DIRS via ${localDropImportCommand}`,
      localDropImportCommand,
      explicitDownloadsImportCommand,
      configuredDropDirEnv: 'AGL_LOCAL_EVENT_DROP_DIRS',
      explicitDownloadsOptInRequired: true,
      noAutomaticDownloadsScan: true,
      selfDescribingExportReceipts: true,
      noExternalUpload: true,
      playerInitiatedOnly: true,
    },
    zeroPaidSpend: true,
    playerInitiatedOnly: true,
    noSyntheticEvents: true,
  },
  evidenceSprintPlan,
  runtimeEvidencePolicy: {
    status: 'active',
    surface: 'product-gate-sample-plan-card',
    localProgressSource: 'agl.analytics.events',
    campaignMatchProperties: ['acquisitionCampaign', 'campaignId'],
    progressCounters: [
      'localCampaignEvents',
      'localSampleStarts',
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
      'localSampleStarts',
      'localCollectionEvents',
      'localPromptViews',
      'localPromptActions',
      'localObservedSuccesses',
      'localFailures',
      'localAnalyticsExports',
      'localEvidenceDropReady',
      'localSampleDecisionReady',
      'eventCountAtExport',
      'unexportedEventsBeforeExport',
      'exportedEventCountBeforeExport',
      'exportCoverageStatusBeforeExport',
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
      'localSampleStarts',
      'localCollectionEvents',
      'localPromptViews',
      'localObservedSuccesses',
      'localAnalyticsExports',
      'localEvidenceDropReady',
      'localSampleDecisionReady',
      'eventCountAtExport',
      'unexportedEventsBeforeExport',
      'exportedEventCountBeforeExport',
      'exportCoverageStatusBeforeExport',
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
    publicPageHandoffTelemetry: {
      event: 'player_evidence_command_copied',
      copyTypes: ['public-gate-sample-safe-import-command', 'public-gate-sample-inbox-path'],
      controls: {
        zeroPaidSpend: true,
        noSyntheticEvents: true,
        noAutomaticDownloadsScan: true,
        localDropImportBeforeDownloads: true,
        noExternalUpload: true,
      },
    },
    defaultRouting: {
      status: defaultRouteMission ? 'active' : 'inactive',
      gateId: defaultRouteMission?.gateId ?? null,
      campaignId: defaultRouteMission?.campaignId ?? null,
      gameId: defaultRouteMission?.gameId ?? null,
      label: defaultRoute?.label ?? null,
      title: defaultRoute?.title ?? null,
      neededPromptViews: defaultRoute?.neededPromptViews ?? null,
      neededSuccesses: defaultRoute?.neededSuccesses ?? null,
      latencyDays: defaultRouteMission?.sampleTiming?.latencyDays ?? null,
      sameSessionPlayable: defaultRoute?.sameSessionPlayable ?? null,
      selectionReason: defaultRoute?.selectionReason ?? null,
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
    sampleStartPolicy: {
      status: missions.length ? 'active' : 'inactive',
      event: 'gate_sample_mission_clicked',
      runReset: 'fresh-run-key',
      appliesTo: 'runtime-sample-mission-buttons',
      telemetryProperties: [
        'runId',
        'sampleStartCreatesFreshRun',
        'directEntryRoute',
        'sameGameRestart',
        'previousGameId',
        'previousRunCompleted',
        'previousRunMoves',
        'previousRunResult',
      ],
      controls: {
        playerInitiatedOnly: true,
        noAutoPlay: true,
        noSyntheticEvents: true,
        noRuleChange: true,
        noRevenueEnablement: true,
      },
    },
    returnHandoffPolicy: {
      status: returnHandoffMissions.length ? 'active' : 'inactive',
      appliesTo: 'd1-retention-gate-sample-missions',
      eventPolicy: 'player-initiated-return-link-or-calendar-only',
      surfaces: [...new Set(returnHandoffMissions.map((mission) => mission.returnHandoff.surface))],
      telemetry: [...new Set(returnHandoffMissions.flatMap((mission) => Object.values(mission.returnHandoff.telemetry)))],
      controls: {
        zeroPaidSpend: true,
        playerInitiatedOnly: true,
        noNotificationPermissionRequest: true,
        noPushNotifications: true,
        noAccountRequired: true,
        noExternalUpload: true,
        noSyntheticEvents: true,
        noRevenueEnablement: true,
      },
    },
    controls: {
      zeroPaidSpend: true,
      localOnlyUntilCollectorConfigured: true,
      noSyntheticEvents: true,
      playerInitiatedExportOnly: true,
      sampleStartCreatesFreshRun: true,
      publicPageSelfDescribingExportReceipts: true,
      noRevenueEnablement: true,
    },
  },
  missions: missionsWithEvidence,
  commandPlan: {
    refreshPlan: 'npm run autonomous:sample-plan',
    collectAndRefresh:
      'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:retention',
    collectLocalDropsAndRefresh: collectLocalEventDropsCommand,
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
    sampleStartCreatesFreshRun: true,
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
    defaultRouteGateId: payload.summary.defaultRouteGateId,
    defaultRouteCampaignId: payload.summary.defaultRouteCampaignId,
    totalPromptViewsNeeded: payload.summary.totalPromptViewsNeeded,
  },
  runtimeEvidencePolicy: {
    defaultRouting: {
      gateId: payload.runtimeEvidencePolicy.defaultRouting.gateId,
      campaignId: payload.runtimeEvidencePolicy.defaultRouting.campaignId,
      gameId: payload.runtimeEvidencePolicy.defaultRouting.gameId,
      neededPromptViews: payload.runtimeEvidencePolicy.defaultRouting.neededPromptViews,
      neededSuccesses: payload.runtimeEvidencePolicy.defaultRouting.neededSuccesses,
      selectionReason: payload.runtimeEvidencePolicy.defaultRouting.selectionReason,
    },
  },
  defaultRoute,
  evidenceSprintPlan: {
    id: payload.evidenceSprintPlan.id,
    status: payload.evidenceSprintPlan.status,
    sprintDate: payload.evidenceSprintPlan.sprintDate,
    durationDays: payload.evidenceSprintPlan.durationDays,
    totals: payload.evidenceSprintPlan.totals,
    routeQuotas: payload.evidenceSprintPlan.routeQuotas.map((quota) => ({
      routeId: quota.routeId,
      priority: quota.priority,
      sampleRole: quota.sampleRole,
      gateId: quota.gateId,
      gameId: quota.gameId,
      title: quota.title,
      campaignId: quota.campaignId,
      playPath: quota.playPath,
      neededPromptViews: quota.neededPromptViews,
      neededObservedSuccesses: quota.neededObservedSuccesses,
      minimumCountedRunsNeeded: quota.minimumCountedRunsNeeded,
      latencyDays: quota.latencyDays,
      returnHandoffRequired: quota.returnHandoffRequired,
      returnIntentDate: quota.returnIntentDate,
      returnPath: quota.returnPath,
    })),
    controls: {
      zeroPaidSpend: payload.evidenceSprintPlan.controls.zeroPaidSpend,
      noAutomaticMessaging: payload.evidenceSprintPlan.controls.noAutomaticMessaging,
      noGateDecisionFromSprintAlone: payload.evidenceSprintPlan.controls.noGateDecisionFromSprintAlone,
      noRevenueEnablement: payload.evidenceSprintPlan.controls.noRevenueEnablement,
    },
  },
  controls: {
    zeroPaidSpend: payload.controls.zeroPaidSpend,
    sampleStartCreatesFreshRun: payload.controls.sampleStartCreatesFreshRun,
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
    returnHandoff: mission.returnHandoff,
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
  `Default route reason: ${payload.publicSamplePage.defaultRoute?.selectionReason ?? 'none'}`,
  `Prompt views needed: ${payload.summary.totalPromptViewsNeeded}`,
  `Observed successes needed: ${payload.summary.totalObservedSuccessesNeeded}`,
  `Imported gate-sample events: ${payload.summary.importedGateSampleEvents}`,
  `Inbox gate-sample events: ${payload.summary.inboxGateSampleEvents}`,
  `Supporting aggregate evidence notes: ${payload.summary.supportingAggregateEvidenceNotes}`,
  `Return handoff missions: ${payload.summary.returnHandoffMissionCount}`,
  `Evidence sprint: ${payload.evidenceSprintPlan.status}; routes ${payload.evidenceSprintPlan.totals.routes}; minimum counted runs ${payload.evidenceSprintPlan.totals.minimumCountedRunsNeeded}`,
  `Downloads scan: ${payload.summary.downloadsScanStatus}; cooling down ${payload.summary.downloadsScanCoolingDown}`,
  `Next recommended Downloads scan: ${payload.summary.downloadsScanNextRecommendedAt}`,
  `Public sample page: ${payload.publicSamplePage.path}`,
  `Safe local drop inbox: ${payload.publicSamplePage.localFolderDrop.inboxDirectory}`,
  `Safe local drop import: ${payload.publicSamplePage.localFolderDrop.localDropImportCommand}`,
  `Runtime evidence policy: ${payload.runtimeEvidencePolicy.status}`,
  '',
  '## Missions',
  '',
  ...payload.missions.map(
    (mission) =>
      `- #${mission.rank} ${mission.gateId}: ${mission.status}; evidence ${mission.evidence.status}; aggregate notes ${mission.supportingAggregateEvidence.noteCount}; ${pct(mission.current.actual)} / ${pct(mission.current.gate)}; needs ${mission.needed.promptViews} prompt view(s), ${mission.needed.successes} success(es); ${mission.playPath}`,
  ),
  '',
  '## Evidence Sprint',
  '',
  `- Status: ${payload.evidenceSprintPlan.status}`,
  `- Window: ${payload.evidenceSprintPlan.schedule.startDate} to ${payload.evidenceSprintPlan.schedule.endDate}`,
  `- Minimum counted runs: ${payload.evidenceSprintPlan.totals.minimumCountedRunsNeeded}`,
  ...payload.evidenceSprintPlan.routeQuotas.map(
    (quota) =>
      `- ${quota.routeId}: ${quota.neededPromptViews} prompt view(s), ${quota.neededObservedSuccesses} success(es), ${quota.minimumCountedRunsNeeded} counted run(s); ${quota.playPath}`,
  ),
  '',
  '## Commands',
  '',
  `- Refresh plan: ${payload.commandPlan.refreshPlan}`,
  `- Collect and refresh: ${payload.commandPlan.collectAndRefresh}`,
  `- Collect local drops and refresh: ${payload.commandPlan.collectLocalDropsAndRefresh}`,
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
${mission.returnHandoff
  ? `          <button class="returnLink" type="button" data-copy-return-campaign="${escapeHtml(mission.campaignId)}">${escapeHtml(mission.returnHandoff.copyCta)}</button>
          <button class="calendar" type="button" data-calendar-return-campaign="${escapeHtml(mission.campaignId)}">${escapeHtml(mission.returnHandoff.calendarCta)}</button>`
  : ''}${mission.returnHandoff && aggregateEvidenceRepository ? '\n' : ''}${aggregateEvidenceRepository
    ? `          <button class="evidence" type="button" data-evidence-campaign="${escapeHtml(mission.campaignId)}">Share evidence</button>`
    : ''}
        </div>
      </article>`,
  )
  .join('\n')

const recommendedMissionPanel = defaultRoute
  ? `<section class="recommended" aria-label="Recommended sample route" data-default-route-campaign="${escapeHtml(
      defaultRoute.campaignId,
    )}" data-gate-id="${escapeHtml(defaultRoute.gateId)}">
        <div class="recommendedLead">
          <p class="eyebrow">Recommended next sample</p>
          <span class="badge">${escapeHtml(sampleRoleLabel(defaultRoute))}</span>
          <h2>${escapeHtml(defaultRoute.title)}</h2>
          <p>${escapeHtml(defaultRoute.selectionReason)}</p>
        </div>
        <dl class="recommendedStats">
          <div><dt>Gate</dt><dd>${escapeHtml(defaultRoute.gateId)}</dd></div>
          <div><dt>Campaign</dt><dd>${escapeHtml(defaultRoute.campaignId)}</dd></div>
          <div><dt>Prompt views</dt><dd>${defaultRoute.neededPromptViews}</dd></div>
          <div><dt>Observed successes</dt><dd>${defaultRoute.neededSuccesses}</dd></div>
          <div><dt>Local events</dt><dd data-local-events="${escapeHtml(defaultRoute.campaignId)}">0</dd></div>
          <div><dt>Local wins</dt><dd data-local-successes="${escapeHtml(defaultRoute.campaignId)}">0</dd></div>
          <div><dt>Local debt</dt><dd data-local-debt="${escapeHtml(defaultRoute.campaignId)}">${defaultRoute.minimumPromptViewsForDecision} views / ${defaultRoute.neededSuccesses} wins</dd></div>
          <div><dt>Evidence</dt><dd>${escapeHtml(defaultRoute.evidenceStatus)}</dd></div>
        </dl>
        <div class="recommendedActions">
          <a class="play" href="${escapeHtml(runtimeHref(defaultRoute.playPath))}">Start recommended sample</a>
          <button class="share" type="button" data-share-campaign="${escapeHtml(defaultRoute.campaignId)}">Share mission</button>
          <button class="export" type="button" data-export-campaign="${escapeHtml(defaultRoute.campaignId)}">Export evidence</button>
${defaultRoute.returnHandoff
  ? `          <button class="returnLink" type="button" data-copy-return-campaign="${escapeHtml(defaultRoute.campaignId)}">${escapeHtml(defaultRoute.returnHandoff.copyCta)}</button>
          <button class="calendar" type="button" data-calendar-return-campaign="${escapeHtml(defaultRoute.campaignId)}">${escapeHtml(defaultRoute.returnHandoff.calendarCta)}</button>`
  : ''}${defaultRoute.returnHandoff && aggregateEvidenceRepository ? '\n' : ''}${aggregateEvidenceRepository
    ? `          <button class="evidence" type="button" data-evidence-campaign="${escapeHtml(defaultRoute.campaignId)}">Share evidence</button>`
    : ''}
        </div>
      </section>`
  : ''

const sprintPlanPanel = `<section class="sprint" aria-label="Evidence sprint plan" data-sprint-id="${escapeHtml(payload.evidenceSprintPlan.id)}">
        <div>
          <p class="eyebrow">Evidence sprint</p>
          <h2>${escapeHtml(payload.evidenceSprintPlan.title)}</h2>
          <p>Route quotas package the current failing gates into a zero-spend player invite sprint. Counts are lower bounds for observed telemetry, not synthetic sessions or paid traffic targets.</p>
        </div>
        <dl class="sprintStats" aria-label="Evidence sprint summary">
          <div><dt>Status</dt><dd>${escapeHtml(payload.evidenceSprintPlan.status)}</dd></div>
          <div><dt>Window</dt><dd>${escapeHtml(payload.evidenceSprintPlan.schedule.startDate)} to ${escapeHtml(payload.evidenceSprintPlan.schedule.endDate)}</dd></div>
          <div><dt>Routes</dt><dd>${payload.evidenceSprintPlan.totals.routes}</dd></div>
          <div><dt>Minimum runs</dt><dd>${payload.evidenceSprintPlan.totals.minimumCountedRunsNeeded}</dd></div>
        </dl>
        <ul class="sprintRoutes" aria-label="Evidence sprint route quotas">
          ${payload.evidenceSprintPlan.routeQuotas
            .map(
              (quota) =>
                `<li><strong>${escapeHtml(quota.label)}</strong> needs ${quota.neededPromptViews} view(s), ${quota.neededObservedSuccesses} success(es), and ${quota.minimumCountedRunsNeeded} counted run(s).${quota.followUpWindow ? ` Return ${escapeHtml(quota.followUpWindow.date ?? 'later')} via ${escapeHtml(quota.followUpWindow.path ?? quota.playPath)}.` : ''}</li>`,
            )
            .join('\n          ')}
        </ul>
      </section>`

const publicMissionEvidence = payload.missions.map((mission) => ({
  id: mission.id,
  gateId: mission.gateId,
  gameId: mission.gameId,
  title: mission.title,
  campaignId: mission.campaignId,
  playPath: mission.playPath,
  returnHandoff: mission.returnHandoff,
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
const publicHandoffEvidence = {
  safeImportCommand: payload.publicSamplePage.localFolderDrop.localDropImportCommand,
  inboxDirectory: payload.publicSamplePage.localFolderDrop.inboxDirectory,
  filenamePattern: payload.publicSamplePage.localFolderDrop.filenamePattern,
  configuredDropDirEnv: payload.publicSamplePage.localFolderDrop.configuredDropDirEnv,
  explicitDownloadsImportCommand: payload.publicSamplePage.localFolderDrop.explicitDownloadsImportCommand,
  controls: {
    zeroPaidSpend: payload.publicSamplePage.zeroPaidSpend,
    noSyntheticEvents: payload.publicSamplePage.noSyntheticEvents,
    noAutomaticDownloadsScan: payload.publicSamplePage.localFolderDrop.noAutomaticDownloadsScan,
    explicitDownloadsOptInRequired: payload.publicSamplePage.localFolderDrop.explicitDownloadsOptInRequired,
    noExternalUpload: payload.publicSamplePage.localFolderDrop.noExternalUpload,
    playerInitiatedOnly: payload.publicSamplePage.localFolderDrop.playerInitiatedOnly,
  },
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
      .recommended,
      .mission,
      .sprint,
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

      .recommended {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
        gap: 18px;
        align-items: start;
        margin-bottom: 14px;
        padding: 20px;
        border-left: 4px solid #0f766e;
      }

      .recommended h2 {
        font-size: clamp(1.45rem, 3vw, 2rem);
      }

      .recommendedLead {
        display: grid;
        gap: 10px;
      }

      .recommendedStats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .recommendedActions {
        display: flex;
        flex-wrap: wrap;
        grid-column: 1 / -1;
        gap: 10px;
      }

      .recommendedActions .play {
        min-width: min(100%, 230px);
      }

      .missions {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .sprint {
        display: grid;
        gap: 16px;
        margin: 16px 0;
        padding: 18px;
        border-left: 4px solid #275b55;
      }

      .sprintStats {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .sprintRoutes {
        display: grid;
        gap: 8px;
        margin: 0;
        padding-left: 18px;
        color: #4a5753;
        line-height: 1.5;
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
      .returnLink,
      .calendar,
      .copyCommand,
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

      .returnLink {
        background: #275b55;
        cursor: pointer;
      }

      .calendar {
        background: #b87b16;
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

      .copyCommand {
        background: #343f3b;
        cursor: pointer;
      }

      .play:focus-visible,
      .share:focus-visible,
      .export:focus-visible,
      .evidence:focus-visible,
      .returnLink:focus-visible,
      .calendar:focus-visible,
      .copyCommand:focus-visible,
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

      .handoffGrid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin: 14px 0 0;
      }

      .handoffGrid div {
        border: 1px solid #d8e0dd;
        border-radius: 7px;
        padding: 10px;
        background: #fff;
      }

      .handoffGrid dt {
        color: #4a5753;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .handoffGrid dd {
        margin: 4px 0 0;
      }

      .handoffGrid code {
        overflow-wrap: anywhere;
        font-size: 0.84rem;
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
        .recommended,
        .summary,
        .missions,
        .sprintStats,
        .handoffGrid,
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
      ${recommendedMissionPanel}
      ${sprintPlanPanel}
      <section class="missions" aria-label="Gate sample missions">
        ${missionCards}
      </section>
      <section class="handoff" aria-label="Evidence handoff">
        <h2>Evidence handoff</h2>
        <p>The app buffers anonymous gameplay events locally, forwards them when a production collector exists, and keeps revenue disabled until observed samples clear every product gate. Export buttons create the same player-initiated event drop consumed by the local bridge.</p>
        <dl class="handoffGrid" aria-label="Local evidence bridge handoff">
          <div><dt>Inbox</dt><dd><code>${escapeHtml(payload.publicSamplePage.localFolderDrop.inboxDirectory)}</code></dd></div>
          <div><dt>Files</dt><dd><code>${escapeHtml(payload.publicSamplePage.localFolderDrop.filenamePattern)}</code></dd></div>
          <div><dt>Safe import</dt><dd><code>${escapeHtml(payload.publicSamplePage.localFolderDrop.localDropImportCommand)}</code></dd></div>
        </dl>
        <div class="handoffActions">
          <button class="folder" type="button" data-connect-drop-folder>Connect drop folder</button>
          <button class="copyCommand" type="button" data-copy-import-command>Copy safe import</button>
          <button class="copyCommand" type="button" data-copy-inbox-path>Copy inbox path</button>
          <p class="dropStatus" data-drop-folder-status>Manual download fallback active.</p>
        </div>
      </section>
    </main>
    <script type="application/json" id="gate-sample-mission-data">${safeJsonScript(publicMissionEvidence)}</script>
    <script type="application/json" id="gate-sample-support-data">${safeJsonScript(publicSupportEvidence)}</script>
    <script type="application/json" id="gate-sample-handoff-data">${safeJsonScript(publicHandoffEvidence)}</script>
    <script>
      (() => {
        const bufferKey = 'agl.analytics.events'
        const localExportReceiptKey = 'agl.analytics.localExportReceipt'
        const localExportDebtThreshold = 12
        const localExportAgeThresholdHours = 24
        const missions = JSON.parse(document.getElementById('gate-sample-mission-data')?.textContent || '[]')
        const support = JSON.parse(document.getElementById('gate-sample-support-data')?.textContent || '{}')
        const handoff = JSON.parse(document.getElementById('gate-sample-handoff-data')?.textContent || '{}')
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
          try {
            window.localStorage?.setItem(bufferKey, JSON.stringify(events.slice(-300)))
          } catch {
            // Some embedded browsers disable localStorage; player actions should still complete.
          }
        }

        const readLocalExportReceipt = () => {
          try {
            const raw = window.localStorage.getItem(localExportReceiptKey)
            const parsed = raw ? JSON.parse(raw) : null
            const exportedEventCount = Number(parsed?.exportedEventCount)

            if (!parsed || typeof parsed.exportedAt !== 'string') {
              return null
            }

            return {
              exportedAt: parsed.exportedAt,
              exportSurface: typeof parsed.exportSurface === 'string' ? parsed.exportSurface : 'manual',
              exportedEventCount: Number.isFinite(exportedEventCount) ? Math.max(0, exportedEventCount) : 0,
              latestEventId: typeof parsed.latestEventId === 'string' ? parsed.latestEventId : null,
              latestEventAt: typeof parsed.latestEventAt === 'string' ? parsed.latestEventAt : null,
            }
          } catch {
            return null
          }
        }

        const localExportCoverage = (events) => {
          const receipt = readLocalExportReceipt()
          const latestEvent = events.at(-1) || null
          const latestEventIndex =
            receipt?.latestEventId ? events.findIndex((event) => event.id === receipt.latestEventId) : -1
          const unexportedEvents = receipt
            ? latestEventIndex >= 0
              ? Math.max(0, events.length - latestEventIndex - 1)
              : Math.max(0, events.length - receipt.exportedEventCount)
            : events.length
          const exportedEventCount = Math.max(0, events.length - unexportedEvents)
          const exportedAtMs = receipt ? Date.parse(receipt.exportedAt) : Number.NaN
          const exportAgeHours = Number.isFinite(exportedAtMs)
            ? Math.max(0, (Date.now() - exportedAtMs) / (60 * 60 * 1000))
            : null
          const exportSuggested =
            !receipt ||
            unexportedEvents >= localExportDebtThreshold ||
            (typeof exportAgeHours === 'number' && exportAgeHours >= localExportAgeThresholdHours)
          const status = !receipt ? 'waiting-for-first-export' : exportSuggested ? 'export-due' : 'fresh'

          return {
            totalEvents: events.length,
            exportedEventCount,
            unexportedEvents,
            coverageRatio: events.length ? exportedEventCount / events.length : receipt ? 1 : 0,
            status,
            latestEventId: latestEvent?.id || null,
            latestEventAt: latestEvent?.createdAt || null,
            exportDebtThreshold: localExportDebtThreshold,
            exportAgeThresholdHours: localExportAgeThresholdHours,
          }
        }

        const markLocalAnalyticsExported = (events, exportSurface) => {
          const latestEvent = events.at(-1) || null

          try {
            window.localStorage.setItem(
              localExportReceiptKey,
              JSON.stringify({
                exportedAt: new Date().toISOString(),
                exportSurface,
                exportedEventCount: events.length,
                latestEventId: latestEvent?.id || null,
                latestEventAt: latestEvent?.createdAt || null,
              }),
            )
          } catch {
            // Local export receipts are useful debt markers, but exports remain valid without storage.
          }
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
          const sampleStarts = eventNames(scoped, ['gate_sample_mission_clicked'])
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
            sampleStarts,
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

        const sanitizeEventDropFileNamePart = (value) => {
          const cleaned = String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80)

          return cleaned || 'manual'
        }

        const eventDropFileName = (exportSurface) =>
          'player-events-' +
          new Date().toISOString().replace(/[:.]/g, '-') +
          '-' +
          sanitizeEventDropFileNamePart(exportSurface) +
          '.json'

        const missionReturnUrl = (mission) =>
          mission.returnHandoff?.returnPath
            ? new URL(mission.returnHandoff.returnPath, window.location.href).toString()
            : null

        const formatCalendarDate = (isoDate) => String(isoDate || '').replaceAll('-', '')
        const nextIsoDate = (isoDate) => {
          const date = new Date(\`\${isoDate}T00:00:00.000Z\`)
          date.setUTCDate(date.getUTCDate() + 1)
          return date.toISOString().slice(0, 10)
        }
        const formatCalendarTimestamp = () =>
          new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace(/\\.\\d{3}Z$/, 'Z')
        const escapeCalendarText = (value) =>
          String(value || '')
            .replaceAll('\\\\', '\\\\\\\\')
            .replaceAll('\\n', '\\\\n')
            .replaceAll(';', '\\\\;')
            .replaceAll(',', '\\\\,')

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

        const writeDropFile = async (events, fileName) => {
          if (!dropDirectoryHandle) {
            return false
          }

          const granted = await ensureDropFolderPermission(dropDirectoryHandle)

          if (!granted) {
            setDropFolderStatus('Drop folder permission needed; export will download instead.')
            return false
          }

          try {
            const fileHandle = await dropDirectoryHandle.getFileHandle(fileName, {
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

        const copyHandoffText = async ({ copyType, text, statusMessage }) => {
          let method = 'clipboard'
          let succeeded = false

          if (navigator.clipboard?.writeText && text) {
            try {
              await navigator.clipboard.writeText(text)
              succeeded = true
            } catch {
              method = 'clipboard_unavailable'
            }
          } else {
            method = 'unsupported'
          }

          writeEvents([
            ...readEvents(),
            {
              id: createId(),
              name: 'player_evidence_command_copied',
              properties: {
                copyType,
                method,
                succeeded,
                commandLength: String(text || '').length,
                surface: 'public-gate-sample-page',
                channel: 'product-gate-sample',
                zeroPaidSpend: handoff.controls?.zeroPaidSpend === true,
                noSyntheticEvents: handoff.controls?.noSyntheticEvents === true,
                noAutomaticDownloadsScan: handoff.controls?.noAutomaticDownloadsScan === true,
                explicitDownloadsOptInRequired: handoff.controls?.explicitDownloadsOptInRequired === true,
                localDropImportBeforeDownloads: true,
                noExternalUpload: handoff.controls?.noExternalUpload === true,
                playerInitiatedOnly: handoff.controls?.playerInitiatedOnly === true,
              },
              createdAt: new Date().toISOString(),
            },
          ])
          setDropFolderStatus(succeeded ? statusMessage : 'Clipboard unavailable; use the visible handoff values.')
        }

        const downloadEvents = (events, fileName) => {
          const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = fileName
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

        const copyMissionReturnLink = async (mission) => {
          const handoff = mission.returnHandoff
          const returnUrl = missionReturnUrl(mission)

          if (!handoff || !returnUrl) {
            return
          }

          let method = 'unsupported'
          let succeeded = false

          if (navigator.clipboard?.writeText) {
            method = 'clipboard'

            try {
              await navigator.clipboard.writeText(returnUrl)
              succeeded = true
            } catch {
              method = 'clipboard_unavailable'
            }
          }

          const events = readEvents()
          const returnEvent = {
            id: createId(),
            name: handoff.telemetry?.copied || 'daily_return_link_copied',
            properties: {
              surface: handoff.surface,
              channel: 'product-gate-sample',
              campaignId: mission.campaignId,
              gateId: mission.gateId,
              gameId: mission.gameId,
              acquisitionCampaign: mission.campaignId,
              acquisitionSource: 'gate_sample',
              acquisitionChannel: 'product-gate-sample',
              challengeDate: handoff.challengeDate,
              intentDate: handoff.intentDate,
              returnUrl,
              method,
              succeeded,
              zeroPaidSpend: true,
              playerInitiatedOnly: true,
              noNotificationPermissionRequest: true,
              noPushNotifications: true,
              noAccountRequired: true,
              noExternalUpload: true,
              noSyntheticEvents: mission.controls.noSyntheticEvents,
              noRevenueEnablement: mission.controls.noRevenueEnablement,
            },
            createdAt: new Date().toISOString(),
          }

          writeEvents([...events, returnEvent])
          renderProgress()
        }

        const downloadMissionReturnCalendar = (mission) => {
          const handoff = mission.returnHandoff
          const returnUrl = missionReturnUrl(mission)

          if (!handoff || !returnUrl) {
            return
          }

          const startDate = formatCalendarDate(handoff.intentDate)
          const endDate = formatCalendarDate(nextIsoDate(handoff.intentDate))
          const calendar = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Autonomous Game Lab//Gate Sample Return//EN',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            \`UID:agl-gate-sample-return-\${handoff.intentDate}-\${mission.gameId}@autonomous-game-lab\`,
            \`DTSTAMP:\${formatCalendarTimestamp()}\`,
            \`DTSTART;VALUE=DATE:\${startDate}\`,
            \`DTEND;VALUE=DATE:\${endDate}\`,
            \`SUMMARY:\${escapeCalendarText(\`Play \${mission.title}\`)}\`,
            \`DESCRIPTION:\${escapeCalendarText(\`Open the measured return route: \${returnUrl}\`)}\`,
            \`URL:\${returnUrl}\`,
            'END:VEVENT',
            'END:VCALENDAR',
            '',
          ].join('\\r\\n')
          const calendarObjectUrl = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }))
          const anchor = document.createElement('a')
          anchor.href = calendarObjectUrl
          anchor.download = \`agl-return-\${handoff.intentDate}.ics\`
          document.body.append(anchor)
          anchor.click()
          anchor.remove()
          window.setTimeout(() => URL.revokeObjectURL(calendarObjectUrl), 0)

          const events = readEvents()
          const returnEvent = {
            id: createId(),
            name: handoff.telemetry?.calendarDownloaded || 'daily_return_calendar_downloaded',
            properties: {
              surface: handoff.surface,
              channel: 'product-gate-sample',
              campaignId: mission.campaignId,
              gateId: mission.gateId,
              gameId: mission.gameId,
              acquisitionCampaign: mission.campaignId,
              acquisitionSource: 'gate_sample',
              acquisitionChannel: 'product-gate-sample',
              challengeDate: handoff.challengeDate,
              intentDate: handoff.intentDate,
              returnUrl,
              method: 'calendar-download',
              fileExtension: handoff.calendarFileExtension || '.ics',
              zeroPaidSpend: true,
              playerInitiatedOnly: true,
              noNotificationPermissionRequest: true,
              noPushNotifications: true,
              noAccountRequired: true,
              noExternalUpload: true,
              noSyntheticEvents: mission.controls.noSyntheticEvents,
              noRevenueEnablement: mission.controls.noRevenueEnablement,
            },
            createdAt: new Date().toISOString(),
          }

          writeEvents([...events, returnEvent])
          renderProgress()
        }

        const renderProgress = () => {
          const events = readEvents()

          for (const mission of missions) {
            const progress = missionProgress(mission, events)
            const localEvents = document.querySelectorAll(\`[data-local-events="\${mission.campaignId}"]\`)
            const localSuccesses = document.querySelectorAll(\`[data-local-successes="\${mission.campaignId}"]\`)
            const localDebt = document.querySelectorAll(\`[data-local-debt="\${mission.campaignId}"]\`)

            localEvents.forEach((element) => {
              element.textContent = String(progress.campaignEvents)
            })
            localSuccesses.forEach((element) => {
              element.textContent = String(progress.successes)
            })
            localDebt.forEach((element) => {
              element.textContent = progress.sampleDecisionReady
                ? 'decision-ready'
                : \`\${progress.promptViewsRemaining} views / \${progress.successesRemaining} wins\`
            })
          }
        }

        const exportMission = async (mission) => {
          const events = readEvents()
          const coverageBeforeExport = localExportCoverage(events)
          const progress = missionProgress(mission, events)
          const folderPreferred = Boolean(dropDirectoryHandle)
          const exportFileName = eventDropFileName('product-gate-sample')
          const exportEvent = {
            id: createId(),
            name: 'analytics_exported',
            properties: {
              destination: folderPreferred ? 'local_folder' : 'local_file',
              exportSurface: 'product-gate-sample',
              exportSurfaceDetail: 'public-gate-sample-page',
              eventDropFileName: exportFileName,
              eventDropMode: folderPreferred ? 'folder' : 'download',
              eventDropFolderStatus: folderPreferred ? 'connected' : 'not-connected',
              gateId: mission.gateId,
              gameId: mission.gameId,
              campaignId: mission.campaignId,
              promptViewsNeeded: mission.needed.promptViews,
              observedSuccessesNeeded: mission.needed.successes,
              localCampaignEvents: progress.campaignEvents,
              localSampleStarts: progress.sampleStarts,
              localCollectionEvents: progress.collectionEvents,
              localPromptViews: progress.promptViews,
              localObservedSuccesses: progress.successes,
              localAnalyticsExports: progress.analyticsExports,
              localPromptViewsRemaining: progress.promptViewsRemaining,
              localSuccessesRemaining: progress.successesRemaining,
              localEvidenceDropReady: progress.evidenceDropReady,
              localSampleDecisionReady: progress.sampleDecisionReady,
              eventCountAtExport: events.length + 1,
              unexportedEventsBeforeExport: coverageBeforeExport.unexportedEvents,
              exportedEventCountBeforeExport: coverageBeforeExport.exportedEventCount,
              exportCoverageRatioBeforeExport: Math.round(coverageBeforeExport.coverageRatio * 1000) / 1000,
              exportCoverageStatusBeforeExport: coverageBeforeExport.status,
              exportDebtThreshold: coverageBeforeExport.exportDebtThreshold,
              exportAgeThresholdHours: coverageBeforeExport.exportAgeThresholdHours,
              noExternalUpload: true,
              zeroPaidSpend: true,
              noSyntheticEvents: mission.controls.noSyntheticEvents,
              noRevenueEnablement: mission.controls.noRevenueEnablement,
            },
            createdAt: new Date().toISOString(),
          }
          const nextEvents = [...events, exportEvent]
          const wroteToFolder = await writeDropFile(nextEvents, exportFileName)

          if (wroteToFolder) {
            markLocalAnalyticsExported(nextEvents, 'product-gate-sample')
            writeEvents([
              ...nextEvents,
              {
                id: createId(),
                name: 'local_event_drop_folder_exported',
                properties: {
                  surface: 'public-gate-sample-page',
                  channel: 'product-gate-sample',
                  campaignId: mission.campaignId,
                  gateId: mission.gateId,
                  gameId: mission.gameId,
                  exportSurface: 'product-gate-sample',
                  eventDropFileName: exportFileName,
                  eventDropMode: 'folder',
                  eventDropFolderStatus: 'connected',
                  eventCountAtExport: nextEvents.length,
                  noExternalUpload: true,
                  noPiiRequired: true,
                  playerInitiatedOnly: true,
                  zeroPaidSpend: true,
                  noSyntheticEvents: mission.controls.noSyntheticEvents,
                  noRevenueEnablement: mission.controls.noRevenueEnablement,
                },
                createdAt: new Date().toISOString(),
              },
            ])
            renderProgress()
            return
          }

          let fallbackEvents = nextEvents

          if (folderPreferred) {
            exportEvent.properties.destination = 'local_file'
            exportEvent.properties.eventDropMode = folderPreferred ? 'folder-failed-download' : 'download'
            exportEvent.properties.eventDropFolderStatus = folderPreferred ? 'failed' : 'not-connected'
            fallbackEvents = [
              ...nextEvents,
              {
                id: createId(),
                name: 'local_event_drop_folder_failed',
                properties: {
                  surface: 'public-gate-sample-page',
                  channel: 'product-gate-sample',
                  campaignId: mission.campaignId,
                  gateId: mission.gateId,
                  gameId: mission.gameId,
                  reason: 'write-failed-download-fallback',
                  exportSurface: 'product-gate-sample',
                  eventDropFileName: exportFileName,
                  eventDropMode: 'folder-failed-download',
                  noExternalUpload: true,
                  noPiiRequired: true,
                  playerInitiatedOnly: true,
                  zeroPaidSpend: true,
                  noSyntheticEvents: mission.controls.noSyntheticEvents,
                  noRevenueEnablement: mission.controls.noRevenueEnablement,
                },
                createdAt: new Date().toISOString(),
              },
            ]
          }

          downloadEvents(fallbackEvents, exportFileName)
          writeEvents(fallbackEvents)
          markLocalAnalyticsExported(fallbackEvents, 'product-gate-sample')
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
          const gameField = \`\${mission.title} (\${mission.gameId}; \${mission.gateId}; \${mission.campaignId})\`
          const evidenceWindow = evidenceWindowFor(scoped)
          const summary = \`Aggregate-only gate sample summary from \${scoped.length} local event(s) for \${mission.campaignId}. Raw event rows and identifiers remain on the device. Aggregate evidence supports review but does not pass product gates by itself.\`
          const body = [
            'Support type: analytics-evidence',
            'Game or mission: ' + gameField,
            'Evidence window: ' + evidenceWindow,
            'Aggregate starts: ' + counts.starts,
            'Aggregate completions: ' + counts.completions,
            'Aggregate replays: ' + counts.replays,
            'Aggregate D1 eligible players: ' + counts.d1Eligible,
            'Aggregate D1 retained players: ' + counts.d1Retained,
            'What changed or looked unusual: ' + summary,
            'Sharing check: aggregate counts only; no raw analytics exports, event rows, private identifiers, or uploaded event files.',
          ].join('\\n')

          url.searchParams.set('template', support.template || 'analytics-evidence.yml')
          url.searchParams.set('title', \`[Evidence] \${mission.title} gate sample aggregate counts\`)
          url.searchParams.set('game', gameField)
          url.searchParams.set('window', evidenceWindow)
          url.searchParams.set('starts', String(counts.starts))
          url.searchParams.set('completions', String(counts.completions))
          url.searchParams.set('replays', String(counts.replays))
          url.searchParams.set('d1_eligible', String(counts.d1Eligible))
          url.searchParams.set('d1_retained', String(counts.d1Retained))
          url.searchParams.set('summary', summary)
          url.searchParams.set('body', body)

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
              parseableBodyFallback: true,
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

        document.querySelector('[data-copy-import-command]')?.addEventListener('click', () => {
          void copyHandoffText({
            copyType: 'public-gate-sample-safe-import-command',
            text: handoff.safeImportCommand,
            statusMessage: 'Safe import command copied.',
          })
        })

        document.querySelector('[data-copy-inbox-path]')?.addEventListener('click', () => {
          void copyHandoffText({
            copyType: 'public-gate-sample-inbox-path',
            text: handoff.inboxDirectory,
            statusMessage: 'Inbox path copied.',
          })
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

        document.querySelectorAll('[data-copy-return-campaign]').forEach((button) => {
          button.addEventListener('click', () => {
            const mission = missions.find((item) => item.campaignId === button.getAttribute('data-copy-return-campaign'))

            if (mission) {
              void copyMissionReturnLink(mission)
            }
          })
        })

        document.querySelectorAll('[data-calendar-return-campaign]').forEach((button) => {
          button.addEventListener('click', () => {
            const mission = missions.find(
              (item) => item.campaignId === button.getAttribute('data-calendar-return-campaign'),
            )

            if (mission) {
              downloadMissionReturnCalendar(mission)
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
