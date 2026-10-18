import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent } from 'storybook/test'

import type { ChatReconnectNotice as Notice } from '@/app/ai/chat/reconnect'

import ChatReconnectNotice from './ChatReconnectNotice.vue'

type Args = {
  notice: Notice
  busy?: boolean
  onResend: () => void
  onReconnect: () => void
  onDismiss: () => void
}

const meta = {
  title: 'App/Chat/Reconnect Notice',
  component: ChatReconnectNotice,
  args: {
    notice: { kind: 'resend' },
    onResend: fn(),
    onReconnect: fn(),
    onDismiss: fn()
  },
  render: (args) => ({
    components: { ChatReconnectNotice },
    setup: () => ({ args }),
    template: '<div class="w-80 bg-panel py-2"><ChatReconnectNotice v-bind="args" /></div>'
  })
} satisfies Meta<Args>

export default meta
type Story = StoryObj<typeof meta>

/** The agent or provider signed in again; the chat offers to send the last message again. */
export const Reconnected: Story = {
  play: async ({ canvasElement, args }) => {
    const resend = canvasElement.querySelector('[data-test-id="chat-resend"]')
    await expect(resend).toBeVisible()
    if (resend) await userEvent.click(resend)
    await expect(args.onResend).toHaveBeenCalledOnce()
  }
}

/** Claude Code signs in only in a terminal, so the notice gives the command to run. */
export const TerminalSignIn: Story = {
  args: {
    notice: {
      kind: 'terminal',
      agent: 'Claude Code',
      signIn: { command: 'claude', prompt: '/login' }
    }
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="copy-field"]')).toBeVisible()
    await expect(canvasElement.querySelector('[data-test-id="chat-resend"]')).toBeVisible()
  }
}

export const TerminalSignInUnknown: Story = {
  args: { notice: { kind: 'terminal', agent: 'Gemini CLI', signIn: null } }
}

export const Failed: Story = {
  args: { notice: { kind: 'failed' } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-test-id="chat-resend"]')).toBeNull()
  }
}
