import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const outputJsonPath = path.join(root, 'data', 'production-environment.json')
const outputTsPath = path.join(root, 'src', 'data', 'productionEnvironment.ts')
const reportPath = path.join(root, 'reports', 'production-environment-latest.md')
const envExamplePath = path.join(root, 'ops', 'production.env.example')
const repositoryReadinessPath = path.join(root, 'data', 'repository-readiness.json')

const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const boolFromEnv = (name) => ['1', 'true', 'yes'].includes(String(process.env[name] ?? '').toLowerCase())

const first = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() ?? null
const configured = (value) => typeof value === 'string' && value.trim().length > 0

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

const androidSigning = await readOptionalJson(path.join(root, 'data', 'android-signing.json'), {
  status: 'missing',
  signing: {},
})
const repositoryReadiness = await readOptionalJson(repositoryReadinessPath, {
  status: 'missing',
  repository: {},
})
const packageJson = await readOptionalJson(path.join(root, 'package.json'), {
  name: 'autonomous-game-lab',
})

const repositoryNameFromPackage = (packageName) => {
  const baseName = String(packageName || 'autonomous-game-lab').split('/').pop()
  const normalized = baseName.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')

  return normalized || 'autonomous-game-lab'
}
const cleanGithubOwner = (value) => {
  const owner = String(value ?? '').trim()

  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) ? owner : null
}
const cleanGithubRepositoryName = (value) => {
  const repository = String(value ?? '').trim()

  return /^[A-Za-z0-9._-]+$/.test(repository) ? repository : null
}
const repositoryFromOwnerHint = (owner, repositoryName) => {
  const cleanOwner = cleanGithubOwner(owner)
  const cleanRepository = cleanGithubRepositoryName(repositoryName)

  return cleanOwner && cleanRepository ? `${cleanOwner}/${cleanRepository}` : null
}
const parseGithubRepository = (value) => {
  const raw = String(value ?? '').trim()
  const match = raw.match(/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)$/)

  return match ? { owner: match[1], repository: match[2], target: `${match[1]}/${match[2]}` } : null
}
const pagesBasePathFor = ({ owner, repository }) =>
  repository.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${repository}/`
const pagesOriginFor = ({ owner, repository }) =>
  repository.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? `https://${owner}.github.io`
    : `https://${owner}.github.io/${repository}`
const inferredRepositoryName = repositoryNameFromPackage(packageJson.name)
const ownerHint = cleanGithubOwner(
  process.env.AGL_GITHUB_OWNER ?? process.env.GITHUB_REPOSITORY_OWNER ?? process.env.GITHUB_OWNER,
)
const ownerHintRepository = repositoryFromOwnerHint(ownerHint, inferredRepositoryName)
const repositoryEnvTarget = first(process.env.GITHUB_REPOSITORY, process.env.GH_REPO)
const repositoryTarget =
  repositoryEnvTarget ?? repositoryReadiness.repository?.target ?? ownerHintRepository ?? null
const repositoryTargetSource = repositoryEnvTarget
  ? 'environment'
  : repositoryReadiness.repository?.target
    ? (repositoryReadiness.repository?.source ?? 'repository-readiness')
    : ownerHintRepository
      ? 'owner-hint-and-package-name'
      : 'missing'
const parsedRepositoryTarget = parseGithubRepository(repositoryTarget)
const githubPagesCandidate = parsedRepositoryTarget
  ? {
      repository: parsedRepositoryTarget.target,
      source: repositoryTargetSource,
      origin: pagesOriginFor(parsedRepositoryTarget),
      host: `${parsedRepositoryTarget.owner}.github.io`,
      basePath: pagesBasePathFor(parsedRepositoryTarget),
      privacyUrl: `${pagesOriginFor(parsedRepositoryTarget)}/privacy.html`,
      supportUrl: `${pagesOriginFor(parsedRepositoryTarget)}/support.html`,
      costUsd: 0,
    }
  : null
const explicitPublicOrigin = normalizeOrigin(
  first(process.env.AGL_PUBLIC_ORIGIN, process.env.VITE_PUBLIC_ORIGIN, process.env.PUBLIC_SITE_URL, process.env.AGL_PUBLIC_HOST),
)
const publicOriginSource = explicitPublicOrigin ? 'environment' : githubPagesCandidate ? 'github-pages-target' : 'missing'
const publicOrigin = explicitPublicOrigin ?? githubPagesCandidate?.origin ?? null
const publicHost = hostFromOrigin(publicOrigin)
const publicOriginReady = looksProductionHost(publicOrigin)
const supportEmail = first(process.env.AGL_SUPPORT_EMAIL, process.env.SUPPORT_EMAIL)
const supportEmailReady = validEmail(supportEmail)
const basePath = first(process.env.VITE_BASE_PATH) ?? githubPagesCandidate?.basePath ?? '/'
const androidPackageName = first(process.env.AGL_ANDROID_PACKAGE_NAME) ?? 'app.autonomousgamelab.portal'
const androidSha256 = first(
  process.env.AGL_ANDROID_SHA256_CERT_FINGERPRINT,
  androidSigning.signing?.sha256CertFingerprint,
)
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
  envFiles: localEnv,
  publicOrigin: {
    origin: publicOrigin,
    host: publicHost,
    basePath,
    source: publicOriginSource,
    explicitOriginConfigured: Boolean(explicitPublicOrigin),
    githubPagesCandidate,
    status: publicOriginReady
      ? explicitPublicOrigin
        ? 'configured'
        : 'inferred-github-pages'
      : 'missing',
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
      purpose:
        'HTTPS origin used for hosted privacy/support URLs, sitemap, TWA host, and Digital Asset Links. If no custom origin is set, the setup helper can infer the zero-cost GitHub Pages origin from the repository target.',
      configured: publicOriginReady,
      source: publicOriginSource,
      fallback: githubPagesCandidate ? 'github-pages-target' : null,
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
  '## Local Env Files',
  '',
  ...(payload.envFiles.loadedFiles.length
    ? payload.envFiles.loadedFiles.map((file) => `- ${file.path}: ${file.keys.join(', ') || 'no keys'}`)
    : ['- none loaded']),
  `- shell env precedence: ${payload.envFiles.controls.shellEnvPrecedence}`,
  `- protected mutation keys require shell env: ${payload.envFiles.controls.protectedMutationKeysRequireShellEnv}`,
  `- values redacted: ${payload.envFiles.controls.noSecretValuesInReports}`,
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
  '# GitHub repository target and guarded zero-spend setup controls.',
  '# Use either GITHUB_REPOSITORY/GH_REPO, an origin remote, or AGL_GITHUB_OWNER for inference.',
  'GITHUB_REPOSITORY=owner/autonomous-game-lab',
  'GH_REPO=owner/autonomous-game-lab',
  'AGL_GITHUB_OWNER=owner',
  'AGL_GITHUB_VISIBILITY=private',
  'AGL_DEFAULT_BRANCH=main',
  'AGL_INFER_GITHUB_PAGES_ORIGIN=1',
  'AGL_SYNC_PAGES_SETTINGS=1',
  'AGL_ALLOW_GH_INFER_REPOSITORY=1',
  'AGL_ALLOW_LOCAL_GIT_BOOTSTRAP=0',
  'AGL_ALLOW_REPOSITORY_BOOTSTRAP=0',
  'AGL_ALLOW_INITIAL_COMMIT=0',
  'AGL_ALLOW_SNAPSHOT_COMMIT=0',
  'AGL_ALLOW_ORIGIN_REMOTE=0',
  'AGL_ALLOW_GITHUB_REPO_CREATE=0',
  'AGL_ALLOW_PUSH=0',
  'RUN_WORKFLOWS=0',
  'ALLOW_ANDROID_RELEASE_WORKFLOW=0',
  'GH_TOKEN=replace_with_github_cli_token_when_needed',
  'GITHUB_TOKEN=replace_with_github_actions_or_cli_token_when_needed',
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
  'CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id',
  'CLOUDFLARE_API_TOKEN=replace_with_cloudflare_api_token',
  'AGL_EVENT_COLLECTOR_R2_BUCKET=autonomous-game-lab-events',
  'AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS=https://your-domain.example',
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
  'AGL_ANDROID_KEYSTORE_BASE64=replace_with_base64_encoded_upload_keystore',
  'AGL_ANDROID_KEYSTORE_PASSWORD=replace_with_upload_keystore_password',
  'AGL_ANDROID_KEY_ALIAS=upload',
  'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=replace_with_google_play_service_account_json',
  'AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=false',
  '',
  '# iOS remains deferred until revenue justifies annual account cost.',
  'AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED=false',
  '',
  '# Optional autonomous persistence after CI reproduces the daily loop and browser tests.',
  'AGL_AUTONOMOUS_SELF_UPDATE=0',
  'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=0',
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
