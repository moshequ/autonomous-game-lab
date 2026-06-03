export const postDeployArtifactSync = {
  "generatedAt": "2026-06-03T01:31:43.749Z",
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
    "runId": 26858191158,
    "headSha": "c4ae6e95b0ee1e10d3d39f0a4804461dcadca21e",
    "createdAt": "2026-06-03T01:29:34Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26858191158",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "current-head-deployed",
    "currentHeadSha": "c4ae6e95b0ee1e10d3d39f0a4804461dcadca21e",
    "currentHeadParentSha": "1d3ab4a4169f80b4d00e704e452f25d2f8d925cc",
    "currentBranch": "main",
    "currentHeadSubject": "Merge remote-tracking branch 'origin/main'",
    "selectedRunHeadSha": "c4ae6e95b0ee1e10d3d39f0a4804461dcadca21e",
    "selectedRunHeadMatchesCurrent": true,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": false,
    "currentHeadDeployed": true,
    "deploySourceHeadSha": "c4ae6e95b0ee1e10d3d39f0a4804461dcadca21e",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": 26858191158,
    "currentHeadActiveRunId": null,
    "latestRunId": 26858191158,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "c4ae6e95b0ee1e10d3d39f0a4804461dcadca21e",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-1cfee0c2db84",
    "localCandidateId": "pwa-40034d579464",
    "liveAggregateHash": "1cfee0c2db8483287d4a974ea01c75a4a79f9f3a1aa55dc2a436e3e69f41c267",
    "localAggregateHash": "40034d579464609b782c89d9801e14de2ccca3d82c6a7b921ada30056593ba53",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-06-03T01:30:30.186Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-1cfee0c2db84",
      "aggregateHash": "1cfee0c2db8483287d4a974ea01c75a4a79f9f3a1aa55dc2a436e3e69f41c267",
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
      "candidateId": "pwa-1cfee0c2db84",
      "aggregateHash": "1cfee0c2db8483287d4a974ea01c75a4a79f9f3a1aa55dc2a436e3e69f41c267",
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
    "reportSha256": "1c7e97bf8221ee1395c2f6df53113364db80693f0bbe570e4a091b4cdec3a748"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 43515,
    "textSha256": "5f932981a03f921dcc3b2e4186634196d35e792a3ecfff9d8451d8662af48c07",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-1cfee0c2db84",
    "aggregateHash": "1cfee0c2db8483287d4a974ea01c75a4a79f9f3a1aa55dc2a436e3e69f41c267",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26858191158."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26858191158."
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
      "detail": "Current main c4ae6e95b0ee is deployed."
    }
  ],
  "nextActions": [
    "Current main is deployed; keep strict live artifact evidence in sync after each Pages run.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
