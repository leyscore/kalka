<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { tv } from 'tailwind-variants'
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

import { useI18n } from '@kalka/vue'

import { startBlank } from '@/app/home/start'
import { animationsEnabled } from '@/app/shell/motion'
import { useTabsStore, showNewTab } from '@/app/tabs'
import { leaveTabRow, takeTabRowHandoff } from '@/app/tabs/placement'
import PreparationIndicator from '@/components/preparation/tab/Indicator.vue'
import { useScrollOverflow } from '@/components/shell/useScrollOverflow'
import TabWindowMenu from '@/components/tab-bar/TabWindowMenu.vue'
import Tip from '@/components/ui/overlay/Tip.vue'
import { IS_TAURI } from '@/constants'
import tabBarTheme from '@/theme/tab-bar'

const { embedded = false, renaming = false } = defineProps<{
  /** Inside the editor's top bar, which sets the height and the padding. */
  embedded?: boolean
  /** The active design is being renamed: its tab shows the `rename` slot instead of its name. */
  renaming?: boolean
}>()
const emit = defineEmits<{ rename: [] }>()
defineSlots<{ rename?: () => unknown }>()

const { files } = useI18n()

const { tabs, activeTabId, switchTab, closeTab } = useTabsStore()
const tabBarStyles = tv(tabBarTheme)
const baseStyles = computed(() => tabBarStyles({ embedded }))

// The bar is always there, in the browser as in the desktop app, where it is the window's title
// bar. It opens on the Dashboard, which stays in place; the tabs beside it are the open designs.
const documentTabs = computed(() => tabs.value.filter((tab) => !tab.isHome))
const onDashboard = computed(() => tabs.value.some((tab) => tab.isHome && tab.isActive))

const scroller = useTemplateRef<HTMLElement>('scroller')
const { overflowing, overflowStart, overflowEnd, scrollTowardHidden } = useScrollOverflow(scroller)

// Keep the active tab in view when it opens, when another one is chosen, and when the row starts
// or stops overflowing, since the chevron that appears then narrows the visible row. Scrolling alone
// never triggers it. A new design is active a tick before its tab joins the row, hence the wait.
watch(
  [activeTabId, overflowing],
  async () => {
    await nextTick()
    scroller.value?.querySelector('[data-slot="tab-item"][data-active]')?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: animationsEnabled.value ? 'smooth' : 'auto'
    })
  },
  { flush: 'post' }
)

// In the editor's top bar the row is rebuilt with each design. It picks up where the last one
// stood, so arrow keys keep moving through the tabs and the row does not jump back to its start.
onBeforeUnmount(() => {
  const row = scroller.value
  if (!embedded || !row) return
  leaveTabRow({ scrollLeft: row.scrollLeft, focused: row.contains(document.activeElement) })
})
onMounted(() => {
  const row = scroller.value
  const last = embedded ? takeTabRowHandoff() : null
  if (!row || !last) return
  row.scrollLeft = last.scrollLeft
  const active = row.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
  if (last.focused) active?.focus({ preventScroll: true })
  active?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
})

const modelValue = computed({
  get: () => activeTabId.value,
  set: (id: string) => switchTab(id)
})

function createDesign(event: MouseEvent): void {
  event.preventDefault()
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur()
  startBlank()
}

function onMiddleClick(e: MouseEvent, tabId: string) {
  if (e.button === 1) {
    e.preventDefault()
    void closeTab(tabId)
  }
}

function onClose(e: MouseEvent, tabId: string) {
  e.stopPropagation()
  void closeTab(tabId)
}
</script>

<template>
  <TabsRoot
    v-model="modelValue"
    data-slot="tab-bar"
    :data-title-bar="(IS_TAURI && !embedded) || undefined"
    activation-mode="automatic"
    :class="baseStyles.root()"
  >
    <button
      type="button"
      data-test-id="tabbar-dashboard"
      :class="baseStyles.dashboard()"
      :data-active="onDashboard || undefined"
      :aria-current="onDashboard ? 'page' : undefined"
      @click="showNewTab()"
    >
      <icon-hugeicons-dashboard-square-01 :class="baseStyles.icon()" aria-hidden="true" />
      <span>{{ files.dashboard }}</span>
    </button>
    <div
      ref="scroller"
      :class="baseStyles.scroller()"
      :data-overflow-start="overflowStart || undefined"
      :data-overflow-end="overflowEnd || undefined"
    >
      <TabsList :class="baseStyles.list()">
        <TabWindowMenu v-for="tab in documentTabs" :key="tab.id" :tab-id="tab.id">
          <div
            data-slot="tab-item"
            :data-active="tab.isActive || undefined"
            :class="tabBarStyles({ active: tab.isActive }).item()"
            @mousedown="onMiddleClick($event, tab.id)"
          >
            <div v-if="tab.isActive && renaming" class="flex h-full min-w-0 items-center ps-2">
              <slot name="rename" />
            </div>
            <TabsTrigger
              v-else
              :value="tab.id"
              data-test-id="tabbar-tab"
              :class="tabBarStyles({ active: tab.isActive }).trigger()"
              :data-active="tab.isActive || undefined"
              :data-dirty="tab.isDirty || undefined"
              @dblclick="tab.isActive && emit('rename')"
            >
              <PreparationIndicator v-if="tab.isPreparing" :progress="tab.preparationProgress" />
              <span :class="baseStyles.label()">{{ tab.name }}</span>
              <Tip v-if="tab.isDirty" :label="files.unsavedChanges" side="bottom">
                <span
                  role="img"
                  :aria-label="files.unsavedChanges"
                  :class="baseStyles.dirtyDot()"
                />
              </Tip>
            </TabsTrigger>
            <Tip :label="files.closeTab({ name: tab.name })" side="bottom">
              <button
                type="button"
                data-test-id="tabbar-close"
                :class="tabBarStyles({ active: tab.isActive }).close()"
                :data-active="tab.isActive || undefined"
                :aria-label="files.closeTab({ name: tab.name })"
                tabindex="-1"
                @click="onClose($event, tab.id)"
              >
                <icon-hugeicons-x :class="baseStyles.closeIcon()" />
              </button>
            </Tip>
          </div>
        </TabWindowMenu>
      </TabsList>
    </div>
    <!-- Sits beside the hidden tabs; it keeps its width when it switches sides, so the overflow never flips back.
         Pointer affordance only: arrow keys move between tabs and the active tab scrolls into view. -->
    <button
      v-if="overflowStart || overflowEnd"
      type="button"
      tabindex="-1"
      aria-hidden="true"
      data-test-id="tabbar-scroll"
      :class="baseStyles.scroll()"
      :data-start="!overflowEnd || undefined"
      @click="scrollTowardHidden"
    >
      <icon-hugeicons-chevron-right v-if="overflowEnd" :class="baseStyles.scrollIcon()" />
      <icon-hugeicons-chevron-left v-else :class="baseStyles.scrollIcon()" />
    </button>
    <Tip :label="files.newDesign" side="bottom">
      <button
        type="button"
        data-test-id="tabbar-new"
        :aria-label="files.newDesign"
        :class="baseStyles.newTab()"
        @click="createDesign"
      >
        <icon-hugeicons-plus :class="baseStyles.newIcon()" />
      </button>
    </Tip>
  </TabsRoot>
</template>
