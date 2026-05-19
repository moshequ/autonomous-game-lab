import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'retention-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'retentionLoop.ts')
const reportPath = path.join(root, 'reports', 'retention-loop-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const portfolio = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const experimentPolicy = await readJson(path.join(dataDir, 'experiment-policy.json'))
const experimentResults = await readJson(path.join(dataDir, 'experiment-results.json'))
const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
const playable = await readJson(path.join(dataDir, 'playable-games.json'))

const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')
const localIsoDate = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
const today = localIsoDate()
const addDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
const dailyChallenge = portfolio.dailyChallenge
const challengeDate = dailyChallenge?.date ?? today
const nextChallengeDate = addDays(challengeDate, 1)
const playableIds = new Set(playable.games ?? [])
const rewardExperiment = experimentResults.recommendations?.find(
  (recommendation) => recommendation.experiment === 'reward_offer',
)
const rewardPolicy = experimentPolicy.experiments?.reward_offer
const dailyStreakVariant = rewardPolicy?.variants?.find((variant) => variant.id === 'daily-streak')
const metrics = analytics.totals?.metrics ?? {}
const retentionReady = (metrics.d1Retention ?? 0) >= 0.18
const completionReady = (metrics.firstGameCompletion ?? 0) >= 0.55
const replayReady = (metrics.replayRate ?? 0) >= 0.35
const canNudgeRetention = releaseHealth.controls?.canApplyExperimentChanges !== false
const dailyChallengePlayable = playableIds.has(dailyChallenge?.gameId)
const retentionGap = Math.max(0, 0.18 - (metrics.d1Retention ?? 0))
const returnPromptNeeded = canNudgeRetention && dailyChallengePlayable && retentionGap > 0

const missions = [
  {
    id: 'finish-daily-challenge',
    label: `Finish ${dailyChallenge?.title ?? "today's puzzle"}`,
    event: 'daily_challenge_completed',
    gameId: dailyChallenge?.gameId ?? null,
    reward: 'streak-credit',
    status: dailyChallengePlayable ? 'armed' : 'blocked-missing-game',
  },
  {
    id: 'return-tomorrow',
    label: 'Return tomorrow for a fresh board',
    event: 'daily_return_prompt_viewed',
    gameId: dailyChallenge?.gameId ?? null,
    reward: 'next-daily-seed',
    status: 'armed',
  },
  {
    id: 'confirm-return-intent',
    label: `Queue ${nextChallengeDate} board intent`,
    event: 'daily_return_prompt_clicked',
    gameId: dailyChallenge?.gameId ?? null,
    reward: 'local-return-intent',
    status: returnPromptNeeded ? 'armed' : 'monitor',
  },
  {
    id: 'activate-return-intent',
    label: 'Start a queued return board',
    event: 'daily_return_intent_started',
    gameId: dailyChallenge?.gameId ?? null,
    reward: 'retained-session',
    status: returnPromptNeeded ? 'armed' : 'monitor',
  },
  {
    id: 'share-daily-seed',
    label: 'Share the daily seed after a run',
    event: 'share_clicked',
    gameId: dailyChallenge?.gameId ?? null,
    reward: 'organic-signal',
    status: 'armed',
  },
]

const payload = {
  generatedAt: new Date().toISOString(),
  status: dailyChallengePlayable ? 'retention-loop-ready' : 'blocked-missing-daily-game',
  dailyChallenge: {
    ...dailyChallenge,
    date: challengeDate,
  },
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    retentionSource: analytics.retention?.source ?? 'unknown',
    releaseHealth: releaseHealth.status,
  },
  metrics: {
    d1Retention: roundMetric(metrics.d1Retention),
    replayRate: roundMetric(metrics.replayRate),
    firstGameCompletion: roundMetric(metrics.firstGameCompletion),
    eligibleUsers: analytics.retention?.eligibleUsers ?? 0,
    retainedUsers: analytics.retention?.retainedUsers ?? 0,
  },
  guardrails: {
    noPushNotifications: true,
    noAccountsRequired: true,
    noDarkPatterns: true,
    noPaidRetentionMechanics: true,
    noRewardedAdsUntilMonetizationGatesPass: true,
    noNotificationPermissionRequest: true,
  },
  localState: {
    storageKey: 'agl.retention.dailyStreak',
    dateKey: 'agl.retention.lastCompletedDate',
    bestKey: 'agl.retention.bestDailyStreak',
    returnIntentKey: 'agl.retention.returnIntentDate',
    returnPromptDismissedKey: 'agl.retention.returnPromptDismissedDate',
    returnIntentStartedKey: 'agl.retention.returnIntentStartedDate',
    returnIntentClearedKey: 'agl.retention.returnIntentClearedDate',
  },
  rewardPolicy: {
    recommendedVariant: rewardExperiment?.winnerVariant ?? 'daily-streak',
    currentDailyStreakWeight: dailyStreakVariant?.weight ?? null,
    action: rewardExperiment?.action ?? 'monitor',
    reason: rewardExperiment?.reason ?? 'Daily streak is the default retention-safe reward framing.',
  },
  promptPolicy: {
    status: returnPromptNeeded ? 'armed' : 'monitor',
    surface: 'autonomy-cockpit-retention-card',
    trigger: 'after-completed-run',
    ctaLabel: 'Queue tomorrow',
    dismissLabel: 'Not today',
    nextChallengeDate,
    cooldown: 'one prompt per daily challenge date',
    reason: returnPromptNeeded
      ? `D1 retention is ${pct(metrics.d1Retention)} and the gate is 18%; ask for a local return intent after a completed run.`
      : 'D1 retention gate is stable or release health blocks retention nudges; keep prompt instrumentation in monitor mode.',
    telemetry: {
      viewed: 'daily_return_prompt_viewed',
      clicked: 'daily_return_prompt_clicked',
      dismissed: 'daily_return_prompt_dismissed',
    },
  },
  returnIntentPolicy: {
    status: returnPromptNeeded ? 'armed' : 'monitor',
    surface: 'autonomy-cockpit-return-intent-card',
    trigger: 'app-load-with-local-return-intent',
    ctaLabel: 'Play queued board',
    dismissLabel: 'Clear intent',
    cooldown: 'one activation per queued intent date',
    reason: returnPromptNeeded
      ? `D1 retention is ${pct(metrics.d1Retention)} and the gate is 18%; convert queued local return intent into a measured game start.`
      : 'D1 retention gate is stable or release health blocks retention nudges; keep queued-return activation in monitor mode.',
    telemetry: {
      viewed: 'daily_return_intent_viewed',
      started: 'daily_return_intent_started',
      cleared: 'daily_return_intent_cleared',
    },
  },
  measurementPolicy: {
    source: 'player-exported-events',
    retainedEvent: 'daily_return_intent_started',
    cohortDateProperty: 'retentionCohortDate',
    returnDateProperty: 'retentionReturnDate',
    evidenceProperty: 'retentionEvidence',
    evidenceValue: 'queued-return-intent',
    d1Only: true,
    requiresAnonymousId: true,
    noSyntheticEvents: true,
    reason:
      'Queued return-intent activations carry explicit cohort and return dates so local event exports can prove D1 retention without accounts or push notifications.',
  },
  controls: {
    canNudgeRetention,
    retentionReady,
    completionReady,
    replayReady,
    monetizationStillBlocked: !(retentionReady && completionReady && replayReady),
    returnIntentPlayerInitiatedOnly: true,
    noBackgroundWakeups: true,
  },
  missions,
  nextActions: [
    retentionReady
      ? 'Keep daily streak telemetry live and watch completion before monetization.'
      : `Improve D1 retention from ${pct(metrics.d1Retention)} toward 18% with local streak prompts.`,
    replayReady
      ? 'Replay rate is at the current reward gate; keep daily-streak framing active.'
      : `Improve replay rate from ${pct(metrics.replayRate)} toward 35% with the daily return mission.`,
    'Do not use push notifications, accounts, paid rewards, or ads for retention until gates pass.',
  ],
}

const report = [
  '# Retention Loop',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Daily challenge: ${payload.dailyChallenge.title ?? 'missing'} (${payload.dailyChallenge.gameId ?? 'missing'})`,
  `D1 retention: ${pct(payload.metrics.d1Retention)}`,
  `Replay rate: ${pct(payload.metrics.replayRate)}`,
  '',
  '## Missions',
  '',
  ...payload.missions.map((mission) => `- ${mission.status}: ${mission.id} - ${mission.label}`),
  '',
  '## Reward Policy',
  '',
  `- Recommended variant: ${payload.rewardPolicy.recommendedVariant}`,
  `- Daily streak weight: ${payload.rewardPolicy.currentDailyStreakWeight ?? 'n/a'}`,
  `- Reason: ${payload.rewardPolicy.reason}`,
  '',
  '## Return Prompt',
  '',
  `- Status: ${payload.promptPolicy.status}`,
  `- Surface: ${payload.promptPolicy.surface}`,
  `- Next challenge date: ${payload.promptPolicy.nextChallengeDate}`,
  `- Telemetry: ${payload.promptPolicy.telemetry.viewed}, ${payload.promptPolicy.telemetry.clicked}, ${payload.promptPolicy.telemetry.dismissed}`,
  '',
  '## Return Intent Activation',
  '',
  `- Status: ${payload.returnIntentPolicy.status}`,
  `- Surface: ${payload.returnIntentPolicy.surface}`,
  `- Telemetry: ${payload.returnIntentPolicy.telemetry.viewed}, ${payload.returnIntentPolicy.telemetry.started}, ${payload.returnIntentPolicy.telemetry.cleared}`,
  `- Measurement: ${payload.measurementPolicy.retainedEvent} with ${payload.measurementPolicy.cohortDateProperty} -> ${payload.measurementPolicy.returnDateProperty}`,
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.guardrails).map(([key, value]) => `- ${key}: ${value}`),
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
  `export const retentionLoop = ${JSON.stringify(payload, null, 2)} as const\n\nexport type RetentionLoop = typeof retentionLoop\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
