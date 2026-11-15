export interface InstructionCatalog {
  /** Skill names, as typed after `/`. */
  skills: readonly string[]
  /** Document file names, as typed after `@`. */
  documents: readonly string[]
}

export interface Invocations {
  skills: string[]
  documents: string[]
}

/**
 * The skills and documents a request asks for: `/name` and `@name` set apart by spaces, when the
 * folder has them. Anything else that starts with a slash or an at sign is ordinary text.
 */
export function findInvocations(text: string, catalog: InstructionCatalog): Invocations {
  const skills = new Set<string>()
  const documents = new Set<string>()
  for (const word of text.split(/\s+/)) {
    const name = word.slice(1).replace(/[.,;:!?)]+$/, '')
    if (word.startsWith('/') && catalog.skills.includes(name)) skills.add(name)
    if (word.startsWith('@') && catalog.documents.includes(name)) documents.add(name)
  }
  return { skills: [...skills], documents: [...documents] }
}

export type SuggestionKind = 'skill' | 'document'

export interface SuggestionQuery {
  kind: SuggestionKind
  /** What is typed after the sign so far. */
  query: string
  /** Where the word starts in the text, sign included. */
  start: number
}

/** The `/` or `@` word the caret is in, if it is one; null in ordinary text. */
export function suggestionAt(text: string, caret: number): SuggestionQuery | null {
  const before = text.slice(0, caret)
  const start = Math.max(before.lastIndexOf(' '), before.lastIndexOf('\n')) + 1
  const word = before.slice(start)
  if (word.startsWith('/')) return { kind: 'skill', query: word.slice(1), start }
  if (word.startsWith('@')) return { kind: 'document', query: word.slice(1), start }
  return null
}

/** The names a query narrows to, those starting with it before those that only contain it. */
export function matchSuggestions(names: readonly string[], query: string): string[] {
  const wanted = query.toLowerCase()
  const starts = names.filter((name) => name.toLowerCase().startsWith(wanted))
  const contains = names.filter(
    (name) => !starts.includes(name) && name.toLowerCase().includes(wanted)
  )
  return [...starts, ...contains]
}
