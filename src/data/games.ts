export interface GameDefinition {
  id: string
  title: string
  status: 'live' | 'queued' | 'prototype'
  mechanic: string
  pitch: string
  tags: string[]
  retentionSignal: number
  monetizationSignal: number
}

export const games: GameDefinition[] = [
  {
    id: 'harbor-rings',
    title: 'Harbor Rings',
    status: 'live',
    mechanic: 'tile placement puzzle',
    pitch: 'Place colored harbor seals, complete rings, and push for a clean twelve-turn score.',
    tags: ['5 minute play', 'daily puzzle', 'solo'],
    retentionSignal: 67,
    monetizationSignal: 41,
  },
  {
    id: 'orchard-bids',
    title: 'Orchard Bids',
    status: 'queued',
    mechanic: 'auction drafting',
    pitch: 'A light bidding game about timing harvest contracts before the market changes.',
    tags: ['bot play', 'asynchronous', 'economy'],
    retentionSignal: 51,
    monetizationSignal: 37,
  },
  {
    id: 'metro-glyphs',
    title: 'Metro Glyphs',
    status: 'prototype',
    mechanic: 'route building',
    pitch: 'Draw compact transit loops under shifting public goals and private scoring cards.',
    tags: ['route builder', 'puzzle', 'mobile first'],
    retentionSignal: 58,
    monetizationSignal: 45,
  },
]

export const autonomyBacklog = [
  {
    title: 'Shorten first tutorial',
    owner: 'daily analyst',
    impact: 'Raise first-game completion',
    confidence: 72,
  },
  {
    title: 'Test thumbnail with stronger board state',
    owner: 'creative agent',
    impact: 'Increase game_viewed to game_started',
    confidence: 64,
  },
  {
    title: 'Run 1,000 bot games for score curve',
    owner: 'simulation agent',
    impact: 'Improve difficulty and replay',
    confidence: 59,
  },
]
