import { useEventListener } from '@vueuse/core'

import { reactionFor, type ActionContext, type PresentState } from '@kalka/core/editor'
import type {
  PrototypeAction,
  PrototypeReaction,
  PrototypeTriggerType,
  SceneGraph
} from '@kalka/scene-graph'

import { useEditor } from '#vue/editor/context'

import type { PresentScreens, ScreenInstance } from './screens'

interface Hit {
  rootId: string
  instance: ScreenInstance
  nodeIds: string[]
}

/** How far the pointer moves, pressed, before a press is a drag. */
const DRAG_DISTANCE = 6

/**
 * The triggers of a presented prototype: pointer events on the presented frames, read through
 * their shadow roots, and keys pressed anywhere. Each runs the reaction of the innermost layer
 * that has one for it; While hovering and While pressing undo their change when they end.
 */
export function usePresentTriggers(options: {
  screens: PresentScreens
  apply: (action: PrototypeAction, context: ActionContext) => void
  queue: (work: () => void) => void
  /** Runs `go` after a trigger's delay, in seconds. */
  later: (seconds: number, go: () => void) => void
  /** A click ran nothing. */
  onMiss: () => void
}) {
  const editor = useEditor()
  const { screens, apply } = options
  const { present, instances } = screens

  /** The frame and layers an event happened on, read through the shadow roots. */
  function hitOf(event: Event): Hit | null {
    const path = event.composedPath()
    const host = path.find(
      (target): target is HTMLElement =>
        target instanceof HTMLElement && target.hasAttribute('data-present-frame')
    )
    const rootId = host?.getAttribute('data-present-frame')
    const key = rootId ? screens.keyOf(rootId) : undefined
    const instance = key ? instances.get(key) : undefined
    if (!rootId || !instance) return null
    return { rootId, instance, nodeIds: instance.layersAt(path[0] ?? null) }
  }

  function contextOf(hit: Hit, from: string): ActionContext {
    return {
      graph: hit.instance.graph(),
      rootId: hit.rootId,
      nodeIds: hit.nodeIds.slice(Math.max(0, hit.nodeIds.indexOf(from))),
      pathOf: hit.instance.pathOf
    }
  }

  function runReaction(reaction: PrototypeReaction, context: ActionContext) {
    const go = () => {
      for (const action of reaction.actions) apply(action, context)
    }
    const delay = reaction.trigger.type === 'AFTER_TIMEOUT' ? 0 : reaction.trigger.delay
    if (delay > 0) options.later(delay, go)
    else go()
  }

  function fire(hit: Hit | null, type: PrototypeTriggerType): boolean {
    if (!hit) return false
    const found = reactionFor(hit.instance.graph(), hit.nodeIds, type)
    if (!found) return false
    runReaction(found.reaction, contextOf(hit, found.nodeId))
    return true
  }

  /** While hovering and while pressing show their change and undo it when they end. */
  let held: { owner: string; type: 'ON_HOVER' | 'ON_PRESS'; before: PresentState } | null = null

  function hold(hit: Hit | null, type: 'ON_HOVER' | 'ON_PRESS') {
    const found = hit ? reactionFor(hit.instance.graph(), hit.nodeIds, type) : null
    if (held?.type === type && held.owner === found?.nodeId) return
    release(type)
    if (!hit || !found) return
    held = { owner: found.nodeId, type, before: present.value }
    runReaction(found.reaction, contextOf(hit, found.nodeId))
  }

  function release(type: 'ON_HOVER' | 'ON_PRESS') {
    if (held?.type !== type) return
    const { before } = held
    held = null
    options.queue(() => {
      const changed = before.screenId !== present.value.screenId
      if (changed) screens.show(before.screenId)
      present.value = before
    })
  }

  let hovered: string[] = []
  let dragStart: { x: number; y: number; hit: Hit } | null = null

  function onPointerMove(event: PointerEvent) {
    const hit = hitOf(event)
    const ids = hit?.nodeIds ?? []
    const graph: SceneGraph | undefined = hit?.instance.graph()
    for (const id of hovered)
      if (
        !ids.includes(id) &&
        hit &&
        graph?.getNode(id)?.reactions.some((r) => r.trigger.type === 'MOUSE_LEAVE')
      )
        fire({ ...hit, nodeIds: [id] }, 'MOUSE_LEAVE')
    for (const id of ids)
      if (
        !hovered.includes(id) &&
        hit &&
        graph?.getNode(id)?.reactions.some((r) => r.trigger.type === 'MOUSE_ENTER')
      )
        fire({ ...hit, nodeIds: [id] }, 'MOUSE_ENTER')
    hovered = ids
    hold(hit, 'ON_HOVER')
    if (
      dragStart &&
      Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > DRAG_DISTANCE
    ) {
      fire(dragStart.hit, 'ON_DRAG')
      dragStart = null
    }
  }

  /** The pointer left the prototype: hovering ends and mouse leave fires. */
  function onPointerLeave() {
    hovered = []
    hold(null, 'ON_HOVER')
  }

  function onPointerDown(event: PointerEvent) {
    const hit = hitOf(event)
    fire(hit, 'MOUSE_DOWN')
    hold(hit, 'ON_PRESS')
    dragStart = hit ? { x: event.clientX, y: event.clientY, hit } : null
  }

  function onPointerUp(event: PointerEvent) {
    fire(hitOf(event), 'MOUSE_UP')
    release('ON_PRESS')
  }

  function onClick(event: MouseEvent) {
    dragStart = null
    if (!fire(hitOf(event), 'ON_CLICK')) options.onMiss()
  }

  /** A click on an overlay's background, outside the overlay, closes it when it says so. */
  function onOutside(event: MouseEvent, frameId: string) {
    if (event.target !== event.currentTarget) return
    const frame = editor.graph.getNode(frameId)
    if (frame?.overlayBackgroundInteraction !== 'CLOSE_ON_CLICK_OUTSIDE') return
    apply(
      { type: 'CLOSE' },
      { graph: editor.graph, rootId: frameId, nodeIds: [], pathOf: () => '' }
    )
  }

  function onKeyDown(event: KeyboardEvent) {
    const pressed = new Set<number>([event.keyCode])
    if (event.shiftKey) pressed.add(16)
    if (event.ctrlKey) pressed.add(17)
    if (event.altKey) pressed.add(18)
    if (event.metaKey) pressed.add(91)
    for (const key of [...screens.shownKeys()].reverse()) {
      const instance = instances.get(key)
      if (!instance) continue
      const graph = instance.graph()
      for (const node of graph.getAllNodes()) {
        const reaction = node.reactions.find(
          (candidate) =>
            candidate.trigger.type === 'ON_KEY_DOWN' &&
            candidate.trigger.keyCodes.length === pressed.size &&
            candidate.trigger.keyCodes.every((code) => pressed.has(code))
        )
        const rootId = screens.rootOfKey(key)
        if (reaction && rootId && graph.isDescendant(node.id, rootId)) {
          event.preventDefault()
          runReaction(reaction, { graph, rootId, nodeIds: [node.id], pathOf: instance.pathOf })
          return
        }
      }
    }
  }

  useEventListener(window, 'pointerup', onPointerUp)
  useEventListener(window, 'keydown', onKeyDown)

  /** Forgets a held hover or press, as the presentation restarts. */
  function reset() {
    held = null
  }

  return { runReaction, onPointerMove, onPointerLeave, onPointerDown, onClick, onOutside, reset }
}
