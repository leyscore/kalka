import { isEqual, pick } from 'es-toolkit'
import * as v from 'valibot'

import { isHTMLClassName, parseHTMLClasses } from './html-element'
import type { SceneGraph } from './index'
import { createDefaultNode } from './node-defaults'
import type { NodeType, SceneNode } from './types'

/**
 * CSS classes: named styles a layer takes from its `class` attribute. A class keeps the layer
 * fields it sets; every layer with the class holds those values itself, so drawing, layout and
 * `.fig` files work as for any layer, and exports write them once as a class rule. A layer value
 * that differs from its classes' is that layer's own, written inline after the rule.
 *
 * The document's classes live on its root node, in the order their rules are written: a later
 * class wins over an earlier one, as in a stylesheet.
 */

/** A class styles boxes (frames, shapes) or text, whose fills mean different CSS. */
export const CSS_CLASS_KINDS = ['box', 'text'] as const
export type CSSClassKind = (typeof CSS_CLASS_KINDS)[number]

/** The fields a class can set on layers of its kind: paint, corners, padding and type. */
export const CSS_CLASS_FIELDS = {
  box: [
    'fills',
    'strokes',
    'strokeWeight',
    'strokeAlign',
    'dashPattern',
    'cornerRadius',
    'topLeftRadius',
    'topRightRadius',
    'bottomRightRadius',
    'bottomLeftRadius',
    'independentCorners',
    'effects',
    'opacity',
    'blendMode',
    'layoutMode',
    'layoutWrap',
    'primaryAxisAlign',
    'counterAxisAlign',
    'itemSpacing',
    'counterAxisSpacing',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft'
  ],
  text: [
    'fills',
    'effects',
    'opacity',
    'blendMode',
    'fontFamily',
    'fontWeight',
    'italic',
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'textAlignHorizontal',
    'textCase',
    'textDecoration'
  ]
} as const satisfies Record<CSSClassKind, readonly (keyof SceneNode)[]>

export type CSSClassField = (typeof CSS_CLASS_FIELDS)[CSSClassKind][number]
export type CSSClassStyle = Partial<Pick<SceneNode, CSSClassField>>

export interface CSSClass {
  name: string
  kind: CSSClassKind
  /** The fields the class sets; the others are left to each layer. */
  style: CSSClassStyle
}

export function cssClassKind(node: Pick<SceneNode, 'type'>): CSSClassKind {
  return node.type === 'TEXT' ? 'text' : 'box'
}

function fieldsOf(kind: CSSClassKind): readonly CSSClassField[] {
  return CSS_CLASS_FIELDS[kind]
}

/** Only the fields a class of `kind` can set, from a style read from a file or a tool. */
export function cssClassStyle(kind: CSSClassKind, style: Partial<SceneNode>): CSSClassStyle {
  return structuredClone(
    pick(
      style,
      fieldsOf(kind).filter((field) => field in style)
    )
  )
}

const cssClassSchema: v.GenericSchema<unknown, CSSClass> = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.check(isHTMLClassName)),
    kind: v.picklist(CSS_CLASS_KINDS),
    style: v.record(v.string(), v.unknown())
  }),
  v.transform(({ name, kind, style }) => ({
    name,
    kind,
    style: cssClassStyle(kind, style as Partial<SceneNode>)
  }))
)

/** Stored classes, from a file: a malformed class is dropped, and a repeated name kept once. */
export const cssClassesSchema: v.GenericSchema<unknown, CSSClass[]> = v.pipe(
  v.array(v.unknown()),
  v.transform((items) => {
    const classes: CSSClass[] = []
    for (const item of items) {
      const parsed = v.safeParse(cssClassSchema, item)
      if (parsed.success && !classes.some((known) => known.name === parsed.output.name))
        classes.push(parsed.output)
    }
    return classes
  })
)

export function documentCSSClasses(graph: SceneGraph): CSSClass[] {
  return graph.getNode(graph.rootId)?.cssClasses ?? []
}

export function findCSSClass(graph: SceneGraph, name: string): CSSClass | undefined {
  return documentCSSClasses(graph).find((cssClass) => cssClass.name === name)
}

/**
 * What a layer's classes set together, the later class in the document winning, as the cascade
 * does. Classes of the other kind style nothing on the layer.
 */
export function effectiveClassStyle(
  classes: readonly CSSClass[],
  names: readonly string[],
  kind: CSSClassKind
): CSSClassStyle {
  const style: CSSClassStyle = {}
  for (const cssClass of classes)
    if (cssClass.kind === kind && names.includes(cssClass.name))
      Object.assign(style, structuredClone(cssClass.style))
  return style
}

export function nodeClassStyle(graph: SceneGraph, node: SceneNode): CSSClassStyle {
  return effectiveClassStyle(documentCSSClasses(graph), node.htmlClasses, cssClassKind(node))
}

const DEFAULTS = new Map<NodeType, SceneNode>()

function defaultsFor(type: NodeType): SceneNode {
  let node = DEFAULTS.get(type)
  if (!node) {
    node = createDefaultNode(() => '', type)
    DEFAULTS.set(type, node)
  }
  return node
}

/** A layer's look as a class: the fields of its kind that differ from a new layer's. */
export function classStyleFromNode(node: SceneNode): CSSClassStyle {
  const defaults = defaultsFor(node.type)
  const fields = fieldsOf(cssClassKind(node)).filter(
    (field) => !isEqual(node[field], defaults[field])
  )
  return structuredClone(pick(node, fields))
}

function setDocumentClasses(graph: SceneGraph, classes: CSSClass[]): void {
  graph.updateNode(graph.rootId, { cssClasses: classes })
}

function nodesWithClass(graph: SceneGraph, name: string): SceneNode[] {
  return [...graph.getAllNodes()].filter((node) => node.htmlClasses.includes(name))
}

/** What a field of a layer shows when nothing sets it: its classes' value, or a new layer's. */
function baseline(node: SceneNode, style: CSSClassStyle, field: CSSClassField): unknown {
  return field in style ? style[field] : defaultsFor(node.type)[field]
}

/**
 * The fields where a layer has its own value: one its classes set differently, or one they leave
 * alone that differs from a new layer's. Exports write these inline, after the class rules.
 */
export function classOverrides(graph: SceneGraph, node: SceneNode): CSSClassField[] {
  if (node.htmlClasses.length === 0) return []
  const style = nodeClassStyle(graph, node)
  return fieldsOf(cssClassKind(node)).filter(
    (field) => !isEqual(node[field], baseline(node, style, field))
  )
}

/**
 * Moves a layer from one set of class values to another: a field that showed its classes' value,
 * or a new layer's where they set none, shows the new one; a field the layer set itself keeps it.
 */
function restyleNode(
  graph: SceneGraph,
  node: SceneNode,
  before: CSSClassStyle,
  after: CSSClassStyle
): void {
  const changes: Partial<SceneNode> = {}
  const fields = new Set([...Object.keys(before), ...Object.keys(after)] as CSSClassField[])
  for (const field of fields) {
    const from = baseline(node, before, field)
    const to = baseline(node, after, field)
    if (isEqual(from, to) || !isEqual(node[field], from)) continue
    Object.assign(changes, { [field]: structuredClone(to) })
  }
  if (Object.keys(changes).length > 0) graph.updateNode(node.id, changes)
}

/**
 * Adds a class, or replaces the one of that name, and restyles the layers that have it. A new
 * class is written after the others, so it wins over them.
 */
export function setCSSClass(graph: SceneGraph, next: CSSClass): void {
  const before = documentCSSClasses(graph)
  const known = before.some((cssClass) => cssClass.name === next.name)
  const stored: CSSClass = { ...next, style: cssClassStyle(next.kind, next.style) }
  const after = known
    ? before.map((cssClass) => (cssClass.name === next.name ? stored : cssClass))
    : [...before, stored]
  setDocumentClasses(graph, after)
  for (const node of nodesWithClass(graph, next.name)) {
    const kind = cssClassKind(node)
    restyleNode(
      graph,
      node,
      effectiveClassStyle(before, node.htmlClasses, kind),
      effectiveClassStyle(after, node.htmlClasses, kind)
    )
  }
}

/** Renames a class in the document and on every layer that has it. */
export function renameCSSClass(graph: SceneGraph, name: string, nextName: string): boolean {
  if (!isHTMLClassName(nextName) || findCSSClass(graph, nextName) || !findCSSClass(graph, name))
    return false
  setDocumentClasses(
    graph,
    documentCSSClasses(graph).map((cssClass) =>
      cssClass.name === name ? { ...cssClass, name: nextName } : cssClass
    )
  )
  for (const node of nodesWithClass(graph, name))
    graph.updateNode(node.id, {
      htmlClasses: node.htmlClasses.map((item) => (item === name ? nextName : item))
    })
  return true
}

/** Removes a class from the document and its name from layers; they keep how they look. */
export function deleteCSSClass(graph: SceneGraph, name: string): void {
  if (!findCSSClass(graph, name)) return
  setDocumentClasses(
    graph,
    documentCSSClasses(graph).filter((cssClass) => cssClass.name !== name)
  )
  for (const node of nodesWithClass(graph, name))
    graph.updateNode(node.id, { htmlClasses: node.htmlClasses.filter((item) => item !== name) })
}

/**
 * Gives a layer its class names. A name new to the layer brings its class's look, and a name the
 * document has no class for becomes a class with the layer's current look, as typing a new class
 * in a stylesheet tool does. Removing a name leaves the layer as it looks.
 */
export function assignHTMLClasses(
  graph: SceneGraph,
  nodeId: string,
  value: string | readonly string[]
): string[] {
  const node = graph.getNode(nodeId)
  if (!node) return []
  const names = parseHTMLClasses(value)
  const added = names.filter((name) => !node.htmlClasses.includes(name))
  for (const name of added)
    if (!findCSSClass(graph, name))
      setCSSClass(graph, { name, kind: cssClassKind(node), style: classStyleFromNode(node) })
  graph.updateNode(nodeId, { htmlClasses: names })
  const classes = documentCSSClasses(graph).filter((cssClass) => added.includes(cssClass.name))
  const style = effectiveClassStyle(documentCSSClasses(graph), names, cssClassKind(node))
  const brought = effectiveClassStyle(classes, added, cssClassKind(node))
  const changes = pick(style, Object.keys(brought) as CSSClassField[])
  if (Object.keys(changes).length > 0) graph.updateNode(nodeId, structuredClone(changes))
  return names
}

/** Sets a layer's fields back to what its classes give, dropping its own values. */
export function resetClassOverrides(graph: SceneGraph, nodeId: string): void {
  const node = graph.getNode(nodeId)
  if (!node) return
  const style = nodeClassStyle(graph, node)
  const changes: Partial<SceneNode> = {}
  for (const field of classOverrides(graph, node))
    Object.assign(changes, { [field]: structuredClone(baseline(node, style, field)) })
  if (Object.keys(changes).length > 0) graph.updateNode(nodeId, changes)
}

/**
 * Makes a layer's own values part of a class, so every layer with the class takes them. The
 * class is the layer's last one of its kind unless another is named.
 */
export function updateClassFromNode(
  graph: SceneGraph,
  nodeId: string,
  name?: string
): CSSClass | undefined {
  const node = graph.getNode(nodeId)
  if (!node) return undefined
  const kind = cssClassKind(node)
  const target =
    (name ? findCSSClass(graph, name) : undefined) ??
    documentCSSClasses(graph).findLast(
      (cssClass) => cssClass.kind === kind && node.htmlClasses.includes(cssClass.name)
    )
  if (target?.kind !== kind) return undefined
  const overrides = pick(node, classOverrides(graph, node))
  const next: CSSClass = { ...target, style: { ...target.style, ...structuredClone(overrides) } }
  setCSSClass(graph, next)
  return next
}
