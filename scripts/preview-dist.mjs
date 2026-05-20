import { createReadStream } from 'node:fs'
import { access, readFile, stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const args = process.argv.slice(2)

const valueFor = (name, fallback) => {
  const index = args.indexOf(name)

  if (index >= 0 && args[index + 1]) {
    return args[index + 1]
  }

  const inline = args.find((arg) => arg.startsWith(`${name}=`))
  return inline ? inline.slice(name.length + 1) : fallback
}

const host = valueFor('--host', process.env.HOST ?? '127.0.0.1')
const port = Number(valueFor('--port', process.env.PORT ?? '4173'))

const normalizeBasePath = (basePath) => {
  if (!basePath || basePath === '/') {
    return '/'
  }

  return `/${String(basePath).replace(/^\/|\/$/g, '')}/`
}

const inferBuiltBasePath = async () => {
  try {
    const html = await readFile(path.join(distDir, 'index.html'), 'utf8')
    const match = html.match(/(?:src|href)="\/([^/]+)\/(?:assets\/|manifest\.webmanifest|registerSW\.js|icons\/)/)

    return match ? `/${match[1]}/` : '/'
  } catch {
    return '/'
  }
}

const configuredBasePath = normalizeBasePath(process.env.VITE_BASE_PATH || (await inferBuiltBasePath()))

const stripConfiguredBasePath = (requestPath) => {
  if (configuredBasePath === '/') {
    return requestPath
  }

  const baseWithoutTrailingSlash = configuredBasePath.replace(/\/$/, '')

  if (requestPath === baseWithoutTrailingSlash || requestPath === configuredBasePath) {
    return '/'
  }

  if (requestPath.startsWith(configuredBasePath)) {
    return `/${requestPath.slice(configuredBasePath.length)}`
  }

  return requestPath
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
}

const exists = async (filePath) =>
  access(filePath)
    .then(() => true)
    .catch(() => false)

const safeJoin = (base, requestPath) => {
  const decoded = decodeURIComponent(stripConfiguredBasePath(requestPath).split('?')[0])
  const normalized = path.normalize(decoded).replace(/^[/\\]+/, '')
  const target = path.resolve(base, normalized === '' || normalized === '.' ? 'index.html' : normalized)
  const resolvedBase = path.resolve(base)

  return target.startsWith(`${resolvedBase}${path.sep}`) ? target : path.join(resolvedBase, 'index.html')
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`)
  let filePath = safeJoin(distDir, requestUrl.pathname)

  try {
    const fileStat = await stat(filePath)
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, 'index.html')
    }
  } catch {
    const hasExtension = Boolean(path.extname(filePath))
    const fallbackPath = path.join(distDir, 'index.html')

    if (!hasExtension && (await exists(fallbackPath))) {
      filePath = fallbackPath
    } else {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }
  }

  response.setHeader('Content-Type', contentTypes[path.extname(filePath)] ?? 'application/octet-stream')
  createReadStream(filePath)
    .on('error', () => {
      if (!response.headersSent) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      }
      response.end('Not found')
    })
    .pipe(response)
})

server.listen(port, host, () => {
  console.log(`Serving dist at http://${host}:${port}/ with base ${configuredBasePath}`)
})
