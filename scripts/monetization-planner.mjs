import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const gatesPath = path.join(root, 'data', 'production-gates.json')
const readinessPath = path.join(root, 'data', 'production-readiness.json')
const promotionPath = path.join(root, 'data', 'promotion-decision.json')
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const growthPath = path.join(root, 'data', 'growth-plan.json')
const storePackagePath = path.join(root, 'data', 'store-package.json')
const environmentPath = path.join(root, 'data', 'production-environment.json')
const outputJsonPath = path.join(root, 'data', 'monetization-plan.json')
const outputTsPath = path.join(root, 'src', 'data', 'monetizationPlan.ts')
const reportPath = path.join(root, 'reports', 'monetization-plan-latest.md')
const appAdsPath = path.join(root, 'public', 'app-ads.txt')
const publicManifestPath = path.join(root, 'public', 'monetization.json')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const gates = await readJson(gatesPath)
const readiness = await readJson(readinessPath)
const promotion = await readJson(promotionPath)
const analytics = await readJson(analyticsPath)
const growth = await readJson(growthPath)
const storePackage = await readJson(storePackagePath)
const environment = await readOptionalJson(environmentPath, {
  monetization: { adNetworkProvider: 'google-admob', admobPublisherId: null },
})

const monetizationDecision = promotion.decisions?.find((decision) => decision.channel === 'monetization')
const metrics = readiness.monetization?.metrics ?? {}
const gatesPassed = readiness.monetization?.status === 'ready-for-low-risk-test'
const promotionAllowed = monetizationDecision?.status === 'promotable'
const adsenseClientId =
  process.env.VITE_ADSENSE_CLIENT_ID ??
  process.env.ADSENSE_CLIENT_ID ??
  environment.monetization?.adsenseClientId ??
  null
const adsenseRewardedSlotId =
  process.env.VITE_ADSENSE_REWARDED_SLOT_ID ??
  process.env.ADSENSE_REWARDED_SLOT_ID ??
  environment.monetization?.adsenseRewardedSlotId ??
  null
const admobPublisherId = process.env.ADMOB_PUBLISHER_ID ?? environment.monetization?.admobPublisherId ?? null
const webAdConfigured = Boolean(adsenseClientId && adsenseRewardedSlotId)
const appAdConfigured = Boolean(admobPublisherId)
const sellerId =
  process.env.AD_SELLER_ID ??
  admobPublisherId ??
  (adsenseClientId ? adsenseClientId.replace(/^ca-/, '') : null)
const adNetwork = {
  provider:
    process.env.AD_NETWORK_PROVIDER ??
    environment.monetization?.adNetworkProvider ??
    (webAdConfigured ? 'google-adsense' : 'google-admob'),
  publisherId: sellerId,
  sellerRelationship: process.env.AD_SELLER_RELATIONSHIP ?? 'DIRECT',
  certificationAuthorityId: process.env.AD_CERTIFICATION_AUTHORITY_ID ?? 'f08c47fec0942fa0',
  web: {
    provider: 'google-adsense',
    clientId: adsenseClientId,
    rewardedSlotId: adsenseRewardedSlotId,
    configured: webAdConfigured,
  },
  app: {
    provider: 'google-admob',
    publisherId: admobPublisherId,
    configured: appAdConfigured,
  },
}
const adNetworkConfigured = webAdConfigured || appAdConfigured
const canEnableRevenue = gatesPassed && promotionAllowed && adNetworkConfigured
const bestGrowthPage =
  growth.gamePages
    ?.slice()
    .sort((a, b) => (b.metrics?.qualityScore ?? 0) - (a.metrics?.qualityScore ?? 0))[0] ?? null

const placements = [
  {
    id: 'rewarded-hint-after-failed-daily',
    type: 'rewarded',
    status: canEnableRevenue ? 'ready' : 'disabled',
    firstChannel: 'web-pwa',
    trigger: 'after a completed failed run, never before the first game ends',
    reward: 'one optional strategy hint or cosmetic board accent',
    frequencyCap: 'max 1 offer per anonymous session',
    estimatedUserRisk: 'low',
    telemetry: [
      'rewarded_ad_available',
      'rewarded_ad_started',
      'rewarded_ad_completed',
      'revenue_cents',
    ],
  },
  {
    id: 'cosmetic-unlock-result-skin',
    type: 'cosmetic',
    status: gatesPassed && promotionAllowed ? 'planned' : 'disabled',
    firstChannel: 'web-pwa',
    trigger: 'result screen only',
    reward: 'alternate result-card look with no gameplay advantage',
    frequencyCap: 'offer after repeat play only',
    estimatedUserRisk: 'low',
    telemetry: ['cosmetic_offer_viewed', 'cosmetic_offer_clicked', 'revenue_cents'],
  },
]

const blockers = [
  ...(readiness.monetization?.checks ?? [])
    .filter((check) => check.status !== 'pass')
    .map((check) => check.detail),
  ...(promotionAllowed ? [] : monetizationDecision?.blockers ?? ['Monetization promotion is not allowed.']),
  ...(adNetworkConfigured
    ? []
    : ['Web/PWA or native ad provider is not configured for gated revenue tests.']),
].filter((blocker, index, items) => items.indexOf(blocker) === index)

const status = canEnableRevenue
  ? 'ready-for-rewarded-test'
  : gatesPassed && promotionAllowed
    ? 'ready-needs-ad-network'
    : 'blocked-by-product-gates'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  revenueEnabled: canEnableRevenue,
  costPosture: 'no-new-spend-until-gates-pass',
  analyticsSource: analytics.sourceStatus?.activeSource,
  retentionSource: analytics.retention?.source ?? readiness.monetization?.metrics?.retentionSource,
  metrics: {
    firstGameCompletion: metrics.firstGameCompletion ?? analytics.totals?.metrics?.firstGameCompletion,
    replayRate: metrics.replayRate ?? analytics.totals?.metrics?.replayRate,
    d1Retention: metrics.d1Retention ?? analytics.totals?.metrics?.d1Retention,
    revenueCents: analytics.totals?.metrics?.revenueCents ?? 0,
  },
  gates: {
    requiredStatus: 'ready-for-low-risk-test',
    readinessStatus: readiness.monetization?.status,
    promotionStatus: monetizationDecision?.status ?? 'missing',
    allowedEarlyTests: gates.monetization.allowedEarlyTests,
    blockedBeforeRetention: gates.monetization.blockedBeforeRetention,
  },
  adNetwork,
  placements,
  blockers,
  launchCandidate: bestGrowthPage
    ? {
        gameId: bestGrowthPage.gameId,
        title: bestGrowthPage.title,
        pagePath: bestGrowthPage.pagePath,
        qualityScore: bestGrowthPage.metrics?.qualityScore ?? null,
      }
    : null,
  compliance: {
    privacyPolicyPath: storePackage.privacyPolicy?.path,
    privacyPolicyStatus: storePackage.privacyPolicy?.productionUrlStatus,
    appAdsTxtPath: '/app-ads.txt',
    adDisclosureRequiredWhenEnabled: true,
    purchasesDisabledUntilExplicitGate: true,
  },
  safety: {
    neverEnableBeforeRetention: gates.monetization.blockedBeforeRetention,
    firstAllowedPlacement: placements[0].id,
    noInterstitialsInFirstSession: true,
    noPaywalledCoreRules: true,
  },
  runtime: {
    status: canEnableRevenue ? 'armed' : 'guarded-disabled',
    surface: 'result-screen',
    firstPlacementId: placements[0].id,
    requiresCompletedRun: true,
    requiresFailedRun: true,
    maxOffersPerSession: 1,
    disabledReason: blockers[0] ?? null,
    blockedEventsWhenDisabled: ['rewarded_ad_started', 'rewarded_ad_completed', 'revenue_cents'],
    webAdapter: webAdConfigured ? 'adsense-configured' : 'adsense-not-configured',
    appAdapter: appAdConfigured ? 'admob-configured' : 'admob-not-configured',
  },
}

const appAdsText = adNetworkConfigured
  ? `google.com, ${adNetwork.publisherId}, ${adNetwork.sellerRelationship}, ${adNetwork.certificationAuthorityId}\n`
  : [
      '# Autonomous Game Lab app-ads.txt',
      '# Revenue features are disabled until product, privacy, and platform gates pass.',
      '# Set ADMOB_PUBLISHER_ID to generate a valid seller line automatically.',
      '',
    ].join('\n')

const publicManifest = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  revenueEnabled: payload.revenueEnabled,
  runtime: payload.runtime,
  placements: payload.placements.map((placement) => ({
    id: placement.id,
    status: placement.status,
    type: placement.type,
  })),
}

const report = [
  '# Monetization Plan',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Revenue enabled: ${payload.revenueEnabled}`,
  `Analytics source: ${payload.analyticsSource}`,
  `Runtime: ${payload.runtime.status}`,
  '',
  '## Metrics',
  '',
  `- First-game completion: ${Math.round((payload.metrics.firstGameCompletion ?? 0) * 100)}%`,
  `- Replay rate: ${Math.round((payload.metrics.replayRate ?? 0) * 100)}%`,
  `- D1 retention: ${Math.round((payload.metrics.d1Retention ?? 0) * 100)}%`,
  `- Revenue: $${((payload.metrics.revenueCents ?? 0) / 100).toFixed(2)}`,
  '',
  '## Placements',
  '',
  ...payload.placements.map(
    (placement) =>
      `- ${placement.status}: ${placement.id} (${placement.type}) - ${placement.trigger}; ${placement.frequencyCap}.`,
  ),
  '',
  '## Blockers',
  '',
  ...(payload.blockers.length ? payload.blockers.map((blocker) => `- ${blocker}`) : ['- none']),
  '',
  '## Safety',
  '',
  ...payload.safety.neverEnableBeforeRetention.map((item) => `- blocked before retention: ${item}`),
  '- no interstitials in the first session',
  '- no paywalled core rules',
  '',
  '## Runtime',
  '',
  `- Surface: ${payload.runtime.surface}`,
  `- First placement: ${payload.runtime.firstPlacementId}`,
  `- Web adapter: ${payload.runtime.webAdapter}`,
  `- App adapter: ${payload.runtime.appAdapter}`,
  `- Disabled reason: ${payload.runtime.disabledReason ?? 'none'}`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(appAdsPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const monetizationPlan = ${JSON.stringify(payload, null, 2)} as const\n\nexport type MonetizationPlan = typeof monetizationPlan\n`,
)
await writeFile(publicManifestPath, JSON.stringify(publicManifest, null, 2) + '\n')
await writeFile(appAdsPath, appAdsText)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, publicManifestPath)}`)
console.log(`Wrote ${path.relative(root, appAdsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
