export const autonomousOperator = {
  "status": "operator-plan-ready",
  "mode": "plan-only",
  "selectedAction": {
    "id": "collect-gate-sample-local-drops",
    "status": "armed",
    "costUsd": 0
  },
  "execution": {
    "status": "not-requested"
  },
  "externalInputHandoff": null
} as const

export type AutonomousOperator = typeof autonomousOperator
