import { pick } from 'es-toolkit'

import type { DocumentColorSpace, SceneNode } from '@kalka/scene-graph'
import { resolveOkHCLForPreview, rgbaToOkHCL } from '@kalka/scene-graph/color'
import { copyEffects, copyFill, copyStyleRuns, copyStroke } from '@kalka/scene-graph/copy'

import type { EditorContext } from './types'

export type DocumentColorProfileMode = 'assign' | 'convert'

/** The node fields a color space conversion rewrites. */
const COLOR_FIELDS = ['fills', 'strokes', 'effects', 'styleRuns'] as const

function remapColor(color: SceneNode['fills'][number]['color'], target: DocumentColorSpace) {
  return resolveOkHCLForPreview(rgbaToOkHCL(color), { documentColorSpace: target }).color
}

function remapNodeColors(
  node: SceneNode,
  target: DocumentColorSpace,
  mode: DocumentColorProfileMode
): Partial<SceneNode> | null {
  if (mode === 'assign') return null

  const fills = node.fills.map((fill) => {
    const next = copyFill(fill)
    if (fill.type === 'SOLID') {
      const resolved = remapColor(fill.color, target)
      next.color = resolved
      next.opacity = resolved.a
      return next
    }
    if (fill.gradientStops) {
      next.gradientStops = fill.gradientStops.map((stop) => ({
        ...stop,
        color: remapColor(stop.color, target)
      }))
    }
    return next
  })

  const strokes = node.strokes.map((stroke) => {
    const next = copyStroke(stroke)
    const resolved = remapColor(stroke.color, target)
    next.color = resolved
    next.opacity = resolved.a
    return next
  })

  const effects = copyEffects(node.effects).map((effect) => ({
    ...effect,
    color: remapColor(effect.color, target)
  }))

  const styleRuns = copyStyleRuns(node.styleRuns).map((run) => ({
    ...run,
    style: {
      ...run.style,
      fills: run.style.fills?.map((fill) => {
        const next = copyFill(fill)
        if (fill.type === 'SOLID') {
          const resolved = remapColor(fill.color, target)
          next.color = resolved
          next.opacity = resolved.a
        }
        return next
      })
    }
  }))

  return { fills, strokes, effects, styleRuns }
}

export function createColorSpaceActions(ctx: EditorContext) {
  function applyColorSpace(colorSpace: DocumentColorSpace) {
    ctx.graph.documentColorSpace = colorSpace
    ctx.emitEditorEvent('document:color-space-changed', colorSpace)
    ctx.requestRender()
  }

  /** Assigns the document a color space, or converts its colors into it; one undo step either way. */
  function setDocumentColorSpace(
    colorSpace: DocumentColorSpace,
    mode: DocumentColorProfileMode = 'assign'
  ) {
    const previous = ctx.graph.documentColorSpace
    if (previous === colorSpace) return

    const label = mode === 'convert' ? 'Convert color space' : 'Assign color space'
    ctx.undo.runBatch(label, () => {
      if (mode === 'convert') {
        for (const node of ctx.graph.getAllNodes()) {
          const changes = remapNodeColors(node, colorSpace, mode)
          if (!changes) continue
          const before = structuredClone(pick(node, COLOR_FIELDS))
          ctx.graph.updateNode(node.id, changes)
          const after = structuredClone(pick(node, COLOR_FIELDS))
          ctx.undo.push({
            label,
            forward: () => ctx.graph.updateNode(node.id, structuredClone(after)),
            inverse: () => ctx.graph.updateNode(node.id, structuredClone(before))
          })
        }
      }
      applyColorSpace(colorSpace)
      ctx.undo.push({
        label,
        forward: () => applyColorSpace(colorSpace),
        inverse: () => applyColorSpace(previous)
      })
    })
  }

  return {
    setDocumentColorSpace
  }
}
