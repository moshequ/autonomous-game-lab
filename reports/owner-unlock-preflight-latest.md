# Owner Unlock Preflight

Generated: 2026-05-24T16:08:59.381Z
Status: owner-unlock-preflight-waiting-on-input
Ready for setup: false
Next unlock: production-analytics-browser
Recommended path: first-party-collector
Source hash: 108f4676eb2d

## Summary

- total inputs: 8
- ready inputs: 4
- missing inputs: 4
- invalid inputs: 0
- repository configured inputs: 4
- local available inputs: 0

## Inputs

- missing: CLOUDFLARE_ACCOUNT_ID (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- ready: AGL_EVENT_COLLECTOR_R2_BUCKET (github-variable; local=false; repo=true; validation=not-inspected-repository-configured)
- ready: AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS (github-variable; local=false; repo=true; validation=not-inspected-repository-configured)
- missing: VITE_EVENT_COLLECTOR_URL (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: AGL_EVENT_COLLECTOR_EXPORT_URL (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: CLOUDFLARE_API_TOKEN (github-secret; local=false; repo=false; validation=not-checked-missing-input)
- ready: VITE_EVENT_COLLECTOR_WRITE_TOKEN (github-secret; local=false; repo=true; validation=not-inspected-repository-configured)
- ready: AGL_EVENT_COLLECTOR_ADMIN_TOKEN (github-secret; local=false; repo=true; validation=not-inspected-repository-configured)

## Commands

- print brief: node scripts/owner-unlock-brief.mjs --print
- preflight: node scripts/owner-unlock-preflight.mjs --assert --print
- package preflight: npm run autonomous:owner-unlock-preflight
- sync configured values: ./ops/github/setup-production.sh
- workflow dispatch when ready: RUN_WORKFLOWS=1 ./ops/github/setup-production.sh

## Guardrails

- zeroPaidSpend: true
- noSecretValues: true
- noSecretValuesStored: true
- noSecretValuesSerialized: true
- noMutation: true
- noWorkflowDispatch: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- setupStillRequiresExplicitRun: true
- workflowDispatchStillRequiresRunWorkflows: true
- secretValuesNeverSerialized: true
