import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'repository-readiness.json')
const outputTsPath = path.join(root, 'src', 'data', 'repositoryReadiness.ts')
const reportPath = path.join(root, 'reports', 'repository-readiness-latest.md')
const workflowPath = path.join(root, '.github', 'workflows', 'web-pwa-deploy.yml')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const run = (command, args) =>
  new Promise((resolve) => {
    execFile(command, args, { cwd: root, timeout: 4_000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      })
    })
  })

const configured = (value) => typeof value === 'string' && value.trim().length > 0

const repositoryFromRemote = (remoteUrl) => {
  if (!remoteUrl) {
    return null
  }

  const httpsMatch = remoteUrl.match(/^https:\/\/github\.com\/([^/\s]+\/[^/\s.]+)(?:\.git)?$/)
  if (httpsMatch) {
    return httpsMatch[1]
  }

  const sshMatch = remoteUrl.match(/^git@github\.com:([^/\s]+\/[^/\s.]+)(?:\.git)?$/)
  if (sshMatch) {
    return sshMatch[1]
  }

  return null
}

const repositoryFromEnv = process.env.GITHUB_REPOSITORY ?? process.env.GH_REPO ?? null
const releaseCandidate = await readOptionalJson(path.join(dataDir, 'release-candidate.json'), {
  status: 'missing',
  candidateId: null,
  integrity: {},
})
const postDeploySmoke = await readOptionalJson(path.join(dataDir, 'post-deploy-smoke.json'), {
  status: 'missing',
  target: {},
  controls: {},
})
const deployment = await readOptionalJson(path.join(dataDir, 'deployment-plan.json'), {
  status: 'missing',
  target: {},
})

const gitInsideResult = await run('git', ['rev-parse', '--is-inside-work-tree'])
const insideWorkTree = gitInsideResult.ok && gitInsideResult.stdout === 'true'
const gitRootResult = insideWorkTree ? await run('git', ['rev-parse', '--show-toplevel']) : { ok: false, stdout: null }
const gitBranchResult = insideWorkTree ? await run('git', ['branch', '--show-current']) : { ok: false, stdout: null }
const gitRemoteResult = insideWorkTree ? await run('git', ['remote', 'get-url', 'origin']) : { ok: false, stdout: null }
const gitStatusResult = insideWorkTree ? await run('git', ['status', '--short']) : { ok: false, stdout: '' }
const ghVersionResult = await run('gh', ['--version'])
const pagesWorkflowExists = await exists(workflowPath)
const workflowSource = pagesWorkflowExists ? await readFile(workflowPath, 'utf8') : ''
const remoteRepository = repositoryFromRemote(gitRemoteResult.ok ? gitRemoteResult.stdout : null)
const targetRepository = repositoryFromEnv ?? remoteRepository
const ghTokenConfigured = configured(process.env.GH_TOKEN) || configured(process.env.GITHUB_TOKEN)
const ghAutomationReady = Boolean(targetRepository && ghVersionResult.ok && ghTokenConfigured)
const deploymentArtifactsReady =
  deployment.status === 'ready-for-pages' &&
  releaseCandidate.status === 'release-candidate-ready' &&
  ['blocked-missing-origin', 'post-deploy-smoke-passed'].includes(postDeploySmoke.status)
const repositoryChannelReady = Boolean(
  insideWorkTree && targetRepository && pagesWorkflowExists && deploymentArtifactsReady,
)
const workflowDispatchReady = repositoryChannelReady && ghAutomationReady

const checks = [
  {
    id: 'local-git-worktree',
    status: insideWorkTree ? 'pass' : 'blocker',
    detail: insideWorkTree
      ? `Git worktree detected at ${gitRootResult.stdout}.`
      : 'This workspace is not a git repository, so Pages deployment cannot be driven from it yet.',
  },
  {
    id: 'github-target',
    status: targetRepository ? 'pass' : 'blocker',
    detail: targetRepository
      ? `Target repository is ${targetRepository}.`
      : 'Set GITHUB_REPOSITORY/GH_REPO or add a GitHub origin remote.',
  },
  {
    id: 'origin-remote',
    status: remoteRepository ? 'pass' : 'blocker',
    detail: remoteRepository
      ? `Origin remote resolves to ${remoteRepository}.`
      : 'No GitHub origin remote is available from this workspace.',
  },
  {
    id: 'gh-cli',
    status: ghVersionResult.ok ? 'pass' : 'blocker',
    detail: ghVersionResult.ok ? ghVersionResult.stdout.split('\n')[0] : 'GitHub CLI is not available.',
  },
  {
    id: 'gh-token',
    status: ghTokenConfigured ? 'pass' : 'external-blocker',
    detail: ghTokenConfigured
      ? 'GitHub token is present in the current environment.'
      : 'GH_TOKEN or GITHUB_TOKEN is not configured for non-interactive workflow dispatch.',
  },
  {
    id: 'pages-workflow',
    status:
      pagesWorkflowExists &&
      workflowSource.includes('actions/deploy-pages') &&
      workflowSource.includes('npm run autonomous:post-deploy-smoke -- --assert')
        ? 'pass'
        : 'blocker',
    detail: pagesWorkflowExists
      ? 'Web PWA Deploy workflow exists and includes post-deploy smoke.'
      : 'Web PWA Deploy workflow is missing.',
  },
  {
    id: 'deployable-artifact',
    status: deploymentArtifactsReady ? 'pass' : 'blocker',
    detail: `Deployment ${deployment.status}; release candidate ${releaseCandidate.status}; smoke ${postDeploySmoke.status}.`,
  },
]

const status = repositoryChannelReady
  ? workflowDispatchReady
    ? 'repository-channel-ready'
    : 'waiting-for-gh-auth'
  : insideWorkTree
    ? targetRepository
      ? pagesWorkflowExists
        ? 'waiting-for-repository-channel'
        : 'blocked-missing-pages-workflow'
      : 'waiting-for-github-repository'
    : 'blocked-no-local-git'

const blockers = [
  ...(insideWorkTree ? [] : ['Initialize or attach this workspace to a git repository.']),
  ...(remoteRepository ? [] : ['Add a GitHub origin remote or set GITHUB_REPOSITORY/GH_REPO.']),
  ...(ghVersionResult.ok ? [] : ['Install GitHub CLI for non-interactive repository operations.']),
  ...(ghTokenConfigured ? [] : ['Configure GH_TOKEN or GITHUB_TOKEN for workflow dispatch and repository settings sync.']),
  ...(pagesWorkflowExists ? [] : ['Add .github/workflows/web-pwa-deploy.yml.']),
  ...(deploymentArtifactsReady ? [] : ['Refresh build, release candidate, post-deploy smoke, and deployment plan artifacts.']),
]

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  envFiles: localEnv,
  workspace: {
    path: root,
    insideWorkTree,
    gitRoot: gitRootResult.ok ? gitRootResult.stdout : null,
    currentBranch: gitBranchResult.ok ? gitBranchResult.stdout || null : null,
    dirtyFiles: gitStatusResult.stdout ? gitStatusResult.stdout.split('\n').filter(Boolean).length : 0,
  },
  repository: {
    target: targetRepository,
    source: repositoryFromEnv ? 'environment' : remoteRepository ? 'origin-remote' : 'missing',
    originRemote: gitRemoteResult.ok ? gitRemoteResult.stdout : null,
    remoteRepository,
  },
  githubAutomation: {
    ghCliAvailable: ghVersionResult.ok,
    ghTokenConfigured,
    workflowDispatchReady,
    canSyncRepositorySettings: ghAutomationReady,
  },
  pages: {
    workflowPath: '.github/workflows/web-pwa-deploy.yml',
    workflowExists: pagesWorkflowExists,
    deployWorkflowIncludesSmoke: workflowSource.includes('npm run autonomous:post-deploy-smoke -- --assert'),
    deploymentStatus: deployment.status,
    releaseCandidateId: releaseCandidate.candidateId,
    postDeploySmokeStatus: postDeploySmoke.status,
  },
  controls: {
    zeroPaidSpend: true,
    readOnlyLocalInspection: true,
    noGitMutation: true,
    noWorkflowDispatch: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
  },
  checks,
  blockers,
  setupRequiredOnce: [
    insideWorkTree ? null : 'Initialize this workspace as a git repository or move it into the intended repository checkout.',
    remoteRepository ? null : 'Add a GitHub origin remote or set GITHUB_REPOSITORY/GH_REPO to owner/repo.',
    ghTokenConfigured ? null : 'Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN before non-interactive workflow dispatch.',
    'Enable GitHub Pages with GitHub Actions as the source in the target repository.',
  ].filter(Boolean),
  nextActions: [
    repositoryChannelReady
      ? 'Use production bootstrap to sync configured repository variables/secrets, then dispatch the Web PWA Deploy workflow.'
      : 'Prepare the GitHub repository channel before treating the web deploy as runnable.',
    'Keep this script read-only; repository creation, workflow dispatch, and settings sync stay in guarded bootstrap commands.',
  ],
}

const report = [
  '# Repository Readiness',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Workspace: ${payload.workspace.insideWorkTree ? payload.workspace.gitRoot : 'not a git repository'}`,
  `Repository: ${payload.repository.target ?? 'missing'}`,
  '',
  '## Checks',
  '',
  ...checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Setup Required Once',
  '',
  ...payload.setupRequiredOnce.map((item) => `- ${item}`),
  '',
  '## Blockers',
  '',
  ...(blockers.length ? blockers.map((item) => `- ${item}`) : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const repositoryReadiness = ${JSON.stringify(payload, null, 2)} as const\n\nexport type RepositoryReadiness = typeof repositoryReadiness\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
