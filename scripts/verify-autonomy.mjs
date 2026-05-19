import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const requiredFiles = [
  'data/trend-signals.json',
  'data/trend-cache.json',
  'data/trend-source-readiness.json',
  'data/generated-concepts.json',
  'data/prototype-pipeline.json',
  'data/game-balance.json',
  'data/experiment-policy.json',
  'data/experiment-results.json',
  'data/experiment-sample.json',
  'data/playable-games.json',
  'data/generated-playable-games.json',
  'data/event-collector-smoke.json',
  'data/event-collector-deployment.json',
  'data/local-event-bridge.json',
  'data/event-ingest.json',
  'data/event-ingest-smoke.json',
  'data/analytics-rollup.json',
  'data/retention-sample.json',
  'data/growth-plan.json',
  'data/growth-policy.json',
  'data/growth-optimizer.json',
  'data/portfolio-policy.json',
  'data/traffic-seeding.json',
  'data/acquisition-learning.json',
  'data/retention-loop.json',
  'data/pwa-install-loop.json',
  'data/performance-budget.json',
  'data/release-candidate.json',
  'data/post-deploy-smoke.json',
  'data/repository-readiness.json',
  'data/repository-bootstrap.json',
  'data/product-optimization.json',
  'data/product-gate-recovery.json',
  'data/product-gate-sample-plan.json',
  'data/first-move-coach.json',
  'data/completion-loop.json',
  'data/replay-loop.json',
  'data/production-bootstrap.json',
  'data/autonomous-operator.json',
  'data/autonomous-operator-history.json',
  'data/autonomous-cadence.json',
  'data/autonomous-self-update.json',
  'data/objective-audit.json',
  'data/autonomous-owner-loop.json',
  'data/production-environment.json',
  'data/icon-assets.json',
  'data/monetization-plan.json',
  'data/unit-economics.json',
  'data/android-release.json',
  'data/production-response.json',
  'data/incident-drill.json',
  'data/store-package.json',
  'data/store-assets.json',
  'data/store-listing-optimizer.json',
  'data/store-compliance.json',
  'data/android-signing.json',
  'data/native-package.json',
  'data/balance-report.json',
  'data/production-readiness.json',
  'data/release-health.json',
  'data/promotion-policy.json',
  'data/promotion-decision.json',
  'data/deployment-plan.json',
  'data/applied-improvements.json',
  'data/improvement-backlog.json',
  'data/improvement-routing.json',
  'src/data/portfolioPolicy.ts',
  'src/data/trafficSeeding.ts',
  'src/data/acquisitionLearning.ts',
  'src/data/retentionLoop.ts',
  'src/data/pwaInstallLoop.ts',
  'src/data/performanceBudget.ts',
  'src/data/releaseCandidate.ts',
  'src/data/postDeploySmoke.ts',
  'src/data/repositoryReadiness.ts',
  'src/data/repositoryBootstrap.ts',
  'src/data/productOptimization.ts',
  'src/data/productGateRecovery.ts',
  'src/data/productGateSamplePlan.ts',
  'src/data/firstMoveCoach.ts',
  'src/data/completionLoop.ts',
  'src/data/replayLoop.ts',
  'src/data/productionBootstrap.ts',
  'src/data/autonomousOperator.ts',
  'src/data/autonomousOperatorHistory.ts',
  'src/data/autonomousCadence.ts',
  'src/data/autonomousSelfUpdate.ts',
  'src/data/objectiveAudit.ts',
  'src/data/localEventBridge.ts',
  'src/data/storeListingOptimizer.ts',
  'src/data/storeCompliance.ts',
  'src/data/androidSigning.ts',
  'src/data/autonomousOwnerLoop.ts',
  '.github/workflows/autonomous-daily.yml',
  '.github/workflows/autonomous-self-update.yml',
  '.github/workflows/android-twa-release.yml',
  '.github/workflows/event-collector-deploy.yml',
  '.github/workflows/web-pwa-deploy.yml',
  'reports/trend-radar-latest.md',
  'reports/trend-source-readiness-latest.md',
  'reports/concepts-latest.md',
  'reports/prototype-pipeline-latest.md',
  'reports/generated-playable-games-latest.md',
  'reports/event-collector-smoke-latest.md',
  'reports/event-collector-deployment-latest.md',
  'reports/local-event-bridge-latest.md',
  'reports/event-ingest-latest.md',
  'reports/event-ingest-smoke-latest.md',
  'reports/analytics-rollup-latest.md',
  'reports/experiment-results-latest.md',
  'reports/growth-plan-latest.md',
  'reports/growth-optimizer-latest.md',
  'reports/portfolio-policy-latest.md',
  'reports/traffic-seeding-latest.md',
  'reports/acquisition-learning-latest.md',
  'reports/retention-loop-latest.md',
  'reports/pwa-install-loop-latest.md',
  'reports/performance-budget-latest.md',
  'reports/release-candidate-latest.md',
  'reports/post-deploy-smoke-latest.md',
  'reports/repository-readiness-latest.md',
  'reports/repository-bootstrap-latest.md',
  'reports/product-optimization-latest.md',
  'reports/product-gate-recovery-latest.md',
  'reports/product-gate-sample-plan-latest.md',
  'reports/first-move-coach-latest.md',
  'reports/completion-loop-latest.md',
  'reports/replay-loop-latest.md',
  'reports/production-bootstrap-latest.md',
  'reports/autonomous-operator-latest.md',
  'reports/autonomous-operator-history-latest.md',
  'reports/autonomous-cadence-latest.md',
  'reports/autonomous-self-update-latest.md',
  'reports/objective-audit-latest.md',
  'reports/autonomous-owner-loop-latest.md',
  'reports/production-environment-latest.md',
  'reports/icon-assets-latest.md',
  'reports/monetization-plan-latest.md',
  'reports/unit-economics-latest.md',
  'reports/android-release-latest.md',
  'reports/production-response-latest.md',
  'reports/incident-drill-latest.md',
  'reports/store-package-latest.md',
  'reports/store-assets-latest.md',
  'reports/store-listing-optimizer-latest.md',
  'reports/store-compliance-latest.md',
  'reports/android-signing-latest.md',
  'reports/native-package-latest.md',
  'reports/bot-simulation-latest.md',
  'reports/balance-auto-tuner-latest.md',
  'reports/applied-improvements-latest.md',
  'reports/release-health-latest.md',
  'reports/production-readiness-latest.md',
  'reports/promotion-decision-latest.md',
  'reports/deployment-plan-latest.md',
  'reports/autonomous-analyst-latest.md',
  'ops/production.env.example',
  'ops/github/README.md',
  'ops/github/bootstrap-repository.sh',
  'ops/github/setup-production.sh',
  'ops/codex/autonomous-game-lab-daily-owner-loop.json',
  'ops/cloudflare/event-collector-worker.mjs',
  'ops/cloudflare/README.md',
  'ops/cloudflare/wrangler.toml.example',
  'scripts/post-deploy-smoke.mjs',
  'scripts/lib/env-loader.mjs',
  'scripts/repository-readiness.mjs',
  'scripts/repository-bootstrap.mjs',
  'scripts/autonomous-cadence.mjs',
  'scripts/autonomous-self-update.mjs',
  'scripts/android-signing-prep.mjs',
  'public/icons/app-icon.svg',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'dist/release-candidate.json',
  'public/icons/maskable-192.png',
  'public/icons/maskable-512.png',
  'public/icons/apple-touch-icon.png',
  'public/icons/store-icon-1024.png',
  'public/robots.txt',
  'public/seed-kit.html',
  'public/sitemap.xml',
  'public/share-manifest.json',
  'public/compliance.json',
  'public/app-ads.txt',
  'public/monetization.json',
  'dist/compliance.json',
  'dist/seed-kit.html',
  'native/android/twa-manifest.json',
  'native/android/bubblewrap.config.json',
  'native/android/assetlinks.template.json',
  'native/android/README.md',
]

const fail = (message) => {
  console.error(message)
  process.exitCode = 1
}

for (const file of requiredFiles) {
  try {
    await readFile(path.join(root, file), 'utf8')
  } catch {
    fail(`Missing required autonomy artifact: ${file}`)
  }
}

const trend = JSON.parse(await readFile(path.join(root, 'data', 'trend-signals.json'), 'utf8'))
const trendCache = JSON.parse(await readFile(path.join(root, 'data', 'trend-cache.json'), 'utf8'))
const trendSourceReadiness = JSON.parse(await readFile(path.join(root, 'data', 'trend-source-readiness.json'), 'utf8'))
const concepts = JSON.parse(await readFile(path.join(root, 'data', 'generated-concepts.json'), 'utf8'))
const pipeline = JSON.parse(await readFile(path.join(root, 'data', 'prototype-pipeline.json'), 'utf8'))
const gameBalance = JSON.parse(await readFile(path.join(root, 'data', 'game-balance.json'), 'utf8'))
const experimentPolicy = JSON.parse(await readFile(path.join(root, 'data', 'experiment-policy.json'), 'utf8'))
const experimentResults = JSON.parse(await readFile(path.join(root, 'data', 'experiment-results.json'), 'utf8'))
const playable = JSON.parse(await readFile(path.join(root, 'data', 'playable-games.json'), 'utf8'))
const generatedPlayable = JSON.parse(await readFile(path.join(root, 'data', 'generated-playable-games.json'), 'utf8'))
const eventCollectorSmoke = JSON.parse(await readFile(path.join(root, 'data', 'event-collector-smoke.json'), 'utf8'))
const eventCollectorDeployment = JSON.parse(
  await readFile(path.join(root, 'data', 'event-collector-deployment.json'), 'utf8'),
)
const localEventBridge = JSON.parse(await readFile(path.join(root, 'data', 'local-event-bridge.json'), 'utf8'))
const eventIngest = JSON.parse(await readFile(path.join(root, 'data', 'event-ingest.json'), 'utf8'))
const eventIngestSmoke = JSON.parse(await readFile(path.join(root, 'data', 'event-ingest-smoke.json'), 'utf8'))
const analytics = JSON.parse(await readFile(path.join(root, 'data', 'analytics-rollup.json'), 'utf8'))
const growth = JSON.parse(await readFile(path.join(root, 'data', 'growth-plan.json'), 'utf8'))
const growthPolicy = JSON.parse(await readFile(path.join(root, 'data', 'growth-policy.json'), 'utf8'))
const growthOptimizer = JSON.parse(await readFile(path.join(root, 'data', 'growth-optimizer.json'), 'utf8'))
const portfolioPolicy = JSON.parse(await readFile(path.join(root, 'data', 'portfolio-policy.json'), 'utf8'))
const trafficSeeding = JSON.parse(await readFile(path.join(root, 'data', 'traffic-seeding.json'), 'utf8'))
const acquisitionLearning = JSON.parse(await readFile(path.join(root, 'data', 'acquisition-learning.json'), 'utf8'))
const retentionLoop = JSON.parse(await readFile(path.join(root, 'data', 'retention-loop.json'), 'utf8'))
const pwaInstallLoop = JSON.parse(await readFile(path.join(root, 'data', 'pwa-install-loop.json'), 'utf8'))
const performanceBudget = JSON.parse(await readFile(path.join(root, 'data', 'performance-budget.json'), 'utf8'))
const releaseCandidate = JSON.parse(await readFile(path.join(root, 'data', 'release-candidate.json'), 'utf8'))
const postDeploySmoke = JSON.parse(await readFile(path.join(root, 'data', 'post-deploy-smoke.json'), 'utf8'))
const localArtifactSmoke = postDeploySmoke.localArtifactSmoke ?? {}
const repositoryReadiness = JSON.parse(await readFile(path.join(root, 'data', 'repository-readiness.json'), 'utf8'))
const repositoryBootstrap = JSON.parse(await readFile(path.join(root, 'data', 'repository-bootstrap.json'), 'utf8'))
const productOptimization = JSON.parse(await readFile(path.join(root, 'data', 'product-optimization.json'), 'utf8'))
const productGateRecovery = JSON.parse(await readFile(path.join(root, 'data', 'product-gate-recovery.json'), 'utf8'))
const productGateSamplePlan = JSON.parse(
  await readFile(path.join(root, 'data', 'product-gate-sample-plan.json'), 'utf8'),
)
const firstMoveCoach = JSON.parse(await readFile(path.join(root, 'data', 'first-move-coach.json'), 'utf8'))
const completionLoop = JSON.parse(await readFile(path.join(root, 'data', 'completion-loop.json'), 'utf8'))
const replayLoop = JSON.parse(await readFile(path.join(root, 'data', 'replay-loop.json'), 'utf8'))
const productionBootstrap = JSON.parse(await readFile(path.join(root, 'data', 'production-bootstrap.json'), 'utf8'))
const autonomousOperator = JSON.parse(await readFile(path.join(root, 'data', 'autonomous-operator.json'), 'utf8'))
const autonomousOperatorHistory = JSON.parse(
  await readFile(path.join(root, 'data', 'autonomous-operator-history.json'), 'utf8'),
)
const autonomousCadence = JSON.parse(await readFile(path.join(root, 'data', 'autonomous-cadence.json'), 'utf8'))
const autonomousSelfUpdate = JSON.parse(
  await readFile(path.join(root, 'data', 'autonomous-self-update.json'), 'utf8'),
)
const objectiveAudit = JSON.parse(await readFile(path.join(root, 'data', 'objective-audit.json'), 'utf8'))
const autonomousOwnerLoop = JSON.parse(
  await readFile(path.join(root, 'data', 'autonomous-owner-loop.json'), 'utf8'),
)
const productionEnvironment = JSON.parse(await readFile(path.join(root, 'data', 'production-environment.json'), 'utf8'))
const iconAssets = JSON.parse(await readFile(path.join(root, 'data', 'icon-assets.json'), 'utf8'))
const monetizationPlan = JSON.parse(await readFile(path.join(root, 'data', 'monetization-plan.json'), 'utf8'))
const unitEconomics = JSON.parse(await readFile(path.join(root, 'data', 'unit-economics.json'), 'utf8'))
const androidRelease = JSON.parse(await readFile(path.join(root, 'data', 'android-release.json'), 'utf8'))
const productionResponse = JSON.parse(await readFile(path.join(root, 'data', 'production-response.json'), 'utf8'))
const incidentDrill = JSON.parse(await readFile(path.join(root, 'data', 'incident-drill.json'), 'utf8'))
const deployment = JSON.parse(await readFile(path.join(root, 'data', 'deployment-plan.json'), 'utf8'))
const storePackage = JSON.parse(await readFile(path.join(root, 'data', 'store-package.json'), 'utf8'))
const publicComplianceManifest = JSON.parse(await readFile(path.join(root, 'public', 'compliance.json'), 'utf8'))
const storeAssets = JSON.parse(await readFile(path.join(root, 'data', 'store-assets.json'), 'utf8'))
const storeListingOptimizer = JSON.parse(
  await readFile(path.join(root, 'data', 'store-listing-optimizer.json'), 'utf8'),
)
const storeCompliance = JSON.parse(await readFile(path.join(root, 'data', 'store-compliance.json'), 'utf8'))
const androidSigning = JSON.parse(await readFile(path.join(root, 'data', 'android-signing.json'), 'utf8'))
const nativePackage = JSON.parse(await readFile(path.join(root, 'data', 'native-package.json'), 'utf8'))
const balance = JSON.parse(await readFile(path.join(root, 'data', 'balance-report.json'), 'utf8'))
const readiness = JSON.parse(await readFile(path.join(root, 'data', 'production-readiness.json'), 'utf8'))
const releaseHealth = JSON.parse(await readFile(path.join(root, 'data', 'release-health.json'), 'utf8'))
const promotion = JSON.parse(await readFile(path.join(root, 'data', 'promotion-decision.json'), 'utf8'))
const applied = JSON.parse(await readFile(path.join(root, 'data', 'applied-improvements.json'), 'utf8'))
const backlog = JSON.parse(await readFile(path.join(root, 'data', 'improvement-backlog.json'), 'utf8'))
const improvementRouting = JSON.parse(await readFile(path.join(root, 'data', 'improvement-routing.json'), 'utf8'))
const workflow = await readFile(path.join(root, '.github', 'workflows', 'autonomous-daily.yml'), 'utf8')
const selfUpdateWorkflow = await readFile(path.join(root, '.github', 'workflows', 'autonomous-self-update.yml'), 'utf8')
const androidWorkflow = await readFile(path.join(root, '.github', 'workflows', 'android-twa-release.yml'), 'utf8')
const collectorWorkflow = await readFile(path.join(root, '.github', 'workflows', 'event-collector-deploy.yml'), 'utf8')
const webDeployWorkflow = await readFile(path.join(root, '.github', 'workflows', 'web-pwa-deploy.yml'), 'utf8')
const shareManifest = JSON.parse(await readFile(path.join(root, 'public', 'share-manifest.json'), 'utf8'))
const seedKitHtml = await readFile(path.join(root, 'public', 'seed-kit.html'), 'utf8')
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const appSource = await readFile(path.join(root, 'src', 'App.tsx'), 'utf8')
const gameCanvasSource = await readFile(path.join(root, 'src', 'components', 'GameCanvas.tsx'), 'utf8')
const harborRingsSource = await readFile(path.join(root, 'src', 'game', 'HarborRingsScene.ts'), 'utf8')
const generatedPuzzleSource = await readFile(path.join(root, 'src', 'game', 'GeneratedPuzzleScene.ts'), 'utf8')
const distIndexHtml = await readFile(path.join(root, 'dist', 'index.html'), 'utf8')
const analyticsLibSource = await readFile(path.join(root, 'src', 'lib', 'analytics.ts'), 'utf8')
const analyticsRollupSource = await readFile(path.join(root, 'scripts', 'analytics-rollup.mjs'), 'utf8')
const envLoaderSource = await readFile(path.join(root, 'scripts', 'lib', 'env-loader.mjs'), 'utf8')
const productionEnvironmentSource = await readFile(path.join(root, 'scripts', 'production-environment.mjs'), 'utf8')
const eventCollectorWorkerSource = await readFile(
  path.join(root, 'ops', 'cloudflare', 'event-collector-worker.mjs'),
  'utf8',
)
const eventCollectorDeployPlanSource = await readFile(
  path.join(root, 'scripts', 'event-collector-deploy-plan.mjs'),
  'utf8',
)
const productionBootstrapSource = await readFile(path.join(root, 'scripts', 'production-bootstrap.mjs'), 'utf8')
const postDeploySmokeSource = await readFile(path.join(root, 'scripts', 'post-deploy-smoke.mjs'), 'utf8')
const repositoryReadinessSource = await readFile(path.join(root, 'scripts', 'repository-readiness.mjs'), 'utf8')
const repositoryBootstrapSource = await readFile(path.join(root, 'scripts', 'repository-bootstrap.mjs'), 'utf8')
const portfolioPolicySource = await readFile(path.join(root, 'scripts', 'portfolio-policy.mjs'), 'utf8')
const retentionLoopSource = await readFile(path.join(root, 'scripts', 'retention-loop.mjs'), 'utf8')
const trafficSeedingSource = await readFile(path.join(root, 'scripts', 'traffic-seeding.mjs'), 'utf8')
const productGateSamplePlanSource = await readFile(
  path.join(root, 'scripts', 'product-gate-sample-planner.mjs'),
  'utf8',
)
const autonomousOperatorSource = await readFile(path.join(root, 'scripts', 'autonomous-operator.mjs'), 'utf8')
const autonomousOwnerLoopSource = await readFile(path.join(root, 'scripts', 'autonomous-owner-loop.mjs'), 'utf8')
const autonomousSelfUpdateSource = await readFile(path.join(root, 'scripts', 'autonomous-self-update.mjs'), 'utf8')
const localEventBridgeSource = await readFile(path.join(root, 'scripts', 'local-event-bridge.mjs'), 'utf8')
const androidSigningSource = await readFile(path.join(root, 'scripts', 'android-signing-prep.mjs'), 'utf8')
const objectiveAuditSource = await readFile(path.join(root, 'scripts', 'objective-audit.mjs'), 'utf8')
const githubRepositoryBootstrapScript = await readFile(path.join(root, 'ops', 'github', 'bootstrap-repository.sh'), 'utf8')
const githubSetupScript = await readFile(path.join(root, 'ops', 'github', 'setup-production.sh'), 'utf8')
const githubSetupReadme = await readFile(path.join(root, 'ops', 'github', 'README.md'), 'utf8')
const codexAutomationManifest = JSON.parse(
  await readFile(path.join(root, 'ops', 'codex', 'autonomous-game-lab-daily-owner-loop.json'), 'utf8'),
)
const gitignoreSource = await readFile(path.join(root, '.gitignore'), 'utf8')
const playableIds = new Set(playable.games ?? [])
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : value)
const extractQuotedValues = (source) => [...source.matchAll(/'([^']+)'/g)].map((match) => match[1])
const analyticsEventTypeSource = analyticsLibSource.slice(
  analyticsLibSource.indexOf('export type AnalyticsEventName'),
  analyticsLibSource.indexOf('export type AnalyticsProperties'),
)
const collectorAllowedEventSource = eventCollectorWorkerSource.slice(
  eventCollectorWorkerSource.indexOf('const allowedEventNames'),
  eventCollectorWorkerSource.indexOf('const sensitivePropertyKeys'),
)
const analyticsEventNames = extractQuotedValues(analyticsEventTypeSource)
const collectorAllowedEventNames = new Set(extractQuotedValues(collectorAllowedEventSource))
const missingCollectorEventNames = analyticsEventNames.filter((eventName) => !collectorAllowedEventNames.has(eventName))
const corePlayableIds = new Set([
  'harbor-rings',
  'lantern-relay',
  'harbor-circuit',
  'foundry-ledger',
  'orbit-atlas',
])

if (!trend.signals?.mechanics?.length) {
  fail('Trend radar did not produce mechanic signals.')
}

if (!trend.signals?.themes?.length) {
  fail('Trend radar did not produce theme signals.')
}

if (
  !['bgg-hotness-live', 'bgg-hotness-cache', 'fixture'].includes(trend.sourceStatus?.activeSource) ||
  !trend.sourceStatus?.cache ||
  !trend.sourceStatus?.note?.includes('bearer authorization')
) {
  fail('Trend radar must publish licensed live/cache/fixture source status.')
}

if (
  !['live-licensed', 'cached-licensed', 'fixture-safe'].includes(trendSourceReadiness.status) ||
  trendSourceReadiness.activeSource !== trend.sourceStatus.activeSource ||
  trendSourceReadiness.policy?.officialUrl !== 'https://boardgamegeek.com/using_the_xml_api' ||
  trendSourceReadiness.bggHotness?.authorizationRequired !== true
) {
  fail('Trend source readiness must document licensed BGG access and safe fallback status.')
}

if (
  trendSourceReadiness.status === 'fixture-safe' &&
  (trendCache.items?.length ?? 0) > 0 &&
  trend.sourceStatus.cache?.usable === true
) {
  fail('Trend radar should use a usable licensed cache before falling back to fixtures.')
}

const acceptedConcepts = concepts.concepts?.filter((concept) => concept.status === 'candidate') ?? []

if (acceptedConcepts.length < 2) {
  fail('Concept generator must produce at least two accepted candidates.')
}

const unsafeConcept = acceptedConcepts.find(
  (concept) => concept.sourceDistance?.copiedExpressionRisk !== 'low',
)

if (unsafeConcept) {
  fail(`Concept failed IP guardrail: ${unsafeConcept.title}`)
}

if (!backlog.length) {
  fail('Analyst backlog is empty.')
}

const staleBacklogIssue = backlog.find((issue) => issue.gameId && !playableIds.has(issue.gameId))

if (staleBacklogIssue) {
  fail(`Analyst backlog targets a game that is not currently playable: ${staleBacklogIssue.gameId}`)
}

if (
  improvementRouting.status !== 'live-targets-ready' ||
  improvementRouting.backlogCount !== backlog.length ||
  !Array.isArray(improvementRouting.inactiveAnalyticsRows) ||
  !Array.isArray(improvementRouting.playableGameIds) ||
  improvementRouting.playableGameIds.length !== playableIds.size
) {
  fail('Analyst must publish live-target routing and keep stale analytics out of the actionable backlog.')
}

if (!analytics.games?.length || !analytics.totals?.metrics || !analytics.sourceStatus?.activeSource) {
  fail('Analytics rollup must produce game metrics and identify its active source.')
}

if (
  !['imported', 'idle-duplicates', 'idle-no-files'].includes(eventIngest.status) ||
  eventIngest.outputDirectory !== 'data/player-events' ||
  !Array.isArray(eventIngest.sourceDirectories) ||
  !eventIngest.sourceDirectories.length
) {
  fail('Event ingestor must publish local player-event import status and source directories.')
}

const localExplicitDownloadsScan = localEventBridge.explicitDownloadsScan
const localEventBridgeHasExplicitDownloadsScan = Object.hasOwn(localEventBridge, 'explicitDownloadsScan')
const localExplicitDownloadsScanValid =
  localExplicitDownloadsScan === null ||
  (typeof localExplicitDownloadsScan === 'object' &&
    typeof localExplicitDownloadsScan.scannedAt === 'string' &&
    ['evidence-found', 'no-evidence-found'].includes(localExplicitDownloadsScan.status) &&
    typeof localExplicitDownloadsScan.matchedFiles === 'number' &&
    typeof localExplicitDownloadsScan.validFiles === 'number' &&
    typeof localExplicitDownloadsScan.validEvents === 'number' &&
    typeof localExplicitDownloadsScan.copiedFiles === 'number' &&
    typeof localExplicitDownloadsScan.evidenceFound === 'boolean')

if (
  !['bridge-ready-for-ingest', 'bridge-local-events-active', 'bridge-waiting-for-export'].includes(
    localEventBridge.status,
  ) ||
  localEventBridge.inbox?.directory !== 'data/player-events/inbox' ||
  localEventBridge.imported?.directory !== eventIngest.outputDirectory ||
  localEventBridge.eventDropContract?.filenamePattern !== 'player-events*.json' ||
  localEventBridge.eventDropContract?.importCommand !== 'npm run autonomous:import-events' ||
  localEventBridge.eventDropContract?.rollupCommand !== 'npm run autonomous:analytics' ||
  !localEventBridge.eventDropContract?.downloadsImportCommand?.includes('AGL_LOCAL_EVENT_IMPORT_DOWNLOADS=true') ||
  localEventBridge.controls?.zeroPaidSpend !== true ||
  localEventBridge.controls?.localOnly !== true ||
  localEventBridge.controls?.noExternalUpload !== true ||
  localEventBridge.controls?.noSyntheticEvents !== true ||
  localEventBridge.controls?.copyOnlyExplicitDropPaths !== true ||
  localEventBridge.controls?.downloadsFolderOptInOnly !== true ||
  localEventBridge.controls?.downloadsFolderRequiresExplicitEnv !== true ||
  typeof localEventBridge.gateSampleEvidence?.imported?.events !== 'number' ||
  typeof localEventBridge.gateSampleEvidence?.inbox?.events !== 'number' ||
  !localEventBridgeHasExplicitDownloadsScan ||
  !localExplicitDownloadsScanValid ||
  !Array.isArray(localEventBridge.sourceDirectories) ||
  !localEventBridge.sourceDirectories.some((directory) => directory.role === 'inbox') ||
  !localEventBridgeSource.includes('AGL_LOCAL_EVENT_IMPORT_DOWNLOADS') ||
  !localEventBridgeSource.includes('downloads-opt-in') ||
  !localEventBridgeSource.includes('explicitDownloadsScan') ||
  !localEventBridgeSource.includes('previousBridge') ||
  !localEventBridgeSource.includes('AGL_LOCAL_EVENT_DROP_DIRS') ||
  !localEventBridgeSource.includes('copyFile') ||
  !appSource.includes('Local Event Bridge')
) {
  fail('Local event bridge must validate browser event drops, preserve zero-spend local-only controls, and surface the ingest contract.')
}

for (const importedFile of eventIngest.importedFiles ?? []) {
  try {
    await readFile(path.join(root, importedFile.targetPath), 'utf8')
  } catch {
    fail(`Event ingestor recorded a missing imported event file: ${importedFile.targetPath}`)
  }
}

if (
  analytics.sourceStatus.localEventDrops?.directory !== eventIngest.outputDirectory ||
  typeof analytics.sourceStatus.localEventDrops?.events !== 'number'
) {
  fail('Analytics rollup must consume the event ingestor output directory.')
}

if (
  eventIngestSmoke.status !== 'pass' ||
  eventIngestSmoke.bridge?.status !== 'bridge-ready-for-ingest' ||
  eventIngestSmoke.bridge?.copiedFiles !== 1 ||
  eventIngestSmoke.bridge?.inboxValidEvents < 6 ||
  eventIngestSmoke.bridge?.noSyntheticEvents !== true ||
  eventIngestSmoke.bridge?.noExternalUpload !== true ||
  !eventIngestSmoke.bridge?.downloadsOptInCommand?.includes('AGL_LOCAL_EVENT_IMPORT_DOWNLOADS=true') ||
  eventIngestSmoke.downloadsBridge?.copiedFiles !== 1 ||
  eventIngestSmoke.downloadsBridge?.downloadsImportEnabled !== true ||
  eventIngestSmoke.downloadsBridge?.explicitScanStatus !== 'evidence-found' ||
  eventIngestSmoke.downloadsBridge?.explicitScanEvidenceFound !== true ||
  eventIngestSmoke.downloadsBridge?.explicitScanCopiedFiles !== 1 ||
  eventIngestSmoke.followupBridge?.downloadsImportEnabled !== false ||
  eventIngestSmoke.followupBridge?.explicitScanStatus !== 'evidence-found' ||
  eventIngestSmoke.followupBridge?.explicitScanEvidenceFound !== true ||
  eventIngestSmoke.downloadsBridge?.gateSampleEvents < 3 ||
  eventIngestSmoke.downloadsBridge?.campaignId !== 'gate-sample-smoke-firstGameCompletion' ||
  eventIngestSmoke.ingest?.status !== 'imported' ||
  eventIngestSmoke.ingest?.importedEvents < 6 ||
  eventIngestSmoke.incrementalIngest?.status !== 'imported' ||
  eventIngestSmoke.incrementalIngest?.importedEvents !== 1 ||
  eventIngestSmoke.incrementalIngest?.duplicateEvents < 12 ||
  eventIngestSmoke.incrementalIngest?.importedFileDuplicateEvents < 6 ||
  eventIngestSmoke.analytics?.activeSource !== 'local-event-drops' ||
  eventIngestSmoke.analytics?.retentionSource !== 'local-event-drops' ||
  eventIngestSmoke.analytics?.d1Retention !== 1 ||
  eventIngestSmoke.analytics?.counts?.game_viewed < 3 ||
  eventIngestSmoke.analytics?.counts?.game_started < 2 ||
  eventIngestSmoke.analytics?.counts?.tutorial_completed < 1 ||
  eventIngestSmoke.analytics?.counts?.level_completed < 1
) {
  fail('Event ingest smoke must prove exported player events become deduped local analytics, retention metrics, and opt-in gate-sample downloads.')
}

if (
  missingCollectorEventNames.length > 0 ||
  eventCollectorSmoke.status !== 'pass' ||
  eventCollectorSmoke.collector?.postStatus !== 'accepted' ||
  eventCollectorSmoke.collector?.storedEvents < 5 ||
  eventCollectorSmoke.collector?.exportedEvents < 5 ||
  eventCollectorSmoke.collector?.piiStripped !== true ||
  eventCollectorSmoke.ingest?.status !== 'imported' ||
  eventCollectorSmoke.ingest?.remoteCollectorStatus !== 'available' ||
  eventCollectorSmoke.analytics?.activeSource !== 'local-event-drops' ||
  eventCollectorSmoke.analytics?.retentionSource !== 'local-event-drops' ||
  eventCollectorSmoke.analytics?.d1Retention !== 1 ||
  eventCollectorSmoke.analytics?.counts?.game_started < 1 ||
  eventCollectorSmoke.analytics?.counts?.gate_sample_mission_clicked < 1 ||
  eventCollectorSmoke.analytics?.counts?.first_move_coach_shown < 1 ||
  eventCollectorSmoke.analytics?.counts?.completion_nudge_viewed < 1 ||
  eventCollectorSmoke.analytics?.counts?.replay_prompt_clicked < 1 ||
  eventCollectorSmoke.analytics?.counts?.daily_return_prompt_clicked < 1 ||
  eventCollectorSmoke.analytics?.counts?.pwa_install_prompt_available < 1 ||
  eventCollectorSmoke.analytics?.counts?.pwa_install_prompt_clicked < 1 ||
  eventCollectorSmoke.analytics?.counts?.pwa_install_prompt_cooldown < 1 ||
  eventCollectorSmoke.analytics?.counts?.level_completed < 1
) {
  fail(
    `Event collector smoke must prove Worker events export, import, PII stripping, app event allowlisting, and roll up into analytics. Missing collector events: ${missingCollectorEventNames.join(', ') || 'none'}.`,
  )
}

if (
  !['ready-for-worker-deploy', 'blocked-needs-cloudflare-env', 'blocked'].includes(eventCollectorDeployment.status) ||
  eventCollectorDeployment.provider !== 'cloudflare-worker-r2' ||
  eventCollectorDeployment.smoke?.status !== eventCollectorSmoke.status ||
  eventCollectorDeployment.smoke?.piiStripped !== true ||
  eventCollectorDeployment.workflow?.path !== '.github/workflows/event-collector-deploy.yml' ||
  !eventCollectorDeployment.checks?.some((check) => check.id === 'worker-source' && check.status === 'pass') ||
  !eventCollectorDeployment.checks?.some((check) => check.id === 'collector-smoke' && check.status === 'pass') ||
  !eventCollectorDeployment.checks?.some((check) => check.id === 'deploy-workflow' && check.status === 'pass')
) {
  fail('Event collector deployment plan must cover Worker source, smoke validation, workflow, and configured/blocker states.')
}

if (typeof analytics.totals.metrics.d1Retention !== 'number' || !analytics.retention?.source) {
  fail('Analytics rollup must produce a numeric D1 retention metric and identify its retention source.')
}

if (analytics.retention.source === 'fixture-retention' && analytics.retention.eligibleUsers < 1) {
  fail('Analytics retention fixture fallback is empty.')
}

if (analytics.sourceStatus.activeSource === 'fixture-sample' && analytics.sourceStatus.fallbackSample?.rows < 1) {
  fail('Analytics fixture fallback is empty.')
}

if (
  growth.status !== 'growth-assets-ready' ||
  !growth.gamePages?.length ||
  !growth.channels?.some((channel) => channel.id === 'organic-search') ||
  !growth.channels?.some((channel) => channel.id === 'player-sharing')
) {
  fail('Growth planner must produce search and sharing assets for playable games.')
}

const growthPageIds = new Set(growth.gamePages.map((game) => game.gameId))
const growthMissingPlayable = playable.games?.find((gameId) => !growthPageIds.has(gameId))

if (growthMissingPlayable) {
  fail(`Growth planner missing playable game page: ${growthMissingPlayable}`)
}

const growthExtraGamePage = growth.gamePages.find((game) => !playableIds.has(game.gameId))

if (growthExtraGamePage) {
  fail(`Growth planner published a stale non-playable game page: ${growthExtraGamePage.gameId}`)
}

const expectedPublicGamePages = new Set(growth.gamePages.map((game) => `${game.gameId}.html`))
const actualPublicGamePages = (await readdir(path.join(root, 'public', 'games'))).filter((file) =>
  file.endsWith('.html'),
)
const stalePublicGamePage = actualPublicGamePages.find((file) => !expectedPublicGamePages.has(file))

if (stalePublicGamePage) {
  fail(`Growth planner left a stale public game page: ${stalePublicGamePage}`)
}

const actualDistGamePages = (await readdir(path.join(root, 'dist', 'games')).catch(() => [])).filter((file) =>
  file.endsWith('.html'),
)
const staleDistGamePage = actualDistGamePages.find((file) => !expectedPublicGamePages.has(file))

if (staleDistGamePage) {
  fail(`Production build contains a stale game page: ${staleDistGamePage}`)
}

const staleGrowthPolicy = Object.keys(growthPolicy.games ?? {}).find((gameId) => !playableIds.has(gameId))

if (staleGrowthPolicy) {
  fail(`Growth optimizer policy targets a non-playable game: ${staleGrowthPolicy}`)
}

const staleGrowthOptimizerSummary = growthOptimizer.policySummary?.activeChanges?.find(
  (item) => !playableIds.has(item.gameId),
)

if (staleGrowthOptimizerSummary) {
  fail(`Growth optimizer summary includes a non-playable game: ${staleGrowthOptimizerSummary.gameId}`)
}

if (
  !growthOptimizer.actions?.length ||
  !growthPolicy.guardrails?.allowedCtaVariants?.length ||
  typeof growth.optimization?.optimizedGames !== 'number'
) {
  fail('Growth optimizer must produce guarded acquisition actions and feed the growth plan.')
}

const portfolioGameIds = new Set((portfolioPolicy.games ?? []).map((game) => game.gameId))
const portfolioOrderedIds = portfolioPolicy.rotation?.orderedGameIds ?? []
const stalePortfolioGame = [...portfolioGameIds].find((gameId) => !playableIds.has(gameId))
const missingPortfolioGame = [...playableIds].find((gameId) => !portfolioGameIds.has(gameId))
const duplicatePortfolioOrder = portfolioOrderedIds.find((gameId, index) => portfolioOrderedIds.indexOf(gameId) !== index)
const utcDailyPattern = 'new Date().toISOString().slice(0, 10)'

if (
  portfolioPolicy.status !== 'portfolio-policy-ready' ||
  portfolioPolicy.analyticsSource !== analytics.sourceStatus.activeSource ||
  portfolioPolicy.guardrails?.minPlayableGames < 10 ||
  portfolioPolicy.guardrails?.noRetireWithoutLiveData !== true ||
  portfolioPolicy.guardrails?.noPaidPromotion !== true ||
  !playableIds.has(portfolioPolicy.dailyChallenge?.gameId) ||
  portfolioPolicy.games?.length !== playableIds.size ||
  portfolioOrderedIds.length !== playableIds.size ||
  stalePortfolioGame ||
  missingPortfolioGame ||
  duplicatePortfolioOrder
) {
  fail('Portfolio policy must rank every playable game exactly once with no-spend and no-retirement guardrails.')
}

if (
  portfolioPolicySource.includes(`const today = ${utcDailyPattern}`) ||
  retentionLoopSource.includes(`const today = ${utcDailyPattern}`) ||
  trafficSeedingSource.includes(`new Date().toISOString().slice(0, 10).replaceAll('-', '')`) ||
  productGateSamplePlanSource.includes(`new Date().toISOString().slice(0, 10).replaceAll('-', '')`) ||
  !portfolioPolicySource.includes('const today = localIsoDate()') ||
  !retentionLoopSource.includes('const today = localIsoDate()') ||
  !trafficSeedingSource.includes('const slugDate = () => localIsoDate().replaceAll') ||
  !productGateSamplePlanSource.includes('const todaySlug = () => localIsoDate().replaceAll')
) {
  fail('Daily portfolio, retention, campaign, and sample scripts must use the local runner date, not the UTC date.')
}

const portfolioBacklogMiss = backlog.find(
  (issue) =>
    issue.gameId &&
    playableIds.has(issue.gameId) &&
    !portfolioPolicy.games?.some((game) => game.gameId === issue.gameId && game.action === 'improve'),
)

if (portfolioBacklogMiss) {
  fail(`Portfolio policy must mark playable backlog target for improvement: ${portfolioBacklogMiss.gameId}`)
}

if (!portfolioPolicy.rotation?.seedTrafficGameIds?.some((gameId) => playableIds.has(gameId))) {
  fail('Portfolio policy must identify at least one playable game that needs traffic before judgment.')
}

const trafficCampaigns = trafficSeeding.campaigns ?? []
const trafficCampaignByGame = new Map(trafficCampaigns.map((campaign) => [campaign.gameId, campaign]))
const missingSeedCampaign = (portfolioPolicy.rotation?.seedTrafficGameIds ?? []).find(
  (gameId) => playableIds.has(gameId) && !trafficCampaignByGame.has(gameId),
)
const invalidTrafficCampaign = trafficCampaigns.find(
  (campaign) =>
    !playableIds.has(campaign.gameId) ||
    campaign.costUsd !== 0 ||
    campaign.noPaidPromotion !== true ||
    !campaign.playPath?.includes('utm_source=seed_internal') ||
    !campaign.sharePath?.includes('utm_source=seed_share') ||
    !campaign.shareUrl?.includes('utm_source=seed_share') ||
    campaign.measurement?.targetStartsBeforeJudgment < trafficSeeding.guardrails?.minimumStartsBeforeQualityJudgment ||
    !campaign.measurement?.successEvents?.includes('seed_campaign_clicked') ||
    !campaign.measurement?.successEvents?.includes('game_started') ||
    !campaign.channels?.includes('internal-rotation') ||
    !campaign.channels?.includes('organic-page') ||
    !campaign.channels?.includes('player-share'),
)
const trafficChannelIds = new Set((trafficSeeding.channels ?? []).map((channel) => channel.id))
const paidTrafficChannel = (trafficSeeding.channels ?? []).find((channel) => channel.costUsd !== 0)
const shareSeedCampaigns = shareManifest.seedCampaigns ?? []
const shareSeedCampaignIds = new Set(shareSeedCampaigns.map((campaign) => campaign.id))
const missingShareSeedCampaign = trafficCampaigns.find((campaign) => !shareSeedCampaignIds.has(campaign.id))
const staleShareSeedCampaign = shareSeedCampaigns.find(
  (campaign) => !trafficCampaigns.some((trafficCampaign) => trafficCampaign.id === campaign.id),
)
const missingSeedKitCampaign = trafficCampaigns.find(
  (campaign) => !seedKitHtml.includes(campaign.id) || !seedKitHtml.includes(campaign.sharePath.replaceAll('&', '&amp;')),
)

if (
  trafficSeeding.status !== 'traffic-seeding-ready' ||
  trafficSeeding.analyticsSource !== analytics.sourceStatus.activeSource ||
  trafficSeeding.guardrails?.maxCostUsd !== 0 ||
  trafficSeeding.guardrails?.noPaidPromotion !== true ||
  trafficSeeding.guardrails?.noExternalPostingWithoutCredentials !== true ||
  trafficSeeding.guardrails?.noAutomatedExternalPosting !== true ||
  trafficSeeding.guardrails?.playerInitiatedSharingOnly !== true ||
  trafficSeeding.guardrails?.minimumStartsBeforeQualityJudgment < 40 ||
  !trafficCampaigns.length ||
  missingSeedCampaign ||
  invalidTrafficCampaign ||
  !trafficChannelIds.has('internal-rotation') ||
  !trafficChannelIds.has('organic-page') ||
  !trafficChannelIds.has('player-share') ||
  paidTrafficChannel ||
  shareSeedCampaigns.length !== trafficCampaigns.length ||
  missingShareSeedCampaign ||
  staleShareSeedCampaign ||
  missingSeedKitCampaign ||
  shareManifest.seedKit?.path !== '/seed-kit.html' ||
  shareManifest.seedKit?.campaignCount !== trafficCampaigns.length ||
  shareManifest.seedKit?.costUsd !== 0 ||
  shareManifest.seedKit?.playerInitiatedSharingOnly !== true ||
  shareManifest.seedKit?.copyShareControls !== true ||
  !seedKitHtml.includes('Autonomous Game Lab Seed Kit') ||
  !seedKitHtml.includes('$0.00 spend') ||
  !seedKitHtml.includes('data-seed-action="copy"') ||
  !seedKitHtml.includes('data-seed-action="share"') ||
  !seedKitHtml.includes('navigator.share') ||
  seedKitHtml.includes('autonomous-game-lab.example.com')
) {
  fail('Traffic seeding must publish zero-cost campaigns, UTM/share links, a runtime-origin seed kit, player-initiated sharing controls, and sample-size guardrails for every seed game.')
}

if (
  !appSource.includes('resolveRuntimeCampaignUrl') ||
  !appSource.includes('replaceHistoryWithCampaignUrl') ||
  !appSource.includes('autonomous-game-lab.example.com') ||
  !appSource.includes('window.location.origin') ||
  !appSource.includes('navigator.clipboard.writeText(resolvedShareUrl)') ||
  !appSource.includes('replaceHistoryWithCampaignUrl(campaign.playPath')
) {
  fail('Traffic seeding runtime must resolve generated placeholder URLs to the active PWA origin before navigation or sharing.')
}

const acquisitionCampaigns = acquisitionLearning.campaigns ?? []
const acquisitionCampaignIds = new Set(acquisitionCampaigns.map((campaign) => campaign.id))
const missingAcquisitionCampaign = trafficCampaigns.find((campaign) => !acquisitionCampaignIds.has(campaign.id))
const invalidAcquisitionCampaign = acquisitionCampaigns.find(
  (campaign) =>
    !trafficCampaigns.some((trafficCampaign) => trafficCampaign.id === campaign.id) ||
    !playableIds.has(campaign.gameId) ||
    campaign.costUsd !== 0 ||
    campaign.noPaidPromotion !== true ||
    campaign.metrics?.targetStarts < acquisitionLearning.guardrails?.minimumAttributedStartsBeforeJudgment ||
    typeof campaign.attribution?.attributedStarts !== 'number' ||
    typeof campaign.attribution?.aggregateStarts !== 'number' ||
    ![
      'collecting-attribution',
      'collecting-sample',
      'candidate-feature',
      'needs-copy-test',
      'blocked-spend-risk',
    ].includes(campaign.status),
)
const invalidAcquisitionChannel = (acquisitionLearning.channels ?? []).find((channel) => channel.costUsd !== 0)

if (
  acquisitionLearning.status !== 'acquisition-learning-ready' ||
  acquisitionLearning.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  acquisitionLearning.guardrails?.maxCostUsd !== 0 ||
  acquisitionLearning.guardrails?.noPaidPromotion !== true ||
  acquisitionLearning.guardrails?.requireCampaignAttribution !== true ||
  acquisitionLearning.guardrails?.minimumAttributedStartsBeforeJudgment < 40 ||
  acquisitionCampaigns.length !== trafficCampaigns.length ||
  acquisitionLearning.summary?.campaigns !== acquisitionCampaigns.length ||
  typeof acquisitionLearning.summary?.totalAttributedStarts !== 'number' ||
  typeof acquisitionLearning.summary?.totalAggregateStarts !== 'number' ||
  missingAcquisitionCampaign ||
  invalidAcquisitionCampaign ||
  invalidAcquisitionChannel ||
  !acquisitionLearning.nextActions?.length
) {
  fail('Acquisition learning must connect seed campaigns to zero-spend attributed-start decisions.')
}

const retentionMissionIds = new Set((retentionLoop.missions ?? []).map((mission) => mission.id))
const retentionPromptEvents = [
  'daily_return_prompt_viewed',
  'daily_return_prompt_clicked',
  'daily_return_prompt_dismissed',
  'daily_return_intent_viewed',
  'daily_return_intent_started',
  'daily_return_intent_cleared',
]
const rewardOfferWinner = experimentResults.recommendations?.find(
  (recommendation) => recommendation.experiment === 'reward_offer',
)?.winnerVariant
const dailyStreakWeight = experimentPolicy.experiments?.reward_offer?.variants?.find(
  (variant) => variant.id === 'daily-streak',
)?.weight

if (
  retentionLoop.status !== 'retention-loop-ready' ||
  retentionLoop.dailyChallenge?.gameId !== portfolioPolicy.dailyChallenge?.gameId ||
  retentionLoop.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  retentionLoop.sourceStatus?.retentionSource !== analytics.retention?.source ||
  retentionLoop.metrics?.d1Retention !== roundMetric(analytics.totals.metrics.d1Retention) ||
  retentionLoop.metrics?.replayRate !== roundMetric(analytics.totals.metrics.replayRate) ||
  retentionLoop.metrics?.firstGameCompletion !== roundMetric(analytics.totals.metrics.firstGameCompletion) ||
  retentionLoop.metrics?.eligibleUsers !== analytics.retention?.eligibleUsers ||
  retentionLoop.metrics?.retainedUsers !== analytics.retention?.retainedUsers ||
  retentionLoop.guardrails?.noPushNotifications !== true ||
  retentionLoop.guardrails?.noAccountsRequired !== true ||
  retentionLoop.guardrails?.noDarkPatterns !== true ||
  retentionLoop.guardrails?.noPaidRetentionMechanics !== true ||
  retentionLoop.guardrails?.noRewardedAdsUntilMonetizationGatesPass !== true ||
  retentionLoop.guardrails?.noNotificationPermissionRequest !== true ||
  retentionLoop.localState?.storageKey !== 'agl.retention.dailyStreak' ||
  retentionLoop.localState?.dateKey !== 'agl.retention.lastCompletedDate' ||
  retentionLoop.localState?.bestKey !== 'agl.retention.bestDailyStreak' ||
  retentionLoop.localState?.returnIntentKey !== 'agl.retention.returnIntentDate' ||
  retentionLoop.localState?.returnPromptDismissedKey !== 'agl.retention.returnPromptDismissedDate' ||
  retentionLoop.localState?.returnIntentStartedKey !== 'agl.retention.returnIntentStartedDate' ||
  retentionLoop.localState?.returnIntentClearedKey !== 'agl.retention.returnIntentClearedDate' ||
  retentionLoop.rewardPolicy?.recommendedVariant !== (rewardOfferWinner ?? 'daily-streak') ||
  retentionLoop.rewardPolicy?.currentDailyStreakWeight !== dailyStreakWeight ||
  !['armed', 'monitor'].includes(retentionLoop.promptPolicy?.status) ||
  retentionLoop.promptPolicy?.surface !== 'autonomy-cockpit-retention-card' ||
  retentionLoop.promptPolicy?.trigger !== 'after-completed-run' ||
  retentionLoop.promptPolicy?.telemetry?.viewed !== 'daily_return_prompt_viewed' ||
  retentionLoop.promptPolicy?.telemetry?.clicked !== 'daily_return_prompt_clicked' ||
  retentionLoop.promptPolicy?.telemetry?.dismissed !== 'daily_return_prompt_dismissed' ||
  !['armed', 'monitor'].includes(retentionLoop.returnIntentPolicy?.status) ||
  retentionLoop.returnIntentPolicy?.surface !== 'autonomy-cockpit-return-intent-card' ||
  retentionLoop.returnIntentPolicy?.trigger !== 'app-load-with-local-return-intent' ||
  retentionLoop.returnIntentPolicy?.telemetry?.viewed !== 'daily_return_intent_viewed' ||
  retentionLoop.returnIntentPolicy?.telemetry?.started !== 'daily_return_intent_started' ||
  retentionLoop.returnIntentPolicy?.telemetry?.cleared !== 'daily_return_intent_cleared' ||
  retentionLoop.measurementPolicy?.source !== 'player-exported-events' ||
  retentionLoop.measurementPolicy?.retainedEvent !== 'daily_return_intent_started' ||
  retentionLoop.measurementPolicy?.cohortDateProperty !== 'retentionCohortDate' ||
  retentionLoop.measurementPolicy?.returnDateProperty !== 'retentionReturnDate' ||
  retentionLoop.measurementPolicy?.evidenceValue !== 'queued-return-intent' ||
  retentionLoop.measurementPolicy?.requiresAnonymousId !== true ||
  retentionLoop.measurementPolicy?.noSyntheticEvents !== true ||
  retentionLoop.controls?.returnIntentPlayerInitiatedOnly !== true ||
  retentionLoop.controls?.noBackgroundWakeups !== true ||
  !retentionMissionIds.has('finish-daily-challenge') ||
  !retentionMissionIds.has('return-tomorrow') ||
  !retentionMissionIds.has('confirm-return-intent') ||
  !retentionMissionIds.has('activate-return-intent') ||
  !retentionMissionIds.has('share-daily-seed') ||
  !retentionLoop.missions?.some(
    (mission) =>
      mission.id === 'finish-daily-challenge' &&
      mission.event === 'daily_challenge_completed' &&
      mission.gameId === retentionLoop.dailyChallenge?.gameId &&
      mission.status === 'armed',
  ) ||
  !retentionLoop.missions?.some(
    (mission) =>
      mission.id === 'confirm-return-intent' &&
      mission.event === 'daily_return_prompt_clicked' &&
      mission.gameId === retentionLoop.dailyChallenge?.gameId,
  ) ||
  !retentionLoop.missions?.some(
    (mission) =>
      mission.id === 'activate-return-intent' &&
      mission.event === 'daily_return_intent_started' &&
      mission.gameId === retentionLoop.dailyChallenge?.gameId,
  ) ||
  retentionPromptEvents.some((eventName) => !analyticsLibSource.includes(`'${eventName}'`)) ||
  retentionPromptEvents.some((eventName) => !analyticsRollupSource.includes(`'${eventName}'`)) ||
  retentionPromptEvents.some((eventName) => !appSource.includes(`'${eventName}'`)) ||
  !analyticsRollupSource.includes('retentionCohortDate') ||
  !analyticsRollupSource.includes('queued-return-intent') ||
  !appSource.includes('retentionReturnDate') ||
  !appSource.includes('d1RetentionCandidate') ||
  !appSource.includes('queueDailyReturn') ||
  !appSource.includes('startQueuedReturnIntent') ||
  !appSource.includes('Queued return') ||
  !appSource.includes('Return intent')
) {
  fail('Retention loop must publish a playable daily challenge, local streak state, visible return-prompt telemetry, and no-spend retention guardrails.')
}

const pwaInstallEvents = [
  'pwa_install_prompt_available',
  'pwa_install_prompt_viewed',
  'pwa_install_prompt_clicked',
  'pwa_install_prompt_accepted',
  'pwa_install_prompt_dismissed',
  'pwa_install_prompt_cooldown',
  'pwa_installed',
  'pwa_launch_mode_detected',
]
const missingPwaEventType = pwaInstallEvents.find((eventName) => !analyticsLibSource.includes(`'${eventName}'`))
const missingPwaRollupEvent = pwaInstallEvents.find(
  (eventName) => !analyticsRollupSource.includes(`'${eventName}'`),
)

if (
  pwaInstallLoop.status !== 'pwa-install-loop-ready' ||
  pwaInstallLoop.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  pwaInstallLoop.sourceStatus?.acquisitionLearning !== acquisitionLearning.status ||
  pwaInstallLoop.sourceStatus?.retentionLoop !== retentionLoop.status ||
  pwaInstallLoop.channel?.id !== 'pwa-install' ||
  pwaInstallLoop.channel?.costUsd !== 0 ||
  pwaInstallLoop.metrics?.promptAvailable !== (analytics.totals.counts.pwa_install_prompt_available ?? 0) ||
  pwaInstallLoop.metrics?.promptViews !== (analytics.totals.counts.pwa_install_prompt_viewed ?? 0) ||
  pwaInstallLoop.metrics?.promptClicks !== (analytics.totals.counts.pwa_install_prompt_clicked ?? 0) ||
  pwaInstallLoop.metrics?.accepted !== (analytics.totals.counts.pwa_install_prompt_accepted ?? 0) ||
  pwaInstallLoop.metrics?.dismissed !== (analytics.totals.counts.pwa_install_prompt_dismissed ?? 0) ||
  pwaInstallLoop.metrics?.cooldownSuppressions !== (analytics.totals.counts.pwa_install_prompt_cooldown ?? 0) ||
  pwaInstallLoop.metrics?.installed !== (analytics.totals.counts.pwa_installed ?? 0) ||
  pwaInstallLoop.metrics?.launchModes !== (analytics.totals.counts.pwa_launch_mode_detected ?? 0) ||
  pwaInstallLoop.promptPolicy?.surface !== 'autonomy-cockpit' ||
  pwaInstallLoop.promptPolicy?.ctaLabel !== 'Install app' ||
  pwaInstallLoop.promptPolicy?.nativePromptRequired !== true ||
  pwaInstallLoop.promptPolicy?.cooldownDaysAfterDismissal !== 14 ||
  pwaInstallLoop.measurementPolicy?.availableEvent !== 'pwa_install_prompt_available' ||
  pwaInstallLoop.measurementPolicy?.cooldownEvent !== 'pwa_install_prompt_cooldown' ||
  pwaInstallLoop.measurementPolicy?.cooldownStorageKey !== 'agl.pwa.installDismissedAt' ||
  pwaInstallLoop.measurementPolicy?.cooldownDays !== 14 ||
  pwaInstallLoop.localState?.dismissalKey !== 'agl.pwa.installDismissedAt' ||
  pwaInstallLoop.localState?.installedKey !== 'agl.pwa.installedAt' ||
  pwaInstallLoop.localState?.launchModeKey !== 'agl.pwa.launchMode' ||
  pwaInstallLoop.guardrails?.noForcedPrompt !== true ||
  pwaInstallLoop.guardrails?.noBlockingGameplay !== true ||
  pwaInstallLoop.guardrails?.respectBrowserPromptAvailability !== true ||
  pwaInstallLoop.guardrails?.enforceDismissalCooldown !== true ||
  pwaInstallLoop.guardrails?.noInstallWall !== true ||
  pwaInstallLoop.guardrails?.noPaidInstallReward !== true ||
  missingPwaEventType ||
  missingPwaRollupEvent ||
  !appSource.includes('beforeinstallprompt') ||
  !appSource.includes('appinstalled') ||
  !appSource.includes('pwaInstallCooldownActive') ||
  !appSource.includes('PWA Install Loop')
) {
  fail('PWA install loop must instrument browser-controlled install prompts, standalone launches, and no-pressure install guardrails.')
}

const indexEntryScriptFiles = [
  ...distIndexHtml.matchAll(/<script[^>]+src="([^"]+\.js)"/g),
].map((match) => path.basename(match[1]))
const performanceInitialScripts = performanceBudget.initial?.entryScripts ?? []
const performanceGameChunk =
  performanceBudget.deferred?.gameChunk ??
  performanceBudget.deferred?.chunks?.find((chunk) => chunk.file?.includes('GameCanvas'))

if (
  performanceBudget.status !== 'performance-budget-ready' ||
  performanceBudget.initial?.jsBytes > performanceBudget.budgets?.initialJsMaxBytes ||
  performanceBudget.initial?.gzipBytes > performanceBudget.budgets?.initialGzipMaxBytes ||
  performanceBudget.initial?.cssBytes > performanceBudget.budgets?.initialCssMaxBytes ||
  performanceBudget.controls?.phaserDeferredFromInitialShell !== true ||
  performanceBudget.controls?.initialShellBudgetEnforced !== true ||
  performanceBudget.controls?.largeGameChunkAllowedWhenDeferred !== true ||
  performanceBudget.controls?.noPerformanceClaimsWithoutBuildEvidence !== true ||
  performanceBudget.controls?.largestJsChunkIsDeferred !== true ||
  JSON.stringify(performanceInitialScripts) !== JSON.stringify(indexEntryScriptFiles) ||
  !performanceGameChunk?.file?.includes('GameCanvas') ||
  performanceInitialScripts.includes(performanceGameChunk.file) ||
  performanceInitialScripts.includes(performanceBudget.deferred?.largestJsChunk?.file) ||
  !appSource.includes('lazy(() =>') ||
  !appSource.includes("import('./components/GameCanvas')") ||
  !appSource.includes('<Suspense') ||
  /import\s+\{\s*GameCanvas\b[^}]*\}\s+from\s+'\.\/components\/GameCanvas'/.test(appSource)
) {
  fail('Performance budget must prove the initial PWA shell is under budget and the Phaser game runtime is deferred.')
}

const productTargetAction = productOptimization.actions?.find(
  (action) => action.actionType === 'target-score-curve',
)
const productReplayAction = productOptimization.actions?.find(
  (action) => action.actionType === 'runtime-replay-telemetry',
)
const productReplayPromptAction = productOptimization.actions?.find(
  (action) => action.actionType === 'runtime-replay-prompt',
)
const productFirstMoveCoachAction = productOptimization.actions?.find(
  (action) => action.actionType === 'runtime-first-move-coach',
)
const productCompletionAction = productOptimization.actions?.find(
  (action) => action.actionType === 'runtime-completion-nudge',
)
const productFinishLineAction = productOptimization.actions?.find(
  (action) => action.actionType === 'runtime-finish-line-coach',
)
const productReturnIntentAction = productOptimization.actions?.find(
  (action) => action.actionType === 'runtime-return-intent-activation',
)
const productTargetHistory = productOptimization.history?.find(
  (action) =>
    action.status === 'applied' &&
    action.actionType === 'target-score-curve' &&
    action.gameId === productTargetAction?.gameId &&
    action.sourceDataHash === productOptimization.sourceDataHash,
)

if (
  productOptimization.status !== 'product-optimization-ready' ||
  productOptimization.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  productOptimization.productGates?.firstGameCompletion?.actual !== roundMetric(analytics.totals.metrics.firstGameCompletion) ||
  productOptimization.productGates?.firstGameCompletion?.gate !== 0.55 ||
  productOptimization.productGates?.replayRate?.actual !== roundMetric(analytics.totals.metrics.replayRate) ||
  productOptimization.productGates?.replayRate?.gate !== 0.35 ||
  productOptimization.productGates?.d1Retention?.actual !== roundMetric(analytics.totals.metrics.d1Retention) ||
  productOptimization.controls?.minStartsForBalanceChange < 100 ||
  productOptimization.controls?.requirePlayableGame !== true ||
  productOptimization.controls?.noChangeWhenReleaseHealthBlocks !== true ||
  productOptimization.controls?.noRepeatForSameSourceData !== true ||
  productOptimization.controls?.oneTargetStepPerRun !== true ||
  productOptimization.controls?.revenueStillDisabledUntilGatesPass !== true ||
  productOptimization.controls?.firstMoveCoachMustBeFirstTurnOnly !== true ||
  productOptimization.controls?.completionNudgeMustBeMidRunOnly !== true ||
  productOptimization.controls?.finishLineCoachBehindPaceOnly !== true ||
  productOptimization.controls?.replayPromptAfterCompletedRunOnly !== true ||
  productOptimization.controls?.returnIntentMustBePlayerInitiated !== true ||
  productOptimization.controls?.noBackgroundRetentionWakeups !== true ||
  !productTargetAction ||
  !['applied', 'already-applied', 'monitor', 'held'].includes(productTargetAction.status) ||
  !productFirstMoveCoachAction ||
  !['armed', 'monitor'].includes(productFirstMoveCoachAction.status) ||
  !productCompletionAction ||
  !['armed', 'monitor'].includes(productCompletionAction.status) ||
  !productFinishLineAction ||
  !['armed', 'monitor'].includes(productFinishLineAction.status) ||
  !productReplayAction ||
  !['armed', 'monitor'].includes(productReplayAction.status) ||
  !productReplayPromptAction ||
  !['armed', 'monitor'].includes(productReplayPromptAction.status) ||
  !productReturnIntentAction ||
  !['armed', 'monitor'].includes(productReturnIntentAction.status) ||
  !appSource.includes("'replay_clicked'") ||
  !appSource.includes("surface: 'topbar-reset'") ||
  !gameCanvasSource.includes("'replay_clicked'") ||
  !gameCanvasSource.includes("surface: 'game-canvas-restart'")
) {
  fail('Product optimizer must publish guarded product-gate tuning, first-move coaching, and real replay telemetry wiring.')
}

const recoveryCompletionGate = productGateRecovery.gates?.find((gate) => gate.id === 'firstGameCompletion')
const recoveryReplayGate = productGateRecovery.gates?.find((gate) => gate.id === 'replayRate')
const recoveryRetentionGate = productGateRecovery.gates?.find((gate) => gate.id === 'd1Retention')
const recoveryPrimaryExperiment = productGateRecovery.experiments?.find(
  (experiment) => experiment.gateId === productGateRecovery.summary?.primaryBottleneck,
)
const expectedCompletionNeeded = Math.max(
  0,
  Math.ceil(0.55 * analytics.totals.counts.game_started) - analytics.totals.counts.level_completed,
)
const expectedReplayNeeded = Math.max(
  0,
  Math.ceil(0.35 * analytics.totals.counts.level_completed) - analytics.totals.counts.replay_clicked,
)
const expectedRetentionNeeded = Math.max(
  0,
  Math.ceil(0.18 * analytics.retention.eligibleUsers) - analytics.retention.retainedUsers,
)

if (
  productGateRecovery.status !== 'product-gate-recovery-ready' ||
  productGateRecovery.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  productGateRecovery.sourceStatus?.productOptimization !== productOptimization.status ||
  productGateRecovery.sourceStatus?.monetization !== monetizationPlan.status ||
  productGateRecovery.summary?.failingGates !== 3 ||
  productGateRecovery.summary?.primaryBottleneck !== 'firstGameCompletion' ||
  productGateRecovery.summary?.quickestGateTest !== 'd1Retention' ||
  productGateRecovery.summary?.primaryExperimentStatus !== 'collecting-sample' ||
  productGateRecovery.summary?.revenueEnabled !== false ||
  productGateRecovery.controls?.zeroPaidSpend !== true ||
  productGateRecovery.controls?.revenueStillDisabledUntilAllGatesPass !== true ||
  productGateRecovery.controls?.noSyntheticGatePasses !== true ||
  productGateRecovery.controls?.requireObservedTelemetryBeforeCopyChange !== true ||
  productGateRecovery.controls?.copyChangeRequiresSampleReady !== true ||
  productGateRecovery.controls?.placementChangeRequiresSampleReady !== true ||
  productGateRecovery.controls?.oneRecoveryFocusPerOwnerRun !== true ||
  productGateRecovery.controls?.noPaidRewardsOrPushNotifications !== true ||
  productGateRecovery.controls?.noAutomaticRuleChanges !== true ||
  recoveryCompletionGate?.neededSuccesses !== expectedCompletionNeeded ||
  recoveryReplayGate?.neededSuccesses !== expectedReplayNeeded ||
  recoveryRetentionGate?.neededSuccesses !== expectedRetentionNeeded ||
  recoveryCompletionGate?.sampleReady !== false ||
  recoveryCompletionGate?.promptViewsNeeded < 1 ||
  recoveryReplayGate?.promptViewsNeeded < 1 ||
  recoveryRetentionGate?.promptViewsNeeded < 1 ||
  productGateRecovery.priorities?.[0]?.gateId !== 'firstGameCompletion' ||
  productGateRecovery.priorities?.[0]?.ownerLoop !== 'completion-loop' ||
  productGateRecovery.priorities?.[0]?.experimentStatus !== 'collecting-sample' ||
  productGateRecovery.priorities?.[2]?.gateId !== 'd1Retention' ||
  recoveryPrimaryExperiment?.status !== 'collecting-sample' ||
  recoveryPrimaryExperiment?.canChangeCopy !== false ||
  recoveryPrimaryExperiment?.canChangePlacement !== false ||
  recoveryPrimaryExperiment?.recommendedChange !== 'hold-current-runtime-copy' ||
  !appSource.includes('Product Gate Recovery') ||
  !appSource.includes('productGateRecovery')
) {
  fail('Product gate recovery must quantify observed lift, sample needs, and zero-spend controls before revenue can open.')
}

const samplePrimaryMission = productGateSamplePlan.missions?.find(
  (mission) => mission.gateId === productGateRecovery.summary?.primaryBottleneck,
)
const sampleRetentionMission = productGateSamplePlan.missions?.find((mission) => mission.gateId === 'd1Retention')

if (
  productGateSamplePlan.status !== 'product-gate-sample-plan-ready' ||
  productGateSamplePlan.sourceStatus?.productGateRecovery !== productGateRecovery.status ||
  productGateSamplePlan.sourceStatus?.localEventBridge !== localEventBridge.status ||
  productGateSamplePlan.summary?.primaryGateId !== productGateRecovery.summary?.primaryBottleneck ||
  productGateSamplePlan.summary?.fastestGateId !== productGateRecovery.summary?.quickestGateTest ||
  productGateSamplePlan.summary?.missions !== productGateRecovery.summary?.failingGates ||
  productGateSamplePlan.summary?.totalPromptViewsNeeded !==
    productGateRecovery.gates?.reduce((sum, gate) => sum + gate.promptViewsNeeded, 0) ||
  productGateSamplePlan.summary?.totalObservedSuccessesNeeded !==
    productGateRecovery.gates?.reduce((sum, gate) => sum + gate.neededSuccesses, 0) ||
  productGateSamplePlan.commandPlan?.refreshPlan !== 'npm run autonomous:sample-plan' ||
  !productGateSamplePlan.commandPlan?.collectAndRefresh?.includes('autonomous:gate-recovery') ||
  !productGateSamplePlan.commandPlan?.collectAndRefresh?.includes('autonomous:sample-plan') ||
  productGateSamplePlan.commandPlan?.collectDownloadsAndRefresh !== 'npm run autonomous:collect-sample-downloads' ||
  typeof productGateSamplePlan.summary?.importedGateSampleEvents !== 'number' ||
  typeof productGateSamplePlan.summary?.inboxGateSampleEvents !== 'number' ||
  productGateSamplePlan.controls?.zeroPaidSpend !== true ||
  productGateSamplePlan.controls?.noPaidTraffic !== true ||
  productGateSamplePlan.controls?.noSyntheticGatePasses !== true ||
  productGateSamplePlan.controls?.noAutomaticRuleChanges !== true ||
  productGateSamplePlan.controls?.noRevenueEnablement !== true ||
  productGateSamplePlan.controls?.playerInitiatedOnly !== true ||
  productGateSamplePlan.controls?.realEventDropsOnly !== true ||
  productGateSamplePlan.controls?.downloadsImportRequiresExplicitOptIn !== true ||
  productGateSamplePlan.controls?.requireObservedTelemetryBeforeRecoveryChange !== true ||
  samplePrimaryMission?.status !== 'collecting-sample' ||
  !samplePrimaryMission?.evidence?.status ||
  samplePrimaryMission?.needed?.promptViews !== recoveryCompletionGate?.promptViewsNeeded ||
  samplePrimaryMission?.needed?.successes !== recoveryCompletionGate?.neededSuccesses ||
  samplePrimaryMission?.controls?.costUsd !== 0 ||
  samplePrimaryMission?.controls?.noSyntheticEvents !== true ||
  sampleRetentionMission?.gameId !== retentionLoop.dailyChallenge?.gameId ||
  !productGateSamplePlanSource.includes('localEventBridge') ||
  !productGateSamplePlanSource.includes('productGateRecovery') ||
  !packageJson.scripts?.['autonomous:sample-plan']?.includes('product-gate-sample-planner') ||
  !packageJson.scripts?.['autonomous:collect-sample-downloads']?.includes('AGL_LOCAL_EVENT_IMPORT_DOWNLOADS=true') ||
  !packageJson.scripts?.['autonomous:collect-sample-downloads']?.includes('autonomous:gate-recovery') ||
  !packageJson.scripts?.['autonomous:collect-sample-downloads']?.includes('autonomous:sample-plan') ||
  !packageJson.scripts?.['autonomous:daily']?.includes('autonomous:sample-plan') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:sample-plan') ||
  !analyticsLibSource.includes("'gate_sample_mission_clicked'") ||
  !analyticsLibSource.includes("source === 'gate_sample'") ||
  !analyticsRollupSource.includes("'gate_sample_mission_clicked'") ||
  !appSource.includes('Product Gate Sample Plan') ||
  !appSource.includes('startGateSampleMission') ||
  !appSource.includes('Export sample evidence') ||
  !appSource.includes("'gate_sample_mission_clicked'") ||
  !appSource.includes('product-gate-sample')
) {
  fail('Product gate sample plan must turn recovery deficits into zero-spend sample missions before copy, rule, or revenue changes.')
}

const firstMoveCoachEvents = [
  'first_move_coach_shown',
  'first_move_coach_used',
  'first_move_coach_skipped',
]

if (
  firstMoveCoach.status !== 'first-move-coach-ready' ||
  firstMoveCoach.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  firstMoveCoach.sourceStatus?.productOptimization !== productOptimization.status ||
  firstMoveCoach.summary?.enabled !== true ||
  firstMoveCoach.summary?.enabledTargets < 1 ||
  firstMoveCoach.summary?.primaryTargetId !== 'harbor-rings' ||
  firstMoveCoach.controls?.zeroPaidSpend !== true ||
  firstMoveCoach.controls?.firstTurnOnly !== true ||
  firstMoveCoach.controls?.noAutoMove !== true ||
  firstMoveCoach.controls?.noForcedTutorial !== true ||
  firstMoveCoach.controls?.noRevenueEnablement !== true ||
  firstMoveCoach.controls?.respectsExperimentPolicy !== true ||
  firstMoveCoach.controls?.requiresReleaseHealth !== true ||
  firstMoveCoach.telemetry?.shown !== 'first_move_coach_shown' ||
  firstMoveCoach.telemetry?.used !== 'first_move_coach_used' ||
  firstMoveCoach.telemetry?.skipped !== 'first_move_coach_skipped' ||
  !firstMoveCoach.targets?.some(
    (target) =>
      target.gameId === 'harbor-rings' &&
      target.enabled === true &&
      target.recommendedCell?.row === 2 &&
      target.recommendedCell?.col === 2,
  ) ||
  !firstMoveCoach.targets?.some((target) => target.generatedRuntime === true && target.enabled === true) ||
  firstMoveCoach.targets?.some((target) => target.enabled === true && target.runtimeSupported !== true) ||
  firstMoveCoachEvents.some((eventName) => !analyticsLibSource.includes(`'${eventName}'`)) ||
  firstMoveCoachEvents.some((eventName) => !analyticsRollupSource.includes(`'${eventName}'`)) ||
  !gameCanvasSource.includes('firstMoveCoach') ||
  !appSource.includes('First Move Coach') ||
  !harborRingsSource.includes('first_move_coach_shown') ||
  !harborRingsSource.includes('first_move_coach_used') ||
  !harborRingsSource.includes('first_move_coach_skipped') ||
  !generatedPuzzleSource.includes('first_move_coach_shown') ||
  !generatedPuzzleSource.includes('first_move_coach_used') ||
  !generatedPuzzleSource.includes('first_move_coach_skipped') ||
  packageJson.scripts?.['autonomous:first-move-coach'] !== 'node scripts/first-move-coach.mjs' ||
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:first-move-coach') !== true
) {
  fail('First-move coach must publish a bounded first-turn assist policy, runtime hooks, and shown/used/skipped telemetry.')
}

const completionNudgeEvents = [
  'completion_nudge_viewed',
  'completion_nudge_clicked',
  'completion_nudge_dismissed',
]
const finishLineCoachEvents = [
  'finish_line_coach_viewed',
  'finish_line_coach_clicked',
  'finish_line_coach_dismissed',
]

if (
  completionLoop.status !== 'completion-loop-ready' ||
  completionLoop.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  completionLoop.sourceStatus?.productOptimization !== productOptimization.status ||
  completionLoop.sourceStatus?.firstMoveCoach !== firstMoveCoach.status ||
  !playableIds.has(completionLoop.target?.gameId) ||
  completionLoop.metrics?.firstGameCompletion !== roundMetric(analytics.totals.metrics.firstGameCompletion) ||
  completionLoop.metrics?.completionGate !== 0.55 ||
  completionLoop.metrics?.gameStarts !== analytics.totals.counts.game_started ||
  completionLoop.metrics?.completions !== analytics.totals.counts.level_completed ||
  completionLoop.metrics?.abandonments !== analytics.totals.counts.game_abandoned ||
  completionLoop.controls?.zeroPaidSpend !== true ||
  completionLoop.controls?.midRunOnly !== true ||
  completionLoop.controls?.onePromptPerRun !== true ||
  completionLoop.controls?.noForcedTutorial !== true ||
  completionLoop.controls?.noAutoMove !== true ||
  completionLoop.controls?.noRuleChange !== true ||
  completionLoop.controls?.finishLineCoachBehindPaceOnly !== true ||
  completionLoop.controls?.finishLineCoachAfterMidpointOnly !== true ||
  completionLoop.controls?.noScoreManipulation !== true ||
  completionLoop.controls?.noPaidRewards !== true ||
  completionLoop.controls?.noRevenueEnablement !== true ||
  completionLoop.controls?.requireAbandonmentTelemetry !== true ||
  !['armed', 'monitor'].includes(completionLoop.promptPolicy?.status) ||
  completionLoop.promptPolicy?.surface !== 'autonomy-cockpit-completion-card' ||
  completionLoop.promptPolicy?.trigger !== 'after-progress-checkpoint' ||
  completionLoop.promptPolicy?.triggerMove < 2 ||
  completionLoop.promptPolicy?.telemetry?.viewed !== 'completion_nudge_viewed' ||
  completionLoop.promptPolicy?.telemetry?.clicked !== 'completion_nudge_clicked' ||
  completionLoop.promptPolicy?.telemetry?.dismissed !== 'completion_nudge_dismissed' ||
  completionLoop.promptPolicy?.telemetry?.completed !== 'level_completed' ||
  completionLoop.promptPolicy?.telemetry?.abandoned !== 'game_abandoned' ||
  completionLoop.finishLinePolicy?.surface !== 'autonomy-cockpit-finish-line-card' ||
  completionLoop.finishLinePolicy?.trigger !== 'behind-pace-after-midpoint' ||
  completionLoop.finishLinePolicy?.triggerMove <= completionLoop.promptPolicy?.triggerMove ||
  completionLoop.finishLinePolicy?.minimumRemainingMoves < 1 ||
  completionLoop.finishLinePolicy?.scorePaceRatio <= 0 ||
  completionLoop.finishLinePolicy?.telemetry?.viewed !== 'finish_line_coach_viewed' ||
  completionLoop.finishLinePolicy?.telemetry?.clicked !== 'finish_line_coach_clicked' ||
  completionLoop.finishLinePolicy?.telemetry?.dismissed !== 'finish_line_coach_dismissed' ||
  completionLoop.localState?.dismissedRunKey !== 'agl.completion.dismissedRunKey' ||
  completionLoop.localState?.acceptedRunKey !== 'agl.completion.acceptedRunKey' ||
  completionLoop.localState?.finishLineDismissedRunKey !== 'agl.finishLine.dismissedRunKey' ||
  completionLoop.localState?.finishLineAcceptedRunKey !== 'agl.finishLine.acceptedRunKey' ||
  !completionLoop.missions?.some(
    (mission) =>
      mission.id === 'choose-keep-playing' &&
      mission.event === 'completion_nudge_clicked' &&
      mission.gameId === completionLoop.target?.gameId,
  ) ||
  !completionLoop.missions?.some(
    (mission) =>
      mission.id === 'focus-after-finish-line-coach' &&
      mission.event === 'finish_line_coach_clicked' &&
      mission.gameId === completionLoop.target?.gameId,
  ) ||
  completionNudgeEvents.some((eventName) => !analyticsLibSource.includes(`'${eventName}'`)) ||
  completionNudgeEvents.some((eventName) => !analyticsRollupSource.includes(`'${eventName}'`)) ||
  completionNudgeEvents.some((eventName) => !appSource.includes(`'${eventName}'`)) ||
  finishLineCoachEvents.some((eventName) => !analyticsLibSource.includes(`'${eventName}'`)) ||
  finishLineCoachEvents.some((eventName) => !analyticsRollupSource.includes(`'${eventName}'`)) ||
  finishLineCoachEvents.some((eventName) => !appSource.includes(`'${eventName}'`)) ||
  !appSource.includes('Completion Loop') ||
  !appSource.includes('Finish line') ||
  !appSource.includes('keepPlayingFromCompletionNudge') ||
  !appSource.includes('focusFromFinishLineCoach') ||
  packageJson.scripts?.['autonomous:completion-loop'] !== 'node scripts/completion-loop.mjs' ||
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:completion-loop') !== true
) {
  fail('Completion loop must publish a bounded mid-run nudge policy, runtime hooks, and completion/abandonment telemetry.')
}

const replayPromptEvents = ['replay_prompt_viewed', 'replay_prompt_clicked', 'replay_prompt_dismissed']

if (
  replayLoop.status !== 'replay-loop-ready' ||
  replayLoop.sourceStatus?.analyticsSource !== analytics.sourceStatus.activeSource ||
  replayLoop.sourceStatus?.productOptimization !== productOptimization.status ||
  !playableIds.has(replayLoop.target?.gameId) ||
  replayLoop.metrics?.replayRate !== roundMetric(analytics.totals.metrics.replayRate) ||
  replayLoop.metrics?.replayGate !== 0.35 ||
  replayLoop.metrics?.replayClicks !== analytics.totals.counts.replay_clicked ||
  replayLoop.controls?.zeroPaidSpend !== true ||
  replayLoop.controls?.afterCompletedRunOnly !== true ||
  replayLoop.controls?.onePromptPerCompletedRun !== true ||
  replayLoop.controls?.noForcedReplay !== true ||
  replayLoop.controls?.noAutoRestart !== true ||
  replayLoop.controls?.noPaidRewards !== true ||
  replayLoop.controls?.noRevenueEnablement !== true ||
  replayLoop.controls?.requireCompletedRunTelemetry !== true ||
  !['armed', 'monitor'].includes(replayLoop.promptPolicy?.status) ||
  replayLoop.promptPolicy?.surface !== 'autonomy-cockpit-replay-card' ||
  replayLoop.promptPolicy?.trigger !== 'after-completed-run' ||
  replayLoop.promptPolicy?.telemetry?.viewed !== 'replay_prompt_viewed' ||
  replayLoop.promptPolicy?.telemetry?.clicked !== 'replay_prompt_clicked' ||
  replayLoop.promptPolicy?.telemetry?.dismissed !== 'replay_prompt_dismissed' ||
  replayLoop.promptPolicy?.telemetry?.replay !== 'replay_clicked' ||
  replayLoop.localState?.dismissedRunKey !== 'agl.replay.dismissedRunKey' ||
  replayLoop.localState?.acceptedRunKey !== 'agl.replay.acceptedRunKey' ||
  !replayLoop.missions?.some(
    (mission) =>
      mission.id === 'confirm-replay' &&
      mission.event === 'replay_prompt_clicked' &&
      mission.gameId === replayLoop.target?.gameId,
  ) ||
  replayPromptEvents.some((eventName) => !analyticsLibSource.includes(`'${eventName}'`)) ||
  replayPromptEvents.some((eventName) => !analyticsRollupSource.includes(`'${eventName}'`)) ||
  replayPromptEvents.some((eventName) => !appSource.includes(`'${eventName}'`)) ||
  !appSource.includes('Replay Loop') ||
  !appSource.includes('playAgainFromReplayPrompt') ||
  packageJson.scripts?.['autonomous:replay-loop'] !== 'node scripts/replay-loop.mjs' ||
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:replay-loop') !== true
) {
  fail('Replay loop must publish a bounded completed-run prompt policy, runtime hooks, and prompt/replay telemetry.')
}

if (
  productTargetAction?.gameId &&
  productTargetAction.status !== 'monitor' &&
  (!playableIds.has(productTargetAction.gameId) ||
    gameBalance.games?.[productTargetAction.gameId]?.targetScore !== productTargetAction.after ||
    productTargetAction.before - productTargetAction.after >
      gameBalance.games?.[productTargetAction.gameId]?.tuning?.targetStep ||
    !productTargetHistory)
) {
  fail('Product optimizer target-score changes must be one-step, playable, synced to game balance, and recorded in history.')
}

if (
  !productionEnvironment.status ||
  !productionEnvironment.requiredEnv?.length ||
  typeof productionEnvironment.publicOrigin?.status !== 'string' ||
  typeof productionEnvironment.analytics?.serverPosthogConfigured !== 'boolean' ||
  typeof productionEnvironment.analytics?.eventCollector?.browserConfigured !== 'boolean' ||
  productionEnvironment.analytics?.eventCollector?.provider !== 'cloudflare-worker-r2' ||
  typeof productionEnvironment.monetization?.adsenseClientConfigured !== 'boolean' ||
  typeof productionEnvironment.monetization?.adsenseRewardedSlotConfigured !== 'boolean' ||
  typeof productionEnvironment.monetization?.admobPublisherConfigured !== 'boolean' ||
  typeof productionEnvironment.android?.googlePlayAccountConnected !== 'boolean'
) {
  fail('Production environment must publish host, analytics collector, monetization, and app-store configuration readiness.')
}

if (
  productionEnvironment.publicOrigin.status === 'missing' &&
  productionEnvironment.publicOrigin.privacyUrl !== null
) {
  fail('Production environment must not synthesize hosted privacy URLs without a real public origin.')
}

const expectedEnvFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
  'ops/production.env',
  'ops/production.env.local',
]
const envAwareArtifacts = [
  productionEnvironment,
  repositoryReadiness,
  repositoryBootstrap,
  productionBootstrap,
  autonomousSelfUpdate,
  androidSigning,
  eventCollectorDeployment,
  postDeploySmoke,
]
const envAwareSources = [
  productionEnvironmentSource,
  repositoryReadinessSource,
  repositoryBootstrapSource,
  productionBootstrapSource,
  autonomousSelfUpdateSource,
  androidSigningSource,
  eventCollectorDeployPlanSource,
  postDeploySmokeSource,
]
const loadedEnvFileMetadataLeaksValues = envAwareArtifacts.some((artifact) =>
  (artifact.envFiles?.loadedFiles ?? []).some((file) => Object.hasOwn(file, 'value')),
)

if (
  !expectedEnvFiles.every((file) => productionEnvironment.envFiles?.candidateFiles?.includes(file)) ||
  productionEnvironment.envFiles?.controls?.shellEnvPrecedence !== true ||
  productionEnvironment.envFiles?.controls?.protectedMutationKeysRequireShellEnv !== true ||
  productionEnvironment.envFiles?.controls?.noSecretValuesInReports !== true ||
  productionEnvironment.envFiles?.controls?.gitIgnoredLocalEnvFiles !== true ||
  !envAwareArtifacts.every((artifact) => artifact.envFiles?.controls?.shellEnvPrecedence === true) ||
  !envAwareArtifacts.every(
    (artifact) => artifact.envFiles?.controls?.protectedMutationKeysRequireShellEnv === true,
  ) ||
  loadedEnvFileMetadataLeaksValues ||
  !envAwareSources.every((source) => source.includes('loadLocalEnv')) ||
  !envLoaderSource.includes('AGL_ALLOW_') ||
  !envLoaderSource.includes('protectedMutationKeysRequireShellEnv') ||
  !gitignoreSource.includes('.env') ||
  !gitignoreSource.includes('.env.*') ||
  !gitignoreSource.includes('ops/production.env') ||
  !gitignoreSource.includes('ops/*.env.local') ||
  !gitignoreSource.includes('!ops/production.env.example')
) {
  fail('Production env-file loading must support git-ignored local config without leaking values or enabling mutation gates.')
}

const bootstrapStageIds = new Set((productionBootstrap.stages ?? []).map((stage) => stage.id))
const bootstrapVariableNames = new Set(
  (productionBootstrap.requiredVariables ?? []).map((action) => action.repositoryVariable),
)
const bootstrapSecretNames = new Set(
  (productionBootstrap.requiredSecrets ?? []).map((action) => action.repositorySecret),
)
const requiredBootstrapStages = [
  'repository-channel',
  'repository-bootstrap',
  'production-environment',
  'github-pages-hosting',
  'github-pages-settings',
  'autonomous-self-update',
  'github-actions-variables',
  'github-actions-secrets',
  'event-collector',
  'monetization-gate',
  'android-release-unblock',
]
const requiredBootstrapVariables = [
  'AGL_PUBLIC_ORIGIN',
  'VITE_BASE_PATH',
  'CLOUDFLARE_ACCOUNT_ID',
  'VITE_EVENT_COLLECTOR_URL',
  'AGL_ANDROID_SHA256_CERT_FINGERPRINT',
  'AGL_AUTONOMOUS_SELF_UPDATE',
  'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT',
]
const requiredBootstrapSecrets = [
  'CLOUDFLARE_API_TOKEN',
  'VITE_EVENT_COLLECTOR_WRITE_TOKEN',
  'AGL_EVENT_COLLECTOR_ADMIN_TOKEN',
  'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON',
]

if (
  productionBootstrap.status !== 'production-bootstrap-ready' ||
  !['waiting-for-external-credentials', 'can-apply-configured-actions'].includes(productionBootstrap.mode) ||
  productionBootstrap.controls?.zeroSpendGuard !== true ||
  productionBootstrap.controls?.noPaidResourcesCreated !== true ||
  productionBootstrap.controls?.noStoreSubmission !== true ||
  productionBootstrap.controls?.noRevenueEnablement !== true ||
  productionBootstrap.controls?.canAutoConfigurePagesSource !== true ||
  productionBootstrap.setupScript?.path !== 'ops/github/setup-production.sh' ||
  productionBootstrap.setupScript?.avoidsSecretEcho !== true ||
  productionBootstrap.setupScript?.configuresPagesSource !== true ||
  productionBootstrap.setupScript?.infersRepositoryFromOriginRemote !== true ||
  productionBootstrap.setupScript?.supportsSshUrlRemotes !== true ||
  productionBootstrap.setupScript?.supportsDottedRepositoryNames !== true ||
  productionBootstrap.repository?.repositoryReadinessStatus !== repositoryReadiness.status ||
  productionBootstrap.repository?.repositoryBootstrapStatus !== repositoryBootstrap.status ||
  productionBootstrap.repository?.insideWorkTree !== repositoryReadiness.workspace?.insideWorkTree ||
  !requiredBootstrapStages.every((stageId) => bootstrapStageIds.has(stageId)) ||
  !requiredBootstrapVariables.every((name) => bootstrapVariableNames.has(name)) ||
  !requiredBootstrapSecrets.every((name) => bootstrapSecretNames.has(name)) ||
  !productionBootstrap.setupCommands?.some((command) => command.id === 'repository-preflight') ||
  !productionBootstrap.setupCommands?.some((command) => command.id === 'repository-bootstrap-plan') ||
  !productionBootstrap.setupCommands?.some((command) => command.id === 'sync-pages-settings') ||
  !productionBootstrap.setupCommands?.some((command) => command.id === 'sync-repository-config') ||
  !productionBootstrap.setupCommands?.every((command) => command.costUsd === 0) ||
  !productionBootstrap.generatedArtifacts?.includes('ops/github/bootstrap-repository.sh') ||
  !productionBootstrap.generatedArtifacts?.includes('ops/github/setup-production.sh') ||
  !productionBootstrapSource.includes('setup-production.sh') ||
  !productionBootstrapSource.includes('repository-bootstrap') ||
  !githubRepositoryBootstrapScript.includes('AGL_ALLOW_REPOSITORY_BOOTSTRAP') ||
  !githubRepositoryBootstrapScript.includes('AGL_ALLOW_INITIAL_COMMIT') ||
  !githubRepositoryBootstrapScript.includes('AGL_ALLOW_GITHUB_REPO_CREATE') ||
  githubRepositoryBootstrapScript.includes('gh workflow run') ||
  !githubSetupScript.includes('gh variable set') ||
  !githubSetupScript.includes('gh secret set') ||
  !githubSetupScript.includes('derive_repository_from_origin') ||
  !githubSetupScript.includes('git remote get-url origin') ||
  !githubSetupScript.includes('ssh://git@github.com/') ||
  !githubSetupScript.includes('AGL_SYNC_PAGES_SETTINGS') ||
  !githubSetupScript.includes('repos/$repo/pages') ||
  !githubSetupScript.includes('build_type=workflow') ||
  !githubSetupScript.includes('RUN_WORKFLOWS') ||
  !githubSetupScript.includes('ALLOW_ANDROID_RELEASE_WORKFLOW') ||
  !githubSetupScript.includes('AGL_AUTONOMOUS_SELF_UPDATE') ||
  githubSetupScript.includes('admin-export-token') ||
  githubSetupScript.includes('ca-pub-your-web-client-id') ||
  !githubSetupReadme.includes('zero-spend')
) {
  fail('Production bootstrap must generate zero-spend GitHub setup stages, sanitized variable/secret commands, and guarded workflow triggers.')
}

const operatorSelectedCommand = autonomousOperator.selectedAction?.command
const operatorStatusAllowed = ['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status)
const operatorModeAllowed = ['plan-only', 'execute-one-action'].includes(autonomousOperator.mode)
const operatorExecutionStatusAllowed = ['not-requested', 'executed'].includes(
  autonomousOperator.execution?.status,
)

if (
  !operatorStatusAllowed ||
  !operatorModeAllowed ||
  autonomousOperator.selectedAction?.costUsd !== 0 ||
  autonomousOperator.ownerDecision?.locallyExecutable !== true ||
  autonomousOperator.selectedAction?.id !== autonomousOwnerLoop.ownerDecision?.nextBestActionId ||
  !operatorSelectedCommand ||
  !autonomousOperator.allowlist?.includes(operatorSelectedCommand) ||
  autonomousOperator.controls?.zeroPaidSpend !== true ||
  autonomousOperator.controls?.allOwnerGuardrailsEnforced !== true ||
  autonomousOperator.controls?.localCommandAllowlistEnforced !== true ||
  autonomousOperator.controls?.exactCommandMatchRequired !== true ||
  autonomousOperator.controls?.maxActionsPerRun !== 1 ||
  autonomousOperator.controls?.dryRunByDefault !== true ||
  autonomousOperator.controls?.executeRequiresFlag !== true ||
  autonomousOperator.controls?.externalWorkflowExecutionBlockedByDefault !== true ||
  autonomousOperator.controls?.dailyLoopRecursionBlocked !== true ||
  autonomousOperator.execution?.requested !== (autonomousOperator.status === 'operator-executed') ||
  !operatorExecutionStatusAllowed ||
  autonomousOperator.execution?.maxActionsPerRun !== 1 ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:completion-loop') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:replay-loop') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:post-deploy-smoke') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:repo-readiness') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:repo-bootstrap') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:cadence') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:self-update') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:objective-audit') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:android-signing') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:sample-plan') ||
  !autonomousOperator.allowlist?.includes('npm run autonomous:collect-sample-downloads') ||
  !autonomousOperator.allowlist?.includes(
    'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery',
  ) ||
  !autonomousOperator.blockedFragments?.includes('gh workflow run') ||
  !autonomousOperator.blockedActions?.some((action) => action.reason === 'daily-loop-recursion-blocked') ||
  !autonomousOperatorSource.includes("spawn('npm'") ||
  !autonomousOperatorSource.includes('allowedLocalCommands') ||
  !autonomousOperatorSource.includes('blockedFragments') ||
  !autonomousOperatorSource.includes('AGL_OPERATOR_EXECUTE') ||
  !appSource.includes('Autonomous Operator')
) {
  fail('Autonomous operator must publish or execute one exact allowlisted local action with zero-spend controls and external workflow blocks.')
}

if (
  autonomousOperatorHistory.status !== 'operator-history-ready' ||
  autonomousOperatorHistory.retention?.maxRecords !== 40 ||
  autonomousOperatorHistory.retention?.appendOnlyWhenPlanChangesOrExecutes !== true ||
  autonomousOperatorHistory.summary?.totalRecords < 1 ||
  autonomousOperatorHistory.summary?.totalRecords > 40 ||
  autonomousOperatorHistory.summary?.plannedRecords < 1 ||
  autonomousOperatorHistory.summary?.executedRecords < 1 ||
  autonomousOperatorHistory.summary?.failedRecords !== 0 ||
  !autonomousOperatorHistory.summary?.lastExecutedActionId ||
  autonomousOperatorHistory.controls?.zeroPaidSpend !== true ||
  autonomousOperatorHistory.controls?.localCommandAllowlistEnforced !== true ||
  autonomousOperatorHistory.controls?.maxActionsPerRun !== 1 ||
  autonomousOperatorHistory.controls?.externalWorkflowExecutionBlockedByDefault !== true ||
  autonomousOperatorHistory.controls?.historyIsCapped !== true ||
  !autonomousOperatorHistory.records?.at(-1)?.selectedActionId ||
  !autonomousOperatorSource.includes('autonomous-operator-history.json') ||
  autonomousOperatorSource.includes('ownerGeneratedAt: ownerLoop.generatedAt') ||
  !autonomousOperatorSource.includes('slice(-40)') ||
  !appSource.includes('Operator History')
) {
  fail('Autonomous operator history must keep a capped durable audit trail for planned and successfully executed allowlisted actions.')
}

const hasDuplicateOperatorDryRun = (autonomousOperatorHistory.records ?? []).some((record, index, records) => {
  const previous = records[index - 1]

  return (
    Boolean(previous) &&
    previous.execution?.requested === false &&
    record.execution?.requested === false &&
    previous.runFingerprint === record.runFingerprint
  )
})

if (hasDuplicateOperatorDryRun) {
  fail('Autonomous operator history must compact repeated no-op dry-run plans instead of appending duplicate records.')
}

const cadenceCodexDesktopStatus = autonomousCadence.schedulers?.codexDesktop?.status
const cadenceCodexDesktopStatusAllowed = ['active-confirmed', 'active-declared-unverified'].includes(
  cadenceCodexDesktopStatus,
)

if (
  autonomousCadence.status !== 'cadence-ready' ||
  !cadenceCodexDesktopStatusAllowed ||
	  autonomousCadence.schedulers?.githubActions?.status !== 'scheduled' ||
	  autonomousCadence.schedulers?.githubSelfUpdate?.status !== 'gated' ||
	  autonomousCadence.commandPlan?.operate !== 'npm run autonomous:operate' ||
	  autonomousCadence.commandPlan?.executeOneLocalAction !== 'npm run autonomous:operator -- --execute' ||
	  autonomousCadence.commandPlan?.afterAction !== 'npm run autonomous:after-action' ||
	  autonomousCadence.commandPlan?.selfUpdate !== 'npm run autonomous:self-update' ||
	  autonomousCadence.controls?.zeroPaidSpend !== true ||
	  autonomousCadence.controls?.noStoreSubmission !== true ||
	  autonomousCadence.controls?.noRevenueEnablement !== true ||
	  autonomousCadence.controls?.scheduledLocalActionExecution !== true ||
	  autonomousCadence.controls?.scheduledExecutionUsesOperatorAllowlist !== true ||
	  autonomousCadence.controls?.postActionBuildRefresh !== true ||
	  autonomousCadence.controls?.postActionVerification !== true ||
	  autonomousCadence.controls?.codexAutomationActualStatusAudited !== true ||
  (cadenceCodexDesktopStatus === 'active-confirmed' &&
    (autonomousCadence.schedulers?.codexDesktop?.actual?.installedStatus !== 'ACTIVE' ||
      autonomousCadence.schedulers?.codexDesktop?.actual?.scheduleMatches !== true ||
      autonomousCadence.schedulers?.codexDesktop?.actual?.workspaceMatches !== true ||
      autonomousCadence.schedulers?.codexDesktop?.actual?.promptGuardrailsPresent !== true)) ||
  autonomousCadence.recoveryPolicy?.commitOnlyAfterVerification !== true ||
  autonomousCadence.recoveryPolicy?.neverDispatchExternalWorkflowsOnRecovery !== true ||
  !appSource.includes('Autonomous Cadence')
) {
  fail('Autonomous cadence must keep unattended local operation auditable, scheduled, and guarded in the app shell.')
}

if (
  autonomousSelfUpdate.status !== 'self-update-ready' ||
  autonomousSelfUpdate.pendingChanges?.unsafeCount !== 0 ||
  autonomousSelfUpdate.commitPlan?.workflow !== '.github/workflows/autonomous-self-update.yml' ||
  autonomousSelfUpdate.commitPlan?.enabledByRepositoryVariable !== 'AGL_AUTONOMOUS_SELF_UPDATE=1' ||
  autonomousSelfUpdate.commitPlan?.directPushRequiresRepositoryVariable !== 'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1' ||
  !autonomousSelfUpdate.commitPlan?.verificationBeforeCommit?.includes('npm run autonomous:operate') ||
  !autonomousSelfUpdate.commitPlan?.verificationBeforeCommit?.includes('npm run autonomous:self-update -- --assert-safe') ||
  autonomousSelfUpdate.controls?.zeroPaidSpend !== true ||
  autonomousSelfUpdate.controls?.dailyWorkflowReadOnly !== true ||
  autonomousSelfUpdate.controls?.writePermissionIsolatedToSelfUpdateWorkflow !== true ||
  autonomousSelfUpdate.controls?.commitRequiresCleanVerification !== true ||
  autonomousSelfUpdate.controls?.commitRequiresSafePathAllowlist !== true ||
  autonomousSelfUpdate.controls?.directPushRequiresExplicitVariable !== true ||
  autonomousSelfUpdate.controls?.doesNotStageSourceOrWorkflowChanges !== true ||
  !(autonomousSelfUpdate.checks ?? []).every((check) => check.status === 'pass') ||
  !selfUpdateWorkflow.includes("vars.AGL_AUTONOMOUS_SELF_UPDATE == '1'") ||
  !selfUpdateWorkflow.includes('contents: write') ||
  !selfUpdateWorkflow.includes('npm run autonomous:operate') ||
  !selfUpdateWorkflow.includes('npm run autonomous:self-update -- --assert-safe') ||
  !workflow.includes('contents: read') ||
  !autonomousSelfUpdateSource.includes('allowedPrefixes') ||
  !autonomousSelfUpdateSource.includes('public/seed-kit.html') ||
  !autonomousSelfUpdateSource.includes('blockedPrefixes') ||
  !appSource.includes('Autonomous Self Update')
) {
  fail('Autonomous self-update must persist only verified allowlisted generated artifacts behind explicit repository gates.')
}

const objectiveRequirementIds = new Set((objectiveAudit.requirements ?? []).map((item) => item.id))
const objectiveDataDrivenRequirement = objectiveAudit.requirements?.find(
  (item) => item.id === 'data-driven-improvement-loop',
)
const objectiveAutonomyRequirement = objectiveAudit.requirements?.find(
  (item) => item.id === 'minimal-intervention-autonomy',
)
const objectiveExpectedAutonomyStatus = ['repository-channel-ready', 'waiting-for-gh-auth'].includes(
  repositoryReadiness.status,
)
  ? 'met-local'
  : 'needs-repository-channel'
const requiredObjectiveRequirements = [
  'web-pwa-game-portal',
  'original-trend-driven-game-generation',
  'behavior-measurement-loop',
  'data-driven-improvement-loop',
  'minimal-intervention-autonomy',
  'monetization-path',
  'app-store-distribution-path',
  'minimal-cost-guardrails',
]

if (
  objectiveAudit.status !== 'objective-in-progress' ||
  objectiveAudit.completion?.canMarkGoalComplete !== false ||
  objectiveAudit.controls?.preserveOriginalScope !== true ||
  objectiveAudit.controls?.doNotMarkGoalCompleteWhileBlocked !== true ||
  objectiveAudit.controls?.zeroSpendGuard !== true ||
  objectiveAudit.summary?.requirements < requiredObjectiveRequirements.length ||
  !requiredObjectiveRequirements.every((id) => objectiveRequirementIds.has(id)) ||
  objectiveAudit.requirements?.find((item) => item.id === 'web-pwa-game-portal')?.status !== 'met' ||
  objectiveAudit.requirements?.find((item) => item.id === 'original-trend-driven-game-generation')?.status !== 'met' ||
  objectiveDataDrivenRequirement?.status !== 'met' ||
  !objectiveDataDrivenRequirement?.evidence?.some((item) =>
    item.includes(`Completion loop: ${completionLoop.status}`),
  ) ||
  !objectiveDataDrivenRequirement?.evidence?.some((item) => item.includes(`Replay loop: ${replayLoop.status}`)) ||
  !objectiveDataDrivenRequirement?.evidence?.some((item) => item.includes(`Retention loop: ${retentionLoop.status}`)) ||
  objectiveAutonomyRequirement?.status !== objectiveExpectedAutonomyStatus ||
  !objectiveAutonomyRequirement?.evidence?.some((item) =>
    item.includes(`Post-deploy smoke: ${postDeploySmoke.status}`),
  ) ||
  !objectiveAutonomyRequirement?.evidence?.some((item) =>
    item.includes(`local artifact ${localArtifactSmoke.status}`),
  ) ||
  !objectiveAutonomyRequirement?.evidence?.some((item) =>
    item.includes(`Autonomous cadence: ${autonomousCadence.status}`),
  ) ||
  !objectiveAutonomyRequirement?.evidence?.some((item) =>
    item.includes(`Autonomous self-update: ${autonomousSelfUpdate.status}`),
  ) ||
  !objectiveAutonomyRequirement?.evidence?.some((item) =>
    item.includes(`Repository channel: ${repositoryReadiness.status}`),
  ) ||
  !objectiveAutonomyRequirement?.evidence?.some((item) =>
    item.includes(`Repository bootstrap: ${repositoryBootstrap.status}`),
  ) ||
  !objectiveAudit.requirements
    ?.find((item) => item.id === 'app-store-distribution-path')
    ?.evidence?.some((item) => item.includes(`Android signing: ${androidSigning.status}`)) ||
  objectiveAudit.requirements?.find((item) => item.id === 'monetization-path')?.status !== 'prepared-blocked-by-gates' ||
  objectiveAudit.requirements?.find((item) => item.id === 'app-store-distribution-path')?.status !== 'prepared-external-blockers' ||
  (objectiveAudit.blockers?.external?.length ?? 0) === 0 ||
  (objectiveAudit.blockers?.product?.length ?? 0) === 0 ||
  !objectiveAuditSource.includes('canMarkGoalComplete') ||
  !objectiveAuditSource.includes('preserveOriginalScope') ||
  !appSource.includes('Objective Audit')
) {
  fail('Objective audit must map the original goal to concrete evidence, prepared states, blockers, and a false completion claim while gates remain blocked.')
}

if (
  generatedPlayable.status !== 'generated-runtime-ready' ||
  generatedPlayable.games?.length < 5 ||
  generatedPlayable.runtime?.codeHandoffRequired !== false ||
  generatedPlayable.runtime?.selectionStrategy !== 'accepted-concepts-first-then-trend-signals'
) {
  fail('Generated game factory must produce a concept-first portfolio of at least five no-handoff playable runtime configs.')
}

const generatedRosterIds = new Set(generatedPlayable.games.map((game) => game.id))
const generatedMissingConcept = acceptedConcepts.find(
  (concept) => !generatedPlayable.games.some((game) => game.source?.conceptId === concept.id),
)

if (generatedMissingConcept) {
  fail(`Generated game factory must cover accepted concept with a runtime game: ${generatedMissingConcept.title}`)
}

const stalePlayableGeneratedId = (playable.games ?? []).find(
  (gameId) => !corePlayableIds.has(gameId) && !generatedRosterIds.has(gameId),
)

if (stalePlayableGeneratedId) {
  fail(`Playable registry contains stale generated game id: ${stalePlayableGeneratedId}`)
}

const generatedMissingPlayable = generatedPlayable.games.find(
  (game) => !playable.games?.includes(game.id) || !gameBalance.games?.[game.id],
)

if (generatedMissingPlayable) {
  fail(`Generated playable game is not registered in playable and balance configs: ${generatedMissingPlayable.title}`)
}

const generatedMissingRules = generatedPlayable.games.find(
  (game) =>
    !game.pieces?.length ||
    !game.scoring ||
    !game.tutorial ||
    !game.playerPromise ||
    game.sourceDistance?.copiedExpressionRisk !== 'low',
)

if (generatedMissingRules) {
  fail(`Generated playable game missing runtime rules or IP guardrail: ${generatedMissingRules.title}`)
}

const generatedTargetMismatch = generatedPlayable.games.find(
  (game) => game.targetScore !== gameBalance.games?.[game.id]?.targetScore,
)

if (generatedTargetMismatch) {
  fail(`Generated playable target does not match tuned balance config: ${generatedTargetMismatch.title}`)
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:growth')) {
  fail('Autonomous daily loop must regenerate growth assets.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:growth-optimize')) {
  fail('Autonomous daily loop must optimize growth assets from analytics.')
}

if (!packageJson.scripts?.['autonomous:portfolio']?.includes('portfolio-policy')) {
  fail('Autonomous scripts must expose the portfolio policy generator.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:portfolio')) {
  fail('Autonomous daily loop must generate a data-driven portfolio policy.')
}

if (!packageJson.scripts?.['autonomous:traffic']?.includes('traffic-seeding')) {
  fail('Autonomous scripts must expose the traffic seeding generator.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:traffic')) {
  fail('Autonomous daily loop must generate zero-cost traffic seed campaigns.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:portfolio') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:traffic') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:portfolio') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:traffic')
) {
  fail('Autonomous daily loop must generate portfolio policy before traffic seeding.')
}

if (!packageJson.scripts?.['autonomous:acquisition']?.includes('acquisition-learning')) {
  fail('Autonomous scripts must expose the acquisition learning generator.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:acquisition')) {
  fail('Autonomous daily loop must generate acquisition learning decisions.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:traffic') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:acquisition') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:traffic') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:acquisition')
) {
  fail('Autonomous daily loop must generate traffic seed campaigns before acquisition learning.')
}

if (!packageJson.scripts?.['autonomous:retention']?.includes('retention-loop')) {
  fail('Autonomous scripts must expose the retention loop generator.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:retention')) {
  fail('Autonomous daily loop must generate daily retention decisions.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:acquisition') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:retention') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:acquisition') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:retention')
) {
  fail('Autonomous daily loop must learn acquisition attribution before retention decisions.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:retention') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:release-health') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:retention') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:release-health')
) {
  fail('Autonomous daily loop must generate retention decisions before release health and production gates.')
}

if (!packageJson.scripts?.['autonomous:pwa-install']?.includes('pwa-install-loop')) {
  fail('Autonomous scripts must expose the PWA install loop generator.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:pwa-install')) {
  fail('Autonomous daily loop must generate PWA install-loop decisions.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:retention') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:pwa-install') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:retention') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:pwa-install')
) {
  fail('Autonomous daily loop must generate retention policy before PWA install policy.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:pwa-install') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:release-health') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:pwa-install') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:release-health')
) {
  fail('Autonomous daily loop must generate PWA install policy before release health and production gates.')
}

if (!packageJson.scripts?.['autonomous:performance']?.includes('performance-budget')) {
  fail('Autonomous scripts must expose the performance budget generator.')
}

const dailyScript = packageJson.scripts?.['autonomous:daily'] ?? ''
const performanceRuns = [...dailyScript.matchAll(/autonomous:performance/g)].map((match) => match.index ?? -1)
const buildRuns = [...dailyScript.matchAll(/npm run build/g)].map((match) => match.index ?? -1)

if (!packageJson.scripts?.['autonomous:cadence']?.includes('autonomous-cadence')) {
  fail('Autonomous scripts must expose the autonomous cadence generator.')
}

if (!packageJson.scripts?.['autonomous:self-update']?.includes('autonomous-self-update')) {
  fail('Autonomous scripts must expose the autonomous self-update generator.')
}

if (!packageJson.scripts?.['autonomous:android-signing']?.includes('android-signing-prep')) {
  fail('Autonomous scripts must expose the Android signing prep generator.')
}

if (
  !packageJson.scripts?.['autonomous:operate']?.includes('autonomous:daily') ||
  !packageJson.scripts?.['autonomous:operate']?.includes('autonomous:operator -- --execute') ||
  !packageJson.scripts?.['autonomous:operate']?.includes('autonomous:after-action') ||
  !packageJson.scripts?.['autonomous:operate']?.includes('test:e2e')
) {
  fail('Autonomous operate script must run the daily loop, execute one allowlisted local action, refresh owner/readiness evidence, and run the browser smoke suite.')
}

if (
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:owner-loop') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('npm run build') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:performance') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:release-candidate') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:post-deploy-smoke') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:repo-readiness') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:deploy-plan') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:readiness') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('autonomous:operator') ||
  !packageJson.scripts?.['autonomous:after-action']?.includes('test:automation')
) {
  fail('Autonomous after-action script must rebuild dist, refresh release/readiness/operator evidence, and verify automation before browser smoke.')
}

if (
  !dailyScript.includes('autonomous:cadence') ||
  !dailyScript.includes('autonomous:self-update') ||
  !dailyScript.includes('autonomous:android-signing') ||
  dailyScript.indexOf('autonomous:android-signing') > dailyScript.indexOf('autonomous:env') ||
  dailyScript.indexOf('autonomous:cadence') > dailyScript.indexOf('autonomous:owner-loop', dailyScript.indexOf('autonomous:deploy-plan')) ||
  dailyScript.indexOf('autonomous:self-update') >
    dailyScript.indexOf('autonomous:owner-loop', dailyScript.indexOf('autonomous:deploy-plan'))
) {
  fail('Autonomous daily loop must refresh Android signing, cadence, and self-update evidence in the right order.')
}

if (
  autonomousCadence.status !== 'cadence-ready' ||
  autonomousCadence.schedulers?.codexDesktop?.id !== 'autonomous-game-lab-daily-owner-loop' ||
  !cadenceCodexDesktopStatusAllowed ||
  autonomousCadence.schedulers?.codexDesktop?.declaredStatus !== 'active-declared' ||
  autonomousCadence.schedulers?.githubActions?.status !== 'scheduled' ||
  autonomousCadence.schedulers?.githubActions?.workflow !== '.github/workflows/autonomous-daily.yml' ||
  autonomousCadence.schedulers?.githubActions?.command !== 'npm run autonomous:operate' ||
  autonomousCadence.schedulers?.githubActions?.artifactUpload !== true ||
  autonomousCadence.schedulers?.githubSelfUpdate?.status !== 'gated' ||
  autonomousCadence.schedulers?.githubSelfUpdate?.workflow !== '.github/workflows/autonomous-self-update.yml' ||
	  autonomousCadence.commandPlan?.operate !== 'npm run autonomous:operate' ||
	  autonomousCadence.commandPlan?.daily !== 'npm run autonomous:daily' ||
	  autonomousCadence.commandPlan?.executeOneLocalAction !== 'npm run autonomous:operator -- --execute' ||
	  autonomousCadence.commandPlan?.afterAction !== 'npm run autonomous:after-action' ||
	  autonomousCadence.commandPlan?.selfUpdate !== 'npm run autonomous:self-update' ||
  autonomousCadence.commandPlan?.verifyAutomation !== 'npm run test:automation' ||
  autonomousCadence.commandPlan?.browserSmoke !== 'npm run test:e2e' ||
	  autonomousCadence.controls?.zeroPaidSpend !== true ||
	  autonomousCadence.controls?.noStoreSubmission !== true ||
	  autonomousCadence.controls?.noRevenueEnablement !== true ||
	  autonomousCadence.controls?.scheduledLocalActionExecution !== true ||
	  autonomousCadence.controls?.scheduledExecutionUsesOperatorAllowlist !== true ||
	  autonomousCadence.controls?.postActionBuildRefresh !== true ||
	  autonomousCadence.controls?.postActionVerification !== true ||
	  autonomousCadence.controls?.codexAutomationExpectedActive !== true ||
  autonomousCadence.controls?.codexAutomationActualStatusAudited !== true ||
  !(autonomousCadence.checks ?? []).every((check) => check.status === 'pass') ||
  codexAutomationManifest.id !== autonomousCadence.schedulers?.codexDesktop?.id ||
  codexAutomationManifest.status !== 'active-declared' ||
  codexAutomationManifest.guardrails?.zeroPaidSpend !== true ||
  codexAutomationManifest.guardrails?.noStoreSubmission !== true ||
  codexAutomationManifest.guardrails?.noRevenueEnablement !== true
) {
  fail('Autonomous cadence must publish the daily Codex/GitHub schedule, guarded operate command, and zero-spend controls.')
}

if (performanceRuns.length < 2) {
  fail('Autonomous daily loop must generate performance budgets after both production builds.')
}

if (
  buildRuns[0] > performanceRuns[0] ||
  performanceRuns[0] > dailyScript.indexOf('autonomous:store-assets') ||
  buildRuns.at(-1) > performanceRuns.at(-1) ||
  performanceRuns.at(-1) > dailyScript.indexOf('test:automation') ||
  performanceRuns.at(-1) > dailyScript.indexOf('autonomous:readiness', performanceRuns.at(-1)) ||
  performanceRuns.at(-1) > dailyScript.indexOf('autonomous:owner-loop', performanceRuns.at(-1))
) {
  fail('Autonomous daily loop must run performance budget after build, before store assets, and refresh readiness/owner-loop before final automation verification.')
}

if (!packageJson.scripts?.['autonomous:product-optimize']?.includes('product-gate-optimizer')) {
  fail('Autonomous scripts must expose the product gate optimizer.')
}

if (!dailyScript.includes('autonomous:product-optimize')) {
  fail('Autonomous daily loop must run product gate optimization.')
}

if (
  dailyScript.indexOf('autonomous:analyze') > dailyScript.indexOf('autonomous:product-optimize') ||
  dailyScript.indexOf('autonomous:product-optimize') > dailyScript.indexOf('autonomous:portfolio') ||
  dailyScript.indexOf('autonomous:product-optimize') > dailyScript.indexOf('autonomous:sync-config', dailyScript.indexOf('autonomous:product-optimize')) ||
  dailyScript.indexOf('autonomous:product-optimize') > dailyScript.indexOf('autonomous:simulate', dailyScript.indexOf('autonomous:product-optimize'))
) {
  fail('Autonomous daily loop must analyze, product-optimize, sync game config, rerun simulation, then continue portfolio decisions.')
}

if (!packageJson.scripts?.['autonomous:replay-loop']?.includes('replay-loop')) {
  fail('Autonomous scripts must expose the replay-loop generator.')
}

if (
  !dailyScript.includes('autonomous:replay-loop') ||
  dailyScript.indexOf('autonomous:replay-loop') < dailyScript.indexOf('autonomous:product-optimize') ||
  dailyScript.indexOf('autonomous:replay-loop') > dailyScript.indexOf('autonomous:pwa-install')
) {
  fail('Autonomous daily loop must generate replay-loop policy after product optimization and before install/release gates.')
}

if (!packageJson.scripts?.['autonomous:completion-loop']?.includes('completion-loop')) {
  fail('Autonomous scripts must expose the completion-loop generator.')
}

if (
  !dailyScript.includes('autonomous:completion-loop') ||
  dailyScript.indexOf('autonomous:completion-loop') < dailyScript.indexOf('autonomous:product-optimize') ||
  dailyScript.indexOf('autonomous:completion-loop') > dailyScript.indexOf('autonomous:pwa-install')
) {
  fail('Autonomous daily loop must generate completion-loop policy after product optimization and before install/release gates.')
}

if (!packageJson.scripts?.['autonomous:bootstrap']?.includes('production-bootstrap')) {
  fail('Autonomous scripts must expose the production bootstrap generator.')
}

if (!packageJson.scripts?.['autonomous:repo-readiness']?.includes('repository-readiness')) {
  fail('Autonomous scripts must expose the repository readiness generator.')
}

if (!packageJson.scripts?.['autonomous:repo-bootstrap']?.includes('repository-bootstrap')) {
  fail('Autonomous scripts must expose the repository bootstrap generator.')
}

const repositoryReadinessRuns = [...dailyScript.matchAll(/autonomous:repo-readiness/g)].map(
  (match) => match.index ?? -1,
)
const repositoryBootstrapRuns = [...dailyScript.matchAll(/autonomous:repo-bootstrap/g)].map(
  (match) => match.index ?? -1,
)

if (repositoryReadinessRuns.length < 2) {
  fail('Autonomous daily loop must regenerate repository readiness before deploy/bootstrap decisions.')
}

if (repositoryBootstrapRuns.length < repositoryReadinessRuns.length) {
  fail('Autonomous daily loop must regenerate repository bootstrap after each repository readiness pass.')
}

if (
  repositoryReadinessRuns[0] < dailyScript.indexOf('autonomous:post-deploy-smoke') ||
  repositoryReadinessRuns[0] > dailyScript.indexOf('autonomous:store-assets') ||
  repositoryReadinessRuns.at(-1) < dailyScript.indexOf('autonomous:post-deploy-smoke', repositoryReadinessRuns.at(-2)) ||
  repositoryReadinessRuns.at(-1) > dailyScript.indexOf('autonomous:readiness', repositoryReadinessRuns.at(-1))
) {
  fail('Autonomous daily loop must refresh repository readiness after release smoke and before readiness/deploy/bootstrap decisions.')
}

const missingBootstrapAfterReadiness = repositoryReadinessRuns.some((runIndex) => {
  const nextBootstrap = repositoryBootstrapRuns.find((bootstrapIndex) => bootstrapIndex > runIndex)
  const nextDeployPlan = dailyScript.indexOf('autonomous:deploy-plan', runIndex)
  const nextStoreAssets = dailyScript.indexOf('autonomous:store-assets', runIndex)
  const nextReadiness = dailyScript.indexOf('autonomous:readiness', runIndex)
  const nextBoundary = [nextDeployPlan, nextStoreAssets, nextReadiness]
    .filter((index) => index > runIndex)
    .sort((a, b) => a - b)[0]

  return !nextBootstrap || (nextBoundary && nextBootstrap > nextBoundary)
})

if (missingBootstrapAfterReadiness) {
  fail('Autonomous daily loop must run repository bootstrap immediately after repository readiness before downstream production gates.')
}

const bootstrapRuns = [...dailyScript.matchAll(/autonomous:bootstrap/g)].map((match) => match.index ?? -1)

if (bootstrapRuns.length < 2) {
  fail('Autonomous daily loop must regenerate production bootstrap artifacts after deployment planning and before final verification.')
}

if (
  dailyScript.indexOf('autonomous:deploy-plan') > bootstrapRuns[0] ||
  bootstrapRuns[0] > dailyScript.indexOf('autonomous:owner-loop', bootstrapRuns[0]) ||
  bootstrapRuns.at(-1) > dailyScript.indexOf('autonomous:readiness', bootstrapRuns.at(-1)) ||
  bootstrapRuns.at(-1) > dailyScript.indexOf('autonomous:owner-loop', bootstrapRuns.at(-1))
) {
  fail('Autonomous daily loop must run deploy-plan, bootstrap, refresh readiness, and then refresh owner-loop before automation verification.')
}

if (!packageJson.scripts?.['autonomous:operator']?.includes('autonomous-operator')) {
  fail('Autonomous scripts must expose the one-action autonomous operator.')
}

const operatorRuns = [...dailyScript.matchAll(/autonomous:operator/g)].map((match) => match.index ?? -1)

if (operatorRuns.length < 2) {
  fail('Autonomous daily loop must generate autonomous operator plans after owner-loop decisions.')
}

if (
  operatorRuns[0] < dailyScript.indexOf('autonomous:owner-loop') ||
  operatorRuns.at(-1) < dailyScript.indexOf('autonomous:owner-loop', bootstrapRuns.at(-1)) ||
  operatorRuns.at(-1) > dailyScript.indexOf('autonomous:readiness', operatorRuns.at(-1)) ||
  operatorRuns.at(-1) > dailyScript.indexOf('test:automation')
) {
  fail('Autonomous daily loop must run the operator after owner-loop and refresh readiness before final automation verification.')
}

if (!packageJson.scripts?.['autonomous:objective-audit']?.includes('objective-audit')) {
  fail('Autonomous scripts must expose the objective audit generator.')
}

const objectiveAuditRuns = [...dailyScript.matchAll(/autonomous:objective-audit/g)].map(
  (match) => match.index ?? -1,
)

if (objectiveAuditRuns.length < 2) {
  fail('Autonomous daily loop must regenerate the objective audit after operator planning.')
}

if (
  objectiveAuditRuns[0] < operatorRuns[0] ||
  objectiveAuditRuns.at(-1) < operatorRuns.at(-1) ||
  objectiveAuditRuns.at(-1) > dailyScript.indexOf('autonomous:readiness', objectiveAuditRuns.at(-1)) ||
  objectiveAuditRuns.at(-1) > dailyScript.indexOf('autonomous:owner-loop', objectiveAuditRuns.at(-1)) ||
  objectiveAuditRuns.at(-1) > dailyScript.indexOf('test:automation')
) {
  fail('Autonomous daily loop must run objective-audit after operator planning and before final readiness/owner-loop verification.')
}

if (!packageJson.scripts?.['autonomous:owner-loop']?.includes('autonomous-owner-loop')) {
  fail('Autonomous scripts must expose the owner-loop state generator.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:owner-loop')) {
  fail('Autonomous daily loop must generate the owner-loop production command state.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:game-factory')) {
  fail('Autonomous daily loop must generate playable game runtime configs.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:env')) {
  fail('Autonomous daily loop must generate production environment readiness.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:icons')) {
  fail('Autonomous daily loop must generate install and store icon assets.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:import-events')) {
  fail('Autonomous daily loop must import exported local player events before analytics rollup.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:sample-plan')) {
  fail('Autonomous daily loop must generate product gate sample plans after gate recovery.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:local-event-bridge')) {
  fail('Autonomous daily loop must refresh the local event bridge before event import.')
}

const eventBridgeIndex = dailyScript.indexOf('autonomous:local-event-bridge')
const eventImportIndex = dailyScript.indexOf('autonomous:import-events')
const analyticsIndex = dailyScript.indexOf('autonomous:analytics')

if (
  eventBridgeIndex === -1 ||
  eventImportIndex === -1 ||
  analyticsIndex === -1 ||
  eventBridgeIndex > eventImportIndex ||
  eventImportIndex > analyticsIndex
) {
  fail('Autonomous daily loop must bridge local player events before import and analytics rollup.')
}

if (!packageJson.scripts?.['autonomous:local-event-bridge']?.includes('local-event-bridge')) {
  fail('Autonomous scripts must expose the local event bridge.')
}

if (
  !packageJson.scripts?.['autonomous:collect-sample-downloads']?.includes('AGL_LOCAL_EVENT_IMPORT_DOWNLOADS=true') ||
  !packageJson.scripts?.['autonomous:collect-sample-downloads']?.includes('local-event-bridge') ||
  !packageJson.scripts?.['autonomous:collect-sample-downloads']?.includes('autonomous:sample-plan')
) {
  fail('Autonomous scripts must expose the opt-in gate-sample Downloads collection refresh chain.')
}

if (!packageJson.scripts?.['autonomous:event-ingest-smoke']?.includes('event-ingest-smoke')) {
  fail('Autonomous scripts must expose the isolated event ingest smoke check.')
}

if (!packageJson.scripts?.['autonomous:event-collector-smoke']?.includes('event-collector-smoke')) {
  fail('Autonomous scripts must expose the isolated event collector smoke check.')
}

if (!packageJson.scripts?.['autonomous:collector-deploy-plan']?.includes('event-collector-deploy-plan')) {
  fail('Autonomous scripts must expose the event collector deployment plan.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:collector-deploy-plan')) {
  fail('Autonomous daily loop must generate the event collector deployment plan.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.indexOf('autonomous:event-collector-smoke') >
  packageJson.scripts?.['autonomous:daily']?.indexOf('autonomous:collector-deploy-plan')
) {
  fail('Autonomous daily loop must smoke-test the event collector before generating its deployment plan.')
}

const testAutomationScript = packageJson.scripts?.['test:automation'] ?? ''

if (!testAutomationScript.includes('event-collector-smoke')) {
  fail('Autonomous verification must run the isolated event collector smoke check.')
}

if (!testAutomationScript.includes('event-ingest-smoke')) {
  fail('Autonomous verification must run the isolated event ingest smoke check.')
}

if (!testAutomationScript.includes('local-event-bridge')) {
  fail('Autonomous verification must refresh the local event bridge artifact before verification.')
}

if (
  testAutomationScript.indexOf('event-collector-smoke') > testAutomationScript.indexOf('verify-autonomy')
) {
  fail('Autonomous verification must generate event collector smoke artifacts before verifying them.')
}

if (
  testAutomationScript.indexOf('event-ingest-smoke') > testAutomationScript.indexOf('verify-autonomy')
) {
  fail('Autonomous verification must generate event ingest smoke artifacts before verifying them.')
}

if (testAutomationScript.indexOf('local-event-bridge') > testAutomationScript.indexOf('verify-autonomy')) {
  fail('Autonomous verification must refresh local event bridge artifacts before verifying them.')
}

if (
  !analyticsLibSource.includes('flushBufferedEventsToCollector') ||
  !analyticsLibSource.includes('forwardedIdsKey') ||
  !analyticsLibSource.includes("window.addEventListener('online', flushBufferedEventsToCollector)") ||
  !analyticsLibSource.includes("window.addEventListener('visibilitychange'") ||
  !analyticsLibSource.includes('postEventsToEventCollector(pendingEvents)') ||
  !analyticsLibSource.includes('.slice(-50)')
) {
  fail('Browser analytics must retry buffered real events to the first-party collector without losing the local buffer.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:monetization')) {
  fail('Autonomous daily loop must generate monetization plans.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:unit-economics')) {
  fail('Autonomous daily loop must run the unit economics spend guard.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:respond')) {
  fail('Autonomous daily loop must run the autonomous production responder.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:incident-drill')) {
  fail('Autonomous daily loop must run the autonomous incident drill.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:store-assets')) {
  fail('Autonomous daily loop must generate store screenshot assets.')
}

if (!packageJson.scripts?.['autonomous:store-listing-optimize']?.includes('store-listing-optimizer')) {
  fail('Autonomous scripts must expose the store listing optimizer.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:store-listing-optimize')) {
  fail('Autonomous daily loop must optimize store listing drafts.')
}

if (!packageJson.scripts?.['autonomous:store-compliance']?.includes('store-compliance')) {
  fail('Autonomous scripts must expose the store compliance generator.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:store-compliance')) {
  fail('Autonomous daily loop must generate store compliance drafts.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:store-assets') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:store-listing-optimize') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:store-assets') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:store-listing-optimize')
) {
  fail('Autonomous daily loop must capture store assets before optimizing store listings.')
}

if (
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:store-listing-optimize') &&
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:store-compliance') &&
  packageJson.scripts['autonomous:daily'].indexOf('autonomous:store-listing-optimize') >
    packageJson.scripts['autonomous:daily'].indexOf('autonomous:store-compliance')
) {
  fail('Autonomous daily loop must optimize store listing drafts before store compliance.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:native-package')) {
  fail('Autonomous daily loop must generate native app packaging handoff assets.')
}

if (!packageJson.scripts?.['autonomous:android-release-plan']?.includes('android-release-planner')) {
  fail('Autonomous scripts must expose the Android release plan.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:android-release-plan')) {
  fail('Autonomous daily loop must generate the Android release plan.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:release-health')) {
  fail('Autonomous daily loop must run the release health guard.')
}

if (!packageJson.scripts?.['autonomous:daily']?.includes('autonomous:experiments')) {
  fail('Autonomous daily loop must evaluate experiment outcomes.')
}

for (const game of growth.gamePages ?? []) {
  try {
    await readFile(path.join(root, 'public', game.pagePath.replace(/^\//, '')), 'utf8')
  } catch {
    fail(`Generated public game page is missing: ${game.pagePath}`)
  }
}

if (
  storePackage.privacyPolicy?.path !== '/privacy.html' ||
  storePackage.supportPage?.path !== '/support.html' ||
  storePackage.dataSafetyDraft?.googlePlay?.status !== 'draft-ready' ||
  storePackage.dataSafetyDraft?.appleAppPrivacy?.status !== 'draft-ready' ||
  !storePackage.storeListing?.fullDescription ||
  !storePackage.storeListing?.screenshotAssets?.length ||
  !storePackage.nativePackaging?.androidTwaManifest?.packageName
) {
  fail('Store package must include privacy, data safety, listing, screenshot assets, and native packaging drafts.')
}

if (
  storeListingOptimizer.status !== 'store-listing-optimizer-ready' ||
  storeListingOptimizer.sourceStatus?.growthPlan !== growth.status ||
  storeListingOptimizer.sourceStatus?.acquisitionLearning !== acquisitionLearning.status ||
  storeListingOptimizer.sourceStatus?.retentionLoop !== retentionLoop.status ||
  storeListingOptimizer.sourceStatus?.pwaInstallLoop !== pwaInstallLoop.status ||
  storeListingOptimizer.sourceStatus?.storeAssets !== storeAssets.status ||
  storeListingOptimizer.recommendation?.focusGameId !== portfolioPolicy.dailyChallenge?.gameId ||
  storeListingOptimizer.recommendation?.focusGameId !== storePackage.launchCandidate?.id ||
  storeListingOptimizer.listing?.sourceGameId !== storePackage.launchCandidate?.id ||
  storePackage.storeListing?.source !== 'store-listing-optimizer' ||
  storePackage.storeListing?.sourceGameId !== storeListingOptimizer.recommendation?.focusGameId ||
  storePackage.storeListing?.shortDescription !== storeListingOptimizer.listing?.shortDescription ||
  storePackage.storeListing?.shortDescription?.length > storeListingOptimizer.copyGuardrails?.googleShortDescriptionMaxChars ||
  storeListingOptimizer.listing?.appleAppStore?.subtitle?.length > storeListingOptimizer.copyGuardrails?.appleSubtitleMaxChars ||
  storeListingOptimizer.listing?.appleAppStore?.keywords?.length > storeListingOptimizer.copyGuardrails?.appleKeywordsMaxChars ||
  storeListingOptimizer.copyGuardrails?.noProtectedBoardGameNames !== true ||
  storeListingOptimizer.copyGuardrails?.noUnverifiedAwardsOrRankingClaims !== true ||
  storeListingOptimizer.copyGuardrails?.noMonetizationClaimsBeforeEnabled !== true ||
  storeListingOptimizer.copyGuardrails?.noChildDirectedClaims !== true ||
  storeListingOptimizer.controls?.noPaidAsOResearchSpend !== true ||
  storeListingOptimizer.controls?.storeSubmissionStillBlocked !== true ||
  (storeListingOptimizer.screenshotPriorities?.length ?? 0) < 4 ||
  storePackage.storeListing?.screenshotAssets?.[0]?.id !== storeListingOptimizer.screenshotPriorities?.[0]?.id ||
  !storeListingOptimizer.listing?.keywords?.includes('daily puzzle')
) {
  fail('Store listing optimizer must align store focus, copy, keyword themes, screenshot order, and ASO guardrails with current growth and portfolio evidence.')
}

const storeComplianceCheckIds = new Set((storeCompliance.checks ?? []).map((check) => check.id))

if (
  storeCompliance.status !== 'draft-ready-external-blockers' ||
  storeCompliance.launchCandidate?.id !== storePackage.launchCandidate?.id ||
  storeCompliance.policyPosture !== 'no-accounts-no-ugc-no-gambling-no-paid-spend' ||
  storeCompliance.contentRating?.googlePlay?.questionnaireStatus !== 'draft-ready' ||
  storeCompliance.contentRating?.googlePlay?.expectedRating !== 'Everyone' ||
  storeCompliance.contentRating?.googlePlay?.answers?.gambling !== 'none' ||
  storeCompliance.contentRating?.googlePlay?.answers?.userGeneratedContent !== false ||
  storeCompliance.contentRating?.appleAppStore?.ageRatingStatus !== 'draft-ready' ||
  storeCompliance.contentRating?.appleAppStore?.expectedRating !== '4+' ||
  storeCompliance.targetAudience?.directedToChildren !== false ||
  storeCompliance.targetAudience?.childrenUnder13Targeted !== false ||
  storeCompliance.adsAndMonetization?.adsEnabled !== monetizationPlan.revenueEnabled ||
  storeCompliance.adsAndMonetization?.inAppPurchasesEnabled !== false ||
  storeCompliance.adsAndMonetization?.paywalledCoreRules !== false ||
  storeCompliance.privacyAndData?.googleDataSafetyStatus !== storePackage.dataSafetyDraft?.googlePlay?.status ||
  storeCompliance.privacyAndData?.applePrivacyLabelStatus !== storePackage.dataSafetyDraft?.appleAppPrivacy?.status ||
  storeCompliance.privacyAndData?.accountDeletion !== 'not-required-no-accounts' ||
  storeCompliance.appAccess?.loginRequired !== false ||
  storeCompliance.appAccess?.reviewerCredentialsRequired !== false ||
  !storeComplianceCheckIds.has('content-rating') ||
  !storeComplianceCheckIds.has('target-audience') ||
  !storeComplianceCheckIds.has('ads-declaration') ||
  !storeComplianceCheckIds.has('privacy-data') ||
  !storeComplianceCheckIds.has('app-access') ||
  !storeComplianceCheckIds.has('compliance-publication') ||
  !storeCompliance.blockers?.some((blocker) => blocker.includes('hosted-privacy-url')) ||
  !storeCompliance.reviewerNotes?.length
) {
  fail('Store compliance must publish content-rating, audience, ads, privacy, and reviewer-access drafts with external blockers.')
}

if (
  productionEnvironment.publicOrigin.status === 'missing' &&
  storePackage.privacyPolicy?.productionUrlStatus !== 'needs-hosted-domain'
) {
  fail('Store package must keep privacy URL unhosted while production origin is missing.')
}

if (
  storePackage.compliancePublication?.publicPath !== '/compliance.json' ||
  storePackage.compliancePublication?.controls?.postDeploySmokeRequired !== true ||
  !storePackage.compliancePublication?.smokeChecks?.some(
    (check) => check.id === 'compliance-manifest' && check.path === '/compliance.json',
  ) ||
  !storePackage.compliancePublication?.smokeChecks?.some((check) => check.path === '/privacy.html') ||
  !storePackage.compliancePublication?.smokeChecks?.some((check) => check.path === '/support.html') ||
  publicComplianceManifest.id !== 'store-compliance-publication' ||
  publicComplianceManifest.status !== storePackage.compliancePublication.status ||
  publicComplianceManifest.privacyPolicy?.path !== '/privacy.html' ||
  publicComplianceManifest.supportPage?.path !== '/support.html' ||
  publicComplianceManifest.storeCompliance?.policyPosture !== 'no-accounts-no-ugc-no-gambling-no-paid-spend'
) {
  fail('Store package must publish a deployable compliance manifest with privacy, support, and post-deploy smoke handoff.')
}

if (
  !nativePackage.status ||
  nativePackage.platform !== 'android-trusted-web-activity' ||
  !nativePackage.packageName ||
  !nativePackage.handoff?.twaManifestPath ||
  !nativePackage.handoff?.bubblewrapConfigPath ||
  !nativePackage.handoff?.assetLinksTemplatePath ||
  !nativePackage.assetLinks?.template?.[0]?.target?.package_name ||
  !nativePackage.commands?.init ||
  !nativePackage.commands?.build
) {
  fail('Native packager must publish Android TWA handoff metadata, asset-links template, and build commands.')
}

const nativeSigningFingerprintReady = Boolean(androidSigning.signing?.sha256CertFingerprint)
const nativeSigningFingerprintBlocker = 'Android signing certificate SHA-256 fingerprint is missing.'

if (
  nativePackage.status === 'blocked-draft-ready' &&
  (!nativePackage.blockers?.includes('Production host is missing or still uses example.com.') ||
    (nativeSigningFingerprintReady
      ? nativePackage.blockers?.includes(nativeSigningFingerprintBlocker)
      : !nativePackage.blockers?.includes(nativeSigningFingerprintBlocker)) ||
    (nativeSigningFingerprintReady && nativePackage.signing?.status !== 'fingerprint-configured'))
) {
  fail('Native package must stay blocked by external host/account gates while consuming prepared Android signing evidence.')
}

if (
  ![
    'ready-for-internal-testing',
    'release-held-by-economics',
    'blocked-needs-release-secrets',
    'blocked-needs-host-signing-play',
  ].includes(androidRelease.status) ||
  androidRelease.platform !== 'android-trusted-web-activity' ||
  androidRelease.channel !== 'android-google-play' ||
  androidRelease.nativePackageStatus !== nativePackage.status ||
  androidRelease.storeComplianceStatus !== storeCompliance.status ||
  androidRelease.gates?.storeSpendAllowed !== unitEconomics.controls?.storeSpendAllowed ||
  androidRelease.workflow?.path !== '.github/workflows/android-twa-release.yml' ||
  !androidRelease.artifacts?.twaManifestPath ||
  !androidRelease.artifacts?.bubblewrapConfigPath ||
  !androidRelease.checks?.some((check) => check.id === 'native-package-ready') ||
  !androidRelease.checks?.some((check) => check.id === 'store-compliance-draft' && check.status === 'pass') ||
  !androidRelease.checks?.some((check) => check.id === 'unit-economics-store-spend') ||
  !androidRelease.checks?.some((check) => check.id === 'release-workflow' && check.status === 'pass')
) {
  fail('Android release planner must publish gated TWA release status, artifacts, economics, and workflow readiness.')
}

if (unitEconomics.controls?.storeSpendAllowed === false && androidRelease.status === 'ready-for-internal-testing') {
  fail('Android release must not become ready while store spend is blocked.')
}

const twaManifest = JSON.parse(await readFile(path.join(root, 'native', 'android', 'twa-manifest.json'), 'utf8'))
const bubblewrapConfig = JSON.parse(await readFile(path.join(root, 'native', 'android', 'bubblewrap.config.json'), 'utf8'))
const assetLinksTemplate = JSON.parse(await readFile(path.join(root, 'native', 'android', 'assetlinks.template.json'), 'utf8'))

if (
  androidSigning.status !== 'signing-prepared' ||
  !/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(androidSigning.signing?.sha256CertFingerprint ?? '') ||
  androidSigning.localFiles?.keystorePath !== 'ops/android/signing/release.keystore' ||
  androidSigning.localFiles?.localEnvPath !== 'ops/production.env.local' ||
  androidSigning.localFiles?.gitIgnored !== true ||
  androidSigning.ciSecrets?.configuredLocally !== true ||
  androidSigning.ciSecrets?.valuesRedacted !== true ||
  androidSigning.controls?.zeroPaidSpend !== true ||
  androidSigning.controls?.noSecretValuesInReports !== true ||
  androidSigning.controls?.localSecretFilesGitIgnored !== true ||
  androidSigning.controls?.doesNotCommitKeystore !== true ||
  !(androidSigning.checks ?? []).every((check) => check.status === 'pass') ||
  !androidSigningSource.includes('keytool') ||
  !androidSigningSource.includes('ops/production.env.local') ||
  !gitignoreSource.includes('ops/android/signing/') ||
  !gitignoreSource.includes('native/android/secrets/') ||
  JSON.stringify(androidSigning).includes('AGL_ANDROID_KEYSTORE_PASSWORD=')
) {
  fail('Android signing prep must create redacted zero-spend signing evidence without committing keystore secrets.')
}

if (
  twaManifest.packageId !== nativePackage.packageName ||
  bubblewrapConfig.packageId !== nativePackage.packageName ||
  assetLinksTemplate[0]?.target?.package_name !== nativePackage.packageName
) {
  fail('Native Android handoff files must use the same package name as native-package.json.')
}

if (
  nativePackage.signing?.status !== 'fingerprint-configured' ||
  nativePackage.signing?.sha256CertFingerprint !== androidSigning.signing?.sha256CertFingerprint ||
  nativePackage.signing?.localSecretsConfigured !== true ||
  productionEnvironment.android?.signingFingerprintConfigured !== true ||
  productionEnvironment.android?.sha256CertFingerprint !== androidSigning.signing?.sha256CertFingerprint
) {
  fail('Native package and production environment must consume Android signing fingerprint evidence.')
}

const pngInfo = async (relativePath) => {
  const buffer = await readFile(path.join(root, relativePath.replace(/^\//, '')))

  if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    throw new Error(`${relativePath} is not a valid PNG`)
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.byteLength,
  }
}

if (
  iconAssets.status !== 'icons-ready' ||
  iconAssets.assets?.length < 6 ||
  iconAssets.manifestIcons?.length < 4 ||
  !iconAssets.storeIcons?.some((icon) => icon.size === 1024)
) {
  fail('Icon asset generator must produce PWA manifest icons, maskable icons, and store icon drafts.')
}

for (const icon of iconAssets.assets ?? []) {
  try {
    const publicInfo = await pngInfo(path.join('public', icon.path.replace(/^\//, '')))
    const distInfo = await pngInfo(path.join('dist', icon.path.replace(/^\//, '')))

    if (
      publicInfo.width !== icon.size ||
      publicInfo.height !== icon.size ||
      distInfo.width !== icon.size ||
      distInfo.height !== icon.size ||
      publicInfo.bytes < 4_000 ||
      distInfo.bytes < 4_000
    ) {
      fail(`Icon asset has invalid dimensions or size: ${icon.id}`)
    }
  } catch (error) {
    fail(`Icon asset is missing or invalid: ${icon.id} (${error.message})`)
  }
}

const storeScreenshotAssets = storeAssets.screenshots ?? []
const storePackageScreenshotIds = new Set(
  (storePackage.storeListing?.screenshotAssets ?? []).map((screenshot) => screenshot.id),
)

if (storeAssets.status !== 'screenshots-ready' || storeScreenshotAssets.length < 4) {
  fail('Store asset generator must produce at least four ready screenshots.')
}

for (const screenshot of storeScreenshotAssets) {
  try {
    const publicInfo = await pngInfo(path.join('public', screenshot.path.replace(/^\//, '')))
    const distInfo = await pngInfo(screenshot.distPath)

    if (
      publicInfo.width !== screenshot.width ||
      publicInfo.height !== screenshot.height ||
      distInfo.width !== screenshot.width ||
      distInfo.height !== screenshot.height ||
      publicInfo.bytes < 20_000 ||
      distInfo.bytes < 20_000 ||
      !storePackageScreenshotIds.has(screenshot.id)
    ) {
      fail(`Store screenshot asset is invalid or detached from store package: ${screenshot.id}`)
    }
  } catch (error) {
    fail(`Store screenshot asset is missing or invalid: ${screenshot.id} (${error.message})`)
  }
}

if (
  !monetizationPlan.status ||
  !monetizationPlan.placements?.length ||
  monetizationPlan.runtime?.surface !== 'result-screen' ||
  monetizationPlan.runtime?.firstPlacementId !== monetizationPlan.safety?.firstAllowedPlacement ||
  monetizationPlan.runtime?.requiresCompletedRun !== true ||
  monetizationPlan.runtime?.requiresFailedRun !== true ||
  !monetizationPlan.runtime?.blockedEventsWhenDisabled?.includes('revenue_cents') ||
  typeof monetizationPlan.adNetwork?.web?.configured !== 'boolean' ||
  typeof monetizationPlan.adNetwork?.app?.configured !== 'boolean' ||
  !monetizationPlan.safety?.neverEnableBeforeRetention?.includes('subscription') ||
  monetizationPlan.safety?.noInterstitialsInFirstSession !== true ||
  monetizationPlan.safety?.noPaywalledCoreRules !== true
) {
  fail('Monetization plan must include guarded runtime placements, ad-provider readiness, and safety blockers.')
}

if (readiness.monetization?.status === 'blocked' && monetizationPlan.revenueEnabled !== false) {
  fail('Monetization plan must keep revenue disabled while monetization readiness is blocked.')
}

if (monetizationPlan.revenueEnabled === false && monetizationPlan.runtime?.status !== 'guarded-disabled') {
  fail('Monetization runtime must stay guarded-disabled while revenue is disabled.')
}

if (
  readiness.monetization?.status === 'blocked' &&
  monetizationPlan.placements.some((placement) => placement.status === 'ready')
) {
  fail('Monetization placements must not become ready while monetization gates are blocked.')
}

if (
  !unitEconomics.status ||
  unitEconomics.controls?.spendGuardActive !== true ||
  typeof unitEconomics.controls?.maxDailySpendUsd !== 'number' ||
  unitEconomics.controls?.noPaidAcquisitionBeforeRevenue !== true ||
  unitEconomics.controls?.noStoreFeesBeforePayback !== true ||
  typeof unitEconomics.storeFees?.googlePlay?.costUsd !== 'number' ||
  typeof unitEconomics.storeFees?.iosAppStore?.costUsd !== 'number'
) {
  fail('Unit economics guard must publish active spend controls and app-store payback gates.')
}

if (
  analytics.totals.metrics.revenueCents === 0 &&
  (unitEconomics.controls.paidAcquisitionAllowed ||
    unitEconomics.controls.storeSpendAllowed ||
    unitEconomics.controls.maxDailySpendUsd !== 0)
) {
  fail('Unit economics guard must hold all paid spend while observed revenue is zero.')
}

if (monetizationPlan.revenueEnabled === false && unitEconomics.controls.monetizationSpendAllowed !== false) {
  fail('Unit economics guard must hold monetization spend while revenue features are disabled.')
}

if (
  !productionResponse.status ||
  !productionResponse.actions?.length ||
  typeof productionResponse.controls?.rollbackRequired !== 'boolean' ||
  typeof productionResponse.controls?.experimentsFrozen !== 'boolean' ||
  typeof productionResponse.controls?.paidSpendDisabled !== 'boolean' ||
  !productionResponse.fallbackVariantByExperiment?.first_session_pacing
) {
  fail('Production responder must publish safety actions, controls, and fallback experiment variants.')
}

if (
  productionResponse.releaseHealthStatus !== releaseHealth.status ||
  productionResponse.controls.rollbackRequired !== releaseHealth.controls.rollbackRequired
) {
  fail('Production responder must consume the current release health guard.')
}

if (unitEconomics.controls.paidAcquisitionAllowed === false && productionResponse.controls.paidSpendDisabled !== true) {
  fail('Production responder must enforce paid-spend holds from unit economics.')
}

if (monetizationPlan.revenueEnabled === false && productionResponse.controls.revenueDisabled !== true) {
  fail('Production responder must keep revenue disabled when monetization is not enabled.')
}

if (
  incidentDrill.status !== 'pass' ||
  incidentDrill.scenario !== 'blocked-release-health' ||
  incidentDrill.responderStatus !== 'incident-response' ||
  incidentDrill.controls?.deployAllowed !== false ||
  incidentDrill.controls?.rollbackRequired !== true ||
  incidentDrill.controls?.experimentsFrozen !== true ||
  incidentDrill.controls?.selfHealingApplied !== true
) {
  fail('Incident drill must prove rollback, experiment freeze, and self-healing behavior under blocked release health.')
}

if (
  incidentDrill.fallbackWeights?.first_session_pacing?.guided !== 85 ||
  incidentDrill.fallbackWeights?.first_session_pacing?.['fast-start'] !== 15 ||
  incidentDrill.fallbackWeights?.reward_offer?.['daily-streak'] !== 85 ||
  incidentDrill.fallbackWeights?.reward_offer?.['score-booster'] !== 15 ||
  !incidentDrill.actionIds?.includes('rollback-hold') ||
  !incidentDrill.actionIds?.includes('freeze-experiment-learning')
) {
  fail('Incident drill must verify fallback experiment weights and incident response actions.')
}

try {
  await readFile(path.join(root, 'dist', 'app-ads.txt'), 'utf8')
  await readFile(path.join(root, 'dist', 'monetization.json'), 'utf8')
} catch {
  fail('Monetization public assets must be included in the production build.')
}

try {
  await readFile(path.join(root, 'public', 'privacy.html'), 'utf8')
  await readFile(path.join(root, 'public', 'support.html'), 'utf8')
} catch {
  fail('Generated privacy or support page is missing from public assets.')
}

const experimentEntries = Object.entries(experimentPolicy.experiments ?? {})

if (!experimentEntries.length) {
  fail('Experiment policy is empty.')
}

const invalidExperimentWeights = experimentEntries.find(([, experiment]) => {
  const variants = experiment.variants ?? []
  const total = variants.reduce((sum, variant) => sum + variant.weight, 0)
  return (
    variants.length < 2 ||
    total !== 100 ||
    variants.some(
      (variant) =>
        variant.weight < experimentPolicy.guardrails.minVariantWeight ||
        variant.weight > experimentPolicy.guardrails.maxVariantWeight,
    )
  )
})

if (invalidExperimentWeights) {
  fail(`Experiment policy has invalid weights: ${invalidExperimentWeights[0]}`)
}

if (
  experimentResults.status !== 'evaluated' ||
  !experimentResults.experiments?.length ||
  !experimentResults.recommendations?.length ||
  !experimentResults.recommendations.some((recommendation) => recommendation.winnerVariant)
) {
  fail('Experiment evaluator must produce outcome recommendations with winning variants.')
}

const unknownExperimentRecommendation = experimentResults.recommendations.find(
  (recommendation) => !experimentPolicy.experiments?.[recommendation.experiment],
)

if (unknownExperimentRecommendation) {
  fail(`Experiment evaluator produced a recommendation for an unknown experiment: ${unknownExperimentRecommendation.experiment}`)
}

if (!applied.history?.some((action) => action.status === 'applied')) {
  fail('Improvement applier has not recorded an applied data-driven change.')
}

const staleAppliedAction = applied.actions?.find(
  (action) => action.status === 'applied' && action.gameId && action.gameId !== 'all-games' && !playableIds.has(action.gameId),
)

if (staleAppliedAction) {
  fail(`Improvement applier applied a change to a non-playable game: ${staleAppliedAction.gameId}`)
}

if (
  applied.experimentResultsStatus !== experimentResults.status ||
  !applied.actions?.some((action) => action.source === 'experiment-results')
) {
  fail('Improvement applier must consume experiment result recommendations before heuristic backlog changes.')
}

const prototypes = pipeline.prototypes ?? []

if (!prototypes.length) {
  fail('Prototype planner did not produce a build queue.')
}

const nextBuilds = prototypes.filter((prototype) => prototype.status === 'next-build')
const unbuiltPrototypes = prototypes.filter((prototype) => prototype.status !== 'playable')

const missingPlayableStatus = prototypes.find(
  (prototype) => playableIds.has(prototype.id) && prototype.status !== 'playable',
)

if (missingPlayableStatus) {
  fail(`Prototype pipeline must mark playable game as playable: ${missingPlayableStatus.title}`)
}

if (unbuiltPrototypes.length && !nextBuilds.length) {
  fail('Prototype pipeline must keep one unbuilt candidate marked next-build.')
}

const missingStoreGate = prototypes.find(
  (prototype) =>
    !prototype.distribution?.googlePlay?.blockers?.length ||
    !prototype.distribution?.iosAppStore?.blockers?.length,
)

if (missingStoreGate) {
  fail(`Prototype missing app-store blockers: ${missingStoreGate.title}`)
}

const unsafeMonetization = prototypes.find((prototype) =>
  prototype.monetization?.blockedBeforeRetention?.includes(prototype.monetization.firstTest),
)

if (unsafeMonetization) {
  fail(`Prototype has unsafe first monetization test: ${unsafeMonetization.title}`)
}

const missingStoreMetadata = prototypes.find(
  (prototype) =>
    !prototype.storeListing?.shortDescription ||
    !prototype.storeListing?.privacyDataDraft ||
    !prototype.storeListing?.screenshotPlan?.length,
)

if (missingStoreMetadata) {
  fail(`Prototype missing generated store metadata: ${missingStoreMetadata.title}`)
}

const balanceGames = balance.games ?? []

if (balanceGames.length < playableIds.size) {
  fail('Bot simulator must cover every playable game.')
}

const missingBalanceGame = [...playableIds].find(
  (gameId) => !balanceGames.some((game) => game.gameId === gameId),
)

if (missingBalanceGame) {
  fail(`Bot simulator missing playable game: ${missingBalanceGame}`)
}

const unconfiguredBalanceGame = balanceGames.find(
  (game) => gameBalance.games?.[game.gameId]?.targetScore !== game.targetScore,
)

if (unconfiguredBalanceGame) {
  fail(`Balance report does not match central game config: ${unconfiguredBalanceGame.title}`)
}

const missingStrategies = balanceGames.find(
  (game) =>
    !game.strategies?.some((strategy) => strategy.strategy === 'random') ||
    !game.strategies?.some((strategy) => strategy.strategy === 'greedy') ||
    !game.recommendations?.length,
)

if (missingStrategies) {
  fail(`Balance report missing strategy coverage: ${missingStrategies.title}`)
}

const highSeverityBalance = balanceGames.find((game) =>
  game.recommendations?.some((recommendation) => recommendation.severity === 'high'),
)

if (highSeverityBalance) {
  fail(`High severity balance issue remains: ${highSeverityBalance.title}`)
}

if (readiness.webPwa?.status !== 'ready-after-build') {
  fail('Production readiness gate must pass the web/PWA checks after build.')
}

if (!readiness.webPwa?.checks?.some((check) => check.id === 'release-health' && check.status === 'pass')) {
  fail('Production readiness must verify release health before web promotion.')
}

if (!readiness.webPwa?.checks?.some((check) => check.id === 'install-icons' && check.status === 'pass')) {
  fail('Production readiness must verify generated PWA install and store icons.')
}

if (!readiness.webPwa?.checks?.some((check) => check.id === 'organic-growth-assets' && check.status === 'pass')) {
  fail('Production readiness must verify organic growth assets in the production build.')
}

if (!readiness.webPwa?.checks?.some((check) => check.id === 'organic-growth-optimizer' && check.status === 'pass')) {
  fail('Production readiness must verify acquisition optimization actions.')
}

if (!readiness.webPwa?.checks?.some((check) => check.id === 'generated-runtime' && check.status === 'pass')) {
  fail('Production readiness must verify generated playable runtime configs.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'retention-loop' && check.status === 'pass') ||
  readiness.retention?.status !== 'ready-local-loop' ||
  readiness.retention?.dailyChallenge?.gameId !== retentionLoop.dailyChallenge?.gameId ||
  readiness.retention?.guardrails?.noPushNotifications !== true ||
  readiness.retention?.guardrails?.noAccountsRequired !== true ||
  readiness.retention?.guardrails?.noNotificationPermissionRequest !== true ||
  readiness.retention?.promptPolicy?.telemetry?.clicked !== 'daily_return_prompt_clicked' ||
  readiness.retention?.returnIntentPolicy?.telemetry?.started !== 'daily_return_intent_started' ||
  readiness.retention?.controls?.returnIntentPlayerInitiatedOnly !== true
) {
  fail('Production readiness must verify the daily retention loop, return prompt telemetry, and local-only retention guardrails.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'pwa-install-loop' && check.status === 'pass') ||
  readiness.pwaInstall?.status !== 'ready-browser-controlled' ||
  readiness.pwaInstall?.channel?.id !== pwaInstallLoop.channel?.id ||
  readiness.pwaInstall?.promptPolicy?.nativePromptRequired !== true ||
  readiness.pwaInstall?.guardrails?.noForcedPrompt !== true ||
  readiness.pwaInstall?.guardrails?.noBlockingGameplay !== true
) {
  fail('Production readiness must verify the browser-controlled PWA install loop and no-pressure install guardrails.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'performance-budget' && check.status === 'pass') ||
  readiness.performanceBudget?.status !== 'performance-budget-ready' ||
  readiness.performanceBudget?.initial?.jsBytes !== performanceBudget.initial?.jsBytes ||
  readiness.performanceBudget?.controls?.phaserDeferredFromInitialShell !== true ||
  readiness.performanceBudget?.controls?.initialShellBudgetEnforced !== true
) {
  fail('Production readiness must include the performance budget and deferred Phaser runtime check.')
}

const distReleaseCandidate = JSON.parse(await readFile(path.join(root, 'dist', 'release-candidate.json'), 'utf8'))
const releaseCandidateRequiredFiles = new Set(
  (releaseCandidate.integrity?.requiredFileChecks ?? [])
    .filter((check) => check.status === 'pass')
    .map((check) => check.path),
)

if (
  releaseCandidate.status !== 'release-candidate-ready' ||
  !releaseCandidate.candidateId?.startsWith('pwa-') ||
  releaseCandidate.summary?.totalFiles < 20 ||
  releaseCandidate.summary?.requiredFilesPresent !== true ||
  releaseCandidate.summary?.gamePages < 1 ||
  releaseCandidate.summary?.postDeploySmokeUrls < 6 ||
  releaseCandidate.integrity?.algorithm !== 'sha256' ||
  typeof releaseCandidate.integrity?.aggregateHash !== 'string' ||
  releaseCandidate.integrity.aggregateHash.length !== 64 ||
  releaseCandidate.controls?.zeroPaidSpend !== true ||
  releaseCandidate.controls?.contentHashesRecorded !== true ||
  releaseCandidate.controls?.postDeploySmokeRequired !== true ||
  !releaseCandidate.postDeploySmoke?.some((item) => item.path === '/' && item.expectedStatus === 200) ||
  !releaseCandidate.postDeploySmoke?.some((item) => item.path === '/privacy.html') ||
  !releaseCandidate.postDeploySmoke?.some(
    (item) => item.path === '/compliance.json' && item.requiredText === 'store-compliance',
  ) ||
  !releaseCandidateRequiredFiles.has('index.html') ||
  !releaseCandidateRequiredFiles.has('sw.js') ||
  !releaseCandidateRequiredFiles.has('manifest.webmanifest') ||
  !releaseCandidateRequiredFiles.has('compliance.json') ||
  distReleaseCandidate.candidateId !== releaseCandidate.candidateId ||
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:release-candidate') !== true ||
  packageJson.scripts?.['autonomous:assert-deployable']?.includes('autonomous:release-candidate') !== true
) {
  fail('Release candidate must publish a content-hashed dist manifest, required file inventory, post-deploy smoke plan, and zero-spend controls.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'release-candidate' && check.status === 'pass') ||
  readiness.releaseCandidate?.status !== releaseCandidate.status ||
  readiness.releaseCandidate?.candidateId !== releaseCandidate.candidateId ||
  readiness.releaseCandidate?.integrity?.aggregateHash !== releaseCandidate.integrity?.aggregateHash ||
  readiness.releaseCandidate?.controls?.contentHashesRecorded !== true
) {
  fail('Production readiness must include release-candidate integrity and post-deploy smoke evidence.')
}

const postDeploySmokeAllowedStatuses = ['blocked-missing-origin', 'post-deploy-smoke-passed']
const postDeploySmokeExpectedChecks = (releaseCandidate.postDeploySmoke?.length ?? 0) + 1
const postDeployManifestCheck = postDeploySmoke.checks?.find(
  (check) => check.id === 'release-candidate-manifest',
)
const localArtifactManifestCheck = localArtifactSmoke.checks?.find(
  (check) => check.id === 'release-candidate-manifest',
)
const localArtifactComplianceCheck = localArtifactSmoke.checks?.find((check) => check.path === '/compliance.json')

if (
  !postDeploySmokeAllowedStatuses.includes(postDeploySmoke.status) ||
  localArtifactSmoke.status !== 'predeploy-artifact-smoke-passed' ||
  localArtifactSmoke.summary?.planned < postDeploySmokeExpectedChecks ||
  localArtifactSmoke.summary?.passed !== localArtifactSmoke.summary?.planned ||
  localArtifactSmoke.summary?.failed !== 0 ||
  localArtifactSmoke.controls?.readOnlyFileChecks !== true ||
  localArtifactSmoke.controls?.noNetworkRequired !== true ||
  localArtifactSmoke.controls?.requiredTextChecks !== true ||
  localArtifactSmoke.controls?.manifestHashComparisonRequired !== true ||
  !localArtifactManifestCheck ||
  !localArtifactComplianceCheck ||
  localArtifactComplianceCheck.status !== 'pass' ||
  postDeploySmoke.sourceStatus?.deployment !== deployment.status ||
  postDeploySmoke.sourceStatus?.releaseCandidate !== releaseCandidate.status ||
  postDeploySmoke.target?.candidateId !== releaseCandidate.candidateId ||
  postDeploySmoke.target?.aggregateHash !== releaseCandidate.integrity?.aggregateHash ||
  postDeploySmoke.controls?.zeroPaidSpend !== true ||
  postDeploySmoke.controls?.noStoreSubmission !== true ||
  postDeploySmoke.controls?.noRevenueEnablement !== true ||
  postDeploySmoke.controls?.readOnlyHttpChecks !== true ||
  postDeploySmoke.controls?.localArtifactSmokeRequired !== true ||
  postDeploySmoke.controls?.manifestHashComparisonRequired !== true ||
  (postDeploySmoke.checks?.length ?? 0) < postDeploySmokeExpectedChecks ||
  !postDeployManifestCheck ||
  (postDeploySmoke.target?.origin
    ? postDeploySmoke.status !== 'post-deploy-smoke-passed' ||
      postDeploySmoke.summary?.passed !== postDeploySmoke.summary?.planned
    : postDeploySmoke.status !== 'blocked-missing-origin' ||
      postDeploySmoke.summary?.blocked !== postDeploySmoke.summary?.planned) ||
  packageJson.scripts?.['autonomous:post-deploy-smoke'] !== 'node scripts/post-deploy-smoke.mjs' ||
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:post-deploy-smoke') !== true ||
  !postDeploySmokeSource.includes('AGL_DEPLOYED_PWA_ORIGIN') ||
  !postDeploySmokeSource.includes('manifestHashComparisonRequired') ||
  !webDeployWorkflow.includes('AGL_DEPLOYED_PWA_ORIGIN') ||
  !webDeployWorkflow.includes('npm run autonomous:post-deploy-smoke -- --assert') ||
  !webDeployWorkflow.includes('data/post-deploy-smoke.json') ||
  !webDeployWorkflow.includes('reports/post-deploy-smoke-latest.md')
) {
  fail('Post-deploy smoke must verify the deployed Pages origin with read-only URL checks and release-manifest hash comparison.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'post-deploy-smoke-runner' && check.status === 'pass') ||
  readiness.postDeploySmoke?.status !== postDeploySmoke.status ||
  readiness.postDeploySmoke?.target?.candidateId !== releaseCandidate.candidateId ||
  readiness.postDeploySmoke?.target?.aggregateHash !== releaseCandidate.integrity?.aggregateHash ||
  readiness.postDeploySmoke?.localArtifactSmoke?.status !== 'predeploy-artifact-smoke-passed' ||
  readiness.postDeploySmoke?.localArtifactSmoke?.summary?.passed !==
    readiness.postDeploySmoke?.localArtifactSmoke?.summary?.planned ||
  readiness.postDeploySmoke?.controls?.readOnlyHttpChecks !== true ||
  readiness.postDeploySmoke?.controls?.localArtifactSmokeRequired !== true ||
  readiness.postDeploySmoke?.controls?.manifestHashComparisonRequired !== true
) {
  fail('Production readiness must include the post-deploy smoke runner and release-manifest comparison evidence.')
}

const repositoryReadinessAllowedStatuses = [
  'repository-channel-ready',
  'waiting-for-gh-auth',
  'waiting-for-repository-channel',
  'waiting-for-github-repository',
  'blocked-missing-pages-workflow',
  'blocked-no-local-git',
]
const repositoryChannelReady = ['repository-channel-ready', 'waiting-for-gh-auth'].includes(
  repositoryReadiness.status,
)

if (
  !repositoryReadinessAllowedStatuses.includes(repositoryReadiness.status) ||
  repositoryReadiness.controls?.zeroPaidSpend !== true ||
  repositoryReadiness.controls?.readOnlyLocalInspection !== true ||
  repositoryReadiness.controls?.noGitMutation !== true ||
  repositoryReadiness.controls?.noWorkflowDispatch !== true ||
  repositoryReadiness.controls?.noAccountCreation !== true ||
  repositoryReadiness.pages?.workflowPath !== '.github/workflows/web-pwa-deploy.yml' ||
  repositoryReadiness.pages?.deployWorkflowIncludesSmoke !== true ||
  repositoryReadiness.pages?.releaseCandidateId !== releaseCandidate.candidateId ||
  repositoryReadiness.pages?.postDeploySmokeStatus !== postDeploySmoke.status ||
  !['environment', 'origin-remote', 'gh-auth-user-and-package-name', 'missing'].includes(
    repositoryReadiness.repository?.source,
  ) ||
  typeof repositoryReadiness.repository?.inferredRepositoryName !== 'string' ||
  repositoryReadiness.repository?.remoteParsing?.supportsSshUrl !== true ||
  repositoryReadiness.repository?.remoteParsing?.supportsDottedRepositoryNames !== true ||
  typeof repositoryReadiness.githubAutomation?.ghAuthAvailable !== 'boolean' ||
  typeof repositoryReadiness.githubAutomation?.ghCredentialReady !== 'boolean' ||
  typeof repositoryReadiness.workspace?.nonGeneratedDirtyFiles !== 'number' ||
  !repositoryReadiness.checks?.some((check) => check.id === 'local-git-worktree') ||
  !repositoryReadiness.checks?.some((check) => check.id === 'pages-workflow' && check.status === 'pass') ||
  !repositoryReadiness.checks?.some((check) => check.id === 'deployable-artifact' && check.status === 'pass') ||
  (repositoryChannelReady && repositoryReadiness.workspace?.insideWorkTree !== true) ||
  (!repositoryChannelReady && (repositoryReadiness.blockers?.length ?? 0) < 1) ||
  (repositoryReadiness.workspace?.nonGeneratedDirtyFiles === 0 &&
    repositoryReadiness.blockers?.some((blocker) => blocker.includes('Commit current generated changes'))) ||
  packageJson.scripts?.['autonomous:repo-readiness'] !== 'node scripts/repository-readiness.mjs' ||
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:repo-readiness') !== true ||
  !repositoryReadinessSource.includes('nonGeneratedDirtyFiles') ||
  !repositoryReadinessSource.includes('generatedEvidenceDirtyFiles') ||
  !repositoryReadinessSource.includes('generatedEvidencePrefixes') ||
  !repositoryReadinessSource.includes('public/share-manifest.json') ||
  !repositoryReadinessSource.includes('public/seed-kit.html') ||
  !repositoryReadinessSource.includes('gh-auth-user-and-package-name') ||
  !repositoryReadinessSource.includes('ghCredentialReady') ||
  !repositoryReadinessSource.includes('repositoryNameFromPackage') ||
  !repositoryReadinessSource.includes('ssh:\\/\\/git@github\\.com') ||
  !repositoryReadinessSource.includes('noGitMutation') ||
  !repositoryReadinessSource.includes('noWorkflowDispatch') ||
  !appSource.includes('Repository Channel')
) {
  fail('Repository readiness must inspect the git/GitHub Pages deployment channel without mutating git or dispatching workflows.')
}

if (
  readiness.repositoryChannel?.status !== repositoryReadiness.status ||
  readiness.repositoryChannel?.insideWorkTree !== repositoryReadiness.workspace?.insideWorkTree ||
  readiness.repositoryChannel?.workflowDispatchReady !==
    repositoryReadiness.githubAutomation?.workflowDispatchReady ||
  readiness.repositoryChannel?.controls?.noWorkflowDispatch !== true
) {
  fail('Production readiness must include repository-channel blockers separately from build artifact readiness.')
}

const repositoryBootstrapAllowedStatuses = [
  'repository-bootstrap-ready',
  'waiting-for-gh-auth',
  'waiting-for-origin-remote',
  'waiting-for-github-target',
  'needs-local-git-bootstrap',
]

if (
  !repositoryBootstrapAllowedStatuses.includes(repositoryBootstrap.status) ||
  !['plan-only', 'apply-local-git'].includes(repositoryBootstrap.mode) ||
  repositoryBootstrap.controls?.zeroPaidSpend !== true ||
  repositoryBootstrap.controls?.dryRunByDefault !== true ||
  repositoryBootstrap.controls?.localGitMutationRequiresExplicitFlag !== true ||
  repositoryBootstrap.controls?.remoteGitHubMutationRequiresExplicitEnv !== true ||
  repositoryBootstrap.controls?.initialCommitRequiresExplicitEnv !== true ||
  repositoryBootstrap.controls?.snapshotCommitRequiresExplicitEnv !== true ||
  repositoryBootstrap.controls?.pushRequiresExplicitEnv !== true ||
  repositoryBootstrap.controls?.noWorkflowDispatch !== true ||
  repositoryBootstrap.helper?.path !== 'ops/github/bootstrap-repository.sh' ||
  repositoryBootstrap.helper?.noWorkflowDispatch !== true ||
  !['environment', 'origin-remote', 'gh-auth-user-and-package-name', 'missing'].includes(
    repositoryBootstrap.repository?.source,
  ) ||
  typeof repositoryBootstrap.repository?.inferredRepositoryName !== 'string' ||
  repositoryBootstrap.repository?.remoteParsing?.supportsSshUrl !== true ||
  repositoryBootstrap.repository?.remoteParsing?.supportsDottedRepositoryNames !== true ||
  typeof repositoryBootstrap.githubAutomation?.ghAuthAvailable !== 'boolean' ||
  typeof repositoryBootstrap.githubAutomation?.ghCredentialReady !== 'boolean' ||
  !repositoryBootstrap.actions?.some((action) => action.id === 'initialize-local-git') ||
  !repositoryBootstrap.actions?.some((action) => action.id === 'commit-current-snapshot') ||
  !repositoryBootstrap.actions?.some((action) => action.id === 'create-github-repository') ||
  !repositoryBootstrap.actions?.some((action) => action.id === 'push-initial-snapshot') ||
  typeof repositoryBootstrap.workspace?.after?.nonGeneratedDirtyFiles !== 'number' ||
  (repositoryBootstrap.workspace?.after?.nonGeneratedDirtyFiles === 0 &&
    repositoryBootstrap.blockers?.some((blocker) => blocker.includes('Commit current generated changes'))) ||
  (repositoryBootstrap.status === 'repository-bootstrap-ready' &&
    (!repositoryBootstrap.workspace?.after?.insideWorkTree || !repositoryBootstrap.repository?.remoteRepository)) ||
  (repositoryBootstrap.status === 'needs-local-git-bootstrap' && (repositoryBootstrap.blockers?.length ?? 0) < 1) ||
  packageJson.scripts?.['autonomous:repo-bootstrap'] !== 'node scripts/repository-bootstrap.mjs' ||
  packageJson.scripts?.['autonomous:daily']?.includes('autonomous:repo-bootstrap') !== true ||
  !repositoryBootstrapSource.includes('localGitMutationRequiresExplicitFlag') ||
  !repositoryBootstrapSource.includes('remoteGitHubMutationRequiresExplicitEnv') ||
  !repositoryBootstrapSource.includes('snapshotCommitRequiresExplicitEnv') ||
  !repositoryBootstrapSource.includes('nonGeneratedDirtyFiles') ||
  !repositoryBootstrapSource.includes('generatedEvidenceDirtyFiles') ||
  !repositoryBootstrapSource.includes('generatedEvidencePrefixes') ||
  !repositoryBootstrapSource.includes('public/share-manifest.json') ||
  !repositoryBootstrapSource.includes('public/seed-kit.html') ||
  !repositoryBootstrapSource.includes('gh-auth-user-and-package-name') ||
  !repositoryBootstrapSource.includes('AGL_ALLOW_GH_INFER_REPOSITORY') ||
  !repositoryBootstrapSource.includes('repositoryNameFromPackage') ||
  !repositoryBootstrapSource.includes('ssh:\\/\\/git@github\\.com') ||
  !repositoryBootstrapSource.includes('AGL_ALLOW_LOCAL_GIT_BOOTSTRAP') ||
  !githubRepositoryBootstrapScript.includes('AGL_ALLOW_GH_INFER_REPOSITORY') ||
  !githubRepositoryBootstrapScript.includes('derive_repository_name') ||
  !githubRepositoryBootstrapScript.includes('ssh://git@github.com/') ||
  !githubRepositoryBootstrapScript.includes('AGL_ALLOW_SNAPSHOT_COMMIT') ||
  !githubRepositoryBootstrapScript.includes('working tree has uncommitted changes') ||
  !githubRepositoryBootstrapScript.includes('No workflows were dispatched') ||
  githubRepositoryBootstrapScript.includes('RUN_WORKFLOWS') ||
  !appSource.includes('Repository Bootstrap')
) {
  fail('Repository bootstrap must prepare local git/GitHub transport with explicit mutation gates and no workflow dispatch.')
}

if (
  readiness.repositoryBootstrap?.status !== repositoryBootstrap.status ||
  readiness.repositoryBootstrap?.controls?.dryRunByDefault !== true ||
  readiness.repositoryBootstrap?.helper?.path !== 'ops/github/bootstrap-repository.sh'
) {
  fail('Production readiness must include repository-bootstrap transport evidence and controls.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'product-optimization' && check.status === 'pass') ||
  readiness.productOptimization?.status !== productOptimization.status ||
  readiness.productOptimization?.productGates?.firstGameCompletion?.actual !== productOptimization.productGates?.firstGameCompletion?.actual ||
  !readiness.productOptimization?.actions?.some((action) => action.actionType === 'target-score-curve') ||
  !readiness.productOptimization?.actions?.some((action) => action.actionType === 'runtime-replay-telemetry') ||
  !readiness.productOptimization?.actions?.some((action) => action.actionType === 'runtime-first-move-coach') ||
  !readiness.productOptimization?.actions?.some((action) => action.actionType === 'runtime-replay-prompt') ||
  !readiness.productOptimization?.actions?.some((action) => action.actionType === 'runtime-completion-nudge') ||
  !readiness.productOptimization?.actions?.some((action) => action.actionType === 'runtime-return-intent-activation')
) {
  fail('Production readiness must include product-gate optimization, first-move coach, and replay telemetry actions.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'first-move-coach' && check.status === 'pass') ||
  readiness.firstMoveCoach?.status !== firstMoveCoach.status ||
  readiness.firstMoveCoach?.summary?.enabledTargets !== firstMoveCoach.summary?.enabledTargets ||
  readiness.firstMoveCoach?.controls?.firstTurnOnly !== true ||
  readiness.firstMoveCoach?.controls?.noAutoMove !== true ||
  readiness.firstMoveCoach?.telemetry?.shown !== 'first_move_coach_shown'
) {
  fail('Production readiness must include first-move coach evidence, controls, and telemetry contract.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'completion-loop' && check.status === 'pass') ||
  readiness.completionLoop?.status !== completionLoop.status ||
  readiness.completionLoop?.target?.gameId !== completionLoop.target?.gameId ||
  readiness.completionLoop?.controls?.midRunOnly !== true ||
  readiness.completionLoop?.controls?.noAutoMove !== true ||
  readiness.completionLoop?.controls?.finishLineCoachBehindPaceOnly !== true ||
  readiness.completionLoop?.promptPolicy?.telemetry?.clicked !== 'completion_nudge_clicked' ||
  readiness.completionLoop?.finishLinePolicy?.telemetry?.clicked !== 'finish_line_coach_clicked'
) {
  fail('Production readiness must include completion-loop evidence, controls, nudge telemetry, and finish-line coaching contract.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'replay-loop' && check.status === 'pass') ||
  readiness.replayLoop?.status !== replayLoop.status ||
  readiness.replayLoop?.target?.gameId !== replayLoop.target?.gameId ||
  readiness.replayLoop?.controls?.afterCompletedRunOnly !== true ||
  readiness.replayLoop?.controls?.noForcedReplay !== true ||
  readiness.replayLoop?.promptPolicy?.telemetry?.clicked !== 'replay_prompt_clicked'
) {
  fail('Production readiness must include replay-loop evidence, controls, and prompt telemetry contract.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'production-bootstrap' && check.status === 'pass') ||
  readiness.productionBootstrap?.status !== productionBootstrap.status ||
  readiness.productionBootstrap?.controls?.zeroSpendGuard !== true ||
  readiness.productionBootstrap?.setupScript?.path !== 'ops/github/setup-production.sh' ||
  !readiness.productionBootstrap?.stages?.some((stage) => stage.id === 'repository-channel') ||
  !readiness.productionBootstrap?.stages?.some((stage) => stage.id === 'repository-bootstrap') ||
  !readiness.productionBootstrap?.stages?.some((stage) => stage.id === 'github-pages-hosting') ||
  !readiness.productionBootstrap?.stages?.some((stage) => stage.id === 'autonomous-self-update') ||
  !readiness.productionBootstrap?.setupCommands?.some((command) => command.id === 'repository-preflight') ||
  !readiness.productionBootstrap?.setupCommands?.some((command) => command.id === 'repository-bootstrap-plan') ||
  !readiness.productionBootstrap?.setupCommands?.some((command) => command.id === 'sync-repository-config')
) {
  fail('Production readiness must include the zero-spend production bootstrap handoff and setup script gate.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'autonomous-operator' && check.status === 'pass') ||
  readiness.autonomousOperator?.status !== autonomousOperator.status ||
  readiness.autonomousOperator?.selectedAction?.id !== autonomousOperator.selectedAction?.id ||
  readiness.autonomousOperator?.controls?.localCommandAllowlistEnforced !== true ||
  readiness.autonomousOperator?.controls?.maxActionsPerRun !== 1
) {
  fail('Production readiness must include the dry-run autonomous operator plan and one-action allowlist controls.')
}

if (
  !readiness.webPwa?.checks?.some(
    (check) => check.id === 'autonomous-operator-history' && check.status === 'pass',
  ) ||
  readiness.autonomousOperatorHistory?.status !== autonomousOperatorHistory.status ||
  readiness.autonomousOperatorHistory?.controls?.historyIsCapped !== true ||
  readiness.autonomousOperatorHistory?.summary?.totalRecords !==
    autonomousOperatorHistory.summary?.totalRecords
) {
  fail('Production readiness must include capped autonomous operator history evidence.')
}

if (
	  !readiness.webPwa?.checks?.some((check) => check.id === 'autonomous-cadence' && check.status === 'pass') ||
	  readiness.autonomousCadence?.status !== autonomousCadence.status ||
	  readiness.autonomousCadence?.commandPlan?.operate !== 'npm run autonomous:operate' ||
	  readiness.autonomousCadence?.commandPlan?.executeOneLocalAction !== 'npm run autonomous:operator -- --execute' ||
	  readiness.autonomousCadence?.commandPlan?.afterAction !== 'npm run autonomous:after-action' ||
	  readiness.autonomousCadence?.controls?.scheduledLocalActionExecution !== true ||
	  readiness.autonomousCadence?.controls?.postActionBuildRefresh !== true ||
	  readiness.autonomousCadence?.controls?.postActionVerification !== true ||
	  readiness.autonomousCadence?.controls?.zeroPaidSpend !== true
) {
  fail('Production readiness must include scheduled autonomous cadence evidence and zero-spend controls.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'autonomous-self-update' && check.status === 'pass') ||
  readiness.autonomousSelfUpdate?.status !== autonomousSelfUpdate.status ||
  readiness.autonomousSelfUpdate?.commitPlan?.workflow !== '.github/workflows/autonomous-self-update.yml' ||
  readiness.autonomousSelfUpdate?.pendingChanges?.unsafeCount !== 0 ||
  readiness.autonomousSelfUpdate?.controls?.commitRequiresCleanVerification !== true ||
  readiness.autonomousSelfUpdate?.controls?.commitRequiresSafePathAllowlist !== true
) {
  fail('Production readiness must include guarded autonomous self-update persistence evidence.')
}

if (
  !readiness.webPwa?.checks?.some((check) => check.id === 'objective-audit' && check.status === 'pass') ||
  readiness.objectiveAudit?.status !== objectiveAudit.status ||
  readiness.objectiveAudit?.completion?.canMarkGoalComplete !== false ||
  !readiness.objectiveAudit?.requirements?.some((item) => item.id === 'monetization-path') ||
  !readiness.objectiveAudit?.requirements?.some((item) => item.id === 'app-store-distribution-path')
) {
  fail('Production readiness must include the objective audit and preserve incomplete/blocker state.')
}

if (
  !readiness.distribution?.storePackage?.checks?.some(
    (check) => check.id === 'android-signing-prep' && check.status === 'pass',
  ) ||
  readiness.distribution?.androidSigning?.status !== androidSigning.status ||
  readiness.distribution?.androidSigning?.signing?.sha256CertFingerprint !==
    androidSigning.signing?.sha256CertFingerprint ||
  readiness.distribution?.nativePackage?.signing?.sha256CertFingerprint !==
    androidSigning.signing?.sha256CertFingerprint
) {
  fail('Production readiness must include Android signing prep evidence and native package fingerprint handoff.')
}

if (readiness.distribution?.googlePlay?.status !== 'blocked') {
  fail('Google Play distribution must remain blocked until credentials and policy assets exist.')
}

if (readiness.distribution?.storePackage?.status !== 'draft-ready') {
  fail('Store package readiness must be draft-ready before distribution handoff.')
}

if (
  readiness.distribution?.storeListingOptimizer?.status !== storeListingOptimizer.status ||
  readiness.distribution?.storeListingOptimizer?.recommendation?.focusGameId !== storeListingOptimizer.recommendation?.focusGameId ||
  readiness.distribution?.storeListingOptimizer?.leadScreenshotId !== storeListingOptimizer.screenshotPriorities?.[0]?.id ||
  !readiness.distribution?.storePackage?.checks?.some(
    (check) => check.id === 'store-listing-optimizer' && check.status === 'pass',
  )
) {
  fail('Production readiness must include the store listing optimizer focus, screenshot priority, and copy guardrail check.')
}

if (
  readiness.distribution?.storeCompliance?.status !== storeCompliance.status ||
  !readiness.distribution?.storePackage?.checks?.some(
    (check) => check.id === 'store-compliance' && check.status === 'pass',
  ) ||
  !readiness.distribution?.storePackage?.checks?.some(
    (check) => check.id === 'compliance-publication-pack' && check.status === 'pass',
  ) ||
  readiness.distribution?.storePackage?.compliancePublication?.publicPath !== '/compliance.json' ||
  readiness.distribution?.storeCompliance?.contentRating?.googlePlay?.expectedRating !== 'Everyone' ||
  readiness.distribution?.storeCompliance?.targetAudience?.directedToChildren !== false
) {
  fail('Production readiness must include store compliance content rating, audience, and ads policy drafts.')
}

if (
  readiness.distribution?.nativePackage?.status !== nativePackage.status ||
  !readiness.distribution?.storePackage?.checks?.some(
    (check) => check.id === 'native-package-handoff' && check.status === 'pass',
  )
) {
  fail('Production readiness must include generated native app packaging handoff assets.')
}

if (readiness.monetization?.status !== 'blocked') {
  fail('Monetization must remain blocked until completion, replay, and retention gates pass.')
}

if (readiness.monetization?.metrics?.d1Retention !== analytics.totals.metrics.d1Retention) {
  fail('Production readiness must consume the analytics D1 retention metric.')
}

if (
  readiness.environment?.status !== productionEnvironment.status ||
  !readiness.webPwa?.checks?.some((check) => check.id === 'production-environment' && check.status === 'pass')
) {
  fail('Production readiness must include production environment readiness.')
}

if (
  !['healthy', 'monitoring'].includes(releaseHealth.status) ||
  releaseHealth.controls?.canPromoteWeb !== true ||
  releaseHealth.controls?.canDeploy !== true ||
  typeof releaseHealth.metrics?.runtimeErrorRate !== 'number' ||
  !releaseHealth.checks?.some((check) => check.id === 'runtime-error-rate')
) {
  fail('Release health guard must evaluate runtime and behavior metrics without blocking the current web release.')
}

if (applied.releaseHealthStatus && applied.releaseHealthStatus !== releaseHealth.status) {
  fail('Improvement applier must consume the current release health guard status.')
}

const promotionChannels = new Set((promotion.decisions ?? []).map((decision) => decision.channel))

if (
  !promotionChannels.has('web-pwa') ||
  !promotionChannels.has('monetization') ||
  !promotionChannels.has('android-google-play') ||
  !promotionChannels.has('ios-app-store')
) {
  fail('Promotion decision must cover web, monetization, Android, and iOS channels.')
}

if (promotion.summary?.costPosture !== 'no-new-spend') {
  fail('Promotion decision must preserve no-new-spend posture until gates pass.')
}

if (promotion.releaseHealth?.status !== releaseHealth.status || promotion.releaseHealth?.canDeploy !== releaseHealth.controls.canDeploy) {
  fail('Promotion decision must include release health guard controls.')
}

const deployWorkflow = webDeployWorkflow

if (deployment.status !== 'ready-for-pages' || deployment.target?.provider !== 'github-pages') {
  fail('Deployment plan must be ready for GitHub Pages when web promotion passes.')
}

if (
  deployment.repositoryChannel?.status !== repositoryReadiness.status ||
  deployment.repositoryChannel?.insideWorkTree !== repositoryReadiness.workspace?.insideWorkTree ||
  deployment.repositoryChannel?.workflowDispatchReady !==
    repositoryReadiness.githubAutomation?.workflowDispatchReady
) {
  fail('Deployment plan must include repository-channel readiness separately from artifact deployability.')
}

if (
  deployment.releaseHealth?.status !== releaseHealth.status ||
  !deployment.checks?.some((check) => check.id === 'release-health' && check.status === 'pass')
) {
  fail('Deployment plan must be gated by release health.')
}

if (
  deployment.unitEconomics?.status !== unitEconomics.status ||
  !deployment.checks?.some((check) => check.id === 'unit-economics-guard' && check.status === 'pass')
) {
  fail('Deployment plan must include the unit economics spend guard.')
}

if (
  deployment.productionResponse?.status !== productionResponse.status ||
  !deployment.checks?.some((check) => check.id === 'production-response' && check.status === 'pass')
) {
  fail('Deployment plan must include the autonomous production responder.')
}

if (
  deployment.releaseCandidate?.status !== releaseCandidate.status ||
  deployment.releaseCandidate?.candidateId !== releaseCandidate.candidateId ||
  deployment.releaseCandidate?.aggregateHash !== releaseCandidate.integrity?.aggregateHash ||
  !deployment.checks?.some((check) => check.id === 'release-candidate' && check.status === 'pass')
) {
  fail('Deployment plan must include the exact release-candidate manifest before Pages deploy.')
}

if (
  deployment.environment?.status !== productionEnvironment.status ||
  !deployment.checks?.some((check) => check.id === 'production-environment' && check.status === 'pass')
) {
  fail('Deployment plan must include production environment readiness.')
}

if (
  deployment.eventCollector?.status !== eventCollectorDeployment.status ||
  deployment.eventCollector?.workflow !== '.github/workflows/event-collector-deploy.yml' ||
  !deployment.checks?.some((check) => check.id === 'event-collector-deployment' && check.status === 'pass')
) {
  fail('Deployment plan must include event collector deployment readiness.')
}

const ownerSystemIds = new Set((autonomousOwnerLoop.systems ?? []).map((system) => system.id))
const ownerActionIds = new Set((autonomousOwnerLoop.safeAutonomousActions ?? []).map((action) => action.id))
const ownerGuardrailIds = new Set((autonomousOwnerLoop.guardrails ?? []).map((guardrail) => guardrail.id))
const requiredOwnerSystems = [
  'game-factory',
  'analytics-ingest',
  'local-event-bridge',
  'autonomous-cadence',
  'autonomous-self-update',
  'repository-channel',
  'repository-bootstrap',
  'portfolio-loop',
  'traffic-seeding',
  'acquisition-learning',
  'retention-loop',
  'pwa-install-loop',
  'performance-budget',
  'product-optimization',
  'product-gate-sample-plan',
  'improvement-loop',
  'organic-growth',
  'web-deployment',
  'release-candidate',
  'post-deploy-smoke',
  'first-move-coach',
  'completion-loop',
  'replay-loop',
  'production-bootstrap',
  'autonomous-operator',
  'operator-history',
  'objective-audit',
  'store-listing-optimizer',
  'store-compliance',
  'android-signing',
  'production-safety',
  'monetization-path',
  'app-store-path',
]
const requiredOwnerActions = [
  'run-daily-owner-loop',
  'refresh-autonomous-cadence',
  'refresh-autonomous-self-update',
  'seed-portfolio-traffic',
  'optimize-daily-retention',
  'measure-pwa-install-loop',
  'check-performance-budget',
  'prepare-release-candidate',
  'run-post-deploy-smoke',
  'prepare-repository-channel',
  'refresh-first-move-coach',
  'collect-gate-sample-downloads',
  'refresh-product-gate-sample-plan',
  'refresh-completion-loop',
  'refresh-replay-loop',
  'optimize-product-gates',
  'bootstrap-production-setup',
  'run-autonomous-operator',
  'review-operator-history',
  'refresh-objective-audit',
  'optimize-store-listing',
  'prepare-android-signing',
  'apply-safe-improvements',
  'deploy-web-pwa',
  'collect-live-events',
]
const missingOwnerSystem = requiredOwnerSystems.find((systemId) => !ownerSystemIds.has(systemId))
const missingOwnerAction = requiredOwnerActions.find((actionId) => !ownerActionIds.has(actionId))
const missingRequiredEnv = (productionEnvironment.requiredEnv ?? []).filter((item) => !item.configured)
const ownerMissingCredential = missingRequiredEnv.find(
  (item) => !autonomousOwnerLoop.credentialRequiredActions?.some((action) => action.target === item.name),
)
const missingBootstrapSecret = (productionBootstrap.requiredSecrets ?? [])
  .filter((item) => !item.configured)
  .find(
    (item) =>
      !autonomousOwnerLoop.credentialRequiredActions?.some(
        (action) => action.target === item.repositorySecret,
      ),
  )
const ownerRecentExecutedRecords = [...(autonomousOperatorHistory.records ?? [])]
  .reverse()
  .filter((record) => record.execution?.requested === true && record.execution?.status === 'executed')
const ownerLastExecutedRecord = ownerRecentExecutedRecords[0]
const ownerLastExecutedActionId =
  ownerLastExecutedRecord?.selectedActionId ?? autonomousOperatorHistory.summary?.lastExecutedActionId ?? null
const ownerLastExecutedStatus = ownerLastExecutedRecord?.execution?.status ?? null
const ownerLastRecordExecutionStatus = autonomousOperatorHistory.summary?.lastExecutionStatus ?? null
const ownerHasExecutedAction = (autonomousOperatorHistory.summary?.executedRecords ?? 0) > 0
const ownerRecentExecutedActionIds = [
  ...new Set(ownerRecentExecutedRecords.map((record) => record.selectedActionId).filter(Boolean)),
].slice(0, 8)
const ownerCompositeActionSatisfiedActionIds = {
  'collect-gate-sample-downloads': [
    'collect-live-events',
    'refresh-product-gate-recovery',
    'refresh-product-gate-sample-plan',
  ],
  'collect-live-events': ['refresh-product-gate-recovery'],
}
const ownerRecentlySatisfiedActionIds = [
  ...new Set(
    ownerRecentExecutedActionIds.flatMap((actionId) => ownerCompositeActionSatisfiedActionIds[actionId] ?? []),
  ),
]
const ownerRecentlyCoveredActionIds = new Set([...ownerRecentExecutedActionIds, ...ownerRecentlySatisfiedActionIds])
const ownerRecentlyExecutedActionStillExecutable = (autonomousOwnerLoop.safeAutonomousActions ?? []).some(
  (action) =>
    action.id === ownerLastExecutedActionId &&
    ['armed', 'ready-when-repository-pages-enabled'].includes(action.status),
)
const ownerRecentlyExecutedExecutableActionIds = ownerRecentExecutedActionIds.filter((actionId) =>
  (autonomousOwnerLoop.safeAutonomousActions ?? []).some(
    (action) => action.id === actionId && ['armed', 'ready-when-repository-pages-enabled'].includes(action.status),
  ),
)
const ownerHasExecutableAlternativeOutsideRecent = (autonomousOwnerLoop.safeAutonomousActions ?? []).some(
  (action) =>
    ['armed', 'ready-when-repository-pages-enabled'].includes(action.status) &&
    !ownerRecentExecutedActionIds.includes(action.id),
)
const ownerRecentlySatisfiedExecutableActionIds = ownerRecentlySatisfiedActionIds.filter((actionId) =>
  (autonomousOwnerLoop.safeAutonomousActions ?? []).some(
    (action) => action.id === actionId && ['armed', 'ready-when-repository-pages-enabled'].includes(action.status),
  ),
)
const ownerHasExecutableAlternativeOutsideCovered = (autonomousOwnerLoop.safeAutonomousActions ?? []).some(
  (action) =>
    ['armed', 'ready-when-repository-pages-enabled'].includes(action.status) &&
    !ownerRecentlyCoveredActionIds.has(action.id),
)
const ownerGateSampleBackoff = autonomousOwnerLoop.executionMemory?.gateSampleDownloadsBackoff
const ownerGateSampleEvidenceReadyNow =
  (localEventBridge.gateSampleEvidence?.inbox?.events ?? 0) > 0 ||
  (localEventBridge.gateSampleEvidence?.imported?.events ?? 0) > 0
const ownerExplicitDownloadsScanAt = Date.parse(localEventBridge.explicitDownloadsScan?.scannedAt ?? '')
const ownerGateSampleDownloadsBackoffHours = 4
const ownerGateSampleDownloadsExpiryBufferMs = 60 * 1000
const ownerExplicitDownloadsScanRecent =
  Number.isFinite(ownerExplicitDownloadsScanAt) &&
  Date.now() + ownerGateSampleDownloadsExpiryBufferMs - ownerExplicitDownloadsScanAt <
    ownerGateSampleDownloadsBackoffHours * 60 * 60 * 1000
const ownerGateSampleDownloadsCoolingDown =
  ownerExplicitDownloadsScanRecent &&
  localEventBridge.explicitDownloadsScan?.evidenceFound === false &&
  !ownerGateSampleEvidenceReadyNow
const ownerProductGateSamplePlanFreshAfterDownloadsScan =
  Number.isFinite(ownerExplicitDownloadsScanAt) &&
  Number.isFinite(Date.parse(productGateSamplePlan.generatedAt ?? '')) &&
  Date.parse(productGateSamplePlan.generatedAt) >= ownerExplicitDownloadsScanAt
const ownerCollectGateSampleAction = autonomousOwnerLoop.safeAutonomousActions?.find(
  (action) => action.id === 'collect-gate-sample-downloads',
)
const ownerRefreshSamplePlanAction = autonomousOwnerLoop.safeAutonomousActions?.find(
  (action) => action.id === 'refresh-product-gate-sample-plan',
)

if (
  autonomousOwnerLoop.status !== 'owner-loop-ready' ||
  !['zero-spend-web-ready', 'guarded-local-automation', 'incident-response', 'repository-channel-needed'].includes(autonomousOwnerLoop.mode) ||
  autonomousOwnerLoop.controls?.localLoopCanRunWithoutExternalAccounts !== true ||
  autonomousOwnerLoop.controls?.zeroPaidSpend !== true ||
  autonomousOwnerLoop.controls?.paidAcquisitionAllowed !== unitEconomics.controls?.paidAcquisitionAllowed ||
  autonomousOwnerLoop.controls?.storeSpendAllowed !== unitEconomics.controls?.storeSpendAllowed ||
  autonomousOwnerLoop.controls?.deployAllowed !== productionResponse.controls?.deployAllowed ||
  autonomousOwnerLoop.evidence?.analyticsSource !== analytics.sourceStatus.activeSource ||
  autonomousOwnerLoop.evidence?.localEventBridgeStatus !== localEventBridge.status ||
  autonomousOwnerLoop.evidence?.dailyChallenge?.gameId !== portfolioPolicy.dailyChallenge?.gameId ||
  autonomousOwnerLoop.evidence?.trafficSeedingStatus !== trafficSeeding.status ||
  autonomousOwnerLoop.evidence?.acquisitionLearningStatus !== acquisitionLearning.status ||
  autonomousOwnerLoop.evidence?.retentionLoopStatus !== retentionLoop.status ||
  autonomousOwnerLoop.evidence?.pwaInstallLoopStatus !== pwaInstallLoop.status ||
  autonomousOwnerLoop.evidence?.autonomousCadenceStatus !== autonomousCadence.status ||
  autonomousOwnerLoop.evidence?.autonomousSelfUpdateStatus !== autonomousSelfUpdate.status ||
  autonomousOwnerLoop.evidence?.performanceBudgetStatus !== performanceBudget.status ||
  autonomousOwnerLoop.evidence?.repositoryReadinessStatus !== repositoryReadiness.status ||
  autonomousOwnerLoop.evidence?.repositoryBootstrapStatus !== repositoryBootstrap.status ||
  autonomousOwnerLoop.evidence?.releaseCandidateStatus !== releaseCandidate.status ||
  autonomousOwnerLoop.evidence?.postDeploySmokeStatus !== postDeploySmoke.status ||
  autonomousOwnerLoop.evidence?.firstMoveCoachStatus !== firstMoveCoach.status ||
  autonomousOwnerLoop.evidence?.productGateSamplePlanStatus !== productGateSamplePlan.status ||
  autonomousOwnerLoop.evidence?.completionLoopStatus !== completionLoop.status ||
  autonomousOwnerLoop.evidence?.replayLoopStatus !== replayLoop.status ||
  autonomousOwnerLoop.evidence?.productOptimizationStatus !== productOptimization.status ||
  autonomousOwnerLoop.evidence?.productionBootstrapStatus !== productionBootstrap.status ||
  autonomousOwnerLoop.evidence?.autonomousOperatorStatus !== autonomousOperator.status ||
  autonomousOwnerLoop.evidence?.autonomousOperatorHistoryStatus !== autonomousOperatorHistory.status ||
  autonomousOwnerLoop.evidence?.objectiveAuditStatus !== objectiveAudit.status ||
  autonomousOwnerLoop.evidence?.storeListingOptimizerStatus !== storeListingOptimizer.status ||
  autonomousOwnerLoop.evidence?.deploymentStatus !== deployment.status ||
  autonomousOwnerLoop.evidence?.productionEnvironmentStatus !== productionEnvironment.status ||
  autonomousOwnerLoop.evidence?.storeComplianceStatus !== storeCompliance.status ||
  autonomousOwnerLoop.evidence?.androidSigningStatus !== androidSigning.status ||
  missingOwnerSystem ||
  missingOwnerAction ||
  ownerMissingCredential ||
  missingBootstrapSecret ||
  autonomousOwnerLoop.executionMemory?.avoidImmediateRepeat !== true ||
  autonomousOwnerLoop.executionMemory?.recentExecutionWindow !== 8 ||
  autonomousOwnerLoop.executionMemory?.lastExecutedActionId !== ownerLastExecutedActionId ||
  autonomousOwnerLoop.executionMemory?.lastExecutedStatus !== ownerLastExecutedStatus ||
  autonomousOwnerLoop.executionMemory?.lastRecordExecutionStatus !== ownerLastRecordExecutionStatus ||
  ownerGateSampleBackoff?.enabled !== true ||
  ownerGateSampleBackoff?.cooldownHours !== ownerGateSampleDownloadsBackoffHours ||
  ownerGateSampleBackoff?.coolingDown !== ownerGateSampleDownloadsCoolingDown ||
  ownerGateSampleBackoff?.lastExplicitScanAt !==
    (Number.isFinite(ownerExplicitDownloadsScanAt) ? localEventBridge.explicitDownloadsScan?.scannedAt : null) ||
  ownerGateSampleBackoff?.lastExplicitScanStatus !== (localEventBridge.explicitDownloadsScan?.status ?? null) ||
  ownerGateSampleBackoff?.evidenceReadyNow !== ownerGateSampleEvidenceReadyNow ||
  !autonomousOwnerLoopSource.includes('gateSampleDownloadsBackoff') ||
  JSON.stringify(autonomousOwnerLoop.executionMemory?.recentExecutedActionIds ?? []) !==
    JSON.stringify(ownerRecentExecutedActionIds) ||
  JSON.stringify(autonomousOwnerLoop.executionMemory?.recentlySatisfiedActionIds ?? []) !==
    JSON.stringify(ownerRecentlySatisfiedActionIds) ||
  (ownerHasExecutedAction &&
    ownerHasExecutableAlternativeOutsideRecent &&
    ownerRecentExecutedActionIds.includes(autonomousOwnerLoop.ownerDecision?.nextBestActionId)) ||
  (ownerHasExecutedAction &&
    ownerHasExecutableAlternativeOutsideCovered &&
    ownerRecentlySatisfiedActionIds.includes(autonomousOwnerLoop.ownerDecision?.nextBestActionId)) ||
  (ownerHasExecutedAction &&
    ownerRecentlyExecutedActionStillExecutable &&
    autonomousOwnerLoop.ownerDecision?.nextBestActionId === ownerLastExecutedActionId) ||
  (ownerHasExecutedAction &&
    ownerRecentlyExecutedActionStillExecutable &&
    !autonomousOwnerLoop.executionMemory?.skippedRecentlyExecutedActionIds?.includes(ownerLastExecutedActionId)) ||
  (ownerHasExecutedAction &&
    ownerHasExecutableAlternativeOutsideRecent &&
    !ownerRecentlyExecutedExecutableActionIds.every((actionId) =>
      autonomousOwnerLoop.executionMemory?.skippedRecentlyExecutedActionIds?.includes(actionId),
    )) ||
  (ownerHasExecutedAction &&
    ownerHasExecutableAlternativeOutsideCovered &&
    !ownerRecentlySatisfiedExecutableActionIds.every((actionId) =>
      autonomousOwnerLoop.executionMemory?.skippedRecentlySatisfiedActionIds?.includes(actionId),
    )) ||
  (ownerGateSampleDownloadsCoolingDown && ownerCollectGateSampleAction?.status !== 'monitor') ||
  (ownerGateSampleDownloadsCoolingDown &&
    autonomousOwnerLoop.ownerDecision?.nextBestActionId === 'collect-gate-sample-downloads') ||
  (ownerGateSampleDownloadsCoolingDown &&
    ownerProductGateSamplePlanFreshAfterDownloadsScan &&
    ownerRefreshSamplePlanAction?.status !== 'monitor') ||
  (ownerGateSampleDownloadsCoolingDown &&
    ownerProductGateSamplePlanFreshAfterDownloadsScan &&
    autonomousOwnerLoop.ownerDecision?.nextBestActionId === 'refresh-product-gate-sample-plan')
) {
  fail('Autonomous owner loop must synthesize current production state, safe actions, and credential-gated blockers.')
}

if (
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) => action.id === 'run-daily-owner-loop' && action.command === 'npm run autonomous:daily',
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'refresh-autonomous-cadence' &&
      action.command === 'npm run autonomous:cadence' &&
      action.costUsd === 0 &&
      action.targets?.includes('autonomous-game-lab-daily-owner-loop'),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'refresh-autonomous-self-update' &&
      action.command === 'npm run autonomous:self-update' &&
      action.costUsd === 0 &&
      action.targets?.includes('.github/workflows/autonomous-self-update.yml'),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'seed-portfolio-traffic' &&
      action.command?.includes('autonomous:traffic') &&
      action.command?.includes('autonomous:acquisition') &&
      portfolioPolicy.rotation?.seedTrafficGameIds?.every((gameId) => action.targets?.includes(gameId)),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'optimize-daily-retention' &&
      action.command === 'npm run autonomous:retention' &&
      action.costUsd === 0 &&
      action.targets?.includes(retentionLoop.dailyChallenge?.gameId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'measure-pwa-install-loop' &&
      action.command === 'npm run autonomous:pwa-install' &&
      action.costUsd === 0 &&
      action.targets?.includes('pwa-install'),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'check-performance-budget' &&
      action.command === 'npm run build && npm run autonomous:performance' &&
      action.costUsd === 0 &&
      action.targets?.includes('pwa-shell'),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'prepare-release-candidate' &&
      action.command === 'npm run autonomous:release-candidate' &&
      action.costUsd === 0 &&
      action.targets?.includes(releaseCandidate.candidateId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'run-post-deploy-smoke' &&
      action.command === 'npm run autonomous:post-deploy-smoke' &&
      action.costUsd === 0 &&
      action.targets?.includes(releaseCandidate.candidateId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'prepare-repository-channel' &&
      action.command === 'npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap' &&
      action.costUsd === 0,
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'refresh-first-move-coach' &&
      action.command === 'npm run autonomous:first-move-coach' &&
      action.costUsd === 0 &&
      action.targets?.includes(firstMoveCoach.summary?.primaryTargetId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'refresh-product-gate-sample-plan' &&
      action.command === 'npm run autonomous:sample-plan' &&
      action.costUsd === 0 &&
      action.targets?.includes(productGateSamplePlan.summary?.primaryGateId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'collect-gate-sample-downloads' &&
      action.command === 'npm run autonomous:collect-sample-downloads' &&
      action.costUsd === 0 &&
      action.targets?.includes(productGateSamplePlan.summary?.primaryGateId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'refresh-completion-loop' &&
      action.command === 'npm run autonomous:completion-loop' &&
      action.costUsd === 0 &&
      action.targets?.includes(completionLoop.target?.gameId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'refresh-replay-loop' &&
      action.command === 'npm run autonomous:replay-loop' &&
      action.costUsd === 0 &&
      action.targets?.includes(replayLoop.target?.gameId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'optimize-product-gates' &&
      action.command?.includes('autonomous:product-optimize') &&
      action.command?.includes('autonomous:simulate') &&
      action.costUsd === 0,
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'bootstrap-production-setup' &&
      action.command?.includes('autonomous:release-candidate') &&
      action.command?.includes('autonomous:bootstrap') &&
      action.command?.includes('autonomous:deploy-plan') &&
      action.costUsd === 0,
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'run-autonomous-operator' &&
      action.command === 'npm run autonomous:operator' &&
      action.costUsd === 0,
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'review-operator-history' &&
      action.command === 'npm run autonomous:operator' &&
      action.costUsd === 0,
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'refresh-objective-audit' &&
      action.command === 'npm run autonomous:objective-audit' &&
      action.costUsd === 0,
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'optimize-store-listing' &&
      action.command?.includes('autonomous:store-listing-optimize') &&
      action.command?.includes('autonomous:store-compliance') &&
      action.costUsd === 0 &&
      action.targets?.includes(storeListingOptimizer.recommendation?.focusGameId),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'prepare-android-signing' &&
      action.command === 'npm run autonomous:android-signing' &&
      action.costUsd === 0 &&
      action.targets?.includes('android-twa-signing'),
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) => action.id === 'deploy-web-pwa' && action.costUsd === 0,
  ) ||
  !autonomousOwnerLoop.safeAutonomousActions?.some(
    (action) =>
      action.id === 'collect-live-events' &&
      action.command ===
        'npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery' &&
      action.costUsd === 0,
  ) ||
  !ownerGuardrailIds.has('zero-paid-spend') ||
  !ownerGuardrailIds.has('no-revenue-before-product-gates') ||
  !ownerGuardrailIds.has('no-store-fees-before-payback') ||
  !ownerGuardrailIds.has('no-retire-without-live-data') ||
  !autonomousOwnerLoop.guardrails?.every((guardrail) => guardrail.enforced === true) ||
  !autonomousOwnerLoop.ownerDecision?.nextBestActionId ||
  !ownerActionIds.has(autonomousOwnerLoop.ownerDecision.nextBestActionId)
) {
  fail('Autonomous owner loop must preserve zero-spend guardrails and choose an executable next action.')
}

if (
  !appSource.includes('ownerDecisionAction') ||
  !appSource.includes('autonomousOwnerLoop.ownerDecision.nextBestActionId') ||
  !appSource.includes('[ownerDecisionAction]')
) {
  fail('Autonomy cockpit must always surface the owner loop next action even when it is outside the top action slice.')
}

if (
  !deployWorkflow.includes('actions/configure-pages') ||
  !deployWorkflow.includes('actions/upload-pages-artifact') ||
  !deployWorkflow.includes('actions/deploy-pages') ||
  !deployWorkflow.includes('npm run autonomous:operate') ||
  !deployWorkflow.includes('npm run autonomous:release-candidate') ||
  !deployWorkflow.includes('npm run autonomous:assert-deployable') ||
  !deployWorkflow.includes('AGL_DEPLOYED_PWA_ORIGIN') ||
  !deployWorkflow.includes('npm run autonomous:post-deploy-smoke -- --assert') ||
  !deployWorkflow.includes('post-deploy-smoke')
) {
  fail('Web PWA deploy workflow must prepare a release candidate, configure, upload, gate, deploy GitHub Pages, and run post-deploy smoke.')
}

if (
  !collectorWorkflow.includes('npm run autonomous:event-collector-smoke') ||
  !collectorWorkflow.includes('npm run autonomous:collector-deploy-plan') ||
  !collectorWorkflow.includes('npx wrangler@latest deploy') ||
  !collectorWorkflow.includes('AGL_EVENT_COLLECTOR_ADMIN_TOKEN') ||
  !collectorWorkflow.includes('CLOUDFLARE_API_TOKEN') ||
  !collectorWorkflow.includes('actions/upload-artifact')
) {
  fail('Event collector deploy workflow must smoke-test, plan, gate, deploy with Wrangler, and upload artifacts.')
}

if (
  !androidWorkflow.includes('npm run autonomous:android-release-plan') ||
  !androidWorkflow.includes('npm run autonomous:native-package') ||
  !androidWorkflow.includes('npx @bubblewrap/cli validate') ||
  !androidWorkflow.includes('npx @bubblewrap/cli build') ||
  !androidWorkflow.includes('AGL_ANDROID_KEYSTORE_BASE64') ||
  !androidWorkflow.includes('actions/upload-artifact')
) {
  fail('Android TWA release workflow must plan, gate, package with Bubblewrap, and upload artifacts.')
}

if (
  !workflow.includes('schedule:') ||
  !workflow.includes('npm run autonomous:operate') ||
  !workflow.includes('actions/upload-artifact')
) {
  fail('Scheduled CI workflow must run the autonomous owner loop and upload artifacts.')
}

if (process.exitCode) {
  process.exit()
}

console.log(
  `Autonomy artifacts verified: ${trend.signals.mechanics.length} mechanics, ${acceptedConcepts.length} concepts, ${prototypes.length} prototypes, ${balanceGames.length} balance reports, ${backlog.length} improvements.`,
)
