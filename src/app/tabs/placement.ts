import { computed, onUnmounted, ref } from 'vue'

/** How many editor top bars hold the tabs right now: switching designs mounts the next before the last leaves. */
const hosts = ref(0)

/** Whether the editor's top bar carries the tabs, so the bar of its own steps aside. */
export const tabsInTopBar = computed(() => hosts.value > 0)

/** Declares the calling component as the place the tabs live, for as long as it is mounted. */
export function useTabsHost(): void {
  hosts.value++
  onUnmounted(() => {
    hosts.value--
  })
}

/** Where the tab row was scrolled and whether a tab held the keyboard when its bar last left. */
interface TabRowHandoff {
  scrollLeft: number
  focused: boolean
}

let handoff: TabRowHandoff | null = null

/** The editor's top bar is rebuilt for each design: the leaving tab row leaves its state for the next. */
export function leaveTabRow(state: TabRowHandoff): void {
  handoff = state
}

/** The state the last tab row left, taken once. */
export function takeTabRowHandoff(): TabRowHandoff | null {
  const state = handoff
  handoff = null
  return state
}
