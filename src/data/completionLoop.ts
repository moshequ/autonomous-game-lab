export const completionLoop = {
  "generatedAt": "2026-05-19T00:12:09.168Z",
  "status": "completion-loop-ready",
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "releaseHealth": "monitoring",
    "productOptimization": "product-optimization-ready",
    "firstMoveCoach": "first-move-coach-ready"
  },
  "target": {
    "gameId": "harbor-rings",
    "title": "Harbor Rings",
    "starts": 284,
    "maxMoves": 12,
    "triggerMove": 3,
    "candidateCompletionRate": 0.394,
    "candidateTutorialRate": 0.669
  },
  "metrics": {
    "firstGameCompletion": 0.397,
    "completionGate": 0.55,
    "completionGap": 0.153,
    "tutorialCompletion": 0.653,
    "tutorialGap": 0.097,
    "abandonmentRate": 0.603,
    "gameStarts": 375,
    "completions": 149,
    "abandonments": 226,
    "promptViews": 0,
    "promptClicks": 0,
    "promptDismissals": 0
  },
  "promptPolicy": {
    "id": "mid-run-finish-nudge",
    "status": "armed",
    "surface": "autonomy-cockpit-completion-card",
    "trigger": "after-progress-checkpoint",
    "triggerMove": 3,
    "ctaLabel": "Keep playing",
    "dismissLabel": "Hide",
    "copy": "You are already into the run. Finish the last turns to get a useful score.",
    "cooldown": "one prompt per active run",
    "reason": "First-game completion is 40% and the gate is 55%; nudge players who reach move 3 to finish.",
    "telemetry": {
      "viewed": "completion_nudge_viewed",
      "clicked": "completion_nudge_clicked",
      "dismissed": "completion_nudge_dismissed",
      "completed": "level_completed",
      "abandoned": "game_abandoned"
    }
  },
  "localState": {
    "dismissedRunKey": "agl.completion.dismissedRunKey",
    "acceptedRunKey": "agl.completion.acceptedRunKey"
  },
  "controls": {
    "zeroPaidSpend": true,
    "midRunOnly": true,
    "onePromptPerRun": true,
    "noForcedTutorial": true,
    "noAutoMove": true,
    "noRuleChange": true,
    "noPaidRewards": true,
    "noRevenueEnablement": true,
    "noDarkPatterns": true,
    "requireAbandonmentTelemetry": true,
    "canNudgeCompletion": true,
    "completionReady": false,
    "monetizationStillBlocked": true
  },
  "missions": [
    {
      "id": "reach-progress-checkpoint",
      "label": "Reach move 3",
      "event": "completion_nudge_viewed",
      "gameId": "harbor-rings",
      "reward": "finish-context",
      "status": "armed"
    },
    {
      "id": "choose-keep-playing",
      "label": "Choose to keep playing from the completion nudge",
      "event": "completion_nudge_clicked",
      "gameId": "harbor-rings",
      "reward": "attention-return",
      "status": "armed"
    },
    {
      "id": "complete-after-nudge",
      "label": "Complete the run after a progress checkpoint",
      "event": "level_completed",
      "gameId": "harbor-rings",
      "reward": "completion-signal",
      "status": "armed"
    },
    {
      "id": "measure-abandonment",
      "label": "Measure abandoned runs against nudge exposure",
      "event": "game_abandoned",
      "gameId": "harbor-rings",
      "reward": "friction-signal",
      "status": "armed"
    }
  ],
  "nextActions": [
    "Improve first-game completion from 40% toward 55% with a measured checkpoint nudge.",
    "Compare completion_nudge_viewed/clicked/dismissed against level_completed and game_abandoned before changing copy.",
    "Keep completion nudges optional, rule-neutral, and zero-spend until product gates pass."
  ]
} as const

export type CompletionLoop = typeof completionLoop
