import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  MAX_REVEAL_DELAY_MS,
  MAX_REVEALED_LAYERS,
  MAX_TYPE_MS,
  MAX_TYPED_TEXTS,
  planReveal
} from '#vue/canvas/dom-scene/reveal/plan'

function card() {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const frame = graph.createNode('FRAME', pageId, { name: 'Card', width: 300, height: 200 })
  const title = graph.createNode('TEXT', frame.id, { name: 'Title', text: 'Pro plan' })
  const button = graph.createNode('RECTANGLE', frame.id, { name: 'Button' })
  return { graph, pageId, frame, title, button }
}

const motion = { reducedMotion: false }

describe('replaying an agent edit', () => {
  test('created layers appear in document order and created text types itself out', () => {
    const { graph, frame, title, button } = card()
    // Listed in any order, as edits report them.
    const steps = planReveal(graph, { created: [button.id, frame.id, title.id], written: [] }, motion)
    expect(steps.map((step) => [step.id, step.kind])).toEqual([
      [frame.id, 'appear'],
      [title.id, 'type'],
      [button.id, 'appear']
    ])
    const delays = steps.map((step) => step.delay)
    expect(delays[0]).toBe(0)
    expect(delays).toEqual([...delays].sort((a, b) => a - b))
    expect(new Set(delays).size).toBe(delays.length)
  })

  test('rewritten text on an existing layer types, other existing layers do not move', () => {
    const { graph, frame, title } = card()
    const steps = planReveal(graph, { created: [], written: [title.id, frame.id] }, motion)
    expect(steps.map((step) => [step.id, step.kind])).toEqual([[title.id, 'type']])
  })

  test('longer text types for longer, within bounds', () => {
    const { graph, pageId } = card()
    const short = graph.createNode('TEXT', pageId, { text: 'Hi' })
    const long = graph.createNode('TEXT', pageId, { text: 'x'.repeat(5000) })
    const [first, second] = planReveal(graph, { created: [short.id, long.id], written: [] }, motion)
    expect(first?.duration).toBeLessThan(second?.duration ?? 0)
    expect(second?.duration).toBe(MAX_TYPE_MS)
  })

  test('a large edit animates a bounded number of layers and finishes starting them in time', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const ids = Array.from(
      { length: MAX_REVEALED_LAYERS * 20 },
      (_, index) => graph.createNode('TEXT', pageId, { text: `Row ${index}` }).id
    )
    const steps = planReveal(graph, { created: ids, written: [] }, motion)
    expect(steps).toHaveLength(MAX_REVEALED_LAYERS)
    expect(steps.filter((step) => step.kind === 'type')).toHaveLength(MAX_TYPED_TEXTS)
    expect(Math.max(...steps.map((step) => step.delay))).toBeLessThanOrEqual(MAX_REVEAL_DELAY_MS)
  })

  test('hidden, deleted and page layers are skipped', () => {
    const { graph, pageId, frame } = card()
    graph.updateNode(frame.id, { visible: false })
    const steps = planReveal(graph, { created: [frame.id, pageId, 'gone'], written: [] }, motion)
    expect(steps).toEqual([])
  })

  test('with reduced motion nothing animates', () => {
    const { graph, frame, title } = card()
    const edit = { created: [frame.id, title.id], written: [title.id] }
    expect(planReveal(graph, edit, { reducedMotion: true })).toEqual([])
  })
})
