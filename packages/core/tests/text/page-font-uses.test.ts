import { expect, test } from 'bun:test'

import { documentFontStatus, FontManager, PageFontUses } from '@kalka/core/text'
import { SceneGraph } from '@kalka/scene-graph'

test('a page’s font uses follow edits layer by layer and give the full status', () => {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const other = graph.addPage('Other')
  const manager = new FontManager()
  manager.markLoaded('Inter', 'Regular', new ArrayBuffer(8), 'bundled')
  const frame = graph.createNode('FRAME', pageId, { width: 200, height: 200 })
  const title = graph.createNode('TEXT', frame.id, { name: 'Title', fontFamily: 'Inter' })
  const label = graph.createNode('TEXT', pageId, { name: 'Label', fontFamily: 'Missing Sans' })
  const uses = new PageFontUses(graph, pageId)
  const full = () => documentFontStatus(graph, pageId, manager)
  const sorted = (status: ReturnType<typeof full>) =>
    status.faces.map((face) => ({
      ...face,
      nodeIds: face.nodeIds.toSorted(),
      nodeNames: face.nodeNames.toSorted()
    }))

  expect(uses.status(manager)).toEqual(full())

  graph.updateNode(title.id, { text: 'Typed' })
  expect(uses.update(title.id)).toBe(false)

  graph.updateNode(title.id, { fontWeight: 700 })
  expect(uses.update(title.id)).toBe(true)
  expect(sorted(uses.status(manager))).toEqual(sorted(full()))

  const added = graph.createNode('TEXT', frame.id, { name: 'Added', fontFamily: 'Missing Sans' })
  uses.update(added.id)
  expect(sorted(uses.status(manager))).toEqual(sorted(full()))

  graph.reparentNode(label.id, other.id)
  expect(uses.update(label.id)).toBe(true)
  graph.deleteNode(added.id)
  expect(uses.update(added.id)).toBe(true)
  expect(sorted(uses.status(manager))).toEqual(sorted(full()))
})
