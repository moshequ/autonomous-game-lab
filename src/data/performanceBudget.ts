export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 678,
    "gzipKb": 183.7
  },
  "deferred": {
    "gameChunk": {
      "kb": 1361.4
    },
    "largestDeferredChunk": {
      "kb": 1361.4
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
