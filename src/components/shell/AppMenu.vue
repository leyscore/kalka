<script setup lang="ts">
import { templateRef } from '@vueuse/core'
import {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarItemIndicator,
  MenubarMenu,
  MenubarPortal,
  MenubarRoot,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
} from 'reka-ui'
import { useTemplateRef, watch } from 'vue'
import IconChevronRight from '~icons/hugeicons/chevron-right'

import { shortcutPlatform, useEditorCommands, vTestId } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { useAppMenu } from '@/app/shell/menu/app-menu'
import { useDocumentNameRename } from '@/app/shell/menu/document-name'
import {
  hasMenuSubItems,
  isMenuCheckbox,
  isMenuSeparator,
  menuChecked,
  menuDisabled,
  menuLabel,
  menuShortcut,
  menuSubItems,
  runMenuAction,
  updateMenuChecked
} from '@/app/shell/menu/entry'
import { appMenuShortcutLabel } from '@/app/shell/menu/shortcut'
import { resolvedAppTheme } from '@/app/shell/theme'
import BrandMark from '@/components/brand/BrandMark.vue'
import { useScrollOverflow } from '@/components/shell/useScrollOverflow'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppShortcutText from '@/components/ui/menu/AppShortcutText.vue'
import { useMenuUI } from '@/components/ui/menu/menu'
import { IS_TAURI } from '@/constants'

/** The macOS desktop app keeps its menu in the system menu bar; everywhere else Kalka draws it. */
const showMenubar = !IS_TAURI || shortcutPlatform() !== 'mac'

const store = useEditorStore()

const { rename, editingName, startRename, commitRename } = useDocumentNameRename(store)
const nameInput = templateRef<HTMLInputElement>('nameInput')

watch(nameInput, (input) => {
  if (input) void rename.focusInput(input)
})

const { topMenus } = useAppMenu()
// Undo and redo sit by the document's name, where people look for them first.
const { getCommand } = useEditorCommands()
const undo = getCommand('edit.undo')
const redo = getCommand('edit.redo')
const menuCls = useMenuUI()
const mainMenuCls = useMenuUI({ content: 'min-w-52' })
const subMenuCls = useMenuUI({ content: 'min-w-44' })

// A narrow panel clips the menubar; fade the clipped side and offer a chevron so it reads as scrollable.
const menubar = useTemplateRef<HTMLElement>('menubar')
const { overflowStart, overflowEnd, scrollTowardHidden } = useScrollOverflow(menubar)
</script>

<template>
  <div class="flex min-w-0 items-center gap-2">
    <div class="flex min-w-0 items-center gap-1">
      <BrandMark
        data-test-id="app-logo"
        variant="app-icon"
        :appearance="resolvedAppTheme"
        class="me-1 size-6 rounded-md"
      />
      <input
        v-if="editingName"
        ref="nameInput"
        data-test-id="app-document-name-input"
        class="w-40 min-w-0 rounded-md border border-accent bg-input px-1 py-0.5 text-[13px] font-semibold text-surface outline-none"
        :value="store.state.documentName"
        @blur="commitRename($event)"
        @keydown="rename.onKeydown"
      />
      <span
        v-else
        data-test-id="app-document-name"
        class="max-w-40 min-w-0 cursor-default truncate rounded-md px-1 py-0.5 text-[13px] font-semibold text-surface transition-colors hover:bg-(--pill-hover-bg)"
        @dblclick="startRename"
        >{{ store.state.documentName }}</span
      >
      <IconButton
        :label="`${undo.label} (${appMenuShortcutLabel('undo')})`"
        data-test-id="app-undo"
        class="size-7 rounded-[7px]"
        :disabled="!undo.enabled.value"
        @click="undo.run()"
      >
        <icon-hugeicons-undo-02 class="size-[15px]" />
      </IconButton>
      <IconButton
        :label="`${redo.label} (${appMenuShortcutLabel('redo')})`"
        data-test-id="app-redo"
        class="size-7 rounded-[7px]"
        :disabled="!redo.enabled.value"
        @click="redo.run()"
      >
        <icon-hugeicons-redo-02 class="size-[15px]" />
      </IconButton>
    </div>
    <div v-if="showMenubar" class="flex min-w-0 flex-1 items-center">
      <div
        ref="menubar"
        class="scrollbar-none min-w-0 flex-1 overflow-x-auto data-overflow-end:mask-r-from-[calc(100%-2rem)] data-overflow-start:mask-l-from-[calc(100%-2rem)]"
        :data-overflow-start="overflowStart || undefined"
        :data-overflow-end="overflowEnd || undefined"
      >
        <MenubarRoot class="flex w-max items-center gap-0.5">
          <MenubarMenu v-for="menu in topMenus" :key="menu.label">
            <MenubarTrigger
              v-test-id="`menubar-${menu.label.toLowerCase()}`"
              class="flex cursor-pointer items-center rounded-md px-2 py-1 text-[11px] text-muted transition-colors select-none hover:bg-(--pill-hover-bg) hover:text-surface data-[state=open]:bg-(--pill-hover-bg) data-[state=open]:text-surface"
            >
              {{ menu.label }}
            </MenubarTrigger>

            <MenubarPortal>
              <MenubarContent :side-offset="4" align="start" :class="mainMenuCls.content">
                <template v-for="(item, i) in menu.items" :key="i">
                  <MenubarSeparator v-if="isMenuSeparator(item)" :class="menuCls.separator" />
                  <MenubarSub v-else-if="hasMenuSubItems(item)">
                    <MenubarSubTrigger :class="menuCls.item" :disabled="menuDisabled(item)">
                      <span class="flex-1">{{ menuLabel(item) }}</span>
                      <IconChevronRight class="size-3 text-muted" />
                    </MenubarSubTrigger>
                    <MenubarPortal>
                      <MenubarSubContent :side-offset="4" :class="subMenuCls.content">
                        <template v-for="(sub, j) in menuSubItems(item)" :key="j">
                          <MenubarSeparator
                            v-if="isMenuSeparator(sub)"
                            :class="menuCls.separator"
                          />
                          <MenubarCheckboxItem
                            v-else-if="isMenuCheckbox(sub)"
                            :model-value="menuChecked(sub)"
                            :class="menuCls.item"
                            @update:model-value="updateMenuChecked(sub, $event as boolean)"
                          >
                            <span class="flex-1">{{ menuLabel(sub) }}</span>
                            <MenubarItemIndicator class="text-surface">
                              <icon-hugeicons-check class="size-3.5" />
                            </MenubarItemIndicator>
                          </MenubarCheckboxItem>
                          <MenubarItem
                            v-else
                            :class="menuCls.item"
                            :disabled="menuDisabled(sub)"
                            @select="runMenuAction(sub)"
                          >
                            <span class="flex-1">{{ menuLabel(sub) }}</span>
                            <AppShortcutText v-if="menuShortcut(sub)">{{
                              menuShortcut(sub)
                            }}</AppShortcutText>
                          </MenubarItem>
                        </template>
                      </MenubarSubContent>
                    </MenubarPortal>
                  </MenubarSub>
                  <MenubarCheckboxItem
                    v-else-if="isMenuCheckbox(item)"
                    :model-value="menuChecked(item)"
                    :class="menuCls.item"
                    @update:model-value="updateMenuChecked(item, $event as boolean)"
                  >
                    <span class="flex-1">{{ menuLabel(item) }}</span>
                    <MenubarItemIndicator class="text-surface">
                      <icon-hugeicons-check class="size-3.5" />
                    </MenubarItemIndicator>
                  </MenubarCheckboxItem>
                  <MenubarItem
                    v-else
                    :class="menuCls.item"
                    :disabled="menuDisabled(item)"
                    @select="runMenuAction(item)"
                  >
                    <span class="flex-1">{{ menuLabel(item) }}</span>
                    <AppShortcutText v-if="menuShortcut(item)">{{
                      menuShortcut(item)
                    }}</AppShortcutText>
                  </MenubarItem>
                </template>
              </MenubarContent>
            </MenubarPortal>
          </MenubarMenu>
        </MenubarRoot>
      </div>
      <!-- Sits beside the hidden menus; it keeps its width when it switches sides, so the bar's overflow never flips back.
           Pointer affordance only: arrow keys already move through the menus and scroll them into view. -->
      <button
        v-if="overflowStart || overflowEnd"
        type="button"
        tabindex="-1"
        aria-hidden="true"
        data-test-id="app-menubar-scroll"
        class="flex h-6 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-muted hover:bg-hover hover:text-surface data-start:order-first"
        :data-start="!overflowEnd || undefined"
        @click="scrollTowardHidden"
      >
        <icon-hugeicons-chevron-right v-if="overflowEnd" class="size-3.5" />
        <icon-hugeicons-chevron-left v-else class="size-3.5" />
      </button>
    </div>
  </div>
</template>
