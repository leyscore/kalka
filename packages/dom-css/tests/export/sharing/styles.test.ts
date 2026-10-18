import { describe, expect, test } from 'bun:test'

import { exportHTMLBundle, sceneNodeToDesignDocument } from '#dom-css/export/index'
import { createHeadlessCSSRuntime } from '#dom-css/index'
import { compact } from 'es-toolkit/array'

import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

const INK = [
  { type: 'SOLID' as const, color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }
]

/** A toolbar of buttons styled alike at different widths, and a title of its own. */
function toolbar(): { graph: SceneGraph; bar: SceneNode } {
  const graph = new SceneGraph()
  const bar = graph.createNode('FRAME', graph.getPages()[0].id, {
    name: 'Toolbar',
    width: 400,
    height: 40,
    layoutMode: 'HORIZONTAL',
    primaryAxisSizing: 'FIXED',
    counterAxisSizing: 'FIXED',
    itemSpacing: 8,
    // A class of the user's own, which generated names leave alone.
    htmlClasses: ['button']
  })
  for (const width of [64, 72])
    graph.createNode('FRAME', bar.id, {
      name: 'Button',
      width,
      height: 32,
      fills: INK,
      cornerRadius: 6,
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      paddingLeft: 12,
      paddingRight: 12
    })
  graph.createNode('TEXT', bar.id, { name: 'Title', text: 'Title', fontSize: 18 })
  return { graph, bar }
}

async function fragment(options: { shareStyles?: boolean } = {}) {
  const { graph, bar } = toolbar()
  const document = sceneNodeToDesignDocument(graph, bar.id, { includeSourceIds: false })
  return String((await exportHTMLBundle(document, options)).files[0]?.content)
}

/** Every element's declarations once the page's rules and its inline style apply. */
function appliedStyles(html: string): Array<Record<string, string>> {
  const parsed = createHeadlessCSSRuntime().parseHTML(html)
  const rules = new Map<string, Record<string, string>>()
  for (const [, selector, body] of html.matchAll(/\.([\w-]+)\{([^}]*)\}/g))
    rules.set(
      selector ?? '',
      Object.fromEntries(
        (body ?? '').split('; ').map((part) => part.split(': ') as [string, string])
      )
    )
  const styles: Array<Record<string, string>> = []
  const visit = (node: (typeof parsed.children)[number]) => {
    if (node.type === 'text') return
    if (node.tagName !== 'style') {
      const classes = compact((node.attrs.class ?? '').split(' '))
      styles.push(Object.assign({}, ...classes.map((name) => rules.get(name)), node.inlineStyle))
    }
    node.children.forEach(visit)
  }
  parsed.children.forEach(visit)
  return styles
}

describe('styles layers share', () => {
  test('a fragment puts what layers repeat in one class and keeps their sizes inline', async () => {
    const html = await fragment({ shareStyles: true })
    expect(html).toContain('.button-2{')
    expect(html).toContain('<div class="button-2" style="width: 64px; height: 32px">')
    expect(html).toContain('<div class="button-2" style="width: 72px; height: 32px">')
  })

  test('every element ends up with the declarations it had inline', async () => {
    expect(appliedStyles(await fragment({ shareStyles: true }))).toEqual(
      appliedStyles(await fragment({ shareStyles: false }))
    )
  })

  test('without sharing, every declaration stays on its element', async () => {
    const html = await fragment({ shareStyles: false })
    expect(html).not.toContain('<style>')
    expect(html).not.toContain('class="button-2"')
  })

  test('a standalone page keeps no inline style, sizes in classes of their own', async () => {
    const { graph, bar } = toolbar()
    const document = sceneNodeToDesignDocument(graph, bar.id, { includeSourceIds: false })
    const { files } = await exportHTMLBundle(document, { html: 'standalone' })
    const html = String(files[0]?.content)
    expect(html).not.toContain(' style="')
    expect(html).toContain('<div class="button-2 button-3">')
    expect(html).toContain('<div class="button-2 button-4">')
  })
})
