import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ToolbarRoot } from 'reka-ui'
import { ref } from 'vue'
import IconMousePointer from '~icons/hugeicons/cursor-02'
import IconSquare from '~icons/hugeicons/square'
import IconType from '~icons/hugeicons/type'

import ToolButton from './ToolButton.vue'

const meta = {
  title: 'App/Editor/Toolbar',
  render: () => ({
    components: { ToolbarRoot, ToolButton },
    setup: () => ({
      selected: ref('move'),
      tools: [
        { value: 'move', label: 'Move', icon: IconMousePointer },
        { value: 'rectangle', label: 'Rectangle', icon: IconSquare },
        { value: 'text', label: 'Text', icon: IconType }
      ]
    }),
    template: `<ToolbarRoot aria-label="Design tools" class="flex w-fit gap-0.5 rounded-xl bg-panel p-1">
      <ToolButton v-for="tool in tools" :key="tool.value" :label="tool.label" :icon="tool.icon" :active="selected === tool.value" @click="selected = tool.value" />
    </ToolbarRoot>`
  })
} satisfies Meta
export default meta
export const Default: StoryObj<typeof meta> = {}
