export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 670,
    "gzipKb": 182.7
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
