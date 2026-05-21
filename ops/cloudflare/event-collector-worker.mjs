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
  'local_router_card_viewed',
  'local_router_choice_clicked',
  'local_router_choice_dismissed',
  'gate_sample_mission_clicked',
  'gate_sample_export_prompt_viewed',
  'gate_sample_export_prompt_clicked',
  'daily_challenge_viewed',
  'daily_challenge_started',
  'daily_challenge_completed',
  'daily_return_prompt_viewed',
  'daily_return_prompt_clicked',
  'daily_return_prompt_dismissed',
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
  'preciseLocation',
  'latitude',
  'longitude',
])

const json = (payload, status = 200, headers = {}) =>
  new Response(JSON.stringify(payload, null, 2) + '\n', {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  })

const parseCsv = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const normalizeAllowedOrigin = (value) => {
  if (value === '*') {
    return value
  }

  try {
    return new URL(value).origin
  } catch {
    return value.replace(/\/+$/g, '')
  }
}

const parseAllowedOrigins = (value) => parseCsv(value).map(normalizeAllowedOrigin)

const corsHeaders = (request, env) => {
  const origin = request.headers.get('Origin')
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS)
  const allowAny = allowedOrigins.length === 0 || allowedOrigins.includes('*')
  const allowedOrigin = allowAny ? (origin ?? '*') : allowedOrigins.includes(origin ?? '') ? origin : null

  return {
    ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-AGL-Write-Token, X-AGL-Admin-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  }
}

const isAllowedOrigin = (request, env) => {
  const origin = request.headers.get('Origin')
  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS)

  return allowedOrigins.length === 0 || allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)
}

const tokenFromAuthorization = (request) => {
  const header = request.headers.get('Authorization') ?? ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match?.[1] ?? null
}

const validDate = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  return null
}

const toIsoDate = (value) => {
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : new Date()

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

const sanitizeProperties = (properties) => {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(properties)
      .filter(([key, value]) => {
        const type = typeof value
        return (
          !sensitivePropertyKeys.has(key) &&
          (type === 'string' || type === 'number' || type === 'boolean' || value === null)
        )
      })
      .map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 240) : value]),
  )
}

const normalizeEvent = (event) => {
  if (!event || typeof event !== 'object') {
    return null
  }

  const name = event.name ?? event.event

  if (typeof name !== 'string' || !allowedEventNames.has(name)) {
    return null
  }

  const createdAt = toIsoDate(event.createdAt ?? event.timestamp)
  const properties = sanitizeProperties(event.properties)

  return {
    id: typeof event.id === 'string' ? event.id.slice(0, 96) : crypto.randomUUID(),
    name,
    properties: {
      ...properties,
      sessionDate: validDate(properties.sessionDate) ?? createdAt.slice(0, 10),
    },
    createdAt,
  }
}

const payloadFromRequest = async (request) => {
  const text = await request.text()

  if (text.length > 64_000) {
    throw new Error('payload too large')
  }

  return JSON.parse(text)
}

const eventsFromPayload = (payload) => {
  const rawEvents = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : []
  const seen = new Set()

  return rawEvents
    .slice(0, 50)
    .map(normalizeEvent)
    .filter(Boolean)
    .filter((event) => {
      if (seen.has(event.id)) {
        return false
      }

      seen.add(event.id)
      return true
    })
}

const requireBucket = (env) => {
  if (!env.EVENT_BUCKET) {
    throw new Error('EVENT_BUCKET binding is missing')
  }

  return env.EVENT_BUCKET
}

const handlePostEvents = async (request, env, headers) => {
  if (!isAllowedOrigin(request, env)) {
    return json({ status: 'error', error: 'origin not allowed' }, 403, headers)
  }

  const payload = await payloadFromRequest(request)
  const writeToken = env.PUBLIC_WRITE_TOKEN || env.AGL_EVENT_COLLECTOR_WRITE_TOKEN
  const payloadWriteToken = typeof payload?.writeToken === 'string' ? payload.writeToken : null

  if (writeToken && request.headers.get('X-AGL-Write-Token') !== writeToken && payloadWriteToken !== writeToken) {
    return json({ status: 'error', error: 'invalid write token' }, 401, headers)
  }

  const bucket = requireBucket(env)
  const events = eventsFromPayload(payload)

  if (!events.length) {
    return json({ status: 'ignored', events: 0 }, 202, headers)
  }

  const eventDate = events[0].createdAt.slice(0, 10)
  const key = `player-events/${eventDate}/player-events-${Date.now()}-${crypto.randomUUID()}.json`

  await bucket.put(key, JSON.stringify(events, null, 2), {
    httpMetadata: {
      contentType: 'application/json',
    },
  })

  return json({ status: 'accepted', events: events.length, key }, 202, headers)
}

const handleExportEvents = async (request, env, headers) => {
  const adminToken = env.ADMIN_EXPORT_TOKEN || env.AGL_EVENT_COLLECTOR_ADMIN_TOKEN

  if (!adminToken) {
    return json({ status: 'error', error: 'admin export token is not configured' }, 503, headers)
  }

  const requestToken = tokenFromAuthorization(request) ?? request.headers.get('X-AGL-Admin-Token')

  if (requestToken !== adminToken) {
    return json({ status: 'error', error: 'unauthorized' }, 401, headers)
  }

  const bucket = requireBucket(env)
  const url = new URL(request.url)
  const fromDate = validDate(url.searchParams.get('from'))
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 250), 1_000)
  const listed = await bucket.list({ prefix: 'player-events/', limit })
  const files = []
  const events = []

  for (const object of listed.objects ?? []) {
    const stored = await bucket.get(object.key)

    if (!stored) {
      continue
    }

    const batch = JSON.parse(await stored.text())
    const batchEvents = Array.isArray(batch) ? batch : []
    const filteredEvents = fromDate
      ? batchEvents.filter((event) => String(event.createdAt ?? '').slice(0, 10) >= fromDate)
      : batchEvents

    if (filteredEvents.length) {
      files.push({ key: object.key, events: filteredEvents.length })
      events.push(...filteredEvents)
    }
  }

  return json(
    {
      generatedAt: new Date().toISOString(),
      source: 'cloudflare-worker-r2',
      files,
      events,
    },
    200,
    headers,
  )
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers })
    }

    const url = new URL(request.url)

    try {
      if (request.method === 'GET' && url.pathname === '/health') {
        return json({ status: 'ok', storage: env.EVENT_BUCKET ? 'configured' : 'missing' }, 200, headers)
      }

      if (request.method === 'POST' && url.pathname === '/events') {
        return await handlePostEvents(request, env, headers)
      }

      if (request.method === 'GET' && url.pathname === '/events/export') {
        return await handleExportEvents(request, env, headers)
      }

      return json({ status: 'error', error: 'not found' }, 404, headers)
    } catch (error) {
      return json(
        {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        },
        400,
        headers,
      )
    }
  },
}
