export const postDeployArtifactSync = {
  "generatedAt": "2026-05-22T01:14:54.424Z",
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
    "runId": 26262604849,
    "headSha": "66f98ffb7f62c8bbeb612257a4f7189f221a406a",
    "createdAt": "2026-05-22T01:13:34Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26262604849",
    "source": "explicit-run-id",
    "runListAvailable": false
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-22T01:14:18.960Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-3c4547b392a8",
      "aggregateHash": "3c4547b392a87365472e862b9dddc08d150331295f49254e18d7b3c8a201c382",
      "strictManifestComparison": true
    },
    "sourceStatus": {
      "deployment": "ready-for-pages",
      "releaseCandidate": "release-candidate-ready",
      "productionResponse": "guarded-operations"
    },
    "summary": {
      "planned": 17,
      "passed": 17,
      "failed": 0,
      "blocked": 0
    },
    "liveRelease": {
      "status": "release-candidate-ready",
      "candidateId": "pwa-3c4547b392a8",
      "aggregateHash": "3c4547b392a87365472e862b9dddc08d150331295f49254e18d7b3c8a201c382",
      "localCandidateMatches": true,
      "strictManifestComparison": true
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
    "reportSha256": "960b5aa2720537bb9fb9e22fce9a9fc51ad4f4876be1fa6692ae51608bb34550"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 20928,
    "textSha256": "4df226c6a71cbb857fa4cebd4b9eb8f9aa9a22828033a0a9293550ab3dad0f6d",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-3c4547b392a8",
    "aggregateHash": "3c4547b392a87365472e862b9dddc08d150331295f49254e18d7b3c8a201c382",
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
    "planned": 6,
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
    "noPostDeployReleaseRefresh": true
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
      "id": "explicit-pages-run",
      "status": "pass",
      "detail": "Explicit web-pwa-deploy.yml run is 26262604849."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26262604849."
    },
    {
      "id": "strict-smoke-artifact",
      "status": "pass",
      "detail": "Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 17/17."
    },
    {
      "id": "live-release-manifest",
      "status": "pass",
      "detail": "Live release-candidate.json still matches the strict smoke artifact."
    }
  ],
  "nextActions": [
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
