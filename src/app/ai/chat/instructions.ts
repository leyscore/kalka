import { findInvocations, type InstructionCatalog } from '@/app/document/instructions/invoke'
import {
  readDocument,
  readInstructionCatalog,
  readSkill,
  readStandingInstructions,
  hasInstructions
} from '@/app/document/instructions/read'
import { isStarterText, STARTER_CATALOG } from '@/app/document/instructions/starter'
import { STARTER_SKILLS } from '@/app/document/instructions/starter-skills'
import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

/** Enough for a brand guide, a skill and a brief without crowding the conversation. */
export const MAX_INSTRUCTIONS_BYTES = 32 * 1024

export interface InstructionSection {
  /** What the section is, for the model: `Rules`, `Skill /critique`, `Document brief.md`. */
  title: string
  text: string
}

/**
 * Sections as one note for the model, in the order given, cut at the size limit: what comes
 * first is what matters most. Empty when there is nothing to say.
 */
export function formatProjectInstructions(sections: readonly InstructionSection[]): string {
  const parts: string[] = []
  let size = 0
  for (const section of sections) {
    const text = section.text.trim()
    if (!text) continue
    const room = MAX_INSTRUCTIONS_BYTES - size
    if (room <= 0) break
    const kept = text.length > room ? `${text.slice(0, room)}\n[cut]` : text
    parts.push(`### ${section.title}\n${kept}`)
    size += kept.length
  }
  return parts.join('\n\n')
}

/** Tells the model which skills and documents it can be given, so it can ask for one by name. */
export function describeCatalog(catalog: InstructionCatalog): string {
  const lines: string[] = []
  if (catalog.skills.length > 0) {
    lines.push(
      `Skills the person can give you with a slash: ${catalog.skills.map((name) => `/${name}`).join(', ')}`
    )
  }
  if (catalog.documents.length > 0) {
    lines.push(
      `Documents the person can give you with an at sign: ${catalog.documents.map((name) => `@${name}`).join(', ')}`
    )
  }
  return lines.join('\n')
}

/**
 * What the document's folder tells its agent for one request. A conversation's first request
 * carries the summary, the rules and the list of what can be asked for; every request carries
 * the skills it names with `/` and the documents it names with `@`. A document without an
 * instructions folder, in a browser or not saved as a folder, has the starter skills alone.
 */
export async function readProjectInstructions(
  store: EditorStore,
  request: string,
  first: boolean
): Promise<string> {
  const path = store.getDocumentFilePath()
  // A document not saved as a folder still has the skills every folder starts with.
  const folder = path && isTauri() && (await hasInstructions(path)) ? path : null
  try {
    const catalog = folder ? await readInstructionCatalog(folder) : STARTER_CATALOG
    const sections: InstructionSection[] = []
    if (folder && first) {
      for (const file of await readStandingInstructions(folder)) {
        // A file still as Kalka wrote it is a form nobody filled in: it says nothing yet.
        if (isStarterText(file.text)) continue
        sections.push({ title: file.name, text: file.text })
      }
    }
    const asked = findInvocations(request, catalog)
    for (const name of asked.skills) {
      const text = folder ? (await readSkill(folder, name))?.text : STARTER_SKILLS[name]
      if (text) sections.push({ title: `Skill /${name}`, text })
    }
    for (const name of folder ? asked.documents : []) {
      const document = await readDocument(folder ?? '', name)
      if (document) sections.push({ title: `Document ${name}`, text: document.text })
    }
    if (first) sections.push({ title: 'Available on request', text: describeCatalog(catalog) })
    return formatProjectInstructions(sections)
  } catch {
    // Instructions are a help, never a reason for a request to fail.
    return ''
  }
}

/** How many instruction sections a request carried, for the line that says so under it. */
export function countInstructionSections(note: string): number {
  return note.split('\n').filter((line) => line.startsWith('### ')).length
}
