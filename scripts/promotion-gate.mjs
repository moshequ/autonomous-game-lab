import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const policyPath = path.join(root, 'data', 'promotion-policy.json')
const readinessPath = path.join(root, 'data', 'production-readiness.json')
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const storePackagePath = path.join(root, 'data', 'store-package.json')
const releaseHealthPath = path.join(root, 'data', 'release-health.json')
const environmentPath = path.join(root, 'data', 'production-environment.json')
const nativePackagePath = path.join(root, 'data', 'native-package.json')
const outputJsonPath = path.join(root, 'data', 'promotion-decision.json')
const outputTsPath = path.join(root, 'src', 'data', 'promotionDecision.ts')
const outputReportPath = path.join(root, 'reports', 'promotion-decision-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const policy = await readJson(policyPath)
const readiness = await readJson(readinessPath)
const analytics = await readJson(analyticsPath)
const storePackage = await readJson(storePackagePath)
const environment = await readOptionalJson(environmentPath, {
  android: { signingFingerprintConfigured: false, googlePlayAccountConnected: false },
  ios: { appleDeveloperAccountConnected: false },
})
const nativePackage = await readOptionalJson(nativePackagePath, { status: 'missing' })
const releaseHealth = await readOptionalJson(releaseHealthPath, {
  status: 'missing',
  controls: { canPromoteWeb: false, monetizationAllowed: false },
})

const decide = ({ channel, status, decision, blockers, nextAction }) => ({
  channel,
  status,
  decision,
  blockers,
  nextAction,
})

const androidNextActionFor = (blockers) => {
  if (!blockers.length) {
    return 'Run Android package build and Play Console upload.'
  }

  const actions = [
    blockers.includes('Web/PWA readiness is not green.') ? 'Restore web/PWA readiness.' : null,
    blockers.includes('Store package draft is not ready.') ? 'Finish the store package draft.' : null,
    blockers.includes('Hosted privacy policy URL is missing.') ? 'Host the production privacy URL.' : null,
    blockers.includes('Signed Android package and keystore are missing.') ? 'Create Android signing assets.' : null,
    blockers.includes('Google Play developer account is not connected.')
      ? 'Connect the Google Play developer account.'
      : null,
    blockers.some((blocker) => blocker.startsWith('Native package is '))
      ? 'Refresh the native Android package handoff.'
      : null,
  ].filter(Boolean)

  return actions.join(' ')
}

const webBlockers = []

if (readiness.webPwa?.status !== policy.webPwa.requiredReadinessStatus) {
  webBlockers.push(`Web readiness is ${readiness.webPwa?.status ?? 'missing'}`)
}

if (readiness.distribution?.storePackage?.status !== policy.webPwa.requiredStorePackageStatus) {
  webBlockers.push(`Store package is ${readiness.distribution?.storePackage?.status ?? 'missing'}`)
}

if (analytics.sourceStatus?.activeSource === 'fixture-sample' && !policy.webPwa.allowFixtureSourceForInternalDeploy) {
  webBlockers.push('Analytics source is fixture-sample')
}

if (releaseHealth.status === 'blocked' || releaseHealth.controls?.canPromoteWeb === false) {
  webBlockers.push(`Release health is ${releaseHealth.status}`)
}

const webPwa = decide({
  channel: 'web-pwa',
  status: webBlockers.length ? 'blocked' : 'promotable-internal',
  decision: webBlockers.length
    ? 'Hold web deploy until readiness blockers clear.'
    : 'Promote the current PWA build to an internal/public web experiment when hosting is connected.',
  blockers: webBlockers,
  nextAction: webBlockers.length
    ? 'Fix web readiness blockers.'
    : 'Connect a free static host or GitHub Pages environment, then publish dist.',
})

const monetizationBlockers = readiness.monetization?.checks
  ?.filter((check) => check.status !== 'pass')
  .map((check) => check.detail) ?? ['Monetization readiness missing']

if (releaseHealth.status === 'blocked') {
  monetizationBlockers.push(`Release health is ${releaseHealth.status}`)
}

const monetization = decide({
  channel: 'monetization',
  status:
    readiness.monetization?.status === policy.monetization.requiredStatus &&
    releaseHealth.controls?.monetizationAllowed !== false
      ? 'promotable'
      : 'blocked',
  decision:
    readiness.monetization?.status === policy.monetization.requiredStatus &&
    releaseHealth.controls?.monetizationAllowed !== false
      ? 'Allow the first low-risk monetization experiment.'
      : 'Keep revenue features disabled.',
  blockers:
    readiness.monetization?.status === policy.monetization.requiredStatus &&
    releaseHealth.controls?.monetizationAllowed !== false
      ? []
      : monetizationBlockers,
  nextAction:
    readiness.monetization?.status === policy.monetization.requiredStatus &&
    releaseHealth.controls?.monetizationAllowed !== false
      ? `Enable one of: ${policy.monetization.allowedFirstActions.join(', ')}.`
      : 'Collect live completion, replay, and retention data until gates pass.',
})

const androidBlockers = []

if (readiness.webPwa?.status !== policy.android.requiredWebStatus) {
  androidBlockers.push('Web/PWA readiness is not green.')
}

if (readiness.distribution?.storePackage?.status !== policy.android.requiredStorePackageStatus) {
  androidBlockers.push('Store package draft is not ready.')
}

if (policy.android.requiresHostedPrivacyUrl && storePackage.privacyPolicy?.productionUrlStatus !== 'hosted') {
  androidBlockers.push('Hosted privacy policy URL is missing.')
}

if (policy.android.requiresSigning && environment.android?.signingFingerprintConfigured !== true) {
  androidBlockers.push('Signed Android package and keystore are missing.')
}

if (policy.android.requiresGooglePlayAccount && environment.android?.googlePlayAccountConnected !== true) {
  androidBlockers.push('Google Play developer account is not connected.')
}

if (nativePackage.status !== 'ready-for-bubblewrap-build') {
  androidBlockers.push(`Native package is ${nativePackage.status}.`)
}

const android = decide({
  channel: 'android-google-play',
  status: androidBlockers.length ? 'blocked' : 'promotable',
  decision: androidBlockers.length
    ? 'Keep Android packaging blocked.'
    : 'Package Android Trusted Web Activity and prepare Play Console submission.',
  blockers: androidBlockers,
  nextAction: androidNextActionFor(androidBlockers),
})

const revenueCents = analytics.totals?.metrics?.revenueCents ?? 0
const iosBlockers = []

if (policy.ios.requiresPositiveRevenueSignal && revenueCents < policy.ios.minimumRevenueCentsToConsider) {
  iosBlockers.push(`Revenue signal is $${(revenueCents / 100).toFixed(2)}, below $${(policy.ios.minimumRevenueCentsToConsider / 100).toFixed(2)}.`)
}

if (policy.ios.requiresAppleDeveloperAccount && environment.ios?.appleDeveloperAccountConnected !== true) {
  iosBlockers.push('Apple Developer account is not connected.')
}

if (storePackage.privacyPolicy?.productionUrlStatus !== 'hosted') {
  iosBlockers.push('Hosted privacy policy URL is missing.')
}

const ios = decide({
  channel: 'ios-app-store',
  status: iosBlockers.length ? 'defer' : 'promotable',
  decision: iosBlockers.length ? 'Defer iOS spend.' : 'Prepare iOS packaging and App Store Connect draft.',
  blockers: iosBlockers,
  nextAction: iosBlockers.length
    ? 'Wait for revenue signal and hosted compliance URLs before paying annual Apple cost.'
    : 'Connect Apple Developer account and package native shell.',
})

const payload = {
  generatedAt: new Date().toISOString(),
  analyticsSource: analytics.sourceStatus?.activeSource,
  releaseHealth: {
    status: releaseHealth.status,
    canPromoteWeb: releaseHealth.controls?.canPromoteWeb ?? false,
    canDeploy: releaseHealth.controls?.canDeploy ?? false,
    monetizationAllowed: releaseHealth.controls?.monetizationAllowed ?? false,
  },
  decisions: [webPwa, monetization, android, ios],
  summary: {
    nextChannel: webPwa.status === 'promotable-internal' ? 'web-pwa' : null,
    blockedPaidChannels: [monetization, android, ios].filter((item) => item.status !== 'promotable').map((item) => item.channel),
    costPosture: 'no-new-spend',
  },
}

const report = [
  '# Promotion Decision',
  '',
  `Generated: ${payload.generatedAt}`,
  `Analytics source: ${payload.analyticsSource}`,
  `Release health: ${payload.releaseHealth.status}`,
  `Cost posture: ${payload.summary.costPosture}`,
  '',
  '## Decisions',
  '',
  ...payload.decisions.flatMap((decision) => [
    `### ${decision.channel}`,
    '',
    `- Status: ${decision.status}`,
    `- Decision: ${decision.decision}`,
    `- Next action: ${decision.nextAction}`,
    ...(decision.blockers.length ? ['- Blockers:', ...decision.blockers.map((blocker) => `  - ${blocker}`)] : ['- Blockers: none']),
    '',
  ]),
]

const tsOutput = `export const promotionDecision = ${JSON.stringify(payload, null, 2)} as const\n\nexport type PromotionDecision = typeof promotionDecision\n`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(outputReportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(outputTsPath, tsOutput)
await writeFile(outputReportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, outputReportPath)}`)
