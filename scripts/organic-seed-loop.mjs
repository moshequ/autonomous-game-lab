import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'organic-seed-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'organicSeedLoop.ts')
const reportPath = path.join(root, 'reports', 'organic-seed-loop-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const roundMetric = (value) => (typeof value === 'number' ? Math.round(value * 1000) / 1000 : null)
const safeDivide = (numerator, denominator) =>
  denominator ? roundMetric(numerator / denominator) : 0

const playable = await readJson(path.join(dataDir, 'playable-games.json'))
const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const traffic = await readJson(path.join(dataDir, 'traffic-seeding.json'))
const acquisition = await readJson(path.join(dataDir, 'acquisition-learning.json'))
const retention = await readJson(path.join(dataDir, 'retention-loop.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))

const playableIds = new Set(playable.games ?? [])
const acquisitionById = new Map((acquisition.campaigns ?? []).map((campaign) => [campaign.id, campaign]))
const targetStarts = traffic.guardrails?.minimumStartsBeforeQualityJudgment ?? 40

const campaigns = (traffic.campaigns ?? [])
  .filter((campaign) => playableIds.has(campaign.gameId))
  .map((campaign) => {
    const acquisitionRow = acquisitionById.get(campaign.id)
    const observedStarts =
      acquisitionRow?.metrics?.observedStarts ??
      acquisitionRow?.attribution?.aggregateStarts ??
      campaign.measurement?.currentStarts ??
      0
    const attributedStarts = acquisitionRow?.attribution?.attributedStarts ?? 0
    const seedClicks = acquisitionRow?.attribution?.seedClicks ?? 0
    const organicEntries = acquisitionRow?.attribution?.organicEntries ?? 0
    const sampleProgress = Math.min(1, acquisitionRow?.metrics?.sampleProgress ?? safeDivide(observedStarts, targetStarts))
    const priorityWeight = 1 / Math.max(campaign.priority ?? 1, 1)
    const opportunityScore = roundMetric((1 - sampleProgress) * 0.65 + priorityWeight * 0.25 + 0.1)
    const shareReadiness =
      campaign.shareUrl && campaign.noPaidPromotion === true && campaign.costUsd === 0 ? 'ready' : 'blocked'

    return {
      id: campaign.id,
      gameId: campaign.gameId,
      title: campaign.title,
      priority: campaign.priority,
      status: acquisitionRow?.status ?? campaign.status,
      action: campaign.action,
      dataConfidence: campaign.dataConfidence,
      costUsd: campaign.costUsd,
      playUrl: campaign.playUrl,
      shareUrl: campaign.shareUrl,
      pageUrl: campaign.pageUrl,
      copy: campaign.copy,
      shareReadiness,
      attribution: {
        seedClicks,
        organicEntries,
        attributedStarts,
        observedStarts,
      },
      metrics: {
        targetStarts,
        sampleProgress,
        startRate: acquisitionRow?.metrics?.startRate ?? null,
        completionRate: acquisitionRow?.metrics?.completionRate ?? null,
        opportunityScore,
      },
      nextAction:
        acquisitionRow?.status === 'candidate-feature'
          ? `Keep ${campaign.title} in the organic seed card and feature it more prominently.`
          : `Collect player-initiated starts and shares for ${campaign.title} before quality judgment.`,
    }
  })
  .sort((left, right) => right.metrics.opportunityScore - left.metrics.opportunityScore || left.priority - right.priority)

const targetCampaign = campaigns[0] ?? null

const payload = {
  generatedAt: new Date().toISOString(),
  status: targetCampaign ? 'organic-seed-loop-ready' : 'blocked-no-campaigns',
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    trafficSeeding: traffic.status,
    acquisitionLearning: acquisition.status,
    rawAttributionAvailable: acquisition.sourceStatus?.rawAttributionAvailable === true,
  },
  target: targetCampaign
    ? {
        campaignId: targetCampaign.id,
        gameId: targetCampaign.gameId,
        title: targetCampaign.title,
        priority: targetCampaign.priority,
        opportunityScore: targetCampaign.metrics.opportunityScore,
        sampleProgress: targetCampaign.metrics.sampleProgress,
      }
    : null,
  runtimeSurface: {
    id: 'organic-seed-card',
    status: targetCampaign ? 'armed' : 'monitor',
    surface: 'portal-growth-loop',
    placement: 'growth-loop-panel',
    primaryCtaLabel: targetCampaign?.copy?.cta ?? 'Play seed game',
    secondaryCtaLabel: 'Share seed link',
    telemetry: {
      viewed: 'organic_seed_card_viewed',
      opened: 'seed_campaign_clicked',
      shared: 'organic_seed_share_clicked',
      share: 'share_clicked',
      started: 'game_started',
    },
  },
  runtimeProgressPolicy: {
    status: targetCampaign ? 'active' : 'monitor',
    source: 'browser-local-analytics',
    storageKey: 'agl.analytics.events',
    campaignMatchProperties: ['acquisitionCampaign', 'campaignId', 'campaign', 'utm_campaign'],
    progressEvents: [
      'organic_seed_card_viewed',
      'seed_campaign_clicked',
      'organic_seed_share_clicked',
      'share_clicked',
      'organic_entry_opened',
      'game_started',
      'level_completed',
      'analytics_exported',
    ],
    decisionThresholds: {
      minimumAttributedStartsBeforeJudgment: targetStarts,
      evidenceExportRequiresUnexportedEvents: true,
    },
    exportSurface: 'organic-seed-campaign',
    exportProperties: [
      'localCampaignEvents',
      'localCardViews',
      'localSeedClicks',
      'localOrganicEntries',
      'localShareActions',
      'localStarts',
      'localCompletions',
      'localAnalyticsExports',
      'localStartsRemaining',
      'localEvidenceDropReady',
      'localSampleDecisionReady',
      'localProgressStatus',
    ],
  },
  guardrails: {
    maxCostUsd: 0,
    noPaidPromotion: unitEconomics.controls?.paidAcquisitionAllowed !== true,
    playerInitiatedSharingOnly: true,
    noAutomatedExternalPosting: true,
    noSpamAutomation: true,
    noPaidIncentives: true,
    noAccountsRequired: retention.guardrails?.noAccountsRequired === true,
    requireCampaignAttribution: true,
    minimumStartsBeforeQualityJudgment: targetStarts,
    shareCooldownHours: 12,
  },
  campaigns,
  missions: [
    {
      id: 'open-seed-game',
      status: targetCampaign ? 'armed' : 'monitor',
      event: 'seed_campaign_clicked',
      targetGameId: targetCampaign?.gameId ?? null,
      reward: 'sample-growth',
    },
    {
      id: 'share-seed-link',
      status: targetCampaign ? 'armed' : 'monitor',
      event: 'organic_seed_share_clicked',
      targetGameId: targetCampaign?.gameId ?? null,
      reward: 'organic-signal',
    },
    {
      id: 'measure-seeded-start',
      status: targetCampaign ? 'armed' : 'monitor',
      event: 'game_started',
      targetGameId: targetCampaign?.gameId ?? null,
      reward: 'quality-evidence',
    },
  ],
  nextActions: [
    targetCampaign
      ? `Feature ${targetCampaign.title} as the current organic seed target.`
      : 'Wait for traffic seeding to publish a zero-cost campaign.',
    'Use only player-initiated sharing; do not post externally without credentials or consent.',
    'Keep collecting attributed starts until the sample-size gate clears.',
  ],
}

const report = [
  '# Organic Seed Loop',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Analytics source: ${payload.sourceStatus.analyticsSource}`,
  `Target: ${payload.target?.gameId ?? 'none'}`,
  `Max cost: $${payload.guardrails.maxCostUsd.toFixed(2)}`,
  '',
  '## Campaigns',
  '',
  ...payload.campaigns.map(
    (campaign) =>
      `- #${campaign.priority} ${campaign.title}: ${campaign.status}, sample ${Math.round(
        campaign.metrics.sampleProgress * 100,
      )}%, score ${campaign.metrics.opportunityScore}`,
  ),
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.guardrails).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Runtime Progress',
  '',
  `- Source: ${payload.runtimeProgressPolicy.source}`,
  `- Storage: ${payload.runtimeProgressPolicy.storageKey}`,
  `- Export surface: ${payload.runtimeProgressPolicy.exportSurface}`,
  `- Target starts: ${payload.runtimeProgressPolicy.decisionThresholds.minimumAttributedStartsBeforeJudgment}`,
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
  `export const organicSeedLoop = ${JSON.stringify(payload, null, 2)} as const\n\nexport type OrganicSeedLoop = typeof organicSeedLoop\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
