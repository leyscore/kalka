import { describe, expect, test } from 'bun:test'

import {
  answerQuestions,
  askUserInPanel,
  currentQuestions,
  skipQuestions
} from '@/app/ai/questions/queue'

describe('agent questions queue', () => {
  test('shows one set of questions at a time and resolves each with its answers', async () => {
    const first = askUserInPanel([{ question: 'Name?' }], 'Fern')
    const second = askUserInPanel([{ question: 'Colours?' }], null)
    expect(currentQuestions.value?.agent).toBe('Fern')

    answerQuestions([{ question: 'Name?', answer: 'Grain' }])
    expect(await first).toEqual([{ question: 'Name?', answer: 'Grain' }])
    expect(currentQuestions.value?.questions).toEqual([{ question: 'Colours?' }])

    skipQuestions()
    expect(await second).toBeNull()
    expect(currentQuestions.value).toBeNull()
  })
})
