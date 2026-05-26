export const productionBootstrap = {
  "status": "production-bootstrap-ready",
  "mode": "can-apply-configured-actions",
  "summary": {
    "readyGroups": 7,
    "totalGroups": 12,
    "externalBlockers": 15
  }
} as const

export type ProductionBootstrap = typeof productionBootstrap
