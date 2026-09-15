<script setup lang="ts">
import { useId } from 'vue'

import SettingsSectionHeader from './SettingsSectionHeader.vue'

const headingId = useId()
</script>

<template>
  <section class="flex flex-col gap-3" :aria-labelledby="headingId">
    <SettingsSectionHeader>
      <span :id="headingId"><slot name="title" /></span>
      <template v-if="$slots.description" #description><slot name="description" /></template>
    </SettingsSectionHeader>
    <slot />
  </section>
</template>
