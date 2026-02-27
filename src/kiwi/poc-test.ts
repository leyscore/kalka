/**
 * PoC 3: Kiwi codec round-trip test
 *
 * Validates:
 * 1. Schema compiles (194 definitions, 2178 lines)
 * 2. Encode a NODE_CHANGES message with shapes
 * 3. Decode it back — verify data integrity
 * 4. Zstd compress/decompress round-trip
 */

import {
  initCodec,
  encodeMessage,
  decodeMessage,
  createNodeChange,
  createNodeChangesMessage
} from './codec.ts'

import type { NodeChange } from './codec.ts'

async function runTest() {
  console.log('=== PoC 3: Kiwi Codec Round-Trip ===\n')

  // 1. Init codec (compiles schema)
  const t0 = performance.now()
  await initCodec()
  console.log(`✅ Schema compiled in ${(performance.now() - t0).toFixed(1)}ms`)

  // 2. Create test node changes
  const sessionID = 99999
  const changes: NodeChange[] = [
    createNodeChange({
      sessionID,
      localID: 1,
      parentSessionID: 0,
      parentLocalID: 0,
      type: 'FRAME',
      name: 'Test Frame',
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: '#FFFFFF'
    }),
    createNodeChange({
      sessionID,
      localID: 2,
      parentSessionID: sessionID,
      parentLocalID: 1,
      type: 'RECTANGLE',
      name: 'Blue Card',
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      fill: '#3B82F6',
      cornerRadius: 12
    }),
    createNodeChange({
      sessionID,
      localID: 3,
      parentSessionID: sessionID,
      parentLocalID: 1,
      type: 'ELLIPSE',
      name: 'Green Circle',
      x: 300,
      y: 80,
      width: 100,
      height: 100,
      fill: '#22C55E'
    }),
    createNodeChange({
      sessionID,
      localID: 4,
      parentSessionID: sessionID,
      parentLocalID: 1,
      type: 'TEXT',
      name: 'Hello World',
      x: 50,
      y: 250,
      width: 200,
      height: 40,
      fill: '#000000'
    })
  ]

  console.log(`✅ Created ${changes.length} node changes`)

  // 3. Encode
  const message = createNodeChangesMessage(sessionID, 1, changes)
  const t1 = performance.now()
  const encoded = encodeMessage(message)
  const encodeTime = performance.now() - t1
  console.log(`✅ Encoded: ${encoded.byteLength} bytes (${encodeTime.toFixed(2)}ms)`)
  console.log(
    `   Zstd compressed: starts with 0x${encoded[0]?.toString(16)}${encoded[1]?.toString(16)}${encoded[2]?.toString(16)}${encoded[3]?.toString(16)}`
  )

  // 4. Decode
  const t2 = performance.now()
  const decoded = decodeMessage(encoded)
  const decodeTime = performance.now() - t2
  console.log(`✅ Decoded in ${decodeTime.toFixed(2)}ms`)

  // 5. Verify round-trip
  const nc = decoded.nodeChanges
  if (!nc || nc.length !== changes.length) {
    console.error(`❌ Node count mismatch: expected ${changes.length}, got ${nc?.length}`)
    process.exit(1)
  }

  for (let i = 0; i < nc.length; i++) {
    const original = changes[i]!
    const roundtripped = nc[i]!

    // Verify GUID
    if (
      roundtripped.guid?.sessionID !== original.guid.sessionID ||
      roundtripped.guid?.localID !== original.guid.localID
    ) {
      console.error(`❌ Node ${i} GUID mismatch`)
      process.exit(1)
    }

    // Verify name
    if (roundtripped.name !== original.name) {
      console.error(`❌ Node ${i} name mismatch: "${roundtripped.name}" !== "${original.name}"`)
      process.exit(1)
    }

    // Verify type
    if (roundtripped.type !== original.type) {
      console.error(`❌ Node ${i} type mismatch: "${roundtripped.type}" !== "${original.type}"`)
      process.exit(1)
    }

    // Verify size
    if (roundtripped.size?.x !== original.size?.x || roundtripped.size?.y !== original.size?.y) {
      console.error(`❌ Node ${i} size mismatch`)
      process.exit(1)
    }

    // Verify transform (position)
    if (
      roundtripped.transform?.m02 !== original.transform?.m02 ||
      roundtripped.transform?.m12 !== original.transform?.m12
    ) {
      console.error(`❌ Node ${i} position mismatch`)
      process.exit(1)
    }

    // Verify fill
    if (original.fillPaints && original.fillPaints.length > 0) {
      const origFill = original.fillPaints[0]!
      const rtFill = roundtripped.fillPaints?.[0]
      if (!rtFill) {
        console.error(`❌ Node ${i} missing fill`)
        process.exit(1)
      }
      if (rtFill.type !== origFill.type) {
        console.error(`❌ Node ${i} fill type mismatch`)
        process.exit(1)
      }
    }

    console.log(
      `   ✓ Node ${i}: ${roundtripped.name} (${roundtripped.type}) @ ${roundtripped.transform?.m02},${roundtripped.transform?.m12} [${roundtripped.size?.x}×${roundtripped.size?.y}]`
    )
  }

  console.log(`\n✅ PoC 3 PASSED: ${changes.length} nodes round-tripped through Kiwi+Zstd`)
  console.log(`   Schema: 194 definitions`)
  console.log(`   Encode: ${encodeTime.toFixed(2)}ms → ${encoded.byteLength} bytes`)
  console.log(`   Decode: ${decodeTime.toFixed(2)}ms`)
}

runTest().catch((e) => {
  console.error('❌ PoC 3 FAILED:', e)
  process.exit(1)
})
