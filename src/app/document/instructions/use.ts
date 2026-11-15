import { useEventListener } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'

import { openFolderFile, type FolderFile } from '@/app/document/folder/view'
import { joinFolderPath } from '@/app/document/io/kalka-folder'
import type { EditorStore } from '@/app/editor/active-store'
import { isTauri } from '@/app/tauri/env'

import { DOCUMENTS_DIR, INSTRUCTIONS_DIR, SKILLS_DIR } from './layout'
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
  const builtIn = Object.keys(BUILT_IN_SKILLS)
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

  /** Adds an empty file to the project's own skills or documents, and opens it. */
  async function add(kind: 'skill' | 'document', name: string): Promise<void> {
    const clean = name
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9-]+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
    if (!folder.value || !clean) return
    const directory = kind === 'skill' ? SKILLS_DIR : DOCUMENTS_DIR
    try {
      const { exists, mkdir, writeTextFile } = await import('@tauri-apps/plugin-fs')
      const root = joinFolderPath(folder.value, `${INSTRUCTIONS_DIR}/${directory}`)
      await mkdir(root, { recursive: true })
      const file = joinFolderPath(root, `${clean}.md`)
      if (!(await exists(file))) await writeTextFile(file, `# ${name.trim()}\n\n`)
      await refresh()
      await open(`${directory}/${clean}.md`)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
    }
  }

  useEventListener(window, 'focus', () => void refresh())
  void refresh()

  return { state, listing, builtIn, replaced, error, refresh, openBuiltIn, open, start, add }
}
