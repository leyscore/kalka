<script setup lang="ts">
import { isEqual } from 'es-toolkit'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'
import { computed } from 'vue'

import { breakpointsOf, responsivePrimaryOf, type SceneNode } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import {
  addBreakpoint,
  BREAKPOINT_PRESETS,
  type BreakpointPreset
} from '@/app/editor/breakpoints/actions'
import { useMenuUI } from '@/components/ui/menu/menu'
import Tip from '@/components/ui/overlay/Tip.vue'
import { canvasBreakpoints } from '@/theme/canvas-breakpoints'

/** Below these widths an artboard reads as a tablet, then as a phone. */
const TABLET_MAX_WIDTH = 1024
const PHONE_MAX_WIDTH = 600

const store = useEditorStore()
const { panels } = useI18n()
const styles = canvasBreakpoints()
const menuCls = useMenuUI()

/** The artboard the selection sits in, when there is one. */
const selectedArtboard = computed(() => {
  void store.state.sceneVersion
  const [id] = store.state.selectedIds
  const node = id ? store.graph.getNode(id) : undefined
  if (!node) return undefined
  return store.graph.closest(node.id, (candidate) => {
    const parent = candidate.parentId ? store.graph.getNode(candidate.parentId) : undefined
    return parent?.type === 'CANVAS'
  })
})

/** The primary artboard the screens belong to: the selection's, else the page's first. */
const primary = computed<SceneNode | undefined>(() => {
  void store.state.sceneVersion
  const selected = selectedArtboard.value
  if (selected?.type === 'FRAME') return responsivePrimaryOf(store.graph, selected)
  return store.graph
    .getChildren(store.state.currentPageId)
    .find((node) => node.type === 'FRAME' && !node.responsiveSource)
})

/** Kept while unchanged, so an edit elsewhere in the scene does not re-render the switcher. */
const screens = computed<{ id: string; name: string; width: number }[]>((previous) => {
  void store.state.sceneVersion
  const root = primary.value
  const next = root
    ? [
        { id: root.id, name: root.name, width: root.width },
        ...breakpointsOf(store.graph, root.id).map((breakpoint) => ({
          id: breakpoint.root.id,
          name: breakpoint.root.name,
          width: breakpoint.width
        }))
      ]
    : []
  return previous && isEqual(previous, next) ? previous : next
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
      !screens.value.some((screen) => screen.width === preset.width)
  )
)

function kind(width: number): 'desktop' | 'tablet' | 'phone' {
  if (width < PHONE_MAX_WIDTH) return 'phone'
  return width < TABLET_MAX_WIDTH ? 'tablet' : 'desktop'
}

function show(id: string): void {
  store.select([id])
  store.revealNodes([id])
}

function add(preset: BreakpointPreset): void {
  if (primary.value)
    void addBreakpoint(store, primary.value.id, preset.width, presetNames.value[preset.key])
}
</script>

<template>
  <div
    v-if="primary"
    role="group"
    :aria-label="panels.breakpoints"
    data-test-id="canvas-breakpoints"
    :class="styles.root()"
  >
    <Tip
      v-for="screen in screens"
      :key="screen.id"
      :label="`${screen.name} · ${Math.round(screen.width)}px`"
      side="bottom"
    >
      <button
        type="button"
        :aria-label="`${screen.name}, ${Math.round(screen.width)}px`"
        :aria-pressed="selectedArtboard?.id === screen.id"
        :data-active="selectedArtboard?.id === screen.id || undefined"
        :data-screen="kind(screen.width)"
        :class="styles.item()"
        @click="show(screen.id)"
      >
        <icon-hugeicons-smartphone v-if="kind(screen.width) === 'phone'" :class="styles.icon()" />
        <icon-hugeicons-tablet-01
          v-else-if="kind(screen.width) === 'tablet'"
          :class="styles.icon()"
        />
        <icon-hugeicons-monitor v-else :class="styles.icon()" />
      </button>
    </Tip>
    <template v-if="missingPresets.length > 0">
      <div aria-hidden="true" :class="styles.divider()" />
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          :aria-label="panels.breakpoints"
          data-test-id="canvas-breakpoints-add"
          :class="styles.item()"
        >
          <icon-hugeicons-plus :class="styles.icon()" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent :side-offset="6" align="center" :class="menuCls.content">
            <DropdownMenuItem
              v-for="preset in missingPresets"
              :key="preset.key"
              :data-preset="preset.key"
              :class="menuCls.item"
              @select="add(preset)"
            >
              <icon-hugeicons-smartphone v-if="preset.key === 'phone'" class="size-3.5" />
              <icon-hugeicons-tablet-01 v-else class="size-3.5" />
              <span class="flex-1">{{ presetNames[preset.key] }}</span>
              <span class="text-muted tabular-nums">{{ preset.width }}px</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </template>
  </div>
</template>
