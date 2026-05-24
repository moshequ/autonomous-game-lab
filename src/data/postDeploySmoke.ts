export const postDeploySmoke = {
  "generatedAt": "2026-05-24T12:45:28.597Z",
  "status": "post-deploy-smoke-observed-live",
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
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "originSource": "release-candidate-public-origin",
    "provider": "github-pages",
    "candidateId": "pwa-cc123c5ae244",
    "aggregateHash": "cc123c5ae24466beaeacb5d65f386c508330d8744c04d899aeb2e0567db393ed",
    "strictManifestComparison": false
  },
  "liveRelease": {
    "status": "release-candidate-ready",
    "candidateId": "pwa-2e6aff6df0be",
    "aggregateHash": "2e6aff6df0befc3c51aeb4bee06b0e8dab54113eab4255d5f6541b082eb377f9",
    "localCandidateMatches": false,
    "strictManifestComparison": false,
    "postDeploySmokeUrls": 26,
    "smokePlanSource": "live-release-manifest"
  },
  "sourceStatus": {
    "deployment": "ready-for-pages",
    "releaseCandidate": "release-candidate-ready",
    "productionResponse": "guarded-operations"
  },
  "summary": {
    "planned": 27,
    "passed": 27,
    "failed": 0,
    "blocked": 0
  },
  "localArtifactSmoke": {
    "status": "predeploy-artifact-smoke-passed",
    "artifactPath": "dist",
    "summary": {
      "planned": 27,
      "passed": 27,
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
        "bytes": 2846,
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
        "bytes": 5072,
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
        "bytes": 4241,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "measurement-status-html",
        "path": "/measurement-status.html",
        "file": "dist/measurement-status.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 23190,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "measurement-status-json",
        "path": "/measurement-status.json",
        "file": "dist/measurement-status.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 44033,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "owner-unlock-brief-json",
        "path": "/owner-unlock-brief.json",
        "file": "dist/owner-unlock-brief.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 6292,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "owner-unlock-preflight-json",
        "path": "/owner-unlock-preflight.json",
        "file": "dist/owner-unlock-preflight.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 9735,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "analytics-unlock-html",
        "path": "/analytics-unlock.html",
        "file": "dist/analytics-unlock.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 16487,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "analytics-unlock-json",
        "path": "/analytics-unlock.json",
        "file": "dist/analytics-unlock.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 30748,
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
        "bytes": 5625,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "monetization-json",
        "path": "/monetization.json",
        "file": "dist/monetization.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 1720,
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
        "bytes": 32980,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sample-next-html",
        "path": "/sample-next.html",
        "file": "dist/sample-next.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 7433,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sample-next-json",
        "path": "/sample-next.json",
        "file": "dist/sample-next.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 1357,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sample-fastest-html",
        "path": "/sample-fastest.html",
        "file": "dist/sample-fastest.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 7382,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sample-fastest-json",
        "path": "/sample-fastest.json",
        "file": "dist/sample-fastest.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 1319,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "seed-kit-html",
        "path": "/seed-kit.html",
        "file": "dist/seed-kit.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 22314,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "seed-next-html",
        "path": "/seed-next.html",
        "file": "dist/seed-next.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 6544,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "seed-next-json",
        "path": "/seed-next.json",
        "file": "dist/seed-next.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 1095,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "sitemap-xml",
        "path": "/sitemap.xml",
        "file": "dist/sitemap.xml",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 2773,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "games-canopy-bloom-html",
        "path": "/games/canopy-bloom.html",
        "file": "dist/games/canopy-bloom.html",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 5999,
        "textMatched": true,
        "detail": "Local production artifact matched required text."
      },
      {
        "id": "release-candidate-manifest",
        "path": "/release-candidate.json",
        "file": "dist/release-candidate.json",
        "expectedStatus": 200,
        "status": "pass",
        "bytes": 29688,
        "candidateMatches": true,
        "hashMatches": true,
        "localCandidateId": "pwa-cc123c5ae244",
        "localAggregateHash": "cc123c5ae24466beaeacb5d65f386c508330d8744c04d899aeb2e0567db393ed",
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
      "bytes": 2846,
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
      "bytes": 5072,
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
      "bytes": 4241,
      "textMatched": true
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/measurement-status.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/measurement-status.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 23190,
      "textMatched": true
    },
    {
      "id": "measurement-status-json",
      "path": "/measurement-status.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/measurement-status.json",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/measurement-status.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 44033,
      "textMatched": true
    },
    {
      "id": "owner-unlock-brief-json",
      "path": "/owner-unlock-brief.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/owner-unlock-brief.json",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/owner-unlock-brief.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 6292,
      "textMatched": true
    },
    {
      "id": "owner-unlock-preflight-json",
      "path": "/owner-unlock-preflight.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/owner-unlock-preflight.json",
      "expectedStatus": 200,
      "requiredText": "owner-unlock-preflight",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/owner-unlock-preflight.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 9735,
      "textMatched": true
    },
    {
      "id": "analytics-unlock-html",
      "path": "/analytics-unlock.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/analytics-unlock.html",
      "expectedStatus": 200,
      "requiredText": "Production Analytics Unlock",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/analytics-unlock.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 16487,
      "textMatched": true
    },
    {
      "id": "analytics-unlock-json",
      "path": "/analytics-unlock.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/analytics-unlock.json",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/analytics-unlock.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 30748,
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
      "bytes": 5625,
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
      "bytes": 1720,
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
      "bytes": 32980,
      "textMatched": true
    },
    {
      "id": "sample-next-html",
      "path": "/sample-next.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/sample-next.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/sample-next.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 7433,
      "textMatched": true
    },
    {
      "id": "sample-next-json",
      "path": "/sample-next.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/sample-next.json",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/sample-next.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 1357,
      "textMatched": true
    },
    {
      "id": "sample-fastest-html",
      "path": "/sample-fastest.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/sample-fastest.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/sample-fastest.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 7382,
      "textMatched": true
    },
    {
      "id": "sample-fastest-json",
      "path": "/sample-fastest.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/sample-fastest.json",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/sample-fastest.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 1319,
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
      "bytes": 22314,
      "textMatched": true
    },
    {
      "id": "seed-next-html",
      "path": "/seed-next.html",
      "url": "https://moshequ.github.io/autonomous-game-lab/seed-next.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/seed-next.html",
      "contentType": "text/html; charset=utf-8",
      "bytes": 6544,
      "textMatched": true
    },
    {
      "id": "seed-next-json",
      "path": "/seed-next.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/seed-next.json",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "pass",
      "detail": "Live URL matched status and required text.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/seed-next.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 1095,
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
      "bytes": 2773,
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
      "bytes": 5999,
      "textMatched": true
    },
    {
      "id": "release-candidate-manifest",
      "path": "/release-candidate.json",
      "url": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
      "expectedStatus": 200,
      "requiredText": "pwa-cc123c5ae244",
      "status": "pass",
      "detail": "Live release manifest is reachable; it does not match the current local release candidate.",
      "actualStatus": 200,
      "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
      "contentType": "application/json; charset=utf-8",
      "bytes": 29688,
      "candidateMatches": false,
      "hashMatches": false,
      "localCandidateMatches": false,
      "strictManifestComparison": false,
      "deployedReleaseStatus": "release-candidate-ready",
      "deployedCandidateId": "pwa-2e6aff6df0be",
      "deployedAggregateHash": "2e6aff6df0befc3c51aeb4bee06b0e8dab54113eab4255d5f6541b082eb377f9",
      "deployedPostDeploySmoke": [
        {
          "id": "app-shell",
          "path": "/",
          "url": "https://moshequ.github.io/autonomous-game-lab/",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "manifest-webmanifest",
          "path": "/manifest.webmanifest",
          "url": "https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "sw-js",
          "path": "/sw.js",
          "url": "https://moshequ.github.io/autonomous-game-lab/sw.js",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "privacy-html",
          "path": "/privacy.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/privacy.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "support-html",
          "path": "/support.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/support.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "measurement-status-html",
          "path": "/measurement-status.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/measurement-status.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "measurement-status-json",
          "path": "/measurement-status.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/measurement-status.json",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "owner-unlock-brief-json",
          "path": "/owner-unlock-brief.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/owner-unlock-brief.json",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "owner-unlock-preflight-json",
          "path": "/owner-unlock-preflight.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/owner-unlock-preflight.json",
          "expectedStatus": 200,
          "requiredText": "owner-unlock-preflight"
        },
        {
          "id": "analytics-unlock-html",
          "path": "/analytics-unlock.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/analytics-unlock.html",
          "expectedStatus": 200,
          "requiredText": "Production Analytics Unlock"
        },
        {
          "id": "analytics-unlock-json",
          "path": "/analytics-unlock.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/analytics-unlock.json",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "install-html",
          "path": "/install.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/install.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "compliance-json",
          "path": "/compliance.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/compliance.json",
          "expectedStatus": 200,
          "requiredText": "store-compliance"
        },
        {
          "id": "monetization-json",
          "path": "/monetization.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/monetization.json",
          "expectedStatus": 200,
          "requiredText": "blocked-by-product-gates"
        },
        {
          "id": "app-ads-txt",
          "path": "/app-ads.txt",
          "url": "https://moshequ.github.io/autonomous-game-lab/app-ads.txt",
          "expectedStatus": 200,
          "requiredText": "Revenue features are disabled"
        },
        {
          "id": "well-known-assetlinks-json",
          "path": "/.well-known/assetlinks.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json",
          "expectedStatus": 200,
          "requiredText": "delegate_permission/common.handle_all_urls"
        },
        {
          "id": "gate-sample-html",
          "path": "/gate-sample.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/gate-sample.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "sample-next-html",
          "path": "/sample-next.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/sample-next.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "sample-next-json",
          "path": "/sample-next.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/sample-next.json",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "sample-fastest-html",
          "path": "/sample-fastest.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/sample-fastest.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "sample-fastest-json",
          "path": "/sample-fastest.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/sample-fastest.json",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "seed-kit-html",
          "path": "/seed-kit.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/seed-kit.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "seed-next-html",
          "path": "/seed-next.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/seed-next.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        },
        {
          "id": "seed-next-json",
          "path": "/seed-next.json",
          "url": "https://moshequ.github.io/autonomous-game-lab/seed-next.json",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "sitemap-xml",
          "path": "/sitemap.xml",
          "url": "https://moshequ.github.io/autonomous-game-lab/sitemap.xml",
          "expectedStatus": 200,
          "requiredText": null
        },
        {
          "id": "games-canopy-bloom-html",
          "path": "/games/canopy-bloom.html",
          "url": "https://moshequ.github.io/autonomous-game-lab/games/canopy-bloom.html",
          "expectedStatus": 200,
          "requiredText": "Autonomous Game Lab"
        }
      ],
      "deployedPostDeploySmokeUrls": 26
    }
  ],
  "nextActions": [
    "Live Pages is reachable and serving pwa-2e6aff6df0be; run the deploy workflow for strict proof of the current local candidate if needed.",
    "Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass."
  ]
} as const

export type PostDeploySmoke = typeof postDeploySmoke
