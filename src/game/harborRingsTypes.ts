import type { GameSnapshot } from './gameTypes'

export type HarborColor = 'teal' | 'coral' | 'amber' | 'violet'

export interface HarborGameSnapshot extends GameSnapshot {
  nextColor: HarborColor
}
