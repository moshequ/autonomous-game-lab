# Live Site Monitor

Generated: 2026-05-26T22:34:02.493Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 34/34 passed (0 failed, 0 blocked)
Live candidate: pwa-73c459570488
Synced candidate: pwa-73c459570488
Live matches synced deploy: true
Latency p95 ms: 293

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

- pass: app-shell; /; HTTP 200; 32 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 67 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 168 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 59 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 177 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 75 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 293 ms; Live read-only check passed.
- pass: owner-unlock-html; /owner-unlock.html; HTTP 200; 195 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 186 ms; Live read-only check passed.
- pass: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP 200; 157 ms; Live read-only check passed.
- pass: owner-runtime-config-json; /owner-runtime-config.json; HTTP 200; 268 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 148 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 282 ms; Live read-only check passed.
- pass: product-gate-recovery-html; /product-gate-recovery.html; HTTP 200; 282 ms; Live read-only check passed.
- pass: product-gate-recovery-json; /product-gate-recovery.json; HTTP 200; 53 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 53 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 265 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 171 ms; Live read-only check passed.
- pass: store-readiness-html; /store-readiness.html; HTTP 200; 139 ms; Live read-only check passed.
- pass: store-readiness-json; /store-readiness.json; HTTP 200; 155 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 56 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 255 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 57 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 59 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 146 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 143 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 168 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 171 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 261 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 161 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 40 ms; Live read-only check passed.
- pass: monetization-html; /monetization.html; HTTP 200; 160 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 51 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 293 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
