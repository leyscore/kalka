import * as v from 'valibot'

import {
  FRESH_CATEGORIES,
  FRESH_LIBRARY_ID,
  FRESH_LIBRARY_NAME,
  insertFreshComponent,
  searchFreshComponents
} from '#core/library/fresh'
import { getComponentCatalog } from '#core/tools/component-catalog'
import { insertIndexInput, positionInputs, toolNumber } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

/** How the agent should treat what a search returns; the design guide says the same at length. */
const TOOLBOX_NOTE =
  'An optional toolbox, not a template: use one or two where they serve the idea of the page (its strong moment), then adapt them with properties, the document variables, or by writing your own HTML from the html field. Skip them when nothing fits.'

export const listLibraries = defineTool({
  name: 'list_libraries',
  description: 'List available published component libraries.',
  execution: { kind: 'async', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({}),
  execute: async (figma) => {
    const catalog = getComponentCatalog(figma.graph)
    const libraries = catalog ? await catalog.listLibraries() : []
    return { count: libraries.length, libraries }
  }
})

export const searchLibraryComponents = defineTool({
  name: 'search_library_components',
  description: `Search Kalka Fresh, the built-in library of design-forward components (live shader backgrounds, headline effects, glass and paper cards, buttons, hero devices, separators), by intent such as "animated background for a tech landing" or "playful stamp next to the headline". Returns the best matches with their variants, text properties, source and licence; insert one with insert_library_component (library_id "${FRESH_LIBRARY_ID}"). Colours follow the document variables ground, ink, accent, muted and line. ${TOOLBOX_NOTE}`,
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({
    query: v.pipe(
      v.string(),
      v.description('What the component is for, in a few words; empty lists the whole library')
    ),
    category: v.optional(v.pipe(v.picklist(FRESH_CATEGORIES), v.description('Only this category'))),
    limit: v.optional(
      toolNumber(
        v.pipe(
          v.number(),
          v.integer(),
          v.minValue(1),
          v.maxValue(30),
          v.description('Most results')
        )
      )
    ),
    include_html: v.optional(
      v.pipe(
        v.boolean(),
        v.description("Add each match's HTML, to adapt and write with write_html instead")
      )
    )
  }),
  execute: (_figma, args) => {
    const components = searchFreshComponents(args.query, {
      category: args.category,
      limit: args.limit,
      includeHTML: args.include_html
    })
    return {
      library: { id: FRESH_LIBRARY_ID, name: FRESH_LIBRARY_NAME },
      count: components.length,
      components,
      note: TOOLBOX_NOTE
    }
  }
})

function parseVariantValues(json: string | undefined): Record<string, string> | undefined {
  if (!json) return undefined
  const parsed = v.safeParse(
    v.pipe(v.string(), v.parseJson(), v.record(v.string(), v.string())),
    json
  )
  if (!parsed.success) throw new TypeError('variant_values must be a JSON object of strings')
  return parsed.output
}

export const insertLibraryComponent = defineTool({
  name: 'insert_library_component',
  description: `Insert a reusable component from a library by stable library and asset identity. Components of Kalka Fresh (library_id "${FRESH_LIBRARY_ID}", found with search_library_components) need no setup: the library is enabled in the document as they are placed, and properties sets their variant and text values by name, such as { "State": "Hover", "Label": "Book a table" }.`,

  execution: { kind: 'async', mutation: 'document' },
  input: v.strictObject({
    library_id: v.pipe(v.string(), v.description('Library ID')),
    revision_id: v.optional(v.pipe(v.string(), v.description('Pinned revision ID'))),
    asset_key: v.pipe(v.string(), v.description('Stable asset key')),
    parent_id: v.optional(v.pipe(v.string(), v.description('Optional parent node ID'))),
    insert_index: insertIndexInput,
    x: v.optional(positionInputs.x),
    y: v.optional(positionInputs.y),
    variant_values: v.optional(
      v.pipe(v.string(), v.description('Optional JSON object of variant property values'))
    ),
    properties: v.optional(
      v.pipe(
        v.record(v.string(), v.string()),
        v.description('Variant and text property values by name (Kalka Fresh components)')
      )
    )
  }),
  execute: async (figma, args) => {
    const variantValues = parseVariantValues(args.variant_values)
    if (args.library_id === FRESH_LIBRARY_ID) {
      try {
        return await insertFreshComponent(figma, {
          assetKey: args.asset_key,
          parentId: args.parent_id,
          insertIndex: args.insert_index,
          x: args.x,
          y: args.y,
          properties: { ...variantValues, ...args.properties }
        })
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) }
      }
    }
    const catalog = getComponentCatalog(figma.graph)
    if (!catalog) throw new Error('No component library catalog is configured')
    return catalog.insertComponent({
      libraryId: args.library_id,
      revisionId: args.revision_id,
      assetKey: args.asset_key,
      parentId: args.parent_id,
      x: args.x,
      y: args.y,
      variantValues
    })
  }
})
