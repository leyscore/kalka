import { useEventListener } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'

import { folderFileMarkdown, openFolderFile, type FolderFile } from '@/app/document/folder/view'
import { joinFolderPath } from '@/app/document/io/kalka-folder'
import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

import { DOCUMENTS_DIR, INSTRUCTIONS_DIR } from './layout'
import { removeOwnSkill, saveOwnSkill, setSkillEnabled, skillLibrary, skillSlug } from './library'
import { hasInstructions, listInstructions, type InstructionListing } from './read'
import { startInstructions } from './starter'
import { BUILT_IN_SKILLS, skillBody } from './starter-skills'

const NOTHING: InstructionListing = { standing: [], skills: [], documents: [] }
const encoder = new TextEncoder()

/**
 * `none`: the document has no folder on this computer to keep instructions in. `empty`: it has
 * one, without instructions yet. `ready`: its instructions are listed.
 */
export type InstructionsState = 'none' | 'empty' | 'ready'

/**
 * A document's instructions for the panel that shows them: the skills Kalka comes with, and the
 * rules, skills and documents of the folder it is saved in.
 */
export function useInstructions(store: EditorStore) {
  const folder = ref<string | null>(null)
  const state = ref<InstructionsState>('none')
  const listing = shallowRef<InstructionListing>(NOTHING)
  const error = ref('')
  /** Kalka's skills, each with whether the person left it on. */
  const kalka = computed(() =>
    Object.keys(BUILT_IN_SKILLS).map((name) => ({
      name,
      enabled: !skillLibrary.value.disabled.includes(name)
    }))
  )
  /** The person's own skills, the same in every document. */
  const own = computed(() => Object.keys(skillLibrary.value.own).toSorted())
  /** Kalka's skills a file of the folder stands for, by name. */
  const replaced = computed(
    () => new Set(listing.value.skills.map((file) => file.replace(/\.(md|txt)$/i, '')))
  )

  async function refresh(): Promise<void> {
    const path = store.getDocumentFilePath()
    try {
      const { stat } = await import('@tauri-apps/plugin-fs')
      const isFolder = Boolean(path) && isTauri() && (await stat(path ?? '')).isDirectory
      folder.value = isFolder ? path : null
      if (!folder.value) {
        state.value = 'none'
        listing.value = NOTHING
        return
      }
      if (!(await hasInstructions(folder.value))) {
        state.value = 'empty'
        listing.value = NOTHING
        return
      }
      listing.value = await listInstructions(folder.value)
      state.value = 'ready'
      error.value = ''
    } catch {
      folder.value = null
      state.value = 'none'
      listing.value = NOTHING
    }
  }

  /** Shows one of Kalka's skills, to read: it belongs to the app. */
  function openBuiltIn(name: string): void {
    const text = BUILT_IN_SKILLS[name]
    if (!text) return
    const file: FolderFile = {
      path: `/${name}`,
      name: `${name}.md`,
      kind: 'text',
      bytes: encoder.encode(skillBody(text))
    }
    openFolderFile.value = file
  }

  /** Opens one of the person's own skills, to read and to write; it is kept in the app. */
  function openOwn(name: string): void {
    const text = skillLibrary.value.own[name]
    if (text === undefined) return
    openFolderFile.value = {
      path: `/${name}`,
      name: `${name}.md`,
      kind: 'text',
      bytes: encoder.encode(text),
      save: (next) => saveOwnSkill(name, next)
    }
  }

  /** Starts a skill of the person's own and opens it ready to write. Returns whether it did. */
  function addOwn(title: string): boolean {
    const name = skillSlug(title)
    if (!name) return false
    if (skillLibrary.value.own[name] === undefined) saveOwnSkill(name, `# ${title.trim()}\n\n`)
    openOwn(name)
    folderFileMarkdown.value = 'text'
    return true
  }

  function removeOwn(name: string): void {
    if (openFolderFile.value?.path === `/${name}`) openFolderFile.value = null
    removeOwnSkill(name)
  }

  /** Opens a file of the folder's instructions, to read and to write. */
  async function open(relative: string): Promise<void> {
    if (!folder.value) return
    const path = `${INSTRUCTIONS_DIR}/${relative}`
    try {
      const { readFile } = await import('@tauri-apps/plugin-fs')
      const editablePath = joinFolderPath(folder.value, path)
      openFolderFile.value = {
        path,
        name: relative.split('/').pop() ?? relative,
        kind: 'text',
        bytes: await readFile(editablePath),
        editablePath
      }
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
  }

  /** Gives the folder the summary and the rules to fill in. */
  async function start(): Promise<void> {
    if (!folder.value) return
    try {
      await startInstructions(folder.value)
      await refresh()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
  }

  /** Adds an empty document to the project and opens it ready to write. */
  async function addDocument(title: string): Promise<void> {
    const name = skillSlug(title)
    if (!folder.value || !name) return
    try {
      const { exists, mkdir, writeTextFile } = await import('@tauri-apps/plugin-fs')
      const root = joinFolderPath(folder.value, `${INSTRUCTIONS_DIR}/${DOCUMENTS_DIR}`)
      await mkdir(root, { recursive: true })
      const file = joinFolderPath(root, `${name}.md`)
      if (!(await exists(file))) await writeTextFile(file, `# ${title.trim()}\n\n`)
      await refresh()
      await open(`${DOCUMENTS_DIR}/${name}.md`)
      folderFileMarkdown.value = 'text'
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
  }

  useEventListener(window, 'focus', () => void refresh())
  void refresh()

  return {
    state,
    listing,
    kalka,
    own,
    replaced,
    error,
    refresh,
    openBuiltIn,
    openOwn,
    addOwn,
    removeOwn,
    setSkillEnabled,
    open,
    start,
    addDocument
  }
}
