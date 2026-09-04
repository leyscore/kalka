<script setup lang="ts">
import type { MarkdownComponentProps } from 'vue-stream-markdown'

const { node: _node } = defineProps<MarkdownComponentProps>()
</script>

<template>
  <code
    data-stream-markdown="inline-code"
    class="rounded bg-muted px-1 py-px font-mono text-[11px] leading-4 break-words whitespace-normal"
    dir="ltr"
  >
    <slot />
  </code>
</template>
