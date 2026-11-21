<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconRecent from '~icons/hugeicons/clock-01'
import IconCloud from '~icons/hugeicons/cloud'
import IconHome from '~icons/hugeicons/home-01'
import IconServer from '~icons/hugeicons/server-stack-01'

import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import { serverAccount } from '@/app/collab/server/account'
import { filesListFromPath, filesPath } from '@/app/home/files-route'
import { openSettings } from '@/app/settings/open'
import { openExternalLink } from '@/app/shell/ui'
import BrandMark from '@/components/brand/BrandMark.vue'
import ShellSidebar from '@/components/shell/ShellSidebar.vue'
import type { ShellSidebarGroup, ShellSidebarItem } from '@/components/shell/sidebar'
import { docsURL } from '@/constants'
import { shellSidebar } from '@/theme/shell/sidebar'

/**
 * The sidebar of the app's pages: where the work lives, Home, the lists of files, the
 * documentation and the account. Each place has an address, so the sidebar only follows and
 * writes the route.
 */
const { files, storage, menu, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const identity = useCollabIdentity()
const ui = shellSidebar()

const workspace = computed(() => {
  const account = serverAccount.value
  if (account) return { name: account.serverName, detail: account.user.email }
  return { name: 'Kalka', detail: files.value.thisComputer }
})

const groups = computed<ShellSidebarGroup[]>(() => {
  const lists: ShellSidebarItem[] = [
    { id: 'recent', label: files.value.recentTab, icon: IconRecent },
    { id: 'storage', label: storage.value.tab, icon: IconCloud }
  ]
  const account = serverAccount.value
  if (account) lists.push({ id: 'server', label: account.serverName, icon: IconServer })
  return [
    { id: 'main', items: [{ id: 'home', label: files.value.homePlace, icon: IconHome }] },
    { id: 'files', label: files.value.filesGroup, items: lists }
  ]
})

const selected = computed(() => {
  if (route.path === '/') return 'home'
  return filesListFromPath(route.path) ?? undefined
})

function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
  const letters =
    parts.length > 1 ? `${parts[0]?.[0]}${parts.at(-1)?.[0]}` : name.trim().slice(0, 2)
  return letters.toUpperCase() || 'K'
}

const account = computed(() => {
  const name = identity.hasChosenName.value ? identity.name.value : serverAccount.value?.user.name
  if (!name) return { name: files.value.accountAndSettings, initials: 'K' }
  return { name, detail: files.value.accountAndSettings, initials: initialsOf(name) }
})

function select(id: string): void {
  if (id === 'home') {
    void router.push('/')
    return
  }
  if (id === 'recent' || id === 'storage' || id === 'server') void router.push(filesPath(id))
}

function openDocs(): void {
  void openExternalLink(docsURL(locale.value))
}
</script>

<template>
  <ShellSidebar
    :workspace="workspace"
    :groups="groups"
    :selected="selected"
    :account="account"
    :label="files.placesLabel"
    @select="select"
    @account="openSettings()"
  >
    <template v-if="!serverAccount" #mark>
      <BrandMark variant="app-icon" decorative class="size-8" />
    </template>
    <template #footer>
      <button type="button" :class="ui.item()" data-test-id="shell-documentation" @click="openDocs">
        <icon-hugeicons-help-circle :class="ui.itemIcon()" aria-hidden="true" />
        <span :class="ui.itemLabel()">{{ menu.documentation }}</span>
      </button>
    </template>
  </ShellSidebar>
</template>
