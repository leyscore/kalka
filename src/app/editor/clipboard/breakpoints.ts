import { omit } from 'es-toolkit'

import type { Editor } from '@kalka/core/editor'
import {
  cloneNodeProps,
  createBreakpoint,
  RESPONSIVE_FIELDS,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import { linkedStylesheets, webFontCSS } from '@/app/document/io/web-fonts'

/**
 * A page copied at several widths, as Kalka Snapshot writes it: the widest copy is the HTML
 * itself, and each narrower one sits in a `<template data-kalka-breakpoint="<width>">` beside it,
 * with the same elements in the same order, hidden where the page hides them at that width.
 */
export interface SnapshotBreakpoint {
  width: number
  name: string
  html: string
}

/** A narrower copy; a copy holds no templates of its own, so the first closing tag ends it. */
const BREAKPOINT_TEMPLATE =
  /<template data-kalka-breakpoint="(\d+)"(?: data-kalka-name="([^"<>]*)")?>([\s\S]*?)<\/template>/g

/** The widest copy's HTML, and the narrower copies it carries, widest first. */
export function splitSnapshotBreakpoints(html: string): {
  html: string
  breakpoints: SnapshotBreakpoint[]
} {
  const breakpoints: SnapshotBreakpoint[] = []
  const widest = html.replace(
    BREAKPOINT_TEMPLATE,
    (_match, width: string, name: string | undefined, copy: string) => {
      const value = Number(width)
      if (value > 0) breakpoints.push({ width: value, name: name ?? width, html: copy })
      return ''
    }
  )
  breakpoints.sort((a, b) => b.width - a.width)
  return { html: widest, breakpoints }
}

/** Fields a breakpoint layer takes from its copy at that width; a breakpoint keeps its name. */
const COPIED_FIELDS: readonly (keyof SceneNode)[] = [
  ...RESPONSIVE_FIELDS.filter((field) => field !== 'name'),
  'width',
  'height',
  // CSS the layer model has no field for, such as a flex basis, which the canvas lays out with.
  'style'
]

/**
 * The page's margin on each side of the copied element at a breakpoint width: the element was
 * narrower than the window there, and the artboard keeps the difference as equal margins instead
 * of an empty strip on the right.
 */
function sideGutter(source: SceneNode, artboard: number): number {
  const gutter = (artboard - source.width) / 2
  return gutter > 0 ? gutter : 0
}

/**
 * Values a layer takes from its copy. `artboard` is the breakpoint artboard's width when `source`
 * is the copy's root; `shift` moves a layer placed by its parent's coordinates sideways.
 */
function valuesOf(source: SceneNode, artboard?: number, shift = 0): Partial<SceneNode> {
  const changes: Partial<SceneNode> = {}
  const own = artboard !== undefined
  for (const field of COPIED_FIELDS) {
    // A breakpoint artboard keeps its own place; its width is the breakpoint's.
    if (own && (field === 'x' || field === 'y' || field === 'width')) continue
    Object.assign(changes, { [field]: structuredClone(source[field]) })
  }
  if (shift) changes.x = source.x + shift
  if (!own || source.layoutMode === 'NONE') return changes
  // Auto layout places the children inside the padding, so the margin goes there.
  const gutter = sideGutter(source, artboard)
  if (!gutter) return changes
  return {
    ...changes,
    paddingLeft: source.paddingLeft + gutter,
    paddingRight: source.paddingRight + gutter
  }
}

/** Whether two layers are the same element: the importer names a layer after its classes or text. */
function sameLayer(target: SceneNode, source: SceneNode): boolean {
  return target.type === source.type && target.name === source.name
}

/** Fields that say how a layer sits in its parent, whatever the layer holds. */
const PLACING_FIELDS: readonly (keyof SceneNode)[] = [
  'layoutGrow',
  'layoutAlignSelf',
  'layoutPositioning',
  'opacity',
  'blendMode'
]

/**
 * The one text a frame shows. A heading whose second sentence the page hides at a width comes
 * in as a frame holding both, where the wider copy made the whole heading one text.
 */
function onlyShownText(graph: SceneGraph, frame: SceneNode): SceneNode | undefined {
  if (frame.type !== 'FRAME' || !frame.visible) return undefined
  const shown = graph.getChildren(frame.id).filter((child) => child.visible)
  const text = shown.at(0)
  return shown.length === 1 && text?.type === 'TEXT' ? text : undefined
}

/** What a text takes from the frame that stands for its element at a width: see above. */
function textFromFrame(frame: SceneNode, text: SceneNode, shift: number): Partial<SceneNode> {
  const changes = valuesOf(text)
  for (const field of PLACING_FIELDS)
    Object.assign(changes, { [field]: structuredClone(frame[field]) })
  // The frame's CSS places the element; the text's own says how it reads, its color for one.
  const reads = omit(text.style, ['display'])
  return {
    ...changes,
    style: { ...frame.style, ...reads },
    x: frame.x + text.x + shift,
    y: frame.y + text.y
  }
}

/** How a layer of the artboard meets its copy's layers at a width. */
interface Met {
  child: SceneNode
  /** The same element in the copy. */
  copy?: SceneNode
  /** A different layer the importer made in its place, where it made none of the same name. */
  placed?: SceneNode
}

/**
 * Pairs a layer's children with its copy's. The copies have the same elements in the same order,
 * so layers pair in order, by type and name. `extras` are the copy's layers nothing paired with,
 * each with the child it comes before: the page makes some elements only at a narrower width.
 */
function meet(
  graph: SceneGraph,
  target: SceneNode,
  copyGraph: SceneGraph,
  source: SceneNode
): { met: Met[]; extras: { copy: SceneNode; before?: SceneNode }[] } {
  const copies = copyGraph.getChildren(source.id)
  const met: Met[] = []
  const extras: { copy: SceneNode; before?: SceneNode }[] = []
  let next = 0
  for (const child of graph.getChildren(target.id)) {
    let found = next
    while (found < copies.length && !sameLayer(child, copies[found] ?? child)) found++
    const copy = copies.at(found)
    if (copy) {
      for (const extra of copies.slice(next, found)) extras.push({ copy: extra, before: child })
      met.push({ child, copy })
      next = found + 1
      continue
    }
    // The importer can make a different layer for an element the page hides at one width,
    // such as one text for a hidden row of links: the element in its place still says
    // whether the page shows it there.
    const placed = copies.at(next)
    const stands =
      placed &&
      ((child.type === 'TEXT' && onlyShownText(copyGraph, placed)) ||
        placed.visible !== child.visible)
    if (stands) next++
    met.push(stands ? { child, placed } : { child })
  }
  for (const extra of copies.slice(next)) extras.push({ copy: extra })
  return { met, extras }
}

/** Copies a layer of another graph, with what it holds, under `parentId`. */
function adopt(
  graph: SceneGraph,
  parentId: string,
  copyGraph: SceneGraph,
  layer: SceneNode
): SceneNode {
  const { source, ...props } = cloneNodeProps(layer, null)
  const made = graph.createNode(layer.type, parentId, {
    ...props,
    ...(source ? { source: { ...source, id: null, orderKey: null } } : {})
  })
  for (const child of copyGraph.getChildren(layer.id)) adopt(graph, made.id, copyGraph, child)
  return made
}

/**
 * Gives an artboard the layers only a narrower copy has, hidden, each where the copy has it: a
 * page can make an element only at a narrower width, such as a field that takes the place of a
 * button on a phone. The breakpoint made from the artboard then shows it, as `applyCopy` pairs it.
 */
export function adoptLayers(
  graph: SceneGraph,
  target: SceneNode,
  copyGraph: SceneGraph,
  source: SceneNode
): void {
  const { met, extras } = meet(graph, target, copyGraph, source)
  for (const { child, copy } of met) if (copy) adoptLayers(graph, child, copyGraph, copy)
  for (const { copy, before } of extras) {
    if (!copy.visible) continue
    const made = adopt(graph, target.id, copyGraph, copy)
    graph.updateNode(made.id, { visible: false })
    if (before) graph.insertChildAt(made.id, target.id, target.childIds.indexOf(before.id))
  }
}

/**
 * Gives each layer of a breakpoint the values its element had at that width: see `meet`. A layer
 * the copy has nothing for is not on the page at that width, so the breakpoint hides it.
 */
export function applyCopy(
  graph: SceneGraph,
  target: SceneNode,
  copyGraph: SceneGraph,
  source: SceneNode,
  root: boolean,
  shift = 0
): void {
  if (!root && !sameLayer(target, source)) return
  // A fill names its picture by hash: one the page shows only at this width comes with it.
  if (root)
    for (const [hash, bytes] of copyGraph.images)
      if (!graph.images.has(hash)) graph.images.set(hash, bytes)
  graph.updateNode(target.id, valuesOf(source, root ? target.width : undefined, shift))
  // Without auto layout the children sit at their own coordinates, so they carry the margin.
  const childShift = root && source.layoutMode === 'NONE' ? sideGutter(source, target.width) : 0
  for (const { child, copy, placed } of meet(graph, target, copyGraph, source).met) {
    if (copy) {
      applyCopy(graph, child, copyGraph, copy, false, childShift)
      continue
    }
    const text = placed && child.type === 'TEXT' ? onlyShownText(copyGraph, placed) : undefined
    if (placed && text) graph.updateNode(child.id, textFromFrame(placed, text, childShift))
    else if (child.visible) graph.updateNode(child.id, { visible: false })
  }
}

async function importCopy(
  html: string,
  fonts: Map<string, Promise<string>>
): Promise<{ graph: SceneGraph; root: SceneNode } | null> {
  const { browserHTMLToSceneGraph } = await import('@kalka/dom-css/browser')
  // Measured in the page's web fonts, as the widest copy is, or its text wraps differently.
  const cssText = await webFontCSS(linkedStylesheets(html), fonts)
  const graph = await browserHTMLToSceneGraph(html, {
    pageName: 'Pasted HTML',
    cssText: cssText || undefined
  })
  const root = graph
    .getPages()
    .flatMap((page) => graph.getChildren(page.id))
    .at(0)
  return root ? { graph, root } : null
}

/**
 * Adds a pasted artboard's narrower copies as its breakpoints, as one undo step: each is a
 * breakpoint linked to the artboard, whose layers take the values the page gave them there.
 */
export async function addSnapshotBreakpoints(
  editor: Editor,
  primaryId: string,
  breakpoints: readonly SnapshotBreakpoint[]
): Promise<void> {
  const pageId = editor.graph.getNode(primaryId)?.parentId
  if (!pageId) return
  // Laid out before the edit starts, so the recorded step holds only the breakpoints.
  const fonts = new Map<string, Promise<string>>()
  const copies = await Promise.all(
    breakpoints.map((breakpoint) => importCopy(breakpoint.html, fonts))
  )
  const finish = editor.captureDocumentChange(pageId)
  // Before any breakpoint is made from the artboard, so each holds what any width shows.
  const primary = editor.graph.getNode(primaryId)
  for (const copy of copies)
    if (primary && copy) adoptLayers(editor.graph, primary, copy.graph, copy.root)
  const created: string[] = []
  breakpoints.forEach((breakpoint, index) => {
    const copy = copies.at(index)
    const artboard = createBreakpoint(editor.graph, primaryId, breakpoint.width, breakpoint.name)
    if (!artboard) return
    created.push(artboard.id)
    if (copy) applyCopy(editor.graph, artboard, copy.graph, copy.root, true)
  })
  editor.runLayoutForNode(pageId)
  const change = finish()
  if (created.length === 0) return
  editor.pushUndoStep({
    label: 'Add breakpoints',
    forward: () => editor.restoreDocumentChange(change, 'after'),
    inverse: () => editor.restoreDocumentChange(change, 'before')
  })
  await editor.loadFontsForNodes(created)
  editor.requestRender()
}
