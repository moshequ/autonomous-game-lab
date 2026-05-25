# Live Site Monitor

Generated: 2026-05-25T23:24:46.317Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 32/32 passed (0 failed, 0 blocked)
Live candidate: pwa-4866bb1db111
Synced candidate: pwa-4866bb1db111
Live matches synced deploy: true
Latency p95 ms: 325

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

- pass: app-shell; /; HTTP 200; 63 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 290 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 289 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 213 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 213 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 217 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 220 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 218 ms; Live read-only check passed.
- pass: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP 200; 210 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 294 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 217 ms; Live read-only check passed.
- pass: product-gate-recovery-html; /product-gate-recovery.html; HTTP 200; 292 ms; Live read-only check passed.
- pass: product-gate-recovery-json; /product-gate-recovery.json; HTTP 200; 215 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 213 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 213 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 210 ms; Live read-only check passed.
- pass: store-readiness-html; /store-readiness.html; HTTP 200; 212 ms; Live read-only check passed.
- pass: store-readiness-json; /store-readiness.json; HTTP 200; 212 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 209 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 314 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 213 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 213 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 213 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 328 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 312 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 217 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 214 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 215 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 316 ms; Live read-only check passed.
- pass: monetization-html; /monetization.html; HTTP 200; 215 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 325 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 256 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
