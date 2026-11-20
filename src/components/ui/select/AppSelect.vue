<script setup lang="ts" generic="T extends string | number">
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport
} from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, shallowRef } from 'vue'

import { useRetainedPopup } from '@kalka/vue'

import type { ComponentUI } from '@/components/ui/types'
import theme from '@/theme/select/app'
import type { AppSelectTheme } from '@/theme/select/app'

interface AppSelectProps<TValue extends string | number> {
  modelValue: TValue
  label?: string
  options: { value: TValue; label: string; disabled?: boolean }[]
  placeholder?: string
  /** Shown in the trigger instead of the chosen option, such as a summary of what it sets. */
  displayLabel?: string
  ui?: ComponentUI<AppSelectTheme>
  /**
   * Shows an option on the canvas while it is hovered or focused in the open list, and `null`
   * when the list closes or a choice is made, so the hovered value never outlives the menu.
   */
  preview?: (value: T | null) => void
}

defineOptions({ inheritAttrs: false })

const { modelValue, options, label, placeholder, displayLabel, ui, preview } =
  defineProps<AppSelectProps<T>>()
// Emitted on every choice, even when a preview already shows the chosen value in `modelValue`.
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()
const styles = tv(theme)()
const { open: popupOpen, portalActive } = useRetainedPopup()
/**
 * The value the list was opened on. A preview feeds the hovered value back into `modelValue`, so
 * while the list is open it keeps this one: the check stays on the document's value, and choosing
 * the hovered option is still a change.
 */
const openedOn = shallowRef<T>()
const shownValue = computed(() =>
  popupOpen.value && preview && openedOn.value !== undefined ? openedOn.value : modelValue
)

/** A choice ends the preview first, so the commit starts from the document's own value. */
function choose(value: T) {
  preview?.(null)
  emit('update:modelValue', value)
}

function setOpen(open: boolean) {
  if (open) openedOn.value = modelValue
  else preview?.(null)
  popupOpen.value = open
}

const selectedLabel = computed(
  () => options.find((option) => option.value === shownValue.value)?.label
)
</script>

<template>
  <SelectRoot
    :model-value="shownValue"
    :open="popupOpen"
    @update:model-value="choose"
    @update:open="setOpen"
  >
    <SelectTrigger v-if="$slots.trigger" as-child v-bind="$attrs" :aria-label="label">
      <slot name="trigger" />
    </SelectTrigger>
    <SelectTrigger
      v-else
      v-bind="$attrs"
      :class="styles.trigger({ class: ui?.trigger })"
      :aria-label="label"
    >
      <SelectValue :placeholder="placeholder" :class="styles.value({ class: ui?.value })">
        {{ displayLabel ?? selectedLabel ?? placeholder }}
      </SelectValue>
      <icon-hugeicons-chevron-down class="ml-1 size-3 shrink-0 text-muted" />
    </SelectTrigger>
    <SelectPortal v-if="portalActive">
      <SelectContent
        position="popper"
        :side-offset="2"
        :class="styles.content({ class: ui?.content })"
      >
        <SelectScrollUpButton class="flex items-center justify-center py-0.5 text-muted">
          <icon-hugeicons-chevron-up class="size-3.5" />
        </SelectScrollUpButton>
        <SelectViewport :class="styles.viewport({ class: ui?.viewport })">
          <SelectItem
            v-for="opt in options"
            :key="String(opt.value)"
            :value="opt.value"
            :disabled="opt.disabled"
            :class="styles.item({ class: ui?.item })"
            @pointerenter="!opt.disabled && preview?.(opt.value)"
            @focus="!opt.disabled && preview?.(opt.value)"
          >
            <SelectItemIndicator :class="styles.indicator({ class: ui?.indicator })">
              <icon-hugeicons-check class="size-3 text-primary" />
            </SelectItemIndicator>
            <SelectItemText>{{ opt.label }}</SelectItemText>
            <slot name="option-end" :option="opt" />
          </SelectItem>
        </SelectViewport>
        <SelectScrollDownButton class="flex items-center justify-center py-0.5 text-muted">
          <icon-hugeicons-chevron-down class="size-3.5" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
