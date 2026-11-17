import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  noteAgentLook,
  noteAgentStatus,
  noteAgentWrites,
  reviewReminder,
  statusReminder
} from '@/app/automation/review'

function page() {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const hero = graph.createNode('FRAME', pageId, { name: 'Landing' })
  const title = graph.createNode('TEXT', hero.id, { name: 'Title', text: 'Hi' })
  const other = graph.createNode('FRAME', pageId, { name: 'Phone' })
  return { graph, pageId, hero, title, other }
}

describe('agent visual review', () => {
  test('a write names the artboard it changed until the agent looks at it', () => {
    const { graph, hero, title } = page()
    noteAgentWrites(graph, 'agent-1', [title.id])
    expect(reviewReminder(graph, 'agent-1')).toContain(hero.id)
    // Another agent's writes are its own business.
    expect(reviewReminder(graph, 'agent-2')).toBeNull()

    noteAgentLook(graph, 'agent-1', 'get_screenshot', { id: title.id }, graph.getPages()[0].id)
    expect(reviewReminder(graph, 'agent-1')).toBeNull()
  })

  test('a look at the page covers every artboard on it; reading the tree covers none', () => {
    const { graph, pageId, hero, other } = page()
    noteAgentWrites(graph, 'agent-1', [hero.id, other.id])
    noteAgentLook(graph, 'agent-1', 'get_page_tree', {}, pageId)
    expect(reviewReminder(graph, 'agent-1')).toContain(other.id)
    noteAgentLook(graph, 'agent-1', 'get_screenshot', {}, pageId)
    expect(reviewReminder(graph, 'agent-1')).toBeNull()
  })

  test('a deleted artboard needs no look', () => {
    const { graph, other } = page()
    noteAgentWrites(graph, 'agent-1', [other.id])
    graph.deleteNode(other.id)
    expect(reviewReminder(graph, 'agent-1')).toBeNull()
  })
})

describe('agent status nudge', () => {
  test('asks a session to say what it does until it calls set_status with some text', () => {
    expect(statusReminder('quiet-agent')).toContain('set_status')
    noteAgentStatus('quiet-agent', 'set_status', { text: '  ' })
    expect(statusReminder('quiet-agent')).not.toBeNull()
    noteAgentStatus('quiet-agent', 'set_status', { text: 'Composing the hero' })
    expect(statusReminder('quiet-agent')).toBeNull()
  })
})
