import { describe, expect, test } from 'bun:test'

import type { LanguageModel } from 'ai'

import { AI_PROVIDERS } from '@kalka/core/constants'

import { testProviderConnection } from '@/app/ai/chat/connection-test'
import { resolveLanguageModelID } from '@/app/ai/chat/model'
import { normalizeOpenRouterModel } from '@/app/ai/chat/provider-models'
import { compatibleBaseURL, createAnthropicCompatibleAdapter } from '@/app/ai/providers/compatible'
import { modelProviderAdapter } from '@/app/ai/providers/registry'
import type { ModelConfig } from '@/app/ai/providers/types'
import type { FetchFunction } from '@/app/http/types'

function languageModelInstance(model: LanguageModel): Exclude<LanguageModel, string> {
  if (typeof model === 'string') throw new Error(`Expected a model instance, got ${model}`)
  return model
}

describe('resolveLanguageModelID', () => {
  test('uses the selected OpenRouter model when no custom model is configured', () => {
    expect(
      resolveLanguageModelID({
        providerID: 'openrouter',
        modelID: 'anthropic/claude-sonnet-4.6',
        customModelID: ''
      })
    ).toBe('anthropic/claude-sonnet-4.6')
  })

  test('uses a custom OpenRouter model ID when provided', () => {
    expect(
      resolveLanguageModelID({
        providerID: 'openrouter',
        modelID: 'anthropic/claude-sonnet-4.6',
        customModelID: '  meta-llama/llama-3.3-70b-instruct  '
      })
    ).toBe('meta-llama/llama-3.3-70b-instruct')
  })
})

describe('model provider registry', () => {
  test('offers MiniMax-M3 as the default MiniMax model', () => {
    const provider = AI_PROVIDERS.find(({ id }) => id === 'minimax')
    expect(provider?.defaultModel).toBe('MiniMax-M3')
    expect(provider?.models[0]).toMatchObject({ id: 'MiniMax-M3' })
  })

  test('sends MiniMax-M3 through the OpenAI-compatible chat endpoint', async () => {
    let requestURL = ''
    let requestBody = ''
    const fetchSpy: FetchFunction = async (input, init) => {
      requestURL = String(input)
      requestBody = String(init?.body)
      throw new Error('stop')
    }
    const config: ModelConfig = {
      providerID: 'minimax',
      apiKey: 'test-key',
      modelID: 'MiniMax-M3',
      customModelID: '',
      customBaseURL: '',
      customAPIType: 'completions'
    }

    const model = languageModelInstance(
      modelProviderAdapter('minimax').create(config, { fetch: fetchSpy })
    )
    await Promise.resolve(
      model.doGenerate({ prompt: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }] })
    ).catch(() => undefined)

    expect(requestURL).toBe('https://api.minimax.io/v1/chat/completions')
    expect(requestBody).toContain('"model":"MiniMax-M3"')
  })

  test('registers every direct provider without handling agent runtimes as models', () => {
    for (const provider of AI_PROVIDERS.filter((entry) => entry.id !== 'harness:pi')) {
      expect(modelProviderAdapter(provider.id).create).toBeFunction()
    }
    expect(() => modelProviderAdapter('harness:pi')).toThrow('Harness agents')
    expect(() => modelProviderAdapter('acp:claude-code')).toThrow(
      'ACP providers and Harness agents do not use direct API models'
    )
  })
})

describe('local OpenAI-compatible servers', () => {
  const localConfig: ModelConfig = {
    providerID: 'openai-compatible',
    apiKey: '',
    modelID: '',
    customModelID: 'qwen3-coder',
    customBaseURL: 'http://192.168.1.20:1234',
    customAPIType: 'completions'
  }

  test('a bare server address uses the /v1 API path; any other path is kept', () => {
    expect(compatibleBaseURL('http://localhost:1234')).toBe('http://localhost:1234/v1')
    expect(compatibleBaseURL(' http://localhost:1234/ ')).toBe('http://localhost:1234/v1')
    expect(compatibleBaseURL('http://localhost:1234/v1/')).toBe('http://localhost:1234/v1')
    expect(compatibleBaseURL('https://api.groq.com/openai/v1')).toBe(
      'https://api.groq.com/openai/v1'
    )
    expect(compatibleBaseURL('http://localhost:8080/api')).toBe('http://localhost:8080/api')
  })

  test('sends a keyless request to /v1 with no credential header and the output limit', async () => {
    let requestURL = ''
    let requestBody = ''
    let headers = new Headers()
    const fetchSpy: FetchFunction = async (input, init) => {
      requestURL = String(input)
      requestBody = String(init?.body)
      headers = new Headers(init?.headers)
      throw new Error('stop')
    }
    const model = languageModelInstance(
      modelProviderAdapter('openai-compatible').create(localConfig, { fetch: fetchSpy })
    )
    await Promise.resolve(
      model.doGenerate({
        prompt: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }],
        maxOutputTokens: 16_384
      })
    ).catch(() => undefined)

    expect(requestURL).toBe('http://192.168.1.20:1234/v1/chat/completions')
    expect(headers.has('authorization')).toBe(false)
    expect(requestBody).toContain('"model":"qwen3-coder"')
    expect(requestBody).toContain('"max_tokens":16384')
  })

  test('keeps the bearer token when a key is set', async () => {
    let headers = new Headers()
    const fetchSpy: FetchFunction = async (_input, init) => {
      headers = new Headers(init?.headers)
      throw new Error('stop')
    }
    const model = languageModelInstance(
      modelProviderAdapter('openai-compatible').create(
        { ...localConfig, apiKey: 'local-key' },
        { fetch: fetchSpy }
      )
    )
    await Promise.resolve(
      model.doGenerate({ prompt: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }] })
    ).catch(() => undefined)

    expect(headers.get('authorization')).toBe('Bearer local-key')
  })

  test('tests a connection without a key', async () => {
    const originalFetch = globalThis.fetch
    const requested: string[] = []
    globalThis.fetch = Object.assign(
      async (input: RequestInfo | URL) => {
        requested.push(String(input))
        return Response.json({
          id: 'chatcmpl-1',
          object: 'chat.completion',
          created: 0,
          model: 'qwen3-coder',
          choices: [
            { index: 0, message: { role: 'assistant', content: 'OK' }, finish_reason: 'length' }
          ],
          usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 }
        })
      },
      { preconnect: originalFetch.preconnect }
    )
    try {
      expect(await testProviderConnection(localConfig)).toEqual({ ok: true })
      expect(requested).toEqual(['http://192.168.1.20:1234/v1/chat/completions'])
      expect(await testProviderConnection({ ...localConfig, providerID: 'openai' })).toEqual({
        ok: false,
        reason: 'missing-api-key'
      })
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})

describe('anthropic compatible adapter', () => {
  const config: ModelConfig = {
    providerID: 'anthropic',
    apiKey: 'test-key',
    modelID: 'claude-sonnet-4.6',
    customModelID: '',
    customBaseURL: '',
    customAPIType: 'completions'
  }

  async function capturedHeaders(): Promise<Record<string, string>> {
    let captured: Record<string, string> = {}
    const fetchSpy: FetchFunction = async (_input, init) => {
      captured = Object.fromEntries(new Headers(init?.headers).entries())
      throw new Error('stop')
    }

    const model = languageModelInstance(
      createAnthropicCompatibleAdapter().create(config, { fetch: fetchSpy })
    )
    await Promise.resolve(
      model.doGenerate({ prompt: [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }] })
    ).catch(() => undefined)

    return captured
  }

  test('opts into direct browser access so Anthropic returns CORS headers', async () => {
    // Anthropic omits Access-Control-Allow-Origin unless this header is sent, which makes the
    // web build fail with an opaque network error. See #436.
    expect(await capturedHeaders()).toHaveProperty(
      'anthropic-dangerous-direct-browser-access',
      'true'
    )
  })
})

describe('normalizeOpenRouterModel', () => {
  test('keeps tool-capable OpenRouter models', () => {
    expect(
      normalizeOpenRouterModel({
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        supported_parameters: ['tools'],
        architecture: { input_modalities: ['text', 'image'] },
        top_provider: { max_completion_tokens: 32_768 }
      })
    ).toEqual({
      id: 'meta-llama/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B Instruct',
      capabilities: ['tools', 'vision'],
      recommendedMaxOutputTokens: 32_768
    })
  })

  test('skips OpenRouter models without tool support', () => {
    expect(
      normalizeOpenRouterModel({
        id: 'text-only/model',
        name: 'Text Only',
        supported_parameters: []
      })
    ).toBeNull()
  })
})
