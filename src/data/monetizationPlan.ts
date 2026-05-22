export const monetizationPlan = {
  "generatedAt": "2026-05-22T01:40:29.479Z",
  "status": "blocked-by-product-gates",
  "revenueEnabled": false,
  "costPosture": "no-new-spend-until-gates-pass",
  "analyticsSource": "fixture-sample",
  "retentionSource": "fixture-retention",
  "metrics": {
    "firstGameCompletion": 0.397,
    "replayRate": 0.309,
    "d1Retention": 0.167,
    "revenueCents": 0
  },
  "gates": {
    "requiredStatus": "ready-for-low-risk-test",
    "readinessStatus": "blocked",
    "promotionStatus": "blocked",
    "allowedEarlyTests": [
      "rewarded hint",
      "cosmetic unlock",
      "remove ads"
    ],
    "blockedBeforeRetention": [
      "subscription",
      "interstitial during first session",
      "paywalled core rules"
    ]
  },
  "adNetwork": {
    "provider": "google-adsense-web-first",
    "publisherId": null,
    "sellerRelationship": "DIRECT",
    "certificationAuthorityId": "f08c47fec0942fa0",
    "web": {
      "provider": "google-adsense",
      "clientId": null,
      "rewardedSlotId": null,
      "configured": false
    },
    "app": {
      "provider": "google-admob",
      "publisherId": null,
      "configured": false
    }
  },
  "placements": [
    {
      "id": "rewarded-hint-after-failed-daily",
      "type": "rewarded",
      "status": "disabled",
      "firstChannel": "web-pwa",
      "trigger": "after a completed failed run, never before the first game ends",
      "reward": "one optional strategy hint or cosmetic board accent",
      "frequencyCap": "max 1 offer per anonymous session",
      "estimatedUserRisk": "low",
      "telemetry": [
        "rewarded_ad_available",
        "rewarded_ad_started",
        "rewarded_ad_completed",
        "revenue_cents"
      ]
    },
    {
      "id": "cosmetic-unlock-result-skin",
      "type": "cosmetic",
      "status": "disabled",
      "firstChannel": "web-pwa",
      "trigger": "result screen only",
      "reward": "alternate result-card look with no gameplay advantage",
      "frequencyCap": "offer after repeat play only",
      "estimatedUserRisk": "low",
      "telemetry": [
        "cosmetic_offer_viewed",
        "cosmetic_offer_clicked",
        "revenue_cents"
      ]
    }
  ],
  "blockers": [
    "First-game completion is 40%; gate is 55%.",
    "Replay rate is 31%; gate is 35%.",
    "D1 retention is 17%; gate is 18%; source is fixture-retention.",
    "Web/PWA or native ad provider is not configured for gated revenue tests."
  ],
  "launchCandidate": {
    "gameId": "market-pulse",
    "title": "Market Pulse",
    "pagePath": "/games/market-pulse.html",
    "qualityScore": 78
  },
  "compliance": {
    "privacyPolicyPath": "/privacy.html",
    "privacyPolicyStatus": "hosted",
    "appAdsTxtPath": "/app-ads.txt",
    "adDisclosureRequiredWhenEnabled": true,
    "purchasesDisabledUntilExplicitGate": true
  },
  "safety": {
    "neverEnableBeforeRetention": [
      "subscription",
      "interstitial during first session",
      "paywalled core rules"
    ],
    "firstAllowedPlacement": "rewarded-hint-after-failed-daily",
    "noInterstitialsInFirstSession": true,
    "noPaywalledCoreRules": true
  },
  "runtime": {
    "status": "guarded-disabled",
    "surface": "result-screen",
    "firstPlacementId": "rewarded-hint-after-failed-daily",
    "requiresCompletedRun": true,
    "requiresFailedRun": true,
    "maxOffersPerSession": 1,
    "disabledReason": "First-game completion is 40%; gate is 55%.",
    "blockedEventsWhenDisabled": [
      "rewarded_ad_started",
      "rewarded_ad_completed",
      "revenue_cents"
    ],
    "webAdapter": "adsense-not-configured",
    "appAdapter": "admob-not-configured"
  }
} as const

export type MonetizationPlan = typeof monetizationPlan
