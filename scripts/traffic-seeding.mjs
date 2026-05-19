import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'traffic-seeding.json')
const outputTsPath = path.join(root, 'src', 'data', 'trafficSeeding.ts')
const reportPath = path.join(root, 'reports', 'traffic-seeding-latest.md')
const shareManifestPath = path.join(root, 'public', 'share-manifest.json')
const seedKitPath = path.join(root, 'public', 'seed-kit.html')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const slugDate = () => new Date().toISOString().slice(0, 10).replaceAll('-', '')

const absoluteUrl = (siteUrl, pathname) => `${siteUrl.replace(/\/$/, '')}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const portfolio = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const unitEconomics = await readOptionalJson(path.join(dataDir, 'unit-economics.json'), {
  controls: { paidAcquisitionAllowed: false, maxDailySpendUsd: 0 },
})
const shareManifest = await readOptionalJson(shareManifestPath, {
  generatedAt: new Date().toISOString(),
  siteUrl: growth.siteUrl,
  shares: [],
})

const playableIds = new Set(playable.games ?? [])
const growthById = new Map((growth.gamePages ?? []).map((game) => [game.gameId, game]))
const portfolioById = new Map((portfolio.games ?? []).map((game) => [game.gameId, game]))
const analyticsById = new Map((analytics.games ?? []).map((game) => [game.gameId, game]))
const siteUrl = growth.siteUrl ?? shareManifest.siteUrl ?? 'https://autonomous-game-lab.example.com'
const runDate = slugDate()
const seedIds = (portfolio.rotation?.seedTrafficGameIds ?? []).filter((gameId) => playableIds.has(gameId))
const campaignIds = seedIds.length ? seedIds : (portfolio.games ?? []).slice(0, 4).map((game) => game.gameId)

const channels = [
  {
    id: 'internal-rotation',
    status: 'armed',
    costUsd: 0,
    surface: 'portal-growth-loop',
    telemetry: ['seed_campaign_clicked', 'game_viewed', 'game_started'],
  },
  {
    id: 'organic-page',
    status: 'armed',
    costUsd: 0,
    surface: 'public-game-page',
    telemetry: ['organic_entry_opened', 'game_started'],
  },
  {
    id: 'player-share',
    status: 'armed',
    costUsd: 0,
    surface: 'share-manifest',
    telemetry: ['share_clicked', 'organic_entry_opened', 'game_started'],
  },
]

const campaigns = campaignIds
  .map((gameId, index) => {
    const game = portfolioById.get(gameId)
    const page = growthById.get(gameId)
    const analyticsGame = analyticsById.get(gameId)
    const campaignId = `seed-${runDate}-${gameId}`
    const playPath = `/?game=${encodeURIComponent(gameId)}&utm_source=seed_internal&utm_campaign=${encodeURIComponent(campaignId)}`
    const sharePath = `/?game=${encodeURIComponent(gameId)}&utm_source=seed_share&utm_campaign=${encodeURIComponent(campaignId)}`

    return {
      id: campaignId,
      gameId,
      title: game?.title ?? page?.title ?? gameId,
      status: 'armed',
      priority: index + 1,
      action: game?.action ?? 'seed-traffic',
      dataConfidence: game?.dataConfidence ?? 'seed-needed',
      costUsd: 0,
      noPaidPromotion: true,
      reason: game?.recommendation ?? 'Seed this playable game before judging quality.',
      playPath,
      sharePath,
      playUrl: absoluteUrl(siteUrl, playPath),
      pagePath: page?.pagePath ?? `/games/${gameId}.html`,
      pageUrl: page?.canonicalUrl ?? absoluteUrl(siteUrl, `/games/${gameId}.html`),
      shareUrl: absoluteUrl(siteUrl, sharePath),
      copy: {
        title: `Play ${game?.title ?? page?.title ?? gameId}`,
        text: page?.shortDescription ?? 'Play an original board-game-inspired strategy puzzle.',
        cta: page?.optimization?.ctaLabel ?? 'Play free puzzle',
      },
      measurement: {
        source: analytics.sourceStatus?.activeSource ?? 'unknown',
        currentViews: analyticsGame?.counts?.game_viewed ?? game?.metrics?.views ?? 0,
        currentStarts: analyticsGame?.counts?.game_started ?? game?.metrics?.starts ?? 0,
        targetStartsBeforeJudgment: 40,
        successEvents: ['organic_entry_opened', 'seed_campaign_clicked', 'game_started', 'turn_taken'],
      },
      channels: channels.map((channel) => channel.id),
    }
  })
  .filter((campaign) => playableIds.has(campaign.gameId))

const sitemapPriority = campaigns.map((campaign) => ({
  gameId: campaign.gameId,
  pagePath: campaign.pagePath,
  priority: Math.max(0.55, Math.round((0.95 - (campaign.priority - 1) * 0.05) * 100) / 100),
}))

const payload = {
  generatedAt: new Date().toISOString(),
  status: campaigns.length ? 'traffic-seeding-ready' : 'blocked-no-seed-games',
  analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
  portfolioGeneratedAt: portfolio.generatedAt,
  guardrails: {
    maxCostUsd: 0,
    noPaidPromotion: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    noExternalPostingWithoutCredentials: true,
    minimumStartsBeforeQualityJudgment: 40,
  },
  channels,
  campaigns,
  sitemapPriority,
  nextActions: [
    ...(campaigns.length
      ? [`Feature ${campaigns[0].title} in the internal growth loop and share manifest.`]
      : ['Wait for portfolio policy to identify seed games.']),
    'Keep traffic sources organic/internal until paid acquisition gates pass.',
    'Judge seeded games only after each reaches the target start sample.',
  ],
}

const nextShareManifest = {
  ...shareManifest,
  generatedAt: payload.generatedAt,
  siteUrl,
  seedKit: {
    path: '/seed-kit.html',
    url: absoluteUrl(siteUrl, '/seed-kit.html'),
    campaignCount: campaigns.length,
    costUsd: 0,
    generatedAt: payload.generatedAt,
  },
  seedCampaigns: campaigns.map((campaign) => ({
    id: campaign.id,
    gameId: campaign.gameId,
    title: campaign.copy.title,
    text: campaign.copy.text,
    url: campaign.shareUrl,
    pageUrl: campaign.pageUrl,
    priority: campaign.priority,
    costUsd: campaign.costUsd,
    tags: [campaign.action, campaign.dataConfidence, 'zero-spend'].filter(Boolean),
  })),
}

const seedKitCards = campaigns
  .map(
    (campaign) => `
      <article class="campaign" data-campaign-id="${escapeHtml(campaign.id)}">
        <div>
          <p class="eyebrow">Priority ${campaign.priority} · ${escapeHtml(campaign.dataConfidence)}</p>
          <h2>${escapeHtml(campaign.title)}</h2>
          <p>${escapeHtml(campaign.copy.text)}</p>
        </div>
        <div class="links">
          <a href="${escapeHtml(campaign.sharePath)}">Seed link</a>
          <a href="${escapeHtml(campaign.pagePath)}">Organic page</a>
        </div>
        <dl>
          <div><dt>Campaign</dt><dd>${escapeHtml(campaign.id)}</dd></div>
          <div><dt>Target starts</dt><dd>${campaign.measurement.targetStartsBeforeJudgment}</dd></div>
          <div><dt>Cost</dt><dd>$${campaign.costUsd.toFixed(2)}</dd></div>
        </dl>
        <label>
          Share copy
          <textarea readonly>${escapeHtml(`${campaign.copy.title}\n${campaign.copy.text}\n${campaign.sharePath}`)}</textarea>
        </label>
      </article>`,
  )
  .join('\n')

const seedKitHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Autonomous Game Lab Seed Kit</title>
    <meta name="robots" content="noindex">
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17201b; background: #f7f7f2; }
      body { margin: 0; }
      main { width: min(1040px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 48px; }
      header { display: grid; gap: 10px; margin-bottom: 24px; }
      h1, h2, p { margin: 0; }
      h1 { font-size: clamp(2rem, 6vw, 4.5rem); line-height: 0.95; max-width: 11ch; }
      h2 { font-size: 1.3rem; line-height: 1.15; }
      .lede { max-width: 680px; font-size: 1rem; line-height: 1.55; color: #46544c; }
      .summary { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
      .pill { border: 1px solid #c7d0c6; border-radius: 999px; padding: 8px 12px; background: #ffffff; font-weight: 700; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }
      .campaign { display: grid; gap: 14px; background: #ffffff; border: 1px solid #d6ded2; border-radius: 8px; padding: 18px; box-shadow: 0 10px 24px rgba(22, 36, 26, 0.08); }
      .eyebrow { color: #496858; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
      .campaign p:not(.eyebrow) { color: #4e5c54; line-height: 1.45; }
      .links { display: flex; gap: 10px; flex-wrap: wrap; }
      a { color: #ffffff; background: #1f6b4d; border-radius: 6px; padding: 10px 12px; text-decoration: none; font-weight: 800; }
      a + a { color: #1f6b4d; background: #e9f2eb; }
      dl { display: grid; gap: 8px; margin: 0; }
      dl div { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #edf1ea; padding-top: 8px; }
      dt { color: #5d6b63; }
      dd { margin: 0; font-weight: 800; text-align: right; overflow-wrap: anywhere; }
      label { display: grid; gap: 6px; color: #5d6b63; font-weight: 700; }
      textarea { min-height: 96px; resize: vertical; border: 1px solid #cfd8cd; border-radius: 6px; padding: 10px; font: inherit; color: #1c2a21; background: #fbfcfa; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">Zero-spend seed traffic</p>
        <h1>Autonomous Game Lab Seed Kit</h1>
        <p class="lede">These are the current organic campaign links for under-measured games. Share only in places where posting is welcome, keep spend at $0.00, and judge quality only after the target start sample is reached.</p>
        <div class="summary">
          <span class="pill">${campaigns.length} campaigns</span>
          <span class="pill">$0.00 spend</span>
          <span class="pill">${payload.guardrails.minimumStartsBeforeQualityJudgment} starts before judgment</span>
        </div>
      </header>
      <section class="grid" aria-label="Seed campaigns">
        ${seedKitCards}
      </section>
    </main>
  </body>
</html>
`

const report = [
  '# Traffic Seeding',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.analyticsSource}`,
  `Max cost: $${payload.guardrails.maxCostUsd.toFixed(2)}`,
  '',
  '## Campaigns',
  '',
  ...payload.campaigns.map(
    (campaign) =>
      `- #${campaign.priority} ${campaign.title}: ${campaign.status}, ${campaign.dataConfidence}, ${campaign.playPath}`,
  ),
  '',
  '## Channels',
  '',
  ...payload.channels.map((channel) => `- ${channel.id}: ${channel.status}, $${channel.costUsd}`),
  '',
  '## Seed Kit',
  '',
  `- /seed-kit.html with ${payload.campaigns.length} zero-spend seed campaign links.`,
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(shareManifestPath), { recursive: true })
await mkdir(path.dirname(seedKitPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const trafficSeeding = ${JSON.stringify(payload, null, 2)} as const\n\nexport type TrafficSeeding = typeof trafficSeeding\n`,
)
await writeFile(shareManifestPath, JSON.stringify(nextShareManifest, null, 2) + '\n')
await writeFile(seedKitPath, seedKitHtml)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, shareManifestPath)}`)
console.log(`Wrote ${path.relative(root, seedKitPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
