export const replayLoop = {
  "generatedAt": "2026-05-22T02:06:48.614Z",
  "sourceDataHash": "1b311b42b504",
  "status": "replay-loop-ready",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "releaseHealth": "monitoring",
    "productOptimization": "product-optimization-ready"
  },
  "target": {
    "gameId": "harbor-rings",
    "title": "Harbor Rings",
    "starts": 284,
    "candidateReplayRate": 0.313,
    "candidateReplayGap": 0.037
  },
  "metrics": {
    "replayRate": 0.309,
    "replayGate": 0.35,
    "replayGap": 0.041,
    "firstGameCompletion": 0.397,
    "d1Retention": 0.167,
    "levelCompletions": 149,
    "replayClicks": 46,
    "promptViews": 0,
    "promptClicks": 0,
    "promptDismissals": 0,
    "promptDecisions": 0,
    "promptClickRate": 0,
    "promptDismissalRate": 0
  },
  "samplePolicy": {
    "status": "collecting-sample",
    "source": "fixture-sample",
    "minimumViewsForDecision": 30,
    "minimumDecisionsForDecision": 20,
    "current": {
      "views": 0,
      "clicks": 0,
      "dismissals": 0,
      "decisions": 0,
      "clickRate": 0,
      "dismissalRate": 0
    },
    "needed": {
      "views": 30,
      "decisions": 20
    },
    "ready": false,
    "telemetry": {
      "viewed": "replay_prompt_viewed",
      "clicked": "replay_prompt_clicked",
      "dismissed": "replay_prompt_dismissed",
      "replay": "replay_clicked",
      "completed": "level_completed"
    }
  },
  "decisionPolicy": {
    "currentDecision": "collect-sample",
    "sampleReady": false,
    "softenCopyWhen": {
      "maximumClickRate": 0.2,
      "minimumDismissalRate": 0.6
    },
    "keepActiveWhen": {
      "minimumClickRate": 0.4
    },
    "monitorWhen": {
      "replayGatePassed": true
    },
    "fallbackWhenSampleSmall": "collect-more-real-replay-prompt-events"
  },
  "promptPolicy": {
    "id": "completed-run-replay-prompt",
    "status": "armed",
    "surface": "autonomy-cockpit-replay-card",
    "trigger": "after-completed-run",
    "ctaLabel": "Play streak run",
    "dismissLabel": "Done for now",
    "copy": "Start one more board to keep today's local streak alive.",
    "cooldown": "one prompt per completed run",
    "reason": "Replay rate is 31% and the gate is 35%; ask for one fresh run after completion.",
    "telemetry": {
      "viewed": "replay_prompt_viewed",
      "clicked": "replay_prompt_clicked",
      "dismissed": "replay_prompt_dismissed",
      "replay": "replay_clicked"
    }
  },
  "rewardFraming": {
    "status": "active",
    "sourceExperiment": "reward_offer",
    "recommendedVariant": "daily-streak",
    "runnerUpVariant": "score-booster",
    "confidence": 95,
    "confidenceFloor": 55,
    "currentDailyStreakWeight": 80,
    "primaryMetric": "replayRate",
    "winnerReplayRate": 0.354,
    "runnerUpReplayRate": 0.226,
    "replayRateLift": 0.128,
    "reason": "daily-streak beat score-booster on replayRate with 95% confidence",
    "controls": {
      "localOnly": true,
      "noPaidRewards": true,
      "noAds": true,
      "noCurrency": true,
      "noAccountRequired": true,
      "noRevenueEnablement": true
    }
  },
  "localState": {
    "dismissedRunKey": "agl.replay.dismissedRunKey",
    "acceptedRunKey": "agl.replay.acceptedRunKey"
  },
  "controls": {
    "zeroPaidSpend": true,
    "afterCompletedRunOnly": true,
    "onePromptPerCompletedRun": true,
    "noForcedReplay": true,
    "noAutoRestart": true,
    "noPaidRewards": true,
    "noRevenueEnablement": true,
    "noDarkPatterns": true,
    "requireCompletedRunTelemetry": true,
    "requirePromptRunLink": true,
    "noDecisionWithoutSample": true,
    "canNudgeReplay": true,
    "completionReady": false,
    "retentionReady": false,
    "replayReady": false,
    "monetizationStillBlocked": true
  },
  "missions": [
    {
      "id": "finish-run",
      "label": "Finish a Harbor Rings run",
      "event": "level_completed",
      "gameId": "harbor-rings",
      "reward": "result-context",
      "status": "armed"
    },
    {
      "id": "show-replay-prompt",
      "label": "Show one replay prompt after a completed run",
      "event": "replay_prompt_viewed",
      "gameId": "harbor-rings",
      "reward": "fresh-run-suggestion",
      "status": "armed"
    },
    {
      "id": "confirm-replay",
      "label": "Start a fresh run from the completed-run prompt",
      "event": "replay_prompt_clicked",
      "gameId": "harbor-rings",
      "reward": "fresh-run",
      "status": "armed"
    },
    {
      "id": "respect-replay-dismissal",
      "label": "Let players leave after one completed run",
      "event": "replay_prompt_dismissed",
      "gameId": "harbor-rings",
      "reward": "no-pressure-exit",
      "status": "armed"
    }
  ],
  "nextActions": [
    "Improve replay rate from 31% toward 35% with a measured completed-run prompt.",
    "Compare replay_prompt_viewed, replay_prompt_clicked, replay_prompt_dismissed, and replay_clicked before changing copy.",
    "Keep replay prompts optional, local, and zero-spend until product gates pass."
  ]
} as const

export type ReplayLoop = typeof replayLoop
