export const androidRootAssetlinksHandoff = {
  "generatedAt": "2026-06-02T13:27:39.285Z",
  "status": "waiting-for-root-pages-repository",
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
