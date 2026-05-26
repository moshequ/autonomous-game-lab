export const postDeployArtifactSync = {
  "generatedAt": "2026-05-26T22:03:50.668Z",
  "status": "post-deploy-artifact-sync-passed",
  "envFiles": {
    "loaded": true,
    "loadedFiles": [
      {
        "path": ".env.production.local",
        "keys": [
          "VITE_POSTHOG_KEY",
          "VITE_POSTHOG_HOST",
          "AGL_SUPPORT_EMAIL"
        ]
      },
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
      "VITE_POSTHOG_KEY",
      "VITE_POSTHOG_HOST",
      "AGL_SUPPORT_EMAIL",
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
  "repository": {
    "target": "moshequ/autonomous-game-lab",
    "source": "origin-remote"
  },
  "workflow": {
    "workflowFile": "web-pwa-deploy.yml",
    "artifactName": "post-deploy-smoke",
    "runId": 26477265948,
    "headSha": "9b862c8bbc42b384a77d85ec6928746d5222af3e",
    "createdAt": "2026-05-26T21:52:04Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26477265948",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "post-deploy-evidence-head-synced",
    "currentHeadSha": "b1ad789ccda851dbc8a2ad68443c9deb87ac5568",
    "currentHeadParentSha": "9b862c8bbc42b384a77d85ec6928746d5222af3e",
    "currentBranch": "main",
    "currentHeadSubject": "Autonomous post-deploy evidence sync",
    "selectedRunHeadSha": "9b862c8bbc42b384a77d85ec6928746d5222af3e",
    "selectedRunHeadMatchesCurrent": false,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": true,
    "currentHeadDeployed": false,
    "deploySourceHeadSha": "9b862c8bbc42b384a77d85ec6928746d5222af3e",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": null,
    "currentHeadActiveRunId": null,
    "latestRunId": 26477265948,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "9b862c8bbc42b384a77d85ec6928746d5222af3e",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-b6ce2de81c1f",
    "localCandidateId": "pwa-3ca530efe048",
    "liveAggregateHash": "b6ce2de81c1f03eb7d03885ce5e7303ee3288c00566de45f8880cb879c5b6026",
    "localAggregateHash": "3ca530efe048af35a56073c18652e217da35bc1983f49ce743551bd98c4a47e3",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-26T21:52:49.372Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-b6ce2de81c1f",
      "aggregateHash": "b6ce2de81c1f03eb7d03885ce5e7303ee3288c00566de45f8880cb879c5b6026",
      "strictManifestComparison": true
    },
    "sourceStatus": {
      "deployment": "ready-for-pages",
      "releaseCandidate": "release-candidate-ready",
      "productionResponse": "guarded-operations"
    },
    "summary": {
      "planned": 34,
      "passed": 34,
      "failed": 0,
      "blocked": 0
    },
    "liveRelease": {
      "status": "release-candidate-ready",
      "candidateId": "pwa-b6ce2de81c1f",
      "aggregateHash": "b6ce2de81c1f03eb7d03885ce5e7303ee3288c00566de45f8880cb879c5b6026",
      "localCandidateMatches": true,
      "strictManifestComparison": true,
      "postDeploySmokeUrls": 33,
      "smokePlanSource": "current-local-release-candidate"
    },
    "controls": {
      "zeroPaidSpend": true,
      "noStoreSubmission": true,
      "noRevenueEnablement": true,
      "noAccountCreation": true,
      "readOnlyHttpChecks": true,
      "localArtifactSmokeRequired": true,
      "manifestHashComparisonRequired": true,
      "strictManifestComparison": true,
      "inferredLiveObservationAllowed": false
    },
    "reportSha256": "9a1b7690b10425c80aa0eac4ed24e9ceac813cc07e5c4b964d2560aab1f0b600"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 39592,
    "textSha256": "6d784574ca682bb4f2f9a892da360383d2b84681ce26df5b8276f27b6794bd44",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-b6ce2de81c1f",
    "aggregateHash": "b6ce2de81c1f03eb7d03885ce5e7303ee3288c00566de45f8880cb879c5b6026",
    "matchesArtifact": true
  },
  "validation": {
    "artifactPassed": true,
    "artifactStrict": true,
    "artifactControlsReady": true,
    "artifactSummaryPassed": true,
    "liveMatchesArtifact": true
  },
  "summary": {
    "planned": 7,
    "passed": 6,
    "failed": 0,
    "blocked": 0
  },
  "controls": {
    "zeroPaidSpend": true,
    "noWorkflowDispatch": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noAccountCreation": true,
    "readOnlyGithubArtifactDownload": true,
    "readOnlyHttpChecks": true,
    "strictManifestComparisonRequired": true,
    "separateFromLocalCandidate": true,
    "noPostDeployReleaseRefresh": true,
    "currentHeadFreshnessTracked": true,
    "olderDeployNotTreatedAsCurrentHead": true
  },
  "checks": [
    {
      "id": "gh-cli",
      "status": "pass",
      "detail": "gh version 2.92.0 (2026-04-28)"
    },
    {
      "id": "github-repository",
      "status": "pass",
      "detail": "Target repository is moshequ/autonomous-game-lab."
    },
    {
      "id": "successful-pages-run",
      "status": "pass",
      "detail": "Latest successful web-pwa-deploy.yml run is 26477265948."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26477265948."
    },
    {
      "id": "strict-smoke-artifact",
      "status": "pass",
      "detail": "Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 34/34."
    },
    {
      "id": "live-release-manifest",
      "status": "pass",
      "detail": "Live release-candidate.json still matches the strict smoke artifact."
    },
    {
      "id": "deployment-freshness",
      "status": "monitor",
      "detail": "Current main b1ad789ccda8 is the post-deploy evidence commit for deployed source 9b862c8bbc42."
    }
  ],
  "nextActions": [
    "Current main is the post-deploy evidence commit for the deployed source; deploy again only when public evidence pages must mirror the evidence commit immediately.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
