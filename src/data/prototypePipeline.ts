export const prototypePipeline = [
  {
    "id": "lantern-relay",
    "title": "Lantern Relay",
    "rank": 1,
    "status": "playable",
    "releaseScore": 631,
    "concept": {
      "id": "lantern-relay",
      "title": "Lantern Relay",
      "status": "candidate",
      "sourceDistance": {
        "titleRisk": 8,
        "copiedExpressionRisk": "low",
        "ruleText": "generated from template only; no source rule text used",
        "art": "new visual direction; no source art used"
      },
      "opportunity": {
        "mechanic": "card drafting",
        "theme": "cozy production",
        "audience": "families",
        "score": 513
      },
      "gameBrief": {
        "setting": "tiny seasonal workshops",
        "coreLoop": "chain comforting orders by making one strong card drafting decision per turn.",
        "sessionLengthMinutes": 7,
        "playerPromise": "A complete tactical board-game feeling in 7 minutes, tuned for touch screens.",
        "firstPrototypeTemplate": "tableau",
        "artDirection": "warm workbench pieces and readable resource icons"
      },
      "telemetryPlan": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered"
      ],
      "monetization": {
        "firstRevenueTest": "rewarded hint after failed daily challenge",
        "avoidUntilRetention": [
          "subscriptions",
          "interstitial ads during first session"
        ],
        "fitScore": 83
      }
    },
    "prototype": {
      "template": "tableau",
      "engine": "React state + Phaser result animation",
      "estimatedImplementationDays": 3,
      "reusableSystems": [
        "draft row",
        "card effects",
        "score preview",
        "bot heuristic"
      ],
      "originalRules": [
        "Present a three-card market each turn.",
        "Player drafts one card into a compact tableau.",
        "Cards trigger chain scoring by icon adjacency.",
        "Bot simulation tests runaway combos before release."
      ],
      "successCriteria": [
        "first move understood without reading more than two sentences",
        "bot simulation produces no impossible score curve",
        "mobile smoke test passes",
        "events prove tutorial, completion, replay, and reward funnel"
      ]
    },
    "monetization": {
      "status": "instrument-first",
      "firstTest": "rewarded hint after failed daily challenge",
      "allowedBeforeRetention": [
        "rewarded hint",
        "cosmetic unlock",
        "remove ads"
      ],
      "blockedBeforeRetention": [
        "subscription",
        "interstitial during first session",
        "paywalled core rules"
      ],
      "metricsRequired": {
        "firstGameCompletion": 0.55,
        "replayRate": 0.35,
        "d1Retention": 0.18
      },
      "telemetry": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered",
        "rewarded_ad_available",
        "rewarded_ad_started",
        "rewarded_ad_completed",
        "remove_ads_clicked"
      ]
    },
    "distribution": {
      "webPwa": {
        "status": "ready-after-build",
        "blockers": [
          "Run smoke tests on mobile viewport",
          "Add privacy page before external analytics"
        ],
        "required": [
          "manifest",
          "offline-capable build",
          "privacy page before external analytics",
          "touch-first layout",
          "analytics opt-out before production launch"
        ]
      },
      "googlePlay": {
        "status": "blocked",
        "estimatedCostUsd": 25,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured"
        ],
        "required": [
          "developer account",
          "signed Android package",
          "store listing",
          "content rating",
          "privacy policy URL",
          "data safety form",
          "ad disclosure when ads are enabled"
        ]
      },
      "iosAppStore": {
        "status": "defer",
        "estimatedCostUsd": 99,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured",
          "Needs native-feeling mobile polish before iOS review"
        ],
        "required": [
          "Apple Developer account",
          "native app-like value beyond a thin web wrapper",
          "store listing",
          "age rating",
          "privacy nutrition labels",
          "in-app purchase setup for digital purchases"
        ]
      }
    },
    "storeListing": {
      "appName": "Lantern Relay",
      "subtitle": "cozy production card drafting",
      "shortDescription": "7-minute original card drafting game for daily mobile play.",
      "fullDescription": "Lantern Relay is an original mobile-first board-game-inspired puzzle set in tiny seasonal workshops. A complete tactical board-game feeling in 7 minutes, tuned for touch screens. Core loop: chain comforting orders by making one strong card drafting decision per turn. The first release focuses on solo daily play, clear scoring, replayable seeds, and measured improvements from player behavior.",
      "keywords": [
        "card drafting",
        "cozy production",
        "families",
        "daily puzzle",
        "solo board game",
        "strategy puzzle"
      ],
      "contentRatingNotes": [
        "No gambling",
        "No real-money prizes",
        "No user-generated content in first release",
        "Ads disabled until retention gates pass"
      ],
      "privacyDataDraft": {
        "analytics": "anonymous gameplay events until external analytics is configured",
        "accounts": "not required for first release",
        "purchases": "none before monetization gates pass",
        "ads": "planned only after retention and policy checks pass"
      },
      "screenshotPlan": [
        "first move tutorial",
        "mid-game board state",
        "result screen",
        "daily challenge panel"
      ]
    },
    "autonomyActions": [
      "Generate tableau prototype config",
      "Run rule simulator and screenshot smoke test",
      "Ship web/PWA experiment only",
      "Promote to Android only after retention gates pass"
    ]
  },
  {
    "id": "harbor-circuit",
    "title": "Harbor Circuit",
    "rank": 2,
    "status": "playable",
    "releaseScore": 521,
    "concept": {
      "id": "harbor-circuit",
      "title": "Harbor Circuit",
      "status": "candidate",
      "sourceDistance": {
        "titleRisk": 0,
        "copiedExpressionRisk": "low",
        "ruleText": "generated from template only; no source rule text used",
        "art": "new visual direction; no source art used"
      },
      "opportunity": {
        "mechanic": "route building",
        "theme": "science desk",
        "audience": "strategy solo",
        "score": 375
      },
      "gameBrief": {
        "setting": "a tabletop research station",
        "coreLoop": "align instruments into reliable discoveries by making one strong route building decision per turn.",
        "sessionLengthMinutes": 9,
        "playerPromise": "A complete tactical board-game feeling in 9 minutes, tuned for touch screens.",
        "firstPrototypeTemplate": "line-drawing",
        "artDirection": "clean diagrams, labeled tools, and crisp result cards"
      },
      "telemetryPlan": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered"
      ],
      "monetization": {
        "firstRevenueTest": "rewarded hint after failed daily challenge",
        "avoidUntilRetention": [
          "subscriptions",
          "interstitial ads during first session"
        ],
        "fitScore": 85
      }
    },
    "prototype": {
      "template": "line-drawing",
      "engine": "Phaser path template",
      "estimatedImplementationDays": 3,
      "reusableSystems": [
        "node map",
        "drag path input",
        "route validation",
        "daily seed"
      ],
      "originalRules": [
        "Generate a small node graph from the daily seed.",
        "Player draws routes under a limited turn budget.",
        "Completed contracts score; congestion penalties add tension.",
        "Invalid crossings are blocked before scoring."
      ],
      "successCriteria": [
        "first move understood without reading more than two sentences",
        "bot simulation produces no impossible score curve",
        "mobile smoke test passes",
        "events prove tutorial, completion, replay, and reward funnel"
      ]
    },
    "monetization": {
      "status": "instrument-first",
      "firstTest": "rewarded hint after failed daily challenge",
      "allowedBeforeRetention": [
        "rewarded hint",
        "cosmetic unlock",
        "remove ads"
      ],
      "blockedBeforeRetention": [
        "subscription",
        "interstitial during first session",
        "paywalled core rules"
      ],
      "metricsRequired": {
        "firstGameCompletion": 0.55,
        "replayRate": 0.35,
        "d1Retention": 0.18
      },
      "telemetry": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered",
        "rewarded_ad_available",
        "rewarded_ad_started",
        "rewarded_ad_completed",
        "remove_ads_clicked"
      ]
    },
    "distribution": {
      "webPwa": {
        "status": "ready-after-build",
        "blockers": [
          "Run smoke tests on mobile viewport",
          "Add privacy page before external analytics"
        ],
        "required": [
          "manifest",
          "offline-capable build",
          "privacy page before external analytics",
          "touch-first layout",
          "analytics opt-out before production launch"
        ]
      },
      "googlePlay": {
        "status": "blocked",
        "estimatedCostUsd": 25,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured"
        ],
        "required": [
          "developer account",
          "signed Android package",
          "store listing",
          "content rating",
          "privacy policy URL",
          "data safety form",
          "ad disclosure when ads are enabled"
        ]
      },
      "iosAppStore": {
        "status": "defer",
        "estimatedCostUsd": 99,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured",
          "Needs native-feeling mobile polish before iOS review"
        ],
        "required": [
          "Apple Developer account",
          "native app-like value beyond a thin web wrapper",
          "store listing",
          "age rating",
          "privacy nutrition labels",
          "in-app purchase setup for digital purchases"
        ]
      }
    },
    "storeListing": {
      "appName": "Harbor Circuit",
      "subtitle": "science desk route building",
      "shortDescription": "9-minute original route building game for daily mobile play.",
      "fullDescription": "Harbor Circuit is an original mobile-first board-game-inspired puzzle set in a tabletop research station. A complete tactical board-game feeling in 9 minutes, tuned for touch screens. Core loop: align instruments into reliable discoveries by making one strong route building decision per turn. The first release focuses on solo daily play, clear scoring, replayable seeds, and measured improvements from player behavior.",
      "keywords": [
        "route building",
        "science desk",
        "strategy solo",
        "daily puzzle",
        "solo board game",
        "strategy puzzle"
      ],
      "contentRatingNotes": [
        "No gambling",
        "No real-money prizes",
        "No user-generated content in first release",
        "Ads disabled until retention gates pass"
      ],
      "privacyDataDraft": {
        "analytics": "anonymous gameplay events until external analytics is configured",
        "accounts": "not required for first release",
        "purchases": "none before monetization gates pass",
        "ads": "planned only after retention and policy checks pass"
      },
      "screenshotPlan": [
        "first move tutorial",
        "mid-game board state",
        "result screen",
        "daily challenge panel"
      ]
    },
    "autonomyActions": [
      "Generate line-drawing prototype config",
      "Run rule simulator and screenshot smoke test",
      "Ship web/PWA experiment only",
      "Promote to Android only after retention gates pass"
    ]
  },
  {
    "id": "orbit-atlas",
    "title": "Orbit Atlas",
    "rank": 3,
    "status": "playable",
    "releaseScore": 483,
    "concept": {
      "id": "orbit-atlas",
      "title": "Orbit Atlas",
      "status": "candidate",
      "sourceDistance": {
        "titleRisk": 0,
        "copiedExpressionRisk": "low",
        "ruleText": "generated from template only; no source rule text used",
        "art": "new visual direction; no source art used"
      },
      "opportunity": {
        "mechanic": "tile placement",
        "theme": "compact city logistics",
        "audience": "mobile puzzle",
        "score": 331
      },
      "gameBrief": {
        "setting": "pocket-size transit districts",
        "coreLoop": "connect demand before congestion rises by making one strong tile placement decision per turn.",
        "sessionLengthMinutes": 5,
        "playerPromise": "A complete tactical board-game feeling in 5 minutes, tuned for touch screens.",
        "firstPrototypeTemplate": "grid-puzzle",
        "artDirection": "bright route lines, station stamps, and compact maps"
      },
      "telemetryPlan": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered"
      ],
      "monetization": {
        "firstRevenueTest": "rewarded hint after failed daily challenge",
        "avoidUntilRetention": [
          "subscriptions",
          "interstitial ads during first session"
        ],
        "fitScore": 84
      }
    },
    "prototype": {
      "template": "grid-puzzle",
      "engine": "Phaser grid template",
      "estimatedImplementationDays": 2,
      "reusableSystems": [
        "grid board",
        "seeded daily puzzle",
        "score contract",
        "bot simulator"
      ],
      "originalRules": [
        "Generate a 5x5 board with three resource colors.",
        "Player places one tile per turn from a seeded queue.",
        "Adjacent groups and closed 2x2 patterns score.",
        "Daily contract creates a clear win target."
      ],
      "successCriteria": [
        "first move understood without reading more than two sentences",
        "bot simulation produces no impossible score curve",
        "mobile smoke test passes",
        "events prove tutorial, completion, replay, and reward funnel"
      ]
    },
    "monetization": {
      "status": "instrument-first",
      "firstTest": "rewarded hint after failed daily challenge",
      "allowedBeforeRetention": [
        "rewarded hint",
        "cosmetic unlock",
        "remove ads"
      ],
      "blockedBeforeRetention": [
        "subscription",
        "interstitial during first session",
        "paywalled core rules"
      ],
      "metricsRequired": {
        "firstGameCompletion": 0.55,
        "replayRate": 0.35,
        "d1Retention": 0.18
      },
      "telemetry": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered",
        "rewarded_ad_available",
        "rewarded_ad_started",
        "rewarded_ad_completed",
        "remove_ads_clicked"
      ]
    },
    "distribution": {
      "webPwa": {
        "status": "ready-after-build",
        "blockers": [
          "Run smoke tests on mobile viewport",
          "Add privacy page before external analytics"
        ],
        "required": [
          "manifest",
          "offline-capable build",
          "privacy page before external analytics",
          "touch-first layout",
          "analytics opt-out before production launch"
        ]
      },
      "googlePlay": {
        "status": "blocked",
        "estimatedCostUsd": 25,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured"
        ],
        "required": [
          "developer account",
          "signed Android package",
          "store listing",
          "content rating",
          "privacy policy URL",
          "data safety form",
          "ad disclosure when ads are enabled"
        ]
      },
      "iosAppStore": {
        "status": "defer",
        "estimatedCostUsd": 99,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured"
        ],
        "required": [
          "Apple Developer account",
          "native app-like value beyond a thin web wrapper",
          "store listing",
          "age rating",
          "privacy nutrition labels",
          "in-app purchase setup for digital purchases"
        ]
      }
    },
    "storeListing": {
      "appName": "Orbit Atlas",
      "subtitle": "compact city logistics tile placement",
      "shortDescription": "5-minute original tile placement game for daily mobile play.",
      "fullDescription": "Orbit Atlas is an original mobile-first board-game-inspired puzzle set in pocket-size transit districts. A complete tactical board-game feeling in 5 minutes, tuned for touch screens. Core loop: connect demand before congestion rises by making one strong tile placement decision per turn. The first release focuses on solo daily play, clear scoring, replayable seeds, and measured improvements from player behavior.",
      "keywords": [
        "tile placement",
        "compact city logistics",
        "mobile puzzle",
        "daily puzzle",
        "solo board game",
        "strategy puzzle"
      ],
      "contentRatingNotes": [
        "No gambling",
        "No real-money prizes",
        "No user-generated content in first release",
        "Ads disabled until retention gates pass"
      ],
      "privacyDataDraft": {
        "analytics": "anonymous gameplay events until external analytics is configured",
        "accounts": "not required for first release",
        "purchases": "none before monetization gates pass",
        "ads": "planned only after retention and policy checks pass"
      },
      "screenshotPlan": [
        "first move tutorial",
        "mid-game board state",
        "result screen",
        "daily challenge panel"
      ]
    },
    "autonomyActions": [
      "Generate grid-puzzle prototype config",
      "Run rule simulator and screenshot smoke test",
      "Ship web/PWA experiment only",
      "Promote to Android only after retention gates pass"
    ]
  },
  {
    "id": "foundry-ledger",
    "title": "Foundry Ledger",
    "rank": 4,
    "status": "playable",
    "releaseScore": 290,
    "concept": {
      "id": "foundry-ledger",
      "title": "Foundry Ledger",
      "status": "candidate",
      "sourceDistance": {
        "titleRisk": 0,
        "copiedExpressionRisk": "low",
        "ruleText": "generated from template only; no source rule text used",
        "art": "new visual direction; no source art used"
      },
      "opportunity": {
        "mechanic": "engine building",
        "theme": "expedition planning",
        "audience": "families",
        "score": 156
      },
      "gameBrief": {
        "setting": "modular camp routes around unknown landmarks",
        "coreLoop": "commit scouts without overextending supplies by making one strong engine building decision per turn.",
        "sessionLengthMinutes": 7,
        "playerPromise": "A complete tactical board-game feeling in 7 minutes, tuned for touch screens.",
        "firstPrototypeTemplate": "tableau",
        "artDirection": "paper maps, stamped hazards, and high-contrast terrain"
      },
      "telemetryPlan": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered"
      ],
      "monetization": {
        "firstRevenueTest": "rewarded hint after failed daily challenge",
        "avoidUntilRetention": [
          "subscriptions",
          "interstitial ads during first session"
        ],
        "fitScore": 79
      }
    },
    "prototype": {
      "template": "tableau",
      "engine": "React state + Phaser result animation",
      "estimatedImplementationDays": 3,
      "reusableSystems": [
        "draft row",
        "card effects",
        "score preview",
        "bot heuristic"
      ],
      "originalRules": [
        "Present a three-card market each turn.",
        "Player drafts one card into a compact tableau.",
        "Cards trigger chain scoring by icon adjacency.",
        "Bot simulation tests runaway combos before release."
      ],
      "successCriteria": [
        "first move understood without reading more than two sentences",
        "bot simulation produces no impossible score curve",
        "mobile smoke test passes",
        "events prove tutorial, completion, replay, and reward funnel"
      ]
    },
    "monetization": {
      "status": "instrument-first",
      "firstTest": "rewarded hint after failed daily challenge",
      "allowedBeforeRetention": [
        "rewarded hint",
        "cosmetic unlock",
        "remove ads"
      ],
      "blockedBeforeRetention": [
        "subscription",
        "interstitial during first session",
        "paywalled core rules"
      ],
      "metricsRequired": {
        "firstGameCompletion": 0.55,
        "replayRate": 0.35,
        "d1Retention": 0.18
      },
      "telemetry": [
        "concept_card_viewed",
        "prototype_started",
        "tutorial_completed",
        "first_loss",
        "level_completed",
        "replay_clicked",
        "rewarded_ad_offered",
        "rewarded_ad_available",
        "rewarded_ad_started",
        "rewarded_ad_completed",
        "remove_ads_clicked"
      ]
    },
    "distribution": {
      "webPwa": {
        "status": "ready-after-build",
        "blockers": [
          "Run smoke tests on mobile viewport",
          "Add privacy page before external analytics"
        ],
        "required": [
          "manifest",
          "offline-capable build",
          "privacy page before external analytics",
          "touch-first layout",
          "analytics opt-out before production launch"
        ]
      },
      "googlePlay": {
        "status": "blocked",
        "estimatedCostUsd": 25,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured"
        ],
        "required": [
          "developer account",
          "signed Android package",
          "store listing",
          "content rating",
          "privacy policy URL",
          "data safety form",
          "ad disclosure when ads are enabled"
        ]
      },
      "iosAppStore": {
        "status": "defer",
        "estimatedCostUsd": 99,
        "blockers": [
          "No production retention data yet",
          "No privacy policy URL yet",
          "No signed Android package yet",
          "No app-store account credentials configured",
          "Needs native-feeling mobile polish before iOS review"
        ],
        "required": [
          "Apple Developer account",
          "native app-like value beyond a thin web wrapper",
          "store listing",
          "age rating",
          "privacy nutrition labels",
          "in-app purchase setup for digital purchases"
        ]
      }
    },
    "storeListing": {
      "appName": "Foundry Ledger",
      "subtitle": "expedition planning engine building",
      "shortDescription": "7-minute original engine building game for daily mobile play.",
      "fullDescription": "Foundry Ledger is an original mobile-first board-game-inspired puzzle set in modular camp routes around unknown landmarks. A complete tactical board-game feeling in 7 minutes, tuned for touch screens. Core loop: commit scouts without overextending supplies by making one strong engine building decision per turn. The first release focuses on solo daily play, clear scoring, replayable seeds, and measured improvements from player behavior.",
      "keywords": [
        "engine building",
        "expedition planning",
        "families",
        "daily puzzle",
        "solo board game",
        "strategy puzzle"
      ],
      "contentRatingNotes": [
        "No gambling",
        "No real-money prizes",
        "No user-generated content in first release",
        "Ads disabled until retention gates pass"
      ],
      "privacyDataDraft": {
        "analytics": "anonymous gameplay events until external analytics is configured",
        "accounts": "not required for first release",
        "purchases": "none before monetization gates pass",
        "ads": "planned only after retention and policy checks pass"
      },
      "screenshotPlan": [
        "first move tutorial",
        "mid-game board state",
        "result screen",
        "daily challenge panel"
      ]
    },
    "autonomyActions": [
      "Generate tableau prototype config",
      "Run rule simulator and screenshot smoke test",
      "Ship web/PWA experiment only",
      "Promote to Android only after retention gates pass"
    ]
  }
] as const

export type PrototypePipelineItem = (typeof prototypePipeline)[number]
