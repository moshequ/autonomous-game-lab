export const liveSiteMonitor = {
  "generatedAt": "2026-05-21T17:27:04.989Z",
  "status": "live-site-monitor-passed",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab"
  },
  "summary": {
    "planned": 15,
    "passed": 15,
    "failed": 0,
    "blocked": 0,
    "passRate": 100,
    "latencyP50Ms": 211,
    "latencyP95Ms": 251,
    "liveCandidateId": "pwa-2d7b45a0b9d4",
    "syncedCandidateId": "pwa-2d7b45a0b9d4",
    "localCandidateId": "pwa-b12383f0fc7c",
    "liveMatchesSyncedDeploy": true,
    "liveMatchesCurrentLocalCandidate": false
  },
  "controls": {
    "zeroPaidSpend": true,
    "readOnlyHttpChecks": true,
    "noMutation": true,
    "noAccountCreation": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noCookiesOrCredentials": true,
    "strictSyncedManifestComparison": true
  },
  "topChecks": [
    {
      "id": "app-shell",
      "path": "/",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 251
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 216
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 215
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 214
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 210
    },
    {
      "id": "install-html",
      "path": "/install.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 210
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
