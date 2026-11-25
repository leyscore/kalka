<script setup lang="ts">
import { useStore } from '@nanostores/vue'
import { useFocus } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'

import { commonMessages, filesMessages } from '@kalka/vue'

import type { CloseChoice, DocumentsCloseChoice } from '@/app/document/close/controller'
import type { ClosePrompt } from '@/app/document/close/prompt'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlertDialogRoot from '@/components/ui/dialog/AppAlertDialogRoot.vue'
import AppDialogFooter from '@/components/ui/dialog/AppDialogFooter.vue'
import AppDialogHeader from '@/components/ui/dialog/AppDialogHeader.vue'
import {
  documentCloseButtonUI,
  documentCloseListStyles,
  documentCloseUI
} from '@/theme/document/close'

const { prompt } = defineProps<{ prompt: ClosePrompt | null }>()
const emit = defineEmits<{ answer: [choice: CloseChoice | DocumentsCloseChoice] }>()

const files = useStore(filesMessages)
const common = useStore(commonMessages)
const primaryButton = useTemplateRef('primaryButton')

// The dialog mounts on open, so focusing the primary action when the target appears keeps
// Return on Save (or Save All) while Escape still cancels.
useFocus(primaryButton, { initialValue: true, preventScroll: true })

// The dialog keeps showing the question it asked while it fades out after an answer, so its
// title does not lose the document's name and its buttons do not change under the pointer.
const shown = shallowRef<ClosePrompt | null>(null)
watch(
  () => prompt,
  (next) => {
    if (next) shown.value = next
  },
  { immediate: true }
)

const heading = computed(() => {
  const asked = shown.value
  if (asked?.kind === 'documents') {
    return files.value.saveAllBeforeClosing({ count: asked.documentNames.length })
  }
  return files.value.saveBeforeClosing({ name: asked?.documentName ?? '' })
})

function updateOpen(open: boolean) {
  if (!open) emit('answer', 'cancel')
}
</script>

<template>
  <AppAlertDialogRoot
    :open="prompt !== null"
    :size="shown?.kind === 'documents' ? 'md' : 'sm'"
    data-test-id="unsaved-changes-dialog"
    @update:open="updateOpen"
  >
    <AppDialogHeader
      :heading="heading"
      :description="
        shown?.kind === 'documents'
          ? files.saveAllBeforeClosingDescription
          : files.saveBeforeClosingDescription
      "
      :show-close="false"
      :ui="documentCloseUI"
    />
    <ul
      v-if="shown?.kind === 'documents'"
      :aria-label="files.unsavedDocuments"
      :class="documentCloseListStyles.list()"
    >
      <li
        v-for="(name, index) in shown.documentNames"
        :key="index"
        :class="documentCloseListStyles.item()"
      >
        <icon-hugeicons-file-01 class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        <span class="truncate">{{ name }}</span>
      </li>
    </ul>
    <AppDialogFooter v-if="shown?.kind === 'documents'" :ui="documentCloseUI">
      <AppButton
        color="error"
        variant="outline"
        class="mr-auto"
        :ui="documentCloseButtonUI"
        @click="emit('answer', 'discard-all')"
      >
        {{ files.discardAll }}
      </AppButton>
      <AppButton
        color="neutral"
        variant="outline"
        :ui="documentCloseButtonUI"
        @click="emit('answer', 'cancel')"
      >
        {{ common.cancel }}
      </AppButton>
      <AppButton
        color="neutral"
        variant="outline"
        :ui="documentCloseButtonUI"
        @click="emit('answer', 'review')"
      >
        {{ files.reviewChanges }}
      </AppButton>
      <AppButton
        ref="primaryButton"
        color="primary"
        variant="solid"
        :ui="documentCloseButtonUI"
        @click="emit('answer', 'save-all')"
      >
        {{ files.saveAll }}
      </AppButton>
    </AppDialogFooter>
    <AppDialogFooter v-else :ui="documentCloseUI">
      <AppButton
        color="error"
        variant="outline"
        class="mr-auto"
        :ui="documentCloseButtonUI"
        @click="emit('answer', 'discard')"
      >
        {{ files.discard }}
      </AppButton>
      <AppButton
        color="neutral"
        variant="outline"
        :ui="documentCloseButtonUI"
        @click="emit('answer', 'cancel')"
      >
        {{ common.cancel }}
      </AppButton>
      <AppButton
        ref="primaryButton"
        color="primary"
        variant="solid"
        :ui="documentCloseButtonUI"
        @click="emit('answer', 'save')"
      >
        {{ common.save }}
      </AppButton>
    </AppDialogFooter>
  </AppAlertDialogRoot>
</template>
