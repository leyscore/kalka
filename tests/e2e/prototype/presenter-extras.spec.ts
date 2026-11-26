import type { Page } from '@playwright/test'

import { expect, test, useEditorSetupWithClear } from '#tests/e2e/fixtures'

const editor = useEditorSetupWithClear('/?test&no-rulers')

/** Two screens, Home with a Button and Details, each starting a flow. */
async function createFlows(page: Page) {
  return page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const graph = store.graph
    const pageId = store.state.currentPageId
    const solid = (r: number, g: number, b: number) => [
      { type: 'SOLID' as const, color: { r, g, b, a: 1 }, opacity: 1, visible: true }
    ]
    const home = graph.createNode('FRAME', pageId, {
      name: 'Home',
      width: 300,
      height: 400,
      fills: solid(1, 1, 1),
      prototypeStartingPoint: { name: 'Sign up', description: '', position: 'a' }
    })
    const button = graph.createNode('RECTANGLE', home.id, {
      name: 'Button',
      x: 40,
      y: 40,
      width: 120,
      height: 40,
      fills: solid(0.1, 0.4, 1)
    })
    const details = graph.createNode('FRAME', pageId, {
      name: 'Details',
      x: 500,
      width: 300,
      height: 400,
      fills: solid(0.95, 0.9, 0.8),
      prototypeStartingPoint: { name: 'Checkout', description: '', position: 'b' }
    })
    store.setReactions(button.id, [
      {
        trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] },
        actions: [
          {
            type: 'NODE',
            destinationId: details.id,
            navigation: 'NAVIGATE',
            transition: null,
            preserveScrollPosition: false,
            resetScrollPosition: false,
            overlayRelativePosition: null
          }
        ]
      }
    ])
    store.select([button.id])
    store.zoomToFit()
    return { homeId: home.id, buttonId: button.id, detailsId: details.id }
  })
}

function frame(page: Page, id: string) {
  return page.locator(`[data-present-frame="${id}"]`)
}

test('custom bezier starts from the easing before and its handle drags the curve', async () => {
  const { page } = editor
  const { buttonId } = await createFlows(page)
  await page.getByRole('tab', { name: 'Prototype' }).click()
  const panel = page.getByTestId('prototype-panel')
  await panel.locator('[data-property="prototype-animation"]').click()
  await page.getByRole('option', { name: 'Dissolve' }).click()
  await panel.locator('[data-property="prototype-easing"]').click()
  await page.getByRole('option', { name: 'Custom bezier' }).click()

  const easing = () =>
    page.evaluate((id) => {
      const action = window.kalka?.getStore?.().graph.getNode(id)?.reactions[0]?.actions[0]
      return action?.type === 'NODE' ? action.transition?.easing : null
    }, buttonId)
  // Dissolve starts eased out, so the custom curve starts as ease out's.
  await expect.poll(easing).toEqual({
    type: 'CUSTOM_CUBIC_BEZIER',
    bezier: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
    spring: null
  })

  const editorBox = page.getByTestId('prototype-easing-editor')
  const handle = editorBox.locator('[data-handle="1"]')
  const box = await handle.boundingBox()
  if (!box) throw new Error('no handle')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 40, box.y - 20, { steps: 6 })
  await page.mouse.up()
  await expect.poll(async () => (await easing())?.bezier?.x1 ?? 0).toBeGreaterThan(0.1)

  await panel.locator('[data-property="prototype-easing"]').click()
  await page.getByRole('option', { name: 'Custom spring' }).click()
  await expect
    .poll(async () => (await easing())?.spring)
    .toEqual({ mass: 1, stiffness: 100, damping: 15 })
  await expect(editorBox.locator('[data-property="prototype-spring-stiffness"]')).toBeVisible()
})

test('presenting, a click on nothing shows the hotspots and the pill switches flows', async () => {
  const { page } = editor
  const { homeId, detailsId } = await createFlows(page)
  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), homeId)
  await expect(frame(page, homeId)).toBeVisible()

  await frame(page, homeId)
    .locator('[data-layer=""]')
    .click({ position: { x: 250, y: 350 } })
  await expect(page.getByTestId('prototype-hotspot')).toHaveCount(1)
  await expect(page.getByTestId('prototype-hotspot')).toHaveCount(0)

  await page.locator('[data-property="preview-flow"]').click()
  await page.getByRole('option', { name: 'Checkout' }).click()
  await expect(frame(page, detailsId)).toBeVisible()
  await expect(frame(page, homeId)).toHaveCount(0)
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})

test('a variant an interactive component changes to starts its own After delay', async () => {
  const { page } = editor
  const homeId = await page.evaluate(() => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    const graph = store.graph
    const pageId = store.state.currentPageId
    const home = graph.createNode('FRAME', pageId, { name: 'Home', width: 300, height: 300 })
    const set = graph.createNode('COMPONENT_SET', pageId, {
      name: 'Loader',
      x: 400,
      componentPropertyDefinitions: [
        {
          id: 'state',
          name: 'State',
          type: 'VARIANT',
          defaultValue: 'Idle',
          variantOptions: ['Idle', 'Loading', 'Done']
        }
      ]
    })
    const variant = (state: string, x: number) => {
      const component = graph.createNode('COMPONENT', set.id, {
        name: `State=${state}`,
        x,
        width: 100,
        height: 40,
        componentPropertyValues: { State: state }
      })
      graph.createNode('RECTANGLE', component.id, { name: `${state} mark`, width: 20, height: 20 })
      return component
    }
    const idle = variant('Idle', 0)
    const loading = variant('Loading', 120)
    const done = variant('Done', 240)
    const changeTo = (destinationId: string) => ({
      type: 'NODE' as const,
      destinationId,
      navigation: 'CHANGE_TO' as const,
      transition: null,
      preserveScrollPosition: false,
      resetScrollPosition: false,
      overlayRelativePosition: null
    })
    graph.updateNode(idle.id, {
      reactions: [
        { trigger: { type: 'ON_CLICK', delay: 0, keyCodes: [] }, actions: [changeTo(loading.id)] }
      ]
    })
    graph.updateNode(loading.id, {
      reactions: [
        {
          trigger: { type: 'AFTER_TIMEOUT', delay: 0.3, keyCodes: [] },
          actions: [changeTo(done.id)]
        }
      ]
    })
    store.createInstanceFromComponent(idle.id, 20, 20, home.id)
    store.stopPlay()
    store.startPlay({ startId: home.id })
    return home.id
  })
  await expect(frame(page, homeId)).toBeVisible()
  const mark = (name: string) =>
    page.evaluate(
      ({ id, name }) => {
        const host = document.querySelector(`[data-present-frame="${id}"]`)
        return !!host?.shadowRoot?.querySelector(`[data-layer$="${name} mark"]`)
      },
      { id: homeId, name }
    )
  await expect.poll(() => mark('Idle')).toBe(true)
  await frame(page, homeId).locator('[data-layer="State=Idle"]').click()
  await expect.poll(() => mark('Loading')).toBe(true)
  // Done arrives on its own, after the Loading variant's own delay.
  await expect.poll(() => mark('Done'), { timeout: 3000 }).toBe(true)
})

test('a video paint plays its clip in the presented prototype, over its poster', async () => {
  const { page } = editor
  const { homeId, buttonId } = await createFlows(page)
  await page.evaluate((buttonId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    // Any bytes stand for the clip and its poster; the presenter only has to play what it holds.
    store.graph.images.set('clip', new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]))
    store.graph.images.set('poster', new Uint8Array([137, 80, 78, 71]))
    const video = {
      type: 'VIDEO' as const,
      color: { r: 1, g: 1, b: 1, a: 1 },
      opacity: 1,
      visible: true,
      imageHash: 'poster',
      videoHash: 'clip',
      imageScaleMode: 'FIT' as const
    }
    store.graph.updateNode(buttonId, { fills: [video] })
    const other = store.graph.createNode(
      'RECTANGLE',
      store.graph.getNode(buttonId)?.parentId ?? '',
      {
        name: 'Missing clip',
        y: 200,
        width: 80,
        height: 40,
        fills: [{ ...video, videoHash: 'not-here' }]
      }
    )
    return other.id
  }, buttonId)
  // The test before leaves its prototype presented.
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), homeId)
  const home = frame(page, homeId)
  const clip = home.locator('[data-layer="Button"] > video[data-present-video]')
  await expect(clip).toHaveCount(1)
  expect(
    await clip.evaluate((video: HTMLVideoElement) => ({
      src: video.src.startsWith('blob:'),
      muted: video.muted,
      loop: video.loop,
      fit: video.style.objectFit,
      poster: video.poster.startsWith('data:image/')
    }))
  ).toEqual({ src: true, muted: true, loop: true, fit: 'contain', poster: true })
  await expect(home.locator('[data-layer="Missing clip"] video')).toHaveCount(0)
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})

test('a Video action unmutes the presented video when the button is clicked', async () => {
  const { page } = editor
  const { homeId, buttonId } = await createFlows(page)
  const videoId = await page.evaluate((buttonId) => {
    const store = window.kalka?.getStore?.()
    if (!store) throw new Error('Kalka store not initialized')
    store.graph.images.set('clip', new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]))
    const home = store.graph.getNode(buttonId)?.parentId ?? ''
    const video = store.graph.createNode('RECTANGLE', home, {
      name: 'Clip',
      y: 200,
      width: 160,
      height: 90,
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
    store.setReactions(buttonId, [])
    store.select([buttonId])
    return video.id
  }, buttonId)

  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
  await page.getByRole('tab', { name: 'Prototype' }).click()
  const panel = page.getByTestId('prototype-panel')
  await panel.getByRole('button', { name: 'Add interaction' }).click()
  await panel.locator('[data-property="prototype-action"]').click()
  await page.getByRole('option', { name: 'Video', exact: true }).click()
  await panel.locator('[data-property="prototype-media-action"]').click()
  await page.getByRole('option', { name: 'Unmute', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(
        (id) => window.kalka?.getStore?.().graph.getNode(id)?.reactions[0]?.actions[0],
        buttonId
      )
    )
    .toEqual({
      type: 'UPDATE_MEDIA_RUNTIME',
      destinationId: videoId,
      mediaAction: 'UNMUTE',
      amountToSkip: 5,
      newTimestamp: 0
    })

  await page.evaluate((id) => window.kalka?.getStore?.().startPlay({ startId: id }), homeId)
  const home = frame(page, homeId)
  const clip = home.locator('[data-layer="Clip"] > video[data-present-video]')
  await expect(clip).toHaveCount(1)
  expect(await clip.evaluate((video: HTMLVideoElement) => video.muted)).toBe(true)
  await home.locator('[data-layer="Button"]').click()
  await expect.poll(() => clip.evaluate((video: HTMLVideoElement) => video.muted)).toBe(false)
  await page.evaluate(() => window.kalka?.getStore?.().stopPlay())
})
