export const androidRootAssetlinksHandoff = {
  "generatedAt": "2026-05-22T11:01:16.498Z",
  "status": "root-assetlinks-live",
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
