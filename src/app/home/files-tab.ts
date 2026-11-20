import { useLocalStorage } from '@vueuse/core'

/** The two lists of files on Home: the ones opened on this computer, and the storage workspace. */
export type HomeFilesTab = 'recent' | 'storage'

/** Which list Home shows, kept between launches; opening the storage workspace switches to it. */
export const homeFilesTab = useLocalStorage<HomeFilesTab>('kalka:home-files-tab', 'recent')
