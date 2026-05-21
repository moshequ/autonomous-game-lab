export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 674.9,
    "gzipKb": 183.4
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
