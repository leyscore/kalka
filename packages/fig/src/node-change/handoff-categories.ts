import * as v from 'valibot'

import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'
import {
  ANNOTATION_CATEGORIES,
  ANNOTATION_COLORS,
  documentAnnotationCategories,
  isPresetCategory,
  type AnnotationCategoryDefinition,
  type SceneGraph
} from '@kalka/scene-graph'
import type { GUID } from '@kalka/scene-graph/primitives'

/**
 * Annotation categories in `.fig` files, both ways: the document record lists Figma's presets and
 * the file's own categories, each with a GUID that annotations name. Kalka names a preset by its
 * name and one of the file's own by an ID that keeps the GUID it came with.
 */

const GuidSchema = v.object({ sessionID: v.number(), localID: v.number() })

const CategoriesSchema = v.object({
  version: v.optional(v.number()),
  items: v.optional(
    v.array(
      v.object({
        id: v.optional(GuidSchema),
        preset: v.optional(v.string()),
        custom: v.optional(
          v.object({ color: v.optional(v.string()), label: v.optional(v.string()) })
        )
      })
    )
  )
})

type CategoryItem = NonNullable<v.InferOutput<typeof CategoriesSchema>['items']>[number]

function categoryItems(value: unknown): CategoryItem[] {
  const parsed = v.safeParse(CategoriesSchema, value)
  return parsed.success ? (parsed.output.items ?? []) : []
}

/** The ID Kalka gives a category of the file's own, which keeps its GUID. */
function importedCategoryId(guid: GUID): string {
  return `category-${guid.sessionID}-${guid.localID}`
}

/** A Figma preset's name, lower-cased as Kalka names presets, or undefined for NONE. */
function presetName(item: CategoryItem) {
  const preset = item.preset?.toLowerCase()
  return ANNOTATION_CATEGORIES.find((name) => name === preset)
}

function customDefinition(item: CategoryItem): AnnotationCategoryDefinition | null {
  if (!item.id || !item.custom || presetName(item)) return null
  const color = item.custom.color?.toLowerCase()
  return {
    id: importedCategoryId(item.id),
    label: item.custom.label ?? '',
    color: ANNOTATION_COLORS.find((name) => name === color) ?? 'yellow'
  }
}

/**
 * The document's annotation categories by GUID: a preset by its name, one of the file's own by
 * the ID its definition gets.
 */
export function annotationCategoriesOf(document: NodeChange | undefined): Map<string, string> {
  const categories = new Map<string, string>()
  for (const item of categoryItems(document?.annotationCategories)) {
    if (!item.id) continue
    const category = presetName(item) ?? customDefinition(item)?.id
    if (category) categories.set(guidToString(item.id), category)
  }
  return categories
}

/** The categories a file Figma wrote defines next to the presets. */
export function customAnnotationCategoriesOf(
  document: NodeChange | undefined
): AnnotationCategoryDefinition[] {
  return categoryItems(document?.annotationCategories).flatMap((item) => {
    const definition = customDefinition(item)
    return definition ? [definition] : []
  })
}

/** A session no layer GUID uses, for the GUIDs of categories Kalka made. */
const CATEGORY_SESSION = 2147483646

const IMPORTED_ID = /^category-(\d+)-(\d+)$/

/**
 * The GUID a category is written with: the one the file opened with when it has one, so Figma
 * keeps the categories it knows; otherwise one made from the name or the ID, the same each time.
 */
export function annotationCategoryGuid(graph: SceneGraph, category: string): GUID {
  const imported = IMPORTED_ID.exec(category)
  if (imported) return { sessionID: Number(imported[1]), localID: Number(imported[2]) }
  if (isPresetCategory(category)) {
    const raw = graph.getNode(graph.rootId)?.source.fig.rawNodeFields.annotationCategories
    const known = categoryItems(raw).find((item) => presetName(item) === category)
    if (known?.id) return known.id
    return { sessionID: CATEGORY_SESSION, localID: ANNOTATION_CATEGORIES.indexOf(category) + 1 }
  }
  const hex = category.replace(/^category-/, '')
  const value = Number.parseInt(hex, 16)
  return { sessionID: CATEGORY_SESSION, localID: 100 + (Number.isFinite(value) ? value % 1e9 : 0) }
}

/**
 * Writes the document's categories onto its record, Figma's presets first, when any annotation
 * names a category or the document has its own; otherwise leaves the record as it came.
 */
export function exportAnnotationCategories(documentNc: NodeChange, graph: SceneGraph): void {
  const own = documentAnnotationCategories(graph)
  const threads = graph.getNode(graph.rootId)?.comments ?? []
  if (own.length === 0 && !threads.some((thread) => thread.annotation?.category)) return
  const previous = v.safeParse(CategoriesSchema, documentNc.annotationCategories)
  documentNc.annotationCategories = {
    version: (previous.success ? previous.output.version : undefined) ?? 1,
    items: [
      ...ANNOTATION_CATEGORIES.map((preset) => ({
        id: annotationCategoryGuid(graph, preset),
        preset: preset.toUpperCase()
      })),
      ...own.map((category) => ({
        id: annotationCategoryGuid(graph, category.id),
        preset: 'NONE',
        custom: { color: category.color.toUpperCase(), label: category.label }
      }))
    ]
  }
}
