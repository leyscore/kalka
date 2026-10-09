<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n } from '@open-pencil/vue'

import { useAIChat } from '@/app/ai/chat/use'
import {
  FRAME_PRESETS,
  startBlank,
  startWithFrame,
  startWithSample,
  type FramePresetID
} from '@/app/home/start'
import { startTour } from '@/app/onboarding/tour'
import { openWelcome } from '@/app/onboarding/welcome'
import { openFileDialog } from '@/app/shell/menu/use'

import HomeOpenURLDialog from './HomeOpenURLDialog.vue'
import HomePasteHTMLDialog from './HomePasteHTMLDialog.vue'

const { welcome } = useI18n()
const { activeTab: panelTab } = useAIChat()
const pasteOpen = ref(false)
const urlOpen = ref(false)

const THUMB_WIDTH = 60
const THUMB_HEIGHT = 46

const presets = computed(() => {
  const w = welcome.value
  const names: Record<FramePresetID, string> = {
    desktop: w.presetDesktop,
    laptop: w.presetLaptop,
    tablet: w.presetTablet,
    mobile: w.presetMobile,
    social: w.presetSocial
  }
  return FRAME_PRESETS.map((preset) => {
    const scale = Math.min(THUMB_WIDTH / preset.width, THUMB_HEIGHT / preset.height)
    return {
      ...preset,
      name: names[preset.id],
      thumb: { width: `${preset.width * scale}px`, height: `${preset.height * scale}px` }
    }
  })
})

async function takeTour(): Promise<void> {
  await startWithSample()
  startTour()
}

async function seeCode(): Promise<void> {
  await startWithSample()
  panelTab.value = 'code'
}

const link =
  'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-muted transition-colors duration-150 hover:bg-accent/7 hover:text-surface focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none'
const learnCard =
  'group flex items-center gap-3.5 rounded-xl border border-border/70 glass p-3 text-left transition-[border-color,translate,box-shadow,scale] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none motion-reduce:hover:translate-y-0'
</script>

<template>
  <div class="flex flex-col gap-12">
    <section aria-labelledby="home-sizes">
      <h2 id="home-sizes" class="mb-4 text-sm font-semibold text-surface">
        {{ welcome.startWithSize }}
      </h2>
      <div class="flex flex-wrap gap-x-3 gap-y-5">
        <button
          v-for="preset in presets"
          :key="preset.id"
          type="button"
          class="group flex w-[112px] flex-col items-center rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          :data-test-id="`home-preset-${preset.id}`"
          @click="startWithFrame(preset.name, preset.width, preset.height)"
        >
          <span
            class="grid h-[88px] w-full place-items-center rounded-xl border border-border/60 glass transition-[border-color,translate,box-shadow,scale] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-accent/50 group-hover:shadow-lg group-hover:shadow-accent/15 group-active:scale-[0.97] motion-reduce:group-hover:translate-y-0"
          >
            <span
              class="rounded-[4px] bg-muted/25 transition-colors duration-200 group-hover:bg-accent"
              :style="preset.thumb"
            />
          </span>
          <span class="mt-2.5 text-[13px] font-medium text-surface">{{ preset.name }}</span>
          <span class="font-mono text-[11px] text-muted tabular-nums">
            {{ preset.width }} × {{ preset.height }}
          </span>
        </button>
        <button
          type="button"
          class="group flex w-[112px] flex-col items-center rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          data-test-id="home-preset-custom"
          @click="startBlank"
        >
          <span
            class="grid h-[88px] w-full place-items-center rounded-xl border border-dashed border-border text-muted transition-[border-color,color,scale] duration-200 group-hover:border-accent/60 group-hover:text-accent group-active:scale-[0.97]"
          >
            <icon-lucide-plus class="size-5" />
          </span>
          <span class="mt-2.5 text-[13px] font-medium text-surface">{{
            welcome.presetCustom
          }}</span>
          <span class="text-[11px] text-muted">{{ welcome.presetCustomHint }}</span>
        </button>
      </div>
      <div
        class="mt-5 flex flex-wrap items-center gap-x-1 gap-y-1"
        :aria-label="welcome.bringSomethingIn"
      >
        <span class="mr-1 text-xs text-muted">{{ welcome.bringSomethingIn }}</span>
        <button type="button" :class="link" @click="openFileDialog">
          <icon-lucide-file-down class="size-3.5" />{{ welcome.openFile }}
        </button>
        <button type="button" :class="link" @click="pasteOpen = true">
          <icon-lucide-code-xml class="size-3.5" />{{ welcome.pasteHTML }}
        </button>
        <button type="button" :class="link" @click="urlOpen = true">
          <icon-lucide-globe class="size-3.5" />{{ welcome.openURL }}
        </button>
        <button type="button" :class="link" @click="startWithSample">
          <icon-lucide-sparkles class="size-3.5" />{{ welcome.openSample }}
        </button>
      </div>
    </section>

    <section id="home-learn" aria-labelledby="home-learn-heading" class="scroll-mt-6">
      <h2 id="home-learn-heading" class="mb-4 text-sm font-semibold text-surface">
        {{ welcome.learnBasics }}
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button type="button" :class="learnCard" @click="takeTour">
          <span
            class="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-blue text-white"
          >
            <icon-lucide-route class="size-4.5" />
          </span>
          <span class="min-w-0">
            <span class="block text-[13px] font-semibold text-surface">{{
              welcome.learnTour
            }}</span>
            <span class="mt-0.5 block truncate text-xs text-muted">{{
              welcome.learnTourHint
            }}</span>
          </span>
        </button>
        <button type="button" :class="learnCard" @click="seeCode">
          <span
            class="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-ink text-brand-sky ring-1 ring-white/10"
          >
            <icon-lucide-code-xml class="size-4.5" />
          </span>
          <span class="min-w-0">
            <span class="block text-[13px] font-semibold text-surface">{{
              welcome.learnCode
            }}</span>
            <span class="mt-0.5 block truncate text-xs text-muted">{{
              welcome.learnCodeHint
            }}</span>
          </span>
        </button>
        <button type="button" :class="learnCard" @click="openWelcome('claude')">
          <span
            class="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-sky text-brand-ink"
          >
            <icon-lucide-sparkles class="size-4.5" />
          </span>
          <span class="min-w-0">
            <span class="block text-[13px] font-semibold text-surface">{{
              welcome.learnClaude
            }}</span>
            <span class="mt-0.5 block truncate text-xs text-muted">{{
              welcome.learnClaudeHint
            }}</span>
          </span>
        </button>
      </div>
    </section>

    <HomePasteHTMLDialog v-model:open="pasteOpen" />
    <HomeOpenURLDialog v-model:open="urlOpen" />
  </div>
</template>
