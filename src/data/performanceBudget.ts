export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 672.3,
    "gzipKb": 177.5
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
