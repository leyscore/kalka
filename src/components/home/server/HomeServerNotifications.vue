<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { computed, onMounted, ref } from 'vue'

import { useI18n } from '@kalka/vue'

import { openServerDocumentById } from '@/app/collab/server/documents'
import {
  readServerNotifications,
  refreshServerNotifications,
  serverNotifications,
  serverUnreadNotifications,
  type ServerNotification
} from '@/app/collab/server/notifications'
import { revealCommentThread } from '@/app/comments/service'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import { usePopoverUI } from '@/components/ui/overlay/popover'

/**
 * The bell by the server's files, as Figma's: mentions of this person and replies to their
 * comments, in every file on the server. Opening one opens its file at the thread and marks it
 * read.
 */
const { collaboration, locale } = useI18n()
const cls = usePopoverUI({ content: 'z-50 flex w-80 flex-col gap-1 p-2' })
const open = ref(false)

const label = computed(() =>
  serverUnreadNotifications.value > 0
    ? collaboration.value.serverNotificationsUnread({ count: serverUnreadNotifications.value })
    : collaboration.value.serverNotifications
)

async function refresh() {
  try {
    await refreshServerNotifications()
  } catch (error) {
    // Signed out or unreachable: the files list says so; the console keeps the reason.
    console.warn('[Kalka server] Could not load notifications', error)
  }
}

onMounted(refresh)
useIntervalFn(refresh, 60_000)

function title(notification: ServerNotification): string {
  const params = { name: notification.from, file: notification.documentName }
  return notification.reason === 'mention'
    ? collaboration.value.serverNotificationMention(params)
    : collaboration.value.serverNotificationReply(params)
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }

function openNotification(notification: ServerNotification) {
  open.value = false
  const session = openServerDocumentById(notification.documentId, notification.documentName)
  if (session) void revealCommentThread(session.store, notification.threadId)
  if (!notification.read) void readServerNotifications([notification.id]).catch(() => undefined)
}

function readAll() {
  void readServerNotifications().catch(() => undefined)
}
</script>

<template>
  <PopoverRoot v-model:open="open" @update:open="(next) => next && refresh()">
    <PopoverTrigger as-child>
      <IconButton
        :label="label"
        class="relative size-10 sm:size-8"
        data-test-id="home-notifications"
      >
        <icon-hugeicons-notification-02 class="size-3.5" />
        <span
          v-if="serverUnreadNotifications > 0"
          class="absolute top-1 right-1 size-2 rounded-full bg-accent"
          aria-hidden="true"
        />
      </IconButton>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :class="cls.content"
        :side-offset="8"
        align="end"
        data-test-id="home-notifications-popover"
      >
        <div class="flex items-center justify-between gap-2 px-2 pt-1 pb-1">
          <p class="text-xs font-medium text-surface">{{ collaboration.serverNotifications }}</p>
          <AppButton
            v-if="serverUnreadNotifications > 0"
            variant="ghost"
            size="sm"
            data-test-id="home-notifications-read-all"
            @click="readAll"
          >
            {{ collaboration.serverNotificationsReadAll }}
          </AppButton>
        </div>
        <p v-if="!serverNotifications.length" class="px-2 pb-2 text-xs text-muted">
          {{ collaboration.serverNotificationsEmpty }}
        </p>
        <ul v-else class="flex max-h-96 flex-col overflow-y-auto">
          <li v-for="notification in serverNotifications" :key="notification.id">
            <button
              type="button"
              class="flex w-full flex-col gap-0.5 rounded-lg px-2 py-1.5 text-left hover:bg-hover focus-visible:bg-hover"
              data-test-id="home-notification"
              @click="openNotification(notification)"
            >
              <span class="flex items-center gap-1.5 text-xs text-surface">
                <span
                  v-if="!notification.read"
                  class="size-1.5 shrink-0 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span :class="notification.read ? '' : 'font-medium'">{{
                  title(notification)
                }}</span>
              </span>
              <span class="line-clamp-2 text-xs text-muted">{{ notification.excerpt }}</span>
              <span class="text-[11px] text-muted">
                {{ new Date(notification.createdAt).toLocaleString(locale, DATE_FORMAT) }}
              </span>
            </button>
          </li>
        </ul>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
