import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const gatesPath = path.join(root, 'data', 'production-gates.json')
const experimentPolicyPath = path.join(root, 'data', 'experiment-policy.json')
const outputJsonPath = path.join(root, 'data', 'release-health.json')
const outputTsPath = path.join(root, 'src', 'data', 'releaseHealth.ts')
const reportPath = path.join(root, 'reports', 'release-health-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const analytics = await readJson(analyticsPath)
const gates = await readJson(gatesPath)
const experimentPolicy = await readJson(experimentPolicyPath)

const counts = analytics.totals?.counts ?? {}
const metrics = analytics.totals?.metrics ?? {}
const activeSource = analytics.sourceStatus?.activeSource ?? 'missing'
const retentionSource = analytics.retention?.source ?? analytics.sourceStatus?.retention?.source ?? 'missing'

const roundMetric = (value) => Math.round(value * 1000) / 1000
const pct = (value) => `${Math.round(value * 100)}%`
const valueOrZero = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const metricOrNull = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null)

const gameStarts = valueOrZero(counts.game_started)
const appLoads = valueOrZero(counts.app_loaded)
const runtimeErrors = valueOrZero(counts.runtime_error)
const abandonmentRate = gameStarts ? roundMetric(valueOrZero(counts.game_abandoned) / gameStarts) : 0
const runtimeErrorRate = Math.round((runtimeErrors / Math.max(appLoads, gameStarts, 1)) * 10000) / 10000
const firstGameCompletion = metricOrNull(metrics.firstGameCompletion)
const replayRate = metricOrNull(metrics.replayRate)
const d1Retention = metricOrNull(metrics.d1Retention)

const criticalThresholds = {
  minGameStartsForAutomation: 50,
  maxRuntimeErrorRate: 0.02,
  maxAbandonmentRate: 0.75,
  warningAbandonmentRate: 0.6,
  minCriticalFirstGameCompletion: 0.3,
  minCriticalReplayRate: 0.2,
  minCriticalD1Retention: 0.1,
}

const check = (id, status, detail) => ({ id, status, detail })

const checks = [
  check(
    'analytics-source',
    activeSource === 'fixture-sample' ? 'warn' : 'pass',
    activeSource === 'fixture-sample'
      ? 'Using fixture analytics; deploy is allowed only for internal traffic collection.'
      : `Using ${activeSource} analytics.`,
  ),
  check(
    'sample-size',
    gameStarts >= criticalThresholds.minGameStartsForAutomation ? 'pass' : 'blocker',
    `${gameStarts} game starts observed; ${criticalThresholds.minGameStartsForAutomation} required before autonomous rollout decisions.`,
  ),
  check(
    'runtime-error-rate',
    runtimeErrorRate <= criticalThresholds.maxRuntimeErrorRate ? 'pass' : 'blocker',
    `${runtimeErrors} runtime errors; error rate is ${pct(runtimeErrorRate)}.`,
  ),
  check(
    'first-game-completion-floor',
    firstGameCompletion === null || firstGameCompletion < criticalThresholds.minCriticalFirstGameCompletion
      ? 'blocker'
      : firstGameCompletion < gates.monetization.minFirstGameCompletion
        ? 'warn'
        : 'pass',
    firstGameCompletion === null
      ? 'First-game completion is missing.'
      : `First-game completion is ${pct(firstGameCompletion)}; monetization gate is ${pct(
          gates.monetization.minFirstGameCompletion,
        )}.`,
  ),
  check(
    'replay-floor',
    replayRate === null || replayRate < criticalThresholds.minCriticalReplayRate
      ? 'blocker'
      : replayRate < gates.monetization.minReplayRate
        ? 'warn'
        : 'pass',
    replayRate === null
      ? 'Replay rate is missing.'
      : `Replay rate is ${pct(replayRate)}; monetization gate is ${pct(gates.monetization.minReplayRate)}.`,
  ),
  check(
    'd1-retention-floor',
    d1Retention === null || d1Retention < criticalThresholds.minCriticalD1Retention
      ? 'blocker'
      : d1Retention < gates.monetization.minD1Retention
        ? 'warn'
        : 'pass',
    d1Retention === null
      ? 'D1 retention is missing.'
      : `D1 retention is ${pct(d1Retention)}; monetization gate is ${pct(
          gates.monetization.minD1Retention,
        )}; source is ${retentionSource}.`,
  ),
  check(
    'abandonment-ceiling',
    abandonmentRate > criticalThresholds.maxAbandonmentRate
      ? 'blocker'
      : abandonmentRate > criticalThresholds.warningAbandonmentRate
        ? 'warn'
        : 'pass',
    `Abandonment rate is ${pct(abandonmentRate)}.`,
  ),
]

const blockers = checks.filter((item) => item.status === 'blocker')
const warnings = checks.filter((item) => item.status === 'warn')
const status = blockers.length ? 'blocked' : warnings.length ? 'monitoring' : 'healthy'
const automaticHoldReasons = blockers.map((item) => item.detail)
const monetizationGatesPassed =
  firstGameCompletion !== null &&
  replayRate !== null &&
  d1Retention !== null &&
  firstGameCompletion >= gates.monetization.minFirstGameCompletion &&
  replayRate >= gates.monetization.minReplayRate &&
  d1Retention >= gates.monetization.minD1Retention

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  analyticsSource: activeSource,
  retentionSource,
  metrics: {
    gameStarts,
    appLoads,
    runtimeErrors,
    runtimeErrorRate,
    abandonmentRate,
    firstGameCompletion,
    replayRate,
    d1Retention,
  },
  thresholds: criticalThresholds,
  checks,
  controls: {
    canPromoteWeb: !blockers.length,
    canDeploy: !blockers.length,
    canApplyExperimentChanges: !blockers.length && gameStarts >= criticalThresholds.minGameStartsForAutomation,
    monetizationAllowed: !blockers.length && monetizationGatesPassed,
    rollbackRequired: Boolean(blockers.length),
    automaticHoldReasons,
  },
  experimentSnapshot: Object.fromEntries(
    Object.entries(experimentPolicy.experiments ?? {}).map(([id, experiment]) => [
      id,
      (experiment.variants ?? []).map((variant) => ({
        id: variant.id,
        weight: variant.weight,
      })),
    ]),
  ),
}

const report = [
  '# Release Health Guard',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.analyticsSource}`,
  '',
  '## Controls',
  '',
  `- Promote web: ${payload.controls.canPromoteWeb ? 'yes' : 'no'}`,
  `- Deploy: ${payload.controls.canDeploy ? 'yes' : 'no'}`,
  `- Apply experiment changes: ${payload.controls.canApplyExperimentChanges ? 'yes' : 'no'}`,
  `- Monetization allowed: ${payload.controls.monetizationAllowed ? 'yes' : 'no'}`,
  `- Rollback required: ${payload.controls.rollbackRequired ? 'yes' : 'no'}`,
  '',
  '## Checks',
  '',
  ...checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
]

const tsOutput = `export const releaseHealth = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ReleaseHealth = typeof releaseHealth\n`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(outputTsPath, tsOutput)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
