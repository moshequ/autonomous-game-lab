import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { localIsoDate } from './lib/product-date.mjs'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'traffic-seeding.json')
const outputTsPath = path.join(root, 'src', 'data', 'trafficSeeding.ts')
const reportPath = path.join(root, 'reports', 'traffic-seeding-latest.md')
const shareManifestPath = path.join(root, 'public', 'share-manifest.json')
const seedKitPath = path.join(root, 'public', 'seed-kit.html')
const seedNextJsonPath = path.join(root, 'public', 'seed-next.json')
const seedNextHtmlPath = path.join(root, 'public', 'seed-next.html')
const sampleNextJsonPath = path.join(root, 'public', 'sample-next.json')
const sampleNextHtmlPath = path.join(root, 'public', 'sample-next.html')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const slugDate = () => localIsoDate().replaceAll('-', '')

const rootPath = (pathname) => (String(pathname).startsWith('/') ? String(pathname) : `/${pathname}`)
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
const safePublicUrl = (value, fallbackPath, siteUrl) => {
  if (!value) {
    return siteUrl ? `${siteUrl}${rootPath(fallbackPath)}` : rootPath(fallbackPath)
  }

  if (String(value).startsWith('/')) {
    return String(value)
  }

  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()

    if (
      hostname === 'autonomous-game-lab.example.com' ||
      hostname.endsWith('.example.com') ||
      hostname === 'owner.github.io'
    ) {
      return siteUrl ? `${siteUrl}${url.pathname}${url.search}${url.hash}` : `${url.pathname}${url.search}${url.hash}`
    }

    return url.toString()
  } catch {
    return siteUrl ? `${siteUrl}${rootPath(fallbackPath)}` : rootPath(fallbackPath)
  }
}
const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
const safeJsonScript = (value) => JSON.stringify(value).replaceAll('<', '\\u003c')

const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const portfolio = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const unitEconomics = await readOptionalJson(path.join(dataDir, 'unit-economics.json'), {
  controls: { paidAcquisitionAllowed: false, maxDailySpendUsd: 0 },
})
const productGateSamplePlan = await readOptionalJson(path.join(dataDir, 'product-gate-sample-plan.json'), {
  status: 'missing',
  summary: {},
  publicSamplePage: { path: '/gate-sample.html' },
  missions: [],
  controls: {},
})
const supportChannel = await readOptionalJson(path.join(dataDir, 'support-channel.json'), {
  status: 'missing',
  repository: { target: null },
  controls: {},
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
const siteUrl = normalizePublicOrigin(growth.siteUrl) ?? normalizePublicOrigin(shareManifest.siteUrl)
const publicUrlMode = siteUrl ? 'absolute-origin' : 'runtime-relative'
const publicUrl = (pathname) => (siteUrl ? `${siteUrl}${rootPath(pathname)}` : rootPath(pathname))
const runtimeHref = (value) => (String(value).startsWith('/') ? `.${value}` : value)
const aggregateEvidenceRepository =
  typeof supportChannel.repository?.target === 'string' && /^[\w.-]+\/[\w.-]+$/.test(supportChannel.repository.target)
    ? supportChannel.repository.target
    : null
const runDate = slugDate()
const seedIds = (portfolio.rotation?.seedTrafficGameIds ?? []).filter((gameId) => playableIds.has(gameId))
const campaignIds = seedIds.length ? seedIds : (portfolio.games ?? []).slice(0, 4).map((game) => game.gameId)
const sourceDataHash = hashSourceData({
  runDate,
  playable,
  portfolio,
  growth,
  analytics,
  unitEconomics,
  supportChannel: {
    status: supportChannel.status,
    repository: aggregateEvidenceRepository,
    analyticsEvidenceAggregateOnly: supportChannel.controls?.analyticsEvidenceAggregateOnly === true,
  },
})

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
  {
    id: 'evergreen-seed-route',
    status: 'armed',
    costUsd: 0,
    surface: 'seed-next-page',
    telemetry: ['seed_next_viewed', 'seed_next_routed', 'organic_entry_opened', 'game_started'],
  },
  {
    id: 'product-gate-sample',
    status: productGateSamplePlan.status === 'product-gate-sample-plan-ready' ? 'armed' : 'waiting',
    costUsd: 0,
    surface: 'gate-sample-page-and-sample-next-route',
    telemetry: ['sample_next_viewed', 'sample_next_routed', 'gate_sample_mission_clicked', 'share_clicked', 'analytics_exported'],
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
      playUrl: publicUrl(playPath),
      pagePath: page?.pagePath ?? `/games/${gameId}.html`,
      pageUrl: safePublicUrl(page?.canonicalUrl, page?.pagePath ?? `/games/${gameId}.html`, siteUrl),
      shareUrl: publicUrl(sharePath),
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
const normalizedShares = (shareManifest.shares ?? []).map((share) => {
  const page = growthById.get(share.gameId)
  const fallbackPath =
    page?.shareUrl && String(page.shareUrl).startsWith('/')
      ? page.shareUrl
      : `/?game=${encodeURIComponent(share.gameId)}&utm_source=share&utm_campaign=${encodeURIComponent(share.gameId)}`

  return {
    ...share,
    url: safePublicUrl(share.url, fallbackPath, siteUrl),
  }
})
const gateSampleKitPath = productGateSamplePlan.publicSamplePage?.path ?? '/gate-sample.html'
const gateSampleMissions = (productGateSamplePlan.missions ?? []).map((mission, index) => {
  const playPath =
    mission.playPath ??
    `/?game=${encodeURIComponent(mission.gameId)}&utm_source=gate_sample&utm_campaign=${encodeURIComponent(
      mission.campaignId,
    )}`

  return {
    id: mission.campaignId,
    campaignId: mission.campaignId,
    gateId: mission.gateId,
    gameId: mission.gameId,
    title: `Sample ${mission.label ?? mission.gateId}`,
    text: `${mission.title} needs real zero-spend player evidence before revenue or store gates move.`,
    url: publicUrl(playPath),
    playPath,
    pageUrl: publicUrl(gateSampleKitPath),
    priority: mission.rank ?? index + 1,
    costUsd: mission.controls?.costUsd ?? 0,
    needed: {
      promptViews: mission.needed?.promptViews ?? 0,
      successes: mission.needed?.successes ?? 0,
    },
    tags: ['product-gate-sample', mission.gateId, mission.sampleRole, 'zero-spend'].filter(Boolean),
  }
})
const defaultGateSampleMission =
  gateSampleMissions.find((mission) => mission.campaignId === productGateSamplePlan.summary?.defaultRouteCampaignId) ??
  gateSampleMissions[0] ??
  null
const seedNextCampaign = campaigns[0] ?? null
const seedNextRoute = {
  status: seedNextCampaign ? 'armed' : 'waiting-for-seed-campaign',
  path: '/seed-next.html',
  jsonPath: '/seed-next.json',
  targetCampaignId: seedNextCampaign?.id ?? null,
  targetGameId: seedNextCampaign?.gameId ?? null,
  targetTitle: seedNextCampaign?.title ?? null,
  targetPath: seedNextCampaign?.sharePath ?? null,
  targetUrl: seedNextCampaign?.shareUrl ?? null,
  fallbackPath: '/seed-kit.html',
  costUsd: 0,
  playerInitiatedOnly: true,
  noAutomatedExternalPosting: true,
  noPaidPromotion: true,
  localAnalyticsEvents: true,
  localAnalyticsStorageKey: 'agl.analytics.events',
  telemetry: ['seed_next_viewed', 'seed_next_routed', 'organic_entry_opened', 'game_started'],
}
const sampleNextRoute = {
  status: defaultGateSampleMission ? 'armed' : 'waiting-for-sample-plan',
  path: '/sample-next.html',
  jsonPath: '/sample-next.json',
  targetCampaignId: defaultGateSampleMission?.campaignId ?? null,
  targetGateId: defaultGateSampleMission?.gateId ?? null,
  targetGameId: defaultGateSampleMission?.gameId ?? null,
  targetTitle: defaultGateSampleMission?.title ?? null,
  targetPath: defaultGateSampleMission?.playPath ?? null,
  targetUrl: defaultGateSampleMission?.url ?? null,
  fallbackPath: gateSampleKitPath,
  costUsd: 0,
  playerInitiatedOnly: true,
  noAutomatedExternalPosting: true,
  noPaidPromotion: true,
  noSyntheticEvents: true,
  noRevenueEnablement: true,
  localAnalyticsEvents: true,
  localAnalyticsStorageKey: 'agl.analytics.events',
  telemetry: ['sample_next_viewed', 'sample_next_routed', 'gate_sample_mission_clicked', 'game_started'],
}

const payload = {
  generatedAt: new Date().toISOString(),
  status: campaigns.length ? 'traffic-seeding-ready' : 'blocked-no-seed-games',
  sourceDataHash,
  analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
  publicUrlMode,
  siteUrl,
  portfolioGeneratedAt: portfolio.generatedAt,
  guardrails: {
    maxCostUsd: 0,
    noPaidPromotion: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    noExternalPostingWithoutCredentials: true,
    noAutomatedExternalPosting: true,
    playerInitiatedSharingOnly: true,
    productGateSampleSharingOnly: true,
    publicAggregateEvidenceIsSupportingOnly: true,
    aggregateEvidenceDoesNotPassAcquisitionGates: true,
    minimumStartsBeforeQualityJudgment: 40,
  },
  channels,
  campaigns,
  evergreenRoute: seedNextRoute,
  sampleNextRoute,
  sampleDistribution: {
    status: gateSampleMissions.length ? 'gate-sample-sharing-ready' : 'waiting-for-sample-plan',
    kitPath: gateSampleKitPath,
    sampleNextPath: sampleNextRoute.path,
    sampleNextJsonPath: sampleNextRoute.jsonPath,
    defaultCampaignId: defaultGateSampleMission?.campaignId ?? null,
    defaultGateId: defaultGateSampleMission?.gateId ?? null,
    missionCount: gateSampleMissions.length,
    costUsd: 0,
    playerInitiatedSharingOnly: true,
    noAutomatedExternalPosting: true,
    noSyntheticEvents: productGateSamplePlan.controls?.noSyntheticGatePasses === true,
    exportControls: productGateSamplePlan.publicSamplePage?.playerInitiatedExportEnabled === true,
    shareControls: productGateSamplePlan.publicSamplePage?.playerInitiatedShareEnabled === true,
  },
  sitemapPriority,
  nextActions: [
    ...(campaigns.length
      ? [`Feature ${campaigns[0].title} in the internal growth loop and share manifest.`]
      : ['Wait for portfolio policy to identify seed games.']),
    ...(defaultGateSampleMission
      ? [`Feature ${defaultGateSampleMission.title} as the default product-gate sample share link.`]
      : []),
    'Keep traffic sources organic/internal until paid acquisition gates pass.',
    'Judge seeded games only after each reaches the target start sample.',
  ],
}

const nextShareManifest = {
  ...shareManifest,
  generatedAt: payload.generatedAt,
  siteUrl,
  publicUrlMode,
  shares: normalizedShares,
  seedKit: {
    path: '/seed-kit.html',
    url: publicUrl('/seed-kit.html'),
    campaignCount: campaigns.length,
    costUsd: 0,
    playerInitiatedSharingOnly: true,
    copyShareControls: true,
    playerInitiatedAggregateEvidenceEnabled: Boolean(aggregateEvidenceRepository),
    aggregateEvidenceIssueTemplate: 'analytics-evidence.yml',
    aggregateEvidenceRepository,
    localAnalyticsEvents: true,
    localAnalyticsStorageKey: 'agl.analytics.events',
    generatedAt: payload.generatedAt,
  },
  seedNext: {
    ...seedNextRoute,
    url: publicUrl('/seed-next.html'),
    jsonUrl: publicUrl('/seed-next.json'),
    generatedAt: payload.generatedAt,
  },
  sampleNext: {
    ...sampleNextRoute,
    url: publicUrl('/sample-next.html'),
    jsonUrl: publicUrl('/sample-next.json'),
    generatedAt: payload.generatedAt,
  },
  gateSampleKit: {
    path: gateSampleKitPath,
    url: publicUrl(gateSampleKitPath),
    campaignCount: gateSampleMissions.length,
    defaultCampaignId: defaultGateSampleMission?.campaignId ?? null,
    costUsd: 0,
    playerInitiatedSharingOnly: true,
    copyShareControls: true,
    exportControls: productGateSamplePlan.publicSamplePage?.playerInitiatedExportEnabled === true,
    localAnalyticsEvents: true,
    localAnalyticsStorageKey: 'agl.analytics.events',
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
  gateSampleMissions,
}

const seedKitCards = campaigns
  .map(
    (campaign) => {
      const runtimeSharePath = runtimeHref(campaign.sharePath)
      const runtimePagePath = runtimeHref(campaign.pagePath)

      return `
      <article class="campaign" data-campaign-id="${escapeHtml(campaign.id)}" data-share-path="${escapeHtml(
        runtimeSharePath,
      )}" data-game-id="${escapeHtml(campaign.gameId)}" data-share-title="${escapeHtml(
        campaign.copy.title,
      )}" data-share-text="${escapeHtml(campaign.copy.text)}">
        <div>
          <p class="eyebrow">Priority ${campaign.priority} · ${escapeHtml(campaign.dataConfidence)}</p>
          <h2>${escapeHtml(campaign.title)}</h2>
          <p>${escapeHtml(campaign.copy.text)}</p>
        </div>
        <div class="actions">
          <a href="${escapeHtml(runtimeSharePath)}" data-seed-link>Seed link</a>
          <a class="secondary" href="${escapeHtml(runtimePagePath)}">Organic page</a>
          <button type="button" data-seed-action="copy">Copy share text</button>
          <button class="secondary" type="button" data-seed-action="share">Share</button>
          ${
            aggregateEvidenceRepository
              ? '<button class="secondary" type="button" data-seed-action="evidence">Share evidence</button>'
              : ''
          }
        </div>
        <dl>
          <div><dt>Campaign</dt><dd>${escapeHtml(campaign.id)}</dd></div>
          <div><dt>Target starts</dt><dd>${campaign.measurement.targetStartsBeforeJudgment}</dd></div>
          <div><dt>Cost</dt><dd>$${campaign.costUsd.toFixed(2)}</dd></div>
        </dl>
        <label>
          Share copy
          <textarea data-share-copy readonly>${escapeHtml(`${campaign.copy.title}\n${campaign.copy.text}\n${runtimeSharePath}`)}</textarea>
        </label>
        <p class="status" data-seed-status aria-live="polite"></p>
      </article>`
    },
  )
  .join('\n')
const seedNextStrip = seedNextCampaign
  ? `<section class="sampleStrip" aria-label="Evergreen seed route">
        <div>
          <p class="eyebrow">Evergreen seed route</p>
          <h2>${escapeHtml(seedNextCampaign.title)}</h2>
          <p>Share one stable link that automatically routes to the current under-measured zero-spend seed campaign after each autonomous refresh.</p>
        </div>
        <div class="actions">
          <a href="${escapeHtml(runtimeHref(seedNextRoute.path))}">Open seed-next</a>
          <a class="secondary" href="${escapeHtml(runtimeHref(seedNextCampaign.sharePath))}">Current target</a>
        </div>
        <dl>
          <div><dt>Campaign</dt><dd>${escapeHtml(seedNextCampaign.id)}</dd></div>
          <div><dt>Game</dt><dd>${escapeHtml(seedNextCampaign.gameId)}</dd></div>
          <div><dt>Cost</dt><dd>$${seedNextCampaign.costUsd.toFixed(2)}</dd></div>
        </dl>
      </section>`
  : ''
const gateSampleStrip = defaultGateSampleMission
  ? `<section class="sampleStrip" aria-label="Product gate sample kit">
        <div>
          <p class="eyebrow">Product gate sample</p>
          <h2>${escapeHtml(defaultGateSampleMission.title)}</h2>
          <p>${escapeHtml(defaultGateSampleMission.text)}</p>
        </div>
        <div class="actions">
          <a href="${escapeHtml(runtimeHref(sampleNextRoute.path))}">Open sample-next</a>
          <a href="${escapeHtml(runtimeHref(gateSampleKitPath))}">Open gate missions</a>
          <a class="secondary" href="${escapeHtml(runtimeHref(defaultGateSampleMission.playPath))}">Start default sample</a>
        </div>
        <dl>
          <div><dt>Campaign</dt><dd>${escapeHtml(defaultGateSampleMission.campaignId)}</dd></div>
          <div><dt>Need</dt><dd>${defaultGateSampleMission.needed.promptViews} views / ${defaultGateSampleMission.needed.successes} wins</dd></div>
          <div><dt>Cost</dt><dd>$${defaultGateSampleMission.costUsd.toFixed(2)}</dd></div>
        </dl>
      </section>`
  : ''

const seedKitHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Autonomous Game Lab Seed Kit</title>
    <meta name="robots" content="index,follow">
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
      .sampleStrip { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; margin-bottom: 18px; background: #ffffff; border: 1px solid #d6ded2; border-radius: 8px; padding: 18px; box-shadow: 0 10px 24px rgba(22, 36, 26, 0.08); }
      .campaign { display: grid; gap: 14px; background: #ffffff; border: 1px solid #d6ded2; border-radius: 8px; padding: 18px; box-shadow: 0 10px 24px rgba(22, 36, 26, 0.08); }
      .eyebrow { color: #496858; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
      .campaign p:not(.eyebrow) { color: #4e5c54; line-height: 1.45; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
      a, button { color: #ffffff; background: #1f6b4d; border: 0; border-radius: 6px; padding: 10px 12px; text-decoration: none; font: inherit; font-weight: 800; cursor: pointer; min-height: 42px; }
      .secondary { color: #1f6b4d; background: #e9f2eb; }
      dl { display: grid; gap: 8px; margin: 0; }
      dl div { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #edf1ea; padding-top: 8px; }
      dt { color: #5d6b63; }
      dd { margin: 0; font-weight: 800; text-align: right; overflow-wrap: anywhere; }
      label { display: grid; gap: 6px; color: #5d6b63; font-weight: 700; }
      textarea { min-height: 96px; resize: vertical; border: 1px solid #cfd8cd; border-radius: 6px; padding: 10px; font: inherit; color: #1c2a21; background: #fbfcfa; }
      .status { min-height: 1.25rem; color: #496858; font-size: 0.9rem; font-weight: 700; }
      @media (max-width: 760px) { .sampleStrip { grid-template-columns: 1fr; } }
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
      </header>${seedNextStrip ? `\n      ${seedNextStrip}` : ''}${gateSampleStrip ? `\n      ${gateSampleStrip}` : ''}
      <section class="grid" aria-label="Seed campaigns">
        ${seedKitCards}
      </section>
    </main>
    <script type="application/json" id="seed-kit-support-data">${safeJsonScript({
      repository: aggregateEvidenceRepository,
      template: 'analytics-evidence.yml',
    })}</script>
    <script>
      (() => {
        const analyticsKey = 'agl.analytics.events'
        const support = JSON.parse(document.getElementById('seed-kit-support-data')?.textContent || '{}')
        const readEvents = () => {
          try {
            const raw = window.localStorage.getItem(analyticsKey)
            const events = raw ? JSON.parse(raw) : []
            return Array.isArray(events) ? events : []
          } catch {
            return []
          }
        }
        const writeEvents = (events) => {
          window.localStorage.setItem(analyticsKey, JSON.stringify(events.slice(-300)))
        }
        const createId = (prefix) =>
          window.crypto?.randomUUID
            ? \`\${prefix}-\${window.crypto.randomUUID()}\`
            : \`\${prefix}-\${Date.now()}-\${Math.random().toString(16).slice(2)}\`
        const trackSeedEvent = (name, card, properties = {}) => {
          const event = {
            id: createId('seed'),
            name,
            properties: {
              gameId: card.dataset.gameId,
              campaignId: card.dataset.campaignId,
              acquisitionCampaign: card.dataset.campaignId,
              acquisitionSource: 'seed_share',
              acquisitionChannel: 'player-share',
              surface: 'seed-kit',
              zeroPaidSpend: true,
              playerInitiated: true,
              ...properties,
            },
            createdAt: new Date().toISOString(),
          }
          writeEvents([...readEvents(), event])
        }
        const eventNames = (events, names) => {
          const wanted = new Set(names)
          return events.filter((event) => wanted.has(event.name)).length
        }
        const uniquePlayers = (events, names) => {
          const wanted = new Set(names)
          const players = new Set(
            events
              .filter((event) => wanted.has(event.name))
              .map((event) => event.properties?.anonymousId)
              .filter((anonymousId) => typeof anonymousId === 'string' && anonymousId),
          )

          return players.size
        }
        const evidenceWindowFor = (events) => {
          const dates = events
            .flatMap((event) => {
              const timestamp = Date.parse(event.createdAt || '')
              return Number.isFinite(timestamp) ? [new Date(timestamp).toISOString().slice(0, 10)] : []
            })
            .sort()

          if (!dates.length) {
            return new Date().toISOString().slice(0, 10)
          }

          const first = dates[0]
          const last = dates[dates.length - 1] || first

          return first === last ? first : \`\${first} to \${last}\`
        }
        const campaignEvents = (card, events) =>
          events.filter((event) => {
            const properties = event.properties || {}
            return (
              properties.acquisitionCampaign === card.dataset.campaignId ||
              properties.campaignId === card.dataset.campaignId ||
              properties.campaign === card.dataset.campaignId ||
              properties.utm_campaign === card.dataset.campaignId
            )
          })
        const aggregateIssueUrl = (card, events) => {
          if (!support.repository || !/^[\\w.-]+\\/[\\w.-]+$/.test(support.repository)) {
            return null
          }

          const scoped = campaignEvents(card, events)
          const url = new URL(\`https://github.com/\${support.repository}/issues/new\`)
          const counts = {
            starts: eventNames(scoped, ['game_started']),
            completions: eventNames(scoped, ['level_completed']),
            replays: eventNames(scoped, ['replay_clicked']),
            d1Eligible: uniquePlayers(scoped, ['daily_challenge_completed']),
            d1Retained: uniquePlayers(scoped, ['daily_return_intent_started']),
          }

          url.searchParams.set('template', support.template || 'analytics-evidence.yml')
          url.searchParams.set('title', \`[Evidence] \${card.dataset.shareTitle} seed campaign aggregate counts\`)
          url.searchParams.set('game', \`\${card.dataset.shareTitle} (\${card.dataset.gameId}; organicSeed; \${card.dataset.campaignId})\`)
          url.searchParams.set('window', evidenceWindowFor(scoped))
          url.searchParams.set('starts', String(counts.starts))
          url.searchParams.set('completions', String(counts.completions))
          url.searchParams.set('replays', String(counts.replays))
          url.searchParams.set('d1_eligible', String(counts.d1Eligible))
          url.searchParams.set('d1_retained', String(counts.d1Retained))
          url.searchParams.set(
            'summary',
            \`Aggregate-only seed campaign summary from \${scoped.length} local event(s) for \${card.dataset.campaignId}. Raw event rows and identifiers remain on the device. Aggregate evidence supports acquisition review but does not pass acquisition or product gates by itself.\`,
          )

          return { url: url.toString(), counts, eventCount: scoped.length }
        }
        const shareAggregateEvidence = (card) => {
          const events = readEvents()
          const evidence = aggregateIssueUrl(card, events)

          if (!evidence) {
            return false
          }

          const evidenceEvent = {
            id: createId('seed-evidence'),
            name: 'analytics_evidence_issue_opened',
            properties: {
              surface: 'public-seed-kit',
              channel: 'organic-seed',
              campaignId: card.dataset.campaignId,
              gameId: card.dataset.gameId,
              acquisitionCampaign: card.dataset.campaignId,
              acquisitionSource: 'seed_share',
              acquisitionChannel: 'player-share',
              starts: evidence.counts.starts,
              completions: evidence.counts.completions,
              replays: evidence.counts.replays,
              d1Eligible: evidence.counts.d1Eligible,
              d1Retained: evidence.counts.d1Retained,
              localCampaignEvents: evidence.eventCount,
              publicAggregateOnly: true,
              rawEventsIncluded: false,
              identifiersIncluded: false,
              aggregateEvidenceDoesNotPassGates: true,
              aggregateEvidenceDoesNotPassAcquisitionGates: true,
              destination: 'github-issues',
              zeroPaidSpend: true,
              noSyntheticEvents: true,
              noRevenueEnablement: true,
            },
            createdAt: new Date().toISOString(),
          }

          writeEvents([...events, evidenceEvent])
          window.open(evidence.url, '_blank', 'noopener,noreferrer')
          return true
        }
        const writeClipboard = async (text, textarea) => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text)
            return true
          }

          textarea.focus()
          textarea.select()
          return document.execCommand('copy')
        }

        document.querySelectorAll('[data-campaign-id]').forEach((card) => {
          trackSeedEvent('organic_seed_card_viewed', card, {
            sharePath: card.dataset.sharePath,
            source: 'seed-kit-page-view',
          })
        })

        document.querySelectorAll('[data-seed-link]').forEach((link) => {
          link.addEventListener('click', () => {
            const card = link.closest('[data-campaign-id]')
            trackSeedEvent('seed_campaign_clicked', card, {
              sharePath: card.dataset.sharePath,
              linkType: 'seed-link',
            })
          })
        })

        document.querySelectorAll('[data-seed-action]').forEach((button) => {
          const originalLabel = button.textContent
          button.addEventListener('click', async () => {
            const card = button.closest('[data-campaign-id]')
            const textarea = card.querySelector('[data-share-copy]')
            const status = card.querySelector('[data-seed-status]')
            const url = new URL(card.dataset.sharePath, window.location.href).toString()
            const title = card.dataset.shareTitle
            const text = card.dataset.shareText
            const copy = [title, text, url].join('\\n')
            if (button.dataset.seedAction === 'evidence') {
              const opened = shareAggregateEvidence(card)
              status.textContent = opened ? 'Aggregate evidence issue opened.' : 'Evidence handoff is not configured.'
              button.textContent = opened ? 'Opened' : originalLabel
              window.setTimeout(() => {
                button.textContent = originalLabel
              }, 1600)
              return
            }
            const method = button.dataset.seedAction === 'share' && navigator.share ? 'native' : 'clipboard'

            try {
              if (method === 'native') {
                await navigator.share({ title, text, url })
                status.textContent = 'Share sheet opened.'
              } else {
                await writeClipboard(copy, textarea)
                status.textContent = 'Share text copied.'
              }
              trackSeedEvent('organic_seed_share_clicked', card, {
                method,
                succeeded: true,
                shareUrl: url,
              })
              trackSeedEvent('share_clicked', card, {
                method,
                succeeded: true,
                shareUrl: url,
                seeded: true,
              })
              button.textContent = 'Done'
            } catch {
              status.textContent = 'Copy the share text manually.'
              trackSeedEvent('share_clicked', card, {
                method,
                succeeded: false,
                shareUrl: url,
                seeded: true,
              })
            }

            window.setTimeout(() => {
              button.textContent = originalLabel
            }, 1600)
          })
        })
      })()
    </script>
  </body>
</html>
`

const seedNextPublicPayload = {
  generatedAt: payload.generatedAt,
  status: seedNextRoute.status,
  path: seedNextRoute.path,
  jsonPath: seedNextRoute.jsonPath,
  target: seedNextCampaign
    ? {
        campaignId: seedNextCampaign.id,
        gameId: seedNextCampaign.gameId,
        title: seedNextCampaign.title,
        priority: seedNextCampaign.priority,
        targetPath: seedNextCampaign.sharePath,
        targetUrl: seedNextCampaign.shareUrl,
        copy: seedNextCampaign.copy,
        targetStartsBeforeJudgment: seedNextCampaign.measurement.targetStartsBeforeJudgment,
      }
    : null,
  fallbackPath: seedNextRoute.fallbackPath,
  guardrails: {
    costUsd: seedNextRoute.costUsd,
    playerInitiatedOnly: seedNextRoute.playerInitiatedOnly,
    noAutomatedExternalPosting: seedNextRoute.noAutomatedExternalPosting,
    noPaidPromotion: seedNextRoute.noPaidPromotion,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
  },
  telemetry: seedNextRoute.telemetry,
}
const seedNextRuntimeHref = seedNextCampaign ? runtimeHref(seedNextCampaign.sharePath) : runtimeHref(seedNextRoute.fallbackPath)
const seedNextHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Play the Current Seed Game | Autonomous Game Lab</title>
    <meta name="robots" content="index,follow">
    <meta name="description" content="An evergreen zero-spend route to the current under-measured Autonomous Game Lab seed game.">
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a211d; background: #f7f7f2; }
      body { margin: 0; }
      main { display: grid; align-content: center; gap: 18px; min-height: 100svh; width: min(760px, calc(100% - 32px)); margin: 0 auto; padding: 36px 0; }
      h1, p { margin: 0; }
      h1 { font-size: clamp(2.4rem, 8vw, 5rem); line-height: 0.95; letter-spacing: 0; max-width: 10ch; }
      p { color: #4f5d55; line-height: 1.55; max-width: 620px; }
      .eyebrow { color: #496858; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; }
      a, button { color: #ffffff; background: #1f6b4d; border: 0; border-radius: 6px; padding: 10px 12px; text-decoration: none; font: inherit; font-weight: 800; cursor: pointer; min-height: 42px; }
      .secondary { color: #1f6b4d; background: #e9f2eb; }
      dl { display: grid; gap: 8px; margin: 8px 0 0; padding: 16px; background: #ffffff; border: 1px solid #d6ded2; border-radius: 8px; }
      dl div { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #edf1ea; padding-top: 8px; }
      dl div:first-child { border-top: 0; padding-top: 0; }
      dt { color: #5d6b63; }
      dd { margin: 0; font-weight: 800; text-align: right; overflow-wrap: anywhere; }
      .status { min-height: 1.4rem; color: #496858; font-weight: 800; }
    </style>
  </head>
  <body>
    <main data-seed-next data-campaign-id="${escapeHtml(seedNextCampaign?.id ?? '')}" data-game-id="${escapeHtml(
      seedNextCampaign?.gameId ?? '',
    )}" data-target-path="${escapeHtml(seedNextRuntimeHref)}">
      <p class="eyebrow">Zero-spend evergreen seed route</p>
      <h1>${escapeHtml(seedNextCampaign ? `Play ${seedNextCampaign.title}` : 'Seed game waiting')}</h1>
      <p>${escapeHtml(
        seedNextCampaign
          ? `${seedNextCampaign.copy.text} This stable page follows the current autonomous seed target, so old shares keep pointing at the next game that needs real player starts.`
          : 'The seed route is waiting for traffic seeding to publish a campaign.',
      )}</p>
      <div class="actions">
        <a href="${escapeHtml(seedNextRuntimeHref)}" data-seed-next-link>${escapeHtml(
          seedNextCampaign?.copy.cta ?? 'Open seed kit',
        )}</a>
        <a class="secondary" href="./seed-kit.html">Open seed kit</a>
      </div>
      <dl>
        <div><dt>Campaign</dt><dd>${escapeHtml(seedNextCampaign?.id ?? 'waiting')}</dd></div>
        <div><dt>Target starts</dt><dd>${seedNextCampaign?.measurement.targetStartsBeforeJudgment ?? 0}</dd></div>
        <div><dt>Cost</dt><dd>$0.00</dd></div>
      </dl>
      <p class="status" data-seed-next-status aria-live="polite">Preparing route.</p>
    </main>
    <script>
      (() => {
        const route = ${JSON.stringify(seedNextPublicPayload)}
        const analyticsKey = 'agl.analytics.events'
        const params = new URLSearchParams(window.location.search)
        const previewOnly = params.get('preview') === '1' || params.get('no_redirect') === '1'
        const root = document.querySelector('[data-seed-next]')
        const status = document.querySelector('[data-seed-next-status]')
        const targetPath = root?.dataset.targetPath || './seed-kit.html'
        const campaignId = root?.dataset.campaignId || route.target?.campaignId || null
        const gameId = root?.dataset.gameId || route.target?.gameId || null
        const readEvents = () => {
          try {
            const raw = window.localStorage.getItem(analyticsKey)
            const events = raw ? JSON.parse(raw) : []
            return Array.isArray(events) ? events : []
          } catch {
            return []
          }
        }
        const createId = (prefix) =>
          window.crypto?.randomUUID
            ? \`\${prefix}-\${window.crypto.randomUUID()}\`
            : \`\${prefix}-\${Date.now()}-\${Math.random().toString(16).slice(2)}\`
        const track = (name, properties = {}) => {
          const event = {
            id: createId('seed-next'),
            name,
            properties: {
              gameId,
              campaignId,
              acquisitionCampaign: campaignId,
              acquisitionSource: 'seed_next',
              acquisitionChannel: 'evergreen-seed-route',
              surface: 'seed-next',
              zeroPaidSpend: true,
              playerInitiated: true,
              automatedExternalPosting: false,
              ...properties,
            },
            createdAt: new Date().toISOString(),
          }
          window.localStorage.setItem(analyticsKey, JSON.stringify([...readEvents(), event].slice(-300)))
        }

        track('seed_next_viewed', { targetPath, previewOnly })

        document.querySelector('[data-seed-next-link]')?.addEventListener('click', () => {
          track('seed_campaign_clicked', { targetPath, linkType: 'seed-next-link' })
        })

        if (!previewOnly && route.target) {
          status.textContent = 'Routing to the current seed game.'
          window.setTimeout(() => {
            track('seed_next_routed', { targetPath })
            window.location.assign(targetPath)
          }, 350)
        } else {
          status.textContent = route.target ? 'Preview mode. Use the button to open the current seed game.' : 'No seed campaign is armed yet.'
        }
      })()
    </script>
  </body>
</html>
`

const sampleNextPublicPayload = {
  generatedAt: payload.generatedAt,
  status: sampleNextRoute.status,
  path: sampleNextRoute.path,
  jsonPath: sampleNextRoute.jsonPath,
  target: defaultGateSampleMission
    ? {
        campaignId: defaultGateSampleMission.campaignId,
        gateId: defaultGateSampleMission.gateId,
        gameId: defaultGateSampleMission.gameId,
        title: defaultGateSampleMission.title,
        priority: defaultGateSampleMission.priority,
        targetPath: defaultGateSampleMission.playPath,
        targetUrl: defaultGateSampleMission.url,
        pageUrl: defaultGateSampleMission.pageUrl,
        copy: {
          title: defaultGateSampleMission.title,
          text: defaultGateSampleMission.text,
          cta: 'Start measured run',
        },
        needed: defaultGateSampleMission.needed,
      }
    : null,
  fallbackPath: sampleNextRoute.fallbackPath,
  guardrails: {
    costUsd: sampleNextRoute.costUsd,
    playerInitiatedOnly: sampleNextRoute.playerInitiatedOnly,
    noAutomatedExternalPosting: sampleNextRoute.noAutomatedExternalPosting,
    noPaidPromotion: sampleNextRoute.noPaidPromotion,
    noSyntheticEvents: sampleNextRoute.noSyntheticEvents,
    noRevenueEnablement: sampleNextRoute.noRevenueEnablement,
  },
  telemetry: sampleNextRoute.telemetry,
}
const sampleNextRuntimeHref = defaultGateSampleMission
  ? runtimeHref(defaultGateSampleMission.playPath)
  : runtimeHref(sampleNextRoute.fallbackPath)
const sampleNextHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Open the Current Gate Sample | Autonomous Game Lab</title>
    <meta name="robots" content="index,follow">
    <meta name="description" content="An evergreen zero-spend route to the current Autonomous Game Lab product-gate sample mission.">
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a211d; background: #f7f7f2; }
      body { margin: 0; }
      main { display: grid; align-content: center; gap: 18px; min-height: 100svh; width: min(760px, calc(100% - 32px)); margin: 0 auto; padding: 36px 0; }
      h1, p { margin: 0; }
      h1 { font-size: clamp(2.2rem, 7vw, 4.8rem); line-height: 0.96; letter-spacing: 0; max-width: 11ch; }
      p { color: #4f5d55; line-height: 1.55; max-width: 620px; }
      .eyebrow { color: #496858; font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
      .actions { display: flex; flex-wrap: wrap; gap: 10px; }
      a, button { color: #ffffff; background: #1f6b4d; border: 0; border-radius: 6px; padding: 10px 12px; text-decoration: none; font: inherit; font-weight: 800; cursor: pointer; min-height: 42px; }
      .secondary { color: #1f6b4d; background: #e9f2eb; }
      dl { display: grid; gap: 8px; margin: 8px 0 0; padding: 16px; background: #ffffff; border: 1px solid #d6ded2; border-radius: 8px; }
      dl div { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #edf1ea; padding-top: 8px; }
      dl div:first-child { border-top: 0; padding-top: 0; }
      dt { color: #5d6b63; }
      dd { margin: 0; font-weight: 800; text-align: right; overflow-wrap: anywhere; }
      .status { min-height: 1.4rem; color: #496858; font-weight: 800; }
    </style>
  </head>
  <body>
    <main data-sample-next data-campaign-id="${escapeHtml(defaultGateSampleMission?.campaignId ?? '')}" data-gate-id="${escapeHtml(
      defaultGateSampleMission?.gateId ?? '',
    )}" data-game-id="${escapeHtml(defaultGateSampleMission?.gameId ?? '')}" data-target-path="${escapeHtml(
      sampleNextRuntimeHref,
    )}">
      <p class="eyebrow">Zero-spend gate sample route</p>
      <h1>${escapeHtml(defaultGateSampleMission ? defaultGateSampleMission.title : 'Gate sample waiting')}</h1>
      <p>${escapeHtml(
        defaultGateSampleMission
          ? `${defaultGateSampleMission.text} This stable page follows the current product-gate sample target, so old shares keep routing to the evidence the owner loop needs next.`
          : 'The sample route is waiting for a product-gate sample plan.',
      )}</p>
      <div class="actions">
        <a href="${escapeHtml(sampleNextRuntimeHref)}" data-sample-next-link>${escapeHtml(
          defaultGateSampleMission ? 'Start measured run' : 'Open gate missions',
        )}</a>
        <a class="secondary" href="${escapeHtml(runtimeHref(gateSampleKitPath))}">Open gate missions</a>
      </div>
      <dl>
        <div><dt>Campaign</dt><dd>${escapeHtml(defaultGateSampleMission?.campaignId ?? 'waiting')}</dd></div>
        <div><dt>Gate</dt><dd>${escapeHtml(defaultGateSampleMission?.gateId ?? 'waiting')}</dd></div>
        <div><dt>Need</dt><dd>${defaultGateSampleMission?.needed.promptViews ?? 0} views / ${defaultGateSampleMission?.needed.successes ?? 0} wins</dd></div>
        <div><dt>Cost</dt><dd>$0.00</dd></div>
      </dl>
      <p class="status" data-sample-next-status aria-live="polite">Preparing sample route.</p>
    </main>
    <script>
      (() => {
        const route = ${JSON.stringify(sampleNextPublicPayload)}
        const analyticsKey = 'agl.analytics.events'
        const params = new URLSearchParams(window.location.search)
        const previewOnly = params.get('preview') === '1' || params.get('no_redirect') === '1'
        const root = document.querySelector('[data-sample-next]')
        const status = document.querySelector('[data-sample-next-status]')
        const targetPath = root?.dataset.targetPath || './gate-sample.html'
        const campaignId = root?.dataset.campaignId || route.target?.campaignId || null
        const gateId = root?.dataset.gateId || route.target?.gateId || null
        const gameId = root?.dataset.gameId || route.target?.gameId || null
        const readEvents = () => {
          try {
            const raw = window.localStorage.getItem(analyticsKey)
            const events = raw ? JSON.parse(raw) : []
            return Array.isArray(events) ? events : []
          } catch {
            return []
          }
        }
        const createId = (prefix) =>
          window.crypto?.randomUUID
            ? \`\${prefix}-\${window.crypto.randomUUID()}\`
            : \`\${prefix}-\${Date.now()}-\${Math.random().toString(16).slice(2)}\`
        const track = (name, properties = {}) => {
          const event = {
            id: createId('sample-next'),
            name,
            properties: {
              gameId,
              gateId,
              campaignId,
              acquisitionCampaign: campaignId,
              acquisitionSource: 'gate_sample',
              acquisitionChannel: 'product-gate-sample',
              surface: 'sample-next',
              zeroPaidSpend: true,
              noPaidTraffic: true,
              playerInitiated: true,
              automatedExternalPosting: false,
              noSyntheticEvents: true,
              noRevenueEnablement: true,
              ...properties,
            },
            createdAt: new Date().toISOString(),
          }
          window.localStorage.setItem(analyticsKey, JSON.stringify([...readEvents(), event].slice(-300)))
        }

        track('sample_next_viewed', { targetPath, previewOnly })

        document.querySelector('[data-sample-next-link]')?.addEventListener('click', () => {
          track('gate_sample_mission_clicked', {
            targetPath,
            linkType: 'sample-next-link',
            costUsd: 0,
            promptViewsNeeded: route.target?.needed?.promptViews ?? 0,
            observedSuccessesNeeded: route.target?.needed?.successes ?? 0,
          })
        })

        if (!previewOnly && route.target) {
          status.textContent = 'Routing to the current gate sample.'
          window.setTimeout(() => {
            track('sample_next_routed', { targetPath })
            window.location.assign(targetPath)
          }, 350)
        } else {
          status.textContent = route.target ? 'Preview mode. Use the button to open the current gate sample.' : 'No gate sample is armed yet.'
        }
      })()
    </script>
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
  `- /seed-kit.html with ${payload.campaigns.length} zero-spend seed campaign links and player-initiated copy/share controls.`,
  `- /seed-next.html routes evergreen zero-spend traffic to ${seedNextCampaign?.id ?? 'no campaign'} without paid posting.`,
  `- /sample-next.html routes evergreen zero-spend product-gate traffic to ${defaultGateSampleMission?.campaignId ?? 'no mission'} without paid posting.`,
  `- ${payload.sampleDistribution.kitPath} with ${payload.sampleDistribution.missionCount} product-gate sample link(s); default ${payload.sampleDistribution.defaultCampaignId ?? 'none'}.`,
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
await mkdir(path.dirname(seedNextHtmlPath), { recursive: true })
await mkdir(path.dirname(sampleNextHtmlPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const trafficSeeding = ${JSON.stringify(payload, null, 2)} as const\n\nexport type TrafficSeeding = typeof trafficSeeding\n`,
)
await writeFile(shareManifestPath, JSON.stringify(nextShareManifest, null, 2) + '\n')
await writeFile(seedKitPath, seedKitHtml)
await writeFile(seedNextJsonPath, JSON.stringify(seedNextPublicPayload, null, 2) + '\n')
await writeFile(seedNextHtmlPath, seedNextHtml)
await writeFile(sampleNextJsonPath, JSON.stringify(sampleNextPublicPayload, null, 2) + '\n')
await writeFile(sampleNextHtmlPath, sampleNextHtml)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, shareManifestPath)}`)
console.log(`Wrote ${path.relative(root, seedKitPath)}`)
console.log(`Wrote ${path.relative(root, seedNextJsonPath)}`)
console.log(`Wrote ${path.relative(root, seedNextHtmlPath)}`)
console.log(`Wrote ${path.relative(root, sampleNextJsonPath)}`)
console.log(`Wrote ${path.relative(root, sampleNextHtmlPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
