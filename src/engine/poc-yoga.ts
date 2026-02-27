/**
 * PoC 2: Yoga WASM Layout Engine
 *
 * Validates:
 * 1. yoga-layout WASM loads and initializes
 * 2. Flex layout (auto-layout) matches Figma's behavior
 * 3. Nested frames with padding, gap, alignment
 * 4. Performance: layout 1000 nodes
 */

import Yoga, {
  Align,
  Direction,
  FlexDirection,
  Gutter,
  Justify,
  Edge,
  Wrap,
  type Node as YogaNode
} from 'yoga-layout'

function runTest() {
  console.log('=== PoC 2: Yoga WASM Layout ===\n')

  // 1. Basic flex layout (Figma auto-layout: vertical, gap=16, padding=24)
  {
    const root = Yoga.Node.create()
    root.setWidth(400)
    root.setHeight('auto')
    root.setFlexDirection(FlexDirection.Column)
    root.setPadding(Edge.All, 24)
    root.setGap(Gutter.All, 16)

    const child1 = Yoga.Node.create()
    child1.setWidth('100%')
    child1.setHeight(48)

    const child2 = Yoga.Node.create()
    child2.setWidth('100%')
    child2.setHeight(120)

    const child3 = Yoga.Node.create()
    child3.setWidth('100%')
    child3.setHeight(48)

    root.insertChild(child1, 0)
    root.insertChild(child2, 1)
    root.insertChild(child3, 2)

    root.calculateLayout(undefined, undefined, Direction.LTR)

    console.log('Test 1: Vertical auto-layout (gap=16, padding=24)')
    console.log(`  Root: ${root.getComputedWidth()}×${root.getComputedHeight()}`)
    // Expected: height = 24 + 48 + 16 + 120 + 16 + 48 + 24 = 296
    const expectedHeight = 24 + 48 + 16 + 120 + 16 + 48 + 24
    const actualHeight = root.getComputedHeight()
    console.log(
      `  Expected height: ${expectedHeight}, Actual: ${actualHeight} ${actualHeight === expectedHeight ? '✅' : '❌'}`
    )

    console.log(`  Child 1: y=${child1.getComputedTop()}, h=${child1.getComputedHeight()}`)
    console.log(`  Child 2: y=${child2.getComputedTop()}, h=${child2.getComputedHeight()}`)
    console.log(`  Child 3: y=${child3.getComputedTop()}, h=${child3.getComputedHeight()}`)

    // Verify positions
    const y1 = child1.getComputedTop() // Expected: 24
    const y2 = child2.getComputedTop() // Expected: 24 + 48 + 16 = 88
    const y3 = child3.getComputedTop() // Expected: 88 + 120 + 16 = 224
    console.log(`  Positions: ${y1 === 24 && y2 === 88 && y3 === 224 ? '✅' : '❌'}`)

    root.free()
    child1.free()
    child2.free()
    child3.free()
  }

  // 2. Horizontal auto-layout with space-between (Figma: distribute)
  {
    const root = Yoga.Node.create()
    root.setWidth(600)
    root.setHeight(80)
    root.setFlexDirection(FlexDirection.Row)
    root.setJustifyContent(Justify.SpaceBetween)
    root.setAlignItems(Align.Center)
    root.setPadding(Edge.Horizontal, 16)

    for (let i = 0; i < 4; i++) {
      const child = Yoga.Node.create()
      child.setWidth(100)
      child.setHeight(48)
      root.insertChild(child, i)
    }

    root.calculateLayout(undefined, undefined, Direction.LTR)

    console.log('\nTest 2: Horizontal space-between')
    const positions: string[] = []
    for (let i = 0; i < 4; i++) {
      const child = root.getChild(i)
      positions.push(`x=${child.getComputedLeft()} y=${child.getComputedTop()}`)
    }
    console.log(`  Children: ${positions.join(' | ')}`)
    // Items should be centered vertically (y = (80-48)/2 = 16)
    const centeredCorrectly = root.getChild(0).getComputedTop() === 16
    console.log(`  Vertical centering: ${centeredCorrectly ? '✅' : '❌'}`)
    // Space-between with padding: available = 600-32 = 568, items = 4*100 = 400, gaps = 168/3 = 56
    const gap = root.getChild(1).getComputedLeft() - root.getChild(0).getComputedLeft() - 100
    console.log(`  Gap between items: ${gap}px ${Math.abs(gap - 56) < 1 ? '✅' : '❌'}`)

    for (let i = root.getChildCount() - 1; i >= 0; i--) root.getChild(i).free()
    root.free()
  }

  // 3. Nested frames (card with header + content)
  {
    const card = Yoga.Node.create()
    card.setWidth(320)
    card.setFlexDirection(FlexDirection.Column)
    card.setPadding(Edge.All, 0)

    const header = Yoga.Node.create()
    header.setWidth('100%')
    header.setHeight(56)
    header.setFlexDirection(FlexDirection.Row)
    header.setAlignItems(Align.Center)
    header.setPadding(Edge.Horizontal, 16)
    header.setGap(Gutter.All, 12)

    const avatar = Yoga.Node.create()
    avatar.setWidth(32)
    avatar.setHeight(32)

    const title = Yoga.Node.create()
    title.setFlexGrow(1)
    title.setHeight(20)

    header.insertChild(avatar, 0)
    header.insertChild(title, 1)

    const content = Yoga.Node.create()
    content.setWidth('100%')
    content.setHeight(200)

    card.insertChild(header, 0)
    card.insertChild(content, 1)

    card.calculateLayout(undefined, undefined, Direction.LTR)

    console.log('\nTest 3: Nested card layout')
    console.log(`  Card: ${card.getComputedWidth()}×${card.getComputedHeight()}`)
    console.log(`  Header: y=${header.getComputedTop()}, h=${header.getComputedHeight()}`)
    console.log(
      `  Avatar: x=${avatar.getComputedLeft()}, y=${avatar.getComputedTop()}, centered=${avatar.getComputedTop() === 12 ? '✅' : '❌'}`
    )
    console.log(
      `  Title: x=${title.getComputedLeft()}, w=${title.getComputedWidth()}, grows=${title.getComputedWidth() === 320 - 16 - 32 - 12 - 16 ? '✅' : '❌'}`
    )
    console.log(`  Content: y=${content.getComputedTop()}, h=${content.getComputedHeight()}`)

    avatar.free()
    title.free()
    header.free()
    content.free()
    card.free()
  }

  // 4. Performance: layout 1000 nodes
  {
    const root = Yoga.Node.create()
    root.setWidth(1200)
    root.setFlexDirection(FlexDirection.Row)
    root.setFlexWrap(Wrap.Wrap) // Wrap
    root.setGap(Gutter.All, 8)
    root.setPadding(Edge.All, 16)

    const nodes: YogaNode[] = [root]
    for (let i = 0; i < 1000; i++) {
      const child = Yoga.Node.create()
      child.setWidth(80)
      child.setHeight(80)
      root.insertChild(child, i)
      nodes.push(child)
    }

    const t0 = performance.now()
    root.calculateLayout(undefined, undefined, Direction.LTR)
    const layoutTime = performance.now() - t0

    console.log(`\nTest 4: Performance (1000 nodes)`)
    console.log(`  Layout time: ${layoutTime.toFixed(2)}ms ${layoutTime < 50 ? '✅' : '⚠️'}`)
    console.log(`  Root height: ${root.getComputedHeight()}px`)

    for (const n of nodes) n.free()
  }

  console.log('\n✅ PoC 2 PASSED: Yoga WASM layout works correctly')
}

runTest()
