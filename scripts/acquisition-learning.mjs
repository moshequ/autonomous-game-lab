import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const localEventsDir = path.resolve(root, process.env.AGL_LOCAL_EVENTS_DIR ?? 'data/player-events')
const outputJsonPath = path.join(dataDir, 'acquisition-learning.json')
const outputTsPath = path.join(root, 'src', 'data', 'acquisitionLearning.ts')
const reportPath = path.join(root, 'reports', 'acquisition-learning-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const readLocalEvents = async () => {
  let files = []

  try {
    files = (await readdir(localEventsDir)).filter((file) => file.endsWith('.json'))
  } catch {
    return { files: [], events: [] }
  }

  const batches = await Promise.all(
    files.map(async (file) => {
      const payload = await readJson(path.join(localEventsDir, file))
      return Array.isArray(payload) ? payload : payload.events ?? []
    }),
  )

  return { files, events: batches.flat() }
}

const pct = (value) => Math.round(value * 1000) / 1000

const safeDivide = (numerator, denominator) => (denominator ? pct(numerator / denominator) : 0)

const eventName = (event) => event.name ?? event.event

const eventProps = (event) => event.properties ?? {}

const eventGameId = (event) => eventProps(event).gameId ?? event.gameId ?? null

const matchesCampaign = (event, campaign) => {
  const properties = eventProps(event)
  return (
    properties.campaignId === campaign.id ||
    properties.campaign === campaign.id ||
    properties.acquisitionCampaign === campaign.id ||
    properties.utm_campaign === campaign.id
  )
}

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const traffic = await readJson(path.join(dataDir, 'traffic-seeding.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const supportFeedback = await readOptionalJson(path.join(dataDir, 'support-feedback.json'), {
  status: 'missing',
  sourceDataHash: null,
  summary: { aggregateEvidenceNotes: 0 },
  aggregateEvidenceNotes: [],
  controls: {},
})
const { files: localEventFiles, events } = await readLocalEvents()
const sourceDataHash = hashSourceData({
  analytics,
  traffic,
  growth,
  unitEconomics,
  playable,
  localEventFiles,
  events,
  supportFeedback: {
    status: supportFeedback.status,
    sourceDataHash: supportFeedback.sourceDataHash,
    aggregateEvidenceNotes: (supportFeedback.aggregateEvidenceNotes ?? []).map((note) => ({
      number: note.number,
      status: note.status,
      gameId: note.gameId,
      campaignId: note.campaignId,
      counts: note.counts,
      evidenceWindow: note.evidenceWindow,
    })),
  },
})

const playableIds = new Set(playable.games ?? [])
const analyticsById = new Map((analytics.games ?? []).map((game) => [game.gameId, game]))
const growthById = new Map((growth.gamePages ?? []).map((game) => [game.gameId, game]))
const targetStarts = traffic.guardrails?.minimumStartsBeforeQualityJudgment ?? 40
const rawAttributionAvailable = events.some((event) => {
  const properties = eventProps(event)
  return properties.acquisitionCampaign || properties.campaignId || properties.campaign || properties.acquisitionSource
})
const aggregateEvidenceNotesByCampaign = new Map()
const aggregateEvidenceNotesByGame = new Map()

for (const note of supportFeedback.aggregateEvidenceNotes ?? []) {
  if (note.campaignId) {
    const campaignNotes = aggregateEvidenceNotesByCampaign.get(note.campaignId) ?? []
    campaignNotes.push(note)
    aggregateEvidenceNotesByCampaign.set(note.campaignId, campaignNotes)
  }

  if (note.gameId) {
    const gameNotes = aggregateEvidenceNotesByGame.get(note.gameId) ?? []
    gameNotes.push(note)
    aggregateEvidenceNotesByGame.set(note.gameId, gameNotes)
  }
}

const supportingAggregateEvidenceForCampaign = (campaign) => {
  const campaignNotes = aggregateEvidenceNotesByCampaign.get(campaign.id) ?? []
  const gameNotes = aggregateEvidenceNotesByGame.get(campaign.gameId) ?? []
  const notes = [
    ...new Map(
      [...campaignNotes, ...gameNotes].map((note) => [note.number ?? `${note.url ?? ''}:${note.campaignId ?? ''}`, note]),
    ).values(),
  ].slice(0, 5)
  const total = (field) =>
    notes.reduce((sum, note) => sum + (typeof note.counts?.[field] === 'number' ? note.counts[field] : 0), 0)

  return {
    status: notes.length ? 'supporting-public-aggregate-notes' : 'none',
    source: 'support-feedback-public-issues',
    matchScope: campaignNotes.length ? 'campaign' : gameNotes.length ? 'game' : 'none',
    noteCount: notes.length,
    campaignNoteCount: campaignNotes.length,
    gameNoteCount: gameNotes.length,
    starts: total('starts'),
    completions: total('completions'),
    replays: total('replays'),
    d1Eligible: total('d1Eligible'),
    d1Retained: total('d1Retained'),
    acquisitionDecisionEligible: false,
    manualReviewRequired: true,
    topIssues: notes.map((note) => ({
      number: note.number,
      status: note.status,
      url: note.url,
      campaignId: note.campaignId ?? null,
      gateId: note.gateId ?? null,
      evidenceWindow: note.evidenceWindow,
    })),
  }
}

const campaignRows = (traffic.campaigns ?? [])
  .filter((campaign) => playableIds.has(campaign.gameId))
  .map((campaign) => {
    const campaignEvents = events.filter((event) => matchesCampaign(event, campaign))
    const attributedStarts = campaignEvents.filter(
      (event) => eventName(event) === 'game_started' && eventGameId(event) === campaign.gameId,
    ).length
    const attributedCompletions = campaignEvents.filter(
      (event) => eventName(event) === 'level_completed' && eventGameId(event) === campaign.gameId,
    ).length
    const seedClicks = campaignEvents.filter((event) => eventName(event) === 'seed_campaign_clicked').length
    const gateSampleClicks = campaignEvents.filter((event) => eventName(event) === 'gate_sample_mission_clicked').length
    const organicEntries = campaignEvents.filter((event) => eventName(event) === 'organic_entry_opened').length
    const gameAnalytics = analyticsById.get(campaign.gameId)
    const growthPage = growthById.get(campaign.gameId)
    const supportingAggregateEvidence = supportingAggregateEvidenceForCampaign(campaign)
    const aggregateStarts = gameAnalytics?.counts?.game_started ?? 0
    const aggregateViews = gameAnalytics?.counts?.game_viewed ?? 0
    const observedStarts = rawAttributionAvailable ? attributedStarts : aggregateStarts
    const sampleProgress = Math.min(1, safeDivide(observedStarts, targetStarts))
    const startRate = rawAttributionAvailable
      ? safeDivide(attributedStarts, Math.max(seedClicks + gateSampleClicks + organicEntries, 1))
      : null
    const completionRate = rawAttributionAvailable ? safeDivide(attributedCompletions, Math.max(attributedStarts, 1)) : null
    const status =
      campaign.costUsd !== 0 || campaign.noPaidPromotion !== true
        ? 'blocked-spend-risk'
        : !rawAttributionAvailable
          ? 'collecting-attribution'
          : attributedStarts < targetStarts
            ? 'collecting-sample'
            : startRate >= 0.35 && completionRate >= 0.25
              ? 'candidate-feature'
              : 'needs-copy-test'
    const nextAction =
      status === 'candidate-feature'
        ? `Feature ${campaign.title} more prominently in the growth loop.`
        : status === 'needs-copy-test'
          ? `Test a clearer CTA for ${campaign.title} before sending more traffic.`
          : status === 'collecting-sample'
            ? `Keep ${campaign.title} live until it reaches ${targetStarts} attributed starts.`
            : status === 'collecting-attribution'
              ? `Collect campaign-attributed events for ${campaign.title}; aggregate starts are ${aggregateStarts}.`
              : `Hold ${campaign.title} because its traffic campaign violates spend guardrails.`

    return {
      id: campaign.id,
      gameId: campaign.gameId,
      title: campaign.title,
      status,
      priority: campaign.priority,
      costUsd: campaign.costUsd,
      noPaidPromotion: campaign.noPaidPromotion,
      attribution: {
        source: rawAttributionAvailable ? 'campaign-events' : analytics.sourceStatus?.activeSource,
        localEventFiles: localEventFiles.length,
        seedClicks,
        gateSampleClicks,
        organicEntries,
        attributedStarts,
        attributedCompletions,
        aggregateViews,
        aggregateStarts,
      },
      metrics: {
        targetStarts,
        observedStarts,
        sampleProgress,
        startRate,
        completionRate,
        growthQualityScore: growthPage?.metrics?.qualityScore ?? null,
      },
      supportingAggregateEvidence,
      nextAction,
    }
  })

const channelRows = (traffic.channels ?? []).map((channel) => {
  const channelEvents = events.filter((event) => eventProps(event).acquisitionChannel === channel.id)
  const starts = channelEvents.filter((event) => eventName(event) === 'game_started').length
  const completions = channelEvents.filter((event) => eventName(event) === 'level_completed').length
  const clicks = channelEvents.filter((event) =>
    ['seed_campaign_clicked', 'sample_next_routed', 'gate_sample_mission_clicked', 'organic_entry_opened', 'share_clicked'].includes(
      eventName(event),
    ),
  ).length

  return {
    id: channel.id,
    status: channel.status,
    costUsd: channel.costUsd,
    attributedEvents: channelEvents.length,
    clicks,
    starts,
    completions,
    startRate: safeDivide(starts, Math.max(clicks, 1)),
  }
})

const featuredCandidate =
  campaignRows.find((campaign) => campaign.status === 'candidate-feature') ??
  campaignRows.find((campaign) => campaign.status === 'collecting-sample') ??
  campaignRows[0] ??
  null
const collectingCount = campaignRows.filter((campaign) =>
  ['collecting-attribution', 'collecting-sample'].includes(campaign.status),
).length
const blockedCount = campaignRows.filter((campaign) => campaign.status === 'blocked-spend-risk').length

const payload = {
  generatedAt: new Date().toISOString(),
  status: campaignRows.length ? 'acquisition-learning-ready' : 'blocked-no-campaigns',
  sourceDataHash,
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    localEventFiles: localEventFiles.length,
    localEvents: events.length,
    rawAttributionAvailable,
    supportFeedback: supportFeedback.status,
  },
  guardrails: {
    maxCostUsd: 0,
    noPaidPromotion: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    requireCampaignAttribution: true,
    minimumAttributedStartsBeforeJudgment: targetStarts,
    publicAggregateEvidenceIsSupportingOnly: true,
    aggregateEvidenceNeverMarksAcquisitionDecision: true,
  },
  summary: {
    campaigns: campaignRows.length,
    collectingCount,
    blockedCount,
    featuredCandidateId: featuredCandidate?.id ?? null,
    featuredGameId: featuredCandidate?.gameId ?? null,
    totalAttributedStarts: campaignRows.reduce((sum, campaign) => sum + campaign.attribution.attributedStarts, 0),
    totalAggregateStarts: campaignRows.reduce((sum, campaign) => sum + campaign.attribution.aggregateStarts, 0),
    supportingAggregateEvidenceNotes: campaignRows.reduce(
      (sum, campaign) => sum + campaign.supportingAggregateEvidence.noteCount,
      0,
    ),
    supportingAggregateStarts: campaignRows.reduce(
      (sum, campaign) => sum + campaign.supportingAggregateEvidence.starts,
      0,
    ),
  },
  channels: channelRows,
  campaigns: campaignRows,
  nextActions: [
    featuredCandidate
      ? featuredCandidate.nextAction
      : 'Wait for traffic seeding to publish campaigns before acquisition learning.',
    rawAttributionAvailable
      ? 'Use attributed starts and completions before changing growth placement.'
      : 'Keep session acquisition attribution enabled so future gameplay events connect back to UTM campaigns.',
    'Keep every acquisition action inside the zero-spend web/PWA loop until unit-economics gates pass.',
  ],
}

const report = [
  '# Acquisition Learning',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Raw attribution available: ${payload.sourceStatus.rawAttributionAvailable ? 'yes' : 'no'}`,
  '',
  '## Summary',
  '',
  `- Campaigns: ${payload.summary.campaigns}`,
  `- Collecting: ${payload.summary.collectingCount}`,
  `- Featured candidate: ${payload.summary.featuredGameId ?? 'none'}`,
  `- Attributed starts: ${payload.summary.totalAttributedStarts}`,
  `- Aggregate starts: ${payload.summary.totalAggregateStarts}`,
  `- Supporting public aggregate notes: ${payload.summary.supportingAggregateEvidenceNotes}`,
  `- Supporting public aggregate starts: ${payload.summary.supportingAggregateStarts}`,
  '',
  '## Campaigns',
  '',
  ...payload.campaigns.map(
    (campaign) =>
      `- ${campaign.status}: ${campaign.title}; attributed ${campaign.attribution.attributedStarts}/${campaign.metrics.targetStarts}; aggregate ${campaign.attribution.aggregateStarts}; public notes ${campaign.supportingAggregateEvidence.noteCount}; ${campaign.nextAction}`,
  ),
  '',
  '## Channels',
  '',
  ...payload.channels.map(
    (channel) => `- ${channel.id}: ${channel.attributedEvents} event(s), ${channel.starts} start(s), $${channel.costUsd}`,
  ),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const acquisitionLearning = ${JSON.stringify(payload, null, 2)} as const\n\nexport type AcquisitionLearning = typeof acquisitionLearning\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
