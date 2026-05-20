export const organicSeedLoop = {
  "generatedAt": "2026-05-20T22:47:01.024Z",
  "status": "organic-seed-loop-ready",
  "sourceDataHash": "246b7951e43c",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "trafficSeeding": "traffic-seeding-ready",
    "acquisitionLearning": "acquisition-learning-ready",
    "rawAttributionAvailable": false
  },
  "target": {
    "campaignId": "seed-20260521-canopy-bloom",
    "gameId": "canopy-bloom",
    "title": "Canopy Bloom",
    "priority": 1,
    "opportunityScore": 1,
    "sampleProgress": 0
  },
  "runtimeSurface": {
    "id": "organic-seed-card",
    "status": "armed",
    "surface": "portal-growth-loop",
    "placement": "growth-loop-panel",
    "primaryCtaLabel": "Try today's challenge",
    "secondaryCtaLabel": "Share seed link",
    "telemetry": {
      "viewed": "organic_seed_card_viewed",
      "opened": "seed_campaign_clicked",
      "shared": "organic_seed_share_clicked",
      "share": "share_clicked",
      "started": "game_started"
    }
  },
  "runtimeProgressPolicy": {
    "status": "active",
    "source": "browser-local-analytics",
    "storageKey": "agl.analytics.events",
    "campaignMatchProperties": [
      "acquisitionCampaign",
      "campaignId",
      "campaign",
      "utm_campaign"
    ],
    "progressEvents": [
      "organic_seed_card_viewed",
      "seed_campaign_clicked",
      "organic_seed_share_clicked",
      "share_clicked",
      "organic_entry_opened",
      "game_started",
      "level_completed",
      "analytics_exported"
    ],
    "decisionThresholds": {
      "minimumAttributedStartsBeforeJudgment": 40,
      "evidenceExportRequiresUnexportedEvents": true
    },
    "exportSurface": "organic-seed-campaign",
    "exportProperties": [
      "localCampaignEvents",
      "localCardViews",
      "localSeedClicks",
      "localOrganicEntries",
      "localShareActions",
      "localStarts",
      "localCompletions",
      "localAnalyticsExports",
      "localStartsRemaining",
      "localEvidenceDropReady",
      "localSampleDecisionReady",
      "localProgressStatus"
    ]
  },
  "guardrails": {
    "maxCostUsd": 0,
    "noPaidPromotion": true,
    "playerInitiatedSharingOnly": true,
    "noAutomatedExternalPosting": true,
    "noSpamAutomation": true,
    "noPaidIncentives": true,
    "noAccountsRequired": true,
    "requireCampaignAttribution": true,
    "minimumStartsBeforeQualityJudgment": 40,
    "shareCooldownHours": 12
  },
  "campaigns": [
    {
      "id": "seed-20260521-canopy-bloom",
      "gameId": "canopy-bloom",
      "title": "Canopy Bloom",
      "priority": 1,
      "status": "collecting-attribution",
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=canopy-bloom&utm_source=seed_internal&utm_campaign=seed-20260521-canopy-bloom",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=canopy-bloom&utm_source=seed_share&utm_campaign=seed-20260521-canopy-bloom",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html",
      "copy": {
        "title": "Play Canopy Bloom",
        "text": "A generated roll and write puzzle with quick science desk decisions.",
        "cta": "Try today's challenge"
      },
      "shareReadiness": "ready",
      "attribution": {
        "seedClicks": 0,
        "organicEntries": 0,
        "attributedStarts": 0,
        "observedStarts": 0
      },
      "metrics": {
        "targetStarts": 40,
        "sampleProgress": 0,
        "startRate": null,
        "completionRate": null,
        "opportunityScore": 1
      },
      "nextAction": "Collect player-initiated starts and shares for Canopy Bloom before quality judgment."
    },
    {
      "id": "seed-20260521-grove-engine",
      "gameId": "grove-engine",
      "title": "Grove Engine",
      "priority": 2,
      "status": "collecting-attribution",
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=grove-engine&utm_source=seed_internal&utm_campaign=seed-20260521-grove-engine",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=grove-engine&utm_source=seed_share&utm_campaign=seed-20260521-grove-engine",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/grove-engine.html",
      "copy": {
        "title": "Play Grove Engine",
        "text": "A generated engine building puzzle with quick expedition planning decisions.",
        "cta": "Try today's challenge"
      },
      "shareReadiness": "ready",
      "attribution": {
        "seedClicks": 0,
        "organicEntries": 0,
        "attributedStarts": 0,
        "observedStarts": 0
      },
      "metrics": {
        "targetStarts": 40,
        "sampleProgress": 0,
        "startRate": null,
        "completionRate": null,
        "opportunityScore": 0.875
      },
      "nextAction": "Collect player-initiated starts and shares for Grove Engine before quality judgment."
    },
    {
      "id": "seed-20260521-metro-loom",
      "gameId": "metro-loom",
      "title": "Metro Loom",
      "priority": 3,
      "status": "collecting-attribution",
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=metro-loom&utm_source=seed_internal&utm_campaign=seed-20260521-metro-loom",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=metro-loom&utm_source=seed_share&utm_campaign=seed-20260521-metro-loom",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/metro-loom.html",
      "copy": {
        "title": "Play Metro Loom",
        "text": "A generated route building puzzle with quick merchant timing decisions.",
        "cta": "Try today's challenge"
      },
      "shareReadiness": "ready",
      "attribution": {
        "seedClicks": 0,
        "organicEntries": 0,
        "attributedStarts": 0,
        "observedStarts": 0
      },
      "metrics": {
        "targetStarts": 40,
        "sampleProgress": 0,
        "startRate": null,
        "completionRate": null,
        "opportunityScore": 0.833
      },
      "nextAction": "Collect player-initiated starts and shares for Metro Loom before quality judgment."
    },
    {
      "id": "seed-20260521-pocket-draft",
      "gameId": "pocket-draft",
      "title": "Pocket Draft",
      "priority": 4,
      "status": "collecting-attribution",
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=pocket-draft&utm_source=seed_internal&utm_campaign=seed-20260521-pocket-draft",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=pocket-draft&utm_source=seed_share&utm_campaign=seed-20260521-pocket-draft",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/pocket-draft.html",
      "copy": {
        "title": "Play Pocket Draft",
        "text": "A generated card drafting puzzle with quick compact city logistics decisions.",
        "cta": "Play free puzzle"
      },
      "shareReadiness": "ready",
      "attribution": {
        "seedClicks": 0,
        "organicEntries": 0,
        "attributedStarts": 0,
        "observedStarts": 0
      },
      "metrics": {
        "targetStarts": 40,
        "sampleProgress": 0,
        "startRate": null,
        "completionRate": null,
        "opportunityScore": 0.813
      },
      "nextAction": "Collect player-initiated starts and shares for Pocket Draft before quality judgment."
    }
  ],
  "missions": [
    {
      "id": "open-seed-game",
      "status": "armed",
      "event": "seed_campaign_clicked",
      "targetGameId": "canopy-bloom",
      "reward": "sample-growth"
    },
    {
      "id": "share-seed-link",
      "status": "armed",
      "event": "organic_seed_share_clicked",
      "targetGameId": "canopy-bloom",
      "reward": "organic-signal"
    },
    {
      "id": "measure-seeded-start",
      "status": "armed",
      "event": "game_started",
      "targetGameId": "canopy-bloom",
      "reward": "quality-evidence"
    }
  ],
  "nextActions": [
    "Feature Canopy Bloom as the current organic seed target.",
    "Use only player-initiated sharing; do not post externally without credentials or consent.",
    "Keep collecting attributed starts until the sample-size gate clears."
  ]
} as const

export type OrganicSeedLoop = typeof organicSeedLoop
