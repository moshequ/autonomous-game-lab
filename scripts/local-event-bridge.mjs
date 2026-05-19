import crypto from 'node:crypto'
import { access, copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const root = process.cwd()
const eventOutputDir = path.resolve(root, process.env.AGL_EVENT_OUTPUT_DIR ?? 'data/player-events')
const inboxDir = path.resolve(root, process.env.AGL_EVENT_INBOX_DIR ?? path.join(eventOutputDir, 'inbox'))
const outputJsonPath = path.resolve(root, process.env.AGL_LOCAL_EVENT_BRIDGE_OUTPUT ?? 'data/local-event-bridge.json')
const outputTsPath = path.resolve(root, process.env.AGL_LOCAL_EVENT_BRIDGE_TS_OUTPUT ?? 'src/data/localEventBridge.ts')
const reportPath = path.resolve(root, process.env.AGL_LOCAL_EVENT_BRIDGE_REPORT ?? 'reports/local-event-bridge-latest.md')
const filePattern = /^player-events.*\.json$/i
const importedPattern = /^imported-.*\.json$/i

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const hashText = (value) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)
const hashFile = async (filePath) => hashText(await readFile(filePath, 'utf8'))

const relativeToRoot = (value) => {
  if (!value) {
    return value
  }

  return path.isAbsolute(value) ? path.relative(root, value) : value
}

const parseConfiguredPaths = (...values) =>
  values
    .flatMap((value) => (value ? value.split(path.delimiter) : []))
    .map((value) => value.trim())
    .filter(Boolean)

const configuredDropDirs = parseConfiguredPaths(
  process.env.AGL_LOCAL_EVENT_DROP_DIRS,
  process.env.AGL_LOCAL_EVENT_DROP_DIR,
).map((dir) => path.resolve(root, dir))
const configuredDropFiles = parseConfiguredPaths(
  process.env.AGL_LOCAL_EVENT_DROP_FILES,
  process.env.AGL_LOCAL_EVENT_DROP_FILE,
).map((file) => path.resolve(root, file))
const downloadsImportEnabled = ['1', 'true', 'yes'].includes(
  String(process.env.AGL_LOCAL_EVENT_IMPORT_DOWNLOADS ?? process.env.AGL_EVENT_IMPORT_DOWNLOADS ?? '').toLowerCase(),
)
const downloadsDir = path.join(os.homedir(), 'Downloads')
const sourceDirectories = [
  { directory: inboxDir, role: 'inbox' },
  ...configuredDropDirs.map((directory) => ({ directory, role: 'configured-drop-dir' })),
  ...(downloadsImportEnabled ? [{ directory: downloadsDir, role: 'downloads-opt-in' }] : []),
]
const sourceFiles = [...configuredDropFiles]

const eventNameFor = (event) => (typeof event?.name === 'string' ? event.name : event?.event)
const eventIdFor = (event) =>
  event.id ??
  hashText(
    JSON.stringify({
      name: eventNameFor(event),
      createdAt: event.createdAt ?? event.timestamp,
      properties: event.properties ?? {},
    }),
  )
const parseEvents = (raw) => {
  const payload = JSON.parse(raw)
  const rawEvents = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : []

  const validEvents = rawEvents.filter((event) => {
    if (!event || typeof event !== 'object') {
      return false
    }

    const eventName = eventNameFor(event)
    const properties = event.properties

    return (
      typeof eventName === 'string' &&
      eventName.length > 0 &&
      (!properties || typeof properties === 'object') &&
      (typeof event.createdAt === 'string' || typeof event.timestamp === 'string')
    )
  })
  const seen = new Set()

  return validEvents.filter((event) => {
    const id = eventIdFor(event)

    if (seen.has(id)) {
      return false
    }

    seen.add(id)
    return true
  })
}

const summarizeGateSampleEvents = async (files) => {
  const campaigns = new Map()
  let totalEvents = 0

  for (const file of files.filter((candidate) => candidate.valid)) {
    let events = []

    try {
      events = parseEvents(await readFile(file.filePath, 'utf8'))
    } catch {
      events = []
    }

    for (const event of events) {
      const eventName = eventNameFor(event)
      const properties = event.properties ?? {}
      const campaignId =
        typeof properties.acquisitionCampaign === 'string'
          ? properties.acquisitionCampaign
          : typeof properties.campaignId === 'string'
            ? properties.campaignId
            : null
      const isGateSample =
        eventName === 'gate_sample_mission_clicked' ||
        properties.acquisitionSource === 'gate_sample' ||
        properties.acquisitionChannel === 'product-gate-sample' ||
        campaignId?.startsWith('gate-sample-')

      if (!isGateSample || !campaignId) {
        continue
      }

      if (!campaigns.has(campaignId)) {
        campaigns.set(campaignId, {
          campaignId,
          events: 0,
          missionClicks: 0,
          analyticsExports: 0,
          successEvents: 0,
          games: new Set(),
          gates: new Set(),
          eventCounts: {},
          latestAt: null,
        })
      }

      const campaign = campaigns.get(campaignId)
      campaign.events += 1
      totalEvents += 1
      campaign.eventCounts[eventName] = (campaign.eventCounts[eventName] ?? 0) + 1

      if (eventName === 'gate_sample_mission_clicked') {
        campaign.missionClicks += 1
      }

      if (eventName === 'analytics_exported') {
        campaign.analyticsExports += 1
      }

      if (['level_completed', 'replay_clicked', 'daily_return_intent_started'].includes(eventName)) {
        campaign.successEvents += 1
      }

      if (typeof properties.gameId === 'string') {
        campaign.games.add(properties.gameId)
      }

      if (typeof properties.gateId === 'string') {
        campaign.gates.add(properties.gateId)
      }

      const createdAt = event.createdAt ?? event.timestamp
      if (typeof createdAt === 'string' && (!campaign.latestAt || createdAt > campaign.latestAt)) {
        campaign.latestAt = createdAt
      }
    }
  }

  const campaignRows = [...campaigns.values()]
    .map((campaign) => ({
      ...campaign,
      games: [...campaign.games].sort(),
      gates: [...campaign.gates].sort(),
    }))
    .sort((left, right) => right.events - left.events || left.campaignId.localeCompare(right.campaignId))

  return {
    campaigns: campaignRows,
    campaignCount: campaignRows.length,
    events: totalEvents,
    missionClicks: campaignRows.reduce((sum, campaign) => sum + campaign.missionClicks, 0),
    analyticsExports: campaignRows.reduce((sum, campaign) => sum + campaign.analyticsExports, 0),
    successEvents: campaignRows.reduce((sum, campaign) => sum + campaign.successEvents, 0),
  }
}

const inspectEventFile = async (filePath) => {
  try {
    const raw = await readFile(filePath, 'utf8')
    const events = parseEvents(raw)
    const fileStat = await stat(filePath)

    return {
      filePath,
      exists: true,
      valid: events.length > 0,
      events: events.length,
      hash: hashText(raw),
      bytes: fileStat.size,
      modifiedAt: fileStat.mtime.toISOString(),
    }
  } catch (error) {
    return {
      filePath,
      exists: false,
      valid: false,
      events: 0,
      hash: null,
      bytes: 0,
      modifiedAt: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

const listMatchingFiles = async (directory, pattern) => {
  try {
    const files = await readdir(directory)
    return files.filter((file) => pattern.test(file)).map((file) => path.join(directory, file))
  } catch {
    return []
  }
}

await mkdir(inboxDir, { recursive: true })
await mkdir(eventOutputDir, { recursive: true })
await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })

const previousBridge = await readOptionalJson(outputJsonPath, {})
const directorySummaries = []
const candidateFiles = []

for (const { directory, role } of sourceDirectories) {
  const directoryExists = await exists(directory)
  const matchedFiles = directoryExists ? await listMatchingFiles(directory, filePattern) : []
  const inspectedFiles = (await Promise.all(matchedFiles.map(inspectEventFile))).map((file) => ({
    ...file,
    sourceRole: role,
  }))

  directorySummaries.push({
    path: relativeToRoot(directory),
    role,
    exists: directoryExists,
    matchedFiles: matchedFiles.length,
    validFiles: inspectedFiles.filter((file) => file.valid).length,
    validEvents: inspectedFiles.reduce((sum, file) => sum + file.events, 0),
  })
  candidateFiles.push(...inspectedFiles)
}

for (const filePath of sourceFiles) {
  const fileName = path.basename(filePath)
  candidateFiles.push(
    filePattern.test(fileName)
      ? { ...(await inspectEventFile(filePath)), sourceRole: 'configured-drop-file' }
      : {
          filePath,
          sourceRole: 'configured-drop-file',
          exists: await exists(filePath),
          valid: false,
          events: 0,
          hash: null,
          bytes: 0,
          modifiedAt: null,
          error: 'filename does not match player-events*.json',
        },
  )
}

const inboxHashes = new Set()
const inboxFiles = await listMatchingFiles(inboxDir, filePattern)

for (const filePath of inboxFiles) {
  inboxHashes.add(await hashFile(filePath))
}

const copiedFiles = []
const skippedFiles = []

for (const candidate of candidateFiles.filter((file) => file.valid)) {
  const sourcePath = path.resolve(candidate.filePath)
  const alreadyInInbox = path.dirname(sourcePath) === inboxDir

  if (alreadyInInbox) {
    skippedFiles.push({
      sourcePath: relativeToRoot(sourcePath),
      sourceRole: candidate.sourceRole,
      reason: 'already-in-inbox',
      events: candidate.events,
    })
    continue
  }

  if (candidate.hash && inboxHashes.has(candidate.hash)) {
    skippedFiles.push({
      sourcePath: relativeToRoot(sourcePath),
      sourceRole: candidate.sourceRole,
      reason: 'duplicate-inbox-batch',
      events: candidate.events,
    })
    continue
  }

  const targetPath = path.join(inboxDir, `player-events-bridge-${candidate.hash}.json`)
  await copyFile(sourcePath, targetPath)
  inboxHashes.add(candidate.hash)
  copiedFiles.push({
    sourcePath: relativeToRoot(sourcePath),
    sourceRole: candidate.sourceRole,
    targetPath: relativeToRoot(targetPath),
    events: candidate.events,
    hash: candidate.hash,
  })
}

const inboxAfterCopy = await Promise.all((await listMatchingFiles(inboxDir, filePattern)).map(inspectEventFile))
const importedBatches = await Promise.all((await listMatchingFiles(eventOutputDir, importedPattern)).map(inspectEventFile))
const validInboxFiles = inboxAfterCopy.filter((file) => file.valid)
const validImportedBatches = importedBatches.filter((file) => file.valid)
const validInboxEvents = validInboxFiles.reduce((sum, file) => sum + file.events, 0)
const importedEvents = validImportedBatches.reduce((sum, file) => sum + file.events, 0)
const localEventsAvailable = importedEvents > 0
const downloadsImportCommand = 'AGL_LOCAL_EVENT_IMPORT_DOWNLOADS=true npm run autonomous:local-event-bridge'
const gateSampleEvidence = {
  inbox: await summarizeGateSampleEvents(validInboxFiles),
  imported: await summarizeGateSampleEvents(validImportedBatches),
}
const generatedAt = new Date().toISOString()
const downloadsDirectorySummary = directorySummaries.find((directory) => directory.role === 'downloads-opt-in')
const copiedDownloadsFiles = copiedFiles.filter((file) => file.sourceRole === 'downloads-opt-in')
const explicitDownloadsScan = downloadsImportEnabled
  ? {
      scannedAt: generatedAt,
      status:
        (downloadsDirectorySummary?.validEvents ?? 0) > 0 || copiedDownloadsFiles.length > 0
          ? 'evidence-found'
          : 'no-evidence-found',
      directory: relativeToRoot(downloadsDir),
      matchedFiles: downloadsDirectorySummary?.matchedFiles ?? 0,
      validFiles: downloadsDirectorySummary?.validFiles ?? 0,
      validEvents: downloadsDirectorySummary?.validEvents ?? 0,
      copiedFiles: copiedDownloadsFiles.length,
      evidenceFound: (downloadsDirectorySummary?.validEvents ?? 0) > 0 || copiedDownloadsFiles.length > 0,
    }
  : (previousBridge.explicitDownloadsScan ?? null)
const status =
  copiedFiles.length || validInboxEvents
    ? 'bridge-ready-for-ingest'
    : localEventsAvailable
      ? 'bridge-local-events-active'
      : 'bridge-waiting-for-export'

const payload = {
  generatedAt,
  status,
  mode: 'local-zero-spend-event-drop-bridge',
  inbox: {
    directory: relativeToRoot(inboxDir),
    filenamePattern: filePattern.toString(),
    validFiles: validInboxFiles.length,
    validEvents: validInboxEvents,
  },
  imported: {
    directory: relativeToRoot(eventOutputDir),
    validBatches: validImportedBatches.length,
    events: importedEvents,
    localEventsAvailable,
  },
  sourceDirectories: directorySummaries,
  sourceFiles: sourceFiles.map((file) => relativeToRoot(file)),
  copiedFiles,
  skippedFiles,
  invalidFiles: candidateFiles
    .filter((file) => file.exists && !file.valid)
    .map((file) => ({
      sourcePath: relativeToRoot(file.filePath),
      reason: file.error ?? 'no valid events',
    })),
  eventDropContract: {
    filenamePattern: 'player-events*.json',
    acceptedPayloads: ['Array<AnalyticsEvent>', '{ "events": Array<AnalyticsEvent> }'],
    requiredFields: ['name or event', 'createdAt or timestamp'],
    recommendedFields: ['properties.gameId', 'properties.anonymousId', 'properties.sessionDate'],
    inboxDirectory: relativeToRoot(inboxDir),
    downloadsDirectory: relativeToRoot(downloadsDir),
    importCommand: 'npm run autonomous:import-events',
    rollupCommand: 'npm run autonomous:analytics',
    recoveryCommand: 'npm run autonomous:gate-recovery',
    downloadsImportCommand,
  },
  explicitDownloadsScan,
  gateSampleEvidence: {
    ...gateSampleEvidence,
    localEvidenceAvailable: gateSampleEvidence.imported.events > 0,
    readyForIngest: gateSampleEvidence.inbox.events > 0,
  },
  controls: {
    zeroPaidSpend: true,
    localOnly: true,
    noExternalUpload: true,
    noSyntheticEvents: true,
    noPiiRequired: true,
    copyOnlyExplicitDropPaths: true,
    downloadsFolderOptInOnly: true,
    downloadsFolderImportEnabled: downloadsImportEnabled,
    downloadsFolderRequiresExplicitEnv: true,
    doesNotMutateProductGates: true,
  },
  nextActions:
    copiedFiles.length || validInboxEvents
    ? [
        'Run npm run autonomous:import-events to dedupe and persist the validated local event drops.',
        'Run npm run autonomous:analytics and npm run autonomous:gate-recovery so product decisions use the fresh events.',
      ]
    : [
        'Use the in-app Export local analytics control after playtesting.',
        `Place the downloaded player-events file in ${relativeToRoot(inboxDir)} or pass AGL_LOCAL_EVENT_DROP_DIRS to copy from an explicit folder.`,
        `Optionally run ${downloadsImportCommand} to scan Downloads explicitly.`,
        'Keep hosted collector/PostHog setup blocked until credentials exist.',
      ],
}

const report = [
  '# Local Event Bridge',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Mode: ${payload.mode}`,
  '',
  '## Contract',
  '',
  `- Filename: ${payload.eventDropContract.filenamePattern}`,
  `- Inbox: ${payload.eventDropContract.inboxDirectory}`,
  `- Import: ${payload.eventDropContract.importCommand}`,
  `- Rollup: ${payload.eventDropContract.rollupCommand}`,
  '',
  '## Sources',
  '',
  ...payload.sourceDirectories.map(
    (directory) =>
      `- ${directory.path}: ${directory.exists ? 'available' : 'missing'}, ${directory.validFiles}/${directory.matchedFiles} valid file(s), ${directory.validEvents} event(s)`,
  ),
  ...(payload.sourceFiles.length
    ? payload.sourceFiles.map((file) => `- explicit file: ${file}`)
    : ['- explicit files: none configured']),
  '',
  '## Local State',
  '',
  `- Inbox valid files: ${payload.inbox.validFiles}`,
  `- Inbox valid events: ${payload.inbox.validEvents}`,
  `- Imported batches: ${payload.imported.validBatches}`,
  `- Imported events: ${payload.imported.events}`,
  `- Gate sample inbox events: ${payload.gateSampleEvidence.inbox.events}`,
  `- Gate sample imported events: ${payload.gateSampleEvidence.imported.events}`,
  `- Last explicit Downloads scan: ${payload.explicitDownloadsScan?.status ?? 'none'}`,
  '',
  '## Gate Sample Evidence',
  '',
  ...(payload.gateSampleEvidence.imported.campaigns.length
    ? payload.gateSampleEvidence.imported.campaigns.map(
        (campaign) =>
          `- imported ${campaign.campaignId}: ${campaign.events} event(s), ${campaign.successEvents} success event(s), exports ${campaign.analyticsExports}`,
      )
    : ['- imported: none']),
  ...(payload.gateSampleEvidence.inbox.campaigns.length
    ? payload.gateSampleEvidence.inbox.campaigns.map(
        (campaign) =>
          `- inbox ${campaign.campaignId}: ${campaign.events} event(s), ${campaign.successEvents} success event(s), exports ${campaign.analyticsExports}`,
      )
    : ['- inbox: none']),
  '',
  '## Copied',
  '',
  ...(payload.copiedFiles.length
    ? payload.copiedFiles.map((file) => `- ${file.targetPath}: ${file.events} event(s) from ${file.sourcePath}`)
    : ['- none']),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
].join('\n')

await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(outputTsPath, `export const localEventBridge = ${JSON.stringify(payload, null, 2)} as const\n`)
await writeFile(reportPath, report)

console.log(`Local event bridge ${payload.status}: ${payload.inbox.validEvents} inbox event(s), ${payload.imported.events} imported event(s)`)
