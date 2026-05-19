export const postDeploySmoke = {
  "generatedAt": "2026-05-19T02:18:03.207Z",
  "status": "blocked-missing-origin",
  "envFiles": {
    "loaded": false,
    "loadedFiles": [],
    "loadedKeys": [],
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
    "candidateId": "pwa-20402032da40",
    "aggregateHash": "20402032da401309035f8314a5f8ed84e0fe95d82f5f360ff265cc2f3e812f62"
  },
  "sourceStatus": {
    "deployment": "ready-for-pages",
    "releaseCandidate": "release-candidate-ready",
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
      "requiredText": "pwa-20402032da40",
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
