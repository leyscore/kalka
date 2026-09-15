import type {
  Canvas,
  CanvasKit,
  Font,
  FontWeight,
  Paragraph,
  TypefaceFontProvider
} from 'canvaskit-wasm'

import { ResourceCache } from '#core/cache/resource'

interface LabelParagraphEntry {
  paragraph: Paragraph
  width: number
  height: number
}

const MAX_LABEL_PARAGRAPHS = 512

export function measureGlyphWidth(font: Font, text: string): number {
  let width = 0
  for (const advance of font.getGlyphWidths(font.getGlyphIDs(text))) width += advance
  return width
}

export class LabelParagraphCache {
  private readonly entries = new ResourceCache<string, LabelParagraphEntry>({
    maxEntries: MAX_LABEL_PARAGRAPHS,
    dispose: (entry) => entry.paragraph.delete()
  })
  private fontGeneration = -1

  measure(
    ck: CanvasKit,
    provider: TypefaceFontProvider,
    text: string,
    fontSize: number,
    maxWidth: number,
    color: Float32Array,
    generation: number,
    fontWeight = 400
  ): Pick<LabelParagraphEntry, 'width' | 'height'> {
    return this.entry(ck, provider, text, fontSize, maxWidth, color, generation, fontWeight)
  }

  draw(
    ck: CanvasKit,
    canvas: Canvas,
    provider: TypefaceFontProvider,
    text: string,
    fontSize: number,
    maxWidth: number,
    color: Float32Array,
    generation: number,
    x: number,
    y: number,
    fontWeight = 400
  ): number {
    const entry = this.entry(ck, provider, text, fontSize, maxWidth, color, generation, fontWeight)
    canvas.drawParagraph(entry.paragraph, x, y)
    return entry.width
  }

  clear(): void {
    this.entries.clear()
  }

  size(): number {
    return this.entries.size
  }

  private entry(
    ck: CanvasKit,
    provider: TypefaceFontProvider,
    text: string,
    fontSize: number,
    maxWidth: number,
    color: Float32Array,
    generation: number,
    fontWeight: number
  ): LabelParagraphEntry {
    if (generation !== this.fontGeneration) {
      this.clear()
      this.fontGeneration = generation
    }
    const boundedWidth = Math.max(1, maxWidth)
    const key = `${fontSize}\0${fontWeight}\0${boundedWidth}\0${Array.from(color).join(',')}\0${text}`
    let entry = this.entries.get(key)
    if (!entry) {
      const style = new ck.ParagraphStyle({
        maxLines: 1,
        ellipsis: '…',
        textStyle: {
          color,
          fontFamilies: ['Inter'],
          fontSize,
          fontStyle: { weight: { value: fontWeight } as FontWeight }
        }
      })
      const builder = ck.ParagraphBuilder.MakeFromFontProvider(style, provider)
      builder.addText(text)
      const paragraph = builder.build()
      builder.delete()
      paragraph.layout(boundedWidth)
      entry = {
        paragraph,
        width: Math.min(paragraph.getLongestLine(), boundedWidth),
        height: paragraph.getHeight()
      }
      this.entries.set(key, entry)
    }
    return entry
  }
}
