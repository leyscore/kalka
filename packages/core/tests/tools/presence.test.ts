import { describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import { FigmaAPI } from '@kalka/core/figma-api'
import {
  ASK_USER_MAX_SENT_PICTURES,
  askUser,
  CORE_TOOLS,
  finishWorkingOnNodes,
  isToolExposed,
  planSections,
  SECTION_HEIGHT_MAX,
  SECTION_PLAN_MAX,
  readStyle,
  styleNamed,
  STYLE_NAMES,
  STYLE_SYSTEM,
  styleGuide
} from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

describe('finish_working_on_nodes', () => {
  test('hands the layers to the host, or null to release everything', () => {
    const figma = new FigmaAPI(new SceneGraph())
    const calls: (string[] | null)[] = []
    figma.finishWorking = (ids) => {
      calls.push(ids)
      return ids ?? ['all']
    }
    expect(finishWorkingOnNodes.execute(figma, { node_ids: ['1:2'] })).toEqual({
      released: ['1:2']
    })
    expect(finishWorkingOnNodes.execute(figma, {})).toEqual({ released: ['all'] })
    expect(finishWorkingOnNodes.execute(figma, { node_ids: [] })).toEqual({ released: ['all'] })
    expect(calls).toEqual([['1:2'], null, null])
  })

  test('says so in a host that shows no working marks, such as the CLI', () => {
    const result = finishWorkingOnNodes.execute(new FigmaAPI(new SceneGraph()), {})
    expect(result).toMatchObject({ released: [] })
  })

  test('is a default tool for MCP and the chat, and changes nothing', () => {
    expect(CORE_TOOLS).toContain(finishWorkingOnNodes)
    expect(isToolExposed(finishWorkingOnNodes, 'mcp')).toBe(true)
    expect(isToolExposed(finishWorkingOnNodes, 'ai')).toBe(true)
    expect(finishWorkingOnNodes.mutates).toBe(false)
  })
})

describe('plan_sections', () => {
  test('hands the host tidy sections, in order, with bounded names and heights', () => {
    const figma = new FigmaAPI(new SceneGraph())
    const plans: unknown[] = []
    figma.setAgentPlan = (sections) => plans.push(sections)
    const result = planSections.execute(figma, {
      sections: [
        { name: '  Hero   band ', height: 720.4 },
        { name: '', height: 300 },
        { name: 'Footer', height: 99_999 },
        { name: 'Thin', height: -5 }
      ]
    })
    const tidy = [
      { name: 'Hero band', height: 720 },
      { name: 'Footer', height: SECTION_HEIGHT_MAX },
      { name: 'Thin', height: 40 }
    ]
    expect(result).toEqual({ sections: tidy })
    expect(plans).toEqual([tidy])
  })

  test('keeps a plan to a size the canvas can show, and clears it with an empty list', () => {
    const figma = new FigmaAPI(new SceneGraph())
    const plans: { name: string }[][] = []
    figma.setAgentPlan = (sections) => plans.push(sections)
    const many = Array.from({ length: SECTION_PLAN_MAX + 4 }, (_, index) => ({
      name: `Section ${index}`,
      height: 400
    }))
    planSections.execute(figma, { sections: many })
    planSections.execute(figma, { sections: [] })
    expect(plans.map((plan) => plan.length)).toEqual([SECTION_PLAN_MAX, 0])
  })

  test('says so in a host that shows no plan, and is a default tool that changes nothing', () => {
    const result = planSections.execute(new FigmaAPI(new SceneGraph()), {
      sections: [{ name: 'Hero', height: 600 }]
    })
    expect(result).toMatchObject({ note: expect.any(String) })
    expect(CORE_TOOLS).toContain(planSections)
    expect(isToolExposed(planSections, 'mcp')).toBe(true)
    expect(isToolExposed(planSections, 'ai')).toBe(true)
    expect(planSections.mutates).toBe(false)
  })
})

describe('ask_user', () => {
  const questions = [
    { question: 'What is the shop called?', placeholder: 'Name' },
    { question: 'Which sections?', options: ['Menu', 'Hours', 'Shop'], multiple: true }
  ]

  test('hands the questions to the host and returns the answers', async () => {
    const figma = new FigmaAPI(new SceneGraph())
    const asked: unknown[] = []
    figma.askUser = (sent) => {
      asked.push(sent)
      return Promise.resolve([
        { question: 'What is the shop called?', answer: 'Grain' },
        { question: 'Which sections?', answer: 'Menu, Hours' }
      ])
    }
    expect(await askUser.execute(figma, { questions })).toEqual({
      answers: [
        { question: 'What is the shop called?', answer: 'Grain' },
        { question: 'Which sections?', answer: 'Menu, Hours' }
      ]
    })
    expect(asked).toEqual([questions])
  })

  test('tells the agent to decide when the person skips', async () => {
    const figma = new FigmaAPI(new SceneGraph())
    figma.askUser = () => Promise.resolve(null)
    expect(await askUser.execute(figma, { questions })).toMatchObject({ answers: null })
  })

  test('asks in the reply in a host with no person to ask, such as the CLI', async () => {
    const result = await askUser.execute(new FigmaAPI(new SceneGraph()), { questions })
    expect(result).toMatchObject({ answers: null })
    expect(JSON.stringify(result)).toContain('ask in your reply')
  })

  test('passes a picture the person sent as the image the agent sees', async () => {
    const figma = new FigmaAPI(new SceneGraph())
    const image = { name: 'mood.png', mimeType: 'image/png', base64: 'iVBORw0KGgo=' }
    figma.askUser = () =>
      Promise.resolve([
        { question: 'Which look?', answer: 'Bauhaus poster (https://example.org/a)', image },
        { question: 'Anything to avoid?', answer: '', image: { ...image, name: 'b.png' } }
      ])
    const result = await askUser.execute(figma, { questions })
    expect(result).toMatchObject({
      answers: [
        {
          question: 'Which look?',
          answer: 'Bauhaus poster (https://example.org/a), their own picture: mood.png'
        },
        { question: 'Anything to avoid?', answer: 'their own picture: b.png' }
      ],
      base64: image.base64,
      mimeType: 'image/png'
    })
    expect(JSON.stringify(result)).toContain('2 pictures')
  })

  test('passes the references the person picked as images after their own picture', async () => {
    const figma = new FigmaAPI(new SceneGraph())
    const own = { name: 'mood.png', mimeType: 'image/png', base64: 'AAAA' }
    const reference = (name: string) => ({ name, mimeType: 'image/webp', base64: `${name}==` })
    figma.askUser = () =>
      Promise.resolve([
        {
          question: 'Which look?',
          answer: 'Onyx (https://example.org/onyx)',
          references: [reference('Onyx'), reference('Blue Bottle')]
        },
        { question: 'Anything else?', answer: '', image: own }
      ])
    const result = await askUser.execute(figma, { questions })
    expect(result).toMatchObject({
      base64: 'AAAA',
      mimeType: 'image/png',
      images: [
        { base64: 'Onyx==', mimeType: 'image/webp' },
        { base64: 'Blue Bottle==', mimeType: 'image/webp' }
      ]
    })
    expect(JSON.stringify(result)).toContain('Onyx (a reference they picked)')
    expect(JSON.stringify(result)).not.toContain('"references"')
  })

  test('sends one picked reference alone as the image, and caps how many go', async () => {
    const figma = new FigmaAPI(new SceneGraph())
    const references = Array.from({ length: ASK_USER_MAX_SENT_PICTURES + 2 }, (_, index) => ({
      name: `Ref ${index}`,
      mimeType: 'image/jpeg',
      base64: 'AAAA'
    }))
    figma.askUser = () =>
      Promise.resolve([
        { question: 'Which look?', answer: 'Ref 0', references: references.slice(0, 1) }
      ])
    const single = await askUser.execute(figma, { questions })
    expect(single).toMatchObject({ base64: 'AAAA', mimeType: 'image/jpeg' })
    expect(single).not.toHaveProperty('images')

    figma.askUser = () => Promise.resolve([{ question: 'Which look?', answer: 'All', references }])
    const many = await askUser.execute(figma, { questions })
    expect(many).toMatchObject({
      images: Array.from({ length: ASK_USER_MAX_SENT_PICTURES - 1 }, () => ({
        base64: 'AAAA',
        mimeType: 'image/jpeg'
      }))
    })
    expect(JSON.stringify(many)).toContain('2 more they picked are not shown')
  })

  test('shows https pictures only', () => {
    const picture = { url: 'https://example.org/a.jpg', label: 'Poster', credit: 'Ada, CC BY 2.0' }
    expect(
      v.safeParse(askUser.input, { questions: [{ question: 'Which?', images: [picture] }] }).success
    ).toBe(true)
    expect(
      v.safeParse(askUser.input, {
        questions: [
          { question: 'Which?', images: [{ ...picture, url: 'http://example.org/a.jpg' }] }
        ]
      }).success
    ).toBe(false)
  })

  test('is a default tool for MCP and the chat, and changes nothing', () => {
    expect(CORE_TOOLS).toContain(askUser)
    expect(isToolExposed(askUser, 'mcp')).toBe(true)
    expect(isToolExposed(askUser, 'ai')).toBe(true)
    expect(askUser.mutates).toBe(false)
  })
})

describe('read_style', () => {
  const figma = new FigmaAPI(new SceneGraph())

  test('returns the full guide of every style the index names', () => {
    for (const name of STYLE_NAMES) {
      expect(styleGuide(name).length).toBeGreaterThan(500)
      expect(readStyle.execute(figma, { name })).toEqual({ style: name, guide: styleGuide(name) })
      expect(STYLE_SYSTEM.toLowerCase()).toContain(`## ${name.replaceAll('-', ' ')}\n`)
    }
  })

  test('names the first style a recorded choice mentions', () => {
    expect(styleNamed('Dark Precision + Bento section')).toBe('dark-precision')
    expect(styleNamed('own direction')).toBeNull()
  })

  test('without a name, says the page records no style yet', () => {
    expect(readStyle.execute(figma, {})).toMatchObject({ recorded: null })
  })

  test('comes with the design guide, which carries the anti-slop catalogue and the style index', () => {
    expect(CORE_TOOLS).toContain(readStyle)
    expect(isToolExposed(readStyle, 'mcp')).toBe(true)
    expect(isToolExposed(readStyle, 'ai')).toBe(true)
    const designGuide = CORE_TOOLS.find((tool) => tool.name === 'get_design_guide')
    expect(designGuide?.execute(figma, {})).toMatchObject({ styles: STYLE_SYSTEM })
  })
})
