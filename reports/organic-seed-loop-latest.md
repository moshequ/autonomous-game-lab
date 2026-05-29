# Organic Seed Loop

Generated: 2026-05-29T09:04:00.749Z
Status: organic-seed-loop-ready
Analytics source: fixture-sample
Target: market-pulse
Max cost: $0.00

## Campaigns

- #1 Market Pulse: collecting-attribution, sample 0%, score 1
- #2 Guild Garden: collecting-attribution, sample 0%, score 0.875
- #3 Canopy Bloom: collecting-attribution, sample 0%, score 0.833
- #4 Metro Loom: collecting-attribution, sample 0%, score 0.813

## Guardrails

- maxCostUsd: 0
- noPaidPromotion: true
- playerInitiatedSharingOnly: true
- noAutomatedExternalPosting: true
- noSpamAutomation: true
- noPaidIncentives: true
- noAccountsRequired: true
- requireCampaignAttribution: true
- minimumStartsBeforeQualityJudgment: 40
- shareCooldownHours: 12

## Runtime Progress

- Source: browser-local-analytics
- Storage: agl.analytics.events
- Export surface: organic-seed-campaign
- Target starts: 40

## Next Actions

- Feature Market Pulse as the current organic seed target.
- Use only player-initiated sharing; do not post externally without credentials or consent.
- Keep collecting attributed starts until the sample-size gate clears.
