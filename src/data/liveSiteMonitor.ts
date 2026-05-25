export const liveSiteMonitor = {
  "generatedAt": "2026-05-25T17:59:28.028Z",
  "status": "live-site-monitor-planned",
  "origin": {
    "origin": "https://moshequ.github.io/autonomous-game-lab",
    "source": "post-deploy-artifact-sync",
    "host": "moshequ.github.io",
    "basePath": "/autonomous-game-lab/"
  },
  "summary": {
    "planned": 32,
    "passed": 20,
    "failed": 0,
    "blocked": 12,
    "passRate": 63,
    "latencyP50Ms": 9698,
    "latencyP95Ms": 10833,
    "liveCandidateId": "pwa-74463d104cca",
    "syncedCandidateId": "pwa-74463d104cca",
    "localCandidateId": "pwa-5489b61147d7",
    "liveMatchesSyncedDeploy": true,
    "liveMatchesCurrentLocalCandidate": false,
    "monitoringPlanSource": "synced-live-release-manifest",
    "monitoredSmokeUrls": 31,
    "liveSmokeUrls": 31
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
      "durationMs": 189
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "status": "blocked",
      "httpStatus": null,
      "durationMs": null
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "status": "blocked",
      "httpStatus": null,
      "durationMs": null
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "status": "blocked",
      "httpStatus": null,
      "durationMs": null
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "status": "pass",
      "httpStatus": 200,
      "durationMs": 6063
    },
    {
      "id": "measurement-status-html",
      "path": "/measurement-status.html",
      "status": "blocked",
      "httpStatus": null,
      "durationMs": null
    }
  ]
} as const

export type LiveSiteMonitor = typeof liveSiteMonitor
