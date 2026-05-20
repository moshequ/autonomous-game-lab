export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 649.1,
    "gzipKb": 177.8
  },
  "deferred": {
    "gameChunk": {
      "kb": 1360.9
    },
    "largestDeferredChunk": {
      "kb": 1360.9
    }
  }
} as const

export type PerformanceBudget = typeof performanceBudget
