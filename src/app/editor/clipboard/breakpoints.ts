import type { Editor } from '@kalka/core/editor'
import {
  createBreakpoint,
  RESPONSIVE_FIELDS,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

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

function valuesOf(source: SceneNode, own: boolean): Partial<SceneNode> {
  const changes: Partial<SceneNode> = {}
  for (const field of COPIED_FIELDS) {
    // A breakpoint artboard keeps its own place; its width is the breakpoint's.
    if (own && (field === 'x' || field === 'y' || field === 'width')) continue
    Object.assign(changes, { [field]: structuredClone(source[field]) })
  }
  return changes
}

/**
 * Gives each layer of a breakpoint the values its element had at that width. The copies have
 * the same elements in the same order, so layers pair by position; a subtree whose layers do
 * not line up keeps following the wider breakpoint.
 */
function applyCopy(
  graph: SceneGraph,
  target: SceneNode,
  copyGraph: SceneGraph,
  source: SceneNode,
  root: boolean
): void {
  if (target.type !== source.type) return
  graph.updateNode(target.id, valuesOf(source, root))
  const children = graph.getChildren(target.id)
  const copies = copyGraph.getChildren(source.id)
  if (children.length !== copies.length) return
  children.forEach((child, index) => {
    const copy = copies.at(index)
    if (copy) applyCopy(graph, child, copyGraph, copy, false)
  })
}

async function importCopy(html: string): Promise<{ graph: SceneGraph; root: SceneNode } | null> {
  const { browserHTMLToSceneGraph } = await import('@kalka/dom-css/browser')
  const graph = await browserHTMLToSceneGraph(html, { pageName: 'Pasted HTML' })
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
  const copies = await Promise.all(breakpoints.map((breakpoint) => importCopy(breakpoint.html)))
  const finish = editor.captureDocumentChange(pageId)
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
