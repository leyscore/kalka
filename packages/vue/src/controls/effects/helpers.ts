import type { Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'
import type { Effect, SceneNode } from '@kalka/scene-graph'
import type { Color } from '@kalka/scene-graph/primitives'

import { useEffectMessages, useI18n } from '#vue/i18n/useI18n.js'

type EffectType = Effect['type']

const { panels } = useI18n()
const effectLabels = useEffectMessages()

const EFFECT_LABELS: Record<string, string> = {
  DROP_SHADOW: panels.value.dropShadow,
  INNER_SHADOW: panels.value.innerShadow,
  LAYER_BLUR: panels.value.layerBlur,
  BACKGROUND_BLUR: panels.value.backgroundBlur,
  FOREGROUND_BLUR: panels.value.foregroundBlur,
  NOISE: effectLabels.value.noise,
  TEXTURE: effectLabels.value.texture,
  GLASS: effectLabels.value.glass
}

export const EFFECT_TYPES = Object.keys(EFFECT_LABELS) as EffectType[]
export const EFFECT_OPTIONS = EFFECT_TYPES.map((t) => ({
  value: t,
  label: EFFECT_LABELS[t]
}))

export function isBlur(type: string) {
  return type === 'LAYER_BLUR' || type === 'BACKGROUND_BLUR' || type === 'FOREGROUND_BLUR'
}

/** The fields only some kinds of effect have, cleared when an effect changes kind. */
const KIND_FIELDS = {
  blurType: undefined,
  startRadius: undefined,
  startOffset: undefined,
  endOffset: undefined,
  noiseType: undefined,
  noiseSize: undefined,
  density: undefined,
  secondaryColor: undefined,
  opacity: undefined,
  clipToShape: undefined,
  refraction: undefined,
  depth: undefined,
  lightAngle: undefined,
  lightIntensity: undefined,
  dispersion: undefined
} satisfies Partial<Record<keyof Effect, undefined>>

/**
 * The settings an effect takes when it becomes `type`, as Figma starts them: a shadow's offset,
 * a noise's grain, a texture's spread, a glass's light and refraction. A blur keeps its radius.
 */
export function effectKindDefaults(type: EffectType, from: Effect): Partial<Effect> {
  const changes: Partial<Effect> = { ...KIND_FIELDS, type }
  if (isShadow(type)) {
    if (!isShadow(from.type)) Object.assign(changes, { offset: { x: 0, y: 4 }, spread: 0 })
    return changes
  }
  Object.assign(changes, { offset: { x: 0, y: 0 }, spread: 0 })
  if (type === 'NOISE')
    Object.assign(changes, {
      color: { ...DEFAULT_NOISE_COLOR },
      noiseType: 'MONOTONE',
      noiseSize: 0.5,
      density: 0.5
    })
  if (type === 'TEXTURE') Object.assign(changes, { radius: 4, noiseSize: 0.5, clipToShape: true })
  if (type === 'GLASS')
    Object.assign(changes, {
      radius: 4,
      refraction: 0.8,
      depth: 20,
      lightAngle: -45,
      lightIntensity: 0.8,
      dispersion: 0.5
    })
  return changes
}

const DEFAULT_NOISE_COLOR: Color = { r: 0, g: 0, b: 0, a: 0.25 }

export function isShadow(type: string) {
  return type === 'DROP_SHADOW' || type === 'INNER_SHADOW'
}

export function createDefaultEffect(): Effect {
  return {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.25 },
    offset: { x: 0, y: 4 },
    radius: 4,
    spread: 0,
    visible: true
  }
}

export interface EffectEditSnapshot {
  effects: Effect[]
  effectStyleId: string | null
}

export function createEffectEditActions(
  editor: Editor,
  effectsBeforeScrub: Ref<EffectEditSnapshot | null>
) {
  function scrubEffect(node: SceneNode | null, index: number, changes: Partial<Effect>) {
    if (!node) return
    if (!effectsBeforeScrub.value) {
      effectsBeforeScrub.value = {
        effects: node.effects.map((e) => ({
          ...e,
          color: { ...e.color },
          offset: { ...e.offset }
        })),
        effectStyleId: node.effectStyleId
      }
    }
    const effects = [...node.effects]
    effects[index] = { ...effects[index], ...changes }
    editor.updateNode(node.id, { effects })
    editor.requestRender()
  }

  function commitEffect(node: SceneNode | null, index: number, changes: Partial<Effect>) {
    if (!node) return
    const previous = effectsBeforeScrub.value
    effectsBeforeScrub.value = null
    const effects = [...node.effects]
    effects[index] = { ...effects[index], ...changes }
    editor.updateNode(node.id, { effects })
    editor.requestRender()
    if (previous) {
      editor.commitNodeUpdate(
        node.id,
        { effects: previous.effects, effectStyleId: previous.effectStyleId },
        'Change effect'
      )
    }
  }

  return { scrubEffect, commitEffect }
}

export function createEffectControlActions(expandedIndex: Ref<number | null>) {
  function updateType(
    patch: (index: number, changes: Partial<Effect>) => void,
    node: SceneNode | null,
    index: number,
    type: EffectType
  ) {
    if (!node) return
    patch(index, effectKindDefaults(type, node.effects[index]))
  }

  function updateColor(
    patch: (index: number, changes: Partial<Effect>) => void,
    index: number,
    color: Color
  ) {
    patch(index, { color })
  }

  function adjustExpandedAfterRemove(index: number) {
    if (expandedIndex.value === index) expandedIndex.value = null
    else if (expandedIndex.value !== null && expandedIndex.value > index) expandedIndex.value--
  }

  function handleRemove(removeFn: (index: number) => void, index: number) {
    removeFn(index)
    adjustExpandedAfterRemove(index)
  }

  function toggleExpand(index: number) {
    expandedIndex.value = expandedIndex.value === index ? null : index
  }

  return { updateType, updateColor, handleRemove, adjustExpandedAfterRemove, toggleExpand }
}
