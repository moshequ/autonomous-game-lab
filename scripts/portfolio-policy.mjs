import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const reportPath = path.join(root, 'reports', 'portfolio-policy-latest.md')
const outputJsonPath = path.join(dataDir, 'portfolio-policy.json')
const outputTsPath = path.join(root, 'src', 'data', 'portfolioPolicy.ts')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const titleCase = (value) =>
  String(value)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const round = (value) => Math.round(value * 1000) / 1000

const scoreFromMetrics = (metrics = {}) => {
  const startRate = typeof metrics.startRate === 'number' ? metrics.startRate : 0.45
  const completion = typeof metrics.firstGameCompletion === 'number' ? metrics.firstGameCompletion : 0.32
  const replay = typeof metrics.replayRate === 'number' ? metrics.replayRate : 0.18

  return round(startRate * 38 + completion * 34 + replay * 28)
}

const dateSeed = (gameId, isoDate) => {
  let hash = 0

  for (const char of `${isoDate}:${gameId}`) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973
  }

  return `daily-${isoDate.replaceAll('-', '')}-${hash.toString(36)}`
}

const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const generatedPlayable = await readJson(path.join(dataDir, 'generated-playable-games.json'))
const pipeline = await readJson(path.join(dataDir, 'prototype-pipeline.json'))
const balance = await readJson(path.join(dataDir, 'balance-report.json'))
const backlog = await readOptionalJson(path.join(dataDir, 'improvement-backlog.json'), [])
const releaseHealth = await readOptionalJson(path.join(dataDir, 'release-health.json'), { status: 'missing' })
const unitEconomics = await readOptionalJson(path.join(dataDir, 'unit-economics.json'), {
  controls: { paidAcquisitionAllowed: false },
})

const generatedById = new Map((generatedPlayable.games ?? []).map((game) => [game.id, game]))
const prototypeById = new Map((pipeline.prototypes ?? []).map((prototype) => [prototype.id, prototype]))
const balanceById = new Map((balance.games ?? []).map((game) => [game.gameId, game]))
const analyticsById = new Map((analytics.games ?? []).map((game) => [game.gameId, game]))
const growthById = new Map((growth.gamePages ?? []).map((game) => [game.gameId, game]))
const backlogByGame = new Map()

for (const item of backlog) {
  if (!item.gameId) {
    continue
  }

  if (!backlogByGame.has(item.gameId)) {
    backlogByGame.set(item.gameId, [])
  }

  backlogByGame.get(item.gameId).push(item)
}

const today = new Date().toISOString().slice(0, 10)
const playableIds = playable.games ?? []
const analyticsSource = analytics.sourceStatus?.activeSource ?? 'unknown'
const hasLiveAnalytics = ['posthog', 'local-event-drops'].includes(analyticsSource)

const games = playableIds
  .map((gameId) => {
    const generated = generatedById.get(gameId)
    const prototype = prototypeById.get(gameId)
    const balanceGame = balanceById.get(gameId)
    const analyticsGame = analyticsById.get(gameId)
    const growthPage = growthById.get(gameId)
    const backlogItems = backlogByGame.get(gameId) ?? []
    const metricsScore = scoreFromMetrics(analyticsGame?.metrics)
    const growthScore = growthPage?.metrics?.qualityScore ?? 50
    const backlogPenalty = Math.min(14, backlogItems.length * 4)
    const dataConfidence = analyticsGame ? (hasLiveAnalytics ? 'live' : 'fixture') : 'seed-needed'
    const score = round(metricsScore * 0.58 + growthScore * 0.42 - backlogPenalty)

    let action = 'observe'

    if (!analyticsGame) {
      action = 'seed-traffic'
    } else if (backlogItems.length) {
      action = 'improve'
    } else if (score >= 55) {
      action = 'feature'
    }

    return {
      gameId,
      title: prototype?.title ?? generated?.title ?? balanceGame?.title ?? growthPage?.title ?? titleCase(gameId),
      status: prototype?.status ?? generated?.status ?? (gameId === 'harbor-rings' ? 'live' : 'playable'),
      score,
      action,
      dataConfidence,
      source: {
        analytics: analyticsGame ? analyticsSource : 'no-game-row-yet',
        growth: growthPage ? growth.status : 'missing-growth-page',
        generatedRuntime: Boolean(generated),
      },
      metrics: {
        views: analyticsGame?.counts?.game_viewed ?? 0,
        starts: analyticsGame?.counts?.game_started ?? 0,
        startRate: analyticsGame?.metrics?.startRate ?? null,
        firstGameCompletion: analyticsGame?.metrics?.firstGameCompletion ?? null,
        replayRate: analyticsGame?.metrics?.replayRate ?? null,
        growthQuality: growthPage?.metrics?.qualityScore ?? null,
      },
      backlog: backlogItems.map((item) => ({
        title: item.title,
        confidence: item.confidence,
        experiment: item.experiment,
      })),
      recommendation:
        action === 'seed-traffic'
          ? 'Give this playable game organic/internal traffic before judging it.'
          : action === 'improve'
            ? `Prioritize ${backlogItems[0]?.title ?? 'the top backlog item'} before featuring harder.`
            : action === 'feature'
              ? 'Feature in the portal rotation and daily challenge.'
              : 'Keep in rotation and watch the next cohort.',
    }
  })
  .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
  .map((game, index) => ({ ...game, rank: index + 1 }))

const heroGame = games.find((game) => game.action === 'feature') ?? games[0]
const seedTrafficGames = games.filter((game) => game.action === 'seed-traffic').slice(0, 4)
const improvementGames = games.filter((game) => game.action === 'improve').slice(0, 4)
const orderedGameIds = [
  heroGame?.gameId,
  ...seedTrafficGames.map((game) => game.gameId),
  ...improvementGames.map((game) => game.gameId),
  ...games.map((game) => game.gameId),
].filter((gameId, index, list) => gameId && list.indexOf(gameId) === index)

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'portfolio-policy-ready',
  analyticsSource,
  releaseHealthStatus: releaseHealth.status,
  guardrails: {
    minPlayableGames: 10,
    noRetireWithoutLiveData: true,
    noPaidPromotion: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    preserveIpGuardrails: true,
  },
  dailyChallenge: {
    date: today,
    gameId: heroGame?.gameId ?? playableIds[0],
    title: heroGame?.title ?? titleCase(playableIds[0]),
    seed: dateSeed(heroGame?.gameId ?? playableIds[0], today),
    reason: heroGame
      ? `${heroGame.title} has the strongest blended portfolio score (${heroGame.score}).`
      : 'Fallback to first playable game.',
  },
  rotation: {
    heroGameId: heroGame?.gameId ?? playableIds[0],
    orderedGameIds,
    seedTrafficGameIds: seedTrafficGames.map((game) => game.gameId),
    improvementGameIds: improvementGames.map((game) => game.gameId),
    heldForMoreDataGameIds: games
      .filter((game) => game.dataConfidence === 'seed-needed')
      .map((game) => game.gameId),
  },
  games,
  nextActions: [
    ...(seedTrafficGames.length
      ? [`Seed traffic to ${seedTrafficGames.map((game) => game.title).join(', ')} before judging quality.`]
      : []),
    ...(improvementGames.length
      ? [`Apply backlog improvements for ${improvementGames.map((game) => game.title).join(', ')}.`]
      : []),
    'Keep paid promotion disabled until unit-economics gates pass.',
  ],
}

const report = [
  '# Portfolio Policy',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.analyticsSource}`,
  `Daily challenge: ${payload.dailyChallenge.title} (${payload.dailyChallenge.seed})`,
  '',
  '## Rotation',
  '',
  ...payload.games
    .slice(0, 10)
    .map(
      (game) =>
        `- #${game.rank} ${game.title}: ${game.action}, score ${game.score}, data ${game.dataConfidence}`,
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
  `export const portfolioPolicy = ${JSON.stringify(payload, null, 2)} as const\n\nexport type PortfolioPolicy = typeof portfolioPolicy\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
