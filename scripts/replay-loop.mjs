import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'replay-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'replayLoop.ts')
const reportPath = path.join(root, 'reports', 'replay-loop-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const gates = await readJson(path.join(dataDir, 'production-gates.json'))
const productOptimization = await readJson(path.join(dataDir, 'product-optimization.json'))
const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const portfolio = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const experimentPolicy = await readJson(path.join(dataDir, 'experiment-policy.json'))
const experimentResults = await readJson(path.join(dataDir, 'experiment-results.json'))
const sourceDataHash = hashSourceData({
  'analytics-rollup': analytics,
  'production-gates': gates,
  'product-optimization': productOptimization,
  'release-health': releaseHealth,
  'playable-games': playable,
  'portfolio-policy': portfolio,
  'growth-plan': growth,
  'experiment-policy': experimentPolicy,
  'experiment-results': experimentResults,
})

const playableIds = new Set(playable.games ?? [])
const metrics = analytics.totals?.metrics ?? {}
const counts = analytics.totals?.counts ?? {}
const replayGate = gates.monetization.minReplayRate
const replayRate = metrics.replayRate ?? 0
const replayGap = Math.max(0, replayGate - replayRate)
const completionReady = (metrics.firstGameCompletion ?? 0) >= gates.monetization.minFirstGameCompletion
const retentionReady = (metrics.d1Retention ?? 0) >= gates.monetization.minD1Retention
const replayReady = replayRate >= replayGate
const canNudgeReplay =
  releaseHealth.controls?.canApplyExperimentChanges !== false && releaseHealth.controls?.rollbackRequired !== true
const rewardExperiment = experimentResults.recommendations?.find(
  (recommendation) => recommendation.experiment === 'reward_offer',
)
const rewardExperimentDetail = experimentResults.experiments?.find(
  (experiment) => experiment.id === 'reward_offer',
)
const dailyStreakStats = rewardExperimentDetail?.variants?.find((variant) => variant.variantId === 'daily-streak')
const runnerUpStats = rewardExperimentDetail?.variants?.find(
  (variant) => variant.variantId === rewardExperiment?.runnerUpVariant,
)
const dailyStreakVariant = experimentPolicy.experiments?.reward_offer?.variants?.find(
  (variant) => variant.id === 'daily-streak',
)
const rewardConfidenceFloor =
  experimentPolicy.guardrails?.minimumConfidenceByExperiment?.reward_offer ??
  experimentPolicy.guardrails?.minimumConfidence ??
  70
const dailyStreakLift =
  typeof dailyStreakStats?.metrics?.replayRate === 'number' &&
  typeof runnerUpStats?.metrics?.replayRate === 'number'
    ? dailyStreakStats.metrics.replayRate - runnerUpStats.metrics.replayRate
    : null
const dailyStreakFramingActive =
  rewardExperiment?.action === 'promote-winner' &&
  rewardExperiment.winnerVariant === 'daily-streak' &&
  (rewardExperiment.confidence ?? 0) >= rewardConfidenceFloor
const replayPromptCopy = dailyStreakFramingActive
  ? "Start one more board to keep today's local streak alive."
  : 'Try one cleaner run with the same rules.'
const replayPromptCta = dailyStreakFramingActive ? 'Play streak run' : 'Play again'

const titleById = new Map([
  ...(growth.gamePages ?? []).map((game) => [game.gameId, game.title]),
  ...(portfolio.games ?? []).map((game) => [game.gameId, game.title]),
])
const replayCandidate =
  (productOptimization.candidates ?? []).find(
    (candidate) => playableIds.has(candidate.gameId) && (candidate.gaps?.replay ?? 0) > 0,
  ) ??
  (portfolio.rotation?.improvementGameIds ?? [])
    .map((gameId) => ({ gameId, starts: 0, metrics: {}, gaps: { replay: replayGap } }))
    .find((candidate) => playableIds.has(candidate.gameId)) ??
  (playableIds.has(portfolio.dailyChallenge?.gameId)
    ? { gameId: portfolio.dailyChallenge.gameId, starts: 0, metrics: {}, gaps: { replay: replayGap } }
    : null)

const targetGameId = replayCandidate?.gameId ?? null
const targetTitle = targetGameId ? titleById.get(targetGameId) ?? targetGameId : null
const targetPlayable = targetGameId ? playableIds.has(targetGameId) : false
const promptStatus = canNudgeReplay && targetPlayable && replayGap > 0 ? 'armed' : 'monitor'

const missions = [
  {
    id: 'finish-run',
    label: targetTitle ? `Finish a ${targetTitle} run` : 'Finish a run',
    event: 'level_completed',
    gameId: targetGameId,
    reward: 'result-context',
    status: targetPlayable ? 'armed' : 'blocked-missing-game',
  },
  {
    id: 'show-replay-prompt',
    label: 'Show one replay prompt after a completed run',
    event: 'replay_prompt_viewed',
    gameId: targetGameId,
    reward: 'fresh-run-suggestion',
    status: promptStatus,
  },
  {
    id: 'confirm-replay',
    label: 'Start a fresh run from the completed-run prompt',
    event: 'replay_prompt_clicked',
    gameId: targetGameId,
    reward: 'fresh-run',
    status: promptStatus,
  },
  {
    id: 'respect-replay-dismissal',
    label: 'Let players leave after one completed run',
    event: 'replay_prompt_dismissed',
    gameId: targetGameId,
    reward: 'no-pressure-exit',
    status: 'armed',
  },
]

const payload = {
  generatedAt: new Date().toISOString(),
  sourceDataHash,
  status: targetPlayable ? 'replay-loop-ready' : 'blocked-missing-replay-game',
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    releaseHealth: releaseHealth.status,
    productOptimization: productOptimization.status,
  },
  target: {
    gameId: targetGameId,
    title: targetTitle,
    starts: replayCandidate?.starts ?? 0,
    candidateReplayRate: roundMetric(replayCandidate?.metrics?.replayRate),
    candidateReplayGap: roundMetric(replayCandidate?.gaps?.replay),
  },
  metrics: {
    replayRate: roundMetric(replayRate),
    replayGate: roundMetric(replayGate),
    replayGap: roundMetric(replayGap),
    firstGameCompletion: roundMetric(metrics.firstGameCompletion),
    d1Retention: roundMetric(metrics.d1Retention),
    levelCompletions: counts.level_completed ?? 0,
    replayClicks: counts.replay_clicked ?? 0,
    promptViews: counts.replay_prompt_viewed ?? 0,
    promptClicks: counts.replay_prompt_clicked ?? 0,
    promptDismissals: counts.replay_prompt_dismissed ?? 0,
  },
  promptPolicy: {
    id: 'completed-run-replay-prompt',
    status: promptStatus,
    surface: 'autonomy-cockpit-replay-card',
    trigger: 'after-completed-run',
    ctaLabel: replayPromptCta,
    dismissLabel: 'Done for now',
    copy: replayPromptCopy,
    cooldown: 'one prompt per completed run',
    reason:
      promptStatus === 'armed'
        ? `Replay rate is ${pct(replayRate)} and the gate is ${pct(replayGate)}; ask for one fresh run after completion.`
        : 'Replay gate is stable, release health is holding nudges, or no playable replay target exists.',
    telemetry: {
      viewed: 'replay_prompt_viewed',
      clicked: 'replay_prompt_clicked',
      dismissed: 'replay_prompt_dismissed',
      replay: 'replay_clicked',
    },
  },
  rewardFraming: {
    status: dailyStreakFramingActive ? 'active' : 'monitor',
    sourceExperiment: 'reward_offer',
    recommendedVariant: rewardExperiment?.winnerVariant ?? 'daily-streak',
    runnerUpVariant: rewardExperiment?.runnerUpVariant ?? null,
    confidence: rewardExperiment?.confidence ?? null,
    confidenceFloor: rewardConfidenceFloor,
    currentDailyStreakWeight: dailyStreakVariant?.weight ?? null,
    primaryMetric: rewardExperimentDetail?.primaryMetric ?? 'replayRate',
    winnerReplayRate: roundMetric(dailyStreakStats?.metrics?.replayRate),
    runnerUpReplayRate: roundMetric(runnerUpStats?.metrics?.replayRate),
    replayRateLift: roundMetric(dailyStreakLift),
    reason:
      rewardExperiment?.reason ??
      'Daily streak is the default low-pressure replay framing when reward experiments are unavailable.',
    controls: {
      localOnly: true,
      noPaidRewards: true,
      noAds: true,
      noCurrency: true,
      noAccountRequired: true,
      noRevenueEnablement: true,
    },
  },
  localState: {
    dismissedRunKey: 'agl.replay.dismissedRunKey',
    acceptedRunKey: 'agl.replay.acceptedRunKey',
  },
  controls: {
    zeroPaidSpend: true,
    afterCompletedRunOnly: true,
    onePromptPerCompletedRun: true,
    noForcedReplay: true,
    noAutoRestart: true,
    noPaidRewards: true,
    noRevenueEnablement: true,
    noDarkPatterns: true,
    requireCompletedRunTelemetry: true,
    canNudgeReplay,
    completionReady,
    retentionReady,
    replayReady,
    monetizationStillBlocked: !(completionReady && retentionReady && replayReady),
  },
  missions,
  nextActions: [
    replayReady
      ? 'Replay gate is clear; keep the completed-run replay prompt in monitor mode.'
      : `Improve replay rate from ${pct(replayRate)} toward ${pct(replayGate)} with a measured completed-run prompt.`,
    'Compare replay_prompt_viewed, replay_prompt_clicked, replay_prompt_dismissed, and replay_clicked before changing copy.',
    'Keep replay prompts optional, local, and zero-spend until product gates pass.',
  ],
}

const report = [
  '# Replay Loop',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Target: ${payload.target.title ?? 'missing'} (${payload.target.gameId ?? 'missing'})`,
  `Replay rate: ${pct(payload.metrics.replayRate)} / ${pct(payload.metrics.replayGate)}`,
  '',
  '## Prompt Policy',
  '',
  `- Status: ${payload.promptPolicy.status}`,
  `- Surface: ${payload.promptPolicy.surface}`,
  `- Trigger: ${payload.promptPolicy.trigger}`,
  `- Copy: ${payload.promptPolicy.copy}`,
  `- Telemetry: ${payload.promptPolicy.telemetry.viewed}, ${payload.promptPolicy.telemetry.clicked}, ${payload.promptPolicy.telemetry.dismissed}, ${payload.promptPolicy.telemetry.replay}`,
  '',
  '## Reward Framing',
  '',
  `- Status: ${payload.rewardFraming.status}`,
  `- Variant: ${payload.rewardFraming.recommendedVariant}`,
  `- Replay-rate lift: ${pct(payload.rewardFraming.replayRateLift)}`,
  '',
  '## Missions',
  '',
  ...payload.missions.map((mission) => `- ${mission.status}: ${mission.id} - ${mission.label}`),
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
  `export const replayLoop = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ReplayLoop = typeof replayLoop\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
