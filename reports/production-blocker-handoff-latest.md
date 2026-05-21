# Production Blocker Handoff

Generated: 2026-05-21T09:15:08.213Z
Status: handoff-waiting-on-owner-inputs
Detail: blocked-external-inputs
Live candidate: pwa-be1d91c63d8b
Source hash: 9ad90021eea5

## Summary

- Owner inputs required: 5
- Zero-cost first actions: 1
- Missing environment entries: 7
- Missing repository secrets: 3
- Product-gate blockers: 3
- Next best unlock: support-contact

## Source Status

- productionEnvironment: production-env-missing
- productionBootstrap: production-bootstrap-ready
- objectiveAudit: objective-in-progress
- autonomousOwnerLoop: owner-loop-ready
- monetization: blocked-by-product-gates
- storeCompliance: draft-ready-external-blockers
- androidRelease: blocked-needs-host-signing-play
- unitEconomics: no-spend
- postDeployArtifactSync: post-deploy-artifact-sync-passed

## Handoff Items

- owner-input-required: support-contact - Production support email
  - category: store-compliance
  - cost: zero-spend-if-existing-inbox
  - owner input required: true
  - unlocks: Hosted privacy/support pages can satisfy public store listing support-contact checks.
- owner-input-required: production-analytics-browser - Browser production analytics
  - category: measurement
  - cost: use-existing-free-tier-or-first-party-collector
  - owner input required: true
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
