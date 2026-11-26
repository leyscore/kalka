<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch } from 'vue'

import { resolvePlayState, type InstanceState, type PresentVariables } from '@kalka/core/editor'
import { behaviourControls, controlRoles, sceneNodeToDesignDocument } from '@kalka/dom-css/export'
import { findLayerByPath, layerPath, type SceneGraph } from '@kalka/scene-graph'

import { renderNode } from '#vue/canvas/islands/render'
import { useShadowContainer } from '#vue/canvas/islands/shadow'
import { createIslandState, instanceStates } from '#vue/canvas/islands/state'
import { useEditor } from '#vue/editor/context'

import { usePresentVideos, type PresentMediaEvent } from './media'

/**
 * One frame of a presented prototype, a screen or an overlay: its layers as live DOM in a shadow
 * root, as preview islands draw them, with controls running and instances shown in the variants
 * the prototype changed them to. Layers carry their layer path, which the presenter's triggers
 * and smart animate read.
 */
const { rootId, revision, variants, variables } = defineProps<{
  rootId: string
  /** Changing it starts every control again as designed. */
  revision: number
  /** Change to: variant values by the layer path of each changed instance. */
  variants?: Readonly<Record<string, Record<string, string>>>
  /** Variables and modes the prototype set, which bound layers show. */
  variables?: PresentVariables
}>()
const emit = defineEmits<{
  /** A video of this frame played through a time, or ended. */
  media: [event: PresentMediaEvent]
}>()
const editor = useEditor()

const SCREEN_CSS = ':host{all:initial;display:block}*,*::before,*::after{box-sizing:border-box}'
const container = useShadowContainer(useTemplateRef<HTMLElement>('host'), SCREEN_CSS)
const videos = usePresentVideos((event) => emit('media', event))

const controls = computed(() => {
  void editor.state.sceneVersion
  return behaviourControls(editor.graph, rootId)
})
const roles = computed(() => controlRoles(controls.value))
const state = shallowRef(createIslandState(controls.value))
watch(
  () => [rootId, revision, [...controls.value.keys()].join('\n')],
  () => (state.value = createIslandState(controls.value))
)

const projection = computed(() => {
  void editor.state.sceneVersion
  const states = new Map<string, InstanceState>(instanceStates(controls.value, state.value))
  for (const [path, values] of Object.entries(variants ?? {}))
    states.set(path, {
      ...states.get(path),
      variants: { ...states.get(path)?.variants, ...values }
    })
  const graph = resolvePlayState(editor.graph, rootId, states, variables)
  const [root] = sceneNodeToDesignDocument(graph, rootId).children
  return { graph, root }
})

function Layers() {
  const { graph, root } = projection.value
  return root
    ? renderNode(
        {
          graph,
          rootId,
          controls: controls.value,
          roles: roles.value,
          state: state.value,
          media: (nodeId) => videos.videoOf(graph, nodeId)
        },
        root,
        ''
      )
    : null
}

/** The layers at an element of this frame, innermost first, as the presenter's graph has them. */
function layersAt(target: EventTarget | null): string[] {
  const { graph } = projection.value
  const ids: string[] = []
  let element = target instanceof Element ? target : null
  while (element && element !== container.value) {
    const path = element.getAttribute('data-layer')
    if (path !== null) {
      const node = path === '' ? graph.getNode(rootId) : findLayerByPath(graph, rootId, path)
      if (node && ids.at(-1) !== node.id) ids.push(node.id)
    }
    element = element.parentElement
  }
  return ids
}

/** The element drawing a layer of this frame. */
function elementOf(nodeId: string): HTMLElement | null {
  const { graph } = projection.value
  const path = nodeId === rootId ? '' : layerPath(graph, rootId, nodeId)
  const found = container.value?.querySelector(`[data-layer="${CSS.escape(path)}"]`)
  return found instanceof HTMLElement ? found : null
}

defineExpose({
  container,
  layersAt,
  elementOf,
  graph: (): SceneGraph => projection.value.graph,
  pathOf: (nodeId: string) => layerPath(projection.value.graph, rootId, nodeId)
})
</script>

<template>
  <div ref="host" :data-present-frame="rootId">
    <Teleport v-if="container" :to="container">
      <Layers />
    </Teleport>
  </div>
</template>
