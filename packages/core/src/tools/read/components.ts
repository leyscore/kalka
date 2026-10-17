import * as v from 'valibot'

import type { FigmaAPI } from '#core/figma-api'
import { getComponentCatalog } from '#core/tools/component-catalog'
import { toolNumber } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

export interface DocumentComponentResult {
  id: string
  name: string
  type: string
  page: string
  source: 'document'
}

export interface LibraryComponentResult {
  libraryId: string
  libraryName: string
  revisionId: string
  assetKey: string
  name: string
  type: string
  description: string
  source: 'library'
  enabled: boolean
  priority: number
}

/**
 * The document's components and component sets on every page whose names `accept` takes, up to
 * `limit`. Without `variants`, a component set stands for its variants, as Figma's assets list it.
 */
export function findDocumentComponents(
  figma: FigmaAPI,
  accept: (name: string) => boolean,
  options: { limit: number; variants: boolean }
): DocumentComponentResult[] {
  const found: DocumentComponentResult[] = []
  for (const page of figma.root.children) {
    if (found.length >= options.limit) break
    page.findAll((node) => {
      if (found.length >= options.limit) return false
      if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') return false
      if (!options.variants && node.parent?.type === 'COMPONENT_SET') return false
      if (!accept(node.name)) return false
      found.push({
        id: node.id,
        name: node.name,
        type: node.type,
        page: page.name,
        source: 'document'
      })
      return false
    })
  }
  return found
}

/** Components of the enabled libraries, when the document has a library catalog. */
export async function findLibraryComponents(
  figma: FigmaAPI,
  filter: { name?: string; libraryId?: string }
): Promise<LibraryComponentResult[]> {
  const catalog = getComponentCatalog(figma.graph)
  if (!catalog) return []
  const assets = await catalog.listComponents({ ...filter, enabledOnly: true })
  return assets.map(({ libraryId, libraryName, revisionId, enabled, priority, asset }) => ({
    libraryId,
    libraryName,
    revisionId,
    assetKey: asset.key,
    name: asset.name,
    type: asset.type,
    description: asset.description,
    source: 'library' as const,
    enabled,
    priority
  }))
}

export const getComponents = defineTool({
  name: 'get_components',
  description:
    'List reusable components from the document and enabled component libraries, optionally filtered by name.',
  execution: { kind: 'async', mutation: 'none' },
  input: v.strictObject({
    name: v.optional(
      v.pipe(v.string(), v.description('Filter by name (case-insensitive substring)'))
    ),
    source: v.optional(
      v.pipe(v.picklist(['all', 'document', 'libraries']), v.description('Component source')),
      'all'
    ),
    library_id: v.optional(
      v.pipe(v.string(), v.description('Filter library components by library ID'))
    ),
    limit: v.optional(
      toolNumber(
        v.pipe(v.number(), v.integer(), v.minValue(0), v.description('Max results (default: 50)'))
      )
    )
  }),
  execute: async (figma, args) => {
    const limit = args.limit ?? 50
    const source = args.source
    const nameFilter = args.name?.toLowerCase()
    const documentComponents =
      source === 'libraries'
        ? []
        : findDocumentComponents(
            figma,
            (name) => !nameFilter || name.toLowerCase().includes(nameFilter),
            { limit, variants: true }
          )
    const libraryComponents =
      source === 'document'
        ? []
        : await findLibraryComponents(figma, { name: args.name, libraryId: args.library_id })

    const components = [...libraryComponents, ...documentComponents]
      .sort((left, right) => {
        const leftPriority = 'priority' in left ? left.priority : -1
        const rightPriority = 'priority' in right ? right.priority : -1
        return rightPriority - leftPriority || left.name.localeCompare(right.name)
      })
      .slice(0, limit)
    return { count: components.length, components }
  }
})
