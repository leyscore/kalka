import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { pathTextElement } from '#core/io/formats/html/path-text'
import { geometryBlobToSVGPath } from '#core/io/formats/svg/paths'

/** A path blob: close, move, line, line, close — Figma's glyph outlines start with a close. */
function glyphBlob(): Uint8Array {
  const bytes = new Uint8Array(1 + 9 * 3 + 1)
  const view = new DataView(bytes.buffer)
  let offset = 0
  bytes[offset++] = 0
  for (const [command, x, y] of [
    [1, 0, 0],
    [2, 0.5, 0.7],
    [2, 0.6, 0]
  ]) {
    bytes[offset++] = command
    view.setFloat32(offset, x, true)
    view.setFloat32(offset + 4, y, true)
    offset += 8
  }
  bytes[offset] = 0
  return bytes
}

describe('path geometry as SVG', () => {
  test('starts with a move even when the outline starts with a close', () => {
    expect(geometryBlobToSVGPath(glyphBlob())).toBe('M0 0L0.5 0.7L0.6 0Z')
  })
})

describe('text on a path', () => {
  function pathText() {
    const graph = new SceneGraph()
    return graph.createNode('TEXT', graph.getPages()[0].id, {
      text: 'A',
      width: 200,
      height: 120,
      fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }],
      textPathData: { network: { vertices: [], segments: [], regions: [] }, normalizedSize: { x: 1, y: 1 }, tValue: 0, forward: true },
      derivedTextGlyphs: [{ commandsBlob: glyphBlob(), x: 10, y: 50, fontSize: 40, rotation: Math.PI / 2 }]
    })
  }

  test('draws its saved glyphs along the curve, turned and scaled as the canvas draws them', () => {
    const element = pathTextElement(pathText())
    expect(element?.tagName).toBe('svg')
    const glyph = element?.children[0]
    expect(glyph?.type === 'element' && glyph.attrs).toMatchObject({
      d: 'M0 0L0.5 0.7L0.6 0Z',
      transform: 'translate(10 50) rotate(-90) scale(40 -40)'
    })
  })

  test('leaves straight text and path text without saved glyphs to CSS', () => {
    const graph = new SceneGraph()
    const plain = graph.createNode('TEXT', graph.getPages()[0].id, { text: 'Plain' })
    expect(pathTextElement(plain)).toBeNull()
    expect(pathTextElement({ ...pathText(), derivedTextGlyphs: null })).toBeNull()
  })
})
