import { Schema, type Mark, type Node as ProseMirrorNode } from 'prosemirror-model'

import type { CharacterStyleOverride, StyleRun } from '@open-pencil/scene-graph'

import { characterStyleToCSS, styleText } from '#vue/canvas/dom-scene/text/css'

/**
 * A text layer as ProseMirror sees it: paragraphs of characters, each carrying at most one
 * `style` mark whose attribute is the layer's character style override for those characters.
 * A paragraph break is a newline in the layer's text; one mark is one style run.
 */
export const textSchema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: {
      content: 'text*',
      // A block per line, so the layer's own line height and alignment apply to each.
      toDOM: () => ['div', { style: 'margin:0' }, 0],
      parseDOM: [{ tag: 'div' }, { tag: 'p' }]
    },
    text: {}
  },
  marks: {
    style: {
      attrs: { style: { default: {} } },
      toDOM: (mark) => [
        'span',
        { style: styleText(characterStyleToCSS(mark.attrs.style as CharacterStyleOverride)) },
        0
      ]
    }
  }
})

function styleMark(style: CharacterStyleOverride): Mark[] {
  return Object.keys(style).length > 0 ? [textSchema.marks.style.create({ style })] : []
}

/** The style each character has, from runs that may be unsorted, overlapping or empty. */
function stylesByCharacter(
  text: string,
  runs: readonly StyleRun[]
): (CharacterStyleOverride | null)[] {
  const styles: (CharacterStyleOverride | null)[] = Array.from({ length: text.length }, () => null)
  for (const run of runs) {
    if (Object.keys(run.style).length === 0) continue
    const end = Math.min(text.length, run.start + run.length)
    for (let index = Math.max(0, run.start); index < end; index++) styles[index] = run.style
  }
  return styles
}

/** A layer's `text` and `styleRuns` as a ProseMirror document. */
export function textToDoc(text: string, runs: readonly StyleRun[]): ProseMirrorNode {
  const styles = stylesByCharacter(text, runs)
  const paragraphs: ProseMirrorNode[] = []
  let lineStart = 0
  for (const line of text.split('\n')) {
    const content: ProseMirrorNode[] = []
    let segmentStart = 0
    for (let index = 1; index <= line.length; index++) {
      const style = styles[lineStart + segmentStart]
      if (index < line.length && styles[lineStart + index] === style) continue
      content.push(textSchema.text(line.slice(segmentStart, index), style ? styleMark(style) : []))
      segmentStart = index
    }
    paragraphs.push(textSchema.nodes.paragraph.create(null, content))
    lineStart += line.length + 1
  }
  return textSchema.nodes.doc.create(null, paragraphs)
}

function sameStyle(a: CharacterStyleOverride, b: CharacterStyleOverride): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** A ProseMirror document back as a layer's `text` and `styleRuns`, adjacent equal runs merged. */
export function docToText(doc: ProseMirrorNode): { text: string; styleRuns: StyleRun[] } {
  let text = ''
  const styleRuns: StyleRun[] = []
  doc.forEach((paragraph, _offset, index) => {
    if (index > 0) text += '\n'
    paragraph.forEach((child, _childOffset, childIndex) => {
      const characters = child.text ?? ''
      const style = child.marks.find((mark) => mark.type === textSchema.marks.style)?.attrs
        .style as CharacterStyleOverride | undefined
      if (style && Object.keys(style).length > 0 && characters.length > 0) {
        const previous = styleRuns.at(-1)
        const end = previous ? previous.start + previous.length : -1
        // A run that reaches the end of a line goes on over the break into the next line.
        const acrossBreak = childIndex === 0 && index > 0 && end === text.length - 1
        if (previous && (end === text.length || acrossBreak) && sameStyle(previous.style, style)) {
          previous.length = text.length + characters.length - previous.start
        } else {
          styleRuns.push({ start: text.length, length: characters.length, style })
        }
      }
      text += characters
    })
  })
  return { text, styleRuns }
}
