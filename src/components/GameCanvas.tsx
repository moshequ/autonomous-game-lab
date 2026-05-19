import { useEffect, useMemo, useRef } from 'react'
import Phaser from 'phaser'
import { FoundryLedgerScene } from '../game/FoundryLedgerScene'
import { GeneratedPuzzleScene } from '../game/GeneratedPuzzleScene'
import { HarborCircuitScene } from '../game/HarborCircuitScene'
import { HarborRingsScene } from '../game/HarborRingsScene'
import { LanternRelayScene } from '../game/LanternRelayScene'
import { OrbitAtlasScene } from '../game/OrbitAtlasScene'
import { generatedPlayableGames } from '../data/generatedPlayableGames'
import { firstMoveCoach } from '../data/firstMoveCoach'
import type { GameSceneEvent, GameSnapshot } from '../game/gameTypes'
import { trackEvent, type AnalyticsEventName } from '../lib/analytics'

export type PlayableGameId = string

interface GameCanvasProps {
  gameId: PlayableGameId
  variantId: string
  rewardVariantId: string
  onSnapshot: (snapshot: GameSnapshot) => void
}

const createScene = ({
  gameId,
  variantId,
  onEvent,
}: {
  gameId: PlayableGameId
  variantId: string
  onEvent: (event: GameSceneEvent) => void
}) => {
  const firstMoveCoachTarget =
    firstMoveCoach.targets.find(
      (target) => target.enabled && target.gameId === gameId && target.variantId === variantId,
    ) ?? null

  if (gameId === 'foundry-ledger') {
    return new FoundryLedgerScene({ sink: onEvent, pacingVariant: variantId })
  }

  if (gameId === 'orbit-atlas') {
    return new OrbitAtlasScene({ sink: onEvent, pacingVariant: variantId })
  }

  if (gameId === 'harbor-circuit') {
    return new HarborCircuitScene({ sink: onEvent, pacingVariant: variantId })
  }

  if (gameId === 'lantern-relay') {
    return new LanternRelayScene({ sink: onEvent, pacingVariant: variantId })
  }

  const generatedConfig = generatedPlayableGames.find((game) => game.id === gameId)

  if (generatedConfig) {
    return new GeneratedPuzzleScene({
      sink: onEvent,
      pacingVariant: variantId,
      config: generatedConfig,
      firstMoveCoach: firstMoveCoachTarget,
    })
  }

  return new HarborRingsScene({ sink: onEvent, pacingVariant: variantId, firstMoveCoach: firstMoveCoachTarget })
}

export const GameCanvas = ({ gameId, variantId, rewardVariantId, onSnapshot }: GameCanvasProps) => {
  const mountId = useMemo(() => `game-${crypto.randomUUID()}`, [])
  const completedRef = useRef(false)

  useEffect(() => {
    completedRef.current = false
    trackEvent('game_viewed', { gameId, variantId, rewardVariantId })

    const handleSceneEvent = (event: GameSceneEvent) => {
      if (event.type === 'snapshot' && event.snapshot) {
        completedRef.current = event.snapshot.completed
        onSnapshot(event.snapshot)
      }

      if (event.type === 'metric' && event.name) {
        if (event.name === 'game_started' && event.properties?.restart === true) {
          trackEvent('replay_clicked', {
            ...(event.properties ?? {}),
            variantId,
            rewardVariantId,
            surface: 'game-canvas-restart',
          })
        }

        trackEvent(event.name as AnalyticsEventName, {
          ...(event.properties ?? {}),
          variantId,
          rewardVariantId,
        })
      }
    }

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: mountId,
      width: 560,
      height: 500,
      scene: createScene({ gameId, variantId, onEvent: handleSceneEvent }),
      transparent: false,
      audio: { noAudio: true },
    })

    return () => {
      if (!completedRef.current) {
        trackEvent('game_abandoned', { gameId, variantId, rewardVariantId })
      }
      game.destroy(true)
    }
  }, [gameId, mountId, onSnapshot, rewardVariantId, variantId])

  return <div id={mountId} className="gameMount" aria-label={`${gameId} game canvas`} />
}
