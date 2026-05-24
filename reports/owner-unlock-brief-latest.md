# Owner Unlock Brief

Generated: 2026-05-24T14:35:08.734Z
Status: waiting-on-owner-input
Source hash: 0f4d043c3c2c
Next unlock: production-analytics-browser
Recommended path: first-party-collector

## Setup Guard

- print brief: ./ops/github/setup-production.sh --owner-unlock-brief
- preflight: npm run autonomous:owner-unlock-preflight
- direct preflight: node scripts/owner-unlock-preflight.mjs --assert --print
- sync configured values: ./ops/github/setup-production.sh
- workflow dispatch: RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- workflow dispatch default: disabled
- workflow dispatch requires RUN_WORKFLOWS: true

## Missing Variables

- CLOUDFLARE_ACCOUNT_ID: gh variable set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID"
- AGL_EVENT_COLLECTOR_R2_BUCKET: gh variable set AGL_EVENT_COLLECTOR_R2_BUCKET --body "$AGL_EVENT_COLLECTOR_R2_BUCKET"
- AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS: gh variable set AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS --body "$AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS"
- VITE_EVENT_COLLECTOR_URL: gh variable set VITE_EVENT_COLLECTOR_URL --body "$VITE_EVENT_COLLECTOR_URL"
- AGL_EVENT_COLLECTOR_EXPORT_URL: gh variable set AGL_EVENT_COLLECTOR_EXPORT_URL --body "$AGL_EVENT_COLLECTOR_EXPORT_URL"

## Missing Secrets

- CLOUDFLARE_API_TOKEN: printf "%s" "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN
- VITE_EVENT_COLLECTOR_WRITE_TOKEN: printf "%s" "$VITE_EVENT_COLLECTOR_WRITE_TOKEN" | gh secret set VITE_EVENT_COLLECTOR_WRITE_TOKEN
- AGL_EVENT_COLLECTOR_ADMIN_TOKEN: printf "%s" "$AGL_EVENT_COLLECTOR_ADMIN_TOKEN" | gh secret set AGL_EVENT_COLLECTOR_ADMIN_TOKEN

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
- workflowDispatchRequiresRunWorkflows: true
