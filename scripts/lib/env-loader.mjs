import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

const defaultEnvFiles = [
  '.env',
  '.env.local',
  '.env.production',
  '.env.production.local',
  'ops/production.env',
  'ops/production.env.local',
]
const protectedKeyPrefixes = ['AGL_ALLOW_']
const protectedKeys = new Set(['RUN_WORKFLOWS', 'ALLOW_ANDROID_RELEASE_WORKFLOW', 'AGL_OPERATOR_EXECUTE'])

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const unquote = (value) => {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed
      .slice(1, -1)
      .replaceAll('\\n', '\n')
      .replaceAll('\\"', '"')
      .replaceAll("\\'", "'")
  }

  return trimmed
}

const parseEnvFile = (raw) =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.replace(/^export\s+/, ''))
    .map((line) => {
      const separator = line.indexOf('=')

      if (separator <= 0) {
        return null
      }

      const key = line.slice(0, separator).trim()
      const value = unquote(line.slice(separator + 1))

      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        return null
      }

      return [key, value]
    })
    .filter(Boolean)

const unique = (items) => [...new Set(items)]

const protectedMutationKey = (key) =>
  protectedKeys.has(key) || protectedKeyPrefixes.some((prefix) => key.startsWith(prefix))

export const loadLocalEnv = async ({ root = process.cwd(), files = defaultEnvFiles } = {}) => {
  const shellKeys = new Set(Object.keys(process.env))
  const loadedFiles = []
  const loadedKeys = []
  const skippedExistingKeys = []
  const skippedProtectedKeys = []
  const overwrittenEnvFileKeys = []

  for (const relativePath of files) {
    const filePath = path.resolve(root, relativePath)

    if (!(await exists(filePath))) {
      continue
    }

    const pairs = parseEnvFile(await readFile(filePath, 'utf8'))
    const fileKeys = []

    for (const [key, value] of pairs) {
      fileKeys.push(key)

      if (shellKeys.has(key)) {
        skippedExistingKeys.push(key)
      } else if (protectedMutationKey(key)) {
        skippedProtectedKeys.push(key)
      } else {
        if (process.env[key] !== undefined) {
          overwrittenEnvFileKeys.push(key)
        }

        process.env[key] = value
        loadedKeys.push(key)
      }
    }

    loadedFiles.push({
      path: path.relative(root, filePath),
      keys: fileKeys,
    })
  }

  return {
    loaded: loadedFiles.length > 0,
    loadedFiles,
    loadedKeys: unique(loadedKeys),
    skippedExistingKeys: unique(skippedExistingKeys),
    skippedProtectedKeys: unique(skippedProtectedKeys),
    overwrittenEnvFileKeys: unique(overwrittenEnvFileKeys),
    supportedFiles: files,
    candidateFiles: files,
    shellEnvPrecedence: true,
    valuesRedacted: true,
    controls: {
      shellEnvPrecedence: true,
      laterEnvFilesOverrideEarlierEnvFiles: true,
      protectedMutationKeysRequireShellEnv: true,
      noSecretValuesInReports: true,
      gitIgnoredLocalEnvFiles: true,
    },
  }
}
