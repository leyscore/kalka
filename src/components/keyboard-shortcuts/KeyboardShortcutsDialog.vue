<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { MenuEntry, Tool } from '@kalka/vue'
import { shortcutPlatform, useI18n, useShortcutsMessages } from '@kalka/vue'

import {
  buildShortcutCatalog,
  SHORTCUT_CATEGORIES,
  type ShortcutCategory,
  type ShortcutEntry
} from '@/app/shell/keyboard/catalog'
import { shortcutsHelpOpen, usedShortcuts } from '@/app/shell/keyboard/help'
import { editorShortcutDefinitions } from '@/app/shell/keyboard/registry'
import { useAppMenu } from '@/app/shell/menu/app-menu'
import AppDialog from '@/components/ui/dialog/AppDialog.vue'
import AppInput from '@/components/ui/input/AppInput.vue'

// Figma's Keyboard shortcuts panel, listing what the editor really binds.
const messages = useShortcutsMessages()
const { tools } = useI18n()
const { topMenus } = useAppMenu()
const query = ref('')

const { entries } = buildShortcutCatalog(editorShortcutDefinitions(), shortcutPlatform())

watch(shortcutsHelpOpen, (open) => {
  if (open) query.value = ''
})

const CATEGORY_LABELS: Record<ShortcutCategory, () => string> = {
  tools: () => messages.value.categoryTools,
  view: () => messages.value.categoryView,
  zoom: () => messages.value.categoryZoom,
  text: () => messages.value.categoryText,
  shape: () => messages.value.categoryShape,
  selection: () => messages.value.categorySelection,
  edit: () => messages.value.categoryEdit,
  transform: () => messages.value.categoryTransform,
  arrange: () => messages.value.categoryArrange,
  components: () => messages.value.categoryComponents,
  file: () => messages.value.categoryFile,
  ai: () => messages.value.categoryAI
}

const TOOL_LABELS: Record<Tool, () => string> = {
  SELECT: () => tools.value.move,
  FRAME: () => tools.value.frame,
  SECTION: () => tools.value.section,
  RECTANGLE: () => tools.value.rectangle,
  ELLIPSE: () => tools.value.ellipse,
  LINE: () => tools.value.line,
  ARROW: () => tools.value.arrow,
  POLYGON: () => tools.value.polygon,
  STAR: () => tools.value.star,
  PEN: () => tools.value.pen,
  PENCIL: () => tools.value.pencil,
  SCALE: () => tools.value.scale,
  TEXT: () => tools.value.text,
  HAND: () => tools.value.hand
}

/** The menus' own labels, translated, by item id. */
const menuLabels = computed(() => {
  const labels = new Map<string, string>()
  const visit = (items: MenuEntry[]) => {
    for (const item of items) {
      if ('separator' in item) continue
      if (item.menuId && item.label) labels.set(item.menuId, item.label.replace(/…$/, ''))
      visit(item.sub ?? [])
    }
  }
  for (const group of topMenus.value) visit(group.items)
  return labels
})

function label(entry: ShortcutEntry): string {
  const { title } = entry
  if ('tool' in title) return TOOL_LABELS[title.tool]()
  if ('label' in title) return messages.value[title.label]
  return menuLabels.value.get(title.menu) ?? title.menu
}

const used = computed(() => new Set(usedShortcuts.value))
const isUsed = (entry: ShortcutEntry) => entry.ids.some((id) => used.value.has(id))

const sections = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return SHORTCUT_CATEGORIES.flatMap((category) => {
    const categoryLabel = CATEGORY_LABELS[category]()
    const rows = entries
      .filter((entry) => entry.category === category)
      .map((entry) => ({ entry, label: label(entry), used: isUsed(entry) }))
      .filter(
        (row) =>
          !search ||
          row.label.toLocaleLowerCase().includes(search) ||
          categoryLabel.toLocaleLowerCase().includes(search)
      )
    return rows.length > 0 ? [{ category, label: categoryLabel, rows }] : []
  })
})
</script>

<template>
  <AppDialog
    v-model:open="shortcutsHelpOpen"
    :heading="messages.title"
    :description="messages.description"
    size="xl"
    height="tall"
    data-test-id="keyboard-shortcuts"
  >
    <div class="@container/shortcuts flex min-h-0 flex-col gap-3">
      <AppInput
        v-model="query"
        type="search"
        autofocus
        :placeholder="messages.filter"
        :aria-label="messages.filter"
      />
      <p v-if="sections.length === 0" class="py-6 text-center text-xs text-muted">
        {{ messages.noMatches }}
      </p>
      <div class="columns-1 gap-6 @2xl/shortcuts:columns-2 @4xl/shortcuts:columns-3">
        <section
          v-for="section in sections"
          :key="section.category"
          :aria-label="section.label"
          class="mb-4 break-inside-avoid"
        >
          <h3 class="mb-1 px-1.5 text-[11px] font-medium text-muted">{{ section.label }}</h3>
          <ul>
            <li
              v-for="row in section.rows"
              :key="row.entry.ids[0]"
              :data-used="row.used ? '' : undefined"
              class="flex min-h-7 items-center justify-between gap-3 rounded-md px-1.5 text-xs text-muted data-[used]:bg-accent/10 data-[used]:text-surface"
            >
              <span class="min-w-0 truncate">
                {{ row.label }}
                <span v-if="row.used" class="sr-only">, {{ messages.used }}</span>
              </span>
              <span class="flex shrink-0 flex-wrap justify-end gap-x-3 gap-y-1">
                <kbd
                  v-for="caps in row.entry.keys"
                  :key="caps.join(' ')"
                  class="flex gap-0.5 font-sans"
                >
                  <kbd
                    v-for="(cap, index) in caps"
                    :key="index"
                    class="min-w-5 rounded border border-hairline bg-panel-field px-1 text-center text-[11px] leading-[18px] text-surface"
                  >
                    {{ cap }}
                  </kbd>
                </kbd>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </AppDialog>
</template>
