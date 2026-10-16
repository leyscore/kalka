import { executeAtomicTool } from '@kalka/core/editor'
import { editCSSClass, setHTMLElement } from '@kalka/core/tools'

import { makeFigmaFromStore } from '@/app/automation/bridge/figma-factory'
import type { EditorStore } from '@/app/editor/active-store'

/** Class edits reach many layers at once; each runs as one undo step, as agents' edits do. */
const UNDO_LABEL = 'Classes'

/** Gives a layer its class names: new ones bring their look, unknown ones become classes. */
export function setLayerClasses(store: EditorStore, id: string, classes: string[]): void {
  executeAtomicTool(
    store,
    makeFigmaFromStore(store),
    setHTMLElement,
    { id, classes },
    {
      label: UNDO_LABEL
    }
  )
}

/** Makes the layer's own values part of its last class, for every layer with that class. */
export function updateClassFromLayer(store: EditorStore, id: string): void {
  executeAtomicTool(
    store,
    makeFigmaFromStore(store),
    editCSSClass,
    { action: 'update_from_layer', id },
    { label: UNDO_LABEL }
  )
}

/** Drops the layer's own values for what its classes give. */
export function resetLayerToClasses(store: EditorStore, id: string): void {
  executeAtomicTool(
    store,
    makeFigmaFromStore(store),
    editCSSClass,
    { action: 'reset_layer', id },
    { label: UNDO_LABEL }
  )
}
