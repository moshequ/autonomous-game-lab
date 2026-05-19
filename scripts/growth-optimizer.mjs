import crypto from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const growthPlanPath = path.join(root, 'data', 'growth-plan.json')
const growthPolicyPath = path.join(root, 'data', 'growth-policy.json')
const outputJsonPath = path.join(root, 'data', 'growth-optimizer.json')
const reportPath = path.join(root, 'reports', 'growth-optimizer-latest.md')

const loadJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const loadOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const analytics = await loadJson(analyticsPath)
const growthPlan = await loadOptionalJson(growthPlanPath, { gamePages: [], channels: [] })
const policy = await loadJson(growthPolicyPath)

const activeGames = growthPlan.gamePages ?? []
const activeGameIds = new Set(activeGames.map((game) => game.gameId))
const organicEntries = analytics.totals?.counts?.organic_entry_opened ?? 0
const shareClicks = analytics.totals?.counts?.share_clicked ?? 0
const gameStarts = analytics.totals?.counts?.game_started ?? 0
const sourceDataHash = crypto
  .createHash('sha256')
  .update(
    JSON.stringify({
      source: analytics.sourceStatus?.activeSource,
      organicEntries,
      shareClicks,
      gameStarts,
      games: activeGames.map((game) => ({
        gameId: game.gameId,
        qualityScore: game.metrics?.qualityScore,
        focus: game.channelFocus,
      })),
    }),
  )
  .digest('hex')
  .slice(0, 12)

const history = policy.history ?? []
const actions = []
const touched = new Set()

for (const gameId of Object.keys(policy.games ?? {})) {
  if (!activeGameIds.has(gameId)) {
    delete policy.games[gameId]
  }
}

const alreadyApplied = (gameId, reason) =>
  history.some(
    (action) =>
      action.status === 'applied' &&
      action.gameId === gameId &&
      action.reason === reason &&
      action.sourceDataHash === sourceDataHash,
  )

const ensureGamePolicy = (gameId) => {
  policy.games[gameId] ??= {}
  return policy.games[gameId]
}

const applyPolicy = ({ gameId, reason, ctaVariant, messageVariant, confidence }) => {
  if (touched.size >= policy.guardrails.maxChangesPerRun) {
    return {
      status: 'deferred',
      gameId,
      reason: 'growth change limit reached for this run',
      sourceDataHash,
    }
  }

  if (alreadyApplied(gameId, reason)) {
    return {
      status: 'skipped',
      gameId,
      reason: 'same growth diagnosis already applied for this source data',
      sourceDataHash,
    }
  }

  if (
    !policy.guardrails.allowedCtaVariants.includes(ctaVariant) ||
    !policy.guardrails.allowedMessageVariants.includes(messageVariant)
  ) {
    return {
      status: 'deferred',
      gameId,
      reason: 'requested growth variant is outside guardrails',
      sourceDataHash,
    }
  }

  const gamePolicy = ensureGamePolicy(gameId)
  const before = { ...gamePolicy }
  gamePolicy.ctaVariant = ctaVariant
  gamePolicy.messageVariant = messageVariant
  gamePolicy.reason = reason
  gamePolicy.confidence = confidence
  gamePolicy.updatedAt = new Date().toISOString()
  touched.add(gameId)

  return {
    status: 'applied',
    gameId,
    reason,
    confidence,
    sourceDataHash,
    before,
    after: { ...gamePolicy },
  }
}

if (!organicEntries) {
  const candidates = activeGames
    .slice()
    .sort((a, b) => (b.metrics?.qualityScore ?? 0) - (a.metrics?.qualityScore ?? 0))
    .slice(0, policy.guardrails.maxChangesPerRun)

  for (const game of candidates) {
    actions.push(
      applyPolicy({
        gameId: game.gameId,
        reason: 'No organic entry data yet; seed strongest pages with daily challenge copy.',
        ctaVariant: 'daily-challenge',
        messageVariant: 'daily',
        confidence: 73,
      }),
    )
  }
} else {
  const organicStartRate = gameStarts / Math.max(organicEntries, 1)

  for (const game of activeGames) {
    if (organicStartRate < 0.45) {
      actions.push(
        applyPolicy({
          gameId: game.gameId,
          reason: `Organic-to-start rate is ${Math.round(organicStartRate * 100)}%, below 45%.`,
          ctaVariant: 'quick-strategy',
          messageVariant: 'generated-original',
          confidence: 69,
        }),
      )
    }
  }
}

if (!shareClicks && activeGames.length) {
  const existingApplied = actions.some((action) => action.status === 'applied')
  const candidate = activeGames.find((game) => !touched.has(game.gameId)) ?? activeGames[0]

  if (!existingApplied || touched.size < policy.guardrails.maxChangesPerRun) {
    actions.push(
      applyPolicy({
        gameId: candidate.gameId,
        reason: 'No share clicks captured yet; test faster share-oriented CTA.',
        ctaVariant: 'quick-strategy',
        messageVariant: 'generated-original',
        confidence: 66,
      }),
    )
  }
}

const applied = actions.filter((action) => action.status === 'applied')

if (applied.length) {
  policy.generatedAt = new Date().toISOString()
  policy.history = [
    ...history,
    ...applied.map((action) => ({
      status: action.status,
      gameId: action.gameId,
      reason: action.reason,
      confidence: action.confidence,
      sourceDataHash,
      appliedAt: policy.generatedAt,
      after: action.after,
    })),
  ].slice(-40)
}

const payload = {
  generatedAt: new Date().toISOString(),
  sourceDataHash,
  source: analytics.sourceStatus?.activeSource,
  observed: {
    organicEntries,
    shareClicks,
    gameStarts,
  },
  actions,
  policySummary: {
    optimizedGames: Object.keys(policy.games ?? {}).length,
    activeChanges: Object.entries(policy.games ?? {}).map(([gameId, gamePolicy]) => ({
      gameId,
      ctaVariant: gamePolicy.ctaVariant,
      messageVariant: gamePolicy.messageVariant,
      reason: gamePolicy.reason,
    })),
  },
}

const report = [
  '# Growth Optimizer',
  '',
  `Generated: ${payload.generatedAt}`,
  `Source: ${payload.source}`,
  `Source data hash: ${sourceDataHash}`,
  '',
  '## Observed',
  '',
  `- Organic entries: ${organicEntries}`,
  `- Share clicks: ${shareClicks}`,
  `- Game starts: ${gameStarts}`,
  '',
  '## Actions',
  '',
  ...actions.map((action) =>
    action.status === 'applied'
      ? `- applied: ${action.gameId}; ${action.reason}; CTA ${action.after.ctaVariant}; message ${action.after.messageVariant}.`
      : `- ${action.status}: ${action.gameId}; ${action.reason}.`,
  ),
  '',
  '## Active Policy',
  '',
  ...payload.policySummary.activeChanges.map(
    (item) => `- ${item.gameId}: ${item.ctaVariant}, ${item.messageVariant} - ${item.reason}`,
  ),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(growthPolicyPath, JSON.stringify(policy, null, 2) + '\n')
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, growthPolicyPath)}`)
console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
