import type { EditorStore } from '@/app/editor/active-store'
import {
  alignText,
  stepFontSize,
  stepFontWeight,
  stepLetterSpacing,
  stepLineHeight,
  toggleStrikethrough,
  toggleTextList
} from '@/app/editor/text/format'
import { requestTextLink } from '@/app/editor/text/links'

/** Figma's Text menu beyond bold, italic and underline, keyed by menu item. */
export function createTextMenuActions(store: EditorStore) {
  return {
    'text.strikethrough': () => toggleStrikethrough(store),
    'text.link': () => requestTextLink(store),
    'text.list-bulleted': () => toggleTextList(store, 'UNORDERED'),
    'text.list-numbered': () => toggleTextList(store, 'ORDERED'),
    'text.align-left': () => alignText(store, 'LEFT'),
    'text.align-center': () => alignText(store, 'CENTER'),
    'text.align-right': () => alignText(store, 'RIGHT'),
    'text.align-justified': () => alignText(store, 'JUSTIFIED'),
    'text.font-size-up': () => stepFontSize(store, 1),
    'text.font-size-down': () => stepFontSize(store, -1),
    'text.font-weight-up': () => void stepFontWeight(store, 1),
    'text.font-weight-down': () => void stepFontWeight(store, -1),
    'text.line-height-up': () => stepLineHeight(store, 1),
    'text.line-height-down': () => stepLineHeight(store, -1),
    'text.letter-spacing-up': () => stepLetterSpacing(store, 1),
    'text.letter-spacing-down': () => stepLetterSpacing(store, -1)
  } satisfies Record<string, () => void>
}

export type TextMenuActionId = keyof ReturnType<typeof createTextMenuActions>
