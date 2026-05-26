export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 660.2,
    "gzipKb": 176.8
  },
  "deferred": {
    "gameChunk": {
      "kb": 3.3
    },
    "largestDeferredChunk": {
      "kb": 1321.4
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
