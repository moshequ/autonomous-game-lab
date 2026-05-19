import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const inputPath = path.join(root, 'data', 'experiment-policy.json')
const outputPath = path.join(root, 'src', 'data', 'experimentPolicy.ts')

const policy = JSON.parse(await readFile(inputPath, 'utf8'))
const output = `export const experimentPolicy = ${JSON.stringify(policy, null, 2)} as const\n\nexport type ExperimentPolicy = typeof experimentPolicy\n`

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, output)

console.log(`Wrote ${path.relative(root, outputPath)}`)

