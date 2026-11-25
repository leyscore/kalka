<script setup lang="ts">
import ColorSpaceBanner from '@/components/canvas/ColorSpaceBanner.vue'
import FileApiBanner from '@/components/FileApiBanner.vue'
import FontStatusBanner from '@/components/font-status/FontStatusBanner.vue'
</script>

<!-- What the app has to say about the browser or the open document, in a strip under its top bar. -->
<template>
  <FileApiBanner />
  <ColorSpaceBanner />
  <FontStatusBanner />
</template>
