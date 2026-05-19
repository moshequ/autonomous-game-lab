import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const gatesPath = path.join(root, 'data', 'production-gates.json')
const monetizationPath = path.join(root, 'data', 'monetization-plan.json')
const promotionPath = path.join(root, 'data', 'promotion-decision.json')
const releaseHealthPath = path.join(root, 'data', 'release-health.json')
const storePackagePath = path.join(root, 'data', 'store-package.json')
const outputJsonPath = path.join(root, 'data', 'unit-economics.json')
const outputTsPath = path.join(root, 'src', 'data', 'unitEconomics.ts')
const reportPath = path.join(root, 'reports', 'unit-economics-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const round = (value, digits = 2) => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

const dollars = (cents) => round(cents / 100, 2)

const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')

const paybackDays = (costCents, dailyRevenueCents) =>
  dailyRevenueCents > 0 ? Math.ceil(costCents / dailyRevenueCents) : null

const decisionFor = (promotion, channel) =>
  promotion.decisions?.find((decision) => decision.channel === channel) ?? null

const analytics = await readJson(analyticsPath)
const gates = await readJson(gatesPath)
const monetization = await readJson(monetizationPath)
const promotion = await readJson(promotionPath)
const releaseHealth = await readJson(releaseHealthPath)
const storePackage = await readJson(storePackagePath)

const activeSource = analytics.sourceStatus?.activeSource ?? 'unknown'
const liveAnalyticsSource = activeSource === 'posthog' || activeSource === 'local-event-drops'
const lookbackDays =
  activeSource === 'posthog'
    ? Number(process.env.POSTHOG_LOOKBACK_DAYS ?? 7)
    : activeSource === 'local-event-drops'
      ? Math.max(1, analytics.retention?.cohorts?.length ?? 1)
      : null
const projectionConfidence = liveAnalyticsSource && lookbackDays ? 'medium' : 'low-fixture-or-zero'
const counts = analytics.totals?.counts ?? {}
const metrics = analytics.totals?.metrics ?? {}
const revenueCents = Number(metrics.revenueCents ?? counts.revenue_cents ?? monetization.metrics?.revenueCents ?? 0)
const gameViews = Number(counts.game_viewed ?? 0)
const gameStarts = Number(counts.game_started ?? 0)
const revenuePerStartedGameCents = gameStarts ? round(revenueCents / gameStarts, 4) : 0
const revenuePerViewCents = gameViews ? round(revenueCents / gameViews, 4) : 0
const estimatedDailyRevenueCents =
  liveAnalyticsSource && lookbackDays && revenueCents > 0 ? round(revenueCents / lookbackDays, 2) : 0
const projectedMonthlyRevenueCents = round(estimatedDailyRevenueCents * 30, 2)
const projectedAnnualRevenueCents = round(estimatedDailyRevenueCents * 365, 2)

const googleCostCents = Math.round(Number(gates.googlePlay?.oneTimeCostUsd ?? 25) * 100)
const appleCostCents = Math.round(Number(gates.iosAppStore?.annualCostUsd ?? 99) * 100)
const googlePaybackDays = paybackDays(googleCostCents, estimatedDailyRevenueCents)
const applePaybackDays = paybackDays(appleCostCents, estimatedDailyRevenueCents)

const monetizationDecision = decisionFor(promotion, 'monetization')
const webDecision = decisionFor(promotion, 'web-pwa')
const androidDecision = decisionFor(promotion, 'android-google-play')
const iosDecision = decisionFor(promotion, 'ios-app-store')
const metricsPass =
  (metrics.firstGameCompletion ?? 0) >= gates.monetization.minFirstGameCompletion &&
  (metrics.replayRate ?? 0) >= gates.monetization.minReplayRate &&
  (metrics.d1Retention ?? 0) >= gates.monetization.minD1Retention
const revenueSignalPresent = revenueCents > 0 && liveAnalyticsSource
const retentionReady = metricsPass && releaseHealth.controls?.monetizationAllowed === true
const adNetworkConfigured = Boolean(monetization.adNetwork?.publisherId)
const hostedPrivacyReady = storePackage.privacyPolicy?.productionUrlStatus === 'hosted'
const monetizationSpendAllowed =
  monetization.revenueEnabled === true && retentionReady && adNetworkConfigured && revenueSignalPresent
const paidAcquisitionAllowed =
  monetizationSpendAllowed && projectedMonthlyRevenueCents > 0 && revenuePerStartedGameCents > 0
const maxDailySpendUsd = paidAcquisitionAllowed
  ? round(Math.min(5, dollars(projectedMonthlyRevenueCents) * 0.1), 2)
  : 0
const googleStoreSpendAllowed =
  webDecision?.status === 'promotable-internal' &&
  androidDecision?.status === 'promotable' &&
  hostedPrivacyReady &&
  revenueSignalPresent &&
  googlePaybackDays !== null &&
  googlePaybackDays <= 60
const appleStoreSpendAllowed =
  iosDecision?.status === 'promotable' &&
  hostedPrivacyReady &&
  projectedAnnualRevenueCents >= appleCostCents &&
  applePaybackDays !== null &&
  applePaybackDays <= 90
const storeSpendAllowed = googleStoreSpendAllowed || appleStoreSpendAllowed

const status = paidAcquisitionAllowed
  ? 'reinvest-capped'
  : monetizationSpendAllowed
    ? 'revenue-test-only'
    : 'no-spend'

const recommendations = [
  {
    id: 'stay-web-organic',
    action: 'Keep traffic on the free web/PWA loop and generated organic pages.',
    reason: liveAnalyticsSource
      ? 'Live data has not proven a positive payback window yet.'
      : 'Current analytics are fixture or local-only, so spend decisions would be speculation.',
  },
  {
    id: 'hold-paid-acquisition',
    action: paidAcquisitionAllowed
      ? `Allow capped reinvestment up to $${maxDailySpendUsd.toFixed(2)} per day.`
      : 'Do not run paid acquisition.',
    reason: paidAcquisitionAllowed
      ? 'Revenue, retention, and projection gates are open.'
      : 'Paid acquisition needs live revenue plus passing retention gates.',
  },
  {
    id: 'hold-store-fees',
    action: storeSpendAllowed
      ? 'Permit the store channel whose payback and compliance gates are open.'
      : 'Do not pay app-store account fees yet.',
    reason: storeSpendAllowed
      ? 'At least one store channel has compliance, promotion, and payback clearance.'
      : 'Store fees remain blocked until hosted compliance URLs, credentials, revenue, and payback gates clear.',
  },
]

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  analyticsSource: activeSource,
  projectionConfidence,
  costPosture:
    status === 'no-spend'
      ? 'zero-paid-spend-until-live-revenue-and-retention-pass'
      : 'capped-reinvestment-only-from-observed-revenue',
  observed: {
    gameViews,
    gameStarts,
    revenueCents,
    revenueUsd: dollars(revenueCents),
    revenuePerStartedGameCents,
    revenuePerViewCents,
  },
  projections: {
    basis: liveAnalyticsSource
      ? `live ${activeSource}${lookbackDays ? ` over ${lookbackDays} day(s)` : ''}`
      : 'fixture/local-free fallback; not valid for paid spend',
    lookbackDays,
    estimatedDailyRevenueCents,
    projectedMonthlyRevenueCents,
    projectedAnnualRevenueCents,
  },
  productGates: {
    firstGameCompletion: {
      actual: metrics.firstGameCompletion ?? null,
      required: gates.monetization.minFirstGameCompletion,
      pass: (metrics.firstGameCompletion ?? 0) >= gates.monetization.minFirstGameCompletion,
    },
    replayRate: {
      actual: metrics.replayRate ?? null,
      required: gates.monetization.minReplayRate,
      pass: (metrics.replayRate ?? 0) >= gates.monetization.minReplayRate,
    },
    d1Retention: {
      actual: metrics.d1Retention ?? null,
      required: gates.monetization.minD1Retention,
      pass: (metrics.d1Retention ?? 0) >= gates.monetization.minD1Retention,
    },
    retentionReady,
    revenueSignalPresent,
  },
  storeFees: {
    googlePlay: {
      costUsd: dollars(googleCostCents),
      type: 'one-time-developer-account',
      allowed: googleStoreSpendAllowed,
      paybackDays: googlePaybackDays,
      blockers: [
        ...(androidDecision?.blockers ?? []),
        ...(hostedPrivacyReady ? [] : ['Hosted privacy policy URL is missing.']),
        ...(revenueSignalPresent ? [] : ['No live revenue signal yet.']),
        ...(googlePaybackDays === null || googlePaybackDays > 60
          ? ['Projected Google Play fee payback is not within 60 days.']
          : []),
      ].filter((blocker, index, blockers) => blockers.indexOf(blocker) === index),
    },
    iosAppStore: {
      costUsd: dollars(appleCostCents),
      type: 'annual-developer-account',
      allowed: appleStoreSpendAllowed,
      paybackDays: applePaybackDays,
      blockers: [
        ...(iosDecision?.blockers ?? []),
        ...(hostedPrivacyReady ? [] : ['Hosted privacy policy URL is missing.']),
        ...(projectedAnnualRevenueCents >= appleCostCents
          ? []
          : [`Projected annual revenue is $${dollars(projectedAnnualRevenueCents).toFixed(2)}, below $${dollars(appleCostCents).toFixed(2)}.`]),
        ...(applePaybackDays === null || applePaybackDays > 90
          ? ['Projected Apple fee payback is not within 90 days.']
          : []),
      ].filter((blocker, index, blockers) => blockers.indexOf(blocker) === index),
    },
  },
  controls: {
    spendGuardActive: true,
    spendMode: status,
    maxDailySpendUsd,
    paidAcquisitionAllowed,
    storeSpendAllowed,
    monetizationSpendAllowed,
    requiresHumanApprovalForSpendAboveUsd: maxDailySpendUsd,
    noPaidAcquisitionBeforeRevenue: true,
    noStoreFeesBeforePayback: true,
    noInterstitialsBeforeRetention: monetization.safety?.noInterstitialsInFirstSession === true,
  },
  promotion: {
    web: webDecision?.status ?? 'missing',
    monetization: monetizationDecision?.status ?? 'missing',
    androidGooglePlay: androidDecision?.status ?? 'missing',
    iosAppStore: iosDecision?.status ?? 'missing',
  },
  recommendations,
}

const report = [
  '# Unit Economics Guard',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.analyticsSource}`,
  `Cost posture: ${payload.costPosture}`,
  '',
  '## Observed',
  '',
  `- Game starts: ${payload.observed.gameStarts}`,
  `- Revenue: $${payload.observed.revenueUsd.toFixed(2)}`,
  `- Revenue per started game: ${payload.observed.revenuePerStartedGameCents.toFixed(4)} cents`,
  `- First-game completion: ${pct(payload.productGates.firstGameCompletion.actual)}`,
  `- Replay rate: ${pct(payload.productGates.replayRate.actual)}`,
  `- D1 retention: ${pct(payload.productGates.d1Retention.actual)}`,
  '',
  '## Controls',
  '',
  `- Spend mode: ${payload.controls.spendMode}`,
  `- Max daily spend: $${payload.controls.maxDailySpendUsd.toFixed(2)}`,
  `- Paid acquisition allowed: ${payload.controls.paidAcquisitionAllowed}`,
  `- Store spend allowed: ${payload.controls.storeSpendAllowed}`,
  `- Monetization spend allowed: ${payload.controls.monetizationSpendAllowed}`,
  '',
  '## Store Payback',
  '',
  `- Google Play: $${payload.storeFees.googlePlay.costUsd.toFixed(2)}, payback ${
    payload.storeFees.googlePlay.paybackDays ?? 'not enough revenue'
  }, allowed ${payload.storeFees.googlePlay.allowed}`,
  `- iOS App Store: $${payload.storeFees.iosAppStore.costUsd.toFixed(2)}/yr, payback ${
    payload.storeFees.iosAppStore.paybackDays ?? 'not enough revenue'
  }, allowed ${payload.storeFees.iosAppStore.allowed}`,
  '',
  '## Recommendations',
  '',
  ...payload.recommendations.map((item) => `- ${item.id}: ${item.action} ${item.reason}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const unitEconomics = ${JSON.stringify(payload, null, 2)} as const\n\nexport type UnitEconomics = typeof unitEconomics\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
