import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import AppButton from '@/components/ui/button/AppButton.vue'

import TeamPage from './TeamPage.vue'

type Args = { heading: string; description: string }

/** A team page: its title, a sentence about it and an action, over the page's content. */
const meta = {
  title: 'App/Team/Page',
  args: {
    heading: 'People',
    description: "Everyone who can open Pixelers's files, and what they can do."
  },
  render: (args) => ({
    components: { TeamPage, SettingsGroup, AppButton },
    setup: () => ({ args }),
    template: `<div class="w-full max-w-[900px] p-6">
      <TeamPage :heading="args.heading" :description="args.description">
        <template #actions><AppButton color="primary" variant="solid">Invite people</AppButton></template>
        <SettingsGroup>
          <div class="px-4 py-3 text-[13px]">Ada Lovelace</div>
          <div class="px-4 py-3 text-[13px]">Grace Hopper</div>
        </SettingsGroup>
      </TeamPage>
    </div>`
  })
} satisfies Meta<Args>

export default meta
export const Default: StoryObj<typeof meta> = {}
