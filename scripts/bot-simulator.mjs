import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const configPath = path.join(root, 'data', 'game-balance.json')
const outputJsonPath = path.join(root, 'data', 'balance-report.json')
const outputTsPath = path.join(root, 'src', 'data', 'balanceReport.ts')
const reportPath = path.join(root, 'reports', 'bot-simulation-latest.md')

const simulationCount = 420
const balanceConfig = JSON.parse(await readFile(configPath, 'utf8'))

const scoringModels = {
  'harbor-rings': {
    id: 'harbor-rings',
    scoreMove({ board, row, col, piece }) {
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ].filter(([nextRow, nextCol]) => board[nextRow]?.[nextCol] === piece).length

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
        cells.every(([nextRow, nextCol]) => board[nextRow]?.[nextCol] === piece),
      )
        ? 8
        : 0

      const centerBonus = row === 2 && col === 2 ? 3 : 0
      return 2 + neighbors * 3 + ringBonus + centerBonus
    },
  },
  'lantern-relay': {
    id: 'lantern-relay',
    scoreMove({ board, row, col, piece }) {
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]

      const sameNeighbors = neighbors.filter(
        ([nextRow, nextCol]) => board[nextRow]?.[nextCol] === piece,
      ).length

      const occupiedNeighbors = neighbors.filter(
        ([nextRow, nextCol]) =>
          board[nextRow]?.[nextCol] !== undefined && board[nextRow]?.[nextCol] !== null,
      ).length

      const relayBonus = occupiedNeighbors >= 2 ? 6 : 0
      const centerBonus = Math.abs(row - 2) + Math.abs(col - 2) <= 1 ? 2 : 0
      const squareBonus = createsWorkshopSquare({ board, row, col, piece }) ? 8 : 0

      return 3 + sameNeighbors * 4 + relayBonus + centerBonus + squareBonus
    },
  },
  'harbor-circuit': {
    id: 'harbor-circuit',
    scoreMove({ board, row, col, piece }) {
      const rowValues = board[row].filter(Boolean)
      const columnValues = board.map((boardRow) => boardRow[col]).filter(Boolean)
      const left = board[row]?.[col - 1]
      const right = board[row]?.[col + 1]
      const rowMatches = rowValues.filter((value) => value === piece).length
      const columnMatches = columnValues.filter((value) => value === piece).length
      const rowSet = new Set([...rowValues, piece])
      const routeBonus = left && right ? 7 : left || right ? 3 : 0
      const diversityBonus = rowSet.size >= 3 ? 6 : 0
      const contractBonus =
        piece === 'cargo' && row === 0
          ? 4
          : piece === 'signal' && row === 1
            ? 4
            : piece === 'ferry' && row === 2
              ? 4
              : 0

      return 4 + rowMatches * 4 + columnMatches * 2 + routeBonus + diversityBonus + contractBonus
    },
  },
  'foundry-ledger': {
    id: 'foundry-ledger',
    scoreMove({ board, row, col, piece }) {
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]

      const occupiedNeighbors = neighbors.filter(
        ([nextRow, nextCol]) =>
          board[nextRow]?.[nextCol] !== undefined && board[nextRow]?.[nextCol] !== null,
      )
      const sameNeighbors = occupiedNeighbors.filter(
        ([nextRow, nextCol]) => board[nextRow]?.[nextCol] === piece,
      ).length
      const rowValues = board[row].filter(Boolean)
      const colValues = board.map((boardRow) => boardRow[col]).filter(Boolean)
      const rowDiversity = new Set([...rowValues, piece]).size
      const colDiversity = new Set([...colValues, piece]).size
      const edgeBonus = row === 0 || col === 0 || row === board.length - 1 || col === board[0].length - 1 ? 3 : 0
      const contractBonus =
        piece === 'ore' && row <= 1
          ? 4
          : piece === 'coin' && col >= board[0].length - 2
            ? 4
            : piece === 'steam' && row >= board.length - 2
              ? 4
              : piece === 'guild' && col <= 1
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
    },
  },
  'orbit-atlas': {
    id: 'orbit-atlas',
    scoreMove({ board, row, col, piece }) {
      const rowValues = board[row].filter(Boolean)
      const columnValues = board.map((boardRow) => boardRow[col]).filter(Boolean)
      const rowMatches = rowValues.filter((value) => value === piece).length
      const columnMatches = columnValues.filter((value) => value === piece).length
      const rowDiversity = new Set([...rowValues, piece]).size
      const left = board[row]?.[col - 1]
      const right = board[row]?.[col + 1]
      const chainBonus = left && right ? 8 : left || right ? 4 : 0
      const expeditionBonus =
        piece === 'scout' && col === 0
          ? 5
          : piece === 'camp' && row === 1
            ? 5
            : piece === 'map' && col >= board[0].length - 2
              ? 5
              : piece === 'relic' && rowValues.length >= 2
                ? 5
                : 0

      return (
        4 +
        rowMatches * 5 +
        columnMatches * 3 +
        chainBonus +
        (rowDiversity >= 3 ? 7 : 0) +
        expeditionBonus
      )
    },
  },
}

const genericScoreMove = ({ game, board, row, col, piece }) => {
  const scoring = game.scoring ?? {
    base: 3,
    sameNeighbor: 4,
    occupiedNeighbor: 2,
    rowDiversity: 5,
    columnDiversity: 4,
    center: 3,
    corner: 2,
  }
  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]
  const sameNeighbors = neighbors.filter(([nextRow, nextCol]) => board[nextRow]?.[nextCol] === piece)
    .length
  const occupiedNeighbors = neighbors.filter(
    ([nextRow, nextCol]) => board[nextRow]?.[nextCol] !== undefined && board[nextRow]?.[nextCol] !== null,
  ).length
  const rowValues = board[row].filter(Boolean)
  const colValues = board.map((boardRow) => boardRow[col]).filter(Boolean)
  const rowDiversity = new Set([...rowValues, piece]).size
  const colDiversity = new Set([...colValues, piece]).size
  const centerDistance =
    Math.abs(row - (board.length - 1) / 2) + Math.abs(col - (board[0].length - 1) / 2)
  const centerBonus = centerDistance <= 1.5 ? scoring.center : 0
  const cornerBonus =
    (row === 0 || row === board.length - 1) && (col === 0 || col === board[0].length - 1)
      ? scoring.corner
      : 0

  return (
    scoring.base +
    sameNeighbors * scoring.sameNeighbor +
    occupiedNeighbors * scoring.occupiedNeighbor +
    (rowDiversity >= 3 ? scoring.rowDiversity : 0) +
    (colDiversity >= 3 ? scoring.columnDiversity : 0) +
    centerBonus +
    cornerBonus
  )
}

const gameConfigs = Object.values(balanceConfig.games).map((config) => ({
  ...config,
  scoreMove:
    scoringModels[config.id]?.scoreMove ??
    ((args) =>
      genericScoreMove({
        game: config,
        ...args,
      })),
}))

const boardRows = (game) => game.boardRows ?? game.boardSize
const boardCols = (game) => game.boardCols ?? game.boardSize

const createRng = (seed) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

const seededQueue = ({ pieces, maxMoves, seed }) => {
  const rng = createRng(seed)
  return Array.from({ length: maxMoves + 1 }, () => pieces[Math.floor(rng() * pieces.length)])
}

const emptyBoard = ({ rows, cols }) => Array.from({ length: rows }, () => Array(cols).fill(null))

const emptyCells = ({ board, rows, cols }) => {
  const cells = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!board[row][col]) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

const createsWorkshopSquare = ({ board, row, col, piece }) => {
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
      nextRow === row && nextCol === col ? piece : board[nextRow]?.[nextCol],
    )
    return values.every(Boolean) && values.filter((value) => value === piece).length >= 2
  })
}

const chooseMove = ({ game, board, piece, strategy, rng }) => {
  const rows = boardRows(game)
  const cols = boardCols(game)
  const cells = emptyCells({ board, rows, cols })

  if (strategy === 'random') {
    return cells[Math.floor(rng() * cells.length)]
  }

  const scored = cells.map((cell) => ({
    ...cell,
    gained: game.scoreMove({ board, row: cell.row, col: cell.col, piece }),
    centerDistance: Math.abs(cell.row - (rows - 1) / 2) + Math.abs(cell.col - (cols - 1) / 2),
  }))

  if (strategy === 'center') {
    scored.sort((a, b) => a.centerDistance - b.centerDistance || b.gained - a.gained)
    return scored[0]
  }

  scored.sort((a, b) => b.gained - a.gained || a.centerDistance - b.centerDistance)
  return scored[0]
}

const playGame = ({ game, strategy, seed }) => {
  const rng = createRng(seed + 99)
  const board = emptyBoard({ rows: boardRows(game), cols: boardCols(game) })
  const queue = seededQueue({ pieces: game.pieces, maxMoves: game.maxMoves, seed })
  let score = 0
  const moveScores = []

  for (let move = 0; move < game.maxMoves; move += 1) {
    const piece = queue[move]
    const choice = chooseMove({ game, board, piece, strategy, rng })
    const gained = game.scoreMove({ board, row: choice.row, col: choice.col, piece })

    board[choice.row][choice.col] = piece
    score += gained
    moveScores.push(gained)
  }

  return {
    score,
    won: score >= game.targetScore,
    moveScores,
  }
}

const percentile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)))
  return sorted[index]
}

const average = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)

const summarizeStrategy = ({ game, strategy }) => {
  const results = Array.from({ length: simulationCount }, (_, index) =>
    playGame({
      game,
      strategy,
      seed: (index + 1) * 7919 + game.id.length * 101,
    }),
  )
  const scores = results.map((result) => result.score)
  const moveScores = results.flatMap((result) => result.moveScores)
  const wins = results.filter((result) => result.won).length

  return {
    strategy,
    games: results.length,
    averageScore: Math.round(average(scores) * 10) / 10,
    p10: percentile(scores, 0.1),
    p50: percentile(scores, 0.5),
    p90: percentile(scores, 0.9),
    winRate: Math.round((wins / results.length) * 1000) / 1000,
    averageMoveValue: Math.round(average(moveScores) * 10) / 10,
  }
}

const recommend = ({ game, strategies }) => {
  const random = strategies.find((strategy) => strategy.strategy === 'random')
  const greedy = strategies.find((strategy) => strategy.strategy === 'greedy')
  const center = strategies.find((strategy) => strategy.strategy === 'center')
  const recommendations = []

  if (greedy.winRate < 0.45) {
    recommendations.push({
      severity: 'high',
      title: 'Lower target score or add stronger combo feedback',
      reason: `greedy bot wins only ${Math.round(greedy.winRate * 100)}% against target ${game.targetScore}`,
      confidence: 78,
    })
  }

  if (random.winRate > 0.6) {
    recommendations.push({
      severity: 'medium',
      title: 'Raise target score or reduce base scoring',
      reason: `random bot wins ${Math.round(random.winRate * 100)}%, which makes mastery less meaningful`,
      confidence: 72,
    })
  }

  if (greedy.p50 - random.p50 < 8) {
    recommendations.push({
      severity: 'medium',
      title: 'Increase reward for intentional placement',
      reason: `median greedy advantage is only ${greedy.p50 - random.p50} points`,
      confidence: 68,
    })
  }

  if (center.winRate > greedy.winRate + 0.15) {
    recommendations.push({
      severity: 'low',
      title: 'Reduce center-board dominance',
      reason: `center bot beats greedy by ${Math.round((center.winRate - greedy.winRate) * 100)} points`,
      confidence: 61,
    })
  }

  return recommendations.length
    ? recommendations
    : [
        {
          severity: 'low',
          title: 'Balance looks playable for first web test',
          reason: 'bot strategies create a useful score spread without extreme win rates',
          confidence: 64,
        },
      ]
}

const gameReports = gameConfigs.map((game) => {
  const strategies = ['random', 'center', 'greedy'].map((strategy) =>
    summarizeStrategy({ game, strategy }),
  )

  return {
    gameId: game.id,
    title: game.title,
    targetScore: game.targetScore,
    maxMoves: game.maxMoves,
    simulations: simulationCount * strategies.length,
    strategies,
    recommendations: recommend({ game, strategies }),
  }
})

const payload = {
  generatedAt: new Date().toISOString(),
  simulationCountPerStrategy: simulationCount,
  games: gameReports,
}

const tsOutput = `export const balanceReport = ${JSON.stringify(payload, null, 2)} as const\n\nexport type BalanceGameReport = (typeof balanceReport.games)[number]\n`

const report = [
  '# Bot Simulation Report',
  '',
  `Generated: ${payload.generatedAt}`,
  '',
  ...gameReports.flatMap((game) => [
    `## ${game.title}`,
    '',
    `Target: ${game.targetScore} in ${game.maxMoves} moves`,
    `Simulations: ${game.simulations}`,
    '',
    '### Strategy Results',
    '',
    ...game.strategies.map(
      (strategy) =>
        `- ${strategy.strategy}: avg ${strategy.averageScore}, p50 ${strategy.p50}, p90 ${strategy.p90}, win ${Math.round(strategy.winRate * 100)}%`,
    ),
    '',
    '### Recommendations',
    '',
    ...game.recommendations.map(
      (recommendation) =>
        `- ${recommendation.severity}: ${recommendation.title} (${recommendation.confidence}% confidence) - ${recommendation.reason}`,
    ),
    '',
  ]),
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2))
await writeFile(outputTsPath, tsOutput)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
