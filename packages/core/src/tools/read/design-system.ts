import { compact } from 'es-toolkit/array'
import * as v from 'valibot'

import { isLibraryCollection, type SceneGraph, type Variable } from '@kalka/scene-graph'

import { figmaClientInputs, toolNumber } from '#core/tools/input'
import {
  findDocumentComponents,
  findLibraryComponents,
  type DocumentComponentResult,
  type LibraryComponentResult
} from '#core/tools/read/components'
import { defineTool } from '#core/tools/schema'
import {
  documentStyles,
  variableValuesByMode,
  type ResolvedStyle
} from '#core/tools/variables/resolved'

const DEFAULT_LIMIT = 20
const MAX_QUERIES = 10

const queryText = v.pipe(v.string(), v.regex(/\S/, 'Expected a nonblank query'))

interface FoundVariable {
  id: string
  name: string
  type: string
  collection: string
  source: 'document' | 'library'
  valuesByMode: Record<string, string>
}

interface SearchResult {
  query: string
  components: Array<DocumentComponentResult | LibraryComponentResult>
  variables: FoundVariable[]
  styles: ResolvedStyle[]
}

/**
 * A query matches a name when the name holds every word of it, ignoring case, with `/` separating
 * words as it separates groups in design system names: `button primary` finds `Button/Primary`.
 */
function queryMatcher(query: string) {
  const terms = compact(query.toLowerCase().split(/[\s/]+/))
  const whole = query.trim().toLowerCase()
  return {
    matches: (...texts: string[]) => {
      const text = texts.join(' ').toLowerCase()
      return terms.every((term) => text.includes(term))
    },
    /** Exact names first, then names that start with the query, then names that contain it. */
    rank: (name: string) => {
      const lower = name.toLowerCase()
      if (lower === whole) return 0
      if (lower.startsWith(whole)) return 1
      return lower.includes(whole) ? 2 : 3
    }
  }
}

function ranked<T extends { name: string }>(
  items: T[],
  rank: (name: string) => number,
  limit: number
): T[] {
  return items
    .map((item) => ({ item, rank: rank(item.name) }))
    .sort((left, right) => left.rank - right.rank || left.item.name.localeCompare(right.item.name))
    .slice(0, limit)
    .map(({ item }) => item)
}

function foundVariable(graph: SceneGraph, variable: Variable): FoundVariable {
  const collection = graph.variableCollections.get(variable.collectionId)
  return {
    id: variable.id,
    name: variable.name,
    type: variable.type,
    collection: collection?.name ?? '',
    source: collection && isLibraryCollection(collection) ? 'library' : 'document',
    valuesByMode: variableValuesByMode(graph, variable)
  }
}

export const searchDesignSystem = defineTool({
  name: 'search_design_system',
  description:
    'Search the design system for components, component sets, variables, and styles whose names match a query, as Figma\'s search_design_system does: the document\'s own and those of its enabled libraries. Pass several queries at once as a list. Every word of a query must appear in the name (Button/Primary matches "button primary"). Insert a library component with insert_library_component and bind a variable with bind_variable.',
  execution: { kind: 'async', mutation: 'none' },
  input: v.strictObject({
    query: v.pipe(
      v.union([queryText, v.pipe(v.array(queryText), v.minLength(1), v.maxLength(MAX_QUERIES))]),
      v.description(`Text to search for, or a list of up to ${MAX_QUERIES} searches`)
    ),
    includeComponents: v.optional(
      v.pipe(v.boolean(), v.description('Search components and component sets. Default: true'))
    ),
    includeVariables: v.optional(
      v.pipe(v.boolean(), v.description('Search variables. Default: true'))
    ),
    includeStyles: v.optional(v.pipe(v.boolean(), v.description('Search styles. Default: true'))),
    limit: v.optional(
      toolNumber(
        v.pipe(
          v.number(),
          v.integer(),
          v.minValue(1),
          v.description(`Max results of each kind per query. Default: ${DEFAULT_LIMIT}`)
        )
      )
    ),
    fileKey: figmaClientInputs.fileKey
  }),
  execute: async (figma, args) => {
    const queries = typeof args.query === 'string' ? [args.query] : args.query
    const limit = args.limit ?? DEFAULT_LIMIT
    const graph = figma.graph
    const includeComponents = args.includeComponents !== false
    const libraryComponents = includeComponents ? await findLibraryComponents(figma, {}) : []
    const variables = args.includeVariables === false ? [] : [...graph.variables.values()]
    const styles = args.includeStyles === false ? [] : [...documentStyles(graph).values()]

    const results = queries.map((query): SearchResult => {
      const { matches, rank } = queryMatcher(query)
      const components = includeComponents
        ? [
            ...findDocumentComponents(figma, (name) => matches(name), {
              limit: Number.POSITIVE_INFINITY,
              variants: false
            }),
            ...libraryComponents.filter((asset) => matches(asset.name, asset.description))
          ]
        : []
      return {
        query,
        components: ranked(components, rank, limit),
        variables: ranked(
          variables.filter((variable) => matches(variable.name, variable.description)),
          rank,
          limit
        ).map((variable) => foundVariable(graph, variable)),
        styles: ranked(
          styles.filter((style) => matches(style.name)),
          rank,
          limit
        )
      }
    })
    return { results }
  }
})
