import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const publicDir = path.join(root, 'public')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'product-gate-recovery.json')
const outputTsPath = path.join(srcDataDir, 'productGateRecovery.ts')
const publicJsonPath = path.join(publicDir, 'product-gate-recovery.json')
const publicHtmlPath = path.join(publicDir, 'product-gate-recovery.html')
const reportPath = path.join(reportsDir, 'product-gate-recovery-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')
const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
const publicRouteHref = (value, fallback = './') => {
  const candidate = String(value ?? fallback)
  if (/^https?:\/\//.test(candidate)) {
    return candidate
  }
  return candidate.startsWith('/') ? `.${candidate}` : candidate
}
const clampNeeded = (needed) => Math.max(0, needed)
const ratio = (numerator, denominator) =>
  denominator > 0 ? Math.round((numerator / denominator) * 1000) / 1000 : null
const additionalSuccessesToReachGate = ({ gate, denominator, successes }) => {
  if (successes >= gate * denominator) {
    return 0
  }

  if (gate >= 1) {
    return Number.POSITIVE_INFINITY
  }

  return clampNeeded(Math.ceil((gate * denominator - successes) / (1 - gate)))
}

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const gates = await readJson(path.join(dataDir, 'production-gates.json'))
const productOptimization = await readJson(path.join(dataDir, 'product-optimization.json'))
const completionLoop = await readJson(path.join(dataDir, 'completion-loop.json'))
const replayLoop = await readJson(path.join(dataDir, 'replay-loop.json'))
const retentionLoop = await readJson(path.join(dataDir, 'retention-loop.json'))
const firstMoveCoach = await readJson(path.join(dataDir, 'first-move-coach.json'))
const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))
const completionLoopSourceEvidence = {
  status: completionLoop.status,
  promptPolicy: {
    surface: completionLoop.promptPolicy?.surface ?? null,
    telemetry: completionLoop.promptPolicy?.telemetry ?? null,
  },
  finishLinePolicy: {
    telemetry: completionLoop.finishLinePolicy?.telemetry ?? null,
  },
}
const replayLoopSourceEvidence = {
  status: replayLoop.status,
  promptPolicy: {
    surface: replayLoop.promptPolicy?.surface ?? null,
    telemetry: replayLoop.promptPolicy?.telemetry ?? null,
  },
}
const retentionLoopSourceEvidence = {
  status: retentionLoop.status,
  rewardSurfacePolicy: {
    surface: retentionLoop.rewardSurfacePolicy?.surface ?? null,
    telemetry: retentionLoop.rewardSurfacePolicy?.telemetry ?? null,
  },
  promptPolicy: {
    telemetry: retentionLoop.promptPolicy?.telemetry ?? null,
  },
  returnIntentPolicy: {
    surface: retentionLoop.returnIntentPolicy?.surface ?? null,
    telemetry: retentionLoop.returnIntentPolicy?.telemetry ?? null,
  },
  returnCalendarPolicy: {
    surface: retentionLoop.returnCalendarPolicy?.surface ?? null,
    telemetry: retentionLoop.returnCalendarPolicy?.telemetry ?? null,
  },
}
const firstMoveCoachSourceEvidence = {
  status: firstMoveCoach.status,
}
const monetizationSourceEvidence = {
  status: monetization.status,
  revenueEnabled: monetization.revenueEnabled === true,
}

const counts = analytics.totals?.counts ?? {}
const metrics = analytics.totals?.metrics ?? {}
const retention = analytics.retention ?? {}
const productGates = productOptimization.productGates ?? {}

const gateRows = [
  {
    id: 'firstGameCompletion',
    label: 'First game completion',
    actual: productGates.firstGameCompletion?.actual ?? roundMetric(metrics.firstGameCompletion),
    gate: gates.monetization.minFirstGameCompletion,
    denominator: counts.game_started ?? 0,
    successes: counts.level_completed ?? 0,
    ownerLoop: 'completion-loop',
    runtimeSurface: completionLoop.promptPolicy?.surface,
    viewTelemetry: [
      completionLoop.promptPolicy?.telemetry?.viewed,
      completionLoop.finishLinePolicy?.telemetry?.viewed,
      'first_move_coach_shown',
    ].filter(Boolean),
    actionTelemetry: [
      completionLoop.promptPolicy?.telemetry?.clicked,
      completionLoop.finishLinePolicy?.telemetry?.clicked,
      'first_move_coach_used',
    ].filter(Boolean),
    successTelemetry: ['level_completed'],
    failureTelemetry: ['game_abandoned'],
    minimumActionRateForCopyHold: 0.18,
    actionId: 'refresh-completion-loop',
  },
  {
    id: 'replayRate',
    label: 'Replay rate',
    actual: productGates.replayRate?.actual ?? roundMetric(metrics.replayRate),
    gate: gates.monetization.minReplayRate,
    denominator: counts.level_completed ?? 0,
    successes: counts.replay_clicked ?? 0,
    ownerLoop: 'replay-loop',
    runtimeSurface: replayLoop.promptPolicy?.surface,
    viewTelemetry: [
      replayLoop.promptPolicy?.telemetry?.viewed,
    ].filter(Boolean),
    actionTelemetry: [
      replayLoop.promptPolicy?.telemetry?.clicked,
    ].filter(Boolean),
    successTelemetry: ['replay_clicked'],
    failureTelemetry: [replayLoop.promptPolicy?.telemetry?.dismissed].filter(Boolean),
    minimumActionRateForCopyHold: 0.2,
    actionId: 'refresh-replay-loop',
  },
  {
    id: 'd1Retention',
    label: 'D1 retention',
    actual: productGates.d1Retention?.actual ?? roundMetric(metrics.d1Retention),
    gate: gates.monetization.minD1Retention,
    denominator: retention.eligibleUsers ?? analytics.sourceStatus?.retention?.eligibleUsers ?? 0,
    successes: retention.retainedUsers ?? analytics.sourceStatus?.retention?.retainedUsers ?? 0,
    ownerLoop: 'retention-loop',
    runtimeSurface: retentionLoop.returnIntentPolicy?.surface,
    viewTelemetry: [
      retentionLoop.rewardSurfacePolicy?.telemetry?.viewed,
      retentionLoop.promptPolicy?.telemetry?.viewed,
      retentionLoop.returnIntentPolicy?.telemetry?.viewed,
    ].filter(Boolean),
    actionTelemetry: [
      retentionLoop.rewardSurfacePolicy?.telemetry?.clicked,
      retentionLoop.promptPolicy?.telemetry?.clicked,
      retentionLoop.returnLinkPolicy?.telemetry?.copied,
      retentionLoop.returnCalendarPolicy?.telemetry?.downloaded,
      retentionLoop.returnIntentPolicy?.telemetry?.started,
    ].filter(Boolean),
    successTelemetry: ['daily_return_intent_started'],
    failureTelemetry: [
      retentionLoop.promptPolicy?.telemetry?.dismissed,
      retentionLoop.returnIntentPolicy?.telemetry?.cleared,
    ].filter(Boolean),
    minimumActionRateForCopyHold: 0.2,
    actionId: 'optimize-daily-retention',
  },
].map((row) => {
  const neededSuccesses = additionalSuccessesToReachGate(row)
  const projectedDenominator = row.denominator + neededSuccesses
  const projectedSuccesses = row.successes + neededSuccesses
  const gap = Math.max(0, row.gate - (row.actual ?? 0))
  const pass = (row.actual ?? 0) >= row.gate
  const currentPromptViews = row.viewTelemetry.reduce((sum, eventName) => sum + (counts[eventName] ?? 0), 0)
  const currentPromptActions = row.actionTelemetry.reduce((sum, eventName) => sum + (counts[eventName] ?? 0), 0)
  const currentPromptFailures = row.failureTelemetry.reduce((sum, eventName) => sum + (counts[eventName] ?? 0), 0)
  const minimumPromptViewsForDecision = row.id === 'd1Retention' ? 10 : 30
  const promptViewsNeeded = clampNeeded(minimumPromptViewsForDecision - currentPromptViews)
  const sampleReady = promptViewsNeeded === 0
  const actionRate = ratio(currentPromptActions, currentPromptViews)
  const experimentStatus = pass
    ? 'gate-passing'
    : !sampleReady
      ? 'collecting-sample'
      : actionRate === null || actionRate < row.minimumActionRateForCopyHold
        ? 'copy-test-ready'
        : 'placement-test-ready'
  const recommendedChange =
    experimentStatus === 'collecting-sample'
      ? 'hold-current-runtime-copy'
      : experimentStatus === 'copy-test-ready'
        ? 'prepare-next-copy-variant'
        : experimentStatus === 'placement-test-ready'
          ? 'prepare-trigger-or-placement-test'
          : 'monitor-gate'

  return {
    ...row,
    actual: roundMetric(row.actual),
    gate: roundMetric(row.gate),
    pass,
    gap: roundMetric(gap),
    neededSuccesses,
    neededSuccessesMode: 'additional-successes-raise-observed-rate',
    projectedRateAfterNeededSuccesses: ratio(projectedSuccesses, projectedDenominator),
    minimumPromptViewsForDecision,
    currentPromptViews,
    currentPromptActions,
    currentPromptFailures,
    actionRate,
    sampleReady,
    promptViewsNeeded,
    status: neededSuccesses > 0 ? 'needs-observed-lift' : 'passing',
    experimentStatus,
    recommendedChange,
  }
})

const failingGates = gateRows.filter((row) => !row.pass)
const primaryBottleneck =
  [...failingGates].sort((a, b) => b.gap - a.gap || b.neededSuccesses - a.neededSuccesses)[0] ?? gateRows[0]
const quickestGateTest =
  [...failingGates].sort((a, b) => a.neededSuccesses - b.neededSuccesses || b.gap - a.gap)[0] ?? gateRows[0]

const priorities = failingGates.map((gate, index) => ({
  rank: index + 1,
  gateId: gate.id,
  label: gate.label,
  ownerLoop: gate.ownerLoop,
  actionId: gate.actionId,
  neededSuccesses: gate.neededSuccesses,
  promptViewsNeeded: gate.promptViewsNeeded,
  experimentStatus: gate.experimentStatus,
  recommendedChange: gate.recommendedChange,
  nextMeasurement: [...gate.viewTelemetry, ...gate.actionTelemetry, ...gate.successTelemetry].join(', '),
  reason:
    gate.id === primaryBottleneck.id
      ? `${gate.label} is the largest revenue-blocking gap.`
      : gate.id === quickestGateTest.id
        ? `${gate.label} is the fastest gate to re-test with real retained-player evidence.`
        : `${gate.label} still blocks revenue and store payback assumptions.`,
}))
const recoveryExperiments = gateRows.map((gate) => ({
  gateId: gate.id,
  status: gate.experimentStatus,
  ownerLoop: gate.ownerLoop,
  canChangeCopy: !gate.pass && gate.sampleReady && gate.experimentStatus === 'copy-test-ready',
  canChangePlacement: !gate.pass && gate.sampleReady && gate.experimentStatus === 'placement-test-ready',
  currentPromptViews: gate.currentPromptViews,
  currentPromptActions: gate.currentPromptActions,
  actionRate: gate.actionRate,
  minimumPromptViewsForDecision: gate.minimumPromptViewsForDecision,
  promptViewsNeeded: gate.promptViewsNeeded,
  recommendedChange: gate.recommendedChange,
  holdReason: gate.sampleReady
    ? 'Observed sample is sufficient for the next bounded recovery decision.'
    : `Needs ${gate.promptViewsNeeded} more prompt exposure(s) before changing copy or placement.`,
}))
const primaryExperiment =
  recoveryExperiments.find((experiment) => experiment.gateId === primaryBottleneck.id) ?? recoveryExperiments[0]
const sourceDataHash = hashSourceData({
  analytics,
  gates,
  productOptimization,
  completionLoop: completionLoopSourceEvidence,
  replayLoop: replayLoopSourceEvidence,
  retentionLoop: retentionLoopSourceEvidence,
  firstMoveCoach: firstMoveCoachSourceEvidence,
  monetization: monetizationSourceEvidence,
})

const payload = {
  generatedAt: new Date().toISOString(),
  sourceDataHash,
  status: 'product-gate-recovery-ready',
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    retentionSource: analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? 'unknown',
    productOptimization: productOptimization.status,
    monetization: monetization.status,
  },
  summary: {
    failingGates: failingGates.length,
    passingGates: gateRows.length - failingGates.length,
    primaryBottleneck: primaryBottleneck.id,
    quickestGateTest: quickestGateTest.id,
    revenueEnabled: monetization.revenueEnabled === true,
    primaryExperimentStatus: primaryExperiment?.status ?? 'missing',
  },
  publicRoutes: {
    productGateRecovery: '/product-gate-recovery.html',
    productGateRecoveryJson: '/product-gate-recovery.json',
    measurementStatus: '/measurement-status.html',
    gateSample: '/gate-sample.html',
    sampleNext: '/sample-next.html',
    sampleFastest: '/sample-fastest.html',
  },
  gates: gateRows,
  priorities,
  experiments: recoveryExperiments,
  controls: {
    zeroPaidSpend: true,
    revenueStillDisabledUntilAllGatesPass: monetization.revenueEnabled !== true,
    noSyntheticGatePasses: true,
    requireObservedTelemetryBeforeCopyChange: true,
    copyChangeRequiresSampleReady: true,
    placementChangeRequiresSampleReady: true,
    oneRecoveryFocusPerOwnerRun: true,
    noPaidRewardsOrPushNotifications: true,
    noAutomaticRuleChanges: true,
  },
  linkedLoops: {
    productOptimization: productOptimization.status,
    firstMoveCoach: firstMoveCoach.status,
    completionLoop: completionLoop.status,
    replayLoop: replayLoop.status,
    retentionLoop: retentionLoop.status,
  },
  nextActions: [
    `${primaryBottleneck.label} needs ${primaryBottleneck.neededSuccesses} more observed success(es), accounting for denominator growth, before the gate clears.`,
    `${primaryBottleneck.ownerLoop} is ${primaryExperiment?.status ?? 'missing'} and should collect ${primaryBottleneck.promptViewsNeeded} more prompt exposure(s) before automation changes copy or placement again.`,
    quickestGateTest.id !== primaryBottleneck.id
      ? `${quickestGateTest.label} is the quickest separate gate test: ${quickestGateTest.neededSuccesses} more observed success(es) would clear it.`
      : 'Keep the current primary recovery loop active until enough real telemetry arrives.',
    'Keep revenue, paid acquisition, push notifications, and app-store submission disabled until every gate passes with observed data.',
  ],
}

const publicPayload = payload

const publicHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Product Gate Recovery | Autonomous Game Lab</title>
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
        width: min(980px, calc(100% - 32px));
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
        font-size: clamp(2rem, 6vw, 4.2rem);
        max-width: 780px;
      }

      p {
        max-width: 760px;
      }

      a {
        color: #187f7a;
        font-weight: 700;
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

      li {
        margin: 6px 0;
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
      <h1>Product Gate Recovery</h1>
      <p>This generated handoff shows which observed product gates still block revenue and app-store escalation. It uses aggregate telemetry only and keeps paid acquisition, push notifications, store submission, and revenue disabled until every gate clears with real player evidence.</p>

      <div class="grid" aria-label="Product gate recovery summary">
        <div class="card">
          <span>Status</span>
          <strong>${escapeHtml(payload.status)}</strong>
        </div>
        <div class="card">
          <span>Primary bottleneck</span>
          <strong>${escapeHtml(payload.summary.primaryBottleneck)}</strong>
        </div>
        <div class="card">
          <span>Quickest gate test</span>
          <strong>${escapeHtml(payload.summary.quickestGateTest)}</strong>
        </div>
        <div class="card">
          <span>Failing gates</span>
          <strong>${payload.summary.failingGates}</strong>
        </div>
        <div class="card">
          <span>Revenue enabled</span>
          <strong>${payload.summary.revenueEnabled}</strong>
        </div>
      </div>

      <section>
        <h2>Recovery Gates</h2>
        <div class="grid" aria-label="Recovery gates">
          ${payload.gates
            .map(
              (gate) => `<article class="card">
            <span>${escapeHtml(gate.status)}</span>
            <h3>${escapeHtml(gate.label)}</h3>
            <p>${pct(gate.actual)} observed against ${pct(gate.gate)} gate.</p>
            <p>${gate.neededSuccesses} observed success(es) and ${gate.promptViewsNeeded} prompt exposure(s) needed before the next safe decision.</p>
            <p>Experiment: ${escapeHtml(gate.experimentStatus)}; next: ${escapeHtml(gate.recommendedChange)}.</p>
          </article>`,
            )
            .join('\n          ')}
        </div>
      </section>

      <section>
        <h2>Recovery Priorities</h2>
        <ul>
          ${payload.priorities
            .map(
              (priority) =>
                `<li><strong>${priority.rank}. ${escapeHtml(priority.label)}</strong>: ${escapeHtml(priority.ownerLoop)} needs ${priority.neededSuccesses} success(es); ${escapeHtml(priority.reason)}</li>`,
            )
            .join('\n          ')}
        </ul>
      </section>

      <section>
        <h2>Controls</h2>
        <ul>
          <li>Zero paid spend: ${payload.controls.zeroPaidSpend}</li>
          <li>Revenue still disabled until all gates pass: ${payload.controls.revenueStillDisabledUntilAllGatesPass}</li>
          <li>No synthetic gate passes: ${payload.controls.noSyntheticGatePasses}</li>
          <li>Observed telemetry required before copy change: ${payload.controls.requireObservedTelemetryBeforeCopyChange}</li>
          <li>No paid rewards or push notifications: ${payload.controls.noPaidRewardsOrPushNotifications}</li>
          <li>No automatic rule changes: ${payload.controls.noAutomaticRuleChanges}</li>
        </ul>
      </section>

      <section>
        <h2>Next Actions</h2>
        <ul>
          ${payload.nextActions.map((action) => `<li>${escapeHtml(action)}</li>`).join('\n          ')}
        </ul>
        <div class="actions">
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.measurementStatus))}">Open measurement status</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.sampleNext))}">Start current sample</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.sampleFastest))}">Start fastest sample</a>
          <a href="${escapeHtml(publicRouteHref(payload.publicRoutes.productGateRecoveryJson))}">Open recovery JSON</a>
        </div>
      </section>
    </main>
  </body>
</html>
`

const report = [
  '# Product Gate Recovery',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Source hash: ${payload.sourceDataHash}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Failing gates: ${payload.summary.failingGates}`,
  `Primary bottleneck: ${payload.summary.primaryBottleneck}`,
  `Quickest gate test: ${payload.summary.quickestGateTest}`,
  `Primary experiment status: ${payload.summary.primaryExperimentStatus}`,
  '',
  '## Gates',
  '',
  ...payload.gates.map(
    (gate) =>
      `- ${gate.status}: ${gate.id} - ${pct(gate.actual)} / ${pct(gate.gate)}; needs ${gate.neededSuccesses} observed success(es); ${gate.promptViewsNeeded} prompt exposure(s) before next copy change.`,
  ),
  '',
  '## Recovery Experiments',
  '',
  ...payload.experiments.map(
    (experiment) =>
      `- ${experiment.status}: ${experiment.gateId}; views ${experiment.currentPromptViews}/${experiment.minimumPromptViewsForDecision}; action rate ${pct(experiment.actionRate)}; next ${experiment.recommendedChange}.`,
  ),
  '',
  '## Priorities',
  '',
  ...payload.priorities.map(
    (priority) =>
      `- ${priority.rank}. ${priority.gateId}: ${priority.ownerLoop}; ${priority.reason}`,
  ),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(publicJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productGateRecovery = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductGateRecovery = typeof productGateRecovery\n`,
)
await writeFile(publicJsonPath, JSON.stringify(publicPayload, null, 2) + '\n')
await writeFile(publicHtmlPath, publicHtml)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, publicJsonPath)}`)
console.log(`Wrote ${path.relative(root, publicHtmlPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
