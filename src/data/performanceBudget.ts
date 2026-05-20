export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 614.7,
    "gzipKb": 169.1
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
