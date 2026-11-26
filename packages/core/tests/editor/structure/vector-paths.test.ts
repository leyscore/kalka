import { afterEach, describe, expect, test } from 'bun:test'

import { SkiaRenderer } from '@kalka/core/canvas'
import { createEditor } from '@kalka/core/editor'
import { initCanvasKit } from '@kalka/core/io'
import type { VectorNetwork } from '@kalka/scene-graph'

const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
})

async function createEditorWithRenderer() {
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
  return editor
}

const zero = { x: 0, y: 0 }

/** A circle of radius 50 drawn as 64 straight segments. */
function densePolygon(): VectorNetwork {
  const count = 64
  const vertices = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2
    return { x: 50 + 50 * Math.cos(a), y: 50 + 50 * Math.sin(a) }
  })
  const segments = vertices.map((_, i) => ({
    start: i,
    end: (i + 1) % count,
    tangentStart: zero,
    tangentEnd: zero
  }))
  return {
    vertices,
    segments,
    regions: [{ windingRule: 'NONZERO', loops: [segments.map((_, i) => i)] }]
  }
}

describe('vector path commands', () => {
  test('Simplify vector refits the path in one undo step', () => {
    const editor = createEditor()
    const node = editor.graph.createNode('VECTOR', editor.state.currentPageId, {
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      vectorNetwork: densePolygon()
    })
    editor.select([node.id])
    expect(editor.simplifyVectorSelected()).toBe(true)
    const simplified = editor.graph.getNode(node.id)
    expect(simplified?.vectorNetwork?.vertices.length).toBeLessThan(12)
    expect(simplified?.x).toBeCloseTo(10, 0)
    expect(simplified?.width).toBeCloseTo(100, 0)
    editor.undo.undo()
    expect(editor.graph.getNode(node.id)?.vectorNetwork?.vertices).toHaveLength(64)
    editor.dispose()
  })

  test('Reverse path direction runs the path the other way and keeps it in place', () => {
    const editor = createEditor()
    const node = editor.graph.createNode('VECTOR', editor.state.currentPageId, {
      x: 0,
      y: 0,
      width: 20,
      height: 10,
      vectorNetwork: {
        vertices: [
          { x: 0, y: 0 },
          { x: 20, y: 10 }
        ],
        segments: [{ start: 0, end: 1, tangentStart: zero, tangentEnd: zero }],
        regions: []
      }
    })
    editor.select([node.id])
    expect(editor.reversePathSelected()).toBe(true)
    const reversed = editor.graph.getNode(node.id)
    expect(reversed?.vectorNetwork?.segments[0]).toMatchObject({ start: 1, end: 0 })
    expect(reversed).toMatchObject({ x: 0, y: 0, width: 20, height: 10 })
    editor.dispose()
  })

  test('Offset path draws a larger path above the shape and selects it', async () => {
    const editor = await createEditorWithRenderer()
    const pageId = editor.state.currentPageId
    const rect = editor.graph.createNode('RECTANGLE', pageId, {
      x: 20,
      y: 30,
      width: 40,
      height: 20
    })
    editor.select([rect.id])
    expect(editor.offsetPathSelected({ offset: 5, join: 'MITER' })).toBe(true)
    const [createdId] = editor.state.selectedIds
    const created = editor.graph.getNode(createdId)
    expect(created?.type).toBe('VECTOR')
    expect(created?.x).toBeCloseTo(15)
    expect(created?.y).toBeCloseTo(25)
    expect(created?.width).toBeCloseTo(50)
    expect(created?.height).toBeCloseTo(30)
    const page = editor.graph.getNode(pageId)
    expect(page?.childIds.indexOf(createdId)).toBe((page?.childIds.indexOf(rect.id) ?? 0) + 1)

    editor.select([rect.id])
    expect(editor.offsetPathSelected({ offset: -5, join: 'MITER' })).toBe(true)
    const inner = editor.graph.getNode([...editor.state.selectedIds][0])
    expect(inner?.width).toBeCloseTo(30)
    expect(inner?.height).toBeCloseTo(10)

    editor.undo.undo()
    editor.undo.undo()
    expect(editor.graph.getNode(createdId)).toBeUndefined()
    expect([...editor.state.selectedIds]).toEqual([rect.id])
  })
})
