import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'support-feedback.json')
const outputTsPath = path.join(root, 'src', 'data', 'supportFeedback.ts')
const reportPath = path.join(root, 'reports', 'support-feedback-latest.md')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const readOptionalJson = async (filePath, fallback) =>
  readFile(filePath, 'utf8')
    .then((raw) => JSON.parse(raw))
    .catch(() => fallback)

const runJson = (command, args, timeout = 10_000) =>
  new Promise((resolve) => {
    execFile(command, args, { cwd: root, timeout }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          value: [],
          error: stderr.trim() || error.message,
        })
        return
      }

      try {
        resolve({ ok: true, value: JSON.parse(stdout || '[]'), error: null })
      } catch (parseError) {
        resolve({
          ok: false,
          value: [],
          error: parseError instanceof Error ? parseError.message : String(parseError),
        })
      }
    })
  })

const normalizeText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const redactPublicText = (value) =>
  normalizeText(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/https?:\/\/\S+/gi, '[redacted-url]')
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[redacted-number]')
const excerpt = (value, maxLength = 220) => {
  const redacted = redactPublicText(value)

  return redacted.length > maxLength ? `${redacted.slice(0, maxLength - 1)}...` : redacted
}
const hashText = (value) => createHash('sha256').update(value).digest('hex').slice(0, 12)
const issueKindFor = (issue) => {
  const title = String(issue.title ?? '').toLowerCase()
  const body = String(issue.body ?? '').toLowerCase()
  const labelNames = (issue.labels ?? []).map((label) => String(label.name ?? '').toLowerCase())

  if (title.includes('[bug]') || body.includes('support type: bug-report') || labelNames.some((label) => label.includes('bug'))) {
    return 'bug-report'
  }

  if (
    title.includes('[evidence]') ||
    body.includes('support type: analytics-evidence') ||
    labelNames.some((label) => label.includes('evidence'))
  ) {
    return 'analytics-evidence'
  }

  if (
    title.includes('[feedback]') ||
    body.includes('support type: player-feedback') ||
    labelNames.some((label) => label.includes('feedback'))
  ) {
    return 'player-feedback'
  }

  return 'general-issue'
}

const signalRules = [
  {
    id: 'tutorial-confusion',
    label: 'Tutorial clarity',
    experiment: 'first_session_pacing',
    keywords: ['tutorial', 'confusing', 'confused', 'unclear', 'explain', 'learn', 'rules', 'how do'],
  },
  {
    id: 'difficulty-balance',
    label: 'Difficulty balance',
    experiment: 'target_score_curve',
    keywords: ['too hard', 'difficult', 'cannot win', "can't win", 'score', 'target', 'balance', 'too easy'],
  },
  {
    id: 'replay-motivation',
    label: 'Replay motivation',
    experiment: 'reward_offer',
    keywords: ['replay', 'again', 'another run', 'daily', 'streak', 'boring', 'reward'],
  },
  {
    id: 'card-preview',
    label: 'Card preview',
    experiment: 'thumbnail_board_state_v2',
    keywords: ['title', 'thumbnail', 'preview', 'looks', 'cover', 'screenshot'],
  },
]

const gameAliases = (game) => {
  const title = String(game.title ?? game.id ?? '').toLowerCase()
  const id = String(game.id ?? game.gameId ?? '').toLowerCase()

  return [id, title, id.replaceAll('-', ' '), title.replace(/[^a-z0-9]+/g, ' ').trim()].filter(Boolean)
}

const supportChannel = await readOptionalJson(path.join(dataDir, 'support-channel.json'), {
  status: 'missing',
  repository: {},
  controls: {},
})
const playable = await readOptionalJson(path.join(dataDir, 'playable-games.json'), { games: [] })
const gameBalance = await readOptionalJson(path.join(dataDir, 'game-balance.json'), { games: {} })
const generatedPlayable = await readOptionalJson(path.join(dataDir, 'generated-playable-games.json'), { games: [] })
const playableIds = new Set(playable.games ?? [])
const games = [
  ...Object.entries(gameBalance.games ?? {}).map(([id, game]) => ({ id, title: game.title ?? id })),
  ...(generatedPlayable.games ?? []).map((game) => ({ id: game.id, title: game.title ?? game.id })),
]
const uniqueGames = [...new Map(games.filter((game) => playableIds.has(game.id)).map((game) => [game.id, game])).values()]
const repository = supportChannel.repository?.target ?? null
const canInspect =
  repository &&
  ['support-channel-ready', 'support-channel-planned'].includes(supportChannel.status) &&
  supportChannel.provider === 'github-issues'
const result = canInspect
  ? await runJson('gh', [
      'issue',
      'list',
      '--repo',
      repository,
      '--state',
      'all',
      '--limit',
      '100',
      '--json',
      'number,title,body,labels,state,createdAt,updatedAt,url',
    ])
  : { ok: false, value: [], error: 'support-channel-not-ready' }
const rawIssues = Array.isArray(result.value) ? result.value : []

const gameForIssue = (issue) => {
  const haystack = `${issue.title ?? ''}\n${issue.body ?? ''}`.toLowerCase()
  const matchedGame = uniqueGames.find((game) => gameAliases(game).some((alias) => alias && haystack.includes(alias)))

  return matchedGame ?? null
}

const issueRecords = rawIssues.map((issue) => {
  const game = gameForIssue(issue)
  const body = String(issue.body ?? '')
  const title = String(issue.title ?? '')
  const searchable = `${title}\n${body}`.toLowerCase()
  const matchedSignals = signalRules
    .filter((rule) => rule.keywords.some((keyword) => searchable.includes(keyword)))
    .map((rule) => rule.id)

  return {
    number: issue.number,
    url: issue.url,
    state: issue.state,
    kind: issueKindFor(issue),
    title: excerpt(title, 120),
    excerpt: excerpt(body),
    gameId: game?.id ?? null,
    gameTitle: game?.title ?? null,
    matchedSignals,
    labels: (issue.labels ?? []).map((label) => label.name).filter(Boolean).slice(0, 8),
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  }
})

const signalGroups = new Map()

for (const issue of issueRecords) {
  for (const signalId of issue.matchedSignals) {
    const rule = signalRules.find((item) => item.id === signalId)
    const key = `${issue.gameId ?? 'unassigned'}:${signalId}`
    const existing = signalGroups.get(key) ?? {
      id: key,
      signalId,
      label: rule.label,
      experiment: rule.experiment,
      gameId: issue.gameId,
      gameTitle: issue.gameTitle,
      issueNumbers: [],
      issueCount: 0,
      confidence: 0,
      source: 'github-issues',
    }

    existing.issueNumbers.push(issue.number)
    existing.issueCount += 1
    existing.confidence = Math.min(88, 62 + existing.issueCount * 8 + (issue.gameId ? 6 : 0))
    signalGroups.set(key, existing)
  }
}

const improvementSignals = [...signalGroups.values()]
  .sort((left, right) => right.confidence - left.confidence || right.issueCount - left.issueCount)
  .map((signal) => ({
    ...signal,
    issueNumbers: signal.issueNumbers.slice(0, 10),
    status: signal.gameId && playableIds.has(signal.gameId) ? 'routable' : 'needs-game-match',
    reason: `${signal.issueCount} public GitHub issue(s) mention ${signal.label.toLowerCase()}.`,
  }))
const sourceDataHash = hashText(
  JSON.stringify({
    repository,
    issueRecords: issueRecords.map((issue) => ({
      number: issue.number,
      state: issue.state,
      kind: issue.kind,
      title: issue.title,
      excerpt: issue.excerpt,
      gameId: issue.gameId,
      matchedSignals: issue.matchedSignals,
      updatedAt: issue.updatedAt,
    })),
    improvementSignals,
  }),
)
const status = result.ok
  ? issueRecords.length
    ? 'support-feedback-ready'
    : 'support-feedback-empty'
  : canInspect
    ? 'support-feedback-unavailable'
    : 'support-feedback-planned'
const payload = {
  generatedAt: new Date().toISOString(),
  status,
  provider: 'github-issues',
  repository,
  sourceDataHash,
  sourceStatus: {
    supportChannel: supportChannel.status,
    inspected: result.ok,
    error: result.ok ? null : result.error,
  },
  summary: {
    issuesInspected: issueRecords.length,
    openIssues: issueRecords.filter((issue) => issue.state === 'OPEN').length,
    closedIssues: issueRecords.filter((issue) => issue.state === 'CLOSED').length,
    categorizedIssues: issueRecords.filter((issue) => issue.matchedSignals.length > 0).length,
    matchedPlayableIssues: issueRecords.filter((issue) => issue.gameId && playableIds.has(issue.gameId)).length,
    improvementSignals: improvementSignals.length,
    routableSignals: improvementSignals.filter((signal) => signal.status === 'routable').length,
  },
  controls: {
    zeroPaidSpend: true,
    readOnlyGithubIssueList: true,
    noIssueMutation: true,
    noAccountCreation: true,
    noPrivateIssueScrape: true,
    publicIssuesOnly: true,
    noAttachmentsDownloaded: true,
    noRawAnalyticsStored: true,
    redactsContactText: true,
    playableTargetsOnlyForAutomation: true,
  },
  issueRecords,
  improvementSignals,
  nextActions: [
    improvementSignals.some((signal) => signal.status === 'routable')
      ? 'Let autonomous:analyze route public issue signals into the guarded improvement backlog.'
      : 'Keep collecting public GitHub issue feedback until a playable game signal appears.',
    'Never paste private information or raw analytics exports into public issues.',
  ],
}
const appPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  provider: payload.provider,
  repository: payload.repository,
  summary: payload.summary,
  controls: payload.controls,
  topSignals: payload.improvementSignals.slice(0, 3).map((signal) => ({
    id: signal.id,
    label: signal.label,
    gameId: signal.gameId,
    issueCount: signal.issueCount,
    confidence: signal.confidence,
    status: signal.status,
  })),
}
const report = [
  '# Support Feedback',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Repository: ${payload.repository ?? 'missing'}`,
  `Issues inspected: ${payload.summary.issuesInspected}`,
  `Improvement signals: ${payload.summary.improvementSignals}`,
  '',
  '## Controls',
  '',
  `- Zero paid spend: ${payload.controls.zeroPaidSpend}`,
  `- Read-only issue list: ${payload.controls.readOnlyGithubIssueList}`,
  `- No issue mutation: ${payload.controls.noIssueMutation}`,
  `- No attachments downloaded: ${payload.controls.noAttachmentsDownloaded}`,
  `- Raw analytics stored: false`,
  `- Contact text redacted: ${payload.controls.redactsContactText}`,
  '',
  '## Signals',
  '',
  ...(payload.improvementSignals.length
    ? payload.improvementSignals
        .slice(0, 12)
        .map(
          (signal) =>
            `- ${signal.status}: ${signal.gameId ?? 'unassigned'} ${signal.label}; ${signal.issueCount} issue(s); confidence ${signal.confidence}%.`,
        )
    : ['- none']),
  '',
  '## Recent Public Issues',
  '',
  ...(payload.issueRecords.length
    ? payload.issueRecords
        .slice(0, 12)
        .map((issue) => `- #${issue.number}: ${issue.kind}; ${issue.gameId ?? 'unassigned'}; ${issue.title}`)
    : ['- none']),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const supportFeedback = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type SupportFeedback = typeof supportFeedback\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
