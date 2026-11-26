import { uniqBy } from 'es-toolkit'

import { TOOL_SHORTCUTS } from '@kalka/core/editor'
import { editorCommandMetadata, formatShortcut, type ShortcutPlatform, type Tool } from '@kalka/vue'

import type { ShortcutDefinition } from '@/app/shell/keyboard/registry'
import type { AppMenuActionItem, AppMenuEntry, AppMenuGroupSchema } from '@/app/shell/menu/schema'
import { APP_MENU_SCHEMA } from '@/app/shell/menu/schema'

/** Figma's keyboard shortcut categories, in the order its panel shows them. */
export const SHORTCUT_CATEGORIES = [
  'tools',
  'view',
  'zoom',
  'text',
  'shape',
  'selection',
  'edit',
  'transform',
  'arrange',
  'components',
  'file',
  'ai'
] as const

export type ShortcutCategory = (typeof SHORTCUT_CATEGORIES)[number]

/** Labels for keys no menu item names. */
export type ShortcutLabel =
  | 'handHold'
  | 'nudge'
  | 'nudgeLarge'
  | 'editSelection'
  | 'selectParent'
  | 'selectNext'
  | 'selectPrevious'
  | 'deselect'
  | 'setOpacity'
  | 'askAI'
  | 'toggleAI'
  | 'comment'
  | 'commentPins'

export type ShortcutTitle = { menu: string } | { tool: Tool } | { label: ShortcutLabel }

interface ShortcutSource {
  /** What a pressed key records, so the panel can show it as used. */
  ids: string[]
  category: ShortcutCategory
  title: ShortcutTitle
  /** Each way to press it, as `MOD+SHIFT+Z` tokens. */
  combos: string[]
}

export interface ShortcutEntry extends Omit<ShortcutSource, 'combos'> {
  /** Each way to press it, as the platform's key names, one key per item. */
  keys: string[][]
}

const MENU_GROUP_CATEGORY: Partial<Record<string, ShortcutCategory>> = {
  File: 'file',
  Edit: 'edit',
  View: 'view',
  Object: 'shape',
  Text: 'text',
  Arrange: 'arrange'
}

/** Menu items Figma files under another category than the menu Kalka shows them in. */
const MENU_ITEM_CATEGORY: Partial<Record<string, ShortcutCategory>> = {
  'zoom-in': 'zoom',
  'zoom-out': 'zoom',
  'view.zoom100': 'zoom',
  'view.zoomFit': 'zoom',
  'view.zoomSelection': 'zoom',
  'selection.selectAll': 'selection',
  'selection.selectInverse': 'selection',
  'selection.selectMatchingLayers': 'selection',
  'selection.toggleVisibility': 'selection',
  'selection.toggleLock': 'selection',
  'selection.flipHorizontal': 'transform',
  'selection.flipVertical': 'transform',
  'selection.group': 'arrange',
  'selection.frameSelection': 'arrange',
  'selection.ungroup': 'arrange',
  'selection.bringForward': 'arrange',
  'selection.bringToFront': 'arrange',
  'selection.sendBackward': 'arrange',
  'selection.sendToBack': 'arrange',
  'selection.createComponent': 'components',
  'selection.createComponentSet': 'components',
  'selection.detachInstance': 'components',
  settings: 'file'
}

/** Keys bound under another id than the menu item that shows them. */
const REGISTRY_MENU_ITEM: Partial<Record<string, string>> = {
  'close-tab': 'close',
  'open-file': 'open',
  'new-tab': 'new',
  'export-selection-png': 'export-selection',
  'rename-selection': 'selection.rename',
  'toggle-rulers': 'view-rulers',
  'toggle-pixel-grid': 'view-pixel-grid',
  'toggle-pixel-grid-snap': 'snap-pixel-grid',
  'toggle-multiplayer-cursors': 'view-multiplayer-cursors',
  'open-settings': 'settings',
  'toggle-auto-layout': 'selection.wrapInAutoLayout',
  'zoom-in-unmodified': 'zoom-in',
  'zoom-out-unmodified': 'zoom-out',
  'delete-backspace': 'selection.delete',
  delete: 'selection.delete',
  'align-left': 'arrange.align-left',
  'align-center': 'arrange.align-center',
  'align-right': 'arrange.align-right',
  'align-top': 'arrange.align-top',
  'align-middle': 'arrange.align-middle',
  'align-bottom': 'arrange.align-bottom'
}

/** Keys no menu item shows, with the label and category the panel gives them. */
const REGISTRY_OWN_ENTRY: Partial<Record<string, [ShortcutCategory, ShortcutLabel]>> = {
  'ask-about-selection': ['ai', 'askAI'],
  'toggle-ai': ['ai', 'toggleAI'],
  'toggle-comment-mode': ['tools', 'comment'],
  'toggle-comment-pins': ['view', 'commentPins'],
  enter: ['selection', 'editSelection'],
  'select-parent': ['selection', 'selectParent'],
  'select-sibling-1': ['selection', 'selectNext'],
  'select-sibling--1': ['selection', 'selectPrevious'],
  escape: ['selection', 'deselect'],
  opacity: ['transform', 'setOpacity']
}

/** Keys that only mean something in vector editing, which the panel leaves out as Figma does. */
const UNLISTED = new Set(['delete-alt'])

/** The digit keys that set opacity, listed once. */
const OPACITY_PREFIX = 'selection-opacity-'

/** Keys bound outside the registry: holding Space for the hand, and nudging with the arrows. */
const HELD_KEYS: ShortcutSource[] = [
  { ids: ['space-hand'], category: 'tools', title: { label: 'handHold' }, combos: ['Space'] },
  { ids: ['nudge'], category: 'transform', title: { label: 'nudge' }, combos: ['←↑→↓'] },
  {
    ids: ['nudge-large'],
    category: 'transform',
    title: { label: 'nudgeLarge' },
    combos: ['SHIFT+←↑→↓']
  }
]

const KEY_NAMES: Record<string, string> = {
  Equal: '=',
  Minus: '-',
  Slash: '/',
  Backslash: '\\',
  BracketLeft: '[',
  BracketRight: ']',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Enter: '↩',
  Backspace: '⌫',
  Delete: '⌦',
  Escape: 'Esc',
  ArrowLeft: '←',
  ArrowUp: '↑',
  ArrowRight: '→',
  ArrowDown: '↓'
}

const MODIFIER_TOKENS: Record<string, string> = {
  $mod: 'MOD',
  Meta: 'MOD',
  Control: 'CTRL',
  Shift: 'SHIFT',
  Alt: 'ALT'
}

/** A tinykeys binding such as `$mod+Shift+KeyZ` as the token menus use, `MOD+SHIFT+Z`. */
export function tinykeysToToken(keys: string): string {
  const parts = keys.split('+')
  return parts
    .map((part) => {
      // Shift with / types ?, which is how Figma writes its ⌃⇧?.
      if (part === 'Slash' && parts.includes('Shift')) return '?'
      if (part in MODIFIER_TOKENS) return MODIFIER_TOKENS[part]
      if (/^Key[A-Z]$/.test(part)) return part.slice(3)
      if (/^Digit\d$/.test(part)) return part.slice(5)
      return KEY_NAMES[part] ?? part
    })
    .join('+')
}

const MODIFIERS = new Set(['MOD', 'CTRL', 'SHIFT', 'ALT'])
const MAC_ORDER = ['CTRL', 'ALT', 'SHIFT', 'MOD']
const STANDARD_ORDER = ['MOD', 'CTRL', 'ALT', 'SHIFT']

/** The keys of one combination as the platform's keyboard names them, one key per item. */
export function shortcutKeyCaps(token: string, platform: ShortcutPlatform): string[] {
  // `MOD++` would name the plus key; no binding uses it, so a plain split is enough.
  const parts = token.split('+').filter((part) => part !== '')
  const order = platform === 'mac' ? MAC_ORDER : STANDARD_ORDER
  const modifiers = parts
    .filter((part) => MODIFIERS.has(part))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((part) => formatShortcut(part, platform) ?? part)
  const keys = parts.filter((part) => !MODIFIERS.has(part))
  return [...modifiers, ...keys]
}

function menuItems(entries: readonly AppMenuEntry[]): AppMenuActionItem[] {
  return entries.flatMap((entry) =>
    entry.type === 'separator' ? [] : [entry, ...menuItems(entry.sub ?? [])]
  )
}

interface MenuItemInfo {
  item: AppMenuActionItem
  category: ShortcutCategory
}

function menuItemIndex(): Map<string, MenuItemInfo> {
  const index = new Map<string, MenuItemInfo>()
  const groups: readonly AppMenuGroupSchema[] = APP_MENU_SCHEMA
  for (const group of groups) {
    if (group.target === 'native') continue
    for (const item of menuItems(group.items)) {
      if (item.target === 'native') continue
      const category = MENU_ITEM_CATEGORY[item.id] ?? MENU_GROUP_CATEGORY[group.label] ?? 'edit'
      index.set(item.id, { item, category })
    }
  }
  return index
}

/** Where a registry key shows in the panel, or `undefined` when the panel leaves it out. */
export function registryEntryKey(id: string): string | undefined {
  if (UNLISTED.has(id)) return undefined
  if (id.startsWith(OPACITY_PREFIX)) return 'opacity'
  return REGISTRY_MENU_ITEM[id] ?? id
}

/** The tools' own letters, as the toolbar shows them. */
function toolSources(): ShortcutSource[] {
  return Object.entries(TOOL_SHORTCUTS).flatMap(([code, tool]) =>
    tool
      ? [
          {
            ids: [`tool:${code}`],
            category: 'tools' as const,
            title: { tool },
            combos: [tinykeysToToken(code)]
          }
        ]
      : []
  )
}

/** Each way a registry key is pressed on this platform, as menu tokens. */
function registryCombos(
  key: string,
  definition: Pick<ShortcutDefinition, 'keys'>,
  platform: ShortcutPlatform
): string[] {
  if (key === 'opacity') return ['0–9']
  return (
    [definition.keys]
      .flat()
      // A binding on the Meta key is the Mac's; elsewhere it is the Windows key.
      .filter((keys) => platform === 'mac' || !keys.split('+').includes('Meta'))
      .map(tinykeysToToken)
  )
}

function menuShortcut(item: AppMenuActionItem): string | undefined {
  return item.shortcut ?? (item.command ? editorCommandMetadata(item.command).shortcut : undefined)
}

/**
 * The shortcuts the panel lists, built from what the editor binds: the tools, the registry's keys
 * and the menus' own shortcuts. A key without a menu item or a label of its own is reported by
 * `unlabeled`, so a new binding cannot slip past the panel unnoticed.
 */
export function buildShortcutCatalog(
  definitions: readonly Pick<ShortcutDefinition, 'id' | 'keys'>[],
  platform: ShortcutPlatform
): { entries: ShortcutEntry[]; unlabeled: string[] } {
  const menu = menuItemIndex()
  const sources = [...toolSources(), ...structuredClone(HELD_KEYS)]
  const entries = new Map(sources.map((source) => [source.ids[0], source]))
  const unlabeled: string[] = []

  for (const definition of definitions) {
    const key = registryEntryKey(definition.id)
    if (!key) continue
    const own = REGISTRY_OWN_ENTRY[key]
    const info = menu.get(key)
    if (!own && !info) {
      unlabeled.push(definition.id)
      continue
    }
    const combos = registryCombos(key, definition, platform)
    const entry = entries.get(key)
    if (entry) {
      entry.ids.push(definition.id)
      entry.combos.push(...combos)
      continue
    }
    entries.set(key, {
      ids: [definition.id],
      category: own?.[0] ?? info?.category ?? 'edit',
      title: own ? { label: own[1] } : { menu: key },
      combos
    })
  }

  // Shortcuts the menus show and the browser or the text editor handles, such as copy and bold.
  for (const [id, { item, category }] of menu) {
    const shortcut = menuShortcut(item)
    if (shortcut && !entries.has(id))
      entries.set(id, { ids: [id], category, title: { menu: id }, combos: [shortcut] })
  }

  const listed = [...entries.values()].map(({ combos, ...entry }) => ({
    ...entry,
    keys: uniqBy(
      combos.map((combo) => shortcutKeyCaps(combo, platform)),
      (caps) => caps.join(' ')
    )
  }))
  return {
    entries: SHORTCUT_CATEGORIES.flatMap((category) =>
      listed.filter((entry) => entry.category === category)
    ),
    unlabeled
  }
}
