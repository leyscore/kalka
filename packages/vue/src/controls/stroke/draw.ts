import { computed } from 'vue'

import {
  defaultStrokeBrush,
  matchStrokeWidthPreset,
  STROKE_BRUSHES,
  STROKE_WIDTH_PRESET_IDS,
  strokeWidthPreset,
  type StrokeWidthPreset
} from '@kalka/core/vector'
import type { SceneNode, StrokeBrush, StrokeBrushType } from '@kalka/scene-graph'

import { MIXED, useNodeProps } from '#vue/controls/node-props/use'
import { useEditor } from '#vue/editor/context'

/** Layers whose stroke runs along a path, which a width profile or a brush follows. */
const PATH_TYPES = new Set<SceneNode['type']>(['VECTOR', 'LINE'])

/** The brush settings a field changes, with numbers. */
export type StrokeBrushSetting = 'gap' | 'wiggle' | 'sizeJitter' | 'angularJitter' | 'rotation'

/** A brush picked from a menu: `none` or a type and an id, as `SCATTER:stars`. */
export type StrokeBrushChoice = 'none' | `${StrokeBrushType}:${string}`

export function brushChoice(brush: StrokeBrush | null): StrokeBrushChoice {
  return brush ? `${brush.type}:${brush.id}` : 'none'
}

/**
 * Figma Draw's stroke settings for the selection: the width profile its strokes take along their
 * paths and the brush they are drawn with. Each change is one undo step; numeric brush settings
 * preview while dragged and commit once.
 */
export function useStrokeDrawControls() {
  const editor = useEditor()
  const { nodes } = useNodeProps()
  const paths = computed(() =>
    nodes.value.filter((node) => PATH_TYPES.has(node.type) && node.strokes.length > 0)
  )
  const available = computed(
    () => paths.value.length > 0 && paths.value.length === nodes.value.length
  )

  const widthPreset = computed<StrokeWidthPreset | 'custom' | typeof MIXED>(() => {
    const presets = new Set(
      paths.value.map((node) => matchStrokeWidthPreset(node.strokeWidthProfile) ?? 'custom')
    )
    if (presets.size > 1) return MIXED
    return presets.values().next().value ?? 'uniform'
  })

  const brush = computed<StrokeBrush | null | typeof MIXED>(() => {
    const choices = new Set(paths.value.map((node) => brushChoice(node.strokeBrush)))
    if (choices.size > 1) return MIXED
    return paths.value.at(0)?.strokeBrush ?? null
  })

  function run(label: string, change: (node: SceneNode) => Partial<SceneNode>) {
    const selected = paths.value
    const apply = () => {
      for (const node of selected) editor.updateNodeWithUndo(node.id, change(node), label)
    }
    if (selected.length > 1) editor.undo.runBatch(label, apply)
    else apply()
  }

  const previewed = new Map<string, SceneNode['strokeWidthProfile']>()

  /** Shows a preset on the canvas while it is hovered in the menu; null puts the paths back. */
  function previewWidthPreset(preset: StrokeWidthPreset | null) {
    if (preset === null) {
      for (const [id, profile] of previewed) editor.updateNode(id, { strokeWidthProfile: profile })
      previewed.clear()
      return
    }
    for (const node of paths.value) {
      if (!previewed.has(node.id)) {
        previewed.set(
          node.id,
          node.strokeWidthProfile.map((point) => ({ ...point }))
        )
      }
      editor.updateNode(node.id, { strokeWidthProfile: strokeWidthPreset(preset) })
    }
  }

  function setWidthPreset(preset: StrokeWidthPreset) {
    run('Change stroke width profile', () => ({ strokeWidthProfile: strokeWidthPreset(preset) }))
  }

  function setBrush(choice: StrokeBrushChoice) {
    if (choice === 'none') {
      run('Remove brush', () => ({ strokeBrush: null }))
      return
    }
    const [type, id] = choice.split(':')
    if (type !== 'STRETCH' && type !== 'SCATTER') return
    run('Change brush', () => ({ strokeBrush: defaultStrokeBrush(type, id) }))
  }

  const originals = new Map<string, StrokeBrush | null>()

  function previewBrushSetting(key: StrokeBrushSetting, value: number) {
    for (const node of paths.value) {
      if (!node.strokeBrush) continue
      if (!originals.has(node.id)) originals.set(node.id, { ...node.strokeBrush })
      editor.updateNode(node.id, { strokeBrush: { ...node.strokeBrush, [key]: value } })
    }
  }

  function commitBrushSetting(key: StrokeBrushSetting, value: number) {
    if (originals.size === 0) previewBrushSetting(key, value)
    const label = 'Change brush'
    const commit = () => {
      for (const [id, previous] of originals) {
        editor.commitNodeUpdate(id, { strokeBrush: previous }, label)
      }
    }
    if (originals.size > 1) editor.undo.runBatch(label, commit)
    else commit()
    originals.clear()
  }

  function setBrushReverse(reverse: boolean) {
    run('Change brush', (node) => ({
      strokeBrush: node.strokeBrush ? { ...node.strokeBrush, reverse } : null
    }))
  }

  return {
    available,
    widthPreset,
    widthPresets: STROKE_WIDTH_PRESET_IDS,
    brush,
    brushes: STROKE_BRUSHES,
    setWidthPreset,
    previewWidthPreset,
    setBrush,
    previewBrushSetting,
    commitBrushSetting,
    setBrushReverse
  }
}
