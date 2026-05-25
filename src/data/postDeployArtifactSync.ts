export const postDeployArtifactSync = {
  "generatedAt": "2026-05-25T17:18:38.369Z",
  "status": "post-deploy-artifact-sync-passed",
  "envFiles": {
    "loaded": true,
    "loadedFiles": [
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
    "runId": 26411775906,
    "headSha": "84c219c11ae15f4b5041d3137daa02aee1908ca0",
    "createdAt": "2026-05-25T17:11:28Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26411775906",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-25T17:12:15.778Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-5a891812ae19",
      "aggregateHash": "5a891812ae192b3a6f5afeddb7dcdd04d57edfde965c9dfdcc78009f0794e365",
      "strictManifestComparison": true
    },
    "sourceStatus": {
      "deployment": "ready-for-pages",
      "releaseCandidate": "release-candidate-ready",
      "productionResponse": "guarded-operations"
    },
    "summary": {
      "planned": 32,
      "passed": 32,
      "failed": 0,
      "blocked": 0
    },
    "liveRelease": {
      "status": "release-candidate-ready",
      "candidateId": "pwa-5a891812ae19",
      "aggregateHash": "5a891812ae192b3a6f5afeddb7dcdd04d57edfde965c9dfdcc78009f0794e365",
      "localCandidateMatches": true,
      "strictManifestComparison": true,
      "postDeploySmokeUrls": 31,
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
    "reportSha256": "bdbd1a735ca42de13713a9e5fdfebe6831b8c4fc8b20db4acaee1c2fb856a473"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 32668,
    "textSha256": "0c8ad5f0fc3c2724f7cc0f5cbda2ef944961a45407c6d46fdac3b6985778456f",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-5a891812ae19",
    "aggregateHash": "5a891812ae192b3a6f5afeddb7dcdd04d57edfde965c9dfdcc78009f0794e365",
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
      "id": "successful-pages-run",
      "status": "pass",
      "detail": "Latest successful web-pwa-deploy.yml run is 26411775906."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26411775906."
    },
    {
      "id": "strict-smoke-artifact",
      "status": "pass",
      "detail": "Artifact status post-deploy-smoke-passed; strict manifest comparison true; checks 32/32."
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
