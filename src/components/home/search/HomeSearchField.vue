<script setup lang="ts">
import { templateRef } from '@vueuse/core'
import { nextTick, watch } from 'vue'

import { useI18n, useViewportKind } from '@open-pencil/vue'

import { activeTab } from '@/app/tabs'
import AppInput from '@/components/ui/input/AppInput.vue'
import { homeSearch } from '@/theme/home/start'

/** Searches recent and storage files; takes focus when the home tab opens on a desktop. */
const query = defineModel<string>({ required: true })
const { files } = useI18n()
const { isMobile } = useViewportKind()
const searchInput = templateRef<{ focus: (options?: FocusOptions) => void }>('searchInput')

function focusSearch(onCleanup: (cleanup: () => void) => void): void {
  if (isMobile.value || activeTab.value?.kind !== 'home') return
  const tabId = activeTab.value.id
  const previousFocus = document.activeElement
  if (previousFocus instanceof HTMLElement && previousFocus.closest('[role="tablist"]')) return
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })
  void nextTick(() => {
    if (cancelled || isMobile.value || activeTab.value?.id !== tabId) return
    if (document.activeElement !== previousFocus) return
    searchInput.value?.focus({ preventScroll: true })
  })
}

watch(
  () => activeTab.value?.id,
  (_id, _previousId, onCleanup) => focusSearch(onCleanup),
  { immediate: true, flush: 'post' }
)
</script>

<template>
  <AppInput
    ref="searchInput"
    v-model="query"
    type="search"
    name="file-search"
    autocomplete="off"
    :density="isMobile ? 'comfortable' : 'compact'"
    :placeholder="files.searchFiles"
    :aria-label="files.searchFiles"
    :ui="isMobile ? undefined : homeSearch"
  >
    <template #leading><icon-lucide-search class="size-3.5" /></template>
  </AppInput>
</template>
