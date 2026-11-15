import { joinFolderPath } from '@/app/document/io/kalka-folder'

import type { InstructionCatalog } from './invoke'
import { DOCUMENTS_DIR, INSTRUCTIONS_DIR, RULES_FILE, SKILLS_DIR, SUMMARY_FILE } from './layout'
import { STARTER_SKILLS } from './starter-skills'

const SUMMARY = `# Summary

What this project is, in a few lines. Agents read it at the start of every conversation.

- Who it is for:
- What it should make them do:
- The feeling it should leave:
`

const RULES = `# Rules

What an agent must respect whenever it draws here. Keep it short: every line is read every time.

- Brand voice:
- Colors and type: use the variables in design-system/tokens.css, never a new color.
- Always:
- Never:
`

const DOCUMENTS = `# Documents

Put reference content here: a brief, the offers, real texts. One file per subject.

An agent reads a document when you cite it in the conversation with an at sign, such as
@brief.md.
`

/** The instructions a folder starts with, by path inside it. */
export const STARTER_INSTRUCTIONS: ReadonlyMap<string, string> = new Map([
  [`${INSTRUCTIONS_DIR}/${SUMMARY_FILE}`, SUMMARY],
  [`${INSTRUCTIONS_DIR}/${RULES_FILE}`, RULES],
  ...Object.entries(STARTER_SKILLS).map(
    ([name, text]) => [`${INSTRUCTIONS_DIR}/${SKILLS_DIR}/${name}.md`, text] as const
  ),
  [`${INSTRUCTIONS_DIR}/${DOCUMENTS_DIR}/README.md`, DOCUMENTS]
])

/** What a document offers before it has a folder: the starter skills, and no documents. */
export const STARTER_CATALOG: InstructionCatalog = {
  skills: Object.keys(STARTER_SKILLS),
  documents: []
}

const STARTER_TEXTS = new Set([...STARTER_INSTRUCTIONS.values()].map((text) => text.trim()))

/** Whether a file still holds exactly what Kalka wrote in it. */
export function isStarterText(text: string): boolean {
  return STARTER_TEXTS.has(text.trim())
}

/**
 * Gives a folder its instructions the first time: nothing is written once the folder has an
 * `instructions` folder, whatever it holds, so what the person wrote or removed stays as it is.
 */
export async function startInstructions(folder: string): Promise<boolean> {
  const { exists, mkdir, writeFile } = await import('@tauri-apps/plugin-fs')
  const encoder = new TextEncoder()
  if (await exists(joinFolderPath(folder, INSTRUCTIONS_DIR))) return false
  for (const [path, text] of STARTER_INSTRUCTIONS) {
    const directory = path.split('/').slice(0, -1).join('/')
    await mkdir(joinFolderPath(folder, directory), { recursive: true })
    await writeFile(joinFolderPath(folder, path), encoder.encode(text))
  }
  return true
}
