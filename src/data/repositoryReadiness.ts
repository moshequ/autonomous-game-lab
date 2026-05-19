export const repositoryReadiness = {
  "generatedAt": "2026-05-19T02:21:08.235Z",
  "status": "waiting-for-github-repository",
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
  "workspace": {
    "path": "/Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new",
    "insideWorkTree": true,
    "gitRoot": "/Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new",
    "currentBranch": "main",
    "dirtyFiles": 0
  },
  "repository": {
    "target": null,
    "source": "missing",
    "originRemote": null,
    "remoteRepository": null
  },
  "githubAutomation": {
    "ghCliAvailable": true,
    "ghTokenConfigured": false,
    "workflowDispatchReady": false,
    "canSyncRepositorySettings": false
  },
  "pages": {
    "workflowPath": ".github/workflows/web-pwa-deploy.yml",
    "workflowExists": true,
    "deployWorkflowIncludesSmoke": true,
    "deploymentStatus": "ready-for-pages",
    "releaseCandidateId": "pwa-20402032da40",
    "postDeploySmokeStatus": "blocked-missing-origin"
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
      "detail": "Set GITHUB_REPOSITORY/GH_REPO or add a GitHub origin remote."
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
      "detail": "GH_TOKEN or GITHUB_TOKEN is not configured for non-interactive workflow dispatch."
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
    "Add a GitHub origin remote or set GITHUB_REPOSITORY/GH_REPO.",
    "Configure GH_TOKEN or GITHUB_TOKEN for workflow dispatch and repository settings sync."
  ],
  "setupRequiredOnce": [
    "Add a GitHub origin remote or set GITHUB_REPOSITORY/GH_REPO to owner/repo.",
    "Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN before non-interactive workflow dispatch.",
    "Enable GitHub Pages with GitHub Actions as the source in the target repository."
  ],
  "nextActions": [
    "Prepare the GitHub repository channel before treating the web deploy as runnable.",
    "Keep this script read-only; repository creation, workflow dispatch, and settings sync stay in guarded bootstrap commands."
  ]
} as const

export type RepositoryReadiness = typeof repositoryReadiness
