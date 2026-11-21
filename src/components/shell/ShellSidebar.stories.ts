import type { Meta, StoryObj } from '@storybook/vue3-vite'
import IconRecent from '~icons/hugeicons/clock-01'
import IconServer from '~icons/hugeicons/server-stack-01'
import IconTeam from '~icons/hugeicons/user-group'

import { samplePlaces } from './sample-places'
import ShellSidebar from './ShellSidebar.vue'
import type { ShellSidebarProps } from './sidebar'

const places = samplePlaces(12)

/**
 * The sidebar of the app's pages: the workspace, its places and the account. The same card holds
 * the file lists on Home and the sections of Settings, on this computer, a Kalka server or Cloud.
 */
const meta = {
  title: 'App/Shell/Sidebar',
  component: ShellSidebar,
  args: {
    workspace: { name: 'Kalka', detail: 'On this computer' },
    groups: places,
    selected: 'home',
    account: { name: 'Baurice Ley', detail: 'Account and settings', initials: 'BL' },
    label: 'Places'
  },
  render: (args) => ({
    components: { ShellSidebar },
    setup: () => ({ args }),
    template: `<div class="flex h-[560px] w-[236px]"><ShellSidebar v-bind="args" /></div>`
  })
} satisfies Meta<ShellSidebarProps>

export default meta
type Story = StoryObj<typeof meta>

/** On this computer, Home shown. */
export const ThisComputer: Story = {}

/** Signed in to a Kalka Cloud workspace, with its documents and the team's pages. */
export const Cloud: Story = {
  args: {
    workspace: { name: 'Pixelers', detail: 'baurice@pixelers.fr', mark: 'P' },
    selected: 'server',
    groups: [
      ...places.slice(0, 1),
      {
        id: 'files',
        label: 'Files',
        items: [
          { id: 'recent', label: 'Recent', icon: IconRecent },
          { id: 'server', label: 'Pixelers', icon: IconServer, count: 48 }
        ]
      },
      {
        id: 'team',
        label: 'Team',
        items: [{ id: 'people', label: 'People', icon: IconTeam, count: 6 }]
      }
    ]
  }
}
