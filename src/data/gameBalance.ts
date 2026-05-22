export const gameBalance = {
  "games": {
    "harbor-rings": {
      "id": "harbor-rings",
      "title": "Harbor Rings",
      "boardSize": 5,
      "maxMoves": 12,
      "targetScore": 46,
      "pieces": [
        "teal",
        "coral",
        "amber",
        "violet"
      ],
      "tuning": {
        "minTargetScore": 40,
        "maxTargetScore": 90,
        "targetStep": 6
      }
    },
    "lantern-relay": {
      "id": "lantern-relay",
      "title": "Lantern Relay",
      "boardSize": 5,
      "maxMoves": 10,
      "targetScore": 86,
      "pieces": [
        "leaf",
        "thread",
        "spark",
        "bell"
      ],
      "tuning": {
        "minTargetScore": 54,
        "maxTargetScore": 120,
        "targetStep": 8
      }
    },
    "harbor-circuit": {
      "id": "harbor-circuit",
      "title": "Harbor Circuit",
      "boardRows": 3,
      "boardCols": 4,
      "maxMoves": 9,
      "targetScore": 81,
      "pieces": [
        "cargo",
        "signal",
        "ferry",
        "market"
      ],
      "tuning": {
        "minTargetScore": 52,
        "maxTargetScore": 110,
        "targetStep": 7
      }
    },
    "foundry-ledger": {
      "id": "foundry-ledger",
      "title": "Foundry Ledger",
      "boardRows": 4,
      "boardCols": 4,
      "maxMoves": 9,
      "targetScore": 112,
      "pieces": [
        "ore",
        "coin",
        "steam",
        "guild"
      ],
      "tuning": {
        "minTargetScore": 50,
        "maxTargetScore": 112,
        "targetStep": 7
      }
    },
    "orbit-atlas": {
      "id": "orbit-atlas",
      "title": "Orbit Atlas",
      "boardRows": 3,
      "boardCols": 4,
      "maxMoves": 10,
      "targetScore": 129,
      "pieces": [
        "scout",
        "camp",
        "map",
        "relic"
      ],
      "tuning": {
        "minTargetScore": 62,
        "maxTargetScore": 140,
        "targetStep": 8
      }
    },
    "metro-loom": {
      "id": "metro-loom",
      "title": "Metro Loom",
      "boardRows": 5,
      "boardCols": 5,
      "maxMoves": 11,
      "targetScore": 96,
      "pieces": [
        "station",
        "signal",
        "loop",
        "spur"
      ],
      "generated": true,
      "scoring": {
        "base": 2,
        "sameNeighbor": 3,
        "occupiedNeighbor": 5,
        "rowDiversity": 3,
        "columnDiversity": 7,
        "center": 2,
        "corner": 1
      },
      "tuning": {
        "minTargetScore": 60,
        "maxTargetScore": 144,
        "targetStep": 6
      }
    },
    "pocket-draft": {
      "id": "pocket-draft",
      "title": "Pocket Draft",
      "boardRows": 3,
      "boardCols": 5,
      "maxMoves": 12,
      "targetScore": 130,
      "pieces": [
        "sprout",
        "ember",
        "sun",
        "violet"
      ],
      "generated": true,
      "scoring": {
        "base": 4,
        "sameNeighbor": 6,
        "occupiedNeighbor": 1,
        "rowDiversity": 7,
        "columnDiversity": 3,
        "center": 2,
        "corner": 2
      },
      "tuning": {
        "minTargetScore": 94,
        "maxTargetScore": 178,
        "targetStep": 6
      }
    },
    "guild-garden": {
      "id": "guild-garden",
      "title": "Guild Garden",
      "boardRows": 4,
      "boardCols": 4,
      "maxMoves": 10,
      "targetScore": 138,
      "pieces": [
        "scout",
        "camp",
        "path",
        "cache"
      ],
      "generated": true,
      "scoring": {
        "base": 4,
        "sameNeighbor": 5,
        "occupiedNeighbor": 3,
        "rowDiversity": 5,
        "columnDiversity": 5,
        "center": 4,
        "corner": 3
      },
      "tuning": {
        "minTargetScore": 102,
        "maxTargetScore": 186,
        "targetStep": 6
      }
    },
    "market-pulse": {
      "id": "market-pulse",
      "title": "Market Pulse",
      "boardRows": 4,
      "boardCols": 4,
      "maxMoves": 11,
      "targetScore": 144,
      "pieces": [
        "sprout",
        "ember",
        "sun",
        "violet"
      ],
      "generated": true,
      "scoring": {
        "base": 4,
        "sameNeighbor": 5,
        "occupiedNeighbor": 3,
        "rowDiversity": 5,
        "columnDiversity": 5,
        "center": 4,
        "corner": 3
      },
      "tuning": {
        "minTargetScore": 108,
        "maxTargetScore": 192,
        "targetStep": 6
      }
    },
    "canopy-bloom": {
      "id": "canopy-bloom",
      "title": "Canopy Bloom",
      "boardRows": 4,
      "boardCols": 5,
      "maxMoves": 12,
      "targetScore": 104,
      "pieces": [
        "stall",
        "permit",
        "clock",
        "cart"
      ],
      "generated": true,
      "scoring": {
        "base": 3,
        "sameNeighbor": 4,
        "occupiedNeighbor": 2,
        "rowDiversity": 6,
        "columnDiversity": 4,
        "center": 3,
        "corner": 2
      },
      "tuning": {
        "minTargetScore": 62,
        "maxTargetScore": 146,
        "targetStep": 6
      }
    }
  }
} as const

export type GameBalanceConfig = typeof gameBalance
export type GameBalanceId = keyof typeof gameBalance.games
