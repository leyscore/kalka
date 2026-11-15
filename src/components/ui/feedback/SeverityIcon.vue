<script setup lang="ts">
import type { DesignIssueSeverity } from '@kalka/core/canvas'

import { severityIcon } from '@/theme/feedback/severity'

const { severity, class: className } = defineProps<{
  severity: DesignIssueSeverity
  class?: string
}>()
</script>

<template>
  <icon-hugeicons-alert-circle
    v-if="severity === 'error'"
    aria-hidden="true"
    :class="severityIcon({ severity, class: className })"
  />
  <icon-hugeicons-triangle-alert
    v-else-if="severity === 'warning'"
    aria-hidden="true"
    :class="severityIcon({ severity, class: className })"
  />
  <icon-hugeicons-lightbulb
    v-else
    aria-hidden="true"
    :class="severityIcon({ severity, class: className })"
  />
</template>
