import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import { toRaw } from 'vue'

import { SceneGraph } from '@kalka/scene-graph'
import { MAX_REVEALED_LAYERS, type RevealStep } from '@kalka/vue'

import { createEditorStore } from '@/app/editor/session'
import { attachCanvasScene } from '@/app/presence/canvas-scene'
import {
  agentEditFromChange,
  cursorStops,
  holdAgentCreations,
  MAX_CURSOR_STOPS,
  MAX_HELD_LAYERS,
  showAgentEdit
} from '@/app/presence/edit-effect'
import { addAgent, presenceOf } from '@/app/presence/registry'
import { appPreferences } from '@/app/settings/preferences/store'

const stores: ReturnType<typeof createEditorStore>[] = []
let savedPreferences: typeof appPreferences.value
beforeEach(() => {
  savedPreferences = structuredClone(toRaw(appPreferences.value))
})
afterEach(() => {
  appPreferences.value = savedPreferences
  for (const store of stores.splice(0)) store.preparationController.dispose()
})

/** Animations off in Settings, as reduced motion in the system does too. */
function turnAnimationsOff() {
  appPreferences.value = {
    ...savedPreferences,
    appearance: { ...savedPreferences.appearance, animations: 'off' }
  }
}

/** Reduce agent animations in Settings, with the app's other animations left on. */
function reduceAgentAnimations() {
  appPreferences.value = {
    ...savedPreferences,
    appearance: { animations: 'system', reduceAgentAnimations: true }
  }
}

function editor() {
  const store = createEditorStore(new SceneGraph())
  stores.push(store)
  const pageId = store.state.currentPageId
  const shown: RevealStep[][] = []
  /** Layers the pane keeps hidden now. */
  const held = new Set<string>()
  const detach = attachCanvasScene(store, {
    reveal: (steps) => {
      shown.push([...steps])
      // A step's layer shows as its reveal starts.
      for (const step of steps) held.delete(step.id)
    },
    hold: (ids) => {
      for (const id of ids) held.add(id)
    },
    release: (ids) => {
      for (const id of ids) held.delete(id)
    }
  })
  return { store, pageId, shown, held, detach }
}

/** Builds a card the way a tool would, and what the edit changed. */
function cardEdit(store: ReturnType<typeof editor>['store'], pageId: string) {
  const heading = store.graph.createNode('TEXT', pageId, { name: 'Heading', text: 'Old' })
  const finish = store.capturePageChange(pageId)
  const card = store.graph.createNode('FRAME', pageId, { name: 'Card', x: 40, y: 40 })
  const title = store.graph.createNode('TEXT', card.id, {
    name: 'Title',
    text: 'Pro',
    x: 10,
    y: 10
  })
  const button = store.graph.createNode('RECTANGLE', card.id, { name: 'Button', x: 10, y: 60 })
  store.graph.updateNode(heading.id, { text: 'New heading' })
  return { change: finish(), heading, card, title, button }
}

describe("showing an agent's edit", () => {
  test('an edit names what it created, parents first, and the text it rewrote', () => {
    const { store, pageId } = editor()
    const { change, heading, card, title, button } = cardEdit(store, pageId)
    const edit = agentEditFromChange(change)
    expect(edit.created[0]).toBe(card.id)
    expect([...edit.created].sort()).toEqual([card.id, title.id, button.id].sort())
    expect(edit.written).toEqual([heading.id])
  })

  test('the canvas replays it and the agent moves through what it reveals', async () => {
    const { store, pageId, shown } = editor()
    const agent = addAgent(store, 'mcp')
    const { change, heading, card, title, button } = cardEdit(store, pageId)

    showAgentEdit(store, agentEditFromChange(change), { agent, pageId })

    // In the order the layers panel lists them: the rewritten heading, then the new card.
    expect(shown.map((steps) => steps.map((step) => step.id))).toEqual([
      [heading.id, card.id, title.id, button.id]
    ])
    const last = shown[0]?.at(-1)?.delay ?? 0
    await Bun.sleep(last + 30)
    const moved = presenceOf(store).agents.value.find((entry) => entry.id === agent.id)
    expect(moved?.status).toBe('editing')
    expect(moved?.selection).toEqual([button.id])
  })

  test('with reduced motion nothing replays and the cursor stays where the edit left it', async () => {
    turnAnimationsOff()
    const { store, pageId, shown } = editor()
    const agent = addAgent(store, 'mcp')
    const { change } = cardEdit(store, pageId)

    showAgentEdit(store, agentEditFromChange(change), { agent, pageId })

    expect(shown).toEqual([])
    await Bun.sleep(60)
    expect(presenceOf(store).agents.value.find((entry) => entry.id === agent.id)?.cursor).toBe(
      undefined
    )
  })

  test('a detached pane no longer replays edits', () => {
    const { store, pageId, shown, detach } = editor()
    detach()
    const { change } = cardEdit(store, pageId)
    showAgentEdit(store, agentEditFromChange(change), { pageId })
    expect(shown).toEqual([])
  })
})

describe("an agent's new layers wait for their reveal", () => {
  test('the outermost new layers are hidden as they are created, their children with them', () => {
    const { store, pageId, held } = editor()
    const hold = holdAgentCreations(store)
    const card = store.graph.createNode('FRAME', pageId, { name: 'Card' })
    const title = store.graph.createNode('TEXT', card.id, { name: 'Title', text: 'Pro' })
    hold.stop()
    const later = store.graph.createNode('FRAME', pageId, { name: 'Later' })
    expect([...held]).toEqual([card.id])
    expect(held.has(title.id)).toBe(false)
    expect(held.has(later.id)).toBe(false)
  })

  test('they show as the reveal plays them in', () => {
    const { store, pageId, held } = editor()
    const finish = store.capturePageChange(pageId)
    const hold = holdAgentCreations(store)
    store.graph.createNode('FRAME', pageId, { name: 'Card' })
    hold.stop()
    expect(held.size).toBe(1)
    showAgentEdit(store, agentEditFromChange(finish()), { pageId })
    expect(held.size).toBe(0)
  })

  test('layers past the reveal limit show at once instead of staying hidden', () => {
    const { store, pageId, shown, held } = editor()
    const finish = store.capturePageChange(pageId)
    const hold = holdAgentCreations(store)
    for (let index = 0; index < MAX_REVEALED_LAYERS + 10; index++)
      store.graph.createNode('RECTANGLE', pageId, { name: `Tile ${index}`, x: index * 10 })
    hold.stop()
    expect(held.size).toBe(MAX_REVEALED_LAYERS + 10)
    showAgentEdit(store, agentEditFromChange(finish()), { pageId })
    expect(shown[0]).toHaveLength(MAX_REVEALED_LAYERS)
    expect(held.size).toBe(0)
  })

  test('one call holds a bounded number of layers', () => {
    const { store, pageId, held } = editor()
    const hold = holdAgentCreations(store)
    for (let index = 0; index < MAX_HELD_LAYERS + 5; index++)
      store.graph.createNode('RECTANGLE', pageId, { name: `Tile ${index}` })
    hold.stop()
    expect(held.size).toBe(MAX_HELD_LAYERS)
  })

  test('a failed call shows everything it held', () => {
    const { store, pageId, held } = editor()
    const hold = holdAgentCreations(store)
    store.graph.createNode('FRAME', pageId, { name: 'Half made' })
    hold.release()
    expect(held.size).toBe(0)
  })

  test('a reveal that fails shows the new layers anyway', () => {
    const { store, pageId, detach } = editor()
    detach()
    const held = new Set<string>()
    attachCanvasScene(store, {
      reveal: () => {
        throw new Error('pane gone')
      },
      hold: (ids) => {
        for (const id of ids) held.add(id)
      },
      release: (ids) => {
        for (const id of ids) held.delete(id)
      }
    })
    const finish = store.capturePageChange(pageId)
    const hold = holdAgentCreations(store)
    store.graph.createNode('FRAME', pageId, { name: 'Card' })
    hold.stop()
    expect(held.size).toBe(1)
    showAgentEdit(store, agentEditFromChange(finish()), { pageId })
    expect(held.size).toBe(0)
  })

  test('with reduced motion, animations off, or Reduce agent animations, nothing is held', () => {
    for (const turnOff of [turnAnimationsOff, reduceAgentAnimations]) {
      turnOff()
      const { store, pageId, shown, held } = editor()
      const hold = holdAgentCreations(store)
      const { change } = cardEdit(store, pageId)
      hold.stop()
      expect(held.size).toBe(0)
      showAgentEdit(store, agentEditFromChange(change), { pageId })
      expect(shown).toEqual([])
    }
  })
})

describe('where the cursor goes', () => {
  const step = (id: string, delay: number): RevealStep => ({
    id,
    kind: 'appear',
    delay,
    duration: 200
  })

  test('it follows the reveal, or else visits touched layers one after another', () => {
    expect(cursorStops([step('a', 0), step('b', 45)], ['x'], { reducedMotion: false })).toEqual([
      { id: 'a', at: 0 },
      { id: 'b', at: 45 }
    ])
    const visits = cursorStops([], ['a', 'b', 'c'], { reducedMotion: false })
    expect(visits.map((stop) => stop.id)).toEqual(['a', 'b', 'c'])
    expect(visits[1]?.at).toBeGreaterThan(0)
  })

  test('a single layer needs no tour, and many are sampled from first to last', () => {
    expect(cursorStops([], ['a'], { reducedMotion: false })).toEqual([])
    const ids = Array.from({ length: 40 }, (_, index) => `n${index}`)
    const stops = cursorStops([], ids, { reducedMotion: false })
    expect(stops).toHaveLength(MAX_CURSOR_STOPS)
    expect(stops[0]?.id).toBe('n0')
    expect(stops.at(-1)?.id).toBe('n39')
  })

  test('reduced motion makes no stops', () => {
    expect(cursorStops([step('a', 0), step('b', 45)], [], { reducedMotion: true })).toEqual([])
  })
})
