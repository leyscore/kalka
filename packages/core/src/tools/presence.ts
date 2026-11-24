import { compact } from 'es-toolkit'
import * as v from 'valibot'

import type { AgentAnswer, PlannedSection } from '#core/figma-api'

import { readDesignStyle } from './html/design-style'
import {
  ANTI_SLOP_GUIDE,
  DESIGN_GUIDE,
  STYLE_NAMES,
  STYLE_SYSTEM,
  styleGuide,
  type StyleName
} from './prompts'
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

/** How many sections a plan may list; a page with more is announced in groups. */
export const SECTION_PLAN_MAX = 16
/** How long a planned section's name may be; the canvas has room for a word or two. */
export const SECTION_NAME_MAX_LENGTH = 40
/** The tallest a planned section may be, in pixels. */
export const SECTION_HEIGHT_MAX = 8000
const SECTION_HEIGHT_MIN = 40

export const planSections = defineTool({
  name: 'plan_sections',
  description:
    'Announce the sections of the page you are about to design, top to bottom, before you draw the first one: each with a short name such as "Hero" or "Pricing" and its approximate height in pixels. The canvas shows them as empty outlines that turn into the real sections as you build them, so the user sees the whole page coming. Heights are estimates; the outlines follow what you really build. Call it again with the full list when the plan changes. An empty list clears it.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    sections: v.pipe(
      v.array(
        v.strictObject({
          name: v.pipe(v.string(), v.description('A word or two, such as "Hero"')),
          height: v.pipe(v.number(), v.description('Approximate height in pixels'))
        })
      ),
      v.description('Every section of the page, in order from the top')
    )
  }),
  execute: (figma, { sections }) => {
    const plan: PlannedSection[] = sections
      .map(({ name, height }) => ({
        name: name.trim().replaceAll(/\s+/g, ' ').slice(0, SECTION_NAME_MAX_LENGTH),
        height: Number.isFinite(height)
          ? Math.round(Math.min(Math.max(height, SECTION_HEIGHT_MIN), SECTION_HEIGHT_MAX))
          : SECTION_HEIGHT_MIN
      }))
      .filter(({ name }) => name.length > 0)
      .slice(0, SECTION_PLAN_MAX)
    if (!figma.setAgentPlan) return { sections: plan, note: 'This host shows no section plan.' }
    figma.setAgentPlan(plan)
    return { sections: plan }
  }
})

export const getDesignGuide = defineTool({
  name: 'get_design_guide',
  description:
    'Read how to design in Kalka: decide on a direction, set up variables and components, compose screens from them, and review your work, plus the anti-slop catalogue of what makes a design look machine-made and the style system (global rules, colour and type direction, and the index of styles you may pick from with read_style, or not). Call it once before you design a page or screen, and again if the conversation got long.',
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({}),
  execute: () => ({
    guide: DESIGN_GUIDE,
    antiSlop: ANTI_SLOP_GUIDE,
    styles: STYLE_SYSTEM
  })
})

/** The style index entry a recorded style names first, as in `Dark Precision + Bento section`. */
export function styleNamed(recorded: string): StyleName | null {
  const words = recorded.toLowerCase().replaceAll(/[^a-z]+/g, '-')
  const found = STYLE_NAMES.map((name) => ({ name, at: words.indexOf(name) }))
    .filter(({ at }) => at >= 0)
    .sort((a, b) => a.at - b.at)
  return found[0]?.name ?? null
}

export const readStyle = defineTool({
  name: 'read_style',
  description:
    "Read the full guide of one style from the style index: its grid, type, spacing, colour, surfaces, hero and section patterns, imagery, signature moves, anti-patterns and self-check. Call it once the style is chosen (by you, or by the person when you offered the choice), before building the page. Skip it when no style fits the subject and you build your own direction. Without a name, it returns the style the current page was designed in, as its opening HTML comment recorded it, with that style's guide: call it before changing a page someone designed earlier.",
  execution: { kind: 'sync', mutation: 'none' },
  input: v.strictObject({
    name: v.optional(
      v.pipe(
        v.picklist(STYLE_NAMES),
        v.description("The chosen style, as named in the index; omit to read the page's own")
      )
    )
  }),
  execute: (figma, { name }) => {
    if (name) return { style: name, guide: styleGuide(name) }
    const recorded = readDesignStyle(figma.graph, figma.currentPageId)
    if (!recorded) {
      return {
        recorded: null,
        note: 'This page records no style. Pick one from the index, or none, and open the page with the style comment.'
      }
    }
    const named = styleNamed(recorded.style)
    return named ? { recorded, style: named, guide: styleGuide(named) } : { recorded }
  }
})

/** How many questions one call asks, so the person is never handed a whole form at once. */
export const ASK_USER_MAX_QUESTIONS = 6

/** How many pictures one question shows, so they stay large enough to judge. */
export const ASK_USER_MAX_IMAGES = 8

/** How many pictures the answers hand the agent, so the result stays a size models read. */
export const ASK_USER_MAX_SENT_PICTURES = 6

const imageSchema = v.strictObject({
  url: v.pipe(v.string(), v.url(), v.startsWith('https://'), v.description('The picture')),
  label: v.pipe(v.string(), v.minLength(1), v.description('What it shows, in a few words')),
  link: v.optional(
    v.pipe(v.string(), v.url(), v.startsWith('https://'), v.description('Its source page'))
  ),
  credit: v.optional(v.pipe(v.string(), v.description('Its creator and licence')))
})

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
  ),
  images: v.optional(
    v.pipe(
      v.array(imageSchema),
      v.minLength(1),
      v.maxLength(ASK_USER_MAX_IMAGES),
      v.description(
        'Pictures the person picks from, such as screenshots of real sites from a connected design-reference library or the photos find_references returned, passed as they came. The person may pick several, none, or send a picture of their own, which you then see.'
      )
    )
  )
})

/**
 * The answers as text, and the pictures the person sent or picked as images the model then sees:
 * the first as the result's image, the others in `images`. Answers keep the pictures' names, so
 * the text says which question each one answers.
 */
function answersWithPictures(answers: AgentAnswer[]) {
  const text = answers.map(({ question, answer, image }) => ({
    question,
    answer: image ? compact([answer, `their own picture: ${image.name}`]).join(', ') : answer
  }))
  const own = answers.flatMap(({ image }) => (image ? [{ ...image, own: true }] : []))
  const picked = answers.flatMap(({ references }) =>
    (references ?? []).map((reference) => ({ ...reference, own: false }))
  )
  const all = [...own, ...picked]
  const pictures = all.slice(0, ASK_USER_MAX_SENT_PICTURES)
  if (pictures.length === 0) return { answers: text }
  const [first, ...rest] = pictures
  const names = pictures.map(({ name, own }) =>
    own ? `${name} (their own)` : `${name} (a reference they picked)`
  )
  const left = all.length - pictures.length
  const note =
    pictures.length === 1
      ? `The picture is ${names[0]}. Let its look guide the direction.`
      : compact([
          `The person sent or picked ${pictures.length} pictures, in this order: ${names.join(', ')}.`,
          left > 0 ? `${left} more they picked are not shown.` : '',
          'Let their look guide the direction.'
        ]).join(' ')
  return {
    answers: text,
    base64: first.base64,
    mimeType: first.mimeType,
    ...(rest.length > 0
      ? { images: rest.map(({ base64, mimeType }) => ({ base64, mimeType })) }
      : {}),
    note
  }
}

export const askUser = defineTool({
  name: 'ask_user',
  description:
    'Ask the person what you need to know before designing: the product and its name, who it is for, what the page must do, its sections, colours they like or must avoid, references. The questions appear in Kalka one at a time, with your suggested answers as buttons and a field to type their own, and the call returns their answers. A question can also show pictures, such as references from find_references, which the person picks from or answers with a picture of their own; you then see the pictures they picked or sent. Ask only what the conversation and the document do not already tell you, and offer real choices, not placeholders.',
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
      return {
        answers: null,
        note: 'This host cannot show questions; ask in your reply instead.'
      }
    }
    const answers = await figma.askUser(questions)
    if (!answers) {
      return {
        answers: null,
        note: 'The person skipped the questions. Decide sensibly from what you know and say what you assumed.'
      }
    }
    return answersWithPictures(answers)
  }
})
