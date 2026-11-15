import { shallowRef } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

import type { InstructionCatalog } from './invoke'
import { libraryCatalog } from './library'
import { hasInstructions, readInstructionCatalog } from './read'

/** The library's skills first, then the folder's own; a folder skill of the same name stands for both. */
export function withLibrary(
  library: InstructionCatalog,
  own: InstructionCatalog
): InstructionCatalog {
  const added = own.skills.filter((name) => !library.skills.includes(name))
  return { skills: [...library.skills, ...added], documents: own.documents }
}

/**
 * The skills and documents the conversation can offer after `/` and `@`: those of the folder the
 * document is saved in, with the skills of this installation. Read again each time the list is about to show, so a file added a moment
 * ago is there.
 */
export function useInstructionCatalog(getStore: () => EditorStore) {
  const catalog = shallowRef<InstructionCatalog>(libraryCatalog.value)

  async function refresh(): Promise<void> {
    const path = getStore().getDocumentFilePath()
    try {
      const own = path && isTauri() && (await hasInstructions(path))
      catalog.value = own
        ? withLibrary(libraryCatalog.value, await readInstructionCatalog(path))
        : libraryCatalog.value
    } catch {
      catalog.value = libraryCatalog.value
    }
  }

  return { catalog, refresh }
}
