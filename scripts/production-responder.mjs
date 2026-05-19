import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const resolveFromRoot = (value) => (path.isAbsolute(value) ? value : path.join(root, value))
const dataDir = resolveFromRoot(process.env.AGL_DATA_DIR ?? 'data')
const srcDataDir = resolveFromRoot(process.env.AGL_SRC_DATA_DIR ?? path.join('src', 'data'))
const reportsDir = resolveFromRoot(process.env.AGL_REPORTS_DIR ?? 'reports')
const releaseHealthPath = path.join(dataDir, 'release-health.json')
const experimentPolicyPath = path.join(dataDir, 'experiment-policy.json')
const experimentResultsPath = path.join(dataDir, 'experiment-results.json')
const monetizationPath = path.join(dataDir, 'monetization-plan.json')
const unitEconomicsPath = path.join(dataDir, 'unit-economics.json')
const deploymentPath = path.join(dataDir, 'deployment-plan.json')
const previousPath = path.join(dataDir, 'production-response.json')
const outputJsonPath = previousPath
const outputTsPath = path.join(srcDataDir, 'productionResponse.ts')
const reportPath = path.join(reportsDir, 'production-response-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const releaseHealth = await readJson(releaseHealthPath)
const experimentPolicy = await readJson(experimentPolicyPath)
const experimentResults = await readOptionalJson(experimentResultsPath, { status: 'missing', recommendations: [] })
const monetization = await readJson(monetizationPath)
const unitEconomics = await readJson(unitEconomicsPath)
const deployment = await readOptionalJson(deploymentPath, { status: 'missing' })
const previous = await readOptionalJson(previousPath, { history: [] })

const fallbackVariantByExperiment = {
  first_session_pacing: 'guided',
  reward_offer: 'daily-streak',
  ...(experimentPolicy.guardrails?.fallbackVariantByExperiment ?? {}),
}

const now = new Date().toISOString()
const actions = []
const policyBefore = JSON.parse(JSON.stringify(experimentPolicy))
let policyChanged = false

const addAction = (action) => {
  actions.push({
    generatedAt: now,
    ...action,
  })
}

const normalizeWeights = (variants) => {
  const total = variants.reduce((sum, variant) => sum + variant.weight, 0)

  if (total === 100) {
    return
  }

  variants[0].weight += 100 - total
}

const setFallbackWeights = (experimentId, fallbackVariantId) => {
  const experiment = experimentPolicy.experiments?.[experimentId]

  if (!experiment) {
    addAction({
      id: `safe-weights-${experimentId}`,
      status: 'skipped',
      type: 'experiment-safety',
      target: experimentId,
      reason: 'experiment is not present in policy',
    })
    return
  }

  const fallback = experiment.variants.find((variant) => variant.id === fallbackVariantId)

  if (!fallback) {
    addAction({
      id: `safe-weights-${experimentId}`,
      status: 'skipped',
      type: 'experiment-safety',
      target: experimentId,
      reason: `fallback variant ${fallbackVariantId} is not present`,
    })
    return
  }

  const minWeight = experimentPolicy.guardrails?.minVariantWeight ?? 15
  const maxWeight = experimentPolicy.guardrails?.maxVariantWeight ?? 85
  const otherVariants = experiment.variants.filter((variant) => variant.id !== fallbackVariantId)
  const fallbackWeight = Math.max(minWeight, Math.min(maxWeight, 100 - otherVariants.length * minWeight))
  const before = experiment.variants.map((variant) => ({ ...variant }))

  fallback.weight = fallbackWeight

  for (const variant of otherVariants) {
    variant.weight = minWeight
  }

  normalizeWeights(experiment.variants)

  const after = experiment.variants.map((variant) => ({ ...variant }))
  const changed = JSON.stringify(before) !== JSON.stringify(after)
  policyChanged = policyChanged || changed

  addAction({
    id: `safe-weights-${experimentId}`,
    status: changed ? 'applied' : 'already-safe',
    type: 'experiment-safety',
    target: experimentId,
    reason: `release health is ${releaseHealth.status}; keep traffic on fallback variant ${fallbackVariantId}`,
    before,
    after,
  })
}

if (releaseHealth.controls?.rollbackRequired) {
  addAction({
    id: 'rollback-hold',
    status: 'active',
    type: 'deployment-safety',
    target: 'web-pwa',
    reason: releaseHealth.controls.automaticHoldReasons?.join(' ') || 'release health requires rollback',
    command: 'Block deployment and keep the last healthy static build as the served artifact.',
  })

  for (const [experimentId, fallbackVariantId] of Object.entries(fallbackVariantByExperiment)) {
    setFallbackWeights(experimentId, fallbackVariantId)
  }
} else {
  addAction({
    id: 'deployment-watch',
    status: releaseHealth.status === 'healthy' ? 'clear' : 'monitoring',
    type: 'deployment-safety',
    target: 'web-pwa',
    reason:
      releaseHealth.status === 'healthy'
        ? 'release health is healthy'
        : 'release health has warnings but no blockers',
    command: releaseHealth.controls?.canDeploy ? 'Allow gated web deployment.' : 'Hold web deployment.',
  })
}

if (releaseHealth.controls?.canApplyExperimentChanges === false) {
  addAction({
    id: 'freeze-experiment-learning',
    status: 'active',
    type: 'experiment-safety',
    target: 'all-experiments',
    reason: `release health is ${releaseHealth.status}`,
    command: 'Skip automatic winner promotion until blockers clear.',
  })
} else {
  addAction({
    id: 'experiment-learning',
    status: 'armed',
    type: 'experiment-safety',
    target: 'all-experiments',
    reason: `${experimentResults.recommendations?.length ?? 0} experiment recommendation(s) available`,
    command: 'Allow bounded improvement applier to consume experiment evidence.',
  })
}

if (!monetization.revenueEnabled || !releaseHealth.controls?.monetizationAllowed) {
  addAction({
    id: 'disable-revenue-features',
    status: 'active',
    type: 'monetization-safety',
    target: 'ads-and-purchases',
    reason: monetization.revenueEnabled
      ? 'release health monetization gates are not open'
      : `monetization plan is ${monetization.status}`,
    command: 'Keep ad placements, purchases, and subscriptions disabled.',
  })
}

if (
  !unitEconomics.controls?.paidAcquisitionAllowed ||
  !unitEconomics.controls?.storeSpendAllowed ||
  unitEconomics.controls?.maxDailySpendUsd === 0
) {
  addAction({
    id: 'enforce-zero-paid-spend',
    status: 'active',
    type: 'spend-safety',
    target: 'paid-acquisition-and-store-fees',
    reason: `unit economics mode is ${unitEconomics.status}`,
    command: `Keep paid spend at $${(unitEconomics.controls?.maxDailySpendUsd ?? 0).toFixed(2)} per day.`,
  })
}

const activeSafetyActions = actions.filter((action) => ['active', 'applied'].includes(action.status))
const mode = releaseHealth.controls?.rollbackRequired
  ? 'incident-response'
  : activeSafetyActions.some((action) => action.type === 'monetization-safety' || action.type === 'spend-safety')
    ? 'guarded-operations'
    : 'normal-operations'

if (policyChanged) {
  experimentPolicy.generatedAt = now
  experimentPolicy.guardrails = {
    ...experimentPolicy.guardrails,
    fallbackVariantByExperiment,
  }
}

const historyItem = {
  generatedAt: now,
  mode,
  releaseHealthStatus: releaseHealth.status,
  deploymentStatus: deployment.status,
  activeActionIds: activeSafetyActions.map((action) => action.id),
  policyChanged,
}

const history = [...(previous.history ?? []), historyItem].slice(-20)

const payload = {
  generatedAt: now,
  status: mode,
  releaseHealthStatus: releaseHealth.status,
  deploymentStatus: deployment.status,
  controls: {
    deployAllowed: releaseHealth.controls?.canDeploy === true && deployment.status !== 'blocked',
    rollbackRequired: releaseHealth.controls?.rollbackRequired === true,
    experimentsFrozen: releaseHealth.controls?.canApplyExperimentChanges === false,
    revenueDisabled: monetization.revenueEnabled !== true,
    paidSpendDisabled: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    storeSpendDisabled: unitEconomics.controls?.storeSpendAllowed !== true,
    selfHealingApplied: policyChanged,
  },
  fallbackVariantByExperiment,
  actions,
  policyDiff: policyChanged
    ? {
        before: policyBefore.experiments,
        after: experimentPolicy.experiments,
      }
    : null,
  history,
}

const report = [
  '# Production Response',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Release health: ${payload.releaseHealthStatus}`,
  `Deployment: ${payload.deploymentStatus}`,
  '',
  '## Controls',
  '',
  `- Deploy allowed: ${payload.controls.deployAllowed}`,
  `- Rollback required: ${payload.controls.rollbackRequired}`,
  `- Experiments frozen: ${payload.controls.experimentsFrozen}`,
  `- Revenue disabled: ${payload.controls.revenueDisabled}`,
  `- Paid spend disabled: ${payload.controls.paidSpendDisabled}`,
  `- Store spend disabled: ${payload.controls.storeSpendDisabled}`,
  `- Self-healing applied: ${payload.controls.selfHealingApplied}`,
  '',
  '## Actions',
  '',
  ...actions.map((action) => `- ${action.status}: ${action.id} (${action.type}) - ${action.reason}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })

if (policyChanged) {
  await writeFile(experimentPolicyPath, JSON.stringify(experimentPolicy, null, 2) + '\n')
}

await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionResponse = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductionResponse = typeof productionResponse\n`,
)
await writeFile(reportPath, report.join('\n'))

if (policyChanged) {
  console.log(`Wrote ${path.relative(root, experimentPolicyPath)}`)
}

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
