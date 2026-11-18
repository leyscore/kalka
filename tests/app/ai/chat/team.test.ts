import { afterEach, beforeEach, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { leadingMention, namesLeadAgent, teamInstructions, teamOf } from '@/app/ai/chat/team'
import { createEditorStore, type EditorStore } from '@/app/editor/session'

let store: EditorStore

beforeEach(() => {
  store = createEditorStore(new SceneGraph())
})

afterEach(() => {
  store.preparationController.dispose()
})

test('a message names its agent with @Name at its start', () => {
  expect(leadingMention('@Fern build the pricing section')).toBe('Fern')
  expect(leadingMention('  @Orbit-2 tidy the footer')).toBe('Orbit-2')
  expect(leadingMention('@Fern')).toBe('Fern')
  expect(leadingMention('Ask @Fern later')).toBeNull()
  expect(leadingMention('@ hello')).toBeNull()
  expect(leadingMention('email@example.com')).toBeNull()
})

test('@agent and the main chat callsign reach the main chat', () => {
  expect(namesLeadAgent('agent', 'Wren')).toBe(true)
  expect(namesLeadAgent('wren', 'Wren')).toBe(true)
  expect(namesLeadAgent('Fern', 'Wren')).toBe(false)
  expect(namesLeadAgent('Fern', undefined)).toBe(false)
})

test('a named agent knows its name and how to share the document', () => {
  const prompt = teamInstructions('BASE', 'Fern')
  expect(prompt.startsWith('BASE')).toBe(true)
  expect(prompt).toContain('You are Fern.')
  expect(prompt).toContain('another agent is building a frame')
})

test('each document starts without named agents', () => {
  expect(teamOf(store).value).toEqual([])
})
