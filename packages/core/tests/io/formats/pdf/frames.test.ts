import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { documentFrames } from '@kalka/core/io'

describe('Export frames to PDF', () => {
  test('prints the visible top-level frames of every page, in the layers panel’s order', () => {
    const editor = createEditor()
    const { graph } = editor
    const first = editor.state.currentPageId
    const bottom = graph.createNode('FRAME', first, { name: 'Bottom' })
    graph.createNode('RECTANGLE', first, { name: 'Loose shape' })
    const top = graph.createNode('COMPONENT', first, { name: 'Top' })
    graph.createNode('FRAME', first, { name: 'Hidden', visible: false })
    graph.createNode('FRAME', top.id, { name: 'Nested' })
    const second = editor.addPage('Second')
    const other = graph.createNode('FRAME', second, { name: 'Other' })

    expect(documentFrames(graph)).toEqual([
      { pageId: first, nodeId: top.id },
      { pageId: first, nodeId: bottom.id },
      { pageId: second, nodeId: other.id }
    ])
  })
})
