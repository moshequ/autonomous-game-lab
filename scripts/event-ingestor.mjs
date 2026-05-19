import crypto from 'node:crypto'
import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const root = process.cwd()
const outputDir = path.resolve(root, process.env.AGL_EVENT_OUTPUT_DIR ?? 'data/player-events')
const inboxDir = path.resolve(root, process.env.AGL_EVENT_INBOX_DIR ?? path.join(outputDir, 'inbox'))
const outputJsonPath = path.resolve(root, process.env.AGL_EVENT_INGEST_OUTPUT ?? 'data/event-ingest.json')
const reportPath = path.resolve(root, process.env.AGL_EVENT_INGEST_REPORT ?? 'reports/event-ingest-latest.md')
const collectorExportUrl = process.env.AGL_EVENT_COLLECTOR_EXPORT_URL?.trim()
const collectorAdminToken = process.env.AGL_EVENT_COLLECTOR_ADMIN_TOKEN?.trim()

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const importDirs = (
  process.env.AGL_EVENT_IMPORT_DIRS
    ? process.env.AGL_EVENT_IMPORT_DIRS.split(path.delimiter)
    : [
        inboxDir,
        ...(process.env.AGL_EVENT_IMPORT_DOWNLOADS === 'true' ? [path.join(os.homedir(), 'Downloads')] : []),
      ]
)
  .map((dir) => dir.trim())
  .filter(Boolean)

const filePattern = /^player-events.*\.json$/i

const relativeToRoot = (value) => {
  if (!value || /^https?:\/\//i.test(value)) {
    return value
  }

  return path.isAbsolute(value) ? path.relative(root, value) : value
}

const stableJson = (value) => JSON.stringify(value, Object.keys(value).sort())

const eventIdFor = (event) =>
  event.id ??
  crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        name: event.name ?? event.event,
        createdAt: event.createdAt ?? event.timestamp,
        properties: event.properties ?? {},
      }),
    )
    .digest('hex')
    .slice(0, 16)

const normalizeEvent = (event) => {
  const name = event.name ?? event.event

  if (typeof name !== 'string' || !name) {
    return null
  }

  const properties = event.properties && typeof event.properties === 'object' ? event.properties : {}
  const createdAt =
    typeof event.createdAt === 'string'
      ? event.createdAt
      : typeof event.timestamp === 'string'
        ? event.timestamp
        : new Date().toISOString()

  return {
    id: eventIdFor({ ...event, name, properties, createdAt }),
    name,
    properties,
    createdAt,
  }
}

const parseEvents = (raw) => {
  const payload = JSON.parse(raw)
  const rawEvents = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : []
  const events = rawEvents.map(normalizeEvent).filter(Boolean)
  const seen = new Set()

  return events.filter((event) => {
    if (seen.has(event.id)) {
      return false
    }

    seen.add(event.id)
    return true
  })
}

const eventBatchHash = (events) =>
  crypto
    .createHash('sha256')
    .update(
      JSON.stringify(
        events.map((event) => ({
          id: event.id,
          name: event.name,
          createdAt: event.createdAt,
          properties: stableJson(event.properties),
        })),
      ),
    )
    .digest('hex')
    .slice(0, 16)

const importedFiles = []
const skippedFiles = []

const importBatch = async (events, sourcePath) => {
  if (!events.length) {
    skippedFiles.push({ sourcePath, reason: 'no valid events' })
    return
  }

  const hash = eventBatchHash(events)
  const targetPath = path.join(outputDir, `imported-${hash}.json`)

  if (await exists(targetPath)) {
    skippedFiles.push({ sourcePath, reason: 'duplicate batch', targetPath })
    return
  }

  await writeFile(targetPath, JSON.stringify(events, null, 2) + '\n')
  importedFiles.push({
    sourcePath,
    targetPath,
    events: events.length,
    hash,
  })
}

await mkdir(outputDir, { recursive: true })
await mkdir(inboxDir, { recursive: true })
await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })

const sourceDirectories = []
const remoteCollectors = []

if (collectorExportUrl) {
  try {
    const response = await fetch(collectorExportUrl, {
      headers: {
        ...(collectorAdminToken ? { Authorization: `Bearer ${collectorAdminToken}` } : {}),
      },
    })

    if (!response.ok) {
      remoteCollectors.push({
        url: collectorExportUrl,
        status: 'error',
        events: 0,
        error: `collector export failed with ${response.status}`,
      })
    } else {
      const raw = await response.text()
      const events = parseEvents(raw)

      remoteCollectors.push({
        url: collectorExportUrl,
        status: events.length ? 'available' : 'empty',
        events: events.length,
      })

      await importBatch(events, collectorExportUrl)
    }
  } catch (error) {
    remoteCollectors.push({
      url: collectorExportUrl,
      status: 'error',
      events: 0,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

for (const directory of importDirs) {
  const found = await exists(directory)
  const files = found ? await readdir(directory) : []
  const matched = files.filter((file) => filePattern.test(file))

  sourceDirectories.push({
    path: directory,
    exists: found,
    matchedFiles: matched.length,
  })

  for (const file of matched) {
    const sourcePath = path.join(directory, file)

    try {
      const events = parseEvents(await readFile(sourcePath, 'utf8'))
      await importBatch(events, sourcePath)
    } catch (error) {
      skippedFiles.push({
        sourcePath,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  status: importedFiles.length
    ? 'imported'
    : skippedFiles.some((file) => file.reason === 'duplicate batch')
      ? 'idle-duplicates'
      : 'idle-no-files',
  outputDirectory: path.relative(root, outputDir),
  importPattern: filePattern.toString(),
  sourceDirectories,
  remoteCollectors,
  importedFiles: importedFiles.map((file) => ({
    ...file,
    sourcePath: relativeToRoot(file.sourcePath),
    targetPath: relativeToRoot(file.targetPath),
  })),
  skippedFiles: skippedFiles.map((file) => ({
    ...file,
    sourcePath: relativeToRoot(file.sourcePath),
    targetPath: file.targetPath ? relativeToRoot(file.targetPath) : undefined,
  })),
  importedEvents: importedFiles.reduce((sum, file) => sum + file.events, 0),
}

const report = [
  '# Event Ingest',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Output directory: ${payload.outputDirectory}`,
  '',
  '## Sources',
  '',
  ...payload.sourceDirectories.map(
    (dir) => `- ${dir.path}: ${dir.exists ? 'available' : 'missing'}, ${dir.matchedFiles} matching file(s)`,
  ),
  ...payload.remoteCollectors.map(
    (collector) =>
      `- ${collector.url}: ${collector.status}, ${collector.events} event(s)${
        collector.error ? ` (${collector.error})` : ''
      }`,
  ),
  '',
  '## Imported',
  '',
  ...(payload.importedFiles.length
    ? payload.importedFiles.map((file) => `- ${file.targetPath}: ${file.events} event(s) from ${file.sourcePath}`)
    : ['- none']),
  '',
  '## Skipped',
  '',
  ...(payload.skippedFiles.length
    ? payload.skippedFiles.map((file) => `- ${file.sourcePath}: ${file.reason}`)
    : ['- none']),
  '',
]

await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
