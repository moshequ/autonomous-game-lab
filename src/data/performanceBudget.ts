export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 638.6,
    "gzipKb": 174.7
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
