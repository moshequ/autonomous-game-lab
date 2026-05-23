export const autonomousOperator = {
  "status": "operator-held",
  "mode": "plan-only",
  "selectedAction": null,
  "execution": {
    "status": "not-requested"
  },
  "externalInputHandoff": {
    "status": "handoff-waiting-on-owner-inputs",
    "nextUnlockId": "production-analytics-browser",
    "recommendedPathId": "first-party-collector",
    "publicStatusPage": "/measurement-status.html"
  }
} as const

export type AutonomousOperator = typeof autonomousOperator
