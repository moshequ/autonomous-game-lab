export const autonomousOwnerLoop = {
  "status": "owner-loop-ready",
  "mode": "repository-channel-needed",
  "autonomyScore": {
    "percent": 93
  },
  "controls": {
    "externalAccountInterventionRequired": true
  },
  "ownerDecision": {
    "nextBestActionId": "prepare-repository-channel"
  }
} as const

export type AutonomousOwnerLoop = typeof autonomousOwnerLoop
