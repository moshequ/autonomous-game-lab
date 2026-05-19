import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const trendPath = path.join(root, 'data', 'trend-signals.json')
const outputPath = path.join(root, 'data', 'generated-concepts.json')
const reportPath = path.join(root, 'reports', 'concepts-latest.md')

const titlePrefixes = ['Lantern', 'Harbor', 'Orbit', 'Foundry', 'Canopy', 'Signal', 'Mosaic', 'Summit']
const titleNouns = ['Relay', 'Bloom', 'Circuit', 'Bazaar', 'Atlas', 'Patch', 'Ledger', 'Crossing']
const themeDetails = {
  'cozy production': {
    setting: 'tiny seasonal workshops',
    playerVerb: 'chain comforting orders',
    artDirection: 'warm workbench pieces and readable resource icons',
  },
  'compact city logistics': {
    setting: 'pocket-size transit districts',
    playerVerb: 'connect demand before congestion rises',
    artDirection: 'bright route lines, station stamps, and compact maps',
  },
  'science desk': {
    setting: 'a tabletop research station',
    playerVerb: 'align instruments into reliable discoveries',
    artDirection: 'clean diagrams, labeled tools, and crisp result cards',
  },
  'expedition planning': {
    setting: 'modular camp routes around unknown landmarks',
    playerVerb: 'commit scouts without overextending supplies',
    artDirection: 'paper maps, stamped hazards, and high-contrast terrain',
  },
  'merchant timing': {
    setting: 'a market that changes prices every turn',
    playerVerb: 'time contracts before rivals reset demand',
    artDirection: 'colorful stalls, contract slips, and clear price tracks',
  },
}

const sourceTitleWords = (title) =>
  String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !['game', 'board', 'card'].includes(word))

const titleRisk = (title, sourceItems) => {
  const generatedWords = new Set(sourceTitleWords(title))
  let risk = 0

  for (const source of sourceItems) {
    const overlap = sourceTitleWords(source.title).filter((word) => generatedWords.has(word))
    if (overlap.length >= 2) {
      risk += 35
    } else if (overlap.length === 1) {
      risk += 8
    }
  }

  return Math.min(100, risk)
}

const uniqueId = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const chooseTitle = (index, sourceItems) => {
  for (let attempt = 0; attempt < titlePrefixes.length * titleNouns.length; attempt += 1) {
    const prefix = titlePrefixes[(index + attempt) % titlePrefixes.length]
    const noun = titleNouns[(index * 2 + attempt) % titleNouns.length]
    const title = `${prefix} ${noun}`

    if (titleRisk(title, sourceItems) < 25) {
      return title
    }
  }

  return `Untitled Concept ${index + 1}`
}

const buildConcept = ({ trend, mechanic, theme, audience, index }) => {
  const title = chooseTitle(index, trend.items)
  const themeInfo = themeDetails[theme.name] ?? themeDetails['science desk']
  const risk = titleRisk(title, trend.items)
  const sessionMinutes = audience?.sessionMinutes ?? 6
  const mobileFit = mechanic.mobileFit ?? 75
  const adSafety = theme.adSafety ?? 90
  const monetizationFit = Math.round((mobileFit + adSafety + 70) / 3)

  return {
    id: uniqueId(title),
    title,
    status: risk >= 35 ? 'rejected' : 'candidate',
    sourceDistance: {
      titleRisk: risk,
      copiedExpressionRisk: risk >= 35 ? 'review' : 'low',
      ruleText: 'generated from template only; no source rule text used',
      art: 'new visual direction; no source art used',
    },
    opportunity: {
      mechanic: mechanic.name,
      theme: theme.name,
      audience: audience?.name ?? 'mobile puzzle',
      score: Math.round(mechanic.score + theme.score + (audience?.score ?? 20)),
    },
    gameBrief: {
      setting: themeInfo.setting,
      coreLoop: `${themeInfo.playerVerb} by making one strong ${mechanic.name} decision per turn.`,
      sessionLengthMinutes: sessionMinutes,
      playerPromise: `A complete tactical board-game feeling in ${sessionMinutes} minutes, tuned for touch screens.`,
      firstPrototypeTemplate: mechanic.template,
      artDirection: themeInfo.artDirection,
    },
    telemetryPlan: [
      'concept_card_viewed',
      'prototype_started',
      'tutorial_completed',
      'first_loss',
      'level_completed',
      'replay_clicked',
      'rewarded_ad_offered',
    ],
    monetization: {
      firstRevenueTest: 'rewarded hint after failed daily challenge',
      avoidUntilRetention: ['subscriptions', 'interstitial ads during first session'],
      fitScore: monetizationFit,
    },
  }
}

const trend = JSON.parse(await readFile(trendPath, 'utf8'))
const mechanics = trend.signals.mechanics.slice(0, 4)
const themes = trend.signals.themes.slice(0, 4)
const audiences = trend.signals.audiences.slice(0, 3)

const concepts = mechanics.map((mechanic, index) =>
  buildConcept({
    trend,
    mechanic,
    theme: themes[index % themes.length] ?? themes[0],
    audience: audiences[index % audiences.length],
    index,
  }),
)

const accepted = concepts.filter((concept) => concept.status === 'candidate')

const payload = {
  generatedAt: new Date().toISOString(),
  inputTrendGeneratedAt: trend.generatedAt,
  guardrails: [
    'No source title reuse',
    'No copied rule text',
    'No copied art direction',
    'Mechanic/theme signals are transformed into original expression',
  ],
  concepts,
}

const report = [
  '# Generated Game Concepts',
  '',
  `Generated: ${payload.generatedAt}`,
  '',
  '## Accepted Candidates',
  '',
  ...accepted.flatMap((concept, index) => [
    `### ${index + 1}. ${concept.title}`,
    '',
    `- Mechanic: ${concept.opportunity.mechanic}`,
    `- Theme: ${concept.opportunity.theme}`,
    `- Audience: ${concept.opportunity.audience}`,
    `- Template: ${concept.gameBrief.firstPrototypeTemplate}`,
    `- Core loop: ${concept.gameBrief.coreLoop}`,
    `- IP risk: ${concept.sourceDistance.copiedExpressionRisk}`,
    `- Monetization test: ${concept.monetization.firstRevenueTest}`,
    '',
  ]),
  accepted.length === 0 ? 'No concepts passed guardrails.' : '',
].join('\n')

await mkdir(path.dirname(outputPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputPath, JSON.stringify(payload, null, 2))
await writeFile(reportPath, report)

console.log(`Wrote ${path.relative(root, outputPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
