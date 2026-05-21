export const liveSiteMonitor = {
  "generatedAt": "2026-05-21T18:36:53.637Z",
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
    "latencyP50Ms": 58,
    "latencyP95Ms": 95,
    "liveCandidateId": "pwa-a3128a473d44",
    "syncedCandidateId": "pwa-a3128a473d44",
    "localCandidateId": "pwa-d8ecee88c17d",
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
      "durationMs": 95
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 60
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 63
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 57
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 61
    },
    {
      "id": "install-html",
      "path": "/install.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 61
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
