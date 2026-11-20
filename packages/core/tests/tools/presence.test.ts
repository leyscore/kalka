import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { askUser, CORE_TOOLS, finishWorkingOnNodes, isToolExposed } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

describe('finish_working_on_nodes', () => {
  test('hands the layers to the host, or null to release everything', () => {
    const figma = new FigmaAPI(new SceneGraph())
    const calls: (string[] | null)[] = []
    figma.finishWorking = (ids) => {
      calls.push(ids)
      return ids ?? ['all']
    }
    expect(finishWorkingOnNodes.execute(figma, { node_ids: ['1:2'] })).toEqual({
      released: ['1:2']
    })
    expect(finishWorkingOnNodes.execute(figma, {})).toEqual({ released: ['all'] })
    expect(finishWorkingOnNodes.execute(figma, { node_ids: [] })).toEqual({ released: ['all'] })
    expect(calls).toEqual([['1:2'], null, null])
  })

  test('says so in a host that shows no working marks, such as the CLI', () => {
    const result = finishWorkingOnNodes.execute(new FigmaAPI(new SceneGraph()), {})
    expect(result).toMatchObject({ released: [] })
  })

  test('is a default tool for MCP and the chat, and changes nothing', () => {
    expect(CORE_TOOLS).toContain(finishWorkingOnNodes)
    expect(isToolExposed(finishWorkingOnNodes, 'mcp')).toBe(true)
    expect(isToolExposed(finishWorkingOnNodes, 'ai')).toBe(true)
    expect(finishWorkingOnNodes.mutates).toBe(false)
  })
})

describe('ask_user', () => {
  const questions = [
    { question: 'What is the shop called?', placeholder: 'Name' },
    { question: 'Which sections?', options: ['Menu', 'Hours', 'Shop'], multiple: true }
  ]

  test('hands the questions to the host and returns the answers', async () => {
    const figma = new FigmaAPI(new SceneGraph())
    const asked: unknown[] = []
    figma.askUser = (sent) => {
      asked.push(sent)
      return Promise.resolve([
        { question: 'What is the shop called?', answer: 'Grain' },
        { question: 'Which sections?', answer: 'Menu, Hours' }
      ])
    }
    expect(await askUser.execute(figma, { questions })).toEqual({
      answers: [
        { question: 'What is the shop called?', answer: 'Grain' },
        { question: 'Which sections?', answer: 'Menu, Hours' }
      ]
    })
    expect(asked).toEqual([questions])
  })

  test('tells the agent to decide when the person skips', async () => {
    const figma = new FigmaAPI(new SceneGraph())
    figma.askUser = () => Promise.resolve(null)
    expect(await askUser.execute(figma, { questions })).toMatchObject({ answers: null })
  })

  test('asks in the reply in a host with no person to ask, such as the CLI', async () => {
    const result = await askUser.execute(new FigmaAPI(new SceneGraph()), { questions })
    expect(result).toMatchObject({ answers: null })
    expect(JSON.stringify(result)).toContain('ask in your reply')
  })

  test('is a default tool for MCP and the chat, and changes nothing', () => {
    expect(CORE_TOOLS).toContain(askUser)
    expect(isToolExposed(askUser, 'mcp')).toBe(true)
    expect(isToolExposed(askUser, 'ai')).toBe(true)
    expect(askUser.mutates).toBe(false)
  })
})
