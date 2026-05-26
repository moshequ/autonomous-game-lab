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
    "nextBestActionId": "refresh-completion-loop"
  },
  "executionBackoff": {
    "status": "ready",
    "heldActionCount": 6,
    "executableWithoutRepeatCount": 1,
    "nextResumeAt": "2026-05-27T08:23:08.550Z",
    "nextResumeInHours": 13.438,
    "heldActionIds": [
      "seed-portfolio-traffic",
      "refresh-organic-seed-loop",
      "collect-gate-sample-local-drops",
      "refresh-product-gate-sample-plan",
      "refresh-replay-loop",
      "apply-safe-improvements"
    ]
  },
  "externalInputHandoff": {
    "nextUnlockId": "production-analytics-browser",
    "recommendedPathId": "first-party-collector",
    "lowestInputPathId": "posthog-browser",
    "ownerActionRequired": 4,
    "missingVariableCount": 4,
    "missingSecretCount": 1,
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
      "missingVariableCount": 4,
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
