# Release Candidate

Generated: 2026-05-20T05:55:33.842Z
Status: release-candidate-ready
Candidate: pwa-81ab8ec83a19
Files: 43
Size: 3554.5 KB
Aggregate SHA-256: 81ab8ec83a19f8571a26b2bf7586db2c6cae1907f6f2f8f0ae7221af753d7b09

## Checks

- pass: dist-inventory - 43 dist files inventoried.
- pass: required-files - 18/18 required files present.
- pass: game-pages - 10 generated game page(s) in dist.
- pass: performance-budget - Performance budget is performance-budget-ready.
- pass: release-health - Release health is monitoring.
- pass: production-response - Deploy allowed is true.
- pass: spend-guard - Spend mode is no-spend.
- pass: post-deploy-smoke-plan - 14 post-deploy smoke URL(s) planned.

## Required Files

- pass: index.html
- pass: manifest.webmanifest
- pass: sw.js
- pass: privacy.html
- pass: support.html
- pass: install.html
- pass: compliance.json
- pass: sitemap.xml
- pass: robots.txt
- pass: gate-sample.html
- pass: seed-kit.html
- pass: share-manifest.json
- pass: monetization.json
- pass: app-ads.txt
- pass: .well-known/assetlinks.json
- pass: icons/icon-192.png
- pass: icons/icon-512.png
- pass: icons/apple-touch-icon.png

## Post-Deploy Smoke

- 200: ${DEPLOYED_PWA_ORIGIN}/
- 200: ${DEPLOYED_PWA_ORIGIN}/manifest.webmanifest
- 200: ${DEPLOYED_PWA_ORIGIN}/sw.js
- 200: ${DEPLOYED_PWA_ORIGIN}/privacy.html
- 200: ${DEPLOYED_PWA_ORIGIN}/support.html
- 200: ${DEPLOYED_PWA_ORIGIN}/install.html
- 200: ${DEPLOYED_PWA_ORIGIN}/compliance.json
- 200: ${DEPLOYED_PWA_ORIGIN}/monetization.json
- 200: ${DEPLOYED_PWA_ORIGIN}/app-ads.txt
- 200: ${DEPLOYED_PWA_ORIGIN}/.well-known/assetlinks.json
- 200: ${DEPLOYED_PWA_ORIGIN}/gate-sample.html
- 200: ${DEPLOYED_PWA_ORIGIN}/seed-kit.html
- 200: ${DEPLOYED_PWA_ORIGIN}/sitemap.xml
- 200: ${DEPLOYED_PWA_ORIGIN}/games/canopy-bloom.html

## Controls

- Zero paid spend: true
- No workflow execution: true
- No store submission: true
- Content hashes recorded: true
