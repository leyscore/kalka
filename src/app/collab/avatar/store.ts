import { createGlobalState, useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

import { colorToCSS } from '@kalka/scene-graph/color'
import { randomHex } from '@kalka/scene-graph/random'

import { useCollabIdentity } from '@/app/collab/identity'

import { pixelAvatarURL } from './pixel'

const SEED_STORAGE_KEY = 'kalka:avatar-seed'
const PHOTO_STORAGE_KEY = 'kalka:avatar-photo'
/** A photo is kept as a small square, enough for every avatar the app draws. */
const PHOTO_SIZE = 192
const PHOTO_QUALITY = 0.86

/**
 * The person's picture on this device: their own photo once they choose one, otherwise a pixel
 * creature drawn from a seed kept here, in their room color.
 */
export const useAvatar = createGlobalState(() => {
  const identity = useCollabIdentity()
  const seed = useLocalStorage(SEED_STORAGE_KEY, randomHex(8))
  const photo = useLocalStorage(PHOTO_STORAGE_KEY, '')
  const pixel = computed(() => pixelAvatarURL(seed.value, colorToCSS(identity.color)))
  const url = computed(() => photo.value || pixel.value)
  const hasPhoto = computed(() => photo.value.length > 0)

  /** Draws a new creature; a chosen photo goes, so the new one shows. */
  function shuffle(): void {
    seed.value = randomHex(8)
    photo.value = ''
  }

  function removePhoto(): void {
    photo.value = ''
  }

  /** Keeps the image as a square cut from its middle; rejects a file the browser cannot read. */
  async function choosePhoto(file: Blob): Promise<void> {
    const bitmap = await createImageBitmap(file)
    const side = Math.min(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas')
    canvas.width = PHOTO_SIZE
    canvas.height = PHOTO_SIZE
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No 2D canvas')
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      PHOTO_SIZE,
      PHOTO_SIZE
    )
    bitmap.close()
    photo.value = canvas.toDataURL('image/webp', PHOTO_QUALITY)
  }

  return { seed, url, pixel, hasPhoto, shuffle, removePhoto, choosePhoto }
})
