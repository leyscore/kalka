<script setup lang="ts">
import { TabsList, TabsTrigger } from 'reka-ui'

import type { SettingsSidebarGroup } from '@/components/settings/layout/sidebar'
import type { ShellAccount } from '@/components/shell/sidebar'
import { shellSidebar } from '@/theme/shell/sidebar'

/**
 * The sidebar of Settings, in the app's shell: the way back to what was open, the person, then the
 * sections in groups. The sections are the tabs of the page beside it, so the arrow keys move
 * between them as before.
 */
const {
  groups,
  profile,
  label,
  backLabel,
  canLeave = true
} = defineProps<{
  groups: SettingsSidebarGroup[]
  profile: ShellAccount
  label: string
  backLabel: string
  /** False while a section holds an editor of its own, whose Back leads out of it first. */
  canLeave?: boolean
}>()
const emit = defineEmits<{ back: [] }>()

const ui = shellSidebar()
</script>

<template>
  <div :class="ui.root()" data-test-id="settings-sidebar">
    <button
      v-if="canLeave"
      type="button"
      :class="ui.item()"
      data-shell-place="back"
      data-test-id="app-settings-back"
      @click="emit('back')"
    >
      <icon-hugeicons-arrow-left-01 :class="ui.itemIcon()" aria-hidden="true" />
      <span :class="ui.itemLabel()">{{ backLabel }}</span>
    </button>

    <div :class="ui.workspace()">
      <span :class="ui.avatar()" aria-hidden="true">{{ profile.initials }}</span>
      <span :class="ui.workspaceText()">
        <span :class="ui.workspaceName()">{{ profile.name }}</span>
        <span v-if="profile.detail" :class="ui.workspaceDetail()">{{ profile.detail }}</span>
      </span>
    </div>

    <TabsList :aria-label="label" :class="ui.nav()">
      <template v-for="group in groups" :key="group.id">
        <span :class="ui.group()" aria-hidden="true">{{ group.label }}</span>
        <TabsTrigger
          v-for="section in group.sections"
          :key="section.value"
          :value="section.value"
          :class="[
            ui.item(),
            'data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:hover:bg-accent'
          ]"
          :data-shell-place="section.value"
          :data-test-id="`settings-section-${section.value}`"
        >
          <component :is="section.icon" :class="ui.itemIcon()" aria-hidden="true" />
          <span :class="ui.itemLabel()">{{ section.label }}</span>
        </TabsTrigger>
      </template>
    </TabsList>
  </div>
</template>
