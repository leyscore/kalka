<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { canTakeHTMLTag, defaultTagForNode } from '@open-pencil/dom-css/export'
import { HTML_TAGS, parseHTMLClasses, parseHTMLTag } from '@open-pencil/scene-graph'
import { useI18n } from '@open-pencil/vue'

import { useEditorStore } from '@/app/editor/active-store'
import AppInput from '@/components/ui/input/AppInput.vue'
import PanelFieldGroup from '@/components/ui/panel/PanelFieldGroup.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

/** The select's value for a layer that keeps the tag its type gives. */
const DEFAULT_TAG = 'auto'

const store = useEditorStore()
const { panels } = useI18n()

const node = computed(() => {
  // The graph is not reactive; the scene version tells when it changed.
  void store.state.sceneVersion
  const ids = [...store.state.selectedIds]
  const selected = ids.length === 1 ? store.graph.getNode(ids[0]) : undefined
  return selected && selected.type !== 'CANVAS' ? selected : undefined
})

/** The node is edited in place, so what it holds is read again on every scene change. */
function current() {
  void store.state.sceneVersion
  return node.value
}

const choosesTag = computed(() => {
  const layer = current()
  return !!layer && canTakeHTMLTag(layer)
})
const tag = computed(() => current()?.htmlTag ?? DEFAULT_TAG)
const tagOptions = computed(() => {
  const layer = current()
  const fallback = layer ? defaultTagForNode(layer) : 'div'
  return [
    { value: DEFAULT_TAG, label: panels.value.htmlTagDefault({ tag: fallback }) },
    ...HTML_TAGS.map((value) => ({ value, label: value }))
  ]
})

function setTag(value: string): void {
  const layer = node.value
  if (!layer) return
  const next = value === DEFAULT_TAG ? null : parseHTMLTag(value)
  if (next !== layer.htmlTag) store.updateNodeWithUndo(layer.id, { htmlTag: next }, 'HTML tag')
}

const classes = computed(() => current()?.htmlClasses.join(' ') ?? '')
const classDraft = ref(classes.value)
watch(classes, (value) => (classDraft.value = value))

function commitClasses(): void {
  const layer = node.value
  if (!layer) return
  const next = parseHTMLClasses(classDraft.value)
  classDraft.value = next.join(' ')
  if (next.join(' ') !== layer.htmlClasses.join(' '))
    store.updateNodeWithUndo(layer.id, { htmlClasses: next }, 'HTML classes')
}
</script>

<template>
  <PanelSection v-if="node" :label="panels.html" data-test-id="html-section">
    <div class="flex flex-col gap-2">
      <PanelFieldGroup v-if="choosesTag" :label="panels.htmlTag">
        <AppSelect
          :model-value="tag"
          :options="tagOptions"
          :label="panels.htmlTag"
          data-property="html-tag"
          @update:model-value="setTag"
        />
      </PanelFieldGroup>
      <PanelFieldGroup :label="panels.htmlClasses">
        <AppInput
          v-model="classDraft"
          tone="panel"
          size="sm"
          class="font-mono"
          :placeholder="panels.htmlClassesPlaceholder"
          :aria-label="panels.htmlClasses"
          spellcheck="false"
          autocomplete="off"
          data-property="html-classes"
          @blur="commitClasses"
          @enter="commitClasses"
        />
      </PanelFieldGroup>
    </div>
  </PanelSection>
</template>
