export const repositoryReadiness = {
  "generatedAt": "2026-05-20T05:01:29.699Z",
  "status": "waiting-for-github-repository",
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
  "workspace": {
    "path": "/Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new",
    "insideWorkTree": true,
    "gitRoot": "/Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new",
    "currentBranch": "main",
    "dirtyFiles": 41,
    "dirtyPaths": [
      "data/autonomous-cadence.json",
      "data/autonomous-operator-history.json",
      "data/autonomous-operator.json",
      "data/autonomous-owner-loop.json",
      "data/deployment-plan.json",
      "data/objective-audit.json",
      "data/performance-budget.json",
      "data/post-deploy-smoke.json",
      "data/production-readiness.json",
      "data/release-candidate.json",
      "data/repository-bootstrap.json",
      "data/repository-readiness.json",
      "reports/autonomous-cadence-latest.md",
      "reports/autonomous-operator-history-latest.md",
      "reports/autonomous-operator-latest.md",
      "reports/autonomous-owner-loop-latest.md",
      "reports/deployment-plan-latest.md",
      "reports/objective-audit-latest.md",
      "reports/performance-budget-latest.md",
      "reports/post-deploy-smoke-latest.md",
      "reports/production-readiness-latest.md",
      "reports/release-candidate-latest.md",
      "reports/repository-bootstrap-latest.md",
      "reports/repository-readiness-latest.md",
      "scripts/production-readiness.mjs",
      "scripts/repository-bootstrap.mjs",
      "scripts/repository-readiness.mjs",
      "scripts/verify-autonomy.mjs",
      "src/App.tsx",
      "src/data/autonomousCadence.ts",
      "src/data/autonomousOperator.ts",
      "src/data/autonomousOperatorHistory.ts",
      "src/data/autonomousOwnerLoop.ts",
      "src/data/deploymentPlan.ts",
      "src/data/objectiveAudit.ts",
      "src/data/performanceBudget.ts",
      "src/data/postDeploySmoke.ts",
      "src/data/releaseCandidate.ts",
      "src/data/repositoryBootstrap.ts",
      "src/data/repositoryReadiness.ts",
      "tests/smoke.spec.ts"
    ],
    "generatedEvidenceDirtyFiles": 35,
    "generatedEvidenceDirtyPaths": [
      "data/autonomous-cadence.json",
      "data/autonomous-operator-history.json",
      "data/autonomous-operator.json",
      "data/autonomous-owner-loop.json",
      "data/deployment-plan.json",
      "data/objective-audit.json",
      "data/performance-budget.json",
      "data/post-deploy-smoke.json",
      "data/production-readiness.json",
      "data/release-candidate.json",
      "data/repository-bootstrap.json",
      "data/repository-readiness.json",
      "reports/autonomous-cadence-latest.md",
      "reports/autonomous-operator-history-latest.md",
      "reports/autonomous-operator-latest.md",
      "reports/autonomous-owner-loop-latest.md",
      "reports/deployment-plan-latest.md",
      "reports/objective-audit-latest.md",
      "reports/performance-budget-latest.md",
      "reports/post-deploy-smoke-latest.md",
      "reports/production-readiness-latest.md",
      "reports/release-candidate-latest.md",
      "reports/repository-bootstrap-latest.md",
      "reports/repository-readiness-latest.md",
      "src/data/autonomousCadence.ts",
      "src/data/autonomousOperator.ts",
      "src/data/autonomousOperatorHistory.ts",
      "src/data/autonomousOwnerLoop.ts",
      "src/data/deploymentPlan.ts",
      "src/data/objectiveAudit.ts",
      "src/data/performanceBudget.ts",
      "src/data/postDeploySmoke.ts",
      "src/data/releaseCandidate.ts",
      "src/data/repositoryBootstrap.ts",
      "src/data/repositoryReadiness.ts"
    ],
    "nonGeneratedDirtyFiles": 6,
    "nonGeneratedDirtyPaths": [
      "scripts/production-readiness.mjs",
      "scripts/repository-bootstrap.mjs",
      "scripts/repository-readiness.mjs",
      "scripts/verify-autonomy.mjs",
      "src/App.tsx",
      "tests/smoke.spec.ts"
    ]
  },
  "repository": {
    "target": null,
    "source": "missing",
    "originRemote": null,
    "remoteRepository": null,
    "ownerHint": null,
    "ownerHintEnv": null,
    "ownerHintTarget": null,
    "inferredTarget": null,
    "inferredTargetSource": null,
    "packageName": "autonomous-game-lab",
    "inferredRepositoryName": "autonomous-game-lab",
    "remoteParsing": {
      "supportsHttps": true,
      "supportsSshScp": true,
      "supportsSshUrl": true,
      "supportsDottedRepositoryNames": true,
      "supportsOwnerHint": true
    }
  },
  "githubAutomation": {
    "ghCliAvailable": true,
    "ghAuthAvailable": false,
    "ghCredentialReady": false,
    "ghTokenConfigured": false,
    "ghUserLogin": null,
    "workflowDispatchReady": false,
    "canSyncRepositorySettings": false
  },
  "pages": {
    "workflowPath": ".github/workflows/web-pwa-deploy.yml",
    "workflowExists": true,
    "deployWorkflowIncludesSmoke": true,
    "deploymentStatus": "ready-for-pages",
    "releaseCandidateId": "pwa-a2e35511b315",
    "postDeploySmokeStatus": "blocked-missing-origin"
  },
  "repositoryTargetPlan": {
    "status": "needs-owner-or-auth",
    "repositoryName": "autonomous-game-lab",
    "target": null,
    "targetSource": "missing",
    "placeholderTarget": "OWNER/autonomous-game-lab",
    "plannedTarget": "OWNER/autonomous-game-lab",
    "ownerRequired": true,
    "githubNewRepositoryUrl": "https://github.com/new?name=autonomous-game-lab&visibility=public",
    "httpsOriginUrl": "https://github.com/OWNER/autonomous-game-lab.git",
    "sshOriginUrl": "git@github.com:OWNER/autonomous-game-lab.git",
    "pages": {
      "origin": "https://OWNER.github.io/autonomous-game-lab",
      "basePath": "/autonomous-game-lab/",
      "privacyUrl": "https://OWNER.github.io/autonomous-game-lab/privacy.html",
      "supportUrl": "https://OWNER.github.io/autonomous-game-lab/support.html"
    },
    "recommendedEnvironment": {
      "AGL_GITHUB_OWNER": "<github-owner>",
      "GITHUB_REPOSITORY": "OWNER/autonomous-game-lab",
      "AGL_PUBLIC_ORIGIN": "https://OWNER.github.io/autonomous-game-lab",
      "VITE_BASE_PATH": "/autonomous-game-lab/"
    },
    "explicitCommands": {
      "createRepository": "GITHUB_REPOSITORY=OWNER/autonomous-game-lab AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_GITHUB_REPO_CREATE=1 ./ops/github/bootstrap-repository.sh",
      "attachOrigin": "GITHUB_REPOSITORY=OWNER/autonomous-game-lab AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_ORIGIN_REMOTE=1 ./ops/github/bootstrap-repository.sh",
      "pushSnapshot": "GITHUB_REPOSITORY=OWNER/autonomous-game-lab AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_SNAPSHOT_COMMIT=1 AGL_ALLOW_PUSH=1 ./ops/github/bootstrap-repository.sh"
    },
    "controls": {
      "zeroPaidSpend": true,
      "publicRepositoryRecommended": true,
      "noAccountCreation": true,
      "remoteMutationRequiresExplicitEnv": true,
      "workflowDispatchBlocked": true
    }
  },
  "controls": {
    "zeroPaidSpend": true,
    "readOnlyLocalInspection": true,
    "noGitMutation": true,
    "noWorkflowDispatch": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true
  },
  "checks": [
    {
      "id": "local-git-worktree",
      "status": "pass",
      "detail": "Git worktree detected at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new."
    },
    {
      "id": "github-target",
      "status": "blocker",
      "detail": "Set GITHUB_REPOSITORY/GH_REPO, add a GitHub origin remote, or authenticate gh so the target can be inferred."
    },
    {
      "id": "origin-remote",
      "status": "blocker",
      "detail": "No GitHub origin remote is available from this workspace."
    },
    {
      "id": "gh-cli",
      "status": "pass",
      "detail": "gh version 2.90.0 (2026-04-16)"
    },
    {
      "id": "gh-token",
      "status": "external-blocker",
      "detail": "Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for non-interactive workflow dispatch."
    },
    {
      "id": "pages-workflow",
      "status": "pass",
      "detail": "Web PWA Deploy workflow exists and includes post-deploy smoke."
    },
    {
      "id": "deployable-artifact",
      "status": "pass",
      "detail": "Deployment ready-for-pages; release candidate release-candidate-ready; smoke blocked-missing-origin."
    }
  ],
  "blockers": [
    "Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO, set AGL_GITHUB_OWNER, or authenticate gh to infer the target repository.",
    "Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for workflow dispatch and repository settings sync."
  ],
  "setupRequiredOnce": [
    "Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO to owner/repo, set AGL_GITHUB_OWNER to infer owner/package-name, or authenticate gh.",
    "Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN before non-interactive workflow dispatch.",
    "Let the production bootstrap helper enable GitHub Pages with GitHub Actions as the source once gh credentials exist."
  ],
  "nextActions": [
    "Prepare the GitHub repository channel before treating the web deploy as runnable.",
    "Keep this script read-only; repository creation, workflow dispatch, and settings sync stay in guarded bootstrap commands."
  ]
} as const

export type RepositoryReadiness = typeof repositoryReadiness
