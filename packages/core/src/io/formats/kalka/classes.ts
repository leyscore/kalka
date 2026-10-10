import { isEqual } from 'es-toolkit'

import {
  cssClassDeclarations,
  cssClassStylesheet,
  HTML_TAG_RESET_CSS
} from '@open-pencil/dom-css/export'
import { cssClassFromRule, parseClassRules, type ClassRule } from '@open-pencil/dom-css/import'
import {
  cssClassKind,
  documentCSSClasses,
  type CSSClass,
  type CSSClassKind,
  type SceneGraph
} from '@open-pencil/scene-graph'

const STYLES_HEADER = `/*
 * Styles every page of this Kalka document shares: the document's classes, which layers name in
 * their class attribute, after the rules below. A layer's own style stays inline.
 */
[hidden] {
  display: none !important;
}

/* Layers written as an h1, a list or a button draw as their own CSS says. */
${HTML_TAG_RESET_CSS}
`

/** `styles.css`: the shared rules, then one rule per class in the document's order. */
export function stylesFile(graph: SceneGraph): string {
  const classes = cssClassStylesheet(documentCSSClasses(graph))
  return classes ? `${STYLES_HEADER}\n${classes}` : STYLES_HEADER
}

/** The class rules of `styles.css`, which pages rely on when they are read. */
export function readClassRules(text: string | undefined): ClassRule[] {
  return text === undefined ? [] : parseClassRules(text)
}

function usedKind(graph: SceneGraph, name: string): CSSClassKind {
  const user = [...graph.getAllNodes()].find((node) => node.htmlClasses.includes(name))
  return user ? cssClassKind(user) : 'box'
}

/**
 * The document's classes once its pages are read: one per rule of `styles.css`, in its order. A
 * class whose rule is as Kalka wrote it keeps the exact fields `project.json` saved; a rule edited
 * or added by hand becomes the class its declarations describe.
 */
export function reconcileClasses(graph: SceneGraph, rules: readonly ClassRule[]): void {
  const root = graph.getNode(graph.rootId)
  if (!root) return
  const saved = new Map(root.cssClasses.map((cssClass) => [cssClass.name, cssClass]))
  const classes: CSSClass[] = []
  for (const rule of rules) {
    if (classes.some((cssClass) => cssClass.name === rule.name)) continue
    const known = saved.get(rule.name)
    if (known && isEqual(cssClassDeclarations(known), rule.declarations)) classes.push(known)
    else classes.push(cssClassFromRule(rule, known?.kind ?? usedKind(graph, rule.name)))
  }
  root.cssClasses = classes
}
