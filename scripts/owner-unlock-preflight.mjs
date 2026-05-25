import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const args = new Set(process.argv.slice(2))
const jsonMode = args.has('--json')
const printMode = args.has('--print') || !jsonMode
const assertMode = args.has('--assert')
const assertReadyMode = args.has('--assert-ready')

const outputJsonPath = path.join(root, 'data', 'owner-unlock-preflight.json')
const publicJsonPath = path.join(root, 'public', 'owner-unlock-preflight.json')
const reportPath = path.join(root, 'reports', 'owner-unlock-preflight-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const configured = (value) => typeof value === 'string' && value.trim().length > 0
const unique = (items) => [...new Set(items)]
const hasValueKey = (item) => {
  if (!item || typeof item !== 'object') {
    return false
  }

  if (Array.isArray(item)) {
    return item.some(hasValueKey)
  }

  return Object.entries(item).some(([key, nested]) => key === 'value' || hasValueKey(nested))
}

const initialShellKeys = new Set(Object.keys(process.env))
const localEnv = await loadLocalEnv({ root })
const ownerUnlockBrief = await readJson(path.join(root, 'data', 'owner-unlock-brief.json')).catch(() => null)
const productionBlockerHandoff = await readJson(path.join(root, 'data', 'production-blocker-handoff.json')).catch(
  () => null,
)

const brief = ownerUnlockBrief?.brief ?? null
const nextUnlockKit =
  productionBlockerHandoff?.nextUnlockKit?.id === brief?.nextUnlockId ? productionBlockerHandoff.nextUnlockKit : null
const recommendedPath =
  nextUnlockKit?.paths?.find((unlockPath) => unlockPath.id === brief?.recommendedPathId) ?? null
const lowestInputPath =
  nextUnlockKit?.paths?.find(
    (unlockPath) => unlockPath.id === (brief?.lowestInputPathId ?? nextUnlockKit?.lowestInputPathId),
  ) ?? null

const localEnvFilesForKey = (envName) =>
  (localEnv.loadedFiles ?? [])
    .filter((file) => (file.keys ?? []).includes(envName))
    .map((file) => file.path)

const urlExpectations = new Map([
  [
    'VITE_EVENT_COLLECTOR_URL',
    {
      purpose: 'browser event ingestion endpoint',
      requiredPathSegment: '/events',
    },
  ],
  [
    'AGL_EVENT_COLLECTOR_EXPORT_URL',
    {
      purpose: 'server event export endpoint',
      requiredPathSegment: '/events/export',
    },
  ],
  [
    'VITE_POSTHOG_HOST',
    {
      purpose: 'PostHog browser capture host',
      requiredPathSegment: null,
    },
  ],
])

const passCheck = (id, passed, detail) => ({ id, passed, detail })

const validateUrlShape = ({ envName, raw }) => {
  const expectation = urlExpectations.get(envName)
  const trimmed = raw.trim()
  let parsed = null

  try {
    parsed = new URL(trimmed)
  } catch {
    parsed = null
  }

  const expectedPathCheck = expectation.requiredPathSegment
    ? passCheck(
        'expected-path',
        Boolean(parsed?.pathname.includes(expectation.requiredPathSegment)),
        `${envName} should include ${expectation.requiredPathSegment} for the ${expectation.purpose}.`,
      )
    : passCheck('expected-path', true, `${envName} may use any HTTPS path for the ${expectation.purpose}.`)
  const checks = [
    passCheck('parseable-url', Boolean(parsed), `${envName} must parse as a URL.`),
    passCheck('https-only', parsed?.protocol === 'https:', `${envName} must use https://.`),
    passCheck('no-whitespace', !/\s/.test(trimmed), `${envName} must not contain whitespace.`),
    passCheck('has-hostname', Boolean(parsed?.hostname), `${envName} must include a hostname.`),
    expectedPathCheck,
  ]
  const failedChecks = checks.filter((check) => !check.passed)

  return {
    kind: 'url-shape',
    status: failedChecks.length ? 'fail' : 'pass',
    expected: {
      protocol: 'https',
      pathSegment: expectation.requiredPathSegment ?? 'any',
      noWhitespace: true,
    },
    checks,
    failedCheckIds: failedChecks.map((check) => check.id),
  }
}

const validateInput = ({ kind, envName, configuredInRepository, availableLocally }) => {
  const raw = process.env[envName]

  if (!availableLocally) {
    if (!configuredInRepository && urlExpectations.has(envName)) {
      return {
        kind: 'url-shape',
        status: 'not-checked-missing-input',
        detail: 'No local input is available yet; URL shape will be validated before setup can sync it.',
        expected: {
          protocol: 'https',
          pathSegment: urlExpectations.get(envName).requiredPathSegment ?? 'any',
          noWhitespace: true,
        },
        checks: [passCheck('non-empty-local-input', false, `${envName} must be exported before setup can sync it.`)],
      }
    }

    return configuredInRepository
      ? {
          kind: 'redacted-repository-presence',
          status: 'not-inspected-repository-configured',
          detail: 'GitHub stores the configured value redacted; export it locally to validate shape before changing it.',
          checks: [],
        }
      : {
          kind: 'presence',
          status: 'not-checked-missing-input',
          detail: 'No local input is available yet.',
          checks: [passCheck('non-empty-local-input', false, `${envName} must be exported before setup can sync it.`)],
        }
  }

  if (urlExpectations.has(envName)) {
    return validateUrlShape({ envName, raw })
  }

  return {
    kind: kind === 'github-secret' ? 'secret-presence' : 'variable-presence',
    status: 'pass',
    detail:
      kind === 'github-secret'
        ? 'Secret presence is checked without inspecting or storing its content.'
        : 'Variable presence is checked without storing its content.',
    checks: [passCheck('non-empty-local-input', true, `${envName} is available locally.`)],
  }
}

const normalizeInput = (item, kind) => {
  const repositoryName = item.repositoryName ?? item.repositoryVariable ?? item.repositorySecret
  const envName = item.envName ?? repositoryName
  const configuredInRepository = item.configured === true
  const availableInShell = initialShellKeys.has(envName) && configured(process.env[envName])
  const availableInLocalEnvFile = localEnvFilesForKey(envName).length > 0
  const availableLocally = configured(process.env[envName])
  const validation = validateInput({ kind, envName, configuredInRepository, availableLocally })
  const localValidationFailed = validation.status === 'fail'

  return {
    kind,
    repositoryName,
    envName,
    configuredInRepository,
    availableInShell,
    availableInLocalEnvFile,
    availableLocally,
    localEnvFiles: localEnvFilesForKey(envName),
    ready: (configuredInRepository || availableLocally) && !localValidationFailed,
    validation,
    command: item.command,
  }
}

const summarizePath = (unlockPath) =>
  unlockPath
    ? {
        id: unlockPath.id,
        title: unlockPath.title,
        status: unlockPath.status,
        costMode: unlockPath.costMode,
        ownerInputRequired: unlockPath.ownerInputRequired === true,
        missingVariableCount: unlockPath.missingVariableCount ?? 0,
        missingSecretCount: unlockPath.missingSecretCount ?? 0,
        missingInputCount: unlockPath.missingInputCount ?? 0,
      }
    : null

const summarizeInputs = (pathInputs) =>
  pathInputs.map((input) => ({
    kind: input.kind,
    repositoryName: input.repositoryName,
    envName: input.envName,
    command: input.command,
  }))

const summarizeInvalidInputs = (pathInputs) =>
  pathInputs.map((input) => ({
    kind: input.kind,
    repositoryName: input.repositoryName,
    envName: input.envName,
    failedCheckIds: input.validation.failedCheckIds ?? [],
  }))

const buildPathPreflight = (unlockPath, role) => {
  if (!unlockPath) {
    return null
  }

  const pathInputs = [
    ...(unlockPath.requiredVariables ?? []).map((item) => normalizeInput(item, 'github-variable')),
    ...(unlockPath.requiredSecrets ?? []).map((item) => normalizeInput(item, 'github-secret')),
  ]
  const pathMissingInputs = pathInputs.filter((input) => !input.ready)
  const pathInvalidInputs = pathInputs.filter((input) => input.validation.status === 'fail')
  const pathStatus = pathInvalidInputs.length
    ? 'owner-unlock-preflight-needs-fixes'
    : pathMissingInputs.length
      ? 'owner-unlock-preflight-waiting-on-input'
      : 'owner-unlock-preflight-ready'

  return {
    role,
    status: pathStatus,
    readyForSetup: pathStatus === 'owner-unlock-preflight-ready',
    path: summarizePath(unlockPath),
    summary: {
      totalInputs: pathInputs.length,
      readyInputs: pathInputs.filter((input) => input.ready).length,
      missingInputs: pathMissingInputs.length,
      invalidInputs: pathInvalidInputs.length,
      variableInputs: pathInputs.filter((input) => input.kind === 'github-variable').length,
      secretInputs: pathInputs.filter((input) => input.kind === 'github-secret').length,
      repositoryConfiguredInputs: pathInputs.filter((input) => input.configuredInRepository).length,
      localAvailableInputs: pathInputs.filter((input) => input.availableLocally).length,
      setupCanRun: pathStatus === 'owner-unlock-preflight-ready',
    },
    inputs: pathInputs,
    missingInputs: summarizeInputs(pathMissingInputs),
    invalidInputs: summarizeInvalidInputs(pathInvalidInputs),
    commandSequence: unlockPath.commandSequence ?? [],
    validationCommands: unlockPath.validationCommands ?? [],
  }
}

const recommendedPathPreflight = buildPathPreflight(recommendedPath, 'recommended')
const lowestInputPathPreflight = buildPathPreflight(lowestInputPath, 'lowest-input')
const pathPreflights = [
  recommendedPathPreflight,
  ...(lowestInputPath?.id && lowestInputPath.id !== recommendedPath?.id ? [lowestInputPathPreflight] : []),
].filter(Boolean)
const inputs = recommendedPathPreflight?.inputs ?? []
const allPathInputs = pathPreflights.flatMap((pathPreflight) => pathPreflight.inputs)
const requiredEnvNames = new Set(allPathInputs.map((input) => input.envName))
const missingInputs = inputs.filter((input) => !input.ready)
const invalidInputs = inputs.filter((input) => input.validation.status === 'fail')
const minimalInterventionPath = lowestInputPathPreflight
  ? {
      pathId: lowestInputPathPreflight.path?.id ?? null,
      title: lowestInputPathPreflight.path?.title ?? null,
      status: lowestInputPathPreflight.status,
      readyForSetup: lowestInputPathPreflight.readyForSetup,
      missingInputs: lowestInputPathPreflight.summary.missingInputs,
      secretInputs: lowestInputPathPreflight.summary.secretInputs,
      manualInputReduction:
        typeof lowestInputPathPreflight.summary.missingInputs === 'number'
          ? missingInputs.length - lowestInputPathPreflight.summary.missingInputs
          : null,
      noSecretsRequired: lowestInputPathPreflight.summary.secretInputs === 0,
      commandSequence: lowestInputPathPreflight.commandSequence,
      validationCommands: lowestInputPathPreflight.validationCommands,
    }
  : null
const buildOwnerInputPack = (pathPreflight) =>
  pathPreflight
    ? {
        pathId: pathPreflight.path?.id ?? null,
        title: pathPreflight.path?.title ?? null,
        status: pathPreflight.status,
        readyForSetup: pathPreflight.readyForSetup,
        missingInputCount: pathPreflight.summary.missingInputs,
        secretInputCount: pathPreflight.summary.secretInputs,
        missingInputNames: pathPreflight.missingInputs.map((input) => input.envName),
        localEnvFile: '.env.production.local',
        localEnvTemplateLines: pathPreflight.missingInputs.map((input) => `${input.envName}=`),
        shellExportTemplateLines: pathPreflight.missingInputs.map((input) => `export ${input.envName}=`),
        inputInstructions: pathPreflight.inputs.map((input) => ({
          kind: input.kind,
          repositoryName: input.repositoryName,
          envName: input.envName,
          ready: input.ready,
          configuredInRepository: input.configuredInRepository,
          availableLocally: input.availableLocally,
          validation: {
            kind: input.validation.kind,
            status: input.validation.status,
            failedCheckIds: input.validation.failedCheckIds ?? [],
            detail: input.validation.detail,
          },
        })),
        commands: {
          preflight: 'node scripts/owner-unlock-preflight.mjs --assert --print',
          syncConfiguredValues: './ops/github/setup-production.sh',
          dispatchWhenReady: 'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
        },
        controls: {
          zeroPaidSpend: true,
          noSecretValuesStored: true,
          noSecretValuesSerialized: true,
          noMutation: true,
          noWorkflowDispatch: true,
          gitIgnoredLocalEnvFile: true,
          onlyMinimalPathInputs: true,
        },
      }
    : null
const ownerInputPack = buildOwnerInputPack(lowestInputPathPreflight)
const unavailableReasons = [
  ...(ownerUnlockBrief ? [] : ['owner-unlock-brief-missing']),
  ...(brief ? [] : ['owner-unlock-brief-payload-missing']),
  ...(recommendedPath ? [] : ['recommended-unlock-path-missing']),
]

const status = unavailableReasons.length
  ? 'owner-unlock-preflight-unavailable'
  : invalidInputs.length
    ? 'owner-unlock-preflight-needs-fixes'
    : missingInputs.length
      ? 'owner-unlock-preflight-waiting-on-input'
      : 'owner-unlock-preflight-ready'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  readyForSetup: status === 'owner-unlock-preflight-ready',
  sourceDataHash: ownerUnlockBrief?.sourceDataHash ?? productionBlockerHandoff?.sourceDataHash ?? null,
  sourceStatus: {
    ownerUnlockBrief: ownerUnlockBrief?.status ?? 'missing',
    productionBlockerHandoff: productionBlockerHandoff?.status ?? 'missing',
    nextUnlockId: brief?.nextUnlockId ?? null,
    recommendedPathId: brief?.recommendedPathId ?? null,
    lowestInputPathId: brief?.lowestInputPathId ?? nextUnlockKit?.lowestInputPathId ?? null,
    nextBestUnlockId: productionBlockerHandoff?.summary?.nextBestUnlockId ?? null,
    nextBestZeroCostUnlockId: productionBlockerHandoff?.summary?.nextBestZeroCostUnlockId ?? null,
  },
  recommendedPath: summarizePath(recommendedPath),
  lowestInputPath: summarizePath(lowestInputPath),
  summary: {
    totalInputs: inputs.length,
    readyInputs: inputs.filter((input) => input.ready).length,
    missingInputs: missingInputs.length,
    invalidInputs: invalidInputs.length,
    repositoryConfiguredInputs: inputs.filter((input) => input.configuredInRepository).length,
    localAvailableInputs: inputs.filter((input) => input.availableLocally).length,
    localUrlValidationsPassed: inputs.filter(
      (input) => input.validation.kind === 'url-shape' && input.validation.status === 'pass',
    ).length,
    setupCanRun: status === 'owner-unlock-preflight-ready',
    lowestInputMissingInputs: lowestInputPathPreflight?.summary.missingInputs ?? null,
    lowestInputInvalidInputs: lowestInputPathPreflight?.summary.invalidInputs ?? null,
    lowestInputReadyInputs: lowestInputPathPreflight?.summary.readyInputs ?? null,
    lowestInputTotalInputs: lowestInputPathPreflight?.summary.totalInputs ?? null,
    lowestInputSecretInputs: lowestInputPathPreflight?.summary.secretInputs ?? null,
    lowestInputSetupCanRun: lowestInputPathPreflight?.summary.setupCanRun ?? false,
    manualInputReduction:
      typeof lowestInputPathPreflight?.summary.missingInputs === 'number'
        ? missingInputs.length - lowestInputPathPreflight.summary.missingInputs
        : null,
  },
  inputs,
  missingInputs: summarizeInputs(missingInputs),
  invalidInputs: summarizeInvalidInputs(invalidInputs),
  pathPreflights,
  lowestInputPreflight: lowestInputPathPreflight,
  minimalInterventionPath,
  ownerInputPack,
  localEnvironment: {
    loaded: localEnv.loaded === true,
    supportedFiles: localEnv.supportedFiles,
    candidateFiles: localEnv.candidateFiles,
    loadedInputKeys: unique((localEnv.loadedKeys ?? []).filter((key) => requiredEnvNames.has(key))),
    shellInputKeys: unique([...requiredEnvNames].filter((key) => initialShellKeys.has(key))),
    valuesRedacted: true,
    controls: {
      shellEnvPrecedence: localEnv.controls?.shellEnvPrecedence === true,
      noSecretValuesInReports: true,
      gitIgnoredLocalEnvFiles: localEnv.controls?.gitIgnoredLocalEnvFiles === true,
    },
  },
  commands: {
    printBrief: 'node scripts/owner-unlock-brief.mjs --print',
    preflight: 'node scripts/owner-unlock-preflight.mjs --assert --print',
    setupPreflight: './ops/github/setup-production.sh --owner-unlock-preflight',
    lowestInputPreflight: 'node scripts/owner-unlock-preflight.mjs --assert --print',
    packagePreflight: 'npm run autonomous:owner-unlock-preflight',
    syncConfiguredValues: './ops/github/setup-production.sh',
    dispatchWhenReady: 'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
  },
  controls: {
    zeroPaidSpend: true,
    noSecretValues: true,
    noSecretValuesStored: true,
    noSecretValuesSerialized: true,
    noMutation: true,
    noWorkflowDispatch: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    setupStillRequiresExplicitRun: true,
    workflowDispatchStillRequiresRunWorkflows: true,
    secretValuesNeverSerialized: true,
  },
  unavailableReasons,
}

const report = [
  '# Owner Unlock Preflight',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Ready for setup: ${payload.readyForSetup}`,
  `Next unlock: ${payload.sourceStatus.nextUnlockId ?? 'none'}`,
  `Recommended path: ${payload.recommendedPath?.id ?? 'none'}`,
  `Lowest-input path: ${payload.lowestInputPath?.id ?? 'none'}`,
  `Source hash: ${payload.sourceDataHash ?? 'missing'}`,
  '',
  '## Summary',
  '',
  `- total inputs: ${payload.summary.totalInputs}`,
  `- ready inputs: ${payload.summary.readyInputs}`,
  `- missing inputs: ${payload.summary.missingInputs}`,
  `- invalid inputs: ${payload.summary.invalidInputs}`,
  `- repository configured inputs: ${payload.summary.repositoryConfiguredInputs}`,
  `- local available inputs: ${payload.summary.localAvailableInputs}`,
  `- lowest-input missing inputs: ${payload.summary.lowestInputMissingInputs ?? 'n/a'}`,
  `- lowest-input secret inputs: ${payload.summary.lowestInputSecretInputs ?? 'n/a'}`,
  `- manual input reduction: ${payload.summary.manualInputReduction ?? 'n/a'}`,
  '',
  '## Minimal Intervention Path',
  '',
  `- path: ${payload.minimalInterventionPath?.pathId ?? 'none'}`,
  `- missing inputs: ${payload.minimalInterventionPath?.missingInputs ?? 'n/a'}`,
  `- secret inputs: ${payload.minimalInterventionPath?.secretInputs ?? 'n/a'}`,
  `- manual input reduction: ${payload.minimalInterventionPath?.manualInputReduction ?? 'n/a'}`,
  `- ready for setup: ${payload.minimalInterventionPath?.readyForSetup === true}`,
  '',
  '## Owner Input Pack',
  '',
  `- path: ${payload.ownerInputPack?.pathId ?? 'none'}`,
  `- local env file: ${payload.ownerInputPack?.localEnvFile ?? 'none'}`,
  `- missing input names: ${payload.ownerInputPack?.missingInputNames?.join(', ') || 'none'}`,
  `- secret inputs: ${payload.ownerInputPack?.secretInputCount ?? 'n/a'}`,
  `- no secret values stored: ${payload.ownerInputPack?.controls?.noSecretValuesStored === true}`,
  '',
  '### Local Env Template',
  '',
  ...(payload.ownerInputPack?.localEnvTemplateLines?.length
    ? payload.ownerInputPack.localEnvTemplateLines.map((line) => `- ${line}`)
    : ['- none']),
  '',
  '## Path Options',
  '',
  ...payload.pathPreflights.map(
    (pathPreflight) =>
      `- ${pathPreflight.role}: ${pathPreflight.path.id} (${pathPreflight.status}; missing=${pathPreflight.summary.missingInputs}; secrets=${pathPreflight.summary.secretInputs})`,
  ),
  '',
  '## Inputs',
  '',
  ...(payload.inputs.length
    ? payload.inputs.map((input) => {
        const statusLabel = input.ready ? 'ready' : input.validation.status === 'fail' ? 'invalid' : 'missing'
        return `- ${statusLabel}: ${input.repositoryName} (${input.kind}; local=${input.availableLocally}; repo=${input.configuredInRepository}; validation=${input.validation.status})`
      })
    : ['- none']),
  '',
  '## Commands',
  '',
  `- print brief: ${payload.commands.printBrief}`,
  `- preflight: ${payload.commands.preflight}`,
  `- setup preflight: ${payload.commands.setupPreflight}`,
  `- package preflight: ${payload.commands.packagePreflight}`,
  `- sync configured values: ${payload.commands.syncConfiguredValues}`,
  `- workflow dispatch when ready: ${payload.commands.dispatchWhenReady}`,
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.controls).map(([key, controlValue]) => `- ${key}: ${controlValue}`),
  '',
]

const fail = (message) => {
  console.error(message)
  process.exitCode = 1
}

if (assertMode) {
  if (!brief) {
    fail('Owner unlock preflight requires data/owner-unlock-brief.json. Run npm run autonomous:blocker-handoff.')
  }

  if (!recommendedPath) {
    fail('Owner unlock preflight requires the recommended unlock path from production blocker handoff.')
  }

  if (
    payload.controls.zeroPaidSpend !== true ||
    payload.controls.noSecretValuesStored !== true ||
    payload.controls.noMutation !== true ||
    payload.controls.noWorkflowDispatch !== true ||
    payload.controls.setupStillRequiresExplicitRun !== true
  ) {
    fail('Owner unlock preflight controls must preserve zero-spend, no-mutation, and no-secret-storage guarantees.')
  }

  if (hasValueKey(payload)) {
    fail('Owner unlock preflight must never store raw variable or secret values.')
  }

  if (invalidInputs.length) {
    fail(
      `Owner unlock preflight found invalid local input shapes: ${invalidInputs
        .map((input) => input.repositoryName)
        .join(', ')}`,
    )
  }
}

if (assertReadyMode && payload.status !== 'owner-unlock-preflight-ready') {
  fail('Owner unlock preflight is not ready for setup yet.')
}

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(publicJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(publicJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(reportPath, report.join('\n'))

const linesForInputs = (items, emptyText) =>
  items.length
    ? items.map((input) => `  - ${input.repositoryName} (${input.kind}; env ${input.envName})`)
    : [`  - ${emptyText}`]
const linesForTemplate = (items, emptyText) =>
  items.length ? items.map((item) => `  - ${item}`) : [`  - ${emptyText}`]

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
} else if (printMode) {
  const output = [
    'Owner Unlock Preflight',
    `Status: ${payload.status}`,
    `Ready for setup: ${payload.readyForSetup}`,
    `Next unlock: ${payload.sourceStatus.nextUnlockId ?? 'none'}`,
    `Recommended path: ${payload.recommendedPath?.id ?? 'none'}`,
    `Lowest-input path: ${payload.lowestInputPath?.id ?? 'none'} (${payload.summary.lowestInputMissingInputs ?? 'n/a'} missing input(s), ${payload.summary.lowestInputSecretInputs ?? 'n/a'} secret input(s))`,
    '',
    'Minimal intervention input pack:',
    `  - Path: ${payload.ownerInputPack?.pathId ?? 'none'}`,
    `  - Local env file: ${payload.ownerInputPack?.localEnvFile ?? 'none'}`,
    `  - Missing inputs: ${payload.ownerInputPack?.missingInputNames?.join(', ') || 'none'}`,
    `  - Secret inputs: ${payload.ownerInputPack?.secretInputCount ?? 'n/a'}`,
    '  - Local env template:',
    ...linesForTemplate(payload.ownerInputPack?.localEnvTemplateLines ?? [], 'none'),
    '',
    'Missing inputs:',
    ...linesForInputs(payload.missingInputs, 'none'),
    '',
    'Invalid local inputs:',
    ...linesForInputs(payload.invalidInputs, 'none'),
    '',
    'Commands:',
    `  - Print brief: ${payload.commands.printBrief}`,
    `  - Preflight: ${payload.commands.preflight}`,
    `  - Setup preflight: ${payload.commands.setupPreflight}`,
    `  - Sync configured values: ${payload.commands.syncConfiguredValues}`,
    `  - Dispatch when ready: ${payload.commands.dispatchWhenReady}`,
    '',
    'Guardrails:',
    `  - No secret values are stored: ${payload.controls.noSecretValuesStored}.`,
    `  - No GitHub mutation is performed by preflight: ${payload.controls.noMutation}.`,
    `  - Workflow dispatch still requires RUN_WORKFLOWS=1: ${payload.controls.workflowDispatchStillRequiresRunWorkflows}.`,
    '',
  ]

  process.stdout.write(output.join('\n'))
}
