import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'traffic-seeding.json')
const outputTsPath = path.join(root, 'src', 'data', 'trafficSeeding.ts')
const reportPath = path.join(root, 'reports', 'traffic-seeding-latest.md')
const shareManifestPath = path.join(root, 'public', 'share-manifest.json')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const slugDate = () => new Date().toISOString().slice(0, 10).replaceAll('-', '')

const absoluteUrl = (siteUrl, pathname) => `${siteUrl.replace(/\/$/, '')}${pathname.startsWith('/') ? pathname : `/${pathname}`}`

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
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(shareManifestPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const trafficSeeding = ${JSON.stringify(payload, null, 2)} as const\n\nexport type TrafficSeeding = typeof trafficSeeding\n`,
)
await writeFile(shareManifestPath, JSON.stringify(nextShareManifest, null, 2) + '\n')
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, shareManifestPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
