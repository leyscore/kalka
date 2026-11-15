<script setup lang="ts">
import DesignPanel from './DesignPanel.vue'
</script>

<template>
  <!-- Design alone: code and the design check open in the left panel, the agent above the toolbar. -->
  <aside
    data-test-id="properties-panel"
    class="flex min-w-0 flex-1 flex-col overflow-hidden"
    style="contain: paint layout style"
  >
    <DesignPanel />
  </aside>
</template>
