import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'production-activation.json')
const outputTsPath = path.join(srcDataDir, 'productionActivation.ts')
const reportPath = path.join(reportsDir, 'production-activation-latest.md')

const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const boolEnv = (name, fallback = false) => {
  const value = process.env[name]

  if (value === undefined || value === '') {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const configured = (value) => typeof value === 'string' && value.trim().length > 0
const secretEnvNames = [
  'GH_TOKEN',
  'GITHUB_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'VITE_EVENT_COLLECTOR_WRITE_TOKEN',
  'AGL_EVENT_COLLECTOR_ADMIN_TOKEN',
  'POSTHOG_PERSONAL_API_KEY',
  'AGL_ANDROID_KEYSTORE_BASE64',
  'AGL_ANDROID_KEYSTORE_PASSWORD',
  'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON',
]
const secretValues = secretEnvNames.map((name) => process.env[name]).filter((value) => configured(value) && value.length > 3)
const redact = (value) =>
  secretValues.reduce((text, secret) => text.replaceAll(secret, '[redacted]'), String(value ?? ''))

const runCommand = (id, command, args, extraEnv = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: root,
      env: {
        ...process.env,
        ...extraEnv,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('close', (code) => {
      resolve({
        id,
        exitCode: code ?? 1,
        stdoutTail: redact(stdout).split('\n').filter(Boolean).slice(-10),
        stderrTail: redact(stderr).split('\n').filter(Boolean).slice(-10),
      })
    })
  })

const [
  localEnv,
  repositoryReadiness,
  repositoryBootstrap,
  productionBootstrap,
  deployment,
  postDeploySmoke,
  unitEconomics,
  androidRelease,
] = await Promise.all([
  loadLocalEnv({ root }),
  readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
    status: 'missing',
    repository: {},
    githubAutomation: {},
    workspace: {},
    blockers: [],
  }),
  readOptionalJson(path.join(dataDir, 'repository-bootstrap.json'), {
    status: 'missing',
    controls: {},
    helper: {},
    blockers: [],
  }),
  readOptionalJson(path.join(dataDir, 'production-bootstrap.json'), {
    status: 'missing',
    mode: 'missing',
    repository: {},
    setupScript: {},
    setupCommands: [],
    requiredVariables: [],
    requiredSecrets: [],
    controls: {},
  }),
  readOptionalJson(path.join(dataDir, 'deployment-plan.json'), { status: 'missing' }),
  readOptionalJson(path.join(dataDir, 'post-deploy-smoke.json'), { status: 'missing', target: {} }),
  readOptionalJson(path.join(dataDir, 'unit-economics.json'), { controls: {} }),
  readOptionalJson(path.join(dataDir, 'android-release.json'), { status: 'missing' }),
])

const activationRequested = boolEnv('AGL_PRODUCTION_ACTIVATE')
const runWebWorkflows = boolEnv('AGL_PRODUCTION_RUN_WORKFLOWS', boolEnv('RUN_WORKFLOWS'))
const allowRepositoryBootstrap = boolEnv('AGL_ALLOW_REPOSITORY_BOOTSTRAP')
const allowAndroidWorkflow =
  boolEnv('ALLOW_ANDROID_RELEASE_WORKFLOW') &&
  unitEconomics.controls?.storeSpendAllowed === true &&
  androidRelease.status === 'ready-for-internal-testing'
const ghCredentialReady =
  repositoryReadiness.githubAutomation?.ghCredentialReady === true ||
  productionBootstrap.repository?.ghCredentialReady === true ||
  configured(process.env.GH_TOKEN) ||
  configured(process.env.GITHUB_TOKEN)
const repositoryTargetKnown = Boolean(
  repositoryReadiness.repository?.target ??
    productionBootstrap.repository?.githubRepository ??
    process.env.GITHUB_REPOSITORY ??
    process.env.GH_REPO ??
    process.env.AGL_GITHUB_OWNER,
)
const deploymentReady = deployment.status === 'ready-for-pages'
const setupScriptPath = productionBootstrap.setupScript?.path ?? 'ops/github/setup-production.sh'
const repositoryBootstrapPath = repositoryBootstrap.helper?.path ?? 'ops/github/bootstrap-repository.sh'
const configuredVariables = (productionBootstrap.requiredVariables ?? []).filter((item) => item.configured).length
const configuredSecrets = (productionBootstrap.requiredSecrets ?? []).filter((item) => item.configured).length

const plannedActions = [
  {
    id: 'repository-bootstrap',
    command: repositoryBootstrapPath,
    args: [],
    status: allowRepositoryBootstrap ? 'ready' : 'waiting-for-explicit-bootstrap-gate',
    canRun: activationRequested && allowRepositoryBootstrap,
    costUsd: 0,
    mutatesExternalState: allowRepositoryBootstrap,
    reason: allowRepositoryBootstrap
      ? 'Repository bootstrap gates are present; helper may create/attach/push only for explicitly allowed operations.'
      : 'Held until AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 and the specific repository mutation gates are present.',
  },
  {
    id: 'sync-production-settings',
    command: setupScriptPath,
    args: [],
    status: ghCredentialReady && repositoryTargetKnown ? 'ready' : 'waiting-for-github-credentials',
    canRun: activationRequested && ghCredentialReady && repositoryTargetKnown,
    costUsd: 0,
    mutatesExternalState: true,
    reason:
      ghCredentialReady && repositoryTargetKnown
        ? 'GitHub credentials and repository target are available; setup can sync configured variables, secrets, and Pages settings.'
        : 'Held until an existing GitHub repository target and gh credentials are available.',
  },
]

const executionResults = []
let executionStatus = activationRequested ? 'held' : 'dry-run'

if (activationRequested) {
  executionStatus = 'executed'

  for (const action of plannedActions.filter((item) => item.canRun)) {
    const extraEnv =
      action.id === 'sync-production-settings'
        ? {
            RUN_WORKFLOWS: runWebWorkflows && deploymentReady ? '1' : '0',
            ALLOW_ANDROID_RELEASE_WORKFLOW: allowAndroidWorkflow ? '1' : '0',
          }
        : {}
    const result = await runCommand(action.id, 'bash', [action.command, ...action.args], extraEnv)
    executionResults.push(result)

    if (result.exitCode !== 0) {
      executionStatus = 'failed'
      break
    }
  }

  if (executionResults.length === 0) {
    executionStatus = 'held'
  }
}

const runnableActions = plannedActions.filter((item) => item.canRun)
const setupReady = plannedActions.some((item) => item.id === 'sync-production-settings' && item.status === 'ready')
const status =
  executionStatus === 'failed'
    ? 'activation-failed'
    : executionStatus === 'executed'
      ? 'activation-applied'
      : setupReady
        ? 'activation-ready'
        : 'activation-waiting-for-credentials'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  mode: activationRequested ? 'apply-configured-actions' : 'dry-run',
  envFiles: localEnv,
  sourceStatus: {
    repositoryReadiness: repositoryReadiness.status,
    repositoryBootstrap: repositoryBootstrap.status,
    productionBootstrap: productionBootstrap.status,
    deployment: deployment.status,
    postDeploySmoke: postDeploySmoke.status,
  },
  configuration: {
    activationRequested,
    repositoryTargetKnown,
    ghCredentialReady,
    deploymentReady,
    runWebWorkflows,
    allowRepositoryBootstrap,
    allowAndroidWorkflow,
    configuredVariables,
    configuredSecrets,
  },
  controls: {
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    noPaidResourcesCreated: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    dryRunByDefault: true,
    activationRequiresExplicitEnv: true,
    repositoryMutationRequiresExplicitBootstrapGates: true,
    workflowDispatchRequiresReadyDeployment: true,
    androidWorkflowRequiresStoreEconomics: true,
    secretValuesRedacted: true,
  },
  plannedActions: plannedActions.map(({ args, ...action }) => ({
    ...action,
    args,
    runnableNow: action.canRun,
  })),
  execution: {
    requested: activationRequested,
    status: executionStatus,
    attemptedActions: executionResults.map((result) => result.id),
    results: executionResults,
  },
  nextActions: [
    setupReady
      ? 'Set AGL_PRODUCTION_ACTIVATE=1 in the production automation environment to apply configured zero-spend GitHub/Pages setup.'
      : 'Provide an existing GitHub repository target and gh credentials before production activation can apply setup.',
    runWebWorkflows
      ? 'Web workflow dispatch will run only when deployment remains ready-for-pages.'
      : 'Set AGL_PRODUCTION_RUN_WORKFLOWS=1 only after Pages settings and repository variables are configured.',
    'Android workflow dispatch stays held until store economics, signing, and Play credentials clear.',
  ],
}

const report = [
  '# Production Activation',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  `Execution: ${payload.execution.status}`,
  '',
  '## Configuration',
  '',
  `- Activation requested: ${payload.configuration.activationRequested}`,
  `- Repository target known: ${payload.configuration.repositoryTargetKnown}`,
  `- GitHub credentials ready: ${payload.configuration.ghCredentialReady}`,
  `- Deployment ready: ${payload.configuration.deploymentReady}`,
  `- Configured variables: ${payload.configuration.configuredVariables}`,
  `- Configured secrets: ${payload.configuration.configuredSecrets}`,
  '',
  '## Planned Actions',
  '',
  ...payload.plannedActions.map(
    (action) =>
      `- ${action.status}: ${action.id}; runnable ${action.runnableNow ? 'yes' : 'no'}; ${action.command}; ${action.reason}`,
  ),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Execution Results',
  '',
  ...(executionResults.length
    ? executionResults.map((result) => `- ${result.id}: exit ${result.exitCode}`)
    : ['- none']),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionActivation = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductionActivation = typeof productionActivation\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (executionStatus === 'failed') {
  process.exit(1)
}
