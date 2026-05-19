# Performance Budget

Generated: 2026-05-19T10:05:01.734Z
Status: performance-budget-ready
Initial JS: 653.7 KB (173.9 KB gzip)
Initial CSS: 9.6 KB (2.6 KB gzip)
Deferred game chunk: GameCanvas-DqGtXjRL.js, 1360.8 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 653.7 KB; budget is 675 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 173.9 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 9.6 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-DqGtXjRL.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-DqGtXjRL.js at 1360.8 KB.
- pass: deferred-game-budget - Deferred game chunk is 1360.8 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
