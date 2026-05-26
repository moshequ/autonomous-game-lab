export const firstMoveCoach = {
  "generatedAt": "2026-05-26T07:06:48.772Z",
  "sourceDataHash": "17c8b7896b51",
  "status": "first-move-coach-ready",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "releaseHealth": "monitoring",
    "productOptimization": "product-optimization-ready",
    "fastStartWeight": 85,
    "guidedWeight": 15
  },
  "productGates": {
    "firstGameCompletion": {
      "actual": 0.397,
      "gate": 0.55,
      "pass": false
    },
    "replayRate": {
      "actual": 0.309,
      "gate": 0.35,
      "pass": false
    },
    "d1Retention": {
      "actual": 0.167,
      "gate": 0.18,
      "pass": false
    },
    "tutorialCompletion": {
      "actual": 0.653,
      "gate": 0.75,
      "pass": false
    }
  },
  "summary": {
    "enabled": true,
    "targets": 10,
    "enabledTargets": 6,
    "primaryTargetId": "harbor-rings",
    "completionGap": 0.153,
    "tutorialGap": 0.097,
    "coachSampleStatus": "collecting-sample",
    "coachDecision": "active"
  },
  "metrics": {
    "shown": 0,
    "used": 0,
    "skipped": 0,
    "resolved": 0,
    "usageRate": 0,
    "skipRate": 0
  },
  "samplePolicy": {
    "status": "collecting-sample",
    "minimumShownForDecision": 30,
    "minimumResolvedForDecision": 20,
    "current": {
      "shown": 0,
      "used": 0,
      "skipped": 0,
      "resolved": 0,
      "usageRate": 0,
      "skipRate": 0
    },
    "needed": {
      "shown": 30,
      "resolved": 20
    },
    "telemetry": {
      "shown": "first_move_coach_shown",
      "used": "first_move_coach_used",
      "skipped": "first_move_coach_skipped"
    },
    "decisionReady": false,
    "source": "fixture-sample"
  },
  "decisionPolicy": {
    "currentDecision": "active",
    "sampleReady": false,
    "productGatesStable": false,
    "softenWhen": {
      "minimumSkipRate": 0.65,
      "maximumUsageRate": 0.35
    },
    "retireWhen": {
      "sampleReady": true,
      "productGatesStable": true
    },
    "fallbackWhenSampleSmall": "collect-more-real-first-turn-coach-events"
  },
  "controls": {
    "zeroPaidSpend": true,
    "firstTurnOnly": true,
    "noAutoMove": true,
    "noForcedTutorial": true,
    "noRevenueEnablement": true,
    "respectsExperimentPolicy": true,
    "requiresReleaseHealth": true,
    "noDecisionWithoutSample": true
  },
  "telemetry": {
    "shown": "first_move_coach_shown",
    "used": "first_move_coach_used",
    "skipped": "first_move_coach_skipped",
    "properties": [
      "gameId",
      "variantId",
      "row",
      "col",
      "recommendedRow",
      "recommendedCol",
      "surface"
    ]
  },
  "targets": [
    {
      "gameId": "harbor-rings",
      "title": "Harbor Rings",
      "enabled": true,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 2,
        "col": 2,
        "label": "center"
      },
      "board": {
        "rows": 5,
        "cols": 5
      },
      "generatedRuntime": false,
      "runtimeSupported": true,
      "priorityScore": 1998,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "completion 39% and tutorial 67%",
      "copy": "Start here",
      "telemetryId": "first-move-coach-harbor-rings"
    },
    {
      "gameId": "canopy-bloom",
      "title": "Canopy Bloom",
      "enabled": true,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 1,
        "col": 2,
        "label": "middle lane"
      },
      "board": {
        "rows": 4,
        "cols": 5
      },
      "generatedRuntime": true,
      "runtimeSupported": true,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "generated daily/portfolio game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-canopy-bloom"
    },
    {
      "gameId": "foundry-ledger",
      "title": "Foundry Ledger",
      "enabled": false,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 1,
        "col": 1,
        "label": "center"
      },
      "board": {
        "rows": 4,
        "cols": 4
      },
      "generatedRuntime": false,
      "runtimeSupported": false,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "playable game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-foundry-ledger"
    },
    {
      "gameId": "guild-garden",
      "title": "Guild Garden",
      "enabled": true,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 1,
        "col": 1,
        "label": "center"
      },
      "board": {
        "rows": 4,
        "cols": 4
      },
      "generatedRuntime": true,
      "runtimeSupported": true,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "generated daily/portfolio game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-guild-garden"
    },
    {
      "gameId": "harbor-circuit",
      "title": "Harbor Circuit",
      "enabled": false,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 1,
        "col": 1,
        "label": "middle lane"
      },
      "board": {
        "rows": 3,
        "cols": 4
      },
      "generatedRuntime": false,
      "runtimeSupported": false,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "playable game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-harbor-circuit"
    },
    {
      "gameId": "lantern-relay",
      "title": "Lantern Relay",
      "enabled": false,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 2,
        "col": 2,
        "label": "center"
      },
      "board": {
        "rows": 5,
        "cols": 5
      },
      "generatedRuntime": false,
      "runtimeSupported": false,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "playable game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-lantern-relay"
    },
    {
      "gameId": "market-pulse",
      "title": "Market Pulse",
      "enabled": true,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 1,
        "col": 1,
        "label": "center"
      },
      "board": {
        "rows": 4,
        "cols": 4
      },
      "generatedRuntime": true,
      "runtimeSupported": true,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "generated daily/portfolio game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-market-pulse"
    },
    {
      "gameId": "metro-loom",
      "title": "Metro Loom",
      "enabled": true,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 2,
        "col": 2,
        "label": "center"
      },
      "board": {
        "rows": 5,
        "cols": 5
      },
      "generatedRuntime": true,
      "runtimeSupported": true,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "generated daily/portfolio game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-metro-loom"
    },
    {
      "gameId": "orbit-atlas",
      "title": "Orbit Atlas",
      "enabled": false,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 1,
        "col": 1,
        "label": "middle lane"
      },
      "board": {
        "rows": 3,
        "cols": 4
      },
      "generatedRuntime": false,
      "runtimeSupported": false,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "playable game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-orbit-atlas"
    },
    {
      "gameId": "pocket-draft",
      "title": "Pocket Draft",
      "enabled": true,
      "variantId": "fast-start",
      "surface": "game-board-first-turn",
      "recommendedCell": {
        "row": 1,
        "col": 2,
        "label": "middle lane"
      },
      "board": {
        "rows": 3,
        "cols": 5
      },
      "generatedRuntime": true,
      "runtimeSupported": true,
      "priorityScore": 0,
      "evidence": {
        "shown": 0,
        "used": 0,
        "skipped": 0,
        "resolved": 0,
        "usageRate": 0,
        "skipRate": 0,
        "sampleReady": false
      },
      "decision": "active",
      "sourceReason": "generated daily/portfolio game without live row yet",
      "copy": "Start here",
      "telemetryId": "first-move-coach-pocket-draft"
    }
  ],
  "nextActions": [
    "Collect 30 shown event(s) and 20 resolved event(s) before changing coach intensity.",
    "Retire or soften the coach after live data shows tutorial and completion gates are stable."
  ]
} as const

export type FirstMoveCoach = typeof firstMoveCoach
export type FirstMoveCoachTarget = FirstMoveCoach['targets'][number]
