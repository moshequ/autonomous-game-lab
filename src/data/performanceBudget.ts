export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 681.3,
    "gzipKb": 185
  },
  "deferred": {
    "gameChunk": {
      "kb": 1361.7
    },
    "largestDeferredChunk": {
      "kb": 1361.7
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
