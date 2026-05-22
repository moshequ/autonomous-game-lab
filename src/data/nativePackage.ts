export const nativePackage = {
  "generatedAt": "2026-05-22T02:17:35.901Z",
  "status": "blocked-draft-ready",
  "platform": "android-trusted-web-activity",
  "costGate": {
    "googlePlayOneTimeUsd": 25,
    "spendAllowed": false
  },
  "packageName": "app.autonomousgamelab.portal",
  "host": "moshequ.github.io",
  "publicOrigin": "https://moshequ.github.io/autonomous-game-lab",
  "origin": "https://moshequ.github.io",
  "basePath": "/autonomous-game-lab/",
  "manifestUrl": "https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest",
  "startUrl": "/autonomous-game-lab/",
  "launcherName": "Game Lab",
  "handoff": {
    "directory": "native/android",
    "twaManifestPath": "native/android/twa-manifest.json",
    "bubblewrapConfigPath": "native/android/bubblewrap.config.json",
    "assetLinksTemplatePath": "native/android/assetlinks.template.json",
    "publicAssetLinksPath": "public/.well-known/assetlinks.json"
  },
  "signing": {
    "status": "fingerprint-configured",
    "sourceStatus": "signing-prepared",
    "keyAlias": "autonomous-game-lab",
    "sha256CertFingerprint": "FC:92:04:44:5B:93:78:92:A9:8C:08:50:BF:97:7A:90:A5:62:61:81:53:E7:A9:AA:A9:39:86:74:AE:D3:52:C2",
    "localSecretsConfigured": true
  },
  "assetLinks": {
    "status": "domain-verification-blocked",
    "template": [
      {
        "relation": [
          "delegate_permission/common.handle_all_urls"
        ],
        "target": {
          "namespace": "android_app",
          "package_name": "app.autonomousgamelab.portal",
          "sha256_cert_fingerprints": [
            "FC:92:04:44:5B:93:78:92:A9:8C:08:50:BF:97:7A:90:A5:62:61:81:53:E7:A9:AA:A9:39:86:74:AE:D3:52:C2"
          ]
        }
      }
    ],
    "publicGenerated": true,
    "domainVerificationReady": false,
    "rootAssetLinksDeployable": false,
    "requiresRootWellKnownPath": true,
    "requiredRootUrl": "https://moshequ.github.io/.well-known/assetlinks.json",
    "publishedUrl": "https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json",
    "projectPagesBasePath": "/autonomous-game-lab/",
    "hostReady": true,
    "hostedPath": "/.well-known/assetlinks.json"
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
      "status": "pass",
      "detail": "Host is moshequ.github.io; base path is /autonomous-game-lab/."
    },
    {
      "id": "assetlinks-domain-verification",
      "status": "blocker",
      "detail": "Digital Asset Links must be reachable at https://moshequ.github.io/.well-known/assetlinks.json; current artifact publishes https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json."
    },
    {
      "id": "hosted-privacy",
      "status": "pass",
      "detail": "Privacy URL status is hosted."
    },
    {
      "id": "android-signing-fingerprint",
      "status": "pass",
      "detail": "SHA-256 certificate fingerprint is configured."
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
      "status": "external-blocker",
      "detail": "Google Play developer account is not connected; local TWA handoff can still be prepared."
    }
  ],
  "blockers": [
    "Android Digital Asset Links must be hosted at https://moshequ.github.io/.well-known/assetlinks.json; current project Pages path publishes https://moshequ.github.io/autonomous-game-lab/.well-known/assetlinks.json."
  ],
  "commands": {
    "init": "npx @bubblewrap/cli init --manifest https://moshequ.github.io/autonomous-game-lab/manifest.webmanifest",
    "validate": "npx @bubblewrap/cli validate",
    "build": "npx @bubblewrap/cli build"
  }
} as const

export type NativePackage = typeof nativePackage
