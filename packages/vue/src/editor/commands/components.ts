import type { EditorCommandMapOptions } from './context'
import type { EditorCommand, EditorCommandId } from './types'

export type ComponentCommandId = Extract<
  EditorCommandId,
  | 'selection.createMultipleComponents'
  | 'selection.resetAllChanges'
  | 'selection.pushChangesToMainComponent'
  | 'selection.restoreMainComponent'
>

/** Figma's component and instance commands beyond create, detach and go to main. */
export function createComponentCommands({
  editor,
  capabilities,
  messages: t
}: EditorCommandMapOptions): Record<ComponentCommandId, EditorCommand> {
  return {
    'selection.createMultipleComponents': {
      id: 'selection.createMultipleComponents',
      get label() {
        return t.value.createMultipleComponents
      },
      enabled: capabilities.canCreateMultipleComponents,
      run: () => void editor.createMultipleComponents()
    },
    'selection.resetAllChanges': {
      id: 'selection.resetAllChanges',
      get label() {
        return t.value.resetAllChanges
      },
      enabled: capabilities.canResetAllChanges,
      run: () => void editor.resetInstanceChanges()
    },
    'selection.pushChangesToMainComponent': {
      id: 'selection.pushChangesToMainComponent',
      get label() {
        return t.value.pushChangesToMainComponent
      },
      enabled: capabilities.canPushChangesToMainComponent,
      run: () => void editor.pushChangesToMainComponent()
    },
    'selection.restoreMainComponent': {
      id: 'selection.restoreMainComponent',
      get label() {
        return t.value.restoreMainComponent
      },
      enabled: capabilities.canRestoreMainComponent,
      run: () => void editor.restoreMainComponent()
    }
  }
}
