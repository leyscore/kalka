import { describe, expect, test } from 'bun:test'

import {
  exportHTMLBundle,
  sceneNodesToTailwindJSX,
  sceneNodeToDesignDocument
} from '#dom-css/export/index'
import { designDocumentToSceneGraph } from '#dom-css/import/scene-graph'
import type { DesignElement } from '#dom-css/types'

import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

function project(graph: SceneGraph, node: SceneNode): DesignElement {
  const element = sceneNodeToDesignDocument(graph, node.id).children[0]
  if (element?.type !== 'element') throw new Error('Expected an element')
  return element
}

function child(element: DesignElement, index: number): DesignElement {
  const found = element.children[index]
  if (found?.type !== 'element') throw new Error('Expected a child element')
  return found
}

describe('HTML tags and classes in export and import', () => {
  test('a layer is written with its tag and classes, and read back with them', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const nav = graph.createNode('FRAME', page.id, {
      name: 'Nav',
      width: 400,
      height: 60,
      htmlTag: 'nav',
      htmlClasses: ['site-nav', 'md:px-4']
    })
    graph.createNode('TEXT', nav.id, { name: 'Title', text: 'Studio', htmlTag: 'h1' })
    graph.createNode('FRAME', nav.id, { name: 'Box', width: 20, height: 20 })

    const element = project(graph, nav)
    expect(element.tagName).toBe('nav')
    expect(element.attrs.class).toBe('site-nav md:px-4')
    expect(child(element, 0).tagName).toBe('h1')
    expect(child(element, 1).tagName).toBe('div')
    expect(child(element, 1).attrs.class).toBeUndefined()

    const imported = designDocumentToSceneGraph({ type: 'document', children: [element] })
    const nodes = [...imported.nodes.values()]
    const read = nodes.find((node) => node.htmlTag === 'nav')
    expect(read?.htmlClasses).toEqual(['site-nav', 'md:px-4'])
    expect(nodes.some((node) => node.htmlTag === 'h1')).toBe(true)
    // A plain div is the frame's own tag, so the layer keeps none.
    expect(nodes.find((node) => node.width === 20)?.htmlTag).toBeNull()
  })

  test('a frame written as an inline tag lays out as the block it was', () => {
    const graph = new SceneGraph()
    const link = graph.createNode('FRAME', graph.getPages()[0].id, {
      name: 'Link',
      width: 120,
      height: 40,
      htmlTag: 'a'
    })
    const element = project(graph, link)
    expect(element.tagName).toBe('a')
    expect(element.inlineStyle?.display).toBe('block')
  })

  test('an image stays an img whatever tag the layer asks for', () => {
    const graph = new SceneGraph()
    const hash = 'a'.repeat(40)
    graph.images.set(hash, new Uint8Array([137, 80, 78, 71]))
    const image = graph.createNode('RECTANGLE', graph.getPages()[0].id, {
      name: 'Photo',
      htmlTag: 'figure',
      htmlClasses: ['photo'],
      fills: [
        {
          type: 'IMAGE',
          color: { r: 0, g: 0, b: 0, a: 1 },
          imageHash: hash,
          imageScaleMode: 'FILL',
          opacity: 1,
          visible: true
        }
      ]
    })
    const element = project(graph, image)
    expect(element.tagName).toBe('img')
    expect(element.attrs.class).toBe('photo')
  })

  test("classes HTML export generates for inline styles are not read as the layer's", () => {
    const imported = designDocumentToSceneGraph({
      type: 'document',
      children: [
        {
          type: 'element',
          tagName: 'section',
          attrs: { class: 'op-1a hero' },
          inlineStyle: { width: '100px', height: '50px', 'background-color': '#fff' },
          children: []
        }
      ]
    })
    const node = [...imported.nodes.values()].find((candidate) => candidate.htmlTag)
    expect(node?.htmlTag).toBe('section')
    expect(node?.htmlClasses).toEqual(['hero'])
  })

  test('Tailwind JSX writes a text layer with its own tag, or as a paragraph', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const title = graph.createNode('TEXT', page.id, { text: 'Title', htmlTag: 'h1' })
    const body = graph.createNode('TEXT', page.id, { text: 'Body', htmlClasses: ['lead'] })
    const code = sceneNodesToTailwindJSX(graph, [title.id, body.id])
    expect(code).toContain('<h1')
    expect(code).toMatch(/<p[^>]*className="lead /)
  })

  test('a fragment with styled tags brings the reset, scoped to its own roots', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const hero = graph.createNode('FRAME', page.id, { name: 'Hero', htmlTag: 'section' })
    graph.createNode('TEXT', hero.id, { text: 'Title', htmlTag: 'h1' })
    const plain = graph.createNode('FRAME', page.id, { name: 'Plain' })

    const fragment = async (id: string) => {
      const document = sceneNodeToDesignDocument(graph, id, { includeSourceIds: false })
      const bundle = await exportHTMLBundle(document)
      return String(bundle.files[0]?.content)
    }
    const html = await fragment(hero.id)
    expect(html).toStartWith('<style>:where([data-kalka-html],[data-kalka-html] *):where(')
    expect(html).toContain('<section data-kalka-html="fragment"')
    expect(html).not.toContain('data-kalka-node-id')

    const bare = await fragment(plain.id)
    expect(bare).not.toContain('<style>')
    expect(bare).not.toContain('data-kalka-html')
  })
})
