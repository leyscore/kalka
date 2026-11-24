<script setup lang="ts">
import { DialogTitle } from 'reka-ui'
import { computed, ref } from 'vue'

import PixelSky from '@/components/brand/PixelSky.vue'
import AppDialogRoot from '@/components/ui/dialog/AppDialogRoot.vue'
import { shellFrame } from '@/theme/shell/sidebar'

/**
 * The frame of every page that is not a document: the kalka.design sky, the sidebar on the left
 * and the page beside it. On a phone the sidebar waits behind a menu button and opens as a drawer;
 * choosing a place in it closes it.
 */
const {
  label,
  menuLabel,
  titleBar = false,
  underBar = false
} = defineProps<{
  /** The sidebar's name for assistive technology. */
  label: string
  menuLabel: string
  /**
   * Keep a strip at the top that moves the window and leaves room for its controls, for a frame
   * that covers the desktop app's tab bar, as Settings does.
   */
  titleBar?: boolean
  /** The tab bar sits above this frame, as on Home. */
  underBar?: boolean
}>()
defineSlots<{
  sidebar: () => unknown
  default: () => unknown
  phoneTitle?: () => unknown
}>()

const ui = computed(() => shellFrame({ titleBar, underBar }))
const drawerOpen = ref(false)

function closeOnPlace(event: MouseEvent): void {
  if (
    event.target instanceof Element &&
    event.target.closest('[data-shell-place], [data-test-id="shell-account"]')
  )
    drawerOpen.value = false
}
</script>

<template>
  <div :class="ui.root()" data-test-id="shell-frame">
    <PixelSky place="screen" class="-z-10" />
    <div v-if="titleBar" :class="ui.titleBar()" />
    <div :class="ui.frame()">
      <aside :class="ui.aside()" :aria-label="label">
        <slot name="sidebar" />
      </aside>
      <div :class="ui.main()">
        <div :class="ui.phoneBar()">
          <button
            type="button"
            :class="ui.phoneMenu()"
            :aria-label="menuLabel"
            data-test-id="shell-menu"
            @click="drawerOpen = true"
          >
            <icon-hugeicons-menu-01 class="size-5" aria-hidden="true" />
          </button>
          <slot name="phoneTitle" />
        </div>
        <slot />
      </div>
    </div>
    <AppDialogRoot v-model:open="drawerOpen" size="drawer" data-test-id="shell-drawer">
      <DialogTitle class="sr-only">{{ label }}</DialogTitle>
      <div class="flex h-full" @click.capture="closeOnPlace">
        <slot name="sidebar" />
      </div>
    </AppDialogRoot>
  </div>
</template>
