# Live Site Monitor

Generated: 2026-05-24T16:08:50.126Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 27/27 passed (0 failed, 0 blocked)
Live candidate: pwa-b5b8d0009c07
Synced candidate: pwa-b5b8d0009c07
Live matches synced deploy: true
Latency p95 ms: 414

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

- pass: app-shell; /; HTTP 200; 105 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 310 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 316 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 309 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 315 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 308 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 355 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 308 ms; Live read-only check passed.
- pass: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP 200; 313 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 357 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 306 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 305 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 351 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 381 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 354 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 331 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 350 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 352 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 300 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 378 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 347 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 367 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 419 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 352 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 376 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 402 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 414 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
