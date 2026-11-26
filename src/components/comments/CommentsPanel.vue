<script setup lang="ts">
import { computed, ref } from 'vue'

import type { CommentThread } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'
import { useCommentsMessages } from '@kalka/vue'

import { useCommentInbox } from '@/app/comments/inbox'
import { useComments } from '@/app/comments/service'
import { agentChanges, restoreBeforeChange } from '@/app/document/versions/bursts'
import { useEditorStore } from '@/app/editor/active-store'
import { agentTasks, type AgentTask } from '@/app/presence/tasks'
import AppButton from '@/components/ui/button/AppButton.vue'

import HandoffLists from './HandoffLists.vue'

/**
 * Comments and agents' work: the document's threads, open or resolved, and what its agents said
 * they worked on. Choosing a thread or a task goes to where it is and, for a thread, opens it.
 */
type Tab = 'open' | 'forYou' | 'resolved' | 'tasks' | 'changes' | 'annotations' | 'dev'

const store = useEditorStore()
const comments = useComments(store)
const inbox = useCommentInbox(store, comments)
const messages = useCommentsMessages()
const tab = ref<Tab>('open')
const tabs: Tab[] = ['open', 'resolved', 'tasks', 'changes', 'forYou', 'annotations', 'dev']

/** For you: the threads with a mention of this person or a reply to them, newest first. */
const forYou = computed(() => {
  const threads: CommentThread[] = []
  for (const { thread } of inbox.notifications.value)
    if (!threads.some((known) => known.id === thread.id)) threads.push(thread)
  return threads
})

const listed = computed(() =>
  tab.value === 'forYou'
    ? forYou.value
    : comments.threads.value.filter((thread) => thread.resolved === (tab.value === 'resolved'))
)
const tasks = computed(() => agentTasks(store.graph).value)
const changes = computed(() => agentChanges(store.graph).value)

function tabLabel(name: Tab): string {
  if (name === 'forYou') return messages.value.forYou
  if (name === 'tasks') return messages.value.tasks
  if (name === 'changes') return messages.value.changes
  if (name === 'annotations') return messages.value.annotations
  if (name === 'dev') return messages.value.statusReady
  return name === 'open' ? messages.value.open : messages.value.resolved
}

function pageName(pageId: string): string {
  return store.graph.getNode(pageId)?.name ?? ''
}

function stateLine(thread: CommentThread): string | null {
  if (!thread.agent || thread.resolved) return null
  return messages.value[thread.agent.state]({ name: thread.agent.name })
}

async function goTo(pageId: string, point: Vector | null) {
  if (store.state.currentPageId !== pageId) await store.switchPage(pageId)
  if (point) store.centerOn(point.x, point.y, Math.max(store.state.zoom, 1))
}

async function reveal(thread: CommentThread) {
  await goTo(thread.anchor.pageId, comments.position(thread))
  comments.open(thread.id)
}

async function revealTask(task: AgentTask) {
  if (task.place) await goTo(task.place.pageId, task.place)
}
</script>

<template>
  <section
    class="flex min-h-0 flex-1 flex-col"
    data-slot="comments-panel"
    :aria-label="messages.title"
  >
    <header class="flex shrink-0 items-center gap-2 px-4 pt-3 pb-2">
      <h3 class="text-[11px] font-semibold text-muted">{{ messages.title }}</h3>
      <span
        v-if="inbox.unread.value.length > 0"
        class="rounded-full bg-error px-1.5 text-[10px] font-semibold text-white"
        data-slot="comments-unread-count"
      >
        {{ messages.unreadCount({ count: inbox.unread.value.length }) }}
      </span>
      <span class="flex-1" />
      <AppButton
        v-if="inbox.unread.value.length > 0"
        size="xs"
        variant="ghost"
        data-slot="comments-mark-all-read"
        @click="inbox.markAllRead()"
      >
        {{ messages.markAllRead }}
      </AppButton>
    </header>
    <div role="tablist" class="flex flex-wrap gap-1 px-3 pb-2">
      <button
        v-for="name in tabs"
        :key="name"
        type="button"
        role="tab"
        class="rounded-md px-2 py-1 text-xs font-medium text-surface/75 hover:bg-hover hover:text-surface data-[active]:bg-panel-selected data-[active]:text-white"
        :aria-selected="tab === name"
        :data-active="tab === name || undefined"
        @click="tab = name"
      >
        {{ tabLabel(name) }}
      </button>
    </div>
    <template v-if="tab === 'changes'">
      <div
        v-if="changes.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-10 text-center"
        data-slot="comments-panel-empty"
      >
        <icon-hugeicons-clock-01 class="size-5 text-surface/60" aria-hidden="true" />
        <p class="max-w-56 text-sm text-surface/75">{{ messages.noChanges }}</p>
      </div>
      <ul v-else class="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-2">
        <li
          v-for="change in changes"
          :key="change.id"
          class="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-hover"
          data-slot="agent-change"
        >
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="truncate text-sm text-surface">
              {{ messages.changeLabel({ name: change.agentName, page: pageName(change.pageId) }) }}
            </span>
            <span class="text-xs text-muted">
              {{ messages.edits({ count: change.edits }) }} ·
              {{
                new Date(change.startedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}
            </span>
          </span>
          <AppButton
            size="xs"
            variant="soft"
            @click="restoreBeforeChange(store, change, messages.restoreUndo)"
          >
            {{ messages.restoreBefore }}
          </AppButton>
        </li>
      </ul>
    </template>
    <HandoffLists v-else-if="tab === 'annotations' || tab === 'dev'" :list="tab" />
    <template v-else-if="tab === 'tasks'">
      <div
        v-if="tasks.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-10 text-center"
        data-slot="comments-panel-empty"
      >
        <icon-hugeicons-ai-magic class="size-5 text-surface/60" aria-hidden="true" />
        <p class="max-w-56 text-sm text-surface/75">{{ messages.noTasks }}</p>
      </div>
      <ul v-else class="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-2">
        <li v-for="task in tasks" :key="task.id">
          <button
            type="button"
            class="flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-hover"
            data-slot="agent-task"
            :data-running="task.endedAt === null || undefined"
            :disabled="!task.place"
            @click="revealTask(task)"
          >
            <span class="flex items-center gap-1 text-xs text-muted">
              <icon-hugeicons-ai-magic class="size-3" />
              <span class="font-medium text-surface">{{ task.agentName }}</span>
              <span class="flex-1" />
              {{ task.endedAt === null ? messages.taskRunning : messages.taskDone }}
            </span>
            <span class="line-clamp-2 text-sm text-surface">{{ task.text }}</span>
          </button>
        </li>
      </ul>
    </template>
    <template v-else>
      <div
        v-if="listed.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-10 text-center"
        data-slot="comments-panel-empty"
      >
        <icon-hugeicons-comment-01 class="size-5 text-surface/60" aria-hidden="true" />
        <p class="max-w-56 text-sm text-surface/75">
          {{
            tab === 'resolved'
              ? messages.emptyResolved
              : tab === 'forYou'
                ? messages.emptyForYou
                : messages.empty
          }}
        </p>
      </div>
      <ul v-else class="flex min-h-0 flex-1 flex-col overflow-y-auto px-1.5 pb-2">
        <li v-for="thread in listed" :key="thread.id">
          <button
            type="button"
            class="flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left hover:bg-hover data-[open]:bg-panel-selected"
            data-slot="comments-panel-thread"
            :data-open="comments.state.value.openThreadId === thread.id || undefined"
            :data-unread="inbox.isUnread(thread) || undefined"
            @click="reveal(thread)"
          >
            <span class="flex items-center gap-1 text-xs text-muted">
              <span
                v-if="inbox.isUnread(thread)"
                class="size-1.5 shrink-0 rounded-full bg-error"
                data-slot="comment-unread-dot"
              >
                <span class="sr-only">{{ messages.unread }}</span>
              </span>
              <span class="font-medium text-surface">{{ thread.messages[0]?.author.name }}</span>
              <span class="flex-1" />
              {{ messages.pageLabel({ page: pageName(thread.anchor.pageId) }) }}
            </span>
            <span class="line-clamp-2 text-sm text-surface">{{ thread.messages[0]?.text }}</span>
            <span
              v-if="stateLine(thread)"
              class="text-xs text-muted"
              :data-state="thread.agent?.state"
            >
              {{ stateLine(thread) }}
            </span>
          </button>
        </li>
      </ul>
    </template>
  </section>
</template>
