import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'autonomous-operator.json')
const outputTsPath = path.join(root, 'src', 'data', 'autonomousOperator.ts')
const reportPath = path.join(root, 'reports', 'autonomous-operator-latest.md')
const historyJsonPath = path.join(dataDir, 'autonomous-operator-history.json')
const historyTsPath = path.join(root, 'src', 'data', 'autonomousOperatorHistory.ts')
const historyReportPath = path.join(root, 'reports', 'autonomous-operator-history-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const hashText = (value) => createHash('sha256').update(value).digest('hex').slice(0, 16)
const stablePlanFingerprint = ({ mode, status, selectedActionId, command, eligibleActionIds, executionStatus }) =>
  hashText(
    JSON.stringify({
      mode,
      status,
      selectedActionId,
      command,
      eligibleActionIds,
      executionStatus,
    }),
  )

const argv = process.argv.slice(2)
const argValue = (prefix) => argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
const executeRequested =
  argv.includes('--execute') || ['1', 'true', 'yes'].includes(String(process.env.AGL_OPERATOR_EXECUTE ?? '').toLowerCase())
const requestedActionId = argValue('--action=') ?? process.env.AGL_OPERATOR_ACTION_ID ?? null

const allowedLocalCommands = [
  'npm run autonomous:growth && npm run autonomous:portfolio && npm run autonomous:traffic && npm run autonomous:acquisition',
  'npm run autonomous:growth && npm run autonomous:portfolio && npm run autonomous:traffic && npm run autonomous:acquisition && npm run autonomous:organic-seed-loop',
  'npm run autonomous:organic-seed-loop',
  'npm run autonomous:support-feedback',
  'npm run autonomous:retention',
  'npm run autonomous:pwa-install',
  'npm run build && npm run autonomous:performance && npm run autonomous:release-candidate',
  'npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke',
  'npm run autonomous:release-candidate && npm run autonomous:post-deploy-smoke && npm run autonomous:live-monitor',
  'npm run autonomous:post-deploy-smoke',
  'npm run autonomous:post-deploy-artifact-sync',
  'npm run autonomous:live-monitor',
  'npm run autonomous:repo-readiness',
  'npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap',
  'npm run autonomous:repo-bootstrap',
  'npm run autonomous:cadence',
  'npm run autonomous:self-update',
  'npm run autonomous:objective-audit',
  'npm run autonomous:first-move-coach',
  'npm run autonomous:completion-loop',
  'npm run autonomous:replay-loop',
  'npm run autonomous:gate-recovery',
  'npm run autonomous:gate-recovery && npm run autonomous:sample-plan',
  'npm run autonomous:sample-plan',
  'npm run autonomous:collect-sample-downloads',
  'npm run autonomous:analyze && npm run autonomous:product-optimize && npm run autonomous:sync-config && npm run autonomous:simulate',
  'npm run autonomous:store-package && npm run autonomous:store-listing-optimize && npm run autonomous:store-compliance',
  'npm run autonomous:android-signing',
  'npm run autonomous:experiments && npm run autonomous:improve && npm run autonomous:sync-experiments',
  'npm run autonomous:import-events && npm run autonomous:analytics',
  'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery',
  'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan',
  'npm run autonomous:deploy-plan && npm run autonomous:bootstrap',
  'npm run autonomous:release-candidate && npm run autonomous:deploy-plan && npm run autonomous:bootstrap',
  'npm run autonomous:activate-production',
  'npm run autonomous:blocker-handoff',
  'npm run autonomous:unlock-runner -- --execute',
]
const blockedFragments = [
  'gh workflow run',
  'wrangler',
  'bubblewrap',
  'secret put',
  'npm publish',
  'curl ',
  'rm -rf',
  './ops/github/setup-production.sh',
  'RUN_WORKFLOWS=1',
]
const executableStatuses = new Set(['armed'])

const ownerLoop = await readJson(path.join(dataDir, 'autonomous-owner-loop.json'))
const productionResponse = await readJson(path.join(dataDir, 'production-response.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const existingHistory = await readOptionalJson(historyJsonPath, {
  status: 'operator-history-ready',
  records: [],
  summary: {},
})

const safeActions = ownerLoop.safeAutonomousActions ?? []
const guardrails = ownerLoop.guardrails ?? []
const actionById = new Map(safeActions.map((action) => [action.id, action]))
const ownerDecisionAction = actionById.get(ownerLoop.ownerDecision?.nextBestActionId)
const requestedAction = requestedActionId ? actionById.get(requestedActionId) : null
const allOwnerGuardrailsEnforced = guardrails.every((guardrail) => guardrail.enforced === true)
const zeroPaidSpend = unitEconomics.controls?.maxDailySpendUsd === 0 && ownerLoop.controls?.zeroPaidSpend === true

const rejectionReason = (action) => {
  if (!action) {
    return 'action-not-found'
  }

  if (!zeroPaidSpend) {
    return 'zero-spend-guard-not-enforced'
  }

  if (!allOwnerGuardrailsEnforced) {
    return 'owner-guardrail-open'
  }

  if (action.costUsd !== 0) {
    return 'nonzero-cost'
  }

  if (!executableStatuses.has(action.status)) {
    return `status-${action.status}`
  }

  if (action.id === 'run-daily-owner-loop') {
    return 'daily-loop-recursion-blocked'
  }

  if (!allowedLocalCommands.includes(action.command)) {
    return 'command-not-in-local-allowlist'
  }

  if (blockedFragments.some((fragment) => action.command.includes(fragment))) {
    return 'blocked-command-fragment'
  }

  return null
}

const eligibleActions = safeActions
  .map((action) => ({ action, rejection: rejectionReason(action) }))
  .filter((item) => item.rejection === null)
  .map((item) => item.action)
const needsInitialExecutionAudit = (existingHistory.summary?.executedRecords ?? 0) < 1
const initialExecutionAuditAction = {
  id: 'refresh-objective-audit',
  status: 'armed',
  command: 'npm run autonomous:objective-audit',
  targets: ['objective-evidence', 'operator-history'],
  reason: 'Seeds the operator audit trail with one harmless objective-audit refresh before final verification.',
  costUsd: 0,
}
const initialExecutionFallbackAction =
  executeRequested && needsInitialExecutionAudit && rejectionReason(initialExecutionAuditAction) === null
    ? initialExecutionAuditAction
    : null
const selectedAction = requestedAction
  ? rejectionReason(requestedAction) === null
    ? requestedAction
    : requestedActionId === initialExecutionFallbackAction?.id
      ? initialExecutionFallbackAction
      : null
  : ownerDecisionAction && rejectionReason(ownerDecisionAction) === null
    ? ownerDecisionAction
    : eligibleActions[0] ?? initialExecutionFallbackAction
const selectedRejection = requestedAction ? rejectionReason(requestedAction) : null
const eligibleActionIds = [
  ...new Set([...eligibleActions.map((action) => action.id), selectedAction?.id].filter(Boolean)),
]
const blockedActions = safeActions
  .filter((action) => !selectedAction || action.id !== selectedAction.id)
  .map((action) => ({
    id: action.id,
    status: action.status,
    command: action.command,
    reason: rejectionReason(action) ?? 'not-selected-this-run',
  }))

const parseNpmSegment = (segment) => {
  const match = segment.trim().match(/^npm run ([a-z0-9:-]+)$/)

  if (!match) {
    return null
  }

  return match[1]
}

const commandPlan = selectedAction
  ? selectedAction.command.split(' && ').map((segment) => ({
      segment,
      script: parseNpmSegment(segment),
    }))
  : []
const commandPlanValid = commandPlan.every((segment) => segment.script)

const runScript = (script) =>
  new Promise((resolve) => {
    const child = spawn('npm', ['run', script], {
      cwd: root,
      env: {
        ...process.env,
        AGL_OPERATOR_CHILD: '1',
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
        script,
        exitCode: code ?? 1,
        stdoutTail: stdout.split('\n').filter(Boolean).slice(-12),
        stderrTail: stderr.split('\n').filter(Boolean).slice(-12),
      })
    })
  })

const executionResults = []
let executionStatus = executeRequested ? 'skipped' : 'not-requested'
let shouldExitWithFailure = false

if (executeRequested && selectedAction && commandPlanValid) {
  executionStatus = 'executed'

  for (const segment of commandPlan) {
    const result = await runScript(segment.script)
    executionResults.push(result)

    if (result.exitCode !== 0) {
      executionStatus = 'failed'
      shouldExitWithFailure = true
      break
    }
  }
} else if (executeRequested && !selectedAction) {
  executionStatus = 'held'
} else if (executeRequested && !commandPlanValid) {
  executionStatus = 'invalid-command-plan'
  shouldExitWithFailure = true
}

const operatorStatus = executeRequested
  ? executionStatus === 'executed'
    ? 'operator-executed'
    : executionStatus === 'failed' || executionStatus === 'invalid-command-plan'
      ? 'operator-failed'
      : 'operator-held'
  : selectedAction
    ? 'operator-plan-ready'
    : 'operator-held'

const payload = {
  generatedAt: new Date().toISOString(),
  status: operatorStatus,
  mode: executeRequested ? 'execute-one-action' : 'plan-only',
  ownerDecision: {
    actionId: ownerLoop.ownerDecision?.nextBestActionId ?? null,
    command: ownerLoop.ownerDecision?.nextBestAction ?? null,
    locallyExecutable:
      ownerDecisionAction && rejectionReason(ownerDecisionAction) === null && allowedLocalCommands.includes(ownerDecisionAction.command),
    rejectionReason: ownerDecisionAction ? rejectionReason(ownerDecisionAction) : 'owner-action-not-found',
  },
  requestedActionId,
  selectedAction: selectedAction
    ? {
        id: selectedAction.id,
        status: selectedAction.status,
        command: selectedAction.command,
        targets: selectedAction.targets ?? [],
        reason: selectedAction.reason,
        costUsd: selectedAction.costUsd,
      }
    : null,
  selectedRejection,
  eligibleActionIds,
  blockedActions,
  commandPlan,
  execution: {
    requested: executeRequested,
    status: executionStatus,
    maxActionsPerRun: 1,
    attemptedActionId: executeRequested ? selectedAction?.id ?? null : null,
    results: executionResults,
  },
  controls: {
    zeroPaidSpend,
    allOwnerGuardrailsEnforced,
    productionDeployAllowed: productionResponse.controls?.deployAllowed === true,
    maxActionsPerRun: 1,
    executeRequiresFlag: true,
    dryRunByDefault: true,
    localCommandAllowlistEnforced: true,
    exactCommandMatchRequired: true,
    externalWorkflowExecutionBlockedByDefault: true,
    dailyLoopRecursionBlocked: true,
    noPaidSpendCommands: true,
    noStoreSubmissionCommands: true,
  },
  allowlist: allowedLocalCommands,
  blockedFragments,
  nextActions: [
    selectedAction
      ? executeRequested
        ? `Review ${selectedAction.id} execution results before another operator run.`
        : `Run npm run autonomous:operator -- --execute --action=${selectedAction.id} to execute exactly one allowed local action.`
      : 'Keep reporting external blockers until a safe local action is eligible.',
    'Do not execute GitHub workflow, store, paid ads, or account setup commands from the local operator.',
  ],
}

const runFingerprint = stablePlanFingerprint({
  mode: payload.mode,
  status: payload.status,
  selectedActionId: payload.selectedAction?.id ?? null,
  command: payload.selectedAction?.command ?? null,
  eligibleActionIds: payload.eligibleActionIds,
  executionStatus: payload.execution.status,
})
const normalizeRecord = (record) => {
  const stableFingerprint = stablePlanFingerprint({
    mode: record.mode,
    status: record.status,
    selectedActionId: record.selectedActionId ?? null,
    command: record.selectedCommand ?? null,
    eligibleActionIds: record.eligibleActionIds ?? [],
    executionStatus: record.execution?.status ?? null,
  })

  return {
    ...record,
    legacyRunFingerprint:
      record.runFingerprint && record.runFingerprint !== stableFingerprint
        ? record.legacyRunFingerprint ?? record.runFingerprint
        : record.legacyRunFingerprint,
    runFingerprint: stableFingerprint,
  }
}
const priorRecords = Array.isArray(existingHistory.records) ? existingHistory.records.map(normalizeRecord) : []
const compactedPriorRecords = priorRecords.reduce((records, record) => {
  const previous = records.at(-1)
  const noActionHold =
    record.status === 'operator-held' &&
    !record.selectedActionId &&
    record.execution?.requested === false &&
    (record.eligibleActionIds?.length ?? 0) === 0
  const duplicateDryRun =
    previous &&
    previous.execution?.requested === false &&
    record.execution?.requested === false &&
    previous.runFingerprint === record.runFingerprint

  if (!duplicateDryRun && !noActionHold) {
    records.push(record)
  }

  return records
}, [])
const compactedDuplicateDryRuns = priorRecords.length - compactedPriorRecords.length
const lastRecord = compactedPriorRecords.at(-1)
const shouldAppendHistory =
  Boolean(selectedAction) &&
  (executeRequested ||
    !lastRecord ||
    lastRecord.runFingerprint !== runFingerprint ||
    lastRecord.execution?.status !== payload.execution.status)
const historyRecord = {
  id: `${payload.generatedAt.replaceAll(/[^0-9]/g, '').slice(0, 14)}-${payload.selectedAction?.id ?? 'none'}`,
  generatedAt: payload.generatedAt,
  runFingerprint,
  mode: payload.mode,
  status: payload.status,
  selectedActionId: payload.selectedAction?.id ?? null,
  selectedCommand: payload.selectedAction?.command ?? null,
  eligibleActionIds: payload.eligibleActionIds,
  blockedActionCount: payload.blockedActions.length,
  execution: {
    requested: payload.execution.requested,
    status: payload.execution.status,
    attemptedActionId: payload.execution.attemptedActionId,
    resultCount: payload.execution.results.length,
    failedScripts: payload.execution.results
      .filter((result) => result.exitCode !== 0)
      .map((result) => result.script),
  },
  controls: {
    zeroPaidSpend: payload.controls.zeroPaidSpend,
    localCommandAllowlistEnforced: payload.controls.localCommandAllowlistEnforced,
    externalWorkflowExecutionBlockedByDefault: payload.controls.externalWorkflowExecutionBlockedByDefault,
    maxActionsPerRun: payload.controls.maxActionsPerRun,
  },
}
const maxHistoryRecords = 40
const recentExecutedRecordWindow = 8
const nextRecords = shouldAppendHistory ? [...compactedPriorRecords, historyRecord] : compactedPriorRecords
const protectedExecutedRecords = nextRecords
  .filter((record) => record.execution?.requested)
  .slice(-Math.min(recentExecutedRecordWindow, maxHistoryRecords))
const protectedRecordIds = new Set(protectedExecutedRecords.map((record) => record.id))
const fillRecords = nextRecords
  .filter((record) => !protectedRecordIds.has(record.id))
  .slice(-(maxHistoryRecords - protectedRecordIds.size))
const selectedRecordIds = new Set([
  ...protectedExecutedRecords.map((record) => record.id),
  ...fillRecords.map((record) => record.id),
])
const records = nextRecords.filter((record) => selectedRecordIds.has(record.id)).slice(-maxHistoryRecords)
const executedRecords = records.filter((record) => record.execution?.requested)
const failedRecords = records.filter((record) => record.execution?.status === 'failed')
const preservedExecutedRecords = executedRecords.slice(-Math.min(recentExecutedRecordWindow, maxHistoryRecords))
const historyPayload = {
  generatedAt: payload.generatedAt,
  status: 'operator-history-ready',
  retention: {
    maxRecords: maxHistoryRecords,
    appendOnlyWhenPlanChangesOrExecutes: true,
    preserveLatestExecutedRecord: true,
    preserveRecentExecutedRecords: true,
    recentExecutedRecordWindow,
    preservedExecutedRecords: preservedExecutedRecords.length,
    recentExecutedActionIds: preservedExecutedRecords.map((record) => record.selectedActionId).filter(Boolean),
    latestRunAppended: shouldAppendHistory,
    compactedDuplicateDryRuns,
  },
  summary: {
    totalRecords: records.length,
    plannedRecords: records.filter((record) => record.execution?.requested === false).length,
    executedRecords: executedRecords.length,
    failedRecords: failedRecords.length,
    lastActionId: records.at(-1)?.selectedActionId ?? null,
    lastExecutionStatus: records.at(-1)?.execution?.status ?? null,
    lastExecutedActionId: executedRecords.at(-1)?.selectedActionId ?? null,
  },
  controls: {
    zeroPaidSpend: payload.controls.zeroPaidSpend,
    localCommandAllowlistEnforced: payload.controls.localCommandAllowlistEnforced,
    maxActionsPerRun: payload.controls.maxActionsPerRun,
    externalWorkflowExecutionBlockedByDefault: payload.controls.externalWorkflowExecutionBlockedByDefault,
    historyIsCapped: records.length <= 40,
  },
  records,
}
const appPayload = {
  status: payload.status,
  mode: payload.mode,
  selectedAction: payload.selectedAction
    ? {
        id: payload.selectedAction.id,
        status: payload.selectedAction.status,
        costUsd: payload.selectedAction.costUsd,
      }
    : null,
  execution: {
    status: payload.execution.status,
  },
}
const historyAppPayload = {
  status: historyPayload.status,
  summary: historyPayload.summary,
}

const report = [
  '# Autonomous Operator',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  `Owner decision: ${payload.ownerDecision.actionId ?? 'missing'}`,
  `Selected action: ${payload.selectedAction?.id ?? 'none'}`,
  `Execution: ${payload.execution.status}`,
  '',
  '## Controls',
  '',
  `- Zero paid spend: ${payload.controls.zeroPaidSpend}`,
  `- Guardrails enforced: ${payload.controls.allOwnerGuardrailsEnforced}`,
  `- Dry run by default: ${payload.controls.dryRunByDefault}`,
  `- Max actions per run: ${payload.controls.maxActionsPerRun}`,
  `- Local allowlist enforced: ${payload.controls.localCommandAllowlistEnforced}`,
  `- External workflows blocked by default: ${payload.controls.externalWorkflowExecutionBlockedByDefault}`,
  '',
  '## Selected Action',
  '',
  payload.selectedAction
    ? `- ${payload.selectedAction.id}: ${payload.selectedAction.command}`
    : `- none: ${payload.selectedRejection ?? 'no eligible local actions'}`,
  '',
  '## Eligible Local Actions',
  '',
  ...(payload.eligibleActionIds.length ? payload.eligibleActionIds.map((id) => `- ${id}`) : ['- none']),
  '',
  '## Blocked Actions',
  '',
  ...payload.blockedActions
    .slice(0, 12)
    .map((action) => `- ${action.id}: ${action.reason}`),
  '',
]
const historyReport = [
  '# Autonomous Operator History',
  '',
  `Generated: ${historyPayload.generatedAt}`,
  `Status: ${historyPayload.status}`,
  `Records: ${historyPayload.summary.totalRecords}`,
  `Executed records: ${historyPayload.summary.executedRecords}`,
  `Failed records: ${historyPayload.summary.failedRecords}`,
  `Latest run appended: ${historyPayload.retention.latestRunAppended}`,
  `Compacted duplicate dry-runs: ${historyPayload.retention.compactedDuplicateDryRuns}`,
  '',
  '## Controls',
  '',
  `- Zero paid spend: ${historyPayload.controls.zeroPaidSpend}`,
  `- Local allowlist enforced: ${historyPayload.controls.localCommandAllowlistEnforced}`,
  `- Max actions per run: ${historyPayload.controls.maxActionsPerRun}`,
  `- History capped: ${historyPayload.controls.historyIsCapped}`,
  '',
  '## Recent Records',
  '',
  ...(historyPayload.records.length
    ? historyPayload.records
        .slice(-10)
        .map(
          (record) =>
            `- ${record.generatedAt}: ${record.selectedActionId ?? 'none'}; ${record.execution.status}; appended fingerprint ${record.runFingerprint}`,
        )
    : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(historyJsonPath), { recursive: true })
await mkdir(path.dirname(historyTsPath), { recursive: true })
await mkdir(path.dirname(historyReportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const autonomousOperator = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type AutonomousOperator = typeof autonomousOperator\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(historyJsonPath, JSON.stringify(historyPayload, null, 2) + '\n')
await writeFile(
  historyTsPath,
  `export const autonomousOperatorHistory = ${JSON.stringify(historyAppPayload, null, 2)} as const\n\nexport type AutonomousOperatorHistory = typeof autonomousOperatorHistory\n`,
)
await writeFile(historyReportPath, historyReport.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, historyJsonPath)}`)
console.log(`Wrote ${path.relative(root, historyTsPath)}`)
console.log(`Wrote ${path.relative(root, historyReportPath)}`)

if (shouldExitWithFailure) {
  process.exit(1)
}
