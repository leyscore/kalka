<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import { openSettingsDialog } from '@/app/settings/dialog'
import BrandMark from '@/components/brand/BrandMark.vue'
import PixelSky from '@/components/brand/PixelSky.vue'
import HomeFiles from '@/components/home/files/HomeFiles.vue'
import HomePrompt from '@/components/home/prompt/HomePrompt.vue'
import HomeStart from '@/components/home/start/HomeStart.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import { homeHero } from '@/theme/home/start'

/**
 * Home: the kalka.design sky with the greeting, the request to the agent, the sizes to start from
 * and the ways to bring a file in; then the recent and stored files. Its only way elsewhere is the
 * settings, in the sky's corner.
 */
const { settings, welcome } = useI18n()
const identity = useCollabIdentity()
</script>

<template>
  <div class="relative flex min-h-0 flex-1 text-surface">
    <main
      class="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
      data-test-id="recent-files-home"
    >
      <section id="home-top" :class="homeHero.root">
        <PixelSky place="band" class="-z-10" />
        <div :class="homeHero.corner">
          <IconButton
            :label="settings.title"
            side="left"
            data-test-id="home-settings"
            :class="homeHero.cornerButton"
            @click="openSettingsDialog()"
          >
            <icon-hugeicons-settings-01 class="size-[18px]" />
          </IconButton>
        </div>
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

      <div
        class="mx-auto flex w-full max-w-[1104px] flex-col pt-14 pr-[max(1rem,env(safe-area-inset-right))] pb-20 pl-[max(1rem,env(safe-area-inset-left))] sm:px-8 sm:pt-[72px]"
      >
        <HomeFiles />
      </div>
    </main>
  </div>
</template>
