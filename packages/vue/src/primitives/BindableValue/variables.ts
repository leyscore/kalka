import type { Variable } from '@kalka/scene-graph'

/**
 * A variable list that keeps its identity while the same variables show under the same names.
 * The list is read again on every scene change, a keystroke included; keeping it spares the
 * field that shows it a re-render. Variables are renamed in place, so the names are compared
 * from a copy taken when the list was last shown.
 */
export function createStableVariableList() {
  let shown: Variable[] | undefined
  let shownNames: string[] = []
  return (next: Variable[]): Variable[] => {
    const names = next.map((variable) => variable.name)
    const same =
      shown !== undefined &&
      shown.length === next.length &&
      shown.every((variable, index) => variable === next[index]) &&
      names.every((name, index) => name === shownNames[index])
    shownNames = names
    if (!same) shown = next
    return shown ?? next
  }
}
