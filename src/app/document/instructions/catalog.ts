import { shallowRef } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

import type { InstructionCatalog } from './invoke'
import { hasInstructions, readInstructionCatalog } from './read'
import { STARTER_CATALOG } from './starter'

/**
 * The skills and documents the conversation can offer after `/` and `@`: those of the folder the
 * document is saved in, or the starter skills while it has none. Read again each time the list is about to show, so a file added a moment
 * ago is there.
 */
export function useInstructionCatalog(getStore: () => EditorStore) {
  const catalog = shallowRef<InstructionCatalog>(STARTER_CATALOG)

  async function refresh(): Promise<void> {
    const path = getStore().getDocumentFilePath()
    try {
      const own = path && isTauri() && (await hasInstructions(path))
      catalog.value = own ? await readInstructionCatalog(path) : STARTER_CATALOG
    } catch {
      catalog.value = STARTER_CATALOG
    }
  }

  return { catalog, refresh }
}
