export const productionBootstrap = {
  "status": "production-bootstrap-ready",
  "mode": "waiting-for-external-credentials",
  "summary": {
    "readyGroups": 4,
    "totalGroups": 12,
    "externalBlockers": 20
  }
} as const

export type ProductionBootstrap = typeof productionBootstrap
