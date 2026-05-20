export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 639.9,
    "gzipKb": 174.8
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
