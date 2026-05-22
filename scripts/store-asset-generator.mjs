import { copyFile, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const dataDir = path.join(root, 'data')
const storePackagePath = path.join(root, 'data', 'store-package.json')
const outputJsonPath = path.join(root, 'data', 'store-assets.json')
const outputTsPath = path.join(root, 'src', 'data', 'storeAssets.ts')
const reportPath = path.join(root, 'reports', 'store-assets-latest.md')
const publicScreenshotDir = path.join(root, 'public', 'store-assets', 'screenshots')
const distScreenshotDir = path.join(root, 'dist', 'store-assets', 'screenshots')

const normalizeBasePath = (basePath) => {
  if (!basePath || basePath === '/') {
    return '/'
  }

  return `/${String(basePath).replace(/^\/|\/$/g, '')}/`
}

const inferBuiltBasePath = async () => {
  try {
    const html = await readFile(path.join(distDir, 'index.html'), 'utf8')
    const match = html.match(/(?:src|href)="\/([^/]+)\/(?:assets\/|manifest\.webmanifest|registerSW\.js|icons\/)/)

    return match ? `/${match[1]}/` : '/'
  } catch {
    return '/'
  }
}

const configuredBasePath = normalizeBasePath(process.env.VITE_BASE_PATH || (await inferBuiltBasePath()))

const stripConfiguredBasePath = (requestPath) => {
  if (configuredBasePath === '/') {
    return requestPath
  }

  const baseWithoutTrailingSlash = configuredBasePath.replace(/\/$/, '')

  if (requestPath === baseWithoutTrailingSlash || requestPath === configuredBasePath) {
    return '/'
  }

  if (requestPath.startsWith(configuredBasePath)) {
    return `/${requestPath.slice(configuredBasePath.length)}`
  }

  return requestPath
}

const routeWithBasePath = (route) => {
  if (configuredBasePath === '/') {
    return route
  }

  const routeUrl = new URL(route, 'http://local.test')
  const routePath = routeUrl.pathname === '/' ? '' : routeUrl.pathname.replace(/^\//, '')
  routeUrl.pathname = `${configuredBasePath}${routePath}`.replace(/\/{2,}/g, '/')

  return `${routeUrl.pathname}${routeUrl.search}${routeUrl.hash}`
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

const safeJoin = (base, requestPath) => {
  const decoded = decodeURIComponent(stripConfiguredBasePath(requestPath).split('?')[0])
  const normalized = path.normalize(decoded).replace(/^[/\\]+/, '')
  const target = path.resolve(base, normalized === '' || normalized === '.' ? 'index.html' : normalized)
  const resolvedBase = path.resolve(base)

  return target.startsWith(`${resolvedBase}${path.sep}`) ? target : path.join(resolvedBase, 'index.html')
}

const createVirtualDistHost = () => {
  const host = 'local.agl.test'
  const origin = `https://${host}`

  const preparePage = async (page) => {
    await page.route('**/*', async (route) => {
      const request = route.request()
      const requestUrl = new URL(request.url())

      if (requestUrl.host !== host) {
        await route.abort()
        return
      }

      if (request.method() !== 'GET') {
        await route.abort()
        return
      }

      const filePath = safeJoin(distDir, requestUrl.pathname)

      try {
        const body = await readFile(filePath)
        await route.fulfill({
          status: 200,
          headers: {
            'content-type': contentTypes[path.extname(filePath)] ?? 'application/octet-stream',
          },
          body,
        })
      } catch {
        await route.fulfill({
          status: 404,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
          body: 'Not found',
        })
      }
    })
  }

  return {
    origin,
    preparePage,
    close: async () => {},
  }
}

const pngDimensions = async (filePath) => {
  const buffer = await readFile(filePath)

  if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    throw new Error(`${filePath} is not a PNG`)
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.byteLength,
  }
}

const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const unlinkIfExists = async (filePath) => {
  try {
    await unlink(filePath)
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }
}

const normalizeShotId = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const storePackage = await readOptionalJson(storePackagePath, { launchCandidate: null, storeListing: {} })
const trafficSeeding = await readOptionalJson(path.join(dataDir, 'traffic-seeding.json'), { campaigns: [] })
const growthPlan = await readOptionalJson(path.join(dataDir, 'growth-plan.json'), { gamePages: [] })
const generatedPlayable = await readOptionalJson(path.join(dataDir, 'generated-playable-games.json'), { games: [] })

const growthById = new Map((growthPlan.gamePages ?? []).map((game) => [game.gameId, game]))
const generatedById = new Map((generatedPlayable.games ?? []).map((game) => [game.id, game]))
const trafficCampaigns = [...(trafficSeeding.campaigns ?? [])].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))

const gameFromId = (id) => {
  const growthGame = growthById.get(id)
  const generatedGame = generatedById.get(id)

  if (!growthGame && !generatedGame && !id) {
    return null
  }

  return {
    id,
    title: growthGame?.title ?? generatedGame?.title ?? id,
    playPath: growthGame?.playPath ?? `/?game=${id}&utm_source=store_screenshot&utm_campaign=${id}`,
    pagePath: growthGame?.pagePath ?? `/games/${id}.html`,
  }
}

const screenshotGame =
  trafficCampaigns
    .map((campaign) => ({
      id: campaign.gameId,
      title: campaign.title,
      playPath: `/?game=${campaign.gameId}&utm_source=store_screenshot&utm_campaign=${campaign.gameId}`,
      pagePath: campaign.pagePath ?? growthById.get(campaign.gameId)?.pagePath ?? `/games/${campaign.gameId}.html`,
    }))
    .find((game) => game.id && game.title) ??
  gameFromId(storePackage.launchCandidate?.id) ??
  gameFromId(growthPlan.gamePages?.[0]?.gameId) ?? {
    id: 'lantern-relay',
    title: 'Lantern Relay',
    playPath: '/?game=lantern-relay&utm_source=store_screenshot&utm_campaign=lantern-relay',
    pagePath: '/games/lantern-relay.html',
  }
const screenshotGameId = normalizeShotId(screenshotGame.id) || 'generated-game'
const screenshotGameTitle = screenshotGame.title || screenshotGameId

const shots = [
  {
    id: 'phone-portal-home',
    label: 'Mobile portal home',
    route: '/',
    waitForText: 'Autonomous Game Lab',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
    platformUse: ['Google Play phone', 'Apple iPhone draft'],
  },
  {
    id: 'phone-lantern-relay-game',
    label: 'Lantern Relay playable board',
    route: '/?game=lantern-relay&utm_source=store_screenshot&utm_campaign=lantern-relay',
    waitForText: 'Lantern Relay',
    focusSelector: '.canvasFrame',
    focusBlock: 'start',
    hideStickyNavigation: true,
    waitForSelector: 'canvas',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
    platformUse: ['Google Play phone', 'Apple iPhone draft'],
  },
  {
    id: `phone-${screenshotGameId}-generated`,
    label: `${screenshotGameTitle} gameplay board`,
    route: screenshotGame.playPath,
    waitForText: screenshotGameTitle,
    focusSelector: '.canvasFrame',
    focusBlock: 'start',
    hideStickyNavigation: true,
    waitForSelector: 'canvas',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
    platformUse: ['Google Play phone', 'Apple iPhone draft'],
  },
  {
    id: 'desktop-growth-page',
    label: 'Generated public game landing page',
    route: screenshotGame.pagePath,
    waitForText: screenshotGameTitle,
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
    platformUse: ['Web/PWA listing', 'press kit'],
  },
]

const isSandboxBlockedError = (error) => {
  if (!error) {
    return false
  }

  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  return (
    normalized.includes('permission denied') ||
    normalized.includes('operation not permitted') ||
    normalized.includes('machportrendezvous') ||
    normalized.includes('eperm') ||
    normalized.includes('executable doesn') ||
    normalized.includes('playwright install')
  )
}

await readFile(path.join(distDir, 'index.html'))
await mkdir(publicScreenshotDir, { recursive: true })
await mkdir(distScreenshotDir, { recursive: true })
await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })

const previousStoreAssets = await readOptionalJson(outputJsonPath, { screenshots: [] })
const currentShotIds = new Set(shots.map((shot) => shot.id))
let browser = null
try {
  browser = await chromium.launch()
} catch (error) {
  if (isSandboxBlockedError(error)) {
    console.log('Playwright launch blocked; preserving prior store screenshot artifacts.')
    process.exit(0)
  }
  throw error
}

const removeUnknownScreenshots = async (directory) => {
  const files = await readdir(directory).catch(() => [])

  for (const file of files) {
    if (!file.endsWith('.png')) {
      continue
    }

    const shotId = file.replace(/\.png$/, '')
    if (!currentShotIds.has(shotId)) {
      await unlinkIfExists(path.join(directory, file))
    }
  }
}

await removeUnknownScreenshots(publicScreenshotDir)
await removeUnknownScreenshots(distScreenshotDir)

for (const previousScreenshot of previousStoreAssets.screenshots ?? []) {
  if (currentShotIds.has(previousScreenshot.id)) {
    continue
  }

  const publicPath = previousScreenshot.path?.replace(/^\//, '')
  if (publicPath?.startsWith('store-assets/screenshots/')) {
    await unlinkIfExists(path.join(root, 'public', publicPath))
  }
  if (previousScreenshot.distPath?.startsWith('dist/store-assets/screenshots/')) {
    await unlinkIfExists(path.join(root, previousScreenshot.distPath))
  }
}

const server = createVirtualDistHost()
const screenshots = []

try {
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: {
        width: shot.viewport.width,
        height: shot.viewport.height,
      },
      deviceScaleFactor: shot.viewport.deviceScaleFactor,
      isMobile: shot.viewport.isMobile,
    })
    const page = await context.newPage()
    const publicPath = path.join(publicScreenshotDir, `${shot.id}.png`)
    const distPath = path.join(distScreenshotDir, `${shot.id}.png`)

    const screenshotRoute = routeWithBasePath(shot.route)

    await server.preparePage(page)
    await page.goto(`${server.origin}${screenshotRoute}`, { waitUntil: 'networkidle' })
    await page.getByText(shot.waitForText).first().waitFor({ state: 'visible' })
    if (shot.hideStickyNavigation) {
      await page.addStyleTag({
        content: '.topbar { position: static !important; backdrop-filter: none !important; }',
      })
    }
    if (shot.waitForSelector) {
      await page.locator(shot.waitForSelector).first().waitFor({ state: 'visible' })
    }
    if (shot.focusSelector) {
      const block = shot.focusBlock ?? 'start'
      await page
        .locator(shot.focusSelector)
        .first()
        .evaluate((element, scrollBlock) => {
          element.scrollIntoView({ block: scrollBlock, inline: 'nearest' })
        }, block)
      await page.waitForTimeout(300)
    }
    await page.screenshot({ path: publicPath, fullPage: false })
    await copyFile(publicPath, distPath)
    await context.close()

    const dimensions = await pngDimensions(publicPath)
    const distDimensions = await pngDimensions(distPath)

    if (
      dimensions.bytes < 20_000 ||
      dimensions.width < shot.viewport.width ||
      dimensions.height < shot.viewport.height ||
      distDimensions.width !== dimensions.width ||
      distDimensions.height !== dimensions.height
    ) {
      throw new Error(`${shot.id} screenshot is unexpectedly small`)
    }

    screenshots.push({
      id: shot.id,
      label: shot.label,
      route: shot.route,
      servedRoute: screenshotRoute,
      path: `/store-assets/screenshots/${shot.id}.png`,
      distPath: `dist/store-assets/screenshots/${shot.id}.png`,
      width: dimensions.width,
      height: dimensions.height,
      bytes: dimensions.bytes,
      platformUse: shot.platformUse,
    })
  }
} finally {
  await browser.close()
  await server.close()
}

storePackage.storeListing ??= {}
storePackage.storeListing.screenshotAssets = screenshots.map((screenshot) => ({
  id: screenshot.id,
  label: screenshot.label,
  path: screenshot.path,
  width: screenshot.width,
  height: screenshot.height,
  platformUse: screenshot.platformUse,
}))

const payload = {
  generatedAt: new Date().toISOString(),
  status: screenshots.length >= 4 ? 'screenshots-ready' : 'blocked',
  basePath: configuredBasePath,
  sourceBuild: 'dist',
  screenshots,
  storePackageUpdated: true,
}

const report = [
  '# Store Assets',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  '',
  '## Screenshots',
  '',
  ...screenshots.map(
    (screenshot) =>
      `- ${screenshot.id}: ${screenshot.width}x${screenshot.height}, ${Math.round(
        screenshot.bytes / 1024,
      )} KB, ${screenshot.path}`,
  ),
  '',
  '## Store Package',
  '',
  '- Attached generated screenshot assets to data/store-package.json.',
  '',
]

await writeFile(storePackagePath, JSON.stringify(storePackage, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const storeAssets = ${JSON.stringify(payload, null, 2)} as const\n\nexport type StoreAssets = typeof storeAssets\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, storePackagePath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${screenshots.length} screenshots`)
