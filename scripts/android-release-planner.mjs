import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const nativePackagePath = path.join(root, 'data', 'native-package.json')
const androidSigningPath = path.join(root, 'data', 'android-signing.json')
const storePackagePath = path.join(root, 'data', 'store-package.json')
const storeCompliancePath = path.join(root, 'data', 'store-compliance.json')
const storeAssetsPath = path.join(root, 'data', 'store-assets.json')
const productionEnvironmentPath = path.join(root, 'data', 'production-environment.json')
const productionReadinessPath = path.join(root, 'data', 'production-readiness.json')
const unitEconomicsPath = path.join(root, 'data', 'unit-economics.json')
const promotionDecisionPath = path.join(root, 'data', 'promotion-decision.json')
const workflowPath = path.join(root, '.github', 'workflows', 'android-twa-release.yml')
const outputJsonPath = path.join(root, 'data', 'android-release.json')
const outputTsPath = path.join(root, 'src', 'data', 'androidRelease.ts')
const reportPath = path.join(root, 'reports', 'android-release-latest.md')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const configured = (...values) => values.some((value) => typeof value === 'string' && value.trim())

const nativePackage = await readJson(nativePackagePath)
const androidSigning = await readOptionalJson(androidSigningPath, {
  status: 'missing',
  ciSecrets: {},
  signing: {},
})
const storePackage = await readJson(storePackagePath)
const storeCompliance = await readOptionalJson(storeCompliancePath, { status: 'missing', checks: [] })
const storeAssets = await readJson(storeAssetsPath)
const productionEnvironment = await readJson(productionEnvironmentPath)
const productionReadiness = await readJson(productionReadinessPath)
const unitEconomics = await readJson(unitEconomicsPath)
const promotionDecision = await readOptionalJson(promotionDecisionPath, { decisions: [] })

const androidPromotion = promotionDecision.decisions?.find((decision) => decision.channel === 'android-google-play')
const workflowExists = await exists(workflowPath)
const signingSecretsConfigured = configured(process.env.AGL_ANDROID_KEYSTORE_BASE64) &&
  configured(process.env.AGL_ANDROID_KEYSTORE_PASSWORD) &&
  configured(process.env.AGL_ANDROID_KEY_ALIAS)
const playServiceAccountConfigured = configured(
  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON,
  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64,
  process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH,
)
const releaseTrack = process.env.AGL_ANDROID_RELEASE_TRACK?.trim() || 'internal'
const releaseMode = process.env.AGL_ANDROID_RELEASE_MODE?.trim() || 'draft'
const storeSpendAllowed = unitEconomics.controls?.storeSpendAllowed === true
const nativeReady = nativePackage.status === 'ready-for-bubblewrap-build'
const storeDraftReady = productionReadiness.distribution?.storePackage?.status === 'draft-ready'
const screenshotsReady = storeAssets.status === 'screenshots-ready' && (storeAssets.screenshots?.length ?? 0) >= 4
const dataSafetyReady = storePackage.dataSafetyDraft?.googlePlay?.status === 'draft-ready'
const storeComplianceReady = storeCompliance.status === 'draft-ready-external-blockers'
const assetLinksReady =
  nativePackage.assetLinks?.publicGenerated === true &&
  nativePackage.handoff?.publicAssetLinksPath === 'public/.well-known/assetlinks.json'
const fingerprintReady = productionEnvironment.android?.signingFingerprintConfigured === true
const googlePlayAccountReady = productionEnvironment.android?.googlePlayAccountConnected === true
const androidPromotionReady = androidPromotion?.status === 'promotable'

const checks = [
  {
    id: 'native-package-ready',
    status: nativeReady ? 'pass' : 'blocker',
    detail: `Native package is ${nativePackage.status}.`,
  },
  {
    id: 'store-package-draft',
    status: storeDraftReady && dataSafetyReady ? 'pass' : 'blocker',
    detail: `Store package is ${productionReadiness.distribution?.storePackage?.status ?? 'missing'}; data safety is ${
      storePackage.dataSafetyDraft?.googlePlay?.status ?? 'missing'
    }.`,
  },
  {
    id: 'store-compliance-draft',
    status: storeComplianceReady ? 'pass' : 'blocker',
    detail: `Store compliance is ${storeCompliance.status}.`,
  },
  {
    id: 'store-screenshots',
    status: screenshotsReady ? 'pass' : 'blocker',
    detail: `${storeAssets.screenshots?.length ?? 0} screenshot asset(s) are available.`,
  },
  {
    id: 'asset-links',
    status: assetLinksReady ? 'pass' : 'blocker',
    detail: assetLinksReady
      ? `Digital Asset Links are generated at ${nativePackage.handoff?.publicAssetLinksPath}.`
      : `Digital Asset Links are ${nativePackage.assetLinks?.status ?? 'missing'}.`,
  },
  {
    id: 'signing-fingerprint',
    status: fingerprintReady ? 'pass' : 'blocker',
    detail: fingerprintReady ? 'Android signing fingerprint is configured.' : 'Android signing fingerprint is missing.',
  },
  {
    id: 'signing-secrets',
    status: signingSecretsConfigured ? 'pass' : 'missing-env',
    detail: 'Android keystore, password, and alias are available to CI.',
  },
  {
    id: 'google-play-account',
    status: googlePlayAccountReady ? 'pass' : 'missing-env',
    detail: googlePlayAccountReady ? 'Google Play account is connected.' : 'Google Play account is not connected.',
  },
  {
    id: 'play-service-account',
    status: playServiceAccountConfigured ? 'pass' : 'missing-env',
    detail: 'Google Play service account upload credentials are available to CI.',
  },
  {
    id: 'unit-economics-store-spend',
    status: storeSpendAllowed ? 'pass' : 'held-by-economics',
    detail: `Store spend allowed is ${storeSpendAllowed}; spend mode is ${unitEconomics.controls?.spendMode ?? 'missing'}.`,
  },
  {
    id: 'promotion-gate',
    status: androidPromotionReady ? 'pass' : 'blocker',
    detail: `Android promotion status is ${androidPromotion?.status ?? 'missing'}.`,
  },
  {
    id: 'release-workflow',
    status: workflowExists ? 'pass' : 'blocker',
    detail: 'Android TWA release workflow exists.',
  },
]

const hardBlockers = checks.filter((check) => check.status === 'blocker')
const missingEnv = checks.filter((check) => check.status === 'missing-env')
const economicsHeld = checks.filter((check) => check.status === 'held-by-economics')
const status = hardBlockers.length
  ? 'blocked-needs-host-signing-play'
  : missingEnv.length
    ? 'blocked-needs-release-secrets'
    : economicsHeld.length
      ? 'release-held-by-economics'
      : 'ready-for-internal-testing'
const setupRequiredOnce = [
  'Host the PWA on a stable HTTPS production domain with privacy and support URLs.',
  ...(fingerprintReady && androidSigning.ciSecrets?.configuredLocally === true
    ? ['Use production bootstrap to sync the prepared AGL_ANDROID_* signing values into CI secrets when repository credentials exist.']
    : [
        'Create Android signing material and set AGL_ANDROID_SHA256_CERT_FINGERPRINT after the certificate exists.',
        'Set AGL_ANDROID_KEYSTORE_BASE64, AGL_ANDROID_KEYSTORE_PASSWORD, and AGL_ANDROID_KEY_ALIAS in CI secrets.',
      ]),
  'Connect Google Play only after unit economics allows the one-time store fee.',
  'Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON or GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64 before automated internal testing uploads.',
]

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  envFiles: localEnv,
  platform: 'android-trusted-web-activity',
  channel: 'android-google-play',
  costPosture: unitEconomics.costPosture,
  packageName: nativePackage.packageName,
  releaseTrack,
  releaseMode,
  nativePackageStatus: nativePackage.status,
  signingStatus: androidSigning.status,
  storeComplianceStatus: storeCompliance.status,
  promotionStatus: androidPromotion?.status ?? 'missing',
  workflow: {
    path: '.github/workflows/android-twa-release.yml',
    status: workflowExists ? 'present' : 'missing',
    buildsWhenReady: status === 'ready-for-internal-testing',
  },
  artifacts: {
    handoffDirectory: nativePackage.handoff?.directory ?? 'native/android',
    twaManifestPath: nativePackage.handoff?.twaManifestPath,
    bubblewrapConfigPath: nativePackage.handoff?.bubblewrapConfigPath,
    assetLinksPath: nativePackage.handoff?.publicAssetLinksPath ?? nativePackage.handoff?.assetLinksTemplatePath,
    expectedAabPath: 'native/android/app-release-bundle.aab',
    expectedApkPath: 'native/android/app-release-signed.apk',
  },
  gates: {
    storeSpendAllowed,
    googlePlayFeeAllowed: unitEconomics.storeFees?.googlePlay?.allowed === true,
    paybackDays: unitEconomics.storeFees?.googlePlay?.paybackDays ?? null,
    hostedPrivacyStatus: storePackage.privacyPolicy?.productionUrlStatus ?? 'missing',
    assetLinksStatus: nativePackage.assetLinks?.status ?? 'missing',
    signingFingerprint: androidSigning.signing?.sha256CertFingerprint ?? nativePackage.signing?.sha256CertFingerprint ?? null,
    localSigningSecretsConfigured: androidSigning.ciSecrets?.configuredLocally === true,
  },
  checks,
  blockers: checks.filter((check) => check.status !== 'pass').map((check) => `${check.id}: ${check.detail}`),
  setupRequiredOnce,
  commands: {
    plan: 'npm run autonomous:android-release-plan',
    nativePackage: 'npm run autonomous:native-package',
    validate: nativePackage.commands?.validate ?? 'npx @bubblewrap/cli validate',
    build: nativePackage.commands?.build ?? 'npx @bubblewrap/cli build',
    releaseWorkflow: 'Run Android TWA Release after host, signing, Play, and economics gates pass.',
  },
}

const report = [
  '# Android Release',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Channel: ${payload.channel}`,
  `Package: ${payload.packageName}`,
  `Track: ${payload.releaseTrack}`,
  `Cost posture: ${payload.costPosture}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Artifacts',
  '',
  `- TWA manifest: ${payload.artifacts.twaManifestPath}`,
  `- Bubblewrap config: ${payload.artifacts.bubblewrapConfigPath}`,
  `- Asset links: ${payload.artifacts.assetLinksPath}`,
  `- Expected AAB: ${payload.artifacts.expectedAabPath}`,
  '',
  '## Setup Required Once',
  '',
  ...payload.setupRequiredOnce.map((item) => `- ${item}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const androidRelease = ${JSON.stringify(payload, null, 2)} as const\n\nexport type AndroidRelease = typeof androidRelease\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (process.argv.includes('--assert-ready') && payload.status !== 'ready-for-internal-testing') {
  console.error('Android release is not ready for internal testing.')
  process.exit(1)
}
