import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

const root = process.cwd()
const smokeOutputPath = path.join(root, 'data', 'event-ingest-smoke.json')
const smokeReportPath = path.join(root, 'reports', 'event-ingest-smoke-latest.md')
const generatedPlayablePath = path.join(root, 'data', 'generated-playable-games.json')
const storeListingOptimizerPath = path.join(root, 'data', 'store-listing-optimizer.json')

const run = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: {
        ...process.env,
        ...env,
      },
      stdio: 'pipe',
    })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with ${code}\n${stdout}\n${stderr}`))
      }
    })
  })

const fail = (message) => {
  throw new Error(message)
}

const readJson = async (filePath, fallback = null) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch((error) => {
      if (fallback !== null) return fallback
      throw error
    })

const resolveSmokeGame = async () => {
  const generatedPlayable = await readJson(generatedPlayablePath, { games: [] })
  const generatedGames = Array.isArray(generatedPlayable.games)
    ? generatedPlayable.games.filter((game) => game?.id && game?.title)
    : []

  if (generatedGames.length === 0) {
    fail('Expected generated playable games before running event ingest smoke.')
  }

  const listingOptimizer = await readJson(storeListingOptimizerPath, {})
  const focusGameId = listingOptimizer.recommendation?.focusGameId
  return generatedGames.find((game) => game.id === focusGameId) ?? generatedGames[0]
}

const smokeGame = await resolveSmokeGame()
const smokeGameId = smokeGame.id
const smokeGameTitle = smokeGame.title

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'agl-event-ingest-'))
const inboxDir = path.join(tempRoot, 'inbox')
const dropDir = path.join(tempRoot, 'browser-downloads')
const downloadsDir = path.join(tempRoot, 'Downloads')
const outputDir = path.join(tempRoot, 'player-events')
const reportsDir = path.join(tempRoot, 'reports')
const bridgeOutput = path.join(tempRoot, 'local-event-bridge.json')
const bridgeTsOutput = path.join(tempRoot, 'localEventBridge.ts')
const bridgeReport = path.join(reportsDir, 'local-event-bridge.md')
const ingestOutput = path.join(tempRoot, 'event-ingest.json')
const ingestReport = path.join(reportsDir, 'event-ingest.md')
const analyticsOutput = path.join(tempRoot, 'analytics-rollup.json')
const analyticsReport = path.join(reportsDir, 'analytics-rollup.md')
const productionExportFile = path.join(tempRoot, 'posthog-production-export.json')
const productionOutputDir = path.join(tempRoot, 'production-player-events')
const productionEmptyImportDir = path.join(tempRoot, 'production-empty-imports')
const productionIngestOutput = path.join(tempRoot, 'production-event-ingest.json')
const productionIngestReport = path.join(reportsDir, 'production-event-ingest.md')
const productionAnalyticsOutput = path.join(tempRoot, 'production-analytics-rollup.json')
const productionAnalyticsReport = path.join(reportsDir, 'production-analytics-rollup.md')

try {
  await mkdir(inboxDir, { recursive: true })
  await mkdir(dropDir, { recursive: true })
  await mkdir(downloadsDir, { recursive: true })
  await mkdir(outputDir, { recursive: true })
  await mkdir(productionOutputDir, { recursive: true })
  await mkdir(productionEmptyImportDir, { recursive: true })
  await mkdir(reportsDir, { recursive: true })
  await mkdir(path.dirname(smokeOutputPath), { recursive: true })
  await mkdir(path.dirname(smokeReportPath), { recursive: true })

  const exportedEvents = [
    {
      id: 'smoke-view',
      name: 'game_viewed',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-a',
        sessionDate: '2026-05-17',
        email: 'remove-local@example.com',
        ipAddress: '203.0.113.10',
      },
      createdAt: '2026-05-17T10:00:00.000Z',
    },
    {
      id: 'smoke-start',
      name: 'game_started',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-a',
        sessionDate: '2026-05-17',
      },
      createdAt: '2026-05-17T10:01:00.000Z',
    },
    {
      id: 'smoke-tutorial',
      name: 'tutorial_completed',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-a',
        sessionDate: '2026-05-17',
      },
      createdAt: '2026-05-17T10:02:00.000Z',
    },
    {
      id: 'smoke-complete',
      name: 'level_completed',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-a',
        sessionDate: '2026-05-17',
      },
      createdAt: '2026-05-17T10:06:00.000Z',
    },
    {
      id: 'smoke-return',
      name: 'game_viewed',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-b',
        sessionDate: '2026-05-18',
      },
      createdAt: '2026-05-18T10:00:00.000Z',
    },
    {
      id: 'smoke-duplicate',
      name: 'game_viewed',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-b',
        sessionDate: '2026-05-18',
      },
      createdAt: '2026-05-18T10:00:00.000Z',
    },
    {
      id: 'smoke-duplicate',
      name: 'game_viewed',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-b',
        sessionDate: '2026-05-18',
      },
      createdAt: '2026-05-18T10:00:00.000Z',
    },
  ]

  await writeFile(path.join(dropDir, 'player-events-smoke.json'), JSON.stringify(exportedEvents, null, 2))

  await run(process.execPath, ['scripts/local-event-bridge.mjs'], {
    AGL_LOCAL_EVENT_DROP_DIRS: dropDir,
    AGL_EVENT_OUTPUT_DIR: outputDir,
    AGL_EVENT_INBOX_DIR: inboxDir,
    AGL_LOCAL_EVENT_BRIDGE_OUTPUT: bridgeOutput,
    AGL_LOCAL_EVENT_BRIDGE_TS_OUTPUT: bridgeTsOutput,
    AGL_LOCAL_EVENT_BRIDGE_REPORT: bridgeReport,
  })

  const bridge = JSON.parse(await readFile(bridgeOutput, 'utf8'))

  if (
    bridge.status !== 'bridge-ready-for-ingest' ||
    bridge.copiedFiles.length !== 1 ||
    bridge.inbox.validEvents !== 6 ||
    bridge.controls.noSyntheticEvents !== true ||
    bridge.controls.noExternalUpload !== true ||
    bridge.controls.piiStrippingEnabled !== true ||
    bridge.privacy.sensitivePropertiesDropped < 2
  ) {
    fail(`Expected local bridge to copy one explicit event drop into the inbox, got ${JSON.stringify(bridge)}`)
  }

  const sanitizedBridgeEvents = JSON.parse(await readFile(path.resolve(root, bridge.copiedFiles[0].targetPath), 'utf8'))

  if (sanitizedBridgeEvents.some((event) => event.properties.email || event.properties.ipAddress)) {
    fail(`Expected local bridge inbox copy to strip sensitive properties, got ${JSON.stringify(sanitizedBridgeEvents)}`)
  }

  await run(process.execPath, ['scripts/event-ingestor.mjs'], {
    AGL_EVENT_IMPORT_DIRS: inboxDir,
    AGL_EVENT_OUTPUT_DIR: outputDir,
    AGL_EVENT_INBOX_DIR: inboxDir,
    AGL_EVENT_INGEST_OUTPUT: ingestOutput,
    AGL_EVENT_INGEST_REPORT: ingestReport,
  })

  const ingest = JSON.parse(await readFile(ingestOutput, 'utf8'))

  if (ingest.status !== 'imported' || ingest.importedEvents !== 6 || ingest.importedFiles.length !== 1) {
    fail(`Expected one deduped import with 6 events, got ${JSON.stringify(ingest)}`)
  }

  await run(process.execPath, ['scripts/analytics-rollup.mjs'], {
    AGL_LOCAL_EVENTS_DIR: outputDir,
    AGL_ANALYTICS_OUTPUT: analyticsOutput,
    AGL_ANALYTICS_REPORT: analyticsReport,
  })

  const analytics = JSON.parse(await readFile(analyticsOutput, 'utf8'))
  const game = analytics.games.find((row) => row.gameId === smokeGameId)

  if (analytics.sourceStatus.activeSource !== 'local-event-drops') {
    fail(`Expected local-event-drops source, got ${analytics.sourceStatus.activeSource}`)
  }

  if (!game || game.counts.game_viewed !== 3 || game.counts.game_started !== 1 || game.counts.level_completed !== 1) {
    fail(`Expected local smoke game counts, got ${JSON.stringify(game)}`)
  }

  if (analytics.retention.source !== 'local-event-drops' || analytics.retention.d1Retention !== 1) {
    fail(`Expected local D1 retention of 1, got ${JSON.stringify(analytics.retention)}`)
  }

  const incrementalEvents = [
    ...exportedEvents,
    {
      id: 'smoke-second-start',
      name: 'game_started',
      properties: {
        gameId: smokeGameId,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-b',
        sessionDate: '2026-05-18',
      },
      createdAt: '2026-05-18T10:01:00.000Z',
    },
  ]

  await writeFile(
    path.join(dropDir, 'player-events-smoke-incremental.json'),
    JSON.stringify(incrementalEvents, null, 2),
  )

  await run(process.execPath, ['scripts/local-event-bridge.mjs'], {
    AGL_LOCAL_EVENT_DROP_DIRS: dropDir,
    AGL_EVENT_OUTPUT_DIR: outputDir,
    AGL_EVENT_INBOX_DIR: inboxDir,
    AGL_LOCAL_EVENT_BRIDGE_OUTPUT: bridgeOutput,
    AGL_LOCAL_EVENT_BRIDGE_TS_OUTPUT: bridgeTsOutput,
    AGL_LOCAL_EVENT_BRIDGE_REPORT: bridgeReport,
  })

  const incrementalBridge = JSON.parse(await readFile(bridgeOutput, 'utf8'))

  if (incrementalBridge.status !== 'bridge-ready-for-ingest' || incrementalBridge.copiedFiles.length !== 1) {
    fail(`Expected local bridge to copy only the incremental event drop, got ${JSON.stringify(incrementalBridge)}`)
  }

  await run(process.execPath, ['scripts/event-ingestor.mjs'], {
    AGL_EVENT_IMPORT_DIRS: inboxDir,
    AGL_EVENT_OUTPUT_DIR: outputDir,
    AGL_EVENT_INBOX_DIR: inboxDir,
    AGL_EVENT_INGEST_OUTPUT: ingestOutput,
    AGL_EVENT_INGEST_REPORT: ingestReport,
  })

  const incrementalIngest = JSON.parse(await readFile(ingestOutput, 'utf8'))

  if (
    incrementalIngest.status !== 'imported' ||
    incrementalIngest.importedEvents !== 1 ||
    incrementalIngest.duplicateEvents < 12 ||
    incrementalIngest.importedFiles.length !== 1 ||
    incrementalIngest.importedFiles[0]?.duplicateEvents !== 6
  ) {
    fail(`Expected incremental ingest to persist only 1 new event, got ${JSON.stringify(incrementalIngest)}`)
  }

  await run(process.execPath, ['scripts/analytics-rollup.mjs'], {
    AGL_LOCAL_EVENTS_DIR: outputDir,
    AGL_ANALYTICS_OUTPUT: analyticsOutput,
    AGL_ANALYTICS_REPORT: analyticsReport,
  })

  const incrementalAnalytics = JSON.parse(await readFile(analyticsOutput, 'utf8'))
  const incrementalGame = incrementalAnalytics.games.find((row) => row.gameId === smokeGameId)

  if (
    incrementalAnalytics.sourceStatus.localEventDrops.events !== 7 ||
    incrementalAnalytics.sourceStatus.localEventDrops.duplicateEvents !== 0 ||
    incrementalGame?.counts.game_viewed !== 3 ||
    incrementalGame?.counts.game_started !== 2 ||
    incrementalGame?.counts.level_completed !== 1
  ) {
    fail(`Expected event-level deduped analytics after incremental import, got ${JSON.stringify(incrementalAnalytics)}`)
  }

  const downloadedGateSampleEvents = [
    {
      id: 'smoke-gate-sample-click',
      name: 'gate_sample_mission_clicked',
      properties: {
        gameId: smokeGameId,
        gateId: 'firstGameCompletion',
        campaignId: 'gate-sample-smoke-firstGameCompletion',
        acquisitionSource: 'gate_sample',
        acquisitionCampaign: 'gate-sample-smoke-firstGameCompletion',
        acquisitionChannel: 'product-gate-sample',
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-c',
        sessionDate: '2026-05-18',
        phone: '+1-555-0100',
      },
      createdAt: '2026-05-18T11:00:00.000Z',
    },
    {
      id: 'smoke-gate-sample-start',
      name: 'game_started',
      properties: {
        gameId: smokeGameId,
        acquisitionSource: 'gate_sample',
        acquisitionCampaign: 'gate-sample-smoke-firstGameCompletion',
        acquisitionChannel: 'product-gate-sample',
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-c',
        sessionDate: '2026-05-18',
      },
      createdAt: '2026-05-18T11:01:00.000Z',
    },
    {
      id: 'smoke-gate-sample-export',
      name: 'analytics_exported',
      properties: {
        gameId: smokeGameId,
        gateId: 'firstGameCompletion',
        campaignId: 'gate-sample-smoke-firstGameCompletion',
        acquisitionSource: 'gate_sample',
        acquisitionCampaign: 'gate-sample-smoke-firstGameCompletion',
        acquisitionChannel: 'product-gate-sample',
        exportSurface: 'product-gate-sample',
        eventCountAtExport: 3,
        unexportedEventsBeforeExport: 3,
        exportedEventCountBeforeExport: 0,
        exportCoverageStatusBeforeExport: 'waiting-for-first-export',
        exportDebtThreshold: 12,
        exportAgeThresholdHours: 24,
        anonymousId: 'anon-smoke',
        sessionId: 'session-smoke-c',
        sessionDate: '2026-05-18',
      },
      createdAt: '2026-05-18T11:02:00.000Z',
    },
  ]

  await writeFile(
    path.join(downloadsDir, 'player-events-downloads-gate-sample.json'),
    JSON.stringify(downloadedGateSampleEvents, null, 2),
  )

  await run(process.execPath, ['scripts/local-event-bridge.mjs'], {
    HOME: tempRoot,
    AGL_LOCAL_EVENT_IMPORT_DOWNLOADS: 'true',
    AGL_EVENT_OUTPUT_DIR: outputDir,
    AGL_EVENT_INBOX_DIR: inboxDir,
    AGL_LOCAL_EVENT_BRIDGE_OUTPUT: bridgeOutput,
    AGL_LOCAL_EVENT_BRIDGE_TS_OUTPUT: bridgeTsOutput,
    AGL_LOCAL_EVENT_BRIDGE_REPORT: bridgeReport,
  })

  const downloadsBridge = JSON.parse(await readFile(bridgeOutput, 'utf8'))

  if (
    downloadsBridge.copiedFiles.length !== 1 ||
    downloadsBridge.controls.downloadsFolderImportEnabled !== true ||
    downloadsBridge.explicitDownloadsScan?.status !== 'evidence-found' ||
    downloadsBridge.explicitDownloadsScan?.evidenceFound !== true ||
    downloadsBridge.explicitDownloadsScan?.copiedFiles !== 1 ||
    downloadsBridge.explicitDownloadsScan?.sensitivePropertiesDropped < 1 ||
    downloadsBridge.privacy.sensitivePropertiesDropped < 1 ||
    !downloadsBridge.sourceDirectories.some((directory) => directory.role === 'downloads-opt-in') ||
    downloadsBridge.gateSampleEvidence.inbox.events < downloadedGateSampleEvents.length ||
    downloadsBridge.gateSampleEvidence.inbox.campaigns[0]?.campaignId !==
      'gate-sample-smoke-firstGameCompletion' ||
    downloadsBridge.exportCoverage.inbox.coverageReceipts < 1 ||
    downloadsBridge.exportCoverage.readyForIngest !== true
  ) {
    fail(`Expected opt-in Downloads import to copy gate-sample evidence, got ${JSON.stringify(downloadsBridge)}`)
  }

  await run(process.execPath, ['scripts/local-event-bridge.mjs'], {
    HOME: tempRoot,
    AGL_EVENT_OUTPUT_DIR: outputDir,
    AGL_EVENT_INBOX_DIR: inboxDir,
    AGL_LOCAL_EVENT_BRIDGE_OUTPUT: bridgeOutput,
    AGL_LOCAL_EVENT_BRIDGE_TS_OUTPUT: bridgeTsOutput,
    AGL_LOCAL_EVENT_BRIDGE_REPORT: bridgeReport,
  })

  const followupBridge = JSON.parse(await readFile(bridgeOutput, 'utf8'))

  if (
    followupBridge.controls.downloadsFolderImportEnabled !== false ||
    followupBridge.explicitDownloadsScan?.status !== 'evidence-found' ||
    followupBridge.explicitDownloadsScan?.evidenceFound !== true ||
    followupBridge.explicitDownloadsScan?.scannedAt !== downloadsBridge.explicitDownloadsScan.scannedAt
  ) {
    fail(`Expected non-download bridge run to preserve the last explicit Downloads scan, got ${JSON.stringify(followupBridge)}`)
  }

  const productionExport = {
    columns: ['event', 'timestamp', 'properties', 'distinct_id', 'uuid'],
    results: [
      [
        'game_viewed',
        '2026-05-19T09:00:00.000Z',
        {
          gameId: smokeGameId,
          email: 'production-owner@example.com',
        },
        'production-player@example.com',
        'production-view',
      ],
      [
        'game_started',
        '2026-05-19T09:01:00.000Z',
        {
          gameId: smokeGameId,
        },
        'production-player@example.com',
        'production-start',
      ],
      [
        'level_completed',
        '2026-05-19T09:06:00.000Z',
        {
          gameId: smokeGameId,
        },
        'production-player@example.com',
        'production-complete',
      ],
      [
        'game_viewed',
        '2026-05-20T09:00:00.000Z',
        {
          gameId: smokeGameId,
        },
        'production-player@example.com',
        'production-return',
      ],
    ],
  }

  await writeFile(productionExportFile, JSON.stringify(productionExport, null, 2))

  await run(process.execPath, ['scripts/event-ingestor.mjs'], {
    AGL_PRODUCTION_EVENT_EXPORT_FILES: productionExportFile,
    AGL_EVENT_IMPORT_DIRS: productionEmptyImportDir,
    AGL_EVENT_OUTPUT_DIR: productionOutputDir,
    AGL_EVENT_INBOX_DIR: productionEmptyImportDir,
    AGL_EVENT_INGEST_OUTPUT: productionIngestOutput,
    AGL_EVENT_INGEST_REPORT: productionIngestReport,
  })

  const productionIngest = JSON.parse(await readFile(productionIngestOutput, 'utf8'))
  const productionImportedPath = productionIngest.importedFiles[0]?.targetPath
    ? path.resolve(root, productionIngest.importedFiles[0].targetPath)
    : null
  const productionImportedEvents = productionImportedPath
    ? JSON.parse(await readFile(productionImportedPath, 'utf8'))
    : []

  if (
    productionIngest.status !== 'imported' ||
    productionIngest.manualProductionExports?.mode !== 'explicit-file-only' ||
    productionIngest.manualProductionExports?.pathsConfigured !== 1 ||
    productionIngest.manualProductionExports?.importedEvents !== 4 ||
    productionIngest.manualProductionExports?.controls?.explicitFileOnly !== true ||
    productionIngest.manualProductionExports?.controls?.noDownloadsScan !== true ||
    productionIngest.manualProductionExports?.controls?.externalIdentifiersHashed !== true ||
    productionIngest.privacy?.sensitivePropertiesDropped < 1 ||
    productionIngest.privacy?.externalIdentifiersHashed !== 4 ||
    productionImportedEvents.some((event) => JSON.stringify(event).includes('production-player@example.com')) ||
    productionImportedEvents.some((event) => event.properties.email) ||
    !productionImportedEvents.every((event) => String(event.properties.anonymousId ?? '').startsWith('external-'))
  ) {
    fail(`Expected explicit production export import to sanitize and hash identifiers, got ${JSON.stringify(productionIngest)}`)
  }

  await run(process.execPath, ['scripts/analytics-rollup.mjs'], {
    AGL_LOCAL_EVENTS_DIR: productionOutputDir,
    AGL_ANALYTICS_OUTPUT: productionAnalyticsOutput,
    AGL_ANALYTICS_REPORT: productionAnalyticsReport,
  })

  const productionAnalytics = JSON.parse(await readFile(productionAnalyticsOutput, 'utf8'))
  const productionGame = productionAnalytics.games.find((row) => row.gameId === smokeGameId)

  if (
    productionAnalytics.sourceStatus.activeSource !== 'local-event-drops' ||
    productionAnalytics.retention.source !== 'local-event-drops' ||
    productionAnalytics.retention.d1Retention !== 1 ||
    productionGame?.counts.game_viewed !== 2 ||
    productionGame?.counts.game_started !== 1 ||
    productionGame?.counts.level_completed !== 1
  ) {
    fail(`Expected explicit production export to roll up like local evidence, got ${JSON.stringify(productionAnalytics)}`)
  }

  const smoke = {
    generatedAt: new Date().toISOString(),
    status: 'pass',
    fixture: {
      sourceFile: 'player-events-smoke.json',
      exportedEvents: exportedEvents.length,
      uniqueEvents: 6,
      gameId: smokeGameId,
      title: smokeGameTitle,
      gameSourceFile: 'data/generated-playable-games.json',
    },
    bridge: {
      status: bridge.status,
      copiedFiles: bridge.copiedFiles.length,
      inboxValidEvents: bridge.inbox.validEvents,
      noSyntheticEvents: bridge.controls.noSyntheticEvents,
      noExternalUpload: bridge.controls.noExternalUpload,
      downloadsOptInCommand: bridge.eventDropContract.downloadsImportCommand,
      sensitivePropertiesDropped: bridge.privacy.sensitivePropertiesDropped,
      piiStrippingEnabled: bridge.privacy.piiStrippingEnabled,
      inboxWritesSanitizedEvents: bridge.privacy.inboxWritesSanitizedEvents,
    },
    downloadsBridge: {
      copiedFiles: downloadsBridge.copiedFiles.length,
      downloadsImportEnabled: downloadsBridge.controls.downloadsFolderImportEnabled,
      explicitScanStatus: downloadsBridge.explicitDownloadsScan.status,
      explicitScanEvidenceFound: downloadsBridge.explicitDownloadsScan.evidenceFound,
      explicitScanCopiedFiles: downloadsBridge.explicitDownloadsScan.copiedFiles,
      sensitivePropertiesDropped: downloadsBridge.privacy.sensitivePropertiesDropped,
      gateSampleEvents: downloadsBridge.gateSampleEvidence.inbox.events,
      campaignId: downloadsBridge.gateSampleEvidence.inbox.campaigns[0]?.campaignId,
      exportCoverageReceipts: downloadsBridge.exportCoverage.inbox.coverageReceipts,
      exportCoverageReadyForIngest: downloadsBridge.exportCoverage.readyForIngest,
    },
    followupBridge: {
      downloadsImportEnabled: followupBridge.controls.downloadsFolderImportEnabled,
      explicitScanStatus: followupBridge.explicitDownloadsScan.status,
      explicitScanEvidenceFound: followupBridge.explicitDownloadsScan.evidenceFound,
      preservedScanAt: followupBridge.explicitDownloadsScan.scannedAt,
    },
    ingest: {
      status: ingest.status,
      importedEvents: ingest.importedEvents,
      importedFiles: ingest.importedFiles.length,
      outputDirectory: ingest.outputDirectory,
      piiStrippingEnabled: ingest.privacy.piiStrippingEnabled,
      importedFilesAreSanitized: ingest.privacy.importedFilesAreSanitized,
    },
    incrementalIngest: {
      status: incrementalIngest.status,
      importedEvents: incrementalIngest.importedEvents,
      importedFiles: incrementalIngest.importedFiles.length,
      duplicateEvents: incrementalIngest.duplicateEvents,
      importedFileDuplicateEvents: incrementalIngest.importedFiles[0]?.duplicateEvents ?? 0,
    },
    productionExport: {
      status: productionIngest.status,
      mode: productionIngest.manualProductionExports.mode,
      pathsConfigured: productionIngest.manualProductionExports.pathsConfigured,
      importedEvents: productionIngest.manualProductionExports.importedEvents,
      sensitivePropertiesDropped: productionIngest.privacy.sensitivePropertiesDropped,
      externalIdentifiersHashed: productionIngest.privacy.externalIdentifiersHashed,
      explicitFileOnly: productionIngest.manualProductionExports.controls.explicitFileOnly,
      noDownloadsScan: productionIngest.manualProductionExports.controls.noDownloadsScan,
      command: productionIngest.manualProductionExports.command,
      activeSource: productionAnalytics.sourceStatus.activeSource,
      d1Retention: productionAnalytics.retention.d1Retention,
    },
    analytics: {
      activeSource: incrementalAnalytics.sourceStatus.activeSource,
      localEventFiles: incrementalAnalytics.sourceStatus.localEventDrops.files,
      localEvents: incrementalAnalytics.sourceStatus.localEventDrops.events,
      duplicateEvents: incrementalAnalytics.sourceStatus.localEventDrops.duplicateEvents,
      retentionSource: incrementalAnalytics.retention.source,
      d1Retention: incrementalAnalytics.retention.d1Retention,
      counts: {
        game_viewed: incrementalGame.counts.game_viewed,
        game_started: incrementalGame.counts.game_started,
        tutorial_completed: incrementalGame.counts.tutorial_completed,
        level_completed: incrementalGame.counts.level_completed,
      },
      metrics: {
        startRate: incrementalGame.metrics.startRate,
        tutorialCompletion: incrementalGame.metrics.tutorialCompletion,
        firstGameCompletion: incrementalGame.metrics.firstGameCompletion,
      },
    },
  }

  const report = [
    '# Event Ingest Smoke',
    '',
    `Generated: ${smoke.generatedAt}`,
    `Status: ${smoke.status}`,
    '',
    '## Ingest',
    '',
    `- Smoke game: ${smoke.fixture.title} (${smoke.fixture.gameId})`,
    `- Bridge status: ${smoke.bridge.status}`,
    `- Bridge copied files: ${smoke.bridge.copiedFiles}`,
    `- Bridge sensitive properties stripped: ${smoke.bridge.sensitivePropertiesDropped}`,
    `- Status: ${smoke.ingest.status}`,
    `- Imported events: ${smoke.ingest.importedEvents}`,
    `- Imported files: ${smoke.ingest.importedFiles}`,
    `- Incremental imported events: ${smoke.incrementalIngest.importedEvents}`,
    `- Incremental duplicate events skipped: ${smoke.incrementalIngest.duplicateEvents}`,
    `- Downloads opt-in copied files: ${smoke.downloadsBridge.copiedFiles}`,
    `- Downloads explicit scan: ${smoke.downloadsBridge.explicitScanStatus}`,
    `- Downloads sensitive properties stripped: ${smoke.downloadsBridge.sensitivePropertiesDropped}`,
    `- Follow-up preserved scan: ${smoke.followupBridge.explicitScanStatus}`,
    `- Downloads gate-sample events: ${smoke.downloadsBridge.gateSampleEvents}`,
    `- Downloads export coverage receipts: ${smoke.downloadsBridge.exportCoverageReceipts}`,
    `- Production export imported events: ${smoke.productionExport.importedEvents}`,
    `- Production export external identifiers hashed: ${smoke.productionExport.externalIdentifiersHashed}`,
    `- Production export command: ${smoke.productionExport.command}`,
    '',
    '## Analytics',
    '',
    `- Active source: ${smoke.analytics.activeSource}`,
    `- Local events: ${smoke.analytics.localEvents}`,
    `- D1 retention: ${smoke.analytics.d1Retention}`,
    `- ${smoke.fixture.title} starts: ${smoke.analytics.counts.game_started}`,
    `- ${smoke.fixture.title} completions: ${smoke.analytics.counts.level_completed}`,
    '',
  ]

  await writeFile(smokeOutputPath, JSON.stringify(smoke, null, 2) + '\n')
  await writeFile(smokeReportPath, report.join('\n'))

  console.log(`Wrote ${path.relative(root, smokeOutputPath)}`)
  console.log(`Wrote ${path.relative(root, smokeReportPath)}`)
  console.log('Event ingest smoke passed: exported events imported and rolled up from local-event-drops.')
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
