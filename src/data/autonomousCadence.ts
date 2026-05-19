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
    "executeOneLocalAction": "npm run autonomous:operator -- --execute"
  }
} as const

export type AutonomousCadence = typeof autonomousCadence
