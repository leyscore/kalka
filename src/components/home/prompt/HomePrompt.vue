<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import { startWithPrompt } from '@/app/home/start'
import { homePrompt } from '@/theme/home/start'

/**
 * Asks the AI agent for a page: Generate opens a new document with the prompt sent to its chat.
 * Without a model the prompt stays here and AI setup opens instead.
 */
const { welcome } = useI18n()
const prompt = ref('')
const input = useTemplateRef<HTMLInputElement>('input')
const styles = homePrompt()

function generate(): void {
  if (!prompt.value.trim()) {
    input.value?.focus()
    return
  }
  if (startWithPrompt(prompt.value) === 'needs-setup') {
    openAISetup()
    return
  }
  prompt.value = ''
}
</script>

<template>
  <form :class="styles.root()" data-test-id="home-prompt" @submit.prevent="generate">
    <icon-lucide-sparkle :class="styles.icon()" aria-hidden="true" />
    <input
      ref="input"
      v-model="prompt"
      type="text"
      name="design-prompt"
      autocomplete="off"
      data-test-id="home-prompt-input"
      :aria-label="welcome.promptLabel"
      :placeholder="welcome.promptPlaceholder"
      :class="styles.input()"
    />
    <button type="submit" data-test-id="home-prompt-submit" :class="styles.submit()">
      {{ welcome.promptSubmit }}
    </button>
  </form>
</template>
