import { expect, test, type Page } from '@playwright/test'
import { execFile } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const execFileAsync = (
  command: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
) =>
  new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        reject(Object.assign(error, { stdout, stderr }))
        return
      }

      resolve({ stdout, stderr })
    })
  })

const expectRunMoves = async (page: Page, moves: string) => {
  await expect(page.getByLabel('Current run moves').getByText(moves, { exact: true })).toBeVisible()
}

const clickSharedFirstBoardCell = async (page: Page) => {
  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return false
  }

  await page.mouse.click(box.x + (112 / 560) * box.width, box.y + (176 / 500) * box.height)
  return true
}

const runtimeHref = (value: string) => (value.startsWith('/') ? `.${value}` : value)

test('trend radar only boosts evidence-bearing public trend signals', async () => {
  const trend = JSON.parse(await readFile('data/trend-signals.json', 'utf8')) as {
    sourceStatus: {
      quality: {
        totalItems: number
        qualifiedItems: number
        ignoredGenericCategories: number
        rankingPolicy: string
      }
    }
    items: Array<{
      title: string
      signalQuality: { evidenceBearingSignals: number; ignoredGenericCategories: number }
      inferred: Record<
        'mechanics' | 'themes' | 'audiences',
        Array<{ name: string; evidence: { keywordMatches: number; categoryMatches: string[] } }>
      >
    }>
  }
  const readiness = JSON.parse(await readFile('data/trend-source-readiness.json', 'utf8')) as {
    quality: typeof trend.sourceStatus.quality
  }
  const evidenceFreeSignals = trend.items.flatMap((item) =>
    (['mechanics', 'themes', 'audiences'] as const).flatMap((fieldName) =>
      item.inferred[fieldName]
        .filter((signal) => signal.evidence.keywordMatches + signal.evidence.categoryMatches.length <= 0)
        .map((signal) => `${item.title}:${fieldName}:${signal.name}`),
    ),
  )

  expect(trend.sourceStatus.quality.totalItems).toBe(trend.items.length)
  expect(trend.sourceStatus.quality.qualifiedItems).toBeGreaterThan(0)
  expect(trend.sourceStatus.quality.qualifiedItems).toBeLessThanOrEqual(trend.items.length)
  expect(trend.sourceStatus.quality.ignoredGenericCategories).toBeGreaterThan(0)
  expect(trend.sourceStatus.quality.rankingPolicy).toBe(
    'rank only boosts items with explicit keyword or category evidence',
  )
  expect(readiness.quality).toEqual(trend.sourceStatus.quality)
  expect(evidenceFreeSignals).toEqual([])
  expect(trend.items.some((item) => item.signalQuality.evidenceBearingSignals === 0)).toBe(true)
})

test('event smoke fixtures follow the generated game roster', async () => {
  const generatedPlayable = JSON.parse(await readFile('data/generated-playable-games.json', 'utf8')) as {
    games: Array<{ id: string; title: string }>
  }
  const eventCollectorSmoke = JSON.parse(await readFile('data/event-collector-smoke.json', 'utf8')) as {
    fixture: { sourceFile: string; gameId: string; title: string }
  }
  const eventIngestSmoke = JSON.parse(await readFile('data/event-ingest-smoke.json', 'utf8')) as {
    fixture: { gameSourceFile: string; gameId: string; title: string }
  }
  const smokeGame = generatedPlayable.games.find((game) => game.id === eventIngestSmoke.fixture.gameId)

  expect(smokeGame).toBeDefined()
  expect(eventCollectorSmoke.fixture).toMatchObject({
    sourceFile: 'data/generated-playable-games.json',
    gameId: eventIngestSmoke.fixture.gameId,
    title: smokeGame?.title,
  })
  expect(eventIngestSmoke.fixture).toMatchObject({
    gameSourceFile: 'data/generated-playable-games.json',
    title: smokeGame?.title,
  })
})

test('portal loads a playable canvas and autonomy cockpit', async ({ page }) => {
  const ownerLoop = JSON.parse(await readFile('data/autonomous-owner-loop.json', 'utf8')) as {
    mode: string
    ownerDecision: { nextBestActionId: string }
  }
  const objectiveAudit = JSON.parse(await readFile('data/objective-audit.json', 'utf8')) as {
    completion: { nextBestAction: string }
    controls: { productionBootstrapFresh?: boolean }
  }
  const storeListingOptimizer = JSON.parse(await readFile('data/store-listing-optimizer.json', 'utf8')) as {
    recommendation: { title: string }
  }
  const retention = JSON.parse(await readFile('data/retention-loop.json', 'utf8')) as {
    dailyChallenge: { title: string }
  }

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Original board-game-inspired/i })).toBeVisible()
  await expect(page.getByLabel('Autonomy cockpit')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Generated Prototype Queue' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Lantern Relay' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Owner Loop' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Release Health' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Portfolio Policy' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Experiment Learning' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Production Response' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Balance Lab' })).toBeVisible()
  await page.getByRole('heading', { name: 'Monetization Path' }).scrollIntoViewIfNeeded()
  await expect(page.getByText('promotable-internal')).toBeVisible()
  await expect(page.getByText('ready-for-pages')).toBeVisible()
  await expect(page.getByText('blocked-by-product-gates')).toBeVisible()
  await expect(page.getByText('Spend guard')).toBeVisible()
  await expect(page.getByText('no-spend')).toBeVisible()
  await expect(page.getByText('Paid acquisition')).toBeVisible()
  await expect(page.getByText('guarded-operations')).toBeVisible()
  await expect(page.getByText('Incident drill')).toBeVisible()
  await expect(page.getByText('verified', { exact: true })).toBeVisible()
  await expect(page.getByText('Native package')).toBeVisible()
  await expect(page.getByText('blocked-draft-ready')).toBeVisible()
  await expect(page.getByText('Android release')).toBeVisible()
  await expect(page.getByText('blocked-needs-host-signing-play')).toBeVisible()
  await expect(page.getByLabel('Store Compliance')).toContainText('draft-ready-external-blockers')
  await expect(page.getByLabel('Store Compliance')).toContainText('Everyone')
  await expect(page.getByLabel('Store Compliance')).toContainText('ads-disabled')
  await expect(page.getByLabel('Store Listing Optimizer')).toContainText('store-listing-optimizer-ready')
  await expect(page.getByLabel('Store Listing Optimizer')).toContainText(storeListingOptimizer.recommendation.title)
  await expect(page.getByText('Asset links')).toBeVisible()
  await expect(page.getByLabel('Android Signing')).toContainText('signing-prepared')
  await expect(page.getByLabel('Android Signing')).toContainText('ignored-local')
  await expect(page.getByText('Environment')).toBeVisible()
  await expect(page.getByText('production-env-missing')).toBeVisible()
  await expect(page.getByText('owner-loop-ready')).toBeVisible()
  await expect(page.getByText(ownerLoop.mode)).toBeVisible()
  await expect(page.getByText(ownerLoop.ownerDecision.nextBestActionId).first()).toBeVisible()
  await expect(page.getByLabel('Performance Budget')).toContainText('performance-budget-ready')
  await expect(page.getByLabel('Performance Budget')).toContainText('Initial JS')
  await expect(page.getByLabel('Live Site Monitor')).toContainText(
    /live-site-monitor-passed|live-site-monitor-planned|live-site-monitor-alert/,
  )
  await expect(page.getByLabel('Live Site Monitor')).toContainText('Checks')
  await expect(page.getByLabel('Live Site Monitor')).toContainText(/matched|review/)
  await expect(page.getByLabel('Production Bootstrap')).toContainText('production-bootstrap-ready')
  await expect(page.getByLabel('Production Bootstrap')).toContainText('External blockers')
  await expect(page.getByLabel('Production Blocker Handoff')).toContainText(/handoff-waiting-on-owner-inputs|handoff-clear/)
  await expect(page.getByLabel('Production Blocker Handoff')).toContainText('Next unlock')
  await expect(page.getByLabel('Production Activation')).toContainText(/activation-waiting-for-credentials|activation-ready|activation-applied/)
  await expect(page.getByLabel('Production Activation')).toContainText(/dry-run|apply-configured-actions/)
  await expect(page.getByLabel('Support Channel')).toContainText(/support-channel-ready|support-channel-planned/)
  await expect(page.getByLabel('Support Channel')).toContainText('github-issues')
  await expect(page.getByLabel('Support Feedback')).toContainText(/support-feedback-ready|support-feedback-empty|support-feedback-planned/)
  await expect(page.getByLabel('Support Feedback')).toContainText('Issues inspected')
  await expect(page.getByLabel('Repository Channel')).toContainText(/blocked-no-local-git|waiting-for-gh-auth|repository-channel-ready|waiting-for-github-repository|waiting-for-repository-channel/)
  await expect(page.getByLabel('Repository Channel')).toContainText('Workflow dispatch')
  await expect(page.getByLabel('Repository Bootstrap')).toContainText(/needs-local-git-bootstrap|waiting-for-github-target|waiting-for-origin-remote|waiting-for-gh-auth|repository-bootstrap-ready/)
  await expect(page.getByLabel('Repository Bootstrap')).toContainText('bootstrap-repository.sh')
  await expect(page.getByLabel('Autonomous Operator')).toContainText(/operator-plan-ready|operator-executed|operator-held/)
  await expect(page.getByLabel('Autonomous Operator')).toContainText('Selected action')
  await expect(page.getByLabel('Operator History')).toContainText('operator-history-ready')
  await expect(page.getByLabel('Autonomous Cadence')).toContainText('cadence-ready')
  await expect(page.getByLabel('Autonomous Cadence')).toContainText('autonomous:operate')
  await expect(page.getByLabel('Autonomous Self Update')).toContainText('self-update-ready')
  await expect(page.getByLabel('Autonomous Self Update')).toContainText('autonomous-self-update.yml')
  await expect(page.getByLabel('Operator History')).toContainText('Records')
  await expect(page.getByLabel('Objective Audit')).toContainText('objective-in-progress')
  await expect(page.getByLabel('Objective Audit')).toContainText('Can complete')
  await expect(page.getByLabel('Objective Audit')).toContainText('Next action')
  await expect(page.getByLabel('Objective Audit')).toContainText(objectiveAudit.completion.nextBestAction)
  if (objectiveAudit.controls.productionBootstrapFresh) {
    expect(objectiveAudit.completion.nextBestAction).not.toBe('bootstrap-production-setup')
  }
  await expect(page.getByLabel('Product Optimization')).toContainText('product-optimization-ready')
  await expect(page.getByLabel('Product Optimization')).toContainText('Completion gate')
  await expect(page.getByLabel('First Move Coach')).toContainText('first-move-coach-ready')
  await expect(page.getByLabel('First Move Coach')).toContainText('first-turn-only')
  await expect(page.getByLabel('Completion Loop')).toContainText('completion-loop-ready')
  await expect(page.getByLabel('Completion Loop')).toContainText('Completion gate')
  await expect(page.getByLabel('Replay Loop')).toContainText('replay-loop-ready')
  await expect(page.getByLabel('Replay Loop')).toContainText('Replay gate')
  await expect(page.getByLabel('Traffic Seeding')).toContainText('traffic-seeding-ready')
  await expect(page.getByLabel('Traffic Seeding')).toContainText('Seed campaigns')
  await expect(page.getByLabel('Organic Seed Loop')).toContainText('organic-seed-loop-ready')
  await expect(page.getByLabel('Acquisition Learning')).toContainText('acquisition-learning-ready')
  await expect(page.getByLabel('Daily Retention')).toContainText('retention-loop-ready')
  await expect(page.getByLabel('Daily Retention')).toContainText(retention.dailyChallenge.title)
  await expect(page.getByLabel('Daily Retention')).toContainText('Return intent')
  await expect(page.getByLabel('PWA Install Loop')).toContainText('pwa-install-loop-ready')
  await expect(page.getByLabel('Local Learning Router')).toContainText('local-play-router')
  await expect(page.getByLabel('Local Learning Router')).toContainText('Next route')
  await expect(page.getByLabel('Revenue runtime')).toContainText('guarded-disabled')

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()

  const sample = await canvas.evaluate((node) => {
    const canvasNode = node as HTMLCanvasElement
    const context = canvasNode.getContext('2d')
    if (!context) {
      return 0
    }
    const data = context.getImageData(0, 0, canvasNode.width, canvasNode.height).data
    let painted = 0

    for (let index = 3; index < data.length; index += 40) {
      if (data[index] > 0) {
        painted += 1
      }
    }

    return painted
  })

  expect(sample).toBeGreaterThan(100)
})

test('thumbnail board-state experiment reaches cards and start telemetry', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('agl.experiment.first_session_pacing', 'fast-start')
    window.localStorage.setItem('agl.experiment.reward_offer', 'daily-streak')
    window.localStorage.setItem('agl.experiment.thumbnail_board_state_v2', 'board-state')
  })

  await page.goto('/?game=harbor-rings')

  await expect(page.locator('.gameCard[data-thumbnail-variant="board-state"]').first()).toBeVisible()
  await expect(page.locator('.gameArtBoardState').first()).toBeVisible()
  await expect(page.locator('canvas').first()).toBeVisible()

  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem('agl.analytics.events')
        const events = raw ? JSON.parse(raw) : []
        return (
          events.find(
            (event: { name: string; properties: { gameId?: string; thumbnailVariantId?: string } }) =>
              event.name === 'game_viewed' && event.properties.gameId === 'harbor-rings',
          )?.properties.thumbnailVariantId ?? null
        )
      }),
    )
    .toBe('board-state')

  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem('agl.analytics.events')
        const events = raw ? JSON.parse(raw) : []
        return (
          events.find(
            (event: { name: string; properties: { gameId?: string; thumbnailVariantId?: string } }) =>
              event.name === 'game_started' && event.properties.gameId === 'harbor-rings',
          )?.properties.thumbnailVariantId ?? null
        )
      }),
    )
    .toBe('board-state')
})

test('local learning router routes players to the next zero-spend evidence action', async ({ page }) => {
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    missions: Array<{
      title: string
      gameId: string
      gateId: string
      campaignId: string
      label: string
      needed: { successes: number }
    }>
    summary: { fastestGateId: string; defaultRouteCampaignId: string }
  }
  const primaryMission = samplePlan.missions[0]
  const fastestMission =
    samplePlan.missions.find((mission) => mission.gateId === samplePlan.summary.fastestGateId) ??
    primaryMission
  const routedMission =
    samplePlan.missions.find((mission) => mission.campaignId === samplePlan.summary.defaultRouteCampaignId) ??
    primaryMission
  const routedIsFastest =
    routedMission.campaignId === fastestMission.campaignId &&
    routedMission.campaignId !== primaryMission.campaignId
  const routedIsPrimary = routedMission.campaignId === primaryMission.campaignId
  const routedLabel =
    routedIsFastest ? 'Fastest gate sample' : routedIsPrimary ? 'First finish sample' : 'Default gate sample'
  const routedReason =
    routedIsFastest
      ? `${routedMission.label} needs the fewest real successes before revenue gates can move.`
      : routedIsPrimary
        ? 'First-game completion is the largest revenue-blocking gap.'
        : `${routedMission.label} is the default same-session sample route.`
  const routedCta = routedIsFastest ? 'Start fastest sample' : 'Start measured run'
  const routedRecommendationId =
    routedIsFastest ? 'fastest-gate-sample' : routedIsPrimary ? 'first-completion-sample' : 'default-gate-sample'

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.localStorage.setItem('agl.test.clipboard', text)
        },
      },
    })
  })

  await page.goto('/')

  const router = page.getByLabel('Local Learning Router')
  await expect(router).toContainText('local-play-router')
  await expect(router).toContainText(routedLabel)
  await expect(router).toContainText(routedReason)

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem('agl.analytics.events')
        const events = raw ? JSON.parse(raw) : []
        return events.some((event: { name: string }) => event.name === 'local_router_card_viewed')
      }),
    )
    .toBe(true)

  await router.getByRole('button', { name: 'Share route' }).click()

  const shareState = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return {
      clipboard: window.localStorage.getItem('agl.test.clipboard') ?? '',
      events: raw ? JSON.parse(raw) : [],
    }
  })
  const routerShare = shareState.events.findLast(
    (event: { name: string }) => event.name === 'local_router_share_clicked',
  )
  const sampleShare = shareState.events.findLast(
    (event: { name: string; properties: Record<string, string | boolean> }) =>
      event.name === 'share_clicked' && event.properties.campaignId === routedMission.campaignId,
  )

  expect(shareState.clipboard).toContain(routedMission.campaignId)
  expect(routerShare?.properties).toMatchObject({
    recommendationId: routedRecommendationId,
    actionType: 'gate-sample',
    gameId: routedMission.gameId,
    campaignId: routedMission.campaignId,
    gateId: routedMission.gateId,
    zeroPaidSpend: true,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
  })
  expect(sampleShare?.properties).toMatchObject({
    campaignId: routedMission.campaignId,
    gateId: routedMission.gateId,
    channel: 'product-gate-sample',
    zeroPaidSpend: true,
    noPaidTraffic: true,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
    succeeded: true,
  })

  await router.getByRole('button', { name: routedCta }).click()
  await expect(page.getByLabel('Autonomy cockpit')).toContainText(routedMission.title)

  const routedUrl = new URL(page.url())
  expect(routedUrl.searchParams.get('game')).toBe(routedMission.gameId)
  expect(routedUrl.searchParams.get('utm_source')).toBe('gate_sample')
  expect(routedUrl.searchParams.get('utm_campaign')).toBe(routedMission.campaignId)

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const routerChoice = events.findLast(
    (event: { name: string }) => event.name === 'local_router_choice_clicked',
  )

  expect(routerChoice?.properties).toMatchObject({
    recommendationId: routedRecommendationId,
    actionType: 'gate-sample',
    gameId: routedMission.gameId,
    campaignId: routedMission.campaignId,
    gateId: routedMission.gateId,
    zeroPaidSpend: true,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
    acquisitionCampaign: routedMission.campaignId,
    acquisitionSource: 'gate_sample',
    acquisitionChannel: 'product-gate-sample',
  })
})

test('organic seed loop records player-initiated seed and share telemetry', async ({ page }) => {
  const loop = JSON.parse(await readFile('data/organic-seed-loop.json', 'utf8')) as {
    status: string
    target: { campaignId: string; gameId: string; title: string }
    runtimeSurface: {
      surface: string
      primaryCtaLabel: string
      secondaryCtaLabel: string
      telemetry: { viewed: string; shared: string; opened: string; share: string }
    }
    runtimeProgressPolicy: {
      status: string
      storageKey: string
      exportSurface: string
      exportProperties: string[]
    }
  }
  const traffic = JSON.parse(await readFile('data/traffic-seeding.json', 'utf8')) as {
    campaigns: Array<{ id: string; gameId: string; title: string }>
  }
  const nextRuntimeCampaign =
    traffic.campaigns.find((campaign) => campaign.id !== loop.target.campaignId) ??
    traffic.campaigns[0]

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          ;(window as unknown as { __lastClipboardWrite?: string }).__lastClipboardWrite = text
          return Promise.resolve()
        },
      },
    })
  })
  await page.goto('/')

  const seedPanel = page.getByLabel('Organic Seed Loop')
  await expect(seedPanel).toContainText(loop.status)
  await expect(seedPanel).toContainText(loop.target.title)
  await expect(seedPanel).toContainText('Local sample')
  await expect(seedPanel).toContainText('Runtime pick')
  await expect(seedPanel).toContainText('Export state')
  expect(loop.runtimeProgressPolicy.status).toBe('active')
  expect(loop.runtimeProgressPolicy.storageKey).toBe('agl.analytics.events')
  expect(loop.runtimeProgressPolicy.exportSurface).toBe('organic-seed-campaign')
  expect(loop.runtimeProgressPolicy.exportProperties).toContain('localStartsRemaining')
  expect(loop.runtimeProgressPolicy.exportProperties).toContain('localSampleDecisionReady')
  await seedPanel.getByRole('button', { name: loop.runtimeSurface.primaryCtaLabel }).click()
  await expect(page.getByLabel('Autonomy cockpit')).toContainText(loop.target.title)
  const openedSeedUrl = new URL(page.url())
  expect(openedSeedUrl.searchParams.get('game')).toBe(loop.target.gameId)
  expect(openedSeedUrl.searchParams.get('utm_source')).toBe('seed_internal')
  expect(openedSeedUrl.searchParams.get('utm_campaign')).toBe(loop.target.campaignId)
  await expect(seedPanel).toContainText(nextRuntimeCampaign.title)
  await seedPanel.getByRole('button', { name: loop.runtimeSurface.secondaryCtaLabel }).click()

  const copiedShareUrl = await page.evaluate(
    () => (window as unknown as { __lastClipboardWrite?: string }).__lastClipboardWrite ?? '',
  )
  const copiedShare = new URL(copiedShareUrl, page.url())
  expect(copiedShare.protocol).toMatch(/^https?:$/)
  expect(copiedShare.hostname).not.toBe('autonomous-game-lab.example.com')
  expect(copiedShare.searchParams.get('game')).toBe(nextRuntimeCampaign.gameId)
  expect(copiedShare.searchParams.get('utm_source')).toBe('seed_share')
  expect(copiedShare.searchParams.get('utm_campaign')).toBe(nextRuntimeCampaign.id)

  await expect
    .poll(async () =>
      page.evaluate((eventName) => {
        const raw = window.localStorage.getItem('agl.analytics.events')
        const events = raw ? JSON.parse(raw) : []
        return events.some((event: { name: string }) => event.name === eventName)
      }, loop.runtimeSurface.telemetry.shared),
    )
    .toBe(true)

  await expect(seedPanel).toContainText('local-balanced')

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const viewedCampaignIds = events
    .filter((event: { name: string }) => event.name === loop.runtimeSurface.telemetry.viewed)
    .map((event: { properties: Record<string, string> }) => event.properties.campaignId)
  const opened = events.findLast((event: { name: string }) => event.name === loop.runtimeSurface.telemetry.opened)
  const shared = events.findLast((event: { name: string }) => event.name === loop.runtimeSurface.telemetry.shared)
  const share = events.findLast((event: { name: string }) => event.name === loop.runtimeSurface.telemetry.share)

  expect(viewedCampaignIds).toContain(loop.target.campaignId)
  expect(viewedCampaignIds).toContain(nextRuntimeCampaign.id)
  expect(opened.properties.campaignId).toBe(loop.target.campaignId)
  expect(opened.properties.gameId).toBe(loop.target.gameId)
  expect(shared.properties.campaignId).toBe(nextRuntimeCampaign.id)
  expect(shared.properties.channel).toBe('player-share')
  expect(share.properties.seeded).toBe(true)

  const downloadPromise = page.waitForEvent('download')
  await page
    .getByLabel('Traffic Seeding')
    .getByRole('button', { name: `Export evidence for ${nextRuntimeCampaign.title}` })
    .click()
  const download = await downloadPromise
  const downloadPath = await download.path()

  expect(download.suggestedFilename()).toMatch(/^player-events-\d{4}-\d{2}-\d{2}\.json$/)
  expect(downloadPath).toBeTruthy()

  if (downloadPath) {
    const exportedEvents = JSON.parse(await readFile(downloadPath, 'utf8')) as Array<{
      name: string
      properties: Record<string, string | number | boolean>
    }>
    const exportEvent = exportedEvents.findLast(
      (event) =>
        event.name === 'analytics_exported' &&
        event.properties.exportSurface === loop.runtimeProgressPolicy.exportSurface,
    )

    expect(exportEvent?.properties).toMatchObject({
      gameId: nextRuntimeCampaign.gameId,
      campaignId: nextRuntimeCampaign.id,
      exportSurface: loop.runtimeProgressPolicy.exportSurface,
      noPaidPromotion: true,
      costUsd: 0,
      localEvidenceDropReady: true,
      acquisitionCampaign: nextRuntimeCampaign.id,
      acquisitionSource: 'seed_share',
      acquisitionChannel: 'player-share',
    })
    expect(Number(exportEvent?.properties.localCampaignEvents ?? 0)).toBeGreaterThanOrEqual(3)
    expect(Number(exportEvent?.properties.localShareActions ?? 0)).toBeGreaterThanOrEqual(1)
    expect(Number(exportEvent?.properties.localStartsRemaining ?? -1)).toBeGreaterThanOrEqual(0)
  }
})

test('PWA install loop records browser prompt telemetry', async ({ page }) => {
  const installLoop = JSON.parse(await readFile('data/pwa-install-loop.json', 'utf8')) as {
    samplePolicy: {
      status: string
      needed: { promptViews: number; launchModes: number }
      controls: { zeroPaidSpend: boolean; noSyntheticInstalls: boolean; noStoreSubmission: boolean }
    }
  }

  await page.goto('/')

  const panel = page.getByLabel('PWA Install Loop')
  await expect(panel).toContainText('pwa-install-loop-ready')
  await expect(panel).toContainText(installLoop.samplePolicy.status)
  await expect(panel).toContainText(
    `${installLoop.samplePolicy.needed.promptViews} prompts / ${installLoop.samplePolicy.needed.launchModes} launches`,
  )
  expect(installLoop.samplePolicy.controls.zeroPaidSpend).toBe(true)
  expect(installLoop.samplePolicy.controls.noSyntheticInstalls).toBe(true)
  expect(installLoop.samplePolicy.controls.noStoreSubmission).toBe(true)
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted'; platform: string }>
    }
    event.prompt = () => Promise.resolve()
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
    window.dispatchEvent(event)
  })

  await expect(page.getByRole('button', { name: 'Install app' })).toBeEnabled()
  await page.getByRole('button', { name: 'Install app' }).click()

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const available = events.findLast(
    (event: { name: string }) => event.name === 'pwa_install_prompt_available',
  )
  const viewed = events.findLast((event: { name: string }) => event.name === 'pwa_install_prompt_viewed')
  const clicked = events.findLast((event: { name: string }) => event.name === 'pwa_install_prompt_clicked')
  const accepted = events.findLast((event: { name: string }) => event.name === 'pwa_install_prompt_accepted')
  const launch = events.findLast((event: { name: string }) => event.name === 'pwa_launch_mode_detected')

  expect(available.properties.cooldownActive).toBe(false)
  expect(viewed.properties.surface).toBe('autonomy-cockpit')
  expect(clicked.properties.nativePromptAvailable).toBe(true)
  expect(accepted.properties.outcome).toBe('accepted')
  expect(launch.properties.displayMode).toBeTruthy()
})

test('PWA install loop respects dismissal cooldown before surfacing prompt', async ({ page }) => {
  const installLoop = JSON.parse(await readFile('data/pwa-install-loop.json', 'utf8')) as {
    localState: { dismissalKey: string }
    promptPolicy: { cooldownDaysAfterDismissal: number }
  }

  await page.addInitScript((dismissalKey) => {
    window.localStorage.setItem(dismissalKey, new Date().toISOString())
  }, installLoop.localState.dismissalKey)
  await page.goto('/')

  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted'; platform: string }>
    }
    event.prompt = () => {
      ;(window as unknown as { __pwaPromptCalled?: boolean }).__pwaPromptCalled = true
      return Promise.resolve()
    }
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
    window.dispatchEvent(event)
  })

  const panel = page.getByLabel('PWA Install Loop')
  await expect(panel).toContainText('cooldown')
  await expect(panel.getByRole('button', { name: 'Install cooling down' })).toBeDisabled()

  const result = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return {
      promptCalled: (window as unknown as { __pwaPromptCalled?: boolean }).__pwaPromptCalled ?? false,
      available: events.findLast(
        (event: { name: string }) => event.name === 'pwa_install_prompt_available',
      ),
      cooldown: events.findLast(
        (event: { name: string }) => event.name === 'pwa_install_prompt_cooldown',
      ),
      viewed: events.findLast((event: { name: string }) => event.name === 'pwa_install_prompt_viewed'),
    }
  })

  expect(result.promptCalled).toBe(false)
  expect(result.available.properties.cooldownActive).toBe(true)
  expect(result.cooldown.properties.cooldownDays).toBe(
    installLoop.promptPolicy.cooldownDaysAfterDismissal,
  )
  expect(result.viewed).toBeUndefined()
})

test('generated PWA install page routes attributed install traffic into the app', async ({ page }) => {
  const installLoop = JSON.parse(await readFile('data/pwa-install-loop.json', 'utf8')) as {
    publicInstallPage: {
      path: string
      campaignId: string
      playPath: string
      priorityGameId: string | null
      zeroPaidSpend: boolean
      localAnalyticsEvents: boolean
      localAnalyticsStorageKey: string
      playerInitiatedOnly: boolean
      browserPromptControlled: boolean
    }
    samplePolicy: {
      needed: { promptViews: number; launchModes: number }
      controls: { zeroPaidSpend: boolean; noSyntheticInstalls: boolean }
    }
  }

  await page.goto(installLoop.publicInstallPage.path)

  await expect(page.getByRole('heading', { name: 'Autonomous Game Lab Install' })).toBeVisible()
  await expect(page.getByText('$0.00')).toBeVisible()
  await expect(page.getByText('Sample target')).toBeVisible()
  await expect(
    page.getByText(
      `${installLoop.samplePolicy.needed.promptViews} prompts / ${installLoop.samplePolicy.needed.launchModes} launches`,
    ),
  ).toBeVisible()
  await expect(page.locator('[data-channel-id="pwa-install"]')).toHaveAttribute(
    'data-campaign-id',
    installLoop.publicInstallPage.campaignId,
  )
  await expect(page.locator('[data-channel-id="pwa-install"]')).toHaveAttribute(
    'data-game-id',
    installLoop.publicInstallPage.priorityGameId ?? '',
  )
  await expect(page.locator('[data-channel-id="pwa-install"]')).toHaveAttribute(
    'data-play-path',
    installLoop.publicInstallPage.playPath,
  )
  await expect(page.locator('[data-channel-id="pwa-install"]')).toHaveAttribute(
    'data-local-analytics',
    'true',
  )
  await expect(page.locator('[data-channel-id="pwa-install"]')).toHaveAttribute(
    'data-storage-key',
    installLoop.publicInstallPage.localAnalyticsStorageKey,
  )
  await expect(page.getByRole('link', { name: 'Open app' })).toHaveAttribute(
    'href',
    `.${installLoop.publicInstallPage.playPath}`,
  )
  expect(installLoop.publicInstallPage.zeroPaidSpend).toBe(true)
  expect(installLoop.publicInstallPage.localAnalyticsEvents).toBe(true)
  expect(installLoop.publicInstallPage.localAnalyticsStorageKey).toBe('agl.analytics.events')
  expect(installLoop.publicInstallPage.playerInitiatedOnly).toBe(true)
  expect(installLoop.publicInstallPage.browserPromptControlled).toBe(true)
  expect(installLoop.samplePolicy.controls.zeroPaidSpend).toBe(true)
  expect(installLoop.samplePolicy.controls.noSyntheticInstalls).toBe(true)
  expect(await page.content()).not.toContain('autonomous-game-lab.example.com')

  const installPageTelemetry = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return {
      pageView: events.findLast(
        (event: { name: string }) => event.name === 'pwa_install_page_viewed',
      ),
      openClicked: events.findLast(
        (event: { name: string }) => event.name === 'pwa_install_open_clicked',
      ),
    }
  })

  expect(installPageTelemetry.pageView.properties.surface).toBe('install-page')
  expect(installPageTelemetry.pageView.properties.playerInitiated).toBe(false)
  expect(installPageTelemetry.pageView.properties.zeroPaidSpend).toBe(true)
  expect(installPageTelemetry.pageView.properties.acquisitionSource).toBe('pwa_install')
  expect(installPageTelemetry.pageView.properties.acquisitionCampaign).toBe(
    installLoop.publicInstallPage.campaignId,
  )
  expect(installPageTelemetry.pageView.properties.acquisitionChannel).toBe('pwa-install')
  expect(installPageTelemetry.pageView.properties.gameId).toBe(
    installLoop.publicInstallPage.priorityGameId ?? 'portal',
  )
  expect(installPageTelemetry.openClicked).toBeUndefined()

  await Promise.all([
    page.waitForURL(
      (url) => url.searchParams.get('utm_campaign') === installLoop.publicInstallPage.campaignId,
    ),
    page.getByRole('link', { name: 'Open app' }).click(),
  ])

  const installOpenTelemetry = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return events.findLast((event: { name: string }) => event.name === 'pwa_install_open_clicked')
  })

  expect(installOpenTelemetry.properties.surface).toBe('install-page')
  expect(installOpenTelemetry.properties.playerInitiated).toBe(true)
  expect(installOpenTelemetry.properties.zeroPaidSpend).toBe(true)
  expect(installOpenTelemetry.properties.acquisitionCampaign).toBe(
    installLoop.publicInstallPage.campaignId,
  )

  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted'; platform: string }>
    }
    event.prompt = () => Promise.resolve()
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
    window.dispatchEvent(event)
  })
  await page.getByRole('button', { name: 'Install app' }).click()

  const clicked = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return events.findLast((event: { name: string }) => event.name === 'pwa_install_prompt_clicked')
  })

  expect(clicked.properties.acquisitionSource).toBe('pwa_install')
  expect(clicked.properties.acquisitionCampaign).toBe(installLoop.publicInstallPage.campaignId)
  expect(clicked.properties.acquisitionChannel).toBe('pwa-install')
  expect(clicked.properties.acquisitionGameId).toBe(
    installLoop.publicInstallPage.priorityGameId ?? 'portal',
  )
})

test('reset run records replay telemetry for the product optimizer', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Reset run' }).click()
  await page.waitForLoadState('domcontentloaded')

  const replayEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'replay_clicked')
  })

  expect(replayEvent.properties.surface).toBe('topbar-reset')
  expect(replayEvent.properties.gameId).toBeTruthy()
})

test('mid-run completion nudge records checkpoint telemetry without changing the rules', async ({
  page,
}) => {
  const completion = JSON.parse(await readFile('data/completion-loop.json', 'utf8')) as {
    localState: { acceptedRunKey: string }
    metrics: { promptViews: number; promptClicks: number; promptDismissals: number }
    samplePolicy: {
      status: string
      prompt: {
        minimumViewsForDecision: number
        minimumDecisionsForDecision: number
        needed: { views: number; decisions: number }
      }
      telemetry: { promptViewed: string; promptClicked: string; abandoned: string }
    }
    decisionPolicy: { currentDecision: string; fallbackWhenSampleSmall: string }
    controls: { noDecisionWithoutSample: boolean; requireRunIdOnAbandonment: boolean }
    promptPolicy: { ctaLabel: string; surface: string; triggerMove: number }
  }

  expect(completion.metrics).toMatchObject({ promptViews: 0, promptClicks: 0, promptDismissals: 0 })
  expect(completion.samplePolicy.status).toBe('collecting-sample')
  expect(completion.samplePolicy.prompt.minimumViewsForDecision).toBe(30)
  expect(completion.samplePolicy.prompt.minimumDecisionsForDecision).toBe(20)
  expect(completion.samplePolicy.prompt.needed).toMatchObject({ views: 30, decisions: 20 })
  expect(completion.samplePolicy.telemetry).toMatchObject({
    promptViewed: 'completion_nudge_viewed',
    promptClicked: 'completion_nudge_clicked',
    abandoned: 'game_abandoned',
  })
  expect(completion.decisionPolicy.currentDecision).toBe('collect-sample')
  expect(completion.decisionPolicy.fallbackWhenSampleSmall).toBe(
    'collect-more-real-completion-events',
  )
  expect(completion.controls.noDecisionWithoutSample).toBe(true)
  expect(completion.controls.requireRunIdOnAbandonment).toBe(true)

  await page.addInitScript(() => {
    window.localStorage.setItem('agl.experiment.first_session_pacing', 'fast-start')
  })
  await page.goto('/?game=harbor-rings')
  const cockpit = page.getByLabel('Autonomy cockpit')
  await expect(cockpit.getByRole('heading', { name: 'Harbor Rings' })).toBeVisible()

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  const cells = [
    [2, 2],
    [2, 1],
    [2, 3],
  ]
  const harborCellSize = 64
  const harborGap = 7
  const harborStartX = 106
  const harborStartY = 132
  const turnCount = () =>
    page.evaluate(() => {
      const raw = window.localStorage.getItem('agl.analytics.events')
      const events = raw ? JSON.parse(raw) : []
      return events.filter((event: { name: string }) => event.name === 'turn_taken').length
    })

  for (const [index, [row, col]] of cells.slice(0, completion.promptPolicy.triggerMove).entries()) {
    const x = harborStartX + col * (harborCellSize + harborGap) + harborCellSize / 2
    const y = harborStartY + row * (harborCellSize + harborGap) + harborCellSize / 2
    const targetMove = index + 1

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.mouse.click(box.x + (x / 560) * box.width, box.y + (y / 500) * box.height)

      if ((await turnCount()) >= targetMove) {
        break
      }

      await page.waitForTimeout(50)
    }

    await expect.poll(turnCount).toBe(targetMove)
  }

  const completionPanel = page.getByLabel('Completion Loop')
  await expect(completionPanel).toContainText('Nudge sample')
  await expect(completionPanel).toContainText(completion.decisionPolicy.currentDecision)
  await expect(completionPanel).toContainText('Progress nudge')
  await completionPanel.getByRole('button', { name: completion.promptPolicy.ctaLabel }).click()

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const viewed = events.findLast((event: { name: string }) => event.name === 'completion_nudge_viewed')
  const clicked = events.findLast((event: { name: string }) => event.name === 'completion_nudge_clicked')
  const acceptedRunKey = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    completion.localState.acceptedRunKey,
  )

  expect(viewed.properties.surface).toBe(completion.promptPolicy.surface)
  expect(viewed.properties.moves).toBe(completion.promptPolicy.triggerMove)
  expect(clicked.properties.surface).toBe(completion.promptPolicy.surface)
  expect(clicked.properties.gameId).toBe('harbor-rings')
  expect(acceptedRunKey).toBeTruthy()

  await page.getByLabel('Playable games').getByRole('button', { name: /Lantern Relay/ }).click()
  await expect(page.getByLabel('Autonomy cockpit').getByRole('heading', { name: 'Lantern Relay' })).toBeVisible()
  const abandoned = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const nextEvents = raw ? JSON.parse(raw) : []
    return nextEvents.findLast((event: { name: string }) => event.name === 'game_abandoned')
  })

  expect(abandoned.properties.gameId).toBe('harbor-rings')
  expect(abandoned.properties.runId).toBeTruthy()
  expect(abandoned.properties.moves).toBe(completion.promptPolicy.triggerMove)
  expect(abandoned.properties.maxMoves).toBeGreaterThanOrEqual(completion.promptPolicy.triggerMove)
})

test('finish-line coach shows target pace for behind runs and records telemetry', async ({ page }) => {
  const completion = JSON.parse(await readFile('data/completion-loop.json', 'utf8')) as {
    localState: { finishLineAcceptedRunKey: string }
    samplePolicy: {
      finishLine: {
        minimumViewsForDecision: number
        minimumDecisionsForDecision: number
        needed: { views: number; decisions: number }
      }
      telemetry: { finishLineViewed: string; finishLineClicked: string }
    }
    finishLinePolicy: { ctaLabel: string; surface: string; triggerMove: number }
  }

  expect(completion.samplePolicy.finishLine.minimumViewsForDecision).toBe(20)
  expect(completion.samplePolicy.finishLine.minimumDecisionsForDecision).toBe(12)
  expect(completion.samplePolicy.finishLine.needed).toMatchObject({ views: 20, decisions: 12 })
  expect(completion.samplePolicy.telemetry).toMatchObject({
    finishLineViewed: 'finish_line_coach_viewed',
    finishLineClicked: 'finish_line_coach_clicked',
  })

  await page.addInitScript(() => {
    window.localStorage.setItem('agl.experiment.first_session_pacing', 'fast-start')
  })
  await page.goto('/?game=harbor-rings')

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  const harborCellSize = 64
  const harborGap = 7
  const harborStartX = 106
  const harborStartY = 132
  const cells = [
    [0, 0],
    [4, 4],
    [0, 4],
    [4, 0],
    [2, 0],
    [0, 2],
  ]
  const turnCount = () =>
    page.evaluate(() => {
      const raw = window.localStorage.getItem('agl.analytics.events')
      const events = raw ? JSON.parse(raw) : []
      return events.filter((event: { name: string }) => event.name === 'turn_taken').length
    })

  for (const [index, [row, col]] of cells.slice(0, completion.finishLinePolicy.triggerMove).entries()) {
    const x = harborStartX + col * (harborCellSize + harborGap) + harborCellSize / 2
    const y = harborStartY + row * (harborCellSize + harborGap) + harborCellSize / 2
    const targetMove = index + 1

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.mouse.click(box.x + (x / 560) * box.width, box.y + (y / 500) * box.height)

      if ((await turnCount()) >= targetMove) {
        break
      }

      await page.waitForTimeout(50)
    }

    await expect.poll(turnCount).toBe(targetMove)
  }

  const finishLinePanel = page.getByLabel('Completion Loop')
  await expect(finishLinePanel).toContainText('Finish line')
  await finishLinePanel.getByRole('button', { name: completion.finishLinePolicy.ctaLabel }).click()

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const viewed = events.findLast((event: { name: string }) => event.name === 'finish_line_coach_viewed')
  const clicked = events.findLast((event: { name: string }) => event.name === 'finish_line_coach_clicked')
  const acceptedRunKey = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    completion.localState.finishLineAcceptedRunKey,
  )

  expect(viewed.properties.surface).toBe(completion.finishLinePolicy.surface)
  expect(viewed.properties.remainingScore).toBeGreaterThan(0)
  expect(clicked.properties.surface).toBe(completion.finishLinePolicy.surface)
  expect(clicked.properties.gameId).toBe('harbor-rings')
  expect(acceptedRunKey).toBeTruthy()
})

test('completed-run replay prompt starts a fresh run and records replay-loop telemetry', async ({
  page,
}) => {
  const replayLoop = JSON.parse(await readFile('data/replay-loop.json', 'utf8')) as {
    metrics: { promptViews: number; promptClicks: number; promptDismissals: number }
    samplePolicy: {
      status: string
      minimumViewsForDecision: number
      minimumDecisionsForDecision: number
      current: { views: number; clicks: number; dismissals: number; decisions: number }
      needed: { views: number; decisions: number }
      telemetry: { viewed: string; clicked: string; dismissed: string; replay: string }
    }
    decisionPolicy: { currentDecision: string; fallbackWhenSampleSmall: string }
    controls: { noDecisionWithoutSample: boolean; requirePromptRunLink: boolean }
    promptPolicy: { ctaLabel: string; copy: string; surface: string; telemetry: { viewed: string; clicked: string } }
    rewardFraming: {
      status: string
      recommendedVariant: string
      confidence: number
      controls: { noPaidRewards: boolean; noAds: boolean; noRevenueEnablement: boolean }
    }
  }

  expect(replayLoop.metrics).toMatchObject({ promptViews: 0, promptClicks: 0, promptDismissals: 0 })
  expect(replayLoop.samplePolicy.status).toBe('collecting-sample')
  expect(replayLoop.samplePolicy.minimumViewsForDecision).toBe(30)
  expect(replayLoop.samplePolicy.minimumDecisionsForDecision).toBe(20)
  expect(replayLoop.samplePolicy.current).toMatchObject({ views: 0, clicks: 0, dismissals: 0, decisions: 0 })
  expect(replayLoop.samplePolicy.needed).toMatchObject({ views: 30, decisions: 20 })
  expect(replayLoop.samplePolicy.telemetry).toMatchObject({
    viewed: 'replay_prompt_viewed',
    clicked: 'replay_prompt_clicked',
    dismissed: 'replay_prompt_dismissed',
    replay: 'replay_clicked',
  })
  expect(replayLoop.decisionPolicy.currentDecision).toBe('collect-sample')
  expect(replayLoop.decisionPolicy.fallbackWhenSampleSmall).toBe(
    'collect-more-real-replay-prompt-events',
  )
  expect(replayLoop.controls.noDecisionWithoutSample).toBe(true)
  expect(replayLoop.controls.requirePromptRunLink).toBe(true)
  const balance = JSON.parse(await readFile('data/game-balance.json', 'utf8')) as {
    games: { 'harbor-rings': { maxMoves: number } }
  }
  const maxMoves = balance.games['harbor-rings'].maxMoves

  await page.addInitScript(() => {
    window.localStorage.setItem('agl.experiment.first_session_pacing', 'fast-start')
  })
  await page.goto('/?game=harbor-rings')
  const cockpit = page.getByLabel('Autonomy cockpit')
  await expect(cockpit.getByRole('heading', { name: 'Harbor Rings' })).toBeVisible()

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  const cells = [
    [2, 2],
    [2, 1],
    [2, 3],
    [1, 2],
    [3, 2],
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
    [0, 2],
    [0, 0],
    [0, 1],
  ]
  const harborCellSize = 64
  const harborGap = 7
  const harborStartX = 106
  const harborStartY = 132
  const turnCount = () =>
    page.evaluate(() => {
      const raw = window.localStorage.getItem('agl.analytics.events')
      const events = raw ? JSON.parse(raw) : []
      return events.filter((event: { name: string }) => event.name === 'turn_taken').length
    })

  for (const [index, [row, col]] of cells.slice(0, maxMoves).entries()) {
    const x = harborStartX + col * (harborCellSize + harborGap) + harborCellSize / 2
    const y = harborStartY + row * (harborCellSize + harborGap) + harborCellSize / 2
    const targetMove = index + 1

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.mouse.click(box.x + (x / 560) * box.width, box.y + (y / 500) * box.height)

      if ((await turnCount()) >= targetMove) {
        break
      }

      await page.waitForTimeout(50)
    }

    await expect.poll(turnCount).toBe(targetMove)
  }

  const replayPanel = page.getByLabel('Replay Loop')
  await expect(replayPanel).toContainText('Fresh run')
  await expect(replayPanel).toContainText('Replay sample')
  await expect(replayPanel).toContainText(replayLoop.decisionPolicy.currentDecision)
  await expect(replayPanel).toContainText(replayLoop.promptPolicy.copy)
  expect(replayLoop.rewardFraming.status).toBe('active')
  expect(replayLoop.rewardFraming.recommendedVariant).toBe('daily-streak')
  expect(replayLoop.rewardFraming.confidence).toBeGreaterThanOrEqual(55)
  expect(replayLoop.rewardFraming.controls.noPaidRewards).toBe(true)
  expect(replayLoop.rewardFraming.controls.noAds).toBe(true)
  expect(replayLoop.rewardFraming.controls.noRevenueEnablement).toBe(true)
  await replayPanel.getByRole('button', { name: replayLoop.promptPolicy.ctaLabel }).click()
  await page.waitForLoadState('domcontentloaded')

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const viewed = events.findLast((event: { name: string }) => event.name === 'replay_prompt_viewed')
  const clicked = events.findLast((event: { name: string }) => event.name === 'replay_prompt_clicked')
  const replay = events.findLast((event: { name: string }) => event.name === 'replay_clicked')

  expect(viewed.properties.surface).toBe(replayLoop.promptPolicy.surface)
  expect(clicked.properties.surface).toBe(replayLoop.promptPolicy.surface)
  expect(replay.properties.surface).toBe(replayLoop.promptPolicy.surface)
  expect(replay.properties.gameId).toBe('harbor-rings')
  expect(replay.properties.runKey).toBe(clicked.properties.runKey)
  expect(replay.properties.promptId).toBe('completed-run-replay-prompt')
  expect(replay.properties.trigger).toBe('after-completed-run')
})

test('performance budget keeps the game runtime deferred from the initial shell', async ({ page }) => {
  const budget = JSON.parse(await readFile('data/performance-budget.json', 'utf8')) as {
    status: string
    budgets: { initialJsMaxBytes: number; initialGzipMaxBytes: number; initialCssMaxBytes: number }
    initial: { jsBytes: number; gzipBytes: number; cssBytes: number; entryScripts: string[] }
    deferred: { chunks: Array<{ file: string }>; largestJsChunk: { file: string } | null }
    controls: {
      phaserDeferredFromInitialShell: boolean
      initialShellBudgetEnforced: boolean
      largeGameChunkAllowedWhenDeferred: boolean
    }
  }

  expect(budget.status).toBe('performance-budget-ready')
  expect(budget.initial.jsBytes).toBeLessThanOrEqual(budget.budgets.initialJsMaxBytes)
  expect(budget.initial.gzipBytes).toBeLessThanOrEqual(budget.budgets.initialGzipMaxBytes)
  expect(budget.initial.cssBytes).toBeLessThanOrEqual(budget.budgets.initialCssMaxBytes)
  expect(budget.controls.phaserDeferredFromInitialShell).toBe(true)
  expect(budget.controls.initialShellBudgetEnforced).toBe(true)
  expect(budget.controls.largeGameChunkAllowedWhenDeferred).toBe(true)
  expect(budget.deferred.chunks.some((chunk) => chunk.file.includes('GameCanvas'))).toBe(true)
  expect(budget.deferred.largestJsChunk?.file).toBeTruthy()
  expect(budget.initial.entryScripts).not.toContain(budget.deferred.largestJsChunk?.file ?? '')

  await page.goto('/')
  await expect(page.getByLabel('Performance Budget')).toContainText('performance-budget-ready')
})

test('release candidate records the exact deployable PWA artifact', async () => {
  const candidate = JSON.parse(await readFile('data/release-candidate.json', 'utf8')) as {
    status: string
    candidateId: string
    target: { artifactPath: string; manifestPath: string }
    summary: {
      totalFiles: number
      gamePages: number
      requiredFilesPresent: boolean
      postDeploySmokeUrls: number
    }
    integrity: {
      algorithm: string
      aggregateHash: string
      requiredFileChecks: Array<{ path: string; status: string }>
      files: Array<{ path: string; sha256: string; bytes: number; cacheControl: string }>
    }
    postDeploySmoke: Array<{ path: string; expectedStatus: number; url: string }>
    controls: {
      zeroPaidSpend: boolean
      noWorkflowExecution: boolean
      noStoreSubmission: boolean
      contentHashesRecorded: boolean
      postDeploySmokeRequired: boolean
    }
  }
  const distCandidate = JSON.parse(await readFile('dist/release-candidate.json', 'utf8')) as {
    candidateId: string
    integrity: { aggregateHash: string }
  }
  const productionEnvironment = JSON.parse(await readFile('data/production-environment.json', 'utf8')) as {
    publicOrigin: { basePath: string; status: string }
  }
  const distIndex = await readFile('dist/index.html', 'utf8')
  const distManifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8')) as {
    start_url: string
    scope: string
    icons: Array<{ src: string }>
  }
  const productionBasePath = productionEnvironment.publicOrigin.basePath

  expect(candidate.status).toBe('release-candidate-ready')
  expect(candidate.candidateId).toMatch(/^pwa-[a-f0-9]{12}$/)
  expect(candidate.target.artifactPath).toBe('dist')
  expect(candidate.target.manifestPath).toBe('dist/release-candidate.json')
  expect(candidate.summary.totalFiles).toBeGreaterThanOrEqual(20)
  expect(candidate.summary.gamePages).toBeGreaterThanOrEqual(1)
  expect(candidate.summary.requiredFilesPresent).toBe(true)
  expect(candidate.summary.postDeploySmokeUrls).toBeGreaterThanOrEqual(6)
  expect(candidate.integrity.algorithm).toBe('sha256')
  expect(candidate.integrity.aggregateHash).toMatch(/^[a-f0-9]{64}$/)
  expect(candidate.integrity.files.every((file) => file.sha256.match(/^[a-f0-9]{64}$/))).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === 'index.html')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === 'sw.js')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === 'gate-sample.html')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === 'seed-kit.html')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === 'seed-next.html')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === 'seed-next.json')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === '.nojekyll')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.path === '.well-known/assetlinks.json')).toBe(true)
  expect(candidate.integrity.files.some((file) => file.cacheControl.includes('immutable'))).toBe(true)
  expect(candidate.integrity.requiredFileChecks.every((check) => check.status === 'pass')).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/' && check.expectedStatus === 200)).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/install.html')).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/gate-sample.html')).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/seed-kit.html')).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/seed-next.html')).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/seed-next.json')).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/privacy.html')).toBe(true)
  expect(candidate.postDeploySmoke.some((check) => check.path === '/.well-known/assetlinks.json')).toBe(true)
  expect(candidate.controls.zeroPaidSpend).toBe(true)
  expect(candidate.controls.noWorkflowExecution).toBe(true)
  expect(candidate.controls.noStoreSubmission).toBe(true)
  expect(candidate.controls.contentHashesRecorded).toBe(true)
  expect(candidate.controls.postDeploySmokeRequired).toBe(true)
  expect(distCandidate.candidateId).toBe(candidate.candidateId)
  expect(distCandidate.integrity.aggregateHash).toBe(candidate.integrity.aggregateHash)
  expect(productionEnvironment.publicOrigin.status).toMatch(/configured|inferred-github-pages/)
  expect(productionBasePath).toMatch(/^\/.*\/$/)
  expect(distManifest.start_url).toBe(productionBasePath)
  expect(distManifest.scope).toBe(productionBasePath)
  expect(distManifest.icons.every((icon) => icon.src.startsWith(productionBasePath))).toBe(true)

  if (productionBasePath !== '/') {
    expect(distIndex).toContain(`src="${productionBasePath}assets/`)
    expect(distIndex).toContain(`href="${productionBasePath}assets/`)
  }
})

test('post-deploy smoke runner is wired to the release manifest and Pages workflow', async () => {
  const smoke = JSON.parse(await readFile('data/post-deploy-smoke.json', 'utf8')) as {
    status: string
    target: {
      origin: string | null
      originSource: string
      candidateId: string
      aggregateHash: string
      strictManifestComparison: boolean
    }
    liveRelease: null | {
      candidateId: string | null
      aggregateHash: string | null
      localCandidateMatches: boolean
      strictManifestComparison: boolean
      postDeploySmokeUrls: number
      smokePlanSource: string
    }
    sourceStatus: { deployment: string; releaseCandidate: string }
    summary: { planned: number; passed: number; blocked: number }
    localArtifactSmoke: {
      status: string
      summary: { planned: number; passed: number; failed: number }
      controls: {
        readOnlyFileChecks: boolean
        noNetworkRequired: boolean
        requiredTextChecks: boolean
        manifestHashComparisonRequired: boolean
      }
      checks: Array<{ id: string; status: string; file: string }>
    }
    controls: {
      zeroPaidSpend: boolean
      noStoreSubmission: boolean
      noRevenueEnablement: boolean
      readOnlyHttpChecks: boolean
      localArtifactSmokeRequired: boolean
      manifestHashComparisonRequired: boolean
      strictManifestComparison: boolean
      inferredLiveObservationAllowed: boolean
    }
    checks: Array<{ id: string; status: string; localCandidateMatches?: boolean }>
  }
  const candidate = JSON.parse(await readFile('data/release-candidate.json', 'utf8')) as {
    status: string
    candidateId: string
    integrity: { aggregateHash: string }
    postDeploySmoke: Array<{ path: string }>
  }
  const workflow = await readFile('.github/workflows/web-pwa-deploy.yml', 'utf8')
  const deployment = JSON.parse(await readFile('data/deployment-plan.json', 'utf8')) as {
    status: string
    checks: Array<{ id: string; status: string }>
  }
  const readiness = JSON.parse(await readFile('data/production-readiness.json', 'utf8')) as {
    webPwa: { checks: Array<{ id: string; status: string }> }
  }
  const deploymentScript = await readFile('scripts/deployment-plan.mjs', 'utf8')
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }

  expect(['blocked-missing-origin', 'post-deploy-smoke-passed', 'post-deploy-smoke-observed-live']).toContain(
    smoke.status,
  )
  expect(smoke.sourceStatus.releaseCandidate).toBe(candidate.status)
  expect(smoke.target.candidateId).toBe(candidate.candidateId)
  expect(smoke.target.aggregateHash).toBe(candidate.integrity.aggregateHash)
  if (smoke.target.origin) {
    expect(smoke.target.originSource).not.toBe('missing')
  }
  expect(smoke.controls.zeroPaidSpend).toBe(true)
  expect(smoke.controls.noStoreSubmission).toBe(true)
  expect(smoke.controls.noRevenueEnablement).toBe(true)
  expect(smoke.controls.readOnlyHttpChecks).toBe(true)
  expect(smoke.controls.localArtifactSmokeRequired).toBe(true)
  expect(smoke.controls.manifestHashComparisonRequired).toBe(true)
  expect(smoke.controls.strictManifestComparison).toBe(smoke.target.strictManifestComparison)
  expect(smoke.controls.inferredLiveObservationAllowed).toBe(!smoke.target.strictManifestComparison)
  expect(smoke.localArtifactSmoke.status).toBe('predeploy-artifact-smoke-passed')
  expect(smoke.localArtifactSmoke.summary.passed).toBe(smoke.localArtifactSmoke.summary.planned)
  expect(smoke.localArtifactSmoke.summary.failed).toBe(0)
  expect(smoke.localArtifactSmoke.summary.planned).toBeGreaterThanOrEqual(candidate.postDeploySmoke.length + 1)
  expect(smoke.localArtifactSmoke.controls.readOnlyFileChecks).toBe(true)
  expect(smoke.localArtifactSmoke.controls.noNetworkRequired).toBe(true)
  expect(smoke.localArtifactSmoke.controls.requiredTextChecks).toBe(true)
  expect(smoke.localArtifactSmoke.controls.manifestHashComparisonRequired).toBe(true)
  expect(smoke.localArtifactSmoke.checks.some((check) => check.id === 'release-candidate-manifest')).toBe(true)
  const liveSmokeExpectedChecks =
    smoke.status === 'post-deploy-smoke-observed-live' && smoke.liveRelease?.postDeploySmokeUrls
      ? smoke.liveRelease.postDeploySmokeUrls + 1
      : candidate.postDeploySmoke.length + 1
  expect(smoke.checks.length).toBeGreaterThanOrEqual(liveSmokeExpectedChecks)
  expect(smoke.checks.some((check) => check.id === 'release-candidate-manifest')).toBe(true)
  expect(smoke.target.origin ? smoke.summary.passed : smoke.summary.blocked).toBe(smoke.summary.planned)
  expect(deploymentScript).toContain("['release-candidate', 'post-deploy-smoke-runner']")

  if (
    readiness.webPwa.checks.every(
      (check) => check.status === 'pass' || ['release-candidate', 'post-deploy-smoke-runner'].includes(check.id),
    )
  ) {
    expect(deployment.checks.find((check) => check.id === 'web-readiness')?.status).toBe('pass')
    expect(deployment.status).toBe('ready-for-pages')
  }

  if (smoke.status === 'post-deploy-smoke-observed-live') {
    expect(smoke.target.strictManifestComparison).toBe(false)
    expect(smoke.liveRelease?.localCandidateMatches).toBe(false)
    expect(smoke.liveRelease?.candidateId).toMatch(/^pwa-[a-f0-9]{12}$/)
    expect(smoke.liveRelease?.aggregateHash).toMatch(/^[a-f0-9]{64}$/)
    expect(smoke.liveRelease?.smokePlanSource).toBe('live-release-manifest')
  }

  expect(packageJson.scripts['autonomous:post-deploy-smoke']).toBe('node scripts/post-deploy-smoke.mjs')
  expect(packageJson.scripts['autonomous:daily']).toContain('autonomous:post-deploy-smoke')
  expect(workflow).toContain('npm run build')
  expect(workflow).toContain('npm run autonomous:performance')
  expect(workflow).toContain('npm run autonomous:release-candidate')
  expect(workflow).not.toContain('npm run autonomous:operate')
  expect(workflow).toContain('actions/upload-pages-artifact@v5')
  expect(workflow).toContain('include-hidden-files: true')
  expect(workflow).toContain('AGL_EVENT_COLLECTOR_R2_BUCKET')
  expect(workflow).toContain('AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS')
  expect(workflow).toContain('VITE_EVENT_COLLECTOR_URL')
  expect(workflow).toContain('VITE_EVENT_COLLECTOR_WRITE_TOKEN')
  expect(workflow).toContain('AGL_EVENT_COLLECTOR_EXPORT_URL')
  expect(workflow).toContain('AGL_EVENT_COLLECTOR_ADMIN_TOKEN')
  expect(workflow).toContain('VITE_POSTHOG_KEY')
  expect(workflow).toContain('POSTHOG_PERSONAL_API_KEY')
  expect(workflow).toContain('AGL_DEPLOYED_PWA_ORIGIN')
  expect(workflow).toContain('npm run autonomous:post-deploy-smoke -- --assert')
  expect(workflow).toContain('data/post-deploy-smoke.json')
})

test('post-deploy artifact sync preserves strict Pages workflow evidence', async () => {
  const sync = JSON.parse(await readFile('data/post-deploy-artifact-sync.json', 'utf8')) as {
    status: string
    workflow: { workflowFile: string; artifactName: string; runId: number | null; headSha: string | null; url: string | null }
    artifact: {
      status: string
      target: { candidateId: string; aggregateHash: string; strictManifestComparison: boolean } | null
      summary: { planned: number; passed: number; failed: number; blocked: number } | null
      controls: { zeroPaidSpend: boolean; readOnlyHttpChecks: boolean } | null
    }
    live: {
      origin: string | null
      candidateId: string | null
      aggregateHash: string | null
      matchesArtifact: boolean
    }
    validation: {
      artifactPassed: boolean
      artifactStrict: boolean
      artifactControlsReady: boolean
      artifactSummaryPassed: boolean
      liveMatchesArtifact: boolean
    }
    controls: {
      zeroPaidSpend: boolean
      noWorkflowDispatch: boolean
      noStoreSubmission: boolean
      noRevenueEnablement: boolean
      readOnlyGithubArtifactDownload: boolean
      readOnlyHttpChecks: boolean
      strictManifestComparisonRequired: boolean
      separateFromLocalCandidate: boolean
      noPostDeployReleaseRefresh: boolean
    }
    checks: Array<{ id: string; status: string }>
  }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }
  const script = await readFile('scripts/post-deploy-artifact-sync.mjs', 'utf8')
  const workflow = await readFile('.github/workflows/post-deploy-evidence-sync.yml', 'utf8')

  expect(sync.status).toBe('post-deploy-artifact-sync-passed')
  expect(sync.workflow.workflowFile).toBe('web-pwa-deploy.yml')
  expect(sync.workflow.artifactName).toBe('post-deploy-smoke')
  expect(sync.workflow.runId).toBeGreaterThan(0)
  expect(sync.workflow.headSha).toMatch(/^[a-f0-9]{40}$/)
  expect(sync.artifact.status).toBe('post-deploy-smoke-passed')
  expect(sync.artifact.target?.strictManifestComparison).toBe(true)
  expect(sync.artifact.summary?.passed).toBe(sync.artifact.summary?.planned)
  expect(sync.artifact.summary?.failed).toBe(0)
  expect(sync.artifact.summary?.blocked).toBe(0)
  expect(sync.live.matchesArtifact).toBe(true)
  expect(sync.live.candidateId).toBe(sync.artifact.target?.candidateId)
  expect(sync.live.aggregateHash).toBe(sync.artifact.target?.aggregateHash)
  expect(sync.validation.artifactPassed).toBe(true)
  expect(sync.validation.artifactStrict).toBe(true)
  expect(sync.validation.artifactControlsReady).toBe(true)
  expect(sync.validation.artifactSummaryPassed).toBe(true)
  expect(sync.validation.liveMatchesArtifact).toBe(true)
  expect(sync.controls.zeroPaidSpend).toBe(true)
  expect(sync.controls.noWorkflowDispatch).toBe(true)
  expect(sync.controls.noStoreSubmission).toBe(true)
  expect(sync.controls.noRevenueEnablement).toBe(true)
  expect(sync.controls.readOnlyGithubArtifactDownload).toBe(true)
  expect(sync.controls.readOnlyHttpChecks).toBe(true)
  expect(sync.controls.strictManifestComparisonRequired).toBe(true)
  expect(sync.controls.separateFromLocalCandidate).toBe(true)
  expect(sync.controls.noPostDeployReleaseRefresh).toBe(true)
  expect(sync.checks.some((check) => check.id === 'post-deploy-smoke-artifact' && check.status === 'pass')).toBe(
    true,
  )
  expect(sync.checks.some((check) => check.id === 'live-release-manifest' && check.status === 'pass')).toBe(true)
  expect(packageJson.scripts['autonomous:post-deploy-artifact-sync']).toBe(
    'node scripts/post-deploy-artifact-sync.mjs',
  )
  expect(packageJson.scripts['autonomous:verify-post-deploy-sync']).toBe(
    'node scripts/verify-post-deploy-evidence-sync.mjs',
  )
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('npm run build')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:performance')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:release-candidate')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:post-deploy-smoke')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:live-monitor')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:repo-readiness')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:repo-bootstrap')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:deploy-plan')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:bootstrap')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:activate-production')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:measurement-status')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('node scripts/production-readiness.mjs')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:owner-loop')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:operator')
  expect(packageJson.scripts['autonomous:post-deploy-readiness-sync']).toContain('autonomous:objective-audit')
  expect(script).toContain("'run'")
  expect(script).toContain("'view'")
  expect(script).toContain("'download'")
  expect(script).toContain('readOnlyGithubArtifactDownload')
  expect(script).toContain('separateFromLocalCandidate')
  expect(script).toContain('noPostDeployReleaseRefresh')
  expect(workflow).toContain("workflows: ['Web PWA Deploy']")
  expect(workflow).toContain('actions: read')
  expect(workflow).toContain('contents: write')
  expect(workflow).toContain('autonomous:post-deploy-artifact-sync')
  expect(workflow).toContain('autonomous:live-monitor')
  expect(workflow).toContain('autonomous:post-deploy-readiness-sync')
  expect(workflow).toContain('GH_TOKEN: ${{ github.token }}')
  expect(workflow).toContain('GITHUB_REPOSITORY: ${{ github.repository }}')
  expect(workflow).toContain('GITHUB_TOKEN: ${{ github.token }}')
  expect(workflow).toContain('AGL_PUBLIC_ORIGIN: ${{ vars.AGL_PUBLIC_ORIGIN }}')
  expect(workflow).toContain('AGL_AUTONOMOUS_SELF_UPDATE: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE }}')
  expect(workflow).toContain(
    'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}',
  )
  expect(workflow).toContain('npm run autonomous:verify-post-deploy-sync')
  expect(workflow).toContain('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT')
  expect(workflow).toContain('data/post-deploy-artifact-sync.json')
  expect(workflow).toContain('src/data/postDeployArtifactSync.ts')
  expect(workflow).toContain('reports/post-deploy-artifact-sync-latest.md')
  expect(workflow).toContain('data/performance-budget.json')
  expect(workflow).toContain('data/release-candidate.json')
  expect(workflow).toContain('data/post-deploy-smoke.json')
  expect(workflow).toContain('data/live-site-monitor.json')
  expect(workflow).toContain('src/data/liveSiteMonitor.ts')
  expect(workflow).toContain('reports/live-site-monitor-latest.md')
  expect(workflow).toContain('data/repository-readiness.json')
  expect(workflow).toContain('data/repository-bootstrap.json')
  expect(workflow).toContain('data/deployment-plan.json')
  expect(workflow).toContain('data/production-bootstrap.json')
  expect(workflow).toContain('data/production-activation.json')
  expect(workflow).toContain('data/production-blocker-handoff.json')
  expect(workflow).toContain('data/production-measurement-status.json')
  expect(workflow).toContain('src/data/productionMeasurementStatus.ts')
  expect(workflow).toContain('public/measurement-status.html')
  expect(workflow).toContain('public/measurement-status.json')
  expect(workflow).toContain('reports/production-measurement-status-latest.md')
  expect(workflow).toContain('data/production-readiness.json')
  expect(workflow).toContain('data/objective-audit.json')
  expect(workflow).toContain('data/autonomous-operator.json')
  expect(workflow).toContain('data/autonomous-owner-loop.json')
  expect(workflow).not.toContain('npm run build')
  expect(workflow).not.toContain('autonomous:release-candidate')
  expect(workflow).not.toContain('autonomous:post-deploy-smoke')
})

test('live site monitor verifies the public PWA against synced deploy evidence', async ({ page }) => {
  const monitor = JSON.parse(await readFile('data/live-site-monitor.json', 'utf8')) as {
    status: string
    origin: { origin: string | null; source: string }
    sourceStatus: {
      releaseCandidate: string
      postDeployArtifactSync: string
      latestSyncedDeployKnown: boolean
    }
    summary: {
      planned: number
      passed: number
      failed: number
      blocked: number
      liveCandidateId: string | null
      syncedCandidateId: string | null
      liveMatchesSyncedDeploy: boolean
      liveMatchesCurrentLocalCandidate: boolean
      monitoringPlanSource: string
      monitoredSmokeUrls: number
      liveSmokeUrls: number
    }
    controls: {
      zeroPaidSpend: boolean
      readOnlyHttpChecks: boolean
      noMutation: boolean
      noCookiesOrCredentials: boolean
      strictSyncedManifestComparison: boolean
    }
    checks: Array<{
      id: string
      path: string
      status: string
      manifest?: { matchesSyncedDeploy: boolean }
    }>
  }
  const sync = JSON.parse(await readFile('data/post-deploy-artifact-sync.json', 'utf8')) as {
    status: string
    live: { origin: string | null; candidateId: string | null }
  }
  const candidate = JSON.parse(await readFile('data/release-candidate.json', 'utf8')) as {
    status: string
    postDeploySmoke: Array<{ path: string }>
  }
  const readiness = JSON.parse(await readFile('data/production-readiness.json', 'utf8')) as {
    webPwa: { checks: Array<{ id: string; status: string }> }
    liveSiteMonitor: {
      status: string
      summary: { liveMatchesSyncedDeploy: boolean }
      controls: { readOnlyHttpChecks: boolean; strictSyncedManifestComparison: boolean }
    }
  }
  const response = JSON.parse(await readFile('data/production-response.json', 'utf8')) as {
    liveSiteMonitorStatus: string
    controls: { liveSiteAlert: boolean }
  }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }
  const source = await readFile('scripts/live-site-monitor.mjs', 'utf8')
  const normalizeOrigin = (value: string | null) => value?.replace(/\/$/, '') ?? null

  expect(monitor.status).toBe('live-site-monitor-passed')
  expect(normalizeOrigin(monitor.origin.origin)).toBe(normalizeOrigin(sync.live.origin))
  expect(monitor.origin.source).toBe('post-deploy-artifact-sync')
  expect(monitor.sourceStatus.releaseCandidate).toBe(candidate.status)
  expect(monitor.sourceStatus.postDeployArtifactSync).toBe(sync.status)
  expect(monitor.sourceStatus.latestSyncedDeployKnown).toBe(true)
  const monitorExpectedChecks =
    monitor.summary.monitoringPlanSource === 'synced-live-release-manifest'
      ? monitor.summary.monitoredSmokeUrls + 1
      : candidate.postDeploySmoke.length + 1
  expect(monitor.summary.planned).toBeGreaterThanOrEqual(monitorExpectedChecks)
  expect(monitor.summary.passed).toBe(monitor.summary.planned)
  expect(monitor.summary.failed).toBe(0)
  expect(monitor.summary.blocked).toBe(0)
  expect(monitor.summary.liveCandidateId).toBe(sync.live.candidateId)
  expect(monitor.summary.syncedCandidateId).toBe(sync.live.candidateId)
  expect(monitor.summary.liveMatchesSyncedDeploy).toBe(true)
  if (!monitor.summary.liveMatchesCurrentLocalCandidate) {
    expect(monitor.summary.monitoringPlanSource).toBe('synced-live-release-manifest')
    expect(monitor.summary.liveSmokeUrls).toBe(monitor.summary.monitoredSmokeUrls)
  }
  expect(monitor.controls.zeroPaidSpend).toBe(true)
  expect(monitor.controls.readOnlyHttpChecks).toBe(true)
  expect(monitor.controls.noMutation).toBe(true)
  expect(monitor.controls.noCookiesOrCredentials).toBe(true)
  expect(monitor.controls.strictSyncedManifestComparison).toBe(true)
  expect(monitor.checks.find((check) => check.id === 'release-candidate-manifest-live')?.manifest?.matchesSyncedDeploy).toBe(
    true,
  )
  for (const path of ['/privacy.html', '/support.html', '/compliance.json', '/gate-sample.html']) {
    expect(monitor.checks.some((check) => check.path === path && check.status === 'pass')).toBe(true)
  }
  expect(readiness.webPwa.checks.find((check) => check.id === 'live-site-monitor')?.status).toBe('pass')
  expect(readiness.liveSiteMonitor.status).toBe(monitor.status)
  expect(readiness.liveSiteMonitor.summary.liveMatchesSyncedDeploy).toBe(true)
  expect(readiness.liveSiteMonitor.controls.readOnlyHttpChecks).toBe(true)
  expect(readiness.liveSiteMonitor.controls.strictSyncedManifestComparison).toBe(true)
  expect(response.liveSiteMonitorStatus).toBe(monitor.status)
  expect(response.controls.liveSiteAlert).toBe(false)
  expect(packageJson.scripts['autonomous:live-monitor']).toBe('node scripts/live-site-monitor.mjs')
  expect(packageJson.scripts['autonomous:daily']).toContain('autonomous:live-monitor')
  expect(packageJson.scripts['test:e2e']).toContain('autonomous:live-monitor')
  expect(packageJson.scripts['test:automation']).toContain('autonomous:live-monitor')
  expect(source).toContain('strictSyncedManifestComparison')
  expect(source).toContain('noCookiesOrCredentials')

  await page.goto('/')
  await expect(page.getByLabel('Live Site Monitor')).toContainText(monitor.status)
  await expect(page.getByLabel('Live Site Monitor')).toContainText(`${monitor.summary.passed}/${monitor.summary.planned}`)
})

test('production scripts load git-ignored env files without leaking values or mutation gates', async () => {
  const artifactPaths = [
    'data/production-environment.json',
    'data/repository-readiness.json',
    'data/repository-bootstrap.json',
    'data/support-channel.json',
    'data/production-bootstrap.json',
    'data/event-collector-deployment.json',
    'data/post-deploy-smoke.json',
    'data/live-site-monitor.json',
  ]
  const expectedFiles = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
    'ops/production.env',
    'ops/production.env.local',
  ]

  for (const artifactPath of artifactPaths) {
    const artifact = JSON.parse(await readFile(artifactPath, 'utf8')) as {
      envFiles: {
        candidateFiles: string[]
        loadedFiles: Array<Record<string, unknown>>
        controls: {
          shellEnvPrecedence: boolean
          protectedMutationKeysRequireShellEnv: boolean
          noSecretValuesInReports: boolean
          gitIgnoredLocalEnvFiles: boolean
        }
      }
    }

    expect(artifact.envFiles.candidateFiles).toEqual(expect.arrayContaining(expectedFiles))
    expect(artifact.envFiles.controls.shellEnvPrecedence).toBe(true)
    expect(artifact.envFiles.controls.protectedMutationKeysRequireShellEnv).toBe(true)
    expect(artifact.envFiles.controls.noSecretValuesInReports).toBe(true)
    expect(artifact.envFiles.controls.gitIgnoredLocalEnvFiles).toBe(true)
    expect(
      artifact.envFiles.loadedFiles.some((file) =>
        Object.prototype.hasOwnProperty.call(file, 'value'),
      ),
    ).toBe(false)
  }

  const gitignore = await readFile('.gitignore', 'utf8')
  const envLoader = await readFile('scripts/lib/env-loader.mjs', 'utf8')
  const productionEnvExample = await readFile('ops/production.env.example', 'utf8')
  const cloudflareReadme = await readFile('ops/cloudflare/README.md', 'utf8')
  const collectorWorkflow = await readFile('.github/workflows/event-collector-deploy.yml', 'utf8')
  const envAwareScripts = [
    'scripts/production-environment.mjs',
    'scripts/repository-readiness.mjs',
    'scripts/repository-bootstrap.mjs',
    'scripts/support-channel.mjs',
    'scripts/production-bootstrap.mjs',
    'scripts/event-collector-deploy-plan.mjs',
    'scripts/post-deploy-smoke.mjs',
  ]
  const requiredProductionEnvExampleKeys = [
    'GITHUB_REPOSITORY=',
    'GH_REPO=',
    'AGL_GITHUB_OWNER=',
    'AGL_GITHUB_VISIBILITY=',
    'AGL_DEFAULT_BRANCH=',
    'AGL_INFER_GITHUB_PAGES_ORIGIN=',
    'AGL_SYNC_PAGES_SETTINGS=',
    'AGL_ALLOW_GH_INFER_REPOSITORY=',
    'AGL_ALLOW_LOCAL_GIT_BOOTSTRAP=',
    'AGL_ALLOW_REPOSITORY_BOOTSTRAP=',
    'AGL_ALLOW_INITIAL_COMMIT=',
    'AGL_ALLOW_SNAPSHOT_COMMIT=',
    'AGL_ALLOW_ORIGIN_REMOTE=',
    'AGL_ALLOW_GITHUB_REPO_CREATE=',
    'AGL_ALLOW_PUSH=',
    'RUN_WORKFLOWS=',
    'ALLOW_ANDROID_RELEASE_WORKFLOW=',
    'GH_TOKEN=',
    'GITHUB_TOKEN=',
    'CLOUDFLARE_ACCOUNT_ID=',
    'CLOUDFLARE_API_TOKEN=',
    'AGL_EVENT_COLLECTOR_R2_BUCKET=',
    'AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS=',
    'AGL_ANDROID_KEYSTORE_BASE64=',
    'AGL_ANDROID_KEYSTORE_PASSWORD=',
    'AGL_ANDROID_KEY_ALIAS=',
    'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=',
  ]
  const defaultOffProductionGates = [
    'AGL_ALLOW_LOCAL_GIT_BOOTSTRAP=0',
    'AGL_ALLOW_REPOSITORY_BOOTSTRAP=0',
    'AGL_ALLOW_INITIAL_COMMIT=0',
    'AGL_ALLOW_SNAPSHOT_COMMIT=0',
    'AGL_ALLOW_ORIGIN_REMOTE=0',
    'AGL_ALLOW_GITHUB_REPO_CREATE=0',
    'AGL_ALLOW_PUSH=0',
    'RUN_WORKFLOWS=0',
    'ALLOW_ANDROID_RELEASE_WORKFLOW=0',
  ]

  expect(gitignore).toContain('.env')
  expect(gitignore).toContain('.env.*')
  expect(gitignore).toContain('ops/production.env')
  expect(gitignore).toContain('ops/*.env.local')
  expect(gitignore).toContain('!ops/production.env.example')
  expect(envLoader).toContain('AGL_ALLOW_')
  expect(envLoader).toContain('protectedMutationKeysRequireShellEnv')
  expect(collectorWorkflow).toContain('r2 bucket create')
  expect(collectorWorkflow).toContain("'Production Input Watch'")

  for (const scriptPath of envAwareScripts) {
    expect(await readFile(scriptPath, 'utf8')).toContain('loadLocalEnv')
  }

  for (const key of requiredProductionEnvExampleKeys) {
    expect(productionEnvExample).toContain(key)
  }
  for (const gate of defaultOffProductionGates) {
    expect(productionEnvExample).toContain(gate)
  }
  for (const key of [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_API_TOKEN',
    'AGL_EVENT_COLLECTOR_R2_BUCKET',
    'AGL_EVENT_COLLECTOR_ALLOWED_ORIGINS',
  ]) {
    expect(cloudflareReadme).toContain(key)
  }
})

test('production environment infers zero-cost GitHub Pages origin from repository target', async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'agl-production-env-'))

  try {
    await writeFile(
      path.join(tempRoot, 'package.json'),
      JSON.stringify({ name: 'autonomous-game-lab' }, null, 2),
    )

    await execFileAsync('node', [path.join(process.cwd(), 'scripts/production-environment.mjs')], {
      cwd: tempRoot,
      env: {
        ...process.env,
        AGL_GITHUB_OWNER: 'demo-owner',
        AGL_PUBLIC_ORIGIN: '',
        VITE_PUBLIC_ORIGIN: '',
        PUBLIC_SITE_URL: '',
        AGL_PUBLIC_HOST: '',
        VITE_BASE_PATH: '',
        GITHUB_REPOSITORY: '',
        GH_REPO: '',
        GITHUB_REPOSITORY_OWNER: '',
        GITHUB_OWNER: '',
      },
    })

    const environment = JSON.parse(
      await readFile(path.join(tempRoot, 'data/production-environment.json'), 'utf8'),
    ) as {
      publicOrigin: {
        origin: string
        basePath: string
        source: string
        status: string
        privacyUrl: string
        githubPagesCandidate: {
          repository: string
          origin: string
          basePath: string
          costUsd: number
        }
      }
      requiredEnv: Array<{ name: string; configured: boolean; source?: string; fallback?: string | null }>
    }

    expect(environment.publicOrigin.source).toBe('github-pages-target')
    expect(environment.publicOrigin.status).toBe('inferred-github-pages')
    expect(environment.publicOrigin.origin).toBe('https://demo-owner.github.io/autonomous-game-lab')
    expect(environment.publicOrigin.basePath).toBe('/autonomous-game-lab/')
    expect(environment.publicOrigin.privacyUrl).toBe(
      'https://demo-owner.github.io/autonomous-game-lab/privacy.html',
    )
    expect(environment.publicOrigin.githubPagesCandidate).toMatchObject({
      repository: 'demo-owner/autonomous-game-lab',
      origin: 'https://demo-owner.github.io/autonomous-game-lab',
      basePath: '/autonomous-game-lab/',
      costUsd: 0,
    })
    expect(environment.requiredEnv.find((item) => item.name === 'AGL_PUBLIC_ORIGIN')).toMatchObject({
      configured: true,
      source: 'github-pages-target',
      fallback: 'github-pages-target',
    })

    await execFileAsync('node', [path.join(process.cwd(), 'scripts/production-environment.mjs')], {
      cwd: tempRoot,
      env: {
        ...process.env,
        AGL_PUBLIC_ORIGIN: 'https://demo-owner.github.io/autonomous-game-lab',
        VITE_PUBLIC_ORIGIN: '',
        PUBLIC_SITE_URL: '',
        AGL_PUBLIC_HOST: '',
        VITE_BASE_PATH: '/autonomous-game-lab/',
        GITHUB_REPOSITORY: '',
        GH_REPO: '',
        GITHUB_REPOSITORY_OWNER: '',
        GITHUB_OWNER: '',
      },
    })

    const explicitEnvironment = JSON.parse(
      await readFile(path.join(tempRoot, 'data/production-environment.json'), 'utf8'),
    ) as {
      publicOrigin: {
        origin: string
        source: string
        status: string
        privacyUrl: string
      }
    }

    expect(explicitEnvironment.publicOrigin.source).toBe('environment')
    expect(explicitEnvironment.publicOrigin.status).toBe('configured')
    expect(explicitEnvironment.publicOrigin.origin).toBe('https://demo-owner.github.io/autonomous-game-lab')
    expect(explicitEnvironment.publicOrigin.privacyUrl).toBe(
      'https://demo-owner.github.io/autonomous-game-lab/privacy.html',
    )
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('production environment inspects GitHub repository variables and secret metadata safely', async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'agl-production-gh-env-'))
  const fakeBin = path.join(tempRoot, 'bin')
  const fakeGh = path.join(fakeBin, 'gh')

  try {
    await mkdir(fakeBin, { recursive: true })
    await writeFile(
      fakeGh,
      [
        '#!/usr/bin/env bash',
        'set -euo pipefail',
        'if [[ "${1:-}" == "variable" && "${2:-}" == "list" ]]; then',
        `  printf '%s\\n' '[{"name":"AGL_PUBLIC_ORIGIN","value":"https://play.aglab.test/portal"},{"name":"VITE_BASE_PATH","value":"/portal/"},{"name":"VITE_POSTHOG_KEY","value":"phc_repo_public"},{"name":"POSTHOG_PROJECT_ID","value":"12345"},{"name":"VITE_EVENT_COLLECTOR_URL","value":"https://events.aglab.test/events"},{"name":"AGL_EVENT_COLLECTOR_EXPORT_URL","value":"https://events.aglab.test/events/export"},{"name":"AGL_ANDROID_PACKAGE_NAME","value":"app.aglab.portal"},{"name":"AGL_ANDROID_SHA256_CERT_FINGERPRINT","value":"AA:BB:CC:DD"},{"name":"AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED","value":"true"}]'`,
        'elif [[ "${1:-}" == "secret" && "${2:-}" == "list" ]]; then',
        `  printf '%s\\n' '[{"name":"VITE_EVENT_COLLECTOR_WRITE_TOKEN","updatedAt":"2026-05-20T00:00:00Z"},{"name":"AGL_EVENT_COLLECTOR_ADMIN_TOKEN","updatedAt":"2026-05-20T00:00:00Z"},{"name":"POSTHOG_PERSONAL_API_KEY","updatedAt":"2026-05-20T00:00:00Z"},{"name":"GOOGLE_PLAY_SERVICE_ACCOUNT_JSON","updatedAt":"2026-05-20T00:00:00Z"}]'`,
        'else',
        '  exit 1',
        'fi',
        '',
      ].join('\n'),
    )
    await chmod(fakeGh, 0o755)
    await writeFile(
      path.join(tempRoot, 'package.json'),
      JSON.stringify({ name: 'autonomous-game-lab' }, null, 2),
    )

    await execFileAsync('node', [path.join(process.cwd(), 'scripts/production-environment.mjs')], {
      cwd: tempRoot,
      env: {
        ...process.env,
        PATH: `${fakeBin}${path.delimiter}${process.env.PATH ?? ''}`,
        GITHUB_REPOSITORY: 'demo-owner/autonomous-game-lab',
        GH_REPO: '',
        AGL_GITHUB_OWNER: '',
        GITHUB_REPOSITORY_OWNER: '',
        GITHUB_OWNER: '',
        AGL_PUBLIC_ORIGIN: '',
        VITE_PUBLIC_ORIGIN: '',
        PUBLIC_SITE_URL: '',
        AGL_PUBLIC_HOST: '',
        VITE_BASE_PATH: '',
        AGL_SUPPORT_EMAIL: '',
        SUPPORT_EMAIL: '',
        VITE_POSTHOG_KEY: '',
        POSTHOG_PROJECT_ID: '',
        POSTHOG_PERSONAL_API_KEY: '',
        VITE_EVENT_COLLECTOR_URL: '',
        AGL_EVENT_COLLECTOR_URL: '',
        AGL_EVENT_COLLECTOR_EXPORT_URL: '',
        VITE_EVENT_COLLECTOR_WRITE_TOKEN: '',
        AGL_EVENT_COLLECTOR_ADMIN_TOKEN: '',
        AGL_ANDROID_PACKAGE_NAME: '',
        AGL_ANDROID_SHA256_CERT_FINGERPRINT: '',
        AGL_GOOGLE_PLAY_ACCOUNT_CONNECTED: '',
        GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: '',
      },
    })

    const environmentRaw = await readFile(path.join(tempRoot, 'data/production-environment.json'), 'utf8')
    const environment = JSON.parse(environmentRaw) as {
      status: string
      repositoryEnv: {
        status: string
        repository: string
        variables: Array<Record<string, unknown>>
        secrets: Array<Record<string, unknown>>
        variableNames: string[]
        secretNames: string[]
        controls: {
          readOnlyInspection: boolean
          secretValuesNeverRead: boolean
          noMutation: boolean
        }
      }
      publicOrigin: { origin: string; basePath: string; source: string; status: string }
      analytics: {
        browserPosthogConfigured: boolean
        serverPosthogConfigured: boolean
        eventCollector: {
          browserConfigured: boolean
          serverExportConfigured: boolean
          writeTokenConfigured: boolean
          adminTokenConfigured: boolean
        }
      }
      android: {
        packageName: string
        signingFingerprintConfigured: boolean
        googlePlayAccountConnected: boolean
      }
      requiredEnv: Array<{ name: string; configured: boolean; source?: string }>
    }

    expect(environment.repositoryEnv.status).toBe('inspected')
    expect(environment.repositoryEnv.repository).toBe('demo-owner/autonomous-game-lab')
    expect(environment.repositoryEnv.controls.readOnlyInspection).toBe(true)
    expect(environment.repositoryEnv.controls.secretValuesNeverRead).toBe(true)
    expect(environment.repositoryEnv.controls.noMutation).toBe(true)
    expect(environment.repositoryEnv.variableNames).toEqual(
      expect.arrayContaining(['AGL_PUBLIC_ORIGIN', 'VITE_EVENT_COLLECTOR_URL', 'VITE_POSTHOG_KEY']),
    )
    expect(environment.repositoryEnv.secretNames).toEqual(
      expect.arrayContaining(['AGL_EVENT_COLLECTOR_ADMIN_TOKEN', 'VITE_EVENT_COLLECTOR_WRITE_TOKEN']),
    )
    expect(environment.repositoryEnv.variables.some((row) => Object.prototype.hasOwnProperty.call(row, 'value'))).toBe(
      false,
    )
    expect(environment.repositoryEnv.secrets.some((row) => Object.prototype.hasOwnProperty.call(row, 'value'))).toBe(
      false,
    )
    expect(environmentRaw).not.toContain('super-secret')

    expect(environment.status).toBe('production-env-partial')
    expect(environment.publicOrigin.source).toBe('github-variable')
    expect(environment.publicOrigin.status).toBe('configured')
    expect(environment.publicOrigin.origin).toBe('https://play.aglab.test/portal')
    expect(environment.publicOrigin.basePath).toBe('/portal/')
    expect(environment.analytics.browserPosthogConfigured).toBe(true)
    expect(environment.analytics.serverPosthogConfigured).toBe(true)
    expect(environment.analytics.eventCollector.browserConfigured).toBe(true)
    expect(environment.analytics.eventCollector.serverExportConfigured).toBe(true)
    expect(environment.analytics.eventCollector.writeTokenConfigured).toBe(true)
    expect(environment.analytics.eventCollector.adminTokenConfigured).toBe(true)
    expect(environment.android.packageName).toBe('app.aglab.portal')
    expect(environment.android.signingFingerprintConfigured).toBe(true)
    expect(environment.android.googlePlayAccountConnected).toBe(true)
    expect(environment.requiredEnv.find((item) => item.name === 'AGL_PUBLIC_ORIGIN')).toMatchObject({
      configured: true,
      source: 'github-variable',
    })
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('repository readiness surfaces the GitHub Pages deployment channel without mutating git', async () => {
  const readiness = JSON.parse(await readFile('data/repository-readiness.json', 'utf8')) as {
    status: string
    workspace: { insideWorkTree: boolean; nonGeneratedDirtyFiles: number }
    repository: {
      target: string | null
      source: string
      inferredTarget: string | null
      inferredRepositoryName: string
      remoteParsing: {
        supportsSshUrl: boolean
        supportsDottedRepositoryNames: boolean
        supportsOwnerHint: boolean
      }
    }
    githubAutomation: { workflowDispatchReady: boolean; ghAuthAvailable: boolean; ghCredentialReady: boolean }
    pages: {
      workflowPath: string
      deployWorkflowIncludesSmoke: boolean
      releaseCandidateId: string
      liveSettings: {
        status: string
        buildType: string | null
        httpsEnforced: boolean
        htmlUrl: string | null
        controls: { readOnlyGhApi: boolean; noPagesMutation: boolean; noWorkflowDispatch: boolean }
      }
    }
    repositoryTargetPlan: {
      repositoryName: string
      plannedTarget: string
      githubNewRepositoryUrl: string
      httpsOriginUrl: string
      sshOriginUrl: string
      pages: { origin: string; basePath: string }
      explicitCommands: { createRepository: string; attachOrigin: string; pushSnapshot: string }
      controls: { zeroPaidSpend: boolean; remoteMutationRequiresExplicitEnv: boolean; workflowDispatchBlocked: boolean }
    }
    controls: {
      zeroPaidSpend: boolean
      readOnlyLocalInspection: boolean
      noGitMutation: boolean
      noWorkflowDispatch: boolean
      noAccountCreation: boolean
    }
    checks: Array<{ id: string; status: string }>
    blockers: string[]
  }
  const candidate = JSON.parse(await readFile('data/release-candidate.json', 'utf8')) as {
    candidateId: string
  }
  const bootstrap = JSON.parse(await readFile('data/production-bootstrap.json', 'utf8')) as {
    stages: Array<{ id: string }>
    setupCommands: Array<{ id: string; command: string }>
  }
  const repositoryBootstrap = JSON.parse(await readFile('data/repository-bootstrap.json', 'utf8')) as {
    status: string
    controls: {
      dryRunByDefault: boolean
      localGitMutationRequiresExplicitFlag: boolean
      remoteGitHubMutationRequiresExplicitEnv: boolean
      snapshotCommitRequiresExplicitEnv: boolean
      noWorkflowDispatch: boolean
    }
    helper: { path: string; noWorkflowDispatch: boolean }
    workspace: { after: { nonGeneratedDirtyFiles: number } }
    repositoryTargetPlan: {
      plannedTarget: string
      githubNewRepositoryUrl: string
      explicitCommands: { createRepository: string; attachOrigin: string; pushSnapshot: string }
      controls: { remoteMutationRequiresExplicitEnv: boolean; workflowDispatchBlocked: boolean }
    }
    actions: Array<{ id: string; status: string }>
    blockers: string[]
  }
  const repositoryBootstrapScript = await readFile('ops/github/bootstrap-repository.sh', 'utf8')
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }

  expect([
    'repository-channel-ready',
    'waiting-for-gh-auth',
    'waiting-for-repository-channel',
    'waiting-for-github-repository',
    'blocked-missing-pages-workflow',
    'blocked-no-local-git',
  ]).toContain(readiness.status)
  expect(readiness.controls.zeroPaidSpend).toBe(true)
  expect(readiness.controls.readOnlyLocalInspection).toBe(true)
  expect(readiness.controls.noGitMutation).toBe(true)
  expect(readiness.controls.noWorkflowDispatch).toBe(true)
  expect(readiness.controls.noAccountCreation).toBe(true)
  expect(['environment', 'origin-remote', 'owner-hint-and-package-name', 'gh-auth-user-and-package-name', 'missing']).toContain(
    readiness.repository.source,
  )
  expect(readiness.repository.inferredRepositoryName).toBe(packageJson.name)
  expect(readiness.repositoryTargetPlan.repositoryName).toBe(readiness.repository.inferredRepositoryName)
  expect(readiness.repositoryTargetPlan.plannedTarget).toContain('/')
  expect(readiness.repositoryTargetPlan.githubNewRepositoryUrl).toContain('https://github.com/new?name=')
  expect(readiness.repositoryTargetPlan.httpsOriginUrl).toContain(readiness.repositoryTargetPlan.plannedTarget)
  expect(readiness.repositoryTargetPlan.sshOriginUrl).toContain(readiness.repositoryTargetPlan.plannedTarget)
  expect(readiness.repositoryTargetPlan.pages.origin).toMatch(/^https:\/\//)
  expect(readiness.repositoryTargetPlan.explicitCommands.createRepository).toContain('AGL_ALLOW_GITHUB_REPO_CREATE=1')
  expect(readiness.repositoryTargetPlan.explicitCommands.attachOrigin).toContain('AGL_ALLOW_ORIGIN_REMOTE=1')
  expect(readiness.repositoryTargetPlan.controls.zeroPaidSpend).toBe(true)
  expect(readiness.repositoryTargetPlan.controls.remoteMutationRequiresExplicitEnv).toBe(true)
  expect(readiness.repositoryTargetPlan.controls.workflowDispatchBlocked).toBe(true)
  expect(readiness.repository.remoteParsing.supportsSshUrl).toBe(true)
  expect(readiness.repository.remoteParsing.supportsDottedRepositoryNames).toBe(true)
  expect(readiness.repository.remoteParsing.supportsOwnerHint).toBe(true)
  expect(readiness.githubAutomation.ghCredentialReady).toBe(
    readiness.githubAutomation.ghAuthAvailable || readiness.checks.some((check) => check.id === 'gh-token' && check.status === 'pass'),
  )
  expect(readiness.pages.workflowPath).toBe('.github/workflows/web-pwa-deploy.yml')
  expect(readiness.pages.deployWorkflowIncludesSmoke).toBe(true)
  expect(readiness.pages.releaseCandidateId).toBe(candidate.candidateId)
  expect(readiness.pages.liveSettings.status).toBe('inspected')
  expect(readiness.pages.liveSettings.buildType).toBe('workflow')
  expect(readiness.pages.liveSettings.httpsEnforced).toBe(true)
  expect(readiness.pages.liveSettings.htmlUrl).toMatch(/^https:\/\//)
  expect(readiness.pages.liveSettings.controls.readOnlyGhApi).toBe(true)
  expect(readiness.pages.liveSettings.controls.noPagesMutation).toBe(true)
  expect(readiness.pages.liveSettings.controls.noWorkflowDispatch).toBe(true)
  expect(readiness.checks.some((check) => check.id === 'local-git-worktree')).toBe(true)
  expect(readiness.checks.some((check) => check.id === 'pages-workflow' && check.status === 'pass')).toBe(true)
  expect(readiness.checks.some((check) => check.id === 'pages-settings' && check.status === 'pass')).toBe(true)
  expect(readiness.workspace.insideWorkTree || readiness.blockers.length > 0).toBe(true)
  expect(typeof readiness.workspace.nonGeneratedDirtyFiles).toBe('number')
  if (readiness.workspace.nonGeneratedDirtyFiles === 0) {
    expect(readiness.blockers.some((blocker) => blocker.includes('Commit current generated changes'))).toBe(false)
  }
  expect([
    'needs-local-git-bootstrap',
    'waiting-for-github-target',
    'waiting-for-origin-remote',
    'waiting-for-gh-auth',
    'repository-bootstrap-ready',
  ]).toContain(repositoryBootstrap.status)
  expect(repositoryBootstrap.controls.dryRunByDefault).toBe(true)
  expect(repositoryBootstrap.controls.localGitMutationRequiresExplicitFlag).toBe(true)
  expect(repositoryBootstrap.controls.remoteGitHubMutationRequiresExplicitEnv).toBe(true)
  expect(repositoryBootstrap.controls.snapshotCommitRequiresExplicitEnv).toBe(true)
  expect(repositoryBootstrap.controls.noWorkflowDispatch).toBe(true)
  expect(repositoryBootstrap.helper.path).toBe('ops/github/bootstrap-repository.sh')
  expect(repositoryBootstrap.helper.noWorkflowDispatch).toBe(true)
  expect(repositoryBootstrap.repositoryTargetPlan.plannedTarget).toBe(readiness.repositoryTargetPlan.plannedTarget)
  expect(repositoryBootstrap.repositoryTargetPlan.githubNewRepositoryUrl).toBe(
    readiness.repositoryTargetPlan.githubNewRepositoryUrl,
  )
  expect(repositoryBootstrap.repositoryTargetPlan.explicitCommands.pushSnapshot).toContain('AGL_ALLOW_PUSH=1')
  expect(repositoryBootstrap.repositoryTargetPlan.controls.remoteMutationRequiresExplicitEnv).toBe(true)
  expect(repositoryBootstrap.repositoryTargetPlan.controls.workflowDispatchBlocked).toBe(true)
  expect(typeof repositoryBootstrap.workspace.after.nonGeneratedDirtyFiles).toBe('number')
  if (repositoryBootstrap.workspace.after.nonGeneratedDirtyFiles === 0) {
    expect(repositoryBootstrap.blockers.some((blocker) => blocker.includes('Commit current generated changes'))).toBe(false)
  }
  expect(repositoryBootstrap.actions.some((action) => action.id === 'initialize-local-git')).toBe(true)
  expect(repositoryBootstrap.actions.some((action) => action.id === 'commit-current-snapshot')).toBe(true)
  expect(repositoryBootstrap.actions.some((action) => action.id === 'create-github-repository')).toBe(true)
  expect(repositoryBootstrapScript).toContain('AGL_ALLOW_REPOSITORY_BOOTSTRAP')
  expect(repositoryBootstrapScript).toContain('AGL_GITHUB_OWNER')
  expect(repositoryBootstrapScript).toContain('derive_repository_from_owner_hint')
  expect(repositoryBootstrapScript).toContain('AGL_ALLOW_GH_INFER_REPOSITORY')
  expect(repositoryBootstrapScript).toContain('AGL_ALLOW_SNAPSHOT_COMMIT')
  expect(repositoryBootstrapScript).toContain('derive_repository_name')
  expect(repositoryBootstrapScript).toContain('ssh://git@github.com/')
  expect(repositoryBootstrapScript).toContain('working tree has uncommitted changes')
  expect(repositoryBootstrapScript).not.toContain('gh workflow run')
  expect(bootstrap.stages.some((stage) => stage.id === 'repository-channel')).toBe(true)
  expect(bootstrap.stages.some((stage) => stage.id === 'repository-bootstrap')).toBe(true)
  expect(bootstrap.setupCommands.some((command) => command.id === 'repository-preflight')).toBe(true)
  expect(bootstrap.setupCommands.some((command) => command.id === 'repository-bootstrap-plan')).toBe(true)
  expect(packageJson.scripts['autonomous:repo-readiness']).toBe('node scripts/repository-readiness.mjs')
  expect(packageJson.scripts['autonomous:repo-bootstrap']).toBe('node scripts/repository-bootstrap.mjs')
  expect(packageJson.scripts['autonomous:daily']).toContain('autonomous:repo-readiness')
  expect(packageJson.scripts['autonomous:daily']).toContain('autonomous:repo-bootstrap')
})

test('product optimizer applies one guarded tuning step from product-gate evidence', async ({ page }) => {
  const optimization = JSON.parse(await readFile('data/product-optimization.json', 'utf8')) as {
    status: string
    productGates: {
      firstGameCompletion: { actual: number; gate: number; pass: boolean }
      replayRate: { actual: number; gate: number; pass: boolean }
      d1Retention: { actual: number; gate: number; pass: boolean }
    }
    controls: {
      noRepeatForSameSourceData: boolean
      oneTargetStepPerRun: boolean
      finishLineCoachBehindPaceOnly: boolean
      returnIntentMustBePlayerInitiated: boolean
    }
    actions: Array<{
      actionType: string
      status: string
      gameId?: string
      before?: number
      after?: number
    }>
    history: Array<{ actionType: string; status: string; gameId?: string; after?: number }>
  }
  const balance = JSON.parse(await readFile('data/game-balance.json', 'utf8')) as {
    games: Record<string, { targetScore: number; tuning: { targetStep: number } }>
  }
  const recovery = JSON.parse(await readFile('data/product-gate-recovery.json', 'utf8')) as {
    status: string
    summary: {
      failingGates: number
      primaryBottleneck: string
      quickestGateTest: string
      primaryExperimentStatus: string
    }
    gates: Array<{
      id: string
      denominator: number
      successes: number
      neededSuccesses: number
      promptViewsNeeded: number
      ownerLoop: string
    }>
    priorities: Array<{ gateId: string; ownerLoop: string; neededSuccesses: number }>
    experiments: Array<{
      gateId: string
      status: string
      canChangeCopy: boolean
      canChangePlacement: boolean
      promptViewsNeeded: number
      recommendedChange: string
    }>
    controls: {
      zeroPaidSpend: boolean
      noSyntheticGatePasses: boolean
      requireObservedTelemetryBeforeCopyChange: boolean
      copyChangeRequiresSampleReady: boolean
      placementChangeRequiresSampleReady: boolean
      noAutomaticRuleChanges: boolean
    }
  }
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    status: string
    summary: {
      primaryGateId: string
      fastestGateId: string
      defaultRouteGateId: string
      defaultRouteCampaignId: string
      missions: number
      totalPromptViewsNeeded: number
      totalObservedSuccessesNeeded: number
      supportingAggregateEvidenceNotes: number
      downloadsScanStatus: string
      downloadsScanCoolingDown: boolean
      downloadsScanNextRecommendedAt: string
    }
    downloadsScan: {
      explicitOptInRequired: boolean
      cooldownHours: number
      coolingDown: boolean
      nextRecommendedScanAt: string
    }
    missions: Array<{
      campaignId: string
      gateId: string
      status: string
      gameId: string
      needed: { promptViews: number; successes: number }
      sampleTiming: { latencyDays: number; sameSessionPlayable: boolean; reason: string }
      supportingAggregateEvidence: {
        gateDecisionEligible: boolean
        manualReviewRequired: boolean
        noteCount: number
        campaignNoteCount: number
        gateGameNoteCount: number
        matchScope: string
      }
      controls: { costUsd: number; noSyntheticEvents: boolean; noRuleChange: boolean }
    }>
    commandPlan: { refreshPlan: string; collectAndRefresh: string; collectDownloadsAndRefresh: string }
    publicSamplePage: {
      path: string
      missionCount: number
      primaryCampaignId: string
      defaultRouteCampaignId: string
      localProgressEnabled: boolean
      autonomousDefaultRoutingEnabled: boolean
      playerInitiatedExportEnabled: boolean
      playerInitiatedShareEnabled: boolean
      playerInitiatedAggregateEvidenceEnabled: boolean
      aggregateEvidenceIssueTemplate: string
      aggregateEvidenceRepository: string | null
      exportSurface: string
      zeroPaidSpend: boolean
      playerInitiatedOnly: boolean
      noSyntheticEvents: boolean
    }
    runtimeEvidencePolicy: {
      status: string
      surface: string
      localProgressSource: string
      campaignMatchProperties: string[]
      exportProperties: string[]
      publicPageExportProperties: string[]
      publicPageShareProperties: string[]
      defaultRouting: {
        status: string
        gateId: string
        campaignId: string
        gameId: string
        latencyDays: number | null
        source: string
        channel: string
        appliesWhen: string
        routeSelection: string
        eventPolicy: string
        controls: {
          zeroPaidSpend: boolean
          noSyntheticEvents: boolean
          noAutoPlay: boolean
          playerCanChooseAnotherGame: boolean
          noRevenueEnablement: boolean
        }
      }
      controls: {
        zeroPaidSpend: boolean
        localOnlyUntilCollectorConfigured: boolean
        noSyntheticEvents: boolean
        playerInitiatedExportOnly: boolean
      }
    }
    controls: {
      zeroPaidSpend: boolean
      noPaidTraffic: boolean
      noSyntheticGatePasses: boolean
      realEventDropsOnly: boolean
      downloadsImportRequiresExplicitOptIn: boolean
      downloadsScanBackoffRequired: boolean
      directTrafficSampleRouting: boolean
      playerInitiatedSampleSharing: boolean
      noAutomaticRuleChanges: boolean
      requireObservedTelemetryBeforeRecoveryChange: boolean
      publicAggregateEvidenceIsSupportingOnly: boolean
      aggregateEvidenceDoesNotPassGates: boolean
    }
  }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }
  const targetAction = optimization.actions.find((action) => action.actionType === 'target-score-curve')
  const completionAction = optimization.actions.find(
    (action) => action.actionType === 'runtime-completion-nudge',
  )
  const finishLineAction = optimization.actions.find(
    (action) => action.actionType === 'runtime-finish-line-coach',
  )
  const returnIntentAction = optimization.actions.find(
    (action) => action.actionType === 'runtime-return-intent-activation',
  )

  expect(optimization.status).toBe('product-optimization-ready')
  expect(optimization.productGates.firstGameCompletion.pass).toBe(false)
  expect(optimization.productGates.replayRate.pass).toBe(false)
  expect(optimization.productGates.d1Retention.pass).toBe(false)
  expect(optimization.controls.noRepeatForSameSourceData).toBe(true)
  expect(optimization.controls.oneTargetStepPerRun).toBe(true)
  expect(optimization.controls.finishLineCoachBehindPaceOnly).toBe(true)
  expect(optimization.controls.returnIntentMustBePlayerInitiated).toBe(true)
  expect(completionAction?.status).toBe('armed')
  expect(finishLineAction?.status).toBe('armed')
  expect(returnIntentAction?.status).toBe('armed')
  expect(targetAction?.status).toMatch(/applied|already-applied/)
  expect(targetAction?.gameId).toBeTruthy()

  const tunedGame = balance.games[targetAction?.gameId ?? '']
  expect(tunedGame.targetScore).toBe(targetAction?.after)
  expect((targetAction?.before ?? 0) - (targetAction?.after ?? 0)).toBeLessThanOrEqual(
    tunedGame.tuning.targetStep,
  )
  expect(optimization.history.some((action) => action.gameId === targetAction?.gameId)).toBe(true)

  await page.goto('/')
  await expect(page.getByLabel('Product Optimization')).toContainText('product-optimization-ready')
  expect(recovery.status).toBe('product-gate-recovery-ready')
  expect(recovery.summary.failingGates).toBe(3)
  expect(recovery.summary.primaryBottleneck).toBe('firstGameCompletion')
  expect(recovery.summary.quickestGateTest).toBe('d1Retention')
  expect(recovery.summary.primaryExperimentStatus).toBe('collecting-sample')
  expect(recovery.controls.zeroPaidSpend).toBe(true)
  expect(recovery.controls.noSyntheticGatePasses).toBe(true)
  expect(recovery.controls.requireObservedTelemetryBeforeCopyChange).toBe(true)
  expect(recovery.controls.copyChangeRequiresSampleReady).toBe(true)
  expect(recovery.controls.placementChangeRequiresSampleReady).toBe(true)
  expect(recovery.controls.noAutomaticRuleChanges).toBe(true)

  const completionRecovery = recovery.gates.find((gate) => gate.id === 'firstGameCompletion')
  const replayRecovery = recovery.gates.find((gate) => gate.id === 'replayRate')
  const retentionRecovery = recovery.gates.find((gate) => gate.id === 'd1Retention')
  const additionalSuccessesToReachGate = ({
    gate,
    denominator,
    successes,
  }: {
    gate: number
    denominator: number
    successes: number
  }) => {
    if (successes >= gate * denominator) {
      return 0
    }

    return Math.max(0, Math.ceil((gate * denominator - successes) / (1 - gate)))
  }

  expect(completionRecovery?.neededSuccesses).toBe(
    additionalSuccessesToReachGate({
      gate: 0.55,
      denominator: completionRecovery?.denominator ?? 0,
      successes: completionRecovery?.successes ?? 0,
    }),
  )
  expect(replayRecovery?.neededSuccesses).toBe(
    additionalSuccessesToReachGate({
      gate: 0.35,
      denominator: replayRecovery?.denominator ?? 0,
      successes: replayRecovery?.successes ?? 0,
    }),
  )
  expect(retentionRecovery?.neededSuccesses).toBe(
    additionalSuccessesToReachGate({
      gate: 0.18,
      denominator: retentionRecovery?.denominator ?? 0,
      successes: retentionRecovery?.successes ?? 0,
    }),
  )
  expect(completionRecovery?.neededSuccessesMode).toBe('additional-successes-raise-observed-rate')
  expect(completionRecovery?.projectedRateAfterNeededSuccesses).toBeGreaterThanOrEqual(0.55)
  expect(replayRecovery?.projectedRateAfterNeededSuccesses).toBeGreaterThanOrEqual(0.35)
  expect(retentionRecovery?.projectedRateAfterNeededSuccesses).toBeGreaterThanOrEqual(0.18)
  expect(recovery.priorities[0].ownerLoop).toBe('completion-loop')
  expect(completionRecovery?.promptViewsNeeded).toBeGreaterThan(0)
  expect(recovery.experiments[0]).toMatchObject({
    gateId: 'firstGameCompletion',
    status: 'collecting-sample',
    canChangeCopy: false,
    canChangePlacement: false,
    recommendedChange: 'hold-current-runtime-copy',
  })
  expect(samplePlan.status).toBe('product-gate-sample-plan-ready')
  expect(samplePlan.summary.primaryGateId).toBe(recovery.summary.primaryBottleneck)
  expect(samplePlan.summary.fastestGateId).toBe(recovery.summary.quickestGateTest)
  expect(samplePlan.summary.defaultRouteGateId).toBeTruthy()
  expect(samplePlan.summary.defaultRouteGateId).toBe(samplePlan.summary.primaryGateId)
  expect(samplePlan.summary.defaultRouteCampaignId).toBe(samplePlan.publicSamplePage.defaultRouteCampaignId)
  expect(samplePlan.summary.missions).toBe(recovery.summary.failingGates)
  expect(samplePlan.summary.totalPromptViewsNeeded).toBe(
    recovery.gates.reduce((sum, gate) => sum + gate.promptViewsNeeded, 0),
  )
  expect(samplePlan.summary.totalObservedSuccessesNeeded).toBe(
    recovery.gates.reduce((sum, gate) => sum + gate.neededSuccesses, 0),
  )
  expect(typeof samplePlan.summary.supportingAggregateEvidenceNotes).toBe('number')
  expect(samplePlan.commandPlan.refreshPlan).toBe('npm run autonomous:sample-plan')
  expect(samplePlan.commandPlan.collectAndRefresh).toContain('autonomous:gate-recovery')
  expect(samplePlan.commandPlan.collectAndRefresh).toContain('autonomous:retention')
  expect(samplePlan.commandPlan.collectDownloadsAndRefresh).toBe('npm run autonomous:collect-sample-downloads')
  expect(packageJson.scripts['test:automation']).toContain('autonomous:gate-recovery')
  expect(packageJson.scripts['test:automation']).toContain('autonomous:sample-plan')
  expect(samplePlan.downloadsScan.explicitOptInRequired).toBe(true)
  expect(samplePlan.downloadsScan.cooldownHours).toBe(4)
  expect(samplePlan.summary.downloadsScanCoolingDown).toBe(samplePlan.downloadsScan.coolingDown)
  expect(samplePlan.summary.downloadsScanNextRecommendedAt).toBe(samplePlan.downloadsScan.nextRecommendedScanAt)
  expect(samplePlan.publicSamplePage.path).toBe('/gate-sample.html')
  expect(samplePlan.publicSamplePage.missionCount).toBe(samplePlan.missions.length)
  expect(samplePlan.publicSamplePage.primaryCampaignId).toBe(samplePlan.missions[0].campaignId)
  expect(samplePlan.publicSamplePage.defaultRouteCampaignId).toBe(samplePlan.runtimeEvidencePolicy.defaultRouting.campaignId)
  expect(samplePlan.publicSamplePage.localProgressEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.autonomousDefaultRoutingEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.playerInitiatedExportEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.playerInitiatedShareEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.playerInitiatedAggregateEvidenceEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.aggregateEvidenceIssueTemplate).toBe('analytics-evidence.yml')
  expect(samplePlan.publicSamplePage.aggregateEvidenceRepository).toBe('moshequ/autonomous-game-lab')
  expect(samplePlan.publicSamplePage.exportSurface).toBe('product-gate-sample')
  expect(samplePlan.publicSamplePage.zeroPaidSpend).toBe(true)
  expect(samplePlan.publicSamplePage.playerInitiatedOnly).toBe(true)
  expect(samplePlan.publicSamplePage.noSyntheticEvents).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.status).toBe('active')
  expect(samplePlan.runtimeEvidencePolicy.surface).toBe('product-gate-sample-plan-card')
  expect(samplePlan.runtimeEvidencePolicy.localProgressSource).toBe('agl.analytics.events')
  expect(samplePlan.runtimeEvidencePolicy.campaignMatchProperties).toContain('acquisitionCampaign')
  expect(samplePlan.runtimeEvidencePolicy.exportProperties).toContain('localObservedSuccesses')
  expect(samplePlan.runtimeEvidencePolicy.publicPageExportProperties).toContain('exportSurfaceDetail')
  expect(samplePlan.runtimeEvidencePolicy.publicPageExportProperties).toContain('localEvidenceDropReady')
  expect(samplePlan.runtimeEvidencePolicy.publicPageShareProperties).toContain('shareUrl')
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting).toMatchObject({
    status: 'active',
    campaignId: samplePlan.summary.defaultRouteCampaignId,
    gateId: samplePlan.summary.primaryGateId,
    latencyDays: 0,
    source: 'gate_sample',
    channel: 'product-gate-sample',
    routeSelection: 'lowest-validation-latency-primary-bottleneck-first',
    eventPolicy: 'real-player-events-only',
  })
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting.controls.zeroPaidSpend).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting.controls.noSyntheticEvents).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting.controls.noAutoPlay).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting.controls.playerCanChooseAnotherGame).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.controls.zeroPaidSpend).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.controls.localOnlyUntilCollectorConfigured).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.controls.noSyntheticEvents).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.controls.playerInitiatedExportOnly).toBe(true)
  expect(samplePlan.controls.zeroPaidSpend).toBe(true)
  expect(samplePlan.controls.noPaidTraffic).toBe(true)
  expect(samplePlan.controls.noSyntheticGatePasses).toBe(true)
  expect(samplePlan.controls.noAutomaticRuleChanges).toBe(true)
  expect(samplePlan.controls.realEventDropsOnly).toBe(true)
  expect(samplePlan.controls.publicAggregateEvidenceIsSupportingOnly).toBe(true)
  expect(samplePlan.controls.aggregateEvidenceDoesNotPassGates).toBe(true)
  expect(samplePlan.missions.every((mission) => mission.supportingAggregateEvidence.gateDecisionEligible === false)).toBe(true)
  expect(samplePlan.missions.every((mission) => mission.supportingAggregateEvidence.manualReviewRequired === true)).toBe(true)
  expect(samplePlan.missions.every((mission) => typeof mission.supportingAggregateEvidence.matchScope === 'string')).toBe(true)
  expect(samplePlan.missions.every((mission) => typeof mission.supportingAggregateEvidence.campaignNoteCount === 'number')).toBe(true)
  expect(samplePlan.missions.every((mission) => typeof mission.supportingAggregateEvidence.gateGameNoteCount === 'number')).toBe(true)
  expect(samplePlan.controls.downloadsImportRequiresExplicitOptIn).toBe(true)
  expect(samplePlan.controls.downloadsScanBackoffRequired).toBe(true)
  expect(samplePlan.controls.directTrafficSampleRouting).toBe(true)
  expect(samplePlan.controls.playerInitiatedSampleSharing).toBe(true)
  expect(samplePlan.controls.requireObservedTelemetryBeforeRecoveryChange).toBe(true)
  expect(samplePlan.missions[0]).toMatchObject({
    gateId: 'firstGameCompletion',
    status: 'collecting-sample',
    sampleTiming: { latencyDays: 0, sameSessionPlayable: true },
    evidence: { status: 'waiting-for-player-export' },
    controls: { costUsd: 0, noSyntheticEvents: true, noRuleChange: true },
  })
  expect(samplePlan.missions.find((mission) => mission.gateId === 'd1Retention')?.sampleTiming).toMatchObject({
    latencyDays: 1,
    sameSessionPlayable: false,
  })
  await expect(page.getByLabel('Product Gate Recovery')).toContainText('product-gate-recovery-ready')
  await expect(page.getByLabel('Product Gate Recovery')).toContainText('firstGameCompletion')
  await expect(page.getByLabel('Product Gate Recovery')).toContainText('collecting-sample')
  await expect(page.getByLabel('Product Gate Sample Plan')).toContainText('product-gate-sample-plan-ready')
  await expect(page.getByLabel('Product Gate Sample Plan')).toContainText('firstGameCompletion')
  await expect(page.getByLabel('Product Gate Sample Plan')).toContainText('d1Retention')
  await expect(page.getByLabel('Product Gate Sample Plan')).toContainText('Default route')
  await expect(page.getByLabel('Product Gate Sample Plan')).toContainText('Local sample')
  await expect(page.getByLabel('Product Gate Sample Plan')).toContainText('Export state')
})

test('product gate recovery marks passing gates as monitoring instead of collecting sample', async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'agl-gate-recovery-'))
  const dataDir = path.join(tempRoot, 'data')

  try {
    await mkdir(dataDir, { recursive: true })
    await writeFile(
      path.join(dataDir, 'analytics-rollup.json'),
      JSON.stringify(
        {
          sourceStatus: { activeSource: 'temp-observed-sample' },
          totals: {
            counts: {
              game_started: 10,
              level_completed: 8,
              replay_clicked: 3,
              replay_prompt_viewed: 4,
              replay_prompt_clicked: 3,
              daily_return_prompt_viewed: 2,
              daily_return_intent_started: 2,
            },
            metrics: {
              firstGameCompletion: 0.8,
              replayRate: 0.375,
              d1Retention: 0.25,
            },
          },
          retention: {
            source: 'temp-retention',
            eligibleUsers: 8,
            retainedUsers: 2,
          },
        },
        null,
        2,
      ),
    )
    await writeFile(
      path.join(dataDir, 'production-gates.json'),
      JSON.stringify(
        {
          monetization: {
            minFirstGameCompletion: 0.55,
            minReplayRate: 0.35,
            minD1Retention: 0.18,
          },
        },
        null,
        2,
      ),
    )
    await writeFile(
      path.join(dataDir, 'product-optimization.json'),
      JSON.stringify(
        {
          status: 'product-optimization-ready',
          productGates: {
            firstGameCompletion: { actual: 0.8 },
            replayRate: { actual: 0.375 },
            d1Retention: { actual: 0.25 },
          },
        },
        null,
        2,
      ),
    )
    await writeFile(
      path.join(dataDir, 'completion-loop.json'),
      JSON.stringify(
        {
          status: 'completion-loop-ready',
          promptPolicy: {
            surface: 'mid-run',
            telemetry: {
              viewed: 'completion_nudge_viewed',
              clicked: 'completion_nudge_clicked',
            },
          },
          finishLinePolicy: {
            telemetry: {
              viewed: 'finish_line_coach_viewed',
              clicked: 'finish_line_coach_clicked',
            },
          },
        },
        null,
        2,
      ),
    )
    await writeFile(
      path.join(dataDir, 'replay-loop.json'),
      JSON.stringify(
        {
          status: 'replay-loop-ready',
          promptPolicy: {
            surface: 'completed-run',
            telemetry: {
              viewed: 'replay_prompt_viewed',
              clicked: 'replay_prompt_clicked',
              dismissed: 'replay_prompt_dismissed',
            },
          },
        },
        null,
        2,
      ),
    )
    await writeFile(
      path.join(dataDir, 'retention-loop.json'),
      JSON.stringify(
        {
          status: 'retention-loop-ready',
          promptPolicy: {
            telemetry: {
              viewed: 'daily_return_prompt_viewed',
              clicked: 'daily_return_prompt_clicked',
              dismissed: 'daily_return_prompt_dismissed',
            },
          },
          returnIntentPolicy: {
            surface: 'daily-return',
            telemetry: {
              viewed: 'daily_return_intent_viewed',
              started: 'daily_return_intent_started',
              cleared: 'daily_return_intent_cleared',
            },
          },
        },
        null,
        2,
      ),
    )
    await writeFile(
      path.join(dataDir, 'first-move-coach.json'),
      JSON.stringify({ status: 'first-move-coach-ready' }, null, 2),
    )
    await writeFile(
      path.join(dataDir, 'monetization-plan.json'),
      JSON.stringify({ status: 'blocked-by-product-gates', revenueEnabled: false }, null, 2),
    )

    await execFileAsync('node', [path.join(process.cwd(), 'scripts/product-gate-recovery.mjs')], {
      cwd: tempRoot,
    })

    const recovery = JSON.parse(await readFile(path.join(dataDir, 'product-gate-recovery.json'), 'utf8')) as {
      summary: { failingGates: number; passingGates: number; primaryExperimentStatus: string }
      gates: Array<{
        id: string
        pass: boolean
        status: string
        experimentStatus: string
        recommendedChange: string
        promptViewsNeeded: number
      }>
    }

    expect(recovery.summary.failingGates).toBe(0)
    expect(recovery.summary.passingGates).toBe(3)
    expect(recovery.summary.primaryExperimentStatus).toBe('gate-passing')
    expect(recovery.gates.every((gate) => gate.pass)).toBe(true)
    expect(recovery.gates.every((gate) => gate.status === 'passing')).toBe(true)
    expect(recovery.gates.every((gate) => gate.experimentStatus === 'gate-passing')).toBe(true)
    expect(recovery.gates.every((gate) => gate.recommendedChange === 'monitor-gate')).toBe(true)
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
})

test('product gate sample mission starts an attributed zero-spend evidence run', async ({ page }) => {
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    summary: { fastestGateId: string }
    missions: Array<{
      gateId: string
      gameId: string
      title: string
      campaignId: string
      needed: { promptViews: number; successes: number }
      controls: { costUsd: number; noSyntheticEvents: boolean; noRuleChange: boolean; noRevenueEnablement: boolean }
      evidence: { status: string }
    }>
  }
  const mission = samplePlan.missions[0]
  const fastestMission = samplePlan.missions.find((item) => item.gateId === samplePlan.summary.fastestGateId)

  await page.goto('/')

  const samplePanel = page.getByLabel('Product Gate Sample Plan')
  await samplePanel.scrollIntoViewIfNeeded()
  await samplePanel.getByRole('button', { name: `Start sample for ${mission.title}` }).click()

  await expect(page.getByLabel('Autonomy cockpit').getByRole('heading', { name: mission.title })).toBeVisible()
  expect(page.url()).toContain(`game=${mission.gameId}`)
  expect(page.url()).toContain('utm_source=gate_sample')
  expect(page.url()).toContain(`utm_campaign=${mission.campaignId}`)

  const missionClick = await page.evaluate((campaignId) => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    for (let index = events.length - 1; index >= 0; index -= 1) {
      const event = events[index]
      if (event.name === 'gate_sample_mission_clicked' && event.properties.campaignId === campaignId) {
        return event.properties
      }
    }

    return null
  }, mission.campaignId)

  expect(missionClick).toMatchObject({
    gameId: mission.gameId,
    gateId: mission.gateId,
    campaignId: mission.campaignId,
    acquisitionSource: 'gate_sample',
    acquisitionCampaign: mission.campaignId,
    acquisitionChannel: 'product-gate-sample',
    costUsd: mission.controls.costUsd,
    noSyntheticEvents: mission.controls.noSyntheticEvents,
    noRuleChange: mission.controls.noRuleChange,
    noRevenueEnablement: mission.controls.noRevenueEnablement,
    promptViewsNeeded: mission.needed.promptViews,
    observedSuccessesNeeded: mission.needed.successes,
  })

  await expect
    .poll(async () =>
      page.evaluate((campaignId) => {
        const raw = window.localStorage.getItem('agl.analytics.events')
        const events = raw ? JSON.parse(raw) : []
        const started = events.find(
          (event) => event.name === 'game_started' && event.properties.acquisitionCampaign === campaignId,
        )

        return started?.properties.gameId ?? null
      }, mission.campaignId),
    )
    .toBe(mission.gameId)

  const handoff = page.getByLabel('Gate Sample Evidence Handoff')
  await expect(handoff).toContainText(mission.title)
  await expect(handoff).toContainText('export-ready')
  await expect(handoff.getByRole('button', { name: `Export evidence for ${mission.title}` })).toBeVisible()
  await expect(handoff.getByRole('button', { name: `Share aggregate for ${mission.title}` })).toBeVisible()

  await page.evaluate(() => {
    const target = window as Window & { __gateHandoffAggregateUrl?: string }
    target.__gateHandoffAggregateUrl = ''
    window.open = ((url?: string | URL) => {
      target.__gateHandoffAggregateUrl = String(url)
      return window
    }) as typeof window.open
  })

  await handoff.getByRole('button', { name: `Share aggregate for ${mission.title}` }).click()
  await page.waitForFunction(
    () => Boolean((window as Window & { __gateHandoffAggregateUrl?: string }).__gateHandoffAggregateUrl),
  )

  const handoffAggregateUrl = await page.evaluate(
    () => (window as Window & { __gateHandoffAggregateUrl?: string }).__gateHandoffAggregateUrl ?? '',
  )
  const handoffAggregateIssue = new URL(handoffAggregateUrl)
  const handoffAggregateText = decodeURIComponent(handoffAggregateUrl)
  const handoffAggregateEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return events.findLast(
      (event: { name: string; properties: Record<string, string | number | boolean | null> }) =>
        event.name === 'analytics_evidence_issue_opened',
    )?.properties
  })

  expect(handoffAggregateIssue.hostname).toBe('github.com')
  expect(handoffAggregateIssue.searchParams.get('template')).toBe('analytics-evidence.yml')
  expect(handoffAggregateIssue.searchParams.get('title')).toContain('gate sample aggregate counts')
  expect(handoffAggregateIssue.searchParams.get('game')).toContain(mission.title)
  expect(handoffAggregateIssue.searchParams.get('game')).toContain(mission.gateId)
  expect(handoffAggregateIssue.searchParams.get('game')).toContain(mission.campaignId)
  expect(Number(handoffAggregateIssue.searchParams.get('starts'))).toBeGreaterThanOrEqual(1)
  expect(handoffAggregateIssue.searchParams.get('summary')).toContain('Aggregate-only browser summary')
  expect(handoffAggregateIssue.searchParams.get('summary')).toContain('does not pass product gates')
  expect(handoffAggregateText).not.toContain('anon-')
  expect(handoffAggregateText).not.toContain('evt-')
  expect(handoffAggregateEvent).toMatchObject({
    surface: 'runtime-gate-sample-handoff',
    channel: 'product-gate-sample',
    gameId: mission.gameId,
    gateId: mission.gateId,
    campaignId: mission.campaignId,
    publicAggregateOnly: true,
    rawEventsIncluded: false,
    identifiersIncluded: false,
    aggregateEvidenceDoesNotPassGates: true,
    destination: 'github-issues',
    zeroPaidSpend: true,
    noRevenueEnablement: true,
  })

  const handoffDownloadPromise = page.waitForEvent('download')
  await handoff.getByRole('button', { name: `Export evidence for ${mission.title}` }).click()
  const handoffDownload = await handoffDownloadPromise
  const handoffDownloadPath = await handoffDownload.path()

  expect(handoffDownload.suggestedFilename()).toMatch(/^player-events-\d{4}-\d{2}-\d{2}\.json$/)
  expect(handoffDownloadPath).toBeTruthy()

  if (handoffDownloadPath) {
    const handoffEvents = JSON.parse(await readFile(handoffDownloadPath, 'utf8')) as Array<{
      name: string
      properties: Record<string, string | number | boolean>
    }>
    const promptView = handoffEvents.findLast((event) => event.name === 'gate_sample_export_prompt_viewed')
    const promptClick = handoffEvents.findLast((event) => event.name === 'gate_sample_export_prompt_clicked')
    const exportEvent = handoffEvents.findLast((event) => event.name === 'analytics_exported')

    expect(promptView?.properties).toMatchObject({
      surface: 'runtime-gate-sample-handoff',
      exportSurface: 'product-gate-sample',
      status: 'export-ready',
      campaignId: mission.campaignId,
      gateId: mission.gateId,
      gameId: mission.gameId,
      zeroPaidSpend: true,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
    })
    expect(promptClick?.properties).toMatchObject({
      exportSurface: 'product-gate-sample',
      exportSurfaceDetail: 'runtime-gate-sample-handoff',
      campaignId: mission.campaignId,
      localEvidenceDropReady: true,
      localSampleDecisionReady: false,
    })
    expect(exportEvent?.properties).toMatchObject({
      exportSurface: 'product-gate-sample',
      exportSurfaceDetail: 'runtime-gate-sample-handoff',
      campaignId: mission.campaignId,
      acquisitionCampaign: mission.campaignId,
      acquisitionSource: 'gate_sample',
    })
  }

  const downloadPromise = page.waitForEvent('download')
  await samplePanel.getByRole('button', { name: `Export sample evidence for ${mission.title}` }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()

  expect(download.suggestedFilename()).toMatch(/^player-events-\d{4}-\d{2}-\d{2}\.json$/)
  expect(downloadPath).toBeTruthy()

  if (downloadPath) {
    const events = JSON.parse(await readFile(downloadPath, 'utf8')) as Array<{
      name: string
      properties: Record<string, string | number | boolean>
    }>
    const exportEvent = events.findLast((event) => event.name === 'analytics_exported')

    expect(exportEvent?.properties).toMatchObject({
      exportSurface: 'product-gate-sample',
      gateId: mission.gateId,
      gameId: mission.gameId,
      campaignId: mission.campaignId,
      noSyntheticEvents: mission.controls.noSyntheticEvents,
      acquisitionCampaign: mission.campaignId,
      acquisitionSource: 'gate_sample',
      localEvidenceDropReady: true,
    })
    expect(Number(exportEvent?.properties.localCampaignEvents ?? 0)).toBeGreaterThanOrEqual(1)
    expect(Number(exportEvent?.properties.localPromptViewsRemaining ?? -1)).toBeGreaterThanOrEqual(0)
    expect(Number(exportEvent?.properties.localSuccessesRemaining ?? -1)).toBeGreaterThanOrEqual(0)
  }

  expect(fastestMission).toBeTruthy()

  if (fastestMission && fastestMission.campaignId !== mission.campaignId) {
    await samplePanel.getByRole('button', { name: `Start fastest sample for ${fastestMission.title}` }).click()

    await expect(page.getByLabel('Autonomy cockpit').getByRole('heading', { name: fastestMission.title })).toBeVisible()
    expect(page.url()).toContain(`game=${fastestMission.gameId}`)
    expect(page.url()).toContain(`utm_campaign=${fastestMission.campaignId}`)

    const fastestMissionClick = await page.evaluate((campaignId) => {
      const raw = window.localStorage.getItem('agl.analytics.events')
      const events = raw ? JSON.parse(raw) : []

      return events.findLast(
        (event: { name: string; properties: Record<string, string | number | boolean> }) =>
          event.name === 'gate_sample_mission_clicked' && event.properties.campaignId === campaignId,
      )?.properties
    }, fastestMission.campaignId)

    expect(fastestMissionClick).toMatchObject({
      gameId: fastestMission.gameId,
      gateId: fastestMission.gateId,
      campaignId: fastestMission.campaignId,
      acquisitionSource: 'gate_sample',
      acquisitionCampaign: fastestMission.campaignId,
      acquisitionChannel: 'product-gate-sample',
      promptViewsNeeded: fastestMission.needed.promptViews,
      observedSuccessesNeeded: fastestMission.needed.successes,
    })

    const fastestDownloadPromise = page.waitForEvent('download')
    await samplePanel.getByRole('button', { name: `Export fastest evidence for ${fastestMission.title}` }).click()
    const fastestDownload = await fastestDownloadPromise
    const fastestDownloadPath = await fastestDownload.path()

    expect(fastestDownload.suggestedFilename()).toMatch(/^player-events-\d{4}-\d{2}-\d{2}\.json$/)
    expect(fastestDownloadPath).toBeTruthy()

    if (fastestDownloadPath) {
      const fastestEvents = JSON.parse(await readFile(fastestDownloadPath, 'utf8')) as Array<{
        name: string
        properties: Record<string, string | number | boolean>
      }>
      const fastestExportEvent = fastestEvents.findLast((event) => event.name === 'analytics_exported')

      expect(fastestExportEvent?.properties).toMatchObject({
        exportSurface: 'product-gate-sample',
        gateId: fastestMission.gateId,
        gameId: fastestMission.gameId,
        campaignId: fastestMission.campaignId,
        localEvidenceDropReady: true,
        acquisitionCampaign: fastestMission.campaignId,
        acquisitionSource: 'gate_sample',
      })
      expect(Number(fastestExportEvent?.properties.localCampaignEvents ?? 0)).toBeGreaterThanOrEqual(1)
    }
  }
})

test('direct gate sample links self-attribute the mission start', async ({ page }) => {
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    missions: Array<{
      gateId: string
      gameId: string
      title: string
      campaignId: string
      playPath: string
      needed: { promptViews: number; successes: number }
      controls: { costUsd: number; noSyntheticEvents: boolean; noRuleChange: boolean; noRevenueEnablement: boolean }
    }>
  }
  const mission = samplePlan.missions[0]

  await page.goto(mission.playPath)
  await expect(page.getByLabel('Autonomy cockpit').getByRole('heading', { name: mission.title })).toBeVisible()

  const missionClick = await page.evaluate((campaignId) => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return events.findLast(
      (event: { name: string; properties: Record<string, string | number | boolean> }) =>
        event.name === 'gate_sample_mission_clicked' && event.properties.campaignId === campaignId,
    )?.properties
  }, mission.campaignId)

  expect(missionClick).toMatchObject({
    gameId: mission.gameId,
    gateId: mission.gateId,
    campaignId: mission.campaignId,
    acquisitionSource: 'gate_sample',
    acquisitionCampaign: mission.campaignId,
    acquisitionChannel: 'product-gate-sample',
    surface: 'direct-gate-sample-link',
    costUsd: mission.controls.costUsd,
    noSyntheticEvents: mission.controls.noSyntheticEvents,
    noRuleChange: mission.controls.noRuleChange,
    noRevenueEnablement: mission.controls.noRevenueEnablement,
    promptViewsNeeded: mission.needed.promptViews,
    observedSuccessesNeeded: mission.needed.successes,
  })
})

test('direct root visits route into the default gate sample without paid traffic', async ({ page }) => {
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    summary: { defaultRouteCampaignId: string }
    runtimeEvidencePolicy: {
      defaultRouting: {
        status: string
        campaignId: string
        gateId: string
        gameId: string
        source: string
        channel: string
        controls: { zeroPaidSpend: boolean; noSyntheticEvents: boolean; noAutoPlay: boolean }
      }
    }
    missions: Array<{ gateId: string; gameId: string; title: string; campaignId: string }>
  }
  const defaultMission =
    samplePlan.missions.find((mission) => mission.campaignId === samplePlan.summary.defaultRouteCampaignId) ??
    samplePlan.missions[0]

  await page.goto('/')
  await expect(page.getByLabel('Autonomy cockpit').getByRole('heading', { name: defaultMission.title })).toBeVisible()
  await page.waitForFunction((campaignId) => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return events.some(
      (event: { name: string; properties: Record<string, string> }) =>
        event.name === 'local_router_card_viewed' && event.properties.campaignId === campaignId,
    )
  }, defaultMission.campaignId)

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const appLoaded = events.findLast((event: { name: string }) => event.name === 'app_loaded')
  const routerViewed = events.findLast(
    (event: { name: string; properties: Record<string, string | number | boolean> }) =>
      event.name === 'local_router_card_viewed' && event.properties.campaignId === defaultMission.campaignId,
  )

  expect(samplePlan.runtimeEvidencePolicy.defaultRouting).toMatchObject({
    status: 'active',
    campaignId: defaultMission.campaignId,
    gateId: defaultMission.gateId,
    gameId: defaultMission.gameId,
    source: 'gate_sample',
    channel: 'product-gate-sample',
  })
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting.controls.zeroPaidSpend).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting.controls.noSyntheticEvents).toBe(true)
  expect(samplePlan.runtimeEvidencePolicy.defaultRouting.controls.noAutoPlay).toBe(true)
  expect(appLoaded?.properties).toMatchObject({
    acquisitionSource: 'gate_sample',
    acquisitionCampaign: defaultMission.campaignId,
    acquisitionChannel: 'product-gate-sample',
    autonomousDefaultGateSampleRouting: true,
    defaultGateSampleCampaignId: defaultMission.campaignId,
    zeroPaidSpend: true,
    noSyntheticEvents: true,
  })
  expect(routerViewed?.properties).toMatchObject({
    campaignId: defaultMission.campaignId,
    channel: 'product-gate-sample',
    zeroPaidSpend: true,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
  })
})

test('first move coach highlights a safe opening and records coach telemetry', async ({ page }) => {
  const coach = JSON.parse(await readFile('data/first-move-coach.json', 'utf8')) as {
    status: string
    summary: { enabledTargets: number; coachSampleStatus: string; coachDecision: string }
    metrics: { shown: number; used: number; skipped: number; usageRate: number; skipRate: number }
    samplePolicy: {
      status: string
      minimumShownForDecision: number
      minimumResolvedForDecision: number
      current: { shown: number; used: number; skipped: number; resolved: number }
      needed: { shown: number; resolved: number }
      telemetry: { shown: string; used: string; skipped: string }
      decisionReady: boolean
    }
    decisionPolicy: { currentDecision: string; fallbackWhenSampleSmall: string }
    controls: { firstTurnOnly: boolean; noAutoMove: boolean; noDecisionWithoutSample: boolean }
    targets: Array<{
      gameId: string
      enabled: boolean
      variantId: string
      runtimeSupported: boolean
      recommendedCell: { row: number; col: number }
      evidence: { shown: number; used: number; skipped: number; sampleReady: boolean }
    }>
  }
  const harborTarget = coach.targets.find((target) => target.gameId === 'harbor-rings')

  expect(coach.status).toBe('first-move-coach-ready')
  expect(coach.summary.enabledTargets).toBeGreaterThan(0)
  expect(coach.summary.coachSampleStatus).toBe(coach.samplePolicy.status)
  expect(coach.summary.coachDecision).toBe(coach.decisionPolicy.currentDecision)
  expect(coach.metrics).toMatchObject({ shown: 0, used: 0, skipped: 0 })
  expect(coach.samplePolicy).toMatchObject({
    status: 'collecting-sample',
    minimumShownForDecision: 30,
    minimumResolvedForDecision: 20,
    needed: { shown: 30, resolved: 20 },
    decisionReady: false,
  })
  expect(coach.samplePolicy.telemetry).toMatchObject({
    shown: 'first_move_coach_shown',
    used: 'first_move_coach_used',
    skipped: 'first_move_coach_skipped',
  })
  expect(coach.decisionPolicy.currentDecision).toBe('active')
  expect(coach.decisionPolicy.fallbackWhenSampleSmall).toBe(
    'collect-more-real-first-turn-coach-events',
  )
  expect(coach.controls.firstTurnOnly).toBe(true)
  expect(coach.controls.noAutoMove).toBe(true)
  expect(coach.controls.noDecisionWithoutSample).toBe(true)
  expect(harborTarget?.enabled).toBe(true)
  expect(harborTarget?.runtimeSupported).toBe(true)
  expect(harborTarget?.variantId).toBe('fast-start')
  expect(harborTarget?.recommendedCell).toMatchObject({ row: 2, col: 2 })
  expect(harborTarget?.evidence).toMatchObject({ shown: 0, used: 0, skipped: 0, sampleReady: false })

  await page.addInitScript(() => {
    window.localStorage.setItem('agl.experiment.first_session_pacing', 'fast-start')
  })
  await page.goto('/?game=harbor-rings')
  await expect(
    page.getByLabel('Autonomy cockpit').getByRole('heading', { name: 'Harbor Rings' }),
  ).toBeVisible()
  await expect(page.getByLabel('First Move Coach')).toContainText(coach.samplePolicy.status)
  await expect(page.getByLabel('First Move Coach')).toContainText(coach.decisionPolicy.currentDecision)

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  await page.mouse.click(box.x + (280 / 560) * box.width, box.y + (306 / 500) * box.height)
  await expect(page.getByText(/^1\/\d+$/).first()).toBeVisible()

  const { coachEvents, tutorialEvent } = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return {
      coachEvents: events.filter((event: { name: string }) => event.name.startsWith('first_move_coach_')),
      tutorialEvent: events.findLast((event: { name: string }) => event.name === 'tutorial_completed'),
    }
  })
  const shown = coachEvents.find((event: { name: string }) => event.name === 'first_move_coach_shown')
  const used = coachEvents.find((event: { name: string }) => event.name === 'first_move_coach_used')

  expect(shown.properties.gameId).toBe('harbor-rings')
  expect(shown.properties.recommendedRow).toBe(2)
  expect(shown.properties.recommendedCol).toBe(2)
  expect(used.properties.gameId).toBe('harbor-rings')
  expect(used.properties.row).toBe(2)
  expect(used.properties.col).toBe(2)
  expect(used.properties.recommendedRow).toBe(2)
  expect(used.properties.recommendedCol).toBe(2)
  expect(tutorialEvent.properties.gameId).toBe('harbor-rings')
  expect(tutorialEvent.properties.variantId).toBe('fast-start')
  expect(tutorialEvent.properties.tutorialCopyMode).toBe('fast-start-one-sentence')
  expect(tutorialEvent.properties.tutorialCopySentences).toBe(1)
  expect(tutorialEvent.properties.tutorialCopyChars).toBeLessThanOrEqual(60)
  expect(tutorialEvent.properties.targetGate).toBe('firstGameCompletion')
})

test('production bootstrap emits zero-spend setup handoff artifacts', async ({ page }) => {
  const bootstrap = JSON.parse(await readFile('data/production-bootstrap.json', 'utf8')) as {
    status: string
    mode: string
    controls: {
      zeroSpendGuard: boolean
      noPaidResourcesCreated: boolean
      noStoreSubmission: boolean
      noRevenueEnablement: boolean
    }
    summary: { externalBlockers: number }
    stages: Array<{ id: string; costUsd: number }>
    setupScript: {
      path: string
      avoidsSecretEcho: boolean
      configuresPagesSource: boolean
      infersRepositoryFromOriginRemote: boolean
      infersRepositoryFromOwnerHint: boolean
      infersGithubPagesOrigin: boolean
      supportsSshUrlRemotes: boolean
      supportsDottedRepositoryNames: boolean
    }
    requiredVariables: Array<{ repositoryVariable: string; command: string; valueSource: string }>
    requiredSecrets: Array<{ repositorySecret: string; command: string }>
    setupCommands: Array<{ id: string; command: string; costUsd: number }>
  }
  const setupScript = await readFile('ops/github/setup-production.sh', 'utf8')

  expect(bootstrap.status).toBe('production-bootstrap-ready')
  expect(bootstrap.mode).toMatch(/waiting-for-external-credentials|can-apply-configured-actions/)
  expect(bootstrap.controls.zeroSpendGuard).toBe(true)
  expect(bootstrap.controls.noPaidResourcesCreated).toBe(true)
  expect(bootstrap.controls.noStoreSubmission).toBe(true)
  expect(bootstrap.controls.noRevenueEnablement).toBe(true)
  expect(bootstrap.stages.some((stage) => stage.id === 'repository-channel')).toBe(true)
  expect(bootstrap.stages.some((stage) => stage.id === 'repository-bootstrap')).toBe(true)
  expect(bootstrap.stages.some((stage) => stage.id === 'github-pages-hosting')).toBe(true)
  expect(bootstrap.stages.some((stage) => stage.id === 'github-pages-settings')).toBe(true)
  expect(bootstrap.stages.some((stage) => stage.id === 'event-collector')).toBe(true)
  expect(bootstrap.stages.every((stage) => stage.costUsd === 0)).toBe(true)
  expect(bootstrap.setupCommands.some((command) => command.id === 'repository-preflight')).toBe(true)
  expect(bootstrap.setupCommands.some((command) => command.id === 'repository-bootstrap-plan')).toBe(true)
  expect(bootstrap.setupCommands.some((command) => command.id === 'sync-pages-settings')).toBe(true)
  expect(bootstrap.requiredVariables.some((item) => item.repositoryVariable === 'AGL_PUBLIC_ORIGIN')).toBe(true)
  expect(bootstrap.requiredSecrets.some((item) => item.repositorySecret === 'CLOUDFLARE_API_TOKEN')).toBe(true)
  expect(bootstrap.setupCommands.every((command) => command.costUsd === 0)).toBe(true)
  expect(bootstrap.setupScript.path).toBe('ops/github/setup-production.sh')
  expect(bootstrap.setupScript.avoidsSecretEcho).toBe(true)
  expect(bootstrap.setupScript.configuresPagesSource).toBe(true)
  expect(bootstrap.setupScript.infersRepositoryFromOriginRemote).toBe(true)
  expect(bootstrap.setupScript.infersRepositoryFromOwnerHint).toBe(true)
  expect(bootstrap.setupScript.infersGithubPagesOrigin).toBe(true)
  expect(bootstrap.setupScript.supportsSshUrlRemotes).toBe(true)
  expect(bootstrap.setupScript.supportsDottedRepositoryNames).toBe(true)
  expect(bootstrap.requiredVariables.find((item) => item.repositoryVariable === 'VITE_BASE_PATH')?.valueSource).toMatch(
    /environment|github-variable|production-environment|inferred-github-pages/,
  )
  expect(setupScript).toContain('gh variable set')
  expect(setupScript).toContain('gh secret set')
  expect(setupScript).toContain('derive_repository_from_origin')
  expect(setupScript).toContain('derive_repository_from_owner_hint')
  expect(setupScript).toContain('derive_github_pages_origin')
  expect(setupScript).toContain('derive_github_pages_base_path')
  expect(setupScript).toContain('AGL_INFER_GITHUB_PAGES_ORIGIN')
  expect(setupScript).toContain('inferred AGL_PUBLIC_ORIGIN from GitHub Pages target')
  expect(setupScript).toContain('inferred VITE_BASE_PATH from GitHub Pages target')
  expect(setupScript).toContain('AGL_GITHUB_OWNER')
  expect(setupScript).toContain('git remote get-url origin')
  expect(setupScript).toContain('ssh://git@github.com/')
  expect(setupScript).toContain('AGL_SYNC_PAGES_SETTINGS')
  expect(setupScript).toContain('repos/$repo/pages')
  expect(setupScript).toContain('build_type=workflow')
  expect(setupScript).toContain('RUN_WORKFLOWS')
  expect(setupScript).not.toContain('admin-export-token')
  expect(setupScript).not.toContain('ca-pub-your-web-client-id')

  await page.goto('/')
  await expect(page.getByLabel('Production Bootstrap')).toContainText('production-bootstrap-ready')
})

test('production activation dry-runs guarded setup and workflow activation', async ({ page }) => {
  const activation = JSON.parse(await readFile('data/production-activation.json', 'utf8')) as {
    status: string
    mode: string
    configuration: {
      activationRequested: boolean
      ghCredentialReady: boolean
      repositoryTargetKnown: boolean
      runWebWorkflows: boolean
      allowAndroidWorkflow: boolean
    }
    controls: {
      zeroPaidSpend: boolean
      noPaidResourcesCreated: boolean
      noAccountCreation: boolean
      noStoreSubmission: boolean
      noRevenueEnablement: boolean
      dryRunByDefault: boolean
      activationRequiresExplicitEnv: boolean
      repositoryMutationRequiresExplicitBootstrapGates: boolean
      workflowDispatchRequiresReadyDeployment: boolean
      androidWorkflowRequiresStoreEconomics: boolean
      secretValuesRedacted: boolean
    }
    plannedActions: Array<{ id: string; command: string; costUsd: number; runnableNow: boolean }>
    execution: { requested: boolean; status: string; attemptedActions: string[] }
  }

  expect(['activation-waiting-for-credentials', 'activation-ready', 'activation-applied']).toContain(activation.status)
  expect(['dry-run', 'apply-configured-actions']).toContain(activation.mode)
  expect(activation.controls.zeroPaidSpend).toBe(true)
  expect(activation.controls.noPaidResourcesCreated).toBe(true)
  expect(activation.controls.noAccountCreation).toBe(true)
  expect(activation.controls.noStoreSubmission).toBe(true)
  expect(activation.controls.noRevenueEnablement).toBe(true)
  expect(activation.controls.dryRunByDefault).toBe(true)
  expect(activation.controls.activationRequiresExplicitEnv).toBe(true)
  expect(activation.controls.repositoryMutationRequiresExplicitBootstrapGates).toBe(true)
  expect(activation.controls.workflowDispatchRequiresReadyDeployment).toBe(true)
  expect(activation.controls.androidWorkflowRequiresStoreEconomics).toBe(true)
  expect(activation.controls.secretValuesRedacted).toBe(true)
  expect(activation.plannedActions.some((action) => action.id === 'repository-bootstrap')).toBe(true)
  expect(activation.plannedActions.some((action) => action.id === 'sync-production-settings')).toBe(true)
  expect(activation.plannedActions.every((action) => action.costUsd === 0)).toBe(true)
  if (!activation.configuration.activationRequested) {
    expect(activation.execution.status).toBe('dry-run')
    expect(activation.execution.attemptedActions).toEqual([])
    expect(activation.plannedActions.every((action) => action.runnableNow === false)).toBe(true)
  }

  await page.goto('/')
  await expect(page.getByLabel('Production Activation')).toContainText(/activation-waiting-for-credentials|activation-ready|activation-applied/)
  await expect(page.getByLabel('Production Activation')).toContainText(/dry-run|apply-configured-actions/)
})

test('autonomous operator plans or executes one allowlisted zero-spend local action', async ({ page }) => {
  const operator = JSON.parse(await readFile('data/autonomous-operator.json', 'utf8')) as {
    status: string
    mode: string
    selectedAction: { id: string; command: string; costUsd: number } | null
    controls: {
      zeroPaidSpend: boolean
      localCommandAllowlistEnforced: boolean
      maxActionsPerRun: number
      dryRunByDefault: boolean
      externalWorkflowExecutionBlockedByDefault: boolean
      dailyLoopRecursionBlocked: boolean
    }
    execution: { requested: boolean; status: string; maxActionsPerRun: number }
    allowlist: string[]
    blockedFragments: string[]
    blockedActions: Array<{ id: string; reason: string }>
  }

  const operatorHeldWithoutEligibleAction =
    operator.status === 'operator-held' && operator.selectedAction === null && operator.execution.status === 'not-requested'

  expect(['operator-plan-ready', 'operator-executed', 'operator-held']).toContain(operator.status)
  expect(['plan-only', 'execute-one-action']).toContain(operator.mode)
  if (!operatorHeldWithoutEligibleAction) {
    expect(operator.selectedAction?.costUsd).toBe(0)
    expect(operator.selectedAction?.command).toBeTruthy()
    expect(operator.allowlist).toContain(operator.selectedAction?.command)
  }
  expect(operator.controls.zeroPaidSpend).toBe(true)
  expect(operator.controls.localCommandAllowlistEnforced).toBe(true)
  expect(operator.controls.maxActionsPerRun).toBe(1)
  expect(operator.controls.dryRunByDefault).toBe(true)
  expect(operator.controls.externalWorkflowExecutionBlockedByDefault).toBe(true)
  expect(operator.controls.dailyLoopRecursionBlocked).toBe(true)
  expect(operator.execution.requested).toBe(operator.status === 'operator-executed')
  expect(['not-requested', 'executed']).toContain(operator.execution.status)
  expect(operator.execution.maxActionsPerRun).toBe(1)
  expect(operator.allowlist).toContain('npm run autonomous:blocker-handoff')
  expect(operator.blockedFragments).toContain('gh workflow run')
  expect(operator.blockedActions.some((action) => action.reason === 'daily-loop-recursion-blocked')).toBe(true)

  await page.goto('/')
  await expect(page.getByLabel('Autonomous Operator')).toContainText(/operator-plan-ready|operator-executed|operator-held/)
})

test('local event bridge keeps browser analytics drops importable without external upload', async ({ page }) => {
  const bridge = JSON.parse(await readFile('data/local-event-bridge.json', 'utf8')) as {
    status: string
    inbox: { directory: string; validEvents: number }
    imported: { directory: string; events: number }
    eventDropContract: {
      filenamePattern: string
      importCommand: string
      rollupCommand: string
      recommendedFields: string[]
      strippedPropertyKeys: string[]
      browserFolderDrop: {
        supported: boolean
        mode: string
        fallback: string
        privacy: string
        autosaveSurface: string
        autosaveTriggers: string[]
      }
    }
    gateSampleEvidence: {
      inbox: { events: number; campaigns: unknown[] }
      imported: { events: number; campaigns: unknown[] }
      localEvidenceAvailable: boolean
    }
    exportCoverage: {
      status: string
      inbox: {
        status: string
        analyticsExports: number
        coverageReceipts: number
      }
      imported: {
        status: string
        analyticsExports: number
        coverageReceipts: number
      }
      localEvidenceAvailable: boolean
      readyForIngest: boolean
    }
    explicitDownloadsScanPolicy: {
      explicitOptInRequired: boolean
      cooldownHours: number
      coolingDown: boolean
      evidenceReadyNow: boolean
      nextRecommendedScanAt: string
    }
    controls: {
      zeroPaidSpend: boolean
      localOnly: boolean
      noExternalUpload: boolean
      noSyntheticEvents: boolean
      piiStrippingEnabled: boolean
      rawEventDropsStayLocal: boolean
      copyOnlyExplicitDropPaths: boolean
      downloadsFolderOptInOnly: boolean
      downloadsFolderRequiresExplicitEnv: boolean
      localExportCoverageReceipts: boolean
      staleExportDebtVisibleInApp: boolean
      bridgeReadsExportReceipts: boolean
      browserSelectedDropFolderSupported: boolean
      browserSelectedDropFolderAutosave: boolean
      autosaveRequiresConnectedFolder: boolean
      autosaveNeverDownloadsWithoutManualClick: boolean
      folderHandleStoredInBrowserOnly: boolean
    }
    privacy: {
      piiStrippingEnabled: boolean
      rawDropsStayLocal: boolean
      inboxWritesSanitizedEvents: boolean
      sensitivePropertiesDropped: number
      strippedPropertyKeys: string[]
    }
  }

  expect(['bridge-ready-for-ingest', 'bridge-local-events-active', 'bridge-waiting-for-export']).toContain(
    bridge.status,
  )
  expect(bridge.inbox.directory).toBe('data/player-events/inbox')
  expect(bridge.imported.directory).toBe('data/player-events')
  expect(bridge.eventDropContract.filenamePattern).toBe('player-events*.json')
  expect(bridge.eventDropContract.importCommand).toBe('npm run autonomous:import-events')
  expect(bridge.eventDropContract.rollupCommand).toBe('npm run autonomous:analytics')
  expect(bridge.eventDropContract.recommendedFields).toContain('properties.eventCountAtExport')
  expect(bridge.eventDropContract.recommendedFields).toContain('properties.unexportedEventsBeforeExport')
  expect(bridge.eventDropContract.strippedPropertyKeys).toContain('email')
  expect(bridge.eventDropContract.browserFolderDrop).toMatchObject({
    supported: true,
    mode: 'browser-selected-local-folder',
    fallback: 'download',
    privacy: 'local-only-no-external-upload',
    autosaveSurface: 'local-event-drop-autosave',
  })
  expect(bridge.eventDropContract.browserFolderDrop.autosaveTriggers).toContain('level_completed')
  expect(bridge.controls.zeroPaidSpend).toBe(true)
  expect(bridge.controls.localOnly).toBe(true)
  expect(bridge.controls.noExternalUpload).toBe(true)
  expect(bridge.controls.noSyntheticEvents).toBe(true)
  expect(bridge.controls.piiStrippingEnabled).toBe(true)
  expect(bridge.controls.rawEventDropsStayLocal).toBe(true)
  expect(bridge.controls.copyOnlyExplicitDropPaths).toBe(true)
  expect(bridge.controls.downloadsFolderOptInOnly).toBe(true)
  expect(bridge.controls.downloadsFolderRequiresExplicitEnv).toBe(true)
  expect(bridge.controls.localExportCoverageReceipts).toBe(true)
  expect(bridge.controls.staleExportDebtVisibleInApp).toBe(true)
  expect(bridge.controls.bridgeReadsExportReceipts).toBe(true)
  expect(bridge.controls.browserSelectedDropFolderSupported).toBe(true)
  expect(bridge.controls.browserSelectedDropFolderAutosave).toBe(true)
  expect(bridge.controls.autosaveRequiresConnectedFolder).toBe(true)
  expect(bridge.controls.autosaveNeverDownloadsWithoutManualClick).toBe(true)
  expect(bridge.controls.folderHandleStoredInBrowserOnly).toBe(true)
  expect(bridge.explicitDownloadsScanPolicy.explicitOptInRequired).toBe(true)
  expect(bridge.explicitDownloadsScanPolicy.cooldownHours).toBe(4)
  expect(typeof bridge.explicitDownloadsScanPolicy.coolingDown).toBe('boolean')
  expect(typeof bridge.explicitDownloadsScanPolicy.evidenceReadyNow).toBe('boolean')
  expect(bridge.explicitDownloadsScanPolicy.nextRecommendedScanAt).toBeTruthy()
  expect(bridge.privacy.piiStrippingEnabled).toBe(true)
  expect(bridge.privacy.rawDropsStayLocal).toBe(true)
  expect(bridge.privacy.inboxWritesSanitizedEvents).toBe(true)
  expect(typeof bridge.privacy.sensitivePropertiesDropped).toBe('number')
  expect(bridge.privacy.strippedPropertyKeys).toContain('email')
  expect([
    'imported-export-coverage-ready',
    'inbox-export-coverage-ready',
    'legacy-export-needs-refresh',
    'waiting-for-first-export',
  ]).toContain(bridge.exportCoverage.status)
  expect(typeof bridge.exportCoverage.inbox.analyticsExports).toBe('number')
  expect(typeof bridge.exportCoverage.inbox.coverageReceipts).toBe('number')
  expect(typeof bridge.exportCoverage.imported.analyticsExports).toBe('number')
  expect(typeof bridge.exportCoverage.imported.coverageReceipts).toBe('number')
  expect(typeof bridge.exportCoverage.localEvidenceAvailable).toBe('boolean')
  expect(typeof bridge.exportCoverage.readyForIngest).toBe('boolean')
  expect(bridge.gateSampleEvidence.localEvidenceAvailable).toBe(false)
  expect(bridge.gateSampleEvidence.inbox.campaigns).toHaveLength(0)

  await page.goto('/')
  await expect(page.getByLabel('Local Event Bridge')).toContainText('Local Event Bridge')
  await expect(page.getByLabel('Local Event Bridge')).toContainText('Export debt')
  await expect(page.getByLabel('Local Event Bridge')).toContainText('Export coverage')
  await expect(page.getByLabel('Local Event Bridge')).toContainText('Drop folder')
  await expect(page.getByLabel('Local Event Bridge')).toContainText('Autosave')
})

test('autonomous operator history keeps a capped audit trail', async ({ page }) => {
  const history = JSON.parse(await readFile('data/autonomous-operator-history.json', 'utf8')) as {
    status: string
    retention: {
      maxRecords: number
      appendOnlyWhenPlanChangesOrExecutes: boolean
      preserveLatestExecutedRecord: boolean
      preserveRecentExecutedRecords: boolean
      recentExecutedRecordWindow: number
      preservedExecutedRecords: number
      recentExecutedActionIds: string[]
      compactedDuplicateDryRuns?: number
    }
    summary: {
      totalRecords: number
      plannedRecords: number
      executedRecords: number
      failedRecords: number
      lastActionId: string | null
      lastExecutionStatus: string | null
      lastExecutedActionId: string | null
    }
    controls: {
      zeroPaidSpend: boolean
      localCommandAllowlistEnforced: boolean
      maxActionsPerRun: number
      externalWorkflowExecutionBlockedByDefault: boolean
      historyIsCapped: boolean
    }
    records: Array<{
      selectedActionId: string | null
      runFingerprint: string
      execution: { requested: boolean; status: string }
    }>
  }
  const operator = JSON.parse(await readFile('data/autonomous-operator.json', 'utf8')) as {
    status: string
    selectedAction: { id: string } | null
    eligibleActionIds: string[]
  }
  const ownerLoop = JSON.parse(await readFile('data/autonomous-owner-loop.json', 'utf8')) as {
    ownerDecision: {
      nextBestActionId: string
      localActionAvailable: boolean
      holdReason: string | null
    }
    controls: {
      repositoryHandoffPrepared: boolean
      localActionAvailable: boolean
      heldForExternalInput: boolean
    }
    safeAutonomousActions: Array<{ id: string; status: string; reason?: string }>
    executionMemory: {
      avoidImmediateRepeat: boolean
      recentExecutionWindow: number
      recentExecutedActionIds: string[]
      lastExecutedActionId: string | null
      lastExecutedStatus: string | null
      lastRecordExecutionStatus: string | null
      recentlySatisfiedActionIds: string[]
      skippedRecentlyExecutedActionIds: string[]
      skippedRecentlySatisfiedActionIds: string[]
      objectiveAuditFreshness: {
        fresh: boolean
        structurallyReady: boolean
        auditGeneratedAt: string | null
        evaluatedInputIds: string[]
        staleInputIds: string[]
      }
      operationalEvidenceFreshness: {
        cadence: {
          fresh: boolean
          ready: boolean
          status: string
          maxAgeHours: number
          checksPass: boolean
          extraReady: boolean
        }
        selfUpdate: {
          fresh: boolean
          ready: boolean
          status: string
          maxAgeHours: number
          checksPass: boolean
          extraReady: boolean
        }
        supportFeedback: {
          fresh: boolean
          ready: boolean
          status: string
          maxAgeHours: number
          checksPass: boolean
          extraReady: boolean
        }
        performance: {
          fresh: boolean
          ready: boolean
          status: string
          maxAgeHours: number
          checksPass: boolean
          extraReady: boolean
        }
        liveSiteMonitor: {
          fresh: boolean
          ready: boolean
          status: string
          maxAgeHours: number
          checksPass: boolean
          extraReady: boolean
        }
      }
      sourceFreshness: Record<
        | 'productOptimization'
        | 'retentionLoop'
        | 'trafficSeeding'
        | 'acquisitionLearning'
        | 'organicSeedLoop'
        | 'pwaInstallLoop'
        | 'productGateRecovery'
        | 'productGateSamplePlan'
        | 'storePackage'
        | 'storeListingOptimizer'
        | 'storeCompliance'
        | 'firstMoveCoach'
        | 'completionLoop'
        | 'replayLoop'
        | 'appliedImprovements',
        {
          current: boolean
          ready: boolean
          status: string
          artifactSourceDataHash: string | null
          sourceDataHash: string
          evaluatedInputIds: string[]
        }
      >
      gateSampleDownloadsBackoff: {
        enabled: boolean
        cooldownHours: number
        coolingDown: boolean
        lastExplicitScanAt: string | null
        lastExplicitScanStatus: string | null
        evidenceReadyNow: boolean
      }
      localEventCollectionFreshness: {
        current: boolean
        ready: boolean
        status: string
        bridgeGeneratedAt: string | null
        analyticsSource: string
        evidenceReadyNow: boolean
        evaluatedInputIds: string[]
        staleInputIds: string[]
      }
      liveDeployEvidence: {
        localSmokeFresh: boolean
        strictArtifactSyncFresh: boolean
        liveSiteMonitorFresh: boolean
        smokeActionFresh: boolean
        releaseCandidateActionFresh: boolean
        liveCandidateId: string | null
        artifactCandidateId: string | null
      }
      repositoryHandoff: {
        prepared: boolean
        targetPlanReady: boolean
        plannedTarget: string | null
        status: string
      }
      productionBootstrapFreshness: {
        fresh: boolean
        bootstrapGeneratedAt: string | null
        evaluatedInputIds: string[]
        staleInputIds: string[]
      }
      productionBlockerHandoffFreshness: {
        current: boolean
        ready: boolean
        status: string
        generatedAt: string | null
        nextBestUnlockId: string | null
        ownerActionRequired: number
        missingEnv: number
        missingSecrets: number
        sourceStatusesFresh: boolean
        evaluatedSourceStatuses: string[]
      }
    }
  }
  const localEventBridge = JSON.parse(await readFile('data/local-event-bridge.json', 'utf8')) as {
    generatedAt: string
    status: string
    explicitDownloadsScan: {
      scannedAt: string
      status: string
      evidenceFound: boolean
    } | null
    gateSampleEvidence: {
      inbox: { events: number }
      imported: { events: number }
    }
  }
  const productGateSamplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    generatedAt: string
    summary: {
      downloadsScanCoolingDown: boolean
      downloadsScanNextRecommendedAt: string
    }
    downloadsScan: {
      cooldownHours: number
      coolingDown: boolean
      evidenceReadyNow: boolean
      lastScanAt: string | null
      lastScanStatus: string | null
      nextRecommendedScanAt: string
    }
  }
  const lastExecutedRecord = [...history.records]
    .reverse()
    .find((record) => record.execution.requested === true && record.execution.status === 'executed')
  const recentExecutedActionIds = [
    ...new Set(
      [...history.records]
        .reverse()
        .filter((record) => record.execution.requested === true && record.execution.status === 'executed')
        .map((record) => record.selectedActionId)
        .filter(Boolean),
    ),
  ].slice(0, 8)
  const preservedExecutedActionIds = history.records
    .filter((record) => record.execution.requested === true)
    .slice(-history.retention.recentExecutedRecordWindow)
    .map((record) => record.selectedActionId)
    .filter(Boolean)
  const compositeActionSatisfiedActionIds: Record<string, string[]> = {
    'seed-portfolio-traffic': ['refresh-organic-seed-loop'],
    'collect-gate-sample-downloads': [
      'collect-live-events',
      'refresh-product-gate-recovery',
      'refresh-product-gate-sample-plan',
    ],
    'collect-live-events': ['refresh-product-gate-recovery', 'refresh-product-gate-sample-plan'],
  }
  const recentlySatisfiedActionIds = [
    ...new Set(recentExecutedActionIds.flatMap((actionId) => compositeActionSatisfiedActionIds[actionId] ?? [])),
  ]
  const recentlyCoveredActionIds = new Set([...recentExecutedActionIds, ...recentlySatisfiedActionIds])
  const isLocalSelectableAction = (action: { id: string; status: string }) =>
    action.status === 'armed' && action.id !== 'run-daily-owner-loop'
  const localSelectableActions = ownerLoop.safeAutonomousActions.filter(isLocalSelectableAction)
  const hasExecutableAlternativeOutsideRecent = ownerLoop.safeAutonomousActions.some(
    (action) => isLocalSelectableAction(action) && !recentExecutedActionIds.includes(action.id),
  )
  const hasExecutableAlternativeOutsideCovered = ownerLoop.safeAutonomousActions.some(
    (action) => isLocalSelectableAction(action) && !recentlyCoveredActionIds.has(action.id),
  )
  const gateSampleEvidenceReadyNow =
    (localEventBridge.gateSampleEvidence?.inbox?.events ?? 0) > 0 ||
    (localEventBridge.gateSampleEvidence?.imported?.events ?? 0) > 0
  const explicitDownloadsScanAt = Date.parse(localEventBridge.explicitDownloadsScan?.scannedAt ?? '')
  const downloadsScanExpiryBufferMs = 60 * 1000
  const downloadsScanRecent =
    Number.isFinite(explicitDownloadsScanAt) &&
    Date.now() + downloadsScanExpiryBufferMs - explicitDownloadsScanAt < 4 * 60 * 60 * 1000
  const gateSampleDownloadsCoolingDown =
    downloadsScanRecent && localEventBridge.explicitDownloadsScan?.evidenceFound === false && !gateSampleEvidenceReadyNow
  const expectedDownloadsScanNextRecommendedAt =
    localEventBridge.explicitDownloadsScan?.evidenceFound === false &&
    Number.isFinite(explicitDownloadsScanAt) &&
    !gateSampleEvidenceReadyNow
      ? new Date(explicitDownloadsScanAt + 4 * 60 * 60 * 1000).toISOString()
      : productGateSamplePlan.generatedAt
  const samplePlanFreshAfterDownloadsScan =
    Number.isFinite(explicitDownloadsScanAt) &&
    Number.isFinite(Date.parse(productGateSamplePlan.generatedAt ?? '')) &&
    Date.parse(productGateSamplePlan.generatedAt) >= explicitDownloadsScanAt
  const hasExecutedOperatorRecord =
    history.summary.executedRecords >= 1 && Boolean(history.summary.lastExecutedActionId)
  const hasInitialExecutionAuditPlan =
    history.summary.executedRecords === 0 &&
    operator.status === 'operator-plan-ready' &&
    operator.selectedAction?.id === 'refresh-objective-audit' &&
    operator.eligibleActionIds.includes('refresh-objective-audit') &&
    history.records.at(-1)?.selectedActionId === 'refresh-objective-audit' &&
    ownerLoop.ownerDecision.nextBestActionId === 'refresh-objective-audit'
  const collectGateSampleAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'collect-gate-sample-downloads')
  const holdForExternalInputAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'hold-for-external-input')
  const refreshGateRecoveryAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'refresh-product-gate-recovery')
  const refreshSamplePlanAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'refresh-product-gate-sample-plan')
  const prepareRepositoryAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'prepare-repository-channel')
  const objectiveAuditAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'refresh-objective-audit')
  const bootstrapProductionAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'bootstrap-production-setup')
  const refreshProductionBlockerHandoffAction = ownerLoop.safeAutonomousActions.find(
    (action) => action.id === 'refresh-production-blocker-handoff',
  )
  const refreshCadenceAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'refresh-autonomous-cadence')
  const refreshSelfUpdateAction = ownerLoop.safeAutonomousActions.find(
    (action) => action.id === 'refresh-autonomous-self-update',
  )
  const refreshSupportFeedbackAction = ownerLoop.safeAutonomousActions.find(
    (action) => action.id === 'refresh-support-feedback',
  )
  const seedPortfolioAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'seed-portfolio-traffic')
  const collectLiveEventsAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'collect-live-events')
  const prepareReleaseAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'prepare-release-candidate')
  const checkPerformanceAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'check-performance-budget')
  const refreshLiveSiteMonitorAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'refresh-live-site-monitor')
  const optimizeStoreListingAction = ownerLoop.safeAutonomousActions.find((action) => action.id === 'optimize-store-listing')
  const sourceFreshnessActionPairs = [
    { actionId: 'optimize-product-gates', freshness: ownerLoop.executionMemory.sourceFreshness.productOptimization },
    { actionId: 'optimize-daily-retention', freshness: ownerLoop.executionMemory.sourceFreshness.retentionLoop },
    { actionId: 'refresh-organic-seed-loop', freshness: ownerLoop.executionMemory.sourceFreshness.organicSeedLoop },
    { actionId: 'measure-pwa-install-loop', freshness: ownerLoop.executionMemory.sourceFreshness.pwaInstallLoop },
    { actionId: 'refresh-first-move-coach', freshness: ownerLoop.executionMemory.sourceFreshness.firstMoveCoach },
    { actionId: 'refresh-completion-loop', freshness: ownerLoop.executionMemory.sourceFreshness.completionLoop },
    { actionId: 'refresh-replay-loop', freshness: ownerLoop.executionMemory.sourceFreshness.replayLoop },
    { actionId: 'apply-safe-improvements', freshness: ownerLoop.executionMemory.sourceFreshness.appliedImprovements },
  ]

  expect(history.status).toBe('operator-history-ready')
  expect(history.retention.maxRecords).toBe(40)
  expect(history.retention.appendOnlyWhenPlanChangesOrExecutes).toBe(true)
  expect(history.retention.preserveLatestExecutedRecord).toBe(true)
  expect(history.retention.preserveRecentExecutedRecords).toBe(true)
  expect(history.retention.recentExecutedRecordWindow).toBe(8)
  expect(history.retention.preservedExecutedRecords).toBe(preservedExecutedActionIds.length)
  expect(history.retention.recentExecutedActionIds).toEqual(preservedExecutedActionIds)
  expect(history.summary.totalRecords).toBeGreaterThanOrEqual(1)
  expect(history.summary.totalRecords).toBeLessThanOrEqual(40)
  expect(history.summary.plannedRecords).toBeGreaterThanOrEqual(1)
  expect(hasExecutedOperatorRecord || hasInitialExecutionAuditPlan).toBe(true)
  expect(history.summary.failedRecords).toBe(0)
  expect(history.summary.lastActionId).toBeTruthy()
  if (hasExecutedOperatorRecord) {
    expect(history.summary.lastExecutedActionId).toBeTruthy()
  } else {
    expect(history.summary.lastExecutedActionId).toBeNull()
  }
  expect(ownerLoop.executionMemory.avoidImmediateRepeat).toBe(true)
  expect(ownerLoop.executionMemory.recentExecutionWindow).toBe(8)
  expect(ownerLoop.executionMemory.recentExecutedActionIds).toEqual(recentExecutedActionIds)
  expect(ownerLoop.executionMemory.recentlySatisfiedActionIds).toEqual(recentlySatisfiedActionIds)
  expect(ownerLoop.executionMemory.lastExecutedActionId).toBe(history.summary.lastExecutedActionId)
  expect(ownerLoop.executionMemory.lastExecutedStatus).toBe(lastExecutedRecord?.execution.status ?? null)
  expect(ownerLoop.executionMemory.lastRecordExecutionStatus).toBe(history.summary.lastExecutionStatus)
  expect(ownerLoop.controls.localActionAvailable).toBe(localSelectableActions.length > 0)
  expect(ownerLoop.controls.heldForExternalInput).toBe(localSelectableActions.length === 0)
  expect(ownerLoop.ownerDecision.localActionAvailable).toBe(localSelectableActions.length > 0)
  expect(holdForExternalInputAction?.status).toBe('monitor')
  expect(holdForExternalInputAction?.reason).toContain('All safe local refresh actions are current')
  if (localSelectableActions.length === 0) {
    expect(ownerLoop.ownerDecision.nextBestActionId).toBe('hold-for-external-input')
    expect(ownerLoop.ownerDecision.holdReason).toContain('All safe local actions are current')
  } else {
    expect(ownerLoop.ownerDecision.holdReason).toBeNull()
  }
  expect(ownerLoop.executionMemory.gateSampleDownloadsBackoff.enabled).toBe(true)
  expect(ownerLoop.executionMemory.gateSampleDownloadsBackoff.cooldownHours).toBe(4)
  expect(ownerLoop.executionMemory.gateSampleDownloadsBackoff.coolingDown).toBe(gateSampleDownloadsCoolingDown)
  expect(ownerLoop.executionMemory.gateSampleDownloadsBackoff.lastExplicitScanAt).toBe(
    Number.isFinite(explicitDownloadsScanAt) ? localEventBridge.explicitDownloadsScan?.scannedAt : null,
  )
  expect(ownerLoop.executionMemory.gateSampleDownloadsBackoff.lastExplicitScanStatus).toBe(
    localEventBridge.explicitDownloadsScan?.status ?? null,
  )
  expect(ownerLoop.executionMemory.gateSampleDownloadsBackoff.evidenceReadyNow).toBe(gateSampleEvidenceReadyNow)
  expect(productGateSamplePlan.downloadsScan.cooldownHours).toBe(4)
  expect(productGateSamplePlan.downloadsScan.coolingDown).toBe(gateSampleDownloadsCoolingDown)
  expect(productGateSamplePlan.summary.downloadsScanCoolingDown).toBe(gateSampleDownloadsCoolingDown)
  expect(productGateSamplePlan.downloadsScan.evidenceReadyNow).toBe(gateSampleEvidenceReadyNow)
  expect(productGateSamplePlan.downloadsScan.lastScanAt).toBe(
    Number.isFinite(explicitDownloadsScanAt) ? localEventBridge.explicitDownloadsScan?.scannedAt : null,
  )
  expect(productGateSamplePlan.downloadsScan.lastScanStatus).toBe(localEventBridge.explicitDownloadsScan?.status ?? null)
  expect(productGateSamplePlan.downloadsScan.nextRecommendedScanAt).toBe(expectedDownloadsScanNextRecommendedAt)
  expect(productGateSamplePlan.summary.downloadsScanNextRecommendedAt).toBe(expectedDownloadsScanNextRecommendedAt)
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.status).toBe(localEventBridge.status)
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.bridgeGeneratedAt).toBe(localEventBridge.generatedAt)
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.evidenceReadyNow).toBe(gateSampleEvidenceReadyNow)
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.evaluatedInputIds).toContain('local-event-bridge')
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.evaluatedInputIds).toContain('event-ingest')
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.evaluatedInputIds).toContain('analytics-rollup')
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.evaluatedInputIds).toContain('product-gate-recovery')
  expect(ownerLoop.executionMemory.localEventCollectionFreshness.evaluatedInputIds).toContain('product-gate-sample-plan')
  if (ownerLoop.executionMemory.localEventCollectionFreshness.current) {
    expect(collectLiveEventsAction?.status).toBe('monitor')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('collect-live-events')
  }
  expect(typeof ownerLoop.executionMemory.objectiveAuditFreshness.fresh).toBe('boolean')
  expect(ownerLoop.executionMemory.objectiveAuditFreshness.evaluatedInputIds).toContain('analytics-rollup')
  expect(ownerLoop.executionMemory.objectiveAuditFreshness.evaluatedInputIds).toContain('local-event-bridge')
  expect(ownerLoop.executionMemory.objectiveAuditFreshness.evaluatedInputIds).toContain('production-activation')
  expect(ownerLoop.executionMemory.operationalEvidenceFreshness.cadence.maxAgeHours).toBe(18)
  expect(ownerLoop.executionMemory.operationalEvidenceFreshness.selfUpdate.maxAgeHours).toBe(18)
  expect(ownerLoop.executionMemory.operationalEvidenceFreshness.supportFeedback.maxAgeHours).toBe(18)
  expect(ownerLoop.executionMemory.operationalEvidenceFreshness.performance.maxAgeHours).toBe(18)
  expect(ownerLoop.executionMemory.operationalEvidenceFreshness.liveSiteMonitor.maxAgeHours).toBe(18)
  if (ownerLoop.executionMemory.operationalEvidenceFreshness.cadence.fresh) {
    expect(refreshCadenceAction?.status).toBe('monitor')
    expect(refreshCadenceAction?.reason).toContain('already fresh')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-autonomous-cadence')
  }
  if (ownerLoop.executionMemory.operationalEvidenceFreshness.selfUpdate.fresh) {
    expect(refreshSelfUpdateAction?.status).toBe('monitor')
    expect(refreshSelfUpdateAction?.reason).toContain('already fresh')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-autonomous-self-update')
  }
  if (ownerLoop.executionMemory.operationalEvidenceFreshness.supportFeedback.fresh) {
    expect(refreshSupportFeedbackAction?.status).toBe('monitor')
    expect(refreshSupportFeedbackAction?.reason).toContain('recently inspected')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-support-feedback')
  }
  if (ownerLoop.executionMemory.operationalEvidenceFreshness.performance.fresh) {
    expect(checkPerformanceAction?.status).toBe('monitor')
    expect(checkPerformanceAction?.reason).toContain('already fresh')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('check-performance-budget')
  }
  if (ownerLoop.executionMemory.operationalEvidenceFreshness.liveSiteMonitor.fresh) {
    expect(refreshLiveSiteMonitorAction?.status).toBe('monitor')
    expect(refreshLiveSiteMonitorAction?.reason).toContain('already proves')
    expect(ownerLoop.executionMemory.liveDeployEvidence.liveSiteMonitorFresh).toBe(true)
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-live-site-monitor')
  }
  for (const { actionId, freshness } of sourceFreshnessActionPairs) {
    const action = ownerLoop.safeAutonomousActions.find((item) => item.id === actionId)

    expect(freshness.sourceDataHash).toMatch(/^[a-f0-9]{12}$/)
    expect(freshness.evaluatedInputIds.length).toBeGreaterThan(0)

    if (freshness.current) {
      expect(action?.status).toBe('monitor')
      expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe(actionId)
    } else {
      expect(action?.status).toBe('armed')
    }
  }
  const seedPortfolioFreshnesses = [
    ownerLoop.executionMemory.sourceFreshness.trafficSeeding,
    ownerLoop.executionMemory.sourceFreshness.acquisitionLearning,
    ownerLoop.executionMemory.sourceFreshness.organicSeedLoop,
  ]
  const storeListingFreshnesses = [
    ownerLoop.executionMemory.sourceFreshness.storePackage,
    ownerLoop.executionMemory.sourceFreshness.storeListingOptimizer,
    ownerLoop.executionMemory.sourceFreshness.storeCompliance,
  ]
  for (const freshness of seedPortfolioFreshnesses) {
    expect(freshness.sourceDataHash).toMatch(/^[a-f0-9]{12}$/)
    expect(freshness.evaluatedInputIds.length).toBeGreaterThan(0)
  }
  if (seedPortfolioFreshnesses.every((freshness) => freshness.current)) {
    expect(seedPortfolioAction?.status).toBe('monitor')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('seed-portfolio-traffic')
  }
  for (const freshness of storeListingFreshnesses) {
    expect(freshness.sourceDataHash).toMatch(/^[a-f0-9]{12}$/)
    expect(freshness.evaluatedInputIds.length).toBeGreaterThan(0)
  }
  if (storeListingFreshnesses.every((freshness) => freshness.current)) {
    expect(optimizeStoreListingAction?.status).toBe('monitor')
    expect(optimizeStoreListingAction?.reason).toContain('already match current growth')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('optimize-store-listing')
  }
  expect(typeof ownerLoop.executionMemory.productionBootstrapFreshness.fresh).toBe('boolean')
  expect(ownerLoop.executionMemory.productionBootstrapFreshness.evaluatedInputIds).toContain('release-candidate')
  expect(ownerLoop.executionMemory.productionBootstrapFreshness.evaluatedInputIds).toContain('deployment-plan')
  expect(ownerLoop.executionMemory.productionBootstrapFreshness.evaluatedInputIds).toContain('repository-readiness')
  if (ownerLoop.executionMemory.productionBootstrapFreshness.fresh) {
    expect(bootstrapProductionAction?.status).toBe('monitor')
    expect(bootstrapProductionAction?.reason).toContain('prioritize product learning')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('bootstrap-production-setup')
  }
  expect(ownerLoop.executionMemory.productionBlockerHandoffFreshness.ready).toBe(true)
  expect(ownerLoop.executionMemory.productionBlockerHandoffFreshness.status).toMatch(
    /handoff-waiting-on-owner-inputs|handoff-clear/,
  )
  expect(ownerLoop.executionMemory.productionBlockerHandoffFreshness.evaluatedSourceStatuses).toContain(
    'production-environment',
  )
  expect(ownerLoop.executionMemory.productionBlockerHandoffFreshness.evaluatedSourceStatuses).toContain(
    'post-deploy-artifact-sync',
  )
  if (ownerLoop.executionMemory.productionBlockerHandoffFreshness.current) {
    expect(refreshProductionBlockerHandoffAction?.status).toBe('monitor')
    expect(refreshProductionBlockerHandoffAction?.reason).toContain('already ranks')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-production-blocker-handoff')
  } else {
    expect(refreshProductionBlockerHandoffAction?.status).toBe('armed')
  }
  if (
    ownerLoop.executionMemory.objectiveAuditFreshness.fresh &&
    hasExecutableAlternativeOutsideCovered &&
    !hasInitialExecutionAuditPlan
  ) {
    expect(objectiveAuditAction?.status).toBe('monitor')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-objective-audit')
  }
  expect(ownerLoop.executionMemory.repositoryHandoff.targetPlanReady).toBe(true)
  expect(ownerLoop.executionMemory.repositoryHandoff.plannedTarget).toContain('/')
  if (ownerLoop.executionMemory.repositoryHandoff.prepared) {
    expect(ownerLoop.controls.repositoryHandoffPrepared).toBe(true)
    expect(ownerLoop.executionMemory.repositoryHandoff.status).toBe('external-owner-or-auth-required')
    expect(prepareRepositoryAction?.status).toBe('monitor')
    expect(prepareRepositoryAction?.reason).toContain('waits only for owner/auth')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('prepare-repository-channel')
  }
  if (ownerLoop.executionMemory.liveDeployEvidence.releaseCandidateActionFresh) {
    expect(prepareReleaseAction?.status).toBe('monitor')
    expect(prepareReleaseAction?.reason).toContain('strict synced live deploy evidence')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('prepare-release-candidate')
  }
  if (
    ownerLoop.executionMemory.sourceFreshness.productGateRecovery.current &&
    ownerLoop.executionMemory.sourceFreshness.productGateSamplePlan.current
  ) {
    expect(refreshGateRecoveryAction?.status).toBe('monitor')
    expect(refreshGateRecoveryAction?.reason).toContain('already match current gate')
    expect(refreshSamplePlanAction?.status).toBe('monitor')
    expect(refreshSamplePlanAction?.reason).toContain('already matches current recovery')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-product-gate-recovery')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-product-gate-sample-plan')
  }
  if (gateSampleDownloadsCoolingDown) {
    expect(collectGateSampleAction?.status).toBe('monitor')
    expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('collect-gate-sample-downloads')

    if (samplePlanFreshAfterDownloadsScan) {
      expect(refreshSamplePlanAction?.status).toBe('monitor')
      expect(ownerLoop.ownerDecision.nextBestActionId).not.toBe('refresh-product-gate-sample-plan')
    }
  }
  if (hasExecutableAlternativeOutsideRecent) {
    expect(recentExecutedActionIds).not.toContain(ownerLoop.ownerDecision.nextBestActionId)
    for (const actionId of recentExecutedActionIds) {
      const executedAction = ownerLoop.safeAutonomousActions.find((action) => action.id === actionId)

      if (executedAction && isLocalSelectableAction(executedAction)) {
        expect(ownerLoop.executionMemory.skippedRecentlyExecutedActionIds).toContain(actionId)
      }
    }
  }
  if (hasExecutableAlternativeOutsideCovered) {
    expect(recentlySatisfiedActionIds).not.toContain(ownerLoop.ownerDecision.nextBestActionId)
    for (const actionId of recentlySatisfiedActionIds) {
      const satisfiedAction = ownerLoop.safeAutonomousActions.find((action) => action.id === actionId)

      if (satisfiedAction && isLocalSelectableAction(satisfiedAction)) {
        expect(ownerLoop.executionMemory.skippedRecentlySatisfiedActionIds).toContain(actionId)
      }
    }
  }
  expect(history.controls.zeroPaidSpend).toBe(true)
  expect(history.controls.localCommandAllowlistEnforced).toBe(true)
  expect(history.controls.maxActionsPerRun).toBe(1)
  expect(history.controls.externalWorkflowExecutionBlockedByDefault).toBe(true)
  expect(history.controls.historyIsCapped).toBe(true)
  expect(history.records.at(-1)?.execution.status).toMatch(/not-requested|executed/)
  const hasDuplicateDryRun = history.records.some((record, index) => {
    const previous = history.records[index - 1]

    return (
      Boolean(previous) &&
      previous.execution.requested === false &&
      record.execution.requested === false &&
      previous.runFingerprint === record.runFingerprint
    )
  })
  expect(hasDuplicateDryRun).toBe(false)

  await page.goto('/')
  await expect(page.getByLabel('Operator History')).toContainText('operator-history-ready')
})

test('autonomous cadence keeps unattended operation auditable and guarded', async ({ page }) => {
  const cadence = JSON.parse(await readFile('data/autonomous-cadence.json', 'utf8')) as {
    status: string
    schedulers: {
      codexDesktop: {
        id: string
        status: string
        declaredStatus: string
        actual: {
          installedStatus: string | null
          scheduleMatches: boolean
          workspaceMatches: boolean
          promptGuardrailsPresent: boolean
          relatedActiveAutomationIds: string[]
        }
      }
      githubActions: { status: string; workflow: string; command: string; artifactUpload: boolean }
      githubPostSelfUpdateDeploy: {
        status: string
        workflow: string
        trigger: string
        deployabilityGate: string
        smokeGate: string
      }
      githubProductionInputWatch: {
        status: string
        workflow: string
        trigger: string
        permission: string
        command: string
        verificationGate: string
        directPushRequiresRepositoryVariable: string
        followedByDeployWorkflow: string
        watchedInputs: string[]
      }
      githubPublicEvidenceIntake: {
        status: string
        workflow: string
        trigger: string
        permission: string
        command: string
        verificationGate: string
        directPushRequiresRepositoryVariable: string
        followedByDeployWorkflow: string
      }
      githubPostDeployEvidenceSync: {
        status: string
        workflow: string
        trigger: string
        evidenceGate: string
        releaseRefreshPolicy: string
        verificationGate: string
      }
    }
    commandPlan: {
      operate: string
      daily: string
      executeOneLocalAction: string
      afterAction: string
      verifyAutomation: string
      browserSmoke: string
    }
    controls: {
      zeroPaidSpend: boolean
      noStoreSubmission: boolean
      noRevenueEnablement: boolean
      scheduledLocalActionExecution: boolean
      scheduledExecutionUsesOperatorAllowlist: boolean
      postActionBuildRefresh: boolean
      postActionVerification: boolean
      codexAutomationExpectedActive: boolean
      codexAutomationActualStatusAudited: boolean
      staleEvidenceBlocksUnattendedTrust: boolean
      productionInputWatchWritePermissionGated: boolean
      publicEvidenceIntakeWritePermissionGated: boolean
      postDeployEvidenceSyncWritePermissionGated: boolean
    }
    freshnessPolicy: {
      status: string
      staleAfterHours: number
      requiredArtifactCount: number
      freshArtifactCount: number
      staleArtifactCount: number
      oldestAgeHours: number | null
      staleArtifactIds: string[]
    }
    artifactFreshness: Array<{ id: string; status: string; ageHours: number | null; staleAfterHours: number }>
    checks: Array<{ id: string; status: string }>
  }
  const manifest = JSON.parse(
    await readFile('ops/codex/autonomous-game-lab-daily-owner-loop.json', 'utf8'),
  ) as {
    id: string
    status: string
    guardrails: { zeroPaidSpend: boolean; noStoreSubmission: boolean; noRevenueEnablement: boolean }
  }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as { scripts: Record<string, string> }
  const productionInputWorkflow = await readFile('.github/workflows/production-input-watch.yml', 'utf8')
  const publicEvidenceWorkflow = await readFile('.github/workflows/public-evidence-intake.yml', 'utf8')
  const postDeploySyncWorkflow = await readFile('.github/workflows/post-deploy-evidence-sync.yml', 'utf8')
  const webDeployWorkflow = await readFile('.github/workflows/web-pwa-deploy.yml', 'utf8')
  const productionInputScript = packageJson.scripts['autonomous:production-input-watch'] ?? ''

  expect(cadence.status).toBe('cadence-ready')
  expect(cadence.schedulers.codexDesktop.id).toBe('autonomous-game-lab-daily-owner-loop')
  expect(['active-confirmed', 'active-declared-unverified']).toContain(cadence.schedulers.codexDesktop.status)
  expect(cadence.schedulers.codexDesktop.declaredStatus).toBe('active-declared')
  expect(cadence.schedulers.githubActions.status).toBe('scheduled')
  expect(cadence.schedulers.githubActions.workflow).toBe('.github/workflows/autonomous-daily.yml')
  expect(cadence.schedulers.githubActions.command).toBe('npm run autonomous:operate')
  expect(cadence.schedulers.githubActions.artifactUpload).toBe(true)
  expect(cadence.schedulers.githubSelfUpdate.status).toBe('gated')
  expect(cadence.schedulers.githubSelfUpdate.workflow).toBe('.github/workflows/autonomous-self-update.yml')
  expect(cadence.schedulers.githubSelfUpdate.trigger).toBe(
    'workflow_run: Autonomous Daily Studio; waits for Post-Deploy Evidence Sync',
  )
  expect(cadence.schedulers.githubSelfUpdate.permission).toBe('actions: read, contents: write')
  expect(cadence.schedulers.githubPostSelfUpdateDeploy.status).toBe('scheduled')
  expect(cadence.schedulers.githubPostSelfUpdateDeploy.workflow).toBe('.github/workflows/web-pwa-deploy.yml')
  expect(cadence.schedulers.githubPostSelfUpdateDeploy.trigger).toBe(
    'workflow_run: Autonomous Self Update, Public Evidence Intake, Production Input Watch',
  )
  expect(cadence.schedulers.githubPostSelfUpdateDeploy.deployabilityGate).toBe(
    'npm run autonomous:assert-deployable',
  )
  expect(cadence.schedulers.githubPostSelfUpdateDeploy.smokeGate).toBe(
    'npm run autonomous:post-deploy-smoke -- --assert',
  )
  expect(cadence.schedulers.githubProductionInputWatch.status).toBe('scheduled')
  expect(cadence.schedulers.githubProductionInputWatch.workflow).toBe(
    '.github/workflows/production-input-watch.yml',
  )
  expect(cadence.schedulers.githubProductionInputWatch.trigger).toBe(
    'workflow_dispatch, schedule: every 12 hours',
  )
  expect(cadence.schedulers.githubProductionInputWatch.permission).toBe(
    'actions: read, contents: write, issues: read',
  )
  expect(cadence.schedulers.githubProductionInputWatch.command).toBe(
    'npm run autonomous:production-input-watch',
  )
  expect(cadence.schedulers.githubProductionInputWatch.verificationGate).toBe('node scripts/verify-autonomy.mjs')
  expect(cadence.schedulers.githubProductionInputWatch.directPushRequiresRepositoryVariable).toBe(
    'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1',
  )
  expect(cadence.schedulers.githubProductionInputWatch.followedByDeployWorkflow).toBe(
    '.github/workflows/web-pwa-deploy.yml',
  )
  expect(cadence.schedulers.githubProductionInputWatch.watchedInputs).toEqual(
    expect.arrayContaining([
      'VITE_EVENT_COLLECTOR_WRITE_TOKEN',
      'POSTHOG_PERSONAL_API_KEY',
      'AGL_ANDROID_KEYSTORE_BASE64',
    ]),
  )
  expect(productionInputScript).toContain('npm run build')
  expect(productionInputScript).toContain('autonomous:performance')
  expect(productionInputScript).toContain('autonomous:release-candidate')
  expect(productionInputScript).toContain('autonomous:env')
  expect(productionInputScript).toContain('autonomous:bootstrap')
  expect(productionInputScript).toContain('autonomous:activate-production')
  expect(productionInputScript).toContain('autonomous:readiness')
  expect(productionInputScript).toContain('autonomous:owner-loop')
  expect(productionInputScript).toContain('autonomous:operator')
  expect(productionInputWorkflow).toContain('name: Production Input Watch')
  expect(productionInputWorkflow).toContain('workflow_dispatch:')
  expect(productionInputWorkflow).toContain('schedule:')
  expect(productionInputWorkflow).toContain('contents: write')
  expect(productionInputWorkflow).toContain('actions: read')
  expect(productionInputWorkflow).toContain('AGL_AUTONOMOUS_SELF_UPDATE: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE }}')
  expect(productionInputWorkflow).toContain(
    'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}',
  )
  expect(productionInputWorkflow).toContain('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT')
  expect(productionInputWorkflow).toContain('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}')
  expect(productionInputWorkflow).toContain('POSTHOG_PERSONAL_API_KEY: ${{ secrets.POSTHOG_PERSONAL_API_KEY }}')
  expect(productionInputWorkflow).toContain('ADMOB_PUBLISHER_ID: ${{ vars.ADMOB_PUBLISHER_ID }}')
  expect(productionInputWorkflow).toContain(
    'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}',
  )
  expect(productionInputWorkflow).toContain(
    'VITE_EVENT_COLLECTOR_WRITE_TOKEN: ${{ secrets.VITE_EVENT_COLLECTOR_WRITE_TOKEN }}',
  )
  expect(productionInputWorkflow).toContain('npm run autonomous:production-input-watch')
  expect(productionInputWorkflow).toContain('node scripts/verify-autonomy.mjs')
  expect(productionInputWorkflow).toContain('data/production-environment.json')
  expect(productionInputWorkflow).toContain('reports/production-environment-latest.md')
  expect(productionInputWorkflow).toContain('ops/production.env.example')
  expect(productionInputWorkflow).toContain('data/production-blocker-handoff.json')
  expect(productionInputWorkflow).toContain('data/production-unlock-runner.json')
  expect(productionInputWorkflow).toContain('data/production-measurement-status.json')
  expect(productionInputWorkflow).toContain('public/measurement-status.json')
  expect(productionInputWorkflow).toContain('data/release-candidate.json')
  expect(productionInputWorkflow).not.toContain('gh workflow run')
  expect(productionInputWorkflow).not.toContain('data/player-events')
  expect(productionInputWorkflow).not.toContain('curl ')
  expect(webDeployWorkflow).toContain("'Production Input Watch'")
  expect(cadence.schedulers.githubPublicEvidenceIntake.status).toBe('scheduled')
  expect(cadence.schedulers.githubPublicEvidenceIntake.workflow).toBe(
    '.github/workflows/public-evidence-intake.yml',
  )
  expect(cadence.schedulers.githubPublicEvidenceIntake.trigger).toBe(
    'issues, workflow_dispatch, schedule: every 6 hours',
  )
  expect(cadence.schedulers.githubPublicEvidenceIntake.permission).toBe('issues: read, contents: write')
  expect(cadence.schedulers.githubPublicEvidenceIntake.command).toBe(
    'npm run autonomous:public-evidence-intake',
  )
  expect(cadence.schedulers.githubPublicEvidenceIntake.verificationGate).toBe('node scripts/verify-autonomy.mjs')
  expect(cadence.schedulers.githubPublicEvidenceIntake.directPushRequiresRepositoryVariable).toBe(
    'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1',
  )
  expect(cadence.schedulers.githubPublicEvidenceIntake.followedByDeployWorkflow).toBe(
    '.github/workflows/web-pwa-deploy.yml',
  )
  expect(cadence.schedulers.githubPostDeployEvidenceSync.status).toBe('gated')
  expect(cadence.schedulers.githubPostDeployEvidenceSync.workflow).toBe(
    '.github/workflows/post-deploy-evidence-sync.yml',
  )
  expect(cadence.schedulers.githubPostDeployEvidenceSync.trigger).toBe('workflow_run: Web PWA Deploy')
  expect(cadence.schedulers.githubPostDeployEvidenceSync.evidenceGate).toBe(
    'npm run autonomous:post-deploy-artifact-sync -- --assert',
  )
  expect(cadence.schedulers.githubPostDeployEvidenceSync.releaseRefreshPolicy).toBe(
    'disabled-after-deploy-to-preserve-live-artifact-evidence',
  )
  expect(cadence.schedulers.githubPostDeployEvidenceSync.verificationGate).toBe(
    'npm run autonomous:verify-post-deploy-sync',
  )
  expect(publicEvidenceWorkflow).toContain('AGL_SUPPORT_EMAIL: ${{ vars.AGL_SUPPORT_EMAIL }}')
  expect(publicEvidenceWorkflow).toContain('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}')
  expect(publicEvidenceWorkflow).toContain('ADMOB_PUBLISHER_ID: ${{ vars.ADMOB_PUBLISHER_ID }}')
  expect(publicEvidenceWorkflow).toContain(
    'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}',
  )
  expect(postDeploySyncWorkflow).toContain('AGL_SUPPORT_EMAIL: ${{ vars.AGL_SUPPORT_EMAIL }}')
  expect(postDeploySyncWorkflow).toContain(
    'AGL_EVENT_COLLECTOR_ADMIN_TOKEN: ${{ secrets.AGL_EVENT_COLLECTOR_ADMIN_TOKEN }}',
  )
  expect(postDeploySyncWorkflow).toContain('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}')
  expect(postDeploySyncWorkflow).toContain('POSTHOG_PERSONAL_API_KEY: ${{ secrets.POSTHOG_PERSONAL_API_KEY }}')
  expect(postDeploySyncWorkflow).toContain(
    'VITE_EVENT_COLLECTOR_WRITE_TOKEN: ${{ secrets.VITE_EVENT_COLLECTOR_WRITE_TOKEN }}',
  )
  expect(postDeploySyncWorkflow).toContain('ADMOB_PUBLISHER_ID: ${{ vars.ADMOB_PUBLISHER_ID }}')
  expect(postDeploySyncWorkflow).toContain(
    'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}',
  )
  expect(cadence.commandPlan.operate).toBe('npm run autonomous:operate')
  expect(cadence.commandPlan.daily).toBe('npm run autonomous:daily')
  expect(cadence.commandPlan.executeOneLocalAction).toBe('npm run autonomous:operator -- --execute')
  expect(cadence.commandPlan.afterAction).toBe('npm run autonomous:after-action')
  expect(cadence.commandPlan.verifyAutomation).toBe('npm run test:automation')
  expect(cadence.commandPlan.browserSmoke).toBe('npm run test:e2e')
  expect(cadence.controls.zeroPaidSpend).toBe(true)
  expect(cadence.controls.noStoreSubmission).toBe(true)
  expect(cadence.controls.noRevenueEnablement).toBe(true)
  expect(cadence.controls.scheduledLocalActionExecution).toBe(true)
  expect(cadence.controls.scheduledExecutionUsesOperatorAllowlist).toBe(true)
  expect(cadence.controls.postActionBuildRefresh).toBe(true)
  expect(cadence.controls.postActionVerification).toBe(true)
  expect(cadence.controls.codexAutomationExpectedActive).toBe(true)
  expect(cadence.controls.codexAutomationActualStatusAudited).toBe(true)
  expect(cadence.controls.staleEvidenceBlocksUnattendedTrust).toBe(true)
  expect(cadence.controls.productionInputWatchWritePermissionGated).toBe(true)
  expect(cadence.controls.publicEvidenceIntakeWritePermissionGated).toBe(true)
  expect(cadence.controls.postDeployEvidenceSyncWritePermissionGated).toBe(true)
  expect(cadence.checks.find((check) => check.id === 'post-self-update-deploy')?.status).toBe('pass')
  expect(cadence.checks.find((check) => check.id === 'production-input-watch-workflow')?.status).toBe('pass')
  expect(cadence.checks.find((check) => check.id === 'public-evidence-intake-workflow')?.status).toBe('pass')
  expect(cadence.checks.find((check) => check.id === 'post-deploy-evidence-sync-workflow')?.status).toBe('pass')
  expect(cadence.freshnessPolicy.status).toBe('fresh')
  expect(cadence.freshnessPolicy.staleAfterHours).toBeGreaterThanOrEqual(24)
  expect(cadence.freshnessPolicy.requiredArtifactCount).toBe(cadence.artifactFreshness.length)
  expect(cadence.freshnessPolicy.freshArtifactCount).toBe(cadence.freshnessPolicy.requiredArtifactCount)
  expect(cadence.freshnessPolicy.staleArtifactCount).toBe(0)
  expect(cadence.freshnessPolicy.staleArtifactIds).toEqual([])
  expect(cadence.artifactFreshness.every((artifact) => artifact.status === 'fresh')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'objective-audit')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'deployment-plan')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'repository-readiness')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'production-bootstrap')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'event-collector-deployment')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'event-collector-smoke')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'autonomous-self-update')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'post-deploy-artifact-sync')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'live-site-monitor')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'event-ingest')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'event-ingest-smoke')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'traffic-seeding')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'acquisition-learning')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'organic-seed-loop')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'analytics-rollup')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'experiment-results')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'product-optimization')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'product-gate-recovery')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'completion-loop')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'replay-loop')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'retention-loop')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'first-move-coach')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'release-health')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'applied-improvements')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'improvement-backlog')).toBe(true)
  expect(cadence.artifactFreshness.some((artifact) => artifact.id === 'improvement-routing')).toBe(true)
  expect(cadence.checks.some((check) => check.id === 'fresh-generated-evidence')).toBe(true)
  expect(cadence.checks.every((check) => check.status === 'pass')).toBe(true)
  if (cadence.schedulers.codexDesktop.status === 'active-confirmed') {
    expect(cadence.schedulers.codexDesktop.actual.installedStatus).toBe('ACTIVE')
    expect(cadence.schedulers.codexDesktop.actual.scheduleMatches).toBe(true)
    expect(cadence.schedulers.codexDesktop.actual.workspaceMatches).toBe(true)
    expect(cadence.schedulers.codexDesktop.actual.promptGuardrailsPresent).toBe(true)
    expect(cadence.schedulers.codexDesktop.actual.relatedActiveAutomationIds).toEqual([])
  }
  expect(manifest.id).toBe(cadence.schedulers.codexDesktop.id)
  expect(manifest.status).toBe('active-declared')
  expect(manifest.guardrails.zeroPaidSpend).toBe(true)
  expect(manifest.guardrails.noStoreSubmission).toBe(true)
  expect(manifest.guardrails.noRevenueEnablement).toBe(true)

  await page.goto('/')
  await expect(page.getByLabel('Autonomous Cadence')).toContainText('cadence-ready')
  await expect(page.getByLabel('Autonomous Cadence')).toContainText('fresh')
})

test('autonomous self-update persists only verified allowlisted generated changes', async ({ page }) => {
  const selfUpdate = JSON.parse(await readFile('data/autonomous-self-update.json', 'utf8')) as {
    status: string
    repository: { remotePushReady: boolean; directPushConfigured: boolean }
    pendingChanges: { unsafeCount: number; safeCount: number }
    commitPlan: {
      workflow: string
      enabledByRepositoryVariable: string
      directPushRequiresRepositoryVariable: string
      verificationBeforeCommit: string[]
      stagePaths: string[]
    }
    controls: {
      zeroPaidSpend: boolean
      dailyWorkflowReadOnly: boolean
      writePermissionIsolatedToSelfUpdateWorkflow: boolean
      commitRequiresCleanVerification: boolean
      commitRequiresSafePathAllowlist: boolean
      directPushRequiresExplicitVariable: boolean
      doesNotStageSourceOrWorkflowChanges: boolean
    }
    privacy: {
      rawEventDropsCommitBlocked: boolean
      localEventRollupsOnly: boolean
      blockedRawEventDropPrefix: string
    }
    checks: Array<{ id: string; status: string }>
  }
  const workflow = await readFile('.github/workflows/autonomous-self-update.yml', 'utf8')
  const dailyWorkflow = await readFile('.github/workflows/autonomous-daily.yml', 'utf8')

  expect(selfUpdate.status).toBe('self-update-ready')
  expect(selfUpdate.pendingChanges.unsafeCount).toBe(0)
  expect(selfUpdate.commitPlan.workflow).toBe('.github/workflows/autonomous-self-update.yml')
  expect(selfUpdate.commitPlan.enabledByRepositoryVariable).toBe('AGL_AUTONOMOUS_SELF_UPDATE=1')
  expect(selfUpdate.commitPlan.directPushRequiresRepositoryVariable).toBe('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT=1')
  expect(selfUpdate.commitPlan.verificationBeforeCommit).toContain('npm run autonomous:operate')
  expect(selfUpdate.commitPlan.verificationBeforeCommit).toContain('npm run autonomous:self-update -- --assert-safe')
  expect(selfUpdate.controls.zeroPaidSpend).toBe(true)
  expect(selfUpdate.controls.dailyWorkflowReadOnly).toBe(true)
  expect(selfUpdate.controls.writePermissionIsolatedToSelfUpdateWorkflow).toBe(true)
  expect(selfUpdate.controls.commitRequiresCleanVerification).toBe(true)
  expect(selfUpdate.controls.commitRequiresSafePathAllowlist).toBe(true)
  expect(selfUpdate.controls.directPushRequiresExplicitVariable).toBe(true)
  expect(selfUpdate.controls.doesNotStageSourceOrWorkflowChanges).toBe(true)
  expect(selfUpdate.privacy.rawEventDropsCommitBlocked).toBe(true)
  expect(selfUpdate.privacy.localEventRollupsOnly).toBe(true)
  expect(selfUpdate.privacy.blockedRawEventDropPrefix).toBe('data/player-events/')
  expect(selfUpdate.commitPlan.stagePaths.some((stagePath) => stagePath.startsWith('data/player-events/'))).toBe(false)
  expect(selfUpdate.checks.every((check) => check.status === 'pass')).toBe(true)
  expect(workflow).toContain("workflows: ['Autonomous Daily Studio']")
  expect(workflow).toContain('Wait for post-deploy evidence sync')
  expect(workflow).toContain('Post-Deploy Evidence Sync')
  expect(workflow).toContain('gh run list')
  expect(workflow).toContain("vars.AGL_AUTONOMOUS_SELF_UPDATE == '1'")
  expect(workflow).toContain('actions: read')
  expect(workflow).toContain('git pull --ff-only origin')
  expect(workflow).toContain('contents: write')
  expect(workflow).toContain('npm run autonomous:operate')
  expect(workflow).toContain('npm run autonomous:self-update -- --assert-safe')
  expect(workflow).not.toContain('fs.existsSync(filePath)')
  expect(dailyWorkflow).toContain('contents: read')
  expect(dailyWorkflow).toContain('npm run autonomous:operate')

  await page.goto('/')
  await expect(page.getByLabel('Autonomous Self Update')).toContainText('self-update-ready')
})

test('android signing prep creates redacted zero-spend TWA signing evidence', async ({ page }) => {
  const signing = JSON.parse(await readFile('data/android-signing.json', 'utf8')) as {
    status: string
    signing: {
      keyAlias: string
      sha256CertFingerprint: string
      generatedThisRun: boolean
    }
    localFiles: {
      keystorePath: string
      localEnvPath: string
      keystoreExists: boolean
      gitIgnored: boolean
    }
    ciSecrets: { configuredLocally: boolean; valuesRedacted: boolean; required: string[] }
    controls: {
      zeroPaidSpend: boolean
      noSecretValuesInReports: boolean
      localSecretFilesGitIgnored: boolean
      doesNotCommitKeystore: boolean
    }
    checks: Array<{ id: string; status: string }>
  }
  const gitignore = await readFile('.gitignore', 'utf8')
  const report = await readFile('reports/android-signing-latest.md', 'utf8')

  expect(signing.status).toBe('signing-prepared')
  expect(signing.signing.keyAlias).toBeTruthy()
  expect(signing.signing.sha256CertFingerprint).toMatch(/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/)
  expect(signing.localFiles.keystorePath).toBe('ops/android/signing/release.keystore')
  expect(signing.localFiles.localEnvPath).toBe('ops/production.env.local')
  expect(signing.localFiles.keystoreExists).toBe(true)
  expect(signing.localFiles.gitIgnored).toBe(true)
  expect(signing.ciSecrets.configuredLocally).toBe(true)
  expect(signing.ciSecrets.valuesRedacted).toBe(true)
  expect(signing.ciSecrets.required).toContain('AGL_ANDROID_KEYSTORE_BASE64')
  expect(signing.controls.zeroPaidSpend).toBe(true)
  expect(signing.controls.noSecretValuesInReports).toBe(true)
  expect(signing.controls.localSecretFilesGitIgnored).toBe(true)
  expect(signing.controls.doesNotCommitKeystore).toBe(true)
  expect(signing.checks.every((check) => check.status === 'pass')).toBe(true)
  expect(gitignore).toContain('ops/android/signing/')
  expect(gitignore).toContain('native/android/secrets/')
  expect(JSON.stringify(signing)).not.toContain('AGL_ANDROID_KEYSTORE_PASSWORD=')
  expect(report).not.toContain('AGL_ANDROID_KEYSTORE_BASE64=')

  await page.goto('/')
  await expect(page.getByLabel('Android Signing')).toContainText('signing-prepared')
})

test('iOS App Store handoff stays prepared and deferred without paid account work', async ({ page }) => {
  const iosRelease = JSON.parse(await readFile('data/ios-release.json', 'utf8')) as {
    status: string
    platform: string
    bundleId: string
    strategy: {
      packageStrategy: string
      nativeProjectDeferred: boolean
      xcodeProjectCreated: boolean
    }
    costGate: {
      appleDeveloperProgramAnnualUsd: number
      spendAllowed: boolean
    }
    controls: {
      zeroPaidSpend: boolean
      noAppleAccountCreation: boolean
      noStoreSubmission: boolean
      noXcodeProjectGenerated: boolean
    }
    handoff: {
      capacitorConfigPath: string
      appStoreHandoffPath: string
    }
    checks: Array<{ id: string; status: string }>
    blockers: string[]
    appLikeValueEvidence: string[]
  }
  const capacitorConfig = JSON.parse(await readFile('native/ios/capacitor.config.json', 'utf8')) as {
    appId: string
    webDir: string
    metadata: { nativeProjectGenerated: boolean }
  }
  const appStoreHandoff = JSON.parse(await readFile('native/ios/app-store-handoff.json', 'utf8')) as {
    bundleId: string
    controls: { noStoreSubmission: boolean }
    appReview: { appLikeValueEvidence: string[] }
  }
  const readiness = JSON.parse(await readFile('data/production-readiness.json', 'utf8')) as {
    distribution: {
      iosAppStore: { status: string; handoffStatus: string }
      iosRelease: {
        status: string
        bundleId: string
        controls: { noStoreSubmission: boolean }
        checks: Array<{ id: string; status: string }>
      }
      storePackage: { checks: Array<{ id: string; status: string }> }
    }
  }

  expect(iosRelease.status).toBe('deferred-until-ios-payback')
  expect(iosRelease.platform).toBe('ios-app-store')
  expect(iosRelease.strategy.packageStrategy).toBe('capacitor-pwa-shell-after-payback')
  expect(iosRelease.strategy.nativeProjectDeferred).toBe(true)
  expect(iosRelease.strategy.xcodeProjectCreated).toBe(false)
  expect(iosRelease.costGate.appleDeveloperProgramAnnualUsd).toBe(99)
  expect(iosRelease.costGate.spendAllowed).toBe(false)
  expect(iosRelease.controls.zeroPaidSpend).toBe(true)
  expect(iosRelease.controls.noAppleAccountCreation).toBe(true)
  expect(iosRelease.controls.noStoreSubmission).toBe(true)
  expect(iosRelease.controls.noXcodeProjectGenerated).toBe(true)
  expect(iosRelease.handoff.capacitorConfigPath).toBe('native/ios/capacitor.config.json')
  expect(iosRelease.handoff.appStoreHandoffPath).toBe('native/ios/app-store-handoff.json')
  expect(iosRelease.checks.find((check) => check.id === 'apple-privacy-labels')?.status).toBe('pass')
  expect(iosRelease.checks.find((check) => check.id === 'age-rating')?.status).toBe('pass')
  expect(iosRelease.checks.find((check) => check.id === 'native-app-like-value')?.status).toBe('pass')
  expect(iosRelease.checks.find((check) => check.id === 'annual-fee-payback')?.status).toBe('held-by-economics')
  expect(iosRelease.blockers.some((blocker) => blocker.startsWith('annual-fee-payback:'))).toBe(true)
  expect(iosRelease.appLikeValueEvidence.some((item) => item.includes('playable original games'))).toBe(true)
  expect(capacitorConfig.appId).toBe(iosRelease.bundleId)
  expect(capacitorConfig.webDir).toBe('dist')
  expect(capacitorConfig.metadata.nativeProjectGenerated).toBe(false)
  expect(appStoreHandoff.bundleId).toBe(iosRelease.bundleId)
  expect(appStoreHandoff.controls.noStoreSubmission).toBe(true)
  expect(appStoreHandoff.appReview.appLikeValueEvidence).toEqual(iosRelease.appLikeValueEvidence)
  expect(readiness.distribution.iosAppStore.status).toBe(iosRelease.status)
  expect(readiness.distribution.iosAppStore.handoffStatus).toBe(iosRelease.status)
  expect(readiness.distribution.iosRelease.bundleId).toBe(iosRelease.bundleId)
  expect(readiness.distribution.iosRelease.controls.noStoreSubmission).toBe(true)
  expect(readiness.distribution.storePackage.checks.find((check) => check.id === 'ios-app-store-handoff')?.status).toBe(
    'pass',
  )

  await page.goto('/')
  await expect(page.getByLabel('iOS Release Handoff')).toContainText('deferred')
  await expect(page.getByLabel('iOS Release Handoff')).toContainText(iosRelease.bundleId)
})

test('generated Digital Asset Links expose accurate Android TWA verification state', async ({ page }) => {
  const nativePackage = JSON.parse(await readFile('data/native-package.json', 'utf8')) as {
    packageName: string
    basePath: string
    manifestUrl: string
    commands: { init: string }
    handoff: { publicAssetLinksPath: string }
    assetLinks: {
      publicGenerated: boolean
      status: string
      domainVerificationReady: boolean
      requiredRootUrl: string
      publishedUrl: string
      requiresRootWellKnownPath: boolean
      rootAssetLinksLive?: { liveMatchesSource: boolean; status: string }
    }
    signing: { sha256CertFingerprint: string }
  }
  const androidRelease = JSON.parse(await readFile('data/android-release.json', 'utf8')) as {
    checks: Array<{ id: string; status: string }>
    blockers: string[]
  }
  const rootAssetlinksHandoff = JSON.parse(await readFile('data/android-root-assetlinks-handoff.json', 'utf8')) as {
    status: string
    target: {
      repository: string | null
      repositoryExists?: boolean
      requiredRootUrl: string
      projectPublishedUrl: string
      path: string
    }
    live?: { liveMatchesSource: boolean; status: string }
    source: { path: string; packageName: string; sha256CertFingerprint: string }
    handoff: { syncScriptPath: string; dryRunCommand: string; syncCommand: string; bootstrapCommand?: string }
    controls: {
      zeroPaidSpend: boolean
      dryRunByDefault: boolean
      explicitApplyFlagRequired: boolean
      explicitRepositoryCreateFlagRequired?: boolean
      noStoreSubmission: boolean
      sourceFileOnly?: boolean
      sourceFileContentOnly?: boolean
    }
  }
  const assetLinks = JSON.parse(await readFile('public/.well-known/assetlinks.json', 'utf8')) as Array<{
    relation: string[]
    target: { package_name: string; sha256_cert_fingerprints: string[] }
  }>
  const syncScript = await readFile('ops/github/sync-root-assetlinks.sh', 'utf8')

  expect(nativePackage.handoff.publicAssetLinksPath).toBe('public/.well-known/assetlinks.json')
  expect(nativePackage.assetLinks.publicGenerated).toBe(true)
  expect(assetLinks[0].relation).toContain('delegate_permission/common.handle_all_urls')
  expect(assetLinks[0].target.package_name).toBe(nativePackage.packageName)
  expect(assetLinks[0].target.sha256_cert_fingerprints[0]).toBe(nativePackage.signing.sha256CertFingerprint)
  expect(nativePackage.commands.init).toContain(nativePackage.manifestUrl)
  expect(rootAssetlinksHandoff.source.path).toBe('public/.well-known/assetlinks.json')
  expect(rootAssetlinksHandoff.source.packageName).toBe(nativePackage.packageName)
  expect(rootAssetlinksHandoff.source.sha256CertFingerprint).toBe(nativePackage.signing.sha256CertFingerprint)
  expect(rootAssetlinksHandoff.target.requiredRootUrl).toBe(nativePackage.assetLinks.requiredRootUrl)
  expect(rootAssetlinksHandoff.target.projectPublishedUrl).toBe(nativePackage.assetLinks.publishedUrl)
  expect(rootAssetlinksHandoff.target.path).toBe('.well-known/assetlinks.json')
  expect(rootAssetlinksHandoff.handoff.syncScriptPath).toBe('ops/github/sync-root-assetlinks.sh')
  expect(rootAssetlinksHandoff.handoff.dryRunCommand).toBe('./ops/github/sync-root-assetlinks.sh')
  expect(rootAssetlinksHandoff.controls.zeroPaidSpend).toBe(true)
  expect(rootAssetlinksHandoff.controls.dryRunByDefault).toBe(true)
  expect(rootAssetlinksHandoff.controls.explicitApplyFlagRequired).toBe(true)
  expect(rootAssetlinksHandoff.controls.explicitRepositoryCreateFlagRequired).toBe(true)
  expect(rootAssetlinksHandoff.controls.noStoreSubmission).toBe(true)
  expect(rootAssetlinksHandoff.controls.sourceFileContentOnly ?? rootAssetlinksHandoff.controls.sourceFileOnly).toBe(
    true,
  )
  expect(syncScript).toContain('AGL_SYNC_ROOT_ASSETLINKS')
  expect(syncScript).toContain('AGL_ALLOW_ROOT_ASSETLINKS_REPO_CREATE')
  expect(syncScript).toContain('AGL_SYNC_ROOT_ASSETLINKS_PAGES')
  expect(syncScript).toContain('gh repo clone')
  expect(syncScript).toContain('gh repo create')
  expect(syncScript).toContain('public/.well-known/assetlinks.json')
  expect(syncScript).toContain('.well-known/assetlinks.json')

  if (nativePackage.basePath === '/') {
    expect(nativePackage.assetLinks.status).toBe('ready')
    expect(nativePackage.assetLinks.domainVerificationReady).toBe(true)
    expect(rootAssetlinksHandoff.status).toBe('root-assetlinks-not-needed')
    expect(androidRelease.checks.find((check) => check.id === 'asset-links')?.status).toBe('pass')
    expect(androidRelease.blockers.some((blocker) => blocker.startsWith('asset-links:'))).toBe(false)
  } else if (rootAssetlinksHandoff.live?.liveMatchesSource || nativePackage.assetLinks.rootAssetLinksLive?.liveMatchesSource) {
    expect(nativePackage.assetLinks.status).toBe('ready')
    expect(nativePackage.assetLinks.domainVerificationReady).toBe(true)
    expect(nativePackage.assetLinks.requiresRootWellKnownPath).toBe(true)
    expect(nativePackage.assetLinks.requiredRootUrl).not.toContain(nativePackage.basePath)
    expect(rootAssetlinksHandoff.status).toBe('root-assetlinks-live')
    expect(rootAssetlinksHandoff.target.repository).toBe('moshequ/moshequ.github.io')
    expect(androidRelease.checks.find((check) => check.id === 'asset-links')?.status).toBe('pass')
    expect(androidRelease.blockers.some((blocker) => blocker.startsWith('asset-links:'))).toBe(false)
  } else {
    expect(nativePackage.assetLinks.status).toBe('domain-verification-blocked')
    expect(nativePackage.assetLinks.domainVerificationReady).toBe(false)
    expect(nativePackage.assetLinks.requiresRootWellKnownPath).toBe(true)
    expect(nativePackage.assetLinks.publishedUrl).toContain(nativePackage.basePath)
    expect(nativePackage.assetLinks.requiredRootUrl).not.toContain(nativePackage.basePath)
    expect(['root-assetlinks-handoff-ready', 'waiting-for-root-pages-repository']).toContain(rootAssetlinksHandoff.status)
    expect(rootAssetlinksHandoff.target.repository).toBe('moshequ/moshequ.github.io')
    expect(`${rootAssetlinksHandoff.handoff.syncCommand} ${rootAssetlinksHandoff.handoff.bootstrapCommand ?? ''}`).toContain(
      'AGL_SYNC_ROOT_ASSETLINKS=1',
    )
    expect(androidRelease.checks.find((check) => check.id === 'asset-links')?.status).toBe('blocker')
    expect(androidRelease.blockers.some((blocker) => blocker.startsWith('asset-links:'))).toBe(true)
  }

  const response = await page.goto('/.well-known/assetlinks.json')
  expect(response?.ok()).toBeTruthy()
  await expect(page.locator('body')).toContainText(nativePackage.packageName)
  await page.goto('/')
  await expect(page.getByLabel('Android Root Asset Links Handoff')).toContainText(rootAssetlinksHandoff.status)
  await expect(page.getByLabel('Android Root Asset Links Handoff')).toContainText('dry-run')
})

test('objective audit maps the goal to evidence and remaining blockers', async ({ page }) => {
  const audit = JSON.parse(await readFile('data/objective-audit.json', 'utf8')) as {
    status: string
    summary: { requirements: number; met: number; prepared: number; externalBlockers: number }
    requirements: Array<{ id: string; status: string; evidence: string[] }>
    blockers: { external: string[]; product: string[] }
    controls: {
      preserveOriginalScope: boolean
      doNotMarkGoalCompleteWhileBlocked: boolean
      zeroSpendGuard: boolean
    }
    completion: { canMarkGoalComplete: boolean; reason: string }
  }
  const requirementIds = audit.requirements.map((requirement) => requirement.id)

  expect(audit.status).toBe('objective-in-progress')
  expect(audit.summary.requirements).toBeGreaterThanOrEqual(8)
  expect(audit.summary.met).toBeGreaterThanOrEqual(5)
  expect(requirementIds).toContain('web-pwa-game-portal')
  expect(requirementIds).toContain('original-trend-driven-game-generation')
  expect(requirementIds).toContain('behavior-measurement-loop')
  expect(requirementIds).toContain('data-driven-improvement-loop')
  expect(requirementIds).toContain('monetization-path')
  expect(requirementIds).toContain('app-store-distribution-path')
  expect(audit.requirements.find((item) => item.id === 'monetization-path')?.status).toBe(
    'prepared-blocked-by-gates',
  )
  expect(audit.requirements.find((item) => item.id === 'app-store-distribution-path')?.status).toBe(
    'prepared-external-blockers',
  )
  expect(
    audit.requirements
      .find((item) => item.id === 'app-store-distribution-path')
      ?.evidence.some((item) => item.includes('iOS release:')),
  ).toBe(true)
  expect(audit.controls.preserveOriginalScope).toBe(true)
  expect(audit.controls.doNotMarkGoalCompleteWhileBlocked).toBe(true)
  expect(audit.controls.zeroSpendGuard).toBe(true)
  expect(audit.completion.canMarkGoalComplete).toBe(false)
  expect(audit.blockers.external.length).toBeGreaterThan(0)
  expect(audit.blockers.product.length).toBeGreaterThan(0)

  await page.goto('/')
  await expect(page.getByLabel('Objective Audit')).toContainText('objective-in-progress')
})

test('production blocker handoff ranks remaining external unlocks', async ({ page }) => {
  const handoff = JSON.parse(await readFile('data/production-blocker-handoff.json', 'utf8')) as {
    status: string
    sourceStatus: {
      productionEnvironment: string
      productionBootstrap: string
      objectiveAudit: string
      monetization: string
    }
    summary: {
      ownerActionRequired: number
      externalOwnerActions: number
      zeroCostFirstActions: number
      missingEnv: number
      missingEnvironmentItems: number
      missingSecrets: number
      publicSupportChannelReady: boolean
      storeSupportEmailNeededNow: boolean
      nextBestUnlockId: string | null
      nextBestUnlock: string | null
    }
    controls: {
      zeroPaidSpend: boolean
      noSecretValues: boolean
      noMutation: boolean
      noAccountCreation: boolean
      noStoreSubmission: boolean
      noRevenueEnablement: boolean
    }
    environmentPlan: Array<{ name: string; configured: boolean }>
    secretPlan: Array<{ repositorySecret: string; configured: boolean; value?: string }>
    handoffItems: Array<{
      id: string
      status: string
      ownerInputRequired: boolean
      costMode: string
      unlockKit?: { id: string; recommendedPathId: string; commandCount: number }
    }>
    nextUnlockKit: {
      id: string
      status: string
      recommendedPathId: string
      commandCount: number
      validationCommandCount: number
      controls: {
        zeroPaidSpend: boolean
        noSecretValues: boolean
        noAccountCreation: boolean
        noRevenueEnablement: boolean
        secretCommandsUseStdin: boolean
      }
      paths: Array<{
        id: string
        status: string
        costMode: string
        requiredVariables: Array<{ repositoryName: string; configured: boolean; command: string; value?: string }>
        requiredSecrets: Array<{ repositoryName: string; configured: boolean; command: string; value?: string }>
        commandSequence: string[]
        validationCommands: string[]
      }>
    } | null
  }
  const readiness = JSON.parse(await readFile('data/production-readiness.json', 'utf8')) as {
    productionBlockerHandoff?: {
      status: string
      summary: { nextBestUnlockId: string | null }
      nextUnlockKit?: { id: string; recommendedPathId: string } | null
    }
  }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }
  const itemIds = handoff.handoffItems.map((item) => item.id)

  expect(handoff.status).toMatch(/handoff-waiting-on-owner-inputs|handoff-clear/)
  expect(handoff.summary.externalOwnerActions).toBe(handoff.summary.ownerActionRequired)
  expect(handoff.summary.missingEnvironmentItems).toBe(handoff.summary.missingEnv)
  expect(handoff.summary.nextBestUnlock).toBe(handoff.summary.nextBestUnlockId)
  expect(handoff.summary.ownerActionRequired).toBeGreaterThan(0)
  expect(handoff.summary.zeroCostFirstActions).toBeGreaterThan(0)
  expect(handoff.summary.publicSupportChannelReady).toBe(true)
  expect(handoff.summary.storeSupportEmailNeededNow).toBe(false)
  expect(handoff.controls.zeroPaidSpend).toBe(true)
  expect(handoff.controls.noSecretValues).toBe(true)
  expect(handoff.controls.noMutation).toBe(true)
  expect(handoff.controls.noAccountCreation).toBe(true)
  expect(handoff.controls.noStoreSubmission).toBe(true)
  expect(handoff.controls.noRevenueEnablement).toBe(true)
  expect(itemIds).toContain('support-contact')
  expect(itemIds).toContain('production-analytics-browser')
  expect(itemIds).toContain('product-gate-sample')
  expect(itemIds).toContain('google-play-account')
  const supportItem = handoff.handoffItems.find((item) => item.id === 'support-contact')
  const analyticsItem = handoff.handoffItems.find((item) => item.id === 'production-analytics-browser')
  expect(supportItem?.status).toBe('web-support-ready-store-email-deferred')
  expect(supportItem?.ownerInputRequired).toBe(false)
  expect(supportItem?.costMode).toBe('zero-spend-public-issues-ready')
  expect(analyticsItem?.unlockKit?.id).toBe('production-analytics-browser')
  expect(analyticsItem?.unlockKit?.recommendedPathId).toBe('first-party-collector')
  expect(analyticsItem?.unlockKit?.commandCount).toBeGreaterThan(0)
  expect(handoff.summary.nextBestUnlockId).toBe('production-analytics-browser')
  expect(handoff.nextUnlockKit?.id).toBe('production-analytics-browser')
  expect(handoff.nextUnlockKit?.recommendedPathId).toBe('first-party-collector')
  expect(handoff.nextUnlockKit?.commandCount).toBeGreaterThanOrEqual(5)
  expect(handoff.nextUnlockKit?.validationCommandCount).toBeGreaterThanOrEqual(4)
  expect(handoff.nextUnlockKit?.controls.zeroPaidSpend).toBe(true)
  expect(handoff.nextUnlockKit?.controls.noSecretValues).toBe(true)
  expect(handoff.nextUnlockKit?.controls.noAccountCreation).toBe(true)
  expect(handoff.nextUnlockKit?.controls.noRevenueEnablement).toBe(true)
  expect(handoff.nextUnlockKit?.controls.secretCommandsUseStdin).toBe(true)
  expect(handoff.nextUnlockKit?.paths.map((item) => item.id)).toEqual(
    expect.arrayContaining(['first-party-collector', 'posthog-browser']),
  )
  const firstPartyCollectorPath = handoff.nextUnlockKit?.paths.find((item) => item.id === 'first-party-collector')
  const posthogPath = handoff.nextUnlockKit?.paths.find((item) => item.id === 'posthog-browser')
  expect(firstPartyCollectorPath?.requiredVariables.map((item) => item.repositoryName)).toEqual(
    expect.arrayContaining(['VITE_EVENT_COLLECTOR_URL', 'AGL_EVENT_COLLECTOR_EXPORT_URL']),
  )
  expect(firstPartyCollectorPath?.requiredSecrets.map((item) => item.repositoryName)).toEqual(
    expect.arrayContaining(['CLOUDFLARE_API_TOKEN', 'VITE_EVENT_COLLECTOR_WRITE_TOKEN']),
  )
  expect(firstPartyCollectorPath?.commandSequence).toContain('./ops/github/setup-production.sh')
  expect(firstPartyCollectorPath?.commandSequence).toContain('RUN_WORKFLOWS=1 ./ops/github/setup-production.sh')
  expect(firstPartyCollectorPath?.validationCommands).toContain('npm run autonomous:readiness')
  expect(firstPartyCollectorPath?.validationCommands).toContain('npm run test:e2e')
  expect(posthogPath?.requiredVariables.map((item) => item.repositoryName)).toContain('VITE_POSTHOG_KEY')
  expect(
    handoff.nextUnlockKit?.paths.some((unlockPath) =>
      [...unlockPath.requiredVariables, ...unlockPath.requiredSecrets].some((item) => Object.hasOwn(item, 'value')),
    ),
  ).toBe(false)
  expect(handoff.environmentPlan.some((item) => item.name === 'AGL_SUPPORT_EMAIL' && !item.configured)).toBe(true)
  expect(
    handoff.secretPlan.some(
      (item) => item.repositorySecret === 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON' && !item.configured,
    ),
  ).toBe(true)
  expect(handoff.secretPlan.some((item) => Object.hasOwn(item, 'value'))).toBe(false)
  expect(readiness.productionBlockerHandoff?.status).toBe(handoff.status)
  expect(readiness.productionBlockerHandoff?.summary.nextBestUnlockId).toBe(handoff.summary.nextBestUnlockId)
  expect(readiness.productionBlockerHandoff?.nextUnlockKit?.id).toBe(handoff.nextUnlockKit?.id)
  expect(readiness.productionBlockerHandoff?.nextUnlockKit?.recommendedPathId).toBe(
    handoff.nextUnlockKit?.recommendedPathId,
  )
  expect(packageJson.scripts['autonomous:blocker-handoff']).toBe('node scripts/production-blocker-handoff.mjs')
  expect(packageJson.scripts['autonomous:readiness']).toContain('autonomous:env')
  expect(packageJson.scripts['autonomous:readiness']).toContain('autonomous:blocker-handoff')
  expect(packageJson.scripts['autonomous:readiness'].indexOf('autonomous:env')).toBeLessThan(
    packageJson.scripts['autonomous:readiness'].indexOf('autonomous:blocker-handoff'),
  )

  await page.goto('/')
  await expect(page.getByLabel('Production Blocker Handoff')).toContainText(handoff.status)
  await expect(page.getByLabel('Production Blocker Handoff')).toContainText(handoff.summary.nextBestUnlockId ?? 'none')
  await expect(page.getByLabel('Production Blocker Handoff')).toContainText('Unlock kit')
  await expect(page.getByLabel('Production Blocker Handoff')).toContainText('first-party-collector')
})

test('daily challenge starts the retained game and records retention telemetry', async ({ page }) => {
  const retention = JSON.parse(await readFile('data/retention-loop.json', 'utf8')) as {
    dailyChallenge: { gameId: string; title: string }
    samplePolicy: {
      status: string
      needed: { promptViews: number; successes: number }
      controls: { zeroPaidSpend: boolean; noSyntheticEvents: boolean; downloadsScanBackoffRequired: boolean }
    }
  }

  await page.goto('/')

  const dailyRetention = page.getByLabel('Daily Retention')
  await expect(dailyRetention).toContainText('retention-loop-ready')
  await expect(dailyRetention).toContainText(retention.samplePolicy.status)
  await expect(dailyRetention).toContainText(
    `${retention.samplePolicy.needed.promptViews} views / ${retention.samplePolicy.needed.successes} returns`,
  )
  expect(retention.samplePolicy.controls.zeroPaidSpend).toBe(true)
  expect(retention.samplePolicy.controls.noSyntheticEvents).toBe(true)
  expect(retention.samplePolicy.controls.downloadsScanBackoffRequired).toBe(true)
  await page.getByRole('button', { name: 'Play daily challenge' }).click()
  await expect(page.getByRole('heading', { name: retention.dailyChallenge.title })).toBeVisible()

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const viewed = events.findLast((event: { name: string }) => event.name === 'daily_challenge_viewed')
  const started = events.findLast((event: { name: string }) => event.name === 'daily_challenge_started')

  expect(viewed.properties.gameId).toBe(retention.dailyChallenge.gameId)
  expect(viewed.properties.challengeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  expect(started.properties.gameId).toBe(retention.dailyChallenge.gameId)
  expect(started.properties.seed).toMatch(/^daily-/)
  expect(started.properties.rewardVariantId).toBeTruthy()
})

test('daily return prompt captures a local return intent after a completed run', async ({ page }) => {
  const retention = JSON.parse(await readFile('data/retention-loop.json', 'utf8')) as {
    localState: { returnIntentKey: string }
    promptPolicy: { ctaLabel: string; copy: string; nextChallengeDate: string; telemetry: { clicked: string; viewed: string } }
    rewardPolicy: {
      recommendedVariant: string
      controls: { noPaidRewards: boolean; noAds: boolean; noRevenueEnablement: boolean }
    }
  }
  const balance = JSON.parse(await readFile('data/game-balance.json', 'utf8')) as {
    games: { 'harbor-rings': { maxMoves: number } }
  }
  const maxMoves = balance.games['harbor-rings'].maxMoves

  await page.addInitScript(() => {
    window.localStorage.setItem('agl.experiment.first_session_pacing', 'fast-start')
  })
  await page.goto('/?game=harbor-rings')
  const cockpit = page.getByLabel('Autonomy cockpit')
  await expect(cockpit.getByRole('heading', { name: 'Harbor Rings' })).toBeVisible()
  await expect(cockpit).toContainText(`0/${maxMoves}`)

  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  const cells = [
    [2, 2],
    [2, 1],
    [2, 3],
    [1, 2],
    [3, 2],
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
    [0, 2],
    [0, 0],
    [0, 1],
  ]
  const harborCellSize = 64
  const harborGap = 7
  const harborStartX = 106
  const harborStartY = 132

  const turnCount = () =>
    page.evaluate(() => {
      const raw = window.localStorage.getItem('agl.analytics.events')
      const events = raw ? JSON.parse(raw) : []
      return events.filter((event: { name: string }) => event.name === 'turn_taken').length
    })

  for (const [index, [row, col]] of cells.slice(0, maxMoves).entries()) {
    const x = harborStartX + col * (harborCellSize + harborGap) + harborCellSize / 2
    const y = harborStartY + row * (harborCellSize + harborGap) + harborCellSize / 2
    const targetMove = index + 1

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.mouse.click(box.x + (x / 560) * box.width, box.y + (y / 500) * box.height)

      if ((await turnCount()) >= targetMove) {
        break
      }

      await page.waitForTimeout(50)
    }

    await expect.poll(turnCount).toBe(targetMove)
  }

  const dailyRetention = page.getByLabel('Daily Retention')
  await expect(dailyRetention).toContainText('Return prompt')
  await expect(dailyRetention).toContainText(retention.promptPolicy.copy)
  expect(retention.rewardPolicy.recommendedVariant).toBe('daily-streak')
  expect(retention.rewardPolicy.controls.noPaidRewards).toBe(true)
  expect(retention.rewardPolicy.controls.noAds).toBe(true)
  expect(retention.rewardPolicy.controls.noRevenueEnablement).toBe(true)
  await dailyRetention.getByRole('button', { name: retention.promptPolicy.ctaLabel }).click()

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const viewed = events.findLast(
    (event: { name: string }) => event.name === 'daily_return_prompt_viewed',
  )
  const clicked = events.findLast(
    (event: { name: string }) => event.name === 'daily_return_prompt_clicked',
  )
  const returnIntentDate = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    retention.localState.returnIntentKey,
  )

  expect(viewed.properties.gameId).toBe('harbor-rings')
  expect(clicked.properties.intentDate).toBe(retention.promptPolicy.nextChallengeDate)
  expect(returnIntentDate).toBe(retention.promptPolicy.nextChallengeDate)
})

test('queued return intent starts a retained session without push or accounts', async ({ page }) => {
  const retention = JSON.parse(await readFile('data/retention-loop.json', 'utf8')) as {
    localState: { returnIntentKey: string; returnIntentStartedKey: string }
    dailyChallenge: { date: string; gameId: string; title: string }
    promptPolicy: { nextChallengeDate: string }
    returnIntentPolicy: {
      ctaLabel: string
      copy: string
      surface: string
      telemetry: { viewed: string; started: string }
    }
  }

  await page.addInitScript(
    ({ key, intentDate }) => {
      window.localStorage.setItem(key, intentDate)
    },
    {
      key: retention.localState.returnIntentKey,
      intentDate: retention.promptPolicy.nextChallengeDate,
    },
  )
  await page.goto('/')

  const dailyRetention = page.getByLabel('Daily Retention')
  await expect(dailyRetention).toContainText('Queued return')
  await expect(dailyRetention).toContainText(retention.returnIntentPolicy.copy)
  await dailyRetention.getByRole('button', { name: retention.returnIntentPolicy.ctaLabel }).click()
  await expect(page.getByRole('heading', { name: retention.dailyChallenge.title })).toBeVisible()

  const events = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw) : []
  })
  const viewed = events.findLast(
    (event: { name: string }) => event.name === retention.returnIntentPolicy.telemetry.viewed,
  )
  const started = events.findLast(
    (event: { name: string }) => event.name === retention.returnIntentPolicy.telemetry.started,
  )
  const dailyStarted = events.findLast(
    (event: { name: string }) => event.name === 'daily_challenge_started',
  )
  const startedDate = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    retention.localState.returnIntentStartedKey,
  )

  expect(viewed.properties.intentDate).toBe(retention.promptPolicy.nextChallengeDate)
  expect(started.properties.surface).toBe(retention.returnIntentPolicy.surface)
  expect(started.properties.gameId).toBe(retention.dailyChallenge.gameId)
  expect(started.properties.retentionEvidence).toBe('queued-return-intent')
  expect(started.properties.retentionCohortDate).toBe(retention.dailyChallenge.date)
  expect(started.properties.retentionReturnDate).toBe(retention.promptPolicy.nextChallengeDate)
  expect(started.properties.d1RetentionCandidate).toBe(true)
  expect(dailyStarted.properties.surface).toBe(retention.returnIntentPolicy.surface)
  expect(dailyStarted.properties.retentionEvidence).toBe('queued-return-intent')
  expect(startedDate).toBe(retention.promptPolicy.nextChallengeDate)
})

test('traffic seeding switches games and records campaign telemetry', async ({ page }) => {
  const traffic = JSON.parse(await readFile('data/traffic-seeding.json', 'utf8')) as {
    campaigns: Array<{ id: string; gameId: string; title: string }>
  }
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    summary: { defaultRouteCampaignId?: string }
    missions: Array<{ campaignId: string; gameId: string }>
  }
  const defaultMission = samplePlan.missions.find(
    (mission) => mission.campaignId === samplePlan.summary.defaultRouteCampaignId,
  )
  const campaign =
    traffic.campaigns.find((item) => item.gameId !== defaultMission?.gameId) ?? traffic.campaigns[0]

  expect(campaign).toBeTruthy()

  await page.goto('/')

  const trafficSeeding = page.getByLabel('Traffic Seeding')
  await trafficSeeding.getByRole('button', { name: `Seed traffic for ${campaign.title}` }).click()
  await expect(page.getByRole('heading', { name: campaign.title })).toBeVisible()
  const seededUrl = new URL(page.url())

  expect(seededUrl.searchParams.get('game')).toBe(campaign.gameId)
  expect(seededUrl.searchParams.get('utm_source')).toBe('seed_internal')
  expect(seededUrl.searchParams.get('utm_campaign')).toBe(campaign.id)

  const seedEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'seed_campaign_clicked')
  })

  expect(seedEvent.properties.gameId).toBe(campaign.gameId)
  expect(seedEvent.properties.campaignId).toBe(campaign.id)
  expect(seedEvent.properties.channel).toBe('internal-rotation')
  expect(seedEvent.properties.acquisitionCampaign).toBe(campaign.id)
  expect(seedEvent.properties.acquisitionSource).toBe('seed_internal')
  expect(seedEvent.properties.acquisitionChannel).toBe('internal-rotation')
  expect(seedEvent.properties.costUsd).toBe(0)

  await expect
    .poll(async () =>
      page.evaluate(({ campaignId, gameId }) => {
        const raw = window.localStorage.getItem('agl.analytics.events')
        const events = raw ? JSON.parse(raw) : []
        const started = events.findLast(
          (event: { name: string; properties: Record<string, string> }) =>
            event.name === 'game_started' &&
            event.properties.gameId === gameId &&
            event.properties.acquisitionCampaign === campaignId,
        )
        return started?.properties.acquisitionCampaign
      }, { campaignId: campaign.id, gameId: campaign.gameId }),
    )
    .toBe(campaign.id)
})

test('first move updates telemetry and tutorial completion', async ({ page }) => {
  await page.goto('/')

  if (!(await clickSharedFirstBoardCell(page))) {
    return
  }
  await expect(page.getByText(/^1\/\d+$/).first()).toBeVisible()

  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })

  expect(eventNames).toContain('tutorial_completed')
  expect(eventNames).toContain('turn_taken')

  const turnEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'turn_taken')
  })

  expect(turnEvent.properties.rewardVariantId).toBeTruthy()
  expect(turnEvent.properties.anonymousId).toMatch(/^anon-/)
  expect(turnEvent.properties.sessionId).toMatch(/^session-/)
  expect(turnEvent.properties.sessionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})

test('runtime errors are captured for release health', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'synthetic smoke runtime failure',
        filename: 'smoke.spec.ts',
        lineno: 12,
        colno: 3,
      }),
    )
  })

  const runtimeError = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'runtime_error')
  })

  expect(runtimeError.properties.message).toContain('synthetic smoke runtime failure')
  expect(runtimeError.properties.surface).toBe('window')
  expect(runtimeError.properties.anonymousId).toMatch(/^anon-/)
})

test('local analytics export produces an event drop file', async ({ page }) => {
  await page.goto('/')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export local analytics' }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()

  expect(download.suggestedFilename()).toMatch(/^player-events-\d{4}-\d{2}-\d{2}\.json$/)
  expect(downloadPath).toBeTruthy()

  if (!downloadPath) {
    return
  }

  const events = JSON.parse(await readFile(downloadPath, 'utf8')) as Array<{
    id: string
    name: string
    properties: Record<string, string | number | boolean | null>
  }>
  const exportEvent = events.findLast((event) => event.name === 'analytics_exported')
  const receipt = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('agl.analytics.localExportReceipt') ?? 'null'),
  )

  expect(exportEvent).toBeTruthy()
  expect(exportEvent?.properties.exportSurface).toBe('manual')
  expect(exportEvent?.properties.eventDropMode).toBe('download')
  expect(String(exportEvent?.properties.eventDropFileName ?? '')).toMatch(
    /^player-events-\d{4}-\d{2}-\d{2}T.*-manual\.json$/,
  )
  expect(exportEvent?.properties.eventCountAtExport).toBe(events.length)
  expect(Number(exportEvent?.properties.unexportedEventsBeforeExport ?? 0)).toBeGreaterThan(0)
  expect(exportEvent?.properties.exportCoverageStatusBeforeExport).toBe('waiting-for-first-export')
  expect(receipt?.exportedEventCount).toBe(events.length)
  expect(receipt?.latestEventId).toBe(events.at(-1)?.id)
  expect(
    events.some(
      (event) =>
        typeof event.properties.anonymousId === 'string' &&
        event.properties.anonymousId.startsWith('anon-'),
    ),
  ).toBe(true)
  expect(
    events.some(
      (event) =>
        typeof event.properties.sessionDate === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(event.properties.sessionDate),
    ),
  ).toBe(true)
})

test('aggregate evidence issue link summarizes local analytics without raw events', async ({ page }) => {
  const seedEvents = [
    {
      id: 'evt-start-one',
      name: 'game_started',
      createdAt: '2026-05-20T10:00:00.000Z',
      properties: { gameId: 'harbor-rings', anonymousId: 'anon-player-one' },
    },
    {
      id: 'evt-start-two',
      name: 'game_started',
      createdAt: '2026-05-20T10:05:00.000Z',
      properties: { gameId: 'harbor-rings', anonymousId: 'anon-player-two' },
    },
    {
      id: 'evt-complete-one',
      name: 'level_completed',
      createdAt: '2026-05-20T10:08:00.000Z',
      properties: { gameId: 'harbor-rings', anonymousId: 'anon-player-one' },
    },
    {
      id: 'evt-replay-one',
      name: 'replay_clicked',
      createdAt: '2026-05-20T10:12:00.000Z',
      properties: { gameId: 'harbor-rings', anonymousId: 'anon-player-one' },
    },
    {
      id: 'evt-d1-eligible',
      name: 'daily_challenge_completed',
      createdAt: '2026-05-21T10:12:00.000Z',
      properties: { gameId: 'harbor-rings', anonymousId: 'anon-player-one' },
    },
    {
      id: 'evt-d1-retained',
      name: 'daily_return_intent_started',
      createdAt: '2026-05-21T10:14:00.000Z',
      properties: { gameId: 'harbor-rings', anonymousId: 'anon-player-one' },
    },
  ]

  await page.addInitScript((events) => {
    window.localStorage.setItem('agl.analytics.events', JSON.stringify(events))
  }, seedEvents)
  await page.goto('/?game=harbor-rings')
  await page.evaluate(() => {
    const target = window as Window & { __aggregateEvidenceUrl?: string }
    target.__aggregateEvidenceUrl = ''
    window.open = ((url?: string | URL) => {
      target.__aggregateEvidenceUrl = String(url)
      return window
    }) as typeof window.open
  })

  const localEventBridge = page.getByLabel('Local Event Bridge')
  await localEventBridge.getByRole('button', { name: 'Share aggregate evidence' }).click()
  await page.waitForFunction(
    () => Boolean((window as Window & { __aggregateEvidenceUrl?: string }).__aggregateEvidenceUrl),
  )

  const opened = await page.evaluate(
    () => (window as Window & { __aggregateEvidenceUrl?: string }).__aggregateEvidenceUrl ?? '',
  )
  const openedUrl = new URL(opened)
  const openedText = decodeURIComponent(opened)
  const evidenceEvent = await page.evaluate(() => {
    const events = JSON.parse(window.localStorage.getItem('agl.analytics.events') ?? '[]') as Array<{
      name: string
      properties: Record<string, string | number | boolean | null>
    }>

    return events.findLast((event) => event.name === 'analytics_evidence_issue_opened')
  })
  const aggregateStarts = Number(evidenceEvent?.properties.starts ?? 0)

  expect(openedUrl.hostname).toBe('github.com')
  expect(openedUrl.pathname).toBe('/moshequ/autonomous-game-lab/issues/new')
  expect(openedUrl.searchParams.get('template')).toBe('analytics-evidence.yml')
  expect(openedUrl.searchParams.get('game')).toContain('Harbor Rings')
  expect(openedUrl.searchParams.get('starts')).toBe(String(aggregateStarts))
  expect(aggregateStarts).toBeGreaterThanOrEqual(seedEvents.filter((event) => event.name === 'game_started').length)
  expect(openedUrl.searchParams.get('completions')).toBe('1')
  expect(openedUrl.searchParams.get('replays')).toBe('1')
  expect(openedUrl.searchParams.get('d1_eligible')).toBe('1')
  expect(openedUrl.searchParams.get('d1_retained')).toBe('1')
  expect(openedUrl.searchParams.get('summary')).toContain('Aggregate-only browser summary')
  expect(openedText).not.toContain('anon-player')
  expect(openedText).not.toContain('evt-')
  expect(Number(evidenceEvent?.properties.localCampaignEvents ?? 0)).toBeGreaterThanOrEqual(seedEvents.length)
  expect(evidenceEvent?.properties).toMatchObject({
    surface: 'autonomy-cockpit-local-event-bridge',
    channel: 'local-aggregate-evidence',
    gameId: 'harbor-rings',
    gateId: null,
    campaignId: null,
    completions: 1,
    replays: 1,
    d1Eligible: 1,
    d1Retained: 1,
    publicAggregateOnly: true,
    rawEventsIncluded: false,
    identifiersIncluded: false,
    aggregateEvidenceDoesNotPassGates: true,
    destination: 'github-issues',
    zeroPaidSpend: true,
    noRevenueEnablement: true,
  })

  await expect(localEventBridge).toContainText('Share aggregate evidence')
})

test('aggregate evidence issue scopes runtime gate sample campaigns', async ({ page }) => {
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    missions: Array<{
      id: string
      gateId: string
      campaignId: string
      title: string
      gameId: string
    }>
  }
  const mission = samplePlan.missions[0]
  const otherCampaign = 'gate-sample-other-campaign'
  const seedEvents = [
    {
      id: 'evt-scoped-start',
      name: 'game_started',
      createdAt: '2026-05-20T10:00:00.000Z',
      properties: {
        gameId: mission.gameId,
        acquisitionCampaign: mission.campaignId,
        anonymousId: 'anon-scoped-player',
      },
    },
    {
      id: 'evt-scoped-complete',
      name: 'level_completed',
      createdAt: '2026-05-20T10:08:00.000Z',
      properties: {
        gameId: mission.gameId,
        acquisitionCampaign: mission.campaignId,
        anonymousId: 'anon-scoped-player',
      },
    },
    {
      id: 'evt-scoped-replay',
      name: 'replay_clicked',
      createdAt: '2026-05-20T10:12:00.000Z',
      properties: {
        gameId: mission.gameId,
        acquisitionCampaign: mission.campaignId,
        anonymousId: 'anon-scoped-player',
      },
    },
    {
      id: 'evt-other-start',
      name: 'game_started',
      createdAt: '2026-05-20T11:00:00.000Z',
      properties: {
        gameId: mission.gameId,
        acquisitionCampaign: otherCampaign,
        anonymousId: 'anon-other-player',
      },
    },
  ]

  await page.addInitScript((events) => {
    window.localStorage.setItem('agl.analytics.events', JSON.stringify(events))
  }, seedEvents)
  await page.goto(`/?game=${mission.gameId}&utm_source=gate_sample&utm_campaign=${mission.campaignId}`, {
    waitUntil: 'domcontentloaded',
  })
  await page.evaluate(() => {
    const target = window as Window & { __aggregateEvidenceUrl?: string }
    target.__aggregateEvidenceUrl = ''
    window.open = ((url?: string | URL) => {
      target.__aggregateEvidenceUrl = String(url)
      return window
    }) as typeof window.open
  })

  await page.getByLabel('Local Event Bridge').getByRole('button', { name: 'Share aggregate evidence' }).click()
  await page.waitForFunction(
    () => Boolean((window as Window & { __aggregateEvidenceUrl?: string }).__aggregateEvidenceUrl),
  )

  const opened = await page.evaluate(
    () => (window as Window & { __aggregateEvidenceUrl?: string }).__aggregateEvidenceUrl ?? '',
  )
  const openedUrl = new URL(opened)
  const openedText = decodeURIComponent(opened)
  const evidenceEvent = await page.evaluate(() => {
    const events = JSON.parse(window.localStorage.getItem('agl.analytics.events') ?? '[]') as Array<{
      name: string
      properties: Record<string, string | number | boolean | null>
    }>

    return events.findLast((event) => event.name === 'analytics_evidence_issue_opened')
  })

  expect(openedUrl.searchParams.get('title')).toContain('gate sample aggregate counts')
  expect(openedUrl.searchParams.get('game')).toContain(mission.title)
  expect(openedUrl.searchParams.get('game')).toContain(mission.gateId)
  expect(openedUrl.searchParams.get('game')).toContain(mission.campaignId)
  expect(Number(openedUrl.searchParams.get('starts'))).toBeGreaterThanOrEqual(1)
  expect(Number(openedUrl.searchParams.get('starts'))).toBeLessThan(3)
  expect(openedUrl.searchParams.get('completions')).toBe('1')
  expect(openedUrl.searchParams.get('replays')).toBe('1')
  expect(openedUrl.searchParams.get('summary')).toContain(mission.campaignId)
  expect(openedUrl.searchParams.get('summary')).toContain('does not pass product gates')
  expect(openedText).not.toContain(otherCampaign)
  expect(openedText).not.toContain('anon-scoped-player')
  expect(openedText).not.toContain('evt-scoped')
  expect(evidenceEvent?.properties).toMatchObject({
    surface: 'runtime-gate-sample-handoff',
    channel: 'product-gate-sample',
    gameId: mission.gameId,
    gateId: mission.gateId,
    campaignId: mission.campaignId,
    completions: 1,
    replays: 1,
    publicAggregateOnly: true,
    rawEventsIncluded: false,
    identifiersIncluded: false,
    aggregateEvidenceDoesNotPassGates: true,
    destination: 'github-issues',
    zeroPaidSpend: true,
    noRevenueEnablement: true,
  })
})

test('local event drop folder writes export files without external upload', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as {
      __eventDropWrites: Array<{ name: string; text: string }>
    }
    state.__eventDropWrites = []

    Object.defineProperty(window, 'showDirectoryPicker', {
      configurable: true,
      value: async () => ({
        queryPermission: async () => 'granted',
        requestPermission: async () => 'granted',
        getFileHandle: async (name: string) => ({
          createWritable: async () => ({
            write: async (chunk: string | Blob) => {
              state.__eventDropWrites.push({
                name,
                text: typeof chunk === 'string' ? chunk : await chunk.text(),
              })
            },
            close: async () => {},
          }),
        }),
      }),
    })
  })

  await page.goto('/')

  const bridge = page.getByLabel('Local Event Bridge')
  await bridge.getByRole('button', { name: 'Connect folder' }).click()
  await expect(bridge).toContainText('connected')

  await page.getByRole('button', { name: 'Export local analytics' }).click()
  await page.waitForFunction(() => {
    const state = window as unknown as { __eventDropWrites?: unknown[] }
    return (state.__eventDropWrites?.length ?? 0) > 0
  })

  const drop = await page.evaluate(() => {
    const state = window as unknown as {
      __eventDropWrites: Array<{ name: string; text: string }>
    }
    return state.__eventDropWrites[0]
  })
  const events = JSON.parse(drop.text) as Array<{
    name: string
    properties: Record<string, string | number | boolean | null>
  }>
  const exportEvent = events.findLast((event) => event.name === 'analytics_exported')

  expect(drop.name).toMatch(/^player-events-\d{4}-\d{2}-\d{2}T.*-manual\.json$/)
  expect(exportEvent?.properties).toMatchObject({
    destination: 'local_file',
    exportSurface: 'manual',
    eventDropMode: 'folder-preferred',
    eventDropFolderStatus: 'connected',
  })
  expect(exportEvent?.properties.eventDropFileName).toBe(drop.name)
  await expect(bridge).toContainText('saved')
})

test('local event drop folder autosaves play milestones without a manual download', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as {
      __eventDropWrites: Array<{ name: string; text: string }>
    }
    state.__eventDropWrites = []

    Object.defineProperty(window, 'showDirectoryPicker', {
      configurable: true,
      value: async () => ({
        queryPermission: async () => 'granted',
        requestPermission: async () => 'granted',
        getFileHandle: async (name: string) => ({
          createWritable: async () => ({
            write: async (chunk: string | Blob) => {
              state.__eventDropWrites.push({
                name,
                text: typeof chunk === 'string' ? chunk : await chunk.text(),
              })
            },
            close: async () => {},
          }),
        }),
      }),
    })
  })

  await page.goto('/')

  const bridge = page.getByLabel('Local Event Bridge')
  await bridge.getByRole('button', { name: 'Connect folder' }).click()
  await expect(bridge).toContainText('armed')

  if (!(await clickSharedFirstBoardCell(page))) {
    return
  }

  await page.waitForFunction(() => {
    const state = window as unknown as { __eventDropWrites?: unknown[] }
    return (state.__eventDropWrites?.length ?? 0) > 0
  })

  const drop = await page.evaluate(() => {
    const state = window as unknown as {
      __eventDropWrites: Array<{ name: string; text: string }>
    }
    return state.__eventDropWrites.at(-1)
  })
  const events = JSON.parse(drop.text) as Array<{
    name: string
    properties: Record<string, string | number | boolean | null>
  }>
  const exportEvent = events.findLast((event) => event.name === 'analytics_exported')

  expect(drop.name).toMatch(/^player-events-\d{4}-\d{2}-\d{2}T.*-local-event-drop-autosave\.json$/)
  expect(events.some((event) => event.name === 'tutorial_completed')).toBe(true)
  expect(exportEvent?.properties).toMatchObject({
    destination: 'local_file',
    exportSurface: 'local-event-drop-autosave',
    autoExportTrigger: 'tutorial_completed',
    fallbackDownloadEnabled: false,
    eventDropMode: 'folder-preferred',
  })
  expect(exportEvent?.properties.eventDropFileName).toBe(drop.name)
  await expect(bridge).toContainText('saved')
})

test('lantern relay prototype is playable and instrumented', async ({ page }) => {
  await page.goto('/')
  await page
    .getByLabel('Playable games')
    .getByRole('button', { name: /Lantern Relay/ })
    .click()

  await expectRunMoves(page, '0/10')
  await expect(page.getByText('86')).toBeVisible()

  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  await page.mouse.click(box.x + (85 / 560) * box.width, box.y + (183 / 500) * box.height)
  await expectRunMoves(page, '1/10')

  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })

  expect(eventNames).toContain('prototype_started')
  expect(eventNames).toContain('tutorial_completed')
  expect(eventNames).toContain('turn_taken')
})

test('harbor circuit prototype is playable and instrumented', async ({ page }) => {
  await page.goto('/')
  await page
    .getByLabel('Playable games')
    .getByRole('button', { name: /Harbor Circuit/ })
    .click()

  await expectRunMoves(page, '0/9')

  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  await page.mouse.click(box.x + (112 / 560) * box.width, box.y + (224 / 500) * box.height)
  await expectRunMoves(page, '1/9')

  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })

  expect(eventNames).toContain('prototype_started')
  expect(eventNames).toContain('tutorial_completed')
  expect(eventNames).toContain('turn_taken')
})

test('foundry ledger prototype is playable and instrumented', async ({ page }) => {
  await page.goto('/')
  await page
    .getByLabel('Playable games')
    .getByRole('button', { name: /Foundry Ledger/ })
    .click()

  await expectRunMoves(page, '0/9')

  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  await page.mouse.click(box.x + (94 / 560) * box.width, box.y + (160 / 500) * box.height)
  await expectRunMoves(page, '1/9')

  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })

  expect(eventNames).toContain('prototype_started')
  expect(eventNames).toContain('tutorial_completed')
  expect(eventNames).toContain('turn_taken')
})

test('orbit atlas prototype is playable and instrumented', async ({ page }) => {
  await page.goto('/')
  await page
    .getByLabel('Playable games')
    .getByRole('button', { name: /Orbit Atlas/ })
    .click()

  await expectRunMoves(page, '0/10')

  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  await page.mouse.click(box.x + (112 / 560) * box.width, box.y + (224 / 500) * box.height)
  await expectRunMoves(page, '1/10')

  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })

  expect(eventNames).toContain('prototype_started')
  expect(eventNames).toContain('tutorial_completed')
  expect(eventNames).toContain('turn_taken')
})

test('generated runtime game is playable and instrumented', async ({ page }) => {
  const generatedPlayable = JSON.parse(await readFile('data/generated-playable-games.json', 'utf8')) as {
    games: Array<{ id: string; title: string; maxMoves: number }>
  }
  const generatedGame = generatedPlayable.games[0]

  await page.goto('/')
  await page
    .getByLabel('Playable games')
    .getByRole('button', { name: generatedGame.title })
    .click()

  await expectRunMoves(page, `0/${generatedGame.maxMoves}`)

  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  await page.mouse.click(box.x + (75 / 560) * box.width, box.y + (176 / 500) * box.height)
  await expectRunMoves(page, `1/${generatedGame.maxMoves}`)

  const turnEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'turn_taken')
  })

  expect(turnEvent.properties.gameId).toBe(generatedGame.id)
  expect(turnEvent.properties.generatedRuntime).toBe(true)
})

test('generated runtime portfolio includes additional playable games', async ({ page }) => {
  const generatedPlayable = JSON.parse(await readFile('data/generated-playable-games.json', 'utf8')) as {
    games: Array<{ id: string; title: string; maxMoves: number }>
  }
  const additionalGame = generatedPlayable.games[2] ?? generatedPlayable.games[1]

  await page.goto('/')
  await page
    .getByLabel('Playable games')
    .getByRole('button', { name: additionalGame.title })
    .click()

  await expectRunMoves(page, `0/${additionalGame.maxMoves}`)

  const canvas = page.locator('canvas').first()
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()

  if (!box) {
    return
  }

  await page.mouse.click(box.x + (75 / 560) * box.width, box.y + (176 / 500) * box.height)
  await expectRunMoves(page, `1/${additionalGame.maxMoves}`)

  const turnEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'turn_taken')
  })

  expect(turnEvent.properties.gameId).toBe(additionalGame.id)
  expect(turnEvent.properties.generatedRuntime).toBe(true)
})

test('prototype queue records planning interest', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'View plan' }).first().click()

  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })

  expect(eventNames).toContain('prototype_card_viewed')
})

test('organic game links select a playable game and track entry', async ({ page }) => {
  await page.goto('/?game=orbit-atlas&utm_source=organic_game_page&utm_campaign=orbit-atlas')

  await expectRunMoves(page, '0/10')

  const entryEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'organic_entry_opened')
  })

  expect(entryEvent.properties.gameId).toBe('orbit-atlas')
  expect(entryEvent.properties.source).toBe('organic_game_page')

  const startedEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast(
      (event: { name: string; properties: Record<string, string> }) =>
        event.name === 'game_started' && event.properties.gameId === 'orbit-atlas',
    )
  })

  expect(startedEvent.properties.acquisitionSource).toBe('organic_game_page')
  expect(startedEvent.properties.acquisitionCampaign).toBe('orbit-atlas')
  expect(startedEvent.properties.acquisitionGameId).toBe('orbit-atlas')
  expect(startedEvent.properties.acquisitionChannel).toBe('organic-page')
})

test('generated organic game page is reachable and links into the PWA', async ({ page }) => {
  await page.goto('/games/harbor-rings.html')

  await expect(page.getByRole('heading', { name: 'Harbor Rings' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Play free puzzle|Try today's challenge|Start quick strategy run/ })).toHaveAttribute(
    'href',
    '../?game=harbor-rings&utm_source=organic_game_page&utm_campaign=harbor-rings',
  )
})

test('growth and traffic artifacts avoid placeholder origins before hosting is configured', async () => {
  const growth = JSON.parse(await readFile('data/growth-plan.json', 'utf8')) as {
    siteUrl: string | null
    publicUrlMode: string
    gamePages: Array<{ canonicalUrl: string | null; shareUrl: string; pagePath: string }>
  }
  const traffic = JSON.parse(await readFile('data/traffic-seeding.json', 'utf8')) as {
    siteUrl: string | null
    publicUrlMode: string
    sampleDistribution: { kitPath: string }
    evergreenRoute: { path: string; jsonPath: string; targetCampaignId: string | null }
    campaigns: Array<{ playUrl: string; shareUrl: string; pageUrl: string; pagePath: string }>
  }
  const shareManifest = JSON.parse(await readFile('public/share-manifest.json', 'utf8')) as {
    siteUrl: string | null
    publicUrlMode: string
    seedKit: { url: string }
    seedNext: { url: string; jsonUrl: string }
    gateSampleKit: { url: string }
    shares: Array<{ url: string }>
    seedCampaigns: Array<{ url: string; pageUrl: string }>
    gateSampleMissions: Array<{ url: string; pageUrl: string }>
  }
  const environment = JSON.parse(await readFile('data/production-environment.json', 'utf8')) as {
    publicOrigin: { origin: string | null }
  }
  const storePackage = JSON.parse(await readFile('data/store-package.json', 'utf8')) as {
    nativePackaging: { androidTwaManifest: { host: string | null } }
  }
  const nativePackage = JSON.parse(await readFile('data/native-package.json', 'utf8')) as {
    host: string | null
    publicOrigin: string | null
  }
  const publicAssets = [
    await readFile('public/robots.txt', 'utf8'),
    await readFile('public/sitemap.xml', 'utf8'),
    await readFile('public/games/harbor-rings.html', 'utf8'),
  ].join('\n')

  expect(JSON.stringify({ growth, traffic, shareManifest, storePackage, nativePackage })).not.toContain(
    'autonomous-game-lab.example.com',
  )
  expect(publicAssets).not.toContain('autonomous-game-lab.example.com')

  if (!environment.publicOrigin.origin) {
    expect(growth.siteUrl).toBeNull()
    expect(growth.publicUrlMode).toBe('runtime-relative')
    expect(traffic.siteUrl).toBeNull()
    expect(traffic.publicUrlMode).toBe('runtime-relative')
    expect(shareManifest.siteUrl).toBeNull()
    expect(shareManifest.publicUrlMode).toBe('runtime-relative')
    expect(growth.gamePages.every((game) => game.canonicalUrl === null && game.shareUrl.startsWith('/'))).toBe(true)
    expect(traffic.campaigns.every((campaign) => campaign.playUrl.startsWith('/') && campaign.shareUrl.startsWith('/'))).toBe(true)
    expect(traffic.campaigns.every((campaign) => campaign.pageUrl === campaign.pagePath)).toBe(true)
    expect(shareManifest.seedKit.url).toBe('/seed-kit.html')
    expect(shareManifest.seedNext.url).toBe('/seed-next.html')
    expect(shareManifest.seedNext.jsonUrl).toBe('/seed-next.json')
    expect(traffic.evergreenRoute.path).toBe('/seed-next.html')
    expect(traffic.evergreenRoute.jsonPath).toBe('/seed-next.json')
    expect(shareManifest.gateSampleKit.url).toBe(traffic.sampleDistribution.kitPath)
    expect(shareManifest.shares.every((share) => share.url.startsWith('/'))).toBe(true)
    expect(shareManifest.seedCampaigns.every((campaign) => campaign.url.startsWith('/') && campaign.pageUrl.startsWith('/'))).toBe(
      true,
    )
    expect(shareManifest.gateSampleMissions.every((mission) => mission.url.startsWith('/') && mission.pageUrl.startsWith('/'))).toBe(
      true,
    )
    expect(storePackage.nativePackaging.androidTwaManifest.host).toBeNull()
    expect(nativePackage.host).toBeNull()
    expect(nativePackage.publicOrigin).toBeNull()
  }
})

test('zero-spend seed kit is reachable and uses runtime-relative campaign links', async ({ page }) => {
  const traffic = JSON.parse(await readFile('data/traffic-seeding.json', 'utf8')) as {
    guardrails: {
      maxCostUsd: number
      playerInitiatedSharingOnly: boolean
      productGateSampleSharingOnly: boolean
      noAutomatedExternalPosting: boolean
    }
    sampleDistribution: {
      status: string
      kitPath: string
      defaultCampaignId: string
      missionCount: number
      playerInitiatedSharingOnly: boolean
      noAutomatedExternalPosting: boolean
      noSyntheticEvents: boolean
      exportControls: boolean
      shareControls: boolean
    }
    evergreenRoute: {
      status: string
      path: string
      jsonPath: string
      targetCampaignId: string
      targetGameId: string
      costUsd: number
      playerInitiatedOnly: boolean
      noAutomatedExternalPosting: boolean
    }
    campaigns: Array<{ id: string; gameId: string; sharePath: string; title: string }>
  }
  const shareManifest = JSON.parse(await readFile('public/share-manifest.json', 'utf8')) as {
    seedKit: {
      path: string
      campaignCount: number
      costUsd: number
      playerInitiatedSharingOnly: boolean
      copyShareControls: boolean
      localAnalyticsEvents: boolean
      localAnalyticsStorageKey: string
    }
    seedNext: {
      path: string
      jsonPath: string
      targetCampaignId: string
      targetGameId: string
      costUsd: number
      playerInitiatedOnly: boolean
      noAutomatedExternalPosting: boolean
      localAnalyticsEvents: boolean
      localAnalyticsStorageKey: string
    }
    gateSampleKit: {
      path: string
      campaignCount: number
      defaultCampaignId: string
      costUsd: number
      playerInitiatedSharingOnly: boolean
      copyShareControls: boolean
      exportControls: boolean
      localAnalyticsEvents: boolean
      localAnalyticsStorageKey: string
    }
    gateSampleMissions: Array<{
      campaignId: string
      gateId: string
      title: string
      playPath: string
      needed: { promptViews: number; successes: number }
      costUsd: number
    }>
  }
  const seedNext = JSON.parse(await readFile('public/seed-next.json', 'utf8')) as {
    status: string
    path: string
    jsonPath: string
    target: {
      campaignId: string
      gameId: string
      targetPath: string
      targetStartsBeforeJudgment: number
    }
    guardrails: {
      costUsd: number
      playerInitiatedOnly: boolean
      noAutomatedExternalPosting: boolean
      noPaidPromotion: boolean
      noSyntheticEvents: boolean
      noRevenueEnablement: boolean
    }
    telemetry: string[]
  }

  await page.goto('/seed-kit.html')

  await expect(page.getByRole('heading', { name: 'Autonomous Game Lab Seed Kit' })).toBeVisible()
  await expect(page.getByText('$0.00 spend')).toBeVisible()
  expect(shareManifest.seedKit.path).toBe('/seed-kit.html')
  expect(shareManifest.seedKit.campaignCount).toBe(traffic.campaigns.length)
  expect(shareManifest.seedKit.costUsd).toBe(traffic.guardrails.maxCostUsd)
  expect(traffic.guardrails.playerInitiatedSharingOnly).toBe(true)
  expect(traffic.guardrails.productGateSampleSharingOnly).toBe(true)
  expect(traffic.guardrails.noAutomatedExternalPosting).toBe(true)
  expect(shareManifest.seedKit.playerInitiatedSharingOnly).toBe(true)
  expect(shareManifest.seedKit.copyShareControls).toBe(true)
  expect(shareManifest.seedKit.localAnalyticsEvents).toBe(true)
  expect(shareManifest.seedKit.localAnalyticsStorageKey).toBe('agl.analytics.events')
  expect(traffic.evergreenRoute.status).toBe('armed')
  expect(traffic.evergreenRoute.path).toBe('/seed-next.html')
  expect(traffic.evergreenRoute.jsonPath).toBe('/seed-next.json')
  expect(traffic.evergreenRoute.costUsd).toBe(0)
  expect(traffic.evergreenRoute.playerInitiatedOnly).toBe(true)
  expect(traffic.evergreenRoute.noAutomatedExternalPosting).toBe(true)
  expect(shareManifest.seedNext.path).toBe('/seed-next.html')
  expect(shareManifest.seedNext.jsonPath).toBe('/seed-next.json')
  expect(shareManifest.seedNext.targetCampaignId).toBe(traffic.evergreenRoute.targetCampaignId)
  expect(shareManifest.seedNext.targetGameId).toBe(traffic.evergreenRoute.targetGameId)
  expect(shareManifest.seedNext.costUsd).toBe(0)
  expect(shareManifest.seedNext.playerInitiatedOnly).toBe(true)
  expect(shareManifest.seedNext.noAutomatedExternalPosting).toBe(true)
  expect(shareManifest.seedNext.localAnalyticsStorageKey).toBe('agl.analytics.events')
  expect(seedNext.path).toBe('/seed-next.html')
  expect(seedNext.jsonPath).toBe('/seed-next.json')
  expect(seedNext.status).toBe('armed')
  expect(seedNext.target.campaignId).toBe(traffic.evergreenRoute.targetCampaignId)
  expect(seedNext.target.gameId).toBe(traffic.evergreenRoute.targetGameId)
  expect(seedNext.guardrails.costUsd).toBe(0)
  expect(seedNext.guardrails.playerInitiatedOnly).toBe(true)
  expect(seedNext.guardrails.noAutomatedExternalPosting).toBe(true)
  expect(seedNext.guardrails.noPaidPromotion).toBe(true)
  expect(seedNext.guardrails.noSyntheticEvents).toBe(true)
  expect(seedNext.guardrails.noRevenueEnablement).toBe(true)
  expect(seedNext.telemetry).toContain('seed_next_viewed')
  expect(seedNext.telemetry).toContain('seed_next_routed')
  expect(traffic.sampleDistribution.status).toBe('gate-sample-sharing-ready')
  expect(traffic.sampleDistribution.missionCount).toBe(shareManifest.gateSampleMissions.length)
  expect(traffic.sampleDistribution.playerInitiatedSharingOnly).toBe(true)
  expect(traffic.sampleDistribution.noAutomatedExternalPosting).toBe(true)
  expect(traffic.sampleDistribution.noSyntheticEvents).toBe(true)
  expect(traffic.sampleDistribution.exportControls).toBe(true)
  expect(traffic.sampleDistribution.shareControls).toBe(true)
  expect(shareManifest.gateSampleKit.path).toBe(traffic.sampleDistribution.kitPath)
  expect(shareManifest.gateSampleKit.defaultCampaignId).toBe(traffic.sampleDistribution.defaultCampaignId)
  expect(shareManifest.gateSampleKit.playerInitiatedSharingOnly).toBe(true)
  expect(shareManifest.gateSampleKit.copyShareControls).toBe(true)
  expect(shareManifest.gateSampleKit.exportControls).toBe(true)
  expect(shareManifest.gateSampleKit.localAnalyticsStorageKey).toBe('agl.analytics.events')

  const firstCampaign = traffic.campaigns[0]
  const defaultSample = shareManifest.gateSampleMissions.find(
    (mission) => mission.campaignId === shareManifest.gateSampleKit.defaultCampaignId,
  )
  const firstCard = page.locator(`[data-campaign-id="${firstCampaign.id}"]`)
  await expect(firstCard).toContainText(firstCampaign.title)
  await expect(firstCard).toHaveAttribute('data-share-path', runtimeHref(firstCampaign.sharePath))
  await expect(firstCard).toHaveAttribute('data-game-id', firstCampaign.gameId)
  await expect(page.getByRole('link', { name: 'Seed link' }).first()).toHaveAttribute(
    'href',
    runtimeHref(firstCampaign.sharePath),
  )
  await expect(page.getByRole('link', { name: 'Open seed-next' })).toHaveAttribute('href', './seed-next.html')
  await expect(page.getByLabel('Evergreen seed route')).toContainText(firstCampaign.title)
  await expect(page.getByRole('button', { name: 'Copy share text' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Share' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open gate missions' })).toHaveAttribute('href', './gate-sample.html')
  expect(defaultSample).toBeTruthy()
  if (defaultSample) {
    await expect(page.getByLabel('Product gate sample kit')).toContainText(defaultSample.title)
    await expect(page.getByRole('link', { name: 'Start default sample' })).toHaveAttribute(
      'href',
      `.${defaultSample.playPath}`,
    )
    expect(defaultSample.costUsd).toBe(0)
    expect(defaultSample.needed.promptViews).toBeGreaterThan(0)
  }
  expect(firstCampaign.sharePath).toContain('utm_source=seed_share')
  expect(await page.content()).not.toContain('autonomous-game-lab.example.com')

  await page.getByRole('button', { name: 'Copy share text' }).first().click()
  await expect(firstCard.locator('[data-seed-status]')).toContainText(/copied|manually/i)
  const events = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('agl.analytics.events') ?? '[]') as Array<{
      name: string
      properties: Record<string, string | number | boolean>
    }>,
  )
  expect(
    events.some(
      (event) =>
        event.name === 'organic_seed_card_viewed' &&
        event.properties.campaignId === firstCampaign.id &&
        event.properties.surface === 'seed-kit',
    ),
  ).toBe(true)
  expect(
    events.some(
      (event) =>
        event.name === 'share_clicked' &&
        event.properties.campaignId === firstCampaign.id &&
        event.properties.acquisitionChannel === 'player-share',
    ),
  ).toBe(true)

  await page.goto('/seed-next.html?preview=1')
  await expect(page.getByRole('heading', { name: `Play ${firstCampaign.title}` })).toBeVisible()
  await expect(page.getByRole('link').first()).toHaveAttribute('href', runtimeHref(firstCampaign.sharePath))
  await expect(page.locator('[data-seed-next-status]')).toContainText('Preview mode')
  const previewEvents = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('agl.analytics.events') ?? '[]') as Array<{
      name: string
      properties: Record<string, string | number | boolean>
    }>,
  )
  expect(
    previewEvents.some(
      (event) =>
        event.name === 'seed_next_viewed' &&
        event.properties.campaignId === firstCampaign.id &&
        event.properties.acquisitionChannel === 'evergreen-seed-route',
    ),
  ).toBe(true)

  await page.goto('/seed-next.html')
  await page.waitForURL((url) => url.searchParams.get('utm_campaign') === firstCampaign.id)
  expect(new URL(page.url()).searchParams.get('game')).toBe(firstCampaign.gameId)
  const routedEvents = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('agl.analytics.events') ?? '[]') as Array<{
      name: string
      properties: Record<string, string | number | boolean>
    }>,
  )
  expect(
    routedEvents.some(
      (event) =>
        event.name === 'seed_next_routed' &&
        event.properties.campaignId === firstCampaign.id &&
        event.properties.zeroPaidSpend === true,
    ),
  ).toBe(true)
})

test('zero-spend gate sample page is reachable and uses runtime-relative mission links', async ({ page }) => {
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    publicSamplePage: {
      path: string
      missionCount: number
      primaryCampaignId: string
      fastestCampaignId: string
      defaultRouteCampaignId: string
      localProgressEnabled: boolean
      autonomousDefaultRoutingEnabled: boolean
      playerInitiatedExportEnabled: boolean
      playerInitiatedShareEnabled: boolean
      exportSurface: string
      zeroPaidSpend: boolean
      playerInitiatedOnly: boolean
      noSyntheticEvents: boolean
    }
    missions: Array<{
      id: string
      gateId: string
      campaignId: string
      title: string
      playPath: string
      sampleRole: string
      gameId: string
      needed: { minimumPromptViewsForDecision: number; successes: number }
      telemetry: { view: string[]; success: string[] }
    }>
  }
  const mission = samplePlan.missions[0]
  const fastestMission = samplePlan.missions.find((item) => item.sampleRole.includes('fastest-validation'))

  await page.addInitScript(({ campaignId, gameId, viewEvent, successEvent }) => {
    window.localStorage.setItem(
      'agl.analytics.events',
      JSON.stringify([
        {
          id: 'public-sample-view',
          name: viewEvent,
          properties: {
            campaignId,
            gameId,
            acquisitionCampaign: campaignId,
            acquisitionSource: 'gate_sample',
            acquisitionChannel: 'product-gate-sample',
          },
          createdAt: '2026-05-20T00:00:00.000Z',
        },
        {
          id: 'public-sample-success',
          name: successEvent,
          properties: {
            campaignId,
            gameId,
            acquisitionCampaign: campaignId,
            acquisitionSource: 'gate_sample',
            acquisitionChannel: 'product-gate-sample',
          },
          createdAt: '2026-05-20T00:01:00.000Z',
        },
      ]),
    )
  }, {
    campaignId: mission.campaignId,
    gameId: mission.gameId,
    viewEvent: mission.telemetry.view[0],
    successEvent: mission.telemetry.success[0],
  })

  await page.goto('/gate-sample.html')

  await expect(page.getByRole('heading', { name: 'Autonomous Game Lab Gate Sample Missions' })).toBeVisible()
  await expect(page.getByText('$0.00')).toBeVisible()
  expect(samplePlan.publicSamplePage.path).toBe('/gate-sample.html')
  expect(samplePlan.publicSamplePage.missionCount).toBe(samplePlan.missions.length)
  expect(samplePlan.publicSamplePage.primaryCampaignId).toBe(mission.campaignId)
  expect(samplePlan.publicSamplePage.fastestCampaignId).toBe(fastestMission?.campaignId)
  expect(samplePlan.publicSamplePage.defaultRouteCampaignId).toBeTruthy()
  expect(samplePlan.publicSamplePage.localProgressEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.autonomousDefaultRoutingEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.playerInitiatedExportEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.playerInitiatedShareEnabled).toBe(true)
  expect(samplePlan.publicSamplePage.exportSurface).toBe('product-gate-sample')
  expect(samplePlan.publicSamplePage.zeroPaidSpend).toBe(true)
  expect(samplePlan.publicSamplePage.playerInitiatedOnly).toBe(true)
  expect(samplePlan.publicSamplePage.noSyntheticEvents).toBe(true)

  const firstMission = page.locator(`[data-mission-id="${mission.id}"]`)
  await expect(firstMission).toContainText(mission.title)
  await expect(firstMission).toHaveAttribute('data-gate-id', mission.gateId)
  await expect(firstMission).toHaveAttribute('data-campaign-id', mission.campaignId)
  await expect(firstMission.locator(`[data-local-events="${mission.campaignId}"]`)).toHaveText('2')
  await expect(firstMission.locator(`[data-local-successes="${mission.campaignId}"]`)).toHaveText('1')
  await expect(firstMission.locator(`[data-local-debt="${mission.campaignId}"]`)).toContainText('wins')
  await expect(firstMission.getByRole('link', { name: 'Start mission' })).toHaveAttribute(
    'href',
    `.${mission.playPath}`,
  )
  await expect(firstMission.getByRole('button', { name: 'Share evidence' })).toBeVisible()
  await firstMission.getByRole('button', { name: 'Share mission' }).click()
  await page.waitForFunction((campaignId) => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return events.some(
      (event: { name: string; properties: Record<string, string> }) =>
        event.name === 'share_clicked' && event.properties.campaignId === campaignId,
    )
  }, mission.campaignId)

  const shareEvent = await page.evaluate((campaignId) => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []

    return events.findLast(
      (event: { name: string; properties: Record<string, string | number | boolean> }) =>
        event.name === 'share_clicked' && event.properties.campaignId === campaignId,
    )
  }, mission.campaignId)

  expect(shareEvent?.properties).toMatchObject({
    surface: 'public-gate-sample-page',
    channel: 'product-gate-sample',
    campaignId: mission.campaignId,
    gateId: mission.gateId,
    gameId: mission.gameId,
    acquisitionCampaign: mission.campaignId,
    acquisitionSource: 'gate_sample',
    acquisitionChannel: 'product-gate-sample',
    zeroPaidSpend: true,
    noPaidTraffic: true,
    noSyntheticEvents: true,
  })
  expect(String(shareEvent?.properties.shareUrl ?? '')).toContain(mission.playPath)
  const downloadPromise = page.waitForEvent('download')
  await firstMission.getByRole('button', { name: 'Export evidence' }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()

  expect(download.suggestedFilename()).toMatch(/^player-events-\d{4}-\d{2}-\d{2}\.json$/)
  expect(downloadPath).toBeTruthy()

  if (downloadPath) {
    const events = JSON.parse(await readFile(downloadPath, 'utf8')) as Array<{
      name: string
      properties: Record<string, string | number | boolean>
    }>
    const exportEvent = events.findLast((event) => event.name === 'analytics_exported')

    expect(exportEvent?.properties).toMatchObject({
      exportSurface: 'product-gate-sample',
      exportSurfaceDetail: 'public-gate-sample-page',
      gateId: mission.gateId,
      gameId: mission.gameId,
      campaignId: mission.campaignId,
      localObservedSuccesses: 1,
      localEvidenceDropReady: true,
      zeroPaidSpend: true,
      noSyntheticEvents: true,
    })
    expect(Number(exportEvent?.properties.localCampaignEvents ?? 0)).toBeGreaterThanOrEqual(3)
  }
  expect(fastestMission).toBeTruthy()

  if (fastestMission) {
    const fastestCard = page.locator(`[data-mission-id="${fastestMission.id}"]`)
    await expect(page.getByText('Fastest gate')).toBeVisible()
    await expect(fastestCard).toContainText('Fastest validation')
    await expect(fastestCard).toHaveAttribute('data-sample-role', /fastest-validation/)
    await expect(fastestCard).toHaveAttribute('data-campaign-id', fastestMission.campaignId)
  }

  expect(await page.content()).not.toContain('autonomous-game-lab.example.com')
})

test('public gate sample opens aggregate evidence issue without raw events', async ({ page }) => {
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    publicSamplePage: {
      aggregateEvidenceRepository: string | null
      aggregateEvidenceIssueTemplate: string
    }
    missions: Array<{
      id: string
      gateId: string
      campaignId: string
      title: string
      gameId: string
    }>
  }
  const mission = samplePlan.missions[0]
  const seedEvents = [
    {
      id: 'evt-public-start',
      name: 'game_started',
      properties: {
        campaignId: mission.campaignId,
        gameId: mission.gameId,
        acquisitionCampaign: mission.campaignId,
        anonymousId: 'anon-public-player',
      },
      createdAt: '2026-05-20T10:00:00.000Z',
    },
    {
      id: 'evt-public-complete',
      name: 'level_completed',
      properties: {
        campaignId: mission.campaignId,
        gameId: mission.gameId,
        acquisitionCampaign: mission.campaignId,
        anonymousId: 'anon-public-player',
      },
      createdAt: '2026-05-20T10:08:00.000Z',
    },
    {
      id: 'evt-public-replay',
      name: 'replay_clicked',
      properties: {
        campaignId: mission.campaignId,
        gameId: mission.gameId,
        acquisitionCampaign: mission.campaignId,
        anonymousId: 'anon-public-player',
      },
      createdAt: '2026-05-20T10:12:00.000Z',
    },
  ]

  await page.addInitScript((events) => {
    window.localStorage.setItem('agl.analytics.events', JSON.stringify(events))
  }, seedEvents)
  await page.goto('/gate-sample.html')
  await page.evaluate(() => {
    const target = window as Window & { __gateSampleEvidenceUrl?: string }
    target.__gateSampleEvidenceUrl = ''
    window.open = ((url?: string | URL) => {
      target.__gateSampleEvidenceUrl = String(url)
      return window
    }) as typeof window.open
  })

  await page
    .locator(`[data-mission-id="${mission.id}"]`)
    .getByRole('button', { name: 'Share evidence' })
    .click()
  await page.waitForFunction(
    () => Boolean((window as Window & { __gateSampleEvidenceUrl?: string }).__gateSampleEvidenceUrl),
  )

  const opened = await page.evaluate(
    () => (window as Window & { __gateSampleEvidenceUrl?: string }).__gateSampleEvidenceUrl ?? '',
  )
  const openedUrl = new URL(opened)
  const openedText = decodeURIComponent(opened)
  const evidenceEvent = await page.evaluate(() => {
    const events = JSON.parse(window.localStorage.getItem('agl.analytics.events') ?? '[]') as Array<{
      name: string
      properties: Record<string, string | number | boolean | null>
    }>

    return events.findLast((event) => event.name === 'analytics_evidence_issue_opened')
  })

  expect(samplePlan.publicSamplePage.aggregateEvidenceRepository).toBe('moshequ/autonomous-game-lab')
  expect(openedUrl.hostname).toBe('github.com')
  expect(openedUrl.pathname).toBe('/moshequ/autonomous-game-lab/issues/new')
  expect(openedUrl.searchParams.get('template')).toBe(samplePlan.publicSamplePage.aggregateEvidenceIssueTemplate)
  expect(openedUrl.searchParams.get('game')).toContain(mission.title)
  expect(openedUrl.searchParams.get('game')).toContain(mission.gateId)
  expect(openedUrl.searchParams.get('game')).toContain(mission.campaignId)
  expect(openedUrl.searchParams.get('starts')).toBe('1')
  expect(openedUrl.searchParams.get('completions')).toBe('1')
  expect(openedUrl.searchParams.get('replays')).toBe('1')
  expect(openedUrl.searchParams.get('summary')).toContain(mission.campaignId)
  expect(openedUrl.searchParams.get('summary')).toContain('does not pass product gates')
  expect(openedText).not.toContain('anon-public-player')
  expect(openedText).not.toContain('evt-public')
  expect(evidenceEvent?.properties).toMatchObject({
    surface: 'public-gate-sample-page',
    channel: 'product-gate-sample',
    campaignId: mission.campaignId,
    gateId: mission.gateId,
    gameId: mission.gameId,
    starts: 1,
    completions: 1,
    replays: 1,
    publicAggregateOnly: true,
    rawEventsIncluded: false,
    identifiersIncluded: false,
    aggregateEvidenceDoesNotPassGates: true,
    destination: 'github-issues',
    zeroPaidSpend: true,
    noSyntheticEvents: true,
    noRevenueEnablement: true,
  })
})

test('privacy control can disable external analytics forwarding', async ({ page }) => {
  const analyticsSource = await readFile('src/lib/analytics.ts', 'utf8')

  await page.goto('/')
  await page.getByRole('button', { name: 'Opt out external analytics' }).click()

  await expect(page.getByText('External analytics', { exact: true })).toBeVisible()
  await expect(page.getByText('off', { exact: true })).toBeVisible()

  const optedOut = await page.evaluate(() =>
    window.localStorage.getItem('agl.privacy.externalAnalyticsOptOut'),
  )
  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })

  expect(optedOut).toBe('true')
  expect(eventNames).toContain('privacy_choice_updated')
  expect(analyticsSource).toContain('flushBufferedEventsToCollector')
  expect(analyticsSource).toContain('forwardedIdsKey')
  expect(analyticsSource).toContain('navigator.sendBeacon')
  expect(analyticsSource).toContain('localExportReceiptKey')
  expect(analyticsSource).toContain('getLocalAnalyticsExportCoverage')
  expect(analyticsSource).toContain('markLocalAnalyticsExported')
  expect(analyticsSource).toContain("window.addEventListener('online'")
  expect(analyticsSource).toContain("window.addEventListener('pagehide'")
  expect(analyticsSource).toContain("window.addEventListener('visibilitychange'")
  expect(analyticsSource).toContain('postEventsToEventCollector(pendingEvents)')
  expect(analyticsSource.match(/markForwardedEvents\(pendingEvents\)/g)?.length).toBeGreaterThanOrEqual(2)
  expect(analyticsSource).toContain(
    [
      'if (options.preferBeacon && beaconEventsToEventCollector(pendingEvents)) {',
      '    markForwardedEvents(pendingEvents)',
      '    return',
      '  }',
    ].join('\n'),
  )
})

test('generated privacy policy is reachable', async ({ page }) => {
  await page.goto('/privacy.html')

  await expect(page.getByRole('heading', { name: 'Autonomous Game Lab Privacy Policy' })).toBeVisible()
  await expect(page.getByText('Gameplay analytics')).toBeVisible()
  await expect(page.getByText('External analytics opt-out')).toBeVisible()
})

test('generated support page is reachable', async ({ page }) => {
  await page.goto('/support.html')

  await expect(page.getByRole('heading', { name: 'Autonomous Game Lab Support' })).toBeVisible()
  await expect(page.getByText('internal web/PWA experiment mode')).toBeVisible()
  await expect(page.getByText('A production support email is required before public app-store submission.')).toBeVisible()
})

test('support channel publishes zero-spend public issue intake with privacy warnings', async ({ page }) => {
  const supportChannel = JSON.parse(await readFile('data/support-channel.json', 'utf8')) as {
    status: string
    provider: string
    repository: { target: string | null; publicIssuesReady: boolean }
    links: {
      supportUrl: string | null
      gameplayFeedbackUrl: string | null
      bugReportUrl: string | null
      analyticsEvidenceUrl: string | null
    }
    issueTemplates: Array<{
      id: string
      exists: boolean
      containsPrivacyWarning: boolean
      containsAggregateOnlyWarning: boolean
      url: string | null
    }>
    privacy: { analyticsEvidenceAggregateOnly: boolean }
    controls: {
      zeroPaidSpend: boolean
      noAccountCreation: boolean
      noStoreSubmission: boolean
      playerInitiatedOnly: boolean
      noPrivateDataInPrefilledUrls: boolean
      noRawEventEmbeddingInUrls: boolean
      noRawEventRowsInAnalyticsEvidence: boolean
      analyticsEvidenceAggregateOnly: boolean
      supportEmailStillRequiredForStoreSubmission: boolean
    }
  }
  const storePackage = JSON.parse(await readFile('data/store-package.json', 'utf8')) as {
    supportPage: { supportChannel: { status: string; provider: string; supportUrl: string | null } }
  }
  const analyticsTemplate = await readFile('.github/ISSUE_TEMPLATE/analytics-evidence.yml', 'utf8')
  const analyticsIssueTemplate = supportChannel.issueTemplates.find((template) => template.id === 'analytics-evidence')

  expect(['support-channel-ready', 'support-channel-planned']).toContain(supportChannel.status)
  expect(supportChannel.provider).toBe('github-issues')
  expect(supportChannel.links.supportUrl).toContain('/issues')
  expect(supportChannel.links.gameplayFeedbackUrl).toContain('player-feedback.yml')
  expect(supportChannel.links.bugReportUrl).toContain('bug-report.yml')
  expect(supportChannel.links.analyticsEvidenceUrl).toContain('analytics-evidence.yml')
  expect(supportChannel.issueTemplates.every((template) => template.exists)).toBe(true)
  expect(supportChannel.issueTemplates.every((template) => template.containsPrivacyWarning)).toBe(true)
  expect(analyticsIssueTemplate?.containsAggregateOnlyWarning).toBe(true)
  expect(analyticsTemplate).toContain('Share aggregate counts only')
  expect(analyticsTemplate).toContain('Aggregate starts')
  expect(supportChannel.controls.zeroPaidSpend).toBe(true)
  expect(supportChannel.controls.noAccountCreation).toBe(true)
  expect(supportChannel.controls.noStoreSubmission).toBe(true)
  expect(supportChannel.controls.playerInitiatedOnly).toBe(true)
  expect(supportChannel.controls.noPrivateDataInPrefilledUrls).toBe(true)
  expect(supportChannel.controls.noRawEventEmbeddingInUrls).toBe(true)
  expect(supportChannel.controls.noRawEventRowsInAnalyticsEvidence).toBe(true)
  expect(supportChannel.controls.analyticsEvidenceAggregateOnly).toBe(true)
  expect(supportChannel.privacy.analyticsEvidenceAggregateOnly).toBe(true)
  expect(supportChannel.controls.supportEmailStillRequiredForStoreSubmission).toBe(true)
  expect(storePackage.supportPage.supportChannel.status).toBe(supportChannel.status)
  expect(storePackage.supportPage.supportChannel.provider).toBe('github-issues')

  await page.goto('/support.html')
  await expect(page.getByRole('heading', { name: 'Public Support Channel' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open the public support intake' })).toHaveAttribute(
    'href',
    supportChannel.links.supportUrl ?? '#',
  )
  await expect(page.getByText('GitHub Issues are public')).toBeVisible()
  await expect(page.getByText('Do not paste private information')).toBeVisible()
  await expect(page.getByText('does not replace the production support email')).toBeVisible()
})

test('support feedback ingests public issues as redacted improvement evidence', async ({ page }) => {
  const supportFeedback = JSON.parse(await readFile('data/support-feedback.json', 'utf8')) as {
    status: string
    provider: string
    repository: string | null
    summary: {
      issuesInspected: number
      improvementSignals: number
      routableSignals: number
      aggregateEvidenceNotes: number
      aggregateEvidenceGames: number
      aggregateEvidenceCampaigns: number
      aggregateStarts: number
      aggregateCompletions: number
      aggregateReplays: number
    }
    controls: {
      zeroPaidSpend: boolean
      readOnlyGithubIssueList: boolean
      noIssueMutation: boolean
      publicIssuesOnly: boolean
      noAttachmentsDownloaded: boolean
      noRawAnalyticsStored: boolean
      noRawEventRowsAccepted: boolean
      redactsContactText: boolean
      playableTargetsOnlyForAutomation: boolean
      publicAggregateOnly: boolean
      aggregateEvidenceNeverMarksProductGatePass: boolean
      aggregateEvidenceRequiresManualReviewForGateDecisions: boolean
    }
    issueRecords: Array<{ title: string; excerpt: string; matchedSignals: string[] }>
    aggregateEvidenceNotes: Array<{
      status: string
      gateId: string | null
      campaignId: string | null
      counts: { starts: number | null }
    }>
    improvementSignals: Array<{ status: string; experiment: string; issueNumbers: number[] }>
  }
  const backlogSummary = JSON.parse(await readFile('data/improvement-backlog-summary.json', 'utf8')) as {
    supportFeedbackStatus: string
    supportFeedbackSignals: number
    supportFeedbackRoutableSignals: number
    supportFeedbackAggregateEvidenceNotes: number
    controls: {
      playableTargetsOnly: boolean
      noSyntheticEvents: boolean
      aggregateEvidenceNeverMarksProductGatePass: boolean
    }
  }
  const routing = JSON.parse(await readFile('data/improvement-routing.json', 'utf8')) as {
    supportFeedbackStatus: string
    supportFeedbackSignals: number
    supportFeedbackRoutableSignals: number
    supportFeedbackAggregateEvidenceNotes: number
  }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }
  const script = await readFile('scripts/support-feedback-ingestor.mjs', 'utf8')
  const intakeWorkflow = await readFile('.github/workflows/public-evidence-intake.yml', 'utf8')
  const webDeployWorkflow = await readFile('.github/workflows/web-pwa-deploy.yml', 'utf8')
  const intakeScript = packageJson.scripts['autonomous:public-evidence-intake'] ?? ''

  expect(['support-feedback-ready', 'support-feedback-empty', 'support-feedback-planned']).toContain(
    supportFeedback.status,
  )
  expect(supportFeedback.provider).toBe('github-issues')
  expect(supportFeedback.controls.zeroPaidSpend).toBe(true)
  expect(supportFeedback.controls.readOnlyGithubIssueList).toBe(true)
  expect(supportFeedback.controls.noIssueMutation).toBe(true)
  expect(supportFeedback.controls.publicIssuesOnly).toBe(true)
  expect(supportFeedback.controls.noAttachmentsDownloaded).toBe(true)
  expect(supportFeedback.controls.noRawAnalyticsStored).toBe(true)
  expect(supportFeedback.controls.noRawEventRowsAccepted).toBe(true)
  expect(supportFeedback.controls.redactsContactText).toBe(true)
  expect(supportFeedback.controls.playableTargetsOnlyForAutomation).toBe(true)
  expect(supportFeedback.controls.publicAggregateOnly).toBe(true)
  expect(supportFeedback.controls.aggregateEvidenceNeverMarksProductGatePass).toBe(true)
  expect(supportFeedback.controls.aggregateEvidenceRequiresManualReviewForGateDecisions).toBe(true)
  expect(supportFeedback.issueRecords.length).toBe(supportFeedback.summary.issuesInspected)
  expect(supportFeedback.aggregateEvidenceNotes.length).toBe(supportFeedback.summary.aggregateEvidenceNotes)
  expect(supportFeedback.improvementSignals.length).toBe(supportFeedback.summary.improvementSignals)
  expect(supportFeedback.improvementSignals.every((signal) => signal.status !== 'routable' || signal.issueNumbers.length > 0)).toBe(true)
  expect(backlogSummary.supportFeedbackStatus).toBe(supportFeedback.status)
  expect(backlogSummary.supportFeedbackSignals).toBe(supportFeedback.summary.improvementSignals)
  expect(backlogSummary.supportFeedbackRoutableSignals).toBe(supportFeedback.summary.routableSignals)
  expect(backlogSummary.supportFeedbackAggregateEvidenceNotes).toBe(supportFeedback.summary.aggregateEvidenceNotes)
  expect(backlogSummary.controls.playableTargetsOnly).toBe(true)
  expect(backlogSummary.controls.noSyntheticEvents).toBe(true)
  expect(backlogSummary.controls.aggregateEvidenceNeverMarksProductGatePass).toBe(true)
  expect(routing.supportFeedbackStatus).toBe(supportFeedback.status)
  expect(routing.supportFeedbackSignals).toBe(supportFeedback.summary.improvementSignals)
  expect(routing.supportFeedbackRoutableSignals).toBe(supportFeedback.summary.routableSignals)
  expect(routing.supportFeedbackAggregateEvidenceNotes).toBe(supportFeedback.summary.aggregateEvidenceNotes)
  expect(packageJson.scripts['autonomous:support-feedback']).toBe('node scripts/support-feedback-ingestor.mjs')
  expect(packageJson.scripts['autonomous:daily']).toContain('autonomous:support-feedback')
  expect(intakeScript).toContain('autonomous:support-feedback')
  expect(intakeScript).toContain('autonomous:analyze')
  expect(intakeScript).toContain('autonomous:gate-recovery')
  expect(intakeScript).toContain('autonomous:sample-plan')
  expect(intakeScript).toContain('autonomous:measurement-status')
  expect(intakeScript).toContain('npm run build')
  expect(intakeScript).toContain('autonomous:performance')
  expect(intakeScript).toContain('autonomous:release-candidate')
  expect(intakeScript).toContain('autonomous:post-deploy-smoke')
  expect(intakeScript).toContain('autonomous:live-monitor')
  expect(intakeScript).toContain('autonomous:readiness')
  expect(intakeScript).toContain('autonomous:owner-loop')
  expect(intakeScript).toContain('autonomous:operator')
  expect(intakeWorkflow).toContain('name: Public Evidence Intake')
  expect(intakeWorkflow).toContain('workflow_dispatch:')
  expect(intakeWorkflow).toContain('issues:')
  expect(intakeWorkflow).toContain('schedule:')
  expect(intakeWorkflow).toContain('contents: write')
  expect(intakeWorkflow).toContain('issues: read')
  expect(intakeWorkflow).toContain('GH_TOKEN: ${{ github.token }}')
  expect(intakeWorkflow).toContain('GITHUB_TOKEN: ${{ github.token }}')
  expect(intakeWorkflow).toContain('AGL_AUTONOMOUS_SELF_UPDATE: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE }}')
  expect(intakeWorkflow).toContain(
    'AGL_AUTONOMOUS_SELF_UPDATE_DIRECT: ${{ vars.AGL_AUTONOMOUS_SELF_UPDATE_DIRECT }}',
  )
  expect(intakeWorkflow).toContain('AGL_AUTONOMOUS_SELF_UPDATE_DIRECT')
  expect(intakeWorkflow).toContain('npm run autonomous:public-evidence-intake')
  expect(intakeWorkflow).toContain('node scripts/verify-autonomy.mjs')
  expect(intakeWorkflow).toContain('data/support-feedback.json')
  expect(intakeWorkflow).toContain('src/data/supportFeedback.ts')
  expect(intakeWorkflow).toContain('reports/support-feedback-latest.md')
  expect(intakeWorkflow).toContain('data/improvement-backlog-summary.json')
  expect(intakeWorkflow).toContain('data/improvement-routing.json')
  expect(intakeWorkflow).toContain('data/product-gate-sample-plan.json')
  expect(intakeWorkflow).toContain('public/gate-sample.html')
  expect(intakeWorkflow).toContain('data/production-measurement-status.json')
  expect(intakeWorkflow).toContain('public/measurement-status.html')
  expect(intakeWorkflow).toContain('public/measurement-status.json')
  expect(intakeWorkflow).toContain('data/autonomous-owner-loop.json')
  expect(intakeWorkflow).toContain('data/autonomous-operator.json')
  expect(intakeWorkflow).not.toContain('data/player-events')
  expect(intakeWorkflow).not.toContain('gh issue comment')
  expect(intakeWorkflow).not.toContain('gh issue edit')
  expect(intakeWorkflow).not.toContain('curl ')
  expect(intakeWorkflow).not.toContain('workflow run')
  expect(webDeployWorkflow).toContain("'Public Evidence Intake'")
  expect(script).toContain('readOnlyGithubIssueList')
  expect(script).toContain('noAttachmentsDownloaded')
  expect(script).toContain('issueFormField')
  expect(script).toContain('parseMissionMetadata')
  expect(script).toContain('campaignId')
  expect(script).toContain('aggregateEvidenceNeverMarksProductGatePass')

  await page.goto('/')
  await expect(page.getByLabel('Support Feedback')).toContainText(supportFeedback.status)
  await expect(page.getByLabel('Support Feedback')).toContainText(`${supportFeedback.summary.issuesInspected}`)
  await expect(page.getByLabel('Support Feedback')).toContainText(`${supportFeedback.summary.aggregateEvidenceNotes}`)
})

test('production measurement status publishes public aggregate evidence handoff', async ({ page }) => {
  const supportFeedback = JSON.parse(await readFile('data/support-feedback.json', 'utf8')) as {
    status: string
    summary: {
      aggregateEvidenceNotes: number
      aggregateEvidenceGames: number
      aggregateEvidenceCampaigns: number
      aggregateStarts: number
      aggregateCompletions: number
      aggregateReplays: number
    }
  }
  const samplePlan = JSON.parse(await readFile('data/product-gate-sample-plan.json', 'utf8')) as {
    summary: { supportingAggregateEvidenceNotes: number }
  }
  const postDeploySync = JSON.parse(await readFile('data/post-deploy-artifact-sync.json', 'utf8')) as {
    status: string
    live?: { candidateId?: string }
  }
  const measurement = JSON.parse(await readFile('data/production-measurement-status.json', 'utf8')) as {
    status: string
    liveCandidate: string | null
    analytics: {
      localEvidence: {
        aggregateEvidenceNotes: number
        aggregateEvidenceStarts: number
        aggregateEvidenceCompletions: number
        aggregateEvidenceReplays: number
      }
    }
    productGateEvidence: {
      supportingAggregateEvidenceNotes: number
      aggregateEvidenceMissionCount: number
    }
    analyticsUnlock: {
      id: string
      status: string
      recommendedPathId: string
      commandCount: number
      validationCommandCount: number
      missingVariableCount: number
      missingSecretCount: number
      controls: {
        zeroPaidSpend: boolean
        noSecretValues: boolean
        noSecretValuesStored: boolean
        noAccountCreation: boolean
        noStoreSubmission: boolean
        noRevenueEnablement: boolean
        githubVariablesOnly: boolean
        secretCommandsUseStdin: boolean
      }
      paths: Array<{
        id: string
        requiredVariables: Array<{ repositoryName: string; command: string; value?: string }>
        requiredSecrets: Array<{ repositoryName: string; command: string; value?: string }>
        commandSequence: string[]
        validationCommands: string[]
      }>
      nextActions: string[]
    } | null
    publicEvidenceHandoff: {
      status: string
      source: string
      supportFeedbackStatus: string
      analyticsEvidenceIssue: string | null
      aggregateEvidence: {
        notes: number
        games: number
        campaigns: number
        starts: number
        completions: number
        replays: number
        topNotes: Array<{
          number: number | null
          status: string
          counts: { starts: number; completions: number; replays: number }
          privacy: {
            publicAggregateOnly: boolean
            rawEventsAccepted: boolean
            rawEventRowsStored: boolean
            attachmentsDownloaded: boolean
          }
        }>
      }
      campaignEvidence: Array<{ noteCount: number; starts: number }>
      productGateMissions: {
        supportingAggregateEvidenceNotes: number
        missionsWithAggregateEvidence: number
        topMissions: Array<{
          noteCount: number
          gateDecisionEligible: boolean
          manualReviewRequired: boolean
        }>
      }
      controls: {
        aggregateEvidenceDoesNotPassGates: boolean
        manualReviewRequiredForGateDecisions: boolean
        noRawEventsStored: boolean
        publicAggregateOnly: boolean
        playerInitiatedOnly: boolean
        zeroPaidSpend: boolean
        noAutomaticPublicUpload: boolean
        noRevenueEnablement: boolean
      }
      nextActions: string[]
    }
    controls: {
      aggregateEvidenceDoesNotPassGates: boolean
      manualReviewRequiredForGateDecisions: boolean
    }
    nextActions: string[]
  }
  const publicMeasurement = JSON.parse(await readFile('public/measurement-status.json', 'utf8')) as typeof measurement
  const html = await readFile('public/measurement-status.html', 'utf8')
  const script = await readFile('scripts/production-measurement-status.mjs', 'utf8')

  expect([
    'production-measurement-local-intake-ready',
    'production-measurement-browser-ready',
    'production-measurement-configured',
  ]).toContain(measurement.status)
  expect(measurement.liveCandidate).toBe(postDeploySync.live?.candidateId ?? null)
  expect(publicMeasurement.liveCandidate).toBe(postDeploySync.live?.candidateId ?? null)
  expect(measurement.publicEvidenceHandoff.source).toBe('support-feedback-public-issues')
  expect(measurement.publicEvidenceHandoff.supportFeedbackStatus).toBe(supportFeedback.status)
  expect(measurement.publicEvidenceHandoff.aggregateEvidence.notes).toBe(supportFeedback.summary.aggregateEvidenceNotes)
  expect(measurement.publicEvidenceHandoff.aggregateEvidence.games).toBe(supportFeedback.summary.aggregateEvidenceGames)
  expect(measurement.publicEvidenceHandoff.aggregateEvidence.campaigns).toBe(
    supportFeedback.summary.aggregateEvidenceCampaigns,
  )
  expect(measurement.publicEvidenceHandoff.aggregateEvidence.starts).toBe(supportFeedback.summary.aggregateStarts)
  expect(measurement.publicEvidenceHandoff.aggregateEvidence.completions).toBe(
    supportFeedback.summary.aggregateCompletions,
  )
  expect(measurement.publicEvidenceHandoff.aggregateEvidence.replays).toBe(supportFeedback.summary.aggregateReplays)
  expect(measurement.analytics.localEvidence.aggregateEvidenceNotes).toBe(supportFeedback.summary.aggregateEvidenceNotes)
  expect(measurement.analytics.localEvidence.aggregateEvidenceStarts).toBe(supportFeedback.summary.aggregateStarts)
  expect(measurement.analytics.localEvidence.aggregateEvidenceCompletions).toBe(
    supportFeedback.summary.aggregateCompletions,
  )
  expect(measurement.analytics.localEvidence.aggregateEvidenceReplays).toBe(supportFeedback.summary.aggregateReplays)
  expect(measurement.productGateEvidence.supportingAggregateEvidenceNotes).toBe(
    samplePlan.summary.supportingAggregateEvidenceNotes,
  )
  expect(measurement.publicEvidenceHandoff.productGateMissions.supportingAggregateEvidenceNotes).toBe(
    samplePlan.summary.supportingAggregateEvidenceNotes,
  )
  expect(measurement.publicEvidenceHandoff.controls.aggregateEvidenceDoesNotPassGates).toBe(true)
  expect(measurement.publicEvidenceHandoff.controls.manualReviewRequiredForGateDecisions).toBe(true)
  expect(measurement.publicEvidenceHandoff.controls.noRawEventsStored).toBe(true)
  expect(measurement.publicEvidenceHandoff.controls.publicAggregateOnly).toBe(true)
  expect(measurement.publicEvidenceHandoff.controls.playerInitiatedOnly).toBe(true)
  expect(measurement.publicEvidenceHandoff.controls.zeroPaidSpend).toBe(true)
  expect(measurement.publicEvidenceHandoff.controls.noAutomaticPublicUpload).toBe(true)
  expect(measurement.publicEvidenceHandoff.controls.noRevenueEnablement).toBe(true)
  expect(measurement.analyticsUnlock?.id).toBe('production-analytics-browser')
  expect(measurement.analyticsUnlock?.recommendedPathId).toBe('first-party-collector')
  expect(measurement.analyticsUnlock?.commandCount).toBeGreaterThanOrEqual(5)
  expect(measurement.analyticsUnlock?.validationCommandCount).toBeGreaterThanOrEqual(4)
  expect(measurement.analyticsUnlock?.missingVariableCount).toBeGreaterThan(0)
  expect(measurement.analyticsUnlock?.missingSecretCount).toBeGreaterThan(0)
  expect(measurement.analyticsUnlock?.controls.zeroPaidSpend).toBe(true)
  expect(measurement.analyticsUnlock?.controls.noSecretValues).toBe(true)
  expect(measurement.analyticsUnlock?.controls.noSecretValuesStored).toBe(true)
  expect(measurement.analyticsUnlock?.controls.noAccountCreation).toBe(true)
  expect(measurement.analyticsUnlock?.controls.noStoreSubmission).toBe(true)
  expect(measurement.analyticsUnlock?.controls.noRevenueEnablement).toBe(true)
  expect(measurement.analyticsUnlock?.controls.githubVariablesOnly).toBe(true)
  expect(measurement.analyticsUnlock?.controls.secretCommandsUseStdin).toBe(true)
  expect(measurement.analyticsUnlock?.paths.map((item) => item.id)).toEqual(
    expect.arrayContaining(['first-party-collector', 'posthog-browser']),
  )
  const publicFirstPartyCollectorPath = measurement.analyticsUnlock?.paths.find(
    (item) => item.id === 'first-party-collector',
  )
  expect(publicFirstPartyCollectorPath?.requiredVariables.map((item) => item.repositoryName)).toEqual(
    expect.arrayContaining(['VITE_EVENT_COLLECTOR_URL', 'AGL_EVENT_COLLECTOR_EXPORT_URL']),
  )
  expect(publicFirstPartyCollectorPath?.requiredSecrets.map((item) => item.repositoryName)).toEqual(
    expect.arrayContaining(['CLOUDFLARE_API_TOKEN', 'VITE_EVENT_COLLECTOR_WRITE_TOKEN']),
  )
  expect(publicFirstPartyCollectorPath?.commandSequence).toContain('./ops/github/setup-production.sh')
  expect(publicFirstPartyCollectorPath?.validationCommands).toContain('npm run test:e2e')
  expect(
    measurement.analyticsUnlock?.paths.some((unlockPath) =>
      [...unlockPath.requiredVariables, ...unlockPath.requiredSecrets].some((item) => Object.hasOwn(item, 'value')),
    ),
  ).toBe(false)
  expect(measurement.controls.aggregateEvidenceDoesNotPassGates).toBe(true)
  expect(measurement.controls.manualReviewRequiredForGateDecisions).toBe(true)
  expect(measurement.publicEvidenceHandoff.nextActions.join(' ')).toContain('Do not pass product gates')
  expect(measurement.nextActions.join(' ')).toContain('public aggregate evidence')
  expect(measurement.nextActions.join(' ')).toContain('Unlock production analytics')
  expect(publicMeasurement.publicEvidenceHandoff).toEqual(measurement.publicEvidenceHandoff)
  expect(publicMeasurement.analyticsUnlock).toEqual(measurement.analyticsUnlock)
  expect(html).toContain('Public Aggregate Evidence')
  expect(html).toContain('Zero-Spend Analytics Unlock')
  expect(html).toContain('does not pass gates')
  expect(html).toContain('first-party-collector')
  expect(html).toContain('CLOUDFLARE_API_TOKEN')
  expect(script).toContain('publicEvidenceHandoff')
  expect(script).toContain('publicAnalyticsUnlock')
  expect(script).toContain('aggregateEvidenceDoesNotPassGates')
  expect(script).toContain('manualReviewRequiredForGateDecisions')

  for (const note of measurement.publicEvidenceHandoff.aggregateEvidence.topNotes) {
    expect(note.privacy.publicAggregateOnly).toBe(true)
    expect(note.privacy.rawEventsAccepted).toBe(false)
    expect(note.privacy.rawEventRowsStored).toBe(false)
    expect(note.privacy.attachmentsDownloaded).toBe(false)
  }

  for (const mission of measurement.publicEvidenceHandoff.productGateMissions.topMissions) {
    expect(mission.gateDecisionEligible).toBe(false)
    expect(mission.manualReviewRequired).toBe(true)
  }

  await page.goto('/measurement-status.html')
  await expect(page.getByRole('heading', { name: 'Production Measurement Status' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Public Aggregate Evidence' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Zero-Spend Analytics Unlock' })).toBeVisible()
  await expect(page.getByLabel('Public aggregate evidence')).toContainText(measurement.publicEvidenceHandoff.status)
  await expect(page.getByLabel('Zero-spend analytics unlock')).toContainText('first-party-collector')
  await expect(page.getByText('does not pass gates', { exact: true })).toBeVisible()

  await page.goto('/')
  await expect(page.getByLabel('Production Measurement')).toContainText(measurement.status)
  await expect(page.getByLabel('Production Measurement')).toContainText(measurement.publicEvidenceHandoff.status)
  await expect(page.getByLabel('Production Measurement')).toContainText('first-party-collector')
})

test('generated compliance manifest is reachable', async ({ page }) => {
  await page.goto('/compliance.json')

  await expect(page.locator('body')).toContainText('store-compliance-publication')
  await expect(page.locator('body')).toContainText('privacyPolicy')
  await expect(page.locator('body')).toContainText('/support.html')
})

test('monetization manifest and app ads placeholder are reachable', async ({ page }) => {
  await page.goto('/monetization.json')

  await expect(page.locator('body')).toContainText('blocked-by-product-gates')
  await expect(page.locator('body')).toContainText('rewarded-hint-after-failed-daily')

  await page.goto('/app-ads.txt')
  await expect(page.locator('body')).toContainText('Revenue features are disabled')
})

test('monetization runtime is guarded before revenue gates pass', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByLabel('Revenue runtime')).toContainText('guarded-disabled')
  await expect(page.getByLabel('Revenue runtime')).toContainText('rewarded-hint-after-failed-daily')
  await expect(page.getByRole('button', { name: 'Revenue gate held' })).toBeDisabled()

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem('agl.analytics.events')
        const events = raw ? JSON.parse(raw) : []
        return events.map((event: { name: string }) => event.name)
      }),
    )
    .toContain('store_gate_viewed')

  const eventNames = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    return raw ? JSON.parse(raw).map((event: { name: string }) => event.name) : []
  })
  const gateEvent = await page.evaluate(() => {
    const raw = window.localStorage.getItem('agl.analytics.events')
    const events = raw ? JSON.parse(raw) : []
    return events.findLast((event: { name: string }) => event.name === 'store_gate_viewed')
  })

  expect(eventNames).not.toContain('rewarded_ad_started')
  expect(eventNames).not.toContain('rewarded_ad_completed')
  expect(eventNames).not.toContain('revenue_cents')
  expect(gateEvent.properties.runtimeStatus).toBe('guarded-disabled')
  expect(gateEvent.properties.placementId).toBe('rewarded-hint-after-failed-daily')
  expect(gateEvent.properties.revenueEnabled).toBe(false)
})

test('generated store screenshot assets are reachable', async ({ page }) => {
  const storeAssets = JSON.parse(await readFile('data/store-assets.json', 'utf8')) as {
    screenshots: Array<{ id: string; path: string; width: number; height: number }>
  }
  const storePackage = JSON.parse(await readFile('data/store-package.json', 'utf8')) as {
    launchCandidate: { id: string }
    storeListing: { screenshotAssets: Array<{ id: string }> }
  }
  const preferredScreenshotId =
    storePackage.storeListing.screenshotAssets.find((asset) => asset.id.includes(storePackage.launchCandidate.id))?.id ??
    storePackage.storeListing.screenshotAssets[0]?.id
  const screenshot =
    storeAssets.screenshots.find((asset) => asset.id === preferredScreenshotId) ?? storeAssets.screenshots[0]

  expect(screenshot).toBeTruthy()
  if (!screenshot) {
    throw new Error('No generated store screenshot assets were available.')
  }
  expect(screenshot.path).toMatch(/^\/store-assets\/screenshots\/.+\.png$/)

  const response = await page.goto(screenshot.path)

  expect(response?.ok()).toBeTruthy()
  expect(response?.headers()['content-type']).toContain('image/png')

  const imageSize = await page.locator('img').evaluate((node) => {
    const image = node as HTMLImageElement

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    }
  })

  expect(imageSize.width).toBe(screenshot.width)
  expect(imageSize.height).toBe(screenshot.height)
})

test('store listing optimizer promotes the data-led store focus', async ({ page }) => {
  const optimizer = JSON.parse(await readFile('data/store-listing-optimizer.json', 'utf8')) as {
    generatedAt: string
    status: string
    sourceDataHash: string
    recommendation: { focusGameId: string; changedLaunchCandidate: boolean; title: string }
    listing: { shortDescription: string; keywords: string[] }
    screenshotPriorities: Array<{ id: string }>
    copyGuardrails: { googleShortDescriptionMaxChars: number; noMonetizationClaimsBeforeEnabled: boolean }
  }
  const storePackage = JSON.parse(await readFile('data/store-package.json', 'utf8')) as {
    sourceDataHash: string
    launchCandidate: { id: string }
    storeListing: { shortDescription: string; screenshotAssets: Array<{ id: string }> }
    storeListingOptimization: {
      generatedAt: string
      status: string
      sourceDataHash: string
      recommendedFocusGameId: string
    }
  }
  const storeCompliance = JSON.parse(await readFile('data/store-compliance.json', 'utf8')) as {
    sourceDataHash: string
  }

  expect(optimizer.status).toBe('store-listing-optimizer-ready')
  expect(optimizer.sourceDataHash).toMatch(/^[a-f0-9]{12}$/)
  expect(storePackage.sourceDataHash).toMatch(/^[a-f0-9]{12}$/)
  expect(storeCompliance.sourceDataHash).toMatch(/^[a-f0-9]{12}$/)
  expect(optimizer.recommendation.focusGameId).toMatch(/^[a-z0-9-]+$/)
  expect(storePackage.launchCandidate.id).toBe(optimizer.recommendation.focusGameId)
  expect(storePackage.storeListingOptimization.status).toBe(optimizer.status)
  expect(storePackage.storeListingOptimization.generatedAt).toBe(optimizer.generatedAt)
  expect(storePackage.storeListingOptimization.sourceDataHash).toBe(optimizer.sourceDataHash)
  expect(storePackage.storeListingOptimization.recommendedFocusGameId).toBe(optimizer.recommendation.focusGameId)
  expect(storePackage.storeListing.shortDescription.length).toBeLessThanOrEqual(
    optimizer.copyGuardrails.googleShortDescriptionMaxChars,
  )
  expect(storePackage.storeListing.screenshotAssets[0].id).toBe(optimizer.screenshotPriorities[0].id)
  expect(optimizer.copyGuardrails.noMonetizationClaimsBeforeEnabled).toBe(true)
  expect(optimizer.listing.keywords).toContain('daily puzzle')

  await page.goto('/')
  await expect(page.getByLabel('Store Listing Optimizer')).toContainText(optimizer.recommendation.title)
})

test('generated install icon assets are reachable', async ({ page }) => {
  const response = await page.goto('/icons/icon-512.png')

  expect(response?.ok()).toBeTruthy()
  expect(response?.headers()['content-type']).toContain('image/png')

  const imageSize = await page.locator('img').evaluate((node) => {
    const image = node as HTMLImageElement

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    }
  })

  expect(imageSize.width).toBe(512)
  expect(imageSize.height).toBe(512)
})
