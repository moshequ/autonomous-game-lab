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
    minimalInterventionPath: ownerUnlockPreflight.minimalInterventionPath ?? null,
    ownerInputPack: ownerUnlockPreflight.ownerInputPack ?? null,
    pathPreflights: ownerUnlockPreflight.pathPreflights ?? [],
    commands: ownerUnlockPreflight.commands ?? {},
    controls: ownerUnlockPreflight.controls ?? {},
  },
  publicRoutes: {
    statusPage: '/measurement-status.html',
    statusJson: '/measurement-status.json',
    analyticsUnlock: '/analytics-unlock.html',
    analyticsUnlockJson: '/analytics-unlock.json',
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
  },
}

const publicPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  activePath: payload.activePath,
  liveCandidate: payload.liveCandidate,
  liveRelease: payload.liveRelease,
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
        const syncedLiveCandidate = ${JSON.stringify(payload.liveRelease.syncedCandidateId)}
        const exactLiveCandidate = document.getElementById('exact-live-candidate')
        const exactLiveMatch = document.getElementById('exact-live-match')
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
        readLiveReleaseManifest()
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
