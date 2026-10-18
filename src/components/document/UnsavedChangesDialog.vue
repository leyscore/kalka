<script setup lang="ts">
import { useStore } from '@nanostores/vue'
import { useFocus } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'

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

const heading = computed(() => {
  if (prompt?.kind === 'documents') {
    return files.value.saveAllBeforeClosing({ count: prompt.documentNames.length })
  }
  return files.value.saveBeforeClosing({ name: prompt?.documentName ?? '' })
})

function updateOpen(open: boolean) {
  if (!open) emit('answer', 'cancel')
}
</script>

<template>
  <AppAlertDialogRoot
    :open="prompt !== null"
    :size="prompt?.kind === 'documents' ? 'md' : 'sm'"
    data-test-id="unsaved-changes-dialog"
    @update:open="updateOpen"
  >
    <AppDialogHeader
      :heading="heading"
      :description="
        prompt?.kind === 'documents'
          ? files.saveAllBeforeClosingDescription
          : files.saveBeforeClosingDescription
      "
      :show-close="false"
      :ui="documentCloseUI"
    />
    <ul
      v-if="prompt?.kind === 'documents'"
      :aria-label="files.unsavedDocuments"
      :class="documentCloseListStyles.list()"
    >
      <li
        v-for="(name, index) in prompt.documentNames"
        :key="index"
        :class="documentCloseListStyles.item()"
      >
        <icon-lucide-file class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        <span class="truncate">{{ name }}</span>
      </li>
    </ul>
    <AppDialogFooter v-if="prompt?.kind === 'documents'" :ui="documentCloseUI">
      <AppButton
        color="error"
        variant="ghost"
        class="mr-auto"
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
      <AppButton color="neutral" variant="ghost" class="mr-auto" @click="emit('answer', 'discard')">
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
