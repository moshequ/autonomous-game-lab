# Live Site Monitor

Generated: 2026-05-25T17:43:03.838Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 32/32 passed (0 failed, 0 blocked)
Live candidate: pwa-f6706503c21b
Synced candidate: pwa-f6706503c21b
Live matches synced deploy: true
Latency p95 ms: 319

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

- pass: app-shell; /; HTTP 200; 90 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 265 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 315 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 317 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 314 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 263 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 319 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 261 ms; Live read-only check passed.
- pass: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP 200; 313 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 313 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 313 ms; Live read-only check passed.
- pass: product-gate-recovery-html; /product-gate-recovery.html; HTTP 200; 304 ms; Live read-only check passed.
- pass: product-gate-recovery-json; /product-gate-recovery.json; HTTP 200; 307 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 311 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 311 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 312 ms; Live read-only check passed.
- pass: store-readiness-html; /store-readiness.html; HTTP 200; 314 ms; Live read-only check passed.
- pass: store-readiness-json; /store-readiness.json; HTTP 200; 305 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 299 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 301 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 307 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 312 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 308 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 299 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 305 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 311 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 308 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 310 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 304 ms; Live read-only check passed.
- pass: monetization-html; /monetization.html; HTTP 200; 309 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 308 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 342 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
