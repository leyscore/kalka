import CanvasKitInit, { type CanvasKit } from 'canvaskit-wasm'

let instance: CanvasKit | null = null

export async function getCanvasKit(): Promise<CanvasKit> {
  if (instance) return instance
  instance = await CanvasKitInit({
    locateFile: () => '/canvaskit.wasm',
  })
  return instance
}
