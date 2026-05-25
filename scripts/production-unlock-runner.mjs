import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'production-unlock-runner.json')
const outputTsPath = path.join(srcDataDir, 'productionUnlockRunner.ts')
const reportPath = path.join(reportsDir, 'production-unlock-runner-latest.md')

const argv = process.argv.slice(2)
const executeRequested = argv.includes('--execute')
const force = argv.includes('--force')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

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

const allowedCommands = new Set([
  'npm run autonomous:env',
  'npm run autonomous:store-package',
  'npm run autonomous:store-compliance',
  'npm run autonomous:readiness',
  'npm run autonomous:local-event-bridge',
  'npm run autonomous:import-events',
  'npm run autonomous:analytics',
  'npm run autonomous:gate-recovery',
  'npm run autonomous:sample-plan',
  'npm run autonomous:objective-audit',
  'npm run autonomous:collect-sample-downloads',
  'npm run autonomous:collect-production-export',
  'npm run autonomous:monetization',
  'npm run autonomous:unit-economics',
  'npm run autonomous:native-package',
  'npm run autonomous:android-release-plan',
  'npm run autonomous:promote',
])
const executableStatuses = new Set(['configured', 'clear'])

const runCommand = (command) =>
  new Promise((resolve) => {
    const child = spawn(command, [], {
      cwd: root,
      env: process.env,
      shell: true,
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
        command,
        exitCode: code ?? 1,
        stdoutTail: redact(stdout).split('\n').filter(Boolean).slice(-12),
        stderrTail: redact(stderr).split('\n').filter(Boolean).slice(-12),
      })
    })
  })

const productionBlockerHandoff = await readJson(path.join(dataDir, 'production-blocker-handoff.json'))
const previous = await readOptionalJson(outputJsonPath, {
  completedUnlockFingerprints: [],
  execution: { results: [] },
})
const previousCompleted = new Set(previous.completedUnlockFingerprints ?? [])
const handoffItems = productionBlockerHandoff.handoffItems ?? productionBlockerHandoff.unlocks ?? []

const plans = handoffItems.map((item) => {
  const commands = item.afterUnlockCommands ?? []
  const unsafeCommands = commands.filter((command) => !allowedCommands.has(command))
  const fingerprint = hashSourceData({
    id: item.id,
    status: item.status,
    requiredEnv: item.requiredEnv ?? [],
    requiredSecrets: item.requiredSecrets ?? [],
    afterUnlockCommands: commands,
  })
  const statusExecutable = executableStatuses.has(item.status)
  const alreadyCompleted = previousCompleted.has(fingerprint)
  const runnable =
    statusExecutable && unsafeCommands.length === 0 && commands.length > 0 && (force || !alreadyCompleted)

  return {
    id: item.id,
    title: item.title,
    category: item.category,
    status: item.status,
    ownerInputRequired: item.ownerInputRequired === true,
    fingerprint,
    executableStatus: statusExecutable,
    alreadyCompleted,
    runnable,
    commands,
    unsafeCommands,
    reason: runnable
      ? 'Unlocked status has only allowlisted local follow-up commands.'
      : unsafeCommands.length
        ? 'Blocked because at least one follow-up command is outside the static allowlist.'
        : !statusExecutable
          ? `Held because handoff status is ${item.status}.`
          : alreadyCompleted && !force
            ? 'Already completed for this unlock fingerprint.'
            : 'No follow-up command is configured.',
  }
})

const runnablePlans = plans.filter((item) => item.runnable)
const commandQueue = [
  ...new Set(runnablePlans.flatMap((item) => item.commands).filter((command) => allowedCommands.has(command))),
]
const blockedUnsafePlans = plans.filter((item) => item.unsafeCommands.length > 0)

const executionResults = []
let executionStatus = executeRequested ? 'executed' : 'not-requested'

if (executeRequested) {
  if (!commandQueue.length) {
    executionStatus = 'idle'
  }

  for (const command of commandQueue) {
    const result = await runCommand(command)
    executionResults.push(result)

    if (result.exitCode !== 0) {
      executionStatus = 'failed'
      break
    }
  }
}

const completedUnlockFingerprints =
  executeRequested && executionStatus !== 'failed'
    ? [...new Set([...previousCompleted, ...runnablePlans.map((item) => item.fingerprint)])]
    : [...previousCompleted]
const status =
  executionStatus === 'failed'
    ? 'unlock-runner-failed'
    : executeRequested && commandQueue.length
      ? 'unlock-runner-executed'
      : runnablePlans.length
        ? 'unlock-runner-plan-ready'
        : 'unlock-runner-idle'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  mode: executeRequested ? 'execute-unlocked-local-followups' : 'plan-only',
  sourceStatus: {
    productionBlockerHandoff: productionBlockerHandoff.status,
    productionBlockerHandoffSourceDataHash: productionBlockerHandoff.sourceDataHash ?? null,
  },
  summary: {
    handoffItems: handoffItems.length,
    runnableUnlocks: runnablePlans.length,
    queuedCommands: commandQueue.length,
    blockedUnsafeUnlocks: blockedUnsafePlans.length,
    completedUnlockFingerprints: completedUnlockFingerprints.length,
  },
  controls: {
    zeroPaidSpend: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noPaidAcquisition: true,
    noExternalPosting: true,
    noWorkflowDispatch: true,
    noSecretValuesStored: true,
    dryRunByDefault: true,
    staticCommandAllowlist: true,
    executesOnlyConfiguredOrClearHandoffs: true,
    commandFailuresStopRun: true,
  },
  allowedCommands: [...allowedCommands].sort(),
  unlockPlans: plans,
  commandQueue,
  completedUnlockFingerprints,
  execution: {
    requested: executeRequested,
    force,
    status: executionStatus,
    attemptedCommands: executionResults.map((result) => result.command),
    results: executionResults,
  },
  blockers: [
    ...(blockedUnsafePlans.length
      ? blockedUnsafePlans.map((item) => `${item.id}: unsafe follow-up command ${item.unsafeCommands.join(', ')}`)
      : []),
  ],
  nextActions: [
    runnablePlans.length
      ? 'Run npm run autonomous:unlock-runner -- --execute to apply the unlocked zero-spend local follow-up queue.'
      : 'Keep watching production blocker handoff; execute only after a handoff item becomes configured or clear.',
    'Preserve the static command allowlist before adding any production mutation command.',
  ],
}

const appPayload = {
  status: payload.status,
  mode: payload.mode,
  summary: payload.summary,
  controls: payload.controls,
  commandQueue: payload.commandQueue,
  nextActions: payload.nextActions,
}

const report = [
  '# Production Unlock Runner',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  `Handoff: ${payload.sourceStatus.productionBlockerHandoff}`,
  `Source hash: ${payload.sourceStatus.productionBlockerHandoffSourceDataHash ?? 'missing'}`,
  '',
  '## Summary',
  '',
  `- Runnable unlocks: ${payload.summary.runnableUnlocks}`,
  `- Queued commands: ${payload.summary.queuedCommands}`,
  `- Blocked unsafe unlocks: ${payload.summary.blockedUnsafeUnlocks}`,
  `- Completed fingerprints: ${payload.summary.completedUnlockFingerprints}`,
  '',
  '## Unlock Plans',
  '',
  ...payload.unlockPlans.map(
    (item) =>
      `- ${item.runnable ? 'runnable' : 'held'}: ${item.id} - ${item.status}; commands ${item.commands.length}; ${item.reason}`,
  ),
  '',
  '## Command Queue',
  '',
  ...(payload.commandQueue.length ? payload.commandQueue.map((command) => `- ${command}`) : ['- none']),
  '',
  '## Execution',
  '',
  `- Requested: ${payload.execution.requested}`,
  `- Status: ${payload.execution.status}`,
  `- Attempted commands: ${payload.execution.attemptedCommands.length}`,
  ...payload.execution.results.flatMap((result) => [
    `- ${result.exitCode === 0 ? 'pass' : 'fail'}: ${result.command}`,
    ...result.stderrTail.map((line) => `  - stderr: ${line}`),
  ]),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionUnlockRunner = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type ProductionUnlockRunner = typeof productionUnlockRunner\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (executionStatus === 'failed') {
  process.exit(1)
}
