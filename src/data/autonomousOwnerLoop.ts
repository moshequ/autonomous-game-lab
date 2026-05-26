export const autonomousOwnerLoop = {
  "status": "owner-loop-ready",
  "mode": "guarded-local-automation",
  "autonomyScore": {
    "percent": 89
  },
  "controls": {
    "externalAccountInterventionRequired": true
  },
  "ownerDecision": {
    "nextBestActionId": "prepare-repository-channel"
  },
  "executionBackoff": {
    "status": "ready",
    "heldActionCount": 5,
    "executableWithoutRepeatCount": 9,
    "nextResumeAt": "2026-05-26T23:08:56.032Z",
    "nextResumeInHours": 9.283,
    "heldActionIds": [
      "seed-portfolio-traffic",
      "refresh-organic-seed-loop",
      "optimize-daily-retention",
      "refresh-replay-loop",
      "bootstrap-production-setup"
    ]
  },
  "externalInputHandoff": {
    "nextUnlockId": "production-analytics-browser",
    "recommendedPathId": "first-party-collector",
    "lowestInputPathId": "posthog-browser",
    "ownerActionRequired": 4,
    "missingVariableCount": 6,
    "missingSecretCount": 3,
    "lowestInputMissingVariableCount": 1,
    "lowestInputMissingSecretCount": 0,
    "publicStatusPage": "/measurement-status.html"
  },
  "storeExternalInputHandoff": {
    "nextUnlockId": "support-contact",
    "lowestInputUnlockId": "support-contact",
    "ownerActionRequired": 1,
    "missingVariableCount": 1,
    "missingSecretCount": 0,
    "lowestInputMissingInputCount": 1,
    "lowestInputMissingSecretCount": 0,
    "publicStatusPage": "/store-readiness.html"
  },
  "externalInputHandoffs": [
    {
      "id": "production-measurement",
      "category": "analytics",
      "priority": "primary",
      "nextUnlockId": "production-analytics-browser",
      "publicStatusPage": "/measurement-status.html",
      "missingVariableCount": 6,
      "missingSecretCount": 3
    },
    {
      "id": "store-readiness",
      "category": "store",
      "priority": "parallel",
      "nextUnlockId": "support-contact",
      "publicStatusPage": "/store-readiness.html",
      "missingVariableCount": 1,
      "missingSecretCount": 0
    }
  ]
} as const

export type AutonomousOwnerLoop = typeof autonomousOwnerLoop
