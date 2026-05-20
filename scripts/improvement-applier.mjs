import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashTextSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const backlogPath = path.join(root, 'data', 'improvement-backlog.json')
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const playablePath = path.join(root, 'data', 'playable-games.json')
const policyPath = path.join(root, 'data', 'experiment-policy.json')
const releaseHealthPath = path.join(root, 'data', 'release-health.json')
const experimentResultsPath = path.join(root, 'data', 'experiment-results.json')
const outputJsonPath = path.join(root, 'data', 'applied-improvements.json')
const reportPath = path.join(root, 'reports', 'applied-improvements-latest.md')

const loadJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const loadOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const rawAnalytics = await readFile(analyticsPath, 'utf8')
const rawBacklog = await readFile(backlogPath, 'utf8')
const analytics = JSON.parse(rawAnalytics)
const backlog = JSON.parse(rawBacklog)
const playable = await loadJson(playablePath)
const playableGameIds = new Set(playable.games ?? [])
const policy = await loadJson(policyPath)
const releaseHealth = await loadOptionalJson(releaseHealthPath, {
  status: 'missing',
  controls: { canApplyExperimentChanges: true },
})
const experimentResults = await loadOptionalJson(experimentResultsPath, {
  status: 'missing',
  recommendations: [],
})
const previous = await loadOptionalJson(outputJsonPath, { history: [] })
const stableAnalyticsInput = JSON.stringify({
  source: analytics.sourceStatus?.activeSource,
  totals: analytics.totals?.counts,
  games: analytics.games?.map((game) => ({
    gameId: game.gameId,
    counts: game.counts,
    metrics: game.metrics,
  })),
  playableGames: [...playableGameIds],
  experimentResults: experimentResults.experiments?.map((experiment) => ({
    id: experiment.id,
    variants: experiment.variants?.map((variant) => ({
      variantId: variant.variantId,
      counts: variant.counts,
      metrics: variant.metrics,
    })),
  })),
})
const sourceDataHash = hashTextSourceData(`${stableAnalyticsInput}\n${rawBacklog}`)
const history = previous.history ?? []
const actions = []
const touchedExperiments = new Set()

const minimumConfidenceFor = (experiment) =>
  policy.guardrails.minimumConfidenceByExperiment?.[experiment] ?? policy.guardrails.minimumConfidence

const alreadyAppliedForSource = (experiment) =>
  history.some((action) => action.status === 'applied' && action.experiment === experiment && action.sourceDataHash === sourceDataHash)

const alreadyAppliedForIssue = (issue) =>
  history.some(
    (action) =>
      action.status === 'applied' &&
      action.experiment === issue.experiment &&
      action.gameId === issue.gameId &&
      action.title === issue.title &&
      action.sourceReason === issue.reason,
  )

const alreadyAppliedExperimentResult = (recommendation) =>
  history.some(
    (action) =>
      action.status === 'applied' &&
      action.source === 'experiment-results' &&
      action.experiment === recommendation.experiment &&
      action.sourceReason === recommendation.reason,
  )

const normalizeWeights = (variants) => {
  const total = variants.reduce((sum, variant) => sum + variant.weight, 0)

  if (total === 100) {
    return
  }

  variants[0].weight += 100 - total
}

const shiftWeight = ({ experiment, preferredVariantId, issue }) => {
  const experimentPolicy = policy.experiments[experiment]

  if (!experimentPolicy) {
    return {
      status: 'deferred',
      experiment,
      reason: 'experiment is not represented in the runtime policy',
    }
  }

  const preferred = experimentPolicy.variants.find((variant) => variant.id === preferredVariantId)
  const donor = [...experimentPolicy.variants]
    .filter((variant) => variant.id !== preferredVariantId)
    .sort((a, b) => b.weight - a.weight)[0]

  if (!preferred || !donor) {
    return {
      status: 'deferred',
      experiment,
      reason: 'preferred or donor variant missing from policy',
    }
  }

  const shift = Math.min(
    policy.guardrails.maxShiftPerRun,
    policy.guardrails.maxVariantWeight - preferred.weight,
    donor.weight - policy.guardrails.minVariantWeight,
  )

  if (shift <= 0) {
    return {
      status: 'deferred',
      experiment,
      reason: 'variant weights are already at guardrail limits',
    }
  }

  const before = experimentPolicy.variants.map((variant) => ({ ...variant }))
  preferred.weight += shift
  donor.weight -= shift
  normalizeWeights(experimentPolicy.variants)

  return {
    status: 'applied',
    experiment,
    gameId: issue.gameId,
    title: issue.title,
    sourceReason: issue.reason,
    confidence: issue.confidence,
    sourceDataHash,
    change: `shifted ${shift} weight points from ${donor.id} to ${preferred.id}`,
    before,
    after: experimentPolicy.variants.map((variant) => ({ ...variant })),
  }
}

const applyExperimentRecommendation = (recommendation) => {
  if (releaseHealth.controls?.canApplyExperimentChanges === false) {
    return {
      status: 'skipped',
      source: 'experiment-results',
      experiment: recommendation.experiment,
      title: 'Promote winning experiment variant',
      reason: `release health guard is ${releaseHealth.status}`,
    }
  }

  if (recommendation.action !== 'promote-winner') {
    return {
      status: 'deferred',
      source: 'experiment-results',
      experiment: recommendation.experiment,
      title: 'Promote winning experiment variant',
      reason: recommendation.reason,
    }
  }

  if (touchedExperiments.has(recommendation.experiment)) {
    return {
      status: 'skipped',
      source: 'experiment-results',
      experiment: recommendation.experiment,
      title: 'Promote winning experiment variant',
      reason: 'experiment already changed in this run',
    }
  }

  if (alreadyAppliedExperimentResult(recommendation)) {
    return {
      status: 'skipped',
      source: 'experiment-results',
      experiment: recommendation.experiment,
      title: 'Promote winning experiment variant',
      reason: 'same experiment result already produced an applied change',
      sourceDataHash,
    }
  }

  if (alreadyAppliedForSource(recommendation.experiment)) {
    return {
      status: 'skipped',
      source: 'experiment-results',
      experiment: recommendation.experiment,
      title: 'Promote winning experiment variant',
      reason: 'same source data already produced an applied change',
      sourceDataHash,
    }
  }

  const minimumConfidence = minimumConfidenceFor(recommendation.experiment)

  if (recommendation.confidence < minimumConfidence) {
    return {
      status: 'deferred',
      source: 'experiment-results',
      experiment: recommendation.experiment,
      title: 'Promote winning experiment variant',
      reason: `confidence ${recommendation.confidence}% is below ${minimumConfidence}% guardrail`,
    }
  }

  const action = shiftWeight({
    experiment: recommendation.experiment,
    preferredVariantId: recommendation.winnerVariant,
    issue: {
      gameId: 'all-games',
      title: 'Promote winning experiment variant',
      reason: recommendation.reason,
      confidence: recommendation.confidence,
    },
  })

  if (action.status === 'applied') {
    touchedExperiments.add(recommendation.experiment)
    return {
      ...action,
      source: 'experiment-results',
      winnerVariant: recommendation.winnerVariant,
      runnerUpVariant: recommendation.runnerUpVariant,
    }
  }

  return {
    ...action,
    source: 'experiment-results',
  }
}

const applyIssue = (issue) => {
  if (releaseHealth.controls?.canApplyExperimentChanges === false) {
    return {
      status: 'skipped',
      experiment: issue.experiment,
      gameId: issue.gameId,
      title: issue.title,
      reason: `release health guard is ${releaseHealth.status}`,
    }
  }

  if (issue.gameId && !playableGameIds.has(issue.gameId)) {
    return {
      status: 'skipped',
      experiment: issue.experiment,
      gameId: issue.gameId,
      title: issue.title,
      reason: 'game is not currently in the playable registry',
    }
  }

  if (!issue.experiment) {
    return {
      status: 'deferred',
      gameId: issue.gameId,
      title: issue.title,
      reason: 'issue has no experiment key',
    }
  }

  if (touchedExperiments.has(issue.experiment)) {
    return {
      status: 'skipped',
      experiment: issue.experiment,
      gameId: issue.gameId,
      title: issue.title,
      reason: 'experiment already changed in this run',
    }
  }

  if (alreadyAppliedForSource(issue.experiment)) {
    return {
      status: 'skipped',
      experiment: issue.experiment,
      gameId: issue.gameId,
      title: issue.title,
      reason: 'same source data already produced an applied change',
      sourceDataHash,
    }
  }

  if (alreadyAppliedForIssue(issue)) {
    return {
      status: 'skipped',
      experiment: issue.experiment,
      gameId: issue.gameId,
      title: issue.title,
      reason: 'same diagnosed issue already produced an applied change',
      sourceDataHash,
    }
  }

  const minimumConfidence = minimumConfidenceFor(issue.experiment)

  if (issue.confidence < minimumConfidence) {
    return {
      status: 'deferred',
      experiment: issue.experiment,
      gameId: issue.gameId,
      title: issue.title,
      reason: `confidence ${issue.confidence}% is below ${minimumConfidence}% guardrail`,
    }
  }

  if (issue.experiment === 'first_session_pacing') {
    const action = shiftWeight({ experiment: issue.experiment, preferredVariantId: 'fast-start', issue })
    if (action.status === 'applied') {
      touchedExperiments.add(issue.experiment)
    }
    return action
  }

  if (issue.experiment === 'reward_offer') {
    const action = shiftWeight({ experiment: issue.experiment, preferredVariantId: 'daily-streak', issue })
    if (action.status === 'applied') {
      touchedExperiments.add(issue.experiment)
    }
    return action
  }

  if (issue.experiment === 'thumbnail_board_state_v2') {
    const action = shiftWeight({ experiment: issue.experiment, preferredVariantId: 'board-state', issue })
    if (action.status === 'applied') {
      touchedExperiments.add(issue.experiment)
    }
    return action
  }

  return {
    status: 'deferred',
    experiment: issue.experiment,
    gameId: issue.gameId,
    title: issue.title,
    reason: 'no safe automatic applier exists for this experiment',
  }
}

for (const recommendation of experimentResults.recommendations ?? []) {
  actions.push(applyExperimentRecommendation(recommendation))
}

for (const issue of backlog) {
  actions.push(applyIssue(issue))
}

const appliedActions = actions.filter((action) => action.status === 'applied')

if (appliedActions.length) {
  policy.generatedAt = new Date().toISOString()
}

const dedupeHistory = (items) => {
  const seen = new Set()
  const deduped = []

  for (const item of items) {
    const key = [item.experiment, item.gameId, item.title, item.sourceReason].join('|')

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    deduped.push(item)
  }

  return deduped
}

const nextHistory = dedupeHistory([
  ...history,
  ...appliedActions.map((action) => ({
    ...action,
    appliedAt: policy.generatedAt,
  })),
])

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'applied-improvements-ready',
  sourceDataHash,
  releaseHealthStatus: releaseHealth.status,
  experimentResultsStatus: experimentResults.status,
  playableGameIds: [...playableGameIds],
  actions,
  history: nextHistory,
}

const report = [
  '# Applied Improvements',
  '',
  `Generated: ${payload.generatedAt}`,
  `Source data hash: ${sourceDataHash}`,
  `Release health: ${releaseHealth.status}`,
  `Experiment results: ${experimentResults.status}`,
  `Playable targets: ${payload.playableGameIds.join(', ')}`,
  '',
  '## Actions',
  '',
  ...actions.map((action) =>
    action.status === 'applied'
      ? `- applied: ${action.experiment} for ${action.gameId}; ${action.change}.`
      : `- ${action.status}: ${action.experiment ?? 'none'} for ${
          action.gameId ?? (action.source === 'experiment-results' ? 'all-games' : 'unknown')
        }; ${action.reason}.`,
  ),
  '',
  '## Guardrails',
  '',
  `- Minimum variant weight: ${policy.guardrails.minVariantWeight}`,
  `- Maximum variant weight: ${policy.guardrails.maxVariantWeight}`,
  `- Maximum shift per run: ${policy.guardrails.maxShiftPerRun}`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(policyPath, JSON.stringify(policy, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, policyPath)}`)
console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
