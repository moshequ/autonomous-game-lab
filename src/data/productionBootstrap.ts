export const productionBootstrap = {
  "status": "production-bootstrap-ready",
  "mode": "can-apply-configured-actions",
  "summary": {
    "readyGroups": 3,
    "totalGroups": 12,
    "externalBlockers": 18
  }
} as const

export type ProductionBootstrap = typeof productionBootstrap
