<script setup lang="ts">
import ColorPicker from '@/components/ColorPicker.vue'
import { useEditorStore } from '@/stores/editor'
import { colorToHexRaw, parseColor } from '@/engine/color'

import type { Color } from '@/types'

const store = useEditorStore()

function updateColor(color: Color) {
  store.state.pageColor = color
  store.requestRender()
}

function updateHex(hex: string) {
  const color = parseColor(hex.startsWith('#') ? hex : `#${hex}`)
  if (!color) return
  updateColor(color)
}
</script>

<template>
  <div class="border-b border-border px-3 py-2">
    <label class="mb-1.5 block text-[11px] text-muted">Page</label>
    <div class="flex items-center gap-1.5">
      <ColorPicker :color="store.state.pageColor" @update="updateColor" />
      <input
        class="min-w-0 flex-1 border-none bg-transparent font-mono text-xs text-surface outline-none"
        :value="colorToHexRaw(store.state.pageColor)"
        @change="updateHex(($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
