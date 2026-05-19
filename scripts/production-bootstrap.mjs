import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const srcDataDir = path.join(root, 'src', 'data')
const reportsDir = path.join(root, 'reports')
const opsGithubDir = path.join(root, 'ops', 'github')

const environmentPath = path.join(dataDir, 'production-environment.json')
const repositoryReadinessPath = path.join(dataDir, 'repository-readiness.json')
const repositoryBootstrapPath = path.join(dataDir, 'repository-bootstrap.json')
const deploymentPath = path.join(dataDir, 'deployment-plan.json')
const collectorPath = path.join(dataDir, 'event-collector-deployment.json')
const storeCompliancePath = path.join(dataDir, 'store-compliance.json')
const nativePackagePath = path.join(dataDir, 'native-package.json')
const androidReleasePath = path.join(dataDir, 'android-release.json')
const monetizationPath = path.join(dataDir, 'monetization-plan.json')
const unitEconomicsPath = path.join(dataDir, 'unit-economics.json')
const outputJsonPath = path.join(dataDir, 'production-bootstrap.json')
const outputTsPath = path.join(srcDataDir, 'productionBootstrap.ts')
const reportPath = path.join(reportsDir, 'production-bootstrap-latest.md')
const setupScriptPath = path.join(opsGithubDir, 'setup-production.sh')
const setupReadmePath = path.join(opsGithubDir, 'README.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const configured = (value) => typeof value === 'string' && value.trim().length > 0

const environment = await readJson(environmentPath)
const repositoryReadiness = await readOptionalJson(repositoryReadinessPath, {
  status: 'missing',
  repository: {},
  githubAutomation: {},
  workspace: {},
  blockers: ['Run npm run autonomous:repo-readiness to inspect repository deployment channel readiness.'],
})
const repositoryBootstrap = await readOptionalJson(repositoryBootstrapPath, {
  status: 'missing',
  mode: 'missing',
  workspace: { after: {} },
  repository: {},
  controls: {},
  helper: {},
  blockers: ['Run npm run autonomous:repo-bootstrap to prepare repository bootstrap handoff.'],
})
const deployment = await readJson(deploymentPath)
const collector = await readJson(collectorPath)
const storeCompliance = await readJson(storeCompliancePath)
const nativePackage = await readJson(nativePackagePath)
const androidRelease = await readJson(androidReleasePath)
const monetization = await readJson(monetizationPath)
const unitEconomics = await readJson(unitEconomicsPath)

const githubRepository =
  repositoryReadiness.repository?.target ?? process.env.GITHUB_REPOSITORY ?? process.env.GH_REPO ?? null
const ghTokenConfigured =
  repositoryReadiness.githubAutomation?.ghTokenConfigured ??
  (configured(process.env.GH_TOKEN) || configured(process.env.GITHUB_TOKEN))
const hasGhCli = await new Promise((resolve) => {
  import('node:child_process').then(({ execFile }) => {
    execFile('gh', ['--version'], (error) => resolve(!error))
  })
})
const canUseGh = Boolean(
  repositoryReadiness.githubAutomation?.canSyncRepositorySettings ??
    (githubRepository && ghTokenConfigured && hasGhCli),
)
const pageBasePath = process.env.VITE_BASE_PATH || environment.publicOrigin?.basePath || '/'
const productionHostReady =
  environment.publicOrigin?.status === 'configured' && environment.support?.status === 'configured'
const collectorReady = collector.status === 'ready-for-worker-deploy'
const monetizationReady = monetization.revenueEnabled === true
const storeSpendAllowed = unitEconomics.controls?.storeSpendAllowed === true

const variableCommands = [
  ['VITE_BASE_PATH', 'VITE_BASE_PATH'],
  ['AGL_PUBLIC_ORIGIN', 'AGL_PUBLIC_ORIGIN'],
  ['VITE_PUBLIC_ORIGIN', 'AGL_PUBLIC_ORIGIN'],
  ['PUBLIC_SITE_URL', 'AGL_PUBLIC_ORIGIN'],
  ['AGL_SUPPORT_EMAIL', 'AGL_SUPPORT_EMAIL'],
  ['VITE_POSTHOG_KEY', 'VITE_POSTHOG_KEY'],
  ['VITE_POSTHOG_HOST', 'VITE_POSTHOG_HOST'],
  ['POSTHOG_PROJECT_ID', 'POSTHOG_PROJECT_ID'],
  ['POSTHOG_HOST', 'POSTHOG_HOST'],
  ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_ACCOUNT_ID'],
  ['VITE_EVENT_COLLECTOR_URL', 'VITE_EVENT_COLLECTOR_URL'],
  ['AGL_EVENT_COLLECTOR_EXPORT_URL', 'AGL_EVENT_COLLECTOR_EXPORT_URL'],
  ['AGL_EVENT_COLLECTOR_R2_BUCKET', 'AGL_EVENT_COLLECTOR_R2_BUCKET'],
  ['AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS', 'AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS'],
  ['VITE_ADSENSE_CLIENT_ID', 'VITE_ADSENSE_CLIENT_ID'],
  ['VITE_ADSENSE_REWARDED_SLOT_ID', 'VITE_ADSENSE_REWARDED_SLOT_ID'],
  ['ADMOB_PUBLISHER_ID', 'ADMOB_PUBLISHER_ID'],
  ['AD_NETWORK_PROVIDER', 'AD_NETWORK_PROVIDER'],
  ['AGL_ANDROID_PACKAGE_NAME', 'AGL_ANDROID_PACKAGE_NAME'],
  ['AGL_ANDROID_SHA256_CERT_FINGERPRINT', 'AGL_ANDROID_SHA256_CERT_FINGERPRINT'],
  ['AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED', 'AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED'],
  ['AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED', 'AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED'],
  ['AGL_AUTONOMOUS_SELF_UPDATE', 'AGL_AUTONOMOUS_SELF_UPDATE'],
  ['AGL_AUTONOMOUS_SELF_UPDATE_DIRECT', 'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT'],
]
const secretCommands = [
  ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_API_TOKEN'],
  ['VITE_EVENT_COLLECTOR_WRITE_TOKEN', 'VITE_EVENT_COLLECTOR_WRITE_TOKEN'],
  ['AGL_EVENT_COLLECTOR_ADMIN_TOKEN', 'AGL_EVENT_COLLECTOR_ADMIN_TOKEN'],
  ['POSTHOG_PERSONAL_API_KEY', 'POSTHOG_PERSONAL_API_KEY'],
  ['AGL_ANDROID_KEYSTORE_BASE64', 'AGL_ANDROID_KEYSTORE_BASE64'],
  ['AGL_ANDROID_KEYSTORE_PASSWORD', 'AGL_ANDROID_KEYSTORE_PASSWORD'],
  ['AGL_ANDROID_KEY_ALIAS', 'AGL_ANDROID_KEY_ALIAS'],
  ['GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'],
]

const commandForVariable = ([repoName, envName]) => ({
  id: `var-${repoName.toLowerCase().replaceAll('_', '-')}`,
  kind: 'github-variable',
  repositoryVariable: repoName,
  envName,
  configured: configured(process.env[envName]) || (repoName === 'VITE_BASE_PATH' && configured(pageBasePath)),
  command: `gh variable set ${repoName} --body "$${envName}"`,
})
const commandForSecret = ([repoName, envName]) => ({
  id: `secret-${repoName.toLowerCase().replaceAll('_', '-')}`,
  kind: 'github-secret',
  repositorySecret: repoName,
  envName,
  configured: configured(process.env[envName]),
  command: `printf "%s" "$${envName}" | gh secret set ${repoName}`,
})

const repoVariableActions = variableCommands.map(commandForVariable)
const repoSecretActions = secretCommands.map(commandForSecret)
const configuredVariableCount = repoVariableActions.filter((action) => action.configured).length
const configuredSecretCount = repoSecretActions.filter((action) => action.configured).length

const setupGroups = [
  {
    id: 'repository-channel',
    status: repositoryReadiness.status,
    canAutoRun: false,
    costUsd: 0,
    command: 'npm run autonomous:repo-readiness',
    evidence: `Repository ${
      repositoryReadiness.repository?.target ?? 'missing'
    }; git worktree ${repositoryReadiness.workspace?.insideWorkTree === true ? 'ready' : 'missing'}; workflow dispatch ${
      repositoryReadiness.githubAutomation?.workflowDispatchReady === true ? 'ready' : 'blocked'
    }.`,
    requires: repositoryReadiness.blockers ?? [],
  },
  {
    id: 'repository-bootstrap',
    status: repositoryBootstrap.status,
    canAutoRun: false,
    costUsd: 0,
    command: 'npm run autonomous:repo-bootstrap',
    evidence: `Repository bootstrap ${repositoryBootstrap.status}; helper ${
      repositoryBootstrap.helper?.path ?? 'missing'
    }; local git ${
      repositoryBootstrap.workspace?.after?.insideWorkTree === true ? 'ready' : 'missing'
    }.`,
    requires: repositoryBootstrap.blockers ?? [],
  },
  {
    id: 'production-environment',
    status: productionHostReady ? 'ready' : 'waiting-for-origin-support',
    canAutoRun: false,
    costUsd: 0,
    command: 'npm run autonomous:env',
    evidence: `Environment ${environment.status}; public origin ${environment.publicOrigin?.status ?? 'missing'}; support ${environment.support?.status ?? 'missing'}.`,
    requires: environment.blockers ?? [],
  },
  {
    id: 'github-pages-hosting',
    status: deployment.status === 'ready-for-pages' ? 'ready-for-actions-pages' : 'blocked',
    canAutoRun:
      repositoryReadiness.githubAutomation?.workflowDispatchReady === true &&
      deployment.status === 'ready-for-pages',
    costUsd: 0,
    command: 'gh workflow run web-pwa-deploy.yml',
    evidence: `Deployment plan is ${deployment.status}; Pages workflow is ${deployment.target?.workflow ?? 'missing'}.`,
    requires: [
      'Repository exists on GitHub.',
      'GitHub Pages source is set to GitHub Actions.',
      'VITE_BASE_PATH is set when deploying to project pages.',
    ],
  },
  {
    id: 'github-pages-settings',
    status: canUseGh ? 'ready-to-sync' : 'waiting-for-gh-auth',
    canAutoRun: canUseGh,
    costUsd: 0,
    command: 'AGL_SYNC_PAGES_SETTINGS=1 ./ops/github/setup-production.sh',
    evidence: canUseGh
      ? 'GitHub CLI can configure Pages to use the Actions workflow source.'
      : 'GitHub CLI authentication is required before Pages settings can be synced.',
    requires: [
      'Repository exists on GitHub.',
      'Authenticated gh token has repository administration or Pages settings access.',
    ],
  },
  {
    id: 'autonomous-self-update',
    status: configured(process.env.AGL_AUTONOMOUS_SELF_UPDATE)
      ? configured(process.env.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT)
        ? 'ready-for-direct-persistence'
        : 'ready-for-safety-checks'
      : 'waiting-for-self-update-gate',
    canAutoRun: canUseGh && configured(process.env.AGL_AUTONOMOUS_SELF_UPDATE),
    costUsd: 0,
    command: 'Run Autonomous Self Update after the daily workflow succeeds.',
    evidence: `Self-update gate ${configured(process.env.AGL_AUTONOMOUS_SELF_UPDATE) ? 'configured' : 'missing'}; direct push ${
      configured(process.env.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT) ? 'configured' : 'held'
    }.`,
    requires: [
      'Set AGL_AUTONOMOUS_SELF_UPDATE=1 to allow the self-update workflow to run after verified daily builds.',
      'Set AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1 only when direct generated-artifact commits to the default branch are acceptable.',
    ],
  },
  {
    id: 'github-actions-variables',
    status: configuredVariableCount ? 'partially-configured' : 'waiting-for-values',
    canAutoRun: canUseGh && configuredVariableCount > 0,
    costUsd: 0,
    command: './ops/github/setup-production.sh',
    evidence: `${configuredVariableCount}/${repoVariableActions.length} repository variable value(s) present in this environment.`,
    requires: repoVariableActions
      .filter((action) => !action.configured)
      .slice(0, 5)
      .map((action) => action.envName),
  },
  {
    id: 'github-actions-secrets',
    status: configuredSecretCount ? 'partially-configured' : 'waiting-for-secrets',
    canAutoRun: canUseGh && configuredSecretCount > 0,
    costUsd: 0,
    command: './ops/github/setup-production.sh',
    evidence: `${configuredSecretCount}/${repoSecretActions.length} repository secret value(s) present in this environment.`,
    requires: repoSecretActions
      .filter((action) => !action.configured)
      .slice(0, 5)
      .map((action) => action.envName),
  },
  {
    id: 'event-collector',
    status: collector.status,
    canAutoRun: canUseGh && collectorReady,
    costUsd: 0,
    command: 'gh workflow run event-collector-deploy.yml',
    evidence: `Collector deployment is ${collector.status}; provider ${collector.provider}.`,
    requires: collector.setupRequiredOnce ?? [],
  },
  {
    id: 'monetization-gate',
    status: monetizationReady ? 'ready' : 'held-by-product-gates',
    canAutoRun: false,
    costUsd: 0,
    command: 'npm run autonomous:monetization && npm run autonomous:unit-economics',
    evidence: `Revenue ${monetization.revenueEnabled ? 'enabled' : 'disabled'}; spend mode ${unitEconomics.status}.`,
    requires: monetization.blockers ?? [],
  },
  {
    id: 'store-compliance-unblock',
    status: storeCompliance.status,
    canAutoRun: false,
    costUsd: 0,
    command: 'npm run autonomous:store-package && npm run autonomous:store-compliance',
    evidence: `${storeCompliance.blockers?.length ?? 0} store compliance blocker(s) remain.`,
    requires: storeCompliance.blockers ?? [],
  },
  {
    id: 'android-release-unblock',
    status: androidRelease.status,
    canAutoRun: canUseGh && androidRelease.status === 'ready-for-internal-testing' && storeSpendAllowed,
    costUsd: 0,
    command: 'gh workflow run android-twa-release.yml',
    evidence: `Native package ${nativePackage.status}; Android release ${androidRelease.status}.`,
    requires: androidRelease.blockers ?? [],
  },
]

const nextRunnable = setupGroups.find((group) => group.canAutoRun)
const externalBlockers = [
  ...(repositoryReadiness.blockers ?? []).map((blocker) => ({ source: 'repository-readiness', blocker })),
  ...(repositoryBootstrap.blockers ?? []).map((blocker) => ({ source: 'repository-bootstrap', blocker })),
  ...environment.blockers.map((blocker) => ({ source: 'production-environment', blocker })),
  ...(collectorReady
    ? []
    : [{ source: 'event-collector', blocker: collector.nextActions?.[0] ?? 'Collector environment is not configured.' }]),
  ...(storeCompliance.blockers ?? []).map((blocker) => ({ source: 'store-compliance', blocker })),
  ...(androidRelease.blockers ?? []).map((blocker) => ({ source: 'android-release', blocker })),
]
const readyGroups = setupGroups.filter((group) =>
  ['ready', 'ready-for-actions-pages', 'partially-configured'].includes(group.status),
)
const setupCommands = [
  {
    id: 'repository-preflight',
    command: 'npm run autonomous:repo-readiness',
    safeToRunAutomatically: true,
    costUsd: 0,
  },
  {
    id: 'repository-bootstrap-plan',
    command: 'npm run autonomous:repo-bootstrap',
    safeToRunAutomatically: true,
    costUsd: 0,
  },
  {
    id: 'local-gate',
    command: 'npm run autonomous:operate && npm run autonomous:assert-deployable',
    safeToRunAutomatically: true,
    costUsd: 0,
  },
  {
    id: 'sync-pages-settings',
    command: 'AGL_SYNC_PAGES_SETTINGS=1 ./ops/github/setup-production.sh',
    safeToRunAutomatically: canUseGh,
    costUsd: 0,
  },
  {
    id: 'sync-repository-config',
    command: './ops/github/setup-production.sh',
    safeToRunAutomatically: canUseGh,
    costUsd: 0,
  },
  {
    id: 'run-web-workflow',
    command: 'RUN_WORKFLOWS=1 ./ops/github/setup-production.sh',
    safeToRunAutomatically: canUseGh && deployment.status === 'ready-for-pages',
    costUsd: 0,
  },
  {
    id: 'run-android-workflow',
    command: 'RUN_WORKFLOWS=1 ALLOW_ANDROID_RELEASE_WORKFLOW=1 ./ops/github/setup-production.sh',
    safeToRunAutomatically: canUseGh && androidRelease.status === 'ready-for-internal-testing' && storeSpendAllowed,
    costUsd: 0,
  },
]

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'production-bootstrap-ready',
  mode: nextRunnable ? 'can-apply-configured-actions' : 'waiting-for-external-credentials',
  envFiles: localEnv,
  repository: {
    githubRepository,
    githubRepositorySource: repositoryReadiness.repository?.source ?? null,
    inferredRepository: repositoryReadiness.repository?.inferredTarget ?? repositoryBootstrap.repository?.inferredTarget ?? null,
    ghCliAvailable: hasGhCli,
    ghTokenConfigured,
    ghAuthAvailable: repositoryReadiness.githubAutomation?.ghAuthAvailable ?? repositoryBootstrap.githubAutomation?.ghAuthAvailable ?? false,
    ghCredentialReady:
      repositoryReadiness.githubAutomation?.ghCredentialReady ??
      repositoryBootstrap.githubAutomation?.ghCredentialReady ??
      ghTokenConfigured,
    canUseGh,
    repositoryReadinessStatus: repositoryReadiness.status,
    repositoryBootstrapStatus: repositoryBootstrap.status,
    insideWorkTree: repositoryReadiness.workspace?.insideWorkTree ?? false,
    workflowDispatchReady: repositoryReadiness.githubAutomation?.workflowDispatchReady ?? false,
    bootstrapHelperPath: repositoryBootstrap.helper?.path ?? 'ops/github/bootstrap-repository.sh',
  },
  controls: {
    zeroSpendGuard: unitEconomics.controls?.maxDailySpendUsd === 0,
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    noPaidResourcesCreated: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: monetization.revenueEnabled !== true,
    noStoreWorkflowWithoutEconomics: true,
    applyRequiresExistingCredentials: true,
    canAutoConfigurePagesSource: true,
    generatedScriptsAvoidSecretEcho: true,
    repositoryBootstrapDryRunByDefault: repositoryBootstrap.controls?.dryRunByDefault === true,
  },
  summary: {
    readyGroups: readyGroups.length,
    totalGroups: setupGroups.length,
    configuredVariables: configuredVariableCount,
    totalVariables: repoVariableActions.length,
    configuredSecrets: configuredSecretCount,
    totalSecrets: repoSecretActions.length,
    externalBlockers: externalBlockers.length,
  },
  stages: setupGroups,
  setupGroups,
  requiredVariables: repoVariableActions,
  requiredSecrets: repoSecretActions,
  repoVariableActions,
  repoSecretActions,
  setupCommands,
  setupScript: {
    path: 'ops/github/setup-production.sh',
    status: 'generated',
    dryRunByDefault: false,
    usesCurrentShellEnvironment: true,
    configuresPagesSource: true,
    avoidsSecretEcho: true,
  },
  generatedArtifacts: [
    'data/production-bootstrap.json',
    'src/data/productionBootstrap.ts',
    'reports/production-bootstrap-latest.md',
    'data/repository-bootstrap.json',
    'src/data/repositoryBootstrap.ts',
    'reports/repository-bootstrap-latest.md',
    'ops/github/bootstrap-repository.sh',
    'ops/github/setup-production.sh',
    'ops/github/README.md',
  ],
  externalBlockers,
  ownerAction: {
    id: nextRunnable?.id ?? 'collect-production-credentials',
    status: nextRunnable ? 'ready' : 'credential-gated',
    command: nextRunnable?.command ?? 'Fill required environment values, then run npm run autonomous:bootstrap.',
    costUsd: 0,
  },
  nextActions: [
    nextRunnable
      ? `Run ${nextRunnable.command} for ${nextRunnable.id}.`
      : 'Provide a GitHub repository plus required environment values/secrets to let the bootstrap script configure production workflows.',
    'Keep GitHub Pages as the first zero-cost distribution channel.',
    'Keep app-store, paid spend, and revenue disabled until product and compliance gates pass.',
  ],
}

const report = [
  '# Production Bootstrap',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  `GitHub repository: ${githubRepository ?? 'missing'}`,
  `Repository channel: ${repositoryReadiness.status}`,
  `gh CLI available: ${hasGhCli}`,
  '',
  '## Local Env Files',
  '',
  ...(payload.envFiles.loadedFiles.length
    ? payload.envFiles.loadedFiles.map((file) => `- ${file.path}: ${file.keys.join(', ') || 'no keys'}`)
    : ['- none loaded']),
  `- shell env precedence: ${payload.envFiles.controls.shellEnvPrecedence}`,
  `- protected mutation keys require shell env: ${payload.envFiles.controls.protectedMutationKeysRequireShellEnv}`,
  `- values redacted: ${payload.envFiles.controls.noSecretValuesInReports}`,
  '',
  '## Setup Groups',
  '',
  ...setupGroups.map(
    (group) =>
      `- ${group.status}: ${group.id}; auto-run ${group.canAutoRun ? 'yes' : 'no'}; ${group.evidence}`,
  ),
  '',
  '## Setup Commands',
  '',
  ...setupCommands.map((command) => `- ${command.id}: ${command.command}`),
  '',
  '## Repository Variables',
  '',
  ...repoVariableActions.map(
    (action) => `- ${action.configured ? 'ready' : 'missing'}: ${action.repositoryVariable} from ${action.envName}`,
  ),
  '',
  '## Repository Secrets',
  '',
  ...repoSecretActions.map(
    (action) => `- ${action.configured ? 'ready' : 'missing'}: ${action.repositorySecret} from ${action.envName}`,
  ),
  '',
  '## External Blockers',
  '',
  ...(externalBlockers.length
    ? externalBlockers.slice(0, 12).map((item) => `- ${item.source}: ${item.blocker}`)
    : ['- none']),
  '',
]

const setupScript = `#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Authenticate GitHub CLI before syncing production settings." >&2
  exit 1
fi

repo="\${GITHUB_REPOSITORY:-\${GH_REPO:-}}"

derive_repository_name() {
  node -e 'const fs=require("fs"); let name="autonomous-game-lab"; try { name=JSON.parse(fs.readFileSync("package.json","utf8")).name || name } catch {} name=String(name).split("/").pop().replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^-+|-+$/g,"") || "autonomous-game-lab"; console.log(name)'
}

if [[ -z "$repo" && "\${AGL_ALLOW_GH_INFER_REPOSITORY:-1}" == "1" ]]; then
  gh_owner="$(gh api user --jq .login 2>/dev/null || true)"
  if [[ -n "$gh_owner" ]]; then
    repo="$gh_owner/$(derive_repository_name)"
    echo "inferred GitHub repository target: $repo"
  fi
fi

if [[ -z "$repo" ]]; then
  echo "Set GITHUB_REPOSITORY/GH_REPO or authenticate gh so owner/package-name can be inferred." >&2
  exit 1
fi

repo_args=(--repo "$repo")

set_variable() {
  local repo_name="$1"
  local env_name="$2"
  local value="\${!env_name:-}"
  if [[ -n "$value" ]]; then
    gh variable set "$repo_name" --body "$value" "\${repo_args[@]}"
  else
    echo "skip variable $repo_name: $env_name is not set"
  fi
}

set_secret() {
  local repo_name="$1"
  local env_name="$2"
  local value="\${!env_name:-}"
  if [[ -n "$value" ]]; then
    printf "%s" "$value" | gh secret set "$repo_name" "\${repo_args[@]}"
  else
    echo "skip secret $repo_name: $env_name is not set"
  fi
}

all_present() {
  local name
  for name in "$@"; do
    if [[ -z "\${!name:-}" ]]; then
      return 1
    fi
  done
}

sync_pages_settings() {
  if [[ "\${AGL_SYNC_PAGES_SETTINGS:-1}" != "1" ]]; then
    echo "skip GitHub Pages settings: AGL_SYNC_PAGES_SETTINGS is not 1"
    return
  fi

  if gh api "repos/$repo/pages" >/dev/null 2>&1; then
    gh api --method PUT "repos/$repo/pages" -f build_type=workflow -F https_enforced=true >/dev/null
    echo "GitHub Pages source set to Actions workflow for $repo"
  else
    gh api --method POST "repos/$repo/pages" -f build_type=workflow >/dev/null
    gh api --method PUT "repos/$repo/pages" -f build_type=workflow -F https_enforced=true >/dev/null || true
    echo "GitHub Pages site created for workflow deployment on $repo"
  fi
}

${variableCommands.map(([repoName, envName]) => `set_variable "${repoName}" "${envName}"`).join('\n')}
${secretCommands.map(([repoName, envName]) => `set_secret "${repoName}" "${envName}"`).join('\n')}

echo "Production GitHub variables/secrets sync complete for configured values."

sync_pages_settings

if [[ "\${RUN_WORKFLOWS:-0}" == "1" ]]; then
  gh workflow run web-pwa-deploy.yml "\${repo_args[@]}"

  if all_present CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN VITE_EVENT_COLLECTOR_URL AGL_EVENT_COLLECTOR_EXPORT_URL VITE_EVENT_COLLECTOR_WRITE_TOKEN AGL_EVENT_COLLECTOR_ADMIN_TOKEN; then
    gh workflow run event-collector-deploy.yml "\${repo_args[@]}"
  else
    echo "skip event collector workflow: collector variables/secrets are incomplete"
  fi

  if [[ "\${ALLOW_ANDROID_RELEASE_WORKFLOW:-0}" == "1" ]] && all_present AGL_PUBLIC_ORIGIN AGL_ANDROID_SHA256_CERT_FINGERPRINT AGL_ANDROID_KEYSTORE_BASE64 AGL_ANDROID_KEYSTORE_PASSWORD AGL_ANDROID_KEY_ALIAS GOOGLE_PLAY_SERVICE_ACCOUNT_JSON; then
    gh workflow run android-twa-release.yml "\${repo_args[@]}"
  else
    echo "skip Android workflow: held unless ALLOW_ANDROID_RELEASE_WORKFLOW=1 and signing/Play secrets are complete"
  fi
fi
`

const setupReadme = `# GitHub Production Bootstrap

Generated by \`npm run autonomous:bootstrap\`.

This folder contains the zero-spend GitHub setup helper for the autonomous PWA release path. It does not create accounts, buy infrastructure, enable monetization, or submit to app stores.

## Usage

1. Run \`npm run autonomous:repo-readiness && npm run autonomous:repo-bootstrap\` and clear any repository-channel blockers.
2. Export the environment values from \`ops/production.env.example\`.
3. Set \`GITHUB_REPOSITORY=owner/repo\` / \`GH_REPO=owner/repo\`, or authenticate \`gh\` and let the helpers infer \`owner/package-name\`.
4. Authenticate \`gh\` with access to repository variables and secrets.
5. To initialize/attach the repository transport, run the guarded helper with only the explicit actions you want:

\`\`\`bash
AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 ./ops/github/bootstrap-repository.sh
\`\`\`

6. To sync production variables/secrets, run:

\`\`\`bash
./ops/github/setup-production.sh
\`\`\`

By default the setup helper also configures GitHub Pages to use the Actions workflow source. Set \`AGL_SYNC_PAGES_SETTINGS=0\` to skip that remote settings sync.

Set \`RUN_WORKFLOWS=1\` to trigger the web workflow after syncing configured values. The collector workflow runs only when its Cloudflare values exist. Android stays held unless \`ALLOW_ANDROID_RELEASE_WORKFLOW=1\`, signing secrets exist, and the normal release gates pass.
`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(opsGithubDir, { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const productionBootstrap = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ProductionBootstrap = typeof productionBootstrap\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(setupScriptPath, setupScript, { mode: 0o755 })
await chmod(setupScriptPath, 0o755)
await writeFile(setupReadmePath, setupReadme)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, setupScriptPath)}`)
console.log(`Wrote ${path.relative(root, setupReadmePath)}`)
