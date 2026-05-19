import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const outputJsonPath = path.join(dataDir, 'product-gate-recovery.json')
const outputTsPath = path.join(srcDataDir, 'productGateRecovery.ts')
const reportPath = path.join(reportsDir, 'product-gate-recovery-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a')
const clampNeeded = (needed) => Math.max(0, needed)

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const gates = await readJson(path.join(dataDir, 'production-gates.json'))
const productOptimization = await readJson(path.join(dataDir, 'product-optimization.json'))
const completionLoop = await readJson(path.join(dataDir, 'completion-loop.json'))
const replayLoop = await readJson(path.join(dataDir, 'replay-loop.json'))
const retentionLoop = await readJson(path.join(dataDir, 'retention-loop.json'))
const firstMoveCoach = await readJson(path.join(dataDir, 'first-move-coach.json'))
const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))

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
    primaryTelemetry: [
      completionLoop.promptPolicy?.telemetry?.viewed,
      completionLoop.promptPolicy?.telemetry?.clicked,
      completionLoop.finishLinePolicy?.telemetry?.viewed,
      completionLoop.finishLinePolicy?.telemetry?.clicked,
      'first_move_coach_used',
    ].filter(Boolean),
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
    primaryTelemetry: [
      replayLoop.promptPolicy?.telemetry?.viewed,
      replayLoop.promptPolicy?.telemetry?.clicked,
      replayLoop.promptPolicy?.telemetry?.dismissed,
      replayLoop.promptPolicy?.telemetry?.replay,
    ].filter(Boolean),
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
    primaryTelemetry: [
      retentionLoop.promptPolicy?.telemetry?.viewed,
      retentionLoop.promptPolicy?.telemetry?.clicked,
      retentionLoop.returnIntentPolicy?.telemetry?.viewed,
      retentionLoop.returnIntentPolicy?.telemetry?.started,
    ].filter(Boolean),
    actionId: 'optimize-daily-retention',
  },
].map((row) => {
  const neededSuccesses = clampNeeded(Math.ceil(row.gate * row.denominator) - row.successes)
  const gap = Math.max(0, row.gate - (row.actual ?? 0))
  const currentPromptViews = row.primaryTelemetry
    .filter((eventName) => String(eventName).endsWith('_viewed') || String(eventName).includes('coach_shown'))
    .reduce((sum, eventName) => sum + (counts[eventName] ?? 0), 0)
  const minimumPromptViewsForDecision = row.id === 'd1Retention' ? 10 : 30

  return {
    ...row,
    actual: roundMetric(row.actual),
    gate: roundMetric(row.gate),
    pass: (row.actual ?? 0) >= row.gate,
    gap: roundMetric(gap),
    neededSuccesses,
    minimumPromptViewsForDecision,
    currentPromptViews,
    promptViewsNeeded: clampNeeded(minimumPromptViewsForDecision - currentPromptViews),
    status: neededSuccesses > 0 ? 'needs-observed-lift' : 'passing',
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
  nextMeasurement: gate.primaryTelemetry.join(', '),
  reason:
    gate.id === primaryBottleneck.id
      ? `${gate.label} is the largest revenue-blocking gap.`
      : gate.id === quickestGateTest.id
        ? `${gate.label} is the fastest gate to re-test with real retained-player evidence.`
        : `${gate.label} still blocks revenue and store payback assumptions.`,
}))

const payload = {
  generatedAt: new Date().toISOString(),
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
  },
  gates: gateRows,
  priorities,
  controls: {
    zeroPaidSpend: true,
    revenueStillDisabledUntilAllGatesPass: monetization.revenueEnabled !== true,
    noSyntheticGatePasses: true,
    requireObservedTelemetryBeforeCopyChange: true,
    oneRecoveryFocusPerOwnerRun: true,
    noPaidRewardsOrPushNotifications: true,
  },
  linkedLoops: {
    productOptimization: productOptimization.status,
    firstMoveCoach: firstMoveCoach.status,
    completionLoop: completionLoop.status,
    replayLoop: replayLoop.status,
    retentionLoop: retentionLoop.status,
  },
  nextActions: [
    `${primaryBottleneck.label} needs ${primaryBottleneck.neededSuccesses} more observed success(es) at the current denominator before the gate clears.`,
    `${primaryBottleneck.ownerLoop} should collect ${primaryBottleneck.promptViewsNeeded} more prompt exposure(s) before automation changes copy or placement again.`,
    quickestGateTest.id !== primaryBottleneck.id
      ? `${quickestGateTest.label} is the quickest separate gate test: ${quickestGateTest.neededSuccesses} more observed success(es) would clear it.`
      : 'Keep the current primary recovery loop active until enough real telemetry arrives.',
    'Keep revenue, paid acquisition, push notifications, and app-store submission disabled until every gate passes with observed data.',
  ],
}

const report = [
  '# Product Gate Recovery',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Failing gates: ${payload.summary.failingGates}`,
  `Primary bottleneck: ${payload.summary.primaryBottleneck}`,
  `Quickest gate test: ${payload.summary.quickestGateTest}`,
  '',
  '## Gates',
  '',
  ...payload.gates.map(
    (gate) =>
      `- ${gate.status}: ${gate.id} - ${pct(gate.actual)} / ${pct(gate.gate)}; needs ${gate.neededSuccesses} observed success(es); ${gate.promptViewsNeeded} prompt exposure(s) before next copy change.`,
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
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productGateRecovery = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductGateRecovery = typeof productGateRecovery\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
