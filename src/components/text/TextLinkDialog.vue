<script setup lang="ts">
import { computed } from 'vue'

import { urlHyperlink } from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { setTextLink, textLinkDialog } from '@/app/editor/text/links'
import AppButton from '@/components/ui/button/AppButton.vue'
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot
} from '@/components/ui/dialog'
import AppInput from '@/components/ui/input/AppInput.vue'

const store = useEditorStore()
const { menu, common } = useI18n()
const { open, url, linked } = textLinkDialog
const link = computed(() => urlHyperlink(url.value))

/** Enter applies the link; it must not also reach the canvas, where it would edit the text. */
function submitOnEnter(event: KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  submit()
}

function submit() {
  if (!link.value) return
  open.value = false
  setTextLink(store, link.value)
}

/** Typing goes on in the text being edited once the dialog closes. */
function returnToText(event: Event) {
  if (!store.state.editingTextId) return
  event.preventDefault()
  store.focusTextEdit()
}

function remove() {
  open.value = false
  setTextLink(store, null)
}
</script>

<template>
  <AppDialogRoot v-model:open="open" size="sm" @close-auto-focus="returnToText">
    <AppDialogHeader :heading="menu.textLinkHeading" :close-label="common.close" />
    <AppDialogBody>
      <label class="flex items-center gap-3 text-xs text-muted">
        <span class="w-20 shrink-0">{{ menu.textLinkAddress }}</span>
        <AppInput
          v-model="url"
          type="url"
          autofocus
          placeholder="https://"
          data-test-id="text-link-url"
          :aria-label="menu.textLinkAddress"
          @enter="submitOnEnter"
        />
      </label>
      <p v-if="url.trim() !== '' && !link" class="mt-2 text-xs text-error" role="alert">
        {{ menu.textLinkInvalid }}
      </p>
    </AppDialogBody>
    <AppDialogFooter>
      <AppButton v-if="linked" size="md" data-test-id="text-link-remove" @click="remove">
        {{ menu.removeTextLink }}
      </AppButton>
      <AppButton size="md" @click="open = false">{{ common.cancel }}</AppButton>
      <AppButton
        size="md"
        color="primary"
        variant="solid"
        :disabled="!link"
        data-test-id="text-link-apply"
        @click="submit"
      >
        {{ common.apply }}
      </AppButton>
    </AppDialogFooter>
  </AppDialogRoot>
</template>
