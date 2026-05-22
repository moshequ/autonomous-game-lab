export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 671.8,
    "gzipKb": 182.7
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
