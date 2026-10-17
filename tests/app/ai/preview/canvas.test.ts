import { afterEach, describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { createCanvasJSXPreview, previewFocus } from '@/app/ai/preview/canvas'
import { createEditorStore } from '@/app/editor/session'
import { scenePreviews } from '@/app/presence/canvas-scene'
import { MAX_OUTLINE } from '@/app/presence/schema'

import { expectDefined } from '#tests/helpers/assert'

function page(graph: SceneGraph) {
  return expectDefined(graph.getPages()[0], 'page').id
}

describe('streamed JSX focus', () => {
  test('points at the element that appeared last and outlines what the JSX builds', () => {
    const graph = new SceneGraph()
    const card = graph.createNode('FRAME', page(graph), { x: 100, y: 50, width: 300, height: 200 })
    graph.createNode('TEXT', card.id, { x: 16, y: 16, width: 100, height: 20 })
    const footer = graph.createNode('FRAME', card.id, { x: 16, y: 120, width: 268, height: 60 })
    const button = graph.createNode('RECTANGLE', footer.id, { x: 8, y: 8, width: 80, height: 32 })

    const focus = expectDefined(previewFocus({ graph, renderedIds: [card.id] }), 'focus')
    // The source's last element: the button, the last child of the card's last child. The
    // cursor sits at its trailing corner, where content grows.
    expect(focus.cursor).toEqual({ x: 204, y: 210 })
    expect(focus.outline).toEqual([
      { x: 100, y: 50, width: 300, height: 200 },
      { x: 124, y: 178, width: 80, height: 32 }
    ])
    expect(button.id).toBeString()
  })

  test('a lone element is both the cursor and the outline, and outlines stay bounded', () => {
    const graph = new SceneGraph()
    const roots = Array.from({ length: MAX_OUTLINE + 4 }, (_, index) =>
      graph.createNode('RECTANGLE', page(graph), { x: index * 10, y: 0, width: 8, height: 8 })
    )
    const focus = expectDefined(
      previewFocus({ graph, renderedIds: roots.map((root) => root.id) }),
      'focus'
    )
    expect(focus.cursor).toEqual({ x: (MAX_OUTLINE + 3) * 10 + 8, y: 8 })
    expect(focus.outline).toHaveLength(MAX_OUTLINE)
  })

  test('nothing rendered yet has no focus', () => {
    expect(previewFocus({ graph: new SceneGraph(), renderedIds: [] })).toBeNull()
  })
})

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.preparationController.dispose()
})

describe('streamed JSX on the DOM scene', () => {
  test('draws over the page without touching the document, and goes when the call ends', async () => {
    const store = createEditorStore(new SceneGraph())
    stores.push(store)
    const pageId = store.state.currentPageId
    const focused: unknown[] = []
    const preview = createCanvasJSXPreview(store, () => pageId, {
      activeTabOnly: false,
      domScene: true,
      onFocus: (focus) => focused.push(focus)
    })

    preview.start('call-1')
    preview.delta('call-1', '{"x":40,"y":40,"jsx":"<Frame w={200} h={100}><Rect w={50} h={50}/>')
    await expectPoll(() => scenePreviews(store).length === 1)
    const [shown] = scenePreviews(store)
    expect(shown?.pageId).toBe(pageId)
    expect(shown?.nodeIds).toHaveLength(1)
    expect(shown?.graph).not.toBe(store.graph)
    expect(focused).toHaveLength(1)

    // An update redraws under the same key, so the scene updates it in place.
    preview.delta('call-1', '<Rect w={60} h={60}/>')
    await expectPoll(() => scenePreviews(store)[0] !== shown)
    expect(scenePreviews(store)[0]?.key).toBe(shown?.key)

    expect(store.graph.getNode(pageId)?.childIds).toEqual([])
    expect(store.undo.canUndo).toBe(false)
    preview.finish('call-1')
    expect(scenePreviews(store)).toEqual([])
  })
})

async function expectPoll(condition: () => boolean, timeout = 2000): Promise<void> {
  const start = performance.now()
  while (!condition()) {
    if (performance.now() - start > timeout) throw new Error('Timed out waiting for the preview')
    await Bun.sleep(20)
  }
}
