import Phaser from 'phaser'
import { gameBalance } from '../data/gameBalance'
import type { FirstMoveCoachRuntime, GameSceneSink } from './gameTypes'
import type { HarborColor, HarborGameSnapshot } from './harborRingsTypes'

const harborConfig = gameBalance.games['harbor-rings']

const colors: Record<HarborColor, { fill: number; label: string }> = {
  teal: { fill: 0x187f7a, label: 'Tide' },
  coral: { fill: 0xbd4d38, label: 'Ember' },
  amber: { fill: 0xb87b16, label: 'Sun' },
  violet: { fill: 0x6b5bb8, label: 'Moon' },
}

const colorOrder = harborConfig.pieces as readonly HarborColor[]
const boardSize = harborConfig.boardSize
const maxMoves = harborConfig.maxMoves
const targetScore = harborConfig.targetScore

type Cell = HarborColor | null

export const harborRingsTutorialCopy = (pacingVariant: string) =>
  pacingVariant === 'guided'
    ? `Match adjacent colors for +3; close a 2x2 corner for +8; beat ${targetScore}.`
    : `Tap a dock to match colors and beat ${targetScore} in ${maxMoves} turns.`

const tutorialSentenceCount = (copy: string) => Math.max(1, copy.split(/[.!?]+/).filter(Boolean).length)

const tutorialCopyMode = (pacingVariant: string) =>
  pacingVariant === 'guided' ? 'guided-example' : 'fast-start-one-sentence'

const seededDeck = () => {
  const day = new Date().toISOString().slice(0, 10)
  let seed = [...day].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return Array.from({ length: maxMoves + 1 }, (_, index) => {
    seed = (seed * 9301 + 49297 + index) % 233280
    return colorOrder[seed % colorOrder.length]
  })
}

export class HarborRingsScene extends Phaser.Scene {
  private board: Cell[][] = []
  private deck: HarborColor[] = []
  private score = 0
  private moves = 0
  private completed = false
  private tutorialCompleted = false
  private firstMoveCoachShown = false
  private firstMoveCoachResolved = false
  private sink: GameSceneSink
  private pacingVariant: string
  private firstMoveCoach: FirstMoveCoachRuntime | null
  private boardLayer?: Phaser.GameObjects.Container
  private hudLayer?: Phaser.GameObjects.Container

  constructor(options: { sink: GameSceneSink; pacingVariant: string; firstMoveCoach?: FirstMoveCoachRuntime | null }) {
    super('HarborRings')
    this.sink = options.sink
    this.pacingVariant = options.pacingVariant
    this.firstMoveCoach = options.firstMoveCoach ?? null
  }

  create() {
    this.resetState()
    this.draw()
    this.emitMetric('game_started', { gameId: 'harbor-rings', targetScore })
    this.emitFirstMoveCoachShown()
    this.emitSnapshot()
  }

  private resetState() {
    this.board = Array.from({ length: boardSize }, () => Array<Cell>(boardSize).fill(null))
    this.deck = seededDeck()
    this.score = 0
    this.moves = 0
    this.completed = false
    this.tutorialCompleted = false
    this.firstMoveCoachShown = false
    this.firstMoveCoachResolved = false
  }

  private draw() {
    this.cameras.main.setBackgroundColor('#fffdfa')
    this.boardLayer?.destroy()
    this.hudLayer?.destroy()

    this.hudLayer = this.add.container(0, 0)
    this.boardLayer = this.add.container(0, 0)
    this.drawHud()
    this.drawBoard()
  }

  private drawHud() {
    if (!this.hudLayer) {
      return
    }

    const next = colors[this.nextColor()]
    const title = this.add
      .text(24, 18, 'Harbor Rings', {
        color: '#191713',
        fontFamily: 'system-ui',
        fontSize: '30px',
        fontStyle: '700',
      })
      .setOrigin(0, 0)

    const subtitle = this.add
      .text(24, 56, this.tutorialCopy(), {
        color: '#625d52',
        fontFamily: 'system-ui',
        fontSize: '15px',
      })
      .setOrigin(0, 0)

    const scoreText = this.add
      .text(24, 92, `Score ${this.score}`, {
        color: '#191713',
        fontFamily: 'system-ui',
        fontSize: '22px',
        fontStyle: '700',
      })
      .setOrigin(0, 0)

    const movesText = this.add
      .text(166, 96, `${this.moves}/${maxMoves} moves`, {
        color: '#625d52',
        fontFamily: 'system-ui',
        fontSize: '15px',
      })
      .setOrigin(0, 0)

    const nextBadge = this.add.graphics()
    nextBadge.fillStyle(next.fill, 1)
    nextBadge.fillRoundedRect(392, 22, 124, 46, 8)

    const nextText = this.add
      .text(454, 36, next.label, {
        align: 'center',
        color: '#fffdfa',
        fontFamily: 'system-ui',
        fontSize: '16px',
        fontStyle: '700',
      })
      .setOrigin(0.5, 0)

    this.hudLayer.add([title, subtitle, scoreText, movesText, nextBadge, nextText])

    if (this.completed) {
      const result =
        this.score >= targetScore
          ? 'Contract won. Tap any seal to reset.'
          : 'Contract missed. Tap any seal to retry.'
      const endText = this.add
        .text(24, 112, result, {
          color: this.score >= targetScore ? '#357a38' : '#bd4d38',
          fontFamily: 'system-ui',
          fontSize: '18px',
          fontStyle: '700',
        })
        .setOrigin(0, 0)
      this.hudLayer.add(endText)
    }
  }

  private drawBoard() {
    if (!this.boardLayer) {
      return
    }

    const cellSize = 64
    const gap = 7
    const startX = 106
    const startY = 132

    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        const x = startX + col * (cellSize + gap)
        const y = startY + row * (cellSize + gap)
        const value = this.board[row][col]
        const tile = this.add.graphics()

        tile.fillStyle(0xf3eadc, 1)
        tile.lineStyle(2, 0xd9d0bf, 1)
        tile.fillRoundedRect(x, y, cellSize, cellSize, 8)
        tile.strokeRoundedRect(x, y, cellSize, cellSize, 8)
        this.boardLayer.add(tile)
        this.drawFirstMoveCoach(row, col, x, y, cellSize, cellSize)

        const zone = this.add
          .zone(x, y, cellSize, cellSize)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => this.placeSeal(row, col))
        this.boardLayer.add(zone)

        if (value) {
          const seal = this.add.graphics()
          seal.fillStyle(colors[value].fill, 1)
          seal.fillCircle(x + cellSize / 2, y + cellSize / 2, 24)
          seal.lineStyle(4, 0xfffdfa, 0.8)
          seal.strokeCircle(x + cellSize / 2, y + cellSize / 2, 17)
          this.boardLayer.add(seal)
        }
      }
    }
  }

  private placeSeal(row: number, col: number) {
    if (this.completed) {
      this.resetState()
      this.draw()
      this.emitMetric('game_started', { gameId: 'harbor-rings', targetScore, restart: true })
      this.emitFirstMoveCoachShown()
      this.emitSnapshot()
      return
    }

    if (this.board[row][col]) {
      return
    }

    this.resolveFirstMoveCoach(row, col)

    if (!this.tutorialCompleted) {
      this.tutorialCompleted = true
      const tutorial = this.tutorialCopy()
      this.emitMetric('tutorial_completed', {
        gameId: 'harbor-rings',
        variant: this.pacingVariant,
        tutorialCopyMode: tutorialCopyMode(this.pacingVariant),
        tutorialCopyChars: tutorial.length,
        tutorialCopySentences: tutorialSentenceCount(tutorial),
        targetGate: 'firstGameCompletion',
      })
    }

    const color = this.nextColor()
    const gained = this.scoreMove(row, col, color)
    this.board[row][col] = color
    this.moves += 1
    this.score += gained
    this.emitMetric('turn_taken', {
      gameId: 'harbor-rings',
      move: this.moves,
      color,
      gained,
      score: this.score,
    })

    if (this.moves >= maxMoves) {
      this.completed = true
      this.emitMetric('level_completed', {
        gameId: 'harbor-rings',
        score: this.score,
        won: this.score >= targetScore,
      })
    }

    this.draw()
    this.emitSnapshot()
  }

  private scoreMove(row: number, col: number, color: HarborColor) {
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ].filter(([nextRow, nextCol]) => this.board[nextRow]?.[nextCol] === color).length

    const diagonalPairs = [
      [
        [row - 1, col - 1],
        [row - 1, col],
        [row, col - 1],
      ],
      [
        [row - 1, col + 1],
        [row - 1, col],
        [row, col + 1],
      ],
      [
        [row + 1, col - 1],
        [row + 1, col],
        [row, col - 1],
      ],
      [
        [row + 1, col + 1],
        [row + 1, col],
        [row, col + 1],
      ],
    ]

    const ringBonus = diagonalPairs.some((cells) =>
      cells.every(([nextRow, nextCol]) => this.board[nextRow]?.[nextCol] === color),
    )
      ? 8
      : 0

    const centerBonus = row === 2 && col === 2 ? 3 : 0
    return 2 + neighbors * 3 + ringBonus + centerBonus
  }

  private nextColor() {
    return this.deck[this.moves] ?? 'teal'
  }

  private recommendedMove() {
    if (this.completed) {
      return null
    }

    const color = this.nextColor()
    let bestMove: { row: number; col: number; gained: number } | null = null

    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        if (this.board[row][col]) {
          continue
        }

        const gained = this.scoreMove(row, col, color)

        if (!bestMove || gained > bestMove.gained) {
          bestMove = { row, col, gained }
        }
      }
    }

    return bestMove
      ? {
          ...bestMove,
          label: `R${bestMove.row + 1} C${bestMove.col + 1}`,
          color,
        }
      : null
  }

  private tutorialCopy() {
    return harborRingsTutorialCopy(this.pacingVariant)
  }

  private shouldShowFirstMoveCoach() {
    return Boolean(this.firstMoveCoach && this.moves === 0 && !this.completed)
  }

  private drawFirstMoveCoach(row: number, col: number, x: number, y: number, width: number, height: number) {
    if (!this.boardLayer || !this.shouldShowFirstMoveCoach()) {
      return
    }

    if (this.firstMoveCoach?.recommendedCell.row !== row || this.firstMoveCoach.recommendedCell.col !== col) {
      return
    }

    const ring = this.add.graphics()
    ring.lineStyle(4, 0x357a38, 1)
    ring.strokeRoundedRect(x + 4, y + 4, width - 8, height - 8, 10)
    ring.fillStyle(0x357a38, 0.12)
    ring.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 10)

    const label = this.add
      .text(x + width / 2, y + height / 2 - 8, this.firstMoveCoach.copy, {
        align: 'center',
        color: '#1f5b2e',
        fontFamily: 'system-ui',
        fontSize: '13px',
        fontStyle: '800',
      })
      .setOrigin(0.5, 0)

    this.boardLayer.add([ring, label])
  }

  private emitFirstMoveCoachShown() {
    if (!this.shouldShowFirstMoveCoach() || this.firstMoveCoachShown || !this.firstMoveCoach) {
      return
    }

    this.firstMoveCoachShown = true
    this.emitMetric('first_move_coach_shown', {
      gameId: 'harbor-rings',
      variantId: this.pacingVariant,
      surface: this.firstMoveCoach.surface,
      telemetryId: this.firstMoveCoach.telemetryId,
      recommendedRow: this.firstMoveCoach.recommendedCell.row,
      recommendedCol: this.firstMoveCoach.recommendedCell.col,
      targetScore,
    })
  }

  private resolveFirstMoveCoach(row: number, col: number) {
    if (!this.shouldShowFirstMoveCoach() || this.firstMoveCoachResolved || !this.firstMoveCoach) {
      return
    }

    this.firstMoveCoachResolved = true
    const used =
      row === this.firstMoveCoach.recommendedCell.row && col === this.firstMoveCoach.recommendedCell.col

    this.emitMetric(used ? 'first_move_coach_used' : 'first_move_coach_skipped', {
      gameId: 'harbor-rings',
      variantId: this.pacingVariant,
      surface: this.firstMoveCoach.surface,
      telemetryId: this.firstMoveCoach.telemetryId,
      row,
      col,
      recommendedRow: this.firstMoveCoach.recommendedCell.row,
      recommendedCol: this.firstMoveCoach.recommendedCell.col,
      targetScore,
    })
  }

  private currentSnapshot(): HarborGameSnapshot {
    return {
      score: this.score,
      moves: this.moves,
      maxMoves,
      gameId: 'harbor-rings',
      title: harborConfig.title,
      nextLabel: colors[this.nextColor()].label,
      nextColor: this.nextColor(),
      completed: this.completed,
      recommendedMove: this.recommendedMove(),
      result: this.completed
        ? this.score >= targetScore
          ? 'contract-won'
          : 'contract-missed'
        : 'playing',
    }
  }

  private emitSnapshot() {
    this.sink({ type: 'snapshot', snapshot: this.currentSnapshot() })
  }

  private emitMetric(name: string, properties: Record<string, string | number | boolean | null>) {
    this.sink({ type: 'metric', name, properties })
  }
}
