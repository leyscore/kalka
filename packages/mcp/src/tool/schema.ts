import * as v from 'valibot'

import { toolInputEntries, type ParamDef } from '@open-pencil/core/tools'

/** Advertise canonical numeric inputs while preserving MCP's numeric coercion. */
export function toolSchema(
  params: Record<string, ParamDef>,
  entries: v.ObjectEntries,
  targetEntries: v.ObjectEntries
): v.ObjectSchema<v.ObjectEntries, undefined> {
  const schema = v.object({ ...entries, ...targetEntries })
  const parser = v.object({
    ...toolInputEntries(v, params, { coerceNumbers: true }),
    ...targetEntries
  })
  return {
    ...schema,
    '~standard': {
      ...schema['~standard'],
      validate: parser['~standard'].validate
    }
  }
}
