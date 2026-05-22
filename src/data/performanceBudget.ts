export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 671.6,
    "gzipKb": 182.9
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
