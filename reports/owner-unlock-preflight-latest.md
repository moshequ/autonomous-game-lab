# Owner Unlock Preflight

Generated: 2026-05-27T06:01:26.833Z
Status: owner-unlock-preflight-waiting-on-input
Ready for setup: false
Next unlock: production-analytics-browser
Recommended path: first-party-collector
Lowest-input path: posthog-browser
Source hash: fa4a46d0a468

## Summary

- total inputs: 8
- ready inputs: 4
- missing inputs: 4
- invalid inputs: 0
- repository configured inputs: 4
- local available inputs: 4
- lowest-input missing inputs: 1
- lowest-input secret inputs: 0
- manual input reduction: 3
- combined missing inputs: 2
- combined secret inputs: 0

## Minimal Intervention Path

- path: posthog-browser
- missing inputs: 1
- secret inputs: 0
- manual input reduction: 3
- ready for setup: false

## Owner Input Pack

- path: posthog-browser
- local env file: .env.production.local
- missing input names: VITE_POSTHOG_KEY
- secret inputs: 0
- no secret values stored: true

### Local Env Template

- VITE_POSTHOG_KEY=

## Combined Owner Input Preflight

- id: combined-zero-secret-owner-input-pack
- status: combined-owner-input-preflight-waiting-on-input
- local env file: .env.production.local
- missing input names: VITE_POSTHOG_KEY, AGL_SUPPORT_EMAIL
- secret inputs: 0
- ready for setup: false
- support validation: not-checked-missing-input

### Combined Local Env Template

- VITE_POSTHOG_KEY=
- AGL_SUPPORT_EMAIL=

## Path Options

- recommended: first-party-collector (owner-unlock-preflight-waiting-on-input; missing=4; secrets=3)
- lowest-input: posthog-browser (owner-unlock-preflight-waiting-on-input; missing=1; secrets=0)

## Inputs

- missing: CLOUDFLARE_ACCOUNT_ID (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- ready: AGL_EVENT_COLLECTOR_R2_BUCKET (github-variable; local=true; repo=true; validation=pass)
- ready: AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS (github-variable; local=true; repo=true; validation=pass)
- missing: VITE_EVENT_COLLECTOR_URL (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: AGL_EVENT_COLLECTOR_EXPORT_URL (github-variable; local=false; repo=false; validation=not-checked-missing-input)
- missing: CLOUDFLARE_API_TOKEN (github-secret; local=false; repo=false; validation=not-checked-missing-input)
- ready: VITE_EVENT_COLLECTOR_WRITE_TOKEN (github-secret; local=true; repo=true; validation=pass)
- ready: AGL_EVENT_COLLECTOR_ADMIN_TOKEN (github-secret; local=true; repo=true; validation=pass)

## Commands

- print brief: node scripts/owner-unlock-brief.mjs --print
- preflight: node scripts/owner-unlock-preflight.mjs --assert --print
- setup preflight: ./ops/github/setup-production.sh --owner-unlock-preflight
- npm write local env template: npm run autonomous:owner-input-template
- write local env template: node scripts/owner-unlock-preflight.mjs --write-local-env-template
- setup write local env template: ./ops/github/setup-production.sh --owner-input-template
- npm write analytics local env template: npm run autonomous:analytics-input-template
- write analytics local env template: node scripts/owner-unlock-preflight.mjs --analytics-input-template
- setup write analytics local env template: ./ops/github/setup-production.sh --analytics-input-template
- npm write support local env template: npm run autonomous:support-input-template
- combined input preflight: node scripts/owner-unlock-preflight.mjs --assert --print
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
- localTemplateWriteNoSecretValues: true
- localTemplateWritePreservesExistingValues: true
- localTemplateWriteNoGithubMutation: true
- localTemplateWriteGitignored: true
