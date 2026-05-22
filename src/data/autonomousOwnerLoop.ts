export const autonomousOwnerLoop = {
  "status": "owner-loop-ready",
  "mode": "guarded-local-automation",
  "autonomyScore": {
    "percent": 91
  },
  "controls": {
    "externalAccountInterventionRequired": true
  },
  "ownerDecision": {
    "nextBestActionId": "seed-portfolio-traffic"
  }
} as const

export type AutonomousOwnerLoop = typeof autonomousOwnerLoop
