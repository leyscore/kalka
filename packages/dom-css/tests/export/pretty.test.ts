import { describe, expect, test } from 'bun:test'

import { prettyCSS } from '#dom-css/export/pretty'
import { compact } from 'es-toolkit/array'
import { parse, type DefaultTreeAdapterTypes } from 'parse5'

import { exportHTMLBundle, sceneNodeToDesignDocument } from '@kalka/dom-css/export'
import { SceneGraph } from '@kalka/scene-graph'

type ParseNode = DefaultTreeAdapterTypes.Node

const WHITE = [
  { type: 'SOLID' as const, color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }
]

/** A card in auto layout holding a heading, a text with a bold run, and a nested row. */
function cardDocument() {
  const graph = new SceneGraph()
  const card = graph.createNode('FRAME', graph.getPages()[0].id, {
    name: 'Card',
    width: 400,
    height: 300,
    fills: WHITE,
    layoutMode: 'VERTICAL',
    itemSpacing: 16
  })
  graph.createNode('TEXT', card.id, { name: 'Title', text: 'Plans', htmlTag: 'h1' })
  graph.createNode('TEXT', card.id, {
    name: 'Body',
    text: 'Pay yearly and save',
    styleRuns: [{ start: 15, length: 4, style: { fontWeight: 700 } }]
  })
  const row = graph.createNode('FRAME', card.id, { name: 'Row', layoutMode: 'HORIZONTAL' })
  graph.createNode('RECTANGLE', row.id, { name: 'Dot', width: 8, height: 8, fills: WHITE })
  return {
    ...sceneNodeToDesignDocument(graph, card.id, { includeSourceIds: false }),
    sourceGraph: graph
  }
}

/** The tree a browser builds, with the whitespace between boxes that draws nothing dropped. */
function tree(node: ParseNode): unknown {
  if (node.nodeName === '#text') return (node as DefaultTreeAdapterTypes.TextNode).value
  if (!('childNodes' in node)) return node.nodeName
  const children = node.childNodes.filter(
    (child) =>
      child.nodeName !== '#text' || (child as DefaultTreeAdapterTypes.TextNode).value.trim() !== ''
  )
  const attrs = 'attrs' in node ? node.attrs : []
  return [
    node.nodeName,
    attrs.filter((attr) => attr.name !== 'style'),
    ...children.map((child) => (child.nodeName === 'style' ? 'style' : tree(child)))
  ]
}

/** The CSS rules as a browser reads them, whatever whitespace separates them. */
function rules(css: string): string[] {
  return compact(
    css
      .replace(/\s+/g, ' ')
      .split('}')
      .map((rule) =>
        rule
          .replace(/\s*([{};:,])\s*/g, '$1')
          .replace(/;$/, '')
          .trim()
      )
  )
}

async function standalone(options: Parameters<typeof exportHTMLBundle>[1] = {}) {
  const { files } = await exportHTMLBundle(cardDocument(), { html: 'standalone', ...options })
  return files
}

const styleOf = (html: string) => /<style>([\s\S]*)<\/style>/.exec(html)?.[1] ?? ''

describe('pretty export', () => {
  test('builds the same tree and rules as the compact page', async () => {
    const [compact] = await standalone()
    const [pretty] = await standalone({ pretty: true })
    const compactHTML = String(compact.content)
    const prettyHTML = String(pretty.content)

    expect(prettyHTML.split('\n').length).toBeGreaterThan(10)
    expect(tree(parse(prettyHTML))).toEqual(tree(parse(compactHTML)))
    expect(rules(styleOf(prettyHTML))).toEqual(rules(styleOf(compactHTML)))
  })

  test('keeps a text layer and its runs on one line', async () => {
    const [pretty] = await standalone({ pretty: true })
    expect(String(pretty.content)).toMatch(/>Pay yearly and <span[^>]*>save<\/span><\/span>\n/)
  })

  test('writes one declaration per line and leaves data URLs whole', () => {
    expect(
      prettyCSS('@media (max-width: 600px){.a{color:red;background:url(data:a;base64,b)}}')
    ).toBe(
      '@media (max-width: 600px) {\n  .a {\n    color: red;\n    background: url(data:a;base64,b);\n  }\n}\n'
    )
  })
})

describe('export reset', () => {
  test('sits in the page by default', async () => {
    const files = await standalone()
    expect(files).toHaveLength(1)
    expect(String(files[0].content)).toContain('box-sizing:border-box')
  })

  test('can be a reset.css file the page links before its own styles', async () => {
    const files = await standalone({ reset: 'file' })
    const html = String(files[0].content)
    expect(files.map((file) => file.path)).toEqual(['index.html', 'reset.css'])
    expect(String(files[1].content)).toContain('box-sizing:border-box')
    expect(html).not.toContain('box-sizing')
    expect(html.indexOf('href="reset.css"')).toBeLessThan(html.indexOf('<style>'))
  })

  test('sits with the other assets when they are external', async () => {
    const files = await standalone({ reset: 'file', assets: 'external' })
    expect(files.map((file) => file.path)).toContain('assets/reset.css')
    expect(String(files[0].content)).toContain('href="assets/reset.css"')
  })

  test('can be left to the project', async () => {
    const [page] = await standalone({ reset: 'none' })
    expect(String(page.content)).not.toContain('box-sizing')
    const { files } = await exportHTMLBundle(cardDocument(), { reset: 'none' })
    expect(String(files[0].content)).not.toContain('data-kalka-html')
  })
})
