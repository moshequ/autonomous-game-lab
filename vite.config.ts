import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const normalizeBasePath = (value: string | null | undefined) => {
  const trimmed = value?.trim()

  if (!trimmed || trimmed === '/') {
    return '/'
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

const optionalBasePath = (value: string | null | undefined) => (value?.trim() ? normalizeBasePath(value) : null)

const readJsonFile = <T,>(filePath: string): T | null => {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T
  } catch {
    return null
  }
}

const parseGithubRepository = (value: string | null | undefined) => {
  const raw = value?.trim()
  const match = raw?.match(/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)$/)

  return match ? { owner: match[1], repository: match[2] } : null
}

const repositoryFromRemote = (remoteUrl: string | null | undefined) => {
  const normalizedRemoteUrl = remoteUrl?.trim().replace(/\/+$/g, '')

  if (!normalizedRemoteUrl) {
    return null
  }

  const githubRemotePatterns = [
    /^https:\/\/github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
    /^git@github\.com:([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
    /^ssh:\/\/git@github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?$/,
  ]

  for (const pattern of githubRemotePatterns) {
    const match = normalizedRemoteUrl.match(pattern)

    if (match) {
      return match[1]
    }
  }

  return null
}

const gitRemoteRepository = () => {
  try {
    return repositoryFromRemote(execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }))
  } catch {
    return null
  }
}

const basePathFromOrigin = (value: string | null | undefined) => {
  const raw = value?.trim()

  if (!raw) {
    return null
  }

  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`

  try {
    const url = new URL(withProtocol)
    return normalizeBasePath(url.pathname)
  } catch {
    return null
  }
}

const pagesBasePathFor = (repositoryTarget: string | null | undefined) => {
  const parsed = parseGithubRepository(repositoryTarget)

  if (!parsed) {
    return null
  }

  return parsed.repository.toLowerCase() === `${parsed.owner.toLowerCase()}.github.io`
    ? '/'
    : normalizeBasePath(parsed.repository)
}

const inferredProductionBasePath = () => {
  const environment = readJsonFile<{
    publicOrigin?: { basePath?: string | null; origin?: string | null }
  }>('data/production-environment.json')
  const repositoryReadiness = readJsonFile<{
    repository?: { target?: string | null }
  }>('data/repository-readiness.json')

  return (
    basePathFromOrigin(process.env.AGL_PUBLIC_ORIGIN) ??
    basePathFromOrigin(process.env.VITE_PUBLIC_ORIGIN) ??
    basePathFromOrigin(process.env.PUBLIC_SITE_URL) ??
    optionalBasePath(environment?.publicOrigin?.basePath) ??
    basePathFromOrigin(environment?.publicOrigin?.origin) ??
    pagesBasePathFor(process.env.GITHUB_REPOSITORY) ??
    pagesBasePathFor(process.env.GH_REPO) ??
    pagesBasePathFor(repositoryReadiness?.repository?.target) ??
    pagesBasePathFor(gitRemoteRepository()) ??
    '/'
  )
}

const basePathFor = ({ command }: ConfigEnv) =>
  optionalBasePath(process.env.VITE_BASE_PATH) ?? (command === 'build' ? inferredProductionBasePath() : '/')

const operationalFreshnessAssets = [
  'measurement-status.html',
  'measurement-status.json',
  'owner-unlock-brief.json',
  'owner-unlock-preflight.json',
  'analytics-unlock.html',
  'analytics-unlock.json',
  'product-gate-recovery.html',
  'product-gate-recovery.json',
  'release-candidate.json',
  'sample-next.html',
  'sample-next.json',
  'sample-fastest.html',
  'sample-fastest.json',
  'seed-next.html',
  'seed-next.json',
  'seed-kit.html',
  'gate-sample.html',
  'share-manifest.json',
  'monetization.html',
  'store-readiness.html',
  'store-readiness.json',
  'privacy.html',
  'support.html',
  'install.html',
  '.well-known/assetlinks.json',
]

const operationalFreshnessRoute =
  /\/(?:measurement-status\.html|measurement-status\.json|owner-unlock-brief\.json|analytics-unlock\.html|analytics-unlock\.json|product-gate-recovery\.html|product-gate-recovery\.json|release-candidate\.json|sample-next\.html|sample-next\.json|sample-fastest\.html|sample-fastest\.json|seed-next\.html|seed-next\.json|seed-kit\.html|gate-sample\.html|share-manifest\.json|monetization\.html|store-readiness\.html|store-readiness\.json|privacy\.html|support\.html|install\.html|\.well-known\/assetlinks\.json)(?:\?.*)?$/

export default defineConfig((env) => {
  const normalizedBase = basePathFor(env)

  return {
    base: normalizedBase,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'icons/icon-192.png',
          'icons/icon-512.png',
          'icons/maskable-192.png',
          'icons/maskable-512.png',
          'icons/apple-touch-icon.png',
        ],
        manifest: {
          name: 'Autonomous Game Lab',
          short_name: 'Game Lab',
          description: 'A web-first game portal with autonomous analytics and improvement loops.',
          theme_color: '#fbf7ef',
          background_color: '#fbf7ef',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: normalizedBase,
          scope: normalizedBase,
          icons: [
            {
              src: `${normalizedBase}favicon.svg`,
              sizes: 'any',
              type: 'image/svg+xml',
            },
            {
              src: `${normalizedBase}icons/icon-192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${normalizedBase}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${normalizedBase}icons/maskable-192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: `${normalizedBase}icons/maskable-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
          globIgnores: operationalFreshnessAssets,
          navigateFallbackDenylist: [operationalFreshnessRoute],
          runtimeCaching: [
            {
              urlPattern: operationalFreshnessRoute,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'operational-evidence',
                networkTimeoutSeconds: 3,
                cacheableResponse: {
                  statuses: [0, 200],
                },
                expiration: {
                  maxEntries: operationalFreshnessAssets.length,
                  maxAgeSeconds: 60 * 60,
                },
              },
            },
          ],
        },
      }),
    ],
  }
})
