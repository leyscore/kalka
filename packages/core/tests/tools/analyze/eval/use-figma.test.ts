import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS, FigmaScriptError, type FigmaScriptResult } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = expectDefined(
  ALL_TOOLS.find((candidate) => candidate.name === 'use_figma'),
  'use_figma'
)

function setup() {
  const graph = new SceneGraph()
  return { graph, figma: new FigmaAPI(graph) }
}

async function run(
  figma: FigmaAPI,
  code: string,
  extra: Record<string, unknown> = {}
): Promise<FigmaScriptResult> {
  return (await tool.execute(figma, { code, ...extra })) as FigmaScriptResult
}

/** What the variables script returns. */
interface BindingResult {
  box: string
  bound: unknown
  fill: unknown
  width: number
  modes: string[]
  aliasValue: unknown
  locals: string[]
}

async function failure(figma: FigmaAPI, code: string): Promise<FigmaScriptError> {
  try {
    await tool.execute(figma, { code })
  } catch (error) {
    if (error instanceof FigmaScriptError) return error
    throw error
  }
  throw new Error('The script was expected to fail')
}

describe('use_figma', () => {
  test('is gated like eval and declared as a document edit that runs code', () => {
    expect(tool.availability).toBe('eval')
    expect(tool.capabilities).toContain('code:execute')
    expect(tool.mutates).toBe(true)
  })

  test('builds an auto-layout card with text the way a Figma script does', async () => {
    const { graph, figma } = setup()
    const result = await run(
      figma,
      `
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
      const card = figma.createFrame()
      card.name = 'Card'
      card.layoutMode = 'VERTICAL'
      card.primaryAxisSizingMode = 'AUTO'
      card.counterAxisSizingMode = 'FIXED'
      card.resize(320, 100)
      card.itemSpacing = 12
      card.paddingTop = card.paddingBottom = 24
      card.paddingLeft = card.paddingRight = 16
      card.cornerRadius = 12
      card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
      const title = figma.createText()
      title.fontName = { family: 'Inter', style: 'Bold' }
      title.characters = 'Welcome'
      title.fontSize = 20
      title.lineHeight = { unit: 'PIXELS', value: 28 }
      title.letterSpacing = { unit: 'PERCENT', value: 5 }
      card.appendChild(title)
      title.layoutSizingHorizontal = 'FILL'
      figma.currentPage.appendChild(card)
      return { createdNodeIds: [card.id, title.id], titleWidth: title.width }
      `,
      { fileKey: 'abc123', description: 'Make a card', skillNames: 'figma-use' }
    )

    const [cardId, titleId] = result.createdNodeIds
    // Geometry read in the script is laid out, as in Figma.
    expect(result.result).toEqual({ createdNodeIds: [cardId, titleId], titleWidth: 320 - 32 })
    const card = expectDefined(graph.getNode(cardId), 'card')
    const title = expectDefined(graph.getNode(titleId), 'title')
    expect(card).toMatchObject({
      name: 'Card',
      layoutMode: 'VERTICAL',
      itemSpacing: 12,
      paddingTop: 24,
      paddingLeft: 16,
      cornerRadius: 12,
      width: 320
    })
    expect(card.childIds).toEqual([titleId])
    expect(title).toMatchObject({
      text: 'Welcome',
      fontFamily: 'Inter',
      fontWeight: 700,
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: 1
    })
    expect(result.changedNodeIds).toEqual([])
    expect(result.logs).toEqual([])
  })

  test('creates variables, binds paints and sizes, and switches modes', async () => {
    const { graph, figma } = setup()
    const result = await run(
      figma,
      `
      const colors = figma.variables.createVariableCollection('Colors')
      const light = colors.modes[0].modeId
      colors.renameMode(light, 'Light')
      const dark = colors.addMode('Dark')
      const brand = figma.variables.createVariable('brand', colors, 'COLOR')
      brand.setValueForMode(light, { r: 1, g: 0, b: 0 })
      brand.setValueForMode(dark, { r: 0, g: 0, b: 1, a: 1 })
      const size = figma.variables.createVariable('size', colors.id, 'FLOAT')
      size.setValueForMode(light, 48)
      size.setValueForMode(dark, 64)
      const alias = figma.variables.createVariable('accent', colors, 'COLOR')
      alias.setValueForMode(light, figma.variables.createVariableAlias(brand))

      const box = figma.createRectangle()
      box.fills = [figma.variables.setBoundVariableForPaint(
        { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', brand)]
      box.setBoundVariable('width', size)
      const frame = figma.createFrame()
      frame.appendChild(box)
      frame.setExplicitVariableModeForCollection(colors, dark)
      return {
        box: box.id,
        bound: box.boundVariables,
        fill: box.fills[0],
        width: box.width,
        modes: colors.modes.map((mode) => mode.name),
        aliasValue: alias.valuesByMode[light],
        locals: (await figma.variables.getLocalVariablesAsync('COLOR')).map((v) => v.name)
      }
      `
    )

    const value = result.result as BindingResult
    const variables = [...graph.variables.values()]
    const brand = expectDefined(
      variables.find((variable) => variable.name === 'brand'),
      'brand'
    )
    const size = expectDefined(
      variables.find((variable) => variable.name === 'size'),
      'size'
    )
    expect(value.modes).toEqual(['Light', 'Dark'])
    expect(value.bound).toEqual({
      width: { type: 'VARIABLE_ALIAS', id: size.id },
      fills: [{ type: 'VARIABLE_ALIAS', id: brand.id }]
    })
    expect(value.fill).toMatchObject({
      type: 'SOLID',
      color: { r: 0, g: 0, b: 1 },
      boundVariables: { color: { type: 'VARIABLE_ALIAS', id: brand.id } }
    })
    expect(value.width).toBe(64)
    expect(value.aliasValue).toEqual({ type: 'VARIABLE_ALIAS', id: brand.id })
    expect(value.locals).toEqual(['brand', 'accent'])
    const box = expectDefined(graph.getNode(value.box), 'box')
    expect(box.boundVariables).toEqual({ 'fills/0/color': brand.id, width: size.id })
    expect(box.fills[0]).not.toHaveProperty('boundVariables')
  })

  test('assigning plain paints unbinds them, as in Figma', async () => {
    const { graph, figma } = setup()
    const result = await run(
      figma,
      `
      const collection = figma.variables.createVariableCollection('Colors')
      const brand = figma.variables.createVariable('brand', collection, 'COLOR')
      brand.setValueForMode(collection.defaultModeId, { r: 0, g: 1, b: 0 })
      const box = figma.createRectangle()
      box.fills = [figma.variables.setBoundVariableForPaint(box.fills[0], 'color', brand)]
      const kept = box.fills
      box.fills = kept
      const stillBound = Object.keys(box.boundVariables)
      box.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 0 } }]
      return { id: box.id, stillBound }
      `
    )
    const value = result.result as { id: string; stillBound: string[] }
    expect(value.stillBound).toEqual(['fills'])
    expect(expectDefined(graph.getNode(value.id), 'box').boundVariables).toEqual({})
  })

  test('finds and edits existing layers, reporting what changed', async () => {
    const { graph, figma } = setup()
    const page = expectDefined(graph.getPages()[0], 'page')
    const header = graph.createNode('FRAME', page.id, { name: 'Header' })
    const label = graph.createNode('TEXT', header.id, { name: 'Label', text: 'Old' })
    const other = graph.createNode('RECTANGLE', page.id, { name: 'Other' })

    const result = await run(
      figma,
      `
      const header = figma.currentPage.findOne((node) => node.name === 'Header')
      const texts = header.findAllWithCriteria({ types: ['TEXT'] })
      await figma.loadFontAsync(texts[0].fontName)
      texts[0].characters = 'New'
      figma.currentPage.selection = [header]
      return {
        header,
        texts: texts.map((node) => node.id),
        selection: figma.currentPage.selection.map((node) => node.id),
        all: figma.currentPage.findAll().length
      }
      `
    )

    expect(result.result).toEqual({
      header: { id: header.id, type: 'FRAME', name: 'Header' },
      texts: [label.id],
      selection: [header.id],
      all: 3
    })
    expect(graph.getNode(label.id)?.text).toBe('New')
    expect(result.changedNodeIds).toContain(label.id)
    expect(result.changedNodeIds).not.toContain(other.id)
    expect(result.createdNodeIds).toEqual([])
  })

  test('reports removed layers', async () => {
    const { graph, figma } = setup()
    const page = expectDefined(graph.getPages()[0], 'page')
    const doomed = graph.createNode('RECTANGLE', page.id, { name: 'Doomed' })
    const result = await run(figma, `figma.getNodeById('${doomed.id}').remove()`)
    expect(result.removedNodeIds).toEqual([doomed.id])
    expect(graph.getNode(doomed.id)).toBeUndefined()
  })

  test('switches pages with setCurrentPageAsync and reads styled text segments', async () => {
    const { graph, figma } = setup()
    const second = graph.addPage('Second')
    const text = graph.createNode('TEXT', second.id, {
      name: 'Mixed',
      text: 'Hello world',
      fontFamily: 'Inter',
      fontWeight: 400,
      styleRuns: [{ start: 6, length: 5, style: { fontWeight: 700 } }]
    })

    const result = await run(
      figma,
      `
      await figma.loadAllPagesAsync()
      const page = figma.root.children.find((p) => p.name === 'Second')
      await figma.setCurrentPageAsync(page)
      const text = figma.currentPage.findOne((node) => node.type === 'TEXT')
      const segments = text.getStyledTextSegments(['fontName'])
      for (const segment of segments) await figma.loadFontAsync(segment.fontName)
      return { page: figma.currentPage.id, segments }
      `
    )

    expect(result.result).toEqual({
      page: second.id,
      segments: [
        { characters: 'Hello ', start: 0, end: 6, fontName: { family: 'Inter', style: 'Regular' } },
        { characters: 'world', start: 6, end: 11, fontName: { family: 'Inter', style: 'Bold' } }
      ]
    })
    expect(graph.getNode(text.id)?.text).toBe('Hello world')
  })

  test('keeps console output and notify messages and serializes what JSON cannot hold', async () => {
    const { figma } = setup()
    const result = await run(
      figma,
      `
      console.log('made', 2, { ok: true })
      console.warn('careful')
      figma.notify('Done')
      return { mixed: figma.mixed, skip: undefined, bytes: new Uint8Array([1, 2, 3]), n: NaN }
      `
    )
    expect(result.logs).toEqual([
      { level: 'log', message: 'made 2 {"ok":true}' },
      { level: 'warn', message: 'careful' },
      { level: 'info', message: 'figma.notify: Done' }
    ])
    expect(result.result).toEqual({ mixed: 'figma.mixed', bytes: 'AQID', n: 'NaN' })
  })

  test('a script without a return value returns null', async () => {
    const { figma } = setup()
    const result = await run(figma, `const frame = figma.createFrame(); frame.resize(10, 10)`)
    expect(result.result).toBeNull()
    expect(result.createdNodeIds).toHaveLength(1)
  })

  test('names a Plugin API member Kalka lacks, and the script is safe to retry', async () => {
    const { figma } = setup()
    const error = await failure(
      figma,
      `return await figma.createNodeFromJSXAsync(figma.widget.h('AutoLayout', {}))`
    )
    expect(error.message).toContain(
      'TypeError: figma.createNodeFromJSXAsync is not supported in Kalka'
    )
    expect(error.message).toContain('safeToRetryWithoutCanvasRead: true')
    expect(error.safeToRetryWithoutCanvasRead).toBe(true)
  })

  test('reports what a failing script changed before it threw', async () => {
    const { graph, figma } = setup()
    const error = await failure(
      figma,
      `
      const frame = figma.createFrame()
      frame.name = 'Half done'
      console.log('before the failure')
      figma.createPaintStyle()
      `
    )
    const created = error.changes.createdNodeIds
    expect(created).toHaveLength(1)
    expect(graph.getNode(created[0])?.name).toBe('Half done')
    expect(error.safeToRetryWithoutCanvasRead).toBe(false)
    expect(error.message).toContain('figma.createPaintStyle is not supported in Kalka')
    expect(error.message).toContain('safeToRetryWithoutCanvasRead: false')
    expect(error.message).toContain(`createdNodeIds: ["${created[0]}"]`)
    expect(error.message).toContain('[log] before the failure')
  })

  test('reports syntax errors and errors the script throws', async () => {
    const { figma } = setup()
    expect((await failure(figma, 'const = 1')).message).toContain('SyntaxError')
    const thrown = await failure(figma, `throw new Error('Nothing selected')`)
    expect(thrown.message).toContain('The script failed: Error: Nothing selected')
  })

  test('rejects variable values of the wrong type, as Figma does', async () => {
    const { figma } = setup()
    const error = await failure(
      figma,
      `
      const collection = figma.variables.createVariableCollection('Sizes')
      const size = figma.variables.createVariable('size', collection, 'FLOAT')
      size.setValueForMode(collection.defaultModeId, 'large')
      `
    )
    expect(error.message).toContain('Mismatched variable resolved type')
  })

  test('rejects arguments Figma does not take', () => {
    const { figma } = setup()
    expect(() => tool.execute(figma, { code: 'return 1', nodeId: '1:2' })).toThrow(
      'Invalid arguments for use_figma'
    )
    expect(() => tool.execute(figma, { code: '' })).toThrow('Invalid arguments for use_figma')
  })
})
