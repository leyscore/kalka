import {
  findInstanceAncestor,
  getSharedStyles,
  sharedStyleConsumers,
  sharedStyleKindsForType,
  sharedStyleRefKey,
  sharedStyleTypeForKind,
  sharedStyleValues,
  type NodeType,
  type SceneGraph,
  type SceneNode,
  type SharedStyleKind,
  type SharedStyleType
} from '@kalka/scene-graph'
import { randomHex } from '@kalka/scene-graph/random'

/** A style's type as the Plugin API names it. */
export type FigmaStyleType = 'PAINT' | 'TEXT' | 'EFFECT' | 'GRID'

const SHARED_TYPES = {
  PAINT: 'FILL',
  TEXT: 'TEXT',
  EFFECT: 'EFFECT',
  GRID: 'GRID'
} as const satisfies Record<FigmaStyleType, SharedStyleType>

const FIGMA_TYPES = {
  FILL: 'PAINT',
  TEXT: 'TEXT',
  EFFECT: 'EFFECT',
  GRID: 'GRID'
} as const satisfies Record<SharedStyleType, FigmaStyleType>

/** The layer a definition is, as `.fig` files and the editor keep them. */
const DEFINITION_TYPES: Record<FigmaStyleType, NodeType> = {
  PAINT: 'RECTANGLE',
  TEXT: 'TEXT',
  EFFECT: 'RECTANGLE',
  GRID: 'FRAME'
}

/** Each style property and the property of its definition layer's proxy that holds it. */
const VALUE_PROPERTIES: Record<FigmaStyleType, ReadonlyArray<readonly [string, string]>> = {
  PAINT: [['paints', 'fills']],
  EFFECT: [['effects', 'effects']],
  GRID: [['layoutGrids', 'layoutGrids']],
  TEXT: [
    'fontSize',
    'fontName',
    'letterSpacing',
    'lineHeight',
    'leadingTrim',
    'paragraphIndent',
    'paragraphSpacing',
    'listSpacing',
    'hangingPunctuation',
    'hangingList',
    'textCase',
    'textDecoration'
  ].map((name) => [name, name] as const)
}

const STYLE_FIELDS: Record<SharedStyleKind, string> = {
  fill: 'fillStyleId',
  stroke: 'strokeStyleId',
  text: 'textStyleId',
  effect: 'effectStyleId',
  grid: 'gridStyleId'
}

interface StyleHost {
  readonly graph: SceneGraph
  readonly currentPageId: string
  wrapNode(id: string): object
}

/** A new style as Figma makes one: named for its type, a colour style without paints. */
function newStyleProps(type: FigmaStyleType): Partial<SceneNode> {
  const props: Partial<SceneNode> = {
    name: type === 'PAINT' ? 'Color' : type.charAt(0) + type.slice(1).toLowerCase(),
    internalOnly: true,
    sharedStyleType: SHARED_TYPES[type]
  }
  if (type === 'TEXT') props.text = 'Ag'
  if (type === 'PAINT') props.fills = []
  return props
}

/** A style's definition layer, found by the id layers link it with. */
export function styleDefinition(
  graph: SceneGraph,
  styleId: string,
  type?: SharedStyleType
): SceneNode | null {
  if (!styleId) return null
  for (const node of graph.getAllNodes()) {
    if (node.source.id !== styleId || !node.sharedStyleType) continue
    if (!type || node.sharedStyleType === type) return node
  }
  return null
}

/**
 * What linking a layer to a style as `kind` changes: the link and, when the style is in the
 * document, the values it gives, as Figma's `setFillStyleIdAsync` and the like apply them.
 */
export function styleLinkChanges(
  graph: SceneGraph,
  node: SceneNode,
  kind: SharedStyleKind,
  styleId: string
): Partial<SceneNode> {
  const link = { [sharedStyleRefKey(kind)]: styleId || null }
  const style = styleDefinition(graph, styleId, sharedStyleTypeForKind(kind))
  return style ? { ...sharedStyleValues(kind, node, style), ...link } : link
}

/** Gives every layer using a style what it holds now; layers in instances follow their main. */
function propagate(graph: SceneGraph, style: SceneNode): void {
  const styleId = style.source.id
  const type = style.sharedStyleType
  if (!styleId || !type) return
  for (const kind of sharedStyleKindsForType(type)) {
    for (const consumer of sharedStyleConsumers(graph, kind, styleId)) {
      if (findInstanceAncestor(graph, consumer.id)) continue
      graph.updateNode(consumer.id, {
        ...sharedStyleValues(kind, consumer, style),
        [sharedStyleRefKey(kind)]: styleId
      })
    }
  }
}

/**
 * A style as the Plugin API's `PaintStyle`, `TextStyle`, `EffectStyle` or `GridStyle`. Its
 * values are read and written through its definition layer's proxy, so they convert as a layer's
 * do; writing one changes every layer using the style.
 */
function styleHandle(host: StyleHost, nodeId: string): object {
  const definition = (): SceneNode => {
    const node = host.graph.getNode(nodeId)
    if (!node?.sharedStyleType) throw new Error('This style has been removed')
    return node
  }
  const type = FIGMA_TYPES[definition().sharedStyleType ?? 'FILL']
  const handle: Record<string, unknown> = {}
  const properties: PropertyDescriptorMap = {
    id: { get: () => definition().source.id ?? '', enumerable: true },
    type: { value: type, enumerable: true },
    name: {
      get: () => definition().name,
      set: (name: string) => host.graph.updateNode(nodeId, { name: String(name) }),
      enumerable: true
    },
    description: {
      get: () => definition().symbolDescription,
      set: (text: string) => host.graph.updateNode(nodeId, { symbolDescription: String(text) }),
      enumerable: true
    },
    remote: { value: false, enumerable: true },
    key: { get: () => definition().source.id ?? '' },
    documentationLinks: { value: Object.freeze([]) },
    consumers: { get: () => consumers(host, definition()) },
    getStyleConsumersAsync: { value: async () => consumers(host, definition()) },
    remove: { value: () => removeStyle(host.graph, definition()) }
  }
  for (const [name, field] of VALUE_PROPERTIES[type]) {
    properties[name] = {
      get: () => Reflect.get(host.wrapNode(nodeId), field),
      set: (value: unknown) => {
        Reflect.set(host.wrapNode(nodeId), field, value)
        propagate(host.graph, definition())
      },
      enumerable: true
    }
  }
  return Object.defineProperties(handle, properties)
}

function consumers(host: StyleHost, style: SceneNode): Array<{ node: object; fields: string[] }> {
  const styleId = style.source.id
  const type = style.sharedStyleType
  if (!styleId || !type) return []
  const fields = new Map<string, string[]>()
  for (const kind of sharedStyleKindsForType(type)) {
    for (const consumer of sharedStyleConsumers(host.graph, kind, styleId)) {
      fields.set(consumer.id, [...(fields.get(consumer.id) ?? []), STYLE_FIELDS[kind]])
    }
  }
  return [...fields].map(([id, linked]) => ({ node: host.wrapNode(id), fields: linked }))
}

/** Deletes a style; layers using it keep its values and lose the link, as in Figma. */
function removeStyle(graph: SceneGraph, style: SceneNode): void {
  const styleId = style.source.id
  const type = style.sharedStyleType
  if (styleId && type) {
    for (const kind of sharedStyleKindsForType(type)) {
      for (const consumer of sharedStyleConsumers(graph, kind, styleId))
        graph.updateNode(consumer.id, { [sharedStyleRefKey(kind)]: null })
    }
  }
  graph.deleteNode(style.id)
}

/** The Plugin API's style calls on `figma`, over the document's shared styles. */
export class FigmaStylesAPI {
  constructor(private readonly host: StyleHost) {}

  /** Styles go on the document's internal page, as `.fig` files keep them, or the current page. */
  private hostPageId(): string {
    const graph = this.host.graph
    return graph.getPages(true).find((page) => page.internalOnly)?.id ?? this.host.currentPageId
  }

  create(type: FigmaStyleType): object {
    const node = this.host.graph.createNode(
      DEFINITION_TYPES[type],
      this.hostPageId(),
      newStyleProps(type)
    )
    node.source.id = `S:${randomHex(20)}`
    return styleHandle(this.host, node.id)
  }

  local(type: FigmaStyleType): object[] {
    const kind = sharedKind(type)
    return getSharedStyles(this.host.graph, kind).map((style) =>
      styleHandle(this.host, style.nodeId)
    )
  }

  byId(styleId: string): object | null {
    const node = styleDefinition(this.host.graph, styleId)
    return node ? styleHandle(this.host, node.id) : null
  }

  /** Moves `target` after `reference` in the list of its type, or first when it is null. */
  moveAfter(type: FigmaStyleType, target: unknown, reference: unknown): void {
    const graph = this.host.graph
    const moved = styleDefinition(graph, styleIdOf(target), SHARED_TYPES[type])
    if (!moved?.parentId) throw new Error('moveLocalStyleAfter: the style is not in this document')
    const after = reference
      ? styleDefinition(graph, styleIdOf(reference), SHARED_TYPES[type])
      : null
    this.place(type, moved, after)
  }

  /**
   * Moves a style folder, every style whose name starts with `target/`, after the folder
   * `reference` or first among its siblings when it is null, as Figma's
   * `moveLocalPaintFolderAfter` and the like do. Folders are slash-separated paths such as
   * `Brand/Colors`; the two must sit in the same parent folder.
   */
  moveFolderAfter(type: FigmaStyleType, target: string, reference: string | null): void {
    const call = `moveLocal${type.charAt(0)}${type.slice(1).toLowerCase()}FolderAfter`
    const folder = folderPath(target)
    const styles = getSharedStyles(this.host.graph, sharedKind(type))
    const inFolder = (path: string) =>
      styles.filter((style) => isWithin(styleFolder(style.name), path))
    const moving = inFolder(folder)
    if (!folder || moving.length === 0) throw new Error(`${call}: there is no folder "${target}"`)
    const parent = parentFolder(folder)
    let after: string | null
    if (reference === null) {
      // First among its siblings: before the first style of the parent folder.
      const first = styles.findIndex((style) => isWithin(styleFolder(style.name), parent))
      after = first > 0 ? styles[first - 1].nodeId : null
    } else {
      const referencePath = folderPath(reference)
      const anchors = inFolder(referencePath).filter((style) => !moving.includes(style))
      if (!referencePath || anchors.length === 0) {
        throw new Error(`${call}: there is no folder "${reference}"`)
      }
      if (parentFolder(referencePath) !== parent) {
        throw new Error(`${call}: "${target}" and "${reference}" are not in the same folder`)
      }
      after = anchors[anchors.length - 1].nodeId
    }
    if (moving.some((style) => style.nodeId === after)) return
    for (const style of moving) {
      const node = this.host.graph.getNode(style.nodeId)
      if (!node) continue
      this.place(type, node, after ? (this.host.graph.getNode(after) ?? null) : null)
      after = node.id
    }
  }

  /** Puts a style's definition after another of its type, or first when `after` is null. */
  private place(type: FigmaStyleType, moved: SceneNode, after: SceneNode | null): void {
    const graph = this.host.graph
    if (!moved.parentId) return
    const parentId = after?.parentId ?? moved.parentId
    const siblings = graph.getNode(parentId)?.childIds.filter((id) => id !== moved.id) ?? []
    const first = getSharedStyles(graph, sharedKind(type)).find(
      (style) => style.nodeId !== moved.id
    )
    const index = after
      ? siblings.indexOf(after.id) + 1
      : Math.max(0, first ? siblings.indexOf(first.nodeId) : 0)
    graph.reorderChild(moved.id, parentId, index)
  }
}

/** A folder path as Figma reads one: its names trimmed, empty ones dropped. */
function folderPath(path: string): string {
  return String(path)
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join('/')
}

/** The folder a style is filed in: its name before the last `/`, as the styles panel groups it. */
function styleFolder(name: string): string {
  const slash = name.lastIndexOf('/')
  return slash > 0 ? folderPath(name.slice(0, slash)) : ''
}

function parentFolder(path: string): string {
  const slash = path.lastIndexOf('/')
  return slash > 0 ? path.slice(0, slash) : ''
}

/** Whether a style in `folder` is in `path` or one of its subfolders; every style is in ''. */
function isWithin(folder: string, path: string): boolean {
  return path === '' || folder === path || folder.startsWith(`${path}/`)
}

const SHARED_KINDS = {
  PAINT: 'fill',
  TEXT: 'text',
  EFFECT: 'effect',
  GRID: 'grid'
} as const satisfies Record<FigmaStyleType, SharedStyleKind>

function sharedKind(type: FigmaStyleType): SharedStyleKind {
  return SHARED_KINDS[type]
}

function styleIdOf(style: unknown): string {
  if (!style || typeof style !== 'object') return ''
  const id = Reflect.get(style, 'id')
  return typeof id === 'string' ? id : ''
}
