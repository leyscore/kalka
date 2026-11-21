<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import BrandMark from '@/components/brand/BrandMark.vue'
import HomeFiles from '@/components/home/files/HomeFiles.vue'
import HomePrompt from '@/components/home/prompt/HomePrompt.vue'
import HomeStart from '@/components/home/start/HomeStart.vue'
import AppSidebar from '@/components/shell/AppSidebar.vue'
import ShellFrame from '@/components/shell/ShellFrame.vue'
import { homeHero } from '@/theme/home/start'

/**
 * Home, in the app's shell: the sidebar with the places, documentation and account; beside it, on
 * the sky, the greeting, the request to the agent, the sizes to start from and the ways to bring a
 * file in; then the recent and stored files on a frosted panel.
 */
const { files, welcome } = useI18n()
const identity = useCollabIdentity()
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
      <section id="home-top" :class="homeHero.root">
        <BrandMark variant="app-icon" decorative :class="homeHero.mark" />
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

      <div :class="homeHero.files">
        <HomeFiles />
      </div>
    </main>
  </ShellFrame>
</template>
