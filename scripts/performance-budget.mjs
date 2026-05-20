import { access, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const assetsDir = path.join(distDir, 'assets')
const outputJsonPath = path.join(root, 'data', 'performance-budget.json')
const outputTsPath = path.join(root, 'src', 'data', 'performanceBudget.ts')
const reportPath = path.join(root, 'reports', 'performance-budget-latest.md')

const bytesToKb = (bytes) => Math.round((bytes / 1024) * 10) / 10
const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)
const readOptionalText = async (filePath) =>
  exists(filePath).then((found) => (found ? readFile(filePath, 'utf8') : ''))
const sum = (items, field) => items.reduce((total, item) => total + item[field], 0)
const configuredBasePath = process.env.VITE_BASE_PATH ?? '/'
const normalizedBasePath = configuredBasePath.replace(/^\//, '').replace(/\/?$/, '/')
const normalizeAssetPath = (assetPath) => {
  const normalizedAssetPath = assetPath.replace(/^\//, '')

  if (normalizedBasePath !== '/' && normalizedAssetPath.startsWith(normalizedBasePath)) {
    return normalizedAssetPath.slice(normalizedBasePath.length)
  }

  return normalizedAssetPath
}

const indexHtmlPath = path.join(distDir, 'index.html')
const swPath = path.join(distDir, 'sw.js')
const manifestPath = path.join(distDir, 'manifest.webmanifest')

const indexHtml = await readFile(indexHtmlPath, 'utf8')
const serviceWorker = await readOptionalText(swPath)
const assetFiles = await readdir(assetsDir).catch(() => [])
const jsFiles = assetFiles.filter((file) => file.endsWith('.js')).sort()
const cssFiles = assetFiles.filter((file) => file.endsWith('.css')).sort()

const entryScriptPaths = [...indexHtml.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) =>
  normalizeAssetPath(match[1]),
)
const stylesheetPaths = [...indexHtml.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g)].map(
  (match) => normalizeAssetPath(match[1]),
)
const entryScriptFiles = new Set(entryScriptPaths.map((assetPath) => path.basename(assetPath)))
const stylesheetFiles = new Set(stylesheetPaths.map((assetPath) => path.basename(assetPath)))

const fileInfo = async (file, relativePath = path.join('assets', file)) => {
  const filePath = path.join(distDir, relativePath)
  const buffer = await readFile(filePath)
  const fileStat = await stat(filePath)
  const gzipBytes = gzipSync(buffer).byteLength

  return {
    file,
    path: relativePath,
    bytes: fileStat.size,
    kb: bytesToKb(fileStat.size),
    gzipBytes,
    gzipKb: bytesToKb(gzipBytes),
  }
}

const assetJsAssets = await Promise.all(jsFiles.map((file) => fileInfo(file)))
const rootEntryScriptAssets = await Promise.all(
  entryScriptPaths
    .filter((scriptPath) => !scriptPath.startsWith('assets/'))
    .map((scriptPath) => fileInfo(path.basename(scriptPath), scriptPath)),
)
const jsAssets = [...assetJsAssets, ...rootEntryScriptAssets].sort((a, b) => a.file.localeCompare(b.file))
const cssAssets = await Promise.all(cssFiles.map((file) => fileInfo(file)))
const initialJsAssets = jsAssets.filter((asset) => entryScriptFiles.has(asset.file))
const deferredJsAssets = jsAssets.filter((asset) => !entryScriptFiles.has(asset.file))
const initialCssAssets = stylesheetFiles.size
  ? cssAssets.filter((asset) => stylesheetFiles.has(asset.file))
  : cssAssets
const largestJsChunk = [...jsAssets].sort((a, b) => b.bytes - a.bytes)[0] ?? null
const largestDeferredChunk = [...deferredJsAssets].sort((a, b) => b.bytes - a.bytes)[0] ?? null
const gameChunk =
  deferredJsAssets.find((asset) => asset.file.startsWith('GameCanvas-')) ??
  deferredJsAssets.find((asset) => asset.file.includes('GameCanvas')) ??
  null

const initialJsBytes = sum(initialJsAssets, 'bytes')
const initialGzipBytes = sum(initialJsAssets, 'gzipBytes')
const initialCssBytes = sum(initialCssAssets, 'bytes')
const initialCssGzipBytes = sum(initialCssAssets, 'gzipBytes')

const budgets = {
  initialJsMaxBytes: 675 * 1024,
  initialJsMaxKb: 675,
  initialGzipMaxBytes: 200 * 1024,
  initialGzipMaxKb: 200,
  initialCssMaxBytes: 40 * 1024,
  initialCssMaxKb: 40,
  deferredGameChunkMaxBytes: 1600 * 1024,
  deferredGameChunkMaxKb: 1600,
}
const manifestExists = await exists(manifestPath)
const serviceWorkerExists = await exists(swPath)
const largestJsChunkIsDeferred = Boolean(largestJsChunk && !entryScriptFiles.has(largestJsChunk.file))
const gameRuntimeDeferred = Boolean(gameChunk && !entryScriptFiles.has(gameChunk.file))
const phaserDeferredFromInitialShell = gameRuntimeDeferred && largestJsChunkIsDeferred
const serviceWorkerPrecacheIncludesLazyChunk = Boolean(gameChunk && serviceWorker.includes(gameChunk.file))

const check = (id, status, detail) => ({ id, status, detail })
const checks = [
  check(
    'initial-js-budget',
    initialJsAssets.length && initialJsBytes <= budgets.initialJsMaxBytes ? 'pass' : 'blocker',
    `Initial JS is ${bytesToKb(initialJsBytes)} KB; budget is ${budgets.initialJsMaxKb} KB.`,
  ),
  check(
    'initial-js-gzip-budget',
    initialJsAssets.length && initialGzipBytes <= budgets.initialGzipMaxBytes ? 'pass' : 'blocker',
    `Initial JS gzip is ${bytesToKb(initialGzipBytes)} KB; budget is ${budgets.initialGzipMaxKb} KB.`,
  ),
  check(
    'initial-css-budget',
    initialCssBytes <= budgets.initialCssMaxBytes ? 'pass' : 'blocker',
    `Initial CSS is ${bytesToKb(initialCssBytes)} KB; budget is ${budgets.initialCssMaxKb} KB.`,
  ),
  check(
    'manifest',
    manifestExists ? 'pass' : 'blocker',
    manifestExists ? 'PWA manifest exists in dist.' : 'PWA manifest is missing from dist.',
  ),
  check(
    'service-worker',
    serviceWorkerExists ? 'pass' : 'blocker',
    serviceWorkerExists ? 'Service worker exists in dist.' : 'Service worker is missing from dist.',
  ),
  check(
    'game-runtime-deferred',
    phaserDeferredFromInitialShell ? 'pass' : 'blocker',
    gameChunk
      ? `${gameChunk.file} is deferred from the initial shell.`
      : 'GameCanvas/Phaser chunk was not found outside the initial shell.',
  ),
  check(
    'largest-js-deferred',
    largestJsChunkIsDeferred ? 'pass' : 'blocker',
    largestJsChunk
      ? `Largest JS chunk is ${largestJsChunk.file} at ${largestJsChunk.kb} KB.`
      : 'No JS chunks were found.',
  ),
  check(
    'deferred-game-budget',
    gameChunk && gameChunk.bytes <= budgets.deferredGameChunkMaxBytes ? 'pass' : 'monitor',
    gameChunk
      ? `Deferred game chunk is ${gameChunk.kb} KB; monitor budget is ${budgets.deferredGameChunkMaxKb} KB.`
      : 'Deferred game chunk is missing.',
  ),
]
const blockingChecks = checks.filter((checkItem) => checkItem.status === 'blocker')

const payload = {
  generatedAt: new Date().toISOString(),
  status: blockingChecks.length ? 'blocked-performance-budget' : 'performance-budget-ready',
  sourceBuild: 'dist',
  basePath: configuredBasePath,
  budgets,
  initial: {
    entryScripts: [...entryScriptFiles],
    scriptPaths: entryScriptPaths,
    jsFiles: initialJsAssets,
    jsBytes: initialJsBytes,
    jsKb: bytesToKb(initialJsBytes),
    gzipBytes: initialGzipBytes,
    gzipKb: bytesToKb(initialGzipBytes),
    cssFiles: initialCssAssets,
    cssBytes: initialCssBytes,
    cssKb: bytesToKb(initialCssBytes),
    cssGzipBytes: initialCssGzipBytes,
    cssGzipKb: bytesToKb(initialCssGzipBytes),
  },
  deferred: {
    chunks: deferredJsAssets,
    gameChunk,
    largestDeferredChunk,
    largestJsChunk,
    chunksBytes: sum(deferredJsAssets, 'bytes'),
    chunksKb: bytesToKb(sum(deferredJsAssets, 'bytes')),
  },
  assets: {
    js: jsAssets,
    css: cssAssets,
    manifestExists,
    serviceWorkerExists,
    serviceWorkerPrecacheIncludesLazyChunk,
  },
  controls: {
    phaserDeferredFromInitialShell,
    initialShellBudgetEnforced: true,
    largeGameChunkAllowedWhenDeferred: phaserDeferredFromInitialShell,
    noPerformanceClaimsWithoutBuildEvidence: true,
    largestJsChunkIsDeferred,
    serviceWorkerPrecacheIncludesLazyChunk,
  },
  checks,
  nextActions: [
    phaserDeferredFromInitialShell
      ? 'Keep Phaser and game scenes outside the initial PWA shell.'
      : 'Lazy-load the Phaser game runtime before public traffic.',
    initialGzipBytes <= budgets.initialGzipMaxBytes
      ? 'Continue monitoring initial shell gzip size after every generated-data change.'
      : 'Reduce initial shell imports or defer more dashboard panels.',
    gameChunk && gameChunk.bytes > budgets.deferredGameChunkMaxBytes
      ? 'Split individual game scenes if the deferred game chunk keeps growing.'
      : 'Accept the large game-engine chunk only while it remains deferred from first paint.',
  ],
}

const report = [
  '# Performance Budget',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Initial JS: ${payload.initial.jsKb} KB (${payload.initial.gzipKb} KB gzip)`,
  `Initial CSS: ${payload.initial.cssKb} KB (${payload.initial.cssGzipKb} KB gzip)`,
  `Deferred game chunk: ${gameChunk ? `${gameChunk.file}, ${gameChunk.kb} KB` : 'missing'}`,
  `Largest JS chunk deferred: ${largestJsChunkIsDeferred ? 'yes' : 'no'}`,
  '',
  '## Checks',
  '',
  ...checks.map((checkItem) => `- ${checkItem.status}: ${checkItem.id} - ${checkItem.detail}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
const appPayload = {
  status: payload.status,
  initial: {
    jsKb: payload.initial.jsKb,
    gzipKb: payload.initial.gzipKb,
  },
  deferred: {
    gameChunk: payload.deferred.gameChunk ? { kb: payload.deferred.gameChunk.kb } : null,
    largestDeferredChunk: payload.deferred.largestDeferredChunk
      ? { kb: payload.deferred.largestDeferredChunk.kb }
      : null,
  },
}
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const performanceBudget = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type PerformanceBudget = typeof performanceBudget\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)

if (process.argv.includes('--assert') && payload.status !== 'performance-budget-ready') {
  console.error(`Performance budget failed with ${blockingChecks.length} blocker(s).`)
  process.exit(1)
}
