import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { UIMessage } from 'ai'
import { expect, within } from 'storybook/test'

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

type ChatMessageStoryArgs = {
  message: UIMessage
  streaming?: boolean
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
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Stopped')).toBeVisible()
    await expect(canvas.queryByText('Thinking…')).toBeNull()
  }
}
