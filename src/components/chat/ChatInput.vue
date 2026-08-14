<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'
import { TooltipProvider } from 'reka-ui'
import { computed, onBeforeUnmount, ref } from 'vue'

import ChatProfileSelect from '@/components/chat/ChatProfileSelect.vue'
import ProviderModelSelect from '@/components/chat/ProviderModelSelect.vue'
import IconButton from '@/components/ui/IconButton.vue'
import InputGroup from '@/components/ui/InputGroup.vue'
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

function handleInputKeydown(event: KeyboardEvent) {
  if (event.code !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  const target = event.currentTarget
  if (target instanceof HTMLElement) target.closest('form')?.requestSubmit()
}

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
    <div class="shrink-0 border-t border-border p-2.5">
      <form @submit="handleSubmit" @paste.stop="handlePaste">
        <InputGroup :disabled="isStreaming">
          <template v-if="reference" #attachment>
            <div class="flex items-center gap-2 rounded-lg bg-canvas p-1.5">
              <img
                :src="reference.previewURL"
                alt="Reference image"
                width="40"
                height="40"
                class="size-10 rounded object-cover"
              />
              <span class="min-w-0 flex-1 truncate text-[10px] text-surface">
                {{ reference.file.name }}
              </span>
              <IconButton label="Remove reference image" size="xs" @click="clearReference">
                <icon-lucide-x class="size-3" />
              </IconButton>
            </div>
          </template>

          <textarea
            v-model="input"
            data-test-id="chat-input"
            :placeholder="dialogs.describeChange"
            :disabled="isStreaming"
            rows="2"
            aria-label="Describe a change"
            class="block min-h-12 w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-xs leading-relaxed text-surface outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
            @keydown="handleInputKeydown"
            @copy.stop
            @cut.stop
          />

          <template #leading>
            <IconButton
              label="Attach reference image"
              size="sm"
              :disabled="isStreaming"
              @click="openReferenceDialog()"
            >
              <icon-lucide-image-plus class="size-4" />
            </IconButton>
          </template>

          <template #model>
            <div class="flex min-w-0 items-center">
              <template v-if="isACPProvider">
                <div class="flex min-w-0 items-center gap-1 px-1.5 text-[10px] text-muted">
                  <icon-lucide-bot class="size-3 shrink-0" />
                  <span class="truncate">{{ acpAgentName }}</span>
                </div>
              </template>
              <ChatProfileSelect
                v-else-if="canSwitchProfile && (isCustomProvider || usesCustomModel)"
              >
                <template #value>
                  <span class="min-w-0 truncate">{{ selectedProfileName }}</span>
                </template>
              </ChatProfileSelect>
              <div
                v-else-if="isCustomProvider || usesCustomModel"
                class="flex min-w-0 items-center gap-1 px-1.5 text-[10px] text-muted"
                data-test-id="chat-custom-model-label"
              >
                <icon-lucide-bot class="size-3 shrink-0" />
                <span class="truncate">{{ selectedModelName }}</span>
              </div>
              <ProviderModelSelect v-else>
                <template #value>
                  <span class="min-w-0 truncate">{{ selectedModelName }}</span>
                </template>
              </ProviderModelSelect>
            </div>
          </template>

          <template #actions>
            <IconButton
              :label="dialogs.providerSettings"
              size="sm"
              data-test-id="provider-settings-trigger"
              @click="openSettingsDialog('ai')"
            >
              <icon-lucide-settings class="size-3.5" />
            </IconButton>
            <IconButton
              v-if="isStreaming"
              :label="dialogs.stopGenerating"
              size="sm"
              data-test-id="chat-stop-button"
              class="border border-border"
              @click="emit('stop')"
            >
              <icon-lucide-square class="size-3" />
            </IconButton>
            <IconButton
              v-else
              :label="dialogs.sendMessage"
              size="sm"
              type="submit"
              data-test-id="chat-send-button"
              class="bg-accent text-white hover:bg-accent/90 hover:text-white"
              :disabled="!input.trim()"
            >
              <icon-lucide-send class="size-3.5" />
            </IconButton>
          </template>
        </InputGroup>
      </form>
    </div>
  </TooltipProvider>
</template>
