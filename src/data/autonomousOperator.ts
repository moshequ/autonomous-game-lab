export const autonomousOperator = {
  "status": "operator-plan-ready",
  "mode": "plan-only",
  "selectedAction": {
    "id": "prepare-repository-channel",
    "status": "armed",
    "costUsd": 0
  },
  "execution": {
    "status": "not-requested"
  },
  "externalInputHandoff": null
} as const

export type AutonomousOperator = typeof autonomousOperator
