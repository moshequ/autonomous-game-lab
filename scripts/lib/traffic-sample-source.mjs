const withoutProductGateChannel = (channels = []) => channels.filter((channel) => channel !== 'product-gate-sample')

export const stableTrafficSeedingForSamplePlan = (trafficSeeding = {}) => ({
  status: trafficSeeding.status ?? null,
  sourceDataHash: trafficSeeding.sourceDataHash ?? null,
  analyticsSource: trafficSeeding.analyticsSource ?? null,
  siteUrl: trafficSeeding.siteUrl ?? null,
  publicUrlMode: trafficSeeding.publicUrlMode ?? null,
  guardrails: {
    maxCostUsd: trafficSeeding.guardrails?.maxCostUsd ?? null,
    noPaidPromotion: trafficSeeding.guardrails?.noPaidPromotion ?? null,
    noExternalPostingWithoutCredentials: trafficSeeding.guardrails?.noExternalPostingWithoutCredentials ?? null,
    noAutomatedExternalPosting: trafficSeeding.guardrails?.noAutomatedExternalPosting ?? null,
    playerInitiatedSharingOnly: trafficSeeding.guardrails?.playerInitiatedSharingOnly ?? null,
    minimumStartsBeforeQualityJudgment: trafficSeeding.guardrails?.minimumStartsBeforeQualityJudgment ?? null,
  },
  channels: (trafficSeeding.channels ?? [])
    .filter((channel) => channel.id !== 'product-gate-sample')
    .map((channel) => ({
      id: channel.id,
      status: channel.status,
      costUsd: channel.costUsd,
      surface: channel.surface,
      telemetry: channel.telemetry ?? [],
    })),
  campaigns: (trafficSeeding.campaigns ?? []).map((campaign) => ({
    id: campaign.id,
    gameId: campaign.gameId,
    title: campaign.title,
    playPath: campaign.playPath,
    sharePath: campaign.sharePath,
    pagePath: campaign.pagePath,
    costUsd: campaign.costUsd,
    action: campaign.action,
    dataConfidence: campaign.dataConfidence,
    measurement: campaign.measurement ?? null,
    channels: withoutProductGateChannel(campaign.channels ?? []),
  })),
  sitemapPriority: (trafficSeeding.sitemapPriority ?? []).map((entry) => ({
    gameId: entry.gameId,
    title: entry.title,
    priority: entry.priority,
    reason: entry.reason,
  })),
})
