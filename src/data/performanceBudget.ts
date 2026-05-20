export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 647,
    "gzipKb": 177.1
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
