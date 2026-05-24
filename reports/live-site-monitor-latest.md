# Live Site Monitor

Generated: 2026-05-24T11:20:37.349Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 26/26 passed (0 failed, 0 blocked)
Live candidate: pwa-cdc0f7dc3ca1
Synced candidate: pwa-cdc0f7dc3ca1
Live matches synced deploy: true
Latency p95 ms: 103

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

- pass: app-shell; /; HTTP 200; 31 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 84 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 87 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 89 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 84 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 103 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 102 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 95 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 92 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 98 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 79 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 94 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 91 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 77 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 76 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 93 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 91 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 86 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 89 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 83 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 88 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 87 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 82 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 81 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 85 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 104 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
