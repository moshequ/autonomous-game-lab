import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const root = process.cwd()
const outputDir = path.join(root, 'public', 'icons')
const outputJsonPath = path.join(root, 'data', 'icon-assets.json')
const outputTsPath = path.join(root, 'src', 'data', 'iconAssets.ts')
const reportPath = path.join(root, 'reports', 'icon-assets-latest.md')
const sourceSvgPath = path.join(outputDir, 'app-icon.svg')

const iconSpecs = [
  {
    id: 'pwa-192',
    fileName: 'icon-192.png',
    size: 192,
    purpose: 'any',
    platformUse: ['PWA install', 'Android TWA'],
  },
  {
    id: 'pwa-512',
    fileName: 'icon-512.png',
    size: 512,
    purpose: 'any',
    platformUse: ['PWA install', 'Android TWA'],
  },
  {
    id: 'maskable-192',
    fileName: 'maskable-192.png',
    size: 192,
    purpose: 'maskable',
    platformUse: ['Android launcher maskable'],
  },
  {
    id: 'maskable-512',
    fileName: 'maskable-512.png',
    size: 512,
    purpose: 'maskable',
    platformUse: ['Android launcher maskable'],
  },
  {
    id: 'apple-touch-180',
    fileName: 'apple-touch-icon.png',
    size: 180,
    purpose: 'any',
    platformUse: ['iOS home screen draft'],
  },
  {
    id: 'store-1024',
    fileName: 'store-icon-1024.png',
    size: 1024,
    purpose: 'store',
    platformUse: ['Google Play icon draft', 'Apple App Store icon draft'],
  },
]

const sourceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f766e"/>
      <stop offset="0.52" stop-color="#263f8c"/>
      <stop offset="1" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff7ed"/>
      <stop offset="1" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#0f172a" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="url(#bg)"/>
  <g opacity="0.22" fill="none" stroke="#f8fafc" stroke-width="28">
    <path d="M126 748c142-56 244-54 394 0 138 50 230 52 378 0"/>
    <path d="M126 274c142 56 244 54 394 0 138-50 230-52 378 0"/>
  </g>
  <g filter="url(#shadow)">
    <rect x="218" y="218" width="588" height="588" rx="116" fill="#111827"/>
    <rect x="258" y="258" width="508" height="508" rx="86" fill="url(#tile)"/>
    <g transform="translate(310 310)">
      <rect width="164" height="164" rx="36" fill="#0f766e"/>
      <rect x="220" width="164" height="164" rx="36" fill="#f59e0b"/>
      <rect y="220" width="164" height="164" rx="36" fill="#263f8c"/>
      <rect x="220" y="220" width="164" height="164" rx="36" fill="#be123c"/>
      <circle cx="82" cy="82" r="28" fill="#f8fafc"/>
      <path d="M278 52h48v60h58v48h-58v58h-48v-58h-58v-48h58z" fill="#111827" opacity="0.84"/>
      <path d="M44 282h76v36H44zm0 66h76v36H44z" fill="#f8fafc"/>
      <path d="M244 292c36-42 78-42 114 0 18 22 18 50 0 72-36 42-78 42-114 0-18-22-18-50 0-72z" fill="#f8fafc"/>
    </g>
  </g>
  <path d="M292 848c132 60 308 60 440 0" fill="none" stroke="#f8fafc" stroke-width="34" stroke-linecap="round" opacity="0.76"/>
</svg>`

const renderHtml = (size) => `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      html,
      body {
        width: ${size}px;
        height: ${size}px;
        margin: 0;
        overflow: hidden;
        background: transparent;
      }

      svg {
        width: ${size}px;
        height: ${size}px;
        display: block;
      }
    </style>
  </head>
  <body>${sourceSvg}</body>
</html>`

await mkdir(outputDir, { recursive: true })
await writeFile(sourceSvgPath, sourceSvg)

const browser = await chromium.launch()

try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })

  for (const spec of iconSpecs) {
    await page.setViewportSize({ width: spec.size, height: spec.size })
    await page.setContent(renderHtml(spec.size))
    await page.screenshot({
      path: path.join(outputDir, spec.fileName),
      type: 'png',
      omitBackground: true,
    })
  }
} finally {
  await browser.close()
}

const pngInfo = async (filePath) => {
  const buffer = await readFile(filePath)

  if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    throw new Error(`${filePath} is not a PNG`)
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.byteLength,
  }
}

const assets = await Promise.all(
  iconSpecs.map(async (spec) => {
    const filePath = path.join(outputDir, spec.fileName)
    const info = await pngInfo(filePath)

    return {
      ...spec,
      path: `/icons/${spec.fileName}`,
      sourcePath: path.relative(root, filePath),
      width: info.width,
      height: info.height,
      bytes: info.bytes,
      type: 'image/png',
    }
  }),
)

const invalid = assets.find((asset) => asset.width !== asset.size || asset.height !== asset.size || asset.bytes < 4_000)

if (invalid) {
  throw new Error(`Icon asset failed validation: ${invalid.id}`)
}

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'icons-ready',
  sourceSvgPath: 'public/icons/app-icon.svg',
  manifestIcons: assets
    .filter((asset) => ['any', 'maskable'].includes(asset.purpose) && [192, 512].includes(asset.size))
    .map((asset) => ({
      src: asset.path,
      sizes: `${asset.size}x${asset.size}`,
      type: asset.type,
      purpose: asset.purpose,
    })),
  storeIcons: assets.filter((asset) => asset.purpose === 'store'),
  assets,
}

const report = [
  '# Icon Assets',
  '',
  `Generated: ${payload.generatedAt}`,
  `Status: ${payload.status}`,
  '',
  '## Assets',
  '',
  ...assets.map(
    (asset) =>
      `- ${asset.id}: ${asset.path}, ${asset.width}x${asset.height}, ${asset.purpose}, ${asset.bytes} bytes`,
  ),
  '',
  '## Manifest Icons',
  '',
  ...payload.manifestIcons.map((icon) => `- ${icon.src}: ${icon.sizes}, ${icon.purpose}`),
  '',
]

await mkdir(path.dirname(outputJsonPath), { recursive: true })
await mkdir(path.dirname(outputTsPath), { recursive: true })
await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(outputJsonPath, JSON.stringify(payload, null, 2) + '\n')
await writeFile(
  outputTsPath,
  `export const iconAssets = ${JSON.stringify(payload, null, 2)} as const\n\nexport type IconAssets = typeof iconAssets\n`,
)
await writeFile(reportPath, report.join('\n'))

console.log(`Wrote ${path.relative(root, outputJsonPath)}`)
console.log(`Wrote ${path.relative(root, outputTsPath)}`)
console.log(`Wrote ${path.relative(root, reportPath)}`)
console.log(`Wrote ${path.relative(root, sourceSvgPath)}`)
for (const asset of assets) {
  console.log(`Wrote ${asset.sourcePath}`)
}
