import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const distDir = path.join(root, 'dist')
const outputJsonPath = path.join(dataDir, 'post-deploy-smoke.json')
const outputTsPath = path.join(root, 'src', 'data', 'postDeploySmoke.ts')
const reportPath = path.join(root, 'reports', 'post-deploy-smoke-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const argv = process.argv.slice(2)
const argValue = (prefix) => argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
const assertMode = argv.includes('--assert')
const assertLocalMode = argv.includes('--assert-local')
const timeoutMs = Number(argValue('--timeout-ms=') ?? process.env.AGL_POST_DEPLOY_TIMEOUT_MS ?? 12_000)
const explicitOrigin = argValue('--origin=')
const allowPlannedPublicOrigin = ['1', 'true', 'yes'].includes(
  String(process.env.AGL_POST_DEPLOY_USE_PUBLIC_ORIGIN ?? '').toLowerCase(),
)

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

const urlForPath = (origin, smokePath) => {
  const basePath = origin.pathname.endsWith('/') ? origin.pathname : `${origin.pathname}/`
  const relativePath = smokePath === '/' ? '' : smokePath.replace(/^\//, '')
  const pathname = `${basePath}${relativePath}`.replace(/\/+/g, '/')
  const nextUrl = new URL(`${origin.protocol}//${origin.host}`)
  nextUrl.pathname = pathname
  return nextUrl.toString()
}

const distPathForSmokePath = (smokePath) =>
  path.join(distDir, smokePath === '/' ? 'index.html' : smokePath.replace(/^\//, ''))

const fetchText = async (url) => {
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
    text,
  }
}

const releaseCandidate = await readJson(path.join(dataDir, 'release-candidate.json'))
const deployment = await readJson(path.join(dataDir, 'deployment-plan.json'))
const productionResponse = await readJson(path.join(dataDir, 'production-response.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const productionEnvironment = await readOptionalJson(path.join(dataDir, 'production-environment.json'), {
  publicOrigin: {},
})
const deployedOriginCandidate = (() => {
  if (explicitOrigin) {
    return { value: explicitOrigin, source: 'cli-origin', strictManifestComparison: true }
  }

  if (process.env.AGL_DEPLOYED_PWA_ORIGIN) {
    return {
      value: process.env.AGL_DEPLOYED_PWA_ORIGIN,
      source: 'agl-deployed-pwa-origin',
      strictManifestComparison: true,
    }
  }

  if (process.env.DEPLOYED_PWA_ORIGIN) {
    return {
      value: process.env.DEPLOYED_PWA_ORIGIN,
      source: 'deployed-pwa-origin',
      strictManifestComparison: true,
    }
  }

  if (allowPlannedPublicOrigin && process.env.AGL_PUBLIC_ORIGIN) {
    return { value: process.env.AGL_PUBLIC_ORIGIN, source: 'agl-public-origin-opt-in', strictManifestComparison: false }
  }

  if (allowPlannedPublicOrigin && process.env.PUBLIC_SITE_URL) {
    return { value: process.env.PUBLIC_SITE_URL, source: 'public-site-url-opt-in', strictManifestComparison: false }
  }

  if (releaseCandidate.target?.publicOrigin) {
    return {
      value: releaseCandidate.target.publicOrigin,
      source: 'release-candidate-public-origin',
      strictManifestComparison: false,
    }
  }

  if (productionEnvironment.publicOrigin?.origin) {
    return {
      value: productionEnvironment.publicOrigin.origin,
      source: 'production-environment-public-origin',
      strictManifestComparison: false,
    }
  }

  return { value: '', source: 'missing', strictManifestComparison: false }
})()
const origin = normalizeOrigin(deployedOriginCandidate.value)
const originSource = origin ? deployedOriginCandidate.source : 'missing'
const strictManifestComparison = origin ? deployedOriginCandidate.strictManifestComparison : false
const smokePlan = releaseCandidate.postDeploySmoke ?? []
const plannedChecks = smokePlan.map((item) => ({
  id: item.id,
  path: item.path,
  url: origin ? urlForPath(origin, item.path) : item.url,
  expectedStatus: item.expectedStatus,
  requiredText: item.requiredText,
  status: origin ? 'pending' : 'blocked',
  detail: origin ? 'Ready to fetch deployed URL.' : 'No deployed origin configured.',
}))

const manifestCheck = {
  id: 'release-candidate-manifest',
  path: '/release-candidate.json',
  url: origin ? urlForPath(origin, '/release-candidate.json') : '${DEPLOYED_PWA_ORIGIN}/release-candidate.json',
  expectedStatus: 200,
  requiredText: releaseCandidate.candidateId,
  status: origin ? 'pending' : 'blocked',
  detail: origin ? 'Ready to compare deployed release manifest.' : 'No deployed origin configured.',
}

const runLocalArtifactChecks = async () => {
  const localChecks = []

  for (const check of plannedChecks) {
    const filePath = distPathForSmokePath(check.path)

    try {
      const text = await readFile(filePath, 'utf8')
      const textMatches = check.requiredText ? text.includes(check.requiredText) : true

      localChecks.push({
        id: check.id,
        path: check.path,
        file: path.relative(root, filePath),
        expectedStatus: check.expectedStatus,
        status: textMatches ? 'pass' : 'fail',
        bytes: text.length,
        textMatched: textMatches,
        detail: textMatches
          ? 'Local production artifact matched required text.'
          : `Local production artifact is missing required text "${check.requiredText}".`,
      })
    } catch (error) {
      localChecks.push({
        id: check.id,
        path: check.path,
        file: path.relative(root, filePath),
        expectedStatus: check.expectedStatus,
        status: 'fail',
        bytes: 0,
        textMatched: false,
        detail: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const manifestPath = distPathForSmokePath(manifestCheck.path)

  try {
    const text = await readFile(manifestPath, 'utf8')
    let parsed = null

    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = null
    }

    const candidateMatches = parsed?.candidateId === releaseCandidate.candidateId
    const hashMatches = parsed?.integrity?.aggregateHash === releaseCandidate.integrity?.aggregateHash

    localChecks.push({
      id: manifestCheck.id,
      path: manifestCheck.path,
      file: path.relative(root, manifestPath),
      expectedStatus: manifestCheck.expectedStatus,
      status: candidateMatches && hashMatches ? 'pass' : 'fail',
      bytes: text.length,
      candidateMatches,
      hashMatches,
      localCandidateId: parsed?.candidateId ?? null,
      localAggregateHash: parsed?.integrity?.aggregateHash ?? null,
      detail:
        candidateMatches && hashMatches
          ? 'Local release manifest matches the release candidate.'
          : 'Local release manifest does not match the release candidate.',
    })
  } catch (error) {
    localChecks.push({
      id: manifestCheck.id,
      path: manifestCheck.path,
      file: path.relative(root, manifestPath),
      expectedStatus: manifestCheck.expectedStatus,
      status: 'fail',
      bytes: 0,
      candidateMatches: false,
      hashMatches: false,
      detail: error instanceof Error ? error.message : String(error),
    })
  }

  const failed = localChecks.filter((check) => check.status === 'fail')
  const passed = localChecks.filter((check) => check.status === 'pass')

  return {
    status: failed.length ? 'predeploy-artifact-smoke-failed' : 'predeploy-artifact-smoke-passed',
    artifactPath: releaseCandidate.target?.artifactPath ?? 'dist',
    summary: {
      planned: localChecks.length,
      passed: passed.length,
      failed: failed.length,
    },
    controls: {
      readOnlyFileChecks: true,
      noNetworkRequired: true,
      requiredTextChecks: true,
      manifestHashComparisonRequired: true,
    },
    checks: localChecks,
  }
}

const runChecks = async () => {
  if (!origin) {
    return [...plannedChecks, manifestCheck]
  }

  const smokeResults = []

  for (const check of plannedChecks) {
    try {
      const response = await fetchText(check.url)
      const statusMatches = response.status === check.expectedStatus
      const textMatches = check.requiredText ? response.text.includes(check.requiredText) : true

      smokeResults.push({
        ...check,
        status: statusMatches && textMatches ? 'pass' : 'fail',
        actualStatus: response.status,
        finalUrl: response.finalUrl,
        contentType: response.contentType,
        bytes: response.text.length,
        textMatched: textMatches,
        detail: statusMatches && textMatches
          ? 'Live URL matched status and required text.'
          : `Expected ${check.expectedStatus}${check.requiredText ? ` and text "${check.requiredText}"` : ''}.`,
      })
    } catch (error) {
      smokeResults.push({
        ...check,
        status: 'fail',
        actualStatus: null,
        finalUrl: check.url,
        contentType: null,
        bytes: 0,
        textMatched: false,
        detail: error instanceof Error ? error.message : String(error),
      })
    }
  }

  try {
    const response = await fetchText(manifestCheck.url)
    let parsed = null

    try {
      parsed = JSON.parse(response.text)
    } catch {
      parsed = null
    }

    const candidateMatches = parsed?.candidateId === releaseCandidate.candidateId
    const hashMatches = parsed?.integrity?.aggregateHash === releaseCandidate.integrity?.aggregateHash
    const statusMatches = response.status === 200
    const deployedManifestReady =
      statusMatches &&
      parsed?.status === 'release-candidate-ready' &&
      typeof parsed?.candidateId === 'string' &&
      typeof parsed?.integrity?.aggregateHash === 'string'
    const localCandidateMatches = candidateMatches && hashMatches
    const manifestStatus = strictManifestComparison ? localCandidateMatches && statusMatches : deployedManifestReady

    smokeResults.push({
      ...manifestCheck,
      status: manifestStatus ? 'pass' : 'fail',
      actualStatus: response.status,
      finalUrl: response.finalUrl,
      contentType: response.contentType,
      bytes: response.text.length,
      candidateMatches,
      hashMatches,
      localCandidateMatches,
      strictManifestComparison,
      deployedReleaseStatus: parsed?.status ?? null,
      deployedCandidateId: parsed?.candidateId ?? null,
      deployedAggregateHash: parsed?.integrity?.aggregateHash ?? null,
      detail:
        statusMatches && localCandidateMatches
          ? 'Deployed release manifest matches the local release candidate.'
          : manifestStatus
            ? 'Live release manifest is reachable; it does not match the current local release candidate.'
            : 'Deployed release manifest does not match the expected release manifest contract.',
    })
  } catch (error) {
    smokeResults.push({
      ...manifestCheck,
      status: 'fail',
      actualStatus: null,
      finalUrl: manifestCheck.url,
      contentType: null,
      bytes: 0,
      candidateMatches: false,
      hashMatches: false,
      localCandidateMatches: false,
      strictManifestComparison,
      deployedReleaseStatus: null,
      detail: error instanceof Error ? error.message : String(error),
    })
  }

  return smokeResults
}

const localArtifactSmoke = await runLocalArtifactChecks()
const checks = await runChecks()
const failedChecks = checks.filter((check) => check.status === 'fail')
const blockedChecks = checks.filter((check) => check.status === 'blocked')
const passedChecks = checks.filter((check) => check.status === 'pass')
const deployedManifestCheck = checks.find((check) => check.id === 'release-candidate-manifest')
const liveRelease = origin
  ? {
      status: deployedManifestCheck?.deployedReleaseStatus ?? null,
      candidateId: deployedManifestCheck?.deployedCandidateId ?? null,
      aggregateHash: deployedManifestCheck?.deployedAggregateHash ?? null,
      localCandidateMatches: deployedManifestCheck?.localCandidateMatches === true,
      strictManifestComparison,
    }
  : null
const observedDifferentLiveCandidate = Boolean(
  origin &&
    !strictManifestComparison &&
    liveRelease?.candidateId &&
    liveRelease?.aggregateHash &&
    liveRelease.localCandidateMatches === false,
)
const status = !origin
  ? 'blocked-missing-origin'
  : failedChecks.length
    ? 'post-deploy-smoke-failed'
    : observedDifferentLiveCandidate
      ? 'post-deploy-smoke-observed-live'
      : 'post-deploy-smoke-passed'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  envFiles: localEnv,
  target: {
    origin: origin?.toString() ?? null,
    originSource,
    provider: deployment.target?.provider ?? releaseCandidate.target?.provider ?? 'github-pages',
    candidateId: releaseCandidate.candidateId,
    aggregateHash: releaseCandidate.integrity?.aggregateHash ?? null,
    strictManifestComparison,
  },
  liveRelease,
  sourceStatus: {
    deployment: deployment.status,
    releaseCandidate: releaseCandidate.status,
    productionResponse: productionResponse.status,
  },
  summary: {
    planned: checks.length,
    passed: passedChecks.length,
    failed: failedChecks.length,
    blocked: blockedChecks.length,
  },
  localArtifactSmoke,
  controls: {
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noAccountCreation: true,
    readOnlyHttpChecks: true,
    localArtifactSmokeRequired: true,
    manifestHashComparisonRequired: true,
    strictManifestComparison,
    inferredLiveObservationAllowed: !strictManifestComparison,
  },
  checks,
  nextActions: [
    origin
      ? failedChecks.length
        ? 'Hold promotion and inspect failed post-deploy smoke checks.'
        : observedDifferentLiveCandidate
          ? `Live Pages is reachable and serving ${liveRelease.candidateId}; run the deploy workflow for strict proof of the current local candidate if needed.`
          : 'Keep the deployed Pages URL active for live traffic collection.'
      : 'Run this after deployment with AGL_DEPLOYED_PWA_ORIGIN set to the Pages URL.',
    'Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass.',
  ],
}

const report = [
  '# Post-Deploy Smoke',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Origin: ${payload.target.origin ?? 'missing'}`,
  `Origin source: ${payload.target.originSource}`,
  `Candidate: ${payload.target.candidateId}`,
  `Live candidate: ${payload.liveRelease?.candidateId ?? 'missing'}`,
  '',
  '## Summary',
  '',
  `- Planned: ${payload.summary.planned}`,
  `- Passed: ${payload.summary.passed}`,
  `- Failed: ${payload.summary.failed}`,
  `- Blocked: ${payload.summary.blocked}`,
  '',
  '## Local Artifact Smoke',
  '',
  `Status: ${payload.localArtifactSmoke.status}`,
  `Artifact path: ${payload.localArtifactSmoke.artifactPath}`,
  `Checks: ${payload.localArtifactSmoke.summary.passed}/${payload.localArtifactSmoke.summary.planned} passed`,
  ...payload.localArtifactSmoke.checks.map(
    (check) => `- ${check.status}: ${check.id} - ${check.file} - ${check.detail}`,
  ),
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.url} - ${check.detail}`),
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
  `export const postDeploySmoke = ${JSON.stringify(payload, null, 2)} as const\n\nexport type PostDeploySmoke = typeof postDeploySmoke\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (assertMode && status !== 'post-deploy-smoke-passed') {
  console.error(`Post-deploy smoke status is ${status}.`)
  process.exit(1)
}

if (assertLocalMode && localArtifactSmoke.status !== 'predeploy-artifact-smoke-passed') {
  console.error(`Local artifact smoke status is ${localArtifactSmoke.status}.`)
  process.exit(1)
}
