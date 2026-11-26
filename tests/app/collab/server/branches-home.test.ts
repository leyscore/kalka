import { expect, test } from 'bun:test'

import * as v from 'valibot'

import { groupServerBranches, serverDocumentSchema } from '@/app/collab/server/api'

function file(id: string, branchOf: string | null = null) {
  return v.parse(serverDocumentSchema, {
    id,
    name: id,
    createdAt: 1,
    updatedAt: 2,
    hasFile: true,
    branchOf
  })
}

test('Home lists branches under their main file, and a branch without it as a file', () => {
  const { files, branches } = groupServerBranches([
    file('poster'),
    file('poster-dark', 'poster'),
    file('flyer'),
    file('poster-print', 'poster'),
    file('lost', 'gone')
  ])
  expect(files.map((document) => document.id)).toEqual(['poster', 'flyer', 'lost'])
  expect(branches.get('poster')?.map((document) => document.id)).toEqual([
    'poster-dark',
    'poster-print'
  ])
  expect(branches.has('flyer')).toBe(false)
})
