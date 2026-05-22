export const storeCompliance = {
  "generatedAt": "2026-05-22T02:09:48.239Z",
  "sourceDataHash": "c608c8272798",
  "status": "draft-ready-external-blockers",
  "launchCandidate": {
    "id": "market-pulse",
    "title": "Market Pulse",
    "status": "generated-playable"
  },
  "policyPosture": "no-accounts-no-ugc-no-gambling-no-paid-spend",
  "contentRating": {
    "googlePlay": {
      "questionnaireStatus": "draft-ready",
      "expectedRating": "Everyone",
      "descriptors": [],
      "answers": {
        "violence": "none",
        "fear": "none",
        "sexualContent": "none",
        "language": "none",
        "controlledSubstances": "none",
        "gambling": "none",
        "simulatedGambling": false,
        "userGeneratedContent": false,
        "realMoneyPrizes": false,
        "locationSharing": false
      },
      "evidence": [
        "No gambling",
        "No real-money prizes",
        "No user-generated content in first release",
        "Ads disabled until retention gates pass"
      ]
    },
    "appleAppStore": {
      "ageRatingStatus": "draft-ready",
      "expectedRating": "4+",
      "answers": {
        "cartoonViolence": "none",
        "realisticViolence": "none",
        "profanity": "none",
        "matureThemes": "none",
        "simulatedGambling": "none",
        "contests": "none",
        "unrestrictedWebAccess": false,
        "userGeneratedContent": false,
        "gamblingAndContests": false
      },
      "evidence": [
        "No gambling",
        "No real-money prizes",
        "No user-generated content in first release",
        "Ads disabled until retention gates pass"
      ]
    }
  },
  "targetAudience": {
    "status": "draft-ready",
    "directedToChildren": false,
    "childrenUnder13Targeted": false,
    "targetAgeBands": [
      "13-15",
      "16-17",
      "18+"
    ],
    "familyPolicy": "not-designed-for-families-program",
    "rationale": "The app is a general-audience solo strategy puzzle portal with no child-directed branding, accounts, chat, UGC, gambling, or real-money prizes."
  },
  "adsAndMonetization": {
    "status": "ads-disabled",
    "adsEnabled": false,
    "adDisclosureRequired": false,
    "adDisclosureDraft": "Ads are disabled in the current release.",
    "inAppPurchasesEnabled": false,
    "subscriptionsEnabled": false,
    "paywalledCoreRules": false,
    "paidAcquisitionAllowed": false,
    "blockedTelemetryWhenDisabled": [
      "rewarded_ad_started",
      "rewarded_ad_completed",
      "revenue_cents"
    ]
  },
  "privacyAndData": {
    "status": "draft-ready",
    "privacyPolicyPath": "/privacy.html",
    "productionPrivacyUrlStatus": "hosted",
    "supportEmailStatus": "needs-production-address",
    "googleDataSafetyStatus": "draft-ready",
    "applePrivacyLabelStatus": "draft-ready",
    "dataLinkedToIdentity": false,
    "thirdPartySharing": false,
    "trackingForAds": false,
    "accountDeletion": "not-required-no-accounts",
    "optOutControl": "external-analytics-opt-out-in-app"
  },
  "appAccess": {
    "loginRequired": false,
    "reviewerCredentialsRequired": false,
    "accountDeletionUrlRequired": false,
    "purchasesRequireReviewAccount": false,
    "notes": "Reviewer can open the PWA/TWA directly. Accounts, purchases, ads, chat, and UGC are disabled until gates pass."
  },
  "checks": [
    {
      "id": "content-rating",
      "status": "pass",
      "detail": "Content rating drafts avoid gambling, UGC, real-money prizes, mature content, and unrestricted web access."
    },
    {
      "id": "target-audience",
      "status": "pass",
      "detail": "Target audience is general audience and not child-directed."
    },
    {
      "id": "ads-declaration",
      "status": "pass",
      "detail": "Ads declaration is ads-disabled; revenue enabled is false."
    },
    {
      "id": "privacy-data",
      "status": "pass",
      "detail": "Data safety, App Privacy labels, and account-deletion stance are drafted."
    },
    {
      "id": "app-access",
      "status": "pass",
      "detail": "Reviewer access does not require credentials because accounts are disabled."
    },
    {
      "id": "compliance-publication",
      "status": "pass",
      "detail": "Deployable compliance manifest ties privacy, support, and post-deploy smoke checks together."
    },
    {
      "id": "store-screenshots",
      "status": "pass",
      "detail": "4 generated screenshot asset(s) are available."
    },
    {
      "id": "hosted-privacy-url",
      "status": "pass",
      "detail": "Hosted privacy policy URL is required before public store submission."
    },
    {
      "id": "support-contact",
      "status": "external-blocker",
      "detail": "Production support email is required before public store submission."
    },
    {
      "id": "google-play-account",
      "status": "external-blocker",
      "detail": "Google Play developer account must be connected before Android submission."
    },
    {
      "id": "apple-developer-account",
      "status": "external-blocker",
      "detail": "Apple Developer account remains deferred until iOS spend is justified."
    }
  ],
  "blockers": [
    "support-contact: Production support email is required before public store submission.",
    "google-play-account: Google Play developer account must be connected before Android submission.",
    "apple-developer-account: Apple Developer account remains deferred until iOS spend is justified."
  ],
  "reviewerNotes": [
    "Autonomous Game Lab is a general-audience collection of original solo strategy puzzles.",
    "Current builds disable accounts, chat, UGC, purchases, subscriptions, gambling, real-money prizes, and ads.",
    "Anonymous gameplay analytics can be disabled with the in-app external analytics opt-out.",
    "Native app submission must wait for hosted privacy/support URLs, signing assets, store accounts, and final review."
  ],
  "nextActions": [
    "Resolve external blocker: Production support email is required before public store submission.",
    "Keep ads disabled until retention and ad-provider gates pass.",
    "Regenerate store compliance after every store package, monetization, or production-environment change."
  ]
} as const

export type StoreCompliance = typeof storeCompliance
