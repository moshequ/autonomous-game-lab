# Owner Unlock Preflight

Generated: 2026-05-25T12:14:31.972Z
Status: owner-unlock-preflight-waiting-on-input
Ready for setup: false
Next unlock: production-analytics-browser
Recommended path: first-party-collector
Lowest-input path: posthog-browser
Source hash: ff6295820d03

## Summary

- total inputs: 8
- ready inputs: 0
- missing inputs: 8
- invalid inputs: 0
- repository configured inputs: 0
- local available inputs: 0
- lowest-input missing inputs: 2
- lowest-input secret inputs: 0
- manual input reduction: 6

## Path Options

- recommended: first-party-collector (owner-unlock-preflight-waiting-on-input; missing=8; secrets=3)
- lowest-input: posthog-browser (owner-unlock-preflight-waiting-on-input; missing=2; secrets=0)

## Inputs

- missing: CLOUDFLARE_ACCOUNT_ID (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: AGL_EVENT_COLLECTOR_R2_BUCKET (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: VITE_EVENT_COLLECTOR_URL (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: AGL_EVENT_COLLECTOR_EXPORT_URL (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: CLOUDFLARE_API_TOKEN (github-secret; local=false; repo=false; validation=not-checked-missing-input)
- missing: VITE_EVENT_COLLECTOR_WRITE_TOKEN (github-secret; local=false; repo=false; validation=not-checked-missing-input)
- missing: AGL_EVENT_COLLECTOR_ADMIN_TOKEN (github-secret; local=false; repo=false; validation=not-checked-missing-input)

## Commands

- print brief: node scripts/owner-unlock-brief.mjs --print
- preflight: node scripts/owner-unlock-preflight.mjs --assert --print
- setup preflight: ./ops/github/setup-production.sh --owner-unlock-preflight
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
