import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { productionBootstrapSourceDataHash } from './lib/production-bootstrap-source.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'objective-audit.json')
const outputTsPath = path.join(root, 'src', 'data', 'objectiveAudit.ts')
const reportPath = path.join(root, 'reports', 'objective-audit-latest.md')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const run = (command, args) =>
  new Promise((resolve) => {
    execFile(command, args, { cwd: root, timeout: 5_000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
      })
    })
  })

const [
  packageJson,
  trendSourceReadiness,
  concepts,
  playable,
  generatedPlayable,
  analytics,
  eventCollectorSmoke,
  localEventBridge,
  eventIngestSmoke,
  productOptimization,
  productGateRecovery,
  productGateSamplePlan,
  firstMoveCoach,
  completionLoop,
  replayLoop,
  retentionLoop,
  organicSeedLoop,
  experimentResults,
  appliedImprovements,
  improvementBacklog,
  improvementBacklogSummary,
  readiness,
  promotion,
  monetization,
  unitEconomics,
  storePackage,
  supportChannel,
  supportFeedback,
  storeAssets,
  storeCompliance,
  storeReadiness,
  nativePackage,
  androidSigning,
  androidRelease,
  iosRelease,
  releaseCandidate,
  postDeploySmoke,
  postDeployArtifactSync,
  liveSiteMonitor,
  repositoryReadiness,
  repositoryBootstrap,
  deployment,
  productionBootstrap,
  productionUnlockRunner,
  eventCollectorDeployment,
  autonomousOwnerLoop,
  autonomousOperator,
  autonomousOperatorHistory,
  autonomousCadence,
  autonomousSelfUpdate,
  environment,
] = await Promise.all([
  readJson(path.join(root, 'package.json')),
  readJson(path.join(dataDir, 'trend-source-readiness.json')),
  readJson(path.join(dataDir, 'generated-concepts.json')),
  readJson(path.join(dataDir, 'playable-games.json')),
  readJson(path.join(dataDir, 'generated-playable-games.json')),
  readJson(path.join(dataDir, 'analytics-rollup.json')),
  readJson(path.join(dataDir, 'event-collector-smoke.json')),
  readJson(path.join(dataDir, 'local-event-bridge.json')),
  readJson(path.join(dataDir, 'event-ingest-smoke.json')),
  readJson(path.join(dataDir, 'product-optimization.json')),
  readJson(path.join(dataDir, 'product-gate-recovery.json')),
  readJson(path.join(dataDir, 'product-gate-sample-plan.json')),
  readJson(path.join(dataDir, 'first-move-coach.json')),
  readJson(path.join(dataDir, 'completion-loop.json')),
  readJson(path.join(dataDir, 'replay-loop.json')),
  readJson(path.join(dataDir, 'retention-loop.json')),
  readJson(path.join(dataDir, 'organic-seed-loop.json')),
  readJson(path.join(dataDir, 'experiment-results.json')),
  readJson(path.join(dataDir, 'applied-improvements.json')),
  readJson(path.join(dataDir, 'improvement-backlog.json')),
  readJson(path.join(dataDir, 'improvement-backlog-summary.json')),
  readJson(path.join(dataDir, 'production-readiness.json')),
  readJson(path.join(dataDir, 'promotion-decision.json')),
  readJson(path.join(dataDir, 'monetization-plan.json')),
  readJson(path.join(dataDir, 'unit-economics.json')),
  readJson(path.join(dataDir, 'store-package.json')),
  readJson(path.join(dataDir, 'support-channel.json')),
  readJson(path.join(dataDir, 'support-feedback.json')),
  readJson(path.join(dataDir, 'store-assets.json')),
  readJson(path.join(dataDir, 'store-compliance.json')),
  readJson(path.join(dataDir, 'store-readiness.json')),
  readJson(path.join(dataDir, 'native-package.json')),
  readJson(path.join(dataDir, 'android-signing.json')),
  readJson(path.join(dataDir, 'android-release.json')),
  readJson(path.join(dataDir, 'ios-release.json')),
  readJson(path.join(dataDir, 'release-candidate.json')),
  readJson(path.join(dataDir, 'post-deploy-smoke.json')),
  readJson(path.join(dataDir, 'post-deploy-artifact-sync.json')),
  readJson(path.join(dataDir, 'live-site-monitor.json')),
  readJson(path.join(dataDir, 'repository-readiness.json')),
  readJson(path.join(dataDir, 'repository-bootstrap.json')),
  readJson(path.join(dataDir, 'deployment-plan.json')),
  readJson(path.join(dataDir, 'production-bootstrap.json')),
  readJson(path.join(dataDir, 'production-unlock-runner.json')),
  readJson(path.join(dataDir, 'event-collector-deployment.json')),
  readJson(path.join(dataDir, 'autonomous-owner-loop.json')),
  readJson(path.join(dataDir, 'autonomous-operator.json')),
  readJson(path.join(dataDir, 'autonomous-operator-history.json')),
  readJson(path.join(dataDir, 'autonomous-cadence.json')),
  readJson(path.join(dataDir, 'autonomous-self-update.json')),
  readJson(path.join(dataDir, 'production-environment.json')),
])

const distManifestExists = await exists(path.join(root, 'dist', 'manifest.webmanifest'))
const distServiceWorkerExists = await exists(path.join(root, 'dist', 'sw.js'))
const gitStatusResult = await run('git', ['status', '--short', '--untracked-files=all'])
const parseGitStatusPath = (line) => {
  const rawPath = line.slice(3).trim()
  const renameTarget = rawPath.split(' -> ').at(-1)?.trim()

  return renameTarget || rawPath
}
const generatedEvidenceWorktreePaths = [
  /^data\/[^/]+\.json$/,
  /^reports\/[^/]+\.md$/,
  /^src\/data\/[^/]+\.ts$/,
  /^public\/(?:analytics-unlock|measurement-status|owner-unlock-brief|owner-unlock-preflight|product-gate-recovery|store-readiness|sample-next|sample-fastest|monetization)\.(?:html|json)$/,
  /^public\/(?:compliance|share-manifest|monetization|sample-next|sample-fastest|seed-next)\.json$/,
  /^public\/(?:gate-sample|seed-kit|seed-next|privacy|support|install|monetization|store-readiness|analytics-unlock|measurement-status|product-gate-recovery)\.html$/,
  /^public\/(?:app-ads\.txt|robots\.txt|sitemap\.xml)$/,
  /^public\/(?:icons|store-assets|games|\.well-known)\//,
  /^ops\/(?:production\.env\.example|codex\/[^/]+\.json|github\/(?:README\.md|setup-production\.sh|bootstrap-repository\.sh))$/,
  /^native\/(?:android|ios)\//,
]
const isGeneratedEvidencePath = (filePath) =>
  generatedEvidenceWorktreePaths.some((pattern) => pattern.test(filePath))
const currentWorktreeDirtyPaths = gitStatusResult.ok
  ? gitStatusResult.stdout.split('\n').filter(Boolean).map(parseGitStatusPath)
  : []
const currentGeneratedEvidenceDirtyFiles = gitStatusResult.ok
  ? currentWorktreeDirtyPaths.filter(isGeneratedEvidencePath).length
  : null
const currentNonGeneratedWorktreeDirtyFiles = gitStatusResult.ok
  ? currentWorktreeDirtyPaths.filter((filePath) => !isGeneratedEvidencePath(filePath)).length
  : null
const currentWorktreeDirtyFiles = gitStatusResult.ok ? currentWorktreeDirtyPaths.length : null
const currentWorktreeClean = currentNonGeneratedWorktreeDirtyFiles === 0
const generatedAtMs = (artifact) => {
  const value = Date.parse(artifact?.generatedAt ?? '')
  return Number.isFinite(value) ? value : null
}
const webDecision = promotion.decisions?.find((decision) => decision.channel === 'web-pwa')
const monetizationDecision = promotion.decisions?.find((decision) => decision.channel === 'monetization')
const androidDecision = promotion.decisions?.find((decision) => decision.channel === 'android-google-play')
const iosDecision = promotion.decisions?.find((decision) => decision.channel === 'ios-app-store')
const storeOwnerNextUnlockId = storeReadiness.storeOwnerUnlockSummary?.nextUnlockId ?? null
const storeOwnerNextUnlock =
  storeReadiness.storeOwnerUnlocks?.find((unlock) => unlock.id === storeOwnerNextUnlockId) ?? null
const storeDistributionNextAction =
  storeOwnerNextUnlock?.id === 'support-contact'
    ? `Set AGL_SUPPORT_EMAIL with ${storeReadiness.supportOwnerInputPack?.commands?.setupWriteLocalEnvTemplate ?? 'the support-contact input template'} before paid store accounts or submissions.`
    : storeOwnerNextUnlock
      ? `Resolve ${storeOwnerNextUnlock.title} when its zero-spend and product-gate controls allow it.`
      : (androidDecision?.nextAction ?? 'Keep native releases blocked until host, signing, account, and payback gates pass.')
const acceptedConcepts = concepts.concepts?.filter((concept) => concept.status === 'candidate') ?? []
const lowRiskConcepts = acceptedConcepts.filter(
  (concept) => concept.sourceDistance?.copiedExpressionRisk === 'low',
)
const lowRiskGeneratedGames =
  generatedPlayable.games?.filter((game) => game.sourceDistance?.copiedExpressionRisk === 'low') ?? []
const liveAnalytics = ['posthog', 'local-event-drops'].includes(analytics.sourceStatus?.activeSource)
const localEventBridgeReady =
  ['bridge-ready-for-ingest', 'bridge-local-events-active', 'bridge-waiting-for-export'].includes(
    localEventBridge.status,
  ) && localEventBridge.controls?.noSyntheticEvents === true
const rawObjectiveBlockers = [
  ...new Set([
    ...(repositoryReadiness.blockers ?? []),
    ...(repositoryBootstrap.blockers ?? []),
    ...(environment.blockers ?? []),
    ...(monetization.blockers ?? []),
    ...(storeCompliance.blockers ?? []),
    ...(androidRelease.blockers ?? []),
    ...(iosRelease.blockers ?? []),
    ...(productionBootstrap.externalBlockers ?? []).map((item) => item.blocker),
  ]),
]
const transientLocalStateBlockers = [/^Commit current generated changes before pushing to GitHub Pages\.$/]
const filterTransientLocalStateBlockers = (blockers) =>
  blockers.filter((blocker) => !transientLocalStateBlockers.some((pattern) => pattern.test(blocker)))
const objectiveBlockers = rawObjectiveBlockers.filter(
  (blocker) => !transientLocalStateBlockers.some((pattern) => pattern.test(blocker)),
)
const postDeploySmokeReady =
  ['blocked-missing-origin', 'post-deploy-smoke-passed', 'post-deploy-smoke-observed-live'].includes(
    postDeploySmoke.status,
  ) &&
  postDeploySmoke.localArtifactSmoke?.status === 'predeploy-artifact-smoke-passed' &&
  postDeploySmoke.localArtifactSmoke?.summary?.passed === postDeploySmoke.localArtifactSmoke?.summary?.planned &&
  postDeploySmoke.localArtifactSmoke?.summary?.failed === 0 &&
  postDeploySmoke.target?.candidateId === releaseCandidate.candidateId &&
  postDeploySmoke.target?.aggregateHash === releaseCandidate.integrity?.aggregateHash &&
  postDeploySmoke.controls?.zeroPaidSpend === true &&
  postDeploySmoke.controls?.readOnlyHttpChecks === true &&
  postDeploySmoke.controls?.localArtifactSmokeRequired === true &&
  postDeploySmoke.controls?.manifestHashComparisonRequired === true
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
  liveSiteMonitor.summary?.failed === 0 &&
  liveSiteMonitor.summary?.passed === liveSiteMonitor.summary?.planned &&
  liveSiteMonitor.summary?.liveMatchesSyncedDeploy === true &&
  liveSiteMonitor.controls?.readOnlyHttpChecks === true &&
  liveSiteMonitor.controls?.strictSyncedManifestComparison === true
const productionBootstrapFreshnessInputs = [
  { id: 'release-candidate', generatedAt: releaseCandidate.generatedAt },
  { id: 'deployment-plan', generatedAt: deployment.generatedAt },
  { id: 'repository-readiness', generatedAt: repositoryReadiness.generatedAt },
  { id: 'repository-bootstrap', generatedAt: repositoryBootstrap.generatedAt },
  { id: 'production-environment', generatedAt: environment.generatedAt },
  { id: 'event-collector-deployment', generatedAt: eventCollectorDeployment.generatedAt },
]
const currentProductionBootstrapSourceDataHash = productionBootstrapSourceDataHash({
  releaseCandidate,
  deployment,
  repositoryReadiness,
  repositoryBootstrap,
  productionEnvironment: environment,
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
const productionBootstrapTimestampStaleInputIds = productionBootstrapFreshnessInputs
  .filter((artifact) => {
    const artifactGeneratedAtMs = generatedAtMs(artifact)

    return (
      typeof artifactGeneratedAtMs === 'number' &&
      (typeof productionBootstrapGeneratedAtMs !== 'number' ||
        artifactGeneratedAtMs > productionBootstrapGeneratedAtMs)
    )
  })
  .map((artifact) => artifact.id)
const productionBootstrapStaleInputIds = productionBootstrapSourceCurrent ? [] : productionBootstrapTimestampStaleInputIds
const productionBootstrapFresh =
  productionBootstrap.status === 'production-bootstrap-ready' &&
  productionBootstrap.controls?.zeroSpendGuard === true &&
  productionBootstrap.controls?.noPaidResourcesCreated === true &&
  productionBootstrapSourceCurrent
const productionUnlockRunnerReady =
  ['unlock-runner-idle', 'unlock-runner-plan-ready', 'unlock-runner-executed'].includes(productionUnlockRunner.status) &&
  productionUnlockRunner.controls?.zeroPaidSpend === true &&
  productionUnlockRunner.controls?.noAccountCreation === true &&
  productionUnlockRunner.controls?.noStoreSubmission === true &&
  productionUnlockRunner.controls?.noRevenueEnablement === true &&
  productionUnlockRunner.controls?.staticCommandAllowlist === true &&
  (productionUnlockRunner.summary?.blockedUnsafeUnlocks ?? 0) === 0
const repositoryChannelReady = ['repository-channel-ready', 'waiting-for-gh-auth'].includes(
  repositoryReadiness.status,
)
const autonomousOperatorHeldWithoutEligibleAction =
  autonomousOperator.status === 'operator-held' &&
  (autonomousOperator.eligibleActionIds?.length ?? 0) === 0 &&
  autonomousOperator.selectedAction === null &&
  autonomousOperator.execution?.status === 'not-requested'
const autonomousOperatorReady =
  ['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status) ||
  autonomousOperatorHeldWithoutEligibleAction
const autonomousOperatorHistoryReady =
  autonomousOperatorHistory.status === 'operator-history-ready' &&
  (autonomousOperatorHistory.summary?.totalRecords ?? 0) >= 1 &&
  autonomousOperatorHistory.controls?.historyIsCapped === true

const requirement = ({
  id,
  status,
  summary,
  evidence,
  blockers = [],
  nextAction,
  completionCritical = true,
}) => ({
  id,
  status,
  summary,
  evidence,
  blockers,
  nextAction,
  completionCritical,
})

const requirements = [
  requirement({
    id: 'web-pwa-game-portal',
    status:
      readiness.webPwa?.status === 'ready-after-build' && distManifestExists && distServiceWorkerExists
        ? 'met'
        : 'incomplete',
    summary: 'A playable web/PWA portal exists and passes the production web readiness gate.',
    evidence: [
      `Web readiness: ${readiness.webPwa?.status ?? 'missing'}`,
      `Manifest in dist: ${distManifestExists}`,
      `Service worker in dist: ${distServiceWorkerExists}`,
      `Release candidate: ${releaseCandidate.status}; ${releaseCandidate.summary?.totalFiles ?? 0} files`,
      `Deployment plan: ${deployment.status}`,
    ],
    blockers:
      readiness.webPwa?.status === 'ready-after-build'
        ? []
        : readiness.webPwa?.checks?.filter((check) => check.status !== 'pass').map((check) => check.detail) ?? [],
    nextAction: webDecision?.nextAction ?? 'Keep the PWA release gate green.',
  }),
  requirement({
    id: 'original-trend-driven-game-generation',
    status:
      ['live-licensed', 'cached-licensed', 'live-public', 'cached-public', 'fixture-safe'].includes(
        trendSourceReadiness.status,
      ) &&
      acceptedConcepts.length >= 2 &&
      acceptedConcepts.length === lowRiskConcepts.length &&
      generatedPlayable.status === 'generated-runtime-ready' &&
      (playable.games?.length ?? 0) >= 10 &&
      lowRiskGeneratedGames.length === (generatedPlayable.games?.length ?? 0)
        ? 'met'
        : 'incomplete',
    summary: 'Trend signals produce original, low-IP-risk concepts and generated playable games.',
    evidence: [
      `Trend source: ${trendSourceReadiness.status}`,
      `Candidate concepts: ${acceptedConcepts.length}`,
      `Low-risk concepts: ${lowRiskConcepts.length}`,
      `Playable games: ${playable.games?.length ?? 0}`,
      `Generated games: ${generatedPlayable.games?.length ?? 0}`,
    ],
    blockers:
      acceptedConcepts.length !== lowRiskConcepts.length
        ? ['At least one accepted concept is not low IP-risk.']
        : [],
    nextAction: 'Keep licensed, public feed, cache, or fixture trend inputs feeding original concept generation.',
  }),
  requirement({
    id: 'behavior-measurement-loop',
    status:
      analytics.sourceStatus?.activeSource &&
      eventCollectorSmoke.status === 'pass' &&
      localEventBridgeReady &&
      eventIngestSmoke.status === 'pass' &&
      readiness.webPwa?.checks?.some((check) => check.id === 'privacy-control' && check.status === 'pass')
        ? liveAnalytics
          ? 'met-live'
          : 'met-fixture-or-local'
        : 'incomplete',
    summary: 'Gameplay, retention, install, acquisition, and privacy telemetry can be measured and rolled up.',
    evidence: [
      `Analytics source: ${analytics.sourceStatus?.activeSource ?? 'missing'}`,
      `Collector smoke: ${eventCollectorSmoke.status}`,
      `Local event bridge: ${localEventBridge.status}; inbox events ${
        localEventBridge.inbox?.validEvents ?? 0
      }; imported events ${localEventBridge.imported?.events ?? 0}`,
      `Ingest smoke: ${eventIngestSmoke.status}`,
      `Game starts in rollup: ${analytics.totals?.counts?.game_started ?? 0}`,
      `D1 retention: ${analytics.totals?.metrics?.d1Retention ?? 'missing'}`,
    ],
    blockers: liveAnalytics
      ? []
      : [
          'Production analytics still need PostHog or first-party collector credentials for live player data; local browser event drops are bridged meanwhile.',
        ],
    nextAction: liveAnalytics
      ? 'Keep importing live events before each rollup.'
      : 'Connect the first-party collector or PostHog when production credentials exist.',
  }),
  requirement({
    id: 'data-driven-improvement-loop',
    status:
      productOptimization.status === 'product-optimization-ready' &&
      productGateRecovery.status === 'product-gate-recovery-ready' &&
      productGateSamplePlan.status === 'product-gate-sample-plan-ready' &&
      firstMoveCoach.status === 'first-move-coach-ready' &&
      completionLoop.status === 'completion-loop-ready' &&
      replayLoop.status === 'replay-loop-ready' &&
      retentionLoop.status === 'retention-loop-ready' &&
      organicSeedLoop.status === 'organic-seed-loop-ready' &&
      experimentResults.status === 'evaluated' &&
      Array.isArray(improvementBacklog) &&
      improvementBacklogSummary.status === 'improvement-backlog-ready' &&
      improvementBacklogSummary.backlogCount === improvementBacklog.length &&
      ['support-feedback-ready', 'support-feedback-empty', 'support-feedback-planned'].includes(supportFeedback.status) &&
      supportFeedback.controls?.readOnlyGithubIssueList === true &&
      supportFeedback.controls?.noRawAnalyticsStored === true &&
      supportFeedback.controls?.aggregateEvidenceNeverMarksProductGatePass === true &&
      Array.isArray(appliedImprovements.actions) &&
      autonomousOperatorReady
        ? 'met'
        : 'incomplete',
    summary: 'Analytics drive product-gate optimization, experiment evaluation, backlog routing, and one safe local operator action.',
    evidence: [
      `Product optimizer: ${productOptimization.status}`,
      `Gate recovery: ${productGateRecovery.status}; primary ${
        productGateRecovery.summary?.primaryBottleneck ?? 'missing'
      }; experiment ${productGateRecovery.summary?.primaryExperimentStatus ?? 'missing'}; needed lift ${
        productGateRecovery.priorities?.[0]?.neededSuccesses ?? 'missing'
      }`,
      `Sample plan: ${productGateSamplePlan.status}; primary ${
        productGateSamplePlan.summary?.primaryGateId ?? 'missing'
      }; prompt views needed ${productGateSamplePlan.summary?.totalPromptViewsNeeded ?? 'missing'}`,
      `First-move coach: ${firstMoveCoach.status}; enabled targets ${
        firstMoveCoach.summary?.enabledTargets ?? 0
      }`,
      `Completion loop: ${completionLoop.status}; prompt ${
        completionLoop.promptPolicy?.status ?? 'missing'
      }; finish line ${completionLoop.finishLinePolicy?.status ?? 'missing'}`,
      `Replay loop: ${replayLoop.status}; prompt ${replayLoop.promptPolicy?.status ?? 'missing'}`,
      `Retention loop: ${retentionLoop.status}; return intent ${
        retentionLoop.returnIntentPolicy?.status ?? 'missing'
      }`,
      `Organic seed loop: ${organicSeedLoop.status}; target ${
        organicSeedLoop.target?.gameId ?? 'missing'
      }`,
      `Experiment results: ${experimentResults.status}`,
      `Backlog: ${improvementBacklogSummary.status}; items ${improvementBacklog.length}; hash ${
        improvementBacklogSummary.sourceDataHash ?? 'missing'
      }`,
      `Support feedback: ${supportFeedback.status}; issues ${
        supportFeedback.summary?.issuesInspected ?? 0
      }; routable signals ${supportFeedback.summary?.routableSignals ?? 0}; aggregate notes ${
        supportFeedback.summary?.aggregateEvidenceNotes ?? 0
      }`,
      `Applied/deferred actions: ${appliedImprovements.actions?.length ?? 0}`,
      `Operator selected: ${autonomousOperator.selectedAction?.id ?? 'none'}; status ${autonomousOperator.status}; execution ${autonomousOperator.execution?.status ?? 'missing'}`,
    ],
    blockers: [],
    nextAction: productOptimization.nextActions?.[0] ?? 'Keep applying only bounded changes from current evidence.',
  }),
  requirement({
    id: 'minimal-intervention-autonomy',
    status:
      autonomousOwnerLoop.status === 'owner-loop-ready' &&
      autonomousCadence.status === 'cadence-ready' &&
      autonomousSelfUpdate.status === 'self-update-ready' &&
      autonomousOperatorReady &&
      autonomousOperatorHistoryReady &&
      releaseCandidate.status === 'release-candidate-ready' &&
      postDeploySmokeReady &&
      postDeployArtifactSyncReady &&
      liveSiteMonitorReady &&
      repositoryChannelReady &&
      repositoryBootstrap.status !== 'missing' &&
      productionBootstrap.status === 'production-bootstrap-ready' &&
      productionUnlockRunnerReady &&
      packageJson.scripts?.['autonomous:daily']?.includes('autonomous:objective-audit') !== true
        ? 'needs-daily-audit-wiring'
      : autonomousOwnerLoop.status === 'owner-loop-ready' &&
          autonomousCadence.status === 'cadence-ready' &&
          autonomousSelfUpdate.status === 'self-update-ready' &&
          autonomousOperatorReady &&
          autonomousOperatorHistoryReady &&
          releaseCandidate.status === 'release-candidate-ready' &&
          postDeploySmokeReady &&
          postDeployArtifactSyncReady &&
          liveSiteMonitorReady &&
          !repositoryChannelReady &&
          repositoryBootstrap.status !== 'missing' &&
          productionBootstrap.status === 'production-bootstrap-ready' &&
          productionUnlockRunnerReady
        ? 'needs-repository-channel'
      : autonomousOwnerLoop.status === 'owner-loop-ready' &&
          autonomousCadence.status === 'cadence-ready' &&
          autonomousSelfUpdate.status === 'self-update-ready' &&
          autonomousOperatorReady &&
          autonomousOperatorHistoryReady &&
          releaseCandidate.status === 'release-candidate-ready' &&
          postDeploySmokeReady &&
          postDeployArtifactSyncReady &&
          liveSiteMonitorReady &&
          repositoryChannelReady &&
          repositoryBootstrap.status !== 'missing' &&
          productionBootstrap.status === 'production-bootstrap-ready' &&
          productionUnlockRunnerReady
        ? 'met-local'
        : 'incomplete',
    summary: 'A scheduled local loop, owner state, bootstrap handoff, and dry-run operator reduce manual maintenance.',
    evidence: [
      `Owner loop: ${autonomousOwnerLoop.status}`,
      `Autonomous cadence: ${autonomousCadence.status}; Codex ${
        autonomousCadence.schedulers?.codexDesktop?.status ?? 'missing'
      }; GitHub ${autonomousCadence.schedulers?.githubActions?.status ?? 'missing'}`,
      `Autonomous self-update: ${autonomousSelfUpdate.status}; workflow ${
        autonomousSelfUpdate.commitPlan?.workflow ?? 'missing'
      }; unsafe pending ${autonomousSelfUpdate.pendingChanges?.unsafeCount ?? 'missing'}`,
      `Operator: ${autonomousOperator.status}`,
      `Operator history: ${autonomousOperatorHistory.status}; records ${
        autonomousOperatorHistory.summary?.totalRecords ?? 0
      }; executed ${autonomousOperatorHistory.summary?.executedRecords ?? 0}`,
      `Bootstrap: ${productionBootstrap.status}`,
      `Unlock runner: ${productionUnlockRunner.status}; runnable ${
        productionUnlockRunner.summary?.runnableUnlocks ?? 0
      }; queued ${productionUnlockRunner.summary?.queuedCommands ?? 0}; unsafe ${
        productionUnlockRunner.summary?.blockedUnsafeUnlocks ?? 0
      }`,
      `Repository bootstrap: ${repositoryBootstrap.status}; helper ${
        repositoryBootstrap.helper?.path ?? 'missing'
      }`,
      `Release candidate: ${releaseCandidate.status}; smoke URLs ${
        releaseCandidate.summary?.postDeploySmokeUrls ?? 0
      }`,
      `Post-deploy smoke: ${postDeploySmoke.status}; origin ${
        postDeploySmoke.target?.origin ?? 'missing'
      }; checks ${postDeploySmoke.summary?.passed ?? 0}/${postDeploySmoke.summary?.planned ?? 0}; local artifact ${
        postDeploySmoke.localArtifactSmoke?.status ?? 'missing'
      } ${postDeploySmoke.localArtifactSmoke?.summary?.passed ?? 0}/${
        postDeploySmoke.localArtifactSmoke?.summary?.planned ?? 0}`,
      `Strict deploy artifact sync: ${postDeployArtifactSync.status}; run ${
        postDeployArtifactSync.workflow?.runId ?? 'missing'
      }; live matches artifact ${postDeployArtifactSync.live?.matchesArtifact === true}; candidate ${
        postDeployArtifactSync.artifact?.target?.candidateId ?? 'missing'
      }`,
      `Live site monitor: ${liveSiteMonitor.status}; checks ${
        liveSiteMonitor.summary?.passed ?? 0
      }/${liveSiteMonitor.summary?.planned ?? 0}; live matches synced deploy ${
        liveSiteMonitor.summary?.liveMatchesSyncedDeploy === true
      }`,
      `Repository channel: ${repositoryReadiness.status}; repository ${
        repositoryReadiness.repository?.target ?? 'missing'
      }; git worktree ${repositoryReadiness.workspace?.insideWorkTree === true}`,
      `Autonomy score: ${autonomousOwnerLoop.autonomyScore?.percent ?? 'missing'}%`,
      `Credential-gated actions: ${autonomousOwnerLoop.credentialRequiredActions?.length ?? 0}`,
    ],
    blockers: [
      ...(autonomousCadence.blockers ?? []),
      ...(autonomousSelfUpdate.blockers ?? []),
      ...(productionUnlockRunnerReady ? [] : ['Production unlock runner is not ready to apply configured blocker follow-ups.']),
      ...(postDeployArtifactSyncReady ? [] : ['Strict deploy artifact sync is not yet proven against the live release manifest.']),
      ...(liveSiteMonitorReady ? [] : ['Live site monitor is not yet proving the public PWA between deploys.']),
      ...filterTransientLocalStateBlockers(repositoryReadiness.blockers ?? []),
      ...filterTransientLocalStateBlockers(repositoryBootstrap.blockers ?? []),
      ...(autonomousOwnerLoop.credentialRequiredActions?.map((action) => `${action.target}: ${action.purpose}`) ?? []),
    ],
    nextAction: 'Keep the operator dry-run plan ready and execute one local action only when explicitly requested.',
  }),
  requirement({
    id: 'monetization-path',
    status: monetization.revenueEnabled ? 'met-enabled' : 'prepared-blocked-by-gates',
    summary: 'Revenue path exists with guarded rewarded/cosmetic tests, app-ads output, and unit-economics spend controls.',
    evidence: [
      `Monetization status: ${monetization.status}`,
      `Revenue enabled: ${monetization.revenueEnabled}`,
      `Runtime: ${monetization.runtime?.status ?? 'missing'}`,
      `Unit economics: ${unitEconomics.status}`,
      `Paid acquisition allowed: ${unitEconomics.controls?.paidAcquisitionAllowed}`,
    ],
    blockers: monetization.blockers ?? monetizationDecision?.blockers ?? [],
    nextAction: monetizationDecision?.nextAction ?? 'Keep revenue disabled until product, privacy, and ad-network gates pass.',
  }),
  requirement({
    id: 'app-store-distribution-path',
    status:
      storePackage.storeListing?.shortDescription &&
      ['support-channel-ready', 'support-channel-planned'].includes(supportChannel.status) &&
      storeCompliance.status === 'draft-ready-external-blockers' &&
      nativePackage.status !== 'missing' &&
      androidRelease.status &&
      iosRelease.status &&
      iosRelease.status !== 'missing'
        ? 'prepared-external-blockers'
        : 'incomplete',
    summary:
      'Store listing, compliance drafts, screenshots, Android TWA handoff, and iOS App Store handoff are prepared while store release stays gated.',
    evidence: [
      `Store package privacy URL: ${storePackage.privacyPolicy?.productionUrlStatus}`,
      `Support channel: ${supportChannel.status}; provider ${supportChannel.provider}; store email still required ${
        supportChannel.controls?.supportEmailStillRequiredForStoreSubmission === true
      }`,
      `Store assets: ${storeAssets.status}`,
      `Store compliance: ${storeCompliance.status}`,
      `Store owner next unlock: ${storeReadiness.storeOwnerUnlockSummary?.nextUnlockId ?? 'none'}; lowest input ${
        storeReadiness.storeOwnerUnlockSummary?.lowestInputMissingInputCount ?? 'n/a'
      } input(s), ${storeReadiness.storeOwnerUnlockSummary?.lowestInputMissingSecretCount ?? 'n/a'} secret(s)`,
      `Android signing: ${androidSigning.status}; fingerprint ${
        androidSigning.signing?.sha256CertFingerprint ? 'available' : 'missing'
      }`,
      `Native package: ${nativePackage.status}`,
      `Android release: ${androidRelease.status}`,
      `iOS release: ${iosRelease.status}; native project deferred ${
        iosRelease.strategy?.nativeProjectDeferred === true
      }`,
    ],
    blockers: [
      ...(storeCompliance.blockers ?? []),
      ...(androidRelease.blockers ?? []),
      ...(iosRelease.blockers ?? []),
      ...(iosDecision?.blockers ?? []),
    ],
    nextAction: storeDistributionNextAction,
  }),
  requirement({
    id: 'minimal-cost-guardrails',
    status:
      unitEconomics.controls?.maxDailySpendUsd === 0 &&
      productionBootstrap.controls?.zeroSpendGuard === true &&
      autonomousOperator.controls?.zeroPaidSpend === true &&
      autonomousOwnerLoop.guardrails?.every((guardrail) => guardrail.enforced === true)
        ? 'met'
        : 'incomplete',
    summary: 'Zero-spend, no-store-submission, and no-revenue-before-gates controls are enforced.',
    evidence: [
      `Max daily spend: $${(unitEconomics.controls?.maxDailySpendUsd ?? 0).toFixed(2)}`,
      `Bootstrap zero spend: ${productionBootstrap.controls?.zeroSpendGuard}`,
      `Operator zero spend: ${autonomousOperator.controls?.zeroPaidSpend}`,
      `Owner guardrails: ${
        autonomousOwnerLoop.guardrails?.filter((guardrail) => guardrail.enforced).length ?? 0
      }/${autonomousOwnerLoop.guardrails?.length ?? 0}`,
    ],
    blockers: [],
    nextAction: 'Preserve zero-spend posture until observed revenue and payback gates open.',
  }),
]

const completedRequirements = requirements.filter((item) =>
  ['met', 'met-live', 'met-fixture-or-local', 'met-local', 'met-enabled'].includes(item.status),
)
const preparedRequirements = requirements.filter((item) => item.status.startsWith('prepared'))
const incompleteRequirements = requirements.filter(
  (item) => !completedRequirements.includes(item) && !preparedRequirements.includes(item),
)
const externalBlockers = objectiveBlockers.filter((blocker) =>
  /origin|support|credential|PostHog|collector|AdSense|AdMob|fingerprint|Google Play|Apple|privacy|signing|account|domain|URL|repository|GitHub|Pages|git/i.test(
    blocker,
  ),
)
const productBlockers = objectiveBlockers.filter((blocker) =>
  /completion|Replay|D1 retention|retention|revenue|payback/i.test(blocker),
)
const ownerNextBestActionId = autonomousOwnerLoop.ownerDecision?.nextBestActionId
const ownerNextBestActionSuppressed =
  (productionBootstrapFresh && ownerNextBestActionId === 'bootstrap-production-setup') ||
  (repositoryChannelReady && ownerNextBestActionId === 'prepare-repository-channel')
const ownerNextBestActionUsable =
  typeof ownerNextBestActionId === 'string' &&
  ownerNextBestActionId.length > 0 &&
  !ownerNextBestActionSuppressed
const objectiveNextBestAction = ownerNextBestActionUsable
  ? ownerNextBestActionId
  : !productionBootstrapFresh
    ? 'bootstrap-production-setup'
    : !liveAnalytics
      ? 'collect-live-events'
      : productBlockers.length > 0
        ? 'optimize-product-gates'
        : 'run-autonomous-daily'
const objectiveNextBestActionSource = ownerNextBestActionUsable
  ? 'owner-loop'
  : ownerNextBestActionSuppressed
    ? 'freshness-guard'
    : 'objective-fallback'
const canMarkGoalComplete =
  incompleteRequirements.length === 0 &&
  preparedRequirements.length === 0 &&
  externalBlockers.length === 0 &&
  productBlockers.length === 0 &&
  monetization.revenueEnabled === true

const payload = {
  generatedAt: new Date().toISOString(),
  status: canMarkGoalComplete ? 'objective-complete' : 'objective-in-progress',
  objective:
    'Build a bootstrapped autonomous web/PWA game portal that can generate original board-game-inspired games, measure user behavior, propose and apply data-driven improvements, and prepare a path to monetization and app-store distribution with minimal manual intervention.',
  summary: {
    requirements: requirements.length,
    met: completedRequirements.length,
    prepared: preparedRequirements.length,
    incomplete: incompleteRequirements.length,
    externalBlockers: externalBlockers.length,
    productBlockers: productBlockers.length,
  },
  requirements,
  blockers: {
    external: externalBlockers,
    product: productBlockers,
    all: objectiveBlockers,
  },
  controls: {
    preserveOriginalScope: true,
    doNotMarkGoalCompleteWhileBlocked: true,
    zeroSpendGuard: unitEconomics.controls?.maxDailySpendUsd === 0,
    noRevenueEnablementUntilGatesPass: monetization.revenueEnabled !== true,
    noStoreSubmissionUntilExternalAccounts: true,
    currentWorktreeClean,
    currentWorktreeDirtyFiles,
    currentGitWorktreeDirtyFiles: currentWorktreeDirtyFiles,
    currentGeneratedEvidenceDirtyFiles,
    currentNonGeneratedWorktreeDirtyFiles,
    currentWorktreeHasOnlyGeneratedEvidenceChanges:
      currentWorktreeDirtyFiles !== null &&
      currentWorktreeDirtyFiles > 0 &&
      currentNonGeneratedWorktreeDirtyFiles === 0,
    productionBootstrapFresh,
    productionBootstrapSourceDataHash: currentProductionBootstrapSourceDataHash,
    productionBootstrapStaleInputIds,
    objectiveNextBestActionSource,
  },
  completion: {
    canMarkGoalComplete,
    reason: canMarkGoalComplete
      ? 'All objective requirements are proven with no remaining blockers.'
      : `The local autonomous PWA system is largely prepared${
          postDeployArtifactSyncReady ? ' with strict live deploy evidence synced from GitHub Actions' : ''
        }, but production credentials, live data, monetization gates, and store account/signing blockers remain.`,
    nextBestAction: objectiveNextBestAction,
  },
}

const report = [
  '# Objective Audit',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Can mark goal complete: ${payload.completion.canMarkGoalComplete}`,
  `Reason: ${payload.completion.reason}`,
  `Next best action: ${payload.completion.nextBestAction}`,
  '',
  '## Summary',
  '',
  `- Requirements: ${payload.summary.requirements}`,
  `- Met: ${payload.summary.met}`,
  `- Prepared: ${payload.summary.prepared}`,
  `- Incomplete: ${payload.summary.incomplete}`,
  `- External blockers: ${payload.summary.externalBlockers}`,
  `- Product blockers: ${payload.summary.productBlockers}`,
  '',
  '## Requirements',
  '',
  ...requirements.flatMap((item) => [
    `- ${item.status}: ${item.id} - ${item.summary}`,
    `  - next: ${item.nextAction}`,
  ]),
  '',
  '## Top Blockers',
  '',
  ...(objectiveBlockers.length ? objectiveBlockers.slice(0, 16).map((blocker) => `- ${blocker}`) : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
const runtimePayload = {
  status: payload.status,
  summary: payload.summary,
  completion: payload.completion,
}
await writeFile(
  outputTsPath,
  `export const objectiveAudit = ${JSON.stringify(runtimePayload, null, 2)} as const\n\nexport type ObjectiveAudit = typeof objectiveAudit\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
