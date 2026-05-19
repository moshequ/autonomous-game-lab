export const trafficSeeding = {
  "generatedAt": "2026-05-19T05:07:41.598Z",
  "status": "traffic-seeding-ready",
  "analyticsSource": "fixture-sample",
  "portfolioGeneratedAt": "2026-05-19T05:07:41.368Z",
  "guardrails": {
    "maxCostUsd": 0,
    "noPaidPromotion": true,
    "noExternalPostingWithoutCredentials": true,
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
    }
  ],
  "campaigns": [
    {
      "id": "seed-20260519-canopy-bloom",
      "gameId": "canopy-bloom",
      "title": "Canopy Bloom",
      "status": "armed",
      "priority": 1,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=canopy-bloom&utm_source=seed_internal&utm_campaign=seed-20260519-canopy-bloom",
      "playUrl": "https://autonomous-game-lab.example.com/?game=canopy-bloom&utm_source=seed_internal&utm_campaign=seed-20260519-canopy-bloom",
      "pagePath": "/games/canopy-bloom.html",
      "pageUrl": "https://autonomous-game-lab.example.com/games/canopy-bloom.html",
      "shareUrl": "https://autonomous-game-lab.example.com/?game=canopy-bloom&utm_source=seed_share&utm_campaign=seed-20260519-canopy-bloom",
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
        "player-share"
      ]
    },
    {
      "id": "seed-20260519-grove-engine",
      "gameId": "grove-engine",
      "title": "Grove Engine",
      "status": "armed",
      "priority": 2,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=grove-engine&utm_source=seed_internal&utm_campaign=seed-20260519-grove-engine",
      "playUrl": "https://autonomous-game-lab.example.com/?game=grove-engine&utm_source=seed_internal&utm_campaign=seed-20260519-grove-engine",
      "pagePath": "/games/grove-engine.html",
      "pageUrl": "https://autonomous-game-lab.example.com/games/grove-engine.html",
      "shareUrl": "https://autonomous-game-lab.example.com/?game=grove-engine&utm_source=seed_share&utm_campaign=seed-20260519-grove-engine",
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
        "player-share"
      ]
    },
    {
      "id": "seed-20260519-metro-loom",
      "gameId": "metro-loom",
      "title": "Metro Loom",
      "status": "armed",
      "priority": 3,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=metro-loom&utm_source=seed_internal&utm_campaign=seed-20260519-metro-loom",
      "playUrl": "https://autonomous-game-lab.example.com/?game=metro-loom&utm_source=seed_internal&utm_campaign=seed-20260519-metro-loom",
      "pagePath": "/games/metro-loom.html",
      "pageUrl": "https://autonomous-game-lab.example.com/games/metro-loom.html",
      "shareUrl": "https://autonomous-game-lab.example.com/?game=metro-loom&utm_source=seed_share&utm_campaign=seed-20260519-metro-loom",
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
        "player-share"
      ]
    },
    {
      "id": "seed-20260519-pocket-draft",
      "gameId": "pocket-draft",
      "title": "Pocket Draft",
      "status": "armed",
      "priority": 4,
      "action": "seed-traffic",
      "dataConfidence": "seed-needed",
      "costUsd": 0,
      "noPaidPromotion": true,
      "reason": "Give this playable game organic/internal traffic before judging it.",
      "playPath": "/?game=pocket-draft&utm_source=seed_internal&utm_campaign=seed-20260519-pocket-draft",
      "playUrl": "https://autonomous-game-lab.example.com/?game=pocket-draft&utm_source=seed_internal&utm_campaign=seed-20260519-pocket-draft",
      "pagePath": "/games/pocket-draft.html",
      "pageUrl": "https://autonomous-game-lab.example.com/games/pocket-draft.html",
      "shareUrl": "https://autonomous-game-lab.example.com/?game=pocket-draft&utm_source=seed_share&utm_campaign=seed-20260519-pocket-draft",
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
        "player-share"
      ]
    }
  ],
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
    "Keep traffic sources organic/internal until paid acquisition gates pass.",
    "Judge seeded games only after each reaches the target start sample."
  ]
} as const

export type TrafficSeeding = typeof trafficSeeding
