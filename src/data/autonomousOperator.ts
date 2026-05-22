export const autonomousOperator = {
  "status": "operator-held",
  "mode": "plan-only",
  "selectedAction": {
    "id": "measure-pwa-install-loop",
    "status": "armed",
    "costUsd": 0
  },
  "execution": {
    "status": "not-requested"
  }
} as const

export type AutonomousOperator = typeof autonomousOperator
