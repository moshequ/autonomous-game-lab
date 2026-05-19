export const autonomousSelfUpdate = {
  "generatedAt": "2026-05-19T02:35:30.104Z",
  "status": "self-update-needs-attention",
  "mode": "plan-and-assert",
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
    "target": null,
    "originRemote": null,
    "remoteRepository": null,
    "currentBranch": "main",
    "insideWorkTree": true,
    "githubTokenConfigured": false,
    "directPushConfigured": false,
    "selfUpdateEnabled": false,
    "remotePushReady": false
  },
  "sourceStatus": {
    "repositoryReadiness": "waiting-for-github-repository",
    "productionReadiness": "ready-after-build",
    "autonomousCadence": "cadence-ready",
    "ownerLoop": "owner-loop-ready"
  },
  "pendingChanges": {
    "total": 16,
    "safe": [
      {
        "code": "??",
        "path": "data/autonomous-self-update.json",
        "raw": "?? data/autonomous-self-update.json",
        "safe": true,
        "reason": "allowlisted-generated-artifact"
      },
      {
        "code": "??",
        "path": "reports/autonomous-self-update-latest.md",
        "raw": "?? reports/autonomous-self-update-latest.md",
        "safe": true,
        "reason": "allowlisted-generated-artifact"
      },
      {
        "code": "??",
        "path": "src/data/autonomousSelfUpdate.ts",
        "raw": "?? src/data/autonomousSelfUpdate.ts",
        "safe": true,
        "reason": "allowlisted-generated-artifact"
      }
    ],
    "unsafe": [
      {
        "code": "M",
        "path": "package.json",
        "raw": " M package.json",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/autonomous-cadence.mjs",
        "raw": " M scripts/autonomous-cadence.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/autonomous-operator.mjs",
        "raw": " M scripts/autonomous-operator.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/autonomous-owner-loop.mjs",
        "raw": " M scripts/autonomous-owner-loop.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/objective-audit.mjs",
        "raw": " M scripts/objective-audit.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/production-bootstrap.mjs",
        "raw": " M scripts/production-bootstrap.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/production-environment.mjs",
        "raw": " M scripts/production-environment.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/production-readiness.mjs",
        "raw": " M scripts/production-readiness.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "scripts/verify-autonomy.mjs",
        "raw": " M scripts/verify-autonomy.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "src/App.tsx",
        "raw": " M src/App.tsx",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "M",
        "path": "tests/smoke.spec.ts",
        "raw": " M tests/smoke.spec.ts",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "??",
        "path": ".github/workflows/autonomous-self-update.yml",
        "raw": "?? .github/workflows/autonomous-self-update.yml",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      },
      {
        "code": "??",
        "path": "scripts/autonomous-self-update.mjs",
        "raw": "?? scripts/autonomous-self-update.mjs",
        "safe": false,
        "reason": "outside-autonomous-generated-allowlist"
      }
    ],
    "safeCount": 3,
    "unsafeCount": 13
  },
  "commitPlan": {
    "workflow": ".github/workflows/autonomous-self-update.yml",
    "enabledByRepositoryVariable": "AGL_AUTONOMOUS_SELF_UPDATE=1",
    "directPushRequiresRepositoryVariable": "AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1",
    "verificationBeforeCommit": [
      "npm run autonomous:daily",
      "npm run test:e2e",
      "npm run autonomous:self-update -- --assert-safe"
    ],
    "stagePaths": [
      "data/autonomous-self-update.json",
      "reports/autonomous-self-update-latest.md",
      "src/data/autonomousSelfUpdate.ts"
    ],
    "commitMessage": "Autonomous daily self-update",
    "skipWhenNoAllowlistedChanges": true
  },
  "policy": {
    "allowedPrefixes": [
      "data/",
      "reports/",
      "src/data/",
      "public/games/",
      "public/icons/",
      "public/store-assets/",
      "native/android/",
      "ops/codex/"
    ],
    "allowedExactPaths": [
      "ops/cloudflare/wrangler.toml.example",
      "ops/github/README.md",
      "ops/github/bootstrap-repository.sh",
      "ops/github/setup-production.sh",
      "ops/production.env.example",
      "public/app-ads.txt",
      "public/monetization.json",
      "public/privacy.html",
      "public/robots.txt",
      "public/share-manifest.json",
      "public/sitemap.xml",
      "public/support.html"
    ],
    "blockedPrefixes": [
      ".github/workflows/",
      "scripts/",
      "src/App.tsx",
      "src/components/",
      "src/game/",
      "src/lib/",
      "docs/"
    ],
    "blockedExactPaths": [
      "README.md",
      "package-lock.json",
      "package.json",
      "vite.config.ts"
    ],
    "selfReportPaths": [
      "data/autonomous-self-update.json",
      "src/data/autonomousSelfUpdate.ts",
      "reports/autonomous-self-update-latest.md"
    ]
  },
  "controls": {
    "zeroPaidSpend": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noPaidAcquisition": true,
    "dailyWorkflowReadOnly": true,
    "writePermissionIsolatedToSelfUpdateWorkflow": true,
    "commitRequiresCleanVerification": true,
    "commitRequiresSafePathAllowlist": true,
    "remotePushRequiresGitHubToken": true,
    "directPushRequiresExplicitVariable": true,
    "doesNotStageSourceOrWorkflowChanges": true
  },
  "checks": [
    {
      "id": "script-registered",
      "status": "pass",
      "detail": "autonomous:self-update is node scripts/autonomous-self-update.mjs."
    },
    {
      "id": "daily-loop-refresh",
      "status": "pass",
      "detail": "autonomous:daily refreshes self-update evidence before owner/audit evidence."
    },
    {
      "id": "daily-workflow-read-only",
      "status": "pass",
      "detail": "The ordinary daily workflow remains read-only and uploads evidence artifacts."
    },
    {
      "id": "self-update-workflow",
      "status": "pass",
      "detail": "A separate gated workflow can reproduce the daily loop, verify it, and persist allowlisted changes."
    },
    {
      "id": "safe-path-allowlist",
      "status": "blocker",
      "detail": "3 safe pending file(s), 13 unsafe pending file(s)."
    },
    {
      "id": "repository-optional",
      "status": "pass",
      "detail": "Git worktree is available on main."
    },
    {
      "id": "remote-push-gated",
      "status": "pass",
      "detail": "Remote push remains held until GitHub credentials and AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1 are configured."
    },
    {
      "id": "zero-spend-controls",
      "status": "pass",
      "detail": "Self-update only stages repository artifacts; it does not create accounts, stores, ads, paid traffic, or revenue."
    }
  ],
  "blockers": [
    "safe-path-allowlist: 3 safe pending file(s), 13 unsafe pending file(s)."
  ],
  "nextActions": [
    "Fix self-update workflow or allowlist blockers before enabling autonomous persistence.",
    "Keep source-code changes outside this allowlist so production automation cannot rewrite core app logic without an explicit development change."
  ]
} as const

export type AutonomousSelfUpdate = typeof autonomousSelfUpdate
