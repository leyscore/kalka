import { useLocalStorage } from '@vueuse/core'

/**
 * The lists of files on Home: the ones opened on this computer, the storage workspace, and the
 * files on the signed-in Kalka server.
 */
export type HomeFilesTab = 'recent' | 'storage' | 'server'

/** Which list Home shows, kept between launches; opening the storage workspace switches to it. */
export const homeFilesTab = useLocalStorage<HomeFilesTab>('kalka:home-files-tab', 'recent')
