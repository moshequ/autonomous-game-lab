import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const args = new Set(process.argv.slice(2))
const jsonMode = args.has('--json')
const printMode = args.has('--print') || !jsonMode
const assertMode = args.has('--assert')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const hasValueKey = (value) => {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (Array.isArray(value)) {
    return value.some(hasValueKey)
  }

  return Object.entries(value).some(([key, nested]) => key === 'value' || hasValueKey(nested))
}

const payload = await readJson(path.join(root, 'data', 'owner-unlock-brief.json')).catch(async () => {
  const handoff = await readJson(path.join(root, 'data', 'production-blocker-handoff.json'))

  return {
    generatedAt: handoff.generatedAt,
    status: handoff.ownerUnlockBrief ? handoff.ownerUnlockBrief.status : 'no-owner-unlock-brief',
    sourceDataHash: handoff.sourceDataHash,
    sourceStatus: {
      productionBlockerHandoff: handoff.status,
      nextBestUnlockId: handoff.summary?.nextBestUnlockId ?? null,
      nextBestZeroCostUnlockId: handoff.summary?.nextBestZeroCostUnlockId ?? null,
    },
    brief: handoff.ownerUnlockBrief ?? null,
    setup: {
      setupScript: 'ops/github/setup-production.sh',
      printCommand: './ops/github/setup-production.sh --owner-unlock-brief',
      directPrintCommand: 'node scripts/owner-unlock-brief.mjs --print',
      preflightCommand: 'npm run autonomous:owner-unlock-preflight',
      directPreflightCommand: 'node scripts/owner-unlock-preflight.mjs --assert --print',
      syncConfiguredValuesCommand: './ops/github/setup-production.sh',
      workflowDispatchCommand: 'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
      workflowDispatchRequiresRunWorkflows: true,
      workflowDispatchDefault: 'disabled',
    },
    controls: {
      zeroPaidSpend: true,
      noSecretValues: true,
      noSecretValuesStored: true,
      noAccountCreation: true,
      noStoreSubmission: true,
      noRevenueEnablement: true,
      productGatesStillRequiredForRevenue: true,
      secretCommandsUseStdin: handoff.ownerUnlockBrief?.controls?.secretCommandsUseStdin === true,
      setupPrintModeHasNoGithubMutation: true,
      workflowDispatchRequiresRunWorkflows: true,
    },
    nextActions: handoff.ownerUnlockBrief?.validationCommands ?? [],
  }
})

const brief = payload.brief
const fail = (message) => {
  console.error(message)
  process.exitCode = 1
}

if (assertMode) {
  if (!brief) {
    fail('Owner unlock brief is missing. Run npm run autonomous:blocker-handoff.')
  }

  if (payload.controls?.zeroPaidSpend !== true || payload.controls?.noSecretValuesStored !== true) {
    fail('Owner unlock brief controls must preserve zero-spend and no-secret-storage guarantees.')
  }

  if (payload.setup?.workflowDispatchRequiresRunWorkflows !== true) {
    fail('Owner unlock brief must keep workflow dispatch behind RUN_WORKFLOWS=1.')
  }

  if (hasValueKey(payload)) {
    fail('Owner unlock brief must never store raw variable or secret values.')
  }
}

const linesForItems = (items, emptyText = 'none') =>
  items?.length ? items.map((item) => `  - ${item.repositoryName}: ${item.command}`) : [`  - ${emptyText}`]
const linesForCommands = (commands, emptyText = 'none') =>
  commands?.length ? commands.map((command) => `  - ${command}`) : [`  - ${emptyText}`]

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`)
} else if (printMode) {
  const output = [
    'Owner Unlock Brief',
    `Status: ${payload.status}`,
    `Next unlock: ${brief?.nextUnlockId ?? 'none'}`,
    `Recommended path: ${brief?.recommendedPathId ?? 'none'}`,
    `Cost mode: ${brief?.costMode ?? 'none'}`,
    '',
    'Missing variables:',
    ...linesForItems(brief?.missingVariables),
    '',
    'Missing secrets:',
    ...linesForItems(brief?.missingSecrets),
    '',
    'Setup commands:',
    ...linesForCommands(brief?.setupCommands),
    '',
    'Preflight commands:',
    ...linesForCommands([
      payload.setup?.preflightCommand ?? 'npm run autonomous:owner-unlock-preflight',
      payload.setup?.directPreflightCommand ?? 'node scripts/owner-unlock-preflight.mjs --assert --print',
    ]),
    '',
    'Validation commands:',
    ...linesForCommands(brief?.validationCommands),
    '',
    'After unlock:',
    ...linesForCommands(brief?.afterUnlockCommands),
    '',
    'Guardrails:',
    `  - Workflow dispatch is disabled unless RUN_WORKFLOWS=1 is set.`,
    `  - Setup print mode is read-only: ${payload.controls?.setupPrintModeHasNoGithubMutation === true}.`,
    `  - Secret commands use stdin: ${brief?.controls?.secretCommandsUseStdin === true}.`,
    `  - No secret values are stored: ${payload.controls?.noSecretValuesStored === true}.`,
    `  - Revenue and store submission stay blocked until product gates pass.`,
    '',
  ]

  process.stdout.write(output.join('\n'))
}
