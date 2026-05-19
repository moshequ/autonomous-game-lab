export const postDeploySmoke = {
  "generatedAt": "2026-05-19T03:06:33.056Z",
  "status": "blocked-missing-origin",
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
  "target": {
    "origin": null,
    "provider": "github-pages",
    "candidateId": "pwa-2d4916c47233",
    "aggregateHash": "2d4916c472336ae6f155e9b95a9b04ffa3a6dd992bb007898255b7f58c5f1cd2"
  },
  "sourceStatus": {
    "deployment": "blocked",
    "releaseCandidate": "release-candidate-blocked",
    "productionResponse": "guarded-operations"
  },
  "summary": {
    "planned": 8,
    "passed": 0,
    "failed": 0,
    "blocked": 8
  },
  "controls": {
    "zeroPaidSpend": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noAccountCreation": true,
    "readOnlyHttpChecks": true,
    "manifestHashComparisonRequired": true
  },
  "checks": [
    {
      "id": "app-shell",
      "path": "/",
      "url": "${DEPLOYED_PWA_ORIGIN}/",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "url": "${DEPLOYED_PWA_ORIGIN}/manifest.webmanifest",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "url": "${DEPLOYED_PWA_ORIGIN}/sw.js",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/privacy.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/support.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "sitemap-xml",
      "path": "/sitemap.xml",
      "url": "${DEPLOYED_PWA_ORIGIN}/sitemap.xml",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "games-canopy-bloom-html",
      "path": "/games/canopy-bloom.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/games/canopy-bloom.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "release-candidate-manifest",
      "path": "/release-candidate.json",
      "url": "${DEPLOYED_PWA_ORIGIN}/release-candidate.json",
      "expectedStatus": 200,
      "requiredText": "pwa-2d4916c47233",
      "status": "blocked",
      "detail": "No deployed origin configured."
    }
  ],
  "nextActions": [
    "Run this after deployment with AGL_DEPLOYED_PWA_ORIGIN set to the Pages URL.",
    "Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass."
  ]
} as const

export type PostDeploySmoke = typeof postDeploySmoke
