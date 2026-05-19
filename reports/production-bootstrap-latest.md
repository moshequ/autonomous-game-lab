# Production Bootstrap

Generated: 2026-05-19T17:34:25.359Z
Status: production-bootstrap-ready
Mode: waiting-for-external-credentials
GitHub repository: missing
Repository channel: waiting-for-github-repository
gh CLI available: true

## Local Env Files

- ops/production.env.local: AGL_ANDROID_PACKAGE_NAME, AGL_ANDROID_SHA256_CERT_FINGERPRINT, AGL_ANDROID_KEYSTORE_BASE64, AGL_ANDROID_KEYSTORE_PASSWORD, AGL_ANDROID_KEY_ALIAS
- shell env precedence: true
- protected mutation keys require shell env: true
- values redacted: true

## Setup Groups

- waiting-for-github-repository: repository-channel; auto-run no; Repository missing; git worktree ready; workflow dispatch blocked.
- waiting-for-github-target: repository-bootstrap; auto-run no; Repository bootstrap waiting-for-github-target; helper ops/github/bootstrap-repository.sh; local git ready.
- waiting-for-origin-support: production-environment; auto-run no; Environment production-env-missing; public origin missing; support missing-production-address.
- ready-for-actions-pages: github-pages-hosting; auto-run no; Deployment plan is ready-for-pages; Pages workflow is .github/workflows/web-pwa-deploy.yml.
- waiting-for-gh-auth: github-pages-settings; auto-run no; GitHub CLI authentication is required before Pages settings can be synced.
- waiting-for-self-update-gate: autonomous-self-update; auto-run no; Self-update gate missing; direct push held.
- partially-configured: github-actions-variables; auto-run no; 3/24 repository variable value(s) present in this environment.
- partially-configured: github-actions-secrets; auto-run no; 3/8 repository secret value(s) present in this environment.
- blocked-needs-cloudflare-env: event-collector; auto-run no; Collector deployment is blocked-needs-cloudflare-env; provider cloudflare-worker-r2.
- held-by-product-gates: monetization-gate; auto-run no; Revenue disabled; spend mode no-spend.
- draft-ready-external-blockers: store-compliance-unblock; auto-run no; 4 store compliance blocker(s) remain.
- blocked-needs-host-signing-play: android-release-unblock; auto-run no; Native package blocked-draft-ready; Android release blocked-needs-host-signing-play.

## Setup Commands

- repository-preflight: npm run autonomous:repo-readiness
- repository-bootstrap-plan: npm run autonomous:repo-bootstrap
- local-gate: npm run autonomous:daily && npm run test:e2e && npm run autonomous:assert-deployable
- sync-pages-settings: AGL_SYNC_PAGES_SETTINGS=1 ./ops/github/setup-production.sh
- sync-repository-config: ./ops/github/setup-production.sh
- run-web-workflow: RUN_WORKFLOWS=1 ./ops/github/setup-production.sh
- run-android-workflow: RUN_WORKFLOWS=1 ALLOW_ANDROID_RELEASE_WORKFLOW=1 ./ops/github/setup-production.sh

## Repository Variables

- ready: VITE_BASE_PATH from VITE_BASE_PATH
- missing: AGL_PUBLIC_ORIGIN from AGL_PUBLIC_ORIGIN
- missing: VITE_PUBLIC_ORIGIN from AGL_PUBLIC_ORIGIN
- missing: PUBLIC_SITE_URL from AGL_PUBLIC_ORIGIN
- missing: AGL_SUPPORT_EMAIL from AGL_SUPPORT_EMAIL
- missing: VITE_POSTHOG_KEY from VITE_POSTHOG_KEY
- missing: VITE_POSTHOG_HOST from VITE_POSTHOG_HOST
- missing: POSTHOG_PROJECT_ID from POSTHOG_PROJECT_ID
- missing: POSTHOG_HOST from POSTHOG_HOST
- missing: CLOUDFLARE_ACCOUNT_ID from CLOUDFLARE_ACCOUNT_ID
- missing: VITE_EVENT_COLLECTOR_URL from VITE_EVENT_COLLECTOR_URL
- missing: AGL_EVENT_COLLECTOR_EXPORT_URL from AGL_EVENT_COLLECTOR_EXPORT_URL
- missing: AGL_EVENT_COLLECTOR_R2_BUCKET from AGL_EVENT_COLLECTOR_R2_BUCKET
- missing: AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS from AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS
- missing: VITE_ADSENSE_CLIENT_ID from VITE_ADSENSE_CLIENT_ID
- missing: VITE_ADSENSE_REWARDED_SLOT_ID from VITE_ADSENSE_REWARDED_SLOT_ID
- missing: ADMOB_PUBLISHER_ID from ADMOB_PUBLISHER_ID
- missing: AD_NETWORK_PROVIDER from AD_NETWORK_PROVIDER
- ready: AGL_ANDROID_PACKAGE_NAME from AGL_ANDROID_PACKAGE_NAME
- ready: AGL_ANDROID_SHA256_CERT_FINGERPRINT from AGL_ANDROID_SHA256_CERT_FINGERPRINT
- missing: AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED from AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED
- missing: AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED from AGL_APPLE_DEVELOPER_ACCOUNT_CONNECTED
- missing: AGL_AUTONOMOUS_SELF_UPDATE from AGL_AUTONOMOUS_SELF_UPDATE
- missing: AGL_AUTONOMOUS_SELF_UPDATE_DIRECT from AGL_AUTONOMOUS_SELF_UPDATE_DIRECT

## Repository Secrets

- missing: CLOUDFLARE_API_TOKEN from CLOUDFLARE_API_TOKEN
- missing: VITE_EVENT_COLLECTOR_WRITE_TOKEN from VITE_EVENT_COLLECTOR_WRITE_TOKEN
- missing: AGL_EVENT_COLLECTOR_ADMIN_TOKEN from AGL_EVENT_COLLECTOR_ADMIN_TOKEN
- missing: POSTHOG_PERSONAL_API_KEY from POSTHOG_PERSONAL_API_KEY
- ready: AGL_ANDROID_KEYSTORE_BASE64 from AGL_ANDROID_KEYSTORE_BASE64
- ready: AGL_ANDROID_KEYSTORE_PASSWORD from AGL_ANDROID_KEYSTORE_PASSWORD
- ready: AGL_ANDROID_KEY_ALIAS from AGL_ANDROID_KEY_ALIAS
- missing: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON from GOOGLE_PLAY_SERVICE_ACCOUNT_JSON

## External Blockers

- repository-readiness: Add a GitHub origin remote, set GITHUB_REPOSITORY/GH_REPO, or authenticate gh to infer the target repository.
- repository-readiness: Authenticate GitHub CLI or configure GH_TOKEN/GITHUB_TOKEN for workflow dispatch and repository settings sync.
- repository-bootstrap: Set GITHUB_REPOSITORY/GH_REPO or authenticate gh so the intended owner/repo can be inferred.
- repository-bootstrap: Attach a GitHub origin remote or create the target repository.
- repository-bootstrap: Authenticate GitHub CLI or provide GH_TOKEN/GITHUB_TOKEN for remote repository bootstrap.
- production-environment: Set AGL_PUBLIC_ORIGIN or PUBLIC_SITE_URL to a real HTTPS production origin.
- production-environment: Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.
- production-environment: Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.
- production-environment: Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.
- production-environment: Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.
- production-environment: Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.
- production-environment: Connect Apple Developer account only after revenue justifies iOS spend.
