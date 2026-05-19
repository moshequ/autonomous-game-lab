import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'pwa-install-loop.json')
const outputTsPath = path.join(root, 'src', 'data', 'pwaInstallLoop.ts')
const reportPath = path.join(root, 'reports', 'pwa-install-loop-latest.md')

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
const promptViews = metric('pwa_install_prompt_viewed')
const promptClicks = metric('pwa_install_prompt_clicked')
const accepted = metric('pwa_install_prompt_accepted')
const dismissed = metric('pwa_install_prompt_dismissed')
const installed = metric('pwa_installed')
const launchModes = metric('pwa_launch_mode_detected')
const installRate = promptViews ? installed / promptViews : 0
const acceptanceRate = promptClicks ? accepted / promptClicks : 0
const dismissalRate = promptClicks ? dismissed / promptClicks : 0
const canMeasureInstall =
  analytics.sourceStatus?.activeSource !== 'missing' &&
  retention.status === 'retention-loop-ready' &&
  acquisition.status === 'acquisition-learning-ready'

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
    promptViews,
    promptClicks,
    accepted,
    dismissed,
    installed,
    launchModes,
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
    priorityGameId: retention.dailyChallenge?.gameId ?? acquisition.summary?.featuredGameId ?? null,
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
  guardrails: {
    noForcedPrompt: true,
    noBlockingGameplay: true,
    respectBrowserPromptAvailability: true,
    noInstallWall: true,
    noPaidInstallReward: true,
  },
  nextActions: [
    promptViews
      ? `Improve PWA install acceptance from ${pct(acceptanceRate)} while keeping prompt cooldowns.`
      : 'Start measuring native install prompt availability and standalone launches.',
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
  `Prompt views: ${payload.metrics.promptViews}`,
  `Installs: ${payload.metrics.installed}`,
  `Acceptance: ${pct(payload.metrics.acceptanceRate)}`,
  '',
  '## Prompt Policy',
  '',
  `- Surface: ${payload.promptPolicy.surface}`,
  `- CTA: ${payload.promptPolicy.ctaLabel}`,
  `- Cooldown after dismissal: ${payload.promptPolicy.cooldownDaysAfterDismissal} days`,
  `- Priority game: ${payload.promptPolicy.priorityGameId ?? 'none'}`,
  '',
  '## Guardrails',
  '',
  ...Object.entries(payload.guardrails).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const pwaInstallLoop = ${JSON.stringify(payload, null, 2)} as const\n\nexport type PwaInstallLoop = typeof pwaInstallLoop\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
