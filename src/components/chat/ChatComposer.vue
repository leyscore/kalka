<script setup lang="ts">
import { useTextareaAutosize } from '@vueuse/core'
import type { ChatStatus } from 'ai'
import { TooltipProvider } from 'reka-ui'
import { computed, nextTick, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import {
  matchSuggestions,
  suggestionAt,
  type InstructionCatalog,
  type SuggestionQuery
} from '@/app/document/instructions/invoke'
import IconButton from '@/components/ui/button/IconButton.vue'
import InputGroup from '@/components/ui/input/InputGroup.vue'
import { chatComposerTheme } from '@/theme/chat/composer'
import { chatSuggest } from '@/theme/chat/suggest'

const MAX_SUGGESTIONS = 8
const {
  status,
  disabled = false,
  catalog
} = defineProps<{
  status: ChatStatus
  disabled?: boolean
  /** The skills offered after a slash and the documents offered after an at sign. */
  catalog?: InstructionCatalog
}>()
const emit = defineEmits<{
  submit: [text: string]
  stop: []
  settings: []
  paste: [event: ClipboardEvent]
  /** A slash or an at sign was just typed: the catalog is about to be shown. */
  suggest: []
}>()
const { ai } = useI18n()
const textarea = ref<HTMLTextAreaElement>()
const input = ref('')
const { triggerResize } = useTextareaAutosize({ element: textarea, input, maxHeight: 160 })
const isStreaming = computed(() => disabled || status === 'streaming' || status === 'submitted')
const suggest = chatSuggest()
const ui = chatComposerTheme()
const pending = ref<SuggestionQuery | null>(null)
const activeIndex = ref(0)
const suggestions = computed(() => {
  const query = pending.value
  if (!query) return []
  const names = (query.kind === 'skill' ? catalog?.skills : catalog?.documents) ?? []
  return matchSuggestions(names, query.query).slice(0, MAX_SUGGESTIONS)
})

/** Reads the word the caret is in after each edit or move of the caret. */
function trackSuggestion(): void {
  const element = textarea.value
  const next = element ? suggestionAt(input.value, element.selectionStart) : null
  if (next && !pending.value) emit('suggest')
  if (next?.query !== pending.value?.query) activeIndex.value = 0
  pending.value = next
}

/** Writes the chosen name in place of what was typed, with a space to go on from. */
function accept(name: string): void {
  const query = pending.value
  const element = textarea.value
  if (!query || !element) return
  const sign = query.kind === 'skill' ? '/' : '@'
  const end = element.selectionStart
  const inserted = `${sign}${name} `
  input.value = input.value.slice(0, query.start) + inserted + input.value.slice(end)
  pending.value = null
  void nextTick(() => {
    const caret = query.start + inserted.length
    element.focus()
    element.setSelectionRange(caret, caret)
    triggerResize()
  })
}

/** While the list shows, the arrows move in it and Enter or Tab takes the highlighted name. */
function handleSuggestionKey(event: KeyboardEvent): boolean {
  const count = suggestions.value.length
  if (count === 0 || event.isComposing) return false
  if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
    const step = event.code === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + step + count) % count
  } else if (event.code === 'Enter' || event.code === 'Tab') {
    const name = suggestions.value[activeIndex.value]
    if (name) accept(name)
  } else if (event.code === 'Escape') {
    pending.value = null
  } else {
    return false
  }
  event.preventDefault()
  event.stopPropagation()
  return true
}

function handleInputKeydown(event: KeyboardEvent) {
  if (handleSuggestionKey(event)) return
  if (event.code !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  const target = event.currentTarget
  if (target instanceof HTMLElement) target.closest('form')?.requestSubmit()
}
function handleSubmit(event: Event) {
  event.preventDefault()
  if (isStreaming.value) return
  const text = input.value.trim()
  if (!text) return
  emit('submit', text)
  input.value = ''
  pending.value = null
  triggerResize()
}
/**
 * Puts back a message that could not be sent, unless something new was typed meanwhile.
 * Returns whether it did.
 */
function restoreDraft(text: string): boolean {
  if (input.value.trim()) return false
  input.value = text
  triggerResize()
  return true
}
defineExpose({ restoreDraft, focus: () => textarea.value?.focus() })
</script>
<template>
  <TooltipProvider>
    <div class="shrink-0 border-t border-border p-2.5">
      <form class="relative" @submit="handleSubmit" @paste.stop="emit('paste', $event)">
        <ul
          v-if="pending && suggestions.length"
          id="chat-suggestions"
          role="listbox"
          :aria-label="pending.kind === 'skill' ? ai.suggestSkills : ai.suggestDocuments"
          data-test-id="chat-suggestions"
          :class="suggest.root()"
        >
          <li :class="suggest.heading()" role="presentation">
            {{ pending.kind === 'skill' ? ai.suggestSkills : ai.suggestDocuments }}
          </li>
          <li
            v-for="(name, index) in suggestions"
            :id="`chat-suggestion-${index}`"
            :key="name"
            role="option"
            :aria-selected="index === activeIndex"
            :data-active="index === activeIndex || undefined"
            :class="suggest.option()"
            @mousedown.prevent="accept(name)"
            @mousemove="activeIndex = index"
          >
            <span :class="suggest.sign()" aria-hidden="true">
              {{ pending.kind === 'skill' ? '/' : '@' }}
            </span>
            <span :class="suggest.name()">{{ name }}</span>
          </li>
        </ul>
        <InputGroup :disabled="isStreaming">
          <template v-if="$slots.about" #header><slot name="about" /></template>
          <template v-if="$slots.attachment" #attachment><slot name="attachment" /></template>

          <textarea
            ref="textarea"
            v-model="input"
            data-test-id="chat-input"
            :placeholder="ai.describeChange"
            :disabled="isStreaming"
            rows="2"
            :aria-label="ai.describeChange"
            class="block min-h-12 w-full resize-none overflow-y-auto bg-transparent px-3 pt-2.5 pb-1 text-xs leading-relaxed text-surface outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
            :aria-controls="suggestions.length ? 'chat-suggestions' : undefined"
            :aria-activedescendant="
              pending && suggestions.length ? `chat-suggestion-${activeIndex}` : undefined
            "
            @keydown="handleInputKeydown"
            @input="trackSuggestion"
            @keyup="trackSuggestion"
            @click="trackSuggestion"
            @blur="pending = null"
            @copy.stop
            @cut.stop
          />

          <template #leading><slot name="leading" /></template>

          <template #model><slot name="model" /></template>

          <template #actions>
            <IconButton
              :label="ai.providerSettings"
              size="sm"
              data-test-id="provider-settings-trigger"
              @click="emit('settings')"
            >
              <icon-hugeicons-settings-01 class="size-3.5" />
            </IconButton>
            <IconButton
              v-if="isStreaming"
              :label="ai.stopGenerating"
              size="sm"
              data-test-id="chat-stop-button"
              :class="ui.stop()"
              @click="emit('stop')"
            >
              <span :class="ui.stopMark()" />
            </IconButton>
            <IconButton
              v-else
              :label="ai.sendMessage"
              size="sm"
              type="submit"
              data-test-id="chat-send-button"
              :class="ui.send()"
              :disabled="!input.trim()"
            >
              <icon-hugeicons-arrow-up-02 class="size-3.5" />
            </IconButton>
          </template>
        </InputGroup>
        <!-- Over the input while files are dragged onto the chat. -->
        <slot name="overlay" />
      </form>
    </div>
  </TooltipProvider>
</template>
