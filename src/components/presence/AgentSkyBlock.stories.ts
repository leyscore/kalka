import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { SkeletonTone } from '@/app/presence/skeletons'

import AgentSkyBlock from './AgentSkyBlock.vue'

interface AgentSkyBlockProps {
  width: number
  height: number
  tone: SkeletonTone
  seed: string
  leaving?: boolean
}

/**
 * A block an agent is still drawing: a cloud of pixel dots with a few twinkling patches, Kalka
 * blue over a light backdrop and white over a dark one. The same seed always draws the same cloud.
 */
const meta = {
  title: 'App/Collaboration/Agent Sky Block',
  component: AgentSkyBlock,
  args: { width: 360, height: 180, tone: 'light', seed: 'hero', leaving: false }
} satisfies Meta<AgentSkyBlockProps>

export default meta
type Story = StoryObj<AgentSkyBlockProps>

/** Over a light page, such as a white section. */
export const OnLight: Story = {
  render: (args) => ({
    components: { AgentSkyBlock },
    setup: () => ({ args }),
    template: `
      <div class="relative w-fit rounded-[8px] bg-[#FBFAF7] p-6">
        <AgentSkyBlock v-bind="args" />
      </div>`
  })
}

/** Over a dark backdrop, such as the canvas before a page has its fill. */
export const OnDark: Story = {
  args: { tone: 'dark', seed: 'page' },
  render: (args) => ({
    components: { AgentSkyBlock },
    setup: () => ({ args }),
    template: `
      <div class="relative w-fit rounded-[8px] bg-[#1E1E1E] p-6">
        <AgentSkyBlock v-bind="args" />
      </div>`
  })
}

/** Its content is appearing: the cloud fades and rises away. */
export const Leaving: Story = {
  args: { leaving: true },
  render: OnLight.render
}
