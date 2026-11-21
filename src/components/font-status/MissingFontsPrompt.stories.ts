import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import MissingFontsPrompt from './MissingFontsPrompt.vue'

type Args = {
  families: string[]
  adding?: boolean
  error?: string | null
  onAdd: () => void
  onDismiss: () => void
}

const meta = {
  title: 'App/Fonts/Missing Fonts Prompt',
  component: MissingFontsPrompt,
  args: { families: ['Fraunces', 'Inter Tight'], onAdd: fn(), onDismiss: fn() },
  render: (args) => ({
    components: { MissingFontsPrompt },
    setup: () => ({ args }),
    template: '<div class="w-80"><MissingFontsPrompt v-bind="args" /></div>'
  })
} satisfies Meta<Args>

export default meta
type Story = StoryObj<typeof meta>

/** An imported design names fonts the free catalogue has: one click keeps them. */
export const Several: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Add fonts' }))
    await expect(args.onAdd).toHaveBeenCalled()
  }
}

export const One: Story = { args: { families: ['Space Grotesk'] } }

export const Adding: Story = { args: { adding: true } }

export const Failed: Story = {
  args: { error: 'The free font catalogue can’t be reached. Check your connection and try again.' }
}
