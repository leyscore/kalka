import { describe, expect, test } from 'bun:test'

import type { SessionUpdate } from '@agentclientprotocol/sdk'

import type { ACPAgentDef } from '@kalka/core/constants'

import { createUpdateMapper } from '@/app/ai/acp/map-update'
import { formatConnectionError } from '@/app/ai/acp/transport'

const text = (t: string): SessionUpdate => ({
  sessionUpdate: 'agent_message_chunk',
  content: { type: 'text', text: t }
})
const thought = (t: string): SessionUpdate => ({
  sessionUpdate: 'agent_thought_chunk',
  content: { type: 'text', text: t }
})
const toolCall = (id: string): SessionUpdate => ({
  sessionUpdate: 'tool_call',
  toolCallId: id,
  title: 'create_shape',
  kind: 'edit',
  status: 'pending'
})

describe('createUpdateMapper', () => {
  test('a run of text chunks is one text part', () => {
    const mapper = createUpdateMapper('p')
    expect([
      ...mapper.map(text('Hello ')),
      ...mapper.map(text('world')),
      ...mapper.close()
    ]).toEqual([
      { type: 'text-start', id: 'text-p-1' },
      { type: 'text-delta', id: 'text-p-1', delta: 'Hello ' },
      { type: 'text-delta', id: 'text-p-1', delta: 'world' },
      { type: 'text-end', id: 'text-p-1' }
    ])
  })

  test('a run of thought chunks is one reasoning part', () => {
    const mapper = createUpdateMapper('p')
    const chunks = [
      ...mapper.map(thought('Look')),
      ...mapper.map(thought('ing')),
      ...mapper.close()
    ]
    expect(chunks.map((c) => c.type)).toEqual([
      'reasoning-start',
      'reasoning-delta',
      'reasoning-delta',
      'reasoning-end'
    ])
  })

  test('text, thought, tool call and text again keep their order as separate parts', () => {
    const mapper = createUpdateMapper('p')
    const chunks = [
      ...mapper.map(text('First.')),
      ...mapper.map(thought('Plan')),
      ...mapper.map(toolCall('tc-1')),
      ...mapper.map(text('Second.')),
      ...mapper.close()
    ]
    expect(chunks).toEqual([
      { type: 'text-start', id: 'text-p-1' },
      { type: 'text-delta', id: 'text-p-1', delta: 'First.' },
      { type: 'text-end', id: 'text-p-1' },
      { type: 'reasoning-start', id: 'reasoning-p-2' },
      { type: 'reasoning-delta', id: 'reasoning-p-2', delta: 'Plan' },
      { type: 'reasoning-end', id: 'reasoning-p-2' },
      {
        type: 'tool-input-start',
        toolCallId: 'tc-1',
        toolName: 'create_shape',
        providerExecuted: true,
        title: 'create_shape'
      },
      { type: 'text-start', id: 'text-p-3' },
      { type: 'text-delta', id: 'text-p-3', delta: 'Second.' },
      { type: 'text-end', id: 'text-p-3' }
    ])
  })

  test('empty text and thoughts open no part', () => {
    const mapper = createUpdateMapper('p')
    expect([...mapper.map(text('')), ...mapper.map(thought('')), ...mapper.close()]).toEqual([])
  })

  test('tool_call with rawInput emits tool-input-available', () => {
    const mapper = createUpdateMapper('p')
    const chunks = mapper.map({
      sessionUpdate: 'tool_call',
      toolCallId: 'tc-2',
      title: 'set_fill',
      kind: 'edit',
      status: 'pending',
      rawInput: { id: '1:2', color: '#ff0000' }
    })
    expect(chunks[1]).toEqual({
      type: 'tool-input-available',
      toolCallId: 'tc-2',
      toolName: 'set_fill',
      input: { id: '1:2', color: '#ff0000' },
      providerExecuted: true,
      title: 'set_fill'
    })
  })

  test('tool_call with empty title falls back to "unknown"', () => {
    const mapper = createUpdateMapper('p')
    const chunks = mapper.map({
      sessionUpdate: 'tool_call',
      toolCallId: 'tc-3',
      title: '',
      kind: 'other',
      status: 'pending'
    })
    expect(chunks[0]).toMatchObject({ toolName: 'unknown' })
  })

  test('tool_call_update completed emits tool-output-available', () => {
    const mapper = createUpdateMapper('p')
    expect(
      mapper.map({
        sessionUpdate: 'tool_call_update',
        toolCallId: 'tc-1',
        status: 'completed',
        rawOutput: { id: '1:5', type: 'RECTANGLE' }
      })
    ).toEqual([
      {
        type: 'tool-output-available',
        toolCallId: 'tc-1',
        output: { id: '1:5', type: 'RECTANGLE' },
        providerExecuted: true
      }
    ])
  })

  test('tool_call_update failed emits tool-output-error', () => {
    const mapper = createUpdateMapper('p')
    expect(
      mapper.map({
        sessionUpdate: 'tool_call_update',
        toolCallId: 'tc-1',
        status: 'failed',
        content: [{ type: 'content', content: { type: 'text', text: 'Node not found' } }]
      })
    ).toEqual([
      {
        type: 'tool-output-error',
        toolCallId: 'tc-1',
        errorText: 'Node not found',
        providerExecuted: true
      }
    ])
  })

  test('non-text content and unhandled updates produce no chunks', () => {
    const mapper = createUpdateMapper('p')
    expect(
      mapper.map({
        sessionUpdate: 'agent_message_chunk',
        content: {
          type: 'image',
          mimeType: 'image/png',
          data: '',
          uri: 'https://example.com/i.png'
        }
      })
    ).toEqual([])
    expect(
      mapper.map({ sessionUpdate: 'available_commands_update', availableCommands: [] })
    ).toEqual([])
  })
})

describe('formatConnectionError', () => {
  const claudeAgent: ACPAgentDef = {
    id: 'claude-code',
    name: 'Claude Code',
    command: 'claude-agent-acp',
    args: [],
    installCommand: 'npm i -g @agentclientprotocol/claude-agent-acp'
  }

  test('ECONNREFUSED maps to MCP not running', () => {
    const msg = formatConnectionError(new Error('connect ECONNREFUSED 127.0.0.1:7600'))
    expect(msg).toBe('MCP server is not running. Make sure the editor is open.')
  })

  test('fetch failed maps to MCP not running', () => {
    const msg = formatConnectionError(new Error('fetch failed'))
    expect(msg).toBe('MCP server is not running. Make sure the editor is open.')
  })

  test('timeout maps to timeout message', () => {
    const msg = formatConnectionError(new Error('Request timeout after 30s'))
    expect(msg).toBe('MCP server did not respond in time.')
  })

  test('ENOENT maps to install instructions', () => {
    const msg = formatConnectionError(new Error('spawn claude-agent-acp ENOENT'), claudeAgent)
    expect(msg).toBe(
      '"claude-agent-acp" is not installed. Install it with: npm i -g @agentclientprotocol/claude-agent-acp'
    )
  })

  test('other errors pass through', () => {
    const msg = formatConnectionError(new Error('Something unexpected'))
    expect(msg).toBe('Something unexpected')
  })

  test('non-Error values converted to string', () => {
    const msg = formatConnectionError('raw string error')
    expect(msg).toBe('raw string error')
  })

  test('a JSON-RPC error object from the agent keeps its message', () => {
    const msg = formatConnectionError({
      code: -32000,
      message: 'Failed to authenticate: OAuth session expired and could not be refreshed'
    })
    expect(msg).toBe('Failed to authenticate: OAuth session expired and could not be refreshed')
  })
})
