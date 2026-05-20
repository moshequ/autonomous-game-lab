import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'pwa-install-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'pwaInstallLoop.ts')
const reportPath = path.join(root, 'reports', 'pwa-install-loop-latest.md')
const installPagePath = path.join(root, 'public', 'install.html')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readText = async (filePath) => readFile(filePath, 'utf8').catch(() => '')

const analytics = await readJson(path.join(dataDir, 'analytics-rollup.json'))
const growth = await readJson(path.join(dataDir, 'growth-plan.json'))
const acquisition = await readJson(path.join(dataDir, 'acquisition-learning.json'))
const retention = await readJson(path.join(dataDir, 'retention-loop.json'))
const releaseHealth = await readJson(path.join(dataDir, 'release-health.json'))
const iconAssets = await readJson(path.join(dataDir, 'icon-assets.json'))
const environment = await readJson(path.join(dataDir, 'production-environment.json'))
const viteConfig = await readText(path.join(root, 'vite.config.ts'))

const counts = analytics.totals?.counts ?? {}
const metric = (eventName) => Number(counts[eventName] ?? 0)
const roundMetric = (value) => Math.round(value * 1000) / 1000
const pct = (value) => `${Math.round(value * 100)}%`
const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
const runtimeHref = (value) => (value.startsWith('/') ? `.${value}` : value)

const growthInstallChannel = (growth.channels ?? []).find((channel) => channel.id === 'pwa-install')
const manifestConfigured =
  viteConfig.includes('VitePWA') &&
  viteConfig.includes("display: 'standalone'") &&
  viteConfig.includes('manifest:')
const iconCoverageReady =
  iconAssets.status === 'icons-ready' &&
  (iconAssets.manifestIcons?.length ?? 0) >= 4 &&
  iconAssets.assets?.some((asset) => asset.id === 'store-1024')
const serviceWorkerConfigured = viteConfig.includes('registerType') && viteConfig.includes('autoUpdate')
const promptAvailable = metric('pwa_install_prompt_available')
const promptViews = metric('pwa_install_prompt_viewed')
const promptClicks = metric('pwa_install_prompt_clicked')
const accepted = metric('pwa_install_prompt_accepted')
const dismissed = metric('pwa_install_prompt_dismissed')
const cooldownSuppressions = metric('pwa_install_prompt_cooldown')
const installed = metric('pwa_installed')
const launchModes = metric('pwa_launch_mode_detected')
const installRate = promptViews ? installed / promptViews : 0
const acceptanceRate = promptClicks ? accepted / promptClicks : 0
const dismissalRate = promptClicks ? dismissed / promptClicks : 0
const promptSurfaceRate = promptAvailable ? promptViews / promptAvailable : 0
const canMeasureInstall =
  analytics.sourceStatus?.activeSource !== 'missing' &&
  retention.status === 'retention-loop-ready' &&
  acquisition.status === 'acquisition-learning-ready'
const priorityGameId = retention.dailyChallenge?.gameId ?? acquisition.summary?.featuredGameId ?? null
const installCampaignId = `pwa-install-${priorityGameId ?? 'portal'}`
const installPlayPath = `/?${new URLSearchParams({
  ...(priorityGameId ? { game: priorityGameId } : {}),
  utm_source: 'pwa_install',
  utm_campaign: installCampaignId,
}).toString()}`

const payload = {
  generatedAt: new Date().toISOString(),
  status:
    manifestConfigured && serviceWorkerConfigured && iconCoverageReady && growthInstallChannel
      ? 'pwa-install-loop-ready'
      : 'blocked-install-assets',
  sourceStatus: {
    analyticsSource: analytics.sourceStatus?.activeSource ?? 'unknown',
    acquisitionLearning: acquisition.status,
    retentionLoop: retention.status,
    releaseHealth: releaseHealth.status,
    publicOrigin: environment.publicOrigin?.status ?? 'missing',
  },
  channel: {
    id: 'pwa-install',
    status: growthInstallChannel?.status ?? 'missing',
    costUsd: 0,
    assets: ['manifest.webmanifest', 'service worker', 'install icons', 'standalone launch telemetry'],
    metric: 'pwa_install_prompt_viewed -> pwa_installed -> pwa_launch_mode_detected',
  },
  metrics: {
    promptAvailable,
    promptViews,
    promptClicks,
    accepted,
    dismissed,
    cooldownSuppressions,
    installed,
    launchModes,
    promptSurfaceRate: roundMetric(promptSurfaceRate),
    installRate: roundMetric(installRate),
    acceptanceRate: roundMetric(acceptanceRate),
    dismissalRate: roundMetric(dismissalRate),
  },
  promptPolicy: {
    surface: 'autonomy-cockpit',
    ctaLabel: 'Install app',
    minimumCompletedRunsBeforeNudge: 0,
    minimumTurnsBeforeNudge: 1,
    cooldownDaysAfterDismissal: 14,
    nativePromptRequired: true,
    fallbackWhenUnavailable: 'measure-browser-launch-mode-only',
    priorityGameId,
  },
  publicInstallPage: {
    path: '/install.html',
    file: 'public/install.html',
    campaignId: installCampaignId,
    playPath: installPlayPath,
    priorityGameId,
    zeroPaidSpend: true,
    playerInitiatedOnly: true,
    browserPromptControlled: true,
    nativePromptRequired: true,
    hostedOriginRequired: environment.publicOrigin?.status !== 'configured',
  },
  localState: {
    dismissalKey: 'agl.pwa.installDismissedAt',
    installedKey: 'agl.pwa.installedAt',
    launchModeKey: 'agl.pwa.launchMode',
  },
  controls: {
    canMeasureInstall,
    canPromptInstall: releaseHealth.controls?.canDeploy === true,
    hostRequiredForProductionInstall: environment.publicOrigin?.status !== 'configured',
    noPaidInstallIncentive: true,
    noNotificationPermissionPrompt: true,
  },
  measurementPolicy: {
    availableEvent: 'pwa_install_prompt_available',
    surfacedEvent: 'pwa_install_prompt_viewed',
    clickedEvent: 'pwa_install_prompt_clicked',
    acceptedEvent: 'pwa_install_prompt_accepted',
    dismissedEvent: 'pwa_install_prompt_dismissed',
    cooldownEvent: 'pwa_install_prompt_cooldown',
    installedEvent: 'pwa_installed',
    launchEvent: 'pwa_launch_mode_detected',
    cooldownStorageKey: 'agl.pwa.installDismissedAt',
    cooldownDays: 14,
    reason: 'Separate browser install eligibility from user-visible prompting so the loop can optimize distribution without nagging players.',
  },
  guardrails: {
    noForcedPrompt: true,
    noBlockingGameplay: true,
    respectBrowserPromptAvailability: true,
    enforceDismissalCooldown: true,
    noInstallWall: true,
    noPaidInstallReward: true,
  },
  nextActions: [
    promptAvailable && !promptViews
      ? `Native prompt was available ${promptAvailable} time(s), but cooldown or install state prevented user-facing CTA exposure.`
      : promptViews
      ? `Improve PWA install acceptance from ${pct(acceptanceRate)} while keeping prompt cooldowns.`
      : 'Start measuring native install prompt availability and standalone launches.',
    `Route install traffic through ${installPlayPath} so prompt events carry pwa-install attribution.`,
    environment.publicOrigin?.status === 'configured'
      ? 'Keep install links pointed at the stable HTTPS production origin.'
      : 'Publish to a stable HTTPS host before using PWA install data for store-readiness claims.',
    'Keep install prompts optional, non-blocking, and separated from paid rewards.',
  ],
}

const report = [
  '# PWA Install Loop',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Channel: ${payload.channel.id} (${payload.channel.status})`,
  `Prompt available: ${payload.metrics.promptAvailable}`,
  `Prompt views: ${payload.metrics.promptViews}`,
  `Cooldown suppressions: ${payload.metrics.cooldownSuppressions}`,
  `Installs: ${payload.metrics.installed}`,
  `Acceptance: ${pct(payload.metrics.acceptanceRate)}`,
  '',
  '## Prompt Policy',
  '',
  `- Surface: ${payload.promptPolicy.surface}`,
  `- CTA: ${payload.promptPolicy.ctaLabel}`,
  `- Cooldown after dismissal: ${payload.promptPolicy.cooldownDaysAfterDismissal} days`,
  `- Priority game: ${payload.promptPolicy.priorityGameId ?? 'none'}`,
  `- Public install page: ${payload.publicInstallPage.path}`,
  `- Campaign: ${payload.publicInstallPage.campaignId}`,
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.guardrails).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Measurement',
  '',
  `- Availability: ${payload.measurementPolicy.availableEvent}`,
  `- User-visible prompt: ${payload.measurementPolicy.surfacedEvent}`,
  `- Cooldown: ${payload.measurementPolicy.cooldownEvent}`,
  `- Launch: ${payload.measurementPolicy.launchEvent}`,
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

const installPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Autonomous Game Lab Install</title>
    <style>
      :root {
        color: #17211f;
        background: #f5f7f6;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      main {
        width: min(820px, calc(100% - 32px));
        min-height: 100vh;
        display: grid;
        align-content: center;
        gap: 18px;
        margin: 0 auto;
        padding: 42px 0;
      }

      h1,
      p {
        margin: 0;
      }

      h1 {
        max-width: 680px;
        font-size: clamp(2.4rem, 8vw, 5rem);
        line-height: 0.95;
        letter-spacing: 0;
      }

      p {
        max-width: 620px;
        color: #4a5753;
        font-size: 1.05rem;
        line-height: 1.55;
      }

      .eyebrow {
        color: #0f766e;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .panel {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 10px;
      }

      .metric {
        min-height: 88px;
        padding: 16px;
        border: 1px solid #cbd8d4;
        border-radius: 8px;
        background: #ffffff;
      }

      .metric span {
        display: block;
        color: #68726f;
        font-size: 0.74rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .metric strong {
        display: block;
        margin-top: 6px;
        font-size: 1.05rem;
      }

      .play {
        display: inline-flex;
        width: fit-content;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        padding: 0 18px;
        border-radius: 7px;
        background: #0f766e;
        color: #fff;
        font-weight: 800;
        text-decoration: none;
      }

      @media (max-width: 720px) {
        .panel {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main data-campaign-id="${escapeHtml(payload.publicInstallPage.campaignId)}" data-channel-id="pwa-install">
      <p class="eyebrow">Zero-spend install path</p>
      <h1>Autonomous Game Lab Install</h1>
      <p>Open the PWA from this player-initiated link so install prompt availability, acceptance, and standalone launches can be measured without paid incentives.</p>
      <section class="panel" aria-label="Install measurement">
        <div class="metric"><span>Campaign</span><strong>${escapeHtml(payload.publicInstallPage.campaignId)}</strong></div>
        <div class="metric"><span>Browser prompt</span><strong>controlled</strong></div>
        <div class="metric"><span>Cost</span><strong>$0.00</strong></div>
      </section>
      <a class="play" href="${escapeHtml(runtimeHref(payload.publicInstallPage.playPath))}">Open app</a>
    </main>
  </body>
</html>
`

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await mkdir(path.dirname(installPagePath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const pwaInstallLoop = ${JSON.stringify(payload, null, 2)} as const\n\nexport type PwaInstallLoop = typeof pwaInstallLoop\n`,
)
await writeFile(reportPath, report.join('\n'))
await writeFile(installPagePath, installPage)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, installPagePath)}`)
