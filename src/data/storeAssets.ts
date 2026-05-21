export const storeAssets = {
  "generatedAt": "2026-05-21T00:56:05.831Z",
  "status": "screenshots-ready",
  "basePath": "/autonomous-game-lab/",
  "sourceBuild": "dist",
  "screenshots": [
    {
      "id": "phone-portal-home",
      "label": "Mobile portal home",
      "route": "/",
      "servedRoute": "/autonomous-game-lab/",
      "path": "/store-assets/screenshots/phone-portal-home.png",
      "distPath": "dist/store-assets/screenshots/phone-portal-home.png",
      "width": 1170,
      "height": 2532,
      "bytes": 269918,
      "platformUse": [
        "Google Play phone",
        "Apple iPhone draft"
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
      "bytes": 197665,
      "platformUse": [
        "Google Play phone",
        "Apple iPhone draft"
      ]
    },
    {
      "id": "phone-canopy-bloom-generated",
      "label": "Generated Canopy Bloom board",
      "route": "/?game=canopy-bloom&utm_source=store_screenshot&utm_campaign=canopy-bloom",
      "servedRoute": "/autonomous-game-lab/?game=canopy-bloom&utm_source=store_screenshot&utm_campaign=canopy-bloom",
      "path": "/store-assets/screenshots/phone-canopy-bloom-generated.png",
      "distPath": "dist/store-assets/screenshots/phone-canopy-bloom-generated.png",
      "width": 1170,
      "height": 2532,
      "bytes": 194824,
      "platformUse": [
        "Google Play phone",
        "Apple iPhone draft"
      ]
    },
    {
      "id": "desktop-growth-page",
      "label": "Generated public game landing page",
      "route": "/games/canopy-bloom.html",
      "servedRoute": "/autonomous-game-lab/games/canopy-bloom.html",
      "path": "/store-assets/screenshots/desktop-growth-page.png",
      "distPath": "dist/store-assets/screenshots/desktop-growth-page.png",
      "width": 1440,
      "height": 900,
      "bytes": 63651,
      "platformUse": [
        "Web/PWA listing",
        "press kit"
      ]
    }
  ],
  "storePackageUpdated": true
} as const

export type StoreAssets = typeof storeAssets
