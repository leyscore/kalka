import type { EditorStore } from '@/app/editor/active-store'
import { pasteOverSelection } from '@/app/editor/clipboard/paste-over'
import { pasteClipboardToReplace } from '@/app/editor/clipboard/paste-to-replace'
import {
  copySelectionProperties,
  pasteClipboardProperties
} from '@/app/editor/clipboard/properties'
import { executeClipboardCommand } from '@/app/editor/clipboard/system'
import { copySelectionLink } from '@/app/editor/selection/link'
import { requestRenameSelection } from '@/app/editor/selection/rename-dialog'

export function createSelectionMenuActions(store: EditorStore) {
  return {
    copy: () => void executeClipboardCommand(store, 'copy'),
    cut: () => void executeClipboardCommand(store, 'cut'),
    paste: () => void executeClipboardCommand(store, 'paste'),
    'paste-to-replace': () => void pasteClipboardToReplace(store),
    'paste-over-selection': () => void pasteOverSelection(store),
    'set-default-properties': () => void store.setDefaultPropertiesFromSelection(),
    'copy-link': () => void copySelectionLink(store),
    'copy-properties': () => void copySelectionProperties(store),
    'paste-properties': () => void pasteClipboardProperties(store),
    'selection.rename': () => requestRenameSelection(store)
  }
}
