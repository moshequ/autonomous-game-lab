export const eventCollectorDeployment = {
  "generatedAt": "2026-06-02T13:31:27.470Z",
  "status": "blocked-needs-cloudflare-env",
  "envFiles": {
    "loaded": true,
    "loadedFiles": [
      {
        "path": ".env.production.local",
        "keys": [
          "VITE_POSTHOG_KEY",
          "VITE_POSTHOG_HOST",
          "AGL_SUPPORT_EMAIL"
        ]
      },
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
      "VITE_POSTHOG_KEY",
      "VITE_POSTHOG_HOST",
      "AGL_SUPPORT_EMAIL",
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
    "bucketConfigured": false,
    "allowedOrigins": null,
    "allowedOriginsConfigured": false,
    "endpoints": {
      "health": "/health",
      "ingest": "/events",
      "export": "/events/export",
      "summary": "/events/summary"
    },
    "aggregateSummaryEndpoint": true
  },
  "workflow": {
    "path": ".github/workflows/event-collector-deploy.yml",
    "status": "present",
    "triggers": {
      "manualDispatch": true,
      "autonomousDaily": true,
      "productionInputWatch": true
    },
    "deploysWhenConfigured": false,
    "autoCreatesBucket": true,
    "preflightRequiresWriteToken": true
  },
  "environment": {
    "browserCollectorConfigured": false,
    "serverExportConfigured": false,
    "cloudflareAccountConfigured": false,
    "cloudflareTokenConfigured": false,
    "bucketConfigured": false,
    "allowedOriginsConfigured": false,
    "writeTokenConfigured": false,
    "adminTokenConfigured": false,
    "collectorUrl": null,
    "exportUrl": null
  },
  "smoke": {
    "status": "pass",
    "piiStripped": true,
    "exportedEvents": 22,
    "summaryEvents": 22,
    "summaryAggregateOnly": true,
    "summaryRawEventsReturned": false,
    "activeSource": "local-event-drops"
  },
  "setupRequiredOnce": [
    "Create or select a Cloudflare account; the deploy workflow creates or reuses the R2 bucket for collector event batches.",
    "Use ./ops/github/setup-production.sh --collector-input-template or npm run autonomous:collector-input-template to create a blank local collector input template without writing values to tracked files.",
    "Set repository variables CLOUDFLARE_ACCOUNT_ID, AGL_EVENT_COLLECTOR_R2_BUCKET, AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS, VITE_EVENT_COLLECTOR_URL, and AGL_EVENT_COLLECTOR_EXPORT_URL.",
    "Set repository secrets CLOUDFLARE_API_TOKEN, VITE_EVENT_COLLECTOR_WRITE_TOKEN, and AGL_EVENT_COLLECTOR_ADMIN_TOKEN.",
    "Let Production Input Watch or the Event Collector Deploy workflow run; it refreshes production environment evidence, runs the collector smoke, and only deploys when the full preflight passes."
  ],
  "ownerInputPack": {
    "id": "first-party-collector-owner-input-pack",
    "title": "First-party collector owner input pack",
    "status": "waiting-on-collector-owner-inputs",
    "localEnvFile": ".env.production.local",
    "costMode": "zero-spend-use-existing-cloudflare-free-tier",
    "inputCount": 8,
    "variableInputCount": 5,
    "secretInputCount": 3,
    "missingInputCount": 8,
    "missingVariableCount": 5,
    "missingSecretCount": 3,
    "invalidInputCount": 0,
    "publicInputNames": [
      "CLOUDFLARE_ACCOUNT_ID",
      "AGL_EVENT_COLLECTOR_R2_BUCKET",
      "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
      "VITE_EVENT_COLLECTOR_URL",
      "AGL_EVENT_COLLECTOR_EXPORT_URL"
    ],
    "secretInputNames": [
      "CLOUDFLARE_API_TOKEN",
      "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
      "AGL_EVENT_COLLECTOR_ADMIN_TOKEN"
    ],
    "missingInputNames": [
      "CLOUDFLARE_ACCOUNT_ID",
      "AGL_EVENT_COLLECTOR_R2_BUCKET",
      "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
      "VITE_EVENT_COLLECTOR_URL",
      "AGL_EVENT_COLLECTOR_EXPORT_URL",
      "CLOUDFLARE_API_TOKEN",
      "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
      "AGL_EVENT_COLLECTOR_ADMIN_TOKEN"
    ],
    "missingVariableNames": [
      "CLOUDFLARE_ACCOUNT_ID",
      "AGL_EVENT_COLLECTOR_R2_BUCKET",
      "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
      "VITE_EVENT_COLLECTOR_URL",
      "AGL_EVENT_COLLECTOR_EXPORT_URL"
    ],
    "missingSecretNames": [
      "CLOUDFLARE_API_TOKEN",
      "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
      "AGL_EVENT_COLLECTOR_ADMIN_TOKEN"
    ],
    "invalidInputNames": [],
    "requiredVariables": [
      {
        "id": "var-cloudflare-account-id",
        "repositoryName": "CLOUDFLARE_ACCOUNT_ID",
        "envName": "CLOUDFLARE_ACCOUNT_ID",
        "configured": false,
        "valueSource": "missing",
        "purpose": "Cloudflare account that owns the Worker and R2 bucket.",
        "command": "gh variable set CLOUDFLARE_ACCOUNT_ID --body \"$CLOUDFLARE_ACCOUNT_ID\"",
        "validation": {
          "kind": "cloudflare-account-id-shape",
          "status": "missing",
          "expected": {
            "noWhitespace": true,
            "recommendedPattern": "32 lowercase hex characters",
            "maxLength": 64
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "CLOUDFLARE_ACCOUNT_ID must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      },
      {
        "id": "var-agl-event-collector-r2-bucket",
        "repositoryName": "AGL_EVENT_COLLECTOR_R2_BUCKET",
        "envName": "AGL_EVENT_COLLECTOR_R2_BUCKET",
        "configured": false,
        "valueSource": "missing",
        "purpose": "R2 bucket name for aggregate event batches.",
        "command": "gh variable set AGL_EVENT_COLLECTOR_R2_BUCKET --body \"$AGL_EVENT_COLLECTOR_R2_BUCKET\"",
        "validation": {
          "kind": "r2-bucket-name-shape",
          "status": "missing",
          "expected": {
            "noWhitespace": true,
            "pattern": "lowercase letters, numbers, dots, and hyphens",
            "maxLength": 63
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "AGL_EVENT_COLLECTOR_R2_BUCKET must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      },
      {
        "id": "var-agl-event-collector-allowed-origins",
        "repositoryName": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
        "envName": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
        "configured": false,
        "valueSource": "missing",
        "purpose": "Comma-separated browser origins allowed to post events.",
        "command": "gh variable set AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS --body \"$AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS\"",
        "validation": {
          "kind": "comma-separated-origin-list-shape",
          "status": "missing",
          "expected": {
            "commaSeparatedOrigins": true,
            "noPathsQueriesOrHashes": true,
            "protocol": "https preferred, http allowed for localhost"
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      },
      {
        "id": "var-vite-event-collector-url",
        "repositoryName": "VITE_EVENT_COLLECTOR_URL",
        "envName": "VITE_EVENT_COLLECTOR_URL",
        "configured": false,
        "valueSource": "missing",
        "purpose": "Browser event ingestion endpoint exposed to the PWA.",
        "command": "gh variable set VITE_EVENT_COLLECTOR_URL --body \"$VITE_EVENT_COLLECTOR_URL\"",
        "validation": {
          "kind": "collector-url-shape",
          "status": "missing",
          "expected": {
            "protocol": "https",
            "pathSegment": "/events",
            "noWhitespace": true
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "VITE_EVENT_COLLECTOR_URL must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      },
      {
        "id": "var-agl-event-collector-export-url",
        "repositoryName": "AGL_EVENT_COLLECTOR_EXPORT_URL",
        "envName": "AGL_EVENT_COLLECTOR_EXPORT_URL",
        "configured": false,
        "valueSource": "missing",
        "purpose": "Admin export endpoint used by autonomous production rollups.",
        "command": "gh variable set AGL_EVENT_COLLECTOR_EXPORT_URL --body \"$AGL_EVENT_COLLECTOR_EXPORT_URL\"",
        "validation": {
          "kind": "collector-url-shape",
          "status": "missing",
          "expected": {
            "protocol": "https",
            "pathSegment": "/events/export",
            "noWhitespace": true
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "AGL_EVENT_COLLECTOR_EXPORT_URL must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      }
    ],
    "requiredSecrets": [
      {
        "id": "secret-cloudflare-api-token",
        "repositoryName": "CLOUDFLARE_API_TOKEN",
        "envName": "CLOUDFLARE_API_TOKEN",
        "configured": false,
        "valueSource": "missing",
        "purpose": "Cloudflare API token with Worker and R2 deployment access.",
        "command": "printf \"%s\" \"$CLOUDFLARE_API_TOKEN\" | gh secret set CLOUDFLARE_API_TOKEN",
        "validation": {
          "kind": "token-presence-only",
          "status": "missing",
          "expected": {
            "nonEmpty": true,
            "valueNotSerialized": true
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "CLOUDFLARE_API_TOKEN must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      },
      {
        "id": "secret-vite-event-collector-write-token",
        "repositoryName": "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
        "envName": "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
        "configured": false,
        "valueSource": "missing",
        "purpose": "Collector write token passed to the browser build without serializing the value here.",
        "command": "printf \"%s\" \"$VITE_EVENT_COLLECTOR_WRITE_TOKEN\" | gh secret set VITE_EVENT_COLLECTOR_WRITE_TOKEN",
        "validation": {
          "kind": "token-presence-only",
          "status": "missing",
          "expected": {
            "nonEmpty": true,
            "valueNotSerialized": true
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "VITE_EVENT_COLLECTOR_WRITE_TOKEN must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      },
      {
        "id": "secret-agl-event-collector-admin-token",
        "repositoryName": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
        "envName": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
        "configured": false,
        "valueSource": "missing",
        "purpose": "Collector admin export token for autonomous rollup imports.",
        "command": "printf \"%s\" \"$AGL_EVENT_COLLECTOR_ADMIN_TOKEN\" | gh secret set AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
        "validation": {
          "kind": "token-presence-only",
          "status": "missing",
          "expected": {
            "nonEmpty": true,
            "valueNotSerialized": true
          },
          "checks": [
            {
              "id": "non-empty-local-input",
              "passed": false,
              "detail": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN must be exported locally or configured in the repository before setup can sync it."
            }
          ],
          "failedCheckIds": [
            "non-empty-local-input"
          ]
        }
      }
    ],
    "localEnvTemplateLines": [
      "CLOUDFLARE_ACCOUNT_ID=",
      "AGL_EVENT_COLLECTOR_R2_BUCKET=",
      "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS=",
      "VITE_EVENT_COLLECTOR_URL=",
      "AGL_EVENT_COLLECTOR_EXPORT_URL=",
      "CLOUDFLARE_API_TOKEN=",
      "VITE_EVENT_COLLECTOR_WRITE_TOKEN=",
      "AGL_EVENT_COLLECTOR_ADMIN_TOKEN="
    ],
    "shellExportTemplateLines": [
      "export CLOUDFLARE_ACCOUNT_ID=",
      "export AGL_EVENT_COLLECTOR_R2_BUCKET=",
      "export AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS=",
      "export VITE_EVENT_COLLECTOR_URL=",
      "export AGL_EVENT_COLLECTOR_EXPORT_URL=",
      "export CLOUDFLARE_API_TOKEN=",
      "export VITE_EVENT_COLLECTOR_WRITE_TOKEN=",
      "export AGL_EVENT_COLLECTOR_ADMIN_TOKEN="
    ],
    "commands": {
      "smoke": "npm run autonomous:event-collector-smoke",
      "plan": "npm run autonomous:collector-deploy-plan",
      "npmWriteLocalEnvTemplate": "npm run autonomous:collector-input-template",
      "writeLocalEnvTemplate": "node scripts/event-collector-deploy-plan.mjs --write-local-env-template",
      "setupWriteLocalEnvTemplate": "./ops/github/setup-production.sh --collector-input-template",
      "syncConfiguredValues": "./ops/github/setup-production.sh",
      "workflowDispatch": "RUN_WORKFLOWS=1 ./ops/github/setup-production.sh",
      "deployWorkflow": "Production Input Watch triggers Event Collector Deploy after collector variables and secrets are configured."
    },
    "valueValidation": {
      "id": "first-party-collector-owner-input-validation",
      "status": "waiting-on-collector-owner-inputs",
      "fields": [
        {
          "envName": "CLOUDFLARE_ACCOUNT_ID",
          "repositoryName": "CLOUDFLARE_ACCOUNT_ID",
          "kind": "repository-variable",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "cloudflare-account-id-shape",
            "status": "missing",
            "expected": {
              "noWhitespace": true,
              "recommendedPattern": "32 lowercase hex characters",
              "maxLength": 64
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "CLOUDFLARE_ACCOUNT_ID must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        },
        {
          "envName": "AGL_EVENT_COLLECTOR_R2_BUCKET",
          "repositoryName": "AGL_EVENT_COLLECTOR_R2_BUCKET",
          "kind": "repository-variable",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "r2-bucket-name-shape",
            "status": "missing",
            "expected": {
              "noWhitespace": true,
              "pattern": "lowercase letters, numbers, dots, and hyphens",
              "maxLength": 63
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "AGL_EVENT_COLLECTOR_R2_BUCKET must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        },
        {
          "envName": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
          "repositoryName": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS",
          "kind": "repository-variable",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "comma-separated-origin-list-shape",
            "status": "missing",
            "expected": {
              "commaSeparatedOrigins": true,
              "noPathsQueriesOrHashes": true,
              "protocol": "https preferred, http allowed for localhost"
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        },
        {
          "envName": "VITE_EVENT_COLLECTOR_URL",
          "repositoryName": "VITE_EVENT_COLLECTOR_URL",
          "kind": "repository-variable",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "collector-url-shape",
            "status": "missing",
            "expected": {
              "protocol": "https",
              "pathSegment": "/events",
              "noWhitespace": true
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "VITE_EVENT_COLLECTOR_URL must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        },
        {
          "envName": "AGL_EVENT_COLLECTOR_EXPORT_URL",
          "repositoryName": "AGL_EVENT_COLLECTOR_EXPORT_URL",
          "kind": "repository-variable",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "collector-url-shape",
            "status": "missing",
            "expected": {
              "protocol": "https",
              "pathSegment": "/events/export",
              "noWhitespace": true
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "AGL_EVENT_COLLECTOR_EXPORT_URL must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        },
        {
          "envName": "CLOUDFLARE_API_TOKEN",
          "repositoryName": "CLOUDFLARE_API_TOKEN",
          "kind": "secret",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "token-presence-only",
            "status": "missing",
            "expected": {
              "nonEmpty": true,
              "valueNotSerialized": true
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "CLOUDFLARE_API_TOKEN must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        },
        {
          "envName": "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
          "repositoryName": "VITE_EVENT_COLLECTOR_WRITE_TOKEN",
          "kind": "secret",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "token-presence-only",
            "status": "missing",
            "expected": {
              "nonEmpty": true,
              "valueNotSerialized": true
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "VITE_EVENT_COLLECTOR_WRITE_TOKEN must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        },
        {
          "envName": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
          "repositoryName": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN",
          "kind": "secret",
          "configured": false,
          "valueSource": "missing",
          "validation": {
            "kind": "token-presence-only",
            "status": "missing",
            "expected": {
              "nonEmpty": true,
              "valueNotSerialized": true
            },
            "checks": [
              {
                "id": "non-empty-local-input",
                "passed": false,
                "detail": "AGL_EVENT_COLLECTOR_ADMIN_TOKEN must be exported locally or configured in the repository before setup can sync it."
              }
            ],
            "failedCheckIds": [
              "non-empty-local-input"
            ]
          }
        }
      ],
      "controls": {
        "localOnly": true,
        "noGeneratedValueSerialization": true,
        "noGithubMutation": true,
        "cloudflareAccountIdShapeValidated": true,
        "bucketNameShapeValidated": true,
        "allowedOriginsShapeValidated": true,
        "collectorUrlShapeValidated": true,
        "exportUrlShapeValidated": true,
        "tokenPresenceOnly": true
      }
    },
    "controls": {
      "zeroPaidSpend": true,
      "noSecretValues": true,
      "noSecretValuesStored": true,
      "noSecretValuesSerialized": true,
      "noMutation": true,
      "noWorkflowDispatch": true,
      "workflowDispatchRequiresRunWorkflows": true,
      "commandRequiresOwnerRun": true,
      "noAutomatedAccountCreation": true,
      "noAccountCreation": true,
      "requiresOwnerCloudflareAccount": true,
      "noStoreSubmission": true,
      "noRevenueEnablement": true,
      "gitIgnoredLocalEnvFile": true,
      "localTemplateWriteNoSecretValues": true,
      "localTemplateWritePreservesExistingValues": true,
      "localTemplateWriteNoGithubMutation": true,
      "templateValuesBlank": true,
      "valuesRedacted": true
    }
  },
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
      "id": "collector-aggregate-summary",
      "status": "pass",
      "detail": "Admin-only aggregate summary endpoint returns counts without raw events."
    },
    {
      "id": "deploy-workflow",
      "status": "pass",
      "detail": "GitHub Actions collector deploy workflow exists."
    },
    {
      "id": "cloudflare-credentials",
      "status": "missing-env",
      "detail": "Cloudflare account id and API token are configured."
    },
    {
      "id": "collector-runtime-env",
      "status": "missing-env",
      "detail": "Browser collector URL, export URL, R2 bucket, and allowed origins are configured."
    },
    {
      "id": "collector-tokens",
      "status": "missing-env",
      "detail": "Public write token and admin export token are configured before Worker deployment."
    }
  ],
  "commands": {
    "smoke": "npm run autonomous:event-collector-smoke",
    "plan": "npm run autonomous:collector-deploy-plan",
    "deployWorkflow": "Production Input Watch triggers Event Collector Deploy after Cloudflare variables and secrets are configured."
  }
} as const

export type EventCollectorDeployment = typeof eventCollectorDeployment
