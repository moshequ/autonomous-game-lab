import { createHash } from 'node:crypto'
import { access, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const distDir = path.join(root, 'dist')
const outputJsonPath = path.join(dataDir, 'release-candidate.json')
const outputTsPath = path.join(root, 'src', 'data', 'releaseCandidate.ts')
const outputReportPath = path.join(root, 'reports', 'release-candidate-latest.md')
const distManifestPath = path.join(distDir, 'release-candidate.json')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const sha256 = (value) => createHash('sha256').update(value).digest('hex')

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json'],
  ['.xml', 'application/xml; charset=utf-8'],
])

const cachePolicyFor = (filePath) => {
  if (filePath.startsWith('assets/')) {
    return 'public, max-age=31536000, immutable'
  }

  if (['index.html', 'sw.js', 'registerSW.js', 'release-candidate.json'].includes(filePath)) {
    return 'no-cache'
  }

  if (filePath.endsWith('.html')) {
    return 'no-cache'
  }

  return 'public, max-age=3600'
}

const listFiles = async (directory, prefix = '') => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)
      const relativePath = path.posix.join(prefix, entry.name)

      if (entry.isDirectory()) {
        return listFiles(absolutePath, relativePath)
      }

      if (!entry.isFile()) {
        return []
      }

      return [relativePath]
    }),
  )

  return files.flat()
}

const normalizeBasePath = (basePath) => {
  if (!basePath || basePath === '/') {
    return '/'
  }

  return `/${String(basePath).replace(/^\/|\/$/g, '')}/`
}

const publicUrl = (origin, basePath, filePath) => {
  const pathPart = filePath === 'index.html' ? '' : filePath
  const normalizedBasePath = normalizeBasePath(basePath)
  const pathname = `${normalizedBasePath}${pathPart}`.replace(/\/+/g, '/')

  if (!origin) {
    return `\${DEPLOYED_PWA_ORIGIN}${pathname}`
  }

  return new URL(pathname, origin).toString()
}

const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'privacy.html',
  'support.html',
  'measurement-status.html',
  'measurement-status.json',
  'owner-unlock-brief.json',
  'owner-unlock-preflight.json',
  'analytics-unlock.html',
  'analytics-unlock.json',
  'product-gate-recovery.html',
  'product-gate-recovery.json',
  'install.html',
  'compliance.json',
  'sitemap.xml',
  'robots.txt',
  'gate-sample.html',
  'sample-next.html',
  'sample-next.json',
  'sample-fastest.html',
  'sample-fastest.json',
  'seed-kit.html',
  'seed-next.html',
  'seed-next.json',
  'share-manifest.json',
  'monetization.html',
  'monetization.json',
  'app-ads.txt',
  '.nojekyll',
  '.well-known/assetlinks.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
]

if (!(await exists(distDir))) {
  console.error('dist/ does not exist. Run npm run build before generating a release candidate.')
  process.exit(1)
}

const [
  environment,
  performanceBudget,
  releaseHealth,
  productionResponse,
  unitEconomics,
  storePackage,
  growth,
  deployment,
] = await Promise.all([
  readOptionalJson(path.join(dataDir, 'production-environment.json'), {
    status: 'missing',
    publicOrigin: { origin: null, basePath: '/' },
  }),
  readOptionalJson(path.join(dataDir, 'performance-budget.json'), { status: 'missing', controls: {} }),
  readOptionalJson(path.join(dataDir, 'release-health.json'), { status: 'missing', controls: {} }),
  readOptionalJson(path.join(dataDir, 'production-response.json'), { status: 'missing', controls: {} }),
  readOptionalJson(path.join(dataDir, 'unit-economics.json'), { status: 'missing', controls: {} }),
  readOptionalJson(path.join(dataDir, 'store-package.json'), { privacyPolicy: {}, supportPage: {} }),
  readOptionalJson(path.join(dataDir, 'growth-plan.json'), { gamePages: [] }),
  readOptionalJson(path.join(dataDir, 'deployment-plan.json'), { status: 'missing', target: {} }),
])

const filePaths = (await listFiles(distDir))
  .filter((filePath) => filePath !== 'release-candidate.json')
  .sort((left, right) => left.localeCompare(right))
const fileEntries = await Promise.all(
  filePaths.map(async (filePath) => {
    const absolutePath = path.join(distDir, filePath)
    const [metadata, bytes] = await Promise.all([stat(absolutePath), readFile(absolutePath)])

    return {
      path: filePath,
      bytes: metadata.size,
      sha256: sha256(bytes),
      contentType: mimeTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
      cacheControl: cachePolicyFor(filePath),
    }
  }),
)
const filePathSet = new Set(fileEntries.map((entry) => entry.path))
const requiredFileChecks = requiredFiles.map((filePath) => ({
  path: filePath,
  status: filePathSet.has(filePath) ? 'pass' : 'blocker',
}))
const gamePages = fileEntries.filter((entry) => entry.path.startsWith('games/') && entry.path.endsWith('.html'))
const assetEntries = fileEntries.filter((entry) => entry.path.startsWith('assets/'))
const aggregateHash = sha256(
  JSON.stringify(fileEntries.map((entry) => ({ path: entry.path, bytes: entry.bytes, sha256: entry.sha256 }))),
)
const totalBytes = fileEntries.reduce((sum, entry) => sum + entry.bytes, 0)
const publicOrigin = environment.publicOrigin?.origin ?? null
const basePath = environment.publicOrigin?.basePath ?? process.env.VITE_BASE_PATH ?? '/'
const smokePaths = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'privacy.html',
  'support.html',
  'measurement-status.html',
  'measurement-status.json',
  'owner-unlock-brief.json',
  'owner-unlock-preflight.json',
  'analytics-unlock.html',
  'analytics-unlock.json',
  'product-gate-recovery.html',
  'product-gate-recovery.json',
  'install.html',
  'compliance.json',
  'monetization.json',
  'app-ads.txt',
  '.well-known/assetlinks.json',
  'gate-sample.html',
  'sample-next.html',
  'sample-next.json',
  'sample-fastest.html',
  'sample-fastest.json',
  'seed-kit.html',
  'seed-next.html',
  'seed-next.json',
  'sitemap.xml',
  'monetization.html',
  gamePages[0]?.path,
].filter(Boolean)

const requiredTextForSmokePath = (filePath) => {
  if (filePath === 'index.html') {
    return 'Autonomous Game Lab'
  }

  if (filePath === 'compliance.json') {
    return 'store-compliance'
  }

  if (filePath === 'monetization.json') {
    return 'blocked-by-product-gates'
  }

  if (filePath === 'monetization.html') {
    return 'Monetization Preflight'
  }

  if (filePath === 'app-ads.txt') {
    return 'Revenue features are disabled'
  }

  if (filePath === 'analytics-unlock.html') {
    return 'Production Analytics Unlock'
  }

  if (filePath === 'product-gate-recovery.html') {
    return 'Product Gate Recovery'
  }

  if (filePath === 'product-gate-recovery.json') {
    return 'product-gate-recovery-ready'
  }

  if (filePath === 'owner-unlock-preflight.json') {
    return 'owner-unlock-preflight'
  }

  if (filePath === '.well-known/assetlinks.json') {
    return 'delegate_permission/common.handle_all_urls'
  }

  return filePath.endsWith('.html') ? 'Autonomous Game Lab' : null
}

const postDeploySmoke = smokePaths.map((filePath) => ({
  id: filePath === 'index.html' ? 'app-shell' : filePath.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, ''),
  path: filePath === 'index.html' ? '/' : `/${filePath}`,
  url: publicUrl(publicOrigin, basePath, filePath),
  expectedStatus: 200,
  requiredText: requiredTextForSmokePath(filePath),
}))
const cachePolicy = [
  {
    pattern: '/assets/*',
    cacheControl: 'public, max-age=31536000, immutable',
    reason: 'Vite emits content-hashed immutable assets.',
  },
  {
    pattern: '/*.html',
    cacheControl: 'no-cache',
    reason: 'HTML entrypoints should reveal the newest build quickly.',
  },
  {
    pattern: '/sw.js',
    cacheControl: 'no-cache',
    reason: 'Service worker updates must not be pinned by the browser cache.',
  },
  {
    pattern: '/manifest.webmanifest',
    cacheControl: 'public, max-age=3600',
    reason: 'Install metadata can be cached briefly and refreshed daily.',
  },
]
const checks = [
  {
    id: 'dist-inventory',
    status: fileEntries.length >= 20 ? 'pass' : 'blocker',
    detail: `${fileEntries.length} dist files inventoried.`,
  },
  {
    id: 'required-files',
    status: requiredFileChecks.every((check) => check.status === 'pass') ? 'pass' : 'blocker',
    detail: `${requiredFileChecks.filter((check) => check.status === 'pass').length}/${requiredFileChecks.length} required files present.`,
  },
  {
    id: 'game-pages',
    status: gamePages.length >= Math.max(1, growth.gamePages?.length ?? 0) ? 'pass' : 'blocker',
    detail: `${gamePages.length} generated game page(s) in dist.`,
  },
  {
    id: 'performance-budget',
    status: performanceBudget.status === 'performance-budget-ready' ? 'pass' : 'blocker',
    detail: `Performance budget is ${performanceBudget.status}.`,
  },
  {
    id: 'release-health',
    status: releaseHealth.controls?.canDeploy === true ? 'pass' : 'blocker',
    detail: `Release health is ${releaseHealth.status}.`,
  },
  {
    id: 'production-response',
    status: productionResponse.controls?.deployAllowed === true ? 'pass' : 'blocker',
    detail: `Deploy allowed is ${productionResponse.controls?.deployAllowed === true}.`,
  },
  {
    id: 'spend-guard',
    status:
      unitEconomics.controls?.maxDailySpendUsd === 0 &&
      unitEconomics.controls?.paidAcquisitionAllowed === false &&
      unitEconomics.controls?.storeSpendAllowed === false
        ? 'pass'
        : 'blocker',
    detail: `Spend mode is ${unitEconomics.controls?.spendMode ?? unitEconomics.status}.`,
  },
  {
    id: 'post-deploy-smoke-plan',
    status: postDeploySmoke.length >= 6 ? 'pass' : 'blocker',
    detail: `${postDeploySmoke.length} post-deploy smoke URL(s) planned.`,
  },
]
const blockingChecks = checks.filter((check) => check.status !== 'pass')
const payload = {
  generatedAt: new Date().toISOString(),
  status: blockingChecks.length ? 'release-candidate-blocked' : 'release-candidate-ready',
  candidateId: `pwa-${aggregateHash.slice(0, 12)}`,
  target: {
    provider: deployment.target?.provider ?? 'github-pages',
    artifactPath: 'dist',
    manifestPath: 'dist/release-candidate.json',
    publicOrigin,
    publicOriginStatus: environment.publicOrigin?.status ?? 'missing',
    basePath,
  },
  summary: {
    totalFiles: fileEntries.length,
    totalBytes,
    totalKb: Math.round((totalBytes / 1024) * 10) / 10,
    assetFiles: assetEntries.length,
    htmlFiles: fileEntries.filter((entry) => entry.path.endsWith('.html')).length,
    gamePages: gamePages.length,
    requiredFilesPresent: requiredFileChecks.every((check) => check.status === 'pass'),
    postDeploySmokeUrls: postDeploySmoke.length,
  },
  integrity: {
    algorithm: 'sha256',
    aggregateHash,
    files: fileEntries,
    requiredFileChecks,
  },
  postDeploySmoke,
  cachePolicy,
  rollback: {
    strategy: 'redeploy-last-known-good-pages-artifact',
    source: 'GitHub Pages deployment history and uploaded autonomous artifacts',
    trigger:
      productionResponse.controls?.rollbackRequired === true
        ? 'rollback-required-now'
        : 'runtime health, smoke failure, or deploy gate regression',
  },
  complianceUrls: {
    privacy: storePackage.privacyPolicy?.productionUrl ?? publicUrl(publicOrigin, basePath, 'privacy.html'),
    support: storePackage.supportPage?.productionUrl ?? publicUrl(publicOrigin, basePath, 'support.html'),
    hostedPrivacyStatus: storePackage.privacyPolicy?.productionUrlStatus ?? 'needs-hosted-domain',
  },
  controls: {
    zeroPaidSpend: unitEconomics.controls?.maxDailySpendUsd === 0,
    noExternalAccountCreation: true,
    noWorkflowExecution: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    contentHashesRecorded: Boolean(aggregateHash),
    postDeploySmokeRequired: true,
  },
  checks,
  nextActions: [
    publicOrigin
      ? `After the Pages workflow deploys, run the smoke URLs under ${publicOrigin}.`
      : 'After the Pages workflow deploys, replace ${DEPLOYED_PWA_ORIGIN} with the Pages URL and run the smoke plan.',
    'Keep revenue, paid acquisition, and app-store submission disabled until their gates pass.',
  ],
}

const report = [
  '# Release Candidate',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Candidate: ${payload.candidateId}`,
  `Files: ${payload.summary.totalFiles}`,
  `Size: ${payload.summary.totalKb} KB`,
  `Aggregate SHA-256: ${payload.integrity.aggregateHash}`,
  '',
  '## Checks',
  '',
  ...payload.checks.map((check) => `- ${check.status}: ${check.id} - ${check.detail}`),
  '',
  '## Required Files',
  '',
  ...payload.integrity.requiredFileChecks.map((check) => `- ${check.status}: ${check.path}`),
  '',
  '## Post-Deploy Smoke',
  '',
  ...payload.postDeploySmoke.map((item) => `- ${item.expectedStatus}: ${item.url}`),
  '',
  '## Controls',
  '',
  `- Zero paid spend: ${payload.controls.zeroPaidSpend}`,
  `- No workflow execution: ${payload.controls.noWorkflowExecution}`,
  `- No store submission: ${payload.controls.noStoreSubmission}`,
  `- Content hashes recorded: ${payload.controls.contentHashesRecorded}`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(outputReportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const releaseCandidate = ${JSON.stringify(payload, null, 2)} as const\n\nexport type ReleaseCandidate = typeof releaseCandidate\n`,
)
await writeFile(outputReportPath, report.join('\n'))
await writeFile(distManifestPath, JSON.stringify(payload, null, 2) + '\n')

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, outputReportPath)}`)
console.log(`Wrote ${path.relative(root, distManifestPath)}`)

if (process.argv.includes('--assert') && blockingChecks.length) {
  console.error(`Release candidate blocked by ${blockingChecks.length} check(s).`)
  process.exit(1)
}
