import { describe, expect, test } from 'bun:test'

import {
  cssClassDeclarations,
  cssClassStylesheet,
  exportHTMLBundle,
  sceneNodeToDesignDocument
} from '#dom-css/export/index'
import { cssClassFromRule, parseClassRules } from '#dom-css/import/class-rules'

import { assignHTMLClasses, SceneGraph, type CSSClass, type Fill } from '@open-pencil/scene-graph'

const INK: Fill[] = [
  {
    type: 'SOLID',
    color: { r: 18 / 255, g: 18 / 255, b: 20 / 255, a: 1 },
    opacity: 1,
    visible: true
  }
]
const BUTTON: CSSClass = {
  name: 'btn',
  kind: 'box',
  style: {
    fills: INK,
    cornerRadius: 999,
    layoutMode: 'HORIZONTAL',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 26,
    paddingRight: 26
  }
}

describe('CSS classes as stylesheet rules', () => {
  test('a class rule declares what its fields write, and nothing a new layer writes', () => {
    expect(cssClassDeclarations(BUTTON)).toEqual({
      'background-color': '#121214',
      'border-radius': '999px',
      display: 'flex',
      'align-items': 'flex-start',
      'padding-block': '14px',
      'padding-inline': '26px'
    })
    expect(cssClassStylesheet([BUTTON, { name: 'md:wide', kind: 'box', style: { opacity: 0.5 } }]))
      .toBe(`.btn {
  background-color: #121214;
  border-radius: 999px;
  display: flex;
  align-items: flex-start;
  padding-block: 14px;
  padding-inline: 26px;
}

.md\\:wide {
  opacity: 0.5;
}
`)
  })

  test('a rule read back is the class it was written from', () => {
    const [rule] = parseClassRules(cssClassStylesheet([BUTTON]))
    expect(rule?.name).toBe('btn')
    expect(rule && cssClassDeclarations(cssClassFromRule(rule, 'box'))).toEqual(
      cssClassDeclarations(BUTTON)
    )
    expect(
      parseClassRules('/* x */ .a b { color: red } @media (x) { .c { color: red } } .d{opacity:1}')
    ).toEqual([{ name: 'd', declarations: { opacity: '1' } }])
  })

  test('a standalone page writes the class rule once and keeps each layer’s own values inline', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const card = graph.createNode('FRAME', page.id, { name: 'Card', width: 400, height: 200 })
    const plain = graph.createNode('FRAME', card.id, { name: 'Plain', width: 168, height: 48 })
    const own = graph.createNode('FRAME', card.id, { name: 'Own', width: 168, height: 48 })
    graph.updateNode(graph.rootId, { cssClasses: [BUTTON] })
    assignHTMLClasses(graph, plain.id, 'btn')
    assignHTMLClasses(graph, own.id, 'btn')
    graph.updateNode(own.id, { cornerRadius: 4 })

    const document = {
      ...sceneNodeToDesignDocument(graph, card.id, { includeSourceIds: false }),
      sourceGraph: graph
    }
    const bundle = await exportHTMLBundle(document, { html: 'standalone' })
    const html = String(bundle.files[0]?.content)
    expect(html).toContain(
      '.btn{background-color:#121214;border-radius:999px;display:flex;align-items:flex-start;padding-block:14px;padding-inline:26px}'
    )
    // Each layer's own rule follows the class rules and holds only what differs from them.
    const rules = [...html.matchAll(/\.op-[0-9a-z]+\{([^}]*)\}/g)].map((match) => match[1])
    expect(rules.some((rule) => rule.includes('border-radius: 4px'))).toBe(true)
    expect(rules.filter((rule) => rule.includes('background-color: #121214'))).toEqual([])
  })
})
