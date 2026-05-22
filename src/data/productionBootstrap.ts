export const productionBootstrap = {
  "status": "production-bootstrap-ready",
  "mode": "can-apply-configured-actions",
  "summary": {
    "readyGroups": 2,
    "totalGroups": 12,
    "externalBlockers": 14
  }
} as const

export type ProductionBootstrap = typeof productionBootstrap
