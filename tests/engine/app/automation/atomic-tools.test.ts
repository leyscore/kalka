import { describe, expect, test } from 'bun:test'

import { createEditor } from '@open-pencil/core/editor'
import { FigmaAPI } from '@open-pencil/core/figma-api'
import { ALL_TOOLS, type ToolDef } from '@open-pencil/core/tools'
import { SceneGraph } from '@open-pencil/scene-graph'
import { UndoManager } from '@open-pencil/scene-graph/undo'

import { executeAtomicTool } from '@/app/automation/execution/atomic'

function setup() {
  const graph = new SceneGraph()
  const undo = new UndoManager()
  const figma = new FigmaAPI(graph)
  const editor = {
    graph,
    runLayoutForNode: () => undefined,
    requestRender: () => undefined,
    pushUndoEntry: undo.push.bind(undo)
  }
  const rectangle = figma.createRectangle()
  const tool = (name: string): ToolDef => {
    const def = ALL_TOOLS.find((candidate) => candidate.name === name)
    if (!def) throw new Error(`Missing ${name}`)
    return def
  }
  return { graph, figma, editor, undo, rectangle, tool }
}

describe('atomic agent tools', () => {
  test('component edits and undo propagate through the editor synchronizer', async () => {
    const editor = createEditor()
    const figma = new FigmaAPI(editor.graph)
    const component = figma.createComponent()
    const instance = component.createInstance()
    await Promise.resolve()
    const def = ALL_TOOLS.find((tool) => tool.name === 'set_opacity')
    if (!def) throw new Error('Missing set_opacity')
    executeAtomicTool(editor, figma, def, { id: component.id, value: 0.5 })
    await Promise.resolve()
    expect(instance.opacity).toBe(0.5)
    editor.undo.undo()
    await Promise.resolve()
    expect(component.opacity).toBe(1)
    expect(instance.opacity).toBe(1)
    editor.undo.redo()
    await Promise.resolve()
    expect(instance.opacity).toBe(0.5)
  })

  test('undo targets the original page and keeps unrelated later changes', () => {
    const { figma, editor, undo, rectangle, tool } = setup()
    const pageId = figma.currentPage.id
    executeAtomicTool(editor, figma, tool('set_opacity'), { id: rectangle.id, value: 0.5 })
    const another = figma.createPage()
    figma.currentPage = another
    rectangle.name = 'Later name'
    undo.undo()
    expect(rectangle.opacity).toBe(1)
    expect(rectangle.name).toBe('Later name')
    expect(rectangle.parent?.id).toBe(pageId)
    expect(figma.currentPage.id).toBe(another.id)
    undo.redo()
    expect(rectangle.opacity).toBe(0.5)
  })

  test('variable values and bound nodes are undoable across pages', () => {
    const { figma, editor, undo, rectangle, tool } = setup()
    const collection = figma.createVariableCollection('Colors')
    const variable = figma.createVariable('Brand', 'COLOR', collection.id, {
      r: 1,
      g: 0,
      b: 0,
      a: 1
    })
    tool('set_fill').execute(figma, { id: rectangle.id, color: '#ff0000' })
    figma.bindVariable(rectangle.id, 'fills/0/color', variable.id)
    const page = figma.createPage()
    figma.currentPage = page
    executeAtomicTool(editor, figma, tool('set_variable'), {
      id: variable.id,
      mode: collection.defaultModeId,
      value: '#00ff00'
    })
    expect(
      figma.getVariableById(variable.id)?.valuesByMode[collection.defaultModeId]
    ).toMatchObject({ g: 1 })
    undo.undo()
    expect(
      figma.getVariableById(variable.id)?.valuesByMode[collection.defaultModeId]
    ).toMatchObject({ r: 1, g: 0 })
    undo.redo()
    expect(
      figma.getVariableById(variable.id)?.valuesByMode[collection.defaultModeId]
    ).toMatchObject({ r: 0, g: 1 })
  })

  test('partial failures roll back without adding history', () => {
    const { figma, editor, undo, rectangle } = setup()
    const def: ToolDef = {
      name: 'set_opacity',
      params: {},
      description: 'failure seam',
      mutates: true,
      execute: () => {
        rectangle.opacity = 0.25
        throw new Error('Failed')
      }
    }
    expect(() => executeAtomicTool(editor, figma, def, {})).toThrow('Failed')
    expect(rectangle.opacity).toBe(1)
    expect(undo.canUndo).toBe(false)
  })

  test('error results roll back; no-op operations do not create history', () => {
    const { figma, editor, undo, rectangle, tool } = setup()
    executeAtomicTool(editor, figma, tool('set_opacity'), { id: rectangle.id, value: 1 })
    expect(undo.canUndo).toBe(false)
    expect(() =>
      executeAtomicTool(editor, figma, tool('set_opacity'), { id: 'missing', value: 0 })
    ).toThrow()
    expect(undo.canUndo).toBe(false)
  })

  test('aborted and closed/replaced targets are rejected before mutation', () => {
    const { figma, editor, rectangle, tool } = setup()
    const signal = AbortSignal.abort()
    const args = { id: rectangle.id, value: 0.5 }
    expect(() => executeAtomicTool(editor, figma, tool('set_opacity'), args, { signal })).toThrow()
    expect(() =>
      executeAtomicTool(editor, figma, tool('set_opacity'), args, { isLive: () => false })
    ).toThrow('no longer open')
    editor.graph = new SceneGraph()
    expect(() => executeAtomicTool(editor, figma, tool('set_opacity'), args)).toThrow(
      'no longer open'
    )
    expect(rectangle.opacity).toBe(1)
  })

  test('back-to-back calls produce separate undo entries', async () => {
    const { figma, editor, undo, rectangle, tool } = setup()
    await Promise.all(
      [0.5, 0.25].map(async (value) =>
        executeAtomicTool(editor, figma, tool('set_opacity'), { id: rectangle.id, value })
      )
    )
    expect(rectangle.opacity).toBe(0.25)
    undo.undo()
    expect(rectangle.opacity).toBe(0.5)
    undo.undo()
    expect(rectangle.opacity).toBe(1)
  })
})
