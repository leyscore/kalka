<script setup lang="ts">
import { computed } from 'vue'

import { usePrototypeMessages } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import PrototypePanel from '@/components/prototype/PrototypePanel.vue'
import AppTabsList from '@/components/ui/tabs/AppTabsList.vue'
import AppTabsRoot from '@/components/ui/tabs/AppTabsRoot.vue'
import AppTabsTrigger from '@/components/ui/tabs/AppTabsTrigger.vue'

import DesignPanel from './DesignPanel.vue'

const store = useEditorStore()
const m = usePrototypeMessages()
/** Design or Prototype, as Figma's tabs; the canvas draws connections while Prototype shows. */
const tab = computed({
  get: () => (store.state.prototyping ? 'prototype' : 'design'),
  set: (value: string) => store.setPrototyping(value === 'prototype')
})
</script>

<template>
  <!-- Code and the design check open in the left panel, the agent above the toolbar. -->
  <aside
    data-test-id="properties-panel"
    class="flex min-w-0 flex-1 flex-col overflow-hidden"
    style="contain: paint layout style"
  >
    <AppTabsRoot v-model="tab" class="flex-none border-b border-hairline">
      <AppTabsList :label="m.prototypeTab">
        <AppTabsTrigger value="design" data-test-id="properties-tab-design">
          {{ m.design }}
        </AppTabsTrigger>
        <AppTabsTrigger value="prototype" data-test-id="properties-tab-prototype">
          {{ m.prototypeTab }}
        </AppTabsTrigger>
      </AppTabsList>
    </AppTabsRoot>
    <PrototypePanel v-if="tab === 'prototype'" />
    <DesignPanel v-else />
  </aside>
</template>
