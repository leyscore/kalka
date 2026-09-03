<script setup lang="ts">
import { computed } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/index.css'

import { markdownExtensions, markdownHardenOptions } from '@/app/shell/markdown/config'
import { markdownRenderKey, type MarkdownSurface } from '@/app/shell/markdown/state'
import { resolvedAppTheme } from '@/app/shell/theme'

const {
  content,
  mode = 'static',
  surface = 'message'
} = defineProps<{
  content: string
  mode?: 'static' | 'streaming'
  surface?: MarkdownSurface
}>()

const isDark = computed(() => resolvedAppTheme.value === 'dark')
const renderKey = computed(() => markdownRenderKey({ mode, surface }))
</script>

<template>
  <div
    data-slot="chat-markdown"
    class="[&_[data-stream-markdown=code]]:![background-color:var(--color-input)] [&_[data-stream-markdown=code-block]]:![background-color:var(--color-input)]"
  >
    <Markdown
      :key="renderKey"
      :content="content"
      :is-dark="isDark"
      :mode="mode"
      :extensions="markdownExtensions"
      :harden-options="markdownHardenOptions"
      :previewers="false"
      :controls="{ code: { download: false, fullscreen: false } }"
      :data-chat-markdown-mode="mode"
      class="chat-markdown [--accent:var(--color-hover)] [--accent-foreground:var(--color-surface)] [--background:var(--color-input)] [--border:var(--color-border)] [--foreground:var(--color-surface)] [--muted:var(--color-hover)] [--muted-foreground:var(--color-muted)] [--popover:var(--color-panel)] [--popover-foreground:var(--color-surface)] [--primary:var(--color-accent)] [--primary-foreground:white]"
    />
  </div>
</template>
