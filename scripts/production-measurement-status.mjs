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
const trafficSeeding = await readJson(path.join(dataDir, 'traffic-seeding.json'))
const productionBlockerHandoff = await readJson(path.join(dataDir, 'production-blocker-handoff.json'))
const eventCollectorSmoke = await readJson(path.join(dataDir, 'event-collector-smoke.json'))
const postDeployArtifactSync = await readOptionalJson(path.join(dataDir, 'post-deploy-artifact-sync.json'), {
  status: 'missing',
  live: {},
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
const numberOrZero = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
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
  controls: aggregateEvidencePrivacyControls,
  nextActions: [
    aggregateEvidenceNotes.length
      ? 'Review public aggregate evidence as supporting diagnosis, then collect real event drops or configure production analytics before gate decisions.'
      : `Invite players to start the current sample through ${sampleNextRoute.path}, then use Share evidence after the play session so public aggregate evidence can be reviewed without raw events.`,
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
      nextActions: [
        'Choose the first-party collector path when a zero-spend Cloudflare free-tier account already exists; otherwise use an existing PostHog free project.',
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

const sourceDataHash = hashSourceData({
  productionEnvironment,
  analytics,
  localEventBridge,
  supportChannel,
  supportFeedback,
  productGateSamplePlan,
  trafficSeeding,
  productionBlockerHandoff,
  eventCollectorSmoke,
  postDeployArtifactSync,
})

const payload = {
  generatedAt: new Date().toISOString(),
  sourceDataHash,
  status,
  activePath,
  liveCandidate: postDeployArtifactSync.live?.candidateId ?? null,
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
  },
  publicEvidenceHandoff,
  analyticsUnlock: publicAnalyticsUnlock,
  externalUnlockQueue: publicExternalUnlockQueue,
  publicRoutes: {
    statusPage: '/measurement-status.html',
    statusJson: '/measurement-status.json',
    gateSample: '/gate-sample.html',
    sampleNext: sampleNextRoute.path,
    sampleNextJson: sampleNextRoute.jsonPath,
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
    productGateSamplePlan: productGateSamplePlan.status,
    trafficSeeding: trafficSeeding.status,
    productionBlockerHandoff: productionBlockerHandoff.status,
    eventCollectorSmoke: eventCollectorSmoke.status,
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
    noStoreSubmission: true,
    noRevenueEnablement: true,
  },
  nextActions: [
    nextAction,
    publicAnalyticsUnlock
      ? `Unlock production analytics with ${publicAnalyticsUnlock.recommendedPathId}; ${publicAnalyticsUnlock.commandCount} setup command(s) and ${publicAnalyticsUnlock.validationCommandCount} validation command(s) are published with redacted secret names only.`
      : 'Regenerate the production blocker handoff before publishing production analytics unlock guidance.',
    `External unlock queue has ${publicExternalUnlockQueue.ownerActionRequired} owner action(s); next zero-spend unlock is ${publicExternalUnlockQueue.nextBestZeroCostUnlockId ?? 'none'}.`,
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
      commandCount: payload.analyticsUnlock.commandCount,
      validationCommandCount: payload.analyticsUnlock.validationCommandCount,
    }
  : null

const appPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  activePath: payload.activePath,
  liveCandidate: payload.liveCandidate,
  publicEvidenceHandoff: appPublicEvidenceHandoff,
  analyticsUnlock: appAnalyticsUnlock,
  externalUnlockQueue: {
    status: payload.externalUnlockQueue.status,
    nextBestUnlockId: payload.externalUnlockQueue.nextBestUnlockId,
    nextBestZeroCostUnlockId: payload.externalUnlockQueue.nextBestZeroCostUnlockId,
    ownerActionRequired: payload.externalUnlockQueue.ownerActionRequired,
  },
}

const publicPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  activePath: payload.activePath,
  liveCandidate: payload.liveCandidate,
  analytics: payload.analytics,
  productGateEvidence: payload.productGateEvidence,
  publicEvidenceHandoff: payload.publicEvidenceHandoff,
  analyticsUnlock: payload.analyticsUnlock,
  externalUnlockQueue: payload.externalUnlockQueue,
  publicRoutes: payload.publicRoutes,
  blockers: payload.blockers,
  controls: payload.controls,
  nextActions: payload.nextActions,
}

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

      ul {
        padding-left: 20px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .actions a {
        border: 1px solid #187f7a;
        border-radius: 8px;
        padding: 10px 12px;
        text-decoration: none;
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
      </section>

      <section>
        <h2>Product Evidence</h2>
        <div class="grid" aria-label="Product evidence">
          <div class="card">
            <span>Sample plan</span>
            <strong>${escapeHtml(payload.productGateEvidence.status)}</strong>
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
            <span>Route campaign</span>
            <strong>${escapeHtml(payload.productGateEvidence.sampleNextRoute.targetCampaignId ?? 'waiting')}</strong>
          </div>
        </div>
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.sampleNext))}">Start current sample</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.gateSample))}">Open all missions</a>
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
            <p>Variables: ${escapeHtml(unlockPath.requiredVariables.map((item) => item.repositoryName).join(', ') || 'none')}</p>
            <p>Secrets: ${escapeHtml(unlockPath.requiredSecrets.map((item) => item.repositoryName).join(', ') || 'none')}</p>
            <p>Commands: ${escapeHtml(unlockPath.commandSequence.join(' && ') || 'none')}</p>
          </article>`,
                )
                .join('\n        ')
            : '<p>No analytics unlock kit is available yet.</p>'
        }
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
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.support))}">Open support</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.statusJson))}">Open status JSON</a>
        </div>
      </section>
    </main>
    <script>
      (() => {
        const readJson = (key, fallback) => {
          try {
            const raw = window.localStorage.getItem(key)
            return raw ? JSON.parse(raw) : fallback
          } catch {
            return fallback
          }
        }
        const events = readJson('agl.analytics.events', [])
        const receipt = readJson('agl.analytics.localExportReceipt', null)
        const latest = Array.isArray(events) && events.length ? events[events.length - 1] : null
        document.getElementById('local-event-count').textContent = Array.isArray(events) ? String(events.length) : '0'
        document.getElementById('local-event-latest').textContent = latest?.createdAt ? latest.createdAt.slice(0, 19) : 'none'
        document.getElementById('local-export-latest').textContent = receipt?.exportedAt ? receipt.exportedAt.slice(0, 19) : 'never'
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
  `- external unlock queue: ${payload.externalUnlockQueue.status}`,
  `- next external unlock: ${payload.externalUnlockQueue.nextBestUnlockId ?? 'none'}`,
  `- aggregate evidence notes: ${payload.publicEvidenceHandoff.aggregateEvidence.notes}`,
  `- supporting aggregate mission notes: ${payload.publicEvidenceHandoff.productGateMissions.supportingAggregateEvidenceNotes}`,
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
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, publicJsonPath)}`)
console.log(`Wrote ${path.relative(root, publicHtmlPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
