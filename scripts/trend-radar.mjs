import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { XMLParser } from 'fast-xml-parser'

const root = process.cwd()
const fixturePath = path.join(root, 'data', 'trend-fixtures.json')
const taxonomyPath = path.join(root, 'data', 'trend-taxonomy.json')
const cachePath = path.join(root, 'data', 'trend-cache.json')
const outputPath = path.join(root, 'data', 'trend-signals.json')
const reportPath = path.join(root, 'reports', 'trend-radar-latest.md')
const sourceReadinessPath = path.join(root, 'data', 'trend-source-readiness.json')
const sourceReadinessReportPath = path.join(root, 'reports', 'trend-source-readiness-latest.md')

const bggHotUrl = 'https://boardgamegeek.com/xmlapi2/hot?type=boardgame'
const bggPolicyUrl = 'https://boardgamegeek.com/using_the_xml_api'
const cacheMaxAgeDays = Number(process.env.AGL_TREND_CACHE_MAX_AGE_DAYS ?? 30)

const loadJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const loadOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const normalize = (value) => String(value ?? '').toLowerCase()
const tokenize = (value) =>
  normalize(value)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

const scoreKeywordMatches = (keywords, haystack) =>
  keywords.reduce((score, keyword) => (haystack.includes(normalize(keyword)) ? score + 1 : score), 0)

const fetchBggHot = async () => {
  const token = process.env.BGG_XML_API_TOKEN

  if (!token) {
    return {
      ok: false,
      reason: 'BGG_XML_API_TOKEN is not set; using fixture trends.',
      items: [],
    }
  }

  const response = await fetch(bggHotUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'AutonomousGameLab/0.1',
      Accept: 'application/xml',
    },
  })

  if (!response.ok) {
    return {
      ok: false,
      reason: `BGG hotness returned ${response.status}; using fixture trends.`,
      items: [],
    }
  }

  const xml = await response.text()
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  })
  const parsed = parser.parse(xml)
  const rawItems = Array.isArray(parsed.items?.item) ? parsed.items.item : []

  return {
    ok: true,
    reason: 'Fetched BGG hotness with bearer token.',
    items: rawItems.slice(0, 20).map((item) => ({
      source: 'bgg-hotness',
      rank: Number(item.rank ?? 999),
      title: item.name?.value ?? item.name ?? 'Unknown board game',
      year: Number(item.yearpublished?.value ?? item.yearpublished ?? 0) || null,
      mechanics: [],
      themes: [],
      audience: [],
    })),
  }
}

const daysSince = (isoDate) => {
  if (!isoDate) {
    return null
  }

  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return Math.max(0, Math.round((Date.now() - date.getTime()) / 86_400_000))
}

const cacheStatusFor = (cache) => {
  const ageDays = daysSince(cache.fetchedAt)
  const hasItems = Array.isArray(cache.items) && cache.items.length > 0

  if (!hasItems) {
    return {
      status: 'empty',
      ageDays,
      usable: false,
      reason: 'No licensed BGG hotness cache has been created yet.',
    }
  }

  if (typeof ageDays === 'number' && ageDays <= cacheMaxAgeDays) {
    return {
      status: 'fresh',
      ageDays,
      usable: true,
      reason: `Using licensed BGG cache from ${cache.fetchedAt}; age ${ageDays} day(s).`,
    }
  }

  return {
    status: 'stale',
    ageDays,
    usable: false,
    reason: `Licensed BGG cache is older than ${cacheMaxAgeDays} day(s).`,
  }
}

const enrichItems = (items, taxonomy) =>
  items.map((item) => {
    const fields = [item.title, item.mechanics, item.themes, item.audience].flat().join(' ')
    const haystack = normalize(fields)

    const mechanics = taxonomy.mechanics
      .map((mechanic) => ({
        name: mechanic.name,
        score:
          scoreKeywordMatches(mechanic.keywords, haystack) * 12 +
          (item.mechanics?.includes(mechanic.name) ? 30 : 0) +
          Math.max(0, 20 - item.rank),
        mobileFit: mechanic.mobileFit,
        template: mechanic.template,
      }))
      .filter((mechanic) => mechanic.score > 0)
      .sort((a, b) => b.score - a.score)

    const themes = taxonomy.themes
      .map((theme) => ({
        name: theme.name,
        score:
          scoreKeywordMatches(theme.keywords, haystack) * 12 +
          (item.themes?.some((itemTheme) => normalize(itemTheme).includes(theme.name)) ? 20 : 0) +
          Math.max(0, 12 - item.rank),
        adSafety: theme.adSafety,
      }))
      .filter((theme) => theme.score > 0)
      .sort((a, b) => b.score - a.score)

    const audiences = taxonomy.audiences
      .map((audience) => ({
        name: audience.name,
        score:
          scoreKeywordMatches(audience.keywords, haystack) * 10 +
          (item.audience?.includes(audience.name) ? 20 : 0) +
          Math.max(0, 8 - item.rank),
        sessionMinutes: audience.sessionMinutes,
      }))
      .filter((audience) => audience.score > 0)
      .sort((a, b) => b.score - a.score)

    return {
      ...item,
      tokens: tokenize(fields).slice(0, 20),
      inferred: {
        mechanics: mechanics.slice(0, 3),
        themes: themes.slice(0, 2),
        audiences: audiences.slice(0, 2),
      },
    }
  })

const aggregate = (items, fieldName) => {
  const scores = new Map()

  for (const item of items) {
    for (const signal of item.inferred[fieldName]) {
      const previous = scores.get(signal.name) ?? {
        ...signal,
        score: 0,
        mentions: 0,
        sourceRanks: [],
      }

      previous.score += signal.score
      previous.mentions += 1
      previous.sourceRanks.push(item.rank)
      scores.set(signal.name, previous)
    }
  }

  return [...scores.values()]
    .map((signal) => ({
      ...signal,
      score: Math.round(signal.score),
      averageRank: Math.round(
        signal.sourceRanks.reduce((sum, rank) => sum + rank, 0) / signal.sourceRanks.length,
      ),
    }))
    .sort((a, b) => b.score - a.score)
}

const taxonomy = await loadJson(taxonomyPath)
const fixtureItems = await loadJson(fixturePath)
const previousCache = await loadOptionalJson(cachePath, {
  status: 'empty',
  source: 'bgg-hotness',
  fetchedAt: null,
  checkedAt: null,
  items: [],
})
const remote = await fetchBggHot().catch((error) => ({
  ok: false,
  reason: `BGG fetch failed: ${error.message}; using fixture trends.`,
  items: [],
}))

const cache =
  remote.ok && remote.items.length > 0
    ? {
        status: 'fresh',
        source: 'bgg-hotness',
        fetchedAt: new Date().toISOString(),
        checkedAt: new Date().toISOString(),
        items: remote.items,
        lastError: null,
      }
    : {
        ...previousCache,
        checkedAt: new Date().toISOString(),
        status: cacheStatusFor(previousCache).status,
        lastError: remote.reason,
      }
const cacheStatus = cacheStatusFor(cache)
const activeSource =
  remote.ok && remote.items.length > 0 ? 'bgg-hotness-live' : cacheStatus.usable ? 'bgg-hotness-cache' : 'fixture'
const sourceItems = activeSource === 'bgg-hotness-live' ? remote.items : activeSource === 'bgg-hotness-cache' ? cache.items : fixtureItems
const enrichedItems = enrichItems(sourceItems, taxonomy)

const signals = {
  mechanics: aggregate(enrichedItems, 'mechanics'),
  themes: aggregate(enrichedItems, 'themes'),
  audiences: aggregate(enrichedItems, 'audiences'),
}

const trendPayload = {
  generatedAt: new Date().toISOString(),
  sourceStatus: {
    bggHotness: remote,
    cache: {
      status: cacheStatus.status,
      usable: cacheStatus.usable,
      ageDays: cacheStatus.ageDays,
      maxAgeDays: cacheMaxAgeDays,
      fetchedAt: cache.fetchedAt,
      reason: cacheStatus.reason,
    },
    activeSource,
    note:
      'BGG XML API requires registration and bearer authorization. Use BGG_XML_API_TOKEN to activate licensed live BGG hotness.',
  },
  items: enrichedItems,
  signals,
}

const sourceReadiness = {
  generatedAt: trendPayload.generatedAt,
  status:
    activeSource === 'bgg-hotness-live'
      ? 'live-licensed'
      : activeSource === 'bgg-hotness-cache'
        ? 'cached-licensed'
        : 'fixture-safe',
  activeSource,
  bggHotness: {
    configured: Boolean(process.env.BGG_XML_API_TOKEN),
    ok: remote.ok,
    reason: remote.reason,
    endpoint: bggHotUrl,
    tokenEnv: 'BGG_XML_API_TOKEN',
    authorizationRequired: true,
  },
  cache: trendPayload.sourceStatus.cache,
  fixture: {
    items: fixtureItems.length,
    purpose: 'Safe deterministic fallback for development, tests, and no-token operation.',
  },
  policy: {
    officialUrl: bggPolicyUrl,
    stance: 'Do not scrape private BGG endpoints. Use registered XML API access, cached licensed results, or local fixtures.',
  },
  downstream: {
    conceptGenerator: 'Consumes trend-signals.json regardless of source.',
    gameFactory: 'Builds original games from aggregated mechanic/theme signals, not copied source expression.',
  },
}

const reportLines = [
  '# Trend Radar Report',
  '',
  `Generated: ${trendPayload.generatedAt}`,
  '',
  `Active source: ${trendPayload.sourceStatus.activeSource}`,
  `Source note: ${trendPayload.sourceStatus.bggHotness.reason}`,
  `Cache: ${trendPayload.sourceStatus.cache.status}; usable ${trendPayload.sourceStatus.cache.usable}`,
  '',
  '## Top Mechanics',
  '',
  ...signals.mechanics
    .slice(0, 5)
    .map(
      (signal, index) =>
        `${index + 1}. ${signal.name} - score ${signal.score}, mobile fit ${signal.mobileFit}, template ${signal.template}`,
    ),
  '',
  '## Top Themes',
  '',
  ...signals.themes
    .slice(0, 5)
    .map(
      (signal, index) =>
        `${index + 1}. ${signal.name} - score ${signal.score}, ad safety ${signal.adSafety}`,
    ),
  '',
  '## Sample Items',
  '',
  ...enrichedItems
    .slice(0, 6)
    .map(
      (item) =>
        `- #${item.rank} ${item.title}: ${item.inferred.mechanics.map((signal) => signal.name).join(', ') || 'no mechanic inferred'}`,
    ),
  '',
]

const sourceReadinessReport = [
  '# Trend Source Readiness',
  '',
  `Generated: ${sourceReadiness.generatedAt}`,
  `Status: ${sourceReadiness.status}`,
  `Active source: ${sourceReadiness.activeSource}`,
  '',
  '## BGG Hotness',
  '',
  `- Configured: ${sourceReadiness.bggHotness.configured}`,
  `- Authorized fetch ok: ${sourceReadiness.bggHotness.ok}`,
  `- Reason: ${sourceReadiness.bggHotness.reason}`,
  `- Policy: ${sourceReadiness.policy.officialUrl}`,
  '',
  '## Cache',
  '',
  `- Status: ${sourceReadiness.cache.status}`,
  `- Usable: ${sourceReadiness.cache.usable}`,
  `- Age days: ${sourceReadiness.cache.ageDays ?? 'none'}`,
  `- Max age days: ${sourceReadiness.cache.maxAgeDays}`,
  '',
  '## Fallback',
  '',
  `- Fixture rows: ${sourceReadiness.fixture.items}`,
  `- Stance: ${sourceReadiness.policy.stance}`,
  '',
]

await mkdir(path.dirname(outputPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(cachePath, JSON.stringify(cache, null, 2) + '\n')
await writeFile(outputPath, JSON.stringify(trendPayload, null, 2))
await writeFile(reportPath, reportLines.join('\n'))
await writeFile(sourceReadinessPath, JSON.stringify(sourceReadiness, null, 2) + '\n')
await writeFile(sourceReadinessReportPath, sourceReadinessReport.join('\n'))

console.log(`Wrote ${path.relative(root, cachePath)}`)
console.log(`Wrote ${path.relative(root, outputPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, sourceReadinessPath)}`)
console.log(`Wrote ${path.relative(root, sourceReadinessReportPath)}`)
