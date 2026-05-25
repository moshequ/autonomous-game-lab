export const autonomousOperator = {
  "status": "operator-plan-ready",
  "mode": "plan-only",
  "selectedAction": {
    "id": "refresh-support-feedback",
    "status": "armed",
    "costUsd": 0
  },
  "execution": {
    "status": "not-requested"
  },
  "externalInputHandoff": null
} as const

export type AutonomousOperator = typeof autonomousOperator
