import { beforeAll, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { exportFigFile, initCodec, parseFigFile, SceneGraph } from '@kalka/core'
import { hasInstanceOverride, recordInstanceOverride } from '@kalka/scene-graph'

beforeAll(async () => {
  await initCodec()
})

test('instance style overrides come back as overrides after saving and reopening', async () => {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('COMPONENT', page, { name: 'Card', width: 200, height: 100 })
  graph.createNode('RECTANGLE', card.id, { name: 'Bar', width: 100, height: 10, strokeWeight: 1 })
  graph.createNode('TEXT', card.id, { name: 'Label', text: 'Hello world', fontSize: 12 })
  const instance = expectDefined(graph.createInstance(card.id, page))
  const [bar, label] = graph.getChildren(instance.id)
  graph.updateNode(bar.id, { strokeWeight: 6, cornerSmoothing: 0.6 })
  recordInstanceOverride(graph, bar.id, ['strokeWeight', 'cornerSmoothing'])
  graph.updateNode(label.id, {
    letterSpacing: 2,
    styleRuns: [{ start: 0, length: 5, style: { fontSize: 30 } }]
  })
  recordInstanceOverride(graph, label.id, ['letterSpacing', 'styleRuns'])

  const reopened = await parseFigFile((await exportFigFile(graph)).slice().buffer)
  const nodes = [...reopened.getAllNodes()]
  const copy = expectDefined(nodes.find((node) => node.type === 'INSTANCE'), 'reopened instance')
  const component = expectDefined(nodes.find((node) => node.type === 'COMPONENT'))
  const [reopenedBar, reopenedLabel] = reopened.getChildren(copy.id)
  expect(reopenedBar.strokeWeight).toBe(6)
  // Kiwi stores it as a 32-bit float, as Figma does.
  expect(reopenedBar.cornerSmoothing).toBeCloseTo(0.6)
  expect(reopenedLabel.letterSpacing).toBe(2)
  expect(reopenedLabel.styleRuns).toEqual([
    expect.objectContaining({ start: 0, length: 5, style: expect.objectContaining({ fontSize: 30 }) })
  ])
  for (const [layer, field] of [
    [reopenedBar, 'strokeWeight'],
    [reopenedBar, 'cornerSmoothing'],
    [reopenedLabel, 'letterSpacing'],
    [reopenedLabel, 'styleRuns']
  ] as const)
    expect(hasInstanceOverride(reopened, layer.id, field)).toBe(true)

  // The reopened overrides hold through an edit to the component; the rest follows it.
  const [componentBar, componentLabel] = reopened.getChildren(component.id)
  reopened.updateNode(componentBar.id, { strokeWeight: 3, strokeAlign: 'OUTSIDE' })
  reopened.updateNode(componentLabel.id, { letterSpacing: 5, textCase: 'UPPER' })
  reopened.syncInstances(component.id)
  expect([reopenedBar.strokeWeight, reopenedBar.strokeAlign]).toEqual([6, 'OUTSIDE'])
  expect([reopenedLabel.letterSpacing, reopenedLabel.textCase]).toEqual([2, 'UPPER'])
})
