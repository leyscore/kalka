import { readFigFile } from '@kalka/core/io/formats/fig'

export function readFigDocument(file: File, signal?: AbortSignal) {
  return readFigFile(file, {
    populate: 'first-page',
    signal
  })
}
