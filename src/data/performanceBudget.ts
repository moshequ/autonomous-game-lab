export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 625.4,
    "gzipKb": 171.6
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
