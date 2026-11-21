import type { Editor } from '@kalka/core/editor'
import {
  collectGraphFontRequirements,
  downloadCatalogueFont,
  downloadInstallableFont,
  findCatalogueFont,
  fontManager,
  fontsFromFiles,
  mergeProjectFont,
  searchFontCatalogue,
  type CatalogueFont,
  type AddedFonts,
  type FontFile
} from '@kalka/core/text'
import type { ProjectFont } from '@kalka/scene-graph'

import { isTauri } from '@/app/tauri/env'

export type { CatalogueFont } from '@kalka/core/text'

/** Families of the free catalogue for a search in the font picker. */
export function searchCatalogue(query: string, signal?: AbortSignal): Promise<CatalogueFont[]> {
  return searchFontCatalogue(query, { fetch: fontManager.webFontFetch(), limit: 60, signal })
}

/** The catalogue's family of each name it has, for fonts a document names but cannot draw. */
export async function catalogueFamilies(
  families: readonly string[]
): Promise<Map<string, CatalogueFont>> {
  const found = new Map<string, CatalogueFont>()
  const fetcher = fontManager.webFontFetch()
  await Promise.all(
    families.map(async (family) => {
      const font = await findCatalogueFont(family, { fetch: fetcher }).catch(() => null)
      if (font) found.set(family, font)
    })
  )
  return found
}

/** Installs font files on the computer, for other apps to use; the desktop app only. */
async function installFontFiles(files: readonly FontFile[]): Promise<void> {
  if (!isTauri() || files.length === 0) return
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('install_fonts', { files: files.map(({ name, data }) => ({ name, data })) })
}

export interface AddFontOptions {
  /** Also install the family on this computer, in the desktop app. */
  install?: boolean
  signal?: AbortSignal
}

/** Keeps `font` with the active document and draws its text with it at once. */
function keep(editor: Editor, font: ProjectFont): ProjectFont {
  const kept = mergeProjectFont(editor.graph.fonts.get(font.family), font)
  editor.graph.setProjectFont(kept)
  return kept
}

/**
 * Downloads an open-licence family into the document, with its licence, so it draws offline and
 * for anyone who opens the document; on the desktop, optionally installs it on the computer too.
 */
export async function addCatalogueFont(
  editor: Editor,
  font: CatalogueFont,
  { install = false, signal }: AddFontOptions = {}
): Promise<ProjectFont> {
  const fetcher = fontManager.webFontFetch()
  const { characters } = collectGraphFontRequirements(editor.graph, [editor.graph.rootId])
  const downloaded = await downloadCatalogueFont(font.id, { fetch: fetcher, characters, signal })
  const kept = keep(editor, downloaded)
  if (install)
    await installFontFiles(await downloadInstallableFont(font.id, { fetch: fetcher, signal }))
  return kept
}

/**
 * Keeps font files someone dropped or chose with the document, grouped by family; on the
 * desktop, optionally installs the TrueType and OpenType ones on the computer too.
 */
export async function addFontFiles(
  editor: Editor,
  files: readonly File[],
  { install = false }: AddFontOptions = {}
): Promise<AddedFonts> {
  const read = await Promise.all(
    files.map(async (file) => ({ name: file.name, data: new Uint8Array(await file.arrayBuffer()) }))
  )
  const { fonts, rejected } = fontsFromFiles(read)
  const kept = fonts.map((font) => keep(editor, font))
  if (install) {
    const installable = kept.flatMap((font) =>
      font.faces
        .filter((face) => /\.(?:ttf|otf)$/i.test(face.file))
        .map((face) => ({ name: face.file, data: face.data }))
    )
    await installFontFiles(installable)
  }
  return { fonts: kept, rejected }
}
