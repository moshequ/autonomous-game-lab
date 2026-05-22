import { execFile } from 'node:child_process'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const reportsDir = path.join(root, 'reports')
const opsGithubDir = path.join(root, 'ops', 'github')
const outputJsonPath = path.join(dataDir, 'android-root-assetlinks-handoff.json')
const outputTsPath = path.join(root, 'src', 'data', 'androidRootAssetlinksHandoff.ts')
const reportPath = path.join(reportsDir, 'android-root-assetlinks-handoff-latest.md')
const syncScriptPath = path.join(opsGithubDir, 'sync-root-assetlinks.sh')
const sourceAssetLinksPath = path.join(root, 'public', '.well-known', 'assetlinks.json')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const run = (command, args, timeout = 10_000) =>
  new Promise((resolve) => {
    execFile(command, args, { cwd: root, timeout }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      })
    })
  })
const cleanGithubOwner = (value) => {
  const owner = String(value ?? '').trim()

  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) ? owner : null
}
const repoFromGithubIoHost = (host) => {
  const match = String(host ?? '').match(/^([A-Za-z0-9-]+)\.github\.io$/)
  const owner = cleanGithubOwner(match?.[1])

  return owner ? `${owner}/${owner}.github.io` : null
}
const probeGithubRepository = async (repository) => {
  if (!repository) {
    return {
      exists: false,
      status: 'missing',
      detail: 'No target repository was inferred or configured.',
    }
  }

  const result = await run('gh', ['repo', 'view', repository, '--json', 'nameWithOwner,defaultBranchRef,url'])

  if (!result.ok) {
    return {
      exists: false,
      status: 'not-found-or-inaccessible',
      detail: result.stderr || result.stdout || `Could not view ${repository}.`,
    }
  }

  return {
    exists: true,
    status: 'repository-accessible',
    detail: `${repository} is accessible to GitHub CLI.`,
    metadata: JSON.parse(result.stdout),
  }
}
const verifyRootAssetLinks = async ({ url, packageName, sha256CertFingerprint }) => {
  const checkedAt = new Date().toISOString()

  if (!url || !packageName || !sha256CertFingerprint) {
    return {
      checkedAt,
      status: 'not-checkable',
      httpStatus: null,
      liveMatchesSource: false,
      detail: 'Root URL, package name, or signing fingerprint is missing.',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    })
    const raw = await response.text()
    let parsed = null

    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = null
    }

    const liveMatchesSource =
      Array.isArray(parsed) &&
      parsed.some(
        (entry) =>
          entry?.relation?.includes('delegate_permission/common.handle_all_urls') &&
          entry?.target?.namespace === 'android_app' &&
          entry?.target?.package_name === packageName &&
          entry?.target?.sha256_cert_fingerprints?.includes(sha256CertFingerprint),
      )

    return {
      checkedAt,
      status: liveMatchesSource ? 'live-match' : response.ok ? 'live-mismatch' : 'http-not-ready',
      httpStatus: response.status,
      finalUrl: response.url,
      liveMatchesSource,
      bytes: raw.length,
      detail: liveMatchesSource
        ? `Root Digital Asset Links match ${packageName}.`
        : `Root Digital Asset Links returned HTTP ${response.status} without matching the generated source.`,
    }
  } catch (error) {
    return {
      checkedAt,
      status: 'fetch-failed',
      httpStatus: null,
      liveMatchesSource: false,
      detail: error instanceof Error ? error.message : 'Root Digital Asset Links fetch failed.',
    }
  } finally {
    clearTimeout(timeout)
  }
}

const nativePackage = await readJson(path.join(dataDir, 'native-package.json'))
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  repository: {},
  githubAutomation: {},
})
const assetLinks = await readOptionalJson(sourceAssetLinksPath, null)

const configuredTargetRepo = process.env.AGL_ROOT_ASSETLINKS_REPOSITORY?.trim()
const inferredTargetRepo = repoFromGithubIoHost(nativePackage.host)
const targetRepository = configuredTargetRepo || inferredTargetRepo
const targetBranch = process.env.AGL_ROOT_ASSETLINKS_BRANCH?.trim() || 'main'
const targetPath = '.well-known/assetlinks.json'
const requiredRootUrl = nativePackage.assetLinks?.requiredRootUrl ?? null
const projectPublishedUrl = nativePackage.assetLinks?.publishedUrl ?? null
const sourcePackageName = assetLinks?.[0]?.target?.package_name ?? nativePackage.packageName
const sourceSha256CertFingerprint =
  assetLinks?.[0]?.target?.sha256_cert_fingerprints?.[0] ?? nativePackage.signing?.sha256CertFingerprint ?? null
const rootAssetLinksNeeded =
  nativePackage.assetLinks?.publicGenerated === true &&
  nativePackage.assetLinks?.domainVerificationReady !== true &&
  nativePackage.assetLinks?.requiresRootWellKnownPath === true
const targetRepositoryConfigured = Boolean(targetRepository)
const targetRepositoryProbe = await probeGithubRepository(targetRepository)
const sourceAssetLinksReady = Array.isArray(assetLinks) && assetLinks.length > 0
const rootAssetLinksLive = await verifyRootAssetLinks({
  url: requiredRootUrl,
  packageName: sourcePackageName,
  sha256CertFingerprint: sourceSha256CertFingerprint,
})
const canUseGithubCli =
  repositoryReadiness.githubAutomation?.workflowDispatchReady === true ||
  repositoryReadiness.githubAutomation?.ghTokenConfigured === true
const status = rootAssetLinksLive.liveMatchesSource
  ? 'root-assetlinks-live'
  : !rootAssetLinksNeeded
    ? 'root-assetlinks-not-needed'
    : !sourceAssetLinksReady
    ? 'waiting-for-generated-assetlinks'
    : rootAssetLinksLive.liveMatchesSource
      ? 'root-assetlinks-live'
      : targetRepositoryProbe.exists
        ? 'root-assetlinks-handoff-ready'
        : targetRepositoryConfigured
          ? 'waiting-for-root-pages-repository'
          : 'waiting-for-root-pages-repository'

const syncCommand = `AGL_SYNC_ROOT_ASSETLINKS=1 AGL_ROOT_ASSETLINKS_REPOSITORY="${targetRepository ?? '<owner>/<owner>.github.io'}" ./ops/github/sync-root-assetlinks.sh`
const bootstrapCommand = `AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE=1 AGL_SYNC_ROOT_ASSETLINKS=1 AGL_SYNC_ROOT_ASSETLINKS_PAGES=1 AGL_ROOT_ASSETLINKS_REPOSITORY="${targetRepository ?? '<owner>/<owner>.github.io'}" ./ops/github/sync-root-assetlinks.sh`
const payload = {
  generatedAt: new Date().toISOString(),
  status,
  platform: 'android-trusted-web-activity',
  sourceStatus: {
    nativePackage: nativePackage.status,
    nativeAssetLinks: nativePackage.assetLinks?.status ?? 'missing',
    repositoryReadiness: repositoryReadiness.status ?? 'missing',
  },
  target: {
    repository: targetRepository,
    repositorySource: configuredTargetRepo ? 'environment' : inferredTargetRepo ? 'github-pages-host' : 'missing',
    repositoryExists: targetRepositoryProbe.exists,
    repositoryStatus: targetRepositoryProbe.status,
    repositoryDetail: targetRepositoryProbe.detail,
    branch: targetBranch,
    path: targetPath,
    requiredRootUrl,
    projectPublishedUrl,
  },
  live: rootAssetLinksLive,
  source: {
    path: 'public/.well-known/assetlinks.json',
    ready: sourceAssetLinksReady,
    relation: assetLinks?.[0]?.relation ?? [],
    packageName: sourcePackageName,
    sha256CertFingerprint: sourceSha256CertFingerprint,
  },
  handoff: {
    syncScriptPath: 'ops/github/sync-root-assetlinks.sh',
    syncCommand,
    bootstrapCommand,
    dryRunCommand: './ops/github/sync-root-assetlinks.sh',
    verificationCommand: `curl -fsSL "${requiredRootUrl ?? 'https://<host>/.well-known/assetlinks.json'}"`,
    afterSyncCommands: ['npm run autonomous:native-package', 'npm run autonomous:android-release-plan', 'npm run autonomous:readiness'],
  },
  controls: {
    zeroPaidSpend: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    dryRunByDefault: true,
    explicitApplyFlagRequired: true,
    explicitRepositoryCreateFlagRequired: true,
    explicitPagesConfigurationFlagRequired: true,
    targetRepositoryMustExist: false,
    sourceFileContentOnly: true,
    pagesSupportFilesAllowed: ['.nojekyll'],
    noSecretValues: true,
    noForcePush: true,
    branchProtectionRespected: true,
  },
  checks: [
    {
      id: 'root-assetlinks-needed',
      status: rootAssetLinksNeeded ? 'actionable' : 'pass',
      detail: rootAssetLinksNeeded
        ? `Android requires ${requiredRootUrl}; project Pages currently publishes ${projectPublishedUrl}.`
        : 'Native package is already root-verifiable or does not need a root handoff.',
    },
    {
      id: 'source-assetlinks',
      status: sourceAssetLinksReady ? 'pass' : 'blocker',
      detail: sourceAssetLinksReady ? 'Generated public assetlinks file is ready.' : 'public/.well-known/assetlinks.json is missing.',
    },
    {
      id: 'target-repository',
      status: targetRepositoryProbe.exists ? 'pass' : targetRepositoryConfigured ? 'repository-missing' : 'owner-input-required',
      detail: targetRepositoryProbe.exists
        ? `Prepared to sync into ${targetRepository}:${targetBranch}:${targetPath}.`
        : targetRepositoryConfigured
          ? `${targetRepository} does not exist yet; explicit repository bootstrap is available.`
          : 'Set AGL_ROOT_ASSETLINKS_REPOSITORY to the user/organization Pages repository.',
    },
    {
      id: 'root-live-verification',
      status: rootAssetLinksLive.liveMatchesSource ? 'pass' : 'blocker',
      detail: rootAssetLinksLive.detail,
    },
    {
      id: 'github-cli',
      status: canUseGithubCli ? 'available' : 'owner-input-required',
      detail: canUseGithubCli
        ? 'GitHub CLI automation is available for the repository context.'
        : 'A GitHub token with access to the root Pages repository is required before syncing.',
    },
  ],
  nextActions: [
    status === 'root-assetlinks-live'
      ? `Root Digital Asset Links are live at ${requiredRootUrl}.`
      : status === 'root-assetlinks-handoff-ready'
        ? `When root Pages repository access is available, run ${syncCommand}.`
        : status === 'waiting-for-root-pages-repository'
          ? `Create/sync the free root Pages repository with ${bootstrapCommand}.`
          : 'Keep Android release blocked until the root Digital Asset Links location is ready.',
    'After the root file is live, rerun native package, Android release plan, and readiness evidence.',
    'Do not create accounts, pay store fees, or submit to stores from this handoff.',
  ],
}

const syncScript = `#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE_FILE="$ROOT_DIR/public/.well-known/assetlinks.json"
TARGET_REPO="\${AGL_ROOT_ASSETLINKS_REPOSITORY:-${targetRepository ?? ''}}"
TARGET_BRANCH="\${AGL_ROOT_ASSETLINKS_BRANCH:-${targetBranch}}"
TARGET_FILE=".well-known/assetlinks.json"

if [[ ! -s "$SOURCE_FILE" ]]; then
  echo "missing source assetlinks file: $SOURCE_FILE" >&2
  exit 1
fi

if [[ -z "$TARGET_REPO" ]]; then
  echo "set AGL_ROOT_ASSETLINKS_REPOSITORY to <owner>/<owner>.github.io" >&2
  exit 1
fi

echo "source: $SOURCE_FILE"
echo "target: $TARGET_REPO:$TARGET_BRANCH:$TARGET_FILE"
echo "create repo: \${AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE:-0}"
echo "configure pages: \${AGL_SYNC_ROOT_ASSETLINKS_PAGES:-0}"

if [[ "\${AGL_SYNC_ROOT_ASSETLINKS:-0}" != "1" ]]; then
  echo "dry-run only; set AGL_SYNC_ROOT_ASSETLINKS=1 to sync the root Digital Asset Links file"
  exit 0
fi

WORKDIR="$(mktemp -d)"
cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

if ! gh repo view "$TARGET_REPO" >/dev/null 2>&1; then
  if [[ "\${AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE:-0}" != "1" ]]; then
    echo "target repository does not exist; set AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE=1 to create the free root Pages repository" >&2
    exit 1
  fi

  gh repo create "$TARGET_REPO" --public --description "Root GitHub Pages host for Autonomous Game Lab Android Digital Asset Links"
fi

if ! gh repo clone "$TARGET_REPO" "$WORKDIR/repo" -- --depth 1 --branch "$TARGET_BRANCH"; then
  mkdir -p "$WORKDIR/repo"
  cd "$WORKDIR/repo"
  git init
  git checkout -B "$TARGET_BRANCH"
  git remote add origin "git@github.com:$TARGET_REPO.git"
  cd "$ROOT_DIR"
fi

mkdir -p "$WORKDIR/repo/.well-known"
cp "$SOURCE_FILE" "$WORKDIR/repo/$TARGET_FILE"
touch "$WORKDIR/repo/.nojekyll"

cd "$WORKDIR/repo"
if [[ -z "$(git status --porcelain -- "$TARGET_FILE" ".nojekyll")" ]]; then
  echo "root Digital Asset Links already current"
else
  git config user.name "autonomous-game-lab-bot"
  git config user.email "autonomous-game-lab-bot@users.noreply.github.com"
  git add "$TARGET_FILE" ".nojekyll"
  git commit -m "Sync Android Digital Asset Links"
  git push origin "HEAD:$TARGET_BRANCH"
fi

if [[ "\${AGL_SYNC_ROOT_ASSETLINKS_PAGES:-0}" == "1" ]]; then
  if gh api "repos/$TARGET_REPO/pages" >/dev/null 2>&1; then
    echo "GitHub Pages already configured for $TARGET_REPO"
  else
    gh api --method POST "repos/$TARGET_REPO/pages" -F "source[branch]=$TARGET_BRANCH" -F "source[path]=/" >/dev/null ||
      echo "GitHub Pages API did not confirm configuration; user Pages repositories may activate from the default branch automatically"
  fi
fi
`
const report = [
  '# Android Root Asset Links Handoff',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Target repository: ${payload.target.repository ?? 'missing'}`,
  `Required root URL: ${payload.target.requiredRootUrl ?? 'missing'}`,
  `Project Pages URL: ${payload.target.projectPublishedUrl ?? 'missing'}`,
  `Repository exists: ${payload.target.repositoryExists}`,
  `Root live status: ${payload.live.status}`,
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Commands',
  '',
  `- Dry run: \`${payload.handoff.dryRunCommand}\``,
  `- Sync: \`${payload.handoff.syncCommand}\``,
  `- Bootstrap: \`${payload.handoff.bootstrapCommand}\``,
  `- Verify: \`${payload.handoff.verificationCommand}\``,
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((item) => `- ${item}`),
  '',
]
const uiPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  target: {
    repository: payload.target.repository,
  },
  handoff: {
    syncScriptPath: payload.handoff.syncScriptPath,
  },
  controls: {
    dryRunByDefault: payload.controls.dryRunByDefault,
  },
}

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(syncScriptPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const androidRootAssetlinksHandoff = ${JSON.stringify(uiPayload, null, 2)} as const\n\nexport type AndroidRootAssetlinksHandoff = typeof androidRootAssetlinksHandoff\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(syncScriptPath, syncScript)
await chmod(syncScriptPath, 0o755)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, syncScriptPath)}`)
