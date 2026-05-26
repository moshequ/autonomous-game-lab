import Phaser from 'phaser'
import { gameBalance } from '../data/gameBalance'
import type { FirstMoveCoachRuntime, GameSceneSink, GameSnapshot } from './gameTypes'

type FoundryToken = 'ore' | 'coin' | 'steam' | 'guild'
type Cell = FoundryToken | null

const foundryConfig = gameBalance.games['foundry-ledger']
const boardRows = foundryConfig.boardRows
const boardCols = foundryConfig.boardCols
const maxMoves = foundryConfig.maxMoves
const targetScore = foundryConfig.targetScore

const tokens: Record<FoundryToken, { fill: number; label: string; short: string }> = {
  ore: { fill: 0x6b5bb8, label: 'Ore', short: 'O' },
  coin: { fill: 0xb87b16, label: 'Coin', short: 'C' },
  steam: { fill: 0xbd4d38, label: 'Steam', short: 'S' },
  guild: { fill: 0x187f7a, label: 'Guild', short: 'G' },
}

const tokenOrder = foundryConfig.pieces as readonly FoundryToken[]

const seededQueue = () => {
  const seedText = `${new Date().toISOString().slice(0, 10)}-foundry-ledger`
  let seed = [...seedText].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return Array.from({ length: maxMoves + 1 }, (_, index) => {
    seed = (seed * 48271 + index + 17) % 2147483647
    return tokenOrder[seed % tokenOrder.length]
  })
}

export class FoundryLedgerScene extends Phaser.Scene {
  private board: Cell[][] = []
  private queue: FoundryToken[] = []
  private score = 0
  private moves = 0
  private completed = false
  private tutorialCompleted = false
  private firstMoveCoachShown = false
  private firstMoveCoachResolved = false
  private sink: GameSceneSink
  private pacingVariant: string
  private firstMoveCoach: FirstMoveCoachRuntime | null
  private hudLayer?: Phaser.GameObjects.Container
  private boardLayer?: Phaser.GameObjects.Container

  constructor(options: { sink: GameSceneSink; pacingVariant: string; firstMoveCoach?: FirstMoveCoachRuntime | null }) {
    super('FoundryLedger')
    this.sink = options.sink
    this.pacingVariant = options.pacingVariant
    this.firstMoveCoach = options.firstMoveCoach ?? null
  }

  create() {
    this.resetState()
    this.draw()
    this.emitMetric('prototype_started', {
      gameId: 'foundry-ledger',
      template: 'line-drawing',
      targetScore,
    })
    this.emitMetric('game_started', { gameId: 'foundry-ledger', targetScore })
    this.emitFirstMoveCoachShown()
    this.emitSnapshot()
  }

  private resetState() {
    this.board = Array.from({ length: boardRows }, () => Array<Cell>(boardCols).fill(null))
    this.queue = seededQueue()
    this.score = 0
    this.moves = 0
    this.completed = false
    this.tutorialCompleted = false
    this.firstMoveCoachShown = false
    this.firstMoveCoachResolved = false
  }

  private draw() {
    this.cameras.main.setBackgroundColor('#fffdfa')
    this.hudLayer?.destroy()
    this.boardLayer?.destroy()

    this.hudLayer = this.add.container(0, 0)
    this.boardLayer = this.add.container(0, 0)
    this.drawHud()
    this.drawMap()
  }

  private drawHud() {
    if (!this.hudLayer) {
      return
    }

    const next = tokens[this.nextToken()]
    const title = this.add
      .text(24, 18, foundryConfig.title, {
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
    badge.fillRoundedRect(390, 22, 128, 46, 8)

    const badgeText = this.add
      .text(454, 36, next.label, {
        align: 'center',
        color: '#fffdfa',
        fontFamily: 'system-ui',
        fontSize: '16px',
        fontStyle: '700',
      })
      .setOrigin(0.5, 0)

    this.hudLayer.add([title, subtitle, scoreText, movesText, badge, badgeText])

    if (this.completed) {
      const won = this.score >= targetScore
      const text = won ? 'Ledger balanced. Tap any junction to reset.' : 'Ledger short. Tap any junction to retry.'
      const endText = this.add
        .text(24, 430, text, {
          color: won ? '#357a38' : '#bd4d38',
          fontFamily: 'system-ui',
          fontSize: '18px',
          fontStyle: '700',
        })
        .setOrigin(0, 0)
      this.hudLayer.add(endText)
    }
  }

  private drawMap() {
    if (!this.boardLayer) {
      return
    }

    const startX = 94
    const startY = 160
    const gapX = 118
    const gapY = 72
    const line = this.add.graphics()
    line.lineStyle(4, 0xd9d0bf, 1)

    for (let row = 0; row < boardRows; row += 1) {
      for (let col = 0; col < boardCols; col += 1) {
        const x = startX + col * gapX
        const y = startY + row * gapY

        if (col < boardCols - 1) {
          line.lineBetween(x, y, x + gapX, y)
        }
        if (row < boardRows - 1) {
          line.lineBetween(x, y, x, y + gapY)
        }
      }
    }

    this.boardLayer.add(line)

    for (let row = 0; row < boardRows; row += 1) {
      for (let col = 0; col < boardCols; col += 1) {
        const x = startX + col * gapX
        const y = startY + row * gapY
        const value = this.board[row][col]
        const node = this.add.graphics()

        node.fillStyle(0xf3eadc, 1)
        node.lineStyle(3, 0x191713, 0.75)
        node.fillCircle(x, y, 25)
        node.strokeCircle(x, y, 25)
        this.drawFirstMoveCoach(row, col, x - 34, y - 34, 68, 68)

        const zone = this.add
          .zone(x - 34, y - 34, 68, 68)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => this.claimNode(row, col))
        this.boardLayer.add([node, zone])

        if (value) {
          this.drawClaim(x, y, value)
        }
      }
    }
  }

  private drawClaim(x: number, y: number, value: FoundryToken) {
    if (!this.boardLayer) {
      return
    }

    const token = tokens[value]
    const claim = this.add.graphics()
    claim.fillStyle(token.fill, 1)
    claim.fillCircle(x, y, 20)
    claim.lineStyle(3, 0xfffdfa, 0.9)
    claim.strokeCircle(x, y, 13)

    const label = this.add
      .text(x, y - 9, token.short, {
        align: 'center',
        color: '#fffdfa',
        fontFamily: 'system-ui',
        fontSize: '16px',
        fontStyle: '800',
      })
      .setOrigin(0.5, 0)

    this.boardLayer.add([claim, label])
  }

  private claimNode(row: number, col: number) {
    if (this.completed) {
      this.resetState()
      this.draw()
      this.emitMetric('prototype_started', {
        gameId: 'foundry-ledger',
        template: 'line-drawing',
        restart: true,
        targetScore,
      })
      this.emitMetric('game_started', { gameId: 'foundry-ledger', targetScore, restart: true })
      this.emitSnapshot()
      return
    }

    if (this.board[row][col]) {
      return
    }

    this.resolveFirstMoveCoach(row, col)

    if (!this.tutorialCompleted) {
      this.tutorialCompleted = true
      this.emitMetric('tutorial_completed', {
        gameId: 'foundry-ledger',
        variant: this.pacingVariant,
      })
    }

    const token = this.nextToken()
    const gained = this.scoreMove(row, col, token)
    this.board[row][col] = token
    this.moves += 1
    this.score += gained
    this.emitMetric('turn_taken', {
      gameId: 'foundry-ledger',
      move: this.moves,
      token,
      gained,
      score: this.score,
    })

    if (this.moves >= maxMoves) {
      this.completed = true
      const won = this.score >= targetScore
      this.emitMetric(won ? 'level_completed' : 'first_loss', {
        gameId: 'foundry-ledger',
        score: this.score,
        won,
      })
      this.emitMetric('rewarded_ad_available', {
        gameId: 'foundry-ledger',
        reason: won ? 'bonus_contract_seed' : 'failed_daily_contract',
      })
    }

    this.draw()
    this.emitSnapshot()
  }

  private scoreMove(row: number, col: number, token: FoundryToken) {
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]

    const occupiedNeighbors = neighbors.filter(
      ([nextRow, nextCol]) =>
        this.board[nextRow]?.[nextCol] !== undefined && this.board[nextRow]?.[nextCol] !== null,
    )
    const sameNeighbors = occupiedNeighbors.filter(
      ([nextRow, nextCol]) => this.board[nextRow]?.[nextCol] === token,
    ).length
    const rowValues = this.board[row].filter(Boolean)
    const colValues = this.board.map((boardRow) => boardRow[col]).filter(Boolean)
    const rowDiversity = new Set([...rowValues, token]).size
    const colDiversity = new Set([...colValues, token]).size
    const edgeBonus = row === 0 || col === 0 || row === boardRows - 1 || col === boardCols - 1 ? 3 : 0
    const contractBonus =
      token === 'ore' && row <= 1
        ? 4
        : token === 'coin' && col >= boardCols - 2
          ? 4
          : token === 'steam' && row >= boardRows - 2
            ? 4
            : token === 'guild' && col <= 1
              ? 4
              : 0

    return (
      3 +
      occupiedNeighbors.length * 4 +
      sameNeighbors * 3 +
      (rowDiversity >= 3 ? 5 : 0) +
      (colDiversity >= 3 ? 5 : 0) +
      edgeBonus +
      contractBonus
    )
  }

  private nextToken() {
    return this.queue[this.moves] ?? 'ore'
  }

  private tutorialCopy() {
    if (this.pacingVariant === 'guided') {
      return `Claim connected junctions. Diversify rows and columns. Beat ${targetScore}.`
    }

    return `Claim a junction, build contract routes, beat ${targetScore}.`
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
      gameId: 'foundry-ledger',
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
      gameId: 'foundry-ledger',
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

  private currentSnapshot(): GameSnapshot {
    const token = this.nextToken()

    return {
      gameId: 'foundry-ledger',
      title: foundryConfig.title,
      score: this.score,
      moves: this.moves,
      maxMoves,
      nextLabel: tokens[token].label,
      completed: this.completed,
      result: this.completed
        ? this.score >= targetScore
          ? 'ledger-balanced'
          : 'ledger-short'
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
