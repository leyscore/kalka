<script setup lang="ts">
import { tryOnScopeDispose } from '@vueuse/core'
import { AlertDialogCancel, DialogDescription, DialogTitle } from 'reka-ui'
import { computed } from 'vue'
import IconActivity from '~icons/hugeicons/activity-01'
import IconChart from '~icons/hugeicons/chart-no-axes-combined'
import IconCloud from '~icons/hugeicons/cloud'
import IconImage from '~icons/hugeicons/image-01'
import IconPlug from '~icons/hugeicons/plug'
import IconServer from '~icons/hugeicons/server-stack-01'
import IconSettings from '~icons/hugeicons/settings-01'
import IconSliders from '~icons/hugeicons/sliders-horizontal'
import IconSparkles from '~icons/hugeicons/sparkles'

import { useI18n } from '@kalka/vue'

import { useCollabIdentity } from '@/app/collab/identity'
import { serverAccount } from '@/app/collab/server/account'
import { provideSettingsNavigation } from '@/app/settings/navigation/use'
import {
  settingsOpen,
  registerSettingsNavigation,
  settingsSection,
  type SettingsSection
} from '@/app/settings/open'
import ChatSettingsSection from '@/components/settings/chat/ChatSettingsSection.vue'
import DiagnosticsSettingsPanel from '@/components/settings/diagnostics/DiagnosticsSettingsPanel.vue'
import GeneralSettingsPanel from '@/components/settings/general/GeneralSettingsPanel.vue'
import SettingsPage from '@/components/settings/layout/SettingsPage.vue'
import SettingsSidebar from '@/components/settings/layout/SettingsSidebar.vue'
import type { SettingsSidebarGroup } from '@/components/settings/layout/sidebar'
import MCPWorkspacePanel from '@/components/settings/mcp/MCPWorkspacePanel.vue'
import MediaSettingsPanel from '@/components/settings/media/MediaSettingsPanel.vue'
import ModelsPanel from '@/components/settings/models/ModelsPanel.vue'
import ServerSettingsPanel from '@/components/settings/server/ServerSettingsPanel.vue'
import StorageSettingsPanel from '@/components/settings/storage/StorageSettingsPanel.vue'
import ToolAccessSettingsPanel from '@/components/settings/tool-access/ToolAccessSettingsPanel.vue'
import UsageSettingsPanel from '@/components/settings/usage/UsageSettingsPanel.vue'
import ShellFrame from '@/components/shell/ShellFrame.vue'
import { initialsOf } from '@/components/shell/sidebar'
import AppButton from '@/components/ui/button/AppButton.vue'
import {
  AppAlertDialogRoot,
  AppDialogFooter,
  AppDialogHeader,
  AppDialogRoot
} from '@/components/ui/dialog'
import AppTabsContent from '@/components/ui/tabs/AppTabsContent.vue'
import AppTabsRoot from '@/components/ui/tabs/AppTabsRoot.vue'
import { settingsShell } from '@/theme/settings/shell'

/**
 * Settings, a page at `/settings/<section>` in the app's shell: the sidebar holds the way back,
 * the person and the sections; the section itself sits on a frosted panel beside it.
 */
const { settings, common, collaboration, files } = useI18n()
const identity = useCollabIdentity()
const navigation = provideSettingsNavigation()
tryOnScopeDispose(registerSettingsNavigation(navigation.request))
const { editing, confirming } = navigation
const ui = settingsShell()

const groups = computed<SettingsSidebarGroup[]>(() => [
  {
    id: 'app',
    label: settings.value.groupApp,
    sections: [
      { value: 'general', label: settings.value.general, icon: IconSettings },
      { value: 'storage', label: settings.value.storage, icon: IconCloud },
      { value: 'server', label: collaboration.value.serverTab, icon: IconServer },
      { value: 'media', label: settings.value.media, icon: IconImage },
      { value: 'diagnostics', label: settings.value.diagnostics, icon: IconActivity }
    ]
  },
  {
    id: 'ai',
    label: settings.value.groupAI,
    sections: [
      { value: 'ai', label: settings.value.aiAndAgents, icon: IconSparkles },
      { value: 'mcp', label: settings.value.mcp, icon: IconPlug },
      { value: 'tools', label: settings.value.toolAccess, icon: IconSliders },
      { value: 'usage', label: settings.value.usage, icon: IconChart }
    ]
  }
])
const sections = computed(() => groups.value.flatMap((group) => group.sections))
const sectionLabel = computed(
  () => sections.value.find((section) => section.value === settingsSection.value)?.label ?? ''
)

const profile = computed(() => {
  const account = serverAccount.value
  const name = identity.hasChosenName.value ? identity.name.value : account?.user.name
  const detail = account?.user.email ?? files.value.thisComputer
  if (!name) return { name: detail, initials: 'K' }
  return { name, detail, initials: initialsOf(name) }
})

function isSection(value: string): value is SettingsSection {
  return sections.value.some((section) => section.value === value)
}
function onSectionChange(section: string): void {
  if (!isSection(section) || section === settingsSection.value) return
  navigation.request(() => {
    settingsSection.value = section
  })
}
function close(): void {
  navigation.request(() => {
    settingsOpen.value = false
  })
}
function onOpenChange(open: boolean): void {
  if (open) settingsOpen.value = true
  else close()
}
</script>

<template>
  <AppDialogRoot
    :open="settingsOpen"
    size="shell"
    data-test-id="app-settings"
    @update:open="onOpenChange"
  >
    <DialogTitle class="sr-only">{{ settings.title }}</DialogTitle>
    <DialogDescription class="sr-only">{{ settings.description }}</DialogDescription>
    <AppTabsRoot
      :model-value="settingsSection"
      orientation="vertical"
      :ui="{ root: 'flex-col' }"
      @update:model-value="onSectionChange"
    >
      <ShellFrame :label="settings.title" :menu-label="files.openMenu">
        <template #sidebar>
          <SettingsSidebar
            :groups="groups"
            :profile="profile"
            :label="settings.title"
            :back-label="common.back"
            :can-leave="!editing"
            @back="close"
          />
        </template>
        <template #phoneTitle>
          <span :class="ui.phoneTitle()">{{ sectionLabel }}</span>
          <button
            v-if="!editing"
            type="button"
            :class="ui.phoneClose()"
            :aria-label="common.close"
            data-test-id="app-settings-close"
            @click="close"
          >
            <icon-hugeicons-cancel-01 class="size-5" aria-hidden="true" />
          </button>
        </template>

        <div :class="ui.panel()" data-test-id="settings-panel">
          <h1 :class="ui.heading()">{{ sectionLabel }}</h1>
          <AppTabsContent value="general" as-child>
            <SettingsPage><GeneralSettingsPanel /></SettingsPage>
          </AppTabsContent>
          <AppTabsContent value="ai" as-child>
            <section class="flex min-h-0 min-w-0 flex-1 flex-col" data-test-id="settings-ai-panel">
              <ModelsPanel>
                <ChatSettingsSection />
              </ModelsPanel>
            </section>
          </AppTabsContent>
          <AppTabsContent value="usage" as-child>
            <SettingsPage><UsageSettingsPanel /></SettingsPage>
          </AppTabsContent>
          <AppTabsContent value="diagnostics" as-child>
            <SettingsPage><DiagnosticsSettingsPanel /></SettingsPage>
          </AppTabsContent>
          <AppTabsContent value="mcp" as-child>
            <MCPWorkspacePanel />
          </AppTabsContent>
          <AppTabsContent value="tools" as-child>
            <ToolAccessSettingsPanel />
          </AppTabsContent>
          <AppTabsContent value="media" as-child>
            <MediaSettingsPanel />
          </AppTabsContent>
          <AppTabsContent value="storage" as-child>
            <StorageSettingsPanel />
          </AppTabsContent>
          <AppTabsContent value="server" as-child>
            <SettingsPage><ServerSettingsPanel /></SettingsPage>
          </AppTabsContent>
        </div>
      </ShellFrame>
    </AppTabsRoot>
  </AppDialogRoot>
  <AppAlertDialogRoot :open="confirming" @update:open="!$event && navigation.keepEditing()">
    <AppDialogHeader
      :heading="settings.discardChanges"
      :description="settings.discardChangesDescription"
      :show-close="false"
    />
    <AppDialogFooter>
      <AlertDialogCancel as-child
        ><AppButton>{{ settings.keepEditing }}</AppButton></AlertDialogCancel
      >
      <AppButton color="error" variant="solid" @click="navigation.discard">{{
        settings.discard
      }}</AppButton>
    </AppDialogFooter>
  </AppAlertDialogRoot>
</template>
