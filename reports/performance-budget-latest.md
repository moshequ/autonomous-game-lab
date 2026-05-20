# Performance Budget

Generated: 2026-05-20T22:24:13.347Z
Status: performance-budget-ready
Initial JS: 649 KB (177.8 KB gzip)
Initial CSS: 10.4 KB (2.8 KB gzip)
Deferred game chunk: GameCanvas-D-Wp-e3m.js, 1360.9 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 649 KB; budget is 675 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 177.8 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 10.4 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-D-Wp-e3m.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-D-Wp-e3m.js at 1360.9 KB.
- pass: deferred-game-budget - Deferred game chunk is 1360.9 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
