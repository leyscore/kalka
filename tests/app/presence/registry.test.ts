import 'fake-indexeddb/auto'
import { afterEach, expect, test } from 'bun:test'

import { createEditorStore } from '@/app/editor/session/create'
import { addAgent, setOwnerColor, setPeers } from '@/app/presence/registry'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.dispose()
})

function setup() {
  const store = createEditorStore()
  stores.push(store)
  return { store, pageId: store.state.currentPageId, other: store.graph.addPage('Other').id }
}

const red = { r: 1, g: 0, b: 0, a: 1 }

test('draws active agents on their page, in their owner color', () => {
  const { store, pageId, other } = setup()
  const here = addAgent(store, 'chat')
  const there = addAgent(store, 'chat')
  here.update({ status: 'editing', cursor: { x: 5, y: 6, pageId } })
  there.update({ status: 'editing', cursor: { x: 1, y: 1, pageId: other } })
  setOwnerColor(store, red)
  expect(store.state.presenceCursors).toEqual([
    { kind: 'agent', name: here.name, color: red, x: 5, y: 6, selection: undefined }
  ])
})

test('hides idle agents and gives each a different callsign', () => {
  const { store, pageId } = setup()
  const agents = Array.from({ length: 5 }, () => addAgent(store, 'chat'))
  expect(new Set(agents.map((agent) => agent.name)).size).toBe(5)
  agents[0]?.update({ status: 'idle', cursor: { x: 0, y: 0, pageId } })
  expect(store.state.presenceCursors).toEqual([])
})

test('draws people and their agents with the person color', () => {
  const { store, pageId } = setup()
  setPeers(store, [
    {
      clientId: 3,
      name: 'Ana',
      color: red,
      cursor: { x: 1, y: 2, pageId },
      agents: [
        { id: 'a', name: 'Orbit', kind: 'mcp', status: 'thinking', cursor: { x: 3, y: 4, pageId } }
      ]
    }
  ])
  expect(
    store.state.presenceCursors.map(({ kind, name, color }) => ({ kind, name, color }))
  ).toEqual([
    { kind: 'person', name: 'Ana', color: red },
    { kind: 'agent', name: 'Orbit', color: red }
  ])
})

test('follows the page on screen', async () => {
  const { store, other } = setup()
  addAgent(store, 'chat').update({ status: 'editing', cursor: { x: 1, y: 1, pageId: other } })
  expect(store.state.presenceCursors).toHaveLength(0)
  store.preparationController.acknowledgePresentation(Number.MAX_SAFE_INTEGER)
  await store.switchPage(other)
  expect(store.state.presenceCursors).toHaveLength(1)
})
