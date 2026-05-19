import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'completion-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'completionLoop.ts')
const reportPath = path.join(root, 'reports', 'completion-loop-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const gates = await readJson(path.join(dataDir, 'production-gates.json'))
const productOptimization = await readJson(path.join(dataDir, 'product-optimization.json'))
const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const portfolio = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const balance = await readJson(path.join(dataDir, 'game-balance.json'))
const firstMoveCoach = await readJson(path.join(dataDir, 'first-move-coach.json'))

const playableIds = new Set(playable.games ?? [])
const metrics = analytics.totals?.metrics ?? {}
const counts = analytics.totals?.counts ?? {}
const completionGate = gates.monetization.minFirstGameCompletion
const completionRate = metrics.firstGameCompletion ?? 0
const tutorialRate = metrics.tutorialCompletion ?? 0
const abandonmentRate = counts.game_abandoned / Math.max(counts.game_started ?? 0, 1)
const completionGap = Math.max(0, completionGate - completionRate)
const tutorialGap = Math.max(0, 0.75 - tutorialRate)
const canNudgeCompletion =
  releaseHealth.controls?.canApplyExperimentChanges !== false && releaseHealth.controls?.rollbackRequired !== true

const candidates = (productOptimization.candidates ?? [])
  .filter((candidate) => playableIds.has(candidate.gameId))
  .map((candidate) => ({
    ...candidate,
    completionGap: Math.max(0, completionGate - (candidate.metrics?.firstGameCompletion ?? 0)),
    abandonmentPressure:
      (analytics.games ?? []).find((game) => game.gameId === candidate.gameId)?.counts?.game_abandoned ?? 0,
  }))
  .sort((a, b) => b.completionGap * 1000 + b.abandonmentPressure - (a.completionGap * 1000 + a.abandonmentPressure))

const fallbackTargetId =
  portfolio.rotation?.improvementGameIds?.find((gameId) => playableIds.has(gameId)) ??
  portfolio.rotation?.orderedGameIds?.find((gameId) => playableIds.has(gameId)) ??
  null
const targetCandidate = candidates[0] ?? (fallbackTargetId ? { gameId: fallbackTargetId, starts: 0, metrics: {} } : null)
const targetGameId = targetCandidate?.gameId ?? null
const targetConfig = targetGameId ? balance.games?.[targetGameId] : null
const targetPlayable = targetGameId ? playableIds.has(targetGameId) : false
const triggerMove = Math.max(2, Math.ceil((targetConfig?.maxMoves ?? 12) * 0.25))
const finishLineTriggerMove = Math.max(triggerMove + 1, Math.ceil((targetConfig?.maxMoves ?? 12) * 0.5))
const finishLineMinRemainingMoves = 2
const promptStatus = canNudgeCompletion && targetPlayable && completionGap > 0 ? 'armed' : 'monitor'

const payload = {
  generatedAt: new Date().toISOString(),
  status: targetPlayable ? 'completion-loop-ready' : 'blocked-missing-completion-game',
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    releaseHealth: releaseHealth.status,
    productOptimization: productOptimization.status,
    firstMoveCoach: firstMoveCoach.status,
  },
  target: {
    gameId: targetGameId,
    title: targetConfig?.title ?? targetGameId,
    starts: targetCandidate?.starts ?? 0,
    maxMoves: targetConfig?.maxMoves ?? 12,
    triggerMove,
    candidateCompletionRate: roundMetric(targetCandidate?.metrics?.firstGameCompletion),
    candidateTutorialRate: roundMetric(targetCandidate?.metrics?.tutorialCompletion),
  },
  metrics: {
    firstGameCompletion: roundMetric(completionRate),
    completionGate: roundMetric(completionGate),
    completionGap: roundMetric(completionGap),
    tutorialCompletion: roundMetric(tutorialRate),
    tutorialGap: roundMetric(tutorialGap),
    abandonmentRate: roundMetric(abandonmentRate),
    gameStarts: counts.game_started ?? 0,
    completions: counts.level_completed ?? 0,
    abandonments: counts.game_abandoned ?? 0,
    promptViews: counts.completion_nudge_viewed ?? 0,
    promptClicks: counts.completion_nudge_clicked ?? 0,
    promptDismissals: counts.completion_nudge_dismissed ?? 0,
  },
  promptPolicy: {
    id: 'mid-run-finish-nudge',
    status: promptStatus,
    surface: 'autonomy-cockpit-completion-card',
    trigger: 'after-progress-checkpoint',
    triggerMove,
    ctaLabel: 'Keep playing',
    dismissLabel: 'Hide',
    copy: 'You are already into the run. Finish the last turns to get a useful score.',
    cooldown: 'one prompt per active run',
    reason:
      promptStatus === 'armed'
        ? `First-game completion is ${pct(completionRate)} and the gate is ${pct(completionGate)}; nudge players who reach move ${triggerMove} to finish.`
        : 'Completion gate is stable, release health is holding nudges, or no playable completion target exists.',
    telemetry: {
      viewed: 'completion_nudge_viewed',
      clicked: 'completion_nudge_clicked',
      dismissed: 'completion_nudge_dismissed',
      completed: 'level_completed',
      abandoned: 'game_abandoned',
    },
  },
  finishLinePolicy: {
    id: 'behind-pace-finish-line-coach',
    status: promptStatus,
    surface: 'autonomy-cockpit-finish-line-card',
    trigger: 'behind-pace-after-midpoint',
    triggerMove: finishLineTriggerMove,
    minimumRemainingMoves: finishLineMinRemainingMoves,
    scorePaceRatio: 0.92,
    ctaLabel: 'Focus board',
    dismissLabel: 'Hide',
    copy: 'You still have enough turns. Use the target pace to decide whether to chase points or finish cleanly.',
    cooldown: 'one finish-line coach per active run',
    reason:
      promptStatus === 'armed'
        ? `First-game completion is ${pct(completionRate)}; show target pace only when the run is behind after move ${finishLineTriggerMove}.`
        : 'Completion gate is stable, release health is holding nudges, or no playable completion target exists.',
    telemetry: {
      viewed: 'finish_line_coach_viewed',
      clicked: 'finish_line_coach_clicked',
      dismissed: 'finish_line_coach_dismissed',
      completed: 'level_completed',
      abandoned: 'game_abandoned',
    },
  },
  localState: {
    dismissedRunKey: 'agl.completion.dismissedRunKey',
    acceptedRunKey: 'agl.completion.acceptedRunKey',
    finishLineDismissedRunKey: 'agl.finishLine.dismissedRunKey',
    finishLineAcceptedRunKey: 'agl.finishLine.acceptedRunKey',
  },
  controls: {
    zeroPaidSpend: true,
    midRunOnly: true,
    onePromptPerRun: true,
    noForcedTutorial: true,
    noAutoMove: true,
    noRuleChange: true,
    finishLineCoachBehindPaceOnly: true,
    finishLineCoachAfterMidpointOnly: true,
    noScoreManipulation: true,
    noPaidRewards: true,
    noRevenueEnablement: true,
    noDarkPatterns: true,
    requireAbandonmentTelemetry: true,
    canNudgeCompletion,
    completionReady: completionRate >= completionGate,
    monetizationStillBlocked:
      completionRate < completionGate ||
      (metrics.replayRate ?? 0) < gates.monetization.minReplayRate ||
      (metrics.d1Retention ?? 0) < gates.monetization.minD1Retention,
  },
  missions: [
    {
      id: 'reach-progress-checkpoint',
      label: `Reach move ${triggerMove}`,
      event: 'completion_nudge_viewed',
      gameId: targetGameId,
      reward: 'finish-context',
      status: promptStatus,
    },
    {
      id: 'choose-keep-playing',
      label: 'Choose to keep playing from the completion nudge',
      event: 'completion_nudge_clicked',
      gameId: targetGameId,
      reward: 'attention-return',
      status: promptStatus,
    },
    {
      id: 'complete-after-nudge',
      label: 'Complete the run after a progress checkpoint',
      event: 'level_completed',
      gameId: targetGameId,
      reward: 'completion-signal',
      status: targetPlayable ? 'armed' : 'blocked-missing-game',
    },
    {
      id: 'view-finish-line-coach',
      label: 'Show target pace when a run falls behind',
      event: 'finish_line_coach_viewed',
      gameId: targetGameId,
      reward: 'pace-clarity',
      status: promptStatus,
    },
    {
      id: 'focus-after-finish-line-coach',
      label: 'Choose to focus the board from the finish-line coach',
      event: 'finish_line_coach_clicked',
      gameId: targetGameId,
      reward: 'attention-return',
      status: promptStatus,
    },
    {
      id: 'measure-abandonment',
      label: 'Measure abandoned runs against nudge exposure',
      event: 'game_abandoned',
      gameId: targetGameId,
      reward: 'friction-signal',
      status: 'armed',
    },
  ],
  nextActions: [
    completionRate >= completionGate
      ? 'Completion gate is clear; keep completion nudges in monitor mode.'
      : `Improve first-game completion from ${pct(completionRate)} toward ${pct(completionGate)} with a measured checkpoint nudge.`,
    'Compare completion_nudge_viewed/clicked/dismissed against level_completed and game_abandoned before changing copy.',
    'Keep completion nudges optional, rule-neutral, and zero-spend until product gates pass.',
  ],
}

const report = [
  '# Completion Loop',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Target: ${payload.target.title ?? 'missing'} (${payload.target.gameId ?? 'missing'})`,
  `Completion: ${pct(payload.metrics.firstGameCompletion)} / ${pct(payload.metrics.completionGate)}`,
  `Abandonment: ${pct(payload.metrics.abandonmentRate)}`,
  '',
  '## Prompt Policy',
  '',
  `- Status: ${payload.promptPolicy.status}`,
  `- Surface: ${payload.promptPolicy.surface}`,
  `- Trigger: ${payload.promptPolicy.trigger} at move ${payload.promptPolicy.triggerMove}`,
  `- Telemetry: ${payload.promptPolicy.telemetry.viewed}, ${payload.promptPolicy.telemetry.clicked}, ${payload.promptPolicy.telemetry.dismissed}, ${payload.promptPolicy.telemetry.completed}, ${payload.promptPolicy.telemetry.abandoned}`,
  '',
  '## Missions',
  '',
  ...payload.missions.map((mission) => `- ${mission.status}: ${mission.id} - ${mission.label}`),
  '',
  '## Finish-Line Coach',
  '',
  `- Status: ${payload.finishLinePolicy.status}`,
  `- Surface: ${payload.finishLinePolicy.surface}`,
  `- Trigger: ${payload.finishLinePolicy.trigger} at move ${payload.finishLinePolicy.triggerMove}`,
  `- Telemetry: ${payload.finishLinePolicy.telemetry.viewed}, ${payload.finishLinePolicy.telemetry.clicked}, ${payload.finishLinePolicy.telemetry.dismissed}`,
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
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
  `export const completionLoop = ${JSON.stringify(payload, null, 2)} as const\n\nexport type CompletionLoop = typeof completionLoop\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
