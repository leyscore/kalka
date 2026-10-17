import { shallowRef, type ShallowRef } from 'vue'

import type { DomScenePreview, RevealStep } from '@kalka/vue'

import type { EditorStore } from '@/app/editor/active-store'

/** A DOM scene drawing this document, as `useDomScene` returns it. */
export interface CanvasScene {
  reveal(steps: readonly RevealStep[]): void
  /** Keeps new layers hidden until their reveal starts; each shows by itself after a while. */
  hold(ids: readonly string[]): void
  /** Shows held layers now. */
  release(ids: readonly string[]): void
  /** Whether the scene shows the page as the graph has it, with nothing left to apply. */
  readonly settled: boolean
}

interface SceneEffects {
  previews: ShallowRef<readonly DomScenePreview[]>
  scenes: Set<CanvasScene>
}

const effects = new WeakMap<EditorStore, SceneEffects>()

function effectsOf(store: EditorStore): SceneEffects {
  let entry = effects.get(store)
  if (!entry) {
    entry = { previews: shallowRef([]), scenes: new Set() }
    effects.set(store, entry)
  }
  return entry
}

/**
 * What agents are still writing in this document, as every pane's DOM scene draws it. The
 * array is replaced on each change, so a scene redraws only when it differs.
 */
export function scenePreviews(store: EditorStore): readonly DomScenePreview[] {
  return effectsOf(store).previews.value
}

/** Shows `preview`, or replaces the one shown under its key. */
export function showScenePreview(store: EditorStore, preview: DomScenePreview): void {
  const { previews } = effectsOf(store)
  previews.value = [...previews.value.filter((entry) => entry.key !== preview.key), preview]
}

/** Stops showing `preview`, unless a newer one has replaced it under its key. */
export function hideScenePreview(store: EditorStore, preview: DomScenePreview): void {
  const { previews } = effectsOf(store)
  if (!previews.value.includes(preview)) return
  previews.value = previews.value.filter((entry) => entry !== preview)
}

/** A pane's DOM scene replays agent edits for this document until the returned detach. */
export function attachCanvasScene(store: EditorStore, scene: CanvasScene): () => void {
  const { scenes } = effectsOf(store)
  scenes.add(scene)
  return () => scenes.delete(scene)
}

/**
 * Whether every pane's DOM scene shows this document as its graph has it, or null when no DOM
 * scene draws it, as when the canvas draws with Skia.
 */
export function canvasScenesSettled(store: EditorStore): boolean | null {
  const { scenes } = effectsOf(store)
  if (scenes.size === 0) return null
  return [...scenes].every((scene) => scene.settled)
}

/** Replays an edit in every pane drawing this document. */
export function revealOnCanvas(store: EditorStore, steps: readonly RevealStep[]): void {
  if (steps.length === 0) return
  for (const scene of effectsOf(store).scenes) scene.reveal(steps)
}

/** Keeps an agent's new layers hidden in every pane until their reveal plays. */
export function holdOnCanvas(store: EditorStore, ids: readonly string[]): void {
  if (ids.length === 0) return
  for (const scene of effectsOf(store).scenes) scene.hold(ids)
}

/** Shows held layers in every pane, as when their reveal will not play. */
export function releaseOnCanvas(store: EditorStore, ids: readonly string[]): void {
  if (ids.length === 0) return
  for (const scene of effectsOf(store).scenes) scene.release(ids)
}
