export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 657.6,
    "gzipKb": 179.5
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
