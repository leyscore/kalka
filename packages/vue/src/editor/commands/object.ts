import type { EditorCommandMapOptions } from './context'
import type { EditorCommand, EditorCommandId } from './types'

export type ObjectCommandId = Extract<
  EditorCommandId,
  | 'selection.removeFrame'
  | 'selection.resizeToFit'
  | 'selection.rotate180'
  | 'selection.rotateLeft'
  | 'selection.rotateRight'
  | 'selection.swapFillAndStroke'
  | 'selection.removeFill'
  | 'selection.removeStroke'
  | 'selection.hideOtherLayers'
>

/** Figma's small Object menu commands: frames, quarter turns, paints and hiding the rest. */
export function createObjectCommands({
  editor,
  selection,
  capabilities,
  messages: t
}: EditorCommandMapOptions): Record<ObjectCommandId, EditorCommand> {
  const command = (
    id: ObjectCommandId,
    message: keyof typeof t.value,
    enabled: EditorCommand['enabled'],
    run: () => void
  ): EditorCommand => ({
    id,
    get label() {
      return t.value[message]
    },
    enabled,
    run
  })
  const rotate = (degrees: number) => () =>
    editor.rotateNodes([...selection.selectedIds.value], degrees)
  return {
    'selection.removeFrame': command(
      'selection.removeFrame',
      'removeFrame',
      capabilities.canRemoveFrame,
      () => void editor.removeFrameSelected()
    ),
    'selection.resizeToFit': command(
      'selection.resizeToFit',
      'resizeToFit',
      capabilities.canResizeToFit,
      () => void editor.resizeToFitSelected()
    ),
    // The panel's quarter-turn button turns by 90, which is Figma's Rotate 90° right.
    'selection.rotate180': command(
      'selection.rotate180',
      'rotate180',
      capabilities.canFlip,
      rotate(180)
    ),
    'selection.rotateLeft': command(
      'selection.rotateLeft',
      'rotateLeft',
      capabilities.canFlip,
      rotate(-90)
    ),
    'selection.rotateRight': command(
      'selection.rotateRight',
      'rotateRight',
      capabilities.canFlip,
      rotate(90)
    ),
    'selection.swapFillAndStroke': command(
      'selection.swapFillAndStroke',
      'swapFillAndStroke',
      capabilities.canFlip,
      () => void editor.swapFillAndStrokeSelected()
    ),
    'selection.removeFill': command(
      'selection.removeFill',
      'removeFill',
      capabilities.canFlip,
      () => void editor.removeFillSelected()
    ),
    'selection.removeStroke': command(
      'selection.removeStroke',
      'removeStroke',
      capabilities.canFlip,
      () => void editor.removeStrokeSelected()
    ),
    'selection.hideOtherLayers': command(
      'selection.hideOtherLayers',
      'hideOtherLayers',
      capabilities.canFlip,
      () => void editor.hideOtherLayers()
    )
  }
}
