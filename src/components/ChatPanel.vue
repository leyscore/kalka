<script setup lang="ts">
import type { Chat } from '@ai-sdk/vue'
import type { UIMessage } from 'ai'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'

import { ACP_AGENTS } from '@kalka/core/constants'
import { useI18n } from '@kalka/vue'

import { revokeImagePreviewURL } from '@/app/ai/attachment/image/prepare'
import { needsReconnect } from '@/app/ai/chat/failure'
import { chatDocumentId } from '@/app/ai/chat/history/document'
import { setVisibleMessageText } from '@/app/ai/chat/presentation'
import { queuedChatPrompt, takeQueuedChatPrompt } from '@/app/ai/chat/queued-prompt'
import { chatReconnectRoute, useChatReconnect } from '@/app/ai/chat/reconnect'
import { useChatRunLocation } from '@/app/ai/chat/run-location'
import type { ChatSubmission } from '@/app/ai/chat/submission/types'
import { useChatSubmission } from '@/app/ai/chat/submission/use'
import {
  findTeamAgent,
  joinTeam,
  leadingMention,
  leaveTeam,
  MAX_AGENTS,
  namesLeadAgent,
  teamOf
} from '@/app/ai/chat/team'
import { saveChatTrace } from '@/app/ai/chat/trace/export'
import { useAIChat } from '@/app/ai/chat/use'
import { designModelProfile } from '@/app/ai/models'
import { openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import { openModelProfileSettings } from '@/app/ai/models/settings/request'
import { didHitStepLimit } from '@/app/ai/tools'
import { runAgentName } from '@/app/ai/tools/run'
import { getActiveEditorStore } from '@/app/editor/active-store'
import { flyToNextCreation } from '@/app/presence/fly-to-work'
import { openSettingsDialog } from '@/app/settings/dialog'
import { toast, type ToastAction } from '@/app/shell/ui'
import { activeTab } from '@/app/tabs'
import ACPPermissionDialog from '@/components/chat/ACPPermissionDialog.vue'
import AgentTabs, { type AgentTab } from '@/components/chat/AgentTabs.vue'
import ChatHistory from '@/components/chat/ChatHistory.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ChatReconnectNotice from '@/components/chat/ChatReconnectNotice.vue'
import ChatRunLocation from '@/components/chat/ChatRunLocation.vue'
import ChatTranscript from '@/components/chat/ChatTranscript.vue'
import ConnectAgent from '@/components/chat/connect/ConnectAgent.vue'
import FollowAgentsToggle from '@/components/chat/FollowAgentsToggle.vue'
import { useImageDrop } from '@/components/chat/input/useImageDrop'

const {
  isConfigured,
  ensureChat,
  history,
  chatFailure,
  clearChatFailure,
  providerID,
  markTransportDirty
} = useAIChat()
const { ai } = useI18n()
const runLocation = useChatRunLocation()

const chat = shallowRef<Chat<UIMessage> | null>(null)
const submission = useChatSubmission({
  chat,
  ensureChat,
  flush: history.flush,
  clearFailure: clearChatFailure,
  getEditor: getActiveEditorStore,
  messages: computed(() => ({
    openSettings: ai.value.openProviderSettingsAction,
    requestFailed: ai.value.chatRequestFailed,
    visionUnavailable: ai.value.visionModelUnavailable,
    runSetup: ai.value.aiSetupRun,
    agentSetup: {
      'companion-missing': ai.value.chatPiCompanionMissing,
      'companion-outdated': ai.value.chatPiCompanionOutdated,
      'mcp-outdated': ai.value.chatMCPOutdated,
      'pi-sign-in': ai.value.chatPiSignIn,
      'pi-model': ai.value.chatPiModel
    }
  })),
  reportError: toast.error,
  openModelSettings: () => openSettingsDialog('ai'),
  openSetup: () => openAISetup()
})

const chatInput = useTemplateRef<{
  restoreDraft: (submission: ChatSubmission) => void
  dropFiles: (files: File[]) => void
}>('chatInput')
const panel = useTemplateRef<HTMLElement>('panel')
// Images dropped anywhere on the chat go to the composer, when there is one to take them.
const { dragging: draggingImages } = useImageDrop(panel, {
  enabled: () => chatInput.value !== null,
  onImages: (files) => chatInput.value?.dropFiles(files)
})
let viewGeneration = 0

/** The named agents of the open document, and the one whose conversation is on screen. */
const team = computed(() => {
  const tab = activeTab.value
  return tab && tab.kind !== 'home' ? teamOf(tab.store).value : []
})
const selectedAgent = shallowRef<string | null>(null)
const teamAgent = computed(() =>
  selectedAgent.value === null
    ? undefined
    : team.value.find((agent) => agent.name === selectedAgent.value)
)
const agentTabs = computed<AgentTab[]>(() => {
  if (team.value.length === 0) return []
  const tab = activeTab.value
  const leadName = tab && tab.kind !== 'home' ? runAgentName(tab.store) : undefined
  const busy = (value: string) => value === 'submitted' || value === 'streaming'
  return [
    { name: null, label: leadName ?? ai.value.mainAgent, working: busy(chat.value?.status ?? '') },
    ...team.value.map((agent) => ({
      name: agent.name,
      label: agent.name,
      working: busy(agent.chat.status)
    }))
  ]
})

async function closeAgent(name: string) {
  if (selectedAgent.value === name) selectedAgent.value = null
  await leaveTeam(getActiveEditorStore(), name)
}

/**
 * Sends to a named agent, adding it to the document the first time it is named. Returns false
 * when it could not be sent, so the composer keeps the draft.
 */
async function sendToAgent(name: string, message: ChatSubmission): Promise<boolean> {
  const store = getActiveEditorStore()
  const joined = await joinTeam(store, name, {
    onError: () => toast.error(ai.value.chatRequestFailed)
  })
  if ('error' in joined) {
    toast.error(
      joined.error === 'full'
        ? ai.value.agentsFull({ max: MAX_AGENTS, name })
        : ai.value.agentsNeedDirectModel
    )
    return false
  }
  const { chat: agentChat, name: agentName } = joined.agent
  selectedAgent.value = agentName
  flyToNextCreation(store)
  const before = new Set(agentChat.messages.map((entry) => entry.id))
  const sent = agentChat.sendMessage({ text: message.modelText })
  const shown = agentChat.messages.find((entry) => entry.role === 'user' && !before.has(entry.id))
  if (shown) setVisibleMessageText(shown.id, message.displayText)
  for (const image of message.images) revokeImagePreviewURL(image.previewURL)
  await sent.catch(() => undefined)
  return true
}

/**
 * Starting with @Name talks to that agent, adding it beside the main chat if it is new;
 * without a name, the message goes to the agent whose tab is open.
 */
async function routeMessage(message: ChatSubmission): Promise<'sent' | 'failed' | 'main'> {
  const name = leadingMention(message.displayText)
  const store = getActiveEditorStore()
  let target: string | null = null
  if (name && !namesLeadAgent(name, runAgentName(store))) {
    target = findTeamAgent(store, name)?.name ?? name
  } else if (!name && teamAgent.value) target = teamAgent.value.name
  if (target === null) {
    selectedAgent.value = null
    return 'main'
  }
  return (await sendToAgent(target, message)) ? 'sent' : 'failed'
}

/** Puts an unsent message back only in the conversation it was written in. */
async function submitMessage(message: ChatSubmission) {
  const route = await routeMessage(message)
  if (route === 'sent') return
  if (route === 'failed') {
    chatInput.value?.restoreDraft(message)
    return
  }
  const generation = viewGeneration
  // What the agent makes for this request comes into view as it lands.
  flyToNextCreation(getActiveEditorStore())
  if (await submission.submit(message)) return
  if (generation === viewGeneration) chatInput.value?.restoreDraft(message)
  else for (const image of message.images) revokeImagePreviewURL(image.previewURL)
}
/** Sends the prompt the document was started with, such as one from Home, once its canvas is up. */
async function sendQueuedPrompt() {
  const store = getActiveEditorStore()
  const prompt = takeQueuedChatPrompt(store)
  if (!prompt) return
  await store.canvasReady
  await submitMessage({
    modelText: prompt.text,
    displayText: prompt.displayText ?? prompt.text,
    images: [],
    nodes: prompt.nodes ?? []
  })
}

let historyReady = false
// A comment that asks the agent, or a request about the selection, can arrive while it is open.
watch(queuedChatPrompt(), (prompt) => {
  if (prompt && historyReady) void sendQueuedPrompt()
})
// Restoring local history must not open a provider connection or read credentials.
void history.initialize().then(
  () => {
    historyReady = true
    return sendQueuedPrompt()
  },
  () => {
    toast.error(ai.value.chatHistoryFailed)
  }
)

const messages = computed(
  () => teamAgent.value?.chat.messages ?? chat.value?.messages ?? history.messages.value
)
const historyOptions = computed(() => {
  const current = history.current.value
  const rows = [...history.conversations.value]
  if (current && !rows.some((row) => row.id === current.id)) rows.unshift(current)
  return rows.map((conversation) => ({
    ...conversation,
    available: conversation.documentId === chatDocumentId(getActiveEditorStore())
  }))
})
const agentHistoryReadOnly = computed(
  () => !chat.value && messages.value.length > 0 && history.current.value?.backend === 'harness'
)
async function historyAction(action: () => Promise<unknown>) {
  const generation = ++viewGeneration
  submission.cancel()
  try {
    await chat.value?.stop()
    await action()
    if (generation !== viewGeneration) return
    chat.value = null
  } catch {
    toast.error(ai.value.chatHistoryFailed)
  }
}

async function renameConversation(id: string, title: string) {
  try {
    await history.rename(id, title)
  } catch {
    toast.error(ai.value.chatHistoryFailed)
  }
}

async function saveTrace(id: string) {
  const conversation = history.current.value
  if (conversation?.id !== id) return
  try {
    await saveChatTrace(conversation, messages.value)
  } catch {
    toast.error(ai.value.chatTraceFailed)
  }
}

/** Asking again cannot fix an expired sign-in, so the failure offers Reconnect instead. */
const reconnectNeeded = computed(() => needsReconnect(chatFailure.value))
const reconnect = useChatReconnect({
  providerID: () => providerID.value,
  markTransportDirty,
  clearFailure: clearChatFailure,
  failureNeedsReconnect: () => reconnectNeeded.value,
  openSettings: () => {
    const profile = designModelProfile.value
    if (profile) openModelProfileSettings(profile.id, 'reconnect')
    else openSettingsDialog('ai')
  }
})
function startReconnect(): void {
  if (failureToast !== null) toast.remove(failureToast)
  failureToast = null
  void reconnect.reconnect()
}
async function resendAfterReconnect(): Promise<void> {
  reconnect.dismiss()
  await submission.regenerate()
}

function authenticationMessage(): string {
  const route = chatReconnectRoute(providerID.value)
  if (route === 'agent') {
    const agent = ACP_AGENTS.find((definition) => `acp:${definition.id}` === providerID.value)
    if (agent) return ai.value.chatAgentSignInExpired({ agent: agent.name })
  }
  if (route === 'sign-in') return ai.value.chatOpenRouterSignInExpired
  return ai.value.chatAuthenticationFailed
}

const failureMessage = computed(() => {
  switch (chatFailure.value?.reason) {
    case 'authentication':
      return authenticationMessage()
    case 'forbidden':
      return ai.value.chatForbidden
    case 'insufficient-credit':
      return ai.value.chatInsufficientCredit
    case 'model-not-found':
      return ai.value.chatModelNotFound
    case 'network':
      return ai.value.chatNetworkFailed
    case 'output-limit':
      return ai.value.chatOutputLimit
    case 'rate-limit':
      return ai.value.chatRateLimited
    case 'request-failed':
      return ai.value.chatRequestFailed
    default:
      return null
  }
})
const failureHasSettingsAction = computed(() => chatFailure.value?.reason === 'model-not-found')
const status = computed(() => (teamAgent.value?.chat ?? chat.value)?.status ?? 'ready')
const showContinue = computed(() => {
  if (teamAgent.value || history.readOnly.value || agentHistoryReadOnly.value) return false
  if (status.value !== 'ready') return false
  if (messages.value.length === 0) return false
  const last = messages.value[messages.value.length - 1]
  return last.role === 'assistant' && didHitStepLimit()
})

// Asking again clears the failure, and its notice goes with it.
let failureToast: number | null = null
/** The notice outlives a switch to another tab, whose chat its Retry must not touch. */
function retryFailed(messageId: string | undefined): void {
  if (messageId && chat.value?.messages.at(-1)?.id === messageId) void submission.regenerate()
}
watch(
  () => chatFailure.value?.reason,
  (reason) => {
    if (failureToast !== null) toast.remove(failureToast)
    failureToast = null
    if (!reason) return
    const failedId = chat.value?.messages.at(-1)?.id
    let action: ToastAction = { label: ai.value.retryRequest, run: () => retryFailed(failedId) }
    if (reconnectNeeded.value) action = { label: ai.value.reconnect, run: startReconnect }
    else if (failureHasSettingsAction.value) {
      action = { label: ai.value.openProviderSettingsAction, run: () => openSettingsDialog('ai') }
    }
    failureToast = toast.error(failureMessage.value ?? ai.value.chatRequestFailed, action)
  }
)
// Asking again, however it is asked, answers the offer to resend.
watch(status, (value) => {
  if (value === 'submitted' || value === 'streaming') reconnect.dismiss()
})
watch(
  () => [activeTab.value?.id, activeTab.value?.store.state.preparation] as const,
  async ([tabId, preparation], [previousTabId]) => {
    if (preparation) {
      viewGeneration++
      submission.cancel()
      return
    }
    const generation = ++viewGeneration
    const conversationId = history.current.value?.id
    submission.cancel()
    if (tabId !== previousTabId) {
      chat.value = null
      selectedAgent.value = null
    }
    try {
      await history.initialize()
    } catch {
      if (generation === viewGeneration) {
        chat.value = null
        toast.error(ai.value.chatHistoryFailed)
      }
      return
    }
    // A page switch keeps the document and its conversation, so a running chat stays attached.
    if (generation === viewGeneration && history.current.value?.id !== conversationId) {
      chat.value = null
    }
  }
)

function handleStop() {
  if (teamAgent.value) void teamAgent.value.chat.stop()
  else submission.stop()
}
</script>

<template>
  <div
    ref="panel"
    data-test-id="chat-panel"
    class="flex min-w-0 flex-1 flex-col overflow-hidden select-text"
  >
    <ChatHistory
      :saved="history.conversations.value.some((row) => row.id === history.current.value?.id)"
      :conversations="historyOptions"
      :selected-id="history.current.value?.id"
      :disabled="history.busy.value"
      @create="historyAction(history.newChat)"
      @select="historyAction(() => history.open($event))"
      @rename="renameConversation"
      @save-trace="saveTrace"
      @delete="historyAction(() => history.remove($event))"
    >
      <template #actions><FollowAgentsToggle /></template>
    </ChatHistory>
    <p v-if="history.storageError.value" role="alert" class="px-3 py-2 text-xs text-red-400">
      {{ ai.chatStorageFailed }}
    </p>
    <ConnectAgent v-if="!isConfigured" />

    <AgentTabs
      v-if="agentTabs.length > 0"
      :tabs="agentTabs"
      :selected="teamAgent ? teamAgent.name : null"
      @select="selectedAgent = $event"
      @close="closeAgent"
    />
    <template v-if="isConfigured || messages.length">
      <p
        v-if="history.current.value?.interrupted && status === 'ready'"
        role="status"
        class="px-3 py-2 text-xs text-muted"
      >
        {{ ai.chatInterrupted }}
      </p>
      <ChatTranscript
        :messages="messages"
        :status="status"
        :show-continue="showContinue"
        :nodes-live="!history.readOnly.value"
        :interactive="!teamAgent && chat !== null && !submission.busy.value"
        :reconnect="reconnectNeeded"
        :reconnecting="reconnect.busy.value"
        @regenerate="submission.regenerate()"
        @reconnect="startReconnect"
        @revert="(messageId) => submission.revert(messageId)"
        @restore="(messageId) => submission.restore(messageId)"
        @edit="(messageId, text) => submission.resend(messageId, text)"
        @continue="
          submission.submit({
            modelText: 'Continue where you left off',
            displayText: 'Continue where you left off',
            images: [],
            nodes: []
          })
        "
      />

      <p v-if="agentHistoryReadOnly" role="status" class="px-3 py-2 text-xs text-muted">
        {{ ai.chatAgentReadOnly }}
      </p>
      <p v-if="history.readOnly.value" role="status" class="px-3 py-2 text-xs text-muted">
        {{ ai.chatReadOnly }}
      </p>
      <ChatReconnectNotice
        v-if="reconnect.notice.value"
        :notice="reconnect.notice.value"
        :busy="reconnect.busy.value || submission.busy.value"
        @resend="resendAfterReconnect"
        @reconnect="startReconnect"
        @dismiss="reconnect.dismiss()"
      />
      <ChatRunLocation
        v-if="runLocation"
        :agent="runLocation.agent"
        :page="runLocation.page"
        @open="runLocation.open"
      />
      <ChatInput
        v-if="isConfigured && !agentHistoryReadOnly && !history.readOnly.value"
        ref="chatInput"
        :status="status"
        :dragging="draggingImages"
        :disabled="submission.busy.value || history.busy.value"
        @submit="submitMessage"
        @stop="handleStop"
        @error="toast.error"
      />

      <ACPPermissionDialog />
    </template>
  </div>
</template>
