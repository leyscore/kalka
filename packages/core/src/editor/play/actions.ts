import { pageHasPrototype } from '@kalka/scene-graph'

import type { EditorContext } from '#core/editor/types'

import { presentationStart } from './prototype'

/**
 * A previewing canvas: its islands remount whenever the revision changes. A page with a
 * prototype is presented instead, a screen at a time from `present.startId`.
 */
export interface PlayState {
  revision: number
  present: { startId: string } | null
}

export function createPlayActions(ctx: EditorContext) {
  /**
   * Preview this canvas: layers holding controls run as live components. A page with
   * interactions or flows is presented as a prototype, from `startId` or the selected screen.
   */
  function startPlay(options: { startId?: string } = {}): void {
    if (ctx.state.play) return
    const { graph } = ctx
    const pageId = ctx.state.currentPageId
    const startId =
      options.startId ??
      (pageHasPrototype(graph, pageId)
        ? presentationStart(graph, pageId, ctx.state.selectedIds)
        : null)
    ctx.state.play = { revision: 0, present: startId ? { startId } : null }
    ctx.state.hoveredNodeId = null
    ctx.requestRepaint()
  }

  /** Go back to editing; the canvas draws every layer again. */
  function stopPlay(): void {
    if (!ctx.state.play) return
    ctx.state.play = null
    ctx.requestRepaint()
  }

  function togglePlay(): void {
    if (ctx.state.play) stopPlay()
    else startPlay()
  }

  /** Put every control back as designed by running the islands afresh; a prototype restarts. */
  function resetPlay(): void {
    if (ctx.state.play)
      ctx.state.play = { ...ctx.state.play, revision: ctx.state.play.revision + 1 }
  }

  /** Present from another frame, such as another flow's start, as a fresh presentation. */
  function presentFrom(startId: string): void {
    const play = ctx.state.play
    if (!play?.present || !ctx.graph.getNode(startId)) return
    ctx.state.play = { revision: play.revision + 1, present: { startId } }
  }

  // Another document's layers start from their designed state, not from the old islands'.
  ctx.onEditorEvent('graph:replaced', resetPlay)

  return { startPlay, stopPlay, togglePlay, resetPlay, presentFrom }
}
