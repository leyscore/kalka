import { onScopeDispose } from 'vue'

import type { ActionContext } from '@kalka/core/editor'
import type { PrototypeReaction, SceneGraph } from '@kalka/scene-graph'

/** A presented frame, as far as its After delay timers read it. */
export interface DelayFrame {
  rootId: string
  graph: SceneGraph
  pathOf: (nodeId: string) => string
}

interface Timer {
  timer: ReturnType<typeof setTimeout>
  /** The frame and the layer path an After delay belongs to; none for a trigger's own delay. */
  rootId?: string
  path?: string
}

function within(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`)
}

/**
 * The timers of a presented prototype: After delay, timed from when each frame shows, and the
 * delays some triggers wait before they run. An instance changed to another variant stops the
 * timers of the variant it left and starts the new one's, as an interactive component does.
 */
export function useDelayTimers(run: (reaction: PrototypeReaction, context: ActionContext) => void) {
  let timers: Timer[] = []

  function clear() {
    for (const { timer } of timers) clearTimeout(timer)
    timers = []
  }

  /** Runs `go` after `seconds`, unless the timers are cleared first. */
  function later(seconds: number, go: () => void) {
    timers.push({ timer: setTimeout(go, seconds * 1000) })
  }

  function armFrame(frame: DelayFrame, only?: string) {
    const { graph, rootId, pathOf } = frame
    for (const node of graph.getAllNodes()) {
      if (node.id !== rootId && !graph.isDescendant(node.id, rootId)) continue
      const reaction = node.reactions.find(
        (candidate) => candidate.trigger.type === 'AFTER_TIMEOUT'
      )
      if (!reaction) continue
      const path = pathOf(node.id)
      if (only !== undefined && !within(path, only)) continue
      const nodeIds: string[] = []
      graph.closest(node.id, (current) => {
        nodeIds.push(current.id)
        return current.id === rootId
      })
      const timer = setTimeout(
        () => run(reaction, { graph, rootId, nodeIds, pathOf }),
        reaction.trigger.delay * 1000
      )
      timers.push({ timer, rootId, path })
    }
  }

  /** Starts every shown frame's After delay timers afresh. */
  function arm(frames: Iterable<DelayFrame>) {
    clear()
    for (const frame of frames) armFrame(frame)
  }

  /** The instance at `path` in a frame changed variant. */
  function rearm(frame: DelayFrame, path: string) {
    timers = timers.filter((entry) => {
      const inside =
        entry.rootId === frame.rootId && entry.path !== undefined && within(entry.path, path)
      if (inside) clearTimeout(entry.timer)
      return !inside
    })
    armFrame(frame, path)
  }

  onScopeDispose(clear)
  return { arm, rearm, later, clear }
}
