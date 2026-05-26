export const trafficSeeding = {
  "generatedAt": "2026-05-26T06:20:35.747Z",
  "status": "traffic-seeding-ready",
  "sourceDataHash": "d4fe68f793e4",
  "analyticsSource": "fixture-sample",
  "publicUrlMode": "absolute-origin",
  "siteUrl": "https://moshequ.github.io/autonomous-game-lab",
  "portfolioGeneratedAt": "2026-05-26T05:43:27.486Z",
  "guardrails": {
    "maxCostUsd": 0,
    "noPaidPromotion": true,
    "noExternalPostingWithoutCredentials": true,
    "noAutomatedExternalPosting": true,
    "playerInitiatedSharingOnly": true,
    "productGateSampleSharingOnly": true,
    "publicAggregateEvidenceIsSupportingOnly": true,
    "aggregateEvidenceDoesNotPassAcquisitionGates": true,
    "minimumStartsBeforeQualityJudgment": 40
  },
  "channels": [
    {
      "id": "internal-rotation",
      "status": "armed",
      "costUsd": 0,
      "surface": "portal-growth-loop",
      "telemetry": [
        "seed_campaign_clicked",
        "game_viewed",
        "game_started"
      ]
    },
    {
      "id": "organic-page",
      "status": "armed",
      "costUsd": 0,
      "surface": "public-game-page",
      "telemetry": [
        "organic_entry_opened",
        "game_started"
      ]
    },
    {
      "id": "player-share",
      "status": "armed",
      "costUsd": 0,
      "surface": "share-manifest",
      "telemetry": [
        "share_clicked",
        "organic_entry_opened",
        "game_started"
      ]
    },
    {
      "id": "evergreen-seed-route",
      "status": "armed",
      "costUsd": 0,
      "surface": "seed-next-page",
      "telemetry": [
        "seed_next_viewed",
        "seed_next_routed",
        "organic_entry_opened",
        "game_started"
      ]
    },
    {
      "id": "product-gate-sample",
      "status": "armed",
      "costUsd": 0,
      "surface": "gate-sample-page-and-sample-next-route",
      "telemetry": [
        "sample_next_viewed",
        "sample_next_routed",
        "gate_sample_mission_clicked",
        "share_clicked",
        "analytics_exported"
      ]
    }
  ],
  "campaigns": [
    {
      "id": "seed-20260526-market-pulse",
      "gameId": "market-pulse",
      "title": "Market Pulse",
      "status": "armed",
      "priority": 1,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=market-pulse&utm_source=seed_internal&utm_campaign=seed-20260526-market-pulse",
      "sharePath": "/?game=market-pulse&utm_source=seed_share&utm_campaign=seed-20260526-market-pulse",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=market-pulse&utm_source=seed_internal&utm_campaign=seed-20260526-market-pulse",
      "pagePath": "/games/market-pulse.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/market-pulse.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=market-pulse&utm_source=seed_share&utm_campaign=seed-20260526-market-pulse",
      "copy": {
        "title": "Play Market Pulse",
        "text": "A generated auction puzzle with quick science desk decisions.",
        "cta": "Try today's challenge"
      },
      "measurement": {
        "source": "fixture-sample",
        "currentViews": 0,
        "currentStarts": 0,
        "targetStartsBeforeJudgment": 40,
        "successEvents": [
          "organic_entry_opened",
          "seed_campaign_clicked",
          "game_started",
          "turn_taken"
        ]
      },
      "channels": [
        "internal-rotation",
        "organic-page",
        "player-share",
        "evergreen-seed-route",
        "product-gate-sample"
      ]
    },
    {
      "id": "seed-20260526-guild-garden",
      "gameId": "guild-garden",
      "title": "Guild Garden",
      "status": "armed",
      "priority": 2,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=guild-garden&utm_source=seed_internal&utm_campaign=seed-20260526-guild-garden",
      "sharePath": "/?game=guild-garden&utm_source=seed_share&utm_campaign=seed-20260526-guild-garden",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=guild-garden&utm_source=seed_internal&utm_campaign=seed-20260526-guild-garden",
      "pagePath": "/games/guild-garden.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/guild-garden.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=guild-garden&utm_source=seed_share&utm_campaign=seed-20260526-guild-garden",
      "copy": {
        "title": "Play Guild Garden",
        "text": "A generated worker placement puzzle with quick expedition planning decisions.",
        "cta": "Try today's challenge"
      },
      "measurement": {
        "source": "fixture-sample",
        "currentViews": 0,
        "currentStarts": 0,
        "targetStartsBeforeJudgment": 40,
        "successEvents": [
          "organic_entry_opened",
          "seed_campaign_clicked",
          "game_started",
          "turn_taken"
        ]
      },
      "channels": [
        "internal-rotation",
        "organic-page",
        "player-share",
        "evergreen-seed-route",
        "product-gate-sample"
      ]
    },
    {
      "id": "seed-20260526-canopy-bloom",
      "gameId": "canopy-bloom",
      "title": "Canopy Bloom",
      "status": "armed",
      "priority": 3,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=canopy-bloom&utm_source=seed_internal&utm_campaign=seed-20260526-canopy-bloom",
      "sharePath": "/?game=canopy-bloom&utm_source=seed_share&utm_campaign=seed-20260526-canopy-bloom",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=canopy-bloom&utm_source=seed_internal&utm_campaign=seed-20260526-canopy-bloom",
      "pagePath": "/games/canopy-bloom.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=canopy-bloom&utm_source=seed_share&utm_campaign=seed-20260526-canopy-bloom",
      "copy": {
        "title": "Play Canopy Bloom",
        "text": "A generated roll and write puzzle with quick compact city logistics decisions.",
        "cta": "Play free puzzle"
      },
      "measurement": {
        "source": "fixture-sample",
        "currentViews": 0,
        "currentStarts": 0,
        "targetStartsBeforeJudgment": 40,
        "successEvents": [
          "organic_entry_opened",
          "seed_campaign_clicked",
          "game_started",
          "turn_taken"
        ]
      },
      "channels": [
        "internal-rotation",
        "organic-page",
        "player-share",
        "evergreen-seed-route",
        "product-gate-sample"
      ]
    },
    {
      "id": "seed-20260526-metro-loom",
      "gameId": "metro-loom",
      "title": "Metro Loom",
      "status": "armed",
      "priority": 4,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=metro-loom&utm_source=seed_internal&utm_campaign=seed-20260526-metro-loom",
      "sharePath": "/?game=metro-loom&utm_source=seed_share&utm_campaign=seed-20260526-metro-loom",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=metro-loom&utm_source=seed_internal&utm_campaign=seed-20260526-metro-loom",
      "pagePath": "/games/metro-loom.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/metro-loom.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=metro-loom&utm_source=seed_share&utm_campaign=seed-20260526-metro-loom",
      "copy": {
        "title": "Play Metro Loom",
        "text": "A generated route building puzzle with quick cozy production decisions.",
        "cta": "Try today's challenge"
      },
      "measurement": {
        "source": "fixture-sample",
        "currentViews": 0,
        "currentStarts": 0,
        "targetStartsBeforeJudgment": 40,
        "successEvents": [
          "organic_entry_opened",
          "seed_campaign_clicked",
          "game_started",
          "turn_taken"
        ]
      },
      "channels": [
        "internal-rotation",
        "organic-page",
        "player-share",
        "evergreen-seed-route",
        "product-gate-sample"
      ]
    }
  ],
  "evergreenRoute": {
    "status": "armed",
    "path": "/seed-next.html",
    "jsonPath": "/seed-next.json",
    "targetCampaignId": "seed-20260526-market-pulse",
    "targetGameId": "market-pulse",
    "targetTitle": "Market Pulse",
    "targetPath": "/?game=market-pulse&utm_source=seed_share&utm_campaign=seed-20260526-market-pulse",
    "targetUrl": "https://moshequ.github.io/autonomous-game-lab/?game=market-pulse&utm_source=seed_share&utm_campaign=seed-20260526-market-pulse",
    "fallbackPath": "/seed-kit.html",
    "costUsd": 0,
    "playerInitiatedOnly": true,
    "noAutomatedExternalPosting": true,
    "noPaidPromotion": true,
    "localAnalyticsEvents": true,
    "localAnalyticsStorageKey": "agl.analytics.events",
    "telemetry": [
      "seed_next_viewed",
      "seed_next_routed",
      "organic_entry_opened",
      "game_started"
    ]
  },
  "sampleNextRoute": {
    "status": "armed",
    "path": "/sample-next.html",
    "jsonPath": "/sample-next.json",
    "targetCampaignId": "gate-sample-20260526-firstGameCompletion",
    "targetGateId": "firstGameCompletion",
    "targetGameId": "harbor-rings",
    "targetTitle": "Sample First game completion",
    "targetPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260526-firstGameCompletion",
    "targetUrl": "https://moshequ.github.io/autonomous-game-lab/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260526-firstGameCompletion",
    "fallbackPath": "/gate-sample.html",
    "costUsd": 0,
    "playerInitiatedOnly": true,
    "noAutomatedExternalPosting": true,
    "noPaidPromotion": true,
    "noSyntheticEvents": true,
    "noRevenueEnablement": true,
    "localAnalyticsEvents": true,
    "localAnalyticsStorageKey": "agl.analytics.events",
    "telemetry": [
      "sample_next_viewed",
      "sample_next_routed",
      "gate_sample_mission_clicked",
      "game_started"
    ]
  },
  "sampleFastestRoute": {
    "status": "armed",
    "path": "/sample-fastest.html",
    "jsonPath": "/sample-fastest.json",
    "targetCampaignId": "gate-sample-20260526-d1Retention",
    "targetGateId": "d1Retention",
    "targetGameId": "market-pulse",
    "targetTitle": "Sample D1 retention",
    "targetPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260526-d1Retention",
    "targetUrl": "https://moshequ.github.io/autonomous-game-lab/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260526-d1Retention",
    "fallbackPath": "/gate-sample.html",
    "costUsd": 0,
    "playerInitiatedOnly": true,
    "noAutomatedExternalPosting": true,
    "noPaidPromotion": true,
    "noSyntheticEvents": true,
    "noRevenueEnablement": true,
    "localAnalyticsEvents": true,
    "localAnalyticsStorageKey": "agl.analytics.events",
    "returnHandoff": {
      "status": "armed",
      "gateId": "d1Retention",
      "gameId": "market-pulse",
      "campaignId": "gate-sample-20260526-d1Retention",
      "challengeDate": "2026-05-26",
      "intentDate": "2026-05-27",
      "queryParam": "return_intent",
      "returnPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260526-d1Retention&return_intent=2026-05-27",
      "copyCta": "Copy return link",
      "calendarCta": "Save reminder",
      "calendarFileExtension": ".ics",
      "surface": "sample-fastest-return-handoff",
      "telemetry": {
        "copied": "daily_return_link_copied",
        "calendarDownloaded": "daily_return_calendar_downloaded"
      },
      "controls": {
        "zeroPaidSpend": true,
        "playerInitiatedOnly": true,
        "noNotificationPermissionRequest": true,
        "noPushNotifications": true,
        "noAccountRequired": true,
        "noExternalUpload": true,
        "noRevenueEnablement": true,
        "noSyntheticEvents": true
      }
    },
    "telemetry": [
      "sample_fastest_viewed",
      "sample_fastest_routed",
      "gate_sample_mission_clicked",
      "game_started",
      "daily_return_link_copied",
      "daily_return_calendar_downloaded"
    ]
  },
  "sampleDistribution": {
    "status": "gate-sample-sharing-ready",
    "kitPath": "/gate-sample.html",
    "sampleNextPath": "/sample-next.html",
    "sampleNextJsonPath": "/sample-next.json",
    "sampleFastestPath": "/sample-fastest.html",
    "sampleFastestJsonPath": "/sample-fastest.json",
    "defaultCampaignId": "gate-sample-20260526-firstGameCompletion",
    "defaultGateId": "firstGameCompletion",
    "fastestCampaignId": "gate-sample-20260526-d1Retention",
    "fastestGateId": "d1Retention",
    "missionCount": 3,
    "costUsd": 0,
    "playerInitiatedSharingOnly": true,
    "noAutomatedExternalPosting": true,
    "noSyntheticEvents": true,
    "exportControls": true,
    "shareControls": true,
    "fastestReturnHandoffEnabled": true
  },
  "sitemapPriority": [
    {
      "gameId": "market-pulse",
      "pagePath": "/games/market-pulse.html",
      "priority": 0.95
    },
    {
      "gameId": "guild-garden",
      "pagePath": "/games/guild-garden.html",
      "priority": 0.9
    },
    {
      "gameId": "canopy-bloom",
      "pagePath": "/games/canopy-bloom.html",
      "priority": 0.85
    },
    {
      "gameId": "metro-loom",
      "pagePath": "/games/metro-loom.html",
      "priority": 0.8
    }
  ],
  "nextActions": [
    "Feature Market Pulse in the internal growth loop and share manifest.",
    "Feature Sample First game completion as the default product-gate sample share link.",
    "Expose Sample D1 retention through /sample-fastest.html for the quickest separate gate validation.",
    "Publish a player-initiated D1 return handoff on /sample-fastest.html for 2026-05-27.",
    "Keep traffic sources organic/internal until paid acquisition gates pass.",
    "Judge seeded games only after each reaches the target start sample."
  ]
} as const

export type TrafficSeeding = typeof trafficSeeding
