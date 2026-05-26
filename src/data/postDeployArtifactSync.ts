export const postDeployArtifactSync = {
  "generatedAt": "2026-05-26T23:06:55.194Z",
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
    "runId": 26479883661,
    "headSha": "82ba4cb6eade5bce57eac75f786d7778ce613066",
    "createdAt": "2026-05-26T22:56:12Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26479883661",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "post-deploy-evidence-head-synced",
    "currentHeadSha": "4c4ed99f500eb613119751156feba357eca52fde",
    "currentHeadParentSha": "82ba4cb6eade5bce57eac75f786d7778ce613066",
    "currentBranch": "main",
    "currentHeadSubject": "Autonomous post-deploy evidence sync",
    "selectedRunHeadSha": "82ba4cb6eade5bce57eac75f786d7778ce613066",
    "selectedRunHeadMatchesCurrent": false,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": true,
    "currentHeadDeployed": false,
    "deploySourceHeadSha": "82ba4cb6eade5bce57eac75f786d7778ce613066",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": null,
    "currentHeadActiveRunId": null,
    "latestRunId": 26479883661,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "82ba4cb6eade5bce57eac75f786d7778ce613066",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-6fc7209256b9",
    "localCandidateId": "pwa-9b16e5a13b0f",
    "liveAggregateHash": "6fc7209256b9a307dd84f2d5459bda729133454886cd128644cc8ddcc723cbe2",
    "localAggregateHash": "9b16e5a13b0f5ca18f3ced26723c93f55f1e3a70eb2cf955924839766ab06e1b",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-26T22:56:55.618Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-6fc7209256b9",
      "aggregateHash": "6fc7209256b9a307dd84f2d5459bda729133454886cd128644cc8ddcc723cbe2",
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
      "candidateId": "pwa-6fc7209256b9",
      "aggregateHash": "6fc7209256b9a307dd84f2d5459bda729133454886cd128644cc8ddcc723cbe2",
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
    "reportSha256": "c8f2b6c3382c97e2d42fbcf29a5d7deb6970bf1799d11eb5483ddff4f332e449"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 39581,
    "textSha256": "11d45b357d7e70f4fdc6162a6817e3dfd608dc6dc6efa4918a919d581d4c798f",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-6fc7209256b9",
    "aggregateHash": "6fc7209256b9a307dd84f2d5459bda729133454886cd128644cc8ddcc723cbe2",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26479883661."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26479883661."
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
      "detail": "Current main 4c4ed99f500e is the post-deploy evidence commit for deployed source 82ba4cb6eade."
    }
  ],
  "nextActions": [
    "Current main is the post-deploy evidence commit for the deployed source; deploy again only when public evidence pages must mirror the evidence commit immediately.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
