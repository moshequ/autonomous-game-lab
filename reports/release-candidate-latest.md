# Release Candidate

Generated: 2026-05-19T04:54:53.111Z
Status: release-candidate-ready
Candidate: pwa-62da2581820d
Files: 38
Size: 3550 KB
Aggregate SHA-256: 62da2581820de334e71c4d14d30effe621530899c74622c000dbeff16f655c29

## Checks

- pass: dist-inventory - 38 dist files inventoried.
- pass: required-files - 13/13 required files present.
- pass: game-pages - 10 generated game page(s) in dist.
- pass: performance-budget - Performance budget is performance-budget-ready.
- pass: release-health - Release health is monitoring.
- pass: production-response - Deploy allowed is true.
- pass: spend-guard - Spend mode is no-spend.
- pass: post-deploy-smoke-plan - 7 post-deploy smoke URL(s) planned.

## Required Files

- pass: index.html
- pass: manifest.webmanifest
- pass: sw.js
- pass: privacy.html
- pass: support.html
- pass: sitemap.xml
- pass: robots.txt
- pass: share-manifest.json
- pass: monetization.json
- pass: app-ads.txt
- pass: icons/icon-192.png
- pass: icons/icon-512.png
- pass: icons/apple-touch-icon.png

## Post-Deploy Smoke

- 200: ${DEPLOYED_PWA_ORIGIN}/
- 200: ${DEPLOYED_PWA_ORIGIN}/manifest.webmanifest
- 200: ${DEPLOYED_PWA_ORIGIN}/sw.js
- 200: ${DEPLOYED_PWA_ORIGIN}/privacy.html
- 200: ${DEPLOYED_PWA_ORIGIN}/support.html
- 200: ${DEPLOYED_PWA_ORIGIN}/sitemap.xml
- 200: ${DEPLOYED_PWA_ORIGIN}/games/canopy-bloom.html

## Controls

- Zero paid spend: true
- No workflow execution: true
- No store submission: true
- Content hashes recorded: true
