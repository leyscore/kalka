<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  COMMENT_REACTIONS,
  mentionedAgent,
  mentionedPeople,
  type CommentMessage,
  type CommentThread
} from '@kalka/scene-graph'
import { useCommentsMessages } from '@kalka/vue'

import type { CommentInbox } from '@/app/comments/inbox'
import {
  mentionableAgents,
  mentionSuggestions,
  type CommentsController
} from '@/app/comments/service'
import { useEditorStore } from '@/app/editor/active-store'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import Tip from '@/components/ui/overlay/Tip.vue'

/**
 * A comment thread: its messages, where the agent it asks stands, and the field to answer or, with
 * no thread yet, to write the first message. Mentioning an agent asks it; a pill adds the mention.
 */
const { thread, comments, inbox } = defineProps<{
  thread?: CommentThread
  comments: CommentsController
  inbox: CommentInbox
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

/** The `@name` being typed at the end of the field, which the people list completes. */
const typedMention = computed(() => /(?:^|\s)@([^\s@]*)$/u.exec(text.value)?.[1])
const peopleMatches = computed(() => {
  const typed = typedMention.value?.toLowerCase()
  if (typed === undefined) return []
  return inbox.people.value.filter((name) => name.toLowerCase().startsWith(typed)).slice(0, 5)
})

/** Completes the `@name` being typed with a person's whole name. */
function mentionPerson(name: string) {
  const typed = typedMention.value ?? ''
  text.value = `${text.value.slice(0, text.value.length - typed.length)}${name} `
  field.value?.focus()
}

function submit() {
  const value = text.value.trim()
  if (!value) return
  const mentions = mentionedPeople(value, inbox.people.value)
  if (thread) comments.reply(thread.id, value, mentions)
  else comments.post(value, mentions)
  text.value = ''
}

/** The message whose reaction picker is open. */
const pickingFor = ref<string | null>(null)

function react(message: CommentMessage, emoji: string) {
  if (!thread) return
  comments.react(thread.id, message.id, emoji)
  pickingFor.value = null
}

function reactedByMe(people: readonly string[]): boolean {
  const me = inbox.me.value.toLowerCase()
  return people.some((name) => name.toLowerCase() === me)
}

function close() {
  if (thread) comments.open(null)
  else comments.cancelDraft()
}

/** In the field Enter sends, as in Figma; Shift+Enter starts a new line, and an input method keeps its Enter. */
function sends(event: KeyboardEvent): boolean {
  if (event.target !== field.value || event.shiftKey || event.isComposing) return false
  return event.code === 'Enter' || event.code === 'NumpadEnter'
}

function onKeydown(event: KeyboardEvent) {
  if (sends(event)) {
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
        <div class="flex flex-wrap items-center gap-1" data-slot="comment-reactions">
          <Tip
            v-for="reaction in message.reactions ?? []"
            :key="reaction.emoji"
            :label="
              messages.reactedWith({ emoji: reaction.emoji, names: reaction.people.join(', ') })
            "
          >
            <button
              type="button"
              class="flex h-5 items-center gap-1 rounded-full border border-border px-1.5 text-xs text-surface hover:bg-hover data-[mine]:border-accent data-[mine]:bg-accent/15"
              :aria-pressed="reactedByMe(reaction.people)"
              :data-mine="reactedByMe(reaction.people) || undefined"
              :data-emoji="reaction.emoji"
              data-slot="comment-reaction"
              @click="react(message, reaction.emoji)"
            >
              <span aria-hidden="true">{{ reaction.emoji }}</span>
              <span>{{ reaction.people.length }}</span>
            </button>
          </Tip>
          <IconButton
            :label="messages.addReaction"
            class="size-5 opacity-60 hover:opacity-100"
            data-test-id="comment-add-reaction"
            :aria-expanded="pickingFor === message.id"
            @click="pickingFor = pickingFor === message.id ? null : message.id"
          >
            <icon-hugeicons-smile class="size-3.5" />
          </IconButton>
        </div>
        <div
          v-if="pickingFor === message.id"
          role="group"
          :aria-label="messages.addReaction"
          class="flex flex-wrap gap-0.5 rounded-lg border border-border bg-input p-1"
          data-slot="comment-reaction-picker"
        >
          <button
            v-for="emoji in COMMENT_REACTIONS"
            :key="emoji"
            type="button"
            class="flex size-7 items-center justify-center rounded-md text-base hover:bg-hover"
            :aria-label="messages.reactWith({ emoji })"
            :data-emoji="emoji"
            @click="react(message, emoji)"
          >
            {{ emoji }}
          </button>
        </div>
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
    <div
      v-if="peopleMatches.length > 0"
      role="listbox"
      :aria-label="messages.mentionPeople"
      class="flex flex-col rounded-lg border border-border bg-input p-1"
      data-slot="comment-people"
    >
      <button
        v-for="name in peopleMatches"
        :key="name"
        type="button"
        role="option"
        :aria-selected="false"
        class="rounded-md px-2 py-1 text-left text-xs text-surface hover:bg-hover"
        :data-person="name"
        @click="mentionPerson(name)"
      >
        @{{ name }}
      </button>
    </div>
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
