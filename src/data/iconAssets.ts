export const iconAssets = {
  "generatedAt": "2026-05-22T09:12:26.935Z",
  "status": "icons-ready",
  "sourceSvgPath": "public/icons/app-icon.svg",
  "manifestIcons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "storeIcons": [
    {
      "id": "store-1024",
      "fileName": "store-icon-1024.png",
      "size": 1024,
      "purpose": "store",
      "platformUse": [
        "Google Play icon draft",
        "Apple App Store icon draft"
      ],
      "path": "/icons/store-icon-1024.png",
      "sourcePath": "public/icons/store-icon-1024.png",
      "width": 1024,
      "height": 1024,
      "bytes": 431782,
      "type": "image/png"
    }
  ],
  "assets": [
    {
      "id": "pwa-192",
      "fileName": "icon-192.png",
      "size": 192,
      "purpose": "any",
      "platformUse": [
        "PWA install",
        "Android TWA"
      ],
      "path": "/icons/icon-192.png",
      "sourcePath": "public/icons/icon-192.png",
      "width": 192,
      "height": 192,
      "bytes": 23181,
      "type": "image/png"
    },
    {
      "id": "pwa-512",
      "fileName": "icon-512.png",
      "size": 512,
      "purpose": "any",
      "platformUse": [
        "PWA install",
        "Android TWA"
      ],
      "path": "/icons/icon-512.png",
      "sourcePath": "public/icons/icon-512.png",
      "width": 512,
      "height": 512,
      "bytes": 126750,
      "type": "image/png"
    },
    {
      "id": "maskable-192",
      "fileName": "maskable-192.png",
      "size": 192,
      "purpose": "maskable",
      "platformUse": [
        "Android launcher maskable"
      ],
      "path": "/icons/maskable-192.png",
      "sourcePath": "public/icons/maskable-192.png",
      "width": 192,
      "height": 192,
      "bytes": 23181,
      "type": "image/png"
    },
    {
      "id": "maskable-512",
      "fileName": "maskable-512.png",
      "size": 512,
      "purpose": "maskable",
      "platformUse": [
        "Android launcher maskable"
      ],
      "path": "/icons/maskable-512.png",
      "sourcePath": "public/icons/maskable-512.png",
      "width": 512,
      "height": 512,
      "bytes": 126750,
      "type": "image/png"
    },
    {
      "id": "apple-touch-180",
      "fileName": "apple-touch-icon.png",
      "size": 180,
      "purpose": "any",
      "platformUse": [
        "iOS home screen draft"
      ],
      "path": "/icons/apple-touch-icon.png",
      "sourcePath": "public/icons/apple-touch-icon.png",
      "width": 180,
      "height": 180,
      "bytes": 21108,
      "type": "image/png"
    },
    {
      "id": "store-1024",
      "fileName": "store-icon-1024.png",
      "size": 1024,
      "purpose": "store",
      "platformUse": [
        "Google Play icon draft",
        "Apple App Store icon draft"
      ],
      "path": "/icons/store-icon-1024.png",
      "sourcePath": "public/icons/store-icon-1024.png",
      "width": 1024,
      "height": 1024,
      "bytes": 431782,
      "type": "image/png"
    }
  ]
} as const

export type IconAssets = typeof iconAssets
