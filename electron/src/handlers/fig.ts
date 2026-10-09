import { crc32, zstdCompressSync, constants } from 'node:zlib'

/**
 * A `.fig` file as Figma writes it: a "fig-kiwi" container (schema, then zstd-compressed
 * document) stored with a thumbnail, metadata and images in an uncompressed zip.
 */
export function buildFigFile(input: {
  schemaDeflated: number[]
  kiwiData: number[]
  thumbnailPng: number[]
  metaJson: string
  images: { name: string; data: number[] }[]
  figKiwiVersion?: number
}): Uint8Array {
  const schema = Buffer.from(input.schemaDeflated)
  const document = zstdCompressSync(Buffer.from(input.kiwiData), {
    params: { [constants.ZSTD_c_compressionLevel]: 3, [constants.ZSTD_c_contentSizeFlag]: 1 }
  })
  const header = Buffer.alloc(8 + 4)
  header.write('fig-kiwi', 0, 'latin1')
  header.writeUInt32LE(input.figKiwiVersion ?? 101, 8)
  const canvas = Buffer.concat([header, u32(schema.length), schema, u32(document.length), document])
  return storedZip([
    { name: 'canvas.fig', data: canvas },
    { name: 'thumbnail.png', data: Buffer.from(input.thumbnailPng) },
    { name: 'meta.json', data: Buffer.from(input.metaJson, 'utf8') },
    ...input.images.map((image) => ({ name: image.name, data: Buffer.from(image.data) }))
  ])
}

function u32(value: number): Buffer {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32LE(value)
  return buffer
}

/** A zip archive whose entries are stored, not compressed, as the `.fig` format expects. */
export function storedZip(entries: { name: string; data: Buffer }[]): Uint8Array {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (const { name, data } of entries) {
    const fileName = Buffer.from(name, 'utf8')
    const checksum = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(0, 8) // stored
    local.writeUInt32LE(checksum, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(fileName.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt32LE(checksum, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(fileName.length, 28)
    central.writeUInt32LE(offset, 42)
    locals.push(local, fileName, data)
    centrals.push(central, fileName)
    offset += local.length + fileName.length + data.length
  }
  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return new Uint8Array(Buffer.concat([...locals, directory, end]))
}
