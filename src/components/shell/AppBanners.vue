<script setup lang="ts">
import ColorSpaceBanner from '@/components/canvas/ColorSpaceBanner.vue'
import FileApiBanner from '@/components/FileApiBanner.vue'
</script>

<!-- What the app has to say about the browser or the open document, in a strip under its top bar.
     Font notices float over the canvas instead (`EditorWorkspace`), so they never move the UI. -->
<template>
  <FileApiBanner />
  <ColorSpaceBanner />
</template>
