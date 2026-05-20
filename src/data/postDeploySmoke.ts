export const postDeploySmoke = {
  "generatedAt": "2026-05-20T02:57:07.714Z",
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
    "candidateId": "pwa-c1cfedd86bd6",
    "aggregateHash": "c1cfedd86bd628cb840b4097ee126256efb304779545251288ac6e2eda9fdafc"
  },
  "sourceStatus": {
    "deployment": "ready-for-pages",
    "releaseCandidate": "release-candidate-ready",
    "productionResponse": "guarded-operations"
  },
  "summary": {
    "planned": 14,
    "passed": 0,
    "failed": 0,
    "blocked": 14
  },
  "localArtifactSmoke": {
    "status": "predeploy-artifact-smoke-passed",
    "artifactPath": "dist",
    "summary": {
      "planned": 14,
      "passed": 14,
      "failed": 0
    },
    "controls": {
      "readOnlyFileChecks": true,
      "noNetworkRequired": true,
      "requiredTextChecks": true,
      "manifestHashComparisonRequired": true
    },
    "checks": [
      {
        "id": "app-shell",
        "path": "/",
        "file": "dist/index.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 803,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "manifest-webmanifest",
        "path": "/manifest.webmanifest",
        "file": "dist/manifest.webmanifest",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 713,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sw-js",
        "path": "/sw.js",
        "file": "dist/sw.js",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 3668,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "privacy-html",
        "path": "/privacy.html",
        "file": "dist/privacy.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 2648,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "support-html",
        "path": "/support.html",
        "file": "dist/support.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 1475,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "compliance-json",
        "path": "/compliance.json",
        "file": "dist/compliance.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 2716,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "monetization-json",
        "path": "/monetization.json",
        "file": "dist/monetization.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 878,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "app-ads-txt",
        "path": "/app-ads.txt",
        "file": "dist/app-ads.txt",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 187,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "well-known-assetlinks-json",
        "path": "/.well-known/assetlinks.json",
        "file": "dist/.well-known/assetlinks.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 348,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "gate-sample-html",
        "path": "/gate-sample.html",
        "file": "dist/gate-sample.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 6883,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "seed-kit-html",
        "path": "/seed-kit.html",
        "file": "dist/seed-kit.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 10968,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sitemap-xml",
        "path": "/sitemap.xml",
        "file": "dist/sitemap.xml",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 1783,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "games-canopy-bloom-html",
        "path": "/games/canopy-bloom.html",
        "file": "dist/games/canopy-bloom.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 5067,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "release-candidate-manifest",
        "path": "/release-candidate.json",
        "file": "dist/release-candidate.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 18168,
        "candidateMatches": true,
        "hashMatches": true,
        "localCandidateId": "pwa-c1cfedd86bd6",
        "localAggregateHash": "c1cfedd86bd628cb840b4097ee126256efb304779545251288ac6e2eda9fdafc",
        "detail": "Local release manifest matches the release candidate."
      }
    ]
  },
  "controls": {
    "zeroPaidSpend": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noAccountCreation": true,
    "readOnlyHttpChecks": true,
    "localArtifactSmokeRequired": true,
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
      "id": "compliance-json",
      "path": "/compliance.json",
      "url": "${DEPLOYED_PWA_ORIGIN}/compliance.json",
      "expectedStatus": 200,
      "requiredText": "store-compliance",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "monetization-json",
      "path": "/monetization.json",
      "url": "${DEPLOYED_PWA_ORIGIN}/monetization.json",
      "expectedStatus": 200,
      "requiredText": "blocked-by-product-gates",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "app-ads-txt",
      "path": "/app-ads.txt",
      "url": "${DEPLOYED_PWA_ORIGIN}/app-ads.txt",
      "expectedStatus": 200,
      "requiredText": "Revenue features are disabled",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "well-known-assetlinks-json",
      "path": "/.well-known/assetlinks.json",
      "url": "${DEPLOYED_PWA_ORIGIN}/.well-known/assetlinks.json",
      "expectedStatus": 200,
      "requiredText": "delegate_permission/common.handle_all_urls",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "gate-sample-html",
      "path": "/gate-sample.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/gate-sample.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "seed-kit-html",
      "path": "/seed-kit.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/seed-kit.html",
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
      "requiredText": "pwa-c1cfedd86bd6",
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
