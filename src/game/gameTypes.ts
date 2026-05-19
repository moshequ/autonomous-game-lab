export interface GameSnapshot {
  gameId: string
  title: string
  score: number
  moves: number
  maxMoves: number
  nextLabel: string
  completed: boolean
  result: string
}

export interface GameSceneEvent {
  type: 'snapshot' | 'metric'
  name?: string
  properties?: Record<string, string | number | boolean | null>
  snapshot?: GameSnapshot
}

export type GameSceneSink = (event: GameSceneEvent) => void

export interface FirstMoveCoachRuntime {
  gameId: string
  variantId: string
  surface: string
  recommendedCell: {
    row: number
    col: number
    label: string
  }
  copy: string
  telemetryId: string
}
