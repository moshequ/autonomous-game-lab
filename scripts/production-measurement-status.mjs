import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const publicDir = path.join(root, 'public')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'production-measurement-status.json')
const outputTsPath = path.join(root, 'src', 'data', 'productionMeasurementStatus.ts')
const publicJsonPath = path.join(publicDir, 'measurement-status.json')
const publicHtmlPath = path.join(publicDir, 'measurement-status.html')
const publicAnalyticsUnlockJsonPath = path.join(publicDir, 'analytics-unlock.json')
const publicAnalyticsUnlockHtmlPath = path.join(publicDir, 'analytics-unlock.html')
const reportPath = path.join(reportsDir, 'production-measurement-status-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const publicRouteHref = (value, fallback = './') => {
  const candidate = String(value ?? fallback)
  if (/^https?:\/\//.test(candidate)) {
    return candidate
  }
  return candidate.startsWith('/') ? `.${candidate}` : candidate
}

const productionEnvironment = await readJson(path.join(dataDir, 'production-environment.json'))
const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const localEventBridge = await readJson(path.join(dataDir, 'local-event-bridge.json'))
const supportChannel = await readJson(path.join(dataDir, 'support-channel.json'))
const supportFeedback = await readJson(path.join(dataDir, 'support-feedback.json'))
const productGateSamplePlan = await readJson(path.join(dataDir, 'product-gate-sample-plan.json'))
const productGateRecovery = await readOptionalJson(path.join(dataDir, 'product-gate-recovery.json'), {
  status: 'missing',
  summary: {},
  priorities: [],
  publicRoutes: {
    productGateRecovery: '/product-gate-recovery.html',
    productGateRecoveryJson: '/product-gate-recovery.json',
  },
  controls: {},
})
const trafficSeeding = await readJson(path.join(dataDir, 'traffic-seeding.json'))
const productionBlockerHandoff = await readJson(path.join(dataDir, 'production-blocker-handoff.json'))
const ownerUnlockPreflight = await readOptionalJson(path.join(dataDir, 'owner-unlock-preflight.json'), {
  status: 'missing',
  readyForSetup: false,
  summary: { totalInputs: 0, readyInputs: 0, missingInputs: 0, invalidInputs: 0 },
  missingInputs: [],
  invalidInputs: [],
  commands: {},
  controls: {},
})
const eventCollectorSmoke = await readJson(path.join(dataDir, 'event-collector-smoke.json'))
const eventCollectorDeployment = await readOptionalJson(path.join(dataDir, 'event-collector-deployment.json'), {
  status: 'missing',
  provider: 'cloudflare-worker-r2',
  costPosture: 'free-tier-friendly-no-paid-traffic',
  worker: {},
  workflow: {},
  environment: {},
  smoke: {},
  checks: [],
  setupRequiredOnce: [],
  commands: {},
})
const postDeployArtifactSync = await readOptionalJson(path.join(dataDir, 'post-deploy-artifact-sync.json'), {
  status: 'missing',
  live: {},
})
const publicOwnerRuntimeConfig = await readOptionalJson(path.join(publicDir, 'owner-runtime-config.json'), {
  id: 'owner-runtime-config',
  status: 'missing',
  configuredPublicInputNames: [],
  defaultedPublicInputNames: [],
  missingPublicInputNames: [],
  invalidPublicInputNames: [],
  analytics: {
    provider: null,
    posthogConfigured: false,
  },
  support: {
    configured: false,
  },
  controls: {},
})

const browserPosthogConfigured = productionEnvironment.analytics?.browserPosthogConfigured === true
const browserCollectorConfigured = productionEnvironment.analytics?.eventCollector?.browserConfigured === true
const serverPosthogConfigured = productionEnvironment.analytics?.serverPosthogConfigured === true
const serverCollectorConfigured = productionEnvironment.analytics?.eventCollector?.serverExportConfigured === true
const browserForwardingConfigured = browserPosthogConfigured || browserCollectorConfigured
const autonomousRollupsConfigured = serverPosthogConfigured || serverCollectorConfigured
const supportReady =
  supportChannel.status === 'support-channel-ready' &&
  supportChannel.repository?.publicIssuesReady === true &&
  supportChannel.controls?.analyticsEvidenceAggregateOnly === true
const localEvidenceReady =
  supportReady &&
  ['bridge-waiting-for-export', 'bridge-ready', 'bridge-imported-events'].includes(localEventBridge.status)
const productionAnalyticsHandoff =
  (productionBlockerHandoff.handoffItems ?? []).find((item) => item.id === 'production-analytics-browser') ?? null
const rollupHandoff =
  (productionBlockerHandoff.handoffItems ?? []).find((item) => item.id === 'autonomous-rollup-credentials') ?? null
const primaryMission = productGateSamplePlan.missions?.[0] ?? null
const fastestMission =
  (productGateSamplePlan.missions ?? []).find(
    (mission) => mission.campaignId === productGateSamplePlan.publicSamplePage?.fastestCampaignId,
  ) ??
  (productGateSamplePlan.missions ?? []).find((mission) => mission.gateId === productGateSamplePlan.summary?.fastestGateId) ??
  (productGateSamplePlan.missions ?? []).find((mission) => String(mission.sampleRole ?? '').includes('fastest-validation')) ??
  null
const numberOrZero = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const arrayOrEmpty = (value) => (Array.isArray(value) ? value : [])
const sanitizeOwnerInputValidation = (validation) =>
  validation
    ? {
        kind: validation.kind ?? null,
        status: validation.status ?? null,
        failedCheckIds: arrayOrEmpty(validation.failedCheckIds),
        detail: validation.detail ?? null,
      }
    : null
const sanitizeOwnerInputPreflightItem = (input) => ({
  kind: input?.kind ?? null,
  unlockId: input?.unlockId ?? null,
  repositoryName: input?.repositoryName ?? null,
  envName: input?.envName ?? null,
  ready: input?.ready === true,
  configuredInRepository: input?.configuredInRepository === true,
  availableLocally: input?.availableLocally === true,
  availableInLocalEnvFile: input?.availableInLocalEnvFile === true,
  validation: sanitizeOwnerInputValidation(input?.validation),
  command: input?.command ?? null,
})
const sanitizeOwnerMissingInput = (input) => ({
  kind: input?.kind ?? null,
  unlockId: input?.unlockId ?? null,
  repositoryName: input?.repositoryName ?? null,
  envName: input?.envName ?? null,
  command: input?.command ?? null,
})
const sanitizeCombinedOwnerInputPreflight = (preflight) =>
  preflight
    ? {
        id: preflight.id ?? null,
        title: preflight.title ?? null,
        status: preflight.status ?? null,
        readyForSetup: preflight.readyForSetup === true,
        localEnvFile: preflight.localEnvFile ?? null,
        unlockIds: arrayOrEmpty(preflight.unlockIds),
        analyticsPathId: preflight.analyticsPathId ?? null,
        supportUnlockId: preflight.supportUnlockId ?? null,
        summary: preflight.summary ?? {},
        missingInputNames: arrayOrEmpty(preflight.missingInputNames),
        localEnvTemplateLines: arrayOrEmpty(preflight.localEnvTemplateLines),
        shellExportTemplateLines: arrayOrEmpty(preflight.shellExportTemplateLines),
        inputs: arrayOrEmpty(preflight.inputs).map(sanitizeOwnerInputPreflightItem),
        missingInputs: arrayOrEmpty(preflight.missingInputs).map(sanitizeOwnerMissingInput),
        invalidInputs: arrayOrEmpty(preflight.invalidInputs).map(sanitizeOwnerInputPreflightItem),
        commands: preflight.commands ?? {},
        controls: preflight.controls ?? {},
        unavailableReasons: arrayOrEmpty(preflight.unavailableReasons),
      }
    : null
const trafficSampleNextRoute = trafficSeeding.sampleNextRoute ?? {}
const sampleNextRoute = {
  status: trafficSampleNextRoute.status ?? (primaryMission ? 'armed' : 'missing'),
  path: trafficSampleNextRoute.path ?? '/sample-next.html',
  jsonPath: trafficSampleNextRoute.jsonPath ?? '/sample-next.json',
  targetCampaignId: trafficSampleNextRoute.targetCampaignId ?? primaryMission?.campaignId ?? null,
  targetGateId: trafficSampleNextRoute.targetGateId ?? primaryMission?.gateId ?? null,
  targetGameId: trafficSampleNextRoute.targetGameId ?? primaryMission?.gameId ?? null,
  targetTitle: trafficSampleNextRoute.targetTitle ?? primaryMission?.title ?? null,
  targetPath: trafficSampleNextRoute.targetPath ?? primaryMission?.playPath ?? null,
  fallbackPath: trafficSampleNextRoute.fallbackPath ?? '/gate-sample.html',
  costUsd: numberOrZero(trafficSampleNextRoute.costUsd),
  guardrails: {
    playerInitiatedOnly: trafficSampleNextRoute.playerInitiatedOnly !== false,
    noAutomatedExternalPosting: trafficSampleNextRoute.noAutomatedExternalPosting !== false,
    noPaidPromotion: trafficSampleNextRoute.noPaidPromotion !== false,
    noSyntheticEvents: trafficSampleNextRoute.noSyntheticEvents !== false,
    noRevenueEnablement: trafficSampleNextRoute.noRevenueEnablement !== false,
  },
}
const trafficSampleFastestRoute = trafficSeeding.sampleFastestRoute ?? {}
const sampleFastestRoute = {
  status: trafficSampleFastestRoute.status ?? (fastestMission ? 'armed' : 'missing'),
  path: trafficSampleFastestRoute.path ?? '/sample-fastest.html',
  jsonPath: trafficSampleFastestRoute.jsonPath ?? '/sample-fastest.json',
  targetCampaignId: trafficSampleFastestRoute.targetCampaignId ?? fastestMission?.campaignId ?? null,
  targetGateId: trafficSampleFastestRoute.targetGateId ?? fastestMission?.gateId ?? null,
  targetGameId: trafficSampleFastestRoute.targetGameId ?? fastestMission?.gameId ?? null,
  targetTitle: trafficSampleFastestRoute.targetTitle ?? fastestMission?.title ?? null,
  targetPath: trafficSampleFastestRoute.targetPath ?? fastestMission?.playPath ?? null,
  fallbackPath: trafficSampleFastestRoute.fallbackPath ?? '/gate-sample.html',
  costUsd: numberOrZero(trafficSampleFastestRoute.costUsd),
  returnHandoff: trafficSampleFastestRoute.returnHandoff ?? null,
  guardrails: {
    playerInitiatedOnly: trafficSampleFastestRoute.playerInitiatedOnly !== false,
    noAutomatedExternalPosting: trafficSampleFastestRoute.noAutomatedExternalPosting !== false,
    noPaidPromotion: trafficSampleFastestRoute.noPaidPromotion !== false,
    noSyntheticEvents: trafficSampleFastestRoute.noSyntheticEvents !== false,
    noRevenueEnablement: trafficSampleFastestRoute.noRevenueEnablement !== false,
  },
}
const activePath = browserCollectorConfigured
  ? 'first-party-event-collector'
  : browserPosthogConfigured
    ? 'posthog-browser'
    : 'local-browser-buffer'
const status = browserForwardingConfigured
  ? autonomousRollupsConfigured
    ? 'production-measurement-configured'
    : 'production-measurement-browser-ready'
  : localEvidenceReady
    ? 'production-measurement-local-intake-ready'
    : 'production-measurement-blocked'
const nextAction = browserForwardingConfigured
  ? autonomousRollupsConfigured
    ? 'Keep live rollups and product gates refreshed from production data.'
    : 'Connect a server export credential before scheduled owner loops can roll up production behavior.'
  : localEvidenceReady
    ? 'Use the player-initiated local evidence route until PostHog or the first-party collector is configured.'
    : 'Repair the support or local event bridge route before relying on production evidence.'
const aggregateEvidenceNotes = Array.isArray(supportFeedback.aggregateEvidenceNotes)
  ? supportFeedback.aggregateEvidenceNotes
  : []
const aggregateEvidenceSummary = supportFeedback.summary ?? {}
const supportingAggregateEvidenceNotes = numberOrZero(productGateSamplePlan.summary?.supportingAggregateEvidenceNotes)
const aggregateEvidenceIssueUrl = supportChannel.links?.analyticsEvidenceUrl ?? null
const aggregateEvidencePrivacyControls = {
  aggregateEvidenceDoesNotPassGates: true,
  manualReviewRequiredForGateDecisions: true,
  noRawEventsStored: true,
  noRawEventRowsAccepted: supportFeedback.controls?.noRawEventRowsAccepted === true,
  noAttachmentsDownloaded: supportFeedback.controls?.noAttachmentsDownloaded === true,
  publicAggregateOnly: true,
  playerInitiatedOnly: true,
  zeroPaidSpend: true,
  noAutomaticPublicUpload: true,
  measurementPageExportsLocalEventDrops: true,
  noRevenueEnablement: true,
}
const sumAggregateField = (notes, field) =>
  notes.reduce((sum, note) => sum + (typeof note.counts?.[field] === 'number' ? note.counts[field] : 0), 0)
const summarizeAggregateNote = (note) => ({
  number: note.number ?? null,
  status: note.status ?? 'unknown',
  url: note.url ?? null,
  gameId: note.gameId ?? null,
  gameTitle: note.gameTitle ?? null,
  gateId: note.gateId ?? null,
  campaignId: note.campaignId ?? null,
  evidenceWindow: note.evidenceWindow ?? null,
  summary: note.summary ?? null,
  counts: {
    starts: numberOrZero(note.counts?.starts),
    completions: numberOrZero(note.counts?.completions),
    replays: numberOrZero(note.counts?.replays),
    d1Eligible: numberOrZero(note.counts?.d1Eligible),
    d1Retained: numberOrZero(note.counts?.d1Retained),
  },
  rates: {
    completionRate: typeof note.rates?.completionRate === 'number' ? note.rates.completionRate : null,
    replayRate: typeof note.rates?.replayRate === 'number' ? note.rates.replayRate : null,
    d1RetentionRate: typeof note.rates?.d1RetentionRate === 'number' ? note.rates.d1RetentionRate : null,
  },
  privacy: {
    publicAggregateOnly: note.privacy?.publicAggregateOnly === true,
    rawEventsAccepted: note.privacy?.rawEventsAccepted === true,
    rawEventRowsStored: note.privacy?.rawEventRowsStored === true,
    attachmentsDownloaded: note.privacy?.attachmentsDownloaded === true,
  },
})
const aggregateEvidenceCampaigns = [
  ...aggregateEvidenceNotes.reduce((groups, note) => {
    const campaignId = note.campaignId ?? 'unassigned-campaign'
    const existing = groups.get(campaignId) ?? {
      campaignId,
      noteCount: 0,
      gameIds: new Set(),
      gateIds: new Set(),
      starts: 0,
      completions: 0,
      replays: 0,
      d1Eligible: 0,
      d1Retained: 0,
      topIssues: [],
    }

    existing.noteCount += 1
    existing.starts += numberOrZero(note.counts?.starts)
    existing.completions += numberOrZero(note.counts?.completions)
    existing.replays += numberOrZero(note.counts?.replays)
    existing.d1Eligible += numberOrZero(note.counts?.d1Eligible)
    existing.d1Retained += numberOrZero(note.counts?.d1Retained)
    if (note.gameId) {
      existing.gameIds.add(note.gameId)
    }
    if (note.gateId) {
      existing.gateIds.add(note.gateId)
    }
    if (existing.topIssues.length < 3) {
      existing.topIssues.push({ number: note.number ?? null, url: note.url ?? null, status: note.status ?? 'unknown' })
    }
    groups.set(campaignId, existing)

    return groups
  }, new Map()).values(),
]
  .map((campaign) => ({
    ...campaign,
    gameIds: [...campaign.gameIds],
    gateIds: [...campaign.gateIds],
  }))
  .sort((left, right) => right.noteCount - left.noteCount || right.starts - left.starts)
const aggregateEvidenceMissions = (productGateSamplePlan.missions ?? [])
  .map((mission) => {
    const evidence = mission.supportingAggregateEvidence ?? {}

    return {
      id: mission.id,
      title: mission.title,
      gateId: mission.gateId,
      gameId: mission.gameId,
      campaignId: mission.campaignId,
      evidenceStatus: mission.evidence?.status ?? 'waiting',
      aggregateEvidenceStatus: evidence.status ?? 'none',
      matchScope: evidence.matchScope ?? 'none',
      noteCount: numberOrZero(evidence.noteCount),
      starts: numberOrZero(evidence.starts),
      completions: numberOrZero(evidence.completions),
      replays: numberOrZero(evidence.replays),
      d1Eligible: numberOrZero(evidence.d1Eligible),
      d1Retained: numberOrZero(evidence.d1Retained),
      gateDecisionEligible: evidence.gateDecisionEligible === true,
      manualReviewRequired: evidence.manualReviewRequired !== false,
      topIssues: Array.isArray(evidence.topIssues) ? evidence.topIssues.slice(0, 3) : [],
    }
  })
  .filter((mission) => mission.noteCount > 0)
  .sort((left, right) => right.noteCount - left.noteCount || right.starts - left.starts)
const publicEvidenceHandoffStatus = aggregateEvidenceNotes.length
  ? 'aggregate-evidence-ready-for-review'
  : supportReady
    ? 'awaiting-player-initiated-aggregate-notes'
    : 'aggregate-evidence-channel-blocked'
const missionByCampaignId = new Map((productGateSamplePlan.missions ?? []).map((mission) => [mission.campaignId, mission]))
const sampleMissionForRoute = (route) =>
  missionByCampaignId.get(route.targetCampaignId) ??
  (productGateSamplePlan.missions ?? []).find(
    (mission) => mission.gateId === route.targetGateId && mission.gameId === route.targetGameId,
  ) ??
  null
const playerEvidenceInviteRoute = ({ id, title, route, mission, priority }) => ({
  id,
  title,
  status: route.status,
  path: route.path,
  jsonPath: route.jsonPath,
  targetCampaignId: route.targetCampaignId,
  targetGateId: route.targetGateId,
  targetGameId: route.targetGameId,
  targetTitle: route.targetTitle,
  targetPath: route.targetPath,
  fallbackPath: route.fallbackPath,
  priority,
  neededPromptViews: numberOrZero(mission?.needed?.promptViews),
  neededSuccesses: numberOrZero(mission?.needed?.successes),
  evidenceStatus: mission?.evidence?.status ?? 'waiting-for-player-export',
  sampleRole: mission?.sampleRole ?? null,
  returnHandoff: route.returnHandoff ?? null,
  guardrails: route.guardrails,
})
const currentSampleMission = sampleMissionForRoute(sampleNextRoute)
const fastestSampleMission = sampleMissionForRoute(sampleFastestRoute)
const playerEvidenceInvitePack = {
  id: 'zero-spend-player-evidence-invite-pack',
  title: 'Zero-spend player evidence invite pack',
  status: supportReady ? 'player-evidence-invite-pack-ready' : 'player-evidence-invite-pack-blocked',
  primaryRouteId: 'current-sample',
  fastestRouteId: 'fastest-sample',
  summary: {
    routes: 3,
    missions: productGateSamplePlan.missions?.length ?? 0,
    failingGates: numberOrZero(productGateSamplePlan.summary?.failingGates),
    totalPromptViewsNeeded: numberOrZero(productGateSamplePlan.summary?.totalPromptViewsNeeded),
    totalObservedSuccessesNeeded: numberOrZero(productGateSamplePlan.summary?.totalObservedSuccessesNeeded),
    sampleReadyCount: numberOrZero(productGateSamplePlan.summary?.sampleReadyCount),
    evidenceReadyCount: numberOrZero(productGateSamplePlan.summary?.evidenceReadyCount),
    localEventsAvailable: productGateSamplePlan.summary?.localEventsAvailable === true,
    aggregateEvidenceNotes: aggregateEvidenceNotes.length,
  },
  routes: [
    playerEvidenceInviteRoute({
      id: 'current-sample',
      title: 'Current sample',
      route: sampleNextRoute,
      mission: currentSampleMission,
      priority: 1,
    }),
    playerEvidenceInviteRoute({
      id: 'fastest-sample',
      title: 'Fastest sample',
      route: sampleFastestRoute,
      mission: fastestSampleMission,
      priority: 2,
    }),
    {
      id: 'all-missions',
      title: 'All sample missions',
      status: productGateSamplePlan.status,
      path: '/gate-sample.html',
      jsonPath: null,
      targetCampaignId: productGateSamplePlan.publicSamplePage?.defaultRouteCampaignId ?? null,
      targetGateId: productGateSamplePlan.summary?.defaultRouteGateId ?? null,
      targetGameId: currentSampleMission?.gameId ?? null,
      targetTitle: currentSampleMission?.title ?? null,
      targetPath: null,
      fallbackPath: null,
      priority: 3,
      neededPromptViews: numberOrZero(productGateSamplePlan.summary?.totalPromptViewsNeeded),
      neededSuccesses: numberOrZero(productGateSamplePlan.summary?.totalObservedSuccessesNeeded),
      evidenceStatus: productGateSamplePlan.summary?.evidenceReadyCount ? 'partially-ready' : 'waiting-for-player-export',
      sampleRole: 'all-failing-gates',
      guardrails: {
        playerInitiatedOnly: true,
        noAutomatedExternalPosting: true,
        noPaidPromotion: true,
        noSyntheticEvents: true,
        noRevenueEnablement: true,
      },
    },
  ],
  shareCopy: [
    `Start the current sample: ${sampleNextRoute.path}`,
    `Fastest separate gate sample: ${sampleFastestRoute.path}`,
    'After playing, use the in-browser Share evidence flow or Export local analytics; share aggregate counts only.',
  ],
  followUpCommands: [
    'npm run autonomous:collect-local-event-drops',
    'npm run autonomous:player-evidence-watchdog',
    'npm run autonomous:measurement-status',
  ],
  publicReview: {
    aggregateEvidenceIssue: aggregateEvidenceIssueUrl,
    supportRoute: '/support.html',
    measurementStatusRoute: '/measurement-status.html',
    gateSampleRoute: '/gate-sample.html',
  },
  controls: {
    zeroPaidSpend: true,
    noPaidTraffic: true,
    playerInitiatedOnly: true,
    noSyntheticEvents: true,
    noRawEventsInPublicIssues: true,
    noAutomaticPublicUpload: true,
    publicAggregateOnly: true,
    aggregateEvidenceDoesNotPassGates: true,
    manualReviewRequiredForGateDecisions: true,
    localEventDropImportOnly: true,
    noRevenueEnablement: true,
    noStoreSubmission: true,
  },
  nextActions: [
    `Share ${sampleNextRoute.path} first; use ${sampleFastestRoute.path} when the owner wants the shortest separate D1-retention check.`,
    'After testers play, import local event drops or review public aggregate notes before rerunning product gates.',
    'Keep revenue, store submission, and product-gate pass decisions blocked until real event evidence clears thresholds.',
  ],
}
const measurementPageExport = {
  id: 'measurement-status-local-event-drop-export',
  title: 'Measurement status local event drop export',
  status: localEvidenceReady ? 'measurement-page-export-ready' : 'measurement-page-export-needs-bridge',
  route: '/measurement-status.html',
  storageKey: 'agl.analytics.events',
  receiptStorageKey: 'agl.analytics.localExportReceipt',
  exportSurface: 'measurement-status',
  exportSurfaceDetail: 'public-measurement-status-page',
  filenamePattern: 'player-events-*-measurement-status.json',
  acceptedByBridgePattern: localEventBridge.eventDropContract?.filenamePattern ?? 'player-events*.json',
  importCommand:
    localEventBridge.eventDropContract?.localDropImportCommand ?? 'npm run autonomous:collect-local-event-drops',
  followUpCommands: [
    localEventBridge.eventDropContract?.localDropImportCommand ?? 'npm run autonomous:collect-local-event-drops',
    localEventBridge.eventDropContract?.rollupCommand ?? 'npm run autonomous:analytics',
    localEventBridge.eventDropContract?.recoveryCommand ?? 'npm run autonomous:gate-recovery',
    'npm run autonomous:measurement-status',
  ],
  controls: {
    zeroPaidSpend: true,
    playerInitiatedOnly: true,
    localBrowserStorageOnly: true,
    noExternalUpload: true,
    noAutomaticPublicIssue: true,
    noSyntheticEvents: true,
    noGateDecisionFromExportAlone: true,
    bridgeSanitizesSensitiveProperties: localEventBridge.privacy?.piiStrippingEnabled === true,
    noRevenueEnablement: true,
    noStoreSubmission: true,
  },
  nextActions: [
    'Use the measurement status page export when local browser events exist outside the main app export controls.',
    'Place the downloaded player-events file in data/player-events/inbox or import from an explicit configured drop directory.',
    'Run the local event drop collection loop before trusting product-gate recovery metrics.',
  ],
}
const publicEvidenceHandoff = {
  status: publicEvidenceHandoffStatus,
  source: 'support-feedback-public-issues',
  supportFeedbackStatus: supportFeedback.status,
  analyticsEvidenceIssue: aggregateEvidenceIssueUrl,
  aggregateEvidence: {
    notes: aggregateEvidenceNotes.length,
    games: numberOrZero(aggregateEvidenceSummary.aggregateEvidenceGames),
    campaigns: numberOrZero(aggregateEvidenceSummary.aggregateEvidenceCampaigns),
    starts: numberOrZero(aggregateEvidenceSummary.aggregateStarts),
    completions: numberOrZero(aggregateEvidenceSummary.aggregateCompletions),
    replays: numberOrZero(aggregateEvidenceSummary.aggregateReplays),
    d1Eligible: numberOrZero(aggregateEvidenceSummary.aggregateD1Eligible),
    d1Retained: numberOrZero(aggregateEvidenceSummary.aggregateD1Retained),
    topNotes: aggregateEvidenceNotes.slice(0, 5).map(summarizeAggregateNote),
  },
  campaignEvidence: aggregateEvidenceCampaigns.slice(0, 5),
  productGateMissions: {
    supportingAggregateEvidenceNotes,
    missionsWithAggregateEvidence: aggregateEvidenceMissions.length,
    topMissions: aggregateEvidenceMissions.slice(0, 5),
  },
  playerInvitePack: playerEvidenceInvitePack,
  measurementPageExport,
  controls: aggregateEvidencePrivacyControls,
  nextActions: [
    aggregateEvidenceNotes.length
      ? 'Review public aggregate evidence as supporting diagnosis, then collect real event drops or configure production analytics before gate decisions.'
      : `Invite players to start the current sample through ${sampleNextRoute.path}, or the fastest separate gate through ${sampleFastestRoute.path}, then use Share evidence after the play session so public aggregate evidence can be reviewed without raw events.`,
    'Do not pass product gates, enable revenue, or submit stores from public aggregate notes alone.',
  ],
}
const productionAnalyticsUnlockKit =
  productionBlockerHandoff.nextUnlockKit?.id === 'production-analytics-browser'
    ? productionBlockerHandoff.nextUnlockKit
    : null
const publicAnalyticsUnlock = productionAnalyticsUnlockKit
  ? {
      id: productionAnalyticsUnlockKit.id,
      title: productionAnalyticsUnlockKit.title,
      status: productionAnalyticsUnlockKit.status,
      recommendedPathId: productionAnalyticsUnlockKit.recommendedPathId,
      lowestInputPathId: productionAnalyticsUnlockKit.lowestInputPathId ?? null,
      lowestInputPathTitle: productionAnalyticsUnlockKit.lowestInputPathTitle ?? null,
      lowestInputPathStatus: productionAnalyticsUnlockKit.lowestInputPathStatus ?? null,
      lowestInputMissingVariableCount: numberOrZero(productionAnalyticsUnlockKit.lowestInputMissingVariableCount),
      lowestInputMissingSecretCount: numberOrZero(productionAnalyticsUnlockKit.lowestInputMissingSecretCount),
      lowestInputMissingInputCount: numberOrZero(productionAnalyticsUnlockKit.lowestInputMissingInputCount),
      lowestInputReason: productionAnalyticsUnlockKit.lowestInputReason ?? null,
      commandCount: productionAnalyticsUnlockKit.commandCount,
      validationCommandCount: productionAnalyticsUnlockKit.validationCommandCount,
      missingVariableCount: productionAnalyticsUnlockKit.missingVariableCount,
      missingSecretCount: productionAnalyticsUnlockKit.missingSecretCount,
      controls: {
        zeroPaidSpend: productionAnalyticsUnlockKit.controls?.zeroPaidSpend === true,
        noSecretValues: productionAnalyticsUnlockKit.controls?.noSecretValues === true,
        noSecretValuesStored: productionAnalyticsUnlockKit.controls?.noSecretValuesStored === true,
        noAccountCreation: productionAnalyticsUnlockKit.controls?.noAccountCreation === true,
        noStoreSubmission: productionAnalyticsUnlockKit.controls?.noStoreSubmission === true,
        noRevenueEnablement: productionAnalyticsUnlockKit.controls?.noRevenueEnablement === true,
        githubVariablesOnly: productionAnalyticsUnlockKit.controls?.githubVariablesOnly === true,
        secretCommandsUseStdin: productionAnalyticsUnlockKit.controls?.secretCommandsUseStdin === true,
      },
      paths: (productionAnalyticsUnlockKit.paths ?? []).map((unlockPath) => ({
        id: unlockPath.id,
        title: unlockPath.title,
        status: unlockPath.status,
        costMode: unlockPath.costMode,
        ownerInputRequired: unlockPath.ownerInputRequired === true,
        missingVariableCount: numberOrZero(unlockPath.missingVariableCount),
        missingSecretCount: numberOrZero(unlockPath.missingSecretCount),
        missingInputCount: numberOrZero(unlockPath.missingInputCount),
        commandCount: numberOrZero(unlockPath.commandCount),
        validationCommandCount: numberOrZero(unlockPath.validationCommandCount),
        requiredVariables: (unlockPath.requiredVariables ?? []).map((item) => ({
          repositoryName: item.repositoryName,
          envName: item.envName,
          configured: item.configured === true,
          command: item.command,
        })),
        requiredSecrets: (unlockPath.requiredSecrets ?? []).map((item) => ({
          repositoryName: item.repositoryName,
          envName: item.envName,
          configured: item.configured === true,
          command: item.command,
        })),
        commandSequence: unlockPath.commandSequence ?? [],
        validationCommands: unlockPath.validationCommands ?? [],
      })),
      minimalInterventionPath: (() => {
        const lowestInputPath = (productionAnalyticsUnlockKit.paths ?? []).find(
          (unlockPath) => unlockPath.id === productionAnalyticsUnlockKit.lowestInputPathId,
        )

        return lowestInputPath
          ? {
              id: lowestInputPath.id,
              title: lowestInputPath.title,
              status: lowestInputPath.status,
              costMode: lowestInputPath.costMode,
              missingInputCount: numberOrZero(lowestInputPath.missingInputCount),
              missingVariableCount: numberOrZero(lowestInputPath.missingVariableCount),
              missingSecretCount: numberOrZero(lowestInputPath.missingSecretCount),
              noSecretsRequired: (lowestInputPath.requiredSecrets ?? []).length === 0,
              setupCommands: lowestInputPath.commandSequence ?? [],
              validationCommands: lowestInputPath.validationCommands ?? [],
            }
          : null
      })(),
      nextActions: [
        'Choose the first-party collector path when a zero-spend Cloudflare free-tier account already exists; otherwise use an existing PostHog free project.',
        productionAnalyticsUnlockKit.lowestInputPathId
          ? `Minimal-intervention analytics setup is ${productionAnalyticsUnlockKit.lowestInputPathId} with ${numberOrZero(productionAnalyticsUnlockKit.lowestInputMissingInputCount)} missing input(s) and ${numberOrZero(productionAnalyticsUnlockKit.lowestInputMissingSecretCount)} secret(s).`
          : 'No minimal-intervention analytics path is available yet.',
        'Sync only configured GitHub variables and secrets through ops/github/setup-production.sh; never paste secret values into tracked files.',
        'Run the validation commands before trusting production analytics for product-gate or monetization decisions.',
      ],
    }
  : null

const summarizeRequiredEnv = (item) => ({
  name: item.name ?? item.repositoryName ?? item.envName ?? null,
  purpose: item.purpose ?? null,
  configured: item.configured === true,
})

const summarizeRequiredSecret = (item) => ({
  repositoryName: item.repositorySecret ?? item.repositoryName ?? item.envName ?? item.name ?? null,
  envName: item.envName ?? item.repositorySecret ?? item.repositoryName ?? item.name ?? null,
  configured: item.configured === true,
  command: item.command ?? null,
})

const summarizeUnlockKit = (kit) =>
  kit
    ? {
        id: kit.id,
        title: kit.title,
        status: kit.status,
        recommendedPathId: kit.recommendedPathId,
        lowestInputPathId: kit.lowestInputPathId ?? null,
        lowestInputPathTitle: kit.lowestInputPathTitle ?? null,
        lowestInputPathStatus: kit.lowestInputPathStatus ?? null,
        lowestInputMissingVariableCount: numberOrZero(kit.lowestInputMissingVariableCount),
        lowestInputMissingSecretCount: numberOrZero(kit.lowestInputMissingSecretCount),
        lowestInputMissingInputCount: numberOrZero(kit.lowestInputMissingInputCount),
        lowestInputReason: kit.lowestInputReason ?? null,
        commandCount: numberOrZero(kit.commandCount),
        validationCommandCount: numberOrZero(kit.validationCommandCount),
        missingVariableCount: numberOrZero(kit.missingVariableCount),
        missingSecretCount: numberOrZero(kit.missingSecretCount),
        controls: {
          zeroPaidSpend: kit.controls?.zeroPaidSpend === true,
          noSecretValues: kit.controls?.noSecretValues === true,
          noSecretValuesStored: kit.controls?.noSecretValuesStored === true,
          noAccountCreation: kit.controls?.noAccountCreation === true,
          noStoreSubmission: kit.controls?.noStoreSubmission === true,
          noRevenueEnablement: kit.controls?.noRevenueEnablement === true,
          secretCommandsUseStdin: kit.controls?.secretCommandsUseStdin === true,
        },
        paths: (kit.paths ?? []).map((unlockPath) => ({
          id: unlockPath.id,
          title: unlockPath.title,
          status: unlockPath.status,
          costMode: unlockPath.costMode,
          ownerInputRequired: unlockPath.ownerInputRequired === true,
          missingVariableCount: numberOrZero(unlockPath.missingVariableCount),
          missingSecretCount: numberOrZero(unlockPath.missingSecretCount),
          missingInputCount: numberOrZero(unlockPath.missingInputCount),
          commandCount: numberOrZero(unlockPath.commandCount),
          validationCommandCount: numberOrZero(unlockPath.validationCommandCount),
          requiredVariables: (unlockPath.requiredVariables ?? []).map((item) => ({
            repositoryName: item.repositoryName,
            envName: item.envName,
            configured: item.configured === true,
            command: item.command,
          })),
          requiredSecrets: (unlockPath.requiredSecrets ?? []).map((item) => ({
            repositoryName: item.repositoryName,
            envName: item.envName,
            configured: item.configured === true,
            command: item.command,
          })),
          commandSequence: unlockPath.commandSequence ?? [],
          validationCommands: unlockPath.validationCommands ?? [],
        })),
      }
    : null

const unlockKitById = new Map((productionBlockerHandoff.unlockKits ?? []).map((kit) => [kit.id, kit]))
const publicExternalUnlockQueue = {
  status: productionBlockerHandoff.status,
  nextBestUnlockId: productionBlockerHandoff.summary?.nextBestUnlockId ?? null,
  nextBestZeroCostUnlockId: productionBlockerHandoff.summary?.nextBestZeroCostUnlockId ?? null,
  ownerActionRequired: numberOrZero(productionBlockerHandoff.summary?.ownerActionRequired),
  externalOwnerActions: numberOrZero(productionBlockerHandoff.summary?.externalOwnerActions),
  missingEnvironmentItems: numberOrZero(productionBlockerHandoff.summary?.missingEnvironmentItems),
  missingSecrets: numberOrZero(productionBlockerHandoff.summary?.missingSecrets),
  productGateBlockers: numberOrZero(productionBlockerHandoff.summary?.productGateBlockers),
  topItems: (productionBlockerHandoff.handoffItems ?? []).slice(0, 8).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    status: item.status,
    priority: numberOrZero(item.priority),
    costMode: item.costMode,
    ownerInputRequired: item.ownerInputRequired === true,
    requiredEnv: (item.requiredEnv ?? []).map(summarizeRequiredEnv),
    requiredSecrets: (item.requiredSecrets ?? []).map(summarizeRequiredSecret),
    blockers: (item.blockers ?? []).slice(0, 4),
    unlocks: (item.unlocks ?? []).slice(0, 4),
    afterUnlockCommands: item.afterUnlockCommands ?? [],
    unlockKit: summarizeUnlockKit(unlockKitById.get(item.unlockKit?.id) ?? item.unlockKit),
  })),
  nextUnlockKit: summarizeUnlockKit(productionBlockerHandoff.nextUnlockKit),
  ownerUnlockBrief: productionBlockerHandoff.ownerUnlockBrief ?? null,
  controls: {
    zeroPaidSpend: productionBlockerHandoff.controls?.zeroPaidSpend === true,
    noSecretValues: productionBlockerHandoff.controls?.noSecretValues === true,
    noSecretValuesStored: productionBlockerHandoff.controls?.noSecretValuesStored === true,
    noMutation: productionBlockerHandoff.controls?.noMutation === true,
    noAccountCreation: productionBlockerHandoff.controls?.noAccountCreation === true,
    noStoreSubmission: productionBlockerHandoff.controls?.noStoreSubmission === true,
    noRevenueEnablement: productionBlockerHandoff.controls?.noRevenueEnablement === true,
    productGatesStillRequiredForRevenue:
      productionBlockerHandoff.controls?.productGatesStillRequiredForRevenue === true,
    storeSpendStillBlockedByUnitEconomics:
      productionBlockerHandoff.controls?.storeSpendStillBlockedByUnitEconomics === true,
  },
  nextActions: [
    productionBlockerHandoff.summary?.nextBestUnlockId
      ? `Start with ${productionBlockerHandoff.summary.nextBestUnlockId}; it is the highest-priority zero-spend owner input.`
      : 'No external unlock remains after the current production readiness refresh.',
    'Use only repository variables and stdin-fed secrets; never paste secret values into tracked files or public issues.',
    'Keep product gates, revenue, and store submissions blocked until validation commands and real player evidence pass.',
  ],
}

const publicCollectorDeployment = {
  status: eventCollectorDeployment.status,
  provider: eventCollectorDeployment.provider ?? 'cloudflare-worker-r2',
  costPosture: eventCollectorDeployment.costPosture ?? 'free-tier-friendly-no-paid-traffic',
  worker: {
    path: eventCollectorDeployment.worker?.path ?? 'ops/cloudflare/event-collector-worker.mjs',
    storageBinding: eventCollectorDeployment.worker?.storageBinding ?? 'EVENT_BUCKET',
    bucketConfigured: eventCollectorDeployment.worker?.bucketConfigured === true,
    allowedOriginsConfigured: eventCollectorDeployment.worker?.allowedOriginsConfigured === true,
    endpoints: eventCollectorDeployment.worker?.endpoints ?? {
      health: '/health',
      ingest: '/events',
      export: '/events/export',
      summary: '/events/summary',
    },
    aggregateSummaryEndpoint: eventCollectorDeployment.worker?.aggregateSummaryEndpoint === true,
  },
  workflow: {
    path: eventCollectorDeployment.workflow?.path ?? '.github/workflows/event-collector-deploy.yml',
    status: eventCollectorDeployment.workflow?.status ?? 'missing',
    triggers: eventCollectorDeployment.workflow?.triggers ?? {},
    deploysWhenConfigured: eventCollectorDeployment.workflow?.deploysWhenConfigured === true,
    autoCreatesBucket: eventCollectorDeployment.workflow?.autoCreatesBucket === true,
    preflightRequiresWriteToken: eventCollectorDeployment.workflow?.preflightRequiresWriteToken === true,
  },
  environment: {
    browserCollectorConfigured: eventCollectorDeployment.environment?.browserCollectorConfigured === true,
    serverExportConfigured: eventCollectorDeployment.environment?.serverExportConfigured === true,
    cloudflareAccountConfigured: eventCollectorDeployment.environment?.cloudflareAccountConfigured === true,
    cloudflareTokenConfigured: eventCollectorDeployment.environment?.cloudflareTokenConfigured === true,
    bucketConfigured: eventCollectorDeployment.environment?.bucketConfigured === true,
    allowedOriginsConfigured: eventCollectorDeployment.environment?.allowedOriginsConfigured === true,
    writeTokenConfigured: eventCollectorDeployment.environment?.writeTokenConfigured === true,
    adminTokenConfigured: eventCollectorDeployment.environment?.adminTokenConfigured === true,
    collectorUrl: eventCollectorDeployment.environment?.collectorUrl ?? null,
    exportUrl: eventCollectorDeployment.environment?.exportUrl ?? null,
  },
  smoke: {
    status: eventCollectorDeployment.smoke?.status ?? eventCollectorSmoke.status,
    piiStripped: eventCollectorDeployment.smoke?.piiStripped === true,
    exportedEvents: eventCollectorDeployment.smoke?.exportedEvents ?? 0,
    summaryEvents: eventCollectorDeployment.smoke?.summaryEvents ?? 0,
    summaryAggregateOnly: eventCollectorDeployment.smoke?.summaryAggregateOnly === true,
    summaryRawEventsReturned: eventCollectorDeployment.smoke?.summaryRawEventsReturned === true,
    activeSource: eventCollectorDeployment.smoke?.activeSource ?? null,
  },
  checks: (eventCollectorDeployment.checks ?? []).map((check) => ({
    id: check.id,
    status: check.status,
    detail: check.detail,
  })),
  setupRequiredOnce: eventCollectorDeployment.setupRequiredOnce ?? [],
  commands: {
    smoke: eventCollectorDeployment.commands?.smoke ?? 'npm run autonomous:event-collector-smoke',
    plan: eventCollectorDeployment.commands?.plan ?? 'npm run autonomous:collector-deploy-plan',
    deployWorkflow:
      eventCollectorDeployment.commands?.deployWorkflow ??
      'Production Input Watch triggers Event Collector Deploy after Cloudflare variables and secrets are configured.',
  },
  controls: {
    publicArtifact: true,
    zeroPaidSpend: true,
    noSecretValues: true,
    noSecretValuesStored: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
  },
}

const sourceDataHash = hashSourceData({
  productionEnvironment,
  analytics,
  localEventBridge,
  supportChannel,
  supportFeedback,
  productGateRecovery,
  productGateSamplePlan,
  trafficSeeding,
  productionBlockerHandoff,
  ownerUnlockPreflight,
  eventCollectorSmoke,
  eventCollectorDeployment,
  postDeployArtifactSync,
})

const combinedOwnerInputPreflight = sanitizeCombinedOwnerInputPreflight(
  ownerUnlockPreflight.combinedOwnerInputPreflight,
)
const runtimeConfigMinimumPublicInputNames = ['VITE_POSTHOG_KEY']
const runtimeConfigOptionalPublicInputNames = ['AGL_SUPPORT_EMAIL']
const combinedMissingInputNames = arrayOrEmpty(combinedOwnerInputPreflight?.missingInputNames)
const missingRuntimeConfigMinimumInputNames = runtimeConfigMinimumPublicInputNames.filter((name) =>
  combinedMissingInputNames.includes(name),
)
const missingRuntimeConfigOptionalInputNames = runtimeConfigOptionalPublicInputNames.filter((name) =>
  combinedMissingInputNames.includes(name),
)
const ownerInputActionPack = combinedOwnerInputPreflight
  ? {
      id: 'zero-secret-owner-input-action-pack',
      sourcePackId: combinedOwnerInputPreflight.id,
      status: combinedOwnerInputPreflight.readyForSetup
        ? 'ready-to-sync-configured-owner-inputs'
        : 'waiting-on-owner-values',
      localEnvFile: combinedOwnerInputPreflight.localEnvFile,
      unlockIds: combinedOwnerInputPreflight.unlockIds,
      analyticsPathId: combinedOwnerInputPreflight.analyticsPathId,
      supportUnlockId: combinedOwnerInputPreflight.supportUnlockId,
      missingInputNames: combinedOwnerInputPreflight.missingInputNames,
      missingInputCount: combinedOwnerInputPreflight.summary?.missingInputs ?? 0,
      runtimeConfigMinimum: {
        id: 'posthog-browser-runtime-config-minimum',
        status: missingRuntimeConfigMinimumInputNames.length
          ? 'waiting-on-runtime-minimum-input'
          : 'runtime-minimum-ready',
        unlockId: 'production-analytics-browser',
        pathId: 'posthog-browser',
        minimumPublicInputNames: runtimeConfigMinimumPublicInputNames,
        optionalPublicInputNames: runtimeConfigOptionalPublicInputNames,
        missingMinimumPublicInputNames: missingRuntimeConfigMinimumInputNames,
        missingOptionalPublicInputNames: missingRuntimeConfigOptionalInputNames,
        missingMinimumInputCount: missingRuntimeConfigMinimumInputNames.length,
        missingOptionalInputCount: missingRuntimeConfigOptionalInputNames.length,
        analyticsOnlyAllowed: true,
        controls: {
          publicValuesOnly: true,
          noSecretValues: true,
          noWorkflowDispatchFromPage: true,
          noStoreSubmission: true,
          noRevenueEnablement: true,
        },
      },
      secretInputCount: combinedOwnerInputPreflight.summary?.secretInputs ?? 0,
      localEnvTemplateLines: combinedOwnerInputPreflight.localEnvTemplateLines,
      shellExportTemplateLines: combinedOwnerInputPreflight.shellExportTemplateLines,
      localEnvTemplateText: `${combinedOwnerInputPreflight.localEnvTemplateLines.join('\n')}\n`,
      shellExportTemplateText: `${combinedOwnerInputPreflight.shellExportTemplateLines.join('\n')}\n`,
      downloadFileName: 'agl-owner-input-template.env',
      receiptStorageKey: 'agl.ownerInputActionReceipt',
      valueValidation: {
        id: 'browser-local-zero-secret-owner-input-check',
        status: 'ready',
        filledDownloadFileName: 'agl-owner-input-filled.env',
        fields: [
          {
            envName: 'VITE_POSTHOG_KEY',
            title: 'PostHog browser project key',
            inputId: 'owner-input-vite-posthog-key',
            validationKind: 'posthog-public-key',
            inputType: 'text',
            placeholder: 'phc_public_project_key',
            required: true,
            runtimeConfigRequired: true,
            publicValue: true,
            maxLength: 256,
          },
          {
            envName: 'AGL_SUPPORT_EMAIL',
            title: 'Production support email',
            inputId: 'owner-input-agl-support-email',
            validationKind: 'email-shape',
            inputType: 'email',
            placeholder: 'support@example.com',
            required: true,
            runtimeConfigRequired: false,
            publicValue: true,
            maxLength: 254,
          },
        ],
        controls: {
          browserLocalOnly: true,
          noGeneratedValueSerialization: true,
          noSecretValues: true,
          noGithubMutation: true,
          noWorkflowDispatch: true,
        },
      },
      runtimeConfigPreview: {
        id: 'browser-local-owner-runtime-config-preview',
        status: 'ready',
        downloadFileName: 'owner-runtime-config.preview.json',
        targetPublicPath: 'public/owner-runtime-config.json',
        defaultPosthogHost: 'https://us.i.posthog.com',
        provider: 'posthog-browser',
        minimumPublicInputNames: runtimeConfigMinimumPublicInputNames,
        optionalPublicInputNames: runtimeConfigOptionalPublicInputNames,
        analyticsOnlyAllowed: true,
        controls: {
          browserLocalOnly: true,
          publicValuesOnly: true,
          noGeneratedValueSerialization: true,
          noSecretValues: true,
          noGithubMutation: true,
          noWorkflowDispatch: true,
          noStoreSubmission: true,
          noRevenueEnablement: true,
        },
      },
      productionInputWatchCommand: {
        id: 'browser-local-production-input-watch-command',
        status: 'ready',
        workflowFile: 'production-input-watch.yml',
        workflowPath: '.github/workflows/production-input-watch.yml',
        ref: 'main',
        requiredFlag: 'publish_zero_secret_runtime_config=true',
        defaultPosthogHost: 'https://us.i.posthog.com',
        minimumPublicInputNames: runtimeConfigMinimumPublicInputNames,
        optionalPublicInputNames: runtimeConfigOptionalPublicInputNames,
        analyticsOnlyAllowed: true,
        controls: {
          browserLocalOnly: true,
          publicValuesOnly: true,
          noGeneratedValueSerialization: true,
          noSecretValues: true,
          noGithubMutation: true,
          noWorkflowDispatchFromPage: true,
          commandRequiresOwnerRun: true,
          noStoreSubmission: true,
          noRevenueEnablement: true,
        },
      },
      commands: {
        combinedPreflight: combinedOwnerInputPreflight.commands?.combinedPreflight ?? null,
        setupWriteLocalEnvTemplate: combinedOwnerInputPreflight.commands?.setupWriteLocalEnvTemplate ?? null,
        syncConfiguredValues: combinedOwnerInputPreflight.commands?.syncConfiguredValues ?? null,
        workflowDispatch: combinedOwnerInputPreflight.commands?.workflowDispatch ?? null,
      },
      controls: {
        zeroPaidSpend: true,
        noSecretValues: true,
        noSecretValuesStored: combinedOwnerInputPreflight.controls?.noSecretValuesStored === true,
        localOnlyReceipt: true,
        localTemplateWriteNoGithubMutation:
          combinedOwnerInputPreflight.controls?.localTemplateWriteNoGithubMutation === true,
        workflowDispatchRequiresRunWorkflows:
          combinedOwnerInputPreflight.controls?.workflowDispatchRequiresRunWorkflows === true,
        storeSubmissionStillBlocked: combinedOwnerInputPreflight.controls?.storeSubmissionStillBlocked === true,
        revenueStillBlocked: combinedOwnerInputPreflight.controls?.revenueStillBlocked === true,
      },
    }
  : null

const payload = {
  generatedAt: new Date().toISOString(),
  sourceDataHash,
  status,
  activePath,
  liveCandidate: postDeployArtifactSync.live?.candidateId ?? null,
  liveRelease: {
    syncedCandidateId: postDeployArtifactSync.live?.candidateId ?? null,
    syncedArtifactCandidateId: postDeployArtifactSync.artifact?.target?.candidateId ?? null,
    exactManifestPath: '/release-candidate.json',
    runtimeManifestCheck: 'read-only-browser-fetch',
    staticJsonMayLagBehindLatestDeploy: true,
    lagReason:
      'Post-deploy evidence sync commits after the Pages deploy; the live page reads release-candidate.json at runtime to show the exact deployed candidate without dispatching another workflow.',
    controls: {
      readOnlyManifestFetch: true,
      noWorkflowDispatch: true,
      noDeployLoop: true,
      zeroPaidSpend: true,
    },
  },
  ownerRuntimeConfig: {
    publicRoute: '/owner-runtime-config.json',
    runtimeConfigCheck: 'read-only-browser-fetch',
    syncedStatus: publicOwnerRuntimeConfig.status ?? 'missing',
    syncedConfiguredPublicInputNames: arrayOrEmpty(publicOwnerRuntimeConfig.configuredPublicInputNames),
    syncedDefaultedPublicInputNames: arrayOrEmpty(publicOwnerRuntimeConfig.defaultedPublicInputNames),
    syncedMissingPublicInputNames: arrayOrEmpty(publicOwnerRuntimeConfig.missingPublicInputNames),
    syncedInvalidPublicInputNames: arrayOrEmpty(publicOwnerRuntimeConfig.invalidPublicInputNames),
    syncedPosthogConfigured: publicOwnerRuntimeConfig.analytics?.posthogConfigured === true,
    syncedProvider: publicOwnerRuntimeConfig.analytics?.provider ?? null,
    syncedSupportConfigured: publicOwnerRuntimeConfig.support?.configured === true,
    requiredForProductionAnalytics: ['VITE_POSTHOG_KEY'],
    requiredForSupportContact: ['AGL_SUPPORT_EMAIL'],
    defaultedPublicInputNames: ['VITE_POSTHOG_HOST'],
    deploymentChain: {
      status: 'zero-secret-runtime-config-chain-ready',
      ownerCommandStatus: ownerInputActionPack?.productionInputWatchCommand?.status ?? 'missing',
      inputWatchWorkflow: '.github/workflows/production-input-watch.yml',
      inputWatchWorkflowName: 'Production Input Watch',
      deployWorkflow: '.github/workflows/web-pwa-deploy.yml',
      deployTrigger: 'workflow_run: Production Input Watch',
      evidenceSyncWorkflow: '.github/workflows/post-deploy-evidence-sync.yml',
      evidenceSyncTrigger: 'workflow_run: Web PWA Deploy',
      finalVerifier: '/measurement-status.html runtime config fetch',
      controls: {
        ownerRunRequired: true,
        noPageDispatch: true,
        publicInputsOnly: true,
        noSecretValues: true,
        zeroPaidSpend: true,
        noStoreSubmission: true,
        noRevenueEnablement: true,
      },
    },
    controls: {
      readOnlyConfigFetch: true,
      statusOnlyNoValuesDisplayed: true,
      noSecretValues: true,
      noWorkflowDispatch: true,
      noGithubMutation: true,
      zeroPaidSpend: true,
    },
  },
  analytics: {
    activeRollupSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    retentionSource: analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? 'unknown',
    totals: {
      events: analytics.totals?.events ?? analytics.totals?.counts?.events ?? 0,
      gameStarted: analytics.totals?.counts?.game_started ?? 0,
      levelCompleted: analytics.totals?.counts?.level_completed ?? 0,
      analyticsExported: analytics.totals?.counts?.analytics_exported ?? 0,
      evidenceIssuesOpened: analytics.totals?.counts?.analytics_evidence_issue_opened ?? 0,
    },
    browserForwarding: {
      configured: browserForwardingConfigured,
      path: activePath,
      posthogConfigured: browserPosthogConfigured,
      firstPartyCollectorConfigured: browserCollectorConfigured,
      optOutAvailable: true,
    },
    autonomousRollups: {
      configured: autonomousRollupsConfigured,
      posthogServerConfigured: serverPosthogConfigured,
      firstPartyCollectorExportConfigured: serverCollectorConfigured,
    },
    localEvidence: {
      ready: localEvidenceReady,
      bridgeStatus: localEventBridge.status,
      inboxEvents: localEventBridge.inbox?.validEvents ?? 0,
      importedEvents: localEventBridge.imported?.events ?? 0,
      supportStatus: supportChannel.status,
      aggregateEvidenceNotes: supportFeedback.summary?.aggregateEvidenceNotes ?? 0,
      aggregateEvidenceStarts: publicEvidenceHandoff.aggregateEvidence.starts,
      aggregateEvidenceCompletions: publicEvidenceHandoff.aggregateEvidence.completions,
      aggregateEvidenceReplays: publicEvidenceHandoff.aggregateEvidence.replays,
    },
  },
  productGateEvidence: {
    status: productGateSamplePlan.status,
    recoveryStatus: productGateRecovery.status,
    recoverySummary: productGateRecovery.summary ?? {},
    recoveryPriorities: (productGateRecovery.priorities ?? []).slice(0, 3),
    primaryMission: primaryMission
      ? {
          id: primaryMission.id,
          title: primaryMission.title,
          gateId: primaryMission.gateId,
          campaignId: primaryMission.campaignId,
          gameId: primaryMission.gameId,
          needed: primaryMission.needed,
          evidenceStatus: primaryMission.evidence?.status ?? 'waiting',
        }
      : null,
    missionCount: productGateSamplePlan.missions?.length ?? 0,
    fastestGateId: productGateSamplePlan.summary?.fastestGateId ?? null,
    supportingAggregateEvidenceNotes,
    aggregateEvidenceMissionCount: aggregateEvidenceMissions.length,
    sampleNextRoute,
    sampleFastestRoute,
  },
  publicEvidenceHandoff,
  analyticsUnlock: publicAnalyticsUnlock,
  collectorDeployment: publicCollectorDeployment,
  externalUnlockQueue: publicExternalUnlockQueue,
  ownerUnlockPreflight: {
    status: ownerUnlockPreflight.status,
    readyForSetup: ownerUnlockPreflight.readyForSetup === true,
    recommendedPath: ownerUnlockPreflight.recommendedPath ?? null,
    lowestInputPath: ownerUnlockPreflight.lowestInputPath ?? null,
    summary: ownerUnlockPreflight.summary ?? {},
    missingInputs: ownerUnlockPreflight.missingInputs ?? [],
    invalidInputs: ownerUnlockPreflight.invalidInputs ?? [],
    lowestInputPreflight: ownerUnlockPreflight.lowestInputPreflight ?? null,
    combinedOwnerInputPreflight,
    minimalInterventionPath: ownerUnlockPreflight.minimalInterventionPath ?? null,
    ownerInputPack: ownerUnlockPreflight.ownerInputPack ?? null,
    pathPreflights: ownerUnlockPreflight.pathPreflights ?? [],
    commands: ownerUnlockPreflight.commands ?? {},
    controls: ownerUnlockPreflight.controls ?? {},
  },
  ownerInputActionPack,
  publicRoutes: {
    statusPage: '/measurement-status.html',
    statusJson: '/measurement-status.json',
    analyticsUnlock: '/analytics-unlock.html',
    analyticsUnlockJson: '/analytics-unlock.json',
    ownerRuntimeConfig: '/owner-runtime-config.json',
    ownerUnlockPreflightJson: '/owner-unlock-preflight.json',
    productGateRecovery: productGateRecovery.publicRoutes?.productGateRecovery ?? '/product-gate-recovery.html',
    productGateRecoveryJson:
      productGateRecovery.publicRoutes?.productGateRecoveryJson ?? '/product-gate-recovery.json',
    gateSample: '/gate-sample.html',
    sampleNext: sampleNextRoute.path,
    sampleNextJson: sampleNextRoute.jsonPath,
    sampleFastest: sampleFastestRoute.path,
    sampleFastestJson: sampleFastestRoute.jsonPath,
    support: '/support.html',
    privacy: '/privacy.html',
    analyticsEvidenceIssue: supportChannel.links?.analyticsEvidenceUrl ?? null,
  },
  blockers: {
    browserProductionAnalytics: productionAnalyticsHandoff
      ? {
          status: productionAnalyticsHandoff.status,
          ownerInputRequired: productionAnalyticsHandoff.ownerInputRequired === true,
          costMode: productionAnalyticsHandoff.costMode,
        }
      : null,
    autonomousRollups: rollupHandoff
      ? {
          status: rollupHandoff.status,
          ownerInputRequired: rollupHandoff.ownerInputRequired === true,
          costMode: rollupHandoff.costMode,
        }
      : null,
  },
  sourceStatus: {
    productionEnvironment: productionEnvironment.status,
    analyticsRollup: analytics.status,
    localEventBridge: localEventBridge.status,
    supportChannel: supportChannel.status,
    supportFeedback: supportFeedback.status,
    productGateRecovery: productGateRecovery.status,
    productGateSamplePlan: productGateSamplePlan.status,
    trafficSeeding: trafficSeeding.status,
    productionBlockerHandoff: productionBlockerHandoff.status,
    eventCollectorSmoke: eventCollectorSmoke.status,
    eventCollectorDeployment: eventCollectorDeployment.status,
    postDeployArtifactSync: postDeployArtifactSync.status,
  },
  controls: {
    publicArtifact: true,
    zeroPaidSpend: true,
    noSecretValues: true,
    noRawAnalyticsRows: true,
    aggregateOnlyEvidence: true,
    playerInitiatedExportsOnly: true,
    aggregateEvidenceDoesNotPassGates: true,
    manualReviewRequiredForGateDecisions: true,
    noAutomaticPublicUpload: true,
    measurementPageLocalEventDropExport: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
  },
  nextActions: [
    nextAction,
    publicAnalyticsUnlock
      ? `Unlock production analytics with ${publicAnalyticsUnlock.recommendedPathId}; minimal-intervention path is ${publicAnalyticsUnlock.minimalInterventionPath?.id ?? publicAnalyticsUnlock.lowestInputPathId ?? 'unknown'} with ${publicAnalyticsUnlock.minimalInterventionPath?.missingInputCount ?? publicAnalyticsUnlock.lowestInputMissingInputCount} missing input(s) and ${publicAnalyticsUnlock.minimalInterventionPath?.missingSecretCount ?? publicAnalyticsUnlock.lowestInputMissingSecretCount} secret(s).`
      : 'Regenerate the production blocker handoff before publishing production analytics unlock guidance.',
    `First-party collector deployment is ${publicCollectorDeployment.status}; smoke is ${publicCollectorDeployment.smoke.status}.`,
    `External unlock queue has ${publicExternalUnlockQueue.ownerActionRequired} owner action(s); next zero-spend unlock is ${publicExternalUnlockQueue.nextBestZeroCostUnlockId ?? 'none'}.`,
    `Product gate recovery is ${productGateRecovery.status}; public recovery route is ${productGateRecovery.publicRoutes?.productGateRecovery ?? '/product-gate-recovery.html'}.`,
    ...publicEvidenceHandoff.nextActions,
    'Keep product gates blocked until real player evidence clears completion, replay, and D1 retention thresholds.',
  ],
}

const appPublicEvidenceHandoff = {
  status: payload.publicEvidenceHandoff.status,
  aggregateEvidence: {
    notes: payload.publicEvidenceHandoff.aggregateEvidence.notes,
    starts: payload.publicEvidenceHandoff.aggregateEvidence.starts,
    completions: payload.publicEvidenceHandoff.aggregateEvidence.completions,
  },
  controls: {
    aggregateEvidenceDoesNotPassGates:
      payload.publicEvidenceHandoff.controls.aggregateEvidenceDoesNotPassGates,
    manualReviewRequiredForGateDecisions:
      payload.publicEvidenceHandoff.controls.manualReviewRequiredForGateDecisions,
  },
}

const appAnalyticsUnlock = payload.analyticsUnlock
  ? {
      status: payload.analyticsUnlock.status,
      recommendedPathId: payload.analyticsUnlock.recommendedPathId,
      lowestInputPathId: payload.analyticsUnlock.lowestInputPathId,
      lowestInputMissingVariableCount: payload.analyticsUnlock.lowestInputMissingVariableCount,
      lowestInputMissingSecretCount: payload.analyticsUnlock.lowestInputMissingSecretCount,
      minimalInterventionPathId: payload.analyticsUnlock.minimalInterventionPath?.id ?? null,
      minimalInterventionMissingInputCount:
        payload.analyticsUnlock.minimalInterventionPath?.missingInputCount ?? null,
      minimalInterventionSecretInputCount:
        payload.analyticsUnlock.minimalInterventionPath?.missingSecretCount ?? null,
      commandCount: payload.analyticsUnlock.commandCount,
      validationCommandCount: payload.analyticsUnlock.validationCommandCount,
    }
  : null
const appCombinedOwnerInputPreflight = payload.ownerUnlockPreflight.combinedOwnerInputPreflight
  ? {
      status: payload.ownerUnlockPreflight.combinedOwnerInputPreflight.status,
      readyForSetup: payload.ownerUnlockPreflight.combinedOwnerInputPreflight.readyForSetup === true,
      localEnvFile: payload.ownerUnlockPreflight.combinedOwnerInputPreflight.localEnvFile,
      unlockIds: payload.ownerUnlockPreflight.combinedOwnerInputPreflight.unlockIds ?? [],
      analyticsPathId: payload.ownerUnlockPreflight.combinedOwnerInputPreflight.analyticsPathId ?? null,
      supportUnlockId: payload.ownerUnlockPreflight.combinedOwnerInputPreflight.supportUnlockId ?? null,
      missingInputCount:
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.summary?.missingInputs ?? null,
      secretInputCount:
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.summary?.secretInputs ?? null,
      invalidInputCount:
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.summary?.invalidInputs ?? null,
      missingInputNames: payload.ownerUnlockPreflight.combinedOwnerInputPreflight.missingInputNames ?? [],
      localEnvTemplateLines:
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.localEnvTemplateLines ?? [],
      shellExportTemplateLines:
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.shellExportTemplateLines ?? [],
      writeAnalyticsLocalEnvTemplateCommand:
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.setupWriteAnalyticsLocalEnvTemplate ??
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.writeAnalyticsLocalEnvTemplate ??
        null,
      writeLocalEnvTemplateCommand:
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.setupWriteLocalEnvTemplate ??
        payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.writeLocalEnvTemplate ??
        null,
      commands: {
        combinedPreflight:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.combinedPreflight ?? null,
        setupWriteLocalEnvTemplate:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.setupWriteLocalEnvTemplate ??
          null,
        writeLocalEnvTemplate:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.writeLocalEnvTemplate ?? null,
        syncConfiguredValues:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.syncConfiguredValues ?? null,
        workflowDispatch:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.commands?.workflowDispatch ?? null,
      },
      controls: {
        noSecretValuesStored:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.controls?.noSecretValuesStored === true,
        localTemplateWriteNoGithubMutation:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.controls?.localTemplateWriteNoGithubMutation ===
          true,
        workflowDispatchRequiresRunWorkflows:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.controls?.workflowDispatchRequiresRunWorkflows ===
          true,
        storeSubmissionStillBlocked:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.controls?.storeSubmissionStillBlocked === true,
        revenueStillBlocked:
          payload.ownerUnlockPreflight.combinedOwnerInputPreflight.controls?.revenueStillBlocked === true,
      },
    }
  : null

const appPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  activePath: payload.activePath,
  liveCandidate: payload.liveCandidate,
  liveRelease: {
    syncedCandidateId: payload.liveRelease.syncedCandidateId,
    exactManifestPath: payload.liveRelease.exactManifestPath,
    staticJsonMayLagBehindLatestDeploy: payload.liveRelease.staticJsonMayLagBehindLatestDeploy,
  },
  publicEvidenceHandoff: appPublicEvidenceHandoff,
  analyticsUnlock: appAnalyticsUnlock,
  collectorDeployment: {
    status: payload.collectorDeployment.status,
    workflowStatus: payload.collectorDeployment.workflow.status,
    deploysWhenConfigured: payload.collectorDeployment.workflow.deploysWhenConfigured,
    smokeStatus: payload.collectorDeployment.smoke.status,
  },
  externalUnlockQueue: {
    status: payload.externalUnlockQueue.status,
    nextBestUnlockId: payload.externalUnlockQueue.nextBestUnlockId,
    nextBestZeroCostUnlockId: payload.externalUnlockQueue.nextBestZeroCostUnlockId,
    ownerActionRequired: payload.externalUnlockQueue.ownerActionRequired,
    ownerUnlockBrief: payload.externalUnlockQueue.ownerUnlockBrief
      ? {
          status: payload.externalUnlockQueue.ownerUnlockBrief.status,
          nextUnlockId: payload.externalUnlockQueue.ownerUnlockBrief.nextUnlockId,
          recommendedPathId: payload.externalUnlockQueue.ownerUnlockBrief.recommendedPathId,
          missingVariableCount: payload.externalUnlockQueue.ownerUnlockBrief.missingVariables.length,
          missingSecretCount: payload.externalUnlockQueue.ownerUnlockBrief.missingSecrets.length,
        }
      : null,
  },
  ownerUnlockPreflight: {
    status: payload.ownerUnlockPreflight.status,
    readyForSetup: payload.ownerUnlockPreflight.readyForSetup,
    lowestInputPathId: payload.ownerUnlockPreflight.lowestInputPath?.id ?? null,
    missingInputCount: payload.ownerUnlockPreflight.summary?.missingInputs ?? 0,
    invalidInputCount: payload.ownerUnlockPreflight.summary?.invalidInputs ?? 0,
    lowestInputMissingInputCount: payload.ownerUnlockPreflight.summary?.lowestInputMissingInputs ?? null,
    lowestInputSecretInputCount: payload.ownerUnlockPreflight.summary?.lowestInputSecretInputs ?? null,
    combinedOwnerInputPreflight: appCombinedOwnerInputPreflight,
  },
  ownerInputActionPack: payload.ownerInputActionPack,
}

const publicPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  activePath: payload.activePath,
  liveCandidate: payload.liveCandidate,
  liveRelease: payload.liveRelease,
  ownerRuntimeConfig: payload.ownerRuntimeConfig,
  analytics: payload.analytics,
  productGateEvidence: payload.productGateEvidence,
  productGateRecovery: {
    status: productGateRecovery.status,
    summary: productGateRecovery.summary ?? {},
    priorities: (productGateRecovery.priorities ?? []).slice(0, 3),
    publicRoutes: payload.publicRoutes
      ? {
          productGateRecovery: payload.publicRoutes.productGateRecovery,
          productGateRecoveryJson: payload.publicRoutes.productGateRecoveryJson,
        }
      : {},
    controls: {
      zeroPaidSpend: productGateRecovery.controls?.zeroPaidSpend === true,
      noSyntheticGatePasses: productGateRecovery.controls?.noSyntheticGatePasses === true,
      noRevenueEnablement: payload.controls.noRevenueEnablement,
    },
  },
  publicEvidenceHandoff: payload.publicEvidenceHandoff,
  analyticsUnlock: payload.analyticsUnlock,
  collectorDeployment: payload.collectorDeployment,
  externalUnlockQueue: payload.externalUnlockQueue,
  ownerUnlockPreflight: payload.ownerUnlockPreflight,
  ownerInputActionPack: payload.ownerInputActionPack,
  publicRoutes: payload.publicRoutes,
  blockers: payload.blockers,
  controls: payload.controls,
  nextActions: payload.nextActions,
}

const analyticsUnlockPayload = {
  generatedAt: payload.generatedAt,
  status: payload.analyticsUnlock?.status ?? 'missing',
  activePath: payload.activePath,
  liveCandidate: payload.liveCandidate,
  recommendedPathId: payload.analyticsUnlock?.recommendedPathId ?? null,
  lowestInputPathId: payload.analyticsUnlock?.lowestInputPathId ?? null,
  lowestInputMissingVariableCount: payload.analyticsUnlock?.lowestInputMissingVariableCount ?? 0,
  lowestInputMissingSecretCount: payload.analyticsUnlock?.lowestInputMissingSecretCount ?? 0,
  analyticsUnlock: payload.analyticsUnlock,
  collectorDeployment: payload.collectorDeployment,
  externalUnlockQueue: {
    status: payload.externalUnlockQueue.status,
    nextBestUnlockId: payload.externalUnlockQueue.nextBestUnlockId,
    nextBestZeroCostUnlockId: payload.externalUnlockQueue.nextBestZeroCostUnlockId,
    ownerActionRequired: payload.externalUnlockQueue.ownerActionRequired,
    missingEnvironmentItems: payload.externalUnlockQueue.missingEnvironmentItems,
    missingSecrets: payload.externalUnlockQueue.missingSecrets,
    productGateBlockers: payload.externalUnlockQueue.productGateBlockers,
    topItems: payload.externalUnlockQueue.topItems,
    ownerUnlockBrief: payload.externalUnlockQueue.ownerUnlockBrief,
  },
  ownerUnlockPreflight: payload.ownerUnlockPreflight,
  ownerInputActionPack: payload.ownerInputActionPack,
  publicRoutes: {
    statusPage: payload.publicRoutes.statusPage,
    statusJson: payload.publicRoutes.statusJson,
    analyticsUnlock: payload.publicRoutes.analyticsUnlock,
    analyticsUnlockJson: payload.publicRoutes.analyticsUnlockJson,
    ownerUnlockPreflightJson: payload.publicRoutes.ownerUnlockPreflightJson,
  },
  controls: {
    publicArtifact: true,
    zeroPaidSpend: true,
    noSecretValues: true,
    noSecretValuesStored: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    productGatesStillRequiredForRevenue: true,
    secretCommandsUseStdin: payload.analyticsUnlock?.controls.secretCommandsUseStdin === true,
  },
  nextActions: [
    ...(payload.analyticsUnlock?.nextActions ?? []),
    'Run validation commands after repository variables or stdin-fed secrets change.',
    'Return to the measurement status page before using production analytics for product gates.',
  ],
}

const commandList = (commands) =>
  commands.length
    ? `<ol>${commands.map((command) => `<li><code>${escapeHtml(command)}</code></li>`).join('')}</ol>`
    : '<p>none</p>'
const namedCommandList = (commands) =>
  commands && Object.keys(commands).length
    ? `<ol>${Object.entries(commands)
        .map(([key, command]) => `<li><strong>${escapeHtml(key)}</strong> <code>${escapeHtml(command)}</code></li>`)
        .join('')}</ol>`
    : '<p>none</p>'
const codeList = (items) =>
  items?.length ? `<ul>${items.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join('')}</ul>` : '<p>none</p>'

const requiredList = (items, labelKey = 'repositoryName') =>
  items.length
    ? `<ul>${items
        .map(
          (item) =>
            `<li><strong>${escapeHtml(item[labelKey] ?? item.name ?? 'unknown')}</strong> ${item.configured ? 'configured' : 'missing'}${item.command ? ` <code>${escapeHtml(item.command)}</code>` : ''}</li>`,
        )
        .join('')}</ul>`
    : '<p>none</p>'

const ownerUnlockBriefHtml = (brief) =>
  brief
    ? `<section>
        <h2>Owner Unlock Brief</h2>
        <p>This compact brief is the minimum next owner-controlled unlock. It publishes variable and secret names only; secret values stay outside the repository.</p>
        <div class="grid" aria-label="Owner unlock brief">
          <div class="card">
            <span>Next unlock</span>
            <strong>${escapeHtml(brief.nextUnlockId)}</strong>
          </div>
          <div class="card">
            <span>Recommended path</span>
            <strong>${escapeHtml(brief.recommendedPathId)}</strong>
          </div>
          <div class="card">
            <span>Lowest-input path</span>
            <strong>${escapeHtml(brief.lowestInputPathId ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Missing variables</span>
            <strong>${brief.missingVariables.length}</strong>
          </div>
          <div class="card">
            <span>Missing secrets</span>
            <strong>${brief.missingSecrets.length}</strong>
          </div>
          <div class="card">
            <span>Minimal inputs</span>
            <strong>${brief.minimalInterventionPath?.missingInputCount ?? 'n/a'}</strong>
          </div>
          <div class="card">
            <span>Minimal secrets</span>
            <strong>${brief.minimalInterventionPath?.missingSecretCount ?? 'n/a'}</strong>
          </div>
        </div>
        <h3>Parallel Owner Unlocks</h3>
        ${
          brief.parallelOwnerUnlocks?.length
            ? `<ul>${brief.parallelOwnerUnlocks
                .map(
                  (unlock) =>
                    `<li><strong>${escapeHtml(unlock.id)}</strong>: ${escapeHtml(unlock.category)} - ${unlock.missingInputCount ?? 0} missing input(s), status <a href="${publicRouteHref(unlock.publicStatusPage)}">${escapeHtml(unlock.publicStatusPage)}</a></li>`,
                )
                .join('')}</ul>`
            : '<p>none</p>'
        }
        ${
          brief.combinedOwnerInputPack
            ? `<h3>Combined Owner Input Pack</h3>
              <div class="grid" aria-label="Combined owner input pack">
                <div class="card">
                  <span>Local env file</span>
                  <strong>${escapeHtml(brief.combinedOwnerInputPack.localEnvFile)}</strong>
                </div>
                <div class="card">
                  <span>Missing inputs</span>
                  <strong>${brief.combinedOwnerInputPack.missingInputCount}</strong>
                </div>
                <div class="card">
                  <span>Secret inputs</span>
                  <strong>${brief.combinedOwnerInputPack.secretInputCount}</strong>
                </div>
                <div class="card">
                  <span>Workflow dispatch</span>
                  <strong>${brief.combinedOwnerInputPack.controls?.workflowDispatchRequiresRunWorkflows === true ? 'RUN_WORKFLOWS=1' : 'disabled'}</strong>
                </div>
              </div>
              <p>One ignored local env edit can cover ${escapeHtml(brief.combinedOwnerInputPack.unlockIds?.join(', ') ?? 'the owner unlocks')} while revenue and store submission stay blocked.</p>
              <h4>Local Env Template</h4>
              ${codeList(brief.combinedOwnerInputPack.localEnvTemplateLines)}
              <h4>Commands</h4>
              ${namedCommandList(brief.combinedOwnerInputPack.commands)}`
            : ''
        }
        <h3>Missing Variables</h3>
        ${requiredList(brief.missingVariables)}
        <h3>Missing Secrets</h3>
        ${requiredList(brief.missingSecrets)}
        <h3>Setup Commands</h3>
        ${commandList(brief.setupCommands)}
        <h3>Validation Commands</h3>
        ${commandList(brief.validationCommands)}
      </section>`
    : ''

const ownerUnlockPreflightHtml = (preflight) =>
  preflight
    ? `<section>
        <h2>Owner Unlock Preflight</h2>
        <p>This public preflight shows whether the next analytics setup can run. It publishes names, statuses, and guardrails only; raw values and secret contents are never serialized.</p>
        <div class="grid" aria-label="Owner unlock preflight">
          <div class="card">
            <span>Status</span>
            <strong>${escapeHtml(preflight.status)}</strong>
          </div>
          <div class="card">
            <span>Ready for setup</span>
            <strong>${preflight.readyForSetup === true}</strong>
          </div>
          <div class="card">
            <span>Ready inputs</span>
            <strong>${preflight.summary?.readyInputs ?? 0}/${preflight.summary?.totalInputs ?? 0}</strong>
          </div>
          <div class="card">
            <span>Lowest-input path</span>
            <strong>${escapeHtml(preflight.lowestInputPath?.id ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Lowest-input missing</span>
            <strong>${preflight.summary?.lowestInputMissingInputs ?? 'n/a'}</strong>
          </div>
          <div class="card">
            <span>Invalid inputs</span>
            <strong>${preflight.summary?.invalidInputs ?? 0}</strong>
          </div>
          <div class="card">
            <span>Minimal path</span>
            <strong>${escapeHtml(preflight.minimalInterventionPath?.pathId ?? preflight.lowestInputPath?.id ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Minimal secrets</span>
            <strong>${preflight.minimalInterventionPath?.secretInputs ?? 'n/a'}</strong>
          </div>
          <div class="card">
            <span>Owner pack</span>
            <strong>${escapeHtml(preflight.ownerInputPack?.localEnvFile ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Combined preflight</span>
            <strong>${escapeHtml(preflight.combinedOwnerInputPreflight?.status ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Combined missing</span>
            <strong>${preflight.combinedOwnerInputPreflight?.summary?.missingInputs ?? 'n/a'}</strong>
          </div>
        </div>
        <h3>Owner Input Pack</h3>
        <ul>
          ${
            preflight.ownerInputPack?.localEnvTemplateLines?.length
              ? preflight.ownerInputPack.localEnvTemplateLines
                  .map((line) => `<li><code>${escapeHtml(line)}</code></li>`)
                  .join('')
              : '<li>none</li>'
          }
        </ul>
        ${
          preflight.combinedOwnerInputPreflight
            ? `<h3>Combined Owner Input Preflight</h3>
              <ul>
                <li><strong>Status</strong>: ${escapeHtml(preflight.combinedOwnerInputPreflight.status)}</li>
                <li><strong>Local env</strong>: <code>${escapeHtml(preflight.combinedOwnerInputPreflight.localEnvFile)}</code></li>
                <li><strong>Missing</strong>: ${escapeHtml(preflight.combinedOwnerInputPreflight.missingInputNames?.join(', ') || 'none')}</li>
                <li><strong>Secrets</strong>: ${preflight.combinedOwnerInputPreflight.summary?.secretInputs ?? 0}</li>
                <li><strong>Support validation</strong>: ${escapeHtml(preflight.combinedOwnerInputPreflight.inputs?.find((input) => input.envName === 'AGL_SUPPORT_EMAIL')?.validation?.status ?? 'unknown')}</li>
              </ul>
              <h4>Combined Local Env Template</h4>
              ${codeList(preflight.combinedOwnerInputPreflight.localEnvTemplateLines)}`
            : ''
        }
        <h3>Path Options</h3>
        <ul>
          ${
            preflight.pathPreflights?.length
              ? preflight.pathPreflights
                  .map(
                    (pathPreflight) =>
                      `<li><strong>${escapeHtml(pathPreflight.role)}</strong>: ${escapeHtml(pathPreflight.path?.id ?? 'missing')} - ${pathPreflight.summary?.missingInputs ?? 0} missing input(s), ${pathPreflight.summary?.secretInputs ?? 0} secret input(s)</li>`,
                  )
                  .join('')
              : '<li>none</li>'
          }
        </ul>
        <h3>Missing Inputs</h3>
        ${requiredList(preflight.missingInputs ?? [])}
        <h3>Invalid Inputs</h3>
        ${requiredList(preflight.invalidInputs ?? [])}
      </section>`
    : ''

const ownerInputActionPackHtml = (pack) =>
  pack
    ? `<section aria-label="Zero-secret owner input pack">
        <h2>Zero-Secret Owner Input Pack</h2>
        <p>This browser handoff packages the current lowest-input analytics and support-contact values as empty placeholders only. Downloads and copy actions stay on this device and write only a local receipt.</p>
        <div class="grid" aria-label="Zero-secret owner input summary">
          <div class="card">
            <span>Status</span>
            <strong>${escapeHtml(pack.status)}</strong>
          </div>
          <div class="card">
            <span>Local env file</span>
            <strong>${escapeHtml(pack.localEnvFile)}</strong>
          </div>
          <div class="card">
            <span>Missing inputs</span>
            <strong>${pack.missingInputCount}</strong>
          </div>
          <div class="card">
            <span>Runtime minimum</span>
            <strong>${pack.runtimeConfigMinimum.missingMinimumInputCount ? `${pack.runtimeConfigMinimum.missingMinimumInputCount} missing` : 'ready'}</strong>
          </div>
          <div class="card">
            <span>Minimum public input</span>
            <strong>${escapeHtml(pack.runtimeConfigMinimum.minimumPublicInputNames.join(', '))}</strong>
          </div>
          <div class="card">
            <span>Optional runtime input</span>
            <strong>${escapeHtml(pack.runtimeConfigMinimum.optionalPublicInputNames.join(', ') || 'none')}</strong>
          </div>
          <div class="card">
            <span>Secret inputs</span>
            <strong>${pack.secretInputCount}</strong>
          </div>
          <div class="card">
            <span>Unlocks</span>
            <strong>${escapeHtml(pack.unlockIds.join(', ') || 'none')}</strong>
          </div>
          <div class="card">
            <span>Dispatch gate</span>
            <strong>${pack.controls.workflowDispatchRequiresRunWorkflows ? 'RUN_WORKFLOWS=1 required' : 'disabled'}</strong>
          </div>
        </div>
        <h3>Local Env Template</h3>
        ${codeList(pack.localEnvTemplateLines)}
        <h3>Shell Export Template</h3>
        ${codeList(pack.shellExportTemplateLines)}
        <h3>Commands After Values Are Filled</h3>
        ${namedCommandList(pack.commands)}
        <h3>Local Zero-Secret Value Check</h3>
        <div class="ownerInputFields" aria-label="Local zero-secret owner value check">
          ${pack.valueValidation.fields
            .map(
              (field) => `<label class="ownerInputField" for="${escapeHtml(field.inputId)}">
            <span>${escapeHtml(field.title)}</span>
            <input id="${escapeHtml(field.inputId)}" type="${escapeHtml(field.inputType)}" inputmode="${field.validationKind === 'email-shape' ? 'email' : 'text'}" autocomplete="off" spellcheck="false" maxlength="${field.maxLength}" placeholder="${escapeHtml(field.placeholder)}" data-owner-input="${escapeHtml(field.envName)}" data-validation-kind="${escapeHtml(field.validationKind)}" />
          </label>`,
            )
            .join('\n          ')}
        </div>
        <div class="actions">
          <button type="button" id="validate-owner-input-values">Check zero-secret values</button>
          <button type="button" id="download-filled-owner-input-template" disabled>Download filled local env</button>
          <button type="button" id="copy-filled-owner-shell-template" disabled>Copy filled shell exports</button>
          <button type="button" id="download-owner-runtime-config-preview" disabled>Download runtime config preview</button>
          <button type="button" id="copy-production-input-watch-command" disabled>Copy input watch command</button>
        </div>
        <p class="localExportStatus" id="owner-input-validation-status" aria-live="polite">Waiting for local values. Typed values stay in this browser session unless you choose a local download or copy action; generated artifacts contain only field names.</p>
        <div class="actions">
          <button type="button" id="copy-owner-input-template">Copy local env template</button>
          <button type="button" id="download-owner-input-template">Download local env template</button>
          <button type="button" id="copy-owner-shell-template">Copy shell exports</button>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.ownerUnlockPreflightJson))}">Open preflight JSON</a>
        </div>
        <p class="localExportStatus" id="owner-input-pack-status" aria-live="polite">Ready to copy or download placeholders. No values or secrets are stored in this page.</p>
      </section>`
    : ''

const collectorDeploymentHtml = (deployment) =>
  deployment
    ? `<section>
        <h2>First-Party Collector Deployment</h2>
        <p>This public deployment plan shows whether the Cloudflare Worker/R2 collector can deploy. It publishes readiness booleans, command names, and check statuses only; account IDs, tokens, and secret values are not serialized.</p>
        <div class="grid" aria-label="First-party collector deployment">
          <div class="card">
            <span>Status</span>
            <strong>${escapeHtml(deployment.status)}</strong>
          </div>
          <div class="card">
            <span>Workflow</span>
            <strong>${escapeHtml(deployment.workflow?.status ?? 'missing')}</strong>
          </div>
          <div class="card">
            <span>Collector smoke</span>
            <strong>${escapeHtml(deployment.smoke?.status ?? 'missing')}</strong>
          </div>
          <div class="card">
            <span>Deploy gate</span>
            <strong>${deployment.workflow?.deploysWhenConfigured === true}</strong>
          </div>
          <div class="card">
            <span>Deploy check</span>
            <strong>${deployment.checks?.some((check) => check.id === 'deploy-workflow') ? 'deploy-workflow' : 'missing'}</strong>
          </div>
          <div class="card">
            <span>Summary endpoint</span>
            <strong>${escapeHtml(deployment.worker?.endpoints?.summary ?? 'missing')}</strong>
          </div>
          <div class="card">
            <span>Aggregate only</span>
            <strong>${deployment.smoke?.summaryAggregateOnly === true}</strong>
          </div>
        </div>
        <h3>Checks</h3>
        <ul>
          ${
            deployment.checks?.length
              ? deployment.checks
                  .map(
                    (check) =>
                      `<li><strong>${escapeHtml(check.status)}</strong>: ${escapeHtml(check.id)} - ${escapeHtml(check.detail)}</li>`,
                  )
                  .join('\n          ')
              : '<li>No collector deployment checks are available yet.</li>'
          }
        </ul>
        <h3>One-Time Setup</h3>
        <ul>
          ${
            deployment.setupRequiredOnce?.length
              ? deployment.setupRequiredOnce.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n          ')
              : '<li>Regenerate the collector deployment plan before setup.</li>'
          }
        </ul>
        <h3>Commands</h3>
        ${commandList([deployment.commands?.smoke, deployment.commands?.plan, deployment.commands?.deployWorkflow])}
      </section>`
    : ''

const analyticsUnlockHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Production Analytics Unlock | Autonomous Game Lab</title>
    <style>
      :root {
        color: #191713;
        background: #fbf7ef;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
      }

      body {
        margin: 0;
      }

      main {
        width: min(980px, calc(100% - 32px));
        margin: 0 auto;
        padding: 44px 0;
      }

      h1,
      h2,
      h3 {
        line-height: 1.08;
        margin: 0;
      }

      h1 {
        font-size: clamp(2rem, 6vw, 4.2rem);
        max-width: 780px;
      }

      p {
        max-width: 760px;
      }

      a {
        color: #187f7a;
        font-weight: 700;
      }

      code {
        overflow-wrap: anywhere;
      }

      .eyebrow {
        color: #7d2f18;
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin: 28px 0;
      }

      .card {
        border: 1px solid #d9d0bf;
        border-radius: 8px;
        background: #fffdf7;
        padding: 16px;
      }

      .card span {
        display: block;
        color: #6d675c;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .card strong {
        display: block;
        margin-top: 8px;
        overflow-wrap: anywhere;
        font-size: 1.05rem;
      }

      section {
        border-top: 1px solid #d9d0bf;
        padding: 22px 0;
      }

      ul,
      ol {
        padding-left: 20px;
      }

      li {
        margin: 6px 0;
      }

      .ownerInputFields {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        margin: 18px 0;
      }

      .ownerInputField {
        display: grid;
        gap: 8px;
      }

      .ownerInputField span {
        color: #6d675c;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .ownerInputField input {
        border: 1px solid #d9d0bf;
        border-radius: 8px;
        color: #191713;
        font: inherit;
        min-height: 44px;
        padding: 8px 10px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .actions a,
      .actions button {
        border: 1px solid #187f7a;
        border-radius: 8px;
        background: transparent;
        color: #187f7a;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        padding: 10px 12px;
        text-decoration: none;
      }

      .actions button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .localExportStatus {
        color: #6d675c;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Autonomous Game Lab</p>
      <h1>Production Analytics Unlock</h1>
      <p>This generated handoff exposes the next zero-spend measurement unlock without secret values, account creation, store submission, paid acquisition, or revenue enablement.</p>

      <div class="grid" aria-label="Analytics unlock summary">
        <div class="card">
          <span>Status</span>
          <strong>${escapeHtml(analyticsUnlockPayload.status)}</strong>
        </div>
        <div class="card">
          <span>Recommended path</span>
          <strong>${escapeHtml(analyticsUnlockPayload.recommendedPathId ?? 'none')}</strong>
        </div>
        <div class="card">
          <span>Lowest-input path</span>
          <strong>${escapeHtml(analyticsUnlockPayload.lowestInputPathId ?? 'none')}</strong>
        </div>
        <div class="card">
          <span>Minimal inputs</span>
          <strong>${analyticsUnlockPayload.analyticsUnlock?.minimalInterventionPath?.missingInputCount ?? 'n/a'}</strong>
        </div>
        <div class="card">
          <span>Minimal secrets</span>
          <strong>${analyticsUnlockPayload.analyticsUnlock?.minimalInterventionPath?.missingSecretCount ?? 'n/a'}</strong>
        </div>
        <div class="card">
          <span>Owner actions</span>
          <strong>${analyticsUnlockPayload.externalUnlockQueue.ownerActionRequired}</strong>
        </div>
        <div class="card">
          <span>Missing secrets</span>
          <strong>${analyticsUnlockPayload.externalUnlockQueue.missingSecrets}</strong>
        </div>
      </div>

      ${ownerUnlockBriefHtml(analyticsUnlockPayload.externalUnlockQueue.ownerUnlockBrief)}
      ${ownerUnlockPreflightHtml(analyticsUnlockPayload.ownerUnlockPreflight)}
      ${collectorDeploymentHtml(analyticsUnlockPayload.collectorDeployment)}

      <section>
        <h2>Unlock Paths</h2>
        ${
          analyticsUnlockPayload.analyticsUnlock
            ? analyticsUnlockPayload.analyticsUnlock.paths
                .map(
                  (unlockPath) => `<article class="card" aria-label="${escapeHtml(unlockPath.id)}">
          <span>${escapeHtml(unlockPath.status)}</span>
          <h3>${escapeHtml(unlockPath.title)}</h3>
          <p>${escapeHtml(unlockPath.costMode)}</p>
          <p>Missing inputs: ${unlockPath.missingVariableCount ?? 0} variable(s), ${unlockPath.missingSecretCount ?? 0} secret(s)</p>
          <h3>Repository Variables</h3>
          ${requiredList(unlockPath.requiredVariables)}
          <h3>Repository Secrets</h3>
          ${requiredList(unlockPath.requiredSecrets)}
          <h3>Setup Commands</h3>
          ${commandList(unlockPath.commandSequence)}
          <h3>Validation Commands</h3>
          ${commandList(unlockPath.validationCommands)}
        </article>`,
                )
                .join('\n        ')
            : '<p>No analytics unlock kit is available yet.</p>'
        }
      </section>

      <section>
        <h2>External Queue</h2>
        <div class="grid" aria-label="External unlock queue">
          <div class="card">
            <span>Queue</span>
            <strong>${escapeHtml(analyticsUnlockPayload.externalUnlockQueue.status)}</strong>
          </div>
          <div class="card">
            <span>Next unlock</span>
            <strong>${escapeHtml(analyticsUnlockPayload.externalUnlockQueue.nextBestUnlockId ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Missing variables</span>
            <strong>${analyticsUnlockPayload.externalUnlockQueue.missingEnvironmentItems}</strong>
          </div>
          <div class="card">
            <span>Product blockers</span>
            <strong>${analyticsUnlockPayload.externalUnlockQueue.productGateBlockers}</strong>
          </div>
        </div>
        ${analyticsUnlockPayload.externalUnlockQueue.topItems
          .map(
            (item) => `<article class="card">
          <span>${escapeHtml(item.status)}</span>
          <h3>${escapeHtml(item.id)} - ${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.costMode)}; owner input required: ${item.ownerInputRequired}</p>
          <p>Variables: ${escapeHtml(item.requiredEnv.map((env) => env.name).filter(Boolean).join(', ') || 'none')}</p>
          <p>Secrets: ${escapeHtml(item.requiredSecrets.map((secret) => secret.repositoryName).filter(Boolean).join(', ') || 'none')}</p>
          <p>After unlock: ${escapeHtml(item.afterUnlockCommands.join(' && ') || 'none')}</p>
        </article>`,
          )
          .join('\n        ')}
      </section>

      <section>
        <h2>Controls</h2>
        <ul>
          <li>Zero paid spend: ${analyticsUnlockPayload.controls.zeroPaidSpend}</li>
          <li>No secret values: ${analyticsUnlockPayload.controls.noSecretValues}</li>
          <li>No secret values stored: ${analyticsUnlockPayload.controls.noSecretValuesStored}</li>
          <li>No account creation: ${analyticsUnlockPayload.controls.noAccountCreation}</li>
          <li>No store submission: ${analyticsUnlockPayload.controls.noStoreSubmission}</li>
          <li>No revenue enablement: ${analyticsUnlockPayload.controls.noRevenueEnablement}</li>
          <li>Secret commands use stdin: ${analyticsUnlockPayload.controls.secretCommandsUseStdin}</li>
        </ul>
      </section>

      <section>
        <h2>Next Actions</h2>
        <ul>
          ${analyticsUnlockPayload.nextActions.map((action) => `<li>${escapeHtml(action)}</li>`).join('\n          ')}
        </ul>
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(analyticsUnlockPayload.publicRoutes.statusPage))}">Open measurement status</a>
          <a href="${escapeHtml(publicRouteHref(analyticsUnlockPayload.publicRoutes.analyticsUnlockJson))}">Open unlock JSON</a>
          <a href="${escapeHtml(publicRouteHref(analyticsUnlockPayload.publicRoutes.ownerUnlockPreflightJson))}">Open preflight JSON</a>
        </div>
      </section>
    </main>
  </body>
</html>
`

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Production Measurement Status | Autonomous Game Lab</title>
    <style>
      :root {
        color: #191713;
        background: #fbf7ef;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
      }

      body {
        margin: 0;
      }

      main {
        width: min(960px, calc(100% - 32px));
        margin: 0 auto;
        padding: 44px 0;
      }

      h1,
      h2 {
        line-height: 1.08;
        margin: 0;
      }

      h1 {
        font-size: clamp(2rem, 6vw, 4.2rem);
        max-width: 780px;
      }

      p {
        max-width: 760px;
      }

      a {
        color: #187f7a;
        font-weight: 700;
      }

      code {
        overflow-wrap: anywhere;
      }

      .eyebrow {
        color: #7d2f18;
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin: 28px 0;
      }

      .card {
        border: 1px solid #d9d0bf;
        border-radius: 8px;
        background: #fffdf7;
        padding: 16px;
      }

      .card span {
        display: block;
        color: #6d675c;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .card strong {
        display: block;
        margin-top: 8px;
        overflow-wrap: anywhere;
        font-size: 1.05rem;
      }

      section {
        border-top: 1px solid #d9d0bf;
        padding: 22px 0;
      }

      ul,
      ol {
        padding-left: 20px;
      }

      li {
        margin: 6px 0;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .actions a,
      .actions button {
        border: 1px solid #187f7a;
        border-radius: 8px;
        background: transparent;
        color: #187f7a;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        padding: 10px 12px;
        text-decoration: none;
      }

      .actions button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .localExportStatus {
        color: #6d675c;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Autonomous Game Lab</p>
      <h1>Production Measurement Status</h1>
      <p>This generated page exposes the current measurement route without secrets, raw event rows, account changes, paid services, store submission, or revenue enablement.</p>

      <div class="grid" aria-label="Measurement status">
        <div class="card">
          <span>Status</span>
          <strong>${escapeHtml(payload.status)}</strong>
        </div>
        <div class="card">
          <span>Active path</span>
          <strong>${escapeHtml(payload.activePath)}</strong>
        </div>
        <div class="card">
          <span>Browser forwarding</span>
          <strong>${payload.analytics.browserForwarding.configured ? 'configured' : 'local buffer only'}</strong>
        </div>
        <div class="card">
          <span>Autonomous rollups</span>
          <strong>${payload.analytics.autonomousRollups.configured ? 'configured' : 'credential gated'}</strong>
        </div>
      </div>

      <section>
        <h2>Live Release Evidence</h2>
        <p>The synced evidence candidate comes from the latest post-deploy artifact import. The exact live manifest is read directly from this deployed site at runtime, so the page can show the current release without triggering another deploy loop.</p>
        <div class="grid" aria-label="Live release evidence">
          <div class="card">
            <span>Synced evidence candidate</span>
            <strong>${escapeHtml(payload.liveRelease.syncedCandidateId ?? 'missing')}</strong>
          </div>
          <div class="card">
            <span>Exact live manifest</span>
            <strong id="exact-live-candidate">checking</strong>
          </div>
          <div class="card">
            <span>Manifest match</span>
            <strong id="exact-live-match">checking</strong>
          </div>
          <div class="card">
            <span>Status JSON caveat</span>
            <strong>${payload.liveRelease.staticJsonMayLagBehindLatestDeploy ? 'sync commit can lag deploy' : 'current'}</strong>
          </div>
        </div>
      </section>

      <section>
        <h2>Owner Runtime Config</h2>
        <p>This read-only check fetches the deployed owner runtime config from this site and reports readiness statuses only. It does not display public input values, dispatch workflows, mutate GitHub, enable revenue, or submit stores.</p>
        <div class="grid" aria-label="Owner runtime config">
          <div class="card">
            <span>Synced config status</span>
            <strong>${escapeHtml(payload.ownerRuntimeConfig.syncedStatus)}</strong>
          </div>
          <div class="card">
            <span>Live config status</span>
            <strong id="owner-runtime-config-live-status">checking</strong>
          </div>
          <div class="card">
            <span>PostHog browser</span>
            <strong id="owner-runtime-posthog-status">checking</strong>
          </div>
          <div class="card">
            <span>Support contact</span>
            <strong id="owner-runtime-support-status">checking</strong>
          </div>
          <div class="card">
            <span>Configured public inputs</span>
            <strong id="owner-runtime-config-inputs">checking</strong>
          </div>
          <div class="card">
            <span>Next runtime step</span>
            <strong id="owner-runtime-next-action">checking</strong>
          </div>
          <div class="card">
            <span>After input watch</span>
            <strong>${escapeHtml(payload.ownerRuntimeConfig.deploymentChain.status)}</strong>
          </div>
        </div>
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.ownerRuntimeConfig))}">Open runtime config</a>
        </div>
      </section>

      <section>
        <h2>Local Browser Evidence</h2>
        <div class="grid" aria-label="Local browser evidence">
          <div class="card">
            <span>Events on this device</span>
            <strong id="local-event-count">checking</strong>
          </div>
          <div class="card">
            <span>Last local event</span>
            <strong id="local-event-latest">checking</strong>
          </div>
          <div class="card">
            <span>Last export</span>
            <strong id="local-export-latest">checking</strong>
          </div>
          <div class="card">
            <span>Bridge</span>
            <strong>${escapeHtml(payload.analytics.localEvidence.bridgeStatus)}</strong>
          </div>
        </div>
        <div class="actions">
          <button type="button" id="export-local-event-drop">Download local event drop</button>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.gateSample))}">Open gate sample</a>
        </div>
        <p class="localExportStatus" id="local-export-status" aria-live="polite">${escapeHtml(payload.publicEvidenceHandoff.measurementPageExport.status)}</p>
      </section>

      ${ownerInputActionPackHtml(payload.ownerInputActionPack)}

      <section>
        <h2>Product Evidence</h2>
        <div class="grid" aria-label="Product evidence">
          <div class="card">
            <span>Sample plan</span>
            <strong>${escapeHtml(payload.productGateEvidence.status)}</strong>
          </div>
          <div class="card">
            <span>Recovery plan</span>
            <strong>${escapeHtml(payload.productGateEvidence.recoveryStatus)}</strong>
          </div>
          <div class="card">
            <span>Primary bottleneck</span>
            <strong>${escapeHtml(payload.productGateEvidence.recoverySummary?.primaryBottleneck ?? 'waiting')}</strong>
          </div>
          <div class="card">
            <span>Primary mission</span>
            <strong>${escapeHtml(payload.productGateEvidence.primaryMission?.title ?? 'waiting')}</strong>
          </div>
          <div class="card">
            <span>Gate</span>
            <strong>${escapeHtml(payload.productGateEvidence.primaryMission?.gateId ?? 'waiting')}</strong>
          </div>
          <div class="card">
            <span>Aggregate notes</span>
            <strong>${payload.analytics.localEvidence.aggregateEvidenceNotes}</strong>
          </div>
          <div class="card">
            <span>Aggregate mission matches</span>
            <strong>${payload.productGateEvidence.aggregateEvidenceMissionCount}</strong>
          </div>
          <div class="card">
            <span>Current sample route</span>
            <strong>${escapeHtml(payload.productGateEvidence.sampleNextRoute.path)}</strong>
          </div>
          <div class="card">
            <span>Fastest sample route</span>
            <strong>${escapeHtml(payload.productGateEvidence.sampleFastestRoute.path)}</strong>
          </div>
          <div class="card">
            <span>Route campaign</span>
            <strong>${escapeHtml(payload.productGateEvidence.sampleNextRoute.targetCampaignId ?? 'waiting')}</strong>
          </div>
          <div class="card">
            <span>Fastest campaign</span>
            <strong>${escapeHtml(payload.productGateEvidence.sampleFastestRoute.targetCampaignId ?? 'waiting')}</strong>
          </div>
        </div>
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.sampleNext))}">Start current sample</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.sampleFastest))}">Start fastest sample</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.productGateRecovery))}">Open recovery plan</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.gateSample))}">Open all missions</a>
        </div>
      </section>

      <section>
        <h2>Player Evidence Invite Pack</h2>
        <p>Zero-spend tester routes for the current product gates. Public notes remain aggregate-only supporting evidence; local event drops or configured production analytics are still required before gate decisions.</p>
        <div class="grid" aria-label="Player evidence invite pack">
          <div class="card">
            <span>Pack</span>
            <strong>${escapeHtml(payload.publicEvidenceHandoff.playerInvitePack.status)}</strong>
          </div>
          <div class="card">
            <span>Pack ID</span>
            <strong>${escapeHtml(payload.publicEvidenceHandoff.playerInvitePack.id)}</strong>
          </div>
          <div class="card">
            <span>Routes</span>
            <strong>${payload.publicEvidenceHandoff.playerInvitePack.summary.routes}</strong>
          </div>
          <div class="card">
            <span>Needed views</span>
            <strong>${payload.publicEvidenceHandoff.playerInvitePack.summary.totalPromptViewsNeeded}</strong>
          </div>
          <div class="card">
            <span>Needed successes</span>
            <strong>${payload.publicEvidenceHandoff.playerInvitePack.summary.totalObservedSuccessesNeeded}</strong>
          </div>
          <div class="card">
            <span>Evidence ready</span>
            <strong>${payload.publicEvidenceHandoff.playerInvitePack.summary.evidenceReadyCount}</strong>
          </div>
          <div class="card">
            <span>Aggregate notes</span>
            <strong>${payload.publicEvidenceHandoff.playerInvitePack.summary.aggregateEvidenceNotes}</strong>
          </div>
        </div>
        <h3>Tester Routes</h3>
        <ul>
          ${payload.publicEvidenceHandoff.playerInvitePack.routes
            .map(
              (route) =>
                `<li><strong>${escapeHtml(route.title)}</strong>: <code>${escapeHtml(route.path)}</code> ${escapeHtml(route.targetGateId ?? 'all gates')} needs ${route.neededPromptViews} view(s) and ${route.neededSuccesses} success(es).</li>`,
            )
            .join('\n          ')}
        </ul>
        <h3>Follow-Up Commands</h3>
        ${codeList(payload.publicEvidenceHandoff.playerInvitePack.followUpCommands)}
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicEvidenceHandoff.playerInvitePack.routes[0]?.path, payload.publicRoutes.sampleNext))}">Start invite route</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicEvidenceHandoff.playerInvitePack.routes[1]?.path, payload.publicRoutes.sampleFastest))}">Start fastest invite</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicEvidenceHandoff.playerInvitePack.publicReview.aggregateEvidenceIssue, payload.publicRoutes.support))}">Open aggregate note</a>
        </div>
      </section>

      <section>
        <h2>Public Aggregate Evidence</h2>
        <p>Player-initiated public issue notes are supporting diagnosis only. They help route what to investigate next, but they do not pass product gates, enable revenue, or replace production analytics.</p>
        <div class="grid" aria-label="Public aggregate evidence">
          <div class="card">
            <span>Handoff</span>
            <strong>${escapeHtml(payload.publicEvidenceHandoff.status)}</strong>
          </div>
          <div class="card">
            <span>Aggregate starts</span>
            <strong>${payload.publicEvidenceHandoff.aggregateEvidence.starts}</strong>
          </div>
          <div class="card">
            <span>Aggregate completions</span>
            <strong>${payload.publicEvidenceHandoff.aggregateEvidence.completions}</strong>
          </div>
          <div class="card">
            <span>Gate safety</span>
            <strong>${payload.publicEvidenceHandoff.controls.aggregateEvidenceDoesNotPassGates ? 'does not pass gates' : 'review'}</strong>
          </div>
        </div>
        <ul>
          ${
            payload.publicEvidenceHandoff.aggregateEvidence.topNotes.length
              ? payload.publicEvidenceHandoff.aggregateEvidence.topNotes
                  .map(
                    (note) =>
                      `<li>#${escapeHtml(note.number)} ${escapeHtml(note.status)} ${escapeHtml(note.gameId ?? 'unmatched')} ${escapeHtml(note.campaignId ?? 'unassigned')}: ${escapeHtml(note.counts.starts)} start(s), ${escapeHtml(note.counts.completions)} completion(s)</li>`,
                  )
                  .join('\n          ')
              : '<li>Awaiting player-initiated aggregate notes.</li>'
          }
        </ul>
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.analyticsEvidenceIssue, payload.publicRoutes.support))}">Open aggregate evidence issue</a>
        </div>
      </section>

      ${ownerUnlockBriefHtml(payload.externalUnlockQueue.ownerUnlockBrief)}
      ${ownerUnlockPreflightHtml(payload.ownerUnlockPreflight)}
      ${collectorDeploymentHtml(payload.collectorDeployment)}

      <section>
        <h2>Zero-Spend Analytics Unlock</h2>
        <p>This handoff publishes configuration names and safe commands only. Secret values stay outside tracked files, revenue remains disabled, and product gates still require real player evidence.</p>
        <div class="grid" aria-label="Zero-spend analytics unlock">
          <div class="card">
            <span>Unlock</span>
            <strong>${escapeHtml(payload.analyticsUnlock?.status ?? 'missing')}</strong>
          </div>
          <div class="card">
            <span>Recommended path</span>
            <strong>${escapeHtml(payload.analyticsUnlock?.recommendedPathId ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Lowest-input path</span>
            <strong>${escapeHtml(payload.analyticsUnlock?.lowestInputPathId ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Minimal inputs</span>
            <strong>${payload.analyticsUnlock?.minimalInterventionPath?.missingInputCount ?? 'n/a'}</strong>
          </div>
          <div class="card">
            <span>Minimal secrets</span>
            <strong>${payload.analyticsUnlock?.minimalInterventionPath?.missingSecretCount ?? 'n/a'}</strong>
          </div>
          <div class="card">
            <span>Setup commands</span>
            <strong>${payload.analyticsUnlock?.commandCount ?? 0}</strong>
          </div>
          <div class="card">
            <span>Validation commands</span>
            <strong>${payload.analyticsUnlock?.validationCommandCount ?? 0}</strong>
          </div>
        </div>
        ${
          payload.analyticsUnlock
            ? payload.analyticsUnlock.paths
                .map(
                  (unlockPath) => `<article class="card">
            <span>${escapeHtml(unlockPath.title)}</span>
            <strong>${escapeHtml(unlockPath.status)}</strong>
            <p>${escapeHtml(unlockPath.costMode)}</p>
            <p>Missing inputs: ${unlockPath.missingVariableCount ?? 0} variable(s), ${unlockPath.missingSecretCount ?? 0} secret(s)</p>
            <p>Variables: ${escapeHtml(unlockPath.requiredVariables.map((item) => item.repositoryName).join(', ') || 'none')}</p>
            <p>Secrets: ${escapeHtml(unlockPath.requiredSecrets.map((item) => item.repositoryName).join(', ') || 'none')}</p>
            <p>Commands: ${escapeHtml(unlockPath.commandSequence.join(' && ') || 'none')}</p>
          </article>`,
                )
                .join('\n        ')
            : '<p>No analytics unlock kit is available yet.</p>'
        }
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.analyticsUnlock))}">Open analytics unlock</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.ownerUnlockPreflightJson))}">Open preflight JSON</a>
        </div>
      </section>

      <section>
        <h2>External Unlock Queue</h2>
        <p>These are the remaining owner inputs ranked for zero-spend progress. The queue publishes names and commands only; it does not create accounts, mutate services, submit stores, or reveal secret values.</p>
        <div class="grid" aria-label="External unlock queue">
          <div class="card">
            <span>Queue</span>
            <strong>${escapeHtml(payload.externalUnlockQueue.status)}</strong>
          </div>
          <div class="card">
            <span>Next unlock</span>
            <strong>${escapeHtml(payload.externalUnlockQueue.nextBestUnlockId ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Owner actions</span>
            <strong>${payload.externalUnlockQueue.ownerActionRequired}</strong>
          </div>
          <div class="card">
            <span>Missing secrets</span>
            <strong>${payload.externalUnlockQueue.missingSecrets}</strong>
          </div>
        </div>
        ${payload.externalUnlockQueue.topItems
          .map(
            (item) => `<article class="card">
            <span>${escapeHtml(item.status)}</span>
            <strong>${escapeHtml(item.id)} - ${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.costMode)}; owner input required: ${item.ownerInputRequired}</p>
            <p>Variables: ${escapeHtml(item.requiredEnv.map((env) => env.name).filter(Boolean).join(', ') || 'none')}</p>
            <p>Secrets: ${escapeHtml(item.requiredSecrets.map((secret) => secret.repositoryName).filter(Boolean).join(', ') || 'none')}</p>
            <p>After unlock: ${escapeHtml(item.afterUnlockCommands.join(' && ') || 'none')}</p>
          </article>`,
          )
          .join('\n        ')}
      </section>

      <section>
        <h2>Controls</h2>
        <ul>
          <li>Zero paid spend: ${payload.controls.zeroPaidSpend}</li>
          <li>No secret values: ${payload.controls.noSecretValues}</li>
          <li>No raw analytics rows: ${payload.controls.noRawAnalyticsRows}</li>
          <li>Player-initiated exports only: ${payload.controls.playerInitiatedExportsOnly}</li>
          <li>Aggregate evidence does not pass gates: ${payload.controls.aggregateEvidenceDoesNotPassGates}</li>
          <li>Manual review required for gate decisions: ${payload.controls.manualReviewRequiredForGateDecisions}</li>
          <li>No revenue enablement: ${payload.controls.noRevenueEnablement}</li>
        </ul>
      </section>

      <section>
        <h2>Next Actions</h2>
        <ul>
          ${payload.nextActions.map((action) => `<li>${escapeHtml(action)}</li>`).join('\n          ')}
        </ul>
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.sampleNext))}">Start current sample</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.gateSample))}">Open gate sample</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.productGateRecovery))}">Open recovery plan</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.analyticsUnlock))}">Open analytics unlock</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.support))}">Open support</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.statusJson))}">Open status JSON</a>
        </div>
      </section>
    </main>
    <script>
      (() => {
        const analyticsKey = 'agl.analytics.events'
        const localExportReceiptKey = 'agl.analytics.localExportReceipt'
        const exportSurface = ${JSON.stringify(measurementPageExport.exportSurface)}
        const exportSurfaceDetail = ${JSON.stringify(measurementPageExport.exportSurfaceDetail)}
        const ownerInputActionPack = ${JSON.stringify(ownerInputActionPack)}
        const readJson = (key, fallback) => {
          try {
            const raw = window.localStorage.getItem(key)
            return raw ? JSON.parse(raw) : fallback
          } catch {
            return fallback
          }
        }
        const writeJson = (key, value) => {
          try {
            window.localStorage.setItem(key, JSON.stringify(value))
          } catch {
            // A download can still happen even if the receipt cannot be stored.
          }
        }
        const readEvents = () => {
          const events = readJson(analyticsKey, [])
          return Array.isArray(events) ? events : []
        }
        const createId = (prefix) =>
          window.crypto?.randomUUID
            ? prefix + '-' + window.crypto.randomUUID()
            : prefix + '-' + Date.now() + '-' + Math.random().toString(16).slice(2)
        const sanitizeFilePart = (value) => {
          const cleaned = String(value || 'manual')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
          return cleaned || 'manual'
        }
        const eventDropFileName = (surface, timestamp) =>
          'player-events-' +
          timestamp.replace(/[:.]/g, '-') +
          '-' +
          sanitizeFilePart(surface) +
          '.json'
        const exportCoverage = (events, receipt) => {
          const exportedEventCount = Number(receipt?.exportedEventCount)
          const unexportedEvents = receipt
            ? Math.max(0, events.length - (Number.isFinite(exportedEventCount) ? exportedEventCount : 0))
            : events.length
          return {
            exportedEventCount: events.length - unexportedEvents,
            unexportedEvents,
            coverageRatio: events.length ? (events.length - unexportedEvents) / events.length : receipt ? 1 : 0,
          }
        }
        const updateLocalEvidenceStats = (message) => {
          const events = readEvents()
          const receipt = readJson(localExportReceiptKey, null)
          const latest = events.length ? events[events.length - 1] : null
          document.getElementById('local-event-count').textContent = String(events.length)
          document.getElementById('local-event-latest').textContent = latest?.createdAt ? latest.createdAt.slice(0, 19) : 'none'
          document.getElementById('local-export-latest').textContent = receipt?.exportedAt ? receipt.exportedAt.slice(0, 19) : 'never'
          const exportStatus = document.getElementById('local-export-status')
          if (exportStatus && message) {
            exportStatus.textContent = message
          }
        }
        const markLocalAnalyticsExported = (events, exportedAt) => {
          const latest = events.length ? events[events.length - 1] : null
          writeJson(localExportReceiptKey, {
            exportedAt,
            exportSurface,
            exportedEventCount: events.length,
            latestEventId: latest?.id ?? null,
            latestEventAt: latest?.createdAt ?? null,
          })
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
        const setOwnerInputPackStatus = (message) => {
          const status = document.getElementById('owner-input-pack-status')
          if (status) {
            status.textContent = message
          }
        }
        const writeOwnerInputReceipt = (action) => {
          if (!ownerInputActionPack) {
            return
          }
          writeJson(ownerInputActionPack.receiptStorageKey, {
            action,
            actedAt: new Date().toISOString(),
            packId: ownerInputActionPack.id,
            sourcePackId: ownerInputActionPack.sourcePackId,
            localEnvFile: ownerInputActionPack.localEnvFile,
            missingInputNames: ownerInputActionPack.missingInputNames,
            templateLineCount: ownerInputActionPack.localEnvTemplateLines.length,
            shellExportLineCount: ownerInputActionPack.shellExportTemplateLines.length,
            noSecretValues: ownerInputActionPack.controls.noSecretValues === true,
            noSecretValuesStored: ownerInputActionPack.controls.noSecretValuesStored === true,
            localTemplateWriteNoGithubMutation:
              ownerInputActionPack.controls.localTemplateWriteNoGithubMutation === true,
            storeSubmissionStillBlocked: ownerInputActionPack.controls.storeSubmissionStillBlocked === true,
            revenueStillBlocked: ownerInputActionPack.controls.revenueStillBlocked === true,
          })
        }
        const downloadText = (text, fileName) => {
          const blob = new Blob([text], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = fileName
          anchor.click()
          URL.revokeObjectURL(url)
        }
        const copyOwnerInputText = async (text, action, successMessage) => {
          if (!ownerInputActionPack) {
            return
          }
          try {
            await navigator.clipboard.writeText(text)
            writeOwnerInputReceipt(action)
            setOwnerInputPackStatus(successMessage)
          } catch {
            setOwnerInputPackStatus('Clipboard unavailable. Use the download button or the preflight JSON instead.')
          }
        }
        const downloadOwnerInputTemplate = () => {
          if (!ownerInputActionPack) {
            return
          }
          downloadText(ownerInputActionPack.localEnvTemplateText, ownerInputActionPack.downloadFileName)
          writeOwnerInputReceipt('download-local-env-template')
          setOwnerInputPackStatus('Local env template downloaded. Fill it in locally, then run the preflight command.')
        }
        const ownerInputFields = () => ownerInputActionPack?.valueValidation?.fields ?? []
        const ownerInputElement = (field) => document.getElementById(field.inputId)
        const setOwnerInputValidationStatus = (message) => {
          const status = document.getElementById('owner-input-validation-status')
          if (status) {
            status.textContent = message
          }
        }
        const setFilledOwnerInputButtons = ({ combinedEnabled, runtimeConfigEnabled }) => {
          document
            .getElementById('download-filled-owner-input-template')
            ?.toggleAttribute('disabled', !combinedEnabled)
          document
            .getElementById('copy-filled-owner-shell-template')
            ?.toggleAttribute('disabled', !combinedEnabled)
          document
            .getElementById('download-owner-runtime-config-preview')
            ?.toggleAttribute('disabled', !runtimeConfigEnabled)
          document
            .getElementById('copy-production-input-watch-command')
            ?.toggleAttribute('disabled', !runtimeConfigEnabled)
        }
        const readOwnerInputValues = () =>
          ownerInputFields().map((field) => ({
            field,
            value: String(ownerInputElement(field)?.value ?? '').trim(),
          }))
        const validateOwnerInputField = (field, value, { allowMissing = false } = {}) => {
          const checks = [
            !allowMissing && !value ? field.envName + ' is missing' : null,
            /[\\r\\n]/.test(value) ? field.envName + ' must be a single line' : null,
            /\\s/.test(value) ? field.envName + ' must not include whitespace' : null,
            value.length > field.maxLength ? field.envName + ' is too long' : null,
          ].filter(Boolean)

          if (field.validationKind === 'email-shape' && value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
            checks.push(field.envName + ' must look like an email address')
          }

          return checks
        }
        const validateOwnerInputValues = () => {
          const entries = readOwnerInputValues()
          const combinedProblems = entries.flatMap(({ field, value }) => validateOwnerInputField(field, value))
          const runtimeProblems = entries.flatMap(({ field, value }) =>
            validateOwnerInputField(field, value, { allowMissing: field.runtimeConfigRequired !== true }),
          )
          const hasRuntimeMinimum = entries.some(
            ({ field, value }) => field.runtimeConfigRequired === true && value.length > 0,
          )
          const combinedValid = entries.length > 0 && combinedProblems.length === 0
          const runtimeConfigValid = entries.length > 0 && hasRuntimeMinimum && runtimeProblems.length === 0
          setFilledOwnerInputButtons({ combinedEnabled: combinedValid, runtimeConfigEnabled: runtimeConfigValid })
          setOwnerInputValidationStatus(
            combinedValid
              ? 'Zero-secret values passed local checks. Filled downloads are enabled.'
              : runtimeConfigValid
                ? 'Production analytics value passed local checks. Runtime config preview and input watch command are enabled; support email can be added later.'
                : 'Waiting for valid zero-secret values: ' + (runtimeProblems.join('; ') || 'none') + '.',
          )
          return { combinedValid, runtimeConfigValid, entries }
        }
        const filledLocalEnvText = (entries) =>
          entries.map(({ field, value }) => field.envName + '=' + value).join('\\n') + '\\n'
        const shellQuote = (value) =>
          String.fromCharCode(39) +
          String(value).replace(/'/g, String.fromCharCode(39, 92, 39, 39)) +
          String.fromCharCode(39)
        const filledShellExportText = (entries) =>
          entries.map(({ field, value }) => 'export ' + field.envName + '=' + shellQuote(value)).join('\\n') + '\\n'
        const ownerInputValueMap = (entries) =>
          Object.fromEntries(entries.map(({ field, value }) => [field.envName, value]))
        const ownerRuntimeConfigPreviewText = (entries) => {
          const values = ownerInputValueMap(entries)
          const posthogKey = values.VITE_POSTHOG_KEY || null
          const supportEmail = values.AGL_SUPPORT_EMAIL || null
          const defaultPosthogHost =
            ownerInputActionPack?.runtimeConfigPreview?.defaultPosthogHost || 'https://us.i.posthog.com'
          const configuredPublicInputNames = entries
            .filter(({ value }) => value.length > 0)
            .map(({ field }) => field.envName)
          const missingPublicInputNames = ownerInputFields()
            .filter((field) => !configuredPublicInputNames.includes(field.envName))
            .map((field) => field.envName)
          const preview = {
            generatedAt: new Date().toISOString(),
            id: 'owner-runtime-config-preview',
            status: 'owner-runtime-config-preview-ready',
            source: 'measurement-status-browser-local-preview',
            targetPublicPath:
              ownerInputActionPack?.runtimeConfigPreview?.targetPublicPath || 'public/owner-runtime-config.json',
            publicInputNames: ownerInputFields().map((field) => field.envName),
            configuredPublicInputNames,
            defaultedPublicInputNames: ['VITE_POSTHOG_HOST'],
            missingPublicInputNames,
            invalidPublicInputNames: [],
            analytics: {
              provider: posthogKey ? ownerInputActionPack?.runtimeConfigPreview?.provider || 'posthog-browser' : null,
              posthogConfigured: Boolean(posthogKey),
              posthogKey,
              posthogHost: defaultPosthogHost,
            },
            support: {
              configured: Boolean(supportEmail),
              email: supportEmail,
            },
            controls: {
              zeroPaidSpend: true,
              zeroSecretInputsOnly: true,
              noSecretValues: true,
              publicValuesOnly: true,
              browserLocalOnly: true,
              noGeneratedValueSerialization: true,
              noGithubMutation: true,
              noWorkflowDispatch: true,
              noStoreSubmission: true,
              noRevenueEnablement: true,
            },
          }

          return JSON.stringify(preview, null, 2) + '\\n'
        }
        const productionInputWatchCommandText = (entries) => {
          const values = ownerInputValueMap(entries)
          const command = ownerInputActionPack?.productionInputWatchCommand
          const defaultPosthogHost = command?.defaultPosthogHost || 'https://us.i.posthog.com'
          return [
            'gh',
            'workflow',
            'run',
            command?.workflowFile || 'production-input-watch.yml',
            '--ref',
            command?.ref || 'main',
            '-f',
            command?.requiredFlag || 'publish_zero_secret_runtime_config=true',
            '-f',
            'vite_posthog_key=' + shellQuote(values.VITE_POSTHOG_KEY || ''),
            '-f',
            'vite_posthog_host=' + shellQuote(defaultPosthogHost),
            '-f',
            'agl_support_email=' + shellQuote(values.AGL_SUPPORT_EMAIL || ''),
          ].join(' ')
        }
        const writeFilledOwnerInputReceipt = (action, entries, details = {}) => {
          if (!ownerInputActionPack) {
            return
          }
          writeJson(ownerInputActionPack.receiptStorageKey, {
            action,
            actedAt: new Date().toISOString(),
            packId: ownerInputActionPack.id,
            sourcePackId: ownerInputActionPack.sourcePackId,
            localEnvFile: ownerInputActionPack.localEnvFile,
            validatedInputNames: entries.filter(({ value }) => value.length > 0).map(({ field }) => field.envName),
            validationStatus: 'passed',
            noSecretValues: true,
            noValuesStored: true,
            noGeneratedValueSerialization: true,
            localTemplateWriteNoGithubMutation:
              ownerInputActionPack.controls.localTemplateWriteNoGithubMutation === true,
            ...details,
          })
        }
        const downloadFilledOwnerInputTemplate = () => {
          const validation = validateOwnerInputValues()
          if (!validation.combinedValid) {
            return
          }
          downloadText(
            filledLocalEnvText(validation.entries),
            ownerInputActionPack.valueValidation.filledDownloadFileName,
          )
          writeFilledOwnerInputReceipt('download-filled-local-env-template', validation.entries)
          setOwnerInputValidationStatus('Filled local env downloaded. Values were not stored in generated artifacts.')
        }
        const copyFilledOwnerShellTemplate = () => {
          const validation = validateOwnerInputValues()
          if (!validation.combinedValid) {
            return
          }
          copyOwnerInputText(
            filledShellExportText(validation.entries),
            'copy-filled-shell-export-template',
            'Filled shell exports copied. Values were not stored in generated artifacts.',
          )
          writeFilledOwnerInputReceipt('copy-filled-shell-export-template', validation.entries)
        }
        const downloadOwnerRuntimeConfigPreview = () => {
          const validation = validateOwnerInputValues()
          if (!validation.runtimeConfigValid) {
            return
          }
          downloadText(
            ownerRuntimeConfigPreviewText(validation.entries),
            ownerInputActionPack.runtimeConfigPreview.downloadFileName,
          )
          writeFilledOwnerInputReceipt('download-owner-runtime-config-preview', validation.entries, {
            runtimeConfigPreviewFileName: ownerInputActionPack.runtimeConfigPreview.downloadFileName,
            targetPublicPath: ownerInputActionPack.runtimeConfigPreview.targetPublicPath,
            defaultedPublicInputNames: ['VITE_POSTHOG_HOST'],
            publicRuntimeConfigPreview: true,
          })
          setOwnerInputValidationStatus('Runtime config preview downloaded. Values were not stored in generated artifacts.')
        }
        const copyProductionInputWatchCommand = async () => {
          const validation = validateOwnerInputValues()
          if (!validation.runtimeConfigValid) {
            return
          }
          try {
            await navigator.clipboard.writeText(productionInputWatchCommandText(validation.entries))
            writeFilledOwnerInputReceipt('copy-production-input-watch-command', validation.entries, {
              workflowFile: ownerInputActionPack.productionInputWatchCommand.workflowFile,
              workflowPath: ownerInputActionPack.productionInputWatchCommand.workflowPath,
              workflowRef: ownerInputActionPack.productionInputWatchCommand.ref,
              defaultedPublicInputNames: ['VITE_POSTHOG_HOST'],
              copiedCommandStoresPublicValuesOnly: true,
              commandRequiresOwnerRun: true,
            })
            setOwnerInputValidationStatus('Production Input Watch command copied. Review it before running; no workflow was dispatched by this page.')
          } catch {
            setOwnerInputValidationStatus('Clipboard unavailable. Use the filled env or runtime config preview downloads instead.')
          }
        }
        const exportLocalEventDrop = () => {
          const eventsBeforeExport = readEvents()
          const receipt = readJson(localExportReceiptKey, null)
          const coverage = exportCoverage(eventsBeforeExport, receipt)
          const exportedAt = new Date().toISOString()
          const fileName = eventDropFileName(exportSurface, exportedAt)
          const exportEvent = {
            id: createId('measurement-export'),
            name: 'analytics_exported',
            properties: {
              destination: 'local_file',
              exportSurface,
              exportSurfaceDetail,
              eventDropFileName: fileName,
              eventDropMode: 'download',
              eventCountAtExport: eventsBeforeExport.length + 1,
              unexportedEventsBeforeExport: coverage.unexportedEvents,
              exportedEventCountBeforeExport: coverage.exportedEventCount,
              exportCoverageRatioBeforeExport: Math.round(coverage.coverageRatio * 1000) / 1000,
              exportCoverageStatusBeforeExport: receipt ? (coverage.unexportedEvents ? 'export-due' : 'fresh') : 'waiting-for-first-export',
              noExternalUpload: true,
              playerInitiated: true,
              noSyntheticEvents: true,
              noRevenueEnablement: true,
            },
            createdAt: exportedAt,
          }
          const events = [...eventsBeforeExport, exportEvent].slice(-300)
          writeJson(analyticsKey, events)
          markLocalAnalyticsExported(events, exportedAt)
          downloadEvents(events, fileName)
          updateLocalEvidenceStats(${JSON.stringify(
            `Local event drop downloaded. Import it with ${measurementPageExport.importCommand}.`,
          )})
        }
        document.getElementById('export-local-event-drop')?.addEventListener('click', exportLocalEventDrop)
        document
          .getElementById('copy-owner-input-template')
          ?.addEventListener('click', () =>
            copyOwnerInputText(
              ownerInputActionPack.localEnvTemplateText,
              'copy-local-env-template',
              'Local env template copied. Fill it in locally, then run the preflight command.',
            ),
          )
        document
          .getElementById('download-owner-input-template')
          ?.addEventListener('click', downloadOwnerInputTemplate)
        document
          .getElementById('copy-owner-shell-template')
          ?.addEventListener('click', () =>
            copyOwnerInputText(
              ownerInputActionPack.shellExportTemplateText,
              'copy-shell-export-template',
              'Shell export template copied. Values stay in your shell and outside tracked files.',
            ),
          )
        document
          .getElementById('validate-owner-input-values')
          ?.addEventListener('click', validateOwnerInputValues)
        document
          .getElementById('download-filled-owner-input-template')
          ?.addEventListener('click', downloadFilledOwnerInputTemplate)
        document
          .getElementById('copy-filled-owner-shell-template')
          ?.addEventListener('click', copyFilledOwnerShellTemplate)
        document
          .getElementById('download-owner-runtime-config-preview')
          ?.addEventListener('click', downloadOwnerRuntimeConfigPreview)
        document
          .getElementById('copy-production-input-watch-command')
          ?.addEventListener('click', copyProductionInputWatchCommand)
        ownerInputFields().forEach((field) => {
          ownerInputElement(field)?.addEventListener('input', validateOwnerInputValues)
        })
        updateLocalEvidenceStats()
        const syncedLiveCandidate = ${JSON.stringify(payload.liveRelease.syncedCandidateId)}
        const exactLiveCandidate = document.getElementById('exact-live-candidate')
        const exactLiveMatch = document.getElementById('exact-live-match')
        const ownerRuntimeConfigLiveStatus = document.getElementById('owner-runtime-config-live-status')
        const ownerRuntimePosthogStatus = document.getElementById('owner-runtime-posthog-status')
        const ownerRuntimeSupportStatus = document.getElementById('owner-runtime-support-status')
        const ownerRuntimeConfigInputs = document.getElementById('owner-runtime-config-inputs')
        const ownerRuntimeNextAction = document.getElementById('owner-runtime-next-action')
        const readLiveReleaseManifest = async () => {
          try {
            const response = await fetch('./release-candidate.json', { cache: 'no-store' })
            if (!response.ok) {
              throw new Error(String(response.status))
            }
            const manifest = await response.json()
            const candidateId = manifest?.candidateId ?? null
            exactLiveCandidate.textContent = candidateId || 'missing'
            exactLiveMatch.textContent =
              candidateId && syncedLiveCandidate
                ? candidateId === syncedLiveCandidate
                  ? 'matches synced evidence'
                  : 'newer deploy than synced JSON'
                : 'review'
          } catch {
            exactLiveCandidate.textContent = 'unavailable'
            exactLiveMatch.textContent = 'manifest unavailable'
          }
        }
        const readLiveOwnerRuntimeConfig = async () => {
          try {
            const response = await fetch('./owner-runtime-config.json', { cache: 'no-store' })
            if (!response.ok) {
              throw new Error(String(response.status))
            }
            const config = await response.json()
            const configuredInputNames = Array.isArray(config?.configuredPublicInputNames)
              ? config.configuredPublicInputNames.filter((name) => typeof name === 'string')
              : []
            const invalidInputNames = Array.isArray(config?.invalidPublicInputNames)
              ? config.invalidPublicInputNames.filter((name) => typeof name === 'string')
              : []
            const missingInputNames = Array.isArray(config?.missingPublicInputNames)
              ? config.missingPublicInputNames.filter((name) => typeof name === 'string')
              : []
            const posthogReady =
              config?.analytics?.posthogConfigured === true && configuredInputNames.includes('VITE_POSTHOG_KEY')
            const supportReady =
              config?.support?.configured === true && configuredInputNames.includes('AGL_SUPPORT_EMAIL')
            ownerRuntimeConfigLiveStatus.textContent = config?.status || 'missing'
            ownerRuntimePosthogStatus.textContent = posthogReady
              ? 'posthog-browser ready'
              : invalidInputNames.includes('VITE_POSTHOG_KEY')
                ? 'fix VITE_POSTHOG_KEY'
                : 'waiting for VITE_POSTHOG_KEY'
            ownerRuntimeSupportStatus.textContent = supportReady
              ? 'support contact ready'
              : invalidInputNames.includes('AGL_SUPPORT_EMAIL')
                ? 'fix AGL_SUPPORT_EMAIL'
                : 'waiting for AGL_SUPPORT_EMAIL'
            ownerRuntimeConfigInputs.textContent = configuredInputNames.length
              ? configuredInputNames.join(', ')
              : 'none'
            ownerRuntimeNextAction.textContent =
              posthogReady && supportReady
                ? 'run readiness validation'
                : invalidInputNames.length
                  ? 'fix ' + invalidInputNames.join(', ')
                  : missingInputNames.length
                    ? 'waiting for ' + missingInputNames.join(', ')
                    : 'review runtime config'
          } catch {
            ownerRuntimeConfigLiveStatus.textContent = 'unavailable'
            ownerRuntimePosthogStatus.textContent = 'runtime config unavailable'
            ownerRuntimeSupportStatus.textContent = 'runtime config unavailable'
            ownerRuntimeConfigInputs.textContent = 'unavailable'
            ownerRuntimeNextAction.textContent = 'runtime config unavailable'
          }
        }
        readLiveReleaseManifest()
        readLiveOwnerRuntimeConfig()
      })()
    </script>
  </body>
</html>
`

const report = [
  '# Production Measurement Status',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Active path: ${payload.activePath}`,
  `Live candidate: ${payload.liveCandidate ?? 'missing'}`,
  `Exact live manifest: ${payload.liveRelease.exactManifestPath}`,
  `Source hash: ${payload.sourceDataHash}`,
  '',
  '## Analytics',
  '',
  `- rollup source: ${payload.analytics.activeRollupSource}`,
  `- browser forwarding configured: ${payload.analytics.browserForwarding.configured}`,
  `- autonomous rollups configured: ${payload.analytics.autonomousRollups.configured}`,
  `- local evidence ready: ${payload.analytics.localEvidence.ready}`,
  `- public aggregate handoff: ${payload.publicEvidenceHandoff.status}`,
  `- analytics unlock: ${payload.analyticsUnlock?.status ?? 'missing'}`,
  `- analytics unlock path: ${payload.analyticsUnlock?.recommendedPathId ?? 'none'}`,
  `- lowest-input analytics path: ${payload.analyticsUnlock?.lowestInputPathId ?? 'none'}`,
  `- external unlock queue: ${payload.externalUnlockQueue.status}`,
  `- next external unlock: ${payload.externalUnlockQueue.nextBestUnlockId ?? 'none'}`,
  `- owner unlock brief: ${payload.externalUnlockQueue.ownerUnlockBrief?.recommendedPathId ?? 'none'}`,
  `- aggregate evidence notes: ${payload.publicEvidenceHandoff.aggregateEvidence.notes}`,
  `- supporting aggregate mission notes: ${payload.publicEvidenceHandoff.productGateMissions.supportingAggregateEvidenceNotes}`,
  `- player evidence invite pack: ${payload.publicEvidenceHandoff.playerInvitePack.status}`,
  `- player evidence primary route: ${payload.publicEvidenceHandoff.playerInvitePack.routes[0]?.path ?? 'missing'}`,
  `- player evidence follow-up: ${payload.publicEvidenceHandoff.playerInvitePack.followUpCommands.join(' && ')}`,
  `- measurement page export: ${payload.publicEvidenceHandoff.measurementPageExport.status}`,
  `- measurement page export import: ${payload.publicEvidenceHandoff.measurementPageExport.importCommand}`,
  '',
  '## Public Routes',
  '',
  ...Object.entries(payload.publicRoutes).map(([key, value]) => `- ${key}: ${value ?? 'missing'}`),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(publicJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionMeasurementStatus = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type ProductionMeasurementStatus = typeof productionMeasurementStatus\n`,
)
await writeFile(publicJsonPath, JSON.stringify(publicPayload, null, 2) + '\n')
await writeFile(publicHtmlPath, html)
await writeFile(publicAnalyticsUnlockJsonPath, JSON.stringify(analyticsUnlockPayload, null, 2) + '\n')
await writeFile(publicAnalyticsUnlockHtmlPath, analyticsUnlockHtml)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, publicJsonPath)}`)
console.log(`Wrote ${path.relative(root, publicHtmlPath)}`)
console.log(`Wrote ${path.relative(root, publicAnalyticsUnlockJsonPath)}`)
console.log(`Wrote ${path.relative(root, publicAnalyticsUnlockHtmlPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
