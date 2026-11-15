import { useLocalStorage } from '@vueuse/core'
import * as v from 'valibot'
import { computed } from 'vue'

import type { InstructionCatalog } from './invoke'
import { BUILT_IN_SKILLS } from './starter-skills'

const STORAGE_KEY = 'kalka:skills:v1'

const LibrarySchema = v.object({
  /** The person's own skills, by name, kept in the app and offered in every document. */
  own: v.fallback(v.record(v.string(), v.string()), {}),
  /** Skills Kalka comes with that the person turned off. */
  disabled: v.fallback(v.array(v.string()), [])
})
export type SkillLibrary = v.InferOutput<typeof LibrarySchema>

const EMPTY: SkillLibrary = { own: {}, disabled: [] }

/** A stored library that does not read, or is not one, starts over empty. */
export function parseSkillLibrary(raw: string): SkillLibrary {
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), LibrarySchema), raw)
  return parsed.success ? parsed.output : structuredClone(EMPTY)
}

/**
 * The skills of this installation: Kalka's, some of which the person may have turned off, and
 * their own. They are the same in every document; a folder adds its skills on top.
 */
export const skillLibrary = useLocalStorage<SkillLibrary>(STORAGE_KEY, structuredClone(EMPTY), {
  serializer: { read: parseSkillLibrary, write: (library) => JSON.stringify(library) }
})

/** A name as it is typed after a slash: lowercase words joined by hyphens. */
export function skillSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}

/** The skills on offer and their text: the person's own stand for Kalka's of the same name. */
export function librarySkills(library: SkillLibrary): Record<string, string> {
  const skills: Record<string, string> = {}
  for (const [name, text] of Object.entries(BUILT_IN_SKILLS)) {
    if (!library.disabled.includes(name)) skills[name] = text
  }
  return { ...skills, ...library.own }
}

/** The library as the conversation offers it, before a folder adds to it. */
export const libraryCatalog = computed<InstructionCatalog>(() => ({
  skills: Object.keys(librarySkills(skillLibrary.value)),
  documents: []
}))

export function setSkillEnabled(name: string, enabled: boolean): void {
  const disabled = skillLibrary.value.disabled.filter((entry) => entry !== name)
  skillLibrary.value = {
    ...skillLibrary.value,
    disabled: enabled ? disabled : [...disabled, name]
  }
}

export function saveOwnSkill(name: string, text: string): void {
  skillLibrary.value = { ...skillLibrary.value, own: { ...skillLibrary.value.own, [name]: text } }
}

export function removeOwnSkill(name: string): void {
  const { [name]: _removed, ...own } = skillLibrary.value.own
  skillLibrary.value = { ...skillLibrary.value, own }
}
