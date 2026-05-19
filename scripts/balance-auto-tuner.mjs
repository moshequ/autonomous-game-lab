import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const configPath = path.join(root, 'data', 'game-balance.json')
const balancePath = path.join(root, 'data', 'balance-report.json')
const generatedPlayablePath = path.join(root, 'data', 'generated-playable-games.json')
const generatedPlayableTsPath = path.join(root, 'src', 'data', 'generatedPlayableGames.ts')
const reportPath = path.join(root, 'reports', 'balance-auto-tuner-latest.md')

const config = JSON.parse(await readFile(configPath, 'utf8'))
const balance = JSON.parse(await readFile(balancePath, 'utf8'))
const loadOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)
const changes = []

for (const gameReport of balance.games ?? []) {
  const gameConfig = config.games[gameReport.gameId]

  if (!gameConfig) {
    continue
  }

  const random = gameReport.strategies.find((strategy) => strategy.strategy === 'random')
  const greedy = gameReport.strategies.find((strategy) => strategy.strategy === 'greedy')
  const tuning = gameConfig.tuning
  const before = gameConfig.targetScore
  let after = before
  let reason = ''

  if (random?.winRate > 0.6) {
    const minimumIncrease = before + tuning.targetStep
    const percentileTarget = random.winRate > 0.9 ? random.p90 : random.p50
    after = Math.min(tuning.maxTargetScore, Math.max(minimumIncrease, percentileTarget))
    reason = `random bot win rate ${Math.round(random.winRate * 100)}% is too high`
  } else if (greedy?.winRate < 0.45) {
    const maximumDecrease = before - tuning.targetStep
    const percentileTarget = greedy.winRate < 0.2 ? greedy.p10 : greedy.p50
    after = Math.max(tuning.minTargetScore, Math.min(maximumDecrease, percentileTarget))
    reason = `greedy bot win rate ${Math.round(greedy.winRate * 100)}% is too low`
  }

  if (after !== before) {
    gameConfig.targetScore = after
    changes.push({
      gameId: gameReport.gameId,
      title: gameReport.title,
      before,
      after,
      reason,
    })
  }
}

const generatedPlayable = await loadOptionalJson(generatedPlayablePath, null)
const generatedSyncChanges = []

if (generatedPlayable?.games?.length) {
  for (const game of generatedPlayable.games) {
    const tunedTarget = config.games?.[game.id]?.targetScore

    if (typeof tunedTarget === 'number' && game.targetScore !== tunedTarget) {
      generatedSyncChanges.push({
        gameId: game.id,
        title: game.title,
        before: game.targetScore,
        after: tunedTarget,
      })
      game.targetScore = tunedTarget
      game.tutorial = game.tutorial.replace(/beat \d+/, `beat ${tunedTarget}`)
    }
  }
}

const report = [
  '# Balance Auto-Tuner Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  changes.length ? '## Applied Changes' : '## Applied Changes',
  '',
  ...(changes.length
    ? changes.map(
        (change) =>
          `- ${change.title}: target ${change.before} -> ${change.after}; ${change.reason}.`,
      )
    : ['- No safe tuning changes needed.']),
  '',
  '## Generated Runtime Sync',
  '',
  ...(generatedSyncChanges.length
    ? generatedSyncChanges.map(
        (change) => `- ${change.title}: generated target ${change.before} -> ${change.after}.`,
      )
    : ['- Generated runtime targets already match tuned balance config.']),
  '',
]

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(configPath, JSON.stringify(config, null, 2) + '\n')
if (generatedPlayable) {
  generatedPlayable.generatedAt = new Date().toISOString()
  await writeFile(generatedPlayablePath, JSON.stringify(generatedPlayable, null, 2) + '\n')
  await writeFile(
    generatedPlayableTsPath,
    `export const generatedPlayableGames = ${JSON.stringify(generatedPlayable.games, null, 2)} as const\n\nexport type GeneratedPlayableGame = (typeof generatedPlayableGames)[number]\n`,
  )
}
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, configPath)}`)
if (generatedPlayable) {
  console.log(`Wrote ${path.relative(root, generatedPlayablePath)}`)
  console.log(`Wrote ${path.relative(root, generatedPlayableTsPath)}`)
}
console.log(`Wrote ${path.relative(root, reportPath)}`)
