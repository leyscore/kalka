<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { openSettingsDialog } from '@/app/settings/dialog'
import BrandMark from '@/components/brand/BrandMark.vue'
import { useGlide } from '@/components/ui/motion/useGlide'
import { homeNav } from '@/theme/home/start'
import { glidePills } from '@/theme/motion/glide'

import { useActiveSection } from './useActiveSection'

const { welcome, settings } = useI18n()
const SECTIONS = ['home-top', 'home-learn', 'home-files'] as const
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
    <div :class="homeNav.brand">
      <BrandMark variant="app-icon" decorative class="size-7 overflow-hidden rounded-[7px]" />
      <span :class="homeNav.name">Kalka</span>
    </div>
    <div ref="navList" class="flex flex-1 flex-col gap-0.5">
      <button
        type="button"
        :class="homeNav.item"
        :aria-current="activeSection === 'home-top'"
        @click="reveal('home-top')"
      >
        <icon-lucide-house :class="homeNav.icon" />{{ welcome.navHome }}
      </button>
      <button
        type="button"
        :class="homeNav.item"
        :aria-current="activeSection === 'home-learn'"
        @click="reveal('home-learn')"
      >
        <icon-lucide-book-open :class="homeNav.icon" />{{ welcome.navLearn }}
      </button>
      <button
        type="button"
        :class="homeNav.item"
        :aria-current="activeSection === 'home-files'"
        @click="reveal('home-files')"
      >
        <icon-lucide-folder :class="homeNav.icon" />{{ welcome.navFiles }}
      </button>
      <button type="button" :class="[homeNav.item, 'mt-auto']" @click="openSettingsDialog()">
        <icon-lucide-settings :class="homeNav.icon" />{{ settings.title }}
      </button>
    </div>
  </nav>
</template>
