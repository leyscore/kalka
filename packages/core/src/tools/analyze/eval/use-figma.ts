import * as v from 'valibot'

import { figmaClientInputs } from '#core/tools/input'
import { defineTool } from '#core/tools/schema'

import { runFigmaScript } from './figma-script'

/**
 * Figma's `use_figma` under its own name, so agents and skills written for Figma's MCP server
 * run their Plugin API scripts on the open Kalka document unchanged.
 */
export const useFigma = defineTool({
  name: 'use_figma',
  description:
    "Run Figma Plugin API JavaScript on the open document, as Figma's use_figma does. The code runs with top-level await and return; the `figma` global is the Plugin API (with `figma.variables`) and `kalka` adds what Figma has no API for. Return the IDs of the layers you create or change. The result has the JSON return value as `result`, plus `createdNodeIds`, `changedNodeIds`, `removedNodeIds`, and `logs` (console output). A Plugin API member Kalka lacks throws a TypeError naming it; a failed script reports `safeToRetryWithoutCanvasRead`. Each call is one undo step.",
  execution: { kind: 'async', mutation: 'document' },
  capabilities: ['document:read', 'document:write', 'code:execute'],
  availability: 'eval',
  input: v.strictObject({
    code: v.pipe(
      v.string(),
      v.minLength(1),
      v.description('Plugin API JavaScript; top-level await and return are allowed')
    ),
    description: v.optional(
      v.pipe(v.string(), v.description('What the script does; accepted and ignored'))
    ),
    skillNames: v.optional(
      v.pipe(v.string(), v.description('Skills that wrote the script, for logging; ignored'))
    ),
    fileKey: figmaClientInputs.fileKey
  }),
  execute: (figma, { code }) => runFigmaScript(figma, code)
})
