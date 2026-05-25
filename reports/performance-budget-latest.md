# Performance Budget

Generated: 2026-05-25T19:38:25.297Z
Status: performance-budget-ready
Initial JS: 689.3 KB (186 KB gzip)
Initial CSS: 10.5 KB (2.8 KB gzip)
Deferred game chunk: GameCanvas-B9Fg2GmF.js, 3.3 KB
Largest JS chunk deferred: yes

## Checks

- monitor: initial-js-target - Initial JS is 689.3 KB; target is 686 KB.
- pass: initial-js-budget - Initial JS is 689.3 KB; deploy cap is 700 KB.
- pass: initial-js-gzip-budget - Initial JS gzip is 186 KB; budget is 200 KB.
- pass: initial-css-budget - Initial CSS is 10.5 KB; budget is 40 KB.
- pass: manifest - PWA manifest exists in dist.
- pass: service-worker - Service worker exists in dist.
- pass: game-runtime-deferred - GameCanvas-B9Fg2GmF.js is deferred from the initial shell.
- pass: largest-js-deferred - Largest JS chunk is phaser.esm-Bs14CRsP.js at 1321.4 KB.
- pass: deferred-game-budget - Deferred game chunk is 3.3 KB; monitor budget is 1600 KB.

## Next Actions

- Keep Phaser and game scenes outside the initial PWA shell.
- Continue monitoring initial shell gzip size after every generated-data change.
- Keep configured production analytics builds below the 700 KB hard cap and look for the next dashboard split.
- Accept the large game-engine chunk only while it remains deferred from first paint.
