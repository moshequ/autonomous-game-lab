export const storeAssets = {
  "generatedAt": "2026-06-03T01:31:24.226Z",
  "status": "screenshots-ready",
  "basePath": "/autonomous-game-lab/",
  "sourceBuild": "dist",
  "screenshots": [
    {
      "id": "desktop-growth-page",
      "label": "Generated public game landing page",
      "route": "/games/market-pulse.html",
      "servedRoute": "/autonomous-game-lab/games/market-pulse.html",
      "path": "/store-assets/screenshots/desktop-growth-page.png",
      "distPath": "dist/store-assets/screenshots/desktop-growth-page.png",
      "width": 1440,
      "height": 900,
      "bytes": 59625,
      "platformUse": [
        "Web/PWA listing",
        "press kit"
      ]
    },
    {
      "id": "phone-lantern-relay-game",
      "label": "Lantern Relay playable board",
      "route": "/?game=lantern-relay&utm_source=store_screenshot&utm_campaign=lantern-relay",
      "servedRoute": "/autonomous-game-lab/?game=lantern-relay&utm_source=store_screenshot&utm_campaign=lantern-relay",
      "path": "/store-assets/screenshots/phone-lantern-relay-game.png",
      "distPath": "dist/store-assets/screenshots/phone-lantern-relay-game.png",
      "width": 1170,
      "height": 2532,
      "bytes": 197792,
      "platformUse": [
        "Google Play phone",
        "Apple iPhone draft"
      ]
    },
    {
      "id": "phone-market-pulse-generated",
      "label": "Market Pulse gameplay board",
      "route": "/?game=market-pulse&utm_source=store_screenshot&utm_campaign=market-pulse",
      "servedRoute": "/autonomous-game-lab/?game=market-pulse&utm_source=store_screenshot&utm_campaign=market-pulse",
      "path": "/store-assets/screenshots/phone-market-pulse-generated.png",
      "distPath": "dist/store-assets/screenshots/phone-market-pulse-generated.png",
      "width": 1170,
      "height": 2532,
      "bytes": 185860,
      "platformUse": [
        "Google Play phone",
        "Apple iPhone draft"
      ]
    },
    {
      "id": "phone-portal-home",
      "label": "Mobile portal home",
      "route": "/",
      "servedRoute": "/autonomous-game-lab/",
      "path": "/store-assets/screenshots/phone-portal-home.png",
      "distPath": "dist/store-assets/screenshots/phone-portal-home.png",
      "width": 1170,
      "height": 2532,
      "bytes": 212121,
      "platformUse": [
        "Google Play phone",
        "Apple iPhone draft"
      ]
    }
  ],
  "storePackageUpdated": true,
  "note": "Playwright launch blocked; reused existing screenshot artifacts from public/ and dist/."
} as const

export type StoreAssets = typeof storeAssets
