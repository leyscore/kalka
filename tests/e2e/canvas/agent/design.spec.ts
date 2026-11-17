import { pathToFileURL } from 'node:url'

import { expect, test, type Page } from '@playwright/test'
import * as v from 'valibot'

import { CanvasHelper } from '#tests/helpers/canvas'
import { repoPath } from '#tests/helpers/paths'

/**
 * An agent builds a page through the MCP tools the way agents do: a shell with a stylesheet, then
 * one section per call, JSX art, class edits, a look at the result. It runs under the desktop
 * app's content policy, which the dev server does not send, so code the page may not run fails
 * here as it does in the installed app.
 */

const policies = v.object({ CONTENT_SECURITY_POLICY: v.string() })

async function desktopPolicy(): Promise<string> {
  const module: unknown = await import(pathToFileURL(repoPath('electron/src/csp.ts')).href)
  return v.parse(policies, module).CONTENT_SECURITY_POLICY
}

const ToolReply = v.object({ ok: v.literal(true), result: v.unknown() })

/** A tool call as the MCP bridge delivers it from an outside client's session. */
async function callAsAgent(page: Page, name: string, args: Record<string, unknown>) {
  const reply = await page.evaluate(
    (call) =>
      window.kalka?.test?.automation?.('tool', {
        ...call,
        agent: {
          session: 'design-session',
          kind: 'mcp',
          client: 'claude-code'
        }
      }),
    { name, args }
  )
  return v.parse(ToolReply, reply).result
}

const Layers = v.object({
  layers: v.array(v.object({ id: v.string() })),
  review: v.optional(v.string())
})

const NodeBox = v.looseObject({
  y: v.number(),
  fontSize: v.optional(v.number())
})

async function nodeBox(page: Page, id: string) {
  return v.parse(NodeBox, await callAsAgent(page, 'get_node', { id }))
}

async function open(page: Page) {
  const policy = await desktopPolicy()
  await page.route(
    (url) => url.pathname === '/' && url.searchParams.has('test'),
    async (route) => {
      const response = await route.fetch()
      await route.fulfill({
        response,
        headers: { ...response.headers(), 'content-security-policy': policy }
      })
    }
  )
  await page.goto('/?test')
  await new CanvasHelper(page).waitForInit()
}

const SHELL = `<style>
.card { background-color: #F4EFE6; padding: 16px 20px; border-radius: 28px; }
.title { font-family: Inter; font-weight: 700; font-size: 40px; line-height: 1.05; color: #3F2D10; }
.btn { display: flex; align-items: center; padding: 0 28px; background: #F0B429; border-radius: 16px; font-size: 18px; }
</style>
<div id="page" style="width: 800px; display: flex; flex-direction: column; gap: 24px; padding: 32px"></div>`

const SECTION = `<section style="display: flex; flex-direction: column; gap: 20px">
  <h2 class="title">Explore your English</h2>
  <div style="height: 30px; background: #107E6D"></div>
  <div class="card" style="margin-top: 12px; height: 40px"></div>
  <a class="btn" style="height: 52px">Discover</a>
</section>`

test('an agent builds a page across calls: classes carry over, art renders, nothing drifts', async ({
  page
}) => {
  await open(page)

  const shell = v.parse(Layers, await callAsAgent(page, 'write_html', { html: SHELL, x: 0, y: 0 }))
  const shellId = shell.layers[0].id
  // The stylesheet's classes are the document's, though no layer of this call uses them.
  const classes = v.parse(
    v.object({ classes: v.array(v.object({ name: v.string() })) }),
    await callAsAgent(page, 'get_css_classes', {})
  )
  expect(classes.classes.map((cssClass) => cssClass.name)).toEqual(
    expect.arrayContaining(['card', 'title', 'btn'])
  )

  const section = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      parent_id: shellId,
      html: SECTION
    })
  )
  // The agent has not looked at what it wrote, and the result says so.
  expect(section.review).toContain(shellId)

  const tree = v.parse(
    v.object({
      children: v.array(v.object({ id: v.string(), name: v.string() }))
    }),
    await callAsAgent(page, 'node_children', { id: section.layers[0].id })
  )
  const [heading, bar, card] = tree.children
  // A class from the first call styles HTML written in a later one.
  expect((await nodeBox(page, heading.id)).fontSize).toBe(40)
  // The card sits below the bar by the gap and its margin: 30 + 20 + 12 from the heading's end.
  const barY = (await nodeBox(page, bar.id)).y
  const cardY = (await nodeBox(page, card.id)).y
  expect(cardY - barY).toBe(62)

  // Later layouts read the card back where it is, instead of adding its margin each time.
  await callAsAgent(page, 'update_styles', {
    id: shellId,
    styles: { gap: '28px' }
  })
  await callAsAgent(page, 'update_styles', {
    id: shellId,
    styles: { gap: '24px' }
  })
  expect((await nodeBox(page, card.id)).y - (await nodeBox(page, bar.id)).y).toBe(62)

  // Design JSX runs although the page's policy forbids evaluating code in it.
  const art = v.parse(
    v.object({ id: v.string() }),
    await callAsAgent(page, 'render', {
      parent_id: shellId,
      jsx: '<Frame name="Star" w={64} h={64}><svg viewBox="0 0 64 64"><path d="M32 4 L38 26 L60 32 L38 38 L32 60 L26 38 L4 32 L26 26 Z" fill="#F0B429" /></svg></Frame>'
    })
  )
  expect(art.id).toBeTruthy()

  expect(await callAsAgent(page, 'set_status', { text: 'Checking the hero' })).toMatchObject({
    status: 'Checking the hero'
  })

  // Once the agent looks at the artboard, its writes stop asking it to; a new one is unseen.
  await callAsAgent(page, 'get_screenshot', { id: shellId })
  const phone = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      html: '<div style="width: 390px"><p>Phone</p></div>',
      x: 1000,
      y: 0
    })
  )
  expect(phone.review).toContain(phone.layers[0].id)
  expect(phone.review).not.toContain(shellId)
})

test('writes finish while the window draws no frames, as when it is hidden', async ({ page }) => {
  await open(page)
  // A hidden or occluded window runs no animation frames, here or in iframes the page adds.
  await page.evaluate(() => {
    const never = () => 0
    window.requestAnimationFrame = never
    const append = Element.prototype.append
    Element.prototype.append = function (...nodes: (Node | string)[]) {
      append.apply(this, nodes)
      for (const node of nodes)
        if (node instanceof HTMLIFrameElement && node.contentWindow)
          node.contentWindow.requestAnimationFrame = never
    }
  })
  const written = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      html: '<div style="display: flex; padding: 8px"><p>Probe</p></div>'
    })
  )
  expect(written.layers).toHaveLength(1)
})

test('an agent sets up variables and components, then composes a screen from instances', async ({
  page
}) => {
  await open(page)
  // Variables first.
  const collection = v.parse(
    v.looseObject({ id: v.string(), modes: v.array(v.looseObject({ modeId: v.string() })) }),
    await callAsAgent(page, 'create_collection', { name: 'Explore' })
  )
  const accent = v.parse(
    v.object({ id: v.string() }),
    await callAsAgent(page, 'create_variable', {
      name: 'color/accent',
      type: 'COLOR',
      collection_id: collection.id,
      value: '#F0B429'
    })
  )

  // A Button component, its fill bound to the accent.
  const drawn = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      html: '<a style="display: flex; padding: 12px 24px; background: #F0B429; border-radius: 12px">Get started</a>',
      x: 0,
      y: 0
    })
  )
  const button = v.parse(
    v.object({ id: v.string() }),
    await callAsAgent(page, 'create_component', { id: drawn.layers[0].id })
  )
  await callAsAgent(page, 'rename_node', { id: button.id, name: 'Button' })
  await callAsAgent(page, 'bind_variable', {
    node_id: button.id,
    field: 'fills/0/color',
    variable_id: accent.id
  })

  // The screen uses the component by name.
  const hero = v.parse(
    Layers,
    await callAsAgent(page, 'write_html', {
      html: '<section style="display: flex; gap: 16px; padding: 32px; width: 640px"><h1 style="margin: 0">Explore your English</h1><kalka-instance component="Button"></kalka-instance></section>',
      x: 0,
      y: 200
    })
  )
  const children = v.parse(
    v.object({ children: v.array(v.object({ id: v.string(), type: v.string() })) }),
    await callAsAgent(page, 'node_children', { id: hero.layers[0].id })
  )
  const instance = children.children.find((child) => child.type === 'INSTANCE')
  expect(instance).toBeDefined()

  // Changing the system changes the screen: the variable restyles the instance.
  await callAsAgent(page, 'set_variable', {
    id: accent.id,
    mode: collection.modes[0].modeId,
    value: '#107E6D'
  })
  const fill = await page.evaluate((id) => {
    const node = window.kalka?.getStore?.()?.graph.getNode(id)
    const paint = node?.fills[0]
    return paint?.type === 'SOLID' ? paint.color : null
  }, instance?.id ?? '')
  expect(fill).toMatchObject({ r: expect.closeTo(0.063, 2), g: expect.closeTo(0.494, 2) })
})
