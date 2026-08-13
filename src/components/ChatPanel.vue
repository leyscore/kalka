<script setup lang="ts">
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from 'reka-ui'
import { refAutoReset, useClipboard } from '@vueuse/core'
import { computed, markRaw, nextTick, ref, watch } from 'vue'

import { getACPDebugText, clearACPDebugLog, hasACPDebugEntries } from '@/app/ai/acp/transport'
import { copyChatLog } from '@/app/ai/debug'
import {
  analyzeReferenceImage,
  designMessageWithReferenceFindings
} from '@/app/ai/reference-image/analyze'
import { isReferenceImageMediaType, prepareReferenceImage } from '@/app/ai/reference-image/prepare'
import {
  addReferenceImagePresentation,
  clearReferenceImagePresentations
} from '@/app/ai/reference-image/presentation'
import type { ReferenceImageDraft } from '@/app/ai/reference-image/types'
import { clearToolLogEntries, didHitStepLimit } from '@/app/ai/tools'
import { activeTab } from '@/app/tabs'
import { getActiveEditorStore } from '@/app/editor/active-store'
import ACPPermissionDialog from '@/components/chat/ACPPermissionDialog.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import AppPlaceholder from '@/components/ui/AppPlaceholder.vue'
import AppTextButton from '@/components/ui/AppTextButton.vue'
import ProviderSetup from '@/components/chat/ProviderSetup.vue'
import { useAIChat } from '@/app/ai/chat/use'
import { toast } from '@/app/shell/ui'
import { useI18n } from '@open-pencil/vue'

import type { Chat } from '@ai-sdk/vue'
import type { UIMessage } from 'ai'
import type { JSONObject } from '@open-pencil/scene-graph/primitives'

const IS_DEV = import.meta.env.DEV

const { isConfigured, ensureChat, resetChat, chatFailure, clearChatFailure } = useAIChat()
const { copy } = useClipboard()
const { dialogs } = useI18n()

const chat = ref<Chat<UIMessage> | null>(null)

void ensureChat()
  .then((c) => {
    if (c) chat.value = markRaw(c)
    return undefined
  })
  .catch((error: unknown) => {
    toast.error(error instanceof Error ? error.message : 'Failed to initialize chat')
  })
const messagesEnd = ref<HTMLDivElement>()
const debugCopied = refAutoReset(false, 1500)
const acpLogCopied = refAutoReset(false, 1500)

const messages = computed(() => chat.value?.messages ?? [])
const failureMessage = computed(() => {
  switch (chatFailure.value?.reason) {
    case 'insufficient-credit':
      return dialogs.value.chatInsufficientCredit
    case 'output-limit':
      return dialogs.value.chatOutputLimit
    case 'request-failed':
      return dialogs.value.chatRequestFailed
    default:
      return null
  }
})
const status = computed(() => chat.value?.status ?? 'ready')
const isThinking = computed(() => {
  const s = status.value
  if (s !== 'submitted' && s !== 'streaming') return false
  if (messages.value.length === 0) return true
  const last = messages.value[messages.value.length - 1]
  if (last.role !== 'assistant') return true
  const parts = last.parts
  if (parts.length === 0) return true
  const lastPart = parts[parts.length - 1] as JSONObject
  if (lastPart.type === 'step-start') return true
  if ('toolCallId' in lastPart && lastPart.state === 'output-available') return true
  if ('toolCallId' in lastPart && lastPart.state === 'output-error') return true
  return s === 'submitted'
})

const showContinue = computed(() => {
  if (status.value !== 'ready') return false
  if (messages.value.length === 0) return false
  const last = messages.value[messages.value.length - 1]
  return last.role === 'assistant' && didHitStepLimit()
})

function scrollToBottom() {
  nextTick(() => {
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })
}

watch(messages, scrollToBottom, { deep: true })
watch(
  () => chatFailure.value?.reason,
  (reason) => {
    if (!reason) return
    toast.error(failureMessage.value ?? dialogs.value.chatRequestFailed)
  }
)
watch(
  () => activeTab.value?.id,
  async () => {
    clearReferenceImagePresentations()
    const nextChat = await ensureChat()
    chat.value = nextChat ? markRaw(nextChat) : null
  }
)

async function handleSubmit(text: string, reference: ReferenceImageDraft | null = null) {
  if (status.value === 'streaming' || status.value === 'submitted') {
    if (reference) URL.revokeObjectURL(reference.previewURL)
    return
  }
  clearChatFailure()
  try {
    const c = await ensureChat()
    if (c) chat.value = markRaw(c)
    if (!chat.value) {
      if (reference) {
        URL.revokeObjectURL(reference.previewURL)
        toast.error('Chat is unavailable. The reference image was not sent.')
      }
      return
    }

    if (!reference) {
      await chat.value.sendMessage({ text })
      return
    }

    const prepared = await prepareReferenceImage(reference.file)
    const findings = await analyzeReferenceImage(getActiveEditorStore(), text, prepared)
    const previewURL = URL.createObjectURL(prepared.blob)
    URL.revokeObjectURL(reference.previewURL)
    const sendPromise = chat.value.sendMessage({
      text: designMessageWithReferenceFindings(text, reference.file.name, findings)
    })
    const messageId = chat.value.lastMessage?.id
    if (!messageId || chat.value.lastMessage?.role !== 'user') {
      URL.revokeObjectURL(previewURL)
      throw new Error('Could not attach the reference preview to the chat message.')
    }
    addReferenceImagePresentation({
      id: crypto.randomUUID(),
      messageId,
      name: reference.file.name,
      mediaType: isReferenceImageMediaType(reference.file.type)
        ? reference.file.type
        : prepared.mediaType,
      originalWidth: prepared.originalWidth,
      originalHeight: prepared.originalHeight,
      previewWidth: prepared.width,
      previewHeight: prepared.height,
      previewURL,
      displayText: text
    })
    await sendPromise
  } catch (e) {
    if (reference) URL.revokeObjectURL(reference.previewURL)
    console.error('Chat error:', e)
    toast.error(e instanceof Error ? e.message : String(e))
  }
}

function handleStop() {
  chat.value?.stop()
}

async function handleCopyDebug() {
  await copyChatLog(messages.value, chatFailure.value)
  debugCopied.value = true
}

async function handleCopyACPLog() {
  const text = getACPDebugText()
  if (!text) return
  await copy(text)
  acpLogCopied.value = true
}

function handleClearChat() {
  clearChatFailure()
  clearReferenceImagePresentations()
  chat.value = null
  resetChat()
  clearToolLogEntries()
  clearACPDebugLog()
}
</script>

<template>
  <div data-test-id="chat-panel" class="flex min-w-0 flex-1 flex-col overflow-hidden select-text">
    <ProviderSetup v-if="!isConfigured" />

    <template v-else>
      <ScrollAreaRoot class="min-h-0 flex-1">
        <ScrollAreaViewport class="h-full px-3 py-3 [&>div]:h-full">
          <AppPlaceholder
            v-if="messages.length === 0"
            data-test-id="chat-empty-state"
            :label="dialogs.describeCreateOrChange"
            :ui="{ root: 'h-full' }"
          >
            <template #icon>
              <icon-lucide-message-circle class="size-5" />
            </template>
          </AppPlaceholder>

          <!-- Messages -->
          <div v-else data-test-id="chat-messages" class="flex flex-col gap-3">
            <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />

            <!-- Thinking indicator: shown when AI is working but no visible activity -->
            <div v-if="isThinking" data-test-id="chat-typing-indicator" class="flex gap-2">
              <div
                class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/20 text-[10px] font-bold text-muted"
              >
                AI
              </div>
              <div class="flex items-center gap-1 py-2">
                <span
                  class="size-1.5 animate-bounce rounded-full bg-muted"
                  style="animation-delay: 0ms"
                />
                <span
                  class="size-1.5 animate-bounce rounded-full bg-muted"
                  style="animation-delay: 150ms"
                />
                <span
                  class="size-1.5 animate-bounce rounded-full bg-muted"
                  style="animation-delay: 300ms"
                />
              </div>
            </div>

            <!-- Continue button when step limit reached -->
            <div v-if="showContinue" class="flex justify-center py-2">
              <button
                class="flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                @click="handleSubmit('Continue where you left off')"
              >
                <icon-lucide-play class="size-3" />
                Continue
              </button>
            </div>

            <div ref="messagesEnd" />
          </div>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical" class="flex w-1.5 touch-none p-px select-none">
          <ScrollAreaThumb class="relative flex-1 rounded-full bg-muted/30" />
        </ScrollAreaScrollbar>
      </ScrollAreaRoot>

      <!-- Chat toolbar -->
      <div
        v-if="messages.length > 0"
        class="flex shrink-0 items-center gap-1 border-t border-border px-3 py-1"
      >
        <AppTextButton
          v-if="IS_DEV"
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover' }"
          @click="handleCopyDebug"
        >
          <icon-lucide-clipboard-copy v-if="!debugCopied" class="size-3" />
          <icon-lucide-check v-else class="size-3 text-green-400" />
          {{ debugCopied ? 'Copied' : 'Copy log' }}
        </AppTextButton>
        <AppTextButton
          v-if="IS_DEV && hasACPDebugEntries()"
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover' }"
          @click="handleCopyACPLog"
        >
          <icon-lucide-bug v-if="!acpLogCopied" class="size-3" />
          <icon-lucide-check v-else class="size-3 text-green-400" />
          {{ acpLogCopied ? 'Copied' : 'ACP log' }}
        </AppTextButton>
        <AppTextButton
          :ui="{ base: 'flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover' }"
          @click="handleClearChat"
        >
          <icon-lucide-trash-2 class="size-3" />
          Clear
        </AppTextButton>
      </div>

      <ChatInput :status="status" @submit="handleSubmit" @stop="handleStop" @error="toast.error" />

      <ACPPermissionDialog />
    </template>
  </div>
</template>
