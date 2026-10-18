import { afterEach, beforeEach, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

import {
  createPendingTextLayout,
  type PendingLayoutRenderer
} from '#core/editor/text/pending-layout'
import { createLayoutRunner } from '#core/layout/mutations'
import { keepStoredLayout } from '#core-tests/helpers/layout'

// What the pending text measures and lays out again, not what a browser would make of it.
let restoreLayout: (() => void) | undefined
beforeEach(() => {
  restoreLayout = keepStoredLayout()
})
afterEach(() => restoreLayout?.())

/** A Hug row around auto-width text whose face loads after it was first measured. */
function setup() {
  const editor = createEditor()
  const graph = editor.graph
  const frame = graph.createNode('FRAME', editor.state.currentPageId, {
    layoutMode: 'HORIZONTAL',
    primaryAxisSizing: 'HUG',
    counterAxisSizing: 'HUG',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12
  })
  const text = graph.createNode('TEXT', frame.id, {
    text: 'Weighted label',
    fontWeight: 900,
    textAutoResize: 'WIDTH_AND_HEIGHT'
  })
  let loaded = false
  const renderer: PendingLayoutRenderer = {
    fontsLoaded: true,
    measureTextNode: () => (loaded ? { width: 234, height: 29 } : null)
  }
  const { runLayoutForNode } = createLayoutRunner(() => graph)
  let renders = 0
  /** Whether each layout the pending text ran was the document's own. */
  const relayouts: boolean[] = []
  const pending = createPendingTextLayout({
    getGraph: () => graph,
    runLayoutForNode: (id) => {
      relayouts.push(graph.isApplyingDerivedLayout)
      runLayoutForNode(id)
    },
    requestRender: () => renders++,
    isReady: () => loaded
  })
  const load = () => {
    loaded = true
    pending.relayoutReady(renderer)
  }
  return {
    editor,
    graph,
    frame,
    text,
    renderer,
    pending,
    load,
    relayouts,
    renders: () => renders
  }
}

test('text measured before its face loads is laid out again once it loads', () => {
  const { editor, text, pending, renderer, load, relayouts, renders } = setup()
  pending.measure(renderer, text)

  load()
  expect(renders()).toBe(1)
  expect(relayouts).toEqual([false])
  expect(editor.undo.canUndo).toBe(false)
})

test('a face that loads keeps the layout of the document’s own state derived', () => {
  const { graph, text, pending, renderer, load, relayouts } = setup()
  graph.applyDerivedLayoutDuring(() => pending.measure(renderer, text))
  load()
  expect(relayouts).toEqual([true])
})

test('layers whose faces are still loading or that were removed are left alone', () => {
  const { graph, text, pending, renderer, renders } = setup()
  pending.measure(renderer, text)
  pending.relayoutReady(renderer)
  expect(renders()).toBe(0)
  graph.deleteNode(text.id)
  pending.relayoutReady(renderer)
  expect(renders()).toBe(0)
})
