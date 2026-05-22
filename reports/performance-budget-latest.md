# Performance Budget

Generated: 2026-05-22T04:14:14.864Z
Status: performance-budget-ready
Initial JS: 670.6 KB (182.3 KB gzip)
Initial CSS: 10.5 KB (2.8 KB gzip)
Deferred game chunk: GameCanvas-KgQTw3bn.js, 1361.4 KB
Largest JS chunk deferred: yes

## Checks

- pass: initial-js-budget - Initial JS is 670.6 KB; budget is 676 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 182.3 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 10.5 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-KgQTw3bn.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is GameCanvas-KgQTw3bn.js at 1361.4 KB.
- pass: deferred-game-budget - Deferred game chunk is 1361.4 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Accept the large game-engine chunk only while it remains deferred from first paint.
