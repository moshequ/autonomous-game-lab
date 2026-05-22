export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 663.2,
    "gzipKb": 180.9
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
