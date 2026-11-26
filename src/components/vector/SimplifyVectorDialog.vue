<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import { useDrawingMessages, useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import {
  DEFAULT_SIMPLIFY_TOLERANCE,
  simplifyVectorOpen,
  simplifyVectorPreview
} from '@/app/editor/vector/simplify-dialog'
import AppButton from '@/components/ui/button/AppButton.vue'
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot
} from '@/components/ui/dialog'
import AppInput from '@/components/ui/input/AppInput.vue'

const store = useEditorStore()
const { common } = useI18n()
const messages = useDrawingMessages()
const tolerance = ref<string | number>(DEFAULT_SIMPLIFY_TOLERANCE)
const value = computed(() => Number(tolerance.value))
const canApply = computed(() => Number.isFinite(value.value) && value.value > 0)
/** Set by Apply, so closing the dialog keeps what it drew. */
let applying = false

watch(simplifyVectorOpen, (open) => {
  if (open) {
    applying = false
    tolerance.value = DEFAULT_SIMPLIFY_TOLERANCE
    void simplifyVectorPreview.preview(store, { tolerance: value.value })
  } else if (!applying) void simplifyVectorPreview.cancel(store)
})

// The canvas shows the simplified paths while the tolerance changes.
watchDebounced(
  value,
  (next) => {
    if (simplifyVectorOpen.value) void simplifyVectorPreview.preview(store, { tolerance: next })
  },
  { debounce: 120 }
)

async function submit() {
  if (!canApply.value) return
  applying = true
  simplifyVectorOpen.value = false
  await simplifyVectorPreview.apply(store, { tolerance: value.value })
}
</script>

<template>
  <AppDialogRoot v-model:open="simplifyVectorOpen" size="sm">
    <AppDialogHeader :heading="messages.simplifyHeading" :close-label="common.close" />
    <AppDialogBody>
      <label class="flex items-center gap-3 text-xs text-muted">
        <span class="w-20 shrink-0">{{ messages.simplifyTolerance }}</span>
        <AppInput
          v-model="tolerance"
          type="number"
          :step="0.5"
          :min="0.1"
          autofocus
          :aria-label="messages.simplifyTolerance"
          @enter="submit"
        />
      </label>
    </AppDialogBody>
    <AppDialogFooter>
      <AppButton size="md" @click="simplifyVectorOpen = false">{{ common.cancel }}</AppButton>
      <AppButton size="md" color="primary" variant="solid" :disabled="!canApply" @click="submit">
        {{ common.apply }}
      </AppButton>
    </AppDialogFooter>
  </AppDialogRoot>
</template>
