export const androidRootAssetlinksHandoff = {
  "generatedAt": "2026-05-22T10:42:03.430Z",
  "status": "root-assetlinks-handoff-ready",
  "target": {
    "repository": "moshequ/moshequ.github.io"
  },
  "handoff": {
    "syncScriptPath": "ops/github/sync-root-assetlinks.sh"
  },
  "controls": {
    "dryRunByDefault": true
  }
} as const

export type AndroidRootAssetlinksHandoff = typeof androidRootAssetlinksHandoff
