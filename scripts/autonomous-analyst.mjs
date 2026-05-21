import { mkdir, readFile, writeFile } from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'node:path'

const root = process.cwd()
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const trendPath = path.join(root, 'data', 'trend-signals.json')
const conceptsPath = path.join(root, 'data', 'generated-concepts.json')
const prototypePath = path.join(root, 'data', 'prototype-pipeline.json')
const balancePath = path.join(root, 'data', 'balance-report.json')
const playablePath = path.join(root, 'data', 'playable-games.json')
const supportFeedbackPath = path.join(root, 'data', 'support-feedback.json')
const reportPath = path.join(root, 'reports', 'autonomous-analyst-latest.md')
const backlogPath = path.join(root, 'data', 'improvement-backlog.json')
const backlogSummaryPath = path.join(root, 'data', 'improvement-backlog-summary.json')
const routingPath = path.join(root, 'data', 'improvement-routing.json')

const analytics = JSON.parse(await readFile(analyticsPath, 'utf8'))
const rows = analytics.games ?? []
const trend = JSON.parse(await readFile(trendPath, 'utf8'))
const concepts = JSON.parse(await readFile(conceptsPath, 'utf8'))
const pipeline = JSON.parse(await readFile(prototypePath, 'utf8'))
const balance = JSON.parse(await readFile(balancePath, 'utf8'))
const playable = JSON.parse(await readFile(playablePath, 'utf8'))
const supportFeedback = await readFile(supportFeedbackPath, 'utf8')
  .then((raw) => JSON.parse(raw))
  .catch(() => ({
    status: 'missing',
    sourceDataHash: null,
    summary: { issuesInspected: 0, improvementSignals: 0, routableSignals: 0, aggregateEvidenceNotes: 0 },
    improvementSignals: [],
    aggregateEvidenceNotes: [],
  }))
const playableGameIds = new Set(playable.games ?? [])
const generatedAt = new Date().toISOString()

const pct = (value) => `${Math.round(value * 100)}%`

const diagnose = (row) => {
  const startRate = row.metrics.startRate
  const completionRate = row.metrics.firstGameCompletion
  const tutorialRate = row.metrics.tutorialCompletion
  const replayRate = row.metrics.replayRate
  const issues = []

  if (startRate < 0.7) {
    issues.push({
      gameId: row.gameId,
      title: 'Improve title and thumbnail',
      reason: `start rate is ${pct(startRate)}`,
      confidence: 74,
      experiment: 'thumbnail_board_state_v2',
    })
  }

  if (tutorialRate < 0.75) {
    issues.push({
      gameId: row.gameId,
      title: 'Shorten first tutorial',
      reason: `tutorial completion is ${pct(tutorialRate)}`,
      confidence: 81,
      experiment: 'first_session_pacing',
    })
  }

  if (completionRate < 0.55) {
    issues.push({
      gameId: row.gameId,
      title: 'Rebalance first-game difficulty',
      reason: `completion rate is ${pct(completionRate)}`,
      confidence: 69,
      experiment: 'target_score_curve',
    })
  }

  if (replayRate < 0.35) {
    issues.push({
      gameId: row.gameId,
      title: 'Add daily goal reward copy and result animation',
      reason: `replay rate is ${pct(replayRate)}`,
      confidence: 58,
      experiment: 'reward_offer',
    })
  }

  return { startRate, tutorialRate, completionRate, replayRate, issues }
}

const analyses = rows.map((row) => ({
  ...row,
  playable: playableGameIds.has(row.gameId),
  diagnosis: diagnose(row),
}))

const backlog = analyses
  .filter((analysis) => analysis.playable)
  .flatMap((analysis) => analysis.diagnosis.issues)
  .concat(
    (supportFeedback.improvementSignals ?? [])
      .filter((signal) => signal.status === 'routable')
      .filter((signal) => signal.gameId && playableGameIds.has(signal.gameId))
      .filter((signal) =>
        ['first_session_pacing', 'target_score_curve', 'reward_offer', 'thumbnail_board_state_v2'].includes(
          signal.experiment,
        ),
      )
      .map((signal) => ({
        gameId: signal.gameId,
        title: `Support feedback: ${signal.label}`,
        reason: `${signal.reason} Public issue numbers: ${(signal.issueNumbers ?? []).join(', ') || 'none'}`,
        confidence: signal.confidence,
        experiment: signal.experiment,
        source: 'support-feedback',
        supportSignalId: signal.id,
        supportIssueNumbers: signal.issueNumbers ?? [],
      })),
    balance.games
      .filter((game) => playableGameIds.has(game.gameId))
      .flatMap((game) =>
        game.recommendations
          .filter((recommendation) => recommendation.severity !== 'low')
          .map((recommendation) => ({
            gameId: game.gameId,
            title: recommendation.title,
            reason: recommendation.reason,
            confidence: recommendation.confidence,
            experiment: 'bot_balance_curve',
          })),
    ),
  )
  .sort((a, b) => b.confidence - a.confidence)

const inactiveAnalyses = analyses.filter((analysis) => !analysis.playable)
const skippedIssues = inactiveAnalyses.flatMap((analysis) =>
  analysis.diagnosis.issues.map((issue) => ({
    ...issue,
    status: 'skipped',
    reason: `${issue.reason}; ${analysis.gameId} is not currently in the playable registry`,
  })),
)

const routing = {
  generatedAt,
  status: 'live-targets-ready',
  analyticsSource: analytics.sourceStatus.activeSource,
  supportFeedbackStatus: supportFeedback.status,
  supportFeedbackSignals: supportFeedback.summary?.improvementSignals ?? 0,
  supportFeedbackRoutableSignals: supportFeedback.summary?.routableSignals ?? 0,
  supportFeedbackAggregateEvidenceNotes: supportFeedback.summary?.aggregateEvidenceNotes ?? 0,
  playableGameIds: [...playableGameIds],
  liveAnalyticsRows: analyses
    .filter((analysis) => analysis.playable)
    .map((analysis) => ({
      gameId: analysis.gameId,
      issueCount: analysis.diagnosis.issues.length,
    })),
  inactiveAnalyticsRows: inactiveAnalyses.map((analysis) => ({
    gameId: analysis.gameId,
    issueCount: analysis.diagnosis.issues.length,
    reason: 'analytics row is historical or fixture-only and is not registered as playable',
  })),
  backlogCount: backlog.length,
  skippedIssueCount: skippedIssues.length,
  skippedIssues,
}

const sourceDataHash = crypto
  .createHash('sha256')
  .update(
    JSON.stringify({
      analyticsSource: analytics.sourceStatus.activeSource,
      analyticsGames: rows.map((row) => ({
        gameId: row.gameId,
        counts: row.counts,
        metrics: row.metrics,
      })),
      playableGameIds: [...playableGameIds],
      supportFeedback: {
        status: supportFeedback.status,
        sourceDataHash: supportFeedback.sourceDataHash,
        improvementSignals: supportFeedback.summary?.improvementSignals ?? 0,
        routableSignals: supportFeedback.summary?.routableSignals ?? 0,
        aggregateEvidenceNotes: supportFeedback.summary?.aggregateEvidenceNotes ?? 0,
      },
      backlog,
      skippedIssues,
    }),
  )
  .digest('hex')
  .slice(0, 12)

const backlogSummary = {
  generatedAt,
  status: backlog.length ? 'improvement-backlog-ready' : 'improvement-backlog-empty',
  sourceDataHash,
  analyticsSource: analytics.sourceStatus.activeSource,
  supportFeedbackStatus: supportFeedback.status,
  supportFeedbackSignals: supportFeedback.summary?.improvementSignals ?? 0,
  supportFeedbackRoutableSignals: supportFeedback.summary?.routableSignals ?? 0,
  supportFeedbackAggregateEvidenceNotes: supportFeedback.summary?.aggregateEvidenceNotes ?? 0,
  playableGameIds: [...playableGameIds],
  backlogCount: backlog.length,
  skippedIssueCount: skippedIssues.length,
  routingStatus: routing.status,
  topIssues: backlog.slice(0, 5).map((item) => ({
    gameId: item.gameId,
    title: item.title,
    confidence: item.confidence,
    experiment: item.experiment,
  })),
  controls: {
    zeroPaidSpend: true,
    playableTargetsOnly: true,
    inactiveAnalyticsSkipped: true,
    noSyntheticEvents: true,
    aggregateEvidenceNeverMarksProductGatePass: true,
  },
}

const playablePrototypeIds = new Set(
  pipeline.prototypes
    .filter((prototype) => prototype.status === 'playable')
    .map((prototype) => prototype.id),
)

const buildCandidates = concepts.concepts
  .filter((concept) => concept.status === 'candidate')
  .filter((concept) => !playablePrototypeIds.has(concept.id))
  .sort((a, b) => b.opportunity.score - a.opportunity.score)
  .slice(0, 3)

const prototypeQueue = pipeline.prototypes.slice(0, 3)

const report = [
  '# Autonomous Analyst Report',
  '',
  `Generated: ${generatedAt}`,
  `Backlog status: ${backlogSummary.status}`,
  `Backlog source hash: ${backlogSummary.sourceDataHash}`,
  '',
  '## Game Health',
  '',
  `Analytics source: ${analytics.sourceStatus.activeSource}`,
  `Support feedback: ${supportFeedback.status}; signals ${
    supportFeedback.summary?.improvementSignals ?? 0
  }; routable ${supportFeedback.summary?.routableSignals ?? 0}; aggregate notes ${
    supportFeedback.summary?.aggregateEvidenceNotes ?? 0
  }`,
  '',
  ...analyses.flatMap((analysis) => [
    `### ${analysis.gameId}`,
    '',
    `- Start rate: ${pct(analysis.diagnosis.startRate)}`,
    `- Tutorial completion: ${pct(analysis.diagnosis.tutorialRate)}`,
    `- First-game completion: ${pct(analysis.diagnosis.completionRate)}`,
    `- Replay rate: ${pct(analysis.diagnosis.replayRate)}`,
    '',
  ]),
  '## Ranked Improvements',
  '',
  ...backlog.map(
    (item, index) =>
      `${index + 1}. ${item.gameId}: ${item.title} (${item.confidence}% confidence) - ${item.reason}; experiment ${item.experiment}.`,
  ),
  '',
  '## Inactive Analytics Rows',
  '',
  ...(routing.inactiveAnalyticsRows.length
    ? routing.inactiveAnalyticsRows.map(
        (item) => `- skipped: ${item.gameId}; ${item.issueCount} issue(s); ${item.reason}.`,
      )
    : ['- none']),
  '',
  '## Next Build Candidates',
  '',
  ...buildCandidates.map(
    (concept, index) =>
      `${index + 1}. ${concept.title}: ${concept.opportunity.mechanic} + ${concept.opportunity.theme}; template ${concept.gameBrief.firstPrototypeTemplate}; opportunity score ${concept.opportunity.score}.`,
  ),
  '',
  '## Prototype Queue',
  '',
  ...prototypeQueue.map(
    (item, index) =>
      `${index + 1}. ${item.title}: ${item.status}; release score ${item.releaseScore}; web ${item.distribution.webPwa.status}; Google Play ${item.distribution.googlePlay.status}.`,
  ),
  '',
  '## Bot Balance',
  '',
  ...balance.games.flatMap((game) => {
    const greedy = game.strategies.find((strategy) => strategy.strategy === 'greedy')
    const random = game.strategies.find((strategy) => strategy.strategy === 'random')
    return [
      `### ${game.title}`,
      '',
      `- Target: ${game.targetScore}`,
      `- Random win rate: ${pct(random?.winRate ?? 0)}`,
      `- Greedy win rate: ${pct(greedy?.winRate ?? 0)}`,
      `- Recommendation: ${game.recommendations[0]?.title ?? 'none'}`,
      '',
    ]
  }),
  '',
  '## Trend Inputs',
  '',
  `Active trend source: ${trend.sourceStatus.activeSource}`,
  `Active analytics source: ${analytics.sourceStatus.activeSource}`,
  `Top mechanic: ${trend.signals.mechanics[0]?.name ?? 'none'}`,
  `Top theme: ${trend.signals.themes[0]?.name ?? 'none'}`,
  '',
].join('\n')

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, report)
await writeFile(backlogPath, JSON.stringify(backlog, null, 2))
await writeFile(backlogSummaryPath, JSON.stringify(backlogSummary, null, 2) + '\n')
await writeFile(routingPath, JSON.stringify(routing, null, 2) + '\n')

console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, backlogPath)}`)
console.log(`Wrote ${path.relative(root, backlogSummaryPath)}`)
console.log(`Wrote ${path.relative(root, routingPath)}`)
