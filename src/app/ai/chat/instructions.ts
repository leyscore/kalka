import { joinFolderPath } from '@/app/document/io/kalka-folder'
import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

/** Where a Kalka folder keeps what its agents should know: rules, tone, reference documents. */
export const INSTRUCTIONS_DIR = 'instructions'
/** Enough for a brand guide and a few rules without crowding the conversation. */
export const MAX_INSTRUCTIONS_BYTES = 32 * 1024

export interface InstructionFile {
  name: string
  text: string
}

const READABLE = /\.(md|txt)$/i

/**
 * The instruction files as one note for the model, in name order, cut at the size limit. Empty
 * when there is nothing to say.
 */
export function formatProjectInstructions(files: readonly InstructionFile[]): string {
  const sections: string[] = []
  let size = 0
  for (const file of files.toSorted((a, b) => a.name.localeCompare(b.name))) {
    const text = file.text.trim()
    if (!text) continue
    const room = MAX_INSTRUCTIONS_BYTES - size
    if (room <= 0) break
    const kept = text.length > room ? `${text.slice(0, room)}\n[cut]` : text
    sections.push(`### ${file.name}\n${kept}`)
    size += kept.length
  }
  return sections.join('\n\n')
}

/**
 * What the document's folder says its agents should know: the `.md` and `.txt` files of its
 * `instructions` folder. Read on this computer only, and empty for a document not saved as a folder.
 */
export async function readProjectInstructions(store: EditorStore): Promise<string> {
  const folder = store.getDocumentFilePath()
  if (!folder || !isTauri()) return ''
  try {
    const { exists, readDir, readTextFile } = await import('@tauri-apps/plugin-fs')
    const directory = joinFolderPath(folder, INSTRUCTIONS_DIR)
    if (!(await exists(directory))) return ''
    const files: InstructionFile[] = []
    for (const entry of await readDir(directory)) {
      if (!entry.isFile || !READABLE.test(entry.name)) continue
      files.push({
        name: entry.name,
        text: await readTextFile(joinFolderPath(directory, entry.name))
      })
    }
    return formatProjectInstructions(files)
  } catch {
    // Instructions are a help, never a reason for a request to fail.
    return ''
  }
}
