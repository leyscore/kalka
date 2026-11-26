import * as v from 'valibot'

import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { guidToString } from '@kalka/kiwi/fig/guid'
import {
  ANNOTATION_CATEGORIES,
  ANNOTATION_PROPERTIES,
  documentComments,
  documentFrameReviews,
  isDevResourceURL,
  isHandoffThread,
  type AnnotationCategory,
  type AnnotationProperty,
  type CommentAuthor,
  type CommentThread,
  type DevResource,
  type FrameReview,
  type MeasurementSide,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'
import type { GUID } from '@kalka/scene-graph/primitives'

import type { InstanceOccurrence } from '../instance-overrides/occurrence/types'

/**
 * Figma's handoff records, both ways: annotations and measurements on layers, the dev status of
 * frames and sections, and dev resources. Kalka keeps annotations and measurements as comment
 * threads and statuses as frame reviews on the document's root; a file Figma wrote brings its
 * own into them, and an export writes them back onto the layers they belong to.
 */

/** Who an imported annotation is from: Figma's records keep no author. */
const FIGMA_AUTHOR: CommentAuthor = { kind: 'person', name: 'Figma' }

/** Figma's `AnnotationPropertyType` names, in the order `ANNOTATION_PROPERTIES` follows. */
const FIGMA_PROPERTY_TYPES = [
  'FILL',
  'STROKE',
  'WIDTH',
  'HEIGHT',
  'MIN_WIDTH',
  'MIN_HEIGHT',
  'MAX_WIDTH',
  'MAX_HEIGHT',
  'STROKE_WIDTH',
  'CORNER_RADIUS',
  'EFFECT',
  'TEXT_STYLE',
  'TEXT_ALIGN_HORIZONTAL',
  'FONT_FAMILY',
  'FONT_SIZE',
  'FONT_WEIGHT',
  'LINE_HEIGHT',
  'LETTER_SPACING',
  'STACK_SPACING',
  'STACK_PADDING',
  'STACK_MODE',
  'STACK_ALIGNMENT',
  'OPACITY',
  'COMPONENT',
  'FONT_STYLE',
  'GRID_ROW_GAP',
  'GRID_COLUMN_GAP',
  'GRID_ROW_COUNT',
  'GRID_COLUMN_COUNT',
  'GRID_ROW_ANCHOR_INDEX',
  'GRID_COLUMN_ANCHOR_INDEX',
  'GRID_ROW_SPAN',
  'GRID_COLUMN_SPAN'
] as const

const FROM_FIGMA = new Map<string, AnnotationProperty>(
  FIGMA_PROPERTY_TYPES.map((name, index) => [name, ANNOTATION_PROPERTIES[index]])
)

function propertyFromFigma(type: string | undefined): AnnotationProperty | undefined {
  return type === undefined ? undefined : FROM_FIGMA.get(type)
}

function propertyToFigma(property: AnnotationProperty): string {
  return FIGMA_PROPERTY_TYPES[ANNOTATION_PROPERTIES.indexOf(property)]
}

const SIDE_NAMES: Record<string, MeasurementSide> = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right'
}

/**
 * The document's annotation categories by GUID: Figma's presets, by name. A custom category has
 * a label and colour of its own, which Kalka does not keep, so its annotations come uncategorized.
 */
export function annotationCategoriesOf(
  document: NodeChange | undefined
): Map<string, AnnotationCategory> {
  const categories = new Map<string, AnnotationCategory>()
  const parsed = v.safeParse(CategoriesSchema, document?.annotationCategories)
  for (const item of parsed.success ? (parsed.output?.items ?? []) : []) {
    const preset = item.preset?.toLowerCase()
    const category = ANNOTATION_CATEGORIES.find((name) => name === preset)
    if (category && item.id) categories.set(guidToString(item.id), category)
  }
  return categories
}

const CategoriesSchema = v.optional(
  v.object({
    items: v.optional(
      v.array(
        v.object({
          id: v.optional(v.object({ sessionID: v.number(), localID: v.number() })),
          preset: v.optional(v.string())
        })
      )
    )
  })
)

/** A layer's dev resources from its record: web links only, named after them when unnamed. */
export function importDevResources(nc: NodeChange): { devResources?: DevResource[] } {
  const links = nc.developerRelatedLinks ?? []
  const devResources = links.flatMap((link) =>
    link.linkUrl && isDevResourceURL(link.linkUrl)
      ? [{ name: link.linkName ?? '', url: link.linkUrl }]
      : []
  )
  return devResources.length > 0 ? { devResources } : {}
}

/** The page holding a layer, which a thread's anchor names. */
function pageOf(graph: SceneGraph, nodeId: string): string | null {
  return graph.closest(nodeId, (node) => node.type === 'CANVAS')?.id ?? null
}

/** Ids for imported threads that stay the same for the same file, layer and record. */
function importedThreadId(nodeId: string, kind: string, index: number): string {
  return `fig-${kind}-${nodeId}-${index}`
}

type ThreadMaker = (kind: string, index: number, text: string) => CommentThread

/** The record's annotations that say something: a note or a pinned property. */
function importedAnnotations(
  nc: NodeChange,
  categories: ReadonlyMap<string, AnnotationCategory>,
  thread: ThreadMaker
): CommentThread[] {
  return (nc.annotations ?? []).flatMap((annotation, index) => {
    const properties = (annotation.properties ?? []).flatMap((property) => {
      const name = propertyFromFigma(property.type)
      return name ? [name] : []
    })
    const label = annotation.label ?? ''
    if (!label && properties.length === 0) return []
    const next = thread('annotation', index, label)
    next.annotation = { properties }
    const category = annotation.categoryId && categories.get(guidToString(annotation.categoryId))
    if (category) next.annotation.category = category
    return [next]
  })
}

function importedMeasurements(nc: NodeChange, thread: ThreadMaker): CommentThread[] {
  return (nc.measurements ?? []).flatMap((measurement, index) => {
    const side = SIDE_NAMES[measurement.fromNodeSide ?? '']
    if (!side || !measurement.toNode) return []
    const next = thread('measurement', index, measurement.freeText ?? '')
    next.measurement = {
      toNodeId: guidToString(measurement.toNode),
      side,
      toSameSide: measurement.toSameSide === true
    }
    return [next]
  })
}

/** A frame's or a section's dev status from its record, unless it has one already. */
function importDevStatus(graph: SceneGraph, nodeId: string, nc: NodeChange): void {
  const info = nc.sectionStatusInfo
  const reviews = documentFrameReviews(graph)
  if (info?.status !== 'BUILD' && info?.status !== 'COMPLETED') return
  if (reviews.some((review) => review.nodeId === nodeId)) return
  const review: FrameReview = {
    nodeId,
    status: info.status === 'BUILD' ? 'ready' : 'completed',
    by: FIGMA_AUTHOR.name,
    at: (info.lastUpdateUnixTimestamp ?? 0) * 1000
  }
  const description = info.description?.trim()
  if (description) review.description = description
  graph.updateNode(graph.rootId, { frameReviews: [...reviews, review] })
}

/**
 * Brings a record's annotations, measurements and dev status into the document's comments and
 * reviews. A layer that has its own already keeps them.
 */
export function importHandoffRecord(
  graph: SceneGraph,
  nodeId: string,
  nc: NodeChange,
  categories: ReadonlyMap<string, AnnotationCategory>,
  now = 0
): void {
  const node = graph.getNode(nodeId)
  const pageId = pageOf(graph, nodeId)
  if (!node || !pageId) return
  importDevStatus(graph, nodeId, nc)
  const threads = documentComments(graph)
  if (threads.some((thread) => thread.anchor.nodeId === nodeId && isHandoffThread(thread))) return
  const thread: ThreadMaker = (kind, index, text) => ({
    id: importedThreadId(nodeId, kind, index),
    anchor: { pageId, nodeId, x: node.width, y: 0 },
    messages: [
      {
        id: importedThreadId(nodeId, `${kind}-message`, index),
        author: { ...FIGMA_AUTHOR },
        text,
        createdAt: now
      }
    ],
    resolved: false
  })
  const added = [
    ...importedAnnotations(nc, categories, thread),
    ...importedMeasurements(nc, thread)
  ]
  if (added.length > 0) graph.updateNode(graph.rootId, { comments: [...threads, ...added] })
}

/** Annotations, measurements and dev statuses of the layers a load added, from their records. */
export function importHandoffRecords(
  graph: SceneGraph,
  pages: readonly InstanceOccurrence[],
  sources: ReadonlyMap<string, string>,
  categories: ReadonlyMap<string, AnnotationCategory>
): void {
  const visit = (occurrence: InstanceOccurrence): void => {
    const { properties } = occurrence
    if (properties.annotations || properties.measurements || properties.sectionStatusInfo) {
      const id = sources.get(occurrence.sourceId)
      if (id) importHandoffRecord(graph, id, properties, categories)
    }
    for (const child of occurrence.children) visit(child)
  }
  for (const page of pages) visit(page)
}

/**
 * Writes a layer's annotations, measurements, dev status and dev resources onto its record, so
 * Figma shows them. Runs after the archive's own fields are copied back, which they replace.
 */
export function exportHandoffFields(
  graph: SceneGraph,
  node: SceneNode,
  nc: NodeChange,
  guidOf: (id: string) => GUID | undefined
): void {
  const threads = documentComments(graph).filter((thread) => thread.anchor.nodeId === node.id)
  const annotations = threads.flatMap((thread) =>
    thread.annotation
      ? [
          {
            label: thread.messages[0]?.text ?? '',
            properties: thread.annotation.properties.map((property) => ({
              type: propertyToFigma(property)
            }))
          }
        ]
      : []
  )
  if (annotations.length > 0) nc.annotations = annotations
  else delete nc.annotations
  const from = guidOf(node.id)
  const measurements = threads.flatMap((thread) => {
    const measurement = thread.measurement
    const to = measurement && guidOf(measurement.toNodeId)
    if (!measurement || !to || !from) return []
    return [
      {
        fromNode: from,
        toNode: to,
        fromNodeSide: measurement.side.toUpperCase(),
        toSameSide: measurement.toSameSide,
        freeText: thread.messages[0]?.text ?? ''
      }
    ]
  })
  if (measurements.length > 0) nc.measurements = measurements
  else delete nc.measurements

  const review = documentFrameReviews(graph).find((candidate) => candidate.nodeId === node.id)
  if (review)
    nc.sectionStatusInfo = {
      status: review.status === 'completed' ? 'COMPLETED' : 'BUILD',
      lastUpdateUnixTimestamp: Math.floor(review.at / 1000),
      ...(review.description ? { description: review.description } : {})
    }
  else delete nc.sectionStatusInfo

  if (node.devResources.length > 0)
    nc.developerRelatedLinks = node.devResources.map((resource) => ({
      nodeId: '',
      fileKey: '',
      linkName: resource.name,
      linkUrl: resource.url
    }))
  else delete nc.developerRelatedLinks
}
