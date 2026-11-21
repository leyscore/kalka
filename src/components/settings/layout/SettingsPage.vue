<script setup lang="ts">
import { AppDialogBody, AppDialogFooter } from '@/components/ui/dialog'
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" data-slot="settings-page">
    <AppDialogBody :ui="{ body: 'p-5 sm:p-6' }">
      <!-- A row's label and its control stay within reach of each other on a wide window. -->
      <div class="w-full max-w-[780px]"><slot /></div>
    </AppDialogBody>
    <AppDialogFooter v-if="$slots.footer">
      <slot name="footer" />
    </AppDialogFooter>
  </div>
</template>
