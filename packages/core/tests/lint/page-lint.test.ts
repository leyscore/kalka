import { describe, expect, test } from 'bun:test'

import { createLinter, type PageLint } from '@kalka/core/lint'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

const WHITE = { r: 1, g: 1, b: 1, a: 1 }
const GRAY = { r: 0.85, g: 0.85, b: 0.85, a: 1 }

function solid(color: SceneNode['fills'][number]['color']): SceneNode['fills'] {
  return [{ type: 'SOLID', visible: true, opacity: 1, color }]
}

/** A page of cards holding a light text each, with findings from several rules. */
function cards() {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const board = graph.createNode('FRAME', pageId, { name: 'Board', width: 800, height: 600 })
  const cardIds: string[] = []
  for (let index = 0; index < 4; index++) {
    const card = graph.createNode('FRAME', board.id, {
      name: `Frame ${index}`,
      x: index * 120.5,
      width: 100,
      height: 80,
      fills: solid(WHITE)
    })
    graph.createNode('TEXT', card.id, {
      name: 'Text',
      text: `Card ${index}`,
      fontSize: 9,
      fills: solid(GRAY)
    })
    cardIds.push(card.id)
  }
  return { graph, pageId, boardId: board.id, cardIds }
}

/** Follows the graph's edits as the editor's design check does. */
function follow(graph: SceneGraph, page: PageLint) {
  return graph.onNodeEvents({
    created: (node) => page.touch(node.id),
    updated: (id) => page.touch(id),
    deleted: (id) => page.touch(id),
    reparented: (id) => page.touch(id),
    reordered: (id) => page.touch(id)
  })
}

describe('page lint', () => {
  test('re-checks what edits touch and finds what a full lint finds', () => {
    const { graph, pageId, boardId, cardIds } = cards()
    const linter = createLinter({ preset: 'strict' })
    const page = linter.lintPage(graph, pageId)
    const stop = follow(graph, page)
    const full = () => linter.lintGraph(graph, [pageId]).messages

    expect(page.check().messages).toEqual(full())
    expect(page.check().messages.length).toBeGreaterThan(0)

    const [first, second, third] = cardIds
    const textId = graph.getNode(first)?.childIds[0] ?? ''
    graph.updateNode(textId, { text: 'Edited', fontSize: 16 })
    expect(page.check().messages).toEqual(full())

    // A background behind the text changes its contrast finding.
    graph.updateNode(first, { fills: solid({ r: 0.1, g: 0.1, b: 0.1, a: 1 }) })
    expect(page.check().messages).toEqual(full())

    graph.updateNode(second, { name: 'Named card', x: 240 })
    graph.createNode('RECTANGLE', second, { name: 'Rectangle', width: 10.5, height: 10 })
    expect(page.check().messages).toEqual(full())

    graph.reparentNode(third, cardIds[3])
    expect(page.check().messages).toEqual(full())

    graph.deleteNode(cardIds[3])
    expect(page.check().messages).toEqual(full())

    graph.updateNode(boardId, { visible: false })
    expect(page.check().messages).toEqual(full())
    stop()
  })

  test('checks the page again when the variables change', () => {
    const { graph, pageId } = cards()
    const linter = createLinter({ preset: 'recommended' })
    const page = linter.lintPage(graph, pageId)
    page.check()
    graph.addCollection({
      id: 'colors',
      name: 'Colors',
      modes: [{ modeId: 'light', name: 'Light' }],
      defaultModeId: 'light',
      variableIds: []
    })
    graph.addVariable({
      id: 'white',
      name: 'White',
      type: 'COLOR',
      collectionId: 'colors',
      valuesByMode: { light: WHITE },
      description: '',
      hiddenFromPublishing: false
    })
    expect(page.check().messages).toEqual(linter.lintGraph(graph, [pageId]).messages)
  })
})
