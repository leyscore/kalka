import type { EditorStore } from '@/app/editor/active-store'
import { pasteOverSelection } from '@/app/editor/clipboard/paste-over'
import { copyLayersAsPNG } from '@/app/editor/clipboard/png'
import { pasteClipboardToReplace } from '@/app/editor/clipboard/paste-to-replace'
import {
  copySelectionProperties,
  pasteClipboardProperties
} from '@/app/editor/clipboard/properties'
import { executeClipboardCommand } from '@/app/editor/clipboard/system'
import { pickColorForSelection } from '@/app/editor/color/eyedropper'
import { copySelectionLink } from '@/app/editor/selection/link'
import { requestRenameSelection } from '@/app/editor/selection/rename-dialog'
import { setDefaultProperties } from '@/app/settings/preferences/apply'

export function createSelectionMenuActions(store: EditorStore) {
  return {
    copy: () => void executeClipboardCommand(store, 'copy'),
    cut: () => void executeClipboardCommand(store, 'cut'),
    paste: () => void executeClipboardCommand(store, 'paste'),
    'paste-to-replace': () => void pasteClipboardToReplace(store),
    'paste-over-selection': () => void pasteOverSelection(store),
    'set-default-properties': () => void setDefaultProperties(store),
    'copy-link': () => void copySelectionLink(store),
    'copy-as-png': () => void copyLayersAsPNG(store, [...store.state.selectedIds]),
    'pick-color': () => void pickColorForSelection(store),
    'copy-properties': () => void copySelectionProperties(store),
    'paste-properties': () => void pasteClipboardProperties(store),
    'selection.rename': () => requestRenameSelection(store)
  }
}
