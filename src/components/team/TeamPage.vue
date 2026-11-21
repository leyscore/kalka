<script setup lang="ts">
import { teamPage } from '@/theme/team'

/** A team page: its title and a sentence about it, an action beside them, then its content. */
const { heading, description } = defineProps<{ heading: string; description: string }>()
defineSlots<{ default: () => unknown; actions?: () => unknown }>()
const ui = teamPage()
</script>

<template>
  <div :class="ui.root()">
    <header :class="ui.header()">
      <div class="min-w-0">
        <h1 :class="ui.heading()">{{ heading }}</h1>
        <p :class="ui.description()">{{ description }}</p>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </div>
</template>
