import { ref } from 'vue'

/** Whether the About Kalka dialog is open; the desktop app shows the system's own panel instead. */
export const aboutOpen = ref(false)

export function openAbout(): void {
  aboutOpen.value = true
}
