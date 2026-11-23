import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { applyCopy, splitSnapshotBreakpoints } from '@/app/editor/clipboard/breakpoints'

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

  test('leaves an unpaired layer the copy shows as the wider breakpoint has it', () => {
    const graph = new SceneGraph()
    const target = header(graph, 390)
    const nav = graph.createNode('FRAME', target.id, { name: 'nav-main', width: 419 })

    const copyGraph = new SceneGraph()
    const source = header(copyGraph, 390)
    copyGraph.createNode('TEXT', source.id, { name: 'Product Customers' })

    applyCopy(graph, target, copyGraph, source, true)

    expect(graph.getNode(nav.id)).toMatchObject({ visible: true, width: 419 })
  })
})
