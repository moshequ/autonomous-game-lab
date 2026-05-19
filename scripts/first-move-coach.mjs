import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'first-move-coach.json')
const outputTsPath = path.join(root, 'src', 'data', 'firstMoveCoach.ts')
const reportPath = path.join(root, 'reports', 'first-move-coach-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')

const [
  analytics,
  productOptimization,
  experimentPolicy,
  backlog,
  playable,
  gameBalance,
  generatedPlayable,
  releaseHealth,
] = await Promise.all([
  readJson(path.join(dataDir, 'analytics-rollup.json')),
  readJson(path.join(dataDir, 'product-optimization.json')),
  readJson(path.join(dataDir, 'experiment-policy.json')),
  readOptionalJson(path.join(dataDir, 'improvement-backlog.json'), []),
  readJson(path.join(dataDir, 'playable-games.json')),
  readJson(path.join(dataDir, 'game-balance.json')),
  readOptionalJson(path.join(dataDir, 'generated-playable-games.json'), { games: [] }),
  readOptionalJson(path.join(dataDir, 'release-health.json'), {
    status: 'missing',
    controls: { canApplyExperimentChanges: true },
  }),
])

const playableIds = new Set(playable.games ?? [])
const analyticsRows = new Map((analytics.games ?? []).map((game) => [game.gameId, game]))
const generatedById = new Map((generatedPlayable.games ?? []).map((game) => [game.id, game]))
const pacingPolicy = experimentPolicy.experiments?.first_session_pacing
const fastStartWeight = pacingPolicy?.variants?.find((variant) => variant.id === 'fast-start')?.weight ?? 0
const guidedWeight = pacingPolicy?.variants?.find((variant) => variant.id === 'guided')?.weight ?? 0
const productGates = productOptimization.productGates ?? {}
const completionGap = Math.max(
  0,
  (productGates.firstGameCompletion?.gate ?? 0.55) - (productGates.firstGameCompletion?.actual ?? 0),
)
const tutorialGap = Math.max(0, 0.75 - (analytics.totals?.metrics?.tutorialCompletion ?? 0))
const backlogSignals = backlog.filter((item) =>
  ['first_session_pacing', 'target_score_curve'].includes(item.experiment),
)
const shouldCoach =
  releaseHealth.controls?.canApplyExperimentChanges !== false &&
  (completionGap > 0 || tutorialGap > 0 || backlogSignals.length > 0) &&
  fastStartWeight >= guidedWeight

const boardShapeFor = (gameId) => {
  const balance = gameBalance.games?.[gameId]
  const generated = generatedById.get(gameId)
  const rows = balance?.boardRows ?? generated?.boardRows ?? balance?.boardSize ?? 5
  const cols = balance?.boardCols ?? generated?.boardCols ?? balance?.boardSize ?? 5

  return { rows, cols }
}

const rowFor = (rows) => Math.max(0, Math.floor((rows - 1) / 2))
const colFor = (cols) => Math.max(0, Math.floor((cols - 1) / 2))

const scoreTarget = (gameId) => {
  const row = analyticsRows.get(gameId)
  const metrics = row?.metrics ?? {}
  const starts = row?.counts?.game_started ?? 0
  const rowCompletionGap = Math.max(
    0,
    (productGates.firstGameCompletion?.gate ?? 0.55) - (metrics.firstGameCompletion ?? 0),
  )
  const rowTutorialGap = Math.max(0, 0.75 - (metrics.tutorialCompletion ?? 0))

  return Math.round((rowCompletionGap * 60 + rowTutorialGap * 30 + completionGap * 10) * Math.min(1.5, starts / 100) * 100)
}

const targets = [...playableIds]
  .map((gameId) => {
    const shape = boardShapeFor(gameId)
    const balance = gameBalance.games?.[gameId]
    const generated = generatedById.get(gameId)
    const analyticsRow = analyticsRows.get(gameId)
    const row = rowFor(shape.rows)
    const col = colFor(shape.cols)
    const generatedRuntime = Boolean(generated)
    const runtimeSupported = gameId === 'harbor-rings' || generatedRuntime
    const priorityScore = scoreTarget(gameId)
    const sourceReason = analyticsRow
      ? `completion ${pct(analyticsRow.metrics?.firstGameCompletion)} and tutorial ${pct(
          analyticsRow.metrics?.tutorialCompletion,
        )}`
      : generatedRuntime
        ? 'generated daily/portfolio game without live row yet'
        : 'playable game without live row yet'

    return {
      gameId,
      title: balance?.title ?? generated?.title ?? gameId,
      enabled: shouldCoach && runtimeSupported,
      variantId: 'fast-start',
      surface: 'game-board-first-turn',
      recommendedCell: {
        row,
        col,
        label: shape.rows === shape.cols ? 'center' : 'middle lane',
      },
      board: shape,
      generatedRuntime,
      runtimeSupported,
      priorityScore,
      sourceReason,
      copy: 'Start here',
      telemetryId: `first-move-coach-${gameId}`,
    }
  })
  .sort((a, b) => b.priorityScore - a.priorityScore || a.gameId.localeCompare(b.gameId))

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'first-move-coach-ready',
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource,
    releaseHealth: releaseHealth.status,
    productOptimization: productOptimization.status,
    fastStartWeight,
    guidedWeight,
  },
  productGates: {
    firstGameCompletion: productGates.firstGameCompletion,
    replayRate: productGates.replayRate,
    d1Retention: productGates.d1Retention,
    tutorialCompletion: {
      actual: roundMetric(analytics.totals?.metrics?.tutorialCompletion),
      gate: 0.75,
      pass: (analytics.totals?.metrics?.tutorialCompletion ?? 0) >= 0.75,
    },
  },
  summary: {
    enabled: shouldCoach,
    targets: targets.length,
    enabledTargets: targets.filter((target) => target.enabled).length,
    primaryTargetId: targets[0]?.gameId ?? null,
    completionGap: roundMetric(completionGap),
    tutorialGap: roundMetric(tutorialGap),
  },
  controls: {
    zeroPaidSpend: true,
    firstTurnOnly: true,
    noAutoMove: true,
    noForcedTutorial: true,
    noRevenueEnablement: true,
    respectsExperimentPolicy: true,
    requiresReleaseHealth: true,
  },
  telemetry: {
    shown: 'first_move_coach_shown',
    used: 'first_move_coach_used',
    skipped: 'first_move_coach_skipped',
    properties: ['gameId', 'variantId', 'row', 'col', 'recommendedRow', 'recommendedCol', 'surface'],
  },
  targets,
  nextActions: [
    shouldCoach
      ? 'Measure first_move_coach_used against first-game completion before increasing revenue gates.'
      : 'Keep the coach dormant while product gates or release health do not justify first-turn help.',
    'Retire or soften the coach after live data shows tutorial and completion gates are stable.',
  ],
}

const report = [
  '# First Move Coach',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Enabled: ${payload.summary.enabled}`,
  `Primary target: ${payload.summary.primaryTargetId ?? 'none'}`,
  `Completion gap: ${pct(payload.summary.completionGap)}`,
  `Tutorial gap: ${pct(payload.summary.tutorialGap)}`,
  '',
  '## Targets',
  '',
  ...payload.targets
    .slice(0, 12)
    .map(
      (target) =>
        `- ${target.enabled ? 'enabled' : 'monitor'}: ${target.gameId} row ${target.recommendedCell.row}, col ${target.recommendedCell.col}; ${target.sourceReason}.`,
    ),
  '',
  '## Controls',
  '',
  `- First turn only: ${payload.controls.firstTurnOnly}`,
  `- No auto move: ${payload.controls.noAutoMove}`,
  `- Zero paid spend: ${payload.controls.zeroPaidSpend}`,
  `- Telemetry: ${payload.telemetry.shown}, ${payload.telemetry.used}, ${payload.telemetry.skipped}`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const firstMoveCoach = ${JSON.stringify(payload, null, 2)} as const\n\nexport type FirstMoveCoach = typeof firstMoveCoach\nexport type FirstMoveCoachTarget = FirstMoveCoach['targets'][number]\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
