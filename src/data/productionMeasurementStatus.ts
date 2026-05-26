export const productionMeasurementStatus = {
  "generatedAt": "2026-05-26T14:43:14.436Z",
  "status": "production-measurement-local-intake-ready",
  "activePath": "local-browser-buffer",
  "liveCandidate": "pwa-c94b7dcecf97",
  "liveRelease": {
    "syncedCandidateId": "pwa-c94b7dcecf97",
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
  }
} as const

export type ProductionMeasurementStatus = typeof productionMeasurementStatus
