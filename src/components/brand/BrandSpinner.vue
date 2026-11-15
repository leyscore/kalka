<script setup lang="ts">
import { brandSpinner } from '@/theme/brand'

/** Kalka's loader beside a line of text, for work in progress such as an agent's steps. */
const styles = brandSpinner()
</script>

<template>
  <span :class="styles.root()" aria-hidden="true">
    <span :class="styles.shell()" />
    <span :class="styles.vessel()"><span :class="styles.liquid()" /></span>
  </span>
</template>
