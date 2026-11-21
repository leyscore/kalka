<script setup lang="ts">
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui'

import { useI18n } from '@kalka/vue'

import type { AppTheme } from '@/app/shell/theme'
import { themePicker } from '@/theme/settings/preferences'

/**
 * The app's theme as three small windows to pick from: Light, Dark, and Auto, which follows the
 * system and shows both, split down the middle.
 */
const theme = defineModel<AppTheme>({ required: true })
const { menu } = useI18n()
const ui = themePicker()

const options: { value: AppTheme; tones: ('light' | 'dark')[] }[] = [
  { value: 'light', tones: ['light'] },
  { value: 'dark', tones: ['dark'] },
  { value: 'auto', tones: ['light', 'dark'] }
]

function label(value: AppTheme): string {
  if (value === 'light') return menu.value.themeLight
  if (value === 'dark') return menu.value.themeDark
  return menu.value.themeAuto
}

function update(value: unknown): void {
  if (value === 'light' || value === 'dark' || value === 'auto') theme.value = value
}
</script>

<template>
  <RadioGroupRoot
    :model-value="theme"
    :aria-label="menu.theme"
    orientation="horizontal"
    :class="ui.root()"
    data-test-id="settings-theme"
    @update:model-value="update"
  >
    <RadioGroupItem
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :class="ui.option()"
    >
      <span :class="ui.window()" aria-hidden="true">
        <span
          v-for="(tone, index) in option.tones"
          :key="tone"
          :class="ui.half({ tone })"
          :style="
            option.tones.length > 1
              ? { clipPath: index === 0 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)' }
              : undefined
          "
        >
          <span :class="ui.bar({ tone })" />
          <span :class="ui.body()">
            <span :class="ui.side({ tone })" />
            <span :class="ui.canvas({ tone })"><span :class="ui.frame({ tone })" /></span>
          </span>
        </span>
      </span>
      <span :class="ui.label()">
        <span :class="ui.dot()" aria-hidden="true" />
        {{ label(option.value) }}
      </span>
    </RadioGroupItem>
  </RadioGroupRoot>
</template>
