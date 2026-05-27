export const postDeployArtifactSync = {
  "generatedAt": "2026-05-27T06:01:21.095Z",
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
    "runId": 26493740272,
    "headSha": "c1077aad0df1766482968e81c73727473b77b55e",
    "createdAt": "2026-05-27T05:59:37Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26493740272",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "current-head-deployed",
    "currentHeadSha": "c1077aad0df1766482968e81c73727473b77b55e",
    "currentHeadParentSha": "8b09c4fb47ca8ba4129ef59a098c31c51d5348bf",
    "currentBranch": "main",
    "currentHeadSubject": "Refresh readiness evidence after ad provider handoff",
    "selectedRunHeadSha": "c1077aad0df1766482968e81c73727473b77b55e",
    "selectedRunHeadMatchesCurrent": true,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": false,
    "currentHeadDeployed": true,
    "deploySourceHeadSha": "c1077aad0df1766482968e81c73727473b77b55e",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": 26493740272,
    "currentHeadActiveRunId": null,
    "latestRunId": 26493740272,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "c1077aad0df1766482968e81c73727473b77b55e",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-4cd1d0e4a882",
    "localCandidateId": "pwa-e5009fc5ec79",
    "liveAggregateHash": "4cd1d0e4a882d540e5f114ceea1ed126ff5c9f6260588f8acd224288afcf24c5",
    "localAggregateHash": "e5009fc5ec79361d8337275a657e0f35984bc9e97df1220644077c697f72d952",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-27T06:00:22.778Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-4cd1d0e4a882",
      "aggregateHash": "4cd1d0e4a882d540e5f114ceea1ed126ff5c9f6260588f8acd224288afcf24c5",
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
      "candidateId": "pwa-4cd1d0e4a882",
      "aggregateHash": "4cd1d0e4a882d540e5f114ceea1ed126ff5c9f6260588f8acd224288afcf24c5",
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
    "reportSha256": "5cb66b2e26c575ece96f81598c948601a7b41fface4da65e41bea9c251a37cbf"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 42015,
    "textSha256": "1ea09196f94f4835a86a393593ebbc5cb8f024b64f8bf56126a321dd46d4f337",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-4cd1d0e4a882",
    "aggregateHash": "4cd1d0e4a882d540e5f114ceea1ed126ff5c9f6260588f8acd224288afcf24c5",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26493740272."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26493740272."
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
      "detail": "Current main c1077aad0df1 is deployed."
    }
  ],
  "nextActions": [
    "Current main is deployed; keep strict live artifact evidence in sync after each Pages run.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
