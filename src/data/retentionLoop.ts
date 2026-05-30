export const retentionLoop = {
  "status": "retention-loop-ready",
  "dailyChallenge": {
    "date": "2026-05-28",
    "gameId": "market-pulse",
    "title": "Market Pulse",
    "seed": "daily-20260528-6uj",
    "reason": "Market Pulse has the strongest blended portfolio score (51.912)."
  },
  "metrics": {
    "d1Retention": 0.167
  },
  "localState": {
    "storageKey": "agl.retention.dailyStreak",
    "dateKey": "agl.retention.lastCompletedDate",
    "bestKey": "agl.retention.bestDailyStreak",
    "returnIntentKey": "agl.retention.returnIntentDate",
    "returnPromptDismissedKey": "agl.retention.returnPromptDismissedDate",
    "returnIntentStartedKey": "agl.retention.returnIntentStartedDate",
    "returnIntentClearedKey": "agl.retention.returnIntentClearedDate"
  },
  "rewardPolicy": {
    "recommendedVariant": "daily-streak",
    "runnerUpVariant": "score-booster",
    "confidence": 95,
    "currentDailyStreakWeight": 80,
    "primaryMetric": "replayRate",
    "winnerReplayRate": 0.354,
    "runnerUpReplayRate": 0.226,
    "replayRateLift": 0.128,
    "action": "promote-winner",
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
  "rewardSurfacePolicy": {
    "status": "armed",
    "surface": "autonomy-cockpit-daily-reward-result",
    "trigger": "after-completed-run",
    "label": "Daily reward",
    "ctaLabel": "Queue tomorrow",
    "copy": "Streak credit banked. Save tomorrow's board to turn this finish into a real D1 return.",
    "animation": "streak-pulse",
    "reason": "Daily-streak reward framing is the current reward_offer winner; show it as the post-run result moment.",
    "telemetry": {
      "viewed": "daily_goal_reward_viewed",
      "clicked": "daily_goal_reward_clicked"
    },
    "controls": {
      "localOnly": true,
      "playerInitiatedOnly": true,
      "noPaidRewards": true,
      "noAds": true,
      "noCurrency": true,
      "noNotificationPermissionRequest": true,
      "noPushNotifications": true,
      "noAccountRequired": true,
      "noRevenueEnablement": true
    }
  },
  "samplePolicy": {
    "status": "collecting-sample",
    "campaignId": "gate-sample-20260530-d1Retention",
    "gateId": "d1Retention",
    "needed": {
      "promptViews": 10,
      "successes": 1,
      "minimumPromptViewsForDecision": 10
    }
  },
  "promptPolicy": {
    "status": "armed",
    "surface": "autonomy-cockpit-retention-card",
    "trigger": "after-completed-run",
    "ctaLabel": "Queue tomorrow",
    "dismissLabel": "Not today",
    "copy": "Queue tomorrow's board to protect your local daily streak.",
    "nextChallengeDate": "2026-05-29",
    "cooldown": "one prompt per daily challenge date",
    "reason": "D1 retention is 17% and the gate is 18%; ask for a local return intent after a completed run.",
    "telemetry": {
      "viewed": "daily_return_prompt_viewed",
      "clicked": "daily_return_prompt_clicked",
      "dismissed": "daily_return_prompt_dismissed"
    }
  },
  "returnIntentPolicy": {
    "status": "armed",
    "surface": "autonomy-cockpit-return-intent-card",
    "trigger": "app-load-with-local-return-intent",
    "ctaLabel": "Play queued board",
    "dismissLabel": "Clear intent",
    "copy": "Your queued board is ready; start it to keep the local streak signal real.",
    "cooldown": "one activation per queued intent date",
    "reason": "D1 retention is 17% and the gate is 18%; convert queued local return intent into a measured game start.",
    "telemetry": {
      "viewed": "daily_return_intent_viewed",
      "started": "daily_return_intent_started",
      "cleared": "daily_return_intent_cleared"
    }
  },
  "returnCommitmentPolicy": {
    "status": "armed",
    "surface": "autonomy-cockpit-return-commitment-card",
    "trigger": "after-local-return-intent-queued",
    "label": "Return queued",
    "copy": "Tomorrow's board is queued. Save a link or calendar reminder so the D1 signal can come back as a real start.",
    "reason": "Queued intent should keep offering player-saved return paths after the original prompt closes.",
    "telemetry": {
      "viewed": "daily_return_commitment_viewed"
    },
    "controls": {
      "zeroPaidSpend": true,
      "playerInitiatedOnly": true,
      "noNotificationPermissionRequest": true,
      "noPushNotifications": true,
      "noAccountRequired": true,
      "noExternalUpload": true,
      "noRevenueEnablement": true
    }
  },
  "returnLinkPolicy": {
    "surface": "autonomy-cockpit-retention-card",
    "ctaLabel": "Copy return link",
    "queryParam": "return_intent",
    "intentDate": "2026-05-29",
    "campaignId": "gate-sample-20260530-d1Retention",
    "telemetry": {
      "copied": "daily_return_link_copied"
    }
  },
  "returnCalendarPolicy": {
    "surface": "autonomy-cockpit-retention-card",
    "ctaLabel": "Save reminder",
    "queryParam": "return_intent",
    "intentDate": "2026-05-29",
    "campaignId": "gate-sample-20260530-d1Retention",
    "telemetry": {
      "downloaded": "daily_return_calendar_downloaded"
    }
  }
} as const

export type RetentionLoop = typeof retentionLoop
