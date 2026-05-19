export const autonomousCadence = {
  "status": "cadence-ready",
  "schedulers": {
    "codexDesktop": {
      "status": "active-confirmed"
    },
    "githubActions": {
      "status": "scheduled"
    }
  },
  "commandPlan": {
    "operate": "npm run autonomous:operate",
    "executeOneLocalAction": "npm run autonomous:operator -- --execute",
    "afterAction": "npm run autonomous:after-action"
  }
} as const

export type AutonomousCadence = typeof autonomousCadence
