import * as v from 'valibot'

import { DESIGN_GUIDE } from './prompts'
import { defineTool } from './schema'

/**
 * Lets go of what an agent was building. While an agent works, the app marks the layers it
 * writes with its name, so the user sees what is still in progress; the marks also go by
 * themselves once the agent is quiet for a while or its session ends.
 */
export const finishWorkingOnNodes = defineTool({
  name: 'finish_working_on_nodes',
  description:
    'Tell the user you are done with layers you were building. While you work, the canvas marks the layers you write with your name; call this when a section or the whole design is finished. Pass node_ids for the sections you finished (layers inside them go too), or nothing to release everything you worked on.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    node_ids: v.optional(
      v.pipe(
        v.array(v.string()),
        v.description('Layers you finished. Omit to release everything you are working on.')
      )
    )
  }),
  execute: (figma, { node_ids }) => {
    if (!figma.finishWorking) return { released: [], note: 'This host shows no working marks.' }
    const ids = node_ids && node_ids.length > 0 ? node_ids : null
    return { released: figma.finishWorking(ids) }
  }
})

/** How long a status line may be; longer ones are cut, as the canvas has room for a few words. */
export const AGENT_STATUS_MAX_LENGTH = 80

export const setStatus = defineTool({
  name: 'set_status',
  description:
    'Tell the user what you are doing now, in a few words such as "Composing the hero" or "Checking the phone layout"; the canvas shows it next to your name while you work. Call it when you start each step of a larger design. An empty text clears it.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    text: v.pipe(v.string(), v.description('What you are doing now, a few words'))
  }),
  execute: (figma, { text }) => {
    const status = text.trim().replaceAll(/\s+/g, ' ').slice(0, AGENT_STATUS_MAX_LENGTH)
    if (!figma.setAgentStatus) return { status, note: 'This host shows no agent status.' }
    figma.setAgentStatus(status)
    return { status }
  }
})

export const getDesignGuide = defineTool({
  name: 'get_design_guide',
  description:
    'Read how to design in Kalka: decide on a direction, set up variables and components, compose screens from them, and review your work. Call it once before you design a page or screen, and again if the conversation got long.',
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({}),
  execute: () => ({ guide: DESIGN_GUIDE })
})

/** How many questions one call asks, so the person is never handed a whole form at once. */
export const ASK_USER_MAX_QUESTIONS = 6

const questionSchema = v.strictObject({
  question: v.pipe(v.string(), v.minLength(1), v.description('The question, in one sentence')),
  options: v.optional(
    v.pipe(
      v.array(v.pipe(v.string(), v.minLength(1))),
      v.maxLength(8),
      v.description(
        'Two to six likely answers, shown as buttons the person picks in one click. Make them concrete and different from each other; the person can always type their own instead.'
      )
    )
  ),
  multiple: v.optional(
    v.pipe(v.boolean(), v.description('Let the person pick several options, such as sections.'))
  ),
  placeholder: v.optional(
    v.pipe(v.string(), v.description('A hint for the typed answer, such as "Name of the shop".'))
  )
})

export const askUser = defineTool({
  name: 'ask_user',
  description:
    'Ask the person what you need to know before designing: the product and its name, who it is for, what the page must do, its sections, colours they like or must avoid, references. The questions appear in Kalka one at a time, with your suggested answers as buttons and a field to type their own, and the call returns their answers. Ask only what the conversation and the document do not already tell you, and offer real choices, not placeholders.',
  execution: { kind: 'async', mutation: 'none' },
  input: v.strictObject({
    questions: v.pipe(
      v.array(questionSchema),
      v.minLength(1),
      v.maxLength(ASK_USER_MAX_QUESTIONS),
      v.description('The questions, in the order to ask them')
    )
  }),
  execute: async (figma, { questions }) => {
    if (!figma.askUser) {
      return { answers: null, note: 'This host cannot show questions; ask in your reply instead.' }
    }
    const answers = await figma.askUser(questions)
    if (!answers) {
      return {
        answers: null,
        note: 'The person skipped the questions. Decide sensibly from what you know and say what you assumed.'
      }
    }
    return { answers }
  }
})
