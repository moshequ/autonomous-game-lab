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
const postDeployArtifactSync = await readOptionalJson(path.join(dataDir, 'post-deploy-artifact-sync.json'), {
  status: 'missing',
  live: {},
})

const unique = (items) => [...new Set(items.filter(Boolean))]
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
      './ops/github/setup-production.sh',
      'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
      'npm run autonomous:readiness',
    ],
    validationCommands: ['npm run autonomous:readiness', 'npm run test:e2e'],
    unlocks: [
      'Browser events can forward to an existing PostHog project.',
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
    unlocks: ['Scheduled owner loops can evaluate production behavior without manual event exports.'],
    afterUnlockCommands: ['npm run autonomous:import-events', 'npm run autonomous:analytics', 'npm run autonomous:objective-audit'],
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
        steps: [
          `Use ${recommendedUnlockPath.title} (${recommendedUnlockPath.id}) for the next zero-spend measurement unlock.`,
          lowestInputUnlockPath?.id && lowestInputUnlockPath.id !== recommendedUnlockPath.id
            ? `Use ${lowestInputUnlockPath.title} (${lowestInputUnlockPath.id}) when the lowest-input owner path is more important than the first-party collector recommendation.`
            : 'The recommended unlock path is currently also the lowest-input owner path.',
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
        missingVariableCount: payload.ownerUnlockBrief.missingVariables.length,
        missingSecretCount: payload.ownerUnlockBrief.missingSecrets.length,
        setupCommands: payload.ownerUnlockBrief.setupCommands,
        validationCommands: payload.ownerUnlockBrief.validationCommands,
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
    nextBestUnlockId: payload.summary.nextBestUnlockId,
    nextBestZeroCostUnlockId: payload.summary.nextBestZeroCostUnlockId,
  },
  brief: payload.ownerUnlockBrief,
  setup: {
    setupScript: 'ops/github/setup-production.sh',
    printCommand: './ops/github/setup-production.sh --owner-unlock-brief',
    directPrintCommand: 'node scripts/owner-unlock-brief.mjs --print',
    preflightCommand: 'npm run autonomous:owner-unlock-preflight',
    setupPreflightCommand: './ops/github/setup-production.sh --owner-unlock-preflight',
    directPreflightCommand: 'node scripts/owner-unlock-preflight.mjs --assert --print',
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
        'Export only the missing variables/secrets in the current shell, then run ./ops/github/setup-production.sh to sync configured values.',
        'Use RUN_WORKFLOWS=1 only after the missing analytics inputs are configured and you are ready to dispatch deployment workflows.',
        ...payload.ownerUnlockBrief.validationCommands,
      ]
    : ['No owner unlock brief is currently available; rerun npm run autonomous:blocker-handoff.'],
}

const ownerUnlockReport = [
  '# Owner Unlock Brief',
  '',
  `Generated: ${ownerUnlockBriefPayload.generatedAt}`,
  `Status: ${ownerUnlockBriefPayload.status}`,
  `Source hash: ${ownerUnlockBriefPayload.sourceDataHash}`,
  `Next unlock: ${ownerUnlockBriefPayload.brief?.nextUnlockId ?? 'none'}`,
  `Recommended path: ${ownerUnlockBriefPayload.brief?.recommendedPathId ?? 'none'}`,
  '',
  '## Setup Guard',
  '',
  `- print brief: ${ownerUnlockBriefPayload.setup.printCommand}`,
  `- preflight: ${ownerUnlockBriefPayload.setup.preflightCommand}`,
  `- setup preflight: ${ownerUnlockBriefPayload.setup.setupPreflightCommand}`,
  `- direct preflight: ${ownerUnlockBriefPayload.setup.directPreflightCommand}`,
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
await writeFile(ownerUnlockReportPath, ownerUnlockReport.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, ownerUnlockJsonPath)}`)
console.log(`Wrote ${path.relative(root, ownerUnlockPublicJsonPath)}`)
console.log(`Wrote ${path.relative(root, ownerUnlockReportPath)}`)
