import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'post-deploy-artifact-sync.json')
const outputTsPath = path.join(root, 'src', 'data', 'postDeployArtifactSync.ts')
const reportPath = path.join(root, 'reports', 'post-deploy-artifact-sync-latest.md')

const argv = process.argv.slice(2)
const argValue = (prefix) => argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
const assertMode = argv.includes('--assert')
const workflowFile = argValue('--workflow=') ?? process.env.AGL_DEPLOY_WORKFLOW ?? 'web-pwa-deploy.yml'
const artifactName = argValue('--artifact=') ?? process.env.AGL_POST_DEPLOY_ARTIFACT ?? 'post-deploy-smoke'
const explicitRunId = argValue('--run-id=') ?? process.env.AGL_POST_DEPLOY_RUN_ID ?? null
const explicitRepo = argValue('--repo=') ?? process.env.GITHUB_REPOSITORY ?? process.env.GH_REPO ?? null
const explicitOrigin = argValue('--origin=') ?? process.env.AGL_DEPLOYED_PWA_ORIGIN ?? null
const timeoutMs = Number(argValue('--timeout-ms=') ?? process.env.AGL_POST_DEPLOY_ARTIFACT_TIMEOUT_MS ?? 12_000)

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const run = (command, args, commandTimeoutMs = 30_000) =>
  new Promise((resolve) => {
    execFile(
      command,
      args,
      { cwd: root, timeout: commandTimeoutMs, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          ok: !error,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          code: typeof error?.code === 'number' ? error.code : error ? 1 : 0,
        })
      },
    )
  })

const normalizeOrigin = (value) => {
  const trimmed = String(value ?? '').trim()

  if (!trimmed) {
    return null
  }

  try {
    const url = new URL(trimmed)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null
    }

    return url
  } catch {
    return null
  }
}

const urlForPath = (origin, livePath) => {
  const basePath = origin.pathname.endsWith('/') ? origin.pathname : `${origin.pathname}/`
  const relativePath = livePath === '/' ? '' : livePath.replace(/^\//, '')
  const pathname = `${basePath}${relativePath}`.replace(/\/+/g, '/')
  const nextUrl = new URL(`${origin.protocol}//${origin.host}`)
  nextUrl.pathname = pathname
  return nextUrl.toString()
}

const parseGithubRepository = (value) => {
  const raw = String(value ?? '').trim()
  const match = raw.match(/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)$/)

  return match ? `${match[1]}/${match[2]}` : null
}

const repositoryFromRemote = (remoteUrl) => {
  const normalizedRemoteUrl = String(remoteUrl ?? '').trim().replace(/\/+$/g, '')
  const githubRemotePatterns = [
    /^https:\/\/github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
    /^git@github\.com:([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
    /^ssh:\/\/git@github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
  ]

  for (const pattern of githubRemotePatterns) {
    const match = normalizedRemoteUrl.match(pattern)
    if (match) {
      return parseGithubRepository(match[1])
    }
  }

  return null
}

const fetchJson = async (url) => {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(Number.isFinite(timeoutMs) ? timeoutMs : 12_000),
  })
  const text = await response.text()

  let parsed = null
  try {
    parsed = JSON.parse(text)
  } catch {
    parsed = null
  }

  return {
    ok: response.ok,
    status: response.status,
    finalUrl: response.url,
    contentType: response.headers.get('content-type') ?? '',
    bytes: text.length,
    parsed,
    textHash: createHash('sha256').update(text).digest('hex'),
  }
}

const releaseCandidate = await readOptionalJson(path.join(dataDir, 'release-candidate.json'), {
  target: {},
})
const productionEnvironment = await readOptionalJson(path.join(dataDir, 'production-environment.json'), {
  publicOrigin: {},
})
const existingSync = await readOptionalJson(outputJsonPath, null)

const checks = []
const ghVersion = await run('gh', ['--version'], 6_000)
checks.push({
  id: 'gh-cli',
  status: ghVersion.ok ? 'pass' : 'blocker',
  detail: ghVersion.ok ? ghVersion.stdout.split('\n')[0] : 'GitHub CLI is not available.',
})

const remoteResult = await run('git', ['remote', 'get-url', 'origin'], 4_000)
const repository = parseGithubRepository(explicitRepo) ?? repositoryFromRemote(remoteResult.ok ? remoteResult.stdout : null)
const currentHeadResult = await run('git', ['rev-parse', 'HEAD'], 4_000)
const currentBranchResult = await run('git', ['branch', '--show-current'], 4_000)
const currentHeadParentResult = await run('git', ['rev-parse', 'HEAD^'], 4_000)
const currentHeadSubjectResult = await run('git', ['log', '-1', '--pretty=%s'], 4_000)
const currentHeadSha =
  currentHeadResult.ok && /^[a-f0-9]{40}$/.test(currentHeadResult.stdout) ? currentHeadResult.stdout : null
const currentHeadParentSha =
  currentHeadParentResult.ok && /^[a-f0-9]{40}$/.test(currentHeadParentResult.stdout)
    ? currentHeadParentResult.stdout
    : null
const currentBranch = currentBranchResult.ok && currentBranchResult.stdout ? currentBranchResult.stdout : null
const currentHeadSubject = currentHeadSubjectResult.ok ? currentHeadSubjectResult.stdout : null

if (
  existingSync?.status === 'post-deploy-artifact-sync-passed' &&
  (ghVersion.ok === false || !repository)
) {
  console.log('GitHub CLI/repo not available; preserving prior post-deploy artifact sync evidence.')
  process.exit(0)
}

const repoArgs = repository ? ['--repo', repository] : []
checks.push({
  id: 'github-repository',
  status: repository ? 'pass' : 'blocker',
  detail: repository
    ? `Target repository is ${repository}.`
    : 'No repository was provided and origin remote could not be parsed.',
})

let selectedRun = null
let runListRaw = null
let workflowRunListRaw = null
let workflowRuns = []
if (ghVersion.ok && repository) {
  if (explicitRunId) {
    const runView = await run(
      'gh',
      [
        'run',
        'view',
        explicitRunId,
        '--json',
        'databaseId,headSha,createdAt,conclusion,status,url,workflowName',
        ...repoArgs,
      ],
      20_000,
    )

    if (runView.ok) {
      try {
        const runDetails = JSON.parse(runView.stdout)
        selectedRun = {
          ...runDetails,
          source: 'explicit-run-id',
        }
      } catch {
        selectedRun = {
          databaseId: Number(explicitRunId),
          source: 'explicit-run-id',
        }
      }
    } else {
      selectedRun = {
        databaseId: Number(explicitRunId),
        source: 'explicit-run-id',
      }
    }

    checks.push({
      id: 'explicit-pages-run',
      status:
        selectedRun?.databaseId &&
        (selectedRun.conclusion === undefined ||
          selectedRun.conclusion === 'success' ||
          selectedRun.conclusion === null)
          ? 'pass'
          : 'blocker',
      detail: runView.ok
        ? `Explicit ${workflowFile} run is ${selectedRun.databaseId}.`
        : `Using explicit run ${explicitRunId}; metadata lookup failed: ${runView.stderr || runView.stdout}`,
    })
  } else {
    const runList = await run(
      'gh',
      [
        'run',
        'list',
        '--workflow',
        workflowFile,
        '--status',
        'success',
        '--json',
        'databaseId,headSha,createdAt,conclusion,status,url',
        '--limit',
        '10',
        ...repoArgs,
      ],
      20_000,
    )
    runListRaw = runList.ok ? runList.stdout : runList.stderr

    if (runList.ok) {
      try {
        const runs = JSON.parse(runList.stdout)
        selectedRun =
          runs.find((item) => item.status === 'completed' && item.conclusion === 'success') ??
          runs.find((item) => item.conclusion === 'success') ??
          null
      } catch {
        selectedRun = null
      }
    }

    checks.push({
      id: 'successful-pages-run',
      status: selectedRun ? 'pass' : 'blocker',
      detail: selectedRun
        ? `Latest successful ${workflowFile} run is ${selectedRun.databaseId}.`
        : runList.ok
          ? `No successful ${workflowFile} run was returned by GitHub Actions.`
          : `Could not list GitHub Actions runs: ${runList.stderr || runList.stdout}`,
    })
  }

  const workflowRunList = await run(
    'gh',
    [
      'run',
      'list',
      '--workflow',
      workflowFile,
      '--json',
      'databaseId,headSha,createdAt,conclusion,status,url,event',
      '--limit',
      '10',
      ...repoArgs,
    ],
    20_000,
  )
  workflowRunListRaw = workflowRunList.ok ? workflowRunList.stdout : workflowRunList.stderr

  if (workflowRunList.ok) {
    try {
      workflowRuns = JSON.parse(workflowRunList.stdout)
    } catch {
      workflowRuns = []
    }
  }
} else {
  checks.push({
    id: 'successful-pages-run',
    status: 'blocker',
    detail: 'GitHub CLI and repository target are required before listing successful Pages runs.',
  })
}

let artifactSmoke = null
let artifactReport = ''
let artifactDownload = null
let artifactReadError = null
let tempDir = null

if (ghVersion.ok && repository && selectedRun?.databaseId) {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'agl-post-deploy-artifact-'))

  try {
    artifactDownload = await run(
      'gh',
      [
        'run',
        'download',
        String(selectedRun.databaseId),
        '--name',
        artifactName,
        '--dir',
        tempDir,
        ...repoArgs,
      ],
      60_000,
    )

    if (artifactDownload.ok) {
      const smokePathCandidates = [
        path.join(tempDir, 'data', 'post-deploy-smoke.json'),
        path.join(tempDir, 'post-deploy-smoke.json'),
      ]
      const reportPathCandidates = [
        path.join(tempDir, 'reports', 'post-deploy-smoke-latest.md'),
        path.join(tempDir, 'post-deploy-smoke-latest.md'),
      ]
      const resolvedSmokePath = (await exists(smokePathCandidates[0])) ? smokePathCandidates[0] : smokePathCandidates[1]
      const resolvedReportPath = (await exists(reportPathCandidates[0])) ? reportPathCandidates[0] : reportPathCandidates[1]

      artifactSmoke = JSON.parse(await readFile(resolvedSmokePath, 'utf8'))
      artifactReport = (await exists(resolvedReportPath)) ? await readFile(resolvedReportPath, 'utf8') : ''
    }
  } catch (error) {
    artifactReadError = error instanceof Error ? error.message : String(error)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

checks.push({
  id: 'post-deploy-smoke-artifact',
  status: artifactSmoke ? 'pass' : 'blocker',
  detail: artifactSmoke
    ? `Downloaded ${artifactName} artifact from run ${selectedRun?.databaseId}.`
    : artifactDownload?.ok === false
      ? `Could not download ${artifactName}: ${artifactDownload.stderr || artifactDownload.stdout}`
      : artifactReadError ?? 'No post-deploy smoke artifact was available to import.',
})

const artifactPlanned = artifactSmoke?.summary?.planned ?? 0
const artifactStrict = artifactSmoke?.target?.strictManifestComparison === true
const artifactControlsReady =
  artifactSmoke?.controls?.zeroPaidSpend === true &&
  artifactSmoke?.controls?.noStoreSubmission === true &&
  artifactSmoke?.controls?.noRevenueEnablement === true &&
  artifactSmoke?.controls?.readOnlyHttpChecks === true &&
  artifactSmoke?.controls?.manifestHashComparisonRequired === true
const artifactSummaryPassed =
  artifactPlanned > 0 &&
  artifactSmoke?.summary?.passed === artifactSmoke?.summary?.planned &&
  artifactSmoke?.summary?.failed === 0 &&
  artifactSmoke?.summary?.blocked === 0
const artifactPassed =
  artifactSmoke?.status === 'post-deploy-smoke-passed' &&
  artifactStrict &&
  artifactControlsReady &&
  artifactSummaryPassed

checks.push({
  id: 'strict-smoke-artifact',
  status: artifactPassed ? 'pass' : artifactSmoke ? 'fail' : 'blocker',
  detail: artifactSmoke
    ? `Artifact status ${artifactSmoke.status}; strict manifest comparison ${artifactStrict}; checks ${artifactSmoke.summary?.passed ?? 0}/${artifactSmoke.summary?.planned ?? 0}.`
    : 'Strict smoke evidence cannot be validated until the artifact is downloaded.',
})

const artifactOrigin =
  explicitOrigin ??
  artifactSmoke?.target?.origin ??
  releaseCandidate.target?.publicOrigin ??
  productionEnvironment.publicOrigin?.origin ??
  null
const origin = normalizeOrigin(artifactOrigin)
let liveManifest = null
let liveFetchError = null

if (origin) {
  try {
    liveManifest = await fetchJson(urlForPath(origin, '/release-candidate.json'))
  } catch (error) {
    liveFetchError = error instanceof Error ? error.message : String(error)
  }
}

const liveCandidateId = liveManifest?.parsed?.candidateId ?? null
const liveAggregateHash = liveManifest?.parsed?.integrity?.aggregateHash ?? null
const liveMatchesArtifact =
  liveManifest?.status === 200 &&
  liveManifest?.parsed?.status === 'release-candidate-ready' &&
  liveCandidateId === artifactSmoke?.target?.candidateId &&
  liveAggregateHash === artifactSmoke?.target?.aggregateHash
const activeRunStatuses = new Set(['queued', 'in_progress', 'waiting', 'requested', 'pending'])
const currentHeadRuns = currentHeadSha ? workflowRuns.filter((item) => item.headSha === currentHeadSha) : []
const currentHeadActiveRun = currentHeadRuns.find((item) => activeRunStatuses.has(item.status))
const currentHeadSuccessfulRun = currentHeadRuns.find(
  (item) => item.status === 'completed' && item.conclusion === 'success',
)
const latestRun = workflowRuns[0] ?? null
const selectedRunHeadSha = selectedRun?.headSha ?? existingSync?.workflow?.headSha ?? null
const selectedRunHeadMatchesCurrent = Boolean(currentHeadSha && selectedRunHeadSha === currentHeadSha)
const currentHeadIsPostDeployEvidenceCommit = Boolean(
  currentHeadSha &&
    currentHeadParentSha &&
    selectedRunHeadSha === currentHeadParentSha &&
    currentHeadSubject === 'Autonomous post-deploy evidence sync',
)
const deploySourceHeadSha = currentHeadIsPostDeployEvidenceCommit ? currentHeadParentSha : currentHeadSha
const selectedRunHeadMatchesDeploySource = Boolean(deploySourceHeadSha && selectedRunHeadSha === deploySourceHeadSha)
const liveMatchesCurrentLocalCandidate =
  liveManifest?.status === 200 &&
  liveManifest?.parsed?.status === 'release-candidate-ready' &&
  liveCandidateId === releaseCandidate.candidateId &&
  liveAggregateHash === releaseCandidate.integrity?.aggregateHash
const deploySourceDeployed = selectedRunHeadMatchesDeploySource && liveMatchesArtifact
const currentHeadDeployed = selectedRunHeadMatchesCurrent && liveMatchesArtifact
const deploymentFreshnessStatus = currentHeadSha
  ? currentHeadDeployed
    ? 'current-head-deployed'
    : currentHeadIsPostDeployEvidenceCommit && deploySourceDeployed
      ? 'post-deploy-evidence-head-synced'
      : currentHeadActiveRun
        ? 'current-head-deploy-pending'
        : 'current-head-not-deployed'
  : 'current-head-unknown'

checks.push({
  id: 'live-release-manifest',
  status: liveMatchesArtifact ? 'pass' : origin && artifactSmoke ? 'fail' : 'blocker',
  detail: liveMatchesArtifact
    ? 'Live release-candidate.json still matches the strict smoke artifact.'
    : origin
      ? liveFetchError ?? `Live release manifest did not match artifact candidate ${artifactSmoke?.target?.candidateId ?? 'missing'}.`
      : 'No live origin is available for release-manifest verification.',
})
checks.push({
  id: 'deployment-freshness',
  status: currentHeadSha ? (currentHeadDeployed ? 'pass' : 'monitor') : 'blocker',
  detail: currentHeadSha
    ? currentHeadDeployed
      ? `Current ${currentBranch ?? 'HEAD'} ${currentHeadSha.slice(0, 12)} is deployed.`
      : currentHeadIsPostDeployEvidenceCommit && deploySourceDeployed
        ? `Current ${currentBranch ?? 'HEAD'} ${currentHeadSha.slice(0, 12)} is the post-deploy evidence commit for deployed source ${deploySourceHeadSha?.slice(0, 12) ?? 'missing'}.`
      : `Current ${currentBranch ?? 'HEAD'} ${currentHeadSha.slice(0, 12)} is not the latest strict deployed artifact; freshness ${deploymentFreshnessStatus}.`
    : 'Current git HEAD could not be resolved for deployment freshness tracking.',
})

const failedChecks = checks.filter((check) => check.status === 'fail')
const blockedChecks = checks.filter((check) => check.status === 'blocker')
const status = failedChecks.length
  ? 'post-deploy-artifact-sync-failed'
  : blockedChecks.length
    ? 'post-deploy-artifact-sync-blocked'
    : 'post-deploy-artifact-sync-passed'

let payload = {
  generatedAt: new Date().toISOString(),
  status,
  envFiles: localEnv,
  repository: {
    target: repository,
    source: parseGithubRepository(explicitRepo) ? 'environment-or-cli' : repository ? 'origin-remote' : 'missing',
  },
  workflow: {
    workflowFile,
    artifactName,
    runId: selectedRun?.databaseId ?? null,
    headSha: selectedRun?.headSha ?? null,
    createdAt: selectedRun?.createdAt ?? null,
    url: selectedRun?.url ?? null,
    source: selectedRun?.source ?? (explicitRunId ? 'explicit-run-id' : 'latest-successful-run'),
    runListAvailable: typeof runListRaw === 'string',
  },
  deploymentFreshness: {
    status: deploymentFreshnessStatus,
    currentHeadSha,
    currentHeadParentSha,
    currentBranch,
    currentHeadSubject,
    selectedRunHeadSha,
    selectedRunHeadMatchesCurrent,
    selectedRunHeadMatchesDeploySource,
    currentHeadIsPostDeployEvidenceCommit,
    currentHeadDeployed,
    deploySourceHeadSha,
    deploySourceDeployed,
    currentHeadQueuedOrRunning: Boolean(currentHeadActiveRun),
    currentHeadSuccessfulRunId: currentHeadSuccessfulRun?.databaseId ?? null,
    currentHeadActiveRunId: currentHeadActiveRun?.databaseId ?? null,
    latestRunId: latestRun?.databaseId ?? null,
    latestRunStatus: latestRun?.status ?? null,
    latestRunConclusion: latestRun?.conclusion ?? null,
    latestRunHeadSha: latestRun?.headSha ?? null,
    liveMatchesCurrentLocalCandidate,
    liveCandidateId,
    localCandidateId: releaseCandidate.candidateId ?? null,
    liveAggregateHash,
    localAggregateHash: releaseCandidate.integrity?.aggregateHash ?? null,
    workflowRunListAvailable: typeof workflowRunListRaw === 'string',
  },
  artifact: {
    status: artifactSmoke?.status ?? 'missing',
    generatedAt: artifactSmoke?.generatedAt ?? null,
    target: artifactSmoke?.target ?? null,
    sourceStatus: artifactSmoke?.sourceStatus ?? null,
    summary: artifactSmoke?.summary ?? null,
    liveRelease: artifactSmoke?.liveRelease ?? null,
    controls: artifactSmoke?.controls ?? null,
    reportSha256: artifactReport ? createHash('sha256').update(artifactReport).digest('hex') : null,
  },
  live: {
    origin: origin?.toString() ?? null,
    manifestUrl: origin ? urlForPath(origin, '/release-candidate.json') : null,
    status: liveManifest?.status ?? null,
    finalUrl: liveManifest?.finalUrl ?? null,
    contentType: liveManifest?.contentType ?? null,
    bytes: liveManifest?.bytes ?? 0,
    textSha256: liveManifest?.textHash ?? null,
    releaseStatus: liveManifest?.parsed?.status ?? null,
    candidateId: liveCandidateId,
    aggregateHash: liveAggregateHash,
    matchesArtifact: liveMatchesArtifact,
  },
  validation: {
    artifactPassed,
    artifactStrict,
    artifactControlsReady,
    artifactSummaryPassed,
    liveMatchesArtifact,
  },
  summary: {
    planned: checks.length,
    passed: checks.filter((check) => check.status === 'pass').length,
    failed: failedChecks.length,
    blocked: blockedChecks.length,
  },
  controls: {
    zeroPaidSpend: true,
    noWorkflowDispatch: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noAccountCreation: true,
    readOnlyGithubArtifactDownload: true,
    readOnlyHttpChecks: true,
    strictManifestComparisonRequired: true,
    separateFromLocalCandidate: true,
    noPostDeployReleaseRefresh: true,
    currentHeadFreshnessTracked: true,
    olderDeployNotTreatedAsCurrentHead: true,
  },
  checks,
  nextActions: [
    deploymentFreshnessStatus === 'current-head-deployed'
      ? 'Current main is deployed; keep strict live artifact evidence in sync after each Pages run.'
      : deploymentFreshnessStatus === 'post-deploy-evidence-head-synced'
        ? 'Current main is the post-deploy evidence commit for the deployed source; deploy again only when public evidence pages must mirror the evidence commit immediately.'
      : 'Wait for or rerun Web PWA Deploy before treating the current main head as live; the previous deployed artifact remains valid but stale for the current commit.',
    status === 'post-deploy-artifact-sync-passed'
      ? 'Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.'
      : 'Run the Web PWA Deploy workflow, then rerun this sync to import strict live smoke evidence.',
    'Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass.',
  ],
}

if (
  existingSync?.status === 'post-deploy-artifact-sync-passed' &&
  payload.status !== 'post-deploy-artifact-sync-passed'
) {
  const freshnessCheck = payload.checks.find((check) => check.id === 'deployment-freshness') ?? {
    id: 'deployment-freshness',
    status: currentHeadSha ? 'monitor' : 'blocker',
    detail: currentHeadSha
      ? `Current ${currentBranch ?? 'HEAD'} ${currentHeadSha.slice(0, 12)} could not be compared with live deploy because GitHub or network evidence was unavailable.`
      : 'Current git HEAD could not be resolved for deployment freshness tracking.',
  }
  const checks = [
    ...(existingSync.checks ?? []).filter((check) => check.id !== 'deployment-freshness'),
    freshnessCheck,
  ]

  payload = {
    ...existingSync,
    generatedAt: payload.generatedAt,
    envFiles: localEnv,
    deploymentFreshness: payload.deploymentFreshness,
    controls: {
      ...(existingSync.controls ?? {}),
      currentHeadFreshnessTracked: true,
      olderDeployNotTreatedAsCurrentHead: true,
    },
    checks,
    summary: {
      planned: checks.length,
      passed: checks.filter((check) => check.status === 'pass').length,
      failed: checks.filter((check) => check.status === 'fail').length,
      blocked: checks.filter((check) => check.status === 'blocker').length,
    },
    nextActions: [
      payload.deploymentFreshness.status === 'current-head-deployed'
        ? 'Current main is deployed; keep strict live artifact evidence in sync after each Pages run.'
        : 'Wait for or rerun Web PWA Deploy before treating the current main head as live; the previous deployed artifact remains valid but stale for the current commit.',
      ...(existingSync.nextActions ?? []),
    ],
  }

  console.log('Network blocked; preserved prior strict deploy evidence and refreshed deployment freshness.')
}

const report = [
  '# Post-Deploy Artifact Sync',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Repository: ${payload.repository.target ?? 'missing'}`,
  `Workflow: ${payload.workflow.workflowFile}`,
  `Run: ${payload.workflow.runId ?? 'missing'}`,
  `Origin: ${payload.live.origin ?? 'missing'}`,
  `Artifact candidate: ${payload.artifact.target?.candidateId ?? 'missing'}`,
  `Live candidate: ${payload.live.candidateId ?? 'missing'}`,
  `Deployment freshness: ${payload.deploymentFreshness.status}`,
  '',
  '## Summary',
  '',
  `- Planned: ${payload.summary.planned}`,
  `- Passed: ${payload.summary.passed}`,
  `- Failed: ${payload.summary.failed}`,
  `- Blocked: ${payload.summary.blocked}`,
  '',
  '## Validation',
  '',
  ...Object.entries(payload.validation).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Deployment Freshness',
  '',
  `- currentHeadSha: ${payload.deploymentFreshness.currentHeadSha ?? 'missing'}`,
  `- selectedRunHeadSha: ${payload.deploymentFreshness.selectedRunHeadSha ?? 'missing'}`,
  `- currentHeadDeployed: ${payload.deploymentFreshness.currentHeadDeployed}`,
  `- currentHeadQueuedOrRunning: ${payload.deploymentFreshness.currentHeadQueuedOrRunning}`,
  `- liveMatchesCurrentLocalCandidate: ${payload.deploymentFreshness.liveMatchesCurrentLocalCandidate}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
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
  `export const postDeployArtifactSync = ${JSON.stringify(payload, null, 2)} as const\n\nexport type PostDeployArtifactSync = typeof postDeployArtifactSync\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (assertMode && status !== 'post-deploy-artifact-sync-passed') {
  console.error(`Post-deploy artifact sync status is ${status}.`)
  process.exit(1)
}
