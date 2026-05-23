export const productGateSamplePlan = {
  "status": "product-gate-sample-plan-ready",
  "summary": {
    "fastestGateId": "d1Retention",
    "defaultRouteCampaignId": "gate-sample-20260523-firstGameCompletion",
    "totalPromptViewsNeeded": 70
  },
  "runtimeEvidencePolicy": {
    "defaultRouting": {
      "campaignId": "gate-sample-20260523-firstGameCompletion"
    }
  },
  "controls": {
    "zeroPaidSpend": true
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
      "campaignId": "gate-sample-20260523-firstGameCompletion",
      "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260523-firstGameCompletion",
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
      "campaignId": "gate-sample-20260523-replayRate",
      "playPath": "/?game=harbor-rings&utm_source=gate_sample&utm_campaign=gate-sample-20260523-replayRate",
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
      "campaignId": "gate-sample-20260523-d1Retention",
      "playPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260523-d1Retention",
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
          "daily_return_link_copied",
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
          "daily_return_link_copied",
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
