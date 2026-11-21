<script setup lang="ts">
import type { ShellSidebarProps } from '@/components/shell/sidebar'
import { shellSidebar } from '@/theme/shell/sidebar'

const { workspace, groups, selected, account, label } = defineProps<ShellSidebarProps>()
const emit = defineEmits<{ select: [id: string]; account: [] }>()
defineSlots<{ mark?: () => unknown; footer?: () => unknown }>()

const ui = shellSidebar()
</script>

<template>
  <div :class="ui.root()" data-test-id="shell-sidebar">
    <div :class="ui.workspace()">
      <span :class="ui.workspaceMark()" aria-hidden="true">
        <slot name="mark">{{ workspace.mark ?? workspace.name.slice(0, 1).toUpperCase() }}</slot>
      </span>
      <span :class="ui.workspaceText()">
        <span :class="ui.workspaceName()">{{ workspace.name }}</span>
        <span v-if="workspace.detail" :class="ui.workspaceDetail()">{{ workspace.detail }}</span>
      </span>
    </div>

    <nav :aria-label="label" :class="ui.nav()">
      <template v-for="group in groups" :key="group.id">
        <span v-if="group.label" :class="ui.group()">{{ group.label }}</span>
        <button
          v-for="item in group.items"
          :key="item.id"
          type="button"
          :class="ui.item({ selected: item.id === selected })"
          :aria-current="item.id === selected ? 'page' : undefined"
          :data-shell-place="item.id"
          @click="emit('select', item.id)"
        >
          <component :is="item.icon" v-if="item.icon" :class="ui.itemIcon()" aria-hidden="true" />
          <span :class="ui.itemLabel()">{{ item.label }}</span>
          <span v-if="item.count !== undefined" :class="ui.itemCount()">{{ item.count }}</span>
        </button>
      </template>
    </nav>

    <div :class="ui.footer()">
      <slot name="footer" />
      <button
        v-if="account"
        type="button"
        :class="ui.account()"
        data-test-id="shell-account"
        @click="emit('account')"
      >
        <span :class="ui.avatar()" aria-hidden="true">{{ account.initials }}</span>
        <span :class="ui.accountText()">
          <span :class="ui.accountName()">{{ account.name }}</span>
          <span v-if="account.detail" :class="ui.accountDetail()">{{ account.detail }}</span>
        </span>
        <icon-hugeicons-arrow-right-01 class="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
