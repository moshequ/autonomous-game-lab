import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const storePackagePath = path.join(dataDir, 'store-package.json')
const outputJsonPath = path.join(dataDir, 'store-listing-optimizer.json')
const outputTsPath = path.join(root, 'src', 'data', 'storeListingOptimizer.ts')
const reportPath = path.join(root, 'reports', 'store-listing-optimizer-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const storePackage = await readJson(storePackagePath)
const storeAssets = await readJson(path.join(dataDir, 'store-assets.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const portfolio = await readJson(path.join(dataDir, 'portfolio-policy.json'))
const acquisition = await readJson(path.join(dataDir, 'acquisition-learning.json'))
const retention = await readJson(path.join(dataDir, 'retention-loop.json'))
const pwaInstall = await readJson(path.join(dataDir, 'pwa-install-loop.json'))
const monetization = await readJson(path.join(dataDir, 'monetization-plan.json'))
const generatedPlayable = await readJson(path.join(dataDir, 'generated-playable-games.json'))
const storeCompliance = await readOptionalJson(path.join(dataDir, 'store-compliance.json'), { status: 'missing' })

const truncate = (value, max) => {
  if (value.length <= max) {
    return value
  }

  const clipped = value.slice(0, max)
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > Math.floor(max * 0.6) ? clipped.slice(0, lastSpace) : clipped).trimEnd()
}
const fitCommaList = (items, max) => {
  const fitted = []

  for (const item of items) {
    const next = [...fitted, item].join(',')
    if (next.length > max) {
      continue
    }
    fitted.push(item)
  }

  return fitted.join(',')
}
const unique = (items) => [...new Set(items.filter(Boolean))]
const titleCase = (value) =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')

const generatedById = new Map((generatedPlayable.games ?? []).map((game) => [game.id, game]))
const portfolioById = new Map((portfolio.games ?? []).map((game) => [game.gameId, game]))
const acquisitionFeaturedId = acquisition.summary?.featuredGameId
const dailyGameId = retention.dailyChallenge?.gameId
const screenshotAssets = storeAssets.screenshots ?? []

const candidateSignals = (growth.gamePages ?? []).map((game) => {
  const portfolioGame = portfolioById.get(game.gameId)
  const generatedGame = generatedById.get(game.gameId)
  const hasScreenshot = screenshotAssets.some((asset) => asset.id.includes(game.gameId))
  const score =
    (game.metrics?.qualityScore ?? 0) +
    (portfolioGame?.score ?? 0) +
    (game.gameId === dailyGameId ? 18 : 0) +
    (game.gameId === acquisitionFeaturedId ? 12 : 0) +
    (hasScreenshot ? 8 : 0) +
    (generatedGame ? 4 : 0)

  return {
    gameId: game.gameId,
    title: game.title,
    status: portfolioGame?.status ?? game.status,
    score: Math.round(score * 1000) / 1000,
    growthQuality: game.metrics?.qualityScore ?? null,
    portfolioScore: portfolioGame?.score ?? null,
    dailyChallenge: game.gameId === dailyGameId,
    acquisitionFeatured: game.gameId === acquisitionFeaturedId,
    generatedRuntime: Boolean(generatedGame),
    hasScreenshot,
    keywords: game.keywords ?? generatedGame?.storeListing?.keywords ?? [],
    shortDescription: game.shortDescription ?? generatedGame?.storeListing?.shortDescription ?? '',
    fullDescription: game.fullDescription ?? generatedGame?.playerPromise ?? '',
  }
})

const focus = [...candidateSignals].sort((a, b) => b.score - a.score)[0]

if (!focus) {
  throw new Error('No growth game pages available for store listing optimization.')
}

const focusGenerated = generatedById.get(focus.gameId)
const topKeywordPool = unique([
  ...(focus.keywords ?? []),
  ...candidateSignals
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .flatMap((game) => game.keywords ?? []),
  'daily puzzle',
  'strategy puzzle',
  'solo board game',
  'mobile game',
])
const keywordBlacklist = new Set(['mobile PWA'])
const optimizedKeywords = topKeywordPool
  .map((keyword) => keyword.trim())
  .filter((keyword) => keyword && !keywordBlacklist.has(keyword))
  .slice(0, 12)
const appleKeywords = fitCommaList(optimizedKeywords, 100)

const screenshotPriorities = screenshotAssets
  .map((asset) => {
    const gameMatch = asset.id.includes(focus.gameId)
    const phone = asset.id.startsWith('phone-')
    const generated = asset.id.includes('generated')
    const playable = asset.id.includes('game') || asset.id.includes(focus.gameId)
    const priorityScore = (gameMatch ? 100 : 0) + (phone ? 20 : 0) + (playable ? 12 : 0) + (generated ? 8 : 0)

    return {
      id: asset.id,
      label: asset.label,
      path: asset.path,
      width: asset.width,
      height: asset.height,
      priorityScore,
      recommendedUse: gameMatch ? 'lead-gameplay' : phone ? 'supporting-phone' : 'press-kit',
    }
  })
  .sort((a, b) => b.priorityScore - a.priorityScore)

const leadScreenshot = screenshotPriorities[0]
const appName = 'Autonomous Game Lab'
const shortDescription = truncate(
  `Original daily strategy puzzles led by ${focus.title}. Quick solo board-game play.`,
  80,
)
const fullDescription = [
  `${appName} is a web-first collection of original board-game-inspired solo strategy puzzles.`,
  `${focus.title} is the current data-led store focus: ${focus.shortDescription}`,
  'Every game is built for short touch-first sessions, clear scoring, daily replay, and measured improvements from anonymous gameplay signals.',
  'Accounts, user-generated content, purchases, gambling, and ads remain disabled until production gates and store review requirements pass.',
].join(' ')
const subtitle = truncate(`${titleCase(focus.gameId)} daily strategy`, 30)
const promotionalText = truncate(`Play ${focus.title}, today\'s data-led solo strategy puzzle.`, 170)

const optimizedListing = {
  source: 'store-listing-optimizer',
  sourceGameId: focus.gameId,
  appName,
  googlePlay: {
    title: appName,
    shortDescription,
    fullDescription,
    keywordThemes: optimizedKeywords,
  },
  appleAppStore: {
    name: appName,
    subtitle,
    promotionalText,
    keywords: appleKeywords,
  },
  shortDescription,
  fullDescription,
  keywords: optimizedKeywords,
  screenshots: [
    'lead gameplay board',
    'daily challenge and streak surface',
    'multi-game portal',
    'generated public game page',
  ],
  screenshotAssets: screenshotPriorities.map((asset) => ({
    id: asset.id,
    label: asset.label,
    path: asset.path,
    width: asset.width,
    height: asset.height,
    platformUse: asset.recommendedUse === 'press-kit' ? ['Web/PWA listing', 'press kit'] : ['Google Play phone', 'Apple iPhone draft'],
  })),
  contentRatingNotes: storePackage.storeListing?.contentRatingNotes ?? [
    'No gambling',
    'No real-money prizes',
    'No user-generated content in first release',
    'Ads disabled until retention gates pass',
  ],
}

const previousLaunchCandidateId = storePackage.launchCandidate?.id ?? null
storePackage.launchCandidate = {
  id: focus.gameId,
  title: focus.title,
  status: focus.status ?? 'generated-playable',
}
storePackage.storeListing = optimizedListing
storePackage.storeListingOptimization = {
  generatedAt: new Date().toISOString(),
  status: 'store-listing-optimizer-ready',
  previousLaunchCandidateId,
  recommendedFocusGameId: focus.gameId,
  leadScreenshotId: leadScreenshot?.id ?? null,
}

const payload = {
  generatedAt: storePackage.storeListingOptimization.generatedAt,
  status: 'store-listing-optimizer-ready',
  sourceStatus: {
    growthPlan: growth.status,
    acquisitionLearning: acquisition.status,
    retentionLoop: retention.status,
    pwaInstallLoop: pwaInstall.status,
    storeAssets: storeAssets.status,
    storeCompliance: storeCompliance.status,
    monetization: monetization.status,
  },
  recommendation: {
    focusGameId: focus.gameId,
    title: focus.title,
    previousLaunchCandidateId,
    changedLaunchCandidate: previousLaunchCandidateId !== focus.gameId,
    rationale: [
      `Growth quality ${focus.growthQuality ?? 'n/a'}`,
      `Portfolio score ${focus.portfolioScore ?? 'n/a'}`,
      focus.dailyChallenge ? 'current daily challenge' : null,
      focus.acquisitionFeatured ? 'current acquisition candidate' : null,
      focus.hasScreenshot ? 'has generated store screenshot' : null,
    ].filter(Boolean),
  },
  candidateSignals: candidateSignals.sort((a, b) => b.score - a.score).slice(0, 6),
  listing: optimizedListing,
  screenshotPriorities,
  copyGuardrails: {
    appNameMaxChars: 30,
    googleShortDescriptionMaxChars: 80,
    appleSubtitleMaxChars: 30,
    appleKeywordsMaxChars: 100,
    noProtectedBoardGameNames: true,
    noUnverifiedAwardsOrRankingClaims: true,
    noMonetizationClaimsBeforeEnabled: true,
    noChildDirectedClaims: true,
  },
  controls: {
    noPaidAsOResearchSpend: true,
    storeSubmissionStillBlocked: true,
    requiresHostedPrivacyBeforeSubmission: storePackage.privacyPolicy?.productionUrlStatus !== 'hosted',
    revenueClaimsAllowed: monetization.revenueEnabled === true,
  },
  nextActions: [
    previousLaunchCandidateId !== focus.gameId
      ? `Use ${focus.title} as the store listing focus instead of ${previousLaunchCandidateId}.`
      : `Keep ${focus.title} as the store listing focus.`,
    `Lead screenshots with ${leadScreenshot?.label ?? 'the top gameplay screenshot'}.`,
    'Regenerate store compliance after every listing, screenshot, monetization, or privacy change.',
  ],
}

const report = [
  '# Store Listing Optimizer',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Focus: ${payload.recommendation.title} (${payload.recommendation.focusGameId})`,
  `Previous candidate: ${payload.recommendation.previousLaunchCandidateId ?? 'none'}`,
  '',
  '## Copy',
  '',
  `- Short description: ${payload.listing.shortDescription}`,
  `- Apple subtitle: ${payload.listing.appleAppStore.subtitle}`,
  `- Keywords: ${payload.listing.keywords.join(', ')}`,
  '',
  '## Screenshot Priorities',
  '',
  ...payload.screenshotPriorities.map(
    (asset) => `- ${asset.id}: ${asset.recommendedUse}, score ${asset.priorityScore}`,
  ),
  '',
  '## Candidate Signals',
  '',
  ...payload.candidateSignals.map(
    (candidate) => `- ${candidate.gameId}: score ${candidate.score}, growth ${candidate.growthQuality ?? 'n/a'}`,
  ),
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.copyGuardrails).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(storePackagePath, JSON.stringify(storePackage, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const storeListingOptimizer = ${JSON.stringify(payload, null, 2)} as const\n\nexport type StoreListingOptimizer = typeof storeListingOptimizer\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Updated ${path.relative(root, storePackagePath)}`)
console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
