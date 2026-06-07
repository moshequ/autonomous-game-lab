export const autonomousOwnerLoop = {
  "status": "owner-loop-ready",
  "mode": "zero-spend-web-ready",
  "autonomyScore": {
    "percent": 96
  },
  "controls": {
    "externalAccountInterventionRequired": true
  },
  "ownerDecision": {
    "nextBestActionId": "seed-portfolio-traffic"
  },
  "executionBackoff": {
    "status": "ready",
    "heldActionCount": 0,
    "executableWithoutRepeatCount": 10,
    "nextResumeAt": null,
    "nextResumeInHours": null,
    "heldActionIds": []
  },
  "externalInputHandoff": {
    "nextUnlockId": "support-contact",
    "recommendedPathId": "first-party-collector",
    "lowestInputPathId": "posthog-browser",
    "ownerActionRequired": 5,
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
      "nextUnlockId": "support-contact",
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
