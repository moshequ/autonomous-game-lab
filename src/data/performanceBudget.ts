export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 668.6,
    "gzipKb": 182.4
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
