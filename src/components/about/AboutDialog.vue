<script setup lang="ts">
import { useI18n } from '@kalka/vue'

import { APP_VERSION } from '@/app/runtime/version'
import { aboutOpen } from '@/app/shell/about'
import { openExternalLink } from '@/app/shell/ui'
import BrandMark from '@/components/brand/BrandMark.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppDialog from '@/components/ui/dialog/AppDialog.vue'
import { DESKTOP_DOWNLOAD_URL, WEB_APP_ORIGIN, releaseNotesURL } from '@/constants'

const { menu } = useI18n()
</script>

<template>
  <AppDialog
    v-model:open="aboutOpen"
    size="sm"
    :heading="menu.aboutKalka"
    data-test-id="about-dialog"
  >
    <div class="flex flex-col items-center gap-3 py-2 text-center">
      <BrandMark variant="app-icon" decorative class="size-14" />
      <span class="text-sm font-medium text-surface">Kalka</span>
      <span class="text-xs text-muted" data-test-id="about-version">{{
        `${menu.aboutVersion} ${APP_VERSION}`
      }}</span>
      <span class="text-xs text-muted">{{ menu.aboutLicense }}</span>
      <div class="flex flex-wrap justify-center gap-2 pt-1">
        <AppButton @click="openExternalLink(WEB_APP_ORIGIN)"> kalka.design </AppButton>
        <AppButton @click="openExternalLink(releaseNotesURL(APP_VERSION))">
          {{ menu.aboutReleaseNotes }}
        </AppButton>
        <AppButton @click="openExternalLink(DESKTOP_DOWNLOAD_URL)">
          {{ menu.aboutDesktopApp }}
        </AppButton>
      </div>
    </div>
  </AppDialog>
</template>
