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
    bridge.controls.noExternalUpload !== true
  ) {
    fail(`Expected local bridge to copy one explicit event drop into the inbox, got ${JSON.stringify(bridge)}`)
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
    },
    ingest: {
      status: ingest.status,
      importedEvents: ingest.importedEvents,
      importedFiles: ingest.importedFiles.length,
      outputDirectory: ingest.outputDirectory,
    },
    analytics: {
      activeSource: analytics.sourceStatus.activeSource,
      localEventFiles: analytics.sourceStatus.localEventDrops.files,
      localEvents: analytics.sourceStatus.localEventDrops.events,
      retentionSource: analytics.retention.source,
      d1Retention: analytics.retention.d1Retention,
      counts: {
        game_viewed: game.counts.game_viewed,
        game_started: game.counts.game_started,
        tutorial_completed: game.counts.tutorial_completed,
        level_completed: game.counts.level_completed,
      },
      metrics: {
        startRate: game.metrics.startRate,
        tutorialCompletion: game.metrics.tutorialCompletion,
        firstGameCompletion: game.metrics.firstGameCompletion,
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
    `- Status: ${smoke.ingest.status}`,
    `- Imported events: ${smoke.ingest.importedEvents}`,
    `- Imported files: ${smoke.ingest.importedFiles}`,
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
