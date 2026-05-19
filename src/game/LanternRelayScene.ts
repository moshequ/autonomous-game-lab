import Phaser from 'phaser'
import { gameBalance } from '../data/gameBalance'
import type { GameSceneSink, GameSnapshot } from './gameTypes'

type LanternToken = 'leaf' | 'thread' | 'spark' | 'bell'
type Cell = LanternToken | null

const lanternConfig = gameBalance.games['lantern-relay']
const boardSize = lanternConfig.boardSize
const maxMoves = lanternConfig.maxMoves
const targetScore = lanternConfig.targetScore

const tokens: Record<LanternToken, { fill: number; label: string }> = {
  leaf: { fill: 0x357a38, label: 'Leaf' },
  thread: { fill: 0x6b5bb8, label: 'Thread' },
  spark: { fill: 0xbd4d38, label: 'Spark' },
  bell: { fill: 0xb87b16, label: 'Bell' },
}

const tokenOrder = lanternConfig.pieces as readonly LanternToken[]

const seededQueue = () => {
  const seedText = `${new Date().toISOString().slice(0, 10)}-lantern-relay`
  let seed = [...seedText].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return Array.from({ length: maxMoves + 1 }, (_, index) => {
    seed = (seed * 1103515245 + 12345 + index) % 2147483647
    return tokenOrder[seed % tokenOrder.length]
  })
}

export class LanternRelayScene extends Phaser.Scene {
  private board: Cell[][] = []
  private queue: LanternToken[] = []
  private score = 0
  private moves = 0
  private completed = false
  private tutorialCompleted = false
  private sink: GameSceneSink
  private pacingVariant: string
  private boardLayer?: Phaser.GameObjects.Container
  private hudLayer?: Phaser.GameObjects.Container

  constructor(options: { sink: GameSceneSink; pacingVariant: string }) {
    super('LanternRelay')
    this.sink = options.sink
    this.pacingVariant = options.pacingVariant
  }

  create() {
    this.resetState()
    this.draw()
    this.emitMetric('prototype_started', {
      gameId: 'lantern-relay',
      template: 'grid-puzzle',
      targetScore,
    })
    this.emitMetric('game_started', { gameId: 'lantern-relay', targetScore })
    this.emitSnapshot()
  }

  private resetState() {
    this.board = Array.from({ length: boardSize }, () => Array<Cell>(boardSize).fill(null))
    this.queue = seededQueue()
    this.score = 0
    this.moves = 0
    this.completed = false
    this.tutorialCompleted = false
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

    const next = tokens[this.nextToken()]
    const title = this.add
      .text(24, 18, 'Lantern Relay', {
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

    const badge = this.add.graphics()
    badge.fillStyle(next.fill, 1)
    badge.fillRoundedRect(386, 22, 136, 46, 8)

    const nextText = this.add
      .text(454, 36, next.label, {
        align: 'center',
        color: '#fffdfa',
        fontFamily: 'system-ui',
        fontSize: '16px',
        fontStyle: '700',
      })
      .setOrigin(0.5, 0)

    this.hudLayer.add([title, subtitle, scoreText, movesText, badge, nextText])

    if (this.completed) {
      const won = this.score >= targetScore
      const result = won ? 'Relay lit. Tap any bench to reset.' : 'Relay dimmed. Tap any bench to retry.'
      const endText = this.add
        .text(24, 430, result, {
          color: won ? '#357a38' : '#bd4d38',
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

    const cellSize = 74
    const gap = 8
    const startX = 48
    const startY = 146

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

        const zone = this.add
          .zone(x, y, cellSize, cellSize)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => this.placeToken(row, col))
        this.boardLayer.add([tile, zone])

        if (value) {
          this.drawToken(x, y, cellSize, value)
        }
      }
    }
  }

  private drawToken(x: number, y: number, cellSize: number, value: LanternToken) {
    if (!this.boardLayer) {
      return
    }

    const token = tokens[value]
    const shape = this.add.graphics()
    const centerX = x + cellSize / 2
    const centerY = y + cellSize / 2

    shape.fillStyle(token.fill, 1)
    shape.fillRoundedRect(centerX - 23, centerY - 23, 46, 46, 12)
    shape.lineStyle(4, 0xfffdfa, 0.85)
    shape.strokeCircle(centerX, centerY, 14)

    const label = this.add
      .text(centerX, centerY - 7, token.label[0], {
        align: 'center',
        color: '#fffdfa',
        fontFamily: 'system-ui',
        fontSize: '18px',
        fontStyle: '800',
      })
      .setOrigin(0.5, 0)

    this.boardLayer.add([shape, label])
  }

  private placeToken(row: number, col: number) {
    if (this.completed) {
      this.resetState()
      this.draw()
      this.emitMetric('prototype_started', {
        gameId: 'lantern-relay',
        template: 'grid-puzzle',
        restart: true,
        targetScore,
      })
      this.emitMetric('game_started', { gameId: 'lantern-relay', targetScore, restart: true })
      this.emitSnapshot()
      return
    }

    if (this.board[row][col]) {
      return
    }

    if (!this.tutorialCompleted) {
      this.tutorialCompleted = true
      this.emitMetric('tutorial_completed', {
        gameId: 'lantern-relay',
        variant: this.pacingVariant,
      })
    }

    const token = this.nextToken()
    const gained = this.scoreMove(row, col, token)
    this.board[row][col] = token
    this.moves += 1
    this.score += gained
    this.emitMetric('turn_taken', {
      gameId: 'lantern-relay',
      move: this.moves,
      token,
      gained,
      score: this.score,
    })

    if (this.moves >= maxMoves) {
      this.completed = true
      const won = this.score >= targetScore
      this.emitMetric(won ? 'level_completed' : 'first_loss', {
        gameId: 'lantern-relay',
        score: this.score,
        won,
      })
      this.emitMetric('rewarded_ad_available', {
        gameId: 'lantern-relay',
        reason: won ? 'bonus_daily_seed' : 'failed_daily_contract',
      })
    }

    this.draw()
    this.emitSnapshot()
  }

  private scoreMove(row: number, col: number, token: LanternToken) {
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]

    const sameNeighbors = neighbors.filter(
      ([nextRow, nextCol]) => this.board[nextRow]?.[nextCol] === token,
    ).length

    const occupiedNeighbors = neighbors.filter(
      ([nextRow, nextCol]) => this.board[nextRow]?.[nextCol] !== undefined && this.board[nextRow]?.[nextCol] !== null,
    ).length

    const relayBonus = occupiedNeighbors >= 2 ? 6 : 0
    const centerBonus = Math.abs(row - 2) + Math.abs(col - 2) <= 1 ? 2 : 0
    const squareBonus = this.createsWorkshopSquare(row, col, token) ? 8 : 0

    return 3 + sameNeighbors * 4 + relayBonus + centerBonus + squareBonus
  }

  private createsWorkshopSquare(row: number, col: number, token: LanternToken) {
    const squares = [
      [
        [row, col],
        [row - 1, col],
        [row, col - 1],
        [row - 1, col - 1],
      ],
      [
        [row, col],
        [row - 1, col],
        [row, col + 1],
        [row - 1, col + 1],
      ],
      [
        [row, col],
        [row + 1, col],
        [row, col - 1],
        [row + 1, col - 1],
      ],
      [
        [row, col],
        [row + 1, col],
        [row, col + 1],
        [row + 1, col + 1],
      ],
    ]

    return squares.some((cells) => {
      const values = cells.map(([nextRow, nextCol]) =>
        nextRow === row && nextCol === col ? token : this.board[nextRow]?.[nextCol],
      )
      return values.every(Boolean) && values.filter((value) => value === token).length >= 2
    })
  }

  private nextToken() {
    return this.queue[this.moves] ?? 'leaf'
  }

  private tutorialCopy() {
    if (this.pacingVariant === 'guided') {
      return `Match workshop colors for +4. Bridge two filled benches for +6. Beat ${targetScore}.`
    }

    return `Place a workshop tile. Match colors, make relays, beat ${targetScore}.`
  }

  private currentSnapshot(): GameSnapshot {
    return {
      gameId: 'lantern-relay',
      title: 'Lantern Relay',
      score: this.score,
      moves: this.moves,
      maxMoves,
      nextLabel: tokens[this.nextToken()].label,
      completed: this.completed,
      result: this.completed
        ? this.score >= targetScore
          ? 'relay-lit'
          : 'relay-dimmed'
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
