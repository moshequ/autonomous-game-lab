export const liveSiteMonitor = {
  "generatedAt": "2026-05-21T14:32:28.908Z",
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
    "latencyP50Ms": 269,
    "latencyP95Ms": 315,
    "liveCandidateId": "pwa-76ac5c7a0a98",
    "syncedCandidateId": "pwa-76ac5c7a0a98",
    "localCandidateId": "pwa-6ed2898ec669",
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
      "durationMs": 315
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 270
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 272
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 270
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 270
    },
    {
      "id": "install-html",
      "path": "/install.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 271
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
