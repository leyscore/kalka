<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, defineAsyncComponent, useTemplateRef } from 'vue'

import { useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { latch } from '@/app/shell/latch'
import { useGlide } from '@/components/ui/motion/useGlide'
import { glidePills } from '@/theme/motion/glide'
import { propertiesTabs } from '@/theme/panel/properties-tabs'

import DesignPanel from './DesignPanel.vue'
import ZoomDropdown from './editor/ZoomDropdown.vue'

// The chat, its model SDKs and markdown load when the AI tab first opens, then stay mounted.
const ChatPanel = defineAsyncComponent(() => import('./ChatPanel.vue'))
const { activeTab } = useAIChat()
const chatUsed = latch(() => activeTab.value === 'ai')
const { panels } = useI18n()
// Code and the design check live in the left panel; while one is open, this panel stays on Design.
const rightTab = computed({
  get: () => (activeTab.value === 'ai' ? 'ai' : 'design'),
  set: (tab: string) => {
    activeTab.value = tab === 'ai' ? 'ai' : 'design'
  }
})

const tabStyles = propertiesTabs()

const tabList = useTemplateRef<{ $el: HTMLElement }>('tabList')
const tabListElement = computed(() => tabList.value?.$el ?? null)
useGlide(tabListElement, {
  items: '[role="tab"]',
  active: '[role="tab"][data-state="active"]',
  pillClass: glidePills.active
})
useGlide(tabListElement, { items: '[role="tab"]', hover: true, pillClass: glidePills.hover })
</script>

<template>
  <aside
    data-test-id="properties-panel"
    class="flex min-w-0 flex-1 flex-col overflow-hidden"
    style="contain: paint layout style"
  >
    <TabsRoot v-model="rightTab" class="flex min-h-0 flex-1 flex-col">
      <TabsList ref="tabList" :class="tabStyles.list()">
        <TabsTrigger
          value="design"
          data-test-id="properties-tab-design"
          :class="tabStyles.trigger()"
        >
          {{ panels.design }}
        </TabsTrigger>
        <TabsTrigger value="ai" data-test-id="properties-tab-ai" :class="tabStyles.trigger()">
          <icon-lucide-bot :class="tabStyles.icon()" aria-hidden="true" />
          <span :class="tabStyles.label()">{{ panels.ai }}</span>
        </TabsTrigger>
        <ZoomDropdown v-if="activeTab !== 'ai'" />
      </TabsList>

      <TabsContent
        value="design"
        class="flex min-h-0 flex-1 flex-col"
        :force-mount="true"
        :hidden="activeTab === 'ai'"
      >
        <DesignPanel />
      </TabsContent>

      <TabsContent
        value="ai"
        class="flex min-h-0 flex-1 flex-col"
        :force-mount="true"
        :hidden="activeTab !== 'ai'"
      >
        <ChatPanel v-if="chatUsed" />
      </TabsContent>
    </TabsRoot>
  </aside>
</template>
