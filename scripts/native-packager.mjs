import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const storePackagePath = path.join(root, 'data', 'store-package.json')
const gatesPath = path.join(root, 'data', 'production-gates.json')
const storeAssetsPath = path.join(root, 'data', 'store-assets.json')
const environmentPath = path.join(root, 'data', 'production-environment.json')
const androidSigningPath = path.join(root, 'data', 'android-signing.json')
const iconAssetsPath = path.join(root, 'data', 'icon-assets.json')
const outputJsonPath = path.join(root, 'data', 'native-package.json')
const outputTsPath = path.join(root, 'src', 'data', 'nativePackage.ts')
const reportPath = path.join(root, 'reports', 'native-package-latest.md')
const androidDir = path.join(root, 'native', 'android')
const twaManifestPath = path.join(androidDir, 'twa-manifest.json')
const bubblewrapConfigPath = path.join(androidDir, 'bubblewrap.config.json')
const assetLinksTemplatePath = path.join(androidDir, 'assetlinks.template.json')
const androidReadmePath = path.join(androidDir, 'README.md')
const publicAssetLinksPath = path.join(root, 'public', '.well-known', 'assetlinks.json')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const sanitizeHost = (value) =>
  String(value ?? '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')

const storePackage = await readJson(storePackagePath)
const gates = await readJson(gatesPath)
const storeAssets = await readJson(storeAssetsPath)
const environment = await readOptionalJson(environmentPath, {
  publicOrigin: { origin: null },
  android: {
    packageName: null,
    sha256CertFingerprint: null,
    googlePlayAccountConnected: false,
  },
})
const androidSigning = await readOptionalJson(androidSigningPath, {
  status: 'missing',
  signing: {},
})
const iconAssets = await readOptionalJson(iconAssetsPath, {
  status: 'missing',
  storeIcons: [],
  manifestIcons: [],
})

const packageName =
  process.env.AGL_ANDROID_PACKAGE_NAME ??
  environment.android?.packageName ??
  storePackage.nativePackaging?.androidTwaManifest?.packageName ??
  'app.autonomousgamelab.portal'
const publicOrigin =
  process.env.AGL_PUBLIC_ORIGIN ??
  process.env.VITE_PUBLIC_ORIGIN ??
  environment.publicOrigin?.origin ??
  (process.env.AGL_PUBLIC_HOST ? `https://${process.env.AGL_PUBLIC_HOST}` : null)
const host = sanitizeHost(publicOrigin ?? storePackage.nativePackaging?.androidTwaManifest?.host)
const startUrl = process.env.AGL_START_URL ?? storePackage.nativePackaging?.androidTwaManifest?.startUrl ?? '/'
const launcherName = process.env.AGL_APP_NAME ?? storePackage.nativePackaging?.androidTwaManifest?.launcherName ?? 'Game Lab'
const certificateFingerprint =
  process.env.AGL_ANDROID_SHA256_CERT_FINGERPRINT ??
  environment.android?.sha256CertFingerprint ??
  androidSigning.signing?.sha256CertFingerprint ??
  null
const googlePlayConnected =
  ['1', 'true', 'yes'].includes(String(process.env.AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED ?? '').toLowerCase()) ||
  environment.android?.googlePlayAccountConnected === true
const hostedPrivacyReady = storePackage.privacyPolicy?.productionUrlStatus === 'hosted'
const realHostReady = host && !host.includes('example.com') && host.includes('.')
const signingReady = Boolean(certificateFingerprint)
const screenshotsReady = storeAssets.status === 'screenshots-ready' && (storeAssets.screenshots?.length ?? 0) >= 4
const iconsReady = iconAssets.status === 'icons-ready' && (iconAssets.storeIcons?.length ?? 0) >= 1
const assetLinksReady = realHostReady && signingReady

const blockers = [
  ...(realHostReady ? [] : ['Production host is missing or still uses example.com.']),
  ...(hostedPrivacyReady ? [] : ['Hosted privacy policy URL is missing.']),
  ...(signingReady ? [] : ['Android signing certificate SHA-256 fingerprint is missing.']),
  ...(screenshotsReady ? [] : ['Store screenshots are not ready.']),
  ...(iconsReady ? [] : ['Install and store icons are not ready.']),
  ...(googlePlayConnected ? [] : ['Google Play developer account is not connected.']),
].filter((blocker, index, blockersList) => blockersList.indexOf(blocker) === index)

const status = blockers.length ? 'blocked-draft-ready' : 'ready-for-bubblewrap-build'
const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: [certificateFingerprint ?? '<SHA256_CERT_FINGERPRINT>'],
    },
  },
]

const twaManifest = {
  packageId: packageName,
  host,
  name: storePackage.storeListing?.appName ?? 'Autonomous Game Lab',
  launcherName,
  display: 'standalone',
  orientation: 'portrait',
  startUrl,
  themeColor: '#0f766e',
  navigationColor: '#0f172a',
  backgroundColor: '#fbf7ef',
  shortcuts: [
    {
      name: 'Play',
      shortName: 'Play',
      url: startUrl,
    },
  ],
  signing: {
    status: signingReady ? 'fingerprint-configured' : 'blocked-until-keystore-exists',
    sha256CertFingerprint: certificateFingerprint ?? null,
  },
  assetLinks: {
    status: assetLinksReady ? 'ready' : 'template-only',
    hostedPath: '/.well-known/assetlinks.json',
    templatePath: 'native/android/assetlinks.template.json',
  },
  storeListing: {
    appName: storePackage.storeListing?.appName,
    shortDescription: storePackage.storeListing?.shortDescription,
    screenshotAssets: storePackage.storeListing?.screenshotAssets ?? [],
    iconAssets: iconAssets.storeIcons ?? [],
  },
}

const bubblewrapConfig = {
  generatedAt: new Date().toISOString(),
  source: 'Autonomous Game Lab native packager',
  status,
  initCommand: realHostReady
    ? `npx @bubblewrap/cli init --manifest https://${host}/manifest.webmanifest`
    : 'npx @bubblewrap/cli init --manifest https://YOUR_HOST/manifest.webmanifest',
  buildCommand: 'npx @bubblewrap/cli build',
  validateCommand: 'npx @bubblewrap/cli validate',
  packageId: packageName,
  host,
  startUrl,
  signing: twaManifest.signing,
  assetLinks: twaManifest.assetLinks,
}

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  platform: 'android-trusted-web-activity',
  costGate: {
    googlePlayOneTimeUsd: gates.googlePlay.oneTimeCostUsd,
    spendAllowed: false,
  },
  packageName,
  host,
  publicOrigin: realHostReady ? `https://${host}` : null,
  startUrl,
  launcherName,
  handoff: {
    directory: 'native/android',
    twaManifestPath: 'native/android/twa-manifest.json',
    bubblewrapConfigPath: 'native/android/bubblewrap.config.json',
    assetLinksTemplatePath: 'native/android/assetlinks.template.json',
    publicAssetLinksPath: assetLinksReady ? 'public/.well-known/assetlinks.json' : null,
  },
  signing: {
    status: signingReady ? 'fingerprint-configured' : 'missing-fingerprint',
    sourceStatus: androidSigning.status,
    keyAlias: androidSigning.signing?.keyAlias ?? null,
    sha256CertFingerprint: certificateFingerprint ?? null,
    localSecretsConfigured: androidSigning.ciSecrets?.configuredLocally === true,
  },
  assetLinks: {
    status: assetLinksReady ? 'ready' : 'template-only',
    template: assetLinks,
    publicGenerated: assetLinksReady,
  },
  icons: {
    status: iconAssets.status,
    storeIcons: iconAssets.storeIcons ?? [],
    manifestIcons: iconAssets.manifestIcons ?? [],
  },
  checks: [
    {
      id: 'production-host',
      status: realHostReady ? 'pass' : 'blocker',
      detail: realHostReady ? `Host is ${host}.` : 'Production host is not configured.',
    },
    {
      id: 'hosted-privacy',
      status: hostedPrivacyReady ? 'pass' : 'blocker',
      detail: `Privacy URL status is ${storePackage.privacyPolicy?.productionUrlStatus ?? 'missing'}.`,
    },
    {
      id: 'android-signing-fingerprint',
      status: signingReady ? 'pass' : 'blocker',
      detail: signingReady ? 'SHA-256 certificate fingerprint is configured.' : 'Signing fingerprint is missing.',
    },
    {
      id: 'store-screenshots',
      status: screenshotsReady ? 'pass' : 'blocker',
      detail: `${storeAssets.screenshots?.length ?? 0} screenshot asset(s) available.`,
    },
    {
      id: 'icon-assets',
      status: iconsReady ? 'pass' : 'blocker',
      detail: `${iconAssets.assets?.length ?? 0} icon asset(s) available.`,
    },
    {
      id: 'google-play-account',
      status: googlePlayConnected ? 'pass' : 'blocker',
      detail: googlePlayConnected ? 'Google Play account is connected.' : 'Google Play developer account is not connected.',
    },
  ],
  blockers,
  commands: {
    init: bubblewrapConfig.initCommand,
    validate: bubblewrapConfig.validateCommand,
    build: bubblewrapConfig.buildCommand,
  },
}

const readme = [
  '# Android TWA Handoff',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  '',
  '## Files',
  '',
  '- `twa-manifest.json`: deterministic app metadata for the Android Trusted Web Activity build.',
  '- `bubblewrap.config.json`: commands and resolved package/host/signing state.',
  '- `assetlinks.template.json`: Digital Asset Links template for the production host.',
  '- `ops/android/signing/release.keystore`: local ignored signing material generated by `npm run autonomous:android-signing` when available.',
  '',
  '## Signing',
  '',
  `- Status: ${payload.signing.status}`,
  `- Source: ${payload.signing.sourceStatus ?? 'missing'}`,
  `- Fingerprint: ${payload.signing.sha256CertFingerprint ?? 'missing'}`,
  `- Local CI secrets prepared: ${payload.signing.localSecretsConfigured}`,
  '- Secret files stay git-ignored; committed artifacts contain only the public certificate fingerprint and redacted readiness state.',
  '',
  '## Commands',
  '',
  `- Init: \`${payload.commands.init}\``,
  `- Validate: \`${payload.commands.validate}\``,
  `- Build: \`${payload.commands.build}\``,
  '',
  '## Blockers',
  '',
  ...(payload.blockers.length ? payload.blockers.map((blocker) => `- ${blocker}`) : ['- none']),
  '',
].join('\n')

const report = [
  '# Native Package',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Platform: ${payload.platform}`,
  `Package: ${payload.packageName}`,
  `Host: ${payload.host}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Handoff',
  '',
  `- TWA manifest: ${payload.handoff.twaManifestPath}`,
  `- Bubblewrap config: ${payload.handoff.bubblewrapConfigPath}`,
  `- Asset links template: ${payload.handoff.assetLinksTemplatePath}`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(androidDir, { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const nativePackage = ${JSON.stringify(payload, null, 2)} as const\n\nexport type NativePackage = typeof nativePackage\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(twaManifestPath, JSON.stringify(twaManifest, null, 2) + '\n')
await writeFile(bubblewrapConfigPath, JSON.stringify(bubblewrapConfig, null, 2) + '\n')
await writeFile(assetLinksTemplatePath, JSON.stringify(assetLinks, null, 2) + '\n')
await writeFile(androidReadmePath, readme)

if (assetLinksReady) {
  await mkdir(path.dirname(publicAssetLinksPath), { recursive: true })
  await writeFile(publicAssetLinksPath, JSON.stringify(assetLinks, null, 2) + '\n')
}

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, twaManifestPath)}`)
console.log(`Wrote ${path.relative(root, bubblewrapConfigPath)}`)
console.log(`Wrote ${path.relative(root, assetLinksTemplatePath)}`)
console.log(`Wrote ${path.relative(root, androidReadmePath)}`)

if (assetLinksReady) {
  console.log(`Wrote ${path.relative(root, publicAssetLinksPath)}`)
}
