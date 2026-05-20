export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 640.4,
    "gzipKb": 175
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
