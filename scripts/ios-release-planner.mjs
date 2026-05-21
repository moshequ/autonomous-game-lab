import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const iosDir = path.join(root, 'native', 'ios')
const outputJsonPath = path.join(dataDir, 'ios-release.json')
const outputTsPath = path.join(root, 'src', 'data', 'iosRelease.ts')
const reportPath = path.join(root, 'reports', 'ios-release-latest.md')
const capacitorConfigPath = path.join(iosDir, 'capacitor.config.json')
const appStoreHandoffPath = path.join(iosDir, 'app-store-handoff.json')
const iosReadmePath = path.join(iosDir, 'README.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const configured = (...values) => values.some((value) => typeof value === 'string' && value.trim())

const storePackage = await readJson(path.join(dataDir, 'store-package.json'))
const storeCompliance = await readJson(path.join(dataDir, 'store-compliance.json'))
const storeAssets = await readJson(path.join(dataDir, 'store-assets.json'))
const productionEnvironment = await readJson(path.join(dataDir, 'production-environment.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const promotionDecision = await readOptionalJson(path.join(dataDir, 'promotion-decision.json'), { decisions: [] })
const pwaInstallLoop = await readOptionalJson(path.join(dataDir, 'pwa-install-loop.json'), { status: 'missing' })
const retentionLoop = await readOptionalJson(path.join(dataDir, 'retention-loop.json'), { status: 'missing' })
const completionLoop = await readOptionalJson(path.join(dataDir, 'completion-loop.json'), { status: 'missing' })
const replayLoop = await readOptionalJson(path.join(dataDir, 'replay-loop.json'), { status: 'missing' })
const playableGames = await readOptionalJson(path.join(dataDir, 'playable-games.json'), { games: [] })
const gates = await readJson(path.join(dataDir, 'production-gates.json'))

const iosPromotion = promotionDecision.decisions?.find((decision) => decision.channel === 'ios-app-store')
const bundleId =
  process.env.AGL_IOS_BUNDLE_ID ??
  productionEnvironment.ios?.bundleId ??
  process.env.AGL_ANDROID_PACKAGE_NAME ??
  productionEnvironment.android?.packageName ??
  storePackage.nativePackaging?.androidTwaManifest?.packageName ??
  'app.autonomousgamelab.portal'
const publicOrigin =
  productionEnvironment.publicOrigin?.origin ??
  storePackage.privacyPolicy?.productionUrl?.replace(/\/privacy\.html$/, '') ??
  null
const privacyUrl = storePackage.privacyPolicy?.productionUrl ?? null
const supportUrl = storePackage.supportPage?.productionUrl ?? null
const appName = storePackage.storeListing?.appName ?? 'Autonomous Game Lab'
const appleDeveloperConnected =
  ['1', 'true', 'yes'].includes(String(process.env.AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED ?? '').toLowerCase()) ||
  productionEnvironment.ios?.appleDeveloperAccountConnected === true
const appStoreConnectApiConfigured = configured(
  process.env.APP_STORE_CONNECT_API_KEY_JSON,
  process.env.APP_STORE_CONNECT_API_KEY_BASE64,
  process.env.APP_STORE_CONNECT_API_KEY_PATH,
)
const storeSpendAllowed = unitEconomics.controls?.storeSpendAllowed === true
const iosFeeAllowed = unitEconomics.storeFees?.iosAppStore?.allowed === true
const privacyHosted = storePackage.privacyPolicy?.productionUrlStatus === 'hosted'
const supportConfigured = storePackage.supportPage?.supportEmailStatus === 'configured'
const storeListingReady = Boolean(
  storePackage.storeListing?.appName &&
    storePackage.storeListing?.shortDescription &&
    storePackage.storeListing?.fullDescription,
)
const applePrivacyReady = storePackage.dataSafetyDraft?.appleAppPrivacy?.status === 'draft-ready'
const appleRatingReady = storeCompliance.contentRating?.appleAppStore?.ageRatingStatus === 'draft-ready'
const screenshotsReady = storeAssets.status === 'screenshots-ready' && (storeAssets.screenshots?.length ?? 0) >= 4
const appLikeValuePrepared =
  (playableGames.games?.length ?? 0) >= 5 &&
  pwaInstallLoop.status === 'pwa-install-loop-ready' &&
  retentionLoop.status === 'retention-loop-ready' &&
  completionLoop.status === 'completion-loop-ready' &&
  replayLoop.status === 'replay-loop-ready'

const check = (id, passed, detail, statusWhenBlocked = 'blocker') => ({
  id,
  status: passed ? 'pass' : statusWhenBlocked,
  detail,
})

const checks = [
  check('store-listing', storeListingReady, 'Store listing metadata is ready for App Store Connect draft entry.'),
  check('apple-privacy-labels', applePrivacyReady, 'Apple App Privacy labels are drafted from the store package.'),
  check('age-rating', appleRatingReady, 'Apple 4+ age-rating answers are drafted.'),
  check('store-screenshots', screenshotsReady, `${storeAssets.screenshots?.length ?? 0} screenshot asset(s) are available.`),
  check('hosted-privacy-url', privacyHosted, 'Hosted privacy policy URL is available for App Review.'),
  check('support-contact', supportConfigured, 'Production support email is required before public store submission.', 'external-blocker'),
  check(
    'native-app-like-value',
    appLikeValuePrepared,
    'PWA install, daily challenge, completion, replay, and multi-game catalog evidence prepare the native-value review story.',
  ),
  check(
    'apple-developer-account',
    appleDeveloperConnected,
    'Apple Developer Program account is not connected.',
    'deferred-paid-account',
  ),
  check(
    'app-store-connect-api',
    appStoreConnectApiConfigured,
    'App Store Connect API credentials are not available to CI.',
    'missing-env',
  ),
  check(
    'annual-fee-payback',
    storeSpendAllowed && iosFeeAllowed,
    `Store spend allowed is ${storeSpendAllowed}; projected Apple payback is ${
      unitEconomics.storeFees?.iosAppStore?.paybackDays ?? 'not available'
    }.`,
    'held-by-economics',
  ),
]

const hardBlockers = checks.filter((item) => item.status === 'blocker')
const deferredPaid = checks.filter((item) => item.status === 'deferred-paid-account')
const missingEnv = checks.filter((item) => item.status === 'missing-env')
const economicsHeld = checks.filter((item) => item.status === 'held-by-economics')
const status = hardBlockers.length
  ? 'needs-ios-draft-inputs'
  : deferredPaid.length || economicsHeld.length
    ? 'deferred-until-ios-payback'
    : missingEnv.length
      ? 'blocked-needs-app-store-connect-api'
      : 'ready-for-testflight-handoff'

const appLikeValueEvidence = [
  `${playableGames.games?.length ?? 0} playable original games in the catalog.`,
  `PWA install loop is ${pwaInstallLoop.status}.`,
  `Retention loop is ${retentionLoop.status}.`,
  `Completion loop is ${completionLoop.status}.`,
  `Replay loop is ${replayLoop.status}.`,
  'Native shell is deferred until payback and Apple account gates clear to avoid a thin-wrapper submission.',
]

const capacitorConfig = {
  appId: bundleId,
  appName,
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    scheme: 'AutonomousGameLab',
    contentInset: 'automatic',
  },
  metadata: {
    status,
    productionOrigin: publicOrigin,
    privacyUrl,
    supportUrl,
    nativeProjectGenerated: false,
    reason: 'Draft config only; do not run Capacitor/Xcode packaging until Apple, payback, and review gates pass.',
  },
}

const handoff = {
  platform: 'ios-app-store',
  status,
  bundleId,
  appName,
  productionOrigin: publicOrigin,
  privacyUrl,
  supportUrl,
  listing: {
    subtitle: storePackage.storeListing?.shortDescription ?? null,
    fullDescription: storePackage.storeListing?.fullDescription ?? null,
    keywords: storePackage.storeListingOptimization?.keywordThemes ?? [],
    launchCandidate: storePackage.launchCandidate ?? null,
  },
  privacy: {
    labels: storePackage.dataSafetyDraft?.appleAppPrivacy?.labels ?? [],
    policyUrl: privacyUrl,
    supportUrl,
  },
  screenshots: (storeAssets.screenshots ?? []).map((screenshot) => ({
    id: screenshot.id,
    publicPath: screenshot.publicPath ?? screenshot.path,
    width: screenshot.width,
    height: screenshot.height,
  })),
  appReview: {
    loginRequired: false,
    accountDeletionRequired: false,
    notes: storeCompliance.appAccess?.notes ?? null,
    ageRating: storeCompliance.contentRating?.appleAppStore ?? null,
    appLikeValueEvidence,
  },
  controls: {
    zeroPaidSpend: true,
    noAppleAccountCreation: true,
    noStoreSubmission: true,
    noIapSetupUntilDigitalPurchases: true,
    noXcodeProjectGenerated: true,
  },
}

const blockers = checks.filter((item) => item.status !== 'pass').map((item) => `${item.id}: ${item.detail}`)
const payload = {
  generatedAt: new Date().toISOString(),
  sourceDataHash: hashSourceData({
    storePackage,
    storeCompliance,
    storeAssets,
    productionEnvironment,
    unitEconomics,
    promotionDecision,
    pwaInstallLoop,
    retentionLoop,
    completionLoop,
    replayLoop,
    playableGames,
  }),
  status,
  platform: 'ios-app-store',
  bundleId,
  appName,
  publicOrigin,
  costGate: {
    appleDeveloperProgramAnnualUsd: gates.iosAppStore.annualCostUsd,
    spendAllowed: storeSpendAllowed,
    feeAllowed: iosFeeAllowed,
    paybackDays: unitEconomics.storeFees?.iosAppStore?.paybackDays ?? null,
  },
  strategy: {
    packageStrategy: 'capacitor-pwa-shell-after-payback',
    nativeProjectDeferred: true,
    xcodeProjectCreated: false,
    appStoreConnectUploadDeferred: true,
    reason:
      'Prepare metadata, privacy, screenshots, and native-value evidence now; create the iOS project only after payback and Apple account gates clear.',
  },
  handoff: {
    directory: 'native/ios',
    capacitorConfigPath: 'native/ios/capacitor.config.json',
    appStoreHandoffPath: 'native/ios/app-store-handoff.json',
    readmePath: 'native/ios/README.md',
  },
  sourceStatus: {
    promotion: iosPromotion?.status ?? 'missing',
    appleDeveloperAccountConnected: appleDeveloperConnected,
    appStoreConnectApiConfigured,
    storePackage: storePackage.status,
    storeCompliance: storeCompliance.status,
    storeAssets: storeAssets.status,
    unitEconomics: unitEconomics.status,
  },
  appLikeValueEvidence,
  checks,
  blockers,
  setupRequiredOnce: [
    'Keep the PWA hosted with privacy and support URLs reachable before App Review.',
    'Connect Apple Developer Program only after live revenue justifies the annual fee.',
    'Set App Store Connect API credentials only after the Apple account exists and store spend is allowed.',
    'Run Capacitor/Xcode packaging only after native-value, privacy, account, and payback gates pass.',
  ],
  commands: {
    plan: 'npm run autonomous:ios-release-plan',
    installCapacitor: 'npm install @capacitor/core @capacitor/ios',
    createNativeProject: 'npx cap add ios',
    syncWebBuild: 'npx cap sync ios',
    archive: 'Open native iOS project in Xcode and archive only after gates pass.',
  },
  controls: {
    zeroPaidSpend: true,
    noAppleAccountCreation: true,
    noStoreSubmission: true,
    noIapSetupUntilDigitalPurchases: true,
    noXcodeProjectGenerated: true,
    requiresHumanStoreReview: true,
  },
}

const readme = [
  '# iOS App Store Handoff',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Bundle ID: ${payload.bundleId}`,
  '',
  '## Files',
  '',
  '- `capacitor.config.json`: draft Capacitor metadata for a future iOS shell.',
  '- `app-store-handoff.json`: App Store metadata, privacy, screenshot, and review checklist.',
  '- No Xcode project is generated in the zero-spend path.',
  '',
  '## Controls',
  '',
  `- Zero paid spend: ${payload.controls.zeroPaidSpend}`,
  `- Apple account creation blocked: ${payload.controls.noAppleAccountCreation}`,
  `- Store submission blocked: ${payload.controls.noStoreSubmission}`,
  `- Xcode project generated: ${!payload.controls.noXcodeProjectGenerated}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
  '## Setup Required Once',
  '',
  ...payload.setupRequiredOnce.map((item) => `- ${item}`),
  '',
]

const report = [
  '# iOS Release',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Platform: ${payload.platform}`,
  `Bundle ID: ${payload.bundleId}`,
  `Cost gate: $${payload.costGate.appleDeveloperProgramAnnualUsd}/year`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
  '## App-Like Value Evidence',
  '',
  ...payload.appLikeValueEvidence.map((item) => `- ${item}`),
  '',
  '## Handoff',
  '',
  `- Capacitor config: ${payload.handoff.capacitorConfigPath}`,
  `- App Store checklist: ${payload.handoff.appStoreHandoffPath}`,
  `- README: ${payload.handoff.readmePath}`,
  '',
  '## Next Actions',
  '',
  ...payload.setupRequiredOnce.map((item) => `- ${item}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(iosDir, { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const iosRelease = ${JSON.stringify(payload, null, 2)} as const\n\nexport type IosRelease = typeof iosRelease\n`,
)
await writeFile(capacitorConfigPath, JSON.stringify(capacitorConfig, null, 2) + '\n')
await writeFile(appStoreHandoffPath, JSON.stringify(handoff, null, 2) + '\n')
await writeFile(iosReadmePath, readme.join('\n'))
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, capacitorConfigPath)}`)
console.log(`Wrote ${path.relative(root, appStoreHandoffPath)}`)
console.log(`Wrote ${path.relative(root, iosReadmePath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (process.argv.includes('--assert-ready') && payload.status !== 'ready-for-testflight-handoff') {
  console.error('iOS release is not ready for TestFlight handoff.')
  process.exit(1)
}
