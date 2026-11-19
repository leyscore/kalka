import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { AgentAnswer, AgentQuestion } from '@kalka/core/figma-api'

import { askUserInPanel, skipQuestions } from '@/app/ai/questions/queue'

import AgentQuestions from './AgentQuestions.vue'

const KICKOFF: AgentQuestion[] = [
  {
    question: 'What is the business, and what is it called?',
    options: ['A specialty coffee roaster', 'A bakery', 'A neighbourhood café'],
    placeholder: 'Name and what it sells'
  },
  {
    question: 'Which sections does the page need?',
    options: ['Coffees', 'Subscription', 'Our roastery', 'Wholesale', 'Visit us'],
    multiple: true
  },
  {
    question: 'Which colours should it use or avoid?',
    options: ['Our logo colours', 'Black and white with one accent', 'Let the agent propose']
  }
]

let answered: Promise<AgentAnswer[] | null> = Promise.resolve(null)

const meta = {
  title: 'App/Chat/Agent Questions',
  component: AgentQuestions,
  beforeEach: () => {
    answered = askUserInPanel(KICKOFF, 'Pebble')
    return () => skipQuestions()
  },
  render: () => ({
    components: { AgentQuestions },
    template: '<div class="w-80 bg-canvas py-2"><AgentQuestions /></div>'
  })
} satisfies Meta<typeof AgentQuestions>

export default meta
type Story = StoryObj<typeof meta>

/** An agent's kickoff: each question with its suggested answers, and a field for one's own. */
export const Kickoff: Story = {}

/** A pick answers a single-choice question and moves on; several picks answer a multiple one. */
export const Answering: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const byTestId = (id: string): HTMLElement => {
      const element = canvasElement.querySelector<HTMLElement>(`[data-test-id="${id}"]`)
      if (!element) throw new Error(`Missing ${id}`)
      return element
    }
    await userEvent.click(canvas.getByRole('button', { name: 'A specialty coffee roaster' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Coffees' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Subscription' }))
    await userEvent.click(byTestId('agent-questions-next'))
    await userEvent.type(byTestId('agent-question-own-answer'), 'No terracotta')
    await userEvent.click(byTestId('agent-questions-next'))
    await expect(await answered).toEqual([
      { question: KICKOFF[0]?.question, answer: 'A specialty coffee roaster' },
      { question: KICKOFF[1]?.question, answer: 'Coffees, Subscription' },
      { question: KICKOFF[2]?.question, answer: 'No terracotta' }
    ])
  }
}
