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
const repositoryNameFromPackage = (packageName) => {
  const baseName = String(packageName || 'autonomous-game-lab').split('/').pop()
  const normalized = baseName.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')

  return normalized || 'autonomous-game-lab'
}
const cleanGithubOwner = (value) => {
  const owner = String(value ?? '').trim()

  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) ? owner : null
}
const repositoryFromOwnerHint = (owner, repositoryName) => {
  const cleanOwner = cleanGithubOwner(owner)

  return cleanOwner ? `${cleanOwner}/${repositoryName}` : null
}
const parseGithubRepository = (value) => {
  const raw = String(value ?? '').trim()
  const match = raw.match(/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)$/)

  return match ? { owner: match[1], repository: match[2], target: `${match[1]}/${match[2]}` } : null
}
const pagesBasePathFor = ({ owner, repository }) =>
  repository.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${repository}/`
const pagesOriginFor = ({ owner, repository }) =>
  repository.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? `https://${owner}.github.io`
    : `https://${owner}.github.io/${repository}`

const parseDirtyPaths = (stdout) =>
  stdout
    ? stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => (line[2] === ' ' ? line.slice(3) : line.replace(/^[ MADRCU?!]{1,2}\s+/, '')).trim())
        .filter(Boolean)
    : []

const generatedEvidencePaths = new Set([
  'data/repository-readiness.json',
  'src/data/repositoryReadiness.ts',
  'reports/repository-readiness-latest.md',
  'data/repository-bootstrap.json',
  'src/data/repositoryBootstrap.ts',
  'reports/repository-bootstrap-latest.md',
  'ops/cloudflare/wrangler.toml.example',
  'ops/github/README.md',
  'ops/github/bootstrap-repository.sh',
  'ops/github/setup-production.sh',
  'ops/production.env.example',
  'public/app-ads.txt',
  'public/compliance.json',
  'public/.well-known/assetlinks.json',
  'public/gate-sample.html',
  'public/install.html',
  'public/analytics-unlock.html',
  'public/analytics-unlock.json',
  'public/measurement-status.html',
  'public/measurement-status.json',
  'public/monetization.json',
  'public/privacy.html',
  'public/robots.txt',
  'public/sample-next.html',
  'public/sample-next.json',
  'public/sitemap.xml',
  'public/seed-kit.html',
  'public/seed-next.html',
  'public/seed-next.json',
  'public/share-manifest.json',
  'public/support.html',
])
const generatedEvidencePrefixes = [
  'data/',
  'reports/',
  'src/data/',
  'ops/github/',
  'ops/codex/',
  'public/games/',
  'public/icons/',
  'public/store-assets/',
  'native/android/',
  'native/ios/',
]
const isGeneratedEvidencePath = (dirtyPath) =>
  generatedEvidencePaths.has(dirtyPath) || generatedEvidencePrefixes.some((prefix) => dirtyPath.startsWith(prefix))

const repositoryFromRemote = (remoteUrl) => {
  const normalizedRemoteUrl = String(remoteUrl ?? '').trim().replace(/\/+$/g, '')
  if (!normalizedRemoteUrl) {
    return null
  }

  const githubRemotePatterns = [
    /^https:\/\/github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
    /^git@github\.com:([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
    /^ssh:\/\/git@github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
  ]

  for (const pattern of githubRemotePatterns) {
    const match = normalizedRemoteUrl.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

const repositoryFromEnv = process.env.GITHUB_REPOSITORY ?? process.env.GH_REPO ?? null
const packageJson = await readOptionalJson(path.join(root, 'package.json'), { name: 'autonomous-game-lab' })
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
const dirtyPaths = parseDirtyPaths(gitStatusResult.stdout)
const generatedEvidenceDirtyPaths = dirtyPaths.filter((dirtyPath) => isGeneratedEvidencePath(dirtyPath))
const nonGeneratedDirtyPaths = dirtyPaths.filter((dirtyPath) => !isGeneratedEvidencePath(dirtyPath))
const ghVersionResult = await run('gh', ['--version'])
const ghAuthResult = ghVersionResult.ok ? await run('gh', ['auth', 'status']) : { ok: false, stdout: '', stderr: '' }
const ghUserResult = ghAuthResult.ok ? await run('gh', ['api', 'user', '--jq', '.login']) : { ok: false, stdout: '' }
const pagesWorkflowExists = await exists(workflowPath)
const workflowSource = pagesWorkflowExists ? await readFile(workflowPath, 'utf8') : ''
const remoteRepository = repositoryFromRemote(gitRemoteResult.ok ? gitRemoteResult.stdout : null)
const inferredRepositoryName = repositoryNameFromPackage(packageJson.name)
const repositoryOwnerHint =
  process.env.AGL_GITHUB_OWNER ?? process.env.GITHUB_REPOSITORY_OWNER ?? process.env.GITHUB_OWNER ?? null
const ownerHintRepository = repositoryFromOwnerHint(repositoryOwnerHint, inferredRepositoryName)
const inferredRepository =
  ghUserResult.ok && configured(ghUserResult.stdout) ? `${ghUserResult.stdout}/${inferredRepositoryName}` : null
const targetRepository = repositoryFromEnv ?? remoteRepository ?? ownerHintRepository ?? inferredRepository
const targetRepositorySource = repositoryFromEnv
  ? 'environment'
  : remoteRepository
    ? 'origin-remote'
    : ownerHintRepository
      ? 'owner-hint-and-package-name'
        : inferredRepository
          ? 'gh-auth-user-and-package-name'
          : 'missing'
const plannedRepositoryTarget = targetRepository ?? `OWNER/${inferredRepositoryName}`
const parsedPlannedRepository = parseGithubRepository(plannedRepositoryTarget)
const plannedPages = parsedPlannedRepository
  ? {
      origin: pagesOriginFor(parsedPlannedRepository),
      basePath: pagesBasePathFor(parsedPlannedRepository),
      privacyUrl: `${pagesOriginFor(parsedPlannedRepository)}/privacy.html`,
      supportUrl: `${pagesOriginFor(parsedPlannedRepository)}/support.html`,
    }
  : null
const repositoryTargetPlan = {
  status: targetRepository ? 'target-known' : 'needs-owner-or-auth',
  repositoryName: inferredRepositoryName,
  target: targetRepository,
  targetSource: targetRepositorySource,
  placeholderTarget: `OWNER/${inferredRepositoryName}`,
  plannedTarget: plannedRepositoryTarget,
  ownerRequired: !targetRepository,
  githubNewRepositoryUrl: `https://github.com/new?name=${encodeURIComponent(inferredRepositoryName)}&visibility=public`,
  httpsOriginUrl: `https://github.com/${plannedRepositoryTarget}.git`,
  sshOriginUrl: `git@github.com:${plannedRepositoryTarget}.git`,
  pages: plannedPages,
  recommendedEnvironment: targetRepository
    ? {
        GITHUB_REPOSITORY: targetRepository,
        AGL_PUBLIC_ORIGIN: plannedPages?.origin ?? null,
        VITE_BASE_PATH: plannedPages?.basePath ?? '/',
      }
    : {
        AGL_GITHUB_OWNER: '<github-owner>',
        GITHUB_REPOSITORY: `OWNER/${inferredRepositoryName}`,
        AGL_PUBLIC_ORIGIN: plannedPages?.origin ?? null,
        VITE_BASE_PATH: plannedPages?.basePath ?? '/',
      },
  explicitCommands: {
    createRepository:
      `GITHUB_REPOSITORY=${plannedRepositoryTarget} AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 ` +
      'AGL_ALLOW_GITHUB_REPO_CREATE=1 ./ops/github/bootstrap-repository.sh',
    attachOrigin:
      `GITHUB_REPOSITORY=${plannedRepositoryTarget} AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 ` +
      'AGL_ALLOW_ORIGIN_REMOTE=1 ./ops/github/bootstrap-repository.sh',
    pushSnapshot:
      `GITHUB_REPOSITORY=${plannedRepositoryTarget} AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 ` +
      'AGL_ALLOW_SNAPSHOT_COMMIT=1 AGL_ALLOW_PUSH=1 ./ops/github/bootstrap-repository.sh',
  },
  controls: {
    zeroPaidSpend: true,
    publicRepositoryRecommended: true,
    noAccountCreation: true,
    remoteMutationRequiresExplicitEnv: true,
    workflowDispatchBlocked: true,
  },
}
const ghTokenConfigured = configured(process.env.GH_TOKEN) || configured(process.env.GITHUB_TOKEN)
const ghAuthAvailable = ghAuthResult.ok
const ghCredentialReady = ghTokenConfigured || ghAuthAvailable
const ghAutomationReady = Boolean(targetRepository && ghVersionResult.ok && ghCredentialReady)
const livePagesInspectionControls = {
  readOnlyGhApi: true,
  noPagesMutation: true,
  noWorkflowDispatch: true,
}
const summarizePagesApiError = (value) => {
  const message = String(value ?? 'pages-api-unavailable').replace(/\s+/g, ' ').trim()

  return message.length > 240 ? `${message.slice(0, 237)}...` : message || 'pages-api-unavailable'
}

const readLivePagesSettings = async (repository) => {
  if (!repository || !ghVersionResult.ok || !ghCredentialReady) {
    return {
      status: 'unavailable',
      repository,
      error: repository ? 'gh-credentials-unavailable' : 'repository-target-missing',
      controls: livePagesInspectionControls,
    }
  }

  const pagesResult = await run('gh', ['api', `repos/${repository}/pages`])

  if (!pagesResult.ok) {
    return {
      status: 'unavailable',
      repository,
      error: summarizePagesApiError(pagesResult.stderr || pagesResult.stdout),
      controls: livePagesInspectionControls,
    }
  }

  try {
    const pages = JSON.parse(pagesResult.stdout || '{}')

    return {
      status: 'inspected',
      repository,
      htmlUrl: pages.html_url ?? null,
      buildType: pages.build_type ?? null,
      httpsEnforced: pages.https_enforced === true,
      public: pages.public === true,
      cname: pages.cname ?? null,
      pagesStatus: pages.status ?? null,
      source: {
        branch: pages.source?.branch ?? null,
        path: pages.source?.path ?? null,
      },
      controls: livePagesInspectionControls,
    }
  } catch (parseError) {
    return {
      status: 'unavailable',
      repository,
      error: summarizePagesApiError(parseError instanceof Error ? parseError.message : String(parseError)),
      controls: livePagesInspectionControls,
    }
  }
}

const livePagesSettings = await readLivePagesSettings(targetRepository)
const livePagesSettingsReady =
  livePagesSettings.status === 'inspected' &&
  livePagesSettings.buildType === 'workflow' &&
  livePagesSettings.httpsEnforced === true
const deploymentArtifactsReady =
  deployment.status === 'ready-for-pages' &&
  releaseCandidate.status === 'release-candidate-ready' &&
  ['blocked-missing-origin', 'post-deploy-smoke-passed', 'post-deploy-smoke-observed-live'].includes(
    postDeploySmoke.status,
  )
const repositoryChannelReady = Boolean(
  insideWorkTree && targetRepository && pagesWorkflowExists && deploymentArtifactsReady && livePagesSettingsReady,
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
      : 'Set GITHUB_REPOSITORY/GH_REPO, add a GitHub origin remote, or authenticate gh so the target can be inferred.',
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
    status: ghCredentialReady ? 'pass' : 'external-blocker',
    detail: ghCredentialReady
      ? ghTokenConfigured
        ? 'GitHub token is present in the current environment.'
        : 'GitHub CLI authentication is available for repository operations.'
      : 'Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for non-interactive workflow dispatch.',
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
    id: 'pages-settings',
    status: livePagesSettingsReady
      ? 'pass'
      : livePagesSettings.status === 'unavailable'
        ? 'external-blocker'
        : 'blocker',
    detail:
      livePagesSettings.status === 'inspected'
        ? `GitHub Pages build type is ${livePagesSettings.buildType}; HTTPS enforced ${livePagesSettings.httpsEnforced}.`
        : `GitHub Pages settings could not be inspected: ${livePagesSettings.error}.`,
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
  ...(targetRepository
    ? []
    : ['Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO, set AGL_GITHUB_OWNER, or authenticate gh to infer the target repository.']),
  ...(ghVersionResult.ok ? [] : ['Install GitHub CLI for non-interactive repository operations.']),
  ...(ghCredentialReady
    ? []
    : ['Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for workflow dispatch and repository settings sync.']),
  ...(pagesWorkflowExists ? [] : ['Add .github/workflows/web-pwa-deploy.yml.']),
  ...(livePagesSettingsReady ? [] : ['Configure GitHub Pages to use GitHub Actions workflow deployments with HTTPS enforced.']),
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
    dirtyFiles: dirtyPaths.length,
    dirtyPaths,
    generatedEvidenceDirtyFiles: generatedEvidenceDirtyPaths.length,
    generatedEvidenceDirtyPaths,
    nonGeneratedDirtyFiles: nonGeneratedDirtyPaths.length,
    nonGeneratedDirtyPaths,
  },
  repository: {
    target: targetRepository,
    source: targetRepositorySource,
    originRemote: gitRemoteResult.ok ? gitRemoteResult.stdout : null,
    remoteRepository,
    ownerHint: cleanGithubOwner(repositoryOwnerHint),
    ownerHintEnv:
      process.env.AGL_GITHUB_OWNER
        ? 'AGL_GITHUB_OWNER'
        : process.env.GITHUB_REPOSITORY_OWNER
          ? 'GITHUB_REPOSITORY_OWNER'
          : process.env.GITHUB_OWNER
            ? 'GITHUB_OWNER'
            : null,
    ownerHintTarget: ownerHintRepository,
    inferredTarget: inferredRepository,
    inferredTargetSource: inferredRepository ? 'gh-auth-user-and-package-name' : null,
    packageName: packageJson.name ?? null,
    inferredRepositoryName,
    remoteParsing: {
      supportsHttps: true,
      supportsSshScp: true,
      supportsSshUrl: true,
      supportsDottedRepositoryNames: true,
      supportsOwnerHint: true,
    },
  },
  githubAutomation: {
    ghCliAvailable: ghVersionResult.ok,
    ghAuthAvailable,
    ghCredentialReady,
    ghTokenConfigured,
    ghUserLogin: ghUserResult.ok ? ghUserResult.stdout : null,
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
    liveSettings: livePagesSettings,
  },
  repositoryTargetPlan,
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
    targetRepository
      ? null
      : 'Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO to owner/repo, set AGL_GITHUB_OWNER to infer owner/package-name, or authenticate gh.',
    ghCredentialReady ? null : 'Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN before non-interactive workflow dispatch.',
    'Let the production bootstrap helper enable GitHub Pages with GitHub Actions as the source once gh credentials exist.',
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
  `Planned target: ${payload.repositoryTargetPlan.plannedTarget}`,
  `Planned Pages origin: ${payload.repositoryTargetPlan.pages?.origin ?? 'missing'}`,
  `Live Pages build: ${payload.pages.liveSettings.buildType ?? 'unknown'}`,
  `Live Pages HTTPS: ${payload.pages.liveSettings.httpsEnforced === true ? 'enforced' : 'not-enforced'}`,
  `Live Pages URL: ${payload.pages.liveSettings.htmlUrl ?? 'unknown'}`,
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
  `- Create or attach repository target: ${payload.repositoryTargetPlan.plannedTarget}`,
  `- GitHub create URL: ${payload.repositoryTargetPlan.githubNewRepositoryUrl}`,
  `- Attach origin command: ${payload.repositoryTargetPlan.explicitCommands.attachOrigin}`,
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
const appPayload = {
  status: payload.status,
  workspace: {
    insideWorkTree: payload.workspace.insideWorkTree,
  },
  repository: {
    target: payload.repository.target,
  },
  repositoryTargetPlan: {
    plannedTarget: payload.repositoryTargetPlan.plannedTarget,
    pages: {
      origin: payload.repositoryTargetPlan.pages?.origin ?? null,
    },
  },
  githubAutomation: {
    workflowDispatchReady: payload.githubAutomation.workflowDispatchReady,
  },
  pages: {
    liveSettings: {
      status: payload.pages.liveSettings.status,
      buildType: payload.pages.liveSettings.buildType ?? null,
      httpsEnforced: payload.pages.liveSettings.httpsEnforced ?? false,
      htmlUrl: payload.pages.liveSettings.htmlUrl ?? null,
    },
  },
}
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const repositoryReadiness = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type RepositoryReadiness = typeof repositoryReadiness\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
