import type { AnalyticsEvent, AnalyticsProperties } from './analytics'
import { productGateSamplePlan } from '../data/productGateSamplePlan'

const countEventsNamed = (events: AnalyticsEvent[], names: readonly string[]) => {
  const wanted = new Set(names)
  return events.filter((event) => wanted.has(event.name)).length
}

const eventGameId = (event: AnalyticsEvent) => {
  const gameId = event.properties.gameId ?? event.properties.acquisitionGameId

  return typeof gameId === 'string' ? gameId : null
}

const eventCampaignId = (event: AnalyticsEvent) => {
  const campaignId = event.properties.campaignId ?? event.properties.acquisitionCampaign

  return typeof campaignId === 'string' ? campaignId : null
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
  gateSampleCampaignId,
}: {
  events: AnalyticsEvent[]
  gameId: string
  gameTitle: string
  repository: string | null
  gateSampleCampaignId?: string
}): { url: string; telemetry: AnalyticsProperties } | null => {
  if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository)) {
    return null
  }

  const gateSample = gateSampleCampaignId
    ? (productGateSamplePlan.missions.find(
        (mission) => mission.campaignId === gateSampleCampaignId && mission.gameId === gameId,
      ) ?? null)
    : null
  const gameEvents = events.filter((event) => eventGameId(event) === gameId)
  const scopedEvents = gateSample?.campaignId
    ? gameEvents.filter((event) => eventCampaignId(event) === gateSample.campaignId)
    : gameEvents
  const evidence = {
    eventCount: scopedEvents.length,
    evidenceWindow: evidenceWindowFor(scopedEvents.length ? scopedEvents : gameEvents.length ? gameEvents : events),
    starts: countEventsNamed(scopedEvents, ['game_started']),
    completions: countEventsNamed(scopedEvents, ['level_completed']),
    replays: countEventsNamed(scopedEvents, ['replay_clicked']),
    d1Eligible: uniquePlayerCount(scopedEvents, ['daily_challenge_completed']),
    d1Retained: uniquePlayerCount(scopedEvents, ['daily_return_intent_started']),
  }
  const url = new URL(`https://github.com/${repository}/issues/new`)
  const issueTitle = gateSample
    ? `[Evidence] ${gameTitle} gate sample aggregate counts`
    : `[Evidence] ${gameTitle} aggregate local counts`
  const gameField = gateSample
    ? `${gameTitle} (${gameId}; ${gateSample.gateId}; ${gateSample.campaignId})`
    : `${gameTitle} (${gameId})`
  const summary = gateSample
    ? `Aggregate-only browser summary from ${evidence.eventCount} local event(s) for ${gateSample.campaignId} / ${gateSample.gateId}. Raw event rows and identifiers remain on the device. Aggregate evidence supports review but does not pass product gates by itself.`
    : `Aggregate-only browser summary from ${evidence.eventCount} local event(s). Raw event rows and identifiers remain on the device. Aggregate evidence supports review but does not pass product gates by itself.`

  url.searchParams.set('template', 'analytics-evidence.yml')
  url.searchParams.set('title', issueTitle)
  url.searchParams.set('game', gameField)
  url.searchParams.set('window', evidence.evidenceWindow)
  url.searchParams.set('starts', String(evidence.starts))
  url.searchParams.set('completions', String(evidence.completions))
  url.searchParams.set('replays', String(evidence.replays))
  url.searchParams.set('d1_eligible', String(evidence.d1Eligible))
  url.searchParams.set('d1_retained', String(evidence.d1Retained))
  url.searchParams.set('summary', summary)

  return {
    url: url.toString(),
    telemetry: {
      surface: gateSample ? 'runtime-gate-sample-handoff' : 'autonomy-cockpit-local-event-bridge',
      channel: gateSample ? 'product-gate-sample' : 'local-aggregate-evidence',
      gameId,
      gateId: gateSample?.gateId ?? null,
      campaignId: gateSample?.campaignId ?? null,
      starts: evidence.starts,
      completions: evidence.completions,
      replays: evidence.replays,
      d1Eligible: evidence.d1Eligible,
      d1Retained: evidence.d1Retained,
      localCampaignEvents: evidence.eventCount,
      publicAggregateOnly: true,
      rawEventsIncluded: false,
      identifiersIncluded: false,
      aggregateEvidenceDoesNotPassGates: true,
      destination: 'github-issues',
      zeroPaidSpend: true,
      noRevenueEnablement: gateSample?.controls.noRevenueEnablement ?? true,
    },
  }
}
