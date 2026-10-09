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

const THUMB_WIDTH = 72
const THUMB_HEIGHT = 52

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

const chip =
  'inline-flex h-10 items-center gap-2 rounded-lg border border-border glass px-3.5 text-[13px] font-medium text-surface transition-colors hover:border-muted/40 hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none'
const learnCard =
  'group flex flex-col overflow-hidden rounded-xl border border-border glass text-left transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-muted/40 hover:shadow-lg hover:shadow-black/10 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none motion-reduce:hover:translate-y-0'
</script>

<template>
  <div class="flex flex-col gap-10">
    <section aria-labelledby="home-sizes">
      <h2 id="home-sizes" class="mb-3.5 text-sm font-semibold text-surface">
        {{ welcome.startWithSize }}
      </h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <button
          v-for="(preset, index) in presets"
          :key="preset.id"
          type="button"
          class="group flex flex-col rounded-xl border glass p-3.5 text-left transition-[border-color,background-color,translate,box-shadow,scale] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:bg-accent/5 hover:shadow-lg hover:shadow-accent/10 active:scale-[0.98] motion-reduce:hover:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          :class="index === 0 ? 'border-accent/60' : 'border-border'"
          :data-test-id="`home-preset-${preset.id}`"
          @click="startWithFrame(preset.name, preset.width, preset.height)"
        >
          <span class="mb-3 grid h-[60px] place-items-center">
            <span
              class="rounded-[3px] transition-colors duration-150"
              :class="index === 0 ? 'bg-accent' : 'bg-panel-field-hover group-hover:bg-accent/70'"
              :style="preset.thumb"
            />
          </span>
          <span class="text-[13px] font-semibold text-surface">{{ preset.name }}</span>
          <span class="mt-0.5 font-mono text-[11px] text-muted tabular-nums">
            {{ preset.width }} × {{ preset.height }}
          </span>
        </button>
        <button
          type="button"
          class="flex flex-col rounded-xl border border-dashed border-border p-3.5 text-left transition-colors hover:border-muted/60 hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          data-test-id="home-preset-custom"
          @click="startBlank"
        >
          <span class="mb-3 grid h-[60px] place-items-center text-muted">
            <icon-lucide-plus class="size-6" />
          </span>
          <span class="text-[13px] font-semibold text-surface">{{ welcome.presetCustom }}</span>
          <span class="mt-0.5 text-[11px] text-muted">{{ welcome.presetCustomHint }}</span>
        </button>
      </div>
    </section>

    <section aria-labelledby="home-bring">
      <h2 id="home-bring" class="mb-3.5 text-sm font-semibold text-surface">
        {{ welcome.bringSomethingIn }}
      </h2>
      <div class="flex flex-wrap gap-2.5">
        <button type="button" :class="chip" @click="openFileDialog">
          <icon-lucide-file-down class="size-4 text-muted" />{{ welcome.openFile }}
        </button>
        <button type="button" :class="chip" @click="pasteOpen = true">
          <icon-lucide-code-xml class="size-4 text-muted" />{{ welcome.pasteHTML }}
        </button>
        <button type="button" :class="chip" @click="urlOpen = true">
          <icon-lucide-globe class="size-4 text-muted" />{{ welcome.openURL }}
        </button>
        <button type="button" :class="chip" @click="startWithSample">
          <icon-lucide-sparkles class="size-4 text-muted" />{{ welcome.openSample }}
        </button>
      </div>
    </section>

    <section id="home-learn" aria-labelledby="home-learn-heading" class="scroll-mt-6">
      <h2 id="home-learn-heading" class="mb-3.5 text-sm font-semibold text-surface">
        {{ welcome.learnBasics }}
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button type="button" :class="learnCard" @click="takeTour">
          <span class="grid h-32 place-items-center bg-brand-blue">
            <span class="flex gap-2.5">
              <span class="size-11 rounded-md bg-brand-paper" />
              <span class="size-11 rounded-md bg-brand-sky" />
              <span class="size-11 rounded-md bg-brand-ink" />
            </span>
          </span>
          <span class="p-4">
            <span class="block text-[13px] font-semibold text-surface">{{
              welcome.learnTour
            }}</span>
            <span class="mt-1 block text-xs text-muted">{{ welcome.learnTourHint }}</span>
          </span>
        </button>
        <button type="button" :class="learnCard" @click="seeCode">
          <span class="grid h-32 place-items-center bg-brand-ink">
            <span class="font-mono text-2xl text-brand-sky">&lt;/&gt;</span>
          </span>
          <span class="p-4">
            <span class="block text-[13px] font-semibold text-surface">{{
              welcome.learnCode
            }}</span>
            <span class="mt-1 block text-xs text-muted">{{ welcome.learnCodeHint }}</span>
          </span>
        </button>
        <button type="button" :class="learnCard" @click="openWelcome('claude')">
          <span class="grid h-32 place-items-center bg-brand-sky">
            <span
              class="rounded-lg bg-brand-blue px-3 py-1.5 font-mono text-xs font-medium text-white shadow-md"
            >
              render → Hero
            </span>
          </span>
          <span class="p-4">
            <span class="block text-[13px] font-semibold text-surface">
              {{ welcome.learnClaude }}
            </span>
            <span class="mt-1 block text-xs text-muted">{{ welcome.learnClaudeHint }}</span>
          </span>
        </button>
      </div>
    </section>

    <HomePasteHTMLDialog v-model:open="pasteOpen" />
    <HomeOpenURLDialog v-model:open="urlOpen" />
  </div>
</template>
