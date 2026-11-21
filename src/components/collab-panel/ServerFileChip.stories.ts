import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'

import ServerFileChip from './ServerFileChip.vue'

type Args = {
  serverName: string
  viewOnly: boolean
}

const meta = {
  title: 'App/Collaboration/Server File Chip',
  component: ServerFileChip,
  tags: ['autodocs'],
  args: { serverName: 'Acme Design', viewOnly: false },
  render: (args) => ({
    components: { ServerFileChip },
    setup: () => ({ args }),
    template: '<div class="flex p-4"><ServerFileChip v-bind="args" /></div>'
  })
} satisfies Meta<Args>

export default meta
type Story = StoryObj<typeof meta>

export const SavedOnServer: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toBeVisible()
  }
}

export const ViewOnly: Story = {
  args: { viewOnly: true },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('status')
    await expect(chip).toHaveAttribute('data-view-only', 'true')
  }
}

export const LongServerName: Story = {
  args: { serverName: 'Acme Design Studio, Paris and Lyon offices' }
}
