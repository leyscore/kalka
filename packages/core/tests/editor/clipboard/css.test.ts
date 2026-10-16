import { expect, test } from 'bun:test'

import { buildKalkaClipboardHTML } from '@kalka/core/clipboard'
import { createEditor } from '@kalka/core/editor'

test('a pasted layer keeps the CSS its fields cannot hold', async () => {
  const editor = createEditor()
  const page = editor.graph.getPages()[0]
  const card = editor.graph.createNode('FRAME', page.id, {
    name: 'Card',
    width: 200,
    height: 100,
    style: { width: '50%', transition: 'opacity 200ms' }
  })
  await editor.pasteFromHTML(buildKalkaClipboardHTML([card], editor.graph), { x: 400, y: 0 })
  const pasted = [...editor.graph.getAllNodes()].filter((node) => node.name === 'Card')
  expect(pasted).toHaveLength(2)
  expect(pasted[1]?.style).toEqual({ width: '50%', transition: 'opacity 200ms' })
})
