import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const productionEnvironmentPath = path.join(root, 'data', 'production-environment.json')
const eventCollectorSmokePath = path.join(root, 'data', 'event-collector-smoke.json')
const workflowPath = path.join(root, '.github', 'workflows', 'event-collector-deploy.yml')
const workerPath = path.join(root, 'ops', 'cloudflare', 'event-collector-worker.mjs')
const wranglerExamplePath = path.join(root, 'ops', 'cloudflare', 'wrangler.toml.example')
const outputJsonPath = path.join(root, 'data', 'event-collector-deployment.json')
const outputTsPath = path.join(root, 'src', 'data', 'eventCollectorDeployment.ts')
const reportPath = path.join(root, 'reports', 'event-collector-deployment-latest.md')

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

const productionEnvironment = await readOptionalJson(productionEnvironmentPath, {
  analytics: {
    eventCollector: {
      browserConfigured: false,
      serverExportConfigured: false,
      url: null,
      exportUrl: null,
      provider: 'cloudflare-worker-r2',
    },
  },
})
const eventCollectorSmoke = await readOptionalJson(eventCollectorSmokePath, { status: 'missing' })

const cloudflareAccountConfigured = configured(process.env.CLOUDFLARE_ACCOUNT_ID)
const cloudflareTokenConfigured = configured(process.env.CLOUDFLARE_API_TOKEN)
const bucketName = process.env.AGL_EVENT_COLLECTOR_R2_BUCKET?.trim() || 'autonomous-game-lab-events'
const allowedOrigins = process.env.AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS?.trim() || process.env.AGL_PUBLIC_ORIGIN?.trim() || ''
const writeTokenConfigured = configured(process.env.VITE_EVENT_COLLECTOR_WRITE_TOKEN)
const adminTokenConfigured = configured(process.env.AGL_EVENT_COLLECTOR_ADMIN_TOKEN)
const browserConfigured = productionEnvironment.analytics?.eventCollector?.browserConfigured === true
const serverExportConfigured = productionEnvironment.analytics?.eventCollector?.serverExportConfigured === true
const deployCredentialReady = cloudflareAccountConfigured && cloudflareTokenConfigured && adminTokenConfigured
const collectorEnvReady = browserConfigured && serverExportConfigured && writeTokenConfigured
const workerSourceExists = await exists(workerPath)
const wranglerExampleExists = await exists(wranglerExamplePath)
const workflowExists = await exists(workflowPath)
const smokeReady =
  eventCollectorSmoke.status === 'pass' &&
  eventCollectorSmoke.collector?.piiStripped === true &&
  eventCollectorSmoke.ingest?.remoteCollectorStatus === 'available'

const checks = [
  {
    id: 'worker-source',
    status: workerSourceExists ? 'pass' : 'blocker',
    detail: 'Cloudflare Worker collector source exists.',
  },
  {
    id: 'wrangler-config-template',
    status: wranglerExampleExists ? 'pass' : 'blocker',
    detail: 'Wrangler config template exists for the collector.',
  },
  {
    id: 'collector-smoke',
    status: smokeReady ? 'pass' : 'blocker',
    detail: `Event collector smoke is ${eventCollectorSmoke.status}.`,
  },
  {
    id: 'deploy-workflow',
    status: workflowExists ? 'pass' : 'blocker',
    detail: 'GitHub Actions collector deploy workflow exists.',
  },
  {
    id: 'cloudflare-credentials',
    status: deployCredentialReady ? 'pass' : 'missing-env',
    detail: 'Cloudflare account id, API token, and admin export token are configured.',
  },
  {
    id: 'collector-runtime-env',
    status: collectorEnvReady ? 'pass' : 'missing-env',
    detail: 'Browser collector URL, export URL, and public write token are configured.',
  },
]

const hardBlocked = checks.some((check) => check.status === 'blocker')
const status = hardBlocked
  ? 'blocked'
  : deployCredentialReady && collectorEnvReady
    ? 'ready-for-worker-deploy'
    : 'blocked-needs-cloudflare-env'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  provider: 'cloudflare-worker-r2',
  costPosture: 'free-tier-friendly-no-paid-traffic',
  worker: {
    path: 'ops/cloudflare/event-collector-worker.mjs',
    storageBinding: 'EVENT_BUCKET',
    bucketName,
    allowedOrigins: allowedOrigins || null,
  },
  workflow: {
    path: '.github/workflows/event-collector-deploy.yml',
    status: workflowExists ? 'present' : 'missing',
    deploysWhenConfigured: deployCredentialReady && collectorEnvReady,
  },
  environment: {
    browserCollectorConfigured: browserConfigured,
    serverExportConfigured,
    cloudflareAccountConfigured,
    cloudflareTokenConfigured,
    writeTokenConfigured,
    adminTokenConfigured,
    collectorUrl: productionEnvironment.analytics?.eventCollector?.url ?? null,
    exportUrl: productionEnvironment.analytics?.eventCollector?.exportUrl ?? null,
  },
  smoke: {
    status: eventCollectorSmoke.status,
    piiStripped: eventCollectorSmoke.collector?.piiStripped === true,
    exportedEvents: eventCollectorSmoke.collector?.exportedEvents ?? 0,
    activeSource: eventCollectorSmoke.analytics?.activeSource ?? null,
  },
  setupRequiredOnce: [
    'Create or select a Cloudflare account and R2 bucket for collector event batches.',
    'Set repository variables CLOUDFLARE_ACCOUNT_ID, AGL_EVENT_COLLECTOR_R2_BUCKET, AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS, VITE_EVENT_COLLECTOR_URL, and AGL_EVENT_COLLECTOR_EXPORT_URL.',
    'Set repository secrets CLOUDFLARE_API_TOKEN, VITE_EVENT_COLLECTOR_WRITE_TOKEN, and AGL_EVENT_COLLECTOR_ADMIN_TOKEN.',
    'Run the Event Collector Deploy workflow; it runs the collector smoke before deploying.',
  ],
  checks,
  commands: {
    smoke: 'npm run autonomous:event-collector-smoke',
    plan: 'npm run autonomous:collector-deploy-plan',
    deployWorkflow: 'Run Event Collector Deploy after Cloudflare variables and secrets are configured.',
  },
}

const report = [
  '# Event Collector Deployment',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Provider: ${payload.provider}`,
  `Cost posture: ${payload.costPosture}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Environment',
  '',
  `- Browser collector configured: ${payload.environment.browserCollectorConfigured}`,
  `- Server export configured: ${payload.environment.serverExportConfigured}`,
  `- Cloudflare credentials configured: ${payload.environment.cloudflareAccountConfigured && payload.environment.cloudflareTokenConfigured}`,
  `- Tokens configured: write=${payload.environment.writeTokenConfigured}, admin=${payload.environment.adminTokenConfigured}`,
  '',
  '## One-Time Setup',
  '',
  ...payload.setupRequiredOnce.map((item) => `- ${item}`),
  '',
  '## Commands',
  '',
  `- Smoke: ${payload.commands.smoke}`,
  `- Plan: ${payload.commands.plan}`,
  `- Deploy: ${payload.commands.deployWorkflow}`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const eventCollectorDeployment = ${JSON.stringify(payload, null, 2)} as const\n\nexport type EventCollectorDeployment = typeof eventCollectorDeployment\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (process.argv.includes('--assert-configured') && payload.status !== 'ready-for-worker-deploy') {
  console.error('Event collector deployment is not fully configured.')
  process.exit(1)
}
