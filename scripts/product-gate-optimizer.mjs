import { mkdir, readFile, writeFile } from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const analyticsPath = path.join(dataDir, 'analytics-rollup.json')
const gatesPath = path.join(dataDir, 'production-gates.json')
const playablePath = path.join(dataDir, 'playable-games.json')
const balancePath = path.join(dataDir, 'game-balance.json')
const generatedPlayablePath = path.join(dataDir, 'generated-playable-games.json')
const releaseHealthPath = path.join(dataDir, 'release-health.json')
const outputJsonPath = path.join(dataDir, 'product-optimization.json')
const outputTsPath = path.join(srcDataDir, 'productOptimization.ts')
const generatedPlayableTsPath = path.join(srcDataDir, 'generatedPlayableGames.ts')
const reportPath = path.join(reportsDir, 'product-optimization-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')

const analytics = await readJson(analyticsPath)
const gates = await readJson(gatesPath)
const playable = await readJson(playablePath)
const balance = await readJson(balancePath)
const generatedPlayable = await readOptionalJson(generatedPlayablePath, { games: [] })
const releaseHealth = await readOptionalJson(releaseHealthPath, {
  status: 'missing',
  controls: { canApplyExperimentChanges: true },
})
const previous = await readOptionalJson(outputJsonPath, { history: [] })

const playableIds = new Set(playable.games ?? [])
const minStartsForBalanceChange = 100
const productGates = {
  firstGameCompletion: {
    actual: roundMetric(analytics.totals?.metrics?.firstGameCompletion),
    gate: gates.monetization.minFirstGameCompletion,
    pass: (analytics.totals?.metrics?.firstGameCompletion ?? 0) >= gates.monetization.minFirstGameCompletion,
  },
  replayRate: {
    actual: roundMetric(analytics.totals?.metrics?.replayRate),
    gate: gates.monetization.minReplayRate,
    pass: (analytics.totals?.metrics?.replayRate ?? 0) >= gates.monetization.minReplayRate,
  },
  d1Retention: {
    actual: roundMetric(analytics.totals?.metrics?.d1Retention),
    gate: gates.monetization.minD1Retention,
    pass: (analytics.totals?.metrics?.d1Retention ?? 0) >= gates.monetization.minD1Retention,
  },
}

const sourceEvidence = {
  analyticsSource: analytics.sourceStatus?.activeSource,
  retentionSource: analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? null,
  totals: analytics.totals?.metrics,
  games: (analytics.games ?? []).map((game) => ({
    gameId: game.gameId,
    playable: playableIds.has(game.gameId),
    starts: game.counts?.game_started ?? 0,
    metrics: game.metrics,
  })),
  gates: productGates,
}
const sourceDataHash = crypto.createHash('sha256').update(JSON.stringify(sourceEvidence)).digest('hex').slice(0, 12)
const history = previous.history ?? []
const alreadyApplied = ({ gameId, actionType }) =>
  history.some(
    (action) =>
      action.status === 'applied' &&
      action.gameId === gameId &&
      action.actionType === actionType &&
      action.sourceDataHash === sourceDataHash,
  )

const candidates = (analytics.games ?? [])
  .filter((game) => playableIds.has(game.gameId))
  .map((game) => {
    const metrics = game.metrics ?? {}
    const starts = game.counts?.game_started ?? 0
    const completionGap = Math.max(0, gates.monetization.minFirstGameCompletion - (metrics.firstGameCompletion ?? 0))
    const replayGap = Math.max(0, gates.monetization.minReplayRate - (metrics.replayRate ?? 0))
    const tutorialGap = Math.max(0, 0.75 - (metrics.tutorialCompletion ?? 0))
    const score = Math.round((completionGap * 55 + replayGap * 25 + tutorialGap * 20) * Math.min(1.5, starts / 100) * 100)

    return {
      gameId: game.gameId,
      starts,
      metrics: {
        startRate: roundMetric(metrics.startRate),
        tutorialCompletion: roundMetric(metrics.tutorialCompletion),
        firstGameCompletion: roundMetric(metrics.firstGameCompletion),
        replayRate: roundMetric(metrics.replayRate),
      },
      gaps: {
        completion: roundMetric(completionGap),
        replay: roundMetric(replayGap),
        tutorial: roundMetric(tutorialGap),
      },
      score,
    }
  })
  .sort((a, b) => b.score - a.score)

const actions = []
const targetCandidate = candidates.find(
  (candidate) =>
    candidate.starts >= minStartsForBalanceChange &&
    (candidate.metrics.firstGameCompletion ?? 1) < gates.monetization.minFirstGameCompletion &&
    balance.games?.[candidate.gameId],
)

if (!targetCandidate) {
  actions.push({
    id: 'target-score-curve',
    actionType: 'target-score-curve',
    status: 'monitor',
    reason: 'No playable game has enough starts and a completion gap for safe target-score tuning.',
  })
} else if (releaseHealth.controls?.canApplyExperimentChanges === false) {
  actions.push({
    id: `target-score-curve-${targetCandidate.gameId}`,
    actionType: 'target-score-curve',
    status: 'held',
    gameId: targetCandidate.gameId,
    reason: `Release health guard is ${releaseHealth.status}.`,
  })
} else if (alreadyApplied({ gameId: targetCandidate.gameId, actionType: 'target-score-curve' })) {
  const previousAction = history.find(
    (action) =>
      action.status === 'applied' &&
      action.gameId === targetCandidate.gameId &&
      action.actionType === 'target-score-curve' &&
      action.sourceDataHash === sourceDataHash,
  )
  actions.push({
    ...previousAction,
    status: 'already-applied',
    reason: 'Same analytics evidence already produced a target-score tuning change.',
  })
} else {
  const gameConfig = balance.games[targetCandidate.gameId]
  const tuning = gameConfig.tuning ?? { minTargetScore: gameConfig.targetScore, targetStep: 0 }
  const before = gameConfig.targetScore
  const step = Math.max(1, tuning.targetStep ?? 1)
  const after = Math.max(tuning.minTargetScore ?? before, before - step)

  if (after === before) {
    actions.push({
      id: `target-score-curve-${targetCandidate.gameId}`,
      actionType: 'target-score-curve',
      status: 'held',
      gameId: targetCandidate.gameId,
      before,
      after,
      reason: 'Target score is already at its configured lower tuning bound.',
    })
  } else {
    gameConfig.targetScore = after
    actions.push({
      id: `target-score-curve-${targetCandidate.gameId}`,
      actionType: 'target-score-curve',
      status: 'applied',
      gameId: targetCandidate.gameId,
      title: gameConfig.title,
      sourceDataHash,
      before,
      after,
      delta: after - before,
      confidence: Math.min(92, Math.round(68 + targetCandidate.starts / 25 + targetCandidate.gaps.completion * 60)),
      reason: `First-game completion is ${pct(targetCandidate.metrics.firstGameCompletion)}; monetization gate is ${pct(gates.monetization.minFirstGameCompletion)}.`,
      guardrail: `Changed by one target step (${step}) and stayed above min target ${tuning.minTargetScore}.`,
    })
  }
}

const replayNeedsTelemetry = !productGates.replayRate.pass
const retentionNeedsActivation = !productGates.d1Retention.pass
const firstMoveCoachNeeded =
  !productGates.firstGameCompletion.pass ||
  candidates.some((candidate) => (candidate.metrics.tutorialCompletion ?? 1) < 0.75)
actions.push({
  id: 'runtime-first-move-coach',
  actionType: 'runtime-first-move-coach',
  status: firstMoveCoachNeeded ? 'armed' : 'monitor',
  reason: firstMoveCoachNeeded
    ? `Completion is ${pct(productGates.firstGameCompletion.actual)} and tutorial completion is ${pct(
        analytics.totals?.metrics?.tutorialCompletion,
      )}; highlight one strong first move without auto-playing.`
    : 'Completion and tutorial gates are stable; keep the first-move coach dormant.',
  guardrail: 'First-turn highlight only, no forced tutorial, no auto move, telemetry must record shown/used/skipped.',
})
actions.push({
  id: 'runtime-completion-nudge',
  actionType: 'runtime-completion-nudge',
  status: firstMoveCoachNeeded ? 'armed' : 'monitor',
  reason: firstMoveCoachNeeded
    ? `First-game completion is ${pct(productGates.firstGameCompletion.actual)}; show one optional mid-run nudge and measure completion_nudge_* against level_completed and game_abandoned.`
    : 'Completion gate is stable; keep mid-run completion nudges monitored.',
  guardrail:
    'Mid-run prompt only, no forced tutorial, no auto move, no rule change, and telemetry must record viewed/clicked/dismissed.',
})
actions.push({
  id: 'runtime-finish-line-coach',
  actionType: 'runtime-finish-line-coach',
  status: firstMoveCoachNeeded ? 'armed' : 'monitor',
  reason: firstMoveCoachNeeded
    ? `First-game completion is ${pct(productGates.firstGameCompletion.actual)}; show target pace only when a run falls behind after the midpoint.`
    : 'Completion gate is stable; keep behind-pace finish-line coaching monitored.',
  guardrail:
    'Behind-pace midpoint prompt only, no score changes, no auto move, no forced tutorial, and telemetry must record viewed/clicked/dismissed.',
})
actions.push({
  id: 'runtime-replay-telemetry',
  actionType: 'runtime-replay-telemetry',
  status: replayNeedsTelemetry ? 'armed' : 'monitor',
  reason: replayNeedsTelemetry
    ? `Replay rate is ${pct(productGates.replayRate.actual)}; keep reset and in-canvas restart telemetry wired to replay_clicked.`
    : 'Replay gate is passing; keep replay telemetry monitored.',
})
actions.push({
  id: 'runtime-replay-prompt',
  actionType: 'runtime-replay-prompt',
  status: replayNeedsTelemetry ? 'armed' : 'monitor',
  reason: replayNeedsTelemetry
    ? `Replay rate is ${pct(productGates.replayRate.actual)}; show one optional completed-run prompt and measure replay_prompt_* against replay_clicked.`
    : 'Replay gate is passing; keep completed-run replay prompts monitored.',
  guardrail:
    'Prompt only after a completed run, never auto-restart, never block exit, and keep revenue disabled until gates pass.',
})
actions.push({
  id: 'runtime-return-intent-activation',
  actionType: 'runtime-return-intent-activation',
  status: retentionNeedsActivation ? 'armed' : 'monitor',
  reason: retentionNeedsActivation
    ? `D1 retention is ${pct(productGates.d1Retention.actual)}; convert queued local return intent into a measured next-session start.`
    : 'D1 retention gate is passing; keep queued-return activation monitored.',
  guardrail:
    'Player-initiated start only, no push notifications, no background wakeups, no account requirement, and no paid incentives.',
})

const generatedSyncChanges = []

for (const game of generatedPlayable.games ?? []) {
  const tunedTarget = balance.games?.[game.id]?.targetScore

  if (typeof tunedTarget === 'number' && game.targetScore !== tunedTarget) {
    generatedSyncChanges.push({
      gameId: game.id,
      title: game.title,
      before: game.targetScore,
      after: tunedTarget,
    })
    game.targetScore = tunedTarget
    game.tutorial = game.tutorial.replace(/beat \d+/, `beat ${tunedTarget}`)
  }
}

const appliedActions = actions.filter((action) => action.status === 'applied')
const nextHistory = [
  ...history,
  ...appliedActions.map((action) => ({
    ...action,
    appliedAt: new Date().toISOString(),
  })),
]

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'product-optimization-ready',
  sourceDataHash,
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource,
    retentionSource: analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? null,
    releaseHealth: releaseHealth.status,
  },
  productGates,
  controls: {
    minStartsForBalanceChange,
    requirePlayableGame: true,
    noChangeWhenReleaseHealthBlocks: true,
    noRepeatForSameSourceData: true,
    oneTargetStepPerRun: true,
    keepGeneratedTargetsSynced: true,
    revenueStillDisabledUntilGatesPass: true,
    firstMoveCoachMustBeFirstTurnOnly: true,
    completionNudgeMustBeMidRunOnly: true,
    finishLineCoachBehindPaceOnly: true,
    replayPromptAfterCompletedRunOnly: true,
    returnIntentMustBePlayerInitiated: true,
    noBackgroundRetentionWakeups: true,
  },
  candidates,
  actions,
  generatedSyncChanges,
  history: nextHistory,
  nextActions: [
    appliedActions.length
      ? 'Rebuild, sync game config, and rerun bot simulation before the next release gate.'
      : 'Keep collecting starts until a safe product-gate tuning action is justified.',
    replayNeedsTelemetry
      ? 'Use replay_prompt_viewed/clicked/dismissed with replay_clicked to measure whether completed-run copy improves replay.'
      : 'Keep replay telemetry as a retention quality signal.',
    firstMoveCoachNeeded
      ? 'Use first_move_coach_shown/used/skipped to measure whether fast-start players complete more first runs.'
      : 'Keep first-move coaching dormant while gates are stable.',
    firstMoveCoachNeeded
      ? 'Use completion_nudge_viewed/clicked/dismissed against level_completed and game_abandoned to reduce first-run dropoff.'
      : 'Keep completion nudges dormant while gates are stable.',
    firstMoveCoachNeeded
      ? 'Use finish_line_coach_viewed/clicked/dismissed to test whether target-pace clarity reduces mid-run abandonment.'
      : 'Keep finish-line coaching dormant while gates are stable.',
    productGates.d1Retention.pass
      ? 'D1 retention gate is clear; keep local streak prompts measured.'
      : `Improve D1 retention from ${pct(productGates.d1Retention.actual)} toward ${pct(productGates.d1Retention.gate)} through queued return-intent activation.`,
  ],
}

const report = [
  '# Product Gate Optimizer',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Release health: ${payload.sourceStatus.releaseHealth}`,
  '',
  '## Product Gates',
  '',
  `- Completion: ${pct(productGates.firstGameCompletion.actual)} / ${pct(productGates.firstGameCompletion.gate)}`,
  `- Replay: ${pct(productGates.replayRate.actual)} / ${pct(productGates.replayRate.gate)}`,
  `- D1 retention: ${pct(productGates.d1Retention.actual)} / ${pct(productGates.d1Retention.gate)}`,
  '',
  '## Actions',
  '',
  ...actions.map((action) =>
    action.status === 'applied'
      ? `- applied: ${action.id}; ${action.title} target ${action.before} -> ${action.after}; ${action.reason}`
      : `- ${action.status}: ${action.id}; ${action.reason}`,
  ),
  '',
  '## Candidates',
  '',
  ...candidates.map(
    (candidate) =>
      `- ${candidate.gameId}: starts ${candidate.starts}; completion ${pct(candidate.metrics.firstGameCompletion)}; replay ${pct(candidate.metrics.replayRate)}; score ${candidate.score}.`,
  ),
  '',
  '## Guardrails',
  '',
  `- Minimum starts for balance change: ${minStartsForBalanceChange}`,
  '- One target-score step per run.',
  '- No repeated target-score change for the same analytics evidence.',
  '- Generated runtime targets stay synced to tuned balance config.',
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(balancePath, JSON.stringify(balance, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productOptimization = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductOptimization = typeof productOptimization\n`,
)

if ((generatedPlayable.games ?? []).length) {
  generatedPlayable.generatedAt = new Date().toISOString()
  await writeFile(generatedPlayablePath, JSON.stringify(generatedPlayable, null, 2) + '\n')
  await writeFile(
    generatedPlayableTsPath,
    `export const generatedPlayableGames = ${JSON.stringify(generatedPlayable.games, null, 2)} as const\n\nexport type GeneratedPlayableGame = (typeof generatedPlayableGames)[number]\n`,
  )
}

await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, balancePath)}`)
console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
if ((generatedPlayable.games ?? []).length) {
  console.log(`Wrote ${path.relative(root, generatedPlayablePath)}`)
  console.log(`Wrote ${path.relative(root, generatedPlayableTsPath)}`)
}
console.log(`Wrote ${path.relative(root, reportPath)}`)
