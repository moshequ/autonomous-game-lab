export const liveSiteMonitor = {
  "generatedAt": "2026-05-27T10:47:41.035Z",
  "status": "live-site-monitor-alert",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab/"
  },
  "summary": {
    "planned": 34,
    "passed": 33,
    "failed": 1,
    "blocked": 0,
    "passRate": 97,
    "latencyP50Ms": 222,
    "latencyP95Ms": 321,
    "liveCandidateId": "pwa-24bf000a6eeb",
    "syncedCandidateId": "pwa-3c0a12be6d47",
    "localCandidateId": "pwa-f7b72b7b6dca",
    "liveMatchesSyncedDeploy": false,
    "liveMatchesCurrentLocalCandidate": false,
    "monitoringPlanSource": "current-local-release-candidate",
    "monitoredSmokeUrls": 33,
    "liveSmokeUrls": 33
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
      "durationMs": 61
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 204
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 193
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 196
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 202
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 320
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
