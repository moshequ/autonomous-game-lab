export const performanceBudget = {
  "status": "performance-budget-ready",
  "initial": {
    "jsKb": 629.4,
    "gzipKb": 172.7
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
