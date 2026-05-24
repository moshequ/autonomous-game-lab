import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashSourceData } from './lib/source-hash.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const publicDir = path.join(root, 'public')
const reportsDir = path.join(root, 'reports')
const srcDataDir = path.join(root, 'src', 'data')

const outputJsonPath = path.join(dataDir, 'store-readiness.json')
const outputTsPath = path.join(srcDataDir, 'storeReadiness.ts')
const publicJsonPath = path.join(publicDir, 'store-readiness.json')
const publicHtmlPath = path.join(publicDir, 'store-readiness.html')
const reportPath = path.join(reportsDir, 'store-readiness-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const storePackage = await readJson(path.join(dataDir, 'store-package.json'))
const storeCompliance = await readJson(path.join(dataDir, 'store-compliance.json'))
const storeListingOptimizer = await readJson(path.join(dataDir, 'store-listing-optimizer.json'))
const nativePackage = await readJson(path.join(dataDir, 'native-package.json'))
const androidRelease = await readJson(path.join(dataDir, 'android-release.json'))
const iosRelease = await readJson(path.join(dataDir, 'ios-release.json'))
const unitEconomics = await readJson(path.join(dataDir, 'unit-economics.json'))
const monetizationPlan = await readJson(path.join(dataDir, 'monetization-plan.json'))
const productionEnvironment = await readJson(path.join(dataDir, 'production-environment.json'))
const storeAssets = await readOptionalJson(path.join(dataDir, 'store-assets.json'), {
  status: 'missing',
  screenshots: [],
})

const sourceData = {
  storePackage,
  storeCompliance,
  storeListingOptimizer,
  nativePackage,
  androidRelease,
  iosRelease,
  unitEconomics,
  monetizationPlan,
  productionEnvironment,
  storeAssets,
}
const sourceDataHash = hashSourceData(sourceData)
const generatedAt = new Date().toISOString()

const unique = (items) => [...new Set(items.filter(Boolean))]
const checkStatus = (status) => {
  if (
    ['pass', 'ready', 'hosted', 'configured', 'store-package-ready', 'store-listing-optimizer-ready', 'screenshots-ready'].includes(
      status,
    )
  ) {
    return 'pass'
  }

  if (String(status).includes('ready') || String(status).includes('prepared')) {
    return 'pass'
  }

  if (
    ['external-blocker', 'missing-env', 'deferred-paid-account', 'held-by-economics'].includes(status) ||
    String(status).startsWith('needs-')
  ) {
    return 'external-blocker'
  }

  return 'blocker'
}
const check = (id, passed, detail, statusWhenBlocked = 'blocker') => ({
  id,
  status: passed ? 'pass' : statusWhenBlocked,
  detail,
})
const normalizeBlocker = (source, value) => {
  if (!value) {
    return null
  }

  return `${source}: ${String(value)}`
}
const classifyBlocker = (blocker) => {
  const value = blocker.toLowerCase()

  if (
    value.includes('completion') ||
    value.includes('replay') ||
    value.includes('retention') ||
    value.includes('revenue signal') ||
    value.includes('promotion') ||
    value.includes('payback') ||
    value.includes('economics') ||
    value.includes('spend allowed') ||
    value.includes('store spend') ||
    value.includes('paid acquisition')
  ) {
    return 'product'
  }

  return 'external'
}

const sourceStatus = {
  storePackage: storePackage.status,
  storeCompliance: storeCompliance.status,
  storeListingOptimizer: storeListingOptimizer.status,
  nativePackage: nativePackage.status,
  androidRelease: androidRelease.status,
  iosRelease: iosRelease.status,
  unitEconomics: unitEconomics.status,
  monetization: monetizationPlan.status,
  productionEnvironment: productionEnvironment.status,
  storeAssets: storeAssets.status,
}

const checks = [
  check(
    'store-package',
    storePackage.status === 'store-package-ready',
    `Store package is ${storePackage.status}.`,
  ),
  check(
    'store-compliance',
    storeCompliance.status === 'draft-ready-external-blockers',
    `Store compliance draft is ${storeCompliance.status}.`,
  ),
  check(
    'store-listing',
    storeListingOptimizer.status === 'store-listing-optimizer-ready',
    `Store listing optimizer is ${storeListingOptimizer.status}.`,
  ),
  check(
    'store-screenshots',
    storeAssets.status === 'screenshots-ready' && (storeAssets.screenshots?.length ?? 0) >= 4,
    `${storeAssets.screenshots?.length ?? 0} screenshot asset(s) are available.`,
    'external-blocker',
  ),
  check(
    'native-package',
    nativePackage.status === 'ready-for-bubblewrap-build',
    `Native Android package handoff is ${nativePackage.status}.`,
  ),
  check(
    'android-release',
    androidRelease.status === 'ready-for-internal-test' || androidRelease.status?.startsWith('blocked-'),
    `Android release plan is ${androidRelease.status}.`,
    'external-blocker',
  ),
  check(
    'ios-release',
    iosRelease.status === 'ready-for-app-store-connect' || iosRelease.status === 'deferred-until-ios-payback',
    `iOS handoff is ${iosRelease.status}.`,
    'external-blocker',
  ),
  check(
    'unit-economics',
    unitEconomics.controls?.storeSpendAllowed === true,
    `Store spend allowed is ${unitEconomics.controls?.storeSpendAllowed === true}.`,
    'external-blocker',
  ),
  check(
    'monetization',
    monetizationPlan.revenueEnabled === true,
    `Revenue enabled is ${monetizationPlan.revenueEnabled === true}.`,
    'blocker',
  ),
  check(
    'support-contact',
    storePackage.supportPage?.supportEmailStatus === 'configured',
    'Production support email is required before public app-store submission.',
    'external-blocker',
  ),
]

const rawBlockers = unique([
  ...(storeCompliance.blockers ?? []).map((item) => normalizeBlocker('store-compliance', item)),
  ...(androidRelease.blockers ?? []).map((item) => normalizeBlocker('android', item)),
  ...(iosRelease.blockers ?? []).map((item) => normalizeBlocker('ios', item)),
  ...(monetizationPlan.blockers ?? []).map((item) => normalizeBlocker('monetization', item)),
  ...(unitEconomics.storeFees?.googlePlay?.blockers ?? []).map((item) => normalizeBlocker('google-play-fee', item)),
  ...(unitEconomics.storeFees?.iosAppStore?.blockers ?? []).map((item) => normalizeBlocker('ios-fee', item)),
  ...checks
    .filter((item) => item.status !== 'pass')
    .map((item) => normalizeBlocker(item.id, item.detail)),
])
const externalBlockers = rawBlockers.filter((item) => classifyBlocker(item) === 'external')
const productBlockers = rawBlockers.filter((item) => classifyBlocker(item) === 'product')
const launchCandidate = storePackage.launchCandidate ?? {
  id: monetizationPlan.launchCandidate?.gameId ?? null,
  title: monetizationPlan.launchCandidate?.title ?? null,
  status: null,
}
const publicRoutes = {
  storeReadiness: '/store-readiness.html',
  storeReadinessJson: '/store-readiness.json',
  privacy: '/privacy.html',
  support: '/support.html',
  compliance: '/compliance.json',
  monetization: '/monetization.html',
  monetizationJson: '/monetization.json',
  measurementStatus: '/measurement-status.html',
  appAdsTxt: '/app-ads.txt',
}
const controls = {
  zeroPaidSpend: true,
  noPaidSpend: true,
  noStoreSubmission: true,
  noRevenueEnablement: true,
  noAccountCreation: true,
  noSecretValues: true,
  ownerInputsRequired: externalBlockers.length > 0,
  storeSpendStillBlocked: unitEconomics.controls?.storeSpendAllowed !== true,
  postDeploySmokeRequired: true,
}
const platformHandoffs = [
  {
    id: 'web-pwa',
    label: 'Web PWA',
    status: storePackage.status === 'store-package-ready' ? 'public-compliance-published' : 'needs-store-package',
    route: '/',
    package: {
      privacy: storePackage.privacyPolicy?.path ?? null,
      support: storePackage.supportPage?.path ?? null,
      compliance: storePackage.compliancePublication?.publicPath ?? null,
    },
    checks: [
      { id: 'privacy', status: checkStatus(storePackage.privacyPolicy?.productionUrlStatus), detail: storePackage.privacyPolicy?.productionUrlStatus },
      { id: 'support', status: checkStatus(storePackage.supportPage?.supportEmailStatus), detail: storePackage.supportPage?.supportEmailStatus },
      { id: 'compliance', status: checkStatus(storeCompliance.status), detail: storeCompliance.status },
    ],
  },
  {
    id: 'android-google-play',
    label: 'Android Google Play',
    status: androidRelease.status,
    packageName: androidRelease.packageName ?? nativePackage.packageName,
    releaseTrack: androidRelease.releaseTrack ?? 'internal',
    packageStrategy: nativePackage.platform,
    workflowPath: androidRelease.workflow?.path ?? '.github/workflows/android-twa-release.yml',
    blockers: androidRelease.blockers ?? [],
    setupRequiredOnce: androidRelease.setupRequiredOnce ?? [],
    commands: androidRelease.commands ?? {},
  },
  {
    id: 'ios-app-store',
    label: 'iOS App Store',
    status: iosRelease.status,
    bundleId: iosRelease.bundleId,
    packageStrategy: iosRelease.strategy?.packageStrategy,
    handoffDirectory: iosRelease.handoff?.directory,
    blockers: iosRelease.blockers ?? [],
    setupRequiredOnce: iosRelease.setupRequiredOnce ?? [],
    commands: iosRelease.commands ?? {},
  },
]
const status = externalBlockers.length || productBlockers.length
  ? 'store-readiness-prepared-external-blockers'
  : 'store-readiness-ready-for-owner-review'

const summary = {
  launchCandidateId: launchCandidate?.id ?? null,
  launchCandidateTitle: launchCandidate?.title ?? null,
  complianceStatus: storeCompliance.status,
  androidStatus: androidRelease.status,
  iosStatus: iosRelease.status,
  nativePackageStatus: nativePackage.status,
  storeSpendAllowed: unitEconomics.controls?.storeSpendAllowed === true,
  revenueEnabled: monetizationPlan.revenueEnabled === true,
  screenshotCount: storeAssets.screenshots?.length ?? 0,
  externalBlockerCount: externalBlockers.length,
  productBlockerCount: productBlockers.length,
}
const payload = {
  generatedAt,
  sourceDataHash,
  status,
  sourceStatus,
  summary,
  publicRoutes,
  platformHandoffs,
  checks,
  blockers: {
    external: externalBlockers,
    product: productBlockers,
  },
  controls,
}
const publicPayload = {
  generatedAt,
  sourceDataHash,
  status,
  summary,
  publicRoutes,
  platformHandoffs: platformHandoffs.map((handoff) => ({
    id: handoff.id,
    label: handoff.label,
    status: handoff.status,
    blockers: handoff.blockers ?? [],
  })),
  blockers: payload.blockers,
  controls,
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
const renderList = (items) =>
  items.length ? items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n            ') : '<li>None recorded.</li>'
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Store Readiness | Autonomous Game Lab</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #17191c;
        --muted: #5c6270;
        --line: #d8d4ca;
        --paper: #fbfaf6;
        --panel: #ffffff;
        --accent: #176f6b;
        --warn: #9a4d15;
        --soft: #f1f4ed;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: var(--ink);
        background: var(--paper);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
      }

      main {
        width: min(1080px, calc(100% - 32px));
        margin: 0 auto;
        padding: 44px 0 56px;
      }

      h1,
      h2,
      h3 {
        line-height: 1.1;
        letter-spacing: 0;
      }

      h1 {
        max-width: 760px;
        margin: 0;
        font-size: 3.6rem;
      }

      h2 {
        margin-top: 0;
      }

      a {
        color: var(--accent);
        font-weight: 700;
      }

      .lede {
        max-width: 820px;
        color: var(--muted);
        font-size: 1.08rem;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
        margin: 28px 0;
      }

      .metric,
      section {
        border: 1px solid var(--line);
        background: var(--panel);
        border-radius: 8px;
      }

      .metric {
        min-height: 98px;
        padding: 14px;
      }

      .metric span,
      .row span {
        display: block;
        color: var(--muted);
        font-size: 0.82rem;
        text-transform: uppercase;
      }

      .metric strong {
        display: block;
        margin-top: 8px;
        font-size: 1.15rem;
        overflow-wrap: anywhere;
      }

      section {
        margin-top: 16px;
        padding: 22px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
      }

      .handoff {
        min-height: 170px;
        padding: 16px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--soft);
      }

      .handoff strong {
        overflow-wrap: anywhere;
      }

      .row {
        display: grid;
        grid-template-columns: minmax(120px, 0.55fr) minmax(0, 1fr);
        gap: 12px;
        padding: 10px 0;
        border-top: 1px solid var(--line);
      }

      .row:first-child {
        border-top: 0;
      }

      ul {
        padding-left: 1.1rem;
      }

      li + li {
        margin-top: 6px;
      }

      .warning {
        color: var(--warn);
        font-weight: 700;
      }

      @media (max-width: 640px) {
        main {
          width: min(100% - 24px, 1080px);
          padding-top: 28px;
        }

        section {
          padding: 16px;
        }

        h1 {
          font-size: 2.25rem;
        }

        .row {
          grid-template-columns: 1fr;
          gap: 2px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Autonomous Game Lab Store Readiness</h1>
      <p class="lede">This generated handoff consolidates public web/PWA compliance, Android Google Play preparation, iOS App Store preparation, monetization gates, and remaining owner inputs without paying store fees or enabling revenue.</p>

      <div class="summary" aria-label="Store readiness summary">
        <div class="metric"><span>Status</span><strong>${escapeHtml(status)}</strong></div>
        <div class="metric"><span>Launch candidate</span><strong>${escapeHtml(summary.launchCandidateTitle ?? 'none')}</strong></div>
        <div class="metric"><span>Android</span><strong>${escapeHtml(summary.androidStatus)}</strong></div>
        <div class="metric"><span>iOS</span><strong>${escapeHtml(summary.iosStatus)}</strong></div>
        <div class="metric"><span>Screenshots</span><strong>${summary.screenshotCount}</strong></div>
        <div class="metric"><span>External blockers</span><strong>${summary.externalBlockerCount}</strong></div>
      </div>

      <section>
        <h2>Platform Handoffs</h2>
        <div class="grid">
          ${platformHandoffs
            .map(
              (handoff) => `<div class="handoff">
            <h3>${escapeHtml(handoff.label)}</h3>
            <p><strong>${escapeHtml(handoff.status)}</strong></p>
            <p>${escapeHtml(handoff.packageStrategy ?? handoff.route ?? handoff.packageName ?? handoff.bundleId ?? '')}</p>
          </div>`,
            )
            .join('\n          ')}
        </div>
      </section>

      <section>
        <h2>Public Evidence</h2>
        <div class="row"><span>Readiness JSON</span><a href="./store-readiness.json">store-readiness.json</a></div>
        <div class="row"><span>Measurement</span><a href="./measurement-status.html">measurement-status.html</a></div>
        <div class="row"><span>Monetization</span><a href="./monetization.html">monetization.html</a></div>
        <div class="row"><span>Privacy</span><a href="./privacy.html">privacy.html</a></div>
        <div class="row"><span>Support</span><a href="./support.html">support.html</a></div>
        <div class="row"><span>Compliance</span><a href="./compliance.json">compliance.json</a></div>
      </section>

      <section>
        <h2>External Blockers</h2>
        <p class="warning">Owner-controlled accounts, contact fields, provider credentials, or store spend remain gated.</p>
        <ul>
            ${renderList(externalBlockers)}
        </ul>
      </section>

      <section>
        <h2>Product Gates</h2>
        <ul>
            ${renderList(productBlockers)}
        </ul>
      </section>

      <section>
        <h2>Controls</h2>
        <div class="row"><span>Paid spend</span><strong>${controls.noPaidSpend ? 'blocked' : 'allowed'}</strong></div>
        <div class="row"><span>Store submission</span><strong>${controls.noStoreSubmission ? 'blocked' : 'allowed'}</strong></div>
        <div class="row"><span>Revenue</span><strong>${controls.noRevenueEnablement ? 'disabled' : 'enabled'}</strong></div>
        <div class="row"><span>Source hash</span><strong>${sourceDataHash}</strong></div>
      </section>
    </main>
  </body>
</html>
`

const report = [
  '# Store Readiness',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Source hash: ${payload.sourceDataHash}`,
  '',
  '## Summary',
  '',
  `- Launch candidate: ${summary.launchCandidateTitle ?? 'none'} (${summary.launchCandidateId ?? 'none'})`,
  `- Compliance: ${summary.complianceStatus}`,
  `- Android: ${summary.androidStatus}`,
  `- iOS: ${summary.iosStatus}`,
  `- Store spend allowed: ${summary.storeSpendAllowed}`,
  `- Revenue enabled: ${summary.revenueEnabled}`,
  `- Screenshots: ${summary.screenshotCount}`,
  '',
  '## Checks',
  '',
  ...checks.map((item) => `- ${item.status}: ${item.id} - ${item.detail}`),
  '',
  '## Platform Handoffs',
  '',
  ...platformHandoffs.map((handoff) => `- ${handoff.id}: ${handoff.status}`),
  '',
  '## External Blockers',
  '',
  ...externalBlockers.map((item) => `- ${item}`),
  '',
  '## Product Gates',
  '',
  ...productBlockers.map((item) => `- ${item}`),
  '',
  '## Controls',
  '',
  ...Object.entries(controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(publicJsonPath), { recursive: true })
await mkdir(path.dirname(publicHtmlPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const storeReadiness = ${JSON.stringify(payload, null, 2)} as const\n\nexport type StoreReadiness = typeof storeReadiness\n`,
)
await writeFile(publicJsonPath, JSON.stringify(publicPayload, null, 2) + '\n')
await writeFile(publicHtmlPath, html)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, publicJsonPath)}`)
console.log(`Wrote ${path.relative(root, publicHtmlPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
