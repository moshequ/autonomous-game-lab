export const autonomousOperator = {
  "status": "operator-executed",
  "mode": "execute-one-action",
  "selectedAction": {
    "id": "seed-portfolio-traffic",
    "status": "armed",
    "costUsd": 0
  },
  "execution": {
    "status": "executed"
  }
} as const

export type AutonomousOperator = typeof autonomousOperator
