export const androidRelease = {
  "generatedAt": "2026-05-19T02:57:33.056Z",
  "status": "blocked-needs-host-signing-play",
  "envFiles": {
    "loaded": true,
    "loadedFiles": [
      {
        "path": "ops/production.env.local",
        "keys": [
          "AGL_ANDROID_PACKAGE_NAME",
          "AGL_ANDROID_SHA256_CERT_FINGERPRINT",
          "AGL_ANDROID_KEYSTORE_BASE64",
          "AGL_ANDROID_KEYSTORE_PASSWORD",
          "AGL_ANDROID_KEY_ALIAS"
        ]
      }
    ],
    "loadedKeys": [
      "AGL_ANDROID_PACKAGE_NAME",
      "AGL_ANDROID_SHA256_CERT_FINGERPRINT",
      "AGL_ANDROID_KEYSTORE_BASE64",
      "AGL_ANDROID_KEYSTORE_PASSWORD",
      "AGL_ANDROID_KEY_ALIAS"
    ],
    "skippedExistingKeys": [],
    "skippedProtectedKeys": [],
    "overwrittenEnvFileKeys": [],
    "supportedFiles": [
      ".env",
      ".env.local",
      ".env.production",
      ".env.production.local",
      "ops/production.env",
      "ops/production.env.local"
    ],
    "candidateFiles": [
      ".env",
      ".env.local",
      ".env.production",
      ".env.production.local",
      "ops/production.env",
      "ops/production.env.local"
    ],
    "shellEnvPrecedence": true,
    "valuesRedacted": true,
    "controls": {
      "shellEnvPrecedence": true,
      "laterEnvFilesOverrideEarlierEnvFiles": true,
      "protectedMutationKeysRequireShellEnv": true,
      "noSecretValuesInReports": true,
      "gitIgnoredLocalEnvFiles": true
    }
  },
  "platform": "android-trusted-web-activity",
  "channel": "android-google-play",
  "costPosture": "zero-paid-spend-until-live-revenue-and-retention-pass",
  "packageName": "app.autonomousgamelab.portal",
  "releaseTrack": "internal",
  "releaseMode": "draft",
  "nativePackageStatus": "blocked-draft-ready",
  "signingStatus": "signing-prepared",
  "storeComplianceStatus": "draft-ready-external-blockers",
  "promotionStatus": "blocked",
  "workflow": {
    "path": ".github/workflows/android-twa-release.yml",
    "status": "present",
    "buildsWhenReady": false
  },
  "artifacts": {
    "handoffDirectory": "native/android",
    "twaManifestPath": "native/android/twa-manifest.json",
    "bubblewrapConfigPath": "native/android/bubblewrap.config.json",
    "assetLinksPath": "native/android/assetlinks.template.json",
    "expectedAabPath": "native/android/app-release-bundle.aab",
    "expectedApkPath": "native/android/app-release-signed.apk"
  },
  "gates": {
    "storeSpendAllowed": false,
    "googlePlayFeeAllowed": false,
    "paybackDays": null,
    "hostedPrivacyStatus": "needs-hosted-domain",
    "assetLinksStatus": "template-only",
    "signingFingerprint": "FC:92:04:44:5B:93:78:92:A9:8C:08:50:BF:97:7A:90:A5:62:61:81:53:E7:A9:AA:A9:39:86:74:AE:D3:52:C2",
    "localSigningSecretsConfigured": true
  },
  "checks": [
    {
      "id": "native-package-ready",
      "status": "blocker",
      "detail": "Native package is blocked-draft-ready."
    },
    {
      "id": "store-package-draft",
      "status": "pass",
      "detail": "Store package is draft-ready; data safety is draft-ready."
    },
    {
      "id": "store-compliance-draft",
      "status": "pass",
      "detail": "Store compliance is draft-ready-external-blockers."
    },
    {
      "id": "store-screenshots",
      "status": "pass",
      "detail": "4 screenshot asset(s) are available."
    },
    {
      "id": "asset-links",
      "status": "blocker",
      "detail": "Digital Asset Links are template-only."
    },
    {
      "id": "signing-fingerprint",
      "status": "pass",
      "detail": "Android signing fingerprint is configured."
    },
    {
      "id": "signing-secrets",
      "status": "pass",
      "detail": "Android keystore, password, and alias are available to CI."
    },
    {
      "id": "google-play-account",
      "status": "missing-env",
      "detail": "Google Play account is not connected."
    },
    {
      "id": "play-service-account",
      "status": "missing-env",
      "detail": "Google Play service account upload credentials are available to CI."
    },
    {
      "id": "unit-economics-store-spend",
      "status": "held-by-economics",
      "detail": "Store spend allowed is false; spend mode is no-spend."
    },
    {
      "id": "promotion-gate",
      "status": "blocker",
      "detail": "Android promotion status is blocked."
    },
    {
      "id": "release-workflow",
      "status": "pass",
      "detail": "Android TWA release workflow exists."
    }
  ],
  "blockers": [
    "native-package-ready: Native package is blocked-draft-ready.",
    "asset-links: Digital Asset Links are template-only.",
    "google-play-account: Google Play account is not connected.",
    "play-service-account: Google Play service account upload credentials are available to CI.",
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
} as const

export type AndroidRelease = typeof androidRelease
