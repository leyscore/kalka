import { uniq } from 'es-toolkit/array'

import type { ProjectFont, SceneGraph } from '@kalka/scene-graph'

import { fontManager } from '#core/text/fonts'
import {
  downloadCatalogueFont,
  findCatalogueFont,
  searchFontCatalogue,
  type CatalogueFont
} from '#core/text/project-fonts/catalogue'
import { registerProjectFont } from '#core/text/project-fonts/register'
import { collectGraphFontRequirements } from '#core/text/requirements'

/** A family of the free catalogue, as a search lists it for a script. */
export interface FontSearchResult {
  family: string
  category: string
  /** The licence's SPDX identifier; every family listed is under an open licence. */
  license: string
  weights: number[]
  styles: Array<'normal' | 'italic'>
  variable: boolean
  /** Whether the document already carries it. */
  added: boolean
}

/** A font the document carries, as a script reads it. */
export interface DocumentFontInfo {
  family: string
  source: ProjectFont['source']
  license: string | null
  /** Each weight or variable range its files serve, such as `400` or `100 900`. */
  weights: string[]
  styles: Array<'normal' | 'italic'>
  files: number
}

export function documentFontInfo(font: ProjectFont): DocumentFontInfo {
  return {
    family: font.family,
    source: font.source,
    license: font.license,
    weights: uniq(font.faces.map((face) => face.weight)).sort(
      (a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10)
    ),
    styles: uniq(font.faces.map((face) => face.style)).sort(),
    files: font.faces.length
  }
}

function searchResult(font: CatalogueFont, graph: SceneGraph): FontSearchResult {
  return {
    family: font.family,
    category: font.category,
    license: font.license,
    weights: font.weights,
    styles: font.styles,
    variable: font.variable,
    added: graph.fonts.has(font.family)
  }
}

export async function searchFonts(
  graph: SceneGraph,
  query: string,
  limit = 20
): Promise<FontSearchResult[]> {
  const fonts = await searchFontCatalogue(query, { fetch: fontManager.webFontFetch(), limit })
  return fonts.map((font) => searchResult(font, graph))
}

/**
 * Downloads an open-licence family into the document, with its licence, and loads it, so its
 * text draws with it offline and for everyone who opens the document. A family the document
 * carries already is returned as it is.
 */
export async function addFont(graph: SceneGraph, family: string): Promise<DocumentFontInfo> {
  const fetcher = fontManager.webFontFetch()
  const kept = graph.fonts.get(family)
  if (kept) return documentFontInfo(kept)
  const entry = await findCatalogueFont(family, { fetch: fetcher })
  if (!entry) {
    const close = await searchFontCatalogue(family.split(/\s+/)[0] ?? family, {
      fetch: fetcher,
      limit: 5
    })
    const names = close.map((font) => font.family)
    throw new Error(
      `No open-licence family is named "${family}"${names.length > 0 ? `; close names: ${names.join(', ')}` : ''}`
    )
  }
  const { characters } = collectGraphFontRequirements(graph, [graph.rootId])
  const font = await downloadCatalogueFont(entry.id, { fetch: fetcher, characters })
  graph.setProjectFont(font)
  registerProjectFont(font)
  return documentFontInfo(font)
}
