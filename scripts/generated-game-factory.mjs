import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const trendPath = path.join(root, 'data', 'trend-signals.json')
const conceptsPath = path.join(root, 'data', 'generated-concepts.json')
const balancePath = path.join(root, 'data', 'game-balance.json')
const playablePath = path.join(root, 'data', 'playable-games.json')
const outputJsonPath = path.join(root, 'data', 'generated-playable-games.json')
const outputTsPath = path.join(root, 'src', 'data', 'generatedPlayableGames.ts')
const reportPath = path.join(root, 'reports', 'generated-playable-games-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const palettes = [
  [
    { id: 'sprout', label: 'Sprout', fill: '#187f7a' },
    { id: 'ember', label: 'Ember', fill: '#bd4d38' },
    { id: 'sun', label: 'Sun', fill: '#b87b16' },
    { id: 'violet', label: 'Violet', fill: '#6b5bb8' },
  ],
  [
    { id: 'station', label: 'Station', fill: '#2a7187' },
    { id: 'signal', label: 'Signal', fill: '#c2543d' },
    { id: 'loop', label: 'Loop', fill: '#c58a16' },
    { id: 'spur', label: 'Spur', fill: '#4d6f3a' },
  ],
  [
    { id: 'stall', label: 'Stall', fill: '#8f5f2c' },
    { id: 'permit', label: 'Permit', fill: '#2f7d5e' },
    { id: 'clock', label: 'Clock', fill: '#7b65b8' },
    { id: 'cart', label: 'Cart', fill: '#b85b4b' },
  ],
  [
    { id: 'scout', label: 'Scout', fill: '#50658f' },
    { id: 'camp', label: 'Camp', fill: '#c1822c' },
    { id: 'path', label: 'Path', fill: '#2e8176' },
    { id: 'cache', label: 'Cache', fill: '#9a4f65' },
  ],
]

const titlePresets = {
  'roll and write': 'Canopy Bloom',
  'route building': 'Metro Loom',
  auction: 'Market Pulse',
  'worker placement': 'Guild Garden',
  'engine building': 'Grove Engine',
  'card drafting': 'Pocket Draft',
  'tile placement': 'Mosaic Haven',
}

const themeForTemplate = {
  'daily-sheet': 'science desk',
  'line-drawing': 'compact city logistics',
  'turn-economy': 'merchant timing',
  tableau: 'expedition planning',
  'grid-puzzle': 'cozy production',
}

const scoringForTemplate = {
  'daily-sheet': {
    boardRows: 4,
    boardCols: 5,
    base: 3,
    sameNeighbor: 4,
    occupiedNeighbor: 2,
    rowDiversity: 6,
    columnDiversity: 4,
    center: 3,
    corner: 2,
    targetPerMove: 8.2,
  },
  'line-drawing': {
    boardRows: 5,
    boardCols: 5,
    base: 2,
    sameNeighbor: 3,
    occupiedNeighbor: 5,
    rowDiversity: 3,
    columnDiversity: 7,
    center: 2,
    corner: 1,
    targetPerMove: 8.8,
  },
  'turn-economy': {
    boardRows: 4,
    boardCols: 4,
    base: 4,
    sameNeighbor: 5,
    occupiedNeighbor: 3,
    rowDiversity: 5,
    columnDiversity: 5,
    center: 4,
    corner: 3,
    targetPerMove: 9.4,
  },
  tableau: {
    boardRows: 3,
    boardCols: 5,
    base: 4,
    sameNeighbor: 6,
    occupiedNeighbor: 1,
    rowDiversity: 7,
    columnDiversity: 3,
    center: 2,
    corner: 2,
    targetPerMove: 8.6,
  },
  'grid-puzzle': {
    boardRows: 4,
    boardCols: 4,
    base: 3,
    sameNeighbor: 5,
    occupiedNeighbor: 3,
    rowDiversity: 5,
    columnDiversity: 5,
    center: 3,
    corner: 2,
    targetPerMove: 8.4,
  },
}

const trend = await readJson(trendPath)
const concepts = await readJson(conceptsPath)
const balance = await readJson(balancePath)
const playable = await readJson(playablePath)
const previousGenerated = await readOptionalJson(outputJsonPath, { games: [] })

const mechanicByName = new Map((trend.signals?.mechanics ?? []).map((mechanic) => [mechanic.name, mechanic]))
const themeByName = new Map((trend.signals?.themes ?? []).map((theme) => [theme.name, theme]))
const audienceByName = new Map((trend.signals?.audiences ?? []).map((audience) => [audience.name, audience]))
const acceptedConcepts = (concepts.concepts ?? [])
  .filter((concept) => concept.status === 'candidate')
  .sort((a, b) => b.opportunity.score - a.opportunity.score)
const selectedSeeds = []
const selectedNames = new Set()
const portfolioSize = Math.max(5, Math.min(8, acceptedConcepts.length + 1))

const mechanicFromConcept = (concept) => {
  const mechanic = mechanicByName.get(concept.opportunity.mechanic)

  return {
    name: concept.opportunity.mechanic,
    score: concept.opportunity.score,
    mobileFit: mechanic?.mobileFit ?? 78,
    template: concept.gameBrief?.firstPrototypeTemplate ?? mechanic?.template ?? 'grid-puzzle',
  }
}

for (const concept of acceptedConcepts) {
  const mechanic = mechanicFromConcept(concept)

  if (!selectedNames.has(mechanic.name)) {
    selectedSeeds.push({
      mechanic,
      concept,
      themeName: concept.opportunity.theme,
      audienceName: concept.opportunity.audience,
    })
    selectedNames.add(mechanic.name)
  }
}

for (const mechanic of trend.signals?.mechanics ?? []) {
  if (selectedSeeds.length >= portfolioSize) {
    break
  }

  if (!selectedNames.has(mechanic.name)) {
    selectedSeeds.push({ mechanic, concept: null, themeName: null, audienceName: null })
    selectedNames.add(mechanic.name)
  }
}

const conceptTemplateCounts = acceptedConcepts.reduce((counts, concept) => {
  const template = concept.gameBrief?.firstPrototypeTemplate
  counts[template] = (counts[template] ?? 0) + 1
  return counts
}, {})

const previousGeneratedIds = new Set((previousGenerated.games ?? []).map((game) => game.id))

const generatedGames = selectedSeeds.slice(0, portfolioSize).map(({ mechanic, concept, themeName: seedThemeName, audienceName }, index) => {
  const template = mechanic.template ?? 'grid-puzzle'
  const scoringBlueprint = scoringForTemplate[template] ?? scoringForTemplate['grid-puzzle']
  const themeName = seedThemeName ?? themeForTemplate[template] ?? trend.signals?.themes?.[index]?.name ?? 'cozy production'
  const theme = themeByName.get(themeName) ?? trend.signals?.themes?.[index] ?? trend.signals?.themes?.[0]
  const preferredAudience =
    audienceName ??
    (template === 'daily-sheet' || template === 'line-drawing'
      ? 'mobile puzzle'
      : index === 2
        ? 'strategy solo'
        : 'families')
  const audience =
    audienceByName.get(preferredAudience) ??
    trend.signals?.audiences?.[index] ??
    trend.signals?.audiences?.[0]
  const title = titlePresets[mechanic.name] ?? `${theme?.name?.split(' ')?.[0] ?? 'Pocket'} ${mechanic.name.split(' ')[0]}`
  const id = slugify(title)
  const sessionMinutes = concept?.gameBrief?.sessionLengthMinutes ?? audience?.sessionMinutes ?? 6
  const maxMoves = sessionMinutes <= 5 ? 10 : sessionMinutes <= 7 ? 11 : 12
  const existingBalance = balance.games[id]
  const targetScore = existingBalance?.targetScore ?? Math.round(maxMoves * scoringBlueprint.targetPerMove)
  const pieces = palettes[index % palettes.length]
  const scoring = {
    base: scoringBlueprint.base,
    sameNeighbor: scoringBlueprint.sameNeighbor,
    occupiedNeighbor: scoringBlueprint.occupiedNeighbor,
    rowDiversity: scoringBlueprint.rowDiversity,
    columnDiversity: scoringBlueprint.columnDiversity,
    center: scoringBlueprint.center,
    corner: scoringBlueprint.corner,
  }

  return {
    id,
    title,
    status: 'generated-playable',
    source: {
      mechanic: mechanic.name,
      theme: theme?.name ?? themeName,
      audience: audience?.name ?? 'mobile puzzle',
      generatedFrom: concept ? ['trend-signals', 'generated-concepts'] : ['trend-signals'],
      trendScore: mechanic.score,
      conceptId: concept?.id ?? null,
      conceptTitle: concept?.title ?? null,
      conceptScore: concept?.opportunity?.score ?? null,
      representedPrototypeTemplates: conceptTemplateCounts[template] ?? 0,
    },
    sourceDistance: {
      copiedExpressionRisk: 'low',
      ruleText: 'generated from local scoring template only; no source rule text used',
      art: 'procedural board colors and layout; no source art used',
    },
    boardRows: scoringBlueprint.boardRows,
    boardCols: scoringBlueprint.boardCols,
    maxMoves,
    targetScore,
    pieces,
    tutorial: `Mark one cell per turn. Build ${mechanic.name} combos across ${theme?.name ?? themeName} to beat ${targetScore}.`,
    playerPromise:
      concept?.gameBrief?.playerPromise ??
      `A generated ${mechanic.name} puzzle that turns trend signals into a compact solo board state.`,
    scoring,
    storeListing: {
      shortDescription: `A generated ${mechanic.name} puzzle with quick ${theme?.name ?? themeName} decisions.`,
      keywords: [
        mechanic.name,
        theme?.name ?? themeName,
        'daily puzzle',
        'solo board game',
        'generated strategy game',
      ],
    },
  }
})

for (const generatedGame of generatedGames) {
  balance.games[generatedGame.id] = {
    id: generatedGame.id,
    title: generatedGame.title,
    boardRows: generatedGame.boardRows,
    boardCols: generatedGame.boardCols,
    maxMoves: generatedGame.maxMoves,
    targetScore: generatedGame.targetScore,
    pieces: generatedGame.pieces.map((piece) => piece.id),
    generated: true,
    scoring: generatedGame.scoring,
    tuning: {
      minTargetScore: Math.max(35, generatedGame.targetScore - 36),
      maxTargetScore: generatedGame.targetScore + 48,
      targetStep: 6,
    },
  }
}

const generatedGameIds = new Set(generatedGames.map((game) => game.id))

for (const previousId of previousGeneratedIds) {
  if (!generatedGameIds.has(previousId) && balance.games[previousId]?.generated) {
    delete balance.games[previousId]
  }
}

const playableGames = new Set((playable.games ?? []).filter((gameId) => !previousGeneratedIds.has(gameId)))
for (const generatedGame of generatedGames) {
  playableGames.add(generatedGame.id)
}
playable.games = [...playableGames]

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'generated-runtime-ready',
  games: generatedGames,
  runtime: {
    scene: 'GeneratedPuzzleScene',
    codeHandoffRequired: false,
    selectionStrategy: 'accepted-concepts-first-then-trend-signals',
    generatedConceptCoverage: acceptedConcepts.filter((concept) =>
      generatedGames.some((game) => game.source.conceptId === concept.id),
    ).length,
    telemetry: ['game_started', 'tutorial_completed', 'turn_taken', 'level_completed', 'replay_clicked'],
  },
}

const report = [
  '# Generated Playable Games',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  '',
  '## Runtime Games',
  '',
  ...payload.games.map(
    (game) =>
      `- ${game.title}: ${game.source.mechanic}, ${game.source.theme}, target ${game.targetScore}, IP risk ${game.sourceDistance.copiedExpressionRisk}`,
  ),
  '',
  '## Autonomy',
  '',
  `- Runtime scene: ${payload.runtime.scene}`,
  `- Code handoff required: ${payload.runtime.codeHandoffRequired}`,
  `- Selection strategy: ${payload.runtime.selectionStrategy}`,
  `- Generated concept coverage: ${payload.runtime.generatedConceptCoverage}/${acceptedConcepts.length}`,
  `- Registered playable ids: ${playable.games.join(', ')}`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const generatedPlayableGames = ${JSON.stringify(payload.games, null, 2)} as const\n\nexport type GeneratedPlayableGame = (typeof generatedPlayableGames)[number]\n`,
)
await writeFile(balancePath, JSON.stringify(balance, null, 2) + '\n')
await writeFile(playablePath, JSON.stringify(playable, null, 2) + '\n')
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, balancePath)}`)
console.log(`Wrote ${path.relative(root, playablePath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
