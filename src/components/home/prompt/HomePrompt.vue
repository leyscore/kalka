<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { isConfigured } from '@/app/ai/chat/storage'
import { openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import { startWithPrompt } from '@/app/home/start'
import { homePrompt } from '@/theme/home/start'

/**
 * Asks the AI agent for a page: Generate opens a new document with the prompt sent to its chat.
 * Without a model it says so before anything is typed: the button connects one, and a prompt
 * typed anyway stays here while AI setup opens.
 */
const { welcome } = useI18n()
const prompt = ref('')
const input = useTemplateRef<HTMLInputElement>('input')
const styles = homePrompt()

function generate(): void {
  if (!isConfigured.value) {
    openAISetup('connect')
    return
  }
  if (!prompt.value.trim()) {
    input.value?.focus()
    return
  }
  if (startWithPrompt(prompt.value) === 'started') prompt.value = ''
}
</script>

<template>
  <form :class="styles.root()" @submit.prevent="generate">
    <icon-hugeicons-sparkle :class="styles.icon()" aria-hidden="true" />
    <input
      ref="input"
      v-model="prompt"
      type="text"
      name="design-prompt"
      autocomplete="off"
      :aria-label="welcome.promptLabel"
      :placeholder="isConfigured ? welcome.promptPlaceholder : welcome.promptPlaceholderSetup"
      :class="styles.input()"
    />
    <button type="submit" :class="styles.submit()">
      {{ isConfigured ? welcome.promptSubmit : welcome.promptConnect }}
    </button>
  </form>
</template>
