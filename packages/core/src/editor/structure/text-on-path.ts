import { encodePathCommandsBlob } from '@kalka/fig/node-change'
import { cloneVectorNetwork, type SceneNode, type TextPathData } from '@kalka/scene-graph'
import { lineEndNetwork } from '@kalka/scene-graph/arrow-caps'
import { createDefaultNode } from '@kalka/scene-graph/node-defaults'
import type { Rect } from '@kalka/scene-graph/primitives'

import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, pushDocumentChange } from '#core/editor/history/document-change'
import { newLayerDefaults } from '#core/editor/shapes/defaults'
import type { EditorContext } from '#core/editor/types'
import { fontManager, weightToStyle } from '#core/text/fonts'
import { getGlyphOutlineMetricsSync } from '#core/text/opentype'
import { layoutPathTextFromAdvances } from '#core/text/path'

/** What a new text on a path says until it is typed over, as Figma's "Type something". */
export const DEFAULT_PATH_TEXT = 'Type something'

function pathOf(node: SceneNode): TextPathData['network'] | null {
  if (node.type === 'VECTOR' && node.vectorNetwork && node.vectorNetwork.segments.length > 0) {
    return cloneVectorNetwork(node.vectorNetwork)
  }
  if (node.type === 'LINE') return lineEndNetwork(node.width, node.height)
  return null
}

/**
 * The text-on-a-path fields of a text laid along `node`'s path from its start, its baseline on
 * the path, in the font the text has; null when the font is not loaded or the path is empty.
 */
export function textOnPathFields(
  path: SceneNode,
  text: Pick<SceneNode, 'fontFamily' | 'fontWeight' | 'italic' | 'fontSize' | 'letterSpacing'>,
  characters: string
): Pick<SceneNode, 'textPathData' | 'textPathBox' | 'derivedTextGlyphs'> | null {
  const network = pathOf(path)
  if (!network) return null
  // A straight line has no height; the path keeps its scale with a box at least a pixel high.
  const box: Rect = { x: 0, y: 0, width: Math.max(path.width, 1), height: Math.max(path.height, 1) }
  const data: TextPathData = {
    network,
    normalizedSize: { x: box.width, y: box.height },
    tValue: 0,
    forward: true
  }
  const metrics = getGlyphOutlineMetricsSync(
    text.fontFamily,
    weightToStyle(text.fontWeight, text.italic),
    characters,
    text.fontSize
  )
  if (!metrics) return null
  const glyphs = layoutPathTextFromAdvances(
    data,
    box,
    0,
    0,
    metrics.map((metric) => ({
      commandsBlob: encodePathCommandsBlob(metric.commands, text.fontSize),
      fontSize: text.fontSize,
      advance: (metric.advance + text.letterSpacing) / text.fontSize
    }))
  )
  return glyphs ? { textPathData: data, textPathBox: box, derivedTextGlyphs: glyphs } : null
}

/**
 * Figma Draw's text on a path: a selected path or line becomes a text that runs along it, as a
 * press with the Text tool on a path does in Figma. One undo step; the new text is selected.
 */
export function createTextOnPathActions(ctx: EditorContext) {
  function target(): SceneNode | null {
    if (ctx.state.selectedIds.size !== 1) return null
    const [id] = ctx.state.selectedIds
    const node = ctx.graph.getNode(id)
    if (!node || node.locked || !getNodeEditCapability(ctx.graph, id).editable) return null
    return pathOf(node) ? node : null
  }

  function canPlaceTextOnPathSelected(): boolean {
    return target() !== null
  }

  /** Lays a text along the selected path, loading its font first. The new text's id, or null. */
  async function placeTextOnPathSelected(characters = DEFAULT_PATH_TEXT): Promise<string | null> {
    const path = target()
    const parent = path?.parentId ? ctx.graph.getNode(path.parentId) : undefined
    if (!path || !parent) return null
    const defaults = createDefaultNode(() => '', 'TEXT')
    await fontManager.ensureNodeFont(defaults.fontFamily, defaults.fontWeight)
    // The path may have changed while the font loaded.
    if (ctx.graph.getNode(path.id) !== path) return null
    const fields = textOnPathFields(path, defaults, characters)
    if (!fields) return null

    const before = new Set(ctx.state.selectedIds)
    const finish = captureDocumentChange(ctx.graph, ctx.state.currentPageId)
    const index = parent.childIds.indexOf(path.id)
    const text = ctx.graph.createNode('TEXT', parent.id, {
      ...newLayerDefaults('TEXT'),
      name: characters,
      text: characters,
      x: path.x,
      y: path.y,
      width: Math.max(path.width, 1),
      height: Math.max(path.height, 1),
      rotation: path.rotation,
      textAutoResize: 'NONE',
      ...fields
    })
    ctx.graph.insertChildAt(text.id, parent.id, index)
    ctx.graph.deleteNode(path.id)
    const change = finish()
    const selected = new Set([text.id])
    ctx.setSelectedIds(selected)
    pushDocumentChange(ctx, 'Text on path', change, before, selected)
    ctx.requestRender()
    return text.id
  }

  return { canPlaceTextOnPathSelected, placeTextOnPathSelected }
}
