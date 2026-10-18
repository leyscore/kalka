import { expect, test } from 'bun:test'

import { sceneNodeToDesignDocument, type DesignNode } from '@kalka/dom-css/export'
import { SceneGraph } from '@kalka/scene-graph'

function fontFamilies(node: DesignNode | undefined): Array<string | undefined> {
  if (node?.type !== 'element') return []
  return [
    node.inlineStyle?.['font-family'],
    ...node.children.flatMap((child) =>
      child.type === 'element' ? [child.inlineStyle?.['font-family']] : []
    )
  ]
}

function label(fontFallbacks?: readonly string[]) {
  const graph = new SceneGraph()
  const text = graph.createNode('TEXT', graph.getPages()[0].id, {
    text: '✕ Close',
    fontFamily: 'IBM Plex Mono',
    styleRuns: [{ start: 2, length: 5, style: { fontFamily: 'IBM Plex Sans' } }]
  })
  return sceneNodeToDesignDocument(graph, text.id, { includeSourceIds: false, fontFallbacks })
    .children[0]
}

test('text lists the fallback families after its own and its runs’ fonts', () => {
  expect(fontFamilies(label(['Noto Sans Symbols 2']))).toEqual([
    '"IBM Plex Mono", "Noto Sans Symbols 2"',
    '"IBM Plex Sans", "Noto Sans Symbols 2"'
  ])
})

test('text names only its own fonts without fallbacks', () => {
  expect(fontFamilies(label())).toEqual(['IBM Plex Mono', 'IBM Plex Sans'])
})

test('a generic family a layer sets stays a keyword', () => {
  const graph = new SceneGraph()
  const text = graph.createNode('TEXT', graph.getPages()[0].id, {
    text: '→',
    style: { 'font-family': '"Plex", monospace' }
  })
  const projected = sceneNodeToDesignDocument(graph, text.id, {
    includeSourceIds: false,
    fontFallbacks: ['Noto Sans Symbols 2']
  }).children[0]
  expect(fontFamilies(projected)[0]).toBe('"Plex", monospace, "Noto Sans Symbols 2"')
})
