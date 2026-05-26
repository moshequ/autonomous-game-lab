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
  'game_card_play_clicked',
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
  'sample_next_viewed',
  'sample_next_routed',
  'sample_fastest_viewed',
  'sample_fastest_routed',
  'gate_sample_mission_clicked',
  'gate_sample_export_prompt_viewed',
  'gate_sample_export_prompt_clicked',
  'daily_challenge_viewed',
  'daily_challenge_started',
  'daily_challenge_completed',
  'daily_goal_reward_viewed',
  'daily_goal_reward_clicked',
  'daily_return_prompt_viewed',
  'daily_return_prompt_clicked',
  'daily_return_prompt_dismissed',
  'daily_return_commitment_viewed',
  'daily_return_link_copied',
  'daily_return_calendar_downloaded',
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
  'local_router_share_clicked',
  'local_router_choice_dismissed',
  'owner_unlock_pack_copied',
  'player_evidence_command_copied',
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
  'distinct_id',
  '$distinct_id',
  'person_id',
  'personId',
  '$set',
  '$set_once',
  'preciseLocation',
  'latitude',
  'longitude',
])

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const parseConfiguredPaths = (...values) =>
  values
    .flatMap((value) => (value ? value.split(path.delimiter) : []))
    .map((value) => value.trim())
    .filter(Boolean)

const importDirs = (
  process.env.AGL_EVENT_IMPORT_DIRS
    ? parseConfiguredPaths(process.env.AGL_EVENT_IMPORT_DIRS)
    : [
        inboxDir,
        ...(process.env.AGL_EVENT_IMPORT_DOWNLOADS === 'true' ? [path.join(os.homedir(), 'Downloads')] : []),
      ]
).filter(Boolean)
const manualProductionExportFiles = parseConfiguredPaths(
  process.env.AGL_PRODUCTION_EVENT_EXPORT_FILES,
  process.env.AGL_PRODUCTION_EVENT_EXPORT_FILE,
  process.env.AGL_EVENT_COLLECTOR_EXPORT_FILES,
  process.env.AGL_EVENT_COLLECTOR_EXPORT_FILE,
).map((filePath) => path.resolve(root, filePath))

const filePattern = /^player-events.*\.json$/i
const importedPattern = /^imported-.*\.json$/i

const relativeToRoot = (value) => {
  if (!value || /^https?:\/\//i.test(value)) {
    return value
  }

  return path.isAbsolute(value) ? path.relative(root, value) : value
}

const stableJson = (value) => JSON.stringify(value, Object.keys(value).sort())

const hashExternalId = (value) =>
  `external-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 16)}`

const simpleValue = (value) => {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean' || value === null ? value : undefined
}

const parsePropertiesValue = (value) => {
  if (!value) {
    return {}
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }

  return typeof value === 'object' && !Array.isArray(value) ? value : {}
}

const toIsoDate = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

const toIsoDateTime = (value) => {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString()
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = value < 10_000_000_000 ? value * 1000 : value
    const date = new Date(normalized)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  return null
}

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

const columnNameFor = (column) =>
  typeof column === 'string'
    ? column
    : typeof column?.name === 'string'
      ? column.name
      : typeof column?.key === 'string'
        ? column.key
        : ''

const mapResultRow = (row, columns) => {
  if (!Array.isArray(row)) {
    return row
  }

  const mapped = {}

  columns.forEach((column, index) => {
    const name = columnNameFor(column)

    if (name) {
      mapped[name] = row[index]
    }
  })

  return mapped
}

const rawEventsFromPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.events)) {
    return payload.events
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  if (Array.isArray(payload.results)) {
    const columns = Array.isArray(payload.columns)
      ? payload.columns
      : Array.isArray(payload.result_columns)
        ? payload.result_columns
        : []
    return payload.results.map((row) => mapResultRow(row, columns))
  }

  return []
}

const normalizedInputEvent = (event) => {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return null
  }

  const rawProperties = parsePropertiesValue(event.properties ?? event.props ?? event.$properties)
  const properties = { ...rawProperties }
  const createdAt = toIsoDateTime(event.createdAt ?? event.timestamp ?? event.created_at ?? event.time)
  const propertyMappings = {
    gameId: event.gameId ?? event.game_id,
    sessionId: event.sessionId ?? event.session_id,
    sessionDate: event.sessionDate ?? event.session_date,
    campaignId: event.campaignId ?? event.campaign_id,
    acquisitionCampaign: event.acquisitionCampaign ?? event.acquisition_campaign,
    acquisitionSource: event.acquisitionSource ?? event.acquisition_source,
    acquisitionChannel: event.acquisitionChannel ?? event.acquisition_channel,
    gateId: event.gateId ?? event.gate_id,
    revenueCents: event.revenueCents ?? event.revenue_cents,
    value: event.value,
  }

  for (const [key, value] of Object.entries(propertyMappings)) {
    if (properties[key] !== undefined) {
      continue
    }

    const candidate = simpleValue(value)

    if (candidate !== undefined) {
      properties[key] = candidate
    }
  }

  if (properties.sessionDate === undefined && createdAt) {
    properties.sessionDate = toIsoDate(createdAt)
  }

  const rawExternalId =
    event.distinct_id ??
    event.distinctId ??
    event.anonymous_id ??
    event.anonymousId ??
    rawProperties.distinct_id ??
    rawProperties.$distinct_id
  const canHashExternalId =
    properties.anonymousId === undefined && (typeof rawExternalId === 'string' || typeof rawExternalId === 'number')

  if (canHashExternalId) {
    properties.anonymousId = hashExternalId(rawExternalId)
  }

  const id = event.id ?? event.uuid ?? event.event_id ?? event.eventId

  return {
    id: typeof id === 'string' || typeof id === 'number' ? String(id).slice(0, 96) : undefined,
    name: event.name ?? event.event ?? event.event_name,
    properties,
    createdAt,
    externalIdentifiersHashed: canHashExternalId ? 1 : 0,
  }
}

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

const normalizeEvent = (event) => {
  const input = normalizedInputEvent(event)

  if (!input) {
    return null
  }

  const name = input.name

  if (typeof name !== 'string' || !allowedEventNames.has(name)) {
    return null
  }

  const sanitized = sanitizeProperties(input.properties)
  const createdAt = input.createdAt ?? new Date().toISOString()

  return {
    event: {
      id: eventIdFor({ ...input, name, properties: sanitized.properties, createdAt }),
      name,
      properties: sanitized.properties,
      createdAt,
    },
    sensitivePropertiesDropped: sanitized.sensitivePropertiesDropped,
    externalIdentifiersHashed: input.externalIdentifiersHashed,
  }
}

const parseEvents = (raw) => {
  const payload = JSON.parse(raw)
  const rawEvents = rawEventsFromPayload(payload)
  let sensitivePropertiesDropped = 0
  let externalIdentifiersHashed = 0
  const events = rawEvents
    .map(normalizeEvent)
    .filter(Boolean)
    .map((normalized) => {
      sensitivePropertiesDropped += normalized.sensitivePropertiesDropped
      externalIdentifiersHashed += normalized.externalIdentifiersHashed
      return normalized.event
    })
  const seen = new Set()

  return {
    sensitivePropertiesDropped,
    externalIdentifiersHashed,
    events: events.filter((event) => {
      if (seen.has(event.id)) {
        return false
      }

      seen.add(event.id)
      return true
    }),
  }
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
let knownEventIds = new Set()

const importBatch = async (events, sourcePath, privacy = {}) => {
  if (!events.length) {
    skippedFiles.push({
      sourcePath,
      sourceKind: privacy.sourceKind ?? 'local-event-drop',
      reason: 'no valid events',
      sensitivePropertiesDropped: privacy.sensitivePropertiesDropped ?? 0,
      externalIdentifiersHashed: privacy.externalIdentifiersHashed ?? 0,
    })
    return
  }

  const newEvents = events.filter((event) => !knownEventIds.has(event.id))
  const duplicateEvents = events.length - newEvents.length

  if (!newEvents.length) {
    skippedFiles.push({
      sourcePath,
      reason: 'duplicate events',
      events: events.length,
      duplicateEvents,
      sensitivePropertiesDropped: privacy.sensitivePropertiesDropped ?? 0,
      externalIdentifiersHashed: privacy.externalIdentifiersHashed ?? 0,
      sourceKind: privacy.sourceKind ?? 'local-event-drop',
    })
    return
  }

  const hash = eventBatchHash(newEvents)
  const targetPath = path.join(outputDir, `imported-${hash}.json`)

  if (await exists(targetPath)) {
    skippedFiles.push({
      sourcePath,
      reason: 'duplicate batch',
      targetPath,
      sensitivePropertiesDropped: privacy.sensitivePropertiesDropped ?? 0,
      externalIdentifiersHashed: privacy.externalIdentifiersHashed ?? 0,
      sourceKind: privacy.sourceKind ?? 'local-event-drop',
    })
    return
  }

  await writeFile(targetPath, JSON.stringify(newEvents, null, 2) + '\n')
  for (const event of newEvents) {
    knownEventIds.add(event.id)
  }
  importedFiles.push({
    sourcePath,
    targetPath,
    events: newEvents.length,
    sourceEvents: events.length,
    duplicateEvents,
    hash,
    sourceKind: privacy.sourceKind ?? 'local-event-drop',
    sensitivePropertiesDropped: privacy.sensitivePropertiesDropped ?? 0,
    externalIdentifiersHashed: privacy.externalIdentifiersHashed ?? 0,
    privacyStripped: true,
  })
}

const loadKnownEventIds = async () => {
  const files = await readdir(outputDir).catch(() => [])
  const ids = new Set()

  for (const file of files.filter((candidate) => importedPattern.test(candidate))) {
    try {
      const { events } = parseEvents(await readFile(path.join(outputDir, file), 'utf8'))

      for (const event of events) {
        ids.add(event.id)
      }
    } catch {
      // A bad historical import should not block ingesting fresh valid events.
    }
  }

  return ids
}

await mkdir(outputDir, { recursive: true })
await mkdir(inboxDir, { recursive: true })
await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
knownEventIds = await loadKnownEventIds()

const sourceDirectories = []
const remoteCollectors = []
const manualProductionExportResults = []

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
      const parsed = parseEvents(raw)

      remoteCollectors.push({
        url: collectorExportUrl,
        status: parsed.events.length ? 'available' : 'empty',
        events: parsed.events.length,
        sensitivePropertiesDropped: parsed.sensitivePropertiesDropped,
      })

      await importBatch(parsed.events, collectorExportUrl, {
        sensitivePropertiesDropped: parsed.sensitivePropertiesDropped,
        externalIdentifiersHashed: parsed.externalIdentifiersHashed,
        sourceKind: 'remote-collector-export',
      })
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

for (const filePath of manualProductionExportFiles) {
  try {
    const parsed = parseEvents(await readFile(filePath, 'utf8'))

    manualProductionExportResults.push({
      sourcePath: filePath,
      status: parsed.events.length ? 'available' : 'empty',
      events: parsed.events.length,
      sensitivePropertiesDropped: parsed.sensitivePropertiesDropped,
      externalIdentifiersHashed: parsed.externalIdentifiersHashed,
    })

    await importBatch(parsed.events, filePath, {
      sensitivePropertiesDropped: parsed.sensitivePropertiesDropped,
      externalIdentifiersHashed: parsed.externalIdentifiersHashed,
      sourceKind: 'manual-production-export',
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)

    manualProductionExportResults.push({
      sourcePath: filePath,
      status: 'error',
      events: 0,
      error: reason,
      sensitivePropertiesDropped: 0,
      externalIdentifiersHashed: 0,
    })
    skippedFiles.push({
      sourcePath: filePath,
      sourceKind: 'manual-production-export',
      reason,
      sensitivePropertiesDropped: 0,
      externalIdentifiersHashed: 0,
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
      const parsed = parseEvents(await readFile(sourcePath, 'utf8'))
      await importBatch(parsed.events, sourcePath, {
        sensitivePropertiesDropped: parsed.sensitivePropertiesDropped,
        externalIdentifiersHashed: parsed.externalIdentifiersHashed,
        sourceKind: 'local-event-drop',
      })
    } catch (error) {
      skippedFiles.push({
        sourcePath,
        reason: error instanceof Error ? error.message : String(error),
        sourceKind: 'local-event-drop',
      })
    }
  }
}

const manualProductionImportedFiles = importedFiles.filter((file) => file.sourceKind === 'manual-production-export')

const payload = {
  generatedAt: new Date().toISOString(),
  status: importedFiles.length
    ? 'imported'
    : skippedFiles.some((file) => file.reason === 'duplicate batch' || file.reason === 'duplicate events')
      ? 'idle-duplicates'
      : 'idle-no-files',
  outputDirectory: path.relative(root, outputDir),
  importPattern: filePattern.toString(),
  existingImportedEvents: knownEventIds.size - importedFiles.reduce((sum, file) => sum + file.events, 0),
  sourceDirectories,
  remoteCollectors,
  manualProductionExports: {
    mode: 'explicit-file-only',
    enabled: manualProductionExportFiles.length > 0,
    envVars: [
      'AGL_PRODUCTION_EVENT_EXPORT_FILES',
      'AGL_PRODUCTION_EVENT_EXPORT_FILE',
      'AGL_EVENT_COLLECTOR_EXPORT_FILES',
      'AGL_EVENT_COLLECTOR_EXPORT_FILE',
    ],
    command:
      'AGL_PRODUCTION_EVENT_EXPORT_FILES=/absolute/path/to/export.json npm run autonomous:collect-production-export',
    pathsConfigured: manualProductionExportFiles.length,
    files: manualProductionExportResults.map((file) => ({
      ...file,
      sourcePath: relativeToRoot(file.sourcePath),
    })),
    importedFiles: manualProductionImportedFiles.length,
    importedEvents: manualProductionImportedFiles.reduce((sum, file) => sum + file.events, 0),
    supportedPayloads: [
      'Array<AnalyticsEvent>',
      '{ "events": Array<AnalyticsEvent> }',
      '{ "results": Array<object>, "columns"?: Array<string> }',
      'PostHog JSON rows with event/timestamp/properties/distinct_id columns',
      'first-party collector JSON export',
    ],
    controls: {
      explicitFileOnly: true,
      noDirectoryScan: true,
      noDownloadsScan: true,
      localOnly: true,
      noExternalUpload: true,
      piiStrippingEnabled: true,
      externalIdentifiersHashed: true,
      rawExportsStayLocal: true,
      noSecretValuesStored: true,
    },
  },
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
  duplicateEvents: [
    ...importedFiles.map((file) => file.duplicateEvents ?? 0),
    ...skippedFiles.map((file) => file.duplicateEvents ?? 0),
  ].reduce((sum, value) => sum + value, 0),
  privacy: {
    piiStrippingEnabled: true,
    importedFilesAreSanitized: importedFiles.every((file) => file.privacyStripped === true),
    rawPlayerEventDropsStayLocal: true,
    sensitivePropertiesDropped: [
      ...importedFiles.map((file) => file.sensitivePropertiesDropped ?? 0),
      ...skippedFiles.map((file) => file.sensitivePropertiesDropped ?? 0),
    ].reduce((sum, value) => sum + value, 0),
    externalIdentifiersHashed: [
      ...importedFiles.map((file) => file.externalIdentifiersHashed ?? 0),
      ...skippedFiles.map((file) => file.externalIdentifiersHashed ?? 0),
    ].reduce((sum, value) => sum + value, 0),
    strippedPropertyKeys: [...sensitivePropertyKeys].sort(),
  },
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
  `- manual production exports: ${payload.manualProductionExports.pathsConfigured} explicit file(s), ${payload.manualProductionExports.importedEvents} imported event(s)`,
  '',
  '## Imported',
  '',
  ...(payload.importedFiles.length
    ? payload.importedFiles.map(
        (file) =>
          `- ${file.targetPath}: ${file.events} new event(s) from ${file.sourcePath} (${file.duplicateEvents} duplicate event(s) skipped)`,
      )
    : ['- none']),
  `- Existing imported events before run: ${payload.existingImportedEvents}`,
  `- Duplicate events skipped: ${payload.duplicateEvents}`,
  `- Sensitive properties stripped: ${payload.privacy.sensitivePropertiesDropped}`,
  `- External identifiers hashed: ${payload.privacy.externalIdentifiersHashed}`,
  `- Manual production export command: ${payload.manualProductionExports.command}`,
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
