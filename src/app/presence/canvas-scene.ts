import { shallowRef, type ShallowRef } from 'vue'

import type { DomScenePreview, RevealStep } from '@kalka/vue'

import type { EditorStore } from '@/app/editor/active-store'

/** A DOM scene drawing this document, as `useDomScene` returns it. */
export interface CanvasScene {
  reveal(steps: readonly RevealStep[]): void
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

/** Replays an edit in every pane drawing this document. */
export function revealOnCanvas(store: EditorStore, steps: readonly RevealStep[]): void {
  if (steps.length === 0) return
  for (const scene of effectsOf(store).scenes) scene.reveal(steps)
}
