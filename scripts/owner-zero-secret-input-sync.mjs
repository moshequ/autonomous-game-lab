import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const args = new Set(process.argv.slice(2))
const printMode = args.has('--print') || !args.has('--json')
const assertMode = args.has('--assert')
const dataDir = path.join(root, 'data')
const publicDir = path.join(root, 'public')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'owner-zero-secret-input-sync.json')
const outputTsPath = path.join(root, 'src', 'data', 'ownerZeroSecretInputSync.ts')
const publicRuntimeConfigPath = path.join(publicDir, 'owner-runtime-config.json')
const reportPath = path.join(reportsDir, 'owner-zero-secret-input-sync-latest.md')

const configured = (value) => typeof value === 'string' && value.trim().length > 0
const trim = (value) => (typeof value === 'string' ? value.trim() : '')
const unique = (items) => [...new Set(items.filter(Boolean))]
const posthogPublicKeyPattern = /^phc_[A-Za-z0-9_-]{4,}$/
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const workflowInputsEnabled =
  process.env.AGL_ENABLE_ZERO_SECRET_WORKFLOW_INPUTS === '1' ||
  process.env.AGL_ENABLE_ZERO_SECRET_WORKFLOW_INPUTS === 'true'
const githubEnvPath = process.env.GITHUB_ENV

const definitions = [
  {
    envName: 'VITE_POSTHOG_KEY',
    inputEnvName: 'AGL_OWNER_INPUT_VITE_POSTHOG_KEY',
    title: 'PostHog browser project key',
    publicConfigGroup: 'analytics',
    publicConfigKey: 'posthogKey',
    validate(raw) {
      const value = trim(raw)
      const checks = [
        {
          id: 'non-empty',
          passed: configured(value),
          detail: 'PostHog project key must be present.',
        },
        {
          id: 'single-line',
          passed: !/[\r\n]/.test(value),
          detail: 'PostHog project key must be a single line.',
        },
        {
          id: 'no-whitespace',
          passed: !/\s/.test(value),
          detail: 'PostHog project key must not include whitespace.',
        },
        {
          id: 'reasonable-length',
          passed: value.length <= 256,
          detail: 'PostHog project key must be 256 characters or fewer.',
        },
        {
          id: 'posthog-public-key-format',
          passed: posthogPublicKeyPattern.test(value),
          detail:
            'PostHog project key must start with phc_ and contain only letters, numbers, underscores, or hyphens.',
        },
      ]

      return { value, checks }
    },
  },
  {
    envName: 'VITE_POSTHOG_HOST',
    inputEnvName: 'AGL_OWNER_INPUT_VITE_POSTHOG_HOST',
    title: 'PostHog browser host',
    required: false,
    defaultValue: 'https://us.i.posthog.com',
    defaultSource: 'built-in-posthog-browser-host',
    publicConfigGroup: 'analytics',
    publicConfigKey: 'posthogHost',
    validate(raw) {
      const value = trim(raw)
      let parsed = null

      try {
        parsed = new URL(value)
      } catch {
        parsed = null
      }

      const checks = [
        {
          id: 'non-empty',
          passed: configured(value),
          detail: 'PostHog host must be present.',
        },
        {
          id: 'single-line',
          passed: !/[\r\n]/.test(value),
          detail: 'PostHog host must be a single line.',
        },
        {
          id: 'parseable-url',
          passed: Boolean(parsed),
          detail: 'PostHog host must parse as a URL.',
        },
        {
          id: 'https-only',
          passed: parsed?.protocol === 'https:',
          detail: 'PostHog host must use https://.',
        },
        {
          id: 'has-hostname',
          passed: Boolean(parsed?.hostname),
          detail: 'PostHog host must include a hostname.',
        },
      ]

      return { value, checks }
    },
  },
  {
    envName: 'AGL_SUPPORT_EMAIL',
    inputEnvName: 'AGL_OWNER_INPUT_AGL_SUPPORT_EMAIL',
    title: 'Production support email',
    publicConfigGroup: 'support',
    publicConfigKey: 'email',
    validate(raw) {
      const value = trim(raw)
      const checks = [
        {
          id: 'non-empty',
          passed: configured(value),
          detail: 'Support email must be present.',
        },
        {
          id: 'single-line',
          passed: !/[\r\n]/.test(value),
          detail: 'Support email must be a single line.',
        },
        {
          id: 'email-shape',
          passed: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          detail: 'Support email must look like an email address.',
        },
        {
          id: 'reasonable-length',
          passed: value.length <= 254,
          detail: 'Support email must be 254 characters or fewer.',
        },
      ]

      return { value, checks }
    },
  },
]

const inputValueFor = (definition) => {
  const workflowInput = trim(process.env[definition.inputEnvName])
  const repositoryOrShellValue = trim(process.env[definition.envName])

  if (workflowInputsEnabled && configured(workflowInput)) {
    return {
      value: workflowInput,
      source: 'workflow-dispatch-zero-secret-input',
    }
  }

  if (configured(repositoryOrShellValue)) {
    return {
      value: repositoryOrShellValue,
      source: 'repository-variable-or-shell-env',
    }
  }

  return {
    value: '',
    source: 'missing',
  }
}

const evaluatedInputs = definitions.map((definition) => {
  const input = inputValueFor(definition)
  const defaultValue = trim(definition.defaultValue)
  const validation = input.value
    ? definition.validate(input.value)
    : defaultValue
      ? definition.validate(defaultValue)
      : { value: '', checks: [] }
  const failedChecks = validation.checks.filter((check) => !check.passed)
  const status = input.value
    ? failedChecks.length
      ? 'invalid'
      : 'valid'
    : defaultValue
      ? failedChecks.length
        ? 'invalid-default'
        : 'defaulted'
      : 'missing'

  return {
    envName: definition.envName,
    inputEnvName: definition.inputEnvName,
    title: definition.title,
    source: input.value ? input.source : defaultValue ? definition.defaultSource : input.source,
    status,
    required: definition.required !== false,
    defaulted: status === 'defaulted',
    publicConfigGroup: definition.publicConfigGroup,
    publicConfigKey: definition.publicConfigKey,
    validation: {
      checked: input.value.length > 0 || defaultValue.length > 0,
      status:
        status === 'valid' || status === 'defaulted'
          ? 'pass'
          : status === 'invalid' || status === 'invalid-default'
            ? 'fail'
            : 'not-checked-missing-input',
      checks: validation.checks,
      failedCheckIds: failedChecks.map((check) => check.id),
    },
  }
})

const publicValues = new Map(
  definitions.map((definition) => {
    const input = inputValueFor(definition)
    const defaultValue = trim(definition.defaultValue)
    const rawValue = input.value || defaultValue
    const validation = rawValue ? definition.validate(rawValue) : { value: '', checks: [] }
    const failedChecks = validation.checks.filter((check) => !check.passed)

    return [definition.envName, rawValue && failedChecks.length === 0 ? validation.value : null]
  }),
)

const validInputNames = evaluatedInputs.filter((input) => input.status === 'valid').map((input) => input.envName)
const defaultedInputNames = evaluatedInputs.filter((input) => input.status === 'defaulted').map((input) => input.envName)
const invalidInputNames = evaluatedInputs
  .filter((input) => input.status === 'invalid' || input.status === 'invalid-default')
  .map((input) => input.envName)
const missingInputNames = evaluatedInputs.filter((input) => input.status === 'missing').map((input) => input.envName)
const posthogKey = publicValues.get('VITE_POSTHOG_KEY')
const posthogHost = publicValues.get('VITE_POSTHOG_HOST')
const supportEmail = publicValues.get('AGL_SUPPORT_EMAIL')
const runtimeConfigStatus = invalidInputNames.length
  ? 'owner-runtime-config-needs-fixes'
  : validInputNames.length
    ? 'owner-runtime-config-ready'
    : 'owner-runtime-config-waiting-on-input'

const appendGithubEnv = async () => {
  if (!githubEnvPath || invalidInputNames.length) {
    return {
      status: githubEnvPath ? 'skipped-invalid-inputs' : 'skipped-no-github-env',
      exportedInputNames: [],
    }
  }

  const lines = validInputNames.map((name) => `${name}=${publicValues.get(name)}`)

  if (!lines.length) {
    return {
      status: 'skipped-no-valid-inputs',
      exportedInputNames: [],
    }
  }

  await appendFile(githubEnvPath, `${lines.join('\n')}\n`)

  return {
    status: 'exported-for-current-workflow',
    exportedInputNames: validInputNames,
  }
}

const githubEnvExport = await appendGithubEnv()
const runtimeConfig = {
  generatedAt: new Date().toISOString(),
  id: 'owner-runtime-config',
  status: runtimeConfigStatus,
  source: 'owner-zero-secret-input-sync',
  publicInputNames: definitions.map((definition) => definition.envName),
  configuredPublicInputNames: validInputNames,
  defaultedPublicInputNames: defaultedInputNames,
  missingPublicInputNames: missingInputNames,
  invalidPublicInputNames: invalidInputNames,
  analytics: {
    provider: posthogKey ? 'posthog-browser' : null,
    posthogConfigured: Boolean(posthogKey),
    posthogKey: posthogKey || null,
    posthogHost: posthogHost || null,
  },
  support: {
    configured: Boolean(supportEmail),
    email: supportEmail || null,
  },
  controls: {
    zeroPaidSpend: true,
    zeroSecretInputsOnly: true,
    noSecretValues: true,
    publicValuesOnly: true,
    publicRuntimeConfigMayStoreProvidedPublicValues: true,
    noAccountCreation: true,
    noWorkflowDispatch: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
  },
}

const ownerUnlockPreflight = await readOptionalJson(path.join(dataDir, 'owner-unlock-preflight.json'), {
  status: 'missing',
})
const payload = {
  generatedAt: runtimeConfig.generatedAt,
  status: invalidInputNames.length
    ? 'owner-zero-secret-input-sync-needs-fixes'
    : validInputNames.length
      ? 'owner-zero-secret-input-sync-ready'
      : 'owner-zero-secret-input-sync-waiting-on-input',
  mode: 'zero-secret-public-owner-inputs',
  source: {
    ownerUnlockPreflightStatus: ownerUnlockPreflight.status,
    workflowInputsEnabled,
  },
  inputs: evaluatedInputs,
  summary: {
    inputCount: definitions.length,
    validInputCount: validInputNames.length,
    defaultedInputCount: defaultedInputNames.length,
    missingInputCount: missingInputNames.length,
    invalidInputCount: invalidInputNames.length,
    validInputNames,
    defaultedInputNames,
    missingInputNames,
    invalidInputNames,
  },
  runtimeConfig: {
    path: 'public/owner-runtime-config.json',
    status: runtimeConfig.status,
    configuredPublicInputNames: runtimeConfig.configuredPublicInputNames,
    defaultedPublicInputNames: runtimeConfig.defaultedPublicInputNames,
    missingPublicInputNames: runtimeConfig.missingPublicInputNames,
    invalidPublicInputNames: runtimeConfig.invalidPublicInputNames,
    containsPublicValues: validInputNames.length > 0,
    containsSecretValues: false,
  },
  githubEnvExport,
  workflowDispatch: {
    workflow: '.github/workflows/production-input-watch.yml',
    inputNames: [
      'vite_posthog_key',
      'vite_posthog_host',
      'agl_support_email',
      'publish_zero_secret_runtime_config',
    ],
    valuesArePublic: true,
    ownerMustOptInToPublishRuntimeConfig: true,
  },
  controls: {
    zeroPaidSpend: true,
    zeroSecretInputsOnly: true,
    noSecretValues: true,
    noSecretValuesInEvidence: true,
    publicRuntimeConfigMayStoreProvidedPublicValues: true,
    githubEnvExportOnlyWhenValuesValidate: true,
    noAccountCreation: true,
    noWorkflowDispatch: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
  },
  nextActions: invalidInputNames.length
    ? ['Fix invalid zero-secret public inputs before publishing runtime config.']
    : validInputNames.length
      ? ['Run production input watch/readiness, then deploy the PWA so the public runtime config is available.']
      : [
          'Provide zero-secret public inputs through repository variables, shell env, or the Production Input Watch workflow dispatch UI.',
        ],
}

const report = [
  '# Owner Zero-Secret Input Sync',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Runtime config: ${payload.runtimeConfig.path} (${payload.runtimeConfig.status})`,
  `Valid inputs: ${payload.summary.validInputNames.join(', ') || 'none'}`,
  `Defaulted inputs: ${payload.summary.defaultedInputNames.join(', ') || 'none'}`,
  `Missing inputs: ${payload.summary.missingInputNames.join(', ') || 'none'}`,
  `Invalid inputs: ${payload.summary.invalidInputNames.join(', ') || 'none'}`,
  `GitHub env export: ${payload.githubEnvExport.status}`,
  '',
  '## Workflow Dispatch Inputs',
  '',
  ...payload.workflowDispatch.inputNames.map((name) => `- ${name}`),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  'No input values are written to this report or data artifact. Provided values are only written to the public runtime config when they validate and are intended to be public.',
]

await mkdir(dataDir, { recursive: true })
await mkdir(publicDir, { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(reportsDir, { recursive: true })
await writeFile(outputJsonPath, `${JSON.stringify(payload, null, 2)}\n`)
await writeFile(publicRuntimeConfigPath, `${JSON.stringify(runtimeConfig, null, 2)}\n`)
await writeFile(
  outputTsPath,
  `export const ownerZeroSecretInputSync = ${JSON.stringify(payload, null, 2)} as const\n\nexport type OwnerZeroSecretInputSync = typeof ownerZeroSecretInputSync\n`,
)
await writeFile(reportPath, `${report.join('\n')}\n`)

if (printMode) {
  console.log('Owner zero-secret input sync')
  console.log(`Status: ${payload.status}`)
  console.log(`Runtime config: ${payload.runtimeConfig.path} (${payload.runtimeConfig.status})`)
  console.log(`Valid inputs: ${payload.summary.validInputNames.join(', ') || 'none'}`)
  console.log(`Defaulted inputs: ${payload.summary.defaultedInputNames.join(', ') || 'none'}`)
  console.log(`Missing inputs: ${payload.summary.missingInputNames.join(', ') || 'none'}`)
  console.log(`Invalid inputs: ${payload.summary.invalidInputNames.join(', ') || 'none'}`)
}

if (assertMode && invalidInputNames.length) {
  console.error(`Invalid zero-secret public input(s): ${invalidInputNames.join(', ')}`)
  process.exit(1)
}
