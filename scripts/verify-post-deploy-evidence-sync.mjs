import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const fail = (message) => {
  console.error(message)
  process.exitCode = 1
}
const readJson = async (filePath) => JSON.parse(await readFile(path.join(root, filePath), 'utf8'))
const readText = async (filePath) => readFile(path.join(root, filePath), 'utf8')

const [sync, ownerLoop, packageJson, workflow] = await Promise.all([
  readJson('data/post-deploy-artifact-sync.json'),
  readJson('data/autonomous-owner-loop.json'),
  readJson('package.json'),
  readText('.github/workflows/post-deploy-evidence-sync.yml'),
])

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

if (
  packageJson.scripts?.['autonomous:verify-post-deploy-sync'] !==
  'node scripts/verify-post-deploy-evidence-sync.mjs'
) {
  fail('package.json must expose the post-deploy evidence sync verifier.')
}

if (
  !workflow.includes("workflows: ['Web PWA Deploy']") ||
  !workflow.includes('actions: read') ||
  !workflow.includes('contents: write') ||
  !workflow.includes('npm run autonomous:post-deploy-artifact-sync -- --run-id="${POST_DEPLOY_RUN_ID}" --assert') ||
  !workflow.includes('npm run autonomous:owner-loop') ||
  !workflow.includes('npm run autonomous:verify-post-deploy-sync') ||
  !workflow.includes('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT') ||
  !workflow.includes('data/post-deploy-artifact-sync.json') ||
  !workflow.includes('src/data/postDeployArtifactSync.ts') ||
  !workflow.includes('reports/post-deploy-artifact-sync-latest.md') ||
  !workflow.includes('data/autonomous-owner-loop.json') ||
  !workflow.includes('src/data/autonomousOwnerLoop.ts') ||
  !workflow.includes('reports/autonomous-owner-loop-latest.md')
) {
  fail('Post-deploy evidence sync workflow must import strict deployed smoke evidence and refresh dependent owner evidence.')
}

const forbiddenRefreshCommands = [
  'npm run build',
  'autonomous:release-candidate',
  'autonomous:post-deploy-smoke',
  'autonomous:repo-readiness',
  'autonomous:deploy-plan',
  'node scripts/verify-autonomy.mjs',
]

for (const command of forbiddenRefreshCommands) {
  if (workflow.includes(command)) {
    fail(`Post-deploy evidence sync must not run ${command}; that would create a new undeployed candidate during evidence import.`)
  }
}

const forbiddenStagedArtifacts = [
  'data/release-candidate.json',
  'src/data/releaseCandidate.ts',
  'data/performance-budget.json',
  'src/data/performanceBudget.ts',
  'data/post-deploy-smoke.json',
  'src/data/postDeploySmoke.ts',
  'data/production-readiness.json',
  'data/objective-audit.json',
]

for (const artifact of forbiddenStagedArtifacts) {
  if (workflow.includes(artifact)) {
    fail(`Post-deploy evidence sync must not stage ${artifact}; only strict deployed evidence is allowed.`)
  }
}

if (
  ownerLoop.executionMemory?.liveDeployEvidence?.strictArtifactSyncFresh !== true ||
  ownerLoop.executionMemory?.liveDeployEvidence?.liveCandidateId !== sync.live?.candidateId ||
  ownerLoop.executionMemory?.liveDeployEvidence?.artifactCandidateId !== sync.artifact?.target?.candidateId ||
  ownerLoop.evidence?.postDeployArtifactSyncStatus !== sync.status
) {
  fail('Post-deploy evidence sync must refresh owner deploy evidence to the synced live artifact.')
}

if (!process.exitCode) {
  console.log(
    `Post-deploy evidence sync verified: live ${sync.live.candidateId} matches artifact run ${sync.workflow.runId}.`,
  )
}
