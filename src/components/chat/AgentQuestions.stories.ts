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

function swatch(ground: string, ink: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="${ground}"/><circle cx="56" cy="60" r="30" fill="${ink}"/><rect x="96" y="30" width="40" height="60" fill="${ink}" opacity="0.5"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const REFERENCES: AgentQuestion[] = [
  {
    question: 'Which of these feels closest to the roastery?',
    images: [
      {
        url: swatch('#f4ede1', '#b5532b'),
        label: 'Kraft coffee bags',
        credit: 'Ada Brun, Pexels',
        link: 'https://example.org/a'
      },
      {
        url: swatch('#1d1b18', '#d9b26a'),
        label: 'Roaster at night',
        credit: 'Noor Haddad, Pexels'
      },
      { url: swatch('#e8e4da', '#2b4a3a'), label: 'Café menu board' },
      { url: swatch('#f2f2f0', '#c8102e'), label: 'Swiss coffee poster', credit: 'Pexels' }
    ]
  }
]

/** References from find_references: several may be picked, and one's own picture sent instead. */
export const References: Story = {
  beforeEach: () => {
    skipQuestions()
    answered = askUserInPanel(REFERENCES, 'Pebble')
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Kraft coffee bags' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Café menu board' }))
    await expect(canvas.getByRole('button', { name: 'Kraft coffee bags' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Send answers' }))
    await expect(await answered).toEqual([
      {
        question: REFERENCES[0]?.question,
        answer: `Kraft coffee bags (https://example.org/a), Café menu board (${REFERENCES[0]?.images?.[2]?.url ?? ''})`
      }
    ])
  }
}
