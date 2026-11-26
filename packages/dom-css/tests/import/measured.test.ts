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

  test("a link's address becomes the hyperlink of its characters", () => {
    const link = element('a', box(0, 0, 40, 24), { ...BLOCK, display: 'inline' }, [
      element('strong', box(0, 0, 20, 24), { ...BLOCK, display: 'inline', 'font-weight': '700' }, [
        { type: 'text', text: 'the' }
      ]),
      { type: 'text', text: ' guide' }
    ])
    link.attrs.href = 'https://kalka.design/guide'
    const paragraph = element('p', box(0, 0, 600, 24), BLOCK, [
      { type: 'text', text: 'Read ' },
      link
    ])
    const { graph, artboard } = graphOf(measured([paragraph]))
    const [text] = graph.getChildren(artboard?.id ?? '')
    const hyperlink = { type: 'URL', value: 'https://kalka.design/guide' } as const
    expect(text?.styleRuns).toEqual([
      { start: 5, length: 9, style: { hyperlink } },
      { start: 5, length: 3, style: { fontWeight: 700, hyperlink } }
    ])
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

  test('a stacked block stays where the flow put it', () => {
    const column = element(
      'div',
      box(0, 0, 400, 300),
      { ...BLOCK, display: 'flex', 'flex-direction': 'column' },
      [
        element('header', box(0, 0, 400, 50), {
          ...BLOCK,
          position: 'absolute',
          'z-index': '10',
          'background-color': 'rgb(1, 1, 1)'
        }),
        element('main', box(0, 0, 400, 200), {
          ...BLOCK,
          'z-index': '9',
          'background-color': 'rgb(2, 2, 2)'
        }),
        element('footer', box(0, 200, 400, 100), {
          ...BLOCK,
          position: 'relative',
          'z-index': '0',
          'background-color': 'rgb(3, 3, 3)'
        })
      ]
    )
    const { graph, artboard } = graphOf(measured([column]))
    const children = graph.getChildren(graph.getChildren(artboard?.id ?? '')[0]?.id ?? '')
    expect(children.map((child) => child.height)).toEqual([200, 100, 50])
  })

  test('a background goes under a sibling that holds a box the page paints over it', () => {
    const hero = (titleStyle: Record<string, string>) =>
      element('section', box(0, 0, 400, 300), { ...BLOCK, position: 'relative' }, [
        element('div', box(0, 0, 400, 200), BLOCK, [
          element('h1', box(0, 0, 400, 40), { ...BLOCK, ...titleStyle })
        ]),
        element('div', box(0, 0, 400, 300), {
          ...BLOCK,
          position: 'absolute',
          'z-index': '1',
          'background-color': 'rgb(9, 9, 9)'
        })
      ])
    const heights = (document: DesignDocument) => {
      const { graph, artboard } = graphOf(document)
      const section = graph.getChildren(artboard?.id ?? '')[0]
      return graph.getChildren(section?.id ?? '').map((child) => child.height)
    }
    expect(heights(measured([hero({ position: 'relative', 'z-index': '2' })]))).toEqual([300, 200])
    // A title the page leaves under the background stays under it.
    expect(heights(measured([hero({})]))).toEqual([200, 300])
    expect(heights(measured([hero({ position: 'relative', 'z-index': '1' })]))).toEqual([200, 300])
  })

  test('centered lines in a column keep the width they are centered in', () => {
    const type = { ...BLOCK, 'text-align': 'center', 'font-size': '64px', 'line-height': '66px' }
    const column = element(
      'span',
      box(0, 0, 1440, 132),
      { ...type, display: 'flex', 'flex-direction': 'column' },
      [
        element('span', box(0, 0, 1440, 66), type, [
          { type: 'text', text: 'A website', layoutBox: box(590, 0, 260, 66) }
        ]),
        { type: 'text', text: ' makes it real', layoutBox: box(556, 66, 328, 66) }
      ]
    )
    const { graph, artboard } = graphOf(measured([column]))
    const lines = graph.getChildren(graph.getChildren(artboard?.id ?? '')[0]?.id ?? '')
    expect(lines.map((line) => [line.width, line.textAutoResize])).toEqual([
      [1440, 'HEIGHT'],
      [1440, 'HEIGHT']
    ])
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

  test('text that wraps after an inline box starts its first line past the box', () => {
    const { graph, artboard } = graphOf(
      measured([
        element('p', box(0, 0, 540, 42), BLOCK, [
          { type: 'text', text: 'Render UI before ', layoutBox: box(0, 2, 110, 21) },
          element(
            'code',
            box(113, 0, 105, 24),
            { ...BLOCK, display: 'inline', 'background-color': 'rgb(240, 240, 240)' },
            [{ type: 'text', text: 'vehicle_state', layoutBox: box(117, 2, 97, 21) }]
          ),
          {
            type: 'text',
            text: ' sync when the minimum state is ready for the first paint',
            layoutBox: box(0, 2, 520, 42),
            firstLineIndent: 222.5
          }
        ])
      ])
    )
    const [paragraph] = graph.getChildren(artboard.id)
    const [before, , after] = graph.getChildren(paragraph.id)
    expect(before.style['text-indent']).toBeUndefined()
    expect(after.x).toBe(0)
    expect(after.style['text-indent']).toBe('222.5px')
  })

  test('a placed picture drops the limit it took from a box further up the page', () => {
    const { graph, artboard } = graphOf(
      measured([
        element('div', box(0, 0, 676, 507), { ...BLOCK, position: 'relative' }, [
          element('span', box(0, 253, 0, 0), { ...BLOCK, display: 'inline' }, [
            {
              ...element('div', box(0, 0, 676, 507), {
                ...BLOCK,
                position: 'absolute',
                top: '0px',
                'max-height': '100%',
                'background-color': 'rgb(0, 0, 0)'
              }),
              inlineStyle: { 'max-height': '100%', 'text-indent': '4px' }
            }
          ])
        ])
      ])
    )
    const [banner] = graph.getChildren(artboard.id)
    const [span] = graph.getChildren(banner.id)
    const [picture] = graph.getChildren(span.id)
    expect(picture.height).toBe(507)
    expect(picture.style['max-height']).toBeUndefined()
    expect(picture.style['text-indent']).toBe('4px')
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
