import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bot,
  Coins,
  Download,
  FolderInput,
  Gauge,
  Gamepad2,
  Play,
  RefreshCcw,
  Rocket,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import './App.css'
import type { PlayableGameId } from './components/GameCanvas'
import { acquisitionLearning } from './data/acquisitionLearning'
import { balanceReport } from './data/balanceReport'
import { deploymentPlan } from './data/deploymentPlan'
import { eventCollectorDeployment } from './data/eventCollectorDeployment'
import { androidRelease } from './data/androidRelease'
import { androidSigning } from './data/androidSigning'
import { autonomousCadence } from './data/autonomousCadence'
import { autonomousOwnerLoop } from './data/autonomousOwnerLoop'
import { autonomousSelfUpdate } from './data/autonomousSelfUpdate'
import { completionLoop } from './data/completionLoop'
import { autonomyBacklog, games } from './data/games'
import { experimentResults } from './data/experimentResults'
import { generatedPlayableGames } from './data/generatedPlayableGames'
import { growthPlan } from './data/growthPlan'
import { incidentDrill } from './data/incidentDrill'
import { iosRelease } from './data/iosRelease'
import { liveSiteMonitor } from './data/liveSiteMonitor'
import { localEventBridge } from './data/localEventBridge'
import { monetizationPlan } from './data/monetizationPlan'
import { nativePackage } from './data/nativePackage'
import { portfolioPolicy } from './data/portfolioPolicy'
import { promotionDecision } from './data/promotionDecision'
import { prototypePipeline } from './data/prototypePipeline'
import { productionResponse } from './data/productionResponse'
import { productionEnvironment } from './data/productionEnvironment'
import { productionBootstrap } from './data/productionBootstrap'
import { productionBlockerHandoff } from './data/productionBlockerHandoff'
import { productionActivation } from './data/productionActivation'
import { autonomousOperator } from './data/autonomousOperator'
import { autonomousOperatorHistory } from './data/autonomousOperatorHistory'
import { objectiveAudit } from './data/objectiveAudit'
import { organicSeedLoop } from './data/organicSeedLoop'
import { firstMoveCoach } from './data/firstMoveCoach'
import { productOptimization } from './data/productOptimization'
import { productGateRecovery } from './data/productGateRecovery'
import { productGateSamplePlan } from './data/productGateSamplePlan'
import { pwaInstallLoop } from './data/pwaInstallLoop'
import { performanceBudget } from './data/performanceBudget'
import { releaseHealth } from './data/releaseHealth'
import { repositoryBootstrap } from './data/repositoryBootstrap'
import { repositoryReadiness } from './data/repositoryReadiness'
import { replayLoop } from './data/replayLoop'
import { retentionLoop } from './data/retentionLoop'
import { storeCompliance } from './data/storeCompliance'
import { storeListingOptimizer } from './data/storeListingOptimizer'
import { supportChannel } from './data/supportChannel'
import { supportFeedback } from './data/supportFeedback'
import { trafficSeeding } from './data/trafficSeeding'
import { unitEconomics } from './data/unitEconomics'
import type { GameSnapshot } from './game/gameTypes'
import {
  getBufferedEvents,
  getLocalAnalyticsExportCoverage,
  initAnalytics,
  markLocalAnalyticsExported,
  setAcquisitionAttribution,
  trackEvent,
  type AnalyticsEvent,
  type AnalyticsEventName,
} from './lib/analytics'
import { getExperimentVariant } from './lib/experiments'
import {
  getMonetizationRuntimeState,
  markMonetizationOfferConsumed,
  wasMonetizationOfferConsumed,
} from './lib/monetization'
import { isExternalAnalyticsOptedOut, setExternalAnalyticsOptOut } from './lib/privacy'

const GameCanvas = lazy(() =>
  import('./components/GameCanvas').then((module) => ({ default: module.GameCanvas })),
)

const corePlayableGames: Array<{ id: PlayableGameId; title: string; status: string }> = [
  { id: 'harbor-rings', title: 'Harbor Rings', status: 'live' },
  { id: 'lantern-relay', title: 'Lantern Relay', status: 'prototype' },
  { id: 'harbor-circuit', title: 'Harbor Circuit', status: 'prototype' },
  { id: 'foundry-ledger', title: 'Foundry Ledger', status: 'prototype' },
  { id: 'orbit-atlas', title: 'Orbit Atlas', status: 'prototype' },
]

const playableGameCatalog: Array<{ id: PlayableGameId; title: string; status: string }> = [
  ...corePlayableGames,
  ...generatedPlayableGames.map((game) => ({
    id: game.id,
    title: game.title,
    status: 'generated',
  })),
]
const playableGameCatalogById = new Map(playableGameCatalog.map((game) => [game.id, game]))
const portfolioOrderedIds = new Set<string>(portfolioPolicy.rotation.orderedGameIds)
const playableGames: Array<{ id: PlayableGameId; title: string; status: string }> = [
  ...portfolioPolicy.rotation.orderedGameIds
    .map((gameId) => playableGameCatalogById.get(gameId as PlayableGameId))
    .filter((game): game is { id: PlayableGameId; title: string; status: string } => Boolean(game)),
  ...playableGameCatalog.filter((game) => !portfolioOrderedIds.has(game.id)),
]

const playableGameIds = new Set(playableGames.map((game) => game.id))

const isPlayableGameId = (value: string | null): value is PlayableGameId =>
  Boolean(value && playableGameIds.has(value as PlayableGameId))

const hasExplicitEntryRoute = (params: URLSearchParams) =>
  Boolean(params.get('game') || params.get('utm_source') || params.get('utm_campaign'))

const getRuntimeBasePath = () => {
  const basePath = import.meta.env.BASE_URL || '/'
  return basePath.endsWith('/') ? basePath : `${basePath}/`
}

const resolveRuntimePathname = (pathname: string) => {
  const basePath = getRuntimeBasePath()

  if (!pathname || pathname === '/') {
    return basePath
  }

  if (basePath !== '/' && pathname.startsWith(basePath)) {
    return pathname
  }

  return basePath === '/' ? pathname : `${basePath.replace(/\/$/, '')}${pathname}`
}

const getAutonomousDefaultGateSampleMission = () => {
  const primaryMission = productGateSamplePlan.missions[0] ?? null
  const fastestMission =
    productGateSamplePlan.missions.find(
      (mission) => mission.gateId === productGateSamplePlan.summary.fastestGateId,
    ) ?? primaryMission

  if (
    fastestMission &&
    primaryMission &&
    fastestMission.campaignId !== primaryMission.campaignId &&
    fastestMission.needed.successes < primaryMission.needed.successes
  ) {
    return fastestMission
  }

  return primaryMission ?? fastestMission
}

const getInitialGameId = () => {
  if (typeof window === 'undefined') {
    return 'harbor-rings'
  }

  const entryParams = new URLSearchParams(window.location.search)
  const requestedGame = entryParams.get('game')
  const portfolioPick = portfolioPolicy.dailyChallenge.gameId
  const autonomousSampleMission = hasExplicitEntryRoute(entryParams)
    ? null
    : getAutonomousDefaultGateSampleMission()
  const autonomousSampleGameId = autonomousSampleMission?.gameId ?? null

  return isPlayableGameId(requestedGame)
    ? requestedGame
    : isPlayableGameId(autonomousSampleGameId)
      ? autonomousSampleGameId
    : isPlayableGameId(portfolioPick)
      ? portfolioPick
    : 'harbor-rings'
}

const getInitialGateSampleCampaignId = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  const entryParams = new URLSearchParams(window.location.search)
  const entryCampaign = entryParams.get('utm_campaign')
  const entrySource = entryParams.get('utm_source')
  const entryGameId = entryParams.get('game')

  if (entrySource === 'gate_sample') {
    const entryMission =
      productGateSamplePlan.missions.find((mission) => mission.campaignId === entryCampaign) ??
      productGateSamplePlan.missions.find((mission) => mission.gameId === entryGameId)

    return entryMission?.campaignId ?? entryCampaign ?? ''
  }

  if (hasExplicitEntryRoute(entryParams)) {
    return ''
  }

  return getAutonomousDefaultGateSampleMission()?.campaignId ?? ''
}

const defaultSnapshot: GameSnapshot = {
  gameId: 'harbor-rings',
  title: 'Harbor Rings',
  score: 0,
  moves: 0,
  maxMoves: 12,
  nextLabel: 'Tide',
  completed: false,
  result: 'playing',
}

const formatPercent = (value: number | null | undefined) =>
  typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a'

const formatUsd = (value: number | null | undefined) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : 'n/a'

const formatPayback = (value: number | null | undefined) =>
  typeof value === 'number' ? `${value}d` : 'not ready'

const readNumberStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return 0
  }

  const value = Number(window.localStorage.getItem(key) ?? 0)
  return Number.isFinite(value) ? value : 0
}

const previousIsoDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

const nextIsoDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

const isWithinCooldownDays = (isoTimestamp: string, cooldownDays: number) => {
  if (!isoTimestamp || cooldownDays <= 0) {
    return false
  }

  const timestamp = Date.parse(isoTimestamp)

  if (!Number.isFinite(timestamp)) {
    return false
  }

  return Date.now() - timestamp < cooldownDays * 24 * 60 * 60 * 1000
}

const readStringStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(key) ?? ''
}

type LocalEventDropFolderStatus =
  | 'unsupported'
  | 'not-connected'
  | 'permission-needed'
  | 'connected'
  | 'saved'
  | 'failed'

type LocalEventDropPermissionState = 'granted' | 'denied' | 'prompt'
type LocalEventDropPermissionDescriptor = { mode: 'readwrite' }
type LocalEventDropWritable = {
  write: (data: string | Blob) => Promise<void> | void
  close: () => Promise<void> | void
}
type LocalEventDropFileHandle = {
  createWritable: () => Promise<LocalEventDropWritable>
}
type LocalEventDropDirectoryHandle = {
  name?: string
  queryPermission?: (descriptor: LocalEventDropPermissionDescriptor) => Promise<LocalEventDropPermissionState>
  requestPermission?: (descriptor: LocalEventDropPermissionDescriptor) => Promise<LocalEventDropPermissionState>
  getFileHandle: (name: string, options: { create: boolean }) => Promise<LocalEventDropFileHandle>
}
type LocalEventDropWindow = Window & {
  showDirectoryPicker?: (options?: {
    id?: string
    mode?: 'read' | 'readwrite'
    startIn?: 'desktop' | 'documents' | 'downloads'
  }) => Promise<LocalEventDropDirectoryHandle>
}

type LocalAnalyticsExportOptions = {
  fallbackToDownload?: boolean
}

const eventDropHandleDbName = 'agl.localEventDrops'
const eventDropHandleStoreName = 'handles'
const eventDropDirectoryKey = 'drop-directory'
const localEventDropAutosaveDelayMs = 400
const localEventDropAutosaveSurface = 'local-event-drop-autosave'
const localEventDropAutosaveEvents = new Set<AnalyticsEventName>([
  'first_move_coach_shown',
  'first_move_coach_used',
  'tutorial_completed',
  'completion_nudge_viewed',
  'completion_nudge_clicked',
  'finish_line_coach_viewed',
  'finish_line_coach_clicked',
  'level_completed',
  'game_abandoned',
  'replay_prompt_viewed',
  'replay_prompt_clicked',
  'replay_clicked',
  'daily_return_prompt_viewed',
  'daily_return_prompt_clicked',
  'daily_return_intent_viewed',
  'daily_return_intent_started',
  'pwa_install_page_viewed',
  'pwa_install_open_clicked',
  'pwa_install_prompt_viewed',
  'pwa_install_prompt_clicked',
  'pwa_install_prompt_accepted',
  'pwa_install_prompt_dismissed',
  'pwa_installed',
])

const localEventDropFolderSupported = () =>
  typeof window !== 'undefined' &&
  typeof (window as LocalEventDropWindow).showDirectoryPicker === 'function'

const openEventDropHandleDb = () =>
  new Promise<IDBDatabase | null>((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null)
      return
    }

    const request = indexedDB.open(eventDropHandleDbName, 1)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(eventDropHandleStoreName)) {
        request.result.createObjectStore(eventDropHandleStoreName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
    request.onblocked = () => resolve(null)
  })

const getStoredEventDropDirectoryHandle = async () => {
  const db = await openEventDropHandleDb()

  if (!db) {
    return null
  }

  return new Promise<LocalEventDropDirectoryHandle | null>((resolve) => {
    const transaction = db.transaction(eventDropHandleStoreName, 'readonly')
    const request = transaction.objectStore(eventDropHandleStoreName).get(eventDropDirectoryKey)

    request.onsuccess = () => resolve((request.result as LocalEventDropDirectoryHandle | undefined) ?? null)
    request.onerror = () => resolve(null)
    transaction.oncomplete = () => db.close()
    transaction.onerror = () => {
      db.close()
      resolve(null)
    }
  })
}

const storeEventDropDirectoryHandle = async (handle: LocalEventDropDirectoryHandle) => {
  const db = await openEventDropHandleDb()

  if (!db) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    const transaction = db.transaction(eventDropHandleStoreName, 'readwrite')

    try {
      transaction.objectStore(eventDropHandleStoreName).put(handle, eventDropDirectoryKey)
    } catch {
      db.close()
      resolve(false)
      return
    }

    transaction.oncomplete = () => {
      db.close()
      resolve(true)
    }
    transaction.onerror = () => {
      db.close()
      resolve(false)
    }
  })
}

const ensureEventDropFolderPermission = async (handle: LocalEventDropDirectoryHandle) => {
  const descriptor: LocalEventDropPermissionDescriptor = { mode: 'readwrite' }
  const current = handle.queryPermission ? await handle.queryPermission(descriptor) : 'granted'

  if (current === 'granted') {
    return true
  }

  if (!handle.requestPermission) {
    return false
  }

  return (await handle.requestPermission(descriptor)) === 'granted'
}

const writeEventDropFile = async (
  handle: LocalEventDropDirectoryHandle,
  fileName: string,
  payload: string,
) => {
  const fileHandle = await handle.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(payload)
  await writable.close()
}

const eventDropFileName = (exportSurface: string, timestamp: string) =>
  `player-events-${timestamp.replace(/[:.]/g, '-')}-${exportSurface}.json`

type ProductGateSampleMission = (typeof productGateSamplePlan.missions)[number]
type TrafficCampaign = (typeof trafficSeeding.campaigns)[number]
type LocalRouterRecommendation = {
  id: string
  actionType: 'gate-sample' | 'organic-seed' | 'daily-challenge' | 'queued-return' | 'replay'
  label: string
  ctaLabel: string
  gameId: string
  campaignId: string | null
  gateId: string | null
  reason: string
  source: string
  channel: string
  sampleStatus: string
  priority: number
}

const matchesGateSampleCampaign = (event: AnalyticsEvent, campaignId: string) =>
  event.properties.acquisitionCampaign === campaignId || event.properties.campaignId === campaignId

const matchesTrafficCampaign = (event: AnalyticsEvent, campaignId: string) =>
  event.properties.acquisitionCampaign === campaignId ||
  event.properties.campaignId === campaignId ||
  event.properties.campaign === campaignId ||
  event.properties.utm_campaign === campaignId

const countEventsNamed = (events: AnalyticsEvent[], names: readonly string[]) => {
  const wanted = new Set(names)
  return events.filter((event) => wanted.has(event.name)).length
}

const sampleProgressForMission = (
  mission: ProductGateSampleMission,
  events: AnalyticsEvent[],
) => {
  const campaignEvents = events.filter((event) => matchesGateSampleCampaign(event, mission.campaignId))
  const promptViews = countEventsNamed(campaignEvents, mission.telemetry.view)
  const promptActions = countEventsNamed(campaignEvents, mission.telemetry.action)
  const successEvents = countEventsNamed(campaignEvents, mission.telemetry.success)
  const failureEvents = countEventsNamed(campaignEvents, mission.telemetry.failure)
  const collectionEvents = countEventsNamed(campaignEvents, [...new Set(mission.telemetry.collectionEvents)])
  const analyticsExports = campaignEvents.filter(
    (event) =>
      event.name === 'analytics_exported' &&
      event.properties.exportSurface === 'product-gate-sample',
  ).length
  const promptViewsRemaining = Math.max(0, mission.needed.minimumPromptViewsForDecision - promptViews)
  const successesRemaining = Math.max(0, mission.needed.successes - successEvents)
  const sampleDecisionReady = promptViewsRemaining === 0 && successesRemaining === 0
  const evidenceDropReady = campaignEvents.length > analyticsExports

  return {
    campaignEvents: campaignEvents.length,
    collectionEvents,
    promptViews,
    promptActions,
    successEvents,
    failureEvents,
    analyticsExports,
    promptViewsRemaining,
    successesRemaining,
    evidenceDropReady,
    sampleDecisionReady,
    status:
      campaignEvents.length === 0
        ? 'waiting-for-local-events'
        : sampleDecisionReady
          ? 'ready-to-export'
          : 'collecting-local-events',
  }
}

const trafficProgressForCampaign = (campaign: TrafficCampaign, events: AnalyticsEvent[]) => {
  const campaignEvents = events.filter((event) => matchesTrafficCampaign(event, campaign.id))
  const gameEvents = campaignEvents.filter(
    (event) =>
      event.properties.gameId === campaign.gameId ||
      event.properties.acquisitionGameId === campaign.gameId,
  )
  const cardViews = countEventsNamed(campaignEvents, ['organic_seed_card_viewed'])
  const seedClicks = countEventsNamed(campaignEvents, ['seed_campaign_clicked'])
  const organicEntries = countEventsNamed(campaignEvents, ['organic_entry_opened'])
  const shareActions = countEventsNamed(campaignEvents, [
    'organic_seed_share_clicked',
    'share_clicked',
  ])
  const starts = countEventsNamed(gameEvents, ['game_started'])
  const completions = countEventsNamed(gameEvents, ['level_completed'])
  const analyticsExports = campaignEvents.filter(
    (event) =>
      event.name === 'analytics_exported' &&
      event.properties.exportSurface === 'organic-seed-campaign',
  ).length
  const targetStarts = campaign.measurement.targetStartsBeforeJudgment
  const startsRemaining = Math.max(0, targetStarts - starts)
  const sampleDecisionReady = startsRemaining === 0
  const evidenceDropReady = campaignEvents.length > analyticsExports

  return {
    campaignEvents: campaignEvents.length,
    cardViews,
    seedClicks,
    organicEntries,
    shareActions,
    starts,
    completions,
    analyticsExports,
    targetStarts,
    startsRemaining,
    evidenceDropReady,
    sampleDecisionReady,
    status:
      campaignEvents.length === 0
        ? 'waiting-for-local-events'
        : sampleDecisionReady
          ? 'ready-to-judge'
          : 'collecting-local-starts',
  }
}

type ChannelDecision = {
  channel: string
  status: string
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const getPwaDisplayMode = () => {
  if (typeof window === 'undefined') {
    return 'unknown'
  }

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }

  if (window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone) {
    return 'standalone'
  }

  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen'
  }

  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui'
  }

  return 'browser'
}

function App() {
  const [selectedGameId, setSelectedGameId] = useState<PlayableGameId>(() => getInitialGameId())
  const [activeGateSampleCampaignId, setActiveGateSampleCampaignId] = useState(() =>
    getInitialGateSampleCampaignId(),
  )
  const [snapshot, setSnapshot] = useState<GameSnapshot>(defaultSnapshot)
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => getBufferedEvents())
  const [rewardOfferConsumed, setRewardOfferConsumed] = useState(() =>
    wasMonetizationOfferConsumed(monetizationPlan.runtime?.firstPlacementId ?? monetizationPlan.placements[0].id),
  )
  const [externalAnalyticsOptedOut, setExternalAnalyticsOptedOutState] = useState(() =>
    isExternalAnalyticsOptedOut(),
  )
  const [dailyStreak, setDailyStreak] = useState(() =>
    readNumberStorage(retentionLoop.localState.storageKey),
  )
  const [bestDailyStreak, setBestDailyStreak] = useState(() =>
    readNumberStorage(retentionLoop.localState.bestKey),
  )
  const [dailyReturnIntentDate, setDailyReturnIntentDate] = useState(() =>
    readStringStorage(retentionLoop.localState.returnIntentKey),
  )
  const [dailyReturnIntentLoadedAtStart] = useState(() =>
    readStringStorage(retentionLoop.localState.returnIntentKey),
  )
  const [dailyReturnPromptDismissedDate, setDailyReturnPromptDismissedDate] = useState(() =>
    readStringStorage(retentionLoop.localState.returnPromptDismissedKey),
  )
  const [dailyReturnIntentStartedDate, setDailyReturnIntentStartedDate] = useState(() =>
    readStringStorage(retentionLoop.localState.returnIntentStartedKey),
  )
  const [dailyReturnIntentClearedDate, setDailyReturnIntentClearedDate] = useState(() =>
    readStringStorage(retentionLoop.localState.returnIntentClearedKey),
  )
  const [replayPromptDismissedRunKey, setReplayPromptDismissedRunKey] = useState(() =>
    readStringStorage(replayLoop.localState.dismissedRunKey),
  )
  const [completionNudgeDismissedRunKey, setCompletionNudgeDismissedRunKey] = useState(() =>
    readStringStorage(completionLoop.localState.dismissedRunKey),
  )
  const [completionNudgeAcceptedRunKey, setCompletionNudgeAcceptedRunKey] = useState(() =>
    readStringStorage(completionLoop.localState.acceptedRunKey),
  )
  const [finishLineDismissedRunKey, setFinishLineDismissedRunKey] = useState(() =>
    readStringStorage(completionLoop.localState.finishLineDismissedRunKey),
  )
  const [finishLineAcceptedRunKey, setFinishLineAcceptedRunKey] = useState(() =>
    readStringStorage(completionLoop.localState.finishLineAcceptedRunKey),
  )
  const [pwaPromptEvent, setPwaPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [pwaInstallStatus, setPwaInstallStatus] = useState(() => {
    const displayMode = getPwaDisplayMode()
    const installedAt = readStringStorage(pwaInstallLoop.localState.installedKey)
    const dismissedAt = readStringStorage(pwaInstallLoop.localState.dismissalKey)

    if (displayMode === 'standalone' || installedAt) {
      return 'installed'
    }

    if (isWithinCooldownDays(dismissedAt, pwaInstallLoop.promptPolicy.cooldownDaysAfterDismissal)) {
      return 'cooldown'
    }

    return 'waiting'
  })
  const [pwaDisplayMode, setPwaDisplayMode] = useState(() => getPwaDisplayMode())
  const [pwaDismissedAt, setPwaDismissedAt] = useState(() =>
    readStringStorage(pwaInstallLoop.localState.dismissalKey),
  )
  const [pwaInstalledAt, setPwaInstalledAt] = useState(() =>
    readStringStorage(pwaInstallLoop.localState.installedKey),
  )
  const [localEventDropFolderStatus, setLocalEventDropFolderStatus] =
    useState<LocalEventDropFolderStatus>(() =>
      localEventDropFolderSupported() ? 'not-connected' : 'unsupported',
    )
  const monetizationGateEventRef = useRef('')
  const dailyChallengeCompletionRef = useRef('')
  const dailyReturnPromptRef = useRef('')
  const dailyReturnIntentRef = useRef('')
  const replayPromptRef = useRef('')
  const completionNudgeRef = useRef('')
  const finishLineCoachRef = useRef('')
  const organicSeedCardRef = useRef('')
  const localRouterCardRef = useRef('')
  const gateSampleEvidenceHandoffRef = useRef('')
  const pwaPromptViewedRef = useRef(false)
  const localEventDropDirectoryRef = useRef<LocalEventDropDirectoryHandle | null>(null)
  const localEventDropAutosaveTimerRef = useRef<number | null>(null)
  const localEventDropAutosaveEventIdRef = useRef('')
  const pacingVariant = useMemo(() => getExperimentVariant('first_session_pacing'), [])
  const rewardVariant = useMemo(() => getExperimentVariant('reward_offer'), [])
  const thumbnailVariant = useMemo(() => getExperimentVariant('thumbnail_board_state_v2'), [])
  const activeRunId = useMemo(() => `${selectedGameId}-${crypto.randomUUID()}`, [selectedGameId])
  const localAnalyticsCoverage = useMemo(() => getLocalAnalyticsExportCoverage(events), [events])
  const localEventDropAutosaveStatus =
    localEventDropFolderStatus === 'connected' || localEventDropFolderStatus === 'saved' ? 'armed' : 'manual'

  useEffect(() => {
    const entryParams = new URLSearchParams(window.location.search)
    const entryGameId = entryParams.get('game')
    const entrySource = entryParams.get('utm_source')
    const entryCampaign = entryParams.get('utm_campaign')
    const autonomousDefaultMission = hasExplicitEntryRoute(entryParams)
      ? null
      : getAutonomousDefaultGateSampleMission()
    const autonomousDefaultRoutingActive = Boolean(
      autonomousDefaultMission && isPlayableGameId(autonomousDefaultMission.gameId),
    )

    if (autonomousDefaultMission && autonomousDefaultRoutingActive) {
      setAcquisitionAttribution({
        source: 'gate_sample',
        campaign: autonomousDefaultMission.campaignId,
        gameId: autonomousDefaultMission.gameId,
        channel: 'product-gate-sample',
      })
    }

    initAnalytics()

    const onAnalytics = () => setEvents(getBufferedEvents())
    window.addEventListener('agl:analytics', onAnalytics)
    trackEvent('app_loaded', {
      surface: 'pwa_portal',
      autonomousDefaultGateSampleRouting: autonomousDefaultRoutingActive,
      defaultGateSampleCampaignId: autonomousDefaultMission?.campaignId ?? null,
      defaultGateSampleGateId: autonomousDefaultMission?.gateId ?? null,
      zeroPaidSpend: true,
      noSyntheticEvents: true,
    })
    trackEvent('daily_challenge_viewed', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      seed: retentionLoop.dailyChallenge.seed,
      rewardVariantId: rewardVariant.id,
      autonomousDefaultGateSampleRouting: autonomousDefaultRoutingActive,
      defaultGateSampleCampaignId: autonomousDefaultMission?.campaignId ?? null,
    })

    if (isPlayableGameId(entryGameId) || entrySource) {
      trackEvent('organic_entry_opened', {
        gameId: isPlayableGameId(entryGameId) ? entryGameId : null,
        source: entrySource ?? 'direct',
        campaign: entryCampaign ?? null,
      })
    }

    if (entrySource === 'gate_sample') {
      const mission =
        productGateSamplePlan.missions.find((item) => item.campaignId === entryCampaign) ??
        productGateSamplePlan.missions.find((item) => item.gameId === entryGameId)

      if (mission) {
        trackEvent('gate_sample_mission_clicked', {
          gameId: mission.gameId,
          gateId: mission.gateId,
          campaignId: mission.campaignId,
          ownerLoop: mission.ownerLoop,
          surface: 'direct-gate-sample-link',
          promptViewsNeeded: mission.needed.promptViews,
          observedSuccessesNeeded: mission.needed.successes,
          costUsd: mission.controls.costUsd,
          noSyntheticEvents: mission.controls.noSyntheticEvents,
          noRuleChange: mission.controls.noRuleChange,
          noRevenueEnablement: mission.controls.noRevenueEnablement,
        })
      }
    }

    return () => window.removeEventListener('agl:analytics', onAnalytics)
  }, [rewardVariant.id])

  useEffect(() => {
    if (!localEventDropFolderSupported()) {
      return
    }

    let active = true

    void getStoredEventDropDirectoryHandle().then(async (handle) => {
      if (!active || !handle) {
        return
      }

      localEventDropDirectoryRef.current = handle
      const permission = handle.queryPermission
        ? await handle
            .queryPermission({ mode: 'readwrite' })
            .catch((): LocalEventDropPermissionState => 'prompt')
        : 'granted'
      const granted = !handle.queryPermission || permission === 'granted'

      if (!active) {
        return
      }

      setLocalEventDropFolderStatus(granted ? 'connected' : 'permission-needed')
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const onPrivacy = () => setExternalAnalyticsOptedOutState(isExternalAnalyticsOptedOut())
    window.addEventListener('agl:privacy', onPrivacy)

    return () => window.removeEventListener('agl:privacy', onPrivacy)
  }, [])

  useEffect(() => {
    const displayMode = getPwaDisplayMode()
    window.localStorage.setItem(pwaInstallLoop.localState.launchModeKey, displayMode)
    trackEvent('pwa_launch_mode_detected', {
      displayMode,
      installLoopStatus: pwaInstallLoop.status,
      surface: 'app_load',
    })

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      const installEvent = event as BeforeInstallPromptEvent
      const nextDisplayMode = getPwaDisplayMode()
      const dismissedAt = readStringStorage(pwaInstallLoop.localState.dismissalKey)
      const installedAt = readStringStorage(pwaInstallLoop.localState.installedKey)
      const cooldownActive = isWithinCooldownDays(
        dismissedAt,
        pwaInstallLoop.promptPolicy.cooldownDaysAfterDismissal,
      )
      const alreadyInstalled = nextDisplayMode === 'standalone' || Boolean(installedAt)

      trackEvent('pwa_install_prompt_available', {
        displayMode: nextDisplayMode,
        surface: pwaInstallLoop.promptPolicy.surface,
        installLoopStatus: pwaInstallLoop.status,
        priorityGameId: pwaInstallLoop.promptPolicy.priorityGameId,
        cooldownActive,
        alreadyInstalled,
      })

      if (alreadyInstalled) {
        setPwaPromptEvent(null)
        setPwaInstallStatus('installed')
        return
      }

      if (cooldownActive) {
        setPwaPromptEvent(null)
        setPwaInstallStatus('cooldown')
        trackEvent('pwa_install_prompt_cooldown', {
          displayMode: nextDisplayMode,
          surface: pwaInstallLoop.promptPolicy.surface,
          dismissedAt,
          cooldownDays: pwaInstallLoop.promptPolicy.cooldownDaysAfterDismissal,
          reason: 'dismissal-cooldown',
        })
        return
      }

      setPwaPromptEvent(installEvent)
      setPwaInstallStatus('prompt-available')

      if (!pwaPromptViewedRef.current) {
        pwaPromptViewedRef.current = true
        trackEvent('pwa_install_prompt_viewed', {
          displayMode: nextDisplayMode,
          surface: pwaInstallLoop.promptPolicy.surface,
          installLoopStatus: pwaInstallLoop.status,
          priorityGameId: pwaInstallLoop.promptPolicy.priorityGameId,
        })
      }
    }

    const onAppInstalled = () => {
      const nextDisplayMode = getPwaDisplayMode()
      const installedAt = new Date().toISOString()
      window.localStorage.setItem(pwaInstallLoop.localState.installedKey, installedAt)
      window.localStorage.removeItem(pwaInstallLoop.localState.dismissalKey)
      setPwaDisplayMode(nextDisplayMode)
      setPwaDismissedAt('')
      setPwaInstalledAt(installedAt)
      setPwaPromptEvent(null)
      setPwaInstallStatus('installed')
      trackEvent('pwa_installed', {
        displayMode: nextDisplayMode,
        installedAt,
        source: 'browser-event',
      })
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const completionRate = Math.min(100, Math.round((snapshot.moves / snapshot.maxMoves) * 100))
  const nextPrototype = prototypePipeline.find((item) => (item.status as string) === 'next-build')
  const monetizationReference = nextPrototype ?? prototypePipeline[0]
  const activeGame = playableGames.find((game) => game.id === selectedGameId) ?? playableGames[0]
  const activeGrowthPage =
    growthPlan.gamePages.find((game) => game.gameId === selectedGameId) ?? growthPlan.gamePages[0]
  const activeBalance =
    balanceReport.games.find((game) => game.gameId === selectedGameId) ?? balanceReport.games[0]
  const promotionDecisions = promotionDecision.decisions as readonly ChannelDecision[]
  const webPromotion = promotionDecisions.find((decision) => decision.channel === 'web-pwa')
  const monetizationPromotion = promotionDecisions.find(
    (decision) => decision.channel === 'monetization',
  )
  const randomBalance = activeBalance.strategies.find((strategy) => strategy.strategy === 'random')
  const greedyBalance = activeBalance.strategies.find((strategy) => strategy.strategy === 'greedy')
  const firstPlacement = monetizationPlan.placements[0]
  const monetizationRuntime = getMonetizationRuntimeState({
    plan: monetizationPlan,
    unitEconomics,
    productionResponse,
    snapshot,
    offerConsumed: rewardOfferConsumed,
  })
  const googlePayback = unitEconomics.storeFees.googlePlay.paybackDays
  const applePayback = unitEconomics.storeFees.iosAppStore.paybackDays
  const topGrowthPages = [...growthPlan.gamePages]
    .sort((a, b) => b.metrics.qualityScore - a.metrics.qualityScore)
    .slice(0, 3)
  const topExperimentRecommendations = experimentResults.recommendations.slice(0, 3)
  const activeProductionActions = productionResponse.actions
    .filter((action) => ['active', 'applied', 'monitoring'].includes(action.status))
    .slice(0, 3)
  const portfolioTopGames = portfolioPolicy.games.slice(0, 4)
  const performanceGameChunk = performanceBudget.deferred.gameChunk ?? performanceBudget.deferred.largestDeferredChunk
  const productOptimizationAction = productOptimization.actions[0]
  const productGateRecoveryPrimary = productGateRecovery.priorities[0]
  const productGateRecoveryPrimaryGate =
    productGateRecovery.gates.find(
      (gate) => gate.id === productGateRecovery.summary.primaryBottleneck,
    ) ?? productGateRecovery.gates[0]
  const productGateSampleDefaultMission = getAutonomousDefaultGateSampleMission()
  const productGateSamplePrimary = productGateSamplePlan.missions[0]
  const productGateSampleFastest =
    productGateSamplePlan.missions.find(
      (mission) => mission.gateId === productGateSamplePlan.summary.fastestGateId,
    ) ?? productGateSamplePrimary
  const productGateSampleFastestDistinct =
    productGateSampleFastest?.campaignId !== productGateSamplePrimary?.campaignId ? productGateSampleFastest : null
  const productGateSampleProgress = useMemo(
    () =>
      new Map(
        productGateSamplePlan.missions.map((mission) => [
          mission.campaignId,
          sampleProgressForMission(mission, events),
        ]),
      ),
    [events],
  )
  const productGateSamplePrimaryProgress = productGateSamplePrimary
    ? productGateSampleProgress.get(productGateSamplePrimary.campaignId)
    : null
  const productGateSampleFastestProgress = productGateSampleFastest
    ? productGateSampleProgress.get(productGateSampleFastest.campaignId)
    : null
  const productGateSampleEvidenceHandoff = useMemo(() => {
    const rankedMissions = productGateSamplePlan.missions
      .flatMap((mission, index) => {
        const progress = productGateSampleProgress.get(mission.campaignId)

        if (
          !progress ||
          !progress.evidenceDropReady ||
          progress.campaignEvents <= 0 ||
          localAnalyticsCoverage.unexportedEvents <= 0
        ) {
          return []
        }

        return [{ mission, progress, index }]
      })
      .sort(
        (left, right) =>
          Number(right.mission.campaignId === activeGateSampleCampaignId) -
            Number(left.mission.campaignId === activeGateSampleCampaignId) ||
          Number(right.mission.gameId === selectedGameId) - Number(left.mission.gameId === selectedGameId) ||
          Number(right.progress.sampleDecisionReady) - Number(left.progress.sampleDecisionReady) ||
          left.progress.successesRemaining - right.progress.successesRemaining ||
          right.progress.collectionEvents - left.progress.collectionEvents ||
          right.progress.campaignEvents - left.progress.campaignEvents ||
          left.index - right.index,
      )

    return rankedMissions[0] ?? null
  }, [activeGateSampleCampaignId, localAnalyticsCoverage.unexportedEvents, productGateSampleProgress, selectedGameId])
  const productGateSampleEvidenceHandoffStatus = productGateSampleEvidenceHandoff
    ? productGateSampleEvidenceHandoff.progress.sampleDecisionReady
      ? 'decision-ready'
      : 'export-ready'
    : 'idle'
  const firstMoveCoachPrimary =
    firstMoveCoach.targets.find((target) => target.gameId === firstMoveCoach.summary.primaryTargetId) ??
    firstMoveCoach.targets.find((target) => target.enabled)
  const productionBootstrapReadyGroups = productionBootstrap.summary.readyGroups ?? 0
  const productionBlockerNextHandoff =
    productionBlockerHandoff.topHandoffItems.find(
      (item) => item.id === productionBlockerHandoff.summary.nextBestUnlockId,
    ) ??
    productionBlockerHandoff.topHandoffItems.find((item) => item.ownerInputRequired) ??
    productionBlockerHandoff.topHandoffItems[0]
  const productionActivationRunnableActions = productionActivation.plannedActions.filter(
    (action) => action.runnableNow,
  ).length
  const supportChannelStatus = supportChannel.status as string
  const supportChannelRepository = supportChannel.repository.target ?? 'missing'
  const supportChannelReady = supportChannelStatus === 'support-channel-ready'
  const supportFeedbackTopSignal = (supportFeedback.topSignals as readonly { label: string }[])[0]
  const supportFeedbackAggregateEvidence = supportFeedback.aggregateEvidence
  const liveSiteMonitorOrigin = liveSiteMonitor.origin.origin ?? 'missing'
  const operatorSelectedAction = autonomousOperator.selectedAction as { id: string } | null
  const operatorHistorySummary = autonomousOperatorHistory.summary
  const objectiveAuditSummary = objectiveAudit.summary
  const trafficCampaigns = useMemo(() => trafficSeeding.campaigns.slice(0, 4), [])
  const trafficCampaignProgress = useMemo(
    () =>
      new Map(
        trafficCampaigns.map((campaign) => [
          campaign.id,
          trafficProgressForCampaign(campaign, events),
        ]),
      ),
    [events, trafficCampaigns],
  )
  const organicSeedGeneratedTargetCampaign =
    trafficCampaigns.find((campaign) => campaign.id === organicSeedLoop.target?.campaignId) ??
    trafficCampaigns[0]
  const organicSeedRuntimePick = useMemo(() => {
    const openCampaigns = trafficCampaigns
      .map((campaign) => {
        const progress = trafficCampaignProgress.get(campaign.id)
        const targetStarts =
          progress?.targetStarts ?? campaign.measurement.targetStartsBeforeJudgment
        const starts = progress?.starts ?? 0
        const signals =
          (progress?.seedClicks ?? 0) +
          (progress?.shareActions ?? 0) +
          (progress?.organicEntries ?? 0)

        return {
          campaign,
          progress,
          progressRatio: starts / Math.max(targetStarts, 1),
          starts,
          signals,
        }
      })
      .filter(
        ({ campaign, progress }) =>
          campaign.costUsd === 0 &&
          campaign.noPaidPromotion &&
          progress?.sampleDecisionReady !== true,
      )
      .sort(
        (left, right) =>
          left.progressRatio - right.progressRatio ||
          left.starts - right.starts ||
          left.signals - right.signals ||
          left.campaign.priority - right.campaign.priority,
      )

    return openCampaigns[0] ?? null
  }, [trafficCampaignProgress, trafficCampaigns])
  const organicSeedTargetCampaign =
    organicSeedRuntimePick?.campaign ?? organicSeedGeneratedTargetCampaign
  const organicSeedTargetSource = organicSeedRuntimePick ? 'local-balanced' : 'generated-plan'
  const organicSeedCardVisible =
    organicSeedLoop.runtimeSurface.status === 'armed' && Boolean(organicSeedTargetCampaign)
  const organicSeedCampaignId = organicSeedTargetCampaign?.id ?? ''
  const organicSeedGameId = organicSeedTargetCampaign?.gameId ?? ''
  const organicSeedCampaignTitle = organicSeedTargetCampaign?.title ?? ''
  const organicSeedPriority = organicSeedTargetCampaign?.priority ?? 0
  const organicSeedCostUsd = organicSeedTargetCampaign?.costUsd ?? 0
  const organicSeedSurface = organicSeedLoop.runtimeSurface.surface
  const organicSeedPlacement = organicSeedLoop.runtimeSurface.placement
  const acquisitionCampaigns = acquisitionLearning.campaigns.slice(0, 3)
  const organicSeedProgress = organicSeedTargetCampaign
    ? trafficCampaignProgress.get(organicSeedTargetCampaign.id)
    : null
  const organicSeedSamplePercent = organicSeedProgress
    ? organicSeedProgress.starts / Math.max(organicSeedProgress.targetStarts, 1)
    : organicSeedLoop.target?.sampleProgress
  const localTrafficStarts = [...trafficCampaignProgress.values()].reduce(
    (sum, progress) => sum + progress.starts,
    0,
  )
  const localTrafficSignals = [...trafficCampaignProgress.values()].reduce(
    (sum, progress) =>
      sum + progress.seedClicks + progress.shareActions + progress.organicEntries,
    0,
  )
  const dailyChallengeGame = playableGames.find(
    (game) => game.id === retentionLoop.dailyChallenge.gameId,
  )
  const nextDailyChallengeDate =
    retentionLoop.promptPolicy.nextChallengeDate ?? nextIsoDate(retentionLoop.dailyChallenge.date)
  const dailyReturnPromptVisible =
    retentionLoop.promptPolicy.status === 'armed' &&
    snapshot.completed &&
    dailyReturnIntentDate !== nextDailyChallengeDate &&
    dailyReturnPromptDismissedDate !== retentionLoop.dailyChallenge.date
  const dailyReturnIntentVisible =
    retentionLoop.returnIntentPolicy.status === 'armed' &&
    dailyReturnIntentDate !== '' &&
    dailyReturnIntentLoadedAtStart === dailyReturnIntentDate &&
    dailyReturnIntentStartedDate !== dailyReturnIntentDate &&
    dailyReturnIntentClearedDate !== dailyReturnIntentDate
  const completionRunKey = `${activeRunId}:${completionLoop.promptPolicy.triggerMove}`
  const completionNudgeVisible =
    completionLoop.promptPolicy.status === 'armed' &&
    selectedGameId === completionLoop.target.gameId &&
    !snapshot.completed &&
    snapshot.moves >= completionLoop.promptPolicy.triggerMove &&
    snapshot.moves < snapshot.maxMoves &&
    completionNudgeDismissedRunKey !== completionRunKey &&
    completionNudgeAcceptedRunKey !== completionRunKey
  const finishLineRunKey = `${activeRunId}:${completionLoop.finishLinePolicy.triggerMove}`
  const finishLineTargetScore = activeBalance?.targetScore ?? snapshot.score
  const finishLineRemainingScore = Math.max(0, finishLineTargetScore - snapshot.score)
  const finishLineRemainingMoves = Math.max(0, snapshot.maxMoves - snapshot.moves)
  const finishLineExpectedScore = Math.ceil(
    finishLineTargetScore *
      (snapshot.moves / Math.max(snapshot.maxMoves, 1)) *
      completionLoop.finishLinePolicy.scorePaceRatio,
  )
  const finishLineBehindPace = snapshot.score < finishLineExpectedScore
  const finishLineCoachVisible =
    completionLoop.finishLinePolicy.status === 'armed' &&
    selectedGameId === completionLoop.target.gameId &&
    !snapshot.completed &&
    snapshot.moves >= completionLoop.finishLinePolicy.triggerMove &&
    finishLineRemainingMoves >= completionLoop.finishLinePolicy.minimumRemainingMoves &&
    finishLineBehindPace &&
    finishLineDismissedRunKey !== finishLineRunKey &&
    finishLineAcceptedRunKey !== finishLineRunKey
  const replayRunKey = snapshot.completed
    ? `${selectedGameId}:${snapshot.moves}:${snapshot.score}:${snapshot.result}`
    : ''
  const replayPromptVisible =
    replayLoop.promptPolicy.status === 'armed' &&
    snapshot.completed &&
    replayRunKey !== '' &&
    replayPromptDismissedRunKey !== replayRunKey
  const pwaInstallCooldownActive = isWithinCooldownDays(
    pwaDismissedAt,
    pwaInstallLoop.promptPolicy.cooldownDaysAfterDismissal,
  )
  const pwaAlreadyInstalled = pwaDisplayMode === 'standalone' || Boolean(pwaInstalledAt)
  const pwaPromptEligible = Boolean(pwaPromptEvent) && !pwaInstallCooldownActive && !pwaAlreadyInstalled
  const pwaInstallButtonLabel = pwaAlreadyInstalled
    ? 'Installed'
    : pwaInstallCooldownActive
      ? 'Install cooling down'
      : pwaPromptEvent
        ? pwaInstallLoop.promptPolicy.ctaLabel
        : 'Install unavailable'
  const fastestGateSampleShouldRoute =
    Boolean(productGateSampleFastestDistinct) &&
    productGateSampleFastestProgress?.sampleDecisionReady !== true &&
    productGateSamplePrimaryProgress?.sampleDecisionReady !== true &&
    (productGateSampleFastestProgress?.successesRemaining ?? Number.POSITIVE_INFINITY) <
      (productGateSamplePrimaryProgress?.successesRemaining ?? Number.POSITIVE_INFINITY)
  const localRouterRecommendation = useMemo<LocalRouterRecommendation>(() => {
    if (dailyReturnIntentVisible) {
      return {
        id: 'queued-return-intent',
        actionType: 'queued-return',
        label: 'Queued return',
        ctaLabel: retentionLoop.returnIntentPolicy.ctaLabel,
        gameId: retentionLoop.dailyChallenge.gameId,
        campaignId: retentionLoop.samplePolicy.campaignId,
        gateId: retentionLoop.samplePolicy.gateId,
        reason: 'A local return intent is waiting, so this is the fastest D1 retention signal.',
        source: 'local_router',
        channel: 'retention',
        sampleStatus: retentionLoop.samplePolicy.status,
        priority: 1,
      }
    }

    if (replayPromptVisible) {
      return {
        id: 'completed-run-replay',
        actionType: 'replay',
        label: 'Replay signal',
        ctaLabel: replayLoop.promptPolicy.ctaLabel,
        gameId: selectedGameId,
        campaignId: null,
        gateId: 'replayRate',
        reason: 'This completed run can become a real replay signal without paid rewards.',
        source: 'local_router',
        channel: 'replay',
        sampleStatus: replayLoop.promptPolicy.status,
        priority: 2,
      }
    }

    if (
      productGateSampleFastestDistinct &&
      productGateSampleFastestProgress &&
      fastestGateSampleShouldRoute
    ) {
      return {
        id: 'fastest-gate-sample',
        actionType: 'gate-sample',
        label: 'Fastest gate sample',
        ctaLabel: 'Start fastest sample',
        gameId: productGateSampleFastestDistinct.gameId,
        campaignId: productGateSampleFastestDistinct.campaignId,
        gateId: productGateSampleFastestDistinct.gateId,
        reason: `${productGateSampleFastestDistinct.label} needs the fewest real successes before revenue gates can move.`,
        source: 'gate_sample',
        channel: 'product-gate-sample',
        sampleStatus: productGateSampleFastestProgress.status,
        priority: 3,
      }
    }

    if (productGateSamplePrimary && productGateSamplePrimaryProgress?.sampleDecisionReady !== true) {
      return {
        id: 'first-completion-sample',
        actionType: 'gate-sample',
        label: 'First finish sample',
        ctaLabel: 'Start measured run',
        gameId: productGateSamplePrimary.gameId,
        campaignId: productGateSamplePrimary.campaignId,
        gateId: productGateSamplePrimary.gateId,
        reason: 'First-game completion is the largest revenue-blocking gap.',
        source: 'gate_sample',
        channel: 'product-gate-sample',
        sampleStatus: productGateSamplePrimary.status,
        priority: 4,
      }
    }

    if (organicSeedTargetCampaign && organicSeedProgress?.sampleDecisionReady !== true) {
      return {
        id: 'organic-seed-sample',
        actionType: 'organic-seed',
        label: 'Seed a new game',
        ctaLabel: organicSeedLoop.runtimeSurface.primaryCtaLabel,
        gameId: organicSeedTargetCampaign.gameId,
        campaignId: organicSeedTargetCampaign.id,
        gateId: null,
        reason: 'The portfolio still needs player-initiated starts before judging generated games.',
        source: 'seed_internal',
        channel: 'internal-rotation',
        sampleStatus: organicSeedProgress?.status ?? 'waiting-for-local-events',
        priority: 5,
      }
    }

    return {
      id: 'daily-challenge',
      actionType: 'daily-challenge',
      label: 'Daily board',
      ctaLabel: 'Play daily challenge',
      gameId: retentionLoop.dailyChallenge.gameId,
      campaignId: retentionLoop.samplePolicy.campaignId,
      gateId: retentionLoop.samplePolicy.gateId,
      reason: 'The daily board keeps retention measurement moving without push notifications.',
      source: 'local_router',
      channel: 'retention',
      sampleStatus: retentionLoop.status,
      priority: 6,
    }
  }, [
    dailyReturnIntentVisible,
    fastestGateSampleShouldRoute,
    organicSeedProgress?.sampleDecisionReady,
    organicSeedProgress?.status,
    organicSeedTargetCampaign,
    productGateSampleFastestDistinct,
    productGateSampleFastestProgress,
    productGateSamplePrimary,
    productGateSamplePrimaryProgress?.sampleDecisionReady,
    replayPromptVisible,
    selectedGameId,
  ])
  const eventCounts = events.reduce<Record<string, number>>((counts, event) => {
    counts[event.name] = (counts[event.name] ?? 0) + 1
    return counts
  }, {})
  const localRouterViews = eventCounts.local_router_card_viewed ?? 0
  const localRouterChoices = eventCounts.local_router_choice_clicked ?? 0
  const toggleExternalAnalytics = () => {
    const next = !externalAnalyticsOptedOut
    setExternalAnalyticsOptOut(next)
    trackEvent('privacy_choice_updated', { externalAnalyticsOptOut: next })
  }
  const resolveRuntimeCampaignUrl = (urlOrPath: string) => {
    if (typeof window === 'undefined') {
      return urlOrPath
    }

    try {
      const campaignUrl = new URL(urlOrPath, window.location.origin)
      const generatedPlaceholderHost =
        campaignUrl.hostname === 'autonomous-game-lab.example.com' ||
        campaignUrl.hostname.endsWith('.example.com') ||
        urlOrPath.startsWith('/')

      if (generatedPlaceholderHost) {
        return `${window.location.origin}${resolveRuntimePathname(campaignUrl.pathname)}${campaignUrl.search}${campaignUrl.hash}`
      }

      return campaignUrl.toString()
    } catch {
      return urlOrPath
    }
  }
  const replaceHistoryWithCampaignUrl = (urlOrPath: string) => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const campaignUrl = new URL(resolveRuntimeCampaignUrl(urlOrPath), window.location.origin)
      window.history.replaceState(
        null,
        '',
        `${campaignUrl.pathname}${campaignUrl.search}${campaignUrl.hash}`,
      )
    } catch {
      // Keep the game playable even if a generated campaign URL is malformed.
    }
  }
  const openSeedCampaign = (campaign: (typeof trafficCampaigns)[number]) => {
    setActiveGateSampleCampaignId('')
    setAcquisitionAttribution({
      source: 'seed_internal',
      campaign: campaign.id,
      gameId: campaign.gameId,
      channel: 'internal-rotation',
    })

    if (isPlayableGameId(campaign.gameId)) {
      setSelectedGameId(campaign.gameId)
    }

    replaceHistoryWithCampaignUrl(campaign.playPath)

    trackEvent('seed_campaign_clicked', {
      gameId: campaign.gameId,
      campaignId: campaign.id,
      channel: 'internal-rotation',
      priority: campaign.priority,
      source: 'portal-growth-loop',
      costUsd: campaign.costUsd,
    })
  }
  const startGateSampleMission = (mission: (typeof productGateSamplePlan.missions)[number]) => {
    setActiveGateSampleCampaignId(mission.campaignId)
    setAcquisitionAttribution({
      source: 'gate_sample',
      campaign: mission.campaignId,
      gameId: mission.gameId,
      channel: 'product-gate-sample',
    })

    if (isPlayableGameId(mission.gameId)) {
      setSelectedGameId(mission.gameId)
    }

    if (typeof window !== 'undefined') {
      const playUrl = new URL(mission.playPath, window.location.origin)
      window.history.replaceState(null, '', `${playUrl.pathname}${playUrl.search}`)
    }

    trackEvent('gate_sample_mission_clicked', {
      gameId: mission.gameId,
      gateId: mission.gateId,
      campaignId: mission.campaignId,
      ownerLoop: mission.ownerLoop,
      surface: mission.surface,
      promptViewsNeeded: mission.needed.promptViews,
      observedSuccessesNeeded: mission.needed.successes,
      costUsd: mission.controls.costUsd,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
      noRuleChange: mission.controls.noRuleChange,
      noRevenueEnablement: mission.controls.noRevenueEnablement,
    })
  }
  const shareGateSampleMission = async (mission: (typeof productGateSamplePlan.missions)[number]) => {
    const shareUrl = resolveRuntimeCampaignUrl(mission.playPath)
    const shareData = {
      title: `Play ${mission.title}`,
      text: 'Help collect real zero-spend gameplay evidence for Autonomous Game Lab.',
      url: shareUrl,
    }
    let method = 'clipboard'
    let succeeded = false

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        method = 'native'
        succeeded = true
      } catch {
        method = 'native'
      }
    } else if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        succeeded = true
      } catch {
        succeeded = false
      }
    } else {
      method = 'unsupported'
    }

    trackEvent('share_clicked', {
      gameId: mission.gameId,
      campaignId: mission.campaignId,
      gateId: mission.gateId,
      method,
      succeeded,
      surface: 'product-gate-sample',
      channel: 'product-gate-sample',
      shareUrl,
      zeroPaidSpend: true,
      noPaidTraffic: true,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
      noRevenueEnablement: mission.controls.noRevenueEnablement,
    })
  }
  const shareSeedCampaign = async (campaign: (typeof trafficCampaigns)[number]) => {
    setAcquisitionAttribution({
      source: 'seed_share',
      campaign: campaign.id,
      gameId: campaign.gameId,
      channel: 'player-share',
    })

    let method = 'clipboard'
    let succeeded = false
    const resolvedShareUrl = resolveRuntimeCampaignUrl(campaign.shareUrl)
    const shareData = {
      title: campaign.copy.title,
      text: campaign.copy.text,
      url: resolvedShareUrl,
    }
    const seedShareCopy = [shareData.title, shareData.text, resolvedShareUrl].join('\n')

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        method = 'native'
        succeeded = true
      } catch {
        method = 'cancelled'
      }
    } else if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(seedShareCopy)
        succeeded = true
      } catch {
        method = 'clipboard_unavailable'
      }
    } else {
      method = 'unsupported'
    }

    trackEvent('organic_seed_share_clicked', {
      gameId: campaign.gameId,
      campaignId: campaign.id,
      acquisitionCampaign: campaign.id,
      channel: 'player-share',
      method,
      succeeded,
      surface: organicSeedSurface,
      costUsd: campaign.costUsd,
      shareCopyLength: seedShareCopy.length,
    })
    trackEvent('share_clicked', {
      gameId: campaign.gameId,
      campaignId: campaign.id,
      channel: 'player-share',
      method,
      succeeded,
      surface: organicSeedSurface,
      seeded: true,
    })
  }
  const startDailyChallenge = () => {
    if (isPlayableGameId(retentionLoop.dailyChallenge.gameId)) {
      setSelectedGameId(retentionLoop.dailyChallenge.gameId)
    }

    trackEvent('daily_challenge_started', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      seed: retentionLoop.dailyChallenge.seed,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
  }
  const queueDailyReturn = () => {
    window.localStorage.setItem(retentionLoop.localState.returnIntentKey, nextDailyChallengeDate)
    setDailyReturnIntentDate(nextDailyChallengeDate)
    trackEvent('daily_return_prompt_clicked', {
      gameId: selectedGameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      intentDate: nextDailyChallengeDate,
      surface: retentionLoop.promptPolicy.surface,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
  }
  const dismissDailyReturn = () => {
    window.localStorage.setItem(
      retentionLoop.localState.returnPromptDismissedKey,
      retentionLoop.dailyChallenge.date,
    )
    setDailyReturnPromptDismissedDate(retentionLoop.dailyChallenge.date)
    trackEvent('daily_return_prompt_dismissed', {
      gameId: selectedGameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      surface: retentionLoop.promptPolicy.surface,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
  }
  const startQueuedReturnIntent = () => {
    window.localStorage.setItem(retentionLoop.localState.returnIntentStartedKey, dailyReturnIntentDate)
    setDailyReturnIntentStartedDate(dailyReturnIntentDate)
    const retentionCohortDate = previousIsoDate(dailyReturnIntentDate)
    const d1RetentionCandidate = retentionCohortDate === retentionLoop.dailyChallenge.date

    if (isPlayableGameId(retentionLoop.dailyChallenge.gameId)) {
      setSelectedGameId(retentionLoop.dailyChallenge.gameId)
    }

    trackEvent('daily_return_intent_started', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      intentDate: dailyReturnIntentDate,
      retentionCohortDate,
      retentionReturnDate: dailyReturnIntentDate,
      retentionEvidence: 'queued-return-intent',
      d1RetentionCandidate,
      seed: retentionLoop.dailyChallenge.seed,
      surface: retentionLoop.returnIntentPolicy.surface,
      trigger: retentionLoop.returnIntentPolicy.trigger,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
    trackEvent('daily_challenge_started', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      retentionCohortDate,
      retentionReturnDate: dailyReturnIntentDate,
      retentionEvidence: 'queued-return-intent',
      d1RetentionCandidate,
      seed: retentionLoop.dailyChallenge.seed,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
      surface: retentionLoop.returnIntentPolicy.surface,
    })
  }
  const clearQueuedReturnIntent = () => {
    const clearedDate = dailyReturnIntentDate
    window.localStorage.setItem(retentionLoop.localState.returnIntentClearedKey, clearedDate)
    window.localStorage.removeItem(retentionLoop.localState.returnIntentKey)
    setDailyReturnIntentClearedDate(clearedDate)
    setDailyReturnIntentDate('')
    trackEvent('daily_return_intent_cleared', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      intentDate: clearedDate,
      surface: retentionLoop.returnIntentPolicy.surface,
      trigger: retentionLoop.returnIntentPolicy.trigger,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
  }
  const keepPlayingFromCompletionNudge = () => {
    window.localStorage.setItem(completionLoop.localState.acceptedRunKey, completionRunKey)
    setCompletionNudgeAcceptedRunKey(completionRunKey)
    trackEvent('completion_nudge_clicked', {
      gameId: selectedGameId,
      runKey: completionRunKey,
      score: snapshot.score,
      moves: snapshot.moves,
      maxMoves: snapshot.maxMoves,
      surface: completionLoop.promptPolicy.surface,
      promptId: completionLoop.promptPolicy.id,
      triggerMove: completionLoop.promptPolicy.triggerMove,
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
    document.querySelector('canvas')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
  const dismissCompletionNudge = () => {
    window.localStorage.setItem(completionLoop.localState.dismissedRunKey, completionRunKey)
    setCompletionNudgeDismissedRunKey(completionRunKey)
    trackEvent('completion_nudge_dismissed', {
      gameId: selectedGameId,
      runKey: completionRunKey,
      score: snapshot.score,
      moves: snapshot.moves,
      maxMoves: snapshot.maxMoves,
      surface: completionLoop.promptPolicy.surface,
      promptId: completionLoop.promptPolicy.id,
      triggerMove: completionLoop.promptPolicy.triggerMove,
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
  }
  const finishLineEventProperties = useCallback(() => ({
    gameId: selectedGameId,
    runKey: finishLineRunKey,
    score: snapshot.score,
    targetScore: finishLineTargetScore,
    remainingScore: finishLineRemainingScore,
    remainingMoves: finishLineRemainingMoves,
    expectedScore: finishLineExpectedScore,
    moves: snapshot.moves,
    maxMoves: snapshot.maxMoves,
    surface: completionLoop.finishLinePolicy.surface,
    promptId: completionLoop.finishLinePolicy.id,
    triggerMove: completionLoop.finishLinePolicy.triggerMove,
    variantId: pacingVariant.id,
    rewardVariantId: rewardVariant.id,
  }), [
    finishLineExpectedScore,
    finishLineRemainingMoves,
    finishLineRemainingScore,
    finishLineRunKey,
    finishLineTargetScore,
    pacingVariant.id,
    rewardVariant.id,
    selectedGameId,
    snapshot.maxMoves,
    snapshot.moves,
    snapshot.score,
  ])
  const focusFromFinishLineCoach = () => {
    window.localStorage.setItem(completionLoop.localState.finishLineAcceptedRunKey, finishLineRunKey)
    setFinishLineAcceptedRunKey(finishLineRunKey)
    trackEvent('finish_line_coach_clicked', finishLineEventProperties())
    document.querySelector('canvas')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
  const dismissFinishLineCoach = () => {
    window.localStorage.setItem(completionLoop.localState.finishLineDismissedRunKey, finishLineRunKey)
    setFinishLineDismissedRunKey(finishLineRunKey)
    trackEvent('finish_line_coach_dismissed', finishLineEventProperties())
  }
  const playAgainFromReplayPrompt = () => {
    window.localStorage.setItem(replayLoop.localState.acceptedRunKey, replayRunKey)
    trackEvent('replay_prompt_clicked', {
      gameId: selectedGameId,
      runKey: replayRunKey,
      score: snapshot.score,
      moves: snapshot.moves,
      result: snapshot.result,
      surface: replayLoop.promptPolicy.surface,
      promptId: replayLoop.promptPolicy.id,
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
    trackEvent('replay_clicked', {
      gameId: selectedGameId,
      runKey: replayRunKey,
      score: snapshot.score,
      moves: snapshot.moves,
      result: snapshot.result,
      surface: replayLoop.promptPolicy.surface,
      promptId: replayLoop.promptPolicy.id,
      trigger: replayLoop.promptPolicy.trigger,
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
    window.location.reload()
  }
  const dismissReplayPrompt = () => {
    window.localStorage.setItem(replayLoop.localState.dismissedRunKey, replayRunKey)
    setReplayPromptDismissedRunKey(replayRunKey)
    trackEvent('replay_prompt_dismissed', {
      gameId: selectedGameId,
      runKey: replayRunKey,
      score: snapshot.score,
      moves: snapshot.moves,
      result: snapshot.result,
      surface: replayLoop.promptPolicy.surface,
      promptId: replayLoop.promptPolicy.id,
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
  }
  const promptPwaInstall = async () => {
    const displayMode = getPwaDisplayMode()
    if (pwaInstallCooldownActive || pwaAlreadyInstalled) {
      setPwaInstallStatus(pwaAlreadyInstalled ? 'installed' : 'cooldown')
      return
    }

    trackEvent('pwa_install_prompt_clicked', {
      displayMode,
      surface: pwaInstallLoop.promptPolicy.surface,
      nativePromptAvailable: Boolean(pwaPromptEvent),
      installLoopStatus: pwaInstallLoop.status,
    })

    if (!pwaPromptEvent) {
      return
    }

    try {
      await pwaPromptEvent.prompt()
      const choice = await pwaPromptEvent.userChoice
      const eventName =
        choice.outcome === 'accepted' ? 'pwa_install_prompt_accepted' : 'pwa_install_prompt_dismissed'
      setPwaInstallStatus(choice.outcome === 'dismissed' ? 'cooldown' : choice.outcome)

      if (choice.outcome === 'dismissed') {
        const dismissedAt = new Date().toISOString()
        window.localStorage.setItem(pwaInstallLoop.localState.dismissalKey, dismissedAt)
        setPwaDismissedAt(dismissedAt)
      } else {
        window.localStorage.removeItem(pwaInstallLoop.localState.dismissalKey)
        setPwaDismissedAt('')
      }

      trackEvent(eventName, {
        displayMode,
        surface: pwaInstallLoop.promptPolicy.surface,
        platform: choice.platform,
        outcome: choice.outcome,
        cooldownDays:
          choice.outcome === 'dismissed'
            ? pwaInstallLoop.promptPolicy.cooldownDaysAfterDismissal
            : null,
      })
      setPwaPromptEvent(null)
    } catch {
      setPwaInstallStatus('cooldown')
      const dismissedAt = new Date().toISOString()
      window.localStorage.setItem(pwaInstallLoop.localState.dismissalKey, dismissedAt)
      setPwaDismissedAt(dismissedAt)
      trackEvent('pwa_install_prompt_dismissed', {
        displayMode,
        surface: pwaInstallLoop.promptPolicy.surface,
        platform: 'unknown',
        outcome: 'error',
        cooldownDays: pwaInstallLoop.promptPolicy.cooldownDaysAfterDismissal,
      })
    }
  }
  const localRouterEventProperties = useCallback(() => ({
    recommendationId: localRouterRecommendation.id,
    actionType: localRouterRecommendation.actionType,
    label: localRouterRecommendation.label,
    gameId: localRouterRecommendation.gameId,
    campaignId: localRouterRecommendation.campaignId,
    gateId: localRouterRecommendation.gateId,
    source: localRouterRecommendation.source,
    channel: localRouterRecommendation.channel,
    sampleStatus: localRouterRecommendation.sampleStatus,
    priority: localRouterRecommendation.priority,
    localEvents: events.length,
    localRouterViews,
    localRouterChoices,
    localTrafficStarts,
    localTrafficSignals,
    zeroPaidSpend: true,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
  }), [
    events.length,
    localRouterChoices,
    localRouterRecommendation,
    localRouterViews,
    localTrafficSignals,
    localTrafficStarts,
  ])
  const chooseLocalRouterRecommendation = () => {
    const recommendation = localRouterRecommendation

    if (recommendation.actionType === 'queued-return') {
      startQueuedReturnIntent()
      trackEvent('local_router_choice_clicked', localRouterEventProperties())
      return
    }

    if (recommendation.actionType === 'replay') {
      trackEvent('local_router_choice_clicked', localRouterEventProperties())
      playAgainFromReplayPrompt()
      return
    }

    if (recommendation.actionType === 'gate-sample') {
      const gateMission =
        productGateSamplePlan.missions.find((mission) => mission.campaignId === recommendation.campaignId) ??
        productGateSamplePrimary

      if (gateMission) {
        startGateSampleMission(gateMission)
      }

      trackEvent('local_router_choice_clicked', localRouterEventProperties())
      return
    }

    if (recommendation.actionType === 'organic-seed' && organicSeedTargetCampaign) {
      openSeedCampaign(organicSeedTargetCampaign)
      trackEvent('local_router_choice_clicked', localRouterEventProperties())
      return
    }

    startDailyChallenge()
    trackEvent('local_router_choice_clicked', localRouterEventProperties())
  }
  useEffect(() => {
    if (!organicSeedCardVisible || !organicSeedCampaignId) {
      return
    }

    if (organicSeedCardRef.current === organicSeedCampaignId) {
      return
    }

    organicSeedCardRef.current = organicSeedCampaignId
    trackEvent('organic_seed_card_viewed', {
      gameId: organicSeedGameId,
      campaignId: organicSeedCampaignId,
      title: organicSeedCampaignTitle,
      priority: organicSeedPriority,
      costUsd: organicSeedCostUsd,
      surface: organicSeedSurface,
      placement: organicSeedPlacement,
    })
  }, [
    organicSeedCampaignId,
    organicSeedCampaignTitle,
    organicSeedCardVisible,
    organicSeedCostUsd,
    organicSeedGameId,
    organicSeedPlacement,
    organicSeedPriority,
    organicSeedSurface,
  ])
  useEffect(() => {
    const routerKey = `${localRouterRecommendation.id}:${localRouterRecommendation.gameId}:${localRouterRecommendation.sampleStatus}`

    if (localRouterCardRef.current === routerKey) {
      return
    }

    localRouterCardRef.current = routerKey
    trackEvent('local_router_card_viewed', {
      ...localRouterEventProperties(),
      surface: 'autonomy-cockpit-local-router',
    })
  }, [
    events.length,
    localRouterChoices,
    localRouterEventProperties,
    localRouterRecommendation,
    localRouterViews,
    localTrafficSignals,
    localTrafficStarts,
  ])
  useEffect(() => {
    if (!productGateSampleEvidenceHandoff) {
      return
    }

    const { mission, progress } = productGateSampleEvidenceHandoff
    const handoffKey = [
      mission.campaignId,
      progress.collectionEvents,
      progress.successEvents,
      progress.analyticsExports,
      productGateSampleEvidenceHandoffStatus,
    ].join(':')

    if (gateSampleEvidenceHandoffRef.current === handoffKey) {
      return
    }

    gateSampleEvidenceHandoffRef.current = handoffKey
    trackEvent('gate_sample_export_prompt_viewed', {
      gameId: mission.gameId,
      gateId: mission.gateId,
      campaignId: mission.campaignId,
      surface: 'runtime-gate-sample-handoff',
      exportSurface: 'product-gate-sample',
      status: productGateSampleEvidenceHandoffStatus,
      localCampaignEvents: progress.campaignEvents,
      localCollectionEvents: progress.collectionEvents,
      localObservedSuccesses: progress.successEvents,
      localAnalyticsExports: progress.analyticsExports,
      localPromptViewsRemaining: progress.promptViewsRemaining,
      localSuccessesRemaining: progress.successesRemaining,
      unexportedEvents: localAnalyticsCoverage.unexportedEvents,
      exportCoverageStatus: localAnalyticsCoverage.status,
      zeroPaidSpend: true,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
      noRevenueEnablement: mission.controls.noRevenueEnablement,
    })
  }, [localAnalyticsCoverage, productGateSampleEvidenceHandoff, productGateSampleEvidenceHandoffStatus])
  useEffect(() => {
    if (selectedGameId !== retentionLoop.dailyChallenge.gameId || !snapshot.completed) {
      return
    }

    const completionKey = `${retentionLoop.dailyChallenge.date}:${selectedGameId}:${snapshot.result}`

    if (dailyChallengeCompletionRef.current === completionKey) {
      return
    }

    dailyChallengeCompletionRef.current = completionKey
    const lastCompletedDate = window.localStorage.getItem(retentionLoop.localState.dateKey)
    const alreadyCompletedToday = lastCompletedDate === retentionLoop.dailyChallenge.date
    const continuedYesterday = lastCompletedDate === previousIsoDate(retentionLoop.dailyChallenge.date)
    const nextStreak = alreadyCompletedToday ? dailyStreak : continuedYesterday ? dailyStreak + 1 : 1
    const nextBest = Math.max(bestDailyStreak, nextStreak)

    window.localStorage.setItem(retentionLoop.localState.dateKey, retentionLoop.dailyChallenge.date)
    window.localStorage.setItem(retentionLoop.localState.storageKey, String(nextStreak))
    window.localStorage.setItem(retentionLoop.localState.bestKey, String(nextBest))
    setDailyStreak(nextStreak)
    setBestDailyStreak(nextBest)

    trackEvent('daily_challenge_completed', {
      gameId: selectedGameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      seed: retentionLoop.dailyChallenge.seed,
      result: snapshot.result,
      score: snapshot.score,
      moves: snapshot.moves,
      streak: nextStreak,
      bestStreak: nextBest,
      rewardVariantId: rewardVariant.id,
    })
    trackEvent('streak_updated', {
      gameId: selectedGameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      streak: nextStreak,
      bestStreak: nextBest,
      rewardVariantId: rewardVariant.id,
    })
  }, [
    bestDailyStreak,
    dailyStreak,
    rewardVariant.id,
    selectedGameId,
    snapshot.completed,
    snapshot.moves,
    snapshot.result,
    snapshot.score,
  ])
  useEffect(() => {
    if (!dailyReturnPromptVisible || dailyReturnPromptRef.current === retentionLoop.dailyChallenge.date) {
      return
    }

    dailyReturnPromptRef.current = retentionLoop.dailyChallenge.date
    trackEvent('daily_return_prompt_viewed', {
      gameId: selectedGameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      nextChallengeDate: retentionLoop.promptPolicy.nextChallengeDate,
      surface: retentionLoop.promptPolicy.surface,
      trigger: retentionLoop.promptPolicy.trigger,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
  }, [dailyReturnPromptVisible, dailyStreak, rewardVariant.id, selectedGameId])
  useEffect(() => {
    if (!dailyReturnIntentVisible || dailyReturnIntentRef.current === dailyReturnIntentDate) {
      return
    }

    dailyReturnIntentRef.current = dailyReturnIntentDate
    trackEvent('daily_return_intent_viewed', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      intentDate: dailyReturnIntentDate,
      surface: retentionLoop.returnIntentPolicy.surface,
      trigger: retentionLoop.returnIntentPolicy.trigger,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
  }, [dailyReturnIntentDate, dailyReturnIntentVisible, dailyStreak, rewardVariant.id])
  useEffect(() => {
    if (!completionNudgeVisible || completionNudgeRef.current === completionRunKey) {
      return
    }

    completionNudgeRef.current = completionRunKey
    trackEvent('completion_nudge_viewed', {
      gameId: selectedGameId,
      runKey: completionRunKey,
      score: snapshot.score,
      moves: snapshot.moves,
      maxMoves: snapshot.maxMoves,
      surface: completionLoop.promptPolicy.surface,
      trigger: completionLoop.promptPolicy.trigger,
      promptId: completionLoop.promptPolicy.id,
      triggerMove: completionLoop.promptPolicy.triggerMove,
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
  }, [
    completionNudgeVisible,
    completionRunKey,
    pacingVariant.id,
    rewardVariant.id,
    selectedGameId,
    snapshot.maxMoves,
    snapshot.moves,
    snapshot.score,
  ])
  useEffect(() => {
    if (!finishLineCoachVisible || finishLineCoachRef.current === finishLineRunKey) {
      return
    }

    finishLineCoachRef.current = finishLineRunKey
    trackEvent('finish_line_coach_viewed', {
      ...finishLineEventProperties(),
      trigger: completionLoop.finishLinePolicy.trigger,
    })
  }, [
    finishLineCoachVisible,
    finishLineExpectedScore,
    finishLineRemainingMoves,
    finishLineRemainingScore,
    finishLineRunKey,
    finishLineTargetScore,
    finishLineEventProperties,
    pacingVariant.id,
    rewardVariant.id,
    selectedGameId,
    snapshot.maxMoves,
    snapshot.moves,
    snapshot.score,
  ])
  useEffect(() => {
    if (!replayPromptVisible || replayPromptRef.current === replayRunKey) {
      return
    }

    replayPromptRef.current = replayRunKey
    trackEvent('replay_prompt_viewed', {
      gameId: selectedGameId,
      runKey: replayRunKey,
      score: snapshot.score,
      moves: snapshot.moves,
      result: snapshot.result,
      surface: replayLoop.promptPolicy.surface,
      trigger: replayLoop.promptPolicy.trigger,
      promptId: replayLoop.promptPolicy.id,
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
  }, [
    pacingVariant.id,
    replayPromptVisible,
    replayRunKey,
    rewardVariant.id,
    selectedGameId,
    snapshot.moves,
    snapshot.result,
    snapshot.score,
  ])
  useEffect(() => {
    const gateEventKey = [
      selectedGameId,
      snapshot.completed,
      snapshot.result,
      monetizationRuntime.placementId,
      monetizationRuntime.status,
    ].join(':')

    if (monetizationGateEventRef.current === gateEventKey) {
      return
    }

    monetizationGateEventRef.current = gateEventKey

    if (monetizationRuntime.canOffer) {
      trackEvent('rewarded_ad_available', {
        gameId: selectedGameId,
        placementId: monetizationRuntime.placementId,
        surface: monetizationRuntime.surface,
        reason: 'runtime_gates_open',
      })
      return
    }

    trackEvent('store_gate_viewed', {
      gameId: selectedGameId,
      placementId: monetizationRuntime.placementId,
      runtimeStatus: monetizationRuntime.status,
      revenueEnabled: monetizationPlan.revenueEnabled,
      guardReason: monetizationRuntime.guardReason,
    })
  }, [
    monetizationRuntime.canOffer,
    monetizationRuntime.guardReason,
    monetizationRuntime.placementId,
    monetizationRuntime.status,
    monetizationRuntime.surface,
    selectedGameId,
    snapshot.completed,
    snapshot.result,
  ])
  const acceptRewardOffer = () => {
    if (!monetizationRuntime.canOffer) {
      trackEvent('store_gate_viewed', {
        gameId: selectedGameId,
        placementId: monetizationRuntime.placementId,
        runtimeStatus: monetizationRuntime.status,
        revenueEnabled: monetizationPlan.revenueEnabled,
        guardReason: monetizationRuntime.guardReason,
        interaction: 'blocked_runtime_click',
      })
      return
    }

    trackEvent('rewarded_ad_started', {
      gameId: selectedGameId,
      placementId: monetizationRuntime.placementId,
      surface: monetizationRuntime.surface,
    })
    markMonetizationOfferConsumed(monetizationRuntime.placementId)
    setRewardOfferConsumed(true)
    trackEvent('rewarded_ad_completed', {
      gameId: selectedGameId,
      placementId: monetizationRuntime.placementId,
      reward: monetizationRuntime.reward,
      revenueCents: 0,
    })
  }
  const connectLocalEventDropFolder = async () => {
    const picker = (window as LocalEventDropWindow).showDirectoryPicker

    if (!picker) {
      setLocalEventDropFolderStatus('unsupported')
      return
    }

    try {
      const handle = await picker({
        id: 'autonomous-game-lab-event-drops',
        mode: 'readwrite',
        startIn: 'downloads',
      })
      const granted = await ensureEventDropFolderPermission(handle)

      if (!granted) {
        setLocalEventDropFolderStatus('permission-needed')
        trackEvent('local_event_drop_folder_failed', {
          reason: 'permission-denied',
          noExternalUpload: true,
          noPiiRequired: true,
        })
        return
      }

      localEventDropDirectoryRef.current = handle
      setLocalEventDropFolderStatus('connected')
      void storeEventDropDirectoryHandle(handle)
      trackEvent('local_event_drop_folder_connected', {
        persistentHandleRequested: true,
        noExternalUpload: true,
        noPiiRequired: true,
      })
    } catch (error) {
      const reason = error instanceof DOMException && error.name === 'AbortError' ? 'cancelled' : 'connect-failed'
      setLocalEventDropFolderStatus(reason === 'cancelled' ? 'not-connected' : 'failed')
      trackEvent('local_event_drop_folder_failed', {
        reason,
        noExternalUpload: true,
        noPiiRequired: true,
      })
    }
  }
  const exportLocalAnalytics = useCallback(async (
    properties: Record<string, string | number | boolean | null> = {},
    options: LocalAnalyticsExportOptions = {},
  ) => {
    const fallbackToDownload = options.fallbackToDownload ?? true
    const eventsBeforeExport = getBufferedEvents()
    const coverageBeforeExport = getLocalAnalyticsExportCoverage(eventsBeforeExport)
    const exportSurface = typeof properties.exportSurface === 'string' ? properties.exportSurface : 'manual'
    const exportTimestamp = new Date().toISOString()
    const folderFileName = eventDropFileName(exportSurface, exportTimestamp)
    trackEvent('analytics_exported', {
      destination: 'local_file',
      ...properties,
      exportSurface,
      eventDropMode: localEventDropDirectoryRef.current ? 'folder-preferred' : 'download',
      eventDropFileName: folderFileName,
      eventDropFolderStatus: localEventDropFolderStatus,
      eventCountAtExport: eventsBeforeExport.length + 1,
      unexportedEventsBeforeExport: coverageBeforeExport.unexportedEvents,
      exportedEventCountBeforeExport: coverageBeforeExport.exportedEventCount,
      exportCoverageRatioBeforeExport: Math.round(coverageBeforeExport.coverageRatio * 1000) / 1000,
      exportCoverageStatusBeforeExport: coverageBeforeExport.status,
      exportDebtThreshold: coverageBeforeExport.exportDebtThreshold,
      exportAgeThresholdHours: coverageBeforeExport.exportAgeThresholdHours,
    })
    const exportedEvents = getBufferedEvents()
    const payload = JSON.stringify(exportedEvents, null, 2)
    let wroteToLocalFolder = false
    const dropDirectory = localEventDropDirectoryRef.current

    if (dropDirectory) {
      try {
        const granted = await ensureEventDropFolderPermission(dropDirectory)

        if (granted) {
          await writeEventDropFile(dropDirectory, folderFileName, payload)
          wroteToLocalFolder = true
          setLocalEventDropFolderStatus('saved')
        } else {
          setLocalEventDropFolderStatus('permission-needed')
        }
      } catch {
        setLocalEventDropFolderStatus('failed')
        trackEvent('local_event_drop_folder_failed', {
          reason: 'write-failed',
          exportSurface,
          noExternalUpload: true,
          noPiiRequired: true,
        })
      }
    }

    if (wroteToLocalFolder) {
      markLocalAnalyticsExported(exportedEvents, exportSurface)
      setEvents(exportedEvents)
      return true
    }

    if (!fallbackToDownload) {
      return false
    }

    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `player-events-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    markLocalAnalyticsExported(exportedEvents, exportSurface)
    setEvents(exportedEvents)
    return true
  }, [localEventDropFolderStatus])

  const openAggregateEvidenceIssue = async () => {
    const { buildAggregateEvidenceIssue } = await import('./lib/aggregateEvidenceIssue')
    const evidenceIssue = buildAggregateEvidenceIssue({
      events: getBufferedEvents(),
      gameId: selectedGameId,
      gameTitle: activeGame.title,
      repository: supportChannel.repository.target ?? null,
      gateSampleCampaignId: activeGateSampleCampaignId,
    })

    if (!evidenceIssue) {
      return
    }

    trackEvent('analytics_evidence_issue_opened', evidenceIssue.telemetry)
    window.open(evidenceIssue.url, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    const onAnalytics = (event: Event) => {
      const analyticsEvent = (event as CustomEvent<AnalyticsEvent>).detail

      if (
        !analyticsEvent ||
        !localEventDropAutosaveEvents.has(analyticsEvent.name) ||
        !localEventDropDirectoryRef.current
      ) {
        return
      }

      localEventDropAutosaveEventIdRef.current = analyticsEvent.id

      if (localEventDropAutosaveTimerRef.current) {
        window.clearTimeout(localEventDropAutosaveTimerRef.current)
      }

      localEventDropAutosaveTimerRef.current = window.setTimeout(() => {
        localEventDropAutosaveTimerRef.current = null
        void exportLocalAnalytics(
          {
            exportSurface: localEventDropAutosaveSurface,
            autoExportTrigger: analyticsEvent.name,
            autoExportEventId: localEventDropAutosaveEventIdRef.current,
            fallbackDownloadEnabled: false,
            noExternalUpload: true,
          },
          { fallbackToDownload: false },
        )
      }, localEventDropAutosaveDelayMs)
    }

    window.addEventListener('agl:analytics', onAnalytics)

    return () => {
      window.removeEventListener('agl:analytics', onAnalytics)

      if (localEventDropAutosaveTimerRef.current) {
        window.clearTimeout(localEventDropAutosaveTimerRef.current)
        localEventDropAutosaveTimerRef.current = null
      }
    }
  }, [exportLocalAnalytics])

  const exportGateSampleEvidence = (
    mission: (typeof productGateSamplePlan.missions)[number],
    exportSurfaceDetail = 'product-gate-sample-plan-card',
  ) => {
    const progress = sampleProgressForMission(mission, getBufferedEvents())

    trackEvent('gate_sample_export_prompt_clicked', {
      exportSurface: 'product-gate-sample',
      exportSurfaceDetail,
      gateId: mission.gateId,
      gameId: mission.gameId,
      campaignId: mission.campaignId,
      localCampaignEvents: progress.campaignEvents,
      localCollectionEvents: progress.collectionEvents,
      localObservedSuccesses: progress.successEvents,
      localAnalyticsExports: progress.analyticsExports,
      localPromptViewsRemaining: progress.promptViewsRemaining,
      localSuccessesRemaining: progress.successesRemaining,
      localEvidenceDropReady: progress.evidenceDropReady,
      localSampleDecisionReady: progress.sampleDecisionReady,
      zeroPaidSpend: true,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
      noRevenueEnablement: mission.controls.noRevenueEnablement,
    })
    exportLocalAnalytics({
      exportSurface: 'product-gate-sample',
      exportSurfaceDetail,
      gateId: mission.gateId,
      gameId: mission.gameId,
      campaignId: mission.campaignId,
      promptViewsNeeded: mission.needed.promptViews,
      observedSuccessesNeeded: mission.needed.successes,
      localCampaignEvents: progress.campaignEvents,
      localCollectionEvents: progress.collectionEvents,
      localPromptViews: progress.promptViews,
      localPromptActions: progress.promptActions,
      localObservedSuccesses: progress.successEvents,
      localFailures: progress.failureEvents,
      localAnalyticsExports: progress.analyticsExports,
      localPromptViewsRemaining: progress.promptViewsRemaining,
      localSuccessesRemaining: progress.successesRemaining,
      localEvidenceDropReady: progress.evidenceDropReady,
      localSampleDecisionReady: progress.sampleDecisionReady,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
    })
  }
  const exportTrafficCampaignEvidence = (campaign: TrafficCampaign) => {
    const progress = trafficProgressForCampaign(campaign, getBufferedEvents())

    exportLocalAnalytics({
      exportSurface: 'organic-seed-campaign',
      gameId: campaign.gameId,
      campaignId: campaign.id,
      priority: campaign.priority,
      costUsd: campaign.costUsd,
      noPaidPromotion: campaign.noPaidPromotion,
      targetStartsBeforeJudgment: campaign.measurement.targetStartsBeforeJudgment,
      localCampaignEvents: progress.campaignEvents,
      localCardViews: progress.cardViews,
      localSeedClicks: progress.seedClicks,
      localOrganicEntries: progress.organicEntries,
      localShareActions: progress.shareActions,
      localStarts: progress.starts,
      localCompletions: progress.completions,
      localAnalyticsExports: progress.analyticsExports,
      localStartsRemaining: progress.startsRemaining,
      localEvidenceDropReady: progress.evidenceDropReady,
      localSampleDecisionReady: progress.sampleDecisionReady,
      localProgressStatus: progress.status,
    })
  }
  const resetRun = () => {
    trackEvent('replay_clicked', {
      gameId: selectedGameId,
      score: snapshot.score,
      moves: snapshot.moves,
      result: snapshot.result,
      surface: 'topbar-reset',
      variantId: pacingVariant.id,
      rewardVariantId: rewardVariant.id,
    })
    window.location.reload()
  }
  const shareActiveGame = async () => {
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    url.searchParams.set('game', selectedGameId)
    url.searchParams.set('utm_source', 'share')
    url.searchParams.set('utm_campaign', selectedGameId)

    let method = 'clipboard'
    let succeeded = false
    const shareData = {
      title: `Play ${activeGame.title}`,
      text: activeGrowthPage?.shortDescription ?? 'Play an original strategy puzzle.',
      url: url.toString(),
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        method = 'native'
        succeeded = true
      } catch {
        method = 'cancelled'
      }
    } else if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url.toString())
        succeeded = true
      } catch {
        method = 'clipboard_unavailable'
      }
    } else {
      method = 'unsupported'
    }

    trackEvent('share_clicked', { gameId: selectedGameId, method, succeeded })
  }

  return (
    <main className="appShell">
      <nav className="topbar" aria-label="Main navigation">
        <div className="brand">
          <span className="brandMark">
            <Gamepad2 size={18} aria-hidden="true" />
          </span>
          <span>Autonomous Game Lab</span>
        </div>
        <div className="topbarActions">
          <button
            className="iconButton"
            type="button"
            title="Queue improvement analysis"
            onClick={() => trackEvent('improvement_requested', { source: 'topbar' })}
          >
            <Bot size={18} aria-hidden="true" />
          </button>
          <button
            className="iconButton"
            type="button"
            title="Export local analytics"
            onClick={() => exportLocalAnalytics()}
          >
            <Download size={18} aria-hidden="true" />
          </button>
          <button
            className="iconButton"
            type="button"
            title={`Share ${activeGame.title}`}
            onClick={shareActiveGame}
          >
            <Share2 size={18} aria-hidden="true" />
          </button>
          <button className="primaryButton" type="button" onClick={resetRun}>
            <RefreshCcw size={18} aria-hidden="true" />
            Reset run
          </button>
        </div>
      </nav>

      <section className="heroBand">
        <div className="introStack">
          <span className="eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            Web-first autonomous studio
          </span>
          <h1>Original board-game-inspired releases, measured from the first move.</h1>
          <div className="gameSwitcher" aria-label="Playable games">
            {playableGames.map((game) => (
              <button
                className="gameSwitchButton"
                type="button"
                key={game.id}
                aria-pressed={selectedGameId === game.id}
                onClick={() => setSelectedGameId(game.id)}
              >
                <span>{game.title}</span>
                <strong>{game.status}</strong>
              </button>
            ))}
          </div>
          <div className="metricStrip" aria-label="Studio operating metrics">
            <div className="metricTile">
              <strong>{games.length + prototypePipeline.length}</strong>
              <span>games in pipeline</span>
            </div>
            <div className="metricTile">
              <strong>{events.length}</strong>
              <span>local events captured</span>
            </div>
            <div className="metricTile">
              <strong>{pacingVariant.id}</strong>
              <span>active onboarding variant</span>
            </div>
            <div className="metricTile">
              <strong>{rewardVariant.id}</strong>
              <span>active reward variant</span>
            </div>
          </div>
        </div>

        <div className="gameStage">
          <div className="canvasFrame">
            <Suspense
              fallback={
                <div className="gameMount gameLoading" aria-label="Loading game canvas">
                  <Activity size={22} aria-hidden="true" />
                  <span>Loading game</span>
                </div>
              }
            >
              <GameCanvas
                key={selectedGameId}
                gameId={selectedGameId}
                variantId={pacingVariant.id}
                rewardVariantId={rewardVariant.id}
                thumbnailVariantId={thumbnailVariant.id}
                activeRunId={activeRunId}
                onSnapshot={setSnapshot}
              />
            </Suspense>
          </div>

          <aside className="sidePanel" aria-label="Autonomy cockpit">
            <div>
              <div className="panelHeader">
                <h2>{activeGame.title}</h2>
                <span className="statusPill">
                  <Activity size={13} aria-hidden="true" />
                  measuring
                </span>
              </div>
              <div className="panelList">
                <div className="factRow">
                  <span>Score</span>
                  <strong>{snapshot.score}</strong>
                </div>
                <div className="factRow" aria-label="Current run moves">
                  <span>Moves</span>
                  <strong>
                    {snapshot.moves}/{snapshot.maxMoves}
                  </strong>
                </div>
                <div className="factRow">
                  <span>Next</span>
                  <strong>{snapshot.nextLabel}</strong>
                </div>
                <div className="factRow">
                  <span>Result</span>
                  <strong>{snapshot.result}</strong>
                </div>
              </div>
              <div className="progressTrack" aria-label="Run completion">
                <span style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div className="monetizationRuntime priorityRuntime" aria-label="Local Learning Router">
              <div>
                <span>Local Learning</span>
                <strong>local-play-router</strong>
              </div>
              <div>
                <span>Next route</span>
                <strong>{localRouterRecommendation.label}</strong>
              </div>
              <div>
                <span>Target</span>
                <strong>
                  {playableGameCatalogById.get(localRouterRecommendation.gameId as PlayableGameId)?.title ??
                    localRouterRecommendation.gameId}
                </strong>
              </div>
              <div>
                <span>Why</span>
                <strong>{localRouterRecommendation.reason}</strong>
              </div>
              <div>
                <span>Local proof</span>
                <strong>
                  {localRouterChoices} choices / {localRouterViews} views
                </strong>
              </div>
              <button className="tinyButton" type="button" onClick={chooseLocalRouterRecommendation}>
                {localRouterRecommendation.ctaLabel}
              </button>
            </div>

            <div className="monetizationRuntime" aria-label="Completion Loop">
              <div>
                <span>Completion Loop</span>
                <strong>{completionLoop.status}</strong>
              </div>
              <div>
                <span>Completion gate</span>
                <strong>
                  {formatPercent(completionLoop.metrics.firstGameCompletion)} /{' '}
                  {formatPercent(completionLoop.metrics.completionGate)}
                </strong>
              </div>
              <div>
                <span>Abandonment</span>
                <strong>{formatPercent(completionLoop.metrics.abandonmentRate)}</strong>
              </div>
              <div>
                <span>Nudge sample</span>
                <strong>
                  {completionLoop.samplePolicy.prompt.current.views}/
                  {completionLoop.samplePolicy.prompt.minimumViewsForDecision}
                </strong>
              </div>
              <div>
                <span>Finish sample</span>
                <strong>
                  {completionLoop.samplePolicy.finishLine.current.views}/
                  {completionLoop.samplePolicy.finishLine.minimumViewsForDecision}
                </strong>
              </div>
              <div>
                <span>Decision</span>
                <strong>{completionLoop.decisionPolicy.currentDecision}</strong>
              </div>
              <div>
                <span>Checkpoint</span>
                <strong>move {completionLoop.promptPolicy.triggerMove}</strong>
              </div>
              {completionNudgeVisible ? (
                <>
                  <div>
                    <span>Progress nudge</span>
                    <strong>{completionLoop.promptPolicy.status}</strong>
                  </div>
                  <div className="completionActions">
                    <button className="tinyButton" type="button" onClick={keepPlayingFromCompletionNudge}>
                      {completionLoop.promptPolicy.ctaLabel}
                    </button>
                    <button className="tinyButton subtleButton" type="button" onClick={dismissCompletionNudge}>
                      {completionLoop.promptPolicy.dismissLabel}
                    </button>
                  </div>
                </>
              ) : null}
              {finishLineCoachVisible ? (
                <>
                  <div>
                    <span>Finish line</span>
                    <strong>
                      {finishLineRemainingScore} in {finishLineRemainingMoves}
                    </strong>
                  </div>
                  <div>
                    <span>Target pace</span>
                    <strong>
                      {Math.max(1, Math.ceil(finishLineRemainingScore / finishLineRemainingMoves))}/turn
                    </strong>
                  </div>
                  <div className="completionActions">
                    <button className="tinyButton" type="button" onClick={focusFromFinishLineCoach}>
                      {completionLoop.finishLinePolicy.ctaLabel}
                    </button>
                    <button className="tinyButton subtleButton" type="button" onClick={dismissFinishLineCoach}>
                      {completionLoop.finishLinePolicy.dismissLabel}
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            <div className="monetizationRuntime" aria-label="Replay Loop">
              <div>
                <span>Replay Loop</span>
                <strong>{replayLoop.status}</strong>
              </div>
              <div>
                <span>Replay gate</span>
                <strong>
                  {formatPercent(replayLoop.metrics.replayRate)} /{' '}
                  {formatPercent(replayLoop.metrics.replayGate)}
                </strong>
              </div>
              <div>
                <span>Prompt</span>
                <strong>{replayLoop.promptPolicy.status}</strong>
              </div>
              <div>
                <span>Replay sample</span>
                <strong>
                  {replayLoop.samplePolicy.current.views}/
                  {replayLoop.samplePolicy.minimumViewsForDecision}
                </strong>
              </div>
              <div>
                <span>Decision</span>
                <strong>{replayLoop.decisionPolicy.currentDecision}</strong>
              </div>
              <div>
                <span>Prompt copy</span>
                <strong>{replayLoop.promptPolicy.copy}</strong>
              </div>
              <div>
                <span>Target</span>
                <strong>{replayLoop.target.title ?? activeGame.title}</strong>
              </div>
              {replayPromptVisible ? (
                <>
                  <div>
                    <span>Fresh run</span>
                    <strong>{snapshot.result}</strong>
                  </div>
                  <div className="replayActions">
                    <button className="tinyButton" type="button" onClick={playAgainFromReplayPrompt}>
                      {replayLoop.promptPolicy.ctaLabel}
                    </button>
                    <button className="tinyButton subtleButton" type="button" onClick={dismissReplayPrompt}>
                      {replayLoop.promptPolicy.dismissLabel}
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            <div className="monetizationRuntime" aria-label="Daily Retention">
              <div>
                <span>Daily Retention</span>
                <strong>{retentionLoop.status}</strong>
              </div>
              <div>
                <span>Challenge</span>
                <strong>{dailyChallengeGame?.title ?? retentionLoop.dailyChallenge.title}</strong>
              </div>
              <div>
                <span>Streak</span>
                <strong>
                  {dailyStreak}/{bestDailyStreak}
                </strong>
              </div>
              <div>
                <span>D1 retention</span>
                <strong>{formatPercent(retentionLoop.metrics.d1Retention)}</strong>
              </div>
              <div>
                <span>Sample</span>
                <strong>{retentionLoop.samplePolicy.status}</strong>
              </div>
              <div>
                <span>Sample target</span>
                <strong>
                  {retentionLoop.samplePolicy.needed.promptViews} views /{' '}
                  {retentionLoop.samplePolicy.needed.successes} returns
                </strong>
              </div>
              <div>
                <span>Return intent</span>
                <strong>{dailyReturnIntentDate || 'open'}</strong>
              </div>
              {dailyReturnIntentVisible ? (
                <>
                  <div>
                    <span>Queued return</span>
                    <strong>{dailyReturnIntentDate}</strong>
                  </div>
                  <div>
                    <span>Intent copy</span>
                    <strong>{retentionLoop.returnIntentPolicy.copy}</strong>
                  </div>
                  <div className="retentionActions">
                    <button className="tinyButton" type="button" onClick={startQueuedReturnIntent}>
                      {retentionLoop.returnIntentPolicy.ctaLabel}
                    </button>
                    <button className="tinyButton subtleButton" type="button" onClick={clearQueuedReturnIntent}>
                      {retentionLoop.returnIntentPolicy.dismissLabel}
                    </button>
                  </div>
                </>
              ) : null}
              {dailyReturnPromptVisible ? (
                <>
                  <div>
                    <span>Return prompt</span>
                    <strong>{retentionLoop.promptPolicy.status}</strong>
                  </div>
                  <div>
                    <span>Prompt copy</span>
                    <strong>{retentionLoop.promptPolicy.copy}</strong>
                  </div>
                  <div>
                    <span>Next board</span>
                    <strong>{nextDailyChallengeDate}</strong>
                  </div>
                  <div className="retentionActions">
                    <button className="tinyButton" type="button" onClick={queueDailyReturn}>
                      {retentionLoop.promptPolicy.ctaLabel}
                    </button>
                    <button className="tinyButton subtleButton" type="button" onClick={dismissDailyReturn}>
                      {retentionLoop.promptPolicy.dismissLabel}
                    </button>
                  </div>
                </>
              ) : null}
              <button className="tinyButton" type="button" onClick={startDailyChallenge}>
                Play daily challenge
              </button>
            </div>

            <div className="monetizationRuntime" aria-label="PWA Install Loop">
              <div>
                <span>PWA Install</span>
                <strong>{pwaInstallLoop.status}</strong>
              </div>
              <div>
                <span>Prompt</span>
                <strong>{pwaInstallStatus}</strong>
              </div>
              <div>
                <span>Launch</span>
                <strong>{pwaDisplayMode}</strong>
              </div>
              <div>
                <span>Install sample</span>
                <strong>{pwaInstallLoop.samplePolicy.status}</strong>
              </div>
              <div>
                <span>Sample target</span>
                <strong>
                  {pwaInstallLoop.samplePolicy.needed.promptViews} prompts /{' '}
                  {pwaInstallLoop.samplePolicy.needed.launchModes} launches
                </strong>
              </div>
              <div>
                <span>Installs</span>
                <strong>{pwaInstallLoop.metrics.installed}</strong>
              </div>
              <button
                className="tinyButton"
                type="button"
                disabled={!pwaPromptEligible}
                onClick={promptPwaInstall}
              >
                {pwaInstallButtonLabel}
              </button>
            </div>

            {productGateSampleEvidenceHandoff ? (
              <div className="monetizationRuntime" aria-label="Gate Sample Evidence Handoff">
                <div>
                  <span>Gate sample</span>
                  <strong>{productGateSampleEvidenceHandoff.mission.title}</strong>
                </div>
                <div>
                  <span>State</span>
                  <strong>{productGateSampleEvidenceHandoffStatus}</strong>
                </div>
                <div>
                  <span>Local events</span>
                  <strong>{productGateSampleEvidenceHandoff.progress.campaignEvents}</strong>
                </div>
                <div>
                  <span>Observed wins</span>
                  <strong>{productGateSampleEvidenceHandoff.progress.successEvents}</strong>
                </div>
                <div>
                  <span>Export debt</span>
                  <strong>{localAnalyticsCoverage.unexportedEvents}</strong>
                </div>
                <div className="sampleActions">
                  <button
                    className="tinyButton"
                    type="button"
                    onClick={() =>
                      exportGateSampleEvidence(
                        productGateSampleEvidenceHandoff.mission,
                        'runtime-gate-sample-handoff',
                      )
                    }
                  >
                    <Download size={14} aria-hidden="true" />
                    Export evidence for {productGateSampleEvidenceHandoff.mission.title}
                  </button>
                  <button
                    className="tinyButton subtleButton"
                    type="button"
                    onClick={() => startGateSampleMission(productGateSampleEvidenceHandoff.mission)}
                  >
                    Continue sample for {productGateSampleEvidenceHandoff.mission.title}
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <div className="panelHeader">
                <h2>Events</h2>
                <BarChart3 size={20} aria-hidden="true" />
              </div>
              <div className="panelList">
                {[
                  'game_viewed',
                  'game_started',
                  'tutorial_completed',
                  'turn_taken',
                  'level_completed',
                  'completion_nudge_clicked',
                  'replay_prompt_clicked',
                  'organic_seed_share_clicked',
                  'seed_campaign_clicked',
                  'daily_challenge_completed',
                  'daily_return_intent_started',
                  'pwa_install_prompt_available',
                  'pwa_installed',
                  'local_router_choice_clicked',
                  'gate_sample_export_prompt_clicked',
                ].map((name) => (
                  <div className="eventRow" key={name}>
                    <span>{name}</span>
                    <strong>{eventCounts[name] ?? 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="sectionBand">
        <div className="sectionPanel">
          <div className="sectionHeader">
            <div>
              <h2>Release Pipeline</h2>
              <p>
                The portal starts with one live game and keeps future concepts in a structured queue
                so automation can rank them by retention, monetization, and IP risk before release.
              </p>
            </div>
            <button className="secondaryButton" type="button">
              <Play size={17} aria-hidden="true" />
              Ship winner
            </button>
          </div>
          <div className="gameGrid">
            {games.map((game) => (
              <article
                className={`gameCard ${thumbnailVariant.id === 'board-state' ? 'gameCardBoardState' : ''}`}
                data-thumbnail-variant={thumbnailVariant.id}
                key={game.id}
              >
                <div
                  className={`gameArt ${thumbnailVariant.id === 'board-state' ? 'gameArtBoardState' : ''}`}
                  aria-hidden="true"
                >
                  {Array.from({ length: 15 }, (_, index) => (
                    <span key={index} />
                  ))}
                </div>
                <div>
                  <h3>{game.title}</h3>
                  <p>{game.pitch}</p>
                </div>
                <div className="tagRow">
                  <span className="tag">{game.status}</span>
                  <span className="tag">{game.mechanic}</span>
                  <span className="tag">R {game.retentionSignal}</span>
                  <span className="tag">$ {game.monetizationSignal}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sectionBand">
        <div className="sectionPanel">
          <div className="sectionHeader">
            <div>
              <h2>Generated Prototype Queue</h2>
              <p>
                Accepted concepts become build-ready prototype plans with original rules, telemetry,
                monetization gates, and app-store blockers before any release work starts.
              </p>
            </div>
            <span className="statusPill">
              <Rocket size={13} aria-hidden="true" />
              {nextPrototype?.title ?? 'All current prototypes playable'}
            </span>
          </div>

          <div className="prototypeGrid">
            {prototypePipeline.slice(0, 4).map((item) => (
              <article className="prototypeCard" key={item.id}>
                <div className="prototypeTopline">
                  <span className="rankBadge">#{item.rank}</span>
                  <span className="tag">{item.status}</span>
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.concept.gameBrief.playerPromise}</p>
                </div>
                <div className="prototypeFacts">
                  <div>
                    <span>Template</span>
                    <strong>{item.prototype.template}</strong>
                  </div>
                  <div>
                    <span>Score</span>
                    <strong>{item.releaseScore}</strong>
                  </div>
                  <div>
                    <span>Revenue</span>
                    <strong>{item.monetization.status}</strong>
                  </div>
                  <div>
                    <span>Android</span>
                    <strong>{item.distribution.googlePlay.status}</strong>
                  </div>
                </div>
                <div className="gateList">
                  {item.distribution.googlePlay.blockers.slice(0, 2).map((blocker) => (
                    <span key={blocker}>{blocker}</span>
                  ))}
                </div>
                <button
                  className="tinyButton"
                  type="button"
                  onClick={() =>
                    trackEvent('prototype_card_viewed', {
                      prototypeId: item.id,
                      title: item.title,
                      status: item.status,
                    })
                  }
                >
                  View plan
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sectionBand">
        <div className="autonomyGrid">
          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Owner Loop</h2>
                <p>One generated operating state chooses the next safe zero-cost production move.</p>
              </div>
              <Bot size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Status</span>
                <strong>{autonomousOwnerLoop.status}</strong>
              </div>
              <div className="factRow">
                <span>Mode</span>
                <strong>{autonomousOwnerLoop.mode}</strong>
              </div>
              <div className="factRow">
                <span>Autonomy score</span>
                <strong>{autonomousOwnerLoop.autonomyScore.percent}%</strong>
              </div>
              <div className="factRow">
                <span>Next action</span>
                <strong>{autonomousOwnerLoop.ownerDecision.nextBestActionId}</strong>
              </div>
              <div className="factRow">
                <span>External accounts</span>
                <strong>
                  {autonomousOwnerLoop.controls.externalAccountInterventionRequired
                    ? 'credential-gated'
                    : 'clear'}
                </strong>
              </div>
              <div className="monetizationRuntime" aria-label="Performance Budget">
                <div>
                  <span>Performance Budget</span>
                  <strong>{performanceBudget.status}</strong>
                </div>
                <div>
                  <span>Initial JS</span>
                  <strong>{performanceBudget.initial.jsKb} KB</strong>
                </div>
                <div>
                  <span>Initial gzip</span>
                  <strong>{performanceBudget.initial.gzipKb} KB</strong>
                </div>
                <div>
                  <span>Game chunk</span>
                  <strong>{performanceGameChunk ? `${performanceGameChunk.kb} KB` : 'missing'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Live Site Monitor">
                <div>
                  <span>Live Site Monitor</span>
                  <strong>{liveSiteMonitor.status}</strong>
                </div>
                <div>
                  <span>Origin</span>
                  <strong>{liveSiteMonitorOrigin}</strong>
                </div>
                <div>
                  <span>Checks</span>
                  <strong>
                    {liveSiteMonitor.summary.passed}/{liveSiteMonitor.summary.planned}
                  </strong>
                </div>
                <div>
                  <span>Synced release</span>
                  <strong>{liveSiteMonitor.summary.liveMatchesSyncedDeploy ? 'matched' : 'review'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Production Bootstrap">
                <div>
                  <span>Production Bootstrap</span>
                  <strong>{productionBootstrap.status}</strong>
                </div>
                <div>
                  <span>Mode</span>
                  <strong>{productionBootstrap.mode}</strong>
                </div>
                <div>
                  <span>Setup groups</span>
                  <strong>
                    {productionBootstrapReadyGroups}/{productionBootstrap.summary.totalGroups}
                  </strong>
                </div>
                <div>
                  <span>External blockers</span>
                  <strong>{productionBootstrap.summary.externalBlockers}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Production Blocker Handoff">
                <div>
                  <span>Production Handoff</span>
                  <strong>{productionBlockerHandoff.status}</strong>
                </div>
                <div>
                  <span>Next unlock</span>
                  <strong>{productionBlockerNextHandoff?.id ?? 'none'}</strong>
                </div>
                <div>
                  <span>Owner inputs</span>
                  <strong>{productionBlockerHandoff.summary.ownerActionRequired}</strong>
                </div>
                <div>
                  <span>Missing config</span>
                  <strong>
                    {productionBlockerHandoff.summary.missingEnv}/{productionBlockerHandoff.summary.missingSecrets}
                  </strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Production Activation">
                <div>
                  <span>Production Activation</span>
                  <strong>{productionActivation.status}</strong>
                </div>
                <div>
                  <span>Mode</span>
                  <strong>{productionActivation.mode}</strong>
                </div>
                <div>
                  <span>Execution</span>
                  <strong>{productionActivation.execution.status}</strong>
                </div>
                <div>
                  <span>Runnable actions</span>
                  <strong>{productionActivationRunnableActions}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Support Channel">
                <div>
                  <span>Support Channel</span>
                  <strong>{supportChannelStatus}</strong>
                </div>
                <div>
                  <span>Provider</span>
                  <strong>{supportChannel.provider}</strong>
                </div>
                <div>
                  <span>Repository</span>
                  <strong>{supportChannelRepository}</strong>
                </div>
                <div>
                  <span>Public intake</span>
                  <strong>{supportChannelReady ? 'ready' : 'planned'}</strong>
                </div>
                <div>
                  <span>Store email</span>
                  <strong>
                    {supportChannel.controls.supportEmailStillRequiredForStoreSubmission
                      ? 'still required'
                      : 'review'}
                  </strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Support Feedback">
                <div>
                  <span>Support Feedback</span>
                  <strong>{supportFeedback.status}</strong>
                </div>
                <div>
                  <span>Issues inspected</span>
                  <strong>{supportFeedback.summary.issuesInspected}</strong>
                </div>
                <div>
                  <span>Signals</span>
                  <strong>{supportFeedback.summary.improvementSignals}</strong>
                </div>
                <div>
                  <span>Aggregate notes</span>
                  <strong>{supportFeedbackAggregateEvidence.notes}</strong>
                </div>
                <div>
                  <span>Top signal</span>
                  <strong>{supportFeedbackTopSignal?.label ?? 'collecting'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Repository Channel">
                <div>
                  <span>Repository Channel</span>
                  <strong>{repositoryReadiness.status}</strong>
                </div>
                <div>
                  <span>Git worktree</span>
                  <strong>{repositoryReadiness.workspace.insideWorkTree ? 'ready' : 'missing'}</strong>
                </div>
                <div>
                  <span>Repository</span>
                  <strong>{repositoryReadiness.repository.target ?? 'missing'}</strong>
                </div>
                <div>
                  <span>Planned target</span>
                  <strong>{repositoryReadiness.repositoryTargetPlan.plannedTarget}</strong>
                </div>
                <div>
                  <span>Pages origin</span>
                  <strong>{repositoryReadiness.repositoryTargetPlan.pages?.origin ?? 'missing'}</strong>
                </div>
                <div>
                  <span>Pages build</span>
                  <strong>{repositoryReadiness.pages.liveSettings.buildType ?? 'unknown'}</strong>
                </div>
                <div>
                  <span>Pages HTTPS</span>
                  <strong>{repositoryReadiness.pages.liveSettings.httpsEnforced ? 'enforced' : 'blocked'}</strong>
                </div>
                <div>
                  <span>Workflow dispatch</span>
                  <strong>{repositoryReadiness.githubAutomation.workflowDispatchReady ? 'ready' : 'blocked'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Repository Bootstrap">
                <div>
                  <span>Repository Bootstrap</span>
                  <strong>{repositoryBootstrap.status}</strong>
                </div>
                <div>
                  <span>Mode</span>
                  <strong>{repositoryBootstrap.mode}</strong>
                </div>
                <div>
                  <span>Helper</span>
                  <strong>{repositoryBootstrap.helper.path}</strong>
                </div>
                <div>
                  <span>Create URL</span>
                  <strong>{repositoryBootstrap.repositoryTargetPlan.githubNewRepositoryUrl}</strong>
                </div>
                <div>
                  <span>Local git</span>
                  <strong>{repositoryBootstrap.workspace.after.insideWorkTree ? 'ready' : 'missing'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Autonomous Operator">
                <div>
                  <span>Autonomous Operator</span>
                  <strong>{autonomousOperator.status}</strong>
                </div>
                <div>
                  <span>Mode</span>
                  <strong>{autonomousOperator.mode}</strong>
                </div>
                <div>
                  <span>Selected action</span>
                  <strong>{operatorSelectedAction?.id ?? 'none'}</strong>
                </div>
                <div>
                  <span>Execution</span>
                  <strong>{autonomousOperator.execution.status}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Local Event Bridge">
                <div>
                  <span>Local Event Bridge</span>
                  <strong>{localEventBridge.status}</strong>
                </div>
                <div>
                  <span>Inbox events</span>
                  <strong>{localEventBridge.inbox.validEvents}</strong>
                </div>
                <div>
                  <span>Imported events</span>
                  <strong>{localEventBridge.imported.events}</strong>
                </div>
                <div>
                  <span>Export debt</span>
                  <strong>{localAnalyticsCoverage.unexportedEvents} event(s)</strong>
                </div>
                <div>
                  <span>Export coverage</span>
                  <strong>{formatPercent(localAnalyticsCoverage.coverageRatio)}</strong>
                </div>
                <div>
                  <span>Last export</span>
                  <strong>{localAnalyticsCoverage.lastExportedAt?.slice(0, 10) ?? 'never'}</strong>
                </div>
                <div>
                  <span>Drop folder</span>
                  <strong>{localEventDropFolderStatus}</strong>
                </div>
                <div>
                  <span>Autosave</span>
                  <strong>{localEventDropAutosaveStatus}</strong>
                </div>
                <div className="eventDropActions">
                  <button
                    className="tinyButton"
                    type="button"
                    onClick={connectLocalEventDropFolder}
                    disabled={localEventDropFolderStatus === 'unsupported'}
                  >
                    <FolderInput size={14} aria-hidden="true" />
                    Connect folder
                  </button>
                  <button
                    className="tinyButton"
                    type="button"
                    onClick={openAggregateEvidenceIssue}
                    disabled={!supportChannel.repository.target}
                  >
                    <Share2 size={14} aria-hidden="true" />
                    Share aggregate evidence
                  </button>
                </div>
                <div>
                  <span>External upload</span>
                  <strong>{localEventBridge.controls.noExternalUpload ? 'blocked' : 'open'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Operator History">
                <div>
                  <span>Operator History</span>
                  <strong>{autonomousOperatorHistory.status}</strong>
                </div>
                <div>
                  <span>Records</span>
                  <strong>{operatorHistorySummary.totalRecords}</strong>
                </div>
                <div>
                  <span>Executed</span>
                  <strong>{operatorHistorySummary.executedRecords}</strong>
                </div>
                <div>
                  <span>Last action</span>
                  <strong>{operatorHistorySummary.lastActionId ?? 'none'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Autonomous Cadence">
                <div>
                  <span>Autonomous Cadence</span>
                  <strong>{autonomousCadence.status}</strong>
                </div>
                <div>
                  <span>Codex app</span>
                  <strong>{autonomousCadence.schedulers.codexDesktop.status}</strong>
                </div>
                <div>
                  <span>GitHub Actions</span>
                  <strong>{autonomousCadence.schedulers.githubActions.status}</strong>
                </div>
                <div>
                  <span>Freshness</span>
                  <strong>{autonomousCadence.freshness.status}</strong>
                </div>
                <div>
                  <span>Stale evidence</span>
                  <strong>{autonomousCadence.freshness.staleArtifacts}</strong>
                </div>
                <div>
                  <span>Operate</span>
                  <strong>{autonomousCadence.commandPlan.operate}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Autonomous Self Update">
                <div>
                  <span>Autonomous Self Update</span>
                  <strong>{autonomousSelfUpdate.status}</strong>
                </div>
                <div>
                  <span>Workflow</span>
                  <strong>{autonomousSelfUpdate.commitPlan.workflow}</strong>
                </div>
                <div>
                  <span>Safe pending</span>
                  <strong>{autonomousSelfUpdate.pendingChanges.safeCount}</strong>
                </div>
                <div>
                  <span>Direct push</span>
                  <strong>{autonomousSelfUpdate.repository.remotePushReady ? 'ready' : 'gated'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Objective Audit">
                <div>
                  <span>Objective Audit</span>
                  <strong>{objectiveAudit.status}</strong>
                </div>
                <div>
                  <span>Met</span>
                  <strong>
                    {objectiveAuditSummary.met}/{objectiveAuditSummary.requirements}
                  </strong>
                </div>
                <div>
                  <span>Prepared</span>
                  <strong>{objectiveAuditSummary.prepared}</strong>
                </div>
                <div>
                  <span>Can complete</span>
                  <strong>{objectiveAudit.completion.canMarkGoalComplete ? 'yes' : 'blocked'}</strong>
                </div>
                <div>
                  <span>Next action</span>
                  <strong>{objectiveAudit.completion.nextBestAction}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="sectionPanel">
          <div className="sectionHeader">
            <div>
              <h2>Autonomous Backlog</h2>
              <p>Generated fixes are ranked by impact and confidence before they become tasks.</p>
              </div>
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              {autonomyBacklog.map((item) => (
                <div className="backlogRow" key={item.title}>
                  <span>{item.title}</span>
                  <strong>{item.confidence}%</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Portfolio Policy</h2>
                <p>Daily rotation favors games that need traffic, fixes, or stronger live evidence.</p>
              </div>
              <Sparkles size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Status</span>
                <strong>{portfolioPolicy.status}</strong>
              </div>
              <div className="factRow">
                <span>Daily game</span>
                <strong>{portfolioPolicy.dailyChallenge.title}</strong>
              </div>
              <div className="factRow">
                <span>Analytics</span>
                <strong>{portfolioPolicy.analyticsSource}</strong>
              </div>
              <div className="factRow">
                <span>Paid promotion</span>
                <strong>{portfolioPolicy.guardrails.noPaidPromotion ? 'blocked' : 'allowed'}</strong>
              </div>
              {portfolioTopGames.map((game) => (
                <div className="backlogRow" key={game.gameId}>
                  <span>{game.title}</span>
                  <strong>{game.action}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Release Health</h2>
                <p>Runtime and behavior guardrails decide whether rollout and experiments keep moving.</p>
              </div>
              <ShieldAlert size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Status</span>
                <strong>{releaseHealth.status}</strong>
              </div>
              <div className="factRow">
                <span>Analytics</span>
                <strong>{releaseHealth.analyticsSource}</strong>
              </div>
              <div className="factRow">
                <span>Runtime errors</span>
                <strong>{releaseHealth.metrics.runtimeErrors}</strong>
              </div>
              <div className="factRow">
                <span>Completion</span>
                <strong>{formatPercent(releaseHealth.metrics.firstGameCompletion)}</strong>
              </div>
              <div className="factRow">
                <span>Replay</span>
                <strong>{formatPercent(releaseHealth.metrics.replayRate)}</strong>
              </div>
              <div className="factRow">
                <span>D1 retention</span>
                <strong>{formatPercent(releaseHealth.metrics.d1Retention)}</strong>
              </div>
              <div className="monetizationRuntime" aria-label="Product Optimization">
                <div>
                  <span>Product Optimization</span>
                  <strong>{productOptimization.status}</strong>
                </div>
                <div>
                  <span>Completion gate</span>
                  <strong>
                    {formatPercent(productOptimization.productGates.firstGameCompletion.actual)} /{' '}
                    {formatPercent(productOptimization.productGates.firstGameCompletion.gate)}
                  </strong>
                </div>
                <div>
                  <span>Replay gate</span>
                  <strong>
                    {formatPercent(productOptimization.productGates.replayRate.actual)} /{' '}
                    {formatPercent(productOptimization.productGates.replayRate.gate)}
                  </strong>
                </div>
                <div>
                  <span>Latest action</span>
                  <strong>{productOptimizationAction?.status ?? 'monitor'}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Product Gate Recovery">
                <div>
                  <span>Gate Recovery</span>
                  <strong>{productGateRecovery.status}</strong>
                </div>
                <div>
                  <span>Primary gate</span>
                  <strong>{productGateRecovery.summary.primaryBottleneck}</strong>
                </div>
                <div>
                  <span>Observed lift</span>
                  <strong>{productGateRecoveryPrimaryGate.neededSuccesses} wins</strong>
                </div>
                <div>
                  <span>Experiment</span>
                  <strong>{productGateRecovery.summary.primaryExperimentStatus}</strong>
                </div>
                <div>
                  <span>Next sample</span>
                  <strong>{productGateRecoveryPrimary?.promptViewsNeeded ?? 0} views</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Product Gate Sample Plan">
                <div>
                  <span>Sample Plan</span>
                  <strong>{productGateSamplePlan.status}</strong>
                </div>
                <div>
                  <span>Primary mission</span>
                  <strong>{productGateSamplePrimary?.gateId ?? 'none'}</strong>
                </div>
                <div>
                  <span>Fastest mission</span>
                  <strong>{productGateSampleFastest?.gateId ?? 'none'}</strong>
                </div>
                <div>
                  <span>Default route</span>
                  <strong>{productGateSampleDefaultMission?.gateId ?? 'none'}</strong>
                </div>
                <div>
                  <span>Prompt debt</span>
                  <strong>{productGateSamplePlan.summary.totalPromptViewsNeeded} views</strong>
                </div>
                <div>
                  <span>Zero spend</span>
                  <strong>{productGateSamplePlan.controls.zeroPaidSpend ? 'yes' : 'review'}</strong>
                </div>
                <div>
                  <span>Evidence</span>
                  <strong>{productGateSamplePrimary?.evidence.status ?? 'waiting'}</strong>
                </div>
                <div>
                  <span>Local sample</span>
                  <strong>
                    {productGateSamplePrimaryProgress
                      ? `${productGateSamplePrimaryProgress.campaignEvents} events / ${productGateSamplePrimaryProgress.successEvents} wins`
                      : 'none'}
                  </strong>
                </div>
                <div>
                  <span>Local debt</span>
                  <strong>
                    {productGateSamplePrimaryProgress
                      ? `${productGateSamplePrimaryProgress.promptViewsRemaining} views / ${productGateSamplePrimaryProgress.successesRemaining} wins`
                      : 'none'}
                  </strong>
                </div>
                <div>
                  <span>Export state</span>
                  <strong>
                    {productGateSamplePrimaryProgress?.sampleDecisionReady
                      ? 'decision-ready'
                      : productGateSamplePrimaryProgress?.evidenceDropReady
                        ? 'export-ready'
                        : 'collecting'}
                  </strong>
                </div>
                {productGateSampleFastestDistinct && productGateSampleFastestProgress ? (
                  <div>
                    <span>Fastest local</span>
                    <strong>
                      {productGateSampleFastestProgress.campaignEvents} events /{' '}
                      {productGateSampleFastestProgress.successEvents} wins
                    </strong>
                  </div>
                ) : null}
                {productGateSamplePrimary ? (
                  <div className="sampleActions">
                    <button
                      className="tinyButton"
                      type="button"
                      onClick={() => startGateSampleMission(productGateSamplePrimary)}
                    >
                      Start sample for {productGateSamplePrimary.title}
                    </button>
                    <button
                      className="tinyButton"
                      type="button"
                      onClick={() => exportGateSampleEvidence(productGateSamplePrimary)}
                    >
                      Export sample evidence for {productGateSamplePrimary.title}
                    </button>
                    <button
                      className="tinyButton subtleButton"
                      type="button"
                      onClick={() => shareGateSampleMission(productGateSamplePrimary)}
                    >
                      <Share2 size={14} aria-hidden="true" />
                      Share sample for {productGateSamplePrimary.title}
                    </button>
                    {productGateSampleFastestDistinct ? (
                      <>
                        <button
                          className="tinyButton"
                          type="button"
                          onClick={() => startGateSampleMission(productGateSampleFastestDistinct)}
                        >
                          Start fastest sample for {productGateSampleFastestDistinct.title}
                        </button>
                        <button
                          className="tinyButton"
                          type="button"
                          onClick={() => exportGateSampleEvidence(productGateSampleFastestDistinct)}
                        >
                          Export fastest evidence for {productGateSampleFastestDistinct.title}
                        </button>
                        <button
                          className="tinyButton subtleButton"
                          type="button"
                          onClick={() => shareGateSampleMission(productGateSampleFastestDistinct)}
                        >
                          <Share2 size={14} aria-hidden="true" />
                          Share fastest sample for {productGateSampleFastestDistinct.title}
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="monetizationRuntime" aria-label="First Move Coach">
                <div>
                  <span>First Move Coach</span>
                  <strong>{firstMoveCoach.status}</strong>
                </div>
                <div>
                  <span>Enabled targets</span>
                  <strong>{firstMoveCoach.summary.enabledTargets}</strong>
                </div>
                <div>
                  <span>Coach sample</span>
                  <strong>{firstMoveCoach.samplePolicy.status}</strong>
                </div>
                <div>
                  <span>Usage / skip</span>
                  <strong>
                    {formatPercent(firstMoveCoach.metrics.usageRate)} /{' '}
                    {formatPercent(firstMoveCoach.metrics.skipRate)}
                  </strong>
                </div>
                <div>
                  <span>Primary target</span>
                  <strong>{firstMoveCoachPrimary?.title ?? 'none'}</strong>
                </div>
                <div>
                  <span>Decision</span>
                  <strong>{firstMoveCoach.decisionPolicy.currentDecision}</strong>
                </div>
                <div>
                  <span>Runtime guard</span>
                  <strong>{firstMoveCoach.controls.noAutoMove ? 'first-turn-only' : 'review'}</strong>
                </div>
              </div>
              <div className="factRow">
                <span>Deploy guard</span>
                <strong>{releaseHealth.controls.canDeploy ? 'open' : 'held'}</strong>
              </div>
              <div className="factRow">
                <span>Experiment changes</span>
                <strong>{releaseHealth.controls.canApplyExperimentChanges ? 'allowed' : 'held'}</strong>
              </div>
              <div className="factRow">
                <span>Environment</span>
                <strong>{productionEnvironment.status}</strong>
              </div>
              <div className="factRow">
                <span>Public origin</span>
                <strong>{productionEnvironment.publicOrigin.status}</strong>
              </div>
            </div>
          </div>

          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Experiment Learning</h2>
              </div>
              <BarChart3 size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Status</span>
                <strong>{experimentResults.status}</strong>
              </div>
              <div className="factRow">
                <span>Source</span>
                <strong>{experimentResults.sourceStatus.activeSource}</strong>
              </div>
              {topExperimentRecommendations.map((recommendation) => (
                <div className="backlogRow" key={recommendation.experiment}>
                  <span>{recommendation.experiment}</span>
                  <strong>{recommendation.action}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Production Response</h2>
              </div>
              <Bot size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Mode</span>
                <strong>{productionResponse.status}</strong>
              </div>
              <div className="factRow">
                <span>Deploy</span>
                <strong>{productionResponse.controls.deployAllowed ? 'allowed' : 'held'}</strong>
              </div>
              <div className="factRow">
                <span>Rollback</span>
                <strong>{productionResponse.controls.rollbackRequired ? 'required' : 'clear'}</strong>
              </div>
              <div className="factRow">
                <span>Experiments</span>
                <strong>{productionResponse.controls.experimentsFrozen ? 'frozen' : 'armed'}</strong>
              </div>
              <div className="factRow">
                <span>Incident drill</span>
                <strong>{incidentDrill.status}</strong>
              </div>
              <div className="factRow">
                <span>Drill rollback</span>
                <strong>{incidentDrill.controls.rollbackRequired ? 'verified' : 'missing'}</strong>
              </div>
              {activeProductionActions.map((action) => (
                <div className="backlogRow" key={action.id}>
                  <span>{action.id}</span>
                  <strong>{action.status}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Monetization Path</h2>
              </div>
              <Coins size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Revenue mode</span>
                <strong>{monetizationPlan.status}</strong>
              </div>
              <div className="factRow">
                <span>Enabled</span>
                <strong>{monetizationPlan.revenueEnabled ? 'yes' : 'no'}</strong>
              </div>
              <div className="factRow">
                <span>First placement</span>
                <strong>{firstPlacement?.status ?? 'disabled'}</strong>
              </div>
              <div className="monetizationRuntime" aria-label="Revenue runtime">
                <div>
                  <span>Runtime offer</span>
                  <strong>{monetizationRuntime.status}</strong>
                </div>
                <div>
                  <span>Placement</span>
                  <strong>{monetizationRuntime.placementId}</strong>
                </div>
                <div>
                  <span>Reward</span>
                  <strong>{monetizationRuntime.reward}</strong>
                </div>
                <button
                  className="tinyButton"
                  type="button"
                  disabled={!monetizationRuntime.canOffer}
                  onClick={acceptRewardOffer}
                >
                  {monetizationRuntime.canOffer ? 'Claim rewarded hint' : 'Revenue gate held'}
                </button>
              </div>
              <div className="factRow">
                <span>Ad network</span>
                <strong>
                  {monetizationPlan.adNetwork.web?.configured || monetizationPlan.adNetwork.app?.configured
                    ? 'configured'
                    : 'pending'}
                </strong>
              </div>
              <div className="factRow">
                <span>app-ads.txt</span>
                <a href="/app-ads.txt" target="_blank" rel="noreferrer">
                  generated
                </a>
              </div>
              <div className="factRow">
                <span>Current spend</span>
                <strong>$0 infra</strong>
              </div>
              <div className="factRow">
                <span>Spend guard</span>
                <strong>{unitEconomics.status}</strong>
              </div>
              <div className="factRow">
                <span>Max daily spend</span>
                <strong>{formatUsd(unitEconomics.controls.maxDailySpendUsd)}</strong>
              </div>
              <div className="factRow">
                <span>Paid acquisition</span>
                <strong>{unitEconomics.controls.paidAcquisitionAllowed ? 'allowed' : 'blocked'}</strong>
              </div>
              <div className="factRow">
                <span>First channel</span>
                <strong>{webPromotion?.status ?? 'web/PWA'}</strong>
              </div>
              <div className="factRow">
                <span>Web deploy</span>
                <strong>{deploymentPlan.status}</strong>
              </div>
              <div className="factRow">
                <span>Event collector</span>
                <strong>{eventCollectorDeployment.status}</strong>
              </div>
              <div className="factRow">
                <span>Next paid gate</span>
                <strong>Google Play</strong>
              </div>
              <div className="factRow">
                <span>Native package</span>
                <strong>{nativePackage.status}</strong>
              </div>
              <div className="factRow">
                <span>Android release</span>
                <strong>{androidRelease.status}</strong>
              </div>
              <div className="monetizationRuntime" aria-label="Store Compliance">
                <div>
                  <span>Store compliance</span>
                  <strong>{storeCompliance.status}</strong>
                </div>
                <div>
                  <span>Content rating</span>
                  <strong>{storeCompliance.contentRating.googlePlay.expectedRating}</strong>
                </div>
                <div>
                  <span>Target audience</span>
                  <strong>
                    {storeCompliance.targetAudience.directedToChildren ? 'child-directed' : 'general'}
                  </strong>
                </div>
                <div>
                  <span>Ads declaration</span>
                  <strong>{storeCompliance.adsAndMonetization.status}</strong>
                </div>
              </div>
              <div className="monetizationRuntime" aria-label="Store Listing Optimizer">
                <div>
                  <span>Store listing</span>
                  <strong>{storeListingOptimizer.status}</strong>
                </div>
                <div>
                  <span>Focus game</span>
                  <strong>{storeListingOptimizer.recommendation.title}</strong>
                </div>
                <div>
                  <span>Lead shot</span>
                  <strong>{storeListingOptimizer.screenshotPriorities[0]?.id ?? 'missing'}</strong>
                </div>
                <div>
                  <span>Keyword</span>
                  <strong>{storeListingOptimizer.listing.keywords[0]}</strong>
                </div>
              </div>
              <div className="factRow">
                <span>Android handoff</span>
                <strong>{nativePackage.packageName}</strong>
              </div>
              <div className="monetizationRuntime" aria-label="Android Signing">
                <div>
                  <span>Android signing</span>
                  <strong>{androidSigning.status}</strong>
                </div>
                <div>
                  <span>Fingerprint</span>
                  <strong>{androidSigning.signing.sha256CertFingerprint ? 'ready' : 'missing'}</strong>
                </div>
                <div>
                  <span>Local secrets</span>
                  <strong>{androidSigning.ciSecrets.configuredLocally ? 'ready' : 'missing'}</strong>
                </div>
                <div>
                  <span>Keystore</span>
                  <strong>{androidSigning.localFiles.keystoreExists ? 'ignored-local' : 'missing'}</strong>
                </div>
              </div>
              <div className="factRow">
                <span>Asset links</span>
                <strong>{nativePackage.assetLinks.status}</strong>
              </div>
              <div className="factRow">
                <span>Android cost gate</span>
                <strong>${monetizationReference.distribution.googlePlay.estimatedCostUsd}</strong>
              </div>
              <div className="factRow">
                <span>Google payback</span>
                <strong>{formatPayback(googlePayback)}</strong>
              </div>
              <div className="factRow">
                <span>iOS cost gate</span>
                <strong>${monetizationReference.distribution.iosAppStore.estimatedCostUsd}/yr</strong>
              </div>
              <div className="factRow">
                <span>iOS release</span>
                <strong>{iosRelease.status}</strong>
              </div>
              <div className="monetizationRuntime" aria-label="iOS Release Handoff">
                <div>
                  <span>iOS handoff</span>
                  <strong>{iosRelease.platform}</strong>
                </div>
                <div>
                  <span>Bundle ID</span>
                  <strong>{iosRelease.bundleId}</strong>
                </div>
                <div>
                  <span>Native project</span>
                  <strong>{iosRelease.strategy.nativeProjectDeferred ? 'deferred' : 'ready'}</strong>
                </div>
                <div>
                  <span>Store submit</span>
                  <strong>{iosRelease.controls.noStoreSubmission ? 'blocked' : 'ready'}</strong>
                </div>
              </div>
              <div className="factRow">
                <span>Apple payback</span>
                <strong>{formatPayback(applePayback)}</strong>
              </div>
              <div className="factRow">
                <span>Human approval</span>
                <strong>store/legal</strong>
              </div>
              <div className="factRow">
                <span>Revenue gate</span>
                <strong>{monetizationPromotion?.status ?? 'blocked'}</strong>
              </div>
              <div className="factRow">
                <span>Privacy policy</span>
                <a href="/privacy.html" target="_blank" rel="noreferrer">
                  generated
                </a>
              </div>
              <div className="privacyControl">
                <div>
                  <span>External analytics</span>
                  <strong>{externalAnalyticsOptedOut ? 'off' : 'available'}</strong>
                </div>
                <button className="tinyButton" type="button" onClick={toggleExternalAnalytics}>
                  {externalAnalyticsOptedOut ? 'Allow external analytics' : 'Opt out external analytics'}
                </button>
              </div>
            </div>
          </div>

          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Growth Loop</h2>
              </div>
              <Share2 size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Status</span>
                <strong>{growthPlan.status}</strong>
              </div>
              <div className="factRow">
                <span>Game pages</span>
                <strong>{growthPlan.gamePages.length}</strong>
              </div>
              <div className="factRow">
                <span>Optimized pages</span>
                <strong>{growthPlan.optimization?.optimizedGames ?? 0}</strong>
              </div>
              <div className="trafficSeedingPanel" aria-label="Traffic Seeding">
                <div className="factRow">
                  <span>Traffic Seeding</span>
                  <strong>{trafficSeeding.status}</strong>
                </div>
                <div className="factRow">
                  <span>Seed campaigns</span>
                  <strong>{trafficSeeding.campaigns.length}</strong>
                </div>
                <div className="factRow">
                  <span>Seed spend</span>
                  <strong>{formatUsd(trafficSeeding.guardrails.maxCostUsd)}</strong>
                </div>
                <div className="factRow">
                  <span>Target sample</span>
                  <strong>{trafficSeeding.guardrails.minimumStartsBeforeQualityJudgment} starts</strong>
                </div>
                <div className="factRow">
                  <span>Local traffic</span>
                  <strong>
                    {localTrafficStarts} starts / {localTrafficSignals} signals
                  </strong>
                </div>
                {organicSeedCardVisible && organicSeedTargetCampaign ? (
                  <div className="organicSeedCard" aria-label="Organic Seed Loop">
                    <div>
                      <span>Organic Seed Loop</span>
                      <strong>{organicSeedLoop.status}</strong>
                    </div>
                    <div>
                      <span>{organicSeedTargetCampaign.title}</span>
                      <strong>
                        {formatPercent(organicSeedSamplePercent)} sample
                      </strong>
                    </div>
                    <div>
                      <span>Runtime pick</span>
                      <strong>{organicSeedTargetSource}</strong>
                    </div>
                    <div>
                      <span>Local sample</span>
                      <strong>
                        {organicSeedProgress?.starts ?? 0}/
                        {organicSeedProgress?.targetStarts ??
                          organicSeedTargetCampaign.measurement.targetStartsBeforeJudgment}{' '}
                        starts
                      </strong>
                    </div>
                    <div>
                      <span>Local actions</span>
                      <strong>
                        {(organicSeedProgress?.seedClicks ?? 0) +
                          (organicSeedProgress?.shareActions ?? 0)}{' '}
                        signals
                      </strong>
                    </div>
                    <div>
                      <span>Export state</span>
                      <strong>{organicSeedProgress?.evidenceDropReady ? 'ready' : 'waiting'}</strong>
                    </div>
                    <div className="organicSeedActions">
                      <button
                        className="tinyButton"
                        type="button"
                        onClick={() => openSeedCampaign(organicSeedTargetCampaign)}
                      >
                        {organicSeedLoop.runtimeSurface.primaryCtaLabel}
                      </button>
                      <button
                        className="tinyButton"
                        type="button"
                        onClick={() => shareSeedCampaign(organicSeedTargetCampaign)}
                      >
                        {organicSeedLoop.runtimeSurface.secondaryCtaLabel}
                      </button>
                      <button
                        className="tinyButton"
                        type="button"
                        onClick={() => exportTrafficCampaignEvidence(organicSeedTargetCampaign)}
                      >
                        Export seed evidence
                      </button>
                    </div>
                  </div>
                ) : null}
                {trafficCampaigns.map((campaign) => {
                  const progress = trafficCampaignProgress.get(campaign.id)

                  return (
                    <div className="campaignRow" key={campaign.id}>
                      <div>
                        <span>{campaign.title}</span>
                        <strong>
                          {campaign.id === organicSeedCampaignId ? 'next seed' : campaign.dataConfidence} ·{' '}
                          {progress?.starts ?? 0}/
                          {campaign.measurement.targetStartsBeforeJudgment} local starts
                        </strong>
                      </div>
                      <div className="campaignActions">
                        <button
                          aria-label={`Seed traffic for ${campaign.title}`}
                          className="tinyButton"
                          type="button"
                          onClick={() => openSeedCampaign(campaign)}
                        >
                          {campaign.copy.cta}
                        </button>
                        <button
                          aria-label={`Share seed link for ${campaign.title}`}
                          className="tinyButton subtleButton"
                          type="button"
                          onClick={() => shareSeedCampaign(campaign)}
                        >
                          Share
                        </button>
                        <button
                          aria-label={`Export evidence for ${campaign.title}`}
                          className="tinyButton subtleButton"
                          type="button"
                          onClick={() => exportTrafficCampaignEvidence(campaign)}
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="trafficSeedingPanel" aria-label="Acquisition Learning">
                <div className="factRow">
                  <span>Acquisition Learning</span>
                  <strong>{acquisitionLearning.status}</strong>
                </div>
                <div className="factRow">
                  <span>Source</span>
                  <strong>
                    {acquisitionLearning.sourceStatus.rawAttributionAvailable
                      ? 'attributed'
                      : acquisitionLearning.sourceStatus.analyticsSource}
                  </strong>
                </div>
                <div className="factRow">
                  <span>Attributed starts</span>
                  <strong>{acquisitionLearning.summary.totalAttributedStarts}</strong>
                </div>
                <div className="factRow">
                  <span>Local starts</span>
                  <strong>{localTrafficStarts}</strong>
                </div>
                <div className="factRow">
                  <span>Next focus</span>
                  <strong>{acquisitionLearning.summary.featuredGameId ?? 'collect data'}</strong>
                </div>
                {acquisitionCampaigns.map((campaign) => (
                  <div className="backlogRow" key={campaign.id}>
                    <span>{campaign.title}</span>
                    <strong>{campaign.status}</strong>
                  </div>
                ))}
              </div>
              <div className="factRow">
                <span>Sitemap</span>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer">
                  generated
                </a>
              </div>
              {topGrowthPages.map((game) => (
                <div className="backlogRow" key={game.gameId}>
                  <span>{game.title}</span>
                  <strong>{game.channelFocus}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="sectionPanel">
            <div className="sectionHeader">
              <div>
                <h2>Balance Lab</h2>
              </div>
              <Gauge size={24} aria-hidden="true" />
            </div>
            <div className="panelList">
              <div className="factRow">
                <span>Game</span>
                <strong>{activeBalance.title}</strong>
              </div>
              <div className="factRow">
                <span>Target</span>
                <strong>{activeBalance.targetScore}</strong>
              </div>
              <div className="factRow">
                <span>Random bot</span>
                <strong>{Math.round((randomBalance?.winRate ?? 0) * 100)}%</strong>
              </div>
              <div className="factRow">
                <span>Greedy bot</span>
                <strong>{Math.round((greedyBalance?.winRate ?? 0) * 100)}%</strong>
              </div>
              <div className="factRow">
                <span>Verdict</span>
                <strong>{activeBalance.recommendations[0]?.severity}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
