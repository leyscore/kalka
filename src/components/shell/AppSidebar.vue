<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconCloud from '~icons/hugeicons/cloud'
import IconComputer from '~icons/hugeicons/computer'
import IconHome from '~icons/hugeicons/home-01'
import IconServer from '~icons/hugeicons/server-stack-01'
import IconSettings from '~icons/hugeicons/settings-01'
import IconTeam from '~icons/hugeicons/user-group'

import { useI18n } from '@kalka/vue'

import { useAvatar } from '@/app/collab/avatar'
import { useCollabIdentity } from '@/app/collab/identity'
import { serverAccount } from '@/app/collab/server/account'
import { filesListFromPath, filesPath } from '@/app/home/files-route'
import { openSettings } from '@/app/settings/open'
import { openExternalLink } from '@/app/shell/ui'
import { teamPageFromPath, teamPath } from '@/app/team/route'
import BrandMark from '@/components/brand/BrandMark.vue'
import ShellSidebar from '@/components/shell/ShellSidebar.vue'
import {
  initialsOf,
  type ShellSidebarGroup,
  type ShellSidebarItem
} from '@/components/shell/sidebar'
import { docsURL } from '@/constants'
import { shellSidebar } from '@/theme/shell/sidebar'

/**
 * The sidebar of the app's pages: where the work lives, Home, the lists of files, the
 * documentation and the account. Each place has an address, so the sidebar only follows and
 * writes the route.
 */
const { files, storage, menu, locale, collaboration } = useI18n()
const route = useRoute()
const router = useRouter()
const identity = useCollabIdentity()
const avatar = useAvatar()
const ui = shellSidebar()

const workspace = computed(() => {
  const account = serverAccount.value
  if (account) return { name: account.serverName, detail: account.user.email }
  return { name: 'Kalka', detail: files.value.thisComputer }
})

const groups = computed<ShellSidebarGroup[]>(() => {
  const lists: ShellSidebarItem[] = [
    { id: 'recent', label: files.value.localFiles, icon: IconComputer },
    { id: 'storage', label: storage.value.tab, icon: IconCloud }
  ]
  const account = serverAccount.value
  if (account) lists.push({ id: 'server', label: account.serverName, icon: IconServer })
  const places: ShellSidebarGroup[] = [
    { id: 'main', items: [{ id: 'home', label: files.value.homePlace, icon: IconHome }] },
    { id: 'files', label: files.value.filesGroup, items: lists }
  ]
  // The team's pages are an administrator's: the server lists people only to them.
  if (account?.user.role === 'admin') {
    places.push({
      id: 'team',
      label: collaboration.value.teamGroup,
      items: [
        { id: 'team:people', label: collaboration.value.teamPeople, icon: IconTeam },
        { id: 'team:settings', label: collaboration.value.teamSettings, icon: IconSettings }
      ]
    })
  }
  return places
})

const selected = computed(() => {
  if (route.path === '/') return 'home'
  const team = teamPageFromPath(route.path)
  if (team) return `team:${team}`
  return filesListFromPath(route.path) ?? undefined
})

const account = computed(() => {
  const name = identity.hasChosenName.value
    ? identity.name.value
    : (serverAccount.value?.user.name ?? identity.guestName)
  return {
    name,
    detail: files.value.accountAndSettings,
    initials: initialsOf(name),
    image: avatar.url.value
  }
})

function select(id: string): void {
  if (id === 'team:people' || id === 'team:settings') {
    void router.push({
      path: teamPath(id === 'team:people' ? 'people' : 'settings'),
      query: route.query
    })
    return
  }
  if (id === 'home') {
    void router.push({ path: '/', query: route.query })
    return
  }
  if (id === 'recent' || id === 'storage' || id === 'server')
    void router.push({ path: filesPath(id), query: route.query })
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
