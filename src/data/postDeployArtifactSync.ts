export const postDeployArtifactSync = {
  "generatedAt": "2026-05-26T18:42:50.899Z",
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
    "runId": 26467913330,
    "headSha": "59236dcf06e8147da58539105309d97e21ce22be",
    "createdAt": "2026-05-26T18:41:08Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26467913330",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "current-head-deployed",
    "currentHeadSha": "59236dcf06e8147da58539105309d97e21ce22be",
    "currentHeadParentSha": "b39e942c45b72c6d10961ee999bf9be5a9a69dd6",
    "currentBranch": "main",
    "currentHeadSubject": "Add browser-local support contact pack",
    "selectedRunHeadSha": "59236dcf06e8147da58539105309d97e21ce22be",
    "selectedRunHeadMatchesCurrent": true,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": false,
    "currentHeadDeployed": true,
    "deploySourceHeadSha": "59236dcf06e8147da58539105309d97e21ce22be",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": 26467913330,
    "currentHeadActiveRunId": null,
    "latestRunId": 26467913330,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "59236dcf06e8147da58539105309d97e21ce22be",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-74520c998eae",
    "localCandidateId": "pwa-ef95eb5777dd",
    "liveAggregateHash": "74520c998eae1412a67419cb6c46437f81222180ff2a37bac8e15d0e30fe9046",
    "localAggregateHash": "ef95eb5777ddfb6cf5e6f34e81f19ca23e08908e2b8163e7cd8f2c57234ce852",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-26T18:41:51.507Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-74520c998eae",
      "aggregateHash": "74520c998eae1412a67419cb6c46437f81222180ff2a37bac8e15d0e30fe9046",
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
      "candidateId": "pwa-74520c998eae",
      "aggregateHash": "74520c998eae1412a67419cb6c46437f81222180ff2a37bac8e15d0e30fe9046",
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
    "reportSha256": "d651d11ec990696d88b62c44384dae3f9a444755e74308530861f02f9d714f34"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 39579,
    "textSha256": "6fd2db7818e954e5501c1571c2d8002287e58740e13a1f430293d52d2f0d4100",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-74520c998eae",
    "aggregateHash": "74520c998eae1412a67419cb6c46437f81222180ff2a37bac8e15d0e30fe9046",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26467913330."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26467913330."
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
      "detail": "Current main 59236dcf06e8 is deployed."
    }
  ],
  "nextActions": [
    "Current main is deployed; keep strict live artifact evidence in sync after each Pages run.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
