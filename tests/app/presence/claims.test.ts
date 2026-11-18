import { afterEach, beforeEach, expect, jest, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { createEditorStore, type EditorStore } from '@/app/editor/session'
import { markWorking } from '@/app/presence/activity'
import { frameHeldMessage, heldByOtherAgent, topLevelLayer } from '@/app/presence/claims'
import { addAgent } from '@/app/presence/registry'

let store: EditorStore

beforeEach(() => {
  jest.useFakeTimers()
  store = createEditorStore(new SceneGraph())
})

afterEach(() => {
  store.preparationController.dispose()
  jest.useRealTimers()
})

function frame(name: string) {
  const pageId = store.state.currentPageId
  const top = store.graph.createNode('FRAME', pageId, { name, width: 400, height: 200 })
  const child = store.graph.createNode('TEXT', top.id, { name: 'Heading', text: 'Hi' })
  return { top, child }
}

test('a layer belongs to the frame that sits on the page', () => {
  const { top, child } = frame('Hero')
  expect(topLevelLayer(store.graph, child.id)).toBe(top.id)
  expect(topLevelLayer(store.graph, top.id)).toBe(top.id)
  expect(topLevelLayer(store.graph, store.state.currentPageId)).toBeUndefined()
})

test('a frame another agent is building is held, down to its children', () => {
  const hero = frame('Hero')
  const pricing = frame('Pricing')
  const fern = addAgent(store, 'chat', undefined, 'Fern')
  const orbit = addAgent(store, 'chat', undefined, 'Orbit')
  fern.update({ status: 'editing' })
  markWorking(store, fern, [hero.top.id])

  expect(heldByOtherAgent(store, orbit.id, [hero.child.id])).toEqual({
    agent: 'Fern',
    frame: 'Hero'
  })
  expect(heldByOtherAgent(store, orbit.id, [pricing.child.id])).toBeNull()
  // An agent never waits on itself.
  expect(heldByOtherAgent(store, fern.id, [hero.child.id])).toBeNull()
})

test('a resting agent holds nothing', () => {
  const hero = frame('Hero')
  const fern = addAgent(store, 'chat', undefined, 'Fern')
  fern.update({ status: 'editing' })
  markWorking(store, fern, [hero.top.id])
  fern.update({ status: 'idle' })
  expect(heldByOtherAgent(store, undefined, [hero.child.id])).toBeNull()
})

test('the refusal names the agent and the frame, and tells the model what to do', () => {
  const message = frameHeldMessage({ agent: 'Fern', frame: 'Hero' })
  expect(message).toContain('Fern is building "Hero"')
  expect(message).toContain('nothing was changed')
})
