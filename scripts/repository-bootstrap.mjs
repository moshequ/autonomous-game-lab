import { execFile } from 'node:child_process'
import { access, chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const opsGithubDir = path.join(root, 'ops', 'github')

const outputJsonPath = path.join(dataDir, 'repository-bootstrap.json')
const outputTsPath = path.join(srcDataDir, 'repositoryBootstrap.ts')
const reportPath = path.join(reportsDir, 'repository-bootstrap-latest.md')
const helperPath = path.join(opsGithubDir, 'bootstrap-repository.sh')

const argv = process.argv.slice(2)
const applyLocalGit =
  argv.includes('--apply-local-git') ||
  ['1', 'true', 'yes'].includes(String(process.env.AGL_ALLOW_LOCAL_GIT_BOOTSTRAP ?? '').toLowerCase())

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
    execFile(command, args, { cwd: root, timeout: 6_000 }, (error, stdout, stderr) => {
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
  'ops/github/bootstrap-repository.sh',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/seed-kit.html',
  'public/share-manifest.json',
])
const generatedEvidencePrefixes = ['data/', 'reports/', 'src/data/', 'ops/github/', 'ops/codex/', 'public/games/']
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

const inspectGit = async () => {
  const insideResult = await run('git', ['rev-parse', '--is-inside-work-tree'])
  const insideWorkTree = insideResult.ok && insideResult.stdout === 'true'
  const rootResult = insideWorkTree ? await run('git', ['rev-parse', '--show-toplevel']) : { ok: false, stdout: null }
  const branchResult = insideWorkTree ? await run('git', ['branch', '--show-current']) : { ok: false, stdout: null }
  const originResult = insideWorkTree ? await run('git', ['remote', 'get-url', 'origin']) : { ok: false, stdout: null }
  const headResult = insideWorkTree ? await run('git', ['rev-parse', '--verify', 'HEAD']) : { ok: false, stdout: null }
  const statusResult = insideWorkTree ? await run('git', ['status', '--short']) : { ok: false, stdout: '' }
  const dirtyPaths = parseDirtyPaths(statusResult.stdout)
  const generatedEvidenceDirtyPaths = dirtyPaths.filter((dirtyPath) => isGeneratedEvidencePath(dirtyPath))
  const nonGeneratedDirtyPaths = dirtyPaths.filter((dirtyPath) => !isGeneratedEvidencePath(dirtyPath))

  return {
    insideWorkTree,
    gitRoot: rootResult.ok ? rootResult.stdout : null,
    currentBranch: branchResult.ok ? branchResult.stdout || null : null,
    originRemote: originResult.ok ? originResult.stdout : null,
    remoteRepository: repositoryFromRemote(originResult.ok ? originResult.stdout : null),
    hasCommit: headResult.ok,
    dirtyFiles: dirtyPaths.length,
    dirtyPaths,
    generatedEvidenceDirtyFiles: generatedEvidenceDirtyPaths.length,
    generatedEvidenceDirtyPaths,
    nonGeneratedDirtyFiles: nonGeneratedDirtyPaths.length,
    nonGeneratedDirtyPaths,
  }
}

let gitBefore = await inspectGit()
let appliedLocalGit = false
let localGitResult = null

if (applyLocalGit && !gitBefore.insideWorkTree) {
  localGitResult = await run('git', ['init', '-b', process.env.AGL_DEFAULT_BRANCH || 'main'])

  if (!localGitResult.ok) {
    localGitResult = await run('git', ['init'])
  }

  appliedLocalGit = localGitResult.ok
}

const gitAfter = await inspectGit()
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  status: 'missing',
  repository: {},
  githubAutomation: {},
  blockers: ['Run npm run autonomous:repo-readiness before repository bootstrap.'],
})
const packageJson = await readOptionalJson(path.join(root, 'package.json'), { name: 'autonomous-game-lab' })
const deployment = await readOptionalJson(path.join(dataDir, 'deployment-plan.json'), {
  status: 'missing',
  target: {},
})
const releaseCandidate = await readOptionalJson(path.join(dataDir, 'release-candidate.json'), {
  status: 'missing',
  candidateId: null,
})
const postDeploySmoke = await readOptionalJson(path.join(dataDir, 'post-deploy-smoke.json'), {
  status: 'missing',
})

const ghVersionResult = await run('gh', ['--version'])
const ghAuthResult = await run('gh', ['auth', 'status'])
const ghUserResult = ghAuthResult.ok ? await run('gh', ['api', 'user', '--jq', '.login']) : { ok: false, stdout: '' }
const inferredRepositoryName = repositoryNameFromPackage(packageJson.name)
const repositoryOwnerHint =
  process.env.AGL_GITHUB_OWNER ?? process.env.GITHUB_REPOSITORY_OWNER ?? process.env.GITHUB_OWNER ?? null
const ownerHintRepository = repositoryFromOwnerHint(repositoryOwnerHint, inferredRepositoryName)
const inferredRepository =
  repositoryReadiness.repository?.inferredTarget ??
  (ghUserResult.ok && configured(ghUserResult.stdout) ? `${ghUserResult.stdout}/${inferredRepositoryName}` : null)
const targetRepository =
  process.env.GITHUB_REPOSITORY ??
  process.env.GH_REPO ??
  repositoryReadiness.repository?.target ??
  gitAfter.remoteRepository ??
  ownerHintRepository ??
  inferredRepository ??
  null
const targetRepositorySource = process.env.GITHUB_REPOSITORY || process.env.GH_REPO
  ? 'environment'
  : repositoryReadiness.repository?.target
    ? (repositoryReadiness.repository?.source ?? 'repository-readiness')
    : gitAfter.remoteRepository
      ? 'origin-remote'
      : ownerHintRepository
        ? 'owner-hint-and-package-name'
        : inferredRepository
          ? 'gh-auth-user-and-package-name'
          : 'missing'
const ghTokenConfigured = configured(process.env.GH_TOKEN) || configured(process.env.GITHUB_TOKEN)
const ghReady = Boolean(ghVersionResult.ok && (ghTokenConfigured || ghAuthResult.ok))
const helperExists = await exists(helperPath)

const localGitStatus = gitAfter.insideWorkTree
  ? appliedLocalGit
    ? 'applied'
    : 'ready'
  : applyLocalGit
    ? 'failed'
    : 'needs-explicit-apply'
const originStatus = gitAfter.remoteRepository
  ? 'ready'
  : targetRepository
    ? 'ready-for-explicit-origin-attach'
    : 'waiting-for-github-target'
const githubRepositoryStatus = targetRepository
  ? ghReady
    ? 'ready-for-explicit-create-or-attach'
    : 'credential-gated'
  : 'waiting-for-github-target'
const initialCommitStatus = gitAfter.hasCommit
  ? 'ready'
  : gitAfter.insideWorkTree
    ? 'ready-for-explicit-initial-commit'
    : 'waiting-for-local-git'
const snapshotCommitStatus =
  gitAfter.insideWorkTree && gitAfter.hasCommit
    ? gitAfter.nonGeneratedDirtyFiles > 0
      ? 'ready-for-explicit-snapshot-commit'
      : 'ready'
    : gitAfter.insideWorkTree
      ? 'waiting-for-initial-commit'
      : 'waiting-for-local-git'
const cleanSnapshotReady = gitAfter.insideWorkTree && gitAfter.hasCommit && gitAfter.nonGeneratedDirtyFiles === 0

const actions = [
  {
    id: 'inspect-repository-channel',
    status: 'done',
    costUsd: 0,
    command: 'npm run autonomous:repo-readiness',
    mutatesLocalGit: false,
    mutatesRemoteGitHub: false,
    detail: `Repository readiness is ${repositoryReadiness.status}.`,
  },
  {
    id: 'initialize-local-git',
    status: localGitStatus,
    costUsd: 0,
    command: 'npm run autonomous:repo-bootstrap -- --apply-local-git',
    mutatesLocalGit: true,
    mutatesRemoteGitHub: false,
    requiresExplicitFlag: true,
    detail: gitAfter.insideWorkTree
      ? `Git worktree is available at ${gitAfter.gitRoot}.`
      : 'Local git can be initialized with an explicit local bootstrap flag.',
  },
  {
    id: 'create-initial-commit',
    status: initialCommitStatus,
    costUsd: 0,
    command: 'AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_INITIAL_COMMIT=1 ./ops/github/bootstrap-repository.sh',
    mutatesLocalGit: true,
    mutatesRemoteGitHub: false,
    requiresExplicitEnv: true,
    detail: gitAfter.hasCommit
      ? 'The local repository has at least one commit.'
      : 'Initial commit is held behind AGL_ALLOW_INITIAL_COMMIT=1.',
  },
  {
    id: 'commit-current-snapshot',
    status: snapshotCommitStatus,
    costUsd: 0,
    command: 'AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_SNAPSHOT_COMMIT=1 ./ops/github/bootstrap-repository.sh',
    mutatesLocalGit: true,
    mutatesRemoteGitHub: false,
    requiresExplicitEnv: true,
    detail: cleanSnapshotReady
      ? gitAfter.generatedEvidenceDirtyFiles > 0
        ? `${gitAfter.generatedEvidenceDirtyFiles} repository evidence file(s) changed during this dry run; the outer verified commit will persist them.`
        : 'The current generated production snapshot is committed.'
      : gitAfter.nonGeneratedDirtyFiles > 0
        ? `${gitAfter.nonGeneratedDirtyFiles} non-generated source or artifact file(s) are not committed yet.`
        : 'Snapshot commit waits for a local git worktree with an initial commit.',
  },
  {
    id: 'set-or-create-origin',
    status: originStatus,
    costUsd: 0,
    command: 'AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_ORIGIN_REMOTE=1 ./ops/github/bootstrap-repository.sh',
    mutatesLocalGit: true,
    mutatesRemoteGitHub: false,
    requiresExplicitEnv: true,
    detail: gitAfter.remoteRepository
      ? `Origin remote resolves to ${gitAfter.remoteRepository}.`
      : targetRepository
        ? `Target ${targetRepository} can be attached as origin when explicitly allowed.`
        : 'Set GITHUB_REPOSITORY/GH_REPO, set AGL_GITHUB_OWNER, or authenticate gh so the target can be inferred before attaching origin.',
  },
  {
    id: 'create-github-repository',
    status: githubRepositoryStatus,
    costUsd: 0,
    command: 'AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_GITHUB_REPO_CREATE=1 ./ops/github/bootstrap-repository.sh',
    mutatesLocalGit: false,
    mutatesRemoteGitHub: true,
    requiresExplicitEnv: true,
    detail: targetRepository
      ? ghReady
        ? `GitHub CLI can create or attach ${targetRepository} when explicitly allowed.`
        : 'GitHub CLI auth or GH_TOKEN/GITHUB_TOKEN is required before remote repository creation.'
      : 'Set GITHUB_REPOSITORY/GH_REPO, set AGL_GITHUB_OWNER, or authenticate gh so the target can be inferred before creating a GitHub repository.',
  },
  {
    id: 'push-initial-snapshot',
    status:
      gitAfter.insideWorkTree && gitAfter.hasCommit && gitAfter.remoteRepository && cleanSnapshotReady
        ? 'ready-for-explicit-push'
        : gitAfter.remoteRepository && gitAfter.nonGeneratedDirtyFiles > 0
          ? 'waiting-for-clean-snapshot'
          : 'waiting-for-commit-and-origin',
    costUsd: 0,
    command: 'AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_PUSH=1 ./ops/github/bootstrap-repository.sh',
    mutatesLocalGit: false,
    mutatesRemoteGitHub: true,
    requiresExplicitEnv: true,
    detail: cleanSnapshotReady
      ? 'Push stays held until an origin remote exists and AGL_ALLOW_PUSH=1 is set.'
      : 'Push stays held until a committed local snapshot and origin remote exist.',
  },
]

const blockers = [
  ...(gitAfter.insideWorkTree ? [] : ['Initialize this workspace as a local git repository.']),
  ...(gitAfter.hasCommit ? [] : ['Create an initial commit before pushing to GitHub Pages.']),
  ...(gitAfter.hasCommit && gitAfter.nonGeneratedDirtyFiles > 0
    ? ['Commit current generated changes before pushing to GitHub Pages.']
    : []),
  ...(targetRepository
    ? []
    : ['Set GITHUB_REPOSITORY/GH_REPO, AGL_GITHUB_OWNER, or authenticate gh so the intended owner/repo can be inferred.']),
  ...(gitAfter.remoteRepository ? [] : ['Attach a GitHub origin remote or create the target repository.']),
  ...(ghReady ? [] : ['Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN for remote repository bootstrap.']),
]

const status = gitAfter.insideWorkTree
  ? targetRepository
    ? gitAfter.remoteRepository
      ? ghReady
        ? 'repository-bootstrap-ready'
        : 'waiting-for-gh-auth'
      : 'waiting-for-origin-remote'
    : 'waiting-for-github-target'
  : 'needs-local-git-bootstrap'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  mode: applyLocalGit ? 'apply-local-git' : 'plan-only',
  envFiles: localEnv,
  workspace: {
    path: root,
    before: gitBefore,
    after: gitAfter,
  },
  repository: {
    target: targetRepository,
    source: targetRepositorySource,
    originRemote: gitAfter.originRemote,
    remoteRepository: gitAfter.remoteRepository,
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
    ghAuthAvailable: ghAuthResult.ok,
    ghTokenConfigured,
    ghCredentialReady: ghReady,
    ghUserLogin: ghUserResult.ok ? ghUserResult.stdout : null,
    ghReady,
  },
  sourceStatus: {
    repositoryReadiness: repositoryReadiness.status,
    deployment: deployment.status,
    releaseCandidate: releaseCandidate.status,
    releaseCandidateId: releaseCandidate.candidateId,
    postDeploySmoke: postDeploySmoke.status,
  },
  execution: {
    applyLocalGitRequested: applyLocalGit,
    appliedLocalGit,
    localGitResult: localGitResult
      ? {
          ok: localGitResult.ok,
          stdout: localGitResult.stdout,
          stderr: localGitResult.stderr,
        }
      : null,
  },
  controls: {
    zeroPaidSpend: true,
    dryRunByDefault: true,
    localGitMutationRequiresExplicitFlag: true,
    remoteGitHubMutationRequiresExplicitEnv: true,
    initialCommitRequiresExplicitEnv: true,
    snapshotCommitRequiresExplicitEnv: true,
    pushRequiresExplicitEnv: true,
    noWorkflowDispatch: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    helperDoesNotEchoSecrets: true,
  },
  actions,
  blockers,
  helper: {
    path: 'ops/github/bootstrap-repository.sh',
    status: helperExists ? 'generated' : 'will-generate',
    requiresEnv: 'AGL_ALLOW_REPOSITORY_BOOTSTRAP=1',
    canInitializeLocalGit: true,
    canCreateInitialCommit: true,
    canCommitCurrentSnapshot: true,
    canAttachOrigin: true,
    canCreateGithubRepository: true,
    canPush: true,
    infersRepositoryFromOriginRemote: true,
    supportsSshUrlRemotes: true,
    supportsDottedRepositoryNames: true,
    supportsOwnerHint: true,
    noWorkflowDispatch: true,
  },
  nextActions: [
    gitAfter.insideWorkTree
      ? 'Set GITHUB_REPOSITORY/GH_REPO, set AGL_GITHUB_OWNER, or authenticate gh, then run repository bootstrap with explicit remote flags when credentials exist.'
      : 'Run npm run autonomous:repo-bootstrap -- --apply-local-git to create the zero-cost local git channel.',
    'Keep workflow dispatch in production bootstrap; repository bootstrap only prepares git/GitHub transport.',
  ],
}

const report = [
  '# Repository Bootstrap',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  `Workspace git: ${payload.workspace.after.insideWorkTree ? 'ready' : 'missing'}`,
  `Repository: ${payload.repository.target ?? 'missing'}`,
  `Origin: ${payload.repository.remoteRepository ?? 'missing'}`,
  '',
  '## Actions',
  '',
  ...actions.map((action) => `- ${action.status}: ${action.id}; ${action.detail}`),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Blockers',
  '',
  ...(blockers.length ? blockers.map((blocker) => `- ${blocker}`) : ['- none']),
  '',
]

const helperScript = `#!/usr/bin/env bash
set -euo pipefail

if [[ "\${AGL_ALLOW_REPOSITORY_BOOTSTRAP:-0}" != "1" ]]; then
  echo "Repository bootstrap is dry-run by default. Set AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 to apply guarded git/GitHub steps." >&2
  exit 2
fi

default_branch="\${AGL_DEFAULT_BRANCH:-main}"
target_repo="\${GITHUB_REPOSITORY:-\${GH_REPO:-}}"
owner_hint="\${AGL_GITHUB_OWNER:-\${GITHUB_REPOSITORY_OWNER:-\${GITHUB_OWNER:-}}}"

derive_repository_name() {
  node -e 'const fs=require("fs"); let name="autonomous-game-lab"; try { name=JSON.parse(fs.readFileSync("package.json","utf8")).name || name } catch {} name=String(name).split("/").pop().replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"") || "autonomous-game-lab"; console.log(name)'
}

derive_repository_from_origin() {
  local remote_url
  remote_url="$(git remote get-url origin 2>/dev/null || true)"
  remote_url="\${remote_url%/}"

  case "$remote_url" in
    https://github.com/*)
      remote_url="\${remote_url#https://github.com/}"
      ;;
    git@github.com:*)
      remote_url="\${remote_url#git@github.com:}"
      ;;
    ssh://git@github.com/*)
      remote_url="\${remote_url#ssh://git@github.com/}"
      ;;
    *)
      return
      ;;
  esac

  remote_url="\${remote_url%.git}"

  if [[ "$remote_url" =~ ^[^/[:space:]]+/[^/[:space:]]+$ ]]; then
    printf "%s" "$remote_url"
  fi
}

derive_repository_from_owner_hint() {
  local owner="$1"
  if [[ "$owner" =~ ^[A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?$ ]]; then
    printf "%s/%s" "$owner" "$(derive_repository_name)"
  fi
}

if [[ -z "$target_repo" ]]; then
  origin_repo="$(derive_repository_from_origin)"
  if [[ -n "$origin_repo" ]]; then
    target_repo="$origin_repo"
    echo "inferred GitHub repository target from origin: $target_repo"
  fi
fi

if [[ -z "$target_repo" && -n "$owner_hint" ]]; then
  owner_repo="$(derive_repository_from_owner_hint "$owner_hint")"
  if [[ -n "$owner_repo" ]]; then
    target_repo="$owner_repo"
    echo "inferred GitHub repository target from owner hint: $target_repo"
  fi
fi

if [[ -z "$target_repo" && "\${AGL_ALLOW_GH_INFER_REPOSITORY:-1}" == "1" ]] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh_owner="$(gh api user --jq .login 2>/dev/null || true)"
  if [[ -n "$gh_owner" ]]; then
    target_repo="$gh_owner/$(derive_repository_name)"
    echo "inferred GitHub repository target: $target_repo"
  fi
fi

ensure_git_identity() {
  if ! git config user.name >/dev/null 2>&1; then
    git config user.name "\${AGL_GIT_AUTHOR_NAME:-Autonomous Game Lab Operator}"
  fi
  if ! git config user.email >/dev/null 2>&1; then
    git config user.email "\${AGL_GIT_AUTHOR_EMAIL:-autonomous-game-lab@example.invalid}"
  fi
}

commit_current_snapshot() {
  local message="$1"
  if [[ -n "$(git status --short)" ]]; then
    ensure_git_identity
    git add .
    git commit -m "$message"
  else
    echo "working tree already has a clean committed snapshot"
  fi
}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init -b "$default_branch" 2>/dev/null || git init
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  if [[ "\${AGL_ALLOW_INITIAL_COMMIT:-0}" == "1" ]]; then
    commit_current_snapshot "\${AGL_INITIAL_COMMIT_MESSAGE:-Initial autonomous game lab snapshot}"
  else
    echo "skip initial commit: set AGL_ALLOW_INITIAL_COMMIT=1 to commit the current snapshot"
  fi
elif [[ "\${AGL_ALLOW_SNAPSHOT_COMMIT:-0}" == "1" ]]; then
  commit_current_snapshot "\${AGL_SNAPSHOT_COMMIT_MESSAGE:-Refresh autonomous production snapshot}"
fi

if [[ -n "$target_repo" && "\${AGL_ALLOW_ORIGIN_REMOTE:-0}" == "1" ]]; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/$target_repo.git"
  else
    echo "origin remote already configured"
  fi
fi

if [[ "\${AGL_ALLOW_GITHUB_REPO_CREATE:-0}" == "1" ]]; then
  if [[ -z "$target_repo" ]]; then
    echo "Set GITHUB_REPOSITORY, GH_REPO, or AGL_GITHUB_OWNER before creating a GitHub repository." >&2
    exit 1
  fi

  if ! command -v gh >/dev/null 2>&1; then
    echo "GitHub CLI (gh) is required for remote repository creation." >&2
    exit 1
  fi

  if ! gh auth status >/dev/null 2>&1; then
    echo "Authenticate gh or provide GH_TOKEN/GITHUB_TOKEN before creating a repository." >&2
    exit 1
  fi

  visibility="\${AGL_GITHUB_VISIBILITY:-public}"
  if [[ "$visibility" != "public" && "$visibility" != "private" ]]; then
    echo "AGL_GITHUB_VISIBILITY must be public or private." >&2
    exit 1
  fi

  if gh repo view "$target_repo" >/dev/null 2>&1; then
    echo "GitHub repository $target_repo already exists"
  else
    create_args=("$target_repo" "--$visibility" "--source=." "--remote=origin")
    if [[ "\${AGL_ALLOW_PUSH:-0}" == "1" ]]; then
      if [[ -n "$(git status --short)" ]]; then
        echo "working tree has uncommitted changes; set AGL_ALLOW_SNAPSHOT_COMMIT=1 before push." >&2
        exit 1
      fi
      create_args+=("--push")
    fi
    gh repo create "\${create_args[@]}"
  fi
fi

if [[ "\${AGL_ALLOW_PUSH:-0}" == "1" ]]; then
  if ! git remote get-url origin >/dev/null 2>&1; then
    echo "origin remote is required before push." >&2
    exit 1
  fi

  if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "a local commit is required before push." >&2
    exit 1
  fi

  if [[ -n "$(git status --short)" ]]; then
    echo "working tree has uncommitted changes; set AGL_ALLOW_SNAPSHOT_COMMIT=1 before push." >&2
    exit 1
  fi

  git push -u origin HEAD
else
  echo "skip push: set AGL_ALLOW_PUSH=1 to push the current branch"
fi

echo "Repository bootstrap completed for local/explicitly allowed steps. No workflows were dispatched."
`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(opsGithubDir, { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const repositoryBootstrap = ${JSON.stringify(payload, null, 2)} as const\n\nexport type RepositoryBootstrap = typeof repositoryBootstrap\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(helperPath, helperScript, { mode: 0o755 })
await chmod(helperPath, 0o755)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, helperPath)}`)

if (applyLocalGit && !appliedLocalGit && !gitBefore.insideWorkTree) {
  process.exitCode = 1
}
