export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 663.3,
    "gzipKb": 180.8
  },
  "deferred": {
    "gameChunk": {
      "kb": 1361.1
    },
    "largestDeferredChunk": {
      "kb": 1361.1
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
