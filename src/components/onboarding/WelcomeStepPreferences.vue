<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import { computed } from 'vue'

import { useI18n } from '@open-pencil/vue'

import {
  appPreferences,
  CODE_SOURCES,
  updateDefaultCodeSource,
  type DefaultCodeSource
} from '@/app/settings/preferences/store'
import { useAppTheme, type AppTheme } from '@/app/shell/theme'

const { welcome } = useI18n()
const { theme, setTheme } = useAppTheme()

type Look = { panel: string; canvas: string; frame: string }
const DARK: Look = { panel: '#18181b', canvas: '#121214', frame: '#efefec' }
const LIGHT: Look = { panel: '#efefec', canvas: '#e4e4df', frame: '#ffffff' }

const themes = computed(() => [
  { value: 'dark', label: welcome.value.themeDark, looks: [DARK] },
  { value: 'light', label: welcome.value.themeLight, looks: [LIGHT] },
  { value: 'auto', label: welcome.value.themeAuto, looks: [LIGHT, DARK] }
])

const codeSource = computed({
  get: () => appPreferences.value.code.defaultSource,
  set: (value: DefaultCodeSource) => updateDefaultCodeSource(value)
})
const codeLabels = computed<Record<DefaultCodeSource, string>>(() => ({
  'html-css': welcome.value.codeHTML,
  'tailwind-jsx': welcome.value.codeTailwind,
  'design-jsx': welcome.value.codeJSX
}))
const codeOrder = [...CODE_SOURCES].sort(
  (a, b) => (a === 'html-css' ? -1 : 0) - (b === 'html-css' ? -1 : 0)
)
</script>

<template>
  <div class="flex flex-col gap-8">
    <section>
      <h2 id="welcome-theme" class="mb-3 text-[13px] font-semibold text-surface">
        {{ welcome.theme }}
      </h2>
      <RadioGroupRoot
        :model-value="theme"
        aria-labelledby="welcome-theme"
        class="grid grid-cols-1 gap-3 sm:grid-cols-3"
        @update:model-value="(value) => setTheme(value as AppTheme)"
      >
        <RadioGroupItem
          v-for="option in themes"
          :key="option.value"
          :value="option.value"
          class="group rounded-xl border border-border bg-panel p-2.5 text-left transition-[border-color,box-shadow] duration-150 outline-none hover:border-muted/50 focus-visible:ring-2 focus-visible:ring-accent/50 data-[state=checked]:border-accent data-[state=checked]:shadow-[0_0_0_1px_var(--color-accent)]"
        >
          <span class="flex h-24 overflow-hidden rounded-lg border border-border/70">
            <span
              v-for="(look, index) in option.looks"
              :key="index"
              class="grid flex-1 grid-cols-[1fr_2fr_1fr]"
            >
              <span :style="{ background: look.panel }" />
              <span class="grid place-items-center" :style="{ background: look.canvas }">
                <span class="h-9 w-14 rounded-sm shadow-sm" :style="{ background: look.frame }" />
              </span>
              <span :style="{ background: look.panel }" />
            </span>
          </span>
          <span class="mt-2.5 flex items-center gap-2 px-1 pb-0.5">
            <span
              class="grid size-4 place-items-center rounded-full border-[1.5px] border-muted/70 group-data-[state=checked]:border-accent"
            >
              <RadioGroupIndicator class="size-2 rounded-full bg-accent" />
            </span>
            <span class="text-[13px] font-semibold text-surface">{{ option.label }}</span>
          </span>
        </RadioGroupItem>
      </RadioGroupRoot>
    </section>

    <section>
      <h2 id="welcome-code" class="mb-3 text-[13px] font-semibold text-surface">
        {{ welcome.codeFormat }}
      </h2>
      <RadioGroupRoot
        v-model="codeSource"
        aria-labelledby="welcome-code"
        orientation="horizontal"
        class="grid grid-cols-3 gap-1 rounded-xl border border-border bg-panel p-1"
      >
        <RadioGroupItem
          v-for="source in codeOrder"
          :key="source"
          :value="source"
          class="h-9 rounded-lg text-[13px] font-medium text-muted transition-colors outline-none hover:text-surface focus-visible:ring-2 focus-visible:ring-accent/50 data-[state=checked]:bg-accent data-[state=checked]:text-white data-[state=checked]:shadow-sm"
        >
          {{ codeLabels[source] }}
        </RadioGroupItem>
      </RadioGroupRoot>
      <p class="mt-2 text-xs text-muted">{{ welcome.codeFormatHint }}</p>
    </section>
  </div>
</template>
