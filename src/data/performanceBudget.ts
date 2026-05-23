export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 683.1,
    "gzipKb": 185.4
  },
  "deferred": {
    "gameChunk": {
      "kb": 1361.7
    },
    "largestDeferredChunk": {
      "kb": 1361.7
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
