import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'production-blocker-handoff.json')
const outputTsPath = path.join(root, 'src', 'data', 'productionBlockerHandoff.ts')
const reportPath = path.join(reportsDir, 'production-blocker-handoff-latest.md')

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
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
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

const handoffItems = [
  {
    id: 'support-contact',
    title: 'Production support email',
    category: 'store-compliance',
    status: envConfigured('AGL_SUPPORT_EMAIL') ? 'configured' : 'owner-input-required',
    priority: 100,
    costMode: 'zero-spend-if-existing-inbox',
    ownerInputRequired: !envConfigured('AGL_SUPPORT_EMAIL'),
    requiredEnv: requiredEnv(['AGL_SUPPORT_EMAIL']),
    requiredSecrets: [],
    blockers: blockersMatching([/support email/i, /support-contact/i, /support inbox/i]),
    unlocks: ['Hosted privacy/support pages can satisfy public store listing support-contact checks.'],
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
    costMode: 'use-existing-free-tier-or-first-party-collector',
    ownerInputRequired: !anyEnvConfigured(['VITE_POSTHOG_KEY', 'VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL']),
    requiredEnv: requiredEnv(['VITE_POSTHOG_KEY', 'VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL']),
    requiredSecrets: requiredSecrets(['VITE_EVENT_COLLECTOR_WRITE_TOKEN', 'CLOUDFLARE_API_TOKEN']),
    blockers: blockersMatching([/forward browser analytics/i, /collector environment/i]),
    unlocks: ['Real player events can replace fixture/local-only evidence for product gates and retention decisions.'],
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
  monetization,
  storeCompliance,
  androidRelease,
  unitEconomics,
  postDeployArtifactSync,
})
const ownerActionRequired = sortedHandoffItems.filter((item) => item.ownerInputRequired)
const zeroCostFirstActions = sortedHandoffItems.filter((item) => item.costMode.includes('zero') && item.ownerInputRequired)
const status = ownerActionRequired.length ? 'handoff-waiting-on-owner-inputs' : 'handoff-clear'
const statusDetail = ownerActionRequired.length ? 'blocked-external-inputs' : 'clear'
const environmentPlan = sanitizeRequiredEnv(productionEnvironment.requiredEnv ?? [])
const secretPlan = sanitizeRequiredSecrets(productionBootstrap.requiredSecrets ?? [])

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
    monetization: monetization.status,
    storeCompliance: storeCompliance.status,
    androidRelease: androidRelease.status,
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
  })),
  nextActions: payload.nextActions,
}

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
    `  - unlocks: ${item.unlocks.join(' ')}`,
  ]),
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
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionBlockerHandoff = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type ProductionBlockerHandoff = typeof productionBlockerHandoff\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
