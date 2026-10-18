import type { CSSFontFaceRule } from '@acemir/cssom'
import { isValid, toUint8Array } from 'js-base64'
import { parseFragment, serialize, type DefaultTreeAdapterTypes } from 'parse5'

import { documentCSSClasses, normalizeFontFamily } from '@kalka/scene-graph'

import { tokenStylesheet, type TokenStylesheetFormat } from '../tokens/stylesheet'
import type {
  DesignDocument,
  DesignElement,
  DesignNode,
  DesignStyleDeclaration,
  MediaStyle
} from '../types'
import { cssClassStylesheet, withClassRules } from './classes'
import { mergeClassNames, serializeHTML, splitWhitespace } from './html'
import { prettyCSS } from './pretty'
import { hasBrowserDefaults, HTML_TAG_RESET_CSS, scopedTagResetCSS } from './tag-reset'
import { tidyDesignDocument } from './tidy'

/** A font face the exported text uses. */
export interface WebFontFaceRequest {
  family: string
  weight: number
  style?: 'normal' | 'italic'
}

/** A font file to ship next to the page, described as an `@font-face` rule. */
export interface WebFontFaceAsset {
  family: string
  weight: string | number | [number, number]
  style: string
  display?: string
  stretch?: string
  unicodeRange?: string[]
  format: 'woff2' | 'woff' | 'opentype' | 'truetype'
  path: string
  content: Uint8Array
}

/** Finds font files for the requested faces; paths start with `assetBasePath`. */
export type WebFontFaceResolver = (
  fonts: WebFontFaceRequest[],
  assetBasePath: string
) => Promise<WebFontFaceAsset[]>

export interface ExportHTMLBundleOptions {
  html?: 'fragment' | 'standalone'
  style?: 'inline' | 'tailwind'
  assets?: 'inline' | 'external'
  /** Resolves font files to include with external assets; `none` includes no fonts. */
  fonts?: 'none' | WebFontFaceResolver
  assetBasePath?: string
  /**
   * The base styles that make tags and boxes draw as designed: in the page (the default), in a
   * `reset.css` file of their own, or left out for a project that brings its own reset.
   */
  reset?: 'inline' | 'file' | 'none'
  /** Indented HTML and one CSS declaration per line, which renders the same. */
  pretty?: boolean
}

export interface ExportHTMLFile {
  path: string
  content: string | Uint8Array
}

export interface ExportHTMLBundle {
  entrypoint: string
  files: ExportHTMLFile[]
}

interface StandaloneBounds {
  minX: number
  minY: number
  width: number
  height: number
}

type ParseNode = DefaultTreeAdapterTypes.Node
type ParseParent = DefaultTreeAdapterTypes.ParentNode
type ParseElement = DefaultTreeAdapterTypes.Element

const RESET_CSS = `*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#fff}${HTML_TAG_RESET_CSS}`
const RESET_FILE = 'reset.css'

function cssText(css: string, pretty: boolean): string {
  return pretty && css ? prettyCSS(css) : css
}

/** A page around its body, the stylesheets its head names, each on its line when pretty. */
function pageHTML(head: readonly string[], body: string, pretty: boolean): string {
  const meta = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">'
  ]
  if (!pretty)
    return `<!doctype html><html><head>${[...meta, ...head].join('')}</head><body>${body}</body></html>`
  const indent = (lines: readonly string[]) => lines.map((line) => `    ${line}`).join('\n')
  const bodyLines = body
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n')
  return `<!doctype html>\n<html>\n  <head>\n${indent([...meta, ...head])}\n  </head>\n  <body>\n${bodyLines}\n  </body>\n</html>\n`
}

function styleToCSS(style: DesignStyleDeclaration): string {
  return Object.entries(style)
    .filter(([, value]) => value !== '')
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ')
}

/**
 * A root placed where it sits on the page, when several are exported side by side. Everything
 * inside it keeps the layout the projection wrote: flex for auto layout, absolute positions only
 * inside frames laid out freely.
 */
function placedRoot(node: DesignElement, origin: StandaloneBounds): DesignElement {
  const source = node.sourceSceneNode
  if (!source) return node
  return {
    ...node,
    inlineStyle: {
      ...node.inlineStyle,
      position: 'absolute',
      left: `${source.x - origin.minX}px`,
      top: `${source.y - origin.minY}px`
    }
  }
}

function nodeBounds(node: DesignNode): StandaloneBounds | undefined {
  if (node.type === 'text' || !node.sourceSceneNode) return undefined
  return {
    minX: node.sourceSceneNode.x,
    minY: node.sourceSceneNode.y,
    width: node.sourceSceneNode.width,
    height: node.sourceSceneNode.height
  }
}

function standaloneSize(document: DesignDocument): StandaloneBounds {
  const bounds = document.children
    .map(nodeBounds)
    .filter((value): value is NonNullable<typeof value> => value !== undefined)
  const minX = bounds.length > 0 ? Math.min(...bounds.map((bound) => bound.minX)) : 0
  const minY = bounds.length > 0 ? Math.min(...bounds.map((bound) => bound.minY)) : 0
  const maxX = bounds.length > 0 ? Math.max(...bounds.map((bound) => bound.minX + bound.width)) : 1
  const maxY = bounds.length > 0 ? Math.max(...bounds.map((bound) => bound.minY + bound.height)) : 1
  return { minX, minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
}

/** Several roots keep their places on the page; a single root or a responsive page flows. */
function standaloneDocument(document: DesignDocument, size: StandaloneBounds): DesignDocument {
  if (document.children.length < 2 || isResponsiveDocument(document)) return document
  return {
    ...document,
    children: document.children.map((node) =>
      node.type === 'element' ? placedRoot(node, size) : node
    )
  }
}

function isResponsiveDocument(document: DesignDocument): boolean {
  return document.children.some(
    (node) => node.type === 'element' && (node.mediaStyles?.length ?? 0) > 0
  )
}

/** A class name read from a layer's name: lowercase words joined by `-`, never starting with a digit. */
function classNameFor(node: DesignElement): string {
  const words = (node.sourceSceneNode?.name ?? node.tagName)
    .normalize('NFKD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
  const base = words || node.tagName.toLowerCase()
  return /^[0-9]/.test(base) ? `layer-${base}` : base
}

/** The class each style gets: named after its first layer, shared by layers styled the same. */
interface ClassNaming {
  used: Set<string>
  byRule: Map<string, string>
}

function uniqueClassName(naming: ClassNaming, base: string): string {
  let name = base
  for (let index = 2; naming.used.has(name); index++) name = `${base}-${index}`
  naming.used.add(name)
  return name
}

function mediaRule(className: string, { maxWidth, style }: MediaStyle): MediaRule {
  return { maxWidth, css: `@media (max-width:${maxWidth}px){.${className}{${styleToCSS(style)}}}` }
}

interface MediaRule {
  maxWidth: number
  css: string
}

/** The media rules of a page, widest first, so a narrower breakpoint's rules win below it. */
function mediaCSS(rules: readonly MediaRule[]): string {
  return [...rules]
    .sort((a, b) => b.maxWidth - a.maxWidth)
    .map((rule) => rule.css)
    .join('')
}

function extractInlineStyles(
  node: DesignNode,
  rules: string[],
  naming: ClassNaming,
  media: MediaRule[]
): DesignNode {
  if (node.type === 'text') return node
  const children = node.children.map((child) => extractInlineStyles(child, rules, naming, media))
  const hasMedia = (node.mediaStyles?.length ?? 0) > 0
  if ((!node.inlineStyle || Object.keys(node.inlineStyle).length === 0) && !hasMedia)
    return { ...node, children }

  const declarations = styleToCSS(node.inlineStyle ?? {})
  // Layers with the same style share a class; one with breakpoint rules keeps its own.
  let className = hasMedia ? undefined : naming.byRule.get(declarations)
  if (!className) {
    className = uniqueClassName(naming, classNameFor(node))
    rules.push(`.${className}{${declarations}}`)
    if (!hasMedia) naming.byRule.set(declarations, className)
  }
  for (const style of node.mediaStyles ?? []) media.push(mediaRule(className, style))
  return {
    ...node,
    attrs: { ...node.attrs, class: mergeClassNames(node.attrs.class, className) ?? className },
    inlineStyle: undefined,
    children
  }
}

function isElement(node: ParseNode): node is ParseElement {
  return 'attrs' in node && 'tagName' in node
}

function walkParseTree(node: ParseNode | ParseParent, visit: (node: ParseElement) => void): void {
  if (isElement(node)) visit(node)
  if ('childNodes' in node) {
    for (const child of node.childNodes) walkParseTree(child, visit)
  }
}

function classNamesFromHTML(html: string): string[] {
  const fragment = parseFragment(html)
  const classes = new Set<string>()
  walkParseTree(fragment, (element) => {
    const classAttr = element.attrs.find((attr) => attr.name === 'class')
    if (!classAttr) return
    for (const className of splitWhitespace(classAttr.value)) classes.add(className)
  })
  return [...classes]
}

/**
 * The stylesheet for the tokens the document references, in the format the page needs: plain
 * custom properties for inline styles, `@theme` for Tailwind, so token utilities compile.
 */
async function tokenCSS(document: DesignDocument, format: TokenStylesheetFormat): Promise<string> {
  const { tokens, sourceGraph } = document
  if (!tokens || !sourceGraph || tokens.used.size === 0) return ''
  const variables = tokens.stylesheetVariables()
  const { css } = await tokenStylesheet(sourceGraph, {
    format,
    include: (variable) => variables.has(variable.id)
  })
  return css
}

async function compileTailwindClasses(classNames: string[], tokens: string): Promise<string> {
  if (classNames.length === 0) return ''
  const [{ compile }, { readFile }] = await Promise.all([
    import('tailwindcss'),
    import(/* @vite-ignore */ 'node:fs/promises')
  ])
  const [themeCSS, utilitiesCSS] = await Promise.all([
    readFile(new URL(import.meta.resolve('tailwindcss/theme.css')), 'utf8'),
    readFile(new URL(import.meta.resolve('tailwindcss/utilities.css')), 'utf8')
  ])
  const compiler = await compile(`${themeCSS}\n${tokens}\n${utilitiesCSS}`)
  return compiler.build(classNames)
}

function stripFontFamilyQuotes(value: string): string {
  if (value.length < 2) return value
  const first = value[0]
  const last = value[value.length - 1]
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) return value.slice(1, -1)
  return value
}

function firstFontFamily(value: string): string {
  const commaIndex = value.indexOf(',')
  const raw = commaIndex !== -1 ? value.slice(0, commaIndex) : value
  return stripFontFamilyQuotes(raw.trim())
}

function collectFontRequests(node: DesignNode, fonts: Map<string, WebFontFaceRequest>): void {
  if (node.type === 'text') return
  const source = node.sourceSceneNode
  if (source?.type === 'TEXT') {
    const family = normalizeFontFamily(firstFontFamily(source.fontFamily))
    const style = source.italic ? 'italic' : 'normal'
    const key = `${family}|${source.fontWeight}|${style}`
    fonts.set(key, { family, weight: source.fontWeight, style })
  }
  for (const child of node.children) collectFontRequests(child, fonts)
}

function serializeFontWeight(weight: string | number | [number, number]): string {
  return Array.isArray(weight) ? weight.join(' ') : String(weight)
}

/** A font's URL relative to the stylesheet's folder `from`, which the asset's path may start with. */
function fontSourceValue(asset: WebFontFaceAsset, from: string): string {
  const path =
    from && asset.path.startsWith(`${from}/`) ? asset.path.slice(from.length + 1) : asset.path
  const url = new URL(path, 'file:///')
  const escapedPath = url.pathname.slice(1)
  return ['url(', JSON.stringify(escapedPath), ') format(', JSON.stringify(asset.format), ')'].join(
    ''
  )
}

interface FontFaceCSSOptions {
  /** The folder the stylesheet is in, which font paths are written relative to. */
  from: string
  /** `font-display` for every face, rather than each face's own. */
  display?: string
}

function fontFaceCSS(
  FontFaceRule: typeof CSSFontFaceRule,
  asset: WebFontFaceAsset,
  options: FontFaceCSSOptions
): string {
  const rule = new FontFaceRule()
  rule.style.setProperty('font-family', JSON.stringify(asset.family))
  rule.style.setProperty('src', fontSourceValue(asset, options.from))
  rule.style.setProperty('font-weight', serializeFontWeight(asset.weight))
  rule.style.setProperty('font-style', asset.style)
  rule.style.setProperty('font-display', options.display ?? asset.display ?? 'swap')
  if (asset.stretch) rule.style.setProperty('font-stretch', asset.stretch)
  if (asset.unicodeRange && asset.unicodeRange.length > 0) {
    rule.style.setProperty('unicode-range', asset.unicodeRange.join(','))
  }
  return rule.cssText
}

/** Every font face a document's text uses, once each. */
export function designFontRequests(document: DesignDocument): WebFontFaceRequest[] {
  const requests = new Map<string, WebFontFaceRequest>()
  for (const child of document.children) collectFontRequests(child, requests)
  return [...requests.values()]
}

/** `@font-face` rules for font files, as a stylesheet in the folder `options.from`. */
export async function fontFaceStylesheet(
  assets: readonly WebFontFaceAsset[],
  options: FontFaceCSSOptions
): Promise<string> {
  if (assets.length === 0) return ''
  // Loaded only when fonts ship as files; the CSS object model is not bundled for browsers.
  const cssom = await import('@acemir/cssom')
  return assets.map((asset) => fontFaceCSS(cssom.CSSFontFaceRule, asset, options)).join('')
}

async function fontFaceAssets(
  document: DesignDocument,
  options: Required<ExportHTMLBundleOptions>
): Promise<{ css: string; files: ExportHTMLFile[] }> {
  if (options.fonts === 'none' || options.assets !== 'external') return { css: '', files: [] }
  const assets = await options.fonts(designFontRequests(document), `${options.assetBasePath}/fonts`)
  // The stylesheet sits in the asset folder beside the font files.
  return {
    css: await fontFaceStylesheet(assets, { from: options.assetBasePath }),
    files: assets
  }
}

function dataImageParts(value: string): { mime: string; base64: string } | undefined {
  if (!value.startsWith('data:image/')) return undefined
  const marker = ';base64,'
  const markerIndex = value.indexOf(marker)
  if (markerIndex === -1) return undefined
  const base64 = value.slice(markerIndex + marker.length)
  // Documents can come from parsed HTML; an invalid payload stays inline rather than decoding to other bytes.
  if (!isValid(base64)) return undefined
  return { mime: value.slice('data:'.length, markerIndex), base64 }
}

function extensionForMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  if (mime === 'image/svg+xml') return 'svg'
  return 'png'
}

function extractImageAssets(
  html: string,
  assetBasePath: string
): { html: string; files: ExportHTMLFile[] } {
  const fragment = parseFragment(html)
  const files: ExportHTMLFile[] = []
  const sources = new Map<string, string>()
  walkParseTree(fragment, (element) => {
    const src = element.attrs.find((attr) => attr.name === 'src')
    if (!src) return
    const parts = dataImageParts(src.value)
    if (!parts) return
    const cachedPath = sources.get(src.value)
    if (cachedPath) {
      src.value = cachedPath
      return
    }
    const path = `${assetBasePath}/images/image-${sources.size + 1}.${extensionForMime(parts.mime)}`
    sources.set(src.value, path)
    files.push({ path, content: toUint8Array(parts.base64) })
    src.value = path
  })
  return { html: serialize(fragment), files }
}

function stylesheetLink(path: string): string {
  return `<link rel="stylesheet" href="${path}">`
}

function styleTag(css: string): string {
  return css ? `<style>${css}</style>` : ''
}

async function exportStandaloneHTML(
  document: DesignDocument,
  options: Required<ExportHTMLBundleOptions>
): Promise<ExportHTMLBundle> {
  const size = standaloneSize(document)
  const doc = standaloneDocument(document, size)
  // Several roots sit in a box of their bounds; a single root or a responsive page flows.
  const placed = doc !== document
  const stageCSS = placed
    ? `.kalka-canvas{position:relative;width:${size.width}px;height:${size.height}px}`
    : ''
  let body: string
  const reset = options.reset === 'inline' ? RESET_CSS : ''
  let css = `${reset}${stageCSS}`
  const serialize = { pretty: options.pretty }

  if (options.style === 'tailwind') {
    body = serializeHTML(tidyDesignDocument(doc, { shorthands: false }), {
      ...serialize,
      style: 'tailwind'
    })
    css += await compileTailwindClasses(
      classNamesFromHTML(body),
      await tokenCSS(document, 'tailwind')
    )
  } else {
    css += await tokenCSS(document, 'css')
    // The document's classes are rules of their own; each layer's rule then adds what is its own.
    const graph = document.sourceGraph
    const classed = tidyDesignDocument(graph ? withClassRules(graph, doc) : doc)
    if (graph) css += cssClassStylesheet(documentCSSClasses(graph), { compact: true })
    const rules: string[] = []
    const media: MediaRule[] = []
    const naming: ClassNaming = {
      used: new Set(graph ? documentCSSClasses(graph).map((cssClass) => cssClass.name) : []),
      byRule: new Map()
    }
    const styledDocument: DesignDocument = {
      ...classed,
      children: classed.children.map((node) => extractInlineStyles(node, rules, naming, media))
    }
    body = serializeHTML(styledDocument, serialize)
    css += rules.join('') + mediaCSS(media)
  }
  if (placed)
    body = options.pretty
      ? `<div class="kalka-canvas">\n${body.replace(/^/gm, '  ')}\n</div>`
      : `<div class="kalka-canvas">${body}</div>`

  const external = options.assets === 'external'
  const resetPath = external ? `${options.assetBasePath}/${RESET_FILE}` : RESET_FILE
  const resetFiles: ExportHTMLFile[] =
    options.reset === 'file'
      ? [{ path: resetPath, content: cssText(RESET_CSS, options.pretty) }]
      : []
  const resetLink = resetFiles.length > 0 ? [stylesheetLink(resetPath)] : []

  if (external) {
    const [extracted, fonts] = await Promise.all([
      Promise.resolve(extractImageAssets(body, options.assetBasePath)),
      fontFaceAssets(document, options)
    ])
    const cssPath = `${options.assetBasePath}/kalka.css`
    const html = pageHTML([...resetLink, stylesheetLink(cssPath)], extracted.html, options.pretty)
    return {
      entrypoint: 'index.html',
      files: [
        { path: 'index.html', content: html },
        { path: cssPath, content: cssText(`${fonts.css}${css}`, options.pretty) },
        ...resetFiles,
        ...fonts.files,
        ...extracted.files
      ]
    }
  }

  const style = css ? [styleTag(cssText(css, options.pretty))] : []
  const html = pageHTML([...resetLink, ...style], body, options.pretty)
  return { entrypoint: 'index.html', files: [{ path: 'index.html', content: html }, ...resetFiles] }
}

export async function exportHTMLBundle(
  document: DesignDocument,
  options: ExportHTMLBundleOptions = {}
): Promise<ExportHTMLBundle> {
  const resolvedOptions: Required<ExportHTMLBundleOptions> = {
    html: options.html ?? 'fragment',
    style: options.style ?? 'inline',
    assets: options.assets ?? 'inline',
    fonts: options.fonts ?? 'none',
    assetBasePath: options.assetBasePath ?? 'assets',
    reset: options.reset ?? 'inline',
    pretty: options.pretty ?? false
  }

  if (resolvedOptions.html === 'standalone') return exportStandaloneHTML(document, resolvedOptions)

  return fragmentBundle(
    tidyDesignDocument(document, { shorthands: resolvedOptions.style !== 'tailwind' }),
    resolvedOptions
  )
}

/** The class that marks a fragment's roots, which its scoped reset reaches below. */
const FRAGMENT_ROOT_CLASS = 'kalka-reset'

function usesBrowserDefaults(node: DesignNode): boolean {
  if (node.type === 'text') return false
  return hasBrowserDefaults(node.tagName) || node.children.some(usesBrowserDefaults)
}

/**
 * HTML to paste into another page. When it uses tags the browser styles, such as an `h1`, it
 * comes with the reset that keeps them as designed, scoped to its own marked roots: at its start,
 * or in a `reset.css` file of its own.
 */
function fragmentBundle(
  document: DesignDocument,
  options: Required<ExportHTMLBundleOptions>
): ExportHTMLBundle {
  const serialize = { style: options.style, pretty: options.pretty }
  if (options.reset === 'none' || !document.children.some(usesBrowserDefaults))
    return {
      entrypoint: 'index.html',
      files: [{ path: 'index.html', content: serializeHTML(document, serialize) }]
    }
  const marked: DesignDocument = {
    ...document,
    children: document.children.map((node) =>
      node.type === 'element'
        ? {
            ...node,
            attrs: {
              ...node.attrs,
              class: mergeClassNames(FRAGMENT_ROOT_CLASS, node.attrs.class) ?? FRAGMENT_ROOT_CLASS
            }
          }
        : node
    )
  }
  const reset = cssText(scopedTagResetCSS(`.${FRAGMENT_ROOT_CLASS}`), options.pretty)
  const html = serializeHTML(marked, serialize)
  if (options.reset === 'file')
    return {
      entrypoint: 'index.html',
      files: [
        { path: 'index.html', content: html },
        { path: RESET_FILE, content: reset }
      ]
    }
  const separator = options.pretty ? '\n' : ''
  return {
    entrypoint: 'index.html',
    files: [{ path: 'index.html', content: `${styleTag(reset)}${separator}${html}` }]
  }
}
