import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const promotionPath = path.join(root, 'data', 'promotion-decision.json')
const readinessPath = path.join(root, 'data', 'production-readiness.json')
const storePackagePath = path.join(root, 'data', 'store-package.json')
const releaseHealthPath = path.join(root, 'data', 'release-health.json')
const unitEconomicsPath = path.join(root, 'data', 'unit-economics.json')
const productionResponsePath = path.join(root, 'data', 'production-response.json')
const releaseCandidatePath = path.join(root, 'data', 'release-candidate.json')
const repositoryReadinessPath = path.join(root, 'data', 'repository-readiness.json')
const environmentPath = path.join(root, 'data', 'production-environment.json')
const collectorDeploymentPath = path.join(root, 'data', 'event-collector-deployment.json')
const workflowPath = path.join(root, '.github', 'workflows', 'web-pwa-deploy.yml')
const outputJsonPath = path.join(root, 'data', 'deployment-plan.json')
const outputTsPath = path.join(root, 'src', 'data', 'deploymentPlan.ts')
const reportPath = path.join(root, 'reports', 'deployment-plan-latest.md')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const promotion = await readJson(promotionPath)
const readiness = await readJson(readinessPath)
const storePackage = await readJson(storePackagePath)
const releaseHealth = await readJson(releaseHealthPath)
const unitEconomics = await readJson(unitEconomicsPath)
const productionResponse = await readJson(productionResponsePath)
const releaseCandidate = await readOptionalJson(releaseCandidatePath, {
  status: 'missing',
  candidateId: null,
  summary: {},
  integrity: {},
  controls: {},
  postDeploySmoke: [],
})
const repositoryReadiness = await readOptionalJson(repositoryReadinessPath, {
  status: 'missing',
  repository: {},
  githubAutomation: {},
  pages: {},
  controls: {},
  blockers: [],
})
const environment = await readOptionalJson(environmentPath, {
  status: 'missing',
  publicOrigin: { origin: null, status: 'missing' },
  analytics: { status: 'missing' },
})
const collectorDeployment = await readOptionalJson(collectorDeploymentPath, {
  status: 'missing',
  provider: 'cloudflare-worker-r2',
  workflow: { path: '.github/workflows/event-collector-deploy.yml', status: 'missing' },
})
const webDecision = promotion.decisions?.find((decision) => decision.channel === 'web-pwa')

const checks = [
  {
    id: 'web-promotion',
    status: webDecision?.status === 'promotable-internal' ? 'pass' : 'blocker',
    detail: webDecision?.decision ?? 'Missing web promotion decision.',
  },
  {
    id: 'web-readiness',
    status: readiness.webPwa?.status === 'ready-after-build' ? 'pass' : 'blocker',
    detail: `Web readiness is ${readiness.webPwa?.status ?? 'missing'}.`,
  },
  {
    id: 'release-health',
    status: releaseHealth.controls?.canDeploy ? 'pass' : 'blocker',
    detail: `Release health is ${releaseHealth.status}.`,
  },
  {
    id: 'unit-economics-guard',
    status: unitEconomics.controls?.spendGuardActive ? 'pass' : 'blocker',
    detail: `Spend mode is ${unitEconomics.status}; max daily paid spend is $${(
      unitEconomics.controls?.maxDailySpendUsd ?? 0
    ).toFixed(2)}.`,
  },
  {
    id: 'production-response',
    status:
      productionResponse.controls?.deployAllowed || releaseHealth.controls?.rollbackRequired
        ? 'pass'
        : 'blocker',
    detail: `Production response is ${productionResponse.status}; rollback required is ${productionResponse.controls?.rollbackRequired}.`,
  },
  {
    id: 'dist-index',
    status: (await exists(path.join(root, 'dist', 'index.html'))) ? 'pass' : 'blocker',
    detail: 'Production index.html exists.',
  },
  {
    id: 'dist-service-worker',
    status: (await exists(path.join(root, 'dist', 'sw.js'))) ? 'pass' : 'blocker',
    detail: 'Production service worker exists.',
  },
  {
    id: 'dist-privacy',
    status: (await exists(path.join(root, 'dist', 'privacy.html'))) ? 'pass' : 'blocker',
    detail: 'Privacy policy is included in the deployable build.',
  },
  {
    id: 'dist-install',
    status: (await exists(path.join(root, 'dist', 'install.html'))) ? 'pass' : 'blocker',
    detail: 'PWA install handoff page is included in the deployable build.',
  },
  {
    id: 'release-candidate',
    status:
      releaseCandidate.status === 'release-candidate-ready' &&
      releaseCandidate.summary?.requiredFilesPresent === true &&
      releaseCandidate.controls?.contentHashesRecorded === true &&
      (releaseCandidate.postDeploySmoke?.length ?? 0) >= 6
        ? 'pass'
        : 'blocker',
    detail: `Release candidate is ${releaseCandidate.status}; candidate ${
      releaseCandidate.candidateId ?? 'missing'
    }.`,
  },
  {
    id: 'deploy-workflow',
    status: (await exists(workflowPath)) ? 'pass' : 'blocker',
    detail: 'GitHub Pages deployment workflow exists.',
  },
  {
    id: 'production-environment',
    status: environment.status !== 'missing' ? 'pass' : 'blocker',
    detail: `Environment status is ${environment.status}; public origin is ${
      environment.publicOrigin?.origin ?? 'missing'
    }.`,
  },
  {
    id: 'event-collector-deployment',
    status: collectorDeployment.status !== 'missing' ? 'pass' : 'blocker',
    detail: `Event collector deployment is ${collectorDeployment.status}.`,
  },
]

const deployable = checks.every((check) => check.status === 'pass')

const payload = {
  generatedAt: new Date().toISOString(),
  status: deployable ? 'ready-for-pages' : 'blocked',
  target: {
    provider: 'github-pages',
    cost: '$0 platform hosting for public/internal experiment traffic',
    workflow: '.github/workflows/web-pwa-deploy.yml',
    artifactPath: 'dist',
  },
  repositoryChannel: {
    status: repositoryReadiness.status,
    repository: repositoryReadiness.repository?.target ?? null,
    source: repositoryReadiness.repository?.source ?? 'missing',
    insideWorkTree: repositoryReadiness.workspace?.insideWorkTree ?? false,
    ghCliAvailable: repositoryReadiness.githubAutomation?.ghCliAvailable ?? false,
    workflowDispatchReady: repositoryReadiness.githubAutomation?.workflowDispatchReady ?? false,
    blockers: repositoryReadiness.blockers ?? [],
  },
  eventCollector: {
    status: collectorDeployment.status,
    provider: collectorDeployment.provider,
    workflow: collectorDeployment.workflow?.path ?? '.github/workflows/event-collector-deploy.yml',
    costPosture: collectorDeployment.costPosture ?? 'free-tier-friendly-no-paid-traffic',
  },
  promotion: {
    webStatus: webDecision?.status ?? 'missing',
    nextAction: webDecision?.nextAction ?? null,
  },
  releaseHealth: {
    status: releaseHealth.status,
    canDeploy: releaseHealth.controls?.canDeploy ?? false,
    rollbackRequired: releaseHealth.controls?.rollbackRequired ?? false,
  },
  unitEconomics: {
    status: unitEconomics.status,
    spendMode: unitEconomics.controls?.spendMode ?? 'missing',
    maxDailySpendUsd: unitEconomics.controls?.maxDailySpendUsd ?? null,
    paidAcquisitionAllowed: unitEconomics.controls?.paidAcquisitionAllowed ?? false,
    storeSpendAllowed: unitEconomics.controls?.storeSpendAllowed ?? false,
  },
  productionResponse: {
    status: productionResponse.status,
    deployAllowed: productionResponse.controls?.deployAllowed ?? false,
    rollbackRequired: productionResponse.controls?.rollbackRequired ?? false,
    experimentsFrozen: productionResponse.controls?.experimentsFrozen ?? false,
    activeActions: productionResponse.actions
      ?.filter((action) => ['active', 'applied'].includes(action.status))
      .map((action) => action.id),
  },
  releaseCandidate: {
    status: releaseCandidate.status,
    candidateId: releaseCandidate.candidateId,
    manifestPath: releaseCandidate.target?.manifestPath ?? 'dist/release-candidate.json',
    aggregateHash: releaseCandidate.integrity?.aggregateHash ?? null,
    totalFiles: releaseCandidate.summary?.totalFiles ?? null,
    totalKb: releaseCandidate.summary?.totalKb ?? null,
    postDeploySmokeUrls: releaseCandidate.summary?.postDeploySmokeUrls ?? null,
  },
  compliance: {
    privacyPath: storePackage.privacyPolicy?.path,
    supportPath: '/support.html',
    hostedPrivacyStatus: storePackage.privacyPolicy?.productionUrlStatus,
  },
  environment: {
    status: environment.status,
    publicOrigin: environment.publicOrigin?.origin ?? null,
    publicOriginStatus: environment.publicOrigin?.status ?? 'missing',
    analyticsStatus: environment.analytics?.status ?? 'missing',
  },
  setupRequiredOnce: [
    'Run the production bootstrap helper with gh credentials so it can set GitHub Pages source to GitHub Actions.',
    'For project pages, set repository variable VITE_BASE_PATH to /repository-name/.',
    'Set Cloudflare collector variables and secrets only when live first-party analytics are needed.',
    'Optionally attach a custom domain before app-store submission so the privacy URL is stable.',
  ],
  checks,
  commands: {
    localVerification: 'npm run autonomous:operate',
    deployWorkflow: 'Run Web PWA Deploy workflow or let it run after Autonomous Daily Studio succeeds.',
    collectorWorkflow: 'Run Event Collector Deploy after Cloudflare variables and secrets are configured.',
  },
}

const report = [
  '# Deployment Plan',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Target: ${payload.target.provider}`,
  `Cost: ${payload.target.cost}`,
  '',
  '## Checks',
  '',
  ...checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Spend Guard',
  '',
  `- Mode: ${payload.unitEconomics.spendMode}`,
  `- Max daily spend: $${(payload.unitEconomics.maxDailySpendUsd ?? 0).toFixed(2)}`,
  `- Paid acquisition: ${payload.unitEconomics.paidAcquisitionAllowed ? 'allowed' : 'blocked'}`,
  `- Store spend: ${payload.unitEconomics.storeSpendAllowed ? 'allowed' : 'blocked'}`,
  '',
  '## Production Response',
  '',
  `- Mode: ${payload.productionResponse.status}`,
  `- Deploy allowed: ${payload.productionResponse.deployAllowed}`,
  `- Rollback required: ${payload.productionResponse.rollbackRequired}`,
  `- Active actions: ${payload.productionResponse.activeActions?.join(', ') || 'none'}`,
  '',
  '## Release Candidate',
  '',
  `- Status: ${payload.releaseCandidate.status}`,
  `- Candidate: ${payload.releaseCandidate.candidateId ?? 'missing'}`,
  `- Files: ${payload.releaseCandidate.totalFiles ?? 'n/a'}`,
  `- Aggregate SHA-256: ${payload.releaseCandidate.aggregateHash ?? 'missing'}`,
  `- Post-deploy smoke URLs: ${payload.releaseCandidate.postDeploySmokeUrls ?? 'n/a'}`,
  '',
  '## Repository Channel',
  '',
  `- Status: ${payload.repositoryChannel.status}`,
  `- Repository: ${payload.repositoryChannel.repository ?? 'missing'}`,
  `- Git worktree: ${payload.repositoryChannel.insideWorkTree}`,
  `- Workflow dispatch ready: ${payload.repositoryChannel.workflowDispatchReady}`,
  ...(payload.repositoryChannel.blockers ?? []).slice(0, 5).map((item) => `- blocker: ${item}`),
  '',
  '## Environment',
  '',
  `- Status: ${payload.environment.status}`,
  `- Public origin: ${payload.environment.publicOrigin ?? 'missing'}`,
  `- Analytics: ${payload.environment.analyticsStatus}`,
  `- Event collector: ${payload.eventCollector.status}`,
  '',
  '## One-Time Setup',
  '',
  ...payload.setupRequiredOnce.map((item) => `- ${item}`),
  '',
  '## Commands',
  '',
  `- Local verification: ${payload.commands.localVerification}`,
  `- Deploy workflow: ${payload.commands.deployWorkflow}`,
  `- Collector workflow: ${payload.commands.collectorWorkflow}`,
  '',
]

const appPayload = {
  status: payload.status,
}
const tsOutput = `export const deploymentPlan = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type DeploymentPlan = typeof deploymentPlan\n`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(outputTsPath, tsOutput)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (process.argv.includes('--assert') && !deployable) {
  console.error('Deployment plan is not deployable.')
  process.exit(1)
}
