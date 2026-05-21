export const trafficSeeding = {
  "generatedAt": "2026-05-21T15:57:14.170Z",
  "status": "traffic-seeding-ready",
  "sourceDataHash": "6e501f9bd6d9",
  "analyticsSource": "fixture-sample",
  "publicUrlMode": "absolute-origin",
  "siteUrl": "https://moshequ.github.io/autonomous-game-lab",
  "portfolioGeneratedAt": "2026-05-21T15:57:13.899Z",
  "guardrails": {
    "maxCostUsd": 0,
    "noPaidPromotion": true,
    "noExternalPostingWithoutCredentials": true,
    "noAutomatedExternalPosting": true,
    "playerInitiatedSharingOnly": true,
    "productGateSampleSharingOnly": true,
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
      "id": "product-gate-sample",
      "status": "armed",
      "costUsd": 0,
      "surface": "gate-sample-page",
      "telemetry": [
        "gate_sample_mission_clicked",
        "share_clicked",
        "analytics_exported"
      ]
    }
  ],
  "campaigns": [
    {
      "id": "seed-20260521-canopy-bloom",
      "gameId": "canopy-bloom",
      "title": "Canopy Bloom",
      "status": "armed",
      "priority": 1,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=canopy-bloom&utm_source=seed_internal&utm_campaign=seed-20260521-canopy-bloom",
      "sharePath": "/?game=canopy-bloom&utm_source=seed_share&utm_campaign=seed-20260521-canopy-bloom",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=canopy-bloom&utm_source=seed_internal&utm_campaign=seed-20260521-canopy-bloom",
      "pagePath": "/games/canopy-bloom.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=canopy-bloom&utm_source=seed_share&utm_campaign=seed-20260521-canopy-bloom",
      "copy": {
        "title": "Play Canopy Bloom",
        "text": "A generated roll and write puzzle with quick science desk decisions.",
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
        "product-gate-sample"
      ]
    },
    {
      "id": "seed-20260521-grove-engine",
      "gameId": "grove-engine",
      "title": "Grove Engine",
      "status": "armed",
      "priority": 2,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=grove-engine&utm_source=seed_internal&utm_campaign=seed-20260521-grove-engine",
      "sharePath": "/?game=grove-engine&utm_source=seed_share&utm_campaign=seed-20260521-grove-engine",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=grove-engine&utm_source=seed_internal&utm_campaign=seed-20260521-grove-engine",
      "pagePath": "/games/grove-engine.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/grove-engine.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=grove-engine&utm_source=seed_share&utm_campaign=seed-20260521-grove-engine",
      "copy": {
        "title": "Play Grove Engine",
        "text": "A generated engine building puzzle with quick expedition planning decisions.",
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
        "product-gate-sample"
      ]
    },
    {
      "id": "seed-20260521-metro-loom",
      "gameId": "metro-loom",
      "title": "Metro Loom",
      "status": "armed",
      "priority": 3,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=metro-loom&utm_source=seed_internal&utm_campaign=seed-20260521-metro-loom",
      "sharePath": "/?game=metro-loom&utm_source=seed_share&utm_campaign=seed-20260521-metro-loom",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=metro-loom&utm_source=seed_internal&utm_campaign=seed-20260521-metro-loom",
      "pagePath": "/games/metro-loom.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/metro-loom.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=metro-loom&utm_source=seed_share&utm_campaign=seed-20260521-metro-loom",
      "copy": {
        "title": "Play Metro Loom",
        "text": "A generated route building puzzle with quick merchant timing decisions.",
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
        "product-gate-sample"
      ]
    },
    {
      "id": "seed-20260521-pocket-draft",
      "gameId": "pocket-draft",
      "title": "Pocket Draft",
      "status": "armed",
      "priority": 4,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=pocket-draft&utm_source=seed_internal&utm_campaign=seed-20260521-pocket-draft",
      "sharePath": "/?game=pocket-draft&utm_source=seed_share&utm_campaign=seed-20260521-pocket-draft",
      "playUrl": "https://moshequ.github.io/autonomous-game-lab/?game=pocket-draft&utm_source=seed_internal&utm_campaign=seed-20260521-pocket-draft",
      "pagePath": "/games/pocket-draft.html",
      "pageUrl": "https://moshequ.github.io/autonomous-game-lab/games/pocket-draft.html",
      "shareUrl": "https://moshequ.github.io/autonomous-game-lab/?game=pocket-draft&utm_source=seed_share&utm_campaign=seed-20260521-pocket-draft",
      "copy": {
        "title": "Play Pocket Draft",
        "text": "A generated card drafting puzzle with quick compact city logistics decisions.",
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
        "product-gate-sample"
      ]
    }
  ],
  "sampleDistribution": {
    "status": "gate-sample-sharing-ready",
    "kitPath": "/gate-sample.html",
    "defaultCampaignId": "gate-sample-20260521-d1Retention",
    "defaultGateId": "d1Retention",
    "missionCount": 3,
    "costUsd": 0,
    "playerInitiatedSharingOnly": true,
    "noAutomatedExternalPosting": true,
    "noSyntheticEvents": true,
    "exportControls": true,
    "shareControls": true
  },
  "sitemapPriority": [
    {
      "gameId": "canopy-bloom",
      "pagePath": "/games/canopy-bloom.html",
      "priority": 0.95
    },
    {
      "gameId": "grove-engine",
      "pagePath": "/games/grove-engine.html",
      "priority": 0.9
    },
    {
      "gameId": "metro-loom",
      "pagePath": "/games/metro-loom.html",
      "priority": 0.85
    },
    {
      "gameId": "pocket-draft",
      "pagePath": "/games/pocket-draft.html",
      "priority": 0.8
    }
  ],
  "nextActions": [
    "Feature Canopy Bloom in the internal growth loop and share manifest.",
    "Feature Sample D1 retention as the default product-gate sample share link.",
    "Keep traffic sources organic/internal until paid acquisition gates pass.",
    "Judge seeded games only after each reaches the target start sample."
  ]
} as const

export type TrafficSeeding = typeof trafficSeeding
