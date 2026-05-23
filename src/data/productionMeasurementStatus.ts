export const productionMeasurementStatus = {
  "generatedAt": "2026-05-23T02:24:51.333Z",
  "status": "production-measurement-local-intake-ready",
  "activePath": "local-browser-buffer",
  "liveCandidate": "pwa-91d91db5db72",
  "liveRelease": {
    "syncedCandidateId": "pwa-91d91db5db72",
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
  "externalUnlockQueue": {
    "status": "handoff-waiting-on-owner-inputs",
    "nextBestUnlockId": "production-analytics-browser",
    "nextBestZeroCostUnlockId": "production-analytics-browser",
    "ownerActionRequired": 4
  }
} as const

export type ProductionMeasurementStatus = typeof productionMeasurementStatus
