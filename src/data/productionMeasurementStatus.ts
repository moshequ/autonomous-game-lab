export const productionMeasurementStatus = {
  "generatedAt": "2026-05-26T17:35:37.562Z",
  "status": "production-measurement-local-intake-ready",
  "activePath": "local-browser-buffer",
  "liveCandidate": "pwa-93d411204f10",
  "liveRelease": {
    "syncedCandidateId": "pwa-93d411204f10",
    "exactManifestPath": "/release-candidate.json",
    "staticJsonMayLagBehindLatestDeploy": true
  },
  "publicEvidenceHandoff": {
    "status": "awaiting-player-initiated-aggregate-notes",
    "aggregateEvidence": {
      "notes": 0,
      "starts": 0,
      "completions": 0
    },
    "controls": {
      "aggregateEvidenceDoesNotPassGates": true,
      "manualReviewRequiredForGateDecisions": true
    }
  },
  "analyticsUnlock": {
    "status": "owner-input-required",
    "recommendedPathId": "first-party-collector",
    "lowestInputPathId": "posthog-browser",
    "lowestInputMissingVariableCount": 1,
    "lowestInputMissingSecretCount": 0,
    "minimalInterventionPathId": "posthog-browser",
    "minimalInterventionMissingInputCount": 1,
    "minimalInterventionSecretInputCount": 0,
    "commandCount": 7,
    "validationCommandCount": 4
  },
  "collectorDeployment": {
    "status": "blocked-needs-cloudflare-env",
    "workflowStatus": "present",
    "deploysWhenConfigured": false,
    "smokeStatus": "pass"
  },
  "externalUnlockQueue": {
    "status": "handoff-waiting-on-owner-inputs",
    "nextBestUnlockId": "production-analytics-browser",
    "nextBestZeroCostUnlockId": "production-analytics-browser",
    "ownerActionRequired": 4,
    "ownerUnlockBrief": {
      "status": "waiting-on-owner-input",
      "nextUnlockId": "production-analytics-browser",
      "recommendedPathId": "first-party-collector",
      "missingVariableCount": 3,
      "missingSecretCount": 1
    }
  },
  "ownerUnlockPreflight": {
    "status": "owner-unlock-preflight-waiting-on-input",
    "readyForSetup": false,
    "lowestInputPathId": "posthog-browser",
    "missingInputCount": 4,
    "invalidInputCount": 0,
    "lowestInputMissingInputCount": 1,
    "lowestInputSecretInputCount": 0,
    "combinedOwnerInputPreflight": {
      "status": "combined-owner-input-preflight-waiting-on-input",
      "readyForSetup": false,
      "localEnvFile": ".env.production.local",
      "unlockIds": [
        "production-analytics-browser",
        "support-contact"
      ],
      "analyticsPathId": "posthog-browser",
      "supportUnlockId": "support-contact",
      "missingInputCount": 2,
      "secretInputCount": 0,
      "invalidInputCount": 0,
      "missingInputNames": [
        "VITE_POSTHOG_KEY",
        "AGL_SUPPORT_EMAIL"
      ],
      "localEnvTemplateLines": [
        "VITE_POSTHOG_KEY=",
        "AGL_SUPPORT_EMAIL="
      ],
      "shellExportTemplateLines": [
        "export VITE_POSTHOG_KEY=",
        "export AGL_SUPPORT_EMAIL="
      ],
      "writeAnalyticsLocalEnvTemplateCommand": "./ops/github/setup-production.sh --analytics-input-template",
      "writeLocalEnvTemplateCommand": "./ops/github/setup-production.sh --owner-input-template",
      "commands": {
        "combinedPreflight": "node scripts/owner-unlock-preflight.mjs --assert --print",
        "setupWriteLocalEnvTemplate": "./ops/github/setup-production.sh --owner-input-template",
        "writeLocalEnvTemplate": "node scripts/owner-unlock-preflight.mjs --write-local-env-template",
        "syncConfiguredValues": "./ops/github/setup-production.sh",
        "workflowDispatch": "RUN_WORKFLOWS=1 ./ops/github/setup-production.sh"
      },
      "controls": {
        "noSecretValuesStored": true,
        "localTemplateWriteNoGithubMutation": true,
        "workflowDispatchRequiresRunWorkflows": true,
        "storeSubmissionStillBlocked": true,
        "revenueStillBlocked": true
      }
    }
  },
  "ownerInputActionPack": {
    "id": "zero-secret-owner-input-action-pack",
    "sourcePackId": "combined-zero-secret-owner-input-pack",
    "status": "waiting-on-owner-values",
    "localEnvFile": ".env.production.local",
    "unlockIds": [
      "production-analytics-browser",
      "support-contact"
    ],
    "analyticsPathId": "posthog-browser",
    "supportUnlockId": "support-contact",
    "missingInputNames": [
      "VITE_POSTHOG_KEY",
      "AGL_SUPPORT_EMAIL"
    ],
    "missingInputCount": 2,
    "secretInputCount": 0,
    "localEnvTemplateLines": [
      "VITE_POSTHOG_KEY=",
      "AGL_SUPPORT_EMAIL="
    ],
    "shellExportTemplateLines": [
      "export VITE_POSTHOG_KEY=",
      "export AGL_SUPPORT_EMAIL="
    ],
    "localEnvTemplateText": "VITE_POSTHOG_KEY=\nAGL_SUPPORT_EMAIL=\n",
    "shellExportTemplateText": "export VITE_POSTHOG_KEY=\nexport AGL_SUPPORT_EMAIL=\n",
    "downloadFileName": "agl-owner-input-template.env",
    "receiptStorageKey": "agl.ownerInputActionReceipt",
    "valueValidation": {
      "id": "browser-local-zero-secret-owner-input-check",
      "status": "ready",
      "filledDownloadFileName": "agl-owner-input-filled.env",
      "fields": [
        {
          "envName": "VITE_POSTHOG_KEY",
          "title": "PostHog browser project key",
          "inputId": "owner-input-vite-posthog-key",
          "validationKind": "posthog-public-key",
          "inputType": "text",
          "placeholder": "phc_public_project_key",
          "required": true,
          "publicValue": true,
          "maxLength": 256
        },
        {
          "envName": "AGL_SUPPORT_EMAIL",
          "title": "Production support email",
          "inputId": "owner-input-agl-support-email",
          "validationKind": "email-shape",
          "inputType": "email",
          "placeholder": "support@example.com",
          "required": true,
          "publicValue": true,
          "maxLength": 254
        }
      ],
      "controls": {
        "browserLocalOnly": true,
        "noGeneratedValueSerialization": true,
        "noSecretValues": true,
        "noGithubMutation": true,
        "noWorkflowDispatch": true
      }
    },
    "runtimeConfigPreview": {
      "id": "browser-local-owner-runtime-config-preview",
      "status": "ready",
      "downloadFileName": "owner-runtime-config.preview.json",
      "targetPublicPath": "public/owner-runtime-config.json",
      "defaultPosthogHost": "https://us.i.posthog.com",
      "provider": "posthog-browser",
      "controls": {
        "browserLocalOnly": true,
        "publicValuesOnly": true,
        "noGeneratedValueSerialization": true,
        "noSecretValues": true,
        "noGithubMutation": true,
        "noWorkflowDispatch": true,
        "noStoreSubmission": true,
        "noRevenueEnablement": true
      }
    },
    "productionInputWatchCommand": {
      "id": "browser-local-production-input-watch-command",
      "status": "ready",
      "workflowFile": "production-input-watch.yml",
      "workflowPath": ".github/workflows/production-input-watch.yml",
      "ref": "main",
      "requiredFlag": "publish_zero_secret_runtime_config=true",
      "defaultPosthogHost": "https://us.i.posthog.com",
      "controls": {
        "browserLocalOnly": true,
        "publicValuesOnly": true,
        "noGeneratedValueSerialization": true,
        "noSecretValues": true,
        "noGithubMutation": true,
        "noWorkflowDispatchFromPage": true,
        "commandRequiresOwnerRun": true,
        "noStoreSubmission": true,
        "noRevenueEnablement": true
      }
    },
    "commands": {
      "combinedPreflight": "node scripts/owner-unlock-preflight.mjs --assert --print",
      "setupWriteLocalEnvTemplate": "./ops/github/setup-production.sh --owner-input-template",
      "syncConfiguredValues": "./ops/github/setup-production.sh",
      "workflowDispatch": "RUN_WORKFLOWS=1 ./ops/github/setup-production.sh"
    },
    "controls": {
      "zeroPaidSpend": true,
      "noSecretValues": true,
      "noSecretValuesStored": true,
      "localOnlyReceipt": true,
      "localTemplateWriteNoGithubMutation": true,
      "workflowDispatchRequiresRunWorkflows": true,
      "storeSubmissionStillBlocked": true,
      "revenueStillBlocked": true
    }
  }
} as const

export type ProductionMeasurementStatus = typeof productionMeasurementStatus
