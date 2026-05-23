export const productionMeasurementStatus = {
  "generatedAt": "2026-05-23T00:35:20.920Z",
  "status": "production-measurement-local-intake-ready",
  "activePath": "local-browser-buffer",
  "liveCandidate": "pwa-a021ba3aacfc",
  "liveRelease": {
    "syncedCandidateId": "pwa-a021ba3aacfc",
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
