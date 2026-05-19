export const nativePackage = {
  "generatedAt": "2026-05-18T23:36:59.702Z",
  "status": "blocked-draft-ready",
  "platform": "android-trusted-web-activity",
  "costGate": {
    "googlePlayOneTimeUsd": 25,
    "spendAllowed": false
  },
  "packageName": "app.autonomousgamelab.portal",
  "host": "autonomous-game-lab.example.com",
  "publicOrigin": null,
  "startUrl": "/",
  "launcherName": "Game Lab",
  "handoff": {
    "directory": "native/android",
    "twaManifestPath": "native/android/twa-manifest.json",
    "bubblewrapConfigPath": "native/android/bubblewrap.config.json",
    "assetLinksTemplatePath": "native/android/assetlinks.template.json",
    "publicAssetLinksPath": null
  },
  "assetLinks": {
    "status": "template-only",
    "template": [
      {
        "relation": [
          "delegate_permission/common.handle_all_urls"
        ],
        "target": {
          "namespace": "android_app",
          "package_name": "app.autonomousgamelab.portal",
          "sha256_cert_fingerprints": [
            "<SHA256_CERT_FINGERPRINT>"
          ]
        }
      }
    ],
    "publicGenerated": false
  },
  "icons": {
    "status": "icons-ready",
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
    ]
  },
  "checks": [
    {
      "id": "production-host",
      "status": "blocker",
      "detail": "Production host is not configured."
    },
    {
      "id": "hosted-privacy",
      "status": "blocker",
      "detail": "Privacy URL status is needs-hosted-domain."
    },
    {
      "id": "android-signing-fingerprint",
      "status": "blocker",
      "detail": "Signing fingerprint is missing."
    },
    {
      "id": "store-screenshots",
      "status": "pass",
      "detail": "4 screenshot asset(s) available."
    },
    {
      "id": "icon-assets",
      "status": "pass",
      "detail": "6 icon asset(s) available."
    },
    {
      "id": "google-play-account",
      "status": "blocker",
      "detail": "Google Play developer account is not connected."
    }
  ],
  "blockers": [
    "Production host is missing or still uses example.com.",
    "Hosted privacy policy URL is missing.",
    "Android signing certificate SHA-256 fingerprint is missing.",
    "Google Play developer account is not connected."
  ],
  "commands": {
    "init": "npx @bubblewrap/cli init --manifest https://YOUR_HOST/manifest.webmanifest",
    "validate": "npx @bubblewrap/cli validate",
    "build": "npx @bubblewrap/cli build"
  }
} as const

export type NativePackage = typeof nativePackage
