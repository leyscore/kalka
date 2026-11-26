export const NUMERIC_FIELDS = new Set([
  'opacity',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'x',
  'y',
  'rotation',
  'cornerRadius',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
  'strokeWeight',
  'borderTopWeight',
  'borderBottomWeight',
  'borderLeftWeight',
  'borderRightWeight',
  'fontSize',
  'letterSpacing',
  'lineHeight',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'itemSpacing',
  'counterAxisSpacing',
  'gridRowGap',
  'gridColumnGap'
])

export function isNumericVariableBindingField(field: string): boolean {
  return NUMERIC_FIELDS.has(field)
}

/** Text content and font family are the string-valued bindings a node accepts. */
export const STRING_BINDING_FIELDS: ReadonlySet<string> = new Set(['text', 'fontFamily'])

/** Visibility is the only boolean-valued binding a node accepts. */
export const BOOLEAN_BINDING_FIELDS: ReadonlySet<string> = new Set(['visible'])

/** The parts of an effect a variable can be bound to, as Figma's `setBoundVariableForEffect`. */
export const EFFECT_BINDING_PROPERTIES = [
  'color',
  'radius',
  'spread',
  'offsetX',
  'offsetY'
] as const

export type EffectBindingProperty = (typeof EFFECT_BINDING_PROPERTIES)[number]

const EFFECT_BINDING = /^effects\/(\d+)\/(color|radius|spread|offsetX|offsetY)$/

/** The binding field of an effect's part, such as `effects/0/radius`. */
export function effectBindingField(index: number, property: EffectBindingProperty): string {
  return `effects/${index}/${property}`
}

/** The effect and part a binding field names, or null when it names no effect. */
export function parseEffectBindingField(
  field: string
): { index: number; property: EffectBindingProperty } | null {
  const match = EFFECT_BINDING.exec(field)
  if (!match) return null
  const property = EFFECT_BINDING_PROPERTIES.find((name) => name === match[2])
  return property ? { index: Number(match[1]), property } : null
}
