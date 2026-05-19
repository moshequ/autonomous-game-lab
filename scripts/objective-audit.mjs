import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'objective-audit.json')
const outputTsPath = path.join(root, 'src', 'data', 'objectiveAudit.ts')
const reportPath = path.join(root, 'reports', 'objective-audit-latest.md')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const [
  packageJson,
  trendSourceReadiness,
  concepts,
  playable,
  generatedPlayable,
  analytics,
  eventCollectorSmoke,
  eventIngestSmoke,
  productOptimization,
  firstMoveCoach,
  completionLoop,
  replayLoop,
  retentionLoop,
  organicSeedLoop,
  experimentResults,
  appliedImprovements,
  improvementBacklog,
  readiness,
  promotion,
  monetization,
  unitEconomics,
  storePackage,
  storeAssets,
  storeCompliance,
  nativePackage,
  androidSigning,
  androidRelease,
  releaseCandidate,
  postDeploySmoke,
  repositoryReadiness,
  repositoryBootstrap,
  deployment,
  productionBootstrap,
  autonomousOwnerLoop,
  autonomousOperator,
  autonomousOperatorHistory,
  autonomousCadence,
  autonomousSelfUpdate,
  environment,
] = await Promise.all([
  readJson(path.join(root, 'package.json')),
  readJson(path.join(dataDir, 'trend-source-readiness.json')),
  readJson(path.join(dataDir, 'generated-concepts.json')),
  readJson(path.join(dataDir, 'playable-games.json')),
  readJson(path.join(dataDir, 'generated-playable-games.json')),
  readJson(path.join(dataDir, 'analytics-rollup.json')),
  readJson(path.join(dataDir, 'event-collector-smoke.json')),
  readJson(path.join(dataDir, 'event-ingest-smoke.json')),
  readJson(path.join(dataDir, 'product-optimization.json')),
  readJson(path.join(dataDir, 'first-move-coach.json')),
  readJson(path.join(dataDir, 'completion-loop.json')),
  readJson(path.join(dataDir, 'replay-loop.json')),
  readJson(path.join(dataDir, 'retention-loop.json')),
  readJson(path.join(dataDir, 'organic-seed-loop.json')),
  readJson(path.join(dataDir, 'experiment-results.json')),
  readJson(path.join(dataDir, 'applied-improvements.json')),
  readJson(path.join(dataDir, 'improvement-backlog.json')),
  readJson(path.join(dataDir, 'production-readiness.json')),
  readJson(path.join(dataDir, 'promotion-decision.json')),
  readJson(path.join(dataDir, 'monetization-plan.json')),
  readJson(path.join(dataDir, 'unit-economics.json')),
  readJson(path.join(dataDir, 'store-package.json')),
  readJson(path.join(dataDir, 'store-assets.json')),
  readJson(path.join(dataDir, 'store-compliance.json')),
  readJson(path.join(dataDir, 'native-package.json')),
  readJson(path.join(dataDir, 'android-signing.json')),
  readJson(path.join(dataDir, 'android-release.json')),
  readJson(path.join(dataDir, 'release-candidate.json')),
  readJson(path.join(dataDir, 'post-deploy-smoke.json')),
  readJson(path.join(dataDir, 'repository-readiness.json')),
  readJson(path.join(dataDir, 'repository-bootstrap.json')),
  readJson(path.join(dataDir, 'deployment-plan.json')),
  readJson(path.join(dataDir, 'production-bootstrap.json')),
  readJson(path.join(dataDir, 'autonomous-owner-loop.json')),
  readJson(path.join(dataDir, 'autonomous-operator.json')),
  readJson(path.join(dataDir, 'autonomous-operator-history.json')),
  readJson(path.join(dataDir, 'autonomous-cadence.json')),
  readJson(path.join(dataDir, 'autonomous-self-update.json')),
  readJson(path.join(dataDir, 'production-environment.json')),
])

const distManifestExists = await exists(path.join(root, 'dist', 'manifest.webmanifest'))
const distServiceWorkerExists = await exists(path.join(root, 'dist', 'sw.js'))
const webDecision = promotion.decisions?.find((decision) => decision.channel === 'web-pwa')
const monetizationDecision = promotion.decisions?.find((decision) => decision.channel === 'monetization')
const androidDecision = promotion.decisions?.find((decision) => decision.channel === 'android-google-play')
const iosDecision = promotion.decisions?.find((decision) => decision.channel === 'ios-app-store')
const acceptedConcepts = concepts.concepts?.filter((concept) => concept.status === 'candidate') ?? []
const lowRiskConcepts = acceptedConcepts.filter(
  (concept) => concept.sourceDistance?.copiedExpressionRisk === 'low',
)
const lowRiskGeneratedGames =
  generatedPlayable.games?.filter((game) => game.sourceDistance?.copiedExpressionRisk === 'low') ?? []
const liveAnalytics = ['posthog', 'local-event-drops'].includes(analytics.sourceStatus?.activeSource)
const objectiveBlockers = [
  ...new Set([
    ...(repositoryReadiness.blockers ?? []),
    ...(repositoryBootstrap.blockers ?? []),
    ...(environment.blockers ?? []),
    ...(monetization.blockers ?? []),
    ...(storeCompliance.blockers ?? []),
    ...(androidRelease.blockers ?? []),
    ...(productionBootstrap.externalBlockers ?? []).map((item) => item.blocker),
  ]),
]
const postDeploySmokeReady =
  ['blocked-missing-origin', 'post-deploy-smoke-passed'].includes(postDeploySmoke.status) &&
  postDeploySmoke.localArtifactSmoke?.status === 'predeploy-artifact-smoke-passed' &&
  postDeploySmoke.localArtifactSmoke?.summary?.passed === postDeploySmoke.localArtifactSmoke?.summary?.planned &&
  postDeploySmoke.localArtifactSmoke?.summary?.failed === 0 &&
  postDeploySmoke.target?.candidateId === releaseCandidate.candidateId &&
  postDeploySmoke.target?.aggregateHash === releaseCandidate.integrity?.aggregateHash &&
  postDeploySmoke.controls?.zeroPaidSpend === true &&
  postDeploySmoke.controls?.readOnlyHttpChecks === true &&
  postDeploySmoke.controls?.localArtifactSmokeRequired === true &&
  postDeploySmoke.controls?.manifestHashComparisonRequired === true
const repositoryChannelReady = ['repository-channel-ready', 'waiting-for-gh-auth'].includes(
  repositoryReadiness.status,
)
const autonomousOperatorReady = ['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status)
const autonomousOperatorHistoryReady =
  autonomousOperatorHistory.status === 'operator-history-ready' &&
  (autonomousOperatorHistory.summary?.executedRecords ?? 0) >= 1

const requirement = ({
  id,
  status,
  summary,
  evidence,
  blockers = [],
  nextAction,
  completionCritical = true,
}) => ({
  id,
  status,
  summary,
  evidence,
  blockers,
  nextAction,
  completionCritical,
})

const requirements = [
  requirement({
    id: 'web-pwa-game-portal',
    status:
      readiness.webPwa?.status === 'ready-after-build' && distManifestExists && distServiceWorkerExists
        ? 'met'
        : 'incomplete',
    summary: 'A playable web/PWA portal exists and passes the production web readiness gate.',
    evidence: [
      `Web readiness: ${readiness.webPwa?.status ?? 'missing'}`,
      `Manifest in dist: ${distManifestExists}`,
      `Service worker in dist: ${distServiceWorkerExists}`,
      `Release candidate: ${releaseCandidate.status}; ${releaseCandidate.summary?.totalFiles ?? 0} files`,
      `Deployment plan: ${deployment.status}`,
    ],
    blockers:
      readiness.webPwa?.status === 'ready-after-build'
        ? []
        : readiness.webPwa?.checks?.filter((check) => check.status !== 'pass').map((check) => check.detail) ?? [],
    nextAction: webDecision?.nextAction ?? 'Keep the PWA release gate green.',
  }),
  requirement({
    id: 'original-trend-driven-game-generation',
    status:
      ['live-licensed', 'cached-licensed', 'fixture-safe'].includes(trendSourceReadiness.status) &&
      acceptedConcepts.length >= 2 &&
      acceptedConcepts.length === lowRiskConcepts.length &&
      generatedPlayable.status === 'generated-runtime-ready' &&
      (playable.games?.length ?? 0) >= 10 &&
      lowRiskGeneratedGames.length === (generatedPlayable.games?.length ?? 0)
        ? 'met'
        : 'incomplete',
    summary: 'Trend signals produce original, low-IP-risk concepts and generated playable games.',
    evidence: [
      `Trend source: ${trendSourceReadiness.status}`,
      `Candidate concepts: ${acceptedConcepts.length}`,
      `Low-risk concepts: ${lowRiskConcepts.length}`,
      `Playable games: ${playable.games?.length ?? 0}`,
      `Generated games: ${generatedPlayable.games?.length ?? 0}`,
    ],
    blockers:
      acceptedConcepts.length !== lowRiskConcepts.length
        ? ['At least one accepted concept is not low IP-risk.']
        : [],
    nextAction: 'Keep licensed/cache/fixture trend inputs feeding original concept generation.',
  }),
  requirement({
    id: 'behavior-measurement-loop',
    status:
      analytics.sourceStatus?.activeSource &&
      eventCollectorSmoke.status === 'pass' &&
      eventIngestSmoke.status === 'pass' &&
      readiness.webPwa?.checks?.some((check) => check.id === 'privacy-control' && check.status === 'pass')
        ? liveAnalytics
          ? 'met-live'
          : 'met-fixture-or-local'
        : 'incomplete',
    summary: 'Gameplay, retention, install, acquisition, and privacy telemetry can be measured and rolled up.',
    evidence: [
      `Analytics source: ${analytics.sourceStatus?.activeSource ?? 'missing'}`,
      `Collector smoke: ${eventCollectorSmoke.status}`,
      `Ingest smoke: ${eventIngestSmoke.status}`,
      `Game starts in rollup: ${analytics.totals?.counts?.game_started ?? 0}`,
      `D1 retention: ${analytics.totals?.metrics?.d1Retention ?? 'missing'}`,
    ],
    blockers: liveAnalytics
      ? []
      : ['Production analytics still need PostHog or first-party collector credentials for live player data.'],
    nextAction: liveAnalytics
      ? 'Keep importing live events before each rollup.'
      : 'Connect the first-party collector or PostHog when production credentials exist.',
  }),
  requirement({
    id: 'data-driven-improvement-loop',
    status:
      productOptimization.status === 'product-optimization-ready' &&
      firstMoveCoach.status === 'first-move-coach-ready' &&
      completionLoop.status === 'completion-loop-ready' &&
      replayLoop.status === 'replay-loop-ready' &&
      retentionLoop.status === 'retention-loop-ready' &&
      organicSeedLoop.status === 'organic-seed-loop-ready' &&
      experimentResults.status === 'evaluated' &&
      Array.isArray(improvementBacklog) &&
      Array.isArray(appliedImprovements.actions) &&
      autonomousOperatorReady
        ? 'met'
        : 'incomplete',
    summary: 'Analytics drive product-gate optimization, experiment evaluation, backlog routing, and one safe local operator action.',
    evidence: [
      `Product optimizer: ${productOptimization.status}`,
      `First-move coach: ${firstMoveCoach.status}; enabled targets ${
        firstMoveCoach.summary?.enabledTargets ?? 0
      }`,
      `Completion loop: ${completionLoop.status}; prompt ${
        completionLoop.promptPolicy?.status ?? 'missing'
      }; finish line ${completionLoop.finishLinePolicy?.status ?? 'missing'}`,
      `Replay loop: ${replayLoop.status}; prompt ${replayLoop.promptPolicy?.status ?? 'missing'}`,
      `Retention loop: ${retentionLoop.status}; return intent ${
        retentionLoop.returnIntentPolicy?.status ?? 'missing'
      }`,
      `Organic seed loop: ${organicSeedLoop.status}; target ${
        organicSeedLoop.target?.gameId ?? 'missing'
      }`,
      `Experiment results: ${experimentResults.status}`,
      `Backlog items: ${improvementBacklog.length}`,
      `Applied/deferred actions: ${appliedImprovements.actions?.length ?? 0}`,
      `Operator selected: ${autonomousOperator.selectedAction?.id ?? 'none'}; status ${autonomousOperator.status}; execution ${autonomousOperator.execution?.status ?? 'missing'}`,
    ],
    blockers: [],
    nextAction: productOptimization.nextActions?.[0] ?? 'Keep applying only bounded changes from current evidence.',
  }),
  requirement({
    id: 'minimal-intervention-autonomy',
    status:
      autonomousOwnerLoop.status === 'owner-loop-ready' &&
      autonomousCadence.status === 'cadence-ready' &&
      autonomousSelfUpdate.status === 'self-update-ready' &&
      autonomousOperatorReady &&
      autonomousOperatorHistoryReady &&
      releaseCandidate.status === 'release-candidate-ready' &&
      postDeploySmokeReady &&
      repositoryChannelReady &&
      repositoryBootstrap.status !== 'missing' &&
      productionBootstrap.status === 'production-bootstrap-ready' &&
      packageJson.scripts?.['autonomous:daily']?.includes('autonomous:objective-audit') !== true
        ? 'needs-daily-audit-wiring'
      : autonomousOwnerLoop.status === 'owner-loop-ready' &&
          autonomousCadence.status === 'cadence-ready' &&
          autonomousSelfUpdate.status === 'self-update-ready' &&
          autonomousOperatorReady &&
          autonomousOperatorHistoryReady &&
          releaseCandidate.status === 'release-candidate-ready' &&
          postDeploySmokeReady &&
          !repositoryChannelReady &&
          repositoryBootstrap.status !== 'missing' &&
          productionBootstrap.status === 'production-bootstrap-ready'
        ? 'needs-repository-channel'
      : autonomousOwnerLoop.status === 'owner-loop-ready' &&
          autonomousCadence.status === 'cadence-ready' &&
          autonomousSelfUpdate.status === 'self-update-ready' &&
          autonomousOperatorReady &&
          autonomousOperatorHistoryReady &&
          releaseCandidate.status === 'release-candidate-ready' &&
          postDeploySmokeReady &&
          repositoryChannelReady &&
          repositoryBootstrap.status !== 'missing' &&
          productionBootstrap.status === 'production-bootstrap-ready'
        ? 'met-local'
        : 'incomplete',
    summary: 'A scheduled local loop, owner state, bootstrap handoff, and dry-run operator reduce manual maintenance.',
    evidence: [
      `Owner loop: ${autonomousOwnerLoop.status}`,
      `Autonomous cadence: ${autonomousCadence.status}; Codex ${
        autonomousCadence.schedulers?.codexDesktop?.status ?? 'missing'
      }; GitHub ${autonomousCadence.schedulers?.githubActions?.status ?? 'missing'}`,
      `Autonomous self-update: ${autonomousSelfUpdate.status}; workflow ${
        autonomousSelfUpdate.commitPlan?.workflow ?? 'missing'
      }; unsafe pending ${autonomousSelfUpdate.pendingChanges?.unsafeCount ?? 'missing'}`,
      `Operator: ${autonomousOperator.status}`,
      `Operator history: ${autonomousOperatorHistory.status}; records ${
        autonomousOperatorHistory.summary?.totalRecords ?? 0
      }; executed ${autonomousOperatorHistory.summary?.executedRecords ?? 0}`,
      `Bootstrap: ${productionBootstrap.status}`,
      `Repository bootstrap: ${repositoryBootstrap.status}; helper ${
        repositoryBootstrap.helper?.path ?? 'missing'
      }`,
      `Release candidate: ${releaseCandidate.status}; smoke URLs ${
        releaseCandidate.summary?.postDeploySmokeUrls ?? 0
      }`,
      `Post-deploy smoke: ${postDeploySmoke.status}; origin ${
        postDeploySmoke.target?.origin ?? 'missing'
      }; checks ${postDeploySmoke.summary?.passed ?? 0}/${postDeploySmoke.summary?.planned ?? 0}; local artifact ${
        postDeploySmoke.localArtifactSmoke?.status ?? 'missing'
      } ${postDeploySmoke.localArtifactSmoke?.summary?.passed ?? 0}/${
        postDeploySmoke.localArtifactSmoke?.summary?.planned ?? 0}`,
      `Repository channel: ${repositoryReadiness.status}; repository ${
        repositoryReadiness.repository?.target ?? 'missing'
      }; git worktree ${repositoryReadiness.workspace?.insideWorkTree === true}`,
      `Autonomy score: ${autonomousOwnerLoop.autonomyScore?.percent ?? 'missing'}%`,
      `Credential-gated actions: ${autonomousOwnerLoop.credentialRequiredActions?.length ?? 0}`,
    ],
    blockers: [
      ...(autonomousCadence.blockers ?? []),
      ...(autonomousSelfUpdate.blockers ?? []),
      ...(repositoryReadiness.blockers ?? []),
      ...(repositoryBootstrap.blockers ?? []),
      ...(autonomousOwnerLoop.credentialRequiredActions?.map((action) => `${action.target}: ${action.purpose}`) ?? []),
    ],
    nextAction: 'Keep the operator dry-run plan ready and execute one local action only when explicitly requested.',
  }),
  requirement({
    id: 'monetization-path',
    status: monetization.revenueEnabled ? 'met-enabled' : 'prepared-blocked-by-gates',
    summary: 'Revenue path exists with guarded rewarded/cosmetic tests, app-ads output, and unit-economics spend controls.',
    evidence: [
      `Monetization status: ${monetization.status}`,
      `Revenue enabled: ${monetization.revenueEnabled}`,
      `Runtime: ${monetization.runtime?.status ?? 'missing'}`,
      `Unit economics: ${unitEconomics.status}`,
      `Paid acquisition allowed: ${unitEconomics.controls?.paidAcquisitionAllowed}`,
    ],
    blockers: monetization.blockers ?? monetizationDecision?.blockers ?? [],
    nextAction: monetizationDecision?.nextAction ?? 'Keep revenue disabled until product, privacy, and ad-network gates pass.',
  }),
  requirement({
    id: 'app-store-distribution-path',
    status:
      storePackage.storeListing?.shortDescription &&
      storeCompliance.status === 'draft-ready-external-blockers' &&
      nativePackage.status !== 'missing' &&
      androidRelease.status
        ? 'prepared-external-blockers'
        : 'incomplete',
    summary: 'Store listing, compliance drafts, screenshots, and Android TWA handoff are prepared while store release stays gated.',
    evidence: [
      `Store package privacy URL: ${storePackage.privacyPolicy?.productionUrlStatus}`,
      `Store assets: ${storeAssets.status}`,
      `Store compliance: ${storeCompliance.status}`,
      `Android signing: ${androidSigning.status}; fingerprint ${
        androidSigning.signing?.sha256CertFingerprint ? 'available' : 'missing'
      }`,
      `Native package: ${nativePackage.status}`,
      `Android release: ${androidRelease.status}`,
    ],
    blockers: [
      ...(storeCompliance.blockers ?? []),
      ...(androidRelease.blockers ?? []),
      ...(iosDecision?.blockers ?? []),
    ],
    nextAction: androidDecision?.nextAction ?? 'Keep native releases blocked until host, signing, account, and payback gates pass.',
  }),
  requirement({
    id: 'minimal-cost-guardrails',
    status:
      unitEconomics.controls?.maxDailySpendUsd === 0 &&
      productionBootstrap.controls?.zeroSpendGuard === true &&
      autonomousOperator.controls?.zeroPaidSpend === true &&
      autonomousOwnerLoop.guardrails?.every((guardrail) => guardrail.enforced === true)
        ? 'met'
        : 'incomplete',
    summary: 'Zero-spend, no-store-submission, and no-revenue-before-gates controls are enforced.',
    evidence: [
      `Max daily spend: $${(unitEconomics.controls?.maxDailySpendUsd ?? 0).toFixed(2)}`,
      `Bootstrap zero spend: ${productionBootstrap.controls?.zeroSpendGuard}`,
      `Operator zero spend: ${autonomousOperator.controls?.zeroPaidSpend}`,
      `Owner guardrails: ${
        autonomousOwnerLoop.guardrails?.filter((guardrail) => guardrail.enforced).length ?? 0
      }/${autonomousOwnerLoop.guardrails?.length ?? 0}`,
    ],
    blockers: [],
    nextAction: 'Preserve zero-spend posture until observed revenue and payback gates open.',
  }),
]

const completedRequirements = requirements.filter((item) =>
  ['met', 'met-live', 'met-fixture-or-local', 'met-local', 'met-enabled'].includes(item.status),
)
const preparedRequirements = requirements.filter((item) => item.status.startsWith('prepared'))
const incompleteRequirements = requirements.filter(
  (item) => !completedRequirements.includes(item) && !preparedRequirements.includes(item),
)
const externalBlockers = objectiveBlockers.filter((blocker) =>
  /origin|support|credential|PostHog|collector|AdSense|AdMob|fingerprint|Google Play|Apple|privacy|signing|account|domain|URL|repository|GitHub|Pages|git/i.test(
    blocker,
  ),
)
const productBlockers = objectiveBlockers.filter((blocker) =>
  /completion|Replay|D1 retention|retention|revenue|payback/i.test(blocker),
)
const canMarkGoalComplete =
  incompleteRequirements.length === 0 &&
  preparedRequirements.length === 0 &&
  externalBlockers.length === 0 &&
  productBlockers.length === 0 &&
  monetization.revenueEnabled === true

const payload = {
  generatedAt: new Date().toISOString(),
  status: canMarkGoalComplete ? 'objective-complete' : 'objective-in-progress',
  objective:
    'Build a bootstrapped autonomous web/PWA game portal that can generate original board-game-inspired games, measure user behavior, propose and apply data-driven improvements, and prepare a path to monetization and app-store distribution with minimal manual intervention.',
  summary: {
    requirements: requirements.length,
    met: completedRequirements.length,
    prepared: preparedRequirements.length,
    incomplete: incompleteRequirements.length,
    externalBlockers: externalBlockers.length,
    productBlockers: productBlockers.length,
  },
  requirements,
  blockers: {
    external: externalBlockers,
    product: productBlockers,
    all: objectiveBlockers,
  },
  controls: {
    preserveOriginalScope: true,
    doNotMarkGoalCompleteWhileBlocked: true,
    zeroSpendGuard: unitEconomics.controls?.maxDailySpendUsd === 0,
    noRevenueEnablementUntilGatesPass: monetization.revenueEnabled !== true,
    noStoreSubmissionUntilExternalAccounts: true,
  },
  completion: {
    canMarkGoalComplete,
    reason: canMarkGoalComplete
      ? 'All objective requirements are proven with no remaining blockers.'
      : 'The local autonomous PWA system is largely prepared, but production credentials, live data, monetization gates, hosted compliance URLs, and store account/signing blockers remain.',
    nextBestAction: autonomousOwnerLoop.ownerDecision?.nextBestActionId ?? 'run-autonomous-daily',
  },
}

const report = [
  '# Objective Audit',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Can mark goal complete: ${payload.completion.canMarkGoalComplete}`,
  `Reason: ${payload.completion.reason}`,
  '',
  '## Summary',
  '',
  `- Requirements: ${payload.summary.requirements}`,
  `- Met: ${payload.summary.met}`,
  `- Prepared: ${payload.summary.prepared}`,
  `- Incomplete: ${payload.summary.incomplete}`,
  `- External blockers: ${payload.summary.externalBlockers}`,
  `- Product blockers: ${payload.summary.productBlockers}`,
  '',
  '## Requirements',
  '',
  ...requirements.flatMap((item) => [
    `- ${item.status}: ${item.id} - ${item.summary}`,
    `  - next: ${item.nextAction}`,
  ]),
  '',
  '## Top Blockers',
  '',
  ...(objectiveBlockers.length ? objectiveBlockers.slice(0, 16).map((blocker) => `- ${blocker}`) : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const objectiveAudit = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ObjectiveAudit = typeof objectiveAudit\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
