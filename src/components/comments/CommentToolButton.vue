<script setup lang="ts">
import { computed } from 'vue'
import IconComment from '~icons/hugeicons/comment-01'

import { useCommentsMessages } from '@kalka/vue'

import { commentPlacing, toggleCommentPlacing } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import ToolButton from '@/components/Toolbar/ToolButton.vue'
import type { ToolbarUI } from '@/components/Toolbar/types'
import Tip from '@/components/ui/overlay/Tip.vue'

/** Comment mode in the toolbar, as C turns it on: the next click on the design pins a comment. */
const { ui, mobile = false } = defineProps<{ ui?: ToolbarUI; mobile?: boolean }>()

const store = useEditorStore()
const messages = useCommentsMessages()
const active = computed(() => commentPlacing(store))
</script>

<template>
  <Tip :label="`${messages.tool} (C)`">
    <ToolButton
      data-slot="comment-tool"
      :icon="IconComment"
      :label="messages.tool"
      :active="active"
      :mobile="mobile"
      :ui="ui"
      @click="toggleCommentPlacing(store)"
    />
  </Tip>
</template>
