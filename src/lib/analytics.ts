import posthog from 'posthog-js'
import { isExternalAnalyticsOptedOut } from './privacy'

export type AnalyticsEventName =
  | 'app_loaded'
  | 'runtime_error'
  | 'game_viewed'
  | 'game_started'
  | 'first_move_coach_shown'
  | 'first_move_coach_used'
  | 'first_move_coach_skipped'
  | 'tutorial_completed'
  | 'turn_taken'
  | 'level_completed'
  | 'first_loss'
  | 'game_abandoned'
  | 'experiment_assigned'
  | 'analytics_exported'
  | 'improvement_requested'
  | 'prototype_card_viewed'
  | 'prototype_started'
  | 'privacy_choice_updated'
  | 'rewarded_ad_available'
  | 'rewarded_ad_started'
  | 'rewarded_ad_completed'
  | 'cosmetic_offer_viewed'
  | 'cosmetic_offer_clicked'
  | 'revenue_cents'
  | 'replay_clicked'
  | 'replay_prompt_viewed'
  | 'replay_prompt_clicked'
  | 'replay_prompt_dismissed'
  | 'completion_nudge_viewed'
  | 'completion_nudge_clicked'
  | 'completion_nudge_dismissed'
  | 'finish_line_coach_viewed'
  | 'finish_line_coach_clicked'
  | 'finish_line_coach_dismissed'
  | 'store_gate_viewed'
  | 'organic_entry_opened'
  | 'share_clicked'
  | 'organic_seed_card_viewed'
  | 'organic_seed_share_clicked'
  | 'seed_campaign_clicked'
  | 'gate_sample_mission_clicked'
  | 'daily_challenge_viewed'
  | 'daily_challenge_started'
  | 'daily_challenge_completed'
  | 'daily_return_prompt_viewed'
  | 'daily_return_prompt_clicked'
  | 'daily_return_prompt_dismissed'
  | 'daily_return_intent_viewed'
  | 'daily_return_intent_started'
  | 'daily_return_intent_cleared'
  | 'streak_updated'
  | 'pwa_install_prompt_viewed'
  | 'pwa_install_prompt_clicked'
  | 'pwa_install_prompt_accepted'
  | 'pwa_install_prompt_dismissed'
  | 'pwa_installed'
  | 'pwa_launch_mode_detected'

export type AnalyticsProperties = Record<string, string | number | boolean | null>

export interface AnalyticsEvent {
  id: string
  name: AnalyticsEventName
  properties: AnalyticsProperties
  createdAt: string
}

const bufferKey = 'agl.analytics.events'
const anonymousIdKey = 'agl.analytics.anonymousId'
const sessionIdKey = 'agl.analytics.sessionId'
const acquisitionSourceKey = 'agl.analytics.acquisitionSource'
const acquisitionCampaignKey = 'agl.analytics.acquisitionCampaign'
const acquisitionGameIdKey = 'agl.analytics.acquisitionGameId'
const acquisitionChannelKey = 'agl.analytics.acquisitionChannel'
let initialized = false
let posthogReady = false
let urlAttributionInitialized = false

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`

const sessionDate = () => new Date().toISOString().slice(0, 10)

const eventCollectorUrl = () => (import.meta.env.VITE_EVENT_COLLECTOR_URL as string | undefined)?.trim()

const eventCollectorWriteToken = () =>
  (import.meta.env.VITE_EVENT_COLLECTOR_WRITE_TOKEN as string | undefined)?.trim()

const getOrCreateStoredId = (getStorage: () => Storage, key: string, prefix: string) => {
  if (typeof window === 'undefined') {
    return createId(prefix)
  }

  try {
    const storage = getStorage()
    const stored = storage.getItem(key)

    if (stored) {
      return stored
    }

    const nextId = createId(prefix)
    storage.setItem(key, nextId)
    return nextId
  } catch {
    return createId(prefix)
  }
}

export const getAnalyticsContext = () => ({
  anonymousId: getOrCreateStoredId(() => window.localStorage, anonymousIdKey, 'anon'),
  sessionId: getOrCreateStoredId(() => window.sessionStorage, sessionIdKey, 'session'),
  sessionDate: sessionDate(),
})

type AcquisitionAttribution = {
  source?: string | null
  campaign?: string | null
  gameId?: string | null
  channel?: string | null
}

const cleanAttributionValue = (value: string | null | undefined) => {
  const cleaned = value?.trim()
  return cleaned ? cleaned.slice(0, 120) : null
}

export const setAcquisitionAttribution = ({
  source,
  campaign,
  gameId,
  channel,
}: AcquisitionAttribution) => {
  if (typeof window === 'undefined') {
    return
  }

  const values = [
    [acquisitionSourceKey, cleanAttributionValue(source)],
    [acquisitionCampaignKey, cleanAttributionValue(campaign)],
    [acquisitionGameIdKey, cleanAttributionValue(gameId)],
    [acquisitionChannelKey, cleanAttributionValue(channel)],
  ] as const

  try {
    for (const [key, value] of values) {
      if (value) {
        window.sessionStorage.setItem(key, value)
      }
    }
  } catch {
    // Acquisition context is helpful attribution, but local analytics should never fail without it.
  }
}

const getAcquisitionContext = (): AnalyticsProperties => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const context: AnalyticsProperties = {}
    const source = window.sessionStorage.getItem(acquisitionSourceKey)
    const campaign = window.sessionStorage.getItem(acquisitionCampaignKey)
    const gameId = window.sessionStorage.getItem(acquisitionGameIdKey)
    const channel = window.sessionStorage.getItem(acquisitionChannelKey)

    if (source) {
      context.acquisitionSource = source
    }

    if (campaign) {
      context.acquisitionCampaign = campaign
    }

    if (gameId) {
      context.acquisitionGameId = gameId
    }

    if (channel) {
      context.acquisitionChannel = channel
    }

    return context
  } catch {
    return {}
  }
}

const initUrlAttribution = () => {
  if (urlAttributionInitialized) {
    return
  }

  urlAttributionInitialized = true

  if (typeof window === 'undefined') {
    return
  }

  const params = new URLSearchParams(window.location.search)
  const source = params.get('utm_source')
  const campaign = params.get('utm_campaign')
  const gameId = params.get('game')

  if (!source && !campaign && !gameId) {
    return
  }

  const channel =
    source === 'organic_game_page'
      ? 'organic-page'
      : source === 'share' || source === 'seed_share'
        ? 'player-share'
        : source === 'seed_internal'
          ? 'internal-rotation'
          : source === 'gate_sample'
            ? 'product-gate-sample'
          : source ?? 'direct'

  setAcquisitionAttribution({
    source: source ?? 'direct_game_link',
    campaign: campaign ?? gameId,
    gameId,
    channel,
  })
}

const readBuffer = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(bufferKey)
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : []
  } catch {
    return []
  }
}

const writeBuffer = (events: AnalyticsEvent[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(bufferKey, JSON.stringify(events.slice(-300)))
}

export const initAnalytics = () => {
  if (initialized || typeof window === 'undefined') {
    return
  }

  initialized = true
  initUrlAttribution()
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined
  const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com'

  if (key) {
    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      autocapture: false,
    })
    posthogReady = true

    if (isExternalAnalyticsOptedOut()) {
      posthog.opt_out_capturing()
    } else {
      posthog.opt_in_capturing()
    }
  }

  window.addEventListener('agl:privacy', () => {
    if (!posthogReady) {
      return
    }

    if (isExternalAnalyticsOptedOut()) {
      posthog.opt_out_capturing()
    } else {
      posthog.opt_in_capturing()
    }
  })

  window.addEventListener('error', (event) => {
    trackEvent('runtime_error', {
      surface: 'window',
      message: event.message.slice(0, 180),
      source: event.filename || null,
      line: event.lineno || 0,
      column: event.colno || 0,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'unknown')

    trackEvent('runtime_error', {
      surface: 'promise',
      message: reason.slice(0, 180),
      source: null,
      line: 0,
      column: 0,
    })
  })
}

const forwardToEventCollector = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined' || isExternalAnalyticsOptedOut()) {
    return
  }

  const endpoint = eventCollectorUrl()

  if (!endpoint) {
    return
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const writeToken = eventCollectorWriteToken()

  if (writeToken) {
    headers['X-AGL-Write-Token'] = writeToken
  }

  const url = new URL(endpoint, window.location.origin).toString()

  void fetch(url, {
    method: 'POST',
    mode: 'cors',
    keepalive: true,
    headers,
    body: JSON.stringify({
      source: 'web-pwa',
      events: [event],
    }),
  }).catch(() => {
    // Local buffering remains the source of truth when the collector is offline.
  })
}

export const trackEvent = (
  name: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) => {
  initUrlAttribution()

  const enrichedProperties = {
    ...properties,
    ...getAnalyticsContext(),
    ...getAcquisitionContext(),
  }
  const event: AnalyticsEvent = {
    id: crypto.randomUUID(),
    name,
    properties: enrichedProperties,
    createdAt: new Date().toISOString(),
  }

  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined
  if (key && !isExternalAnalyticsOptedOut()) {
    posthog.capture(name, enrichedProperties)
  }

  forwardToEventCollector(event)

  const nextEvents = [...readBuffer(), event]
  writeBuffer(nextEvents)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<AnalyticsEvent>('agl:analytics', { detail: event }))
  }
}

export const getBufferedEvents = () => readBuffer()
