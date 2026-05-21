import type { AnalyticsEvent, AnalyticsProperties } from './analytics'

const countEventsNamed = (events: AnalyticsEvent[], names: readonly string[]) => {
  const wanted = new Set(names)
  return events.filter((event) => wanted.has(event.name)).length
}

const eventGameId = (event: AnalyticsEvent) => {
  const gameId = event.properties.gameId ?? event.properties.acquisitionGameId

  return typeof gameId === 'string' ? gameId : null
}

const eventAnonymousId = (event: AnalyticsEvent) => {
  const anonymousId = event.properties.anonymousId

  return typeof anonymousId === 'string' ? anonymousId : null
}

const evidenceWindowFor = (events: AnalyticsEvent[]) => {
  const dates = events
    .flatMap((event) => {
      const timestamp = Date.parse(event.createdAt)

      return Number.isFinite(timestamp) ? [new Date(timestamp).toISOString().slice(0, 10)] : []
    })
    .sort()

  if (!dates.length) {
    return new Date().toISOString().slice(0, 10)
  }

  const first = dates[0]
  const last = dates.at(-1) ?? first

  return first === last ? first : `${first} to ${last}`
}

const uniquePlayerCount = (events: AnalyticsEvent[], names: readonly string[]) => {
  const wanted = new Set(names)
  const playerIds = new Set(
    events
      .filter((event) => wanted.has(event.name))
      .map(eventAnonymousId)
      .filter((anonymousId): anonymousId is string => Boolean(anonymousId)),
  )

  return playerIds.size
}

export const buildAggregateEvidenceIssue = ({
  events,
  gameId,
  gameTitle,
  repository,
}: {
  events: AnalyticsEvent[]
  gameId: string
  gameTitle: string
  repository: string | null
}): { url: string; telemetry: AnalyticsProperties } | null => {
  if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    return null
  }

  const gameEvents = events.filter((event) => eventGameId(event) === gameId)
  const evidence = {
    eventCount: gameEvents.length,
    evidenceWindow: evidenceWindowFor(gameEvents.length ? gameEvents : events),
    starts: countEventsNamed(gameEvents, ['game_started']),
    completions: countEventsNamed(gameEvents, ['level_completed']),
    replays: countEventsNamed(gameEvents, ['replay_clicked']),
    d1Eligible: uniquePlayerCount(gameEvents, ['daily_challenge_completed']),
    d1Retained: uniquePlayerCount(gameEvents, ['daily_return_intent_started']),
  }
  const url = new URL(`https://github.com/${repository}/issues/new`)

  url.searchParams.set('template', 'analytics-evidence.yml')
  url.searchParams.set('title', `[Evidence] ${gameTitle} aggregate local counts`)
  url.searchParams.set('game', `${gameTitle} (${gameId})`)
  url.searchParams.set('window', evidence.evidenceWindow)
  url.searchParams.set('starts', String(evidence.starts))
  url.searchParams.set('completions', String(evidence.completions))
  url.searchParams.set('replays', String(evidence.replays))
  url.searchParams.set('d1_eligible', String(evidence.d1Eligible))
  url.searchParams.set('d1_retained', String(evidence.d1Retained))
  url.searchParams.set(
    'summary',
    `Aggregate-only browser summary from ${evidence.eventCount} local event(s). Raw event rows and identifiers remain on the device.`,
  )

  return {
    url: url.toString(),
    telemetry: {
      gameId,
      starts: evidence.starts,
      completions: evidence.completions,
      replays: evidence.replays,
      d1Eligible: evidence.d1Eligible,
      d1Retained: evidence.d1Retained,
      publicAggregateOnly: true,
      rawEventsIncluded: false,
      identifiersIncluded: false,
      destination: 'github-issues',
    },
  }
}
