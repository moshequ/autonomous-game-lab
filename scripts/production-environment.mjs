import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const outputJsonPath = path.join(root, 'data', 'production-environment.json')
const outputTsPath = path.join(root, 'src', 'data', 'productionEnvironment.ts')
const reportPath = path.join(root, 'reports', 'production-environment-latest.md')
const envExamplePath = path.join(root, 'ops', 'production.env.example')

const boolFromEnv = (name) => ['1', 'true', 'yes'].includes(String(process.env[name] ?? '').toLowerCase())

const first = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() ?? null

const normalizeOrigin = (value) => {
  const raw = first(value)

  if (!raw) {
    return null
  }

  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`

  try {
    const url = new URL(withProtocol)
    url.pathname = ''
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

const hostFromOrigin = (origin) => {
  if (!origin) {
    return null
  }

  try {
    return new URL(origin).host
  } catch {
    return null
  }
}

const looksProductionHost = (origin) => {
  const host = hostFromOrigin(origin)
  return Boolean(origin?.startsWith('https://') && host?.includes('.') && !host.includes('example.com'))
}

const validEmail = (value) => Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.includes('example.'))

const publicOrigin = normalizeOrigin(
  first(process.env.AGL_PUBLIC_ORIGIN, process.env.VITE_PUBLIC_ORIGIN, process.env.PUBLIC_SITE_URL, process.env.AGL_PUBLIC_HOST),
)
const publicHost = hostFromOrigin(publicOrigin)
const publicOriginReady = looksProductionHost(publicOrigin)
const supportEmail = first(process.env.AGL_SUPPORT_EMAIL, process.env.SUPPORT_EMAIL)
const supportEmailReady = validEmail(supportEmail)
const basePath = first(process.env.VITE_BASE_PATH) ?? '/'
const androidPackageName = first(process.env.AGL_ANDROID_PACKAGE_NAME) ?? 'app.autonomousgamelab.portal'
const androidSha256 = first(process.env.AGL_ANDROID_SHA256_CERT_FINGERPRINT)
const androidSigningReady = Boolean(androidSha256)
const googlePlayConnected =
  boolFromEnv('AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED') || Boolean(first(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON))
const appleConnected = boolFromEnv('AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED')
const adsenseClientId = first(process.env.VITE_ADSENSE_CLIENT_ID, process.env.ADSENSE_CLIENT_ID)
const adsenseRewardedSlotId = first(
  process.env.VITE_ADSENSE_REWARDED_SLOT_ID,
  process.env.ADSENSE_REWARDED_SLOT_ID,
)
const admobPublisherId = first(process.env.ADMOB_PUBLISHER_ID)
const webAdConfigured = Boolean(adsenseClientId && adsenseRewardedSlotId)
const appAdConfigured = Boolean(admobPublisherId)
const browserPosthogConfigured = Boolean(first(process.env.VITE_POSTHOG_KEY))
const serverPosthogConfigured = Boolean(first(process.env.POSTHOG_PROJECT_ID) && first(process.env.POSTHOG_PERSONAL_API_KEY))
const posthogHost = first(process.env.POSTHOG_HOST, process.env.VITE_POSTHOG_HOST) ?? 'https://us.posthog.com'
const eventCollectorUrl = first(process.env.VITE_EVENT_COLLECTOR_URL, process.env.AGL_EVENT_COLLECTOR_URL)
const eventCollectorExportUrl = first(process.env.AGL_EVENT_COLLECTOR_EXPORT_URL)
const eventCollectorWriteTokenConfigured = Boolean(first(process.env.VITE_EVENT_COLLECTOR_WRITE_TOKEN))
const eventCollectorAdminConfigured = Boolean(first(process.env.AGL_EVENT_COLLECTOR_ADMIN_TOKEN))
const browserCollectorConfigured = Boolean(eventCollectorUrl)
const serverCollectorConfigured = Boolean(eventCollectorExportUrl && eventCollectorAdminConfigured)
const browserAnalyticsConfigured = browserPosthogConfigured || browserCollectorConfigured
const serverAnalyticsConfigured = serverPosthogConfigured || serverCollectorConfigured
const privacyUrl = publicOriginReady ? `${publicOrigin}/privacy.html` : null
const supportUrl = publicOriginReady ? `${publicOrigin}/support.html` : null

const blockers = [
  ...(publicOriginReady ? [] : ['Set AGL_PUBLIC_ORIGIN or PUBLIC_SITE_URL to a real HTTPS production origin.']),
  ...(supportEmailReady ? [] : ['Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.']),
  ...(browserAnalyticsConfigured
    ? []
    : ['Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.']),
  ...(serverAnalyticsConfigured
    ? []
    : [
        'Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.',
      ]),
  ...(webAdConfigured || appAdConfigured
    ? []
    : [
        'Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.',
      ]),
  ...(androidSigningReady ? [] : ['Set AGL_ANDROID_SHA256_CERT_FINGERPRINT after Android signing exists.']),
  ...(googlePlayConnected ? [] : ['Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.']),
  ...(appleConnected ? [] : ['Connect Apple Developer account only after revenue justifies iOS spend.']),
]

const payload = {
  generatedAt: new Date().toISOString(),
  status: publicOriginReady && serverAnalyticsConfigured ? 'production-env-partial' : 'production-env-missing',
  publicOrigin: {
    origin: publicOrigin,
    host: publicHost,
    basePath,
    status: publicOriginReady ? 'configured' : 'missing',
    privacyUrl,
    supportUrl,
  },
  support: {
    email: supportEmailReady ? supportEmail : null,
    status: supportEmailReady ? 'configured' : 'missing-production-address',
  },
  analytics: {
    browserPosthogConfigured,
    serverPosthogConfigured,
    eventCollector: {
      browserConfigured: browserCollectorConfigured,
      serverExportConfigured: serverCollectorConfigured,
      url: eventCollectorUrl ?? null,
      exportUrl: eventCollectorExportUrl ?? null,
      writeTokenConfigured: eventCollectorWriteTokenConfigured,
      adminTokenConfigured: eventCollectorAdminConfigured,
      provider: 'cloudflare-worker-r2',
    },
    host: posthogHost,
    status: browserAnalyticsConfigured && serverAnalyticsConfigured ? 'configured' : 'local-or-fixture',
  },
  monetization: {
    adNetworkProvider: first(process.env.AD_NETWORK_PROVIDER) ?? 'google-adsense-web-first',
    webAdProvider: 'google-adsense',
    adsenseClientConfigured: Boolean(adsenseClientId),
    adsenseRewardedSlotConfigured: Boolean(adsenseRewardedSlotId),
    adsenseClientId: adsenseClientId ?? null,
    adsenseRewardedSlotId: adsenseRewardedSlotId ?? null,
    appAdProvider: 'google-admob',
    admobPublisherConfigured: appAdConfigured,
    admobPublisherId: admobPublisherId ?? null,
    status: webAdConfigured || appAdConfigured ? 'configured' : 'disabled',
  },
  android: {
    packageName: androidPackageName,
    signingFingerprintConfigured: androidSigningReady,
    sha256CertFingerprint: androidSha256 ?? null,
    googlePlayAccountConnected: googlePlayConnected,
    status:
      publicOriginReady && androidSigningReady && googlePlayConnected
        ? 'ready-for-native-build'
        : 'blocked-needs-host-signing-account',
  },
  ios: {
    appleDeveloperAccountConnected: appleConnected,
    status: appleConnected ? 'connected' : 'deferred',
  },
  blockers,
  requiredEnv: [
    {
      name: 'AGL_PUBLIC_ORIGIN',
      purpose: 'HTTPS origin used for hosted privacy/support URLs, sitemap, TWA host, and Digital Asset Links.',
      configured: publicOriginReady,
    },
    {
      name: 'AGL_SUPPORT_EMAIL',
      purpose: 'Production support contact for privacy and store listings.',
      configured: supportEmailReady,
    },
    {
      name: 'VITE_POSTHOG_KEY',
      purpose: 'Optional browser-side PostHog analytics forwarding.',
      configured: browserPosthogConfigured,
    },
    {
      name: 'POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY',
      purpose: 'Optional autonomous production analytics and experiment result rollups from PostHog.',
      configured: serverPosthogConfigured,
    },
    {
      name: 'VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL',
      purpose: 'Optional zero-cost Worker/R2 event collector for browser analytics and autonomous rollups.',
      configured: browserCollectorConfigured && serverCollectorConfigured,
    },
    {
      name: 'VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID',
      purpose: 'Web/PWA rewarded or display-ad test configuration after product and privacy gates pass.',
      configured: webAdConfigured,
    },
    {
      name: 'ADMOB_PUBLISHER_ID',
      purpose: 'Native app seller line for app-ads.txt and Android rewarded tests after app-store gates pass.',
      configured: appAdConfigured,
    },
    {
      name: 'AGL_ANDROID_SHA256_CERT_FINGERPRINT',
      purpose: 'Android signing fingerprint for Digital Asset Links.',
      configured: androidSigningReady,
    },
    {
      name: 'AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED',
      purpose: 'Allows native packaging gates to treat Play Console access as connected.',
      configured: googlePlayConnected,
    },
  ],
}

const report = [
  '# Production Environment',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Public origin: ${payload.publicOrigin.origin ?? 'missing'}`,
  `Analytics: ${payload.analytics.status}`,
  `Monetization: ${payload.monetization.status}`,
  `Android: ${payload.android.status}`,
  '',
  '## Required Environment',
  '',
  ...payload.requiredEnv.map((item) => `- ${item.configured ? 'configured' : 'missing'}: ${item.name} - ${item.purpose}`),
  '',
  '## Blockers',
  '',
  ...(payload.blockers.length ? payload.blockers.map((blocker) => `- ${blocker}`) : ['- none']),
  '',
]

const envExample = [
  '# Autonomous Game Lab production environment template',
  '# Fill these in your host/CI environment; do not commit real secrets.',
  '',
  '# Public web/PWA origin used by privacy/support URLs, sitemap, and Android TWA.',
  'AGL_PUBLIC_ORIGIN=https://your-domain.example',
  'VITE_PUBLIC_ORIGIN=https://your-domain.example',
  'PUBLIC_SITE_URL=https://your-domain.example',
  'VITE_BASE_PATH=/',
  '',
  '# Public support contact for privacy policy and store listings.',
  'AGL_SUPPORT_EMAIL=support@your-domain.example',
  '',
  '# Optional browser analytics forwarding.',
  'VITE_POSTHOG_KEY=phc_your_public_project_key',
  'VITE_POSTHOG_HOST=https://us.i.posthog.com',
  '',
  '# Optional autonomous production rollups from PostHog.',
  'POSTHOG_PROJECT_ID=your_project_id',
  'POSTHOG_PERSONAL_API_KEY=phx_your_personal_api_key',
  'POSTHOG_HOST=https://us.posthog.com',
  '',
  '# Optional zero-cost event collector path using ops/cloudflare/event-collector-worker.mjs.',
  'VITE_EVENT_COLLECTOR_URL=https://events.your-domain.example/events',
  'VITE_EVENT_COLLECTOR_WRITE_TOKEN=public-write-token',
  'AGL_EVENT_COLLECTOR_EXPORT_URL=https://events.your-domain.example/events/export?limit=1000',
  'AGL_EVENT_COLLECTOR_ADMIN_TOKEN=admin-export-token',
  '',
  '# Optional monetization, only used after product gates pass.',
  'VITE_ADSENSE_CLIENT_ID=ca-pub-your-web-client-id',
  'VITE_ADSENSE_REWARDED_SLOT_ID=your_rewarded_or_display_slot_id',
  'ADMOB_PUBLISHER_ID=pub-your-publisher-id',
  'AD_NETWORK_PROVIDER=google-adsense-web-first',
  '',
  '# Android Trusted Web Activity packaging.',
  'AGL_ANDROID_PACKAGE_NAME=app.autonomousgamelab.portal',
  'AGL_ANDROID_SHA256_CERT_FINGERPRINT=AA:BB:CC:DD:...',
  'AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=false',
  '',
  '# iOS remains deferred until revenue justifies annual account cost.',
  'AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED=false',
  '',
].join('\n')

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(envExamplePath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionEnvironment = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductionEnvironment = typeof productionEnvironment\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(envExamplePath, envExample)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, envExamplePath)}`)
