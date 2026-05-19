import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const configPath = path.join(root, 'data', 'game-balance.json')
const outputPath = path.join(root, 'src', 'data', 'gameBalance.ts')

const config = JSON.parse(await readFile(configPath, 'utf8'))
const output = `export const gameBalance = ${JSON.stringify(config, null, 2)} as const\n\nexport type GameBalanceConfig = typeof gameBalance\nexport type GameBalanceId = keyof typeof gameBalance.games\n`

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, output)

console.log(`Wrote ${path.relative(root, outputPath)}`)
