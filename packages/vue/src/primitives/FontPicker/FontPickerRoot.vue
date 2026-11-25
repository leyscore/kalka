<script setup lang="ts">
import { templateRef, unrefElement } from '@vueuse/core'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxVirtualizer,
  ComboboxViewport,
  type AcceptableValue
} from 'reka-ui'
import { nextTick, shallowRef, watch } from 'vue'

import { useRetainedPopup } from '#vue/lifecycle/retention/popup'
import type { FontPickerUI } from '#vue/primitives/FontPicker/types'
import {
  useFontPicker,
  type FontAccessController,
  type FontFamilyOption
} from '#vue/primitives/FontPicker/useFontPicker'

const {
  listFamilies,
  localFontAccess,
  ui,
  emptySearchText,
  emptyFontsText,
  emptyFontsHint,
  refreshKey
} = defineProps<{
  listFamilies: () => Promise<string[] | FontFamilyOption[]>
  localFontAccess?: FontAccessController
  ui?: FontPickerUI
  emptySearchText?: string
  emptyFontsText?: string
  emptyFontsHint?: string
  /** Lists the families again when it changes, such as after a font is added. */
  refreshKey?: unknown
}>()

const modelValue = defineModel<string>({ required: true })
// `highlight` is the family under the pointer or keys while the list is open, and `null` once it
// closes, so an owner can preview it.
const emit = defineEmits<{ select: [family: string]; highlight: [family: string | null] }>()

const contentRef = templateRef<HTMLElement>('contentRef')

function focusSearchInput() {
  nextTick(() => {
    const content = unrefElement(contentRef)
    if (!(content instanceof HTMLElement)) return
    content.querySelector<HTMLInputElement>('input')?.focus()
  })
}

const { searchTerm, open, filtered, loading, accessState, requestAccess, select, refresh } =
  useFontPicker({
    modelValue,
    listFamilies,
    localFontAccess,
    onSelect: (family) => emit('select', family)
  })
watch(
  () => refreshKey,
  () => void refresh()
)

function close() {
  open.value = false
}
const { portalActive } = useRetainedPopup(open)

/**
 * The family the list opened on. A preview feeds the hovered family back into `modelValue`, which
 * would move the list's highlight and check onto it; while open, the list keeps this one.
 */
const openedOn = shallowRef<string>()
watch(
  open,
  (isOpen) => {
    openedOn.value = isOpen ? modelValue.value : undefined
  },
  { flush: 'sync' }
)

/**
 * Whether the pointer or the arrow keys moved through the list since it opened or the search
 * changed. The list highlights a family by itself as it opens and as the search filters it; as in
 * Figma, only one the person reaches is previewed, so opening or searching leaves the text alone.
 */
let navigated = false
const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'])

function navigate(event: Event) {
  if (event instanceof KeyboardEvent && !NAVIGATION_KEYS.has(event.key)) return
  navigated = true
}

function highlight(payload: { value: AcceptableValue } | undefined) {
  if (!navigated) return
  emit('highlight', typeof payload?.value === 'string' ? payload.value : null)
}
watch(open, (isOpen) => {
  navigated = false
  if (!isOpen) emit('highlight', null)
})
watch(searchTerm, () => {
  if (!navigated) return
  navigated = false
  emit('highlight', null)
})
</script>

<template>
  <ComboboxRoot
    v-model:open="open"
    :model-value="openedOn ?? modelValue"
    :ignore-filter="true"
    @highlight="highlight"
    @update:model-value="
      (v: AcceptableValue) => {
        if (typeof v === 'string') select(v)
      }
    "
  >
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <slot name="trigger" :value="modelValue" :open="open">
          <button :class="ui?.trigger">
            <span class="truncate">{{ modelValue }}</span>
          </button>
        </slot>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal v-if="portalActive">
      <ComboboxContent
        :side-offset="2"
        align="start"
        position="popper"
        :class="ui?.content"
        @open-auto-focus.prevent
        ref="contentRef"
        @vue:mounted="focusSearchInput"
        @pointermove.capture="navigate"
        @keydown.capture="navigate"
      >
        <slot name="search" :search-term="searchTerm">
          <ComboboxInput
            v-model="searchTerm"
            :display-value="() => ''"
            :class="ui?.search"
            placeholder="Search fonts…"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </slot>

        <ComboboxViewport :class="ui?.viewport ?? 'max-h-72 overflow-y-auto'">
          <ComboboxVirtualizer
            v-slot="{ option }"
            :options="filtered"
            :text-content="(option: FontFamilyOption) => option.family"
            :estimate-size="36"
          >
            <ComboboxItem
              :value="option.family"
              :class="ui?.item"
              :style="{ fontFamily: `'${option.family}', sans-serif` }"
            >
              <slot
                name="item"
                :family="option.family"
                :source="option.source"
                :selected="option.family === (openedOn ?? modelValue)"
              >
                <ComboboxItemIndicator>
                  <slot name="indicator" :selected="option.family === (openedOn ?? modelValue)" />
                </ComboboxItemIndicator>
                <span class="truncate">{{ option.family }}</span>
              </slot>
            </ComboboxItem>
          </ComboboxVirtualizer>

          <div v-if="filtered.length === 0 && searchTerm" :class="ui?.empty">
            {{ emptySearchText ?? 'No fonts found' }}
          </div>
          <div v-else-if="filtered.length === 0" :class="ui?.empty">
            <div>
              <p v-if="accessState === 'prompt'">
                Allow local font access to browse installed fonts.
              </p>
              <p v-else-if="accessState === 'denied'">
                Local font access is blocked for this site.
              </p>
              <p v-else-if="accessState === 'unsupported'">
                Local fonts are not available in this browser.
              </p>
              <p v-else>{{ emptyFontsText ?? 'No local fonts available.' }}</p>
              <p v-if="emptyFontsHint" class="mt-1">{{ emptyFontsHint }}</p>
              <button
                v-if="accessState === 'prompt'"
                type="button"
                :class="ui?.emptyAction"
                :disabled="loading"
                @click="requestAccess"
              >
                {{ loading ? 'Loading…' : 'Allow local fonts' }}
              </button>
            </div>
          </div>
        </ComboboxViewport>
        <slot name="footer" :search-term="searchTerm" :close="close" />
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
