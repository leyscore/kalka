import { isEqual } from 'es-toolkit/predicate'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { colorToHex } from '@kalka/scene-graph/color'

import { presets } from './presets'
import { allRules } from './rules'
import type {
  LintConfig,
  LintVariables,
  LintMessage,
  LintNode,
  LintResult,
  Rule,
  RuleContext,
  Severity
} from './types'
import { getNodePath } from './utils'

export class Linter {
  private rules = new Map<string, Rule>()
  private ruleConfigs = new Map<string, { severity: Severity; options?: Record<string, unknown> }>()

  constructor(options: { config?: LintConfig; preset?: string; rules?: string[] } = {}) {
    let baseConfig: Record<
      string,
      Severity | { severity: Severity; options?: Record<string, unknown> }
    > = {}
    if (options.preset) baseConfig = { ...presets[options.preset].rules }
    if (options.config?.extends) {
      const ids = Array.isArray(options.config.extends)
        ? options.config.extends
        : [options.config.extends]
      for (const id of ids) baseConfig = { ...baseConfig, ...presets[id].rules }
    }
    if (options.config?.rules) baseConfig = { ...baseConfig, ...options.config.rules }
    const rulesToLoad = options.rules ?? Object.keys(baseConfig)
    for (const ruleId of rulesToLoad) {
      const rule = allRules[ruleId]
      const config = baseConfig[ruleId]
      if (config === 'off') continue
      this.rules.set(ruleId, rule)
      if (typeof config === 'string') this.ruleConfigs.set(ruleId, { severity: config })
      else this.ruleConfigs.set(ruleId, config)
    }
  }

  lintGraph(graph: SceneGraph, rootIds?: string[]): LintResult {
    const roots = rootIds && rootIds.length > 0 ? rootIds : graph.getPages().map((p) => p.id)
    const tree: LintTree = {
      nodes: new Map(),
      variables: describeVariables(graph)
    }
    for (const id of roots) this.capture(graph, tree, id, undefined)
    const messages: LintMessage[] = []
    for (const id of roots) this.lintTree(tree, id, (_id, found) => messages.push(...found))
    return lintResult(messages)
  }

  /**
   * Lints one page and keeps what it found, so that a check after an edit re-checks only the
   * layers the edit touched, the layers inside them and their parents.
   */
  lintPage(graph: SceneGraph, pageId: string): PageLint {
    return new PageLint(this, graph, pageId)
  }

  /** Captures `id` and everything inside it into `tree`, reusing the objects already there. */
  capture(graph: SceneGraph, tree: LintTree, id: string, parent?: LintNode) {
    const raw = graph.getNode(id)
    if (!raw) return
    const fresh = this.toLintNode(graph, raw)
    fresh.parent = parent
    // Layers inside keep pointing at their parent's object, so it is updated in place.
    const existing = tree.nodes.get(id)
    const node = existing ? Object.assign(existing, fresh) : fresh
    tree.nodes.set(id, node)
    for (const childId of raw.childIds) this.capture(graph, tree, childId, node)
  }

  /** The layer as rules see it, without its parent. */
  toLintNode(graph: SceneGraph, raw: SceneNode): LintNode {
    // Rules see the color a paint renders with, including a bound variable in this node's mode.
    const paintColor = (
      field: 'fills' | 'strokes',
      index: number,
      color: SceneNode['fills'][number]['color']
    ) => {
      const variableId = raw.boundVariables[`${field}/${index}/color`]
      return (variableId && graph.resolveColorVariableForNode(raw.id, variableId)) || color
    }
    return {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      width: raw.width,
      height: raw.height,
      x: raw.x,
      y: raw.y,
      rotation: raw.rotation,
      visible: raw.visible,
      locked: raw.locked,
      layoutMode: raw.layoutMode,
      layoutPositioning: raw.layoutPositioning,
      layoutGrow: raw.layoutGrow,
      layoutAlignSelf: raw.layoutAlignSelf,
      primaryAxisSizing: raw.primaryAxisSizing,
      counterAxisSizing: raw.counterAxisSizing,
      textAutoResize: raw.textAutoResize,
      itemSpacing: raw.itemSpacing,
      paddingTop: raw.paddingTop,
      paddingRight: raw.paddingRight,
      paddingBottom: raw.paddingBottom,
      paddingLeft: raw.paddingLeft,
      cornerRadius: raw.cornerRadius,
      childIds: raw.childIds.slice(),
      componentId: raw.componentId || undefined,
      text: raw.text,
      fontSize: raw.fontSize,
      styleRunCount: raw.styleRuns.length,
      boundVariables: raw.boundVariables,
      fills: raw.fills.map((f, index) => ({
        type: f.type,
        visible: f.visible,
        opacity: f.opacity,
        color: f.type === 'SOLID' ? paintColor('fills', index, f.color) : undefined
      })),
      strokes: raw.strokes.map((stroke, index) => ({
        visible: stroke.visible,
        opacity: stroke.opacity,
        color: paintColor('strokes', index, stroke.color)
      })),
      effects: raw.effects.map((effect) => ({
        type: effect.type,
        visible: effect.visible,
        radius: effect.radius
      }))
    }
  }

  /** Lints `id` and the layers inside it, reporting each layer's findings, empty ones too. */
  lintTree(tree: LintTree, id: string, found: (id: string, messages: LintMessage[]) => void) {
    const node = tree.nodes.get(id)
    if (!node) return
    found(id, this.lintNode(tree, node))
    // Instance sublayers mirror their main component: issues there are fixed once in the
    // component, so reporting every placed copy only multiplies the same finding.
    if (node.type === 'INSTANCE') return
    for (const childId of node.childIds) this.lintTree(tree, childId, found)
  }

  /** The findings of the rules on one layer. */
  lintNode(tree: LintTree, node: LintNode): LintMessage[] {
    const messages: LintMessage[] = []
    for (const [ruleId, rule] of this.rules) {
      if (rule.match && !rule.match.includes(node.type)) continue
      const config = this.ruleConfigs.get(ruleId)
      if (!config || config.severity === 'off') continue
      const context: RuleContext = {
        variables: tree.variables,
        report: ({ node, message, suggest, data, fix, suggestions }) => {
          messages.push({
            ruleId,
            severity: config.severity as Exclude<Severity, 'off'>,
            message,
            nodeId: node.id,
            nodeName: node.name,
            nodePath: getNodePath(tree.nodes.get(node.id) ?? node),
            suggest,
            data,
            fix,
            suggestions
          })
        },
        getConfig: () => config.options,
        getParent: (node) => tree.nodes.get(node.id)?.parent ?? null,
        getChildren: (node) =>
          node.childIds
            .map((childId) => tree.nodes.get(childId))
            .filter((child): child is LintNode => !!child)
      }
      rule.check(node, context)
    }
    return messages
  }
}

/** Layers as rules see them, linked to their parents, and the document's variables. */
export interface LintTree {
  nodes: Map<string, LintNode>
  variables: LintVariables
}

function lintResult(messages: LintMessage[]): LintResult {
  return {
    messages,
    errorCount: messages.filter((m) => m.severity === 'error').length,
    warningCount: messages.filter((m) => m.severity === 'warning').length,
    infoCount: messages.filter((m) => m.severity === 'info').length
  }
}

/** What the rules may read of the variables: their values, kinds and modes. */
function variablesKey(graph: SceneGraph): string {
  return JSON.stringify([
    [...graph.variables.values()].map((variable) => [
      variable.id,
      variable.name,
      variable.type,
      variable.valuesByMode
    ]),
    [...graph.variableCollections.values()].map((collection) => [
      collection.id,
      collection.modes,
      collection.defaultModeId
    ])
  ])
}

/**
 * One page linted, kept up to date by {@link touch}ing the layers edits change. A check re-reads
 * each touched layer with what is inside it, and re-checks its parent, whose rules read the
 * layers inside; a change to the variables checks the page again. Gives what
 * {@link Linter.lintGraph} gives for the page.
 */
export class PageLint {
  private readonly tree: LintTree = {
    nodes: new Map(),
    variables: {
      counts: { COLOR: 0, FLOAT: 0, STRING: 0, BOOLEAN: 0 },
      colorsByHex: new Map()
    }
  }
  private readonly found = new Map<string, LintMessage[]>()
  private readonly touched = new Set<string>()
  private variables: string | null = null
  private messages: LintMessage[] | null = null

  constructor(
    private readonly linter: Linter,
    private readonly graph: SceneGraph,
    readonly pageId: string
  ) {}

  /** Marks a layer as created, changed, moved or deleted since the last check. */
  touch(id: string): void {
    this.touched.add(id)
  }

  check(): LintResult {
    const variables = variablesKey(this.graph)
    if (variables !== this.variables) {
      this.variables = variables
      this.tree.variables = describeVariables(this.graph)
      this.touched.clear()
      this.tree.nodes.clear()
      this.found.clear()
      this.linter.capture(this.graph, this.tree, this.pageId)
      this.lint(this.pageId)
      this.messages = null
    } else if (this.touched.size > 0) {
      this.update()
    }
    this.messages ??= this.collect()
    return lintResult(this.messages)
  }

  private update(): void {
    const roots = new Set<string>()
    const parents = new Set<string>()
    for (const id of this.touched) {
      const before = this.tree.nodes.get(id)
      if (before?.parent) parents.add(before.parent.id)
      const raw = this.graph.getNode(id)
      if (!raw || !this.isOnPage(raw.id)) {
        this.forget(id)
        continue
      }
      roots.add(id)
      if (raw.parentId) parents.add(raw.parentId)
    }
    this.touched.clear()
    const outermost = [...roots].filter((id) => !this.hasAncestorIn(id, roots))
    for (const id of outermost) {
      const parentId = this.graph.getNode(id)?.parentId
      this.linter.capture(
        this.graph,
        this.tree,
        id,
        parentId ? this.tree.nodes.get(parentId) : undefined
      )
    }
    for (const id of outermost) this.lint(id)
    for (const id of parents) {
      if (roots.has(id) || this.hasAncestorIn(id, roots)) continue
      const raw = this.graph.getNode(id)
      const node = this.tree.nodes.get(id)
      if (!raw || !node) continue
      Object.assign(node, {
        ...this.linter.toLintNode(this.graph, raw),
        parent: node.parent
      })
      if (!this.insideInstance(node)) this.setFound(id, this.linter.lintNode(this.tree, node))
    }
  }

  /** Records a layer's findings; the page's list is collected again only if they changed. */
  private setFound(id: string, messages: LintMessage[]): void {
    const before = this.found.get(id) ?? []
    if (messages.length > 0) this.found.set(id, messages)
    else this.found.delete(id)
    if (!isEqual(before, messages)) this.messages = null
  }

  private dropFound(id: string): void {
    if (this.found.delete(id)) this.messages = null
  }

  /** Lints a captured layer and what is inside it, unless an instance holds it. */
  private lint(id: string): void {
    const node = this.tree.nodes.get(id)
    if (!node) return
    if (this.insideInstance(node)) {
      this.forgetFindings(id)
      return
    }
    this.linter.lintTree(this.tree, id, (nodeId, messages) => this.setFound(nodeId, messages))
  }

  /** The findings in page order, as a full lint lists them. */
  private collect(): LintMessage[] {
    const messages: LintMessage[] = []
    const visit = (id: string) => {
      const node = this.tree.nodes.get(id)
      if (!node) return
      const found = this.found.get(id)
      if (found) messages.push(...found)
      if (node.type === 'INSTANCE') return
      for (const childId of node.childIds) visit(childId)
    }
    visit(this.pageId)
    return messages
  }

  private forget(id: string): void {
    const node = this.tree.nodes.get(id)
    this.tree.nodes.delete(id)
    this.dropFound(id)
    for (const childId of node?.childIds ?? []) {
      if (this.tree.nodes.get(childId)?.parent === node) this.forget(childId)
    }
  }

  private forgetFindings(id: string): void {
    this.dropFound(id)
    for (const childId of this.tree.nodes.get(id)?.childIds ?? []) this.forgetFindings(childId)
  }

  private insideInstance(node: LintNode): boolean {
    for (let current = node.parent; current; current = current.parent) {
      if (current.type === 'INSTANCE') return true
    }
    return false
  }

  private isOnPage(id: string): boolean {
    for (
      let node = this.graph.getNode(id);
      node;
      node = node.parentId ? this.graph.getNode(node.parentId) : undefined
    ) {
      if (node.id === this.pageId) return true
    }
    return false
  }

  private hasAncestorIn(id: string, ids: ReadonlySet<string>): boolean {
    for (
      let parentId = this.graph.getNode(id)?.parentId;
      parentId;
      parentId = this.graph.getNode(parentId)?.parentId
    ) {
      if (ids.has(parentId)) return true
    }
    return false
  }
}

function describeVariables(graph: SceneGraph): LintVariables {
  const counts = { COLOR: 0, FLOAT: 0, STRING: 0, BOOLEAN: 0 }
  const colorsByHex = new Map<string, { id: string; name: string }>()
  for (const variable of graph.variables.values()) {
    counts[variable.type]++
    if (variable.type !== 'COLOR') continue
    const color = graph.resolveColorVariable(variable.id)
    if (!color || color.a < 1) continue
    const hex = colorToHex(color)
    if (!colorsByHex.has(hex)) colorsByHex.set(hex, { id: variable.id, name: variable.name })
  }
  return { counts, colorsByHex }
}

export function createLinter(options?: { config?: LintConfig; preset?: string; rules?: string[] }) {
  return new Linter(options)
}
