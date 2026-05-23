# Production Bootstrap

Generated: 2026-05-23T04:06:03.056Z
Status: production-bootstrap-ready
Mode: can-apply-configured-actions
GitHub repository: moshequ/autonomous-game-lab
Repository channel: repository-channel-ready
gh CLI available: true

## Local Env Files

- none loaded
- shell env precedence: true
- protected mutation keys require shell env: true
- values redacted: true

## Setup Groups

- repository-channel-ready: repository-channel; auto-run no; Repository moshequ/autonomous-game-lab; git worktree ready; workflow dispatch ready.
- repository-bootstrap-ready: repository-bootstrap; auto-run no; Repository bootstrap repository-bootstrap-ready; helper ops/github/bootstrap-repository.sh; local git ready.
- waiting-for-origin-support: production-environment; auto-run no; Environment production-env-missing; public origin configured; support missing-production-address.
- ready-for-actions-pages: github-pages-hosting; auto-run yes; Deployment plan is ready-for-pages; Pages workflow is .github/workflows/web-pwa-deploy.yml.
- ready-to-sync: github-pages-settings; auto-run yes; GitHub CLI can configure Pages to use the Actions workflow source.
- ready-for-direct-persistence: autonomous-self-update; auto-run yes; Self-update gate configured; direct push configured.
- partially-configured: github-actions-variables; auto-run yes; 10/24 repository variable value(s) present in this environment.
- partially-configured: github-actions-secrets; auto-run yes; 5/8 repository secret value(s) present in this environment.
- blocked-needs-cloudflare-env: event-collector; auto-run no; Collector deployment is blocked-needs-cloudflare-env; provider cloudflare-worker-r2.
- held-by-product-gates: monetization-gate; auto-run no; Revenue disabled; spend mode no-spend.
- draft-ready-external-blockers: store-compliance-unblock; auto-run no; 3 store compliance blocker(s) remain.
- blocked-needs-host-signing-play: android-release-unblock; auto-run no; Native package ready-for-bubblewrap-build; Android release blocked-needs-host-signing-play.

## Setup Commands

- repository-preflight: npm run autonomous:repo-readiness
- repository-bootstrap-plan: npm run autonomous:repo-bootstrap
- local-gate: npm run autonomous:operate && npm run autonomous:assert-deployable
- sync-pages-settings: AGL_SYNC_PAGES_SETTINGS=1 ./ops/github/setup-production.sh
- sync-repository-config: ./ops/github/setup-production.sh
- production-activation: npm run autonomous:activate-production
- run-web-workflow: RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- run-android-workflow: RUN_WORKFLOWS=1 ALLOW_ANDROID_RELEASE_WORKFLOW=1 ./ops/github/setup-production.sh

## Repository Variables

- ready: VITE_BASE_PATH from VITE_BASE_PATH (environment)
- ready: AGL_PUBLIC_ORIGIN from AGL_PUBLIC_ORIGIN (environment)
- ready: VITE_PUBLIC_ORIGIN from AGL_PUBLIC_ORIGIN (environment)
- ready: PUBLIC_SITE_URL from AGL_PUBLIC_ORIGIN (environment)
- missing: AGL_SUPPORT_EMAIL from AGL_SUPPORT_EMAIL (missing)
- missing: VITE_POSTHOG_KEY from VITE_POSTHOG_KEY (missing)
- missing: VITE_POSTHOG_HOST from VITE_POSTHOG_HOST (missing)
- missing: POSTHOG_PROJECT_ID from POSTHOG_PROJECT_ID (missing)
- missing: POSTHOG_HOST from POSTHOG_HOST (missing)
- missing: CLOUDFLARE_ACCOUNT_ID from CLOUDFLARE_ACCOUNT_ID (missing)
- missing: VITE_EVENT_COLLECTOR_URL from VITE_EVENT_COLLECTOR_URL (missing)
- missing: AGL_EVENT_COLLECTOR_EXPORT_URL from AGL_EVENT_COLLECTOR_EXPORT_URL (missing)
- ready: AGL_EVENT_COLLECTOR_R2_BUCKET from AGL_EVENT_COLLECTOR_R2_BUCKET (environment)
- ready: AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS from AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS (environment)
- missing: VITE_ADSENSE_CLIENT_ID from VITE_ADSENSE_CLIENT_ID (missing)
- missing: VITE_ADSENSE_REWARDED_SLOT_ID from VITE_ADSENSE_REWARDED_SLOT_ID (missing)
- missing: ADMOB_PUBLISHER_ID from ADMOB_PUBLISHER_ID (missing)
- missing: AD_NETWORK_PROVIDER from AD_NETWORK_PROVIDER (missing)
- ready: AGL_ANDROID_PACKAGE_NAME from AGL_ANDROID_PACKAGE_NAME (environment)
- ready: AGL_ANDROID_SHA256_CERT_FINGERPRINT from AGL_ANDROID_SHA256_CERT_FINGERPRINT (environment)
- missing: AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED from AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED (missing)
- missing: AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED from AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED (missing)
- ready: AGL_AUTONOMOUS_SELF_UPDATE from AGL_AUTONOMOUS_SELF_UPDATE (environment)
- ready: AGL_AUTONOMOUS_SELF_UPDATE_DIRECT from AGL_AUTONOMOUS_SELF_UPDATE_DIRECT (environment)

## Repository Secrets

- missing: CLOUDFLARE_API_TOKEN from CLOUDFLARE_API_TOKEN
- ready: VITE_EVENT_COLLECTOR_WRITE_TOKEN from VITE_EVENT_COLLECTOR_WRITE_TOKEN
- ready: AGL_EVENT_COLLECTOR_ADMIN_TOKEN from AGL_EVENT_COLLECTOR_ADMIN_TOKEN
- missing: POSTHOG_PERSONAL_API_KEY from POSTHOG_PERSONAL_API_KEY
- ready: AGL_ANDROID_KEYSTORE_BASE64 from AGL_ANDROID_KEYSTORE_BASE64
- ready: AGL_ANDROID_KEYSTORE_PASSWORD from AGL_ANDROID_KEYSTORE_PASSWORD
- ready: AGL_ANDROID_KEY_ALIAS from AGL_ANDROID_KEY_ALIAS
- missing: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON from GOOGLE_PLAY_SERVICE_ACCOUNT_JSON

## External Blockers

- production-environment: Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.
- production-environment: Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.
- production-environment: Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.
- production-environment: Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.
- production-environment: Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.
- production-environment: Connect Apple Developer account only after revenue justifies iOS spend.
- event-collector: Collector environment is not configured.
- store-compliance: support-contact: Production support email is required before public store submission.
- store-compliance: google-play-account: Google Play developer account must be connected before Android submission.
- store-compliance: apple-developer-account: Apple Developer account remains deferred until iOS spend is justified.
- android-release: google-play-account: Google Play account is not connected.
- android-release: play-service-account: Google Play service account upload credentials are not available to CI.
