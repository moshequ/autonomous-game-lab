export const iosRelease = {
  "generatedAt": "2026-05-22T09:13:03.568Z",
  "sourceDataHash": "bca243f7cbb7",
  "status": "deferred-until-ios-payback",
  "platform": "ios-app-store",
  "bundleId": "app.autonomousgamelab.portal",
  "appName": "Autonomous Game Lab",
  "publicOrigin": "https://moshequ.github.io/autonomous-game-lab",
  "costGate": {
    "appleDeveloperProgramAnnualUsd": 99,
    "spendAllowed": false,
    "feeAllowed": false,
    "paybackDays": null
  },
  "strategy": {
    "packageStrategy": "capacitor-pwa-shell-after-payback",
    "nativeProjectDeferred": true,
    "xcodeProjectCreated": false,
    "appStoreConnectUploadDeferred": true,
    "reason": "Prepare metadata, privacy, screenshots, and native-value evidence now; create the iOS project only after payback and Apple account gates clear."
  },
  "handoff": {
    "directory": "native/ios",
    "capacitorConfigPath": "native/ios/capacitor.config.json",
    "appStoreHandoffPath": "native/ios/app-store-handoff.json",
    "readmePath": "native/ios/README.md"
  },
  "sourceStatus": {
    "promotion": "defer",
    "appleDeveloperAccountConnected": false,
    "appStoreConnectApiConfigured": false,
    "storePackage": "store-package-ready",
    "storeCompliance": "draft-ready-external-blockers",
    "storeAssets": "screenshots-ready",
    "unitEconomics": "no-spend"
  },
  "appLikeValueEvidence": [
    "10 playable original games in the catalog.",
    "PWA install loop is pwa-install-loop-ready.",
    "Retention loop is retention-loop-ready.",
    "Completion loop is completion-loop-ready.",
    "Replay loop is replay-loop-ready.",
    "Native shell is deferred until payback and Apple account gates clear to avoid a thin-wrapper submission."
  ],
  "checks": [
    {
      "id": "store-listing",
      "status": "pass",
      "detail": "Store listing metadata is ready for App Store Connect draft entry."
    },
    {
      "id": "apple-privacy-labels",
      "status": "pass",
      "detail": "Apple App Privacy labels are drafted from the store package."
    },
    {
      "id": "age-rating",
      "status": "pass",
      "detail": "Apple 4+ age-rating answers are drafted."
    },
    {
      "id": "store-screenshots",
      "status": "pass",
      "detail": "4 screenshot asset(s) are available."
    },
    {
      "id": "hosted-privacy-url",
      "status": "pass",
      "detail": "Hosted privacy policy URL is available for App Review."
    },
    {
      "id": "support-contact",
      "status": "external-blocker",
      "detail": "Production support email is required before public store submission."
    },
    {
      "id": "native-app-like-value",
      "status": "pass",
      "detail": "PWA install, daily challenge, completion, replay, and multi-game catalog evidence prepare the native-value review story."
    },
    {
      "id": "apple-developer-account",
      "status": "deferred-paid-account",
      "detail": "Apple Developer Program account is not connected."
    },
    {
      "id": "app-store-connect-api",
      "status": "missing-env",
      "detail": "App Store Connect API credentials are not available to CI."
    },
    {
      "id": "annual-fee-payback",
      "status": "held-by-economics",
      "detail": "Store spend allowed is false; projected Apple payback is not available."
    }
  ],
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
  },
  "controls": {
    "zeroPaidSpend": true,
    "noAppleAccountCreation": true,
    "noStoreSubmission": true,
    "noIapSetupUntilDigitalPurchases": true,
    "noXcodeProjectGenerated": true,
    "requiresHumanStoreReview": true
  }
} as const

export type IosRelease = typeof iosRelease
