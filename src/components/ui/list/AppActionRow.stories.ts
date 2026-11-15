import type { Meta, StoryObj } from '@storybook/vue3-vite'
import IconChevronRight from '~icons/hugeicons/chevron-right'
import IconPlug from '~icons/hugeicons/plug'

import AppActionRow from './AppActionRow.vue'

const meta = {
  title: 'Design System/Lists/Action Row',
  component: AppActionRow,
  render: () => ({
    components: {
      AppActionRow,
      'icon-hugeicons-plug': IconPlug,
      'icon-hugeicons-chevron-right': IconChevronRight
    },
    template: `
      <div class="flex w-80 flex-col gap-2 bg-panel p-4">
        <AppActionRow>
          <template #leading><icon-hugeicons-plug class="size-4" /></template>
          Local MCP connection
          <template #description>http://localhost:3000/mcp</template>
          <template #trailing><icon-hugeicons-chevron-right class="size-3.5" /></template>
        </AppActionRow>
        <AppActionRow>
          Very long model profile name that must not displace the trailing affordance
          <template #description>A deliberately long description wraps within the available space instead of inheriting action-button nowrap.</template>
          <template #trailing><icon-hugeicons-chevron-right class="size-3.5" /></template>
        </AppActionRow>
        <AppActionRow disabled>
          Unavailable connection
          <template #description>Disabled rows retain their readable description.</template>
        </AppActionRow>
      </div>
    `
  })
} satisfies Meta<typeof AppActionRow>

export default meta
export const Default: StoryObj<typeof meta> = {}
