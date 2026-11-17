import { installDesignJSXEvaluator } from '@kalka/core/design-jsx'

import { convertDesignJSXRoots } from '@/app/code/sandbox/convert'
import { evaluateDesignJSX } from '@/app/code/sandbox/evaluate'

/**
 * Agents' Design JSX (`render`, `node_replace_with`, the chat) runs in the code sandbox, as the
 * code panel's does: the desktop app's page policy forbids evaluating code in the page itself,
 * and agent code has no business running with the editor's privileges anyway.
 */
export function installDesignJSXSandbox(): () => void {
  return installDesignJSXEvaluator(async (jsx) => {
    const evaluated = await evaluateDesignJSX(jsx)
    if (!evaluated.ok) throw new Error(evaluated.error)
    return convertDesignJSXRoots(evaluated.roots, evaluated.lineOffsets)
  })
}
