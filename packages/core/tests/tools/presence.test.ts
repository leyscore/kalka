import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { CORE_TOOLS, finishWorkingOnNodes, isToolExposed } from '@kalka/core/tools'
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
