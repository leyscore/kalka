import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import { toRaw } from 'vue'

import { SceneGraph } from '@kalka/scene-graph'
import { MAX_REVEALED_LAYERS, type RevealStep } from '@kalka/vue'

import { createEditorStore } from '@/app/editor/session'
import { attachCanvasScene } from '@/app/presence/canvas-scene'
import {
  agentEditFromChange,
  holdAgentCreations,
  MAX_HELD_LAYERS,
  MAX_REVEAL_QUEUE_MS,
  paintersOrder,
  showAgentEdit,
  PAINT_LEAD_MS,
  stopAgentReveals
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
    },
    settled: true
  })
  return { store, pageId, shown, held, detach }
}

/** Builds a card the way a tool would, and what the edit changed. */
function cardEdit(store: ReturnType<typeof editor>['store'], pageId: string) {
  const heading = store.graph.createNode('TEXT', pageId, { name: 'Heading', text: 'Old' })
  const finish = store.captureDocumentChange(pageId)
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

  test('the canvas replays it block by block, each after a short lead', () => {
    const { store, pageId, shown } = editor()
    const agent = addAgent(store, 'mcp')
    const { change, card, title, button } = cardEdit(store, pageId)

    showAgentEdit(store, agentEditFromChange(change), { agent })

    // Block by block: the card's title and button show with it rather than on their own.
    expect(shown.map((steps) => steps.map((step) => [step.id, step.kind]))).toEqual([
      [[card.id, 'appear']]
    ])
    expect(shown.flat().map((step) => step.id)).not.toContain(title.id)
    expect(shown.flat().map((step) => step.id)).not.toContain(button.id)
    expect(shown[0]?.[0]?.delay).toBe(PAINT_LEAD_MS)
    stopAgentReveals(agent)
  })

  test("a frame's background shows before the blocks it holds start to load", () => {
    const { store, pageId, shown } = editor()
    const agent = addAgent(store, 'mcp')
    const finish = store.captureDocumentChange(pageId)
    const page = store.graph.createNode('FRAME', pageId, { name: 'Page', width: 800, height: 600 })
    const row = store.graph.createNode('FRAME', page.id, { name: 'Cards', width: 760, height: 200 })
    const cards = ['A', 'B', 'C'].map((name) => {
      const card = store.graph.createNode('FRAME', row.id, { name, width: 200, height: 200 })
      store.graph.createNode('TEXT', card.id, { name: `${name} title`, text: name })
      return card
    })
    showAgentEdit(store, agentEditFromChange(finish()), { agent })

    const contentOf = (id: string) => shown[0]?.find((step) => step.id === id)?.delay ?? Infinity
    // The page shows first, then the row on it, then the cards on the row.
    expect(contentOf(row.id)).toBeGreaterThan(contentOf(page.id))
    for (const card of cards) expect(contentOf(card.id)).toBeGreaterThan(contentOf(row.id))
    // The cards still come one after another.
    const starts = cards.map((card) => contentOf(card.id))
    expect(starts).toEqual([...starts].sort((a, b) => a - b))
    stopAgentReveals(agent)
  })

  test('blocks beside each other keep their planned turns', () => {
    const { store, pageId } = editor()
    const a = store.graph.createNode('FRAME', pageId, { name: 'A' })
    const b = store.graph.createNode('FRAME', pageId, { name: 'B' })
    const steps = [
      { id: a.id, kind: 'appear' as const, delay: 0, duration: 300 },
      { id: b.id, kind: 'appear' as const, delay: 110, duration: 300 }
    ]
    expect(paintersOrder(store.graph, steps).map((step) => step.delay)).toEqual([0, 110])
  })

  test("an agent's next edit replays after the one before, never over it", () => {
    const { store, pageId, shown } = editor()
    const agent = addAgent(store, 'mcp')
    showAgentEdit(store, agentEditFromChange(cardEdit(store, pageId).change), { agent })
    showAgentEdit(store, agentEditFromChange(cardEdit(store, pageId).change), { agent })

    const [before = [], after = []] = shown
    const end = Math.max(...before.map((step) => step.delay + step.duration))
    const start = Math.min(...after.map((step) => step.delay))
    // Measured from the second edit, which came a moment after the first.
    expect(start).toBeGreaterThan(Math.min(end, MAX_REVEAL_QUEUE_MS) - 50)
    stopAgentReveals(agent)
  })

  test('another agent does not wait for it', () => {
    const { store, pageId, shown } = editor()
    const first = addAgent(store, 'mcp')
    const second = addAgent(store, 'mcp')
    showAgentEdit(store, agentEditFromChange(cardEdit(store, pageId).change), { agent: first })
    showAgentEdit(store, agentEditFromChange(cardEdit(store, pageId).change), { agent: second })
    expect(shown[1]?.[0]?.delay).toBe(PAINT_LEAD_MS)
    stopAgentReveals(first)
    stopAgentReveals(second)
  })

  test('with reduced motion nothing replays and the cursor stays where the edit left it', async () => {
    turnAnimationsOff()
    const { store, pageId, shown } = editor()
    const agent = addAgent(store, 'mcp')
    const { change } = cardEdit(store, pageId)

    showAgentEdit(store, agentEditFromChange(change), { agent })

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
    showAgentEdit(store, agentEditFromChange(change), {})
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
    const finish = store.captureDocumentChange(pageId)
    const hold = holdAgentCreations(store)
    store.graph.createNode('FRAME', pageId, { name: 'Card' })
    hold.stop()
    expect(held.size).toBe(1)
    showAgentEdit(store, agentEditFromChange(finish()), {})
    expect(held.size).toBe(0)
  })

  test('layers past the reveal limit show at once instead of staying hidden', () => {
    const { store, pageId, shown, held } = editor()
    const finish = store.captureDocumentChange(pageId)
    const hold = holdAgentCreations(store)
    for (let index = 0; index < MAX_REVEALED_LAYERS + 10; index++)
      store.graph.createNode('RECTANGLE', pageId, { name: `Tile ${index}`, x: index * 10 })
    hold.stop()
    expect(held.size).toBe(MAX_REVEALED_LAYERS + 10)
    showAgentEdit(store, agentEditFromChange(finish()), {})
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
      },
      settled: true
    })
    const finish = store.captureDocumentChange(pageId)
    const hold = holdAgentCreations(store)
    store.graph.createNode('FRAME', pageId, { name: 'Card' })
    hold.stop()
    expect(held.size).toBe(1)
    showAgentEdit(store, agentEditFromChange(finish()), {})
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
      showAgentEdit(store, agentEditFromChange(change), {})
      expect(shown).toEqual([])
    }
  })
})
