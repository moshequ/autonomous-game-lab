export const unitEconomics = {
  "generatedAt": "2026-05-25T19:07:14.249Z",
  "status": "no-spend",
  "analyticsSource": "fixture-sample",
  "projectionConfidence": "low-fixture-or-zero",
  "costPosture": "zero-paid-spend-until-live-revenue-and-retention-pass",
  "observed": {
    "gameViews": 580,
    "gameStarts": 375,
    "revenueCents": 0,
    "revenueUsd": 0,
    "revenuePerStartedGameCents": 0,
    "revenuePerViewCents": 0
  },
  "projections": {
    "basis": "fixture/local-free fallback; not valid for paid spend",
    "lookbackDays": null,
    "estimatedDailyRevenueCents": 0,
    "projectedMonthlyRevenueCents": 0,
    "projectedAnnualRevenueCents": 0
  },
  "productGates": {
    "firstGameCompletion": {
      "actual": 0.397,
      "required": 0.55,
      "pass": false
    },
    "replayRate": {
      "actual": 0.309,
      "required": 0.35,
      "pass": false
    },
    "d1Retention": {
      "actual": 0.167,
      "required": 0.18,
      "pass": false
    },
    "retentionReady": false,
    "revenueSignalPresent": false
  },
  "storeFees": {
    "googlePlay": {
      "costUsd": 25,
      "type": "one-time-developer-account",
      "allowed": false,
      "paybackDays": null,
      "blockers": [
        "Google Play developer account is not connected.",
        "No live revenue signal yet.",
        "Projected Google Play fee payback is not within 60 days."
      ]
    },
    "iosAppStore": {
      "costUsd": 99,
      "type": "annual-developer-account",
      "allowed": false,
      "paybackDays": null,
      "blockers": [
        "Revenue signal is $0.00, below $99.00.",
        "Apple Developer account is not connected.",
        "Projected annual revenue is $0.00, below $99.00.",
        "Projected Apple fee payback is not within 90 days."
      ]
    }
  },
  "storePaybackLadder": {
    "status": "waiting-for-live-revenue",
    "source": {
      "analyticsSource": "fixture-sample",
      "projectionConfidence": "low-fixture-or-zero",
      "lookbackDays": null,
      "revenueSignalPresent": false,
      "basis": "fixture/local-free fallback; not valid for paid spend"
    },
    "controls": {
      "zeroPaidSpendUntilPayback": true,
      "noPaidStoreFeesUntilSpendAllowed": true,
      "noAccountCreationUntilSpendAllowed": true,
      "noStoreSubmissionUntilSpendAllowed": true,
      "noRevenueEnablementUntilProductGatesPass": true,
      "requiresLiveRevenue": true,
      "fixtureEvidenceCannotClear": true
    },
    "evidenceNeeded": [
      "live-revenue-signal",
      "passing-retention-and-engagement-gates",
      "configured-revenue-provider",
      "google-play-payback-and-account-clearance",
      "ios-payback-and-account-clearance"
    ],
    "channels": {
      "googlePlay": {
        "id": "google-play",
        "label": "Google Play",
        "type": "one-time-developer-account",
        "costUsd": 25,
        "paybackWindowDays": 60,
        "currentPaybackDays": null,
        "currentDailyRevenueCents": 0,
        "currentMonthlyRevenueCents": 0,
        "currentAnnualRevenueCents": 0,
        "requiredDailyRevenueCents": 42,
        "requiredDailyRevenueUsd": 0.42,
        "requiredMonthlyRevenueCents": 1260,
        "requiredMonthlyRevenueUsd": 12.6,
        "requiredAnnualRevenueCents": 15330,
        "requiredAnnualRevenueUsd": 153.3,
        "requiredAnnualFloorCents": 15330,
        "requiredAnnualFloorUsd": 153.3,
        "requiredRevenuePerStartedGameCents": null,
        "additionalDailyRevenueCentsNeeded": 42,
        "additionalMonthlyRevenueCentsNeeded": 1260,
        "additionalAnnualRevenueCentsNeeded": 15330,
        "paybackReady": false,
        "annualRevenueReady": true,
        "spendAllowed": false,
        "blockers": [
          "Google Play developer account is not connected.",
          "No live revenue signal yet.",
          "Projected Google Play fee payback is not within 60 days."
        ]
      },
      "iosAppStore": {
        "id": "ios-app-store",
        "label": "iOS App Store",
        "type": "annual-developer-account",
        "costUsd": 99,
        "paybackWindowDays": 90,
        "currentPaybackDays": null,
        "currentDailyRevenueCents": 0,
        "currentMonthlyRevenueCents": 0,
        "currentAnnualRevenueCents": 0,
        "requiredDailyRevenueCents": 110,
        "requiredDailyRevenueUsd": 1.1,
        "requiredMonthlyRevenueCents": 3300,
        "requiredMonthlyRevenueUsd": 33,
        "requiredAnnualRevenueCents": 40150,
        "requiredAnnualRevenueUsd": 401.5,
        "requiredAnnualFloorCents": 40150,
        "requiredAnnualFloorUsd": 401.5,
        "requiredRevenuePerStartedGameCents": null,
        "additionalDailyRevenueCentsNeeded": 110,
        "additionalMonthlyRevenueCentsNeeded": 3300,
        "additionalAnnualRevenueCentsNeeded": 40150,
        "paybackReady": false,
        "annualRevenueReady": false,
        "spendAllowed": false,
        "blockers": [
          "Revenue signal is $0.00, below $99.00.",
          "Apple Developer account is not connected.",
          "Projected annual revenue is $0.00, below $99.00.",
          "Projected Apple fee payback is not within 90 days."
        ]
      }
    }
  },
  "controls": {
    "spendGuardActive": true,
    "spendMode": "no-spend",
    "maxDailySpendUsd": 0,
    "paidAcquisitionAllowed": false,
    "storeSpendAllowed": false,
    "monetizationSpendAllowed": false,
    "requiresHumanApprovalForSpendAboveUsd": 0,
    "noPaidAcquisitionBeforeRevenue": true,
    "noStoreFeesBeforePayback": true,
    "noInterstitialsBeforeRetention": true
  },
  "promotion": {
    "web": "promotable-internal",
    "monetization": "blocked",
    "androidGooglePlay": "blocked",
    "iosAppStore": "defer"
  },
  "recommendations": [
    {
      "id": "stay-web-organic",
      "action": "Keep traffic on the free web/PWA loop and generated organic pages.",
      "reason": "Current analytics are fixture or local-only, so spend decisions would be speculation."
    },
    {
      "id": "hold-paid-acquisition",
      "action": "Do not run paid acquisition.",
      "reason": "Paid acquisition needs live revenue plus passing retention gates."
    },
    {
      "id": "hold-store-fees",
      "action": "Do not pay app-store account fees yet.",
      "reason": "Store fees remain blocked until hosted compliance URLs, credentials, revenue, and payback gates clear."
    }
  ]
} as const

export type UnitEconomics = typeof unitEconomics
