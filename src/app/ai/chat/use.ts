import { ref } from 'vue'

import { IS_BROWSER } from '@kalka/core/constants'

import type { AIChatFailure } from '@/app/ai/chat/failure'
import { createConversationHistory } from '@/app/ai/chat/history/controller'
import {
  apiKeyStatus,
  browserCredentialsRemembered,
  credentialsReady,
  customAPIType,
  customBaseURL,
  customModelID,
  isACPProvider,
  isHarnessProvider,
  isConfigured,
  maxOutputTokens,
  modelID,
  providerDef,
  providerID,
  registerAIChatEffects,
  resolveAPIKey,
  setAPIKey
} from '@/app/ai/chat/storage'
import type { ChatSessionManager } from '@/app/ai/chat/transports'
import { designModelProfile } from '@/app/ai/models'
import { exposeChatTransportOverride } from '@/app/browser-bridge'
import { getActiveEditorStore } from '@/app/editor/active-store'
import {
  pexelsKeyStatus,
  unsplashKeyStatus,
  setPexelsKey,
  setUnsplashKey,
  setRememberCredentials
} from '@/app/settings/credentials/media'

export type PropertiesTab = 'design' | 'code' | 'ai' | 'lint'

const activeTab = ref<PropertiesTab>('design')

const chatFailure = ref<AIChatFailure | null>(null)
let chatOverride: Parameters<ChatSessionManager['setOverrideTransport']>[0] = null
let loadedSession: Promise<ChatSessionManager> | null = null

/**
 * The session's model SDKs, tools and agent transports load with the first chat, not with the
 * app: the home screen and an empty document never need them.
 */
function loadChatSession(): Promise<ChatSessionManager> {
  loadedSession ??= import('@/app/ai/chat/transports').then(({ createChatSessionManager }) => {
    const session = createChatSessionManager({
      isConfigured,
      isACPProvider,
      isHarnessProvider,
      providerID,
      credentialsReady,
      getActiveEditorStore,
      failure: chatFailure
    })
    if (chatOverride) session.setOverrideTransport(chatOverride)
    return session
  })
  return loadedSession
}

const chatSession = {
  ensureChat: async (...args: Parameters<ChatSessionManager['ensureChat']>) =>
    (await loadChatSession()).ensureChat(...args),
  // Before the first chat there is no transport to reset or rebuild.
  resetChat: async () => (loadedSession ? (await loadedSession).resetChat() : undefined),
  markTransportDirty: () => void loadedSession?.then((session) => session.markTransportDirty()),
  setOverrideTransport: (factory: typeof chatOverride) => {
    chatOverride = factory
    void loadedSession?.then((session) => session.setOverrideTransport(factory))
  },
  failure: chatFailure,
  clearFailure: () => {
    chatFailure.value = null
    void loadedSession?.then((session) => session.clearFailure())
  }
}

const history = createConversationHistory({
  profileId: () => designModelProfile.value?.id ?? null,
  getEditor: getActiveEditorStore,
  ensureChat: chatSession.ensureChat,
  resetChat: chatSession.resetChat,
  backend: () => {
    if (isACPProvider.value) return 'acp'
    return isHarnessProvider.value ? 'harness' : 'direct'
  }
})

registerAIChatEffects(chatSession.markTransportDirty)

if (IS_BROWSER) {
  exposeChatTransportOverride((factory) => {
    chatSession.setOverrideTransport(factory)
  })
}

export function useAIChat() {
  return {
    providerID,
    providerDef,
    apiKeyStatus,
    browserCredentialsRemembered,
    setAPIKey,
    resolveAPIKey,
    modelID,
    customBaseURL,
    customModelID,
    customAPIType,
    maxOutputTokens,
    pexelsKeyStatus,
    setPexelsKey,
    setRememberCredentials,
    unsplashKeyStatus,
    setUnsplashKey,
    activeTab,
    isConfigured,
    history,
    ensureChat: history.ensureChat,
    resetChat: history.newChat,
    chatFailure: chatSession.failure,
    clearChatFailure: chatSession.clearFailure,
    /** The next message rebuilds the transport, restarting an agent with its new sign-in. */
    markTransportDirty: chatSession.markTransportDirty
  }
}
