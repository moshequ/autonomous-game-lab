export const autonomousOperator = {
  "status": "operator-plan-ready",
  "mode": "plan-only",
  "selectedAction": {
    "id": "refresh-objective-audit",
    "status": "armed",
    "costUsd": 0
  },
  "execution": {
    "status": "not-requested"
  }
} as const

export type AutonomousOperator = typeof autonomousOperator
