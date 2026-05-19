export const repositoryBootstrap = {
  "generatedAt": "2026-05-19T03:24:28.542Z",
  "status": "waiting-for-github-target",
  "mode": "plan-only",
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
    "before": {
      "insideWorkTree": true,
      "gitRoot": "/Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new",
      "currentBranch": "main",
      "originRemote": null,
      "remoteRepository": null,
      "hasCommit": true,
      "dirtyFiles": 3
    },
    "after": {
      "insideWorkTree": true,
      "gitRoot": "/Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new",
      "currentBranch": "main",
      "originRemote": null,
      "remoteRepository": null,
      "hasCommit": true,
      "dirtyFiles": 3
    }
  },
  "repository": {
    "target": null,
    "originRemote": null,
    "remoteRepository": null
  },
  "githubAutomation": {
    "ghCliAvailable": true,
    "ghAuthAvailable": false,
    "ghTokenConfigured": false,
    "ghReady": false
  },
  "sourceStatus": {
    "repositoryReadiness": "waiting-for-github-repository",
    "deployment": "ready-for-pages",
    "releaseCandidate": "release-candidate-ready",
    "releaseCandidateId": "pwa-5d17285b2e72",
    "postDeploySmoke": "blocked-missing-origin"
  },
  "execution": {
    "applyLocalGitRequested": false,
    "appliedLocalGit": false,
    "localGitResult": null
  },
  "controls": {
    "zeroPaidSpend": true,
    "dryRunByDefault": true,
    "localGitMutationRequiresExplicitFlag": true,
    "remoteGitHubMutationRequiresExplicitEnv": true,
    "initialCommitRequiresExplicitEnv": true,
    "snapshotCommitRequiresExplicitEnv": true,
    "pushRequiresExplicitEnv": true,
    "noWorkflowDispatch": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "helperDoesNotEchoSecrets": true
  },
  "actions": [
    {
      "id": "inspect-repository-channel",
      "status": "done",
      "costUsd": 0,
      "command": "npm run autonomous:repo-readiness",
      "mutatesLocalGit": false,
      "mutatesRemoteGitHub": false,
      "detail": "Repository readiness is waiting-for-github-repository."
    },
    {
      "id": "initialize-local-git",
      "status": "ready",
      "costUsd": 0,
      "command": "npm run autonomous:repo-bootstrap -- --apply-local-git",
      "mutatesLocalGit": true,
      "mutatesRemoteGitHub": false,
      "requiresExplicitFlag": true,
      "detail": "Git worktree is available at /Users/moshequ/Documents/Codex/2026-05-18/i-want-to-have-a-new."
    },
    {
      "id": "create-initial-commit",
      "status": "ready",
      "costUsd": 0,
      "command": "AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_INITIAL_COMMIT=1 ./ops/github/bootstrap-repository.sh",
      "mutatesLocalGit": true,
      "mutatesRemoteGitHub": false,
      "requiresExplicitEnv": true,
      "detail": "The local repository has at least one commit."
    },
    {
      "id": "commit-current-snapshot",
      "status": "ready-for-explicit-snapshot-commit",
      "costUsd": 0,
      "command": "AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_SNAPSHOT_COMMIT=1 ./ops/github/bootstrap-repository.sh",
      "mutatesLocalGit": true,
      "mutatesRemoteGitHub": false,
      "requiresExplicitEnv": true,
      "detail": "3 generated or source file(s) are not committed yet."
    },
    {
      "id": "set-or-create-origin",
      "status": "waiting-for-github-target",
      "costUsd": 0,
      "command": "AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_ORIGIN_REMOTE=1 ./ops/github/bootstrap-repository.sh",
      "mutatesLocalGit": true,
      "mutatesRemoteGitHub": false,
      "requiresExplicitEnv": true,
      "detail": "Set GITHUB_REPOSITORY or GH_REPO before attaching origin."
    },
    {
      "id": "create-github-repository",
      "status": "waiting-for-github-target",
      "costUsd": 0,
      "command": "AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_GITHUB_REPO_CREATE=1 ./ops/github/bootstrap-repository.sh",
      "mutatesLocalGit": false,
      "mutatesRemoteGitHub": true,
      "requiresExplicitEnv": true,
      "detail": "Set GITHUB_REPOSITORY or GH_REPO before creating a GitHub repository."
    },
    {
      "id": "push-initial-snapshot",
      "status": "waiting-for-commit-and-origin",
      "costUsd": 0,
      "command": "AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 AGL_ALLOW_PUSH=1 ./ops/github/bootstrap-repository.sh",
      "mutatesLocalGit": false,
      "mutatesRemoteGitHub": true,
      "requiresExplicitEnv": true,
      "detail": "Push stays held until a committed local snapshot and origin remote exist."
    }
  ],
  "blockers": [
    "Commit current generated changes before pushing to GitHub Pages.",
    "Set GITHUB_REPOSITORY or GH_REPO to the intended owner/repo.",
    "Attach a GitHub origin remote or create the target repository.",
    "Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN for remote repository bootstrap."
  ],
  "helper": {
    "path": "ops/github/bootstrap-repository.sh",
    "status": "generated",
    "requiresEnv": "AGL_ALLOW_REPOSITORY_BOOTSTRAP=1",
    "canInitializeLocalGit": true,
    "canCreateInitialCommit": true,
    "canCommitCurrentSnapshot": true,
    "canAttachOrigin": true,
    "canCreateGithubRepository": true,
    "canPush": true,
    "noWorkflowDispatch": true
  },
  "nextActions": [
    "Set GITHUB_REPOSITORY/GH_REPO and run repository bootstrap with explicit remote flags when credentials exist.",
    "Keep workflow dispatch in production bootstrap; repository bootstrap only prepares git/GitHub transport."
  ]
} as const

export type RepositoryBootstrap = typeof repositoryBootstrap
