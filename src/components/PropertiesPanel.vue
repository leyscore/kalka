<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed } from 'vue'

import { useI18n } from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { propertiesTabs } from '@/theme/panel/properties-tabs'

import DesignPanel from './DesignPanel.vue'

const { activeTab } = useAIChat()
const { panels } = useI18n()
/**
 * The right panel is Design alone: code and the design check open in the left panel, the agent
 * above the toolbar. Its tab is the way back from any of them, so it is always the active one.
 */
const rightTab = computed({
  get: () => 'design',
  set: () => {
    activeTab.value = 'design'
  }
})

const tabStyles = propertiesTabs()
</script>

<template>
  <aside
    data-test-id="properties-panel"
    class="flex min-w-0 flex-1 flex-col overflow-hidden"
    style="contain: paint layout style"
  >
    <TabsRoot v-model="rightTab" class="flex min-h-0 flex-1 flex-col">
      <TabsList :class="tabStyles.list()">
        <TabsTrigger
          value="design"
          data-test-id="properties-tab-design"
          :class="tabStyles.trigger()"
          @click="activeTab = 'design'"
        >
          {{ panels.design }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="design" class="flex min-h-0 flex-1 flex-col" :force-mount="true">
        <DesignPanel />
      </TabsContent>
    </TabsRoot>
  </aside>
</template>
