import { describe, expect, test } from 'bun:test'

import { sceneNodeToDesignDocument } from '#dom-css/export/projection'
import { photoDescription } from '#dom-css/export/tags'
import {
  layoutCaption,
  photoPlaceholderSVG,
  photoSubject,
  wrapCaption
} from '#dom-css/import/photo-placeholder'
import { designDocumentToSceneGraph } from '#dom-css/import/scene-graph'
import type { DesignDocument, DesignElement, DesignNode } from '#dom-css/types'
import { encode } from 'js-base64'

const DESCRIPTION = 'Hands shaping a clay bowl on a wheel in a sunlit ceramics studio'

function photo(attrs: Record<string, string>, width = 320, height = 240): DesignElement {
  return {
    type: 'element',
    tagName: 'img',
    attrs,
    children: [],
    computedStyle: { display: 'block', color: 'rgb(40, 30, 20)' },
    layoutBox: { x: 0, y: 0, width, height }
  }
}

function imported(children: DesignNode[]) {
  const document: DesignDocument = {
    type: 'document',
    children,
    viewport: { width: 1440, height: 900, bodyStyle: {} }
  }
  const graph = designDocumentToSceneGraph(document, { pageName: 'Home' })
  const [artboard] = graph.getChildren(graph.getPages()[0].id)
  const [image] = artboard ? graph.getChildren(artboard.id) : []
  return { graph, image }
}

function svgOf(graph: ReturnType<typeof imported>['graph'], hash: string | undefined): string {
  const bytes = hash ? graph.images.get(hash) : undefined
  return bytes ? new TextDecoder().decode(bytes) : ''
}

describe('photo placeholders', () => {
  test('a person in the description draws a person, anything else a landscape', () => {
    expect(photoSubject('Portrait of the founder at her desk')).toBe('person')
    expect(photoSubject("L'équipe autour de la table")).toBe('person')
    expect(photoSubject('A lake at sunrise')).toBe('scene')
  })

  test('the caption wraps to the width and keeps every word', () => {
    const lines = wrapCaption(DESCRIPTION, 120, 12)
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join(' ')).toBe(DESCRIPTION)
    for (const line of lines) expect(line.length * 12 * 0.56).toBeLessThanOrEqual(120)
  })

  test('the caption shrinks until it fits, and gives up only when no size does', () => {
    const roomy = layoutCaption(DESCRIPTION, 280, 200)
    const tight = layoutCaption(DESCRIPTION, 280, 30)
    expect(roomy?.lines.join(' ')).toBe(DESCRIPTION)
    expect(tight === null || tight.fontSize < (roomy?.fontSize ?? 0)).toBe(true)
    expect(layoutCaption(DESCRIPTION, 40, 8)).toBeNull()
  })

  test('the drawing is the size of the layer, in the page ink, with the description escaped', () => {
    const svg = photoPlaceholderSVG({
      description: 'Bread & <butter>',
      width: 300,
      height: 200,
      ink: { r: 1, g: 0, b: 0, a: 1 }
    })
    expect(svg).toContain('width="300" height="200"')
    expect(svg).toContain('stroke-dasharray')
    expect(svg).toContain('#FF0000')
    expect(svg).toContain('Bread &amp; &lt;butter&gt;')
  })

  test('an img with data-photo and no src imports as the placeholder and exports its description', () => {
    const { graph, image } = imported([photo({ 'data-photo': DESCRIPTION, alt: 'Studio' })])
    expect(image?.fills[0]?.type).toBe('IMAGE')
    const svg = svgOf(graph, image?.fills[0]?.imageHash ?? undefined)
    expect(svg).toContain('width="320" height="240"')
    expect(svg).toContain('ceramics')
    expect(image && photoDescription(image)).toBe(DESCRIPTION)
    expect(image?.name).toBe(DESCRIPTION)

    const exported = image ? sceneNodeToDesignDocument(graph, image.id).children[0] : undefined
    expect(exported?.type === 'element' && exported.attrs['data-photo']).toBe(DESCRIPTION)
  })

  test('a placeholder read back is drawn again at its new size; a real picture is kept', () => {
    const first = imported([photo({ 'data-photo': DESCRIPTION })])
    const src = `data:image/svg+xml;base64,${encode('<svg xmlns="http://www.w3.org/2000/svg"/>')}`
    const again = imported([photo({ 'data-photo': DESCRIPTION, src }, 600, 400)])
    expect(svgOf(again.graph, again.image?.fills[0]?.imageHash ?? undefined)).toContain(
      'width="600" height="400"'
    )
    expect(first.image?.fills[0]?.imageHash).not.toBe(again.image?.fills[0]?.imageHash)

    const png = imported([photo({ 'data-photo': DESCRIPTION, src: 'https://example.com/a.jpg' })])
    expect(png.image?.fills.some((fill) => fill.type === 'IMAGE')).toBe(false)
    expect(png.image && photoDescription(png.image)).toBe(DESCRIPTION)
  })
})
