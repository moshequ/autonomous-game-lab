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
  | 'analytics_evidence_issue_opened'
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
  | 'sample_next_viewed'
  | 'sample_next_routed'
  | 'gate_sample_mission_clicked'
  | 'gate_sample_export_prompt_viewed'
  | 'gate_sample_export_prompt_clicked'
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
  | 'pwa_install_page_viewed'
  | 'pwa_install_open_clicked'
  | 'pwa_install_prompt_available'
  | 'pwa_install_prompt_viewed'
  | 'pwa_install_prompt_clicked'
  | 'pwa_install_prompt_accepted'
  | 'pwa_install_prompt_dismissed'
  | 'pwa_install_prompt_cooldown'
  | 'pwa_installed'
  | 'pwa_launch_mode_detected'
  | 'local_router_card_viewed'
  | 'local_router_choice_clicked'
  | 'local_router_share_clicked'
  | 'local_router_choice_dismissed'
  | 'local_event_drop_folder_connected'
  | 'local_event_drop_folder_exported'
  | 'local_event_drop_folder_failed'

export type AnalyticsProperties = Record<string, string | number | boolean | null>

export interface AnalyticsEvent {
  id: string
  name: AnalyticsEventName
  properties: AnalyticsProperties
  createdAt: string
}

export type LocalAnalyticsExportStatus = 'waiting-for-first-export' | 'export-due' | 'fresh'

export interface LocalAnalyticsExportReceipt {
  exportedAt: string
  exportSurface: string
  exportedEventCount: number
  latestEventId: string | null
  latestEventAt: string | null
}

export interface LocalAnalyticsExportCoverage {
  totalEvents: number
  exportedEventCount: number
  unexportedEvents: number
  coverageRatio: number
  status: LocalAnalyticsExportStatus
  lastExportedAt: string | null
  latestEventAt: string | null
  latestEventId: string | null
  exportSurface: string | null
  exportDebtThreshold: number
  exportAgeThresholdHours: number
  exportAgeHours: number | null
  exportSuggested: boolean
}

const bufferKey = 'agl.analytics.events'
const forwardedIdsKey = 'agl.analytics.forwardedEventIds'
const localExportReceiptKey = 'agl.analytics.localExportReceipt'
const anonymousIdKey = 'agl.analytics.anonymousId'
const sessionIdKey = 'agl.analytics.sessionId'
const acquisitionSourceKey = 'agl.analytics.acquisitionSource'
const acquisitionCampaignKey = 'agl.analytics.acquisitionCampaign'
const acquisitionGameIdKey = 'agl.analytics.acquisitionGameId'
const acquisitionChannelKey = 'agl.analytics.acquisitionChannel'
const localExportDebtThreshold = 12
const localExportAgeThresholdHours = 24
let initialized = false
let posthogReady = false
let urlAttributionInitialized = false
let collectorFlushInFlight = false

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
            : source === 'pwa_install'
              ? 'pwa-install'
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

const readLocalExportReceipt = (): LocalAnalyticsExportReceipt | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(localExportReceiptKey)
    const parsed = raw ? (JSON.parse(raw) as Partial<LocalAnalyticsExportReceipt>) : null

    if (!parsed || typeof parsed.exportedAt !== 'string') {
      return null
    }

    const exportedEventCount = Number(parsed.exportedEventCount)

    return {
      exportedAt: parsed.exportedAt,
      exportSurface: typeof parsed.exportSurface === 'string' ? parsed.exportSurface : 'manual',
      exportedEventCount: Number.isFinite(exportedEventCount) ? Math.max(0, exportedEventCount) : 0,
      latestEventId: typeof parsed.latestEventId === 'string' ? parsed.latestEventId : null,
      latestEventAt: typeof parsed.latestEventAt === 'string' ? parsed.latestEventAt : null,
    }
  } catch {
    return null
  }
}

export const getLocalAnalyticsExportCoverage = (
  events: AnalyticsEvent[] = readBuffer(),
): LocalAnalyticsExportCoverage => {
  const receipt = readLocalExportReceipt()
  const latestEvent = events.at(-1) ?? null
  const latestEventIndex =
    receipt?.latestEventId ? events.findIndex((event) => event.id === receipt.latestEventId) : -1
  const unexportedEvents = receipt
    ? latestEventIndex >= 0
      ? Math.max(0, events.length - latestEventIndex - 1)
      : Math.max(0, events.length - receipt.exportedEventCount)
    : events.length
  const exportedEventCount = Math.max(0, events.length - unexportedEvents)
  const exportedAtMs = receipt ? Date.parse(receipt.exportedAt) : Number.NaN
  const exportAgeHours = Number.isFinite(exportedAtMs)
    ? Math.max(0, (Date.now() - exportedAtMs) / (60 * 60 * 1000))
    : null
  const exportSuggested =
    !receipt ||
    unexportedEvents >= localExportDebtThreshold ||
    (typeof exportAgeHours === 'number' && exportAgeHours >= localExportAgeThresholdHours)
  const status: LocalAnalyticsExportStatus = !receipt
    ? 'waiting-for-first-export'
    : exportSuggested
      ? 'export-due'
      : 'fresh'

  return {
    totalEvents: events.length,
    exportedEventCount,
    unexportedEvents,
    coverageRatio: events.length ? exportedEventCount / events.length : receipt ? 1 : 0,
    status,
    lastExportedAt: receipt?.exportedAt ?? null,
    latestEventAt: latestEvent?.createdAt ?? null,
    latestEventId: latestEvent?.id ?? null,
    exportSurface: receipt?.exportSurface ?? null,
    exportDebtThreshold: localExportDebtThreshold,
    exportAgeThresholdHours: localExportAgeThresholdHours,
    exportAgeHours:
      typeof exportAgeHours === 'number' ? Math.round(exportAgeHours * 100) / 100 : null,
    exportSuggested,
  }
}

export const markLocalAnalyticsExported = (
  events: AnalyticsEvent[],
  exportSurface = 'manual',
): LocalAnalyticsExportReceipt | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const latestEvent = events.at(-1) ?? null
  const receipt: LocalAnalyticsExportReceipt = {
    exportedAt: new Date().toISOString(),
    exportSurface,
    exportedEventCount: events.length,
    latestEventId: latestEvent?.id ?? null,
    latestEventAt: latestEvent?.createdAt ?? null,
  }

  try {
    window.localStorage.setItem(localExportReceiptKey, JSON.stringify(receipt))
    return receipt
  } catch {
    return null
  }
}

const readForwardedIds = () => {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }

  try {
    const raw = window.localStorage.getItem(forwardedIdsKey)
    const ids = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(ids.filter((id) => typeof id === 'string'))
  } catch {
    return new Set<string>()
  }
}

const writeForwardedIds = (ids: Set<string>) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(forwardedIdsKey, JSON.stringify([...ids].slice(-1000)))
}

const markForwardedEvents = (events: AnalyticsEvent[]) => {
  const forwardedIds = readForwardedIds()

  for (const event of events) {
    forwardedIds.add(event.id)
  }

  writeForwardedIds(forwardedIds)
}

const collectorEndpoint = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const endpoint = eventCollectorUrl()
  return endpoint ? new URL(endpoint, window.location.origin).toString() : null
}

const eventCollectorPayload = (events: AnalyticsEvent[]) => {
  const writeToken = eventCollectorWriteToken()

  return {
    source: 'web-pwa',
    ...(writeToken ? { writeToken } : {}),
    events,
  }
}

const beaconEventsToEventCollector = (events: AnalyticsEvent[]) => {
  if (!events.length || isExternalAnalyticsOptedOut() || typeof window === 'undefined') {
    return false
  }

  const endpoint = collectorEndpoint()

  if (!endpoint || !window.navigator.sendBeacon) {
    return false
  }

  const body = JSON.stringify(eventCollectorPayload(events))
  const payload = new Blob([body], { type: 'application/json' })

  return window.navigator.sendBeacon(endpoint, payload)
}

const postEventsToEventCollector = async (events: AnalyticsEvent[]) => {
  if (!events.length || isExternalAnalyticsOptedOut()) {
    return false
  }

  const endpoint = collectorEndpoint()

  if (!endpoint) {
    return false
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const writeToken = eventCollectorWriteToken()

  if (writeToken) {
    headers['X-AGL-Write-Token'] = writeToken
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    keepalive: true,
    headers,
    body: JSON.stringify(eventCollectorPayload(events)),
  })

  return response.ok
}

export const flushBufferedEventsToCollector = (options: { preferBeacon?: boolean } = {}) => {
  if (typeof window === 'undefined' || collectorFlushInFlight || isExternalAnalyticsOptedOut()) {
    return
  }

  const forwardedIds = readForwardedIds()
  const pendingEvents = readBuffer()
    .filter((event) => !forwardedIds.has(event.id))
    .slice(-50)

  if (!pendingEvents.length) {
    return
  }

  if (options.preferBeacon && beaconEventsToEventCollector(pendingEvents)) {
    markForwardedEvents(pendingEvents)
    return
  }

  collectorFlushInFlight = true
  void postEventsToEventCollector(pendingEvents)
    .then((forwarded) => {
      if (forwarded) {
        markForwardedEvents(pendingEvents)
      }
    })
    .catch(() => {
      // The local buffer remains the retry queue while the collector is offline.
    })
    .finally(() => {
      collectorFlushInFlight = false
    })
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
      flushBufferedEventsToCollector()
      return
    }

    if (isExternalAnalyticsOptedOut()) {
      posthog.opt_out_capturing()
    } else {
      posthog.opt_in_capturing()
      flushBufferedEventsToCollector()
    }
  })

  window.addEventListener('online', () => {
    flushBufferedEventsToCollector()
  })
  window.addEventListener('pagehide', () => {
    flushBufferedEventsToCollector({ preferBeacon: true })
  })
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' || document.visibilityState === 'visible') {
      flushBufferedEventsToCollector({ preferBeacon: document.visibilityState === 'hidden' })
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

  window.setTimeout(flushBufferedEventsToCollector, 0)
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

  const nextEvents = [...readBuffer(), event]
  writeBuffer(nextEvents)
  flushBufferedEventsToCollector()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<AnalyticsEvent>('agl:analytics', { detail: event }))
  }
}

export const getBufferedEvents = () => readBuffer()
