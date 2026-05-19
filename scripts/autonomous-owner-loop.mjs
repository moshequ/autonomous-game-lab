import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const reportPath = path.join(root, 'reports', 'autonomous-owner-loop-latest.md')
const outputJsonPath = path.join(dataDir, 'autonomous-owner-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'autonomousOwnerLoop.ts')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const percent = (value) => (typeof value === 'number' ? Math.round(value * 100) : null)

const systemStatus = (condition, fallback = 'needs-attention') => (condition ? 'ready' : fallback)

const configuredCount = (items = []) => items.filter((item) => item.configured).length

const productionEnvironment = await readJson(path.join(dataDir, 'production-environment.json'))
const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const generatedPlayable = await readJson(path.join(dataDir, 'generated-playable-games.json'))
const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const eventIngest = await readJson(path.join(dataDir, 'event-ingest.json'))
const eventCollectorSmoke = await readJson(path.join(dataDir, 'event-collector-smoke.json'))
const eventCollectorDeployment = await readJson(path.join(dataDir, 'event-collector-deployment.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const portfolioPolicy = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const traffic = await readJson(path.join(dataDir, 'traffic-seeding.json'))
const acquisition = await readJson(path.join(dataDir, 'acquisition-learning.json'))
const organicSeedLoop = await readOptionalJson(path.join(dataDir, 'organic-seed-loop.json'), {
  status: 'missing',
  target: null,
  runtimeSurface: {},
  guardrails: {},
  missions: [],
})
const retention = await readJson(path.join(dataDir, 'retention-loop.json'))
const pwaInstall = await readJson(path.join(dataDir, 'pwa-install-loop.json'))
const performanceBudget = await readOptionalJson(path.join(dataDir, 'performance-budget.json'), {
  status: 'missing',
  budgets: {},
  initial: {},
  deferred: {},
  controls: {},
})
const releaseCandidate = await readOptionalJson(path.join(dataDir, 'release-candidate.json'), {
  status: 'missing',
  candidateId: null,
  summary: {},
  controls: {},
  integrity: {},
  postDeploySmoke: [],
})
const postDeploySmoke = await readOptionalJson(path.join(dataDir, 'post-deploy-smoke.json'), {
  status: 'missing',
  target: {},
  sourceStatus: {},
  summary: {},
  controls: {},
  checks: [],
})
const productOptimization = await readOptionalJson(path.join(dataDir, 'product-optimization.json'), {
  status: 'missing',
  productGates: {},
  actions: [],
  controls: {},
})
const firstMoveCoach = await readOptionalJson(path.join(dataDir, 'first-move-coach.json'), {
  status: 'missing',
  summary: {},
  controls: {},
  telemetry: {},
  targets: [],
})
const completionLoop = await readOptionalJson(path.join(dataDir, 'completion-loop.json'), {
  status: 'missing',
  target: {},
  metrics: {},
  controls: {},
  promptPolicy: {},
  missions: [],
})
const replayLoop = await readOptionalJson(path.join(dataDir, 'replay-loop.json'), {
  status: 'missing',
  target: {},
  metrics: {},
  controls: {},
  promptPolicy: {},
  missions: [],
})
const productionBootstrap = await readOptionalJson(path.join(dataDir, 'production-bootstrap.json'), {
  status: 'missing',
  mode: 'missing',
  summary: {},
  controls: {},
  stages: [],
  requiredSecrets: [],
  externalBlockers: [],
})
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  status: 'missing',
  workspace: {},
  repository: {},
  githubAutomation: {},
  controls: {},
  blockers: [],
})
const repositoryBootstrap = await readOptionalJson(path.join(dataDir, 'repository-bootstrap.json'), {
  status: 'missing',
  mode: 'missing',
  workspace: { after: {} },
  repository: {},
  helper: {},
  controls: {},
  blockers: [],
})
const autonomousOperator = await readOptionalJson(path.join(dataDir, 'autonomous-operator.json'), {
  status: 'missing',
  mode: 'missing',
  selectedAction: null,
  controls: {},
  execution: {},
})
const autonomousOperatorHistory = await readOptionalJson(path.join(dataDir, 'autonomous-operator-history.json'), {
  status: 'missing',
  summary: {},
  controls: {},
  records: [],
})
const objectiveAudit = await readOptionalJson(path.join(dataDir, 'objective-audit.json'), {
  status: 'missing',
  summary: {},
  completion: {},
  requirements: [],
})
const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
const experimentResults = await readJson(path.join(dataDir, 'experiment-results.json'))
const improvementBacklog = await readJson(path.join(dataDir, 'improvement-backlog.json'))
const appliedImprovements = await readJson(path.join(dataDir, 'applied-improvements.json'))
const storePackage = await readJson(path.join(dataDir, 'store-package.json'))
const storeAssets = await readJson(path.join(dataDir, 'store-assets.json'))
const storeListingOptimizer = await readJson(path.join(dataDir, 'store-listing-optimizer.json'))
const storeCompliance = await readJson(path.join(dataDir, 'store-compliance.json'))
const nativePackage = await readJson(path.join(dataDir, 'native-package.json'))
const promotion = await readJson(path.join(dataDir, 'promotion-decision.json'))
const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const androidRelease = await readJson(path.join(dataDir, 'android-release.json'))
const productionResponse = await readJson(path.join(dataDir, 'production-response.json'))
const incidentDrill = await readJson(path.join(dataDir, 'incident-drill.json'))
const deployment = await readJson(path.join(dataDir, 'deployment-plan.json'))
const readiness = await readOptionalJson(path.join(dataDir, 'production-readiness.json'), { webPwa: { status: 'missing' } })

const playableCount = playable.games?.length ?? 0
const generatedCount = generatedPlayable.games?.length ?? 0
const analyticsSource = analytics.sourceStatus?.activeSource ?? 'unknown'
const liveAnalytics = ['posthog', 'local-event-drops'].includes(analyticsSource)
const webDecision = promotion.decisions?.find((decision) => decision.channel === 'web-pwa')
const monetizationDecision = promotion.decisions?.find((decision) => decision.channel === 'monetization')
const androidDecision = promotion.decisions?.find((decision) => decision.channel === 'android-google-play')
const appliedImprovementActions = appliedImprovements.actions ?? []
const appliedImprovementStatus = appliedImprovementActions.length ? 'actions-ready' : 'no-actions'
const repositoryChannelReady = ['repository-channel-ready', 'waiting-for-gh-auth'].includes(
  repositoryReadiness.status,
)
const repositoryBootstrapPrepared =
  repositoryBootstrap.status !== 'missing' &&
  repositoryBootstrap.controls?.dryRunByDefault === true &&
  repositoryBootstrap.helper?.path === 'ops/github/bootstrap-repository.sh'
const ownerMode = releaseHealth.controls?.rollbackRequired
  ? 'incident-response'
  : deployment.status === 'ready-for-pages' && !repositoryChannelReady
    ? 'repository-channel-needed'
    : deployment.status === 'ready-for-pages'
    ? 'zero-spend-web-ready'
    : 'guarded-local-automation'
const postDeploySmokeRunnerReady =
  ['blocked-missing-origin', 'post-deploy-smoke-passed'].includes(postDeploySmoke.status) &&
  postDeploySmoke.sourceStatus?.deployment === deployment.status &&
  postDeploySmoke.sourceStatus?.releaseCandidate === releaseCandidate.status &&
  postDeploySmoke.target?.candidateId === releaseCandidate.candidateId &&
  postDeploySmoke.target?.aggregateHash === releaseCandidate.integrity?.aggregateHash &&
  postDeploySmoke.controls?.zeroPaidSpend === true &&
  postDeploySmoke.controls?.readOnlyHttpChecks === true &&
  postDeploySmoke.controls?.manifestHashComparisonRequired === true &&
  (postDeploySmoke.checks?.length ?? 0) >= (releaseCandidate.postDeploySmoke?.length ?? 0) + 1

const systems = [
  {
    id: 'game-factory',
    status: systemStatus(
      generatedPlayable.status === 'generated-runtime-ready' && playableCount >= 10 && generatedCount >= 5,
    ),
    autonomy: 'automatic',
    evidence: `${playableCount} playable games; ${generatedCount} generated runtime games.`,
    nextAction: 'Keep generating concept-first playable configs during the daily loop.',
  },
  {
    id: 'analytics-ingest',
    status: systemStatus(
      analytics.sourceStatus?.activeSource && eventCollectorSmoke.status === 'pass',
      'bootstrap-fixture',
    ),
    autonomy: liveAnalytics ? 'automatic-live' : 'automatic-local-fixture',
    evidence: `Active source: ${analyticsSource}; event ingest: ${eventIngest.status}; collector smoke: ${eventCollectorSmoke.status}.`,
    nextAction: liveAnalytics
      ? 'Continue importing live player events before rollups.'
      : 'Keep local/fixture rollups active until production collector credentials exist.',
  },
  {
    id: 'portfolio-loop',
    status: systemStatus(
      portfolioPolicy.status === 'portfolio-policy-ready' &&
        portfolioPolicy.games?.length === playableCount &&
        portfolioPolicy.rotation?.seedTrafficGameIds?.length,
    ),
    autonomy: 'automatic',
    evidence: `Daily challenge: ${portfolioPolicy.dailyChallenge?.title}; seed traffic: ${
      portfolioPolicy.rotation?.seedTrafficGameIds?.join(', ') || 'none'
    }.`,
    nextAction: portfolioPolicy.nextActions?.[0] ?? 'Keep ranking the portfolio from behavior and growth signals.',
  },
  {
    id: 'traffic-seeding',
    status: systemStatus(traffic.status === 'traffic-seeding-ready' && traffic.campaigns?.length),
    autonomy: 'zero-spend-automatic',
    evidence: `${traffic.campaigns?.length ?? 0} seed campaign(s); max cost $${
      traffic.guardrails?.maxCostUsd ?? 0
    }.`,
    nextAction: traffic.nextActions?.[0] ?? 'Keep seeding under-measured games through organic/internal channels.',
  },
  {
    id: 'acquisition-learning',
    status: systemStatus(
      acquisition.status === 'acquisition-learning-ready' &&
        acquisition.campaigns?.length === traffic.campaigns?.length,
    ),
    autonomy: acquisition.sourceStatus?.rawAttributionAvailable
      ? 'automatic-attributed'
      : 'automatic-collecting',
    evidence: `${acquisition.summary?.campaigns ?? 0} campaign(s); ${
      acquisition.summary?.totalAttributedStarts ?? 0
    } attributed start(s); candidate ${acquisition.summary?.featuredGameId ?? 'none'}.`,
    nextAction:
      acquisition.nextActions?.[0] ?? 'Connect campaign-attributed starts to the next growth placement decision.',
  },
  {
    id: 'organic-seed-loop',
    status: systemStatus(
      organicSeedLoop.status === 'organic-seed-loop-ready' &&
        organicSeedLoop.runtimeSurface?.status === 'armed' &&
        organicSeedLoop.guardrails?.maxCostUsd === 0 &&
        organicSeedLoop.guardrails?.playerInitiatedSharingOnly === true &&
        organicSeedLoop.guardrails?.noAutomatedExternalPosting === true,
    ),
    autonomy: 'zero-spend-player-initiated',
    evidence: `Target ${organicSeedLoop.target?.gameId ?? 'missing'}; surface ${
      organicSeedLoop.runtimeSurface?.surface ?? 'missing'
    }; share telemetry ${organicSeedLoop.runtimeSurface?.telemetry?.shared ?? 'missing'}.`,
    nextAction: organicSeedLoop.nextActions?.[0] ?? 'Keep the current seed campaign visible in the growth loop.',
  },
  {
    id: 'retention-loop',
    status: systemStatus(
      retention.status === 'retention-loop-ready' &&
        retention.dailyChallenge?.gameId === portfolioPolicy.dailyChallenge?.gameId &&
        retention.guardrails?.noPushNotifications === true &&
        retention.guardrails?.noAccountsRequired === true &&
        retention.guardrails?.noPaidRetentionMechanics === true &&
        retention.promptPolicy?.telemetry?.clicked === 'daily_return_prompt_clicked' &&
        retention.returnIntentPolicy?.telemetry?.started === 'daily_return_intent_started',
    ),
    autonomy: 'automatic-local-streak',
    evidence: `Daily ${retention.dailyChallenge?.gameId ?? 'missing'}; D1 ${percent(
      retention.metrics?.d1Retention,
    )}%; streak variant ${retention.rewardPolicy?.recommendedVariant ?? 'missing'}; return prompt ${
      retention.promptPolicy?.status ?? 'missing'
    }; return intent ${retention.returnIntentPolicy?.status ?? 'missing'}.`,
    nextAction: retention.nextActions?.[0] ?? 'Keep daily return missions active.',
  },
  {
    id: 'pwa-install-loop',
    status: systemStatus(
      pwaInstall.status === 'pwa-install-loop-ready' &&
        pwaInstall.channel?.costUsd === 0 &&
        pwaInstall.guardrails?.noForcedPrompt === true &&
        pwaInstall.guardrails?.noBlockingGameplay === true &&
        pwaInstall.guardrails?.respectBrowserPromptAvailability === true,
    ),
    autonomy: 'automatic-browser-controlled',
    evidence: `Prompt ${pwaInstall.promptPolicy?.surface ?? 'missing'}; installs ${
      pwaInstall.metrics?.installed ?? 0
    }; launch events ${pwaInstall.metrics?.launchModes ?? 0}.`,
    nextAction: pwaInstall.nextActions?.[0] ?? 'Keep measuring PWA installs and standalone launches.',
  },
  {
    id: 'performance-budget',
    status: systemStatus(
      performanceBudget.status === 'performance-budget-ready' &&
        performanceBudget.controls?.phaserDeferredFromInitialShell === true &&
        performanceBudget.initial?.jsBytes <= performanceBudget.budgets?.initialJsMaxBytes &&
        performanceBudget.initial?.gzipBytes <= performanceBudget.budgets?.initialGzipMaxBytes,
    ),
    autonomy: 'automatic-build-budget',
    evidence: `Initial JS ${performanceBudget.initial?.jsKb ?? 'n/a'} KB; gzip ${
      performanceBudget.initial?.gzipKb ?? 'n/a'
    } KB; deferred chunks ${performanceBudget.deferred?.chunks?.length ?? 0}.`,
    nextAction: performanceBudget.nextActions?.[0] ?? 'Keep Phaser deferred from the initial PWA shell.',
  },
  {
    id: 'product-optimization',
    status: systemStatus(
      productOptimization.status === 'product-optimization-ready' &&
        productOptimization.controls?.requirePlayableGame === true &&
        productOptimization.controls?.noRepeatForSameSourceData === true &&
        productOptimization.actions?.some((action) => action.actionType === 'target-score-curve') &&
        productOptimization.actions?.some((action) => action.actionType === 'runtime-replay-telemetry') &&
        productOptimization.actions?.some((action) => action.actionType === 'runtime-replay-prompt') &&
        productOptimization.actions?.some((action) => action.actionType === 'runtime-completion-nudge'),
    ),
    autonomy: 'bounded-product-tuning',
    evidence: `Completion ${percent(productOptimization.productGates?.firstGameCompletion?.actual)}% / gate ${percent(
      productOptimization.productGates?.firstGameCompletion?.gate,
    )}%; latest ${productOptimization.actions?.[0]?.status ?? 'missing'}.`,
    nextAction: productOptimization.nextActions?.[0] ?? 'Tune product gates from measured completion and replay data.',
  },
  {
    id: 'first-move-coach',
    status: systemStatus(
      firstMoveCoach.status === 'first-move-coach-ready' &&
        firstMoveCoach.controls?.firstTurnOnly === true &&
        firstMoveCoach.controls?.noAutoMove === true &&
        firstMoveCoach.summary?.enabledTargets >= 1,
      'needs-coach-policy',
    ),
    autonomy: 'bounded-first-session-assist',
    evidence: `Coach ${firstMoveCoach.status}; enabled targets ${
      firstMoveCoach.summary?.enabledTargets ?? 0
    }; primary ${firstMoveCoach.summary?.primaryTargetId ?? 'none'}.`,
    nextAction: 'Measure first-move coach shown/used/skipped events against completion before monetization gates open.',
  },
  {
    id: 'completion-loop',
    status: systemStatus(
      completionLoop.status === 'completion-loop-ready' &&
        completionLoop.controls?.zeroPaidSpend === true &&
        completionLoop.controls?.midRunOnly === true &&
        completionLoop.controls?.noAutoMove === true &&
        completionLoop.promptPolicy?.telemetry?.clicked === 'completion_nudge_clicked',
      'needs-completion-policy',
    ),
    autonomy: 'bounded-mid-run-nudge',
    evidence: `Completion loop ${completionLoop.status}; prompt ${
      completionLoop.promptPolicy?.status ?? 'missing'
    }; target ${completionLoop.target?.gameId ?? 'missing'}; completion ${percent(
      completionLoop.metrics?.firstGameCompletion,
    )}%.`,
    nextAction:
      completionLoop.nextActions?.[0] ??
      'Measure completion_nudge_viewed/clicked/dismissed against completion and abandonment.',
  },
  {
    id: 'replay-loop',
    status: systemStatus(
      replayLoop.status === 'replay-loop-ready' &&
        replayLoop.controls?.zeroPaidSpend === true &&
        replayLoop.controls?.afterCompletedRunOnly === true &&
        replayLoop.controls?.noForcedReplay === true &&
        replayLoop.promptPolicy?.telemetry?.clicked === 'replay_prompt_clicked',
      'needs-replay-policy',
    ),
    autonomy: 'bounded-completed-run-nudge',
    evidence: `Replay loop ${replayLoop.status}; prompt ${
      replayLoop.promptPolicy?.status ?? 'missing'
    }; target ${replayLoop.target?.gameId ?? 'missing'}; replay ${percent(
      replayLoop.metrics?.replayRate,
    )}%.`,
    nextAction:
      replayLoop.nextActions?.[0] ??
      'Measure replay_prompt_viewed/clicked/dismissed against replay_clicked before changing copy.',
  },
  {
    id: 'improvement-loop',
    status: systemStatus(
      Array.isArray(improvementBacklog) &&
        improvementBacklog.length > 0 &&
        Array.isArray(appliedImprovementActions),
      'needs-more-evidence',
    ),
    autonomy: releaseHealth.controls?.canApplyExperimentChanges ? 'bounded-automatic' : 'held-by-health',
    evidence: `${improvementBacklog.length} backlog item(s); ${
      experimentResults.recommendations?.length ?? 0
    } experiment recommendation(s); applied status ${appliedImprovementStatus}.`,
    nextAction: releaseHealth.controls?.canApplyExperimentChanges
      ? 'Apply only bounded experiment and backlog changes.'
      : 'Freeze experiment changes until release health clears.',
  },
  {
    id: 'organic-growth',
    status: systemStatus(growth.status?.startsWith('growth-') && growth.gamePages?.length === playableCount),
    autonomy: 'automatic',
    evidence: `${growth.gamePages?.length ?? 0} SEO/share pages; optimization ${
      growth.optimization?.optimizedGames ?? 0
    } page(s).`,
    nextAction: 'Use generated game pages and share links as the zero-cost acquisition channel.',
  },
  {
    id: 'repository-channel',
    status: systemStatus(repositoryChannelReady, repositoryReadiness.status ?? 'missing'),
    autonomy: repositoryReadiness.githubAutomation?.workflowDispatchReady
      ? 'workflow-dispatch-ready'
      : 'read-only-repository-preflight',
    evidence: `Repository ${repositoryReadiness.repository?.target ?? 'missing'}; git worktree ${
      repositoryReadiness.workspace?.insideWorkTree === true ? 'ready' : 'missing'
    }; workflow dispatch ${
      repositoryReadiness.githubAutomation?.workflowDispatchReady === true ? 'ready' : 'blocked'
    }.`,
    nextAction:
      repositoryReadiness.nextActions?.[0] ??
      'Prepare the GitHub repository channel before treating web deploy as runnable.',
  },
  {
    id: 'repository-bootstrap',
    status: systemStatus(repositoryBootstrapPrepared, repositoryBootstrap.status ?? 'missing'),
    autonomy: 'guarded-git-transport-bootstrap',
    evidence: `Bootstrap ${repositoryBootstrap.status}; mode ${
      repositoryBootstrap.mode ?? 'missing'
    }; helper ${repositoryBootstrap.helper?.path ?? 'missing'}; local git ${
      repositoryBootstrap.workspace?.after?.insideWorkTree === true ? 'ready' : 'missing'
    }.`,
    nextAction:
      repositoryBootstrap.nextActions?.[0] ??
      'Keep the local git/GitHub transport helper generated and explicitly gated.',
  },
  {
    id: 'web-deployment',
    status: systemStatus(
      deployment.status === 'ready-for-pages' && readiness.webPwa?.status === 'ready-after-build',
      'blocked',
    ),
    autonomy: 'workflow-gated',
    evidence: `Deployment ${deployment.status}; web readiness ${readiness.webPwa?.status ?? 'missing'}; promotion ${
      webDecision?.status ?? 'missing'
    }.`,
    nextAction: webDecision?.nextAction ?? 'Publish the static PWA only through the gated deploy workflow.',
  },
  {
    id: 'release-candidate',
    status: systemStatus(
      releaseCandidate.status === 'release-candidate-ready' &&
        releaseCandidate.summary?.requiredFilesPresent === true &&
        releaseCandidate.controls?.contentHashesRecorded === true &&
        (releaseCandidate.postDeploySmoke?.length ?? 0) >= 6,
      'needs-release-manifest',
    ),
    autonomy: 'content-hashed-deploy-evidence',
    evidence: `Candidate ${releaseCandidate.candidateId ?? 'missing'}; status ${
      releaseCandidate.status
    }; files ${releaseCandidate.summary?.totalFiles ?? 0}; smoke URLs ${
      releaseCandidate.summary?.postDeploySmokeUrls ?? 0
    }.`,
    nextAction: 'Regenerate the release candidate after every production build before deploy or rollback decisions.',
  },
  {
    id: 'post-deploy-smoke',
    status: systemStatus(postDeploySmokeRunnerReady, 'waiting-for-origin'),
    autonomy: 'read-only-live-deploy-verification',
    evidence: `Smoke ${postDeploySmoke.status}; origin ${
      postDeploySmoke.target?.origin ?? 'missing'
    }; candidate ${postDeploySmoke.target?.candidateId ?? 'missing'}; checks ${
      postDeploySmoke.summary?.passed ?? 0
    }/${postDeploySmoke.summary?.planned ?? 0} passed.`,
    nextAction:
      postDeploySmoke.nextActions?.[0] ??
      'Run the smoke runner with the deployed Pages URL after the workflow publishes the PWA.',
  },
  {
    id: 'production-bootstrap',
    status: systemStatus(
      productionBootstrap.status === 'production-bootstrap-ready' &&
        productionBootstrap.controls?.zeroSpendGuard === true &&
        productionBootstrap.controls?.noPaidResourcesCreated === true &&
        productionBootstrap.setupScript?.path === 'ops/github/setup-production.sh',
      'waiting-for-credentials',
    ),
    autonomy: 'zero-spend-setup-orchestration',
    evidence: `Bootstrap ${productionBootstrap.status}; mode ${
      productionBootstrap.mode ?? 'missing'
    }; external blockers ${productionBootstrap.summary?.externalBlockers ?? productionBootstrap.externalBlockers?.length ?? 0}.`,
    nextAction:
      productionBootstrap.ownerAction?.command ?? 'Regenerate the bootstrap setup and keep external blockers explicit.',
  },
  {
    id: 'autonomous-operator',
    status: systemStatus(
      ['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status) &&
        autonomousOperator.controls?.zeroPaidSpend === true &&
        autonomousOperator.controls?.localCommandAllowlistEnforced === true &&
        autonomousOperator.controls?.maxActionsPerRun === 1,
      'needs-operator-plan',
    ),
    autonomy: 'one-safe-action-runner',
    evidence: `Operator ${autonomousOperator.status}; selected ${
      autonomousOperator.selectedAction?.id ?? 'none'
    }; execution ${autonomousOperator.execution?.status ?? 'missing'}.`,
    nextAction: 'Keep a dry-run operator plan ready, then execute only one allowlisted local action when explicitly requested.',
  },
  {
    id: 'operator-history',
    status: systemStatus(
      autonomousOperatorHistory.status === 'operator-history-ready' &&
        autonomousOperatorHistory.controls?.historyIsCapped === true &&
        autonomousOperatorHistory.controls?.localCommandAllowlistEnforced === true &&
        (autonomousOperatorHistory.summary?.totalRecords ?? 0) >= 1,
      'needs-history',
    ),
    autonomy: 'operator-audit-trail',
    evidence: `History ${autonomousOperatorHistory.status}; records ${
      autonomousOperatorHistory.summary?.totalRecords ?? 0
    }; executed ${autonomousOperatorHistory.summary?.executedRecords ?? 0}.`,
    nextAction: 'Keep a capped durable record of operator plans and one-action executions.',
  },
  {
    id: 'objective-audit',
    status: systemStatus(
      objectiveAudit.status === 'objective-in-progress' &&
        objectiveAudit.controls?.preserveOriginalScope === true &&
        objectiveAudit.completion?.canMarkGoalComplete === false &&
        (objectiveAudit.requirements?.length ?? 0) >= 8,
      'needs-audit',
    ),
    autonomy: 'completion-evidence-ledger',
    evidence: `Audit ${objectiveAudit.status}; met ${objectiveAudit.summary?.met ?? 'n/a'}/${
      objectiveAudit.summary?.requirements ?? 'n/a'
    }; external blockers ${objectiveAudit.summary?.externalBlockers ?? 'n/a'}.`,
    nextAction: objectiveAudit.completion?.reason ?? 'Regenerate the objective audit after each owner/operator cycle.',
  },
  {
    id: 'store-listing-optimizer',
    status: systemStatus(
      storeListingOptimizer.status === 'store-listing-optimizer-ready' &&
        storeListingOptimizer.recommendation?.focusGameId === storePackage.launchCandidate?.id &&
        storeListingOptimizer.copyGuardrails?.noProtectedBoardGameNames === true &&
        storeListingOptimizer.copyGuardrails?.noMonetizationClaimsBeforeEnabled === true,
    ),
    autonomy: 'automatic-aso-draft',
    evidence: `Focus ${storeListingOptimizer.recommendation?.focusGameId ?? 'missing'}; lead screenshot ${
      storeListingOptimizer.screenshotPriorities?.[0]?.id ?? 'missing'
    }; candidate changed ${storeListingOptimizer.recommendation?.changedLaunchCandidate ? 'yes' : 'no'}.`,
    nextAction:
      storeListingOptimizer.nextActions?.[0] ?? 'Keep store listing copy aligned with growth and retention evidence.',
  },
  {
    id: 'store-compliance',
    status: systemStatus(storeCompliance.status === 'draft-ready-external-blockers', 'blocked'),
    autonomy: 'automatic-draft-held-by-external-review',
    evidence: `Rating ${storeCompliance.contentRating?.googlePlay?.expectedRating ?? 'missing'}; target audience ${
      storeCompliance.targetAudience?.directedToChildren === false ? 'general' : 'review'
    }; blockers ${storeCompliance.blockers?.length ?? 0}.`,
    nextAction:
      storeCompliance.nextActions?.[0] ?? 'Keep store compliance drafts current with package and monetization changes.',
  },
  {
    id: 'production-safety',
    status: systemStatus(
      productionResponse.status &&
        incidentDrill.status === 'pass' &&
        unitEconomics.controls?.spendGuardActive === true,
    ),
    autonomy: 'automatic-guarded',
    evidence: `Response ${productionResponse.status}; incident drill ${incidentDrill.status}; spend mode ${unitEconomics.status}.`,
    nextAction: 'Keep rollback, experiment freeze, revenue hold, and spend hold controls active.',
  },
  {
    id: 'monetization-path',
    status: monetization.revenueEnabled ? 'ready' : 'held-by-product-gates',
    autonomy: 'guarded-disabled',
    evidence: `Revenue ${monetization.revenueEnabled ? 'enabled' : 'disabled'}; promotion ${
      monetizationDecision?.status ?? 'missing'
    }; completion ${percent(monetization.metrics?.firstGameCompletion)}%.`,
    nextAction: 'Collect live completion, replay, and retention evidence before enabling revenue.',
  },
  {
    id: 'app-store-path',
    status: androidRelease.status,
    autonomy: 'draft-ready-held-by-economics',
    evidence: `Native package ${nativePackage.status}; Android promotion ${androidDecision?.status ?? 'missing'}; screenshots ${
      storeAssets.screenshots?.length ?? 0
    }.`,
    nextAction: 'Keep Android/iOS distribution prepared but blocked until host, signing, account, and payback gates clear.',
  },
]

const readySystems = systems.filter((system) =>
  ['ready', 'bootstrap-fixture', 'held-by-product-gates', 'zero-spend-web-ready'].includes(system.status),
)

const credentialRequiredActions = [
  ...(productionEnvironment.requiredEnv ?? [])
    .filter((item) => !item.configured)
    .map((item) => ({
      id: `env-${item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      status: 'credential-required',
      target: item.name,
      purpose: item.purpose,
      source: 'production-environment',
    })),
  ...(productionBootstrap.requiredSecrets ?? [])
    .filter((item) => !item.configured)
    .map((item) => ({
      id: `secret-${item.repositorySecret.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      status: 'credential-required',
      target: item.repositorySecret,
      purpose: `Repository secret sourced from ${item.envName}.`,
      source: 'production-bootstrap',
    })),
]

const blockedExternalActions = [
  {
    id: 'live-analytics-collector',
    status: eventCollectorDeployment.status,
    target: 'cloudflare-worker-r2',
    reason: eventCollectorDeployment.setupRequiredOnce?.[0] ?? 'Collector production environment is not configured.',
    unblockWhen: 'Cloudflare account, R2 bucket, collector URLs, write token, and admin export token exist.',
  },
  {
    id: 'android-internal-testing',
    status: androidRelease.status,
    target: 'google-play',
    reason: androidRelease.blockers?.[0] ?? 'Android release gate is blocked.',
    unblockWhen: 'Hosted PWA, signing material, Play credentials, and store-spend payback gates clear.',
  },
  {
    id: 'revenue-enable',
    status: monetization.status,
    target: 'ads-and-optional-perks',
    reason: monetization.blockers?.[0] ?? 'Revenue gates are not open.',
    unblockWhen: 'Live retention, replay, completion, ad-network, and compliance gates pass.',
  },
]

const safeAutonomousActions = [
  {
    id: 'run-daily-owner-loop',
    status: 'armed',
    costUsd: 0,
    command: 'npm run autonomous:daily',
    reason: 'Regenerates trend, game, analytics, growth, safety, monetization, deployment, and owner-loop state.',
  },
  {
    id: 'seed-portfolio-traffic',
    status: traffic.status === 'traffic-seeding-ready' && traffic.campaigns?.length ? 'armed' : 'monitor',
    costUsd: 0,
    command:
      'npm run autonomous:growth && npm run autonomous:portfolio && npm run autonomous:traffic && npm run autonomous:acquisition && npm run autonomous:organic-seed-loop',
    targets: traffic.campaigns?.map((campaign) => campaign.gameId) ?? portfolioPolicy.rotation?.seedTrafficGameIds ?? [],
    reason: 'Under-measured playable games need free organic/internal traffic before quality judgment.',
  },
  {
    id: 'refresh-organic-seed-loop',
    status: organicSeedLoop.status === 'organic-seed-loop-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:organic-seed-loop',
    targets: [organicSeedLoop.target?.gameId ?? 'organic-seed-loop'],
    reason: 'Refreshes the player-initiated zero-cost share surface for the highest-opportunity seed campaign.',
  },
  {
    id: 'optimize-daily-retention',
    status: retention.status === 'retention-loop-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:retention',
    targets: retention.dailyChallenge?.gameId ? [retention.dailyChallenge.gameId] : [],
    reason: 'Keeps daily challenge, local streak prompts, and retention-safe missions aligned with behavior data.',
  },
  {
    id: 'measure-pwa-install-loop',
    status: pwaInstall.status === 'pwa-install-loop-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:pwa-install',
    targets: [pwaInstall.channel?.id ?? 'pwa-install'],
    reason: 'Measures optional PWA install prompts and standalone launches as the zero-cost distribution path.',
  },
  {
    id: 'check-performance-budget',
    status: performanceBudget.status === 'performance-budget-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run build && npm run autonomous:performance',
    targets: ['pwa-shell', performanceBudget.deferred?.gameChunk?.file ?? 'game-runtime'],
    reason: 'Keeps the PWA shell fast while Phaser and game scenes stay deferred.',
  },
  {
    id: 'prepare-release-candidate',
    status: releaseCandidate.status === 'release-candidate-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:release-candidate',
    targets: [releaseCandidate.candidateId ?? 'dist-release-candidate'],
    reason: 'Records a content-hashed dist inventory and post-deploy smoke plan for the exact PWA build.',
  },
  {
    id: 'run-post-deploy-smoke',
    status: postDeploySmoke.target?.origin ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:post-deploy-smoke',
    targets: [postDeploySmoke.target?.origin ?? 'deployed-pages-url', releaseCandidate.candidateId ?? 'release-candidate'],
    reason: postDeploySmoke.target?.origin
      ? 'Verifies the live Pages URL with read-only smoke checks and release-manifest hash comparison.'
      : 'Waits for a deployed Pages origin, then verifies the live PWA matches the exact release candidate.',
  },
  {
    id: 'optimize-product-gates',
    status: productOptimization.status === 'product-optimization-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command:
      'npm run autonomous:analyze && npm run autonomous:product-optimize && npm run autonomous:sync-config && npm run autonomous:simulate',
    targets: productOptimization.actions
      ?.filter((action) => action.gameId)
      .map((action) => action.gameId) ?? ['product-gates'],
    reason: 'Applies one guarded target-score or telemetry improvement when product gates block monetization.',
  },
  {
    id: 'refresh-first-move-coach',
    status: firstMoveCoach.status === 'first-move-coach-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:first-move-coach',
    targets: [firstMoveCoach.summary?.primaryTargetId ?? 'first-move-coach'],
    reason: 'Refreshes the first-turn coach policy from product-gate, onboarding, and release-health evidence.',
  },
  {
    id: 'refresh-completion-loop',
    status: completionLoop.status === 'completion-loop-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:completion-loop',
    targets: [completionLoop.target?.gameId ?? 'completion-loop'],
    reason: 'Refreshes the optional mid-run completion nudge from completion and abandonment evidence.',
  },
  {
    id: 'refresh-replay-loop',
    status: replayLoop.status === 'replay-loop-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:replay-loop',
    targets: [replayLoop.target?.gameId ?? 'replay-loop'],
    reason: 'Refreshes the optional completed-run replay prompt from product-gate and replay telemetry evidence.',
  },
  {
    id: 'prepare-repository-channel',
    status: repositoryChannelReady ? 'monitor' : 'armed',
    costUsd: 0,
    command: 'npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap',
    targets: [repositoryReadiness.repository?.target ?? 'github-repository-channel'],
    reason: repositoryChannelReady
      ? 'Keeps the GitHub Pages deployment channel evidence fresh.'
      : 'Surfaces and prepares the missing git/GitHub deployment-channel blockers before web deploy.',
  },
  {
    id: 'bootstrap-production-setup',
    status: productionBootstrap.status === 'production-bootstrap-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:release-candidate && npm run autonomous:deploy-plan && npm run autonomous:bootstrap',
    targets: ['github-pages', 'repository-config', 'event-collector'],
    reason: 'Regenerates the zero-spend production setup handoff and exact GitHub variable/secret commands.',
  },
  {
    id: 'run-autonomous-operator',
    status: ['operator-plan-ready', 'operator-executed'].includes(autonomousOperator.status)
      ? 'armed'
      : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:operator',
    targets: [autonomousOperator.selectedAction?.id ?? 'owner-loop-safe-actions'],
    reason: 'Publishes the one-action local execution plan with allowlist, zero-spend, and audit controls.',
  },
  {
    id: 'review-operator-history',
    status: autonomousOperatorHistory.status === 'operator-history-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:operator',
    targets: [autonomousOperatorHistory.summary?.lastActionId ?? 'operator-history'],
    reason: 'Refreshes the capped operator history so safe actions remain auditable over time.',
  },
  {
    id: 'refresh-objective-audit',
    status: objectiveAudit.status === 'objective-in-progress' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:objective-audit',
    targets: ['objective-evidence', 'production-blockers'],
    reason: 'Keeps the original objective mapped to current evidence and prevents false completion claims.',
  },
  {
    id: 'optimize-store-listing',
    status: storeListingOptimizer.status === 'store-listing-optimizer-ready' ? 'armed' : 'monitor',
    costUsd: 0,
    command: 'npm run autonomous:store-listing-optimize && npm run autonomous:store-compliance',
    targets: [storeListingOptimizer.recommendation?.focusGameId ?? storePackage.launchCandidate?.id ?? 'store-listing'],
    reason: 'Keeps store copy, keyword themes, screenshots, and compliance drafts aligned with behavior signals.',
  },
  {
    id: 'apply-safe-improvements',
    status: releaseHealth.controls?.canApplyExperimentChanges ? 'armed' : 'held',
    costUsd: 0,
    command: 'npm run autonomous:experiments && npm run autonomous:improve && npm run autonomous:sync-experiments',
    reason: releaseHealth.controls?.canApplyExperimentChanges
      ? 'Release health allows bounded improvement policy updates.'
      : 'Release health is holding experiment changes.',
  },
  {
    id: 'deploy-web-pwa',
    status:
      deployment.status === 'ready-for-pages' && productionResponse.controls?.deployAllowed && repositoryChannelReady
        ? 'ready-when-repository-pages-enabled'
        : repositoryChannelReady
          ? 'held'
          : 'blocked-needs-repository-channel',
    costUsd: 0,
    command: 'Run the Web PWA Deploy workflow after GitHub Pages is enabled for the repository.',
    reason: repositoryChannelReady
      ? (deployment.promotion?.nextAction ?? 'Static web deploy is the first no-cost distribution channel.')
      : 'Git/GitHub repository channel is not ready for workflow dispatch yet.',
  },
  {
    id: 'collect-live-events',
    status: liveAnalytics ? 'armed' : 'blocked-needs-collector-or-posthog',
    costUsd: 0,
    command: 'npm run autonomous:import-events && npm run autonomous:analytics',
    reason: liveAnalytics
      ? 'Live/player event data is available for autonomous rollups.'
      : 'The local loop can run, but production learning needs a configured collector or PostHog project.',
  },
]

const guardrails = [
  {
    id: 'zero-paid-spend',
    enforced: unitEconomics.controls?.maxDailySpendUsd === 0,
    detail: `Max daily spend is $${(unitEconomics.controls?.maxDailySpendUsd ?? 0).toFixed(2)}.`,
  },
  {
    id: 'no-revenue-before-product-gates',
    enforced: monetization.revenueEnabled !== true,
    detail: `Monetization status is ${monetization.status}.`,
  },
  {
    id: 'no-store-fees-before-payback',
    enforced: unitEconomics.controls?.storeSpendAllowed !== true,
    detail: `Android release status is ${androidRelease.status}.`,
  },
  {
    id: 'no-retire-without-live-data',
    enforced: portfolioPolicy.guardrails?.noRetireWithoutLiveData === true,
    detail: `Portfolio analytics source is ${portfolioPolicy.analyticsSource}.`,
  },
]

const executableNow = safeAutonomousActions.filter((action) =>
  ['armed', 'ready-when-repository-pages-enabled'].includes(action.status),
)
const nextBestAction =
  executableNow.find((action) => action.id === 'prepare-repository-channel') ??
  executableNow.find((action) => action.id === 'deploy-web-pwa') ??
  executableNow.find((action) => action.id === 'seed-portfolio-traffic') ??
  executableNow[0] ??
  safeAutonomousActions[0]

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'owner-loop-ready',
  mode: ownerMode,
  autonomyScore: {
    readySystems: readySystems.length,
    totalSystems: systems.length,
    percent: Math.round((readySystems.length / systems.length) * 100),
  },
  controls: {
    localLoopCanRunWithoutExternalAccounts: true,
    externalAccountInterventionRequired: credentialRequiredActions.length > 0,
    configuredRequiredEnv: configuredCount(productionEnvironment.requiredEnv),
    totalRequiredEnv: productionEnvironment.requiredEnv?.length ?? 0,
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    paidAcquisitionAllowed: unitEconomics.controls?.paidAcquisitionAllowed === true,
    storeSpendAllowed: unitEconomics.controls?.storeSpendAllowed === true,
    revenueEnabled: monetization.revenueEnabled === true,
    deployAllowed: productionResponse.controls?.deployAllowed === true,
    rollbackRequired: productionResponse.controls?.rollbackRequired === true,
  },
  ownerDecision: {
    nextBestActionId: nextBestAction.id,
    nextBestAction: nextBestAction.command,
    canExecuteWithoutSpend: nextBestAction.costUsd === 0,
    rationale: nextBestAction.reason,
  },
  systems,
  safeAutonomousActions,
  credentialRequiredActions,
  blockedExternalActions,
  guardrails,
  evidence: {
    analyticsSource,
    dailyChallenge: portfolioPolicy.dailyChallenge,
    trafficSeedingStatus: traffic.status,
    acquisitionLearningStatus: acquisition.status,
    organicSeedLoopStatus: organicSeedLoop.status,
    retentionLoopStatus: retention.status,
    pwaInstallLoopStatus: pwaInstall.status,
    performanceBudgetStatus: performanceBudget.status,
    repositoryReadinessStatus: repositoryReadiness.status,
    repositoryBootstrapStatus: repositoryBootstrap.status,
    releaseCandidateStatus: releaseCandidate.status,
    postDeploySmokeStatus: postDeploySmoke.status,
    productOptimizationStatus: productOptimization.status,
    firstMoveCoachStatus: firstMoveCoach.status,
    completionLoopStatus: completionLoop.status,
    replayLoopStatus: replayLoop.status,
    productionBootstrapStatus: productionBootstrap.status,
    autonomousOperatorStatus: autonomousOperator.status,
    autonomousOperatorHistoryStatus: autonomousOperatorHistory.status,
    objectiveAuditStatus: objectiveAudit.status,
    storeListingOptimizerStatus: storeListingOptimizer.status,
    deploymentStatus: deployment.status,
    releaseHealthStatus: releaseHealth.status,
    productionEnvironmentStatus: productionEnvironment.status,
    storePackageStatus: storePackage.status,
    storeComplianceStatus: storeCompliance.status,
    supportEmailStatus: storePackage.supportPage?.supportEmailStatus,
  },
  commands: {
    daily: 'npm run autonomous:daily',
    verify: 'npm run test:automation',
    fullGate: 'npm run autonomous:daily && npm run test:e2e && npm run autonomous:assert-deployable',
  },
}

const report = [
  '# Autonomous Owner Loop',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  `Autonomy score: ${payload.autonomyScore.readySystems}/${payload.autonomyScore.totalSystems} (${payload.autonomyScore.percent}%)`,
  '',
  '## Owner Decision',
  '',
  `- Next action: ${payload.ownerDecision.nextBestActionId}`,
  `- Command: ${payload.ownerDecision.nextBestAction}`,
  `- Rationale: ${payload.ownerDecision.rationale}`,
  '',
  '## Systems',
  '',
  ...payload.systems.map((system) => `- ${system.status}: ${system.id} - ${system.evidence}`),
  '',
  '## Safe Autonomous Actions',
  '',
  ...payload.safeAutonomousActions.map(
    (action) => `- ${action.status}: ${action.id} - ${action.command}`,
  ),
  '',
  '## Credential Required Actions',
  '',
  ...(payload.credentialRequiredActions.length
    ? payload.credentialRequiredActions.map((action) => `- ${action.target}: ${action.purpose}`)
    : ['- none']),
  '',
  '## Guardrails',
  '',
  ...payload.guardrails.map((guardrail) => `- ${guardrail.enforced ? 'enforced' : 'open'}: ${guardrail.id} - ${guardrail.detail}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const autonomousOwnerLoop = ${JSON.stringify(payload, null, 2)} as const\n\nexport type AutonomousOwnerLoop = typeof autonomousOwnerLoop\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
