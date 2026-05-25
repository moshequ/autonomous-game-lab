export const autonomousOwnerLoop = {
  "status": "owner-loop-ready",
  "mode": "zero-spend-web-ready",
  "autonomyScore": {
    "percent": 98
  },
  "controls": {
    "externalAccountInterventionRequired": true
  },
  "ownerDecision": {
    "nextBestActionId": "hold-for-external-input"
  },
  "executionBackoff": {
    "status": "cooling-down",
    "heldActionCount": 2,
    "executableWithoutRepeatCount": 0,
    "nextResumeAt": "2026-05-26T06:36:37.654Z",
    "nextResumeInHours": 10.317,
    "heldActionIds": [
      "seed-portfolio-traffic",
      "refresh-organic-seed-loop"
    ]
  },
  "externalInputHandoff": {
    "nextUnlockId": "production-analytics-browser",
    "recommendedPathId": "first-party-collector",
    "lowestInputPathId": "posthog-browser",
    "ownerActionRequired": 4,
    "missingVariableCount": 5,
    "missingSecretCount": 1,
    "lowestInputMissingVariableCount": 2,
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
      "missingVariableCount": 5,
      "missingSecretCount": 1
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
