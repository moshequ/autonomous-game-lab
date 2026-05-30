export const postDeployArtifactSync = {
  "generatedAt": "2026-05-30T07:06:51.825Z",
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
    "source": "environment-or-cli"
  },
  "workflow": {
    "workflowFile": "web-pwa-deploy.yml",
    "artifactName": "post-deploy-smoke",
    "runId": 26515368723,
    "headSha": "1f21857a2546e7bea89d90f56dc3039278c7a5dc",
    "createdAt": "2026-05-27T13:50:37Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26515368723",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "current-head-not-deployed",
    "currentHeadSha": "c9dd6211d31001a32ac4f8245a5acf6bb6c767ed",
    "currentHeadParentSha": "805dd7e237c82de9c172368d9e184517055ee1e7",
    "currentBranch": "main",
    "currentHeadSubject": "Autonomy: resync evidence bundle + fix seed campaign typing",
    "selectedRunHeadSha": "1f21857a2546e7bea89d90f56dc3039278c7a5dc",
    "selectedRunHeadMatchesCurrent": false,
    "selectedRunHeadMatchesDeploySource": false,
    "currentHeadIsPostDeployEvidenceCommit": false,
    "currentHeadDeployed": false,
    "deploySourceHeadSha": "c9dd6211d31001a32ac4f8245a5acf6bb6c767ed",
    "deploySourceDeployed": false,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": null,
    "currentHeadActiveRunId": null,
    "latestRunId": null,
    "latestRunStatus": null,
    "latestRunConclusion": null,
    "latestRunHeadSha": null,
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": null,
    "localCandidateId": "pwa-ef19fff6b910",
    "liveAggregateHash": null,
    "localAggregateHash": "ef19fff6b9103245b72c316d0ad610c2d6dbdef3102ad5737b7859f6145f13be",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-27T13:51:38.627Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-c1531259c9ed",
      "aggregateHash": "c1531259c9edcdd74a6a36707788eaf0cfe628d76e11c43dbbf377e3d6b4547e",
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
      "candidateId": "pwa-c1531259c9ed",
      "aggregateHash": "c1531259c9edcdd74a6a36707788eaf0cfe628d76e11c43dbbf377e3d6b4547e",
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
    "reportSha256": "927598d1837d28f78592c35282e3f173a283bcf762343ac2e61b99a7a847edb1"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 42017,
    "textSha256": "eb16adb0dd1d705c7f176f4f09465ea2f0fd3e0607469f5839f21b1aeee10f57",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-c1531259c9ed",
    "aggregateHash": "c1531259c9edcdd74a6a36707788eaf0cfe628d76e11c43dbbf377e3d6b4547e",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26515368723."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26515368723."
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
      "detail": "Current main c9dd6211d310 is not the latest strict deployed artifact; freshness current-head-not-deployed."
    }
  ],
  "nextActions": [
    "Wait for or rerun Web PWA Deploy before treating the current main head as live; the previous deployed artifact remains valid but stale for the current commit.",
    "Current main is deployed; keep strict live artifact evidence in sync after each Pages run.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
