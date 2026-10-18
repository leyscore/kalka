import { expect, test } from 'bun:test'

import {
  answerClosePrompt,
  closePrompt,
  requestDocumentClose,
  requestDocumentsClose
} from '@/app/document/close/prompt'

function dirtyDocument() {
  let saves = 0
  return {
    get saves() {
      return saves
    },
    hasUnsavedChanges: () => saves === 0,
    saveFigFile: async () => {
      saves++
      return true
    }
  }
}

async function nextPrompt() {
  for (let i = 0; i < 10 && closePrompt.value === null; i++) await Promise.resolve()
  return closePrompt.value
}

test('a document prompt shows its name and Save saves before closing', async () => {
  const document = dirtyDocument()
  const result = requestDocumentClose(document, 'Poster')
  expect(await nextPrompt()).toEqual({ kind: 'document', documentName: 'Poster' })
  answerClosePrompt('save')
  expect(await result).toBe('saved')
  expect(document.saves).toBe(1)
  expect(closePrompt.value).toBeNull()
})

test('prompts queue, so a second request waits for the first answer', async () => {
  const first = requestDocumentClose(dirtyDocument(), 'First')
  const second = requestDocumentsClose(['A', 'B'])
  expect(await nextPrompt()).toEqual({ kind: 'document', documentName: 'First' })
  answerClosePrompt('discard')
  expect(await first).toBe('discard')
  expect(await nextPrompt()).toEqual({ kind: 'documents', documentNames: ['A', 'B'] })
  answerClosePrompt('review')
  expect(await second).toBe('review')
})

test('an answer the prompt does not offer counts as Cancel', async () => {
  const many = requestDocumentsClose(['A', 'B'])
  await nextPrompt()
  answerClosePrompt('save')
  expect(await many).toBe('cancel')

  const document = dirtyDocument()
  const one = requestDocumentClose(document, 'One')
  await nextPrompt()
  answerClosePrompt('save-all')
  expect(await one).toBe('cancel')
  expect(document.saves).toBe(0)
})
