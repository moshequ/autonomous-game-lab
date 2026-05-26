export const postDeployArtifactSync = {
  "generatedAt": "2026-05-26T18:56:38.249Z",
  "status": "post-deploy-artifact-sync-passed",
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
  "repository": {
    "target": "moshequ/autonomous-game-lab",
    "source": "environment-or-cli"
  },
  "workflow": {
    "workflowFile": "web-pwa-deploy.yml",
    "artifactName": "post-deploy-smoke",
    "runId": 26468603465,
    "headSha": "a5af28261c21c9db922663ea20b9ca2be6de1681",
    "createdAt": "2026-05-26T18:54:45Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26468603465",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "current-head-deployed",
    "currentHeadSha": "a5af28261c21c9db922663ea20b9ca2be6de1681",
    "currentHeadParentSha": "27fa139111a1802d5459b872e59eefa8259adb1d",
    "currentBranch": "main",
    "currentHeadSubject": "Make release cards playable",
    "selectedRunHeadSha": "a5af28261c21c9db922663ea20b9ca2be6de1681",
    "selectedRunHeadMatchesCurrent": true,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": false,
    "currentHeadDeployed": true,
    "deploySourceHeadSha": "a5af28261c21c9db922663ea20b9ca2be6de1681",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": 26468603465,
    "currentHeadActiveRunId": null,
    "latestRunId": 26468603465,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "a5af28261c21c9db922663ea20b9ca2be6de1681",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-7926355061d1",
    "localCandidateId": "pwa-40011e66616b",
    "liveAggregateHash": "7926355061d15b2f49ed0cef52420fc81aec99cc3d59571b21ca6148ebea6dcb",
    "localAggregateHash": "40011e66616b14f329e38ef0b98e449eddc3801e0f07e6198a3507a05c0c40ab",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-26T18:55:39.603Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-7926355061d1",
      "aggregateHash": "7926355061d15b2f49ed0cef52420fc81aec99cc3d59571b21ca6148ebea6dcb",
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
      "candidateId": "pwa-7926355061d1",
      "aggregateHash": "7926355061d15b2f49ed0cef52420fc81aec99cc3d59571b21ca6148ebea6dcb",
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
    "reportSha256": "0884b62f37c420f134a3d41c0eb1dd05bfe404e04ee2ee931fd4597029929803"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 39579,
    "textSha256": "9756c4ae34dfa8d50a43f8493d181435892039679ab6378cb9e0400a08da8ded",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-7926355061d1",
    "aggregateHash": "7926355061d15b2f49ed0cef52420fc81aec99cc3d59571b21ca6148ebea6dcb",
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
    "passed": 7,
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26468603465."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26468603465."
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
      "status": "pass",
      "detail": "Current main a5af28261c21 is deployed."
    }
  ],
  "nextActions": [
    "Current main is deployed; keep strict live artifact evidence in sync after each Pages run.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
