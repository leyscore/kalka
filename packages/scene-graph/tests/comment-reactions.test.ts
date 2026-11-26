import { describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import {
  addCommentThread,
  commentThreadsSchema,
  documentComments,
  mentionedPeople,
  replyToComment,
  SceneGraph,
  toggleCommentReaction
} from '@kalka/scene-graph'

const ada = { kind: 'person' as const, name: 'Ada' }

function thread() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const started = addCommentThread(graph, { pageId: page.id, nodeId: null, x: 0, y: 0 }, ada, 'Hi')
  const message = started.messages[0]
  return { graph, threadId: started.id, messageId: message.id }
}

describe('comment reactions', () => {
  test('a reaction is given once per person and taken back by them', () => {
    const { graph, threadId, messageId } = thread()
    toggleCommentReaction(graph, threadId, messageId, '👍', 'Ada')
    toggleCommentReaction(graph, threadId, messageId, '👍', 'Grace')
    toggleCommentReaction(graph, threadId, messageId, '🎉', 'Grace')
    let message = documentComments(graph)[0].messages[0]
    expect(message.reactions).toEqual([
      { emoji: '👍', people: ['Ada', 'Grace'] },
      { emoji: '🎉', people: ['Grace'] }
    ])

    toggleCommentReaction(graph, threadId, messageId, '🎉', 'Grace')
    toggleCommentReaction(graph, threadId, messageId, '👍', 'Ada')
    message = documentComments(graph)[0].messages[0]
    expect(message.reactions).toEqual([{ emoji: '👍', people: ['Grace'] }])
  })

  test('reactions and mentions survive saving and reading the document', () => {
    const { graph, threadId, messageId } = thread()
    toggleCommentReaction(graph, threadId, messageId, '❤️', 'Grace')
    replyToComment(graph, threadId, ada, '@Grace Hopper look', { mentions: ['Grace Hopper'] })
    const saved = JSON.stringify(documentComments(graph))
    const read = v.parse(v.pipe(v.string(), v.parseJson(), commentThreadsSchema), saved)
    expect(read[0].messages[0].reactions).toEqual([{ emoji: '❤️', people: ['Grace'] }])
    expect(read[0].messages[1].mentions).toEqual(['Grace Hopper'])
  })
})

describe('mentions of people', () => {
  const people = ['Ada', 'Ada Lovelace', 'Grace Hopper', 'Adam']

  test('finds whole names, the longest at a place, in the order written', () => {
    expect(mentionedPeople('@grace hopper and @Ada Lovelace, see this', people)).toEqual([
      'Grace Hopper',
      'Ada Lovelace'
    ])
  })

  test('does not take a name for the start of a longer word', () => {
    expect(mentionedPeople('ask @Adamant', people)).toEqual([])
    expect(mentionedPeople('ask @Adam.', people)).toEqual(['Adam'])
    expect(mentionedPeople('mail ada@example.com', people)).toEqual([])
    expect(mentionedPeople('mail me@Ada', people)).toEqual([])
  })
})
