<script setup lang="ts">
import { computed, ref } from 'vue'

import { mentionedAgent, type CommentThread } from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import {
  mentionableAgents,
  mentionSuggestions,
  type CommentsController
} from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'

/**
 * A comment thread: its messages, where the agent it asks stands, and the field to answer or, with
 * no thread yet, to write the first message. Mentioning an agent asks it; a pill adds the mention.
 */
const { thread, comments } = defineProps<{
  thread?: CommentThread
  comments: CommentsController
}>()

const store = useEditorStore()
const messages = useCommentsMessages()
const text = ref('')
const field = ref<HTMLTextAreaElement | null>(null)

const agents = computed(() => mentionableAgents(store))
const asked = computed(() => mentionedAgent(text.value, agents.value))
const suggestions = computed(() => mentionSuggestions(store))
const layerGone = computed(
  () => !!thread?.anchor.nodeId && !store.graph.getNode(thread.anchor.nodeId)
)

const agentLine = computed(() => {
  const agent = thread?.agent
  if (!agent || thread?.resolved) return null
  return messages.value[agent.state]({ name: agent.name })
})

function mention(name: string) {
  text.value = `@${name} ${text.value}`.trimEnd() + ' '
  field.value?.focus()
}

function submit() {
  const value = text.value.trim()
  if (!value) return
  if (thread) comments.reply(thread.id, value)
  else comments.post(value)
  text.value = ''
}

function close() {
  if (thread) comments.open(null)
  else comments.cancelDraft()
}

function onKeydown(event: KeyboardEvent) {
  if (event.code === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    submit()
  } else if (event.code === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    close()
  }
}

defineExpose({ focus: () => field.value?.focus() })
</script>

<template>
  <section
    role="dialog"
    :aria-label="messages.title"
    class="flex w-72 flex-col gap-2 rounded-xl border border-border bg-panel p-3 text-sm text-surface shadow-xl"
    data-slot="comment-thread"
    @pointerdown.stop
    @keydown="onKeydown"
  >
    <header v-if="thread" class="flex items-center gap-1">
      <span class="flex-1 truncate text-xs text-muted">
        {{ layerGone ? messages.layerDeleted : '' }}
      </span>
      <IconButton
        :label="thread.resolved ? messages.reopen : messages.resolve"
        @click="comments.resolve(thread.id, !thread.resolved)"
      >
        <icon-hugeicons-checkmark-circle-02 />
      </IconButton>
      <IconButton :label="messages.delete" @click="comments.remove(thread.id)">
        <icon-hugeicons-delete-02 />
      </IconButton>
      <IconButton :label="messages.close" @click="close">
        <icon-hugeicons-cancel-01 />
      </IconButton>
    </header>
    <ol
      v-if="thread"
      class="flex max-h-64 flex-col gap-2 overflow-y-auto"
      data-slot="comment-messages"
    >
      <li
        v-for="message in thread.messages"
        :key="message.id"
        class="flex flex-col gap-0.5"
        :data-author="message.author.kind"
      >
        <span class="flex items-center gap-1 text-xs font-medium text-muted">
          <icon-hugeicons-ai-magic v-if="message.author.kind === 'agent'" class="size-3" />
          {{ message.author.name }}
        </span>
        <p class="whitespace-pre-wrap">{{ message.text }}</p>
      </li>
    </ol>
    <p
      v-if="agentLine"
      role="status"
      class="flex items-center gap-2 text-xs text-muted"
      data-slot="comment-agent-state"
      :data-state="thread?.agent?.state"
    >
      {{ agentLine }}
      <AppButton
        v-if="thread?.agent?.state === 'failed'"
        size="xs"
        variant="soft"
        @click="comments.retry(thread.id)"
      >
        {{ messages.retry }}
      </AppButton>
    </p>
    <textarea
      ref="field"
      v-model="text"
      rows="2"
      class="w-full resize-none rounded-lg border border-border bg-input px-2 py-1.5 text-sm outline-none focus:border-accent"
      :aria-label="thread ? messages.replyPlaceholder : messages.placeholder"
      :placeholder="thread ? messages.replyPlaceholder : messages.placeholder"
    />
    <div class="flex flex-wrap items-center gap-1">
      <template v-if="!asked">
        <AppButton
          v-for="name in suggestions"
          :key="name"
          size="xs"
          variant="soft"
          :data-mention="name"
          @click="mention(name)"
        >
          {{ messages.ask({ name }) }}
        </AppButton>
      </template>
      <span v-else class="text-xs text-muted" role="status">
        {{ messages.willPickUp({ name: asked }) }}
      </span>
      <span class="flex-1" />
      <AppButton v-if="!thread" size="xs" variant="ghost" @click="close">
        {{ messages.cancel }}
      </AppButton>
      <AppButton size="xs" variant="solid" :disabled="!text.trim()" @click="submit">
        {{ messages.post }}
      </AppButton>
    </div>
  </section>
</template>
