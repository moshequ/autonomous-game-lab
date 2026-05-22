import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildExplicitDownloadsScanPolicy, stableDownloadsScanPolicySource } from './lib/downloads-scan-policy.mjs'
import { productionBootstrapSourceDataHash } from './lib/production-bootstrap-source.mjs'
import { hashRawSourceData, hashSourceData, hashTextSourceData, sourceFreshness } from './lib/source-hash.mjs'
import { stableTrafficSeedingForSamplePlan } from './lib/traffic-sample-source.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const reportPath = path.join(root, 'reports', 'autonomous-owner-loop-latest.md')
const outputJsonPath = path.join(dataDir, 'autonomous-owner-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'autonomousOwnerLoop.ts')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const readText = async (filePath) => readFile(filePath, 'utf8').catch(() => '')
const readAcquisitionLocalEvents = async () => {
  const localEventsDir = path.resolve(root, process.env.AGL_LOCAL_EVENTS_DIR ?? 'data/player-events')
  let files = []

  try {
    files = (await readdir(localEventsDir)).filter((file) => file.endsWith('.json'))
  } catch {
    return { localEventFiles: [], events: [] }
  }

  const batches = await Promise.all(
    files.map(async (file) => {
      const payload = JSON.parse(await readFile(path.join(localEventsDir, file), 'utf8'))
      return Array.isArray(payload) ? payload : payload.events ?? []
    }),
  )

  return { localEventFiles: files, events: batches.flat() }
}

const percent = (value) => (typeof value === 'number' ? Math.round(value * 100) : null)
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)

const systemStatus = (condition, fallback = 'needs-attention') => (condition ? 'ready' : fallback)

const configuredCount = (items = []) => items.filter((item) => item.configured).length

const generatedAtMs = (artifact) => {
  const value = Date.parse(artifact?.generatedAt ?? '')
  return Number.isFinite(value) ? value : null
}
const operationalEvidenceFreshness = ({
  artifact,
  readyStatuses,
  maxAgeHours,
  checksPass = true,
  extraReady = true,
}) => {
  const artifactGeneratedAtMs = generatedAtMs(artifact)
  const ageHours =
    typeof artifactGeneratedAtMs === 'number'
      ? roundMetric((Date.now() - artifactGeneratedAtMs) / (60 * 60 * 1000))
      : null
  const generatedAtFresh = typeof ageHours === 'number' && ageHours >= -1 && ageHours <= maxAgeHours
  const ready = readyStatuses.includes(artifact?.status)
  const fresh = ready && generatedAtFresh && checksPass && extraReady

  return {
    fresh,
    ready,
    status: artifact?.status ?? 'missing',
    artifactGeneratedAt: artifact?.generatedAt ?? null,
    ageHours,
    maxAgeHours,
    generatedAtFresh,
    checksPass,
    extraReady,
  }
}
const localIsoDate = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
const slugDate = (date = new Date()) => localIsoDate(date).replaceAll('-', '')

const productionEnvironment = await readJson(path.join(dataDir, 'production-environment.json'))
const trendSignals = await readJson(path.join(dataDir, 'trend-signals.json'))
const generatedConcepts = await readJson(path.join(dataDir, 'generated-concepts.json'))
const prototypePipeline = await readJson(path.join(dataDir, 'prototype-pipeline.json'))
const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const generatedPlayable = await readJson(path.join(dataDir, 'generated-playable-games.json'))
const gameBalance = await readJson(path.join(dataDir, 'game-balance.json'))
const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const productionGates = await readJson(path.join(dataDir, 'production-gates.json'))
const eventIngest = await readJson(path.join(dataDir, 'event-ingest.json'))
const localEventBridge = await readOptionalJson(path.join(dataDir, 'local-event-bridge.json'), {
  status: 'missing',
  inbox: {},
  imported: {},
  controls: {},
})
const eventCollectorSmoke = await readJson(path.join(dataDir, 'event-collector-smoke.json'))
const eventCollectorDeployment = await readJson(path.join(dataDir, 'event-collector-deployment.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const portfolioPolicy = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const traffic = await readJson(path.join(dataDir, 'traffic-seeding.json'))
const acquisition = await readJson(path.join(dataDir, 'acquisition-learning.json'))
const { localEventFiles: acquisitionLocalEventFiles, events: acquisitionLocalEvents } =
  await readAcquisitionLocalEvents()
const organicSeedLoop = await readOptionalJson(path.join(dataDir, 'organic-seed-loop.json'), {
  status: 'missing',
  target: null,
  runtimeSurface: {},
  guardrails: {},
  missions: [],
})
const retention = await readJson(path.join(dataDir, 'retention-loop.json'))
const pwaInstall = await readJson(path.join(dataDir, 'pwa-install-loop.json'))
const iconAssets = await readJson(path.join(dataDir, 'icon-assets.json'))
const viteConfig = await readText(path.join(root, 'vite.config.ts'))
const performanceBudget = await readOptionalJson(path.join(dataDir, 'performance-budget.json'), {
  status: 'missing',
  budgets: {},
  initial: {},
  deferred: {},
  controls: {},
})
const releaseCandidate = await readOptionalJson(path.join(dataDir, 'release-candidate.json'), {
  status: 'missing',
  candidateId: null,
  summary: {},
  controls: {},
  integrity: {},
  postDeploySmoke: [],
})
const postDeploySmoke = await readOptionalJson(path.join(dataDir, 'post-deploy-smoke.json'), {
  status: 'missing',
  target: {},
  sourceStatus: {},
  summary: {},
  controls: {},
  checks: [],
})
const postDeployArtifactSync = await readOptionalJson(path.join(dataDir, 'post-deploy-artifact-sync.json'), {
  status: 'missing',
  workflow: {},
  artifact: {},
  live: {},
  validation: {},
  summary: {},
  controls: {},
  checks: [],
})
const liveSiteMonitor = await readOptionalJson(path.join(dataDir, 'live-site-monitor.json'), {
  status: 'missing',
  origin: {},
  sourceStatus: {},
  summary: {},
  controls: {},
  checks: [],
})
const productOptimization = await readOptionalJson(path.join(dataDir, 'product-optimization.json'), {
  status: 'missing',
  productGates: {},
  actions: [],
  controls: {},
})
const productGateRecovery = await readOptionalJson(path.join(dataDir, 'product-gate-recovery.json'), {
  status: 'missing',
  summary: {},
  gates: [],
  priorities: [],
  controls: {},
})
const productGateSamplePlan = await readOptionalJson(path.join(dataDir, 'product-gate-sample-plan.json'), {
  status: 'missing',
  summary: {},
  missions: [],
  controls: {},
})
const firstMoveCoach = await readOptionalJson(path.join(dataDir, 'first-move-coach.json'), {
  status: 'missing',
  summary: {},
  controls: {},
  telemetry: {},
  targets: [],
})
const completionLoop = await readOptionalJson(path.join(dataDir, 'completion-loop.json'), {
  status: 'missing',
  target: {},
  metrics: {},
  controls: {},
  promptPolicy: {},
  finishLinePolicy: {},
  missions: [],
})
const replayLoop = await readOptionalJson(path.join(dataDir, 'replay-loop.json'), {
  status: 'missing',
  target: {},
  metrics: {},
  controls: {},
  promptPolicy: {},
  missions: [],
})
const productionBootstrap = await readOptionalJson(path.join(dataDir, 'production-bootstrap.json'), {
  status: 'missing',
  mode: 'missing',
  summary: {},
  controls: {},
  stages: [],
  requiredSecrets: [],
  externalBlockers: [],
})
const productionActivation = await readOptionalJson(path.join(dataDir, 'production-activation.json'), {
  status: 'missing',
  mode: 'missing',
  configuration: {},
  controls: {},
  plannedActions: [],
  execution: {},
  nextActions: [],
})
const productionBlockerHandoff = await readOptionalJson(path.join(dataDir, 'production-blocker-handoff.json'), {
  status: 'missing',
  statusDetail: 'missing',
  summary: {},
  sourceStatus: {},
  controls: {},
  handoffItems: [],
  unlocks: [],
})
const productionUnlockRunner = await readOptionalJson(path.join(dataDir, 'production-unlock-runner.json'), {
  status: 'missing',
  mode: 'missing',
  sourceStatus: {},
  summary: {},
  controls: {},
  commandQueue: [],
  execution: {},
  nextActions: [],
})
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  status: 'missing',
  workspace: {},
  repository: {},
  githubAutomation: {},
  controls: {},
  blockers: [],
})
const repositoryBootstrap = await readOptionalJson(path.join(dataDir, 'repository-bootstrap.json'), {
  status: 'missing',
  mode: 'missing',
  workspace: { after: {} },
  repository: {},
  helper: {},
  controls: {},
  blockers: [],
})
const autonomousOperator = await readOptionalJson(path.join(dataDir, 'autonomous-operator.json'), {
  status: 'missing',
  mode: 'missing',
  selectedAction: null,
  controls: {},
  execution: {},
})
const autonomousOperatorHistory = await readOptionalJson(path.join(dataDir, 'autonomous-operator-history.json'), {
  status: 'missing',
  summary: {},
  controls: {},
  records: [],
})
const autonomousCadence = await readOptionalJson(path.join(dataDir, 'autonomous-cadence.json'), {
  status: 'missing',
  schedulers: {},
  commandPlan: {},
  controls: {},
  checks: [],
})
const autonomousSelfUpdate = await readOptionalJson(path.join(dataDir, 'autonomous-self-update.json'), {
  status: 'missing',
  repository: {},
  pendingChanges: {},
  commitPlan: {},
  controls: {},
  checks: [],
})
const objectiveAudit = await readOptionalJson(path.join(dataDir, 'objective-audit.json'), {
  status: 'missing',
  summary: {},
  completion: {},
  requirements: [],
})
const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
const experimentPolicy = await readJson(path.join(dataDir, 'experiment-policy.json'))
const experimentResults = await readJson(path.join(dataDir, 'experiment-results.json'))
const rawImprovementBacklog = await readFile(path.join(dataDir, 'improvement-backlog.json'), 'utf8')
const improvementBacklog = JSON.parse(rawImprovementBacklog)
const improvementBacklogSummary = await readJson(path.join(dataDir, 'improvement-backlog-summary.json'))
const appliedImprovements = await readJson(path.join(dataDir, 'applied-improvements.json'))
const storePackage = await readJson(path.join(dataDir, 'store-package.json'))
const supportChannel = await readOptionalJson(path.join(dataDir, 'support-channel.json'), {
  status: 'missing',
  provider: 'github-issues',
  repository: {},
  controls: {},
  links: {},
})
const supportFeedback = await readOptionalJson(path.join(dataDir, 'support-feedback.json'), {
  status: 'missing',
  provider: 'github-issues',
  summary: {},
  controls: {},
  improvementSignals: [],
})
const storeAssets = await readJson(path.join(dataDir, 'store-assets.json'))
const storeListingOptimizer = await readJson(path.join(dataDir, 'store-listing-optimizer.json'))
const storeCompliance = await readJson(path.join(dataDir, 'store-compliance.json'))
const nativePackage = await readJson(path.join(dataDir, 'native-package.json'))
const androidSigning = await readOptionalJson(path.join(dataDir, 'android-signing.json'), {
  status: 'missing',
  signing: {},
  controls: {},
})
const promotion = await readJson(path.join(dataDir, 'promotion-decision.json'))
const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const androidRelease = await readJson(path.join(dataDir, 'android-release.json'))
const iosRelease = await readJson(path.join(dataDir, 'ios-release.json'))
const productionResponse = await readJson(path.join(dataDir, 'production-response.json'))
const incidentDrill = await readJson(path.join(dataDir, 'incident-drill.json'))
const deployment = await readJson(path.join(dataDir, 'deployment-plan.json'))
const readiness = await readOptionalJson(path.join(dataDir, 'production-readiness.json'), { webPwa: { status: 'missing' } })

const playableCount = playable.games?.length ?? 0
const generatedCount = generatedPlayable.games?.length ?? 0
const trendMechanicCount = trendSignals.signals?.mechanics?.length ?? 0
const trendThemeCount = trendSignals.signals?.themes?.length ?? 0
const trendAudienceCount = trendSignals.signals?.audiences?.length ?? 0
const conceptCount = generatedConcepts.concepts?.length ?? 0
const prototypeCount = prototypePipeline.prototypes?.length ?? 0
const analyticsSource = analytics.sourceStatus?.activeSource ?? 'unknown'
const liveAnalytics = ['posthog', 'local-event-drops'].includes(analyticsSource)
const localEventBridgeReady =
  ['bridge-ready-for-ingest', 'bridge-local-events-active', 'bridge-waiting-for-export'].includes(
    localEventBridge.status,
  ) &&
  localEventBridge.controls?.zeroPaidSpend === true &&
  localEventBridge.controls?.localOnly === true &&
  localEventBridge.controls?.noExternalUpload === true &&
  localEventBridge.controls?.noSyntheticEvents === true
const webDecision = promotion.decisions?.find((decision) => decision.channel === 'web-pwa')
const monetizationDecision = promotion.decisions?.find((decision) => decision.channel === 'monetization')
const androidDecision = promotion.decisions?.find((decision) => decision.channel === 'android-google-play')
const appliedImprovementActions = appliedImprovements.actions ?? []
const appliedImprovementStatus = appliedImprovementActions.length ? 'actions-ready' : 'no-actions'
const repositoryChannelReady = ['repository-channel-ready', 'waiting-for-gh-auth'].includes(
  repositoryReadiness.status,
)
const repositoryBootstrapPrepared =
  repositoryBootstrap.status !== 'missing' &&
  repositoryBootstrap.controls?.dryRunByDefault === true &&
  repositoryBootstrap.helper?.path === 'ops/github/bootstrap-repository.sh'
const repositoryTargetPlan = repositoryReadiness.repositoryTargetPlan ?? repositoryBootstrap.repositoryTargetPlan ?? null
const repositoryTargetPlanReady =
  typeof repositoryTargetPlan?.plannedTarget === 'string' &&
  repositoryTargetPlan.plannedTarget.includes('/') &&
  typeof repositoryTargetPlan.githubNewRepositoryUrl === 'string' &&
  typeof repositoryTargetPlan.httpsOriginUrl === 'string' &&
  typeof repositoryTargetPlan.sshOriginUrl === 'string' &&
  typeof repositoryTargetPlan.pages?.origin === 'string' &&
  typeof repositoryTargetPlan.pages?.basePath === 'string' &&
  repositoryTargetPlan.controls?.zeroPaidSpend === true &&
  repositoryTargetPlan.controls?.noAccountCreation === true &&
  repositoryTargetPlan.controls?.remoteMutationRequiresExplicitEnv === true
const repositoryHandoffPrepared =
  !repositoryChannelReady &&
  repositoryTargetPlanReady &&
  repositoryBootstrapPrepared &&
  repositoryReadiness.controls?.noGitMutation === true &&
  repositoryReadiness.controls?.noWorkflowDispatch === true &&
  repositoryBootstrap.controls?.remoteGitHubMutationRequiresExplicitEnv === true &&
  repositoryBootstrap.controls?.zeroPaidSpend === true &&
  (repositoryReadiness.blockers ?? []).some((blocker) => /GitHub|repository|origin|auth/i.test(blocker)) &&
  (repositoryBootstrap.blockers ?? []).some((blocker) => /GitHub|repository|origin|auth/i.test(blocker))
const ownerMode = releaseHealth.controls?.rollbackRequired
  ? 'incident-response'
  : deployment.status === 'ready-for-pages' && !repositoryChannelReady
    ? 'repository-channel-needed'
    : deployment.status === 'ready-for-pages'
    ? 'zero-spend-web-ready'
    : 'guarded-local-automation'
const postDeploySmokeObservedDifferentLiveCandidate =
  postDeploySmoke.status === 'post-deploy-smoke-observed-live' &&
  postDeploySmoke.liveRelease?.localCandidateMatches === false &&
  postDeploySmoke.target?.strictManifestComparison === false
const postDeploySmokeExpectedChecks =
  postDeploySmokeObservedDifferentLiveCandidate && Number.isFinite(postDeploySmoke.liveRelease?.postDeploySmokeUrls)
    ? postDeploySmoke.liveRelease.postDeploySmokeUrls + 1
    : (releaseCandidate.postDeploySmoke?.length ?? 0) + 1
const postDeploySmokeRunnerReady =
  ['blocked-missing-origin', 'post-deploy-smoke-passed', 'post-deploy-smoke-observed-live'].includes(
    postDeploySmoke.status,
  ) &&
  postDeploySmoke.localArtifactSmoke?.status === 'predeploy-artifact-smoke-passed' &&
  postDeploySmoke.localArtifactSmoke?.summary?.passed === postDeploySmoke.localArtifactSmoke?.summary?.planned &&
  postDeploySmoke.localArtifactSmoke?.summary?.failed === 0 &&
  postDeploySmoke.sourceStatus?.deployment === deployment.status &&
  postDeploySmoke.sourceStatus?.releaseCandidate === releaseCandidate.status &&
  postDeploySmoke.target?.candidateId === releaseCandidate.candidateId &&
  postDeploySmoke.target?.aggregateHash === releaseCandidate.integrity?.aggregateHash &&
  postDeploySmoke.controls?.zeroPaidSpend === true &&
  postDeploySmoke.controls?.readOnlyHttpChecks === true &&
  postDeploySmoke.controls?.localArtifactSmokeRequired === true &&
  postDeploySmoke.controls?.manifestHashComparisonRequired === true &&
  (postDeploySmoke.checks?.length ?? 0) >= postDeploySmokeExpectedChecks
const postDeployArtifactSyncReady =
  postDeployArtifactSync.status === 'post-deploy-artifact-sync-passed' &&
  postDeployArtifactSync.validation?.artifactPassed === true &&
  postDeployArtifactSync.validation?.artifactStrict === true &&
  postDeployArtifactSync.validation?.liveMatchesArtifact === true &&
  postDeployArtifactSync.controls?.readOnlyGithubArtifactDownload === true &&
  postDeployArtifactSync.controls?.readOnlyHttpChecks === true &&
  postDeployArtifactSync.controls?.strictManifestComparisonRequired === true &&
  postDeployArtifactSync.controls?.separateFromLocalCandidate === true
const liveSiteMonitorReady =
  liveSiteMonitor.status === 'live-site-monitor-passed' &&
  liveSiteMonitor.sourceStatus?.releaseCandidate === releaseCandidate.status &&
  liveSiteMonitor.sourceStatus?.postDeployArtifactSync === postDeployArtifactSync.status &&
  liveSiteMonitor.summary?.failed === 0 &&
  liveSiteMonitor.summary?.passed === liveSiteMonitor.summary?.planned &&
  liveSiteMonitor.summary?.liveMatchesSyncedDeploy === true &&
  liveSiteMonitor.controls?.zeroPaidSpend === true &&
  liveSiteMonitor.controls?.readOnlyHttpChecks === true &&
  liveSiteMonitor.controls?.noMutation === true &&
  liveSiteMonitor.controls?.strictSyncedManifestComparison === true
const postDeploySmokeActionFresh =
  postDeploySmokeRunnerReady &&
  postDeployArtifactSyncReady &&
  postDeployArtifactSync.artifact?.target?.candidateId === postDeployArtifactSync.live?.candidateId
const releaseCandidateActionFresh = postDeploySmokeRunnerReady && postDeployArtifactSyncReady && liveSiteMonitorReady
const operatorPlanHeld =
  autonomousOperator.status === 'operator-held' &&
  (autonomousOperator.eligibleActionIds?.length ?? 0) === 0 &&
  autonomousOperator.execution?.status === 'not-requested'
const operatorPlanPublished = ['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status) || operatorPlanHeld
const operatorHistoryPublished = autonomousOperatorHistory.status === 'operator-history-ready'
const needsInitialOperatorExecution = (autonomousOperatorHistory.summary?.executedRecords ?? 0) < 1
const productionBootstrapFreshnessInputs = [
  { id: 'release-candidate', generatedAt: releaseCandidate.generatedAt },
  { id: 'deployment-plan', generatedAt: deployment.generatedAt },
  { id: 'repository-readiness', generatedAt: repositoryReadiness.generatedAt },
  { id: 'repository-bootstrap', generatedAt: repositoryBootstrap.generatedAt },
  { id: 'production-environment', generatedAt: productionEnvironment.generatedAt },
  { id: 'event-collector-deployment', generatedAt: eventCollectorDeployment.generatedAt },
]
const currentProductionBootstrapSourceDataHash = productionBootstrapSourceDataHash({
  releaseCandidate,
  deployment,
  repositoryReadiness,
  repositoryBootstrap,
  productionEnvironment,
  eventCollectorDeployment,
  storeCompliance,
  nativePackage,
  androidRelease,
  monetization,
  unitEconomics,
})
const productionBootstrapSourceCurrent =
  productionBootstrap.sourceDataHash === currentProductionBootstrapSourceDataHash &&
  productionBootstrap.status !== 'missing'
const productionBootstrapGeneratedAtMs = generatedAtMs(productionBootstrap)
const productionBootstrapTimestampStaleInputs = productionBootstrapFreshnessInputs.filter((artifact) => {
  const artifactGeneratedAtMs = generatedAtMs(artifact)

  return (
    typeof artifactGeneratedAtMs === 'number' &&
    (typeof productionBootstrapGeneratedAtMs !== 'number' ||
      artifactGeneratedAtMs > productionBootstrapGeneratedAtMs)
  )
})
const productionBootstrapStaleInputs = productionBootstrapSourceCurrent ? [] : productionBootstrapTimestampStaleInputs
const productionBootstrapFresh =
  productionBootstrap.status === 'production-bootstrap-ready' &&
  productionBootstrap.controls?.zeroSpendGuard === true &&
  productionBootstrap.controls?.noPaidResourcesCreated === true &&
  productionBootstrapSourceCurrent
const productionActivationReady =
  ['activation-waiting-for-credentials', 'activation-ready', 'activation-applied'].includes(
    productionActivation.status,
  ) &&
  productionActivation.controls?.zeroPaidSpend === true &&
  productionActivation.controls?.dryRunByDefault === true &&
  productionActivation.controls?.activationRequiresExplicitEnv === true &&
  productionActivation.controls?.workflowDispatchRequiresReadyDeployment === true
const productionActivationRunnable =
  productionActivation.status === 'activation-ready' && productionActivation.configuration?.activationRequested === true
const productionBlockerHandoffItems = productionBlockerHandoff.handoffItems ?? productionBlockerHandoff.unlocks ?? []
const productionBlockerOwnerInputItems = productionBlockerHandoffItems.filter((item) => item.ownerInputRequired)
const productionBlockerMissingEnvCount = (productionEnvironment.requiredEnv ?? []).filter((item) => !item.configured).length
const productionBlockerMissingSecretCount = (productionBootstrap.requiredSecrets ?? []).filter((item) => !item.configured).length
const productionBlockerNextOwnerInput = productionBlockerOwnerInputItems[0] ?? null
const productionBlockerHandoffSourceFresh =
  productionBlockerHandoff.sourceStatus?.productionEnvironment === productionEnvironment.status &&
  productionBlockerHandoff.sourceStatus?.productionBootstrap === productionBootstrap.status &&
  productionBlockerHandoff.sourceStatus?.objectiveAudit === objectiveAudit.status &&
  productionBlockerHandoff.sourceStatus?.supportChannel === supportChannel.status &&
  productionBlockerHandoff.sourceStatus?.monetization === monetization.status &&
  productionBlockerHandoff.sourceStatus?.storeCompliance === storeCompliance.status &&
  productionBlockerHandoff.sourceStatus?.androidRelease === androidRelease.status &&
  productionBlockerHandoff.sourceStatus?.iosRelease === iosRelease.status &&
  productionBlockerHandoff.sourceStatus?.unitEconomics === unitEconomics.status &&
  productionBlockerHandoff.sourceStatus?.postDeployArtifactSync === postDeployArtifactSync.status
const productionBlockerHandoffReady =
  ['handoff-waiting-on-owner-inputs', 'handoff-clear'].includes(productionBlockerHandoff.status) &&
  productionBlockerHandoff.controls?.zeroPaidSpend === true &&
  productionBlockerHandoff.controls?.noSecretValues === true &&
  productionBlockerHandoff.controls?.noMutation === true &&
  productionBlockerHandoff.controls?.noAccountCreation === true &&
  productionBlockerHandoff.controls?.noStoreSubmission === true &&
  productionBlockerHandoff.controls?.noRevenueEnablement === true &&
  productionBlockerHandoffItems.some((item) => item.id === 'support-contact') &&
  productionBlockerHandoffItems.some((item) => item.id === 'product-gate-sample')
const productionBlockerHandoffCurrent =
  productionBlockerHandoffReady &&
  productionBlockerHandoffSourceFresh &&
  productionBlockerHandoff.summary?.missingEnv === productionBlockerMissingEnvCount &&
  productionBlockerHandoff.summary?.missingEnvironmentItems === productionBlockerMissingEnvCount &&
  productionBlockerHandoff.summary?.missingSecrets === productionBlockerMissingSecretCount &&
  productionBlockerHandoff.summary?.ownerActionRequired === productionBlockerOwnerInputItems.length &&
  productionBlockerHandoff.summary?.externalOwnerActions === productionBlockerOwnerInputItems.length &&
  productionBlockerHandoff.summary?.nextBestUnlockId === (productionBlockerNextOwnerInput?.id ?? null)
const productionUnlockRunnerReady =
  ['unlock-runner-idle', 'unlock-runner-plan-ready', 'unlock-runner-executed'].includes(productionUnlockRunner.status) &&
  ['plan-only', 'execute-unlocked-local-followups'].includes(productionUnlockRunner.mode) &&
  productionUnlockRunner.controls?.zeroPaidSpend === true &&
  productionUnlockRunner.controls?.noAccountCreation === true &&
  productionUnlockRunner.controls?.noStoreSubmission === true &&
  productionUnlockRunner.controls?.noRevenueEnablement === true &&
  productionUnlockRunner.controls?.noWorkflowDispatch === true &&
  productionUnlockRunner.controls?.staticCommandAllowlist === true &&
  (productionUnlockRunner.summary?.blockedUnsafeUnlocks ?? 0) === 0
const productionUnlockRunnerSourceFresh =
  productionUnlockRunner.sourceStatus?.productionBlockerHandoff === productionBlockerHandoff.status &&
  productionUnlockRunner.sourceStatus?.productionBlockerHandoffSourceDataHash ===
    (productionBlockerHandoff.sourceDataHash ?? null)
const productionUnlockRunnerCurrent = productionUnlockRunnerReady && productionUnlockRunnerSourceFresh
const productionUnlockRunnerRunnable =
  productionUnlockRunnerCurrent &&
  ((productionUnlockRunner.summary?.runnableUnlocks ?? 0) > 0 || (productionUnlockRunner.commandQueue?.length ?? 0) > 0)

const systems = [
  {
    id: 'trend-radar',
    status: systemStatus(trendMechanicCount > 0 && trendThemeCount > 0 && trendAudienceCount > 0),
    autonomy: 'automatic',
    evidence: `${trendMechanicCount} mechanic signal(s), ${trendThemeCount} theme signal(s), ${trendAudienceCount} audience signal(s).`,
    nextAction: 'Keep refreshing zero-cost trend inputs before concept generation.',
  },
  {
    id: 'concept-generator',
    status: systemStatus(conceptCount >= 4),
    autonomy: 'automatic-original-design',
    evidence: `${conceptCount} generated original concept(s) from current trend signals.`,
    nextAction: 'Keep generating original concepts without cloning protected board-game IP.',
  },
  {
    id: 'prototype-generator',
    status: systemStatus(prototypeCount >= 4),
    autonomy: 'automatic',
    evidence: `${prototypeCount} prototype candidate(s) prepared for playable runtime generation.`,
    nextAction: 'Keep promoting only prototype candidates that pass the local gates.',
  },
  {
    id: 'game-factory',
    status: systemStatus(
      generatedPlayable.status === 'generated-runtime-ready' && playableCount >= 10 && generatedCount >= 5,
    ),
    autonomy: 'automatic',
    evidence: `${playableCount} playable games; ${generatedCount} generated runtime games.`,
    nextAction: 'Keep generating concept-first playable configs during the daily loop.',
  },
  {
    id: 'analytics-ingest',
    status: systemStatus(
      analytics.sourceStatus?.activeSource && eventCollectorSmoke.status === 'pass',
      'bootstrap-fixture',
    ),
    autonomy: liveAnalytics ? 'automatic-live' : 'automatic-local-fixture',
    evidence: `Active source: ${analyticsSource}; event ingest: ${eventIngest.status}; collector smoke: ${eventCollectorSmoke.status}.`,
    nextAction: liveAnalytics
      ? 'Continue importing live player events before rollups.'
      : 'Keep local/fixture rollups active until production collector credentials exist.',
  },
  {
    id: 'local-event-bridge',
    status: systemStatus(localEventBridgeReady, 'needs-local-bridge'),
    autonomy: 'zero-spend-local-learning',
    evidence: `Bridge ${localEventBridge.status}; inbox ${localEventBridge.inbox?.validEvents ?? 0} event(s); imported ${
      localEventBridge.imported?.events ?? 0
    } event(s).`,
    nextAction:
      localEventBridge.status === 'bridge-ready-for-ingest'
        ? 'Import validated local event drops before the next analytics rollup.'
        : 'Keep the browser export and explicit drop-folder bridge ready until the hosted collector is configured.',
  },
  {
    id: 'autonomous-cadence',
    status: systemStatus(
      autonomousCadence.status === 'cadence-ready' &&
        autonomousCadence.controls?.zeroPaidSpend === true &&
        autonomousCadence.controls?.codexAutomationExpectedActive === true &&
        autonomousCadence.schedulers?.githubActions?.status === 'scheduled' &&
        autonomousCadence.commandPlan?.operate === 'npm run autonomous:operate',
      'needs-cadence-evidence',
    ),
    autonomy: 'scheduled-local-owner-loop',
    evidence: `Cadence ${autonomousCadence.status}; Codex ${
      autonomousCadence.schedulers?.codexDesktop?.status ?? 'missing'
    }; GitHub ${autonomousCadence.schedulers?.githubActions?.status ?? 'missing'}.`,
    nextAction:
      autonomousCadence.nextActions?.[0] ??
      'Keep the daily Codex automation and scheduled CI workflow aligned with the owner loop.',
  },
  {
    id: 'autonomous-self-update',
    status: systemStatus(
      autonomousSelfUpdate.status === 'self-update-ready' &&
        autonomousSelfUpdate.controls?.zeroPaidSpend === true &&
        autonomousSelfUpdate.controls?.commitRequiresCleanVerification === true &&
        autonomousSelfUpdate.controls?.commitRequiresSafePathAllowlist === true &&
        autonomousSelfUpdate.controls?.directPushRequiresExplicitVariable === true,
      'needs-self-update-evidence',
    ),
    autonomy: autonomousSelfUpdate.repository?.remotePushReady
      ? 'verified-generated-change-persistence'
      : 'gated-generated-change-persistence',
    evidence: `Self-update ${autonomousSelfUpdate.status}; safe pending ${
      autonomousSelfUpdate.pendingChanges?.safeCount ?? 0
    }; unsafe pending ${autonomousSelfUpdate.pendingChanges?.unsafeCount ?? 0}; remote push ${
      autonomousSelfUpdate.repository?.remotePushReady === true ? 'ready' : 'held'
    }.`,
    nextAction:
      autonomousSelfUpdate.nextActions?.[0] ??
      'Keep generated production changes staged only after daily and browser verification.',
  },
  {
    id: 'portfolio-loop',
    status: systemStatus(
      portfolioPolicy.status === 'portfolio-policy-ready' &&
        portfolioPolicy.games?.length === playableCount &&
        portfolioPolicy.rotation?.seedTrafficGameIds?.length,
    ),
    autonomy: 'automatic',
    evidence: `Daily challenge: ${portfolioPolicy.dailyChallenge?.title}; seed traffic: ${
      portfolioPolicy.rotation?.seedTrafficGameIds?.join(', ') || 'none'
    }.`,
    nextAction: portfolioPolicy.nextActions?.[0] ?? 'Keep ranking the portfolio from behavior and growth signals.',
  },
  {
    id: 'traffic-seeding',
    status: systemStatus(traffic.status === 'traffic-seeding-ready' && traffic.campaigns?.length),
    autonomy: 'zero-spend-automatic',
    evidence: `${traffic.campaigns?.length ?? 0} seed campaign(s); max cost $${
      traffic.guardrails?.maxCostUsd ?? 0
    }.`,
    nextAction: traffic.nextActions?.[0] ?? 'Keep seeding under-measured games through organic/internal channels.',
  },
  {
    id: 'acquisition-learning',
    status: systemStatus(
      acquisition.status === 'acquisition-learning-ready' &&
        acquisition.campaigns?.length === traffic.campaigns?.length,
    ),
    autonomy: acquisition.sourceStatus?.rawAttributionAvailable
      ? 'automatic-attributed'
      : 'automatic-collecting',
    evidence: `${acquisition.summary?.campaigns ?? 0} campaign(s); ${
      acquisition.summary?.totalAttributedStarts ?? 0
    } attributed start(s); candidate ${acquisition.summary?.featuredGameId ?? 'none'}.`,
    nextAction:
      acquisition.nextActions?.[0] ?? 'Connect campaign-attributed starts to the next growth placement decision.',
  },
  {
    id: 'organic-seed-loop',
    status: systemStatus(
      organicSeedLoop.status === 'organic-seed-loop-ready' &&
        organicSeedLoop.runtimeSurface?.status === 'armed' &&
        organicSeedLoop.guardrails?.maxCostUsd === 0 &&
        organicSeedLoop.guardrails?.playerInitiatedSharingOnly === true &&
        organicSeedLoop.guardrails?.noAutomatedExternalPosting === true,
    ),
    autonomy: 'zero-spend-player-initiated',
    evidence: `Target ${organicSeedLoop.target?.gameId ?? 'missing'}; surface ${
      organicSeedLoop.runtimeSurface?.surface ?? 'missing'
    }; share telemetry ${organicSeedLoop.runtimeSurface?.telemetry?.shared ?? 'missing'}.`,
    nextAction: organicSeedLoop.nextActions?.[0] ?? 'Keep the current seed campaign visible in the growth loop.',
  },
  {
    id: 'retention-loop',
    status: systemStatus(
      retention.status === 'retention-loop-ready' &&
        retention.dailyChallenge?.gameId === portfolioPolicy.dailyChallenge?.gameId &&
        retention.guardrails?.noPushNotifications === true &&
        retention.guardrails?.noAccountsRequired === true &&
        retention.guardrails?.noPaidRetentionMechanics === true &&
        retention.promptPolicy?.telemetry?.clicked === 'daily_return_prompt_clicked' &&
        retention.returnIntentPolicy?.telemetry?.started === 'daily_return_intent_started',
    ),
    autonomy: 'automatic-local-streak',
    evidence: `Daily ${retention.dailyChallenge?.gameId ?? 'missing'}; D1 ${percent(
      retention.metrics?.d1Retention,
    )}%; streak variant ${retention.rewardPolicy?.recommendedVariant ?? 'missing'}; return prompt ${
      retention.promptPolicy?.status ?? 'missing'
    }; return intent ${retention.returnIntentPolicy?.status ?? 'missing'}.`,
    nextAction: retention.nextActions?.[0] ?? 'Keep daily return missions active.',
  },
  {
    id: 'pwa-install-loop',
    status: systemStatus(
      pwaInstall.status === 'pwa-install-loop-ready' &&
        pwaInstall.channel?.costUsd === 0 &&
        pwaInstall.samplePolicy?.controls?.zeroPaidSpend === true &&
        pwaInstall.samplePolicy?.controls?.noSyntheticInstalls === true &&
        pwaInstall.guardrails?.noForcedPrompt === true &&
        pwaInstall.guardrails?.noBlockingGameplay === true &&
        pwaInstall.guardrails?.respectBrowserPromptAvailability === true,
    ),
    autonomy: 'automatic-browser-controlled',
    evidence: `Prompt ${pwaInstall.promptPolicy?.surface ?? 'missing'}; installs ${
      pwaInstall.metrics?.installed ?? 0
    }; launch events ${pwaInstall.metrics?.launchModes ?? 0}; sample ${pwaInstall.samplePolicy?.status ?? 'missing'} needs ${
      pwaInstall.samplePolicy?.needed?.promptViews ?? 'n/a'
    } prompt(s) and ${pwaInstall.samplePolicy?.needed?.launchModes ?? 'n/a'} launch event(s).`,
    nextAction: pwaInstall.nextActions?.[0] ?? 'Keep measuring PWA installs and standalone launches.',
  },
  {
    id: 'performance-budget',
    status: systemStatus(
      performanceBudget.status === 'performance-budget-ready' &&
        performanceBudget.controls?.phaserDeferredFromInitialShell === true &&
        performanceBudget.initial?.jsBytes <= performanceBudget.budgets?.initialJsMaxBytes &&
        performanceBudget.initial?.gzipBytes <= performanceBudget.budgets?.initialGzipMaxBytes,
    ),
    autonomy: 'automatic-build-budget',
    evidence: `Initial JS ${performanceBudget.initial?.jsKb ?? 'n/a'} KB; gzip ${
      performanceBudget.initial?.gzipKb ?? 'n/a'
    } KB; deferred chunks ${performanceBudget.deferred?.chunks?.length ?? 0}.`,
    nextAction: performanceBudget.nextActions?.[0] ?? 'Keep Phaser deferred from the initial PWA shell.',
  },
  {
    id: 'product-optimization',
    status: systemStatus(
      productOptimization.status === 'product-optimization-ready' &&
        productOptimization.controls?.requirePlayableGame === true &&
        productOptimization.controls?.noRepeatForSameSourceData === true &&
        productOptimization.actions?.some((action) => action.actionType === 'target-score-curve') &&
        productOptimization.actions?.some((action) => action.actionType === 'runtime-replay-telemetry') &&
        productOptimization.actions?.some((action) => action.actionType === 'runtime-replay-prompt') &&
        productOptimization.actions?.some((action) => action.actionType === 'runtime-completion-nudge') &&
        productOptimization.actions?.some((action) => action.actionType === 'runtime-finish-line-coach'),
    ),
    autonomy: 'bounded-product-tuning',
    evidence: `Completion ${percent(productOptimization.productGates?.firstGameCompletion?.actual)}% / gate ${percent(
      productOptimization.productGates?.firstGameCompletion?.gate,
    )}%; latest ${productOptimization.actions?.[0]?.status ?? 'missing'}.`,
    nextAction: productOptimization.nextActions?.[0] ?? 'Tune product gates from measured completion and replay data.',
  },
  {
    id: 'support-feedback',
    status: systemStatus(
      ['support-feedback-ready', 'support-feedback-empty', 'support-feedback-planned'].includes(
        supportFeedback.status,
      ) &&
        supportFeedback.provider === 'github-issues' &&
        supportFeedback.controls?.zeroPaidSpend === true &&
        supportFeedback.controls?.readOnlyGithubIssueList === true &&
        supportFeedback.controls?.noIssueMutation === true &&
        supportFeedback.controls?.noRawAnalyticsStored === true &&
        supportFeedback.controls?.aggregateEvidenceNeverMarksProductGatePass === true,
      'needs-feedback-ingest',
    ),
    autonomy: 'read-only-public-feedback-routing',
    evidence: `Support feedback ${supportFeedback.status}; issues ${
      supportFeedback.summary?.issuesInspected ?? 0
    }; routable signals ${supportFeedback.summary?.routableSignals ?? 0}; aggregate notes ${
      supportFeedback.summary?.aggregateEvidenceNotes ?? 0
    }.`,
    nextAction:
      supportFeedback.nextActions?.[0] ??
      'Inspect public GitHub Issues and route playable game signals into the guarded backlog.',
  },
  {
    id: 'product-gate-recovery',
    status: systemStatus(
      productGateRecovery.status === 'product-gate-recovery-ready' &&
        productGateRecovery.controls?.zeroPaidSpend === true &&
        productGateRecovery.controls?.noSyntheticGatePasses === true &&
        productGateRecovery.controls?.requireObservedTelemetryBeforeCopyChange === true &&
        productGateRecovery.priorities?.length >= 1,
      'needs-recovery-plan',
    ),
    autonomy: 'observed-lift-recovery-plan',
    evidence: `Recovery ${productGateRecovery.status}; primary ${
      productGateRecovery.summary?.primaryBottleneck ?? 'missing'
    }; experiment ${productGateRecovery.summary?.primaryExperimentStatus ?? 'missing'}; failing gates ${
      productGateRecovery.summary?.failingGates ?? 0
    }; next lift ${
      productGateRecovery.priorities?.[0]?.neededSuccesses ?? 'n/a'
    }.`,
    nextAction:
      productGateRecovery.nextActions?.[0] ??
      'Keep ranking the smallest observed lift needed before revenue gates can open.',
  },
  {
    id: 'product-gate-sample-plan',
    status: systemStatus(
      productGateSamplePlan.status === 'product-gate-sample-plan-ready' &&
        productGateSamplePlan.controls?.zeroPaidSpend === true &&
        productGateSamplePlan.controls?.noSyntheticGatePasses === true &&
        productGateSamplePlan.controls?.requireObservedTelemetryBeforeRecoveryChange === true,
      'needs-sample-plan',
    ),
    autonomy: 'sample-collection-routing',
    evidence: `Sample plan ${productGateSamplePlan.status}; primary ${
      productGateSamplePlan.summary?.primaryGateId ?? 'missing'
    }; prompt views needed ${productGateSamplePlan.summary?.totalPromptViewsNeeded ?? 'missing'}.`,
    nextAction:
      productGateSamplePlan.nextActions?.[0] ??
      'Convert product gate deficits into zero-cost sample collection missions before changing copy or revenue gates.',
  },
  {
    id: 'first-move-coach',
    status: systemStatus(
      firstMoveCoach.status === 'first-move-coach-ready' &&
        firstMoveCoach.controls?.firstTurnOnly === true &&
        firstMoveCoach.controls?.noAutoMove === true &&
        firstMoveCoach.summary?.enabledTargets >= 1,
      'needs-coach-policy',
    ),
    autonomy: 'bounded-first-session-assist',
    evidence: `Coach ${firstMoveCoach.status}; enabled targets ${
      firstMoveCoach.summary?.enabledTargets ?? 0
    }; primary ${firstMoveCoach.summary?.primaryTargetId ?? 'none'}.`,
    nextAction: 'Measure first-move coach shown/used/skipped events against completion before monetization gates open.',
  },
  {
    id: 'completion-loop',
    status: systemStatus(
      completionLoop.status === 'completion-loop-ready' &&
        completionLoop.controls?.zeroPaidSpend === true &&
        completionLoop.controls?.midRunOnly === true &&
        completionLoop.controls?.finishLineCoachBehindPaceOnly === true &&
        completionLoop.controls?.noAutoMove === true &&
        completionLoop.promptPolicy?.telemetry?.clicked === 'completion_nudge_clicked' &&
        completionLoop.finishLinePolicy?.telemetry?.clicked === 'finish_line_coach_clicked',
      'needs-completion-policy',
    ),
    autonomy: 'bounded-mid-run-nudge',
    evidence: `Completion loop ${completionLoop.status}; prompt ${
      completionLoop.promptPolicy?.status ?? 'missing'
    }; finish line ${completionLoop.finishLinePolicy?.status ?? 'missing'}; target ${
      completionLoop.target?.gameId ?? 'missing'
    }; completion ${percent(
      completionLoop.metrics?.firstGameCompletion,
    )}%.`,
    nextAction:
      completionLoop.nextActions?.[0] ??
      'Measure completion_nudge_viewed/clicked/dismissed against completion and abandonment.',
  },
  {
    id: 'replay-loop',
    status: systemStatus(
      replayLoop.status === 'replay-loop-ready' &&
        replayLoop.controls?.zeroPaidSpend === true &&
        replayLoop.controls?.afterCompletedRunOnly === true &&
        replayLoop.controls?.noForcedReplay === true &&
        replayLoop.promptPolicy?.telemetry?.clicked === 'replay_prompt_clicked',
      'needs-replay-policy',
    ),
    autonomy: 'bounded-completed-run-nudge',
    evidence: `Replay loop ${replayLoop.status}; prompt ${
      replayLoop.promptPolicy?.status ?? 'missing'
    }; target ${replayLoop.target?.gameId ?? 'missing'}; replay ${percent(
      replayLoop.metrics?.replayRate,
    )}%.`,
    nextAction:
      replayLoop.nextActions?.[0] ??
      'Measure replay_prompt_viewed/clicked/dismissed against replay_clicked before changing copy.',
  },
  {
    id: 'improvement-loop',
    status: systemStatus(
      Array.isArray(improvementBacklog) &&
        improvementBacklog.length > 0 &&
        improvementBacklogSummary.status === 'improvement-backlog-ready' &&
        improvementBacklogSummary.backlogCount === improvementBacklog.length &&
        Array.isArray(appliedImprovementActions),
      'needs-more-evidence',
    ),
    autonomy: releaseHealth.controls?.canApplyExperimentChanges ? 'bounded-automatic' : 'held-by-health',
    evidence: `${improvementBacklogSummary.status}; ${improvementBacklog.length} backlog item(s); ${
      experimentResults.recommendations?.length ?? 0
    } experiment recommendation(s); applied status ${appliedImprovementStatus}; source ${
      improvementBacklogSummary.sourceDataHash ?? 'missing'
    }.`,
    nextAction: releaseHealth.controls?.canApplyExperimentChanges
      ? 'Apply only bounded experiment and backlog changes.'
      : 'Freeze experiment changes until release health clears.',
  },
  {
    id: 'organic-growth',
    status: systemStatus(growth.status?.startsWith('growth-') && growth.gamePages?.length === playableCount),
    autonomy: 'automatic',
    evidence: `${growth.gamePages?.length ?? 0} SEO/share pages; optimization ${
      growth.optimization?.optimizedGames ?? 0
    } page(s).`,
    nextAction: 'Use generated game pages and share links as the zero-cost acquisition channel.',
  },
  {
    id: 'repository-channel',
    status: systemStatus(repositoryChannelReady, repositoryReadiness.status ?? 'missing'),
    autonomy: repositoryReadiness.githubAutomation?.workflowDispatchReady
      ? 'workflow-dispatch-ready'
      : 'read-only-repository-preflight',
    evidence: `Repository ${repositoryReadiness.repository?.target ?? 'missing'}; git worktree ${
      repositoryReadiness.workspace?.insideWorkTree === true ? 'ready' : 'missing'
    }; workflow dispatch ${
      repositoryReadiness.githubAutomation?.workflowDispatchReady === true ? 'ready' : 'blocked'
    }.`,
    nextAction:
      repositoryReadiness.nextActions?.[0] ??
      'Prepare the GitHub repository channel before treating web deploy as runnable.',
  },
  {
    id: 'repository-bootstrap',
    status: systemStatus(repositoryBootstrapPrepared, repositoryBootstrap.status ?? 'missing'),
    autonomy: 'guarded-git-transport-bootstrap',
    evidence: `Bootstrap ${repositoryBootstrap.status}; mode ${
      repositoryBootstrap.mode ?? 'missing'
    }; helper ${repositoryBootstrap.helper?.path ?? 'missing'}; local git ${
      repositoryBootstrap.workspace?.after?.insideWorkTree === true ? 'ready' : 'missing'
    }.`,
    nextAction:
      repositoryBootstrap.nextActions?.[0] ??
      'Keep the local git/GitHub transport helper generated and explicitly gated.',
  },
  {
    id: 'web-deployment',
    status: systemStatus(
      deployment.status === 'ready-for-pages' && readiness.webPwa?.status === 'ready-after-build',
      'blocked',
    ),
    autonomy: 'workflow-gated',
    evidence: `Deployment ${deployment.status}; web readiness ${readiness.webPwa?.status ?? 'missing'}; promotion ${
      webDecision?.status ?? 'missing'
    }.`,
    nextAction: webDecision?.nextAction ?? 'Publish the static PWA only through the gated deploy workflow.',
  },
  {
    id: 'release-candidate',
    status: systemStatus(
      releaseCandidate.status === 'release-candidate-ready' &&
        releaseCandidate.summary?.requiredFilesPresent === true &&
        releaseCandidate.controls?.contentHashesRecorded === true &&
        (releaseCandidate.postDeploySmoke?.length ?? 0) >= 6,
      'needs-release-manifest',
    ),
    autonomy: 'content-hashed-deploy-evidence',
    evidence: `Release candidate ${releaseCandidate.status}; files ${
      releaseCandidate.summary?.totalFiles ?? 0
    }; smoke URLs ${
      releaseCandidate.summary?.postDeploySmokeUrls ?? 0
    }.`,
    nextAction: 'Regenerate the release candidate after every production build before deploy or rollback decisions.',
  },
  {
    id: 'post-deploy-smoke',
    status: systemStatus(postDeploySmokeRunnerReady, 'waiting-for-origin'),
    autonomy: 'read-only-live-deploy-verification',
    evidence: `Smoke ${postDeploySmoke.status}; origin ${
      postDeploySmoke.target?.origin ?? 'missing'
    }; manifest comparison ${
      postDeploySmoke.controls?.manifestHashComparisonRequired === true ? 'required' : 'missing'
    }; checks ${
      postDeploySmoke.summary?.passed ?? 0
    }/${postDeploySmoke.summary?.planned ?? 0} passed; local artifact ${
      postDeploySmoke.localArtifactSmoke?.status ?? 'missing'
    } ${postDeploySmoke.localArtifactSmoke?.summary?.passed ?? 0}/${
      postDeploySmoke.localArtifactSmoke?.summary?.planned ?? 0
    } passed.`,
    nextAction:
      postDeploySmoke.nextActions?.[0] ??
      'Run the smoke runner with the deployed Pages URL after the workflow publishes the PWA.',
  },
  {
    id: 'post-deploy-artifact-sync',
    status: systemStatus(postDeployArtifactSyncReady, 'waiting-for-strict-workflow-artifact'),
    autonomy: 'read-only-actions-artifact-import',
    evidence: `Artifact sync ${postDeployArtifactSync.status}; run ${
      postDeployArtifactSync.workflow?.runId ?? 'missing'
    }; live matches artifact ${postDeployArtifactSync.live?.matchesArtifact === true}; strict ${
      postDeployArtifactSync.validation?.artifactStrict === true
    }.`,
    nextAction:
      postDeployArtifactSync.nextActions?.[0] ??
      'Import the latest successful Pages smoke artifact and compare it to the live release manifest.',
  },
  {
    id: 'live-site-monitor',
    status: systemStatus(liveSiteMonitorReady, 'needs-live-monitor-refresh'),
    autonomy: 'read-only-continuous-live-observability',
    evidence: `Live monitor ${liveSiteMonitor.status}; origin ${
      liveSiteMonitor.origin?.origin ?? 'missing'
    }; checks ${liveSiteMonitor.summary?.passed ?? 0}/${liveSiteMonitor.summary?.planned ?? 0}; live matches synced deploy ${
      liveSiteMonitor.summary?.liveMatchesSyncedDeploy === true
    }.`,
    nextAction:
      liveSiteMonitor.nextActions?.[0] ??
      'Run the live site monitor between deploys to catch public PWA, support, privacy, and release-manifest drift.',
  },
  {
    id: 'production-bootstrap',
    status: systemStatus(
      productionBootstrap.status === 'production-bootstrap-ready' &&
        productionBootstrap.controls?.zeroSpendGuard === true &&
        productionBootstrap.controls?.noPaidResourcesCreated === true &&
        productionBootstrap.setupScript?.path === 'ops/github/setup-production.sh',
      'waiting-for-credentials',
    ),
    autonomy: 'zero-spend-setup-orchestration',
    evidence: `Bootstrap ${productionBootstrap.status}; mode ${
      productionBootstrap.mode ?? 'missing'
    }; external blockers ${productionBootstrap.summary?.externalBlockers ?? productionBootstrap.externalBlockers?.length ?? 0}.`,
    nextAction:
      productionBootstrap.ownerAction?.command ?? 'Regenerate the bootstrap setup and keep external blockers explicit.',
  },
  {
    id: 'production-activation',
    status: systemStatus(productionActivationReady, 'waiting-for-credentials'),
    autonomy: 'guarded-credential-activated-setup',
    evidence: `Activation ${productionActivation.status}; mode ${
      productionActivation.mode ?? 'missing'
    }; execution ${productionActivation.execution?.status ?? 'missing'}; gh ${
      productionActivation.configuration?.ghCredentialReady === true ? 'ready' : 'blocked'
    }.`,
    nextAction:
      productionActivation.nextActions?.[0] ??
      'Apply configured production setup automatically once repository credentials and activation gates exist.',
  },
  {
    id: 'production-blocker-handoff',
    status: systemStatus(productionBlockerHandoffCurrent, 'needs-handoff-refresh'),
    autonomy: 'ranked-external-unlock-router',
    evidence: `Handoff ${productionBlockerHandoff.status}; next ${
      productionBlockerHandoff.summary?.nextBestUnlockId ?? 'none'
    }; owner inputs ${productionBlockerHandoff.summary?.ownerActionRequired ?? 0}; missing env ${
      productionBlockerHandoff.summary?.missingEnv ?? 0
    }; missing secrets ${productionBlockerHandoff.summary?.missingSecrets ?? 0}.`,
    nextAction:
      productionBlockerHandoff.nextActions?.[0] ??
      'Keep the ranked production blocker handoff current as external inputs and product gates change.',
  },
  {
    id: 'production-unlock-runner',
    status: systemStatus(productionUnlockRunnerCurrent, 'needs-unlock-runner-refresh'),
    autonomy: 'allowlisted-unlock-followup-runner',
    evidence: `Unlock runner ${productionUnlockRunner.status}; runnable ${
      productionUnlockRunner.summary?.runnableUnlocks ?? 0
    }; queued commands ${productionUnlockRunner.summary?.queuedCommands ?? productionUnlockRunner.commandQueue?.length ?? 0}; unsafe ${
      productionUnlockRunner.summary?.blockedUnsafeUnlocks ?? 0
    }.`,
    nextAction:
      productionUnlockRunner.nextActions?.[0] ??
      'Run the unlock runner only after a blocker handoff becomes configured or clear.',
  },
  {
    id: 'support-channel',
    status: systemStatus(
      ['support-channel-ready', 'support-channel-planned'].includes(supportChannel.status) &&
        supportChannel.provider === 'github-issues' &&
        supportChannel.controls?.zeroPaidSpend === true &&
        supportChannel.controls?.playerInitiatedOnly === true &&
        supportChannel.controls?.analyticsEvidenceAggregateOnly === true &&
        supportChannel.controls?.supportEmailStillRequiredForStoreSubmission === true,
      'needs-support-intake',
    ),
    autonomy: 'zero-spend-public-feedback-intake',
    evidence: `Support channel ${supportChannel.status}; repository ${
      supportChannel.repository?.target ?? 'missing'
    }; public intake ${supportChannel.repository?.publicIssuesReady === true ? 'ready' : 'planned'}; aggregate evidence only ${
      supportChannel.controls?.analyticsEvidenceAggregateOnly === true
    }.`,
    nextAction:
      supportChannel.nextActions?.[0] ??
      'Keep public issue intake ready while retaining the app-store support email blocker.',
  },
  {
    id: 'autonomous-operator',
    status: systemStatus(
      (['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status) || operatorPlanHeld) &&
        autonomousOperator.controls?.zeroPaidSpend === true &&
        autonomousOperator.controls?.localCommandAllowlistEnforced === true &&
        autonomousOperator.controls?.maxActionsPerRun === 1,
      'needs-operator-plan',
    ),
    autonomy: 'one-safe-action-runner',
    evidence: `Operator ${autonomousOperator.status}; selected ${
      autonomousOperator.selectedAction?.id ?? 'none'
    }; execution ${autonomousOperator.execution?.status ?? 'missing'}.`,
    nextAction: 'Keep a dry-run operator plan ready, then execute only one allowlisted local action when explicitly requested.',
  },
  {
    id: 'operator-history',
    status: systemStatus(
      autonomousOperatorHistory.status === 'operator-history-ready' &&
        autonomousOperatorHistory.controls?.historyIsCapped === true &&
        autonomousOperatorHistory.controls?.localCommandAllowlistEnforced === true &&
        (autonomousOperatorHistory.summary?.totalRecords ?? 0) >= 1,
      'needs-history',
    ),
    autonomy: 'operator-audit-trail',
    evidence: `History ${autonomousOperatorHistory.status}; records ${
      autonomousOperatorHistory.summary?.totalRecords ?? 0
    }; executed ${autonomousOperatorHistory.summary?.executedRecords ?? 0}.`,
    nextAction: 'Keep a capped durable record of operator plans and one-action executions.',
  },
  {
    id: 'objective-audit',
    status: systemStatus(
      objectiveAudit.status === 'objective-in-progress' &&
        objectiveAudit.controls?.preserveOriginalScope === true &&
        objectiveAudit.completion?.canMarkGoalComplete === false &&
        (objectiveAudit.requirements?.length ?? 0) >= 8,
      'needs-audit',
    ),
    autonomy: 'completion-evidence-ledger',
    evidence: `Audit ${objectiveAudit.status}; met ${objectiveAudit.summary?.met ?? 'n/a'}/${
      objectiveAudit.summary?.requirements ?? 'n/a'
    }; external blockers ${objectiveAudit.summary?.externalBlockers ?? 'n/a'}.`,
    nextAction: objectiveAudit.completion?.reason ?? 'Regenerate the objective audit after each owner/operator cycle.',
  },
  {
    id: 'store-listing-optimizer',
    status: systemStatus(
      storeListingOptimizer.status === 'store-listing-optimizer-ready' &&
        storeListingOptimizer.recommendation?.focusGameId === storePackage.launchCandidate?.id &&
        storeListingOptimizer.copyGuardrails?.noProtectedBoardGameNames === true &&
        storeListingOptimizer.copyGuardrails?.noMonetizationClaimsBeforeEnabled === true,
    ),
    autonomy: 'automatic-aso-draft',
    evidence: `Focus ${storeListingOptimizer.recommendation?.focusGameId ?? 'missing'}; lead screenshot ${
      storeListingOptimizer.screenshotPriorities?.[0]?.id ?? 'missing'
    }; candidate changed ${storeListingOptimizer.recommendation?.changedLaunchCandidate ? 'yes' : 'no'}.`,
    nextAction:
      storeListingOptimizer.nextActions?.[0] ?? 'Keep store listing copy aligned with growth and retention evidence.',
  },
  {
    id: 'store-compliance',
    status: systemStatus(storeCompliance.status === 'draft-ready-external-blockers', 'blocked'),
    autonomy: 'automatic-draft-held-by-external-review',
    evidence: `Rating ${storeCompliance.contentRating?.googlePlay?.expectedRating ?? 'missing'}; target audience ${
      storeCompliance.targetAudience?.directedToChildren === false ? 'general' : 'review'
    }; blockers ${storeCompliance.blockers?.length ?? 0}.`,
    nextAction:
      storeCompliance.nextActions?.[0] ?? 'Keep store compliance drafts current with package and monetization changes.',
  },
  {
    id: 'android-signing',
    status: systemStatus(
      androidSigning.status === 'signing-prepared' &&
        androidSigning.controls?.noSecretValuesInReports === true &&
        androidSigning.controls?.doesNotCommitKeystore === true &&
        Boolean(androidSigning.signing?.sha256CertFingerprint),
      'needs-signing-material',
    ),
    autonomy: 'local-secret-material-prepared',
    evidence: `Signing ${androidSigning.status}; fingerprint ${
      androidSigning.signing?.sha256CertFingerprint ? 'available' : 'missing'
    }; local secrets ${androidSigning.ciSecrets?.configuredLocally === true ? 'configured' : 'missing'}.`,
    nextAction:
      androidSigning.nextActions?.[0] ??
      'Keep Android signing material local and sync CI secrets only through production bootstrap.',
  },
  {
    id: 'production-safety',
    status: systemStatus(
      productionResponse.status &&
        incidentDrill.status === 'pass' &&
        unitEconomics.controls?.spendGuardActive === true,
    ),
    autonomy: 'automatic-guarded',
    evidence: `Response ${productionResponse.status}; incident drill ${incidentDrill.status}; spend mode ${unitEconomics.status}.`,
    nextAction: 'Keep rollback, experiment freeze, revenue hold, and spend hold controls active.',
  },
  {
    id: 'monetization-path',
    status: monetization.revenueEnabled ? 'ready' : 'held-by-product-gates',
    autonomy: 'guarded-disabled',
    evidence: `Revenue ${monetization.revenueEnabled ? 'enabled' : 'disabled'}; promotion ${
      monetizationDecision?.status ?? 'missing'
    }; completion ${percent(monetization.metrics?.firstGameCompletion)}%.`,
    nextAction: 'Collect live completion, replay, and retention evidence before enabling revenue.',
  },
  {
    id: 'app-store-path',
    status:
      androidRelease.status === 'ready-for-internal-testing' && iosRelease.status === 'ready-for-testflight-handoff'
        ? 'ready'
        : androidRelease.status,
    autonomy: 'draft-ready-held-by-economics',
    evidence: `Native package ${nativePackage.status}; Android promotion ${androidDecision?.status ?? 'missing'}; screenshots ${
      storeAssets.screenshots?.length ?? 0
    }; iOS ${iosRelease.status}.`,
    nextAction: 'Keep Android/iOS distribution prepared but blocked until host, signing, account, and payback gates clear.',
  },
]

const readySystems = systems.filter((system) =>
  ['ready', 'bootstrap-fixture', 'held-by-product-gates', 'zero-spend-web-ready'].includes(system.status),
)

const credentialRequiredActions = [
  ...(productionEnvironment.requiredEnv ?? [])
    .filter((item) => !item.configured)
    .map((item) => ({
      id: `env-${item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      status: 'credential-required',
      target: item.name,
      purpose: item.purpose,
      source: 'production-environment',
    })),
  ...(productionBootstrap.requiredSecrets ?? [])
    .filter((item) => !item.configured)
    .map((item) => ({
      id: `secret-${item.repositorySecret.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      status: 'credential-required',
      target: item.repositorySecret,
      purpose: `Repository secret sourced from ${item.envName}.`,
      source: 'production-bootstrap',
    })),
]

const blockedExternalActions = [
  {
    id: 'live-analytics-collector',
    status: eventCollectorDeployment.status,
    target: 'cloudflare-worker-r2',
    reason: eventCollectorDeployment.setupRequiredOnce?.[0] ?? 'Collector production environment is not configured.',
    unblockWhen: 'Cloudflare account, R2 bucket, collector URLs, write token, and admin export token exist.',
  },
  {
    id: 'android-internal-testing',
    status: androidRelease.status,
    target: 'google-play',
    reason: androidRelease.blockers?.[0] ?? 'Android release gate is blocked.',
    unblockWhen: 'Hosted PWA, signing material, Play credentials, and store-spend payback gates clear.',
  },
  {
    id: 'revenue-enable',
    status: monetization.status,
    target: 'ads-and-optional-perks',
    reason: monetization.blockers?.[0] ?? 'Revenue gates are not open.',
    unblockWhen: 'Live retention, replay, completion, ad-network, and compliance gates pass.',
  },
]

const gateSampleMissions = productGateSamplePlan.missions ?? []
const gateSampleNeedsEvidence = gateSampleMissions.some((mission) =>
  mission.status === 'collecting-sample' ||
  ['waiting-for-player-export', 'inbox-ready-for-ingest'].includes(mission.evidence?.status),
)
const gateSampleEvidenceReadyNow =
  (localEventBridge.gateSampleEvidence?.inbox?.events ?? 0) > 0 ||
  (localEventBridge.gateSampleEvidence?.imported?.events ?? 0) > 0
const gateSampleDownloadsBackoffHours = 4
const gateSampleDownloadsExpiryBufferMs = 60 * 1000
const gateSampleDownloadsPolicy = buildExplicitDownloadsScanPolicy({
  explicitDownloadsScan: localEventBridge.explicitDownloadsScan,
  gateSampleEvidence: localEventBridge.gateSampleEvidence,
  cooldownHours: gateSampleDownloadsBackoffHours,
  expiryBufferMs: gateSampleDownloadsExpiryBufferMs,
})
const gateSampleDownloadsPolicySource = stableDownloadsScanPolicySource(gateSampleDownloadsPolicy)
const explicitDownloadsScanAt = Date.parse(gateSampleDownloadsPolicy.lastScanAt ?? '')
const gateSampleDownloadsScanCoolingDown = gateSampleDownloadsPolicy.coolingDown
const productGateSamplePlanFreshAfterDownloadsScan =
  Number.isFinite(explicitDownloadsScanAt) &&
  Number.isFinite(Date.parse(productGateSamplePlan.generatedAt ?? '')) &&
  Date.parse(productGateSamplePlan.generatedAt) >= explicitDownloadsScanAt
const productGateSamplePlanRefreshInputs = [
  { id: 'product-gate-recovery', generatedAt: productGateRecovery.generatedAt },
  { id: 'product-optimization', generatedAt: productOptimization.generatedAt },
  { id: 'analytics-rollup', generatedAt: analytics.generatedAt },
  { id: 'traffic-seeding', generatedAt: traffic.generatedAt },
  { id: 'organic-seed-loop', generatedAt: organicSeedLoop.generatedAt },
  { id: 'retention-loop', generatedAt: retention.generatedAt },
  { id: 'completion-loop', generatedAt: completionLoop.generatedAt },
  { id: 'replay-loop', generatedAt: replayLoop.generatedAt },
  { id: 'unit-economics', generatedAt: unitEconomics.generatedAt },
  { id: 'support-feedback', generatedAt: supportFeedback.generatedAt },
  { id: 'support-channel', generatedAt: supportChannel.generatedAt },
]
const productGateSamplePlanGeneratedAtMs = generatedAtMs(productGateSamplePlan)
const productGateSamplePlanGeneratedDate =
  typeof productGateSamplePlanGeneratedAtMs === 'number'
    ? localIsoDate(new Date(productGateSamplePlanGeneratedAtMs))
    : null
const productGateSamplePlanSampleDateCurrent = productGateSamplePlanGeneratedDate === localIsoDate()
const productGateSamplePlanStaleInputIds = productGateSamplePlanRefreshInputs
  .filter((artifact) => {
    const artifactGeneratedAtMs = generatedAtMs(artifact)

    return (
      typeof artifactGeneratedAtMs === 'number' &&
      (typeof productGateSamplePlanGeneratedAtMs !== 'number' ||
        artifactGeneratedAtMs > productGateSamplePlanGeneratedAtMs)
    )
  })
  .map((artifact) => artifact.id)
const localEventCollectionFreshnessInputs = [
  { id: 'event-ingest', generatedAt: eventIngest.generatedAt },
  { id: 'analytics-rollup', generatedAt: analytics.generatedAt },
  { id: 'product-gate-recovery', generatedAt: productGateRecovery.generatedAt },
  { id: 'product-gate-sample-plan', generatedAt: productGateSamplePlan.generatedAt },
]
const localEventBridgeGeneratedAtMs = generatedAtMs(localEventBridge)
const localEventCollectionStaleInputs = localEventCollectionFreshnessInputs.filter((artifact) => {
  const artifactGeneratedAtMs = generatedAtMs(artifact)

  return (
    typeof localEventBridgeGeneratedAtMs === 'number' &&
    (typeof artifactGeneratedAtMs !== 'number' || artifactGeneratedAtMs < localEventBridgeGeneratedAtMs)
  )
})
const localEventCollectionNoEventCurrent =
  localEventBridgeReady &&
  !liveAnalytics &&
  !gateSampleEvidenceReadyNow &&
  localEventBridge.status === 'bridge-waiting-for-export' &&
  (localEventBridge.inbox?.validEvents ?? 0) === 0 &&
  (localEventBridge.imported?.events ?? 0) === 0 &&
  localEventCollectionStaleInputs.length === 0
const gateSampleCollectionTargets = [
  productGateSamplePlan.summary?.primaryGateId ?? productGateRecovery.summary?.primaryBottleneck ?? 'product-gates',
  ...gateSampleMissions.map((mission) => mission.campaignId).filter(Boolean).slice(0, 2),
]
const retentionDailyChallenge = portfolioPolicy.dailyChallenge
const retentionRewardExperiment = experimentResults.recommendations?.find(
  (recommendation) => recommendation.experiment === 'reward_offer',
)
const retentionRewardPolicy = experimentPolicy.experiments?.reward_offer
const retentionRewardExperimentDetail = experimentResults.experiments?.find(
  (experiment) => experiment.id === 'reward_offer',
)
const retentionD1Gate = productGateRecovery.gates?.find((gate) => gate.id === 'd1Retention') ?? null
const retentionDownloadsScanPolicy = localEventBridge.explicitDownloadsScanPolicy ?? {
  explicitOptInRequired: true,
  cooldownHours: 4,
  coolingDown: false,
  evidenceReadyNow: false,
  lastScanAt: localEventBridge.explicitDownloadsScan?.scannedAt ?? null,
  lastScanStatus: localEventBridge.explicitDownloadsScan?.status ?? null,
  scanAgeHours: null,
  cooldownRemainingHours: 0,
  nextRecommendedScanAt: new Date().toISOString(),
}
const objectiveAuditFreshnessInputs = [
  { id: 'analytics-rollup', generatedAt: analytics.generatedAt },
  { id: 'event-ingest', generatedAt: eventIngest.generatedAt },
  { id: 'local-event-bridge', generatedAt: localEventBridge.generatedAt },
  { id: 'product-gate-recovery', generatedAt: productGateRecovery.generatedAt },
  { id: 'product-gate-sample-plan', generatedAt: productGateSamplePlan.generatedAt },
  { id: 'production-activation', generatedAt: productionActivation.generatedAt },
  { id: 'support-channel', generatedAt: supportChannel.generatedAt },
  { id: 'support-feedback', generatedAt: supportFeedback.generatedAt },
  { id: 'repository-readiness', generatedAt: repositoryReadiness.generatedAt },
  { id: 'repository-bootstrap', generatedAt: repositoryBootstrap.generatedAt },
  { id: 'monetization-plan', generatedAt: monetization.generatedAt },
  { id: 'android-release', generatedAt: androidRelease.generatedAt },
  { id: 'ios-release', generatedAt: iosRelease.generatedAt },
]
const objectiveAuditGeneratedAtMs = generatedAtMs(objectiveAudit)
const objectiveAuditStaleInputs = objectiveAuditFreshnessInputs.filter((artifact) => {
  const artifactGeneratedAtMs = generatedAtMs(artifact)

  return (
    typeof artifactGeneratedAtMs === 'number' &&
    (typeof objectiveAuditGeneratedAtMs !== 'number' || artifactGeneratedAtMs > objectiveAuditGeneratedAtMs)
  )
})
const objectiveAuditStructurallyReady =
  objectiveAudit.status === 'objective-in-progress' &&
  objectiveAudit.controls?.preserveOriginalScope === true &&
  objectiveAudit.completion?.canMarkGoalComplete === false &&
  (objectiveAudit.requirements?.length ?? 0) >= 8
const objectiveAuditFresh = objectiveAuditStructurallyReady && objectiveAuditStaleInputs.length === 0
const productOptimizationSourceGates = {
  firstGameCompletion: {
    actual: roundMetric(analytics.totals?.metrics?.firstGameCompletion),
    gate: productionGates.monetization?.minFirstGameCompletion,
    pass: (analytics.totals?.metrics?.firstGameCompletion ?? 0) >= productionGates.monetization?.minFirstGameCompletion,
  },
  replayRate: {
    actual: roundMetric(analytics.totals?.metrics?.replayRate),
    gate: productionGates.monetization?.minReplayRate,
    pass: (analytics.totals?.metrics?.replayRate ?? 0) >= productionGates.monetization?.minReplayRate,
  },
  d1Retention: {
    actual: roundMetric(analytics.totals?.metrics?.d1Retention),
    gate: productionGates.monetization?.minD1Retention,
    pass: (analytics.totals?.metrics?.d1Retention ?? 0) >= productionGates.monetization?.minD1Retention,
  },
}
const productOptimizationPlayableIds = new Set(playable.games ?? [])
const productOptimizationSourceEvidence = {
  analyticsSource: analytics.sourceStatus?.activeSource,
  retentionSource: analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? null,
  totals: analytics.totals?.metrics,
  games: (analytics.games ?? []).map((game) => ({
    gameId: game.gameId,
    playable: productOptimizationPlayableIds.has(game.gameId),
    starts: game.counts?.game_started ?? 0,
    metrics: game.metrics,
  })),
  gates: productOptimizationSourceGates,
}
const retentionSourceEvidence = {
  today: localIsoDate(),
  dailyChallenge: retentionDailyChallenge,
  analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
  retention: analytics.retention,
  metrics: analytics.totals?.metrics ?? {},
  experiment: {
    recommendation: retentionRewardExperiment,
    rewardPolicy: retentionRewardPolicy,
    rewardExperimentDetail: retentionRewardExperimentDetail,
  },
  releaseHealth: {
    status: releaseHealth.status,
    canApplyExperimentChanges: releaseHealth.controls?.canApplyExperimentChanges,
  },
  playableGames: playable.games ?? [],
  productGateRecovery: {
    status: productGateRecovery.status,
    summary: productGateRecovery.summary,
    d1Gate: retentionD1Gate,
  },
  localEventBridge: {
    status: localEventBridge.status,
    explicitDownloadsScanPolicy: retentionDownloadsScanPolicy,
    gateSampleEvidence: localEventBridge.gateSampleEvidence,
  },
}
const trafficSeedingSourceEvidence = {
  runDate: slugDate(),
  playable,
  portfolio: portfolioPolicy,
  growth,
  analytics,
  unitEconomics,
}
const acquisitionLearningSourceEvidence = {
  analytics,
  traffic,
  growth,
  unitEconomics,
  playable,
  localEventFiles: acquisitionLocalEventFiles,
  events: acquisitionLocalEvents,
}
const organicSeedLoopSourceEvidence = {
  playable,
  analytics,
  traffic,
  acquisition,
  retention,
  unitEconomics,
}
const pwaInstallSourceEvidence = {
  analytics: {
    sourceStatus: analytics.sourceStatus,
    counts: analytics.totals?.counts ?? {},
  },
  growthInstallChannel: (growth.channels ?? []).find((channel) => channel.id === 'pwa-install') ?? null,
  acquisition: {
    status: acquisition.status,
    summary: acquisition.summary ?? null,
  },
  retention: {
    status: retention.status,
    dailyChallenge: retention.dailyChallenge ?? null,
  },
  releaseHealth: {
    status: releaseHealth.status,
    canDeploy: releaseHealth.controls?.canDeploy ?? null,
  },
  iconAssets: {
    status: iconAssets.status,
    manifestIcons: iconAssets.manifestIcons ?? [],
    assets: iconAssets.assets ?? [],
  },
  productionEnvironment: {
    publicOrigin: productionEnvironment.publicOrigin ?? {},
  },
  viteConfig,
}
const productGateRecoverySourceEvidence = {
  analytics,
  gates: productionGates,
  productOptimization,
  completionLoop: {
    status: completionLoop.status,
    promptPolicy: {
      surface: completionLoop.promptPolicy?.surface ?? null,
      telemetry: completionLoop.promptPolicy?.telemetry ?? null,
    },
    finishLinePolicy: {
      telemetry: completionLoop.finishLinePolicy?.telemetry ?? null,
    },
  },
  replayLoop: {
    status: replayLoop.status,
    promptPolicy: {
      surface: replayLoop.promptPolicy?.surface ?? null,
      telemetry: replayLoop.promptPolicy?.telemetry ?? null,
    },
  },
  retentionLoop: {
    status: retention.status,
    promptPolicy: {
      telemetry: retention.promptPolicy?.telemetry ?? null,
    },
    returnIntentPolicy: {
      surface: retention.returnIntentPolicy?.surface ?? null,
      telemetry: retention.returnIntentPolicy?.telemetry ?? null,
    },
  },
  firstMoveCoach: {
    status: firstMoveCoach.status,
  },
  monetization: {
    status: monetization.status,
    revenueEnabled: monetization.revenueEnabled === true,
  },
}
const productGateSamplePlanRetentionSourceEvidence = {
  status: retention.status,
  dailyChallenge: retention.dailyChallenge ?? null,
  returnIntentSurface: retention.returnIntentPolicy?.surface ?? null,
}
const productGateSamplePlanAggregateEvidenceRepository =
  typeof supportChannel.repository?.target === 'string' && /^[\w.-]+\/[\w.-]+$/.test(supportChannel.repository.target)
    ? supportChannel.repository.target
    : null
const productGateSamplePlanSourceEvidence = {
  sampleDate: localIsoDate(),
  productGateRecovery,
  productOptimization,
  analytics,
  trafficSeeding: stableTrafficSeedingForSamplePlan(traffic),
  organicSeedLoop,
  retentionLoop: productGateSamplePlanRetentionSourceEvidence,
  completionLoop,
  replayLoop,
  localEventBridge,
  downloadsScanPolicy: gateSampleDownloadsPolicySource,
  unitEconomics,
  supportFeedback: {
    status: supportFeedback.status,
    sourceDataHash: supportFeedback.sourceDataHash,
    aggregateEvidenceNotes: supportFeedback.summary?.aggregateEvidenceNotes ?? 0,
  },
  supportChannel: {
    status: supportChannel.status,
    repository: productGateSamplePlanAggregateEvidenceRepository,
    analyticsEvidenceAggregateOnly: supportChannel.controls?.analyticsEvidenceAggregateOnly === true,
  },
}
const storePackageSourceEvidence = {
  pipeline: prototypePipeline,
  gates: productionGates,
  analytics,
  environment: productionEnvironment,
  supportChannel,
}
const storePackageListingSource = {
  sourceDataHash: storePackage.sourceDataHash ?? null,
  launchCandidate: storePackage.launchCandidate ?? null,
  privacyPolicy: storePackage.privacyPolicy ?? null,
  supportPage: storePackage.supportPage ?? null,
  compliancePublication: storePackage.compliancePublication ?? null,
  dataSafetyDraft: storePackage.dataSafetyDraft ?? null,
  nativePackaging: storePackage.nativePackaging ?? null,
  costGates: storePackage.costGates ?? null,
  storeListingContentRatingNotes: storePackage.storeListing?.contentRatingNotes ?? null,
}
const storeListingOptimizerSourceEvidence = {
  storePackage: storePackageListingSource,
  storeAssets,
  growth,
  portfolio: portfolioPolicy,
  acquisition,
  retention,
  pwaInstall,
  monetization,
  generatedPlayable,
  storeCompliance: {
    status: storeCompliance.status,
  },
}
const storeComplianceSourceEvidence = {
  storePackage,
  monetization,
  productionEnvironment,
  unitEconomics,
  storeAssets,
}
const productOptimizationFreshness = sourceFreshness({
  artifact: productOptimization,
  readyStatuses: ['product-optimization-ready'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'production-gates', data: productionGates },
    { id: 'playable-games', data: playable },
  ],
  sourceDataHash: hashRawSourceData(productOptimizationSourceEvidence),
})
const retentionLoopFreshness = sourceFreshness({
  artifact: retention,
  readyStatuses: ['retention-loop-ready', 'blocked-missing-daily-game'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'portfolio-policy', data: portfolioPolicy },
    { id: 'experiment-policy', data: experimentPolicy },
    { id: 'experiment-results', data: experimentResults },
    { id: 'release-health', data: releaseHealth },
    { id: 'playable-games', data: playable },
    { id: 'product-gate-recovery', data: productGateRecovery },
    { id: 'local-event-bridge', data: localEventBridge },
  ],
  sourceDataHash: hashRawSourceData(retentionSourceEvidence),
})
const trafficSeedingFreshness = sourceFreshness({
  artifact: traffic,
  readyStatuses: ['traffic-seeding-ready', 'blocked-no-seed-games'],
  inputs: [
    { id: 'playable-games', data: playable },
    { id: 'portfolio-policy', data: portfolioPolicy },
    { id: 'growth-plan', data: growth },
    { id: 'analytics-rollup', data: analytics },
    { id: 'unit-economics', data: unitEconomics },
  ],
  sourceDataHash: hashSourceData(trafficSeedingSourceEvidence),
})
const acquisitionLearningFreshness = sourceFreshness({
  artifact: acquisition,
  readyStatuses: ['acquisition-learning-ready', 'blocked-no-campaigns'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'traffic-seeding', data: traffic },
    { id: 'growth-plan', data: growth },
    { id: 'unit-economics', data: unitEconomics },
    { id: 'playable-games', data: playable },
  ],
  sourceDataHash: hashSourceData(acquisitionLearningSourceEvidence),
})
const organicSeedLoopFreshness = sourceFreshness({
  artifact: organicSeedLoop,
  readyStatuses: ['organic-seed-loop-ready', 'blocked-no-campaigns'],
  inputs: [
    { id: 'playable-games', data: playable },
    { id: 'analytics-rollup', data: analytics },
    { id: 'traffic-seeding', data: traffic },
    { id: 'acquisition-learning', data: acquisition },
    { id: 'retention-loop', data: retention },
    { id: 'unit-economics', data: unitEconomics },
  ],
  sourceDataHash: hashSourceData(organicSeedLoopSourceEvidence),
})
const pwaInstallFreshness = sourceFreshness({
  artifact: pwaInstall,
  readyStatuses: ['pwa-install-loop-ready'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'growth-plan', data: growth },
    { id: 'acquisition-learning', data: acquisition },
    { id: 'retention-loop', data: retention },
    { id: 'release-health', data: releaseHealth },
    { id: 'icon-assets', data: iconAssets },
    { id: 'production-environment', data: productionEnvironment },
    { id: 'vite-config', data: viteConfig },
  ],
  sourceDataHash: hashSourceData(pwaInstallSourceEvidence),
})
const productGateRecoveryFreshness = sourceFreshness({
  artifact: productGateRecovery,
  readyStatuses: ['product-gate-recovery-ready'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'production-gates', data: productionGates },
    { id: 'product-optimization', data: productOptimization },
    { id: 'completion-loop', data: completionLoop },
    { id: 'replay-loop', data: replayLoop },
    { id: 'retention-loop', data: retention },
    { id: 'first-move-coach', data: firstMoveCoach },
    { id: 'monetization-plan', data: monetization },
  ],
  sourceDataHash: hashSourceData(productGateRecoverySourceEvidence),
})
const productGateSamplePlanFreshness = sourceFreshness({
  artifact: productGateSamplePlan,
  readyStatuses: ['product-gate-sample-plan-ready'],
  inputs: [
    { id: 'sample-date', data: localIsoDate() },
    { id: 'product-gate-recovery', data: productGateRecovery },
    { id: 'product-optimization', data: productOptimization },
    { id: 'analytics-rollup', data: analytics },
    { id: 'traffic-seeding', data: traffic },
    { id: 'organic-seed-loop', data: organicSeedLoop },
    { id: 'retention-loop', data: retention },
    { id: 'completion-loop', data: completionLoop },
    { id: 'replay-loop', data: replayLoop },
    { id: 'local-event-bridge', data: localEventBridge },
    { id: 'unit-economics', data: unitEconomics },
    { id: 'support-feedback', data: supportFeedback },
  ],
  sourceDataHash: hashSourceData(productGateSamplePlanSourceEvidence),
})
const productGateSamplePlanNeedsRefresh =
  productGateSamplePlan.status === 'product-gate-sample-plan-ready' && !productGateSamplePlanFreshness.current
const productGateSamplePlanMaterialRefreshNeeded =
  !productGateSamplePlanSampleDateCurrent ||
  productGateSamplePlanStaleInputIds.length > 0 ||
  gateSampleEvidenceReadyNow
const productGateSamplePlanCooldownOnlyStale =
  productGateSamplePlanNeedsRefresh &&
  gateSampleDownloadsScanCoolingDown &&
  productGateSamplePlanFreshAfterDownloadsScan &&
  !productGateSamplePlanMaterialRefreshNeeded
const storePackageFreshness = sourceFreshness({
  artifact: storePackage,
  readyStatuses: ['store-package-ready'],
  inputs: [
    { id: 'prototype-pipeline', data: prototypePipeline },
    { id: 'production-gates', data: productionGates },
    { id: 'analytics-rollup', data: analytics },
    { id: 'production-environment', data: productionEnvironment },
    { id: 'support-channel', data: supportChannel },
  ],
  sourceDataHash: hashSourceData(storePackageSourceEvidence),
})
const storeListingOptimizerFreshness = sourceFreshness({
  artifact: storeListingOptimizer,
  readyStatuses: ['store-listing-optimizer-ready'],
  inputs: [
    { id: 'store-package', data: storePackage },
    { id: 'store-assets', data: storeAssets },
    { id: 'growth-plan', data: growth },
    { id: 'portfolio-policy', data: portfolioPolicy },
    { id: 'acquisition-learning', data: acquisition },
    { id: 'retention-loop', data: retention },
    { id: 'pwa-install-loop', data: pwaInstall },
    { id: 'monetization-plan', data: monetization },
    { id: 'generated-playable-games', data: generatedPlayable },
    { id: 'store-compliance', data: storeCompliance },
  ],
  sourceDataHash: hashSourceData(storeListingOptimizerSourceEvidence),
})
const storeComplianceFreshness = sourceFreshness({
  artifact: storeCompliance,
  readyStatuses: ['draft-ready-external-blockers', 'needs-store-assets', 'needs-compliance-draft'],
  inputs: [
    { id: 'store-package', data: storePackage },
    { id: 'monetization-plan', data: monetization },
    { id: 'production-environment', data: productionEnvironment },
    { id: 'unit-economics', data: unitEconomics },
    { id: 'store-assets', data: storeAssets },
  ],
  sourceDataHash: hashSourceData(storeComplianceSourceEvidence),
})
const firstMoveCoachFreshness = sourceFreshness({
  artifact: firstMoveCoach,
  readyStatuses: ['first-move-coach-ready'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'product-optimization', data: productOptimization },
    { id: 'experiment-policy', data: experimentPolicy },
    { id: 'improvement-backlog', data: improvementBacklog },
    { id: 'playable-games', data: playable },
    { id: 'game-balance', data: gameBalance },
    { id: 'generated-playable-games', data: generatedPlayable },
    { id: 'release-health', data: releaseHealth },
  ],
})
const completionLoopFreshness = sourceFreshness({
  artifact: completionLoop,
  readyStatuses: ['completion-loop-ready', 'blocked-missing-completion-game'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'production-gates', data: productionGates },
    { id: 'product-optimization', data: productOptimization },
    { id: 'release-health', data: releaseHealth },
    { id: 'playable-games', data: playable },
    { id: 'portfolio-policy', data: portfolioPolicy },
    { id: 'game-balance', data: gameBalance },
    { id: 'first-move-coach', data: firstMoveCoach },
  ],
})
const replayLoopFreshness = sourceFreshness({
  artifact: replayLoop,
  readyStatuses: ['replay-loop-ready', 'blocked-missing-replay-game'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'production-gates', data: productionGates },
    { id: 'product-optimization', data: productOptimization },
    { id: 'release-health', data: releaseHealth },
    { id: 'playable-games', data: playable },
    { id: 'portfolio-policy', data: portfolioPolicy },
    { id: 'growth-plan', data: growth },
    { id: 'experiment-policy', data: experimentPolicy },
    { id: 'experiment-results', data: experimentResults },
  ],
})
const appliedImprovementsStableInput = JSON.stringify({
  source: analytics.sourceStatus?.activeSource,
  totals: analytics.totals?.counts,
  games: analytics.games?.map((game) => ({
    gameId: game.gameId,
    counts: game.counts,
    metrics: game.metrics,
  })),
  playableGames: [...productOptimizationPlayableIds],
  experimentResults: experimentResults.experiments?.map((experiment) => ({
    id: experiment.id,
    variants: experiment.variants?.map((variant) => ({
      variantId: variant.variantId,
      counts: variant.counts,
      metrics: variant.metrics,
    })),
  })),
})
const appliedImprovementsFreshness = sourceFreshness({
  artifact: appliedImprovements,
  readyStatuses: ['applied-improvements-ready'],
  inputs: [
    { id: 'analytics-rollup', data: analytics },
    { id: 'improvement-backlog', data: improvementBacklog },
    { id: 'playable-games', data: playable },
    { id: 'experiment-results', data: experimentResults },
  ],
  sourceDataHash: hashTextSourceData(`${appliedImprovementsStableInput}\n${rawImprovementBacklog}`),
})
const operationalEvidenceMaxAgeHours = 18
const cadenceOperationalFreshness = operationalEvidenceFreshness({
  artifact: autonomousCadence,
  readyStatuses: ['cadence-ready'],
  maxAgeHours: operationalEvidenceMaxAgeHours,
  checksPass: (autonomousCadence.checks ?? []).every((check) => check.status === 'pass'),
  extraReady:
    autonomousCadence.controls?.zeroPaidSpend === true &&
    autonomousCadence.controls?.codexAutomationExpectedActive === true &&
    autonomousCadence.controls?.codexAutomationActualStatusAudited === true &&
    autonomousCadence.controls?.postActionVerification === true &&
    autonomousCadence.freshnessPolicy?.status === 'fresh' &&
    autonomousCadence.freshnessPolicy?.staleArtifactCount === 0 &&
    autonomousCadence.schedulers?.githubActions?.status === 'scheduled' &&
    autonomousCadence.commandPlan?.operate === 'npm run autonomous:operate',
})
const selfUpdateOperationalFreshness = operationalEvidenceFreshness({
  artifact: autonomousSelfUpdate,
  readyStatuses: ['self-update-ready'],
  maxAgeHours: operationalEvidenceMaxAgeHours,
  checksPass: (autonomousSelfUpdate.checks ?? []).every((check) => check.status === 'pass'),
  extraReady:
    autonomousSelfUpdate.pendingChanges?.unsafeCount === 0 &&
    (autonomousSelfUpdate.blockers?.length ?? 0) === 0 &&
    autonomousSelfUpdate.controls?.zeroPaidSpend === true &&
    autonomousSelfUpdate.controls?.commitRequiresCleanVerification === true &&
    autonomousSelfUpdate.controls?.commitRequiresSafePathAllowlist === true &&
    autonomousSelfUpdate.commitPlan?.workflow === '.github/workflows/autonomous-self-update.yml',
})
const supportFeedbackOperationalFreshness = operationalEvidenceFreshness({
  artifact: supportFeedback,
  readyStatuses: [
    'support-feedback-ready',
    'support-feedback-empty',
    'support-feedback-planned',
    'support-feedback-unavailable',
  ],
  maxAgeHours: operationalEvidenceMaxAgeHours,
  checksPass: true,
  extraReady:
    supportFeedback.provider === 'github-issues' &&
    supportFeedback.controls?.zeroPaidSpend === true &&
    supportFeedback.controls?.readOnlyGithubIssueList === true &&
    supportFeedback.controls?.noIssueMutation === true &&
    supportFeedback.controls?.noRawAnalyticsStored === true &&
    supportFeedback.controls?.aggregateEvidenceNeverMarksProductGatePass === true &&
    Array.isArray(supportFeedback.issueRecords) &&
    Array.isArray(supportFeedback.aggregateEvidenceNotes) &&
    Array.isArray(supportFeedback.improvementSignals),
})
const performanceOperationalFreshness = operationalEvidenceFreshness({
  artifact: performanceBudget,
  readyStatuses: ['performance-budget-ready'],
  maxAgeHours: operationalEvidenceMaxAgeHours,
  checksPass: true,
  extraReady:
    performanceBudget.controls?.phaserDeferredFromInitialShell === true &&
    performanceBudget.controls?.initialShellBudgetEnforced === true &&
    performanceBudget.initial?.jsBytes <= performanceBudget.budgets?.initialJsMaxBytes &&
    performanceBudget.initial?.gzipBytes <= performanceBudget.budgets?.initialGzipMaxBytes &&
    releaseCandidate.status === 'release-candidate-ready' &&
    typeof releaseCandidate.candidateId === 'string',
})
const liveSiteMonitorOperationalFreshness = operationalEvidenceFreshness({
  artifact: liveSiteMonitor,
  readyStatuses: ['live-site-monitor-passed'],
  maxAgeHours: operationalEvidenceMaxAgeHours,
  checksPass: (liveSiteMonitor.checks ?? []).every((check) => check.status === 'pass'),
  extraReady: liveSiteMonitorReady,
})

const safeAutonomousActions = [
  {
    id: 'run-daily-owner-loop',
    status: 'armed',
    costUsd: 0,
    command: 'npm run autonomous:daily',
    reason: 'Regenerates trend, game, analytics, growth, safety, monetization, deployment, and owner-loop state.',
  },
  {
    id: 'hold-for-external-input',
    status: 'monitor',
    costUsd: 0,
    command: 'No local command is available until external inputs, configured credentials, or new player evidence arrive.',
    targets: [
      productionBlockerHandoff.summary?.nextBestUnlockId ?? 'external-input',
      productGateSamplePlan.summary?.primaryGateId ?? 'product-gate-data',
    ],
    reason:
      'All safe local refresh actions are current; hold execution until owner-provided inputs, production analytics, or real player evidence changes the state.',
  },
  {
    id: 'refresh-autonomous-cadence',
    status: cadenceOperationalFreshness.fresh ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:cadence',
    targets: [
      autonomousCadence.schedulers?.codexDesktop?.id ?? 'codex-daily-automation',
      autonomousCadence.schedulers?.githubActions?.workflow ?? '.github/workflows/autonomous-daily.yml',
    ],
    reason: cadenceOperationalFreshness.fresh
      ? 'Cadence evidence is already fresh, scheduled, verified, and zero-spend guarded.'
      : 'Keeps the unattended daily operating cadence, recovery policy, and verification chain auditable.',
  },
  {
    id: 'refresh-autonomous-self-update',
    status: selfUpdateOperationalFreshness.fresh ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:self-update',
    targets: [autonomousSelfUpdate.commitPlan?.workflow ?? '.github/workflows/autonomous-self-update.yml'],
    reason: selfUpdateOperationalFreshness.fresh
      ? 'Self-update evidence is already fresh, verified, allowlisted, and gated behind explicit repository controls.'
      : 'Keeps verified generated-change persistence gated, allowlisted, and ready for the scheduled production repository.',
  },
  {
    id: 'seed-portfolio-traffic',
    status:
      trafficSeedingFreshness.current && acquisitionLearningFreshness.current && organicSeedLoopFreshness.current
        ? 'monitor'
        : traffic.status === 'traffic-seeding-ready' && traffic.campaigns?.length
          ? 'armed'
          : 'monitor',
    costUsd: 0,
    command:
      'npm run autonomous:growth && npm run autonomous:portfolio && npm run autonomous:traffic && npm run autonomous:acquisition && npm run autonomous:organic-seed-loop',
    targets: traffic.campaigns?.map((campaign) => campaign.gameId) ?? portfolioPolicy.rotation?.seedTrafficGameIds ?? [],
    reason:
      trafficSeedingFreshness.current && acquisitionLearningFreshness.current && organicSeedLoopFreshness.current
        ? 'Traffic campaigns, acquisition learning, and organic seed surface already reflect the current inputs.'
        : 'Under-measured playable games need free organic/internal traffic before quality judgment.',
  },
  {
    id: 'refresh-organic-seed-loop',
    status: organicSeedLoopFreshness.current
      ? 'monitor'
      : organicSeedLoop.status === 'organic-seed-loop-ready'
        ? 'armed'
        : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:organic-seed-loop',
    targets: [organicSeedLoop.target?.gameId ?? 'organic-seed-loop'],
    reason: organicSeedLoopFreshness.current
      ? 'Organic seed surface already reflects current traffic, acquisition, retention, and analytics inputs.'
      : 'Refreshes the player-initiated zero-cost share surface for the highest-opportunity seed campaign.',
  },
  {
    id: 'refresh-support-feedback',
    status: supportFeedbackOperationalFreshness.fresh
      ? 'monitor'
      : ['support-channel-ready', 'support-channel-planned'].includes(supportChannel.status)
        ? 'armed'
        : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:support-feedback',
    targets: [supportChannel.repository?.target ?? 'github-issues'],
    reason: supportFeedbackOperationalFreshness.fresh
      ? 'Support feedback evidence was recently inspected with read-only GitHub issue controls.'
      : 'Reads public GitHub issue intake and turns player reports into redacted improvement signals.',
  },
  {
    id: 'optimize-daily-retention',
    status: retentionLoopFreshness.current ? 'monitor' : retention.status === 'retention-loop-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:retention',
    targets: retention.dailyChallenge?.gameId ? [retention.dailyChallenge.gameId] : [],
    reason: retentionLoopFreshness.current
      ? 'Daily challenge, return-intent, and D1 sample policies already reflect current retention evidence.'
      : 'Keeps daily challenge, local streak prompts, and retention-safe missions aligned with behavior data.',
  },
  {
    id: 'measure-pwa-install-loop',
    status: pwaInstallFreshness.current ? 'monitor' : pwaInstall.status === 'pwa-install-loop-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:pwa-install',
    targets: [pwaInstall.channel?.id ?? 'pwa-install'],
    reason: pwaInstallFreshness.current
      ? 'PWA install loop already matches current analytics, acquisition, retention, hosting, icons, and PWA config.'
      : 'Measures optional PWA install prompts and standalone launches as the zero-cost distribution path.',
  },
  {
    id: 'check-performance-budget',
    status: performanceOperationalFreshness.fresh ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run build && npm run autonomous:performance && npm run autonomous:release-candidate',
    targets: ['pwa-shell', performanceBudget.deferred?.gameChunk?.file ?? 'game-runtime', 'dist-release-candidate'],
    reason: performanceOperationalFreshness.fresh
      ? 'Performance budget and release-candidate evidence are already fresh for the current guarded build.'
      : 'Keeps the PWA shell fast while Phaser and game scenes stay deferred, then refreshes the deployable manifest for the rebuilt dist.',
  },
  {
    id: 'prepare-release-candidate',
    status: releaseCandidate.status === 'release-candidate-ready' && !releaseCandidateActionFresh ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor',
    targets: ['dist-release-candidate', 'release-candidate-manifest'],
    reason: releaseCandidateActionFresh
      ? 'Local release manifest smoke and strict synced live deploy evidence are fresh; continue product learning.'
      : 'Records a content-hashed dist inventory, refreshes post-deploy smoke evidence, and checks the currently live PWA against the synced deploy.',
  },
  {
    id: 'run-post-deploy-smoke',
    status: postDeploySmoke.target?.origin && !postDeploySmokeActionFresh ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:post-deploy-smoke',
    targets: [postDeploySmoke.target?.origin ?? 'deployed-pages-url', 'release-candidate-manifest'],
    reason: postDeploySmokeActionFresh
      ? 'Local smoke and strict CI artifact sync already prove the current deploy evidence; continue product learning.'
      : postDeploySmoke.target?.origin
        ? 'Verifies the live Pages URL with read-only smoke checks and release-manifest hash comparison.'
        : 'Waits for a deployed Pages origin, then verifies the live PWA matches the exact release candidate.',
  },
  {
    id: 'sync-post-deploy-artifact',
    status: postDeployArtifactSyncReady ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:post-deploy-artifact-sync',
    targets: [postDeployArtifactSync.workflow?.runId ?? 'latest-successful-pages-run', 'release-candidate-manifest'],
    reason: postDeployArtifactSyncReady
      ? 'Strict deploy artifact evidence is already synced from the latest successful Pages workflow.'
      : 'Downloads the latest successful Pages smoke artifact and validates it against the live release manifest.',
  },
  {
    id: 'refresh-live-site-monitor',
    status: liveSiteMonitorOperationalFreshness.fresh ? 'monitor' : postDeployArtifactSyncReady ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:live-monitor',
    targets: [liveSiteMonitor.origin?.origin ?? postDeployArtifactSync.live?.origin ?? 'public-pwa-origin'],
    reason: liveSiteMonitorOperationalFreshness.fresh
      ? 'Live site monitor already proves the public PWA, support/privacy assets, and release manifest match the synced deploy.'
      : postDeployArtifactSyncReady
        ? 'Runs read-only live checks between deploys so public PWA drift is caught without waiting for a new release.'
        : 'Waits for strict post-deploy artifact sync before treating live monitor output as production evidence.',
  },
  {
    id: 'optimize-product-gates',
    status: productOptimizationFreshness.current ? 'monitor' : 'armed',
    costUsd: 0,
    command:
      'npm run autonomous:analyze && npm run autonomous:product-optimize && npm run autonomous:sync-config && npm run autonomous:simulate',
    targets: productOptimization.actions
      ?.filter((action) => action.gameId)
      .map((action) => action.gameId) ?? ['product-gates'],
    reason: productOptimizationFreshness.current
      ? 'Product-gate optimizer already matches the current analytics evidence; collect player data or use dedicated runtime loops before rerunning.'
      : 'Applies one guarded target-score or telemetry improvement when product gates block monetization.',
  },
  {
    id: 'refresh-product-gate-recovery',
    status:
      productGateRecovery.status === 'product-gate-recovery-ready' && !productGateRecoveryFreshness.current
        ? 'armed'
        : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:gate-recovery && npm run autonomous:sample-plan',
    targets: [
      productGateRecovery.summary?.primaryBottleneck ?? 'product-gate-recovery',
      productGateSamplePlan.summary?.primaryGateId ?? 'product-gate-sample-plan',
    ],
    reason: productGateRecoveryFreshness.current
      ? productGateSamplePlanNeedsRefresh
        ? 'Product-gate recovery is current; the dedicated sample-plan action owns sample-only refreshes to avoid rerunning recovery without new recovery evidence.'
        : 'Product-gate recovery and sample missions already match current gate, analytics, loop, and event-bridge evidence.'
      : 'Ranks the exact observed lift and immediately refreshes the zero-spend sample missions before revenue gates can open.',
  },
  {
    id: 'collect-gate-sample-downloads',
    status:
      productGateSamplePlan.status === 'product-gate-sample-plan-ready' &&
      gateSampleNeedsEvidence &&
      !gateSampleDownloadsScanCoolingDown
        ? 'armed'
        : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:collect-sample-downloads',
    targets: gateSampleCollectionTargets,
    reason: gateSampleDownloadsScanCoolingDown
      ? `Recent explicit Downloads scan found no player exports; retry after ${gateSampleDownloadsBackoffHours} hours or when an inbox event drop appears.`
      : 'Opt-in scans local browser Downloads and the event inbox for real player exports, imports them, refreshes analytics and recovery, then regenerates the sample plan.',
  },
  {
    id: 'refresh-product-gate-sample-plan',
    status:
      productGateRecoveryFreshness.current &&
      productGateSamplePlanNeedsRefresh &&
      !productGateSamplePlanCooldownOnlyStale
        ? 'armed'
        : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:sample-plan',
    targets: [productGateSamplePlan.summary?.primaryGateId ?? productGateRecovery.summary?.primaryBottleneck ?? 'product-gates'],
    reason: productGateSamplePlanFreshness.current
      ? 'Product-gate sample plan already matches current recovery, traffic, event-bridge, and daily sample-date inputs.'
      : !productGateRecoveryFreshness.current
        ? 'Waits for product-gate recovery to refresh first, then regenerates missions from the updated recovery evidence.'
        : productGateSamplePlanCooldownOnlyStale
          ? `Sample plan already captured the latest no-evidence Downloads scan; retry after ${gateSampleDownloadsBackoffHours} hours or when real player evidence appears.`
      : 'Turns gate deficits into zero-cost player-initiated sample missions and exact refresh commands.',
  },
  {
    id: 'refresh-first-move-coach',
    status: firstMoveCoachFreshness.current ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:first-move-coach',
    targets: [firstMoveCoach.summary?.primaryTargetId ?? 'first-move-coach'],
    reason: firstMoveCoachFreshness.current
      ? 'First-turn coach already matches the current source evidence; wait for new product-gate or onboarding data.'
      : 'Refreshes the first-turn coach policy from product-gate, onboarding, and release-health evidence.',
  },
  {
    id: 'refresh-completion-loop',
    status: completionLoopFreshness.current ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:completion-loop',
    targets: [completionLoop.target?.gameId ?? 'completion-loop'],
    reason: completionLoopFreshness.current
      ? 'Completion loop already matches the current source evidence; wait for new completion or coach data.'
      : 'Refreshes optional completion nudges and behind-pace finish-line coaching from product-gate evidence.',
  },
  {
    id: 'refresh-replay-loop',
    status: replayLoopFreshness.current ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:replay-loop',
    targets: [replayLoop.target?.gameId ?? 'replay-loop'],
    reason: replayLoopFreshness.current
      ? 'Replay loop already matches the current source evidence; wait for new replay or experiment data.'
      : 'Refreshes the optional completed-run replay prompt from product-gate and replay telemetry evidence.',
  },
  {
    id: 'prepare-repository-channel',
    status: repositoryChannelReady || repositoryHandoffPrepared ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap',
    targets: [repositoryReadiness.repository?.target ?? 'github-repository-channel'],
    reason: repositoryChannelReady
      ? 'Keeps the GitHub Pages deployment channel evidence fresh.'
      : repositoryHandoffPrepared
        ? 'Repository handoff is prepared with explicit zero-spend commands and now waits only for owner/auth, so the operator should continue product and data work.'
        : 'Surfaces and prepares the missing git/GitHub deployment-channel blockers before web deploy.',
  },
  {
    id: 'bootstrap-production-setup',
    status: productionBootstrapFresh
      ? 'monitor'
      : productionBootstrap.status === 'production-bootstrap-ready'
        ? 'armed'
        : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:release-candidate && npm run autonomous:deploy-plan && npm run autonomous:bootstrap',
    targets: ['github-pages', 'repository-config', 'event-collector'],
    reason: productionBootstrapFresh
      ? 'Production bootstrap handoff is fresh, so the operator should prioritize product learning and local event collection.'
      : 'Regenerates the zero-spend production setup handoff and exact GitHub variable/secret commands.',
  },
  {
    id: 'activate-production-when-configured',
    status: productionActivationRunnable ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:activate-production',
    targets: ['github-pages', 'repository-config', 'web-workflow'],
    reason: productionActivationRunnable
      ? 'Applies configured zero-spend production setup through the guarded activation controller.'
      : 'Dry-runs production activation until existing credentials and explicit activation gates are present.',
  },
  {
    id: 'refresh-production-blocker-handoff',
    status: productionBlockerHandoffCurrent ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:blocker-handoff',
    targets: [productionBlockerNextOwnerInput?.id ?? 'production-blocker-handoff'],
    reason: productionBlockerHandoffCurrent
      ? `Production blocker handoff already ranks ${productionBlockerOwnerInputItems.length} owner input(s), ${productionBlockerMissingEnvCount} env blocker(s), and ${productionBlockerMissingSecretCount} secret blocker(s).`
      : 'Refreshes the ranked external/product blocker handoff before owner, operator, readiness, and production decisions rely on it.',
  },
  {
    id: 'run-production-unlock-runner',
    status: productionUnlockRunnerCurrent && !productionUnlockRunnerRunnable ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:unlock-runner -- --execute',
    targets: [
      productionBlockerHandoff.summary?.nextBestUnlockId ?? 'production-unlock-runner',
      `${productionUnlockRunner.summary?.queuedCommands ?? 0}-queued-command(s)`,
    ],
    reason: productionUnlockRunnerRunnable
      ? 'Executes the allowlisted zero-spend local follow-up queue for newly unlocked production handoff items.'
      : productionUnlockRunnerCurrent
        ? 'Unlock runner is current and idle until credentials, product gates, or live sample evidence unlock follow-up commands.'
        : 'Refreshes the unlock runner against the latest blocker handoff and executes only configured/clear allowlisted local follow-ups.',
  },
  {
    id: 'run-autonomous-operator',
    status: operatorPlanPublished ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:operator',
    targets: [autonomousOperator.selectedAction?.id ?? 'owner-loop-safe-actions'],
    reason: operatorPlanPublished
      ? 'One-action operator plan is already published; avoid cycling on meta-operator refreshes.'
      : 'Publishes the one-action local execution plan with allowlist, zero-spend, and audit controls.',
  },
  {
    id: 'review-operator-history',
    status: operatorHistoryPublished ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:operator',
    targets: [autonomousOperatorHistory.summary?.lastActionId ?? 'operator-history'],
    reason: operatorHistoryPublished
      ? 'Operator history is already capped and published; keep attention on product evidence.'
      : 'Refreshes the capped operator history so safe actions remain auditable over time.',
  },
  {
    id: 'refresh-objective-audit',
    status: objectiveAuditFresh && !needsInitialOperatorExecution ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:objective-audit',
    targets: ['objective-evidence', 'production-blockers'],
    reason: needsInitialOperatorExecution
      ? 'Seeds the operator audit trail with one harmless objective-audit refresh before final verification.'
      : objectiveAuditFresh
        ? 'Objective audit already covers the current upstream evidence; keep it monitored while product and data actions run.'
        : 'Keeps the original objective mapped to current evidence and prevents false completion claims.',
  },
  {
    id: 'optimize-store-listing',
    status:
      storePackageFreshness.current && storeListingOptimizerFreshness.current && storeComplianceFreshness.current
        ? 'monitor'
        : storeListingOptimizer.status === 'store-listing-optimizer-ready'
          ? 'armed'
          : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:store-package && npm run autonomous:store-listing-optimize && npm run autonomous:store-compliance',
    targets: [storeListingOptimizer.recommendation?.focusGameId ?? storePackage.launchCandidate?.id ?? 'store-listing'],
    reason:
      storePackageFreshness.current && storeListingOptimizerFreshness.current && storeComplianceFreshness.current
        ? 'Store package, listing copy, screenshot priority, and compliance drafts already match current growth, support, monetization, and store evidence.'
        : 'Refreshes the base store package, optimized copy, screenshot priority, and compliance drafts from behavior signals.',
  },
  {
    id: 'prepare-android-signing',
    status: androidSigning.status === 'signing-prepared' ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:android-signing',
    targets: ['android-twa-signing', androidSigning.localFiles?.keystorePath ?? 'ops/android/signing/release.keystore'],
    reason: 'Prepares local Android signing material and public fingerprint without committing secrets or paying store fees.',
  },
  {
    id: 'apply-safe-improvements',
    status: appliedImprovementsFreshness.current
      ? 'monitor'
      : releaseHealth.controls?.canApplyExperimentChanges
        ? 'armed'
        : 'held',
    costUsd: 0,
    command: 'npm run autonomous:experiments && npm run autonomous:improve && npm run autonomous:sync-experiments',
    reason: appliedImprovementsFreshness.current
      ? 'Applied improvements already reflect the current analytics, experiment, and backlog evidence.'
      : releaseHealth.controls?.canApplyExperimentChanges
        ? 'Release health allows bounded improvement policy updates.'
        : 'Release health is holding experiment changes.',
  },
  {
    id: 'deploy-web-pwa',
    status:
      deployment.status === 'ready-for-pages' && productionResponse.controls?.deployAllowed && repositoryChannelReady
        ? 'ready-when-repository-pages-enabled'
        : repositoryChannelReady
          ? 'held'
          : 'blocked-needs-repository-channel',
    costUsd: 0,
    command: 'Run the Web PWA Deploy workflow after GitHub Pages is enabled for the repository.',
    reason: repositoryChannelReady
      ? (deployment.promotion?.nextAction ?? 'Static web deploy is the first no-cost distribution channel.')
      : 'Git/GitHub repository channel is not ready for workflow dispatch yet.',
  },
  {
    id: 'collect-live-events',
    status:
      liveAnalytics || gateSampleEvidenceReadyNow
        ? 'armed'
        : localEventCollectionNoEventCurrent
          ? 'monitor'
          : localEventBridgeReady
            ? 'armed'
            : 'blocked-needs-collector-or-posthog',
    costUsd: 0,
    command:
      'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan',
    targets: gateSampleCollectionTargets,
    reason:
      liveAnalytics || gateSampleEvidenceReadyNow
        ? 'Live/player event data is available for autonomous rollups, product-gate recovery, and sample-plan refresh.'
        : localEventCollectionNoEventCurrent
          ? 'Local event bridge, import, analytics, gate recovery, and sample plan already reflect the latest no-event collection.'
          : 'Keeps the zero-spend local event-drop bridge active and refreshes recovery/sample planning until production collector or PostHog credentials exist.',
  },
]

const guardrails = [
  {
    id: 'zero-paid-spend',
    enforced: unitEconomics.controls?.maxDailySpendUsd === 0,
    detail: `Max daily spend is $${(unitEconomics.controls?.maxDailySpendUsd ?? 0).toFixed(2)}.`,
  },
  {
    id: 'no-revenue-before-product-gates',
    enforced: monetization.revenueEnabled !== true,
    detail: `Monetization status is ${monetization.status}.`,
  },
  {
    id: 'no-store-fees-before-payback',
    enforced: unitEconomics.controls?.storeSpendAllowed !== true,
    detail: `Android release status is ${androidRelease.status}.`,
  },
  {
    id: 'no-retire-without-live-data',
    enforced: portfolioPolicy.guardrails?.noRetireWithoutLiveData === true,
    detail: `Portfolio analytics source is ${portfolioPolicy.analyticsSource}.`,
  },
]

const executableNow = safeAutonomousActions.filter((action) =>
  ['armed', 'ready-when-repository-pages-enabled'].includes(action.status),
)
const locallyExecutableNow = executableNow.filter((action) => action.status === 'armed')
const ownerSelectableNow = locallyExecutableNow.filter((action) => action.id !== 'run-daily-owner-loop')
const recentExecutionWindow = 8
const recentExecutedRecords = [...(autonomousOperatorHistory.records ?? [])]
  .reverse()
  .filter((record) => record.execution?.requested === true && record.execution?.status === 'executed')
const lastExecutedRecord = recentExecutedRecords[0]
const lastExecutedActionId =
  lastExecutedRecord?.selectedActionId ?? autonomousOperatorHistory.summary?.lastExecutedActionId ?? null
const recentExecutedActionIds = [
  ...new Set(recentExecutedRecords.map((record) => record.selectedActionId).filter(Boolean)),
].slice(0, recentExecutionWindow)
const compositeActionSatisfiedActionIds = {
  'seed-portfolio-traffic': ['refresh-organic-seed-loop'],
  'collect-gate-sample-downloads': [
    'collect-live-events',
    'refresh-product-gate-recovery',
    'refresh-product-gate-sample-plan',
  ],
  'collect-live-events': ['refresh-product-gate-recovery', 'refresh-product-gate-sample-plan'],
}
const recentlySatisfiedActionIds = [
  ...new Set(
    recentExecutedActionIds.flatMap((actionId) => compositeActionSatisfiedActionIds[actionId] ?? []),
  ),
]
const recentlyExecutedActionIds = new Set(recentExecutedActionIds)
const recentlyCoveredActionIds = new Set([...recentExecutedActionIds, ...recentlySatisfiedActionIds])
const executableWithoutImmediateRepeat = ownerSelectableNow.filter((action) => !recentlyCoveredActionIds.has(action.id))
const executableWithoutLastRepeat = ownerSelectableNow.filter((action) => action.id !== lastExecutedActionId)
const prioritizedExecutableNow =
  executableWithoutImmediateRepeat.length > 0
    ? executableWithoutImmediateRepeat
    : executableWithoutLastRepeat.length > 0
      ? executableWithoutLastRepeat
      : ownerSelectableNow
const preferredActionOrder = [
  'prepare-repository-channel',
  'deploy-web-pwa',
  'sync-post-deploy-artifact',
  'refresh-live-site-monitor',
  'seed-portfolio-traffic',
  'bootstrap-production-setup',
  'refresh-production-blocker-handoff',
  'run-production-unlock-runner',
  'activate-production-when-configured',
  'optimize-product-gates',
  'collect-gate-sample-downloads',
  'collect-live-events',
  'refresh-organic-seed-loop',
  'refresh-product-gate-sample-plan',
  'refresh-product-gate-recovery',
  'refresh-first-move-coach',
  'refresh-completion-loop',
  'refresh-replay-loop',
  'optimize-daily-retention',
  'measure-pwa-install-loop',
  'apply-safe-improvements',
  'optimize-store-listing',
  'refresh-autonomous-cadence',
  'refresh-autonomous-self-update',
  'refresh-objective-audit',
]
const holdForExternalInputAction = safeAutonomousActions.find((action) => action.id === 'hold-for-external-input')
const nextBestAction =
  preferredActionOrder
    .map((actionId) => prioritizedExecutableNow.find((action) => action.id === actionId))
    .find(Boolean) ??
  prioritizedExecutableNow[0] ??
  holdForExternalInputAction ??
  safeAutonomousActions[0]

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'owner-loop-ready',
  mode: ownerMode,
  autonomyScore: {
    readySystems: readySystems.length,
    totalSystems: systems.length,
    percent: Math.round((readySystems.length / systems.length) * 100),
  },
  controls: {
    localLoopCanRunWithoutExternalAccounts: true,
    externalAccountInterventionRequired: credentialRequiredActions.length > 0,
    configuredRequiredEnv: configuredCount(productionEnvironment.requiredEnv),
    totalRequiredEnv: productionEnvironment.requiredEnv?.length ?? 0,
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    paidAcquisitionAllowed: unitEconomics.controls?.paidAcquisitionAllowed === true,
    storeSpendAllowed: unitEconomics.controls?.storeSpendAllowed === true,
    revenueEnabled: monetization.revenueEnabled === true,
    deployAllowed: productionResponse.controls?.deployAllowed === true,
    rollbackRequired: productionResponse.controls?.rollbackRequired === true,
    repositoryHandoffPrepared,
    localActionAvailable: ownerSelectableNow.length > 0,
    heldForExternalInput: ownerSelectableNow.length === 0,
  },
  ownerDecision: {
    nextBestActionId: nextBestAction.id,
    nextBestAction: nextBestAction.command,
    canExecuteWithoutSpend: nextBestAction.costUsd === 0,
    localActionAvailable: ownerSelectableNow.length > 0,
    holdReason:
      ownerSelectableNow.length === 0
        ? 'All safe local actions are current; remaining progress requires external inputs or new player evidence.'
        : null,
    rationale: nextBestAction.reason,
  },
  executionMemory: {
    avoidImmediateRepeat: true,
    recentExecutionWindow,
    recentExecutedActionIds,
    lastExecutedActionId,
    lastExecutedStatus: lastExecutedRecord?.execution?.status ?? null,
    lastRecordExecutionStatus: autonomousOperatorHistory.summary?.lastExecutionStatus ?? null,
    recentlySatisfiedActionIds,
    objectiveAuditFreshness: {
      fresh: objectiveAuditFresh,
      structurallyReady: objectiveAuditStructurallyReady,
      auditGeneratedAt: objectiveAudit.generatedAt ?? null,
      evaluatedInputIds: objectiveAuditFreshnessInputs.map((artifact) => artifact.id),
      staleInputIds: objectiveAuditStaleInputs.map((artifact) => artifact.id),
    },
    operationalEvidenceFreshness: {
      cadence: cadenceOperationalFreshness,
      selfUpdate: selfUpdateOperationalFreshness,
      supportFeedback: supportFeedbackOperationalFreshness,
      performance: performanceOperationalFreshness,
      liveSiteMonitor: liveSiteMonitorOperationalFreshness,
    },
    sourceFreshness: {
      productOptimization: productOptimizationFreshness,
      retentionLoop: retentionLoopFreshness,
      trafficSeeding: trafficSeedingFreshness,
      acquisitionLearning: acquisitionLearningFreshness,
      organicSeedLoop: organicSeedLoopFreshness,
      pwaInstallLoop: pwaInstallFreshness,
      productGateRecovery: productGateRecoveryFreshness,
      productGateSamplePlan: productGateSamplePlanFreshness,
      storePackage: storePackageFreshness,
      storeListingOptimizer: storeListingOptimizerFreshness,
      storeCompliance: storeComplianceFreshness,
      firstMoveCoach: firstMoveCoachFreshness,
      completionLoop: completionLoopFreshness,
      replayLoop: replayLoopFreshness,
      appliedImprovements: appliedImprovementsFreshness,
    },
    gateSampleDownloadsBackoff: {
      enabled: true,
      cooldownHours: gateSampleDownloadsBackoffHours,
      coolingDown: gateSampleDownloadsScanCoolingDown,
      lastExplicitScanAt: Number.isFinite(explicitDownloadsScanAt)
        ? localEventBridge.explicitDownloadsScan?.scannedAt
        : null,
      lastExplicitScanStatus: localEventBridge.explicitDownloadsScan?.status ?? null,
      evidenceReadyNow: gateSampleEvidenceReadyNow,
    },
    productGateSamplePlanRefreshPolicy: {
      recoveryCurrent: productGateRecoveryFreshness.current,
      samplePlanNeedsRefresh: productGateSamplePlanNeedsRefresh,
      cooldownOnlyStale: productGateSamplePlanCooldownOnlyStale,
      materialRefreshNeeded: productGateSamplePlanMaterialRefreshNeeded,
      sampleDateCurrent: productGateSamplePlanSampleDateCurrent,
      freshAfterLastDownloadsScan: productGateSamplePlanFreshAfterDownloadsScan,
      staleInputIds: productGateSamplePlanStaleInputIds,
    },
    localEventCollectionFreshness: {
      current: localEventCollectionNoEventCurrent,
      ready: localEventBridgeReady,
      status: localEventBridge.status,
      bridgeGeneratedAt: localEventBridge.generatedAt ?? null,
      analyticsSource,
      evidenceReadyNow: gateSampleEvidenceReadyNow,
      evaluatedInputIds: ['local-event-bridge', ...localEventCollectionFreshnessInputs.map((artifact) => artifact.id)],
      staleInputIds: localEventCollectionStaleInputs.map((artifact) => artifact.id),
    },
    liveDeployEvidence: {
      localSmokeFresh: postDeploySmokeRunnerReady,
      strictArtifactSyncFresh: postDeployArtifactSyncReady,
      liveSiteMonitorFresh: liveSiteMonitorOperationalFreshness.fresh,
      smokeActionFresh: postDeploySmokeActionFresh,
      releaseCandidateActionFresh,
      liveCandidateId: postDeployArtifactSync.live?.candidateId ?? null,
      artifactCandidateId: postDeployArtifactSync.artifact?.target?.candidateId ?? null,
    },
    skippedRecentlyExecutedActionIds: locallyExecutableNow
      .filter((action) => recentlyExecutedActionIds.has(action.id) && action.id !== nextBestAction.id)
      .map((action) => action.id),
    skippedRecentlySatisfiedActionIds: locallyExecutableNow
      .filter((action) => recentlySatisfiedActionIds.includes(action.id) && action.id !== nextBestAction.id)
      .map((action) => action.id),
    preferredActionOrder,
    repositoryHandoff: {
      prepared: repositoryHandoffPrepared,
      targetPlanReady: repositoryTargetPlanReady,
      plannedTarget: repositoryTargetPlan?.plannedTarget ?? null,
      status: repositoryHandoffPrepared
        ? 'external-owner-or-auth-required'
        : repositoryChannelReady
          ? 'repository-channel-ready'
          : 'needs-local-repository-handoff',
    },
    productionBootstrapFreshness: {
      fresh: productionBootstrapFresh,
      bootstrapGeneratedAt: productionBootstrap.generatedAt ?? null,
      artifactSourceDataHash: productionBootstrap.sourceDataHash ?? null,
      sourceDataHash: currentProductionBootstrapSourceDataHash,
      evaluatedInputIds: productionBootstrapFreshnessInputs.map((artifact) => artifact.id),
      staleInputIds: productionBootstrapStaleInputs.map((artifact) => artifact.id),
    },
    productionBlockerHandoffFreshness: {
      current: productionBlockerHandoffCurrent,
      ready: productionBlockerHandoffReady,
      status: productionBlockerHandoff.status,
      generatedAt: productionBlockerHandoff.generatedAt ?? null,
      nextBestUnlockId: productionBlockerHandoff.summary?.nextBestUnlockId ?? null,
      ownerActionRequired: productionBlockerHandoff.summary?.ownerActionRequired ?? 0,
      missingEnv: productionBlockerHandoff.summary?.missingEnv ?? 0,
      missingSecrets: productionBlockerHandoff.summary?.missingSecrets ?? 0,
      sourceStatusesFresh: productionBlockerHandoffSourceFresh,
      evaluatedSourceStatuses: [
        'production-environment',
        'production-bootstrap',
        'objective-audit',
        'monetization-plan',
        'store-compliance',
        'android-release',
        'ios-release',
        'unit-economics',
        'post-deploy-artifact-sync',
      ],
    },
  },
  systems,
  safeAutonomousActions,
  credentialRequiredActions,
  blockedExternalActions,
  guardrails,
  evidence: {
    analyticsSource,
    localEventBridgeStatus: localEventBridge.status,
    dailyChallenge: portfolioPolicy.dailyChallenge,
    trafficSeedingStatus: traffic.status,
    acquisitionLearningStatus: acquisition.status,
    organicSeedLoopStatus: organicSeedLoop.status,
    retentionLoopStatus: retention.status,
    pwaInstallLoopStatus: pwaInstall.status,
    autonomousCadenceStatus: autonomousCadence.status,
    autonomousSelfUpdateStatus: autonomousSelfUpdate.status,
    performanceBudgetStatus: performanceBudget.status,
    repositoryReadinessStatus: repositoryReadiness.status,
    repositoryBootstrapStatus: repositoryBootstrap.status,
    repositoryHandoffPrepared,
    releaseCandidateStatus: releaseCandidate.status,
    postDeploySmokeStatus: postDeploySmoke.status,
    postDeployArtifactSyncStatus: postDeployArtifactSync.status,
    liveSiteMonitorStatus: liveSiteMonitor.status,
    productOptimizationStatus: productOptimization.status,
    productGateSamplePlanStatus: productGateSamplePlan.status,
    firstMoveCoachStatus: firstMoveCoach.status,
    completionLoopStatus: completionLoop.status,
    replayLoopStatus: replayLoop.status,
    productionBootstrapStatus: productionBootstrap.status,
    productionActivationStatus: productionActivation.status,
    productionBlockerHandoffStatus: productionBlockerHandoff.status,
    productionUnlockRunnerStatus: productionUnlockRunner.status,
    supportChannelStatus: supportChannel.status,
    supportFeedbackStatus: supportFeedback.status,
    autonomousOperatorStatus: autonomousOperator.status,
    autonomousOperatorHistoryStatus: autonomousOperatorHistory.status,
    objectiveAuditStatus: objectiveAudit.status,
    storeListingOptimizerStatus: storeListingOptimizer.status,
    deploymentStatus: deployment.status,
    releaseHealthStatus: releaseHealth.status,
    productionEnvironmentStatus: productionEnvironment.status,
    storePackageStatus: storePackage.status,
    storeComplianceStatus: storeCompliance.status,
    androidSigningStatus: androidSigning.status,
    iosReleaseStatus: iosRelease.status,
    supportEmailStatus: storePackage.supportPage?.supportEmailStatus,
  },
  commands: {
    operate: 'npm run autonomous:operate',
    cadence: 'npm run autonomous:cadence',
    selfUpdate: 'npm run autonomous:self-update',
    daily: 'npm run autonomous:daily',
    verify: 'npm run test:automation',
    fullGate: 'npm run autonomous:operate && npm run autonomous:assert-deployable',
  },
}

const appPayload = {
  status: payload.status,
  mode: payload.mode,
  autonomyScore: {
    percent: payload.autonomyScore.percent,
  },
  controls: {
    externalAccountInterventionRequired: payload.controls.externalAccountInterventionRequired,
  },
  ownerDecision: {
    nextBestActionId: payload.ownerDecision.nextBestActionId,
  },
}

const report = [
  '# Autonomous Owner Loop',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  `Autonomy score: ${payload.autonomyScore.readySystems}/${payload.autonomyScore.totalSystems} (${payload.autonomyScore.percent}%)`,
  '',
  '## Owner Decision',
  '',
  `- Next action: ${payload.ownerDecision.nextBestActionId}`,
  `- Command: ${payload.ownerDecision.nextBestAction}`,
  `- Rationale: ${payload.ownerDecision.rationale}`,
  `- Last executed action: ${payload.executionMemory.lastExecutedActionId ?? 'none'}`,
  `- Recent executed actions: ${
    payload.executionMemory.recentExecutedActionIds.length
      ? payload.executionMemory.recentExecutedActionIds.join(', ')
      : 'none'
  }`,
  '',
  '## Systems',
  '',
  ...payload.systems.map((system) => `- ${system.status}: ${system.id} - ${system.evidence}`),
  '',
  '## Safe Autonomous Actions',
  '',
  ...payload.safeAutonomousActions.map(
    (action) => `- ${action.status}: ${action.id} - ${action.command}`,
  ),
  '',
  '## Credential Required Actions',
  '',
  ...(payload.credentialRequiredActions.length
    ? payload.credentialRequiredActions.map((action) => `- ${action.target}: ${action.purpose}`)
    : ['- none']),
  '',
  '## Guardrails',
  '',
  ...payload.guardrails.map((guardrail) => `- ${guardrail.enforced ? 'enforced' : 'open'}: ${guardrail.id} - ${guardrail.detail}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const autonomousOwnerLoop = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type AutonomousOwnerLoop = typeof autonomousOwnerLoop\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
