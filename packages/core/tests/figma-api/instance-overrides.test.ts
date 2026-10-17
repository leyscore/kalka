import { expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { FigmaAPI, type FigmaNodeProxy } from '@kalka/core/figma-api'
import { createComponentPropertyId, hasInstanceOverride, SceneGraph } from '@kalka/scene-graph'

// Recorded with the same script in Figma desktop 126.

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const component = figma.createComponent()
  component.resize(100, 100)
  component.appendChild(figma.createRectangle())
  const instance = component.createInstance()
  const [layer] = instance.children as FigmaNodeProxy[]
  return { graph, instance, layer }
}

test('a layer inside an instance refuses the fields it always takes from its component', () => {
  const { layer } = setup()
  const refused = (setter: string, property: string) =>
    `in set_${setter}: This property cannot be overridden in an instance: ${property}`
  expect(() => (layer.x = 5)).toThrow(refused('x', 'relative-transform'))
  expect(() => (layer.y = 5)).toThrow(refused('y', 'relative-transform'))
  expect(() => (layer.rotation = 10)).toThrow(refused('rotation', 'relative-transform'))
  expect(() => (layer.relativeTransform = [[1, 0, 3], [0, 1, 3]])).toThrow(
    refused('relativeTransform', 'relative-transform')
  )
  expect(() => (layer.constraints = { horizontal: 'MAX', vertical: 'MIN' })).toThrow(
    refused('constraints', 'vertical-constraint')
  )
  expect(() => (layer.isMask = true)).toThrow(refused('isMask', 'is-mask'))
  expect(() => (layer.maskType = 'LUMINANCE')).toThrow(refused('maskType', 'mask-type'))
})

test('a layer inside an instance can be locked and restyled, each recorded as an override', () => {
  const { graph, instance, layer } = setup()
  layer.locked = true
  layer.strokeWeight = 4
  expect(hasInstanceOverride(graph, layer.id, 'locked')).toBe(true)
  expect(hasInstanceOverride(graph, layer.id, 'strokeWeight')).toBe(true)
  // The instance itself still moves.
  instance.x = 40
  expect(instance.x).toBe(40)
})

/** A Card component whose Body slot shows a default Note layer, and an instance of it. */
function slotSetup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  const page = graph.getPages()[0].id
  const body = createComponentPropertyId()
  const card = graph.createNode('COMPONENT', page, {
    componentPropertyDefinitions: [{ id: body, name: 'Body', type: 'SLOT', defaultValue: '' }]
  })
  const frame = graph.createNode('FRAME', card.id, {
    name: 'Body',
    width: 200,
    height: 100,
    componentPropertyReferences: [{ propertyId: body, field: 'SLOT_CONTENT' }]
  })
  const note = graph.createNode('RECTANGLE', frame.id, { name: 'Note', x: 10, y: 10 })
  const instance = expectDefined(graph.createInstance(card.id, page))
  const slot = expectDefined(figma.getNodeById(graph.getChildren(instance.id)[0].id))
  return { graph, figma, card, note, slot }
}

test('slot content is the instance’s own and keeps its position and constraints', () => {
  const { figma, slot } = slotSetup()
  const added = figma.createRectangle()
  slot.appendChild(added)
  added.x = 12
  added.constraints = { horizontal: 'MAX', vertical: 'MIN' }
  expect([added.x, added.constraints.horizontal]).toEqual([12, 'MAX'])
})

test('moving default slot content claims the slot, so the component no longer moves it', () => {
  const { graph, card, note, slot } = slotSetup()
  const [copy] = slot.children as FigmaNodeProxy[]
  copy.x = 40
  graph.updateNode(note.id, { x: 90 })
  graph.syncInstances(card.id)
  expect(copy.x).toBe(40)
})
