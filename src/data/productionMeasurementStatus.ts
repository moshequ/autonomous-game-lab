export const productionMeasurementStatus = {
  "generatedAt": "2026-05-24T14:35:09.627Z",
  "status": "production-measurement-local-intake-ready",
  "activePath": "local-browser-buffer",
  "liveCandidate": "pwa-b5b8d0009c07",
  "liveRelease": {
    "syncedCandidateId": "pwa-b5b8d0009c07",
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
    "commandCount": 5,
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
    "missingInputCount": 8,
    "invalidInputCount": 0
  }
} as const

export type ProductionMeasurementStatus = typeof productionMeasurementStatus
