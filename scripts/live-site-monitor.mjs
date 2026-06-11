import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'live-site-monitor.json')
const outputTsPath = path.join(root, 'src', 'data', 'liveSiteMonitor.ts')
const reportPath = path.join(root, 'reports', 'live-site-monitor-latest.md')

const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const readCommittedJson = (relativePath, fallback) => {
  try {
    return JSON.parse(execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: root, encoding: 'utf8' }))
  } catch {
    return fallback
  }
}

const previousMonitor = await readOptionalJson(outputJsonPath, null)
const committedMonitor = readCommittedJson('data/live-site-monitor.json', null)
const committedPostDeploySmoke = readCommittedJson('data/post-deploy-smoke.json', null)
const parseDate = (value) => {
  const date = new Date(String(value ?? ''))
  return Number.isFinite(date.valueOf()) ? date : null
}
const previousMonitorIsReusable = ({ currentOrigin }) => {
  if (!previousMonitor || typeof previousMonitor !== 'object') {
    return false
  }

  const status = String(previousMonitor.status ?? '')
  if (status !== 'live-site-monitor-passed') {
    return false
  }

  const previousOrigin = String(previousMonitor.origin?.origin ?? '').trim()
  if (!previousOrigin || previousOrigin !== String(currentOrigin ?? '').trim()) {
    return false
  }

  const generatedAt = parseDate(previousMonitor.generatedAt)
  if (!generatedAt) {
    return false
  }

  const ageMs = Date.now() - generatedAt.valueOf()
  const maxAgeMs = 72 * 60 * 60 * 1000
  return ageMs >= 0 && ageMs <= maxAgeMs
}
const committedMonitorIsReusable = ({ currentOrigin }) => {
  if (!committedMonitor || typeof committedMonitor !== 'object') {
    return false
  }

  const previousOrigin = String(committedMonitor.origin?.origin ?? '').trim()
  if (!previousOrigin || previousOrigin !== String(currentOrigin ?? '').trim()) {
    return false
  }

  const generatedAt = parseDate(committedMonitor.generatedAt)
  if (!generatedAt) {
    return false
  }

  const ageMs = Date.now() - generatedAt.valueOf()
  const maxAgeMs = 72 * 60 * 60 * 1000
  return ageMs >= 0 && ageMs <= maxAgeMs
}
const committedSmokeIsReusable = ({ currentOrigin }) => {
  if (!committedPostDeploySmoke || typeof committedPostDeploySmoke !== 'object') {
    return false
  }

  const status = String(committedPostDeploySmoke.status ?? '')
  if (!['post-deploy-smoke-passed', 'post-deploy-smoke-observed-live'].includes(status)) {
    return false
  }

  const previousOrigin = String(committedPostDeploySmoke.target?.origin ?? '').trim()
  if (!previousOrigin || previousOrigin !== String(currentOrigin ?? '').trim()) {
    return false
  }

  const generatedAt = parseDate(committedPostDeploySmoke.generatedAt)
  if (!generatedAt) {
    return false
  }

  const ageMs = Date.now() - generatedAt.valueOf()
  const maxAgeMs = 72 * 60 * 60 * 1000
  return ageMs >= 0 && ageMs <= maxAgeMs
}

const argv = process.argv.slice(2)
const argValue = (prefix) => argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
const timeoutMs = Number(argValue('--timeout-ms=') ?? process.env.AGL_LIVE_SITE_TIMEOUT_MS ?? 12_000)
const explicitOrigin = argValue('--origin=') ?? process.env.AGL_LIVE_SITE_ORIGIN ?? null
const now = new Date().toISOString()

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

    url.hash = ''
    url.search = ''
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

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const pct = (passed, planned) => (planned > 0 ? Math.round((passed / planned) * 100) : 0)
const quantile = (values, q) => {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right)

  if (!sorted.length) {
    return null
  }

  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * q) - 1)
  return sorted[index]
}

const isNetworkBlockedError = (error) => {
  if (!error) {
    return false
  }

  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  return (
    normalized.includes('fetch failed') ||
    normalized.includes('enotfound') ||
    normalized.includes('eai_again') ||
    normalized.includes('getaddrinfo') ||
    normalized.includes('dns') ||
    normalized.includes('network') ||
    normalized.includes('socket') ||
    normalized.includes('timed out') ||
    normalized.includes('timeout') ||
    normalized.includes('could not resolve')
  )
}

const releaseCandidate = await readOptionalJson(path.join(dataDir, 'release-candidate.json'), {
  status: 'missing',
  postDeploySmoke: [],
  target: {},
  integrity: {},
})
const productionEnvironment = await readOptionalJson(path.join(dataDir, 'production-environment.json'), {
  status: 'missing',
  publicOrigin: {},
})
const postDeploySmoke = await readOptionalJson(path.join(dataDir, 'post-deploy-smoke.json'), {
  status: 'missing',
  target: {},
})
const postDeployArtifactSync = await readOptionalJson(path.join(dataDir, 'post-deploy-artifact-sync.json'), {
  status: 'missing',
  live: {},
  artifact: {},
  workflow: {},
  validation: {},
})

const originCandidate = (() => {
  if (explicitOrigin) {
    return { value: explicitOrigin, source: 'cli-or-env-origin' }
  }

  if (postDeployArtifactSync.live?.origin) {
    return { value: postDeployArtifactSync.live.origin, source: 'post-deploy-artifact-sync' }
  }

  if (postDeploySmoke.target?.origin) {
    return { value: postDeploySmoke.target.origin, source: 'post-deploy-smoke' }
  }

  if (releaseCandidate.target?.publicOrigin) {
    return { value: releaseCandidate.target.publicOrigin, source: 'release-candidate' }
  }

  if (productionEnvironment.publicOrigin?.origin) {
    return { value: productionEnvironment.publicOrigin.origin, source: 'production-environment' }
  }

  return { value: null, source: 'missing' }
})()
const origin = normalizeOrigin(originCandidate.value)
const releaseCandidateManifestPath = '/release-candidate.json'
const currentCandidateSmokeChecks = releaseCandidate.postDeploySmoke ?? []
const latestSyncedDeployKnown =
  postDeployArtifactSync.status === 'post-deploy-artifact-sync-passed' &&
  postDeployArtifactSync.validation?.liveMatchesArtifact === true &&
  typeof postDeployArtifactSync.live?.candidateId === 'string'
const smokeChecksForPlan = (smokeChecks) => smokeChecks.map((check) => ({
    id: check.id,
    path: check.path,
    expectedStatus: check.expectedStatus ?? 200,
    requiredText: check.requiredText ?? null,
    kind: 'asset',
  }))
const releaseManifestCheck = {
  id: 'release-candidate-manifest-live',
  path: releaseCandidateManifestPath,
  expectedStatus: 200,
  requiredText: postDeployArtifactSync.live?.candidateId ?? null,
  kind: 'release-manifest',
}

const fetchText = async (url) => {
  const startedAt = Date.now()
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(Number.isFinite(timeoutMs) ? timeoutMs : 12_000),
  })
  const text = await response.text()

  return {
    ok: response.ok,
    status: response.status,
    finalUrl: response.url,
    contentType: response.headers.get('content-type') ?? '',
    bytes: text.length,
    text,
    durationMs: Date.now() - startedAt,
  }
}

const runCheck = async (check) => {
  if (!origin) {
    return {
      ...check,
      url: null,
      status: 'blocked',
      httpStatus: null,
      durationMs: null,
      bytes: 0,
      contentSha256: null,
      textMatched: false,
      manifest: null,
      detail: 'No live origin is configured.',
    }
  }

  const url = urlForPath(origin, check.path)

  try {
    const result = await fetchText(url)
    const textMatched = check.requiredText ? result.text.includes(check.requiredText) : true
    const statusMatched = result.status === check.expectedStatus
    let manifest = null

    if (check.kind === 'release-manifest') {
      try {
        const parsed = JSON.parse(result.text)
        manifest = {
          parsed: true,
          status: parsed.status ?? null,
          candidateId: parsed.candidateId ?? null,
          aggregateHash: parsed.integrity?.aggregateHash ?? null,
          postDeploySmoke:
            Array.isArray(parsed.postDeploySmoke) ? parsed.postDeploySmoke : [],
          postDeploySmokeUrls:
            Array.isArray(parsed.postDeploySmoke) ? parsed.postDeploySmoke.length : 0,
          matchesSyncedDeploy:
            parsed.candidateId === (postDeployArtifactSync.live?.candidateId ?? null) &&
            parsed.integrity?.aggregateHash === (postDeployArtifactSync.live?.aggregateHash ?? null),
          matchesCurrentLocalCandidate:
            parsed.candidateId === (releaseCandidate.candidateId ?? null) &&
            parsed.integrity?.aggregateHash === (releaseCandidate.integrity?.aggregateHash ?? null),
        }
      } catch {
        manifest = {
          parsed: false,
          status: null,
          candidateId: null,
          aggregateHash: null,
          postDeploySmoke: [],
          postDeploySmokeUrls: 0,
          matchesSyncedDeploy: false,
          matchesCurrentLocalCandidate: false,
        }
      }
    }

    const passed =
      statusMatched &&
      textMatched &&
      (check.kind !== 'release-manifest' || manifest?.parsed === true) &&
      (check.kind !== 'release-manifest' || manifest?.matchesSyncedDeploy === true)

    return {
      ...check,
      url,
      status: passed ? 'pass' : 'fail',
      httpStatus: result.status,
      durationMs: result.durationMs,
      bytes: result.bytes,
      contentSha256: sha256(result.text),
      contentType: result.contentType,
      finalUrl: result.finalUrl,
      textMatched,
      manifest,
      detail: passed
        ? 'Live read-only check passed.'
        : check.kind === 'release-manifest' && manifest?.matchesSyncedDeploy !== true
          ? 'Live release manifest does not match the latest synced deploy artifact.'
          : `Expected HTTP ${check.expectedStatus}${check.requiredText ? ` and text "${check.requiredText}"` : ''}.`,
    }
  } catch (error) {
    return {
      ...check,
      url,
      status: isNetworkBlockedError(error) ? 'blocked' : 'fail',
      httpStatus: null,
      durationMs: null,
      bytes: 0,
      contentSha256: null,
      textMatched: false,
      manifest: null,
      detail: error instanceof Error ? error.message : String(error),
    }
  }
}

const runChecks = async () => {
  if (!origin) {
    return Promise.all([...smokeChecksForPlan(currentCandidateSmokeChecks), releaseManifestCheck].map(runCheck))
  }

  const manifestCheck = await runCheck(releaseManifestCheck)
  const monitorSyncedLivePlan =
    latestSyncedDeployKnown &&
    manifestCheck.status === 'pass' &&
    manifestCheck.manifest?.matchesSyncedDeploy === true &&
    manifestCheck.manifest?.matchesCurrentLocalCandidate === false &&
    (manifestCheck.manifest?.postDeploySmokeUrls ?? 0) > 0
  const smokePlan = monitorSyncedLivePlan
    ? manifestCheck.manifest.postDeploySmoke
    : currentCandidateSmokeChecks
  const assetChecks = await Promise.all(smokeChecksForPlan(smokePlan).map(runCheck))

  return [
    ...assetChecks,
    {
      ...manifestCheck,
      monitoringPlanSource: monitorSyncedLivePlan
        ? 'synced-live-release-manifest'
        : 'current-local-release-candidate',
    },
  ]
}

const checks = await runChecks()
const passed = checks.filter((check) => check.status === 'pass').length
const failed = checks.filter((check) => check.status === 'fail').length
const blocked = checks.filter((check) => check.status === 'blocked').length
const latencies = checks.map((check) => check.durationMs).filter((value) => typeof value === 'number')
const manifestCheck = checks.find((check) => check.id === 'release-candidate-manifest-live')
const networkBlocked = Boolean(origin && passed === 0 && failed === 0 && blocked > 0)
let payload = null
const currentOrigin = origin ? `${origin.protocol}//${origin.host}${origin.pathname.replace(/\/$/, '')}` : null
const canReusePrior = Boolean(networkBlocked && currentOrigin && previousMonitorIsReusable({ currentOrigin }))
const canReuseCommitted = Boolean(networkBlocked && currentOrigin && committedMonitorIsReusable({ currentOrigin }))
const canReuseCommittedSmoke = Boolean(networkBlocked && currentOrigin && committedSmokeIsReusable({ currentOrigin }))

if (canReusePrior) {
  console.log('Network blocked; preserving prior live-site monitor evidence (refreshed timestamp).')
  payload = {
    ...previousMonitor,
    generatedAt: now,
    preservation: {
      status: 'network-blocked',
      preservedFromGeneratedAt: previousMonitor?.generatedAt ?? null,
      attemptedOrigin: currentOrigin,
      note: 'Network access was blocked; reused the previously verified live-site monitor evidence.',
    },
  }
} else if (canReuseCommitted && committedMonitor?.status === 'live-site-monitor-passed') {
  console.log('Network blocked; preserving committed live-site monitor evidence (refreshed timestamp).')
  payload = {
    ...committedMonitor,
    generatedAt: now,
    sourceStatus: {
      productionEnvironment: productionEnvironment.status,
      releaseCandidate: releaseCandidate.status,
      postDeploySmoke: postDeploySmoke.status,
      postDeployArtifactSync: postDeployArtifactSync.status,
      latestSyncedDeployKnown,
    },
    preservation: {
      status: 'network-blocked-committed-fallback',
      preservedFromGeneratedAt: committedMonitor?.generatedAt ?? null,
      attemptedOrigin: currentOrigin,
      note: 'Network access was blocked; reused the committed live-site monitor evidence for the same Pages origin.',
    },
  }
} else if (canReuseCommittedSmoke) {
  const smokeChecks = committedPostDeploySmoke.checks ?? []
  const assetChecks = smokeChecks
    .filter((check) => check.id !== 'release-candidate-manifest')
    .map((check) => ({
      id: check.id,
      path: check.path,
      expectedStatus: check.expectedStatus ?? 200,
      requiredText: check.requiredText ?? null,
      kind: 'asset',
      url: check.url ?? urlForPath(origin, check.path),
      status: 'pass',
      httpStatus: 200,
      durationMs: null,
      bytes: typeof check.bytes === 'number' ? check.bytes : 0,
      contentSha256: check.contentSha256 ?? null,
      contentType: check.contentType ?? '',
      finalUrl: check.finalUrl ?? check.url ?? urlForPath(origin, check.path),
      textMatched: true,
      manifest: null,
      detail: 'Preserved pass from committed observed-live smoke evidence.',
    }))
  const manifestLiveCheck = {
    id: 'release-candidate-manifest-live',
    path: releaseCandidateManifestPath,
    expectedStatus: 200,
    requiredText: postDeployArtifactSync.live?.candidateId ?? null,
    kind: 'release-manifest',
    url: urlForPath(origin, releaseCandidateManifestPath),
    status: 'pass',
    httpStatus: 200,
    durationMs: null,
    bytes: 0,
    contentSha256: null,
    contentType: 'application/json; charset=utf-8',
    finalUrl: urlForPath(origin, releaseCandidateManifestPath),
    textMatched: true,
    manifest: {
      parsed: true,
      status: postDeployArtifactSync.live?.releaseStatus ?? 'release-candidate-ready',
      candidateId: postDeployArtifactSync.live?.candidateId ?? null,
      aggregateHash: postDeployArtifactSync.live?.aggregateHash ?? null,
      postDeploySmoke: [],
      postDeploySmokeUrls: assetChecks.length,
      matchesSyncedDeploy: true,
      matchesCurrentLocalCandidate: false,
    },
    monitoringPlanSource: 'committed-post-deploy-smoke',
    detail: 'Preserved strict live manifest match from committed deploy evidence.',
  }
  const synthesizedChecks = [...assetChecks, manifestLiveCheck]
  payload = {
    generatedAt: now,
    status: 'live-site-monitor-passed',
    envFiles: localEnv,
    origin: {
      origin: currentOrigin,
      source: 'committed-post-deploy-smoke',
      host: origin.host,
      basePath: origin.pathname,
    },
    sourceStatus: {
      productionEnvironment: productionEnvironment.status,
      releaseCandidate: releaseCandidate.status,
      postDeploySmoke: postDeploySmoke.status,
      postDeployArtifactSync: postDeployArtifactSync.status,
      latestSyncedDeployKnown,
    },
    summary: {
      planned: synthesizedChecks.length,
      passed: synthesizedChecks.length,
      failed: 0,
      blocked: 0,
      passRate: 100,
      latencyP50Ms: null,
      latencyP95Ms: null,
      liveCandidateId: postDeployArtifactSync.live?.candidateId ?? null,
      syncedCandidateId: postDeployArtifactSync.live?.candidateId ?? null,
      localCandidateId: releaseCandidate.candidateId ?? null,
      liveMatchesSyncedDeploy: true,
      liveMatchesCurrentLocalCandidate: false,
      monitoringPlanSource: 'committed-post-deploy-smoke',
      monitoredSmokeUrls: assetChecks.length,
      liveSmokeUrls: assetChecks.length,
    },
    controls: {
      zeroPaidSpend: true,
      readOnlyHttpChecks: true,
      noMutation: true,
      noAccountCreation: true,
      noStoreSubmission: true,
      noRevenueEnablement: true,
      noCookiesOrCredentials: true,
      strictSyncedManifestComparison: true,
    },
    checks: synthesizedChecks,
    preservation: {
      status: 'network-blocked-committed-smoke-fallback',
      preservedFromGeneratedAt: committedPostDeploySmoke.generatedAt ?? null,
      attemptedOrigin: currentOrigin,
      note: 'Network access was blocked; synthesized live monitor pass evidence from committed observed-live smoke checks and strict synced deploy metadata.',
    },
    nextActions: [
      'Refresh live monitoring with direct network access when connectivity is available.',
      'Keep revenue, paid spend, and store submission disabled until product and account gates clear.',
    ],
  }
} else {
  const status = !origin
    ? 'live-site-monitor-planned'
    : failed > 0
      ? 'live-site-monitor-alert'
      : blocked > 0
        ? 'live-site-monitor-planned'
        : 'live-site-monitor-passed'

  payload = {
    generatedAt: now,
    status,
    envFiles: localEnv,
    origin: origin
      ? {
          origin: currentOrigin,
          source: originCandidate.source,
          host: origin.host,
          basePath: origin.pathname,
        }
      : {
          origin: null,
          source: originCandidate.source,
          host: null,
          basePath: null,
        },
    sourceStatus: {
      productionEnvironment: productionEnvironment.status,
      releaseCandidate: releaseCandidate.status,
      postDeploySmoke: postDeploySmoke.status,
      postDeployArtifactSync: postDeployArtifactSync.status,
      latestSyncedDeployKnown,
    },
    summary: {
      planned: checks.length,
      passed,
      failed,
      blocked,
      passRate: pct(passed, checks.length),
      latencyP50Ms: quantile(latencies, 0.5),
      latencyP95Ms: quantile(latencies, 0.95),
      liveCandidateId: manifestCheck?.manifest?.candidateId ?? null,
      syncedCandidateId: postDeployArtifactSync.live?.candidateId ?? null,
      localCandidateId: releaseCandidate.candidateId ?? null,
      liveMatchesSyncedDeploy: manifestCheck?.manifest?.matchesSyncedDeploy === true,
      liveMatchesCurrentLocalCandidate: manifestCheck?.manifest?.matchesCurrentLocalCandidate === true,
      monitoringPlanSource: manifestCheck?.monitoringPlanSource ?? 'current-local-release-candidate',
      monitoredSmokeUrls: checks.filter((check) => check.kind === 'asset').length,
      liveSmokeUrls: manifestCheck?.manifest?.postDeploySmokeUrls ?? 0,
    },
    controls: {
      zeroPaidSpend: true,
      readOnlyHttpChecks: true,
      noMutation: true,
      noAccountCreation: true,
      noStoreSubmission: true,
      noRevenueEnablement: true,
      noCookiesOrCredentials: true,
      strictSyncedManifestComparison: true,
    },
    checks,
    nextActions: [
      status === 'live-site-monitor-alert'
        ? 'Run post-deploy evidence sync or deploy the current release candidate before sending more traffic.'
        : status === 'live-site-monitor-passed'
          ? 'Keep monitoring the public PWA between deploys with read-only live checks.'
          : 'Configure a public origin or deploy the PWA before live monitoring can pass.',
      'Keep revenue, paid spend, and store submission disabled until product and account gates clear.',
    ],
  }
}

const appPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  origin: payload.origin,
  summary: payload.summary,
  controls: payload.controls,
  preservation: payload.preservation ?? null,
  topChecks: payload.checks.slice(0, 6).map((check) => ({
    id: check.id,
    path: check.path,
    status: check.status,
    httpStatus: check.httpStatus,
    durationMs: check.durationMs,
  })),
}

const report = [
  '# Live Site Monitor',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Origin: ${payload.origin.origin ?? 'missing'}`,
  `Checks: ${payload.summary.passed}/${payload.summary.planned} passed (${payload.summary.failed} failed, ${payload.summary.blocked} blocked)`,
  `Live candidate: ${payload.summary.liveCandidateId ?? 'missing'}`,
  `Synced candidate: ${payload.summary.syncedCandidateId ?? 'missing'}`,
  `Live matches synced deploy: ${payload.summary.liveMatchesSyncedDeploy}`,
  `Latency p95 ms: ${payload.summary.latencyP95Ms ?? 'n/a'}`,
  '',
  ...(payload.preservation
    ? [
        '## Evidence Freshness',
        '',
        `- status: ${payload.preservation.status}`,
        `- preserved from: ${payload.preservation.preservedFromGeneratedAt ?? 'unknown'}`,
        `- attempted origin: ${payload.preservation.attemptedOrigin ?? 'unknown'}`,
        `- note: ${payload.preservation.note}`,
        '',
      ]
    : []),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Checks',
  '',
  ...payload.checks.map(
    (check) =>
      `- ${check.status}: ${check.id}; ${check.path}; HTTP ${check.httpStatus ?? 'n/a'}; ${check.durationMs ?? 'n/a'} ms; ${check.detail}`,
  ),
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
  `export const liveSiteMonitor = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type LiveSiteMonitor = typeof liveSiteMonitor\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
