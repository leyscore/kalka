<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { canPickScreenColor, pickScreenColor } from '@/app/editor/color/eyedropper'
import { useColorPickerPanelContext } from '@/components/color-picker-panel/context'
import HsbFields from '@/components/color-picker-panel/HsbFields.vue'
import HslFields from '@/components/color-picker-panel/HslFields.vue'
import OkhclFields from '@/components/color-picker-panel/OkhclFields.vue'
import RGBFields from '@/components/color-picker-panel/RGBFields.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'

const ctx = useColorPickerPanelContext()
const { menu } = useI18n()
/** Figma's eyedropper beside the format: browsers without the EyeDropper API leave it out. */
const canPick = canPickScreenColor()

/** The picked colour keeps the alpha the colour had. */
async function pick() {
  const picked = await pickScreenColor()
  if (picked) ctx.update({ ...picked, a: ctx.color.a })
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-1">
      <IconButton
        v-if="canPick"
        :label="menu.pickColor"
        data-test-id="color-eyedropper"
        @click="pick"
      >
        <icon-hugeicons-color-picker class="size-3.5" />
      </IconButton>
      <AppSelect
        class="w-[120px]"
        data-test-id="color-format-select"
        :model-value="ctx.fieldFormat"
        :options="ctx.fieldOptions"
        @update:model-value="ctx.setFieldFormat"
      />
    </div>

    <div class="min-w-0 flex flex-col gap-2">
      <RGBFields v-if="ctx.fieldFormat === 'rgb'" />
      <HslFields v-else-if="ctx.fieldFormat === 'hsl'" />
      <HsbFields v-else-if="ctx.fieldFormat === 'hsb'" />
      <OkhclFields v-else />
    </div>
  </div>
</template>
