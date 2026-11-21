import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { TabsRoot } from 'reka-ui'
import IconCloud from '~icons/hugeicons/cloud'
import IconPlug from '~icons/hugeicons/plug'
import IconSettings from '~icons/hugeicons/settings-01'
import IconSparkles from '~icons/hugeicons/sparkles'

import SettingsSidebar from './SettingsSidebar.vue'
import type { SettingsSidebarGroup } from './sidebar'

const groups: SettingsSidebarGroup[] = [
  {
    id: 'account',
    label: 'Account',
    sections: [{ value: 'general', label: 'Preferences', icon: IconSettings }]
  },
  {
    id: 'workspace',
    label: 'Workspace',
    sections: [{ value: 'storage', label: 'Cloud storage', icon: IconCloud }]
  },
  {
    id: 'ai',
    label: 'AI',
    sections: [
      { value: 'ai', label: 'AI & agents', icon: IconSparkles },
      { value: 'mcp', label: 'MCP', icon: IconPlug }
    ]
  }
]

type Args = { canLeave: boolean; section: string }

/**
 * The sidebar of Settings: the way back, the person, then the sections, which are the tabs of the
 * page beside it. While a section holds an editor of its own, the way back waits.
 */
const meta = {
  title: 'App/Settings/Sidebar',
  args: { canLeave: true, section: 'ai' },
  render: (args) => ({
    components: { SettingsSidebar, TabsRoot },
    setup: () => ({
      args,
      groups,
      profile: { name: 'Baurice Ley', detail: 'On this computer', initials: 'BL' }
    }),
    template: `
      <TabsRoot :model-value="args.section" orientation="vertical" class="flex h-[560px] w-[236px]">
        <SettingsSidebar
          :groups="groups"
          :profile="profile"
          label="Settings"
          back-label="Back"
          :can-leave="args.canLeave"
        />
      </TabsRoot>`
  })
} satisfies Meta<Args>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** A model being edited: its own Back leads out of the editor first. */
export const Editing: Story = { args: { canLeave: false } }
