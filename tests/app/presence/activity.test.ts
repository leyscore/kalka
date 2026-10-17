import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import type { RemotePeer } from '@/app/collab/types'
import { createEditorStore, type EditorStore } from '@/app/editor/session'
import {
  finishWorking,
  layerActivity,
  markWorking,
  MAX_TRACKED_LAYERS,
  outermostLayers,
  recordLayerActivity,
  recordPeerActivity,
  workedLayers,
  workingMarks,
  WORKING_RELEASE_MS,
  keepWorking
} from '@/app/presence/activity'
import { addAgent, presenceOf, setPeers } from '@/app/presence/registry'
import { MAX_WORKING, parsePeer } from '@/app/presence/schema'

let store: EditorStore

beforeEach(() => {
  jest.useFakeTimers()
  store = createEditorStore(new SceneGraph())
})

afterEach(() => {
  store.preparationController.dispose()
  jest.useRealTimers()
})

function pageId() {
  return store.state.currentPageId
}

function working(agentId: string) {
  return presenceOf(store).agents.value.find((agent) => agent.id === agentId)?.working
}

/** A section with a heading and a button, as an agent writes one. */
function section(name = 'Hero') {
  const frame = store.graph.createNode('FRAME', pageId(), { name, width: 400, height: 200 })
  const heading = store.graph.createNode('TEXT', frame.id, { name: 'Heading', text: 'Hi' })
  const button = store.graph.createNode('FRAME', frame.id, { name: 'Button' })
  return { frame, heading, button }
}

describe("each layer's agent activity", () => {
  test('keeps the last read and the last write, with which agent and when', () => {
    const fern = addAgent(store, 'mcp')
    const ash = addAgent(store, 'chat')
    const { frame } = section()
    recordLayerActivity(store, fern, 'read', [frame.id], 1000)
    recordLayerActivity(store, ash, 'write', [frame.id], 2000)
    recordLayerActivity(store, fern, 'read', [frame.id], 3000)
    expect(layerActivity(store, frame.id)).toEqual({
      read: { agentId: fern.id, name: fern.name, kind: 'mcp', at: 3000 },
      write: { agentId: ash.id, name: ash.name, kind: 'chat', at: 2000 }
    })
  })

  test('is presence only: it never enters the document or its history', () => {
    const fern = addAgent(store, 'mcp')
    const { frame } = section()
    const before = structuredClone(store.graph.getNode(frame.id))
    const undoBefore = store.undo.peekUndo()
    recordLayerActivity(store, fern, 'write', [frame.id])
    markWorking(store, fern, [frame.id])
    expect(store.graph.getNode(frame.id)).toEqual(before)
    expect(store.undo.peekUndo()).toBe(undoBefore)
  })

  test('forgets the layers touched longest ago past its bound', () => {
    const fern = addAgent(store, 'mcp')
    const ids = Array.from({ length: MAX_TRACKED_LAYERS + 10 }, (_, index) => `layer-${index}`)
    for (let start = 0; start < ids.length; start += 200)
      recordLayerActivity(store, fern, 'read', ids.slice(start, start + 200))
    expect(layerActivity(store, 'layer-0')).toBeUndefined()
    expect(layerActivity(store, ids.at(-1) ?? '')).toBeDefined()
  })

  test("records what people's agents write and read from the presence they share", () => {
    const { frame, button } = section()
    const peer = (agent: Record<string, unknown>): RemotePeer[] => {
      const parsed = parsePeer(3, {
        user: { name: 'Ana' },
        agents: [{ id: 'peer-agent', name: 'Moss', kind: 'chat', status: 'editing', ...agent }]
      })
      return parsed ? [parsed] : []
    }
    recordPeerActivity(store, peer({ working: [frame.id], selection: [button.id] }), 500)
    expect(layerActivity(store, frame.id)?.write).toMatchObject({ name: 'Moss', at: 500 })
    expect(layerActivity(store, button.id)?.read).toMatchObject({ name: 'Moss', at: 500 })
    // Unchanged presence records nothing new.
    recordPeerActivity(store, peer({ working: [frame.id], selection: [button.id] }), 900)
    expect(layerActivity(store, frame.id)?.write?.at).toBe(500)
  })
})

describe('what an agent is working on', () => {
  test('is the outermost layers it created and the layers it named and changed', () => {
    const { frame, heading } = section()
    const card = store.graph.createNode('FRAME', pageId(), { name: 'Card' })
    const finish = store.capturePageChange(pageId())
    const created = store.graph.createNode('FRAME', frame.id, { name: 'New' })
    store.graph.createNode('TEXT', created.id, { name: 'Inside', text: 'x' })
    store.graph.updateNode(card.id, { width: 300 })
    // The parent grew to fit; that is not part of the work.
    store.graph.updateNode(frame.id, { height: 400 })
    const change = finish()
    expect(workedLayers(store.graph, change, [card.id]).sort()).toEqual(
      [created.id, card.id].sort()
    )
    // Without a page change, as for property edits: the layers the call named.
    expect(workedLayers(store.graph, null, [heading.id, frame.id])).toEqual([frame.id])
  })

  test('skips pages and folds layers into the one they are inside', () => {
    const { frame, heading, button } = section()
    expect(outermostLayers(store.graph, [heading.id, pageId(), frame.id, button.id])).toEqual([
      frame.id
    ])
  })

  test('grows with each write, folding what is inside what it already holds', () => {
    const fern = addAgent(store, 'mcp')
    const hero = section('Hero')
    const footer = section('Footer')
    markWorking(store, fern, [hero.heading.id])
    markWorking(store, fern, [hero.frame.id])
    markWorking(store, fern, [footer.frame.id, footer.button.id])
    expect(working(fern.id)).toEqual([hero.frame.id, footer.frame.id])
  })

  test('holds a bounded number of layers, the newest kept', () => {
    const fern = addAgent(store, 'mcp')
    const frames = Array.from({ length: MAX_WORKING + 4 }, (_, index) =>
      store.graph.createNode('FRAME', pageId(), { name: `F${index}` })
    )
    markWorking(
      store,
      fern,
      frames.map((frame) => frame.id)
    )
    expect(working(fern.id)).toHaveLength(MAX_WORKING)
    expect(working(fern.id)?.at(-1)).toBe(frames.at(-1)?.id)
  })
})

describe('letting go', () => {
  test('finishing named layers releases them and what is inside them, and nothing else', () => {
    const fern = addAgent(store, 'mcp')
    const hero = section('Hero')
    const footer = section('Footer')
    const card = store.graph.createNode('FRAME', hero.frame.id, { name: 'Card' })
    // Held apart, as when the agent created it on its own after the hero.
    presenceOf(store).agents.value = presenceOf(store).agents.value.map((agent) =>
      agent.id === fern.id ? { ...agent, working: [card.id, footer.frame.id] } : agent
    )
    expect(finishWorking(store, fern, [hero.frame.id])).toEqual([card.id])
    expect(working(fern.id)).toEqual([footer.frame.id])
  })

  test('finishing without layers releases everything the agent holds, and only its own', () => {
    const fern = addAgent(store, 'mcp')
    const ash = addAgent(store, 'chat')
    const hero = section('Hero')
    const footer = section('Footer')
    markWorking(store, fern, [hero.frame.id, footer.frame.id])
    markWorking(store, ash, [hero.button.id])
    expect(finishWorking(store, fern).sort()).toEqual([hero.frame.id, footer.frame.id].sort())
    expect(working(fern.id)).toBeUndefined()
    expect(working(ash.id)).toEqual([hero.button.id])
  })

  test('a quiet agent lets go after a while, and each call starts the wait over', () => {
    const fern = addAgent(store, 'mcp')
    const { frame } = section()
    markWorking(store, fern, [frame.id])
    jest.advanceTimersByTime(WORKING_RELEASE_MS - 1000)
    keepWorking(store, fern)
    jest.advanceTimersByTime(WORKING_RELEASE_MS - 1000)
    expect(working(fern.id)).toEqual([frame.id])
    jest.advanceTimersByTime(1000)
    expect(working(fern.id)).toBeUndefined()
  })

  test('an agent that leaves takes its marks with it', () => {
    const fern = addAgent(store, 'mcp')
    const { frame } = section()
    markWorking(store, fern, [frame.id])
    expect(workingMarks(store, pageId())).toHaveLength(1)
    fern.remove()
    expect(workingMarks(store, pageId())).toEqual([])
  })
})

describe('the marks the canvas draws', () => {
  test("show our agents' and people's agents' work on the page, in their colors", () => {
    const fern = addAgent(store, 'mcp')
    const hero = section('Hero')
    const footer = section('Footer')
    markWorking(store, fern, [hero.frame.id])
    const color = { r: 0, g: 0.5, b: 1, a: 1 }
    const peer = parsePeer(3, {
      user: { name: 'Ana', color },
      agents: [
        {
          id: 'peer-agent',
          name: 'Moss',
          kind: 'chat',
          status: 'editing',
          working: [footer.frame.id]
        }
      ]
    })
    setPeers(store, peer ? [peer] : [])
    const marks = workingMarks(store, pageId())
    expect(marks).toEqual([
      { nodeId: hero.frame.id, name: fern.name, color: expect.any(Object) },
      { nodeId: footer.frame.id, name: 'Moss', color }
    ])
    // The same list while nothing changed, so the overlay does not redraw for it.
    expect(workingMarks(store, pageId())).toBe(marks)
    expect(workingMarks(store, 'another-page')).toEqual([])
  })

  test("a peer's working layers are bounded by the schema", () => {
    const tooMany = Array.from({ length: MAX_WORKING + 1 }, (_, index) => `0:${index}`)
    const peer = parsePeer(3, {
      user: { name: 'Ana' },
      agents: [{ id: 'a', name: 'Moss', kind: 'chat', status: 'editing', working: tooMany }]
    })
    expect(peer?.agents[0]?.working).toBeUndefined()
  })
})
