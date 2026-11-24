<script setup lang="ts">
import { useFocus } from '@vueuse/core'
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem
} from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, nextTick, ref, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import { AppConfirmationDialog } from '@/components/ui/dialog'
import { menuItem, useMenuUI } from '@/components/ui/menu/menu'
import Tip from '@/components/ui/overlay/Tip.vue'
import iconButtonTheme from '@/theme/button/icon-button'
import { chatHistoryTheme } from '@/theme/chat/history'
import { chatSkyTheme } from '@/theme/chat/sky'

const {
  conversations,
  selectedId,
  disabled = false,
  saved = false
} = defineProps<{
  conversations: { id: string; title: string; documentName: string; available: boolean }[]
  selectedId?: string
  disabled?: boolean
  saved?: boolean
}>()
const emit = defineEmits<{
  select: [id: string]
  create: []
  rename: [id: string, title: string]
  saveTrace: [id: string]
  delete: [id: string]
}>()
const { ai } = useI18n()
/** The few stars and dotted clouds of the sky, kept to the right so nothing moves behind the agent's tile. */
const SKY_STARS = [
  { id: 'a', right: '18px', top: '46px', size: '9px', duration: '3.2s', delay: '0s' },
  { id: 'b', right: '58px', top: '70px', size: '5px', duration: '2.6s', delay: '0.7s' },
  { id: 'c', right: '96px', top: '50px', size: '6px', duration: '3.8s', delay: '1.3s' },
  { id: 'd', right: '38px', top: '84px', size: '4px', duration: '2.9s', delay: '0.4s' }
] as const
const SKY_CLOUDS = [
  { id: 'a', right: '64px', top: '58px', width: '34px' },
  { id: 'b', right: '12px', top: '78px', width: '22px' }
] as const
const triggerClass = tv(iconButtonTheme)({ size: 'sm' })
const styles = chatHistoryTheme()
const sky = chatSkyTheme()
const menu = useMenuUI({ content: 'min-w-44' })
const item = menuItem({ justify: 'start' })
const open = ref(false)
const all = ref(false)
const query = ref('')
const editing = ref(false)
const confirming = ref(false)
const title = ref('')
const titleInput = ref<HTMLInputElement>()
const { focused } = useFocus(titleInput)
const selected = computed(() => conversations.find((chat) => chat.id === selectedId))
const results = computed(() =>
  conversations.filter(
    (chat) =>
      (all.value || chat.available) &&
      `${chat.title} ${chat.documentName}`
        .toLocaleLowerCase()
        .includes(query.value.trim().toLocaleLowerCase())
  )
)
watch(
  () => selectedId,
  () => {
    editing.value = false
    confirming.value = false
  }
)
function choose(id: string) {
  open.value = false
  emit('select', id)
}
async function rename() {
  confirming.value = false
  title.value = selected.value?.title ?? ''
  editing.value = true
  await nextTick()
  focused.value = true
  titleInput.value?.select()
}
function confirmDelete() {
  editing.value = false
  confirming.value = true
}
function remove() {
  if (selectedId) emit('delete', selectedId)
  confirming.value = false
}
function save() {
  if (selectedId && title.value.trim()) emit('rename', selectedId, title.value)
  editing.value = false
}
function closeMenu(event: Event) {
  if (editing.value) event.preventDefault()
}
</script>

<template>
  <div :class="styles.root()">
    <div v-if="$slots.default" aria-hidden="true" :class="sky.decor()">
      <span
        v-for="star in SKY_STARS"
        :key="star.id"
        :class="sky.star()"
        :style="{
          right: star.right,
          top: star.top,
          width: star.size,
          height: star.size,
          '--glow-duration': star.duration,
          '--glow-delay': star.delay
        }"
      />
      <span
        v-for="cloud in SKY_CLOUDS"
        :key="cloud.id"
        :class="sky.cloud()"
        :style="{ right: cloud.right, top: cloud.top, width: cloud.width }"
      />
    </div>
    <div :class="styles.header()">
      <PopoverRoot v-model:open="open">
        <PopoverTrigger :class="styles.trigger()" :disabled="disabled" :aria-label="ai.chatHistory">
          <span :class="styles.title()">{{ selected?.title || ai.newChat }}</span>
          <icon-hugeicons-chevron-down :class="styles.icon()" />
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            align="start"
            :side-offset="6"
            :class="styles.content()"
            :aria-label="ai.chatHistory"
          >
            <input
              v-model="query"
              :aria-label="ai.searchChats"
              :placeholder="ai.searchChats"
              :class="styles.input()"
            />
            <div :class="styles.scope()" role="group" :aria-label="ai.chatScope">
              <button
                :class="styles.scopeButton()"
                :data-active="!all"
                :aria-pressed="!all"
                @click="all = false"
              >
                {{ ai.thisDocument }}
              </button>
              <button
                :class="styles.scopeButton()"
                :data-active="all"
                :aria-pressed="all"
                @click="all = true"
              >
                {{ ai.allDocuments }}
              </button>
            </div>
            <div :class="styles.list()">
              <button
                v-for="chat in results"
                :key="chat.id"
                :class="styles.row()"
                :data-selected="chat.id === selectedId"
                :aria-current="chat.id === selectedId ? 'true' : undefined"
                :disabled="disabled"
                @click="choose(chat.id)"
              >
                <span :class="styles.title()"
                  ><span :class="styles.label()">{{ chat.title || ai.newChat }}</span
                  ><span v-if="all" :class="styles.detail()">{{ chat.documentName }}</span></span
                >
                <icon-hugeicons-check v-if="chat.id === selectedId" :class="styles.icon()" />
              </button>
              <p v-if="!results.length" :class="styles.empty()">{{ ai.noChatsFound }}</p>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
      <slot name="actions" />
      <IconButton :label="ai.newChat" :disabled="disabled" size="sm" @click="emit('create')"
        ><icon-hugeicons-plus :class="styles.icon()"
      /></IconButton>
      <DropdownMenuRoot v-if="saved">
        <Tip :label="ai.chatActions">
          <DropdownMenuTrigger
            :class="triggerClass"
            :aria-label="ai.chatActions"
            :disabled="disabled"
          >
            <icon-hugeicons-ellipsis :class="styles.icon()" />
          </DropdownMenuTrigger>
        </Tip>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="end"
            :side-offset="6"
            :class="menu.content"
            @close-auto-focus="closeMenu"
          >
            <DropdownMenuItem :class="item" @select="rename">{{ ai.renameChat }}</DropdownMenuItem>
            <DropdownMenuItem :class="item" @select="selectedId && emit('saveTrace', selectedId)">{{
              ai.saveChatTrace
            }}</DropdownMenuItem>
            <DropdownMenuItem :class="item" @select="confirmDelete">{{
              ai.deleteChat
            }}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>
    <slot />
    <form
      v-if="editing"
      :class="styles.form()"
      @submit.prevent="save"
      @keydown.esc.stop="editing = false"
    >
      <input ref="titleInput" v-model="title" :aria-label="ai.chatTitle" :class="styles.input()" />
      <div :class="styles.actions()">
        <AppButton size="xs" @click="editing = false">{{ ai.cancelChatAction }}</AppButton
        ><AppButton size="xs" type="submit" :disabled="disabled || !title.trim()">{{
          ai.saveChatTitle
        }}</AppButton>
      </div>
    </form>
    <AppConfirmationDialog
      v-model:open="confirming"
      :heading="ai.deleteChatConfirmation"
      :description="ai.deleteChatDescription({ title: selected?.title ?? '' })"
      :cancel-label="ai.cancelChatAction"
      :confirm-label="ai.deleteChat"
      tone="danger"
      :confirm-disabled="disabled"
      @confirm="remove"
    />
  </div>
</template>
