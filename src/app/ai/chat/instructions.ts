import { withLibrary } from '@/app/document/instructions/catalog'
import { findInvocations, type InstructionCatalog } from '@/app/document/instructions/invoke'
import { libraryCatalog, librarySkills, skillLibrary } from '@/app/document/instructions/library'
import {
  readDocument,
  readInstructionCatalog,
  readSkill,
  readStandingInstructions,
  hasInstructions
} from '@/app/document/instructions/read'
import { isStarterText } from '@/app/document/instructions/starter'
import { skillBody, usedSkills } from '@/app/document/instructions/starter-skills'
import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

/** Enough for the rules, two skills with the catalogue they rely on, and a brief. */
export const MAX_INSTRUCTIONS_BYTES = 64 * 1024

/** The section that lists what can be asked for; it is a menu, not an instruction that was read. */
const CATALOG_TITLE = 'Available on request'

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
 * instructions folder, in a browser or not saved as a folder, has the skills Kalka comes with.
 */
export async function readProjectInstructions(
  store: EditorStore,
  request: string,
  first: boolean
): Promise<string> {
  try {
    const path = store.getDocumentFilePath()
    // A document without an instructions folder still has the skills Kalka comes with.
    const folder = path && isTauri() && (await hasInstructions(path)) ? path : null
    const library = librarySkills(skillLibrary.value)
    const catalog = folder
      ? withLibrary(libraryCatalog.value, await readInstructionCatalog(folder))
      : libraryCatalog.value
    const sections: InstructionSection[] = []
    if (folder && first) {
      for (const file of await readStandingInstructions(folder)) {
        // A file still as Kalka wrote it is a form nobody filled in: it says nothing yet.
        if (isStarterText(file.text)) continue
        sections.push({ title: file.name, text: file.text })
      }
    }
    /** A folder's own skill stands for the library's of the same name. */
    const skillText = async (name: string): Promise<string | undefined> =>
      (folder ? (await readSkill(folder, name))?.text : undefined) ?? library[name]
    const asked = findInvocations(request, catalog)
    // A skill brings the skills it relies on, each once, after the ones that were asked for.
    const wanted = [...asked.skills]
    const seen = new Set<string>()
    while (wanted.length > 0) {
      const name = wanted.shift()
      if (!name || seen.has(name)) continue
      seen.add(name)
      const text = await skillText(name)
      if (!text) continue
      sections.push({ title: `Skill /${name}`, text: skillBody(text) })
      wanted.push(...usedSkills(text))
    }
    for (const name of folder ? asked.documents : []) {
      const document = await readDocument(folder ?? '', name)
      if (document) sections.push({ title: `Document ${name}`, text: document.text })
    }
    if (first) sections.push({ title: CATALOG_TITLE, text: describeCatalog(catalog) })
    return formatProjectInstructions(sections)
  } catch {
    // Instructions are a help, never a reason for a request to fail.
    return ''
  }
}

/** How many instruction sections a request carried, for the line that says so under it. */
export function countInstructionSections(note: string): number {
  return note
    .split('\n')
    .filter((line) => line.startsWith('### ') && line !== `### ${CATALOG_TITLE}`).length
}
