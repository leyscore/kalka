import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import type { Color } from '@kalka/scene-graph/primitives'

import AccountProfileCard from './AccountProfileCard.vue'

type Args = {
  name: string
  guestName: string
  color: Color
}

/**
 * The person in Settings › Account: their avatar in their room color, their name, and their cursor
 * as teammates see it. Type in the field to watch the preview follow.
 */
const meta = {
  title: 'App/Settings/Account Profile',
  args: {
    name: 'Baurice Ley',
    guestName: 'Teal Raven',
    color: { r: 0.13, g: 0.59, b: 0.95, a: 1 }
  },
  render: (args) => ({
    components: { AccountProfileCard },
    setup: () => ({ args, name: ref(args.name) }),
    template: `<div class="w-full max-w-[760px]">
      <AccountProfileCard v-model="name" :guest-name="args.guestName" :color="args.color" />
    </div>`
  })
} satisfies Meta<Args>

export default meta
type Story = StoryObj<typeof meta>

export const Named: Story = {}

/** No name yet: the field and the cursor show the generated name the person joins rooms with. */
export const Guest: Story = { args: { name: '', color: { r: 0.3, g: 0.69, b: 0.31, a: 1 } } }
