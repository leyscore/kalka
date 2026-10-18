/** The prefix of the attributes the editor reads, which exported markup leaves out. */
const EDITOR_PREFIX = 'data-kalka-'

/** The layer id an export marks each element with when its caller asks for them. */
const SOURCE_ID_ATTR = 'data-kalka-node-id'

/** Where the projection keeps a shader layer's settings, which the Kalka folder reads. */
export const EDITOR_SHADER_ATTR = 'data-kalka-shader'

/** Where exported markup keeps a shader layer's settings, so importing it brings the shader back. */
export const SHADER_ATTR = 'data-shader'

/** A shader layer's settings on an element, from exported markup or a Kalka folder page. */
export function shaderSettings(attrs: Readonly<Record<string, string>>): string | undefined {
  return attrs[EDITOR_SHADER_ATTR] ?? attrs[SHADER_ATTR]
}

/**
 * An element's attributes as an export writes them: without the editor's `data-kalka-*` marks,
 * except the layer ids a caller asked for, and with a shader's settings under a plain name.
 */
export function exportAttributes(attrs: Readonly<Record<string, string>>): Record<string, string> {
  const exported: Record<string, string> = {}
  for (const [name, value] of Object.entries(attrs)) {
    if (name === EDITOR_SHADER_ATTR) exported[SHADER_ATTR] = value
    else if (name === SOURCE_ID_ATTR || !name.startsWith(EDITOR_PREFIX)) exported[name] = value
  }
  return exported
}
