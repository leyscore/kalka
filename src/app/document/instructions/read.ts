import { joinFolderPath } from '@/app/document/io/kalka-folder'

import type { InstructionCatalog } from './invoke'
import {
  DOCUMENTS_DIR,
  INSTRUCTIONS_DIR,
  isReadableInstruction,
  RULES_FILE,
  SKILLS_DIR,
  skillName,
  SUMMARY_FILE
} from './layout'

export interface InstructionFile {
  name: string
  text: string
}

/** A folder's instruction files. A README explains the folder to the person and is left out. */
async function names(directory: string): Promise<string[]> {
  const { exists, readDir } = await import('@tauri-apps/plugin-fs')
  if (!(await exists(directory))) return []
  const entries = await readDir(directory)
  return entries
    .filter((entry) => entry.isFile && isReadableInstruction(entry.name))
    .filter((entry) => entry.name.toLowerCase() !== 'readme.md')
    .map((entry) => entry.name)
    .toSorted((a, b) => a.localeCompare(b))
}

async function read(directory: string, name: string): Promise<InstructionFile | null> {
  const { exists, readTextFile } = await import('@tauri-apps/plugin-fs')
  const path = joinFolderPath(directory, name)
  return (await exists(path)) ? { name, text: await readTextFile(path) } : null
}

/** The skills and documents a folder offers, by the names they are asked for with. */
export async function readInstructionCatalog(folder: string): Promise<InstructionCatalog> {
  const root = joinFolderPath(folder, INSTRUCTIONS_DIR)
  const [skills, documents] = await Promise.all([
    names(joinFolderPath(root, SKILLS_DIR)),
    names(joinFolderPath(root, DOCUMENTS_DIR))
  ])
  return { skills: skills.map(skillName), documents }
}

/** What every conversation starts from: the summary, then the rules, then any other note beside them. */
export async function readStandingInstructions(folder: string): Promise<InstructionFile[]> {
  const root = joinFolderPath(folder, INSTRUCTIONS_DIR)
  const all = await names(root)
  const order = [
    SUMMARY_FILE,
    RULES_FILE,
    ...all.filter((name) => name !== SUMMARY_FILE && name !== RULES_FILE)
  ]
  const files = await Promise.all(
    order.filter((name) => all.includes(name)).map((name) => read(root, name))
  )
  return files.filter((file) => file !== null)
}

export async function readSkill(folder: string, name: string): Promise<InstructionFile | null> {
  const directory = joinFolderPath(joinFolderPath(folder, INSTRUCTIONS_DIR), SKILLS_DIR)
  const file = (await names(directory)).find((candidate) => skillName(candidate) === name)
  return file ? read(directory, file) : null
}

export function readDocument(folder: string, name: string): Promise<InstructionFile | null> {
  return read(joinFolderPath(joinFolderPath(folder, INSTRUCTIONS_DIR), DOCUMENTS_DIR), name)
}

/** Whether a path is a folder that has instructions; false for a file and for a folder without. */
export async function hasInstructions(path: string): Promise<boolean> {
  try {
    const { exists } = await import('@tauri-apps/plugin-fs')
    return await exists(joinFolderPath(path, INSTRUCTIONS_DIR))
  } catch {
    return false
  }
}

export interface InstructionListing {
  /** The summary, the rules and any other note beside them, by file name. */
  standing: string[]
  /** The project's own skills, by file name. */
  skills: string[]
  documents: string[]
}

/** What a folder's instructions hold, for the panel that lists them. */
export async function listInstructions(folder: string): Promise<InstructionListing> {
  const root = joinFolderPath(folder, INSTRUCTIONS_DIR)
  const [standing, skills, documents] = await Promise.all([
    names(root),
    names(joinFolderPath(root, SKILLS_DIR)),
    names(joinFolderPath(root, DOCUMENTS_DIR))
  ])
  return { standing, skills, documents }
}
