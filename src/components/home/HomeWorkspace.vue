<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import { filesListFromPath } from '@/app/home/files-route'
import { teamPageFromPath } from '@/app/team/route'
import HomeFiles from '@/components/home/files/HomeFiles.vue'
import HomePrompt from '@/components/home/prompt/HomePrompt.vue'
import HomeStart from '@/components/home/start/HomeStart.vue'
import AppSidebar from '@/components/shell/AppSidebar.vue'
import ShellFrame from '@/components/shell/ShellFrame.vue'
import TeamPeople from '@/components/team/TeamPeople.vue'
import TeamPlan from '@/components/team/TeamPlan.vue'
import TeamSettingsPage from '@/components/team/TeamSettingsPage.vue'
import { homeHero } from '@/theme/home/start'

/**
 * Home, in the app's shell: the sidebar with the places, documentation and account; beside it, on
 * the sky, the greeting, the request to the agent, the sizes to start from and the ways to bring a
 * file in; then the recent files from every place on a frosted panel. At a list's address
 * (`/files/<list>`) the page is that list in full instead, and at a team page's (`/team/<page>`)
 * that page.
 */
const { files, welcome } = useI18n()
const identity = useCollabIdentity()
const route = useRoute()
const onList = computed(() => filesListFromPath(route.path) !== null)
const teamPage = computed(() => teamPageFromPath(route.path))
</script>

<template>
  <ShellFrame :label="files.placesLabel" :menu-label="files.openMenu">
    <template #sidebar>
      <AppSidebar />
    </template>
    <main
      class="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-[max(0.75rem,env(safe-area-inset-left))] pb-3 md:px-0 md:pb-0"
      data-test-id="recent-files-home"
    >
      <div v-if="teamPage" :class="homeHero.files({ list: true })">
        <TeamPeople v-if="teamPage === 'people'" />
        <TeamPlan v-else-if="teamPage === 'plan'" />
        <TeamSettingsPage v-else />
      </div>
      <section v-else-if="!onList" id="home-top" :class="homeHero.root">
        <h1 :class="homeHero.title">
          {{
            identity.hasChosenName.value
              ? welcome.greeting({ name: identity.name.value })
              : welcome.homeTitle
          }}
        </h1>
        <HomePrompt :class="homeHero.prompt" />
        <HomeStart />
      </section>

      <div v-if="!teamPage" :class="homeHero.files({ list: onList })">
        <HomeFiles :key="onList ? 'files' : 'home'" :place="onList ? 'files' : 'home'" />
      </div>
    </main>
  </ShellFrame>
</template>
