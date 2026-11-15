/**
 * Where a Kalka folder keeps what its agents should know. The summary and the rules are read
 * with every conversation; a skill is read when it is asked for with `/name`, a document when it
 * is cited with `@name`.
 */
export const INSTRUCTIONS_DIR = 'instructions'
export const SUMMARY_FILE = 'summary.md'
export const RULES_FILE = 'rules.md'
export const SKILLS_DIR = 'skills'
export const DOCUMENTS_DIR = 'documents'

const READABLE = /\.(md|txt)$/i

export function isReadableInstruction(name: string): boolean {
  return READABLE.test(name)
}

/** A skill's name is its file's, without the extension: `skills/critique.md` is `/critique`. */
export function skillName(file: string): string {
  return file.replace(READABLE, '')
}

/** Whether a path of the folder is one of its instructions, which Kalka lets the person write. */
export function isInstructionPath(path: string): boolean {
  return path.startsWith(`${INSTRUCTIONS_DIR}/`) && isReadableInstruction(path)
}
