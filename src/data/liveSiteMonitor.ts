export const liveSiteMonitor = {
  "generatedAt": "2026-05-21T21:16:55.893Z",
  "status": "live-site-monitor-passed",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab"
  },
  "summary": {
    "planned": 17,
    "passed": 17,
    "failed": 0,
    "blocked": 0,
    "passRate": 100,
    "latencyP50Ms": 218,
    "latencyP95Ms": 262,
    "liveCandidateId": "pwa-c634755cfa9f",
    "syncedCandidateId": "pwa-c634755cfa9f",
    "localCandidateId": "pwa-03a328b22ac3",
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
      "durationMs": 262
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 218
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 219
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 217
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 218
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 218
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
