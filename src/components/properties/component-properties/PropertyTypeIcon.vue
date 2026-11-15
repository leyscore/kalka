<script setup lang="ts">
import type { ComponentPropertyType } from '@kalka/scene-graph'
const { kind } = defineProps<{ kind: ComponentPropertyType }>()
</script>
<template>
  <icon-hugeicons-eye
    v-if="kind === 'BOOLEAN'"
    class="size-3.5 shrink-0 text-muted"
    aria-hidden="true"
  />
  <icon-hugeicons-diamond
    v-else-if="kind === 'VARIANT'"
    class="size-3.5 shrink-0 text-muted"
    aria-hidden="true"
  />
  <icon-hugeicons-type
    v-else-if="kind === 'TEXT'"
    class="size-3.5 shrink-0 text-muted"
    aria-hidden="true"
  />
  <icon-hugeicons-component v-else class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
</template>
