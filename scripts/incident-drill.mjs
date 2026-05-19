import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const reportsDir = path.join(root, 'reports')
const srcDataDir = path.join(root, 'src', 'data')
const outputJsonPath = path.join(dataDir, 'incident-drill.json')
const outputTsPath = path.join(srcDataDir, 'incidentDrill.ts')
const reportPath = path.join(reportsDir, 'incident-drill-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const writeJson = async (filePath, payload) => writeFile(filePath, JSON.stringify(payload, null, 2) + '\n')

const runResponder = (env) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'scripts', 'production-responder.mjs')], {
      cwd: root,
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }

      reject(new Error(`production responder exited ${code}\n${stdout}\n${stderr}`))
    })
  })

const fail = (message) => {
  throw new Error(message)
}

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'agl-incident-drill-'))
const tempDataDir = path.join(tempRoot, 'data')
const tempReportsDir = path.join(tempRoot, 'reports')
const tempSrcDataDir = path.join(tempRoot, 'src', 'data')

try {
  await mkdir(tempDataDir, { recursive: true })
  await mkdir(tempReportsDir, { recursive: true })
  await mkdir(tempSrcDataDir, { recursive: true })

  const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
  const experimentPolicy = await readJson(path.join(dataDir, 'experiment-policy.json'))
  const experimentResults = await readJson(path.join(dataDir, 'experiment-results.json'))
  const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))
  const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
  const deployment = await readJson(path.join(dataDir, 'deployment-plan.json'))

  const drillReleaseHealth = {
    ...releaseHealth,
    generatedAt: new Date().toISOString(),
    status: 'blocked',
    metrics: {
      ...releaseHealth.metrics,
      appLoads: Math.max(releaseHealth.metrics?.appLoads ?? 0, 100),
      gameStarts: Math.max(releaseHealth.metrics?.gameStarts ?? 0, 100),
      runtimeErrors: 9,
      runtimeErrorRate: 0.09,
      firstGameCompletion: 0.12,
      replayRate: 0.08,
      d1Retention: 0.03,
    },
    checks: [
      ...(releaseHealth.checks ?? []),
      {
        id: 'drill-runtime-error-rate',
        status: 'blocker',
        detail: 'Incident drill injected a 9% runtime error rate.',
      },
    ],
    controls: {
      ...releaseHealth.controls,
      canPromoteWeb: false,
      canDeploy: false,
      canApplyExperimentChanges: false,
      monetizationAllowed: false,
      rollbackRequired: true,
      automaticHoldReasons: [
        'Incident drill injected a 9% runtime error rate.',
        'Incident drill pushed first-game completion below the critical floor.',
      ],
    },
  }

  const drillExperimentPolicy = {
    ...experimentPolicy,
    guardrails: {
      ...experimentPolicy.guardrails,
      fallbackVariantByExperiment: {
        first_session_pacing: 'guided',
        reward_offer: 'daily-streak',
      },
    },
    experiments: {
      ...experimentPolicy.experiments,
      first_session_pacing: {
        ...experimentPolicy.experiments.first_session_pacing,
        variants: experimentPolicy.experiments.first_session_pacing.variants.map((variant) => ({
          ...variant,
          weight: variant.id === 'fast-start' ? 85 : 15,
        })),
      },
      reward_offer: {
        ...experimentPolicy.experiments.reward_offer,
        variants: experimentPolicy.experiments.reward_offer.variants.map((variant) => ({
          ...variant,
          weight: variant.id === 'daily-streak' ? 80 : 20,
        })),
      },
    },
  }

  await writeJson(path.join(tempDataDir, 'release-health.json'), drillReleaseHealth)
  await writeJson(path.join(tempDataDir, 'experiment-policy.json'), drillExperimentPolicy)
  await writeJson(path.join(tempDataDir, 'experiment-results.json'), experimentResults)
  await writeJson(path.join(tempDataDir, 'monetization-plan.json'), monetization)
  await writeJson(path.join(tempDataDir, 'unit-economics.json'), unitEconomics)
  await writeJson(path.join(tempDataDir, 'deployment-plan.json'), deployment)

  const execution = await runResponder({
    AGL_DATA_DIR: tempDataDir,
    AGL_REPORTS_DIR: tempReportsDir,
    AGL_SRC_DATA_DIR: tempSrcDataDir,
  })
  const response = await readJson(path.join(tempDataDir, 'production-response.json'))
  const healedPolicy = await readJson(path.join(tempDataDir, 'experiment-policy.json'))

  const firstSessionWeights = Object.fromEntries(
    healedPolicy.experiments.first_session_pacing.variants.map((variant) => [variant.id, variant.weight]),
  )
  const rewardWeights = Object.fromEntries(
    healedPolicy.experiments.reward_offer.variants.map((variant) => [variant.id, variant.weight]),
  )
  const actionIds = new Set(response.actions.map((action) => action.id))
  const appliedSafeWeights = response.actions.filter(
    (action) => action.id.startsWith('safe-weights-') && action.status === 'applied',
  )

  if (response.status !== 'incident-response') {
    fail(`expected incident-response status, got ${response.status}`)
  }

  if (
    response.controls.deployAllowed !== false ||
    response.controls.rollbackRequired !== true ||
    response.controls.experimentsFrozen !== true ||
    response.controls.selfHealingApplied !== true
  ) {
    fail('incident responder controls did not enter rollback/freeze/self-heal mode')
  }

  if (!actionIds.has('rollback-hold') || !actionIds.has('freeze-experiment-learning')) {
    fail('incident responder did not create rollback and experiment-freeze actions')
  }

  if (appliedSafeWeights.length < 2) {
    fail('incident responder did not apply safe weights for all fallback experiments')
  }

  if (
    firstSessionWeights.guided !== 85 ||
    firstSessionWeights['fast-start'] !== 15 ||
    rewardWeights['daily-streak'] !== 85 ||
    rewardWeights['score-booster'] !== 15
  ) {
    fail('incident responder did not restore expected fallback experiment weights')
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    status: 'pass',
    scenario: 'blocked-release-health',
    isolated: true,
    responderStatus: response.status,
    controls: response.controls,
    appliedSafeWeights: appliedSafeWeights.map((action) => action.id),
    fallbackWeights: {
      first_session_pacing: firstSessionWeights,
      reward_offer: rewardWeights,
    },
    actionIds: [...actionIds],
    stdout: execution.stdout.trim().split('\n').filter(Boolean),
  }

  const report = [
    '# Incident Drill',
    '',
    `Generated: ${payload.generatedAt}`,
    `Status: ${payload.status}`,
    `Scenario: ${payload.scenario}`,
    `Responder status: ${payload.responderStatus}`,
    '',
    '## Verified Controls',
    '',
    `- Deploy allowed: ${payload.controls.deployAllowed}`,
    `- Rollback required: ${payload.controls.rollbackRequired}`,
    `- Experiments frozen: ${payload.controls.experimentsFrozen}`,
    `- Self-healing applied: ${payload.controls.selfHealingApplied}`,
    '',
    '## Safe Weights',
    '',
    `- first_session_pacing: guided ${firstSessionWeights.guided}, fast-start ${firstSessionWeights['fast-start']}`,
    `- reward_offer: daily-streak ${rewardWeights['daily-streak']}, score-booster ${rewardWeights['score-booster']}`,
    '',
    '## Actions',
    '',
    ...payload.actionIds.map((id) => `- ${id}`),
    '',
  ]

  await mkdir(path.dirname(outputJsonPath), { recursive: true })
  await mkdir(path.dirname(outputTsPath), { recursive: true })
  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeJson(outputJsonPath, payload)
  await writeFile(
    outputTsPath,
    `export const incidentDrill = ${JSON.stringify(payload, null, 2)} as const\n\nexport type IncidentDrill = typeof incidentDrill\n`,
  )
  await writeFile(reportPath, report.join('\n'))

  console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
  console.log(`Wrote ${path.relative(root, outputTsPath)}`)
  console.log(`Wrote ${path.relative(root, reportPath)}`)
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
