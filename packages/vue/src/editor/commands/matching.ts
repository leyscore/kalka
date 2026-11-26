import type { SelectSameKind } from '@kalka/core/editor'

import type { EditorCommandMapOptions } from './context'
import type { EditorCommand, EditorCommandId } from './types'

export type MatchingCommandId = Extract<
  EditorCommandId,
  'selection.selectMatchingLayers' | `selection.selectSame${string}`
>

/** Edit ▸ Select all with same …, in Figma's order. */
export const SELECT_SAME_COMMAND_IDS = [
  'selection.selectSameFill',
  'selection.selectSameStroke',
  'selection.selectSameEffect',
  'selection.selectSameText',
  'selection.selectSameFont',
  'selection.selectSameInstance',
  'selection.selectSameProperties'
] as const satisfies readonly MatchingCommandId[]

export function createMatchingCommands({
  editor,
  capabilities,
  messages: t
}: EditorCommandMapOptions): Record<MatchingCommandId, EditorCommand> {
  const same = (
    id: MatchingCommandId,
    kind: SelectSameKind,
    message: keyof typeof t.value
  ): EditorCommand => ({
    id,
    get label() {
      return t.value[message]
    },
    enabled: capabilities.canSelectMatching,
    run: () => void editor.selectAllWithSame(kind)
  })
  return {
    'selection.selectSameFill': same('selection.selectSameFill', 'fill', 'selectSameFill'),
    'selection.selectSameStroke': same('selection.selectSameStroke', 'stroke', 'selectSameStroke'),
    'selection.selectSameEffect': same('selection.selectSameEffect', 'effect', 'selectSameEffect'),
    'selection.selectSameText': same('selection.selectSameText', 'text', 'selectSameText'),
    'selection.selectSameFont': same('selection.selectSameFont', 'font', 'selectSameFont'),
    'selection.selectSameInstance': same(
      'selection.selectSameInstance',
      'instance',
      'selectSameInstance'
    ),
    'selection.selectSameProperties': same(
      'selection.selectSameProperties',
      'properties',
      'selectSameProperties'
    ),
    'selection.selectMatchingLayers': {
      id: 'selection.selectMatchingLayers',
      get label() {
        return t.value.selectMatchingLayers
      },
      enabled: capabilities.canSelectMatching,
      run: () => void editor.selectMatchingLayers()
    }
  }
}
