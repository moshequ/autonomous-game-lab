export const autonomousOperator = {
  "status": "operator-held",
  "mode": "plan-only",
  "selectedAction": null,
  "execution": {
    "status": "not-requested"
  }
} as const

export type AutonomousOperator = typeof autonomousOperator
