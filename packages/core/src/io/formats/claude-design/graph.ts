import { SceneGraph } from '@kalka/scene-graph'
import { colorToFill } from '@kalka/scene-graph/color'

import { importTokensIntoGraph } from '#core/io/formats/design-tokens/apply'
import { defaultTokenImportOptions, planTokenImport } from '#core/io/formats/design-tokens/plan'
import { readDesignTokens } from '#core/io/formats/design-tokens/read'

import type { ClaudeDesignNote, ClaudeDesignProject } from './project'

/** The graph a project becomes, before its artboards: pages, notes, and design tokens. */
export interface ClaudeDesignGraph {
  graph: SceneGraph
  /** The Kalka page of a canvas page id; the first page for a board or note without one. */
  pageOf: (pageId: string | null) => string
}

/** Sticky colours of the canvas, as its `fill` names them. */
const STICKY_FILLS: Record<string, string> = {
  gray: '#ECECEC',
  red: '#FFD9D6',
  orange: '#FFE3C2',
  green: '#D9F2D6',
  teal: '#CDEFEA',
  blue: '#D6E6FF',
  purple: '#E7DCFF',
  pink: '#FFDCEE'
}
const STICKY_DEFAULT_FILL = '#FFF2B3'
const STICKY_WIDTH = 240
const STICKY_PADDING = 16
const TITLE_SIZE = 72

function addNote(graph: SceneGraph, pageId: string, note: ClaudeDesignNote): void {
  if (note.title) {
    graph.createNode('TEXT', pageId, {
      name: note.text.slice(0, 32),
      text: note.text,
      x: note.x,
      y: note.y,
      fontSize: TITLE_SIZE,
      fontWeight: 700,
      lineHeight: TITLE_SIZE * 1.1,
      width: note.width ?? note.text.length * TITLE_SIZE * 0.6,
      height: TITLE_SIZE * 1.1,
      textAutoResize: note.width ? 'HEIGHT' : 'WIDTH_AND_HEIGHT'
    })
    return
  }
  const width = note.width ?? STICKY_WIDTH
  const sticky = graph.createNode('FRAME', pageId, {
    name: 'Note',
    x: note.x,
    y: note.y,
    width,
    height: 120,
    cornerRadius: 6,
    fills: [colorToFill(STICKY_FILLS[note.fill ?? ''] ?? STICKY_DEFAULT_FILL)],
    layoutMode: 'VERTICAL',
    primaryAxisSizing: 'HUG',
    counterAxisSizing: 'FIXED',
    paddingTop: STICKY_PADDING,
    paddingRight: STICKY_PADDING,
    paddingBottom: STICKY_PADDING,
    paddingLeft: STICKY_PADDING
  })
  graph.createNode('TEXT', sticky.id, {
    name: note.text.slice(0, 32),
    text: note.text,
    width: width - STICKY_PADDING * 2,
    height: 20,
    fontSize: 16,
    lineHeight: 22,
    layoutAlignSelf: 'STRETCH',
    textAutoResize: 'HEIGHT'
  })
}

/**
 * A new document for a project: one page per canvas page (or one named after the project),
 * its notes, and its design systems' tokens as variables.
 */
export function createClaudeDesignGraph(project: ClaudeDesignProject): ClaudeDesignGraph {
  const graph = new SceneGraph()
  const first = graph.getPages()[0]
  const pages = new Map<string, string>()
  const firstPage = project.pages.at(0)
  first.name = firstPage?.name ?? project.title
  if (firstPage) pages.set(firstPage.id, first.id)
  for (const page of project.pages.slice(1)) pages.set(page.id, graph.addPage(page.name).id)
  const pageOf = (pageId: string | null) => (pageId !== null && pages.get(pageId)) || first.id

  for (const note of project.notes) addNote(graph, pageOf(note.pageId), note)

  if (project.tokenFiles.length > 0) {
    const bundle = readDesignTokens(project.tokenFiles)
    if (bundle.collections.length > 0) {
      const plan = planTokenImport(graph, bundle, defaultTokenImportOptions(graph, bundle))
      importTokensIntoGraph(graph, first.id, plan)
    }
  }
  return { graph, pageOf }
}
