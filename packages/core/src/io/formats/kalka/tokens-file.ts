import { isPlainObject } from 'es-toolkit/predicate'
import * as v from 'valibot'

import type { SceneGraph } from '@kalka/scene-graph'

import {
  exportDesignTokens,
  RESOLVER_FILE,
  STYLES_FILE
} from '#core/io/formats/design-tokens/export'
import { readDesignTokens, type DesignTokenBundle } from '#core/io/formats/design-tokens/read'
import { OPENPENCIL_EXTENSION } from '#core/io/formats/design-tokens/types'

const TOKEN_FILE_SUFFIX = '.tokens.json'

const ModeInfoSchema = v.object({ collection: v.string(), mode: v.string() })

function modeInfo(content: Record<string, unknown>) {
  const extensions = isPlainObject(content.$extensions) ? content.$extensions : {}
  const parsed = v.safeParse(ModeInfoSchema, extensions[OPENPENCIL_EXTENSION])
  return parsed.success ? parsed.output : null
}

/**
 * The document's variables as one W3C design token file: a token set per collection mode, named
 * `Collection/Mode`, with Tokens Studio's `$themes` and `$metadata` saying how they combine. Each
 * set is the file the design token export writes for that mode, so Style Dictionary and Figma
 * read a set as they read that file.
 */
export function tokensDocument(graph: SceneGraph): Record<string, unknown> {
  const { files } = exportDesignTokens(graph)
  const sets: Record<string, unknown> = {}
  const themes: Array<{ name: string; group: string; selectedTokenSets: Record<string, string> }> =
    []
  for (const file of files) {
    if (file.path === RESOLVER_FILE || file.path === STYLES_FILE) continue
    if (!file.path.endsWith(TOKEN_FILE_SUFFIX)) continue
    const set = file.path.slice(0, -TOKEN_FILE_SUFFIX.length)
    sets[set] = file.content
    const info = modeInfo(file.content)
    if (info)
      themes.push({
        name: info.mode,
        group: info.collection,
        selectedTokenSets: { [set]: 'enabled' }
      })
  }
  return {
    ...sets,
    $themes: themes,
    $metadata: { tokenSetOrder: Object.keys(sets) }
  }
}

const TokensFileSchema = v.pipe(v.string(), v.parseJson(), v.record(v.string(), v.unknown()))

/**
 * The collections a `tokens.json` holds: the sets Kalka writes, each a mode of the collection its
 * folder names, or, for a plain DTCG file written by hand or by another tool, one collection.
 */
export function readTokensFile(text: string): DesignTokenBundle {
  const parsed = v.safeParse(TokensFileSchema, text)
  if (!parsed.success) throw new Error('design-system/tokens.json is not a JSON object')
  const tokens = parsed.output
  if (!('$themes' in tokens) && !('$metadata' in tokens))
    return readDesignTokens([{ path: 'tokens.json', text }])
  const sets = Object.entries(tokens).filter(
    (entry): entry is [string, Record<string, unknown>] =>
      !entry[0].startsWith('$') && isPlainObject(entry[1])
  )
  return readDesignTokens(
    sets.map(([name, content]) => ({
      path: `${name}${TOKEN_FILE_SUFFIX}`,
      text: JSON.stringify(content)
    }))
  )
}
