export const productGateSamplePlan = {
  "generatedAt": "2026-05-21T21:40:25.352Z",
  "sourceDataHash": "4921f271c1c0",
  "status": "product-gate-sample-plan-ready",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "retentionSource": "fixture-retention",
    "productGateRecovery": "product-gate-recovery-ready",
    "localEventBridge": "bridge-waiting-for-export",
    "organicSeedLoop": "organic-seed-loop-ready",
    "trafficSeeding": "traffic-seeding-ready"
  },
  "summary": {
    "failingGates": 3,
    "missions": 3,
    "primaryGateId": "firstGameCompletion",
    "fastestGateId": "d1Retention",
    "defaultRouteGateId": "d1Retention",
    "defaultRouteCampaignId": "gate-sample-20260522-d1Retention",
    "totalPromptViewsNeeded": 70,
    "totalObservedSuccessesNeeded": 139,
    "sampleReadyCount": 0,
    "localEventsAvailable": false,
    "importedGateSampleEvents": 0,
    "inboxGateSampleEvents": 0,
    "evidenceReadyCount": 0,
    "inboxReadyCount": 0,
    "supportingAggregateEvidenceNotes": 0,
    "downloadsScanStatus": "no-evidence-found",
    "downloadsScanCoolingDown": true,
    "downloadsScanNextRecommendedAt": "2026-05-22T00:49:49.509Z",
    "nextOwnerAction": "collect-gate-sample-downloads"
  },
  "downloadsScan": {
    "explicitOptInRequired": true,
    "cooldownHours": 4,
    "coolingDown": true,
    "evidenceReadyNow": false,
    "lastScanAt": "2026-05-21T20:49:49.509Z",
    "lastScanStatus": "no-evidence-found",
    "scanAgeHours": 0.84,
    "cooldownRemainingHours": 3.16,
    "nextRecommendedScanAt": "2026-05-22T00:49:49.509Z"
  },
  "publicSamplePage": {
    "path": "/gate-sample.html",
    "missionCount": 3,
    "primaryCampaignId": "gate-sample-20260522-firstGameCompletion",
    "fastestCampaignId": "gate-sample-20260522-d1Retention",
    "defaultRouteCampaignId": "gate-sample-20260522-d1Retention",
    "localProgressEnabled": true,
    "autonomousDefaultRoutingEnabled": true,
    "playerInitiatedExportEnabled": true,
    "playerInitiatedShareEnabled": true,
    "playerInitiatedAggregateEvidenceEnabled": true,
    "aggregateEvidenceIssueTemplate": "analytics-evidence.yml",
    "aggregateEvidenceRepository": "moshequ/autonomous-game-lab",
    "exportSurface": "product-gate-sample",
    "zeroPaidSpend": true,
    "playerInitiatedOnly": true,
    "noSyntheticEvents": true
  },
  "runtimeEvidencePolicy": {
    "status": "active",
    "surface": "product-gate-sample-plan-card",
    "localProgressSource": "agl.analytics.events",
    "campaignMatchProperties": [
      "acquisitionCampaign",
      "campaignId"
    ],
    "progressCounters": [
      "localCampaignEvents",
      "localCollectionEvents",
      "localPromptViews",
      "localPromptActions",
      "localObservedSuccesses",
      "localFailures",
      "localAnalyticsExports",
      "localPromptViewsRemaining",
      "localSuccessesRemaining"
    ],
    "exportProperties": [
      "exportSurface",
      "gateId",
      "gameId",
      "campaignId",
      "localCampaignEvents",
      "localCollectionEvents",
      "localPromptViews",
      "localPromptActions",
      "localObservedSuccesses",
      "localFailures",
      "localAnalyticsExports",
      "localEvidenceDropReady",
      "localSampleDecisionReady"
    ],
    "publicPageExportProperties": [
      "exportSurface",
      "exportSurfaceDetail",
      "gateId",
      "gameId",
      "campaignId",
      "localCampaignEvents",
      "localCollectionEvents",
      "localPromptViews",
      "localObservedSuccesses",
      "localAnalyticsExports",
      "localEvidenceDropReady",
      "localSampleDecisionReady"
    ],
    "publicPageShareProperties": [
      "campaignId",
      "gateId",
      "gameId",
      "shareUrl",
      "method",
      "succeeded",
      "zeroPaidSpend",
      "noSyntheticEvents"
    ],
    "defaultRouting": {
      "status": "active",
      "gateId": "d1Retention",
      "campaignId": "gate-sample-20260522-d1Retention",
      "gameId": "canopy-bloom",
      "source": "gate_sample",
      "channel": "product-gate-sample",
      "appliesWhen": "direct-root-visit-without-explicit-game-or-campaign",
      "routeSelection": "fastest-validation-mission-when-it-needs-fewer-successes-than-primary",
      "eventPolicy": "real-player-events-only",
      "controls": {
        "zeroPaidSpend": true,
        "noSyntheticEvents": true,
        "noAutoPlay": true,
        "playerCanChooseAnotherGame": true,
        "noRevenueEnablement": true
      }
    },
    "controls": {
      "zeroPaidSpend": true,
      "localOnlyUntilCollectorConfigured": true,
      "noSyntheticEvents": true,
      "playerInitiatedExportOnly": true,
      "noRevenueEnablement": true
    }
  },
  "missions": [
    {
      "id": "collect-firstGameCompletion-sample",
      "rank": 1,
      "gateId": "firstGameCompletion",
      "label": "First game completion",
      "status": "collecting-sample",
      "ownerLoop": "completion-loop",
      "actionId": "refresh-completion-loop",
      "gameId": "harbor-rings",
      "title": "Harbor Rings",
      "surface": "autonomy-cockpit-completion-card",
      "campaignId": "gate-sample-20260522-firstGameCompletion",
      "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260522-firstGameCompletion",
      "organicSeedCampaignId": null,
      "current": {
        "actual": 0.397,
        "gate": 0.55,
        "denominator": 375,
        "successes": 149,
        "promptViews": 0,
        "promptActions": 0,
        "actionRate": null
      },
      "needed": {
        "promptViews": 30,
        "successes": 128,
        "minimumPromptViewsForDecision": 30
      },
      "telemetry": {
        "view": [
          "completion_nudge_viewed",
          "finish_line_coach_viewed",
          "first_move_coach_shown"
        ],
        "action": [
          "completion_nudge_clicked",
          "finish_line_coach_clicked",
          "first_move_coach_used"
        ],
        "success": [
          "level_completed"
        ],
        "failure": [
          "game_abandoned"
        ],
        "collectionEvents": [
          "completion_nudge_viewed",
          "finish_line_coach_viewed",
          "first_move_coach_shown",
          "completion_nudge_clicked",
          "finish_line_coach_clicked",
          "first_move_coach_used",
          "level_completed"
        ]
      },
      "refreshCommands": [
        "npm run autonomous:completion-loop",
        "npm run autonomous:local-event-bridge",
        "npm run autonomous:import-events",
        "npm run autonomous:analytics",
        "npm run autonomous:gate-recovery"
      ],
      "controls": {
        "costUsd": 0,
        "noPaidTraffic": true,
        "playerInitiatedOnly": true,
        "noSyntheticEvents": true,
        "noRuleChange": true,
        "noRevenueEnablement": true
      },
      "sampleRole": "primary-bottleneck",
      "evidence": {
        "status": "waiting-for-player-export",
        "source": null,
        "events": 0,
        "successEvents": 0,
        "analyticsExports": 0,
        "latestAt": null
      },
      "supportingAggregateEvidence": {
        "status": "none",
        "source": "support-feedback-public-issues",
        "matchScope": "none",
        "noteCount": 0,
        "campaignNoteCount": 0,
        "gateGameNoteCount": 0,
        "starts": 0,
        "completions": 0,
        "replays": 0,
        "d1Eligible": 0,
        "d1Retained": 0,
        "gateDecisionEligible": false,
        "manualReviewRequired": true,
        "topIssues": []
      }
    },
    {
      "id": "collect-replayRate-sample",
      "rank": 2,
      "gateId": "replayRate",
      "label": "Replay rate",
      "status": "collecting-sample",
      "ownerLoop": "replay-loop",
      "actionId": "refresh-replay-loop",
      "gameId": "harbor-rings",
      "title": "Harbor Rings",
      "surface": "autonomy-cockpit-replay-card",
      "campaignId": "gate-sample-20260522-replayRate",
      "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260522-replayRate",
      "organicSeedCampaignId": null,
      "current": {
        "actual": 0.309,
        "gate": 0.35,
        "denominator": 149,
        "successes": 46,
        "promptViews": 0,
        "promptActions": 0,
        "actionRate": null
      },
      "needed": {
        "promptViews": 30,
        "successes": 10,
        "minimumPromptViewsForDecision": 30
      },
      "telemetry": {
        "view": [
          "replay_prompt_viewed"
        ],
        "action": [
          "replay_prompt_clicked"
        ],
        "success": [
          "replay_clicked"
        ],
        "failure": [
          "replay_prompt_dismissed"
        ],
        "collectionEvents": [
          "replay_prompt_viewed",
          "replay_prompt_clicked",
          "replay_clicked"
        ]
      },
      "refreshCommands": [
        "npm run autonomous:replay-loop",
        "npm run autonomous:local-event-bridge",
        "npm run autonomous:import-events",
        "npm run autonomous:analytics",
        "npm run autonomous:gate-recovery"
      ],
      "controls": {
        "costUsd": 0,
        "noPaidTraffic": true,
        "playerInitiatedOnly": true,
        "noSyntheticEvents": true,
        "noRuleChange": true,
        "noRevenueEnablement": true
      },
      "sampleRole": "supporting-sample",
      "evidence": {
        "status": "waiting-for-player-export",
        "source": null,
        "events": 0,
        "successEvents": 0,
        "analyticsExports": 0,
        "latestAt": null
      },
      "supportingAggregateEvidence": {
        "status": "none",
        "source": "support-feedback-public-issues",
        "matchScope": "none",
        "noteCount": 0,
        "campaignNoteCount": 0,
        "gateGameNoteCount": 0,
        "starts": 0,
        "completions": 0,
        "replays": 0,
        "d1Eligible": 0,
        "d1Retained": 0,
        "gateDecisionEligible": false,
        "manualReviewRequired": true,
        "topIssues": []
      }
    },
    {
      "id": "collect-d1Retention-sample",
      "rank": 3,
      "gateId": "d1Retention",
      "label": "D1 retention",
      "status": "collecting-sample",
      "ownerLoop": "retention-loop",
      "actionId": "optimize-daily-retention",
      "gameId": "canopy-bloom",
      "title": "Canopy Bloom",
      "surface": "autonomy-cockpit-return-intent-card",
      "campaignId": "gate-sample-20260522-d1Retention",
      "playPath": "/?game=canopy-bloom&utm_source=gate_sample&utm_campaign=gate-sample-20260522-d1Retention",
      "organicSeedCampaignId": "seed-20260522-canopy-bloom",
      "current": {
        "actual": 0.167,
        "gate": 0.18,
        "denominator": 12,
        "successes": 2,
        "promptViews": 0,
        "promptActions": 0,
        "actionRate": null
      },
      "needed": {
        "promptViews": 10,
        "successes": 1,
        "minimumPromptViewsForDecision": 10
      },
      "telemetry": {
        "view": [
          "daily_return_prompt_viewed",
          "daily_return_intent_viewed"
        ],
        "action": [
          "daily_return_prompt_clicked",
          "daily_return_intent_started"
        ],
        "success": [
          "daily_return_intent_started"
        ],
        "failure": [
          "daily_return_prompt_dismissed",
          "daily_return_intent_cleared"
        ],
        "collectionEvents": [
          "daily_return_prompt_viewed",
          "daily_return_intent_viewed",
          "daily_return_prompt_clicked",
          "daily_return_intent_started",
          "daily_return_intent_started"
        ]
      },
      "refreshCommands": [
        "npm run autonomous:retention",
        "npm run autonomous:local-event-bridge",
        "npm run autonomous:import-events",
        "npm run autonomous:analytics",
        "npm run autonomous:gate-recovery"
      ],
      "controls": {
        "costUsd": 0,
        "noPaidTraffic": true,
        "playerInitiatedOnly": true,
        "noSyntheticEvents": true,
        "noRuleChange": true,
        "noRevenueEnablement": true
      },
      "sampleRole": "fastest-validation",
      "evidence": {
        "status": "waiting-for-player-export",
        "source": null,
        "events": 0,
        "successEvents": 0,
        "analyticsExports": 0,
        "latestAt": null
      },
      "supportingAggregateEvidence": {
        "status": "none",
        "source": "support-feedback-public-issues",
        "matchScope": "none",
        "noteCount": 0,
        "campaignNoteCount": 0,
        "gateGameNoteCount": 0,
        "starts": 0,
        "completions": 0,
        "replays": 0,
        "d1Eligible": 0,
        "d1Retained": 0,
        "gateDecisionEligible": false,
        "manualReviewRequired": true,
        "topIssues": []
      }
    }
  ],
  "commandPlan": {
    "refreshPlan": "npm run autonomous:sample-plan",
    "collectAndRefresh": "npm run autonomous:local-event-bridge && npm run autonomous:import-events && npm run autonomous:analytics && npm run autonomous:gate-recovery && npm run autonomous:sample-plan && npm run autonomous:retention",
    "collectDownloadsAndRefresh": "npm run autonomous:collect-sample-downloads",
    "primaryLoopRefresh": "npm run autonomous:completion-loop"
  },
  "controls": {
    "zeroPaidSpend": true,
    "noPaidTraffic": true,
    "noSyntheticGatePasses": true,
    "noAutomaticRuleChanges": true,
    "noRevenueEnablement": true,
    "noStoreSubmission": true,
    "playerInitiatedOnly": true,
    "localEventBridgeRequired": true,
    "realEventDropsOnly": true,
    "downloadsImportRequiresExplicitOptIn": true,
    "downloadsScanBackoffRequired": true,
    "directTrafficSampleRouting": true,
    "playerInitiatedSampleSharing": true,
    "requireObservedTelemetryBeforeRecoveryChange": true,
    "publicAggregateEvidenceIsSupportingOnly": true,
    "aggregateEvidenceDoesNotPassGates": true
  },
  "nextActions": [
    "First game completion needs 30 more prompt exposure(s) and 128 observed success(es); feature Harbor Rings via /?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260522-firstGameCompletion.",
    "D1 retention is the fastest gate sample: 10 prompt exposure(s), 1 observed success(es).",
    "Wait until 2026-05-22T00:49:49.509Z before the next explicit Downloads scan unless an inbox event drop appears."
  ]
} as const

export type ProductGateSamplePlan = typeof productGateSamplePlan
