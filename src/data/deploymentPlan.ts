export const deploymentPlan = {
  "generatedAt": "2026-05-19T03:47:45.901Z",
  "status": "ready-for-pages",
  "target": {
    "provider": "github-pages",
    "cost": "$0 platform hosting for public/internal experiment traffic",
    "workflow": ".github/workflows/web-pwa-deploy.yml",
    "artifactPath": "dist"
  },
  "repositoryChannel": {
    "status": "waiting-for-github-repository",
    "repository": null,
    "source": "missing",
    "insideWorkTree": true,
    "ghCliAvailable": true,
    "workflowDispatchReady": false,
    "blockers": [
      "Add a GitHub origin remote or set GITHUB_REPOSITORY/GH_REPO.",
      "Configure GH_TOKEN or GITHUB_TOKEN for workflow dispatch and repository settings sync."
    ]
  },
  "eventCollector": {
    "status": "blocked-needs-cloudflare-env",
    "provider": "cloudflare-worker-r2",
    "workflow": ".github/workflows/event-collector-deploy.yml",
    "costPosture": "free-tier-friendly-no-paid-traffic"
  },
  "promotion": {
    "webStatus": "promotable-internal",
    "nextAction": "Connect a free static host or GitHub Pages environment, then publish dist."
  },
  "releaseHealth": {
    "status": "monitoring",
    "canDeploy": true,
    "rollbackRequired": false
  },
  "unitEconomics": {
    "status": "no-spend",
    "spendMode": "no-spend",
    "maxDailySpendUsd": 0,
    "paidAcquisitionAllowed": false,
    "storeSpendAllowed": false
  },
  "productionResponse": {
    "status": "guarded-operations",
    "deployAllowed": true,
    "rollbackRequired": false,
    "experimentsFrozen": false,
    "activeActions": [
      "disable-revenue-features",
      "enforce-zero-paid-spend"
    ]
  },
  "releaseCandidate": {
    "status": "release-candidate-ready",
    "candidateId": "pwa-d33b48782247",
    "manifestPath": "dist/release-candidate.json",
    "aggregateHash": "d33b48782247379b61c257e1df5c830c5fce90a1747ada3b7990dffa9a889843",
    "totalFiles": 38,
    "totalKb": 3543.3,
    "postDeploySmokeUrls": 7
  },
  "compliance": {
    "privacyPath": "/privacy.html",
    "supportPath": "/support.html",
    "hostedPrivacyStatus": "needs-hosted-domain"
  },
  "environment": {
    "status": "production-env-missing",
    "publicOrigin": null,
    "publicOriginStatus": "missing",
    "analyticsStatus": "local-or-fixture"
  },
  "setupRequiredOnce": [
    "Set GitHub Pages source to GitHub Actions in repository settings.",
    "For project pages, set repository variable VITE_BASE_PATH to /repository-name/.",
    "Set Cloudflare collector variables and secrets only when live first-party analytics are needed.",
    "Optionally attach a custom domain before app-store submission so the privacy URL is stable."
  ],
  "checks": [
    {
      "id": "web-promotion",
      "status": "pass",
      "detail": "Promote the current PWA build to an internal/public web experiment when hosting is connected."
    },
    {
      "id": "web-readiness",
      "status": "pass",
      "detail": "Web readiness is ready-after-build."
    },
    {
      "id": "release-health",
      "status": "pass",
      "detail": "Release health is monitoring."
    },
    {
      "id": "unit-economics-guard",
      "status": "pass",
      "detail": "Spend mode is no-spend; max daily paid spend is $0.00."
    },
    {
      "id": "production-response",
      "status": "pass",
      "detail": "Production response is guarded-operations; rollback required is false."
    },
    {
      "id": "dist-index",
      "status": "pass",
      "detail": "Production index.html exists."
    },
    {
      "id": "dist-service-worker",
      "status": "pass",
      "detail": "Production service worker exists."
    },
    {
      "id": "dist-privacy",
      "status": "pass",
      "detail": "Privacy policy is included in the deployable build."
    },
    {
      "id": "release-candidate",
      "status": "pass",
      "detail": "Release candidate is release-candidate-ready; candidate pwa-d33b48782247."
    },
    {
      "id": "deploy-workflow",
      "status": "pass",
      "detail": "GitHub Pages deployment workflow exists."
    },
    {
      "id": "production-environment",
      "status": "pass",
      "detail": "Environment status is production-env-missing; public origin is missing."
    },
    {
      "id": "event-collector-deployment",
      "status": "pass",
      "detail": "Event collector deployment is blocked-needs-cloudflare-env."
    }
  ],
  "commands": {
    "localVerification": "npm run autonomous:daily && npm run test:e2e",
    "deployWorkflow": "Run Web PWA Deploy workflow or let it run after Autonomous Daily Studio succeeds.",
    "collectorWorkflow": "Run Event Collector Deploy after Cloudflare variables and secrets are configured."
  }
} as const

export type DeploymentPlan = typeof deploymentPlan
