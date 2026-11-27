import { createPrototypeReaction, type PrototypeReaction, type SceneNode } from '@kalka/scene-graph'

import type { EditorContext } from '#core/editor/types'

import { screenOf } from './prototype'

/** A prototype connection being dragged out of a layer on the canvas, in canvas coordinates. */
export interface PrototypeLinkDrag {
  sourceId: string
  x: number
  y: number
  /** The frame it would connect to if dropped here. */
  targetId: string | null
}

type NodeUpdater = (id: string, changes: Partial<SceneNode>, label?: string) => void

/**
 * Prototype editing: the Prototype tab's state, which makes the canvas draw connections, and the
 * changes to a layer's interactions, each one undo step.
 */
export function createPrototypeActions(ctx: EditorContext, updateNodeWithUndo: NodeUpdater) {
  /** Show the Prototype tab's canvas: connections between layers and frames. */
  function setPrototyping(on: boolean): void {
    if ((ctx.state.prototyping === true) === on) return
    ctx.state.prototyping = on
    ctx.state.prototypeLink = null
    ctx.requestRepaint()
  }

  function setPrototypeLink(link: PrototypeLinkDrag | null): void {
    ctx.state.prototypeLink = link
    ctx.requestRepaint()
  }

  /**
   * Set a layer's interactions. A frame that becomes an overlay for the first time closes on a
   * click outside it, as Figma's overlay settings start, in the same undo step.
   */
  function setReactions(
    nodeId: string,
    reactions: PrototypeReaction[],
    label = 'Edit interaction'
  ) {
    const newOverlays = overlayDestinations(reactions).filter((id) => !isOverlayTarget(id))
    if (newOverlays.length === 0) {
      updateNodeWithUndo(nodeId, { reactions }, label)
      return
    }
    ctx.undo.runBatch(label, () => {
      updateNodeWithUndo(nodeId, { reactions }, label)
      for (const id of newOverlays) {
        const frame = ctx.graph.getNode(id)
        if (frame?.overlayBackgroundInteraction === 'NONE' && frame.overlayBackground === null)
          updateNodeWithUndo(id, { overlayBackgroundInteraction: 'CLOSE_ON_CLICK_OUTSIDE' }, label)
      }
    })
  }

  /** The frames these interactions open as overlays. */
  function overlayDestinations(reactions: readonly PrototypeReaction[]): string[] {
    const ids = new Set<string>()
    for (const reaction of reactions)
      for (const action of reaction.actions)
        if (action.type === 'NODE' && action.navigation === 'OVERLAY' && action.destinationId)
          ids.add(action.destinationId)
    return [...ids]
  }

  /** Whether any layer already opens this frame as an overlay. */
  function isOverlayTarget(frameId: string): boolean {
    for (const node of ctx.graph.getAllNodes())
      if (overlayDestinations(node.reactions).includes(frameId)) return true
    return false
  }

  /**
   * The frame a connection dropped at a point goes to: the top-level frame there, unless it is
   * the source's own screen.
   */
  function prototypeTargetAt(sourceId: string, x: number, y: number): string | null {
    const hit = ctx.graph.hitTestDeep(x, y, ctx.state.currentPageId)
    const screen = hit ? screenOf(ctx.graph, hit.id) : undefined
    if (!screen || screen.type === 'SECTION') return null
    return screen.id === screenOf(ctx.graph, sourceId)?.id ? null : screen.id
  }

  /**
   * Connect a layer to a frame, as dropping Figma's connection handle does: its On click
   * interaction navigates there, or a new On click, Navigate to, Instant one does.
   */
  function connectPrototype(sourceId: string, destinationId: string): void {
    const source = ctx.graph.getNode(sourceId)
    if (!source) return
    const reactions = structuredClone(source.reactions)
    const click = reactions.find((reaction) => reaction.trigger.type === 'ON_CLICK')
    const action = click?.actions.find((candidate) => candidate.type === 'NODE')
    if (action?.type === 'NODE') action.destinationId = destinationId
    else if (click) click.actions.push(createPrototypeReaction(destinationId).actions[0])
    else reactions.push(createPrototypeReaction(destinationId))
    setReactions(sourceId, reactions, 'Add connection')
  }

  return { setPrototyping, setPrototypeLink, setReactions, prototypeTargetAt, connectPrototype }
}
