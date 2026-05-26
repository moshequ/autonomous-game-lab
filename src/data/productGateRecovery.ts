export const productGateRecovery = {
  "generatedAt": "2026-05-26T18:43:01.494Z",
  "sourceDataHash": "2a6af4cc6f1b",
  "status": "product-gate-recovery-ready",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "retentionSource": "fixture-retention",
    "productOptimization": "product-optimization-ready",
    "monetization": "blocked-by-product-gates"
  },
  "summary": {
    "failingGates": 3,
    "passingGates": 0,
    "primaryBottleneck": "firstGameCompletion",
    "quickestGateTest": "d1Retention",
    "revenueEnabled": false,
    "primaryExperimentStatus": "collecting-sample"
  },
  "publicRoutes": {
    "productGateRecovery": "/product-gate-recovery.html",
    "productGateRecoveryJson": "/product-gate-recovery.json",
    "measurementStatus": "/measurement-status.html",
    "gateSample": "/gate-sample.html",
    "sampleNext": "/sample-next.html",
    "sampleFastest": "/sample-fastest.html"
  },
  "gates": [
    {
      "id": "firstGameCompletion",
      "label": "First game completion",
      "actual": 0.397,
      "gate": 0.55,
      "denominator": 375,
      "successes": 149,
      "ownerLoop": "completion-loop",
      "runtimeSurface": "autonomy-cockpit-completion-card",
      "viewTelemetry": [
        "completion_nudge_viewed",
        "finish_line_coach_viewed",
        "first_move_coach_shown"
      ],
      "actionTelemetry": [
        "completion_nudge_clicked",
        "finish_line_coach_clicked",
        "first_move_coach_used"
      ],
      "successTelemetry": [
        "level_completed"
      ],
      "failureTelemetry": [
        "game_abandoned"
      ],
      "minimumActionRateForCopyHold": 0.18,
      "actionId": "refresh-completion-loop",
      "pass": false,
      "gap": 0.153,
      "neededSuccesses": 128,
      "neededSuccessesMode": "additional-successes-raise-observed-rate",
      "projectedRateAfterNeededSuccesses": 0.551,
      "minimumPromptViewsForDecision": 30,
      "currentPromptViews": 0,
      "currentPromptActions": 0,
      "currentPromptFailures": 226,
      "actionRate": null,
      "sampleReady": false,
      "promptViewsNeeded": 30,
      "status": "needs-observed-lift",
      "experimentStatus": "collecting-sample",
      "recommendedChange": "hold-current-runtime-copy"
    },
    {
      "id": "replayRate",
      "label": "Replay rate",
      "actual": 0.309,
      "gate": 0.35,
      "denominator": 149,
      "successes": 46,
      "ownerLoop": "replay-loop",
      "runtimeSurface": "autonomy-cockpit-replay-card",
      "viewTelemetry": [
        "replay_prompt_viewed"
      ],
      "actionTelemetry": [
        "replay_prompt_clicked"
      ],
      "successTelemetry": [
        "replay_clicked"
      ],
      "failureTelemetry": [
        "replay_prompt_dismissed"
      ],
      "minimumActionRateForCopyHold": 0.2,
      "actionId": "refresh-replay-loop",
      "pass": false,
      "gap": 0.041,
      "neededSuccesses": 10,
      "neededSuccessesMode": "additional-successes-raise-observed-rate",
      "projectedRateAfterNeededSuccesses": 0.352,
      "minimumPromptViewsForDecision": 30,
      "currentPromptViews": 0,
      "currentPromptActions": 0,
      "currentPromptFailures": 0,
      "actionRate": null,
      "sampleReady": false,
      "promptViewsNeeded": 30,
      "status": "needs-observed-lift",
      "experimentStatus": "collecting-sample",
      "recommendedChange": "hold-current-runtime-copy"
    },
    {
      "id": "d1Retention",
      "label": "D1 retention",
      "actual": 0.167,
      "gate": 0.18,
      "denominator": 12,
      "successes": 2,
      "ownerLoop": "retention-loop",
      "runtimeSurface": "autonomy-cockpit-return-intent-card",
      "viewTelemetry": [
        "daily_return_prompt_viewed",
        "daily_return_intent_viewed"
      ],
      "actionTelemetry": [
        "daily_return_prompt_clicked",
        "daily_return_link_copied",
        "daily_return_calendar_downloaded",
        "daily_return_intent_started"
      ],
      "successTelemetry": [
        "daily_return_intent_started"
      ],
      "failureTelemetry": [
        "daily_return_prompt_dismissed",
        "daily_return_intent_cleared"
      ],
      "minimumActionRateForCopyHold": 0.2,
      "actionId": "optimize-daily-retention",
      "pass": false,
      "gap": 0.013,
      "neededSuccesses": 1,
      "neededSuccessesMode": "additional-successes-raise-observed-rate",
      "projectedRateAfterNeededSuccesses": 0.231,
      "minimumPromptViewsForDecision": 10,
      "currentPromptViews": 0,
      "currentPromptActions": 0,
      "currentPromptFailures": 0,
      "actionRate": null,
      "sampleReady": false,
      "promptViewsNeeded": 10,
      "status": "needs-observed-lift",
      "experimentStatus": "collecting-sample",
      "recommendedChange": "hold-current-runtime-copy"
    }
  ],
  "priorities": [
    {
      "rank": 1,
      "gateId": "firstGameCompletion",
      "label": "First game completion",
      "ownerLoop": "completion-loop",
      "actionId": "refresh-completion-loop",
      "neededSuccesses": 128,
      "promptViewsNeeded": 30,
      "experimentStatus": "collecting-sample",
      "recommendedChange": "hold-current-runtime-copy",
      "nextMeasurement": "completion_nudge_viewed, finish_line_coach_viewed, first_move_coach_shown, completion_nudge_clicked, finish_line_coach_clicked, first_move_coach_used, level_completed",
      "reason": "First game completion is the largest revenue-blocking gap."
    },
    {
      "rank": 2,
      "gateId": "replayRate",
      "label": "Replay rate",
      "ownerLoop": "replay-loop",
      "actionId": "refresh-replay-loop",
      "neededSuccesses": 10,
      "promptViewsNeeded": 30,
      "experimentStatus": "collecting-sample",
      "recommendedChange": "hold-current-runtime-copy",
      "nextMeasurement": "replay_prompt_viewed, replay_prompt_clicked, replay_clicked",
      "reason": "Replay rate still blocks revenue and store payback assumptions."
    },
    {
      "rank": 3,
      "gateId": "d1Retention",
      "label": "D1 retention",
      "ownerLoop": "retention-loop",
      "actionId": "optimize-daily-retention",
      "neededSuccesses": 1,
      "promptViewsNeeded": 10,
      "experimentStatus": "collecting-sample",
      "recommendedChange": "hold-current-runtime-copy",
      "nextMeasurement": "daily_return_prompt_viewed, daily_return_intent_viewed, daily_return_prompt_clicked, daily_return_link_copied, daily_return_calendar_downloaded, daily_return_intent_started, daily_return_intent_started",
      "reason": "D1 retention is the fastest gate to re-test with real retained-player evidence."
    }
  ],
  "experiments": [
    {
      "gateId": "firstGameCompletion",
      "status": "collecting-sample",
      "ownerLoop": "completion-loop",
      "canChangeCopy": false,
      "canChangePlacement": false,
      "currentPromptViews": 0,
      "currentPromptActions": 0,
      "actionRate": null,
      "minimumPromptViewsForDecision": 30,
      "promptViewsNeeded": 30,
      "recommendedChange": "hold-current-runtime-copy",
      "holdReason": "Needs 30 more prompt exposure(s) before changing copy or placement."
    },
    {
      "gateId": "replayRate",
      "status": "collecting-sample",
      "ownerLoop": "replay-loop",
      "canChangeCopy": false,
      "canChangePlacement": false,
      "currentPromptViews": 0,
      "currentPromptActions": 0,
      "actionRate": null,
      "minimumPromptViewsForDecision": 30,
      "promptViewsNeeded": 30,
      "recommendedChange": "hold-current-runtime-copy",
      "holdReason": "Needs 30 more prompt exposure(s) before changing copy or placement."
    },
    {
      "gateId": "d1Retention",
      "status": "collecting-sample",
      "ownerLoop": "retention-loop",
      "canChangeCopy": false,
      "canChangePlacement": false,
      "currentPromptViews": 0,
      "currentPromptActions": 0,
      "actionRate": null,
      "minimumPromptViewsForDecision": 10,
      "promptViewsNeeded": 10,
      "recommendedChange": "hold-current-runtime-copy",
      "holdReason": "Needs 10 more prompt exposure(s) before changing copy or placement."
    }
  ],
  "controls": {
    "zeroPaidSpend": true,
    "revenueStillDisabledUntilAllGatesPass": true,
    "noSyntheticGatePasses": true,
    "requireObservedTelemetryBeforeCopyChange": true,
    "copyChangeRequiresSampleReady": true,
    "placementChangeRequiresSampleReady": true,
    "oneRecoveryFocusPerOwnerRun": true,
    "noPaidRewardsOrPushNotifications": true,
    "noAutomaticRuleChanges": true
  },
  "linkedLoops": {
    "productOptimization": "product-optimization-ready",
    "firstMoveCoach": "first-move-coach-ready",
    "completionLoop": "completion-loop-ready",
    "replayLoop": "replay-loop-ready",
    "retentionLoop": "retention-loop-ready"
  },
  "nextActions": [
    "First game completion needs 128 more observed success(es), accounting for denominator growth, before the gate clears.",
    "completion-loop is collecting-sample and should collect 30 more prompt exposure(s) before automation changes copy or placement again.",
    "D1 retention is the quickest separate gate test: 1 more observed success(es) would clear it.",
    "Keep revenue, paid acquisition, push notifications, and app-store submission disabled until every gate passes with observed data."
  ]
} as const

export type ProductGateRecovery = typeof productGateRecovery
