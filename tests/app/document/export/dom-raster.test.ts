import { afterEach, describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { domPrintPDF, domRasterize } from '@/app/document/export/dom-raster'

import { clearTauriMocks, mockTauriIPC } from '#tests/helpers/tauri/mocks'

afterEach(async () => {
  await clearTauriMocks()
})

function card() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const node = graph.createNode('FRAME', page.id, { name: 'Card', width: 120, height: 60 })
  return { graph, pageId: page.id, nodeIds: [node.id] }
}

describe('drawing exports with the browser', () => {
  test('the web build leaves images to CanvasKit and PDF to jsPDF', async () => {
    const layers = card()
    expect(await domRasterize({ ...layers, scale: 1, format: 'PNG' })).toBeNull()
    expect(await domPrintPDF(layers)).toBeNull()
  })

  test('the desktop app leaves WebP to CanvasKit', async () => {
    const commands: string[] = []
    await mockTauriIPC((command) => {
      commands.push(command)
      return null
    })
    expect(await domRasterize({ ...card(), scale: 1, format: 'WEBP' })).toBeNull()
    expect(commands).toEqual([])
  })
})
