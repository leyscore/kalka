<script setup lang="ts">
import { LayoutControlsRoot, useI18n } from '@open-pencil/vue'

import AutoLayoutControls from '@/components/properties/LayoutSection/AutoLayoutControls.vue'
import ClipContentControl from '@/components/properties/LayoutSection/ClipContentControl.vue'
import FlexControls from '@/components/properties/LayoutSection/FlexControls.vue'
import GridControls from '@/components/properties/LayoutSection/GridControls.vue'
import IconButton from '@/components/ui/IconButton.vue'
import PaddingControls from '@/components/properties/LayoutSection/PaddingControls.vue'
import SizeControls from '@/components/properties/LayoutSection/size/SizeControls.vue'
import TextResizingControl from '@/components/properties/LayoutSection/TextResizingControl.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'

const { panels } = useI18n()

const CONTAINER_TYPES = ['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE']
</script>

<template>
  <LayoutControlsRoot v-slot="ctx">
    <template v-if="ctx.node">
      <PanelSection :label="ctx.node.layoutMode === 'NONE' ? panels.layout : panels.autoLayout">
        <template v-if="CONTAINER_TYPES.includes(ctx.node.type)" #actions>
          <IconButton
            v-if="ctx.node.layoutMode === 'NONE'"
            :label="panels.addAutoLayout"
            @click="ctx.editor.setLayoutMode(ctx.node.id, 'VERTICAL')"
          >
            <icon-lucide-plus class="size-3.5" />
          </IconButton>
          <IconButton
            v-else
            :label="panels.removeAutoLayout"
            @click="ctx.editor.setLayoutMode(ctx.node.id, 'NONE')"
          >
            <icon-lucide-minus class="size-3.5" />
          </IconButton>
        </template>

        <AutoLayoutControls v-if="CONTAINER_TYPES.includes(ctx.node.type)" />
        <TextResizingControl v-if="ctx.node.type === 'TEXT'" />
        <SizeControls />

        <template v-if="CONTAINER_TYPES.includes(ctx.node.type) && ctx.node.layoutMode !== 'NONE'">
          <FlexControls v-if="ctx.isFlex" />
          <template v-if="ctx.isGrid">
            <GridControls />
            <PaddingControls />
            <ClipContentControl />
          </template>
        </template>
      </PanelSection>
    </template>
  </LayoutControlsRoot>
</template>
