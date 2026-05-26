import { spawn } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import worker from '../ops/cloudflare/event-collector-worker.mjs'

const root = process.cwd()
const smokeOutputPath = path.join(root, 'data', 'event-collector-smoke.json')
const smokeReportPath = path.join(root, 'reports', 'event-collector-smoke-latest.md')
const generatedPlayablePath = path.join(root, 'data', 'generated-playable-games.json')
const storeListingOptimizerPath = path.join(root, 'data', 'store-listing-optimizer.json')

class MemoryR2Object {
  constructor(value) {
    this.value = value
  }

  async text() {
    return this.value
  }
}

class MemoryR2Bucket {
  constructor() {
    this.objects = new Map()
  }

  async put(key, value) {
    this.objects.set(key, String(value))
  }

  async get(key) {
    const value = this.objects.get(key)
    return value ? new MemoryR2Object(value) : null
  }

  async list({ prefix = '', limit = 1_000 } = {}) {
    return {
      objects: [...this.objects.keys()]
        .filter((key) => key.startsWith(prefix))
        .sort()
        .slice(0, limit)
        .map((key) => ({ key })),
    }
  }
}

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
    fail('Expected generated playable games before running event collector smoke.')
  }

  const listingOptimizer = await readJson(storeListingOptimizerPath, {})
  const focusGameId = listingOptimizer.recommendation?.focusGameId
  return generatedGames.find((game) => game.id === focusGameId) ?? generatedGames[0]
}

const env = {
  EVENT_BUCKET: new MemoryR2Bucket(),
  ALLOWED_ORIGINS: 'https://autonomous.example/project-page',
  PUBLIC_WRITE_TOKEN: 'public-smoke-token',
  ADMIN_EXPORT_TOKEN: 'admin-smoke-token',
}

const smokeGame = await resolveSmokeGame()
const smokeGameId = smokeGame.id
const smokeGameTitle = smokeGame.title

const exportedEvents = [
  {
    id: 'collector-view-a',
    name: 'game_viewed',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      email: 'remove@example.com',
    },
    createdAt: '2026-05-17T09:00:00.000Z',
  },
  {
    id: 'collector-gate-sample',
    name: 'gate_sample_mission_clicked',
    properties: {
      gameId: smokeGameId,
      gateId: 'firstGameCompletion',
      campaignId: 'gate-sample-smoke',
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      costUsd: 0,
      noSyntheticEvents: true,
    },
    createdAt: '2026-05-17T09:00:30.000Z',
  },
  {
    id: 'collector-sample-next-viewed',
    name: 'sample_next_viewed',
    properties: {
      gameId: smokeGameId,
      gateId: 'firstGameCompletion',
      campaignId: 'gate-sample-smoke',
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      zeroPaidSpend: true,
      noSyntheticEvents: true,
      noRevenueEnablement: true,
    },
    createdAt: '2026-05-17T09:00:35.000Z',
  },
  {
    id: 'collector-sample-next-routed',
    name: 'sample_next_routed',
    properties: {
      gameId: smokeGameId,
      gateId: 'firstGameCompletion',
      campaignId: 'gate-sample-smoke',
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      zeroPaidSpend: true,
      noSyntheticEvents: true,
      noRevenueEnablement: true,
    },
    createdAt: '2026-05-17T09:00:40.000Z',
  },
  {
    id: 'collector-sample-fastest-viewed',
    name: 'sample_fastest_viewed',
    properties: {
      gameId: smokeGameId,
      gateId: 'd1Retention',
      campaignId: 'gate-sample-smoke-fastest',
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      zeroPaidSpend: true,
      noSyntheticEvents: true,
      noRevenueEnablement: true,
    },
    createdAt: '2026-05-17T09:00:42.000Z',
  },
  {
    id: 'collector-sample-fastest-routed',
    name: 'sample_fastest_routed',
    properties: {
      gameId: smokeGameId,
      gateId: 'd1Retention',
      campaignId: 'gate-sample-smoke-fastest',
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      zeroPaidSpend: true,
      noSyntheticEvents: true,
      noRevenueEnablement: true,
    },
    createdAt: '2026-05-17T09:00:45.000Z',
  },
  {
    id: 'collector-local-router-share',
    name: 'local_router_share_clicked',
    properties: {
      gameId: smokeGameId,
      campaignId: 'gate-sample-smoke',
      gateId: 'firstGameCompletion',
      recommendationId: 'first-completion-sample',
      actionType: 'gate-sample',
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      zeroPaidSpend: true,
      noPaidTraffic: true,
      noSyntheticEvents: true,
      noRevenueEnablement: true,
    },
    createdAt: '2026-05-17T09:00:45.000Z',
  },
  {
    id: 'collector-owner-unlock-pack',
    name: 'owner_unlock_pack_copied',
    properties: {
      copyType: 'local-env-template',
      inputCount: 2,
      secretInputCount: 0,
      unlockIds: 'production-analytics-browser+support-contact',
      localEnvFile: '.env.production.local',
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      zeroPaidSpend: true,
      noSecretValuesStored: true,
      noGithubMutation: true,
    },
    createdAt: '2026-05-17T09:00:50.000Z',
  },
  {
    id: 'collector-game-card-play',
    name: 'game_card_play_clicked',
    properties: {
      gameId: smokeGameId,
      title: smokeGameTitle,
      status: 'live',
      surface: 'release_pipeline',
      thumbnailVariantId: 'board-state',
      releasePipelineCreatesFreshRun: true,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      zeroPaidSpend: true,
    },
    createdAt: '2026-05-17T09:00:55.000Z',
  },
  {
    id: 'collector-start',
    name: 'game_started',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:01:00.000Z',
  },
  {
    id: 'collector-first-move-coach',
    name: 'first_move_coach_shown',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:01:20.000Z',
  },
  {
    id: 'collector-tutorial',
    name: 'tutorial_completed',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:02:00.000Z',
  },
  {
    id: 'collector-completion-nudge',
    name: 'completion_nudge_viewed',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:03:00.000Z',
  },
  {
    id: 'collector-replay-prompt',
    name: 'replay_prompt_clicked',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:04:00.000Z',
  },
  {
    id: 'collector-complete',
    name: 'level_completed',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:05:00.000Z',
  },
  {
    id: 'collector-daily-return',
    name: 'daily_return_prompt_clicked',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:06:00.000Z',
  },
  {
    id: 'collector-pwa-available',
    name: 'pwa_install_prompt_available',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      displayMode: 'browser',
      cooldownActive: false,
      alreadyInstalled: false,
    },
    createdAt: '2026-05-17T09:06:40.000Z',
  },
  {
    id: 'collector-pwa-install',
    name: 'pwa_install_prompt_clicked',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:07:00.000Z',
  },
  {
    id: 'collector-pwa-cooldown',
    name: 'pwa_install_prompt_cooldown',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
      displayMode: 'browser',
      cooldownDays: 14,
    },
    createdAt: '2026-05-17T09:07:30.000Z',
  },
  {
    id: 'collector-view-b',
    name: 'game_viewed',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-b',
      sessionDate: '2026-05-18',
    },
    createdAt: '2026-05-18T09:00:00.000Z',
  },
]

const postResponse = await worker.fetch(
  new Request('https://collector.example/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://autonomous.example',
      'X-AGL-Write-Token': env.PUBLIC_WRITE_TOKEN,
    },
    body: JSON.stringify({ source: 'web-pwa', events: exportedEvents }),
  }),
  env,
)
const postPayload = await postResponse.json()

if (postResponse.status !== 202 || postPayload.status !== 'accepted' || postPayload.events !== exportedEvents.length) {
  fail(`Expected accepted collector POST, got ${postResponse.status} ${JSON.stringify(postPayload)}`)
}

const beaconEvents = [
  {
    id: 'collector-beacon-abandoned',
    name: 'game_abandoned',
    properties: {
      gameId: smokeGameId,
      anonymousId: 'anon-collector',
      sessionId: 'session-collector-a',
      sessionDate: '2026-05-17',
    },
    createdAt: '2026-05-17T09:08:00.000Z',
  },
]
const beaconResponse = await worker.fetch(
  new Request('https://collector.example/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
      Origin: 'https://autonomous.example',
    },
    body: JSON.stringify({ source: 'web-pwa-beacon', writeToken: env.PUBLIC_WRITE_TOKEN, events: beaconEvents }),
  }),
  env,
)
const beaconPayload = await beaconResponse.json()

if (beaconResponse.status !== 202 || beaconPayload.status !== 'accepted' || beaconPayload.events !== beaconEvents.length) {
  fail(`Expected accepted collector beacon POST, got ${beaconResponse.status} ${JSON.stringify(beaconPayload)}`)
}

const expectedCollectorEvents = exportedEvents.length + beaconEvents.length

const exportResponse = await worker.fetch(
  new Request('https://collector.example/events/export?limit=20', {
    headers: {
      Authorization: `Bearer ${env.ADMIN_EXPORT_TOKEN}`,
    },
  }),
  env,
)
const exportPayload = await exportResponse.json()

if (exportResponse.status !== 200 || exportPayload.events?.length !== expectedCollectorEvents) {
  fail(`Expected collector export with ${expectedCollectorEvents} events, got ${JSON.stringify(exportPayload)}`)
}

if (exportPayload.events.some((event) => event.properties?.email)) {
  fail('Collector export leaked a sensitive email property.')
}

const summaryResponse = await worker.fetch(
  new Request('https://collector.example/events/summary?limit=20', {
    headers: {
      Authorization: `Bearer ${env.ADMIN_EXPORT_TOKEN}`,
    },
  }),
  env,
)
const summaryPayload = await summaryResponse.json()
const summaryText = JSON.stringify(summaryPayload)
const ownerUnlockEventsWithoutGame = 1

if (
  summaryResponse.status !== 200 ||
  summaryPayload.controls?.aggregateOnly !== true ||
  summaryPayload.controls?.rawEventsReturned !== false ||
  summaryPayload.events?.total !== expectedCollectorEvents ||
  summaryPayload.events?.byName?.game_started !== 1 ||
  summaryPayload.events?.byName?.game_card_play_clicked !== 1 ||
  summaryPayload.events?.byName?.level_completed !== 1 ||
  summaryPayload.events?.byName?.owner_unlock_pack_copied !== ownerUnlockEventsWithoutGame ||
  summaryPayload.events?.byGame?.[smokeGameId] !== expectedCollectorEvents - ownerUnlockEventsWithoutGame ||
  summaryPayload.events?.byCampaign?.['gate-sample-smoke'] !== 4 ||
  summaryPayload.events?.byGate?.firstGameCompletion !== 4 ||
  summaryPayload.events?.bySessionDate?.['2026-05-17'] !== expectedCollectorEvents - 1 ||
  summaryPayload.files?.included !== exportPayload.files.length ||
  summaryText.includes('anon-collector') ||
  summaryText.includes('session-collector') ||
  summaryText.includes('collector-start') ||
  Array.isArray(summaryPayload.events)
) {
  fail(`Expected aggregate-only collector summary, got ${summaryResponse.status} ${JSON.stringify(summaryPayload)}`)
}

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'agl-event-collector-'))
const outputDir = path.join(tempRoot, 'player-events')
const emptyImportDir = path.join(tempRoot, 'empty-imports')
const ingestOutput = path.join(tempRoot, 'event-ingest.json')
const ingestReport = path.join(tempRoot, 'event-ingest.md')
const analyticsOutput = path.join(tempRoot, 'analytics-rollup.json')
const analyticsReport = path.join(tempRoot, 'analytics-rollup.md')

try {
  await mkdir(outputDir, { recursive: true })
  await mkdir(emptyImportDir, { recursive: true })
  await mkdir(path.dirname(smokeOutputPath), { recursive: true })
  await mkdir(path.dirname(smokeReportPath), { recursive: true })

  const exportUrl = `data:application/json,${encodeURIComponent(JSON.stringify(exportPayload))}`

  await run(process.execPath, ['scripts/event-ingestor.mjs'], {
    AGL_EVENT_COLLECTOR_EXPORT_URL: exportUrl,
    AGL_EVENT_IMPORT_DIRS: emptyImportDir,
    AGL_EVENT_OUTPUT_DIR: outputDir,
    AGL_EVENT_INBOX_DIR: emptyImportDir,
    AGL_EVENT_INGEST_OUTPUT: ingestOutput,
    AGL_EVENT_INGEST_REPORT: ingestReport,
  })

  const ingest = JSON.parse(await readFile(ingestOutput, 'utf8'))

  if (ingest.status !== 'imported' || ingest.importedEvents !== expectedCollectorEvents) {
    fail(`Expected collector events to import, got ${JSON.stringify(ingest)}`)
  }

  await run(process.execPath, ['scripts/analytics-rollup.mjs'], {
    AGL_LOCAL_EVENTS_DIR: outputDir,
    AGL_ANALYTICS_OUTPUT: analyticsOutput,
    AGL_ANALYTICS_REPORT: analyticsReport,
  })

  const analytics = JSON.parse(await readFile(analyticsOutput, 'utf8'))
  const game = analytics.games.find((row) => row.gameId === smokeGameId)

  if (
    analytics.sourceStatus.activeSource !== 'local-event-drops' ||
    analytics.retention.source !== 'local-event-drops' ||
    analytics.retention.d1Retention !== 1 ||
    game?.counts.game_started !== 1 ||
    game?.counts.game_card_play_clicked !== 1 ||
    game?.counts.gate_sample_mission_clicked !== 1 ||
    game?.counts.sample_next_viewed !== 1 ||
    game?.counts.sample_next_routed !== 1 ||
    game?.counts.sample_fastest_viewed !== 1 ||
    game?.counts.sample_fastest_routed !== 1 ||
    game?.counts.local_router_share_clicked !== 1 ||
    game?.counts.first_move_coach_shown !== 1 ||
    game?.counts.completion_nudge_viewed !== 1 ||
    game?.counts.replay_prompt_clicked !== 1 ||
    game?.counts.daily_return_prompt_clicked !== 1 ||
    game?.counts.pwa_install_prompt_available !== 1 ||
    game?.counts.pwa_install_prompt_clicked !== 1 ||
    game?.counts.pwa_install_prompt_cooldown !== 1 ||
    game?.counts.level_completed !== 1
  ) {
    fail(`Expected collector events to roll up into local analytics, got ${JSON.stringify(analytics)}`)
  }

  const smoke = {
    generatedAt: new Date().toISOString(),
    status: 'pass',
    fixture: {
      sourceFile: 'data/generated-playable-games.json',
      gameId: smokeGameId,
      title: smokeGameTitle,
    },
    collector: {
      postStatus: postPayload.status,
      beaconStatus: beaconPayload.status,
      storedEvents: postPayload.events + beaconPayload.events,
      exportedEvents: exportPayload.events.length,
      files: exportPayload.files.length,
      summaryStatus: summaryResponse.status,
      summaryEvents: summaryPayload.events.total,
      summaryFilesIncluded: summaryPayload.files.included,
      ownerUnlockPackCopied: summaryPayload.events.byName.owner_unlock_pack_copied ?? 0,
      summaryAggregateOnly: summaryPayload.controls.aggregateOnly,
      summaryRawEventsReturned: summaryPayload.controls.rawEventsReturned,
      piiStripped: true,
      acceptsBeaconBodyToken: true,
      normalizesAllowedOriginPath: true,
    },
    ingest: {
      status: ingest.status,
      importedEvents: ingest.importedEvents,
      remoteCollectorStatus: ingest.remoteCollectors?.[0]?.status ?? 'missing',
    },
    analytics: {
      activeSource: analytics.sourceStatus.activeSource,
      retentionSource: analytics.retention.source,
      d1Retention: analytics.retention.d1Retention,
      counts: {
        game_viewed: game.counts.game_viewed,
        game_card_play_clicked: game.counts.game_card_play_clicked,
        game_started: game.counts.game_started,
        gate_sample_mission_clicked: game.counts.gate_sample_mission_clicked,
        sample_next_viewed: game.counts.sample_next_viewed,
        sample_next_routed: game.counts.sample_next_routed,
        sample_fastest_viewed: game.counts.sample_fastest_viewed,
        sample_fastest_routed: game.counts.sample_fastest_routed,
        local_router_share_clicked: game.counts.local_router_share_clicked,
        first_move_coach_shown: game.counts.first_move_coach_shown,
        tutorial_completed: game.counts.tutorial_completed,
        completion_nudge_viewed: game.counts.completion_nudge_viewed,
        replay_prompt_clicked: game.counts.replay_prompt_clicked,
        daily_return_prompt_clicked: game.counts.daily_return_prompt_clicked,
        pwa_install_prompt_available: game.counts.pwa_install_prompt_available,
        pwa_install_prompt_clicked: game.counts.pwa_install_prompt_clicked,
        pwa_install_prompt_cooldown: game.counts.pwa_install_prompt_cooldown,
        level_completed: game.counts.level_completed,
      },
    },
  }

  const report = [
    '# Event Collector Smoke',
    '',
    `Generated: ${smoke.generatedAt}`,
    `Status: ${smoke.status}`,
    '',
    '## Collector',
    '',
    `- Smoke game: ${smoke.fixture.title} (${smoke.fixture.gameId})`,
    `- Post status: ${smoke.collector.postStatus}`,
    `- Beacon status: ${smoke.collector.beaconStatus}`,
    `- Stored events: ${smoke.collector.storedEvents}`,
    `- Exported events: ${smoke.collector.exportedEvents}`,
    `- Summary status: ${smoke.collector.summaryStatus}`,
    `- Summary events: ${smoke.collector.summaryEvents}`,
    `- Owner unlock copies: ${smoke.collector.ownerUnlockPackCopied}`,
    `- Summary aggregate only: ${smoke.collector.summaryAggregateOnly}`,
    `- Normalizes allowed origin path: ${smoke.collector.normalizesAllowedOriginPath}`,
    `- PII stripped: ${smoke.collector.piiStripped}`,
    '',
    '## Ingest And Rollup',
    '',
    `- Ingest status: ${smoke.ingest.status}`,
    `- Remote collector status: ${smoke.ingest.remoteCollectorStatus}`,
    `- Active analytics source: ${smoke.analytics.activeSource}`,
    `- D1 retention: ${smoke.analytics.d1Retention}`,
    '',
  ]

  await writeFile(smokeOutputPath, JSON.stringify(smoke, null, 2) + '\n')
  await writeFile(smokeReportPath, report.join('\n'))

  console.log(`Wrote ${path.relative(root, smokeOutputPath)}`)
  console.log(`Wrote ${path.relative(root, smokeReportPath)}`)
  console.log('Event collector smoke passed: Worker events exported, imported, and rolled up.')
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
