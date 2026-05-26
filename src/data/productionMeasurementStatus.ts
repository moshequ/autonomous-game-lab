export const productionMeasurementStatus = {
  "generatedAt": "2026-05-26T08:00:54.600Z",
  "status": "production-measurement-local-intake-ready",
  "activePath": "local-browser-buffer",
  "liveCandidate": "pwa-f0b5215218b9",
  "liveRelease": {
    "syncedCandidateId": "pwa-f0b5215218b9",
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
    "lowestInputMissingVariableCount": 2,
    "lowestInputMissingSecretCount": 0,
    "minimalInterventionPathId": "posthog-browser",
    "minimalInterventionMissingInputCount": 2,
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
      "missingVariableCount": 5,
      "missingSecretCount": 3
    }
  },
  "ownerUnlockPreflight": {
    "status": "owner-unlock-preflight-waiting-on-input",
    "readyForSetup": false,
    "lowestInputPathId": "posthog-browser",
    "missingInputCount": 4,
    "invalidInputCount": 0,
    "lowestInputMissingInputCount": 2,
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
      "missingInputCount": 3,
      "secretInputCount": 0,
      "invalidInputCount": 0,
      "missingInputNames": [
        "VITE_POSTHOG_KEY",
        "VITE_POSTHOG_HOST",
        "AGL_SUPPORT_EMAIL"
      ],
      "writeAnalyticsLocalEnvTemplateCommand": "./ops/github/setup-production.sh --analytics-input-template",
      "writeLocalEnvTemplateCommand": "./ops/github/setup-production.sh --owner-input-template"
    }
  }
} as const

export type ProductionMeasurementStatus = typeof productionMeasurementStatus
