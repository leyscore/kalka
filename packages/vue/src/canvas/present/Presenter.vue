<script setup lang="ts">
import { useElementSize, useEventListener } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'

import {
  reactionFor,
  runAction,
  shownFrames,
  startPresentation,
  type ActionContext,
  type PresentState,
  type PresentStep
} from '@kalka/core/editor'
import type {
  PrototypeAction,
  PrototypeReaction,
  PrototypeTriggerType,
  SceneGraph,
  PrototypeTransition
} from '@kalka/scene-graph'
import { colorToCSS } from '@kalka/scene-graph/color'

import { useEditor } from '#vue/editor/context'

import { useDelayTimers, type DelayFrame } from './delays'
import { deviceBody, deviceOutset, deviceStyles } from './device'
import { useHotspotHints } from './hotspots'
import { animatePose, layerBoxes, REST, screenPoses, smartAnimate, type Pose } from './motion'
import PresentScreen from './PresentScreen.vue'
import { applyScrolling, overlayPlacement } from './scrolling'

/**
 * Presents a page's prototype, as Figma's presentation view: one screen at a time over the
 * page's prototype background, on its device's screen when it has one, with overlays above it.
 * The layers are live DOM, so controls run and the browser lays out each screen; interactions
 * run through Core's presentation steps and play as Web Animations.
 */
const { pageId, startId, revision } = defineProps<{
  pageId: string
  startId: string
  /** Changing it restarts the presentation, as Figma's Restart. */
  revision: number
}>()
const editor = useEditor()

/** What a presented frame exposes, as `PresentScreen` defines it. */
interface ScreenInstance {
  container: HTMLElement | null
  layersAt: (target: EventTarget | null) => string[]
  elementOf: (nodeId: string) => HTMLElement | null
  graph: () => SceneGraph
  pathOf: (nodeId: string) => string
}
interface Shown {
  key: string
  rootId: string
}

const present = shallowRef<PresentState>(startPresentation(pageId, startId))
let nextKey = 0
const screen = shallowRef<Shown>({ key: `s${nextKey++}`, rootId: startId })
/** The screen a transition is leaving, drawn until the transition ends. */
const leaving = shallowRef<{ shown: Shown; onTop: boolean } | null>(null)
const instances = new Map<string, ScreenInstance>()
const hosts = new Map<string, HTMLElement>()

function isScreen(value: unknown): value is ScreenInstance {
  return !!value && typeof value === 'object' && 'layersAt' in value && 'graph' in value
}

function register(key: string, value: unknown) {
  if (isScreen(value)) {
    instances.set(key, value)
    const host = (value as { $el?: unknown }).$el
    if (host instanceof HTMLElement) hosts.set(key, host)
  } else {
    instances.delete(key)
    hosts.delete(key)
  }
}

const viewport = useTemplateRef<HTMLElement>('viewport')
const scroller = useTemplateRef<HTMLElement>('scroller')
const scaler = useTemplateRef<HTMLElement>('scaler')
const { width: viewWidth, height: viewHeight } = useElementSize(viewport)

const page = computed(() => {
  void editor.state.sceneVersion
  return editor.graph.getNode(pageId)
})
const background = computed(() =>
  colorToCSS(page.value?.prototypeBackground ?? { r: 0.118, g: 0.118, b: 0.118, a: 1 })
)
function frameSize(id: string): { width: number; height: number } {
  void editor.state.sceneVersion
  const node = editor.graph.getNode(id)
  return { width: node?.width ?? 0, height: node?.height ?? 0 }
}
/** The screen's box: the device's screen, or the presented frame without one. */
const box = computed(() => {
  const device = page.value?.prototypeDevice
  if (device) {
    const turned = device.rotation === 'CCW_90'
    return {
      width: turned ? device.size.y : device.size.x,
      height: turned ? device.size.x : device.size.y
    }
  }
  return frameSize(screen.value.rootId)
})
const hasDevice = computed(() => !!page.value?.prototypeDevice)
const body = computed(() => deviceBody(page.value?.prototypeDevice))
const PADDING = 32
/**
 * Fit the box, in its device's body, to the window, never larger than 100%; a frame without a
 * device fits its width.
 */
const scale = computed(() => {
  const { width, height } = box.value
  if (width <= 0 || height <= 0) return 1
  const outset = deviceOutset(body.value)
  const fitWidth = (viewWidth.value - PADDING * 2) / (width + outset.width)
  const fitHeight = hasDevice.value
    ? (viewHeight.value - PADDING * 2) / (height + outset.height)
    : Infinity
  return Math.max(0.05, Math.min(1, fitWidth, fitHeight))
})
const device = computed(() => deviceStyles(body.value, box.value, scale.value))

const overlays = computed(() =>
  present.value.overlays.map((overlay, index) => ({
    ...overlay,
    key: `o${index}:${overlay.frameId}`
  }))
)

/** Settles the DOM of new frames: their shadow roots mount, then their layers render. */
async function settled(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function stageRect(): DOMRect {
  return scaler.value?.getBoundingClientRect() ?? new DOMRect()
}

async function finish(animations: Animation[]): Promise<void> {
  await Promise.allSettled(animations.map((animation) => animation.finished))
  for (const animation of animations) animation.cancel()
}

// --- Playing steps --------------------------------------------------------------------------

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
  const incomingHost = hosts.get(screen.value.key)
  const outgoingHost = hosts.get(outgoingKey)
  const incomingRoot = instances.get(screen.value.key)?.container
  const matched = before && incomingRoot ? { before, root: incomingRoot } : null
  const animations: Animation[] = []
  if (matched && transition.type === 'SMART_ANIMATE') {
    // Matched layers move; the rest of the screen it leaves dissolves.
    animations.push(
      ...smartAnimate(matched.root, matched.before, stageRect(), scale.value, transition)
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
      ...smartAnimate(matched.root, matched.before, stageRect(), scale.value, transition)
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
  const before = smart && outgoingRoot ? layerBoxes(outgoingRoot, stageRect(), scale.value) : null
  const scrollTop = scroller.value?.scrollTop ?? 0
  const poses = transition ? screenPoses(transition, step.back, box.value) : null
  if (poses) leaving.value = { shown: outgoing, onTop: poses.outgoingOnTop }
  present.value = next
  screen.value = { key: `s${nextKey++}`, rootId: step.to }
  await settled()
  restoreScroll(keepScroll, scrollTop)
  if (!transition || !poses) return
  await finish(screenAnimations(outgoing.key, transition, poses, before))
  if (leaving.value?.shown.key === outgoing.key) leaving.value = null
}

function overlayFrom(step: Extract<PresentStep, { kind: 'overlay' }>): Pose {
  if (!step.transition) return REST
  return screenPoses(step.transition, false, box.value).incoming[0]
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
  const key = keyOf(step.rootId)
  const root = key ? instances.get(key)?.container : null
  const smart = step.transition?.type === 'SMART_ANIMATE'
  const before = smart && root ? layerBoxes(root, stageRect(), scale.value) : null
  present.value = next
  void settled().then(() => rearmVariant(step.rootId, step.path))
  if (!step.transition || !root) return
  await settled()
  if (before) return finish(smartAnimate(root, before, stageRect(), scale.value, step.transition))
  const element = root.querySelector(`[data-layer="${CSS.escape(step.path)}"]`)
  if (element) await finish([animatePose(element, { ...REST, opacity: 0 }, REST, step.transition)])
}

function playScroll(step: Extract<PresentStep, { kind: 'scroll' }>) {
  for (const key of shownKeys()) {
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

/** Runs an action of an interaction; steps play one after another. */
function apply(action: PrototypeAction, context: ActionContext) {
  busy = busy.then(() => play(action, context))
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
  if (step.kind === 'screen') {
    const keep = action.type === 'NODE' && action.preserveScrollPosition
    return playScreen(step, state, keep)
  }
  if (step.kind === 'overlay') return playOverlay(step, state)
  return playVariant(step, state)
}

// --- Triggers -------------------------------------------------------------------------------

function keyOf(rootId: string): string | undefined {
  if (screen.value.rootId === rootId) return screen.value.key
  return overlays.value.find((overlay) => overlay.frameId === rootId)?.key
}

function shownKeys(): string[] {
  return [screen.value.key, ...overlays.value.map((overlay) => overlay.key)]
}

interface Hit {
  rootId: string
  instance: ScreenInstance
  nodeIds: string[]
}

/** The frame and layers an event happened on, read through the shadow roots. */
function hitOf(event: Event): Hit | null {
  const path = event.composedPath()
  const host = path.find(
    (target): target is HTMLElement =>
      target instanceof HTMLElement && target.hasAttribute('data-present-frame')
  )
  const rootId = host?.getAttribute('data-present-frame')
  const key = rootId ? keyOf(rootId) : undefined
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
  if (delay > 0) timers.later(delay, go)
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
  busy = busy.then(() => {
    const changed = before.screenId !== present.value.screenId
    if (changed) screen.value = { key: `s${nextKey++}`, rootId: before.screenId }
    present.value = before
    return undefined
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
  if (dragStart && Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 6) {
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
  if (!fire(hitOf(event), 'ON_CLICK')) flashHotspots()
}

/** A click that runs nothing flashes where the layers that do something are. */
const { hotspots, fading, flash } = useHotspotHints((element) =>
  scaler.value ? boxIn(element, scaler.value) : { x: 0, y: 0, width: 0, height: 0 }
)

function flashHotspots() {
  flash(shownFrameViews())
}

/** A click on an overlay's background, outside the overlay, closes it when it says so. */
function onOutside(event: MouseEvent, frameId: string) {
  if (event.target !== event.currentTarget) return
  const frame = editor.graph.getNode(frameId)
  if (frame?.overlayBackgroundInteraction !== 'CLOSE_ON_CLICK_OUTSIDE') return
  apply({ type: 'CLOSE' }, { graph: editor.graph, rootId: frameId, nodeIds: [], pathOf: () => '' })
}

useEventListener(window, 'pointerup', onPointerUp)
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  const pressed = new Set<number>([event.keyCode])
  if (event.shiftKey) pressed.add(16)
  if (event.ctrlKey) pressed.add(17)
  if (event.altKey) pressed.add(18)
  if (event.metaKey) pressed.add(91)
  for (const key of [...shownKeys()].reverse()) {
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
      const rootId = rootOfKey(key)
      if (reaction && rootId && graph.isDescendant(node.id, rootId)) {
        event.preventDefault()
        runReaction(reaction, { graph, rootId, nodeIds: [node.id], pathOf: instance.pathOf })
        return
      }
    }
  }
})

// --- Timers, scrolling and restarts ---------------------------------------------------------

function rootOfKey(key: string): string | undefined {
  return key === screen.value.key
    ? screen.value.rootId
    : overlays.value.find((overlay) => overlay.key === key)?.frameId
}

/** The shown frames, each with the graph and paths of its presented layers. */
function shownFrameViews(): (DelayFrame & { elementOf: (nodeId: string) => HTMLElement | null })[] {
  return shownKeys().flatMap((key) => {
    const instance = instances.get(key)
    const rootId = rootOfKey(key)
    return instance && rootId
      ? [
          {
            rootId,
            graph: instance.graph(),
            pathOf: instance.pathOf,
            elementOf: instance.elementOf
          }
        ]
      : []
  })
}

const timers = useDelayTimers((reaction, context) => runReaction(reaction, context))
const clearTimers = timers.clear
const armDelays = () => timers.arm(shownFrameViews())

/** An instance changed variant: the timers of the variant it left stop, the new one's start. */
function rearmVariant(rootId: string, path: string) {
  const frame = shownFrameViews().find((view) => view.rootId === rootId)
  if (frame) timers.rearm(frame, path)
}

let unscroll: (() => void)[] = []
async function arrange() {
  await settled()
  for (const stop of unscroll) stop()
  unscroll = []
  for (const key of shownKeys()) {
    const instance = instances.get(key)
    if (instance?.container)
      unscroll.push(
        applyScrolling(instance.graph(), instance.container, [scroller.value, viewport.value])
      )
  }
  armDelays()
}

watch(
  () => shownFrames(present.value).join('|') + screen.value.key,
  () => void arrange(),
  { immediate: true }
)

watch(
  () => [startId, revision] as const,
  () => {
    clearTimers()
    held = null
    leaving.value = null
    present.value = startPresentation(pageId, startId)
    screen.value = { key: `s${nextKey++}`, rootId: startId }
  }
)

onBeforeUnmount(() => {
  clearTimers()
  for (const stop of unscroll) stop()
})

function overlayStyle(overlay: (typeof overlays.value)[number]) {
  const triggerKey = screen.value.key
  const trigger = overlay.triggerId ? instances.get(triggerKey)?.elementOf(overlay.triggerId) : null
  const triggerBox = trigger && scaler.value ? boxIn(trigger, scaler.value) : null
  const frame = editor.graph.getNode(overlay.frameId)
  const position = overlayPlacement(
    frame?.overlayPositionType ?? 'CENTER',
    frameSize(overlay.frameId),
    box.value,
    triggerBox,
    overlay.offset
  )
  return { left: `${position.x}px`, top: `${position.y}px` }
}

function boxIn(element: HTMLElement, origin: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const base = origin.getBoundingClientRect()
  return {
    x: (rect.left - base.left) / scale.value,
    y: (rect.top - base.top) / scale.value,
    width: rect.width / scale.value,
    height: rect.height / scale.value
  }
}

function overlayBackground(frameId: string): string {
  const color = editor.graph.getNode(frameId)?.overlayBackground
  return color ? colorToCSS(color) : 'transparent'
}
</script>

<template>
  <div
    ref="viewport"
    data-test-id="prototype-presenter"
    class="absolute inset-0 overflow-auto"
    :style="{ background }"
  >
    <div
      class="flex min-h-full min-w-full items-center justify-center"
      :style="{ padding: `${PADDING}px` }"
    >
      <div class="flex shrink-0 flex-col items-center">
        <div
          data-test-id="prototype-device"
          :data-device="body ? 'true' : 'false'"
          :style="device.body"
        >
          <div
            class="relative shrink-0 overflow-hidden"
            :style="{
              width: `${box.width * scale}px`,
              height: `${box.height * scale}px`,
              ...device.screen
            }"
          >
            <div
              ref="scaler"
              class="absolute top-0 left-0 origin-top-left"
              :style="{
                width: `${box.width}px`,
                height: `${box.height}px`,
                transform: `scale(${scale})`
              }"
              @pointermove="onPointerMove"
              @pointerleave="onPointerLeave"
              @pointerdown="onPointerDown"
              @click="onClick"
            >
              <div
                ref="scroller"
                class="absolute inset-0"
                :class="hasDevice ? 'overflow-auto' : 'overflow-hidden'"
              >
                <PresentScreen
                  v-if="leaving"
                  :key="leaving.shown.key"
                  :ref="(value) => register(leaving?.shown.key ?? '', value)"
                  :root-id="leaving.shown.rootId"
                  :revision="revision"
                  :variants="present.variants[leaving.shown.rootId]"
                  :variables="present.variables"
                  class="absolute top-0 left-0"
                  :style="{ zIndex: leaving.onTop ? 2 : 0 }"
                />
                <PresentScreen
                  :key="screen.key"
                  :ref="(value) => register(screen.key, value)"
                  :root-id="screen.rootId"
                  :revision="revision"
                  :variants="present.variants[screen.rootId]"
                  :variables="present.variables"
                  class="absolute top-0 left-0"
                  :style="{ zIndex: 1 }"
                />
              </div>
              <div
                v-for="overlay in overlays"
                :key="overlay.key"
                data-test-id="prototype-overlay"
                class="absolute inset-0 z-10"
                :style="{ background: overlayBackground(overlay.frameId) }"
                @click="onOutside($event, overlay.frameId)"
              >
                <PresentScreen
                  :ref="(value) => register(overlay.key, value)"
                  :root-id="overlay.frameId"
                  :revision="revision"
                  :variants="present.variants[overlay.frameId]"
                  :variables="present.variables"
                  class="absolute"
                  :style="overlayStyle(overlay)"
                />
              </div>
              <div
                v-for="hotspot in hotspots"
                :key="hotspot.id"
                data-test-id="prototype-hotspot"
                class="pointer-events-none absolute z-20 rounded-[2px] border border-[#0d99ff] bg-[#0d99ff]/25 transition-opacity duration-300"
                :class="{ 'opacity-0': fading }"
                :style="{
                  left: `${hotspot.x}px`,
                  top: `${hotspot.y}px`,
                  width: `${hotspot.width}px`,
                  height: `${hotspot.height}px`
                }"
              />
            </div>
          </div>
        </div>
        <div v-if="device.base" :style="device.base" />
      </div>
    </div>
  </div>
</template>
