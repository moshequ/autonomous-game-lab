import type { GameSnapshot } from '../game/gameTypes'

type Placement = {
  id: string
  status: string
  type: string
  reward?: string
}

type MonetizationPlanLike = {
  revenueEnabled: boolean
  status: string
  blockers?: readonly string[]
  placements: readonly Placement[]
  runtime?: {
    status: string
    surface: string
    firstPlacementId: string
    requiresCompletedRun: boolean
    requiresFailedRun: boolean
    maxOffersPerSession: number
    disabledReason: string | null
    blockedEventsWhenDisabled: readonly string[]
  }
  safety?: {
    firstAllowedPlacement?: string
  }
}

type UnitEconomicsLike = {
  controls?: {
    monetizationSpendAllowed?: boolean
  }
}

type ProductionResponseLike = {
  controls?: {
    revenueDisabled?: boolean
  }
}

export type MonetizationRuntimeStatus =
  | 'guarded-disabled'
  | 'waiting-for-result'
  | 'suppressed-won-run'
  | 'frequency-capped'
  | 'available'

export type MonetizationRuntimeState = {
  placementId: string
  placementStatus: string
  placementType: string
  reward: string
  status: MonetizationRuntimeStatus
  surface: string
  canOffer: boolean
  revenueGatesOpen: boolean
  guardReason: string
  blockedEventsWhenDisabled: readonly string[]
}

const offerSessionKey = (placementId: string) => `agl.monetization.${placementId}.consumed`

export const wasMonetizationOfferConsumed = (placementId: string) => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem(offerSessionKey(placementId)) === 'true'
}

export const markMonetizationOfferConsumed = (placementId: string) => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(offerSessionKey(placementId), 'true')
}

export const getMonetizationRuntimeState = ({
  plan,
  unitEconomics,
  productionResponse,
  snapshot,
  offerConsumed,
}: {
  plan: MonetizationPlanLike
  unitEconomics: UnitEconomicsLike
  productionResponse: ProductionResponseLike
  snapshot: GameSnapshot
  offerConsumed: boolean
}): MonetizationRuntimeState => {
  const firstPlacementId = plan.runtime?.firstPlacementId ?? plan.safety?.firstAllowedPlacement
  const placement =
    plan.placements.find((candidate) => candidate.id === firstPlacementId) ?? plan.placements[0]
  const revenueGatesOpen =
    plan.revenueEnabled === true &&
    placement?.status === 'ready' &&
    unitEconomics.controls?.monetizationSpendAllowed === true &&
    productionResponse.controls?.revenueDisabled !== true
  const completedRun = snapshot.completed === true
  const failedRun = completedRun && snapshot.result !== 'contract-won'

  let status: MonetizationRuntimeStatus = 'guarded-disabled'
  let guardReason =
    plan.runtime?.disabledReason ??
    plan.blockers?.[0] ??
    'Revenue gates are not open for this session.'

  if (revenueGatesOpen) {
    if (!completedRun) {
      status = 'waiting-for-result'
      guardReason = 'Rewarded offers wait until a completed run.'
    } else if (plan.runtime?.requiresFailedRun !== false && !failedRun) {
      status = 'suppressed-won-run'
      guardReason = 'Rewarded hints are held after a won run.'
    } else if (offerConsumed) {
      status = 'frequency-capped'
      guardReason = 'This session already used its rewarded offer.'
    } else {
      status = 'available'
      guardReason = 'Low-risk rewarded placement is available.'
    }
  }

  return {
    placementId: placement?.id ?? 'missing-placement',
    placementStatus: placement?.status ?? 'missing',
    placementType: placement?.type ?? 'unknown',
    reward: placement?.reward ?? 'optional strategy hint',
    status,
    surface: plan.runtime?.surface ?? 'result-screen',
    canOffer: status === 'available',
    revenueGatesOpen,
    guardReason,
    blockedEventsWhenDisabled: plan.runtime?.blockedEventsWhenDisabled ?? [
      'rewarded_ad_started',
      'rewarded_ad_completed',
      'revenue_cents',
    ],
  }
}
