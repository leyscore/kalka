<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n, vTestId } from '@kalka/vue'

import { FRAME_PRESETS, startBlank, startWithFrame, type FramePresetID } from '@/app/home/start'
import { openFileDialog } from '@/app/shell/menu/use'
import { homeHeading, inlineLink, presetCard } from '@/theme/home/start'

import HomeOpenURLDialog from './HomeOpenURLDialog.vue'
import HomePasteHTMLDialog from './HomePasteHTMLDialog.vue'

const { welcome } = useI18n()
const pasteOpen = ref(false)
const urlOpen = ref(false)

const presets = computed(() => {
  const w = welcome.value
  const names: Record<FramePresetID, string> = {
    desktop: w.presetDesktop,
    laptop: w.presetLaptop,
    tablet: w.presetTablet,
    mobile: w.presetMobile,
    social: w.presetSocial
  }
  return FRAME_PRESETS.map((preset) => ({
    ...preset,
    name: names[preset.id],
    styles: presetCard({ device: preset.id })
  }))
})
const custom = presetCard({ kind: 'custom' })

type ImportChoice = 'file' | 'html' | 'url'
const IMPORT_CHOICES = ['file', 'html', 'url'] as const

/** The import sentence, split around its three choices so each one can be a link. */
const importParts = computed(() => {
  const sentence = welcome.value.importSentence({ file: '{file}', html: '{html}', url: '{url}' })
  return sentence
    .split(/(\{file\}|\{html\}|\{url\})/)
    .filter((part) => part !== '')
    .map((part) => {
      const choice = IMPORT_CHOICES.find((candidate) => part === `{${candidate}}`)
      return choice ? { choice, text: importLabel(choice) } : { choice: null, text: part }
    })
})

function importLabel(choice: ImportChoice): string {
  if (choice === 'file') return welcome.value.importFile
  if (choice === 'html') return welcome.value.importHTML
  return welcome.value.importURL
}

function runImport(choice: ImportChoice): void {
  if (choice === 'file') openFileDialog()
  else if (choice === 'html') pasteOpen.value = true
  else urlOpen.value = true
}
</script>

<template>
  <section aria-labelledby="home-sizes" class="flex flex-col gap-3.5">
    <h2 id="home-sizes" :class="homeHeading">{{ welcome.startWithSize }}</h2>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        :class="preset.styles.root()"
        v-test-id="`home-preset-${preset.id}`"
        @click="startWithFrame(preset.name, preset.width, preset.height)"
      >
        <span :class="preset.styles.device()" aria-hidden="true">
          <span :class="preset.styles.outline()" />
        </span>
        <span :class="preset.styles.body()">
          <span :class="preset.styles.name()">{{ preset.name }}</span>
          <span :class="preset.styles.detail()">{{ preset.width }} × {{ preset.height }}</span>
        </span>
      </button>
      <button
        type="button"
        :class="custom.root()"
        data-test-id="home-preset-custom"
        @click="startBlank"
      >
        <span :class="custom.device()" aria-hidden="true">
          <icon-lucide-plus class="size-[22px]" />
        </span>
        <span :class="custom.body()">
          <span :class="custom.name()">{{ welcome.presetCustom }}</span>
          <span :class="custom.detail()">{{ welcome.presetCustomHint }}</span>
        </span>
      </button>
    </div>
    <p class="text-[13px] text-muted">
      <template v-for="(part, index) in importParts" :key="index">
        <button
          v-if="part.choice"
          type="button"
          :class="inlineLink"
          @click="runImport(part.choice)"
        >
          {{ part.text }}
        </button>
        <template v-else>{{ part.text }}</template>
      </template>
    </p>

    <HomePasteHTMLDialog v-model:open="pasteOpen" />
    <HomeOpenURLDialog v-model:open="urlOpen" />
  </section>
</template>
