import { shallowRef } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

import type { InstructionCatalog } from './invoke'
import { hasInstructions, readInstructionCatalog } from './read'
import { BUILT_IN_CATALOG } from './starter'

/** Kalka's skills first, then the folder's own; a folder skill of the same name stands for both. */
export function withBuiltIn(own: InstructionCatalog): InstructionCatalog {
  const added = own.skills.filter((name) => !BUILT_IN_CATALOG.skills.includes(name))
  return { skills: [...BUILT_IN_CATALOG.skills, ...added], documents: own.documents }
}

/**
 * The skills and documents the conversation can offer after `/` and `@`: those of the folder the
 * document is saved in, with the skills Kalka comes with. Read again each time the list is about to show, so a file added a moment
 * ago is there.
 */
export function useInstructionCatalog(getStore: () => EditorStore) {
  const catalog = shallowRef<InstructionCatalog>(BUILT_IN_CATALOG)

  async function refresh(): Promise<void> {
    const path = getStore().getDocumentFilePath()
    try {
      const own = path && isTauri() && (await hasInstructions(path))
      catalog.value = own ? withBuiltIn(await readInstructionCatalog(path)) : BUILT_IN_CATALOG
    } catch {
      catalog.value = BUILT_IN_CATALOG
    }
  }

  return { catalog, refresh }
}
