<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { startWithSample } from '@/app/home/start'
import { startTour } from '@/app/onboarding/tour'
import { openWelcome } from '@/app/onboarding/welcome'
import { sampleTile } from '@/theme/home/start'

/**
 * The sample file among the recent files: its name opens it, and its blue tile lists the first
 * steps to take on it (the tour, the code of every layer, an AI agent).
 */
const { welcome } = useI18n()
const { activeTab: panelTab } = useAIChat()

async function takeTour(): Promise<void> {
  await startWithSample()
  startTour()
}

async function seeCode(): Promise<void> {
  await startWithSample()
  panelTab.value = 'code'
}
</script>

<template>
  <div data-slot="document-entry" :class="sampleTile.root">
    <button
      type="button"
      :aria-label="welcome.openSample"
      :class="sampleTile.label"
      @click="startWithSample"
    >
      <span :class="sampleTile.name">{{ welcome.learnBasics }}</span>
      <span :class="sampleTile.metadata">{{ welcome.sampleFile }}</span>
    </button>
    <div :class="sampleTile.panel">
      <!-- The brand's quarter shapes, as on the sample file. -->
      <span :class="sampleTile.shapes" aria-hidden="true">
        <span class="rounded-br-full bg-brand-paper" />
        <span />
        <span />
        <span class="rounded-tl-full bg-brand-sky" />
      </span>
      <button type="button" :class="sampleTile.step" @click="takeTour">
        <icon-hugeicons-arrow-right-01 class="size-3.5" />{{ welcome.learnTour }}
      </button>
      <button type="button" :class="sampleTile.step" @click="seeCode">
        <icon-hugeicons-code-xml class="size-3.5" />{{ welcome.learnCode }}
      </button>
      <button type="button" :class="sampleTile.step" @click="openWelcome('claude')">
        <icon-hugeicons-ai-magic class="size-3.5" />{{ welcome.learnClaude }}
      </button>
    </div>
  </div>
</template>
