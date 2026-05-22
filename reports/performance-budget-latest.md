# Performance Budget

Generated: 2026-05-22T19:25:00.133Z
Status: performance-budget-ready
Initial JS: 678.6 KB (184.1 KB gzip)
Initial CSS: 10.5 KB (2.8 KB gzip)
Deferred game chunk: GameCanvas-DOM1d9n7.js, 1361.4 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 678.6 KB; budget is 680 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 184.1 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 10.5 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-DOM1d9n7.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-DOM1d9n7.js at 1361.4 KB.
- pass: deferred-game-budget - Deferred game chunk is 1361.4 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
