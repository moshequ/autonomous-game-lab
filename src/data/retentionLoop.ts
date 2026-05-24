export const retentionLoop = {
  "generatedAt": "2026-05-24T07:49:04.277Z",
  "status": "retention-loop-ready",
  "sourceDataHash": "ee67d875d5c4",
  "dailyChallenge": {
    "date": "2026-05-23",
    "gameId": "market-pulse",
    "title": "Market Pulse",
    "seed": "daily-20260523-6sx",
    "reason": "Market Pulse has the strongest blended portfolio score (51.912)."
  },
  "sourceStatus": {
    "analyticsSource": "fixture-sample",
    "retentionSource": "fixture-retention",
    "releaseHealth": "monitoring"
  },
  "metrics": {
    "d1Retention": 0.167,
    "replayRate": 0.309,
    "firstGameCompletion": 0.397,
    "eligibleUsers": 12,
    "retainedUsers": 2
  },
  "guardrails": {
    "noPushNotifications": true,
    "noAccountsRequired": true,
    "noDarkPatterns": true,
    "noPaidRetentionMechanics": true,
    "noRewardedAdsUntilMonetizationGatesPass": true,
    "noNotificationPermissionRequest": true
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
  "promptPolicy": {
    "status": "armed",
    "surface": "autonomy-cockpit-retention-card",
    "trigger": "after-completed-run",
    "ctaLabel": "Queue tomorrow",
    "dismissLabel": "Not today",
    "copy": "Queue tomorrow's board to protect your local daily streak.",
    "nextChallengeDate": "2026-05-24",
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
  "returnLinkPolicy": {
    "status": "armed",
    "surface": "autonomy-cockpit-retention-card",
    "trigger": "after-completed-run",
    "ctaLabel": "Copy return link",
    "queryParam": "return_intent",
    "intentDate": "2026-05-24",
    "campaignId": "gate-sample-20260524-d1Retention",
    "telemetry": {
      "copied": "daily_return_link_copied"
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
  "returnCalendarPolicy": {
    "status": "armed",
    "surface": "autonomy-cockpit-retention-card",
    "trigger": "after-completed-run",
    "ctaLabel": "Save reminder",
    "queryParam": "return_intent",
    "fileExtension": ".ics",
    "intentDate": "2026-05-24",
    "campaignId": "gate-sample-20260524-d1Retention",
    "telemetry": {
      "downloaded": "daily_return_calendar_downloaded"
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
  "measurementPolicy": {
    "source": "player-exported-events",
    "retainedEvent": "daily_return_intent_started",
    "cohortDateProperty": "retentionCohortDate",
    "returnDateProperty": "retentionReturnDate",
    "evidenceProperty": "retentionEvidence",
    "evidenceValue": "queued-return-intent",
    "d1Only": true,
    "requiresAnonymousId": true,
    "noSyntheticEvents": true,
    "reason": "Queued return-intent activations carry explicit cohort and return dates so local event exports can prove D1 retention without accounts or push notifications."
  },
  "samplePolicy": {
    "gateId": "d1Retention",
    "label": "D1 retention",
    "status": "collecting-sample",
    "sampleRole": "fastest-validation",
    "campaignId": "gate-sample-20260524-d1Retention",
    "playPath": "/?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260524-d1Retention",
    "publicSamplePath": "/gate-sample.html",
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
      ]
    },
    "evidence": {
      "status": "waiting-for-player-export",
      "source": null,
      "events": 0,
      "successEvents": 0,
      "analyticsExports": 0,
      "latestAt": null
    },
    "downloadsScan": {
      "explicitOptInRequired": true,
      "cooldownHours": 4,
      "coolingDown": false,
      "evidenceReadyNow": false,
      "lastScanAt": "2026-05-22T13:53:13.086Z",
      "lastScanStatus": "no-evidence-found",
      "scanAgeHours": 13.09,
      "cooldownRemainingHours": 0,
      "nextRecommendedScanAt": "2026-05-22T17:53:13.086Z"
    },
    "commandPlan": {
      "refreshRetention": "npm run autonomous:retention",
      "refreshSamplePlan": "npm run autonomous:sample-plan",
      "collectDownloadsAndRefresh": "npm run autonomous:collect-sample-downloads"
    },
    "controls": {
      "zeroPaidSpend": true,
      "playerInitiatedOnly": true,
      "noSyntheticEvents": true,
      "noAutomaticRuleChanges": true,
      "noRevenueEnablement": true,
      "realEventDropsOnly": true,
      "downloadsImportRequiresExplicitOptIn": true,
      "downloadsScanBackoffRequired": true
    },
    "nextAction": "Feature the daily challenge via /?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260524-d1Retention and collect 10 prompt exposure(s) plus 1 retained start(s)."
  },
  "controls": {
    "canNudgeRetention": true,
    "retentionReady": false,
    "completionReady": false,
    "replayReady": false,
    "monetizationStillBlocked": true,
    "returnIntentPlayerInitiatedOnly": true,
    "noBackgroundWakeups": true
  },
  "missions": [
    {
      "id": "finish-daily-challenge",
      "label": "Finish Market Pulse",
      "event": "daily_challenge_completed",
      "gameId": "market-pulse",
      "reward": "streak-credit",
      "status": "armed"
    },
    {
      "id": "return-tomorrow",
      "label": "Return tomorrow for a fresh board",
      "event": "daily_return_prompt_viewed",
      "gameId": "market-pulse",
      "reward": "next-daily-seed",
      "status": "armed"
    },
    {
      "id": "confirm-return-intent",
      "label": "Queue 2026-05-24 board intent",
      "event": "daily_return_prompt_clicked",
      "gameId": "market-pulse",
      "reward": "local-return-intent",
      "status": "armed"
    },
    {
      "id": "copy-return-link",
      "label": "Copy 2026-05-24 return link",
      "event": "daily_return_link_copied",
      "gameId": "market-pulse",
      "reward": "player-saved-return-link",
      "status": "armed"
    },
    {
      "id": "save-return-reminder",
      "label": "Save 2026-05-24 return reminder",
      "event": "daily_return_calendar_downloaded",
      "gameId": "market-pulse",
      "reward": "player-saved-calendar-reminder",
      "status": "armed"
    },
    {
      "id": "activate-return-intent",
      "label": "Start a queued return board",
      "event": "daily_return_intent_started",
      "gameId": "market-pulse",
      "reward": "retained-session",
      "status": "armed"
    },
    {
      "id": "share-daily-seed",
      "label": "Share the daily seed after a run",
      "event": "share_clicked",
      "gameId": "market-pulse",
      "reward": "organic-signal",
      "status": "armed"
    }
  ],
  "nextActions": [
    "Improve D1 retention from 17% toward 18% with local streak prompts.",
    "Feature the daily challenge via /?game=market-pulse&utm_source=gate_sample&utm_campaign=gate-sample-20260524-d1Retention and collect 10 prompt exposure(s) plus 1 retained start(s).",
    "Improve replay rate from 31% toward 35% with the daily return mission.",
    "Do not use push notifications, accounts, paid rewards, or ads for retention until gates pass."
  ]
} as const

export type RetentionLoop = typeof retentionLoop
