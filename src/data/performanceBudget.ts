export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 639.8,
    "gzipKb": 174.9
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
