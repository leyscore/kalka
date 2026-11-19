import { describe, expect, test } from 'bun:test'

import {
  expandDesignComponent,
  parseDesignComponent,
  type DesignComponent,
  type DesignValues
} from '#core/io/formats/claude-design'

function dc(body: string, props = '{}', script = 'class Component extends DCLogic {}'): string {
  return `<!doctype html><html lang="en"><head><title>Card</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist&amp;display=swap"></head>
<body><x-dc><helmet><style>body{margin:0}</style></helmet>${body}</x-dc>
<script type="text/x-dc" data-dc-script data-props='${props}'>${script}</script></body></html>`
}

type Run = { name: string; props: DesignValues }

function expander(
  components: Record<string, string>,
  values: (name: string, props: DesignValues) => DesignValues | null
) {
  const parsed = new Map<string, DesignComponent>(
    Object.entries(components).map(([name, html]) => [name, parseDesignComponent(html)])
  )
  const runs: Run[] = []
  const expand = (name: string, props?: DesignValues) =>
    expandDesignComponent(
      name,
      {
        component: (child) => parsed.get(child),
        values: async (child, _component, childProps) => {
          runs.push({ name: child, props: childProps })
          return values(child, childProps)
        }
      },
      props
    )
  return { expand, runs }
}

function squash(html: string): string {
  return html.replace(/\s+/g, ' ').replace(/> </g, '><').trim()
}

describe('parseDesignComponent', () => {
  test('reads the markup, stylesheets, logic and tweaks', () => {
    const component = parseDesignComponent(
      dc(
        '<div>{{title}}</div>',
        '{"$preview":{"width":520,"height":460},"accent":{"editor":"color","default":"#f50"},"count":{"editor":"int"}}',
        'class Component extends DCLogic { renderVals() { return {} } }'
      )
    )
    expect(component.title).toBe('Card')
    expect(component.lang).toBe('en')
    expect(component.links).toEqual(['https://fonts.googleapis.com/css2?family=Geist&display=swap'])
    expect(component.styles).toEqual(['body{margin:0}'])
    expect(component.script).toContain('class Component extends DCLogic')
    expect(component.defaults).toEqual({ accent: '#f50' })
    expect(component.preview).toEqual({ width: 520, height: 460 })
  })

  test('keeps a component whose props are not JSON', () => {
    const component = parseDesignComponent(dc('<div>Hi</div>', '{nope'))
    expect(component.defaults).toEqual({})
    expect(component.preview).toBeNull()
  })
})

describe('expandDesignComponent', () => {
  test('fills text and attribute holes from the logic', async () => {
    const { expand } = expander(
      {
        Card: dc(
          '<button type="button" aria-pressed="{{on}}" disabled="{{off}}" hidden="{{shown}}" onClick="{{pick}}" style="{{look}}" class="b {{tone}}">{{label}} &amp; {{ user.name }} {{missing}}</button>'
        )
      },
      () => ({
        on: false,
        off: false,
        shown: true,
        look: 'color: red;',
        tone: 'dark',
        label: '<b>Save</b>',
        user: { name: 'Sam' }
      })
    )
    const { html, links, styles } = await expand('Card')
    expect(squash(html)).toBe(
      '<button type="button" aria-pressed="false" hidden="" style="color: red;" class="b dark">&lt;b&gt;Save&lt;/b&gt; &amp; Sam </button>'
    )
    expect(links).toHaveLength(1)
    expect(styles).toEqual(['body{margin:0}'])
  })

  test('writes a style object as CSS', async () => {
    const { expand } = expander({ Card: dc('<div style="{{look}}"></div>') }, () => ({
      look: { backgroundColor: '#fff', marginTop: 8, '--accent': 'red', zIndex: 0 }
    }))
    expect((await expand('Card')).html).toContain(
      'style="background-color: #fff; margin-top: 8px; --accent: red; z-index: 0"'
    )
  })

  test('repeats loops with their item and index, and branches on values', async () => {
    const { expand } = expander(
      {
        List: dc(
          '<ul><sc-for list="{{items}}" as="item"><li data-i="{{$index}}">{{item.label}}<sc-if value="{{item.done}}"> ✓</sc-if></li></sc-for></ul><sc-if value="{{empty}}"><p>None</p></sc-if>'
        )
      },
      () => ({ items: [{ label: 'One', done: true }, { label: 'Two' }], empty: false })
    )
    expect(squash((await expand('List')).html)).toBe(
      '<ul><li data-i="0">One ✓</li><li data-i="1">Two</li></ul>'
    )
  })

  test('falls back to defaults and placeholders when the logic cannot run', async () => {
    const { expand } = expander(
      {
        Card: dc(
          '<h1>{{title}}</h1><sc-if value="{{open}}" hint-placeholder-val="{{ true }}"><p>Open</p></sc-if><sc-for list="{{rows}}" as="r" hint-placeholder-count="2"><i>{{r.name}}</i></sc-for>',
          '{"title":{"editor":"text","default":"Hello"}}'
        )
      },
      () => null
    )
    expect(squash((await expand('Card')).html)).toBe('<h1>Hello</h1><p>Open</p><i></i><i></i>')
  })

  test('mounts imported components with their props, once per loop item', async () => {
    const { expand, runs } = expander(
      {
        Page: dc(
          '<section><sc-for list="{{people}}" as="p"><dc-import name="Badge" person="{{p}}" size="large" hint-size="100px,40px"></dc-import></sc-for></section>'
        ),
        Badge: dc('<span class="{{size}}">{{who}}</span>', '{"size":{"editor":"enum","default":"small"}}')
      },
      (name, props) => {
        if (name === 'Page') return { people: [{ name: 'Ada' }, { name: 'Lin' }] }
        const person = props.person as { name: string } | undefined
        return { who: person?.name ?? '', size: props.size }
      }
    )
    expect(squash((await expand('Page')).html)).toBe(
      '<section><span class="large">Ada</span><span class="large">Lin</span></section>'
    )
    expect(runs.filter((run) => run.name === 'Badge').map((run) => run.props)).toEqual([
      { size: 'large', person: { name: 'Ada' } },
      { size: 'large', person: { name: 'Lin' } }
    ])
  })

  test('keeps the placeholder box of an import it cannot draw', async () => {
    const { expand } = expander(
      {
        Loop: dc('<dc-import name="Loop" hint-size="200,50%"></dc-import><dc-import name="Nowhere"></dc-import>')
      },
      () => ({})
    )
    expect(squash((await expand('Loop')).html)).toBe(
      '<div data-dc-import="Loop" style="width: 200px; height: 50%"></div><div data-dc-import="Nowhere"></div>'
    )
  })

  test('draws a design system component as a box of its content', async () => {
    const { expand } = expander(
      {
        Card: dc(
          '<x-import component-from-global-scope="Cds.Button" variant="primary" style="width: 80px">Save</x-import>'
        )
      },
      () => ({})
    )
    expect(squash((await expand('Card')).html)).toBe('<div style="width: 80px">Save</div>')
  })
})
