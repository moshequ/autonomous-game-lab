import crypto from 'node:crypto'
import { access, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
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
const allowedEventNames = new Set([
  'app_loaded',
  'runtime_error',
  'game_viewed',
  'game_started',
  'first_move_coach_shown',
  'first_move_coach_used',
  'first_move_coach_skipped',
  'tutorial_completed',
  'turn_taken',
  'level_completed',
  'first_loss',
  'game_abandoned',
  'experiment_assigned',
  'analytics_exported',
  'analytics_evidence_issue_opened',
  'improvement_requested',
  'prototype_card_viewed',
  'prototype_started',
  'privacy_choice_updated',
  'rewarded_ad_available',
  'rewarded_ad_started',
  'rewarded_ad_completed',
  'cosmetic_offer_viewed',
  'cosmetic_offer_clicked',
  'revenue_cents',
  'replay_clicked',
  'replay_prompt_viewed',
  'replay_prompt_clicked',
  'replay_prompt_dismissed',
  'completion_nudge_viewed',
  'completion_nudge_clicked',
  'completion_nudge_dismissed',
  'finish_line_coach_viewed',
  'finish_line_coach_clicked',
  'finish_line_coach_dismissed',
  'store_gate_viewed',
  'organic_entry_opened',
  'share_clicked',
  'organic_seed_card_viewed',
  'organic_seed_share_clicked',
  'seed_campaign_clicked',
  'gate_sample_mission_clicked',
  'gate_sample_export_prompt_viewed',
  'gate_sample_export_prompt_clicked',
  'daily_challenge_viewed',
  'daily_challenge_started',
  'daily_challenge_completed',
  'daily_return_prompt_viewed',
  'daily_return_prompt_clicked',
  'daily_return_prompt_dismissed',
  'daily_return_intent_viewed',
  'daily_return_intent_started',
  'daily_return_intent_cleared',
  'streak_updated',
  'pwa_install_page_viewed',
  'pwa_install_open_clicked',
  'pwa_install_prompt_available',
  'pwa_install_prompt_viewed',
  'pwa_install_prompt_clicked',
  'pwa_install_prompt_accepted',
  'pwa_install_prompt_dismissed',
  'pwa_install_prompt_cooldown',
  'pwa_installed',
  'pwa_launch_mode_detected',
  'local_router_card_viewed',
  'local_router_choice_clicked',
  'local_router_choice_dismissed',
  'local_event_drop_folder_connected',
  'local_event_drop_folder_exported',
  'local_event_drop_folder_failed',
])
const sensitivePropertyKeys = new Set([
  'email',
  'phone',
  'name',
  'firstName',
  'lastName',
  'address',
  'ip',
  'ipAddress',
  'preciseLocation',
  'latitude',
  'longitude',
])

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const hashText = (value) => crypto.createHash('sha256').update(value).digest('hex').slice(0, 16)
const stableJson = (value) => JSON.stringify(value, Object.keys(value).sort())

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
const sanitizeProperties = (properties) => {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return { properties: {}, sensitivePropertiesDropped: 0 }
  }

  let sensitivePropertiesDropped = 0
  const sanitized = {}

  for (const [key, value] of Object.entries(properties)) {
    if (sensitivePropertyKeys.has(key)) {
      sensitivePropertiesDropped += 1
      continue
    }

    const type = typeof value

    if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
      sanitized[key] = typeof value === 'string' ? value.slice(0, 240) : value
    }
  }

  return { properties: sanitized, sensitivePropertiesDropped }
}
const parseEvents = (raw) => {
  const payload = JSON.parse(raw)
  const rawEvents = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : []
  let sensitivePropertiesDropped = 0

  const validEvents = rawEvents.map((event) => {
    if (!event || typeof event !== 'object') {
      return null
    }

    const eventName = eventNameFor(event)
    const createdAt =
      typeof event.createdAt === 'string'
        ? event.createdAt
        : typeof event.timestamp === 'string'
          ? event.timestamp
          : null

    if (typeof eventName !== 'string' || !allowedEventNames.has(eventName) || !createdAt) {
      return null
    }

    const sanitized = sanitizeProperties(event.properties)
    sensitivePropertiesDropped += sanitized.sensitivePropertiesDropped

    return {
      id: typeof event.id === 'string' ? event.id.slice(0, 96) : eventIdFor({ ...event, properties: sanitized.properties }),
      name: eventName,
      properties: sanitized.properties,
      createdAt,
    }
  }).filter(Boolean)
  const seen = new Set()

  const events = validEvents.filter((event) => {
    const id = eventIdFor(event)

    if (seen.has(id)) {
      return false
    }

    seen.add(id)
    return true
  })

  return { events, sensitivePropertiesDropped }
}
const eventBatchHash = (events) =>
  hashText(
    JSON.stringify(
      events.map((event) => ({
        id: event.id,
        name: event.name,
        createdAt: event.createdAt,
        properties: stableJson(event.properties),
      })),
    ),
  )
const hashFile = async (filePath) => eventBatchHash(parseEvents(await readFile(filePath, 'utf8')).events)

const summarizeGateSampleEvents = async (files) => {
  const campaigns = new Map()
  let totalEvents = 0

  for (const file of files.filter((candidate) => candidate.valid)) {
    let events = []

    try {
      events = parseEvents(await readFile(file.filePath, 'utf8')).events
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

const numberProperty = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const summarizeExportCoverage = async (files) => {
  const exports = []
  let totalEvents = 0

  for (const file of files.filter((candidate) => candidate.valid)) {
    let events = []

    try {
      events = parseEvents(await readFile(file.filePath, 'utf8')).events
    } catch {
      events = []
    }

    totalEvents += events.length

    for (const event of events) {
      if (eventNameFor(event) !== 'analytics_exported') {
        continue
      }

      const properties = event.properties ?? {}
      const eventCountAtExport = numberProperty(properties.eventCountAtExport)
      const unexportedEventsBeforeExport = numberProperty(properties.unexportedEventsBeforeExport)
      const exportedEventCountBeforeExport = numberProperty(properties.exportedEventCountBeforeExport)

      exports.push({
        id: event.id,
        createdAt: event.createdAt ?? null,
        exportSurface:
          typeof properties.exportSurface === 'string'
            ? properties.exportSurface
            : typeof properties.exportSurfaceDetail === 'string'
              ? properties.exportSurfaceDetail
              : 'manual',
        eventCountAtExport,
        unexportedEventsBeforeExport,
        exportedEventCountBeforeExport,
        coverageStatusBeforeExport:
          typeof properties.exportCoverageStatusBeforeExport === 'string'
            ? properties.exportCoverageStatusBeforeExport
            : null,
        selfDescribing: typeof eventCountAtExport === 'number',
      })
    }
  }

  exports.sort((left, right) => String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? '')))

  const latest = exports[0] ?? null
  const coverageReceipts = exports.filter((event) => event.selfDescribing).length
  const status = coverageReceipts
    ? 'export-coverage-ready'
    : totalEvents
      ? 'export-coverage-missing'
      : 'waiting-for-first-export'

  return {
    status,
    files: files.filter((file) => file.valid).length,
    events: totalEvents,
    analyticsExports: exports.length,
    coverageReceipts,
    selfDescribingExports: coverageReceipts,
    latestExportedAt: latest?.createdAt ?? null,
    latestExportSurface: latest?.exportSurface ?? null,
    latestEventCountAtExport: latest?.eventCountAtExport ?? null,
    latestUnexportedEventsBeforeExport: latest?.unexportedEventsBeforeExport ?? null,
    latestCoverageStatusBeforeExport: latest?.coverageStatusBeforeExport ?? null,
  }
}

const inspectEventFile = async (filePath) => {
  try {
    const raw = await readFile(filePath, 'utf8')
    const parsed = parseEvents(raw)
    const fileStat = await stat(filePath)

    return {
      filePath,
      exists: true,
      valid: parsed.events.length > 0,
      events: parsed.events.length,
      hash: eventBatchHash(parsed.events),
      sanitizedEvents: parsed.events,
      sensitivePropertiesDropped: parsed.sensitivePropertiesDropped,
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
      sanitizedEvents: [],
      sensitivePropertiesDropped: 0,
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
          sanitizedEvents: [],
          sensitivePropertiesDropped: 0,
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
  await writeFile(targetPath, JSON.stringify(candidate.sanitizedEvents, null, 2) + '\n')
  inboxHashes.add(candidate.hash)
  copiedFiles.push({
    sourcePath: relativeToRoot(sourcePath),
    sourceRole: candidate.sourceRole,
    targetPath: relativeToRoot(targetPath),
    events: candidate.events,
    hash: candidate.hash,
    sensitivePropertiesDropped: candidate.sensitivePropertiesDropped ?? 0,
    privacyStripped: true,
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
const downloadsScanCooldownHours = 4
const gateSampleEvidence = {
  inbox: await summarizeGateSampleEvents(validInboxFiles),
  imported: await summarizeGateSampleEvents(validImportedBatches),
}
const exportCoverageSummaries = {
  inbox: await summarizeExportCoverage(validInboxFiles),
  imported: await summarizeExportCoverage(validImportedBatches),
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
      sensitivePropertiesDropped: copiedDownloadsFiles.reduce(
        (sum, file) => sum + (file.sensitivePropertiesDropped ?? 0),
        0,
      ),
      evidenceFound: (downloadsDirectorySummary?.validEvents ?? 0) > 0 || copiedDownloadsFiles.length > 0,
    }
  : (previousBridge.explicitDownloadsScan ?? null)
const gateSampleEvidenceReadyNow = gateSampleEvidence.inbox.events > 0 || gateSampleEvidence.imported.events > 0
const explicitDownloadsScanAt = Date.parse(explicitDownloadsScan?.scannedAt ?? '')
const explicitDownloadsScanAgeHours = Number.isFinite(explicitDownloadsScanAt)
  ? Math.max(0, (Date.parse(generatedAt) - explicitDownloadsScanAt) / (60 * 60 * 1000))
  : null
const explicitDownloadsScanCoolingDown =
  explicitDownloadsScan?.evidenceFound === false &&
  !gateSampleEvidenceReadyNow &&
  typeof explicitDownloadsScanAgeHours === 'number' &&
  explicitDownloadsScanAgeHours < downloadsScanCooldownHours
const explicitDownloadsNextRecommendedScanAt =
  explicitDownloadsScan?.evidenceFound === false && Number.isFinite(explicitDownloadsScanAt) && !gateSampleEvidenceReadyNow
    ? new Date(explicitDownloadsScanAt + downloadsScanCooldownHours * 60 * 60 * 1000).toISOString()
    : generatedAt
const explicitDownloadsScanPolicy = {
  explicitOptInRequired: true,
  cooldownHours: downloadsScanCooldownHours,
  coolingDown: explicitDownloadsScanCoolingDown,
  evidenceReadyNow: gateSampleEvidenceReadyNow,
  lastScanAt: Number.isFinite(explicitDownloadsScanAt) ? explicitDownloadsScan?.scannedAt : null,
  lastScanStatus: explicitDownloadsScan?.status ?? null,
  scanAgeHours:
    typeof explicitDownloadsScanAgeHours === 'number'
      ? Math.round(explicitDownloadsScanAgeHours * 100) / 100
      : null,
  cooldownRemainingHours: explicitDownloadsScanCoolingDown
    ? Math.round(Math.max(0, downloadsScanCooldownHours - explicitDownloadsScanAgeHours) * 100) / 100
    : 0,
  nextRecommendedScanAt: explicitDownloadsNextRecommendedScanAt,
}
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
    recommendedFields: [
      'properties.gameId',
      'properties.anonymousId',
      'properties.sessionDate',
      'properties.eventCountAtExport',
      'properties.unexportedEventsBeforeExport',
    ],
    strippedPropertyKeys: [...sensitivePropertyKeys].sort(),
    inboxDirectory: relativeToRoot(inboxDir),
    downloadsDirectory: relativeToRoot(downloadsDir),
    importCommand: 'npm run autonomous:import-events',
    rollupCommand: 'npm run autonomous:analytics',
    recoveryCommand: 'npm run autonomous:gate-recovery',
    downloadsImportCommand,
    browserFolderDrop: {
      supported: true,
      mode: 'browser-selected-local-folder',
      fallback: 'download',
      privacy: 'local-only-no-external-upload',
      autosaveSurface: 'local-event-drop-autosave',
      autosaveTriggers: [
        'first_move_coach_shown',
        'tutorial_completed',
        'completion_nudge_viewed',
        'finish_line_coach_viewed',
        'level_completed',
        'replay_prompt_viewed',
        'replay_clicked',
        'daily_return_intent_started',
      ],
    },
  },
  explicitDownloadsScan,
  explicitDownloadsScanPolicy,
  gateSampleEvidence: {
    ...gateSampleEvidence,
    localEvidenceAvailable: gateSampleEvidence.imported.events > 0,
    readyForIngest: gateSampleEvidence.inbox.events > 0,
  },
  exportCoverage: {
    ...exportCoverageSummaries,
    status:
      exportCoverageSummaries.imported.coverageReceipts > 0
        ? 'imported-export-coverage-ready'
        : exportCoverageSummaries.inbox.coverageReceipts > 0
          ? 'inbox-export-coverage-ready'
          : exportCoverageSummaries.imported.analyticsExports > 0 ||
              exportCoverageSummaries.inbox.analyticsExports > 0
            ? 'legacy-export-needs-refresh'
            : 'waiting-for-first-export',
    localEvidenceAvailable: exportCoverageSummaries.imported.coverageReceipts > 0,
    readyForIngest: exportCoverageSummaries.inbox.coverageReceipts > 0,
  },
  privacy: {
    piiStrippingEnabled: true,
    rawDropsStayLocal: true,
    inboxWritesSanitizedEvents: true,
    sensitivePropertiesDropped: copiedFiles.reduce((sum, file) => sum + (file.sensitivePropertiesDropped ?? 0), 0),
    strippedPropertyKeys: [...sensitivePropertyKeys].sort(),
  },
  controls: {
    zeroPaidSpend: true,
    localOnly: true,
    noExternalUpload: true,
    noSyntheticEvents: true,
    noPiiRequired: true,
    piiStrippingEnabled: true,
    rawEventDropsStayLocal: true,
    copyOnlyExplicitDropPaths: true,
    downloadsFolderOptInOnly: true,
    downloadsFolderImportEnabled: downloadsImportEnabled,
    downloadsFolderRequiresExplicitEnv: true,
    localExportCoverageReceipts: true,
    staleExportDebtVisibleInApp: true,
    bridgeReadsExportReceipts: true,
    browserSelectedDropFolderSupported: true,
    browserSelectedDropFolderAutosave: true,
    autosaveRequiresConnectedFolder: true,
    autosaveNeverDownloadsWithoutManualClick: true,
    folderHandleStoredInBrowserOnly: true,
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
          'Connect a browser-selected local event drop folder to send future exports directly to the bridge inbox folder.',
          'After the folder is connected, play milestones autosave event drops locally without external upload.',
          'Prefer fresh PWA exports because they include event-count receipts for stale-export debt.',
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
  `- Browser folder drop: ${payload.eventDropContract.browserFolderDrop.supported}`,
  `- Browser folder autosave: ${payload.controls.browserSelectedDropFolderAutosave}`,
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
  `- Export coverage status: ${payload.exportCoverage.status}`,
  `- Inbox export receipts: ${payload.exportCoverage.inbox.coverageReceipts}`,
  `- Imported export receipts: ${payload.exportCoverage.imported.coverageReceipts}`,
  `- Sensitive properties stripped: ${payload.privacy.sensitivePropertiesDropped}`,
  `- Last explicit Downloads scan: ${payload.explicitDownloadsScan?.status ?? 'none'}`,
  `- Downloads scan cooling down: ${payload.explicitDownloadsScanPolicy.coolingDown}`,
  `- Next recommended Downloads scan: ${payload.explicitDownloadsScanPolicy.nextRecommendedScanAt}`,
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
