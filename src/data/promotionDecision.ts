export const promotionDecision = {
  "generatedAt": "2026-05-25T07:11:36.445Z",
  "analyticsSource": "fixture-sample",
  "releaseHealth": {
    "status": "monitoring",
    "canPromoteWeb": true,
    "canDeploy": true,
    "monetizationAllowed": false
  },
  "decisions": [
    {
      "channel": "web-pwa",
      "status": "promotable-internal",
      "decision": "Promote the current PWA build to an internal/public web experiment when hosting is connected.",
      "blockers": [],
      "nextAction": "Connect a free static host or GitHub Pages environment, then publish dist."
    },
    {
      "channel": "monetization",
      "status": "blocked",
      "decision": "Keep revenue features disabled.",
      "blockers": [
        "First-game completion is 40%; gate is 55%.",
        "Replay rate is 31%; gate is 35%.",
        "D1 retention is 17%; gate is 18%; source is fixture-retention."
      ],
      "nextAction": "Collect live completion, replay, and retention data until gates pass."
    },
    {
      "channel": "android-google-play",
      "status": "blocked",
      "decision": "Keep Android packaging blocked.",
      "blockers": [
        "Google Play developer account is not connected."
      ],
      "nextAction": "Connect the Google Play developer account."
    },
    {
      "channel": "ios-app-store",
      "status": "defer",
      "decision": "Defer iOS spend.",
      "blockers": [
        "Revenue signal is $0.00, below $99.00.",
        "Apple Developer account is not connected."
      ],
      "nextAction": "Wait for revenue signal and hosted compliance URLs before paying annual Apple cost."
    }
  ],
  "summary": {
    "nextChannel": "web-pwa",
    "blockedPaidChannels": [
      "monetization",
      "android-google-play",
      "ios-app-store"
    ],
    "costPosture": "no-new-spend"
  }
} as const

export type PromotionDecision = typeof promotionDecision
