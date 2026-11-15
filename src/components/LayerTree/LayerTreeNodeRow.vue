<script setup lang="ts">
import { tv } from 'tailwind-variants'
import { computed } from 'vue'

import type { LayerNode } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import type { LayerIssueMark as LayerIssueMarkData } from '@/app/editor/design-check/layers'
import { COMPONENT_TYPES, nodeIcon } from '@/app/editor/icons'
import LayerIssueMark from '@/components/design-check/LayerIssueMark.vue'
import layerTreeTheme from '@/theme/layer-tree'

import LayerTreeActions from './LayerTreeActions.vue'
import LayerTreeDisclosure from './LayerTreeDisclosure.vue'
import LayerTreeDropIndicator from './LayerTreeDropIndicator.vue'
import LayerTreeRowShell from './LayerTreeRowShell.vue'
import type { LayerTreeChrome, LayerTreeItemActions } from './types'
import { useLayerTreeUI } from './ui'

const { node, level, hasChildren, selected, padLeft, expanded, actions, chrome, issue } =
  defineProps<{
    node: LayerNode
    level: number
    hasChildren: boolean
    selected: boolean
    padLeft: string
    expanded: boolean
    actions: LayerTreeItemActions
    chrome: LayerTreeChrome
    /** Design issues on the layer, or inside it, shown while it is collapsed. */
    issue?: LayerIssueMarkData | null
  }>()

const emit = defineEmits<{
  renameStart: [id: string, name: string]
}>()

const store = useEditorStore()
/**
 * What the layer is in the page's HTML, when its name does not already say it: its first class,
 * else its tag. A quiet reminder that layers are elements, without renaming anything.
 */
const htmlMark = computed(() => {
  // The graph is not reactive; the scene version tells when it changed.
  void store.state.sceneVersion
  const source = store.graph.getNode(node.id)
  if (!source) return null
  const [first] = source.htmlClasses
  if (first && first !== node.name) return { kind: 'class', text: `.${first}` }
  if (source.htmlTag && source.htmlTag !== node.name) return { kind: 'tag', text: source.htmlTag }
  return null
})

const ui = useLayerTreeUI()
const layerTree = tv(layerTreeTheme)
const styles = computed(() =>
  layerTree({
    expanded,
    actionsVisible: node.locked || !node.visible,
    selected,
    focused: chrome.focused,
    dragging: chrome.draggingId === node.id,
    visible: node.visible,
    component: COMPONENT_TYPES.has(node.type),
    slot: node.slot,
    childDropTarget:
      chrome.instructionTargetId === node.id && chrome.instruction?.type === 'make-child'
  })
)
</script>

<template>
  <LayerTreeRowShell
    :pad-left="padLeft"
    data-test-id="layers-item"
    data-slot="row"
    :data-selected="selected || undefined"
    :data-focused="chrome.focused || undefined"
    :data-dragging="chrome.draggingId === node.id || undefined"
    :data-hidden="!node.visible || undefined"
    :data-drop-position="
      chrome.instructionTargetId === node.id && chrome.instruction?.type === 'make-child'
        ? 'child'
        : undefined
    "
    :class="styles.row({ class: ui?.row })"
    @dblclick="emit('renameStart', node.id, node.name)"
  >
    <LayerTreeDisclosure
      :expanded="expanded"
      :label="node.name"
      :ui="{
        disclosure: styles.disclosure({ class: ui?.disclosure }),
        placeholder: styles.disclosurePlaceholder({ class: ui?.disclosurePlaceholder })
      }"
      :visible="hasChildren"
      @toggle="actions.toggleExpand"
    />

    <component :is="nodeIcon(node)" data-slot="icon" :class="styles.icon({ class: ui?.icon })" />
    <span data-slot="label" :class="styles.label({ class: ui?.label })">{{ node.name }}</span>
    <span
      v-if="htmlMark"
      data-slot="html-mark"
      :data-kind="htmlMark.kind"
      :class="styles.htmlMark()"
    >
      {{ htmlMark.text }}
    </span>
    <LayerIssueMark v-if="issue && (issue.own || !expanded)" :mark="issue" />

    <LayerTreeActions
      :node="node"
      :ui="{
        actions: styles.actions({ class: ui?.actions }),
        action: styles.action({ class: ui?.action }),
        lockIcon: layerTree({ actionActive: node.locked }).actionIcon({ class: ui?.actionIcon }),
        visibilityIcon: layerTree({ actionActive: !node.visible }).actionIcon({
          class: ui?.actionIcon
        })
      }"
      @toggle-lock="actions.toggleLock"
      @toggle-visibility="actions.toggleVisibility"
    />

    <LayerTreeDropIndicator
      :active="chrome.instructionTargetId === node.id"
      :instruction="chrome.instruction"
      :level="level"
      :indent="chrome.indent"
    />
  </LayerTreeRowShell>
</template>
