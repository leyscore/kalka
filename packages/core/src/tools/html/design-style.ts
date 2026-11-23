import {
  KALKA_PLUGIN_DATA,
  readPluginData,
  withPluginData,
  type SceneGraph
} from '@kalka/scene-graph'

/** The style a page was designed in, as the agent recorded it. */
export interface DesignStyle {
  style: string
  reason?: string
  palette?: string
}

/** `<!-- style: … | reason: … | palette: … -->`, the comment the style index asks a page to open with. */
const STYLE_COMMENT = /^\s*<!--\s*style\s*:([\s\S]*?)-->/i

/** The style comment opening written HTML, or null when it has none. */
export function styleComment(html: string): DesignStyle | null {
  const body = STYLE_COMMENT.exec(html)?.[1]
  if (body === undefined) return null
  const [first = '', ...rest] = body.split('|').map((part) => part.replaceAll(/\s+/g, ' ').trim())
  if (!first) return null
  const recorded: DesignStyle = { style: first }
  for (const part of rest) {
    const match = /^(reason|palette)\s*:\s*(.+)$/i.exec(part)
    if (!match) continue
    const key = match[1].toLowerCase() === 'reason' ? 'reason' : 'palette'
    recorded[key] = match[2]
  }
  return recorded
}

/** Keeps the style on the page, where a later session reads it back with read_style. */
export function recordDesignStyle(graph: SceneGraph, pageId: string, style: DesignStyle): void {
  const page = graph.getNode(pageId)
  if (page?.type !== 'CANVAS') return
  graph.updateNode(pageId, {
    pluginData: withPluginData(page.pluginData, KALKA_PLUGIN_DATA.designStyle, style)
  })
}

export function readDesignStyle(graph: SceneGraph, pageId: string): DesignStyle | null {
  const page = graph.getNode(pageId)
  return readPluginData(page?.pluginData, KALKA_PLUGIN_DATA.designStyle) ?? null
}
