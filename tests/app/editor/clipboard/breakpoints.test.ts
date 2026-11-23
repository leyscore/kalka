import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  adoptLayers,
  applyCopy,
  splitSnapshotBreakpoints
} from '@/app/editor/clipboard/breakpoints'

describe('splitSnapshotBreakpoints', () => {
  test('separates the narrower copies from the widest, widest first', () => {
    const { html, breakpoints } = splitSnapshotBreakpoints(
      '<div class="hero">Wide</div>' +
        '<template data-kalka-breakpoint="390" data-kalka-name="Phone"><div class="hero">Narrow</div></template>' +
        '<template data-kalka-breakpoint="810" data-kalka-name="Tablet"><div class="hero">Mid</div></template>'
    )
    expect(html).toBe('<div class="hero">Wide</div>')
    expect(breakpoints).toEqual([
      { width: 810, name: 'Tablet', html: '<div class="hero">Mid</div>' },
      { width: 390, name: 'Phone', html: '<div class="hero">Narrow</div>' }
    ])
  })

  test('leaves HTML without copies as it is', () => {
    const source = '<section><template><p>Kept</p></template></section>'
    expect(splitSnapshotBreakpoints(source)).toEqual({ html: source, breakpoints: [] })
  })

  test('names an unnamed copy after its width', () => {
    const { breakpoints } = splitSnapshotBreakpoints(
      '<p>Wide</p><template data-kalka-breakpoint="600"><p>Narrow</p></template>'
    )
    expect(breakpoints.map((breakpoint) => breakpoint.name)).toEqual(['600'])
  })
})

describe('applyCopy', () => {
  function header(graph: SceneGraph, width: number) {
    const page = graph.getPages()[0]?.id ?? ''
    return graph.createNode('FRAME', page, { name: 'site-header', width, height: 80 })
  }

  test('hides a layer the narrower copy imported as a different layer it hides', () => {
    const graph = new SceneGraph()
    const target = header(graph, 390)
    graph.createNode('FRAME', target.id, { name: 'brand', width: 95, height: 34 })
    const nav = graph.createNode('FRAME', target.id, { name: 'nav-main', width: 419, height: 23 })
    const actions = graph.createNode('FRAME', target.id, { name: 'nav-actions', x: 1016 })

    // Hidden at this width, the row of links came in as one text.
    const copyGraph = new SceneGraph()
    const source = header(copyGraph, 390)
    copyGraph.createNode('FRAME', source.id, { name: 'brand', width: 95, height: 34 })
    copyGraph.createNode('TEXT', source.id, { name: 'Product Customers', visible: false })
    copyGraph.createNode('FRAME', source.id, { name: 'nav-actions', x: 166 })

    applyCopy(graph, target, copyGraph, source, true)

    expect(graph.getNode(nav.id)?.visible).toBe(false)
    expect(graph.getNode(actions.id)?.x).toBe(166)
  })

  test('brings the pictures only this width shows', () => {
    const graph = new SceneGraph()
    const target = header(graph, 390)
    const kept = new Uint8Array([1])
    graph.images.set('shared', kept)

    const copyGraph = new SceneGraph()
    const source = header(copyGraph, 390)
    copyGraph.images.set('shared', new Uint8Array([9]))
    copyGraph.images.set('phone-only', new Uint8Array([2]))

    applyCopy(graph, target, copyGraph, source, true)

    expect(graph.images.get('phone-only')).toEqual(new Uint8Array([2]))
    expect(graph.images.get('shared')).toBe(kept)
  })

  test('hides a layer the page does not have at that width', () => {
    const graph = new SceneGraph()
    const target = header(graph, 390)
    const nav = graph.createNode('FRAME', target.id, { name: 'nav-main', width: 419 })

    const copyGraph = new SceneGraph()
    const source = header(copyGraph, 390)
    copyGraph.createNode('TEXT', source.id, { name: 'Product Customers' })

    applyCopy(graph, target, copyGraph, source, true)

    expect(graph.getNode(nav.id)).toMatchObject({ visible: false, width: 419 })
  })

  test('gives a text what the one text shown in its element says at that width', () => {
    const graph = new SceneGraph()
    const target = header(graph, 390)
    const title = graph.createNode('TEXT', target.id, {
      name: 'Grow faster. Take payments',
      text: 'Grow faster. Take payments anywhere.',
      width: 745
    })

    // The page hides the second sentence there, so the heading came in as a frame of two texts.
    const copyGraph = new SceneGraph()
    const source = header(copyGraph, 390)
    const heading = copyGraph.createNode('FRAME', source.id, {
      name: 'hero-title',
      x: 16,
      y: 53,
      style: { 'grid-column': '1 / -1', color: 'rgb(129, 184, 26)' }
    })
    copyGraph.createNode('TEXT', heading.id, {
      name: 'Grow faster.',
      text: 'Grow faster.',
      y: -4,
      width: 311,
      style: { display: 'inline', color: 'rgb(6, 27, 49)' }
    })
    copyGraph.createNode('TEXT', heading.id, { name: 'Take payments', visible: false })

    applyCopy(graph, target, copyGraph, source, true)

    expect(graph.getNode(title.id)).toMatchObject({
      name: 'Grow faster. Take payments',
      text: 'Grow faster.',
      x: 16,
      y: 49,
      width: 311,
      // Placed as the element is, and read as its text is.
      style: { 'grid-column': '1 / -1', color: 'rgb(6, 27, 49)' }
    })
  })
})

describe('adoptLayers', () => {
  function hero(graph: SceneGraph, width: number) {
    const page = graph.getPages()[0]?.id ?? ''
    return graph.createNode('FRAME', page, { name: 'hero', width, height: 600 })
  }

  /** A hero whose phone copy has a field with its label where the wide one has a button. */
  function copies() {
    const graph = new SceneGraph()
    const target = hero(graph, 1440)
    graph.createNode('TEXT', target.id, { name: 'Create a site' })
    const button = graph.createNode('FRAME', target.id, { name: 'button' })
    graph.createNode('FRAME', target.id, { name: 'video' })

    const copyGraph = new SceneGraph()
    const source = hero(copyGraph, 390)
    copyGraph.createNode('TEXT', source.id, { name: 'Create a site' })
    const field = copyGraph.createNode('FRAME', source.id, { name: 'text-input', width: 350 })
    copyGraph.createNode('TEXT', field.id, { name: 'Email', text: 'Email' })
    copyGraph.createNode('FRAME', source.id, { name: 'menu', visible: false })
    copyGraph.createNode('FRAME', source.id, { name: 'video' })
    return { graph, target, button, copyGraph, source }
  }

  test('adds the layers only a narrower copy shows, hidden, where the copy has them', () => {
    const { graph, target, copyGraph, source } = copies()

    adoptLayers(graph, target, copyGraph, source)

    const children = graph.getChildren(target.id)
    expect(children.map((child) => child.name)).toEqual([
      'Create a site',
      'button',
      'text-input',
      'video'
    ])
    expect(children.map((child) => child.visible)).toEqual([true, true, false, true])
    const [label] = graph.getChildren(children[2]?.id ?? '')
    expect(label).toMatchObject({ type: 'TEXT', text: 'Email', visible: true })
  })

  test('adds a layer once, whichever copies have it', () => {
    const { graph, target, copyGraph, source } = copies()

    adoptLayers(graph, target, copyGraph, source)
    adoptLayers(graph, target, copyGraph, source)

    expect(graph.getChildren(target.id)).toHaveLength(4)
  })

  test('shows at the breakpoint what the page shows there', () => {
    const { graph, target, button, copyGraph, source } = copies()

    adoptLayers(graph, target, copyGraph, source)
    applyCopy(graph, target, copyGraph, source, true)

    const field = graph.getChildren(target.id).find((child) => child.name === 'text-input')
    expect(field).toMatchObject({ visible: true, width: 350 })
    expect(graph.getNode(button.id)?.visible).toBe(false)
  })
})
