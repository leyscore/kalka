import { expect, test } from 'bun:test'

import { guid } from '#fig-tests/helpers/guid'
import { materializeComponentClosure } from '#fig/instance-overrides/component-closure'
import { interpretInstance } from '#fig/instance-overrides/interpret'
import { materializeInstance } from '#fig/instance-overrides/materialize-instance'
import { mapInstanceSourceChildren } from '#fig/instance-overrides/source-children'

import type { FigTextLayout, NodeChange } from '@kalka/kiwi/fig/codec'
import { SceneGraph } from '@kalka/scene-graph'

/** One line laid out `lineHeight` tall, as Figma saved it beside the characters. */
function oneLine(characters: string, lineHeight: number): FigTextLayout & { characters: string } {
  return {
    characters,
    layoutSize: { x: 100, y: lineHeight },
    baselines: [
      {
        firstCharacter: 0,
        endCharacter: characters.length,
        position: { x: 0, y: lineHeight * 0.75 },
        width: 99,
        lineY: 0,
        lineHeight,
        lineAscent: 14
      }
    ]
  }
}

/**
 * A component's text at the font's own line height (Figma's "Auto"), 18px in its face, and an
 * instance that sets another face whose own line height is 21px.
 */
function materialize(componentLineHeight: NodeChange['lineHeight']) {
  const changes: NodeChange[] = [
    { guid: guid(1, 4), type: 'SYMBOL' },
    {
      guid: guid(2, 4),
      type: 'TEXT',
      parentIndex: { guid: guid(1, 4), position: '!' },
      fontSize: 14,
      fontName: { family: 'Narrow Face', style: 'Medium' },
      lineHeight: componentLineHeight,
      textAutoResize: 'WIDTH_AND_HEIGHT',
      textData: oneLine('Message', 18)
    },
    {
      guid: guid(3, 4),
      type: 'INSTANCE',
      symbolData: {
        symbolID: guid(1, 4),
        symbolOverrides: [
          {
            guidPath: { guids: [guid(2, 4)] },
            fontName: { family: 'Tall Face', style: 'Medium' },
            textData: oneLine('Branches', 21)
          }
        ]
      }
    } as NodeChange
  ]
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const occurrence = interpretInstance(changes, '4:3')
  const closure = materializeComponentClosure(graph, page.id, changes, occurrence)
  const ids = new Map([...closure].map(([id, value]) => [id, value.materialized.root.id]))
  const result = materializeInstance(graph, page.id, occurrence, ids, {
    sourceChildren: mapInstanceSourceChildren(occurrence, closure)
  })
  const component = closure.get('4:1')
  if (!component) throw new Error('Missing component')
  const [source] = graph.getChildren(component.materialized.root.id)
  graph.syncInstances(component.materialized.root.id)
  const [copy] = graph.getChildren(result.root.id)
  return { source, copy }
}

test("an instance's font sets the line height Figma keeps relative to the font", () => {
  const { source, copy } = materialize({ value: 100, units: 'PERCENT' })
  expect(source.lineHeight).toBe(18)
  expect(copy.lineHeight).toBe(21)
})

test('a line height in pixels stays the component’s whatever font the instance sets', () => {
  const { source, copy } = materialize({ value: 18, units: 'PIXELS' })
  expect([source.lineHeight, copy.lineHeight]).toEqual([18, 18])
})
