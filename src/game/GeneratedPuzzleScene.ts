import Phaser from 'phaser'
import { gameBalance } from '../data/gameBalance'
import type { GeneratedPlayableGame } from '../data/generatedPlayableGames'
import type { FirstMoveCoachRuntime, GameSceneSink } from './gameTypes'

type PieceId = GeneratedPlayableGame['pieces'][number]['id']
type Cell = PieceId | null

const hexToNumber = (value: string) => Number.parseInt(value.replace('#', ''), 16)

const createRng = (seedText: string) => {
  let state = [...seedText].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 2166136261)

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export class GeneratedPuzzleScene extends Phaser.Scene {
  private board: Cell[][] = []
  private queue: PieceId[] = []
  private score = 0
  private moves = 0
  private completed = false
  private tutorialCompleted = false
  private firstMoveCoachShown = false
  private firstMoveCoachResolved = false
  private boardLayer?: Phaser.GameObjects.Container
  private hudLayer?: Phaser.GameObjects.Container
  private readonly sink: GameSceneSink
  private readonly pacingVariant: string
  private readonly config: GeneratedPlayableGame
  private readonly firstMoveCoach: FirstMoveCoachRuntime | null

  private get targetScore() {
    const balanceConfig = gameBalance.games[this.config.id as keyof typeof gameBalance.games]
    return balanceConfig?.targetScore ?? this.config.targetScore
  }

  constructor(options: {
    sink: GameSceneSink
    pacingVariant: string
    config: GeneratedPlayableGame
    firstMoveCoach?: FirstMoveCoachRuntime | null
  }) {
    super(`GeneratedPuzzle-${options.config.id}`)
    this.sink = options.sink
    this.pacingVariant = options.pacingVariant
    this.config = options.config
    this.firstMoveCoach = options.firstMoveCoach ?? null
  }

  create() {
    this.resetState()
    this.draw()
    this.emitMetric('game_started', {
      gameId: this.config.id,
      targetScore: this.targetScore,
      generatedRuntime: true,
      mechanic: this.config.source.mechanic,
    })
    this.emitFirstMoveCoachShown()
    this.emitSnapshot()
  }

  private resetState() {
    this.board = Array.from({ length: this.config.boardRows }, () =>
      Array<Cell>(this.config.boardCols).fill(null),
    )
    this.queue = this.seededQueue()
    this.score = 0
    this.moves = 0
    this.completed = false
    this.tutorialCompleted = false
    this.firstMoveCoachShown = false
    this.firstMoveCoachResolved = false
  }

  private seededQueue() {
    const day = new Date().toISOString().slice(0, 10)
    const rng = createRng(`${this.config.id}-${day}`)

    return Array.from({ length: this.config.maxMoves + 1 }, () => {
      const piece = this.config.pieces[Math.floor(rng() * this.config.pieces.length)]
      return piece.id
    })
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

    const next = this.pieceInfo(this.nextPiece())
    const subtitle =
      this.pacingVariant === 'guided'
        ? this.config.tutorial
        : `One mark per turn. Beat ${this.targetScore} in ${this.config.maxMoves}.`

    const title = this.add
      .text(24, 18, this.config.title, {
        color: '#191713',
        fontFamily: 'system-ui',
        fontSize: '28px',
        fontStyle: '700',
      })
      .setOrigin(0, 0)
    const copy = this.add
      .text(24, 54, subtitle, {
        color: '#625d52',
        fontFamily: 'system-ui',
        fontSize: '15px',
        wordWrap: { width: 330 },
      })
      .setOrigin(0, 0)
    const scoreText = this.add
      .text(24, 96, `Score ${this.score}`, {
        color: '#191713',
        fontFamily: 'system-ui',
        fontSize: '22px',
        fontStyle: '700',
      })
      .setOrigin(0, 0)
    const movesText = this.add
      .text(168, 100, `${this.moves}/${this.config.maxMoves} moves`, {
        color: '#625d52',
        fontFamily: 'system-ui',
        fontSize: '15px',
      })
      .setOrigin(0, 0)
    const nextBadge = this.add.graphics()
    nextBadge.fillStyle(hexToNumber(next.fill), 1)
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

    this.hudLayer.add([title, copy, scoreText, movesText, nextBadge, nextText])

    if (this.completed) {
      const won = this.score >= this.targetScore
      const endText = this.add
        .text(24, 438, won ? 'Generated contract won. Tap to rebuild.' : 'Contract missed. Tap to retry.', {
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

    const gap = 8
    const startX = 42
    const startY = 146
    const availableWidth = 476
    const availableHeight = 270
    const cellSize = Math.min(
      76,
      Math.floor((availableWidth - (this.config.boardCols - 1) * gap) / this.config.boardCols),
      Math.floor((availableHeight - (this.config.boardRows - 1) * gap) / this.config.boardRows),
    )

    for (let row = 0; row < this.config.boardRows; row += 1) {
      for (let col = 0; col < this.config.boardCols; col += 1) {
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
        zone.on('pointerdown', () => this.placePiece(row, col))
        this.boardLayer.add(zone)

        if (value) {
          const piece = this.pieceInfo(value)
          const marker = this.add.graphics()
          marker.fillStyle(hexToNumber(piece.fill), 1)
          marker.fillRoundedRect(x + 11, y + 11, cellSize - 22, cellSize - 22, 9)
          marker.lineStyle(3, 0xfffdfa, 0.8)
          marker.strokeRoundedRect(x + 18, y + 18, cellSize - 36, cellSize - 36, 7)
          this.boardLayer.add(marker)
        }
      }
    }
  }

  private placePiece(row: number, col: number) {
    if (this.completed) {
      this.resetState()
      this.draw()
      this.emitMetric('game_started', {
        gameId: this.config.id,
        targetScore: this.targetScore,
        generatedRuntime: true,
        restart: true,
      })
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
      this.emitMetric('tutorial_completed', {
        gameId: this.config.id,
        variant: this.pacingVariant,
        generatedRuntime: true,
      })
    }

    const piece = this.nextPiece()
    const gained = this.scoreMove(row, col, piece)
    this.board[row][col] = piece
    this.moves += 1
    this.score += gained
    this.emitMetric('turn_taken', {
      gameId: this.config.id,
      generatedRuntime: true,
      move: this.moves,
      piece,
      gained,
      score: this.score,
    })

    if (this.moves >= this.config.maxMoves) {
      this.completed = true
      this.emitMetric('level_completed', {
        gameId: this.config.id,
        generatedRuntime: true,
        score: this.score,
        won: this.score >= this.targetScore,
      })
    }

    this.draw()
    this.emitSnapshot()
  }

  private scoreMove(row: number, col: number, piece: PieceId) {
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]
    const sameNeighbors = neighbors.filter(([nextRow, nextCol]) => this.board[nextRow]?.[nextCol] === piece)
      .length
    const occupiedNeighbors = neighbors.filter(
      ([nextRow, nextCol]) => this.board[nextRow]?.[nextCol] !== undefined && this.board[nextRow]?.[nextCol] !== null,
    ).length
    const rowValues = this.board[row].filter(Boolean)
    const colValues = this.board.map((boardRow) => boardRow[col]).filter(Boolean)
    const rowDiversity = new Set([...rowValues, piece]).size
    const colDiversity = new Set([...colValues, piece]).size
    const centerDistance =
      Math.abs(row - (this.config.boardRows - 1) / 2) + Math.abs(col - (this.config.boardCols - 1) / 2)
    const centerBonus = centerDistance <= 1.5 ? this.config.scoring.center : 0
    const cornerBonus =
      (row === 0 || row === this.config.boardRows - 1) && (col === 0 || col === this.config.boardCols - 1)
        ? this.config.scoring.corner
        : 0

    return (
      this.config.scoring.base +
      sameNeighbors * this.config.scoring.sameNeighbor +
      occupiedNeighbors * this.config.scoring.occupiedNeighbor +
      (rowDiversity >= 3 ? this.config.scoring.rowDiversity : 0) +
      (colDiversity >= 3 ? this.config.scoring.columnDiversity : 0) +
      centerBonus +
      cornerBonus
    )
  }

  private nextPiece() {
    return this.queue[this.moves] ?? this.config.pieces[0].id
  }

  private pieceInfo(pieceId: PieceId) {
    return this.config.pieces.find((piece) => piece.id === pieceId) ?? this.config.pieces[0]
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
      gameId: this.config.id,
      variantId: this.pacingVariant,
      surface: this.firstMoveCoach.surface,
      telemetryId: this.firstMoveCoach.telemetryId,
      recommendedRow: this.firstMoveCoach.recommendedCell.row,
      recommendedCol: this.firstMoveCoach.recommendedCell.col,
      targetScore: this.targetScore,
      generatedRuntime: true,
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
      gameId: this.config.id,
      variantId: this.pacingVariant,
      surface: this.firstMoveCoach.surface,
      telemetryId: this.firstMoveCoach.telemetryId,
      row,
      col,
      recommendedRow: this.firstMoveCoach.recommendedCell.row,
      recommendedCol: this.firstMoveCoach.recommendedCell.col,
      targetScore: this.targetScore,
      generatedRuntime: true,
    })
  }

  private emitSnapshot() {
    this.sink({
      type: 'snapshot',
      snapshot: {
        gameId: this.config.id,
        title: this.config.title,
        score: this.score,
        moves: this.moves,
        maxMoves: this.config.maxMoves,
        nextLabel: this.pieceInfo(this.nextPiece()).label,
        completed: this.completed,
        result: this.completed
          ? this.score >= this.targetScore
            ? 'contract-won'
            : 'contract-missed'
          : 'playing',
      },
    })
  }

  private emitMetric(name: string, properties: Record<string, string | number | boolean | null>) {
    this.sink({ type: 'metric', name, properties })
  }
}
