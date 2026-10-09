<script setup lang="ts">
import { useI18n } from '@open-pencil/vue'

import { openWelcome } from '@/app/onboarding/welcome'
import { openSettingsDialog } from '@/app/settings/dialog'
import BrandMark from '@/components/brand/BrandMark.vue'
import ClaudeStatus from '@/components/onboarding/ClaudeStatus.vue'

const { welcome, settings } = useI18n()

/** The home page is one scroll; the entries take it to their section. */
function reveal(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const item =
  'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-hover hover:text-surface focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none'
</script>

<template>
  <nav
    class="hidden w-56 shrink-0 flex-col border-r border-border bg-panel-secondary px-3 py-5 md:flex"
    :aria-label="welcome.navHome"
  >
    <div class="mb-6 flex items-center gap-2.5 px-2">
      <BrandMark variant="app-icon" decorative class="size-7" />
      <span class="font-display text-lg font-semibold tracking-[-0.035em] text-surface">Kalka</span>
    </div>
    <div class="flex flex-col gap-0.5">
      <button type="button" :class="[item, 'bg-hover text-surface']" @click="reveal('home-top')">
        <icon-lucide-house class="size-4" />{{ welcome.navHome }}
      </button>
      <button type="button" :class="item" @click="reveal('home-learn')">
        <icon-lucide-book-open class="size-4" />{{ welcome.navLearn }}
      </button>
      <button type="button" :class="item" @click="reveal('home-files')">
        <icon-lucide-folder class="size-4" />{{ welcome.navFiles }}
      </button>
    </div>
    <div class="mt-auto flex flex-col gap-1">
      <button
        type="button"
        class="flex h-10 items-center rounded-lg border border-border bg-panel px-3 text-xs font-medium text-surface transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
        @click="openWelcome('claude')"
      >
        <ClaudeStatus compact />
      </button>
      <button type="button" :class="item" @click="openSettingsDialog()">
        <icon-lucide-settings class="size-4" />{{ settings.title }}
      </button>
    </div>
  </nav>
</template>
