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
    "nextBestActionId": "refresh-autonomous-cadence"
  },
  "externalInputHandoff": null
} as const

export type AutonomousOwnerLoop = typeof autonomousOwnerLoop
