# Owner Unlock Brief

Generated: 2026-05-26T05:05:30.677Z
Status: waiting-on-owner-input
Source hash: d21aef2d9eb2
Next unlock: production-analytics-browser
Recommended path: first-party-collector
Lowest-input path: posthog-browser
Lowest-input reason: PostHog browser capture currently needs 2 missing input(s), compared with 4 for the recommended path.
Parallel owner unlocks: production-analytics-browser, support-contact

## Setup Guard

- print brief: ./ops/github/setup-production.sh --owner-unlock-brief
- preflight: npm run autonomous:owner-unlock-preflight
- setup preflight: ./ops/github/setup-production.sh --owner-unlock-preflight
- direct preflight: node scripts/owner-unlock-preflight.mjs --assert --print
- write local env template: node scripts/owner-unlock-preflight.mjs --write-local-env-template
- setup write local env template: ./ops/github/setup-production.sh --owner-input-template
- write analytics local env template: node scripts/owner-unlock-preflight.mjs --analytics-input-template
- setup write analytics local env template: ./ops/github/setup-production.sh --analytics-input-template
- sync configured values: ./ops/github/setup-production.sh
- workflow dispatch: RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- workflow dispatch default: disabled
- workflow dispatch requires RUN_WORKFLOWS: true

## Missing Variables

- CLOUDFLARE_ACCOUNT_ID: gh variable set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID"
- VITE_EVENT_COLLECTOR_URL: gh variable set VITE_EVENT_COLLECTOR_URL --body "$VITE_EVENT_COLLECTOR_URL"
- AGL_EVENT_COLLECTOR_EXPORT_URL: gh variable set AGL_EVENT_COLLECTOR_EXPORT_URL --body "$AGL_EVENT_COLLECTOR_EXPORT_URL"

## Missing Secrets

- CLOUDFLARE_API_TOKEN: printf "%s" "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN

## Lowest-Input Path

- path: posthog-browser
- title: PostHog browser capture
- missing inputs: 2
- missing secrets: 0
- manual input reduction: 2
- no secrets required: true

## Minimal Intervention Path

- path: posthog-browser
- missing inputs: 2
- missing secrets: 0
- manual input reduction: 2
- no secrets required: true

## Combined Owner Input Pack

- id: combined-zero-secret-owner-input-pack
- local env file: .env.production.local
- missing inputs: 3
- secret inputs: 0
- unlocks: production-analytics-browser, support-contact
- store submission still blocked: true
- revenue still blocked: true

### Combined Local Env Template

- VITE_POSTHOG_KEY=
- VITE_POSTHOG_HOST=
- AGL_SUPPORT_EMAIL=

### Combined Shell Export Template

- export VITE_POSTHOG_KEY=
- export VITE_POSTHOG_HOST=
- export AGL_SUPPORT_EMAIL=

### Combined Pack Commands

- printBrief: node scripts/owner-unlock-brief.mjs --print
- combinedPreflight: node scripts/owner-unlock-preflight.mjs --assert --print
- analyticsPreflight: node scripts/owner-unlock-preflight.mjs --assert --print
- storeReadiness: npm run autonomous:store-readiness
- setupPreflight: ./ops/github/setup-production.sh --owner-unlock-preflight
- writeAnalyticsLocalEnvTemplate: node scripts/owner-unlock-preflight.mjs --analytics-input-template
- setupWriteAnalyticsLocalEnvTemplate: ./ops/github/setup-production.sh --analytics-input-template
- writeLocalEnvTemplate: node scripts/owner-unlock-preflight.mjs --write-local-env-template
- setupWriteLocalEnvTemplate: ./ops/github/setup-production.sh --owner-input-template
- syncConfiguredValues: ./ops/github/setup-production.sh
- workflowDispatch: RUN_WORKFLOWS=1 ./ops/github/setup-production.sh

### Lowest-Input Missing Variables

- VITE_POSTHOG_KEY: gh variable set VITE_POSTHOG_KEY --body "$VITE_POSTHOG_KEY"
- VITE_POSTHOG_HOST: gh variable set VITE_POSTHOG_HOST --body "$VITE_POSTHOG_HOST"

### Lowest-Input Missing Secrets

- none

### Lowest-Input Setup Commands

- ./ops/github/setup-production.sh --analytics-input-template
- ./ops/github/setup-production.sh
- RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- AGL_PRODUCTION_EVENT_EXPORT_FILES=/absolute/path/to/export.json npm run autonomous:collect-production-export
- npm run autonomous:readiness

### Lowest-Input Validation Commands

- npm run autonomous:readiness
- npm run test:e2e

## Parallel Owner Unlocks

### Browser production analytics (production-analytics-browser)

- category: measurement
- status: waiting-on-owner-input
- public status: /measurement-status.html
- public json: /measurement-status.json
- missing inputs: 4
- missing variables: CLOUDFLARE_ACCOUNT_ID, VITE_EVENT_COLLECTOR_URL, AGL_EVENT_COLLECTOR_EXPORT_URL
- missing secrets: CLOUDFLARE_API_TOKEN
- lowest-input missing: 2
- can apply before product gates: true
- store submission still blocked: true

Setup commands:
- npm run autonomous:event-collector-smoke
- npm run autonomous:collector-deploy-plan
- ./ops/github/setup-production.sh
- RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- npm run autonomous:readiness

Validation commands:
- npm run autonomous:event-collector-smoke
- npm run autonomous:collector-deploy-plan
- npm run autonomous:readiness
- npm run test:e2e

### Production support contact (support-contact)

- category: store-readiness
- status: waiting-on-owner-input
- public status: /store-readiness.html
- public json: /store-readiness.json
- missing inputs: 1
- missing variables: AGL_SUPPORT_EMAIL
- missing secrets: none
- lowest-input missing: 1
- can apply before product gates: true
- store submission still blocked: true

Setup commands:
- ./ops/github/setup-production.sh --support-input-template
- gh variable set AGL_SUPPORT_EMAIL --body "$AGL_SUPPORT_EMAIL"
- npm run autonomous:store-package
- npm run autonomous:store-compliance
- npm run autonomous:store-readiness
- npm run autonomous:readiness

Validation commands:
- npm run autonomous:store-readiness
- npm run test:e2e


## Setup Commands

- npm run autonomous:event-collector-smoke
- npm run autonomous:collector-deploy-plan
- ./ops/github/setup-production.sh
- RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- npm run autonomous:readiness

## Validation Commands

- npm run autonomous:event-collector-smoke
- npm run autonomous:collector-deploy-plan
- npm run autonomous:readiness
- npm run test:e2e

## After Unlock

- npm run autonomous:env
- npm run autonomous:local-event-bridge
- npm run autonomous:import-events
- npm run autonomous:collect-production-export
- npm run autonomous:analytics
- npm run autonomous:gate-recovery
- npm run autonomous:sample-plan

## Controls

- zeroPaidSpend: true
- noSecretValues: true
- noSecretValuesStored: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- productGatesStillRequiredForRevenue: true
- secretCommandsUseStdin: true
- setupPrintModeHasNoGithubMutation: true
- setupPreflightModeHasNoGithubMutation: true
- workflowDispatchRequiresRunWorkflows: true
