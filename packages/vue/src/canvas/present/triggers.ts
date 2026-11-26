import { useEventListener } from '@vueuse/core'

import { reactionFor, type ActionContext, type PresentState } from '@kalka/core/editor'
import type {
  PrototypeAction,
  PrototypeReaction,
  PrototypeTriggerType,
  SceneGraph
} from '@kalka/scene-graph'

import { useEditor } from '#vue/editor/context'

import type { PresentMediaEvent } from './media'
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
  /** How much the presented screen is scaled to fit the window. */
  scale: () => number
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

  /**
   * On drag with Smart animate, as in Figma: the dragged layer follows the pointer, and letting
   * go plays the interaction from where it was dragged to.
   */
  let following: {
    x: number
    y: number
    element: HTMLElement
    reaction: PrototypeReaction
    context: ActionContext
  } | null = null
  /** A drag ran, so the click that ends it does not run On click too. */
  let dragged = false

  function followsPointer(reaction: PrototypeReaction): boolean {
    const [first] = reaction.actions
    return first?.type === 'NODE' && first.transition?.type === 'SMART_ANIMATE'
  }

  function startDrag(start: { x: number; y: number; hit: Hit }) {
    dragged = true
    const found = reactionFor(start.hit.instance.graph(), start.hit.nodeIds, 'ON_DRAG')
    if (!found) return
    const element = start.hit.instance.elementOf(found.nodeId)
    const context = contextOf(start.hit, found.nodeId)
    if (element && followsPointer(found.reaction))
      following = { x: start.x, y: start.y, element, reaction: found.reaction, context }
    else runReaction(found.reaction, context)
  }

  function follow(event: PointerEvent) {
    if (!following) return
    const scale = options.scale() || 1
    const dx = (event.clientX - following.x) / scale
    const dy = (event.clientY - following.y) / scale
    following.element.style.translate = `${dx}px ${dy}px`
  }

  /** Letting go of a followed drag plays its interaction from the dragged position. */
  function endFollow() {
    const ended = following
    following = null
    if (!ended) return
    runReaction(ended.reaction, ended.context)
    options.queue(() => {
      ended.element.style.translate = ''
    })
  }

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
      startDrag(dragStart)
      dragStart = null
    }
    follow(event)
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
    dragged = false
  }

  function onPointerUp(event: PointerEvent) {
    dragStart = null
    endFollow()
    fire(hitOf(event), 'MOUSE_UP')
    release('ON_PRESS')
  }

  function onClick(event: MouseEvent) {
    dragStart = null
    if (dragged) {
      dragged = false
      return
    }
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

  /**
   * Video hits and Video ends, on the layer whose video it is: each Video hits whose time the
   * video just played through runs, and Video ends each time it ends or a loop starts over.
   */
  function onMedia(key: string, event: PresentMediaEvent) {
    const instance = instances.get(key)
    const rootId = screens.rootOfKey(key)
    if (!instance || !rootId) return
    const graph = instance.graph()
    const context = { graph, rootId, nodeIds: [event.nodeId], pathOf: instance.pathOf }
    for (const reaction of graph.getNode(event.nodeId)?.reactions ?? []) {
      const { type, mediaHitTime = 0 } = reaction.trigger
      if (type !== event.type) continue
      if (event.type === 'ON_MEDIA_HIT' && !(mediaHitTime > event.from && mediaHitTime <= event.to))
        continue
      runReaction(reaction, context)
    }
  }

  useEventListener(window, 'pointerup', onPointerUp)
  useEventListener(window, 'keydown', onKeyDown)

  /** Forgets a held hover or press, as the presentation restarts. */
  function reset() {
    held = null
    following = null
    dragged = false
  }

  return {
    runReaction,
    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onClick,
    onOutside,
    onMedia,
    reset
  }
}
