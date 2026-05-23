import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const fail = (message) => {
  console.error(message)
  process.exitCode = 1
}
const readJson = async (filePath) => JSON.parse(await readFile(path.join(root, filePath), 'utf8'))
const readText = async (filePath) => readFile(path.join(root, filePath), 'utf8')

const [
  sync,
  publicRepoSecurityAudit,
  liveSiteMonitor,
  performanceBudget,
  releaseCandidate,
  pwaInstallLoop,
  storePackage,
  storeAssets,
  storeListingOptimizer,
  storeCompliance,
  postDeploySmoke,
  repositoryReadiness,
  repositoryBootstrap,
  deploymentPlan,
  productionBootstrap,
  productionActivation,
  productionBlockerHandoff,
  ownerUnlockBrief,
  publicOwnerUnlockBrief,
  productionMeasurementStatus,
  playerEvidenceWatchdog,
  publicMeasurementStatus,
  productionReadiness,
  objectiveAudit,
  ownerLoop,
  autonomousOperator,
  autonomousOperatorHistory,
  packageJson,
  workflow,
  verifyAutonomySource,
] = await Promise.all([
  readJson('data/post-deploy-artifact-sync.json'),
  readJson('data/public-repo-security-audit.json'),
  readJson('data/live-site-monitor.json'),
  readJson('data/performance-budget.json'),
  readJson('data/release-candidate.json'),
  readJson('data/pwa-install-loop.json'),
  readJson('data/store-package.json'),
  readJson('data/store-assets.json'),
  readJson('data/store-listing-optimizer.json'),
  readJson('data/store-compliance.json'),
  readJson('data/post-deploy-smoke.json'),
  readJson('data/repository-readiness.json'),
  readJson('data/repository-bootstrap.json'),
  readJson('data/deployment-plan.json'),
  readJson('data/production-bootstrap.json'),
  readJson('data/production-activation.json'),
  readJson('data/production-blocker-handoff.json'),
  readJson('data/owner-unlock-brief.json'),
  readJson('public/owner-unlock-brief.json'),
  readJson('data/production-measurement-status.json'),
  readJson('data/player-evidence-watchdog.json'),
  readJson('public/measurement-status.json'),
  readJson('data/production-readiness.json'),
  readJson('data/objective-audit.json'),
  readJson('data/autonomous-owner-loop.json'),
  readJson('data/autonomous-operator.json'),
  readJson('data/autonomous-operator-history.json'),
  readJson('package.json'),
  readText('.github/workflows/post-deploy-evidence-sync.yml'),
  readText('scripts/verify-autonomy.mjs'),
])

const postDeployReadinessSyncScript = packageJson.scripts?.['autonomous:post-deploy-readiness-sync'] ?? ''

if (
  publicRepoSecurityAudit.status !== 'public-repo-security-ready' ||
  publicRepoSecurityAudit.summary?.highConfidenceSecretFindings !== 0 ||
  publicRepoSecurityAudit.summary?.trackedSensitiveFiles !== 0 ||
  publicRepoSecurityAudit.summary?.publicWorkflowRisks !== 0 ||
  publicRepoSecurityAudit.controls?.publicIssueTriggerSecretsBlocked !== true ||
  publicRepoSecurityAudit.controls?.publicIssueTriggerCommitsBlocked !== true ||
  publicRepoSecurityAudit.controls?.publicIssueWorkflowReadOnly !== true
) {
  fail('Post-deploy evidence sync must preserve the public repository security audit before trusting synced production evidence.')
}

if (
  sync.status !== 'post-deploy-artifact-sync-passed' ||
  sync.workflow?.workflowFile !== 'web-pwa-deploy.yml' ||
  sync.workflow?.artifactName !== 'post-deploy-smoke' ||
  typeof sync.workflow?.runId !== 'number' ||
  !/^[a-f0-9]{40}$/.test(sync.workflow?.headSha ?? '') ||
  sync.artifact?.status !== 'post-deploy-smoke-passed' ||
  sync.artifact?.target?.strictManifestComparison !== true ||
  sync.artifact?.summary?.passed !== sync.artifact?.summary?.planned ||
  sync.artifact?.summary?.failed !== 0 ||
  sync.artifact?.summary?.blocked !== 0 ||
  sync.validation?.artifactPassed !== true ||
  sync.validation?.artifactStrict !== true ||
  sync.validation?.artifactControlsReady !== true ||
  sync.validation?.artifactSummaryPassed !== true ||
  sync.validation?.liveMatchesArtifact !== true ||
  sync.live?.matchesArtifact !== true ||
  sync.live?.candidateId !== sync.artifact?.target?.candidateId ||
  sync.live?.aggregateHash !== sync.artifact?.target?.aggregateHash ||
  sync.controls?.zeroPaidSpend !== true ||
  sync.controls?.noWorkflowDispatch !== true ||
  sync.controls?.noStoreSubmission !== true ||
  sync.controls?.noRevenueEnablement !== true ||
  sync.controls?.readOnlyGithubArtifactDownload !== true ||
  sync.controls?.readOnlyHttpChecks !== true ||
  sync.controls?.strictManifestComparisonRequired !== true ||
  sync.controls?.separateFromLocalCandidate !== true ||
  sync.controls?.noPostDeployReleaseRefresh !== true
) {
  fail('Post-deploy evidence sync must prove strict live Pages smoke without enabling paid, store, revenue, or workflow mutation.')
}

const liveManifestCheck = liveSiteMonitor.checks?.find((check) => check.id === 'release-candidate-manifest-live')

if (
  liveSiteMonitor.status !== 'live-site-monitor-passed' ||
  liveSiteMonitor.sourceStatus?.postDeployArtifactSync !== sync.status ||
  liveSiteMonitor.summary?.failed !== 0 ||
  liveSiteMonitor.summary?.blocked !== 0 ||
  liveSiteMonitor.summary?.passed !== liveSiteMonitor.summary?.planned ||
  liveSiteMonitor.summary?.liveCandidateId !== sync.live?.candidateId ||
  liveSiteMonitor.summary?.syncedCandidateId !== sync.live?.candidateId ||
  liveSiteMonitor.summary?.liveMatchesSyncedDeploy !== true ||
  liveManifestCheck?.manifest?.matchesSyncedDeploy !== true ||
  liveSiteMonitor.controls?.zeroPaidSpend !== true ||
  liveSiteMonitor.controls?.readOnlyHttpChecks !== true ||
  liveSiteMonitor.controls?.noMutation !== true ||
  liveSiteMonitor.controls?.noCookiesOrCredentials !== true ||
  liveSiteMonitor.controls?.strictSyncedManifestComparison !== true
) {
  fail('Live site monitor must verify the synced public PWA and release manifest with read-only zero-spend checks.')
}

if (
  packageJson.scripts?.['autonomous:verify-post-deploy-sync'] !==
    'node scripts/verify-post-deploy-evidence-sync.mjs' ||
  postDeployReadinessSyncScript.length === 0
) {
  fail('package.json must expose the post-deploy evidence sync verifier and readiness refresh command.')
}

if (
  !verifyAutonomySource.includes('strictSyncedDeployEvidenceReady') ||
  !verifyAutonomySource.includes('performanceEntryScriptEvidenceCurrent') ||
  !verifyAutonomySource.includes('releaseCandidateDistEvidenceCurrent')
) {
  fail('verify-autonomy must accept strict post-deploy synced evidence when ignored local dist is stale.')
}

const requiredReadinessRefreshCommands = [
  'autonomous:security-audit',
  'autonomous:env',
  'autonomous:store-package',
  'npm run build',
  'autonomous:store-assets',
  'autonomous:pwa-install',
  'autonomous:store-listing-optimize',
  'autonomous:store-compliance',
  'autonomous:performance',
  'autonomous:release-candidate',
  'autonomous:post-deploy-smoke',
  'autonomous:live-monitor',
  'autonomous:repo-readiness',
  'autonomous:repo-bootstrap',
  'autonomous:deploy-plan',
  'autonomous:bootstrap',
  'autonomous:activate-production',
  'autonomous:blocker-handoff',
  'autonomous:measurement-status',
  'node scripts/production-readiness.mjs',
  'autonomous:owner-loop',
  'autonomous:operator',
  'autonomous:objective-audit',
]

for (const command of requiredReadinessRefreshCommands) {
  if (!postDeployReadinessSyncScript.includes(command)) {
    fail(`autonomous:post-deploy-readiness-sync must refresh ${command} evidence after deployed artifact import.`)
  }
}

const finalDeployPlanRefreshIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:deploy-plan')
const finalReadinessRefreshIndex = postDeployReadinessSyncScript.lastIndexOf('node scripts/production-readiness.mjs')
const finalEnvIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:env')
const finalStorePackageIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:store-package')
const finalStoreAssetsIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:store-assets')
const finalPwaInstallIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:pwa-install')
const finalStoreListingOptimizeIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:store-listing-optimize')
const finalStoreComplianceIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:store-compliance')
const finalRepoReadinessIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:repo-readiness')
const finalRepoBootstrapIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:repo-bootstrap')
const finalUnlockRunnerIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:unlock-runner')
const finalMeasurementStatusIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:measurement-status')
const finalPostDeploySmokeIndex = postDeployReadinessSyncScript.lastIndexOf(
  'autonomous:post-deploy-smoke',
  finalRepoReadinessIndex,
)
const finalObjectiveAuditIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:objective-audit')
const finalOwnerLoopIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:owner-loop')
const finalOperatorIndex = postDeployReadinessSyncScript.lastIndexOf('autonomous:operator')
const ownerLoopBeforeFinalOperatorIndex = postDeployReadinessSyncScript.lastIndexOf(
  'autonomous:owner-loop',
  finalOperatorIndex,
)
const deployPlanBeforeFinalRepoReadinessIndex = postDeployReadinessSyncScript.lastIndexOf(
  'autonomous:deploy-plan',
  finalRepoReadinessIndex,
)
const deployPlanAfterFinalRepoBootstrapIndex = postDeployReadinessSyncScript.indexOf(
  'autonomous:deploy-plan',
  finalRepoBootstrapIndex,
)

if (deployPlanBeforeFinalRepoReadinessIndex === -1) {
  fail('autonomous:post-deploy-readiness-sync must refresh the deployment plan before the final repository readiness check.')
}

if (
  finalEnvIndex === -1 ||
  finalStorePackageIndex < finalEnvIndex ||
  finalStoreAssetsIndex < finalStorePackageIndex ||
  finalPwaInstallIndex < finalStoreAssetsIndex ||
  finalStoreListingOptimizeIndex < finalPwaInstallIndex ||
  finalStoreComplianceIndex < finalStoreListingOptimizeIndex ||
  finalStoreComplianceIndex > finalReadinessRefreshIndex
) {
  fail('autonomous:post-deploy-readiness-sync must refresh env, PWA install, store package/assets/listing, and compliance before final readiness.')
}

if (finalPostDeploySmokeIndex < deployPlanBeforeFinalRepoReadinessIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh post-deploy smoke after the final pre-repository deployment plan.')
}

if (finalRepoBootstrapIndex < finalRepoReadinessIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh repository bootstrap after the final repository readiness check.')
}

if (
  deployPlanAfterFinalRepoBootstrapIndex === -1 ||
  deployPlanAfterFinalRepoBootstrapIndex < finalRepoBootstrapIndex ||
  deployPlanAfterFinalRepoBootstrapIndex > finalReadinessRefreshIndex
) {
  fail('autonomous:post-deploy-readiness-sync must refresh deployment plan after final repository bootstrap and before final readiness.')
}

if (finalMeasurementStatusIndex < finalUnlockRunnerIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh production measurement status after the final blocker/unlock evidence.')
}

if (finalMeasurementStatusIndex > finalReadinessRefreshIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh production measurement status before final readiness.')
}

if (ownerLoopBeforeFinalOperatorIndex < deployPlanAfterFinalRepoBootstrapIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh owner loop after final repository/deployment evidence.')
}

if (finalOperatorIndex < ownerLoopBeforeFinalOperatorIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh operator after the final owner loop.')
}

if (ownerLoopBeforeFinalOperatorIndex < finalObjectiveAuditIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh owner loop after final objective audit before the final operator.')
}

if (finalOwnerLoopIndex < finalOperatorIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh owner loop after the final operator history update.')
}

if (finalReadinessRefreshIndex < finalRepoBootstrapIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh production readiness after the final repository bootstrap check.')
}

if (finalReadinessRefreshIndex < finalOperatorIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh final production readiness after final owner/operator evidence.')
}

if (finalReadinessRefreshIndex < finalOwnerLoopIndex) {
  fail('autonomous:post-deploy-readiness-sync must refresh final production readiness after the final owner loop.')
}

if (finalDeployPlanRefreshIndex < finalReadinessRefreshIndex) {
  fail('autonomous:post-deploy-readiness-sync must regenerate the deployment plan after the final readiness refresh.')
}

if (
  JSON.stringify(publicOwnerUnlockBrief) !== JSON.stringify(ownerUnlockBrief) ||
  JSON.stringify(ownerUnlockBrief.brief) !== JSON.stringify(productionBlockerHandoff.ownerUnlockBrief) ||
  ownerUnlockBrief.setup?.workflowDispatchRequiresRunWorkflows !== true ||
  ownerUnlockBrief.controls?.noSecretValuesStored !== true ||
  ownerUnlockBrief.controls?.setupPrintModeHasNoGithubMutation !== true
) {
  fail('Post-deploy evidence sync must preserve the generated owner unlock brief as a public secretless handoff.')
}

if (
  !workflow.includes("workflows: ['Web PWA Deploy']") ||
  !workflow.includes('actions: read') ||
  !workflow.includes('contents: write') ||
  !workflow.includes('npm run autonomous:post-deploy-artifact-sync -- --run-id="${POST_DEPLOY_RUN_ID}" --assert') ||
  !workflow.includes('npm run autonomous:live-monitor') ||
  !workflow.includes('npm run autonomous:post-deploy-readiness-sync') ||
  !workflow.includes('GH_TOKEN: ${{ github.token }}') ||
  !workflow.includes('GITHUB_REPOSITORY: ${{ github.repository }}') ||
  !workflow.includes('GITHUB_TOKEN: ${{ github.token }}') ||
  !workflow.includes('AGL_PUBLIC_ORIGIN: ${{ vars.AGL_PUBLIC_ORIGIN }}') ||
  !workflow.includes('npm run autonomous:verify-post-deploy-sync') ||
  !workflow.includes('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT') ||
  !workflow.includes('data/post-deploy-artifact-sync.json') ||
  !workflow.includes('src/data/postDeployArtifactSync.ts') ||
  !workflow.includes('reports/post-deploy-artifact-sync-latest.md') ||
  !workflow.includes('data/public-repo-security-audit.json') ||
  !workflow.includes('src/data/publicRepoSecurityAudit.ts') ||
  !workflow.includes('reports/public-repo-security-audit-latest.md') ||
  !workflow.includes('data/performance-budget.json') ||
  !workflow.includes('src/data/performanceBudget.ts') ||
  !workflow.includes('reports/performance-budget-latest.md') ||
  !workflow.includes('data/release-candidate.json') ||
  !workflow.includes('src/data/releaseCandidate.ts') ||
  !workflow.includes('reports/release-candidate-latest.md') ||
  !workflow.includes('data/pwa-install-loop.json') ||
  !workflow.includes('src/data/pwaInstallLoop.ts') ||
  !workflow.includes('reports/pwa-install-loop-latest.md') ||
  !workflow.includes('public/install.html') ||
  !workflow.includes('data/store-package.json') ||
  !workflow.includes('reports/store-package-latest.md') ||
  !workflow.includes('public/privacy.html') ||
  !workflow.includes('public/support.html') ||
  !workflow.includes('public/compliance.json') ||
  !workflow.includes('data/store-assets.json') ||
  !workflow.includes('src/data/storeAssets.ts') ||
  !workflow.includes('reports/store-assets-latest.md') ||
  !workflow.includes('public/store-assets/screenshots') ||
  !workflow.includes('data/store-listing-optimizer.json') ||
  !workflow.includes('src/data/storeListingOptimizer.ts') ||
  !workflow.includes('reports/store-listing-optimizer-latest.md') ||
  !workflow.includes('data/store-compliance.json') ||
  !workflow.includes('src/data/storeCompliance.ts') ||
  !workflow.includes('reports/store-compliance-latest.md') ||
  !workflow.includes('data/post-deploy-smoke.json') ||
  !workflow.includes('src/data/postDeploySmoke.ts') ||
  !workflow.includes('reports/post-deploy-smoke-latest.md') ||
  !workflow.includes('data/live-site-monitor.json') ||
  !workflow.includes('src/data/liveSiteMonitor.ts') ||
  !workflow.includes('reports/live-site-monitor-latest.md') ||
  !workflow.includes('data/repository-readiness.json') ||
  !workflow.includes('src/data/repositoryReadiness.ts') ||
  !workflow.includes('reports/repository-readiness-latest.md') ||
  !workflow.includes('data/repository-bootstrap.json') ||
  !workflow.includes('src/data/repositoryBootstrap.ts') ||
  !workflow.includes('reports/repository-bootstrap-latest.md') ||
  !workflow.includes('ops/github/bootstrap-repository.sh') ||
  !workflow.includes('data/deployment-plan.json') ||
  !workflow.includes('src/data/deploymentPlan.ts') ||
  !workflow.includes('reports/deployment-plan-latest.md') ||
  !workflow.includes('data/production-bootstrap.json') ||
  !workflow.includes('src/data/productionBootstrap.ts') ||
  !workflow.includes('reports/production-bootstrap-latest.md') ||
  !workflow.includes('ops/github/setup-production.sh') ||
  !workflow.includes('ops/github/README.md') ||
  !workflow.includes('data/production-activation.json') ||
  !workflow.includes('src/data/productionActivation.ts') ||
  !workflow.includes('reports/production-activation-latest.md') ||
  !workflow.includes('data/production-blocker-handoff.json') ||
  !workflow.includes('src/data/productionBlockerHandoff.ts') ||
  !workflow.includes('reports/production-blocker-handoff-latest.md') ||
  !workflow.includes('data/owner-unlock-brief.json') ||
  !workflow.includes('public/owner-unlock-brief.json') ||
  !workflow.includes('reports/owner-unlock-brief-latest.md') ||
  !workflow.includes('data/production-measurement-status.json') ||
  !workflow.includes('src/data/productionMeasurementStatus.ts') ||
  !workflow.includes('public/measurement-status.html') ||
  !workflow.includes('public/measurement-status.json') ||
  !workflow.includes('public/analytics-unlock.html') ||
  !workflow.includes('public/analytics-unlock.json') ||
  !workflow.includes('reports/production-measurement-status-latest.md') ||
  !workflow.includes('data/player-evidence-watchdog.json') ||
  !workflow.includes('src/data/playerEvidenceWatchdog.ts') ||
  !workflow.includes('reports/player-evidence-watchdog-latest.md') ||
  !workflow.includes('data/production-readiness.json') ||
  !workflow.includes('reports/production-readiness-latest.md') ||
  !workflow.includes('data/objective-audit.json') ||
  !workflow.includes('src/data/objectiveAudit.ts') ||
  !workflow.includes('reports/objective-audit-latest.md') ||
  !workflow.includes('data/autonomous-operator.json') ||
  !workflow.includes('src/data/autonomousOperator.ts') ||
  !workflow.includes('reports/autonomous-operator-latest.md') ||
  !workflow.includes('data/autonomous-operator-history.json') ||
  !workflow.includes('src/data/autonomousOperatorHistory.ts') ||
  !workflow.includes('reports/autonomous-operator-history-latest.md') ||
  !workflow.includes('data/autonomous-owner-loop.json') ||
  !workflow.includes('src/data/autonomousOwnerLoop.ts') ||
  !workflow.includes('reports/autonomous-owner-loop-latest.md')
) {
  fail('Post-deploy evidence sync workflow must import strict deployed smoke evidence and refresh dependent owner evidence.')
}

const forbiddenRefreshCommands = [
  'node scripts/verify-autonomy.mjs',
]

for (const command of forbiddenRefreshCommands) {
  if (workflow.includes(command) || postDeployReadinessSyncScript.includes(command)) {
    fail(`Post-deploy evidence sync must not run ${command}; that would create a new undeployed candidate during evidence import.`)
  }
}

if (
  performanceBudget.status !== 'performance-budget-ready' ||
  performanceBudget.controls?.phaserDeferredFromInitialShell !== true ||
  releaseCandidate.status !== 'release-candidate-ready' ||
  releaseCandidate.controls?.contentHashesRecorded !== true ||
  pwaInstallLoop.status !== 'pwa-install-loop-ready' ||
  storePackage.status !== 'store-package-ready' ||
  storePackage.storeListing?.source !== 'store-listing-optimizer' ||
  storeAssets.status !== 'screenshots-ready' ||
  (storeAssets.screenshots?.length ?? 0) < 4 ||
  storeListingOptimizer.status !== 'store-listing-optimizer-ready' ||
  storeListingOptimizer.recommendation?.focusGameId !== storePackage.launchCandidate?.id ||
  storeCompliance.status !== 'draft-ready-external-blockers' ||
  storeCompliance.launchCandidate?.id !== storePackage.launchCandidate?.id ||
  !['blocked-missing-origin', 'post-deploy-smoke-passed', 'post-deploy-smoke-observed-live'].includes(
    postDeploySmoke.status,
  ) ||
  postDeploySmoke.target?.candidateId !== releaseCandidate.candidateId ||
  postDeploySmoke.target?.aggregateHash !== releaseCandidate.integrity?.aggregateHash ||
  repositoryReadiness.status !== 'repository-channel-ready' ||
  repositoryReadiness.controls?.noGitMutation !== true ||
  repositoryReadiness.controls?.noWorkflowDispatch !== true ||
  repositoryBootstrap.status !== 'repository-bootstrap-ready' ||
  repositoryBootstrap.controls?.zeroPaidSpend !== true ||
  repositoryBootstrap.controls?.noWorkflowDispatch !== true ||
  deploymentPlan.status !== 'ready-for-pages' ||
  deploymentPlan.repositoryChannel?.status !== repositoryReadiness.status ||
  productionBootstrap.status !== 'production-bootstrap-ready' ||
  productionBootstrap.controls?.zeroSpendGuard !== true ||
  productionBootstrap.controls?.noPaidResourcesCreated !== true ||
  productionActivation.controls?.zeroPaidSpend !== true ||
  productionActivation.controls?.dryRunByDefault !== true ||
  !['activation-ready', 'activation-waiting-for-credentials', 'activation-applied'].includes(productionActivation.status) ||
  !['handoff-waiting-on-owner-inputs', 'handoff-clear'].includes(productionBlockerHandoff.status) ||
  productionBlockerHandoff.sourceStatus?.postDeployArtifactSync !== sync.status ||
  productionMeasurementStatus.sourceStatus?.postDeployArtifactSync !== sync.status ||
  !String(playerEvidenceWatchdog.status ?? '').startsWith('watchdog-') ||
  playerEvidenceWatchdog.controls?.noAutomaticDownloadsScan !== true ||
  playerEvidenceWatchdog.controls?.downloadsScanRequiresExplicitOptIn !== true ||
  playerEvidenceWatchdog.controls?.noRawPlayerEventsInPublicRepo !== true ||
  playerEvidenceWatchdog.publicRepoSecurity?.safeForPublicAutomation !== true ||
  productionMeasurementStatus.liveCandidate !== sync.live?.candidateId ||
  publicMeasurementStatus.liveCandidate !== sync.live?.candidateId ||
  JSON.stringify(publicMeasurementStatus.publicEvidenceHandoff) !==
    JSON.stringify(productionMeasurementStatus.publicEvidenceHandoff) ||
  JSON.stringify(publicMeasurementStatus.analyticsUnlock) !==
    JSON.stringify(productionMeasurementStatus.analyticsUnlock) ||
  productionReadiness.postDeployArtifactSync?.status !== sync.status ||
  productionReadiness.liveSiteMonitor?.status !== liveSiteMonitor.status ||
  productionReadiness.repositoryChannel?.status !== repositoryReadiness.status ||
  productionReadiness.repositoryBootstrap?.status !== repositoryBootstrap.status ||
  productionReadiness.productionBootstrap?.status !== productionBootstrap.status ||
  productionReadiness.productionActivation?.status !== productionActivation.status ||
  productionReadiness.productionBlockerHandoff?.status !== productionBlockerHandoff.status ||
  productionReadiness.objectiveAudit?.status !== objectiveAudit.status ||
  productionReadiness.autonomousOperator?.status !== autonomousOperator.status ||
  productionReadiness.autonomousOperatorHistory?.status !== autonomousOperatorHistory.status ||
  objectiveAudit.status !== 'objective-in-progress' ||
  autonomousOperator.controls?.zeroPaidSpend !== true ||
  autonomousOperator.controls?.localCommandAllowlistEnforced !== true ||
  autonomousOperatorHistory.status !== 'operator-history-ready' ||
  autonomousOperatorHistory.controls?.historyIsCapped !== true
) {
  fail('Post-deploy readiness sync must refresh PWA/store, repository, deployment, bootstrap, blocker, objective, operator, and readiness evidence without paid or mutating actions.')
}

if (
  ownerLoop.executionMemory?.liveDeployEvidence?.strictArtifactSyncFresh !== true ||
  ownerLoop.executionMemory?.liveDeployEvidence?.liveSiteMonitorFresh !== true ||
  ownerLoop.executionMemory?.liveDeployEvidence?.liveCandidateId !== sync.live?.candidateId ||
  ownerLoop.executionMemory?.liveDeployEvidence?.artifactCandidateId !== sync.artifact?.target?.candidateId ||
  ownerLoop.evidence?.postDeployArtifactSyncStatus !== sync.status ||
  ownerLoop.evidence?.liveSiteMonitorStatus !== liveSiteMonitor.status ||
  ownerLoop.executionMemory?.productionBootstrapFreshness?.fresh !== true ||
  (ownerLoop.executionMemory?.productionBootstrapFreshness?.staleInputIds ?? []).length !== 0 ||
  ownerLoop.ownerDecision?.nextBestActionId === 'bootstrap-production-setup' ||
  autonomousOperator.selectedAction?.id === 'bootstrap-production-setup'
) {
  fail('Post-deploy evidence sync must refresh owner deploy and production-bootstrap freshness so the owner loop does not repeat setup work.')
}

if (!process.exitCode) {
  console.log(
    `Post-deploy evidence sync verified: live ${sync.live.candidateId} matches artifact run ${sync.workflow.runId}.`,
  )
}
