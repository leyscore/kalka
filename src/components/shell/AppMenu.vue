<script setup lang="ts">
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from 'reka-ui'
import { computed } from 'vue'
import IconChevronRight from '~icons/hugeicons/chevron-right'

import { shortcutPlatform, useEditorCommands, useI18n, vTestId } from '@kalka/vue'

import { serverAccount } from '@/app/collab/server/account'
import { isServerRoom } from '@/app/collab/server/documents'
import { useCollabInjected } from '@/app/collab/use'
import { useDocumentViewOnly } from '@/app/collab/view-only'
import { useAppMenu } from '@/app/shell/menu/app-menu'
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
import { resolvedAppTheme } from '@/app/shell/theme'
import BrandMark from '@/components/brand/BrandMark.vue'
import ServerFileChip from '@/components/collab-panel/ServerFileChip.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppShortcutText from '@/components/ui/menu/AppShortcutText.vue'
import { useMenuUI } from '@/components/ui/menu/menu'
import { IS_TAURI } from '@/constants'

/**
 * The start of the editor's top bar: the menu, the tabs it is given, then undo and redo. In the
 * desktop app the bar moves the window, so each control here opts out of the drag (`no-drag`).
 * The macOS desktop app keeps its menu in the system menu bar; everywhere else the logo opens it,
 * each menu a submenu, so the bar keeps its room for the tabs.
 */
const showMenubar = !IS_TAURI || shortcutPlatform() !== 'mac'

const collab = useCollabInjected()
/** The server that keeps the active document, when it is a server document. */
const documentServer = computed(() => {
  const roomId = collab?.state.value.roomId
  return roomId && isServerRoom(roomId) ? (serverAccount.value?.serverName ?? null) : null
})

/** Read-only by the account's role, or because the file is shared to view. */
const viewOnly = useDocumentViewOnly()

const { topMenus } = useAppMenu()
// Undo and redo sit by the document's name, where people look for them first.
const { getCommand } = useEditorCommands()
const undo = getCommand('edit.undo')
const redo = getCommand('edit.redo')

/** A command's name with the shortcut its menu entry shows, for the button's tip. */
function tip(label: string): string {
  for (const menu of topMenus.value) {
    const entry = menu.items.find((item) => menuLabel(item) === label)
    const shortcut = entry ? menuShortcut(entry) : undefined
    if (shortcut) return `${label} (${shortcut})`
  }
  return label
}
const menuCls = useMenuUI()
const mainMenuCls = useMenuUI({ content: 'min-w-52' })
const subMenuCls = useMenuUI({ content: 'min-w-44' })
const { menu: menuMessages } = useI18n()
</script>

<template>
  <div class="flex min-w-0 items-center gap-2">
    <div class="flex min-w-0 items-center gap-1">
      <!-- Not modal: an entry may open a dialog, which must own the page as soon as the menu closes. -->
      <DropdownMenuRoot v-if="showMenubar" :modal="false">
        <DropdownMenuTrigger
          data-test-id="app-menu-trigger"
          :aria-label="menuMessages.mainMenu"
          class="no-drag me-1 flex shrink-0 cursor-pointer items-center gap-0.5 rounded-lg p-0.5 pe-1 text-muted outline-none transition-colors hover:bg-(--pill-hover-bg) hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-[state=open]:bg-(--pill-hover-bg) data-[state=open]:text-surface"
        >
          <BrandMark
            data-test-id="app-logo"
            variant="app-icon"
            :appearance="resolvedAppTheme"
            class="size-6 rounded-md"
          />
          <icon-hugeicons-chevron-down class="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <!-- An entry may open a dialog: focus stays where the dialog put it, not back on the logo. -->
          <DropdownMenuContent
            data-test-id="app-menu"
            @close-auto-focus.prevent
            :side-offset="6"
            align="start"
            :class="mainMenuCls.content"
          >
            <DropdownMenuSub v-for="menu in topMenus" :key="menu.label">
              <DropdownMenuSubTrigger
                v-test-id="`menubar-${menu.label.toLowerCase()}`"
                :class="menuCls.item"
              >
                <span class="flex-1">{{ menu.label }}</span>
                <IconChevronRight class="size-3 text-muted" />
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent :side-offset="4" :class="mainMenuCls.content">
                  <template v-for="(item, i) in menu.items" :key="i">
                    <DropdownMenuSeparator
                      v-if="isMenuSeparator(item)"
                      :class="menuCls.separator"
                    />
                    <DropdownMenuSub v-else-if="hasMenuSubItems(item)">
                      <DropdownMenuSubTrigger :class="menuCls.item" :disabled="menuDisabled(item)">
                        <span class="flex-1">{{ menuLabel(item) }}</span>
                        <IconChevronRight class="size-3 text-muted" />
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent :side-offset="4" :class="subMenuCls.content">
                          <template v-for="(sub, j) in menuSubItems(item)" :key="j">
                            <DropdownMenuSeparator
                              v-if="isMenuSeparator(sub)"
                              :class="menuCls.separator"
                            />
                            <DropdownMenuCheckboxItem
                              v-else-if="isMenuCheckbox(sub)"
                              :model-value="menuChecked(sub)"
                              :class="menuCls.item"
                              @update:model-value="updateMenuChecked(sub, $event as boolean)"
                            >
                              <span class="flex-1">{{ menuLabel(sub) }}</span>
                              <DropdownMenuItemIndicator class="text-surface">
                                <icon-hugeicons-check class="size-3.5" />
                              </DropdownMenuItemIndicator>
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuItem
                              v-else
                              :class="menuCls.item"
                              :disabled="menuDisabled(sub)"
                              @select="runMenuAction(sub)"
                            >
                              <span class="flex-1">{{ menuLabel(sub) }}</span>
                              <AppShortcutText v-if="menuShortcut(sub)">{{
                                menuShortcut(sub)
                              }}</AppShortcutText>
                            </DropdownMenuItem>
                          </template>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuCheckboxItem
                      v-else-if="isMenuCheckbox(item)"
                      :model-value="menuChecked(item)"
                      :class="menuCls.item"
                      @update:model-value="updateMenuChecked(item, $event as boolean)"
                    >
                      <span class="flex-1">{{ menuLabel(item) }}</span>
                      <DropdownMenuItemIndicator class="text-surface">
                        <icon-hugeicons-check class="size-3.5" />
                      </DropdownMenuItemIndicator>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuItem
                      v-else
                      :class="menuCls.item"
                      :disabled="menuDisabled(item)"
                      @select="runMenuAction(item)"
                    >
                      <span class="flex-1">{{ menuLabel(item) }}</span>
                      <AppShortcutText v-if="menuShortcut(item)">{{
                        menuShortcut(item)
                      }}</AppShortcutText>
                    </DropdownMenuItem>
                  </template>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
      <BrandMark
        v-else
        data-test-id="app-logo"
        variant="app-icon"
        :appearance="resolvedAppTheme"
        class="me-1 size-6 rounded-md"
      />
      <!-- The tabs: the active one is the document's name. -->
      <slot />
      <ServerFileChip
        v-if="documentServer"
        class="no-drag"
        :server-name="documentServer"
        :view-only="viewOnly"
      />
      <IconButton
        :label="tip(undo.label)"
        data-test-id="app-undo"
        class="no-drag size-7 rounded-[7px]"
        :disabled="!undo.enabled.value"
        @click="undo.run()"
      >
        <icon-hugeicons-undo-02 class="size-[15px]" />
      </IconButton>
      <IconButton
        :label="tip(redo.label)"
        data-test-id="app-redo"
        class="no-drag size-7 rounded-[7px]"
        :disabled="!redo.enabled.value"
        @click="redo.run()"
      >
        <icon-hugeicons-redo-02 class="size-[15px]" />
      </IconButton>
    </div>
  </div>
</template>
