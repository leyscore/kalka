<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { openSettingsDialog } from '@/app/settings/dialog'
import { useGlide } from '@/components/ui/motion/useGlide'
import Tip from '@/components/ui/overlay/Tip.vue'
import { homeNav } from '@/theme/home/start'
import { glidePills } from '@/theme/motion/glide'

import { useActiveSection } from './useActiveSection'

const { welcome, settings } = useI18n()
const SECTIONS = ['home-top', 'home-files', 'home-learn'] as const
const activeSection = useActiveSection(SECTIONS)
const navList = useTemplateRef<HTMLElement>('navList')
useGlide(navList, {
  items: 'button',
  active: '[aria-current="true"]',
  pillClass: glidePills.navActive
})
useGlide(navList, { items: 'button', hover: true, pillClass: glidePills.navHover })

/** The home page is one scroll; the entries take it to their section. */
function reveal(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <nav :class="homeNav.root" :aria-label="welcome.navHome">
    <div ref="navList" :class="homeNav.list">
      <Tip :label="welcome.navHome" side="right">
        <button
          type="button"
          :class="homeNav.item"
          :aria-label="welcome.navHome"
          :aria-current="activeSection === 'home-top'"
          @click="reveal('home-top')"
        >
          <icon-hugeicons-house-01 :class="homeNav.icon" />
        </button>
      </Tip>
      <Tip :label="welcome.navFiles" side="right">
        <button
          type="button"
          :class="homeNav.item"
          :aria-label="welcome.navFiles"
          :aria-current="activeSection === 'home-files'"
          @click="reveal('home-files')"
        >
          <icon-hugeicons-folder-01 :class="homeNav.icon" />
        </button>
      </Tip>
      <Tip :label="welcome.navLearn" side="right">
        <button
          type="button"
          :class="homeNav.item"
          :aria-label="welcome.navLearn"
          :aria-current="activeSection === 'home-learn'"
          @click="reveal('home-learn')"
        >
          <icon-hugeicons-book-open-01 :class="homeNav.icon" />
        </button>
      </Tip>
      <div class="flex-1" aria-hidden="true" />
      <Tip :label="settings.title" side="right">
        <button
          type="button"
          :class="homeNav.item"
          :aria-label="settings.title"
          @click="openSettingsDialog()"
        >
          <icon-hugeicons-settings-01 :class="homeNav.icon" />
        </button>
      </Tip>
    </div>
  </nav>
</template>
