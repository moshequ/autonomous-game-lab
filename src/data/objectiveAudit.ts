export const objectiveAudit = {
  "generatedAt": "2026-05-20T20:16:05.934Z",
  "status": "objective-in-progress",
  "objective": "Build a bootstrapped autonomous web/PWA game portal that can generate original board-game-inspired games, measure user behavior, propose and apply data-driven improvements, and prepare a path to monetization and app-store distribution with minimal manual intervention.",
  "summary": {
    "requirements": 8,
    "met": 6,
    "prepared": 2,
    "incomplete": 0,
    "externalBlockers": 12,
    "productBlockers": 6
  },
  "requirements": [
    {
      "id": "web-pwa-game-portal",
      "status": "met",
      "summary": "A playable web/PWA portal exists and passes the production web readiness gate.",
      "evidence": [
        "Web readiness: ready-after-build",
        "Manifest in dist: true",
        "Service worker in dist: true",
        "Release candidate: release-candidate-ready; 44 files",
        "Deployment plan: ready-for-pages"
      ],
      "blockers": [],
      "nextAction": "Connect a free static host or GitHub Pages environment, then publish dist.",
      "completionCritical": true
    },
    {
      "id": "original-trend-driven-game-generation",
      "status": "met",
      "summary": "Trend signals produce original, low-IP-risk concepts and generated playable games.",
      "evidence": [
        "Trend source: fixture-safe",
        "Candidate concepts: 4",
        "Low-risk concepts: 4",
        "Playable games: 10",
        "Generated games: 5"
      ],
      "blockers": [],
      "nextAction": "Keep licensed/cache/fixture trend inputs feeding original concept generation.",
      "completionCritical": true
    },
    {
      "id": "behavior-measurement-loop",
      "status": "met-fixture-or-local",
      "summary": "Gameplay, retention, install, acquisition, and privacy telemetry can be measured and rolled up.",
      "evidence": [
        "Analytics source: fixture-sample",
        "Collector smoke: pass",
        "Local event bridge: bridge-waiting-for-export; inbox events 0; imported events 0",
        "Ingest smoke: pass",
        "Game starts in rollup: 375",
        "D1 retention: 0.167"
      ],
      "blockers": [
        "Production analytics still need PostHog or first-party collector credentials for live player data; local browser event drops are bridged meanwhile."
      ],
      "nextAction": "Connect the first-party collector or PostHog when production credentials exist.",
      "completionCritical": true
    },
    {
      "id": "data-driven-improvement-loop",
      "status": "met",
      "summary": "Analytics drive product-gate optimization, experiment evaluation, backlog routing, and one safe local operator action.",
      "evidence": [
        "Product optimizer: product-optimization-ready",
        "Gate recovery: product-gate-recovery-ready; primary firstGameCompletion; experiment collecting-sample; needed lift 58",
        "Sample plan: product-gate-sample-plan-ready; primary firstGameCompletion; prompt views needed 70",
        "First-move coach: first-move-coach-ready; enabled targets 6",
        "Completion loop: completion-loop-ready; prompt armed; finish line armed",
        "Replay loop: replay-loop-ready; prompt armed",
        "Retention loop: retention-loop-ready; return intent armed",
        "Organic seed loop: organic-seed-loop-ready; target canopy-bloom",
        "Experiment results: evaluated",
        "Backlog: improvement-backlog-ready; items 4; hash a738f73a0160",
        "Support feedback: support-feedback-empty; issues 0; routable signals 0",
        "Applied/deferred actions: 7",
        "Operator selected: seed-portfolio-traffic; status operator-plan-ready; execution not-requested"
      ],
      "blockers": [],
      "nextAction": "Keep collecting starts until a safe product-gate tuning action is justified.",
      "completionCritical": true
    },
    {
      "id": "minimal-intervention-autonomy",
      "status": "met-local",
      "summary": "A scheduled local loop, owner state, bootstrap handoff, and dry-run operator reduce manual maintenance.",
      "evidence": [
        "Owner loop: owner-loop-ready",
        "Autonomous cadence: cadence-ready; Codex active-confirmed; GitHub scheduled",
        "Autonomous self-update: self-update-ready; workflow .github/workflows/autonomous-self-update.yml; unsafe pending 0",
        "Operator: operator-plan-ready",
        "Operator history: operator-history-ready; records 40; executed 16",
        "Bootstrap: production-bootstrap-ready",
        "Repository bootstrap: repository-bootstrap-ready; helper ops/github/bootstrap-repository.sh",
        "Release candidate: release-candidate-ready; smoke URLs 14",
        "Post-deploy smoke: post-deploy-smoke-observed-live; origin https://moshequ.github.io/autonomous-game-lab; checks 15/15; local artifact predeploy-artifact-smoke-passed 15/15",
        "Strict deploy artifact sync: post-deploy-artifact-sync-passed; run 26187217790; live matches artifact true; candidate pwa-a8c9102f46bf",
        "Repository channel: repository-channel-ready; repository moshequ/autonomous-game-lab; git worktree true",
        "Autonomy score: 98%",
        "Credential-gated actions: 10"
      ],
      "blockers": [
        "AGL_SUPPORT_EMAIL: Production support contact for privacy and store listings.",
        "VITE_POSTHOG_KEY: Optional browser-side PostHog analytics forwarding.",
        "POSTHOG_PROJECT_ID + POSTHOG_PERSONAL_API_KEY: Optional autonomous production analytics and experiment result rollups from PostHog.",
        "VITE_EVENT_COLLECTOR_URL + AGL_EVENT_COLLECTOR_EXPORT_URL: Optional zero-cost Worker/R2 event collector for browser analytics and autonomous rollups.",
        "VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID: Web/PWA rewarded or display-ad test configuration after product and privacy gates pass.",
        "ADMOB_PUBLISHER_ID: Native app seller line for app-ads.txt and Android rewarded tests after app-store gates pass.",
        "AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED: Allows native packaging gates to treat Play Console access as connected.",
        "CLOUDFLARE_API_TOKEN: Repository secret sourced from CLOUDFLARE_API_TOKEN.",
        "POSTHOG_PERSONAL_API_KEY: Repository secret sourced from POSTHOG_PERSONAL_API_KEY.",
        "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: Repository secret sourced from GOOGLE_PLAY_SERVICE_ACCOUNT_JSON."
      ],
      "nextAction": "Keep the operator dry-run plan ready and execute one local action only when explicitly requested.",
      "completionCritical": true
    },
    {
      "id": "monetization-path",
      "status": "prepared-blocked-by-gates",
      "summary": "Revenue path exists with guarded rewarded/cosmetic tests, app-ads output, and unit-economics spend controls.",
      "evidence": [
        "Monetization status: blocked-by-product-gates",
        "Revenue enabled: false",
        "Runtime: guarded-disabled",
        "Unit economics: no-spend",
        "Paid acquisition allowed: false"
      ],
      "blockers": [
        "First-game completion is 40%; gate is 55%.",
        "Replay rate is 31%; gate is 35%.",
        "D1 retention is 17%; gate is 18%; source is fixture-retention.",
        "Web/PWA or native ad provider is not configured for gated revenue tests."
      ],
      "nextAction": "Collect live completion, replay, and retention data until gates pass.",
      "completionCritical": true
    },
    {
      "id": "app-store-distribution-path",
      "status": "prepared-external-blockers",
      "summary": "Store listing, compliance drafts, screenshots, and Android TWA handoff are prepared while store release stays gated.",
      "evidence": [
        "Store package privacy URL: hosted",
        "Support channel: support-channel-ready; provider github-issues; store email still required true",
        "Store assets: screenshots-ready",
        "Store compliance: draft-ready-external-blockers",
        "Android signing: signing-prepared; fingerprint available",
        "Native package: blocked-draft-ready",
        "Android release: blocked-needs-host-signing-play"
      ],
      "blockers": [
        "support-contact: Production support email is required before public store submission.",
        "google-play-account: Google Play developer account must be connected before Android submission.",
        "apple-developer-account: Apple Developer account remains deferred until iOS spend is justified.",
        "native-package-ready: Native package is blocked-draft-ready.",
        "store-package-draft: Store package is blocked; data safety is draft-ready.",
        "google-play-account: Google Play account is not connected.",
        "play-service-account: Google Play service account upload credentials are available to CI.",
        "unit-economics-store-spend: Store spend allowed is false; spend mode is no-spend.",
        "promotion-gate: Android promotion status is blocked.",
        "Revenue signal is $0.00, below $99.00.",
        "Apple Developer account is not connected."
      ],
      "nextAction": "Host privacy URL, create signing assets, and connect Google Play account.",
      "completionCritical": true
    },
    {
      "id": "minimal-cost-guardrails",
      "status": "met",
      "summary": "Zero-spend, no-store-submission, and no-revenue-before-gates controls are enforced.",
      "evidence": [
        "Max daily spend: $0.00",
        "Bootstrap zero spend: true",
        "Operator zero spend: true",
        "Owner guardrails: 4/4"
      ],
      "blockers": [],
      "nextAction": "Preserve zero-spend posture until observed revenue and payback gates open.",
      "completionCritical": true
    }
  ],
  "blockers": {
    "external": [
      "Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.",
      "Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.",
      "Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.",
      "Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.",
      "Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.",
      "Connect Apple Developer account only after revenue justifies iOS spend.",
      "support-contact: Production support email is required before public store submission.",
      "google-play-account: Google Play developer account must be connected before Android submission.",
      "apple-developer-account: Apple Developer account remains deferred until iOS spend is justified.",
      "google-play-account: Google Play account is not connected.",
      "play-service-account: Google Play service account upload credentials are available to CI.",
      "Collector environment is not configured."
    ],
    "product": [
      "Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.",
      "Connect Apple Developer account only after revenue justifies iOS spend.",
      "First-game completion is 40%; gate is 55%.",
      "Replay rate is 31%; gate is 35%.",
      "D1 retention is 17%; gate is 18%; source is fixture-retention.",
      "Web/PWA or native ad provider is not configured for gated revenue tests."
    ],
    "all": [
      "Set AGL_SUPPORT_EMAIL to a real support inbox before public store submission.",
      "Set VITE_EVENT_COLLECTOR_URL or VITE_POSTHOG_KEY to forward browser analytics in production.",
      "Set AGL_EVENT_COLLECTOR_EXPORT_URL + AGL_EVENT_COLLECTOR_ADMIN_TOKEN or PostHog server credentials for autonomous production rollups.",
      "Set VITE_ADSENSE_CLIENT_ID + VITE_ADSENSE_REWARDED_SLOT_ID for web/PWA revenue tests or ADMOB_PUBLISHER_ID for native app placements.",
      "Connect Google Play credentials or set AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED=true.",
      "Connect Apple Developer account only after revenue justifies iOS spend.",
      "First-game completion is 40%; gate is 55%.",
      "Replay rate is 31%; gate is 35%.",
      "D1 retention is 17%; gate is 18%; source is fixture-retention.",
      "Web/PWA or native ad provider is not configured for gated revenue tests.",
      "support-contact: Production support email is required before public store submission.",
      "google-play-account: Google Play developer account must be connected before Android submission.",
      "apple-developer-account: Apple Developer account remains deferred until iOS spend is justified.",
      "native-package-ready: Native package is blocked-draft-ready.",
      "store-package-draft: Store package is blocked; data safety is draft-ready.",
      "google-play-account: Google Play account is not connected.",
      "play-service-account: Google Play service account upload credentials are available to CI.",
      "unit-economics-store-spend: Store spend allowed is false; spend mode is no-spend.",
      "promotion-gate: Android promotion status is blocked.",
      "Collector environment is not configured."
    ]
  },
  "controls": {
    "preserveOriginalScope": true,
    "doNotMarkGoalCompleteWhileBlocked": true,
    "zeroSpendGuard": true,
    "noRevenueEnablementUntilGatesPass": true,
    "noStoreSubmissionUntilExternalAccounts": true,
    "currentWorktreeClean": false,
    "currentWorktreeDirtyFiles": 49,
    "productionBootstrapFresh": true,
    "productionBootstrapStaleInputIds": [],
    "objectiveNextBestActionSource": "owner-loop"
  },
  "completion": {
    "canMarkGoalComplete": false,
    "reason": "The local autonomous PWA system is largely prepared with strict live deploy evidence synced from GitHub Actions, but production credentials, live data, monetization gates, and store account/signing blockers remain.",
    "nextBestAction": "seed-portfolio-traffic"
  }
} as const

export type ObjectiveAudit = typeof objectiveAudit
