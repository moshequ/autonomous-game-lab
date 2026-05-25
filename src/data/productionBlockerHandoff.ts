export const productionBlockerHandoff = {
  "status": "handoff-waiting-on-owner-inputs",
  "statusDetail": "blocked-external-inputs",
  "summary": {
    "totalItems": 8,
    "ownerActionRequired": 4,
    "externalOwnerActions": 4,
    "zeroCostFirstActions": 1,
    "missingEnv": 7,
    "missingEnvironmentItems": 7,
    "missingSecrets": 3,
    "productGateBlockers": 3,
    "publicSupportChannelReady": true,
    "storeSupportEmailNeededNow": false,
    "nextBestUnlockId": "production-analytics-browser",
    "nextBestUnlock": "production-analytics-browser",
    "nextBestZeroCostUnlockId": "production-analytics-browser"
  },
  "controls": {
    "zeroPaidSpend": true,
    "noSecretValues": true,
    "noSecretValuesStored": true,
    "noMutation": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "productGatesStillRequiredForRevenue": true,
    "storeSpendStillBlockedByUnitEconomics": true
  },
  "sourceStatus": {
    "productionEnvironment": "production-env-missing",
    "productionBootstrap": "production-bootstrap-ready",
    "objectiveAudit": "objective-in-progress",
    "autonomousOwnerLoop": "owner-loop-ready",
    "supportChannel": "support-channel-ready",
    "monetization": "blocked-by-product-gates",
    "storeCompliance": "draft-ready-external-blockers",
    "storeReadiness": "store-readiness-prepared-external-blockers",
    "androidRelease": "blocked-needs-host-signing-play",
    "iosRelease": "deferred-until-ios-payback",
    "unitEconomics": "no-spend",
    "postDeployArtifactSync": "post-deploy-artifact-sync-passed"
  },
  "topHandoffItems": [
    {
      "id": "support-contact",
      "title": "Web support channel and store support email",
      "status": "web-support-ready-store-email-deferred",
      "category": "store-compliance",
      "costMode": "zero-spend-public-issues-ready",
      "ownerInputRequired": false,
      "unlockKit": null
    },
    {
      "id": "production-analytics-browser",
      "title": "Browser production analytics",
      "status": "owner-input-required",
      "category": "measurement",
      "costMode": "zero-spend-use-existing-free-tier-or-first-party-collector",
      "ownerInputRequired": true,
      "unlockKit": {
        "id": "production-analytics-browser",
        "recommendedPathId": "first-party-collector",
        "lowestInputPathId": "posthog-browser",
        "lowestInputMissingVariableCount": 2,
        "lowestInputMissingSecretCount": 0,
        "commandCount": 5,
        "validationCommandCount": 4
      }
    },
    {
      "id": "autonomous-rollup-credentials",
      "title": "Autonomous production rollups",
      "status": "owner-input-required",
      "category": "measurement",
      "costMode": "use-existing-collector-or-posthog-project",
      "ownerInputRequired": true,
      "unlockKit": null
    },
    {
      "id": "product-gate-sample",
      "title": "Product-gate live sample",
      "status": "needs-live-sample",
      "category": "product-gates",
      "costMode": "zero-paid-acquisition-only",
      "ownerInputRequired": false,
      "unlockKit": null
    }
  ],
  "nextUnlockKit": {
    "id": "production-analytics-browser",
    "title": "Browser production analytics unlock kit",
    "status": "owner-input-required",
    "recommendedPathId": "first-party-collector",
    "lowestInputPathId": "posthog-browser",
    "lowestInputPathTitle": "PostHog browser capture",
    "lowestInputPathStatus": "needs-public-project-key",
    "lowestInputMissingVariableCount": 2,
    "lowestInputMissingSecretCount": 0,
    "lowestInputMissingInputCount": 2,
    "lowestInputReason": "PostHog browser capture currently needs 2 missing input(s), compared with 4 for the recommended path.",
    "commandCount": 5,
    "validationCommandCount": 4,
    "missingVariableCount": 5,
    "missingSecretCount": 1,
    "controls": {
      "zeroPaidSpend": true,
      "noSecretValues": true,
      "noSecretValuesStored": true,
      "noAccountCreation": true,
      "noStoreSubmission": true,
      "noRevenueEnablement": true,
      "githubVariablesOnly": true,
      "secretCommandsUseStdin": true
    },
    "paths": [
      {
        "id": "first-party-collector",
        "title": "First-party event collector",
        "status": "needs-variables-and-secrets",
        "costMode": "zero-spend-use-existing-cloudflare-free-tier",
        "ownerInputRequired": true,
        "missingVariableCount": 3,
        "missingSecretCount": 1,
        "missingInputCount": 4,
        "commandCount": 5,
        "validationCommandCount": 4,
        "requiredVariables": [
          {
            "id": "var-cloudflare-account-id",
            "repositoryName": "CLOUDFLARE_ACCOUNT_ID",
            "envName": "CLOUDFLARE_ACCOUNT_ID",
            "configured": false,
            "valueSource": "missing",
            "command": "gh variable set CLOUDFLARE_ACCOUNT_ID --body \"$CLOUDFLARE_ACCOUNT_ID\""
          },
          {
            "id": "var-agl-event-collector-r2-bucket",
            "repositoryName": "AGL_EVENT_COLLECTOR_R2_BUCKET",
            "envName": "AGL_EVENT_COLLECTOR_R2_BUCKET",
            "configured": true,
            "valueSource": "github-variable",
            "command": "gh variable set AGL_EVENT_COLLECTOR_R2_BUCKET --body \"$AGL_EVENT_COLLECTOR_R2_BUCKET\""
          },
          {
            "id": "var-agl-event-collector-allowed-origins",
            "repositoryName": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
            "envName": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
            "configured": true,
            "valueSource": "github-variable",
            "command": "gh variable set AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS --body \"$AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS\""
          },
          {
            "id": "var-vite-event-collector-url",
            "repositoryName": "VITE_EVENT_COLLECTOR_URL",
            "envName": "VITE_EVENT_COLLECTOR_URL",
            "configured": false,
            "valueSource": "missing",
            "command": "gh variable set VITE_EVENT_COLLECTOR_URL --body \"$VITE_EVENT_COLLECTOR_URL\""
          },
          {
            "id": "var-agl-event-collector-export-url",
            "repositoryName": "AGL_EVENT_COLLECTOR_EXPORT_URL",
            "envName": "AGL_EVENT_COLLECTOR_EXPORT_URL",
            "configured": false,
            "valueSource": "missing",
            "command": "gh variable set AGL_EVENT_COLLECTOR_EXPORT_URL --body \"$AGL_EVENT_COLLECTOR_EXPORT_URL\""
          }
        ],
        "requiredSecrets": [
          {
            "id": "secret-cloudflare-api-token",
            "repositoryName": "CLOUDFLARE_API_TOKEN",
            "envName": "CLOUDFLARE_API_TOKEN",
            "configured": false,
            "valueSource": "missing",
            "command": "printf \"%s\" \"$CLOUDFLARE_API_TOKEN\" | gh secret set CLOUDFLARE_API_TOKEN"
          },
          {
            "id": "secret-vite-event-collector-write-token",
            "repositoryName": "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
            "envName": "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
            "configured": true,
            "valueSource": "github-secret",
            "command": "printf \"%s\" \"$VITE_EVENT_COLLECTOR_WRITE_TOKEN\" | gh secret set VITE_EVENT_COLLECTOR_WRITE_TOKEN"
          },
          {
            "id": "secret-agl-event-collector-admin-token",
            "repositoryName": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
            "envName": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
            "configured": true,
            "valueSource": "github-secret",
            "command": "printf \"%s\" \"$AGL_EVENT_COLLECTOR_ADMIN_TOKEN\" | gh secret set AGL_EVENT_COLLECTOR_ADMIN_TOKEN"
          }
        ],
        "commandSequence": [
          "npm run autonomous:event-collector-smoke",
          "npm run autonomous:collector-deploy-plan",
          "./ops/github/setup-production.sh",
          "RUN_WORKFLOWS=1 ./ops/github/setup-production.sh",
          "npm run autonomous:readiness"
        ],
        "validationCommands": [
          "npm run autonomous:event-collector-smoke",
          "npm run autonomous:collector-deploy-plan",
          "npm run autonomous:readiness",
          "npm run test:e2e"
        ]
      },
      {
        "id": "posthog-browser",
        "title": "PostHog browser capture",
        "status": "needs-public-project-key",
        "costMode": "zero-spend-use-existing-posthog-free-project",
        "ownerInputRequired": true,
        "missingVariableCount": 2,
        "missingSecretCount": 0,
        "missingInputCount": 2,
        "commandCount": 3,
        "validationCommandCount": 2,
        "requiredVariables": [
          {
            "id": "var-vite-posthog-key",
            "repositoryName": "VITE_POSTHOG_KEY",
            "envName": "VITE_POSTHOG_KEY",
            "configured": false,
            "valueSource": "missing",
            "command": "gh variable set VITE_POSTHOG_KEY --body \"$VITE_POSTHOG_KEY\""
          },
          {
            "id": "var-vite-posthog-host",
            "repositoryName": "VITE_POSTHOG_HOST",
            "envName": "VITE_POSTHOG_HOST",
            "configured": false,
            "valueSource": "missing",
            "command": "gh variable set VITE_POSTHOG_HOST --body \"$VITE_POSTHOG_HOST\""
          }
        ],
        "requiredSecrets": [],
        "commandSequence": [
          "./ops/github/setup-production.sh",
          "RUN_WORKFLOWS=1 ./ops/github/setup-production.sh",
          "npm run autonomous:readiness"
        ],
        "validationCommands": [
          "npm run autonomous:readiness",
          "npm run test:e2e"
        ]
      }
    ]
  },
  "ownerUnlockBrief": {
    "status": "waiting-on-owner-input",
    "nextUnlockId": "production-analytics-browser",
    "recommendedPathId": "first-party-collector",
    "lowestInputPathId": "posthog-browser",
    "lowestInputMissingVariableCount": 2,
    "lowestInputMissingSecretCount": 0,
    "minimalInterventionPath": {
      "id": "posthog-browser",
      "missingInputCount": 2,
      "missingSecretCount": 0,
      "manualInputReduction": 2,
      "noSecretsRequired": true
    },
    "missingVariableCount": 3,
    "missingSecretCount": 1,
    "setupCommands": [
      "npm run autonomous:event-collector-smoke",
      "npm run autonomous:collector-deploy-plan",
      "./ops/github/setup-production.sh",
      "RUN_WORKFLOWS=1 ./ops/github/setup-production.sh",
      "npm run autonomous:readiness"
    ],
    "validationCommands": [
      "npm run autonomous:event-collector-smoke",
      "npm run autonomous:collector-deploy-plan",
      "npm run autonomous:readiness",
      "npm run test:e2e"
    ],
    "parallelOwnerUnlocks": [
      {
        "id": "production-analytics-browser",
        "category": "measurement",
        "publicStatusPage": "/measurement-status.html",
        "missingVariableCount": 3,
        "missingSecretCount": 1,
        "lowestInputMissingInputCount": 2
      },
      {
        "id": "support-contact",
        "category": "store-readiness",
        "publicStatusPage": "/store-readiness.html",
        "missingVariableCount": 1,
        "missingSecretCount": 0,
        "lowestInputMissingInputCount": 1
      }
    ],
    "controls": {
      "zeroPaidSpend": true,
      "noSecretValues": true,
      "noSecretValuesStored": true,
      "noAccountCreation": true,
      "noStoreSubmission": true,
      "noRevenueEnablement": true,
      "productGatesStillRequiredForRevenue": true,
      "secretCommandsUseStdin": true
    }
  },
  "nextActions": [
    "Start with Browser production analytics; it is the highest-priority zero-spend owner input.",
    "After any owner-provided variable or secret changes, run npm run autonomous:readiness and npm run test:e2e."
  ]
} as const

export type ProductionBlockerHandoff = typeof productionBlockerHandoff
