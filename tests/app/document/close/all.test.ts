import { expect, test } from 'bun:test'

import { confirmAllDocuments } from '@/app/document/close/all'
import type { CloseChoice, DocumentsCloseChoice } from '@/app/document/close/controller'

function openDocument(name: string, dirty: boolean, saves = true) {
  const document = {
    state: { documentName: name },
    dirty,
    saved: 0,
    discarded: 0,
    persisted: 0,
    hasUnsavedChanges: () => document.dirty,
    saveFigFile: async () => {
      document.saved++
      if (saves) document.dirty = false
      return saves
    },
    persistRecoveryNow: async () => {
      document.persisted++
    },
    discardRecovery: async () => {
      document.discarded++
    }
  }
  return document
}

type OpenDocument = ReturnType<typeof openDocument>

function prompts(many: DocumentsCloseChoice, each: CloseChoice = 'save') {
  const asked: string[] = []
  const lists: string[][] = []
  const revealed: string[] = []
  return {
    asked,
    lists,
    revealed,
    prompts: {
      confirm: async (document: OpenDocument, name: string) => {
        if (!document.hasUnsavedChanges()) return 'saved' as const
        asked.push(name)
        if (each !== 'save') return each
        return (await document.saveFigFile()) ? ('saved' as const) : ('cancel' as const)
      },
      chooseMany: async (names: string[]) => {
        lists.push(names)
        return many
      },
      reveal: (document: OpenDocument) => {
        revealed.push(document.state.documentName)
      }
    }
  }
}

test('one unsaved document asks only about that document', async () => {
  const documents = [openDocument('Clean', false), openDocument('Draft', true)]
  const flow = prompts('cancel')
  expect(await confirmAllDocuments(() => documents, flow.prompts)).toBe(true)
  expect(flow.lists).toEqual([])
  expect(flow.asked).toEqual(['Draft'])
})

test('several unsaved documents ask once and list only the unsaved ones', async () => {
  const documents = [openDocument('A', true), openDocument('Clean', false), openDocument('B', true)]
  const flow = prompts('cancel')
  expect(await confirmAllDocuments(() => documents, flow.prompts)).toBe(false)
  expect(flow.lists).toEqual([['A', 'B']])
  expect(flow.asked).toEqual([])
  expect(documents.every((document) => document.saved === 0)).toBe(true)
})

test('Save All saves every unsaved document without asking about each', async () => {
  const documents = [openDocument('A', true), openDocument('B', true)]
  const flow = prompts('save-all')
  expect(await confirmAllDocuments(() => documents, flow.prompts)).toBe(true)
  expect(flow.asked).toEqual([])
  expect(documents.map((document) => document.saved)).toEqual([1, 1])
  expect(documents.map((document) => document.persisted)).toEqual([1, 1])
})

test('Save All stops when a save is cancelled, leaving later documents untouched', async () => {
  const documents = [openDocument('A', true, false), openDocument('B', true)]
  const flow = prompts('save-all')
  expect(await confirmAllDocuments(() => documents, flow.prompts)).toBe(false)
  expect(documents.map((document) => document.saved)).toEqual([1, 0])
  expect(documents.map((document) => document.discarded)).toEqual([0, 0])
})

test('Discard All closes without saving or asking about each', async () => {
  const documents = [openDocument('A', true), openDocument('B', true)]
  const flow = prompts('discard-all')
  expect(await confirmAllDocuments(() => documents, flow.prompts)).toBe(true)
  expect(flow.asked).toEqual([])
  expect(documents.map((document) => document.saved)).toEqual([0, 0])
  expect(documents.map((document) => document.discarded)).toEqual([1, 1])
})

test('Review asks about each unsaved document in turn and shows it first', async () => {
  const documents = [openDocument('A', true), openDocument('Clean', false), openDocument('B', true)]
  const flow = prompts('review', 'discard')
  expect(await confirmAllDocuments(() => documents, flow.prompts)).toBe(true)
  expect(flow.asked).toEqual(['A', 'B'])
  expect(flow.revealed).toEqual(['A', 'B'])
  expect(documents.map((document) => document.discarded)).toEqual([1, 0, 1])
})

test('cancelling during Review keeps every document', async () => {
  const documents = [openDocument('A', true), openDocument('B', true)]
  const flow = prompts('review', 'cancel')
  expect(await confirmAllDocuments(() => documents, flow.prompts)).toBe(false)
  expect(flow.asked).toEqual(['A'])
  expect(documents.map((document) => document.discarded)).toEqual([0, 0])
})

test('a document opened while asking stops the close', async () => {
  const documents = [openDocument('A', true), openDocument('B', true)]
  const flow = prompts('discard-all')
  let current = documents
  const original = flow.prompts.chooseMany
  flow.prompts.chooseMany = async (names) => {
    current = [...documents, openDocument('Late', true)]
    return original(names)
  }
  expect(await confirmAllDocuments(() => current, flow.prompts)).toBe(false)
})
