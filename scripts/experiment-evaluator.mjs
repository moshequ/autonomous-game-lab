import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const samplePath = path.join(root, 'data', 'experiment-sample.json')
const localEventsDir = path.join(root, 'data', 'player-events')
const policyPath = path.join(root, 'data', 'experiment-policy.json')
const outputJsonPath = path.join(root, 'data', 'experiment-results.json')
const outputTsPath = path.join(root, 'src', 'data', 'experimentResults.ts')
const reportPath = path.join(root, 'reports', 'experiment-results-latest.md')

const countedEvents = [
  'experiment_assigned',
  'game_viewed',
  'game_started',
  'tutorial_completed',
  'level_completed',
  'game_abandoned',
  'replay_clicked',
]

const experimentVariantProperty = {
  first_session_pacing: 'variantId',
  reward_offer: 'rewardVariantId',
  thumbnail_board_state_v2: 'thumbnailVariantId',
}

const metricWeights = {
  first_session_pacing: {
    tutorialCompletion: 0.7,
    firstGameCompletion: 0.2,
    abandonmentRate: -0.1,
  },
  reward_offer: {
    replayRate: 0.75,
    firstGameCompletion: 0.15,
    abandonmentRate: -0.1,
  },
  thumbnail_board_state_v2: {
    startRate: 0.75,
    firstGameCompletion: 0.15,
    abandonmentRate: -0.1,
  },
}

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const emptyCounts = () => Object.fromEntries(countedEvents.map((eventName) => [eventName, 0]))

const roundMetric = (value) => Math.round(value * 1000) / 1000

const pct = (value) => `${Math.round(value * 100)}%`

const loadLocalEvents = async () => {
  let files = []

  try {
    files = (await readdir(localEventsDir)).filter((file) => file.endsWith('.json'))
  } catch {
    return { files: [], events: [] }
  }

  const eventBatches = await Promise.all(
    files.map(async (file) => {
      const payload = await readJson(path.join(localEventsDir, file))
      return Array.isArray(payload) ? payload : payload.events ?? []
    }),
  )

  return {
    files,
    events: eventBatches.flat(),
  }
}

const ensureVariantRow = (experiments, experimentId, variantId) => {
  if (!experimentId || !variantId) {
    return null
  }

  if (!experiments.has(experimentId)) {
    experiments.set(experimentId, new Map())
  }

  const variants = experiments.get(experimentId)

  if (!variants.has(variantId)) {
    variants.set(variantId, {
      variantId,
      counts: emptyCounts(),
    })
  }

  return variants.get(variantId)
}

const rowsFromSample = async () => {
  const sample = await readJson(samplePath)

  return {
    source: sample.source ?? 'fixture-experiment-results',
    experiments: (sample.experiments ?? []).map((experiment) => ({
      id: experiment.id,
      variants: experiment.variants.map((variant) => ({
        variantId: variant.variantId,
        counts: {
          ...emptyCounts(),
          ...variant.counts,
        },
      })),
    })),
  }
}

const rowsFromEvents = (events) => {
  const experiments = new Map()

  for (const event of events) {
    const eventName = event.name ?? event.event
    const properties = event.properties ?? {}

    if (!countedEvents.includes(eventName)) {
      continue
    }

    if (eventName === 'experiment_assigned') {
      const row = ensureVariantRow(experiments, properties.experiment, properties.variant)

      if (row) {
        row.counts.experiment_assigned += 1
      }

      continue
    }

    for (const [experimentId, property] of Object.entries(experimentVariantProperty)) {
      const row = ensureVariantRow(experiments, experimentId, properties[property])

      if (row) {
        row.counts[eventName] += 1
      }
    }
  }

  return {
    source: 'local-event-drops',
    experiments: [...experiments.entries()].map(([id, variants]) => ({
      id,
      variants: [...variants.values()],
    })),
  }
}

const fetchPosthogRows = async () => {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

  if (!projectId || !apiKey) {
    return { status: 'not-configured', experiments: [] }
  }

  const host = process.env.POSTHOG_HOST ?? 'https://us.posthog.com'
  const lookbackDays = Number(process.env.POSTHOG_LOOKBACK_DAYS ?? 7)
  const eventList = countedEvents.map((eventName) => `'${eventName}'`).join(', ')
  const query = `
    SELECT
      event,
      properties.experiment AS assigned_experiment,
      properties.variant AS assigned_variant,
      properties.variantId AS pacing_variant,
      properties.rewardVariantId AS reward_variant,
      properties.thumbnailVariantId AS thumbnail_variant,
      count() AS event_count
    FROM events
    WHERE timestamp >= now() - INTERVAL ${lookbackDays} DAY
      AND event IN (${eventList})
    GROUP BY event, assigned_experiment, assigned_variant, pacing_variant, reward_variant
  `

  try {
    const response = await fetch(`${host.replace(/\/$/, '')}/api/projects/${projectId}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
    })

    if (!response.ok) {
      return { status: 'error', error: `PostHog experiment query failed with ${response.status}`, experiments: [] }
    }

    const payload = await response.json()
    const experiments = new Map()

    for (const result of payload.results ?? []) {
      const [
        eventName,
        assignedExperiment,
        assignedVariant,
        pacingVariant,
        rewardVariant,
        thumbnailVariant,
        eventCount,
      ] = result
      const count = Number(eventCount)

      if (eventName === 'experiment_assigned') {
        const row = ensureVariantRow(experiments, assignedExperiment, assignedVariant)

        if (row) {
          row.counts.experiment_assigned += count
        }

        continue
      }

      const pacingRow = ensureVariantRow(experiments, 'first_session_pacing', pacingVariant)
      const rewardRow = ensureVariantRow(experiments, 'reward_offer', rewardVariant)
      const thumbnailRow = ensureVariantRow(experiments, 'thumbnail_board_state_v2', thumbnailVariant)

      if (pacingRow) {
        pacingRow.counts[eventName] += count
      }

      if (rewardRow) {
        rewardRow.counts[eventName] += count
      }

      if (thumbnailRow) {
        thumbnailRow.counts[eventName] += count
      }
    }

    return {
      status: 'configured',
      experiments: [...experiments.entries()].map(([id, variants]) => ({
        id,
        variants: [...variants.values()],
      })),
    }
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error.message : String(error), experiments: [] }
  }
}

const addMetrics = (variant) => {
  const counts = variant.counts
  const gameViews = Math.max(counts.game_viewed, counts.game_started, 1)
  const gameStarts = Math.max(counts.game_started, 1)
  const levelCompleted = Math.max(counts.level_completed, 1)

  return {
    ...variant,
    metrics: {
      startRate: roundMetric(counts.game_started / gameViews),
      tutorialCompletion: roundMetric(counts.tutorial_completed / gameStarts),
      firstGameCompletion: roundMetric(counts.level_completed / gameStarts),
      replayRate: roundMetric(counts.replay_clicked / levelCompleted),
      abandonmentRate: roundMetric(counts.game_abandoned / gameStarts),
    },
  }
}

const scoreVariant = (experimentId, metrics) => {
  const weights = metricWeights[experimentId] ?? metricWeights.first_session_pacing

  return roundMetric(
    Object.entries(weights).reduce((sum, [metric, weight]) => sum + (metrics[metric] ?? 0) * weight, 0),
  )
}

const confidenceFrom = ({ winner, runnerUp, totalStarts }) => {
  const margin = Math.max(winner.score - runnerUp.score, 0)
  const sampleConfidence = Math.min(35, Math.floor(totalStarts / 12))
  const marginConfidence = Math.min(45, Math.round(margin * 320))

  return Math.min(95, 35 + sampleConfidence + marginConfidence)
}

const evaluateExperiment = (experiment, policy) => {
  const variants = experiment.variants.map(addMetrics).map((variant) => ({
    ...variant,
    currentWeight:
      policy.experiments?.[experiment.id]?.variants?.find((policyVariant) => policyVariant.id === variant.variantId)
        ?.weight ?? null,
    score: scoreVariant(experiment.id, variant.metrics),
  }))
  const ranked = [...variants].sort((a, b) => b.score - a.score)
  const winner = ranked[0] ?? null
  const runnerUp = ranked[1] ?? null
  const totalStarts = variants.reduce((sum, variant) => sum + variant.counts.game_started, 0)
  const minimumVariantStarts = Math.min(...variants.map((variant) => variant.counts.game_started))
  const confidence = winner && runnerUp ? confidenceFrom({ winner, runnerUp, totalStarts }) : 0
  const winnerAtGuardrail = (winner?.currentWeight ?? 0) >= (policy.guardrails?.maxVariantWeight ?? 100)
  const recommendedAction =
    !winner || !runnerUp || variants.length < 2
      ? 'collect-more-data'
      : minimumVariantStarts < 50
        ? 'collect-more-data'
        : winnerAtGuardrail
          ? 'hold-at-guardrail'
        : winner.score - runnerUp.score < 0.035
          ? 'hold-even'
          : confidence >= (policy.guardrails?.minimumConfidenceByExperiment?.[experiment.id] ?? policy.guardrails?.minimumConfidence ?? 70)
            ? 'promote-winner'
            : 'collect-more-data'

  return {
    id: experiment.id,
    primaryMetric:
      experiment.id === 'reward_offer'
        ? 'replayRate'
        : experiment.id === 'thumbnail_board_state_v2'
          ? 'startRate'
          : 'tutorialCompletion',
    totalStarts,
    minimumVariantStarts,
    confidence,
    recommendedAction,
    winner: winner
      ? {
          variantId: winner.variantId,
          score: winner.score,
          currentWeight: winner.currentWeight,
        }
      : null,
    runnerUp: runnerUp
      ? {
          variantId: runnerUp.variantId,
          score: runnerUp.score,
          currentWeight: runnerUp.currentWeight,
        }
      : null,
    variants,
  }
}

const policy = await readJson(policyPath)
const posthog = await fetchPosthogRows()
const local = await loadLocalEvents()
const localResults = rowsFromEvents(local.events)
const sampleResults = await rowsFromSample()

let activeSource = sampleResults.source
let experimentRows = sampleResults.experiments

if (posthog.experiments.length) {
  activeSource = 'posthog'
  experimentRows = posthog.experiments
} else if (localResults.experiments.length) {
  activeSource = localResults.source
  experimentRows = localResults.experiments
}

const experiments = experimentRows
  .filter((experiment) => policy.experiments?.[experiment.id])
  .map((experiment) => evaluateExperiment(experiment, policy))
const recommendations = experiments.map((experiment) => ({
  experiment: experiment.id,
  action: experiment.recommendedAction,
  winnerVariant: experiment.winner?.variantId ?? null,
  runnerUpVariant: experiment.runnerUp?.variantId ?? null,
  confidence: experiment.confidence,
  reason:
    experiment.recommendedAction === 'promote-winner' && experiment.winner && experiment.runnerUp
      ? `${experiment.winner.variantId} beat ${experiment.runnerUp.variantId} on ${experiment.primaryMetric} with ${experiment.confidence}% confidence`
      : experiment.recommendedAction === 'hold-at-guardrail' && experiment.winner
        ? `${experiment.winner.variantId} is already at the maximum safe traffic weight`
      : experiment.recommendedAction === 'hold-even'
        ? 'variant scores are too close to move safely'
        : 'more variant data is needed before moving weights',
}))

const payload = {
  generatedAt: new Date().toISOString(),
  status: experiments.length ? 'evaluated' : 'blocked',
  sourceStatus: {
    activeSource,
    posthog: {
      status: posthog.status,
      error: posthog.error ?? null,
    },
    localEventDrops: {
      directory: path.relative(root, localEventsDir),
      files: local.files.length,
      events: local.events.length,
    },
    fallbackSample: {
      experiments: sampleResults.experiments.length,
    },
  },
  experiments,
  recommendations,
}

const report = [
  '# Experiment Results',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Active source: ${payload.sourceStatus.activeSource}`,
  '',
  '## Recommendations',
  '',
  ...recommendations.map(
    (recommendation) =>
      `- ${recommendation.action}: ${recommendation.experiment}; ${recommendation.reason}.`,
  ),
  '',
  '## Experiments',
  '',
  ...experiments.flatMap((experiment) => [
    `### ${experiment.id}`,
    '',
    `- Primary metric: ${experiment.primaryMetric}`,
    `- Starts: ${experiment.totalStarts}`,
    `- Confidence: ${experiment.confidence}%`,
    `- Recommendation: ${experiment.recommendedAction}`,
    ...experiment.variants.map(
      (variant) =>
        `- ${variant.variantId}: score ${variant.score}, start ${pct(
          variant.metrics.startRate,
        )}, tutorial ${pct(
          variant.metrics.tutorialCompletion,
        )}, completion ${pct(variant.metrics.firstGameCompletion)}, replay ${pct(
          variant.metrics.replayRate,
        )}, abandonment ${pct(variant.metrics.abandonmentRate)}`,
    ),
    '',
  ]),
]

const tsOutput = `export const experimentResults = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ExperimentResults = typeof experimentResults\n`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(outputTsPath, tsOutput)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
