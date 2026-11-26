<script setup lang="ts">
import { computed } from 'vue'
import IconComment from '~icons/hugeicons/comment-01'

import { useCommentsMessages } from '@kalka/vue'

import { useCommentInbox } from '@/app/comments/inbox'
import { commentPlacing, toggleCommentPlacing, useComments } from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import ToolButton from '@/components/Toolbar/ToolButton.vue'
import type { ToolbarUI } from '@/components/Toolbar/types'
import Tip from '@/components/ui/overlay/Tip.vue'

/** Comment mode in the toolbar, as C turns it on: the next click on the design pins a comment. */
const { ui, mobile = false } = defineProps<{ ui?: ToolbarUI; mobile?: boolean }>()

const store = useEditorStore()
const messages = useCommentsMessages()
const active = computed(() => commentPlacing(store))
/** Unread threads show as a dot on the button, so they are seen without opening the panel. */
const inbox = useCommentInbox(store, useComments(store))
const unreadCount = computed(() => inbox.unread.value.length)
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
    >
      <span
        v-if="unreadCount > 0"
        class="absolute top-1.5 right-1.5 size-2 rounded-full bg-error"
        data-slot="comment-tool-unread"
      >
        <span class="sr-only">{{ messages.unreadCount({ count: unreadCount }) }}</span>
      </span>
    </ToolButton>
  </Tip>
</template>
