export const postDeployArtifactSync = {
  "generatedAt": "2026-05-26T13:02:14.101Z",
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
    "runId": 26449251198,
    "headSha": "85d70aa70f5865b0956b2dcb35775ad3aee58729",
    "createdAt": "2026-05-26T12:55:49Z",
    "url": "https://github.com/moshequ/autonomous-game-lab/actions/runs/26449251198",
    "source": "latest-successful-run",
    "runListAvailable": true
  },
  "deploymentFreshness": {
    "status": "post-deploy-evidence-head-synced",
    "currentHeadSha": "4f82407ad827c1f6fb2c4b5b884389385b5e7bdb",
    "currentHeadParentSha": "85d70aa70f5865b0956b2dcb35775ad3aee58729",
    "currentBranch": "main",
    "currentHeadSubject": "Autonomous post-deploy evidence sync",
    "selectedRunHeadSha": "85d70aa70f5865b0956b2dcb35775ad3aee58729",
    "selectedRunHeadMatchesCurrent": false,
    "selectedRunHeadMatchesDeploySource": true,
    "currentHeadIsPostDeployEvidenceCommit": true,
    "currentHeadDeployed": false,
    "deploySourceHeadSha": "85d70aa70f5865b0956b2dcb35775ad3aee58729",
    "deploySourceDeployed": true,
    "currentHeadQueuedOrRunning": false,
    "currentHeadSuccessfulRunId": null,
    "currentHeadActiveRunId": null,
    "latestRunId": 26449251198,
    "latestRunStatus": "completed",
    "latestRunConclusion": "success",
    "latestRunHeadSha": "85d70aa70f5865b0956b2dcb35775ad3aee58729",
    "liveMatchesCurrentLocalCandidate": false,
    "liveCandidateId": "pwa-834480f69b0d",
    "localCandidateId": "pwa-7f7c75582acb",
    "liveAggregateHash": "834480f69b0dcd7224fe67ea120469253651891f0d9ad5dd7bd2fbb12b58ac60",
    "localAggregateHash": "7f7c75582acb7ca35d3302f150a271a2a425da6869971ee4f1c2700c21acb439",
    "workflowRunListAvailable": true
  },
  "artifact": {
    "status": "post-deploy-smoke-passed",
    "generatedAt": "2026-05-26T12:56:33.758Z",
    "target": {
      "origin": "https://moshequ.github.io/autonomous-game-lab/",
      "originSource": "agl-deployed-pwa-origin",
      "provider": "github-pages",
      "candidateId": "pwa-834480f69b0d",
      "aggregateHash": "834480f69b0dcd7224fe67ea120469253651891f0d9ad5dd7bd2fbb12b58ac60",
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
      "candidateId": "pwa-834480f69b0d",
      "aggregateHash": "834480f69b0dcd7224fe67ea120469253651891f0d9ad5dd7bd2fbb12b58ac60",
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
    "reportSha256": "3209c79f81257a86465834d1451507dbcfe928c47d5c56f198932f747516c225"
  },
  "live": {
    "origin": "https://moshequ.github.io/autonomous-game-lab/",
    "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "status": 200,
    "finalUrl": "https://moshequ.github.io/autonomous-game-lab/release-candidate.json",
    "contentType": "application/json; charset=utf-8",
    "bytes": 39579,
    "textSha256": "2b6b3938e936661dddc34df33deb4547f5d4a64a47b4ed4812e7e5b274edc9ad",
    "releaseStatus": "release-candidate-ready",
    "candidateId": "pwa-834480f69b0d",
    "aggregateHash": "834480f69b0dcd7224fe67ea120469253651891f0d9ad5dd7bd2fbb12b58ac60",
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
      "detail": "Latest successful web-pwa-deploy.yml run is 26449251198."
    },
    {
      "id": "post-deploy-smoke-artifact",
      "status": "pass",
      "detail": "Downloaded post-deploy-smoke artifact from run 26449251198."
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
      "detail": "Current main 4f82407ad827 is the post-deploy evidence commit for deployed source 85d70aa70f58."
    }
  ],
  "nextActions": [
    "Current main is the post-deploy evidence commit for the deployed source; deploy again only when public evidence pages must mirror the evidence commit immediately.",
    "Keep this strict deploy artifact as live-production evidence while local candidates continue to iterate.",
    "Keep revenue, paid acquisition, and store submission disabled until product, credential, and account gates pass."
  ]
} as const

export type PostDeployArtifactSync = typeof postDeployArtifactSync
