import type * as valibot from 'valibot'

import type { ParamDef } from './schema'

/** Shared input contract for AI, MCP, and browser tool adapters. */
export function toolInputEntries(
  v: typeof valibot,
  params: Record<string, ParamDef>,
  options: { coerceNumbers?: boolean } = {}
): valibot.ObjectEntries {
  return Object.fromEntries(
    Object.entries(params).map(([name, param]) => [name, paramSchema(v, param, options)])
  )
}

function paramSchema(
  v: typeof valibot,
  param: ParamDef,
  options: { coerceNumbers?: boolean }
): valibot.GenericSchema {
  let schema: valibot.GenericSchema
  switch (param.type) {
    case 'string':
      schema = param.enum ? v.picklist(param.enum) : v.string()
      break
    case 'number': {
      let number: valibot.GenericSchema<number, number> = v.number()
      if (param.min !== undefined) number = v.pipe(number, v.minValue(param.min))
      if (param.max !== undefined) number = v.pipe(number, v.maxValue(param.max))
      schema = options.coerceNumbers ? v.pipe(v.unknown(), v.transform(Number), number) : number
      break
    }
    case 'boolean':
      schema = v.boolean()
      break
    case 'color':
      schema = v.string()
      break
    case 'string[]':
      schema = v.pipe(v.array(v.string()), v.minLength(1))
      break
  }
  schema = v.pipe(schema, v.description(param.description))
  return param.required ? schema : v.optional(schema, param.default)
}
