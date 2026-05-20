import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

const root = process.cwd()
const smokeOutputPath = path.join(root, 'data', 'event-ingest-smoke.json')
const smokeReportPath = path.join(root, 'reports', 'event-ingest-smoke-latest.md')

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

try {
  await mkdir(inboxDir, { recursive: true })
  await mkdir(dropDir, { recursive: true })
  await mkdir(downloadsDir, { recursive: true })
  await mkdir(outputDir, { recursive: true })
  await mkdir(reportsDir, { recursive: true })
  await mkdir(path.dirname(smokeOutputPath), { recursive: true })
  await mkdir(path.dirname(smokeReportPath), { recursive: true })

  const exportedEvents = [
    {
      id: 'smoke-view',
      name: 'game_viewed',
      properties: {
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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
  const game = analytics.games.find((row) => row.gameId === 'mosaic-haven')

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
        gameId: 'mosaic-haven',
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
  const incrementalGame = incrementalAnalytics.games.find((row) => row.gameId === 'mosaic-haven')

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
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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
        gameId: 'mosaic-haven',
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

  const smoke = {
    generatedAt: new Date().toISOString(),
    status: 'pass',
    fixture: {
      sourceFile: 'player-events-smoke.json',
      exportedEvents: exportedEvents.length,
      uniqueEvents: 6,
      gameId: 'mosaic-haven',
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
    '',
    '## Analytics',
    '',
    `- Active source: ${smoke.analytics.activeSource}`,
    `- Local events: ${smoke.analytics.localEvents}`,
    `- D1 retention: ${smoke.analytics.d1Retention}`,
    `- Mosaic Haven starts: ${smoke.analytics.counts.game_started}`,
    `- Mosaic Haven completions: ${smoke.analytics.counts.level_completed}`,
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
