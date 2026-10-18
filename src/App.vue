<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useEventListener } from '@vueuse/core'
import { MotionConfig } from 'motion-v'
import { TooltipProvider } from 'reka-ui'
import { computed, defineAsyncComponent, onMounted, onScopeDispose } from 'vue'

import { provideEditor, useI18n } from '@kalka/vue'

import { aiSetupDialogOpen } from '@/app/ai/models/settings/onboarding/dialog'
import { answerClosePrompt, closePrompt } from '@/app/document/close/prompt'
import { useDocumentCloseProtection } from '@/app/document/close/use'
import { useFollowingEditorStore } from '@/app/editor/active-store'
import { publishLibraryDialogOpen } from '@/app/libraries/publish/dialog'
import { libraryReviewRequest } from '@/app/libraries/review'
import { welcomeOpen } from '@/app/onboarding/welcome'
import { settingsDialogOpen } from '@/app/settings/dialog'
import { reducedEffects, watchRenderingCapability } from '@/app/shell/effects'
import { latch } from '@/app/shell/latch'
import { animationsEnabled } from '@/app/shell/motion'
import { installMenuGlide } from '@/app/shell/motion/menu-glide'
import { useAppTheme } from '@/app/shell/theme'
import { toast } from '@/app/shell/ui'
import { useRestartApprovals } from '@/app/shell/updater/approvals'
import { scheduleStartupUpdateCheck } from '@/app/shell/updater/check'
import { useWindowTheme } from '@/app/shell/window-theme'
import { kickSyncEngine } from '@/app/storage/sync'
import { prepareForReload } from '@/app/tabs'
import UnsavedChangesDialog from '@/components/document/UnsavedChangesDialog.vue'
import RecoveryDialog from '@/components/recovery/RecoveryDialog.vue'
import AppBackdrop from '@/components/shell/AppBackdrop.vue'
import AppShell from '@/components/shell/AppShell.vue'
import Toaster from '@/components/shell/Toaster.vue'

// Dialogs load their code the first time they open, so none of it delays the first screen.
const SettingsDialog = defineAsyncComponent(
  () => import('@/components/settings/SettingsDialog.vue')
)
const AISetupDialog = defineAsyncComponent(
  () => import('@/components/settings/ai-setup/AISetupDialog.vue')
)
const PublishLibraryDialog = defineAsyncComponent(
  () => import('@/components/libraries/PublishLibraryDialog.vue')
)
const LibraryUpdateReviewDialog = defineAsyncComponent(
  () => import('@/components/libraries/review/LibraryUpdateReviewDialog.vue')
)
const WelcomeFlow = defineAsyncComponent(() => import('@/components/onboarding/WelcomeFlow.vue'))
const settingsUsed = latch(() => settingsDialogOpen.value)
const aiSetupUsed = latch(() => aiSetupDialogOpen.value)
const publishUsed = latch(() => publishLibraryDialogOpen.value)
const libraryReviewUsed = latch(() => libraryReviewRequest.value !== null)
const welcomeUsed = latch(() => welcomeOpen.value)

const { updates, locale } = useI18n()

useHead({
  titleTemplate: (title) => (title ? `${title} — Kalka` : 'Kalka'),
  htmlAttrs: {
    lang: locale,
    'data-motion': computed(() => (animationsEnabled.value ? 'full' : 'off')),
    'data-effects': computed(() => (reducedEffects.value ? 'reduced' : 'full'))
  }
})

provideEditor(useFollowingEditorStore())
useAppTheme()
useWindowTheme()
useDocumentCloseProtection()
useRestartApprovals()
useEventListener(window, 'pagehide', () => {
  void prepareForReload()
})

let stopMenuGlide: (() => void) | null = null
onScopeDispose(() => stopMenuGlide?.())
onScopeDispose(watchRenderingCapability())
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
      <SettingsDialog v-if="settingsUsed" />
      <AISetupDialog v-if="aiSetupUsed" />
      <RecoveryDialog />
      <UnsavedChangesDialog :prompt="closePrompt" @answer="answerClosePrompt" />
      <PublishLibraryDialog v-if="publishUsed" />
      <LibraryUpdateReviewDialog v-if="libraryReviewUsed" />
      <WelcomeFlow v-if="welcomeUsed" />
      <Toaster />
    </TooltipProvider>
  </MotionConfig>
</template>
