import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const conceptsPath = path.join(root, 'data', 'generated-concepts.json')
const gatesPath = path.join(root, 'data', 'production-gates.json')
const playablePath = path.join(root, 'data', 'playable-games.json')
const outputJsonPath = path.join(root, 'data', 'prototype-pipeline.json')
const outputTsPath = path.join(root, 'src', 'data', 'prototypePipeline.ts')
const reportPath = path.join(root, 'reports', 'prototype-pipeline-latest.md')

const loadJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const loadOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const templatePlans = {
  'grid-puzzle': {
    engine: 'Phaser grid template',
    implementationDays: 2,
    reusableSystems: ['grid board', 'seeded daily puzzle', 'score contract', 'bot simulator'],
    prototypeRules: [
      'Generate a 5x5 board with three resource colors.',
      'Player places one tile per turn from a seeded queue.',
      'Adjacent groups and closed 2x2 patterns score.',
      'Daily contract creates a clear win target.',
    ],
  },
  tableau: {
    engine: 'React state + Phaser result animation',
    implementationDays: 3,
    reusableSystems: ['draft row', 'card effects', 'score preview', 'bot heuristic'],
    prototypeRules: [
      'Present a three-card market each turn.',
      'Player drafts one card into a compact tableau.',
      'Cards trigger chain scoring by icon adjacency.',
      'Bot simulation tests runaway combos before release.',
    ],
  },
  'line-drawing': {
    engine: 'Phaser path template',
    implementationDays: 3,
    reusableSystems: ['node map', 'drag path input', 'route validation', 'daily seed'],
    prototypeRules: [
      'Generate a small node graph from the daily seed.',
      'Player draws routes under a limited turn budget.',
      'Completed contracts score; congestion penalties add tension.',
      'Invalid crossings are blocked before scoring.',
    ],
  },
  'turn-economy': {
    engine: 'React economy loop',
    implementationDays: 4,
    reusableSystems: ['price track', 'turn phases', 'offer cards', 'bot policy'],
    prototypeRules: [
      'Create a visible offer market.',
      'Player chooses one action per turn.',
      'Prices change after each action.',
      'Contract timing determines score.',
    ],
  },
  'daily-sheet': {
    engine: 'Canvas daily sheet',
    implementationDays: 2,
    reusableSystems: ['sheet renderer', 'dice queue', 'combo validator', 'shareable result'],
    prototypeRules: [
      'Generate a fixed daily symbol queue.',
      'Player marks one cell per turn.',
      'Combos trigger bonus marks.',
      'End result creates a compact share card.',
    ],
  },
}

const appStoreReadiness = ({ concept, gates }) => {
  const baseBlockers = [
    'No production retention data yet',
    'No privacy policy URL yet',
    'No signed Android package yet',
    'No app-store account credentials configured',
  ]

  const needsNativePolish =
    concept.gameBrief.firstPrototypeTemplate === 'tableau' ||
    concept.gameBrief.sessionLengthMinutes > 7

  return {
    webPwa: {
      status: 'ready-after-build',
      blockers: ['Run smoke tests on mobile viewport', 'Add privacy page before external analytics'],
      required: gates.webPwa.required,
    },
    googlePlay: {
      status: 'blocked',
      estimatedCostUsd: gates.googlePlay.oneTimeCostUsd,
      blockers: baseBlockers,
      required: gates.googlePlay.required,
    },
    iosAppStore: {
      status: 'defer',
      estimatedCostUsd: gates.iosAppStore.annualCostUsd,
      blockers: needsNativePolish
        ? [...baseBlockers, 'Needs native-feeling mobile polish before iOS review']
        : baseBlockers,
      required: gates.iosAppStore.required,
    },
  }
}

const monetizationPlan = ({ concept, gates }) => ({
  status: 'instrument-first',
  firstTest: concept.monetization.firstRevenueTest,
  allowedBeforeRetention: gates.monetization.allowedEarlyTests,
  blockedBeforeRetention: gates.monetization.blockedBeforeRetention,
  metricsRequired: {
    firstGameCompletion: gates.monetization.minFirstGameCompletion,
    replayRate: gates.monetization.minReplayRate,
    d1Retention: gates.monetization.minD1Retention,
  },
  telemetry: [
    ...concept.telemetryPlan,
    'rewarded_ad_available',
    'rewarded_ad_started',
    'rewarded_ad_completed',
    'remove_ads_clicked',
  ],
})

const storeListingMetadata = (concept) => ({
  appName: concept.title,
  subtitle: `${concept.opportunity.theme} ${concept.opportunity.mechanic}`,
  shortDescription: `${concept.gameBrief.sessionLengthMinutes}-minute original ${concept.opportunity.mechanic} game for daily mobile play.`,
  fullDescription: [
    `${concept.title} is an original mobile-first board-game-inspired puzzle set in ${concept.gameBrief.setting}.`,
    concept.gameBrief.playerPromise,
    `Core loop: ${concept.gameBrief.coreLoop}`,
    'The first release focuses on solo daily play, clear scoring, replayable seeds, and measured improvements from player behavior.',
  ].join(' '),
  keywords: [
    concept.opportunity.mechanic,
    concept.opportunity.theme,
    concept.opportunity.audience,
    'daily puzzle',
    'solo board game',
    'strategy puzzle',
  ],
  contentRatingNotes: [
    'No gambling',
    'No real-money prizes',
    'No user-generated content in first release',
    'Ads disabled until retention gates pass',
  ],
  privacyDataDraft: {
    analytics: 'anonymous gameplay events until external analytics is configured',
    accounts: 'not required for first release',
    purchases: 'none before monetization gates pass',
    ads: 'planned only after retention and policy checks pass',
  },
  screenshotPlan: [
    'first move tutorial',
    'mid-game board state',
    'result screen',
    'daily challenge panel',
  ],
})

const planPrototype = ({ concept, gates, index, status }) => {
  const template = templatePlans[concept.gameBrief.firstPrototypeTemplate] ?? templatePlans['grid-puzzle']
  const releaseScore =
    concept.opportunity.score +
    concept.monetization.fitScore * 2 -
    concept.sourceDistance.titleRisk * 3 -
    template.implementationDays * 8

  return {
    id: concept.id,
    title: concept.title,
    rank: index + 1,
    status,
    releaseScore,
    concept,
    prototype: {
      template: concept.gameBrief.firstPrototypeTemplate,
      engine: template.engine,
      estimatedImplementationDays: template.implementationDays,
      reusableSystems: template.reusableSystems,
      originalRules: template.prototypeRules,
      successCriteria: [
        'first move understood without reading more than two sentences',
        'bot simulation produces no impossible score curve',
        'mobile smoke test passes',
        'events prove tutorial, completion, replay, and reward funnel',
      ],
    },
    monetization: monetizationPlan({ concept, gates }),
    distribution: appStoreReadiness({ concept, gates }),
    storeListing: storeListingMetadata(concept),
    autonomyActions: [
      `Generate ${concept.gameBrief.firstPrototypeTemplate} prototype config`,
      'Run rule simulator and screenshot smoke test',
      'Ship web/PWA experiment only',
      'Promote to Android only after retention gates pass',
    ],
  }
}

const conceptsPayload = await loadJson(conceptsPath)
const gates = await loadJson(gatesPath)
const playable = await loadOptionalJson(playablePath, { games: [] })
const playableIds = new Set(playable.games)

const concepts = conceptsPayload.concepts
  .filter((concept) => concept.status === 'candidate')
  .sort((a, b) => b.opportunity.score - a.opportunity.score)

let nextBuildAssigned = false
const prototypes = concepts.map((concept, index) => {
  let status = 'queued'

  if (playableIds.has(concept.id)) {
    status = 'playable'
  } else if (!nextBuildAssigned) {
    status = 'next-build'
    nextBuildAssigned = true
  }

  return planPrototype({ concept, gates, index, status })
})
const nextBuild = prototypes.find((prototype) => prototype.status === 'next-build')

const payload = {
  generatedAt: new Date().toISOString(),
  inputConceptGeneratedAt: conceptsPayload.generatedAt,
  gates,
  prototypes,
}

const tsOutput = `export const prototypePipeline = ${JSON.stringify(prototypes, null, 2)} as const\n\nexport type PrototypePipelineItem = (typeof prototypePipeline)[number]\n`

const report = [
  '# Prototype Pipeline',
  '',
  `Generated: ${payload.generatedAt}`,
  '',
  '## Next Build',
  '',
  nextBuild
    ? `${nextBuild.title} using ${nextBuild.prototype.template}; release score ${nextBuild.releaseScore}.`
    : 'All current generated candidates are playable.',
  '',
  '## Queue',
  '',
  ...prototypes.map(
    (item) =>
      `- ${item.rank}. ${item.title} (${item.status}) - ${item.prototype.template}, ${item.prototype.estimatedImplementationDays} days, monetization ${item.monetization.status}, Google Play ${item.distribution.googlePlay.status}`,
  ),
  '',
  '## Store Gates',
  '',
  `- Google Play account cost gate: $${gates.googlePlay.oneTimeCostUsd} one-time.`,
  `- iOS App Store account cost gate: $${gates.iosAppStore.annualCostUsd}/year.`,
  '- Store submission remains blocked until credentials, privacy policy, retention data, and package signing exist.',
  '',
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
