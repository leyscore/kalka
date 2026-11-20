import { describe, expect, test } from 'bun:test'

import { computed, createApp, shallowReactive } from 'vue'

import { createDefaultEditorState, createEditor } from '@kalka/core/editor'
import { SceneGraph } from '@kalka/scene-graph'

import { EDITOR_KEY } from '#vue/editor/context'
import { usePageList } from '#vue/primitives/PageList/usePageList'

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const state = shallowReactive(createDefaultEditorState(page.id))
  const editor = createEditor({ graph, state })
  const text = graph.createNode('TEXT', page.id, { name: 'Title', text: 'Hello' })
  const app = createApp({ render: () => null })
  app.provide(EDITOR_KEY, editor)
  const { pages } = app.runWithContext(() => usePageList())
  let reads = 0
  // What a menu builds from the pages: it should rebuild only when they change.
  const menu = computed(() => {
    reads++
    return pages.value.map((item) => item.name)
  })
  return { editor, page, text, pages, menu, reads: () => reads }
}

describe('the page list', () => {
  test('stays the same while layers change, so what is built from it is not rebuilt', () => {
    const { editor, text, pages, menu, reads } = setup()
    const before = pages.value
    expect(menu.value).toEqual(['Page 1'])
    for (const letter of 'typing') editor.updateNode(text.id, { text: `Hello ${letter}` })
    expect(pages.value).toBe(before)
    expect(menu.value).toEqual(['Page 1'])
    expect(reads()).toBe(1)
  })

  test('changes when a page is added, renamed or emptied', () => {
    const { editor, page, text, pages } = setup()
    const before = pages.value
    editor.renamePage(page.id, 'Home')
    expect(pages.value).not.toBe(before)
    expect(pages.value.map((item) => item.name)).toEqual(['Home'])
    editor.addPage('About')
    expect(pages.value.map((item) => item.name)).toEqual(['Home', 'About'])
    const withLayers = pages.value
    editor.graph.deleteNode(text.id)
    editor.updateNode(page.id, {})
    expect(pages.value).not.toBe(withLayers)
  })
})
