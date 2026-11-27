import { expect, test } from 'bun:test'

import { FRAME_PRESETS as EDITOR_PRESETS } from '@/app/editor/frame-presets'
import { FRAME_PRESETS as HOME_PRESETS } from '@/app/home/start'

test('the home screen starts a desktop design at the size of the Frame tool’s Desktop', () => {
  const home = HOME_PRESETS.find((preset) => preset.id === 'desktop')
  const editor = EDITOR_PRESETS.find((preset) => preset.id === 'desktop')
  const size = (preset?: { width: number; height: number }) =>
    preset ? `${preset.width} × ${preset.height}` : null
  expect(size(home)).toBe(size(editor))
  expect(size(home)).not.toBeNull()
})
