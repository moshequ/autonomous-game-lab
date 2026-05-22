import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { localIsoDate } from './lib/product-date.mjs'
import { hashRawSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'retention-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'retentionLoop.ts')
const reportPath = path.join(root, 'reports', 'retention-loop-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const portfolio = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const experimentPolicy = await readJson(path.join(dataDir, 'experiment-policy.json'))
const experimentResults = await readJson(path.join(dataDir, 'experiment-results.json'))
const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const productGateRecovery = await readOptionalJson(path.join(dataDir, 'product-gate-recovery.json'), {
  status: 'missing',
  summary: {},
  gates: [],
})
const localEventBridge = await readOptionalJson(path.join(dataDir, 'local-event-bridge.json'), {
  status: 'missing',
  gateSampleEvidence: {},
})

const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')
const today = localIsoDate()
const todaySlug = () => localIsoDate().replaceAll('-', '')
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
const rewardExperimentDetail = experimentResults.experiments?.find((experiment) => experiment.id === 'reward_offer')
const dailyStreakStats = rewardExperimentDetail?.variants?.find((variant) => variant.variantId === 'daily-streak')
const runnerUpStats = rewardExperimentDetail?.variants?.find(
  (variant) => variant.variantId === rewardExperiment?.runnerUpVariant,
)
const dailyStreakLift =
  typeof dailyStreakStats?.metrics?.replayRate === 'number' &&
  typeof runnerUpStats?.metrics?.replayRate === 'number'
    ? dailyStreakStats.metrics.replayRate - runnerUpStats.metrics.replayRate
    : null
const metrics = analytics.totals?.metrics ?? {}
const retentionReady = (metrics.d1Retention ?? 0) >= 0.18
const completionReady = (metrics.firstGameCompletion ?? 0) >= 0.55
const replayReady = (metrics.replayRate ?? 0) >= 0.35
const canNudgeRetention = releaseHealth.controls?.canApplyExperimentChanges !== false
const dailyChallengePlayable = playableIds.has(dailyChallenge?.gameId)
const retentionGap = Math.max(0, 0.18 - (metrics.d1Retention ?? 0))
const returnPromptNeeded = canNudgeRetention && dailyChallengePlayable && retentionGap > 0
const d1Gate = productGateRecovery.gates?.find((gate) => gate.id === 'd1Retention') ?? null
const d1CampaignId = d1Gate ? `gate-sample-${todaySlug()}-${d1Gate.id}` : null
const d1SamplePlayPath =
  d1Gate && dailyChallenge?.gameId
    ? `/?game=${encodeURIComponent(dailyChallenge.gameId)}&utm_source=gate_sample&utm_campaign=${encodeURIComponent(
        d1CampaignId,
      )}`
    : null
const downloadsScanPolicy = localEventBridge.explicitDownloadsScanPolicy ?? {
  explicitOptInRequired: true,
  cooldownHours: 4,
  coolingDown: false,
  evidenceReadyNow: false,
  lastScanAt: localEventBridge.explicitDownloadsScan?.scannedAt ?? null,
  lastScanStatus: localEventBridge.explicitDownloadsScan?.status ?? null,
  scanAgeHours: null,
  cooldownRemainingHours: 0,
  nextRecommendedScanAt: new Date().toISOString(),
}
const gateSampleCampaigns = [
  ...(localEventBridge.gateSampleEvidence?.imported?.campaigns ?? []).map((campaign) => ({
    ...campaign,
    source: 'imported',
  })),
  ...(localEventBridge.gateSampleEvidence?.inbox?.campaigns ?? []).map((campaign) => ({
    ...campaign,
    source: 'inbox',
  })),
]
const d1SampleEvidence = gateSampleCampaigns.find((campaign) => campaign.campaignId === d1CampaignId)
const d1SampleEvidenceStatus = d1SampleEvidence
  ? d1SampleEvidence.source === 'imported'
    ? 'imported-sample-active'
    : 'inbox-ready-for-ingest'
  : 'waiting-for-player-export'
const d1SampleStatus = d1Gate?.pass
  ? 'gate-passing'
  : d1Gate?.sampleReady
    ? 'ready-for-recovery-decision'
    : 'collecting-sample'
const retentionSourceEvidence = {
  today,
  dailyChallenge,
  analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
  retention: analytics.retention,
  metrics,
  experiment: {
    recommendation: rewardExperiment,
    rewardPolicy,
    rewardExperimentDetail,
  },
  releaseHealth: {
    status: releaseHealth.status,
    canApplyExperimentChanges: releaseHealth.controls?.canApplyExperimentChanges,
  },
  playableGames: [...playableIds],
  productGateRecovery: {
    status: productGateRecovery.status,
    summary: productGateRecovery.summary,
    d1Gate,
  },
  localEventBridge: {
    status: localEventBridge.status,
    explicitDownloadsScanPolicy: downloadsScanPolicy,
    gateSampleEvidence: localEventBridge.gateSampleEvidence,
  },
}
const sourceDataHash = hashRawSourceData(retentionSourceEvidence)
const sampleNextAction = !d1Gate
  ? 'Refresh product gate recovery before collecting a D1 retention sample.'
  : d1Gate.pass
    ? 'D1 retention gate is passing; keep measuring queued-return starts without adding retention pressure.'
    : d1SampleEvidenceStatus === 'imported-sample-active'
      ? 'Run product gate recovery on the imported D1 sample before changing copy, placement, revenue, or rules.'
      : d1SampleEvidenceStatus === 'inbox-ready-for-ingest'
        ? 'Import the waiting D1 gate-sample event drop with npm run autonomous:collect-sample-downloads.'
        : downloadsScanPolicy.coolingDown
          ? `Wait until ${downloadsScanPolicy.nextRecommendedScanAt} before another explicit Downloads scan, unless an inbox event drop appears.`
          : `Feature the daily challenge via ${d1SamplePlayPath ?? 'the D1 gate sample link'} and collect ${
              d1Gate.promptViewsNeeded ?? 0
            } prompt exposure(s) plus ${d1Gate.neededSuccesses ?? 0} retained start(s).`

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
  sourceDataHash,
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
    runnerUpVariant: rewardExperiment?.runnerUpVariant ?? null,
    confidence: rewardExperiment?.confidence ?? null,
    currentDailyStreakWeight: dailyStreakVariant?.weight ?? null,
    primaryMetric: rewardExperimentDetail?.primaryMetric ?? 'replayRate',
    winnerReplayRate: roundMetric(dailyStreakStats?.metrics?.replayRate),
    runnerUpReplayRate: roundMetric(runnerUpStats?.metrics?.replayRate),
    replayRateLift: roundMetric(dailyStreakLift),
    action: rewardExperiment?.action ?? 'monitor',
    reason: rewardExperiment?.reason ?? 'Daily streak is the default retention-safe reward framing.',
    controls: {
      localOnly: true,
      noPaidRewards: true,
      noAds: true,
      noCurrency: true,
      noAccountRequired: true,
      noRevenueEnablement: true,
    },
  },
  promptPolicy: {
    status: returnPromptNeeded ? 'armed' : 'monitor',
    surface: 'autonomy-cockpit-retention-card',
    trigger: 'after-completed-run',
    ctaLabel: 'Queue tomorrow',
    dismissLabel: 'Not today',
    copy: "Queue tomorrow's board to protect your local daily streak.",
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
    copy: 'Your queued board is ready; start it to keep the local streak signal real.',
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
  samplePolicy: {
    gateId: 'd1Retention',
    label: d1Gate?.label ?? 'D1 retention',
    status: d1SampleStatus,
    sampleRole:
      productGateRecovery.summary?.quickestGateTest === 'd1Retention'
        ? 'fastest-validation'
        : productGateRecovery.summary?.primaryBottleneck === 'd1Retention'
          ? 'primary-bottleneck'
          : 'supporting-sample',
    campaignId: d1CampaignId,
    playPath: d1SamplePlayPath,
    publicSamplePath: '/gate-sample.html',
    current: {
      actual: d1Gate?.actual ?? roundMetric(metrics.d1Retention),
      gate: d1Gate?.gate ?? 0.18,
      denominator: d1Gate?.denominator ?? analytics.retention?.eligibleUsers ?? 0,
      successes: d1Gate?.successes ?? analytics.retention?.retainedUsers ?? 0,
      promptViews: d1Gate?.currentPromptViews ?? 0,
      promptActions: d1Gate?.currentPromptActions ?? 0,
      actionRate: d1Gate?.actionRate ?? null,
    },
    needed: {
      promptViews: d1Gate?.promptViewsNeeded ?? 0,
      successes: d1Gate?.neededSuccesses ?? 0,
      minimumPromptViewsForDecision: d1Gate?.minimumPromptViewsForDecision ?? 10,
    },
    telemetry: {
      view: d1Gate?.viewTelemetry ?? ['daily_return_prompt_viewed', 'daily_return_intent_viewed'],
      action: d1Gate?.actionTelemetry ?? ['daily_return_prompt_clicked', 'daily_return_intent_started'],
      success: d1Gate?.successTelemetry ?? ['daily_return_intent_started'],
      failure: d1Gate?.failureTelemetry ?? ['daily_return_prompt_dismissed', 'daily_return_intent_cleared'],
    },
    evidence: {
      status: d1SampleEvidenceStatus,
      source: d1SampleEvidence?.source ?? null,
      events: d1SampleEvidence?.events ?? 0,
      successEvents: d1SampleEvidence?.successEvents ?? 0,
      analyticsExports: d1SampleEvidence?.analyticsExports ?? 0,
      latestAt: d1SampleEvidence?.latestAt ?? null,
    },
    downloadsScan: downloadsScanPolicy,
    commandPlan: {
      refreshRetention: 'npm run autonomous:retention',
      refreshSamplePlan: 'npm run autonomous:sample-plan',
      collectDownloadsAndRefresh: 'npm run autonomous:collect-sample-downloads',
    },
    controls: {
      zeroPaidSpend: true,
      playerInitiatedOnly: true,
      noSyntheticEvents: true,
      noAutomaticRuleChanges: true,
      noRevenueEnablement: true,
      realEventDropsOnly: true,
      downloadsImportRequiresExplicitOptIn: true,
      downloadsScanBackoffRequired: true,
    },
    nextAction: sampleNextAction,
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
    sampleNextAction,
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
  `- Replay-rate lift: ${pct(payload.rewardPolicy.replayRateLift)}`,
  `- Reason: ${payload.rewardPolicy.reason}`,
  '',
  '## Return Prompt',
  '',
  `- Status: ${payload.promptPolicy.status}`,
  `- Surface: ${payload.promptPolicy.surface}`,
  `- Copy: ${payload.promptPolicy.copy}`,
  `- Next challenge date: ${payload.promptPolicy.nextChallengeDate}`,
  `- Telemetry: ${payload.promptPolicy.telemetry.viewed}, ${payload.promptPolicy.telemetry.clicked}, ${payload.promptPolicy.telemetry.dismissed}`,
  '',
  '## Return Intent Activation',
  '',
  `- Status: ${payload.returnIntentPolicy.status}`,
  `- Surface: ${payload.returnIntentPolicy.surface}`,
  `- Copy: ${payload.returnIntentPolicy.copy}`,
  `- Telemetry: ${payload.returnIntentPolicy.telemetry.viewed}, ${payload.returnIntentPolicy.telemetry.started}, ${payload.returnIntentPolicy.telemetry.cleared}`,
  `- Measurement: ${payload.measurementPolicy.retainedEvent} with ${payload.measurementPolicy.cohortDateProperty} -> ${payload.measurementPolicy.returnDateProperty}`,
  '',
  '## D1 Sample Policy',
  '',
  `- Status: ${payload.samplePolicy.status}`,
  `- Campaign: ${payload.samplePolicy.campaignId ?? 'missing'}`,
  `- Play path: ${payload.samplePolicy.playPath ?? 'missing'}`,
  `- Prompt views needed: ${payload.samplePolicy.needed.promptViews}`,
  `- Observed retained starts needed: ${payload.samplePolicy.needed.successes}`,
  `- Evidence: ${payload.samplePolicy.evidence.status}`,
  `- Downloads scan: ${payload.samplePolicy.downloadsScan.lastScanStatus ?? 'not-scanned'}; cooling down ${payload.samplePolicy.downloadsScan.coolingDown}`,
  `- Next action: ${payload.samplePolicy.nextAction}`,
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
