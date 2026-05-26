import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const samplePath = path.resolve(root, process.env.AGL_ANALYTICS_SAMPLE_PATH ?? 'data/analytics-sample.json')
const retentionSamplePath = path.resolve(
  root,
  process.env.AGL_RETENTION_SAMPLE_PATH ?? 'data/retention-sample.json',
)
const localEventsDir = path.resolve(root, process.env.AGL_LOCAL_EVENTS_DIR ?? 'data/player-events')
const outputJsonPath = path.resolve(root, process.env.AGL_ANALYTICS_OUTPUT ?? 'data/analytics-rollup.json')
const reportPath = path.resolve(root, process.env.AGL_ANALYTICS_REPORT ?? 'reports/analytics-rollup-latest.md')

const countedEvents = [
  'app_loaded',
  'runtime_error',
  'game_viewed',
  'game_started',
  'first_move_coach_shown',
  'first_move_coach_used',
  'first_move_coach_skipped',
  'tutorial_completed',
  'level_completed',
  'game_abandoned',
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
  'rewarded_ad_available',
  'rewarded_ad_started',
  'rewarded_ad_completed',
  'cosmetic_offer_viewed',
  'cosmetic_offer_clicked',
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
  'daily_return_prompt_viewed',
  'daily_return_prompt_clicked',
  'daily_return_prompt_dismissed',
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
  'local_event_drop_folder_connected',
  'local_event_drop_folder_exported',
  'local_event_drop_folder_failed',
  'analytics_evidence_issue_opened',
]

const retentionEvents = [
  'app_loaded',
  'game_viewed',
  'game_started',
  'first_move_coach_shown',
  'first_move_coach_used',
  'first_move_coach_skipped',
  'tutorial_completed',
  'turn_taken',
  'level_completed',
  'game_abandoned',
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
  'prototype_started',
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
  'rewarded_ad_available',
  'rewarded_ad_started',
  'rewarded_ad_completed',
  'cosmetic_offer_viewed',
  'cosmetic_offer_clicked',
]

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))

const pct = (value) => `${Math.round(value * 100)}%`

const pctOrUnknown = (value) => (typeof value === 'number' ? pct(value) : 'not connected')

const roundMetric = (value) => Math.round(value * 1000) / 1000

const emptyCounts = () =>
  Object.fromEntries([...countedEvents, 'revenue_cents'].map((eventName) => [eventName, 0]))

const normalizeGameId = (value) => (value && typeof value === 'string' ? value : 'unknown')

const stableJson = (value) => JSON.stringify(value, Object.keys(value ?? {}).sort())

const eventIdentityFor = (event) =>
  event.id ??
  JSON.stringify({
    name: event.name ?? event.event,
    createdAt: event.createdAt ?? event.timestamp,
    properties: stableJson(event.properties ?? {}),
  })

const rowsFromAggregateSample = async () =>
  (await readJson(samplePath)).map((row) => ({
    gameId: row.gameId,
    counts: {
      ...emptyCounts(),
      ...Object.fromEntries(countedEvents.map((eventName) => [eventName, row[eventName] ?? 0])),
      revenue_cents: row.revenue_cents ?? 0,
    },
  }))

const loadLocalEvents = async () => {
  let files = []

  try {
    files = (await readdir(localEventsDir)).filter((file) => file.endsWith('.json'))
  } catch {
    return { files: [], events: [] }
  }

  const eventBatches = await Promise.all(
    files.map(async (file) => {
      const payload = await readJson(path.join(localEventsDir, file))
      return Array.isArray(payload) ? payload : payload.events ?? []
    }),
  )
  const rawEvents = eventBatches.flat()
  const seen = new Set()
  const events = []
  let duplicateEvents = 0

  for (const event of rawEvents) {
    const eventIdentity = eventIdentityFor(event)

    if (seen.has(eventIdentity)) {
      duplicateEvents += 1
      continue
    }

    seen.add(eventIdentity)
    events.push(event)
  }

  return {
    files,
    events,
    rawEvents: rawEvents.length,
    duplicateEvents,
  }
}

const rowsFromEvents = (events) => {
  const rows = new Map()

  for (const event of events) {
    const eventName = event.name ?? event.event
    const properties = event.properties ?? {}
    const gameId = normalizeGameId(properties.gameId ?? event.gameId)

    if (!countedEvents.includes(eventName) && eventName !== 'revenue_cents') {
      continue
    }

    if (!rows.has(gameId)) {
      rows.set(gameId, { gameId, counts: emptyCounts() })
    }

    const row = rows.get(gameId)
    row.counts[eventName] +=
      eventName === 'revenue_cents'
        ? Number(properties.value ?? properties.revenueCents ?? event.value ?? 0)
        : 1
  }

  return [...rows.values()].filter((row) => row.gameId !== 'unknown')
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

const addUtcDays = (isoDate, days) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const addUserDate = (users, anonymousId, isoDate) => {
  if (!users.has(anonymousId)) {
    users.set(anonymousId, new Set())
  }

  users.get(anonymousId).add(isoDate)
}

const userMapToRetentionRows = (users) =>
  [...users.entries()]
    .map(([anonymousId, activeDates]) => ({
      anonymousId,
      activeDates: [...activeDates].sort(),
    }))
    .filter((row) => row.activeDates.length)

const rowsFromRetentionSample = async () => {
  const sample = await readJson(retentionSamplePath)
  const users = new Map()

  for (const row of sample) {
    if (!row.anonymousId || !Array.isArray(row.activeDates)) {
      continue
    }

    for (const activeDate of row.activeDates) {
      const isoDate = toIsoDate(activeDate)

      if (isoDate) {
        addUserDate(users, String(row.anonymousId), isoDate)
      }
    }
  }

  return userMapToRetentionRows(users)
}

const retentionRowsFromEvents = (events) => {
  const users = new Map()

  for (const event of events) {
    const eventName = event.name ?? event.event

    if (!retentionEvents.includes(eventName)) {
      continue
    }

    const properties = event.properties ?? {}
    const anonymousId =
      typeof properties.anonymousId === 'string'
        ? properties.anonymousId
        : typeof event.anonymousId === 'string'
          ? event.anonymousId
          : null
    const isoDate = toIsoDate(properties.sessionDate ?? event.sessionDate ?? event.createdAt ?? event.timestamp)

    if (anonymousId && isoDate) {
      addUserDate(users, anonymousId, isoDate)
    }

    const cohortDate = toIsoDate(properties.retentionCohortDate ?? properties.challengeDate)
    const returnDate = toIsoDate(properties.retentionReturnDate ?? properties.intentDate)
    const explicitD1Return =
      eventName === 'daily_return_intent_started' &&
      properties.retentionEvidence === 'queued-return-intent' &&
      cohortDate &&
      returnDate &&
      addUtcDays(cohortDate, 1) === returnDate

    if (anonymousId && explicitD1Return) {
      addUserDate(users, anonymousId, cohortDate)
      addUserDate(users, anonymousId, returnDate)
    }
  }

  return userMapToRetentionRows(users)
}

const summarizeRetention = (rows) => {
  const activeByDate = new Map()

  for (const row of rows) {
    for (const activeDate of row.activeDates ?? []) {
      const isoDate = toIsoDate(activeDate)

      if (!isoDate) {
        continue
      }

      if (!activeByDate.has(isoDate)) {
        activeByDate.set(isoDate, new Set())
      }

      activeByDate.get(isoDate).add(row.anonymousId)
    }
  }

  const cohorts = [...activeByDate.keys()]
    .sort()
    .flatMap((cohortDate) => {
      const nextDate = addUtcDays(cohortDate, 1)
      const cohortUsers = activeByDate.get(cohortDate)
      const returningUsers = activeByDate.get(nextDate)

      if (!cohortUsers?.size || !returningUsers?.size) {
        return []
      }

      const retainedUsers = [...cohortUsers].filter((anonymousId) => returningUsers.has(anonymousId)).length

      return [
        {
          cohortDate,
          returnDate: nextDate,
          users: cohortUsers.size,
          retainedUsers,
          d1Retention: roundMetric(retainedUsers / cohortUsers.size),
        },
      ]
    })

  const eligibleUsers = cohorts.reduce((sum, cohort) => sum + cohort.users, 0)
  const retainedUsers = cohorts.reduce((sum, cohort) => sum + cohort.retainedUsers, 0)

  return {
    eligibleUsers,
    retainedUsers,
    d1Retention: eligibleUsers ? roundMetric(retainedUsers / eligibleUsers) : null,
    cohorts,
  }
}

const fetchPosthogRows = async () => {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

  if (!projectId || !apiKey) {
    return { status: 'not-configured', rows: [] }
  }

  const host = process.env.POSTHOG_HOST ?? 'https://us.posthog.com'
  const lookbackDays = Number(process.env.POSTHOG_LOOKBACK_DAYS ?? 7)
  const eventList = countedEvents.map((eventName) => `'${eventName}'`).join(', ')
  const query = `
    SELECT
      event,
      properties.gameId AS game_id,
      count() AS event_count
    FROM events
    WHERE timestamp >= now() - INTERVAL ${lookbackDays} DAY
      AND event IN (${eventList})
      AND properties.gameId IS NOT NULL
    GROUP BY event, game_id
    ORDER BY game_id ASC
  `

  try {
    const response = await fetch(`${host.replace(/\/$/, '')}/api/projects/${projectId}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
    })

    if (!response.ok) {
      return { status: 'error', error: `PostHog query failed with ${response.status}`, rows: [] }
    }

    const payload = await response.json()
    const rows = new Map()

    for (const result of payload.results ?? []) {
      const [eventName, gameId, eventCount] = result

      if (!rows.has(gameId)) {
        rows.set(gameId, { gameId, counts: emptyCounts() })
      }

      rows.get(gameId).counts[eventName] = Number(eventCount)
    }

    return {
      status: 'configured',
      rows: [...rows.values()],
    }
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error.message : String(error), rows: [] }
  }
}

const fetchPosthogRetentionRows = async () => {
  const projectId = process.env.POSTHOG_PROJECT_ID
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

  if (!projectId || !apiKey) {
    return { status: 'not-configured', rows: [] }
  }

  const host = process.env.POSTHOG_HOST ?? 'https://us.posthog.com'
  const lookbackDays = Number(process.env.POSTHOG_LOOKBACK_DAYS ?? 7)
  const eventList = retentionEvents.map((eventName) => `'${eventName}'`).join(', ')
  const query = `
    SELECT
      properties.anonymousId AS anonymous_id,
      toString(toDate(timestamp)) AS active_date
    FROM events
    WHERE timestamp >= now() - INTERVAL ${lookbackDays} DAY
      AND event IN (${eventList})
      AND properties.anonymousId IS NOT NULL
    GROUP BY anonymous_id, active_date
    ORDER BY active_date ASC
  `

  try {
    const response = await fetch(`${host.replace(/\/$/, '')}/api/projects/${projectId}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
    })

    if (!response.ok) {
      return { status: 'error', error: `PostHog retention query failed with ${response.status}`, rows: [] }
    }

    const payload = await response.json()
    const users = new Map()

    for (const result of payload.results ?? []) {
      const [anonymousId, activeDate] = result
      const isoDate = toIsoDate(activeDate)

      if (anonymousId && isoDate) {
        addUserDate(users, String(anonymousId), isoDate)
      }
    }

    return {
      status: 'configured',
      rows: userMapToRetentionRows(users),
    }
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error.message : String(error), rows: [] }
  }
}

const addMetrics = (row) => {
  const counts = row.counts
  const startRate = counts.game_started / Math.max(counts.game_viewed, 1)
  const tutorialCompletion = counts.tutorial_completed / Math.max(counts.game_started, 1)
  const firstGameCompletion = counts.level_completed / Math.max(counts.game_started, 1)
  const replayRate = counts.replay_clicked / Math.max(counts.level_completed, 1)
  const rewardedAdStartRate = counts.rewarded_ad_started / Math.max(counts.rewarded_ad_available, 1)

  return {
    ...row,
    metrics: {
      startRate: Math.round(startRate * 1000) / 1000,
      tutorialCompletion: Math.round(tutorialCompletion * 1000) / 1000,
      firstGameCompletion: Math.round(firstGameCompletion * 1000) / 1000,
      replayRate: Math.round(replayRate * 1000) / 1000,
      rewardedAdStartRate: Math.round(rewardedAdStartRate * 1000) / 1000,
      d1Retention: null,
      revenueCents: counts.revenue_cents,
    },
  }
}

const sumRows = (rows) => {
  const counts = emptyCounts()

  for (const row of rows) {
    for (const [key, value] of Object.entries(row.counts)) {
      counts[key] = (counts[key] ?? 0) + value
    }
  }

  return addMetrics({ gameId: 'all-games', counts })
}

const posthog = await fetchPosthogRows()
const posthogRetention = await fetchPosthogRetentionRows()
const local = await loadLocalEvents()
const sampleRows = await rowsFromAggregateSample()
const sampleRetentionRows = await rowsFromRetentionSample()
const localRows = rowsFromEvents(local.events)
const localRetentionRows = retentionRowsFromEvents(local.events)

let activeSource = 'fixture-sample'
let rows = sampleRows

if (posthog.rows.length) {
  activeSource = 'posthog'
  rows = posthog.rows
} else if (localRows.length) {
  activeSource = 'local-event-drops'
  rows = localRows
}

let retentionSource = 'fixture-retention'
let retentionRows = sampleRetentionRows
let retentionSummary = summarizeRetention(retentionRows)

if (posthogRetention.rows.length) {
  retentionSource = 'posthog'
  retentionRows = posthogRetention.rows
  retentionSummary = summarizeRetention(retentionRows)
} else if (localRetentionRows.length) {
  retentionSource = 'local-event-drops'
  retentionRows = localRetentionRows
  retentionSummary = summarizeRetention(retentionRows)
}

if (!retentionSummary.eligibleUsers && retentionSource !== 'fixture-retention') {
  retentionSource = 'fixture-retention'
  retentionRows = sampleRetentionRows
  retentionSummary = summarizeRetention(retentionRows)
}

const games = rows.map(addMetrics).sort((a, b) => a.gameId.localeCompare(b.gameId))
const totalsBase = sumRows(games)
const totals = {
  ...totalsBase,
  metrics: {
    ...totalsBase.metrics,
    d1Retention: retentionSummary.d1Retention,
  },
}

const payload = {
  generatedAt: new Date().toISOString(),
  sourceStatus: {
    activeSource,
    posthog: {
      status: posthog.status,
      host: process.env.POSTHOG_HOST ?? 'https://us.posthog.com',
      projectConfigured: Boolean(process.env.POSTHOG_PROJECT_ID),
      error: posthog.error ?? null,
    },
    localEventDrops: {
      directory: path.relative(root, localEventsDir),
      files: local.files.length,
      events: local.events.length,
      rawEvents: local.rawEvents ?? local.events.length,
      duplicateEvents: local.duplicateEvents ?? 0,
    },
    fallbackSample: {
      rows: sampleRows.length,
    },
    retention: {
      source: retentionSource,
      posthogStatus: posthogRetention.status,
      posthogError: posthogRetention.error ?? null,
      localUsers: localRetentionRows.length,
      fixtureUsers: sampleRetentionRows.length,
      eligibleUsers: retentionSummary.eligibleUsers,
      retainedUsers: retentionSummary.retainedUsers,
    },
  },
  retention: {
    source: retentionSource,
    eligibleUsers: retentionSummary.eligibleUsers,
    retainedUsers: retentionSummary.retainedUsers,
    d1Retention: retentionSummary.d1Retention,
    cohorts: retentionSummary.cohorts,
  },
  totals,
  games,
}

const report = [
  '# Analytics Rollup',
  '',
  `Generated: ${payload.generatedAt}`,
  `Active source: ${activeSource}`,
  '',
  '## Totals',
  '',
  `- Game viewed: ${totals.counts.game_viewed}`,
  `- Game started: ${totals.counts.game_started}`,
  `- Start rate: ${pct(totals.metrics.startRate)}`,
  `- First-game completion: ${pct(totals.metrics.firstGameCompletion)}`,
  `- Replay rate: ${pct(totals.metrics.replayRate)}`,
  `- D1 retention: ${pctOrUnknown(totals.metrics.d1Retention)}`,
  `- Organic entries: ${totals.counts.organic_entry_opened}`,
  `- Share clicks: ${totals.counts.share_clicked}`,
  '',
  '## Games',
  '',
  ...games.map(
    (game) =>
      `- ${game.gameId}: start ${pct(game.metrics.startRate)}, tutorial ${pct(
        game.metrics.tutorialCompletion,
      )}, completion ${pct(game.metrics.firstGameCompletion)}, replay ${pct(game.metrics.replayRate)}`,
  ),
  '',
  '## Sources',
  '',
  `- PostHog: ${posthog.status}${posthog.error ? ` (${posthog.error})` : ''}`,
  `- PostHog retention: ${posthogRetention.status}${posthogRetention.error ? ` (${posthogRetention.error})` : ''}`,
  `- Local event drops: ${local.files.length} files, ${local.events.length} events`,
  `- Fixture sample rows: ${sampleRows.length}`,
  `- Retention source: ${retentionSource}, ${retentionSummary.eligibleUsers} eligible users, ${retentionSummary.retainedUsers} retained`,
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
