import type { EditorStore } from '@/app/editor/active-store'

/**
 * Opens the document's variables: a page over the panels and the canvas in the desktop layout, a
 * dialog in the others.
 */
export function openVariablesDialog(store: EditorStore): void {
  store.state.variablesOpen = true
}

/** Opens the variables page, or closes it and gives the canvas back. */
export function toggleVariablesPage(store: EditorStore): void {
  store.state.variablesOpen = !store.state.variablesOpen
}
