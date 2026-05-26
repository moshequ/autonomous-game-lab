import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const publicDir = path.join(root, 'public')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'production-blocker-handoff.json')
const outputTsPath = path.join(root, 'src', 'data', 'productionBlockerHandoff.ts')
const reportPath = path.join(reportsDir, 'production-blocker-handoff-latest.md')
const ownerUnlockJsonPath = path.join(dataDir, 'owner-unlock-brief.json')
const ownerUnlockPublicJsonPath = path.join(publicDir, 'owner-unlock-brief.json')
const ownerUnlockPublicHtmlPath = path.join(publicDir, 'owner-unlock.html')
const ownerUnlockReportPath = path.join(reportsDir, 'owner-unlock-brief-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const productionEnvironment = await readJson(path.join(dataDir, 'production-environment.json'))
const productionBootstrap = await readJson(path.join(dataDir, 'production-bootstrap.json'))
const objectiveAudit = await readJson(path.join(dataDir, 'objective-audit.json'))
const autonomousOwnerLoop = await readJson(path.join(dataDir, 'autonomous-owner-loop.json'))
const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))
const storeCompliance = await readJson(path.join(dataDir, 'store-compliance.json'))
const androidRelease = await readJson(path.join(dataDir, 'android-release.json'))
const iosRelease = await readJson(path.join(dataDir, 'ios-release.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const supportChannel = await readOptionalJson(path.join(dataDir, 'support-channel.json'), {
  status: 'missing',
  repository: {},
  controls: {},
  links: {},
})
const storeReadiness = await readOptionalJson(path.join(dataDir, 'store-readiness.json'), {
  status: 'missing',
  publicRoutes: {
    storeReadiness: '/store-readiness.html',
    storeReadinessJson: '/store-readiness.json',
  },
  storeOwnerUnlockSummary: null,
  storeOwnerUnlocks: [],
})
const postDeployArtifactSync = await readOptionalJson(path.join(dataDir, 'post-deploy-artifact-sync.json'), {
  status: 'missing',
  live: {},
})

const unique = (items) => [...new Set(items.filter(Boolean))]
const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
const setupAnalyticsLocalEnvTemplateCommand = './ops/github/setup-production.sh --analytics-input-template'
const writeAnalyticsLocalEnvTemplateCommand = 'node scripts/owner-unlock-preflight.mjs --analytics-input-template'
const envByName = new Map((productionEnvironment.requiredEnv ?? []).map((item) => [item.name, item]))
const secretByName = new Map((productionBootstrap.requiredSecrets ?? []).map((item) => [item.repositorySecret, item]))
const requiredEnv = (names) => names.map((name) => envByName.get(name)).filter(Boolean)
const requiredSecrets = (names) => names.map((name) => secretByName.get(name)).filter(Boolean)
const sanitizeRequiredEnv = (items) =>
  items.map((item) => ({
    name: item.name,
    purpose: item.purpose,
    configured: item.configured === true,
    source: item.source ?? 'missing',
    fallback: item.fallback ?? null,
  }))
const sanitizeRequiredSecrets = (items) =>
  items.map((item) => ({
    id: item.id,
    repositorySecret: item.repositorySecret,
    envName: item.envName,
    configured: item.configured === true,
    valueSource: item.valueSource ?? 'missing',
    command: item.command,
  }))
const allBlockers = unique([
  ...(objectiveAudit.blockers?.external ?? []),
  ...(objectiveAudit.blockers?.product ?? []),
  ...(productionEnvironment.blockers ?? []),
  ...(productionBootstrap.externalBlockers ?? []).map((item) => item.blocker),
  ...(monetization.blockers ?? []),
  ...(storeCompliance.blockers ?? []),
  ...(androidRelease.blockers ?? []),
  ...(iosRelease.blockers ?? []),
])
const blockersMatching = (patterns) => allBlockers.filter((blocker) => patterns.some((pattern) => pattern.test(blocker)))
const envConfigured = (name) => envByName.get(name)?.configured === true
const anyEnvConfigured = (names) => names.some(envConfigured)
const secretsConfigured = (names) => names.every((name) => secretByName.get(name)?.configured === true)
const productGateBlockers = blockersMatching([
  /first-game completion/i,
  /replay rate/i,
  /d1 retention/i,
  /product gates/i,
])
const publicSupportChannelReady =
  ['support-channel-ready', 'support-channel-planned'].includes(supportChannel.status) &&
  supportChannel.provider === 'github-issues' &&
  supportChannel.repository?.publicIssuesReady === true &&
  supportChannel.controls?.zeroPaidSpend === true &&
  supportChannel.controls?.playerInitiatedOnly === true &&
  typeof supportChannel.links?.supportUrl === 'string'
const storeSupportEmailNeededNow =
  storeCompliance.status === 'ready-for-store-review' || unitEconomics.controls?.storeSpendAllowed === true
const variableByRepositoryName = new Map(
  (productionBootstrap.requiredVariables ?? []).map((item) => [item.repositoryVariable, item]),
)
const secretByRepositoryName = new Map(
  (productionBootstrap.requiredSecrets ?? []).map((item) => [item.repositorySecret, item]),
)
const sanitizeConfigAction = (item) =>
  item
    ? {
        id: item.id,
        repositoryName: item.repositoryVariable ?? item.repositorySecret,
        envName: item.envName,
        configured: item.configured === true,
        valueSource: item.valueSource ?? 'missing',
        command: item.command,
      }
    : null
const configActions = (map, names) => names.map((name) => sanitizeConfigAction(map.get(name))).filter(Boolean)
const countMissingConfigInputs = (items) => (items ?? []).filter((item) => item.configured !== true).length
const withUnlockPathEffort = (unlockPath) => {
  const missingVariableCount = countMissingConfigInputs(unlockPath.requiredVariables)
  const missingSecretCount = countMissingConfigInputs(unlockPath.requiredSecrets)

  return {
    ...unlockPath,
    missingVariableCount,
    missingSecretCount,
    missingInputCount: missingVariableCount + missingSecretCount,
    commandCount: unique(unlockPath.commandSequence ?? []).length,
    validationCommandCount: unique(unlockPath.validationCommands ?? []).length,
  }
}
const compareUnlockPathEffort = (left, right) =>
  left.missingInputCount - right.missingInputCount ||
  left.missingSecretCount - right.missingSecretCount ||
  left.missingVariableCount - right.missingVariableCount ||
  Number(left.ownerInputRequired === true) - Number(right.ownerInputRequired === true) ||
  left.commandCount - right.commandCount ||
  left.validationCommandCount - right.validationCommandCount ||
  left.id.localeCompare(right.id)
const selectLowestInputPath = (paths) => [...(paths ?? [])].sort(compareUnlockPathEffort)[0] ?? null
const describeLowestInputPath = (lowestInputPath, recommendedPath) => {
  if (!lowestInputPath) {
    return null
  }

  if (lowestInputPath.id === recommendedPath?.id) {
    return 'The recommended unlock path is also the lowest-input path for the current repository state.'
  }

  return `${lowestInputPath.title} currently needs ${lowestInputPath.missingInputCount} missing input(s), compared with ${recommendedPath?.missingInputCount ?? 'unknown'} for the recommended path.`
}
const firstPartyCollectorReady = envConfigured('VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL')
const posthogBrowserReady = envConfigured('VITE_POSTHOG_KEY')
const analyticsRecommendedPathId = firstPartyCollectorReady
  ? 'first-party-collector'
  : posthogBrowserReady
    ? 'posthog-browser'
    : 'first-party-collector'
const analyticsUnlockPaths = [
  {
    id: 'first-party-collector',
    title: 'First-party event collector',
    status: firstPartyCollectorReady ? 'configured' : 'needs-variables-and-secrets',
    costMode: 'zero-spend-use-existing-cloudflare-free-tier',
    ownerInputRequired: !firstPartyCollectorReady,
    requiredVariables: configActions(variableByRepositoryName, [
      'CLOUDFLARE_ACCOUNT_ID',
      'AGL_EVENT_COLLECTOR_R2_BUCKET',
      'AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS',
      'VITE_EVENT_COLLECTOR_URL',
      'AGL_EVENT_COLLECTOR_EXPORT_URL',
    ]),
    requiredSecrets: configActions(secretByRepositoryName, [
      'CLOUDFLARE_API_TOKEN',
      'VITE_EVENT_COLLECTOR_WRITE_TOKEN',
      'AGL_EVENT_COLLECTOR_ADMIN_TOKEN',
    ]),
    commandSequence: [
      'npm run autonomous:event-collector-smoke',
      'npm run autonomous:collector-deploy-plan',
      './ops/github/setup-production.sh',
      'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
      'npm run autonomous:readiness',
    ],
    validationCommands: [
      'npm run autonomous:event-collector-smoke',
      'npm run autonomous:collector-deploy-plan',
      'npm run autonomous:readiness',
      'npm run test:e2e',
    ],
    unlocks: [
      'Browser events can forward to a first-party collector without PostHog.',
      'Autonomous rollups can import collector exports after the admin token is configured.',
    ],
  },
  {
    id: 'posthog-browser',
    title: 'PostHog browser capture',
    status: posthogBrowserReady ? 'configured' : 'needs-public-project-key',
    costMode: 'zero-spend-use-existing-posthog-free-project',
    ownerInputRequired: !posthogBrowserReady,
    requiredVariables: configActions(variableByRepositoryName, ['VITE_POSTHOG_KEY', 'VITE_POSTHOG_HOST']),
    requiredSecrets: [],
    commandSequence: [
      setupAnalyticsLocalEnvTemplateCommand,
      './ops/github/setup-production.sh',
      'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
      'AGL_PRODUCTION_EVENT_EXPORT_FILES=/absolute/path/to/export.json npm run autonomous:collect-production-export',
      'npm run autonomous:readiness',
    ],
    validationCommands: ['npm run autonomous:readiness', 'npm run test:e2e'],
    unlocks: [
      'Browser events can forward to an existing PostHog project.',
      'Owner-downloaded PostHog or collector JSON exports can be imported explicitly without server export credentials.',
      'Autonomous rollups still require a server-side export credential before scheduled production learning.',
    ],
  },
].map(withUnlockPathEffort)
const analyticsRecommendedPath =
  analyticsUnlockPaths.find((unlockPath) => unlockPath.id === analyticsRecommendedPathId) ?? analyticsUnlockPaths[0]
const analyticsLowestInputPath = selectLowestInputPath(analyticsUnlockPaths)
const analyticsUnlockKit = {
  id: 'production-analytics-browser',
  title: 'Browser production analytics unlock kit',
  status: firstPartyCollectorReady || posthogBrowserReady ? 'configured' : 'owner-input-required',
  recommendedPathId: analyticsRecommendedPathId,
  lowestInputPathId: analyticsLowestInputPath?.id ?? null,
  lowestInputPathTitle: analyticsLowestInputPath?.title ?? null,
  lowestInputPathStatus: analyticsLowestInputPath?.status ?? null,
  lowestInputMissingVariableCount: analyticsLowestInputPath?.missingVariableCount ?? 0,
  lowestInputMissingSecretCount: analyticsLowestInputPath?.missingSecretCount ?? 0,
  lowestInputMissingInputCount: analyticsLowestInputPath?.missingInputCount ?? 0,
  lowestInputReason: describeLowestInputPath(analyticsLowestInputPath, analyticsRecommendedPath),
  handoffItemId: 'production-analytics-browser',
  ownerInputRequired: !(firstPartyCollectorReady || posthogBrowserReady),
  setupScript: 'ops/github/setup-production.sh',
  envTemplate: 'ops/production.env.example',
  controls: {
    zeroPaidSpend: true,
    noSecretValues: true,
    noSecretValuesStored: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    githubVariablesOnly: true,
    secretCommandsUseStdin: true,
  },
  paths: analyticsUnlockPaths,
}
const unlockKits = [analyticsUnlockKit].map((kit) => {
  const lowestInputPath = selectLowestInputPath(kit.paths)
  const recommendedPath = kit.paths.find((unlockPath) => unlockPath.id === kit.recommendedPathId) ?? kit.paths[0]

  return {
    ...kit,
    commandCount: unique(kit.paths.flatMap((unlockPath) => unlockPath.commandSequence)).length,
    validationCommandCount: unique(kit.paths.flatMap((unlockPath) => unlockPath.validationCommands)).length,
    missingVariableCount: kit.paths.reduce(
      (sum, unlockPath) => sum + countMissingConfigInputs(unlockPath.requiredVariables),
      0,
    ),
    missingSecretCount: kit.paths.reduce(
      (sum, unlockPath) => sum + countMissingConfigInputs(unlockPath.requiredSecrets),
      0,
    ),
    lowestInputPathId: lowestInputPath?.id ?? null,
    lowestInputPathTitle: lowestInputPath?.title ?? null,
    lowestInputPathStatus: lowestInputPath?.status ?? null,
    lowestInputMissingVariableCount: lowestInputPath?.missingVariableCount ?? 0,
    lowestInputMissingSecretCount: lowestInputPath?.missingSecretCount ?? 0,
    lowestInputMissingInputCount: lowestInputPath?.missingInputCount ?? 0,
    lowestInputReason: describeLowestInputPath(lowestInputPath, recommendedPath),
  }
})
const kitById = new Map(unlockKits.map((kit) => [kit.id, kit]))
const summarizeUnlockKit = (kit) =>
  kit
    ? {
        id: kit.id,
        title: kit.title,
        status: kit.status,
        recommendedPathId: kit.recommendedPathId,
        lowestInputPathId: kit.lowestInputPathId,
        lowestInputPathTitle: kit.lowestInputPathTitle,
        lowestInputPathStatus: kit.lowestInputPathStatus,
        lowestInputMissingVariableCount: kit.lowestInputMissingVariableCount,
        lowestInputMissingSecretCount: kit.lowestInputMissingSecretCount,
        lowestInputMissingInputCount: kit.lowestInputMissingInputCount,
        lowestInputReason: kit.lowestInputReason,
        commandCount: kit.commandCount,
        validationCommandCount: kit.validationCommandCount,
        missingVariableCount: kit.missingVariableCount,
        missingSecretCount: kit.missingSecretCount,
        controls: kit.controls,
        paths: kit.paths.map((unlockPath) => ({
          id: unlockPath.id,
          title: unlockPath.title,
          status: unlockPath.status,
          costMode: unlockPath.costMode,
          ownerInputRequired: unlockPath.ownerInputRequired,
          missingVariableCount: unlockPath.missingVariableCount,
          missingSecretCount: unlockPath.missingSecretCount,
          missingInputCount: unlockPath.missingInputCount,
          commandCount: unlockPath.commandCount,
          validationCommandCount: unlockPath.validationCommandCount,
          requiredVariables: unlockPath.requiredVariables,
          requiredSecrets: unlockPath.requiredSecrets,
          commandSequence: unlockPath.commandSequence,
          validationCommands: unlockPath.validationCommands,
        })),
      }
    : null

const handoffItems = [
  {
    id: 'support-contact',
    title: 'Web support channel and store support email',
    category: 'store-compliance',
    status: envConfigured('AGL_SUPPORT_EMAIL')
      ? 'configured'
      : publicSupportChannelReady && !storeSupportEmailNeededNow
        ? 'web-support-ready-store-email-deferred'
        : 'owner-input-required',
    priority: 100,
    costMode: publicSupportChannelReady ? 'zero-spend-public-issues-ready' : 'zero-spend-if-existing-inbox',
    ownerInputRequired: !envConfigured('AGL_SUPPORT_EMAIL') && (!publicSupportChannelReady || storeSupportEmailNeededNow),
    requiredEnv: requiredEnv(['AGL_SUPPORT_EMAIL']),
    requiredSecrets: [],
    blockers: blockersMatching([/support email/i, /support-contact/i, /support inbox/i]),
    unlocks: publicSupportChannelReady
      ? [
          'Hosted privacy/support pages already route web/PWA support to public GitHub Issues.',
          'A real support email remains deferred until store submission is economically justified.',
        ]
      : ['Hosted privacy/support pages can satisfy public store listing support-contact checks.'],
    afterUnlockCommands: [
      'npm run autonomous:env',
      'npm run autonomous:store-package',
      'npm run autonomous:store-compliance',
      'npm run autonomous:readiness',
    ],
  },
  {
    id: 'production-analytics-browser',
    title: 'Browser production analytics',
    category: 'measurement',
    status: anyEnvConfigured(['VITE_POSTHOG_KEY', 'VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL'])
      ? 'configured'
      : 'owner-input-required',
    priority: 95,
    costMode: 'zero-spend-use-existing-free-tier-or-first-party-collector',
    ownerInputRequired: !anyEnvConfigured(['VITE_POSTHOG_KEY', 'VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL']),
    requiredEnv: requiredEnv(['VITE_POSTHOG_KEY', 'VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL']),
    requiredSecrets: requiredSecrets(['VITE_EVENT_COLLECTOR_WRITE_TOKEN', 'CLOUDFLARE_API_TOKEN']),
    blockers: blockersMatching([/forward browser analytics/i, /collector environment/i]),
    unlocks: ['Real player events can replace fixture/local-only evidence for product gates and retention decisions.'],
    unlockKit: {
      id: analyticsUnlockKit.id,
      recommendedPathId: analyticsUnlockKit.recommendedPathId,
      lowestInputPathId: analyticsUnlockKit.lowestInputPathId,
      lowestInputMissingVariableCount: analyticsUnlockKit.lowestInputMissingVariableCount,
      lowestInputMissingSecretCount: analyticsUnlockKit.lowestInputMissingSecretCount,
      commandCount: kitById.get(analyticsUnlockKit.id)?.commandCount ?? 0,
      validationCommandCount: kitById.get(analyticsUnlockKit.id)?.validationCommandCount ?? 0,
    },
    afterUnlockCommands: [
      'npm run autonomous:env',
      'npm run autonomous:local-event-bridge',
      'npm run autonomous:import-events',
      'npm run autonomous:collect-production-export',
      'npm run autonomous:analytics',
      'npm run autonomous:gate-recovery',
      'npm run autonomous:sample-plan',
    ],
  },
  {
    id: 'autonomous-rollup-credentials',
    title: 'Autonomous production rollups',
    category: 'measurement',
    status:
      secretsConfigured(['AGL_EVENT_COLLECTOR_ADMIN_TOKEN']) &&
      (envConfigured('VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL') ||
        envConfigured('POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY'))
        ? 'configured'
        : 'owner-input-required',
    priority: 90,
    costMode: 'use-existing-collector-or-posthog-project',
    ownerInputRequired: !(
      secretsConfigured(['AGL_EVENT_COLLECTOR_ADMIN_TOKEN']) &&
      (envConfigured('VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL') ||
        envConfigured('POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY'))
    ),
    requiredEnv: requiredEnv([
      'VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL',
      'POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY',
    ]),
    requiredSecrets: requiredSecrets(['AGL_EVENT_COLLECTOR_ADMIN_TOKEN', 'POSTHOG_PERSONAL_API_KEY']),
    blockers: blockersMatching([/autonomous production rollups/i, /server credentials/i, /collector environment/i]),
    unlocks: [
      'Manual production exports can feed rollups immediately.',
      'Scheduled owner loops can evaluate production behavior without manual event exports.',
    ],
    afterUnlockCommands: [
      'npm run autonomous:collect-production-export',
      'npm run autonomous:import-events',
      'npm run autonomous:analytics',
      'npm run autonomous:objective-audit',
    ],
  },
  {
    id: 'product-gate-sample',
    title: 'Product-gate live sample',
    category: 'product-gates',
    status: productGateBlockers.length ? 'needs-live-sample' : 'clear',
    priority: 80,
    costMode: 'zero-paid-acquisition-only',
    ownerInputRequired: false,
    requiredEnv: [],
    requiredSecrets: [],
    blockers: productGateBlockers,
    unlocks: ['Completion, replay, and D1 gates decide whether monetization and store spend can be justified.'],
    afterUnlockCommands: [
      'npm run autonomous:collect-sample-downloads',
      'npm run autonomous:gate-recovery',
      'npm run autonomous:sample-plan',
      'npm run autonomous:monetization',
    ],
  },
  {
    id: 'ad-provider-config',
    title: 'Ad provider configuration',
    category: 'monetization',
    status:
      monetization.revenueEnabled === true &&
      anyEnvConfigured(['VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID', 'ADMOB_PUBLISHER_ID'])
        ? 'configured'
        : 'blocked-by-product-gates',
    priority: 55,
    costMode: 'disabled-until-product-gates-pass',
    ownerInputRequired: monetization.revenueEnabled === true,
    requiredEnv: requiredEnv(['VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID', 'ADMOB_PUBLISHER_ID']),
    requiredSecrets: [],
    blockers: blockersMatching([/ad provider/i, /adsense/i, /admob/i, /revenue tests/i]),
    unlocks: ['Rewarded/display revenue tests can be enabled only after privacy, retention, and provider gates pass.'],
    afterUnlockCommands: ['npm run autonomous:monetization', 'npm run autonomous:unit-economics'],
  },
  {
    id: 'google-play-account',
    title: 'Google Play developer account',
    category: 'app-store',
    status: envConfigured('AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED') ? 'configured' : 'owner-account-required',
    priority: 45,
    costMode: 'paid-store-fee-blocked-by-unit-economics',
    ownerInputRequired: !envConfigured('AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED'),
    requiredEnv: requiredEnv(['AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED']),
    requiredSecrets: [],
    blockers: blockersMatching([/google play account/i, /developer account/i]),
    unlocks: ['Android submission checks can progress after product economics justify store spend.'],
    afterUnlockCommands: ['npm run autonomous:native-package', 'npm run autonomous:android-release-plan'],
  },
  {
    id: 'google-play-service-account',
    title: 'Google Play service account',
    category: 'app-store',
    status: secretByName.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')?.configured ? 'configured' : 'blocked-by-play-account',
    priority: 35,
    costMode: 'requires-existing-play-console-access',
    ownerInputRequired: !secretByName.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')?.configured,
    requiredEnv: [],
    requiredSecrets: requiredSecrets(['GOOGLE_PLAY_SERVICE_ACCOUNT_JSON']),
    blockers: blockersMatching([/play-service-account/i, /service account/i]),
    unlocks: ['CI can prepare upload handoff only after Play Console service-account credentials exist.'],
    afterUnlockCommands: ['npm run autonomous:android-release-plan'],
  },
  {
    id: 'apple-developer-account',
    title: 'Apple Developer account',
    category: 'app-store',
    status: 'deferred-until-ios-payback',
    priority: 10,
    costMode: 'paid-annual-fee-deferred',
    ownerInputRequired: false,
    requiredEnv: [],
    requiredSecrets: [],
    blockers: blockersMatching([/apple developer/i, /ios spend/i]),
    unlocks: ['iOS submission remains intentionally deferred until revenue justifies annual spend.'],
    afterUnlockCommands: ['npm run autonomous:unit-economics', 'npm run autonomous:promote'],
  },
]

const sortedHandoffItems = [...handoffItems].sort((left, right) => right.priority - left.priority)
const missingEnv = (productionEnvironment.requiredEnv ?? []).filter((item) => !item.configured)
const missingSecrets = (productionBootstrap.requiredSecrets ?? []).filter((item) => !item.configured)
const sourceDataHash = hashSourceData({
  productionEnvironment,
  productionBootstrap,
  objectiveAudit,
  autonomousOwnerLoop,
  supportChannel,
  monetization,
  storeCompliance,
  storeReadiness,
  androidRelease,
  iosRelease,
  unitEconomics,
  postDeployArtifactSync,
})
const ownerActionRequired = sortedHandoffItems.filter((item) => item.ownerInputRequired)
const zeroCostFirstActions = sortedHandoffItems.filter((item) => item.costMode.includes('zero') && item.ownerInputRequired)
const status = ownerActionRequired.length ? 'handoff-waiting-on-owner-inputs' : 'handoff-clear'
const statusDetail = ownerActionRequired.length ? 'blocked-external-inputs' : 'clear'
const environmentPlan = sanitizeRequiredEnv(productionEnvironment.requiredEnv ?? [])
const secretPlan = sanitizeRequiredSecrets(productionBootstrap.requiredSecrets ?? [])
const nextUnlockKit = kitById.get(ownerActionRequired[0]?.id) ?? null
const nextOwnerAction = ownerActionRequired[0] ?? null
const recommendedUnlockPath =
  nextUnlockKit?.paths.find((unlockPath) => unlockPath.id === nextUnlockKit.recommendedPathId) ??
  nextUnlockKit?.paths[0] ??
  null
const lowestInputUnlockPath =
  nextUnlockKit?.paths.find((unlockPath) => unlockPath.id === nextUnlockKit.lowestInputPathId) ??
  selectLowestInputPath(nextUnlockKit?.paths) ??
  null
const summarizeConfigInputs = (items) =>
  (items ?? []).map((item) => ({
    repositoryName: item.repositoryName,
    envName: item.envName,
    configured: item.configured === true,
    command: item.command,
  }))
const summarizeOwnerUnlockPath = (unlockPath, recommendedPath) =>
  unlockPath
    ? {
        id: unlockPath.id,
        title: unlockPath.title,
        status: unlockPath.status,
        costMode: unlockPath.costMode,
        ownerInputRequired: unlockPath.ownerInputRequired === true,
        missingVariableCount: unlockPath.missingVariableCount,
        missingSecretCount: unlockPath.missingSecretCount,
        missingInputCount: unlockPath.missingInputCount,
        manualInputReduction:
          typeof recommendedPath?.missingInputCount === 'number'
            ? Math.max(0, recommendedPath.missingInputCount - unlockPath.missingInputCount)
            : null,
        noSecretsRequired: (unlockPath.requiredSecrets ?? []).length === 0,
        missingVariables: summarizeConfigInputs(unlockPath.requiredVariables).filter((item) => !item.configured),
        missingSecrets: summarizeConfigInputs(unlockPath.requiredSecrets).filter((item) => !item.configured),
        configuredVariables: summarizeConfigInputs(unlockPath.requiredVariables).filter((item) => item.configured),
        configuredSecrets: summarizeConfigInputs(unlockPath.requiredSecrets).filter((item) => item.configured),
        setupCommands: unlockPath.commandSequence ?? [],
        validationCommands: unlockPath.validationCommands ?? [],
      }
    : null
const summarizeMinimalInterventionPath = (unlockPath, recommendedPath) => {
  const summarizedPath = summarizeOwnerUnlockPath(unlockPath, recommendedPath)

  return summarizedPath
    ? {
        id: summarizedPath.id,
        title: summarizedPath.title,
        status: summarizedPath.status,
        costMode: summarizedPath.costMode,
        missingInputCount: summarizedPath.missingInputCount,
        missingVariableCount: summarizedPath.missingVariableCount,
        missingSecretCount: summarizedPath.missingSecretCount,
        manualInputReduction: summarizedPath.manualInputReduction,
        noSecretsRequired: summarizedPath.noSecretsRequired,
        reason: describeLowestInputPath(unlockPath, recommendedPath),
        setupCommands: summarizedPath.setupCommands,
        validationCommands: summarizedPath.validationCommands,
      }
    : null
}
const summarizeStoreUnlockInputs = (items) =>
  (items ?? []).map((item) => ({
    type: item.type,
    repositoryName: item.repositoryName,
    envName: item.envName,
    configured: item.configured === true,
    command: item.command,
    purpose: item.purpose,
  }))
const storeOwnerUnlockSummary = storeReadiness.storeOwnerUnlockSummary ?? null
const storeOwnerUnlocks = storeReadiness.storeOwnerUnlocks ?? []
const storeOwnerNextUnlock =
  storeOwnerUnlocks.find((unlock) => unlock.id === storeOwnerUnlockSummary?.nextUnlockId) ??
  storeOwnerUnlocks.find((unlock) => unlock.ownerInputRequired && unlock.canApplyBeforeProductGates) ??
  null
const summarizeAnalyticsParallelUnlock = (ownerAction, unlockKit, recommendedPath, lowestInputPath) =>
  unlockKit && recommendedPath
    ? {
        id: ownerAction?.id ?? unlockKit.id,
        title: ownerAction?.title ?? unlockKit.title,
        category: 'measurement',
        status: ownerAction?.ownerInputRequired ? 'waiting-on-owner-input' : 'ready-to-validate',
        costMode: recommendedPath.costMode,
        ownerInputRequired: recommendedPath.ownerInputRequired === true,
        canApplyBeforeProductGates: true,
        storeSubmissionStillBlocked: true,
        publicStatusPage: '/measurement-status.html',
        publicStatusJson: '/measurement-status.json',
        recommendedPathId: recommendedPath.id,
        lowestInputPathId: lowestInputPath?.id ?? null,
        lowestInputUnlockId: null,
        missingVariableCount: recommendedPath.missingVariableCount,
        missingSecretCount: recommendedPath.missingSecretCount,
        missingInputCount: recommendedPath.missingInputCount,
        lowestInputMissingInputCount: lowestInputPath?.missingInputCount ?? 0,
        lowestInputMissingSecretCount: lowestInputPath?.missingSecretCount ?? 0,
        missingVariables: summarizeConfigInputs(recommendedPath.requiredVariables).filter((item) => !item.configured),
        missingSecrets: summarizeConfigInputs(recommendedPath.requiredSecrets).filter((item) => !item.configured),
        configuredVariables: summarizeConfigInputs(recommendedPath.requiredVariables).filter((item) => item.configured),
        configuredSecrets: summarizeConfigInputs(recommendedPath.requiredSecrets).filter((item) => item.configured),
        setupCommands: recommendedPath.commandSequence ?? [],
        validationCommands: recommendedPath.validationCommands ?? [],
        controls: {
          zeroPaidSpend: true,
          noSecretValues: true,
          noSecretValuesStored: true,
          noAccountCreation: true,
          noStoreSubmission: true,
          noRevenueEnablement: true,
          productGatesStillRequiredForRevenue: true,
          storeSpendStillBlocked: true,
          secretCommandsUseStdin: unlockKit.controls?.secretCommandsUseStdin === true,
        },
      }
    : null
const summarizeStoreParallelUnlock = (unlock, summary) =>
  unlock
    ? {
        id: unlock.id,
        title: unlock.title,
        category: 'store-readiness',
        status: unlock.ownerInputRequired ? 'waiting-on-owner-input' : 'ready-to-validate',
        costMode: unlock.costMode,
        ownerInputRequired: unlock.ownerInputRequired === true,
        canApplyBeforeProductGates: unlock.canApplyBeforeProductGates === true,
        storeSubmissionStillBlocked: unlock.storeSubmissionStillBlocked === true,
        publicStatusPage: storeReadiness.publicRoutes?.storeReadiness ?? '/store-readiness.html',
        publicStatusJson: storeReadiness.publicRoutes?.storeReadinessJson ?? '/store-readiness.json',
        recommendedPathId: null,
        lowestInputPathId: null,
        lowestInputUnlockId: summary?.lowestInputUnlockId ?? unlock.id,
        missingVariableCount: unlock.missingVariableCount ?? 0,
        missingSecretCount: unlock.missingSecretCount ?? 0,
        missingInputCount: unlock.missingInputCount ?? 0,
        lowestInputMissingInputCount: summary?.lowestInputMissingInputCount ?? unlock.missingInputCount ?? 0,
        lowestInputMissingSecretCount: summary?.lowestInputMissingSecretCount ?? unlock.missingSecretCount ?? 0,
        missingVariables: summarizeStoreUnlockInputs(unlock.missingVariables),
        missingSecrets: summarizeStoreUnlockInputs(unlock.missingSecrets),
        configuredVariables: summarizeStoreUnlockInputs(unlock.configuredVariables),
        configuredSecrets: summarizeStoreUnlockInputs(unlock.configuredSecrets),
        setupCommands: unlock.setupCommands ?? [],
        validationCommands: unlock.validationCommands ?? [],
        controls: {
          zeroPaidSpend: true,
          noSecretValues: true,
          noSecretValuesStored: summary?.controls?.noSecretValuesStored === true,
          noAccountCreation: summary?.controls?.noAccountCreation === true,
          noStoreSubmission: summary?.controls?.noStoreSubmission === true,
          noRevenueEnablement: summary?.controls?.noRevenueEnablement === true,
          productGatesStillRequiredForRevenue: true,
          storeSpendStillBlocked: summary?.controls?.storeSpendStillBlocked === true,
          secretCommandsUseStdin: (unlock.missingSecrets ?? []).length > 0,
        },
      }
    : null
const templateLinesForNames = (names) => names.map((name) => `${name}=`)
const shellExportLinesForNames = (names) => names.map((name) => `export ${name}=`)
const summarizeCombinedOwnerInputPack = (analyticsPath, supportPack, supportUnlock) => {
  const analyticsMissingVariables = summarizeConfigInputs(analyticsPath?.requiredVariables).filter(
    (item) => !item.configured,
  )
  const analyticsMissingSecrets = summarizeConfigInputs(analyticsPath?.requiredSecrets).filter(
    (item) => !item.configured,
  )
  const supportMissingInputNames =
    supportPack?.missingInputNames ??
    summarizeStoreUnlockInputs(supportUnlock?.missingVariables)
      .filter((item) => !item.configured)
      .map((item) => item.repositoryName)
  const missingInputNames = unique([
    ...analyticsMissingVariables.map((item) => item.repositoryName),
    ...supportMissingInputNames,
  ])
  const secretInputCount =
    analyticsMissingSecrets.length + (supportPack?.secretInputCount ?? supportUnlock?.missingSecretCount ?? 0)

  if (!analyticsPath || missingInputNames.length === 0 || secretInputCount > 0) {
    return null
  }

  return {
    id: 'combined-zero-secret-owner-input-pack',
    title: 'Combined zero-secret owner input pack',
    status: 'waiting-on-owner-input',
    localEnvFile: supportPack?.localEnvFile ?? '.env.production.local',
    inputCount: missingInputNames.length,
    missingInputCount: missingInputNames.length,
    secretInputCount,
    missingInputNames,
    localEnvTemplateLines: templateLinesForNames(missingInputNames),
    shellExportTemplateLines: shellExportLinesForNames(missingInputNames),
    unlockIds: unique(['production-analytics-browser', supportPack?.unlockId ?? supportUnlock?.id]),
    analyticsPathId: analyticsPath.id,
    supportUnlockId: supportPack?.unlockId ?? supportUnlock?.id ?? null,
    sourcePacks: {
      analyticsLowestInputPath: analyticsPath.id,
      supportOwnerInputPack: supportPack?.unlockId ?? supportUnlock?.id ?? null,
    },
    commands: {
      printBrief: 'node scripts/owner-unlock-brief.mjs --print',
      combinedPreflight: 'node scripts/owner-unlock-preflight.mjs --assert --print',
      analyticsPreflight: 'node scripts/owner-unlock-preflight.mjs --assert --print',
      storeReadiness: 'npm run autonomous:store-readiness',
        setupPreflight: './ops/github/setup-production.sh --owner-unlock-preflight',
        npmWriteAnalyticsLocalEnvTemplate: 'npm run autonomous:analytics-input-template',
        writeAnalyticsLocalEnvTemplate: writeAnalyticsLocalEnvTemplateCommand,
        setupWriteAnalyticsLocalEnvTemplate: setupAnalyticsLocalEnvTemplateCommand,
        npmWriteLocalEnvTemplate: 'npm run autonomous:owner-input-template',
        writeLocalEnvTemplate: 'node scripts/owner-unlock-preflight.mjs --write-local-env-template',
        setupWriteLocalEnvTemplate: './ops/github/setup-production.sh --owner-input-template',
        npmWriteSupportLocalEnvTemplate: 'npm run autonomous:support-input-template',
      syncConfiguredValues: './ops/github/setup-production.sh',
      workflowDispatch: 'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
    },
    controls: {
      zeroPaidSpend: true,
      noSecretValues: true,
      noSecretValuesStored: true,
      noSecretValuesSerialized: true,
      noMutation: true,
      noWorkflowDispatch: true,
      workflowDispatchRequiresRunWorkflows: true,
      noAccountCreation: true,
      noStoreSubmission: true,
      noRevenueEnablement: true,
      productGatesStillRequiredForRevenue: true,
      storeSubmissionStillBlocked: true,
      revenueStillBlocked: true,
      gitIgnoredLocalEnvFile: true,
      localTemplateWriteNoSecretValues: true,
      localTemplateWritePreservesExistingValues: true,
      localTemplateWriteNoGithubMutation: true,
      onlyZeroSecretInputs: true,
      combinesMinimalAnalyticsAndSupportInputs: true,
    },
  }
}
const parallelOwnerUnlocks = [
  summarizeAnalyticsParallelUnlock(nextOwnerAction, nextUnlockKit, recommendedUnlockPath, lowestInputUnlockPath),
  summarizeStoreParallelUnlock(storeOwnerNextUnlock, storeOwnerUnlockSummary),
].filter(Boolean)
const combinedOwnerInputPack = summarizeCombinedOwnerInputPack(
  lowestInputUnlockPath,
  storeReadiness.supportOwnerInputPack,
  storeOwnerNextUnlock,
)
const ownerUnlockBrief =
  nextUnlockKit && recommendedUnlockPath
    ? {
        id: 'owner-next-unlock-brief',
        status: nextOwnerAction?.ownerInputRequired ? 'waiting-on-owner-input' : 'ready-to-validate',
        nextUnlockId: nextOwnerAction?.id ?? nextUnlockKit.id,
        title: nextOwnerAction?.title ?? nextUnlockKit.title,
        recommendedPathId: recommendedUnlockPath.id,
        recommendedPathTitle: recommendedUnlockPath.title,
        lowestInputPathId: lowestInputUnlockPath?.id ?? null,
        lowestInputPathTitle: lowestInputUnlockPath?.title ?? null,
        lowestInputPathStatus: lowestInputUnlockPath?.status ?? null,
        lowestInputMissingVariableCount: lowestInputUnlockPath?.missingVariableCount ?? 0,
        lowestInputMissingSecretCount: lowestInputUnlockPath?.missingSecretCount ?? 0,
        lowestInputMissingInputCount: lowestInputUnlockPath?.missingInputCount ?? 0,
        lowestInputReason: describeLowestInputPath(lowestInputUnlockPath, recommendedUnlockPath),
        lowestInputPath: summarizeOwnerUnlockPath(lowestInputUnlockPath, recommendedUnlockPath),
        minimalInterventionPath: summarizeMinimalInterventionPath(
          lowestInputUnlockPath,
          recommendedUnlockPath,
        ),
        combinedOwnerInputPack,
        costMode: recommendedUnlockPath.costMode,
        ownerInputRequired: recommendedUnlockPath.ownerInputRequired === true,
        missingVariables: summarizeConfigInputs(recommendedUnlockPath.requiredVariables).filter(
          (item) => !item.configured,
        ),
        missingSecrets: summarizeConfigInputs(recommendedUnlockPath.requiredSecrets).filter(
          (item) => !item.configured,
        ),
        configuredVariables: summarizeConfigInputs(recommendedUnlockPath.requiredVariables).filter(
          (item) => item.configured,
        ),
        configuredSecrets: summarizeConfigInputs(recommendedUnlockPath.requiredSecrets).filter(
          (item) => item.configured,
        ),
        setupCommands: recommendedUnlockPath.commandSequence ?? [],
        validationCommands: recommendedUnlockPath.validationCommands ?? [],
        afterUnlockCommands: nextOwnerAction?.afterUnlockCommands ?? [],
        parallelOwnerUnlocks,
        steps: [
          `Use ${recommendedUnlockPath.title} (${recommendedUnlockPath.id}) for the next zero-spend measurement unlock.`,
          lowestInputUnlockPath?.id && lowestInputUnlockPath.id !== recommendedUnlockPath.id
            ? `Use ${lowestInputUnlockPath.title} (${lowestInputUnlockPath.id}) when the lowest-input owner path is more important than the first-party collector recommendation.`
            : 'The recommended unlock path is currently also the lowest-input owner path.',
          lowestInputUnlockPath
            ? `Minimal-intervention setup currently needs ${lowestInputUnlockPath.missingInputCount} input(s) and ${lowestInputUnlockPath.missingSecretCount} secret(s).`
            : 'No minimal-intervention setup path is available yet.',
          'Use the parallel owner unlocks queue to resolve store support-contact inputs alongside analytics inputs when an existing support inbox is available.',
          'Set only the missing repository variables shown in this brief.',
          'Set missing repository secrets with the stdin-fed gh secret commands; never paste secret values into files or issues.',
          'Run the setup commands, then the validation commands, before trusting production analytics for gates.',
          'Keep product gates, revenue, and store submissions blocked until real player evidence clears the thresholds.',
        ],
        controls: {
          zeroPaidSpend: true,
          noSecretValues: true,
          noSecretValuesStored: true,
          noAccountCreation: true,
          noStoreSubmission: true,
          noRevenueEnablement: true,
          productGatesStillRequiredForRevenue: true,
          secretCommandsUseStdin: nextUnlockKit.controls?.secretCommandsUseStdin === true,
        },
      }
    : null

const payload = {
  generatedAt: new Date().toISOString(),
  sourceDataHash,
  status,
  statusDetail,
  liveCandidate: postDeployArtifactSync.live?.candidateId ?? null,
  sourceStatus: {
    productionEnvironment: productionEnvironment.status,
    productionBootstrap: productionBootstrap.status,
    objectiveAudit: objectiveAudit.status,
    autonomousOwnerLoop: autonomousOwnerLoop.status,
    supportChannel: supportChannel.status,
    monetization: monetization.status,
    storeCompliance: storeCompliance.status,
    storeReadiness: storeReadiness.status,
    androidRelease: androidRelease.status,
    iosRelease: iosRelease.status,
    unitEconomics: unitEconomics.status,
    postDeployArtifactSync: postDeployArtifactSync.status,
  },
  summary: {
    totalItems: sortedHandoffItems.length,
    ownerActionRequired: ownerActionRequired.length,
    externalOwnerActions: ownerActionRequired.length,
    zeroCostFirstActions: zeroCostFirstActions.length,
    missingEnv: missingEnv.length,
    missingEnvironmentItems: missingEnv.length,
    missingSecrets: missingSecrets.length,
    productGateBlockers: productGateBlockers.length,
    publicSupportChannelReady,
    storeSupportEmailNeededNow,
    nextBestUnlockId: ownerActionRequired[0]?.id ?? null,
    nextBestUnlock: ownerActionRequired[0]?.id ?? null,
    nextBestZeroCostUnlockId: zeroCostFirstActions[0]?.id ?? null,
  },
  controls: {
    zeroPaidSpend: true,
    noSecretValues: true,
    noSecretValuesStored: true,
    noMutation: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    productGatesStillRequiredForRevenue: true,
    storeSpendStillBlockedByUnitEconomics: unitEconomics.controls?.storeSpendAllowed !== true,
  },
  environmentPlan,
  secretPlan,
  missingEnv: environmentPlan.filter((item) => !item.configured),
  missingSecrets: secretPlan.filter((item) => !item.configured),
  handoffItems: sortedHandoffItems,
  unlocks: sortedHandoffItems,
  unlockKits,
  nextUnlockKit: summarizeUnlockKit(nextUnlockKit),
  ownerUnlockBrief,
  nextActions: [
    zeroCostFirstActions[0]
      ? `Start with ${zeroCostFirstActions[0].title}; it is the highest-priority zero-spend owner input.`
      : ownerActionRequired[0]
        ? `Resolve ${ownerActionRequired[0].title} when the product gates and spend rules allow it.`
        : 'No owner handoff inputs remain; continue the autonomous daily owner loop.',
    'After any owner-provided variable or secret changes, run npm run autonomous:readiness and npm run test:e2e.',
  ],
}

const appPayload = {
  status: payload.status,
  statusDetail: payload.statusDetail,
  summary: payload.summary,
  controls: payload.controls,
  sourceStatus: payload.sourceStatus,
  topHandoffItems: payload.handoffItems.slice(0, 4).map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    category: item.category,
    costMode: item.costMode,
    ownerInputRequired: item.ownerInputRequired,
    unlockKit: item.unlockKit ?? null,
  })),
  nextUnlockKit: payload.nextUnlockKit,
  ownerUnlockBrief: payload.ownerUnlockBrief
    ? {
        status: payload.ownerUnlockBrief.status,
        nextUnlockId: payload.ownerUnlockBrief.nextUnlockId,
        recommendedPathId: payload.ownerUnlockBrief.recommendedPathId,
        lowestInputPathId: payload.ownerUnlockBrief.lowestInputPathId,
        lowestInputMissingVariableCount: payload.ownerUnlockBrief.lowestInputMissingVariableCount,
        lowestInputMissingSecretCount: payload.ownerUnlockBrief.lowestInputMissingSecretCount,
        minimalInterventionPath: payload.ownerUnlockBrief.minimalInterventionPath
          ? {
              id: payload.ownerUnlockBrief.minimalInterventionPath.id,
              missingInputCount: payload.ownerUnlockBrief.minimalInterventionPath.missingInputCount,
              missingSecretCount: payload.ownerUnlockBrief.minimalInterventionPath.missingSecretCount,
              manualInputReduction: payload.ownerUnlockBrief.minimalInterventionPath.manualInputReduction,
              noSecretsRequired: payload.ownerUnlockBrief.minimalInterventionPath.noSecretsRequired,
          }
          : null,
        missingVariableCount: payload.ownerUnlockBrief.missingVariables.length,
        missingSecretCount: payload.ownerUnlockBrief.missingSecrets.length,
        setupCommands: payload.ownerUnlockBrief.setupCommands,
        validationCommands: payload.ownerUnlockBrief.validationCommands,
        parallelOwnerUnlocks: payload.ownerUnlockBrief.parallelOwnerUnlocks.map((unlock) => ({
          id: unlock.id,
          category: unlock.category,
          publicStatusPage: unlock.publicStatusPage,
          missingVariableCount: unlock.missingVariableCount,
          missingSecretCount: unlock.missingSecretCount,
          lowestInputMissingInputCount: unlock.lowestInputMissingInputCount,
        })),
        controls: payload.ownerUnlockBrief.controls,
      }
    : null,
  nextActions: payload.nextActions,
}

const ownerUnlockBriefPayload = {
  generatedAt: payload.generatedAt,
  status: payload.ownerUnlockBrief ? payload.ownerUnlockBrief.status : 'no-owner-unlock-brief',
  sourceDataHash: payload.sourceDataHash,
  sourceStatus: {
    productionBlockerHandoff: payload.status,
    storeReadiness: storeReadiness.status,
    nextBestUnlockId: payload.summary.nextBestUnlockId,
    nextBestZeroCostUnlockId: payload.summary.nextBestZeroCostUnlockId,
  },
  publicRoutes: {
    ownerUnlock: '/owner-unlock.html',
    ownerUnlockBriefJson: '/owner-unlock-brief.json',
    ownerUnlockPreflightJson: '/owner-unlock-preflight.json',
    measurementStatus: '/measurement-status.html',
    storeReadiness: storeReadiness.publicRoutes?.storeReadiness ?? '/store-readiness.html',
  },
  brief: payload.ownerUnlockBrief,
  ownerInputQueue: payload.ownerUnlockBrief?.parallelOwnerUnlocks ?? [],
  combinedOwnerInputPack: payload.ownerUnlockBrief?.combinedOwnerInputPack ?? null,
  setup: {
    setupScript: 'ops/github/setup-production.sh',
    printCommand: './ops/github/setup-production.sh --owner-unlock-brief',
    directPrintCommand: 'node scripts/owner-unlock-brief.mjs --print',
    preflightCommand: 'npm run autonomous:owner-unlock-preflight',
    setupPreflightCommand: './ops/github/setup-production.sh --owner-unlock-preflight',
      directPreflightCommand: 'node scripts/owner-unlock-preflight.mjs --assert --print',
      npmWriteLocalEnvTemplateCommand: 'npm run autonomous:owner-input-template',
      writeLocalEnvTemplateCommand: 'node scripts/owner-unlock-preflight.mjs --write-local-env-template',
      setupWriteLocalEnvTemplateCommand: './ops/github/setup-production.sh --owner-input-template',
      npmWriteAnalyticsLocalEnvTemplateCommand: 'npm run autonomous:analytics-input-template',
      writeAnalyticsLocalEnvTemplateCommand,
      setupWriteAnalyticsLocalEnvTemplateCommand: setupAnalyticsLocalEnvTemplateCommand,
      npmWriteSupportLocalEnvTemplateCommand: 'npm run autonomous:support-input-template',
      syncConfiguredValuesCommand: './ops/github/setup-production.sh',
    workflowDispatchCommand: 'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
    workflowDispatchRequiresRunWorkflows: true,
    workflowDispatchDefault: 'disabled',
  },
  controls: {
    zeroPaidSpend: true,
    noSecretValues: true,
    noSecretValuesStored: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    productGatesStillRequiredForRevenue: true,
    secretCommandsUseStdin: payload.ownerUnlockBrief?.controls?.secretCommandsUseStdin === true,
    setupPrintModeHasNoGithubMutation: true,
    setupPreflightModeHasNoGithubMutation: true,
    workflowDispatchRequiresRunWorkflows: true,
  },
  nextActions: payload.ownerUnlockBrief
    ? [
          `Print the current brief with ./ops/github/setup-production.sh --owner-unlock-brief before setting ${payload.ownerUnlockBrief.nextUnlockId}.`,
          'Run ./ops/github/setup-production.sh --owner-unlock-preflight to check local/repository readiness without storing secret values or mutating GitHub.',
          'Run ./ops/github/setup-production.sh --analytics-input-template to create or update only the ignored analytics template before adding PostHog values.',
          'Run ./ops/github/setup-production.sh --owner-input-template to create or update the ignored .env.production.local template before adding values.',
        'Export only the missing variables/secrets in the current shell, then run ./ops/github/setup-production.sh to sync configured values.',
        'Resolve zero-spend entries in the parallel owner unlocks queue, including support-contact, when an existing support inbox is available.',
        'Use RUN_WORKFLOWS=1 only after the missing analytics inputs are configured and you are ready to dispatch deployment workflows.',
        ...payload.ownerUnlockBrief.validationCommands,
      ]
    : ['No owner unlock brief is currently available; rerun npm run autonomous:blocker-handoff.'],
}

const listItemsHtml = (items, renderItem, emptyText = 'none') =>
  items?.length ? items.map((item) => `<li>${renderItem(item)}</li>`).join('\n') : `<li>${escapeHtml(emptyText)}</li>`

const commandItemsHtml = (commands, emptyText = 'none') =>
  listItemsHtml(commands, (command) => `<code>${escapeHtml(command)}</code>`, emptyText)

const ownerUnlockPageHtml = (briefPayload) => {
  const currentBrief = briefPayload.brief
  const combinedPack = briefPayload.combinedOwnerInputPack
  const lowestPath = currentBrief?.lowestInputPath ?? null
  const minimalPath = currentBrief?.minimalInterventionPath ?? null

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Owner Unlock Pack | Autonomous Game Lab</title>
    <style>
      :root {
        color: #191713;
        background: #fbf7ef;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
      }

      body {
        margin: 0;
      }

      main {
        width: min(1040px, calc(100% - 32px));
        margin: 0 auto;
        padding: 44px 0;
      }

      h1,
      h2,
      h3 {
        line-height: 1.08;
        margin: 0;
      }

      h1 {
        font-size: clamp(2rem, 6vw, 4rem);
        max-width: 780px;
      }

      p {
        max-width: 780px;
      }

      a {
        color: #187f7a;
        font-weight: 700;
      }

      code {
        overflow-wrap: anywhere;
      }

      .eyebrow {
        color: #7d2f18;
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin: 28px 0;
      }

      .card {
        border: 1px solid #d9d0bf;
        border-radius: 8px;
        background: #fffdf7;
        padding: 16px;
      }

      .card span {
        display: block;
        color: #6d675c;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .card strong {
        display: block;
        margin-top: 8px;
        overflow-wrap: anywhere;
        font-size: 1.05rem;
      }

      section {
        border-top: 1px solid #d9d0bf;
        padding: 22px 0;
      }

      ul {
        padding-left: 20px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .actions a {
        border: 1px solid #187f7a;
        border-radius: 8px;
        padding: 10px 12px;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Autonomous Game Lab</p>
      <h1>Owner Unlock Pack</h1>
      <p>This generated page exposes the smallest zero-secret owner input path for production analytics and store support readiness without storing values, creating accounts, dispatching workflows, enabling revenue, or submitting to app stores.</p>

      <div class="grid" aria-label="Owner unlock status">
        <div class="card">
          <span>Status</span>
          <strong>${escapeHtml(briefPayload.status)}</strong>
        </div>
        <div class="card">
          <span>Next unlock</span>
          <strong>${escapeHtml(currentBrief?.nextUnlockId ?? 'none')}</strong>
        </div>
        <div class="card">
          <span>Lowest-input path</span>
          <strong>${escapeHtml(lowestPath?.id ?? currentBrief?.lowestInputPathId ?? 'none')}</strong>
        </div>
        <div class="card">
          <span>Combined missing inputs</span>
          <strong>${escapeHtml(combinedPack?.missingInputCount ?? 'n/a')}</strong>
        </div>
      </div>

      <section>
        <h2>Combined Zero-Secret Pack</h2>
        <div class="grid" aria-label="Combined owner input pack">
          <div class="card">
            <span>Pack</span>
            <strong>${escapeHtml(combinedPack?.id ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Local env file</span>
            <strong>${escapeHtml(combinedPack?.localEnvFile ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Secret inputs</span>
            <strong>${escapeHtml(combinedPack?.secretInputCount ?? 'n/a')}</strong>
          </div>
          <div class="card">
            <span>Unlocks</span>
            <strong>${escapeHtml(combinedPack?.unlockIds?.join(', ') || 'none')}</strong>
          </div>
        </div>
        <h3>Missing Input Names</h3>
        <ul>
          ${listItemsHtml(combinedPack?.missingInputNames, (name) => `<code>${escapeHtml(name)}</code>`)}
        </ul>
        <h3>Local Env Template</h3>
        <ul>
          ${commandItemsHtml(combinedPack?.localEnvTemplateLines)}
        </ul>
      </section>

      <section>
        <h2>Minimal Analytics Path</h2>
        <div class="grid" aria-label="Minimal analytics path">
          <div class="card">
            <span>Path</span>
            <strong>${escapeHtml(minimalPath?.id ?? lowestPath?.id ?? 'none')}</strong>
          </div>
          <div class="card">
            <span>Missing inputs</span>
            <strong>${escapeHtml(minimalPath?.missingInputCount ?? lowestPath?.missingInputCount ?? 'n/a')}</strong>
          </div>
          <div class="card">
            <span>Missing secrets</span>
            <strong>${escapeHtml(minimalPath?.missingSecretCount ?? lowestPath?.missingSecretCount ?? 'n/a')}</strong>
          </div>
          <div class="card">
            <span>No secrets required</span>
            <strong>${escapeHtml(minimalPath?.noSecretsRequired === true || lowestPath?.noSecretsRequired === true)}</strong>
          </div>
        </div>
        <h3>Lowest-Input Missing Variables</h3>
        <ul>
          ${listItemsHtml(lowestPath?.missingVariables, (item) => `<code>${escapeHtml(item.repositoryName)}</code>`)}
        </ul>
        <h3>Setup Commands</h3>
        <ul>
          ${commandItemsHtml(lowestPath?.setupCommands)}
        </ul>
      </section>

      <section>
        <h2>Parallel Owner Unlocks</h2>
        <div class="grid" aria-label="Parallel owner unlocks">
          ${briefPayload.ownerInputQueue
            .map(
              (unlock) => `<div class="card">
            <span>${escapeHtml(unlock.category)}</span>
            <strong>${escapeHtml(unlock.id)}</strong>
            <p>${escapeHtml(unlock.title)} needs ${escapeHtml(unlock.missingInputCount)} input(s) and ${escapeHtml(unlock.missingSecretCount)} secret(s).</p>
          </div>`,
            )
            .join('\n')}
        </div>
      </section>

      <section>
        <h2>Validation</h2>
        <ul>
          ${commandItemsHtml(currentBrief?.validationCommands)}
        </ul>
        <div class="actions">
          <a href="./owner-unlock-brief.json">owner-unlock-brief.json</a>
          <a href="./owner-unlock-preflight.json">owner-unlock-preflight.json</a>
          <a href="./measurement-status.html">measurement-status.html</a>
          <a href="./store-readiness.html">store-readiness.html</a>
        </div>
      </section>
    </main>
  </body>
</html>
`
}

const ownerUnlockReport = [
  '# Owner Unlock Brief',
  '',
  `Generated: ${ownerUnlockBriefPayload.generatedAt}`,
  `Status: ${ownerUnlockBriefPayload.status}`,
  `Source hash: ${ownerUnlockBriefPayload.sourceDataHash}`,
  `Next unlock: ${ownerUnlockBriefPayload.brief?.nextUnlockId ?? 'none'}`,
  `Recommended path: ${ownerUnlockBriefPayload.brief?.recommendedPathId ?? 'none'}`,
  `Lowest-input path: ${ownerUnlockBriefPayload.brief?.lowestInputPath?.id ?? 'none'}`,
  `Lowest-input reason: ${ownerUnlockBriefPayload.brief?.lowestInputReason ?? 'none'}`,
  `Parallel owner unlocks: ${ownerUnlockBriefPayload.ownerInputQueue.map((unlock) => unlock.id).join(', ') || 'none'}`,
  '',
  '## Setup Guard',
  '',
  `- print brief: ${ownerUnlockBriefPayload.setup.printCommand}`,
  `- preflight: ${ownerUnlockBriefPayload.setup.preflightCommand}`,
  `- setup preflight: ${ownerUnlockBriefPayload.setup.setupPreflightCommand}`,
  `- direct preflight: ${ownerUnlockBriefPayload.setup.directPreflightCommand}`,
  `- write local env template: ${ownerUnlockBriefPayload.setup.writeLocalEnvTemplateCommand}`,
  `- setup write local env template: ${ownerUnlockBriefPayload.setup.setupWriteLocalEnvTemplateCommand}`,
  `- write analytics local env template: ${ownerUnlockBriefPayload.setup.writeAnalyticsLocalEnvTemplateCommand}`,
  `- setup write analytics local env template: ${ownerUnlockBriefPayload.setup.setupWriteAnalyticsLocalEnvTemplateCommand}`,
  `- sync configured values: ${ownerUnlockBriefPayload.setup.syncConfiguredValuesCommand}`,
  `- workflow dispatch: ${ownerUnlockBriefPayload.setup.workflowDispatchCommand}`,
  `- workflow dispatch default: ${ownerUnlockBriefPayload.setup.workflowDispatchDefault}`,
  `- workflow dispatch requires RUN_WORKFLOWS: ${ownerUnlockBriefPayload.setup.workflowDispatchRequiresRunWorkflows}`,
  '',
  '## Missing Variables',
  '',
  ...(ownerUnlockBriefPayload.brief?.missingVariables.length
    ? ownerUnlockBriefPayload.brief.missingVariables.map((item) => `- ${item.repositoryName}: ${item.command}`)
    : ['- none']),
  '',
  '## Missing Secrets',
  '',
  ...(ownerUnlockBriefPayload.brief?.missingSecrets.length
    ? ownerUnlockBriefPayload.brief.missingSecrets.map((item) => `- ${item.repositoryName}: ${item.command}`)
    : ['- none']),
  '',
  '## Lowest-Input Path',
  '',
  `- path: ${ownerUnlockBriefPayload.brief?.lowestInputPath?.id ?? 'none'}`,
  `- title: ${ownerUnlockBriefPayload.brief?.lowestInputPath?.title ?? 'none'}`,
  `- missing inputs: ${ownerUnlockBriefPayload.brief?.lowestInputPath?.missingInputCount ?? 'n/a'}`,
  `- missing secrets: ${ownerUnlockBriefPayload.brief?.lowestInputPath?.missingSecretCount ?? 'n/a'}`,
  `- manual input reduction: ${ownerUnlockBriefPayload.brief?.lowestInputPath?.manualInputReduction ?? 'n/a'}`,
  `- no secrets required: ${ownerUnlockBriefPayload.brief?.lowestInputPath?.noSecretsRequired === true}`,
  '',
  '## Minimal Intervention Path',
  '',
  `- path: ${ownerUnlockBriefPayload.brief?.minimalInterventionPath?.id ?? 'none'}`,
  `- missing inputs: ${ownerUnlockBriefPayload.brief?.minimalInterventionPath?.missingInputCount ?? 'n/a'}`,
  `- missing secrets: ${ownerUnlockBriefPayload.brief?.minimalInterventionPath?.missingSecretCount ?? 'n/a'}`,
  `- manual input reduction: ${ownerUnlockBriefPayload.brief?.minimalInterventionPath?.manualInputReduction ?? 'n/a'}`,
  `- no secrets required: ${ownerUnlockBriefPayload.brief?.minimalInterventionPath?.noSecretsRequired === true}`,
  '',
  '## Combined Owner Input Pack',
  '',
  `- id: ${ownerUnlockBriefPayload.combinedOwnerInputPack?.id ?? 'none'}`,
  `- local env file: ${ownerUnlockBriefPayload.combinedOwnerInputPack?.localEnvFile ?? 'none'}`,
  `- missing inputs: ${ownerUnlockBriefPayload.combinedOwnerInputPack?.missingInputCount ?? 'n/a'}`,
  `- secret inputs: ${ownerUnlockBriefPayload.combinedOwnerInputPack?.secretInputCount ?? 'n/a'}`,
  `- unlocks: ${ownerUnlockBriefPayload.combinedOwnerInputPack?.unlockIds?.join(', ') || 'none'}`,
  `- store submission still blocked: ${ownerUnlockBriefPayload.combinedOwnerInputPack?.controls?.storeSubmissionStillBlocked === true}`,
  `- revenue still blocked: ${ownerUnlockBriefPayload.combinedOwnerInputPack?.controls?.revenueStillBlocked === true}`,
  '',
  '### Combined Local Env Template',
  '',
  ...(ownerUnlockBriefPayload.combinedOwnerInputPack?.localEnvTemplateLines?.length
    ? ownerUnlockBriefPayload.combinedOwnerInputPack.localEnvTemplateLines.map((line) => `- ${line}`)
    : ['- none']),
  '',
  '### Combined Shell Export Template',
  '',
  ...(ownerUnlockBriefPayload.combinedOwnerInputPack?.shellExportTemplateLines?.length
    ? ownerUnlockBriefPayload.combinedOwnerInputPack.shellExportTemplateLines.map((line) => `- ${line}`)
    : ['- none']),
  '',
  '### Combined Pack Commands',
  '',
  ...(ownerUnlockBriefPayload.combinedOwnerInputPack?.commands
    ? Object.entries(ownerUnlockBriefPayload.combinedOwnerInputPack.commands).map(
        ([key, command]) => `- ${key}: ${command}`,
      )
    : ['- none']),
  '',
  '### Lowest-Input Missing Variables',
  '',
  ...(ownerUnlockBriefPayload.brief?.lowestInputPath?.missingVariables.length
    ? ownerUnlockBriefPayload.brief.lowestInputPath.missingVariables.map((item) => `- ${item.repositoryName}: ${item.command}`)
    : ['- none']),
  '',
  '### Lowest-Input Missing Secrets',
  '',
  ...(ownerUnlockBriefPayload.brief?.lowestInputPath?.missingSecrets.length
    ? ownerUnlockBriefPayload.brief.lowestInputPath.missingSecrets.map((item) => `- ${item.repositoryName}: ${item.command}`)
    : ['- none']),
  '',
  '### Lowest-Input Setup Commands',
  '',
  ...(ownerUnlockBriefPayload.brief?.lowestInputPath?.setupCommands.length
    ? ownerUnlockBriefPayload.brief.lowestInputPath.setupCommands.map((command) => `- ${command}`)
    : ['- none']),
  '',
  '### Lowest-Input Validation Commands',
  '',
  ...(ownerUnlockBriefPayload.brief?.lowestInputPath?.validationCommands.length
    ? ownerUnlockBriefPayload.brief.lowestInputPath.validationCommands.map((command) => `- ${command}`)
    : ['- none']),
  '',
  '## Parallel Owner Unlocks',
  '',
  ...(ownerUnlockBriefPayload.ownerInputQueue.length
    ? ownerUnlockBriefPayload.ownerInputQueue.flatMap((unlock) => [
        `### ${unlock.title} (${unlock.id})`,
        '',
        `- category: ${unlock.category}`,
        `- status: ${unlock.status}`,
        `- public status: ${unlock.publicStatusPage}`,
        `- public json: ${unlock.publicStatusJson}`,
        `- missing inputs: ${unlock.missingInputCount}`,
        `- missing variables: ${unlock.missingVariables.map((item) => item.repositoryName).join(', ') || 'none'}`,
        `- missing secrets: ${unlock.missingSecrets.map((item) => item.repositoryName).join(', ') || 'none'}`,
        `- lowest-input missing: ${unlock.lowestInputMissingInputCount}`,
        `- can apply before product gates: ${unlock.canApplyBeforeProductGates}`,
        `- store submission still blocked: ${unlock.storeSubmissionStillBlocked}`,
        '',
        'Setup commands:',
        ...(unlock.setupCommands.length ? unlock.setupCommands.map((command) => `- ${command}`) : ['- none']),
        '',
        'Validation commands:',
        ...(unlock.validationCommands.length ? unlock.validationCommands.map((command) => `- ${command}`) : ['- none']),
        '',
      ])
    : ['- none']),
  '',
  '## Setup Commands',
  '',
  ...(ownerUnlockBriefPayload.brief?.setupCommands.length
    ? ownerUnlockBriefPayload.brief.setupCommands.map((command) => `- ${command}`)
    : ['- none']),
  '',
  '## Validation Commands',
  '',
  ...(ownerUnlockBriefPayload.brief?.validationCommands.length
    ? ownerUnlockBriefPayload.brief.validationCommands.map((command) => `- ${command}`)
    : ['- none']),
  '',
  '## After Unlock',
  '',
  ...(ownerUnlockBriefPayload.brief?.afterUnlockCommands.length
    ? ownerUnlockBriefPayload.brief.afterUnlockCommands.map((command) => `- ${command}`)
    : ['- none']),
  '',
  '## Controls',
  '',
  ...Object.entries(ownerUnlockBriefPayload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
]

const report = [
  '# Production Blocker Handoff',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Detail: ${payload.statusDetail}`,
  `Live candidate: ${payload.liveCandidate ?? 'missing'}`,
  `Source hash: ${payload.sourceDataHash}`,
  '',
  '## Summary',
  '',
  `- Owner inputs required: ${payload.summary.ownerActionRequired}`,
  `- Zero-cost first actions: ${payload.summary.zeroCostFirstActions}`,
  `- Missing environment entries: ${payload.summary.missingEnv}`,
  `- Missing repository secrets: ${payload.summary.missingSecrets}`,
  `- Product-gate blockers: ${payload.summary.productGateBlockers}`,
  `- Next best unlock: ${payload.summary.nextBestUnlockId ?? 'none'}`,
  '',
  '## Source Status',
  '',
  ...Object.entries(payload.sourceStatus).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Handoff Items',
  '',
  ...payload.handoffItems.flatMap((item) => [
    `- ${item.status}: ${item.id} - ${item.title}`,
    `  - category: ${item.category}`,
    `  - cost: ${item.costMode}`,
    `  - owner input required: ${item.ownerInputRequired}`,
    ...(item.unlockKit
      ? [
          `  - unlock kit: ${item.unlockKit.id}`,
          `  - recommended path: ${item.unlockKit.recommendedPathId}`,
          `  - lowest-input path: ${item.unlockKit.lowestInputPathId ?? 'none'}`,
          `  - setup commands: ${item.unlockKit.commandCount}`,
        ]
      : []),
    `  - unlocks: ${item.unlocks.join(' ')}`,
  ]),
  '',
  '## Next Unlock Kit',
  '',
  ...(payload.nextUnlockKit
    ? [
        `- ${payload.nextUnlockKit.status}: ${payload.nextUnlockKit.id} - ${payload.nextUnlockKit.title}`,
        `- recommended path: ${payload.nextUnlockKit.recommendedPathId}`,
        `- setup commands: ${payload.nextUnlockKit.commandCount}`,
        `- validation commands: ${payload.nextUnlockKit.validationCommandCount}`,
        ...payload.nextUnlockKit.paths.flatMap((unlockPath) => [
          `- path ${unlockPath.id}: ${unlockPath.status}; ${unlockPath.costMode}`,
          `  - variables: ${unlockPath.requiredVariables.map((item) => item.repositoryName).join(', ') || 'none'}`,
          `  - secrets: ${unlockPath.requiredSecrets.map((item) => item.repositoryName).join(', ') || 'none'}`,
          `  - commands: ${unlockPath.commandSequence.join(' && ')}`,
        ]),
      ]
    : ['- none']),
  '',
  '## Owner Unlock Brief',
  '',
  ...(payload.ownerUnlockBrief
    ? [
        `- status: ${payload.ownerUnlockBrief.status}`,
        `- next unlock: ${payload.ownerUnlockBrief.nextUnlockId}`,
        `- recommended path: ${payload.ownerUnlockBrief.recommendedPathId}`,
        `- missing variables: ${payload.ownerUnlockBrief.missingVariables.map((item) => item.repositoryName).join(', ') || 'none'}`,
        `- missing secrets: ${payload.ownerUnlockBrief.missingSecrets.map((item) => item.repositoryName).join(', ') || 'none'}`,
        `- setup commands: ${payload.ownerUnlockBrief.setupCommands.join(' && ') || 'none'}`,
        `- validation commands: ${payload.ownerUnlockBrief.validationCommands.join(' && ') || 'none'}`,
      ]
    : ['- none']),
  '',
  '## Missing Env',
  '',
  ...(payload.missingEnv.length
    ? payload.missingEnv.map((item) => `- ${item.name}: ${item.purpose}`)
    : ['- none']),
  '',
  '## Missing Secrets',
  '',
  ...(payload.missingSecrets.length
    ? payload.missingSecrets.map((item) => `- ${item.repositorySecret}: ${item.command}`)
    : ['- none']),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(ownerUnlockPublicJsonPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionBlockerHandoff = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type ProductionBlockerHandoff = typeof productionBlockerHandoff\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(ownerUnlockJsonPath, JSON.stringify(ownerUnlockBriefPayload, null, 2) + '\n')
await writeFile(ownerUnlockPublicJsonPath, JSON.stringify(ownerUnlockBriefPayload, null, 2) + '\n')
await writeFile(ownerUnlockPublicHtmlPath, ownerUnlockPageHtml(ownerUnlockBriefPayload))
await writeFile(ownerUnlockReportPath, ownerUnlockReport.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, ownerUnlockJsonPath)}`)
console.log(`Wrote ${path.relative(root, ownerUnlockPublicJsonPath)}`)
console.log(`Wrote ${path.relative(root, ownerUnlockPublicHtmlPath)}`)
console.log(`Wrote ${path.relative(root, ownerUnlockReportPath)}`)
