export const postDeploySmoke = {
  "generatedAt": "2026-05-19T01:21:35.477Z",
  "status": "blocked-missing-origin",
  "target": {
    "origin": null,
    "provider": "github-pages",
    "candidateId": "pwa-aceb80dfc3e5",
    "aggregateHash": "aceb80dfc3e5962994681579c2a1c722d1462b3bc0fd1bc4dbfc280923bec115"
  },
  "sourceStatus": {
    "deployment": "ready-for-pages",
    "releaseCandidate": "release-candidate-ready",
    "productionResponse": "guarded-operations"
  },
  "summary": {
    "planned": 8,
    "passed": 0,
    "failed": 0,
    "blocked": 8
  },
  "controls": {
    "zeroPaidSpend": true,
    "noStoreSubmission": true,
    "noRevenueEnablement": true,
    "noAccountCreation": true,
    "readOnlyHttpChecks": true,
    "manifestHashComparisonRequired": true
  },
  "checks": [
    {
      "id": "app-shell",
      "path": "/",
      "url": "${DEPLOYED_PWA_ORIGIN}/",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "manifest-webmanifest",
      "path": "/manifest.webmanifest",
      "url": "${DEPLOYED_PWA_ORIGIN}/manifest.webmanifest",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "sw-js",
      "path": "/sw.js",
      "url": "${DEPLOYED_PWA_ORIGIN}/sw.js",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "privacy-html",
      "path": "/privacy.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/privacy.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "support-html",
      "path": "/support.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/support.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "sitemap-xml",
      "path": "/sitemap.xml",
      "url": "${DEPLOYED_PWA_ORIGIN}/sitemap.xml",
      "expectedStatus": 200,
      "requiredText": null,
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "games-canopy-bloom-html",
      "path": "/games/canopy-bloom.html",
      "url": "${DEPLOYED_PWA_ORIGIN}/games/canopy-bloom.html",
      "expectedStatus": 200,
      "requiredText": "Autonomous Game Lab",
      "status": "blocked",
      "detail": "No deployed origin configured."
    },
    {
      "id": "release-candidate-manifest",
      "path": "/release-candidate.json",
      "url": "${DEPLOYED_PWA_ORIGIN}/release-candidate.json",
      "expectedStatus": 200,
      "requiredText": "pwa-aceb80dfc3e5",
      "status": "blocked",
      "detail": "No deployed origin configured."
    }
  ],
  "nextActions": [
    "Run this after deployment with AGL_DEPLOYED_PWA_ORIGIN set to the Pages URL.",
    "Keep revenue, paid acquisition, and app-store submission disabled until product and credential gates pass."
  ]
} as const

export type PostDeploySmoke = typeof postDeploySmoke
