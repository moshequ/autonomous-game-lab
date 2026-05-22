export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 675.9,
    "gzipKb": 183.2
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
