import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'

/**
 * The lists of files on Home: the ones opened on this computer, the storage workspace, and the
 * files on the signed-in Kalka server.
 */
export type HomeFilesTab = 'recent' | 'storage' | 'server'

/** Which list Home shows, kept between launches; opening the storage workspace switches to it. */
export const homeFilesTab = useLocalStorage<HomeFilesTab>('kalka:home-files-tab', 'recent')

/**
 * A list someone asked to see, such as the server's from Settings, until Home shows it at its
 * address; Home's own address otherwise shows the recent files from every place.
 */
export const homeFilesRequest = ref<HomeFilesTab | null>(null)
