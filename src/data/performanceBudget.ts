export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 670.7,
    "gzipKb": 182.3
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
