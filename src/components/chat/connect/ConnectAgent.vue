<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { ACP_AGENTS } from '@kalka/core/constants'
import { useI18n } from '@kalka/vue'

import { agentSetupView, piSetupView } from '@/app/ai/agents/setup'
import { modelProviderName } from '@/app/ai/models/provider-name'
import {
  isOnboardingAgent,
  ONBOARDING_AGENTS,
  ONBOARDING_API_PROVIDERS,
  ONBOARDING_MORE_API_PROVIDERS,
  ONBOARDING_SERVER_PROVIDER,
  type OnboardingAccess
} from '@/app/ai/models/settings/onboarding/plan'
import { useAIOnboarding } from '@/app/ai/models/settings/onboarding/use'
import { OPENROUTER_KEY_LABEL } from '@/app/ai/providers/openrouter/sign-in'
import { openSettings } from '@/app/settings/open'
import AISetupConnection from '@/components/settings/ai-setup/AISetupConnection.vue'
import ProviderLogo from '@/components/settings/provider/ProviderLogo.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import AppAlert from '@/components/ui/feedback/AppAlert.vue'
import { connectAgent } from '@/theme/chat/connect'

/**
 * The short way to an AI: pick an agent already on this computer and it connects, or pick a
 * provider, paste its key, test it and start. Roles and several models stay in Settings.
 */
/** Where it shows: the agent's panel, a dialog over Home, or a section of the AI settings. */
const { placement = 'panel' } = defineProps<{ placement?: 'panel' | 'dialog' | 'settings' }>()
const emit = defineEmits<{ connected: []; advanced: [] }>()
const { ai, common } = useI18n()
const onboarding = useAIOnboarding()
const { answers, busy, saveResult, agentsAvailable } = onboarding
const styles = computed(() => connectAgent({ placement }))

/** A dialog closes itself on the way to Settings; the panel only opens them. */
function advanced(): void {
  if (placement === 'dialog') emit('advanced')
  else openSettings('ai')
}

type Screen = 'kind' | 'agents' | 'providers' | 'detail'
const screen = ref<Screen>('kind')
const chosen = ref<OnboardingAccess | null>(null)

const PROVIDERS: readonly OnboardingAccess[] = [
  ...ONBOARDING_API_PROVIDERS,
  ...ONBOARDING_MORE_API_PROVIDERS,
  ONBOARDING_SERVER_PROVIDER
]

/** Whether an agent and what it needs to reach the canvas are installed. */
function installed(providerID: OnboardingAccess): boolean {
  const pi = onboarding.piSetup(providerID)
  if (pi) {
    const view = piSetupView(pi)
    return view.companion.ready && view.bridge.ready
  }
  const setup = onboarding.agentSetup(providerID)
  const agent = ACP_AGENTS.find((candidate) => `acp:${candidate.id}` === providerID)
  if (!agent || setup.detected?.status !== 'available') return false
  return agentSetupView(agent, setup).bridge.ready
}

function agentStatus(providerID: OnboardingAccess): { state: string; label: string } {
  if (installed(providerID)) return { state: 'installed', label: ai.value.aiSetupAgentInstalled }
  const checking = !onboarding.agentSetup(providerID).checked
  return {
    state: checking ? 'checking' : 'missing',
    label: checking ? ai.value.aiSetupAgentChecking : ai.value.aiSetupAgentNotFound
  }
}

const canStart = computed(() => {
  const providerID = chosen.value
  if (!providerID || busy.value) return false
  return isOnboardingAgent(providerID) ? installed(providerID) : onboarding.ready(providerID)
})

async function start(): Promise<void> {
  if ((await onboarding.apply()) === 'saved') emit('connected')
}

/** An installed agent connects at once; anything else shows what it still needs first. */
async function choose(providerID: OnboardingAccess): Promise<void> {
  chosen.value = providerID
  answers.access = [providerID]
  if (isOnboardingAgent(providerID) && installed(providerID)) {
    await start()
    return
  }
  screen.value = 'detail'
}

function back(): void {
  if (screen.value === 'detail' && chosen.value) {
    screen.value = isOnboardingAgent(chosen.value) ? 'agents' : 'providers'
    return
  }
  screen.value = 'kind'
}

onMounted(() => {
  if (agentsAvailable) void onboarding.refreshAgents()
})
</script>

<template>
  <div data-test-id="provider-setup" :data-screen="screen" :class="styles.root()">
    <button
      v-if="screen !== 'kind'"
      type="button"
      data-test-id="connect-back"
      :class="styles.back()"
      @click="back"
    >
      <icon-hugeicons-arrow-left-01 class="size-3" />{{ common.back }}
    </button>
    <p v-else :class="styles.heading()">{{ ai.connectProvider }}</p>

    <div v-if="screen === 'kind'" :class="styles.list()">
      <button
        type="button"
        data-test-id="connect-kind-agents"
        :class="styles.card()"
        :disabled="!agentsAvailable"
        @click="screen = 'agents'"
      >
        <span :class="styles.mark()"><icon-hugeicons-computer class="size-4" /></span>
        <span :class="styles.body()">
          <span :class="styles.title()">{{ ai.aiSetupAccessAgents }}</span>
          <span :class="styles.hint()">
            {{
              agentsAvailable ? ai.aiSetupAccessAgentsDescription : ai.aiSetupAccessAgentsDesktop
            }}
          </span>
        </span>
        <icon-hugeicons-arrow-right-01 :class="styles.chevron()" />
      </button>
      <button
        type="button"
        data-test-id="connect-kind-api"
        :class="styles.card()"
        @click="screen = 'providers'"
      >
        <span :class="styles.mark()"><icon-hugeicons-key-01 class="size-4" /></span>
        <span :class="styles.body()">
          <span :class="styles.title()">{{ ai.aiSetupAccessAPI }}</span>
          <span :class="styles.hint()">{{ ai.connectAPIDescription }}</span>
        </span>
        <icon-hugeicons-arrow-right-01 :class="styles.chevron()" />
      </button>
    </div>

    <div v-else-if="screen === 'agents'" :class="styles.list()" data-test-id="connect-agents">
      <button
        v-for="providerID in ONBOARDING_AGENTS"
        :key="providerID"
        type="button"
        :data-provider="providerID"
        :class="styles.card()"
        :disabled="busy"
        @click="choose(providerID)"
      >
        <span :class="styles.logo()"><ProviderLogo :provider="providerID" /></span>
        <span :class="styles.title()">{{ modelProviderName(providerID) }}</span>
        <span :class="styles.status()" :data-state="agentStatus(providerID).state">
          {{ agentStatus(providerID).label }}
        </span>
      </button>
    </div>

    <div v-else-if="screen === 'providers'" :class="styles.list()" data-test-id="connect-providers">
      <button
        v-for="providerID in PROVIDERS"
        :key="providerID"
        type="button"
        :data-provider="providerID"
        :class="styles.card()"
        @click="choose(providerID)"
      >
        <span :class="styles.logo()"><ProviderLogo :provider="providerID" /></span>
        <span :class="styles.title()">{{ modelProviderName(providerID) }}</span>
        <icon-hugeicons-arrow-right-01 :class="styles.chevron()" />
      </button>
    </div>

    <template v-else-if="chosen">
      <AISetupConnection
        :provider-i-d="chosen"
        :state="onboarding.connection(chosen)"
        :has-saved-key="onboarding.hasSavedKey(chosen)"
        :sign-in-status="onboarding.signInStatus(chosen)"
        :server-vision="answers.serverVision ?? false"
        :agent-setup="onboarding.agentSetup(chosen)"
        :pi-setup="onboarding.piSetup(chosen)"
        :disabled="busy"
        @update="onboarding.updateConnection(chosen, $event)"
        @test="onboarding.testConnection(chosen)"
        @sign-in="onboarding.signIn(chosen, { keyLabel: OPENROUTER_KEY_LABEL })"
        @reopen-sign-in="onboarding.reopenSignIn(chosen)"
        @cancel-sign-in="onboarding.cancelSignIn(chosen)"
        @sign-out="onboarding.signOut(chosen)"
        @server-vision="answers.serverVision = $event"
        @check-agent="onboarding.refreshAgents()"
        @install-agent="onboarding.installAgent(chosen)"
        @install-bridge="onboarding.setupCanvasBridge()"
      />
      <AppAlert
        v-if="saveResult === 'failed' || saveResult === 'partial'"
        tone="error"
        :heading="ai.connectFailed"
      />
      <AppButton
        color="primary"
        variant="solid"
        data-test-id="connect-start"
        :class="styles.start()"
        :disabled="!canStart"
        :loading="busy"
        @click="start"
      >
        {{ ai.connectStart }}
      </AppButton>
    </template>

    <div v-if="placement !== 'settings'" :class="styles.footer()">
      <AppButton
        size="xs"
        variant="link"
        data-test-id="provider-setup-open-settings"
        :class="styles.advanced()"
        @click="advanced"
      >
        {{ ai.aiSetupAdvanced }}
      </AppButton>
    </div>
  </div>
</template>
