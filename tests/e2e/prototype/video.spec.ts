import type { Page } from '@playwright/test'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

/** A WebM of about a second the page records from a canvas, as a file a person would pick. */
async function recordClip(page: Page): Promise<number[]> {
  return page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 36
    const context = canvas.getContext('2d')
    const recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: 'video/webm' })
    const chunks: Blob[] = []
    recorder.addEventListener('dataavailable', (event) => chunks.push(event.data))
    const stopped = new Promise((resolve) => {
      recorder.addEventListener('stop', resolve)
    })
    recorder.start()
    for (let frame = 0; frame < 60; frame++) {
      if (context) {
        // A colour per quarter second, so frames at different times differ.
        context.fillStyle = ['#c85020', '#2050c8', '#20c850', '#c8c820'][Math.floor(frame / 15)]
        context.fillRect(0, 0, 64, 36)
      }
      await new Promise((resolve) => {
        requestAnimationFrame(resolve)
      })
    }
    recorder.stop()
    await stopped
    return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()))
  })
}

function nodeOf(page: Page, id: string) {
  return page.evaluate((nodeId) => {
    const node = window.kalka?.getStore?.().graph.getNode(nodeId)
    return node
      ? {
          fill: node.fills[0],
          videoPlayback: node.videoPlayback
        }
      : null
  }, id)
}

test('the fill picker puts a video on a layer and sets how it plays', async () => {
  const { page } = editor
  const id = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const node = store.graph.createNode('RECTANGLE', store.state.currentPageId, {
      name: 'Clip',
      width: 160,
      height: 90,
      fills: [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5, a: 1 }, opacity: 1, visible: true }]
    })
    store.select([node.id])
    return node.id
  })
  const clip = await recordClip(page)

  await page.getByTestId('fill-picker-swatch').first().click()
  await page.getByTestId('fill-picker-tab-video').click()
  const chooser = page.waitForEvent('filechooser')
  await page.getByTestId('fill-picker-choose-video').click()
  await (
    await chooser
  ).setFiles({ name: 'clip.webm', mimeType: 'video/webm', buffer: Buffer.from(clip) })

  await expect.poll(async () => !!(await nodeOf(page, id))?.fill?.videoHash).toBe(true)
  const { fill } = (await nodeOf(page, id)) ?? {}
  expect(fill?.type).toBe('VIDEO')
  expect(fill?.imageHash).toBeTruthy()
  await expect(page.getByTestId('fill-picker-video-preview')).toBeVisible()

  await page.locator('[data-property="video-autoplay"]').click()
  await page.locator('[data-property="video-showControls"]').click()
  await expect
    .poll(async () => (await nodeOf(page, id))?.videoPlayback)
    .toEqual({
      autoplay: false,
      loop: true,
      muted: true,
      showControls: true,
      startTime: 0,
      endTime: null
    })

  // Trim: the start thumb moved right with the keyboard trims the clip's start.
  const trim = page.locator('[data-property="video-trim"]')
  await expect(trim).toBeVisible()
  const [startThumb] = await trim.getByRole('slider').all()
  await startThumb.focus()
  await page.keyboard.press('ArrowRight')
  await expect
    .poll(async () => (await nodeOf(page, id))?.videoPlayback?.startTime)
    .toBeCloseTo(0.1, 5)
  expect((await nodeOf(page, id))?.videoPlayback?.endTime).toBeNull()
  await expect(page.getByTestId('video-trim-value')).toContainText(/0[.,]1 s/)

  // Poster frame: scrubbing and keeping the frame shown makes it the poster.
  const posterBefore = (await nodeOf(page, id))?.fill?.imageHash
  const scrubber = page.locator('[data-property="video-poster-time"]').getByRole('slider')
  await scrubber.focus()
  await page.keyboard.press('End')
  await page.getByTestId('fill-picker-video-keep-frame').click()
  await expect.poll(async () => (await nodeOf(page, id))?.fill?.imageHash).not.toBe(posterBefore)
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('fill-picker-choose-video')).toHaveCount(0)
})

test('a presented video plays as its layer says and Video ends goes on', async () => {
  const { page } = editor
  const { homeId, nextId } = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const pageId = store.state.currentPageId
    store.graph.images.set('clip', new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]))
    const home = store.graph.createNode('FRAME', pageId, { name: 'Home', width: 300, height: 300 })
    const next = store.graph.createNode('FRAME', pageId, {
      name: 'Next',
      x: 400,
      width: 300,
      height: 300
    })
    const clip = store.graph.createNode('RECTANGLE', home.id, {
      name: 'Clip',
      width: 160,
      height: 90,
      videoPlayback: {
        autoplay: false,
        loop: false,
        muted: false,
        showControls: true,
        startTime: 0,
        endTime: null
      },
      fills: [
        {
          type: 'VIDEO',
          color: { r: 1, g: 1, b: 1, a: 1 },
          opacity: 1,
          visible: true,
          videoHash: 'clip'
        }
      ]
    })
    store.setReactions(clip.id, [
      {
        trigger: { type: 'ON_MEDIA_END', delay: 0, keyCodes: [] },
        actions: [
          {
            type: 'NODE',
            destinationId: next.id,
            navigation: 'NAVIGATE',
            transition: null,
            preserveScrollPosition: false,
            resetScrollPosition: false,
            overlayRelativePosition: null
          }
        ]
      }
    ])
    return { homeId: home.id, nextId: next.id }
  })

  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), homeId)
  const video = page
    .locator(`[data-present-frame="${homeId}"]`)
    .locator('[data-layer="Clip"] > video[data-present-video]')
  await expect(video).toHaveCount(1)
  expect(
    await video.evaluate((element: HTMLVideoElement) => ({
      autoplay: element.autoplay,
      loop: element.loop,
      muted: element.muted,
      controls: element.controls
    }))
  ).toEqual({ autoplay: false, loop: false, muted: false, controls: true })

  // The presenter may start over once while it opens; the video ends again until it goes on.
  const next = page.locator(`[data-present-frame="${nextId}"]`)
  await expect
    .poll(async () => {
      if ((await video.count()) > 0)
        await video.evaluate((element: HTMLVideoElement) =>
          element.dispatchEvent(new Event('ended'))
        )
      return next.count()
    })
    .toBe(1)
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})

test('a video pasted from the clipboard becomes a layer with a video paint', async () => {
  const { page } = editor
  const clip = await recordClip(page)
  await editor.canvas.canvas.click()
  await page.evaluate((bytes) => {
    const data = new DataTransfer()
    data.items.add(new File([new Uint8Array(bytes)], 'pasted.webm', { type: 'video/webm' }))
    window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data }))
  }, clip)
  await expect
    .poll(() =>
      page.evaluate(() => {
        const store = window.kalka?.getStore?.()
        const pageNode = store?.graph.getNode(store.state.currentPageId)
        const node = pageNode?.childIds.map((id) => store?.graph.getNode(id)).find(Boolean)
        const fill = node?.fills[0]
        return node
          ? { name: node.name, width: node.width, type: fill?.type, clip: !!fill?.videoHash }
          : null
      })
    )
    .toEqual({ name: 'pasted', width: 64, type: 'VIDEO', clip: true })
})

test('a presented trimmed video starts at its trimmed start', async () => {
  const { page } = editor
  const clip = await recordClip(page)
  const homeId = await page.evaluate((bytes) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.graph.images.set('trimmed', new Uint8Array(bytes))
    const home = store.graph.createNode('FRAME', store.state.currentPageId, {
      name: 'Home',
      width: 300,
      height: 300
    })
    store.graph.createNode('RECTANGLE', home.id, {
      name: 'Clip',
      width: 160,
      height: 90,
      videoPlayback: {
        autoplay: false,
        loop: true,
        muted: true,
        showControls: false,
        startTime: 0.5,
        endTime: 0.8
      },
      fills: [
        {
          type: 'VIDEO',
          color: { r: 1, g: 1, b: 1, a: 1 },
          opacity: 1,
          visible: true,
          videoHash: 'trimmed'
        }
      ]
    })
    return home.id
  }, clip)
  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), homeId)
  const video = page
    .locator(`[data-present-frame="${homeId}"]`)
    .locator('[data-layer="Clip"] > video[data-present-video]')
  await expect(video).toHaveCount(1)
  // A trimmed clip loops itself from its start, so the element does not loop on its own.
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => ({
        loop: element.loop,
        at: Math.round(element.currentTime * 10) / 10
      }))
    )
    .toEqual({ loop: false, at: 0.5 })
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})
