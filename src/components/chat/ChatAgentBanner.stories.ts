import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { AgentBannerState } from '@/theme/chat/sky'

import ChatAgentBanner from './ChatAgentBanner.vue'

interface ChatAgentBannerProps {
  name: string
  color: string
  state: AgentBannerState
  status: string
  others?: string[]
}

/** The agent in the chat's sky: its creature in a glass tile, its name and what it is doing. */

const meta = {
  title: 'App/Chat/ChatAgentBanner',
  component: ChatAgentBanner,
  args: { name: 'Pebble', color: 'rgb(217 119 87)', state: 'ready', status: 'Ready' },
  render: (args) => ({
    components: { ChatAgentBanner },
    setup: () => ({ args }),
    template: '<div class="relative w-[380px] chat-sky"><ChatAgentBanner v-bind="args" /></div>'
  })
} satisfies Meta<ChatAgentBannerProps>

export default meta
type Story = StoryObj<ChatAgentBannerProps>

export const Ready: Story = {}

export const Working: Story = { args: { state: 'working', status: 'Composing the hero' } }

export const Waiting: Story = { args: { state: 'waiting', status: 'Waiting for you' } }

export const SeveralAgents: Story = {
  args: { state: 'working', status: '3 agents working', others: ['Fern', 'Moss'] }
}
