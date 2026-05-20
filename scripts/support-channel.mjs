import { execFile } from 'node:child_process'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadLocalEnv } from './lib/env-loader.mjs'

const root = process.cwd()
const localEnv = await loadLocalEnv({ root })
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'support-channel.json')
const outputTsPath = path.join(root, 'src', 'data', 'supportChannel.ts')
const reportPath = path.join(root, 'reports', 'support-channel-latest.md')

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const configured = (value) => typeof value === 'string' && value.trim().length > 0
const first = (...values) => values.find((value) => configured(value))?.trim() ?? null

const run = (command, args, timeout = 5_000) =>
  new Promise((resolve) => {
    execFile(command, args, { cwd: root, timeout }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: error ? stderr.trim() || error.message : null,
      })
    })
  })

const runJson = async (command, args, fallback) => {
  const result = await run(command, args)

  if (!result.ok) {
    return { ok: false, value: fallback, error: result.error }
  }

  try {
    return { ok: true, value: JSON.parse(result.stdout), error: null }
  } catch (error) {
    return {
      ok: false,
      value: fallback,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

const repositoryNameFromPackage = (packageName) => {
  const baseName = String(packageName || 'autonomous-game-lab').split('/').pop()
  const normalized = baseName.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')

  return normalized || 'autonomous-game-lab'
}

const cleanGithubOwner = (value) => {
  const owner = String(value ?? '').trim()

  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) ? owner : null
}

const cleanGithubRepositoryName = (value) => {
  const repository = String(value ?? '').trim()

  return /^[A-Za-z0-9._-]+$/.test(repository) ? repository : null
}

const repositoryFromOwnerHint = (owner, repositoryName) => {
  const cleanOwner = cleanGithubOwner(owner)
  const cleanRepository = cleanGithubRepositoryName(repositoryName)

  return cleanOwner && cleanRepository ? `${cleanOwner}/${cleanRepository}` : null
}

const parseGithubRepository = (value) => {
  const raw = String(value ?? '').trim()
  const match = raw.match(/^([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)$/)

  return match ? { owner: match[1], repository: match[2], target: `${match[1]}/${match[2]}` } : null
}

const repositoryFromRemote = (remoteUrl) => {
  const normalizedRemoteUrl = String(remoteUrl ?? '').trim().replace(/\/+$/g, '')

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

const issueBody = (kind) =>
  [
    'Thanks for helping improve Autonomous Game Lab.',
    '',
    'GitHub Issues are public. Do not paste private information or raw analytics exports into this issue.',
    'If you use Export local analytics, review the file first and attach it only when you are comfortable sharing it publicly.',
    '',
    `Support type: ${kind}`,
    'Game or page:',
    'URL:',
    'What happened:',
    'What you expected:',
  ].join('\n')

const issueUrl = (repoUrl, template, title, body) => {
  if (!repoUrl) {
    return null
  }

  const url = new URL(`${repoUrl}/issues/new`)
  url.searchParams.set('template', template)
  url.searchParams.set('title', title)
  url.searchParams.set('body', body)

  return url.toString()
}

const inspectGithubRepository = async (repository) => {
  if (!repository) {
    return {
      status: 'missing-target',
      nameWithOwner: null,
      url: null,
      visibility: null,
      hasIssuesEnabled: null,
      hasDiscussionsEnabled: null,
      isArchived: null,
      errors: ['Repository target is unavailable.'],
      controls: {
        readOnlyInspection: true,
        noMutation: true,
        secretValuesNeverRead: true,
      },
    }
  }

  const result = await runJson(
    'gh',
    [
      'repo',
      'view',
      repository,
      '--json',
      'nameWithOwner,visibility,hasIssuesEnabled,hasDiscussionsEnabled,url,homepageUrl,isArchived',
    ],
    {},
  )

  if (!result.ok) {
    return {
      status: 'unavailable',
      nameWithOwner: repository,
      url: `https://github.com/${repository}`,
      visibility: null,
      hasIssuesEnabled: null,
      hasDiscussionsEnabled: null,
      isArchived: null,
      errors: [`gh repo view: ${result.error}`],
      controls: {
        readOnlyInspection: true,
        noMutation: true,
        secretValuesNeverRead: true,
      },
    }
  }

  return {
    status: 'inspected',
    nameWithOwner: result.value.nameWithOwner ?? repository,
    url: result.value.url ?? `https://github.com/${repository}`,
    visibility: result.value.visibility ?? null,
    hasIssuesEnabled: result.value.hasIssuesEnabled ?? null,
    hasDiscussionsEnabled: result.value.hasDiscussionsEnabled ?? null,
    homepageUrl: result.value.homepageUrl ?? null,
    isArchived: result.value.isArchived ?? null,
    errors: [],
    controls: {
      readOnlyInspection: true,
      noMutation: true,
      secretValuesNeverRead: true,
    },
  }
}

const packageJson = await readOptionalJson(path.join(root, 'package.json'), { name: 'autonomous-game-lab' })
const repositoryReadiness = await readOptionalJson(path.join(dataDir, 'repository-readiness.json'), {
  repository: {},
})
const remoteResult = await run('git', ['remote', 'get-url', 'origin'])
const ghUserResult = await run('gh', ['api', 'user', '--jq', '.login'])
const inferredRepositoryName = repositoryNameFromPackage(packageJson.name)
const repositoryEnvTarget = first(process.env.GITHUB_REPOSITORY, process.env.GH_REPO)
const repositoryOwnerHint =
  process.env.AGL_GITHUB_OWNER ?? process.env.GITHUB_REPOSITORY_OWNER ?? process.env.GITHUB_OWNER ?? null
const ownerHintRepository = repositoryFromOwnerHint(repositoryOwnerHint, inferredRepositoryName)
const remoteRepository = repositoryFromRemote(remoteResult.ok ? remoteResult.stdout : null)
const inferredRepository =
  ghUserResult.ok && configured(ghUserResult.stdout) ? `${ghUserResult.stdout}/${inferredRepositoryName}` : null
const targetRepository =
  repositoryEnvTarget ?? repositoryReadiness.repository?.target ?? remoteRepository ?? ownerHintRepository ?? inferredRepository
const targetRepositorySource = repositoryEnvTarget
  ? 'environment'
  : repositoryReadiness.repository?.target
    ? (repositoryReadiness.repository?.source ?? 'repository-readiness')
    : remoteRepository
      ? 'origin-remote'
      : ownerHintRepository
        ? 'owner-hint-and-package-name'
        : inferredRepository
          ? 'gh-auth-user-and-package-name'
          : 'missing'
const parsedRepository = parseGithubRepository(targetRepository)
const repositoryMetadata = await inspectGithubRepository(parsedRepository?.target ?? null)
const repositoryUrl = repositoryMetadata.url ?? (parsedRepository ? `https://github.com/${parsedRepository.target}` : null)
const supportUrl = repositoryUrl ? `${repositoryUrl}/issues/new/choose` : null
const issueTemplates = [
  {
    id: 'player-feedback',
    path: '.github/ISSUE_TEMPLATE/player-feedback.yml',
    template: 'player-feedback.yml',
    title: '[Feedback] Gameplay feedback',
    requiredText: 'Gameplay feedback',
  },
  {
    id: 'bug-report',
    path: '.github/ISSUE_TEMPLATE/bug-report.yml',
    template: 'bug-report.yml',
    title: '[Bug] Web/PWA issue',
    requiredText: 'Web/PWA bug report',
  },
  {
    id: 'analytics-evidence',
    path: '.github/ISSUE_TEMPLATE/analytics-evidence.yml',
    template: 'analytics-evidence.yml',
    title: '[Evidence] Player event export note',
    requiredText: 'Analytics evidence note',
  },
]
const templateChecks = await Promise.all(
  issueTemplates.map(async (template) => {
    const absolutePath = path.join(root, template.path)
    const found = await exists(absolutePath)
    const source = found ? await readFile(absolutePath, 'utf8') : ''

    return {
      ...template,
      exists: found,
      containsPrivacyWarning:
        source.includes('Do not paste private information') && source.includes('raw analytics exports'),
      url: issueUrl(repositoryUrl, template.template, template.title, issueBody(template.id)),
    }
  }),
)
const templatesReady = templateChecks.every((template) => template.exists && template.containsPrivacyWarning)
const issuesEnabled = repositoryMetadata.hasIssuesEnabled === true
const repositoryPublic = repositoryMetadata.visibility === 'PUBLIC'
const repositoryArchived = repositoryMetadata.isArchived === true
const publicIssuesReady = Boolean(
  parsedRepository && repositoryMetadata.status === 'inspected' && repositoryPublic && issuesEnabled && !repositoryArchived,
)
const supportChannelReady = publicIssuesReady && templatesReady
const blockers = [
  ...(parsedRepository ? [] : ['Attach or configure a GitHub repository target for public issue support.']),
  ...(repositoryMetadata.status === 'inspected' ? [] : ['GitHub repository metadata is not available to verify issues.']),
  ...(repositoryPublic ? [] : ['Use a public repository or another public zero-cost support intake before public launch.']),
  ...(issuesEnabled ? [] : ['Enable GitHub Issues on the repository to accept public support reports.']),
  ...(repositoryArchived ? ['Unarchive the repository before accepting support reports.'] : []),
  ...(templatesReady ? [] : ['Commit public issue templates with privacy warnings.']),
]
const status = supportChannelReady
  ? 'support-channel-ready'
  : parsedRepository
    ? issuesEnabled === false || repositoryArchived
      ? 'support-channel-blocked'
      : 'support-channel-planned'
    : 'support-channel-missing-target'

const payload = {
  generatedAt: new Date().toISOString(),
  status,
  provider: 'github-issues',
  envFiles: localEnv,
  repository: {
    target: parsedRepository?.target ?? null,
    source: targetRepositorySource,
    owner: parsedRepository?.owner ?? null,
    name: parsedRepository?.repository ?? null,
    url: repositoryUrl,
    metadata: repositoryMetadata,
    publicIssuesReady,
  },
  issueTemplates: templateChecks,
  links: {
    supportUrl,
    issueListUrl: repositoryUrl ? `${repositoryUrl}/issues` : null,
    gameplayFeedbackUrl: templateChecks.find((template) => template.id === 'player-feedback')?.url ?? null,
    bugReportUrl: templateChecks.find((template) => template.id === 'bug-report')?.url ?? null,
    analyticsEvidenceUrl: templateChecks.find((template) => template.id === 'analytics-evidence')?.url ?? null,
  },
  privacy: {
    publicIssueWarning:
      'GitHub Issues are public; do not paste private information or raw analytics exports into public issue bodies.',
    exportedEventFilePolicy:
      'Player event exports are player-initiated and should be reviewed before voluntary public attachment.',
    prefilledUrlsContainRawEvents: false,
    rawEventUploadsAutomated: false,
  },
  controls: {
    zeroPaidSpend: true,
    noAccountCreation: true,
    noStoreSubmission: true,
    noRevenueEnablement: true,
    readOnlyRepositoryInspection: true,
    noMutation: true,
    playerInitiatedOnly: true,
    noPrivateDataInPrefilledUrls: true,
    noRawEventEmbeddingInUrls: true,
    supportEmailStillRequiredForStoreSubmission: true,
  },
  blockers,
  nextActions: [
    supportChannelReady
      ? 'Link the generated support page to GitHub Issues and review public support reports before applying product changes.'
      : 'Finish the zero-cost GitHub Issues support channel or configure another public support intake.',
    'Keep a real support email as a separate app-store blocker.',
    'Keep player analytics exports voluntary, reviewed by the player, and never uploaded automatically.',
  ],
}

const report = [
  '# Support Channel',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Provider: ${payload.provider}`,
  `Repository: ${payload.repository.target ?? 'missing'}`,
  `Support URL: ${payload.links.supportUrl ?? 'missing'}`,
  '',
  '## Repository',
  '',
  `- metadata: ${payload.repository.metadata.status}`,
  `- visibility: ${payload.repository.metadata.visibility ?? 'unknown'}`,
  `- issues enabled: ${payload.repository.metadata.hasIssuesEnabled ?? 'unknown'}`,
  `- public issues ready: ${payload.repository.publicIssuesReady}`,
  '',
  '## Templates',
  '',
  ...payload.issueTemplates.map(
    (template) =>
      `- ${template.exists && template.containsPrivacyWarning ? 'ready' : 'missing'}: ${template.id} (${template.path})`,
  ),
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Blockers',
  '',
  ...(payload.blockers.length ? payload.blockers.map((blocker) => `- ${blocker}`) : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const supportChannel = ${JSON.stringify(payload, null, 2)} as const\n\nexport type SupportChannel = typeof supportChannel\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
