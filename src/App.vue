<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useEventListener } from '@vueuse/core'
import { MotionConfig } from 'motion-v'
import { TooltipProvider } from 'reka-ui'
import { computed, onMounted, onScopeDispose } from 'vue'

import { provideEditor, useI18n } from '@kalka/vue'

import { answerClosePrompt, closePrompt } from '@/app/document/close/prompt'
import { useDocumentCloseProtection } from '@/app/document/close/use'
import { useFollowingEditorStore } from '@/app/editor/active-store'
import { animationsEnabled } from '@/app/shell/motion'
import { installMenuGlide } from '@/app/shell/motion/menu-glide'
import { useAppTheme } from '@/app/shell/theme'
import { toast } from '@/app/shell/ui'
import { useRestartApprovals } from '@/app/shell/updater/approvals'
import { scheduleStartupUpdateCheck } from '@/app/shell/updater/check'
import { kickSyncEngine } from '@/app/storage/sync'
import { prepareForReload } from '@/app/tabs'
import UnsavedChangesDialog from '@/components/document/UnsavedChangesDialog.vue'
import PublishLibraryDialog from '@/components/libraries/PublishLibraryDialog.vue'
import LibraryUpdateReviewDialog from '@/components/libraries/review/LibraryUpdateReviewDialog.vue'
import WelcomeFlow from '@/components/onboarding/WelcomeFlow.vue'
import RecoveryDialog from '@/components/recovery/RecoveryDialog.vue'
import AISetupDialog from '@/components/settings/ai-setup/AISetupDialog.vue'
import SettingsDialog from '@/components/settings/SettingsDialog.vue'
import AppBackdrop from '@/components/shell/AppBackdrop.vue'
import AppShell from '@/components/shell/AppShell.vue'
import Toaster from '@/components/shell/Toaster.vue'

const { updates, locale } = useI18n()

useHead({
  titleTemplate: (title) => (title ? `${title} — Kalka` : 'Kalka'),
  htmlAttrs: {
    lang: locale,
    'data-motion': computed(() => (animationsEnabled.value ? 'full' : 'off'))
  }
})

provideEditor(useFollowingEditorStore())
useAppTheme()
useDocumentCloseProtection()
useRestartApprovals()
useEventListener(window, 'pagehide', () => {
  void prepareForReload()
})

let stopMenuGlide: (() => void) | null = null
onScopeDispose(() => stopMenuGlide?.())
onMounted(() => {
  stopMenuGlide = installMenuGlide()
  toast.setupGlobalErrorHandler()
  scheduleStartupUpdateCheck(updates)
  void kickSyncEngine()
})
</script>

<template>
  <MotionConfig :reduced-motion="animationsEnabled ? 'never' : 'always'">
    <TooltipProvider :delay-duration="400">
      <AppBackdrop />
      <AppShell>
        <RouterView />
      </AppShell>
      <SettingsDialog />
      <AISetupDialog />
      <RecoveryDialog />
      <UnsavedChangesDialog :prompt="closePrompt" @answer="answerClosePrompt" />
      <PublishLibraryDialog />
      <LibraryUpdateReviewDialog />
      <WelcomeFlow />
      <Toaster />
    </TooltipProvider>
  </MotionConfig>
</template>
