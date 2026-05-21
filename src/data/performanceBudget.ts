export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 669.8,
    "gzipKb": 182.5
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
