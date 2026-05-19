import Phaser from 'phaser'
import { gameBalance } from '../data/gameBalance'
import type { GameSceneSink, GameSnapshot } from './gameTypes'

type OrbitCard = 'scout' | 'camp' | 'map' | 'relic'
type Cell = OrbitCard | null

const orbitConfig = gameBalance.games['orbit-atlas']
const boardRows = orbitConfig.boardRows
const boardCols = orbitConfig.boardCols
const maxMoves = orbitConfig.maxMoves
const targetScore = orbitConfig.targetScore

const cards: Record<OrbitCard, { fill: number; label: string; short: string }> = {
  scout: { fill: 0x187f7a, label: 'Scout', short: 'S' },
  camp: { fill: 0xb87b16, label: 'Camp', short: 'C' },
  map: { fill: 0x6b5bb8, label: 'Map', short: 'M' },
  relic: { fill: 0xbd4d38, label: 'Relic', short: 'R' },
}

const cardOrder = orbitConfig.pieces as readonly OrbitCard[]

const seededDeck = () => {
  const seedText = `${new Date().toISOString().slice(0, 10)}-orbit-atlas`
  let seed = [...seedText].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return Array.from({ length: maxMoves + 6 }, (_, index) => {
    seed = (seed * 16807 + index + 31) % 2147483647
    return cardOrder[seed % cardOrder.length]
  })
}

export class OrbitAtlasScene extends Phaser.Scene {
  private board: Cell[][] = []
  private deck: OrbitCard[] = []
  private market: OrbitCard[] = []
  private selectedMarketIndex = 0
  private score = 0
  private moves = 0
  private completed = false
  private tutorialCompleted = false
  private sink: GameSceneSink
  private pacingVariant: string
  private hudLayer?: Phaser.GameObjects.Container
  private boardLayer?: Phaser.GameObjects.Container
  private marketLayer?: Phaser.GameObjects.Container

  constructor(options: { sink: GameSceneSink; pacingVariant: string }) {
    super('OrbitAtlas')
    this.sink = options.sink
    this.pacingVariant = options.pacingVariant
  }

  create() {
    this.resetState()
    this.draw()
    this.emitMetric('prototype_started', {
      gameId: 'orbit-atlas',
      template: 'tableau',
      targetScore,
    })
    this.emitMetric('game_started', { gameId: 'orbit-atlas', targetScore })
    this.emitSnapshot()
  }

  private resetState() {
    this.board = Array.from({ length: boardRows }, () => Array<Cell>(boardCols).fill(null))
    this.deck = seededDeck()
    this.market = this.deck.slice(0, 3)
    this.selectedMarketIndex = 0
    this.score = 0
    this.moves = 0
    this.completed = false
    this.tutorialCompleted = false
  }

  private draw() {
    this.cameras.main.setBackgroundColor('#fffdfa')
    this.hudLayer?.destroy()
    this.boardLayer?.destroy()
    this.marketLayer?.destroy()

    this.hudLayer = this.add.container(0, 0)
    this.boardLayer = this.add.container(0, 0)
    this.marketLayer = this.add.container(0, 0)
    this.drawHud()
    this.drawMarket()
    this.drawTableau()
  }

  private drawHud() {
    if (!this.hudLayer) {
      return
    }

    const title = this.add
      .text(24, 18, orbitConfig.title, {
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

    this.hudLayer.add([title, subtitle, scoreText, movesText])

    if (this.completed) {
      const won = this.score >= targetScore
      const text = won ? 'Atlas sealed. Tap any camp slot to reset.' : 'Atlas incomplete. Tap any camp slot to retry.'
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

  private drawMarket() {
    if (!this.marketLayer) {
      return
    }

    const startX = 318
    const startY = 84
    const width = 64
    const height = 78
    const gap = 10

    for (let index = 0; index < this.market.length; index += 1) {
      const card = this.market[index]
      const x = startX + index * (width + gap)
      const y = startY
      const style = cards[card]
      const cardGraphic = this.add.graphics()
      cardGraphic.fillStyle(style.fill, 1)
      cardGraphic.fillRoundedRect(x, y, width, height, 8)
      cardGraphic.lineStyle(index === this.selectedMarketIndex ? 4 : 2, 0x191713, 1)
      cardGraphic.strokeRoundedRect(x, y, width, height, 8)

      const short = this.add
        .text(x + width / 2, y + 16, style.short, {
          align: 'center',
          color: '#fffdfa',
          fontFamily: 'system-ui',
          fontSize: '24px',
          fontStyle: '800',
        })
        .setOrigin(0.5, 0)

      const label = this.add
        .text(x + width / 2, y + 50, style.label, {
          align: 'center',
          color: '#fffdfa',
          fontFamily: 'system-ui',
          fontSize: '11px',
          fontStyle: '700',
        })
        .setOrigin(0.5, 0)

      const zone = this.add
        .zone(x, y, width, height)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })

      zone.on('pointerdown', () => {
        this.selectedMarketIndex = index
        this.draw()
      })

      this.marketLayer.add([cardGraphic, short, label, zone])
    }
  }

  private drawTableau() {
    if (!this.boardLayer) {
      return
    }

    const cellWidth = 98
    const cellHeight = 66
    const gap = 8
    const startX = 60
    const startY = 194
    const rowNames = ['Scout', 'Camp', 'Summit']

    for (let row = 0; row < boardRows; row += 1) {
      const laneLabel = this.add
        .text(16, startY + row * (cellHeight + gap) + 20, rowNames[row] ?? `R${row + 1}`, {
          color: '#625d52',
          fontFamily: 'system-ui',
          fontSize: '12px',
          fontStyle: '800',
        })
        .setOrigin(0, 0)
      this.boardLayer.add(laneLabel)

      for (let col = 0; col < boardCols; col += 1) {
        const x = startX + col * (cellWidth + gap)
        const y = startY + row * (cellHeight + gap)
        const value = this.board[row][col]
        const tile = this.add.graphics()

        tile.fillStyle(0xf3eadc, 1)
        tile.lineStyle(2, 0xd9d0bf, 1)
        tile.fillRoundedRect(x, y, cellWidth, cellHeight, 8)
        tile.strokeRoundedRect(x, y, cellWidth, cellHeight, 8)

        const zone = this.add
          .zone(x, y, cellWidth, cellHeight)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => this.placeCard(row, col))
        this.boardLayer.add([tile, zone])

        if (value) {
          this.drawPlacedCard(x, y, cellWidth, cellHeight, value)
        }
      }
    }
  }

  private drawPlacedCard(x: number, y: number, width: number, height: number, value: OrbitCard) {
    if (!this.boardLayer) {
      return
    }

    const style = cards[value]
    const card = this.add.graphics()
    card.fillStyle(style.fill, 1)
    card.fillRoundedRect(x + 8, y + 8, width - 16, height - 16, 8)

    const label = this.add
      .text(x + width / 2, y + 19, style.label, {
        align: 'center',
        color: '#fffdfa',
        fontFamily: 'system-ui',
        fontSize: '14px',
        fontStyle: '800',
      })
      .setOrigin(0.5, 0)

    this.boardLayer.add([card, label])
  }

  private placeCard(row: number, col: number) {
    if (this.completed) {
      this.resetState()
      this.draw()
      this.emitMetric('prototype_started', {
        gameId: 'orbit-atlas',
        template: 'tableau',
        restart: true,
        targetScore,
      })
      this.emitMetric('game_started', { gameId: 'orbit-atlas', targetScore, restart: true })
      this.emitSnapshot()
      return
    }

    if (this.board[row][col]) {
      return
    }

    if (!this.tutorialCompleted) {
      this.tutorialCompleted = true
      this.emitMetric('tutorial_completed', {
        gameId: 'orbit-atlas',
        variant: this.pacingVariant,
      })
    }

    const card = this.market[this.selectedMarketIndex]
    const gained = this.scoreMove(row, col, card)
    this.board[row][col] = card
    this.moves += 1
    this.score += gained
    this.market[this.selectedMarketIndex] = this.deck[this.moves + 2] ?? cardOrder[this.moves % cardOrder.length]

    this.emitMetric('turn_taken', {
      gameId: 'orbit-atlas',
      move: this.moves,
      card,
      gained,
      score: this.score,
    })

    if (this.moves >= maxMoves) {
      this.completed = true
      const won = this.score >= targetScore
      this.emitMetric(won ? 'level_completed' : 'first_loss', {
        gameId: 'orbit-atlas',
        score: this.score,
        won,
      })
      this.emitMetric('rewarded_ad_available', {
        gameId: 'orbit-atlas',
        reason: won ? 'bonus_expedition_seed' : 'failed_daily_contract',
      })
    }

    this.draw()
    this.emitSnapshot()
  }

  private scoreMove(row: number, col: number, card: OrbitCard) {
    const rowValues = this.board[row].filter(Boolean)
    const columnValues = this.board.map((boardRow) => boardRow[col]).filter(Boolean)
    const rowMatches = rowValues.filter((value) => value === card).length
    const columnMatches = columnValues.filter((value) => value === card).length
    const rowDiversity = new Set([...rowValues, card]).size
    const left = this.board[row]?.[col - 1]
    const right = this.board[row]?.[col + 1]
    const chainBonus = left && right ? 8 : left || right ? 4 : 0
    const expeditionBonus =
      card === 'scout' && col === 0
        ? 5
        : card === 'camp' && row === 1
          ? 5
          : card === 'map' && col >= boardCols - 2
            ? 5
            : card === 'relic' && rowValues.length >= 2
              ? 5
              : 0

    return 4 + rowMatches * 5 + columnMatches * 3 + chainBonus + (rowDiversity >= 3 ? 7 : 0) + expeditionBonus
  }

  private tutorialCopy() {
    if (this.pacingVariant === 'guided') {
      return `Draft expedition cards. Chain rows and diversify routes. Beat ${targetScore}.`
    }

    return `Draft a card, build an expedition row, beat ${targetScore}.`
  }

  private currentSnapshot(): GameSnapshot {
    const selectedCard = this.market[this.selectedMarketIndex]

    return {
      gameId: 'orbit-atlas',
      title: orbitConfig.title,
      score: this.score,
      moves: this.moves,
      maxMoves,
      nextLabel: cards[selectedCard].label,
      completed: this.completed,
      result: this.completed
        ? this.score >= targetScore
          ? 'atlas-sealed'
          : 'atlas-incomplete'
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
