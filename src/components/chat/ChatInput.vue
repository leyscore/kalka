<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { TooltipProvider } from 'reka-ui'
import { computed, onBeforeUnmount, ref } from 'vue'

import ChatProfileSelect from '@/components/chat/ChatProfileSelect.vue'
import ProviderModelSelect from '@/components/chat/ProviderModelSelect.vue'
import AppInput from '@/components/ui/AppInput.vue'
import Tip from '@/components/ui/Tip.vue'
import { useButtonUI } from '@/components/ui/button'
import { useAIChat } from '@/app/ai/chat/use'
import { designModelProfile, designModelProfiles } from '@/app/ai/models'
import { validateReferenceImageFile } from '@/app/ai/reference-image/prepare'
import type { ReferenceImageDraft } from '@/app/ai/reference-image/types'
import { openSettingsDialog } from '@/app/settings/dialog'
import { useI18n } from '@open-pencil/vue'

import { ACP_AGENTS } from '@open-pencil/core/constants'

const { providerID, providerDef, modelID, customModelID } = useAIChat()
const { dialogs } = useI18n()

const { status } = defineProps<{
  status: 'ready' | 'submitted' | 'streaming' | 'error'
}>()

const emit = defineEmits<{
  submit: [text: string, reference: ReferenceImageDraft | null]
  stop: []
  error: [message: string]
}>()

const input = ref('')
const reference = ref<ReferenceImageDraft | null>(null)
const {
  open: openReferenceDialog,
  reset: resetReferenceDialog,
  onChange: onReferenceChange
} = useFileDialog({
  accept: 'image/png,image/jpeg,image/webp',
  multiple: false,
  reset: true
})

function setReferenceFile(file: File) {
  const validationError = validateReferenceImageFile(file)
  if (validationError) {
    emit('error', validationError)
    resetReferenceDialog()
    return
  }
  clearReference()
  reference.value = { file, previewURL: URL.createObjectURL(file) }
}

const isStreaming = computed(() => status === 'streaming' || status === 'submitted')
const isACPProvider = computed(() => providerID.value.startsWith('acp:'))
const acpAgentName = computed(() => {
  const agentId = providerID.value.replace('acp:', '')
  return ACP_AGENTS.find((a) => a.id === agentId)?.name ?? agentId
})
const isCustomProvider = computed(
  () => providerID.value === 'openai-compatible' || providerID.value === 'anthropic-compatible'
)
const stopButton = useButtonUI({
  tone: 'ghost',
  shape: 'rounded',
  size: 'sm',
  ui: { base: 'shrink-0 border border-border px-2 py-1.5' }
})
const sendButton = useButtonUI({
  tone: 'accent',
  shape: 'rounded',
  size: 'sm',
  ui: { base: 'shrink-0 px-2.5 py-1.5 font-medium' }
})
const customModelName = computed(() => customModelID.value.trim())
const usesCustomModel = computed(
  () => !!providerDef.value.supportsCustomModel && !!customModelName.value
)

const selectedModelName = computed(() => {
  if (usesCustomModel.value) return customModelName.value
  if (isCustomProvider.value) return 'No model'
  return providerDef.value.models.find((m) => m.id === modelID.value)?.name ?? modelID.value
})

// Switching between saved profiles only makes sense once more than one can drive the design agent.
const switchableProfiles = computed(designModelProfiles)
const canSwitchProfile = computed(() => switchableProfiles.value.length > 1)
const selectedProfileName = computed(
  () => designModelProfile.value?.name ?? selectedModelName.value
)

function clearReference() {
  if (reference.value) URL.revokeObjectURL(reference.value.previewURL)
  reference.value = null
  resetReferenceDialog()
}

onReferenceChange((selectedFiles) => {
  const file = selectedFiles?.[0]
  if (file) setReferenceFile(file)
})

function handlePaste(event: ClipboardEvent) {
  const files = event.clipboardData?.files
  const image = files ? [...files].find((file) => file.type.startsWith('image/')) : undefined
  if (!image) return
  event.preventDefault()
  setReferenceFile(image)
}

onBeforeUnmount(clearReference)

function handleSubmit(e: Event) {
  e.preventDefault()
  const text = input.value.trim()
  if (!text) return
  const submittedReference = reference.value
  reference.value = null
  resetReferenceDialog()
  emit('submit', text, submittedReference)
  input.value = ''
}
</script>

<template>
  <TooltipProvider>
    <div class="shrink-0 border-t border-border px-3 py-2">
      <!-- Model selector & settings -->
      <div class="mb-1.5 flex items-center gap-1">
        <template v-if="isACPProvider">
          <div class="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-muted">
            <icon-lucide-bot class="size-3" />
            {{ acpAgentName }}
          </div>
        </template>
        <ChatProfileSelect v-else-if="canSwitchProfile && (isCustomProvider || usesCustomModel)">
          <template #value>
            <span class="min-w-0 truncate">{{ selectedProfileName }}</span>
          </template>
        </ChatProfileSelect>
        <template v-else-if="isCustomProvider || usesCustomModel">
          <div
            class="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-muted"
            data-test-id="chat-custom-model-label"
          >
            <icon-lucide-bot class="size-3" />
            {{ selectedModelName }}
          </div>
        </template>
        <ProviderModelSelect v-else>
          <template #value>{{ selectedModelName }}</template>
        </ProviderModelSelect>

        <div class="ml-auto">
          <Tip :label="dialogs.providerSettings">
            <button
              type="button"
              data-test-id="provider-settings-trigger"
              :aria-label="dialogs.providerSettings"
              class="rounded p-0.5 text-muted hover:bg-hover hover:text-surface"
              @click="openSettingsDialog('ai')"
            >
              <icon-lucide-settings class="size-3" />
            </button>
          </Tip>
        </div>
      </div>

      <!-- Input form -->
      <div
        v-if="reference"
        class="mb-2 flex items-center gap-2 rounded-lg border border-border bg-canvas p-1.5"
      >
        <img
          :src="reference.previewURL"
          alt="Reference image"
          class="size-10 rounded object-cover"
        />
        <span class="min-w-0 flex-1 truncate text-[10px] text-surface">
          {{ reference.file.name }}
        </span>
        <Tip label="Remove reference image">
          <button
            type="button"
            aria-label="Remove reference image"
            class="rounded p-1 text-muted hover:bg-hover hover:text-surface"
            @click="clearReference"
          >
            <icon-lucide-x class="size-3" />
          </button>
        </Tip>
      </div>
      <form class="flex gap-1.5" @submit="handleSubmit" @paste.stop="handlePaste">
        <Tip label="Attach reference image">
          <button
            type="button"
            aria-label="Attach reference image"
            class="shrink-0 rounded p-1.5 text-muted hover:bg-hover hover:text-surface"
            :disabled="isStreaming"
            @click="openReferenceDialog()"
          >
            <icon-lucide-image-plus class="size-4" />
          </button>
        </Tip>
        <AppInput
          v-model="input"
          data-test-id="chat-input"
          :placeholder="dialogs.describeChange"
          class="min-w-0 flex-1 placeholder:text-muted"
          :disabled="isStreaming"
          @copy.stop
          @cut.stop
        />
        <Tip v-if="isStreaming" :label="dialogs.stopGenerating">
          <button
            type="button"
            data-test-id="chat-stop-button"
            :class="stopButton.base"
            @click="emit('stop')"
          >
            <icon-lucide-square class="size-3" />
          </button>
        </Tip>
        <Tip v-else :label="dialogs.sendMessage">
          <button
            type="submit"
            data-test-id="chat-send-button"
            :class="sendButton.base"
            :disabled="!input.trim()"
          >
            <icon-lucide-send class="size-3" />
          </button>
        </Tip>
      </form>
    </div>
  </TooltipProvider>
</template>
