<script setup lang="ts">
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent, PopoverClose } from 'reka-ui'
import { computed } from 'vue'

import type { SceneNode } from '@kalka/scene-graph'
import { useI18n, useLayoutControlsContext, useRetainedPopup } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'
import { usePopoverUI } from '@/components/ui/overlay/popover'
import SegmentedControl from '@/components/ui/select/SegmentedControl.vue'

const ctx = useLayoutControlsContext()
const { panels, common } = useI18n()
const { open: popupOpen, portalActive } = useRetainedPopup()
const styles = usePopoverUI({
  content: 'w-64 max-w-[calc(100vw-1rem)]',
  header: 'flex items-center justify-between border-b border-border px-3 py-2',
  body: 'flex flex-col gap-3 p-3'
})

const strokes = computed(() => (ctx.node.strokesIncludedInLayout ? 'included' : 'excluded'))
const stacking = computed(() => (ctx.node.itemReverseZIndex ? 'first' : 'last'))
const baseline = computed(() => ctx.node.counterAxisAlign === 'BASELINE')

function update(changes: Partial<SceneNode>, label: string) {
  ctx.editor.updateNodeWithUndo(ctx.node.id, changes, label)
}
</script>

<template>
  <PopoverRoot v-model:open="popupOpen">
    <PopoverTrigger as-child>
      <AppButton
        :aria-label="panels.advancedLayoutSettings"
        data-test-id="layout-advanced-settings"
      >
        <icon-hugeicons-sliders-horizontal class="size-3.5" />
      </AppButton>
    </PopoverTrigger>
    <PopoverPortal v-if="portalActive">
      <PopoverContent
        side="left"
        align="start"
        :side-offset="8"
        :aria-label="panels.advancedLayoutSettings"
        :class="styles.content"
      >
        <div :class="styles.header">
          <h3 class="text-xs font-semibold text-surface">{{ panels.advancedLayoutSettings }}</h3>
          <PopoverClose as-child
            ><AppButton :aria-label="common.close"><icon-hugeicons-x class="size-3.5" /></AppButton
          ></PopoverClose>
        </div>
        <div :class="styles.body">
          <div class="flex flex-col gap-1">
            <span class="text-[11px] text-muted">{{ panels.layoutStrokes }}</span>
            <SegmentedControl
              :model-value="strokes"
              data-test-id="layout-strokes-in-layout"
              :label="panels.layoutStrokes"
              :options="[
                { value: 'included', label: panels.strokesIncludedInLayout },
                { value: 'excluded', label: panels.strokesExcludedFromLayout }
              ]"
              @change="
                update(
                  { strokesIncludedInLayout: $event === 'included' },
                  'Change strokes in layout'
                )
              "
            />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-[11px] text-muted">{{ panels.canvasStacking }}</span>
            <SegmentedControl
              :model-value="stacking"
              data-test-id="layout-canvas-stacking"
              :label="panels.canvasStacking"
              :options="[
                { value: 'first', label: panels.firstOnTop },
                { value: 'last', label: panels.lastOnTop }
              ]"
              @change="update({ itemReverseZIndex: $event === 'first' }, 'Change canvas stacking')"
            />
          </div>
          <label
            v-if="ctx.node.layoutMode === 'HORIZONTAL'"
            class="flex cursor-pointer items-center gap-2 text-xs text-surface"
          >
            <input
              type="checkbox"
              data-test-id="layout-align-baseline"
              class="accent-accent"
              :checked="baseline"
              @change="
                update(
                  { counterAxisAlign: baseline ? 'MIN' : 'BASELINE' },
                  'Toggle text baseline alignment'
                )
              "
            />
            {{ panels.alignTextBaseline }}
          </label>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
