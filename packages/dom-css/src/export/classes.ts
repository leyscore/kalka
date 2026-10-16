import {
  createDefaultNode,
  cssClassKind,
  documentCSSClasses,
  type CSSClass,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import type { DesignDocument, DesignNode, DesignStyleDeclaration } from '../types'
import { standaloneLayerStyle } from './projection'

/** The value that undoes a class declaration a layer does not have. */
const UNSET = 'initial'

function templateType(cssClass: CSSClass): 'TEXT' | 'FRAME' {
  return cssClass.kind === 'text' ? 'TEXT' : 'FRAME'
}

/**
 * The declarations of a class rule: the CSS its fields write on a layer of its kind, without
 * what a new layer of that kind writes anyway.
 */
export function cssClassDeclarations(cssClass: CSSClass): DesignStyleDeclaration {
  const base = createDefaultNode(() => '', templateType(cssClass))
  const plain = standaloneLayerStyle(base)
  const styled = standaloneLayerStyle({ ...base, ...structuredClone(cssClass.style) })
  return Object.fromEntries(Object.entries(styled).filter(([name, value]) => plain[name] !== value))
}

/** What the rules of a layer's classes declare together, later rules winning. */
export function classRuleStyle(
  classes: readonly CSSClass[],
  names: readonly string[],
  kind: CSSClass['kind']
): DesignStyleDeclaration {
  const style: DesignStyleDeclaration = {}
  for (const cssClass of classes)
    if (cssClass.kind === kind && names.includes(cssClass.name))
      Object.assign(style, cssClassDeclarations(cssClass))
  return style
}

/**
 * A layer's inline style once its class rules apply: only the declarations that differ from
 * theirs. A rule declaration the layer lacks is undone first, so a shorthand the layer writes
 * after it still applies.
 */
export function inlineStyleOverClasses(
  style: DesignStyleDeclaration,
  rules: DesignStyleDeclaration
): DesignStyleDeclaration {
  const inline: DesignStyleDeclaration = {}
  for (const name of Object.keys(rules)) if (!(name in style)) inline[name] = UNSET
  for (const [name, value] of Object.entries(style)) if (rules[name] !== value) inline[name] = value
  return inline
}

export function nodeClassRuleStyle(graph: SceneGraph, node: SceneNode): DesignStyleDeclaration {
  if (node.htmlClasses.length === 0) return {}
  return classRuleStyle(documentCSSClasses(graph), node.htmlClasses, cssClassKind(node))
}

function withRules(graph: SceneGraph, node: DesignNode): DesignNode {
  if (node.type === 'text') return node
  const children = node.children.map((child) => withRules(graph, child))
  const layer = node.sourceSceneNode
  const rules = layer ? nodeClassRuleStyle(graph, layer) : {}
  if (Object.keys(rules).length === 0 || !node.inlineStyle) return { ...node, children }
  return { ...node, children, inlineStyle: inlineStyleOverClasses(node.inlineStyle, rules) }
}

/**
 * A projected document for a page that loads the class stylesheet: each layer with classes keeps
 * inline only what its class rules do not already declare.
 */
export function withClassRules(graph: SceneGraph, document: DesignDocument): DesignDocument {
  if (documentCSSClasses(graph).length === 0) return document
  return { ...document, children: document.children.map((node) => withRules(graph, node)) }
}

/** A class name as a CSS selector, escaped as `CSS.escape` would. */
export function classSelector(name: string): string {
  let escaped = ''
  for (const char of name) {
    if (/[0-9]/.test(char) && escaped === '') escaped += `\\3${char} `
    else if (/[a-zA-Z0-9_-]/.test(char)) escaped += char
    else escaped += `\\${char}`
  }
  return `.${escaped}`
}

/** The document's classes as a stylesheet, one rule per class in their order. */
export function cssClassStylesheet(
  classes: readonly CSSClass[],
  { compact = false }: { compact?: boolean } = {}
): string {
  return classes
    .map((cssClass) => {
      const declarations = Object.entries(cssClassDeclarations(cssClass))
      if (compact)
        return `${classSelector(cssClass.name)}{${declarations.map(([name, value]) => `${name}:${value}`).join(';')}}`
      const body = declarations.map(([name, value]) => `  ${name}: ${value};`).join('\n')
      return `${classSelector(cssClass.name)} {\n${body}\n}\n`
    })
    .join(compact ? '' : '\n')
}
