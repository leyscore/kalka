<script setup lang="ts">
import { computed } from 'vue'

import { type Locale, useI18n } from '@kalka/vue'

import { recoveryEnabled, setRecoveryEnabled } from '@/app/document/recovery/preferences'
import { setSnappingPreference } from '@/app/settings/preferences/apply'
import {
  appPreferences,
  updateReduceAgentAnimations,
  updateWorkflowFocus
} from '@/app/settings/preferences/store'
import { animationPreference } from '@/app/shell/motion'
import { useAppTheme } from '@/app/shell/theme'
import CredentialSettingsSection from '@/components/settings/credentials/CredentialSettingsSection.vue'
import EditingPreferencesGroup from '@/components/settings/general/EditingPreferencesGroup.vue'
import ThemePicker from '@/components/settings/general/ThemePicker.vue'
import WorkflowFocusRule from '@/components/settings/general/WorkflowFocusRule.vue'
import SettingsGroup from '@/components/settings/layout/SettingsGroup.vue'
import SettingsSection from '@/components/settings/layout/SettingsSection.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import AppSwitch from '@/components/ui/toggle/AppSwitch.vue'

const { availableLocales, locale, localeLabels, menu, recovery, setLocale, settings } = useI18n()

const { theme } = useAppTheme()
const selectUI = { trigger: 'w-full sm:w-52' }

const language = computed<Locale>({
  get: () => locale.value,
  set: setLocale
})

const languageOptions = availableLocales.map((value) => ({
  value,
  label: localeLabels[value]
}))

const preserveUnsavedWork = computed({
  get: () => recoveryEnabled.value,
  set: setRecoveryEnabled
})

const reduceAgentAnimations = computed({
  get: () => appPreferences.value.appearance.reduceAgentAnimations,
  set: updateReduceAgentAnimations
})

const workflowFocus = computed({
  get: () => appPreferences.value.workflow.focus,
  set: updateWorkflowFocus
})

const workflowFocusDescription = computed(() => {
  const focus = appPreferences.value.workflow.focus
  if (focus === 'design') return settings.value.workflowFocusDesignDescription
  if (focus === 'ai') return settings.value.workflowFocusAIDescription
  return settings.value.workflowFocusBalancedDescription
})

const snapToGeometry = computed({
  get: () => appPreferences.value.editing.snapping.geometry,
  set: (enabled: boolean) => setSnappingPreference('geometry', enabled)
})

const snapToObjects = computed({
  get: () => appPreferences.value.editing.snapping.objects,
  set: (enabled: boolean) => setSnappingPreference('objects', enabled)
})

const snapToPixelGrid = computed({
  get: () => appPreferences.value.editing.snapping.pixelGrid,
  set: (enabled: boolean) => setSnappingPreference('pixelGrid', enabled)
})
</script>

<template>
  <section class="flex flex-col gap-6" data-test-id="settings-general-panel">
    <SettingsSection>
      <template #title>{{ settings.appearance }}</template>
      <SettingsGroup>
        <ThemePicker v-model="theme" />
      </SettingsGroup>
      <SettingsGroup>
        <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
          <span class="text-[13px] text-surface">{{ menu.language }}</span>
          <AppSelect
            v-model="language"
            :label="menu.language"
            :options="languageOptions"
            :ui="selectUI"
            data-test-id="settings-language"
          />
        </label>
        <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
          <span class="text-[13px] text-surface">{{ settings.animations }}</span>
          <AppSelect
            v-model="animationPreference"
            :label="settings.animations"
            :options="[
              { value: 'system', label: settings.animationsSystem },
              { value: 'off', label: settings.animationsOff }
            ]"
            :ui="selectUI"
          />
        </label>
        <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
          <span>
            <span class="block text-[13px] text-surface">{{ settings.reduceAgentAnimations }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{
              settings.reduceAgentAnimationsDescription
            }}</span>
          </span>
          <AppSwitch
            v-model="reduceAgentAnimations"
            :label="settings.reduceAgentAnimations"
            data-test-id="settings-reduce-agent-animations"
          />
        </label>
      </SettingsGroup>
    </SettingsSection>

    <SettingsSection>
      <template #title>{{ settings.workflow }}</template>
      <SettingsGroup>
        <div class="flex flex-col gap-3 px-4 py-3">
          <span>
            <span class="block text-[13px] text-surface">{{ settings.workflowFocus }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{ workflowFocusDescription }}</span>
          </span>
          <WorkflowFocusRule v-model="workflowFocus" />
        </div>
      </SettingsGroup>
    </SettingsSection>

    <SettingsSection>
      <template #title>{{ settings.editing }}</template>
      <template #description>{{ settings.snappingDescription }}</template>

      <SettingsGroup>
        <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
          <span>
            <span class="block text-[13px] text-surface">{{ settings.snapToGeometry }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{
              settings.snapToGeometryDescription
            }}</span>
          </span>
          <AppSwitch
            v-model="snapToGeometry"
            :label="settings.snapToGeometry"
            data-test-id="settings-snap-geometry"
          />
        </label>
        <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
          <span>
            <span class="block text-[13px] text-surface">{{ settings.snapToObjects }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{
              settings.snapToObjectsDescription
            }}</span>
          </span>
          <AppSwitch
            v-model="snapToObjects"
            :label="settings.snapToObjects"
            data-test-id="settings-snap-objects"
          />
        </label>
        <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
          <span>
            <span class="block text-[13px] text-surface">{{ settings.snapToPixelGrid }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{
              settings.snapToPixelGridDescription
            }}</span>
          </span>
          <AppSwitch
            v-model="snapToPixelGrid"
            :label="settings.snapToPixelGrid"
            data-test-id="settings-snap-pixel-grid"
          />
        </label>
      </SettingsGroup>

      <p class="text-[11px] text-muted">{{ settings.temporaryDisableSnappingHint }}</p>

      <EditingPreferencesGroup />
    </SettingsSection>

    <SettingsSection>
      <template #title>{{ recovery.settingsTitle }}</template>

      <SettingsGroup>
        <label class="flex min-h-12 items-center justify-between gap-4 px-4 py-2.5">
          <span>
            <span class="block text-[13px] text-surface">{{ recovery.preserveUnsavedWork }}</span>
            <span class="mt-0.5 block text-xs text-muted">{{
              recovery.preserveUnsavedWorkDescription
            }}</span>
          </span>
          <AppSwitch
            v-model="preserveUnsavedWork"
            :label="recovery.preserveUnsavedWork"
            data-test-id="settings-recovery-enabled"
          />
        </label>
      </SettingsGroup>
    </SettingsSection>

    <CredentialSettingsSection />
  </section>
</template>
