import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { UIMessage } from 'ai'
import { expect, fn, userEvent } from 'storybook/test'

import ChatMessage from './ChatMessage.vue'

const userMessage: UIMessage = {
  id: 'user-message',
  role: 'user',
  parts: [{ type: 'text', text: 'Rename these cells using the selected layer.' }]
}

const assistantMessage: UIMessage = {
  id: 'assistant-message',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: 'Done. Names now follow `Cell_R{row}C{col}`, from `Row_1` through `Row_4`.'
    }
  ]
}

const reasoningMessage: UIMessage = {
  id: 'reasoning-message',
  role: 'assistant',
  parts: [
    { type: 'reasoning', text: 'Inspecting the selected hierarchy.', state: 'done' },
    { type: 'text', text: 'The hierarchy is consistent.' }
  ]
}

/** A reply stopped mid-call, as the chat settles it: nothing reads as running any more. */
const stoppedMessage: UIMessage = {
  id: 'stopped-message',
  role: 'assistant',
  metadata: { stopped: true },
  parts: [
    { type: 'reasoning', text: 'Laying out a month grid.', state: 'done' },
    {
      type: 'tool-render',
      toolCallId: 'stopped-call',
      state: 'output-error',
      input: { jsx: '<Frame name="Calendar" />' },
      errorText: 'The reply ended before this call finished. It did not change the document.'
    }
  ]
}

/** A reply with one of its two edits undone, by Undo in the editor or the chat's Revert. */
const partlyUndoneMessage: UIMessage = {
  id: 'partly-undone-message',
  role: 'assistant',
  metadata: {
    undo: {
      edits: [
        { tool: 'node_resize', toolCallId: 'resize' },
        { tool: 'set_opacity', toolCallId: 'fade' }
      ],
      undone: ['fade']
    }
  },
  parts: [
    {
      type: 'tool-node_resize',
      toolCallId: 'resize',
      state: 'output-available',
      input: { id: '0:1', width: 200, height: 60 },
      output: { id: '0:1' }
    },
    {
      type: 'tool-set_opacity',
      toolCallId: 'fade',
      state: 'output-available',
      input: { id: '0:1', value: 0.5 },
      output: { id: '0:1' }
    },
    { type: 'text', text: 'Widened the card and faded it.' }
  ]
}

/** A coding agent that reports its sign-in expired, as Claude Code does over ACP. */
const signInExpiredMessage: UIMessage = {
  id: 'sign-in-expired-message',
  role: 'assistant',
  parts: [
    { type: 'step-start' },
    {
      type: 'text',
      text: 'Failed to authenticate: OAuth session expired and could not be refreshed'
    }
  ]
}

type ChatMessageStoryArgs = {
  message: UIMessage
  streaming?: boolean
  canRegenerate?: boolean
  canRetry?: boolean
  reconnect?: boolean
  reconnecting?: boolean
  onRegenerate?: () => void
  onReconnect?: () => void
}

const meta = {
  title: 'App/Chat/Message',
  component: ChatMessage,
  parameters: { layout: 'centered' },
  render: (args) => ({
    components: { ChatMessage },
    setup: () => ({ args }),
    template:
      '<div class="w-96 rounded-xl bg-panel p-4 text-surface"><ChatMessage v-bind="args" /></div>'
  })
} satisfies Meta<ChatMessageStoryArgs>

export default meta
type Story = StoryObj<ChatMessageStoryArgs>

export const User: Story = { args: { message: userMessage } }
export const Assistant: Story = { args: { message: assistantMessage } }
export const Reasoning: Story = { args: { message: reasoningMessage } }
export const Streaming: Story = { args: { message: assistantMessage, streaming: true } }

export const Stopped: Story = {
  args: { message: stoppedMessage },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="chat-turn-stopped"]')).toBeVisible()
    // The stopped reply's reasoning no longer reads as running.
    await expect(
      canvasElement.querySelector('[data-slot="chat-reasoning-trigger"]')
    ).not.toHaveAttribute('data-streaming')
  }
}

export const PartlyUndone: Story = {
  args: { message: partlyUndoneMessage },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="chat-turn-undone"]')).toBeVisible()
    const undone = canvasElement.querySelectorAll(
      '[data-slot="chat-tool-call"][data-undone="true"]'
    )
    await expect(undone).toHaveLength(1)
  }
}

/** Asking again cannot fix an expired sign-in, so the reply offers Reconnect instead. */
export const SignInExpired: Story = {
  args: {
    message: signInExpiredMessage,
    canRegenerate: true,
    reconnect: true,
    onRegenerate: fn(),
    onReconnect: fn()
  },
  play: async ({ canvasElement, args }) => {
    await expect(canvasElement.querySelector('[data-test-id="chat-regenerate"]')).toBeNull()
    const reconnect = canvasElement.querySelector('[data-test-id="chat-reconnect"]')
    await expect(reconnect).toBeVisible()
    if (reconnect) await userEvent.click(reconnect)
    await expect(args.onReconnect).toHaveBeenCalledOnce()
    await expect(args.onRegenerate).not.toHaveBeenCalled()
  }
}

/** A request that failed on an expired sign-in before any reply. */
export const RequestSignInExpired: Story = {
  args: { message: userMessage, canRetry: true, reconnect: true, onReconnect: fn() },
  play: async ({ canvasElement, args }) => {
    await expect(canvasElement.querySelector('[data-test-id="chat-retry"]')).toBeNull()
    const reconnect = canvasElement.querySelector('[data-test-id="chat-reconnect"]')
    if (reconnect) await userEvent.click(reconnect)
    await expect(args.onReconnect).toHaveBeenCalledOnce()
  }
}

export const Reconnecting: Story = {
  args: { message: signInExpiredMessage, canRegenerate: true, reconnect: true, reconnecting: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-test-id="chat-reconnect"]')).toBeDisabled()
  }
}
