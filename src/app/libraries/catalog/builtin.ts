import {
  FRESH_COMPONENTS,
  FRESH_LIBRARY_ID,
  FRESH_LIBRARY_NAME,
  FRESH_LIBRARY_PUBLISHED_AT,
  FRESH_LIBRARY_REVISION,
  type ComponentLibraryRevision,
  type LibraryCatalog,
  type LibrarySummary,
  type PublishLibraryInput
} from '@kalka/core/library'
import { freshLibraryRevision } from '@kalka/core/tools'

const FRESH_SUMMARY: LibrarySummary = {
  libraryId: FRESH_LIBRARY_ID,
  name: FRESH_LIBRARY_NAME,
  latestRevisionId: FRESH_LIBRARY_REVISION,
  publishedAt: FRESH_LIBRARY_PUBLISHED_AT,
  assetCount: FRESH_COMPONENTS.length
}

/** Whether a library ships with Kalka rather than being published by someone. */
export function isBuiltinLibrary(libraryId: string): boolean {
  return libraryId === FRESH_LIBRARY_ID
}

/**
 * Puts the libraries that ship with Kalka in front of a catalog's own. They are built from their
 * definitions in Core and keep one revision, which every document that uses them names; they
 * cannot be published to.
 */
export class BuiltinLibraryCatalog implements LibraryCatalog {
  readonly #catalog: LibraryCatalog

  constructor(catalog: LibraryCatalog) {
    this.#catalog = catalog
  }

  async listLibraries(): Promise<LibrarySummary[]> {
    const published = await this.#catalog.listLibraries()
    return [FRESH_SUMMARY, ...published.filter((summary) => !isBuiltinLibrary(summary.libraryId))]
  }

  getRevision(libraryId: string, revisionId?: string): Promise<ComponentLibraryRevision> {
    if (isBuiltinLibrary(libraryId)) return freshLibraryRevision()
    return this.#catalog.getRevision(libraryId, revisionId)
  }

  async publishRevision(input: PublishLibraryInput): Promise<ComponentLibraryRevision> {
    if (isBuiltinLibrary(input.libraryId))
      throw new Error(`${FRESH_LIBRARY_NAME} ships with Kalka and cannot be published to`)
    return this.#catalog.publishRevision(input)
  }
}
