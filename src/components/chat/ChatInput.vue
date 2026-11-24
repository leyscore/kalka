<script setup lang="ts">
import { computed, nextTick, useTemplateRef, watch } from 'vue'

import { colorToCSS } from '@kalka/scene-graph/color'
import { useI18n, useSelectionState } from '@kalka/vue'

import { revokeImagePreviewURL } from '@/app/ai/attachment/image/prepare'
import { MAX_IMAGE_ATTACHMENTS } from '@/app/ai/attachment/image/types'
import { selectionAskPending, takeSelectionAsk } from '@/app/ai/chat/ask-selection'
import type { ChatSubmission } from '@/app/ai/chat/submission/types'
import { useAIChat } from '@/app/ai/chat/use'
import { runAgentName } from '@/app/ai/tools/run'
import { useInstructionCatalog } from '@/app/document/instructions/catalog'
import { useEditorStore } from '@/app/editor/active-store'
import { localAgentColor } from '@/app/presence/registry'
import { openSettings } from '@/app/settings/open'
import ChatNodePreview from '@/components/chat/ChatNodePreview.vue'
import ChatProfileSelect from '@/components/chat/ChatProfileSelect.vue'
import ChatThinkingSelect from '@/components/chat/ChatThinkingSelect.vue'
import { useAttachmentDrafts } from '@/components/chat/input/useAttachments'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppDropOverlay from '@/components/ui/feedback/AppDropOverlay.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import { chatComposerTheme } from '@/theme/chat/composer'

import ChatComposer from './ChatComposer.vue'

const { providerID } = useAIChat()
const { editor, selectedIds } = useSelectionState()
const store = useEditorStore()
const { ai } = useI18n()

const {
  status,
  disabled = false,
  dragging = false
} = defineProps<{
  status: 'ready' | 'submitted' | 'streaming' | 'error'
  disabled?: boolean
  /** Whether images are being dragged over the chat, which shows where they will go. */
  dragging?: boolean
}>()

const emit = defineEmits<{
  submit: [submission: ChatSubmission]
  stop: []
  error: [message: string]
}>()

const attachments = useAttachmentDrafts({
  editor,
  selectedIds,
  reportError: (message) => emit('error', message)
})
const {
  images,
  nodes: referencedNodes,
  canToggleSelection: canAddSelection,
  selectionActive: selectionContextActive,
  openImageDialog,
  addFiles,
  removeImage,
  removeNode: removeReferencedNode,
  toggleSelection: toggleCurrentSelection,
  handlePaste,
  takeSubmission,
  restoreSubmission
} = attachments

// What the folder's instructions offer after a slash and an at sign.
const { catalog, refresh: refreshCatalog } = useInstructionCatalog(() => store)

const composer = useTemplateRef<{ restoreDraft: (text: string) => boolean; focus: () => void }>(
  'composer'
)

// Asking about the selection from the canvas attaches it, once, and puts the caret in the field.
watch(
  selectionAskPending(),
  async (pending) => {
    if (!pending) return
    await nextTick()
    if (!takeSelectionAsk()) return
    if (canAddSelection.value && !selectionContextActive.value) toggleCurrentSelection()
    composer.value?.focus()
  },
  { immediate: true }
)

/** Puts back an unsent message with its attachments; releases them if newer text replaced it. */
function restoreDraft(submission: ChatSubmission): void {
  if (composer.value?.restoreDraft(submission.displayText)) restoreSubmission(submission)
  else for (const image of submission.images) revokeImagePreviewURL(image.previewURL)
}

const isStreaming = computed(() => disabled || status === 'streaming' || status === 'submitted')

/** Why images dropped now would not be attached, or null when they would. */
const dropRefusal = computed(() => {
  if (isStreaming.value) return ai.value.dropImagesAfterReply
  if (images.value.length >= MAX_IMAGE_ATTACHMENTS) {
    return ai.value.dropImagesLimit({ count: MAX_IMAGE_ATTACHMENTS })
  }
  return null
})

/** Attaches images dropped on the chat, unless they cannot be attached right now. */
function dropFiles(files: File[]): void {
  if (dropRefusal.value) {
    emit('error', dropRefusal.value)
    return
  }
  void addFiles(files)
}

defineExpose({ restoreDraft, dropFiles })

const isAgentProvider = computed(
  () => providerID.value.startsWith('acp:') || providerID.value === 'harness:pi'
)

const pageName = computed(() => editor.graph.getNode(editor.state.currentPageId)?.name ?? '')
// The creature the sky shows for this conversation, so the agent looks the same in both places.
const creatureSeed = computed(() => runAgentName(store) ?? ai.value.designAgent)
const creatureColor = computed(() => colorToCSS(localAgentColor(store)))
const ui = chatComposerTheme()
</script>

<template>
  <ChatComposer
    ref="composer"
    :status="status"
    :disabled="disabled"
    :catalog="catalog"
    @suggest="refreshCatalog"
    @submit="emit('submit', takeSubmission($event))"
    @stop="emit('stop')"
    @paste="handlePaste"
    @settings="openSettings('ai')"
  >
    <template #about>
      <div :class="ui.about()" data-slot="chat-about">
        <span :class="ui.aboutLabel()">{{ ai.aboutLabel }}</span>
        <span :class="ui.aboutChips()">
          <span v-if="referencedNodes.length === 0" :class="ui.aboutChip()">
            <icon-hugeicons-file-02 :class="ui.aboutChipIcon()" aria-hidden="true" />
            <span :class="ui.aboutChipLabel()">{{ ai.aboutWholePage({ page: pageName }) }}</span>
          </span>
          <span
            v-for="node in referencedNodes"
            :key="node.id"
            :class="ui.aboutChip()"
            data-slot="chat-context-chip"
          >
            <ChatNodePreview :editor="editor" :node="node" size="sm" />
            <span :class="ui.aboutChipLabel()">{{ node.name || node.type }}</span>
            <button
              type="button"
              :class="ui.aboutRemove()"
              :aria-label="ai.removeNodeContext"
              @click="removeReferencedNode(node.id)"
            >
              <icon-hugeicons-x :class="ui.aboutRemoveIcon()" aria-hidden="true" />
            </button>
          </span>
        </span>
        <Tip as-child :label="ai.addSelectionContext">
          <button
            type="button"
            :class="ui.point()"
            :aria-label="ai.pointOnCanvas"
            :disabled="isStreaming || !canAddSelection"
            :aria-pressed="selectionContextActive"
            :data-state="selectionContextActive ? 'on' : 'off'"
            data-slot="chat-add-selection-context"
            @click="toggleCurrentSelection"
          >
            <icon-hugeicons-cursor-02 :class="ui.pointIcon()" aria-hidden="true" />
            <span :class="ui.pointLabel()">{{ ai.pointOnCanvas }}</span>
          </button>
        </Tip>
      </div>
    </template>
    <template v-if="images.length" #attachment>
      <div class="flex flex-wrap gap-1.5">
        <div
          v-for="(image, index) in images"
          :key="image.previewURL"
          class="flex min-w-0 max-w-full items-center gap-2 rounded-[10px] border border-hairline bg-group p-1.5"
        >
          <img
            :src="image.previewURL"
            :alt="image.file.name"
            width="40"
            height="40"
            class="size-10 shrink-0 rounded-md border border-border object-cover"
          />
          <span class="min-w-0 flex-1 truncate text-[10px] text-surface">
            {{ image.file.name }}
          </span>
          <IconButton
            :label="ai.removeImageAttachment({ name: image.file.name })"
            size="xs"
            @click="removeImage(index)"
          >
            <icon-hugeicons-x class="size-3" />
          </IconButton>
        </div>
      </div>
    </template>
    <template #overlay>
      <AppDropOverlay
        shape="field"
        :visible="dragging"
        :accepts="!dropRefusal"
        :label="dropRefusal ?? ai.dropImagesToAttach"
      />
    </template>
    <template #leading>
      <IconButton
        :label="ai.attachImages"
        size="sm"
        :disabled="isStreaming || images.length >= MAX_IMAGE_ATTACHMENTS"
        @click="openImageDialog()"
      >
        <icon-hugeicons-image-plus class="size-4" />
      </IconButton>
    </template>
    <template #model>
      <div class="@container flex min-w-0 items-center">
        <ChatProfileSelect :seed="creatureSeed" :color="creatureColor" />
        <ChatThinkingSelect v-if="!isAgentProvider" />
      </div>
    </template>
  </ChatComposer>
</template>
