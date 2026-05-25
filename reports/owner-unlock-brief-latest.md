# Owner Unlock Brief

Generated: 2026-05-25T08:29:03.509Z
Status: waiting-on-owner-input
Source hash: c4b9e96c22d5
Next unlock: production-analytics-browser
Recommended path: first-party-collector
Lowest-input path: posthog-browser
Lowest-input reason: PostHog browser capture currently needs 2 missing input(s), compared with 4 for the recommended path.

## Setup Guard

- print brief: ./ops/github/setup-production.sh --owner-unlock-brief
- preflight: npm run autonomous:owner-unlock-preflight
- setup preflight: ./ops/github/setup-production.sh --owner-unlock-preflight
- direct preflight: node scripts/owner-unlock-preflight.mjs --assert --print
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

### Lowest-Input Missing Variables

- VITE_POSTHOG_KEY: gh variable set VITE_POSTHOG_KEY --body "$VITE_POSTHOG_KEY"
- VITE_POSTHOG_HOST: gh variable set VITE_POSTHOG_HOST --body "$VITE_POSTHOG_HOST"

### Lowest-Input Missing Secrets

- none

### Lowest-Input Setup Commands

- ./ops/github/setup-production.sh
- RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- npm run autonomous:readiness

### Lowest-Input Validation Commands

- npm run autonomous:readiness
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
