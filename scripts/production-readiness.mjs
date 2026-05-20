import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const gatesPath = path.join(root, 'data', 'production-gates.json')
const pipelinePath = path.join(root, 'data', 'prototype-pipeline.json')
const playableGamesPath = path.join(root, 'data', 'playable-games.json')
const generatedPlayablePath = path.join(root, 'data', 'generated-playable-games.json')
const balancePath = path.join(root, 'data', 'balance-report.json')
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const retentionLoopPath = path.join(root, 'data', 'retention-loop.json')
const storePackagePath = path.join(root, 'data', 'store-package.json')
const storeAssetsPath = path.join(root, 'data', 'store-assets.json')
const storeListingOptimizerPath = path.join(root, 'data', 'store-listing-optimizer.json')
const storeCompliancePath = path.join(root, 'data', 'store-compliance.json')
const iconAssetsPath = path.join(root, 'data', 'icon-assets.json')
const pwaInstallLoopPath = path.join(root, 'data', 'pwa-install-loop.json')
const performanceBudgetPath = path.join(root, 'data', 'performance-budget.json')
const releaseCandidatePath = path.join(root, 'data', 'release-candidate.json')
const postDeploySmokePath = path.join(root, 'data', 'post-deploy-smoke.json')
const productOptimizationPath = path.join(root, 'data', 'product-optimization.json')
const firstMoveCoachPath = path.join(root, 'data', 'first-move-coach.json')
const completionLoopPath = path.join(root, 'data', 'completion-loop.json')
const replayLoopPath = path.join(root, 'data', 'replay-loop.json')
const nativePackagePath = path.join(root, 'data', 'native-package.json')
const androidSigningPath = path.join(root, 'data', 'android-signing.json')
const environmentPath = path.join(root, 'data', 'production-environment.json')
const repositoryReadinessPath = path.join(root, 'data', 'repository-readiness.json')
const repositoryBootstrapPath = path.join(root, 'data', 'repository-bootstrap.json')
const productionBootstrapPath = path.join(root, 'data', 'production-bootstrap.json')
const autonomousOperatorPath = path.join(root, 'data', 'autonomous-operator.json')
const autonomousOperatorHistoryPath = path.join(root, 'data', 'autonomous-operator-history.json')
const autonomousCadencePath = path.join(root, 'data', 'autonomous-cadence.json')
const autonomousSelfUpdatePath = path.join(root, 'data', 'autonomous-self-update.json')
const objectiveAuditPath = path.join(root, 'data', 'objective-audit.json')
const releaseHealthPath = path.join(root, 'data', 'release-health.json')
const deploymentPlanPath = path.join(root, 'data', 'deployment-plan.json')
const growthPath = path.join(root, 'data', 'growth-plan.json')
const growthOptimizerPath = path.join(root, 'data', 'growth-optimizer.json')
const organicSeedLoopPath = path.join(root, 'data', 'organic-seed-loop.json')
const workflowPath = path.join(root, '.github', 'workflows', 'autonomous-daily.yml')
const outputJsonPath = path.join(root, 'data', 'production-readiness.json')
const outputReportPath = path.join(root, 'reports', 'production-readiness-latest.md')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  exists(filePath)
    .then((found) => (found ? readJson(filePath) : fallback))
    .catch(() => fallback)
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)

const gates = await readJson(gatesPath)
const pipeline = await readJson(pipelinePath)
const playableGames = await readJson(playableGamesPath)
const generatedPlayable = await readJson(generatedPlayablePath)
const balance = await readJson(balancePath)
const analytics = await readJson(analyticsPath)
const totals = analytics.totals
const firstGameCompletion = totals.metrics.firstGameCompletion
const replayRate = totals.metrics.replayRate
const d1Retention = totals.metrics.d1Retention
const retentionSource =
  analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? analytics.sourceStatus?.activeSource
const retentionLoop = await readOptionalJson(retentionLoopPath, {
  status: 'missing',
  dailyChallenge: {},
  guardrails: {},
  missions: [],
})
const storePackage = await readJson(storePackagePath)
const storeAssets = await readOptionalJson(storeAssetsPath, {
  status: 'missing',
  screenshots: [],
})
const storeListingOptimizer = await readOptionalJson(storeListingOptimizerPath, {
  status: 'missing',
  recommendation: {},
  listing: {},
  copyGuardrails: {},
})
const storeCompliance = await readOptionalJson(storeCompliancePath, {
  status: 'missing',
  checks: [],
  blockers: [],
})
const iconAssets = await readOptionalJson(iconAssetsPath, {
  status: 'missing',
  assets: [],
  manifestIcons: [],
})
const pwaInstallLoop = await readOptionalJson(pwaInstallLoopPath, {
  status: 'missing',
  channel: {},
  metrics: {},
  promptPolicy: {},
  guardrails: {},
})
const performanceBudget = await readOptionalJson(performanceBudgetPath, {
  status: 'missing',
  budgets: {},
  initial: {},
  deferred: {},
  controls: {},
  checks: [],
})
const releaseCandidate = await readOptionalJson(releaseCandidatePath, {
  status: 'missing',
  summary: {},
  controls: {},
  integrity: {},
  postDeploySmoke: [],
  checks: [],
})
const postDeploySmoke = await readOptionalJson(postDeploySmokePath, {
  status: 'missing',
  target: {},
  sourceStatus: {},
  summary: {},
  controls: {},
  checks: [],
})
const productOptimization = await readOptionalJson(productOptimizationPath, {
  status: 'missing',
  productGates: {},
  controls: {},
  actions: [],
})
const firstMoveCoach = await readOptionalJson(firstMoveCoachPath, {
  status: 'missing',
  summary: {},
  controls: {},
  telemetry: {},
  targets: [],
})
const completionLoop = await readOptionalJson(completionLoopPath, {
  status: 'missing',
  sourceStatus: {},
  target: {},
  metrics: {},
  controls: {},
  promptPolicy: {},
  finishLinePolicy: {},
  missions: [],
})
const replayLoop = await readOptionalJson(replayLoopPath, {
  status: 'missing',
  sourceStatus: {},
  target: {},
  metrics: {},
  controls: {},
  promptPolicy: {},
  missions: [],
})
const nativePackage = await readOptionalJson(nativePackagePath, {
  status: 'missing',
  checks: [],
  handoff: {},
})
const androidSigning = await readOptionalJson(androidSigningPath, {
  status: 'missing',
  signing: {},
  ciSecrets: {},
  controls: {},
  checks: [],
})
const environment = await readOptionalJson(environmentPath, {
  status: 'missing',
  publicOrigin: { origin: null, status: 'missing' },
})
const repositoryReadiness = await readOptionalJson(repositoryReadinessPath, {
  status: 'missing',
  workspace: {},
  repository: {},
  githubAutomation: {},
  controls: {},
  blockers: [],
})
const repositoryBootstrap = await readOptionalJson(repositoryBootstrapPath, {
  status: 'missing',
  mode: 'missing',
  workspace: { after: {} },
  repository: {},
  controls: {},
  helper: {},
  actions: [],
  blockers: [],
})
const productionBootstrap = await readOptionalJson(productionBootstrapPath, {
  status: 'missing',
  controls: {},
  stages: [],
  setupCommands: [],
  requiredVariables: [],
  requiredSecrets: [],
})
const autonomousOperator = await readOptionalJson(autonomousOperatorPath, {
  status: 'missing',
  selectedAction: null,
  controls: {},
  execution: {},
  eligibleActionIds: [],
  blockedActions: [],
})
const autonomousOperatorHistory = await readOptionalJson(autonomousOperatorHistoryPath, {
  status: 'missing',
  summary: {},
  controls: {},
  records: [],
})
const autonomousCadence = await readOptionalJson(autonomousCadencePath, {
  status: 'missing',
  schedulers: {},
  commandPlan: {},
  controls: {},
  freshnessPolicy: {},
  artifactFreshness: [],
  checks: [],
})
const autonomousSelfUpdate = await readOptionalJson(autonomousSelfUpdatePath, {
  status: 'missing',
  repository: {},
  pendingChanges: {},
  commitPlan: {},
  controls: {},
  checks: [],
  blockers: [],
})
const objectiveAudit = await readOptionalJson(objectiveAuditPath, {
  status: 'missing',
  summary: {},
  requirements: [],
  controls: {},
  completion: {},
})
const releaseHealth = await readOptionalJson(releaseHealthPath, {
  status: 'missing',
  controls: { canPromoteWeb: false },
})
const deployment = await readOptionalJson(deploymentPlanPath, {
  status: 'missing',
  target: {},
})
const growth = await readJson(growthPath)
const growthOptimizer = await readJson(growthOptimizerPath)
const organicSeedLoop = await readOptionalJson(organicSeedLoopPath, {
  status: 'missing',
  sourceStatus: {},
  target: null,
  runtimeSurface: {},
  guardrails: {},
  missions: [],
  campaigns: [],
})

const appSource = await readFile(path.join(root, 'src', 'App.tsx'), 'utf8')
const privacySource = await readFile(path.join(root, 'src', 'lib', 'privacy.ts'), 'utf8')
const growthPagesInBuild = await Promise.all(
  (growth.gamePages ?? []).map((game) =>
    game.pagePath ? exists(path.join(root, 'dist', game.pagePath.replace(/^\//, ''))) : false,
  ),
)
const growthAssetsInBuild =
  (await exists(path.join(root, 'dist', 'sitemap.xml'))) &&
  (await exists(path.join(root, 'dist', 'robots.txt'))) &&
  (await exists(path.join(root, 'dist', 'share-manifest.json'))) &&
  growthPagesInBuild.every(Boolean)

const screenshotAssets = storeAssets.screenshots ?? []
const storePackageScreenshotAssets = storePackage.storeListing?.screenshotAssets ?? []
const screenshotAssetIds = new Set(storePackageScreenshotAssets.map((asset) => asset.id))
const screenshotAssetFiles = await Promise.all(
  screenshotAssets.map(async (asset) => {
    const publicPath = path.join(root, 'public', asset.path?.replace(/^\//, '') ?? '')
    const distPath = path.join(root, asset.distPath ?? '')

    return {
      id: asset.id,
      publicExists: await exists(publicPath),
      distExists: await exists(distPath),
      hasDimensions: asset.width >= 1 && asset.height >= 1 && asset.bytes >= 20_000,
      attachedToStorePackage: screenshotAssetIds.has(asset.id),
    }
  }),
)
const storeScreenshotsReady =
  storeAssets.status === 'screenshots-ready' &&
  screenshotAssets.length >= 4 &&
  storePackageScreenshotAssets.length >= 4 &&
  screenshotAssetFiles.every(
    (asset) => asset.publicExists && asset.distExists && asset.hasDimensions && asset.attachedToStorePackage,
  )
const storeListingOptimizationReady =
  storeListingOptimizer.status === 'store-listing-optimizer-ready' &&
  storeListingOptimizer.recommendation?.focusGameId === storePackage.launchCandidate?.id &&
  storeListingOptimizer.listing?.sourceGameId === storePackage.launchCandidate?.id &&
  storeListingOptimizer.listing?.shortDescription === storePackage.storeListing?.shortDescription &&
  storeListingOptimizer.copyGuardrails?.googleShortDescriptionMaxChars === 80 &&
  storeListingOptimizer.copyGuardrails?.noProtectedBoardGameNames === true &&
  storeListingOptimizer.copyGuardrails?.noUnverifiedAwardsOrRankingClaims === true &&
  storeListingOptimizer.copyGuardrails?.noMonetizationClaimsBeforeEnabled === true &&
  (storeListingOptimizer.screenshotPriorities?.length ?? 0) >= 4 &&
  storePackageScreenshotAssets[0]?.id === storeListingOptimizer.screenshotPriorities?.[0]?.id
const iconFiles = await Promise.all(
  (iconAssets.assets ?? []).map(async (asset) => {
    const publicPath = path.join(root, 'public', asset.path?.replace(/^\//, '') ?? '')
    const distPath = path.join(root, 'dist', asset.path?.replace(/^\//, '') ?? '')

    return {
      id: asset.id,
      publicExists: await exists(publicPath),
      distExists: await exists(distPath),
      hasDimensions: asset.width === asset.size && asset.height === asset.size && asset.bytes >= 4_000,
    }
  }),
)
const iconAssetsReady =
  iconAssets.status === 'icons-ready' &&
  (iconAssets.manifestIcons?.length ?? 0) >= 4 &&
  iconFiles.length >= 6 &&
  iconFiles.every((asset) => asset.publicExists && asset.distExists && asset.hasDimensions)
const playableGameIds = new Set(playableGames.games ?? [])
const organicSeedGuardrails = organicSeedLoop.guardrails ?? {}
const organicSeedLoopReady =
  organicSeedLoop.status === 'organic-seed-loop-ready' &&
  playableGameIds.has(organicSeedLoop.target?.gameId) &&
  organicSeedLoop.sourceStatus?.analyticsSource === analytics.sourceStatus?.activeSource &&
  organicSeedLoop.sourceStatus?.trafficSeeding === 'traffic-seeding-ready' &&
  organicSeedLoop.sourceStatus?.acquisitionLearning === 'acquisition-learning-ready' &&
  organicSeedLoop.runtimeSurface?.status === 'armed' &&
  organicSeedLoop.runtimeSurface?.surface === 'portal-growth-loop' &&
  organicSeedLoop.runtimeSurface?.telemetry?.viewed === 'organic_seed_card_viewed' &&
  organicSeedLoop.runtimeSurface?.telemetry?.shared === 'organic_seed_share_clicked' &&
  organicSeedLoop.runtimeSurface?.telemetry?.opened === 'seed_campaign_clicked' &&
  organicSeedGuardrails.maxCostUsd === 0 &&
  organicSeedGuardrails.playerInitiatedSharingOnly === true &&
  organicSeedGuardrails.noAutomatedExternalPosting === true &&
  organicSeedGuardrails.noSpamAutomation === true &&
  organicSeedGuardrails.noPaidIncentives === true &&
  organicSeedGuardrails.requireCampaignAttribution === true &&
  (organicSeedLoop.missions ?? []).some(
    (mission) => mission.id === 'share-seed-link' && mission.event === 'organic_seed_share_clicked',
  )
const retentionMissions = retentionLoop.missions ?? []
const retentionGuardrails = retentionLoop.guardrails ?? {}
const dailyChallengePlayable = playableGameIds.has(retentionLoop.dailyChallenge?.gameId)
const retentionLoopReady =
  retentionLoop.status === 'retention-loop-ready' &&
  dailyChallengePlayable &&
  retentionLoop.sourceStatus?.analyticsSource === analytics.sourceStatus?.activeSource &&
  retentionGuardrails.noPushNotifications === true &&
  retentionGuardrails.noAccountsRequired === true &&
  retentionGuardrails.noDarkPatterns === true &&
  retentionGuardrails.noPaidRetentionMechanics === true &&
  retentionGuardrails.noRewardedAdsUntilMonetizationGatesPass === true &&
  retentionGuardrails.noNotificationPermissionRequest === true &&
  retentionLoop.promptPolicy?.status &&
  retentionLoop.promptPolicy?.surface === 'autonomy-cockpit-retention-card' &&
  retentionLoop.promptPolicy?.telemetry?.viewed === 'daily_return_prompt_viewed' &&
  retentionLoop.promptPolicy?.telemetry?.clicked === 'daily_return_prompt_clicked' &&
  retentionLoop.promptPolicy?.telemetry?.dismissed === 'daily_return_prompt_dismissed' &&
  retentionLoop.returnIntentPolicy?.status &&
  retentionLoop.returnIntentPolicy?.surface === 'autonomy-cockpit-return-intent-card' &&
  retentionLoop.returnIntentPolicy?.trigger === 'app-load-with-local-return-intent' &&
  retentionLoop.returnIntentPolicy?.telemetry?.viewed === 'daily_return_intent_viewed' &&
  retentionLoop.returnIntentPolicy?.telemetry?.started === 'daily_return_intent_started' &&
  retentionLoop.returnIntentPolicy?.telemetry?.cleared === 'daily_return_intent_cleared' &&
  retentionLoop.controls?.returnIntentPlayerInitiatedOnly === true &&
  retentionLoop.controls?.noBackgroundWakeups === true &&
  retentionMissions.some(
    (mission) =>
      mission.id === 'finish-daily-challenge' &&
      mission.event === 'daily_challenge_completed' &&
      mission.status === 'armed',
  ) &&
  retentionMissions.some(
    (mission) =>
      mission.id === 'activate-return-intent' &&
      mission.event === 'daily_return_intent_started' &&
      ['armed', 'monitor'].includes(mission.status),
  )
const pwaInstallGuardrails = pwaInstallLoop.guardrails ?? {}
const pwaInstallReady =
  pwaInstallLoop.status === 'pwa-install-loop-ready' &&
  pwaInstallLoop.channel?.costUsd === 0 &&
  pwaInstallLoop.promptPolicy?.nativePromptRequired === true &&
  pwaInstallLoop.publicInstallPage?.path === '/install.html' &&
  pwaInstallLoop.publicInstallPage?.zeroPaidSpend === true &&
  pwaInstallLoop.publicInstallPage?.playerInitiatedOnly === true &&
  pwaInstallLoop.publicInstallPage?.browserPromptControlled === true &&
  pwaInstallGuardrails.noForcedPrompt === true &&
  pwaInstallGuardrails.noBlockingGameplay === true &&
  pwaInstallGuardrails.respectBrowserPromptAvailability === true &&
  pwaInstallGuardrails.noInstallWall === true &&
  pwaInstallGuardrails.noPaidInstallReward === true
const performanceBudgetReady =
  performanceBudget.status === 'performance-budget-ready' &&
  performanceBudget.initial?.jsBytes <= performanceBudget.budgets?.initialJsMaxBytes &&
  performanceBudget.initial?.gzipBytes <= performanceBudget.budgets?.initialGzipMaxBytes &&
  performanceBudget.initial?.cssBytes <= performanceBudget.budgets?.initialCssMaxBytes &&
  performanceBudget.controls?.phaserDeferredFromInitialShell === true &&
  performanceBudget.controls?.initialShellBudgetEnforced === true &&
  performanceBudget.controls?.noPerformanceClaimsWithoutBuildEvidence === true &&
  (performanceBudget.deferred?.chunks ?? []).some((chunk) => chunk.file?.includes('GameCanvas')) &&
  !new Set(performanceBudget.initial?.entryScripts ?? []).has(
    performanceBudget.deferred?.largestJsChunk?.file,
  )
const releaseCandidateReady =
  releaseCandidate.status === 'release-candidate-ready' &&
  releaseCandidate.summary?.requiredFilesPresent === true &&
  releaseCandidate.summary?.totalFiles >= 20 &&
  releaseCandidate.summary?.gamePages >= 1 &&
  releaseCandidate.controls?.zeroPaidSpend === true &&
  releaseCandidate.controls?.contentHashesRecorded === true &&
  releaseCandidate.controls?.postDeploySmokeRequired === true &&
  releaseCandidate.integrity?.algorithm === 'sha256' &&
  typeof releaseCandidate.integrity?.aggregateHash === 'string' &&
  releaseCandidate.integrity.aggregateHash.length === 64 &&
  (releaseCandidate.postDeploySmoke?.length ?? 0) >= 6 &&
  (await exists(path.join(root, 'dist', 'release-candidate.json')))
const postDeploySmokeChecks = postDeploySmoke.checks ?? []
const postDeploySmokeExpectedChecks = (releaseCandidate.postDeploySmoke?.length ?? 0) + 1
const localArtifactSmoke = postDeploySmoke.localArtifactSmoke ?? {
  status: 'missing',
  summary: {},
  controls: {},
  checks: [],
}
const localArtifactSmokeReady =
  localArtifactSmoke.status === 'predeploy-artifact-smoke-passed' &&
  localArtifactSmoke.summary?.planned >= postDeploySmokeExpectedChecks &&
  localArtifactSmoke.summary?.passed === localArtifactSmoke.summary?.planned &&
  localArtifactSmoke.summary?.failed === 0 &&
  localArtifactSmoke.controls?.readOnlyFileChecks === true &&
  localArtifactSmoke.controls?.noNetworkRequired === true &&
  localArtifactSmoke.controls?.requiredTextChecks === true &&
  localArtifactSmoke.controls?.manifestHashComparisonRequired === true &&
  localArtifactSmoke.checks?.some((item) => item.id === 'release-candidate-manifest')
const postDeploySmokeStatusAllowed = ['blocked-missing-origin', 'post-deploy-smoke-passed'].includes(
  postDeploySmoke.status,
)
const postDeploySmokeRunnerReady =
  postDeploySmokeStatusAllowed &&
  localArtifactSmokeReady &&
  postDeploySmoke.sourceStatus?.deployment === deployment.status &&
  postDeploySmoke.sourceStatus?.releaseCandidate === releaseCandidate.status &&
  postDeploySmoke.target?.candidateId === releaseCandidate.candidateId &&
  postDeploySmoke.target?.aggregateHash === releaseCandidate.integrity?.aggregateHash &&
  postDeploySmoke.controls?.zeroPaidSpend === true &&
  postDeploySmoke.controls?.noStoreSubmission === true &&
  postDeploySmoke.controls?.noRevenueEnablement === true &&
  postDeploySmoke.controls?.readOnlyHttpChecks === true &&
  postDeploySmoke.controls?.localArtifactSmokeRequired === true &&
  postDeploySmoke.controls?.manifestHashComparisonRequired === true &&
  postDeploySmokeChecks.length >= postDeploySmokeExpectedChecks &&
  postDeploySmokeChecks.some((item) => item.id === 'release-candidate-manifest') &&
  (postDeploySmoke.status === 'post-deploy-smoke-passed'
    ? postDeploySmoke.summary?.failed === 0 && postDeploySmoke.summary?.passed === postDeploySmoke.summary?.planned
    : postDeploySmoke.summary?.blocked === postDeploySmoke.summary?.planned)
const productOptimizationReady =
  productOptimization.status === 'product-optimization-ready' &&
  productOptimization.sourceStatus?.analyticsSource === analytics.sourceStatus?.activeSource &&
  productOptimization.productGates?.firstGameCompletion?.actual === roundMetric(firstGameCompletion) &&
  productOptimization.productGates?.replayRate?.actual === roundMetric(replayRate) &&
  productOptimization.productGates?.d1Retention?.actual === roundMetric(d1Retention) &&
  productOptimization.controls?.requirePlayableGame === true &&
  productOptimization.controls?.noRepeatForSameSourceData === true &&
  productOptimization.controls?.oneTargetStepPerRun === true &&
  productOptimization.controls?.revenueStillDisabledUntilGatesPass === true &&
  productOptimization.controls?.replayPromptAfterCompletedRunOnly === true &&
  productOptimization.controls?.completionNudgeMustBeMidRunOnly === true &&
  productOptimization.controls?.finishLineCoachBehindPaceOnly === true &&
  productOptimization.controls?.returnIntentMustBePlayerInitiated === true &&
  productOptimization.controls?.noBackgroundRetentionWakeups === true &&
  (productOptimization.actions ?? []).some((action) => action.actionType === 'target-score-curve') &&
  (productOptimization.actions ?? []).some((action) => action.actionType === 'runtime-first-move-coach') &&
  (productOptimization.actions ?? []).some((action) => action.actionType === 'runtime-replay-telemetry') &&
  (productOptimization.actions ?? []).some((action) => action.actionType === 'runtime-replay-prompt') &&
  (productOptimization.actions ?? []).some((action) => action.actionType === 'runtime-completion-nudge') &&
  (productOptimization.actions ?? []).some((action) => action.actionType === 'runtime-finish-line-coach') &&
  (productOptimization.actions ?? []).some((action) => action.actionType === 'runtime-return-intent-activation')
const firstMoveCoachReady =
  firstMoveCoach.status === 'first-move-coach-ready' &&
  firstMoveCoach.summary?.enabled === true &&
  firstMoveCoach.summary?.enabledTargets >= 1 &&
  firstMoveCoach.controls?.zeroPaidSpend === true &&
  firstMoveCoach.controls?.firstTurnOnly === true &&
  firstMoveCoach.controls?.noAutoMove === true &&
  firstMoveCoach.controls?.noForcedTutorial === true &&
  firstMoveCoach.controls?.noRevenueEnablement === true &&
  firstMoveCoach.controls?.respectsExperimentPolicy === true &&
  firstMoveCoach.controls?.requiresReleaseHealth === true &&
  firstMoveCoach.telemetry?.shown === 'first_move_coach_shown' &&
  firstMoveCoach.telemetry?.used === 'first_move_coach_used' &&
  firstMoveCoach.telemetry?.skipped === 'first_move_coach_skipped'
const completionLoopReady =
  completionLoop.status === 'completion-loop-ready' &&
  playableGameIds.has(completionLoop.target?.gameId) &&
  completionLoop.sourceStatus?.analyticsSource === analytics.sourceStatus?.activeSource &&
  completionLoop.sourceStatus?.productOptimization === productOptimization.status &&
  completionLoop.sourceStatus?.firstMoveCoach === firstMoveCoach.status &&
  completionLoop.metrics?.firstGameCompletion === roundMetric(firstGameCompletion) &&
  completionLoop.metrics?.completionGate === roundMetric(gates.monetization.minFirstGameCompletion) &&
  completionLoop.controls?.zeroPaidSpend === true &&
  completionLoop.controls?.midRunOnly === true &&
  completionLoop.controls?.onePromptPerRun === true &&
  completionLoop.controls?.noForcedTutorial === true &&
  completionLoop.controls?.noAutoMove === true &&
  completionLoop.controls?.noRuleChange === true &&
  completionLoop.controls?.finishLineCoachBehindPaceOnly === true &&
  completionLoop.controls?.finishLineCoachAfterMidpointOnly === true &&
  completionLoop.controls?.noScoreManipulation === true &&
  completionLoop.controls?.noPaidRewards === true &&
  completionLoop.controls?.noRevenueEnablement === true &&
  completionLoop.controls?.requireAbandonmentTelemetry === true &&
  completionLoop.promptPolicy?.status &&
  completionLoop.promptPolicy?.surface === 'autonomy-cockpit-completion-card' &&
  completionLoop.promptPolicy?.trigger === 'after-progress-checkpoint' &&
  completionLoop.promptPolicy?.telemetry?.viewed === 'completion_nudge_viewed' &&
  completionLoop.promptPolicy?.telemetry?.clicked === 'completion_nudge_clicked' &&
  completionLoop.promptPolicy?.telemetry?.dismissed === 'completion_nudge_dismissed' &&
  completionLoop.promptPolicy?.telemetry?.completed === 'level_completed' &&
  completionLoop.promptPolicy?.telemetry?.abandoned === 'game_abandoned' &&
  completionLoop.finishLinePolicy?.surface === 'autonomy-cockpit-finish-line-card' &&
  completionLoop.finishLinePolicy?.trigger === 'behind-pace-after-midpoint' &&
  completionLoop.finishLinePolicy?.telemetry?.viewed === 'finish_line_coach_viewed' &&
  completionLoop.finishLinePolicy?.telemetry?.clicked === 'finish_line_coach_clicked' &&
  completionLoop.finishLinePolicy?.telemetry?.dismissed === 'finish_line_coach_dismissed' &&
  (completionLoop.missions ?? []).some(
    (mission) =>
      mission.id === 'choose-keep-playing' &&
      mission.event === 'completion_nudge_clicked' &&
      ['armed', 'monitor'].includes(mission.status),
  )
const replayLoopReady =
  replayLoop.status === 'replay-loop-ready' &&
  playableGameIds.has(replayLoop.target?.gameId) &&
  replayLoop.sourceStatus?.analyticsSource === analytics.sourceStatus?.activeSource &&
  replayLoop.sourceStatus?.productOptimization === productOptimization.status &&
  replayLoop.metrics?.replayRate === roundMetric(replayRate) &&
  replayLoop.metrics?.replayGate === roundMetric(gates.monetization.minReplayRate) &&
  replayLoop.controls?.zeroPaidSpend === true &&
  replayLoop.controls?.afterCompletedRunOnly === true &&
  replayLoop.controls?.onePromptPerCompletedRun === true &&
  replayLoop.controls?.noForcedReplay === true &&
  replayLoop.controls?.noAutoRestart === true &&
  replayLoop.controls?.noPaidRewards === true &&
  replayLoop.controls?.noRevenueEnablement === true &&
  replayLoop.promptPolicy?.status &&
  replayLoop.promptPolicy?.surface === 'autonomy-cockpit-replay-card' &&
  replayLoop.promptPolicy?.trigger === 'after-completed-run' &&
  replayLoop.promptPolicy?.telemetry?.viewed === 'replay_prompt_viewed' &&
  replayLoop.promptPolicy?.telemetry?.clicked === 'replay_prompt_clicked' &&
  replayLoop.promptPolicy?.telemetry?.dismissed === 'replay_prompt_dismissed' &&
  replayLoop.promptPolicy?.telemetry?.replay === 'replay_clicked' &&
  (replayLoop.missions ?? []).some(
    (mission) =>
      mission.id === 'confirm-replay' &&
      mission.event === 'replay_prompt_clicked' &&
      ['armed', 'monitor'].includes(mission.status),
  )
const productionBootstrapReady =
  productionBootstrap.status === 'production-bootstrap-ready' &&
  productionBootstrap.controls?.zeroSpendGuard === true &&
  productionBootstrap.controls?.noPaidResourcesCreated === true &&
  productionBootstrap.controls?.noStoreSubmission === true &&
  productionBootstrap.setupScript?.path === 'ops/github/setup-production.sh' &&
  (productionBootstrap.stages ?? []).some((stage) => stage.id === 'repository-channel') &&
  (productionBootstrap.stages ?? []).some((stage) => stage.id === 'repository-bootstrap') &&
  (productionBootstrap.stages ?? []).some((stage) => stage.id === 'github-pages-hosting') &&
  (productionBootstrap.stages ?? []).some((stage) => stage.id === 'autonomous-self-update') &&
  (productionBootstrap.stages ?? []).some((stage) => stage.id === 'event-collector') &&
  (productionBootstrap.setupCommands ?? []).some((command) => command.id === 'repository-preflight') &&
  (productionBootstrap.setupCommands ?? []).some((command) => command.id === 'repository-bootstrap-plan') &&
  (productionBootstrap.setupCommands ?? []).some((command) => command.id === 'sync-repository-config') &&
  (productionBootstrap.requiredVariables ?? []).some(
    (action) => action.repositoryVariable === 'AGL_PUBLIC_ORIGIN',
  ) &&
  (productionBootstrap.requiredSecrets ?? []).some(
    (action) => action.repositorySecret === 'CLOUDFLARE_API_TOKEN',
  )
const autonomousOperatorReady =
  autonomousOperator.status === 'missing' ||
  (['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status) &&
    autonomousOperator.controls?.zeroPaidSpend === true &&
    autonomousOperator.controls?.localCommandAllowlistEnforced === true &&
    autonomousOperator.controls?.maxActionsPerRun === 1 &&
    autonomousOperator.controls?.dryRunByDefault === true &&
    autonomousOperator.controls?.externalWorkflowExecutionBlockedByDefault === true &&
    autonomousOperator.selectedAction?.costUsd === 0)
const autonomousOperatorHistoryReady =
  autonomousOperatorHistory.status === 'missing' ||
  (autonomousOperatorHistory.status === 'operator-history-ready' &&
    autonomousOperatorHistory.controls?.zeroPaidSpend === true &&
    autonomousOperatorHistory.controls?.localCommandAllowlistEnforced === true &&
    autonomousOperatorHistory.controls?.historyIsCapped === true &&
    (autonomousOperatorHistory.summary?.totalRecords ?? 0) >= 1)
const autonomousCadenceReady =
  autonomousCadence.status === 'cadence-ready' &&
  autonomousCadence.controls?.zeroPaidSpend === true &&
  autonomousCadence.controls?.codexAutomationExpectedActive === true &&
  autonomousCadence.controls?.staleEvidenceBlocksUnattendedTrust === true &&
  autonomousCadence.freshnessPolicy?.status === 'fresh' &&
  autonomousCadence.freshnessPolicy?.staleArtifactCount === 0 &&
  autonomousCadence.schedulers?.githubActions?.status === 'scheduled' &&
  autonomousCadence.commandPlan?.operate === 'npm run autonomous:operate' &&
  (autonomousCadence.checks ?? []).every((item) => item.status === 'pass')
const autonomousSelfUpdateReady =
  autonomousSelfUpdate.status === 'self-update-ready' &&
  autonomousSelfUpdate.controls?.zeroPaidSpend === true &&
  autonomousSelfUpdate.controls?.dailyWorkflowReadOnly === true &&
  autonomousSelfUpdate.controls?.writePermissionIsolatedToSelfUpdateWorkflow === true &&
  autonomousSelfUpdate.controls?.commitRequiresCleanVerification === true &&
  autonomousSelfUpdate.controls?.commitRequiresSafePathAllowlist === true &&
  autonomousSelfUpdate.controls?.directPushRequiresExplicitVariable === true &&
  (autonomousSelfUpdate.pendingChanges?.unsafeCount ?? 0) === 0 &&
  (autonomousSelfUpdate.checks ?? []).every((item) => item.status === 'pass')
const objectiveAuditReady =
  objectiveAudit.status === 'missing' ||
  (objectiveAudit.status === 'objective-in-progress' &&
    objectiveAudit.controls?.preserveOriginalScope === true &&
    objectiveAudit.controls?.doNotMarkGoalCompleteWhileBlocked === true &&
    objectiveAudit.completion?.canMarkGoalComplete === false &&
    (objectiveAudit.requirements ?? []).some((item) => item.id === 'web-pwa-game-portal') &&
    (objectiveAudit.requirements ?? []).some((item) => item.id === 'monetization-path') &&
    (objectiveAudit.requirements ?? []).some((item) => item.id === 'app-store-distribution-path'))

const check = (id, passed, detail) => ({
  id,
  status: passed ? 'pass' : 'blocker',
  detail,
})

const webChecks = [
  check(
    'manifest',
    await exists(path.join(root, 'dist', 'manifest.webmanifest')),
    'PWA manifest exists in the production build.',
  ),
  check(
    'install-icons',
    iconAssetsReady,
    `Generated install/store icons are ${iconAssets.status}; ${iconFiles.length} icons checked.`,
  ),
  check('service-worker', await exists(path.join(root, 'dist', 'sw.js')), 'Offline service worker exists.'),
  check(
    'privacy-control',
    privacySource.includes('agl.privacy.externalAnalyticsOptOut') &&
      appSource.includes('Opt out external analytics'),
    'External analytics opt-out is exposed in the app shell.',
  ),
  check(
    'privacy-page',
    (await exists(path.join(root, 'public', 'privacy.html'))) &&
      (await exists(path.join(root, 'dist', 'privacy.html'))) &&
      storePackage.privacyPolicy?.path === '/privacy.html',
    'Generated privacy policy page is included in public assets and production build.',
  ),
  check(
    'support-page',
    (await exists(path.join(root, 'public', 'support.html'))) &&
      (await exists(path.join(root, 'dist', 'support.html'))) &&
      storePackage.supportPage?.path === '/support.html',
    'Generated support page is included in public assets and production build.',
  ),
  check(
    'compliance-manifest',
    (await exists(path.join(root, 'public', 'compliance.json'))) &&
      (await exists(path.join(root, 'dist', 'compliance.json'))) &&
      storePackage.compliancePublication?.publicPath === '/compliance.json' &&
      storePackage.compliancePublication?.smokeChecks?.some((item) => item.path === '/privacy.html') &&
      storePackage.compliancePublication?.smokeChecks?.some((item) => item.path === '/support.html'),
    'Generated compliance manifest is included in public assets, production build, and post-deploy smoke handoff.',
  ),
  check(
    'playable-prototypes',
    pipeline.prototypes?.every((prototype) => prototype.status === 'playable'),
    'Every currently accepted generated concept is playable.',
  ),
  check(
    'generated-runtime',
    generatedPlayable.status === 'generated-runtime-ready' &&
      generatedPlayable.runtime?.codeHandoffRequired === false &&
      generatedPlayable.runtime?.selectionStrategy === 'accepted-concepts-first-then-trend-signals' &&
      generatedPlayable.runtime?.generatedConceptCoverage === pipeline.prototypes?.length &&
      generatedPlayable.games?.length >= 5,
    'Generated game factory has a concept-first portfolio of no-handoff playable runtime configs.',
  ),
  check(
    'balance-severity',
    !balance.games?.some((game) =>
      game.recommendations?.some((recommendation) => recommendation.severity === 'high'),
    ),
    'Bot simulator has no high-severity balance findings.',
  ),
  check(
    'scheduled-ci-runner',
    await exists(workflowPath),
    'Scheduled CI runner exists for the full autonomous loop and browser smoke tests.',
  ),
  check(
    'organic-growth-plan',
    growth.status === 'growth-assets-ready' && growth.gamePages?.length >= 1,
    'Generated growth plan has game pages for zero-cost discovery tests.',
  ),
  check(
    'organic-growth-optimizer',
    growthOptimizer.actions?.length >= 1 && typeof growth.optimization?.optimizedGames === 'number',
    'Growth optimizer produced guarded acquisition actions that feed generated pages.',
  ),
  check(
    'organic-growth-assets',
    growthAssetsInBuild,
    'Sitemap, robots, share manifest, and generated game pages are included in the production build.',
  ),
  check(
    'organic-seed-loop',
    organicSeedLoopReady,
    `Organic seed loop is ${organicSeedLoop.status}; target ${
      organicSeedLoop.target?.gameId ?? 'missing'
    }; player-initiated share guard ${
      organicSeedGuardrails.playerInitiatedSharingOnly === true ? 'active' : 'missing'
    }.`,
  ),
  check(
    'retention-loop',
    retentionLoopReady,
    `Retention loop is ${retentionLoop.status}; daily challenge ${
      retentionLoop.dailyChallenge?.gameId ?? 'missing'
    }; no-push/no-account guardrails ${
      retentionGuardrails.noPushNotifications === true && retentionGuardrails.noAccountsRequired === true
        ? 'active'
      : 'missing'
    }.`,
  ),
  check(
    'pwa-install-loop',
    pwaInstallReady,
    `PWA install loop is ${pwaInstallLoop.status}; prompt surface ${
      pwaInstallLoop.promptPolicy?.surface ?? 'missing'
    }; cost $${pwaInstallLoop.channel?.costUsd ?? 'n/a'}.`,
  ),
  check(
    'performance-budget',
    performanceBudgetReady,
    `Performance budget is ${performanceBudget.status}; initial JS ${
      performanceBudget.initial?.jsKb ?? 'n/a'
    } KB / ${performanceBudget.initial?.gzipKb ?? 'n/a'} KB gzip; deferred game chunk ${
      performanceBudget.deferred?.gameChunk?.file ?? 'missing'
    }.`,
  ),
  check(
    'release-candidate',
    releaseCandidateReady,
    `Release candidate is ${releaseCandidate.status}; files ${
      releaseCandidate.summary?.totalFiles ?? 'n/a'
    }; smoke URLs ${releaseCandidate.summary?.postDeploySmokeUrls ?? 'n/a'}.`,
  ),
  check(
    'post-deploy-smoke-runner',
    postDeploySmokeRunnerReady,
    `Post-deploy smoke is ${postDeploySmoke.status}; origin ${
      postDeploySmoke.target?.origin ?? 'missing'
    }; checks ${postDeploySmoke.summary?.passed ?? 0}/${postDeploySmoke.summary?.planned ?? 0} passed, ${
      postDeploySmoke.summary?.blocked ?? 0
    } blocked; local artifact ${localArtifactSmoke.status} ${
      localArtifactSmoke.summary?.passed ?? 0
    }/${localArtifactSmoke.summary?.planned ?? 0} passed.`,
  ),
  check(
    'product-optimization',
    productOptimizationReady,
    `Product optimizer is ${productOptimization.status}; completion ${
      productOptimization.productGates?.firstGameCompletion?.actual ?? 'n/a'
    } vs gate ${productOptimization.productGates?.firstGameCompletion?.gate ?? 'n/a'}; latest action ${
      productOptimization.actions?.[0]?.status ?? 'missing'
    }.`,
  ),
  check(
    'first-move-coach',
    firstMoveCoachReady,
    `First-move coach is ${firstMoveCoach.status}; enabled targets ${
      firstMoveCoach.summary?.enabledTargets ?? 'n/a'
    }; primary ${firstMoveCoach.summary?.primaryTargetId ?? 'none'}.`,
  ),
  check(
    'completion-loop',
    completionLoopReady,
    `Completion loop is ${completionLoop.status}; prompt ${
      completionLoop.promptPolicy?.status ?? 'missing'
    }; target ${completionLoop.target?.gameId ?? 'missing'}.`,
  ),
  check(
    'replay-loop',
    replayLoopReady,
    `Replay loop is ${replayLoop.status}; prompt ${
      replayLoop.promptPolicy?.status ?? 'missing'
    }; target ${replayLoop.target?.gameId ?? 'missing'}.`,
  ),
  check(
    'release-health',
    releaseHealth.status !== 'missing' &&
      releaseHealth.status !== 'blocked' &&
      releaseHealth.controls?.canPromoteWeb !== false,
    `Release health guard is ${releaseHealth.status}.`,
  ),
  check(
    'production-environment',
    environment.status !== 'missing',
    `Production environment status is ${environment.status}.`,
  ),
  check(
    'production-bootstrap',
    productionBootstrapReady,
    `Production bootstrap is ${productionBootstrap.status}; mode ${
      productionBootstrap.mode ?? 'missing'
    }; external blockers ${productionBootstrap.summary?.externalBlockers ?? 'n/a'}.`,
  ),
  check(
    'autonomous-operator',
    autonomousOperatorReady,
    `Autonomous operator is ${autonomousOperator.status}; selected ${
      autonomousOperator.selectedAction?.id ?? 'none'
    }; execution ${autonomousOperator.execution?.status ?? 'missing'}.`,
  ),
  check(
    'autonomous-operator-history',
    autonomousOperatorHistoryReady,
    `Autonomous operator history is ${autonomousOperatorHistory.status}; records ${
      autonomousOperatorHistory.summary?.totalRecords ?? 'n/a'
    }; executed ${autonomousOperatorHistory.summary?.executedRecords ?? 'n/a'}.`,
  ),
  check(
    'autonomous-cadence',
    autonomousCadenceReady,
    `Autonomous cadence is ${autonomousCadence.status}; Codex ${
      autonomousCadence.schedulers?.codexDesktop?.status ?? 'missing'
    }; GitHub ${autonomousCadence.schedulers?.githubActions?.status ?? 'missing'}.`,
  ),
  check(
    'autonomous-self-update',
    autonomousSelfUpdateReady,
    `Autonomous self-update is ${autonomousSelfUpdate.status}; safe pending ${
      autonomousSelfUpdate.pendingChanges?.safeCount ?? 'n/a'
    }; unsafe pending ${autonomousSelfUpdate.pendingChanges?.unsafeCount ?? 'n/a'}; remote push ${
      autonomousSelfUpdate.repository?.remotePushReady === true ? 'ready' : 'held'
    }.`,
  ),
  check(
    'objective-audit',
    objectiveAuditReady,
    `Objective audit is ${objectiveAudit.status}; met ${objectiveAudit.summary?.met ?? 'n/a'} / ${
      objectiveAudit.summary?.requirements ?? 'n/a'
    }; can complete ${objectiveAudit.completion?.canMarkGoalComplete ?? 'missing'}.`,
  ),
]

const monetizationChecks = [
  check(
    'first-game-completion',
    firstGameCompletion >= gates.monetization.minFirstGameCompletion,
    `First-game completion is ${Math.round(firstGameCompletion * 100)}%; gate is ${Math.round(
      gates.monetization.minFirstGameCompletion * 100,
    )}%.`,
  ),
  check(
    'replay-rate',
    replayRate >= gates.monetization.minReplayRate,
    `Replay rate is ${Math.round(replayRate * 100)}%; gate is ${Math.round(
      gates.monetization.minReplayRate * 100,
    )}%.`,
  ),
  check(
    'd1-retention',
    typeof d1Retention === 'number' && d1Retention >= gates.monetization.minD1Retention,
    typeof d1Retention === 'number'
      ? `D1 retention is ${Math.round(d1Retention * 100)}%; gate is ${Math.round(
          gates.monetization.minD1Retention * 100,
        )}%; source is ${retentionSource}.`
      : 'Day-1 retention is not connected yet.',
  ),
]

const storePackageChecks = [
  check(
    'store-listing',
    Boolean(
      storePackage.storeListing?.shortDescription &&
        storePackage.storeListing?.fullDescription &&
        storePackage.storeListing.shortDescription.length <= 80,
    ),
    'Generated store listing copy exists and fits Google Play short-description limits.',
  ),
  check(
    'store-listing-optimizer',
    storeListingOptimizationReady,
    `Store listing optimizer is ${storeListingOptimizer.status}; focus ${
      storeListingOptimizer.recommendation?.focusGameId ?? 'missing'
    }.`,
  ),
  check(
    'google-data-safety',
    storePackage.dataSafetyDraft?.googlePlay?.status === 'draft-ready',
    'Google Play data safety draft exists.',
  ),
  check(
    'apple-privacy-labels',
    storePackage.dataSafetyDraft?.appleAppPrivacy?.status === 'draft-ready',
    'Apple App Privacy label draft exists.',
  ),
  check(
    'native-packaging-path',
    storePackage.nativePackaging?.androidTwaManifest?.packageName &&
      storePackage.nativePackaging?.recommendedFirstNativePath,
    'Android TWA packaging draft exists while signing remains blocked.',
  ),
  check(
    'native-package-handoff',
    nativePackage.status !== 'missing' &&
      nativePackage.handoff?.twaManifestPath &&
      nativePackage.handoff?.bubblewrapConfigPath &&
      nativePackage.handoff?.assetLinksTemplatePath,
    `Android native handoff is ${nativePackage.status}.`,
  ),
  check(
    'android-signing-prep',
    androidSigning.status === 'signing-prepared' &&
      androidSigning.controls?.noSecretValuesInReports === true &&
      androidSigning.controls?.doesNotCommitKeystore === true &&
      Boolean(androidSigning.signing?.sha256CertFingerprint),
    `Android signing is ${androidSigning.status}; fingerprint ${
      androidSigning.signing?.sha256CertFingerprint ? 'available' : 'missing'
    }.`,
  ),
  check(
    'store-screenshots',
    storeScreenshotsReady,
    `Generated store screenshot assets are ${storeAssets.status}; ${screenshotAssets.length} screenshots attached.`,
  ),
  check(
    'store-compliance',
    storeCompliance.status === 'draft-ready-external-blockers' &&
      storeCompliance.contentRating?.googlePlay?.expectedRating === 'Everyone' &&
      storeCompliance.targetAudience?.directedToChildren === false &&
      (storeCompliance.adsAndMonetization?.adsEnabled === false ||
        storeCompliance.adsAndMonetization?.adDisclosureRequired === true),
    `Store compliance is ${storeCompliance.status}.`,
  ),
  check(
    'compliance-publication-pack',
    storePackage.compliancePublication?.publicPath === '/compliance.json' &&
      storePackage.compliancePublication?.controls?.postDeploySmokeRequired === true &&
      (storePackage.compliancePublication?.smokeChecks?.length ?? 0) >= 3,
    `Compliance publication is ${storePackage.compliancePublication?.status ?? 'missing'}.`,
  ),
]

const statusFromChecks = (checks, readyStatus) =>
  checks.every((item) => item.status === 'pass') ? readyStatus : 'blocked'

const payload = {
  generatedAt: new Date().toISOString(),
  environment: {
    status: environment.status,
    publicOrigin: environment.publicOrigin?.origin ?? null,
    publicOriginStatus: environment.publicOrigin?.status ?? 'missing',
    supportStatus: environment.support?.status ?? 'missing',
    analyticsStatus: environment.analytics?.status ?? 'missing',
  },
  repositoryChannel: {
    status: repositoryReadiness.status,
    repository: repositoryReadiness.repository?.target ?? null,
    insideWorkTree: repositoryReadiness.workspace?.insideWorkTree ?? false,
    workflowDispatchReady: repositoryReadiness.githubAutomation?.workflowDispatchReady ?? false,
    controls: repositoryReadiness.controls ?? {},
    checks: repositoryReadiness.checks ?? [],
    blockers: repositoryReadiness.blockers ?? [],
  },
  repositoryBootstrap: {
    status: repositoryBootstrap.status,
    mode: repositoryBootstrap.mode,
    workspace: repositoryBootstrap.workspace,
    repository: repositoryBootstrap.repository,
    controls: repositoryBootstrap.controls,
    helper: repositoryBootstrap.helper,
    actions: repositoryBootstrap.actions ?? [],
    blockers: repositoryBootstrap.blockers ?? [],
  },
  webPwa: {
    status: statusFromChecks(webChecks, 'ready-after-build'),
    required: gates.webPwa.required,
    checks: webChecks,
  },
  monetization: {
    status: statusFromChecks(monetizationChecks, 'ready-for-low-risk-test'),
    allowedEarlyTests: gates.monetization.allowedEarlyTests,
    blockedBeforeRetention: gates.monetization.blockedBeforeRetention,
    metrics: {
      gameViewed: totals.counts.game_viewed,
      gameStarted: totals.counts.game_started,
      firstGameCompletion: Math.round(firstGameCompletion * 1000) / 1000,
      replayRate: Math.round(replayRate * 1000) / 1000,
      d1Retention: typeof d1Retention === 'number' ? Math.round(d1Retention * 1000) / 1000 : null,
      source: analytics.sourceStatus.activeSource,
      retentionSource,
    },
    checks: monetizationChecks,
  },
  organicSeedLoop: {
    status: organicSeedLoop.status,
    sourceStatus: organicSeedLoop.sourceStatus,
    target: organicSeedLoop.target,
    runtimeSurface: organicSeedLoop.runtimeSurface,
    guardrails: organicSeedLoop.guardrails,
    missions: organicSeedLoop.missions ?? [],
    campaigns: (organicSeedLoop.campaigns ?? []).slice(0, 4),
  },
  retention: {
    status: retentionLoopReady ? 'ready-local-loop' : 'blocked',
    dailyChallenge: retentionLoop.dailyChallenge,
    metrics: retentionLoop.metrics ?? {},
    guardrails: retentionGuardrails,
    promptPolicy: retentionLoop.promptPolicy ?? {},
    returnIntentPolicy: retentionLoop.returnIntentPolicy ?? {},
    controls: retentionLoop.controls ?? {},
    missions: retentionMissions,
  },
  pwaInstall: {
    status: pwaInstallReady ? 'ready-browser-controlled' : 'blocked',
    channel: pwaInstallLoop.channel,
    metrics: pwaInstallLoop.metrics ?? {},
    promptPolicy: pwaInstallLoop.promptPolicy ?? {},
    publicInstallPage: pwaInstallLoop.publicInstallPage ?? {},
    guardrails: pwaInstallGuardrails,
  },
  performanceBudget: {
    status: performanceBudget.status,
    budgets: performanceBudget.budgets,
    initial: performanceBudget.initial,
    deferred: performanceBudget.deferred,
    controls: performanceBudget.controls,
    checks: performanceBudget.checks ?? [],
  },
  releaseCandidate: {
    status: releaseCandidate.status,
    candidateId: releaseCandidate.candidateId,
    target: releaseCandidate.target,
    summary: releaseCandidate.summary,
    integrity: {
      algorithm: releaseCandidate.integrity?.algorithm,
      aggregateHash: releaseCandidate.integrity?.aggregateHash,
      requiredFileChecks: releaseCandidate.integrity?.requiredFileChecks ?? [],
    },
    postDeploySmoke: releaseCandidate.postDeploySmoke ?? [],
    controls: releaseCandidate.controls,
    checks: releaseCandidate.checks ?? [],
  },
  postDeploySmoke: {
    status: postDeploySmoke.status,
    target: postDeploySmoke.target,
    sourceStatus: postDeploySmoke.sourceStatus,
    summary: postDeploySmoke.summary,
    localArtifactSmoke,
    controls: postDeploySmoke.controls,
    checks: postDeploySmokeChecks,
  },
  productOptimization: {
    status: productOptimization.status,
    sourceStatus: productOptimization.sourceStatus,
    productGates: productOptimization.productGates,
    controls: productOptimization.controls,
    actions: productOptimization.actions ?? [],
    nextActions: productOptimization.nextActions ?? [],
  },
  firstMoveCoach: {
    status: firstMoveCoach.status,
    sourceStatus: firstMoveCoach.sourceStatus,
    productGates: firstMoveCoach.productGates,
    summary: firstMoveCoach.summary,
    controls: firstMoveCoach.controls,
    telemetry: firstMoveCoach.telemetry,
    targets: (firstMoveCoach.targets ?? []).slice(0, 8),
  },
  completionLoop: {
    status: completionLoop.status,
    sourceStatus: completionLoop.sourceStatus,
    target: completionLoop.target,
    metrics: completionLoop.metrics,
    controls: completionLoop.controls,
    promptPolicy: completionLoop.promptPolicy,
    finishLinePolicy: completionLoop.finishLinePolicy,
    missions: completionLoop.missions ?? [],
  },
  replayLoop: {
    status: replayLoop.status,
    sourceStatus: replayLoop.sourceStatus,
    target: replayLoop.target,
    metrics: replayLoop.metrics,
    controls: replayLoop.controls,
    promptPolicy: replayLoop.promptPolicy,
    missions: replayLoop.missions ?? [],
  },
  productionBootstrap: {
    status: productionBootstrap.status,
    mode: productionBootstrap.mode,
    summary: productionBootstrap.summary,
    controls: productionBootstrap.controls,
    setupScript: productionBootstrap.setupScript,
    stages: productionBootstrap.stages ?? [],
    setupCommands: productionBootstrap.setupCommands ?? [],
    externalBlockers: productionBootstrap.externalBlockers ?? [],
  },
  autonomousOperator: {
    status: autonomousOperator.status,
    mode: autonomousOperator.mode,
    selectedAction: autonomousOperator.selectedAction,
    controls: autonomousOperator.controls,
    execution: autonomousOperator.execution,
    eligibleActionIds: autonomousOperator.eligibleActionIds ?? [],
    blockedActions: autonomousOperator.blockedActions ?? [],
  },
  autonomousOperatorHistory: {
    status: autonomousOperatorHistory.status,
    summary: autonomousOperatorHistory.summary,
    controls: autonomousOperatorHistory.controls,
    retention: autonomousOperatorHistory.retention,
    recentRecords: (autonomousOperatorHistory.records ?? []).slice(-5),
  },
  autonomousCadence: {
    status: autonomousCadence.status,
    cadence: autonomousCadence.cadence,
    schedulers: autonomousCadence.schedulers,
    commandPlan: autonomousCadence.commandPlan,
    controls: autonomousCadence.controls,
    freshnessPolicy: autonomousCadence.freshnessPolicy,
    artifactFreshness: autonomousCadence.artifactFreshness ?? [],
    checks: autonomousCadence.checks ?? [],
    blockers: autonomousCadence.blockers ?? [],
  },
  autonomousSelfUpdate: {
    status: autonomousSelfUpdate.status,
    repository: autonomousSelfUpdate.repository,
    pendingChanges: autonomousSelfUpdate.pendingChanges,
    commitPlan: autonomousSelfUpdate.commitPlan,
    controls: autonomousSelfUpdate.controls,
    checks: autonomousSelfUpdate.checks ?? [],
    blockers: autonomousSelfUpdate.blockers ?? [],
  },
  objectiveAudit: {
    status: objectiveAudit.status,
    summary: objectiveAudit.summary,
    controls: objectiveAudit.controls,
    completion: objectiveAudit.completion,
    requirements: objectiveAudit.requirements ?? [],
  },
  distribution: {
    googlePlay: {
      status: 'blocked',
      estimatedCostUsd: gates.googlePlay.oneTimeCostUsd,
      blockers: gates.googlePlay.required,
      storePackageStatus: statusFromChecks(storePackageChecks, 'draft-ready'),
      nativePackageStatus: nativePackage.status,
    },
    iosAppStore: {
      status: 'defer',
      estimatedCostUsd: gates.iosAppStore.annualCostUsd,
      blockers: gates.iosAppStore.required,
      storePackageStatus: statusFromChecks(storePackageChecks, 'draft-ready'),
    },
    storePackage: {
      status: statusFromChecks(storePackageChecks, 'draft-ready'),
      privacyPolicyPath: storePackage.privacyPolicy?.path,
      productionPrivacyUrlStatus: storePackage.privacyPolicy?.productionUrlStatus,
      compliancePublication: storePackage.compliancePublication,
      checks: storePackageChecks,
    },
    storeListingOptimizer: {
      status: storeListingOptimizer.status,
      recommendation: storeListingOptimizer.recommendation,
      copyGuardrails: storeListingOptimizer.copyGuardrails,
      leadScreenshotId: storeListingOptimizer.screenshotPriorities?.[0]?.id ?? null,
    },
    storeCompliance: {
      status: storeCompliance.status,
      contentRating: storeCompliance.contentRating,
      targetAudience: storeCompliance.targetAudience,
      adsAndMonetization: storeCompliance.adsAndMonetization,
      blockers: storeCompliance.blockers ?? [],
      checks: storeCompliance.checks ?? [],
    },
    nativePackage: {
      status: nativePackage.status,
      platform: nativePackage.platform,
      packageName: nativePackage.packageName,
      host: nativePackage.host,
      signing: nativePackage.signing,
      assetLinksStatus: nativePackage.assetLinks?.status,
      blockers: nativePackage.blockers ?? [],
      checks: nativePackage.checks ?? [],
    },
    androidSigning: {
      status: androidSigning.status,
      signing: androidSigning.signing,
      ciSecrets: androidSigning.ciSecrets,
      controls: androidSigning.controls,
      checks: androidSigning.checks ?? [],
    },
    iconAssets: {
      status: iconAssets.status,
      manifestIcons: iconAssets.manifestIcons ?? [],
      storeIcons: iconAssets.storeIcons ?? [],
      checks: iconFiles,
    },
  },
  promotion: {
    nextAction:
      statusFromChecks(webChecks, 'ready-after-build') === 'ready-after-build'
        ? 'Deploy web/PWA experiment when hosting credentials exist.'
        : 'Fix web/PWA blockers before external traffic.',
    storeRule: 'Do not package native apps until retention gates, privacy URL, and account credentials exist.',
  },
}

const report = [
  '# Production Readiness',
  '',
  `Generated: ${payload.generatedAt}`,
  '',
  '## Environment',
  '',
  `Status: ${payload.environment.status}`,
  `Public origin: ${payload.environment.publicOrigin ?? 'missing'}`,
  `Analytics: ${payload.environment.analyticsStatus}`,
  '',
  '## Repository Channel',
  '',
  `Status: ${payload.repositoryChannel.status}`,
  `Repository: ${payload.repositoryChannel.repository ?? 'missing'}`,
  `Git worktree: ${payload.repositoryChannel.insideWorkTree}`,
  `Workflow dispatch ready: ${payload.repositoryChannel.workflowDispatchReady}`,
  ...(payload.repositoryChannel.checks ?? []).map(
    (item) => `- ${item.status}: repository-${item.id} - ${item.detail}`,
  ),
  '',
  '## Repository Bootstrap',
  '',
  `Status: ${payload.repositoryBootstrap.status}`,
  `Mode: ${payload.repositoryBootstrap.mode ?? 'missing'}`,
  `Helper: ${payload.repositoryBootstrap.helper?.path ?? 'missing'}`,
  `Local git: ${payload.repositoryBootstrap.workspace?.after?.insideWorkTree === true}`,
  ...(payload.repositoryBootstrap.actions ?? []).map(
    (item) => `- ${item.status}: repo-bootstrap-${item.id} - ${item.detail}`,
  ),
  '',
  '## Web/PWA',
  '',
  `Status: ${payload.webPwa.status}`,
  ...payload.webPwa.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
  '## Monetization',
  '',
  `Status: ${payload.monetization.status}`,
  ...payload.monetization.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
  '## Organic Seed Loop',
  '',
  `Status: ${payload.organicSeedLoop.status}`,
  `Target: ${payload.organicSeedLoop.target?.gameId ?? 'missing'}`,
  `Surface: ${payload.organicSeedLoop.runtimeSurface?.surface ?? 'missing'}`,
  ...payload.organicSeedLoop.missions.map((mission) => `- ${mission.status}: organic-${mission.id} - ${mission.event}`),
  '',
  '## Retention Loop',
  '',
  `Status: ${payload.retention.status}`,
  `Daily challenge: ${payload.retention.dailyChallenge?.gameId ?? 'missing'}`,
  `Return prompt: ${payload.retention.promptPolicy?.status ?? 'missing'} (${payload.retention.promptPolicy?.surface ?? 'missing'})`,
  `Return intent: ${payload.retention.returnIntentPolicy?.status ?? 'missing'} (${payload.retention.returnIntentPolicy?.surface ?? 'missing'})`,
  ...payload.retention.missions.map((mission) => `- ${mission.status}: ${mission.id} - ${mission.event}`),
  '',
  '## PWA Install Loop',
  '',
  `Status: ${payload.pwaInstall.status}`,
  `Prompt surface: ${payload.pwaInstall.promptPolicy?.surface ?? 'missing'}`,
  `Installs: ${payload.pwaInstall.metrics?.installed ?? 0}`,
  '',
  '## Performance Budget',
  '',
  `Status: ${payload.performanceBudget.status}`,
  `Initial JS: ${payload.performanceBudget.initial?.jsKb ?? 'n/a'} KB (${payload.performanceBudget.initial?.gzipKb ?? 'n/a'} KB gzip)`,
  `Deferred game chunk: ${payload.performanceBudget.deferred?.gameChunk?.file ?? 'missing'}`,
  ...(payload.performanceBudget.checks ?? []).map(
    (item) => `- ${item.status}: performance-${item.id} - ${item.detail}`,
  ),
  '',
  '## Release Candidate',
  '',
  `Status: ${payload.releaseCandidate.status}`,
  `Candidate: ${payload.releaseCandidate.candidateId ?? 'missing'}`,
  `Files: ${payload.releaseCandidate.summary?.totalFiles ?? 'n/a'}`,
  `Aggregate SHA-256: ${payload.releaseCandidate.integrity?.aggregateHash ?? 'missing'}`,
  ...(payload.releaseCandidate.checks ?? []).map(
    (item) => `- ${item.status}: release-${item.id} - ${item.detail}`,
  ),
  '',
  '## Post-Deploy Smoke',
  '',
  `Status: ${payload.postDeploySmoke.status}`,
  `Origin: ${payload.postDeploySmoke.target?.origin ?? 'missing'}`,
  `Candidate: ${payload.postDeploySmoke.target?.candidateId ?? 'missing'}`,
  `Checks: ${payload.postDeploySmoke.summary?.passed ?? 0}/${payload.postDeploySmoke.summary?.planned ?? 0} passed (${payload.postDeploySmoke.summary?.blocked ?? 0} blocked)`,
  `Local artifact: ${payload.postDeploySmoke.localArtifactSmoke?.status ?? 'missing'} (${payload.postDeploySmoke.localArtifactSmoke?.summary?.passed ?? 0}/${payload.postDeploySmoke.localArtifactSmoke?.summary?.planned ?? 0} passed)`,
  ...(payload.postDeploySmoke.checks ?? []).map(
    (item) => `- ${item.status}: smoke-${item.id} - ${item.detail}`,
  ),
  '',
  '## Product Optimization',
  '',
  `Status: ${payload.productOptimization.status}`,
  `Completion: ${payload.productOptimization.productGates?.firstGameCompletion?.actual ?? 'n/a'} / ${payload.productOptimization.productGates?.firstGameCompletion?.gate ?? 'n/a'}`,
  `Replay: ${payload.productOptimization.productGates?.replayRate?.actual ?? 'n/a'} / ${payload.productOptimization.productGates?.replayRate?.gate ?? 'n/a'}`,
  ...payload.productOptimization.actions.map(
    (item) => `- ${item.status}: product-${item.id} - ${item.reason}`,
  ),
  '',
  '## First Move Coach',
  '',
  `Status: ${payload.firstMoveCoach.status}`,
  `Enabled targets: ${payload.firstMoveCoach.summary?.enabledTargets ?? 'n/a'}`,
  `Primary target: ${payload.firstMoveCoach.summary?.primaryTargetId ?? 'none'}`,
  ...(payload.firstMoveCoach.targets ?? []).map(
    (item) => `- ${item.enabled ? 'enabled' : 'monitor'}: coach-${item.gameId} - ${item.sourceReason}`,
  ),
  '',
  '## Completion Loop',
  '',
  `Status: ${payload.completionLoop.status}`,
  `Target: ${payload.completionLoop.target?.gameId ?? 'missing'}`,
  `Prompt: ${payload.completionLoop.promptPolicy?.status ?? 'missing'} (${payload.completionLoop.promptPolicy?.surface ?? 'missing'})`,
  `Finish line: ${payload.completionLoop.finishLinePolicy?.status ?? 'missing'} (${payload.completionLoop.finishLinePolicy?.surface ?? 'missing'})`,
  ...(payload.completionLoop.missions ?? []).map(
    (mission) => `- ${mission.status}: completion-${mission.id} - ${mission.event}`,
  ),
  '',
  '## Replay Loop',
  '',
  `Status: ${payload.replayLoop.status}`,
  `Target: ${payload.replayLoop.target?.gameId ?? 'missing'}`,
  `Prompt: ${payload.replayLoop.promptPolicy?.status ?? 'missing'} (${payload.replayLoop.promptPolicy?.surface ?? 'missing'})`,
  ...(payload.replayLoop.missions ?? []).map(
    (mission) => `- ${mission.status}: replay-${mission.id} - ${mission.event}`,
  ),
  '',
  '## Production Bootstrap',
  '',
  `Status: ${payload.productionBootstrap.status}`,
  `Mode: ${payload.productionBootstrap.mode ?? 'missing'}`,
  `Setup script: ${payload.productionBootstrap.setupScript?.path ?? 'missing'}`,
  ...(payload.productionBootstrap.stages ?? []).map(
    (stage) => `- ${stage.status}: bootstrap-${stage.id} - ${stage.evidence}`,
  ),
  '',
  '## Autonomous Operator',
  '',
  `Status: ${payload.autonomousOperator.status}`,
  `Mode: ${payload.autonomousOperator.mode ?? 'missing'}`,
  `Selected action: ${payload.autonomousOperator.selectedAction?.id ?? 'none'}`,
  `Execution: ${payload.autonomousOperator.execution?.status ?? 'missing'}`,
  '',
  '## Autonomous Operator History',
  '',
  `Status: ${payload.autonomousOperatorHistory.status}`,
  `Records: ${payload.autonomousOperatorHistory.summary?.totalRecords ?? 'n/a'}`,
  `Executed: ${payload.autonomousOperatorHistory.summary?.executedRecords ?? 'n/a'}`,
  '',
  '## Autonomous Cadence',
  '',
  `Status: ${payload.autonomousCadence.status}`,
  `Cadence: ${payload.autonomousCadence.cadence ?? 'missing'}`,
  `Codex app: ${payload.autonomousCadence.schedulers?.codexDesktop?.status ?? 'missing'}`,
  `GitHub Actions: ${payload.autonomousCadence.schedulers?.githubActions?.status ?? 'missing'}`,
  `Freshness: ${payload.autonomousCadence.freshnessPolicy?.status ?? 'missing'}; stale artifacts ${
    payload.autonomousCadence.freshnessPolicy?.staleArtifactCount ?? 'missing'
  }`,
  ...(payload.autonomousCadence.checks ?? []).map(
    (item) => `- ${item.status}: cadence-${item.id} - ${item.detail}`,
  ),
  '',
  '## Autonomous Self Update',
  '',
  `Status: ${payload.autonomousSelfUpdate.status}`,
  `Workflow: ${payload.autonomousSelfUpdate.commitPlan?.workflow ?? 'missing'}`,
  `Safe pending: ${payload.autonomousSelfUpdate.pendingChanges?.safeCount ?? 'n/a'}`,
  `Unsafe pending: ${payload.autonomousSelfUpdate.pendingChanges?.unsafeCount ?? 'n/a'}`,
  `Remote push ready: ${payload.autonomousSelfUpdate.repository?.remotePushReady ?? false}`,
  ...(payload.autonomousSelfUpdate.checks ?? []).map(
    (item) => `- ${item.status}: self-update-${item.id} - ${item.detail}`,
  ),
  '',
  '## Objective Audit',
  '',
  `Status: ${payload.objectiveAudit.status}`,
  `Met: ${payload.objectiveAudit.summary?.met ?? 'n/a'} / ${payload.objectiveAudit.summary?.requirements ?? 'n/a'}`,
  `Can mark complete: ${payload.objectiveAudit.completion?.canMarkGoalComplete ?? 'missing'}`,
  '',
  '## Distribution',
  '',
  `Store package: ${payload.distribution.storePackage.status}`,
  ...payload.distribution.storePackage.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
  `Store listing optimizer: ${payload.distribution.storeListingOptimizer.status}`,
  `- focus: ${payload.distribution.storeListingOptimizer.recommendation?.focusGameId ?? 'missing'}`,
  `- lead screenshot: ${payload.distribution.storeListingOptimizer.leadScreenshotId ?? 'missing'}`,
  '',
  `Store compliance: ${payload.distribution.storeCompliance.status}`,
  ...(payload.distribution.storeCompliance.checks ?? []).map(
    (item) => `- ${item.status}: compliance-${item.id} - ${item.detail}`,
  ),
  '',
  `Native package: ${payload.distribution.nativePackage.status}`,
  ...(payload.distribution.nativePackage.checks ?? []).map(
    (item) => `- ${item.status}: native-${item.id} - ${item.detail}`,
  ),
  '',
  `Android signing: ${payload.distribution.androidSigning.status}`,
  `- fingerprint: ${payload.distribution.androidSigning.signing?.sha256CertFingerprint ?? 'missing'}`,
  `- local secrets configured: ${payload.distribution.androidSigning.ciSecrets?.configuredLocally ?? false}`,
  '',
  `Icon assets: ${payload.distribution.iconAssets.status}`,
  ...(payload.distribution.iconAssets.manifestIcons ?? []).map(
    (icon) => `- manifest icon: ${icon.src} (${icon.sizes}, ${icon.purpose})`,
  ),
  '',
  `- Google Play: ${payload.distribution.googlePlay.status}, $${payload.distribution.googlePlay.estimatedCostUsd} cost gate.`,
  `- iOS App Store: ${payload.distribution.iosAppStore.status}, $${payload.distribution.iosAppStore.estimatedCostUsd}/year cost gate.`,
  '',
  '## Promotion Rule',
  '',
  payload.promotion.storeRule,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputReportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(outputReportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputReportPath)}`)
