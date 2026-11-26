<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from 'reka-ui'
import { computed, watch } from 'vue'
import IconReset from '~icons/hugeicons/arrow-reload-horizontal'
import IconCrosshair from '~icons/hugeicons/crosshair'
import IconPackageAdd from '~icons/hugeicons/package-add'
import IconUnlink from '~icons/hugeicons/unlink-01'

import type { InstanceOverrideGroup } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'
import { useEditorCommands, useI18n, useRetainedPopup, useSceneComputed } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import IconButton from '@/components/ui/button/IconButton.vue'
import { menuItem, useMenuUI } from '@/components/ui/menu/menu'
import Tip from '@/components/ui/overlay/Tip.vue'

const { node } = defineProps<{ node: SceneNode }>()

const store = useEditorStore()
const { panels } = useI18n()
const { getCommand, runCommand } = useEditorCommands()
const { open: popupOpen, portalActive } = useRetainedPopup()
const goToMain = getCommand('selection.goToMainComponent')
const detach = getCommand('selection.detachInstance')
const restore = getCommand('selection.restoreMainComponent')
const resetAll = getCommand('selection.resetAllChanges')
const push = getCommand('selection.pushChangesToMainComponent')

const groups = useSceneComputed(() => store.getInstanceOverrideGroups(node.id))
const missingMain = computed(() => restore.enabled.value)
// Resetting the last change takes the menu away; it must not reopen closed on the next instance.
watch(
  () => groups.value.length === 0,
  (empty) => {
    if (empty) popupOpen.value = false
  }
)

const GROUP_LABELS = {
  text: 'resetOverrideText',
  textStyle: 'resetOverrideTextStyle',
  fill: 'resetOverrideFill',
  stroke: 'resetOverrideStroke',
  effect: 'resetOverrideEffect',
  appearance: 'resetOverrideAppearance',
  corner: 'resetOverrideCorner',
  size: 'resetOverrideSize',
  layout: 'resetOverrideLayout',
  visibility: 'resetOverrideVisibility',
  name: 'resetOverrideName',
  swap: 'resetOverrideSwap',
  variables: 'resetOverrideVariables',
  other: 'resetOverrideOther'
} as const satisfies Record<InstanceOverrideGroup, keyof typeof panels.value>

const menuCls = useMenuUI({ content: 'min-w-56' })
const itemCls = menuItem()
</script>

<template>
  <IconButton
    v-if="missingMain"
    :label="restore.label"
    data-test-id="instance-restore-main"
    @click="runCommand('selection.restoreMainComponent')"
  >
    <IconPackageAdd class="size-3.5" />
  </IconButton>
  <IconButton
    v-else
    :label="goToMain.label"
    data-test-id="instance-go-to-main"
    @click="goToMain.run()"
  >
    <IconCrosshair class="size-3.5" />
  </IconButton>
  <!-- Figma's instance reset menu: everything, one kind of change, or push it all to the main. -->
  <!-- Not modal: resetting the last change removes the menu while it is open. -->
  <DropdownMenuRoot v-if="groups.length > 0" v-model:open="popupOpen" :modal="false">
    <Tip :label="panels.instanceChanges">
      <DropdownMenuTrigger as-child>
        <button
          data-test-id="instance-reset-trigger"
          :aria-label="panels.instanceChanges"
          class="flex size-7 items-center justify-center rounded-md text-muted hover:bg-hover hover:text-surface data-[state=open]:bg-active data-[state=open]:text-surface"
        >
          <IconReset class="size-3.5" />
        </button>
      </DropdownMenuTrigger>
    </Tip>
    <DropdownMenuPortal v-if="portalActive">
      <DropdownMenuContent align="end" side="bottom" :side-offset="4" :class="menuCls.content">
        <DropdownMenuItem
          data-test-id="instance-reset-all"
          :class="itemCls"
          :disabled="!resetAll.enabled.value"
          @select="runCommand('selection.resetAllChanges')"
        >
          {{ resetAll.label }}
        </DropdownMenuItem>
        <DropdownMenuSeparator :class="menuCls.separator" />
        <DropdownMenuItem
          v-for="group in groups"
          :key="group"
          :data-test-id="`instance-reset-${group}`"
          :class="itemCls"
          @select="store.resetInstanceChanges(group)"
        >
          {{ panels[GROUP_LABELS[group]] }}
        </DropdownMenuItem>
        <template v-if="push.enabled.value">
          <DropdownMenuSeparator :class="menuCls.separator" />
          <DropdownMenuItem
            data-test-id="instance-push-changes"
            :class="itemCls"
            @select="runCommand('selection.pushChangesToMainComponent')"
          >
            {{ push.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
  <IconButton :label="detach.label" data-test-id="instance-detach" @click="detach.run()">
    <IconUnlink class="size-3.5" />
  </IconButton>
</template>
