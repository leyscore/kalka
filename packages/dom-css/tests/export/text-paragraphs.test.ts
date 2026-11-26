import { expect, test } from 'bun:test'

import { sceneNodeToDesignDocument, serializeHTML } from '@kalka/dom-css/export'
import { SceneGraph } from '@kalka/scene-graph'

function html(fields: Parameters<SceneGraph['createNode']>[2]): string {
  const graph = new SceneGraph()
  const text = graph.createNode('TEXT', graph.getPages()[0].id, fields)
  return serializeHTML(sceneNodeToDesignDocument(graph, text.id, { includeSourceIds: false }))
}

test('lists are written as real HTML lists', () => {
  const output = html({
    text: 'Intro\nOne\nTwo\nNested',
    listLines: [
      { type: 'NONE', level: 0 },
      { type: 'ORDERED', level: 0 },
      { type: 'ORDERED', level: 0 },
      { type: 'UNORDERED', level: 1 }
    ]
  })
  expect(output).toStartWith('<div')
  expect(output).toContain('<p style="margin: 0">Intro</p>')
  expect(output).toMatch(/<ol style="[^"]*list-style-type: decimal[^"]*"><li [^>]*>One<\/li><li /)
  expect(output).toMatch(
    /<ul style="[^"]*list-style-type: circle[^"]*"><li [^>]*>Nested<\/li><\/ul>/
  )
})

test('paragraph spacing and indent set each paragraph apart', () => {
  const output = html({ text: 'First\n\nLast', paragraphSpacing: 12, paragraphIndent: 20 })
  expect(output).toContain('<p style="margin: 0 0 12px; text-indent: 20px">First</p>')
  expect(output).toContain('<p style="margin: 0 0 12px; text-indent: 20px"><br></p>')
  expect(output).toContain('<p style="margin: 0; text-indent: 20px">Last</p>')
})

test('text without paragraph settings stays one run of characters', () => {
  expect(html({ text: 'One\nTwo' })).toMatch(/^<span[^>]*>One\nTwo<\/span>$/)
})

test('paragraph spacing on a single paragraph keeps the text inline', () => {
  expect(html({ text: 'Only one', paragraphSpacing: 24 })).toMatch(/^<span[^>]*>Only one<\/span>$/)
})
