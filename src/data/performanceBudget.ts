export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 653.7,
    "gzipKb": 178.6
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
