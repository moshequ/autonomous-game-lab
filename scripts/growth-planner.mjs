import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const playablePath = path.join(root, 'data', 'playable-games.json')
const pipelinePath = path.join(root, 'data', 'prototype-pipeline.json')
const generatedPlayablePath = path.join(root, 'data', 'generated-playable-games.json')
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const balancePath = path.join(root, 'data', 'balance-report.json')
const growthPolicyPath = path.join(root, 'data', 'growth-policy.json')
const environmentPath = path.join(root, 'data', 'production-environment.json')
const outputJsonPath = path.join(root, 'data', 'growth-plan.json')
const outputTsPath = path.join(root, 'src', 'data', 'growthPlan.ts')
const reportPath = path.join(root, 'reports', 'growth-plan-latest.md')
const publicGamesDir = path.join(root, 'public', 'games')
const robotsPath = path.join(root, 'public', 'robots.txt')
const sitemapPath = path.join(root, 'public', 'sitemap.xml')
const shareManifestPath = path.join(root, 'public', 'share-manifest.json')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const environment = await readOptionalJson(environmentPath, {
  publicOrigin: { origin: null },
})

const normalizePublicOrigin = (value) => {
  const candidate = String(value ?? '').trim()

  if (!candidate) {
    return null
  }

  try {
    const url = new URL(candidate)
    const hostname = url.hostname.toLowerCase()

    if (
      hostname === 'autonomous-game-lab.example.com' ||
      hostname.endsWith('.example.com') ||
      hostname === 'owner.github.io'
    ) {
      return null
    }

    const basePath = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '')
    return `${url.origin}${basePath}`
  } catch {
    return null
  }
}

const publicOriginCandidates = [
  { source: 'PUBLIC_SITE_URL', value: process.env.PUBLIC_SITE_URL },
  { source: 'AGL_PUBLIC_ORIGIN', value: process.env.AGL_PUBLIC_ORIGIN },
  { source: environment.publicOrigin?.source ?? 'production-environment', value: environment.publicOrigin?.origin },
]
const publicOrigin = publicOriginCandidates
  .map((candidate) => ({ ...candidate, origin: normalizePublicOrigin(candidate.value) }))
  .find((candidate) => candidate.origin)
const siteUrl = publicOrigin?.origin ?? null
const publicUrlMode = siteUrl ? 'absolute-origin' : 'runtime-relative'

const fallbackGames = {
  'harbor-rings': {
    title: 'Harbor Rings',
    mechanic: 'tile placement puzzle',
    theme: 'harbor strategy',
    shortDescription: 'A quick original tile-placement puzzle about completing harbor rings.',
    fullDescription:
      'Place colored harbor seals, complete scoring rings, and push for a clean twelve-turn score in a compact solo strategy puzzle.',
    keywords: ['daily puzzle', 'tile placement', 'solo board game', 'strategy puzzle'],
  },
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const jsonLd = (value) => JSON.stringify(value, null, 2).replaceAll('<', '\\u003c')

const pct = (value) => (typeof value === 'number' ? `${Math.round(value * 100)}%` : 'learning')

const rootPath = (pathname) => (String(pathname).startsWith('/') ? String(pathname) : `/${pathname}`)
const publicUrl = (pathname) => (siteUrl ? `${siteUrl}${rootPath(pathname)}` : rootPath(pathname))
const canonicalUrl = (pathname) => (siteUrl ? publicUrl(pathname) : null)
const sitemapUrl = (pathname) =>
  siteUrl ? publicUrl(pathname) : `\${DEPLOYED_PWA_ORIGIN}${rootPath(pathname)}`

const titleCase = (value) =>
  value
    .split('-')
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')

const ctaLabels = {
  'play-free': 'Play free puzzle',
  'daily-challenge': "Try today's challenge",
  'quick-strategy': 'Start quick strategy run',
}

const messageLead = ({ variant, title, mechanic }) => {
  if (variant === 'daily') {
    return `${title} is tuned as a daily ${mechanic} challenge with a compact board and a clear score target.`
  }

  if (variant === 'generated-original') {
    return `${title} is an original generated strategy puzzle shaped by trend signals, bot checks, and gameplay telemetry.`
  }

  return null
}

const playable = await readJson(playablePath)
const pipeline = await readJson(pipelinePath)
const generatedPlayable = await readOptionalJson(generatedPlayablePath, { games: [] })
const analytics = await readJson(analyticsPath)
const balance = await readJson(balancePath)
const growthPolicy = await readOptionalJson(growthPolicyPath, {
  defaults: { ctaVariant: 'play-free', messageVariant: 'evergreen' },
  games: {},
})

const prototypeById = new Map((pipeline.prototypes ?? []).map((prototype) => [prototype.id, prototype]))
const generatedById = new Map((generatedPlayable.games ?? []).map((game) => [game.id, game]))
const analyticsById = new Map((analytics.games ?? []).map((game) => [game.gameId, game]))
const balanceById = new Map((balance.games ?? []).map((game) => [game.gameId, game]))

const gamePages = (playable.games ?? []).map((gameId, index) => {
  const prototype = prototypeById.get(gameId)
  const generated = generatedById.get(gameId)
  const fallback = fallbackGames[gameId] ?? {}
  const balanceGame = balanceById.get(gameId)
  const analyticsGame = analyticsById.get(gameId)
  const title = prototype?.title ?? generated?.title ?? balanceGame?.title ?? fallback.title ?? titleCase(gameId)
  const mechanic =
    prototype?.concept?.opportunity?.mechanic ?? generated?.source?.mechanic ?? fallback.mechanic ?? 'strategy puzzle'
  const theme = prototype?.concept?.opportunity?.theme ?? generated?.source?.theme ?? fallback.theme ?? 'original board game'
  const gamePolicy = growthPolicy.games?.[gameId] ?? {}
  const ctaVariant = gamePolicy.ctaVariant ?? growthPolicy.defaults?.ctaVariant ?? 'play-free'
  const messageVariant = gamePolicy.messageVariant ?? growthPolicy.defaults?.messageVariant ?? 'evergreen'
  const shortDescription =
    prototype?.storeListing?.shortDescription ??
    generated?.storeListing?.shortDescription ??
    fallback.shortDescription ??
    `A compact original strategy puzzle for quick mobile play.`
  const fullDescription =
    [
      messageLead({ variant: messageVariant, title, mechanic }),
      prototype?.storeListing?.fullDescription ?? generated?.playerPromise ?? fallback.fullDescription ?? shortDescription,
    ]
      .filter(Boolean)
      .join(' ')
  const keywords = [
    ...new Set([
      ...(prototype?.storeListing?.keywords ?? []),
      ...(generated?.storeListing?.keywords ?? []),
      ...(fallback.keywords ?? []),
      'board-game-inspired',
      'mobile PWA',
    ]),
  ]
  const startRate = analyticsGame?.metrics?.startRate ?? null
  const completionRate = analyticsGame?.metrics?.firstGameCompletion ?? null
  const replayRate = analyticsGame?.metrics?.replayRate ?? null
  const knownMetrics = [startRate, completionRate, replayRate].filter((value) => typeof value === 'number')
  const qualityScore = knownMetrics.length
    ? Math.round(
        (startRate ?? 0.5) * 36 + (completionRate ?? 0.35) * 34 + (replayRate ?? 0.25) * 30,
      )
    : 42 + index * 4

  const pagePath = `/games/${gameId}.html`
  const gameCanonicalUrl = canonicalUrl(pagePath)
  const gameShareUrl = publicUrl(
    `/?game=${encodeURIComponent(gameId)}&utm_source=share&utm_campaign=${encodeURIComponent(gameId)}`,
  )

  return {
    gameId,
    title,
    status: prototype?.status ?? generated?.status ?? (gameId === 'harbor-rings' ? 'live' : 'playable'),
    mechanic,
    theme,
    shortDescription,
    fullDescription,
    keywords,
    playPath: `/?game=${encodeURIComponent(gameId)}&utm_source=organic_game_page&utm_campaign=${encodeURIComponent(
      gameId,
    )}`,
    pagePath,
    canonicalUrl: gameCanonicalUrl,
    shareUrl: gameShareUrl,
    metrics: {
      startRate,
      completionRate,
      replayRate,
      targetScore: balanceGame?.targetScore ?? generated?.targetScore ?? null,
      qualityScore,
    },
    optimization: {
      ctaVariant,
      messageVariant,
      ctaLabel: ctaLabels[ctaVariant] ?? ctaLabels['play-free'],
      reason: gamePolicy.reason ?? 'default growth policy',
    },
    channelFocus:
      typeof replayRate === 'number' && replayRate >= 0.3
        ? 'shareable-result-loop'
        : typeof startRate === 'number' && startRate < 0.6
          ? 'search-title-test'
          : 'evergreen-search-page',
  }
})

const existingShareManifest = await readOptionalJson(shareManifestPath, {})

const shareManifest = {
  ...existingShareManifest,
  generatedAt: new Date().toISOString(),
  siteUrl,
  publicUrlMode,
  shares: gamePages.map((game) => ({
    gameId: game.gameId,
    title: `Play ${game.title}`,
    text: game.shortDescription,
    url: game.shareUrl,
    tags: game.keywords.slice(0, 5),
  })),
}
const utilityPages = [
  {
    path: '/',
    role: 'pwa-home',
    channel: 'organic-search',
    changefreq: 'weekly',
  },
  {
    path: '/privacy.html',
    role: 'privacy-policy',
    channel: 'store-readiness',
    changefreq: 'weekly',
  },
  {
    path: '/support.html',
    role: 'public-support',
    channel: 'support-feedback',
    changefreq: 'weekly',
  },
  {
    path: '/measurement-status.html',
    role: 'public-measurement-status',
    channel: 'player-evidence',
    changefreq: 'daily',
  },
  {
    path: '/gate-sample.html',
    role: 'product-gate-sample',
    channel: 'player-evidence',
    changefreq: 'daily',
  },
  {
    path: '/seed-kit.html',
    role: 'organic-seed-kit',
    channel: 'player-sharing',
    changefreq: 'daily',
  },
  {
    path: '/seed-next.html',
    role: 'evergreen-seed-route',
    channel: 'player-sharing',
    changefreq: 'daily',
  },
  {
    path: '/install.html',
    role: 'pwa-install',
    channel: 'pwa-install',
    changefreq: 'weekly',
  },
]

const channels = [
  {
    id: 'organic-search',
    status: 'generated',
    cost: '$0',
    assets: ['public/robots.txt', 'public/sitemap.xml', 'public/games/*.html', 'public/gate-sample.html'],
    metric: 'organic_entry_opened -> game_started',
  },
  {
    id: 'player-sharing',
    status: 'instrumented',
    cost: '$0',
    assets: ['public/share-manifest.json', 'public/seed-kit.html', 'public/seed-next.html', 'in-app share button'],
    metric: 'share_clicked -> game_started',
  },
  {
    id: 'pwa-install',
    status: 'ready-after-hosting',
    cost: '$0',
    assets: ['manifest.webmanifest', 'service worker'],
    metric: 'returning anonymous cohorts and D1 retention',
  },
]

const weeklyLoop = [
  'Regenerate game pages and sitemap from playable inventory.',
  'Rank pages by start, completion, replay, and share signals.',
  'Keep monetization disabled until readiness gates pass.',
  'Refresh store copy and app-store blockers from the same source data.',
]

const payload = {
  generatedAt: new Date().toISOString(),
  siteUrl,
  publicUrlMode,
  publicOrigin: {
    source: publicOrigin?.source ?? environment.publicOrigin?.source ?? 'missing',
    status: siteUrl ? 'configured' : 'missing-runtime-relative',
    origin: siteUrl,
  },
  status: gamePages.length ? 'growth-assets-ready' : 'blocked',
  gamePages,
  utilityPages,
  channels,
  optimization: {
    optimizedGames: Object.keys(growthPolicy.games ?? {}).length,
    defaults: growthPolicy.defaults,
  },
  weeklyLoop,
  nextBestExperiment:
    gamePages
      .slice()
      .sort((a, b) => b.metrics.qualityScore - a.metrics.qualityScore)[0]?.gameId ?? null,
}

const boardCells = (seed) =>
  Array.from({ length: 20 }, (_, index) => `<span class="cell c${(index + seed) % 5}"></span>`).join('')

const structuredDataForGame = (game) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: game.title,
  description: game.shortDescription,
  url: game.canonicalUrl ?? publicUrl(game.pagePath),
  genre: game.keywords.slice(0, 6),
  gamePlatform: ['Web browser', 'PWA'],
  playMode: 'SinglePlayer',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  potentialAction: {
    '@type': 'PlayAction',
    target: publicUrl(game.playPath),
  },
})

const gamePageHtml = (game, index) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(game.title)} | Autonomous Game Lab</title>
    <meta name="description" content="${escapeHtml(game.shortDescription)}" />
    <meta name="keywords" content="${escapeHtml(game.keywords.join(', '))}" />
    ${
      game.canonicalUrl
        ? `<link rel="canonical" href="${escapeHtml(game.canonicalUrl)}" />
    <meta property="og:url" content="${escapeHtml(game.canonicalUrl)}" />`
        : ''
    }
    <meta property="og:title" content="${escapeHtml(game.title)}" />
    <meta property="og:description" content="${escapeHtml(game.shortDescription)}" />
    <meta property="og:type" content="website" />
    <script type="application/ld+json">
${jsonLd(structuredDataForGame(game))}
    </script>
    <style>
      :root {
        color: #191713;
        background: #fbf7ef;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-width: 320px;
        background: #fbf7ef;
      }

      main {
        display: grid;
        min-height: 100svh;
        grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
        gap: clamp(24px, 5vw, 72px);
        align-items: center;
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
        padding: 42px 0;
      }

      h1 {
        margin: 0;
        font-size: clamp(42px, 8vw, 88px);
        line-height: 0.95;
        letter-spacing: 0;
      }

      p {
        margin: 0;
        color: #625d52;
      }

      .copy {
        display: grid;
        gap: 18px;
      }

      .eyebrow,
      .tag {
        display: inline-flex;
        width: fit-content;
        border-radius: 8px;
        font-weight: 800;
      }

      .eyebrow {
        padding: 5px 9px;
        color: #187f7a;
        background: #d7efeb;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tag {
        padding: 4px 8px;
        color: #625d52;
        background: #f3eadc;
        font-size: 13px;
      }

      .play {
        display: inline-flex;
        width: fit-content;
        min-height: 44px;
        align-items: center;
        justify-content: center;
        padding: 0 16px;
        border: 1px solid #191713;
        border-radius: 8px;
        color: #fffdfa;
        background: #191713;
        font-weight: 800;
        text-decoration: none;
      }

      .board {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        min-height: min(64svh, 620px);
        padding: clamp(14px, 3vw, 28px);
        border: 1px solid #d9d0bf;
        border-radius: 8px;
        background: #fffdfa;
        box-shadow: 0 18px 40px rgba(54, 44, 26, 0.1);
      }

      .cell {
        min-height: 64px;
        border-radius: 7px;
      }

      .c0 {
        background: #187f7a;
      }

      .c1 {
        background: #bd4d38;
      }

      .c2 {
        background: #b87b16;
      }

      .c3 {
        background: #6b5bb8;
      }

      .c4 {
        background: #f3eadc;
        border: 1px solid #d9d0bf;
      }

      @media (max-width: 820px) {
        main {
          grid-template-columns: 1fr;
          align-items: start;
        }

        .board {
          min-height: 360px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="copy">
        <span class="eyebrow">${escapeHtml(game.status)} strategy puzzle</span>
        <h1>${escapeHtml(game.title)}</h1>
        <p>${escapeHtml(game.fullDescription)}</p>
        <div class="tags">
          <span class="tag">${escapeHtml(game.mechanic)}</span>
          <span class="tag">${escapeHtml(game.theme)}</span>
          <span class="tag">start ${pct(game.metrics.startRate)}</span>
          <span class="tag">replay ${pct(game.metrics.replayRate)}</span>
        </div>
        <a class="play" href="../${escapeHtml(game.playPath.slice(1))}">${escapeHtml(game.optimization.ctaLabel)}</a>
      </section>
      <section class="board" aria-label="${escapeHtml(game.title)} board preview">
        ${boardCells(index)}
      </section>
    </main>
  </body>
</html>
`

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...utilityPages, ...gamePages.map((game) => ({ path: game.pagePath, changefreq: 'weekly' }))]
    .map(
      (page) => `<url>
    <loc>${escapeHtml(sitemapUrl(page.path))}</loc>
    <changefreq>${escapeHtml(page.changefreq)}</changefreq>
  </url>`,
    )
    .join('\n  ')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl('/sitemap.xml')}
`

const report = [
  '# Growth Plan',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Site URL: ${payload.siteUrl ?? 'runtime-relative (no public origin configured)'}`,
  `Indexed utility pages: ${payload.utilityPages.length}`,
  '',
  '## Game Pages',
  '',
  ...gamePages.map(
    (game) =>
      `- ${game.title}: ${game.pagePath}, focus ${game.channelFocus}, score ${game.metrics.qualityScore}, CTA ${game.optimization.ctaVariant}`,
  ),
  '',
  '## Channels',
  '',
  ...channels.map((channel) => `- ${channel.id}: ${channel.status}, ${channel.cost}, metric ${channel.metric}`),
  '',
  '## Weekly Loop',
  '',
  ...weeklyLoop.map((item) => `- ${item}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(publicGamesDir, { recursive: true })

const expectedPageFiles = new Set(gamePages.map((game) => `${game.gameId}.html`))
const existingPageFiles = await readdir(publicGamesDir).catch(() => [])

for (const file of existingPageFiles) {
  if (file.endsWith('.html') && !expectedPageFiles.has(file)) {
    await rm(path.join(publicGamesDir, file), { force: true })
  }
}

for (const [index, game] of gamePages.entries()) {
  await writeFile(path.join(publicGamesDir, `${game.gameId}.html`), gamePageHtml(game, index))
}

await writeFile(robotsPath, robots)
await writeFile(sitemapPath, sitemap)
await writeFile(shareManifestPath, JSON.stringify(shareManifest, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const growthPlan = ${JSON.stringify(payload, null, 2)} as const\n\nexport type GrowthPlan = typeof growthPlan\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, sitemapPath)}`)
console.log(`Wrote ${path.relative(root, robotsPath)}`)
console.log(`Wrote ${gamePages.length} public game pages`)
