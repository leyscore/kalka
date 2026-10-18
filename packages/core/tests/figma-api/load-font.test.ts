import { expect, spyOn, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { fontManager } from '@kalka/core/text'
import { SceneGraph } from '@kalka/scene-graph'

test('figma.loadFontAsync loads the font, and goes on when it cannot', async () => {
  const load = spyOn(fontManager, 'loadFont').mockImplementation(async (family) => {
    if (family === 'Missing') throw new Error('not found')
    return null
  })
  try {
    const figma = new FigmaAPI(new SceneGraph())

    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
    await figma.loadFontAsync({ family: 'Missing', style: 'Regular' })

    expect(load.mock.calls.map(([family, style]) => [family, style])).toEqual([
      ['Inter', 'Bold'],
      ['Missing', 'Regular']
    ])
  } finally {
    load.mockRestore()
  }
})
