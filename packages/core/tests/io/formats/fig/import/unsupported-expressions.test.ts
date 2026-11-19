import { expect, test } from 'bun:test'

import { deflateSync } from 'fflate'

import { compressFigDataSync, parseFigBuffer } from '@kalka/fig'
import { getCompiledSchema, getSchemaBytes } from '@kalka/kiwi/fig/codec'
import { guidToString, stringToGuid } from '@kalka/kiwi/fig/guid'
import { SceneGraph } from '@kalka/scene-graph'

import { exportFigFile } from '#core/io/formats/fig/export'
import { parseFigFile, parseFigFileViaWorker } from '#core/io/formats/fig/read'
import { releaseFigPopulationWorker } from '#core/kiwi/fig/population/client'
import { populateFigPage } from '#core/kiwi/fig/session/document-state'

/**
 * A file whose `Gap` variable is `VAR_MODE_LOOKUP` over a mode of `Lookup` and that collection's
 * `Compact` variable, with a 91px rectangle bound to it on each of two pages.
 */
async function figWithLookup() {
  const source = new SceneGraph()
  const collection = source.createCollection('Theme')
  const lookup = source.createCollection('Lookup')
  const compact = source.createVariable('Compact', 'FLOAT', lookup.id, 8)
  const gap = source.createVariable('Gap', 'FLOAT', collection.id, 24)
  for (const page of [source.getPages()[0], source.createNode('CANVAS', source.rootId)])
    source.createNode('RECTANGLE', page.id, {
      width: 91,
      height: 70,
      boundVariables: { width: gap.id }
    })
  const decoded = parseFigBuffer((await exportFigFile(source)).slice().buffer)
  const record = (id: string) =>
    decoded.nodeChanges.find((node) => node.guid && guidToString(node.guid) === id)
  const entry = record(gap.id)?.variableDataValues?.entries?.[0]
  const target = record(compact.id)?.guid
  if (!entry || !target) throw new Error('Missing synthetic variables')
  entry.variableData = {
    dataType: 'EXPRESSION',
    resolvedDataType: 'FLOAT',
    value: {
      expressionValue: {
        expressionFunction: 'VAR_MODE_LOOKUP',
        expressionArguments: [
          {
            dataType: 'MAP',
            value: {
              mapValue: {
                values: [
                  {
                    guidKey: stringToGuid(lookup.defaultModeId),
                    value: { dataType: 'ALIAS', value: { alias: { guid: target } } }
                  }
                ]
              }
            }
          }
        ]
      }
    }
  }
  // Figma saves the size a binding gave; drawing keeps it while the expression has no value.
  for (const node of decoded.nodeChanges)
    if (node.type === 'RECTANGLE') node.size = { x: 91, y: 70 }
  const bytes = compressFigDataSync(
    deflateSync(getSchemaBytes()),
    getCompiledSchema().encodeMessage(decoded),
    new Uint8Array(),
    '{}',
    []
  )
  return {
    bytes,
    data: entry.variableData,
    mode: collection.defaultModeId,
    lookupMode: lookup.defaultModeId,
    compact: compact.id,
    gap: gap.id
  }
}

test('layers bound to a kept expression open at the size the file saved', async () => {
  const file = await figWithLookup()
  const graph = await parseFigFileViaWorker(file.bytes.slice().buffer, { populate: 'first-page' })
  try {
    populateFigPage(graph, graph.getPages()[1].id)
    expect(graph.getPages().map((page) => graph.getChildren(page.id)[0].width)).toEqual([91, 91])
  } finally {
    releaseFigPopulationWorker(graph)
  }
})

test('saving and reopening writes a kept expression back unchanged', async () => {
  const file = await figWithLookup()
  const graph = await parseFigFile(file.bytes.slice().buffer)
  const reopened = await parseFigFile((await exportFigFile(graph)).slice().buffer)
  expect(reopened.variables.get(file.gap)?.valuesByMode[file.mode]).toEqual({
    expression: 'UNSUPPORTED',
    function: 'VAR_MODE_LOOKUP',
    value: { ...file.data },
    references: [file.compact],
    modes: [file.lookupMode]
  })
  expect(reopened.getChildren(reopened.getPages()[0].id)[0].width).toBe(91)
})
