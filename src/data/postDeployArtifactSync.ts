export const postDeployArtifactSync = {
  "generatedAt": "2026-05-26T22:54:46.606Z",
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
    "runId": 26479471890,
    "headSha": "72f65df1a2e28eb4db85f5ab05b92f5218045ca4",
    "createdAt": "2026-05-26T22:45:27Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26479471890",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "post-deploy-evidence-head-synced",
    "currentHeadSha": "ef952801fb23b45c9bb3d0cbbcc12cb09c272e37",
    "currentHeadParentSha": "72f65df1a2e28eb4db85f5ab05b92f5218045ca4",
    "currentBranch": "main",
    "currentHeadSubject": "Autonomous post-deploy evidence sync",
    "selectedRunHeadSha": "72f65df1a2e28eb4db85f5ab05b92f5218045ca4",
    "selectedRunHeadMatchesCurrent": false,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": true,
    "currentHeadDeployed": false,
    "deploySourceHeadSha": "72f65df1a2e28eb4db85f5ab05b92f5218045ca4",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": null,
    "currentHeadActiveRunId": null,
    "latestRunId": 26479471890,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "72f65df1a2e28eb4db85f5ab05b92f5218045ca4",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-c71717c50f32",
    "localCandidateId": "pwa-78cac65d8316",
    "liveAggregateHash": "c71717c50f32330ea02a9cab653bdb0296dd6aa447bdf713857cf7f5d0d813b4",
    "localAggregateHash": "78cac65d8316e83a8f618fed3ad14874c56135b8d3fd42167acaeca097c21e4f",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-26T22:46:20.519Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-c71717c50f32",
      "aggregateHash": "c71717c50f32330ea02a9cab653bdb0296dd6aa447bdf713857cf7f5d0d813b4",
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
      "candidateId": "pwa-c71717c50f32",
      "aggregateHash": "c71717c50f32330ea02a9cab653bdb0296dd6aa447bdf713857cf7f5d0d813b4",
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
    "reportSha256": "2348582aa88ef268ede455f7d6f36d2d4f09254dc662eb051b2ac25448b1f923"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 39581,
    "textSha256": "85e03ea60f510eddb2dc6fa1bde56ededdcaf7ab5e49cb0c62b68451f16340b1",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-c71717c50f32",
    "aggregateHash": "c71717c50f32330ea02a9cab653bdb0296dd6aa447bdf713857cf7f5d0d813b4",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26479471890."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26479471890."
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
      "detail": "Current main ef952801fb23 is the post-deploy evidence commit for deployed source 72f65df1a2e2."
    }
  ],
  "nextActions": [
    "Current main is the post-deploy evidence commit for the deployed source; deploy again only when public evidence pages must mirror the evidence commit immediately.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
