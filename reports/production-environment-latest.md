# Production Environment

Generated: 2026-05-26T05:17:38.883Z
Status: production-env-missing
Public origin: https://moshequ.github.io/autonomous-game-lab
Analytics: local-or-fixture
Monetization: disabled
Android: blocked-needs-host-signing-account

## Local Env Files

- ops/production.env.local: AGL_ANDROID_PACKAGE_NAME, AGL_ANDROID_SHA256_CERT_FINGERPRINT, AGL_ANDROID_KEYSTORE_BASE64, AGL_ANDROID_KEYSTORE_PASSWORD, AGL_ANDROID_KEY_ALIAS
- shell env precedence: true
- protected mutation keys require shell env: true
- values redacted: true

## GitHub Repository Environment

- status: inspected
- repository: moshequ/autonomous-game-lab
- variables inspected: 10
- secrets inspected: 5
- read-only inspection: true
- secret values never read: true
- no mutation: true
- variable names: AGL_ANDROID_PACKAGE_NAME, AGL_ANDROID_SHA256_CERT_FINGERPRINT, AGL_AUTONOMOUS_SELF_UPDATE, AGL_AUTONOMOUS_SELF_UPDATE_DIRECT, AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS, AGL_EVENT_COLLECTOR_R2_BUCKET, AGL_PUBLIC_ORIGIN, PUBLIC_SITE_URL, VITE_BASE_PATH, VITE_PUBLIC_ORIGIN
- secret names: AGL_ANDROID_KEYSTORE_BASE64, AGL_ANDROID_KEYSTORE_PASSWORD, AGL_ANDROID_KEY_ALIAS, AGL_EVENT_COLLECTOR_ADMIN_TOKEN, VITE_EVENT_COLLECTOR_WRITE_TOKEN

## Required Environment

- configured: AGL_PUBLIC_ORIGIN - HTTPS origin used for hosted privacy/support URLs, sitemap, TWA host, and Digital Asset Links. If no custom origin is set, the setup helper can infer the zero-cost GitHub Pages origin from the repository target.
- missing: AGL_SUPPORT_EMAIL - Production support contact for privacy and store listings.
- missing: VITE_POSTHOG_KEY - Optional browser-side PostHog analytics forwarding.
- missing: POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY - Optional autonomous production analytics and experiment result rollups from PostHog.
- missing: VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL - Optional zero-cost Worker/R2 event collector for browser analytics and autonomous rollups.
- missing: VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID - Web/PWA rewarded or display-ad test configuration after product and privacy gates pass.
- missing: ADMOB_PUBLISHER_ID - Native app seller line for app-ads.txt and Android rewarded tests after app-store gates pass.
- configured: AGL_ANDROID_SHA256_CERT_FINGERPRINT - Android signing fingerprint for Digital Asset Links.
- missing: AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED - Allows native packaging gates to treat Play Console access as connected.

## Blockers

- Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.
- Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.
- Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.
- Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.
- Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.
- Connect Apple Developer account only after revenue justifies iOS spend.
