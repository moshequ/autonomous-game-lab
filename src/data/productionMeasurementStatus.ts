export const productionMeasurementStatus = {
  "generatedAt": "2026-05-22T19:40:53.031Z",
  "status": "production-measurement-local-intake-ready",
  "activePath": "local-browser-buffer",
  "liveCandidate": "pwa-7dc3b9c8e40f",
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
  }
} as const

export type ProductionMeasurementStatus = typeof productionMeasurementStatus
