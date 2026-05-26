# Live Site Monitor

Generated: 2026-05-26T22:03:50.939Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 34/34 passed (0 failed, 0 blocked)
Live candidate: pwa-b6ce2de81c1f
Synced candidate: pwa-b6ce2de81c1f
Live matches synced deploy: true
Latency p95 ms: 356

## Controls

- zeroPaidSpend: true
- readOnlyHttpChecks: true
- noMutation: true
- noAccountCreation: true
- noStoreSubmission: true
- noRevenueEnablement: true
- noCookiesOrCredentials: true
- strictSyncedManifestComparison: true

## Checks

- pass: app-shell; /; HTTP 200; 164 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 307 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 298 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 324 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 200 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 211 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 210 ms; Live read-only check passed.
- pass: owner-unlock-html; /owner-unlock.html; HTTP 200; 320 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 211 ms; Live read-only check passed.
- pass: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP 200; 308 ms; Live read-only check passed.
- pass: owner-runtime-config-json; /owner-runtime-config.json; HTTP 200; 206 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 206 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 321 ms; Live read-only check passed.
- pass: product-gate-recovery-html; /product-gate-recovery.html; HTTP 200; 333 ms; Live read-only check passed.
- pass: product-gate-recovery-json; /product-gate-recovery.json; HTTP 200; 324 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 342 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 333 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 299 ms; Live read-only check passed.
- pass: store-readiness-html; /store-readiness.html; HTTP 200; 308 ms; Live read-only check passed.
- pass: store-readiness-json; /store-readiness.json; HTTP 200; 204 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 303 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 208 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 338 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 338 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 207 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 206 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 357 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 208 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 312 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 336 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 336 ms; Live read-only check passed.
- pass: monetization-html; /monetization.html; HTTP 200; 356 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 340 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 253 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
