import { createComponentCommands } from './components'
import type { EditorCommandMapOptions } from './context'
import { createEditCommands } from './edit'
import { createMatchingCommands } from './matching'
import { createSelectionCommands } from './selection'
import type { EditorCommand, EditorCommandId } from './types'
import { createViewCommands } from './view'

export function createEditorCommandMap(
  options: EditorCommandMapOptions
): Record<EditorCommandId, EditorCommand> {
  return {
    ...createEditCommands(options),
    ...createSelectionCommands(options),
    ...createComponentCommands(options),
    ...createMatchingCommands(options),
    ...createViewCommands(options)
  }
}
