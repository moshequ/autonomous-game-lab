import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const pipelinePath = path.join(root, 'data', 'prototype-pipeline.json')
const gatesPath = path.join(root, 'data', 'production-gates.json')
const analyticsPath = path.join(root, 'data', 'analytics-rollup.json')
const environmentPath = path.join(root, 'data', 'production-environment.json')
const supportChannelPath = path.join(root, 'data', 'support-channel.json')
const outputJsonPath = path.join(root, 'data', 'store-package.json')
const outputReportPath = path.join(root, 'reports', 'store-package-latest.md')
const privacyPath = path.join(root, 'public', 'privacy.html')
const supportPath = path.join(root, 'public', 'support.html')
const complianceManifestPath = path.join(root, 'public', 'compliance.json')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const pipeline = await readJson(pipelinePath)
const gates = await readJson(gatesPath)
const analytics = await readJson(analyticsPath)
const environment = await readOptionalJson(environmentPath, {
  publicOrigin: { origin: null, host: null, privacyUrl: null, supportUrl: null },
  support: { email: null, status: 'missing-production-address' },
  analytics: { browserPosthogConfigured: false },
  android: { packageName: 'app.autonomousgamelab.portal' },
})
const supportChannel = await readOptionalJson(supportChannelPath, {
  status: 'support-channel-missing-target',
  provider: 'github-issues',
  repository: { target: null, url: null, publicIssuesReady: false },
  links: {
    supportUrl: null,
    gameplayFeedbackUrl: null,
    bugReportUrl: null,
    analyticsEvidenceUrl: null,
  },
  privacy: {
    publicIssueWarning:
      'GitHub Issues are public; do not paste private information or raw analytics exports into public issue bodies.',
  },
  controls: {
    zeroPaidSpend: true,
    playerInitiatedOnly: true,
    supportEmailStillRequiredForStoreSubmission: true,
  },
})
const externalAnalyticsConfigured =
  analytics.sourceStatus.activeSource === 'posthog' ||
  environment.analytics?.browserPosthogConfigured === true ||
  environment.analytics?.eventCollector?.browserConfigured === true

const playablePrototypes = (pipeline.prototypes ?? []).filter((prototype) => prototype.status === 'playable')
const launchCandidate = playablePrototypes[0] ?? pipeline.prototypes?.[0]
const shortDate = new Date().toISOString().slice(0, 10)
const generatedAt = new Date().toISOString()

const sourceReferences = {
  googlePlayConsoleSignup: 'https://support.google.com/googleplay/android-developer/answer/6112435',
  googlePlayDataSafety: 'https://support.google.com/googleplay/android-developer/answer/10787469',
  appleDeveloperProgram: 'https://developer.apple.com/programs/',
  applePrivacyLabels: 'https://developer.apple.com/app-store/app-privacy-details/',
}
const sourceDataHash = hashSourceData({
  pipeline,
  gates,
  analytics,
  environment,
  supportChannel,
})

const privacyPolicy = {
  path: '/privacy.html',
  productionUrl: environment.publicOrigin?.privacyUrl ?? null,
  productionUrlStatus: environment.publicOrigin?.privacyUrl ? 'hosted' : 'needs-hosted-domain',
  updatedAt: shortDate,
  summary:
    'Autonomous Game Lab collects anonymous gameplay events to improve game balance, onboarding, and replay quality. Accounts, paid purchases, and advertising are disabled until production gates pass.',
  dataCollected: [
    {
      category: 'Gameplay analytics',
      examples: ['game_viewed', 'game_started', 'tutorial_completed', 'turn_taken', 'level_completed'],
      purpose: 'Measure friction, balance, completion, and replay behavior.',
      linkedToIdentity: false,
      sharedWithThirdParties: externalAnalyticsConfigured,
    },
    {
      category: 'Experiment assignment',
      examples: ['onboarding variant', 'reward copy variant'],
      purpose: 'Compare low-risk product improvements.',
      linkedToIdentity: false,
      sharedWithThirdParties: externalAnalyticsConfigured,
    },
  ],
  dataNotCollectedYet: ['contact information', 'precise location', 'contacts', 'photos', 'payment data'],
  userControls: [
    'External analytics opt-out is available in the app.',
    'Local browser analytics can be cleared by clearing site data.',
    'No account deletion flow is required while accounts are disabled.',
  ],
}

const supportPage = {
  path: '/support.html',
  productionUrl: environment.publicOrigin?.supportUrl ?? null,
  productionUrlStatus: environment.publicOrigin?.supportUrl ? 'hosted' : 'needs-hosted-domain',
  supportEmail: environment.support?.email ?? null,
  supportEmailStatus: environment.support?.status === 'configured' ? 'configured' : 'needs-production-address',
  supportChannel: {
    status: supportChannel.status,
    provider: supportChannel.provider,
    repository: supportChannel.repository?.target ?? null,
    publicIssuesReady: supportChannel.repository?.publicIssuesReady === true,
    supportUrl: supportChannel.links?.supportUrl ?? null,
    gameplayFeedbackUrl: supportChannel.links?.gameplayFeedbackUrl ?? null,
    bugReportUrl: supportChannel.links?.bugReportUrl ?? null,
    analyticsEvidenceUrl: supportChannel.links?.analyticsEvidenceUrl ?? null,
    publicIssueWarning: supportChannel.privacy?.publicIssueWarning ?? null,
    controls: supportChannel.controls ?? {},
  },
  topics: [
    'Gameplay feedback',
    'Privacy questions',
    'Store listing support contact',
    'Bug reports for web/PWA builds',
    'Player-initiated analytics export notes',
  ],
}

const dataSafetyDraft = {
  googlePlay: {
    status: 'draft-ready',
    dataTypes: [
      {
        type: 'App activity',
        purpose: ['Analytics'],
        optional: false,
        shared: externalAnalyticsConfigured,
        processedEphemerally: false,
      },
    ],
    noCollectionClaims: ['No account data', 'No location', 'No financial information', 'No user-generated content'],
    blockersBeforeSubmission: [
      'Hosted privacy policy URL',
      'Developer account access',
      'Signed Android package',
      'Final ad disclosure if ads are enabled',
    ],
  },
  appleAppPrivacy: {
    status: 'draft-ready',
    labels: [
      {
        dataType: 'Product Interaction',
        purpose: 'Analytics',
        linkedToUser: false,
        usedForTracking: false,
      },
    ],
    blockersBeforeSubmission: [
      'Hosted privacy policy URL',
      'Apple Developer account access',
      'Native app package or approved wrapper strategy',
      'Final in-app purchase disclosure if purchases are enabled',
    ],
  },
}

const twaManifest = {
  packageName: environment.android?.packageName ?? 'app.autonomousgamelab.portal',
  host: environment.publicOrigin?.host ?? null,
  startUrl: '/',
  launcherName: 'Game Lab',
  displayMode: 'standalone',
  signing: 'blocked-until-keystore-exists',
}

const compliancePublicationBlockers = [
  ...(privacyPolicy.productionUrl ? [] : ['production-origin']),
  ...(supportPage.supportEmail ? [] : ['support-email']),
]
const compliancePublicationStatus = compliancePublicationBlockers.length
  ? 'waiting-for-production-inputs'
  : 'ready-for-hosted-compliance'
const compliancePublication = {
  status: compliancePublicationStatus,
  publicPath: '/compliance.json',
  productionUrl: privacyPolicy.productionUrl ? `${environment.publicOrigin.origin}/compliance.json` : null,
  localArtifacts: [
    {
      id: 'privacy-policy',
      path: privacyPolicy.path,
      productionUrl: privacyPolicy.productionUrl,
      status: privacyPolicy.productionUrlStatus,
      requiredText: ['Autonomous Game Lab Privacy Policy', 'Gameplay analytics', 'External analytics opt-out'],
    },
    {
      id: 'support-page',
      path: supportPage.path,
      productionUrl: supportPage.productionUrl,
      status: supportPage.productionUrlStatus,
      requiredText: ['Autonomous Game Lab Support', 'Support Topics'],
    },
    {
      id: 'compliance-manifest',
      path: '/compliance.json',
      productionUrl: privacyPolicy.productionUrl ? `${environment.publicOrigin.origin}/compliance.json` : null,
      status: privacyPolicy.productionUrl ? 'hosted-after-deploy' : 'needs-hosted-domain',
      requiredText: ['store-compliance', 'privacyPolicy', 'supportPage'],
    },
  ],
  smokeChecks: [
    {
      id: 'privacy-policy',
      path: privacyPolicy.path,
      expectedStatus: 200,
      requiredText: 'Autonomous Game Lab Privacy Policy',
    },
    {
      id: 'support-page',
      path: supportPage.path,
      expectedStatus: 200,
      requiredText: 'Autonomous Game Lab Support',
    },
    {
      id: 'compliance-manifest',
      path: '/compliance.json',
      expectedStatus: 200,
      requiredText: 'store-compliance',
    },
  ],
  blockers: compliancePublicationBlockers,
  controls: {
    noStoreSubmission: true,
    noRevenueEnablement: true,
    noPaidSpend: true,
    postDeploySmokeRequired: true,
  },
}

const storeListing = launchCandidate
  ? {
      sourcePrototypeId: launchCandidate.id,
      appName: 'Autonomous Game Lab',
      shortDescription: 'Original board-game-inspired daily strategy puzzles built for quick mobile play.',
      fullDescription: [
        'Autonomous Game Lab is a web-first collection of original board-game-inspired solo puzzles.',
        'Each game focuses on short sessions, touch-first decisions, clear scoring, and measured improvements from anonymous gameplay signals.',
        `Current launch candidate: ${launchCandidate.title}. ${launchCandidate.storeListing.fullDescription}`,
      ].join(' '),
      keywords: [...new Set(['daily puzzle', 'strategy puzzle', 'solo board game', ...launchCandidate.storeListing.keywords])],
      screenshots: launchCandidate.storeListing.screenshotPlan,
      contentRatingNotes: launchCandidate.storeListing.contentRatingNotes,
    }
  : null

const payload = {
  generatedAt,
  sourceDataHash,
  status: 'store-package-ready',
  launchCandidate: launchCandidate
    ? {
        id: launchCandidate.id,
        title: launchCandidate.title,
        status: launchCandidate.status,
      }
    : null,
  privacyPolicy,
  supportPage,
  compliancePublication,
  dataSafetyDraft,
  storeListing,
  nativePackaging: {
    recommendedFirstNativePath: 'Android Trusted Web Activity after web retention gates pass',
    androidTwaManifest: twaManifest,
    iosStrategy: 'Defer until revenue validates Apple Developer annual cost and native review risk.',
  },
  costGates: {
    googlePlayOneTimeUsd: gates.googlePlay.oneTimeCostUsd,
    appleDeveloperAnnualUsd: gates.iosAppStore.annualCostUsd,
  },
  sourceReferences,
}

const complianceManifest = {
  generatedAt,
  sourceDataHash,
  id: 'store-compliance-publication',
  appName: 'Autonomous Game Lab',
  status: compliancePublication.status,
  publicOrigin: {
    origin: environment.publicOrigin?.origin ?? null,
    host: environment.publicOrigin?.host ?? null,
    status: environment.publicOrigin?.status ?? 'missing',
  },
  privacyPolicy: {
    path: privacyPolicy.path,
    productionUrl: privacyPolicy.productionUrl,
    productionUrlStatus: privacyPolicy.productionUrlStatus,
    updatedAt: privacyPolicy.updatedAt,
    dataCollected: privacyPolicy.dataCollected,
    userControls: privacyPolicy.userControls,
  },
  supportPage: {
    path: supportPage.path,
    productionUrl: supportPage.productionUrl,
    productionUrlStatus: supportPage.productionUrlStatus,
    supportEmail: supportPage.supportEmail,
    supportEmailStatus: supportPage.supportEmailStatus,
    supportChannel: supportPage.supportChannel,
    topics: supportPage.topics,
  },
  storeCompliance: {
    policyPosture: 'no-accounts-no-ugc-no-gambling-no-paid-spend',
    googlePlayDataSafetyStatus: dataSafetyDraft.googlePlay.status,
    applePrivacyLabelStatus: dataSafetyDraft.appleAppPrivacy.status,
    contentRating: {
      googlePlayExpected: 'Everyone',
      appleExpected: '4+',
    },
  },
  smokeChecks: compliancePublication.smokeChecks,
  blockers: compliancePublication.blockers,
  controls: compliancePublication.controls,
}

const privacyHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy | Autonomous Game Lab</title>
    <style>
      body {
        margin: 0;
        color: #191713;
        background: #fbf7ef;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.55;
      }

      main {
        width: min(860px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0;
      }

      h1,
      h2 {
        line-height: 1.1;
      }

      a {
        color: #187f7a;
      }

      section {
        padding: 16px 0;
        border-top: 1px solid #d9d0bf;
      }

    </style>
  </head>
  <body>
    <main>
      <h1>Autonomous Game Lab Privacy Policy</h1>
      <p>Last updated: ${shortDate}</p>
      <p>${privacyPolicy.summary}</p>

      <section>
        <h2>Data We Collect</h2>
        <p>We collect anonymous gameplay analytics, including events such as game viewed, game started, tutorial completed, turn taken, level completed, game abandoned, and experiment assignment. These events help improve onboarding, balance, replay quality, and production readiness.</p>
      </section>

      <section>
        <h2>Data We Do Not Collect Yet</h2>
        <p>We do not require accounts, contact information, precise location, payment data, user-generated content, or real-money prizes in the current release.</p>
      </section>

      <section>
        <h2>Analytics Providers</h2>
        <p>Local development stores analytics in the browser and optional local export files. If production analytics are configured, anonymous gameplay events may be forwarded to PostHog or the first-party event collector unless external analytics is disabled in the app.</p>
      </section>

      <section>
        <h2>User Controls</h2>
        <p>The app includes an external analytics opt-out control. Local browser analytics can also be cleared by clearing site data for this app.</p>
      </section>

      <section>
        <h2>Monetization</h2>
        <p>Ads, purchases, subscriptions, and paywalled core rules are disabled until retention, privacy, and platform policy gates pass.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>${
          supportPage.supportEmail
            ? `Production support: ${supportPage.supportEmail}.`
            : 'This bootstrapped project still needs a production support address before public app-store submission.'
        }</p>
      </section>
    </main>
  </body>
</html>
`

const supportHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Support | Autonomous Game Lab</title>
    <style>
      body {
        margin: 0;
        color: #191713;
        background: #fbf7ef;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.55;
      }

      main {
        width: min(820px, calc(100% - 32px));
        margin: 0 auto;
        padding: 48px 0;
      }

      section {
        padding: 16px 0;
        border-top: 1px solid #d9d0bf;
      }

      a {
        color: #187f7a;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Autonomous Game Lab Support</h1>
      <p>This support page is generated for the web/PWA and future store submissions.</p>

      <section>
        <h2>Current Status</h2>
        <p>The project is in internal web/PWA experiment mode. Accounts, purchases, ads, and user-generated content are disabled until production gates pass.</p>
      </section>

      <section>
        <h2>Support Topics</h2>
        <ul>
          ${supportPage.topics.map((topic) => `<li>${topic}</li>`).join('\n          ')}
        </ul>
      </section>

      <section>
        <h2>Public Support Channel</h2>
        <p>GitHub Issues can collect gameplay feedback, web/PWA bug reports, and player-initiated evidence notes while the project stays bootstrapped.</p>
        <ul>
          <li><a href="${supportPage.supportChannel.supportUrl ?? '#'}">Open the public support intake</a></li>
          <li><a href="${supportPage.supportChannel.gameplayFeedbackUrl ?? supportPage.supportChannel.supportUrl ?? '#'}">Share gameplay feedback</a></li>
          <li><a href="${supportPage.supportChannel.bugReportUrl ?? supportPage.supportChannel.supportUrl ?? '#'}">Report a web/PWA bug</a></li>
          <li><a href="${supportPage.supportChannel.analyticsEvidenceUrl ?? supportPage.supportChannel.supportUrl ?? '#'}">Describe a player analytics export</a></li>
          <li><a href="/measurement-status.html">Check production measurement status</a></li>
        </ul>
        <p>GitHub Issues are public. Do not paste private information, raw analytics exports, event rows, or uploaded event files into public issues; analytics evidence issues accept aggregate counts only.</p>
        <p>This zero-cost channel does not replace the production support email required before public app-store submission.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>${
          supportPage.supportEmail
            ? `Email: ${supportPage.supportEmail}`
            : 'A production support email is required before public app-store submission.'
        }</p>
      </section>
    </main>
  </body>
</html>
`

const report = [
  '# Store Package',
  '',
  `Generated: ${payload.generatedAt}`,
  '',
  '## Launch Candidate',
  '',
  launchCandidate ? `${launchCandidate.title} (${launchCandidate.id})` : 'No launch candidate available.',
  '',
  '## Privacy',
  '',
  `- Privacy page path: ${privacyPolicy.path}`,
  `- Privacy production URL: ${privacyPolicy.productionUrl ?? 'not configured'}`,
  `- Support page path: ${supportPage.path}`,
  `- Support email: ${supportPage.supportEmail ?? 'not configured'}`,
  `- Support channel: ${supportPage.supportChannel.status}`,
  `- Compliance manifest path: ${compliancePublication.publicPath}`,
  `- Compliance publish status: ${compliancePublication.status}`,
  `- Production URL status: ${privacyPolicy.productionUrlStatus}`,
  '- External analytics opt-out: present',
  '',
  '## Store Drafts',
  '',
  `- Google Play data safety: ${dataSafetyDraft.googlePlay.status}`,
  `- Apple privacy labels: ${dataSafetyDraft.appleAppPrivacy.status}`,
  `- Android package path: ${payload.nativePackaging.recommendedFirstNativePath}`,
  `- iOS strategy: ${payload.nativePackaging.iosStrategy}`,
  '',
  '## Remaining Blockers',
  '',
  '- Hosted privacy policy URL',
  '- Store developer accounts',
  '- Signed Android package',
  '- Live retention data that clears monetization gates',
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputReportPath), { recursive: true })
await mkdir(path.dirname(privacyPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(outputReportPath, report.join('\n'))
await writeFile(privacyPath, privacyHtml)
await writeFile(supportPath, supportHtml)
await writeFile(complianceManifestPath, JSON.stringify(complianceManifest, null, 2) + '\n')

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputReportPath)}`)
console.log(`Wrote ${path.relative(root, privacyPath)}`)
console.log(`Wrote ${path.relative(root, supportPath)}`)
console.log(`Wrote ${path.relative(root, complianceManifestPath)}`)
