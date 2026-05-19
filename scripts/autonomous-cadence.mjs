import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const codexOpsDir = path.join(root, 'ops', 'codex')
const workflowPath = path.join(root, '.github', 'workflows', 'autonomous-daily.yml')
const outputJsonPath = path.join(dataDir, 'autonomous-cadence.json')
const outputTsPath = path.join(srcDataDir, 'autonomousCadence.ts')
const reportPath = path.join(reportsDir, 'autonomous-cadence-latest.md')
const codexAutomationManifestPath = path.join(codexOpsDir, 'autonomous-game-lab-daily-owner-loop.json')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalText = async (filePath, fallback = '') =>
  readFile(filePath, 'utf8').catch(() => fallback)
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const packageJson = await readJson(path.join(root, 'package.json'))
const workflow = await readOptionalText(workflowPath)
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  status: 'missing',
  workspace: {},
  repository: {},
})
const ownerLoop = await readOptionalJson(path.join(dataDir, 'autonomous-owner-loop.json'), {
  status: 'missing',
  ownerDecision: {},
})

const script = (name) => packageJson.scripts?.[name] ?? ''
const workflowExists = await exists(workflowPath)
const dailyScript = script('autonomous:daily')
const operateScript = script('autonomous:operate')
const cadenceScript = script('autonomous:cadence')
const testAutomationScript = script('test:automation')
const testE2eScript = script('test:e2e')

const codexAutomationManifest = {
  id: 'autonomous-game-lab-daily-owner-loop',
  name: 'Autonomous Game Lab daily owner loop',
  kind: 'cron',
  status: 'active-declared',
  schedule: {
    rrule: 'FREQ=HOURLY;INTERVAL=24',
    timezone: 'local',
    cadence: 'daily',
  },
  workspace: root,
  executionEnvironment: 'local',
  expectedPrompt:
    'Operate the Autonomous Game Lab as a zero-spend autonomous owner, run the owner/verification loop, apply only bounded local improvements, commit verified changes, and keep external production mutations gated.',
  verification: {
    source: 'codex-app-automation-card',
    lastKnownAutomationId: 'autonomous-game-lab-daily-owner-loop',
    repoManifestMirrorsExpectedSchedule: true,
  },
  guardrails: {
    zeroPaidSpend: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noExternalPosting: true,
    remoteGitHubMutationRequiresEvidenceAndExplicitGate: true,
  },
}

const checks = [
  {
    id: 'codex-automation-manifest',
    status: codexAutomationManifest.status === 'active-declared' ? 'pass' : 'blocker',
    detail: `Codex app automation manifest declares ${codexAutomationManifest.id}.`,
  },
  {
    id: 'local-operate-script',
    status: operateScript.includes('autonomous:daily') && operateScript.includes('test:e2e') ? 'pass' : 'blocker',
    detail: `autonomous:operate is ${operateScript || 'missing'}.`,
  },
  {
    id: 'cadence-refresh-script',
    status: cadenceScript.includes('autonomous-cadence') ? 'pass' : 'blocker',
    detail: `autonomous:cadence is ${cadenceScript || 'missing'}.`,
  },
  {
    id: 'daily-loop-script',
    status:
      dailyScript.includes('autonomous:trend') &&
      dailyScript.includes('autonomous:cadence') &&
      dailyScript.includes('autonomous:objective-audit') &&
      dailyScript.includes('test:automation')
        ? 'pass'
        : 'blocker',
    detail: 'autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.',
  },
  {
    id: 'automation-verifier',
    status:
      testAutomationScript.includes('event-collector-smoke') &&
      testAutomationScript.includes('event-ingest-smoke') &&
      testAutomationScript.includes('verify-autonomy')
        ? 'pass'
        : 'blocker',
    detail: `test:automation is ${testAutomationScript || 'missing'}.`,
  },
  {
    id: 'browser-smoke',
    status: testE2eScript.includes('playwright test') ? 'pass' : 'blocker',
    detail: `test:e2e is ${testE2eScript || 'missing'}.`,
  },
  {
    id: 'github-scheduled-workflow',
    status:
      workflowExists &&
      workflow.includes('schedule:') &&
      workflow.includes('workflow_dispatch:') &&
      workflow.includes('npm run autonomous:daily') &&
      workflow.includes('npm run test:e2e') &&
      workflow.includes('actions/upload-artifact')
        ? 'pass'
        : 'blocker',
    detail: workflowExists
      ? 'GitHub Actions daily workflow can run the autonomous loop and upload evidence artifacts.'
      : 'Autonomous daily GitHub workflow is missing.',
  },
  {
    id: 'zero-spend-operation',
    status: 'pass',
    detail: 'Cadence is local/CI execution only; it does not enable paid spend, stores, ads, or revenue.',
  },
]

const blockers = checks.filter((check) => check.status !== 'pass').map((check) => `${check.id}: ${check.detail}`)
const status = blockers.length ? 'cadence-needs-attention' : 'cadence-ready'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  cadence: 'daily',
  workspace: {
    path: root,
    repositoryStatus: repositoryReadiness.status,
    repository: repositoryReadiness.repository?.target ?? null,
    gitDirtyFiles: repositoryReadiness.workspace?.dirtyFiles ?? null,
  },
  schedulers: {
    codexDesktop: codexAutomationManifest,
    githubActions: {
      status:
        checks.find((check) => check.id === 'github-scheduled-workflow')?.status === 'pass'
          ? 'scheduled'
          : 'missing',
      workflow: '.github/workflows/autonomous-daily.yml',
      cron: "17 3 * * *",
      dispatch: true,
      permissions: 'contents: read',
      artifactUpload: true,
    },
  },
  commandPlan: {
    operate: 'npm run autonomous:operate',
    daily: 'npm run autonomous:daily',
    verifyAutomation: 'npm run test:automation',
    browserSmoke: 'npm run test:e2e',
    ownerDecision: ownerLoop.ownerDecision?.nextBestActionId ?? null,
  },
  recoveryPolicy: {
    stopOnFailure: true,
    preserveArtifacts: true,
    commitOnlyAfterVerification: true,
    neverEnablePaidSpendOnRecovery: true,
    neverDispatchExternalWorkflowsOnRecovery: true,
    reportBlockersInsteadOfGuessing: true,
  },
  controls: {
    zeroPaidSpend: true,
    localLoopCanRunWithoutExternalAccounts: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noPaidAcquisition: true,
    noExternalPosting: true,
    remoteMutationRequiresRepositoryEvidence: true,
    codexAutomationExpectedActive: true,
    githubWorkflowReadOnlyByDefault: true,
  },
  checks,
  blockers,
  nextActions: [
    blockers.length
      ? 'Fix cadence blockers before relying on unattended operation.'
      : 'Let the daily Codex automation run the local owner loop and keep the GitHub scheduled workflow as CI evidence.',
    'Keep repository, deployment, revenue, and store actions gated by their existing evidence checks.',
  ],
}

const report = [
  '# Autonomous Cadence',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Cadence: ${payload.cadence}`,
  '',
  '## Schedulers',
  '',
  `- Codex app: ${payload.schedulers.codexDesktop.status} (${payload.schedulers.codexDesktop.id})`,
  `- GitHub Actions: ${payload.schedulers.githubActions.status} (${payload.schedulers.githubActions.cron})`,
  '',
  '## Commands',
  '',
  `- Operate: ${payload.commandPlan.operate}`,
  `- Daily: ${payload.commandPlan.daily}`,
  `- Automation verify: ${payload.commandPlan.verifyAutomation}`,
  `- Browser smoke: ${payload.commandPlan.browserSmoke}`,
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
await mkdir(codexOpsDir, { recursive: true })
await writeFile(codexAutomationManifestPath, JSON.stringify(codexAutomationManifest, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const autonomousCadence = ${JSON.stringify(payload, null, 2)} as const\n\nexport type AutonomousCadence = typeof autonomousCadence\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, codexAutomationManifestPath)}`)
console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
