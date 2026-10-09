import type { Meta, StoryObj } from '@storybook/vue3-vite'

import BrandLoader from './BrandLoader.vue'

interface BrandLoaderArgs {
  progress?: number | null
}

const meta = {
  title: 'App/Brand/Loader',
  component: BrandLoader,
  args: { progress: null },
  render: (args) => ({
    components: { BrandLoader },
    setup: () => ({ args }),
    template:
      '<div class="grid place-items-center bg-design-canvas p-16"><BrandLoader v-bind="args" /></div>'
  })
} satisfies Meta<BrandLoaderArgs>

export default meta
type Story = StoryObj<BrandLoaderArgs>

export const Filling: Story = {}
export const HalfReady: Story = { args: { progress: 50 } }
export const Ready: Story = { args: { progress: 100 } }
