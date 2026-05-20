export const productionEnvironment = {
  "generatedAt": "2026-05-20T14:50:30.277Z",
  "status": "production-env-missing",
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
  "repositoryEnv": {
    "status": "inspected",
    "repository": "moshequ/autonomous-game-lab",
    "variables": [
      {
        "name": "AGL_ANDROID_PACKAGE_NAME",
        "configured": true
      },
      {
        "name": "AGL_ANDROID_SHA256_CERT_FINGERPRINT",
        "configured": true
      },
      {
        "name": "AGL_AUTONOMOUS_SELF_UPDATE",
        "configured": true
      },
      {
        "name": "AGL_AUTONOMOUS_SELF_UPDATE_DIRECT",
        "configured": true
      },
      {
        "name": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
        "configured": true
      },
      {
        "name": "AGL_EVENT_COLLECTOR_R2_BUCKET",
        "configured": true
      },
      {
        "name": "AGL_PUBLIC_ORIGIN",
        "configured": true
      },
      {
        "name": "PUBLIC_SITE_URL",
        "configured": true
      },
      {
        "name": "VITE_BASE_PATH",
        "configured": true
      },
      {
        "name": "VITE_PUBLIC_ORIGIN",
        "configured": true
      }
    ],
    "secrets": [
      {
        "name": "AGL_ANDROID_KEYSTORE_BASE64",
        "configured": true,
        "updatedAt": "2026-05-20T07:15:09Z"
      },
      {
        "name": "AGL_ANDROID_KEYSTORE_PASSWORD",
        "configured": true,
        "updatedAt": "2026-05-20T07:15:10Z"
      },
      {
        "name": "AGL_ANDROID_KEY_ALIAS",
        "configured": true,
        "updatedAt": "2026-05-20T07:15:11Z"
      },
      {
        "name": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
        "configured": true,
        "updatedAt": "2026-05-20T08:20:47Z"
      },
      {
        "name": "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
        "configured": true,
        "updatedAt": "2026-05-20T08:20:46Z"
      }
    ],
    "variableNames": [
      "AGL_ANDROID_PACKAGE_NAME",
      "AGL_ANDROID_SHA256_CERT_FINGERPRINT",
      "AGL_AUTONOMOUS_SELF_UPDATE",
      "AGL_AUTONOMOUS_SELF_UPDATE_DIRECT",
      "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
      "AGL_EVENT_COLLECTOR_R2_BUCKET",
      "AGL_PUBLIC_ORIGIN",
      "PUBLIC_SITE_URL",
      "VITE_BASE_PATH",
      "VITE_PUBLIC_ORIGIN"
    ],
    "secretNames": [
      "AGL_ANDROID_KEYSTORE_BASE64",
      "AGL_ANDROID_KEYSTORE_PASSWORD",
      "AGL_ANDROID_KEY_ALIAS",
      "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
      "VITE_EVENT_COLLECTOR_WRITE_TOKEN"
    ],
    "errors": [],
    "controls": {
      "readOnlyInspection": true,
      "secretValuesNeverRead": true,
      "noMutation": true
    }
  },
  "publicOrigin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab/",
    "source": "github-variable",
    "explicitOriginConfigured": true,
    "githubPagesCandidate": {
      "repository": "moshequ/autonomous-game-lab",
      "source": "origin-remote",
      "origin": "https://moshequ.github.io/autonomous-game-lab",
      "host": "moshequ.github.io",
      "basePath": "/autonomous-game-lab/",
      "privacyUrl": "https://moshequ.github.io/autonomous-game-lab/privacy.html",
      "supportUrl": "https://moshequ.github.io/autonomous-game-lab/support.html",
      "costUsd": 0
    },
    "status": "configured",
    "privacyUrl": "https://moshequ.github.io/autonomous-game-lab/privacy.html",
    "supportUrl": "https://moshequ.github.io/autonomous-game-lab/support.html"
  },
  "support": {
    "email": null,
    "status": "missing-production-address"
  },
  "analytics": {
    "browserPosthogConfigured": false,
    "serverPosthogConfigured": false,
    "eventCollector": {
      "browserConfigured": false,
      "serverExportConfigured": false,
      "url": null,
      "exportUrl": null,
      "writeTokenConfigured": true,
      "adminTokenConfigured": true,
      "provider": "cloudflare-worker-r2"
    },
    "host": "https://us.posthog.com",
    "status": "local-or-fixture"
  },
  "monetization": {
    "adNetworkProvider": "google-adsense-web-first",
    "webAdProvider": "google-adsense",
    "adsenseClientConfigured": false,
    "adsenseRewardedSlotConfigured": false,
    "adsenseClientId": null,
    "adsenseRewardedSlotId": null,
    "appAdProvider": "google-admob",
    "admobPublisherConfigured": false,
    "admobPublisherId": null,
    "status": "disabled"
  },
  "android": {
    "packageName": "app.autonomousgamelab.portal",
    "signingFingerprintConfigured": true,
    "sha256CertFingerprint": "FC:92:04:44:5B:93:78:92:A9:8C:08:50:BF:97:7A:90:A5:62:61:81:53:E7:A9:AA:A9:39:86:74:AE:D3:52:C2",
    "googlePlayAccountConnected": false,
    "status": "blocked-needs-host-signing-account"
  },
  "ios": {
    "appleDeveloperAccountConnected": false,
    "status": "deferred"
  },
  "blockers": [
    "Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.",
    "Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.",
    "Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.",
    "Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.",
    "Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.",
    "Connect Apple Developer account only after revenue justifies iOS spend."
  ],
  "requiredEnv": [
    {
      "name": "AGL_PUBLIC_ORIGIN",
      "purpose": "HTTPS origin used for hosted privacy/support URLs, sitemap, TWA host, and Digital Asset Links. If no custom origin is set, the setup helper can infer the zero-cost GitHub Pages origin from the repository target.",
      "configured": true,
      "source": "github-variable",
      "fallback": "github-pages-target"
    },
    {
      "name": "AGL_SUPPORT_EMAIL",
      "purpose": "Production support contact for privacy and store listings.",
      "configured": false
    },
    {
      "name": "VITE_POSTHOG_KEY",
      "purpose": "Optional browser-side PostHog analytics forwarding.",
      "configured": false
    },
    {
      "name": "POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY",
      "purpose": "Optional autonomous production analytics and experiment result rollups from PostHog.",
      "configured": false
    },
    {
      "name": "VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL",
      "purpose": "Optional zero-cost Worker/R2 event collector for browser analytics and autonomous rollups.",
      "configured": false
    },
    {
      "name": "VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID",
      "purpose": "Web/PWA rewarded or display-ad test configuration after product and privacy gates pass.",
      "configured": false
    },
    {
      "name": "ADMOB_PUBLISHER_ID",
      "purpose": "Native app seller line for app-ads.txt and Android rewarded tests after app-store gates pass.",
      "configured": false
    },
    {
      "name": "AGL_ANDROID_SHA256_CERT_FINGERPRINT",
      "purpose": "Android signing fingerprint for Digital Asset Links.",
      "configured": true
    },
    {
      "name": "AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED",
      "purpose": "Allows native packaging gates to treat Play Console access as connected.",
      "configured": false
    }
  ]
} as const

export type ProductionEnvironment = typeof productionEnvironment
