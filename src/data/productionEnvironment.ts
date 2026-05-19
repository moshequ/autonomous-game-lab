export const productionEnvironment = {
  "generatedAt": "2026-05-18T23:36:39.276Z",
  "status": "production-env-missing",
  "publicOrigin": {
    "origin": null,
    "host": null,
    "basePath": "/",
    "status": "missing",
    "privacyUrl": null,
    "supportUrl": null
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
      "writeTokenConfigured": false,
      "adminTokenConfigured": false,
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
    "signingFingerprintConfigured": false,
    "sha256CertFingerprint": null,
    "googlePlayAccountConnected": false,
    "status": "blocked-needs-host-signing-account"
  },
  "ios": {
    "appleDeveloperAccountConnected": false,
    "status": "deferred"
  },
  "blockers": [
    "Set AGL_PUBLIC_ORIGIN or PUBLIC_SITE_URL to a real HTTPS production origin.",
    "Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.",
    "Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.",
    "Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.",
    "Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.",
    "Set AGL_ANDROID_SHA256_CERT_FINGERPRINT after Android signing exists.",
    "Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.",
    "Connect Apple Developer account only after revenue justifies iOS spend."
  ],
  "requiredEnv": [
    {
      "name": "AGL_PUBLIC_ORIGIN",
      "purpose": "HTTPS origin used for hosted privacy/support URLs, sitemap, TWA host, and Digital Asset Links.",
      "configured": false
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
      "configured": false
    },
    {
      "name": "AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED",
      "purpose": "Allows native packaging gates to treat Play Console access as connected.",
      "configured": false
    }
  ]
} as const

export type ProductionEnvironment = typeof productionEnvironment
