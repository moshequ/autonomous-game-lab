import { execFile } from 'node:child_process'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'data')
const outputJsonPath = path.join(dataDir, 'public-repo-security-audit.json')
const outputTsPath = path.join(root, 'src', 'data', 'publicRepoSecurityAudit.ts')
const reportPath = path.join(root, 'reports', 'public-repo-security-audit-latest.md')
const maxScannedFileBytes = 1_000_000

const run = (command, args, timeout = 10_000) =>
  new Promise((resolve) => {
    execFile(command, args, { cwd: root, timeout }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout,
        stderr,
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

const trackedFilesResult = await run('git', ['ls-files', '-z'])
const trackedFiles = trackedFilesResult.ok
  ? trackedFilesResult.stdout.split('\0').filter(Boolean)
  : []

const repositoryResult = await runJson(
  'gh',
  ['repo', 'view', '--json', 'nameWithOwner,visibility,isPrivate,url'],
  {},
)
const gitRemoteResult = await run('git', ['config', '--get', 'remote.origin.url'])

const normalizeRemote = (remoteUrl) => {
  const remote = String(remoteUrl ?? '').trim().replace(/\.git$/, '')
  const httpsMatch = remote.match(/^https:\/\/github\.com\/([^/\s]+\/[^/\s]+)$/)
  const sshMatch = remote.match(/^git@github\.com:([^/\s]+\/[^/\s]+)$/)

  return httpsMatch?.[1] ?? sshMatch?.[1] ?? null
}

const remoteTarget = normalizeRemote(gitRemoteResult.stdout)
const assumePublicFromRemote = Boolean(remoteTarget)

const repository = {
  target: repositoryResult.value.nameWithOwner ?? remoteTarget,
  visibility: repositoryResult.value.visibility ?? (assumePublicFromRemote ? 'PUBLIC' : 'unknown'),
  isPrivate: repositoryResult.value.isPrivate ?? (assumePublicFromRemote ? false : null),
  isPublic:
    repositoryResult.value.visibility === 'PUBLIC' ||
    repositoryResult.value.isPrivate === false ||
    (repositoryResult.ok === false && assumePublicFromRemote),
  url:
    repositoryResult.value.url ??
    (assumePublicFromRemote && remoteTarget ? `https://github.com/${remoteTarget}` : null),
  source: repositoryResult.ok ? 'gh-repo-view' : assumePublicFromRemote ? 'git-remote-fallback-assumed-public' : 'git-remote-fallback',
}

const secretPatterns = [
  {
    id: 'private-key',
    label: 'Private key material',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  },
  {
    id: 'github-classic-token',
    label: 'GitHub classic token',
    pattern: /ghp_[A-Za-z0-9_]{30,}/,
  },
  {
    id: 'github-fine-grained-token',
    label: 'GitHub fine-grained token',
    pattern: /github_pat_[A-Za-z0-9_]{50,}/,
  },
  {
    id: 'aws-access-key',
    label: 'AWS access key',
    pattern: /AKIA[0-9A-Z]{16}/,
  },
  {
    id: 'slack-token',
    label: 'Slack token',
    pattern: /xox[baprs]-[A-Za-z0-9-]{20,}/,
  },
  {
    id: 'openai-api-key',
    label: 'OpenAI API key',
    pattern: /sk-[A-Za-z0-9]{32,}/,
  },
]

const sensitiveTrackedFileRules = [
  {
    id: 'env-file',
    reason: 'Environment files can contain local secrets.',
    pattern: /(^|\/)\.env(?:\.|$)/,
    allow: (filePath) => filePath.endsWith('.example'),
  },
  {
    id: 'private-key-file',
    reason: 'Private key files do not belong in a public repository.',
    pattern: /\.(?:pem|p12|pfx|key|jks|keystore)$/i,
  },
  {
    id: 'local-player-event-drop',
    reason: 'Raw player event drops must stay local and untracked.',
    pattern: /^data\/player-events\/.+\.json$/i,
  },
  {
    id: 'wrangler-runtime-config',
    reason: 'Rendered Wrangler configs can include deploy-time secrets.',
    pattern: /^\.wrangler\//,
  },
]

const knownSecretReferenceNames = [
  'AGL_ANDROID_KEYSTORE_PASSWORD',
  'AGL_EVENT_COLLECTOR_ADMIN_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON',
  'POSTHOG_PERSONAL_API_KEY',
  'VITE_EVENT_COLLECTOR_WRITE_TOKEN',
]

const redactedSample = (line) =>
  String(line ?? '')
    .replace(/[A-Za-z0-9_+=/@.-]{12,}/g, '[redacted-token-like-value]')
    .slice(0, 160)

const highConfidenceSecretHits = []
const skippedLargeFiles = []
const secretReferenceNames = new Set()

for (const filePath of trackedFiles) {
  const absolutePath = path.join(root, filePath)
  const fileStat = await stat(absolutePath).catch(() => null)

  if (!fileStat || !fileStat.isFile()) {
    continue
  }

  if (fileStat.size > maxScannedFileBytes) {
    skippedLargeFiles.push({ path: filePath, bytes: fileStat.size })
    continue
  }

  const raw = await readFile(absolutePath, 'utf8').catch(() => null)

  if (raw === null || raw.includes('\0')) {
    continue
  }

  for (const name of knownSecretReferenceNames) {
    if (raw.includes(name)) {
      secretReferenceNames.add(name)
    }
  }

  const lines = raw.split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const secretPattern of secretPatterns) {
      if (secretPattern.pattern.test(line)) {
        highConfidenceSecretHits.push({
          id: secretPattern.id,
          label: secretPattern.label,
          path: filePath,
          line: index + 1,
          sample: redactedSample(line),
        })
      }
    }
  })
}

const trackedSensitiveFiles = trackedFiles.flatMap((filePath) =>
  sensitiveTrackedFileRules
    .filter((rule) => rule.pattern.test(filePath) && !(rule.allow?.(filePath) ?? false))
    .map((rule) => ({
      id: rule.id,
      path: filePath,
      reason: rule.reason,
    })),
)

const publicEvidenceWorkflowPath = '.github/workflows/public-evidence-intake.yml'
const publicEvidenceWorkflow = await readFile(path.join(root, publicEvidenceWorkflowPath), 'utf8').catch(() => '')
const workflowHasIssueGuardedSecret = (name) =>
  publicEvidenceWorkflow.includes(`${name}: \${{ github.event_name != 'issues' && secrets.${name} || '' }}`)
const guardedPublicIssueSecrets = knownSecretReferenceNames.filter(workflowHasIssueGuardedSecret)
const topLevelReadOnlyPermissions = publicEvidenceWorkflow.includes(
  'permissions:\n  actions: read\n  contents: read\n  issues: read',
)
const publicIssueCommitJobExcluded =
  publicEvidenceWorkflow.includes('commit-public-evidence:') &&
  publicEvidenceWorkflow.includes("if: github.event_name != 'issues' && vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT == '1'")
const scheduledWriteJobIsolated =
  publicEvidenceWorkflow.includes('commit-public-evidence:') &&
  publicEvidenceWorkflow.includes('permissions:\n      contents: write') &&
  publicEvidenceWorkflow.includes('actions/download-artifact@v4')

const publicWorkflowRisks = [
  !topLevelReadOnlyPermissions
    ? {
        id: 'public-issue-workflow-writable',
        severity: 'high',
        path: publicEvidenceWorkflowPath,
        detail: 'Public issue-triggered evidence intake must keep top-level contents permission read-only.',
      }
    : null,
  guardedPublicIssueSecrets.length !== knownSecretReferenceNames.length
    ? {
        id: 'public-issue-secrets-unblocked',
        severity: 'high',
        path: publicEvidenceWorkflowPath,
        detail: 'All production secrets used by public evidence intake must be blank on issue events.',
      }
    : null,
  !publicIssueCommitJobExcluded
    ? {
        id: 'public-issue-commit-path',
        severity: 'high',
        path: publicEvidenceWorkflowPath,
        detail: 'Public issue-triggered runs must not enter a commit/push job.',
      }
    : null,
  !scheduledWriteJobIsolated
    ? {
        id: 'scheduled-write-job-not-isolated',
        severity: 'medium',
        path: publicEvidenceWorkflowPath,
        detail: 'Scheduled evidence commits should run in a separate contents:write job fed by artifacts.',
      }
    : null,
].filter(Boolean)

const highRiskFindingCount =
  highConfidenceSecretHits.length + trackedSensitiveFiles.length + publicWorkflowRisks.length
const status = highRiskFindingCount === 0 ? 'public-repo-security-ready' : 'public-repo-security-blocked'

const payload = {
  script: 'node scripts/public-repo-security-audit.mjs',
  generatedAt: new Date().toISOString(),
  status,
  repository,
  summary: {
    trackedFilesScanned: trackedFiles.length,
    skippedLargeFiles: skippedLargeFiles.length,
    highConfidenceSecretFindings: highConfidenceSecretHits.length,
    trackedSensitiveFiles: trackedSensitiveFiles.length,
    publicWorkflowRisks: publicWorkflowRisks.length,
    secretReferenceNames: secretReferenceNames.size,
    guardedPublicIssueSecrets: guardedPublicIssueSecrets.length,
  },
  controls: {
    zeroPaidSpend: true,
    readOnlyGitInspection: true,
    noSecretValuesStored: true,
    highConfidencePatternsOnly: true,
    generatedReportRedactsSamples: true,
    rawPlayerEventDropsMustStayUntracked: true,
    publicIssueTriggerSecretsBlocked: guardedPublicIssueSecrets.length === knownSecretReferenceNames.length,
    publicIssueTriggerCommitsBlocked: publicIssueCommitJobExcluded,
    publicIssueWorkflowReadOnly: topLevelReadOnlyPermissions,
    scheduledWriteJobIsolated,
  },
  publicEvidenceIntakeWorkflow: {
    path: publicEvidenceWorkflowPath,
    topLevelReadOnlyPermissions,
    publicIssueCommitJobExcluded,
    scheduledWriteJobIsolated,
    guardedSecrets: guardedPublicIssueSecrets,
    expectedGuardedSecrets: knownSecretReferenceNames,
  },
  findings: {
    highConfidenceSecrets: highConfidenceSecretHits,
    trackedSensitiveFiles,
    publicWorkflowRisks,
    skippedLargeFiles,
    secretReferenceNames: [...secretReferenceNames].sort(),
  },
  nextActions:
    highRiskFindingCount === 0
      ? [
          'Keep the public issue-triggered intake read-only and secretless.',
          'Run this audit before autonomous cadence and production readiness evidence is trusted.',
          'Rotate any credential immediately if a future high-confidence secret finding appears.',
        ]
      : [
          'Block deploy/self-update until high-risk public repository findings are removed.',
          'Rotate any leaked credential outside the repository before recommitting sanitized evidence.',
      ],
}

const appPayload = {
  generatedAt: payload.generatedAt,
  status: payload.status,
  repository: {
    target: payload.repository.target,
    visibility: payload.repository.visibility,
    isPublic: payload.repository.isPublic,
  },
  summary: {
    highConfidenceSecretFindings: payload.summary.highConfidenceSecretFindings,
    trackedSensitiveFiles: payload.summary.trackedSensitiveFiles,
    publicWorkflowRisks: payload.summary.publicWorkflowRisks,
    guardedPublicIssueSecrets: payload.summary.guardedPublicIssueSecrets,
  },
  controls: {
    publicIssueTriggerSecretsBlocked: payload.controls.publicIssueTriggerSecretsBlocked,
    publicIssueTriggerCommitsBlocked: payload.controls.publicIssueTriggerCommitsBlocked,
    publicIssueWorkflowReadOnly: payload.controls.publicIssueWorkflowReadOnly,
    scheduledWriteJobIsolated: payload.controls.scheduledWriteJobIsolated,
  },
}

const report = [
  '# Public Repo Security Audit',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  `Repository: ${payload.repository.target ?? 'unknown'} (${payload.repository.visibility})`,
  '',
  '## Summary',
  '',
  `- tracked files scanned: ${payload.summary.trackedFilesScanned}`,
  `- high-confidence secret findings: ${payload.summary.highConfidenceSecretFindings}`,
  `- tracked sensitive files: ${payload.summary.trackedSensitiveFiles}`,
  `- public workflow risks: ${payload.summary.publicWorkflowRisks}`,
  `- guarded issue-trigger secrets: ${payload.summary.guardedPublicIssueSecrets}/${payload.publicEvidenceIntakeWorkflow.expectedGuardedSecrets.length}`,
  '',
  '## Controls',
  '',
  ...Object.entries(payload.controls).map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Findings',
  '',
  ...(highRiskFindingCount === 0
    ? ['- none']
    : [
        ...payload.findings.highConfidenceSecrets.map(
          (finding) => `- secret: ${finding.id} in ${finding.path}:${finding.line}`,
        ),
        ...payload.findings.trackedSensitiveFiles.map(
          (finding) => `- sensitive file: ${finding.id} in ${finding.path}`,
        ),
        ...payload.findings.publicWorkflowRisks.map((finding) => `- workflow: ${finding.id} in ${finding.path}`),
      ]),
  '',
  '## Next Actions',
  '',
  ...payload.nextActions.map((action) => `- ${action}`),
  '',
].join('\n')

await mkdir(dataDir, { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, `${JSON.stringify(payload, null, 2)}\n`)
await writeFile(
  outputTsPath,
  `export const publicRepoSecurityAudit = ${JSON.stringify(appPayload, null, 2)} as const\n\nexport type PublicRepoSecurityAudit = typeof publicRepoSecurityAudit\n`,
)
await writeFile(reportPath, report)

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
