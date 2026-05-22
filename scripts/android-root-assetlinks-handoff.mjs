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
const cleanGithubOwner = (value) => {
  const owner = String(value ?? '').trim()

  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) ? owner : null
}
const repoFromGithubIoHost = (host) => {
  const match = String(host ?? '').match(/^([A-Za-z0-9-]+)\.github\.io$/)
  const owner = cleanGithubOwner(match?.[1])

  return owner ? `${owner}/${owner}.github.io` : null
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
const rootAssetLinksNeeded =
  nativePackage.assetLinks?.publicGenerated === true &&
  nativePackage.assetLinks?.domainVerificationReady !== true &&
  nativePackage.assetLinks?.requiresRootWellKnownPath === true
const targetRepositoryReady = Boolean(targetRepository)
const sourceAssetLinksReady = Array.isArray(assetLinks) && assetLinks.length > 0
const canUseGithubCli =
  repositoryReadiness.githubAutomation?.workflowDispatchReady === true ||
  repositoryReadiness.githubAutomation?.ghTokenConfigured === true
const status = !rootAssetLinksNeeded
  ? 'root-assetlinks-not-needed'
  : !sourceAssetLinksReady
    ? 'waiting-for-generated-assetlinks'
    : targetRepositoryReady
      ? 'root-assetlinks-handoff-ready'
      : 'waiting-for-root-pages-repository'

const syncCommand = `AGL_SYNC_ROOT_ASSETLINKS=1 AGL_ROOT_ASSETLINKS_REPOSITORY="${targetRepository ?? '<owner>/<owner>.github.io'}" ./ops/github/sync-root-assetlinks.sh`
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
    branch: targetBranch,
    path: targetPath,
    requiredRootUrl,
    projectPublishedUrl,
  },
  source: {
    path: 'public/.well-known/assetlinks.json',
    ready: sourceAssetLinksReady,
    relation: assetLinks?.[0]?.relation ?? [],
    packageName: assetLinks?.[0]?.target?.package_name ?? nativePackage.packageName,
    sha256CertFingerprint:
      assetLinks?.[0]?.target?.sha256_cert_fingerprints?.[0] ??
      nativePackage.signing?.sha256CertFingerprint ??
      null,
  },
  handoff: {
    syncScriptPath: 'ops/github/sync-root-assetlinks.sh',
    syncCommand,
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
    targetRepositoryMustExist: true,
    sourceFileOnly: true,
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
      status: targetRepositoryReady ? 'prepared' : 'owner-input-required',
      detail: targetRepositoryReady
        ? `Prepared to sync into ${targetRepository}:${targetBranch}:${targetPath}.`
        : 'Set AGL_ROOT_ASSETLINKS_REPOSITORY to the user/organization Pages repository.',
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
    status === 'root-assetlinks-handoff-ready'
      ? `When root Pages repository access is available, run ${syncCommand}.`
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

if [[ "\${AGL_SYNC_ROOT_ASSETLINKS:-0}" != "1" ]]; then
  echo "dry-run only; set AGL_SYNC_ROOT_ASSETLINKS=1 to sync the root Digital Asset Links file"
  exit 0
fi

WORKDIR="$(mktemp -d)"
cleanup() {
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

gh repo view "$TARGET_REPO" >/dev/null
gh repo clone "$TARGET_REPO" "$WORKDIR/repo" -- --depth 1 --branch "$TARGET_BRANCH"
mkdir -p "$WORKDIR/repo/.well-known"
cp "$SOURCE_FILE" "$WORKDIR/repo/$TARGET_FILE"

cd "$WORKDIR/repo"
if git diff --quiet -- "$TARGET_FILE"; then
  echo "root Digital Asset Links already current"
  exit 0
fi

git config user.name "autonomous-game-lab-bot"
git config user.email "autonomous-game-lab-bot@users.noreply.github.com"
git add "$TARGET_FILE"
git commit -m "Sync Android Digital Asset Links"
git push origin "HEAD:$TARGET_BRANCH"
`
const report = [
  '# Android Root Asset Links Handoff',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Target repository: ${payload.target.repository ?? 'missing'}`,
  `Required root URL: ${payload.target.requiredRootUrl ?? 'missing'}`,
  `Project Pages URL: ${payload.target.projectPublishedUrl ?? 'missing'}`,
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
  `- Verify: \`${payload.handoff.verificationCommand}\``,
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((item) => `- ${item}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(syncScriptPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const androidRootAssetlinksHandoff = ${JSON.stringify(payload, null, 2)} as const\n\nexport type AndroidRootAssetlinksHandoff = typeof androidRootAssetlinksHandoff\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(syncScriptPath, syncScript)
await chmod(syncScriptPath, 0o755)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, syncScriptPath)}`)
