<script setup lang="ts">
import { computed } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import 'vue-stream-markdown/index.css'

import { IS_BROWSER } from '@open-pencil/core/constants'

import { createMarkdownHardenOptions, markdownExtensions } from '@/app/shell/markdown/config'
import { markdownRenderKey, type MarkdownSurface } from '@/app/shell/markdown/state'
import { resolvedAppTheme } from '@/app/shell/theme'
import { chatUI } from '@/theme/chat'

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
const ui = chatUI()
const hardenOptions = computed(() =>
  createMarkdownHardenOptions(IS_BROWSER ? window.location.origin : 'http://localhost/')
)
const renderKey = computed(() => markdownRenderKey({ mode, surface }))
</script>

<template>
  <div data-slot="chat-markdown" :class="ui.markdownRoot()">
    <Markdown
      :key="renderKey"
      :content="content"
      :is-dark="isDark"
      :mode="mode"
      :extensions="markdownExtensions"
      :harden-options="hardenOptions"
      :previewers="false"
      :controls="{ code: { download: false, fullscreen: false } }"
      :data-chat-markdown-mode="mode"
      :class="ui.markdown()"
    />
  </div>
</template>
