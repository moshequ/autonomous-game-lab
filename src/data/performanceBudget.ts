export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 670.6,
    "gzipKb": 182.3
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
