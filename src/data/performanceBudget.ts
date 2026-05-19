export const performanceBudget = {
  "generatedAt": "2026-05-19T15:15:44.592Z",
  "status": "performance-budget-ready",
  "sourceBuild": "dist",
  "budgets": {
    "initialJsMaxBytes": 691200,
    "initialJsMaxKb": 675,
    "initialGzipMaxBytes": 204800,
    "initialGzipMaxKb": 200,
    "initialCssMaxBytes": 40960,
    "initialCssMaxKb": 40,
    "deferredGameChunkMaxBytes": 1638400,
    "deferredGameChunkMaxKb": 1600
  },
  "initial": {
    "entryScripts": [
      "index-ImoV9qJi.js",
      "registerSW.js"
    ],
    "scriptPaths": [
      "assets/index-ImoV9qJi.js",
      "registerSW.js"
    ],
    "jsFiles": [
      {
        "file": "index-ImoV9qJi.js",
        "path": "assets/index-ImoV9qJi.js",
        "bytes": 674568,
        "kb": 658.8,
        "gzipBytes": 178388,
        "gzipKb": 174.2
      },
      {
        "file": "registerSW.js",
        "path": "registerSW.js",
        "bytes": 134,
        "kb": 0.1,
        "gzipBytes": 126,
        "gzipKb": 0.1
      }
    ],
    "jsBytes": 674702,
    "jsKb": 658.9,
    "gzipBytes": 178514,
    "gzipKb": 174.3,
    "cssFiles": [
      {
        "file": "index-BA4sddeG.css",
        "path": "assets/index-BA4sddeG.css",
        "bytes": 9873,
        "kb": 9.6,
        "gzipBytes": 2681,
        "gzipKb": 2.6
      }
    ],
    "cssBytes": 9873,
    "cssKb": 9.6,
    "cssGzipBytes": 2681,
    "cssGzipKb": 2.6
  },
  "deferred": {
    "chunks": [
      {
        "file": "GameCanvas-Ba0jXOIj.js",
        "path": "assets/GameCanvas-Ba0jXOIj.js",
        "bytes": 1393468,
        "kb": 1360.8,
        "gzipBytes": 356095,
        "gzipKb": 347.7
      }
    ],
    "gameChunk": {
      "file": "GameCanvas-Ba0jXOIj.js",
      "path": "assets/GameCanvas-Ba0jXOIj.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "largestDeferredChunk": {
      "file": "GameCanvas-Ba0jXOIj.js",
      "path": "assets/GameCanvas-Ba0jXOIj.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "largestJsChunk": {
      "file": "GameCanvas-Ba0jXOIj.js",
      "path": "assets/GameCanvas-Ba0jXOIj.js",
      "bytes": 1393468,
      "kb": 1360.8,
      "gzipBytes": 356095,
      "gzipKb": 347.7
    },
    "chunksBytes": 1393468,
    "chunksKb": 1360.8
  },
  "assets": {
    "js": [
      {
        "file": "GameCanvas-Ba0jXOIj.js",
        "path": "assets/GameCanvas-Ba0jXOIj.js",
        "bytes": 1393468,
        "kb": 1360.8,
        "gzipBytes": 356095,
        "gzipKb": 347.7
      },
      {
        "file": "index-ImoV9qJi.js",
        "path": "assets/index-ImoV9qJi.js",
        "bytes": 674568,
        "kb": 658.8,
        "gzipBytes": 178388,
        "gzipKb": 174.2
      },
      {
        "file": "registerSW.js",
        "path": "registerSW.js",
        "bytes": 134,
        "kb": 0.1,
        "gzipBytes": 126,
        "gzipKb": 0.1
      }
    ],
    "css": [
      {
        "file": "index-BA4sddeG.css",
        "path": "assets/index-BA4sddeG.css",
        "bytes": 9873,
        "kb": 9.6,
        "gzipBytes": 2681,
        "gzipKb": 2.6
      }
    ],
    "manifestExists": true,
    "serviceWorkerExists": true,
    "serviceWorkerPrecacheIncludesLazyChunk": true
  },
  "controls": {
    "phaserDeferredFromInitialShell": true,
    "initialShellBudgetEnforced": true,
    "largeGameChunkAllowedWhenDeferred": true,
    "noPerformanceClaimsWithoutBuildEvidence": true,
    "largestJsChunkIsDeferred": true,
    "serviceWorkerPrecacheIncludesLazyChunk": true
  },
  "checks": [
    {
      "id": "initial-js-budget",
      "status": "pass",
      "detail": "Initial JS is 658.9 KB; budget is 675 KB."
    },
    {
      "id": "initial-js-gzip-budget",
      "status": "pass",
      "detail": "Initial JS gzip is 174.3 KB; budget is 200 KB."
    },
    {
      "id": "initial-css-budget",
      "status": "pass",
      "detail": "Initial CSS is 9.6 KB; budget is 40 KB."
    },
    {
      "id": "manifest",
      "status": "pass",
      "detail": "PWA manifest exists in dist."
    },
    {
      "id": "service-worker",
      "status": "pass",
      "detail": "Service worker exists in dist."
    },
    {
      "id": "game-runtime-deferred",
      "status": "pass",
      "detail": "GameCanvas-Ba0jXOIj.js is deferred from the initial shell."
    },
    {
      "id": "largest-js-deferred",
      "status": "pass",
      "detail": "Largest JS chunk is GameCanvas-Ba0jXOIj.js at 1360.8 KB."
    },
    {
      "id": "deferred-game-budget",
      "status": "pass",
      "detail": "Deferred game chunk is 1360.8 KB; monitor budget is 1600 KB."
    }
  ],
  "nextActions": [
    "Keep Phaser and game scenes outside the initial PWA shell.",
    "Continue monitoring initial shell gzip size after every generated-data change.",
    "Accept the large game-engine chunk only while it remains deferred from first paint."
  ]
} as const

export type PerformanceBudget = typeof performanceBudget
