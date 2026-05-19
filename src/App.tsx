import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bot,
  Coins,
  Download,
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
import { monetizationPlan } from './data/monetizationPlan'
import { nativePackage } from './data/nativePackage'
import { portfolioPolicy } from './data/portfolioPolicy'
import { promotionDecision } from './data/promotionDecision'
import { prototypePipeline } from './data/prototypePipeline'
import { productionResponse } from './data/productionResponse'
import { productionEnvironment } from './data/productionEnvironment'
import { productionBootstrap } from './data/productionBootstrap'
import { autonomousOperator } from './data/autonomousOperator'
import { autonomousOperatorHistory } from './data/autonomousOperatorHistory'
import { objectiveAudit } from './data/objectiveAudit'
import { organicSeedLoop } from './data/organicSeedLoop'
import { firstMoveCoach } from './data/firstMoveCoach'
import { productOptimization } from './data/productOptimization'
import { productGateRecovery } from './data/productGateRecovery'
import { pwaInstallLoop } from './data/pwaInstallLoop'
import { performanceBudget } from './data/performanceBudget'
import { releaseHealth } from './data/releaseHealth'
import { repositoryBootstrap } from './data/repositoryBootstrap'
import { repositoryReadiness } from './data/repositoryReadiness'
import { replayLoop } from './data/replayLoop'
import { retentionLoop } from './data/retentionLoop'
import { storeCompliance } from './data/storeCompliance'
import { storeListingOptimizer } from './data/storeListingOptimizer'
import { trafficSeeding } from './data/trafficSeeding'
import { unitEconomics } from './data/unitEconomics'
import type { GameSnapshot } from './game/gameTypes'
import {
  getBufferedEvents,
  initAnalytics,
  setAcquisitionAttribution,
  trackEvent,
  type AnalyticsEvent,
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

const getInitialGameId = () => {
  if (typeof window === 'undefined') {
    return 'harbor-rings'
  }

  const requestedGame = new URLSearchParams(window.location.search).get('game')
  const portfolioPick = portfolioPolicy.dailyChallenge.gameId

  return isPlayableGameId(requestedGame)
    ? requestedGame
    : isPlayableGameId(portfolioPick)
      ? portfolioPick
      : 'harbor-rings'
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

const readStringStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(key) ?? ''
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
  const [pwaInstallStatus, setPwaInstallStatus] = useState('waiting')
  const [pwaDisplayMode, setPwaDisplayMode] = useState(() => getPwaDisplayMode())
  const monetizationGateEventRef = useRef('')
  const dailyChallengeCompletionRef = useRef('')
  const dailyReturnPromptRef = useRef('')
  const dailyReturnIntentRef = useRef('')
  const replayPromptRef = useRef('')
  const completionNudgeRef = useRef('')
  const finishLineCoachRef = useRef('')
  const organicSeedCardRef = useRef('')
  const pwaPromptViewedRef = useRef(false)
  const pacingVariant = useMemo(() => getExperimentVariant('first_session_pacing'), [])
  const rewardVariant = useMemo(() => getExperimentVariant('reward_offer'), [])
  const activeRunId = useMemo(() => `${selectedGameId}-${crypto.randomUUID()}`, [selectedGameId])

  useEffect(() => {
    initAnalytics()

    const onAnalytics = () => setEvents(getBufferedEvents())
    window.addEventListener('agl:analytics', onAnalytics)
    trackEvent('app_loaded', { surface: 'pwa_portal' })
    trackEvent('daily_challenge_viewed', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      seed: retentionLoop.dailyChallenge.seed,
      rewardVariantId: rewardVariant.id,
    })

    const entryParams = new URLSearchParams(window.location.search)
    const entryGameId = entryParams.get('game')
    const entrySource = entryParams.get('utm_source')

    if (isPlayableGameId(entryGameId) || entrySource) {
      trackEvent('organic_entry_opened', {
        gameId: isPlayableGameId(entryGameId) ? entryGameId : null,
        source: entrySource ?? 'direct',
        campaign: entryParams.get('utm_campaign') ?? null,
      })
    }

    return () => window.removeEventListener('agl:analytics', onAnalytics)
  }, [rewardVariant.id])

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
      setPwaPromptEvent(installEvent)
      setPwaInstallStatus('prompt-available')

      if (!pwaPromptViewedRef.current) {
        pwaPromptViewedRef.current = true
        trackEvent('pwa_install_prompt_viewed', {
          displayMode: getPwaDisplayMode(),
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
      setPwaDisplayMode(nextDisplayMode)
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
  const ownerSystems = autonomousOwnerLoop.systems.slice(0, 4)
  const ownerActions = autonomousOwnerLoop.safeAutonomousActions.slice(0, 3)
  const performanceGameChunk = performanceBudget.deferred.gameChunk ?? performanceBudget.deferred.largestDeferredChunk
  const productOptimizationAction = productOptimization.actions[0]
  const productGateRecoveryPrimary = productGateRecovery.priorities[0]
  const productGateRecoveryPrimaryGate =
    productGateRecovery.gates.find(
      (gate) => gate.id === productGateRecovery.summary.primaryBottleneck,
    ) ?? productGateRecovery.gates[0]
  const firstMoveCoachPrimary =
    firstMoveCoach.targets.find((target) => target.gameId === firstMoveCoach.summary.primaryTargetId) ??
    firstMoveCoach.targets.find((target) => target.enabled)
  const productionBootstrapReadyGroups = productionBootstrap.summary.readyGroups ?? 0
  const operatorSelectedAction = autonomousOperator.selectedAction
  const operatorHistorySummary = autonomousOperatorHistory.summary
  const objectiveAuditSummary = objectiveAudit.summary
  const trafficCampaigns = trafficSeeding.campaigns.slice(0, 4)
  const organicSeedTargetCampaign =
    trafficCampaigns.find((campaign) => campaign.id === organicSeedLoop.target?.campaignId) ??
    trafficCampaigns[0]
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
  const eventCounts = events.reduce<Record<string, number>>((counts, event) => {
    counts[event.name] = (counts[event.name] ?? 0) + 1
    return counts
  }, {})
  const toggleExternalAnalytics = () => {
    const next = !externalAnalyticsOptedOut
    setExternalAnalyticsOptOut(next)
    trackEvent('privacy_choice_updated', { externalAnalyticsOptOut: next })
  }
  const openSeedCampaign = (campaign: (typeof trafficCampaigns)[number]) => {
    setAcquisitionAttribution({
      source: 'seed_internal',
      campaign: campaign.id,
      gameId: campaign.gameId,
      channel: 'internal-rotation',
    })

    if (isPlayableGameId(campaign.gameId)) {
      setSelectedGameId(campaign.gameId)
    }

    trackEvent('seed_campaign_clicked', {
      gameId: campaign.gameId,
      campaignId: campaign.id,
      channel: 'internal-rotation',
      priority: campaign.priority,
      source: 'portal-growth-loop',
      costUsd: campaign.costUsd,
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
    const shareData = {
      title: campaign.copy.title,
      text: campaign.copy.text,
      url: campaign.shareUrl,
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
        await navigator.clipboard.writeText(campaign.shareUrl)
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
      channel: 'player-share',
      method,
      succeeded,
      surface: organicSeedSurface,
      costUsd: campaign.costUsd,
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

    if (isPlayableGameId(retentionLoop.dailyChallenge.gameId)) {
      setSelectedGameId(retentionLoop.dailyChallenge.gameId)
    }

    trackEvent('daily_return_intent_started', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
      intentDate: dailyReturnIntentDate,
      seed: retentionLoop.dailyChallenge.seed,
      surface: retentionLoop.returnIntentPolicy.surface,
      trigger: retentionLoop.returnIntentPolicy.trigger,
      streak: dailyStreak,
      rewardVariantId: rewardVariant.id,
    })
    trackEvent('daily_challenge_started', {
      gameId: retentionLoop.dailyChallenge.gameId,
      challengeDate: retentionLoop.dailyChallenge.date,
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
      score: snapshot.score,
      moves: snapshot.moves,
      result: snapshot.result,
      surface: replayLoop.promptPolicy.surface,
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
      setPwaInstallStatus(choice.outcome)

      if (choice.outcome === 'dismissed') {
        window.localStorage.setItem(pwaInstallLoop.localState.dismissalKey, new Date().toISOString())
      }

      trackEvent(eventName, {
        displayMode,
        surface: pwaInstallLoop.promptPolicy.surface,
        platform: choice.platform,
        outcome: choice.outcome,
      })
      setPwaPromptEvent(null)
    } catch {
      setPwaInstallStatus('dismissed')
      window.localStorage.setItem(pwaInstallLoop.localState.dismissalKey, new Date().toISOString())
      trackEvent('pwa_install_prompt_dismissed', {
        displayMode,
        surface: pwaInstallLoop.promptPolicy.surface,
        platform: 'unknown',
        outcome: 'error',
      })
    }
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
  const exportLocalAnalytics = () => {
    trackEvent('analytics_exported', { destination: 'local_file' })
    const payload = JSON.stringify(getBufferedEvents(), null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `player-events-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
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
            onClick={exportLocalAnalytics}
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
          <p className="introCopy">
            This is the production skeleton: playable prototypes, analytics capture, experiment
            assignment, improvement backlog, PWA packaging, and a daily analyst script.
          </p>
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
                <span>Return intent</span>
                <strong>{dailyReturnIntentDate || 'open'}</strong>
              </div>
              {dailyReturnIntentVisible ? (
                <>
                  <div>
                    <span>Queued return</span>
                    <strong>{dailyReturnIntentDate}</strong>
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
                <span>Installs</span>
                <strong>{pwaInstallLoop.metrics.installed}</strong>
              </div>
              <button
                className="tinyButton"
                type="button"
                disabled={!pwaPromptEvent}
                onClick={promptPwaInstall}
              >
                {pwaPromptEvent ? pwaInstallLoop.promptPolicy.ctaLabel : 'Install unavailable'}
              </button>
            </div>

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
                  'pwa_installed',
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
              <article className="gameCard" key={game.id}>
                <div className="gameArt" aria-hidden="true">
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
              </div>
              {ownerSystems.map((system) => (
                <div className="backlogRow" key={system.id}>
                  <span>{system.id}</span>
                  <strong>{system.status}</strong>
                </div>
              ))}
              {ownerActions.map((action) => (
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
                  <span>Next sample</span>
                  <strong>{productGateRecoveryPrimary?.promptViewsNeeded ?? 0} views</strong>
                </div>
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
                  <span>Primary target</span>
                  <strong>{firstMoveCoachPrimary?.title ?? 'none'}</strong>
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
                <p>Variant results are evaluated before the next safe policy shift is applied.</p>
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
                <p>Health, revenue, and spend gates trigger automatic holds or safe-mode changes.</p>
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
                <p>Revenue work waits for retention signals, then starts with ads and optional perks.</p>
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
                <p>Generated pages and share links turn each playable game into a no-cost traffic test.</p>
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
                {organicSeedCardVisible && organicSeedTargetCampaign ? (
                  <div className="organicSeedCard" aria-label="Organic Seed Loop">
                    <div>
                      <span>Organic Seed Loop</span>
                      <strong>{organicSeedLoop.status}</strong>
                    </div>
                    <div>
                      <span>{organicSeedTargetCampaign.title}</span>
                      <strong>
                        {formatPercent(organicSeedLoop.target?.sampleProgress)} sample
                      </strong>
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
                    </div>
                  </div>
                ) : null}
                {trafficCampaigns.map((campaign) => (
                  <div className="campaignRow" key={campaign.id}>
                    <div>
                      <span>{campaign.title}</span>
                      <strong>{campaign.dataConfidence}</strong>
                    </div>
                    <button
                      aria-label={`Seed traffic for ${campaign.title}`}
                      className="tinyButton"
                      type="button"
                      onClick={() => openSeedCampaign(campaign)}
                    >
                      {campaign.copy.cta}
                    </button>
                  </div>
                ))}
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
                <p>Bot simulations tune score targets before the next web experiment ships.</p>
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
