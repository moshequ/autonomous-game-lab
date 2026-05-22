# Production Blocker Handoff

Generated: 2026-05-22T11:52:46.919Z
Status: handoff-waiting-on-owner-inputs
Detail: blocked-external-inputs
Live candidate: pwa-f9ee9600cd4b
Source hash: 540097af2aeb

## Summary

- Owner inputs required: 4
- Zero-cost first actions: 1
- Missing environment entries: 7
- Missing repository secrets: 3
- Product-gate blockers: 3
- Next best unlock: production-analytics-browser

## Source Status

- productionEnvironment: production-env-missing
- productionBootstrap: production-bootstrap-ready
- objectiveAudit: objective-in-progress
- autonomousOwnerLoop: owner-loop-ready
- supportChannel: support-channel-ready
- monetization: blocked-by-product-gates
- storeCompliance: draft-ready-external-blockers
- androidRelease: blocked-needs-host-signing-play
- iosRelease: deferred-until-ios-payback
- unitEconomics: no-spend
- postDeployArtifactSync: post-deploy-artifact-sync-passed

## Handoff Items

- web-support-ready-store-email-deferred: support-contact - Web support channel and store support email
  - category: store-compliance
  - cost: zero-spend-public-issues-ready
  - owner input required: false
  - unlocks: Hosted privacy/support pages already route web/PWA support to public GitHub Issues. A real support email remains deferred until store submission is economically justified.
- owner-input-required: production-analytics-browser - Browser production analytics
  - category: measurement
  - cost: zero-spend-use-existing-free-tier-or-first-party-collector
  - owner input required: true
  - unlock kit: production-analytics-browser
  - recommended path: first-party-collector
  - setup commands: 5
  - unlocks: Real player events can replace fixture/local-only evidence for product gates and retention decisions.
- owner-input-required: autonomous-rollup-credentials - Autonomous production rollups
  - category: measurement
  - cost: use-existing-collector-or-posthog-project
  - owner input required: true
  - unlocks: Scheduled owner loops can evaluate production behavior without manual event exports.
- needs-live-sample: product-gate-sample - Product-gate live sample
  - category: product-gates
  - cost: zero-paid-acquisition-only
  - owner input required: false
  - unlocks: Completion, replay, and D1 gates decide whether monetization and store spend can be justified.
- blocked-by-product-gates: ad-provider-config - Ad provider configuration
  - category: monetization
  - cost: disabled-until-product-gates-pass
  - owner input required: false
  - unlocks: Rewarded/display revenue tests can be enabled only after privacy, retention, and provider gates pass.
- owner-account-required: google-play-account - Google Play developer account
  - category: app-store
  - cost: paid-store-fee-blocked-by-unit-economics
  - owner input required: true
  - unlocks: Android submission checks can progress after product economics justify store spend.
- blocked-by-play-account: google-play-service-account - Google Play service account
  - category: app-store
  - cost: requires-existing-play-console-access
  - owner input required: true
  - unlocks: CI can prepare upload handoff only after Play Console service-account credentials exist.
- deferred-until-ios-payback: apple-developer-account - Apple Developer account
  - category: app-store
  - cost: paid-annual-fee-deferred
  - owner input required: false
  - unlocks: iOS submission remains intentionally deferred until revenue justifies annual spend.

## Next Unlock Kit

- owner-input-required: production-analytics-browser - Browser production analytics unlock kit
- recommended path: first-party-collector
- setup commands: 5
- validation commands: 4
- path first-party-collector: needs-variables-and-secrets; zero-spend-use-existing-cloudflare-free-tier
  - variables: CLOUDFLARE_ACCOUNT_ID, AGL_EVENT_COLLECTOR_R2_BUCKET, AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS, VITE_EVENT_COLLECTOR_URL, AGL_EVENT_COLLECTOR_EXPORT_URL
  - secrets: CLOUDFLARE_API_TOKEN, VITE_EVENT_COLLECTOR_WRITE_TOKEN, AGL_EVENT_COLLECTOR_ADMIN_TOKEN
  - commands: npm run autonomous:event-collector-smoke && npm run autonomous:collector-deploy-plan && ./ops/github/setup-production.sh && RUN_WORKFLOWS=1 ./ops/github/setup-production.sh && npm run autonomous:readiness
- path posthog-browser: needs-public-project-key; zero-spend-use-existing-posthog-free-project
  - variables: VITE_POSTHOG_KEY, VITE_POSTHOG_HOST
  - secrets: none
  - commands: ./ops/github/setup-production.sh && RUN_WORKFLOWS=1 ./ops/github/setup-production.sh && npm run autonomous:readiness

## Missing Env

- AGL_SUPPORT_EMAIL: Production support contact for privacy and store listings.
- VITE_POSTHOG_KEY: Optional browser-side PostHog analytics forwarding.
- POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY: Optional autonomous production analytics and experiment result rollups from PostHog.
- VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL: Optional zero-cost Worker/R2 event collector for browser analytics and autonomous rollups.
- VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID: Web/PWA rewarded or display-ad test configuration after product and privacy gates pass.
- ADMOB_PUBLISHER_ID: Native app seller line for app-ads.txt and Android rewarded tests after app-store gates pass.
- AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED: Allows native packaging gates to treat Play Console access as connected.

## Missing Secrets

- CLOUDFLARE_API_TOKEN: printf "%s" "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN
- POSTHOG_PERSONAL_API_KEY: printf "%s" "$POSTHOG_PERSONAL_API_KEY" | gh secret set POSTHOG_PERSONAL_API_KEY
- GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: printf "%s" "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" | gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON

## Controls

- zeroPaidSpend: true
- noSecretValues: true
- noSecretValuesStored: true
- noMutation: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- productGatesStillRequiredForRevenue: true
- storeSpendStillBlockedByUnitEconomics: true
