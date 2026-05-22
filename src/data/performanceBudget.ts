export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 661.8,
    "gzipKb": 180.9
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
