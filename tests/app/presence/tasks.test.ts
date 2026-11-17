import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { agentTasks, trackAgentTask } from '@/app/presence/tasks'
import type { AgentPresence } from '@/app/presence/types'

function agent(patch: Partial<AgentPresence> = {}): AgentPresence {
  return { id: 'a', name: 'Fern', kind: 'mcp', status: 'thinking', ...patch }
}

describe('agent tasks', () => {
  test('each status line starts a task, the next ends it, and rest ends the last', () => {
    const graph = new SceneGraph()
    const start = agent()
    const hero = agent({ note: 'Composing the hero' })
    trackAgentTask(graph, start, hero, 1)
    const cursor = { x: 10, y: 20, pageId: 'p' }
    const moved = agent({ note: 'Composing the hero', cursor })
    trackAgentTask(graph, hero, moved, 2)
    const phone = agent({ note: 'Checking the phone layout', cursor })
    trackAgentTask(graph, moved, phone, 3)
    trackAgentTask(graph, phone, agent({ status: 'idle', note: 'Checking the phone layout' }), 4)

    const tasks = agentTasks(graph).value
    expect(tasks.map((task) => [task.text, task.startedAt, task.endedAt])).toEqual([
      ['Checking the phone layout', 3, 4],
      ['Composing the hero', 1, 3]
    ])
    // Where the agent worked during the task, to go back to it.
    expect(tasks[1].place).toEqual(cursor)
  })

  test('a document keeps only its latest tasks', () => {
    const graph = new SceneGraph()
    let before = agent()
    for (let index = 0; index < 40; index++) {
      const after = agent({ note: `Step ${index}` })
      trackAgentTask(graph, before, after, index)
      before = after
    }
    expect(agentTasks(graph).value).toHaveLength(30)
    expect(agentTasks(graph).value[0].text).toBe('Step 39')
  })
})
