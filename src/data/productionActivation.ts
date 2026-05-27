export const productionActivation = {
  "generatedAt": "2026-05-27T05:03:32.054Z",
  "status": "activation-ready",
  "mode": "dry-run",
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
  "sourceStatus": {
    "repositoryReadiness": "repository-channel-ready",
    "repositoryBootstrap": "repository-bootstrap-ready",
    "productionBootstrap": "production-bootstrap-ready",
    "deployment": "ready-for-pages",
    "postDeploySmoke": "post-deploy-smoke-observed-live"
  },
  "configuration": {
    "activationRequested": false,
    "repositoryTargetKnown": true,
    "ghCredentialReady": true,
    "deploymentReady": true,
    "runWebWorkflows": false,
    "allowRepositoryBootstrap": false,
    "allowAndroidWorkflow": false,
    "configuredVariables": 10,
    "configuredSecrets": 5
  },
  "controls": {
    "zeroPaidSpend": true,
    "noPaidResourcesCreated": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "dryRunByDefault": true,
    "activationRequiresExplicitEnv": true,
    "repositoryMutationRequiresExplicitBootstrapGates": true,
    "workflowDispatchRequiresReadyDeployment": true,
    "androidWorkflowRequiresStoreEconomics": true,
    "secretValuesRedacted": true
  },
  "plannedActions": [
    {
      "id": "repository-bootstrap",
      "command": "ops/github/bootstrap-repository.sh",
      "status": "waiting-for-explicit-bootstrap-gate",
      "canRun": false,
      "costUsd": 0,
      "mutatesExternalState": false,
      "reason": "Held until AGL_ALLOW_REPOSITORY_BOOTSTRAP=1 and the specific repository mutation gates are present.",
      "args": [],
      "runnableNow": false
    },
    {
      "id": "sync-production-settings",
      "command": "ops/github/setup-production.sh",
      "status": "ready",
      "canRun": false,
      "costUsd": 0,
      "mutatesExternalState": true,
      "reason": "GitHub credentials and repository target are available; setup can sync configured variables, secrets, and Pages settings.",
      "args": [],
      "runnableNow": false
    }
  ],
  "execution": {
    "requested": false,
    "status": "dry-run",
    "attemptedActions": [],
    "results": []
  },
  "nextActions": [
    "Set AGL_PRODUCTION_ACTIVATE=1 in the production automation environment to apply configured zero-spend GitHub/Pages setup.",
    "Set AGL_PRODUCTION_RUN_WORKFLOWS=1 only after Pages settings and repository variables are configured.",
    "Android workflow dispatch stays held until store economics, signing, and Play credentials clear."
  ]
} as const

export type ProductionActivation = typeof productionActivation
