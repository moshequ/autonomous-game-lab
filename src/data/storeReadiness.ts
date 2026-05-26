export const storeReadiness = {
  "generatedAt": "2026-05-26T10:56:00.219Z",
  "sourceDataHash": "42f032b84872",
  "status": "store-readiness-prepared-external-blockers",
  "sourceStatus": {
    "storePackage": "store-package-ready",
    "storeCompliance": "draft-ready-external-blockers",
    "storeListingOptimizer": "store-listing-optimizer-ready",
    "nativePackage": "ready-for-bubblewrap-build",
    "androidRelease": "blocked-needs-host-signing-play",
    "iosRelease": "deferred-until-ios-payback",
    "unitEconomics": "no-spend",
    "monetization": "blocked-by-product-gates",
    "productionEnvironment": "production-env-missing",
    "storeAssets": "screenshots-ready"
  },
  "summary": {
    "launchCandidateId": "market-pulse",
    "launchCandidateTitle": "Market Pulse",
    "complianceStatus": "draft-ready-external-blockers",
    "androidStatus": "blocked-needs-host-signing-play",
    "iosStatus": "deferred-until-ios-payback",
    "nativePackageStatus": "ready-for-bubblewrap-build",
    "storeSpendAllowed": false,
    "revenueEnabled": false,
    "storePaybackStatus": "waiting-for-live-revenue",
    "screenshotCount": 4,
    "externalBlockerCount": 14,
    "productBlockerCount": 11
  },
  "publicRoutes": {
    "storeReadiness": "/store-readiness.html",
    "storeReadinessJson": "/store-readiness.json",
    "privacy": "/privacy.html",
    "support": "/support.html",
    "compliance": "/compliance.json",
    "monetization": "/monetization.html",
    "monetizationJson": "/monetization.json",
    "measurementStatus": "/measurement-status.html",
    "appAdsTxt": "/app-ads.txt"
  },
  "storeOwnerUnlockSummary": {
    "status": "waiting-on-owner-input",
    "nextUnlockId": "support-contact",
    "lowestInputUnlockId": "support-contact",
    "lowestInputMissingInputCount": 1,
    "lowestInputMissingSecretCount": 0,
    "lowestInputReason": "Production support contact currently needs 1 owner input(s) and can be done without store spend.",
    "immediateUnlocks": [
      "support-contact"
    ],
    "gatedUnlocks": [
      "google-play-account",
      "ios-app-store-account"
    ],
    "controls": {
      "noAccountCreation": true,
      "noStoreSubmission": true,
      "noRevenueEnablement": true,
      "noSecretValuesStored": true,
      "storeSpendStillBlocked": true
    }
  },
  "supportOwnerInputPack": {
    "unlockId": "support-contact",
    "title": "Production support contact",
    "status": "needs-production-support-email",
    "readyForSetup": false,
    "repositoryMissingInputCount": 1,
    "missingInputCount": 1,
    "secretInputCount": 0,
    "missingInputNames": [
      "AGL_SUPPORT_EMAIL"
    ],
    "localEnvFile": ".env.production.local",
    "localEnvTemplateLines": [
      "AGL_SUPPORT_EMAIL="
    ],
    "shellExportTemplateLines": [
      "export AGL_SUPPORT_EMAIL="
    ],
    "inputInstructions": [
      {
        "kind": "github-variable",
        "repositoryName": "AGL_SUPPORT_EMAIL",
        "envName": "AGL_SUPPORT_EMAIL",
        "ready": false,
        "configuredInRepository": false,
        "availableLocally": false,
        "availableInLocalEnvFile": true,
        "localEnvFiles": [
          ".env.production.local"
        ],
        "validation": {
          "kind": "email-shape",
          "status": "not-checked-missing-input",
          "detail": "No local support email is available yet; email shape will be validated before setup can sync it.",
          "expected": {
            "containsAt": true,
            "hasDomain": true,
            "noWhitespace": true
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "AGL_SUPPORT_EMAIL must be exported before setup can sync it."
            }
          ]
        },
        "command": "gh variable set AGL_SUPPORT_EMAIL --body \"$AGL_SUPPORT_EMAIL\""
      }
    ],
    "commands": {
      "npmWriteLocalEnvTemplate": "npm run autonomous:support-input-template",
      "writeLocalEnvTemplate": "node scripts/store-readiness-page.mjs --write-local-env-template",
      "setupWriteLocalEnvTemplate": "./ops/github/setup-production.sh --support-input-template",
      "validate": "npm run autonomous:store-readiness",
      "syncConfiguredValues": "./ops/github/setup-production.sh",
      "refreshStoreReadiness": "npm run autonomous:store-readiness"
    },
    "controls": {
      "zeroPaidSpend": true,
      "noSecretValuesStored": true,
      "noSecretValuesSerialized": true,
      "noMutation": true,
      "noWorkflowDispatch": true,
      "noAccountCreation": true,
      "noStoreSubmission": true,
      "noRevenueEnablement": true,
      "gitIgnoredLocalEnvFile": true,
      "localTemplateWriteNoSecretValues": true,
      "localTemplateWritePreservesExistingValues": true,
      "localTemplateWriteNoGithubMutation": true,
      "onlySupportContactInput": true
    }
  },
  "storeOwnerUnlocks": [
    {
      "id": "support-contact",
      "title": "Production support contact",
      "status": "needs-production-support-email",
      "costMode": "zero-spend-use-existing-support-address",
      "ownerInputRequired": true,
      "canApplyBeforeProductGates": true,
      "storeSubmissionStillBlocked": true,
      "missingVariableCount": 1,
      "missingSecretCount": 0,
      "missingInputCount": 1,
      "missingVariables": [
        {
          "type": "github-variable",
          "repositoryName": "AGL_SUPPORT_EMAIL",
          "envName": "AGL_SUPPORT_EMAIL",
          "configured": false,
          "command": "gh variable set AGL_SUPPORT_EMAIL --body \"$AGL_SUPPORT_EMAIL\"",
          "purpose": "Public support contact for privacy and store listings."
        }
      ],
      "missingSecrets": [],
      "configuredVariables": [],
      "configuredSecrets": [],
      "setupCommands": [
        "./ops/github/setup-production.sh --support-input-template",
        "gh variable set AGL_SUPPORT_EMAIL --body \"$AGL_SUPPORT_EMAIL\"",
        "npm run autonomous:store-package",
        "npm run autonomous:store-compliance",
        "npm run autonomous:store-readiness",
        "npm run autonomous:readiness"
      ],
      "validationCommands": [
        "npm run autonomous:store-readiness",
        "npm run test:e2e"
      ],
      "blockersCleared": [
        "support-contact"
      ]
    },
    {
      "id": "google-play-account",
      "title": "Google Play account and upload credential",
      "status": "gated-by-store-spend-and-product-signals",
      "costMode": "paid-store-account-gated-by-unit-economics",
      "ownerInputRequired": true,
      "canApplyBeforeProductGates": false,
      "storeSubmissionStillBlocked": true,
      "missingVariableCount": 1,
      "missingSecretCount": 1,
      "missingInputCount": 2,
      "missingVariables": [
        {
          "type": "github-variable",
          "repositoryName": "AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED",
          "envName": "AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED",
          "configured": false,
          "command": "gh variable set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED --body \"$AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED\"",
          "purpose": "Marks Play Console access as connected after the owner creates or connects the account."
        }
      ],
      "missingSecrets": [
        {
          "type": "github-secret",
          "repositoryName": "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
          "envName": "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
          "configured": false,
          "command": "printf \"%s\" \"$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON\" | gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
          "purpose": "CI upload credential for Android release workflow."
        }
      ],
      "configuredVariables": [],
      "configuredSecrets": [],
      "setupCommands": [
        "npm run autonomous:native-package",
        "npm run autonomous:android-release-plan",
        "npm run autonomous:store-readiness",
        "npm run autonomous:readiness"
      ],
      "validationCommands": [
        "npm run autonomous:android-release-plan",
        "npm run autonomous:store-readiness",
        "npm run test:e2e"
      ],
      "blockersCleared": [
        "google-play-account",
        "play-service-account"
      ]
    },
    {
      "id": "ios-app-store-account",
      "title": "Apple Developer and App Store Connect",
      "status": "deferred-until-ios-payback",
      "costMode": "annual-fee-deferred-until-payback",
      "ownerInputRequired": true,
      "canApplyBeforeProductGates": false,
      "storeSubmissionStillBlocked": true,
      "missingVariableCount": 0,
      "missingSecretCount": 0,
      "missingInputCount": 0,
      "missingVariables": [],
      "missingSecrets": [],
      "configuredVariables": [],
      "configuredSecrets": [],
      "setupCommands": [
        "npm run autonomous:ios-release-plan",
        "npm run autonomous:store-readiness"
      ],
      "validationCommands": [
        "npm run autonomous:ios-release-plan",
        "npm run autonomous:store-readiness"
      ],
      "blockersCleared": [
        "apple-developer-account",
        "app-store-connect-api"
      ]
    }
  ],
  "platformHandoffs": [
    {
      "id": "web-pwa",
      "label": "Web PWA",
      "status": "public-compliance-published",
      "route": "/",
      "package": {
        "privacy": "/privacy.html",
        "support": "/support.html",
        "compliance": "/compliance.json"
      },
      "checks": [
        {
          "id": "privacy",
          "status": "pass",
          "detail": "hosted"
        },
        {
          "id": "support",
          "status": "external-blocker",
          "detail": "needs-production-address"
        },
        {
          "id": "compliance",
          "status": "pass",
          "detail": "draft-ready-external-blockers"
        }
      ]
    },
    {
      "id": "android-google-play",
      "label": "Android Google Play",
      "status": "blocked-needs-host-signing-play",
      "packageName": "app.autonomousgamelab.portal",
      "releaseTrack": "internal",
      "packageStrategy": "android-trusted-web-activity",
      "workflowPath": ".github/workflows/android-twa-release.yml",
      "blockers": [
        "google-play-account: Google Play account is not connected.",
        "play-service-account: Google Play service account upload credentials are not available to CI.",
        "unit-economics-store-spend: Store spend allowed is false; spend mode is no-spend.",
        "promotion-gate: Android promotion status is blocked."
      ],
      "setupRequiredOnce": [
        "Host the PWA on a stable HTTPS production domain with privacy and support URLs.",
        "Use production bootstrap to sync the prepared AGL_ANDROID_* signing values into CI secrets when repository credentials exist.",
        "Connect Google Play only after unit economics allows the one-time store fee.",
        "Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON or GOOGLE_PLAY_SERVICE_ACCOUNT_BASE64 before automated internal testing uploads."
      ],
      "commands": {
        "plan": "npm run autonomous:android-release-plan",
        "nativePackage": "npm run autonomous:native-package",
        "validate": "npx @bubblewrap/cli validate",
        "build": "npx @bubblewrap/cli build",
        "releaseWorkflow": "Run Android TWA Release after host, signing, Play, and economics gates pass."
      }
    },
    {
      "id": "ios-app-store",
      "label": "iOS App Store",
      "status": "deferred-until-ios-payback",
      "bundleId": "app.autonomousgamelab.portal",
      "packageStrategy": "capacitor-pwa-shell-after-payback",
      "handoffDirectory": "native/ios",
      "blockers": [
        "support-contact: Production support email is required before public store submission.",
        "apple-developer-account: Apple Developer Program account is not connected.",
        "app-store-connect-api: App Store Connect API credentials are not available to CI.",
        "annual-fee-payback: Store spend allowed is false; projected Apple payback is not available."
      ],
      "setupRequiredOnce": [
        "Keep the PWA hosted with privacy and support URLs reachable before App Review.",
        "Connect Apple Developer Program only after live revenue justifies the annual fee.",
        "Set App Store Connect API credentials only after the Apple account exists and store spend is allowed.",
        "Run Capacitor/Xcode packaging only after native-value, privacy, account, and payback gates pass."
      ],
      "commands": {
        "plan": "npm run autonomous:ios-release-plan",
        "installCapacitor": "npm install @capacitor/core @capacitor/ios",
        "createNativeProject": "npx cap add ios",
        "syncWebBuild": "npx cap sync ios",
        "archive": "Open native iOS project in Xcode and archive only after gates pass."
      }
    }
  ],
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
  "checks": [
    {
      "id": "store-package",
      "status": "pass",
      "detail": "Store package is store-package-ready."
    },
    {
      "id": "store-compliance",
      "status": "pass",
      "detail": "Store compliance draft is draft-ready-external-blockers."
    },
    {
      "id": "store-listing",
      "status": "pass",
      "detail": "Store listing optimizer is store-listing-optimizer-ready."
    },
    {
      "id": "store-screenshots",
      "status": "pass",
      "detail": "4 screenshot asset(s) are available."
    },
    {
      "id": "native-package",
      "status": "pass",
      "detail": "Native Android package handoff is ready-for-bubblewrap-build."
    },
    {
      "id": "android-release",
      "status": "pass",
      "detail": "Android release plan is blocked-needs-host-signing-play."
    },
    {
      "id": "ios-release",
      "status": "pass",
      "detail": "iOS handoff is deferred-until-ios-payback."
    },
    {
      "id": "unit-economics",
      "status": "external-blocker",
      "detail": "Store spend allowed is false."
    },
    {
      "id": "monetization",
      "status": "blocker",
      "detail": "Revenue enabled is false."
    },
    {
      "id": "support-contact",
      "status": "external-blocker",
      "detail": "Production support email is required before public app-store submission."
    }
  ],
  "blockers": {
    "external": [
      "store-compliance: support-contact: Production support email is required before public store submission.",
      "store-compliance: google-play-account: Google Play developer account must be connected before Android submission.",
      "store-compliance: apple-developer-account: Apple Developer account remains deferred until iOS spend is justified.",
      "android: google-play-account: Google Play account is not connected.",
      "android: play-service-account: Google Play service account upload credentials are not available to CI.",
      "ios: support-contact: Production support email is required before public store submission.",
      "ios: apple-developer-account: Apple Developer Program account is not connected.",
      "ios: app-store-connect-api: App Store Connect API credentials are not available to CI.",
      "monetization: Web/PWA or native ad provider is not configured for gated revenue tests.",
      "google-play-fee: Google Play developer account is not connected.",
      "ios-fee: Apple Developer account is not connected.",
      "ios-fee: Projected annual revenue is $0.00, below $99.00.",
      "monetization: Revenue enabled is false.",
      "support-contact: Production support email is required before public app-store submission."
    ],
    "product": [
      "android: unit-economics-store-spend: Store spend allowed is false; spend mode is no-spend.",
      "android: promotion-gate: Android promotion status is blocked.",
      "ios: annual-fee-payback: Store spend allowed is false; projected Apple payback is not available.",
      "monetization: First-game completion is 40%; gate is 55%.",
      "monetization: Replay rate is 31%; gate is 35%.",
      "monetization: D1 retention is 17%; gate is 18%; source is fixture-retention.",
      "google-play-fee: No live revenue signal yet.",
      "google-play-fee: Projected Google Play fee payback is not within 60 days.",
      "ios-fee: Revenue signal is $0.00, below $99.00.",
      "ios-fee: Projected Apple fee payback is not within 90 days.",
      "unit-economics: Store spend allowed is false."
    ]
  },
  "controls": {
    "zeroPaidSpend": true,
    "noPaidSpend": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noAccountCreation": true,
    "noSecretValues": true,
    "ownerInputsRequired": true,
    "storeSpendStillBlocked": true,
    "postDeploySmokeRequired": true
  }
} as const

export type StoreReadiness = typeof storeReadiness
