export const productionBootstrap = {
  "status": "production-bootstrap-ready",
  "mode": "waiting-for-external-credentials",
  "summary": {
    "readyGroups": 3,
    "totalGroups": 12,
    "externalBlockers": 16
  }
} as const

export type ProductionBootstrap = typeof productionBootstrap
