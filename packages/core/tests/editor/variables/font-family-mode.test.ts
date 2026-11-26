import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { SceneGraph } from '@kalka/scene-graph'

describe('a font family variable', () => {
  test('changes the text’s family with the mode and loads the new family', async () => {
    const graph = new SceneGraph()
    const requested: string[] = []
    const editor = createEditor({
      graph,
      loadFont: async (family) => {
        requested.push(family)
        return null
      }
    })
    const collection = graph.createCollection('Brand')
    const serif = 'serif-mode'
    graph.addMode(collection.id, serif, 'Serif')
    const family = graph.createVariable('font/heading', 'STRING', collection.id, 'Inter')
    graph.variables.set(family.id, {
      ...family,
      valuesByMode: { ...family.valuesByMode, [serif]: 'Lora' }
    })
    const title = graph.createNode('TEXT', editor.state.currentPageId, {
      text: 'Title',
      fontFamily: 'Inter'
    })
    editor.bindVariable(title.id, 'fontFamily', family.id)
    expect(graph.getNode(title.id)?.fontFamily).toBe('Inter')

    editor.setActiveMode(collection.id, serif)
    expect(graph.getNode(title.id)?.fontFamily).toBe('Lora')
    await Promise.resolve()
    expect(requested).toContain('Lora')

    editor.setActiveMode(collection.id, collection.defaultModeId)
    expect(graph.getNode(title.id)?.fontFamily).toBe('Inter')
  })
})
