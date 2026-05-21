import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'autonomous-self-update.json')
const outputTsPath = path.join(srcDataDir, 'autonomousSelfUpdate.ts')
const reportPath = path.join(reportsDir, 'autonomous-self-update-latest.md')
const dailyWorkflowPath = path.join(root, '.github', 'workflows', 'autonomous-daily.yml')
const selfUpdateWorkflowPath = path.join(root, '.github', 'workflows', 'autonomous-self-update.yml')
const webDeployWorkflowPath = path.join(root, '.github', 'workflows', 'web-pwa-deploy.yml')

const argv = process.argv.slice(2)
const assertSafe = argv.includes('--assert-safe')

const run = (command, args) =>
  new Promise((resolve) => {
    execFile(command, args, { cwd: root, timeout: 6_000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
      })
    })
  })

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readOptionalText = async (filePath, fallback = '') =>
  readFile(filePath, 'utf8').catch(() => fallback)

const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const configured = (value) => typeof value === 'string' && value.trim().length > 0

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

const normalizeGitStatusPath = (value) => {
  const renamedPath = value.includes(' -> ') ? value.split(' -> ').at(-1) : value
  return renamedPath.replace(/^"|"$/g, '')
}

const parseGitStatus = (stdout) =>
  stdout
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => ({
      code: line.slice(0, 2).trim() || line.slice(0, 2),
      path: normalizeGitStatusPath(line.slice(3)),
      raw: line,
    }))

const allowedPrefixes = [
  'data/',
  'reports/',
  'src/data/',
  'public/games/',
  'public/icons/',
  'public/store-assets/',
  'native/android/',
  'ops/codex/',
]
const allowedExactPaths = new Set([
  'public/app-ads.txt',
  'public/compliance.json',
  'public/gate-sample.html',
  'public/install.html',
  'public/measurement-status.html',
  'public/measurement-status.json',
  'public/monetization.json',
  'public/privacy.html',
  'public/.well-known/assetlinks.json',
  'public/robots.txt',
  'public/seed-kit.html',
  'public/share-manifest.json',
  'public/sitemap.xml',
  'public/support.html',
  'ops/cloudflare/wrangler.toml.example',
  'ops/github/README.md',
  'ops/github/bootstrap-repository.sh',
  'ops/github/setup-production.sh',
  'ops/production.env.example',
])
const blockedPrefixes = [
  '.github/workflows/',
  'data/player-events/',
  'scripts/',
  'src/App.tsx',
  'src/components/',
  'src/game/',
  'src/lib/',
  'docs/',
]
const blockedExactPaths = new Set(['README.md', 'package.json', 'package-lock.json', 'vite.config.ts'])
const selfReportPaths = [
  'data/autonomous-self-update.json',
  'src/data/autonomousSelfUpdate.ts',
  'reports/autonomous-self-update-latest.md',
]

const isAllowedGeneratedPath = (filePath) =>
  allowedExactPaths.has(filePath) || allowedPrefixes.some((prefix) => filePath.startsWith(prefix))

const isBlockedSourcePath = (filePath) =>
  blockedExactPaths.has(filePath) || blockedPrefixes.some((prefix) => filePath.startsWith(prefix))

const classifyChange = (change) => {
  const safe = isAllowedGeneratedPath(change.path) && !isBlockedSourcePath(change.path)

  return {
    ...change,
    safe,
    reason: safe ? 'allowlisted-generated-artifact' : 'outside-autonomous-generated-allowlist',
  }
}

const packageJson = await readOptionalJson(path.join(root, 'package.json'), { scripts: {} })
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  status: 'missing',
  repository: {},
  githubAutomation: {},
  workspace: {},
})
const autonomousCadence = await readOptionalJson(path.join(dataDir, 'autonomous-cadence.json'), {
  status: 'missing',
  commandPlan: {},
})
const productionReadiness = await readOptionalJson(path.join(dataDir, 'production-readiness.json'), {
  webPwa: { status: 'missing' },
})
const ownerLoop = await readOptionalJson(path.join(dataDir, 'autonomous-owner-loop.json'), {
  status: 'missing',
  ownerDecision: {},
})
const dailyWorkflow = await readOptionalText(dailyWorkflowPath)
const selfUpdateWorkflow = await readOptionalText(selfUpdateWorkflowPath)
const webDeployWorkflow = await readOptionalText(webDeployWorkflowPath)
const dailyWorkflowExists = await exists(dailyWorkflowPath)
const selfUpdateWorkflowExists = await exists(selfUpdateWorkflowPath)
const webDeployWorkflowExists = await exists(webDeployWorkflowPath)

const gitInsideResult = await run('git', ['rev-parse', '--is-inside-work-tree'])
const insideWorkTree = gitInsideResult.ok && gitInsideResult.stdout === 'true'
const gitBranchResult = insideWorkTree ? await run('git', ['branch', '--show-current']) : { ok: false, stdout: null }
const gitRemoteResult = insideWorkTree ? await run('git', ['remote', 'get-url', 'origin']) : { ok: false, stdout: null }
const gitStatusResult = insideWorkTree
  ? await run('git', ['status', '--short', '--untracked-files=all'])
  : { ok: false, stdout: '' }

const currentChanges = parseGitStatus(gitStatusResult.stdout).map(classifyChange)
const safeChanges = currentChanges.filter((change) => change.safe)
const unsafeChanges = currentChanges.filter((change) => !change.safe)
const remoteRepository = repositoryFromRemote(gitRemoteResult.ok ? gitRemoteResult.stdout : null)
const targetRepository = process.env.GITHUB_REPOSITORY ?? process.env.GH_REPO ?? repositoryReadiness.repository?.target ?? remoteRepository
const githubTokenConfigured =
  repositoryReadiness.githubAutomation?.ghTokenConfigured === true ||
  configured(process.env.GH_TOKEN) ||
  configured(process.env.GITHUB_TOKEN)
const githubCredentialConfigured =
  githubTokenConfigured || repositoryReadiness.githubAutomation?.ghCredentialReady === true
const directPushConfigured = ['1', 'true', 'yes'].includes(
  String(process.env.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT ?? '').toLowerCase(),
)
const selfUpdateEnabled = ['1', 'true', 'yes'].includes(
  String(process.env.AGL_AUTONOMOUS_SELF_UPDATE ?? '').toLowerCase(),
)

const packageSelfUpdateScript = packageJson.scripts?.['autonomous:self-update'] ?? ''
const dailyScript = packageJson.scripts?.['autonomous:daily'] ?? ''
const operateScript = packageJson.scripts?.['autonomous:operate'] ?? ''

const checks = [
  {
    id: 'script-registered',
    status: packageSelfUpdateScript.includes('autonomous-self-update') ? 'pass' : 'blocker',
    detail: `autonomous:self-update is ${packageSelfUpdateScript || 'missing'}.`,
  },
  {
    id: 'daily-loop-refresh',
    status: dailyScript.includes('autonomous:self-update') ? 'pass' : 'blocker',
    detail: 'autonomous:daily refreshes self-update evidence before owner/audit evidence.',
  },
  {
    id: 'daily-workflow-read-only',
    status:
      dailyWorkflowExists &&
      dailyWorkflow.includes('permissions:') &&
      dailyWorkflow.includes('contents: read') &&
      dailyWorkflow.includes('npm run autonomous:operate')
        ? 'pass'
        : 'blocker',
    detail: 'The ordinary daily workflow remains read-only, runs the owner loop, and uploads evidence artifacts.',
  },
  {
    id: 'self-update-workflow',
    status:
      selfUpdateWorkflowExists &&
      selfUpdateWorkflow.includes("workflows: ['Autonomous Daily Studio']") &&
      selfUpdateWorkflow.includes("vars.AGL_AUTONOMOUS_SELF_UPDATE == '1'") &&
      selfUpdateWorkflow.includes('contents: write') &&
      selfUpdateWorkflow.includes('npm run autonomous:operate') &&
      selfUpdateWorkflow.includes('npm run autonomous:self-update -- --assert-safe') &&
      selfUpdateWorkflow.includes('GITHUB_TOKEN: ${{ github.token }}') &&
      selfUpdateWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}') &&
      selfUpdateWorkflow.includes('AGL_ANDROID_KEYSTORE_BASE64') &&
      selfUpdateWorkflow.includes('AGL_ANDROID_SHA256_CERT_FINGERPRINT') &&
      selfUpdateWorkflow.includes('VITE_BASE_PATH') &&
      selfUpdateWorkflow.includes('AGL_PUBLIC_ORIGIN')
        ? 'pass'
        : 'blocker',
    detail:
      'A separate gated workflow can reproduce the owner loop with production env, verify it with gate env, and persist allowlisted changes.',
  },
  {
    id: 'post-self-update-deploy',
    status:
      webDeployWorkflowExists &&
      webDeployWorkflow.includes("workflows: ['Autonomous Daily Studio', 'Autonomous Self Update']") &&
      webDeployWorkflow.includes('npm run autonomous:assert-deployable') &&
      webDeployWorkflow.includes('npm run autonomous:post-deploy-smoke -- --assert')
        ? 'pass'
        : 'blocker',
    detail: webDeployWorkflowExists
      ? 'Pages redeploys after the gated self-update workflow, then repeats deployability and post-deploy smoke checks.'
      : 'Web PWA deploy workflow is missing.',
  },
  {
    id: 'safe-path-allowlist',
    status: unsafeChanges.length === 0 ? 'pass' : 'blocker',
    detail: `${safeChanges.length} safe pending file(s), ${unsafeChanges.length} unsafe pending file(s).`,
  },
  {
    id: 'repository-optional',
    status: insideWorkTree ? 'pass' : 'blocker',
    detail: insideWorkTree
      ? `Git worktree is available on ${gitBranchResult.stdout || 'detached-head'}.`
      : 'A git worktree is required before self-update can persist changes.',
  },
  {
    id: 'remote-push-gated',
    status: 'pass',
    detail: githubCredentialConfigured && directPushConfigured
      ? `Direct push is configured for ${targetRepository ?? 'the current repository'}.`
      : 'Remote push remains held until GitHub credentials and AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1 are configured.',
  },
  {
    id: 'zero-spend-controls',
    status: operateScript.includes('test:e2e') ? 'pass' : 'blocker',
    detail: operateScript.includes('test:e2e')
      ? 'Self-update owner-loop verification includes browser smoke coverage and does not create accounts, stores, ads, paid traffic, or revenue.'
      : 'autonomous:operate must include browser smoke coverage before self-update can persist changes.',
  },
]

const blockers = checks.filter((check) => check.status === 'blocker').map((check) => `${check.id}: ${check.detail}`)
const status = blockers.length ? 'self-update-needs-attention' : 'self-update-ready'
const stagePaths = [
  ...new Set([
    ...safeChanges.map((change) => change.path),
    ...selfReportPaths,
  ]),
].filter((filePath) => isAllowedGeneratedPath(filePath))

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  mode: 'plan-and-assert',
  envFiles: localEnv,
  repository: {
    target: targetRepository ?? null,
    originRemote: gitRemoteResult.ok ? gitRemoteResult.stdout : null,
    remoteRepository,
    currentBranch: gitBranchResult.ok ? gitBranchResult.stdout || null : null,
    insideWorkTree,
    githubTokenConfigured,
    githubCredentialConfigured,
    directPushConfigured,
    selfUpdateEnabled,
    remotePushReady: Boolean(targetRepository && githubCredentialConfigured && directPushConfigured),
  },
  sourceStatus: {
    repositoryReadiness: repositoryReadiness.status,
    productionReadiness: productionReadiness.webPwa?.status ?? 'missing',
    autonomousCadence: autonomousCadence.status,
    ownerLoop: ownerLoop.status,
  },
  pendingChanges: {
    total: currentChanges.length,
    safe: safeChanges,
    unsafe: unsafeChanges,
    safeCount: safeChanges.length,
    unsafeCount: unsafeChanges.length,
  },
  commitPlan: {
    workflow: '.github/workflows/autonomous-self-update.yml',
    enabledByRepositoryVariable: 'AGL_AUTONOMOUS_SELF_UPDATE=1',
    directPushRequiresRepositoryVariable: 'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1',
    deployAfterCommit: '.github/workflows/web-pwa-deploy.yml',
    verificationBeforeCommit: ['npm run autonomous:operate', 'npm run autonomous:self-update -- --assert-safe'],
    stagePaths,
    commitMessage: 'Autonomous daily self-update',
    skipWhenNoAllowlistedChanges: true,
  },
  policy: {
    allowedPrefixes,
    allowedExactPaths: [...allowedExactPaths].sort(),
    blockedPrefixes,
    blockedExactPaths: [...blockedExactPaths].sort(),
    selfReportPaths,
  },
  privacy: {
    rawEventDropsCommitBlocked: blockedPrefixes.includes('data/player-events/'),
    localEventRollupsOnly: true,
    blockedRawEventDropPrefix: 'data/player-events/',
  },
  controls: {
    zeroPaidSpend: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noPaidAcquisition: true,
    dailyWorkflowReadOnly: true,
    writePermissionIsolatedToSelfUpdateWorkflow: true,
    commitRequiresCleanVerification: true,
    commitRequiresSafePathAllowlist: true,
    remotePushRequiresGitHubToken: true,
    directPushRequiresExplicitVariable: true,
    doesNotStageSourceOrWorkflowChanges: true,
  },
  checks,
  blockers,
  nextActions: [
    blockers.length
      ? 'Fix self-update workflow or allowlist blockers before enabling autonomous persistence.'
      : 'When a GitHub repository is connected, set AGL_AUTONOMOUS_SELF_UPDATE=1 and AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1 to let verified generated changes persist.',
    'Keep source-code changes outside this allowlist so production automation cannot rewrite core app logic without an explicit development change.',
  ],
}
const appPayload = {
  status: payload.status,
  repository: {
    remotePushReady: payload.repository.remotePushReady,
  },
  pendingChanges: {
    safeCount: payload.pendingChanges.safeCount,
  },
  commitPlan: {
    workflow: payload.commitPlan.workflow,
    deployAfterCommit: payload.commitPlan.deployAfterCommit,
  },
}

const report = [
  '# Autonomous Self Update',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  '',
  '## Repository',
  '',
  `- Target: ${payload.repository.target ?? 'missing'}`,
  `- Origin: ${payload.repository.remoteRepository ?? 'missing'}`,
  `- Branch: ${payload.repository.currentBranch ?? 'missing'}`,
  `- Self-update enabled: ${payload.repository.selfUpdateEnabled}`,
  `- Direct push ready: ${payload.repository.remotePushReady}`,
  '',
  '## Pending Changes',
  '',
  `- Total: ${payload.pendingChanges.total}`,
  `- Safe: ${payload.pendingChanges.safeCount}`,
  `- Unsafe: ${payload.pendingChanges.unsafeCount}`,
  '',
  '## Commit Plan',
  '',
  `- Workflow: ${payload.commitPlan.workflow}`,
  `- Gate: ${payload.commitPlan.enabledByRepositoryVariable}`,
  `- Direct push gate: ${payload.commitPlan.directPushRequiresRepositoryVariable}`,
  `- Deploy after commit: ${payload.commitPlan.deployAfterCommit}`,
  `- Message: ${payload.commitPlan.commitMessage}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Blockers',
  '',
  ...(payload.blockers.length ? payload.blockers.map((blocker) => `- ${blocker}`) : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const autonomousSelfUpdate = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type AutonomousSelfUpdate = typeof autonomousSelfUpdate\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (assertSafe && payload.status !== 'self-update-ready') {
  console.error('Autonomous self-update is not safe to stage.')
  process.exit(1)
}
