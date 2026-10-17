import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  MCP_AGENT_GONE_MS,
  MCP_AGENT_IDLE_MS,
  agentFinished,
  agentStarted,
  endAgentSession,
  readAgentSession,
  restAgents,
  touchedNodeIds,
  type AgentSession
} from '@/app/automation/agents'
import { createEditorStore, type EditorStore } from '@/app/editor/session'
import { presenceOf } from '@/app/presence/registry'

import { expectDefined } from '#tests/helpers/assert'

const claude: AgentSession = { session: 'session-1', kind: 'mcp', client: 'claude-code' }
const pi: AgentSession = { session: 'session-pi', kind: 'harness', client: 'pi' }

let store: EditorStore

beforeEach(() => {
  jest.useFakeTimers()
  store = createEditorStore(new SceneGraph())
})

afterEach(() => {
  endAgentSession(claude.session)
  endAgentSession(pi.session)
  store.preparationController.dispose()
  jest.useRealTimers()
})

function pageId() {
  return expectDefined(store.graph.getPages()[0], 'page').id
}

function agents() {
  return presenceOf(store).agents.value
}

describe('MCP sessions as agents', () => {
  test('a session shows as one agent, named by its client, while its tools run', () => {
    agentStarted(store, claude, pageId())
    agentStarted(store, claude, pageId())
    expect(agents()).toHaveLength(1)
    expect(agents()[0]).toMatchObject({ kind: 'mcp', model: 'claude-code', status: 'thinking' })
  })

  test('the agent points at what a call reads and what it edits', () => {
    const card = store.graph.createNode('FRAME', pageId(), { x: 40, y: 60, width: 100, height: 80 })
    const reply = agentStarted(store, claude, pageId())
    agentFinished(store, claude, {
      pageId: pageId(),
      nodeIds: touchedNodeIds(store, { id: card.id }, { name: 'Card' }),
      edited: false,
      reply
    })
    expect(agents()[0]).toMatchObject({
      status: 'thinking',
      cursor: { x: 40, y: 60, pageId: pageId() },
      selection: [card.id]
    })

    const made = store.graph.createNode('RECTANGLE', pageId(), { x: 200, y: 10 })
    agentFinished(store, claude, {
      pageId: pageId(),
      nodeIds: touchedNodeIds(store, {}, { results: [{ id: made.id }] }),
      edited: true,
      reply
    })
    expect(agents()[0]).toMatchObject({ status: 'editing', selection: [made.id] })
  })

  test('the agent works on the page of the layers it touched', () => {
    const other = store.graph.addPage('Other')
    const node = store.graph.createNode('RECTANGLE', other.id, {})
    const reply = agentStarted(store, claude, pageId())
    agentFinished(store, claude, { pageId: pageId(), nodeIds: [node.id], edited: true, reply })
    expect(agents()[0]).toMatchObject({ pageId: other.id, cursor: { pageId: other.id } })
  })

  test('pages and the document are not layers a call works on', () => {
    const node = store.graph.createNode('RECTANGLE', pageId(), {})
    expect(
      touchedNodeIds(store, { ids: [pageId(), store.graph.rootId, node.id, 'missing'] }, null)
    ).toEqual([node.id])
  })

  test('a quiet session rests, and one that never says goodbye leaves', () => {
    agentStarted(store, claude, pageId())
    jest.advanceTimersByTime(MCP_AGENT_IDLE_MS)
    expect(agents()[0]).toMatchObject({ status: 'idle', cursor: undefined })
    jest.advanceTimersByTime(MCP_AGENT_GONE_MS)
    expect(agents()).toEqual([])
  })

  test('a session that ends takes its agents out of every document', () => {
    const second = createEditorStore(new SceneGraph())
    try {
      agentStarted(store, claude, pageId())
      agentStarted(second, claude, expectDefined(second.graph.getPages()[0], 'page').id)
      endAgentSession(claude.session)
      expect(agents()).toEqual([])
      expect(presenceOf(second).agents.value).toEqual([])
    } finally {
      second.preparationController.dispose()
    }
  })

  test('ACP and harness chats show as their own kinds, and a forwarded session is validated', () => {
    expect(readAgentSession({ session: 'a', kind: 'acp' })).toMatchObject({ kind: 'acp' })
    expect(readAgentSession({ session: 'a', kind: 'harness', client: 'pi' })).toMatchObject({
      kind: 'harness',
      client: 'pi'
    })
    expect(readAgentSession({ session: '', kind: 'mcp' })).toBeNull()
    expect(readAgentSession({ session: 'a', kind: 'chat' })).toBeNull()
    expect(readAgentSession(undefined)).toBeNull()
  })
})

describe("the app's own ACP and Pi chats", () => {
  const status = (session: AgentSession) =>
    agents().find((agent) => agent.kind === session.kind)?.status

  test("when a chat's reply ends, its agent rests at once and outside clients keep working", () => {
    agentStarted(store, pi, pageId())
    agentStarted(store, claude, pageId())

    restAgents('harness')

    expect(status(pi)).toBe('idle')
    expect(status(claude)).toBe('thinking')
  })

  test('a call that was running when the reply ended does not bring the agent back', () => {
    const card = store.graph.createNode('FRAME', pageId(), {})
    const late = agentStarted(store, pi, pageId())
    restAgents('harness')

    agentFinished(store, pi, { pageId: pageId(), nodeIds: [card.id], edited: true, reply: late })
    expect(status(pi)).toBe('idle')

    // The chat's next reply calls a tool, and the earlier call landing then leaves it be.
    const next = agentStarted(store, pi, pageId())
    agentFinished(store, pi, { pageId: pageId(), nodeIds: [card.id], edited: true, reply: late })
    expect(status(pi)).toBe('thinking')
    agentFinished(store, pi, { pageId: pageId(), nodeIds: [card.id], edited: true, reply: next })
    expect(status(pi)).toBe('editing')
  })
})
