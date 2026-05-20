export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 612.3,
    "gzipKb": 168.6
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
