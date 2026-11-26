import type { EditorStore } from '@/app/editor/active-store'
import { createTab } from '@/app/tabs'

/**
 * Figma's File › Duplicate: a copy of the document, as it is now, opens in a new tab as an
 * unsaved file named "<name> copy".
 */
export async function duplicateDocument(store: EditorStore): Promise<void> {
  const { readKalkaArchive, writeKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  const graph = readKalkaArchive(await writeKalkaArchive(store.graph))
  const name = store.state.documentName || 'Untitled'
  const tab = createTab(undefined, graph)
  tab.store.state.documentName = `${name} copy`
}
