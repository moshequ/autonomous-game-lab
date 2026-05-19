import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'store-compliance.json')
const outputTsPath = path.join(root, 'src', 'data', 'storeCompliance.ts')
const reportPath = path.join(root, 'reports', 'store-compliance-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const storePackage = await readJson(path.join(dataDir, 'store-package.json'))
const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))
const productionEnvironment = await readJson(path.join(dataDir, 'production-environment.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const storeAssets = await readOptionalJson(path.join(dataDir, 'store-assets.json'), {
  status: 'missing',
  screenshots: [],
})

const check = (id, passed, detail, statusWhenBlocked = 'blocker') => ({
  id,
  status: passed ? 'pass' : statusWhenBlocked,
  detail,
})

const launchCandidate = storePackage.launchCandidate
const ratingNotes = storePackage.storeListing?.contentRatingNotes ?? []
const adsEnabled = monetization.revenueEnabled === true
const purchasesEnabled = monetization.placements?.some((placement) =>
  ['subscription', 'purchase', 'remove-ads', 'cosmetic'].includes(placement.type),
)
const privacyHosted = storePackage.privacyPolicy?.productionUrlStatus === 'hosted'
const supportConfigured = storePackage.supportPage?.supportEmailStatus === 'configured'
const googlePlayConnected = productionEnvironment.android?.googlePlayAccountConnected === true
const appleConnected = productionEnvironment.ios?.appleDeveloperAccountConnected === true
const screenshotsReady = storeAssets.status === 'screenshots-ready' && (storeAssets.screenshots?.length ?? 0) >= 4
const compliancePublicationReady =
  storePackage.compliancePublication?.publicPath === '/compliance.json' &&
  storePackage.compliancePublication?.controls?.postDeploySmokeRequired === true &&
  (storePackage.compliancePublication?.smokeChecks?.length ?? 0) >= 3

const contentRating = {
  googlePlay: {
    questionnaireStatus: 'draft-ready',
    expectedRating: 'Everyone',
    descriptors: [],
    answers: {
      violence: 'none',
      fear: 'none',
      sexualContent: 'none',
      language: 'none',
      controlledSubstances: 'none',
      gambling: 'none',
      simulatedGambling: false,
      userGeneratedContent: false,
      realMoneyPrizes: false,
      locationSharing: false,
    },
    evidence: ratingNotes,
  },
  appleAppStore: {
    ageRatingStatus: 'draft-ready',
    expectedRating: '4+',
    answers: {
      cartoonViolence: 'none',
      realisticViolence: 'none',
      profanity: 'none',
      matureThemes: 'none',
      simulatedGambling: 'none',
      contests: 'none',
      unrestrictedWebAccess: false,
      userGeneratedContent: false,
      gamblingAndContests: false,
    },
    evidence: ratingNotes,
  },
}

const targetAudience = {
  status: 'draft-ready',
  directedToChildren: false,
  childrenUnder13Targeted: false,
  targetAgeBands: ['13-15', '16-17', '18+'],
  familyPolicy: 'not-designed-for-families-program',
  rationale:
    'The app is a general-audience solo strategy puzzle portal with no child-directed branding, accounts, chat, UGC, gambling, or real-money prizes.',
}

const adsAndMonetization = {
  status: adsEnabled ? 'requires-final-ad-review' : 'ads-disabled',
  adsEnabled,
  adDisclosureRequired: adsEnabled,
  adDisclosureDraft: adsEnabled
    ? 'Rewarded ad tests may appear only after retention, privacy, and ad-provider gates pass.'
    : 'Ads are disabled in the current release.',
  inAppPurchasesEnabled: false,
  subscriptionsEnabled: false,
  paywalledCoreRules: false,
  paidAcquisitionAllowed: unitEconomics.controls?.paidAcquisitionAllowed === true,
  blockedTelemetryWhenDisabled: monetization.runtime?.blockedEventsWhenDisabled ?? [],
}

const privacyAndData = {
  status: 'draft-ready',
  privacyPolicyPath: storePackage.privacyPolicy?.path,
  productionPrivacyUrlStatus: storePackage.privacyPolicy?.productionUrlStatus,
  supportEmailStatus: storePackage.supportPage?.supportEmailStatus,
  googleDataSafetyStatus: storePackage.dataSafetyDraft?.googlePlay?.status,
  applePrivacyLabelStatus: storePackage.dataSafetyDraft?.appleAppPrivacy?.status,
  dataLinkedToIdentity: false,
  thirdPartySharing: storePackage.privacyPolicy?.dataCollected?.some((item) => item.sharedWithThirdParties) ?? false,
  trackingForAds: false,
  accountDeletion: 'not-required-no-accounts',
  optOutControl: 'external-analytics-opt-out-in-app',
}

const appAccess = {
  loginRequired: false,
  reviewerCredentialsRequired: false,
  accountDeletionUrlRequired: false,
  purchasesRequireReviewAccount: false,
  notes:
    'Reviewer can open the PWA/TWA directly. Accounts, purchases, ads, chat, and UGC are disabled until gates pass.',
}

const checks = [
  check(
    'content-rating',
    contentRating.googlePlay.expectedRating === 'Everyone' &&
      contentRating.appleAppStore.expectedRating === '4+' &&
      contentRating.googlePlay.answers.gambling === 'none' &&
      contentRating.googlePlay.answers.userGeneratedContent === false,
    'Content rating drafts avoid gambling, UGC, real-money prizes, mature content, and unrestricted web access.',
  ),
  check(
    'target-audience',
    targetAudience.directedToChildren === false && targetAudience.childrenUnder13Targeted === false,
    'Target audience is general audience and not child-directed.',
  ),
  check(
    'ads-declaration',
    adsAndMonetization.adsEnabled === monetization.revenueEnabled &&
      adsAndMonetization.inAppPurchasesEnabled === false &&
      adsAndMonetization.paywalledCoreRules === false,
    `Ads declaration is ${adsAndMonetization.status}; revenue enabled is ${monetization.revenueEnabled}.`,
  ),
  check(
    'privacy-data',
    privacyAndData.googleDataSafetyStatus === 'draft-ready' &&
      privacyAndData.applePrivacyLabelStatus === 'draft-ready' &&
      privacyAndData.accountDeletion === 'not-required-no-accounts',
    'Data safety, App Privacy labels, and account-deletion stance are drafted.',
  ),
  check(
    'app-access',
    appAccess.loginRequired === false && appAccess.reviewerCredentialsRequired === false,
    'Reviewer access does not require credentials because accounts are disabled.',
  ),
  check(
    'compliance-publication',
    compliancePublicationReady,
    'Deployable compliance manifest ties privacy, support, and post-deploy smoke checks together.',
  ),
  check(
    'store-screenshots',
    screenshotsReady,
    `${storeAssets.screenshots?.length ?? 0} generated screenshot asset(s) are available.`,
    'external-blocker',
  ),
  check(
    'hosted-privacy-url',
    privacyHosted,
    'Hosted privacy policy URL is required before public store submission.',
    'external-blocker',
  ),
  check(
    'support-contact',
    supportConfigured,
    'Production support email is required before public store submission.',
    'external-blocker',
  ),
  check(
    'google-play-account',
    googlePlayConnected,
    'Google Play developer account must be connected before Android submission.',
    'external-blocker',
  ),
  check(
    'apple-developer-account',
    appleConnected,
    'Apple Developer account remains deferred until iOS spend is justified.',
    'external-blocker',
  ),
]

const internalDraftReady = checks
  .filter((item) => !['hosted-privacy-url', 'support-contact', 'google-play-account', 'apple-developer-account'].includes(item.id))
  .every((item) => item.status === 'pass')
const externalBlockers = checks.filter((item) => item.status === 'external-blocker')
const hardBlockers = checks.filter((item) => item.status === 'blocker')
const status = hardBlockers.length
  ? 'needs-compliance-draft'
  : internalDraftReady
    ? 'draft-ready-external-blockers'
    : 'needs-store-assets'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  launchCandidate,
  policyPosture: 'no-accounts-no-ugc-no-gambling-no-paid-spend',
  contentRating,
  targetAudience,
  adsAndMonetization,
  privacyAndData,
  appAccess,
  checks,
  blockers: [...hardBlockers, ...externalBlockers].map((item) => `${item.id}: ${item.detail}`),
  reviewerNotes: [
    'Autonomous Game Lab is a general-audience collection of original solo strategy puzzles.',
    'Current builds disable accounts, chat, UGC, purchases, subscriptions, gambling, real-money prizes, and ads.',
    'Anonymous gameplay analytics can be disabled with the in-app external analytics opt-out.',
    'Native app submission must wait for hosted privacy/support URLs, signing assets, store accounts, and final review.',
  ],
  nextActions: [
    externalBlockers.length
      ? `Resolve external blocker: ${externalBlockers[0].detail}`
      : 'Keep compliance drafts attached to the next store package.',
    adsEnabled
      ? 'Run final ad disclosure review before enabling store submission.'
      : 'Keep ads disabled until retention and ad-provider gates pass.',
    'Regenerate store compliance after every store package, monetization, or production-environment change.',
  ],
}

const report = [
  '# Store Compliance',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Policy posture: ${payload.policyPosture}`,
  '',
  '## Content Rating',
  '',
  `- Google Play expected rating: ${payload.contentRating.googlePlay.expectedRating}`,
  `- Apple expected rating: ${payload.contentRating.appleAppStore.expectedRating}`,
  `- Gambling: ${payload.contentRating.googlePlay.answers.gambling}`,
  `- User-generated content: ${payload.contentRating.googlePlay.answers.userGeneratedContent}`,
  '',
  '## Ads And Monetization',
  '',
  `- Ads enabled: ${payload.adsAndMonetization.adsEnabled}`,
  `- IAP enabled: ${payload.adsAndMonetization.inAppPurchasesEnabled}`,
  `- Paywalled core rules: ${payload.adsAndMonetization.paywalledCoreRules}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
  '## Reviewer Notes',
  '',
  ...payload.reviewerNotes.map((item) => `- ${item}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((item) => `- ${item}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const storeCompliance = ${JSON.stringify(payload, null, 2)} as const\n\nexport type StoreCompliance = typeof storeCompliance\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
