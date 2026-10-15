import { describe, expect, test } from 'bun:test'

import { rotationFromTransform } from '#dom-css/import/measured'
import { designDocumentToSceneGraph } from '#dom-css/import/scene-graph'
import type { DesignDocument, DesignElement, DesignNode, LayoutBox } from '#dom-css/types'

const box = (x: number, y: number, width: number, height: number): LayoutBox => ({
  x,
  y,
  width,
  height
})

function element(
  tagName: string,
  layoutBox: LayoutBox,
  computedStyle: Record<string, string>,
  children: DesignNode[] = []
): DesignElement {
  return { type: 'element', tagName, attrs: {}, children, computedStyle, layoutBox }
}

const BLOCK = {
  display: 'block',
  color: 'rgb(18, 18, 20)',
  'font-size': '16px',
  'font-family': 'Inter'
}

function measured(children: DesignNode[]): DesignDocument {
  return {
    type: 'document',
    children,
    viewport: { width: 1440, height: 900, bodyStyle: { 'background-color': 'rgb(250, 250, 248)' } }
  }
}

function graphOf(document: DesignDocument) {
  const graph = designDocumentToSceneGraph(document, { pageName: 'Home' })
  const page = graph.getPages()[0]
  const [artboard] = graph.getChildren(page.id)
  return { graph, artboard }
}

describe('measured HTML import', () => {
  test('a rendered page becomes one artboard of its width, its blocks where the browser put them', () => {
    const { graph, artboard } = graphOf(
      measured([
        element('header', box(0, 0, 1440, 80), {
          ...BLOCK,
          'background-color': 'rgb(255, 255, 255)'
        }),
        element('section', box(120, 200, 1200, 400), {
          ...BLOCK,
          'background-color': 'rgb(0, 0, 0)'
        })
      ])
    )
    expect(artboard?.name).toBe('Desktop')
    expect([artboard?.width, artboard?.height]).toEqual([1440, 900])
    const [header, section] = graph.getChildren(artboard?.id ?? '')
    expect([section?.x, section?.y, section?.width, section?.height]).toEqual([120, 200, 1200, 400])
    expect(header?.htmlTag).toBe('header')
  })

  test('a paragraph with a link is one text layer with a style run', () => {
    const paragraph = element('p', box(0, 0, 600, 48), { ...BLOCK, 'line-height': '24px' }, [
      { type: 'text', text: 'Read the\n   ' },
      element('a', box(80, 0, 40, 24), { ...BLOCK, display: 'inline', color: 'rgb(47, 91, 234)' }, [
        { type: 'text', text: 'guide' }
      ]),
      { type: 'text', text: ' first.' }
    ])
    const { graph, artboard } = graphOf(measured([paragraph]))
    const [text] = graph.getChildren(artboard?.id ?? '')
    expect(text?.type).toBe('TEXT')
    expect(text?.text).toBe('Read the guide first.')
    expect(text?.htmlTag).toBe('p')
    expect(text?.styleRuns).toHaveLength(1)
    expect(text?.styleRuns[0]).toMatchObject({ start: 9, length: 5 })
  })

  test('flex stays auto layout unless a child has margins, which the layer model lacks', () => {
    const row = (margin: string) =>
      element(
        'div',
        box(0, 0, 400, 40),
        { ...BLOCK, display: 'flex', 'background-color': 'rgb(255, 0, 0)' },
        [
          element('div', box(0, 0, 100, 40), {
            ...BLOCK,
            'margin-left': margin,
            'background-color': 'rgb(0, 0, 255)'
          }),
          element('div', box(120, 0, 100, 40), { ...BLOCK, 'background-color': 'rgb(0, 0, 255)' })
        ]
      )
    const plain = graphOf(measured([row('0px')]))
    const spaced = graphOf(measured([row('20px')]))
    const layoutOf = ({ graph, artboard }: ReturnType<typeof graphOf>) =>
      graph.getChildren(artboard?.id ?? '')[0]?.layoutMode
    expect(layoutOf(plain)).toBe('HORIZONTAL')
    expect(layoutOf(spaced)).toBe('NONE')
  })

  test('a negative z-index paints first, and what is not rendered is left out', () => {
    const card = element(
      'div',
      box(0, 0, 200, 100),
      { ...BLOCK, 'background-color': 'rgb(255, 255, 255)' },
      [
        element('span', box(0, 0, 50, 20), {
          ...BLOCK,
          display: 'inline-block',
          'background-color': 'rgb(0, 0, 0)'
        }),
        element('span', box(0, 0, 200, 100), {
          ...BLOCK,
          position: 'absolute',
          'z-index': '-1',
          'background-color': 'rgb(9, 9, 9)'
        }),
        element('div', box(0, 0, 0, 0), { ...BLOCK, display: 'none' })
      ]
    )
    const { graph, artboard } = graphOf(measured([card]))
    const children = graph.getChildren(graph.getChildren(artboard?.id ?? '')[0]?.id ?? '')
    expect(children).toHaveLength(2)
    expect(children[0]?.width).toBe(200)
  })

  test('a rotation reads from transform or rotate; scaling is not one', () => {
    expect(
      rotationFromTransform('matrix(0.994522, -0.104528, 0.104528, 0.994522, 0, 0)')
    ).toBeCloseTo(-6, 1)
    expect(rotationFromTransform('none', '-6deg')).toBe(-6)
    expect(rotationFromTransform('matrix(2, 0, 0, 2, 0, 0)')).toBeNull()
    expect(rotationFromTransform('none')).toBeNull()
  })

  test('a blurred circle stays a round glow', () => {
    const { graph, artboard } = graphOf(
      measured([
        element('div', box(-88, 102, 749, 749), {
          ...BLOCK,
          position: 'absolute',
          width: '749px',
          height: '749px',
          'background-color': 'rgb(111, 140, 236)',
          'border-radius': '50%',
          filter: 'blur(150px) brightness(1)'
        })
      ])
    )
    const [glow] = graph.getChildren(artboard.id)
    expect(glow.cornerRadius).toBe(374.5)
    expect(glow.effects).toMatchObject([{ type: 'LAYER_BLUR', radius: 150 }])
  })

  test('a padded box keeps the size the browser drew, padding included', () => {
    const { graph, artboard } = graphOf(
      measured([
        element(
          'a',
          box(0, 0, 146, 52),
          {
            ...BLOCK,
            display: 'flex',
            width: '86px',
            height: '20px',
            'padding-top': '16px',
            'padding-right': '30px',
            'padding-bottom': '16px',
            'padding-left': '30px',
            'background-image': 'linear-gradient(90deg, rgb(139, 92, 246), rgb(236, 72, 153))'
          },
          [{ type: 'text', text: 'Get started', layoutBox: box(30, 16, 86, 20) }]
        )
      ])
    )
    const [pill] = graph.getChildren(artboard.id)
    expect([pill.width, pill.height]).toEqual([146, 52])
    expect(pill.fills.map((fill) => fill.type)).toEqual(['GRADIENT_LINEAR'])
  })

  test('a gradient clipped to its text paints the letters, not a box', () => {
    const { graph, artboard } = graphOf(
      measured([
        element(
          'h1',
          box(0, 0, 600, 59),
          {
            ...BLOCK,
            color: 'rgba(0, 0, 0, 0)',
            'background-image': 'linear-gradient(90deg, rgb(139, 92, 246), rgb(236, 72, 153))',
            'background-clip': 'text'
          },
          [{ type: 'text', text: 'Gradient words' }]
        )
      ])
    )
    const [heading] = graph.getChildren(artboard.id)
    expect(heading.type).toBe('TEXT')
    expect(heading.fills.map((fill) => fill.type)).toEqual(['GRADIENT_LINEAR'])
  })

  test('a one line badge keeps its words on one line', () => {
    const { graph, artboard } = graphOf(
      measured([
        element(
          'span',
          box(0, 0, 113, 33),
          {
            ...BLOCK,
            display: 'inline',
            'padding-top': '8px',
            'padding-right': '16px',
            'padding-bottom': '8px',
            'padding-left': '16px',
            'background-color': 'rgb(238, 238, 255)',
            'line-height': '17px'
          },
          [{ type: 'text', text: 'New feature' }]
        )
      ])
    )
    const [badge] = graph.getChildren(artboard.id)
    const [label] = graph.getChildren(badge.id)
    expect(label.textAutoResize).toBe('WIDTH_AND_HEIGHT')
  })
})
