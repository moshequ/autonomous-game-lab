export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 621.8,
    "gzipKb": 170.7
  },
  "deferred": {
    "gameChunk": {
      "kb": 1360.8
    },
    "largestDeferredChunk": {
      "kb": 1360.8
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
