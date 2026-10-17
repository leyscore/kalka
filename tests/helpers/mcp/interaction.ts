import type { Client, ClientCapabilities } from '@modelcontextprotocol/client'
import * as v from 'valibot'

import { SceneGraph } from '@kalka/scene-graph'

/** What a test client can do for the server, and how it answers when asked. */
export interface ClientAnswers {
  /** Field values the user fills a form with, or a refusal; omit to not declare elicitation. */
  form?: Record<string, string> | 'decline' | 'cancel'
  /** The text the client's model answers a sampling request with; omit to not declare sampling. */
  model?: string | ((prompt: string) => string)
}

/** What the server asked the client, in order. */
export interface ClientRequests {
  forms: Array<{ message: string; requestedSchema: unknown }>
  prompts: Array<{ systemPrompt?: string; prompt: string; maxTokens: number }>
}

export function clientCapabilities(answers: ClientAnswers): ClientCapabilities {
  const capabilities: ClientCapabilities = {}
  if (answers.form !== undefined) capabilities.elicitation = { form: {} }
  if (answers.model !== undefined) capabilities.sampling = {}
  return capabilities
}

const TextMessage = v.object({ content: v.object({ type: v.literal('text'), text: v.string() }) })

/** Answers the server's forms and sampling requests as `answers` says, recording each. */
export function answerServerRequests(client: Client, answers: ClientAnswers): ClientRequests {
  const asked: ClientRequests = { forms: [], prompts: [] }
  const { form, model } = answers
  if (form !== undefined) {
    client.setRequestHandler('elicitation/create', (request) => {
      const params = request.params
      asked.forms.push({
        message: params.message,
        requestedSchema: 'requestedSchema' in params ? params.requestedSchema : undefined
      })
      if (form === 'decline' || form === 'cancel') return { action: form }
      return { action: 'accept', content: form }
    })
  }
  if (model !== undefined) {
    client.setRequestHandler('sampling/createMessage', (request) => {
      const message = v.parse(TextMessage, request.params.messages.at(-1))
      const prompt = message.content.text
      asked.prompts.push({
        systemPrompt: request.params.systemPrompt,
        prompt,
        maxTokens: request.params.maxTokens
      })
      return {
        model: 'test-model',
        role: 'assistant',
        content: { type: 'text', text: typeof model === 'string' ? model : model(prompt) }
      }
    })
  }
  return asked
}

/** A page with a card whose button and icon still have default names. */
export function graphWithDefaultNames(): {
  graph: SceneGraph
  buttonId: string
  iconId: string
} {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  if (!page) throw new Error('No page')
  const card = graph.createNode('FRAME', page.id, { name: 'Pricing card', width: 320, height: 200 })
  const button = graph.createNode('FRAME', card.id, { name: 'Frame 12', width: 120, height: 40 })
  graph.createNode('TEXT', button.id, { name: 'Label', text: 'Start free trial' })
  const icon = graph.createNode('RECTANGLE', card.id, {
    name: 'Rectangle 3',
    width: 16,
    height: 16
  })
  return { graph, buttonId: button.id, iconId: icon.id }
}

/** A collection whose radius variable a layer is bound to. */
export function graphWithBoundCollection(): { graph: SceneGraph; collectionId: string } {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  if (!page) throw new Error('No page')
  const collection = graph.createCollection('Brand')
  const radius = graph.createVariable('Radius', 'FLOAT', collection.id, 8)
  const card = graph.createNode('FRAME', page.id, { name: 'Card' })
  graph.bindVariable(card.id, 'cornerRadius', radius.id)
  return { graph, collectionId: collection.id }
}

/** The document list of an app whose only document has unsaved changes. */
export function unsavedDocumentList(path?: string) {
  return {
    documents: [
      {
        id: 'doc-1',
        name: 'Mock document',
        ...(path ? { path } : {}),
        active: true,
        unsaved: true,
        current_page_id: '0:1',
        current_page_name: 'Page 1',
        pages: [{ id: '0:1', name: 'Page 1' }]
      }
    ]
  }
}
