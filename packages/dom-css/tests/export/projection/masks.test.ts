import { describe, expect, test } from 'bun:test'

import {
  sceneNodeToDesignDocument,
  type DesignElement,
  type DesignNode
} from '@kalka/dom-css/export'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

function element(node: DesignNode | undefined): DesignElement {
  if (node?.type !== 'element') throw new Error('Expected an element')
  return node
}

/** Each child layer's element, by layer name. */
function projectChildren(graph: SceneGraph, frame: SceneNode, options = {}) {
  const root = element(sceneNodeToDesignDocument(graph, frame.id, options).children[0])
  return new Map(
    root.children.map((child) => {
      const projected = element(child)
      return [projected.sourceSceneNode?.name, projected.inlineStyle ?? {}]
    })
  )
}

/** The SVG a `mask-image` layer draws, decoded from its data URL. */
function maskImages(value: string | undefined): string[] {
  return [...(value ?? '').matchAll(/url\("data:image\/svg\+xml,([^"]*)"\)/g)].map((match) =>
    decodeURIComponent(match[1])
  )
}

function maskedFrame() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const frame = graph.createNode('FRAME', page.id, { name: 'Frame', width: 200, height: 200 })
  graph.createNode('RECTANGLE', frame.id, { name: 'Below', width: 40, height: 40 })
  const mask = graph.createNode('ELLIPSE', frame.id, {
    name: 'Mask',
    x: 20,
    y: 30,
    width: 100,
    height: 60,
    isMask: true,
    maskType: 'ALPHA'
  })
  return { graph, frame, mask }
}

describe('mask projection', () => {
  test('a mask keeps its place but draws nothing itself', () => {
    const { graph, frame } = maskedFrame()
    const styles = projectChildren(graph, frame)
    expect(styles.get('Mask')?.visibility).toBe('hidden')
    expect(styles.get('Below')?.['mask-image']).toBeUndefined()
  })

  test('the layers above a mask show through its shape, placed in their own box', () => {
    const { graph, frame } = maskedFrame()
    graph.createNode('RECTANGLE', frame.id, {
      name: 'Above',
      x: 10,
      y: 10,
      width: 150,
      height: 50
    })
    const style = projectChildren(graph, frame).get('Above') ?? {}
    expect(style['mask-repeat']).toBe('no-repeat')
    expect(style['mask-mode']).toBe('alpha')
    // The mask's box, 20,30 in the frame, is 10,20 in the layer's.
    expect(style['mask-position']).toBe('10px 20px')
    expect(style['mask-size']).toBe('100px 60px')
    const [svg] = maskImages(style['mask-image'])
    expect(svg).toContain('<ellipse')
    expect(svg).toContain('matrix(1 0 0 1 10 20)')
  })

  test('a rotated layer takes the mask turned back into its own box', () => {
    const { graph, frame } = maskedFrame()
    graph.createNode('RECTANGLE', frame.id, {
      name: 'Turned',
      x: 20,
      y: 30,
      width: 100,
      height: 60,
      rotation: 90
    })
    const style = projectChildren(graph, frame).get('Turned') ?? {}
    const [svg] = maskImages(style['mask-image'])
    // Turned a quarter about the shared center, the mask's box spans the layer's other axis.
    expect(style['mask-size']).toBe('60px 100px')
    expect(style['mask-position']).toBe('20px -20px')
    expect(svg).toContain('matrix(0 -1 1 0 20 80)')
  })

  test('a luminance mask masks by brightness', () => {
    const { graph, frame, mask } = maskedFrame()
    graph.updateNode(mask.id, { maskType: 'LUMINANCE' })
    graph.createNode('RECTANGLE', frame.id, { name: 'Above', width: 10, height: 10 })
    expect(projectChildren(graph, frame).get('Above')?.['mask-mode']).toBe('luminance')
  })

  test('consecutive masks add up and a later mask starts a new run', () => {
    const { graph, frame } = maskedFrame()
    graph.createNode('RECTANGLE', frame.id, {
      name: 'Second Mask',
      width: 10,
      height: 10,
      isMask: true,
      maskType: 'VECTOR'
    })
    graph.createNode('RECTANGLE', frame.id, { name: 'Both', width: 10, height: 10 })
    graph.createNode('RECTANGLE', frame.id, {
      name: 'Third Mask',
      width: 10,
      height: 10,
      cornerRadius: 4,
      isMask: true,
      maskType: 'ALPHA'
    })
    graph.createNode('RECTANGLE', frame.id, { name: 'Last', width: 10, height: 10 })
    const styles = projectChildren(graph, frame)
    expect(maskImages(styles.get('Both')?.['mask-image'])).toHaveLength(2)
    expect(styles.get('Both')?.['mask-mode']).toBe('alpha, alpha')
    const last = maskImages(styles.get('Last')?.['mask-image'])
    expect(last).toHaveLength(1)
    expect(last[0]).toContain('rx="4"')
  })

  test('a hidden mask masks nothing', () => {
    const { graph, frame, mask } = maskedFrame()
    graph.updateNode(mask.id, { visible: false })
    graph.createNode('RECTANGLE', frame.id, { name: 'Above', width: 10, height: 10 })
    expect(projectChildren(graph, frame).get('Above')?.['mask-image']).toBeUndefined()
  })

  test('the mask draws with the vector renderer when one is given', () => {
    const { graph, frame } = maskedFrame()
    graph.createNode('RECTANGLE', frame.id, { name: 'Above', width: 10, height: 10 })
    const styles = projectChildren(graph, frame, {
      vectorElement: () => ({
        type: 'element',
        tagName: 'svg',
        attrs: { width: '100', height: '60' },
        children: [{ type: 'element', tagName: 'path', attrs: { d: 'M0 0H100' }, children: [] }]
      })
    })
    const [svg] = maskImages(styles.get('Above')?.['mask-image'])
    expect(svg).toContain('<path d="M0 0H100">')
  })

  test('a format that saves masks as fields can leave their CSS out', () => {
    const { graph, frame } = maskedFrame()
    graph.createNode('RECTANGLE', frame.id, { name: 'Above', width: 10, height: 10 })
    const styles = projectChildren(graph, frame, { masks: false })
    expect(styles.get('Mask')?.visibility).toBeUndefined()
    expect(styles.get('Above')?.['mask-image']).toBeUndefined()
  })
})
