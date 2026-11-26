import { afterEach, describe, expect, test } from 'bun:test'

import { SkiaRenderer } from '@kalka/core/canvas'
import { createEditor } from '@kalka/core/editor'
import { initCanvasKit } from '@kalka/core/io'

const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
})

async function twoOverlappingSquares() {
  const ck = await initCanvasKit()
  const surface = ck.MakeSurface(200, 200)
  if (!surface) throw new Error('Could not create CanvasKit surface')
  const renderer = new SkiaRenderer(ck, surface)
  const editor = createEditor()
  editor.setCanvasKit(ck, renderer)
  cleanups.push(() => {
    editor.dispose()
    renderer.destroy()
  })
  const pageId = editor.state.currentPageId
  const left = editor.graph.createNode('RECTANGLE', pageId, { x: 0, y: 0, width: 100, height: 100 })
  const right = editor.graph.createNode('RECTANGLE', pageId, {
    x: 50,
    y: 0,
    width: 100,
    height: 100
  })
  editor.select([left.id, right.id])
  const session = editor.beginShapeBuilder()
  if (!session) throw new Error('No shape builder')
  cleanups.push(() => session.dispose())
  return { editor, session, left, right }
}

function pageLayers(editor: ReturnType<typeof createEditor>) {
  return editor.graph
    .getChildren(editor.state.currentPageId)
    .map((node) => ({ type: node.type, x: node.x, width: node.width }))
}

describe('the Shape builder', () => {
  test('cuts two overlapping squares into three regions', async () => {
    const { session } = await twoOverlappingSquares()
    expect(session.outlines()).toHaveLength(3)
    const shared = session.faceAt(75, 50)
    expect(shared).not.toBeNull()
    expect(session.faceAt(25, 50)).not.toBe(shared)
    expect(session.faceAt(300, 300)).toBeNull()
  })

  test('merging the overlap and one side makes one shape and trims the other', async () => {
    const { editor, session } = await twoOverlappingSquares()
    const overlap = session.faceAt(75, 50)
    const leftOnly = session.faceAt(25, 50)
    expect(session.apply([leftOnly ?? -1, overlap ?? -1], 'merge')).toBe(true)

    const layers = pageLayers(editor)
    expect(layers).toHaveLength(2)
    // The right square loses the overlap; the merged shape is the whole left square.
    expect(layers.map((layer) => [layer.x, layer.width]).sort()).toEqual([
      [0, 100],
      [100, 50]
    ])
    expect(layers.every((layer) => layer.type === 'VECTOR')).toBe(true)
    expect(session.outlines()).toHaveLength(2)

    editor.undo.undo()
    expect(pageLayers(editor).map((layer) => layer.type)).toEqual(['RECTANGLE', 'RECTANGLE'])
  })

  test('removing the overlap leaves the two sides', async () => {
    const { editor, session } = await twoOverlappingSquares()
    expect(session.apply([session.faceAt(75, 50) ?? -1], 'remove')).toBe(true)
    const widths = pageLayers(editor).map((layer) => layer.width)
    expect(widths.sort()).toEqual([50, 50])
  })
})
