import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import { PageIndex } from '#core/canvas/page-index'
import type { RenderOverlays } from '#core/canvas/renderer'
import { createSceneGeometry } from '#core/geometry'

import { hasFrameTitle } from './layout'

export interface CachedSection {
  nodeId: string
  nested: boolean
}

/** A frame on the page or in a section, which shows its name above it. */
export interface CachedFrame {
  nodeId: string
}

export interface CachedComponent {
  nodeId: string
  parentType: string
}

/** The layers of a page that show a label, in the order they draw. */
interface PageLabels {
  sections: CachedSection[]
  components: CachedComponent[]
  frames: CachedFrame[]
  componentSets: CachedFrame[]
}

const NO_LABELS: PageLabels = { sections: [], components: [], frames: [], componentSets: [] }

/** Fields that decide whether a layer shows a label: its kind, visibility and icon. */
const LABEL_FIELDS = new Set<string>(['type', 'visible', 'pluginData'])

interface Viewport {
  x: number
  y: number
  w: number
  h: number
}

const LABEL_TYPES = new Set(['COMPONENT', 'COMPONENT_SET'])
const COMPONENT_LABEL_PARENT_TYPES = new Set(['CANVAS', 'SECTION', 'COMPONENT_SET'])

function isInViewport(absX: number, absY: number, w: number, h: number, vp: Viewport): boolean {
  return absX + w >= vp.x && absY + h >= vp.y && absX <= vp.x + vp.w && absY <= vp.y + vp.h
}

function collectVisibleLabels<T extends { nodeId: string }, U extends object>(
  graph: SceneGraph,
  viewport: Viewport,
  cachedItems: T[],
  metadata: (cached: T) => U,
  preview: RenderOverlays['rotationPreview']
): Array<{ node: SceneNode; absX: number; absY: number } & U> {
  const result: Array<{ node: SceneNode; absX: number; absY: number } & U> = []
  const geometry = createSceneGeometry(graph, preview)
  for (const cached of cachedItems) {
    const node = graph.getNode(cached.nodeId)
    if (!node) continue
    const bounds = geometry.bounds(node)
    if (!isInViewport(bounds.x, bounds.y, bounds.width, bounds.height, viewport)) continue
    const origin = geometry.toWorld(node, { x: 0, y: 0 })
    result.push({ node, absX: origin.x, absY: origin.y, ...metadata(cached) })
  }
  return result
}

/**
 * The page's sections, components, component sets and titled frames. They are found by walking
 * the page once and again only after an edit that adds, removes, moves, hides or retypes a
 * layer, so moving or editing layers costs nothing here.
 */
export class LabelCache {
  private readonly index = new PageIndex<PageLabels>({
    build: buildLabels,
    affects: (change) =>
      change.kind === 'structure' ||
      Object.keys(change.changes).some((key) => LABEL_FIELDS.has(key))
  })
  private labels: PageLabels = NO_LABELS

  /** Reads the labels of `pageId`, walking it again only if an edit since could change them. */
  update(graph: SceneGraph, pageId: string | null): void {
    this.labels = this.index.get(graph, pageId ?? graph.rootId)
  }

  invalidate(): void {
    this.index.invalidate()
    this.labels = NO_LABELS
  }

  /** Stops following the graph; the labels last read stay. */
  dispose(): void {
    this.index.dispose()
  }

  getSections(
    graph: SceneGraph,
    viewport: Viewport,
    preview?: RenderOverlays['rotationPreview']
  ): Array<{ node: SceneNode; absX: number; absY: number; nested: boolean }> {
    return collectVisibleLabels(
      graph,
      viewport,
      this.labels.sections,
      (cached) => ({
        nested: cached.nested
      }),
      preview
    )
  }

  getComponents(
    graph: SceneGraph,
    viewport: Viewport,
    preview?: RenderOverlays['rotationPreview']
  ): Array<{ node: SceneNode; absX: number; absY: number; inside: boolean }> {
    return collectVisibleLabels(
      graph,
      viewport,
      this.labels.components,
      () => ({
        inside: false
      }),
      preview
    )
  }

  getFrames(
    graph: SceneGraph,
    viewport: Viewport,
    preview?: RenderOverlays['rotationPreview']
  ): Array<{ node: SceneNode; absX: number; absY: number }> {
    return collectVisibleLabels(graph, viewport, this.labels.frames, () => ({}), preview)
  }

  /** Every visible component set on the page in the viewport, wherever it is nested. */
  getComponentSets(
    graph: SceneGraph,
    viewport: Viewport,
    preview?: RenderOverlays['rotationPreview']
  ): Array<{ node: SceneNode; absX: number; absY: number }> {
    return collectVisibleLabels(graph, viewport, this.labels.componentSets, () => ({}), preview)
  }

  getAllFrames(): readonly CachedFrame[] {
    return this.labels.frames
  }

  getAllSections(): readonly CachedSection[] {
    return this.labels.sections
  }

  getAllComponents(): readonly CachedComponent[] {
    return this.labels.components
  }

  /** Every visible component set on the page, wherever it is nested. */
  getAllComponentSets(): readonly CachedFrame[] {
    return this.labels.componentSets
  }
}

function buildLabels(graph: SceneGraph, pageId: string): PageLabels {
  const labels: PageLabels = { sections: [], components: [], frames: [], componentSets: [] }
  if (graph.getNode(pageId)) walkChildren(graph, labels, pageId, false)
  return labels
}

function walkChildren(
  graph: SceneGraph,
  labels: PageLabels,
  parentId: string,
  insideSection: boolean
): void {
  const parent = graph.getNode(parentId)
  if (!parent) return
  const parentType = parent.type

  for (const childId of parent.childIds) {
    const child = graph.getNode(childId)
    if (!child || !child.visible) continue

    if (child.type === 'SECTION') {
      labels.sections.push({ nodeId: childId, nested: insideSection })
      walkChildren(graph, labels, childId, true)
    } else if (LABEL_TYPES.has(child.type)) {
      if (child.type === 'COMPONENT_SET') labels.componentSets.push({ nodeId: childId })
      if (COMPONENT_LABEL_PARENT_TYPES.has(parentType)) {
        labels.components.push({ nodeId: childId, parentType })
      }
      if (child.childIds.length > 0) walkChildren(graph, labels, childId, insideSection)
    } else {
      if (hasFrameTitle(child, parentType)) labels.frames.push({ nodeId: childId })
      if (child.childIds.length > 0) walkChildren(graph, labels, childId, insideSection)
    }
  }
}
