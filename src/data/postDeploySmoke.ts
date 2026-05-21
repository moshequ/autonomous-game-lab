export const postDeploySmoke = {
  "generatedAt": "2026-05-21T03:55:06.800Z",
  "status": "post-deploy-smoke-observed-live",
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
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "originSource": "release-candidate-public-origin",
    "provider": "github-pages",
    "candidateId": "pwa-7aab318fafe5",
    "aggregateHash": "7aab318fafe5b3a5d84bc7f8fca6a98d4b07924aa3d7a1796358ac746886f004",
    "strictManifestComparison": false
  },
  "liveRelease": {
    "status": "release-candidate-ready",
    "candidateId": "pwa-052e4c09f1bd",
    "aggregateHash": "052e4c09f1bde91a3e5bf58e3fff95cc5e03839df19fd3421733a383ddc37b16",
    "localCandidateMatches": false,
    "strictManifestComparison": false
  },
  "sourceStatus": {
    "deployment": "ready-for-pages",
    "releaseCandidate": "release-candidate-ready",
    "productionResponse": "guarded-operations"
  },
  "summary": {
    "planned": 15,
    "passed": 15,
    "failed": 0,
    "blocked": 0
  },
  "localArtifactSmoke": {
    "status": "predeploy-artifact-smoke-passed",
    "artifactPath": "dist",
    "summary": {
      "planned": 15,
      "passed": 15,
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
        "bytes": 903,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "manifest-webmanifest",
        "path": "/manifest.webmanifest",
        "file": "dist/manifest.webmanifest",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 853,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sw-js",
        "path": "/sw.js",
        "file": "dist/sw.js",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 3733,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "privacy-html",
        "path": "/privacy.html",
        "file": "dist/privacy.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 2649,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "support-html",
        "path": "/support.html",
        "file": "dist/support.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 4005,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "install-html",
        "path": "/install.html",
        "file": "dist/install.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 7967,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "compliance-json",
        "path": "/compliance.json",
        "file": "dist/compliance.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 5370,
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
        "bytes": 17817,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "seed-kit-html",
        "path": "/seed-kit.html",
        "file": "dist/seed-kit.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 13712,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sitemap-xml",
        "path": "/sitemap.xml",
        "file": "dist/sitemap.xml",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 1861,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "games-canopy-bloom-html",
        "path": "/games/canopy-bloom.html",
        "file": "dist/games/canopy-bloom.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 5079,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "release-candidate-manifest",
        "path": "/release-candidate.json",
        "file": "dist/release-candidate.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 19424,
        "candidateMatches": true,
        "hashMatches": true,
        "localCandidateId": "pwa-7aab318fafe5",
        "localAggregateHash": "7aab318fafe5b3a5d84bc7f8fca6a98d4b07924aa3d7a1796358ac746886f004",
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
    "manifestHashComparisonRequired": true,
    "strictManifestComparison": false,
    "inferredLiveObservationAllowed": true
  },
  "checks": [
    {
      "id": "app-shell",
      "path": "/",
      "url": "https://moshequ.github.io/autonomous-game-lab/",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/",
      "contentType": "text/html; charset=utf-8",
      "bytes": 903,
      "textMatched": true
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "url": "https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest",
      "contentType": "application/manifest+json; charset=utf-8",
      "bytes": 853,
      "textMatched": true
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "url": "https://moshequ.github.io/autonomous-game-lab/sw.js",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/sw.js",
      "contentType": "application/javascript; charset=utf-8",
      "bytes": 3733,
      "textMatched": true
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/privacy.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/privacy.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 2649,
      "textMatched": true
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/support.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/support.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 4005,
      "textMatched": true
    },
    {
      "id": "install-html",
      "path": "/install.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/install.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/install.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 7967,
      "textMatched": true
    },
    {
      "id": "compliance-json",
      "path": "/compliance.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/compliance.json",
      "expectedStatus": 200,
      "requiredText": "store-compliance",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/compliance.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 5370,
      "textMatched": true
    },
    {
      "id": "monetization-json",
      "path": "/monetization.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/monetization.json",
      "expectedStatus": 200,
      "requiredText": "blocked-by-product-gates",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/monetization.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 878,
      "textMatched": true
    },
    {
      "id": "app-ads-txt",
      "path": "/app-ads.txt",
      "url": "https://moshequ.github.io/autonomous-game-lab/app-ads.txt",
      "expectedStatus": 200,
      "requiredText": "Revenue features are disabled",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/app-ads.txt",
      "contentType": "text/plain; charset=utf-8",
      "bytes": 187,
      "textMatched": true
    },
    {
      "id": "well-known-assetlinks-json",
      "path": "/.well-known/assetlinks.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json",
      "expectedStatus": 200,
      "requiredText": "delegate_permission/common.handle_all_urls",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 348,
      "textMatched": true
    },
    {
      "id": "gate-sample-html",
      "path": "/gate-sample.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/gate-sample.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/gate-sample.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 17817,
      "textMatched": true
    },
    {
      "id": "seed-kit-html",
      "path": "/seed-kit.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/seed-kit.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/seed-kit.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 13712,
      "textMatched": true
    },
    {
      "id": "sitemap-xml",
      "path": "/sitemap.xml",
      "url": "https://moshequ.github.io/autonomous-game-lab/sitemap.xml",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/sitemap.xml",
      "contentType": "application/xml",
      "bytes": 1861,
      "textMatched": true
    },
    {
      "id": "games-canopy-bloom-html",
      "path": "/games/canopy-bloom.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 5079,
      "textMatched": true
    },
    {
      "id": "release-candidate-manifest",
      "path": "/release-candidate.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
      "expectedStatus": 200,
      "requiredText": "pwa-7aab318fafe5",
      "status": "pass",
      "detail": "Live release manifest is reachable; it does not match the current local release candidate.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 19424,
      "candidateMatches": false,
      "hashMatches": false,
      "localCandidateMatches": false,
      "strictManifestComparison": false,
      "deployedReleaseStatus": "release-candidate-ready",
      "deployedCandidateId": "pwa-052e4c09f1bd",
      "deployedAggregateHash": "052e4c09f1bde91a3e5bf58e3fff95cc5e03839df19fd3421733a383ddc37b16"
    }
  ],
  "nextActions": [
    "Live Pages is reachable and serving pwa-052e4c09f1bd; run the deploy workflow for strict proof of the current local candidate if needed.",
    "Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass."
  ]
} as const

export type PostDeploySmoke = typeof postDeploySmoke
