import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const codexOpsDir = path.join(root, 'ops', 'codex')
const workflowPath = path.join(root, '.github', 'workflows', 'autonomous-daily.yml')
const selfUpdateWorkflowPath = path.join(root, '.github', 'workflows', 'autonomous-self-update.yml')
const webDeployWorkflowPath = path.join(root, '.github', 'workflows', 'web-pwa-deploy.yml')
const postDeployEvidenceSyncWorkflowPath = path.join(root, '.github', 'workflows', 'post-deploy-evidence-sync.yml')
const publicEvidenceIntakeWorkflowPath = path.join(root, '.github', 'workflows', 'public-evidence-intake.yml')
const productionInputWatchWorkflowPath = path.join(root, '.github', 'workflows', 'production-input-watch.yml')
const outputJsonPath = path.join(dataDir, 'autonomous-cadence.json')
const outputTsPath = path.join(srcDataDir, 'autonomousCadence.ts')
const reportPath = path.join(reportsDir, 'autonomous-cadence-latest.md')
const codexAutomationManifestPath = path.join(codexOpsDir, 'autonomous-game-lab-daily-owner-loop.json')
const freshnessStaleAfterHours = 36
const generatedAt = new Date()

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalText = async (filePath, fallback = '') =>
  readFile(filePath, 'utf8').catch(() => fallback)
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const workflowHasIssueGuardedSecret = (workflow, name) =>
  workflow.includes(`${name}: \${{ github.event_name != 'issues' && secrets.${name} || '' }}`)

const toFixedNumber = (value, digits = 2) => Number(value.toFixed(digits))

const freshnessRequiredArtifacts = [
  {
    id: 'owner-loop',
    label: 'Owner loop decision',
    path: 'data/autonomous-owner-loop.json',
  },
  {
    id: 'operator',
    label: 'Operator execution',
    path: 'data/autonomous-operator.json',
  },
  {
    id: 'autonomous-self-update',
    label: 'Autonomous self-update',
    path: 'data/autonomous-self-update.json',
  },
  {
    id: 'production-readiness',
    label: 'Production readiness',
    path: 'data/production-readiness.json',
  },
  {
    id: 'deployment-plan',
    label: 'Deployment plan',
    path: 'data/deployment-plan.json',
  },
  {
    id: 'repository-readiness',
    label: 'Repository readiness',
    path: 'data/repository-readiness.json',
  },
  {
    id: 'repository-bootstrap',
    label: 'Repository bootstrap',
    path: 'data/repository-bootstrap.json',
  },
  {
    id: 'public-repo-security',
    label: 'Public repository security audit',
    path: 'data/public-repo-security-audit.json',
  },
  {
    id: 'production-bootstrap',
    label: 'Production bootstrap',
    path: 'data/production-bootstrap.json',
  },
  {
    id: 'production-activation',
    label: 'Production activation',
    path: 'data/production-activation.json',
  },
  {
    id: 'production-environment',
    label: 'Production environment',
    path: 'data/production-environment.json',
  },
  {
    id: 'event-collector-deployment',
    label: 'Event collector deployment',
    path: 'data/event-collector-deployment.json',
  },
  {
    id: 'event-collector-smoke',
    label: 'Event collector smoke',
    path: 'data/event-collector-smoke.json',
  },
  {
    id: 'local-event-bridge',
    label: 'Local event bridge',
    path: 'data/local-event-bridge.json',
  },
  {
    id: 'event-ingest',
    label: 'Event ingest',
    path: 'data/event-ingest.json',
  },
  {
    id: 'event-ingest-smoke',
    label: 'Event ingest smoke',
    path: 'data/event-ingest-smoke.json',
  },
  {
    id: 'analytics-rollup',
    label: 'Analytics rollup',
    path: 'data/analytics-rollup.json',
  },
  {
    id: 'experiment-results',
    label: 'Experiment results',
    path: 'data/experiment-results.json',
  },
  {
    id: 'growth-plan',
    label: 'Growth pages and organic routes',
    path: 'data/growth-plan.json',
  },
  {
    id: 'portfolio-policy',
    label: 'Portfolio traffic policy',
    path: 'data/portfolio-policy.json',
  },
  {
    id: 'traffic-seeding',
    label: 'Zero-spend traffic seeding',
    path: 'data/traffic-seeding.json',
  },
  {
    id: 'acquisition-learning',
    label: 'Acquisition learning',
    path: 'data/acquisition-learning.json',
  },
  {
    id: 'organic-seed-loop',
    label: 'Organic seed loop',
    path: 'data/organic-seed-loop.json',
  },
  {
    id: 'retention-loop',
    label: 'Retention loop',
    path: 'data/retention-loop.json',
  },
  {
    id: 'release-candidate',
    label: 'Release candidate',
    path: 'data/release-candidate.json',
  },
  {
    id: 'post-deploy-smoke',
    label: 'Post-deploy smoke',
    path: 'data/post-deploy-smoke.json',
  },
  {
    id: 'post-deploy-artifact-sync',
    label: 'Post-deploy artifact sync',
    path: 'data/post-deploy-artifact-sync.json',
  },
  {
    id: 'live-site-monitor',
    label: 'Continuous live site monitor',
    path: 'data/live-site-monitor.json',
  },
  {
    id: 'release-health',
    label: 'Release health guard',
    path: 'data/release-health.json',
  },
  {
    id: 'product-optimization',
    label: 'Product optimization',
    path: 'data/product-optimization.json',
  },
  {
    id: 'product-gate-recovery',
    label: 'Product gate recovery',
    path: 'data/product-gate-recovery.json',
  },
  {
    id: 'product-gate-sample-plan',
    label: 'Product gate sample plan',
    path: 'data/product-gate-sample-plan.json',
  },
  {
    id: 'player-evidence-watchdog',
    label: 'Player evidence watchdog',
    path: 'data/player-evidence-watchdog.json',
  },
  {
    id: 'completion-loop',
    label: 'Completion loop',
    path: 'data/completion-loop.json',
  },
  {
    id: 'replay-loop',
    label: 'Replay loop',
    path: 'data/replay-loop.json',
  },
  {
    id: 'first-move-coach',
    label: 'First move coach',
    path: 'data/first-move-coach.json',
  },
  {
    id: 'pwa-install-loop',
    label: 'PWA install loop',
    path: 'data/pwa-install-loop.json',
  },
  {
    id: 'applied-improvements',
    label: 'Applied improvements',
    path: 'data/applied-improvements.json',
  },
  {
    id: 'improvement-backlog',
    label: 'Improvement backlog',
    path: 'data/improvement-backlog-summary.json',
  },
  {
    id: 'improvement-routing',
    label: 'Improvement routing',
    path: 'data/improvement-routing.json',
  },
  {
    id: 'objective-audit',
    label: 'Objective audit',
    path: 'data/objective-audit.json',
  },
]

const readArtifactFreshness = async (artifact) => {
  const absolutePath = path.join(root, artifact.path)
  const raw = await readFile(absolutePath, 'utf8').catch(() => null)

  if (!raw) {
    return {
      ...artifact,
      status: 'missing',
      generatedAt: null,
      ageHours: null,
      staleAfterHours: freshnessStaleAfterHours,
      detail: `${artifact.path} is missing.`,
    }
  }

  let parsed

  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      ...artifact,
      status: 'invalid-json',
      generatedAt: null,
      ageHours: null,
      staleAfterHours: freshnessStaleAfterHours,
      detail: `${artifact.path} is not parseable JSON.`,
    }
  }

  const artifactGeneratedAt = typeof parsed.generatedAt === 'string' ? parsed.generatedAt : null
  const generatedAtMs = artifactGeneratedAt ? Date.parse(artifactGeneratedAt) : Number.NaN

  if (!Number.isFinite(generatedAtMs)) {
    return {
      ...artifact,
      status: 'missing-generated-at',
      generatedAt: artifactGeneratedAt,
      ageHours: null,
      staleAfterHours: freshnessStaleAfterHours,
      detail: `${artifact.path} does not publish a parseable generatedAt timestamp.`,
    }
  }

  const ageHours = toFixedNumber((generatedAt.getTime() - generatedAtMs) / (60 * 60 * 1000))
  const status =
    ageHours < -1 ? 'clock-skew' : ageHours <= freshnessStaleAfterHours ? 'fresh' : 'stale'

  return {
    ...artifact,
    status,
    generatedAt: artifactGeneratedAt,
    ageHours,
    staleAfterHours: freshnessStaleAfterHours,
    detail:
      status === 'fresh'
        ? `${artifact.path} is ${ageHours}h old.`
        : `${artifact.path} is ${status} at ${ageHours}h old.`,
  }
}

const parseTomlValue = (rawValue) => {
  const value = rawValue.trim()

  if (value.startsWith('[') && value.endsWith(']')) {
    return [...value.matchAll(/"([^"]*)"/g)].map((match) => match[1])
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replaceAll('\\"', '"')
  }

  if (/^\d+$/.test(value)) {
    return Number(value)
  }

  return value
}

const parseAutomationToml = (raw, filePath) => {
  const parsed = { filePath }

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)

    if (match) {
      parsed[match[1]] = parseTomlValue(match[2])
    }
  }

  return parsed
}

const loadCodexAutomations = async (automationsDir) => {
  if (!automationsDir || !(await exists(automationsDir))) {
    return []
  }

  const entries = await readdir(automationsDir, { withFileTypes: true }).catch(() => [])
  const automationFiles = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(automationsDir, entry.name, 'automation.toml'))

  return Promise.all(
    automationFiles.map(async (filePath) => {
      const raw = await readFile(filePath, 'utf8').catch(() => null)

      return raw ? parseAutomationToml(raw, filePath) : null
    }),
  ).then((items) => items.filter(Boolean))
}

const packageJson = await readJson(path.join(root, 'package.json'))
const workflow = await readOptionalText(workflowPath)
const selfUpdateWorkflow = await readOptionalText(selfUpdateWorkflowPath)
const webDeployWorkflow = await readOptionalText(webDeployWorkflowPath)
const postDeployEvidenceSyncWorkflow = await readOptionalText(postDeployEvidenceSyncWorkflowPath)
const publicEvidenceIntakeWorkflow = await readOptionalText(publicEvidenceIntakeWorkflowPath)
const productionInputWatchWorkflow = await readOptionalText(productionInputWatchWorkflowPath)
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  status: 'missing',
  workspace: {},
  repository: {},
})
const publicRepoSecurityAudit = await readOptionalJson(path.join(dataDir, 'public-repo-security-audit.json'), {
  status: 'missing',
  repository: {},
  summary: {},
  controls: {},
})
const playerEvidenceWatchdog = await readOptionalJson(path.join(dataDir, 'player-evidence-watchdog.json'), {
  status: 'missing',
  controls: {},
  publicRepoSecurity: {},
})
const ownerLoop = await readOptionalJson(path.join(dataDir, 'autonomous-owner-loop.json'), {
  status: 'missing',
  ownerDecision: {},
})
const artifactFreshness = await Promise.all(freshnessRequiredArtifacts.map(readArtifactFreshness))
const staleArtifacts = artifactFreshness.filter((artifact) => artifact.status !== 'fresh')
const artifactsWithAge = artifactFreshness.filter((artifact) => typeof artifact.ageHours === 'number')
const oldestAgeHours = artifactsWithAge.length
  ? Math.max(...artifactsWithAge.map((artifact) => artifact.ageHours))
  : null
const newestGeneratedAt = artifactsWithAge.length
  ? artifactsWithAge
      .map((artifact) => artifact.generatedAt)
      .filter(Boolean)
      .sort()
      .at(-1)
  : null
const oldestGeneratedAt = artifactsWithAge.length
  ? artifactsWithAge
      .map((artifact) => artifact.generatedAt)
      .filter(Boolean)
      .sort()
      .at(0)
  : null
const freshnessPolicy = {
  status: staleArtifacts.length ? 'stale-evidence' : 'fresh',
  staleAfterHours: freshnessStaleAfterHours,
  requiredArtifactCount: freshnessRequiredArtifacts.length,
  freshArtifactCount: artifactFreshness.filter((artifact) => artifact.status === 'fresh').length,
  staleArtifactCount: staleArtifacts.length,
  missingGeneratedAtCount: artifactFreshness.filter((artifact) => artifact.status === 'missing-generated-at').length,
  invalidArtifactCount: artifactFreshness.filter((artifact) =>
    ['missing', 'invalid-json', 'clock-skew'].includes(artifact.status),
  ).length,
  oldestAgeHours,
  latestGeneratedAt: newestGeneratedAt,
  oldestGeneratedAt,
  staleArtifactIds: staleArtifacts.map((artifact) => artifact.id),
}

const script = (name) => packageJson.scripts?.[name] ?? ''
const workflowExists = await exists(workflowPath)
const selfUpdateWorkflowExists = await exists(selfUpdateWorkflowPath)
const webDeployWorkflowExists = await exists(webDeployWorkflowPath)
const postDeployEvidenceSyncWorkflowExists = await exists(postDeployEvidenceSyncWorkflowPath)
const publicEvidenceIntakeWorkflowExists = await exists(publicEvidenceIntakeWorkflowPath)
const productionInputWatchWorkflowExists = await exists(productionInputWatchWorkflowPath)
const dailyScript = script('autonomous:daily')
const operateScript = script('autonomous:operate')
const afterActionScript = script('autonomous:after-action')
const cadenceScript = script('autonomous:cadence')
const selfUpdateScript = script('autonomous:self-update')
const securityAuditScript = script('autonomous:security-audit')
const playerEvidenceWatchdogScript = script('autonomous:player-evidence-watchdog')
const gateRecoveryScript = script('autonomous:gate-recovery')
const testAutomationScript = script('test:automation')
const testE2eScript = script('test:e2e')
const postDeployReadinessSyncScript = script('autonomous:post-deploy-readiness-sync')
const publicEvidenceIntakeScript = script('autonomous:public-evidence-intake')
const productionInputWatchScript = script('autonomous:production-input-watch')
const codexHome = process.env.CODEX_HOME?.trim() || (process.env.HOME ? path.join(process.env.HOME, '.codex') : null)
const codexAutomationsDir = codexHome ? path.join(codexHome, 'automations') : null
const codexAutomationStorageAvailable = Boolean(codexAutomationsDir && (await exists(codexAutomationsDir)))

const codexAutomationManifest = {
  id: 'autonomous-game-lab-daily-owner-loop',
  name: 'Autonomous Game Lab owner loop',
  kind: 'cron',
  status: 'active-declared',
  schedule: {
    rrule: 'FREQ=HOURLY;INTERVAL=12',
    timezone: 'local',
    cadence: 'twice-daily',
  },
  workspace: root,
  executionEnvironment: 'local',
  expectedPrompt:
    "Act as zero-spend production owner for the autonomous-game-lab PWA game portal. Inspect the current repository state, live GitHub Pages release, local generated evidence, and recent GitHub Actions runs. Run the repo's autonomous improvement pipeline, prioritize fixes or small improvements supported by available behavior/performance/evidence data, keep changes original and compliant, run the relevant verification commands, commit and push safe improvements, and trigger or confirm deployment when the deployment gate passes. Do not enable paid spend, store submission, revenue, external posting, or legal/account changes unless credentials and product gates already prove they are configured. Avoid paid services or paid APIs unless already configured by the owner. If external credentials, app-store accounts, tax/payment setup, or legal approval are required, record the blocker clearly and continue with the best no-cost development or evidence-gathering step.",
  verification: {
    source: 'codex-app-automation-card',
    lastKnownAutomationId: 'autonomous-game-lab-daily-owner-loop',
    repoManifestMirrorsExpectedSchedule: true,
  },
  guardrails: {
    zeroPaidSpend: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noExternalPosting: true,
    remoteGitHubMutationRequiresEvidenceAndExplicitGate: true,
  },
}

const codexAutomations = await loadCodexAutomations(codexAutomationsDir)
const installedCodexAutomation = codexAutomations.find((automation) => automation.id === codexAutomationManifest.id) ?? null
const automationUsesWorkspace = (automation) =>
  Array.isArray(automation?.cwds) ? automation.cwds.includes(root) : false
const automationLooksLikeOwnerLoop = (automation) => {
  const haystack = [automation.id, automation.name, automation.prompt].join(' ').toLowerCase()

  return (
    haystack.includes('autonomous game lab') ||
    haystack.includes('autonomous game portal') ||
    haystack.includes('autonomous production-owner loop') ||
    (haystack.includes('autonomous') && haystack.includes('owner loop'))
  )
}
const relatedCodexAutomations = codexAutomations.filter(
  (automation) =>
    automation.id !== codexAutomationManifest.id &&
    automationUsesWorkspace(automation) &&
    automationLooksLikeOwnerLoop(automation),
)
const relatedActiveCodexAutomations = relatedCodexAutomations.filter((automation) => automation.status === 'ACTIVE')
const installedCodexAutomationActive = installedCodexAutomation?.status === 'ACTIVE'
const installedCodexAutomationScheduleMatches = installedCodexAutomation?.rrule === codexAutomationManifest.schedule.rrule
const installedCodexAutomationWorkspaceMatches = automationUsesWorkspace(installedCodexAutomation)
const installedCodexAutomationPromptGuarded =
  String(installedCodexAutomation?.prompt ?? '').includes('zero-spend') &&
  String(installedCodexAutomation?.prompt ?? '').includes('Do not enable paid spend') &&
  String(installedCodexAutomation?.prompt ?? '').includes('product gates') &&
  String(installedCodexAutomation?.prompt ?? '').includes('commit')
const installedCodexAutomationEnvironmentMatches = installedCodexAutomation?.execution_environment === 'local'
const installedCodexAutomationConfirmed =
  installedCodexAutomationActive &&
  installedCodexAutomationScheduleMatches &&
  installedCodexAutomationWorkspaceMatches &&
  installedCodexAutomationPromptGuarded &&
  installedCodexAutomationEnvironmentMatches
const codexDesktopStatus = installedCodexAutomationConfirmed
  ? 'active-confirmed'
  : installedCodexAutomation
    ? 'installed-needs-attention'
    : codexAutomationStorageAvailable && !process.env.CI
      ? 'missing-local-automation'
      : 'active-declared-unverified'
const codexDesktopCheckRequired = codexAutomationStorageAvailable && !process.env.CI
const codexDesktopActual = {
  status: codexDesktopStatus,
  codexHome: codexHome ? path.basename(codexHome) : null,
  storageAvailable: codexAutomationStorageAvailable,
  path: installedCodexAutomation?.filePath
    ? path.relative(codexHome ?? root, installedCodexAutomation.filePath)
    : null,
  installedStatus: installedCodexAutomation?.status ?? null,
  rrule: installedCodexAutomation?.rrule ?? null,
  model: installedCodexAutomation?.model ?? null,
  reasoningEffort: installedCodexAutomation?.reasoning_effort ?? null,
  executionEnvironment: installedCodexAutomation?.execution_environment ?? null,
  workspaceMatches: installedCodexAutomationWorkspaceMatches,
  scheduleMatches: installedCodexAutomationScheduleMatches,
  promptGuardrailsPresent: installedCodexAutomationPromptGuarded,
  relatedActiveAutomationIds: relatedActiveCodexAutomations.map((automation) => automation.id),
  relatedAutomations: relatedCodexAutomations.map((automation) => ({
    id: automation.id,
    status: automation.status ?? null,
    rrule: automation.rrule ?? null,
  })),
}

const checks = [
  {
    id: 'codex-automation-manifest',
    status: codexAutomationManifest.status === 'active-declared' ? 'pass' : 'blocker',
    detail: `Codex app automation manifest declares ${codexAutomationManifest.id}.`,
  },
  {
    id: 'codex-automation-installed',
    status: installedCodexAutomationConfirmed || !codexDesktopCheckRequired ? 'pass' : 'blocker',
    detail: installedCodexAutomationConfirmed
      ? `Codex app automation ${codexAutomationManifest.id} is active, scheduled, local, and pointed at this workspace.`
      : installedCodexAutomation
        ? `Codex app automation ${codexAutomationManifest.id} is installed but needs attention (${codexDesktopStatus}).`
        : codexAutomationStorageAvailable
          ? `Codex app automation ${codexAutomationManifest.id} is not installed in local Codex automation storage.`
          : 'Codex automation storage is unavailable in this environment; GitHub Actions remains the CI scheduler.',
  },
  {
    id: 'codex-automation-single-active-owner-loop',
    status: relatedActiveCodexAutomations.length === 0 ? 'pass' : 'blocker',
    detail: relatedActiveCodexAutomations.length
      ? `Duplicate active owner-loop automation(s) share this workspace: ${relatedActiveCodexAutomations
          .map((automation) => automation.id)
          .join(', ')}.`
      : 'No duplicate active Codex owner-loop automations share this workspace.',
  },
  {
    id: 'local-operate-script',
    status:
      operateScript.includes('autonomous:daily') &&
      operateScript.includes('autonomous:operator -- --execute') &&
      operateScript.includes('autonomous:after-action') &&
      operateScript.includes('test:e2e') &&
      afterActionScript.includes('autonomous:owner-loop') &&
      afterActionScript.includes('npm run build') &&
      afterActionScript.includes('autonomous:gate-recovery') &&
      afterActionScript.includes('autonomous:release-candidate') &&
      afterActionScript.includes('autonomous:readiness') &&
      afterActionScript.includes('test:automation')
        ? 'pass'
        : 'blocker',
    detail: `autonomous:operate is ${operateScript || 'missing'}; autonomous:after-action is ${
      afterActionScript || 'missing'
    }.`,
  },
  {
    id: 'cadence-refresh-script',
    status: cadenceScript.includes('autonomous-cadence') ? 'pass' : 'blocker',
    detail: `autonomous:cadence is ${cadenceScript || 'missing'}.`,
  },
  {
    id: 'self-update-script',
    status: selfUpdateScript.includes('autonomous-self-update') ? 'pass' : 'blocker',
    detail: `autonomous:self-update is ${selfUpdateScript || 'missing'}.`,
  },
  {
    id: 'public-repo-security-audit',
    status:
      securityAuditScript.includes('public-repo-security-audit') &&
      publicRepoSecurityAudit.status === 'public-repo-security-ready' &&
      publicRepoSecurityAudit.repository?.isPublic === true &&
      publicRepoSecurityAudit.summary?.highConfidenceSecretFindings === 0 &&
      publicRepoSecurityAudit.summary?.trackedSensitiveFiles === 0 &&
      publicRepoSecurityAudit.summary?.publicWorkflowRisks === 0 &&
      publicRepoSecurityAudit.controls?.publicIssueTriggerSecretsBlocked === true &&
      publicRepoSecurityAudit.controls?.publicIssueTriggerCommitsBlocked === true &&
      publicRepoSecurityAudit.controls?.publicIssueWorkflowReadOnly === true &&
      publicRepoSecurityAudit.controls?.scheduledWriteJobIsolated === true &&
      dailyScript.includes('autonomous:security-audit') &&
      testAutomationScript.includes('autonomous:security-audit') &&
      publicEvidenceIntakeScript.includes('autonomous:security-audit') &&
      productionInputWatchScript.includes('autonomous:security-audit') &&
      postDeployReadinessSyncScript.includes('autonomous:security-audit')
        ? 'pass'
        : 'blocker',
    detail:
      publicRepoSecurityAudit.status === 'public-repo-security-ready'
        ? `Public repo security audit is ready for ${publicRepoSecurityAudit.repository?.target ?? 'repository'} with ${publicRepoSecurityAudit.summary?.publicWorkflowRisks ?? 'unknown'} workflow risks.`
        : `Public repo security audit is ${publicRepoSecurityAudit.status ?? 'missing'}.`,
  },
  {
    id: 'gate-recovery-script',
    status: gateRecoveryScript.includes('product-gate-recovery') ? 'pass' : 'blocker',
    detail: `autonomous:gate-recovery is ${gateRecoveryScript || 'missing'}.`,
  },
  {
    id: 'player-evidence-watchdog',
    status:
      playerEvidenceWatchdogScript.includes('player-evidence-watchdog') &&
      playerEvidenceWatchdog.status.startsWith('watchdog-') &&
      playerEvidenceWatchdog.controls?.zeroPaidSpend === true &&
      playerEvidenceWatchdog.controls?.noSyntheticEvents === true &&
      playerEvidenceWatchdog.controls?.noAutomaticDownloadsScan === true &&
      playerEvidenceWatchdog.controls?.downloadsScanRequiresExplicitOptIn === true &&
      playerEvidenceWatchdog.controls?.noRawPlayerEventsInPublicRepo === true &&
      playerEvidenceWatchdog.publicRepoSecurity?.safeForPublicAutomation === true &&
      dailyScript.includes('autonomous:player-evidence-watchdog') &&
      testAutomationScript.includes('autonomous:player-evidence-watchdog')
        ? 'pass'
        : 'blocker',
    detail:
      playerEvidenceWatchdog.status === 'missing'
        ? 'Player evidence watchdog artifact is missing.'
        : `Player evidence watchdog is ${playerEvidenceWatchdog.status}; explicit Downloads scan ready ${playerEvidenceWatchdog.downloadsScan?.readyForExplicitScan ?? false}.`,
  },
  {
    id: 'daily-loop-script',
    status:
      dailyScript.includes('autonomous:trend') &&
      dailyScript.includes('autonomous:gate-recovery') &&
      dailyScript.includes('autonomous:security-audit') &&
      dailyScript.includes('autonomous:player-evidence-watchdog') &&
      dailyScript.includes('autonomous:cadence') &&
      dailyScript.includes('autonomous:self-update') &&
      dailyScript.includes('autonomous:objective-audit') &&
      dailyScript.includes('test:automation')
        ? 'pass'
        : 'blocker',
    detail: 'autonomous:daily regenerates game, analytics, readiness, cadence, audit, and automation evidence.',
  },
  {
    id: 'automation-verifier',
    status:
      testAutomationScript.includes('event-collector-smoke') &&
      testAutomationScript.includes('autonomous:security-audit') &&
      testAutomationScript.includes('autonomous:player-evidence-watchdog') &&
      testAutomationScript.includes('event-ingest-smoke') &&
      testAutomationScript.includes('autonomous:release-candidate') &&
      testAutomationScript.includes('autonomous:repo-readiness') &&
      testAutomationScript.includes('autonomous:repo-bootstrap') &&
      testAutomationScript.includes('autonomous:deploy-plan') &&
      testAutomationScript.includes('autonomous:bootstrap') &&
      testAutomationScript.includes('autonomous:activate-production') &&
      testAutomationScript.includes('autonomous:post-deploy-smoke') &&
      testAutomationScript.includes('autonomous:readiness') &&
      testAutomationScript.includes('verify-autonomy')
        ? 'pass'
        : 'blocker',
    detail: `test:automation is ${testAutomationScript || 'missing'}.`,
  },
  {
    id: 'browser-smoke',
    status: testE2eScript.includes('playwright test') ? 'pass' : 'blocker',
    detail: `test:e2e is ${testE2eScript || 'missing'}.`,
  },
  {
    id: 'fresh-generated-evidence',
    status: freshnessPolicy.status === 'fresh' ? 'pass' : 'blocker',
    detail: staleArtifacts.length
      ? `Stale or invalid generated artifact evidence: ${staleArtifacts
          .map((artifact) => `${artifact.id} (${artifact.status})`)
          .join(', ')}.`
      : `All ${freshnessPolicy.requiredArtifactCount} required generated evidence artifacts are fresh within ${freshnessPolicy.staleAfterHours}h.`,
  },
  {
    id: 'github-scheduled-workflow',
    status:
      workflowExists &&
      workflow.includes('schedule:') &&
      workflow.includes('workflow_dispatch:') &&
      workflow.includes('npm run autonomous:operate') &&
      workflow.includes('actions/upload-artifact')
        ? 'pass'
        : 'blocker',
    detail: workflowExists
      ? 'GitHub Actions daily workflow can run the full autonomous owner loop and upload evidence artifacts.'
      : 'Autonomous daily GitHub workflow is missing.',
  },
  {
    id: 'github-self-update-workflow',
    status:
      selfUpdateWorkflowExists &&
      selfUpdateWorkflow.includes("workflows: ['Autonomous Daily Studio']") &&
      selfUpdateWorkflow.includes('Wait for post-deploy evidence sync') &&
      selfUpdateWorkflow.includes('Post-Deploy Evidence Sync') &&
      selfUpdateWorkflow.includes('gh run list') &&
      selfUpdateWorkflow.includes('git pull --ff-only origin') &&
      selfUpdateWorkflow.includes("vars.AGL_AUTONOMOUS_SELF_UPDATE == '1'") &&
      selfUpdateWorkflow.includes('actions: read') &&
      selfUpdateWorkflow.includes('contents: write') &&
      selfUpdateWorkflow.includes('npm run autonomous:self-update -- --assert-safe') &&
      !selfUpdateWorkflow.includes('fs.existsSync(filePath)') &&
      selfUpdateWorkflow.includes('GITHUB_TOKEN: ${{ github.token }}') &&
      selfUpdateWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}') &&
      selfUpdateWorkflow.includes('AGL_ANDROID_KEYSTORE_BASE64') &&
      selfUpdateWorkflow.includes('AGL_ANDROID_SHA256_CERT_FINGERPRINT') &&
      selfUpdateWorkflow.includes('VITE_BASE_PATH') &&
      selfUpdateWorkflow.includes('AGL_PUBLIC_ORIGIN')
        ? 'pass'
        : 'blocker',
    detail: selfUpdateWorkflowExists
      ? 'Gated GitHub workflow can persist allowlisted verified generated changes after daily runs once matching post-deploy evidence sync is complete, with production env and workflow token evidence when explicitly enabled.'
      : 'Autonomous self-update GitHub workflow is missing.',
  },
  {
    id: 'post-self-update-deploy',
    status:
      webDeployWorkflowExists &&
      webDeployWorkflow.includes("'Autonomous Daily Studio'") &&
      webDeployWorkflow.includes("'Autonomous Self Update'") &&
      webDeployWorkflow.includes("'Public Evidence Intake'") &&
      webDeployWorkflow.includes("'Production Input Watch'") &&
      webDeployWorkflow.includes('npm run build') &&
      webDeployWorkflow.includes('npm run autonomous:performance') &&
      webDeployWorkflow.includes('npm run autonomous:release-candidate') &&
      webDeployWorkflow.includes('npm run autonomous:assert-deployable') &&
      webDeployWorkflow.includes('npm run autonomous:post-deploy-smoke -- --assert') &&
      !webDeployWorkflow.includes('npm run autonomous:operate')
        ? 'pass'
        : 'blocker',
    detail: webDeployWorkflowExists
      ? 'Pages deployment builds the committed PWA artifact from gated self-update, public-evidence, and production-input workflows, so persisted generated improvements can publish without manual dispatch.'
      : 'Web PWA deploy workflow is missing.',
  },
  {
    id: 'production-input-watch-workflow',
    status:
      productionInputWatchWorkflowExists &&
      productionInputWatchWorkflow.includes('workflow_dispatch:') &&
      productionInputWatchWorkflow.includes('schedule:') &&
      productionInputWatchWorkflow.includes('contents: write') &&
      productionInputWatchWorkflow.includes('actions: read') &&
      productionInputWatchWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE }}') &&
      productionInputWatchWorkflow.includes(
        'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}',
      ) &&
      productionInputWatchWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT') &&
      productionInputWatchWorkflow.includes('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}') &&
      productionInputWatchWorkflow.includes('POSTHOG_PERSONAL_API_KEY: ${{ secrets.POSTHOG_PERSONAL_API_KEY }}') &&
      productionInputWatchWorkflow.includes('VITE_EVENT_COLLECTOR_WRITE_TOKEN: ${{ secrets.VITE_EVENT_COLLECTOR_WRITE_TOKEN }}') &&
      productionInputWatchWorkflow.includes('npm run autonomous:production-input-watch') &&
      productionInputWatchWorkflow.includes('node scripts/verify-autonomy.mjs') &&
      productionInputWatchWorkflow.includes('data/production-environment.json') &&
      productionInputWatchWorkflow.includes('reports/production-environment-latest.md') &&
      productionInputWatchWorkflow.includes('ops/production.env.example') &&
      productionInputWatchWorkflow.includes('data/production-blocker-handoff.json') &&
      productionInputWatchWorkflow.includes('data/production-unlock-runner.json') &&
      productionInputWatchWorkflow.includes('data/production-measurement-status.json') &&
      productionInputWatchWorkflow.includes('public/measurement-status.json') &&
      productionInputWatchWorkflow.includes('data/release-candidate.json') &&
      productionInputWatchScript.includes('npm run build') &&
      productionInputWatchScript.includes('autonomous:performance') &&
      productionInputWatchScript.includes('autonomous:release-candidate') &&
      productionInputWatchScript.includes('autonomous:env') &&
      productionInputWatchScript.includes('autonomous:bootstrap') &&
      productionInputWatchScript.includes('autonomous:activate-production') &&
      productionInputWatchScript.includes('autonomous:readiness') &&
      productionInputWatchScript.includes('autonomous:owner-loop') &&
      productionInputWatchScript.includes('autonomous:operator') &&
      !productionInputWatchWorkflow.includes('gh workflow run') &&
      !productionInputWatchWorkflow.includes('data/player-events') &&
      !productionInputWatchWorkflow.includes('curl ')
        ? 'pass'
        : 'blocker',
    detail: productionInputWatchWorkflowExists
      ? 'Production input watch refreshes production environment, deploy/readiness evidence, unlock follow-ups, and measurement status after owner-provided repository variables or secrets, gates direct commits, and avoids workflow dispatch or raw event storage.'
      : 'Production input watch GitHub workflow is missing.',
  },
  {
    id: 'public-evidence-intake-workflow',
    status:
      publicEvidenceIntakeWorkflowExists &&
      publicEvidenceIntakeWorkflow.includes('workflow_dispatch:') &&
      publicEvidenceIntakeWorkflow.includes('issues:') &&
      publicEvidenceIntakeWorkflow.includes('schedule:') &&
      publicEvidenceIntakeWorkflow.includes('permissions:\n  actions: read\n  contents: read\n  issues: read') &&
      publicEvidenceIntakeWorkflow.includes('issues: read') &&
      publicEvidenceIntakeWorkflow.includes('commit-public-evidence:') &&
      publicEvidenceIntakeWorkflow.includes("if: github.event_name != 'issues' && vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT == '1'") &&
      publicEvidenceIntakeWorkflow.includes('actions/download-artifact@v4') &&
      publicEvidenceIntakeWorkflow.includes('contents: write') &&
      publicEvidenceIntakeWorkflow.includes('GH_TOKEN: ${{ github.token }}') &&
      publicEvidenceIntakeWorkflow.includes('GITHUB_TOKEN: ${{ github.token }}') &&
      publicEvidenceIntakeWorkflow.includes('AGL_SUPPORT_EMAIL: ${{ vars.AGL_SUPPORT_EMAIL }}') &&
      workflowHasIssueGuardedSecret(publicEvidenceIntakeWorkflow, 'CLOUDFLARE_API_TOKEN') &&
      workflowHasIssueGuardedSecret(publicEvidenceIntakeWorkflow, 'AGL_EVENT_COLLECTOR_ADMIN_TOKEN') &&
      workflowHasIssueGuardedSecret(publicEvidenceIntakeWorkflow, 'POSTHOG_PERSONAL_API_KEY') &&
      workflowHasIssueGuardedSecret(publicEvidenceIntakeWorkflow, 'VITE_EVENT_COLLECTOR_WRITE_TOKEN') &&
      workflowHasIssueGuardedSecret(publicEvidenceIntakeWorkflow, 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON') &&
      workflowHasIssueGuardedSecret(publicEvidenceIntakeWorkflow, 'AGL_ANDROID_KEYSTORE_PASSWORD') &&
      publicEvidenceIntakeWorkflow.includes('VITE_ADSENSE_CLIENT_ID: ${{ vars.VITE_ADSENSE_CLIENT_ID }}') &&
      publicEvidenceIntakeWorkflow.includes('ADMOB_PUBLISHER_ID: ${{ vars.ADMOB_PUBLISHER_ID }}') &&
      publicEvidenceIntakeWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE }}') &&
      publicEvidenceIntakeWorkflow.includes(
        'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}',
      ) &&
      publicEvidenceIntakeWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT') &&
      publicEvidenceIntakeWorkflow.includes('npm run autonomous:public-evidence-intake') &&
      publicEvidenceIntakeWorkflow.includes('node scripts/verify-autonomy.mjs') &&
      publicEvidenceIntakeWorkflow.includes('data/support-feedback.json') &&
      publicEvidenceIntakeWorkflow.includes('public/measurement-status.json') &&
      publicEvidenceIntakeWorkflow.includes('data/production-environment.json') &&
      publicEvidenceIntakeWorkflow.includes('reports/production-environment-latest.md') &&
      publicEvidenceIntakeWorkflow.includes('ops/production.env.example') &&
      publicEvidenceIntakeScript.includes('autonomous:support-feedback') &&
      publicEvidenceIntakeScript.includes('autonomous:measurement-status') &&
      publicEvidenceIntakeScript.includes('autonomous:owner-loop') &&
      publicEvidenceIntakeScript.includes('autonomous:operator') &&
      !publicEvidenceIntakeWorkflow.includes('data/player-events') &&
      !publicEvidenceIntakeWorkflow.includes('gh issue comment') &&
      !publicEvidenceIntakeWorkflow.includes('gh issue edit') &&
      !publicEvidenceIntakeWorkflow.includes('curl ') &&
      !publicEvidenceIntakeWorkflow.includes('workflow run')
        ? 'pass'
        : 'blocker',
    detail: publicEvidenceIntakeWorkflowExists
      ? 'Public evidence intake ingests read-only GitHub Issues with read-only repository permissions, blocks production secrets on issue-triggered runs, moves direct commits into a scheduled/maintainer-only write job, refreshes safe aggregate handoff evidence, and avoids raw events or issue mutation.'
      : 'Public evidence intake GitHub workflow is missing.',
  },
  {
    id: 'post-deploy-evidence-sync-workflow',
    status:
      postDeployEvidenceSyncWorkflowExists &&
      postDeployEvidenceSyncWorkflow.includes("workflows: ['Web PWA Deploy']") &&
      postDeployEvidenceSyncWorkflow.includes('actions: read') &&
      postDeployEvidenceSyncWorkflow.includes('contents: write') &&
      postDeployEvidenceSyncWorkflow.includes('autonomous:post-deploy-artifact-sync') &&
      postDeployEvidenceSyncWorkflow.includes('autonomous:live-monitor') &&
      postDeployEvidenceSyncWorkflow.includes('autonomous:post-deploy-readiness-sync') &&
      postDeployEvidenceSyncWorkflow.includes('GH_TOKEN: ${{ github.token }}') &&
      postDeployEvidenceSyncWorkflow.includes('GITHUB_REPOSITORY: ${{ github.repository }}') &&
      postDeployEvidenceSyncWorkflow.includes('GITHUB_TOKEN: ${{ github.token }}') &&
      postDeployEvidenceSyncWorkflow.includes('AGL_PUBLIC_ORIGIN: ${{ vars.AGL_PUBLIC_ORIGIN }}') &&
      postDeployEvidenceSyncWorkflow.includes('AGL_SUPPORT_EMAIL: ${{ vars.AGL_SUPPORT_EMAIL }}') &&
      postDeployEvidenceSyncWorkflow.includes('AGL_EVENT_COLLECTOR_ADMIN_TOKEN: ${{ secrets.AGL_EVENT_COLLECTOR_ADMIN_TOKEN }}') &&
      postDeployEvidenceSyncWorkflow.includes('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}') &&
      postDeployEvidenceSyncWorkflow.includes('POSTHOG_PERSONAL_API_KEY: ${{ secrets.POSTHOG_PERSONAL_API_KEY }}') &&
      postDeployEvidenceSyncWorkflow.includes('VITE_EVENT_COLLECTOR_WRITE_TOKEN: ${{ secrets.VITE_EVENT_COLLECTOR_WRITE_TOKEN }}') &&
      postDeployEvidenceSyncWorkflow.includes('VITE_ADSENSE_CLIENT_ID: ${{ vars.VITE_ADSENSE_CLIENT_ID }}') &&
      postDeployEvidenceSyncWorkflow.includes('ADMOB_PUBLISHER_ID: ${{ vars.ADMOB_PUBLISHER_ID }}') &&
      postDeployEvidenceSyncWorkflow.includes('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}') &&
      postDeployEvidenceSyncWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE }}') &&
      postDeployEvidenceSyncWorkflow.includes(
        'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}',
      ) &&
      postDeployReadinessSyncScript.includes('npm run build') &&
      postDeployReadinessSyncScript.includes('autonomous:env') &&
      postDeployReadinessSyncScript.includes('autonomous:store-package') &&
      postDeployReadinessSyncScript.includes('autonomous:store-assets') &&
      postDeployReadinessSyncScript.includes('autonomous:pwa-install') &&
      postDeployReadinessSyncScript.includes('autonomous:store-listing-optimize') &&
      postDeployReadinessSyncScript.includes('autonomous:store-compliance') &&
      postDeployReadinessSyncScript.includes('autonomous:performance') &&
      postDeployReadinessSyncScript.includes('autonomous:release-candidate') &&
      postDeployReadinessSyncScript.includes('autonomous:post-deploy-smoke') &&
      postDeployReadinessSyncScript.includes('autonomous:live-monitor') &&
      postDeployReadinessSyncScript.includes('autonomous:repo-readiness') &&
      postDeployReadinessSyncScript.includes('autonomous:repo-bootstrap') &&
      postDeployReadinessSyncScript.includes('autonomous:deploy-plan') &&
      postDeployReadinessSyncScript.includes('autonomous:bootstrap') &&
      postDeployReadinessSyncScript.includes('autonomous:activate-production') &&
      postDeployReadinessSyncScript.includes('node scripts/production-readiness.mjs') &&
      postDeployReadinessSyncScript.includes('autonomous:owner-loop') &&
      postDeployReadinessSyncScript.includes('autonomous:operator') &&
      postDeployReadinessSyncScript.includes('autonomous:objective-audit') &&
      postDeployEvidenceSyncWorkflow.includes('npm run autonomous:verify-post-deploy-sync') &&
      postDeployEvidenceSyncWorkflow.includes('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT') &&
      postDeployEvidenceSyncWorkflow.includes('data/post-deploy-artifact-sync.json') &&
      postDeployEvidenceSyncWorkflow.includes('src/data/postDeployArtifactSync.ts') &&
      postDeployEvidenceSyncWorkflow.includes('reports/post-deploy-artifact-sync-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('data/performance-budget.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/release-candidate.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/pwa-install-loop.json') &&
      postDeployEvidenceSyncWorkflow.includes('src/data/pwaInstallLoop.ts') &&
      postDeployEvidenceSyncWorkflow.includes('reports/pwa-install-loop-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('public/install.html') &&
      postDeployEvidenceSyncWorkflow.includes('data/store-package.json') &&
      postDeployEvidenceSyncWorkflow.includes('reports/store-package-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('public/privacy.html') &&
      postDeployEvidenceSyncWorkflow.includes('public/support.html') &&
      postDeployEvidenceSyncWorkflow.includes('public/compliance.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/store-assets.json') &&
      postDeployEvidenceSyncWorkflow.includes('src/data/storeAssets.ts') &&
      postDeployEvidenceSyncWorkflow.includes('reports/store-assets-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('public/store-assets/screenshots') &&
      postDeployEvidenceSyncWorkflow.includes('data/store-listing-optimizer.json') &&
      postDeployEvidenceSyncWorkflow.includes('src/data/storeListingOptimizer.ts') &&
      postDeployEvidenceSyncWorkflow.includes('reports/store-listing-optimizer-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('data/store-compliance.json') &&
      postDeployEvidenceSyncWorkflow.includes('src/data/storeCompliance.ts') &&
      postDeployEvidenceSyncWorkflow.includes('reports/store-compliance-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('data/post-deploy-smoke.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/live-site-monitor.json') &&
      postDeployEvidenceSyncWorkflow.includes('src/data/liveSiteMonitor.ts') &&
      postDeployEvidenceSyncWorkflow.includes('reports/live-site-monitor-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('data/repository-readiness.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/repository-bootstrap.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/deployment-plan.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/production-environment.json') &&
      postDeployEvidenceSyncWorkflow.includes('reports/production-environment-latest.md') &&
      postDeployEvidenceSyncWorkflow.includes('ops/production.env.example') &&
      postDeployEvidenceSyncWorkflow.includes('data/production-bootstrap.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/production-activation.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/production-blocker-handoff.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/production-readiness.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/objective-audit.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/autonomous-operator.json') &&
      postDeployEvidenceSyncWorkflow.includes('data/autonomous-owner-loop.json') &&
      !postDeployEvidenceSyncWorkflow.includes('npm run build') &&
      !postDeployEvidenceSyncWorkflow.includes('autonomous:release-candidate') &&
      !postDeployEvidenceSyncWorkflow.includes('autonomous:post-deploy-smoke')
        ? 'pass'
        : 'blocker',
    detail: postDeployEvidenceSyncWorkflowExists
      ? 'Post-deploy evidence sync imports strict Pages smoke evidence, refreshes PWA/store dependencies and downstream readiness, and avoids direct workflow mutation.'
      : 'Post-deploy evidence sync workflow is missing.',
  },
  {
    id: 'zero-spend-operation',
    status: 'pass',
    detail: 'Cadence is local/CI execution only; it does not enable paid spend, stores, ads, or revenue.',
  },
]

const blockers = checks.filter((check) => check.status !== 'pass').map((check) => `${check.id}: ${check.detail}`)
const status = blockers.length ? 'cadence-needs-attention' : 'cadence-ready'

const payload = {
  generatedAt: generatedAt.toISOString(),
  status,
  cadence: 'twice-daily-local-daily-ci',
  workspace: {
    path: root,
    repositoryStatus: repositoryReadiness.status,
    repository: repositoryReadiness.repository?.target ?? null,
    gitDirtyFiles: repositoryReadiness.workspace?.dirtyFiles ?? null,
  },
  schedulers: {
    codexDesktop: {
      ...codexAutomationManifest,
      status: codexDesktopStatus,
      declaredStatus: codexAutomationManifest.status,
      actual: codexDesktopActual,
    },
    githubActions: {
      status:
        checks.find((check) => check.id === 'github-scheduled-workflow')?.status === 'pass'
          ? 'scheduled'
          : 'missing',
      workflow: '.github/workflows/autonomous-daily.yml',
      cron: "17 3 * * *",
      command: 'npm run autonomous:operate',
      dispatch: true,
      permissions: 'contents: read',
      artifactUpload: true,
    },
    githubSelfUpdate: {
      status:
        checks.find((check) => check.id === 'github-self-update-workflow')?.status === 'pass'
          ? 'gated'
          : 'missing',
      workflow: '.github/workflows/autonomous-self-update.yml',
      trigger: 'workflow_run: Autonomous Daily Studio; waits for Post-Deploy Evidence Sync',
      permission: 'actions: read, contents: write',
      enabledByRepositoryVariable: 'AGL_AUTONOMOUS_SELF_UPDATE=1',
      directPushRequiresRepositoryVariable: 'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1',
      followedByDeployWorkflow: '.github/workflows/web-pwa-deploy.yml',
    },
    githubPostSelfUpdateDeploy: {
      status:
        checks.find((check) => check.id === 'post-self-update-deploy')?.status === 'pass'
          ? 'scheduled'
          : 'missing',
      workflow: '.github/workflows/web-pwa-deploy.yml',
      trigger: 'workflow_run: Autonomous Self Update, Public Evidence Intake, Production Input Watch',
      deployabilityGate: 'npm run autonomous:assert-deployable',
      smokeGate: 'npm run autonomous:post-deploy-smoke -- --assert',
    },
    githubProductionInputWatch: {
      status:
        checks.find((check) => check.id === 'production-input-watch-workflow')?.status === 'pass'
          ? 'scheduled'
          : 'missing',
      workflow: '.github/workflows/production-input-watch.yml',
      trigger: 'workflow_dispatch, schedule: every 12 hours',
      permission: 'actions: read, contents: write, issues: read',
      command: 'npm run autonomous:production-input-watch',
      verificationGate: 'node scripts/verify-autonomy.mjs',
      directPushRequiresRepositoryVariable: 'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1',
      followedByDeployWorkflow: '.github/workflows/web-pwa-deploy.yml',
      watchedInputs: [
        'VITE_EVENT_COLLECTOR_URL',
        'VITE_EVENT_COLLECTOR_WRITE_TOKEN',
        'AGL_EVENT_COLLECTOR_EXPORT_URL',
        'CLOUDFLARE_API_TOKEN',
        'VITE_POSTHOG_KEY',
        'POSTHOG_PERSONAL_API_KEY',
        'AGL_SUPPORT_EMAIL',
        'ADMOB_PUBLISHER_ID',
        'AGL_ANDROID_KEYSTORE_BASE64',
      ],
    },
    githubPublicEvidenceIntake: {
      status:
        checks.find((check) => check.id === 'public-evidence-intake-workflow')?.status === 'pass'
          ? 'scheduled'
          : 'missing',
      workflow: '.github/workflows/public-evidence-intake.yml',
      trigger: 'issues, workflow_dispatch, schedule: every 6 hours',
      permission: 'issues: read, contents: read; scheduled commit job contents: write',
      command: 'npm run autonomous:public-evidence-intake',
      verificationGate: 'node scripts/verify-autonomy.mjs',
      directPushRequiresRepositoryVariable: 'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1',
      followedByDeployWorkflow: '.github/workflows/web-pwa-deploy.yml',
      publicIssueTriggerSecretsBlocked: true,
      publicIssueTriggerCommitsBlocked: true,
      publicRepoSecurityAudit: publicRepoSecurityAudit.status,
    },
    githubPostDeployEvidenceSync: {
      status:
        checks.find((check) => check.id === 'post-deploy-evidence-sync-workflow')?.status === 'pass'
          ? 'gated'
          : 'missing',
      workflow: '.github/workflows/post-deploy-evidence-sync.yml',
      trigger: 'workflow_run: Web PWA Deploy',
      permission: 'actions: read, contents: write',
      evidenceGate: 'npm run autonomous:post-deploy-artifact-sync -- --assert',
      releaseRefreshPolicy: 'disabled-after-deploy-to-preserve-live-artifact-evidence',
      verificationGate: 'npm run autonomous:verify-post-deploy-sync',
      directPushRequiresRepositoryVariable: 'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1',
    },
  },
  commandPlan: {
    operate: 'npm run autonomous:operate',
    daily: 'npm run autonomous:daily',
    executeOneLocalAction: 'npm run autonomous:operator -- --execute',
    afterAction: 'npm run autonomous:after-action',
    selfUpdate: 'npm run autonomous:self-update',
    verifyAutomation: 'npm run test:automation',
    browserSmoke: 'npm run test:e2e',
    ownerDecision: ownerLoop.ownerDecision?.nextBestActionId ?? null,
  },
  recoveryPolicy: {
    stopOnFailure: true,
    preserveArtifacts: true,
    commitOnlyAfterVerification: true,
    neverEnablePaidSpendOnRecovery: true,
    neverDispatchExternalWorkflowsOnRecovery: true,
    reportBlockersInsteadOfGuessing: true,
    selfUpdateRequiresVerification: true,
  },
  freshnessPolicy,
  artifactFreshness,
  controls: {
    zeroPaidSpend: true,
    localLoopCanRunWithoutExternalAccounts: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noPaidAcquisition: true,
    noExternalPosting: true,
    scheduledLocalActionExecution: true,
    scheduledExecutionUsesOperatorAllowlist: true,
    postActionBuildRefresh: true,
    postActionVerification: true,
    remoteMutationRequiresRepositoryEvidence: true,
    codexAutomationExpectedActive: true,
    codexAutomationActualStatusAudited: true,
    staleEvidenceBlocksUnattendedTrust: true,
    githubWorkflowReadOnlyByDefault: true,
    selfUpdateWorkflowWritePermissionGated: true,
    productionInputWatchWritePermissionGated: true,
    publicEvidenceIntakeWritePermissionGated: true,
    publicRepoSecurityAuditBlocksPublicRisk: true,
    postDeployEvidenceSyncWritePermissionGated: true,
    selfUpdateStagesAllowlistedGeneratedFilesOnly: true,
  },
  checks,
  blockers,
  nextActions: [
    blockers.length
      ? 'Fix cadence blockers before relying on unattended operation.'
      : 'Let the daily Codex automation run the local owner loop and keep the GitHub scheduled workflow as CI evidence.',
    'Keep repository, deployment, revenue, and store actions gated by their existing evidence checks.',
  ],
}
const appPayload = {
  status: payload.status,
  schedulers: {
    codexDesktop: {
      status: payload.schedulers.codexDesktop.status,
    },
    githubActions: {
      status: payload.schedulers.githubActions.status,
    },
  },
  commandPlan: {
    operate: payload.commandPlan.operate,
    executeOneLocalAction: payload.commandPlan.executeOneLocalAction,
    afterAction: payload.commandPlan.afterAction,
  },
  freshness: {
    status: payload.freshnessPolicy.status,
    staleArtifacts: payload.freshnessPolicy.staleArtifactCount,
    oldestAgeHours: payload.freshnessPolicy.oldestAgeHours,
    staleAfterHours: payload.freshnessPolicy.staleAfterHours,
  },
}

const report = [
  '# Autonomous Cadence',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Cadence: ${payload.cadence}`,
  '',
  '## Schedulers',
  '',
  `- Codex app: ${payload.schedulers.codexDesktop.status} (${payload.schedulers.codexDesktop.id})`,
  `- Codex app actual: ${payload.schedulers.codexDesktop.actual.installedStatus ?? 'unverified'}; schedule matches ${
    payload.schedulers.codexDesktop.actual.scheduleMatches
  }; workspace matches ${payload.schedulers.codexDesktop.actual.workspaceMatches}`,
  `- GitHub Actions: ${payload.schedulers.githubActions.status} (${payload.schedulers.githubActions.cron})`,
  `- GitHub self-update: ${payload.schedulers.githubSelfUpdate.status} (${payload.schedulers.githubSelfUpdate.workflow})`,
  `- GitHub post-self-update deploy: ${payload.schedulers.githubPostSelfUpdateDeploy.status} (${payload.schedulers.githubPostSelfUpdateDeploy.workflow})`,
  `- GitHub production input watch: ${payload.schedulers.githubProductionInputWatch.status} (${payload.schedulers.githubProductionInputWatch.workflow})`,
  `- GitHub public evidence intake: ${payload.schedulers.githubPublicEvidenceIntake.status} (${payload.schedulers.githubPublicEvidenceIntake.workflow})`,
  `- GitHub post-deploy evidence sync: ${payload.schedulers.githubPostDeployEvidenceSync.status} (${payload.schedulers.githubPostDeployEvidenceSync.workflow})`,
  '',
  '## Commands',
  '',
  `- Operate: ${payload.commandPlan.operate}`,
  `- Execute one local action: ${payload.commandPlan.executeOneLocalAction}`,
  `- After action: ${payload.commandPlan.afterAction}`,
  `- Daily: ${payload.commandPlan.daily}`,
  `- Self-update: ${payload.commandPlan.selfUpdate}`,
  `- Automation verify: ${payload.commandPlan.verifyAutomation}`,
  `- Browser smoke: ${payload.commandPlan.browserSmoke}`,
  '',
  '## Freshness',
  '',
  `- Status: ${payload.freshnessPolicy.status}`,
  `- Required artifacts: ${payload.freshnessPolicy.requiredArtifactCount}`,
  `- Fresh artifacts: ${payload.freshnessPolicy.freshArtifactCount}`,
  `- Stale/invalid artifacts: ${payload.freshnessPolicy.staleArtifactCount}`,
  `- Stale after: ${payload.freshnessPolicy.staleAfterHours}h`,
  `- Oldest age: ${payload.freshnessPolicy.oldestAgeHours ?? 'unknown'}h`,
  '',
  ...payload.artifactFreshness.map(
    (artifact) => `- ${artifact.status}: ${artifact.id} - ${artifact.detail}`,
  ),
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Blockers',
  '',
  ...(payload.blockers.length ? payload.blockers.map((blocker) => `- ${blocker}`) : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(codexOpsDir, { recursive: true })
await writeFile(codexAutomationManifestPath, JSON.stringify(codexAutomationManifest, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const autonomousCadence = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type AutonomousCadence = typeof autonomousCadence\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, codexAutomationManifestPath)}`)
console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
