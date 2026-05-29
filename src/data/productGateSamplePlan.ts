export const productGateSamplePlan = {
  "status": "product-gate-sample-plan-ready",
  "summary": {
    "fastestGateId": "d1Retention",
    "defaultRouteGateId": "firstGameCompletion",
    "defaultRouteCampaignId": "gate-sample-20260529-firstGameCompletion",
    "totalPromptViewsNeeded": 70
  },
  "runtimeEvidencePolicy": {
    "defaultRouting": {
      "gateId": "firstGameCompletion",
      "campaignId": "gate-sample-20260529-firstGameCompletion",
      "gameId": "harbor-rings",
      "neededPromptViews": 30,
      "neededSuccesses": 128,
      "selectionReason": "First game completion is the primary revenue-blocking gap and can collect same-session evidence from the next player."
    }
  },
  "defaultRoute": {
    "status": "active",
    "gateId": "firstGameCompletion",
    "label": "First game completion",
    "title": "Harbor Rings",
    "ownerLoop": "completion-loop",
    "gameId": "harbor-rings",
    "campaignId": "gate-sample-20260529-firstGameCompletion",
    "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260529-firstGameCompletion",
    "sampleRole": "primary-bottleneck",
    "evidenceStatus": "waiting-for-player-export",
    "neededPromptViews": 30,
    "neededSuccesses": 128,
    "minimumPromptViewsForDecision": 30,
    "latencyDays": 0,
    "sameSessionPlayable": true,
    "returnHandoffRequired": false,
    "returnHandoff": null,
    "selectionReason": "First game completion is the primary revenue-blocking gap and can collect same-session evidence from the next player.",
    "controls": {
      "zeroPaidSpend": true,
      "playerInitiatedOnly": true,
      "noSyntheticEvents": true,
      "noRevenueEnablement": true
    }
  },
  "evidenceSprintPlan": {
    "id": "zero-spend-product-gate-evidence-sprint",
    "status": "ready-for-player-invite-sprint",
    "sprintDate": "2026-05-29",
    "durationDays": 2,
    "totals": {
      "routes": 3,
      "failingGates": 3,
      "promptViewQuota": 70,
      "observedSuccessQuota": 139,
      "minimumCountedRunsNeeded": 168,
      "sameSessionRoutes": 2,
      "returnHandoffRoutes": 1
    },
    "routeQuotas": [
      {
        "routeId": "gate-sample-firstGameCompletion",
        "priority": 1,
        "sampleRole": "primary-bottleneck",
        "gateId": "firstGameCompletion",
        "gameId": "harbor-rings",
        "title": "Harbor Rings",
        "campaignId": "gate-sample-20260529-firstGameCompletion",
        "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260529-firstGameCompletion",
        "neededPromptViews": 30,
        "neededObservedSuccesses": 128,
        "minimumCountedRunsNeeded": 128,
        "latencyDays": 0,
        "returnHandoffRequired": false,
        "returnIntentDate": null,
        "returnPath": null
      },
      {
        "routeId": "gate-sample-replayRate",
        "priority": 2,
        "sampleRole": "supporting-sample",
        "gateId": "replayRate",
        "gameId": "harbor-rings",
        "title": "Harbor Rings",
        "campaignId": "gate-sample-20260529-replayRate",
        "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260529-replayRate",
        "neededPromptViews": 30,
        "neededObservedSuccesses": 10,
        "minimumCountedRunsNeeded": 30,
        "latencyDays": 0,
        "returnHandoffRequired": false,
        "returnIntentDate": null,
        "returnPath": null
      },
      {
        "routeId": "gate-sample-d1Retention",
        "priority": 3,
        "sampleRole": "fastest-validation",
        "gateId": "d1Retention",
        "gameId": "market-pulse",
        "title": "Market Pulse",
        "campaignId": "gate-sample-20260529-d1Retention",
        "playPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260529-d1Retention",
        "neededPromptViews": 10,
        "neededObservedSuccesses": 1,
        "minimumCountedRunsNeeded": 10,
        "latencyDays": 1,
        "returnHandoffRequired": true,
        "returnIntentDate": "2026-05-29",
        "returnPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260529-d1Retention&return_intent=2026-05-29"
      }
    ],
    "controls": {
      "zeroPaidSpend": true,
      "noAutomaticMessaging": true,
      "noGateDecisionFromSprintAlone": true,
      "noRevenueEnablement": true
    }
  },
  "controls": {
    "zeroPaidSpend": true,
    "sampleStartCreatesFreshRun": true
  },
  "missions": [
    {
      "id": "collect-firstGameCompletion-sample",
      "gateId": "firstGameCompletion",
      "label": "First game completion",
      "status": "collecting-sample",
      "ownerLoop": "completion-loop",
      "gameId": "harbor-rings",
      "title": "Harbor Rings",
      "surface": "autonomy-cockpit-completion-card",
      "campaignId": "gate-sample-20260529-firstGameCompletion",
      "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260529-firstGameCompletion",
      "returnHandoff": null,
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
      "controls": {
        "costUsd": 0,
        "noSyntheticEvents": true,
        "noRuleChange": true,
        "noRevenueEnablement": true
      },
      "evidence": {
        "status": "waiting-for-player-export"
      }
    },
    {
      "id": "collect-replayRate-sample",
      "gateId": "replayRate",
      "label": "Replay rate",
      "status": "collecting-sample",
      "ownerLoop": "replay-loop",
      "gameId": "harbor-rings",
      "title": "Harbor Rings",
      "surface": "autonomy-cockpit-replay-card",
      "campaignId": "gate-sample-20260529-replayRate",
      "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260529-replayRate",
      "returnHandoff": null,
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
      "controls": {
        "costUsd": 0,
        "noSyntheticEvents": true,
        "noRuleChange": true,
        "noRevenueEnablement": true
      },
      "evidence": {
        "status": "waiting-for-player-export"
      }
    },
    {
      "id": "collect-d1Retention-sample",
      "gateId": "d1Retention",
      "label": "D1 retention",
      "status": "collecting-sample",
      "ownerLoop": "retention-loop",
      "gameId": "market-pulse",
      "title": "Market Pulse",
      "surface": "autonomy-cockpit-return-intent-card",
      "campaignId": "gate-sample-20260529-d1Retention",
      "playPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260529-d1Retention",
      "returnHandoff": {
        "status": "armed",
        "gateId": "d1Retention",
        "gameId": "market-pulse",
        "title": "Market Pulse",
        "campaignId": "gate-sample-20260529-d1Retention",
        "challengeDate": "2026-05-28",
        "intentDate": "2026-05-29",
        "queryParam": "return_intent",
        "returnPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260529-d1Retention&return_intent=2026-05-29",
        "copyCta": "Copy return link",
        "calendarCta": "Save reminder",
        "calendarFileExtension": ".ics",
        "surface": "product-gate-sample-return-handoff",
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
      "needed": {
        "promptViews": 10,
        "successes": 1,
        "minimumPromptViewsForDecision": 10
      },
      "telemetry": {
        "view": [
          "daily_goal_reward_viewed",
          "daily_return_prompt_viewed",
          "daily_return_commitment_viewed",
          "daily_return_intent_viewed"
        ],
        "action": [
          "daily_goal_reward_clicked",
          "daily_return_prompt_clicked",
          "daily_return_link_copied",
          "daily_return_calendar_downloaded",
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
          "daily_goal_reward_viewed",
          "daily_return_prompt_viewed",
          "daily_return_commitment_viewed",
          "daily_return_intent_viewed",
          "daily_goal_reward_clicked",
          "daily_return_prompt_clicked",
          "daily_return_link_copied",
          "daily_return_calendar_downloaded",
          "daily_return_intent_started",
          "daily_return_intent_started"
        ]
      },
      "controls": {
        "costUsd": 0,
        "noSyntheticEvents": true,
        "noRuleChange": true,
        "noRevenueEnablement": true
      },
      "evidence": {
        "status": "waiting-for-player-export"
      }
    }
  ]
} as const

export type ProductGateSamplePlan = typeof productGateSamplePlan
