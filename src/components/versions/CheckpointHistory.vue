<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { checkpointTime } from '@/app/document/versions/checkpoints/use'
import {
  useDeviceHistory,
  useServerHistory,
  type HistoryVersion
} from '@/app/document/versions/history-source'
import { useNamedVersionFocus } from '@/app/document/versions/save-request'
import { useEditorStore } from '@/app/editor/active-store'
import { toast } from '@/app/shell/ui'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import { versionTimeline } from '@/theme/panel/folder'

/**
 * The version history of a document Git does not keep: versions kept while it is edited and
 * versions named here, each with a preview to look at first and a restore. A server file's are
 * the server's, shared by everyone who can open it; any other file's are kept on this device.
 */
const { serverRoomId = null } = defineProps<{ serverRoomId?: string | null }>()
const { panels } = useI18n()
const store = useEditorStore()
const source = serverRoomId ? useServerHistory(store, () => serverRoomId) : useDeviceHistory(store)
const { list } = source
const timeline = versionTimeline()
const name = ref('')
const busy = ref<string | null>(null)
const error = ref('')
useNamedVersionFocus(useTemplateRef<HTMLElement>('nameForm'))

async function act(id: string, action: () => Promise<unknown>) {
  if (busy.value) return
  busy.value = id
  error.value = ''
  try {
    await action()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    busy.value = null
  }
}

function saveNamed() {
  const label = name.value.trim()
  if (!label) return
  void act('name', async () => {
    await source.save(label)
    name.value = ''
  })
}

function title(version: HistoryVersion): string {
  if (version.kind !== 'auto' && version.label) return version.label
  return panels.value.versionsAutoSaved
}

function detail(version: HistoryVersion): string {
  const time = checkpointTime(version)
  return version.by ? panels.value.versionsBy({ time, name: version.by }) : time
}

function preview(version: HistoryVersion) {
  const time = checkpointTime(version)
  void act(version.id, () =>
    source.preview(
      version,
      `${store.state.documentName} (${panels.value.versionsPreviewing({ time })})`
    )
  )
}

function restore(version: HistoryVersion) {
  const time = checkpointTime(version)
  void act(version.id, async () => {
    await source.restore(version, panels.value.versionsBeforeRestoreAt({ time }))
    toast.info(panels.value.versionsRestoredAt({ time }))
  })
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col" data-test-id="checkpoint-history">
    <h3 class="px-4 pt-2 pb-1 text-[11px] font-semibold text-muted">{{ panels.versionsAuto }}</h3>
    <p class="px-4 pb-2 text-[11px] leading-relaxed text-muted">
      {{ source.where === 'server' ? panels.versionsServerHint : panels.versionsAutoHint }}
    </p>
    <form
      v-if="!store.state.viewOnly"
      ref="nameForm"
      class="flex gap-2 px-4 pb-3"
      @submit.prevent="saveNamed"
    >
      <AppInput
        v-model="name"
        tone="panel"
        class="min-w-0 flex-1"
        :aria-label="panels.versionsNameLabel"
        :placeholder="panels.versionsNameLabel"
        data-test-id="checkpoint-name"
      />
      <AppButton
        type="submit"
        size="sm"
        variant="outline"
        :disabled="!name.trim()"
        :loading="busy === 'name'"
        data-test-id="checkpoint-save"
      >
        {{ panels.versionsNameSave }}
      </AppButton>
    </form>
    <ol v-if="list.length" :class="timeline.list()" class="overflow-y-auto">
      <li
        v-for="(checkpoint, index) in list"
        :key="checkpoint.id"
        :class="timeline.item()"
        class="group"
        data-slot="checkpoint"
        :data-kind="checkpoint.kind"
      >
        <span :class="timeline.point()" :data-latest="index === 0 || undefined" />
        <div class="flex items-start gap-1">
          <div class="min-w-0 flex-1">
            <p
              :class="timeline.subject()"
              class="data-[kind=named]:font-semibold"
              :data-kind="checkpoint.kind"
            >
              {{ title(checkpoint) }}
            </p>
            <p :class="timeline.detail()">{{ detail(checkpoint) }}</p>
          </div>
          <AppButton
            size="xs"
            variant="ghost"
            class="shrink-0"
            data-test-id="checkpoint-preview"
            :disabled="busy !== null"
            @click="preview(checkpoint)"
          >
            {{ panels.versionsPreview }}
          </AppButton>
          <AppButton
            v-if="!store.state.viewOnly"
            size="xs"
            variant="ghost"
            class="shrink-0"
            data-test-id="checkpoint-restore"
            :disabled="busy !== null"
            :loading="busy === checkpoint.id"
            @click="restore(checkpoint)"
          >
            {{ panels.versionsRestore }}
          </AppButton>
        </div>
      </li>
    </ol>
    <p v-else class="px-4 pb-4 text-xs text-muted">{{ panels.versionsAutoNone }}</p>
    <AppAlert v-if="error" tone="error" :heading="error" class="mx-4 mb-3" />
  </section>
</template>
