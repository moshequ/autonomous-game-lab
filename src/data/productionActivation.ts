export const productionActivation = {
  "generatedAt": "2026-05-20T07:15:12.105Z",
  "status": "activation-applied",
  "mode": "apply-configured-actions",
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
  "sourceStatus": {
    "repositoryReadiness": "repository-channel-ready",
    "repositoryBootstrap": "repository-bootstrap-ready",
    "productionBootstrap": "production-bootstrap-ready",
    "deployment": "ready-for-pages",
    "postDeploySmoke": "blocked-missing-origin"
  },
  "configuration": {
    "activationRequested": true,
    "repositoryTargetKnown": true,
    "ghCredentialReady": true,
    "deploymentReady": true,
    "runWebWorkflows": false,
    "allowRepositoryBootstrap": false,
    "allowAndroidWorkflow": false,
    "configuredVariables": 6,
    "configuredSecrets": 3
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
      "canRun": true,
      "costUsd": 0,
      "mutatesExternalState": true,
      "reason": "GitHub credentials and repository target are available; setup can sync configured variables, secrets, and Pages settings.",
      "args": [],
      "runnableNow": true
    }
  ],
  "execution": {
    "requested": true,
    "status": "executed",
    "attemptedActions": [
      "sync-production-settings"
    ],
    "results": [
      {
        "id": "sync-production-settings",
        "exitCode": 0,
        "stdoutTail": [
          "skip variable AGL_AUTONOMOUS_SELF_UPDATE: AGL_AUTONOMOUS_SELF_UPDATE is not set",
          "skip variable AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: AGL_AUTONOMOUS_SELF_UPDATE_DIRECT is not set",
          "skip secret CLOUDFLARE_API_TOKEN: CLOUDFLARE_API_TOKEN is not set",
          "skip secret VITE_EVENT_COLLECTOR_WRITE_TOKEN: VITE_EVENT_COLLECTOR_WRITE_TOKEN is not set",
          "skip secret AGL_EVENT_COLLECTOR_ADMIN_TOKEN: AGL_EVENT_COLLECTOR_ADMIN_TOKEN is not set",
          "skip secret POSTHOG_PERSONAL_API_KEY: POSTHOG_PERSONAL_API_KEY is not set",
          "skip secret GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not set",
          "Production GitHub variables/secrets sync complete for configured values.",
          "GitHub Pages HTTPS enforcement pending for moshequ/autonomous-game-lab; certificate may still be provisioning.",
          "GitHub Pages source set to Actions workflow for moshequ/autonomous-game-lab"
        ],
        "stderrTail": [
          "gh: The certificate does not exist yet (HTTP 404)"
        ]
      }
    ]
  },
  "nextActions": [
    "Set AGL_PRODUCTION_ACTIVATE=1 in the production automation environment to apply configured zero-spend GitHub/Pages setup.",
    "Set AGL_PRODUCTION_RUN_WORKFLOWS=1 only after Pages settings and repository variables are configured.",
    "Android workflow dispatch stays held until store economics, signing, and Play credentials clear."
  ]
} as const

export type ProductionActivation = typeof productionActivation
