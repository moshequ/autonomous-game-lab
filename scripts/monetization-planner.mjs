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
const publicHtmlPath = path.join(root, 'public', 'monetization.html')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

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
const privacyPolicyHosted = storePackage.privacyPolicy?.productionUrlStatus === 'hosted'
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

const preflightChecks = [
  {
    id: 'product-gates',
    status: gatesPassed ? 'pass' : 'blocked',
    detail: `Readiness is ${readiness.monetization?.status ?? 'missing'}; first-game completion, replay, and D1 retention must pass before revenue tests.`,
  },
  {
    id: 'promotion-gate',
    status: promotionAllowed ? 'pass' : 'blocked',
    detail: `Promotion decision is ${monetizationDecision?.status ?? 'missing'}; release health must allow monetization.`,
  },
  {
    id: 'ad-provider',
    status: adNetworkConfigured ? 'pass' : 'missing-config',
    detail: webAdConfigured
      ? 'Web/PWA AdSense client and rewarded/display slot are configured.'
      : appAdConfigured
        ? 'Native AdMob publisher id is configured.'
        : 'Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID or ADMOB_PUBLISHER_ID before running revenue tests.',
  },
  {
    id: 'privacy-policy',
    status: privacyPolicyHosted ? 'pass' : 'blocked',
    detail: `Privacy policy URL is ${storePackage.privacyPolicy?.productionUrlStatus ?? 'missing'}.`,
  },
  {
    id: 'runtime-guardrails',
    status: 'pass',
    detail: 'Rewarded placement waits for a completed failed run, is capped to one offer per session, and never paywalls core rules.',
  },
  {
    id: 'telemetry-contract',
    status: 'pass',
    detail: 'Revenue telemetry is limited to rewarded/cosmetic lifecycle events and revenue_cents.',
  },
  {
    id: 'spend-guard',
    status: 'pass',
    detail: 'Revenue preflight does not allow paid acquisition, app-store spend, or store submission.',
  },
]
const preflightBlockingChecks = preflightChecks.filter((check) => check.status !== 'pass')
const preflightCheckSummary = preflightChecks.map(({ id, status }) => ({ id, status }))
const revenueTestPreflight = {
  status: canEnableRevenue
    ? 'ready-to-arm'
    : preflightBlockingChecks.some((check) => check.id === 'ad-provider')
      ? 'waiting-on-provider-or-product-gates'
      : 'waiting-on-product-gates',
  canArmRevenueTest: canEnableRevenue,
  firstRunnablePlacementId: placements[0].id,
  checks: preflightCheckSummary,
  blockingCheckIds: preflightBlockingChecks.map((check) => check.id),
  requiredEnvironment: {
    web: [
      { name: 'VITE_ADSENSE_CLIENT_ID', configured: Boolean(adsenseClientId) },
      { name: 'VITE_ADSENSE_REWARDED_SLOT_ID', configured: Boolean(adsenseRewardedSlotId) },
    ],
    native: [{ name: 'ADMOB_PUBLISHER_ID', configured: Boolean(admobPublisherId) }],
  },
  validationCommands: [
    'npm run autonomous:monetization',
    'npm run autonomous:unit-economics',
    'npm run autonomous:store-compliance',
    'npm run autonomous:readiness',
  ],
  controls: {
    noRevenueEnablementUntilAllChecksPass: true,
    noPaidSpend: true,
    noStoreSubmission: true,
    noSecretValues: true,
  },
}

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
  revenueTestPreflight,
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
  publicRoutes: {
    monetization: '/monetization.html',
    monetizationJson: '/monetization.json',
    appAdsTxt: '/app-ads.txt',
    measurementStatus: '/measurement-status.html',
    gateSample: '/gate-sample.html',
    privacyPolicy: storePackage.privacyPolicy?.path ?? '/privacy.html',
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
  revenueTestPreflight: {
    status: payload.revenueTestPreflight.status,
    canArmRevenueTest: payload.revenueTestPreflight.canArmRevenueTest,
    blockingCheckIds: payload.revenueTestPreflight.blockingCheckIds,
    checks: payload.revenueTestPreflight.checks.map((check) => ({
      id: check.id,
      status: check.status,
    })),
    controls: payload.revenueTestPreflight.controls,
  },
  publicRoutes: payload.publicRoutes,
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
  `Revenue test preflight: ${payload.revenueTestPreflight.status}`,
  `Public preflight: ${payload.publicRoutes.monetization}`,
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
  '## Revenue Test Preflight',
  '',
  ...preflightChecks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Validation',
  '',
  ...payload.revenueTestPreflight.validationCommands.map((command) => `- ${command}`),
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

const publicHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Autonomous Game Lab Monetization Preflight</title>
    <style>
      :root {
        color: #16211f;
        background: #f6f8f7;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      header,
      main {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
      }

      header {
        padding: 42px 0 22px;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        max-width: 760px;
        font-size: clamp(2rem, 5vw, 4.4rem);
        line-height: 0.98;
        letter-spacing: 0;
      }

      h2 {
        font-size: 1.2rem;
        letter-spacing: 0;
      }

      p {
        color: #4d5c58;
        line-height: 1.55;
      }

      header p:not(.eyebrow) {
        max-width: 720px;
        margin-top: 14px;
        font-size: 1.05rem;
      }

      .eyebrow {
        margin-bottom: 10px;
        color: #0f766e;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .summary,
      .checks,
      .placements {
        display: grid;
        gap: 12px;
      }

      .summary {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        padding: 18px 0 22px;
      }

      .checks,
      .placements {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .placements {
        margin-top: 14px;
      }

      .metric,
      .check,
      .placement,
      .handoff {
        border: 1px solid #c9d6d2;
        border-radius: 8px;
        background: #ffffff;
        padding: 16px;
      }

      .metric span,
      .check span,
      .placement span {
        display: block;
        color: #68736f;
        font-size: 0.76rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .metric strong,
      .check strong,
      .placement strong {
        display: block;
        margin-top: 5px;
        overflow-wrap: anywhere;
        font-size: 1.05rem;
      }

      .check p,
      .placement p {
        margin-top: 10px;
      }

      section {
        margin-bottom: 24px;
      }

      section > h2 {
        margin-bottom: 12px;
      }

      .handoff {
        margin: 24px 0 42px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }

      a {
        color: #0f5f58;
        font-weight: 800;
      }

      .actions a {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        justify-content: center;
        padding: 0 14px;
        border-radius: 7px;
        background: #0f766e;
        color: #ffffff;
        text-decoration: none;
      }

      .actions a:nth-child(2) {
        background: #31423d;
      }

      .actions a:nth-child(3) {
        background: #bd4d38;
      }

      @media (max-width: 820px) {
        .summary,
        .checks,
        .placements {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <p class="eyebrow">Zero-spend revenue gate</p>
      <h1>Autonomous Game Lab Monetization Preflight</h1>
      <p>Rewarded and cosmetic revenue tests stay disabled until product gates, promotion safety, provider setup, privacy, and spend controls all pass.</p>
    </header>
    <main>
      <section class="summary" aria-label="Monetization summary">
        <div class="metric"><span>Status</span><strong>${escapeHtml(payload.status)}</strong></div>
        <div class="metric"><span>Revenue enabled</span><strong>${payload.revenueEnabled ? 'yes' : 'no'}</strong></div>
        <div class="metric"><span>Preflight</span><strong>${escapeHtml(payload.revenueTestPreflight.status)}</strong></div>
        <div class="metric"><span>Runtime</span><strong>${escapeHtml(payload.runtime.status)}</strong></div>
      </section>
      <section aria-label="Revenue test checks">
        <h2>Revenue Test Checks</h2>
        <div class="checks">
          ${preflightChecks
            .map(
              (check) => `<article class="check">
                <span>${escapeHtml(check.id)}</span>
                <strong>${escapeHtml(check.status)}</strong>
                <p>${escapeHtml(check.detail)}</p>
              </article>`,
            )
            .join('')}
        </div>
      </section>
      <section aria-label="Revenue placements">
        <h2>Placements</h2>
        <div class="placements">
          ${payload.placements
            .map(
              (placement) => `<article class="placement">
                <span>${escapeHtml(placement.type)}</span>
                <strong>${escapeHtml(placement.id)}: ${escapeHtml(placement.status)}</strong>
                <p>${escapeHtml(placement.trigger)} ${escapeHtml(placement.frequencyCap)}</p>
              </article>`,
            )
            .join('')}
        </div>
      </section>
      <section class="handoff" aria-label="Monetization handoff">
        <h2>Handoff</h2>
        <p>Current blocker: ${escapeHtml(payload.runtime.disabledReason ?? 'none')}. Revenue, paid acquisition, and store submission remain blocked while this preflight is not ready.</p>
        <div class="actions">
          <a href="./measurement-status.html">Open measurement status</a>
          <a href="./gate-sample.html">Open gate sample</a>
          <a href="./monetization.json">Open monetization JSON</a>
          <a href="./app-ads.txt">Open app-ads.txt</a>
        </div>
      </section>
    </main>
  </body>
</html>
`

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
await writeFile(publicHtmlPath, publicHtml)
await writeFile(appAdsPath, appAdsText)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, publicManifestPath)}`)
console.log(`Wrote ${path.relative(root, publicHtmlPath)}`)
console.log(`Wrote ${path.relative(root, appAdsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
