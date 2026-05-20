export const eventCollectorDeployment = {
  "generatedAt": "2026-05-20T02:00:41.681Z",
  "status": "blocked-needs-cloudflare-env",
  "envFiles": {
    "loaded": true,
    "loadedFiles": [
      {
        "path": "ops/production.env.local",
        "keys": [
          "AGL_ANDROID_PACKAGE_NAME",
          "AGL_ANDROID_SHA256_CERT_FINGERPRINT",
          "AGL_ANDROID_KEYSTORE_BASE64",
          "AGL_ANDROID_KEYSTORE_PASSWORD",
          "AGL_ANDROID_KEY_ALIAS"
        ]
      }
    ],
    "loadedKeys": [
      "AGL_ANDROID_PACKAGE_NAME",
      "AGL_ANDROID_SHA256_CERT_FINGERPRINT",
      "AGL_ANDROID_KEYSTORE_BASE64",
      "AGL_ANDROID_KEYSTORE_PASSWORD",
      "AGL_ANDROID_KEY_ALIAS"
    ],
    "skippedExistingKeys": [],
    "skippedProtectedKeys": [],
    "overwrittenEnvFileKeys": [],
    "supportedFiles": [
      ".env",
      ".env.local",
      ".env.production",
      ".env.production.local",
      "ops/production.env",
      "ops/production.env.local"
    ],
    "candidateFiles": [
      ".env",
      ".env.local",
      ".env.production",
      ".env.production.local",
      "ops/production.env",
      "ops/production.env.local"
    ],
    "shellEnvPrecedence": true,
    "valuesRedacted": true,
    "controls": {
      "shellEnvPrecedence": true,
      "laterEnvFilesOverrideEarlierEnvFiles": true,
      "protectedMutationKeysRequireShellEnv": true,
      "noSecretValuesInReports": true,
      "gitIgnoredLocalEnvFiles": true
    }
  },
  "provider": "cloudflare-worker-r2",
  "costPosture": "free-tier-friendly-no-paid-traffic",
  "worker": {
    "path": "ops/cloudflare/event-collector-worker.mjs",
    "storageBinding": "EVENT_BUCKET",
    "bucketName": "autonomous-game-lab-events",
    "allowedOrigins": null
  },
  "workflow": {
    "path": ".github/workflows/event-collector-deploy.yml",
    "status": "present",
    "deploysWhenConfigured": false
  },
  "environment": {
    "browserCollectorConfigured": false,
    "serverExportConfigured": false,
    "cloudflareAccountConfigured": false,
    "cloudflareTokenConfigured": false,
    "writeTokenConfigured": false,
    "adminTokenConfigured": false,
    "collectorUrl": null,
    "exportUrl": null
  },
  "smoke": {
    "status": "pass",
    "piiStripped": true,
    "exportedEvents": 13,
    "activeSource": "local-event-drops"
  },
  "setupRequiredOnce": [
    "Create or select a Cloudflare account and R2 bucket for collector event batches.",
    "Set repository variables CLOUDFLARE_ACCOUNT_ID, AGL_EVENT_COLLECTOR_R2_BUCKET, AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS, VITE_EVENT_COLLECTOR_URL, and AGL_EVENT_COLLECTOR_EXPORT_URL.",
    "Set repository secrets CLOUDFLARE_API_TOKEN, VITE_EVENT_COLLECTOR_WRITE_TOKEN, and AGL_EVENT_COLLECTOR_ADMIN_TOKEN.",
    "Run the Event Collector Deploy workflow; it runs the collector smoke before deploying."
  ],
  "checks": [
    {
      "id": "worker-source",
      "status": "pass",
      "detail": "Cloudflare Worker collector source exists."
    },
    {
      "id": "wrangler-config-template",
      "status": "pass",
      "detail": "Wrangler config template exists for the collector."
    },
    {
      "id": "collector-smoke",
      "status": "pass",
      "detail": "Event collector smoke is pass."
    },
    {
      "id": "deploy-workflow",
      "status": "pass",
      "detail": "GitHub Actions collector deploy workflow exists."
    },
    {
      "id": "cloudflare-credentials",
      "status": "missing-env",
      "detail": "Cloudflare account id, API token, and admin export token are configured."
    },
    {
      "id": "collector-runtime-env",
      "status": "missing-env",
      "detail": "Browser collector URL, export URL, and public write token are configured."
    }
  ],
  "commands": {
    "smoke": "npm run autonomous:event-collector-smoke",
    "plan": "npm run autonomous:collector-deploy-plan",
    "deployWorkflow": "Run Event Collector Deploy after Cloudflare variables and secrets are configured."
  }
} as const

export type EventCollectorDeployment = typeof eventCollectorDeployment
