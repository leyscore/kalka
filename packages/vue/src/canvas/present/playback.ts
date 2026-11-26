import { nextTick, type Ref } from 'vue'

import {
  runAction,
  type ActionContext,
  type PresentState,
  type PresentStep
} from '@kalka/core/editor'
import type { PrototypeAction, PrototypeTransition } from '@kalka/scene-graph'

import { useEditor } from '#vue/editor/context'

import { runMediaAction, videoIn } from './media'
import { animatePose, layerBoxes, REST, screenPoses, smartAnimate, type Pose } from './motion'
import type { PresentScreens } from './screens'
import type { PresentStage } from './stage'

/** Settles the DOM of new frames: their shadow roots mount, then their layers render. */
export async function settled(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

async function finish(animations: Animation[]): Promise<void> {
  await Promise.allSettled(animations.map((animation) => animation.finished))
  for (const animation of animations) animation.cancel()
}

/**
 * Plays the steps of a presented prototype's actions, one after another: screen changes with
 * their transitions, overlays opening and closing, instances changing variant, scrolling to a
 * layer, links, variables and media. `onVariant` hears of an instance that changed variant once its new
 * layers are drawn.
 */
export function usePresentPlayback(options: {
  screens: PresentScreens
  stage: PresentStage
  scroller: Readonly<Ref<HTMLElement | null>>
  viewport: Readonly<Ref<HTMLElement | null>>
  onVariant: (rootId: string, path: string) => void
}) {
  const editor = useEditor()
  const { screens, stage, scroller, viewport } = options
  const { present, screen, leaving, overlays, instances, hosts } = screens

  /** Puts the screen's scroll back to the top, or where it was when the action keeps it. */
  function restoreScroll(keep: boolean, top: number) {
    if (scroller.value) scroller.value.scrollTop = keep ? top : 0
    if (viewport.value && !keep) viewport.value.scrollTop = 0
  }

  /** The animations of a screen transition, once both screens are drawn. */
  function screenAnimations(
    outgoingKey: string,
    transition: PrototypeTransition,
    poses: ReturnType<typeof screenPoses>,
    before: ReturnType<typeof layerBoxes> | null
  ): Animation[] {
    const scale = stage.scale.value
    const incomingHost = hosts.get(screen.value.key)
    const outgoingHost = hosts.get(outgoingKey)
    const incomingRoot = instances.get(screen.value.key)?.container
    const matched = before && incomingRoot ? { before, root: incomingRoot } : null
    const animations: Animation[] = []
    if (matched && transition.type === 'SMART_ANIMATE') {
      // Matched layers move; the rest of the screen it leaves dissolves.
      animations.push(
        ...smartAnimate(matched.root, matched.before, stage.stageRect(), scale, transition)
      )
      if (outgoingHost)
        animations.push(animatePose(outgoingHost, REST, { ...REST, opacity: 0 }, transition))
      return animations
    }
    if (incomingHost)
      animations.push(animatePose(incomingHost, poses.incoming[0], poses.incoming[1], transition))
    if (outgoingHost)
      animations.push(animatePose(outgoingHost, poses.outgoing[0], poses.outgoing[1], transition))
    if (matched)
      animations.push(
        ...smartAnimate(matched.root, matched.before, stage.stageRect(), scale, transition)
      )
    return animations
  }

  async function playScreen(
    step: Extract<PresentStep, { kind: 'screen' }>,
    next: PresentState,
    keepScroll: boolean
  ) {
    const outgoing = screen.value
    const { transition } = step
    const smart = !!transition && (transition.type === 'SMART_ANIMATE' || transition.matchLayers)
    const outgoingRoot = instances.get(outgoing.key)?.container
    const before =
      smart && outgoingRoot ? layerBoxes(outgoingRoot, stage.stageRect(), stage.scale.value) : null
    const scrollTop = scroller.value?.scrollTop ?? 0
    const poses = transition ? screenPoses(transition, step.back, stage.box.value) : null
    if (poses) leaving.value = { shown: outgoing, onTop: poses.outgoingOnTop }
    present.value = next
    screens.show(step.to)
    await settled()
    restoreScroll(keepScroll, scrollTop)
    if (!transition || !poses) return
    await finish(screenAnimations(outgoing.key, transition, poses, before))
    if (leaving.value?.shown.key === outgoing.key) leaving.value = null
  }

  function overlayFrom(step: Extract<PresentStep, { kind: 'overlay' }>): Pose {
    if (!step.transition) return REST
    return screenPoses(step.transition, false, stage.box.value).incoming[0]
  }

  async function playOverlay(step: Extract<PresentStep, { kind: 'overlay' }>, next: PresentState) {
    if (!step.open) {
      // Closing plays the way it opened backwards, then the overlay goes.
      const closingKey = overlays.value.at(-1)?.key
      const closingHost = closingKey ? hosts.get(closingKey) : undefined
      if (step.transition && closingHost)
        await finish([animatePose(closingHost, REST, overlayFrom(step), step.transition)])
      present.value = next
      return
    }
    present.value = next
    if (!step.transition) return
    await settled()
    const key = overlays.value.at(-1)?.key
    const host = key ? hosts.get(key) : undefined
    if (host) await finish([animatePose(host, overlayFrom(step), REST, step.transition)])
  }

  async function playVariant(step: Extract<PresentStep, { kind: 'variant' }>, next: PresentState) {
    const key = screens.keyOf(step.rootId)
    const root = key ? instances.get(key)?.container : null
    const smart = step.transition?.type === 'SMART_ANIMATE'
    const before = smart && root ? layerBoxes(root, stage.stageRect(), stage.scale.value) : null
    present.value = next
    void settled().then(() => options.onVariant(step.rootId, step.path))
    if (!step.transition || !root) return
    await settled()
    if (before)
      return finish(
        smartAnimate(root, before, stage.stageRect(), stage.scale.value, step.transition)
      )
    const element = root.querySelector(`[data-layer="${CSS.escape(step.path)}"]`)
    if (element)
      await finish([animatePose(element, { ...REST, opacity: 0 }, REST, step.transition)])
  }

  function playScroll(step: Extract<PresentStep, { kind: 'scroll' }>) {
    for (const key of screens.shownKeys()) {
      const element = instances.get(key)?.elementOf(step.nodeId)
      if (element) {
        element.scrollIntoView({
          behavior: step.transition ? 'smooth' : 'auto',
          block: 'start',
          inline: 'start'
        })
        return
      }
    }
  }

  let busy: Promise<void> = Promise.resolve()

  /** Queues work after the steps already playing. */
  function queue(work: () => void | Promise<void>) {
    busy = busy.then(work)
  }

  /** Runs an action of an interaction; steps play one after another. */
  function apply(action: PrototypeAction, context: ActionContext) {
    queue(() => play(action, context))
  }

  /** Plays one action, and a conditional's chosen actions in order before the next one. */
  async function play(action: PrototypeAction, context: ActionContext): Promise<void> {
    const result = runAction(editor.graph, present.value, action, context)
    if (!result) return
    const { step, state } = result
    if (step.kind === 'variables') {
      present.value = state
      return
    }
    if (step.kind === 'actions') {
      for (const next of step.actions) await play(next, context)
      return
    }
    if (step.kind === 'url') {
      window.open(step.url, '_blank', 'noopener,noreferrer')
      return
    }
    if (step.kind === 'scroll') return playScroll(step)
    if (step.kind === 'media') {
      const key = screens.keyOf(step.rootId)
      const video = videoIn((key && instances.get(key)?.elementOf(step.nodeId)) || null)
      if (video) runMediaAction(video, step.action)
      return
    }
    if (step.kind === 'screen') {
      const keep = action.type === 'NODE' && action.preserveScrollPosition
      return playScreen(step, state, keep)
    }
    if (step.kind === 'overlay') return playOverlay(step, state)
    return playVariant(step, state)
  }

  return { apply, queue }
}
