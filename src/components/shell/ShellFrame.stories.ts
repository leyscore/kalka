import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { samplePlaces } from './sample-places'
import ShellFrame from './ShellFrame.vue'
import ShellSidebar from './ShellSidebar.vue'

const groups = samplePlaces()

/**
 * The frame of every page that is not a document: the sky, the sidebar and the page. On a phone the
 * sidebar waits behind the menu button. The transformed box keeps the fixed sky inside the story.
 */
const meta = {
  title: 'App/Shell/Frame',
  component: ShellFrame,
  args: { label: 'Places', menuLabel: 'Open the menu' },
  render: (args) => ({
    components: { ShellFrame, ShellSidebar },
    setup: () => ({
      args,
      groups,
      workspace: { name: 'Kalka', detail: 'On this computer' },
      account: { name: 'Baurice Ley', detail: 'Account and settings', initials: 'BL' }
    }),
    template: `
      <div class="relative isolate flex h-[640px] w-full overflow-hidden rounded-[16px] [transform:translateZ(0)]">
        <ShellFrame v-bind="args">
          <template #sidebar>
            <ShellSidebar :workspace="workspace" :groups="groups" selected="home" :account="account" label="Places" />
          </template>
          <div class="flex flex-1 items-center justify-center p-6">
            <h1 class="m-0 font-display text-5xl font-semibold tracking-[-0.04em] text-white">Hello, Baurice</h1>
          </div>
        </ShellFrame>
      </div>`
  })
} satisfies Meta<{ label: string; menuLabel: string }>

export default meta
type Story = StoryObj<typeof meta>

/** A desktop window: the sidebar beside the page. */
export const Desktop: Story = {}

/** A phone: the sidebar behind the menu button. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } }
}
