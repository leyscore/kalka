<script setup lang="ts">
import { ToastProvider, ToastViewport } from 'reka-ui'

import { useI18n } from '@kalka/vue'

import { toast, toastDuration, type Toast } from '@/app/shell/ui'
import AppToast from '@/components/ui/feedback/AppToast.vue'

const { common, settings } = useI18n()

/** An action, such as Undo, does its work once: the toast offering it then goes. */
function runAction(entry: Toast) {
  toast.remove(entry.id)
  entry.action?.run()
}
</script>

<template>
  <ToastProvider swipe-direction="up">
    <AppToast
      v-for="t in toast.toasts.value"
      :key="t.id"
      :message="t.message"
      :variant="t.variant"
      :count="t.count"
      :progress="t.progress"
      :progress-label="t.progressLabel"
      :action-label="t.action?.label"
      :duration="toastDuration(t)"
      :copyable="t.variant !== 'default'"
      :copy-label="common.copyMessage"
      :copied-label="common.copiedExclamation"
      :close-label="common.close"
      @close="toast.remove(t.id)"
      @action="runAction(t)"
    />
    <ToastViewport
      :label="`${settings.notifications} (F8)`"
      class="fixed top-2 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-1.5"
    />
  </ToastProvider>
</template>
