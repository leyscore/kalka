import type {
  CodeSyntaxPlatform,
  Color,
  SceneGraph,
  Variable as GraphVariable,
  VariableCollection as GraphVariableCollection,
  VariableScope,
  VariableType,
  VariableValue as GraphVariableValue
} from '@kalka/scene-graph'

import { reconcileVariableLayouts } from '#core/layout/variables'

/** A reference to a variable, as Figma's `VariableAlias`. */
export interface FigmaVariableAlias {
  type: 'VARIABLE_ALIAS'
  id: string
}

/** A variable's value as Figma's plugin API reads and writes it. */
export type FigmaVariableValue =
  | boolean
  | string
  | number
  | (Omit<Color, 'a'> & Partial<Pick<Color, 'a'>>)
  | FigmaVariableAlias

/** Paints a variable can be bound to: a solid paint, as `setBoundVariableForPaint` takes. */
export interface FigmaBindablePaint {
  type: string
  boundVariables?: { color?: FigmaVariableAlias }
  [key: string]: unknown
}

interface VariablesHost {
  readonly graph: SceneGraph
}

const RESOLVED_TYPES: ReadonlySet<string> = new Set<VariableType>([
  'COLOR',
  'FLOAT',
  'STRING',
  'BOOLEAN'
])

export function variableAlias(id: string): FigmaVariableAlias {
  return { type: 'VARIABLE_ALIAS', id }
}

/** The variable ID an alias or a variable handle names, or null for anything else. */
export function aliasedVariableId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const id = Reflect.get(value, 'id')
  return typeof id === 'string' ? id : null
}

function isAlias(value: unknown): value is FigmaVariableAlias {
  return (
    !!value &&
    typeof value === 'object' &&
    Reflect.get(value, 'type') === 'VARIABLE_ALIAS' &&
    typeof Reflect.get(value, 'id') === 'string'
  )
}

function channel(value: object, name: keyof Color): number | undefined {
  const channelValue: unknown = Reflect.get(value, name)
  return typeof channelValue === 'number' ? channelValue : undefined
}

const SCALAR_TYPES = { FLOAT: 'number', STRING: 'string', BOOLEAN: 'boolean' } as const

function isScalarOf(
  type: keyof typeof SCALAR_TYPES,
  value: unknown
): value is number | string | boolean {
  return typeof value === SCALAR_TYPES[type]
}

function toFigmaValue(value: GraphVariableValue): FigmaVariableValue {
  if (typeof value === 'object' && 'aliasId' in value) return variableAlias(value.aliasId)
  if (typeof value === 'object') return { ...value }
  return value
}

/** Checks a script's value against the variable's type, as Figma does, and stores it as Kalka does. */
function fromFigmaValue(
  graph: SceneGraph,
  variable: GraphVariable,
  value: unknown
): GraphVariableValue {
  if (isAlias(value)) {
    const target = graph.variables.get(value.id)
    if (!target) throw new Error(`Variable "${value.id}" not found`)
    if (target.type !== variable.type) {
      throw new Error(
        `Mismatched variable resolved type: alias to ${target.type} for a ${variable.type} variable`
      )
    }
    return { aliasId: value.id }
  }
  const mismatch = () =>
    new Error(`Mismatched variable resolved type: ${JSON.stringify(value)} for ${variable.type}`)
  if (variable.type === 'FLOAT' || variable.type === 'STRING' || variable.type === 'BOOLEAN') {
    if (!isScalarOf(variable.type, value)) throw mismatch()
    return value
  }
  if (!value || typeof value !== 'object') throw mismatch()
  const [r, g, b] = [channel(value, 'r'), channel(value, 'g'), channel(value, 'b')]
  if (r === undefined || g === undefined || b === undefined) throw mismatch()
  return { r, g, b, a: channel(value, 'a') ?? 1 }
}

/** A variable as Figma's plugin API hands it to scripts: a live handle on the document's variable. */
export class FigmaVariable {
  constructor(
    private readonly graph: SceneGraph,
    readonly id: string
  ) {}

  private get raw(): GraphVariable {
    const variable = this.graph.variables.get(this.id)
    if (!variable) throw new Error(`The variable ${this.id} has been removed`)
    return variable
  }

  get name(): string {
    return this.raw.name
  }
  set name(value: string) {
    this.raw.name = value
  }
  get description(): string {
    return this.raw.description
  }
  set description(value: string) {
    this.raw.description = value
  }
  get hiddenFromPublishing(): boolean {
    return this.raw.hiddenFromPublishing
  }
  set hiddenFromPublishing(value: boolean) {
    this.raw.hiddenFromPublishing = value
  }
  get resolvedType(): VariableType {
    return this.raw.type
  }
  get variableCollectionId(): string {
    return this.raw.collectionId
  }
  get remote(): boolean {
    return false
  }
  get key(): string {
    return ''
  }
  get scopes(): VariableScope[] {
    return [...(this.raw.scopes ?? ['ALL_SCOPES'])]
  }
  set scopes(value: VariableScope[]) {
    this.raw.scopes = [...value]
  }
  get codeSyntax(): Partial<Record<CodeSyntaxPlatform, string>> {
    return { ...this.raw.codeSyntax }
  }
  setVariableCodeSyntax(platform: CodeSyntaxPlatform, value: string): void {
    this.raw.codeSyntax = { ...this.raw.codeSyntax, [platform]: value }
  }
  removeVariableCodeSyntax(platform: CodeSyntaxPlatform): void {
    const { [platform]: _removed, ...rest } = this.raw.codeSyntax ?? {}
    this.raw.codeSyntax = rest
  }

  get valuesByMode(): Record<string, FigmaVariableValue> {
    return Object.fromEntries(
      Object.entries(this.raw.valuesByMode).map(([modeId, value]) => [modeId, toFigmaValue(value)])
    )
  }

  setValueForMode(modeId: string, newValue: FigmaVariableValue): void {
    const variable = this.raw
    const collection = this.graph.variableCollections.get(variable.collectionId)
    if (!collection?.modes.some((mode) => mode.modeId === modeId)) {
      throw new Error(`Invalid modeId "${modeId}" for the variable's collection`)
    }
    variable.valuesByMode[modeId] = fromFigmaValue(this.graph, variable, newValue)
    reconcileVariableLayouts(this.graph, { variables: [this.id] })
  }

  /** The value the variable takes for a layer, in the modes the layer resolves. */
  resolveForConsumer(consumer: { readonly id: string }): {
    value: FigmaVariableValue
    resolvedType: VariableType
  } {
    const value = this.graph.resolveVariableForNode(consumer.id, this.id)
    if (value === undefined) throw new Error(`The variable ${this.id} has no value for the layer`)
    return { value: toFigmaValue(value), resolvedType: this.resolvedType }
  }

  remove(): void {
    this.graph.removeVariable(this.id)
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      resolvedType: this.resolvedType,
      variableCollectionId: this.variableCollectionId,
      valuesByMode: this.valuesByMode
    }
  }
}

/** A variable collection as Figma's plugin API hands it to scripts. */
export class FigmaVariableCollection {
  constructor(
    private readonly graph: SceneGraph,
    readonly id: string
  ) {}

  private get raw(): GraphVariableCollection {
    const collection = this.graph.variableCollections.get(this.id)
    if (!collection) throw new Error(`The variable collection ${this.id} has been removed`)
    return collection
  }

  get name(): string {
    return this.raw.name
  }
  set name(value: string) {
    this.raw.name = value
  }
  get hiddenFromPublishing(): boolean {
    return false
  }
  get remote(): boolean {
    return false
  }
  get isExtension(): boolean {
    return false
  }
  get key(): string {
    return ''
  }
  get modes(): Array<{ modeId: string; name: string }> {
    return this.raw.modes.map(({ modeId, name }) => ({ modeId, name }))
  }
  get defaultModeId(): string {
    return this.raw.defaultModeId
  }
  get variableIds(): string[] {
    return [...this.raw.variableIds]
  }

  addMode(name: string): string {
    const modeId = this.graph.createMode(this.id, name, this.raw.defaultModeId)
    if (!modeId) throw new Error(`The variable collection ${this.id} has been removed`)
    return modeId
  }

  renameMode(modeId: string, newName: string): void {
    this.requireMode(modeId)
    this.graph.renameMode(this.id, modeId, newName)
  }

  removeMode(modeId: string): void {
    this.requireMode(modeId)
    if (this.raw.modes.length <= 1) throw new Error('A collection must keep at least one mode')
    this.graph.removeMode(this.id, modeId)
  }

  remove(): void {
    this.graph.removeCollection(this.id)
  }

  private requireMode(modeId: string): void {
    if (!this.raw.modes.some((mode) => mode.modeId === modeId)) {
      throw new Error(`Invalid modeId "${modeId}" for the collection ${this.name}`)
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      modes: this.modes,
      defaultModeId: this.defaultModeId,
      variableIds: this.variableIds
    }
  }
}

/** `figma.variables`: Figma's variables API over the document's variables. */
export class FigmaVariablesAPI {
  constructor(private readonly host: VariablesHost) {}

  private get graph(): SceneGraph {
    return this.host.graph
  }

  getVariableById(id: string): FigmaVariable | null {
    return this.graph.variables.has(id) ? new FigmaVariable(this.graph, id) : null
  }
  async getVariableByIdAsync(id: string): Promise<FigmaVariable | null> {
    return this.getVariableById(id)
  }
  getVariableCollectionById(id: string): FigmaVariableCollection | null {
    return this.graph.variableCollections.has(id)
      ? new FigmaVariableCollection(this.graph, id)
      : null
  }
  async getVariableCollectionByIdAsync(id: string): Promise<FigmaVariableCollection | null> {
    return this.getVariableCollectionById(id)
  }
  getLocalVariables(type?: VariableType): FigmaVariable[] {
    return [...this.graph.variables.values()]
      .filter((variable) => !type || variable.type === type)
      .map((variable) => new FigmaVariable(this.graph, variable.id))
  }
  async getLocalVariablesAsync(type?: VariableType): Promise<FigmaVariable[]> {
    return this.getLocalVariables(type)
  }
  getLocalVariableCollections(): FigmaVariableCollection[] {
    return [...this.graph.variableCollections.keys()].map(
      (id) => new FigmaVariableCollection(this.graph, id)
    )
  }
  async getLocalVariableCollectionsAsync(): Promise<FigmaVariableCollection[]> {
    return this.getLocalVariableCollections()
  }

  createVariableCollection(name: string): FigmaVariableCollection {
    return new FigmaVariableCollection(this.graph, this.graph.createCollection(name).id)
  }

  createVariable(
    name: string,
    collection: FigmaVariableCollection | string,
    resolvedType: VariableType
  ): FigmaVariable {
    if (!RESOLVED_TYPES.has(resolvedType)) {
      throw new Error(`Kalka does not support ${String(resolvedType)} variables`)
    }
    const collectionId = typeof collection === 'string' ? collection : collection.id
    if (!this.graph.variableCollections.has(collectionId)) {
      throw new Error(`Variable collection "${collectionId}" not found`)
    }
    return new FigmaVariable(
      this.graph,
      this.graph.createVariable(name, resolvedType, collectionId).id
    )
  }

  createVariableAlias(variable: { readonly id: string }): FigmaVariableAlias {
    return variableAlias(variable.id)
  }
  async createVariableAliasByIdAsync(variableId: string): Promise<FigmaVariableAlias> {
    if (!this.graph.variables.has(variableId)) {
      throw new Error(`Variable "${variableId}" not found`)
    }
    return variableAlias(variableId)
  }

  /** A copy of a solid paint bound to a color variable, or unbound with null; assign it to a layer. */
  setBoundVariableForPaint<Paint extends FigmaBindablePaint>(
    paint: Paint,
    field: string,
    variable: { readonly id: string } | null
  ): Paint {
    if (paint.type !== 'SOLID') throw new Error('Only solid paints can be bound to variables')
    if (field !== 'color') throw new Error(`Paints bind only their color, not "${field}"`)
    const { color: _color, ...rest } = paint.boundVariables ?? {}
    if (!variable) return { ...paint, boundVariables: rest }
    const bound = this.graph.variables.get(variable.id)
    if (!bound) throw new Error(`Variable "${variable.id}" not found`)
    if (bound.type !== 'COLOR')
      throw new Error(`Cannot bind ${bound.type} variable to a paint color`)
    const value = this.graph.resolveColorVariable(variable.id)
    return {
      ...paint,
      ...(value ? { color: { r: value.r, g: value.g, b: value.b } } : {}),
      boundVariables: { ...rest, color: variableAlias(variable.id) }
    }
  }
}
