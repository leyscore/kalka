import 'fake-indexeddb/auto'
import { afterEach, expect, test } from 'bun:test'

import { addCommentThread, findCommentThread, setCommentAgentState } from '@kalka/scene-graph'

import { settleAgentComments } from '@/app/comments/agent-run'
import { asksBuiltInAgent, mentionSuggestions } from '@/app/comments/service'
import { createEditorStore } from '@/app/editor/session/create'
import { addAgent } from '@/app/presence/registry'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(() => {
  for (const store of stores.splice(0)) store.dispose()
})

function setup() {
  const store = createEditorStore()
  stores.push(store)
  return store
}

test('before it has worked, the document agent is offered as @agent', () => {
  const store = setup()
  expect(mentionSuggestions(store)).toEqual(['agent'])
  expect(asksBuiltInAgent(store, 'agent')).toBe(true)
})

test('once it has a callsign, the document agent is offered and asked by it, once', () => {
  const store = setup()
  const chat = addAgent(store, 'chat')
  const mcp = addAgent(store, 'mcp')
  expect(mentionSuggestions(store)).toEqual([chat.name, mcp.name])
  expect(asksBuiltInAgent(store, chat.name)).toBe(true)
  expect(asksBuiltInAgent(store, 'agent')).toBe(true)
  expect(asksBuiltInAgent(store, mcp.name)).toBe(false)
})

test('a reply asked by callsign is answered under that name', () => {
  const store = setup()
  const chat = addAgent(store, 'chat')
  const anchor = { pageId: store.state.currentPageId, x: 0, y: 0 }
  const thread = addCommentThread(store.graph, anchor, { kind: 'person', name: 'Ada' }, 'hi', {
    agent: chat.name
  })
  setCommentAgentState(store.graph, thread.id, 'working')
  const message = {
    id: 'm',
    role: 'assistant' as const,
    parts: [{ type: 'text' as const, text: 'Done.' }]
  }
  expect(
    settleAgentComments(store.graph, { failed: false, message, agentName: chat.name })
  ).toEqual([thread.id])
  const answer = findCommentThread(store.graph, thread.id)?.messages.at(-1)
  expect(answer?.author).toEqual({ kind: 'agent', name: chat.name })
})
