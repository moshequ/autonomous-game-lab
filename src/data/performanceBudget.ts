export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 613.6,
    "gzipKb": 169.3
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
