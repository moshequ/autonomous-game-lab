export const postDeployArtifactSync = {
  "generatedAt": "2026-05-27T08:48:48.391Z",
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
    "runId": 26500896057,
    "headSha": "7d6b9238f3f42100e00109be2f37f99779bd2b09",
    "createdAt": "2026-05-27T08:46:50Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26500896057",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "current-head-deployed",
    "currentHeadSha": "7d6b9238f3f42100e00109be2f37f99779bd2b09",
    "currentHeadParentSha": "50631ba5c1fc04fd5ba28bc60b8d776b9b867091",
    "currentBranch": "main",
    "currentHeadSubject": "Refresh autonomy evidence for runtime config publish",
    "selectedRunHeadSha": "7d6b9238f3f42100e00109be2f37f99779bd2b09",
    "selectedRunHeadMatchesCurrent": true,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": false,
    "currentHeadDeployed": true,
    "deploySourceHeadSha": "7d6b9238f3f42100e00109be2f37f99779bd2b09",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": 26500896057,
    "currentHeadActiveRunId": null,
    "latestRunId": 26500896057,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "7d6b9238f3f42100e00109be2f37f99779bd2b09",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-72abaed5a28b",
    "localCandidateId": "pwa-acd49e087175",
    "liveAggregateHash": "72abaed5a28b0f4fdc341531caaad7832808d103b5189fdfa1c5f980e17ba42d",
    "localAggregateHash": "acd49e087175ac7e2cc37f12d38b4e9d3e82e8491949b79a35ebc205f0afbd8a",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-27T08:47:45.292Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-72abaed5a28b",
      "aggregateHash": "72abaed5a28b0f4fdc341531caaad7832808d103b5189fdfa1c5f980e17ba42d",
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
      "candidateId": "pwa-72abaed5a28b",
      "aggregateHash": "72abaed5a28b0f4fdc341531caaad7832808d103b5189fdfa1c5f980e17ba42d",
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
    "reportSha256": "c389d8e14f9d520fa5569430411ff672b9f15e672f1c16db062b9585d82142f6"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 42015,
    "textSha256": "4613c11f87835451eff2871d2b5dc773de506ecef7582cd166ace5f96b6038b2",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-72abaed5a28b",
    "aggregateHash": "72abaed5a28b0f4fdc341531caaad7832808d103b5189fdfa1c5f980e17ba42d",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26500896057."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26500896057."
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
      "detail": "Current main 7d6b9238f3f4 is deployed."
    }
  ],
  "nextActions": [
    "Current main is deployed; keep strict live artifact evidence in sync after each Pages run.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
