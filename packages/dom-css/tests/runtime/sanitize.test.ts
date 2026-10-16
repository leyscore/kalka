import { describe, expect, it } from 'bun:test'

import { createHeadlessCSSRuntime, type DesignNode } from '@kalka/dom-css'

function elements(nodes: DesignNode[]): Extract<DesignNode, { type: 'element' }>[] {
  return nodes.flatMap((node) =>
    node.type === 'element' ? [node, ...elements(node.children)] : []
  )
}

describe('imported HTML', () => {
  it('keeps structure, styles and media and drops whatever would run', () => {
    const document = createHeadlessCSSRuntime().parseHTML(`
      <section class="hero" style="padding: 8px" onclick="steal()">
        <img src="photo.png" alt="Photo" onerror="steal()">
        <a href="javascript:steal()">Bad link</a>
        <a href="https://kalka.design">Good link</a>
        <img src="data:image/png;base64,AAAA" alt="Inline">
        <iframe srcdoc="<script>steal()</script>"></iframe>
        <script>steal()</script>
        <base href="https://evil.example/">
      </section>
    `)
    const all = elements(document.children)
    const tags = all.map((element) => element.tagName)
    expect(tags).not.toContain('script')
    expect(tags).not.toContain('iframe')
    expect(tags).not.toContain('base')
    for (const element of all) {
      for (const name of Object.keys(element.attrs)) expect(name.startsWith('on')).toBe(false)
    }
    const [section] = all
    expect(section?.attrs.class).toBe('hero')
    expect(section?.inlineStyle).toBeDefined()
    const links = all.filter((element) => element.tagName === 'a')
    expect(links[0]?.attrs.href).toBeUndefined()
    expect(links[1]?.attrs.href).toBe('https://kalka.design')
    const images = all.filter((element) => element.tagName === 'img')
    expect(images.map((image) => image.attrs.src)).toEqual([
      'photo.png',
      'data:image/png;base64,AAAA'
    ])
  })
})
