export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 679.3,
    "gzipKb": 183.9
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
