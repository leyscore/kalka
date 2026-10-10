<script setup lang="ts">
import { computed } from 'vue'

import {
  breakpointsOf,
  responsiveOverrides,
  responsiveParent,
  responsivePrimaryOf
} from '@open-pencil/scene-graph'
import { useI18n } from '@open-pencil/vue'

import { useEditorStore } from '@/app/editor/active-store'
import {
  addBreakpoint,
  BREAKPOINT_PRESETS,
  resetBreakpointValues,
  type BreakpointPreset
} from '@/app/editor/breakpoints/actions'
import AppButton from '@/components/ui/button/AppButton.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

const store = useEditorStore()
const { panels } = useI18n()

const node = computed(() => {
  // The graph is not reactive; the scene version tells when it changed.
  void store.state.sceneVersion
  const ids = [...store.state.selectedIds]
  return ids.length === 1 ? store.graph.getNode(ids[0]) : undefined
})

/** The primary artboard the selection belongs to, when the selection is that artboard. */
const primary = computed(() => {
  void store.state.sceneVersion
  const selected = node.value
  const parent = selected?.parentId ? store.graph.getNode(selected.parentId) : undefined
  if (!selected || parent?.type !== 'CANVAS' || selected.type !== 'FRAME') return undefined
  return selected.responsiveSource ? undefined : selected
})

const breakpoints = computed(() => {
  void store.state.sceneVersion
  return primary.value ? breakpointsOf(store.graph, primary.value.id) : []
})

const presetNames = computed<Record<BreakpointPreset['key'], string>>(() => ({
  tablet: panels.value.breakpointTablet,
  phone: panels.value.breakpointPhone
}))

const missingPresets = computed(() =>
  BREAKPOINT_PRESETS.filter(
    (preset) =>
      !!primary.value &&
      preset.width < primary.value.width &&
      !breakpoints.value.some((breakpoint) => breakpoint.width === preset.width)
  )
)

/** For a layer inside a breakpoint: the breakpoint, and how many values are its own there. */
const copy = computed(() => {
  void store.state.sceneVersion
  const selected = node.value
  if (!selected || !responsiveParent(store.graph, selected)) return undefined
  const group = responsivePrimaryOf(store.graph, selected)
  const artboard = group
    ? breakpointsOf(store.graph, group.id).find(
        (breakpoint) =>
          breakpoint.root.id === selected.id ||
          !!store.graph.closest(selected.id, (candidate) => candidate.id === breakpoint.root.id)
      )
    : undefined
  return artboard
    ? {
        name: artboard.root.name,
        width: artboard.width,
        own: responsiveOverrides(store.graph, selected).length
      }
    : undefined
})

function add(preset: BreakpointPreset): void {
  if (primary.value)
    void addBreakpoint(store, primary.value.id, preset.width, presetNames.value[preset.key])
}

function reset(): void {
  if (node.value) resetBreakpointValues(store, node.value)
}
</script>

<template>
  <PanelSection
    v-if="primary || copy"
    :label="panels.breakpoints"
    data-test-id="breakpoints-section"
  >
    <div class="flex flex-col gap-2 text-[11px]">
      <template v-if="primary">
        <div
          v-for="breakpoint in breakpoints"
          :key="breakpoint.root.id"
          class="flex items-center justify-between text-label"
        >
          <span class="truncate">{{ breakpoint.root.name }}</span>
          <span class="text-muted tabular-nums">{{ breakpoint.width }}px</span>
        </div>
        <div v-if="missingPresets.length > 0" class="flex gap-1.5">
          <AppButton
            v-for="preset in missingPresets"
            :key="preset.key"
            size="xs"
            variant="soft"
            class="flex-1"
            :data-test-id="`breakpoint-add-${preset.key}`"
            @click="add(preset)"
          >
            <icon-lucide-plus class="size-3" />
            {{ presetNames[preset.key] }}
          </AppButton>
        </div>
      </template>
      <template v-else-if="copy">
        <span class="text-label">
          {{ panels.breakpointOf({ name: copy.name, width: String(copy.width) }) }}
        </span>
        <div v-if="copy.own > 0" class="flex items-center gap-1.5 text-muted">
          <span class="min-w-0 flex-1">{{ panels.breakpointOwnValues(copy.own) }}</span>
          <AppButton size="xs" variant="ghost" data-test-id="breakpoint-reset" @click="reset">
            {{ panels.breakpointReset }}
          </AppButton>
        </div>
      </template>
    </div>
  </PanelSection>
</template>
