import * as v from 'valibot'

import { serverDocumentSchema, serverRequest } from './api'

/**
 * The server's trash: a deleted document waits there 30 days, with its content, before it is
 * erased. Editors and administrators move documents there, restore them or erase them sooner.
 */

export const trashedDocumentSchema = v.object({
  id: v.string(),
  name: v.string(),
  deletedAt: v.number(),
  deletedBy: v.nullable(v.string()),
  expiresAt: v.number()
})
export type TrashedDocument = v.InferOutput<typeof trashedDocumentSchema>

export const trashAPI = {
  moveToTrash: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/documents/${id}`, { method: 'DELETE', token, schema: v.unknown() }),
  list: (base: string, token: string) =>
    serverRequest(base, '/api/trash', { token, schema: v.array(trashedDocumentSchema) }),
  restore: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/trash/${id}/restore`, {
      method: 'POST',
      token,
      body: {},
      schema: serverDocumentSchema
    }),
  erase: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/trash/${id}`, { method: 'DELETE', token, schema: v.unknown() })
}
