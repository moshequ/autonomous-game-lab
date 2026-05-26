# Live Site Monitor

Generated: 2026-05-26T16:12:23.377Z
Status: live-site-monitor-passed
Origin: https://moshequ.github.io/autonomous-game-lab
Checks: 34/34 passed (0 failed, 0 blocked)
Live candidate: pwa-206b48eed9e6
Synced candidate: pwa-206b48eed9e6
Live matches synced deploy: true
Latency p95 ms: 1153

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

- pass: app-shell; /; HTTP 200; 187 ms; Live read-only check passed.
- pass: manifest-webmanifest; /manifest.webmanifest; HTTP 200; 856 ms; Live read-only check passed.
- pass: sw-js; /sw.js; HTTP 200; 825 ms; Live read-only check passed.
- pass: privacy-html; /privacy.html; HTTP 200; 796 ms; Live read-only check passed.
- pass: support-html; /support.html; HTTP 200; 1043 ms; Live read-only check passed.
- pass: measurement-status-html; /measurement-status.html; HTTP 200; 879 ms; Live read-only check passed.
- pass: measurement-status-json; /measurement-status.json; HTTP 200; 962 ms; Live read-only check passed.
- pass: owner-unlock-html; /owner-unlock.html; HTTP 200; 938 ms; Live read-only check passed.
- pass: owner-unlock-brief-json; /owner-unlock-brief.json; HTTP 200; 861 ms; Live read-only check passed.
- pass: owner-unlock-preflight-json; /owner-unlock-preflight.json; HTTP 200; 988 ms; Live read-only check passed.
- pass: owner-runtime-config-json; /owner-runtime-config.json; HTTP 200; 855 ms; Live read-only check passed.
- pass: analytics-unlock-html; /analytics-unlock.html; HTTP 200; 839 ms; Live read-only check passed.
- pass: analytics-unlock-json; /analytics-unlock.json; HTTP 200; 892 ms; Live read-only check passed.
- pass: product-gate-recovery-html; /product-gate-recovery.html; HTTP 200; 876 ms; Live read-only check passed.
- pass: product-gate-recovery-json; /product-gate-recovery.json; HTTP 200; 989 ms; Live read-only check passed.
- pass: install-html; /install.html; HTTP 200; 824 ms; Live read-only check passed.
- pass: compliance-json; /compliance.json; HTTP 200; 850 ms; Live read-only check passed.
- pass: monetization-json; /monetization.json; HTTP 200; 841 ms; Live read-only check passed.
- pass: store-readiness-html; /store-readiness.html; HTTP 200; 1133 ms; Live read-only check passed.
- pass: store-readiness-json; /store-readiness.json; HTTP 200; 1025 ms; Live read-only check passed.
- pass: app-ads-txt; /app-ads.txt; HTTP 200; 1013 ms; Live read-only check passed.
- pass: well-known-assetlinks-json; /.well-known/assetlinks.json; HTTP 200; 1010 ms; Live read-only check passed.
- pass: gate-sample-html; /gate-sample.html; HTTP 200; 1056 ms; Live read-only check passed.
- pass: sample-next-html; /sample-next.html; HTTP 200; 1116 ms; Live read-only check passed.
- pass: sample-next-json; /sample-next.json; HTTP 200; 1026 ms; Live read-only check passed.
- pass: sample-fastest-html; /sample-fastest.html; HTTP 200; 1015 ms; Live read-only check passed.
- pass: sample-fastest-json; /sample-fastest.json; HTTP 200; 1114 ms; Live read-only check passed.
- pass: seed-kit-html; /seed-kit.html; HTTP 200; 1161 ms; Live read-only check passed.
- pass: seed-next-html; /seed-next.html; HTTP 200; 1144 ms; Live read-only check passed.
- pass: seed-next-json; /seed-next.json; HTTP 200; 1114 ms; Live read-only check passed.
- pass: sitemap-xml; /sitemap.xml; HTTP 200; 1153 ms; Live read-only check passed.
- pass: monetization-html; /monetization.html; HTTP 200; 1152 ms; Live read-only check passed.
- pass: games-canopy-bloom-html; /games/canopy-bloom.html; HTTP 200; 1113 ms; Live read-only check passed.
- pass: release-candidate-manifest-live; /release-candidate.json; HTTP 200; 980 ms; Live read-only check passed.

## Next Actions

- Keep monitoring the public PWA between deploys with read-only live checks.
- Keep revenue, paid spend, and store submission disabled until product and account gates clear.
