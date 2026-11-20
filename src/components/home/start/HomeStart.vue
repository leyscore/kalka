<script setup lang="ts">
import { computed, ref } from 'vue'

import { useI18n, vTestId } from '@kalka/vue'

import { FRAME_PRESETS, startBlank, startWithFrame, type FramePresetID } from '@/app/home/start'
import { importClaudeDesignDialog, openFileDialog, openFolderDialog } from '@/app/shell/menu/use'
import { isTauri } from '@/app/tauri/env'
import HomeJoinRoom from '@/components/home/search/HomeJoinRoom.vue'
import { homeAction, sizeChip } from '@/theme/home/start'

import HomeOpenURLDialog from './HomeOpenURLDialog.vue'
import HomePasteHTMLDialog from './HomePasteHTMLDialog.vue'

/**
 * Under the request on Home: the sizes to start a design with, as chips on the sky, then the ways
 * to bring something in.
 */
const { welcome, menu } = useI18n()
const pasteOpen = ref(false)
const urlOpen = ref(false)
/** Folders open through the desktop app's file system access. */
const canOpenFolder = isTauri()

/** The longest side of a chip's frame, in pixels; the other side follows the preset's ratio. */
const FRAME_SIDE = 22
/** Below this a portrait frame would read as a line. */
const FRAME_MIN = 7

const size = sizeChip()
const custom = sizeChip({ custom: true })

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
    const scale = FRAME_SIDE / Math.max(preset.width, preset.height)
    return {
      ...preset,
      name: names[preset.id],
      frame: {
        width: `${Math.max(FRAME_MIN, Math.round(preset.width * scale))}px`,
        height: `${Math.max(FRAME_MIN, Math.round(preset.height * scale))}px`
      }
    }
  })
})
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <span id="home-sizes" class="text-[13px] text-[#B9C9F8]">{{ welcome.orStartWithSize }}</span>
    <div aria-labelledby="home-sizes" role="group" class="flex flex-wrap justify-center gap-2">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        :class="size.root()"
        v-test-id="`home-preset-${preset.id}`"
        @click="startWithFrame(preset.name, preset.width, preset.height)"
      >
        <span :class="size.device()" aria-hidden="true">
          <span :class="size.outline()" :style="preset.frame" />
        </span>
        <span :class="size.body()">
          <span :class="size.name()">{{ preset.name }}</span>
          <span :class="size.detail()">{{ preset.width }} × {{ preset.height }}</span>
        </span>
      </button>
      <button
        type="button"
        :class="custom.root()"
        data-test-id="home-new-document"
        @click="startBlank"
      >
        <span :class="custom.device()" aria-hidden="true">
          <icon-hugeicons-plus class="size-3.5" />
        </span>
        <span :class="custom.body()">
          <span :class="custom.name()">{{ welcome.presetCustom }}</span>
          <span :class="custom.detail()">{{ welcome.presetCustomHint }}</span>
        </span>
      </button>
    </div>
  </div>

  <div class="flex flex-wrap items-center justify-center gap-0.5">
    <HomeJoinRoom />
    <button type="button" :class="homeAction" data-test-id="home-open-file" @click="openFileDialog">
      <icon-hugeicons-file-import class="size-4" />{{ menu.open }}
    </button>
    <button
      v-if="canOpenFolder"
      type="button"
      :class="homeAction"
      data-test-id="home-open-folder"
      @click="openFolderDialog"
    >
      <icon-hugeicons-folder-open class="size-4" />{{ menu.openFolder }}
    </button>
    <button
      type="button"
      :class="homeAction"
      data-test-id="home-paste-html"
      @click="pasteOpen = true"
    >
      <icon-hugeicons-code-xml class="size-4" />{{ welcome.pasteHTML }}
    </button>
    <button
      type="button"
      :class="homeAction"
      data-test-id="home-import-claude-design"
      @click="importClaudeDesignDialog"
    >
      <icon-hugeicons-file-import class="size-4" />{{ menu.importClaudeDesign }}
    </button>
    <button type="button" :class="homeAction" data-test-id="home-open-url" @click="urlOpen = true">
      <icon-hugeicons-link-01 class="size-4" />{{ welcome.openURL }}
    </button>
  </div>

  <HomePasteHTMLDialog v-model:open="pasteOpen" />
  <HomeOpenURLDialog v-model:open="urlOpen" />
</template>
